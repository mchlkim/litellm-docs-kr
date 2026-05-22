import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem'

# AWS Sagemaker
LiteLLM은 모든 Sagemaker Huggingface Jumpstart 모델을 지원합니다.

:::tip

**모든 Sagemaker 모델을 지원합니다. litellm 요청을 보낼 때 `model=sagemaker/<any-model-on-sagemaker>`를 접두사로 설정하면 됩니다.**

:::


### API 키
```python
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""
```

### 사용법
```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/<your-endpoint-name>", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

### 사용법 - Streaming
Sagemaker는 현재 streaming을 지원하지 않습니다. LiteLLM은 응답 문자열을 chunk로 나누어 반환하는 방식으로 streaming처럼 동작하게 합니다.

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80,
            stream=True,
        )
for chunk in response:
    print(chunk)
```


## **LiteLLM Proxy 사용법**

LiteLLM Proxy Server로 Sagemaker를 호출하는 방법입니다.

### 1. config.yaml 설정

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
```

사용 가능한 모든 인증 파라미터:

```
aws_access_key_id: Optional[str],
aws_secret_access_key: Optional[str],
aws_session_token: Optional[str],
aws_region_name: Optional[str],
aws_session_name: Optional[str],
aws_profile_name: Optional[str],
aws_role_name: Optional[str],
aws_web_identity_token: Optional[str],
```

### 2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```
### 3. 테스트


<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "jumpstart-model",
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

response = client.chat.completions.create(model="jumpstart-model", messages = [
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
    model = "jumpstart-model",
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

## temperature, top_p 등 설정

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0.7,
  top_p=1
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에서 설정**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      temperature: <your-temp>
      top_p: <your-top-p>
```

**요청에서 설정**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
top_p=1
)

print(response)

```

</TabItem>
</Tabs>

## Sagemaker에서 **temperature=0 설정 허용**

기본적으로 LiteLLM 요청에 `temperature=0`이 전달되면 LiteLLM은 이를 `temperature=0.1`로 올림 처리합니다. Sagemaker는 `temperature=0`일 때 대부분의 요청이 실패하기 때문입니다.

모델에 `temperature=0`을 그대로 보내고 싶다면 다음처럼 설정합니다. Sagemaker는 다양한 모델을 호스팅할 수 있으므로 일부 모델은 zero temperature를 허용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0,
  aws_sagemaker_allow_zero_temp=True,
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에서 `aws_sagemaker_allow_zero_temp` 설정**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      aws_sagemaker_allow_zero_temp: true
```

**요청에서 `temperature=0` 설정**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0,
)

print(response)

```

</TabItem>
</Tabs>

## provider별 파라미터 전달

OpenAI 표준이 아닌 파라미터를 litellm에 전달하면 provider별 파라미터로 간주하고 요청 본문에 kwarg로 보냅니다. [자세히 보기](../completion/input.md#provider-specific-params)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에서 설정**

```yaml
model_list:
  - model_name: jumpstart-model
    litellm_params:
      model: sagemaker/jumpstart-dft-hf-textgeneration1-mp-20240815-185614
      top_k: 1 # 👈 PROVIDER-SPECIFIC PARAM
```

**요청에서 설정**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="jumpstart-model", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
}
)

print(response)

```

</TabItem>
</Tabs>


### Inference Component 이름 전달

하나의 endpoint에 여러 모델이 있으면 개별 모델 이름을 지정해야 합니다. 이때 `model_id`를 사용합니다.

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/<your-endpoint-name>", 
            model_id="<your-model-name",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

### 파라미터로 자격 증명 전달 - Completion()
AWS 자격 증명을 `litellm.completion` 파라미터로 전달합니다.
```python
import os 
from litellm import completion

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
)
```

### Prompt Template 적용
Sagemaker deployment에 올바른 prompt template을 적용하려면 HF 모델 이름도 함께 전달합니다.

```python
import os 
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b", 
            messages=messages,
            temperature=0.2,
            max_tokens=80,
            hf_model_name="meta-llama/Llama-2-7b",
        )
```

자체 [custom prompt template](../completion/prompt_formatting.md#format-prompt-yourself)을 전달할 수도 있습니다.


## Sagemaker Messages API 사용

Sagemaker Messages API로 라우팅하려면 `sagemaker_chat/*` route를 사용합니다.

```
model: sagemaker_chat/<your-endpoint-name>
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm
from litellm import completion

litellm.set_verbose = True # 👈 SEE RAW REQUEST

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
            model="sagemaker_chat/<your-endpoint-name>", 
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            temperature=0.2,
            max_tokens=80
        )
```

</TabItem>
<TabItem value="proxy" label="PROXY">

#### 1. config.yaml 설정

```yaml
model_list:
  - model_name: "sagemaker-model"
    litellm_params:
      model: "sagemaker_chat/jumpstart-dft-hf-textgeneration1-mp-20240815-185614"
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

#### 2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```
#### 3. 테스트


```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "sagemaker-model",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```

[**👉 OpenAI SDK/Langchain/Llamaindex 등 예제 보기**](../proxy/user_keys.md#chatcompletions)

</TabItem>
</Tabs>


## Completion 모델 


:::tip

**모든 Sagemaker 모델을 지원합니다. litellm 요청을 보낼 때 `model=sagemaker/<any-model-on-sagemaker>`를 접두사로 설정하면 됩니다.**

:::

LiteLLM에서 Sagemaker 모델을 사용하는 예시입니다.

| 모델 이름                    | 함수 호출                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------|
| 사용자 지정 Huggingface 모델               | `completion(model='sagemaker/<your-deployment-name>', messages=messages)`        | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`      
| `Meta Llama 2 7B`               | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b', messages=messages)`        | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| `Meta Llama 2 7B (Chat/Fine-tuned)`  | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b-f', messages=messages)`      | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| `Meta Llama 2 13B`              | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b', messages=messages)`       | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| `Meta Llama 2 13B (Chat/Fine-tuned)` | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b-f', messages=messages)`     | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| `Meta Llama 2 70B`              | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b', messages=messages)`       | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |
| `Meta Llama 2 70B (Chat/Fine-tuned)` | `completion(model='sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b-b-f', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']`              |

## Embedding 모델

LiteLLM은 모든 Sagemaker Jumpstart Huggingface Embedding 모델을 지원합니다. 호출 방법은 다음과 같습니다.

```python
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = litellm.embedding(model="sagemaker/<your-deployment-name>", input=["good morning from litellm", "this is another item"])
print(f"response: {response}")
```



## Nova 모델 on SageMaker

LiteLLM은 SageMaker Inference real-time endpoint에 배포된 Amazon Nova 모델(Nova Micro, Nova Lite, Nova 2 Lite)을 지원합니다. 이러한 custom/fine-tuned Nova 모델은 OpenAI 호환 API 형식을 사용합니다.

**Reference:** [AWS 블로그 - Amazon SageMaker Inference for Custom Amazon Nova 모델](https://aws.amazon.com/blogs/aws/announcing-amazon-sagemaker-inference-for-custom-amazon-nova-models/)

### 사용법

SageMaker endpoint 이름과 함께 `sagemaker_nova/` 접두사를 사용합니다.

```python
import litellm
import os

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Basic chat completion
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    temperature=0.7,
    max_tokens=512,
)
print(response.choices[0].message.content)
```

### Streaming

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Write a short poem"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 멀티모달(이미지)

SageMaker의 Nova 모델은 base64 data URI를 사용한 이미지 입력을 지원합니다.

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}
            ]
        }
    ],
)
```

### Proxy 설정

```yaml
model_list:
  - model_name: nova-micro
    litellm_params:
      model: sagemaker_nova/my-nova-micro-endpoint
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

### 지원 파라미터

모든 표준 OpenAI 파라미터를 지원하며, 추가로 다음 Nova 전용 파라미터를 지원합니다.

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `top_k` | integer | 토큰 선택을 가능성이 가장 높은 상위 K개 토큰으로 제한합니다. |
| `reasoning_effort` | `"low"` \| `"high"` | reasoning effort 수준입니다. Nova 2 Lite custom 모델에서만 지원됩니다. |
| `allowed_token_ids` | array[int] | 출력을 지정한 token ID로 제한합니다. |
| `truncate_prompt_tokens` | integer | prompt가 제한을 초과하면 N개 token으로 자릅니다. |

```python
response = litellm.completion(
    model="sagemaker_nova/my-nova-endpoint",
    messages=[{"role": "user", "content": "Think step by step: what is 2+2?"}],
    top_k=40,
    reasoning_effort="low",
    logprobs=True,
    top_logprobs=2,
)
```
