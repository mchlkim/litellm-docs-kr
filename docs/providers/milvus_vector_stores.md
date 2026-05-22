import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Milvus - 벡터 스토어

RAG용 벡터 스토어로 Milvus를 사용합니다.

## 빠른 시작

다음 세 가지가 필요합니다.
1. Milvus 인스턴스(클라우드 또는 자체 호스팅)
2. 임베딩 모델(쿼리를 벡터로 변환)
3. 벡터 필드가 있는 Milvus 컬렉션

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### 기본 검색

```python
from litellm import vector_stores
import os

# Set your credentials
os.environ["MILVUS_API_KEY"] = "your-milvus-api-key"
os.environ["MILVUS_API_BASE"] = "https://your-milvus-instance.milvus.io"

# Search the vector store
response = vector_stores.search(
    vector_store_id="my-collection-name",  # Your Milvus collection name
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
        "api_version": "2025-09-01"
    },
    milvus_text_field="book_intro",  # Field name that contains text content
    api_key=os.getenv("MILVUS_API_KEY"),
)

print(response)
```

### 비동기 검색

```python
from litellm import vector_stores

response = await vector_stores.asearch(
    vector_store_id="my-collection-name",
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
        "api_version": "2025-09-01"
    },
    milvus_text_field="book_intro",
    api_key=os.getenv("MILVUS_API_KEY"),
)

print(response)
```

### 고급 옵션

```python
from litellm import vector_stores

response = vector_stores.search(
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
    # Milvus-specific parameters
    limit=10,  # Number of results to return
    offset=0,  # Pagination offset
    dbName="default",  # Database name
    annsField="book_intro_vector",  # Vector field name
    outputFields=["id", "book_intro", "title"],  # Fields to return
    filter='book_id > 0',  # Metadata filter expression
    searchParams={"metric_type": "L2", "params": {"nprobe": 10}},  # Search parameters
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

### 설정 구성

다음을 config.yaml에 추가합니다.

```yaml
vector_store_registry:
  - vector_store_name: "milvus-knowledgebase"
    litellm_params:
        vector_store_id: "my-collection-name"
        custom_llm_provider: "milvus"
        api_key: os.environ/MILVUS_API_KEY
        api_base: https://your-milvus-instance.milvus.io
        litellm_embedding_model: "azure/text-embedding-3-large"
        litellm_embedding_config:
            api_base: https://your-endpoint.cognitiveservices.azure.com/
            api_key: os.environ/AZURE_API_KEY
            api_version: "2025-09-01"
        milvus_text_field: "book_intro"
        # Optional Milvus parameters
        annsField: "book_intro_vector"
        limit: 10
```

### 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

### API로 검색

```bash
curl -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-collection-name/search' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "query": "What is the capital of France?"
}'
```

</TabItem>
</Tabs>

## 필수 매개변수

| 매개변수 | 유형 | 설명 |
|-----------|------|-------------|
| `vector_store_id` | string | Milvus 컬렉션 이름 |
| `custom_llm_provider` | string | `"milvus"`로 설정 |
| `litellm_embedding_model` | string | 쿼리 임베딩을 생성할 모델(예: `"azure/text-embedding-3-large"`) |
| `litellm_embedding_config` | dict | 임베딩 모델 설정(api_base, api_key, api_version) |
| `milvus_text_field` | string | 텍스트 콘텐츠가 포함된 컬렉션의 필드 이름 |
| `api_key` | string | Milvus API 키(또는 `MILVUS_API_KEY` 환경 변수 설정) |
| `api_base` | string | Milvus API 기본 URL(또는 `MILVUS_API_BASE` 환경 변수 설정) |

## 선택적 매개변수

| 매개변수 | 유형 | 설명 |
|-----------|------|-------------|
| `dbName` | string | 데이터베이스 이름(기본값: "default") |
| `annsField` | string | 검색할 벡터 필드 이름(기본값: "book_intro_vector") |
| `limit` | integer | 반환할 최대 결과 수 |
| `offset` | integer | 페이지네이션 오프셋 |
| `filter` | string | 메타데이터 필터링에 사용할 필터 표현식 |
| `groupingField` | string | 결과를 그룹화할 필드 |
| `outputFields` | list | 결과에 반환할 필드 목록 |
| `searchParams` | dict | 메트릭 유형 및 검색 매개변수 같은 검색 설정 |
| `partitionNames` | list | 검색할 파티션 이름 목록 |
| `consistencyLevel` | string | 검색에 사용할 일관성 수준 |

## 지원 기능

| 기능 | 상태 | 참고 |
|---------|--------|-------|
| 로깅 | ✅ 지원됨 | 전체 로깅 지원 사용 가능 |
| 가드레일 | ❌ 아직 지원되지 않음 | 벡터 스토어에는 현재 가드레일이 지원되지 않습니다 |
| 비용 추적 | ✅ 지원됨 | Milvus 검색 비용은 $0입니다 |
| 통합 API | ✅ 지원됨 | OpenAI 호환 `/v1/vector_stores/search` 엔드포인트로 호출 |
| Passthrough | ✅ 지원됨 | 네이티브 Milvus API 형식 사용 |

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
      "file_id": null,
      "filename": null,
      "attributes": {
        "id": "123",
        "title": "France Geography"
      }
    }
  ]
}
```

## Passthrough API(네이티브 Milvus 형식)

개발자에게 Milvus 자격 증명을 제공하지 않고도 네이티브 Milvus API 형식으로 벡터 스토어를 **생성**하고 **검색**할 수 있게 하려면 이를 사용합니다.

이는 프록시 전용입니다.

### 관리자 흐름

#### 1. LiteLLM에 벡터 스토어 추가

```yaml
model_list:  
  - model_name: embedding-model
    litellm_params:
      model: azure/text-embedding-3-large
      api_base: https://your-endpoint.cognitiveservices.azure.com/
      api_key: os.environ/AZURE_API_KEY
      api_version: "2025-09-01"

vector_store_registry:
  - vector_store_name: "milvus-store"
    litellm_params:
      vector_store_id: "can-be-anything" # vector store id can be anything for the purpose of passthrough api
      custom_llm_provider: "milvus"
      api_key: os.environ/MILVUS_API_KEY
      api_base: https://your-milvus-instance.milvus.io

general_settings:
    database_url: "postgresql://user:password@host:port/database"
    master_key: "sk-1234"
```

벡터 스토어 자격 증명을 LiteLLM에 추가합니다.

#### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 가상 인덱스 생성

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/indexes' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ 
    "index_name": "dall-e-6",
    "litellm_params": {
        "vector_store_index": "real-collection-name",
        "vector_store_name": "milvus-store"
    }
}'
```

이는 개발자가 벡터 스토어를 생성하고 검색하는 데 사용할 수 있는 가상 인덱스입니다.

#### 4. 벡터 스토어 권한이 있는 키 생성

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "allowed_vector_store_indexes": [{"index_name": "dall-e-6", "index_permissions": ["write", "read"]}],
    "models": ["embedding-model"]
}'
```

키에 가상 인덱스 및 임베딩 모델 접근 권한을 부여합니다.

**예상 응답**

```json
{
    "key": "sk-my-virtual-key"
}
```

### 개발자 흐름

#### MilvusRESTClient

Passthrough API를 사용하려면 간단한 REST 클라이언트가 필요합니다. 이 `milvus_rest_client.py` 파일을 프로젝트에 복사합니다.

<details>
<summary>milvus_rest_client.py 펼치기</summary>

```python
"""
Simple Milvus REST API v2 Client
Based on: https://milvus.io/api-reference/restful/v2.6.x/
"""

import requests
from typing import List, Dict, Any, Optional


class DataType:
    """Milvus data types"""

    INT64 = "Int64"
    FLOAT_VECTOR = "FloatVector"
    VARCHAR = "VarChar"
    BOOL = "Bool"
    FLOAT = "Float"


class CollectionSchema:
    """Collection schema builder"""

    def __init__(self):
        self.fields = []

    def add_field(
        self,
        field_name: str,
        data_type: str,
        is_primary: bool = False,
        dim: Optional[int] = None,
        description: str = "",
    ):
        """Add a field to the schema"""
        field = {
            "fieldName": field_name,
            "dataType": data_type,
            "isPrimary": is_primary,
            "description": description,
        }
        if data_type == DataType.FLOAT_VECTOR and dim:
            field["elementTypeParams"] = {"dim": str(dim)}
        self.fields.append(field)
        return self

    def to_dict(self):
        """Convert schema to dict for API"""
        return {"fields": self.fields}


class IndexParams:
    """Index parameters builder"""

    def __init__(self):
        self.indexes = []

    def add_index(
        self, field_name: str, metric_type: str = "L2", index_name: Optional[str] = None
    ):
        """Add an index"""
        index = {
            "fieldName": field_name,
            "indexName": index_name or f"{field_name}_index",
            "metricType": metric_type,
        }
        self.indexes.append(index)
        return self

    def to_list(self):
        """Convert to list for API"""
        return self.indexes


class MilvusRESTClient:
    """
    Simple Milvus REST API v2 Client

    Reference: https://milvus.io/api-reference/restful/v2.6.x/
    """

    def __init__(self, uri: str, token: str, db_name: str = "default"):
        """
        Initialize Milvus REST client

        Args:
            uri: Milvus server URI (e.g., http://localhost:19530)
            token: Authentication token
            db_name: Database name
        """
        self.base_url = uri.rstrip("/")
        self.token = token
        self.db_name = db_name
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a POST request to Milvus API"""
        url = f"{self.base_url}{endpoint}"

        # Add dbName if not already in data and not default
        if "dbName" not in data and self.db_name != "default":
            data["dbName"] = self.db_name

        try:
            response = requests.post(url, json=data, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"e.response.text: {e.response.content}")
            raise e

        result = response.json()

        # Check for API errors
        if result.get("code") != 0:
            raise Exception(
                f"Milvus API Error: {result.get('message', 'Unknown error')}"
            )

        return result

    def has_collection(self, collection_name: str) -> bool:
        """
        Check if a collection exists

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Has.md
        """
        try:
            result = self._make_request(
                "/v2/vectordb/collections/has", {"collectionName": collection_name}
            )
            return result.get("data", {}).get("has", False)
        except Exception:
            return False

    def drop_collection(self, collection_name: str):
        """
        Drop a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Drop.md
        """
        return self._make_request(
            "/v2/vectordb/collections/drop", {"collectionName": collection_name}
        )

    def create_schema(self) -> CollectionSchema:
        """Create a new collection schema"""
        return CollectionSchema()

    def prepare_index_params(self) -> IndexParams:
        """Create index parameters"""
        return IndexParams()

    def create_collection(
        self,
        collection_name: str,
        schema: CollectionSchema,
        index_params: Optional[IndexParams] = None,
    ):
        """
        Create a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Create.md
        """
        data = {"collectionName": collection_name, "schema": schema.to_dict()}

        if index_params:
            data["indexParams"] = index_params.to_list()

        return self._make_request("/v2/vectordb/collections/create", data)

    def describe_collection(self, collection_name: str) -> Dict[str, Any]:
        """
        Describe a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Describe.md
        """
        result = self._make_request(
            "/v2/vectordb/collections/describe", {"collectionName": collection_name}
        )
        return result.get("data", {})

    def insert(
        self,
        collection_name: str,
        data: List[Dict[str, Any]],
        partition_name: Optional[str] = None,
    ):
        """
        Insert data into a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Vector%20(v2)/Insert.md
        """
        payload = {"collectionName": collection_name, "data": data}

        if partition_name:
            payload["partitionName"] = partition_name

        result = self._make_request("/v2/vectordb/entities/insert", payload)
        return result.get("data", {})

    def flush(self, collection_name: str):
        """
        Flush collection data to storage

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Flush.md
        """
        return self._make_request(
            "/v2/vectordb/collections/flush", {"collectionName": collection_name}
        )

    def search(
        self,
        collection_name: str,
        data: List[List[float]],
        anns_field: str,
        limit: int = 10,
        search_params: Optional[Dict[str, Any]] = None,
        output_fields: Optional[List[str]] = None,
    ) -> List[List[Dict]]:
        """
        Search for vectors

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Vector%20(v2)/Search.md
        """
        payload = {
            "collectionName": collection_name,
            "data": data,
            "annsField": anns_field,
            "limit": limit,
        }

        if search_params:
            payload["searchParams"] = search_params

        if output_fields:
            payload["outputFields"] = output_fields

        result = self._make_request("/v2/vectordb/entities/search", payload)
        return result.get("data", [])
```

</details>

#### 1. 스키마로 컬렉션 생성

참고: 설정의 `milvus` 공급자를 사용하는 passthrough api에는 `/milvus` 엔드포인트를 사용합니다.

```python
from milvus_rest_client import MilvusRESTClient, DataType  # Use the client from above
import random
import time

# Configuration
uri = "http://0.0.0.0:4000/milvus"  # IMPORTANT: Use the '/milvus' endpoint for passthrough
token = "sk-my-virtual-key"
collection_name = "dall-e-6"  # Virtual index name

# Initialize client
milvus_client = MilvusRESTClient(uri=uri, token=token)
print(f"Connected to DB: {uri} successfully")

# Check if the collection exists and drop if it does
check_collection = milvus_client.has_collection(collection_name)
if check_collection:
    milvus_client.drop_collection(collection_name)
    print(f"Dropped the existing collection {collection_name} successfully")

# Define schema
dim = 64  # Vector dimension

print("Start to create the collection schema")
schema = milvus_client.create_schema()
schema.add_field(
    "book_id", DataType.INT64, is_primary=True, description="customized primary id"
)
schema.add_field("word_count", DataType.INT64, description="word count")
schema.add_field(
    "book_intro", DataType.FLOAT_VECTOR, dim=dim, description="book introduction"
)

# Prepare index parameters
print("Start to prepare index parameters with default AUTOINDEX")
index_params = milvus_client.prepare_index_params()
index_params.add_index("book_intro", metric_type="L2")

# Create collection
print(f"Start to create example collection: {collection_name}")
milvus_client.create_collection(
    collection_name, schema=schema, index_params=index_params
)
collection_property = milvus_client.describe_collection(collection_name)
print("Collection details: %s" % collection_property)
```

#### 2. 컬렉션에 데이터 삽입

```python
# Insert data with customized ids
nb = 1000
insert_rounds = 2
start = 0  # first primary key id
total_rt = 0  # total response time for insert

print(
    f"Start to insert {nb*insert_rounds} entities into example collection: {collection_name}"
)
for i in range(insert_rounds):
    vector = [random.random() for _ in range(dim)]
    rows = [
        {"book_id": i, "word_count": random.randint(1, 100), "book_intro": vector}
        for i in range(start, start + nb)
    ]
    t0 = time.time()
    milvus_client.insert(collection_name, rows)
    ins_rt = time.time() - t0
    start += nb
    total_rt += ins_rt
print(f"Insert completed in {round(total_rt, 4)} seconds")

# Flush the collection
print("Start to flush")
start_flush = time.time()
milvus_client.flush(collection_name)
end_flush = time.time()
print(f"Flush completed in {round(end_flush - start_flush, 4)} seconds")
```

#### 3. 컬렉션 검색

```python
# Search configuration
nq = 3  # Number of query vectors
search_params = {"metric_type": "L2", "params": {"level": 2}}
limit = 2  # Number of results to return

# Perform searches
for i in range(5):
    search_vectors = [[random.random() for _ in range(dim)] for _ in range(nq)]
    t0 = time.time()
    results = milvus_client.search(
        collection_name,
        data=search_vectors,
        limit=limit,
        search_params=search_params,
        anns_field="book_intro",
    )
    t1 = time.time()
    print(f"Search {i} results: {results}")
    print(f"Search {i} latency: {round(t1-t0, 4)} seconds")
```

#### 전체 예제

다음은 전체 동작 예제입니다.

```python
from milvus_rest_client import MilvusRESTClient, DataType  # Use the client from above
import random
import time

# ----------------------------
# 🔐 CONFIGURATION
# ----------------------------
uri = "http://0.0.0.0:4000/milvus"  # IMPORTANT: Use the '/milvus' endpoint
token = "sk-my-virtual-key"
collection_name = "dall-e-6"  # Your virtual index name

# ----------------------------
# 📋 STEP 1 — Initialize Client
# ----------------------------
milvus_client = MilvusRESTClient(uri=uri, token=token)
print(f"✅ Connected to DB: {uri} successfully")

# ----------------------------
# 🗑️  STEP 2 — Drop Existing Collection (if needed)
# ----------------------------
check_collection = milvus_client.has_collection(collection_name)
if check_collection:
    milvus_client.drop_collection(collection_name)
    print(f"🗑️  Dropped the existing collection {collection_name} successfully")

# ----------------------------
# 📐 STEP 3 — Create Collection Schema
# ----------------------------
dim = 64  # Vector dimension

print("📐 Creating the collection schema")
schema = milvus_client.create_schema()
schema.add_field(
    "book_id", DataType.INT64, is_primary=True, description="customized primary id"
)
schema.add_field("word_count", DataType.INT64, description="word count")
schema.add_field(
    "book_intro", DataType.FLOAT_VECTOR, dim=dim, description="book introduction"
)

# ----------------------------
# 🔍 STEP 4 — Create Index
# ----------------------------
print("🔍 Preparing index parameters with default AUTOINDEX")
index_params = milvus_client.prepare_index_params()
index_params.add_index("book_intro", metric_type="L2")

# ----------------------------
# 🏗️  STEP 5 — Create Collection
# ----------------------------
print(f"🏗️  Creating collection: {collection_name}")
milvus_client.create_collection(
    collection_name, schema=schema, index_params=index_params
)
collection_property = milvus_client.describe_collection(collection_name)
print(f"✅ Collection created: {collection_property}")

# ----------------------------
# 📤 STEP 6 — Insert Data
# ----------------------------
nb = 1000
insert_rounds = 2
start = 0
total_rt = 0

print(f"📤 Inserting {nb*insert_rounds} entities into collection")
for i in range(insert_rounds):
    vector = [random.random() for _ in range(dim)]
    rows = [
        {"book_id": i, "word_count": random.randint(1, 100), "book_intro": vector}
        for i in range(start, start + nb)
    ]
    t0 = time.time()
    milvus_client.insert(collection_name, rows)
    ins_rt = time.time() - t0
    start += nb
    total_rt += ins_rt
print(f"✅ Insert completed in {round(total_rt, 4)} seconds")

# ----------------------------
# 💾 STEP 7 — Flush Collection
# ----------------------------
print("💾 Flushing collection")
start_flush = time.time()
milvus_client.flush(collection_name)
end_flush = time.time()
print(f"✅ Flush completed in {round(end_flush - start_flush, 4)} seconds")

# ----------------------------
# 🔍 STEP 8 — Search
# ----------------------------
nq = 3
search_params = {"metric_type": "L2", "params": {"level": 2}}
limit = 2

print(f"🔍 Performing {5} search operations")
for i in range(5):
    search_vectors = [[random.random() for _ in range(dim)] for _ in range(nq)]
    t0 = time.time()
    results = milvus_client.search(
        collection_name,
        data=search_vectors,
        limit=limit,
        search_params=search_params,
        anns_field="book_intro",
    )
    t1 = time.time()
    print(f"✅ Search {i} results: {results}")
    print(f"   Search {i} latency: {round(t1-t0, 4)} seconds")
```

## 작동 방식

검색할 때의 동작은 다음과 같습니다.

1. LiteLLM이 지정한 임베딩 모델을 사용해 쿼리를 벡터로 변환합니다
2. `/v2/vectordb/entities/search` 엔드포인트를 통해 벡터를 Milvus 인스턴스로 보냅니다
3. Milvus가 벡터 유사도 검색을 사용해 컬렉션에서 가장 유사한 문서를 찾습니다
4. 결과가 거리 점수와 함께 반환됩니다

임베딩 모델은 Azure OpenAI, OpenAI, Bedrock 등 LiteLLM이 지원하는 어떤 모델이든 사용할 수 있습니다.
