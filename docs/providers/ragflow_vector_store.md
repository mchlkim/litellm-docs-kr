import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# RAGFlow 벡터 스토어

LiteLLM은 RAGFlow에서 문서 처리와 지식 베이스 관리를 위한 dataset 생성 및 관리를 지원합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | RAGFlow dataset은 RAG 애플리케이션을 위한 문서 처리, chunking, 지식 베이스 관리를 제공합니다. |
| LiteLLM의 provider route | litellm `vector_store_registry`의 `ragflow` |
| Provider 문서 | [RAGFlow API 문서 ↗](https://ragflow.io/docs) |
| 지원 작업 | Dataset 관리(Create, List, Update, Delete) |
| Search/Retrieval | ❌ 지원하지 않음(관리 전용) |

## 빠른 시작

### LiteLLM Python SDK

```python showLineNumbers title="Example using LiteLLM Python SDK"
import os
import litellm

# Set RAGFlow credentials
os.environ["RAGFLOW_API_KEY"] = "your-ragflow-api-key"
os.environ["RAGFLOW_API_BASE"] = "http://localhost:9380"  # Optional, defaults to localhost:9380

# Create a RAGFlow dataset
response = litellm.vector_stores.create(
    name="my-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "description": "My knowledge base dataset",
        "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
        "chunk_method": "naive"
    }
)

print(f"Created dataset ID: {response.id}")
print(f"Dataset name: {response.name}")
```

### LiteLLM Proxy

#### 1. `vector_store_registry` 설정

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

vector_store_registry:
  - vector_store_name: "ragflow-knowledge-base"
    litellm_params:
      vector_store_id: "your-dataset-id"
      custom_llm_provider: "ragflow"
      api_key: os.environ/RAGFLOW_API_KEY
      api_base: os.environ/RAGFLOW_API_BASE  # Optional
      vector_store_description: "RAGFlow dataset for knowledge base"
      vector_store_metadata:
        source: "Company documentation"
```

</TabItem>

<TabItem value="litellm-ui" label="LiteLLM UI">

LiteLLM UI에서 Experimental > Vector Stores > Create Vector Store로 이동합니다. 이 페이지에서 이름, vector store id, 자격 증명을 지정해 vector store를 생성할 수 있습니다.

<Image 
  img={require('../../img/kb_2.png')}
  style={{width: '50%'}}
/>

</TabItem>
</Tabs>

#### 2. Proxy로 dataset 생성

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl http://localhost:4000/v1/vector_stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "name": "my-ragflow-dataset",
    "custom_llm_provider": "ragflow",
    "metadata": {
      "description": "Test dataset",
      "chunk_method": "naive"
    }
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

# Create a RAGFlow dataset
response = client.vector_stores.create(
    name="my-ragflow-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "description": "Test dataset",
        "chunk_method": "naive"
    }
)

print(f"Created dataset: {response.id}")
```

</TabItem>
</Tabs>

## 설정

### 환경 변수

RAGFlow vector store는 환경 변수를 통한 설정을 지원합니다.

- `RAGFLOW_API_KEY` - RAGFlow API key(필수)
- `RAGFLOW_API_BASE` - RAGFlow API base URL(선택 사항, 기본값 `http://localhost:9380`)

### 파라미터

다음 값은 `litellm_params`로도 전달할 수 있습니다.

- `api_key` - RAGFlow API key(`RAGFLOW_API_KEY` 환경 변수보다 우선)
- `api_base` - RAGFlow API base URL(`RAGFLOW_API_BASE` 환경 변수보다 우선)

## Dataset 생성 옵션

### 기본 Dataset 생성

```python
response = litellm.vector_stores.create(
    name="basic-dataset",
    custom_llm_provider="ragflow"
)
```

### Chunk Method를 사용하는 Dataset

RAGFlow는 문서 유형별로 여러 chunk method를 지원합니다.

<Tabs>
<TabItem value="naive" label="Naive (General)">

```python
response = litellm.vector_stores.create(
    name="general-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "naive",
        "parser_config": {
            "chunk_token_num": 512,
            "delimiter": "\n",
            "html4excel": False,
            "layout_recognize": "DeepDOC"
        }
    }
)
```

</TabItem>

<TabItem value="book" label="Book">

```python
response = litellm.vector_stores.create(
    name="book-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "book",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>

<TabItem value="qa" label="Q&A">

```python
response = litellm.vector_stores.create(
    name="qa-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "qa",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>

<TabItem value="paper" label="Paper">

```python
response = litellm.vector_stores.create(
    name="paper-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "paper",
        "parser_config": {
            "raptor": {
                "use_raptor": False
            }
        }
    }
)
```

</TabItem>
</Tabs>

### Ingestion Pipeline을 사용하는 Dataset

chunk method 대신 ingestion pipeline을 사용할 수 있습니다.

```python
response = litellm.vector_stores.create(
    name="pipeline-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "parse_type": 2,  # Number of parsers in your pipeline
        "pipeline_id": "d0bebe30ae2211f0970942010a8e0005"  # 32-character hex ID
    }
)
```

**참고**: `chunk_method`와 `pipeline_id`는 함께 사용할 수 없습니다. 둘 중 하나만 사용하세요.

### 고급 Parser 설정

```python
response = litellm.vector_stores.create(
    name="advanced-dataset",
    custom_llm_provider="ragflow",
    metadata={
        "chunk_method": "naive",
        "description": "Advanced dataset with custom parser config",
        "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
        "permission": "me",  # or "team"
        "parser_config": {
            "chunk_token_num": 1024,
            "delimiter": "\n!?;。；！？",
            "html4excel": True,
            "layout_recognize": "DeepDOC",
            "auto_keywords": 5,
            "auto_questions": 3,
            "task_page_size": 12,
            "raptor": {
                "use_raptor": True
            },
            "graphrag": {
                "use_graphrag": False
            }
        }
    }
)
```

## 지원되는 Chunk Method

RAGFlow는 다음 chunk method를 지원합니다.

- `naive` - 범용(기본값)
- `book` - 책 문서용
- `email` - 이메일 문서용
- `laws` - 법률 문서용
- `manual` - 수동 chunking
- `one` - 단일 chunk
- `paper` - 학술 논문용
- `picture` - 이미지 문서용
- `presentation` - 프레젠테이션 문서용
- `qa` - Q&A 형식
- `table` - 표 문서용
- `tag` - tag 기반 chunking

## RAGFlow 전용 파라미터

모든 RAGFlow 전용 파라미터는 `metadata` 필드로 전달해야 합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `avatar` | string | avatar의 Base64 인코딩(최대 65535자) |
| `description` | string | dataset에 대한 짧은 설명(최대 65535자) |
| `embedding_model` | string | Embedding model 이름(예: "BAAI/bge-large-zh-v1.5@BAAI") |
| `permission` | string | 접근 권한: "me"(기본값) 또는 "team" |
| `chunk_method` | string | Chunking method(위의 지원 method 참고) |
| `parser_config` | object | Parser 설정(`chunk_method`에 따라 다름) |
| `parse_type` | int | pipeline 내 parser 수(`pipeline_id`와 함께 필수) |
| `pipeline_id` | string | 32자 hex pipeline ID(`parse_type`과 함께 필수) |

## 오류 처리

RAGFlow는 다음 형식으로 오류 응답을 반환합니다.

```json
{
    "code": 101,
    "message": "Dataset name 'my-dataset' already exists"
}
```

LiteLLM은 이를 적절한 exception으로 자동 매핑합니다.

- `code != 0` → 오류 메시지와 함께 exception 발생
- 필수 필드 누락 → `ValueError` 발생
- 함께 사용할 수 없는 파라미터 조합 → `ValueError` 발생

## 제한 사항

- **Search/Retrieval**: RAGFlow vector store는 dataset 관리만 지원합니다. Search 작업은 지원하지 않으며 `NotImplementedError`가 발생합니다.
- **List/Update/Delete**: 이 작업들은 아직 표준 vector store API를 통해 구현되지 않았습니다. RAGFlow native API endpoint를 직접 사용하세요.

## 더 읽어보기

Vector Stores:
- [Vector Store 생성](../vector_stores/create.md)
- [Completions에서 Vector Store 사용](../completion/knowledgebase.md)
- [Vector Store 레지스트리](../completion/knowledgebase.md#vectorstoreregistry)
