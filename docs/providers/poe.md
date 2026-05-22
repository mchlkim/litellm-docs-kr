# Poe

## 개요

| Property | Details |
|-------|-------|
| 설명 | Poe는 Quora의 AI platform으로, developer-friendly API를 통해 text, image, video, voice modality 전반의 100개 이상 모델에 접근할 수 있습니다. |
| LiteLLM 경로 | `poe/` |
| Provider 문서 링크 | [Poe Website ↗](https://poe.com) |
| Base URL | `https://api.poe.com/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />

## Poe란?

Poe는 Quora의 종합 AI platform이며 다음을 제공합니다.

- **100개 이상 모델**: 다양한 AI 모델에 접근할 수 있습니다.
- **여러 modality**: Text, image, video, voice AI를 지원합니다.
- **인기 모델**: OpenAI GPT series와 Anthropic Claude 등을 포함합니다.
- **Developer API**: Application에 쉽게 통합할 수 있습니다.
- **넓은 도달 범위**: Quora의 월간 4억 unique visitor 기반을 활용할 수 있습니다.

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["POE_API_KEY"] = ""  # your Poe API key
```

[Poe platform](https://poe.com)에서 Poe API key를 가져옵니다.

## 사용법 - LiteLLM Python SDK

### Non-streaming

```python showLineNumbers title="Poe Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["POE_API_KEY"] = ""  # your Poe API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Poe call
response = completion(
    model="poe/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### Streaming

```python showLineNumbers title="Poe Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["POE_API_KEY"] = ""  # your Poe API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Poe call with streaming
response = completion(
    model="poe/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 key 저장

```bash
export POE_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: poe-model
    litellm_params:
      model: poe/model-name  # Replace with actual model name
      api_key: os.environ/POE_API_KEY
```

## 지원 OpenAI 파라미터

Poe는 모든 표준 OpenAI-compatible parameter를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. `role`과 `content`가 있는 message object 배열입니다. |
| `model` | string | **필수**. 사용 가능한 100개 이상 모델 중 하나의 model ID입니다. |
| `stream` | boolean | 선택 사항. Streaming response를 활성화합니다. |
| `temperature` | float | 선택 사항. Sampling temperature입니다. |
| `top_p` | float | 선택 사항. Nucleus sampling parameter입니다. |
| `max_tokens` | integer | 선택 사항. 생성할 최대 token 수입니다. |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 token에 penalty를 적용합니다. |
| `presence_penalty` | float | 선택 사항. 존재 여부 기준으로 token에 penalty를 적용합니다. |
| `stop` | string/array | 선택 사항. Stop sequence입니다. |
| `tools` | array | 선택 사항. 사용 가능한 tools/functions 목록입니다. |
| `tool_choice` | string/object | 선택 사항. Tool/function calling을 제어합니다. |
| `response_format` | object | 선택 사항. Response format specification입니다. |
| `user` | string | 선택 사항. User identifier입니다. |

## 사용 가능한 모델 범주

Poe는 여러 provider의 모델에 접근할 수 있게 합니다.

- **OpenAI 모델**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo 등을 포함합니다.
- **Anthropic 모델**: Claude 3 Opus, Sonnet, Haiku 등을 포함합니다.
- **기타 인기 모델**: 여러 provider 모델을 사용할 수 있습니다.
- **Multi-Modal**: Text, image, video, voice 모델을 지원합니다.

## Platform 장점

LiteLLM을 통해 Poe를 사용하면 다음 장점이 있습니다.

- **Unified Access**: 여러 모델을 단일 API로 사용할 수 있습니다.
- **Quora Integration**: 대규모 사용자 기반과 content ecosystem에 접근할 수 있습니다.
- **Content Sharing**: Model output을 follower와 공유할 수 있습니다.
- **Content Distribution**: 우수한 AI content를 전체 사용자에게 배포할 수 있습니다.
- **Model Discovery**: 새 AI 모델을 효율적으로 탐색할 수 있습니다.

## Developer 리소스

Poe는 developer feature를 활발히 구축하고 있으며 API 통합을 위한 early access request를 받고 있습니다.

## 추가 리소스

- [Poe Website](https://poe.com)
- [Poe AI Quora Space](https://poeai.quora.com)
- [Quora 블로그 Post about Poe](https://quorablog.quora.com/Poe)
