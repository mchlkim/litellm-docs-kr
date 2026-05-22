import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Studio

LiteLLM은 Azure AI Studio의 모든 모델을 지원합니다.


## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### 환경 변수 {#env-var}
```python
import os 
os.environ["AZURE_AI_API_KEY"] = ""
os.environ["AZURE_AI_API_BASE"] = ""
```

### 예제 호출

```python
from litellm import completion
import os
## set ENV variables
os.environ["AZURE_AI_API_KEY"] = "azure ai key"
os.environ["AZURE_AI_API_BASE"] = "azure ai base url" # e.g.: https://Mistral-large-dfgfj-serverless.eastus2.inference.ai.azure.com/

# predibase llama-3 call
response = completion(
    model="azure_ai/command-r-plus", 
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml`에 모델 추가

  ```yaml
  model_list:
    - model_name: command-r-plus
      litellm_params:
        model: azure_ai/command-r-plus
        api_key: os.environ/AZURE_AI_API_KEY
        api_base: os.environ/AZURE_AI_API_BASE
  ```



2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml --debug
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
      model="command-r-plus",
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
      "model": "command-r-plus",
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

## 추가 파라미터 전달 - max_tokens, temperature {#passing-additional-params---max_tokens-temperature}
`litellm.completion`에서 지원하는 모든 파라미터는 [여기](../completion/input.md#translated-openai-params)에서 확인하세요.

```python
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["AZURE_AI_API_KEY"] = "azure ai api key"
os.environ["AZURE_AI_API_BASE"] = "azure ai api base"

# command r plus call
response = completion(
    model="azure_ai/command-r-plus", 
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**프록시**

```yaml
  model_list:
    - model_name: command-r-plus
      litellm_params:
        model: azure_ai/command-r-plus
        api_key: os.environ/AZURE_AI_API_KEY
        api_base: os.environ/AZURE_AI_API_BASE
        max_tokens: 20
        temperature: 0.5
```



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
      model="mistral",
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
      "model": "mistral",
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

## 함수 호출 {#function-calling}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AZURE_AI_API_KEY"] = "your-api-key"
os.environ["AZURE_AI_API_BASE"] = "your-api-base"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="azure_ai/mistral-large-latest",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $YOUR_API_KEY" \
-d '{
  "model": "mistral",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'

```

</TabItem>
</Tabs>

## 지원 모델 {#supported-모델}

LiteLLM은 **모든** Azure AI 모델을 지원합니다. 예시는 다음과 같습니다.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Cohere command-r-plus` | `completion(model="azure_ai/command-r-plus", messages)` | 
| `Cohere command-r` | `completion(model="azure_ai/command-r", messages)` | 
| `mistral-large-latest` | `completion(model="azure_ai/mistral-large-latest", messages)` | 
| `AI21-Jamba-Instruct` | `completion(model="azure_ai/ai21-jamba-instruct", messages)` | 

## 사용법 - Azure Anthropic (Azure Foundry Claude)

LiteLLM은 Azure Claude 배포를 `azure_ai/` provider를 통해 처리하므로, Azure Foundry의 Claude Opus 모델에서도 Tool Search, Effort, 스트리밍과 나머지 고급 기능 세트를 계속 사용할 수 있습니다. `AZURE_AI_API_BASE`는 `https://<resource>.services.ai.azure.com/anthropic`를 가리키도록 설정하세요. LiteLLM은 `/v1/messages`를 자동으로 덧붙입니다. 인증에는 `AZURE_AI_API_KEY` 또는 Azure AD 토큰을 사용하세요.

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import os
from litellm import completion

# Configure Azure credentials
os.environ["AZURE_AI_API_KEY"] = "your-azure-ai-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://my-resource.services.ai.azure.com/anthropic"

response = completion(
    model="azure_ai/claude-opus-4-1",
    messages=[{"role": "user", "content": "Explain how Azure Anthropic hosts Claude Opus differently from the public Anthropic API."}],
    max_tokens=1200,
    temperature=0.7,
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 환경 변수 설정**

```bash
export AZURE_AI_API_KEY="your-azure-ai-api-key"
export AZURE_AI_API_BASE="https://my-resource.services.ai.azure.com/anthropic"
```

**2. 프록시 설정**

```yaml
model_list:
  - model_name: claude-4-azure
    litellm_params:
      model: azure_ai/claude-opus-4-1
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
```

**3. LiteLLM 시작**

```bash
litellm --config /path/to/config.yaml
```

**4. Azure Claude 라우트 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer $LITELLM_KEY' \
  --data '{
    "model": "claude-4-azure",
    "messages": [
      {
        "role": "user",
        "content": "How do I use Claude Opus 4 via Azure Anthropic in LiteLLM?"
      }
    ],
    "max_tokens": 1024
  }'
```

</TabItem>
</Tabs>



## Rerank 엔드포인트 {#rerank-endpoint}

### 사용법



<Tabs>
<TabItem value="sdk" label="LiteLLM SDK 사용법">

```python
from litellm import rerank
import os

os.environ["AZURE_AI_API_KEY"] = "sk-.."
os.environ["AZURE_AI_API_BASE"] = "https://.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="azure_ai/cohere-rerank-v3.5",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy 사용법">

LiteLLM은 Rerank 호출을 위해 Cohere API와 호환되는 `/rerank` 엔드포인트를 제공합니다.

**설정**

다음 내용을 LiteLLM 프록시 `config.yaml`에 추가하세요.

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
  - model_name: cohere-rerank-v3.5
    litellm_params:
      model: azure_ai/cohere-rerank-v3.5
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
```

LiteLLM 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

요청 테스트

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cohere-rerank-v3.5",
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

</TabItem>
</Tabs>
