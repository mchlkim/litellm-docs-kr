import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /realtime

Azure, OpenAI, xAI 등 여러 provider 사이에서 realtime 요청을 load balance할 때 사용합니다. 

지원 프로바이더:
- OpenAI
- Azure
- xAI ([전체 문서 보기](/docs/providers/xai_realtime))
- `Google AI Studio (Gemini)`
- Vertex AI
- Bedrock

## Proxy 사용법

### config에 model 추가 {#add-model-to-config}


<Tabs>
<TabItem value="openai" label="OpenAI">

```yaml
model_list:
  - model_name: openai-gpt-4o-realtime-audio
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```
</TabItem>
<TabItem value="openai+azure" label="OpenAI + Azure">

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-realtime-preview
      api_key: os.environ/AZURE_SWEDEN_API_KEY
      api_base: os.environ/AZURE_SWEDEN_API_BASE

  - model_name: openai-gpt-4o-realtime-audio
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
<TabItem value="xai" label="xAI Grok Voice Agent">

```yaml
model_list:
  - model_name: grok-voice-agent
    litellm_params:
      model: xai/grok-4-1-fast-non-reasoning
      api_key: os.environ/XAI_API_KEY
    model_info:
      mode: realtime
```

**[전체 xAI Realtime 문서 보기 →](/docs/providers/xai_realtime)**

</TabItem>
</Tabs>

### proxy 시작 {#start-proxy}

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:8000
```

### 테스트 {#test}

node로 이 script를 실행합니다: `node test.js`

```js
// test.js
const WebSocket = require("ws");

const url = "ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio";
// const url = "wss://my-azure-endpoint.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=gpt-4o-realtime-preview";
const ws = new WebSocket(url, {
    headers: {
        "api-key": `sk-1234`,
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

## 가드레일

realtime session에 [LiteLLM guardrail](https://docs.litellm.ai/docs/proxy/guardrails/quick_start)을 적용할 수 있습니다.

### key 또는 team에 guardrail 설정 {#set-guardrails-on-a-key-or-team}

가장 쉬운 production 설정은 virtual key 또는 team에 guardrail을 연결하는 것입니다. 그러면 client-side 변경 없이 항상 자동 적용됩니다.

[가상 키 → 가드레일](https://docs.litellm.ai/docs/proxy/virtual_keys#guardrails) 및 [Teams → 가드레일](https://docs.litellm.ai/docs/proxy/team_budgets)을 참고하세요.

### guardrail 동적 전달(간단한 테스트) {#pass-guardrails-dynamically-easy-testing}

WebSocket을 열 때 `guardrails`를 query param으로 전달합니다.
key/team config를 수정하지 않고 guardrail을 테스트할 때 유용합니다.

```js
// node test.js
const WebSocket = require("ws");

const guardrails = ["your-guardrail-name"]; // comma-separated list
const url = `ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio&guardrails=${guardrails.join(",")}`;

const ws = new WebSocket(url, {
    headers: {
        "Authorization": "Bearer sk-1234",
    },
});

ws.on("open", function open() {
    console.log("Connected — guardrails active:", guardrails);
});

ws.on("message", function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === "error") {
        // Guardrail block is sent as an error event before the connection closes
        console.error("Guardrail error:", data.error.message);
    }
});

ws.on("close", function close(code, reason) {
    console.log("Closed:", code, reason.toString());
    // code 1011 = blocked by guardrail at pre_call
});
```

Python으로는 다음과 같이 실행합니다.

```python
import asyncio
import websockets

async def main():
    url = "ws://0.0.0.0:4000/v1/realtime?model=openai-gpt-4o-realtime-audio&guardrails=your-guardrail-name"
    async with websockets.connect(
        url,
        additional_headers={"Authorization": "Bearer sk-1234"},
    ) as ws:
        print("Connected — guardrail active")
        async for msg in ws:
            import json
            data = json.loads(msg)
            if data["type"] == "error":
                print("Guardrail blocked:", data["error"]["message"])
                break

asyncio.run(main())
```

guardrail이 request를 차단하면 proxy는 WebSocket으로 `error` event를 보낸 뒤 connection을 닫습니다.

```json
{
    "type": "error",
    "error": {
        "type": "guardrail_error",
        "message": "Guardrail blocked this request: <reason>"
    }
}
```

## 로깅 {#logging}

request drop을 방지하기 위해 LiteLLM은 기본적으로 다음 event type만 logging합니다.

- `session.created`
- `response.create`
- `response.done`

config에서 `logged_real_time_event_types` parameter를 설정해 이를 override할 수 있습니다. 예:

```yaml
litellm_settings:
  logged_real_time_event_types: "*" # Log all events
  ## OR ## 
  logged_real_time_event_types: ["session.created", "response.create", "response.done"] # Log only these event types
```
