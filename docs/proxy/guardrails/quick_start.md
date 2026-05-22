import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 가드레일 - 빠른 시작

LiteLLM 프록시(AI 게이트웨이)에서 프롬프트 인젝션 탐지와 PII 마스킹을 설정합니다.

## 1. LiteLLM 설정 파일에서 가드레일 정의

`guardrails` 섹션 아래에 가드레일을 설정합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: general-guard
    litellm_params:
      guardrail: aim
      mode: [pre_call, post_call]
      api_key: os.environ/AIM_API_KEY
      api_base: os.environ/AIM_API_BASE
      default_on: true # Optional
  
  - guardrail_name: "aporia-pre-guard"
    litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "during_call"
      api_key: os.environ/APORIA_API_KEY_1
      api_base: os.environ/APORIA_API_BASE_1
  - guardrail_name: "aporia-post-guard"
    litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "post_call"
      api_key: os.environ/APORIA_API_KEY_2
      api_base: os.environ/APORIA_API_BASE_2
    guardrail_info: # Optional field, info is returned on GET /guardrails/list
      # you can enter any fields under info for consumers of your guardrail
      params:
        - name: "toxicity_score"
          type: "float"
          description: "Score between 0-1 indicating content toxicity level"
        - name: "pii_detection"
          type: "boolean"

# Example Presidio guardrail config with entity actions + confidence score thresholds
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
      presidio_language: "en"
      pii_entities_config:
        CREDIT_CARD: "MASK"
        EMAIL_ADDRESS: "MASK"
        US_SSN: "MASK"
      presidio_score_thresholds:  # minimum confidence scores for keeping detections
        CREDIT_CARD: 0.8
        EMAIL_ADDRESS: 0.6

# Example Pillar Security config via Generic Guardrail API
  - guardrail_name: "pillar-security"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: [pre_call, post_call]
      api_base: https://api.pillar.security/api/v1/integrations/litellm
      api_key: os.environ/PILLAR_API_KEY
      additional_provider_specific_params:
        plr_mask: true
        plr_evidence: true
        plr_scanners: true
```

Generic Guardrail API에서는 **정적 헤더**(`headers`: 모든 요청에 전송되는 key/value)와 **동적 헤더**(`extra_headers`: 전달할 클라이언트 헤더 이름 목록)도 설정할 수 있습니다. 자세한 내용은 [Generic Guardrail API - 정적 및 동적 헤더](/docs/adding_provider/generic_guardrail_api#static-and-dynamic-headers)를 참고하세요.

### `mode` 지원 값(Event Hooks)

- `pre_call`: LLM 호출 **전**에 **입력**에 대해 실행합니다.
- `post_call`: LLM 호출 **후**에 **입력 및 출력**에 대해 실행합니다.
- `during_call`: LLM 호출 **중**에 **입력**에 대해 실행합니다. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답은 반환되지 않습니다.
- 여러 모드를 실행하려면 위 값을 목록으로 지정합니다. 예: `mode: [pre_call, post_call]`

### 가드레일 평가에서 시스템 메시지 건너뛰기

전체 `messages` 목록은 모델에 그대로 보내면서, **통합** 가드레일이 `role: system` 내용을 스캔하지 않도록 할 수 있습니다.

**전역** — `litellm_settings`에서 설정:

```yaml
litellm_settings:
  skip_system_message_in_guardrail: true
```

**가드레일별** — 해당 가드레일의 `litellm_params` 아래에서 `skip_system_message_in_guardrail: true` 또는 `false`를 설정합니다. 생략하면 전역 `litellm_settings` 값을 사용합니다. 가드레일별 `false`는 전역 플래그가 `true`여도 시스템 메시지를 포함하도록 강제합니다.

**LiteLLM UI 사용** — LiteLLM Admin Dashboard에서 가드레일을 **생성**하거나 **편집**할 때 **Skip system messages in guardrail**을 설정합니다(생성 시 Basic Info 아래, 또는 편집/가드레일 설정 흐름).


| UI 옵션                             | 효과                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| **Use global default**                | 프록시 설정의 `litellm_settings.skip_system_message_in_guardrail`을 사용합니다.        |
| **Yes — 가드레일 스캔에서 제외** | 가드레일별 `skip_system_message_in_guardrail: true`를 설정합니다.                            |
| **No — 항상 스캔에 포함**       | 가드레일별 `skip_system_message_in_guardrail: false`를 설정합니다(전역 skip을 재정의). |


<Image
  img={require('../../../img/skip_system_message_guardrail_ui.png')}
  alt="가드레일 생성: 전역 기본값 사용, 가드레일 스캔에서 제외, 항상 스캔에 포함 옵션이 있는 시스템 메시지 건너뛰기 드롭다운"
  style={{ width: '100%', maxWidth: '900px', height: 'auto' }}
/>

**적용되는 위치:** **OpenAI Chat Completions**(`/v1/chat/completions`)와 **Anthropic Messages**(`/v1/messages`)에서 **통합** 가드레일 경로(`apply_guardrail`을 구현하고 LiteLLM의 메시지 변환 계층을 통과하는 공급자)에만 적용됩니다. 예로 Presidio, Bedrock guardrails, `litellm_content_filter`, OpenAI Moderation, Generic Guardrail API, `apply_guardrail`을 정의하는 custom code guardrails가 있습니다.

**적용되지 않는 위치:** 원시 요청에 대한 직접 hook으로만 실행되는 가드레일(예: Lakera v2, Aporia, DynamoAI, Javelin, Lasso, Pangea, Model Armor, Azure Content Safety hooks, Guardrails AI, AIM, tool permission, MCP security)에는 적용되지 않습니다. 다른 엔드포인트가 동일한 변환 계층을 사용하기 전까지는 다른 경로(예: Responses API, embeddings, speech)에도 적용되지 않습니다.

### Load Balancing 가드레일

가드레일 요청을 여러 계정 또는 리전에 분산해야 하나요? 자세한 내용은 [가드레일 로드 밸런싱](./guardrail_load_balancing.md)을 참고하세요.

- 여러 AWS Bedrock 계정 간 로드 밸런싱(속도 제한 관리에 유용)
- 가드레일 인스턴스 간 가중치 기반 분산
- 멀티 리전 가드레일 배포

## 2. LiteLLM Gateway 시작

```shell
litellm --config config.yaml --detailed_debug
```

## 3. 요청 테스트

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**



요청의 `ishaan@berri.ai`가 PII이므로 실패할 것으로 예상됩니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

실패 시 예상 응답

```shell
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "aporia_ai_response": {
        "action": "block",
        "revised_prompt": null,
        "revised_response": "Aporia detected and blocked PII",
        "explain_log": null
      }
    },
    "type": "None",
    "param": "None",
    "code": "400"
  }
}

```





```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```





## **Default On 가드레일**

모든 요청에서 가드레일을 실행하려면 가드레일 설정에 `default_on: true`를 지정합니다. 사용자가 매번 지정하지 않아도 모든 요청에서 가드레일을 실행하고 싶을 때 유용합니다.

**참고:** 사용자가 다른 가드레일을 지정하거나 빈 guardrails 배열을 지정해도 실행됩니다.

```yaml
guardrails:
  - guardrail_name: "aporia-pre-guard"
    litellm_params:
      guardrail: aporia
      mode: "pre_call"
      default_on: true
```

**테스트 요청**

이 요청에서는 `default_on: true`가 설정되어 있으므로 `aporia-pre-guard` 가드레일이 모든 요청에서 실행됩니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ]
  }'
```

**예상 응답**

응답 헤더에는 적용된 가드레일을 나타내는 `x-litellm-applied-guardrails`가 포함됩니다.

```
x-litellm-applied-guardrails: aporia-pre-guard
```

### Guardrail Policies

더 세밀한 제어가 필요하면 [Guardrail Policies](./guardrail_policies.md)를 사용하세요.

- 가드레일을 재사용 가능한 정책으로 그룹화
- 특정 팀, 키 또는 모델에 대해 가드레일 활성화/비활성화
- 기존 정책을 상속하고 특정 가드레일 재정의

## **클라이언트 측에서 가드레일 사용**

### 직접 테스트 **(OSS)**

테스트하려면 요청 본문에 `guardrails`를 전달합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

### 사용자에게 노출 **(엔터프라이즈)**

다음 간단한 흐름에 따라 가드레일을 구현하고 조정합니다.

### 1. 사용 가능한 가드레일 보기

먼저 사용할 수 있는 가드레일과 해당 파라미터를 확인합니다.

`/guardrails/list`를 호출하면 사용 가능한 가드레일과 가드레일 정보(지원 파라미터, 설명 등)를 볼 수 있습니다.

```shell
curl -X GET 'http://0.0.0.0:4000/guardrails/list'
```

예상 응답

```json
{
    "guardrails": [
        {
        "guardrail_name": "aporia-post-guard",
        "guardrail_info": {
            "params": [
            {
                "name": "toxicity_score",
                "type": "float",
                "description": "Score between 0-1 indicating content toxicity level"
            },
            {
                "name": "pii_detection",
                "type": "boolean"
            }
            ]
        }
        }
    ]
}
```



이 설정은 위의 `/guardrails/list` 응답을 반환합니다. `guardrail_info` 필드는 선택 사항이며, 가드레일 사용자를 위해 info 아래에 원하는 필드를 추가할 수 있습니다.



```yaml
- guardrail_name: "aporia-post-guard"
    litellm_params:
      guardrail: aporia  # supported values: "aporia", "lakera"
      mode: "post_call"
      api_key: os.environ/APORIA_API_KEY_2
      api_base: os.environ/APORIA_API_BASE_2
    guardrail_info: # Optional field, info is returned on GET /guardrails/list
      # you can enter any fields under info for consumers of your guardrail
      params:
        - name: "toxicity_score"
          type: "float"
          description: "Score between 0-1 indicating content toxicity level"
        - name: "pii_detection"
          type: "boolean"
```

### 2. 가드레일 적용

선택한 가드레일을 chat completion 요청에 추가합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "your message"}],
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

### 3. Mock LLM 응답으로 테스트

LLM 호출 없이 가드레일을 테스트하려면 `mock_response`를 전송합니다. `mock_response`에 대한 자세한 내용은 [여기](../../completion/mock_requests)를 참고하세요.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "mock_response": "This is a mock response",
    "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
  }'
```

### 4. ✨ 가드레일에 동적 파라미터 전달

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 체험 시작](https://www.litellm.ai/enterprise#trial)

:::

가드레일 API 호출에 추가 파라미터를 전달할 때 사용합니다. 예를 들어 success threshold 같은 값을 보낼 수 있습니다. **자세한 내용은 아래 `guardrails` 스펙을 참고하세요.**





가드레일에 추가 파라미터를 전달하려면 `guardrails={"aporia-pre-guard": {"extra_body": {"success_threshold": 0.9}}}`를 설정합니다.

이 예제에서는 `success_threshold=0.9`가 `aporia-pre-guard` 가드레일 요청 본문으로 전달됩니다.

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
      "guardrails": {
        "aporia-pre-guard": {
          "extra_body": {
            "success_threshold": 0.9
          }
        }
      }
    }

)

print(response)
```





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
    "guardrails": {
      "aporia-pre-guard": {
        "extra_body": {
          "success_threshold": 0.9
        }
      }
    }
}'
```





## **Proxy 관리자 제어**

### 가드레일 모니터링

어떤 가드레일이 실행되었고 통과/실패했는지 모니터링합니다. 예를 들어 의도하지 않은 요청 실패를 일으키는 가드레일을 찾을 때 유용합니다.

:::

#### 설정

1. LiteLLM을 [지원되는 로깅 공급자](../logging)에 연결합니다.
2. `guardrails` 파라미터가 포함된 요청을 보냅니다.
3. 로깅 공급자에서 가드레일 trace를 확인합니다.

#### 추적된 가드레일 성공

<Image img={require('../../../img/gd_success.png')} />

#### 추적된 가드레일 실패

<Image img={require('../../../img/gd_fail.png')} />

### ✨ API 키별 가드레일 제어

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 체험 시작](https://www.litellm.ai/enterprise#trial)

:::

API 키별로 어떤 가드레일을 실행할지 제어할 때 사용합니다. 이 튜토리얼에서는 1개의 API 키에 대해 다음 가드레일만 실행되도록 설정합니다.

- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**1단계** 가드레일 설정이 포함된 키 생성



```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
    }'
```



```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
}'
```



**2단계** 새 키로 테스트

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-jNm1Zar7XfNdZXp49Z1kSQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "my email is ishaan@berri.ai"
        }
    ]
}'
```

### ✨ 태그 기반 가드레일 모드 {#-tag-based-guardrail-modes}

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 체험 시작](https://www.litellm.ai/enterprise#trial)

:::

user-agent 헤더를 기준으로 가드레일을 실행합니다. OpenWebUI에서는 pre-call 검사를 실행하고 Claude CLI에서는 로그 마스킹만 수행하려는 경우에 유용합니다.

`default`와 태그 값은 모두 단일 모드 문자열 또는 모드 목록이 될 수 있습니다.



```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect" # 👈 Guardrail AI guard name
      mode:
        tags:
            "User-Agent: claude-cli": "logging_only"                 # Claude CLI - only mask in logs
        default: "pre_call"               # Default mode when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE # 👈 Guardrails AI API Base. Defaults to "http://0.0.0.0:8000"
      default_on: true # run on every request
```



```yaml
Per guardrailmodel_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect"
      mode:
        tags:
            "User-Agent: claude-cli": "logging_only"
        default: ["pre_call", "post_call"]  # Run on both pre and post call when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE
      default_on: true
```



```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "guardrails_ai-guard"
    litellm_params:
      guardrail: guardrails_ai
      guard_name: "pii_detect"
      mode:
        tags:
            "User-Agent: claude-cli": ["pre_call", "post_call"]  # Run both pre and post call for claude-cli
        default: "logging_only"  # Default to logging only when no tags match
      api_base: os.environ/GUARDRAILS_AI_API_BASE
      default_on: true
```



### ✨ Model-level 가드레일 {#model-level-guardrails}

:::info

✨ This is an 엔터프라이즈 only feature [Get a free trial](https://www.litellm.ai/enterprise#trial)

:::

온프레미스 모델과 호스팅 모델을 함께 사용하면서 호스팅 모델로 PII가 전송되는 것만 막고 싶을 때 유용합니다.

```yaml
model_list:
  - model_name: claude-sonnet-4
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
      api_base: https://api.anthropic.com/v1
      guardrails: ["azure-text-moderation"]
  - model_name: openai-gpt-4o
    litellm_params:
      model: openai/gpt-4o

guardrails:
  - guardrail_name: "presidio-pii"
    litellm_params:
      guardrail: presidio  # supported values: "aporia", "bedrock", "lakera", "presidio"
      mode: "pre_call"
      presidio_language: "en"  # optional: set default language for PII analysis
      pii_entities_config:
        PERSON: "BLOCK"  # Will mask credit card numbers
  - guardrail_name: azure-text-moderation
    litellm_params:
      guardrail: azure/text_moderations
      mode: "post_call" 
      api_key: os.environ/AZURE_GUARDRAIL_API_KEY
      api_base: os.environ/AZURE_GUARDRAIL_API_BASE 
```

### ✨ 팀의 가드레일 켜기/끄기 비활성화

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 체험 시작](https://www.litellm.ai/enterprise#trial)

:::

#### 1. 팀의 가드레일 수정 비활성화

```bash
curl -X POST 'http://0.0.0.0:4000/team/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "4198d93c-d375-4c83-8d5a-71e7c5473e50",
    "metadata": {"guardrails": {"modify_guardrails": false}}
}'
```

#### 2. 호출에서 가드레일 비활성화 시도

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
--data '{
"model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Think of 10 random colors."
      }
    ],
    "metadata": {"guardrails": {"hide_secrets": false}}
}'
```

#### 3. 403 오류 확인

```
{
    "error": {
        "message": {
            "error": "Your team does not have permission to modify guardrails."
        },
        "type": "auth_error",
        "param": "None",
        "code": 403
    }
}
```

callback의 서버 로그에서 `+1 412-612-9992`가 보이지 않아야 합니다.

:::info
해당 API 키에 `"permissions": {"pii_masking": true}`가 있으므로 이 요청에서 `pii_masking` 가드레일이 실행되었습니다.
:::

## 스펙

### YAML의 `guardrails` 설정

```yaml
guardrails:
  - guardrail_name: string     # Required: Name of the guardrail
    litellm_params:            # Required: Configuration parameters
      guardrail: string        # Required: One of "aporia", "bedrock", "guardrails_ai", "lakera", "presidio", "hide-secrets"
      mode: Union[string, List[string], Mode]             # Required: One or more of "pre_call", "post_call", "during_call", "logging_only"
      api_key: string          # Required: API key for the guardrail service
      api_base: string         # Optional: Base URL for the guardrail service
      default_on: boolean      # Optional: Default False. When set to True, will run on every request, does not need client to specify guardrail in request
    guardrail_info:            # Optional[Dict]: Additional information about the guardrail
      
```

Mode 스펙

`default`와 태그 값은 모두 단일 문자열 또는 문자열 목록을 허용합니다.

```python
from litellm.types.guardrails import Mode

# Single default mode
mode = Mode(
    tags={"User-Agent: claude-cli": "logging_only"},
    default="logging_only"
)

# Multiple default modes
mode = Mode(
    tags={"User-Agent: claude-cli": "logging_only"},
    default=["pre_call", "post_call"]
)

# Multiple modes on a tag value
mode = Mode(
    tags={"User-Agent: claude-cli": ["pre_call", "post_call"]},
    default="logging_only"
)
```

### `guardrails` 요청 파라미터

`guardrails` 파라미터는 모든 LiteLLM Proxy 엔드포인트(`/chat/completions`, `/completions`, `/embeddings`)에 전달할 수 있습니다.

#### 형식 옵션

1. 단순 목록 형식:

```python
"guardrails": [
    "aporia-pre-guard",
    "aporia-post-guard"
]
```

1. 고급 딕셔너리 형식:

이 형식에서는 딕셔너리 키가 실행하려는 `guardrail_name`입니다.

```python
"guardrails": {
    "aporia-pre-guard": {
        "extra_body": {
            "success_threshold": 0.9,
            "other_param": "value"
        }
    }
}
```

#### Type Definition

```python
guardrails: Union[
    List[str],                              # Simple list of guardrail names
    Dict[str, DynamicGuardrailParams]       # Advanced configuration
]

class DynamicGuardrailParams:
    extra_body: Dict[str, Any]              # Additional parameters for the guardrail
```
