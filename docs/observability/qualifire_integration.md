import Image from '@theme/IdealImage';

# Qualifire - LLM Evaluation, 가드레일 & 관측성

[Qualifire](https://qualifire.ai/)는 production AI 애플리케이션을 위한 실시간 Agentic evaluation, guardrail, observability를 제공합니다.

**주요 기능:**

- **Evaluation** - AI 동작을 체계적으로 평가해 hallucination, jailbreak, policy breach, 기타 취약점을 탐지합니다.
- **가드레일** - 브랜드 손상, 데이터 유출, compliance 위반 같은 위험을 막기 위해 실시간으로 개입합니다.
- **관측성** - RAG pipeline, chatbot, AI agent를 위한 완전한 tracing과 logging을 제공합니다.
- **Prompt Management** - versioning과 no-code studio를 포함한 중앙화된 prompt management를 제공합니다.

:::tip

Qualifire 가드레일을 찾고 있나요? 실시간 content moderation, prompt injection detection, PII check 등을 보려면 [Qualifire 가드레일 Integration](../proxy/guardrails/qualifire.md)을 확인하세요.

:::

## 사전 요구 사항

1. [Qualifire](https://app.qualifire.ai/)에서 계정을 만듭니다.
2. Qualifire dashboard에서 API key와 webhook URL을 가져옵니다.

```bash
uv add litellm
```

## 빠른 시작

코드 두 줄만으로 **모든 provider**의 응답을 Qualifire에 즉시 기록할 수 있습니다.

```python
litellm.callbacks = ["qualifire_eval"]
```

```python
import litellm
import os

# Set Qualifire credentials
os.environ["QUALIFIRE_API_KEY"] = "your-qualifire-api-key"
os.environ["QUALIFIRE_WEBHOOK_URL"] = "https://your-qualifire-webhook-url"

# LLM API Keys
os.environ['OPENAI_API_KEY'] = "your-openai-api-key"

# Set qualifire_eval as a callback & LiteLLM will send the data to Qualifire
litellm.callbacks = ["qualifire_eval"]

# OpenAI call
response = litellm.completion(
  model="gpt-5",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## LiteLLM Proxy와 함께 사용

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["qualifire_eval"]

general_settings:
  master_key: "sk-1234"

environment_variables:
  QUALIFIRE_API_KEY: "your-qualifire-api-key"
  QUALIFIRE_WEBHOOK_URL: "https://app.qualifire.ai/api/v1/webhooks/evaluations"
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ "model": "gpt-4o", "messages": [{"role": "user", "content": "Hi 👋 - i'm openai"}]}'
```

## 환경 변수

| 변수                    | 설명                                                   |
| ----------------------- | ------------------------------------------------------ |
| `QUALIFIRE_API_KEY`     | 인증에 사용할 Qualifire API key                        |
| `QUALIFIRE_WEBHOOK_URL` | dashboard에서 가져온 Qualifire webhook endpoint URL    |

## 어떤 데이터가 기록되나요?

LLM API 호출이 성공할 때마다 [LiteLLM Standard Logging Payload](https://docs.litellm.ai/docs/proxy/logging_spec)가 Qualifire 엔드포인트로 전송됩니다.

여기에는 다음이 포함됩니다:

- 요청 메시지와 파라미터
- 응답 content와 metadata
- 토큰 사용량 통계
- 지연 시간 metric
- 모델 정보
- 비용 데이터

데이터가 Qualifire에 들어오면 다음을 할 수 있습니다:

- hallucination, toxicity, policy violation을 탐지하는 evaluation 실행
- 응답을 실시간으로 차단하거나 수정하는 guardrail 설정
- 전체 AI pipeline의 trace 확인
- 시간에 따른 성능과 품질 metric 추적
