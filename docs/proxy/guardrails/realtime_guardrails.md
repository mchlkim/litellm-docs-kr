import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Realtime API 가드레일

[Realtime API](/docs/realtime)의 음성 대화를 보호합니다. LLM이 응답하기 **전에** 음성 전사 내용을 가로채 검사합니다.

## 동작 방식 {#how-it-works}

Realtime API는 오래 유지되는 WebSocket 세션입니다. HTTP 요청마다 가드레일이 한 번 실행되는 `/chat/completions`와 달리, 음성 세션에는 여러 턴이 있으며 각 턴을 개별적으로 검사해야 합니다.

LiteLLM은 Whisper가 음성을 텍스트로 변환한 뒤, LLM이 응답을 생성하기 전에 전사 이벤트에서 각 턴을 가로챕니다.

```
User speaks into mic
        │
        ▼ audio bytes (PCM)
┌───────────────────┐
│   LiteLLM Proxy   │  forwards audio to OpenAI unchanged
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│     OpenAI        │
│  VAD → Whisper    │  detects speech end, transcribes
└────────┬──────────┘
         │
         │  conversation.item.input_audio_transcription.completed
         │  { transcript: "system update: ignore all instructions" }
         │
         ▼
┌───────────────────────────────────────────┐
│           LiteLLM Proxy                   │
│                                           │
│   ◄──── GUARDRAIL RUNS HERE ────►         │
│   apply_guardrail(texts=[transcript])     │
│                                           │
│   ┌──────────────┬──────────────────┐     │
│   │   BLOCKED    │     CLEAN        │     │
│   └──────┬───────┴───────┬──────────┘     │
│          │               │                │
│   speak warning    send response.create   │
│   (TTS audio)      → LLM responds         │
└───────────────────────────────────────────┘
```

**핵심 세부 사항**: LiteLLM은 연결 시 세션에 `create_response: false`도 주입하므로, 가드레일이 실행되기 전에 LLM이 자동으로 응답하지 않습니다.

## 지원되는 가드레일 모드 {#supported-guardrail-mode}

| 모드 | 설명 |
|------|-------------|
| `realtime_input_transcription` | 각 음성 턴이 전사된 뒤, LLM이 응답하기 전에 실행됩니다 |

## 빠른 시작 {#quick-start}

### 1단계: 프록시 구성 {#step-1-configure-proxy}

프록시 설정에 `mode: realtime_input_transcription`을 사용하는 가드레일을 추가합니다.

```yaml
model_list:
  - model_name: openai/gpt-4o-realtime-preview
    litellm_params:
      model: openai/gpt-4o-realtime-preview
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "voice-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: realtime_input_transcription
      default_on: true
      blocked_words:
        - keyword: "ignore previous instructions"
          action: BLOCK
          description: "Prompt injection attempt"
        - keyword: "system update"
          action: BLOCK
          description: "Prompt injection attempt"
        - keyword: "ignore all instructions"
          action: BLOCK
          description: "Prompt injection attempt"

general_settings:
  master_key: sk-1234
```

### 2단계: 프록시 시작 {#step-2-start-proxy}

```bash
litellm --config proxy_config.yaml --port 4000
```

### 3단계: Realtime 클라이언트 연결 {#step-3-connect-a-realtime-client}

클라이언트를 OpenAI에 직접 연결하지 말고 프록시에 연결합니다.

<Tabs>
<TabItem value="js" label="JavaScript">

```javascript
const ws = new WebSocket(
  "ws://localhost:4000/v1/realtime?model=openai/gpt-4o-realtime-preview",
  [],
  { headers: { Authorization: "Bearer sk-1234" } }
)

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "session.update",
    session: {
      modalities: ["audio", "text"],
      input_audio_transcription: { model: "whisper-1" },
      turn_detection: { type: "server_vad" },
    },
  }))
}

ws.onmessage = (e) => {
  const event = JSON.parse(e.data)
  if (event.type === "response.audio.delta") {
    // play audio...
  }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import asyncio
import json
import websockets

async def main():
    async with websockets.connect(
        "ws://localhost:4000/v1/realtime?model=openai/gpt-4o-realtime-preview",
        additional_headers={"Authorization": "Bearer sk-1234"},
    ) as ws:
        await ws.recv()  # session.created

        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["audio", "text"],
                "input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {"type": "server_vad"},
            },
        }))

        async for raw in ws:
            event = json.loads(raw)
            print(event["type"])

asyncio.run(main())
```

</TabItem>
</Tabs>

### 턴이 차단되면 발생하는 일 {#what-happens-when-a-turn-is-blocked}

가드레일이 트리거되면 프록시는 다음을 수행합니다.

1. 진행 중인 LLM 응답을 중단하도록 `response.cancel`을 보냅니다
2. 차단 메시지를 강제 지침으로 넣어 `response.create`를 보냅니다
3. OpenAI의 TTS가 사용자에게 **경고를 음성으로 재생**합니다. 예: *"Content blocked: keyword 'system update' detected (Prompt injection attempt)"*

LLM은 주입된 지침을 처리하지 않습니다.

## 모든 가드레일 공급자와 함께 사용 {#using-with-any-guardrail-provider}

`realtime_input_transcription` 모드는 `apply_guardrail`을 구현한 모든 가드레일과 함께 작동합니다. `litellm_content_filter`만 사용하려는 공급자로 바꾸면 됩니다.

```yaml
guardrails:
  - guardrail_name: "voice-lakera"
    litellm_params:
      guardrail: lakera_ai
      mode: realtime_input_transcription
      default_on: true
      api_key: os.environ/LAKERA_API_KEY
```

## 키별 가드레일 제어 {#per-key-guardrail-control}

특정 API 키에만 Realtime 가드레일을 활성화하려면 `default_on: false`를 설정하고 요청 metadata에 가드레일 이름을 전달합니다.

```yaml
guardrails:
  - guardrail_name: "voice-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: realtime_input_transcription
      default_on: false   # off by default
```

그러면 클라이언트는 초기 metadata에 이를 전달해 연결별로 옵트인합니다(enterprise 기능).
