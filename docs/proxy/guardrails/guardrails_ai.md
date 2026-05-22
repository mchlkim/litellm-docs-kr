import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Guardrails AI

Guardrails AI([guardrailsai.com](https://www.guardrailsai.com/))를 사용해 LLM 출력에 검사를 추가합니다.

## 사전 준비

- Guardrails AI Server를 설정합니다. [빠른 시작](https://www.guardrailsai.com/docs/getting_started/guardrails_server)

## 사용법

1. config.yaml 설정

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
      guard_name: "detect-secrets-guard"            # 👈 Guardrail AI guard name
      mode: "pre_call"
      guardrails_ai_api_input_format: "llmOutput"   # 👈 This is the only option that currently works (and it is a default), use it for both pre_call and post_call hooks
      api_base: os.environ/GUARDRAILS_AI_API_BASE   # 👈 Guardrails AI API Base. Defaults to "http://0.0.0.0:8000"
```

2. LiteLLM Gateway 시작

```shell
litellm --config config.yaml --detailed_debug
```

3. 요청 테스트

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-npnwjPQciVRok5yNZgKmFQ" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan@berri.ai"}
    ],
    "guardrails": ["guardrails_ai-guard"]
  }'
```


## ✨ 프로젝트별 가드레일 제어(API Key)

:::info

✨ 엔터프라이즈 전용 기능입니다. [무료 체험판을 받으려면 문의하세요](https://enterprise.litellm.ai/demo)

:::

프로젝트별로 실행할 가드레일을 제어할 때 사용합니다. 이 튜토리얼에서는 하나의 프로젝트(API Key)에 대해 다음 가드레일만 실행되도록 설정합니다.
- `guardrails`: ["aporia-pre-guard", "aporia-post-guard"]

**1단계** 가드레일 설정이 포함된 Key 생성

<Tabs>
<TabItem value="/key/generate" label="/key/generate">

```shell
curl -X POST 'http://0.0.0.0:4000/key/generate' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{
            "guardrails": ["guardrails_ai-guard"]
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
        "guardrails": ["guardrails_ai-guard"]
        }
}'
```

</TabItem>
</Tabs>

**2단계** 새 key로 테스트

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


