import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# IBM 가드레일

LiteLLM은 콘텐츠 안전을 위해 [IBM FMS 가드레일](https://github.com/foundation-model-stack/fms-guardrails-orchestrator)과 함께 동작합니다. 이를 사용해 jailbreak, PII, 혐오 표현 등을 감지할 수 있습니다.

## 기능

IBM FMS 가드레일은 LLM 입력과 출력에 대해 detector를 호출하는 프레임워크입니다. 이러한 detector를 구성하려면 Red Hat의 [TrustyAI team](https://github.com/trustyai-explainability)이 유지 관리하는 오픈 소스 프로젝트인 [TrustyAI detectors](https://github.com/trustyai-explainability/guardrails-detectors) 등을 사용할 수 있습니다. 사용자는 다음과 같은 detector를 구성할 수 있습니다.

- regex patterns
- 파일 유형 validator
- 사용자 지정 Python 함수
- Hugging Face [AutoModelForSequenceClassification](https://huggingface.co/docs/transformers/en/model_doc/auto#transformers.AutoModelForSequenceClassification), i.e. sequence classification models

각 detector는 다음 [openapi schema](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/docs/api/openapi_detector_api.yaml)를 기반으로 API 응답을 출력합니다.

다음 시점에 검사를 실행할 수 있습니다.
- LLM으로 보내기 전(사용자 입력 기준)
- LLM 응답을 받은 후(출력 기준)
- 호출 중(LLM과 병렬)

## 빠른 시작

### 1. config.yaml에 추가

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: ibm-jailbreak-detector
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true
      default_on: true
      optional_params:
        score_threshold: 0.8
        block_on_detection: true
```

### 2. auth token 설정

```bash
export IBM_GUARDRAILS_AUTH_TOKEN="your-token"
```

### 3. 프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 요청 보내기

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "guardrails": ["ibm-jailbreak-detector"]
  }'
```

## 설정

### 필수 파라미터

- `guardrail` - str - `ibm_guardrails`로 설정합니다.
- `auth_token` - str - IBM 가드레일 auth token입니다. `os.environ/IBM_GUARDRAILS_AUTH_TOKEN`을 사용할 수 있습니다.
- `base_url` - str - IBM Detector 또는 가드레일 서버 URL입니다.
- `detector_id` - str - 사용할 detector입니다(예: "jailbreak-detector", "pii-detector").

### 선택 파라미터

- `mode` - str 또는 list[str] - 실행 시점입니다. 옵션: `pre_call`, `post_call`, `during_call`. 기본값: `pre_call`
- `default_on` - bool - 요청에서 지정하지 않아도 자동으로 실행할지 여부입니다. 기본값: `false`
- `is_detector_server` - bool - detector server이면 `true`, orchestrator이면 `false`입니다. 기본값: `true`
- `verify_ssl` - bool - SSL 인증서를 검증할지 여부입니다. 기본값: `true`

### optional_params

다음 항목은 `optional_params` 아래에 넣습니다.

- `detector_params` - dict - detector에 전달할 파라미터입니다.
- `extra_headers` - dict - IBM 가드레일 요청에 주입할 추가 헤더입니다. key-value dict 형식입니다.
- `score_threshold` - float - 이 점수보다 높은 감지만 집계합니다(0.0~1.0).
- `block_on_detection` - bool - 위반이 발견되면 요청을 차단합니다. 기본값: `true`

## 서버 유형

IBM 가드레일에서는 두 가지 API를 사용할 수 있습니다.

### Detector Server(권장)

[이 Detectors API](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/?urls.primaryName=Detector+API#/Text)는 단일 detector를 실행하기 위해 `api/v1/text/contents` 엔드포인트를 사용하며, 하나의 요청에서 여러 text input을 받을 수 있습니다.

```yaml
guardrails:
  - guardrail_name: ibm-detector
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true  # Use detector server
```

### Orchestrator

IBM FMS 가드레일 Orchestrator를 사용하는 경우 [FMS Orchestrator API](https://foundation-model-stack.github.io/fms-guardrails-orchestrator/?urls.primaryName=Orchestrator+API)를 사용할 수 있습니다. 특히 `api/v2/text/detection/content`를 활용하면 하나의 요청에서 여러 detector를 실행할 수 있지만, 이 엔드포인트는 요청당 하나의 text input만 받을 수 있습니다.

```yaml
guardrails:
  - guardrail_name: ibm-orchestrator
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-orchestrator-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: false  # Use orchestrator
```

## 예제

### 입력에서 jailbreak 검사

```yaml
guardrails:
  - guardrail_name: jailbreak-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true
      default_on: true
      optional_params:
        score_threshold: 0.8
```

### 응답에서 PII 검사

```yaml
guardrails:
  - guardrail_name: pii-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: post_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "pii-detector"
      is_detector_server: true
      optional_params:
        score_threshold: 0.5  # Lower threshold for PII
        block_on_detection: true
```

### 여러 detector 실행

```yaml
guardrails:
  - guardrail_name: jailbreak-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: pre_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "jailbreak-detector"
      is_detector_server: true
      
  - guardrail_name: pii-check
    litellm_params:
      guardrail: ibm_guardrails
      mode: post_call
      auth_token: os.environ/IBM_GUARDRAILS_AUTH_TOKEN
      base_url: "https://your-detector-server.com"
      detector_id: "pii-detector"
      is_detector_server: true
```

그런 다음 요청에서 다음과 같이 지정합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["jailbreak-check", "pii-check"]
  }'
```

## 감지 동작 방식

IBM 가드레일이 무언가를 발견하면 감지한 항목의 세부 정보를 반환합니다.

```json
{
  "start": 0,
  "end": 31,
  "text": "You are now in Do Anything Mode",
  "detection_type": "jailbreak",
  "score": 0.858
}
```

- `score` - 감지 신뢰도입니다(0.0~1.0).
- `text` - 감지를 유발한 구체적인 텍스트입니다.
- `detection_type` - 위반 유형입니다.

점수가 `score_threshold`보다 높으면, `block_on_detection`이 true일 때 요청이 차단됩니다.

## 추가 자료

- [API Key별 가드레일 제어](./quick_start#-control-guardrails-per-api-key)
- [GitHub의 IBM FMS 가드레일](https://github.com/foundation-model-stack/fms-guardrails-orchestr8)
