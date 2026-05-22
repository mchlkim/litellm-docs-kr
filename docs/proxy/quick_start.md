import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CLI 빠른 시작

CLI로 LiteLLM Proxy를 빠르게 설정합니다.

LiteLLM Server(LLM Gateway)는 다음을 관리합니다.

* **통합 인터페이스**: [Huggingface/Bedrock/TogetherAI 등](#other-supported-models) 100개 이상의 LLM을 OpenAI `ChatCompletions` 및 `Completions` 형식으로 호출합니다.
* **비용 추적**: 인증, 비용 추적, 예산을 [가상 키](https://docs.litellm.ai/docs/proxy/virtual_keys)와 함께 관리합니다.
* **부하 분산**: [여러 모델](#multiple-models---quick-start)과 [동일 모델의 여러 배포](#multiple-instances-of-1-model) 사이에서 라우팅합니다. LiteLLM proxy는 부하 테스트에서 초당 1.5k+ 요청을 처리할 수 있습니다.

```shell
$ uv tool install 'litellm[proxy]'
```

## 빠른 시작 - LiteLLM Proxy CLI

다음 명령으로 `litellm` proxy를 시작합니다.
```shell
$ litellm --model huggingface/bigcode/starcoder

#INFO: Proxy running on http://0.0.0.0:4000
```


:::info

자세한 디버그 로그가 필요하면 `--detailed_debug`를 함께 사용합니다.

```shell
$ litellm --model huggingface/bigcode/starcoder --detailed_debug
```
:::

### 테스트
새 shell에서 아래 명령을 실행합니다. 이 명령은 `openai.chat.completions` 요청을 보냅니다. `openai` v1.0.0 이상을 사용 중인지 확인하세요.
```shell
litellm --test
```

이제 `gpt-3.5-turbo`로 들어오는 요청은 Hugging Face 추론 엔드포인트에 호스팅된 `bigcode/starcoder`로 자동 라우팅됩니다.

### 지원 LLM
LiteLLM이 지원하는 모든 LLM은 Proxy에서도 사용할 수 있습니다. 전체 목록은 [지원 LLM](https://docs.litellm.ai/docs/providers)을 확인하세요.
<Tabs>
<TabItem value="bedrock" label="AWS Bedrock">

```shell
$ export AWS_ACCESS_KEY_ID=
$ export AWS_REGION_NAME=
$ export AWS_SECRET_ACCESS_KEY=
```

```shell
$ litellm --model bedrock/anthropic.claude-v2
```
</TabItem>
<TabItem value="azure" label="Azure OpenAI">

```shell
$ export AZURE_API_KEY=my-api-key
$ export AZURE_API_BASE=my-api-base
```
```
$ litellm --model azure/my-deployment-name
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```shell
$ export OPENAI_API_KEY=my-api-key
```

```shell
$ litellm --model gpt-3.5-turbo
```
</TabItem>
<TabItem value="ollama" label="Ollama">

```
$ litellm --model ollama/<ollama-model-name>
```

</TabItem>
<TabItem value="openai-proxy" label="OpenAI 호환 엔드포인트">

```shell
$ export OPENAI_API_KEY=my-api-key
```

```shell
$ litellm --model openai/<your model name> --api_base <your-api-base> # e.g. http://0.0.0.0:3000
```
</TabItem>

<TabItem value="vertex-ai" label="Vertex AI [Gemini]">

```shell
$ export VERTEX_PROJECT="hardy-project"
$ export VERTEX_LOCATION="us-west"
```

```shell
$ litellm --model vertex_ai/gemini-pro
```
</TabItem>

<TabItem value="huggingface" label="Huggingface (TGI) 배포형">

```shell
$ export HUGGINGFACE_API_KEY=my-api-key #[OPTIONAL]
```
```shell
$ litellm --model huggingface/<your model name> --api_base <your-api-base> # e.g. http://0.0.0.0:3000
```

</TabItem>
<TabItem value="huggingface-local" label="Huggingface (TGI) 로컬">

```shell
$ litellm --model huggingface/<your model name> --api_base http://0.0.0.0:8001
```

</TabItem>
<TabItem value="aws-sagemaker" label="AWS Sagemaker">

```shell
export AWS_ACCESS_KEY_ID=
export AWS_REGION_NAME=
export AWS_SECRET_ACCESS_KEY=
```

```shell
$ litellm --model sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```shell
$ export ANTHROPIC_API_KEY=my-api-key
```
```shell
$ litellm --model claude-instant-1
```

</TabItem>
<TabItem value="vllm-local" label="VLLM">
로컬에서 vLLM을 실행 중이라고 가정합니다.

```shell
$ litellm --model vllm/facebook/opt-125m
```
</TabItem>
<TabItem value="together_ai" label="TogetherAI">

```shell
$ export TOGETHERAI_API_KEY=my-api-key
```
```shell
$ litellm --model together_ai/lmsys/vicuna-13b-v1.5-16k
```

</TabItem>

<TabItem value="replicate" label="Replicate">

```shell
$ export REPLICATE_API_KEY=my-api-key
```
```shell
$ litellm \
  --model replicate/meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3
```

</TabItem>

<TabItem value="petals" label="Petals">

```shell
$ litellm --model petals/meta-llama/Llama-2-70b-chat-hf
```

</TabItem>

<TabItem value="palm" label="Palm">

```shell
$ export PALM_API_KEY=my-palm-key
```
```shell
$ litellm --model palm/chat-bison
```

</TabItem>

<TabItem value="ai21" label="AI21">

```shell
$ export AI21_API_KEY=my-api-key
```

```shell
$ litellm --model j2-light
```

</TabItem>

<TabItem value="cohere" label="Cohere">

```shell
$ export COHERE_API_KEY=my-api-key
```

```shell
$ litellm --model command-nightly
```

</TabItem>

</Tabs>

## 빠른 시작 - LiteLLM Proxy + Config.yaml
config를 사용하면 모델 목록을 만들고 `api_base`, `max_tokens`(모든 litellm 파라미터)를 설정할 수 있습니다. config에 대한 자세한 내용은 [여기](https://docs.litellm.ai/docs/proxy/configs)를 확인하세요.

### LiteLLM Proxy용 config 만들기
예시 config

```yaml
model_list: 
  - model_name: gpt-3.5-turbo # user-facing model alias
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: azure/<your-deployment-name>
      api_base: <your-azure-api-endpoint>
      api_key: <your-azure-api-key>
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
  - model_name: vllm-model
    litellm_params:
      model: openai/<your-model-name>
      api_base: <your-vllm-api-base> # e.g. http://0.0.0.0:3000/v1
      api_key: <your-vllm-api-key|none>
```

### config로 proxy 실행

```shell
litellm --config your_config.yaml
```


## LiteLLM Proxy 사용 - Curl 요청, OpenAI 패키지, Langchain

:::info
LiteLLM은 OpenAI SDK, Anthropic SDK, Mistral SDK, LLamaIndex, Langchain(JS, Python)을 포함한 여러 SDK와 호환됩니다.

[더 많은 예시는 여기](user_keys)를 확인하세요.
:::

<Tabs>
<TabItem value="Curl" label="Curl 요청">

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

# request sent to model set on litellm proxy, `litellm --model`
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
<TabItem value="langchain-embedding" label="Langchain 임베딩">

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="sagemaker-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")


text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"SAGEMAKER EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"BEDROCK EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-titan-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"TITAN EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
<TabItem value="litellm" label="LiteLLM SDK">

이 방식은 **권장하지 않습니다**. proxy도 SDK를 사용하므로 로직이 중복되어 예상치 못한 오류가 발생할 수 있습니다.

```python
from litellm import completion 

response = completion(
    model="openai/gpt-3.5-turbo", 
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ], 
    api_key="anything", 
    base_url="http://0.0.0.0:4000"
    )

print(response)

```
</TabItem>

<TabItem value="anthropic-py" label="Anthropic Python SDK">

```python
import os

from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:4000", # proxy endpoint
    api_key="sk-test-proxy-key-123", # litellm proxy virtual key (example)
)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
    model="claude-3-opus-20240229",
)
print(message.content)
```

</TabItem>

</Tabs>

[**자세한 정보**](./configs.md)



## 📖 Proxy 엔드포인트 - [Swagger 문서](https://litellm-api.up.railway.app/)
- POST `/chat/completions` - 100개 이상의 LLM을 호출하는 chat completions 엔드포인트
- POST `/completions` - completions 엔드포인트
- POST `/embeddings` - Azure, OpenAI, Huggingface 엔드포인트용 embedding 엔드포인트
- GET `/models` - 서버에서 사용 가능한 모델
- POST `/key/generate` - proxy에 접근할 키 생성


## Proxy 디버깅

일반 작업 중 발생하는 이벤트
```shell
litellm --model gpt-3.5-turbo --debug
```

자세한 정보
```shell
litellm --model gpt-3.5-turbo --detailed_debug
```

### 환경 변수로 디버그 수준 설정

일반 작업 중 발생하는 이벤트
```shell
export LITELLM_LOG=INFO
```

자세한 정보
```shell
export LITELLM_LOG=DEBUG
```

로그 없음
```shell
export LITELLM_LOG=None
```
