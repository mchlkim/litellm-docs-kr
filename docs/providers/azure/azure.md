
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure OpenAI

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure OpenAI Service는 `o1`, `o1-mini`, `GPT-5`, `GPT-4o`, `GPT-4o mini`, `GPT-4 Turbo with Vision`, `GPT-4`, `GPT-3.5-Turbo`, `Embeddings` 모델 시리즈 등 OpenAI의 강력한 언어 모델에 REST API로 접근할 수 있게 해줍니다. Azure Foundry를 통한 Claude 모델도 지원합니다. |
| LiteLLM Provider Route | `azure/`, [`azure/o_series/`](#o-series-models), [`azure/gpt5_series/`](#gpt-5-models), [`azure/claude-*`](./azure_anthropic) (Azure Foundry를 통한 Claude 모델) |
| 지원 작업 | [`/chat/completions`](#azure-openai-chat-completion-models), [`/responses`](./azure_responses), [`/completions`](#azure-instruct-models), [`/embeddings`](./azure_embedding), [`/audio/speech`](azure_speech), [`/audio/transcriptions`](../audio_transcription), `/fine_tuning`, [`/batches`](#azure-batches-api), `/files`, [`/images`](../image_generation#azure-openai-image-generation-models), [`/anthropic/v1/messages`](./azure_anthropic) |
| Provider 문서 링크 | [Azure OpenAI ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview), [Azure Foundry Claude ↗](https://learn.microsoft.com/en-us/azure/ai-services/foundry-models/claude)

## API 키와 파라미터
`api_key`, `api_base`, `api_version` 등은 `litellm.completion`에 직접 전달하거나 `litellm.api_key` 파라미터로 설정할 수 있습니다.
```python
import os
os.environ["AZURE_API_KEY"] = "" # "my-azure-api-key"
os.environ["AZURE_API_BASE"] = "" # "https://example-endpoint.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "" # "2023-05-15"

# optional
os.environ["AZURE_AD_TOKEN"] = ""
os.environ["AZURE_API_TYPE"] = ""
```

:::info Azure Foundry Claude 모델

Azure는 Azure Foundry를 통한 Claude 모델도 지원합니다. Azure 인증과 함께 `azure/claude-*` 모델명(예: `azure/claude-sonnet-4-5`)을 사용하세요. 자세한 내용은 [Azure Anthropic 문서](./azure_anthropic)를 참고하세요.

:::

## **사용법 - LiteLLM Python SDK**
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Azure_OpenAI.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

### Completion - `.env` 변수 사용

```python
from litellm import completion

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
response = completion(
    model = "azure/<your_deployment_name>", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

### Completion - `api_key`, `api_base`, `api_version` 사용

```python
import litellm

# azure call
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    api_key = "",                                       # azure api key
    messages = [{"role": "user", "content": "good morning"}],
)
```

### Completion - `azure_ad_token`, `api_base`, `api_version` 사용

```python
import litellm

# azure call
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token="", 									# azure_ad_token 
    messages = [{"role": "user", "content": "good morning"}],
)
```


## **사용법 - LiteLLM Proxy Server**

LiteLLM Proxy Server로 Azure OpenAI 모델을 호출하는 방법입니다.

### 1. 환경에 키 저장

```bash
export AZURE_API_KEY=""
```

### 2. 프록시 시작 

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY # The `os.environ/` prefix tells litellm to read this from the env.
```

### 3. 테스트

<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(model="gpt-3.5-turbo", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "gpt-3.5-turbo",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```
</TabItem>
</Tabs>


### API 버전 설정

프록시 `config.yaml`에서 Azure OpenAI의 `api_version`을 다음 방식으로 설정할 수 있습니다.

#### Option 1: Per Model 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/my-gpt4-deployment
      api_base: https://your-resource.openai.azure.com/
      api_version: "2024-08-01-preview"  # Set version per model
      api_key: os.environ/AZURE_API_KEY
```





## Azure OpenAI Chat Completion 모델

:::tip

**모든 Azure 모델을 지원합니다. LiteLLM 요청을 보낼 때 `model=azure/<your deployment name>` 형식의 prefix만 설정하면 됩니다.**

:::

| 모델명       | 함수 호출                          |
|------------------|----------------------------------------|
| o1-mini | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| o1-preview | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| gpt-5 | `response = completion(model="azure/<your deployment name>", messages=messages)` |
| `gpt-4o-mini`            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4o            | `completion('azure/<your deployment name>', messages)`         |
| gpt-4            | `completion('azure/<your deployment name>', messages)`         |
| `gpt-4-0314`            | `completion('azure/<your deployment name>', messages)`         | 
| `gpt-4-0613`            | `completion('azure/<your deployment name>', messages)`         |
| `gpt-4-32k`            | `completion('azure/<your deployment name>', messages)`         | 
| `gpt-4-32k-0314`            | `completion('azure/<your deployment name>', messages)`         |
| `gpt-4-32k-0613`            | `completion('azure/<your deployment name>', messages)`         | 
| `gpt-4-1106-preview`            | `completion('azure/<your deployment name>', messages)`         | 
| `gpt-4-0125-preview`            | `completion('azure/<your deployment name>', messages)`         | 
| gpt-3.5-turbo    | `completion('azure/<your deployment name>', messages)` |
| `gpt-3.5-turbo-0301`    | `completion('azure/<your deployment name>', messages)` |
| `gpt-3.5-turbo-0613`    | `completion('azure/<your deployment name>', messages)` |
| `gpt-3.5-turbo-16k`    | `completion('azure/<your deployment name>', messages)` |
| `gpt-3.5-turbo-16k-0613`    | `completion('azure/<your deployment name>', messages)`

## Azure OpenAI Vision 모델 
| 모델명            | 함수 호출                                                   |
|-----------------------|-----------------------------------------------------------------|
| gpt-4-vision   | `completion(model="azure/<your deployment name>", messages=messages)` |
| gpt-4o            | `completion('azure/<your deployment name>', messages)`         |

#### 사용법
```python
import os 
from litellm import completion

os.environ["AZURE_API_KEY"] = "your-api-key"

# azure call
response = completion(
    model = "azure/<your deployment name>", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

#### 사용법 - Azure Vision 향상 기능 포함

참고: **Azure는 `base_url`에 `/extensions`가 포함되도록 설정해야 합니다.** 

예제 
```python
base_url=https://gpt-4-vision-resource.openai.azure.com/openai/deployments/gpt-4-vision/extensions
# base_url="{azure_endpoint}/openai/deployments/{azure_deployment}/extensions"
```

**사용법**
```python
import os 
from litellm import completion

os.environ["AZURE_API_KEY"] = "your-api-key"

# azure call
response = completion(
            model="azure/gpt-4-vision",
            timeout=5,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Whats in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": "https://avatars.githubusercontent.com/u/29436595?v=4"
                            },
                        },
                    ],
                }
            ],
            base_url="https://gpt-4-vision-resource.openai.azure.com/openai/deployments/gpt-4-vision/extensions",
            api_key=os.getenv("AZURE_VISION_API_KEY"),
            enhancements={"ocr": {"enabled": True}, "grounding": {"enabled": True}},
            dataSources=[
                {
                    "type": "AzureComputerVision",
                    "parameters": {
                        "endpoint": "https://gpt-4-vision-enhancement.cognitiveservices.azure.com/",
                        "key": os.environ["AZURE_VISION_ENHANCE_KEY"],
                    },
                }
            ],
)
```

## O-Series 모델

Azure OpenAI O-Series 모델은 LiteLLM에서 지원됩니다. 

LiteLLM은 모델명에 `o1` 또는 `o3`가 포함된 배포명을 O-Series [transformation](https://github.com/BerriAI/litellm/blob/91ed05df2962b8eee8492374b048d27cc144d08c/litellm/llms/azure/chat/o1_transformation.py#L4) 로직으로 라우팅합니다.

명시적으로 설정하려면 `model`을 `azure/o_series/<your-deployment-name>`로 지정하세요.

**자동 라우팅**

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

litellm.completion(model="azure/my-o3-deployment", messages=[{"role": "user", "content": "Hello, world!"}]) # 👈 Note: 'o3' in the deployment name
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: o3-mini
    litellm_params:
      model: azure/o3-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>

**명시적 라우팅**

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

litellm.completion(model="azure/o_series/my-random-deployment-name", messages=[{"role": "user", "content": "Hello, world!"}]) # 👈 Note: 'o_series/' in the deployment name
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: o3-mini
    litellm_params:
      model: azure/o_series/my-random-deployment-name
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```
</TabItem>
</Tabs>


## GPT-5 모델

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure OpenAI GPT-5 모델 |
| LiteLLM Provider Route | `azure/gpt5_series/<custom-name>` 또는 `azure/gpt-5-deployment-name` |

LiteLLM은 Azure GPT-5 모델을 두 가지 방식으로 사용할 수 있습니다.
1. 명시적 라우팅: `model = azure/gpt5_series/<deployment-name>`. 이 경우 LiteLLM에 등록되는 모델은 `model=azure/gpt5_series/<deployment-name>` 형식을 따릅니다.
2. 추론 라우팅(Azure 배포명에 `gpt-5`가 포함된 경우): `model = azure/gpt-5-mini`. 이 경우 LiteLLM에 등록되는 모델은 `model=azure/gpt-5-mini` 형식을 따릅니다.

#### 명시적 라우팅
GPT-5 모델 라우팅을 명시하려면 `azure/gpt5_series/<deployment-name>`를 사용하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

response = litellm.completion(
    model="azure/gpt5_series/my-gpt-5-deployment",
    messages=[{"role": "user", "content": "Hello, world!"}]
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-5
    litellm_params:
      model: azure/gpt5_series/my-gpt-5-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>

#### 추론 라우팅(배포명에 gpt-5 포함)
Azure 배포명에 `gpt-5`가 포함되어 있으면 LiteLLM은 자동으로 GPT-5 모델로 인식합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Deployment name contains 'gpt-5' - automatically inferred
response = litellm.completion(
    model="azure/my-gpt-5-deployment", 
    messages=[{"role": "user", "content": "Hello, world!"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-5-mini
    litellm_params:
      model: azure/my-gpt-5-deployment  # deployment name contains 'gpt-5'
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
```

</TabItem>
</Tabs>






## Azure Audio 모델

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

response = completion(
    model="azure/azure-openai-4o-audio",
    messages=[
      {
        "role": "user",
        "content": "I want to try out speech to speech"
      }
    ],
    modalities=["text","audio"],
    audio={"voice": "alloy", "format": "wav"}
)

print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: azure-openai-4o-audio
    litellm_params:
      model: azure/azure-openai-4o-audio
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: os.environ/AZURE_API_VERSION
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트


```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-openai-4o-audio",
    "messages": [{"role": "user", "content": "I want to try out speech to speech"}],
    "modalities": ["text","audio"],
    "audio": {"voice": "alloy", "format": "wav"}
  }'
```


</TabItem>
</Tabs>

## Azure Instruct 모델

`model="azure_text/<your-deployment>"`를 사용하세요.

| 모델명          | 함수 호출                                      |
|---------------------|----------------------------------------------------|
| `gpt-3.5-turbo-instruct` | `response = completion(model="azure_text/<your deployment name>", messages=messages)` |
| `gpt-3.5-turbo-instruct-0914` | `response = completion(model="azure_text/<your deployment name>", messages=messages)` |


```python
import litellm

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

response = litellm.completion(
    model="azure_text/<your-deployment-name",
    messages=[{"role": "user", "content": "What is the weather like in Boston?"}]
)

print(response)
```

## **인증**


### Entra ID - `azure_ad_token` 사용

Azure Active Directory Token, 즉 Microsoft Entra ID를 사용해 `litellm.completion()`을 호출하는 절차입니다.  
> **참고:** LiteLLM에서 다른 Azure 엔드포인트(예: chat, embeddings, image, audio 등)에 Azure Active Directory Token을 사용할 때도 아래와 같은 과정을 따르면 됩니다.

1단계 - Azure CLI 다운로드 
설치 안내: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
```shell
brew update && brew install azure-cli
```
2단계 - `az`로 로그인
```shell
az login --output table
```

3단계 - Azure AD 토큰 생성
```shell
az account get-access-token --resource https://cognitiveservices.azure.com
```

이 단계에서 생성된 `accessToken`을 확인할 수 있습니다.
```shell
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSIsImtpZCI6IjlHbW55RlBraGMzaE91UjIybXZTdmduTG83WSJ9",
  "expiresOn": "2023-11-14 15:50:46.000000",
  "expires_on": 1700005846,
  "subscription": "db38de1f-4bb3..",
  "tenant": "bdfd79b3-8401-47..",
  "tokenType": "Bearer"
}
```

4단계 - Azure AD 토큰으로 `litellm.completion` 호출

`azure_ad_token`을 3단계의 `accessToken`으로 설정하거나 `os.environ['AZURE_AD_TOKEN']`을 설정하세요.


<Tabs>
<TabItem value="sdk" label="SDK">


```python
response = litellm.completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token="", 									# your accessToken from step 3 
    messages = [{"role": "user", "content": "good morning"}],
)

```

</TabItem>
<TabItem value="proxy" label="PROXY config.yaml">

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      azure_ad_token: os.environ/AZURE_AD_TOKEN
```

</TabItem>
</Tabs>

### Entra ID - `tenant_id`, `client_id`, `client_secret` 사용

LiteLLM 프록시 `config.yaml`에서 `tenant_id`, `client_id`, `client_secret`을 설정하는 예시입니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET
      azure_scope: os.environ/AZURE_SCOPE  # defaults to "https://cognitiveservices.azure.com/.default"
```

테스트

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```

LiteLLM Proxy Server에서 `tenant_id`, `client_id`, `client_secret`을 사용하는 예시 동영상입니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/70d3f219ee7f4e5d84778b7f17bba506?sid=04b8ff29-485f-4cb8-929e-6b392722f36d" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

### Entra ID - `client_id`, `username`, `password` 사용

LiteLLM 프록시 `config.yaml`에서 `client_id`, `azure_username`, `azure_password`를 설정하는 예시입니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      client_id: os.environ/AZURE_CLIENT_ID
      azure_username: os.environ/AZURE_USERNAME
      azure_password: os.environ/AZURE_PASSWORD
      azure_scope: os.environ/AZURE_SCOPE  # defaults to "https://cognitiveservices.azure.com/.default"
```

테스트

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```


### Azure AD 토큰 새로고침 - `DefaultAzureCredential`

요청 인증에 Azure `DefaultAzureCredential`을 사용하려면 이 방식을 사용하세요. `DefaultAzureCredential`은 여러 소스에서 사용 가능한 Azure 자격 증명을 자동으로 찾아 사용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

**옵션 1: 명시적 DefaultAzureCredential(권장)**
```python
from litellm import completion
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

# DefaultAzureCredential automatically discovers credentials from:
# - Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
# - Managed Identity (AKS, Azure VMs, etc.)
# - Azure CLI credentials
# - And other Azure identity sources
token_provider = get_bearer_token_provider(DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default")

response = completion(
    model = "azure/<your deployment name>",             # model = azure/<your deployment name> 
    api_base = "",                                      # azure api base
    api_version = "",                                   # azure api version
    azure_ad_token_provider=token_provider,
    messages = [{"role": "user", "content": "good morning"}],
)
```

**옵션 2: LiteLLM의 DefaultAzureCredential 자동 fallback**
```python
import litellm

# Enable automatic fallback to DefaultAzureCredential
litellm.enable_azure_ad_token_refresh = True

response = litellm.completion(
    model = "azure/<your deployment name>",
    api_base = "",
    api_version = "",
    messages = [{"role": "user", "content": "good morning"}],
)
```

</TabItem>
<TabItem value="proxy" label="PROXY config.yaml">

**시나리오 1: 환경 변수 사용(전통적 방식)**

1. 관련 환경 변수 추가

```bash
export AZURE_TENANT_ID=""
export AZURE_CLIENT_ID=""
export AZURE_CLIENT_SECRET=""
```

2. `config.yaml` 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

**시나리오 2: Managed Identity(AKS, Azure VM) - 하드코딩된 자격 증명 불필요**

Azure가 자격 증명을 자동으로 주입하는 AKS 클러스터, Azure VM 또는 기타 관리형 환경에 적합합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

**시나리오 3: Azure CLI 인증**

`az login`으로 인증되어 있다면 추가 설정은 필요하지 않습니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/your-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/

litellm_settings:
    enable_azure_ad_token_refresh: true # 👈 KEY CHANGE
```

3. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

**동작 방식**: 
- LiteLLM은 먼저 Service Principal 인증을 시도합니다(환경 변수가 있는 경우).
- 실패하면 자동으로 `DefaultAzureCredential`로 fallback합니다.
- `DefaultAzureCredential`은 Managed Identity, Azure CLI 자격 증명 또는 사용 가능한 다른 Azure identity 소스를 사용합니다.
- AKS 같은 관리형 환경에서 자격 증명을 하드코딩할 필요가 없어집니다.

</TabItem>
</Tabs>


## **Azure Batches API**

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure OpenAI Batches API |
| `custom_llm_provider` on LiteLLM | `azure/` |
| 지원 작업 | `/v1/batches`, `/v1/files` |
| Azure OpenAI Batches API | [Azure OpenAI Batches API ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/batch) |
| 비용 추적, 로깅 지원 | ✅ LiteLLM은 Batch API 요청을 로깅하고 비용을 추적합니다. |


### 빠른 시작

환경에 Azure 관련 환경 변수만 추가하면 됩니다.

```bash
export AZURE_API_KEY=""
export AZURE_API_BASE=""
```

<Tabs>
<TabItem value="proxy" label="LiteLLM PROXY Server">

**1. 파일 업로드**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-api-key"
)

batch_input_file = client.files.create(
    file=open("mydata.jsonl", "rb"),
    purpose="batch",
    extra_headers={"custom-llm-provider": "azure"}
)
file_id = batch_input_file.id
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer sk-1234" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

</TabItem>
</Tabs>

**예시 파일 형식**
```json
{"custom_id": "task-0", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was Microsoft founded?"}]}}
{"custom_id": "task-1", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was the first XBOX released?"}]}}
{"custom_id": "task-2", "method": "POST", "url": "/chat/completions", "body": {"model": "REPLACE-WITH-MODEL-DEPLOYMENT-NAME", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "What is Altair Basic?"}]}}
```

**2. Batch 요청 생성**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
batch = client.batches.create( # re use client from above
    input_file_id=file_id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "My batch job"},
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```
</TabItem>
</Tabs>

**3. Batch 조회**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
retrieved_batch = client.batches.retrieve(
    batch.id,
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches/batch_abc123 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
```

</TabItem>
</Tabs>

**4. Batch 취소**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
cancelled_batch = client.batches.cancel(
    batch.id,
    extra_headers={"custom-llm-provider": "azure"}
)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches/batch_abc123/cancel \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST
```

</TabItem>
</Tabs>

**5. Batch 목록 조회**

<Tabs>
<TabItem value="sdk" label="OpenAI Python SDK">

```python
client.batches.list(extra_headers={"custom-llm-provider": "azure"})
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/batches?limit=2 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json"
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

**1. Batch Completion용 파일 생성**

```python
from litellm
import os 

os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""

file_name = "azure_batch_completions.jsonl"
_current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(_current_dir, file_name)
file_obj = await litellm.acreate_file(
    file=open(file_path, "rb"),
    purpose="batch",
    custom_llm_provider="azure",
)
print("Response from creating file=", file_obj)
```

**2. Batch 요청 생성**

```python
create_batch_response = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=batch_input_file_id,
    custom_llm_provider="azure",
    metadata={"key1": "value1", "key2": "value2"},
)

print("response from litellm.create_batch=", create_batch_response)
```

**3. Batch와 파일 내용 조회**

```python
retrieved_batch = await litellm.aretrieve_batch(
    batch_id=create_batch_response.id, 
    custom_llm_provider="azure"
)
print("retrieved batch=", retrieved_batch)

# Get file content
file_content = await litellm.afile_content(
    file_id=batch_input_file_id, 
    custom_llm_provider="azure"
)
print("file content = ", file_content)
```

**4. Batch 목록 조회**

```python
list_batches_response = litellm.list_batches(
    custom_llm_provider="azure", 
    limit=2
)
print("list_batches_response=", list_batches_response)
```

</TabItem>
</Tabs>

### [Azure Batch 모델 Health Check](../../proxy/health.md#batch-models-azure-only)


### [BETA] 여러 Azure 배포 Load Balance
`config.yaml`에서 `enable_loadbalancing_on_batch_endpoints: true`를 설정하세요.

```yaml
model_list:
  - model_name: "batch-gpt-4o-mini"
    litellm_params:
      model: "azure/gpt-4o-mini"
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
    model_info:
      mode: batch

litellm_settings:
  enable_loadbalancing_on_batch_endpoints: true # 👈 KEY CHANGE
```

참고: 이 설정은 `{PROXY_BASE_URL}/v1/files`와 `{PROXY_BASE_URL}/v1/batches`에서 동작합니다.
참고: 응답은 OpenAI 형식입니다. 

1. 파일 업로드

`.jsonl`에 `model: batch-gpt-4o-mini`만 설정하세요.

```bash
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer sk-1234" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

**예시 파일**

참고: `model`은 Azure 배포명이어야 합니다.

```json
{"custom_id": "task-0", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was Microsoft founded?"}]}}
{"custom_id": "task-1", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "When was the first XBOX released?"}]}}
{"custom_id": "task-2", "method": "POST", "url": "/chat/completions", "body": {"model": "batch-gpt-4o-mini", "messages": [{"role": "system", "content": "You are an AI assistant that helps people find information."}, {"role": "user", "content": "What is Altair Basic?"}]}}
```

예상 응답(OpenAI 호환)

```bash
{"id":"file-f0be81f654454113a922da60acb0eea6",...}
```

2. Batch 생성

```bash
curl http://0.0.0.0:4000/v1/batches \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-f0be81f654454113a922da60acb0eea6",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h",
    "model: "batch-gpt-4o-mini"
  }'
```

예상 응답:

```bash
{"id":"batch_94e43f0a-d805-477d-adf9-bbb9c50910ed",...}
```

3. Batch 조회

```bash
curl http://0.0.0.0:4000/v1/batches/batch_94e43f0a-d805-477d-adf9-bbb9c50910ed \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
```


예상 응답:

```
{"id":"batch_94e43f0a-d805-477d-adf9-bbb9c50910ed",...}
```

4. Batch 목록 조회

```bash
curl http://0.0.0.0:4000/v1/batches?limit=2 \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json"
```

예상 응답:

```bash
{"data":[{"id":"batch_R3V...}
```

## 고급
### Azure API 로드 밸런싱 {#azure-api-load-balancing}

여러 Azure/OpenAI 배포 간에 load balance하려면 이 방식을 사용하세요. 

`Router`는 rate limit 이하이면서 사용 토큰 수가 가장 적은 배포를 선택해 실패 요청을 줄입니다.

프로덕션에서는 [Router가 Redis Cache에 연결](#redis-queue)해 여러 배포의 사용량을 추적합니다.

#### 빠른 시작

```python
uv add litellm
```

```python
from litellm import Router

model_list = [{ # list of model deployments 
	"model_name": "gpt-3.5-turbo", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "azure/chatgpt-v-2", 
		"api_key": os.getenv("AZURE_API_KEY"),
		"api_version": os.getenv("AZURE_API_VERSION"),
		"api_base": os.getenv("AZURE_API_BASE")
	},
	"tpm": 240000,
	"rpm": 1800
}, {
    "model_name": "gpt-3.5-turbo", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "azure/chatgpt-functioncalling", 
		"api_key": os.getenv("AZURE_API_KEY"),
		"api_version": os.getenv("AZURE_API_VERSION"),
		"api_base": os.getenv("AZURE_API_BASE")
	},
	"tpm": 240000,
	"rpm": 1800
}, {
    "model_name": "gpt-3.5-turbo", # openai model name 
	"litellm_params": { # params for litellm completion/embedding call 
		"model": "gpt-3.5-turbo", 
		"api_key": os.getenv("OPENAI_API_KEY"),
	},
	"tpm": 1000000,
	"rpm": 9000
}]

router = Router(model_list=model_list)

# openai.chat.completions.create replacement
response = router.completion(model="gpt-3.5-turbo", 
				messages=[{"role": "user", "content": "Hey, how's it going?"}]

print(response)
```

#### Redis Queue

```python
router = Router(model_list=model_list, 
                redis_host=os.getenv("REDIS_HOST"), 
                redis_password=os.getenv("REDIS_PASSWORD"), 
                redis_port=os.getenv("REDIS_PORT"))

print(response)
```


### 도구 호출 / Function Calling

LiteLLM에서 parallel function calling을 사용하는 자세한 walkthrough는 [여기](https://docs.litellm.ai/docs/completion/function_call)를 참고하세요.


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# set Azure env variables
import os
import litellm
import json

os.environ['AZURE_API_KEY'] = "" # litellm reads AZURE_API_KEY from .env and sends the request
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test-v-1.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-07-01-preview"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = litellm.completion(
    model="azure/chatgpt-functioncalling", # model = azure/<your-azure-deployment-name>
    messages=[{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}],
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
print("\nTool Choice:\n", tool_calls)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-functioncalling
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://localhost:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "azure-gpt-3.5",
    "messages": [
        {
            "role": "user",
            "content": "Hey, how'\''s it going? Thinking long and hard before replying - what is the meaning of the world and life itself"
        }
    ]
}'
```




</TabItem>
</Tabs>
### Azure OpenAI 모델 비용 추적(PROXY)

Azure image generation 호출의 비용 추적을 위해 base model을 설정합니다.

#### 이미지 생성

```yaml
model_list: 
  - model_name: dall-e-3
    litellm_params:
        model: azure/dall-e-3-test
        api_version: 2023-06-01-preview
        api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
        api_key: os.environ/AZURE_API_KEY
        base_model: dall-e-3 # 👈 set dall-e-3 as base model
    model_info:
        mode: image_generation
```

#### Chat Completions / Embeddings 문제 {#chat-completions--embeddings}

**문제**: `azure/gpt-4-1106-preview`를 사용할 때 Azure가 응답에서 `gpt-4`를 반환합니다. 이로 인해 비용 추적이 부정확해집니다.

**해결책** ✅ : config에 `base_model`을 설정해 LiteLLM이 Azure 비용 계산에 올바른 모델을 사용하도록 합니다.

base model 이름은 [여기](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 확인하세요.

`base_model`을 포함한 config 예시
```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      base_model: azure/gpt-4-1106-preview
```
