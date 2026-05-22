import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM Gateway에서 Aporia 가드레일 사용하기 {#aporia-guardrails-with-litellm-gateway}

이 튜토리얼에서는 LiteLLM AI Gateway와 Aporia를 함께 사용하여 요청의 PII와 응답의 비속어를 감지합니다.

## 1. Aporia에서 가드레일 설정하기 {#1-setup-guardrails-on-aporia}

### Aporia 프로젝트 만들기 {#create-aporia-projects}

[Aporia](https://guardrails.aporia.com/)에서 프로젝트 2개를 만듭니다.

1. Pre LLM API Call - LLM API 호출 전에 실행할 정책을 모두 설정합니다.
2. Post LLM API Call - LLM API 호출 후에 실행할 정책을 모두 설정합니다.


<Image img={require('../../img/aporia_projs.png')} />


### Pre-Call: PII 감지 {#pre-call-detect-pii}

Pre LLM API Call 프로젝트에 `PII - Prompt`를 추가합니다.

<Image img={require('../../img/aporia_pre.png')} />

### Post-Call: 응답의 비속어 감지 {#post-call-detect-profanity-in-responses}

Post LLM API Call 프로젝트에 `Toxicity - Response`를 추가합니다.

<Image img={require('../../img/aporia_post.png')} />


## 2. LiteLLM config.yaml에서 가드레일 정의하기 {#2-define-guardrails-on-your-litellm-configyaml}

- `guardrails` 섹션 아래에 가드레일을 정의하고 `pre_call_guardrails` 및 `post_call_guardrails`를 설정합니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

guardrails:
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
```

### `mode`에 지원되는 값 {#supported-values-for-mode}

- `pre_call`: LLM 호출 **전**에 **입력**에 대해 실행합니다.
- `post_call`: LLM 호출 **후**에 **입력 및 출력**에 대해 실행합니다.
- `during_call`: LLM 호출 **중**에 **입력**에 대해 실행합니다. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답이 반환되지 않습니다.

## 3. LiteLLM Gateway 시작하기 {#3-start-litellm-gateway}


```shell
litellm --config config.yaml --detailed_debug
```

## 4. 요청 테스트하기 {#4-test-request}

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="Unsuccessful call" value = "not-allowed">

요청에 포함된 `ishaan@berri.ai`가 PII이므로 실패해야 합니다.

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

실패 시 예상 응답은 다음과 같습니다.

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

</TabItem>

<TabItem label="Successful Call " value = "allowed">

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

</TabItem>


</Tabs>

## 5. 프로젝트(API Key)별 가드레일 제어하기 {#5-control-guardrails-per-project-api-key}

프로젝트별로 어떤 가드레일을 실행할지 제어할 때 사용합니다. 이 튜토리얼에서는 프로젝트(API Key) 1개에 대해 다음 가드레일만 실행하려고 합니다.
- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**1단계** 가드레일 설정이 포함된 Key 만들기

<Tabs>
<TabItem value="/key/generate" label="/key/generate">

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
        }
    }'
```

</TabItem>
<TabItem value="/key/update" label="/key/update">

```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "guardrails": ["aporia-pre-guard", "aporia-post-guard"]
        }
}'
```

</TabItem>
</Tabs>

**2단계** 새 Key로 테스트하기

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


