import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vercel AI Gateway

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Vercel AI Gateway는 단일 엔드포인트를 통해 여러 AI 공급자에 접근할 수 있는 통합 인터페이스를 제공하며, 캐싱, 속도 제한, 분석 기능을 기본으로 포함합니다. |
| LiteLLM의 공급자 라우트 | `vercel_ai_gateway/` |
| 공급자 문서 링크 | [Vercel AI Gateway Documentation ↗](https://vercel.com/docs/ai-gateway) |
| Base URL | `https://ai-gateway.vercel.sh/v1` |
| 지원되는 작업 | `/chat/completions`, `/embeddings`, `/models` |

<br />
<br />

https://vercel.com/docs/ai-gateway

**Vercel AI Gateway를 통해 제공되는 모든 모델을 지원합니다. completion 요청을 보낼 때 `vercel_ai_gateway/`를 접두사로 설정하기만 하면 됩니다.**

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["VERCEL_AI_GATEWAY_API_KEY"] = ""  # your Vercel AI Gateway API key
# OR
os.environ["VERCEL_OIDC_TOKEN"] = ""  # your Vercel OIDC token for authentication
```

## 선택 변수 {#optional-variables}

```python showLineNumbers title="Environment Variables"
os.environ["VERCEL_SITE_URL"] = ""  # your site url
# OR
os.environ["VERCEL_APP_NAME"] = ""  # your app name
```

참고: 키를 발급받는 방법은 [Vercel AI Gateway docs](https://vercel.com/docs/ai-gateway#using-the-ai-gateway-with-an-api-key)를 확인하세요.

## 사용법 - LiteLLM Python SDK

### 비스트리밍 {#non-streaming}

```python showLineNumbers title="Vercel AI Gateway Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Vercel AI Gateway call
response = completion(
    model="vercel_ai_gateway/openai/gpt-4o", 
    messages=messages
)

print(response)
```

### 스트리밍 {#streaming}

```python showLineNumbers title="Vercel AI Gateway Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Vercel AI Gateway call with streaming
response = completion(
    model="vercel_ai_gateway/openai/gpt-4o",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 임베딩 {#embeddings}

```python showLineNumbers title="Vercel AI Gateway Embeddings"
import os
from litellm import embedding

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

# Vercel AI Gateway embedding call
response = embedding(
    model="vercel_ai_gateway/openai/text-embedding-3-small",
    input="Hello world"
)

print(response.data[0]["embedding"][:5])  # Print first 5 dimensions
```

`dimensions` 매개변수도 지정할 수 있습니다.

```python showLineNumbers title="Vercel AI Gateway Embeddings with Dimensions"
response = embedding(
    model="vercel_ai_gateway/openai/text-embedding-3-small",
    input=["Hello world", "Goodbye world"],
    dimensions=768
)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 구성 파일에 다음 내용을 추가하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o-gateway
    litellm_params:
      model: vercel_ai_gateway/openai/gpt-4o
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY

  - model_name: claude-4-sonnet-gateway
    litellm_params:
      model: vercel_ai_gateway/anthropic/claude-4-sonnet
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY

  - model_name: text-embedding-3-small-gateway
    litellm_params:
      model: vercel_ai_gateway/openai/text-embedding-3-small
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY
```

LiteLLM Proxy 서버를 시작하세요.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Vercel AI Gateway via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Vercel AI Gateway via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Vercel AI Gateway via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Vercel AI Gateway via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Vercel AI Gateway via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-4o-gateway",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

```bash showLineNumbers title="Vercel AI Gateway via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-4o-gateway",
    "messages": [{"role": "user", "content": "Hello, how are you?"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 관한 자세한 내용은 [LiteLLM Proxy documentation](../providers/litellm_proxy)을 참조하세요.

## 추가 리소스 {#additional-resources}

- [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
