import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# IBM watsonx.ai

LiteLLM은 모든 IBM [watsonx.ai](https://watsonx.ai/) 파운데이션 모델과 임베딩을 지원합니다.

## 환경 변수 {#environment-variables}
```python
os.environ["WATSONX_URL"] = ""  # (required) Base URL of your WatsonX instance
# (required) either one of the following:
os.environ["WATSONX_APIKEY"] = "" # IBM cloud API key
os.environ["WATSONX_TOKEN"] = "" # IAM auth token
# optional - can also be passed as params to completion() or embedding()
os.environ["WATSONX_PROJECT_ID"] = "" # Project ID of your WatsonX instance
os.environ["WATSONX_DEPLOYMENT_SPACE_ID"] = "" # ID of your deployment space to use deployed models
os.environ["WATSONX_ZENAPIKEY"] = "" # Zen API key (use for long-term api token)
```

watsonx.ai 인증에 사용할 액세스 토큰을 가져오는 방법은 [여기](https://cloud.ibm.com/apidocs/watsonx-ai#api-authentication)를 참고하세요.

## 사용법

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_IBM_Watsonx.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

```python showLineNumbers title="Chat Completion"
import os
from litellm import completion

os.environ["WATSONX_URL"] = ""
os.environ["WATSONX_APIKEY"] = ""

response = completion(
  model="watsonx/meta-llama/llama-3-1-8b-instruct",
  messages=[{ "content": "what is your favorite colour?","role": "user"}],
  project_id="<my-project-id>"
)
```

## 스트리밍 사용법 {#사용법---streaming}
```python showLineNumbers title="Streaming"
import os
from litellm import completion

os.environ["WATSONX_URL"] = ""
os.environ["WATSONX_APIKEY"] = ""
os.environ["WATSONX_PROJECT_ID"] = ""

response = completion(
  model="watsonx/meta-llama/llama-3-1-8b-instruct",
  messages=[{ "content": "what is your favorite colour?","role": "user"}],
  stream=True
)
for chunk in response:
  print(chunk)
```

## deployment space 모델 사용법 {#deployment-space-models}

deployment space에 배포된 모델(예: 튜닝된 모델)은 `deployment/<deployment_id>` 형식으로 호출할 수 있습니다.

```python showLineNumbers title="Deployment Space"
import litellm

response = litellm.completion(
    model="watsonx/deployment/<deployment_id>",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    space_id="<deployment_space_id>"
)
```

## 임베딩 사용법 {#사용법---embeddings}

```python showLineNumbers title="Embeddings"
from litellm import embedding

response = embedding(
    model="watsonx/ibm/slate-30m-english-rtrvr",
    input=["What is the capital of France?"],
    project_id="<my-project-id>"
)
```

## LiteLLM Proxy 사용법 

### 1. 환경에 키 저장 {#1-save-keys-in-your-environment}

```bash
export WATSONX_URL=""
export WATSONX_APIKEY=""
export WATSONX_PROJECT_ID=""
```

### 2. 프록시 시작 

<Tabs>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model watsonx/meta-llama/llama-3-8b-instruct
```

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-3-8b
    litellm_params:
      model: watsonx/meta-llama/llama-3-8b-instruct
      api_key: "os.environ/WATSONX_API_KEY"
```
</TabItem>
</Tabs>

### 3. 테스트 {#3-test-it}


<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
      "model": "llama-3-8b",
      "messages": [
        {
          "role": "user",
          "content": "what is your favorite colour?"
        }
      ]
    }'
```
</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama-3-8b", 
    messages=[{"role": "user", "content": "what is your favorite colour?"}]
)
print(response)
```
</TabItem>
</Tabs>


## 지원 모델 {#supported-모델}

| 모델 이름                          | 명령                                                                                     |
|------------------------------------|------------------------------------------------------------------------------------------|
| `Llama 3.1 8B Instruct`              | `completion(model="watsonx/meta-llama/llama-3-1-8b-instruct", messages=messages)`        |
| `Llama 2 70B Chat`                   | `completion(model="watsonx/meta-llama/llama-2-70b-chat", messages=messages)`             |
| `Granite 13B Chat V2`                | `completion(model="watsonx/ibm/granite-13b-chat-v2", messages=messages)`                 |
| `Mixtral 8X7B Instruct`              | `completion(model="watsonx/ibm-mistralai/mixtral-8x7b-instruct-v01-q", messages=messages)` |

사용 가능한 모든 모델은 [watsonx.ai 문서](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-models.html?context=wx)를 참고하세요.

## 지원 임베딩 모델 {#supported-embedding-모델}

| 모델 이름  | 함수 호출                                                              |
|------------|------------------------------------------------------------------------|
| Slate 30m  | `embedding(model="watsonx/ibm/slate-30m-english-rtrvr", input=input)`  |
| Slate 125m | `embedding(model="watsonx/ibm/slate-125m-english-rtrvr", input=input)` |

사용 가능한 모든 임베딩 모델은 [watsonx.ai embedding 문서](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/fm-models-embed.html?context=wx)를 참고하세요.


## 고급 {#advanced}

### Zen API Key 사용 {#using-zen-api-key}

IAM 토큰을 생성하는 대신 장기 인증용 Zen API key를 사용할 수 있습니다. 환경 변수 또는 파라미터로 전달하세요.

```python
import os
from litellm import completion

# Option 1: Set as environment variable
os.environ["WATSONX_ZENAPIKEY"] = "your-zen-api-key"

response = completion(
    model="watsonx/ibm/granite-13b-chat-v2",
    messages=[{"content": "What is your favorite color?", "role": "user"}],
    project_id="your-project-id"
)

# Option 2: Pass as parameter
response = completion(
    model="watsonx/ibm/granite-13b-chat-v2",
    messages=[{"content": "What is your favorite color?", "role": "user"}],
    zen_api_key="your-zen-api-key",
    project_id="your-project-id"
)
```

**OpenAI client를 통해 LiteLLM Proxy와 함께 사용:**

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",  # LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="watsonx/ibm/granite-3-3-8b-instruct",
    messages=[{"role": "user", "content": "What is your favorite color?"}],
    max_tokens=2048,
    extra_body={
        "project_id": "your-project-id",
        "zen_api_key": "your-zen-api-key"
    }
)
```

Zen API key 생성에 대한 자세한 내용은 [IBM 문서](https://www.ibm.com/docs/en/watsonx/w-and-w/2.2.0?topic=keys-generating-zenapikey-authorization-tokens)를 참고하세요.
