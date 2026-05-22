import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure Anthropic (Azure Foundry를 통한 Claude)

LiteLLM은 Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.1을 포함하여 Microsoft Azure Foundry를 통해 배포된 Claude 모델을 지원합니다.

## 사용 가능한 모델

Azure Foundry는 다음 Claude 모델을 지원합니다.

- `claude-sonnet-4-5` - 실제 에이전트를 구축하고 복잡한 장기 작업을 처리하는 데 적합한 Anthropic의 가장 강력한 모델
- `claude-haiku-4-5` - 대량 사용 사례에 적합한 속도와 비용으로 최전선에 가까운 성능 제공
- `claude-opus-4-1` - 코딩 분야의 업계 선도 모델로, 장시간 실행되는 작업에서 지속적인 성능 제공

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Microsoft Azure Foundry를 통해 배포된 Claude 모델입니다. Anthropic의 Messages API와 동일한 API를 사용하지만 Azure 인증을 사용합니다. |
| LiteLLM의 공급자 라우트 | `azure_ai/` (Claude 모델 이름에 이 접두사를 추가합니다. 예: `azure_ai/claude-sonnet-4-5`) |
| 공급자 문서 | [Azure Foundry Claude 모델 ↗](https://learn.microsoft.com/en-us/azure/ai-services/foundry-models/claude) |
| API Endpoint | `https://<resource-name>.services.ai.azure.com/anthropic/v1/messages` |
| 지원 엔드포인트 | `/chat/completions`, `/anthropic/v1/messages`|

## 주요 기능

- **Extended thinking**: 복잡한 작업을 위한 향상된 추론 기능
- **이미지 및 텍스트 입력**: 차트, 그래프, 기술 다이어그램, 보고서를 분석하는 강력한 비전 기능
- **Code generation**: 코드 생성, 분석, 디버깅을 위한 고급 사고 기능(Claude Sonnet 4.5 및 Claude Opus 4.1)
- **Anthropic과 동일한 API**: 모든 요청/응답 변환이 기본 Anthropic 공급자와 동일함

## 인증

Azure Anthropic은 두 가지 인증 방법을 지원합니다.

1. **API Key**: `api-key` 헤더 사용
2. **Azure AD Token**: `Authorization: Bearer <token>` 헤더 사용(Microsoft Entra ID)

## API 키 및 설정

```python
import os

# Option 1: API Key authentication
os.environ["AZURE_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Option 2: Azure AD Token authentication
os.environ["AZURE_AD_TOKEN"] = "your-azure-ad-token"
os.environ["AZURE_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Optional: Azure AD Token Provider (for automatic token refresh)
os.environ["AZURE_TENANT_ID"] = "your-tenant-id"
os.environ["AZURE_CLIENT_ID"] = "your-client-id"
os.environ["AZURE_CLIENT_SECRET"] = "your-client-secret"
os.environ["AZURE_SCOPE"] = "https://cognitiveservices.azure.com/.default"
```

## 사용법 - LiteLLM Python SDK

### 기본 Completion

```python
from litellm import completion

# Set environment variables
os.environ["AZURE_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"

# Make a completion request
response = completion(
    model="azure_ai/claude-sonnet-4-5",
    messages=[
        {"role": "user", "content": "What are 3 things to visit in Seattle?"}
    ],
    max_tokens=1000,
    temperature=0.7,
)

print(response)
```

### API Key 파라미터로 Completion 사용

```python
import litellm

response = litellm.completion(
    model="azure_ai/claude-sonnet-4-5",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000,
)
```

### Azure AD Token으로 Completion 사용

```python
import litellm

response = litellm.completion(
    model="azure_ai/claude-sonnet-4-5",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    azure_ad_token="your-azure-ad-token",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000,
)
```

### 스트리밍

```python
from litellm import completion

response = completion(
    model="azure_ai/claude-sonnet-4-5",
    messages=[
        {"role": "user", "content": "Write a short story"}
    ],
    stream=True,
    max_tokens=1000,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 도구 호출

```python
from litellm import completion

response = completion(
    model="azure_ai/claude-sonnet-4-5",
    messages=[
        {"role": "user", "content": "What's the weather in Seattle?"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ],
    tool_choice="auto",
    max_tokens=1000,
)

print(response)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 키 저장

```bash
export AZURE_API_KEY="your-azure-api-key"
export AZURE_API_BASE="https://<resource-name>.services.ai.azure.com/anthropic"
```

### 2. 프록시 설정

```yaml
model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: azure_ai/claude-sonnet-4-5
      api_base: https://<resource-name>.services.ai.azure.com/anthropic
      api_key: os.environ/AZURE_API_KEY
```

### 3. 테스트

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "claude-sonnet-4-5",
    "messages": [
        {
            "role": "user",
            "content": "Hello!"
        }
    ],
    "max_tokens": 1000
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1000
)

print(response)
```

</TabItem>
</Tabs>

## Messages API

Azure Anthropic은 네이티브 Anthropic Messages API도 지원합니다. 엔드포인트 구조는 Anthropic의 `/v1/messages` API와 동일합니다.

### Anthropic SDK 사용

```python
from anthropic import Anthropic

client = Anthropic(
    api_key="your-azure-api-key",
    base_url="https://<resource-name>.services.ai.azure.com/anthropic"
)

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "Hello, world"}
    ]
)

print(response)
```

### LiteLLM Proxy 사용

```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
}'
```

## 지원되는 OpenAI 파라미터

Azure Anthropic은 기본 Anthropic 공급자와 동일한 파라미터를 지원합니다.

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"max_completion_tokens",
"tools",
"tool_choice",
"extra_headers",
"parallel_tool_calls",
"response_format",
"user",
"thinking",
"reasoning_effort"
```

:::info

Azure Anthropic API는 `max_tokens` 전달을 요구합니다. `max_tokens`가 제공되지 않으면 LiteLLM은 자동으로 `max_tokens=4096`을 전달합니다.

:::

## 표준 Anthropic 공급자와의 차이점

Azure Anthropic과 표준 Anthropic 공급자의 유일한 차이는 인증입니다.

- **Standard Anthropic**: `x-api-key` 헤더 사용
- **Azure Anthropic**: Azure AD 인증에 `api-key` 헤더 또는 `Authorization: Bearer <token>` 사용

그 외 모든 요청/응답 변환, 도구 호출, 스트리밍, 기능 지원은 동일합니다.

## API Base URL 형식

API Base URL은 다음 형식을 따라야 합니다.

```
https://<resource-name>.services.ai.azure.com/anthropic
```

URL에 `/v1/messages`가 아직 없으면 LiteLLM이 자동으로 추가합니다.

## 예제: 전체 설정

```python
import os
from litellm import completion

# Configure Azure Anthropic
os.environ["AZURE_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_API_BASE"] = "https://my-resource.services.ai.azure.com/anthropic"

# Make a request
response = completion(
    model="azure_ai/claude-sonnet-4-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    max_tokens=1000,
    temperature=0.7,
    stream=False,
)

print(response.choices[0].message.content)
```

## 문제 해결

### API Base 누락 오류

API Base가 누락되었다는 오류가 표시되면 다음이 설정되어 있는지 확인하세요.

```python
os.environ["AZURE_API_BASE"] = "https://<resource-name>.services.ai.azure.com/anthropic"
```

또는 직접 전달하세요.

```python
response = completion(
    model="azure_ai/claude-sonnet-4-5",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    # ...
)
```

### 인증 오류

- **API Key**: `AZURE_API_KEY`가 설정되어 있거나 `api_key` 파라미터로 전달되는지 확인하세요
- **Azure AD Token**: `AZURE_AD_TOKEN`이 설정되어 있거나 `azure_ad_token` 파라미터로 전달되는지 확인하세요
- **Token Provider**: 자동 토큰 갱신을 위해 `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`을 설정하세요

## 관련 문서

- [Anthropic 공급자 문서](../anthropic.md) - 표준 Anthropic API 사용법
- [Azure OpenAI 문서](./azure.md) - Azure OpenAI 모델
- [Azure 인증 가이드](../../secret_managers/azure_key_vault.md) - Azure AD 토큰 설정
