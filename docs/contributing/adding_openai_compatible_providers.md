# OpenAI 호환 Provider 추가하기

단순한 OpenAI 호환 provider(Hyperbolic, Nscale 등)는 JSON 파일 하나만 수정해서 지원을 추가할 수 있습니다.

## 빠른 시작

1. `litellm/llms/openai_like/providers.json` 수정
2. provider 설정 추가
3. 다음으로 테스트: `litellm.completion(model="your_provider/model-name", ...)`

## 기본 설정

완전히 OpenAI와 호환되는 provider의 경우:

```json
{
  "your_provider": {
    "base_url": "https://api.yourprovider.com/v1",
    "api_key_env": "YOUR_PROVIDER_API_KEY"
  }
}
```

이것으로 끝입니다. 이제 해당 provider를 사용할 수 있습니다.

## 설정 옵션

### 필수 필드

- `base_url` - API 엔드포인트(예: `https://api.provider.com/v1`)
- `api_key_env` - API 키에 사용할 환경 변수 이름(예: `PROVIDER_API_KEY`)

### 선택 필드

- `api_base_env` - `base_url`을 재정의하는 환경 변수
- `base_class` - `"openai_gpt"`(기본값) 또는 `"openai_like"` 사용
- `param_mappings` - OpenAI 파라미터 이름을 provider별 이름으로 매핑
- `constraints` - 파라미터 값 제약 조건(min/max)
- `special_handling` - 콘텐츠 형식 변환 같은 특수 동작

## 예제

### 단순한 Provider(완전 호환)

```json
{
  "hyperbolic": {
    "base_url": "https://api.hyperbolic.xyz/v1",
    "api_key_env": "HYPERBOLIC_API_KEY"
  }
}
```

### 파라미터 매핑이 있는 Provider

```json
{
  "publicai": {
    "base_url": "https://api.publicai.co/v1",
    "api_key_env": "PUBLICAI_API_KEY",
    "param_mappings": {
      "max_completion_tokens": "max_tokens"
    }
  }
}
```

### 제약 조건이 있는 Provider

```json
{
  "custom_provider": {
    "base_url": "https://api.custom.com/v1",
    "api_key_env": "CUSTOM_API_KEY",
    "constraints": {
      "temperature_max": 1.0,
      "temperature_min": 0.0
    }
  }
}
```

## Responses API 지원

provider가 OpenAI Responses API(`/v1/responses`)도 지원한다면 `supported_endpoints`를 추가하세요.

```json
{
  "your_provider": {
    "base_url": "https://api.yourprovider.com/v1",
    "api_key_env": "YOUR_PROVIDER_API_KEY",
    "supported_endpoints": ["/v1/chat/completions", "/v1/responses"]
  }
}
```

그러면 추가 코드 없이 `litellm.responses()`를 사용할 수 있습니다.

```python
import litellm

response = litellm.responses(
    model="your_provider/model-name",
    input="Hello, what can you do?",
)
print(response.output)
```

`supported_endpoints`를 생략하면 기본값은 `[]`입니다. Chat completions는 이 필드와 관계없이 JSON provider에서 항상 활성화됩니다.

provider는 모든 요청/응답 처리를 OpenAI의 Responses API에서 상속합니다. 스트리밍, 도구, 모든 표준 파라미터가 별도 설정 없이 동작합니다.

## 사용법

```python
import litellm
import os

# API 키 설정
os.environ["YOUR_PROVIDER_API_KEY"] = "your-key-here"

# Chat completions
response = litellm.completion(
    model="your_provider/model-name",
    messages=[{"role": "user", "content": "Hello"}],
)

# Responses API(`supported_endpoints`에 "/v1/responses"가 포함된 경우)
response = litellm.responses(
    model="your_provider/model-name",
    input="Hello",
)
```

## 대신 Python을 사용해야 하는 경우

다음이 필요하다면 Python 설정 클래스를 사용하세요.

- 사용자 지정 인증 흐름(OAuth, JWT 등)
- 복잡한 요청/응답 변환
- Provider별 스트리밍 로직
- 고급 도구 호출 수정

chat completions의 경우 `OpenAIGPTConfig` 또는 `OpenAILikeChatConfig`를 상속하는 설정 클래스를 `litellm/llms/your_provider/chat/transformation.py`에 생성하세요.

responses API에서 작은 오버라이드만 필요하다면 `OpenAIResponsesAPIConfig`를 상속하고 필요한 부분만 오버라이드하세요. 최소 예시는 `litellm/llms/perplexity/responses/transformation.py`를 참고하세요(400줄 이상 대신 약 40줄).

## 테스트

provider를 테스트하세요.

```bash
# 빠른 테스트
python -c "
import litellm
import os
os.environ['PROVIDER_API_KEY'] = 'your-key'
response = litellm.completion(
    model='provider/model-name',
    messages=[{'role': 'user', 'content': 'test'}]
)
print(response.choices[0].message.content)
"
```

## 참고

예시는 `litellm/llms/openai_like/providers.json`의 기존 provider를 참고하세요.
