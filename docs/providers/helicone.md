import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Helicone

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Helicone은 고급 모니터링, 캐싱, 분석 기능이 포함된 OpenAI 호환 엔드포인트를 제공하는 AI Gateway 및 관측성 플랫폼입니다. |
| LiteLLM Provider 라우트 | `helicone/` |
| Provider 문서 링크 | [Helicone Documentation ↗](https://docs.helicone.ai) |
| Base URL | `https://ai-gateway.helicone.ai/` |
| 지원 작업 | [`/chat/completions`](#sample-usage), [`/completions`](#text-completion), [`/embeddings`](#embeddings) |

<br />

**Helicone AI Gateway를 통해 [사용 가능한 모든 모델](https://helicone.ai/models)을 지원합니다. 요청을 보낼 때 `helicone/`을 접두사로 사용하세요.**

## Helicone이란?

Helicone은 LLM 애플리케이션을 위한 오픈소스 관측성 플랫폼이며 다음 기능을 제공합니다.
- **요청 모니터링**: 모든 LLM 요청을 상세 메트릭과 함께 추적합니다.
- **캐싱**: 지능형 캐싱으로 비용과 지연 시간을 줄입니다.
- **Rate Limiting**: 사용자/키별 요청 속도를 제어합니다.
- **비용 추적**: 모델과 사용자 전반의 지출을 모니터링합니다.
- **사용자 지정 속성**: 필터링과 분석을 위해 요청에 메타데이터 태그를 지정합니다.
- **프롬프트 관리**: 프롬프트 버전 관리를 제공합니다.

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key
```

[Helicone dashboard](https://helicone.ai)에서 Helicone API 키를 가져오세요.

## 사용법 - LiteLLM Python SDK

### 비스트리밍

```python showLineNumbers title="Helicone Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Helicone call - routes through Helicone gateway to OpenAI
response = completion(
    model="helicone/gpt-4",
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="Helicone Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Helicone call with streaming
response = completion(
    model="helicone/gpt-4",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 메타데이터 사용(Helicone 사용자 지정 속성)

```python showLineNumbers title="Helicone with Custom Properties"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

response = completion(
    model="helicone/gpt-4o-mini",
    messages=[{"role": "user", "content": "What's the weather like?"}],
    metadata={
        "Helicone-Property-Environment": "production",
        "Helicone-Property-User-Id": "user_123",
        "Helicone-Property-Session-Id": "session_abc"
    }
)

print(response)
```

### Text Completion

```python showLineNumbers title="Helicone Text Completion"
import os
import litellm

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

response = litellm.completion(
    model="helicone/gpt-4o-mini",  # text completion model
    prompt="Once upon a time"
)

print(response)
```


## 재시도 및 폴백 메커니즘

```python
import litellm

litellm.api_base = "https://ai-gateway.helicone.ai/"
litellm.metadata = {
    "Helicone-Retry-Enabled": "true",
    "helicone-retry-num": "3",
    "helicone-retry-factor": "2",
}

response = litellm.completion(
    model="helicone/gpt-4o-mini/openai,claude-3-5-sonnet-20241022/anthropic", # Try OpenAI first, then fallback to Anthropic, then continue with other models,
    messages=[{"role": "user", "content": "Hello"}]
)
```

## 지원되는 OpenAI 파라미터

Helicone은 표준 OpenAI 호환 파라미터를 모두 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 포함된 메시지 객체 배열 |
| `model` | string | **필수**. 모델 ID(예: gpt-4, claude-3-opus 등) |
| `stream` | boolean | 선택 사항. 스트리밍 응답을 활성화합니다. |
| `temperature` | float | 선택 사항. 샘플링 온도입니다. |
| `top_p` | float | 선택 사항. Nucleus sampling 파라미터입니다. |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수입니다. |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 패널티를 적용합니다. |
| `presence_penalty` | float | 선택 사항. 존재 여부 기준으로 토큰에 패널티를 적용합니다. |
| `stop` | string/array | 선택 사항. 중지 시퀀스입니다. |
| `n` | integer | 선택 사항. 생성할 completion 수입니다. |
| `tools` | array | 선택 사항. 사용 가능한 도구/함수 목록입니다. |
| `tool_choice` | string/object | 선택 사항. 도구/함수 호출을 제어합니다. |
| `response_format` | object | 선택 사항. 응답 형식 지정입니다. |
| `user` | string | 선택 사항. 사용자 식별자입니다. |

## Helicone 전용 헤더

Helicone 기능을 활용하려면 다음 값을 메타데이터로 전달하세요.

| 헤더 | 설명 |
|--------|-------------|
| `Helicone-Property-*` | 필터링용 사용자 지정 속성(예: `Helicone-Property-User-Id`) |
| `Helicone-Cache-Enabled` | 이 요청에 캐싱을 활성화합니다. |
| `Helicone-User-Id` | 추적용 사용자 식별자입니다. |
| `Helicone-Session-Id` | 요청 그룹화를 위한 세션 식별자입니다. |
| `Helicone-Prompt-Id` | 버전 관리를 위한 프롬프트 식별자입니다. |
| `Helicone-Rate-Limit-Policy` | Rate limiting 정책 이름입니다. |

헤더 사용 예제:

```python showLineNumbers title="Helicone with Custom Headers"
import litellm

response = litellm.completion(
    model="helicone/gpt-4",
    messages=[{"role": "user", "content": "Hello"}],
    metadata={
        "Helicone-Cache-Enabled": "true",
        "Helicone-Property-Environment": "production",
        "Helicone-Property-User-Id": "user_123",
        "Helicone-Session-Id": "session_abc",
        "Helicone-Prompt-Id": "prompt_v1"
    }
)
```

## 고급 사용법

### 다른 Provider와 함께 사용

Helicone은 Gateway로 동작하며 여러 Provider를 지원합니다.

```python showLineNumbers title="Helicone with Anthropic"
import litellm

# Set both Helicone and Anthropic keys
os.environ["HELICONE_API_KEY"] = "your-helicone-key"

response = litellm.completion(
    model="helicone/claude-3.5-haiku/anthropic",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### 캐싱

비용과 지연 시간을 줄이려면 캐싱을 활성화하세요.

```python showLineNumbers title="Helicone Caching"
import litellm

response = litellm.completion(
    model="helicone/gpt-4",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    metadata={
        "Helicone-Cache-Enabled": "true"
    }
)

# Subsequent identical requests will be served from cache
response2 = litellm.completion(
    model="helicone/gpt-4",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    metadata={
        "Helicone-Cache-Enabled": "true"
    }
)
```

## 기능

### 요청 모니터링
- 모든 요청을 상세 메트릭과 함께 추적합니다.
- 요청/응답 쌍을 확인합니다.
- 지연 시간과 오류를 모니터링합니다.
- 사용자 지정 속성으로 필터링합니다.

### 비용 추적
- 모델별 비용 추적
- 사용자별 비용 추적
- 비용 알림 및 예산
- 과거 비용 분석

### Rate Limiting
- 사용자별 rate limit
- API 키별 rate limit
- 사용자 지정 rate limit 정책
- 자동 적용

### 분석
- 요청량 추세
- 비용 추세
- 지연 시간 백분위수
- 오류율

자세한 내용은 [Helicone Pricing](https://helicone.ai/pricing)을 참고하세요.

## 추가 리소스

- [Helicone 공식 문서](https://docs.helicone.ai)
- [Helicone Dashboard](https://helicone.ai)
- [Helicone GitHub](https://github.com/Helicone/helicone)
- [API Reference](https://docs.helicone.ai/rest/ai-gateway/post-v1-chat-completions)
