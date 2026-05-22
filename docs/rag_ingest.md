# /rag/ingest

문서 ingestion을 위한 올인원 파이프라인: **Upload → Chunk → Embed → Vector Store**

| 기능 | 지원 여부 |
|---------|-----------|
| Logging | 예 |
| 지원 프로바이더 | `openai`, `bedrock`, `vertex_ai`, `gemini`, `s3_vectors` |

:::tip
문서를 ingest한 뒤 [/rag/query](./rag_query.md)를 사용해 ingest된 콘텐츠를 검색하고 응답을 생성하세요.
:::

## 빠른 시작

### OpenAI

```bash showLineNumbers title="OpenAI vector store로 Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

### Bedrock

```bash showLineNumbers title="Bedrock Knowledge Base로 Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"bedrock\"
            }
        }
    }"
```

### `Vertex AI RAG Engine`

```bash showLineNumbers title="Vertex AI RAG Corpus로 Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"vertex_ai\",
                \"vector_store_id\": \"your-corpus-id\",
                \"gcs_bucket\": \"your-gcs-bucket\"
            }
        }
    }"
```

### AWS S3 Vectors

```bash showLineNumbers title="S3 Vectors로 Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"embedding\": {
                \"model\": \"text-embedding-3-small\"
            },
            \"vector_store\": {
                \"custom_llm_provider\": \"s3_vectors\",
                \"vector_bucket_name\": \"my-embeddings\",
                \"aws_region_name\": \"us-west-2\"
            }
        }
    }"
```

## 응답

```json
{
  "id": "ingest_abc123",
  "status": "completed",
  "vector_store_id": "vs_xyz789",
  "file_id": "file_123"
}
```

## RAG로 Query

ingestion 이후 [/rag/query](./rag_query.md) 엔드포인트를 사용해 검색하고 LLM 응답을 생성합니다.

```bash showLineNumbers title="RAG Query"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "What is the main topic?"}],
        "retrieval_config": {
            "vector_store_id": "vs_xyz789",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

이 요청은 다음을 수행합니다.
1. 관련 context를 찾기 위해 vector store를 검색합니다.
2. 검색된 context를 messages 앞에 추가합니다.
3. LLM 응답을 생성합니다.

### 직접 Vector Store 검색

또는 `/vector_stores/{vector_store_id}/search`로 vector store를 직접 검색할 수 있습니다.

```bash showLineNumbers title="vector store 검색"
curl -X POST "http://localhost:4000/v1/vector_stores/vs_xyz789/search" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "What is the main topic?",
        "max_num_results": 5
    }'
```

## End-to-End 예제

### OpenAI

#### 1. 문서 Ingest

```bash showLineNumbers title="1단계: Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"test_document.txt\",
            \"content\": \"$(base64 -i test_document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"name\": \"test-basic-ingest\",
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

응답:
```json
{
  "id": "ingest_d834f544-fc5e-4751-902d-fb0bcc183b85",
  "status": "completed",
  "vector_store_id": "vs_692658d337c4819183f2ad8488d12fc9",
  "file_id": "file-M2pJJiWH56cfUP4Fe7rJay"
}
```

#### 2. Query

```bash showLineNumbers title="2단계: Query"
curl -X POST "http://localhost:4000/v1/vector_stores/vs_692658d337c4819183f2ad8488d12fc9/search" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "What is LiteLLM?",
        "custom_llm_provider": "openai"
    }'
```

응답:
```json
{
  "object": "vector_store.search_results.page",
  "search_query": ["What is LiteLLM?"],
  "data": [
    {
      "file_id": "file-M2pJJiWH56cfUP4Fe7rJay",
      "filename": "test_document.txt",
      "score": 0.4004629778869299,
      "attributes": {},
      "content": [
        {
          "type": "text",
          "text": "Test document abc123 for RAG ingestion.\nThis is a sample document to test the RAG ingest API.\nLiteLLM provides a unified interface for vector stores."
        }
      ]
    }
  ],
  "has_more": false,
  "next_page": null
}
```

## 요청 파라미터

### 최상위

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `file` | object | file/file_url/file_id 중 하나 필수 | Base64로 인코딩된 파일 |
| `file.filename` | string | 예 | 확장자가 포함된 파일명 |
| `file.content` | string | 예 | Base64로 인코딩된 콘텐츠 |
| `file.content_type` | string | 예 | MIME 타입(예: `text/plain`) |
| `file_url` | string | file/file_url/file_id 중 하나 필수 | 파일을 가져올 URL |
| `file_id` | string | file/file_url/file_id 중 하나 필수 | 기존 file ID |
| `ingest_options` | object | 예 | 파이프라인 구성 |

### ingest_options

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `vector_store` | object | 예 | Vector store 구성 |
| `name` | string | 아니요 | logging용 파이프라인 이름 |

### vector_store (OpenAI)

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"openai"` |
| `vector_store_id` | string | auto-create | 기존 vector store ID |

### vector_store (Bedrock)

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"bedrock"` |
| `vector_store_id` | string | auto-create | 기존 Knowledge Base ID |
| `wait_for_ingestion` | boolean | `false` | indexing 완료까지 대기 |
| `ingestion_timeout` | integer | `300` | timeout 초 단위(대기하는 경우) |
| `s3_bucket` | string | auto-create | 문서용 S3 bucket |
| `s3_prefix` | string | `"data/"` | S3 key prefix |
| `embedding_model` | string | `amazon.titan-embed-text-v2:0` | Bedrock embedding 모델 |
| `aws_region_name` | string | `us-west-2` | AWS region |

:::info Bedrock 자동 생성
`vector_store_id`를 생략하면 LiteLLM이 다음 리소스를 자동으로 생성합니다.
- 문서 저장용 S3 bucket
- `OpenSearch Serverless` collection
- 필요한 권한이 포함된 IAM role
- `Bedrock Knowledge Base`
- Data Source
:::

### vector_store (Vertex AI)

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"vertex_ai"` |
| `vector_store_id` | string | **required** | RAG corpus ID |
| `gcs_bucket` | string | **required** | 파일 업로드용 GCS bucket |
| `vertex_project` | string | env `VERTEXAI_PROJECT` | GCP project ID |
| `vertex_location` | string | `us-central1` | GCP region |
| `vertex_credentials` | string | ADC | credentials JSON 경로 |
| `wait_for_import` | boolean | `true` | import 완료까지 대기 |
| `import_timeout` | integer | `600` | timeout 초 단위(대기하는 경우) |

:::info Vertex AI 사전 준비
1. Vertex AI console 또는 API로 RAG corpus를 생성합니다.
2. 파일 업로드용 GCS bucket을 생성합니다.
3. `gcloud auth application-default login`으로 인증합니다.
4. 설치: `uv add 'google-cloud-aiplatform>=1.60.0'`
:::

### vector_store (`AWS S3 Vectors`)

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"s3_vectors"` |
| `vector_bucket_name` | string | **required** | S3 vector bucket 이름 |
| `index_name` | string | auto-create | Vector index 이름 |
| `dimension` | integer | auto-detect | vector dimension(embedding model에서 자동 감지) |
| `distance_metric` | string | `cosine` | distance metric: `cosine` 또는 `euclidean` |
| `non_filterable_metadata_keys` | array | `["source_text"]` | filtering에서 제외할 metadata key |
| `aws_region_name` | string | `us-west-2` | AWS region |
| `aws_access_key_id` | string | env | AWS access key |
| `aws_secret_access_key` | string | env | AWS secret key |

:::info S3 Vectors 자동 생성
`index_name`을 생략하면 LiteLLM이 다음을 자동으로 생성합니다.
- S3 vector bucket(존재하지 않는 경우)
- embedding model에서 자동 감지된 dimension으로 구성된 vector index

**Dimension 자동 감지**: 지정한 모델에 test embedding 요청을 보내 vector dimension을 자동으로 감지합니다. dimension을 수동으로 지정할 필요가 없습니다.

**지원 Embedding 모델**: LiteLLM이 지원하는 모든 embedding model(OpenAI, Cohere, Bedrock, Azure 등)과 함께 작동합니다.
:::

**자동 감지 예제:**
```json
{
  "embedding": {
    "model": "text-embedding-3-small"  // Dimension auto-detected as 1536
  },
  "vector_store": {
    "custom_llm_provider": "s3_vectors",
    "vector_bucket_name": "my-embeddings"
  }
}
```

**사용자 지정 embedding provider 예제:**
```json
{
  "embedding": {
    "model": "cohere/embed-english-v3.0"  // Dimension auto-detected as 1024
  },
  "vector_store": {
    "custom_llm_provider": "s3_vectors",
    "vector_bucket_name": "my-embeddings",
    "distance_metric": "cosine"
  }
}
```

## 입력 예제

### File (Base64)

```json title="요청 body"
{
  "file": {
    "filename": "document.txt",
    "content": "<base64-encoded-content>",
    "content_type": "text/plain"
  },
  "ingest_options": {
    "vector_store": {"custom_llm_provider": "openai"}
  }
}
```

### File URL

```bash showLineNumbers title="URL에서 Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "file_url": "https://example.com/document.pdf",
        "ingest_options": {"vector_store": {"custom_llm_provider": "openai"}}
    }'
```

## Chunking 전략

embedding 전에 문서를 chunk로 나누는 방식을 제어합니다. `ingest_options`에 `chunking_strategy`를 지정하세요.

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `chunk_size` | integer | `1000` | 각 chunk의 최대 크기 |
| `chunk_overlap` | integer | `200` | 연속 chunk 사이의 overlap |

### `Vertex AI RAG Engine`

Vertex AI RAG Engine은 `chunking_strategy` 파라미터를 통해 사용자 지정 chunking을 지원합니다. chunk는 import 중 server-side에서 처리됩니다.

```bash showLineNumbers title="사용자 지정 chunking을 적용한 Vertex AI"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"chunking_strategy\": {
                \"chunk_size\": 500,
                \"chunk_overlap\": 100
            },
            \"vector_store\": {
                \"custom_llm_provider\": \"vertex_ai\",
                \"vector_store_id\": \"your-corpus-id\",
                \"gcs_bucket\": \"your-gcs-bucket\"
            }
        }
    }"
```
