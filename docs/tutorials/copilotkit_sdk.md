import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM과 함께 CopilotKit SDK 사용 {#copilotkit-sdk-with-litellm}

LiteLLM Proxy를 통해 어떤 LLM provider와도 CopilotKit SDK를 사용할 수 있습니다.

> **참고:** LiteLLM Proxy와 CopilotKit SDK 통합은 LiteLLM v1.81.7-nightly 이상에서 동작합니다.


## 빠른 시작

### 1. Config에 Model 추가 {#add-model-to-config}

```yaml title="config.yaml"
model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: "anthropic/claude-sonnet-4-5-20250514-v1:0"
      api_key: "os.environ/ANTHROPIC_API_KEY"
```

### 2. LiteLLM Proxy 시작 {#start-litellm-proxy}

```bash
litellm --config config.yaml
```

### 3. CopilotKit SDK 사용 {#use-copilotkit-sdk}

```typescript
import OpenAI from "openai";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const model = "claude-sonnet-4-5";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-12345",
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:4000/v1",
});

const serviceAdapter = new OpenAIAdapter({ openai, model });
const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
```

### 4. 테스트 {#test}

```bash
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{
    "method": "agent/run",
    "params": {
        "agentId": "default"
    },
        "runId": "your_run_id",
        "threadId": "your_thread_id",
        "runId": ""your_run_id"",
        "tools": [],
        "context": [],
        "forwardedProps": {},
        "state": {},
        "messages": [
            {
                "id": "166e573e-f7c6-4c0f-8685-04dbefec18be",
                "content": "Hi",
                "role": "user"
            }
        ]
    }
}'
```

## 환경 변수 {#environment-variables}

| Variable | Value | 설명 |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-12345` | LiteLLM API key |
| `OPENAI_BASE_URL` | `http://localhost:4000/v1` | LiteLLM proxy URL |


## 관련 자료 {#related-resources}

- [CopilotKit 문서](https://docs.copilotkit.ai)
- [LiteLLM Proxy 빠른 시작](../proxy/quick_start)
