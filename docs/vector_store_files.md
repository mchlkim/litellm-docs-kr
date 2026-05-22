# /vector_stores/\{vector_store_id\}/files

Vector store files는 vector store 안에 있는 개별 파일을 나타냅니다.

| 기능 | 지원 여부 |
|---------|-----------|
| 로깅 | ✅ (전체 요청/응답 로깅) |
| 지원 프로바이더 | `openai` |


## 지원되는 작업

| 작업 | 설명 | OpenAI Python Client | LiteLLM Proxy |
|-----------|-------------|----------------------|---------------|
| vector store file 생성 | 선택적 청킹 재정의를 사용해 파일을 vector store에 연결 | ✅ | ✅ |
| vector store file 목록 조회 | 필터를 포함한 페이지네이션 목록 조회 | ✅ | ✅ |
| vector store file 조회 | 단일 파일의 메타데이터 가져오기 | ✅ | ✅ |
| vector store file 삭제 | 저장소에서 파일 제거(파일 객체는 유지됨) | ✅ | ✅ |
| vector store file content 조회 | 처리된 청크 스트리밍 | ❌ | ✅ |
| vector store file attributes 업데이트 | 사용자 지정 attributes 패치 | ❌ | ✅ |

:::note
Vector store 지원은 현재 **OpenAI vector stores 및 OpenAI에 업로드된 file IDs에서만** 작동합니다.
:::


## vector store file 생성

<code>POST http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files</code>

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # LiteLLM proxy or OpenAI base
    api_key="sk-1234"
)

vector_store_file = client.vector_stores.files.create(
    vector_store_id="vs_69172088a18c8191ab3e2621aa87d1ee",
    file_id="file-NDbEDJTfqVh7S4Ugi3CGYw",
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,
            "chunk_overlap_tokens": 400,
        },
    },
)

print(vector_store_file)
```

## vector store files 목록 조회

<code>GET http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files</code>

파라미터:

- `vector_store_id` (경로, 필수)
- `after` / `before` (쿼리, 선택 사항) – 페이지네이션 커서
- `filter` (쿼리, 선택 사항) – `in_progress`, `completed`, `failed`, `cancelled`
- `limit` (쿼리, 선택 사항, 기본값 `20`, 범위 `1-100`)
- `order` (쿼리, 선택 사항, 기본값 `desc`)

```python
vector_store_files = client.vector_stores.files.list(
    vector_store_id="vs_abc123"
)
print(vector_store_files)
```

## vector store file 조회

<code>GET http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files/&#123;file_id&#125;</code>

```python
vector_store_file = client.vector_stores.files.retrieve(
    vector_store_id="vs_abc123",
    file_id="file-abc123"
)
print(vector_store_file)
```

## vector store file 삭제

<code>DELETE http://localhost:4000/v1/vector_stores/&#123;vector_store_id&#125;/files/&#123;file_id&#125;</code>

```python
deleted_vector_store_file = client.vector_stores.files.delete(
    vector_store_id="vs_abc123",
    file_id="file-abc123"
)
print(deleted_vector_store_file)
```

## Proxy 전용 엔드포인트

원시 content 청크 또는 attribute 업데이트가 필요할 때는 LiteLLM Proxy를 직접 호출하세요.

### file content 조회

```bash
curl -X GET "http://localhost:4000/v1/vector_stores/\{vector_store_id\}/files/\{file_id\}/content" \
  -H "Authorization: Bearer sk-1234"
```

### file attributes 업데이트

```bash
curl -X POST "http://localhost:4000/v1/vector_stores/\{vector_store_id\}/files/\{file_id\}" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
        "attributes": {
          "category": "support-faq",
          "language": "en"
        }
      }'
```
