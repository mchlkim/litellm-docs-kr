import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Responses API 사용하기 {#azure-responses-api}

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure OpenAI Responses API |
| LiteLLM의 `custom_llm_provider` | `azure/` |
| 지원 작업 | `/v1/responses`|
| Azure OpenAI Responses API | [Azure OpenAI Responses API ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/responses?tabs=python-secure) |
| 비용 추적 및 로깅 지원 | ✅ LiteLLM은 Responses API 요청을 로깅하고 비용을 추적합니다 |
| 지원되는 OpenAI 파라미터 | ✅ 모든 OpenAI 파라미터를 지원합니다. [여기 참조](https://github.com/BerriAI/litellm/blob/0717369ae6969882d149933da48eeb8ab0e691bd/litellm/llms/openai/responses/transformation.py#L23) |

## 사용법

## 모델 응답 생성 {#create-a-model-response}

<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

#### Non-streaming

```python showLineNumbers title="Azure Responses API"
import litellm

# Non-streaming response
response = litellm.responses(
    model="azure/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com/",
    api_version="2023-03-15-preview",
)

print(response)
```

#### Streaming
```python showLineNumbers title="Azure Responses API"
import litellm

# Streaming response
response = litellm.responses(
    model="azure/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com/",
    api_version="2023-03-15-preview",
)

for event in response:
    print(event)
```

</TabItem>
<TabItem value="proxy" label="OpenAI SDK with LiteLLM Proxy">

먼저 LiteLLM 프록시 `config.yaml`에 다음을 추가합니다.
```yaml showLineNumbers title="Azure Responses API"
model_list:
  - model_name: o1-pro
    litellm_params:
      model: azure/o1-pro
      api_key: os.environ/AZURE_RESPONSES_OPENAI_API_KEY
      api_base: https://litellm8397336933.openai.azure.com/
      api_version: 2023-03-15-preview
```

LiteLLM 프록시를 시작합니다.
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

그런 다음 프록시를 가리키도록 OpenAI SDK를 사용합니다.

#### Non-streaming
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### Streaming
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

## Azure Codex 모델

Codex 모델은 Azure의 새로운 [/v1/preview API](https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-lifecycle?tabs=key#next-generation-api)를 사용합니다. 이 API는 매월 `api-version`을 업데이트하지 않아도 최신 기능에 계속 접근할 수 있게 해줍니다.

**`api_version="preview"`를 설정하면 LiteLLM은 요청을 `/v1/preview` 엔드포인트로 보냅니다.**

<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

#### Non-streaming

```python showLineNumbers title="Azure Codex Models"
import litellm

# Non-streaming response with Codex models
response = litellm.responses(
    model="azure/codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com",
    api_version="preview", # 👈 key difference
)

print(response)
```

#### Streaming
```python showLineNumbers title="Azure Codex Models"
import litellm

# Streaming response with Codex models
response = litellm.responses(
    model="azure/codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True,
    api_key=os.getenv("AZURE_RESPONSES_OPENAI_API_KEY"),
    api_base="https://litellm8397336933.openai.azure.com",
    api_version="preview", # 👈 key difference
)

for event in response:
    print(event)
```

</TabItem>
<TabItem value="proxy" label="OpenAI SDK with LiteLLM Proxy">

먼저 LiteLLM 프록시 `config.yaml`에 다음을 추가합니다.
```yaml showLineNumbers title="Azure Codex Models"
model_list:
  - model_name: codex-mini
    litellm_params:
      model: azure/codex-mini
      api_key: os.environ/AZURE_RESPONSES_OPENAI_API_KEY
      api_base: https://litellm8397336933.openai.azure.com
      api_version: preview # 👈 key difference
```

LiteLLM 프록시를 시작합니다.
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

그런 다음 프록시를 가리키도록 OpenAI SDK를 사용합니다.

#### Non-streaming
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### Streaming
```python showLineNumbers
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="codex-mini",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>


## `/chat/completions`를 통한 호출 {#calling-via-chatcompletions}

`/chat/completions` 엔드포인트를 통해서도 Azure Responses API를 호출할 수 있습니다.


<Tabs>
<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers
from litellm import completion
import os 

os.environ["AZURE_API_BASE"] = "https://my-azure-endpoint.openai.azure.com/"
os.environ["AZURE_API_VERSION"] = "2023-03-15-preview"
os.environ["AZURE_API_KEY"] = "my-api-key"

response = completion(
    model="azure/responses/my-custom-o1-pro",
    messages=[{"role": "user", "content": "Hello world"}],
)

print(response)
```
</TabItem>
<TabItem value="proxy" label="OpenAI SDK with LiteLLM Proxy">

1. `config.yaml` 설정

```yaml showLineNumbers
model_list:
  - model_name: my-custom-o1-pro
    litellm_params:
      model: azure/responses/my-custom-o1-pro
      api_key: os.environ/AZURE_API_KEY
      api_base: https://my-azure-endpoint.openai.azure.com/
      api_version: 2023-03-15-preview
```

2. LiteLLM 프록시 시작
```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl http://localhost:4000/v1/chat/completions \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "my-custom-o1-pro",
    "messages": [{"role": "user", "content": "Hello world"}]
  }'
```
</TabItem>
</Tabs>
