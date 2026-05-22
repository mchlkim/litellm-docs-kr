import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cerebras
https://inference-docs.cerebras.ai/api-reference/chat-completions

:::tip

**모든 Cerebras 모델을 지원합니다. litellm 요청을 보낼 때 `model=cerebras/<any-model-on-cerebras>`를 prefix로 설정하기만 하면 됩니다.**

:::

## API 키 {#api-key}
```python
# env variable
os.environ['CEREBRAS_API_KEY']
```

## Sample 사용법
```python
from litellm import completion
import os

os.environ['CEREBRAS_API_KEY'] = ""
response = completion(
    model="cerebras/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit? (Write in JSON)",
        }
    ],
    max_tokens=10,
        
    # The prompt should include JSON if 'json_object' is selected; otherwise, you will get error code 400.
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## Sample 사용법 - Streaming
```python
from litellm import completion
import os

os.environ['CEREBRAS_API_KEY'] = ""
response = completion(
    model="cerebras/llama3-70b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit? (Write in JSON)",
        }
    ],
    stream=True,
    max_tokens=10,

    # The prompt should include JSON if 'json_object' is selected; otherwise, you will get error code 400.
    response_format={ "type": "json_object" }, 
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```


## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 Cerebras 모델을 호출하는 방법은 다음과 같습니다.

1. config.yaml 수정 

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: cerebras/<your-model-name>  # add cerebras/ prefix to route as Cerebras provider
        api_key: api-key                 # api key to send your model
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server에 요청 보내기

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "what llm are you"
          }
      ],
  )

  print(response)
  ```
  </TabItem>

  <TabItem value="curl" label="curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>

