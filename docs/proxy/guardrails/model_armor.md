import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google Cloud Model Armor 가드레일

LiteLLM은 [Model Armor API](https://cloud.google.com/security-command-center/docs/model-armor-overview)를 통해 Google Cloud Model Armor 가드레일을 지원합니다.


## 지원되는 가드레일 {#supported-가드레일}

- [Model Armor Templates](https://cloud.google.com/security-command-center/docs/manage-model-armor-templates) - 설정된 템플릿을 기반으로 콘텐츠를 정제하고 차단합니다.

## 빠른 시작
### 1. LiteLLM config.yaml에서 가드레일 정의 {#1-define-guardrails-on-your-litellm-configyaml}

`guardrails` 섹션 아래에 가드레일을 정의합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: model-armor-shield
    litellm_params:
      guardrail: model_armor
      mode: [pre_call, during_call, post_call]  # Run on input, parallel, and output
      template_id: "your-template-id"  # Required: Your Model Armor template ID
      project_id: "your-project-id"    # Your GCP project ID
      location: "us-central1"          # GCP location (default: us-central1)
      credentials: "path/to/credentials.json"  # Path to service account key
      mask_request_content: true       # Enable request content masking
      mask_response_content: true      # Enable response content masking
      fail_on_error: true             # Fail request if Model Armor errors (default: true)
      default_on: true                # Run by default for all requests
```

#### `mode`에서 지원되는 값 {#supported-values-for-mode}

- `pre_call` LLM 호출 **전**에 **입력**에 대해 실행합니다.
- `during_call` LLM 호출과 **병렬**로 **입력**에 대해 실행합니다.
- `post_call` LLM 호출 **후**에 **출력**에 대해 실행합니다.

### 2. LiteLLM Gateway 시작 {#2-start-litellm-gateway}


```shell
litellm --config config.yaml --detailed_debug
```

### 3. 요청 테스트 {#3-test-request}

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hi, my email is test@example.com"}
    ],
    "guardrails": ["model-armor-shield"]
  }'
```

## 지원되는 매개변수 {#supported-params}

### 공통 매개변수 {#common-params}

- `api_key` - str - Google Cloud 서비스 계정 사용자 인증 정보입니다. ADC를 사용하는 경우 선택 사항입니다.
- `api_base` - str - 사용자 지정 Model Armor API 엔드포인트입니다. 선택 사항입니다.
- `default_on` - bool - 기본적으로 가드레일을 실행할지 여부입니다. 기본값은 `false`입니다.
- `mode` - Union[str, list[str]] - 가드레일을 실행할 모드입니다. 지원되는 값은 `pre_call`, `during_call`, `post_call`입니다. 기본값은 `pre_call`입니다.

### Model Armor 전용 {#model-armor-specific}

- `template_id` - str - Model Armor 템플릿의 ID입니다. 필수 항목입니다.
- `project_id` - str - Google Cloud 프로젝트 ID입니다. 기본값은 사용자 인증 정보의 프로젝트입니다.
- `location` - str - Google Cloud 위치/리전입니다. 기본값은 `us-central1`입니다.
- `credentials` - Union[str, dict] - 서비스 계정 JSON 파일 경로 또는 사용자 인증 정보 딕셔너리입니다.
- `api_endpoint` - str - Model Armor용 사용자 지정 API 엔드포인트입니다. 선택 사항입니다.
- `fail_on_error` - bool - Model Armor에서 오류가 발생하면 요청을 실패로 처리할지 여부입니다. 기본값은 `true`입니다.
- `mask_request_content` - bool - 요청의 민감한 콘텐츠 마스킹을 활성화합니다. 기본값은 `false`입니다.
- `mask_response_content` - bool - 응답의 민감한 콘텐츠 마스킹을 활성화합니다. 기본값은 `false`입니다.


## 추가 자료 {#further-reading}

- [API Key별 가드레일 제어](./quick_start#-control-guardrails-per-api-key)
