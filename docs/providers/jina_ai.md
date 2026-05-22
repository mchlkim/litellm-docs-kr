import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jina AI
https://jina.ai/embeddings/

지원되는 엔드포인트:
- /embeddings
- /rerank

## API 키 {#api-key}
```python
# env variable
os.environ['JINA_AI_API_KEY']
```

## 샘플 사용법 - Embedding {#sample-usage---embedding}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['JINA_AI_API_KEY'] = ""
response = embedding(
    model="jina_ai/jina-embeddings-v3",
    input=["good morning from litellm"],
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml`에 추가합니다.
```yaml
model_list:
  - model_name: embedding-model
    litellm_params:
      model: jina_ai/jina-embeddings-v3
      api_key: os.environ/JINA_AI_API_KEY
```

2. 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000/
```

3. 테스트합니다.

```bash 
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"input": ["hello world"], "model": "embedding-model"}'
```

</TabItem>
</Tabs>

## 샘플 사용법 - Rerank {#sample-usage---rerank}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["JINA_AI_API_KEY"] = "sk-..."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="jina_ai/jina-reranker-v2-base-multilingual",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml`에 추가합니다.
```yaml
model_list:
  - model_name: rerank-model
    litellm_params:
      model: jina_ai/jina-reranker-v2-base-multilingual
      api_key: os.environ/JINA_AI_API_KEY
```

2. 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash 
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "model": "rerank-model",
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

## 지원되는 모델 {#supported-models}
https://jina.ai/embeddings/ 에 나열된 모든 모델이 지원됩니다.

## 지원되는 선택적 Rerank 파라미터 {#supported-optional-rerank-parameters}

모든 `cohere` rerank 파라미터가 지원됩니다.

## 지원되는 선택적 Embeddings 파라미터 {#supported-optional-embeddings-parameters}

```
dimensions
```

## Provider별 파라미터 {#provider-specific-parameters}

`Jina AI` 전용 파라미터는 `embedding` 또는 `rerank` 함수에 키워드 인수로 전달합니다. 예:

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = embedding(
    model="jina_ai/jina-embeddings-v3",
    input=["good morning from litellm"],
    dimensions=1536,
    my_custom_param="my_custom_value", # any other jina ai specific parameters
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"input": ["good morning from litellm"], "model": "jina_ai/jina-embeddings-v3", "dimensions": 1536, "my_custom_param": "my_custom_value"}'
```

</TabItem>
</Tabs>
