---
title: v1.56.3
slug: v1.56.3
date: 2024-12-28T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [guardrails, logging, virtual key management, new models]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

`guardrails`, `logging`, `virtual key management`, `new models`

:::info

LiteLLM 엔터프라이즈 7일 무료 체험은 [여기](https://litellm.ai/#trial)에서 시작할 수 있습니다.

**통화는 필요하지 않습니다**

:::

## 새로운 기능 {#new-features}

### ✨ 가드레일 추적 로그 {#log-guardrail-traces}

가드레일 실패율과 가드레일이 오작동하여 요청을 실패시키는지 추적합니다. [여기에서 시작하세요](https://docs.litellm.ai/docs/proxy/guardrails/quick_start)


#### 추적된 가드레일 성공 {#traced-guardrail-success}

<Image img={require('../../img/gd_success.png')} />

#### 추적된 가드레일 실패 {#traced-guardrail-failure}

<Image img={require('../../img/gd_fail.png')} />


### `/guardrails/list` 

`/guardrails/list`를 사용하면 클라이언트가 사용 가능한 가드레일과 지원되는 가드레일 파라미터를 확인할 수 있습니다.


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


### ✨ `Mock LLM`으로 가드레일 테스트 {#guardrails-with-mock-llm}


LLM 호출 없이 가드레일을 테스트하려면 `mock_response`를 전송하세요. `mock_response`에 대한 자세한 정보는 [여기](https://docs.litellm.ai/docs/proxy/guardrails/quick_start)에서 확인할 수 있습니다.

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



### 사용자에게 키 할당 {#assign-keys-to-users}

이제 Proxy UI를 통해 사용자에게 키를 할당할 수 있습니다.


<Image img={require('../../img/ui_key.png')} />

## 새로운 모델 {#new-models}

- `openrouter/openai/o1`
- `vertex_ai/mistral-large@2411`

## 수정 사항 {#fixes}

- `vertex_ai/` mistral 모델 가격 수정: https://github.com/BerriAI/litellm/pull/7345
- aspeech 호출 유형 로그에 누락된 `model_group` 필드 추가 https://github.com/BerriAI/litellm/pull/7392
