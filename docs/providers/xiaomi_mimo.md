import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Xiaomi MiMo
https://platform.xiaomimimo.com/#/docs

:::tip

**모든 Xiaomi MiMo 모델을 지원합니다. litellm 요청을 보낼 때 `model=xiaomi_mimo/<any-model-on-xiaomi-mimo>` 접두사만 설정하면 됩니다.**

:::

## API 키
```python
# env variable
os.environ['XIAOMI_MIMO_API_KEY']
```

## 샘플 사용법
```python
from litellm import completion
import os

os.environ['XIAOMI_MIMO_API_KEY'] = ""
response = completion(
    model="xiaomi_mimo/mimo-v2-flash",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    max_tokens=1024,
    temperature=0.3,
    top_p=0.95,
)
print(response)
```

## 샘플 사용법 - 스트리밍
```python
from litellm import completion
import os

os.environ['XIAOMI_MIMO_API_KEY'] = ""
response = completion(
    model="xiaomi_mimo/mimo-v2-flash",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    max_tokens=1024,
    temperature=0.3,
    top_p=0.95,
)

for chunk in response:
    print(chunk)
```


## LiteLLM Proxy Server 사용법

LiteLLM Proxy Server로 Xiaomi MiMo 모델을 호출하는 방법입니다.

1. config.yaml 수정 

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: xiaomi_mimo/<your-model-name>  # add xiaomi_mimo/ prefix to route as Xiaomi MiMo provider
        api_key: api-key                      # api key to send your model
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청 보내기

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

## 지원 모델

| 모델 이름 | 사용법 |
|------------|-------|
| mimo-v2-flash | `completion(model="xiaomi_mimo/mimo-v2-flash", messages)` |
