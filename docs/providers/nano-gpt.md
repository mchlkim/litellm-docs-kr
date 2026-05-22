# NanoGPT

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | NanoGPT는 pay-per-prompt 및 subscription 기반 AI 서비스로, subscription이나 registration 없이 200개 이상의 강력한 AI 모델에 즉시 접근할 수 있습니다. |
| LiteLLM Provider 경로 | `nano-gpt/` |
| Provider 문서 링크 | [NanoGPT Website ↗](https://nano-gpt.com) |
| Base URL | `https://nano-gpt.com/api/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage), [`/completions`](#text-completion), [`/embeddings`](#embeddings) |

<br />

## NanoGPT란?

NanoGPT는 다음을 제공하는 유연한 AI API 서비스입니다.
- **Pay-Per-Prompt 가격 책정**: subscription 없이 사용한 만큼만 지불
- **200+ AI 모델**: text, image, video generation 모델 접근
- **Registration 불필요**: 즉시 시작 가능
- **OpenAI 호환 API**: 기존 코드와 쉽게 통합
- **Streaming 지원**: 실시간 response streaming
- **도구 호출**: function calling 지원

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key
```

[nano-gpt.com](https://nano-gpt.com)에서 NanoGPT API key를 가져오세요.

## 사용법 - LiteLLM Python SDK

### Non-streaming

```python showLineNumbers title="NanoGPT Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# NanoGPT call
response = completion(
    model="nano-gpt/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### Streaming

```python showLineNumbers title="NanoGPT Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# NanoGPT call with streaming
response = completion(
    model="nano-gpt/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 도구 호출

```python showLineNumbers title="NanoGPT Tool Calling"
import os
import litellm

os.environ["NANOGPT_API_KEY"] = ""

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                }
            }
        }
    }
]

response = litellm.completion(
    model="nano-gpt/model-name",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools
)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 key 저장

```bash
export NANOGPT_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: nano-gpt-model
    litellm_params:
      model: nano-gpt/model-name  # Replace with actual model name
      api_key: os.environ/NANOGPT_API_KEY
```

## 지원되는 OpenAI 파라미터

NanoGPT는 모든 표준 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 있는 message object 배열 |
| `model` | string | **필수**. 200개 이상의 사용 가능 모델 중 Model ID |
| `stream` | boolean | 선택 사항. streaming response 활성화 |
| `temperature` | float | 선택 사항. sampling temperature |
| `top_p` | float | 선택 사항. nucleus sampling 파라미터 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 token 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 token에 penalty 적용 |
| `presence_penalty` | float | 선택 사항. presence 기반 token penalty 적용 |
| `stop` | string/array | 선택 사항. stop sequence |
| `n` | integer | 선택 사항. 생성할 completion 수 |
| `tools` | array | 선택 사항. 사용 가능한 tool/function 목록 |
| `tool_choice` | string/object | 선택 사항. tool/function calling 제어 |
| `response_format` | object | 선택 사항. response format specification |
| `user` | string | 선택 사항. user identifier |

## 모델 카테고리

NanoGPT는 여러 모델 카테고리에 대한 접근을 제공합니다.
- **Text Generation**: chat, completion, analysis용 200개 이상의 LLM
- **Image Generation**: image 생성을 위한 AI 모델
- **Video Generation**: video 생성을 위한 AI 모델
- **Embedding 모델**: vector search용 text embedding 모델

## 가격 모델

NanoGPT는 유연한 가격 구조를 제공합니다.
- **Pay-Per-Prompt**: subscription 불필요
- **Registration 없음**: 즉시 시작
- **투명한 가격 책정**: 사용한 만큼만 지불

## API 문서

자세한 API 문서는 [docs.nano-gpt.com](https://docs.nano-gpt.com)을 확인하세요.

## 추가 리소스

- [NanoGPT Website](https://nano-gpt.com)
- [NanoGPT API Documentation](https://nano-gpt.com/api)
- [NanoGPT Model List](https://docs.nano-gpt.com/api-reference/endpoint/models)
