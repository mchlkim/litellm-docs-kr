import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Aporia

[Aporia](https://www.aporia.com/)를 사용해 요청의 PII와 응답의 비속어를 감지합니다.

## 1. Aporia에서 가드레일 설정 {#1-setup-guardrails-on-aporia}

### Aporia 프로젝트 생성 {#create-aporia-projects}

[Aporia](https://guardrails.aporia.com/)에서 프로젝트 2개를 생성합니다.

1. Pre LLM API Call - LLM API 호출 전에 실행하려는 모든 정책을 설정합니다.
2. Post LLM API Call - LLM API 호출 후에 실행하려는 모든 정책을 설정합니다.

<Image img={require('../../../img/aporia_projs.png')} />


### 사전 호출: PII 감지 {#pre-call-detect-pii}

Pre LLM API Call 프로젝트에 `PII - Prompt`를 추가합니다.

<Image img={require('../../../img/aporia_pre.png')} />

### 사후 호출: 응답의 비속어 감지 {#post-call-detect-profanity-in-responses}

Post LLM API Call 프로젝트에 `Toxicity - Response`를 추가합니다.

<Image img={require('../../../img/aporia_post.png')} />


## 2. LiteLLM config.yaml에 가드레일 정의 {#2-define-guardrails-on-your-litellm-configyaml}

- `guardrails` 섹션 아래에 가드레일을 정의합니다.
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

- `pre_call` LLM 호출 **전**에 **입력**에 대해 실행합니다.
- `post_call` LLM 호출 **후**에 **입력 및 출력**에 대해 실행합니다.
- `during_call` LLM 호출 **중**에 **입력**에 대해 실행합니다. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 완료될 때까지 응답은 반환되지 않습니다.

## 3. LiteLLM Gateway 시작 {#3-start-litellm-gateway}


```shell
litellm --config config.yaml --detailed_debug
```

## 4. 요청 테스트 {#4-test-request}

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="실패한 호출" value = "not-allowed">

요청의 `ishaan@berri.ai`가 PII이므로 실패해야 합니다.

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

</TabItem>

<TabItem label="성공한 호출" value = "allowed">

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

## 5. ✨ 프로젝트(API 키)별 가드레일 제어 {#5--control-guardrails-per-project-api-key}

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [무료 평가판을 받으려면 문의하세요](https://enterprise.litellm.ai/demo).

:::

프로젝트별로 실행할 가드레일을 제어할 때 사용합니다. 이 튜토리얼에서는 1개 프로젝트(API 키)에 대해 다음 가드레일만 실행하려고 합니다.
- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**1단계** 가드레일 설정이 포함된 키 생성

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

