import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /vector_stores - 벡터 저장소 생성 {#vector-stores-create-vector-store}

검색 증강 생성(RAG) 사용 사례에서 문서 청크를 저장하고 검색하는 데 사용할 수 있는 벡터 저장소를 생성합니다.

## 개요

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 벡터 저장소 작업별로 추적됨 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ✅ | |
| 지원 LLM 제공자(OpenAI `/vector_stores` API) | **OpenAI** | 제공자 전반에서 전체 벡터 저장소 API 지원 |
| 지원 LLM 제공자(Passthrough API) | [**Azure AI**](/litellm-docs-kr/docs/providers/azure_ai/azure_ai_vector_stores_passthrough) | 제공자 전반에서 전체 벡터 저장소 API 지원 |
| 지원 LLM 제공자(데이터셋 관리) | [**RAGFlow**](/litellm-docs-kr/docs/providers/ragflow_vector_store.md) | 데이터셋 생성 및 관리(검색은 지원되지 않음) |

## 사용법

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

#### 비동기 예제 {#async-example}
```python showLineNumbers title="Create Vector Store - Basic"
import litellm

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(response)
```

#### 동기 예제 {#sync-example}
```python showLineNumbers title="Create Vector Store - Sync"
import litellm

response = litellm.vector_stores.create(
    name="My Document Store", 
    file_ids=["file-abc123", "file-def456"]
)
print(response)
```

</TabItem>

<TabItem value="advanced" label="고급 설정">

#### 만료 및 청킹 전략 사용 {#with-expiration-and-chunking-strategy}
```python showLineNumbers title="Create Vector Store - Advanced"
import litellm

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"],
    expires_after={
        "anchor": "last_active_at",
        "days": 7
    },
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,
            "chunk_overlap_tokens": 400
        }
    },
    metadata={
        "project": "rag-system",
        "environment": "production"
    }
)
print(response)
```

</TabItem>

<TabItem value="openai-provider" label="OpenAI 제공자">

#### OpenAI 제공자 명시적으로 사용 {#using-openai-provider-explicitly}
```python showLineNumbers title="Create Vector Store - OpenAI Provider"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.vector_stores.acreate(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"],
    custom_llm_provider="openai"
)
print(response)
```

</TabItem>
</Tabs>

### LiteLLM Proxy 서버 {#litellm-proxy-server}

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

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. OpenAI SDK로 테스트합니다.

```python showLineNumbers title="OpenAI SDK via LiteLLM Proxy"
from openai import OpenAI

# Point OpenAI SDK to LiteLLM proxy
client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # Your LiteLLM API key
)

vector_store = client.beta.vector_stores.create(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(vector_store)
```

</TabItem>

<TabItem value="curl-proxy" label="curl">

```bash showLineNumbers title="Create Vector Store via curl"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "name": "My Document Store",
  "file_ids": ["file-abc123", "file-def456"],
  "expires_after": {
    "anchor": "last_active_at", 
    "days": 7
  },
  "chunking_strategy": {
    "type": "static",
    "static": {
      "max_chunk_size_tokens": 800,
      "chunk_overlap_tokens": 400
    }
  },
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}'
```

</TabItem>
</Tabs>

### OpenAI SDK(독립 실행) {#openai-sdk-standalone}

<Tabs>
<TabItem value="openai-direct" label="직접 OpenAI 사용법">

```python showLineNumbers title="OpenAI SDK Direct"
from openai import OpenAI

client = OpenAI(api_key="your-openai-api-key")

vector_store = client.beta.vector_stores.create(
    name="My Document Store",
    file_ids=["file-abc123", "file-def456"]
)
print(vector_store)
```

</TabItem>
</Tabs>

## 요청 형식

요청 본문은 OpenAI 벡터 저장소 API 형식을 따릅니다.

#### 예제 요청 본문 {#example-request-body}

```json
{
  "name": "My Document Store",
  "file_ids": ["file-abc123", "file-def456"],
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "chunking_strategy": {
    "type": "static",
    "static": {
      "max_chunk_size_tokens": 800,
      "chunk_overlap_tokens": 400
    }
  },
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}
```

#### 선택 필드 {#optional-fields}
- **name** (문자열): 벡터 저장소의 이름입니다.
- **file_ids** (문자열 배열): 벡터 저장소가 사용할 파일 ID 목록입니다. 파일에 접근할 수 있는 `file_search` 같은 도구에 유용합니다.
- **expires_after** (객체): 벡터 저장소의 만료 정책입니다.
  - **anchor** (문자열): 만료 정책이 적용되는 기준 타임스탬프입니다. 지원되는 anchor는 `last_active_at`입니다.
  - **days** (정수): 기준 시간 이후 벡터 저장소가 만료될 때까지의 일수입니다.
- **chunking_strategy** (객체): 파일을 청크로 나누는 데 사용하는 청킹 전략입니다. 설정하지 않으면 `auto` 전략을 사용합니다.
  - **type** (문자열): 항상 `static`입니다.
  - **static** (객체): 정적 청킹 전략입니다.
    - **max_chunk_size_tokens** (정수): 각 청크의 최대 토큰 수입니다. 기본값은 `800`입니다. 최솟값은 `100`이고 최댓값은 `4096`입니다.
    - **chunk_overlap_tokens** (정수): 청크 간에 겹치는 토큰 수입니다. 기본값은 `400`입니다.
- **metadata** (객체): 객체에 연결할 수 있는 16개의 key-value 쌍 집합입니다. 객체에 대한 추가 정보를 구조화된 형식으로 저장할 때 유용합니다. 키는 최대 64자, 값은 최대 512자까지 가능합니다.

## 응답 형식

#### 예제 응답 {#example-response}

```json
{
  "id": "vs_abc123",
  "object": "vector_store",
  "created_at": 1699061776,
  "name": "My Document Store",
  "bytes": 139920,
  "file_counts": {
    "in_progress": 0,
    "completed": 2,
    "failed": 0,
    "cancelled": 0,
    "total": 2
  },
  "status": "completed",
  "expires_after": {
    "anchor": "last_active_at",
    "days": 7
  },
  "expires_at": null,
  "last_active_at": 1699061776,
  "metadata": {
    "project": "rag-system",
    "environment": "production"
  }
}
```

#### 응답 필드 {#response-fields}

- **id** (문자열): API 엔드포인트에서 참조할 수 있는 식별자입니다.
- **object** (문자열): 객체 유형이며 항상 `vector_store`입니다.
- **created_at** (정수): 벡터 저장소가 생성된 시점의 Unix 타임스탬프(초)입니다.
- **name** (문자열): 벡터 저장소의 이름입니다.
- **bytes** (정수): 벡터 저장소의 파일이 사용하는 총 바이트 수입니다.
- **file_counts** (객체): 벡터 저장소의 파일 수입니다.
  - **in_progress** (정수): 현재 처리 중인 파일 수입니다.
  - **completed** (정수): 성공적으로 처리된 파일 수입니다.
  - **failed** (정수): 처리에 실패한 파일 수입니다.
  - **cancelled** (정수): 취소된 파일 수입니다.
  - **total** (정수): 전체 파일 수입니다.
- **status** (문자열): 벡터 저장소의 상태이며 `expired`, `in_progress`, `completed` 중 하나입니다. `completed` 상태는 벡터 저장소를 사용할 준비가 되었음을 나타냅니다.
- **expires_after** (객체 또는 null): 벡터 저장소의 만료 정책입니다.
- **expires_at** (정수 또는 null): 벡터 저장소가 만료될 시점의 Unix 타임스탬프(초)입니다.
- **last_active_at** (정수 또는 null): 벡터 저장소가 마지막으로 활성 상태였던 시점의 Unix 타임스탬프(초)입니다.
- **metadata** (객체 또는 null): 객체에 연결할 수 있는 16개의 key-value 쌍 집합입니다.

## Mock 응답 테스트 {#mock-response-testing}

테스트 목적으로 mock 응답을 사용할 수 있습니다.

```python showLineNumbers title="Mock Response Example"
import litellm

# Mock response for testing
mock_response = {
    "id": "vs_mock123",
    "object": "vector_store", 
    "created_at": 1699061776,
    "name": "Mock Vector Store",
    "bytes": 0,
    "file_counts": {
        "in_progress": 0,
        "completed": 0,
        "failed": 0,
        "cancelled": 0,
        "total": 0
    },
    "status": "completed"
}

response = await litellm.vector_stores.acreate(
    name="Test Store",
    mock_response=mock_response
)
print(response)
``` 
