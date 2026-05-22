import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# `Bedrock Knowledge Bases` {#bedrock-knowledge-bases}

AWS Bedrock Knowledge Bases를 사용하면 LLM을 조직의 데이터에 연결하여, 모델이 비즈니스에 특화된 정보를 검색하고 참조할 수 있습니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Bedrock Knowledge Bases는 데이터를 LLM에 연결하여, 응답에서 조직의 정보를 검색하고 참조할 수 있게 합니다. |
| LiteLLM의 Provider Route | litellm vector_store_registry의 `bedrock` |
| Provider 문서 | [AWS Bedrock Knowledge Bases ↗](https://aws.amazon.com/bedrock/knowledge-bases/) |

## 빠른 시작

### LiteLLM Python SDK

```python showLineNumbers title="Example using LiteLLM Python SDK"
import os
import litellm

from litellm.vector_stores.vector_store_registry import VectorStoreRegistry, LiteLLM_ManagedVectorStore

# Init vector store registry with your Bedrock Knowledge Base
litellm.vector_store_registry = VectorStoreRegistry(
    vector_stores=[
        LiteLLM_ManagedVectorStore(
            vector_store_id="YOUR_KNOWLEDGE_BASE_ID",  # KB ID from AWS Bedrock
            custom_llm_provider="bedrock"
        )
    ]
)

# Make a completion request using your Knowledge Base
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet", 
    messages=[{"role": "user", "content": "What does our company policy say about remote work?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ],
)

print(response.choices[0].message.content)
```

### LiteLLM Proxy

#### 1. vector_store_registry 구성 {#1-configure-your-vector_store_registry}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml
model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet
      api_key: os.environ/ANTHROPIC_API_KEY

vector_store_registry:
  - vector_store_name: "bedrock-company-docs"
    litellm_params:
      vector_store_id: "YOUR_KNOWLEDGE_BASE_ID"
      custom_llm_provider: "bedrock"
      vector_store_description: "Bedrock Knowledge Base for company documents"
      vector_store_metadata:
        source: "Company internal documentation"
```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

LiteLLM UI에서 Experimental > Vector Stores > Create Vector Store로 이동합니다. 이 페이지에서 이름, vector store id, 인증 정보를 입력해 vector store를 생성할 수 있습니다.

<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>

</TabItem>
</Tabs>

#### 2. vector_store_ids 파라미터로 요청 보내기 {#2-make-a-request-with-vector_store_ids-parameter}

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "What does our company policy say about remote work?"}],
    "tools": [
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ]
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request with vector_store_ids parameter
response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What does our company policy say about remote work?"}],
    tools=[
        {
            "type": "file_search",
            "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>


## 결과 필터링 {#filter-results}

메타데이터 속성으로 필터링합니다.

**Operators** (OpenAI-style, 자동 변환):
- `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`

**AWS operators** (직접 사용):
- `equals`, `notEquals`, `greaterThan`, `greaterThanOrEquals`, `lessThan`, `lessThanOrEquals`, `in`, `notIn`, `startsWith`, `listContains`, `stringContains`

<Tabs>
<TabItem value="single-filter" label="Single Filter">

```python
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What are the latest updates?"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "key": "category",
            "value": "updates",
            "operator": "eq"
        }
    }]
)
```

</TabItem>

<TabItem value="and-filters" label="AND">

```python
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "What are the policies?"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "category", "value": "policy", "operator": "eq"},
                {"key": "year", "value": 2024, "operator": "gte"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="or-filters" label="OR">

```python
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Show me technical docs"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "or": [
                {"key": "category", "value": "api", "operator": "eq"},
                {"key": "category", "value": "sdk", "operator": "eq"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="advanced-filters" label="AWS Operators">

```python
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Find docs"}],
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "title", "value": "Guide", "operator": "stringContains"},
                {"key": "tags", "value": "important", "operator": "listContains"}
            ]
        }
    }]
)
```

</TabItem>

<TabItem value="proxy-filters" label="Proxy">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "What are our policies?"}],
    "tools": [{
        "type": "file_search",
        "vector_store_ids": ["YOUR_KNOWLEDGE_BASE_ID"],
        "filters": {
            "and": [
                {"key": "department", "value": "engineering", "operator": "eq"},
                {"key": "type", "value": "policy", "operator": "eq"}
            ]
        }
    }]
  }'
```

</TabItem>
</Tabs>

## 검색 결과 접근 {#accessing-search-results}

응답에서 vector store 검색 결과에 접근하는 방법은 다음을 참고하세요.
- [검색 결과 접근 (Non-Streaming 및 Streaming)](../completion/knowledgebase#accessing-search-results-citations)

## 추가 자료 {#further-reading}

Vector Stores:
- [항상 활성화되는 Vector Stores](https://docs.litellm.ai/docs/completion/knowledgebase#always-on-for-a-model)
- [litellm proxy에서 사용 가능한 vector stores 목록 조회](https://docs.litellm.ai/docs/completion/knowledgebase#listing-available-vector-stores)
- [LiteLLM Vector Stores 작동 방식](https://docs.litellm.ai/docs/completion/knowledgebase#how-it-works)
