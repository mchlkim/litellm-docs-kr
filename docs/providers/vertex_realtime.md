# `Vertex AI Gemini Live - Realtime API`

OpenAI Realtime 프로토콜을 사용하는 LiteLLM의 통합 `/realtime` 엔드포인트를 통해 Vertex AI의 Gemini Live API(`BidiGenerateContent`)를 사용할 수 있습니다.

| 기능 | 지원 여부 |
|---------|-----------|
| Proxy (`/realtime`) | ✅ |
| 음성 입력 / 음성 출력 | ✅ |
| 텍스트 입력 / 텍스트 출력 | ✅ |
| Server VAD | ✅ |
| 출력 전사 | ✅ |

## 설정

### 1. 인증

LiteLLM은 API 키가 아니라 Google Cloud 자격 증명(OAuth2 Bearer token)을 사용합니다.

```bash
gcloud auth application-default login
```

또는 서비스 계정 키 파일을 설정합니다.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
```

### 2. 프록시 설정

```yaml
model_list:
  - model_name: vertex-gemini-live
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-live-001
      vertex_project: your-gcp-project-id
      vertex_location: us-east4   # or any supported region, or "global"

general_settings:
  master_key: sk-your-key
```

### 3. 프록시 시작

```bash
litellm --config config.yaml --port 4000
```

## 사용법

### Python (`websockets`)

```python
import asyncio
import json
import websockets

PROXY_URL = "ws://localhost:4000/realtime?model=vertex-gemini-live"
API_KEY = "sk-your-key"

async def main():
    async with websockets.connect(
        PROXY_URL,
        additional_headers={"api-key": API_KEY},
    ) as ws:
        # Wait for session.created
        event = json.loads(await ws.recv())
        print(f"session.created: {event['session']['id']}")

        # Send a text message
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Say hello in one sentence."}],
            },
        }))

        # Collect the response
        async for raw in ws:
            ev = json.loads(raw)
            t = ev.get("type", "")
            if t == "response.text.delta":
                print(ev.get("delta", ""), end="", flush=True)
            elif t == "response.done":
                print("\n[done]")
                break

asyncio.run(main())
```

### Node.js

```js
const WebSocket = require("ws");

const ws = new WebSocket(
  "ws://localhost:4000/realtime?model=vertex-gemini-live",
  { headers: { "api-key": "sk-your-key" } }
);

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "Say hello." }],
    },
  }));
});

ws.on("message", (data) => {
  const ev = JSON.parse(data);
  if (ev.type === "response.text.delta") process.stdout.write(ev.delta);
  if (ev.type === "response.done") ws.close();
});
```

### `OpenAI SDK` (Python) {#openai-sdk-python}

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="http://localhost:4000",
    api_key="sk-your-key",
)

async def main():
    async with client.beta.realtime.connect(
        model="vertex-gemini-live"
    ) as conn:
        await conn.session.update(session={"modalities": ["text"]})

        await conn.conversation.item.create(
            item={
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Say hello."}],
            }
        )

        async for event in conn:
            if event.type == "response.text.delta":
                print(event.delta, end="", flush=True)
            elif event.type == "response.done":
                print()
                break

asyncio.run(main())
```

## 음성 입력 / 음성 출력

전체 음성 예제는 [`voice_realtime_test.py`](https://github.com/BerriAI/litellm/blob/main/voice_realtime_test.py)를 참고하세요.

오디오의 핵심 설정은 다음과 같습니다.
- 마이크 입력: **16 kHz** PCM16(`audio/pcm;rate=16000`)
- 스피커 출력: **24 kHz** PCM16(Vertex AI는 24 kHz 오디오를 반환)
- Server VAD는 기본적으로 활성화되며 무음 임계값은 800ms입니다.

```python
# session.update with server VAD — the proxy ignores this for Vertex AI
# because VAD is already configured in the initial setup message.
await ws.send(json.dumps({
    "type": "session.update",
    "session": {
        "modalities": ["audio"],
        "turn_detection": {"type": "server_vad", "silence_duration_ms": 800},
    },
}))
```

## 지원되는 OpenAI Realtime 이벤트

**Client → Proxy (→ Vertex AI)**

| OpenAI 이벤트 | 참고 |
|---|---|
| `input_audio_buffer.append` | `realtime_input.audio`로 전달됩니다. |
| `conversation.item.create` | `realtime_input.text`로 전달됩니다. |
| `session.update` | 조용히 무시됩니다. Vertex AI는 세션 중간 재구성을 지원하지 않습니다. |
| `response.create` | 조용히 무시됩니다. Vertex AI는 각 턴 이후 자동으로 응답합니다. |

**Vertex AI → Proxy (→ Client)**

| 발생하는 OpenAI 이벤트 | Vertex AI 소스 |
|---|---|
| `session.created` | `setupComplete` 이후 생성됩니다. |
| `response.text.delta` | `serverContent.modelTurn.parts[].text` |
| `response.audio.delta` | `serverContent.modelTurn.parts[].inlineData` |
| `response.audio_transcript.delta` | `serverContent.outputTranscription.text` |
| `conversation.item.input_audio_transcription.completed` | `serverContent.inputTranscription.text` |
| `response.done` | `serverContent.turnComplete` |

## 제한 사항

- `session.update`는 전달되지 않습니다(Vertex AI는 연결당 하나의 설정 메시지만 허용).
- 도구 호출 / 함수 호출은 아직 지원되지 않습니다.
- 오디오 전사를 사용하려면 초기 설정에 `outputAudioTranscription: {}`가 설정되어야 합니다(LiteLLM이 자동으로 처리).
