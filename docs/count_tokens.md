import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 토큰 계산 {#token-counting}

## 개요

LiteLLM은 프로바이더별 토큰 계산 API를 호출해 정확한 토큰 수를 제공합니다. 요청을 보내기 전에 정확한 토큰 수를 확인할 수 있어 비용 예측과 컨텍스트 창 관리에 도움이 됩니다.

| 기능 | 세부 정보 |
|---------|---------|
| SDK 메서드 | `litellm.acount_tokens()` |
| Proxy 엔드포인트 | `/v1/messages/count_tokens` (Anthropic 형식), `/v1/responses/input_tokens` (OpenAI 형식) |
| 대체 계산 | 지원되지 않는 프로바이더에는 로컬 tiktoken 기반 계산 사용 |

## 지원 프로바이더

| 프로바이더 | 토큰 계산 API | 형식 |
|----------|-------------------|--------|
| OpenAI | [Responses API `/input_tokens`](https://platform.openai.com/docs/api-reference/responses/input-tokens) | OpenAI Responses 형식 |
| Anthropic | [Messages `/count_tokens`](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) | Anthropic Messages 형식 |
| Vertex AI (Claude) | Vertex AI Partner 모델 Token Counter | Anthropic Messages 형식 |
| Bedrock (Claude) | AWS Bedrock CountTokens API | Anthropic Messages 형식 |
| Gemini | Google AI Studio countTokens API | Anthropic Messages 형식 |
| Vertex AI (Gemini) | Vertex AI countTokens API | Anthropic Messages 형식 |
| 기타 프로바이더 | 로컬 tiktoken 대체 계산 | N/A |

## SDK 사용법

### 기본 사용법 {#basic-usage}

```python
import asyncio
import litellm

async def main():
    # OpenAI
    result = await litellm.acount_tokens(
        model="openai/gpt-4o",
        messages=[{"role": "user", "content": "Hello, how are you?"}],
    )
    print(f"Token count: {result.total_tokens}")
    print(f"Tokenizer: {result.tokenizer_type}")  # "openai_api"

    # Anthropic
    result = await litellm.acount_tokens(
        model="anthropic/claude-3-5-sonnet-20241022",
        messages=[{"role": "user", "content": "Hello, how are you?"}],
    )
    print(f"Token count: {result.total_tokens}")
    print(f"Tokenizer: {result.tokenizer_type}")  # "anthropic_api"

asyncio.run(main())
```

### 도구와 시스템 메시지 사용 {#with-tools-and-system-message}

```python
import asyncio
import litellm

async def main():
    result = await litellm.acount_tokens(
        model="openai/gpt-4o",
        messages=[{"role": "user", "content": "What's the weather in Paris?"}],
        tools=[{
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {"city": {"type": "string"}},
                },
            },
        }],
        system="You are a helpful weather assistant.",
    )
    print(f"Token count (with tools): {result.total_tokens}")

asyncio.run(main())
```

### 응답 형식

`litellm.acount_tokens()`는 `TokenCountResponse`를 반환합니다.

```python
TokenCountResponse(
    total_tokens=15,           # Token count
    request_model="openai/gpt-4o",  # Model requested
    model_used="gpt-4o",      # Model used for counting
    tokenizer_type="openai_api",    # "openai_api", "anthropic_api", "local_tokenizer"
    original_response={"input_tokens": 15},  # Raw API response
    error=False,               # True if counting failed
    error_message=None,        # Error details if failed
)
```

### 대체 계산 동작 {#fallback-behavior}

프로바이더가 토큰 계산 API를 지원하지 않거나 API 키가 없으면 `acount_tokens()`는 자동으로 로컬 tiktoken 기반 계산으로 대체합니다.

```python
# Unsupported provider → automatic fallback
result = await litellm.acount_tokens(
    model="together_ai/meta-llama/Llama-3-8b-chat-hf",
    messages=[{"role": "user", "content": "Hello"}],
)
print(result.tokenizer_type)  # "local_tokenizer"
```

## Proxy 사용법

### OpenAI 형식 — `/v1/responses/input_tokens` {#openai-format-v1responsesinput_tokens}

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl -X POST "http://localhost:4000/v1/responses/input_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "input": "Hello, how are you?"
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python
import httpx

response = httpx.post(
    "http://localhost:4000/v1/responses/input_tokens",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-1234"
    },
    json={
        "model": "gpt-4o",
        "input": "Hello, how are you?"
    }
)

print(response.json())
# {"input_tokens": 7}
```

</TabItem>
</Tabs>

**응답:**
```json
{"input_tokens": 7}
```

### Anthropic 형식 — `/v1/messages/count_tokens` {#anthropic-format-v1messagescount_tokens}

전체 문서는 [Anthropic Token Counting](./anthropic_count_tokens.md) 문서를 참고하세요.

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

## Proxy 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
```
