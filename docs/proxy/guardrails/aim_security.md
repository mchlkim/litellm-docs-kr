import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Aim Security

## 빠른 시작
### 1. 새 Aim Guard 생성

[Aim Application](https://app.aim.security/inventory/custom-ai-apps)으로 이동해 새 guard를 생성합니다.

프롬프트가 표시되면 API 옵션을 선택하고 guard 이름을 지정합니다.


:::note 
guard를 온프레미스에서 호스팅하려면 guard를 생성하기 전에 [Aim Outpost를 설치](https://app.aim.security/settings/on-prem-deployment)해 이 옵션을 활성화할 수 있습니다.
:::

### 2. Aim Guard 정책 구성

새로 생성한 guard 페이지에서 이 guard의 prompt policy center 참조를 확인할 수 있습니다.

활성화할 탐지를 선택하고 각 탐지의 임계값을 설정할 수 있습니다.

:::info 
LiteLLM을 virtual key와 함께 사용하는 경우 guard를 생성할 때 virtual key alias를 지정해 Aim의 guards 페이지에서 key별 정책을 직접 설정할 수 있습니다.

virtual key의 alias만 Aim으로 전송되며 실제 key secret은 전송되지 않습니다.
:::

### 3. LiteLLM config.yaml에 Aim Guardrail 추가

`guardrails` 섹션 아래에 guardrail을 정의합니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: aim-protected-app
    litellm_params:
      guardrail: aim
      mode: [pre_call, post_call] # "During_call" is also available
      api_key: os.environ/AIM_API_KEY
      api_base: os.environ/AIM_API_BASE # Optional, use only when using a self-hosted Aim Outpost
      ssl_verify: False # Optional, set to False to disable SSL verification or a string path to a custom CA bundle
```

`api_key`에는 발급받은 API key를 입력합니다. 이 key는 guard 페이지에서 확인할 수 있습니다.
`AIM_API_KEY`를 환경 변수로 설정할 수도 있습니다.

기본적으로 `api_base`는 `https://api.aim.security`로 설정됩니다. 자체 호스팅 Aim Outpost를 사용하는 경우 `api_base`를 Outpost URL로 설정할 수 있습니다.

### 4. LiteLLM Gateway 시작
```shell
litellm --config config.yaml
```

### 5. 첫 번째 요청 보내기

:::note
다음 예시는 guard에서 *PII* 탐지를 활성화한 상태를 전제로 합니다.
다른 guard 정책에 맞게 요청 내용을 조정할 수 있습니다.
:::

<Tabs>
<TabItem label="성공적으로 차단된 요청" value = "blocked">

:::note
LiteLLM을 virtual key와 함께 사용하는 경우 virtual key가 포함된 `Authorization` 헤더가 필요합니다.
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```

올바르게 구성되었다면 `ishaan@berri.ai`가 Aim Guard에서 PII로 탐지되므로 `400 Bad Request` 상태 코드와 함께 다음과 비슷한 응답을 받습니다.

```json
{
  "error": {
    "message": "\"ishaan@berri.ai\" detected as email",
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="성공적으로 허용된 요청" value = "allowed">

:::note
LiteLLM을 virtual key와 함께 사용하는 경우 virtual key가 포함된 `Authorization` 헤더가 필요합니다.
:::

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```

위 요청은 차단되지 않아야 하며 일반 LLM 응답을 받아야 합니다. 아래 예시는 간단히 줄인 형태입니다.

```json
{
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "I can’t provide live weather updates without the internet. Let me know if you’d like general weather trends for a location and season instead!",
        "role": "assistant"
      }
    }
  ]
}
```

</TabItem>


</Tabs>

## 고급

Aim Guard는 사용자별 Guardrail 정책을 제공해 개별 사용자에게 맞춤 정책을 적용할 수 있게 합니다.
이 기능을 사용하려면 요청의 `x-aim-user-email` 헤더를 설정해 요청 페이로드에 최종 사용자의 이메일을 포함합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-aim-user-email: ishaan@berri.ai" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi what is the weather"}
    ],
    "guardrails": ["aim-protected-app"]
  }'
```
