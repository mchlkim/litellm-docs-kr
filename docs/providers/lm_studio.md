import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LM Studio

https://lmstudio.ai/docs/basics/server

:::tip

**모든 LM Studio 모델을 지원합니다. litellm 요청을 보낼 때 `model=lm_studio/<any-model-on-lmstudio>`를 접두사로 설정하기만 하면 됩니다.**

:::


| 속성 | 세부 정보 |
|-------|-------|
| 설명 | 로컬 LLM을 검색, 다운로드, 실행합니다. |
| LiteLLM의 Provider Route | `lm_studio/` |
| Provider 문서 | [LM Studio ↗](https://lmstudio.ai/docs/api/openai-api) |
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/embeddings`, `/completions` |

## API 키 {#api-key}
```python
# env variable
os.environ['LM_STUDIO_API_BASE']
os.environ['LM_STUDIO_API_KEY'] # optional, default is empty
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['LM_STUDIO_API_BASE'] = ""

response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ]
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['LM_STUDIO_API_KEY'] = ""
response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
)

for chunk in response:
    print(chunk)
```


## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 LM Studio 모델을 호출하는 방법은 다음과 같습니다.

1. config.yaml을 수정합니다.

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: lm_studio/<your-model-name>  # add lm_studio/ prefix to route as LM Studio provider
        api_key: api-key                 # api key to send your model
  ```


2. 프록시를 시작합니다.

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청을 보냅니다.

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


## 지원 파라미터

지원되는 파라미터는 [지원 파라미터](../completion/input.md#translated-openai-params)를 참고하세요.

## 임베딩 {#embedding}

```python
from litellm import embedding
import os 

os.environ['LM_STUDIO_API_BASE'] = "http://localhost:8000"
response = embedding(
    model="lm_studio/jina-embeddings-v3",
    input=["Hello world"],
)
print(response)
```


## 구조화된 출력 {#structured-output}

LM Studio는 JSON Schema를 통한 구조화된 출력을 지원합니다. `response_format`으로 pydantic 모델이나 원시 스키마를 전달할 수 있습니다.
LiteLLM은 스키마를 `{ "type": "json_schema", "json_schema": {"schema": <your schema>} }` 형식으로 보냅니다.

```python
from pydantic import BaseModel
from litellm import completion

class Book(BaseModel):
    title: str
    author: str
    year: int

response = completion(
    model="lm_studio/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "Tell me about The Hobbit"}],
    response_format=Book,
)
print(response.choices[0].message.content)
```
