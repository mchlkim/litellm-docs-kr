import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Noma Security

[Noma Security](https://noma.security/)를 사용해 포괄적인 AI 콘텐츠 모더레이션과 안전 가드레일로 LLM 애플리케이션을 보호할 수 있습니다.

:::warning 지원 중단 예정: `guardrail: noma` (레거시)
`guardrail: noma`는 지원 중단 예정이며, 사용자는 `guardrail: noma_v2`로 마이그레이션해야 합니다.
레거시 `guardrail: noma` API는 2026년 3월 31일 이후 더 이상 지원되지 않습니다.

기존 통합을 더 쉽게 마이그레이션하려면 `guardrail: noma`를 유지하고 `use_v2: true`를 설정하세요.
`use_v2: true`를 사용하면 요청이 `noma_v2`로 라우팅됩니다. `monitor_mode`와 `block_failures`는 계속 적용되지만 `anonymize_input`은 무시됩니다.
:::

## Noma v2 가드레일 (권장) {#noma-v2-guardrails-recommended}

### 빠른 시작

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-v2-guard"
    litellm_params:
      guardrail: noma_v2
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

아직 가드레일 이름을 변경하지 않고 단계적으로 마이그레이션하려면 다음과 같이 설정하세요.

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      use_v2: true
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

### 지원되는 매개변수 {#supported-params}

- **`guardrail`**: `noma_v2`(권장)를 사용하거나, 마이그레이션을 위해 `use_v2: true`와 함께 `noma`를 사용합니다.
- **`mode`**: `pre_call`, `post_call`, `during_call`, `pre_mcp_call`, `during_mcp_call`
- **`api_key`**: Noma API 키입니다. Noma SaaS에서는 필수이고, 자체 관리 배포에서는 선택 사항입니다.
- **`api_base`**: Noma API 기본 URL입니다. 기본값은 `https://api.noma.security/`입니다.
- **`application_id`**: 애플리케이션 식별자입니다. 생략하면 v2는 동적 `extra_body.application_id`, 구성/env `application_id` 순서로 확인하며, 없으면 생략합니다.
- **`monitor_mode`**: `true`이면 차단하지 않고 모니터링 전용 모드로 실행합니다. 기본값은 `false`입니다.
- **`block_failures`**: `true`이면 가드레일 기술 오류가 발생할 때 fail-closed 방식으로 처리합니다. 기본값은 `true`입니다.
- **`use_v2`**: `guardrail: noma`를 사용할 때의 마이그레이션 토글입니다.

### 환경 변수 {#environment-variables}

```shell
export NOMA_API_KEY="your-api-key-here"
export NOMA_API_BASE="https://api.noma.security/"       # Optional
export NOMA_APPLICATION_ID="my-app"                     # Optional
export NOMA_MONITOR_MODE="false"                        # Optional
export NOMA_BLOCK_FAILURES="true"                       # Optional
```

### 여러 가드레일 {#multiple-guardrails}

입력과 출력에 서로 다른 v2 구성을 적용할 수 있습니다.

```yaml showLineNumbers title="litellm config.yaml"
guardrails:
  - guardrail_name: "noma-v2-input"
    litellm_params:
      guardrail: noma_v2
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY

  - guardrail_name: "noma-v2-output"
    litellm_params:
      guardrail: noma_v2
      mode: "post_call"
      api_key: os.environ/NOMA_API_KEY
```

### 추가 매개변수 전달 {#pass-additional-parameters}

v2에서는 `extra_body`를 통해 이를 지원합니다.  
현재 `noma_v2`는 동적 `application_id`를 사용합니다.

```shell showLineNumbers title="Curl 요청"
curl 'http://0.0.0.0:4000/v1/chat/completions' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "guardrails": {
      "noma-v2-guard": {
        "extra_body": {
          "application_id": "my-specific-app-id"
        }
      }
    }
  }'
```
## Noma 가드레일 (레거시) {#noma-guardrails-legacy}

## 빠른 시작

### 1. LiteLLM config.yaml에서 가드레일 정의 {#1-define-guardrails-on-your-litellm-configyaml}

`guardrails` 섹션 아래에 가드레일을 정의합니다.

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      mode: "during_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
  - guardrail_name: "noma-pre-guard"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
```

#### `mode`에 지원되는 값 {#supported-values-for-mode}

- `pre_call`: **입력**에 대해 LLM 호출 **전** 실행합니다.
- `post_call`: **입력 및 출력**에 대해 LLM 호출 **후** 실행합니다.
- `during_call`: **입력**에 대해 LLM 호출 **중** 실행합니다. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답이 반환되지 않습니다.
- `pre_mcp_call`: 실행 전에 MCP 도구 호출 입력을 스캔합니다.
- `during_mcp_call`: MCP 도구 호출을 실시간으로 모니터링합니다.

### 2. LiteLLM Gateway 시작 {#2-start-litellm-gateway}

```shell
litellm --config config.yaml --detailed_debug
```

### 3. 요청 테스트 {#3-test-request}

<Tabs>
<TabItem label="실패한 호출" value="not-allowed">

요청에 유해한 콘텐츠가 포함되어 있으므로 실패해야 합니다.

```shell showLineNumbers title="Curl 요청"
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Tell me how to hack into someone's email account"}
    ]
  }'
```

실패 시 예상 응답:

```json
{
  "error": {
    "message": "{\n      \"error\": \"Request blocked by Noma guardrail\",\n      \"details\": {\n        \"prompt\": {\n          \"harmfulContent\": {\n            \"result\": true,\n            \"confidence\": 0.95\n          }\n        }\n      }\n    }",
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="성공한 호출" value="allowed">

```shell showLineNumbers title="Curl 요청"
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

예상 응답:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

</TabItem>
</Tabs>

## 지원되는 매개변수 {#supported-params-1}

```yaml
guardrails:
  - guardrail_name: "noma-guard"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      api_base: os.environ/NOMA_API_BASE
      ### OPTIONAL ###
      # application_id: "my-app"
      # monitor_mode: false
      # block_failures: true
      # anonymize_input: false
```

### 필수 매개변수 {#required-parameters}

- **`api_key`**: Noma Security API 키입니다. YAML 구성에서 `os.environ/NOMA_API_KEY`로 설정합니다.

### 선택적 매개변수 {#optional-parameters}

- **`api_base`**: Noma API 기본 URL입니다. 기본값은 `https://api.noma.security/`입니다.
- **`application_id`**: 애플리케이션 식별자입니다. 기본값은 `"litellm"`입니다.
- **`monitor_mode`**: `true`이면 차단하지 않고 위반 사항을 기록합니다. 기본값은 `false`입니다.
- **`block_failures`**: `true`이면 가드레일 API 오류가 발생할 때 요청을 차단합니다. 기본값은 `true`입니다.
- **`anonymize_input`**: `true`이면 민감한 콘텐츠를 익명화된 버전으로 대체합니다. 기본값은 `false`입니다.

## 환경 변수 {#environment-variables-1}

구성에 값을 하드코딩하는 대신 다음 환경 변수를 설정할 수 있습니다.

```shell
export NOMA_API_KEY="your-api-key-here"
export NOMA_API_BASE="https://api.noma.security/"   # Optional
export NOMA_APPLICATION_ID="my-app"                 # Optional
export NOMA_MONITOR_MODE="false"                    # Optional
export NOMA_BLOCK_FAILURES="true"                   # Optional
export NOMA_ANONYMIZE_INPUT="false"                 # Optional
```

## 고급 설정 {#advanced-settings}

### 모니터링 모드 {#monitor-mode}

요청을 차단하지 않고 가드레일을 테스트하려면 모니터링 모드를 사용합니다.

```yaml
guardrails:
  - guardrail_name: "noma-monitor"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      monitor_mode: true  # Log violations but don't block
```

### API 오류 처리 {#handling-api-failures}

Noma API를 사용할 수 없을 때의 동작을 제어합니다.

```yaml
guardrails:
  - guardrail_name: "noma-failopen"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      block_failures: false  # Allow requests to proceed if guardrail API fails
```

### 콘텐츠 익명화 {#content-anonymization}

차단하는 대신 민감한 콘텐츠를 대체하려면 익명화를 활성화합니다.

```yaml
guardrails:
  - guardrail_name: "noma-anonymize"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      anonymize_input: true  # Replace sensitive data with anonymized version
```

### 여러 가드레일 {#multiple-guardrails-1}

입력과 출력에 서로 다른 구성을 적용할 수 있습니다.

```yaml
guardrails:
  - guardrail_name: "noma-strict-input"
    litellm_params:
      guardrail: noma
      mode: "pre_call"
      api_key: os.environ/NOMA_API_KEY
      block_failures: true

  - guardrail_name: "noma-monitor-output"
    litellm_params:
      guardrail: noma
      mode: "post_call"
      api_key: os.environ/NOMA_API_KEY
      monitor_mode: true
```

## ✨ 추가 매개변수 전달 {#pass-additional-parameters-1}

`extra_body`를 사용해 특정 요청의 애플리케이션 ID를 동적으로 설정하는 등 Noma Security API 호출에 추가 매개변수를 전달할 수 있습니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="your-api-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    extra_body={
        "guardrails": {
            "noma-guard": {
                "extra_body": {
                    "application_id": "my-specific-app-id"
                }
            }
        }
    }
)
```
</TabItem>

<TabItem value="curl" label="Curl">

```shell
curl 'http://0.0.0.0:4000/v1/chat/completions' \
    -H 'Content-Type: application/json' \
    -d '{
    "model": "gpt-4o-mini",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "guardrails": {
        "noma-guard": {
            "extra_body": {
                "application_id": "my-specific-app-id"
            }
        }
    }
}'
```
</TabItem>
</Tabs>

이를 통해 특정 요청에서 기본 `application_id` 매개변수를 재정의할 수 있으며, 여러 애플리케이션이나 구성 요소의 사용량을 추적할 때 유용합니다.

## 응답 세부 정보 {#response-details}

콘텐츠가 차단되면 Noma는 `message` 필드 안에 위반 사항에 대한 자세한 정보를 다음 구조의 JSON으로 제공합니다.

```json
{
  "error": "Request blocked by Noma guardrail",
  "details": {
    "prompt": {
      "harmfulContent": {
        "result": true,
        "confidence": 0.95
      },
      "sensitiveData": {
        "email": {
          "result": true,
          "entities": ["user@example.com"]
        }
      },
      "bannedTopics": {
        "violence": {
          "result": true,
          "confidence": 0.88
        }
      }
    }
  }
}
```
