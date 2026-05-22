import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nebius AI Studio
https://docs.nebius.com/studio/inference/quickstart

:::tip

**LiteLLM은 Nebius AI Studio의 모든 model을 지원합니다. model을 사용하려면 LiteLLM request에서 `model=nebius/<any-model-on-nebius-ai-studio>` prefix를 설정하세요. 지원 model의 전체 목록은 https://studio.nebius.ai/ 에서 확인할 수 있습니다.**

:::

## API Key
```python
import os
# env variable
os.environ['NEBIUS_API_KEY']
```

## 사용 예시: Text Generation
```python
from litellm import completion
import os

os.environ['NEBIUS_API_KEY'] = "insert-your-nebius-ai-studio-api-key"
response = completion(
    model="nebius/Qwen/Qwen3-235B-A22B",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## 사용 예시 - Streaming
```python
from litellm import completion
import os

os.environ['NEBIUS_API_KEY'] = ""
response = completion(
    model="nebius/Qwen/Qwen3-235B-A22B",
    messages=[
        {
            "role": "user",
            "content": "What character was Wall-e in love with?",
        }
    ],
    stream=True,
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.6,  # either set temperature or `top_p`
    top_p=0.01,  # to get as deterministic results as possible
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```

## 사용 예시 - Embedding
```python
from litellm import embedding
import os

os.environ['NEBIUS_API_KEY'] = ""
response = embedding(
    model="nebius/BAAI/bge-en-icl",
    input=["What character was Wall-e in love with?"],
)
print(response)
```


## LiteLLM Proxy Server 사용법

LiteLLM Proxy Server로 Nebius AI Studio model을 호출하는 방법입니다.

1. config.yaml 수정

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: nebius/<your-model-name>  # add nebius/ prefix to use Nebius AI Studio as provider
        api_key: api-key                 # api key to send your model
  ```
2. 프록시 시작 
  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 request 전송

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="litellm-proxy-key",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "What character was Wall-e in love with?"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: litellm-proxy-key' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "What character was Wall-e in love with?"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>

## 지원 파라미터

Nebius provider는 다음 파라미터를 지원합니다.

### Chat Completion 파라미터

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| frequency_penalty | number | text 내 빈도에 따라 새 token에 penalty를 적용합니다. |
| function_call | string/object | model이 function을 호출하는 방식을 제어합니다. |
| functions | array | model이 JSON input을 생성할 수 있는 function 목록입니다. |
| logit_bias | map | 지정한 token의 likelihood를 수정합니다. |
| max_tokens | integer | 생성할 최대 token 수입니다. |
| n | integer | 생성할 completion 수입니다. |
| presence_penalty | number | 지금까지 text에 등장했는지에 따라 token에 penalty를 적용합니다. |
| response_format | object | response 형식입니다. 예: `{"type": "json"}` |
| seed | integer | 결정적 결과를 위한 sampling seed입니다. |
| stop | string/array | API가 token 생성을 중단할 sequence입니다. |
| stream | boolean | response를 stream할지 여부입니다. |
| temperature | number | 무작위성을 제어합니다(0-2). |
| top_p | number | nucleus sampling을 제어합니다. |
| tool_choice | string/object | 호출할 function이 있는 경우 어떤 function을 호출할지 제어합니다. |
| tools | array | model이 사용할 수 있는 tool 목록입니다. |
| user | string | user identifier입니다. |

### Embedding 파라미터

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| input | string/array | embed할 text입니다. |
| user | string | user identifier입니다. |

## Error Handling

이 integration은 표준 LiteLLM error handling을 사용합니다. 일반적인 error는 다음과 같습니다.

- **인증 Error**: API key를 확인하세요.
- **Model Not Found**: 유효한 model name을 사용 중인지 확인하세요.
- **Rate Limit Error**: rate limit을 초과했습니다.
- **Timeout Error**: request 완료 시간이 너무 오래 걸렸습니다.
