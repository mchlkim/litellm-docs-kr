import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# HuggingFace Rerank

HuggingFace Rerank를 사용하면 Hugging Face 인프라나 custom endpoint에 호스팅된 reranking 모델로, 쿼리와의 관련도에 따라 문서를 다시 정렬할 수 있습니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Hugging Face 인프라 또는 custom endpoint에 호스팅된 모델을 사용해 문서를 semantic reranking할 수 있습니다. |
| LiteLLM 제공자 route | 모델 이름의 `huggingface/` |
| 제공자 문서 | [Hugging Face Hub ↗](https://huggingface.co/models?pipeline_tag=sentence-similarity) |

## 빠른 시작

### LiteLLM Python SDK

```python showLineNumbers title="Example using LiteLLM Python SDK"
import litellm
import os

# Set your HuggingFace token
os.environ["HF_TOKEN"] = "hf_xxxxxx"

# Basic rerank usage
response = litellm.rerank(
    model="huggingface/BAAI/bge-reranker-base",
    query="What is the capital of the United States?",
    documents=[
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ],
    top_n=3,
)

print(response)
```

### Custom Endpoint 사용법

```python showLineNumbers title="Using custom HuggingFace endpoint"
import litellm

response = litellm.rerank(
    model="huggingface/BAAI/bge-reranker-base",
    query="hello",
    documents=["hello", "world"],
    top_n=2,
    api_base="https://my-custom-hf-endpoint.com",
    api_key="test_api_key",
)

print(response)
```

### Async 사용법

```python showLineNumbers title="Async rerank example"
import litellm
import asyncio
import os

os.environ["HF_TOKEN"] = "hf_xxxxxx"

async def async_rerank_example():
    response = await litellm.arerank(
        model="huggingface/BAAI/bge-reranker-base",
        query="What is the capital of the United States?",
        documents=[
            "Carson City is the capital city of the American state of Nevada.",
            "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
            "Washington, D.C. is the capital of the United States.",
            "Capital punishment has existed in the United States since before it was a country.",
        ],
        top_n=3,
    )
    print(response)

asyncio.run(async_rerank_example())
```

## LiteLLM Proxy

### 1. config.yaml에 모델 구성 {#configure-your-model-in-configyaml}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml
model_list:
  - model_name: bge-reranker-base
    litellm_params:
      model: huggingface/BAAI/bge-reranker-base
      api_key: os.environ/HF_TOKEN
  - model_name: bge-reranker-large  
    litellm_params:
      model: huggingface/BAAI/bge-reranker-large
      api_key: os.environ/HF_TOKEN
  - model_name: custom-reranker
    litellm_params:
      model: huggingface/BAAI/bge-reranker-base
      api_base: https://my-custom-hf-endpoint.com
      api_key: your-custom-api-key
```

</TabItem>
</Tabs>

### 2. 프록시 시작

```bash
export HF_TOKEN="hf_xxxxxx"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. Rerank 요청 보내기 {#make-rerank-requests}

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/rerank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "bge-reranker-base",
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

<TabItem value="python-sdk" label="Python SDK">

```python
import litellm

# Initialize with your LiteLLM proxy URL
response = litellm.rerank(
    model="bge-reranker-base",
    query="What is the capital of the United States?",
    documents=[
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ],
    top_n=3,
    api_base="http://localhost:4000",
    api_key="your-litellm-api-key"
)

print(response)
```

</TabItem>

<TabItem value="requests" label="Using requests library">

```python
import requests

url = "http://localhost:4000/rerank"
headers = {
    "Authorization": "Bearer your-litellm-api-key",
    "Content-Type": "application/json"
}

data = {
    "model": "bge-reranker-base",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

</TabItem>
</Tabs>



## 설정 옵션 {#configuration-options}

### 인증

#### HuggingFace Token 사용(Serverless) {#using-huggingface-token-serverless}
```python
import os
os.environ["HF_TOKEN"] = "hf_xxxxxx"

# Or pass directly
litellm.rerank(
    model="huggingface/BAAI/bge-reranker-base",
    api_key="hf_xxxxxx",
    # ... other params
)
```

#### Custom Endpoint 사용 {#using-custom-endpoint}
```python
litellm.rerank(
    model="huggingface/BAAI/bge-reranker-base",
    api_base="https://your-custom-endpoint.com",
    api_key="your-custom-key",
    # ... other params
)
```



## 응답 형식

응답은 표준 rerank API 형식을 따릅니다.

```json
{
  "results": [
    {
      "index": 3,
      "relevance_score": 0.999071
    },
    {
      "index": 4,
      "relevance_score": 0.7867867
    },
    {
      "index": 0,
      "relevance_score": 0.32713068
    }
  ],
  "id": "07734bd2-2473-4f07-94e1-0d9f0e6843cf",
  "meta": {
    "api_version": {
      "version": "2",
      "is_experimental": false
    },
    "billed_units": {
      "search_units": 1
    }
  }
}
```
