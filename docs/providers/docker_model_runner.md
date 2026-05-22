import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Docker Model Runner`

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Docker Model Runner를 사용하면 Docker Desktop으로 대규모 언어 모델을 로컬에서 실행할 수 있습니다. |
| LiteLLM의 Provider Route | `docker_model_runner/` |
| Provider 문서 링크 | [Docker Model Runner ↗](https://docs.docker.com/ai/model-runner/) |
| Base URL | `http://localhost:22088` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />
<br />

https://docs.docker.com/ai/model-runner/

**모든 Docker Model Runner 모델을 지원합니다. completion 요청을 보낼 때 `docker_model_runner/`를 접두사로 설정하기만 하면 됩니다.**

## 빠른 시작

Docker Model Runner는 AI 모델을 로컬에서 실행할 수 있게 해 주는 Docker Desktop 기능입니다. OpenAI 호환성을 유지하면서 다른 로컬 솔루션보다 더 나은 성능을 제공합니다.

### 설치

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)을 설치합니다.
2. Docker Desktop 설정에서 Docker Model Runner를 활성화합니다.
3. Docker Desktop을 통해 원하는 모델을 다운로드합니다.

## 환경 변수 {#environment-variables}

```python showLineNumbers title="Environment Variables"
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"  # Optional - defaults to this
os.environ["DOCKER_MODEL_RUNNER_API_KEY"] = "dummy-key"  # Optional - Docker Model Runner may not require auth for local instances
```

**참고:** 
- Docker Model Runner는 일반적으로 로컬에서 실행되며 인증이 필요하지 않을 수 있습니다. 키를 제공하지 않으면 LiteLLM은 기본적으로 더미 키를 사용합니다.
- API base에는 엔진 경로가 포함되어야 합니다(예: `/engines/llama.cpp`).

## API Base 구조 {#api-base-structure}

Docker Model Runner는 고유한 URL 구조를 사용합니다.

```
http://model-runner.docker.internal/engines/{engine}/v1/chat/completions
```

여기서 `{engine}`은 사용하려는 엔진입니다(일반적으로 `llama.cpp`). 

**중요:** 엔진은 모델 이름이 아니라 `api_base` URL에 지정하세요.
- ✅ 올바른 예: `api_base="http://localhost:22088/engines/llama.cpp"`, `model="docker_model_runner/llama-3.1"`
- ❌ 잘못된 예: `api_base="http://localhost:22088"`, `model="docker_model_runner/llama.cpp/llama-3.1"`

## 사용법 - LiteLLM Python SDK

### Non-streaming {#non-streaming}

```python showLineNumbers title="Docker Model Runner Non-streaming Completion"
import os
import litellm
from litellm import completion

# Specify the engine in the api_base URL
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Docker Model Runner call
response = completion(
    model="docker_model_runner/llama-3.1", 
    messages=messages
)

print(response)
```

### Streaming {#streaming}

```python showLineNumbers title="Docker Model Runner Streaming Completion"
import os
import litellm
from litellm import completion

# Specify the engine in the api_base URL
os.environ["DOCKER_MODEL_RUNNER_API_BASE"] = "http://localhost:22088/engines/llama.cpp"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Docker Model Runner call with streaming
response = completion(
    model="docker_model_runner/llama-3.1", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 사용자 지정 API Base와 엔진 {#custom-api-base-and-engine}

```python showLineNumbers title="Custom API Base with Different Engine"
import litellm
from litellm import completion

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Specify the engine in the api_base URL
# Using a different host and engine
response = completion(
    model="docker_model_runner/llama-3.1",
    messages=messages,
    api_base="http://model-runner.docker.internal/engines/llama.cpp"
)

print(response)
```

### 다른 엔진 사용 {#using-different-engines}

```python showLineNumbers title="Using a Different Engine"
import litellm
from litellm import completion

messages = [{"content": "Hello, how are you?", "role": "user"}]

# To use a different engine, specify it in the api_base
# For example, if Docker Model Runner supports other engines:
response = completion(
    model="docker_model_runner/mistral-7b",
    messages=messages,
    api_base="http://localhost:22088/engines/custom-engine"
)

print(response)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 설정 파일에 다음 내용을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-3.1
    litellm_params:
      model: docker_model_runner/llama-3.1
      api_base: http://localhost:22088/engines/llama.cpp

  - model_name: mistral-7b
    litellm_params:
      model: docker_model_runner/mistral-7b
      api_base: http://localhost:22088/engines/llama.cpp
```

LiteLLM Proxy 서버를 시작합니다.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Docker Model Runner via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Docker Model Runner via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Docker Model Runner via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/llama-3.1",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Docker Model Runner via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/llama-3.1",
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

```bash showLineNumbers title="Docker Model Runner via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "llama-3.1",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

```bash showLineNumbers title="Docker Model Runner via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "llama-3.1",
    "messages": [{"role": "user", "content": "hello from litellm"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 대한 자세한 내용은 [LiteLLM Proxy 문서](../providers/litellm_proxy)를 참조하세요.

## API Reference {#api-reference}

자세한 API 정보는 [Docker Model Runner API Reference](https://docs.docker.com/ai/model-runner/api-reference/)를 참조하세요.
