import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# Vector Store(Knowledge Base) 사용

<Image 
  img={require('../../img/kb.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM이 지원하는 모든 모델에서 Vector Store 사용
</p>


LiteLLM은 vector store와 통합되어 모델이 조직의 데이터에 접근할 수 있게 합니다. 이를 통해 더 정확하고 문맥에 맞는 응답을 생성할 수 있습니다.

## 지원되는 Vector Store
- [Bedrock Knowledge Bases](https://aws.amazon.com/bedrock/knowledge-bases/)
- [OpenAI Vector Stores](https://platform.openai.com/docs/api-reference/vector-stores/search)
- [Azure Vector Stores](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/file-search?tabs=python#vector-stores) (직접 쿼리할 수 없습니다. Assistants messages에서 호출하는 경우에만 사용할 수 있습니다.)
- [Azure AI Search](/litellm-docs-kr/docs/providers/azure_ai_vector_stores) (Azure AI Search 인덱스를 사용한 vector search)
- [Vertex AI RAG API](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-overview)
- [Gemini File Search](https://ai.google.dev/gemini-api/docs/file-search)
- [RAGFlow Datasets](/litellm-docs-kr/docs/providers/ragflow_vector_store.md) (dataset 관리만 지원하며 검색은 지원하지 않음)

## 빠른 시작

LiteLLM에서 vector store를 사용하려면 다음이 필요합니다.

- `litellm.vector_store_registry` 초기화
- completion request에 `vector_store_ids`가 포함된 tools를 전달합니다. 여기서 `vector_store_ids`는 `litellm.vector_store_registry`에서 초기화한 vector store ID 목록입니다.

### LiteLLM Python SDK

LiteLLM은 사용하려는 `vector_store_ids`가 포함된 tool을 전달하는 방식으로 [OpenAI API 사양](https://platform.openai.com/docs/api-reference/chat/create)에서 vector store를 사용할 수 있게 합니다.

```python showLineNumbers title="Basic Bedrock Knowledge Base Usage"
import os
import litellm

from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Init vector store registry
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="T37J8R4WTM",
            custom_llm_provider="bedrock"
        )
    ]
)


# Make a completion request with vector_store_ids parameter
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet", 
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ],
)

print(response.choices[0].message.content)
```

### LiteLLM Proxy

#### 1. `vector_store_registry` 설정

LiteLLM에서 vector store를 사용하려면 `vector_store_registry`를 설정해야 합니다. 이 설정은 LiteLLM에 어떤 vector store를 사용할지, 그리고 해당 vector store에 어떤 API provider를 사용할지 알려줍니다.

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet
      api_key: os.environ/ANTHROPIC_API_KEY

vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"
    litellm_params:
      vector_store_id: "T37J8R4WTM"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"

```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

LiteLLM UI에서 Experimental > Vector Stores > Create Vector Store로 이동합니다. 이 페이지에서 이름, vector store ID, credential을 지정해 vector store를 생성할 수 있습니다.
<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>




</TabItem>

</Tabs>

#### 2. `vector_store_ids` parameter로 요청 전송 {#2-make-a-request-with-vector_store_ids-parameter}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Curl Request to LiteLLM Proxy"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "What is litellm?"}],
    "tools": [
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ]
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="OpenAI Python SDK Request"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request with vector_store_ids parameter
response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["T37J8R4WTM"]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## Provider별 가이드

이 섹션에서는 vector store를 LiteLLM에 추가하는 방법을 설명합니다. 새 provider 지원이 필요하면 [여기](https://github.com/BerriAI/litellm/issues)에 issue를 등록하세요.

### Bedrock Knowledge Bases 설정 {#bedrock-knowledge-bases}

**1. Bedrock Knowledge Base 설정**

AWS 계정에 Bedrock Knowledge Base가 생성되어 있고 적절한 권한이 설정되어 있는지 확인합니다.

**2. LiteLLM UI에 추가**

1. **Tools > Vector Stores > "Add new vector store"**로 이동합니다.
2. provider로 **"Bedrock"**을 선택합니다.
3. **"Vector Store ID"** 필드에 Bedrock Knowledge Base ID를 입력합니다.

<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '60%', display: 'block'}}
/>


### Vertex AI RAG Engine 설정 {#vertex-ai-rag-engine}

**1. Vertex AI RAG Engine ID 가져오기**

1. [Google Cloud Console](https://console.cloud.google.com/vertex-ai/rag/corpus)에서 RAG Engine Corpus로 이동합니다.
2. LiteLLM과 통합하려는 **RAG Engine**을 선택합니다.

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

3. **"Details"** 버튼을 클릭하고 RAG Engine의 UUID를 복사합니다.
4. ID는 다음과 같은 형태입니다: `6917529027641081856`

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex2.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

**2. LiteLLM UI에 추가**

1. **Tools > Vector Stores > "Add new vector store"**로 이동합니다.
2. provider로 **"Vertex AI RAG Engine"**을 선택합니다.
3. **"Vector Store ID"** 필드에 Vertex AI RAG Engine ID를 입력합니다.

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_vertex3.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

### PG Vector

**1. litellm-pg-vector-store connector 배포**

LiteLLM은 PG Vector용 OpenAI 호환 `vector_store` endpoint를 노출하는 server를 제공합니다. LiteLLM Proxy server는 배포된 service에 연결하고, 쿼리 시 이를 vector store로 사용합니다.

1. litellm-pg-vector-store connector 배포 지침은 [여기](https://github.com/BerriAI/litellm-pgvector)를 따르세요.
2. 자세한 configuration option은 [configuration guide](https://github.com/BerriAI/litellm-pgvector?tab=readme-ov-file#configuration)를 참고하세요.

**litellm-pg-vector-store 배포용 `.env` configuration 예제:**

```env
DATABASE_URL="postgresql://neondb_owner:xxxx"
SERVER_API_KEY="sk-1234"
HOST="0.0.0.0"
PORT=8001
EMBEDDING__MODEL="text-embedding-ada-002"
EMBEDDING__BASE_URL="http://localhost:4000"
EMBEDDING__API_KEY="sk-1234"
EMBEDDING__DIMENSIONS=1536
DB_FIELDS__ID_FIELD="id"
DB_FIELDS__CONTENT_FIELD="content"
DB_FIELDS__METADATA_FIELD="metadata"
DB_FIELDS__EMBEDDING_FIELD="embedding"
DB_FIELDS__VECTOR_STORE_ID_FIELD="vector_store_id"
DB_FIELDS__CREATED_AT_FIELD="created_at"
```

**2. LiteLLM UI에 추가**

litellm-pg-vector-store 배포가 완료되면:

1. **Tools > Vector Stores > "Add new vector store"**로 이동합니다.
2. provider로 **"PG Vector"**를 선택합니다.
3. `litellm-pg-vector-store` container의 **API Base URL**과 **API Key**를 입력합니다.
   - API Key 필드는 `.env` configuration의 `SERVER_API_KEY`에 해당합니다.

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_pg1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>

### OpenAI Vector Stores 설정 {#openai-vector-stores}

**1. OpenAI Vector Store 설정**

1. [OpenAI platform](https://platform.openai.com/storage/vector_stores)에서 Vector Store를 생성합니다.
2. Vector Store ID를 기록합니다. 형식: `vs_687ae3b2439881918b433cb99d10662e`

**2. LiteLLM UI에 추가**

1. **Tools > Vector Stores > "Add new vector store"**로 이동합니다.
2. provider로 **"OpenAI"**를 선택합니다.
3. 해당 필드에 **Vector Store ID**를 입력합니다.
4. API Key 필드에 **OpenAI API Key**를 입력합니다.

<div style={{margin: '20px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
<Image 
  img={require('../../img/kb_openai1.png')}
  style={{width: '60%', display: 'block'}}
/>
</div>



## 고급

### Vector Store 사용 로깅 {#logging-vector-store-usage}

LiteLLM은 LiteLLM UI의 `로그` 페이지에서 vector store 사용 내역을 볼 수 있게 합니다.

vector store를 사용하는 요청을 완료한 뒤 LiteLLM의 `로그` 페이지로 이동합니다. 여기에서 vector store로 전송된 쿼리와 score가 포함된 해당 응답을 확인할 수 있습니다.

<Image 
  img={require('../../img/kb_4.png')}
  style={{width: '80%'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM 로그 페이지: Vector Store 사용법
</p>


### 사용 가능한 vector store 목록 조회

`/vector_store/list` endpoint를 사용해 사용 가능한 모든 vector store 목록을 조회할 수 있습니다.

**요청:**
```bash showLineNumbers title="List all available vector stores"
curl -X GET "http://localhost:4000/vector_store/list" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

**응답:**

응답은 LiteLLM에서 사용할 수 있는 모든 vector store 목록입니다.

```json
{
  "object": "list",
  "data": [
    {
      "vector_store_id": "T37J8R4WTM",
      "custom_llm_provider": "bedrock",
      "vector_store_name": "bedrock-litellm-website-knowledgebase",
      "vector_store_description": "Bedrock vector store for the Litellm website knowledgebase",
      "vector_store_metadata": {
        "source": "https://www.litellm.com/docs"
      },
      "created_at": "2023-05-03T18:21:36.462Z",
      "updated_at": "2023-05-03T18:21:36.462Z",
      "litellm_credential_name": "bedrock_credentials"
    }
  ],
  "total_count": 1,
  "current_page": 1,
  "total_pages": 1
}
```


### 특정 모델에서 항상 사용

**특정 모델에서 기본적으로 vector store를 사용하려면 이 설정을 사용합니다.**

이 설정에서는 `claude-3-5-sonnet-with-vector-store` 모델에 `vector_store_ids`를 추가합니다. 즉, `claude-3-5-sonnet-with-vector-store` 모델로 들어오는 모든 요청은 `vector_store_registry`에 정의된 ID `T37J8R4WTM`의 vector store를 항상 사용합니다.

```yaml showLineNumbers title="Always on for a model"
model_list:
  - model_name: claude-3-5-sonnet-with-vector-store
    litellm_params:
      model: anthropic/claude-3-5-sonnet
      vector_store_ids: ["T37J8R4WTM"]

vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"
    litellm_params:
      vector_store_id: "T37J8R4WTM"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"
```

## 동작 방식

요청에 `vector_store_ids` parameter가 포함되어 있고 그중 하나가 `vector_store_registry`에 존재하면, LiteLLM은 해당 요청에 vector store를 자동으로 사용합니다.

1. `vector_store_ids` parameter가 포함된 completion request를 보냅니다. 이때 vector store ID 중 하나가 `litellm.vector_store_registry`에 있어야 합니다.
2. LiteLLM은 자동으로 다음 작업을 수행합니다.
   - 마지막 message를 쿼리로 사용해 Knowledge Base에서 관련 정보를 검색합니다.
   - 검색된 context를 conversation에 추가합니다.
   - 보강된 messages를 모델에 전송합니다.

#### 예제 변환 {#example-transformation}

`vector_store_ids=["YOUR_KNOWLEDGE_BASE_ID"]`를 전달하면 요청은 다음 단계를 거칩니다.

**1. LiteLLM으로 보내는 원본 요청:**
```json
{
    "model": "anthropic/claude-3-5-sonnet",
    "messages": [
        {"role": "user", "content": "What is litellm?"}
    ],
    "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
}
```

**2. AWS Bedrock Knowledge Base로 보내는 요청:**
```json
{
    "retrievalQuery": {
        "text": "What is litellm?"
    }
}
```
다음 endpoint로 전송됩니다: `https://bedrock-agent-runtime.{aws_region}.amazonaws.com/knowledgebases/YOUR_KNOWLEDGE_BASE_ID/retrieve`

**3. LiteLLM 최종 요청:**
```json
{
    "model": "anthropic/claude-3-5-sonnet",
    "messages": [
        {"role": "user", "content": "What is litellm?"},
        {"role": "user", "content": "Context: \n\nLiteLLM is an open-source SDK to simplify LLM API calls across providers (OpenAI, Claude, etc). It provides a standardized interface with robust error handling, streaming, and observability tools."}
    ]
}
```

요청에 `vector_store_ids` parameter를 포함하면 이 과정이 자동으로 수행됩니다.

## 검색 결과(Citation) 접근 {#accessing-search-result-citation}

vector store를 사용하면 LiteLLM은 `provider_specific_fields`에 검색 결과를 자동으로 반환합니다. 이를 통해 AI 응답에 대한 citation을 사용자에게 표시할 수 있습니다.

### 핵심 개념

검색 결과는 항상 다음 위치에 있습니다: `response.choices[0].message.provider_specific_fields["search_results"]`

streaming의 경우 `finish_reason == "stop"`일 때 **최종 chunk**에 result가 나타납니다.

### Non-Streaming 예제 {#non-streaming-example}


**검색 결과가 포함된 non-streaming 응답:**

```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "LiteLLM is a platform...",
      "provider_specific_fields": {
        "search_results": [{
          "search_query": "What is litellm?",
          "data": [{
            "score": 0.95,
            "content": [{"text": "...", "type": "text"}],
            "filename": "litellm-docs.md",
            "file_id": "doc-123"
          }]
        }]
      }
    },
    "finish_reason": "stop"
  }]
}
```

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[{"type": "file_search", "vector_store_ids": ["T37J8R4WTM"]}]
)

# Get AI response
print(response.choices[0].message.content)

# Get search results (citations)
search_results = response.choices[0].message.provider_specific_fields.get("search_results", [])

for result_page in search_results:
    for idx, item in enumerate(result_page['data'], 1):
        print(f"[{idx}] {item.get('filename', 'Unknown')} (score: {item['score']:.2f})")
```

</TabItem>

<TabItem value="typescript" label="TypeScript SDK">

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:4000',
  apiKey: process.env.LITELLM_API_KEY
});

const response = await client.chat.completions.create({
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'What is litellm?' }],
  tools: [{ type: 'file_search', vector_store_ids: ['T37J8R4WTM'] }]
});

// Get AI response
console.log(response.choices[0].message.content);

// Get search results (citations)
const message = response.choices[0].message as any;
const searchResults = message.provider_specific_fields?.search_results || [];

searchResults.forEach((page: any) => {
  page.data.forEach((item: any, idx: number) => {
    console.log(`[${idx + 1}] ${item.filename || 'Unknown'} (${item.score.toFixed(2)})`);
  });
});
```

</TabItem>
</Tabs>

### Streaming 예제 {#streaming-example}

**검색 결과가 포함된 streaming 응답(최종 chunk):**

```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "index": 0,
    "delta": {
      "provider_specific_fields": {
        "search_results": [{
          "search_query": "What is litellm?",
          "data": [{
            "score": 0.95,
            "content": [{"text": "...", "type": "text"}],
            "filename": "litellm-docs.md",
            "file_id": "doc-123"
          }]
        }]
      }
    },
    "finish_reason": "stop"
  }]
}
```

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

stream = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What is litellm?"}],
    tools=[{"type": "file_search", "vector_store_ids": ["T37J8R4WTM"]}],
    stream=True
)

for chunk in stream:
    # Stream content
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
    
    # Get citations in final chunk
    if chunk.choices[0].finish_reason == "stop":
        search_results = getattr(chunk.choices[0].delta, 'provider_specific_fields', {}).get('search_results', [])
        if search_results:
            print("\n\nSources:")
            for page in search_results:
                for idx, item in enumerate(page['data'], 1):
                    print(f"  [{idx}] {item.get('filename', 'Unknown')} ({item['score']:.2f})")
```

</TabItem>

<TabItem value="typescript" label="TypeScript SDK">

```typescript
import OpenAI from 'openai';

const stream = await client.chat.completions.create({
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'What is litellm?' }],
  tools: [{ type: 'file_search', vector_store_ids: ['T37J8R4WTM'] }],
  stream: true
});

for await (const chunk of stream) {
  // Stream content
  if (chunk.choices[0]?.delta?.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
  
  // Get citations in final chunk
  if (chunk.choices[0]?.finish_reason === 'stop') {
    const searchResults = (chunk.choices[0].delta as any).provider_specific_fields?.search_results || [];
    if (searchResults.length > 0) {
      console.log('\n\nSources:');
      searchResults.forEach((page: any) => {
        page.data.forEach((item: any, idx: number) => {
          console.log(`  [${idx + 1}] ${item.filename || 'Unknown'} (${item.score.toFixed(2)})`);
        });
      });
    }
  }
}
```

</TabItem>
</Tabs>

### 검색 결과 필드 {#search-result-field}

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `search_query` | string | vector store를 검색하는 데 사용된 쿼리 |
| `data` | array | 검색 결과 배열 |
| `data[].score` | float | relevance score(0-1, 높을수록 더 관련 있음) |
| `data[].content` | array | `text`와 `type`을 포함한 content chunk |
| `data[].filename` | string | source file 이름(선택 사항) |
| `data[].file_id` | string | source file 식별자(선택 사항) |
| `data[].attributes` | object | provider별 metadata(선택 사항) |

## API 참조 {#api-reference}

### LiteLLM Completion Knowledge Base 파라미터 {#litellm-completion-knowledge-base-parameter}

LiteLLM에서 Knowledge Base integration을 사용할 때 다음 parameter를 포함할 수 있습니다.

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `vector_store_ids` | List[str] | 쿼리할 Knowledge Base ID 목록 |

### `VectorStoreRegistry`

`VectorStoreRegistry`는 LiteLLM에서 vector store를 관리하는 중심 component입니다. vector store를 설정하고 접근할 수 있는 registry 역할을 합니다.

#### VectorStoreRegistry란?

`VectorStoreRegistry`는 다음 역할을 하는 class입니다.

- LiteLLM이 사용할 수 있는 vector store collection을 유지합니다.
- credential 및 metadata와 함께 vector store를 등록할 수 있게 합니다.
- completion request에서 ID를 통해 vector store에 접근할 수 있게 합니다.

#### Python에서 VectorStoreRegistry 사용

```python
from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Initialize the vector store registry with one or more vector stores
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="YOUR_VECTOR_STORE_ID",  # Required: Unique ID for referencing this store
            custom_llm_provider="bedrock"            # Required: Provider (e.g., "bedrock")
        )
    ]
)
```

#### LiteLLM_ManagedVectorStore 파라미터 {#litellm_managedvectorstore-parameter}

registry의 각 vector store는 다음 parameter가 포함된 `LiteLLM_ManagedVectorStore` object로 설정됩니다.

| Parameter | Type | Required | 설명 |
|-----------|------|----------|-------------|
| `vector_store_id` | str | Yes | vector store의 고유 식별자 |
| `custom_llm_provider` | str | Yes | vector store provider(예: "bedrock") |
| `vector_store_name` | str | No | vector store의 알아보기 쉬운 이름 |
| `vector_store_description` | str | No | vector store에 포함된 내용 설명 |
| `vector_store_metadata` | dict or str | No | vector store에 대한 추가 metadata |
| `litellm_credential_name` | str | No | 이 vector store에 사용할 credential 이름 |

#### config.yaml에서 VectorStoreRegistry 설정

LiteLLM Proxy에서는 `config.yaml` 파일에 동일한 registry를 설정할 수 있습니다.

```yaml showLineNumbers title="Vector store configuration in config.yaml"
vector_store_registry:
  - vector_store_name: "bedrock-litellm-website-knowledgebase"  # Optional friendly name
    litellm_params:
      vector_store_id: "T37J8R4WTM"                            # Required: Unique ID  
      custom_llm_provider: "bedrock"                           # Required: Provider
      vector_store_description: "Bedrock vector store for the Litellm website knowledgebase"
      vector_store_metadata:
        source: "https://www.litellm.com/docs"
```

`litellm_params` section은 Python SDK의 `LiteLLM_ManagedVectorStore` constructor와 동일한 모든 parameter를 허용합니다.
