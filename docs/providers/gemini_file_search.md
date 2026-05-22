import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini 파일 검색

LiteLLM에서 Google Gemini의 파일 검색을 사용해 검색 증강 생성(RAG)을 수행합니다.

Gemini 파일 검색은 데이터를 가져오고 청크로 나눈 뒤 인덱싱하여 사용자 프롬프트와 관련된 정보를 빠르게 검색할 수 있게 합니다. 검색된 정보는 모델에 컨텍스트로 제공되어 더 정확하고 관련성 높은 답변을 생성하는 데 사용됩니다.

[공식 Gemini 파일 검색 문서](https://ai.google.dev/gemini-api/docs/file-search)

## 기능

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ❌ | 비용 계산은 아직 구현되지 않았습니다 |
| 로깅 | ✅ | 전체 요청/응답 로깅 |
| RAG Ingest API | ✅ | 업로드 → 청크 분할 → 임베딩 → 저장 |
| Vector Store Search | ✅ | 메타데이터 필터로 검색 |
| 커스텀 청킹 | ✅ | 청크 크기와 겹침 범위 설정 |
| 메타데이터 필터링 | ✅ | 커스텀 메타데이터로 필터링 |
| 인용 | ✅ | grounding metadata에서 추출 |

## 빠른 시작

### 설정

Gemini API 키를 설정합니다.

```bash
export GEMINI_API_KEY="your-api-key"
# or
export GOOGLE_API_KEY="your-api-key"
```

### 기본 RAG 수집

<Tabs>
<TabItem value="python" label="Python SDK">

```python
import litellm

# Ingest a document
response = await litellm.aingest(
    ingest_options={
        "name": "my-document-store",
        "vector_store": {
            "custom_llm_provider": "gemini"
        }
    },
    file_data=("document.txt", b"Your document content", "text/plain")
)

print(f"Vector Store ID: {response['vector_store_id']}")
print(f"File ID: {response['file_id']}")
```

</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy">

```bash
curl -X POST "http://localhost:4000/v1/rag/ingest" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "file": {
      "filename": "document.txt",
      "content": "'$(base64 -i document.txt)'",
      "content_type": "text/plain"
    },
    "ingest_options": {
      "name": "my-document-store",
      "vector_store": {
        "custom_llm_provider": "gemini"
      }
    }
  }'
```

</TabItem>
</Tabs>

### 벡터 저장소 검색

<Tabs>
<TabItem value="python" label="Python SDK">

```python
import litellm

# Search the vector store
response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is the main topic?",
    custom_llm_provider="gemini",
    max_num_results=5
)

for result in response["data"]:
    print(f"Score: {result.get('score')}")
    print(f"Content: {result['content'][0]['text']}")
```

</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy">

```bash
curl -X POST "http://localhost:4000/v1/vector_stores/fileSearchStores/your-store-id/search" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "custom_llm_provider": "gemini",
    "max_num_results": 5
  }'
```

</TabItem>
</Tabs>

## 고급 기능

### Custom Chunking 설정

문서를 청크로 분할하는 방식을 제어합니다.

```python
import litellm

response = await litellm.aingest(
    ingest_options={
        "name": "custom-chunking-store",
        "vector_store": {
            "custom_llm_provider": "gemini"
        },
        "chunking_strategy": {
            "white_space_config": {
                "max_tokens_per_chunk": 200,
                "max_overlap_tokens": 20
            }
        }
    },
    file_data=("document.txt", document_content, "text/plain")
)
```

**청킹 매개변수:**
- `max_tokens_per_chunk`: 청크당 최대 토큰 수(기본값: 800, 최솟값: 100, 최댓값: 4096)
- `max_overlap_tokens`: 청크 사이의 겹침 토큰 수(기본값: 400)

### 메타데이터 필터링

파일에 커스텀 메타데이터를 연결하고 검색을 필터링합니다.

#### 수집 중 메타데이터 연결

```python
import litellm

response = await litellm.aingest(
    ingest_options={
        "name": "metadata-store",
        "vector_store": {
            "custom_llm_provider": "gemini",
            "custom_metadata": [
                {"key": "author", "string_value": "John Doe"},
                {"key": "year", "numeric_value": 2024},
                {"key": "category", "string_value": "documentation"}
            ]
        }
    },
    file_data=("document.txt", document_content, "text/plain")
)
```

#### 메타데이터 필터로 검색

```python
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is LiteLLM?",
    custom_llm_provider="gemini",
    filters={"author": "John Doe", "category": "documentation"}
)
```

**필터 구문:**
- 단순 동등 조건: `{"key": "value"}`
- Gemini 변환 결과: `key="value"`
- 여러 필터는 AND로 결합됩니다

### 기존 벡터 저장소 사용

기존 파일 검색 저장소로 수집합니다.

```python
import litellm

# First, create a store
create_response = await litellm.vector_stores.acreate(
    name="My Persistent Store",
    custom_llm_provider="gemini"
)
store_id = create_response["id"]

# Then ingest multiple documents into it
for doc in documents:
    await litellm.aingest(
        ingest_options={
            "vector_store": {
                "custom_llm_provider": "gemini",
                "vector_store_id": store_id  # Reuse existing store
            }
        },
        file_data=(doc["name"], doc["content"], doc["type"])
    )
```

### 인용 추출

Gemini는 인용이 포함된 grounding metadata를 제공합니다.

```python
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="Explain the concept",
    custom_llm_provider="gemini"
)

for result in response["data"]:
    # Access citation information
    if "attributes" in result:
        print(f"URI: {result['attributes'].get('uri')}")
        print(f"Title: {result['attributes'].get('title')}")
    
    # Content with relevance score
    print(f"Score: {result.get('score')}")
    print(f"Text: {result['content'][0]['text']}")
```

## 전체 예제

엔드 투 엔드 워크플로입니다.

```python
import litellm

# 1. Create a File Search store
store_response = await litellm.vector_stores.acreate(
    name="Knowledge Base",
    custom_llm_provider="gemini"
)
store_id = store_response["id"]
print(f"Created store: {store_id}")

# 2. Ingest documents with custom chunking and metadata
documents = [
    {
        "name": "intro.txt",
        "content": b"Introduction to LiteLLM...",
        "metadata": [
            {"key": "section", "string_value": "intro"},
            {"key": "priority", "numeric_value": 1}
        ]
    },
    {
        "name": "advanced.txt",
        "content": b"Advanced features...",
        "metadata": [
            {"key": "section", "string_value": "advanced"},
            {"key": "priority", "numeric_value": 2}
        ]
    }
]

for doc in documents:
    ingest_response = await litellm.aingest(
        ingest_options={
            "name": f"ingest-{doc['name']}",
            "vector_store": {
                "custom_llm_provider": "gemini",
                "vector_store_id": store_id,
                "custom_metadata": doc["metadata"]
            },
            "chunking_strategy": {
                "white_space_config": {
                    "max_tokens_per_chunk": 300,
                    "max_overlap_tokens": 50
                }
            }
        },
        file_data=(doc["name"], doc["content"], "text/plain")
    )
    print(f"Ingested: {doc['name']}")

# 3. Search with filters
search_response = await litellm.vector_stores.asearch(
    vector_store_id=store_id,
    query="How do I get started?",
    custom_llm_provider="gemini",
    filters={"section": "intro"},
    max_num_results=3
)

# 4. Process results
for i, result in enumerate(search_response["data"]):
    print(f"\nResult {i+1}:")
    print(f"  Score: {result.get('score')}")
    print(f"  File: {result.get('filename')}")
    print(f"  Content: {result['content'][0]['text'][:100]}...")
```

## 지원되는 파일 형식

Gemini 파일 검색은 다양한 파일 형식을 지원합니다.

### 문서
- PDF (`application/pdf`)
- Microsoft Word 문서(`.docx`, `.doc`)
- Microsoft Excel 문서(`.xlsx`, `.xls`)
- Microsoft PowerPoint 문서(`.pptx`)
- OpenDocument 형식(`.odt`, `.ods`, `.odp`)

### 텍스트 파일
- Plain text (`text/plain`)
- Markdown (`text/markdown`)
- HTML (`text/html`)
- CSV (`text/csv`)
- JSON (`application/json`)
- XML (`application/xml`)

### 코드 파일
- Python, JavaScript, TypeScript, Java, C/C++, Go, Rust 등의 언어
- 대부분의 일반적인 프로그래밍 언어가 지원됩니다

[Gemini의 전체 지원 파일 형식 목록](https://ai.google.dev/gemini-api/docs/file-search#supported-file-types)을 참고하세요.

## 가격

- **인덱싱**: 1백만 토큰당 $0.15(임베딩 가격)
- **저장소**: 무료
- **쿼리 임베딩**: 무료
- **검색된 토큰**: 일반 컨텍스트 토큰으로 과금

## 지원되는 모델

파일 검색은 다음 모델에서 작동합니다.
- `gemini-3-pro-preview`
- `gemini-2.5-pro`
- `gemini-2.5-flash`(및 프리뷰 버전)
- `gemini-2.5-flash-lite`(및 프리뷰 버전)

## 문제 해결

### 인증 오류

```python
# Ensure API key is set
import os
os.environ["GEMINI_API_KEY"] = "your-api-key"

# Or pass explicitly
response = await litellm.aingest(
    ingest_options={
        "vector_store": {
            "custom_llm_provider": "gemini",
            "api_key": "your-api-key"
        }
    },
    file_data=(...)
)
```

### 저장소를 찾을 수 없음

전체 저장소 이름 형식을 사용하고 있는지 확인합니다.
- ✅ `fileSearchStores/abc123`
- ❌ `abc123`

### 큰 파일

100MB보다 큰 파일은 수집하기 전에 더 작은 청크로 나눕니다.

### 느린 인덱싱

수집 후 Gemini가 문서를 인덱싱하는 데 시간이 필요할 수 있습니다. 검색하기 전에 몇 초간 기다립니다.

```python
import time

# After ingest
await litellm.aingest(...)

# Wait for indexing
time.sleep(5)

# Then search
await litellm.vector_stores.asearch(...)
```

## 관련 자료

- [Gemini 파일 검색 공식 문서](https://ai.google.dev/gemini-api/docs/file-search)
- [LiteLLM RAG 수집 API](/litellm-docs-kr/docs/rag_ingest)
- [LiteLLM 벡터 저장소 검색](/litellm-docs-kr/docs/vector_stores/search)
- [채팅에서 벡터 저장소 사용](/litellm-docs-kr/docs/completion/knowledgebase)
