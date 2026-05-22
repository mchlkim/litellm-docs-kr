# Voyage AI
https://docs.voyageai.com/embeddings/

## API Key
```python
# env variable
os.environ['VOYAGE_API_KEY']
```

## Sample 사용법 - Embedding
```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = ""
response = embedding(
    model="voyage/voyage-3.5",
    input=["good morning from litellm"],
)
print(response)
```

## 지원 파라미터

VoyageAI embeddings는 다음 optional parameter를 지원합니다.

- `input_type`: retrieval optimization에 사용할 input 유형을 지정합니다.
  - `"query"`: search query에 사용합니다.
  - `"document"`: index 대상 document에 사용합니다.
- `dimensions`: output embedding dimension(256, 512, 1024 또는 2048)
- `encoding_format`: 출력 format(`"float"`, `"int8"`, `"uint8"`, `"binary"`, `"ubinary"`)
- `truncation`: max token을 초과하는 input을 truncate할지 여부(default: `True`)

### Parameter 포함 예제

```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = "your-api-key"

# Embedding with custom dimensions and input type
response = embedding(
    model="voyage/voyage-3.5",
    input=["Your text here"],
    dimensions=512,
    input_type="document"
)
print(f"Embedding dimensions: {len(response.data[0]['embedding'])}")
```

## 지원 모델
https://docs.voyageai.com/embeddings/#models-and-specifics 에 나열된 모든 model을 지원합니다.

| 모델명              | 호출                                              |
|-------------------------|------------------------------------------------------------|
| `voyage-3.5`              | `embedding(model="voyage/voyage-3.5", input)`              | 
| `voyage-3.5-lite`         | `embedding(model="voyage/voyage-3.5-lite", input)`         | 
| `voyage-3-large`          | `embedding(model="voyage/voyage-3-large", input)`          | 
| `voyage-3`                | `embedding(model="voyage/voyage-3", input)`                | 
| `voyage-3-lite`           | `embedding(model="voyage/voyage-3-lite", input)`           | 
| `voyage-code-3`           | `embedding(model="voyage/voyage-code-3", input)`           | 
| `voyage-finance-2`        | `embedding(model="voyage/voyage-finance-2", input)`        | 
| `voyage-law-2`            | `embedding(model="voyage/voyage-law-2", input)`            | 
| `voyage-code-2`           | `embedding(model="voyage/voyage-code-2", input)`           | 
| `voyage-multilingual-2`   | `embedding(model="voyage/voyage-multilingual-2	", input)`  | 
| `voyage-large-2-instruct` | `embedding(model="voyage/voyage-large-2-instruct", input)` | 
| `voyage-large-2`          | `embedding(model="voyage/voyage-large-2", input)`          |
| `voyage-2`                | `embedding(model="voyage/voyage-2", input)`                | 
| `voyage-lite-02-instruct` | `embedding(model="voyage/voyage-lite-02-instruct", input)` | 
| `voyage-01`               | `embedding(model="voyage/voyage-01", input)`               | 
| `voyage-lite-01`          | `embedding(model="voyage/voyage-lite-01", input)`          |
| `voyage-lite-01-instruct` | `embedding(model="voyage/voyage-lite-01-instruct", input)` |

## Contextual Embedding 개요 (`voyage-context-3`)

VoyageAI의 `voyage-context-3` model은 주변 document context를 고려해 각 chunk를 embed하는 contextualized chunk embedding을 제공합니다. 표준 context-agnostic embedding과 비교해 retrieval 품질을 크게 개선합니다.

### 주요 장점
- chunk가 전체 document 안에서의 위치와 역할을 반영합니다.
- 긴 document의 retrieval accuracy가 향상됩니다(경쟁 모델 대비 7-23% 우수).
- 모호한 reference와 chunk 간 dependency를 더 잘 처리합니다.
- RAG pipeline에서 표준 embedding을 자연스럽게 대체할 수 있습니다.

### 사용법

Contextual embeddings는 **nested input format**을 필요로 합니다. 각 inner list는 하나의 document에서 나온 chunk를 나타냅니다.

```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = "your-api-key"

# Single document with multiple chunks
response = embedding(
    model="voyage/voyage-context-3",
    input=[
        [
            "Chapter 1: Introduction to AI",
            "This chapter covers the basics of artificial intelligence.",
            "We will explore machine learning and deep learning."
        ]
    ]
)
print(f"Number of chunk groups: {len(response.data)}")

# Multiple documents
response = embedding(
    model="voyage/voyage-context-3",
    input=[
        ["Paris is the capital of France.", "It is known for the Eiffel Tower."],
        ["Tokyo is the capital of Japan.", "It is a major economic hub."]
    ]
)
print(f"Processed {len(response.data)} documents")
```

### 사양
- Model: `voyage-context-3`
- Context length: document당 32,000 tokens
- 출력 차원: 256, 512, 1024(default) 또는 2048
- Max inputs: request당 1,000
- 최대 total tokens: 120,000
- Max chunks: 16,000
- Pricing: million tokens당 $0.18

### Contextual Embeddings 사용 시점

**다음 경우 `voyage-context-3`를 사용하세요.**
- chunk로 나눈 긴 document를 처리할 때
- document structure와 flow가 중요할 때
- section 간 reference가 중요할 때
- document hierarchy를 보존해야 할 때

**다음 경우 standard model(`voyage-3.5`, `voyage-3-large`)을 사용하세요.**
- 독립적인 text 조각을 embed할 때
- 짧은 query를 처리할 때
- document context가 관련 없을 때
- 더 빠르거나 저렴한 처리가 필요할 때

## Model 선택 가이드

| Model | 적합한 용도 | Context Length | Price/M Tokens |
|-------|----------|----------------|----------------|
| voyage-3.5 | 범용, multilingual | 32K | $0.06 |
| voyage-3.5-lite | latency에 민감한 application | 32K | $0.02 |
| voyage-3-large | 전반적으로 가장 높은 품질 | 32K | $0.18 |
| voyage-code-3 | code retrieval 및 search | 32K | $0.18 |
| voyage-finance-2 | 금융 document | 32K | $0.12 |
| voyage-law-2 | 법률 document | 16K | $0.12 |
| voyage-context-3 | contextual document embedding용 | 32K | $0.18 |

## Rerank

Voyage AI는 query와의 관련성에 따라 document를 재정렬해 search relevance를 개선하는 reranking model을 제공합니다.

### 빠른 시작

```python
from litellm import rerank
import os

os.environ["VOYAGE_API_KEY"] = "your-api-key"

response = rerank(
    model="voyage/rerank-2.5",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of England.",
        "Berlin is the capital of Germany.",
    ],
    top_n=3,
)

print(response)
```

### Async 사용법

```python
from litellm import arerank
import os
import asyncio

os.environ["VOYAGE_API_KEY"] = "your-api-key"

async def main():
    response = await arerank(
        model="voyage/rerank-2.5-lite",
        query="Best programming language for beginners?",
        documents=[
            "Python is great for beginners due to simple syntax.",
            "JavaScript runs in browsers and is versatile.",
            "Rust has a steep learning curve but is very safe.",
        ],
        top_n=2,
    )
    print(response)

asyncio.run(main())
```

### LiteLLM Proxy 사용법

`config.yaml`에 추가합니다.

```yaml
model_list:
  - model_name: rerank-2.5
    litellm_params:
      model: voyage/rerank-2.5
      api_key: os.environ/VOYAGE_API_KEY
  - model_name: rerank-2.5-lite
    litellm_params:
      model: voyage/rerank-2.5-lite
      api_key: os.environ/VOYAGE_API_KEY
```

curl로 테스트합니다.

```bash
curl http://localhost:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-2.5",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital of France.",
        "London is the capital of England.",
        "Berlin is the capital of Germany."
    ],
    "top_n": 3
  }'
```

### 지원 Rerank 모델

| Model | Context Length | 설명 | Price/M Tokens |
|-------|----------------|-------------|----------------|
| rerank-2.5 | 32K | 최고 품질, multilingual, instruction-following | $0.05 |
| rerank-2.5-lite | 32K | latency와 cost에 최적화 | $0.02 |
| rerank-2 | 16K | legacy model | $0.05 |
| rerank-2-lite | 8K | legacy model, 더 빠름 | $0.02 |

### 지원 파라미터

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `model` | string | model name(예: `voyage/rerank-2.5`) |
| `query` | string | search query |
| `documents` | list | rerank할 document 목록 |
| `top_n` | int | 반환할 top result 개수 |
| `return_documents` | bool | response에 document text를 포함할지 여부 |
