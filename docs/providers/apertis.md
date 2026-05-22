# `Apertis AI`(`Stima API`)

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Apertis AI(이전 Stima API)는 단일 인터페이스를 통해 430개 이상의 AI 모델에 접근할 수 있으며, 최대 50% 비용 절감을 제공하는 통합 API 플랫폼입니다. |
| LiteLLM의 공급자 라우트 | `apertis/` |
| 공급자 문서 링크 | [Apertis AI 웹사이트 ↗](https://api.stima.tech) |
| 기본 URL | `https://api.stima.tech/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />

## Apertis AI란?

Apertis AI는 개발자가 다음을 사용할 수 있게 해주는 통합 API 플랫폼입니다.
- **430개 이상의 AI 모델 접근**: 단일 API로 모든 모델 사용
- **비용 50% 절감**: 큰 폭의 할인과 경쟁력 있는 가격
- **통합 청구**: 모든 모델 사용량에 대한 단일 청구서
- **빠른 설정**: 단 $2 등록으로 시작
- **GitHub 연동**: GitHub 계정과 연결

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key
```

[api.stima.tech](https://api.stima.tech)에서 Apertis AI API 키를 받으세요.

## 사용법 - LiteLLM Python SDK

### 비스트리밍

```python showLineNumbers title="Apertis AI Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Apertis AI call
response = completion(
    model="apertis/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="Apertis AI Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Apertis AI call with streaming
response = completion(
    model="apertis/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM 프록시 서버

### 1. 환경에 키 저장

```bash
export STIMA_API_KEY=""
```

### 2. 프록시 시작

```yaml
model_list:
  - model_name: apertis-model
    litellm_params:
      model: apertis/model-name  # Replace with actual model name
      api_key: os.environ/STIMA_API_KEY
```

## 지원되는 OpenAI 매개변수

Apertis AI는 모든 표준 OpenAI 호환 매개변수를 지원합니다.

| 매개변수 | 유형 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 있는 메시지 객체 배열 |
| `model` | string | **필수**. 사용 가능한 430개 이상의 모델 중 모델 ID |
| `stream` | boolean | 선택 사항. 스트리밍 응답 활성화 |
| `temperature` | float | 선택 사항. 샘플링 온도 |
| `top_p` | float | 선택 사항. 뉴클리어스 샘플링 매개변수 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 페널티 적용 |
| `presence_penalty` | float | 선택 사항. 존재 여부를 기준으로 토큰에 페널티 적용 |
| `stop` | string/array | 선택 사항. 중단 시퀀스 |
| `tools` | array | 선택 사항. 사용 가능한 도구/함수 목록 |
| `tool_choice` | string/object | 선택 사항. 도구/함수 호출 제어 |

## 비용 이점

Apertis AI는 상당한 비용 이점을 제공합니다.
- **50% 비용 절감**: 공급자를 직접 사용할 때보다 비용 절감
- **통합 청구**: 모든 AI 모델 사용량에 대한 단일 청구서
- **낮은 진입 장벽**: 단 $2 등록으로 시작

## 모델 가용성

430개 이상의 AI 모델에 접근할 수 있는 Apertis AI는 다음을 제공합니다.
- 하나의 API를 통한 여러 공급자 지원
- 최신 모델 릴리스
- 다양한 모델 유형(텍스트, 이미지, 비디오)

## 추가 리소스

- [Apertis AI 웹사이트](https://api.stima.tech)
- [Apertis AI 엔터프라이즈](https://api.stima.tech/enterprise)
