# Sentry - LLM 예외 로깅 {#sentry---log-llm-exceptions}
import Image from '@theme/IdealImage';


:::tip

이 문서는 커뮤니티에서 유지 관리합니다. 버그가 발생하면 이슈를 생성해 주세요.
https://github.com/BerriAI/litellm

:::


[Sentry](https://sentry.io/)는 프로덕션 환경을 위한 오류 모니터링을 제공합니다. LiteLLM은 이 통합을 통해 breadcrumb를 추가하고 예외를 Sentry로 보낼 수 있습니다.

다음 항목의 예외를 추적합니다.
- litellm.completion() - 100개 이상의 LLM을 위한 completion()
- litellm.acompletion() - 비동기 completion()
- 스트리밍 completion() 및 acompletion() 호출

<Image img={require('../../img/sentry.png')} />


## 사용법

### SENTRY_DSN 및 callback 설정 {#set-sentry_dsn--callback}

```python
import litellm, os
os.environ["SENTRY_DSN"] = "your-sentry-url"
litellm.failure_callback=["sentry"]
```

### completion에서 Sentry callback 사용 {#sentry-callback-with-completion}
```python
import litellm
from litellm import completion 

litellm.input_callback=["sentry"] # adds sentry breadcrumbing
litellm.failure_callback=["sentry"] # [OPTIONAL] if you want litellm to capture -> send exception to sentry

import os 
os.environ["SENTRY_DSN"] = "your-sentry-url"
os.environ["OPENAI_API_KEY"] = "your-openai-key"

# set bad key to trigger error 
api_key="bad-key"
response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hey!"}], stream=True, api_key=api_key)

print(response)
```

#### Sample Rate 옵션 {#sample-rate-options}

- **SENTRY_API_SAMPLE_RATE**: 오류 중 몇 퍼센트를 Sentry로 보낼지 제어합니다.
  - 0과 1 사이의 값입니다. 기본값은 1.0, 즉 오류의 100%입니다.
  - 예제: 0.5는 오류의 50%를 보내고, 0.1은 오류의 10%를 보냅니다.

- **SENTRY_API_TRACE_RATE**: 성능 모니터링을 위해 트랜잭션 중 몇 퍼센트를 샘플링할지 제어합니다.
  - 0과 1 사이의 값입니다. 기본값은 1.0, 즉 트랜잭션의 100%입니다.
  - 예제: 0.5는 트랜잭션의 50%를 추적하고, 0.1은 트랜잭션의 10%를 추적합니다.

이 옵션은 오류와 트랜잭션 일부만 샘플링해도 충분한 가시성을 확보하면서 비용을 관리할 수 있는 대용량 애플리케이션에 유용합니다.

#### Sentry Environment {#sentry-environment}
- **SENTRY_ENVIRONMENT**: Sentry 이벤트의 환경 이름을 지정합니다. 예: "production", "staging", "development"
  - Sentry dashboard에서 배포 환경별로 오류를 구성하고 필터링하는 데 도움이 됩니다.
  - 예제: `os.environ["SENTRY_ENVIRONMENT"] = "staging"`
  - 설정하지 않으면 Sentry는 'production'을 기본 환경으로 사용합니다.

## Sentry Logging에서 메시지와 응답 콘텐츠 수정 처리 {#redacting-messages-response-content-from-sentry-logging}

`litellm.turn_off_message_logging=True`를 설정하세요. 이렇게 하면 메시지와 응답이 Sentry에 로깅되지 않지만, 요청 metadata는 계속 로깅됩니다.

Sentry에서 추가 옵션이 필요하면 [알려주세요](https://github.com/BerriAI/litellm/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml&title=%5BFeature%5D%3A+).
