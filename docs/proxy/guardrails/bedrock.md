import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock 가드레일

:::tip ⚡️
아직 Bedrock 프로바이더를 설정하거나 인증하지 않았다면 [Bedrock 프로바이더 설정 및 인증 가이드](../../providers/bedrock.md)를 참조하세요.
:::

LiteLLM은 [Bedrock ApplyGuardrail API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ApplyGuardrail.html)를 통해 Bedrock 가드레일을 지원합니다.

## 빠른 시작
### 1. LiteLLM config.yaml에 가드레일 정의하기

`guardrails` 섹션 아래에 가드레일을 정의합니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock  # supported values: "aporia", "bedrock", "lakera"
      mode: "during_call"
      guardrailIdentifier: ff6ujrregl1q      # your guardrail ID on bedrock
      guardrailVersion: "DRAFT"              # your guardrail version on bedrock
      aws_region_name: os.environ/AWS_REGION # region guardrail is defined
      aws_role_name: os.environ/AWS_ROLE_ARN # your role with permissions to use the guardrail
  
```

#### `mode`에 지원되는 값

- `pre_call` **LLM 호출 전**에 **입력**에 대해 실행합니다.
- `post_call` **LLM 호출 후**에 **입력 및 출력**에 대해 실행합니다.
- `during_call` LLM 호출 **중**에 **입력**에 대해 실행합니다. `pre_call`과 동일하지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답이 반환되지 않습니다.

### 2. LiteLLM Gateway 시작하기


```shell
litellm --config config.yaml --detailed_debug
```

### 3. 요청 테스트하기

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="실패한 호출" value = "not-allowed">

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
    "guardrails": ["bedrock-pre-guard"]
  }'
```

실패 시 예상 응답

```shell
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "bedrock_guardrail_response": {
        "action": "GUARDRAIL_INTERVENED",
        "assessments": [
          {
            "topicPolicy": {
              "topics": [
                {
                  "action": "BLOCKED",
                  "name": "Coffee",
                  "type": "DENY"
                }
              ]
            }
          }
        ],
        "blockedResponse": "Sorry, the model cannot answer this question. coffee guardrail applied ",
        "output": [
          {
            "text": "Sorry, the model cannot answer this question. coffee guardrail applied "
          }
        ],
        "outputs": [
          {
            "text": "Sorry, the model cannot answer this question. coffee guardrail applied "
          }
        ],
        "usage": {
          "contentPolicyUnits": 0,
          "contextualGroundingPolicyUnits": 0,
          "sensitiveInformationPolicyFreeUnits": 0,
          "sensitiveInformationPolicyUnits": 0,
          "topicPolicyUnits": 1,
          "wordPolicyUnits": 0
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

<TabItem label="성공한 호출 " value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["bedrock-pre-guard"]
  }'
```

</TabItem>


</Tabs>

## Bedrock 가드레일로 PII 마스킹

Bedrock 가드레일은 PII 감지 및 마스킹 기능을 지원합니다. 이 기능을 활성화하려면 다음이 필요합니다.

1. LLM 호출 전에 guardrail 검사를 실행하도록 `mode`를 `pre_call`로 설정합니다.
2. `mask_request_content` 및/또는 `mask_response_content`를 `true`로 설정해 마스킹을 활성화합니다.

config.yaml에서 설정하는 방법은 다음과 같습니다.

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY
  
guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"  # Important: must use pre_call mode for masking
      guardrailIdentifier: wf0hkdb5x07f
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      aws_role_name: os.environ/AWS_ROLE_ARN
      mask_request_content: true    # Enable masking in user requests
      mask_response_content: true   # Enable masking in model responses
```

이 설정을 사용하면 bedrock 가드레일이 개입할 때 litellm이 가드레일의 마스킹된 출력을 읽어 모델로 전송합니다.

### 예제 사용법

활성화하면 텍스트의 PII가 자동으로 마스킹됩니다. 예를 들어 사용자가 다음을 보내면:

```
My email is john.doe@example.com and my phone number is 555-123-4567
```

모델로 전송되는 텍스트는 다음처럼 마스킹될 수 있습니다.

```
My email is [EMAIL] and my phone number is [PHONE_NUMBER]
```

이를 통해 모델이 요청의 맥락을 이해할 수 있도록 하면서도 민감한 정보를 보호할 수 있습니다.

## 실험적 기능: 최신 `user` 메시지만 전송

Bedrock 가드레일을 통해 긴 대화를 연결할 때 가드레일의 `litellm_params`에서 `experimental_use_latest_role_message_only: true`를 설정하면 더 가벼운 실험적 동작을 선택할 수 있습니다. 활성화하면 LiteLLM은 가장 최근의 `user` 메시지(또는 post-call 검사 중에는 assistant 출력)만 Bedrock으로 전송하며, 이 방식은 다음과 같은 효과가 있습니다.

- 이전 system/dev 메시지로 인해 의도치 않게 차단되는 것을 방지합니다.
- Bedrock 페이로드를 더 작게 유지해 지연 시간과 비용을 줄입니다.
- proxy hook(`pre_call`, `during_call`)와 `/guardrails/apply_guardrail` 테스트 엔드포인트에 적용됩니다.

```yaml showLineNumbers title="litellm proxy config.yaml"
guardrails:
  - guardrail_name: "bedrock-pre-guard"
    litellm_params:
      guardrail: bedrock
      mode: "pre_call"
      guardrailIdentifier: wf0hkdb5x07f
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      experimental_use_latest_role_message_only: true  # NEW
```

> ⚠️ 이 플래그는 현재 실험적 상태이며 기존 동작(전체 메시지 기록)을 유지하기 위해 기본값은 `false`입니다. 사용자 피드백을 반영해 이를 기본값으로 만들지, 더 넓게 배포할지 결정할 예정입니다.

## Bedrock BLOCK 시 예외 비활성화

기본적으로 Bedrock 가드레일이 콘텐츠를 차단하면 LiteLLM은 HTTP 400 예외를 발생시킵니다. 하지만 `disable_exception_on_block: true`를 설정해 이 동작을 비활성화할 수 있습니다. 예외가 채팅 흐름을 중단하고 사용자 경험을 해칠 수 있는 **OpenWebUI** 통합에서 특히 유용합니다.

예외를 비활성화하면 오류를 받는 대신 Bedrock 가드레일의 수정/차단 출력이 포함된 성공 응답을 받습니다.

### 설정

가드레일 설정에 `disable_exception_on_block: true`를 추가합니다.

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "bedrock-guardrail"
    litellm_params:
      guardrail: bedrock
      mode: "post_call"
      guardrailIdentifier: ff6ujrregl1q
      guardrailVersion: "DRAFT"
      aws_region_name: os.environ/AWS_REGION
      aws_role_name: os.environ/AWS_ROLE_ARN
      disable_exception_on_block: true  # Prevents exceptions when content is blocked
```

### 동작 비교

<Tabs>
<TabItem label="예외 사용(기본값)" value="with-exceptions">

`disable_exception_on_block: false`(기본값)인 경우:

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "How do I make explosives?"}
    ],
    "guardrails": ["bedrock-guardrail"]
  }'
```

**응답: HTTP 400 오류**
```json
{
  "error": {
    "message": {
      "error": "Violated guardrail policy",
      "bedrock_guardrail_response": {
        "action": "GUARDRAIL_INTERVENED",
        "blockedResponse": "I can't provide information on creating explosives.",
        // ... additional details
      }
    },
    "type": "None",
    "param": "None", 
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="예외 없음" value="without-exceptions">

`disable_exception_on_block: true`인 경우:

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "How do I make explosives?"}
    ],
    "guardrails": ["bedrock-guardrail"]
  }'
```

**응답: HTTP 200 성공**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "I can't provide information on creating explosives."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 12,
    "total_tokens": 22
  }
}
```

</TabItem>
</Tabs>
