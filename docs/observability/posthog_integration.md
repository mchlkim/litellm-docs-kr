# PostHog - LLM 사용량 분석 추적 {#posthog---tracking-llm-usage-analytics}

## PostHog란? {#what-is-posthog}

PostHog는 사용자가 제품과 상호작용하는 방식을 추적하고 분석할 수 있게 해주는 오픈 소스 제품 분석 플랫폼입니다. LLM 애플리케이션의 경우 PostHog는 모델 사용량, 성능, AI 기능과의 사용자 상호작용을 추적하는 전문 AI 기능을 제공합니다.

## LiteLLM Proxy(LLM Gateway)에서 사용하기 {#usage-with-litellm-proxy-llm-gateway}

**1단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  success_callback: ["posthog"]
  failure_callback: ["posthog"]
```

**2단계**: 필요한 환경 변수를 설정합니다.

```shell
export POSTHOG_API_KEY="your-posthog-api-key"
# Optional, defaults to https://app.posthog.com
export POSTHOG_API_URL="https://app.posthog.com" # optional
```

**3단계**: 프록시를 시작하고 테스트 요청을 보냅니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "user_id": "user-123",
        "custom_field": "custom_value"
    }
}'
```

### 팀 기반 로깅 {#team-based-logging}

팀 콜백 설정을 사용해 팀별로 서로 다른 PostHog 자격 증명을 구성합니다.

```bash
curl -X POST 'http://localhost:4000/team/{team_id}/callback' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "callback_name": "posthog",
    "callback_type": "success",
    "callback_vars": {
      "posthog_api_key": "ph_team_specific_key",
      "posthog_api_url": "https://custom.posthog.com"
    }
  }'
```

이제 해당 팀의 모든 요청은 팀에 지정된 PostHog 프로젝트에 기록됩니다.

## LiteLLM Python SDK에서 사용하기 {#usage-with-litellm-python-sdk}

### 빠른 시작

단 2줄의 코드만으로 **모든 공급자**의 응답을 PostHog에 즉시 기록할 수 있습니다.

```python
litellm.success_callback = ["posthog"]
litellm.failure_callback = ["posthog"] # logs errors to posthog
```
```python
import litellm
import os

# from PostHog
os.environ["POSTHOG_API_KEY"] = ""
# Optional, defaults to https://app.posthog.com
os.environ["POSTHOG_API_URL"] = "" # optional

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set posthog as a callback, litellm will send the data to posthog
litellm.success_callback = ["posthog"]

# openai call
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Hi - i'm openai"}
    ],
    metadata = {
        "user_id": "user-123", # set posthog user ID
    }
)
```

### 고급 설정 {#advanced}

#### 사용자 ID 및 사용자 지정 메타데이터 설정 {#set-user-id-and-custom-metadata}

`metadata`에 `user_id`를 전달하여 PostHog에서 이벤트를 특정 사용자와 연결합니다.

**LiteLLM Python SDK 사용:**

```python
import litellm

litellm.success_callback = ["posthog"]

response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Hello world"}
    ],
    metadata={
        "user_id": "user-123",  # Add user ID for PostHog tracking
        "custom_field": "custom_value"  # Add custom metadata
    }
)
```

**OpenAI Python SDK로 LiteLLM Proxy 사용:**

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",  # Your LiteLLM Proxy API key
    base_url="http://0.0.0.0:4000"  # Your LiteLLM Proxy URL
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Hello world"}
    ],
    extra_body={
        "metadata": {
            "user_id": "user-123",  # Add user ID for PostHog tracking
            "project_name": "my-project",  # Add custom metadata
            "environment": "production"
        }
    }
)
```

#### 요청별 자격 증명 {#per-request-credentials}

요청마다 PostHog 자격 증명을 재정의할 수 있습니다.

```python
import litellm

litellm.success_callback = ["posthog"]

# Use custom PostHog credentials for this specific request
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Hello world"}
    ],
    posthog_api_key="ph_custom_project_key",
    posthog_api_url="https://custom.posthog.com"
)
```

다음과 같은 경우에 유용합니다.
- 서로 다른 팀/프로젝트를 별도의 PostHog 인스턴스에 기록해야 하는 경우
- 스테이징과 프로덕션에 서로 다른 PostHog 프로젝트를 사용해야 하는 경우
- 고객 또는 테넌트에 따라 로그를 라우팅해야 하는 경우

#### 특정 호출의 로깅 비활성화 {#disable-logging-for-specific-calls}

특정 호출이 기록되지 않도록 하려면 `no-log` 플래그를 사용합니다.

```python
import litellm

litellm.success_callback = ["posthog"]

response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "This won't be logged"}
    ],
    metadata={"no-log": True}
)
```

## PostHog에 기록되는 항목 {#whats-logged-to-posthog}

LiteLLM이 PostHog에 로그를 기록할 때 LLM 사용량에 대한 자세한 정보를 캡처합니다.

### Completion 호출 {#for-completion-calls}
- **모델 정보**: 공급자, 모델 이름, 모델 매개변수
- **사용량 지표**: 입력 토큰, 출력 토큰, 총 비용
- **성능**: 지연 시간, 완료 시간
- **콘텐츠**: 입력 메시지, 모델 응답(개인정보 보호 설정 준수)
- **메타데이터**: 사용자 지정 필드, 사용자 ID, 추적 정보

### Embedding 호출 {#for-embedding-calls}
- **모델 정보**: 공급자, 모델 이름
- **사용량 지표**: 입력 토큰, 총 비용
- **성능**: 지연 시간
- **콘텐츠**: 입력 텍스트(개인정보 보호 설정 준수)
- **메타데이터**: 사용자 지정 필드, 사용자 ID, 추적 정보

### 오류 {#for-errors}
- **오류 세부 정보**: 오류 유형, 오류 메시지, 스택 추적
- **컨텍스트**: 모델, 공급자, 오류를 일으킨 입력
- **타이밍**: 오류 발생 시점, 요청 소요 시간

## 환경 변수 {#environment-variables}

| 변수 | 필수 여부 | 설명 |
|----------|----------|-------------|
| `POSTHOG_API_KEY` | 예 | PostHog 프로젝트 API 키 |
| `POSTHOG_API_URL` | 아니요 | PostHog API URL(기본값: https://app.posthog.com) |

## 문제 해결

### 1. API 키 누락 {#1-missing-api-key}
```
Error: POSTHOG_API_KEY is not set
```

PostHog API 키를 설정합니다.
```python
import os
os.environ["POSTHOG_API_KEY"] = "your-api-key"
```

### 2. 사용자 지정 PostHog 인스턴스 {#2-custom-posthog-instance}
자체 호스팅 PostHog 인스턴스를 사용하는 경우:
```python
import os
os.environ["POSTHOG_API_URL"] = "https://your-posthog-instance.com"
```

### 3. 이벤트가 표시되지 않음 {#3-events-not-appearing}
- API 키가 올바른지 확인합니다.
- PostHog와의 네트워크 연결을 확인합니다.
- 이벤트가 PostHog 대시보드에 표시되기까지 몇 분 정도 걸릴 수 있습니다.
