import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Replicate

LiteLLM은 Replicate의 모든 모델을 지원합니다.


## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### API 키
```python
import os 
os.environ["REPLICATE_API_KEY"] = ""
```

### 호출 예제

```python
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-3 call
response = completion(
    model="replicate/meta/meta-llama-3-8b-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml`에 모델을 추가합니다.

  ```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
  ```



2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --debug
  ```

3. LiteLLM 프록시 서버로 요청을 보냅니다.

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="llama-3",
      messages = [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
    ]
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
      "model": "llama-3",
      "messages": [
        {
            "role": "system",
            "content": "Be a good human!"
        },
        {
            "role": "user",
            "content": "What do you know about earth?"
        }
        ],
  }'
  ```
  </TabItem>

  </Tabs>


### 예상 Replicate 호출

위 예제에서 litellm이 replicate로 보내는 호출은 다음과 같습니다.

```bash

POST Request Sent from LiteLLM:
curl -X POST \
https://api.replicate.com/v1/models/meta/meta-llama-3-8b-instruct \
-H 'Authorization: Token your-api-key' -H 'Content-Type: application/json' \
-d '{'version': 'meta/meta-llama-3-8b-instruct', 'input': {'prompt': '<|start_header_id|>system<|end_header_id|>\n\nBe a good human!<|eot_id|><|start_header_id|>user<|end_header_id|>\n\nWhat do you know about earth?<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n'}}'
```

</TabItem>

</Tabs>

## 고급 사용법 - 프롬프트 형식 지정

LiteLLM에는 모든 `meta-llama` Llama 3 Instruct 모델에 대한 프롬프트 템플릿 매핑이 있습니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/4f46b4c3975cd0f72b8c5acb2cb429d23580c18a/litellm/llms/prompt_templates/factory.py#L1360)

사용자 지정 프롬프트 템플릿을 적용하려면 다음과 같이 설정합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
import litellm

import os 
os.environ["REPLICATE_API_KEY"] = ""

# Create your own custom prompt template 
litellm.register_prompt_template(
	    model="togethercomputer/LLaMA-2-7B-32K",
        initial_prompt_value="You are a good assistant" # [OPTIONAL]
	    roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n", # [OPTIONAL]
                "post_message": "\n<</SYS>>\n [/INST]\n" # [OPTIONAL]
            },
            "user": { 
                "pre_message": "[INST] ", # [OPTIONAL]
                "post_message": " [/INST]" # [OPTIONAL]
            }, 
            "assistant": {
                "pre_message": "\n" # [OPTIONAL]
                "post_message": "\n" # [OPTIONAL]
            }
        }
        final_prompt_value="Now answer as best you can:" # [OPTIONAL]
)

def test_replicate_custom_model():
    model = "replicate/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages)
    print(response['choices'][0]['message']['content'])
    return response

test_replicate_custom_model()
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
# Model-specific parameters
model_list:
  - model_name: mistral-7b # model alias
    litellm_params: # actual params for litellm.completion()
      model: "replicate/mistralai/Mistral-7B-Instruct-v0.1" 
      api_key: os.environ/REPLICATE_API_KEY
      initial_prompt_value: "\n"
      roles: {"system":{"pre_message":"<|im_start|>system\n", "post_message":"<|im_end|>"}, "assistant":{"pre_message":"<|im_start|>assistant\n","post_message":"<|im_end|>"}, "user":{"pre_message":"<|im_start|>user\n","post_message":"<|im_end|>"}}
      final_prompt_value: "\n"
      bos_token: "<s>"
      eos_token: "</s>"
      max_tokens: 4096
```

</TabItem>

</Tabs>

## 고급 사용법 - Replicate 배포 호출
[배포된 Replicate LLM](https://replicate.com/deployments)을 호출합니다.
모델에 `replicate/deployments/` 접두사를 추가하면 LiteLLM이 `deployments` 엔드포인트를 호출합니다. 아래 예시는 Replicate의 `ishaan-jaff/ishaan-mistral` 배포를 호출합니다.

```python
response = completion(
    model="replicate/deployments/ishaan-jaff/ishaan-mistral", 
    messages= [{ "content": "Hello, how are you?","role": "user"}]
)
```

:::warning Replicate 콜드 부팅

Replicate 콜드 부팅으로 인해 Replicate 응답에는 3~5분이 걸릴 수 있습니다. 디버깅 중이라면 `litellm.set_verbose=True`로 요청해 보세요. [Replicate 콜드 부팅에 대해 더 보기](https://replicate.com/docs/how-does-replicate-work#cold-boots)

:::

## Replicate 모델
LiteLLM은 모든 Replicate LLM을 지원합니다.

Replicate 모델의 경우 `model` 인수에 `replicate/` 접두사를 반드시 추가하세요. LiteLLM은 이 인수를 사용해 모델을 감지합니다.

다음은 LiteLLM으로 Replicate LLM을 호출하는 예제입니다.

모델 이름                  | 함수 호출                                                  | 필수 OS 변수                |
-----------------------------|----------------------------------------------------------------|--------------------------------------|
 `replicate/llama-2-70b-chat` | `completion(model='replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf', messages)` | `os.environ['REPLICATE_API_KEY']`    |
 `a16z-infra/llama-2-13b-chat`| `completion(model='replicate/a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52', messages)`| `os.environ['REPLICATE_API_KEY']`    |
 `replicate/vicuna-13b`  | `completion(model='replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b', messages)` | `os.environ['REPLICATE_API_KEY']` |
 `daanelson/flan-t5-large`    | `completion(model='replicate/daanelson/flan-t5-large:ce962b3f6792a57074a601d3979db5839697add2e4e02696b3ced4c022d4767f', messages)`    | `os.environ['REPLICATE_API_KEY']`    |
 `custom-llm`    | `completion(model='replicate/custom-llm-version-id', messages)`    | `os.environ['REPLICATE_API_KEY']`    |
  Replicate 배포    | `completion(model='replicate/deployments/ishaan-jaff/ishaan-mistral', messages)`    | `os.environ['REPLICATE_API_KEY']`    |


## 추가 매개변수 전달 - `max_tokens`, `temperature`
`litellm.completion`에서 지원하는 모든 매개변수는 [여기](https://docs.litellm.ai/docs/completion/input)에서 확인하세요.

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-2 call
response = completion(
    model="replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**프록시**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
        max_tokens: 20
        temperature: 0.5
```

## Replicate 전용 매개변수 전달
[`litellm.completion()`에서 지원하지 않지만](https://docs.litellm.ai/docs/completion/input) Replicate에서 지원하는 매개변수는 `litellm.completion`에 전달할 수 있습니다.

예를 들어 `seed`, `min_tokens`는 Replicate 전용 매개변수입니다.

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["REPLICATE_API_KEY"] = "replicate key"

# replicate llama-2 call
response = completion(
    model="replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    seed=-1,
    min_tokens=2,
    top_k=20,
)
```

**프록시**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: replicate/meta/meta-llama-3-8b-instruct
        api_key: os.environ/REPLICATE_API_KEY
        min_tokens: 2
        top_k: 20
```
