# Gemini Realtime API - Google AI Studio 개요 {#gemini-realtime-api-google-ai-studio}

| 기능 | 설명 | 비고 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ⌛️ | `litellm._arealtime`을 통한 실험적 액세스. |


## Proxy 사용법 {#proxy-usage}

### config에 모델 추가 {#add-model-to-config}

```yaml
model_list:
  - model_name: "gemini-2.0-flash"
    litellm_params:
      model: gemini/gemini-2.0-flash-live-001
    model_info:
      mode: realtime
```

### proxy 시작 {#start-proxy}

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:8000
```

### 테스트 {#test}

node로 이 스크립트를 실행합니다 - `node test.js`

```js
// test.js
const WebSocket = require("ws");

const url = "ws://0.0.0.0:4000/v1/realtime?model=openai-gemini-2.0-flash";

const ws = new WebSocket(url, {
    headers: {
        "api-key": `${LITELLM_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
    },
});

ws.on("open", function open() {
    console.log("Connected to server.");
    ws.send(JSON.stringify({
        type: "response.create",
        response: {
            modalities: ["text"],
            instructions: "Please assist the user.",
        }
    }));
});

ws.on("message", function incoming(message) {
    console.log(JSON.parse(message.toString()));
});

ws.on("error", function handleError(error) {
    console.error("Error: ", error);
});
```

## 제한 사항 {#limitations}

- 오디오 transcription을 지원하지 않습니다.
- tool calling을 지원하지 않습니다.

## 지원되는 OpenAI Realtime Events {#supported-openai-realtime-events}

- `session.created`
- `response.created`
- `response.output_item.added`
- `conversation.item.created`
- `response.content_part.added`
- `response.text.delta`
- `response.audio.delta`
- `response.text.done`
- `response.audio.done`
- `response.content_part.done`
- `response.output_item.done`
- `response.done`



## [지원되는 Session Params](https://github.com/BerriAI/litellm/blob/e87b536d038f77c2a2206fd7433e275c487179ee/litellm/llms/gemini/realtime/transformation.py#L155) {#supported-session-params}

## 더 보기 예제
### [오디오 입력/출력을 사용하는 Gemini Realtime API](../../../docs/tutorials/gemini_realtime_with_audio) {#gemini-realtime-api-with-audio-inputoutput}
