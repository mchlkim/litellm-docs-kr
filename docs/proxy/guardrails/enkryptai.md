import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# EnkryptAI 가드레일

LiteLLM은 LLM 입력과 출력에 대한 콘텐츠 조정 및 안전성 검사를 위해 EnkryptAI 가드레일을 지원합니다.

## 빠른 시작

### 1. LiteLLM config.yaml에 가드레일 정의

`guardrails` 섹션 아래에 가드레일을 정의합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "enkryptai-guard"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      detectors:
        toxicity:
          enabled: true
        nsfw:
          enabled: true
        pii:
          enabled: true
          entities: ["email", "phone", "secrets"]
        injection_attack:
          enabled: true
```

#### `mode`에서 지원되는 값

- `pre_call` - LLM 호출 **전**, **입력**에 대해 실행합니다.
- `post_call` - LLM 호출 **후**, **출력**에 대해 실행합니다.
- `during_call` - LLM 호출 **중**, **입력**에 대해 실행합니다. `pre_call`과 동일하지만 LLM 호출과 병렬로 실행됩니다.

#### 사용 가능한 감지기

EnkryptAI는 여러 콘텐츠 감지 유형을 지원합니다.

- **toxicity** - 유해한 언어를 감지합니다.
- **nsfw** - NSFW(업무 환경에 부적절한) 콘텐츠를 감지합니다.
- **pii** - 개인 식별 정보를 감지합니다.
  - 엔티티 구성: `["pii", "email", "phone", "secrets", "ip_address", "url"]`
- **injection_attack** - 프롬프트 인젝션 시도를 감지합니다.
- **keyword_detector** - 사용자 지정 키워드/구문을 감지합니다.
- **policy_violation** - 정책 위반을 감지합니다.
- **bias** - 편향된 콘텐츠를 감지합니다.
- **sponge_attack** - 스펀지 공격을 감지합니다.

### 2. 환경 변수 설정

```bash
export ENKRYPTAI_API_KEY="your-api-key"
```

### 3. LiteLLM Gateway 시작

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 요청 테스트

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="성공한 호출" value="allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, how can you help me today?"}
    ],
    "guardrails": ["enkryptai-guard"]
  }'
```

**응답: HTTP 200 성공**

콘텐츠가 모든 감지기 검사를 통과하여 허용됩니다.

</TabItem>

<TabItem label="실패한 호출" value="not-allowed">

콘텐츠가 감지기 정책을 위반하면 이 요청은 실패해야 합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "My email is test@example.com and my SSN is 123-45-6789"}
    ],
    "guardrails": ["enkryptai-guard"]
  }'
```

**실패 시 예상 응답: HTTP 400 오류**

```json
{
  "error": {
    "message": {
      "error": "Content blocked by EnkryptAI guardrail",
      "detected": true,
      "violations": ["pii"],
      "response": {
        "summary": {
          "pii": 1
        },
        "details": {
          "pii": {
            "detected": ["email", "ssn"]
          }
        }
      }
    },
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>
</Tabs>

## 동영상 안내

<iframe width="840" height="500" src="https://www.loom.com/embed/ff222211e0864937aee4aeef0f28c3b7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 고급 설정

### 사용자 지정 정책 사용

사용자 지정 EnkryptAI 정책을 지정할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: "enkryptai-custom"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      policy_name: "my-custom-policy"  # Sent via x-enkrypt-policy header
      detectors:
        toxicity:
          enabled: true
```

### 배포 사용

EnkryptAI 배포를 지정합니다.

```yaml
guardrails:
  - guardrail_name: "enkryptai-deployment"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      deployment_name: "production"  # Sent via X-Enkrypt-Deployment header
      detectors:
        toxicity:
          enabled: true
```

### 모니터 모드(차단 없이 로깅)

요청을 차단하지 않고 위반 사항을 로깅하려면 `block_on_violation: false`를 설정합니다.

```yaml
guardrails:
  - guardrail_name: "enkryptai-monitor"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      block_on_violation: false  # Log violations but don't block
      detectors:
        toxicity:
          enabled: true
        nsfw:
          enabled: true
```

모니터 모드에서는 모든 위반 사항이 로깅되지만 요청은 차단되지 않습니다.

### 입력 및 출력 가드레일

입력과 출력에 대해 별도의 가드레일을 구성합니다.

```yaml
guardrails:
  # Input guardrail
  - guardrail_name: "enkryptai-input"
    litellm_params:
      guardrail: enkryptai
      mode: "pre_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      detectors:
        pii:
          enabled: true
          entities: ["email", "phone", "ssn"]
        injection_attack:
          enabled: true

  # Output guardrail
  - guardrail_name: "enkryptai-output"
    litellm_params:
      guardrail: enkryptai
      mode: "post_call"
      api_key: os.environ/ENKRYPTAI_API_KEY
      detectors:
        toxicity:
          enabled: true
        nsfw:
          enabled: true
```

## 설정 옵션

| 매개변수 | 유형 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `api_key` | string | EnkryptAI API 키 | `ENKRYPTAI_API_KEY` 환경 변수 |
| `api_base` | string | EnkryptAI API 기본 URL | `https://api.enkryptai.com` |
| `policy_name` | string | 사용자 지정 정책 이름(`x-enkrypt-policy` 헤더로 전송) | 없음 |
| `deployment_name` | string | 배포 이름(`X-Enkrypt-Deployment` 헤더로 전송) | 없음 |
| `detectors` | object | 감지기 구성 | `{}` |
| `block_on_violation` | boolean | 위반 발생 시 요청 차단 | `true` |
| `mode` | string | 실행 시점: `pre_call`, `post_call` 또는 `during_call` | 필수 |

## 관측성

EnkryptAI 가드레일 로그에는 다음 항목이 포함됩니다.

- **guardrail_status**: `success`, `guardrail_intervened` 또는 `guardrail_failed_to_respond`
- **guardrail_provider**: `enkryptai`
- **guardrail_json_response**: 감지 세부 정보가 포함된 전체 API 응답
- **duration**: 가드레일 검사에 걸린 시간
- **start_time** 및 **end_time**: 타임스탬프

이 로그는 구성된 LiteLLM 로깅 콜백을 통해 사용할 수 있습니다.

## 오류 처리

가드레일은 오류를 안정적으로 처리합니다.

- **API 실패**: 오류를 로깅하고 예외를 발생시킵니다.
- **속도 제한(429)**: 오류를 로깅하고 예외를 발생시킵니다.
- **잘못된 설정**: 초기화 시 `ValueError`를 발생시킵니다.

위반 사항이 감지되어도 처리를 계속하려면 `block_on_violation: false`를 설정합니다(모니터 모드).

## 지원

EnkryptAI에 대한 자세한 정보는 다음을 참고하세요.
- 문서: [https://docs.enkryptai.com](https://docs.enkryptai.com)
- 웹사이트: [https://enkryptai.com](https://enkryptai.com)
