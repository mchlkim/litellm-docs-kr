import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Infinity

| 속성                      | 세부 정보                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 설명                      | Infinity는 text-embeddings, reranking 모델, clip을 제공하는 고처리량, 저지연 REST API입니다.               |
| LiteLLM Provider 경로     | `infinity/`                                                                                                |
| 지원 작업                 | `/rerank`, `/embeddings`                                                                                   |
| Provider 문서 링크        | [Infinity ↗](https://github.com/michaelfeil/infinity)                                                      |

## **사용법 - LiteLLM Python SDK**

```python
from litellm import rerank, embedding
import os

os.environ["INFINITY_API_BASE"] = "http://localhost:8080"

response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
)
```

## **사용법 - LiteLLM Proxy**

LiteLLM은 Rerank 호출을 위해 Cohere API와 호환되는 `/rerank` 엔드포인트를 제공합니다.

**설정**

LiteLLM Proxy `config.yaml`에 다음을 추가하세요.

```yaml
model_list:
  - model_name: custom-infinity-rerank
    litellm_params:
      model: infinity/rerank
      api_base: https://localhost:8080
      api_key: os.environ/INFINITY_API_KEY
```

LiteLLM을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

## 테스트 요청:

### Rerank

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
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

#### 지원되는 Cohere Rerank API 파라미터

| 파라미터           | 타입        | 설명                                            |
| ------------------ | ----------- | ----------------------------------------------- |
| `query`            | `str`       | 문서를 rerank할 때 기준으로 사용할 쿼리         |
| `documents`        | `list[str]` | rerank할 문서                                   |
| `top_n`            | `int`       | 반환할 문서 수                                  |
| `return_documents` | `bool`      | 응답에 문서를 포함해 반환할지 여부              |

### 사용법 - Return Documents {#usage---returning-documents}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
    return_documents=True,
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
    "query": "What is the capital of France?",
    "documents": [
        "Paris",
        "London",
        "Berlin",
        "Madrid"
    ],
    "return_documents": True,
  }'
```

</TabItem>
</Tabs>

## Provider별 파라미터 전달

매핑되지 않은 모든 파라미터는 provider에 그대로 전달됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["INFINITY_API_BASE"] = "http://localhost:8080"

response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
    raw_scores=True, # 👈 PROVIDER-SPECIFIC PARAM
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: custom-infinity-rerank
    litellm_params:
      model: infinity/rerank
      api_base: https://localhost:8080
      raw_scores: True # 👈 EITHER SET PROVIDER-SPECIFIC PARAMS HERE OR IN REQUEST BODY
```

2. LiteLLM 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "raw_scores": True # 👈 PROVIDER-SPECIFIC PARAM
  }'
```

</TabItem>

</Tabs>

## Embeddings

LiteLLM은 embedding 호출을 위해 OpenAI API와 호환되는 `/embeddings` 엔드포인트를 제공합니다.

**설정**

LiteLLM Proxy `config.yaml`에 다음을 추가하세요.

```yaml
model_list:
  - model_name: custom-infinity-embedding
    litellm_params:
      model: infinity/provider/custom-embedding-v1
      api_base: http://localhost:8080
      api_key: os.environ/INFINITY_API_KEY
```

### 테스트 요청:

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-embedding",
    "input": ["hello"]
  }'
```

#### 지원되는 Embedding API 파라미터

| 파라미터          | 타입        | 설명                                                        |
| ----------------- | ----------- | ----------------------------------------------------------- |
| `model`           | `str`       | 사용할 embedding 모델                                       |
| `input`           | `list[str]` | embedding을 생성할 텍스트 입력                              |
| `encoding_format` | `str`       | embedding을 반환할 형식(예: "float", "base64")             |
| `modality`        | `str`       | 입력 타입(예: "text", "image", "audio")                   |

### 사용법 - Basic 예제

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ["INFINITY_API_BASE"] = "http://localhost:8080"

response = embedding(
    model="infinity/bge-small",
    input=["good morning from litellm"]
)

print(response.data[0]['embedding'])
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-embedding",
    "input": ["hello"]
  }'
```

</TabItem>
</Tabs>

### 사용법 - OpenAI Client

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from openai import OpenAI

client = OpenAI(
  api_key="<LITELLM_MASTER_KEY>",
  base_url="<LITELLM_URL>"
)

response = client.embeddings.create(
  model="bge-small",
  input=["The food was delicious and the waiter..."],
  encoding_format="float"
)

print(response.data[0].embedding)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bge-small",
    "input": ["The food was delicious and the waiter..."],
    "encoding_format": "float"
  }'
```

</TabItem>
</Tabs>
