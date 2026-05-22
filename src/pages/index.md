---
title: LiteLLM 한국어 문서
description: 한국어 사용자를 위해 LiteLLM 공식 문서를 바탕으로 정리한 비공식 한국어 번역본입니다. LiteLLM Proxy, Python SDK, LLM Gateway, 모델 공급자와 통합 가이드를 한국어로 확인할 수 있습니다.
keywords:
  - LiteLLM
  - LiteLLM 한국어
  - LiteLLM 문서
  - LiteLLM Proxy
  - LLM Gateway
  - Python SDK
  - OpenAI 호환 API
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::note 보안 업데이트
Trivy 공급망 침해는 차단되었습니다 :tada: . 영향을 받은 모든 패키지는 삭제되었으며, 현재 릴리스에는 손상된 코드/컴포넌트가 포함되어 있지 않습니다. 문제를 더 깊이 이해하려면 [Security Townhall](/litellm-docs-kr/blog/security-townhall-updates)을, 앞으로의 개선 방향은 [CI/CD v2](/litellm-docs-kr/blog/ci-cd-v2-improvements)를 참고하세요.
:::

# LiteLLM - 시작하기

이 문서는 한국어 사용자를 위해 LiteLLM 공식 문서를 바탕으로 정리한 비공식 한국어 번역본입니다. 원문과 차이가 있을 수 있으므로, 최신 기능과 정확한 사양은 공식 문서를 함께 확인해 주세요.

## **OpenAI 입력/출력 형식으로 100개 이상의 LLM 호출**

- 입력을 공급자의 엔드포인트로 변환합니다(`/chat/completions`, `/responses`, `/embeddings`, `/images`, `/audio`, `/batches` 등)
- [일관된 출력](https://docs.litellm.ai/docs/supported_endpoints) - 어떤 공급자를 사용하든 동일한 응답 형식
- 여러 배포(예: Azure/OpenAI)에 걸친 재시도/fallback 로직 - [Router](https://docs.litellm.ai/docs/routing)
- 프로젝트별 지출 추적 및 예산 설정 [LiteLLM Proxy Server](https://docs.litellm.ai/docs/simple_proxy)

## LiteLLM 사용 방법

LiteLLM은 Proxy Server 또는 Python SDK를 통해 사용할 수 있습니다. 두 방식 모두 여러 LLM(100개 이상)에 접근할 수 있는 통합 인터페이스를 제공합니다. 필요에 가장 적합한 옵션을 선택하세요.

<table style={{width: '100%', tableLayout: 'fixed'}}>
<thead>
<tr>
<th style={{width: '14%'}}></th>
<th style={{width: '43%'}}><strong><a href="#litellm-proxy-server-llm-gateway">LiteLLM Proxy Server</a></strong></th>
<th style={{width: '43%'}}><strong><a href="#basic-usage">LiteLLM Python SDK</a></strong></th>
</tr>
</thead>
<tbody>
<tr>
<td style={{width: '14%'}}><strong>사용 사례</strong></td>
<td style={{width: '43%'}}>여러 LLM에 접근하기 위한 중앙 서비스(LLM Gateway)</td>
<td style={{width: '43%'}}>Python 코드에서 LiteLLM을 직접 사용</td>
</tr>
<tr>
<td style={{width: '14%'}}><strong>사용 대상</strong></td>
<td style={{width: '43%'}}>Gen AI Enablement / ML Platform 팀</td>
<td style={{width: '43%'}}>LLM 프로젝트를 구축하는 개발자</td>
</tr>
<tr>
<td style={{width: '14%'}}><strong>주요 기능</strong></td>
<td style={{width: '43%'}}>• 인증 및 권한 부여를 포함한 중앙 집중식 API gateway<br />• 프로젝트/사용자별 multi-tenant 비용 추적 및 지출 관리<br />• 프로젝트별 사용자 지정(logging, guardrails, caching)<br />• 안전한 접근 제어를 위한 virtual key<br />• 모니터링 및 관리를 위한 admin dashboard UI</td>
<td style={{width: '43%'}}>• 코드베이스에 Python 라이브러리 직접 통합<br />• 여러 배포(예: Azure/OpenAI)에 걸친 재시도/fallback 로직을 제공하는 Router - <a href="https://docs.litellm.ai/docs/routing">Router</a><br />• 애플리케이션 수준 load balancing 및 비용 추적<br />• OpenAI 호환 오류를 사용한 예외 처리<br />• Observability callback(Lunary, MLflow, Langfuse 등)</td>
</tr>
</tbody>
</table>

## **LiteLLM Python SDK**

### 기본 사용법

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_Getting_Started.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Colab에서 열기"/>
</a>

```shell
uv add litellm
```

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="openai/gpt-5",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import completion
import os

## set ENV variables
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = completion(
  model="anthropic/claude-sonnet-4-5-20250929",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="xai" label="xAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["XAI_API_KEY"] = "your-api-key"

response = completion(
  model="xai/grok-2-latest",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```
</TabItem>
<TabItem value="vertex" label="VertexAI">

```python
from litellm import completion
import os

# auth: run 'gcloud auth application-default'
os.environ["VERTEXAI_PROJECT"] = "hardy-device-386718"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/gemini-1.5-pro",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="nvidia" label="NVIDIA">

```python
from litellm import completion
import os

## set ENV variables
os.environ["NVIDIA_NIM_API_KEY"] = "nvidia_api_key"
os.environ["NVIDIA_NIM_API_BASE"] = "nvidia_nim_endpoint_url"

response = completion(
  model="nvidia_nim/<model_name>",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="hugging" label="HuggingFace">

```python
from litellm import completion
import os

os.environ["HUGGINGFACE_API_KEY"] = "huggingface_api_key"

# e.g. Call 'WizardLM/WizardCoder-Python-34B-V1.0' hosted on HF Inference endpoints
response = completion(
  model="huggingface/WizardLM/WizardCoder-Python-34B-V1.0",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  api_base="https://my-endpoint.huggingface.cloud"
)

print(response)
```

</TabItem>

<TabItem value="azure" label="Azure OpenAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
response = completion(
  "azure/<your_deployment_name>",
  messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="ollama" label="Ollama">

```python
from litellm import completion

response = completion(
            model="ollama/llama2",
            messages = [{ "content": "Hello, how are you?","role": "user"}],
            api_base="http://localhost:11434"
)
```

</TabItem>
<TabItem value="or" label="Openrouter">

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENROUTER_API_KEY"] = "openrouter_api_key"

response = completion(
  model="openrouter/google/palm-2-chat-bison",
  messages = [{ "content": "Hello, how are you?","role": "user"}],
)
```

</TabItem>
<TabItem value="novita" label="Novita AI">

```python
from litellm import completion
import os

## set ENV variables. Visit https://novita.ai/settings/key-management to get your API key
os.environ["NOVITA_API_KEY"] = "novita-api-key"

response = completion(
  model="novita/deepseek/deepseek-r1",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="vercel" label="Vercel AI Gateway">

```python
from litellm import completion
import os

## set ENV variables. Visit https://vercel.com/docs/ai-gateway#using-the-ai-gateway-with-an-api-key for instructions on obtaining a key
os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-vercel-api-key"

response = completion(
  model="vercel_ai_gateway/openai/gpt-5",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

</Tabs>

### 응답 형식(OpenAI Chat Completions 형식)

```json
{
    "id": "chatcmpl-565d891b-a42e-4c39-8d14-82a1f5208885",
    "created": 1734366691,
    "model": "gpt-5",
    "object": "chat.completion",
    "system_fingerprint": null,
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "Hello! As an AI language model, I don't have feelings, but I'm operating properly and ready to assist you with any questions or tasks you may have. How can I help you today?",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null
            }
        }
    ],
    "usage": {
        "completion_tokens": 43,
        "prompt_tokens": 13,
        "total_tokens": 56,
        "completion_tokens_details": null,
        "prompt_tokens_details": {
            "audio_tokens": null,
            "cached_tokens": 0
        },
        "cache_creation_input_tokens": 0,
        "cache_read_input_tokens": 0
    }
}
```

### Responses API

GPT-5, o3 등 reasoning content를 지원하는 고급 model에는 `litellm.responses()`를 사용하세요.

<Tabs>
<TabItem value="openai-responses" label="OpenAI">

```python
from litellm import responses
import os

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = responses(
  model="gpt-5-mini",
  messages=[{ "content": "What is the capital of France?","role": "user"}],
  reasoning_effort="medium"
)

print(response)
print(response.choices[0].message.content) # response
print(response.choices[0].message.reasoning_content) # reasoning

```

</TabItem>
<TabItem value="anthropic-responses" label="Anthropic (Claude)">

```python
from litellm import responses
import os

## set ENV variables
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = responses(
  model="claude-3.5-sonnet",
  messages=[{ "content": "What is the capital of France?","role": "user"}]
)
```

</TabItem>

<TabItem value="vertex-responses" label="VertexAI">

```python
from litellm import responses
import os

# auth: run 'gcloud auth application-default'
os.environ["VERTEXAI_PROJECT"] = "jr-smith-386718"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = responses(
  model="vertex_ai/gemini-1.5-pro",
  messages=[{ "content": "What is the capital of France?","role": "user"}]
)
```

</TabItem>

<TabItem value="azure-responses" label="Azure OpenAI">

```python
from litellm import responses
import os

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
response = responses(
  "azure/<your_deployment_name>",
  messages = [{ "content": "What is the capital of France?","role": "user"}]
)

print(response)
```

</TabItem>

</Tabs>

### 스트리밍
`completion` 인자에 `stream=True`를 설정하세요.

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="openai/gpt-5",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import completion
import os

## set ENV variables
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = completion(
  model="anthropic/claude-sonnet-4-5-20250929",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>
<TabItem value="xai" label="xAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["XAI_API_KEY"] = "your-api-key"

response = completion(
  model="xai/grok-2-latest",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```
</TabItem>
<TabItem value="vertex" label="VertexAI">

```python
from litellm import completion
import os

# auth: run 'gcloud auth application-default'
os.environ["VERTEXAI_PROJECT"] = "hardy-device-386718"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/gemini-1.5-pro",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>

<TabItem value="nvidia" label="NVIDIA">

```python
from litellm import completion
import os

## set ENV variables
os.environ["NVIDIA_NIM_API_KEY"] = "nvidia_api_key"
os.environ["NVIDIA_NIM_API_BASE"] = "nvidia_nim_endpoint_url"

response = completion(
  model="nvidia_nim/<model_name>",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```
</TabItem>

<TabItem value="hugging" label="HuggingFace">

```python
from litellm import completion
import os

os.environ["HUGGINGFACE_API_KEY"] = "huggingface_api_key"

# e.g. Call 'WizardLM/WizardCoder-Python-34B-V1.0' hosted on HF Inference endpoints
response = completion(
  model="huggingface/WizardLM/WizardCoder-Python-34B-V1.0",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  api_base="https://my-endpoint.huggingface.cloud",
  stream=True,
)

print(response)
```

</TabItem>

<TabItem value="azure" label="Azure OpenAI">

```python
from litellm import completion
import os

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
response = completion(
  "azure/<your_deployment_name>",
  messages = [{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>

<TabItem value="ollama" label="Ollama">

```python
from litellm import completion

response = completion(
            model="ollama/llama2",
            messages = [{ "content": "Hello, how are you?","role": "user"}],
            api_base="http://localhost:11434",
            stream=True,
)
```

</TabItem>
<TabItem value="or" label="Openrouter">

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENROUTER_API_KEY"] = "openrouter_api_key"

response = completion(
  model="openrouter/google/palm-2-chat-bison",
  messages = [{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>
<TabItem value="novita" label="Novita AI">

```python
from litellm import completion
import os

## set ENV variables. Visit https://novita.ai/settings/key-management to get your API key
os.environ["NOVITA_API_KEY"] = "novita_api_key"

response = completion(
  model="novita/deepseek/deepseek-r1",
  messages = [{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>

<TabItem value="vercel" label="Vercel AI Gateway">

```python
from litellm import completion
import os

## set ENV variables. Visit https://vercel.com/docs/ai-gateway#using-the-ai-gateway-with-an-api-key for instructions on obtaining a key
os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-vercel-api-key"

response = completion(
  model="vercel_ai_gateway/openai/gpt-5",
  messages = [{ "content": "Hello, how are you?","role": "user"}],
  stream=True,
)
```

</TabItem>

</Tabs>

### 스트리밍 응답 형식(OpenAI 형식)

```json
{
    "id": "chatcmpl-2be06597-eb60-4c70-9ec5-8cd2ab1b4697",
    "created": 1734366925,
    "model": "claude-sonnet-4-5-20250929",
    "object": "chat.completion.chunk",
    "system_fingerprint": null,
    "choices": [
        {
            "finish_reason": null,
            "index": 0,
            "delta": {
                "content": "Hello",
                "role": "assistant",
                "function_call": null,
                "tool_calls": null,
                "audio": null
            },
            "logprobs": null
        }
    ]
}
```

### 예외 처리

LiteLLM은 지원되는 모든 공급자의 예외를 OpenAI 예외에 매핑합니다. 모든 예외는 OpenAI의 예외 타입을 상속하므로, 해당 타입을 대상으로 작성한 오류 처리는 LiteLLM에서도 바로 동작합니다.

```python
import litellm
from litellm import completion
import os

os.environ["ANTHROPIC_API_KEY"] = "bad-key"
try:
    completion(model="anthropic/claude-instant-1", messages=[{"role": "user", "content": "Hey, how's it going?"}])
except litellm.AuthenticationError as e:
    # Thrown when the API key is invalid
    print(f"Authentication failed: {e}")
except litellm.RateLimitError as e:
    # Thrown when you've exceeded your rate limit
    print(f"Rate limited: {e}")
except litellm.APIError as e:
    # Thrown for general API errors
    print(f"API error: {e}")
```

### Logging Observability - LLM 입력/출력 logging ([문서](https://docs.litellm.ai/docs/observability/callbacks))
LiteLLM은 데이터를 MLflow, Lunary, Langfuse, Helicone, Promptlayer, Traceloop, Slack으로 보내기 위한 사전 정의 callback을 제공합니다.

```python
from litellm import completion

## set env variables for logging tools (API key set up is not required when using MLflow)
os.environ["LUNARY_PUBLIC_KEY"] = "your-lunary-public-key" # get your key at https://app.lunary.ai/settings
os.environ["HELICONE_API_KEY"] = "your-helicone-key"
os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""

os.environ["OPENAI_API_KEY"]

# set callbacks
litellm.success_callback = ["lunary", "mlflow", "langfuse", "helicone"] # log input/output to lunary, mlflow, langfuse, helicone

#openai call
response = completion(model="openai/gpt-5", messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}])
```

### 스트리밍 비용, 사용량, 지연 시간 추적
이를 위해 callback 함수를 사용하세요. 맞춤 callback에 대한 자세한 정보: https://docs.litellm.ai/docs/observability/custom_callback

```python
import litellm

# track_cost_callback
def track_cost_callback(
    kwargs,                 # kwargs to completion
    completion_response,    # response from completion
    start_time, end_time    # start/end time
):
    try:
      response_cost = kwargs.get("response_cost", 0)
      print("streaming response_cost", response_cost)
    except:
        pass
# set callback
litellm.success_callback = [track_cost_callback] # set custom callback function

# litellm.completion() call
response = completion(
    model="openai/gpt-5",
    messages=[
        {
            "role": "user",
            "content": "Hi 👋 - i'm openai"
        }
    ],
    stream=True
)
```

## **LiteLLM Proxy Server (LLM Gateway)**

여러 프로젝트/사용자에 걸친 지출 추적

![ui_3](https://github.com/BerriAI/litellm/assets/29436595/47c97d5e-b9be-4839-b28c-43d7f4f10033)

Proxy는 다음을 제공합니다.

1. [인증용 hook](https://docs.litellm.ai/docs/proxy/virtual_keys#custom-auth)
2. [Logging용 hook](https://docs.litellm.ai/docs/proxy/logging#step-1---create-your-custom-litellm-callback-class)
3. [비용 추적](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend)
4. [요청 속도 제한](https://docs.litellm.ai/docs/proxy/users#set-rate-limits)

### 📖 Proxy 엔드포인트 - [Swagger 문서](https://litellm-api.up.railway.app/)

키와 요청 속도 제한을 포함한 전체 튜토리얼은 [**여기**](./proxy/docker_quick_start.md)를 참고하세요.

### Proxy 빠른 시작 - CLI

```shell
uv tool install 'litellm[proxy]'
```

#### 1단계: litellm proxy 시작

<Tabs>

<TabItem label="LiteLLM CLI" value="cli">

```shell
$ litellm --model huggingface/bigcode/starcoder

#INFO: Proxy running on http://0.0.0.0:4000
```

</TabItem>

<TabItem label="Docker container" value="docker">


### 1단계. config.yaml 생성

`litellm_config.yaml` 예시

```yaml
model_list:
  - model_name: gpt-5
    litellm_params:
      model: azure/<your-azure-model-deployment>
      api_base: os.environ/AZURE_API_BASE # runs os.getenv("AZURE_API_BASE")
      api_key: os.environ/AZURE_API_KEY # runs os.getenv("AZURE_API_KEY")
      api_version: "2023-07-01-preview"

litellm_settings:
  master_key: sk-1234
  database_url: postgres://
```

### 2단계. Docker Image 실행

```shell
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e AZURE_API_KEY=d6*********** \
    -e AZURE_API_BASE=https://openai-***********/ \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm:main-latest \
    --config /app/config.yaml --detailed_debug
```

</TabItem>

</Tabs>

#### 2단계: Proxy에 ChatCompletions 요청 보내기

<Tabs>
<TabItem value="chat-completions" label="Chat Completions">

```python
import openai # openai v1.0.0+
client = openai.OpenAI(api_key="anything",base_url="http://0.0.0.0:4000") # set proxy to base_url
# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-5", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```

</TabItem>
<TabItem value="responses-api" label="Responses API">

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.responses.create(
  model="gpt-5",
  input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

</TabItem>
</Tabs>

## 자세히 보기

- [예외 매핑](../../docs/exception_mapping)
- [LiteLLM Proxy Server E2E 튜토리얼](../../docs/proxy/docker_quick_start)
- [proxy virtual key 및 지출 관리](../../docs/proxy/virtual_keys)
