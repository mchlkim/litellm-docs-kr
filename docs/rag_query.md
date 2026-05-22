# /rag/query

RAG Query endpoint: **Vector Store 검색 → (Rerank) → LLM Completion**

| 기능 | 지원 여부 |
|---------|-----------|
| 로깅 | 예 |
| Streaming | 예 |
| Reranking | 예(선택 사항) |
| 지원 프로바이더 | `openai`, `bedrock`, `vertex_ai` |

## 빠른 시작

```bash showLineNumbers title="RAG Query with OpenAI"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

## 동작 방식

RAG query endpoint는 다음 단계를 수행합니다.

1. **Query 추출**: 마지막 user message에서 query text를 추출합니다.
2. **Vector Store 검색**: 지정한 vector store에서 관련 context를 검색합니다.
3. **Rerank(선택 사항)**: reranking model로 검색 결과를 다시 정렬합니다.
4. **Response 생성**: 검색된 context를 messages 앞에 붙여 LLM을 호출합니다.

## 응답

응답은 표준 OpenAI chat completion 형식을 따르며 추가 search metadata를 포함합니다.

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1703123456,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "LiteLLM is a unified interface for 100+ LLMs..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 50,
    "total_tokens": 200
  },
  "_hidden_params": {
    "search_results": {...},
    "rerank_results": {...}
  }
}
```

## Reranking 사용

결과 품질을 개선하려면 `rerank` 설정을 추가합니다.

```bash showLineNumbers title="RAG Query with Reranking"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai",
            "top_k": 10
        },
        "rerank": {
            "enabled": true,
            "model": "cohere/rerank-english-v3.0",
            "top_n": 3
        }
    }'
```

## Streaming

실시간 응답에는 streaming을 활성화합니다.

```bash showLineNumbers title="RAG Query with Streaming"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai"
        },
        "stream": true
    }'
```

## 요청 파라미터

### 최상위

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | 예 | 생성에 사용할 LLM model |
| `messages` | array | 예 | chat message 배열(OpenAI 형식) |
| `retrieval_config` | object | 예 | Vector store 검색 설정 |
| `rerank` | object | 아니요 | Reranking 설정 |
| `stream` | boolean | 아니요 | Streaming 활성화(기본값: `false`) |

### retrieval_config

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `vector_store_id` | string | **required** | 검색할 vector store의 ID |
| `custom_llm_provider` | string | `"openai"` | Vector store provider 지정값 |
| `top_k` | integer | `10` | 가져올 결과 수 |

### rerank

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | `false` | Reranking 활성화 |
| `model` | string | - | Reranking model(예: `cohere/rerank-english-v3.0`) |
| `top_n` | integer | `5` | Reranking 후 결과 수 |

## End-to-End 예제

### 1. 문서 수집

먼저 [/rag/ingest](./rag_ingest.md) endpoint로 문서를 수집합니다.

```bash showLineNumbers title="Step 1: Ingest"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"company_docs.txt\",
            \"content\": \"$(base64 -i company_docs.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

응답:
```json
{
  "id": "ingest_abc123",
  "status": "completed",
  "vector_store_id": "vs_xyz789",
  "file_id": "file-123"
}
```

### 2. RAG로 질의

이제 수집된 문서에 대해 질의합니다.

```bash showLineNumbers title="Step 2: Query"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": "What products does the company offer?"}
        ],
        "retrieval_config": {
            "vector_store_id": "vs_xyz789",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

응답:
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on the company documents, the company offers..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

## Provider 예제

### Bedrock

```bash showLineNumbers title="RAG Query with Bedrock"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "KNOWLEDGE_BASE_ID",
            "custom_llm_provider": "bedrock",
            "top_k": 5
        }
    }'
```

### Vertex AI

```bash showLineNumbers title="RAG Query with Vertex AI"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "vertex_ai/gemini-1.5-pro",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "your-corpus-id",
            "custom_llm_provider": "vertex_ai",
            "top_k": 5
        }
    }'
```

## Python SDK

```python showLineNumbers title="Using litellm.aquery()"
import litellm

response = await litellm.aquery(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    retrieval_config={
        "vector_store_id": "vs_abc123",
        "custom_llm_provider": "openai",
        "top_k": 5,
    },
    rerank={
        "enabled": True,
        "model": "cohere/rerank-english-v3.0",
        "top_n": 3,
    },
)

print(response.choices[0].message.content)
```
