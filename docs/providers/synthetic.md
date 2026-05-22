# Synthetic

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Synthetic은 개인정보 보호에 중점을 두고 미국 및 EU 내 보안 데이터센터에서 오픈소스 AI 모델을 실행합니다. 사용자 데이터로 학습하지 않으며 API 데이터는 14일 이내에 자동 삭제됩니다. |
| LiteLLM의 Provider 라우트 | `synthetic/` |
| Provider 문서 링크 | [Synthetic 웹사이트 ↗](https://synthetic.new) |
| 기본 URL | `https://api.synthetic.new/openai/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />

## Synthetic이란?

Synthetic은 다음 보장을 바탕으로 오픈소스 LLM에 접근할 수 있게 해주는 개인정보 보호 중심 AI 플랫폼입니다.
- **개인정보 보호 우선**: 데이터는 학습에 사용되지 않습니다.
- **보안 호스팅**: 모델은 미국 및 EU의 보안 데이터센터에서 실행됩니다.
- **자동 삭제**: API 데이터는 14일 이내에 자동 삭제됩니다.
- **오픈소스**: 오픈소스 AI 모델을 실행합니다.

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key
```

[synthetic.new](https://synthetic.new)에서 Synthetic API 키를 발급받으세요.

## 사용법 - LiteLLM Python SDK

### 비스트리밍

```python showLineNumbers title="Synthetic Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Synthetic call
response = completion(
    model="synthetic/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="Synthetic Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Synthetic call with streaming
response = completion(
    model="synthetic/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy Server

### 1. 환경에 키 저장

```bash
export SYNTHETIC_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: synthetic-model
    litellm_params:
      model: synthetic/model-name  # Replace with actual model name
      api_key: os.environ/SYNTHETIC_API_KEY
```

## 지원되는 OpenAI 파라미터

Synthetic은 표준 OpenAI 호환 파라미터를 모두 지원합니다.

| 파라미터 | 유형 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 포함된 메시지 객체 배열 |
| `model` | string | **필수**. 모델 ID |
| `stream` | boolean | 선택 사항. 스트리밍 응답을 활성화합니다. |
| `temperature` | float | 선택 사항. 샘플링 온도 |
| `top_p` | float | 선택 사항. 뉴클리어스 샘플링 파라미터 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 페널티를 적용합니다. |
| `presence_penalty` | float | 선택 사항. 등장 여부에 따라 토큰에 페널티를 적용합니다. |
| `stop` | string/array | 선택 사항. 중지 시퀀스 |

## 개인정보 보호 및 보안

Synthetic은 엔터프라이즈급 개인정보 보호 기능을 제공합니다.
- 데이터는 14일 이내에 자동 삭제됩니다.
- 데이터는 모델 학습에 사용되지 않습니다.
- 미국 및 EU 데이터센터에서 안전하게 호스팅됩니다.
- 컴플라이언스에 적합한 아키텍처를 제공합니다.

## 추가 리소스

- [Synthetic 웹사이트](https://synthetic.new)
