import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /v1/messages/count_tokens

## 개요

Anthropic 호환 토큰 계산 엔드포인트입니다. 메시지를 모델로 보내기 전에 토큰 수를 계산합니다.

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ❌ | 토큰 계산만 수행하며 비용은 발생하지 않습니다 |
| 로깅 | ✅ | 모든 통합에서 작동합니다 |
| 최종 사용자 추적 | ✅ | |
| 지원 프로바이더 | Anthropic, Vertex AI (Claude), Bedrock (Claude), Gemini, Vertex AI | 프로바이더별 토큰 계산 API로 자동 라우팅됩니다 |

## 빠른 시작

### 1. LiteLLM Proxy 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 2. 토큰 계산

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python
import httpx

response = httpx.post(
    "http://localhost:4000/v1/messages/count_tokens",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-1234"
    },
    json={
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ]
    }
)

print(response.json())
# {"input_tokens": 14}
```

</TabItem>
</Tabs>

**예상 응답:**

```json
{
  "input_tokens": 14
}
```

## LiteLLM Proxy 설정

`config.yaml`에 모델을 추가합니다.

```yaml
model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-vertex
    litellm_params:
      model: vertex_ai/claude-3-5-sonnet-v2@20241022
      vertex_project: my-project
      vertex_location: us-east5
      vertex_count_tokens_location: us-east5 # Optional: Override location for token counting (count_tokens not available on global location)

  - model_name: claude-bedrock
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_region_name: us-west-2
```

## 요청 파라미터

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `model` | string | ✅ | 토큰 계산에 사용할 모델 |
| `messages` | array | ✅ | Anthropic 형식의 메시지 배열 |

### 메시지 형식

```json
{
  "messages": [
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "How are you?"}
  ]
}
```

## 응답 형식

```json
{
  "input_tokens": <number>
}
```

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `input_tokens` | integer | 입력 메시지의 토큰 수 |

## 지원 프로바이더

`/v1/messages/count_tokens` 엔드포인트는 적절한 프로바이더별 토큰 계산 API로 자동 라우팅됩니다.

| 프로바이더 | 토큰 계산 방식 |
|----------|----------------------|
| Anthropic | [Anthropic 토큰 계산 API](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) |
| OpenAI | [OpenAI Responses API `/input_tokens`](https://platform.openai.com/docs/api-reference/responses/input-tokens) — [토큰 계산](./count_tokens.md) 참조 |
| Vertex AI (Claude) | Vertex AI Partner 모델 토큰 카운터 |
| Bedrock (Claude) | AWS Bedrock `CountTokens` API |
| Gemini | Google AI Studio의 `countTokens` API |
| Vertex AI (Gemini) | Vertex AI `countTokens` API |

## 예제

### 시스템 메시지로 토큰 계산

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "You are a helpful assistant. Please help me write a haiku about programming."}
    ]
  }'
```

### 멀티턴 대화의 토큰 계산

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"},
      {"role": "assistant", "content": "The capital of France is Paris."},
      {"role": "user", "content": "What is its population?"}
    ]
  }'
```

### Vertex AI Claude와 함께 사용

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "claude-vertex",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### Bedrock Claude와 함께 사용

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "claude-bedrock",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## Anthropic 패스스루와 비교

LiteLLM은 토큰을 계산하는 두 가지 방법을 제공합니다.

| 엔드포인트 | 설명 | 사용 사례 |
|----------|-------------|----------|
| `/v1/messages/count_tokens` | LiteLLM의 Anthropic 호환 엔드포인트 | 지원되는 모든 프로바이더에서 작동합니다(Anthropic, Vertex AI, Bedrock 등) |
| `/anthropic/v1/messages/count_tokens` | [Anthropic API로 패스스루](./pass_through/anthropic_completion.md#example-2-token-counting-api) | 네이티브 헤더로 Anthropic API에 직접 접근 |

### 패스스루 예제

전체 네이티브 헤더로 Anthropic API에 직접 접근하려면 다음을 사용합니다.

```bash
curl --request POST \
    --url http://0.0.0.0:4000/anthropic/v1/messages/count_tokens \
    --header "x-api-key: $LITELLM_API_KEY" \
    --header "anthropic-version: 2023-06-01" \
    --header "anthropic-beta: token-counting-2024-11-01" \
    --header "content-type: application/json" \
    --data '{
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```
