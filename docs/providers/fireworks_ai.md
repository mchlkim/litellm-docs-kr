import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Fireworks AI


:::info
**모든 Fireworks AI 모델을 지원합니다. completion 요청을 보낼 때 `fireworks_ai/`를 prefix로 설정하기만 하면 됩니다.**
:::

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | 프로덕션 준비가 된 복합 AI 시스템을 빌드하기 위한 가장 빠르고 효율적인 추론 엔진입니다. |
| LiteLLM의 Provider Route | `fireworks_ai/` |
| Provider 문서 | [Fireworks AI ↗](https://docs.fireworks.ai/getting-started/introduction) |
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/embeddings`, `/completions`, `/audio/transcriptions`, `/rerank` |


## 개요 {#overview}

이 가이드에서는 LiteLLM을 Fireworks AI와 통합하는 방법을 설명합니다. Fireworks AI에는 주로 세 가지 방식으로 연결할 수 있습니다.

1. <b> Fireworks AI serverless 모델 사용 </b> - Fireworks가 관리하는 모델에 쉽게 연결합니다.
2. <b> 자체 Fireworks 계정의 모델에 연결 </b> - Fireworks 계정 안에서 호스팅되는 모델에 접근합니다.
3. <b> direct-route deployment를 통해 연결 </b> - 특정 Fireworks 인스턴스에 더 유연하고 사용자 지정 가능한 방식으로 연결합니다.


## API 키 {#api-key}
```python
# env variable
os.environ['FIREWORKS_AI_API_KEY']
```

## 샘플 사용법 - Serverless 모델 {#sample-usage---serverless-models}
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/accounts/fireworks/models/llama-v3-70b-instruct", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - Serverless 모델 - Streaming {#sample-usage---serverless-models---streaming}
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/accounts/fireworks/models/llama-v3-70b-instruct", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 샘플 사용법 - 자체 Fireworks 계정의 모델 {#sample-usage---models-on-your-fireworks-account}
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = ""
response = completion(
    model="fireworks_ai/accounts/fireworks/models/YOUR_MODEL_ID", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - Direct-Route Deployment {#sample-usage---direct-route-deployment}
```python
from litellm import completion
import os

os.environ['FIREWORKS_AI_API_KEY'] = "YOUR_DIRECT_API_KEY"
response = completion(
    model="fireworks_ai/accounts/fireworks/models/qwen2p5-coder-7b#accounts/gitlab/deployments/2fb7764c", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
   api_base="https://gitlab-2fb7764c.direct.fireworks.ai/v1"
)
print(response)
```

> **참고:** 위 예시는 chat 인터페이스용입니다. text completion 인터페이스를 사용하려면 model="text-completion-openai/accounts/fireworks/models/qwen2p5-coder-7b#accounts/gitlab/deployments/2fb7764c"를 사용하세요.


## LiteLLM Proxy 사용법 {#usage-with-litellm-proxy}

### 1. config.yaml에 Fireworks AI 모델 설정 {#1-set-fireworks-ai-models-on-configyaml}

```yaml
model_list:
  - model_name: fireworks-llama-v3-70b-instruct
    litellm_params:
      model: fireworks_ai/accounts/fireworks/models/llama-v3-70b-instruct
      api_key: "os.environ/FIREWORKS_AI_API_KEY"
```

### 2. Proxy 시작 {#2-start-proxy}

```
litellm --config config.yaml
```

### 3. 테스트 {#3-test}


<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fireworks-llama-v3-70b-instruct",
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
response = client.chat.completions.create(model="fireworks-llama-v3-70b-instruct", messages = [
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
    model = "fireworks-llama-v3-70b-instruct",
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

## 문서 인라인 처리 {#document-inlining}

LiteLLM은 Fireworks AI 모델의 문서 인라인 처리를 지원합니다. vision 모델은 아니지만 문서, 이미지 등을 파싱해야 하는 모델에 유용합니다.

모델이 vision 모델이 아니면 LiteLLM은 image_url의 url에 `#transform=inline`을 추가합니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/1ae9d45798bdaf8450f2dfdec703369f3d2212b7/litellm/llms/fireworks_ai/chat/transformation.py#L114)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"
os.environ["FIREWORKS_AI_API_BASE"] = "https://audio-prod.api.fireworks.ai/v1"

completion = litellm.completion(
    model="fireworks_ai/accounts/fireworks/models/llama-v3p3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://storage.googleapis.com/fireworks-public/test/sample_resume.pdf"
                    },
                },
                {
                    "type": "text",
                    "text": "What are the candidate's BA and MBA GPAs?",
                },
            ],
        }
    ],
)
print(completion)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: llama-v3p3-70b-instruct
    litellm_params:
      model: fireworks_ai/accounts/fireworks/models/llama-v3p3-70b-instruct
      api_key: os.environ/FIREWORKS_AI_API_KEY
    #   api_base: os.environ/FIREWORKS_AI_API_BASE [OPTIONAL], defaults to "https://api.fireworks.ai/inference/v1"
```

2. Proxy 시작

```
litellm --config config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_API_KEY' \
-d '{"model": "llama-v3p3-70b-instruct", 
    "messages": [        
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://storage.googleapis.com/fireworks-public/test/sample_resume.pdf"
                    },
                },
                {
                    "type": "text",
                    "text": "What are the candidate's BA and MBA GPAs?",
                },
            ],
        }
    ]}'
```

</TabItem>
</Tabs>

### 자동 추가 비활성화 {#disabling-automatic-addition}

image_url의 url에 `#transform=inline`이 자동으로 추가되지 않게 하려면 `FireworksAIConfig` 클래스에서 `auto_add_transform_inline`을 `False`로 설정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
litellm.disable_add_transform_inline_image_block = True
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
    disable_add_transform_inline_image_block: true
```

</TabItem>
</Tabs>

## 추론 노력도 {#reasoning-effort}

`reasoning_effort` 파라미터는 일부 Fireworks AI 모델에서 지원됩니다. 지원되는 모델은 다음과 같습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"

response = completion(
    model="fireworks_ai/accounts/fireworks/models/qwen3-8b",
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ],
    reasoning_effort="low",
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "fireworks_ai/accounts/fireworks/models/qwen3-8b",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

## 지원되는 모델 - 모든 Fireworks AI 모델 지원 {#supported-models---all-fireworks-ai-models-supported}

:::info
모든 Fireworks AI 모델을 지원합니다. completion 요청을 보낼 때 `fireworks_ai/`를 prefix로 설정하기만 하면 됩니다.
:::

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `llama-v3p2-1b-instruct` | `completion(model="fireworks_ai/llama-v3p2-1b-instruct", messages)` |
| `llama-v3p2-3b-instruct` | `completion(model="fireworks_ai/llama-v3p2-3b-instruct", messages)` |
| `llama-v3p2-11b-vision-instruct` | `completion(model="fireworks_ai/llama-v3p2-11b-vision-instruct", messages)` |
| `llama-v3p2-90b-vision-instruct` | `completion(model="fireworks_ai/llama-v3p2-90b-vision-instruct", messages)` |
| `mixtral-8x7b-instruct` | `completion(model="fireworks_ai/mixtral-8x7b-instruct", messages)` | 
| firefunction-v1 | `completion(model="fireworks_ai/firefunction-v1", messages)` |
| llama-v2-70b-chat | `completion(model="fireworks_ai/llama-v2-70b-chat", messages)` |  

## 지원되는 Embedding 모델 {#supported-embedding-models}

:::info
모든 Fireworks AI 모델을 지원합니다. embedding 요청을 보낼 때 `fireworks_ai/`를 prefix로 설정하기만 하면 됩니다.
:::

| 모델 이름            | 함수 호출                                                   |
|-----------------------|-----------------------------------------------------------------|
| `fireworks_ai/nomic-ai/nomic-embed-text-v1.5` | `response = litellm.embedding(model="fireworks_ai/nomic-ai/nomic-embed-text-v1.5", input=input_text)` |
| `fireworks_ai/nomic-ai/nomic-embed-text-v1` | `response = litellm.embedding(model="fireworks_ai/nomic-ai/nomic-embed-text-v1", input=input_text)` |
| `fireworks_ai/WhereIsAI/UAE-Large-V1` | `response = litellm.embedding(model="fireworks_ai/WhereIsAI/UAE-Large-V1", input=input_text)` |
| `fireworks_ai/thenlper/gte-large` | `response = litellm.embedding(model="fireworks_ai/thenlper/gte-large", input=input_text)` |
| `fireworks_ai/thenlper/gte-base` | `response = litellm.embedding(model="fireworks_ai/thenlper/gte-base", input=input_text)` |


## 오디오 전사 {#audio-transcription}

### 빠른 시작 {#quick-start}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import transcription
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"
os.environ["FIREWORKS_AI_API_BASE"] = "https://audio-prod.api.fireworks.ai/v1"

response = transcription(
    model="fireworks_ai/whisper-v3",
    audio=audio_file,
)
```

`.transcription`에서 API Key/API Base를 전달할 수 있습니다.

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: whisper-v3
    litellm_params:
      model: fireworks_ai/whisper-v3
      api_base: https://audio-prod.api.fireworks.ai/v1
      api_key: os.environ/FIREWORKS_API_KEY
    model_info:
      mode: audio_transcription
```

2. Proxy 시작

```
litellm --config config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/audio/transcriptions' \
-H 'Authorization: Bearer sk-1234' \
-F 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
-F 'model="whisper-v3"' \
-F 'response_format="verbose_json"' \
```

</TabItem>
</Tabs>

## Rerank {#rerank}

### 빠른 시작 {#quick-start-1}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["FIREWORKS_AI_API_KEY"] = "YOUR_API_KEY"

query = "What is the capital of France?"
documents = [
    "Paris is the capital and largest city of France, home to the Eiffel Tower and the Louvre Museum.",
    "France is a country in Western Europe known for its wine, cuisine, and rich history.",
    "The weather in Europe varies significantly between northern and southern regions.",
    "Python is a popular programming language used for web development and data science.",
]

response = rerank(
    model="fireworks_ai/fireworks/qwen3-reranker-8b",
    query=query,
    documents=documents,
    top_n=3,
    return_documents=True,
)
print(response)
```

`.rerank`에서 API Key/API Base를 전달할 수 있습니다.

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: qwen3-reranker-8b
    litellm_params:
      model: fireworks_ai/fireworks/qwen3-reranker-8b
      api_key: os.environ/FIREWORKS_API_KEY
    model_info:
      mode: rerank
```

2. Proxy 시작

```
litellm --config config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-reranker-8b",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital and largest city of France, home to the Eiffel Tower and the Louvre Museum.",
        "France is a country in Western Europe known for its wine, cuisine, and rich history.",
        "The weather in Europe varies significantly between northern and southern regions.",
        "Python is a popular programming language used for web development and data science."
    ],
    "top_n": 3,
    "return_documents": true
  }'
```

</TabItem>
</Tabs>

### 지원되는 모델 {#supported-models}

| 모델 이름 | 함수 호출 |
|------------|---------------|
| `fireworks/qwen3-reranker-8b` | `rerank(model="fireworks_ai/fireworks/qwen3-reranker-8b", query=query, documents=documents)` |
