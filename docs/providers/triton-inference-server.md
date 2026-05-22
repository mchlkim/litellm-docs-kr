import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Triton Inference Server` {#triton-inference-server}

LiteLLM은 Triton Inference Server에서 임베딩 모델을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | NVIDIA Triton Inference Server |
| LiteLLM의 공급자 라우트 | `triton/` |
| 지원 작업 | `/chat/completion`, `/completion`, `/embedding` |
| 지원되는 Triton 엔드포인트 | `/infer`, `/generate`, `/embeddings` |
| 공급자 문서 링크 | [Triton Inference Server ↗](https://developer.nvidia.com/triton-inference-server) |

## Triton `/generate` - 채팅 완료 {#triton-generate-chat-completion}


<Tabs>
<TabItem value="sdk" label="SDK">

Triton 서버로 라우팅하려면 `triton/` 접두사를 사용하세요.
```python
from litellm import completion
response = completion(
    model="triton/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "who are u?"}],
    max_tokens=10,
    api_base="http://localhost:8000/generate",
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. `config.yaml`에 모델 추가

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/generate
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. LiteLLM Proxy Server로 요청 보내기

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

    ```python
    import openai
    from openai import OpenAI

    # set base_url to your proxy server
    # set api_key to send to proxy server
    client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

    response = client.chat.completions.create(
        model="my-triton-model",
        messages=[{"role": "user", "content": "who are u?"}],
        max_tokens=10,
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header`는 선택 사항이며, 가상 키로 LiteLLM 프록시를 사용할 때만 필요합니다.

    ```shell
    curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data ' {
    "model": "my-triton-model",
    "messages": [{"role": "user", "content": "who are u?"}]
    }'

    ```
  </TabItem>

  </Tabs>

</TabItem>
</Tabs>

## Triton `/infer` - 채팅 완료 {#triton-infer-chat-completion}

<Tabs>
<TabItem value="sdk" label="SDK">


Triton 서버로 라우팅하려면 `triton/` 접두사를 사용하세요.
```python
from litellm import completion


response = completion(
    model="triton/llama-3-8b-instruct",
    messages=[{"role": "user", "content": "who are u?"}],
    max_tokens=10,
    api_base="http://localhost:8000/infer",
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. `config.yaml`에 모델 추가

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/infer
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. LiteLLM Proxy Server로 요청 보내기

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

    ```python
    import openai
    from openai import OpenAI

    # set base_url to your proxy server
    # set api_key to send to proxy server
    client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

    response = client.chat.completions.create(
        model="my-triton-model",
        messages=[{"role": "user", "content": "who are u?"}],
        max_tokens=10,
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header`는 선택 사항이며, 가상 키로 LiteLLM 프록시를 사용할 때만 필요합니다.

    ```shell
    curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data ' {
    "model": "my-triton-model",
    "messages": [{"role": "user", "content": "who are u?"}]
    }'

    ```
  </TabItem>

  </Tabs>

</TabItem>
</Tabs>



## Triton `/embeddings` - 임베딩 {#triton-embeddings-embedding}

<Tabs>
<TabItem value="sdk" label="SDK">

Triton 서버로 라우팅하려면 `triton/` 접두사를 사용하세요.
```python
from litellm import embedding
import os

response = await litellm.aembedding(
    model="triton/<your-triton-model>",                                                       
    api_base="https://your-triton-api-base/triton/embeddings", # /embeddings endpoint you want litellm to call on your server
    input=["good morning from litellm"],
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. `config.yaml`에 모델 추가

  ```yaml
  model_list:
    - model_name: my-triton-model
      litellm_params:
        model: triton/<your-triton-model>"
        api_base: https://your-triton-api-base/triton/embeddings
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --detailed_debug
  ```

3. LiteLLM Proxy Server로 요청 보내기

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

    ```python
    import openai
    from openai import OpenAI

    # set base_url to your proxy server
    # set api_key to send to proxy server
    client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

    response = client.embeddings.create(
        input=["hello from litellm"],
        model="my-triton-model"
    )

    print(response)

    ```

  </TabItem>

  <TabItem value="curl" label="curl">

  `--header`는 선택 사항이며, 가상 키로 LiteLLM 프록시를 사용할 때만 필요합니다.

    ```shell
    curl --location 'http://0.0.0.0:4000/embeddings' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data ' {
    "model": "my-triton-model",
    "input": ["write a litellm poem"]
    }'

    ```
  </TabItem>

  </Tabs>


</TabItem>

</Tabs>
