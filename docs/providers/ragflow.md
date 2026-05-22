import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RAGFlow

LiteLLM은 Ragflow의 chat completions APIs를 지원합니다.

## 지원 기능 {#supported-features}

- ✅ Chat completions
- ✅ Streaming 응답
- ✅ chat 및 agent endpoints 모두 지원
- ✅ 여러 credential sources(params, env vars, litellm_params)
- ✅ OpenAI 호환 API format


## API Key

```python
# env variable
os.environ['RAGFLOW_API_KEY']
```

## API Base

```python
# env variable
os.environ['RAGFLOW_API_BASE']
```

## 개요

RAGFlow는 chat 및 agent IDs를 포함하는 고유한 path 구조의 OpenAI 호환 APIs를 제공합니다.

- **Chat endpoint**: `/api/v1/chats_openai/{chat_id}/chat/completions`
- **Agent endpoint**: `/api/v1/agents_openai/{agent_id}/chat/completions`

model name format에는 endpoint type과 ID가 포함됩니다.
- Chat: `ragflow/chat/{chat_id}/{model_name}`
- Agent: `ragflow/agent/{agent_id}/{model_name}`


## Sample 사용법 - Chat Endpoint

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"  # or your hosted URL

response = completion(
    model="ragflow/chat/my-chat-id/gpt-4o-mini",
    messages=[{"role": "user", "content": "How does the deep doc understanding work?"}]
)
print(response)
```

## Sample 사용법 - Agent Endpoint

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"  # or your hosted URL

response = completion(
    model="ragflow/agent/my-agent-id/gpt-4o-mini",
    messages=[{"role": "user", "content": "What are the key features?"}]
)
print(response)
```

## Sample 사용법 - With Parameters

`api_key`와 `api_base`를 parameters로 직접 전달할 수도 있습니다.

```python
from litellm import completion

response = completion(
    model="ragflow/chat/my-chat-id/gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="your-ragflow-api-key",
    api_base="http://localhost:9380"
)
print(response)
```

## Sample 사용법 - Streaming

```python
from litellm import completion
import os

os.environ['RAGFLOW_API_KEY'] = "your-ragflow-api-key"
os.environ['RAGFLOW_API_BASE'] = "http://localhost:9380"

response = completion(
    model="ragflow/agent/my-agent-id/gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain RAGFlow"}],
    stream=True
)

for chunk in response:
    print(chunk)
```

## Model Name Format {#model-name-format}

model name은 다음 format 중 하나를 따라야 합니다.

### Chat Endpoint
```
ragflow/chat/{chat_id}/{model_name}
```

예제: `ragflow/chat/my-chat-id/gpt-4o-mini`

### Agent Endpoint
```
ragflow/agent/{agent_id}/{model_name}
```

예제: `ragflow/agent/my-agent-id/gpt-4o-mini`

위 값의 의미:
- `{chat_id}` 또는 `{agent_id}`는 RAGFlow의 chat 또는 agent ID입니다.
- `{model_name}`은 실제 model name입니다(예: `gpt-4o-mini`, `gpt-4o` 등).

## 설정 Sources

LiteLLM은 credentials를 제공하는 여러 방식을 지원하며, 다음 순서로 확인합니다.

1. **함수 parameters**: `api_key="..."`, `api_base="..."`
2. **litellm_params**: `litellm_params={"api_key": "...", "api_base": "..."}`
3. **환경 변수**: `RAGFLOW_API_KEY`, `RAGFLOW_API_BASE`
4. **전역 litellm 설정**: `litellm.api_key`, `litellm.api_base`

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 key 저장 {#save-key-in-your-environment}

```bash
export RAGFLOW_API_KEY="your-ragflow-api-key"
export RAGFLOW_API_BASE="http://localhost:9380"
```

### 2. 프록시 시작

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: ragflow-chat-gpt4
    litellm_params:
      model: ragflow/chat/my-chat-id/gpt-4o-mini
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE
  - model_name: ragflow-agent-gpt4
    litellm_params:
      model: ragflow/agent/my-agent-id/gpt-4o-mini
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE
```

</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --config /path/to/config.yaml

# Server running on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

### 3. 테스트 {#test-it}

<Tabs>
<TabItem value="Curl" label="Curl Request">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "ragflow-chat-gpt4",
    "messages": [
      {"role": "user", "content": "How does RAGFlow work?"}
    ]
  }'
```

</TabItem>
<TabItem value="Python" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="ragflow-chat-gpt4",
    messages=[
        {"role": "user", "content": "How does RAGFlow work?"}
    ]
)
print(response)
```

</TabItem>
</Tabs>

## API Base URL 처리 {#api-base-url-handling}

`api_base` parameter는 `/v1` suffix 유무와 관계없이 제공할 수 있습니다. LiteLLM이 자동으로 처리합니다.

- `http://localhost:9380` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`
- `http://localhost:9380/v1` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`
- `http://localhost:9380/api/v1` → `http://localhost:9380/api/v1/chats_openai/{chat_id}/chat/completions`

세 format 모두 정상 동작합니다.

## 오류 처리 {#error-handling}

오류가 발생하면 다음을 확인하세요.

1. **잘못된 model format**: model name이 `ragflow/{chat|agent}/{id}/{model_name}` format을 따르는지 확인하세요.
2. **api_base 누락**: parameter, environment variable 또는 litellm_params로 `api_base`를 제공하세요.
3. **Connection errors**: RAGFlow server가 실행 중이고 제공한 `api_base`에서 접근 가능한지 확인하세요.

:::info

provider-specific parameters 전달에 대한 자세한 내용은 [여기](../completion/provider_specific_params.md)를 참고하세요.

:::
