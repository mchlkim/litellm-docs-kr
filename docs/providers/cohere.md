
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cohere

## API 키

```python
import os 
os.environ["COHERE_API_KEY"] = ""
```

## 사용법

### LiteLLM Python SDK

#### Cohere v2 API (기본값)

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v2 call
response = completion(
    model="cohere_chat/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

#### Cohere v1 API

Cohere v1/chat API를 사용하려면 모델명 앞에 `cohere_chat/v1/`를 붙이세요.

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v1 call
response = completion(
    model="cohere_chat/v1/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

#### 스트리밍

**Cohere v2 스트리밍:**

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v2 streaming
response = completion(
    model="cohere_chat/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

for chunk in response:
    print(chunk)
```


**Cohere v1 스트리밍:**

```python showLineNumbers
from litellm import completion

## set ENV variables
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere v1 streaming
response = completion(
    model="cohere_chat/v1/command-a-03-2025", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

for chunk in response:
    print(chunk)
```


## LiteLLM Proxy 사용법

LiteLLM Proxy Server로 Cohere를 호출하는 방법입니다.

### 1. 환경에 키 저장

```bash
export COHERE_API_KEY="your-api-key"
```

### 2. 프록시 시작 

config.yaml에 사용할 Cohere 모델을 정의하세요.

**Cohere v1 모델의 경우:**
```yaml showLineNumbers
model_list:
  - model_name: command-a-03-2025 
    litellm_params:
      model: cohere_chat/v1/command-a-03-2025
      api_key: "os.environ/COHERE_API_KEY"
```

**Cohere v2 모델의 경우:**
```yaml showLineNumbers
model_list:
  - model_name: command-a-03-2025-v2
    litellm_params:
      model: cohere_chat/command-a-03-2025
      api_key: "os.environ/COHERE_API_KEY"
```

```bash
litellm --config /path/to/config.yaml
```


### 3. 테스트

<Tabs>
<TabItem value="v1-curl" label="Cohere v1 - Curl 요청">

```shell showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <your-litellm-api-key>' \
--data ' {
      "model": "command-a-03-2025",
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
<TabItem value="v2-curl" label="Cohere v2 - Curl 요청">

```shell showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <your-litellm-api-key>' \
--data ' {
      "model": "command-a-03-2025-v2",
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
<TabItem value="v1-openai" label="Cohere v1 - OpenAI SDK">

```python showLineNumbers
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to cohere v1 model
response = client.chat.completions.create(model="command-a-03-2025", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
<TabItem value="v2-openai" label="Cohere v2 - OpenAI SDK">

```python showLineNumbers
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to cohere v2 model
response = client.chat.completions.create(model="command-a-03-2025-v2", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
</Tabs>


## 지원 모델
| 모델명 | 함수 호출 |
|------------|----------------|
| `command-a-03-2025` | `litellm.completion('command-a-03-2025', messages)` |
| `command-r-plus-08-2024` | `litellm.completion('command-r-plus-08-2024', messages)` |  
| `command-r-08-2024` | `litellm.completion('command-r-08-2024', messages)` |
| `command-r-plus` | `litellm.completion('command-r-plus', messages)` |  
| `command-r` | `litellm.completion('command-r', messages)` |
| `command-light` | `litellm.completion('command-light', messages)` |  
| `command-nightly` | `litellm.completion('command-nightly', messages)` |


## Embedding

```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
)
```

### 설정 - v3 모델의 입력 유형
v3 모델에는 필수 파라미터 `input_type`이 있습니다. LiteLLM은 기본값으로 `search_document`를 사용합니다. 다음 네 가지 값 중 하나를 사용할 수 있습니다.

- `input_type="search_document"`: (기본값) 벡터 데이터베이스에 저장하려는 텍스트(문서)에 사용하세요.
- `input_type="search_query"`: 벡터 데이터베이스에서 가장 관련성 높은 문서를 찾기 위한 검색 쿼리에 사용하세요.
- `input_type="classification"`: 임베딩을 분류 시스템의 입력으로 사용할 때 사용하세요.
- `input_type="clustering"`: 임베딩을 텍스트 클러스터링에 사용할 때 사용하세요.

https://txt.cohere.com/introducing-embed-v3/


```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" 
)
```

### 지원 Embedding 모델
| 모델명                    | 함수 호출                                                    |
|--------------------------|--------------------------------------------------------------|
| `embed-english-v3.0`       | `embedding(model="embed-english-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-light-v3.0` | `embedding(model="embed-english-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-v3.0`  | `embedding(model="embed-multilingual-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-light-v3.0` | `embedding(model="embed-multilingual-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-v2.0`       | `embedding(model="embed-english-v2.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-light-v2.0` | `embedding(model="embed-english-light-v2.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-v2.0`  | `embedding(model="embed-multilingual-v2.0", input=["good morning from litellm", "this is another item"])` |

## Rerank 

### 사용법

LiteLLM은 Cohere rerank용 v1 및 v2 클라이언트를 지원합니다. 기본적으로 `rerank` 엔드포인트는 v2 클라이언트를 사용하지만, `v1/rerank`를 명시적으로 호출해 v1 클라이언트를 지정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 사용법">

```python
from litellm import rerank
import os

os.environ["COHERE_API_KEY"] = "sk-.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="cohere/rerank-english-v3.0",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy 사용법">

LiteLLM은 Rerank 호출을 위해 Cohere API와 호환되는 `/rerank` 엔드포인트를 제공합니다.

**설정**

litellm proxy config.yaml에 다음을 추가하세요.

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
  - model_name: rerank-english-v3.0
    litellm_params:
      model: cohere/rerank-english-v3.0
      api_key: os.environ/COHERE_API_KEY
```

litellm 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

테스트 요청

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

</TabItem>
</Tabs>
