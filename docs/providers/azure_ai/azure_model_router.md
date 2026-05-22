# Azure Model Router

Azure Model Router는 요구사항에 따라 요청을 가장 적합한 사용 가능 모델로 자동 라우팅하는 Azure AI Foundry 기능입니다. 단일 endpoint를 사용하면서 각 요청에 맞는 최적 모델을 지능적으로 선택할 수 있습니다.

## 빠른 시작

**모델 패턴**: `azure_ai/model_router/<deployment-name>`

```python
import litellm

response = litellm.completion(
    model="azure_ai/model_router/model-router",  # Replace with your deployment name
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key="your-api-key",
)
```

**Proxy 설정**(`config.yaml`):

```yaml
model_list:
  - model_name: model-router
    litellm_params:
      model: azure_ai/model_router/model-router
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/deployments/model-router/chat/completions?api-version=2025-01-01-preview
      api_key: your-api-key
```

## 주요 기능

- **자동 모델 선택**: Azure Model Router가 요청에 가장 적합한 모델을 동적으로 선택합니다.
- **비용 추적**: LiteLLM은 실제 사용된 모델(예: `gpt-4.1-nano`) 기준 비용과 Model Router 인프라 요금을 자동으로 추적합니다.
- **Streaming 지원**: streaming 응답을 완전히 지원하며 비용도 정확히 계산합니다.
- **간단한 설정**: UI 또는 config 파일로 쉽게 설정할 수 있습니다.

## 모델 이름 패턴

다음 패턴을 사용합니다. `azure_ai/model_router/<deployment-name>`

**구성 요소:**
- `azure_ai` - provider 식별자
- `model_router` - Model Router 배포임을 나타냅니다.
- `<deployment-name>` - Azure AI Foundry의 실제 deployment 이름(예: `azure-model-router`)

**예제:** `azure_ai/model_router/azure-model-router`

**동작 방식:**
- LiteLLM은 Azure로 요청을 보낼 때 `model_router/` prefix를 자동으로 제거합니다.
- Azure API에는 deployment 이름(예: `azure-model-router`)만 전송됩니다.
- 정확한 비용 추적을 위해 응답과 로그에는 전체 경로가 보존됩니다.

## LiteLLM Python SDK

### Basic 사용법

`<deployment-name>`에 Azure deployment 이름을 넣어 `azure_ai/model_router/<deployment-name>` 패턴을 사용합니다.

```python
import litellm
import os

response = litellm.completion(
    model="azure_ai/model_router/azure-model-router",  # Use your deployment name
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key=os.getenv("AZURE_MODEL_ROUTER_API_KEY"),
)

print(response)
```

**패턴 설명:**
- `azure_ai` - provider
- `model_router` - model router 배포임을 나타냅니다.
- `azure-model-router` - Azure AI Foundry의 실제 deployment 이름

LiteLLM은 Azure로 요청을 보낼 때 `model_router/` prefix를 자동으로 제거하므로, API에는 `azure-model-router`만 전송됩니다.

### 사용량 추적이 포함된 Streaming

```python
import litellm
import os

response = await litellm.acompletion(
    model="azure_ai/model_router/azure-model-router",  # Use your deployment name
    messages=[{"role": "user", "content": "hi"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key=os.getenv("AZURE_MODEL_ROUTER_API_KEY"),
    stream=True,
    stream_options={"include_usage": True},
)

async for chunk in response:
    print(chunk)
```

## `LiteLLM Proxy`(`AI Gateway`)

### config.yaml

```yaml
model_list:
  - model_name: azure-model-router  # Public name for your users
    litellm_params:
      model: azure_ai/model_router/azure-model-router  # Use your deployment name
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/v1/
      api_key: os.environ/AZURE_MODEL_ROUTER_API_KEY
```

**Note:** Replace `azure-model-router` in the model path with your actual deployment name from Azure AI Foundry.

### Proxy 시작

```bash
litellm --config config.yaml
```

### 테스트 요청

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "azure-model-router",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## LiteLLM UI에서 Azure Model Router 추가하기

이 walkthrough는 Admin Dashboard를 사용해 LiteLLM에 Azure Model Router endpoint를 추가하는 방법을 설명합니다.

### 빠른 시작

1. LiteLLM UI의 **모델** 페이지로 이동합니다.
2. provider로 **"Azure AI Foundry(Studio)"**를 선택합니다.
3. deployment 이름(예: `azure-model-router`)을 입력합니다.
4. LiteLLM이 이를 `azure_ai/model_router/azure-model-router` 형식으로 자동 변환합니다.
5. API base URL과 API key를 추가합니다.
6. 테스트한 뒤 저장합니다.

### 상세 Walkthrough

#### Step 1: Provider 선택

모델 페이지로 이동해 provider로 "Azure AI Foundry(Studio)"를 선택합니다.

##### 모델 페이지로 이동

![Navigate to 모델](./img/azure_model_router_01.jpeg)

##### Provider dropdown 클릭

![Click Provider](./img/azure_model_router_02.jpeg)

##### Azure AI Foundry 선택

![Azure AI Foundry 선택](./img/azure_model_router_03.jpeg)

#### 2단계: Deployment 이름 입력하기

**새로운 간소화 방식:** 텍스트 필드에 deployment 이름을 직접 입력하면 됩니다. deployment 이름에 "model-router" 또는 "model_router"가 포함되어 있으면 LiteLLM이 자동으로 `azure_ai/model_router/<deployment-name>` 형식으로 변환합니다.

**예제:**
- Enter: `azure-model-router`
- LiteLLM creates: `azure_ai/model_router/azure-model-router`

##### Azure Portal에서 Deployment 이름 복사

Azure AI Foundry로 전환한 뒤 model router 배포 이름을 복사합니다.

![Azure Portal 모델 이름](./img/azure_model_router_09.jpeg)

![Copy Model Name](./img/azure_model_router_10.jpeg)

##### LiteLLM에 Deployment 이름 입력

deployment 이름(예: `azure-model-router`)을 텍스트 필드에 직접 붙여넣습니다.

![Deployment 이름 입력](./img/azure_model_router_04.jpeg)

**내부 동작:**
- 입력값: `azure-model-router`
- LiteLLM이 model router 배포임을 자동으로 감지합니다.
- 전체 model path는 `azure_ai/model_router/azure-model-router`가 됩니다.
- API 호출 시 Azure에는 `azure-model-router`만 전송됩니다.

#### Step 3: API Base와 Key 설정

Azure portal에서 endpoint URL과 API key를 복사합니다.

##### Azure에서 API Base URL 복사

![Copy API Base](./img/azure_model_router_12.jpeg)

##### LiteLLM에 API Base 입력

![API Base 필드 클릭](./img/azure_model_router_13.jpeg)

![Paste API Base](./img/azure_model_router_14.jpeg)

##### Azure에서 API Key 복사

![Copy API Key](./img/azure_model_router_15.jpeg)

##### LiteLLM에 API Key 입력

![Enter API Key](./img/azure_model_router_16.jpeg)

#### Step 4: 테스트 후 모델 추가

설정이 동작하는지 확인하고 모델을 저장합니다.

##### Test Connection

![Test Connection](./img/azure_model_router_17.jpeg)

##### Close Test Dialog

![Close Dialog](./img/azure_model_router_18.jpeg)

##### Add Model

![Add Model](./img/azure_model_router_19.jpeg)

#### Step 5: Playground에서 확인

모델을 테스트하고 비용 추적이 동작하는지 확인합니다.

##### Open Playground

![Go to Playground](./img/azure_model_router_20.jpeg)

##### Select Model

![Select Model](./img/azure_model_router_21.jpeg)

##### 테스트 메시지 전송

![Send Message](./img/azure_model_router_22.jpeg)

##### View 로그

![View 로그](./img/azure_model_router_23.jpeg)

##### 비용 추적 확인

비용은 실제 사용된 모델(예: `gpt-4.1-nano`) 기준 비용과 Model Router 사용에 대한 입력 토큰 100만 개당 $0.14의 고정 인프라 비용을 합산해 추적됩니다.

![Verify Cost](./img/azure_model_router_24.jpeg)

## 비용 추적

LiteLLM은 Azure Model Router의 비용 추적을 자동으로 처리합니다. 이 동작을 이해하면 지출을 해석하고 billing 문제를 디버깅하는 데 도움이 됩니다.

### LiteLLM 비용 계산 방식

Azure Model Router를 사용하면 LiteLLM은 **두 가지 비용 구성 요소**를 계산합니다.

| 구성 요소 | 설명 | 적용 시점 |
|-----------|-------------|--------------|
| **Model Cost** | 요청을 실제로 처리한 모델(예: `gpt-5-nano`, `gpt-4.1-nano`)의 토큰 기반 비용 | Azure가 응답에서 모델을 반환하면 항상 적용 |
| **Router Flat Cost** | 입력 토큰 100만 개당 $0.14(Azure AI Foundry 인프라 요금) | **요청**이 model router endpoint를 통해 수행된 경우 |

### 비용 계산 흐름

1. **요청 모델 감지**: LiteLLM은 요청한 모델(예: `azure_ai/model_router/model-router`)을 기록합니다. `model_router` 또는 `model-router`가 포함되어 있으면 router 요청으로 처리합니다.

2. **응답 모델 추출**: Azure는 응답에서 실제 사용된 모델(예: `gpt-5-nano-2025-08-07`)을 반환합니다. LiteLLM은 이를 모델 비용 조회에 사용합니다.

3. **Model cost**: LiteLLM은 pricing table에서 응답 모델을 조회하고 prompt token과 completion token으로 비용을 계산합니다.

4. **Router flat cost**: 원래 요청이 model router로 전송되었으므로 LiteLLM은 모델 비용 위에 고정 비용(입력 토큰 100만 개당 $0.14)을 추가합니다.

5. **Total cost**: `Total = Model Cost + Router Flat Cost`

### 설정 Requirements

비용 추적이 올바르게 동작하려면 다음을 지켜야 합니다.

- **전체 패턴 사용**: `azure_ai/model_router/<deployment-name>`(예: `azure_ai/model_router/model-router`)
- **Proxy 설정**: LiteLLM proxy를 사용할 때 `litellm_params`의 `model`을 전체 패턴으로 설정해 요청 모델이 router로 정확히 식별되도록 합니다.

```yaml
# proxy_server_config.yaml
model_list:
  - model_name: model-router
    litellm_params:
      model: azure_ai/model_router/model-router  # Required for router cost detection
      api_base: https://your-endpoint.cognitiveservices.azure.com/openai/deployments/model-router/chat/completions?api-version=2025-01-01-preview
      api_key: your-api-key
```

### 비용 구성

Azure Model Router를 사용할 때 총 비용에는 다음이 포함됩니다.

- **Model Cost**: 요청을 실제로 처리한 모델(예: `gpt-5-nano`, `gpt-4.1-nano`) 기준 비용
- **Router Flat Cost**: 입력 토큰 100만 개당 $0.14(Azure AI Foundry 인프라 요금)

### 비용이 포함된 예제 Response

```python
import litellm

response = litellm.completion(
    model="azure_ai/model_router/azure-model-router",
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="https://your-endpoint.cognitiveservices.azure.com/openai/v1/",
    api_key="your-api-key",
)

# The response will show the actual model used
print(f"Model used: {response.model}")  # e.g., "azure_ai/gpt-4.1-nano-2025-04-14"

# Get cost (includes both model cost and router flat cost)
from litellm import completion_cost
cost = completion_cost(completion_response=response)
print(f"Total cost: ${cost}")

# Access detailed cost breakdown
if hasattr(response, '_hidden_params') and 'response_cost' in response._hidden_params:
    print(f"Response cost: ${response._hidden_params['response_cost']}")
```

### UI에서 비용 구성 확인

LiteLLM UI에서 로그를 볼 때 다음을 확인할 수 있습니다.
- **Model Cost**: 실제 사용된 모델의 비용
- **Azure Model Router Flat Cost**: 입력 토큰 100만 개당 $0.14 인프라 요금
- **Total Cost**: 두 비용의 합계

이 구성 내역은 Model Router 사용 시 어떤 항목에 비용을 지불하는지 정확히 이해하는 데 도움이 됩니다.
