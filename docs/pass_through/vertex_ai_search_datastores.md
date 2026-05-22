# `Vertex AI Search Datastores` 패스스루 {#vertex-ai-search-datastores}

LiteLLM을 통해 Vertex AI Discovery Engine Search API를 호출합니다.

Provider 문서: https://cloud.google.com/generative-ai-app-builder/docs/reference/rest/v1/projects.locations.dataStores.servingConfigs/search

## 제공되는 기능 {#what-you-get}

- datastore를 ID로 참조합니다. LiteLLM이 인증 정보를 찾습니다.
- 모든 요청마다 project/location을 넣을 필요가 없습니다.
- 인증 정보는 한 번만 구성하고 어디서든 사용합니다.
- 비용 추적이 자동으로 동작합니다.

## 빠른 시작

**1단계. 인증 정보 설정**

```bash
export DEFAULT_VERTEXAI_PROJECT="your-project-id"
export DEFAULT_VERTEXAI_LOCATION="us-central1"
export DEFAULT_GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

**2단계. 프록시 시작**

```bash
litellm
```

**3단계. datastore 검색**

```bash
curl -X POST \
  "http://localhost:4000/vertex_ai/discovery/v1/projects/my-project/locations/global/collections/default_collection/dataStores/my-datastore/servingConfigs/default_config:search" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{
    "query": "How do I authenticate?",
    "pageSize": 10
  }'
```

## Managed Vector Stores (권장) {#managed-vector-stores-recommended}

datastore를 한 번 등록한 뒤 ID로 참조합니다.

**config.yaml에서:**

```yaml
vector_store_registry:
  - vector_store_name: "vertex-ai-litellm-website-knowledgebase"
    litellm_params:
      vector_store_id: "my-datastore"
      custom_llm_provider: "vertex_ai/search_api"
      vertex_app_id: "test-litellm-app_1761094730750"
      vertex_project: "test-vector-store-db"
      vertex_location: "global"
      vector_store_description: "Vertex AI vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"
```

**동작 방식:**

LiteLLM은 URL에서 `dataStores/my-datastore`를 확인합니다. 그런 다음 vector store를 조회하고 올바른 project와 인증 정보를 자동으로 사용합니다.

## 엔드포인트 {#endpoint}

`{PROXY_BASE_URL}/vertex_ai/discovery/{endpoint:path}`

`https://discoveryengine.googleapis.com`로 라우팅합니다.

## 예제

### 기본 검색 {#basic-search}

```bash
curl -X POST \
  "http://localhost:4000/vertex_ai/discovery/v1/projects/my-project/locations/global/collections/default_collection/dataStores/my-datastore/servingConfigs/default_config:search" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{
    "query": "pricing",
    "pageSize": 10
  }'
```

### 필터를 사용하는 검색 {#search-with-filters}

```bash
curl -X POST \
  "http://localhost:4000/vertex_ai/discovery/v1/projects/my-project/locations/global/collections/default_collection/dataStores/my-datastore/servingConfigs/default_config:search" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{
    "query": "tutorials",
    "pageSize": 20,
    "filter": "category = \"beginner\"",
    "spellCorrectionSpec": {"mode": "AUTO"}
  }'
```

### Python

```python
import requests

url = "http://localhost:4000/vertex_ai/discovery/v1/projects/my-project/locations/global/collections/default_collection/dataStores/my-datastore/servingConfigs/default_config:search"

response = requests.post(url, 
    headers={
        "Content-Type": "application/json",
        "x-litellm-api-key": "Bearer sk-1234"
    },
    json={"query": "pricing", "pageSize": 10}
)

for result in response.json().get("results", []):
    data = result["document"]["derivedStructData"]
    print(f"{data['title']}: {data['link']}")
```

### Chat Completion과 함께 사용 {#use-with-chat-completion}

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "What is litellm?"}],
    "tools": [
        {
            "type": "file_search",
            "vector_store_ids": ["my-datastore"]
        }
    ]
  }'
```
