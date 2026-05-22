import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# VLLM

LiteLLM은 VLLM의 모든 모델을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | vLLM은 LLM inference와 serving을 위한 빠르고 사용하기 쉬운 라이브러리입니다. [문서](https://docs.vllm.ai/en/latest/index.html) |
| LiteLLM Provider Route | `hosted_vllm/` (OpenAI 호환 server용), `vllm/` ([DEPRECATED] vLLM sdk 사용용) |
| Provider 문서 | [vLLM ↗](https://docs.vllm.ai/en/latest/index.html) |
| 지원 엔드포인트 | `/chat/completions`, `/embeddings`, `/completions`, `/rerank`, `/audio/transcriptions` |


# 빠른 시작

## 사용법 - litellm.completion (OpenAI 호환 endpoint 호출)
vLLM은 OpenAI 호환 endpoint를 제공합니다. LiteLLM으로 호출하는 방법은 다음과 같습니다.

litellm으로 hosted vllm server를 호출하려면 completion call에 다음을 추가합니다.

* `model="hosted_vllm/<your-vllm-model-name>"` 
* `api_base = "your-hosted-vllm-server"`

```python
import litellm 

response = litellm.completion(
            model="hosted_vllm/facebook/opt-125m", # pass the vllm model name
            messages=messages,
            api_base="https://hosted-vllm-api.co",
            temperature=0.2,
            max_tokens=80)

print(response)
```


## 사용법 - LiteLLM Proxy Server (OpenAI 호환 endpoint 호출)

LiteLLM Proxy Server로 OpenAI 호환 endpoint를 호출하는 방법입니다.

1. config.yaml 수정

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/facebook/opt-125m  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
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

  ## Reasoning Effort

  <Tabs>
  <TabItem value="sdk" label="SDK">

  ```python
  from litellm import completion

  response = completion(
      model="hosted_vllm/gpt-oss-120b",
      messages=[{"role": "user", "content": "whats 2 + 2"}],
      reasoning_effort="high",
      api_base="https://hosted-vllm-api.co",
  )
  print(response)
  ```
  </TabItem>
  <TabItem value="proxy" label="PROXY">

  1. config.yaml 설정

  ```yaml
  model_list:
    - model_name: gpt-oss-120b
      litellm_params:
        model: hosted_vllm/gpt-oss-120b
        api_base: https://hosted-vllm-api.co
  ```

  2. 프록시 시작

  ```bash
  litellm --config /path/to/config.yaml
  ```

  3. 테스트

  ```bash
  curl http://0.0.0.0:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{"model": "gpt-oss-120b", "messages": [{"role": "user", "content": "whats 2 + 2"}], "reasoning_effort": "high"}'
  ```

  </TabItem>
  </Tabs>


## Embeddings

vLLM은 OpenAI 호환 `/v1/embeddings`를 제공합니다. client가 `encoding_format`을 생략하면 LiteLLM은 OpenAI 호환 embedding routing에서 기본값을 적용합니다(request → model `litellm_params` → `LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT` → `float`). [Embeddings](../proxy/embedding.md#embedding-encoding-format)를 참고하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding   
import os

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"


embedding = embedding(model="hosted_vllm/facebook/opt-125m", input=["Hello world"])

print(embedding)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/facebook/opt-125m  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
```

2. 프록시 시작 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"input": ["hello world"], "model": "my-model"}'
```

[OpenAI SDK/Langchain 등 예제 보기](../proxy/user_keys.md#embeddings)

</TabItem>
</Tabs>

## Rerank {#rerank}

### Rerank 엔드포인트 {#rerank-endpoint}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"
os.environ["HOSTED_VLLM_API_KEY"] = ""  # [optional], if your VLLM server requires an API key

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="hosted_vllm/your-rerank-model",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```

### Async 사용법

```python
from litellm import arerank
import os, asyncio

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8000"
os.environ["HOSTED_VLLM_API_KEY"] = ""  # [optional], if your VLLM server requires an API key

async def test_async_rerank(): 
    query = "What is the capital of the United States?"
    documents = [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ]

    response = await arerank(
        model="hosted_vllm/your-rerank-model",
        query=query,
        documents=documents,
        top_n=3,
    )
    print(response)

asyncio.run(test_async_rerank())
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: my-rerank-model
      litellm_params:
        model: hosted_vllm/your-rerank-model  # add hosted_vllm/ prefix to route as VLLM provider
        api_base: http://localhost:8000      # add api base for your VLLM server
        # api_key: your-api-key             # [optional] if your VLLM server requires authentication
```

2. 프록시 시작 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "model": "my-rerank-model",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
}'
```

[OpenAI SDK/Langchain 등 예제 보기](../rerank.md#litellm-proxy-usage)

</TabItem>
</Tabs>

## VLLM으로 Video URL 전송 {#send-video-url-to-vllm}

VLLM의 예제 implementation은 [여기](https://github.com/vllm-project/vllm/pull/10020)에서 확인할 수 있습니다.

<Tabs>
<TabItem value="files_message" label="(Unified) Files Message">

OpenAI의 `files` message type을 사용해 VLLM + Gemini에 같은 형식으로 video url을 보내려면 이 방식을 사용합니다.

VLLM에 video url을 보내는 방법은 두 가지입니다.

1. video url을 직접 전달

```
{"type": "file", "file": {"file_id": video_url}},
```

2. video data를 base64로 전달

```
{"type": "file", "file": {"file_data": f"data:video/mp4;base64,{video_data_base64}"}}
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

messages=[
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Summarize the following video"
            },
            {
                "type": "file",
                "file": {
                    "file_id": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            }
        ]
    }
]

# call vllm 
os.environ["HOSTED_VLLM_API_BASE"] = "https://hosted-vllm-api.co"
os.environ["HOSTED_VLLM_API_KEY"] = "" # [optional], if your VLLM server requires an API key
response = completion(
    model="hosted_vllm/qwen", # pass the vllm model name
    messages=messages,
)

# call gemini 
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"
response = completion(
    model="gemini/gemini-1.5-flash", # pass the gemini model name
    messages=messages,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/qwen  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
    - model_name: my-gemini-model
      litellm_params:
        model: gemini/gemini-1.5-flash  # add gemini/ prefix to route as Google AI Studio provider
        api_key: os.environ/GEMINI_API_KEY
```

2. 프록시 시작 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -X POST http://0.0.0.0:4000/chat/completions \
-H "Authorization: Bearer sk-1234" \
-H "Content-Type: application/json" \
-d '{
    "model": "my-model",
    "messages": [
        {"role": "user", "content": 
            [
                {"type": "text", "text": "Summarize the following video"},
                {"type": "file", "file": {"file_id": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}
            ]
        }
    ]
}'
```

</TabItem>
</Tabs>


</TabItem>
<TabItem value="video_url" label="(VLLM-specific) Video Message">

VLLM의 native message format(`video_url`)으로 video url을 보내려면 이 방식을 사용합니다.

VLLM에 video url을 보내는 방법은 두 가지입니다.

1. video url을 직접 전달

```
{"type": "video_url", "video_url": {"url": video_url}},
```

2. video data를 base64로 전달

```
{"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{video_data_base64}"}}
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
            model="hosted_vllm/qwen", # pass the vllm model name
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Summarize the following video"
                        },
                        {
                            "type": "video_url",
                            "video_url": {
                                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            }
                        }
                    ]
                }
            ],
            api_base="https://hosted-vllm-api.co")

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: my-model
      litellm_params:
        model: hosted_vllm/qwen  # add hosted_vllm/ prefix to route as OpenAI provider
        api_base: https://hosted-vllm-api.co      # add api base for OpenAI compatible provider
```

2. 프록시 시작 

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -X POST http://0.0.0.0:4000/chat/completions \
-H "Authorization: Bearer sk-1234" \
-H "Content-Type: application/json" \
-d '{
    "model": "my-model",
    "messages": [
        {"role": "user", "content": 
            [
                {"type": "text", "text": "Summarize the following video"},
                {"type": "video_url", "video_url": {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}
            ]
        }
    ]
}'
```

</TabItem>
</Tabs>


</TabItem>
</Tabs>


## packaged `vllm` install용(Deprecated)
### 사용법 - `litellm.completion`

```
uv add litellm vllm
```
```python
import litellm 

response = litellm.completion(
            model="vllm/facebook/opt-125m", # add a vllm prefix so litellm knows the custom_llm_provider==vllm
            messages=messages,
            temperature=0.2,
            max_tokens=80)

print(response)
```


### Batch Completion

```python
from litellm import batch_completion

model_name = "facebook/opt-125m"
provider = "vllm"
messages = [[{"role": "user", "content": "Hey, how's it going"}] for _ in range(5)]

response_list = batch_completion(
            model=model_name, 
            custom_llm_provider=provider, # can easily switch to huggingface, replicate, together ai, sagemaker, etc.
            messages=messages,
            temperature=0.2,
            max_tokens=80,
        )
print(response_list)
```
### Prompt Templates

특수 prompt template이 있는 모델(예: Llama2)의 경우 해당 template에 맞게 prompt를 format합니다.

**필요한 모델을 아직 지원하지 않으면 어떻게 하나요?**
아직 해당 모델이 포함되어 있지 않다면 custom prompt formatting을 직접 지정할 수 있습니다.

**그렇다면 모든 모델에 prompt를 지정해야 하나요?**
아닙니다. 기본적으로 message content를 이어 붙여 prompt를 만듭니다(Bloom, T-5, Llama-2 base model 등에서 기대하는 형식).

**기본 Prompt Template**
```python
def default_pt(messages):
    return " ".join(message["content"] for message in messages)
```

[LiteLLM에서 prompt template이 동작하는 방식의 코드](https://github.com/BerriAI/litellm/blob/main/litellm/llms/prompt_templates/factory.py)


#### 이미 Prompt Template이 있는 모델

| Model Name                           | 동작 대상 모델                  | Function Call                                                                                                    |
|--------------------------------------|-----------------------------------|------------------------------------------------------------------------------------------------------------------|
| meta-llama/Llama-2-7b-chat           | 모든 meta-llama llama2 chat 모델 | `completion(model='vllm/meta-llama/Llama-2-7b', messages=messages, api_base="your_api_endpoint")`                |
| tiiuae/falcon-7b-instruct            | 모든 falcon instruct 모델        | `completion(model='vllm/tiiuae/falcon-7b-instruct', messages=messages, api_base="your_api_endpoint")`            |
| mosaicml/mpt-7b-chat                 | 모든 mpt chat 모델               | `completion(model='vllm/mosaicml/mpt-7b-chat', messages=messages, api_base="your_api_endpoint")`                 |
| codellama/CodeLlama-34b-Instruct-hf  | 모든 codellama instruct 모델     | `completion(model='vllm/codellama/CodeLlama-34b-Instruct-hf', messages=messages, api_base="your_api_endpoint")`  |
| WizardLM/WizardCoder-Python-34B-V1.0 | 모든 wizardcoder 모델            | `completion(model='vllm/WizardLM/WizardCoder-Python-34B-V1.0', messages=messages, api_base="your_api_endpoint")` |
| Phind/Phind-CodeLlama-34B-v2         | 모든 phind-codellama 모델        | `completion(model='vllm/Phind/Phind-CodeLlama-34B-v2', messages=messages, api_base="your_api_endpoint")`         |

#### 사용자 지정 prompt template

```python 
# Create your own custom prompt template works 
litellm.register_prompt_template(
	model="togethercomputer/LLaMA-2-7B-32K",
	roles={
            "system": {
                "pre_message": "[INST] <<SYS>>\n",
                "post_message": "\n<</SYS>>\n [/INST]\n"
            },
            "user": { 
                "pre_message": "[INST] ",
                "post_message": " [/INST]\n"
            }, 
            "assistant": {
                "pre_message": "\n",
                "post_message": "\n",
            }
        } # tell LiteLLM how you want to map the openai messages to this model
)

def test_vllm_custom_model():
    model = "vllm/togethercomputer/LLaMA-2-7B-32K"
    response = completion(model=model, messages=messages)
    print(response['choices'][0]['message']['content'])
    return response

test_vllm_custom_model()
```

[Implementation Code](https://github.com/BerriAI/litellm/blob/6b3cb1898382f2e4e80fd372308ea232868c78d1/litellm/utils.py#L1414)
