# Greenscale - LLM 지출 및 책임 있는 사용량 추적하기 {#greenscale---track-llm-spend-and-responsible-usage}


:::tip

이 문서는 커뮤니티에서 유지 관리합니다. 버그가 발생하면 이슈를 만들어 주세요.
https://github.com/BerriAI/litellm

:::


[Greenscale](https://greenscale.ai/)는 LLM 기반 앱을 위한 프로덕션 모니터링 플랫폼으로, GenAI 지출과 책임 있는 사용량에 대한 세분화된 핵심 인사이트를 제공합니다. Greenscale은 개인 식별 정보(PII) 노출 위험을 최소화하기 위해 메타데이터만 캡처합니다.

## 시작하기

Greenscale을 사용하면 모든 LLM 공급자 전반의 요청을 로깅할 수 있습니다.

liteLLM은 `callbacks`를 제공하므로 응답 상태에 따라 데이터를 쉽게 로깅할 수 있습니다.

## Callbacks 사용하기 {#using-callbacks}

먼저 `hello@greenscale.ai`로 이메일을 보내 API_KEY를 발급받으세요.

코드 한 줄만으로 Greenscale을 통해 **모든 공급자 전반의** 응답을 즉시 로깅할 수 있습니다.

```python
litellm.success_callback = ["greenscale"]
```

### 전체 코드 {#complete-code}

```python
from litellm import completion

## set env variables
os.environ['GREENSCALE_API_KEY'] = 'your-greenscale-api-key'
os.environ['GREENSCALE_ENDPOINT'] = 'greenscale-endpoint'
os.environ["OPENAI_API_KEY"]= ""

# set callback
litellm.success_callback = ["greenscale"]

#openai call
response = completion(
  model="gpt-3.5-turbo",
  messages=[{"role": "user", "content": "Hi 👋 - i'm openai"}]
  metadata={
    "greenscale_project": "acme-project",
    "greenscale_application": "acme-application"
  }
)
```

## metadata에 추가 정보 전달하기 {#additional-information-in-metadata}

completion의 `metadata` 필드와 `greenscale_` 접두사를 사용해 Greenscale로 추가 정보를 보낼 수 있습니다. 이는 프로젝트 및 애플리케이션 이름, customer_id, environment 또는 사용량 추적에 필요한 기타 정보처럼 요청 관련 메타데이터를 보낼 때 유용합니다. `greenscale_project`와 `greenscale_application`은 필수 필드입니다.

```python
#openai call with additional metadata
response = completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  metadata={
    "greenscale_project": "acme-project",
    "greenscale_application": "acme-application",
    "greenscale_customer_id": "customer-123"
  }
)
```

## 지원 및 Greenscale 팀에 문의하기 {#support--talk-with-greenscale-team}

- [데모 예약 👋](https://calendly.com/nandesh/greenscale)
- [웹사이트 💻](https://greenscale.ai)
- 문의 이메일 ✉️ `hello@greenscale.ai`
