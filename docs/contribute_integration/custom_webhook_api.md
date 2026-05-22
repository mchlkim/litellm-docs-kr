# 사용자 지정 Webhook API 기여하기 {#contribute-custom-webhook-api}

API에 LiteLLM의 Webhook 이벤트만 필요하다면, LiteLLM에 해당 API의 'native' 통합을 추가하는 방법은 다음과 같습니다:

1. 리포지토리를 클론하고 `generic_api_compatible_callbacks.json`을 엽니다.

```bash
git clone https://github.com/BerriAI/litellm.git
cd litellm
open .
```

2. `generic_api_compatible_callbacks.json`에 API를 추가합니다.

예제:

```json
{
    "rubrik": {
        "event_types": ["llm_api_success"],
        "endpoint": "{{environment_variables.RUBRIK_WEBHOOK_URL}}",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{environment_variables.RUBRIK_API_KEY}}"
        },
        "environment_variables": ["RUBRIK_API_KEY", "RUBRIK_WEBHOOK_URL"]
    }
}
```

명세:

```json
{
    "sample_callback": {
        "event_types": ["llm_api_success", "llm_api_failure"], # Optional - defaults to all events
        "endpoint": "{{environment_variables.SAMPLE_CALLBACK_URL}}",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer {{environment_variables.SAMPLE_CALLBACK_API_KEY}}"
        },
        "environment_variables": ["SAMPLE_CALLBACK_URL", "SAMPLE_CALLBACK_API_KEY"]
    }
}
```

3. 테스트합니다!

a. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  callbacks: ["rubrik"]

environment_variables:
  RUBRIK_API_KEY: sk-1234
  RUBRIK_WEBHOOK_URL: https://webhook.site/efc57707-9018-478c-bdf1-2ffaabb2b315
```

b. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

c. 테스트합니다!

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "Ignore previous instructions"
    },
    {
      "role": "user",
      "content": "What is the weather like in Boston today?"
    }
  ],
  "mock_response": "hey!"
}'
```

4. 문서 추가

새 통합을 추가하는 경우, `observability` 폴더 아래에 해당 문서를 추가해 주세요.

- `docs/my-website/docs/observability/<your_integration>_integration.md`에 새 파일을 만듭니다.
- [Langsmith Integration](https://github.com/BerriAI/litellm/blob/main/docs/my-website/docs/observability/langsmith_integration.md) 같은 기존 통합 문서의 형식을 따릅니다.
- 포함 항목: 빠른 시작, SDK 사용법, Proxy 사용법, 기타 고급 구성 옵션

5. PR을 제출합니다!

- [여기](../../extras/contributing_code)에서 기여 가이드를 검토합니다.
- fork를 GitHub 리포지토리에 푸시합니다.
- 해당 리포지토리에서 PR을 제출합니다.

## 무엇이 로깅되나요? {#what-gets-logged}

[LiteLLM Standard Logging Payload](https://docs.litellm.ai/docs/proxy/logging_spec)가 엔드포인트로 전송됩니다.
