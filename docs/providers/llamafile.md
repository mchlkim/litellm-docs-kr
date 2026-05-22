import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Llamafile

LiteLLM은 Llamafile의 모든 모델을 지원합니다.

| 속성                      | 세부 정보                                                                                                                            |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| 설명                      | llamafile을 사용하면 단일 파일로 LLM을 배포하고 실행할 수 있습니다. [문서](https://github.com/Mozilla-Ocho/llamafile/blob/main/README.md) |
| LiteLLM의 Provider Route  | `llamafile/` (OpenAI compatible server용)                                                                                            |
| Provider 문서             | [llamafile ↗](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints)                          |
| 지원 엔드포인트       | `/chat/completions`, `/embeddings`, `/completions`                                                                                   |


# 빠른 시작

## 사용법 - litellm.completion (OpenAI compatible endpoint 호출) {#usage---litellmcompletion-calling-openai-compatible-endpoint}
llamafile은 chat completions용 OpenAI compatible endpoint를 제공합니다. LiteLLM으로 호출하는 방법은 다음과 같습니다.

litellm으로 llamafile을 호출하려면 completion 호출에 다음을 추가하세요.

* `model="llamafile/<your-llamafile-model-name>"` 
* `api_base = "your-hosted-llamafile"`

```python
import litellm 

response = litellm.completion(
            model="llamafile/mistralai/mistral-7b-instruct-v0.2", # pass the llamafile model name for completeness
            messages=messages,
            api_base="http://localhost:8080/v1",
            temperature=0.2,
            max_tokens=80)

print(response)
```


## 사용법 -  LiteLLM Proxy Server (OpenAI compatible endpoint 호출) {#usage---litellm-proxy-server-calling-openai-compatible-endpoint}

LiteLLM Proxy Server로 OpenAI-Compatible Endpoint를 호출하는 방법은 다음과 같습니다.

1. config.yaml 수정 

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: llamafile/mistralai/mistral-7b-instruct-v0.2 # add llamafile/ prefix to route as OpenAI provider
        api_base: http://localhost:8080/v1 # add api base for OpenAI compatible provider
  ```

1. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

1. LiteLLM Proxy Server로 요청 전송

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-1234", # pass litellm proxy key, if you're using virtual keys
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


## 임베딩 {#embeddings}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding   
import os

os.environ["LLAMAFILE_API_BASE"] = "http://localhost:8080/v1"


embedding = embedding(model="llamafile/sentence-transformers/all-MiniLM-L6-v2", input=["Hello world"])

print(embedding)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: llamafile/sentence-transformers/all-MiniLM-L6-v2 # add llamafile/ prefix to route as OpenAI provider
        api_base: http://localhost:8080/v1 # add api base for OpenAI compatible provider
```

1. 프록시 시작 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

1. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"input": ["hello world"], "model": "my-model"}'
```

[OpenAI SDK/Langchain 등 예시 보기](../proxy/user_keys.md#embeddings)

</TabItem>
</Tabs>
