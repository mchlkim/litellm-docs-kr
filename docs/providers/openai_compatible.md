import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI 호환 엔드포인트 {#openai-compatible-endpoints}

:::info

provider로 `openai`를 선택하면 upstream  
[공식 OpenAI Python API 라이브러리](https://github.com/openai/openai-python/blob/main/README.md)를 사용해 요청을 OpenAI 호환 엔드포인트로 라우팅합니다.

이 라이브러리는 모든 요청에 대해 `api_key` 파라미터 또는 `OPENAI_API_KEY` environment variable을 통한 API 키가 **필수**입니다.

각 요청마다 더미 API 키를 제공하고 싶지 않다면 [`hosted_vllm`](/litellm-docs-kr/docs/providers/vllm) 또는 [`llamafile`](/litellm-docs-kr/docs/providers/llamafile)처럼 OpenAI 호환 엔드포인트와 직접 맞는 provider를 사용하는 방식을 고려하세요.

:::

openai proxy 뒤에 호스팅된 모델을 호출하려면 다음 변경을 적용하세요.

1. `/chat/completions`: model name 앞에 `openai/`를 붙여 litellm이 openai `/chat/completions` endpoint 호출임을 알 수 있게 합니다.

1. `/completions`: model name 앞에 `text-completion-openai/`를 붙여 litellm이 openai `/completions` endpoint 호출임을 알 수 있게 합니다. [`/v1/completions` route를 통해 호출되는 `openai/` endpoint에는 필요하지 않습니다].

1. base url에 `/v1/embedding` 같은 항목을 추가하지 **마세요**. LiteLLM은 이 호출에 openai-client를 사용하며, 관련 endpoint는 client가 자동으로 추가합니다.


## 사용법 - completion
```python
import litellm
import os

response = litellm.completion(
    model="openai/mistral",               # add `openai/` prefix to model so litellm knows to route to OpenAI
    api_key="sk-1234",                  # api key to your openai compatible endpoint
    api_base="http://0.0.0.0:4000",     # set API Base of your Custom OpenAI Endpoint
    messages=[
                {
                    "role": "user",
                    "content": "Hey, how's it going?",
                }
    ],
)
print(response)
```

## 사용법 - embedding

```python
import litellm
import os

response = litellm.embedding(
    model="openai/GPT-J",               # add `openai/` prefix to model so litellm knows to route to OpenAI
    api_key="sk-1234",                  # api key to your openai compatible endpoint
    api_base="http://0.0.0.0:4000",     # set API Base of your Custom OpenAI Endpoint
    input=["good morning from litellm"]
)
print(response)
```



## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 OpenAI 호환 엔드포인트를 호출하는 방법입니다.

1. config.yaml 수정

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: openai/<your-model-name>  # add openai/ prefix to route as OpenAI provider
        api_base: <model-api-base>       # add api base for OpenAI compatible provider
        api_key: api-key                 # api key to send your model
  ```

  :::info

  테스트 중 `Not Found Error`가 보이면 `api_base`에 `/v1` 접미사가 있는지 확인하세요.

  예제: `http://vllm-endpoint.xyz/v1`

  :::

2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청 전송

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


### 고급 - System Message 비활성화 {#advanced-disable-system-messages}

일부 VLLM model(예: gemma)은 system message를 지원하지 않습니다. 그런 요청을 `user` message로 매핑하려면 `supports_system_message` flag를 사용하세요.

```yaml
model_list:
- model_name: my-custom-model
   litellm_params:
      model: openai/google/gemma
      api_base: http://my-custom-base
      api_key: "" 
      supports_system_message: False # 👈 KEY CHANGE
```
