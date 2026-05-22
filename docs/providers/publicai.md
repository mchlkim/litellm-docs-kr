import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# PublicAI

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | PublicAI는 swiss-ai apertus 모델 같은 주요 모델을 포함한 대규모 언어 모델을 제공합니다. |
| LiteLLM의 Provider Route | `publicai/` |
| Provider 문서 링크 | [PublicAI ↗](https://platform.publicai.co/) |
| Base URL | `https://platform.publicai.co/` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />
<br />

https://platform.publicai.co/

**모든 PublicAI 모델을 지원합니다. completion 요청을 보낼 때 `publicai/`를 prefix로 설정하기만 하면 됩니다.**

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["PUBLICAI_API_KEY"] = ""  # your PublicAI API key
```

다음과 같이 base url을 덮어쓸 수 있습니다.

```
os.environ["PUBLICAI_API_BASE"] = "https://platform.publicai.co/v1"
```

## 사용법 - LiteLLM Python SDK

### 비스트리밍 {#non-streaming}

```python showLineNumbers title="PublicAI Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["PUBLICAI_API_KEY"] = ""  # your PublicAI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# PublicAI call
response = completion(
    model="publicai/swiss-ai/apertus-8b-instruct", 
    messages=messages
)

print(response)
```

### 스트리밍 {#streaming}

```python showLineNumbers title="PublicAI Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["PUBLICAI_API_KEY"] = ""  # your PublicAI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# PublicAI call with streaming
response = completion(
    model="publicai/swiss-ai/apertus-8b-instruct", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 구성 파일에 다음 내용을 추가하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: swiss-ai-apertus-8b
    litellm_params:
      model: publicai/swiss-ai/apertus-8b-instruct
      api_key: os.environ/PUBLICAI_API_KEY

  - model_name: swiss-ai-apertus-70b
    litellm_params:
      model: publicai/swiss-ai/apertus-70b-instruct
      api_key: os.environ/PUBLICAI_API_KEY
```

LiteLLM Proxy 서버를 시작하세요.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="PublicAI via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="swiss-ai-apertus-8b",
    messages=[{"role": "user", "content": "hello from litellm"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="PublicAI via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="swiss-ai-apertus-8b",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="PublicAI via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/swiss-ai-apertus-8b",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="PublicAI via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/swiss-ai-apertus-8b",
    messages=[{"role": "user", "content": "hello from litellm"}],
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

```bash showLineNumbers title="PublicAI via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "swiss-ai-apertus-8b",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

```bash showLineNumbers title="PublicAI via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "swiss-ai-apertus-8b",
    "messages": [{"role": "user", "content": "hello from litellm"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 대한 자세한 정보는 [LiteLLM Proxy documentation](../providers/litellm_proxy)을 참고하세요.
