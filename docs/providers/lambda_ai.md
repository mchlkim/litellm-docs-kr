import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lambda AI

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Lambda AI는 대규모 추론에 최적화된 클라우드 GPU 인프라를 통해 다양한 오픈 소스 언어 모델에 접근할 수 있게 합니다. |
| LiteLLM 제공자 라우트 | `lambda_ai/` |
| 제공자 문서 링크 | [Lambda AI API 문서 ↗](https://docs.lambda.ai/api) |
| Base URL | `https://api.lambda.ai/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />
<br />

https://docs.lambda.ai/api

**모든 Lambda AI 모델을 지원합니다. completion 요청을 보낼 때 `lambda_ai/`를 접두사로 지정하기만 하면 됩니다.**

## 사용 가능한 모델 {#available-models}

Lambda AI는 최신 오픈 소스 모델을 다양하게 제공합니다.

### 대규모 언어 모델 {#large-language-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/llama3.3-70b-instruct-fp8` | FP8 양자화를 적용한 Llama 3.3 70B | 8,192 토큰 |
| `lambda_ai/llama3.1-405b-instruct-fp8` | FP8 양자화를 적용한 Llama 3.1 405B | 8,192 토큰 |
| `lambda_ai/llama3.1-70b-instruct-fp8` | FP8 양자화를 적용한 Llama 3.1 70B | 8,192 토큰 |
| `lambda_ai/llama3.1-8b-instruct` | 명령 튜닝된 Llama 3.1 8B | 8,192 토큰 |
| `lambda_ai/llama3.1-nemotron-70b-instruct-fp8` | Llama 3.1 Nemotron 70B | 8,192 토큰 |

### DeepSeek 모델 {#deepseek-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/deepseek-llama3.3-70b` | DeepSeek Llama 3.3 70B | 8,192 토큰 |
| `lambda_ai/deepseek-r1-0528` | DeepSeek R1 0528 | 8,192 토큰 |
| `lambda_ai/deepseek-r1-671b` | DeepSeek R1 671B | 8,192 토큰 |
| `lambda_ai/deepseek-v3-0324` | DeepSeek V3 0324 | 8,192 토큰 |

### Hermes 모델 {#hermes-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/hermes3-405b` | Hermes 3 405B | 8,192 토큰 |
| `lambda_ai/hermes3-70b` | Hermes 3 70B | 8,192 토큰 |
| `lambda_ai/hermes3-8b` | Hermes 3 8B | 8,192 토큰 |

### 코딩 모델 {#coding-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/qwen25-coder-32b-instruct` | Qwen 2.5 Coder 32B | 8,192 토큰 |
| `lambda_ai/qwen3-32b-fp8` | FP8을 적용한 Qwen 3 32B | 8,192 토큰 |

### 비전 모델 {#vision-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/llama3.2-11b-vision-instruct` | 비전 기능을 갖춘 Llama 3.2 11B | 8,192 토큰 |

### 특화 모델 {#specialized-models}

| 모델 | 설명 | 컨텍스트 창 |
|-------|-------------|----------------|
| `lambda_ai/llama-4-maverick-17b-128e-instruct-fp8` | 128k 컨텍스트를 지원하는 Llama 4 Maverick | 131,072 토큰 |
| `lambda_ai/llama-4-scout-17b-16e-instruct` | 16k 컨텍스트를 지원하는 Llama 4 Scout | 16,384 토큰 |
| `lambda_ai/lfm-40b` | LFM 40B 모델 | 8,192 토큰 |
| `lambda_ai/lfm-7b` | LFM 7B 모델 | 8,192 토큰 |

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key
```

## 사용법 - LiteLLM Python SDK

### 비스트리밍 {#non-streaming}

```python showLineNumbers title="Lambda AI Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Lambda AI call
response = completion(
    model="lambda_ai/llama3.1-8b-instruct", 
    messages=messages
)

print(response)
```

### 스트리밍 {#streaming}

```python showLineNumbers title="Lambda AI Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# Lambda AI call with streaming
response = completion(
    model="lambda_ai/llama3.1-70b-instruct-fp8", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 비전/멀티모달 지원 {#visionmultimodal-support}

Llama 3.2 Vision 모델은 이미지 입력을 지원합니다.

```python showLineNumbers title="Lambda AI Vision/Multimodal"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{
    "role": "user",
    "content": [
        {
            "type": "text",
            "text": "What's in this image?"
        },
        {
            "type": "image_url",
            "image_url": {
                "url": "https://example.com/image.jpg"
            }
        }
    ]
}]

# Lambda AI vision model call
response = completion(
    model="lambda_ai/llama3.2-11b-vision-instruct",
    messages=messages
)

print(response)
```

### 함수 호출 {#function-calling}

Lambda AI 모델은 함수 호출을 지원합니다.

```python showLineNumbers title="Lambda AI Function Calling"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

# Define tools
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Boston?"}]

# Lambda AI call with function calling
response = completion(
    model="lambda_ai/hermes3-70b",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

## 사용법 - LiteLLM Proxy Server {#usage---litellm-proxy-server}

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-8b
    litellm_params:
      model: lambda_ai/llama3.1-8b-instruct
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: deepseek-70b
    litellm_params:
      model: lambda_ai/deepseek-llama3.3-70b
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: hermes-405b
    litellm_params:
      model: lambda_ai/hermes3-405b
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: qwen-coder
    litellm_params:
      model: lambda_ai/qwen25-coder-32b-instruct
      api_key: os.environ/LAMBDA_API_KEY
```

## 사용자 지정 API Base {#custom-api-base}

사용자 지정 API base URL을 사용해야 하는 경우:

```python showLineNumbers title="Custom API Base"
import os
import litellm
from litellm import completion

# Using environment variable
os.environ["LAMBDA_API_BASE"] = "https://custom.lambda-api.com/v1"
os.environ["LAMBDA_API_KEY"] = ""  # your API key

# Or pass directly
response = completion(
    model="lambda_ai/llama3.1-8b-instruct",
    messages=[{"content": "Hello!", "role": "user"}],
    api_base="https://custom.lambda-api.com/v1",
    api_key="your-api-key"
)
```

## 지원되는 OpenAI 파라미터 {#supported-openai-parameters}

Lambda AI는 OpenAI와 완전히 호환되므로 모든 표준 OpenAI 파라미터를 지원합니다.

- `temperature`
- `max_tokens`
- `top_p`
- `frequency_penalty`
- `presence_penalty`
- `stop`
- `n`
- `stream`
- `tools`
- `tool_choice`
- `response_format`
- `seed`
- `user`
- `logit_bias`

파라미터를 사용하는 예제:

```python showLineNumbers title="Lambda AI with Parameters"
response = completion(
    model="lambda_ai/hermes3-405b",
    messages=[{"content": "Explain quantum computing", "role": "user"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    frequency_penalty=0.2,
    presence_penalty=0.1
)
```
