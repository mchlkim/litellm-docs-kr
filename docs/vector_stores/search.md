import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /vector_stores/search - 벡터 스토어 검색

쿼리와 파일 속성 필터를 기준으로 벡터 스토어에서 관련 청크를 검색합니다. 검색 증강 생성(RAG) 사용 사례에 유용합니다.

## 개요

| 기능 | 지원 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 검색 작업별로 추적됩니다 |
| 로깅 | ✅ | 모든 통합에서 작동합니다 |
| 최종 사용자 추적 | ✅ | |
| 지원 LLM 제공자 | **OpenAI, Azure OpenAI, Bedrock, Vertex RAG Engine, Azure AI, Milvus, Gemini** | 제공자 전반에서 전체 벡터 스토어 API를 지원합니다 |

## 사용법

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

#### 비스트리밍 예제
```python showLineNumbers title="Search Vector Store - Basic"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?"
)
print(response)
```

#### 동기 예제
```python showLineNumbers title="Search Vector Store - Sync"
import litellm

response = litellm.vector_stores.search(
    vector_store_id="vs_abc123",
    query="What is the capital of France?"
)
print(response)
```

</TabItem>

<TabItem value="advanced" label="고급 설정">

#### 필터와 순위 옵션 사용
```python showLineNumbers title="Search Vector Store - Advanced"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    filters={
        "file_ids": ["file-abc123", "file-def456"]
    },
    max_num_results=5,
    ranking_options={
        "score_threshold": 0.7
    },
    rewrite_query=True
)
print(response)
```

</TabItem>

<TabItem value="multiple-queries" label="여러 쿼리">

#### 여러 쿼리로 검색
```python showLineNumbers title="Search Vector Store - Multiple Queries"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query=[
        "What is the capital of France?",
        "What is the population of Paris?"
    ],
    max_num_results=10
)
print(response)
```

</TabItem>

<TabItem value="openai-provider" label="OpenAI 제공자">

#### OpenAI 제공자를 명시적으로 사용
```python showLineNumbers title="Search Vector Store - OpenAI Provider"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    custom_llm_provider="openai"
)
print(response)
```

</TabItem>

<TabItem value="azure-ai-provider" label="Azure AI 제공자">

#### Azure AI Search 사용
```python showLineNumbers title="Search Vector Store - Azure AI Provider"
import litellm
import os

# Set credentials
os.environ["AZURE_SEARCH_API_KEY"] = "your-search-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)
print(response)
```

[전체 Azure AI 벡터 스토어 문서 보기](../providers/azure_ai_vector_stores.md)

</TabItem>

<TabItem value="milvus-provider" label="Milvus 제공자">

#### Milvus 사용
```python showLineNumbers title="Search Vector Store - Milvus Provider"
import litellm
import os

# Set credentials
os.environ["MILVUS_API_KEY"] = "your-milvus-api-key"
os.environ["MILVUS_API_BASE"] = "https://your-milvus-instance.milvus.io"

response = await litellm.vector_stores.asearch(
    vector_store_id="my-collection-name",
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
    },
    milvus_text_field="book_intro",
    api_key=os.getenv("MILVUS_API_KEY"),
)
print(response)
```

[전체 Milvus 벡터 스토어 문서 보기](../providers/milvus_vector_stores.md)

</TabItem>

<TabItem value="gemini-provider" label="Gemini 제공자">

#### Gemini File Search 사용
```python showLineNumbers title="Search Vector Store - Gemini Provider"
import litellm
import os

# Set credentials
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is the capital of France?",
    custom_llm_provider="gemini",
    max_num_results=5
)
print(response)
```

**메타데이터 필터 사용:**
```python showLineNumbers title="Search with Metadata Filter"
response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is LiteLLM?",
    custom_llm_provider="gemini",
    filters={"author": "John Doe", "category": "documentation"},
    max_num_results=5
)
print(response)
```

[전체 Gemini File Search 문서 보기](../providers/gemini_file_search.md)

</TabItem>
</Tabs>

### LiteLLM Proxy Server 사용 {#litellm-proxy-server}

<Tabs>
<TabItem value="proxy-setup" label="설정 및 사용법">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  # Vector store settings can be added here if needed
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. OpenAI SDK로 테스트합니다

```python showLineNumbers title="OpenAI SDK via LiteLLM Proxy"
from openai import OpenAI

# Point OpenAI SDK to LiteLLM proxy
client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # Your LiteLLM API key
)

search_results = client.beta.vector_stores.search(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    max_num_results=5
)
print(search_results)
```

</TabItem>

<TabItem value="curl-proxy" label="curl">

```bash showLineNumbers title="Search Vector Store via curl"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores/vs_abc123/search' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "query": "What is the capital of France?",
  "filters": {
    "file_ids": ["file-abc123", "file-def456"]
  },
  "max_num_results": 5,
  "ranking_options": {
    "score_threshold": 0.7
  },
  "rewrite_query": true
}'
```

</TabItem>
</Tabs>

## 벡터 스토어 설정

벡터 스토어 검색을 사용하려면 `vector_store_registry`에서 벡터 스토어를 구성합니다. 다음 내용은 [벡터 스토어 설정 가이드](../completion/knowledgebase.md)를 참고하세요.

- 제공자별 구성(Bedrock, OpenAI, Azure, Vertex AI, PG Vector)
- Python SDK 및 Proxy 설정 예제
- 인증 및 자격 증명 관리

## Chat Completions에서 벡터 스토어 사용

<span>관련 컨텍스트를 자동으로 검색하려면 <code>vector_store_ids</code>를 Chat Completion 요청에 전달합니다. 구현 세부 정보는 <a href="../completion/knowledgebase.md#2-make-a-request-with-vector_store_ids-parameter">Chat Completions에서 벡터 스토어 사용</a>을 참고하세요.</span>
