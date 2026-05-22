import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Hugging Face
LiteLLM은 Hugging Face Hub에 호스팅된 모델을 여러 서비스에서 실행하는 inference를 지원합니다.

- **Serverless Inference Providers** - Hugging Face는 [Together AI](https://together.ai), [Sambanova](https://sambanova.ai) 같은 여러 inference provider를 통해 serverless AI inference에 쉽고 통합된 접근 방식을 제공합니다. 유지보수가 필요 없고 확장 가능한 솔루션으로 제품에 AI를 통합하는 가장 빠른 방법입니다. 자세한 내용은 [Inference Providers 문서](https://huggingface.co/docs/inference-providers/index)를 참고하세요.
- **Dedicated Inference Endpoints** - 모델을 production에 쉽게 배포하기 위한 제품입니다. Inference는 사용자가 선택한 cloud provider의 dedicated fully managed infrastructure에서 Hugging Face가 실행합니다. [이 단계](https://huggingface.co/docs/inference-endpoints/guides/create_endpoint)에 따라 Hugging Face Inference Endpoints에 모델을 배포할 수 있습니다.


## 지원 모델 {#supported-모델}

### `Serverless Inference Providers` {#serverless-inference-providers}
Inference provider에서 사용할 수 있는 모델은 [huggingface.co/models](https://huggingface.co/models)로 이동한 뒤 "Other" filter tab을 클릭하고 원하는 provider를 선택해 확인할 수 있습니다.

![Inference Provider 기준으로 모델 필터링](../../img/hf_filter_inference_providers.png)

예를 들어 Fireworks가 지원하는 모든 모델은 [여기](https://huggingface.co/models?inference_provider=fireworks-ai&sort=trending)에서 찾을 수 있습니다.


### `Dedicated Inference Endpoints` {#dedicated-inference-endpoints}
사용 가능한 모델 목록은 [Inference Endpoints catalog](https://endpoints.huggingface.co/catalog)를 참고하세요.

## 사용법

<Tabs>
<TabItem value="serverless" label="Serverless Inference Providers">

### 인증
단일 Hugging Face token으로 여러 provider를 통한 inference에 접근할 수 있습니다. 호출은 Hugging Face를 통해 라우팅되며, 사용량은 표준 provider API 요금으로 Hugging Face 계정에 직접 청구됩니다.

Hugging Face token으로 `HF_TOKEN` environment variable을 설정하면 됩니다. Token은 여기에서 생성할 수 있습니다: https://huggingface.co/settings/tokens.

```bash
export HF_TOKEN="hf_xxxxxx"
```
또는 Hugging Face token을 parameter로 전달할 수도 있습니다.
```python
completion(..., api_key="hf_xxxxxx")
```

### 시작하기

Hugging Face 모델을 사용하려면 다음 형식으로 사용할 provider와 model을 모두 지정하세요.
```
huggingface/<provider>/<hf_org_or_user>/<hf_model>
```
여기서 `<hf_org_or_user>/<hf_model>`은 Hugging Face model ID이고 `<provider>`는 inference provider입니다.  
기본적으로 provider를 지정하지 않으면 LiteLLM은 [HF Inference API](https://huggingface.co/docs/api-inference/en/index)를 사용합니다.

예제:

```python
# Run DeepSeek-R1 inference through Together AI
completion(model="huggingface/together/deepseek-ai/DeepSeek-R1",...)

# Run Qwen2.5-72B-Instruct inference through Sambanova
completion(model="huggingface/sambanova/Qwen/Qwen2.5-72B-Instruct",...)

# Run Llama-3.3-70B-Instruct inference through HF Inference API
completion(model="huggingface/meta-llama/Llama-3.3-70B-Instruct",...)
```


<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_HuggingFace.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

### 기본 Completion {#basic-completion}
다음은 Together AI를 통해 DeepSeek-R1 모델을 사용하는 chat completion 예제입니다.

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

response = completion(
    model="huggingface/together/deepseek-ai/DeepSeek-R1",
    messages=[
        {
            "role": "user",
            "content": "How many r's are in the word 'strawberry'?",
        }
    ],
)
print(response)
```

### 스트리밍 {#streaming}
이제 streaming request가 어떤 형태인지 살펴보겠습니다.

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

response = completion(
    model="huggingface/together/deepseek-ai/DeepSeek-R1",
    messages=[
        {
            "role": "user",
            "content": "How many r's are in the word `strawberry`?",
            
        }
    ],
    stream=True,
)

for chunk in response:
    print(chunk)
```

### Image Input {#image-input}
모델이 지원하는 경우 image도 전달할 수 있습니다. 다음은 Sambanova를 통해 [Llama-3.2-11B-Vision-Instruct](https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct) 모델을 사용하는 예제입니다.

```python
from litellm import completion

# Set your Hugging Face Token
os.environ["HF_TOKEN"] = "hf_xxxxxx"

messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                    }
                },
            ],
        }
    ]

response = completion(
    model="huggingface/sambanova/meta-llama/Llama-3.2-11B-Vision-Instruct", 
    messages=messages,
)
print(response.choices[0])
```

### Function Calling {#function-calling}
모델에 tool 접근 권한을 제공해 모델의 기능을 확장할 수 있습니다. 다음은 Sambanova를 통해 [Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) 모델을 사용하는 function calling 예제입니다.

```python
import os
from litellm import completion

# Set your Hugging Face Token
os.environ["HF_TOKEN"] = "hf_xxxxxx"

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
    }
  }
]
messages = [
    {
        "role": "user",
        "content": "What's the weather like in Boston today?",
    }
]

response = completion(
    model="huggingface/sambanova/meta-llama/Llama-3.3-70B-Instruct", 
    messages=messages,
    tools=tools,
    tool_choice="auto"
)
print(response)
```

</TabItem>

<TabItem value="endpoints" label="Inference Endpoints">

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_HuggingFace.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

### 기본 Completion {#basic-completion-1}
Dedicated infrastructure에 [Hugging Face Inference Endpoint 배포](https://endpoints.huggingface.co/new)를 완료한 뒤에는 endpoint base URL을 `api_base`에 제공하고 model name으로 `huggingface/tgi`를 지정해 inference를 실행할 수 있습니다.

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

response = completion(
    model="huggingface/tgi",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    api_base="https://my-endpoint.endpoints.huggingface.cloud/v1/"
)
print(response)
```

### 스트리밍 {#streaming-1}

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

response = completion(
    model="huggingface/tgi",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    api_base="https://my-endpoint.endpoints.huggingface.cloud/v1/",
    stream=True
)

for chunk in response:
    print(chunk)
```

### Image Input {#image-input-1}

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png",
                    }
                },
            ],
        }
    ]
response = completion(
    model="huggingface/tgi",
    messages=messages,
    api_base="https://my-endpoint.endpoints.huggingface.cloud/v1/""
)
print(response.choices[0])
```

### Function Calling {#function-calling-1}

```python
import os
from litellm import completion

os.environ["HF_TOKEN"] = "hf_xxxxxx"

functions = [{
    "name": "get_weather",
    "description": "Get the weather in a given location",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The location to get weather for"
            }
        },
        "required": ["location"]
    }
}]

response = completion(
    model="huggingface/tgi",
    messages=[{"content": "What's the weather like in San Francisco?", "role": "user"}],
    api_base="https://my-endpoint.endpoints.huggingface.cloud/v1/",
    functions=functions
)
print(response)
```

</TabItem>
</Tabs>

## Hugging Face 모델과 함께 LiteLLM Proxy Server 사용 {#litellm-proxy-server-with-hugging-face-models}
지원되는 Inference Providers 중 하나를 통해 Hugging Face 모델을 제공하도록 [LiteLLM Proxy Server](https://docs.litellm.ai/#litellm-proxy-server-llm-gateway)를 설정할 수 있습니다. 방법은 다음과 같습니다.

### Step 1. config file 설정 {#step-1-setup-the-config-file}

이 예제에서는 Together AI를 backend Inference Provider로 사용해 Hugging Face의 `DeepSeek R1`을 제공하도록 proxy를 구성합니다.

```yaml
model_list:
  - model_name: my-r1-model
    litellm_params:
      model: huggingface/together/deepseek-ai/DeepSeek-R1
      api_key: os.environ/HF_TOKEN # ensure you have `HF_TOKEN` in your .env
```

### Step 2. server 시작 {#step-2-start-the-server}
```bash
litellm --config /path/to/config.yaml
```

### Step 3. server에 request 보내기 {#step-3-make-a-request-to-the-server}
<Tabs>
<TabItem value="curl" label="curl">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "my-r1-model",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ]
}'
```

</TabItem>
<TabItem value="python" label="python">

```python
# uv add openai
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="anything",
)

response = client.chat.completions.create(
    model="my-r1-model",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ]
)
print(response)
```

</TabItem>
</Tabs>


## Embedding

LiteLLM은 Hugging Face의 [text-embedding-inference](https://github.com/huggingface/text-embeddings-inference) 모델도 지원합니다.

```python
from litellm import embedding
import os
os.environ['HF_TOKEN'] = "hf_xxxxxx"
response = embedding(
    model='huggingface/microsoft/codebert-base',
    input=["good morning from litellm"]
)
```

# FAQ

**Hugging Face Inference Providers의 billing은 어떻게 작동하나요?**

> 어떤 provider를 사용하든 billing은 Hugging Face 계정으로 중앙화됩니다. 추가 markup 없이 표준 provider API 요금이 청구되며, Hugging Face는 provider 비용을 그대로 전달합니다. [Hugging Face PRO](https://huggingface.co/subscribe/pro) 사용자는 매월 provider 전반에서 사용할 수 있는 $2 상당의 Inference credit을 받습니다.

**각 Inference Provider마다 계정을 만들어야 하나요?**

> 아니요. 별도의 계정을 만들 필요가 없습니다. 모든 request는 Hugging Face를 통해 라우팅되므로 HF token만 있으면 됩니다. 이를 통해 여러 provider를 쉽게 benchmark하고 요구사항에 가장 잘 맞는 provider를 선택할 수 있습니다.

**앞으로 Hugging Face에서 더 많은 inference provider를 지원하나요?**

> 네. 새로운 inference provider와 model이 점진적으로 추가되고 있습니다.

Hugging Face integration 개선을 위한 제안을 환영합니다. [issue](https://github.com/BerriAI/litellm/issues/new/choose)를 생성하거나 [Join the Discord](https://discord.com/invite/wuPM9dRgDw)에 참여해 주세요!
