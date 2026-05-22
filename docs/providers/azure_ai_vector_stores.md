import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Search - Vector Store (통합 API)

LiteLLM의 통합 `/chat/completions` API로 Azure AI Search Vector Stores를 **검색**할 때 사용합니다.

## 빠른 시작

다음 세 가지가 필요합니다.
1. Azure AI Search 서비스
2. 임베딩 모델(쿼리를 벡터로 변환)
3. 벡터 필드가 있는 검색 인덱스

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### 기본 검색

```python
from litellm import vector_stores
import os

# Set your credentials
os.environ["AZURE_SEARCH_API_KEY"] = "your-search-api-key"
os.environ["AZURE_AI_SEARCH_EMBEDDING_API_BASE"] = "your-embedding-endpoint"
os.environ["AZURE_AI_SEARCH_EMBEDDING_API_KEY"] = "your-embedding-api-key"

# Search the vector store
response = vector_stores.search(
    vector_store_id="my-vector-index",  # Your Azure AI Search index name
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)

print(response)
```

### 비동기 검색

```python
from litellm import vector_stores

response = await vector_stores.asearch(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)

print(response)
```

### 고급 옵션

```python
from litellm import vector_stores

response = vector_stores.search(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
    top_k=10,  # Number of results to return
    azure_search_vector_field="contentVector",  # Custom vector field name
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

### 설정 구성

다음을 config.yaml에 추가합니다.

```yaml
vector_store_registry:
  - vector_store_name: "azure-ai-search-litellm-website-knowledgebase"
    litellm_params:
        vector_store_id: "test-litellm-app_1761094730750"
        custom_llm_provider: "azure_ai"
        api_key: os.environ/AZURE_SEARCH_API_KEY
        litellm_embedding_model: "azure/text-embedding-3-large"
        litellm_embedding_config:
            api_base: https://krris-mh44uf7y-eastus2.cognitiveservices.azure.com/
            api_key: os.environ/AZURE_API_KEY
            api_version: "2025-09-01"
```

### 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

### API로 검색

```bash
curl -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-vector-index/search' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "query": "What is the capital of France?",
}'
```

</TabItem>
</Tabs>

## 필수 파라미터

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `vector_store_id` | string | Azure AI Search 인덱스 이름 |
| `custom_llm_provider` | string | `"azure_ai"`로 설정합니다 |
| `azure_search_service_name` | string | Azure AI Search 서비스 이름 |
| `litellm_embedding_model` | string | 쿼리 임베딩을 생성할 모델(예: `"azure/text-embedding-3-large"`) |
| `litellm_embedding_config` | dict | 임베딩 모델 설정(api_base, api_key, api_version) |
| `api_key` | string | Azure AI Search API 키 |

## 지원 기능

| 기능 | 상태 | 참고 |
|---------|--------|-------|
| 로깅 | ✅ 지원됨 | 전체 로깅 지원 사용 가능 |
| 가드레일 | ❌ 아직 지원되지 않음 | 현재 벡터 스토어에서는 가드레일을 지원하지 않습니다 |
| 비용 추적 | ✅ 지원됨 | Azure 기준 비용은 $0입니다 |
| 통합 API | ✅ 지원됨 | OpenAI 호환 `/v1/vector_stores/search` 엔드포인트로 호출합니다 |
| Passthrough | ❌ 아직 지원되지 않음 |  |

## 응답 형식

응답은 표준 LiteLLM 벡터 스토어 형식을 따릅니다.

```json
{
  "object": "vector_store.search_results.page",
  "search_query": "What is the capital of France?",
  "data": [
    {
      "score": 0.95,
      "content": [
        {
          "text": "Paris is the capital of France...",
          "type": "text"
        }
      ],
      "file_id": "doc_123",
      "filename": "Document doc_123",
      "attributes": {
        "document_id": "doc_123"
      }
    }
  ]
}
```

## 작동 방식

검색할 때의 흐름은 다음과 같습니다.

1. LiteLLM이 지정한 임베딩 모델을 사용해 쿼리를 벡터로 변환합니다
2. 해당 벡터를 Azure AI Search로 전송합니다
3. Azure AI Search가 인덱스에서 가장 유사한 문서를 찾습니다
4. 결과가 유사도 점수와 함께 반환됩니다

임베딩 모델은 Azure OpenAI, OpenAI, Bedrock 등 LiteLLM에서 지원하는 어떤 모델이든 사용할 수 있습니다.

## Azure AI Search 인덱스 설정

인덱스에는 벡터 필드가 필요합니다. 예시는 다음과 같습니다.

```json
{
  "name": "my-vector-index",
  "fields": [
    {
      "name": "id",
      "type": "Edm.String",
      "key": true
    },
    {
      "name": "content",
      "type": "Edm.String"
    },
    {
      "name": "contentVector",
      "type": "Collection(Edm.Single)",
      "searchable": true,
      "dimensions": 1536,
      "vectorSearchProfile": "myVectorProfile"
    }
  ]
}
```

벡터 차원은 임베딩 모델과 일치해야 합니다. 예를 들면 다음과 같습니다.
- `text-embedding-3-large`: 1536차원
- `text-embedding-3-small`: 1536차원
- `text-embedding-ada-002`: 1536차원


## 자주 발생하는 문제

**"Failed to generate embedding for query"**

임베딩 모델 설정이 잘못되었습니다. 다음을 확인하세요.
- `litellm_embedding_config`에 올바른 api_base와 api_key가 있는지
- 임베딩 모델 이름이 올바른지
- 자격 증명이 정상적으로 동작하는지

**"Index not found"**

`vector_store_id`가 검색 서비스의 어떤 인덱스와도 일치하지 않습니다. 다음을 확인하세요.
- 인덱스 이름이 올바른지
- 올바른 검색 서비스 이름을 사용 중인지

**"Field 'contentVector' not found"**

인덱스에서 다른 벡터 필드 이름을 사용하고 있습니다. `azure_search_vector_field`로 전달하세요.
