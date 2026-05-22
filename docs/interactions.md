import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /interactions

| Feature | Supported | 참고 |
|---------|-----------|-------|
| 로깅 | ✅ | 모든 통합에서 동작 |
| Streaming | ✅ | |
| Loadbalancing | ✅ | 지원 모델 간 동작 |
| 지원 LLM provider | **LiteLLM이 지원하는 모든 CHAT COMPLETION provider** | `openai`, `anthropic`, `bedrock`, `vertex_ai`, `gemini`, `azure`, `azure_ai` 등 |

## **LiteLLM Python SDK 사용법**

### 빠른 시작

```python showLineNumbers title="Create Interaction"
from litellm import create_interaction
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = create_interaction(
    model="gemini/gemini-2.5-flash",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

### Async 사용법

```python showLineNumbers title="Async Create Interaction"
from litellm import acreate_interaction
import os
import asyncio

os.environ["GEMINI_API_KEY"] = "your-api-key"

async def main():
    response = await acreate_interaction(
        model="gemini/gemini-2.5-flash",
        input="Tell me a short joke about programming."
    )
    print(response.outputs[-1].text)

asyncio.run(main())
```

### Streaming

```python showLineNumbers title="Streaming Interaction"
from litellm import create_interaction
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = create_interaction(
    model="gemini/gemini-2.5-flash",
    input="Write a 3 paragraph story about a robot.",
    stream=True
)

for chunk in response:
    print(chunk)
```

## **LiteLLM AI Gateway (Proxy) 사용법**

### 설정

LiteLLM proxy `config.yaml`에 다음을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-flash
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
```

LiteLLM을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 테스트 요청

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Create Interaction"
curl -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/gemini-2.5-flash",
    "input": "Tell me a short joke about programming."
  }'
```

**Streaming:**

```bash showLineNumbers title="Streaming Interaction"
curl -N -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/gemini-2.5-flash",
    "input": "Write a 3 paragraph story about a robot.",
    "stream": true
  }'
```

**Interaction 조회:**

```bash showLineNumbers title="Get Interaction by ID"
curl "http://localhost:4000/v1beta/interactions/{interaction_id}" \
  -H "Authorization: Bearer sk-1234"
```

</TabItem>

<TabItem value="google-sdk" label="Google GenAI SDK">

Google GenAI SDK가 LiteLLM Proxy를 바라보도록 설정합니다.

```python showLineNumbers title="Google GenAI SDK with LiteLLM Proxy"
from google import genai

# Point SDK to LiteLLM Proxy
client = genai.Client(
    api_key="sk-1234",  # Your LiteLLM API key
    http_options={"base_url": "http://localhost:4000"},
)

# Create an interaction
interaction = client.interactions.create(
    model="gemini/gemini-2.5-flash",
    input="Tell me a short joke about programming."
)

print(interaction.outputs[-1].text)
```

**Streaming:**

```python showLineNumbers title="Google GenAI SDK Streaming"
from google import genai

client = genai.Client(
    api_key="sk-1234",  # Your LiteLLM API key
    http_options={"base_url": "http://localhost:4000"},
)

for chunk in client.interactions.create_stream(
    model="gemini/gemini-2.5-flash",
    input="Write a story about space exploration.",
):
    print(chunk)
```

</TabItem>
</Tabs>

## **Request/응답 형식**

### 요청 파라미터

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `model` | string | 예 | 사용할 모델입니다(예: `gemini/gemini-2.5-flash`). |
| `input` | string | 예 | interaction에 전달할 입력 텍스트입니다. |
| `stream` | boolean | 아니요 | streaming 응답을 활성화합니다. |
| `tools` | array | 아니요 | 모델이 사용할 수 있는 tools입니다. |
| `system_instruction` | string | 아니요 | 모델에 전달할 system instruction입니다. |
| `generation_config` | object | 아니요 | generation 설정입니다. |
| `previous_interaction_id` | string | 아니요 | context로 사용할 이전 interaction ID입니다. |

### 응답 형식

```json
{
  "id": "interaction_abc123",
  "object": "interaction",
  "model": "gemini-2.5-flash",
  "status": "completed",
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:30:05Z",
  "role": "model",
  "outputs": [
    {
      "type": "text",
      "text": "Why do programmers prefer dark mode? Because light attracts bugs!"
    }
  ],
  "usage": {
    "total_input_tokens": 10,
    "total_output_tokens": 15,
    "total_tokens": 25
  }
}
```

## **non-Interactions API 엔드포인트 호출(`/interactions` to `/responses` Bridge) {#interactions-to-responses-bridge}**

LiteLLM은 LiteLLM의 `/responses` 엔드포인트로 연결되는 bridge를 통해 non-Interactions API 모델을 호출할 수 있게 합니다. 이는 Interactions API를 native로 지원하지 않는 OpenAI, Anthropic 및 기타 provider를 호출할 때 유용합니다.

#### Python SDK 사용법

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

# Non-streaming interaction
response = litellm.interactions.create(
    model="gpt-4o",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

#### LiteLLM Proxy 사용법

**Config 설정:**

```yaml showLineNumbers title="Example Configuration"
model_list:
- model_name: openai-model
  litellm_params:
    model: gpt-4o
    api_key: os.environ/OPENAI_API_KEY
```

**Proxy 시작:**

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**요청 보내기:**

```bash showLineNumbers title="non-Interactions API Model Request"
curl http://localhost:4000/v1beta/interactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "openai-model",
    "input": "Tell me a short joke about programming."
  }'
```

## **지원 프로바이더**

| Provider | Link to 사용법 |
|----------|---------------|
| Google AI Studio | [사용법](#quick-start) |
| 기타 모든 LiteLLM provider | Bridge 사용법 |
