import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Humanloop

[Humanloop](https://humanloop.com/docs/v5/getting-started/overview)은 평가, 프롬프트 관리, 관측성을 위한 우수한 도구를 사용해 제품 팀이 LLM 기반 AI 기능을 안정적으로 구축하도록 지원합니다.


## 시작하기

Humanloop을 사용하면 모든 LiteLLM Provider 전반에서 프롬프트를 관리할 수 있습니다.



<Tabs>

<TabItem value="sdk" label="SDK">

```python
import os 
import litellm

os.environ["HUMANLOOP_API_KEY"] = "" # [OPTIONAL] set here or in `.completion`

litellm.set_verbose = True # see raw request to provider

resp = litellm.completion(
    model="humanloop/gpt-3.5-turbo",
    prompt_id="test-chat-prompt",
    prompt_variables={"user_message": "this is used"}, # [OPTIONAL]
    messages=[{"role": "user", "content": "<IGNORED>"}],
    # humanloop_api_key="..." ## alternative to setting env var
)
```



</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: humanloop/gpt-3.5-turbo
      prompt_id: "<humanloop_prompt_id>"
      api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config config.yaml --detailed_debug
```

3. 테스트합니다.

<Tabs>
<TabItem value="curl" label="CURL">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "user",
            "content": "THIS WILL BE IGNORED"
        }
    ],
    "prompt_variables": {
        "key": "this is used"
    }
}'
```
</TabItem>
<TabItem value="OpenAI Python SDK" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "prompt_variables": { # [OPTIONAL]
            "key": "this is used"
        }
    }
)

print(response)
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>


**Expected 로그:**

```
POST Request Sent from LiteLLM:
curl -X POST \
https://api.openai.com/v1/ \
-d '{'model': 'gpt-3.5-turbo', 'messages': <YOUR HUMANLOOP PROMPT TEMPLATE>}'
```

## 모델 설정 방법


## 모델 설정 방법 

### LiteLLM에서 모델 설정하기 

`humanloop/<litellm_model_name>` 형식을 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
litellm.completion(
    model="humanloop/gpt-3.5-turbo", # or `humanloop/anthropic/claude-3-5-sonnet`
    ...
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: humanloop/gpt-3.5-turbo # OR humanloop/anthropic/claude-3-5-sonnet
      prompt_id: <humanloop_prompt_id>
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

### Humanloop에서 모델 설정하기

LiteLLM은 프롬프트 템플릿을 가져오기 위해 Humanloop의 `https://api.humanloop.com/v5/prompts/<your-prompt-id>` 엔드포인트를 호출합니다.

이 호출은 Humanloop에 설정된 템플릿 모델도 함께 반환합니다.

```bash
{
  "template": [
    {
      ... # your prompt template
    }
  ],
  "model": "gpt-3.5-turbo" # your template model
}
```
