import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Predibase

LiteLLM은 Predibase의 모든 모델을 지원합니다.


## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### API 키 {#api-keys}
```python
import os 
os.environ["PREDIBASE_API_KEY"] = ""
```

### 호출 예제 {#example-call}

```python
from litellm import completion
import os
## set ENV variables
os.environ["PREDIBASE_API_KEY"] = "predibase key"
os.environ["PREDIBASE_TENANT_ID"] = "predibase tenant id"

# predibase llama-3 call
response = completion(
    model="predibase/llama-3-8b-instruct", 
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
        model: predibase/llama-3-8b-instruct
        api_key: os.environ/PREDIBASE_API_KEY
        tenant_id: os.environ/PREDIBASE_TENANT_ID
  ```



2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --debug
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


</TabItem>

</Tabs>

## 고급 사용법 - 프롬프트 포매팅 {#advanced-usage---prompt-formatting}

LiteLLM에는 모든 `meta-llama` llama3 instruct 모델에 대한 프롬프트 템플릿 매핑이 있습니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/4f46b4c3975cd0f72b8c5acb2cb429d23580c18a/litellm/llms/prompt_templates/factory.py#L1360)

사용자 지정 프롬프트 템플릿을 적용하려면 다음과 같이 설정합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python 
import litellm

import os 
os.environ["PREDIBASE_API_KEY"] = ""

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

def predibase_custom_model():
    model = "predibase/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages)
    print(response['choices'][0]['message']['content'])
    return response

predibase_custom_model()
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
# Model-specific parameters
model_list:
  - model_name: mistral-7b # model alias
    litellm_params: # actual params for litellm.completion()
      model: "predibase/mistralai/Mistral-7B-Instruct-v0.1" 
      api_key: os.environ/PREDIBASE_API_KEY
      initial_prompt_value: "\n"
      roles: {"system":{"pre_message":"<|im_start|>system\n", "post_message":"<|im_end|>"}, "assistant":{"pre_message":"<|im_start|>assistant\n","post_message":"<|im_end|>"}, "user":{"pre_message":"<|im_start|>user\n","post_message":"<|im_end|>"}}
      final_prompt_value: "\n"
      bos_token: "<s>"
      eos_token: "</s>"
      max_tokens: 4096
```

</TabItem>

</Tabs>

## 추가 파라미터 전달 - max_tokens, temperature {#passing-additional-params---max_tokens-temperature}
`litellm.completion`에서 지원하는 모든 파라미터는 [여기](https://docs.litellm.ai/docs/completion/input)에서 확인하세요.

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["PREDIBASE_API_KEY"] = "predibase key"

# predibae llama-3 call
response = completion(
    model="predibase/llama3-8b-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**proxy**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: predibase/llama-3-8b-instruct
        api_key: os.environ/PREDIBASE_API_KEY
        max_tokens: 20
        temperature: 0.5
```

## Predibase 전용 파라미터 전달 - adapter_id, adapter_source {#passings-predibase-specific-params---adapter_id-adapter_source}
[`litellm.completion()`에서 지원하지 않지만](https://docs.litellm.ai/docs/completion/input) Predibase에서 지원하는 파라미터는 `litellm.completion`에 전달해서 보낼 수 있습니다.

예제 `adapter_id`, `adapter_source`는 Predibase 전용 파라미터입니다. [목록 보기](https://github.com/BerriAI/litellm/blob/8a35354dd6dbf4c2fcefcd6e877b980fcbd68c58/litellm/llms/predibase.py#L54)

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["PREDIBASE_API_KEY"] = "predibase key"

# predibase llama3 call
response = completion(
    model="predibase/llama-3-8b-instruct", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    adapter_id="my_repo/3",
    adapter_source="pbase",
)
```

**proxy**

```yaml
  model_list:
    - model_name: llama-3
      litellm_params:
        model: predibase/llama-3-8b-instruct
        api_key: os.environ/PREDIBASE_API_KEY
        adapter_id: my_repo/3
        adapter_source: pbase
```
