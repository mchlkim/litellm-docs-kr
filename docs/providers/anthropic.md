import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic
LiteLLM은 모든 Anthropic 모델을 지원합니다.

- `claude-opus-4-6` (`claude-opus-4-6-20260205`)
- `claude-sonnet-4-6`
- `claude-sonnet-4-5-20250929`
- `claude-opus-4-5-20251101`
- `claude-opus-4-1-20250805`
- `claude-4` (`claude-opus-4-20250514`, `claude-sonnet-4-20250514`)
- `claude-3.7` (`claude-3-7-sonnet-20250219`)
- `claude-3.5` (`claude-3-5-sonnet-20240620`)
- `claude-3` (`claude-3-haiku-20240307`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`)
- `claude-2`
- `claude-2.1`
- `claude-instant-1.2`


| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Claude는 Anthropic이 만든 고성능, 신뢰성, 지능형 AI 플랫폼입니다. Claude는 언어, 추론, 분석, 코딩 등 다양한 작업에 강합니다. Azure Foundry에서도 사용할 수 있습니다. |
| LiteLLM Provider Route | `anthropic/` (요청을 Anthropic으로 라우팅하려면 model name에 이 prefix를 추가합니다. 예: `anthropic/claude-3-5-sonnet-20240620`). Azure Foundry deployment에는 `azure/claude-*`를 사용하세요. [Azure Anthropic documentation](../providers/azure/azure_anthropic)을 참고하세요. |
| Provider 문서 | [Anthropic ↗](https://docs.anthropic.com/en/docs/build-with-claude/overview), [Azure Foundry Claude ↗](https://learn.microsoft.com/en-us/azure/ai-services/foundry-models/claude) |
| Provider API Endpoint | https://api.anthropic.com (또는 Azure Foundry endpoint: `https://<resource-name>.services.ai.azure.com/anthropic`) |
| 지원 엔드포인트 | `/chat/completions`, `/v1/messages` (passthrough) |


## 지원되는 OpenAI 파라미터

코드에서는 [여기](../completion/input.md#translated-openai-params)에서 확인할 수 있습니다.

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"max_completion_tokens",
"tools",
"tool_choice",
"extra_headers",
"parallel_tool_calls",
"response_format",
"user",
"reasoning_effort",
```

:::info

**참고:**
- Anthropic API는 `max_tokens`가 전달되지 않으면 요청에 실패합니다. 따라서 `max_tokens`가 없을 때 litellm은 `max_tokens=4096`을 전달합니다.
- `response_format`은 Claude Sonnet 4.5 및 Opus 4.1 모델에서 완전히 지원됩니다. [Structured Outputs](#structured-outputs) 섹션을 참고하세요.
- `reasoning_effort`는 Claude 4.6 및 Opus 4.5 모델에서 `output_config={"effort": ...}`로 자동 매핑됩니다. [Effort Parameter](./anthropic_effort.md)를 참고하세요.

:::

## **Structured Outputs** {#structured-outputs}

LiteLLM은 Claude Sonnet 4.5 및 Opus 4.1 모델에서 Anthropic의 [structured outputs feature](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)를 지원합니다. 이 모델에서 `response_format`을 사용하면 LiteLLM은 자동으로 다음을 수행합니다.
- 필요한 `structured-outputs-2025-11-13` beta 헤더 추가
- OpenAI의 `response_format`을 Anthropic의 `output_format` 형식으로 변환

### 지원 모델 {#supported-models}
- `sonnet-4-5` 또는 `sonnet-4.5` (모든 Sonnet 4.5 변형)
- `opus-4-1` 또는 `opus-4.1` (모든 Opus 4.1 변형)
  - `opus-4-5` 또는 `opus-4.5` (모든 Opus 4.5 변형)
  
### 예제 사용법 {#example-usage}

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

response = completion(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "capital_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "country": {"type": "string"},
                    "capital": {"type": "string"}
                },
                "required": ["country", "capital"],
                "additionalProperties": False
            }
        }
    }
)

print(response.choices[0].message.content)
# Output: {"country": "France", "capital": "Paris"}
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "capital_response",
            "strict": true,
            "schema": {
                "type": "object",
                "properties": {
                    "country": {"type": "string"},
                    "capital": {"type": "string"}
                },
                "required": ["country", "capital"],
                "additionalProperties": false
            }
        }
    }
  }'
```

</TabItem>
</Tabs>

:::info
지원 모델에서 structured output을 사용하면 LiteLLM은 자동으로 다음을 수행합니다.
- OpenAI의 `response_format`을 Anthropic의 `output_schema`로 변환
- `anthropic-beta: structured-outputs-2025-11-13` 헤더 추가
- schema가 포함된 도구를 만들고 모델이 이를 사용하도록 강제
:::

## API 키 {#api-keys}

```python
import os

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"
# os.environ["ANTHROPIC_API_BASE"] = "" # [OPTIONAL] or 'ANTHROPIC_BASE_URL'
# os.environ["LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX"] = "true" # [OPTIONAL] Disable automatic URL suffix appending
```

:::tip Azure Foundry 지원

Claude 모델은 Microsoft Azure Foundry에서도 사용할 수 있습니다. `anthropic/` 대신 `azure/` prefix를 사용하고 Azure authentication을 구성하세요. 자세한 내용은 [Azure Anthropic documentation](../providers/azure/azure_anthropic)을 참고하세요.

예제:
```python
response = completion(
    model="azure/claude-sonnet-4-5",
    api_base="https://<resource-name>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

:::

### Custom API Base {#custom-api-base}

Anthropic에 custom API base(proxy 또는 custom endpoint 등)를 사용할 때 LiteLLM은 base URL에 적절한 suffix(`/v1/messages` 또는 `/v1/complete`)를 자동으로 추가합니다.

custom endpoint가 이미 전체 path를 포함하거나 Anthropic의 표준 URL 구조를 따르지 않는다면 이 자동 suffix 추가를 비활성화할 수 있습니다.

```python
import os

os.environ["ANTHROPIC_API_BASE"] = "https://my-custom-endpoint.com/custom/path"
os.environ["LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX"] = "true"  # Prevents automatic suffix
```

`LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX`가 없을 때:
- Base URL `https://my-proxy.com` → `https://my-proxy.com/v1/messages`
- Base URL `https://my-proxy.com/api` → `https://my-proxy.com/api/v1/messages`

`LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX=true`일 때:
- Base URL `https://my-proxy.com/custom/path` → `https://my-proxy.com/custom/path` (변경 없음)

### Azure AI Foundry(대체 방법)

:::tip 권장 방법
Azure AD authentication을 포함한 전체 Azure 지원에는 `azure_ai/` prefix와 전용 [Azure Anthropic provider](./azure/azure_anthropic)를 사용하세요.
:::

대안으로, Azure가 Anthropic native API를 사용해 Claude를 노출하므로 Azure endpoint와 함께 `anthropic/` provider를 직접 사용할 수도 있습니다.

```python
from litellm import completion

response = completion(
    model="anthropic/claude-sonnet-4-5",
    api_base="https://<your-resource>.services.ai.azure.com/anthropic",
    api_key="<your-azure-api-key>",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response)
```

:::info
**Azure endpoint 찾기:** Azure AI Foundry → Your deployment → 개요로 이동하세요. base URL은 `https://<resource-name>.services.ai.azure.com/anthropic`입니다.
:::

## 사용법

```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="claude-opus-4-20250514", messages=messages)
print(response)
```


## 사용법 - Streaming {#usage-streaming}
completion 호출 시 `stream=True`만 설정하면 됩니다.

```python
import os
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="claude-opus-4-20250514", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

## LiteLLM Proxy 사용법 {#usage-with-litellm-proxy}

LiteLLM Proxy Server로 Anthropic을 호출하는 방법은 다음과 같습니다.

### 1. environment에 key 저장 {#1-save-key-in-environment}

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### 2. 프록시 시작 {#2-start-proxy}

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: claude-4 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: claude-opus-4-20250514 ### MODEL NAME sent to `litellm.completion()` ###
      api_key: "os.environ/ANTHROPIC_API_KEY" # does os.getenv("ANTHROPIC_API_KEY")
```

```bash
litellm --config /path/to/config.yaml
```
</TabItem>
<TabItem value="config-all" label="config - 모든 Anthropic Model 기본 처리">

`config.yaml`에 `claude-3-haiku-20240307`, `claude-3-opus-20240229`, `claude-2.1`을 정의하지 않고 요청하려면 이 방식을 사용하세요.

#### 필수 env variable {#required-env-variable}
```
ANTHROPIC_API_KEY=sk-ant****
```

```yaml
model_list:
  - model_name: "*" 
    litellm_params:
      model: "*"
```

```bash
litellm --config /path/to/config.yaml
```

이 config.yaml에 대한 예제 요청입니다.

**요청을 Anthropic API로 라우팅하려면 `anthropic/` prefix를 사용해야 합니다.**

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "anthropic/claude-3-haiku-20240307",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```


</TabItem>
<TabItem value="cli" label="cli">

```bash
$ litellm --model claude-opus-4-20250514

# Server running on http://0.0.0.0:4000
```
</TabItem>
</Tabs>

### 3. 테스트 {#3-test}


<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "claude-3",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="claude-3", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "claude-3",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```
</TabItem>
</Tabs>

## 지원 모델 {#supported-models-1}

`Model Name` 👉 사람이 읽기 쉬운 이름입니다.  
`Function Call` 👉 LiteLLM에서 모델을 호출하는 방법입니다.

| Model Name       | 호출 방법                              |
|------------------|--------------------------------------------|
| claude-opus-4-6  | `completion('claude-opus-4-6-20260205', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| `claude-sonnet-4-5`  | `completion('claude-sonnet-4-5-20250929', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4-5  | `completion('claude-opus-4-5-20251101', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4-1  | `completion('claude-opus-4-1-20250805', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-opus-4  | `completion('claude-opus-4-20250514', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-sonnet-4  | `completion('claude-sonnet-4-20250514', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3.7  | `completion('claude-3-7-sonnet-20250219', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| `claude-3-5-sonnet`  | `completion('claude-3-5-sonnet-20240620', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-haiku  | `completion('claude-3-haiku-20240307', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-opus  | `completion('claude-3-opus-20240229', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| `claude-3-5-sonnet-20240620`  | `completion('claude-3-5-sonnet-20240620', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-3-sonnet  | `completion('claude-3-sonnet-20240229', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-2.1  | `completion('claude-2.1', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-2  | `completion('claude-2', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| `claude-instant-1.2`  | `completion('claude-instant-1.2', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |
| claude-instant-1  | `completion('claude-instant-1', messages)` | `os.environ['ANTHROPIC_API_KEY']`       |

## **Prompt 캐싱** {#prompt-caching}

Anthropic Prompt 캐싱을 사용합니다.


[관련 Anthropic API 문서](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

:::note

Anthropic Context 캐싱을 위해 LiteLLM이 보내는 sample Raw Request는 다음과 같습니다.

```bash
POST Request Sent from LiteLLM:
curl -X POST \
https://api.anthropic.com/v1/messages \
-H 'accept: application/json' -H 'anthropic-version: 2023-06-01' -H 'content-type: application/json' -H 'x-api-key: sk-...' \
-d '{'model': 'claude-3-5-sonnet-20240620', [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What are the key terms and conditions in this agreement?",
          "cache_control": {
            "type": "ephemeral"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Certainly! The key terms and conditions are the following: the contract is 1 year long for $10/mo"
        }
      ]
    }
  ],
  "temperature": 0.2,
  "max_tokens": 10
}'
```

**참고:** Anthropic은 더 이상 `anthropic-beta: prompt-caching-2024-07-31` 헤더를 요구하지 않습니다. 이제 message에서 `cache_control`을 사용하면 prompt caching이 자동으로 동작합니다.
::: 

### 캐싱 - Large Context 캐싱 {#caching-large-context-caching}


이 예제는 기본 Prompt 캐싱 사용법을 보여줍니다. 법률 계약서 전체 text를 prefix로 caching하면서 사용자 instruction은 caching하지 않습니다.


<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement",
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

:::info

LiteLLM Proxy는 OpenAI와 호환됩니다.

OpenAI Python SDK를 사용해 LiteLLM Proxy로 요청을 보내는 예제입니다.

litellm proxy config.yaml에 model=`anthropic/claude-3-5-sonnet-20240620`이 있다고 가정합니다.

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)


response = await client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "You are an AI assistant tasked with analyzing legal documents.",
                },
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement",
                    "cache_control": {"type": "ephemeral"},
                },
            ],
        },
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```

</TabItem>
</Tabs>

### 캐싱 - 도구 정의

이 예제는 tool definition을 caching하는 방법을 보여줍니다.

`cache_control` 파라미터는 마지막 도구에 배치합니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
import litellm

response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]
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
                "cache_control": {"type": "ephemeral"}
            },
        }
    ]
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

:::info

LiteLLM Proxy는 OpenAI와 호환됩니다.

OpenAI Python SDK를 사용해 LiteLLM Proxy로 요청을 보내는 예제입니다.

litellm proxy config.yaml에 model=`anthropic/claude-3-5-sonnet-20240620`이 있다고 가정합니다.

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]
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
                "cache_control": {"type": "ephemeral"}
            },
        }
    ]
)
```

</TabItem>
</Tabs>


### 캐싱 - Multi-Turn 대화 이어가기 {#caching-continuing-a-multi-turn-conversation}

이 예제는 multi-turn conversation에서 Prompt caching을 사용하는 방법을 보여줍니다.

`cache_control` 파라미터는 system message에 배치해 해당 message를 static prefix의 일부로 지정합니다.

conversation history(previous messages)는 messages array에 포함됩니다. follow-up을 이어갈 수 있도록 마지막 turn에는 cache-control을 표시합니다. 마지막에서 두 번째 user message는 `cache_control` 파라미터로 caching 대상이 되므로, 이 checkpoint가 이전 cache에서 읽을 수 있습니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python 
import litellm

response = await litellm.acompletion(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        # System Message
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement"
                    * 400,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        {
            "role": "assistant",
            "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
        },
        # The final turn is marked with cache-control, for continuing in followups.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
    ]
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

:::info

LiteLLM Proxy는 OpenAI와 호환됩니다.

OpenAI Python SDK를 사용해 LiteLLM Proxy로 요청을 보내는 예제입니다.

litellm proxy config.yaml에 model=`anthropic/claude-3-5-sonnet-20240620`이 있다고 가정합니다.

:::

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet-20240620",
    messages=[
        # System Message
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement"
                    * 400,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        # marked for caching with the cache_control parameter, so that this checkpoint can read from the previous cache.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
        {
            "role": "assistant",
            "content": "Certainly! the key terms and conditions are the following: the contract is 1 year long for $10/mo",
        },
        # The final turn is marked with cache-control, for continuing in followups.
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        },
    ]
)
```

</TabItem>
</Tabs>

## **Function/도구 호출** {#functiontool-calling}

```python
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

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
    model="anthropic/claude-3-opus-20240229",
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


### Anthropic 도구 사용 강제 {#forcing-anthropic-tool-use}

Claude가 사용자의 질문에 답하기 위해 특정 도구를 사용하게 하려는 경우

다음처럼 `tool_choice` field에 도구를 지정하면 됩니다.
```python
response = completion(
    model="anthropic/claude-3-opus-20240229",
    messages=messages,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},
)
```

### 도구 호출 비활성화 {#disable-tool-calling}

`tool_choice`를 `"none"`으로 설정하면 tool calling을 비활성화할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="anthropic/claude-3-opus-20240229",
    messages=messages,
    tools=tools,
    tool_choice="none",
)

```
</TabItem>
<TabItem value="proxy" label="Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: anthropic-claude-model
    litellm_params:
        model: anthropic/claude-3-opus-20240229
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

[설정](../proxy/virtual_keys)을 마쳤다면 `anything`을 LiteLLM Proxy Virtual Key로 바꾸세요.

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "anthropic-claude-model",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [{"type": "mcp", "server_label": "deepwiki", "server_url": "https://mcp.deepwiki.com/mcp", "require_approval": "never"}],
    "tool_choice": "none"
  }'
```
</TabItem>
</Tabs>



### MCP 도구 호출 {#mcp-tool-calling}

Anthropic에서 MCP tool calling을 사용하는 방법은 다음과 같습니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

LiteLLM은 OpenAI Responses API format으로 Anthropic MCP tool calling을 지원합니다.

<Tabs>
<TabItem value="openai_format" label="OpenAI Format">


```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

tools=[
    {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never",
    },
]

response = completion(
    model="anthropic/claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Who won the World Cup in 2022?"}],
    tools=tools
)
```

</TabItem>
<TabItem value="anthropic_format" label="Anthropic Format">

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

tools = [
    {
        "type": "url",
        "url": "https://mcp.deepwiki.com/mcp",
        "name": "deepwiki-mcp",
    }
]
response = completion(
    model="anthropic/claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Who won the World Cup in 2022?"}],
    tools=tools
)

print(response)
```
</TabItem>

</Tabs>

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: claude-4-sonnet
    litellm_params:
        model: anthropic/claude-sonnet-4-20250514
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

<Tabs>
<TabItem value="openai" label="OpenAI Format">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-4-sonnet",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [{"type": "mcp", "server_label": "deepwiki", "server_url": "https://mcp.deepwiki.com/mcp", "require_approval": "never"}]
  }'
```

</TabItem>
<TabItem value="anthropic" label="Anthropic Format">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-4-sonnet",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "tools": [
        {
            "type": "url",
            "url": "https://mcp.deepwiki.com/mcp",
            "name": "deepwiki-mcp",
        }
    ]
  }'
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

### 병렬 function calling {#parallel-function-calling}

function call 결과를 Anthropic 모델로 다시 전달하는 방법은 다음과 같습니다.

```python
from litellm import completion
import os 

os.environ["ANTHROPIC_API_KEY"] = "sk-ant.."


litellm.set_verbose = True

### 1ST FUNCTION CALL ###
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
messages = [
    {
        "role": "user",
        "content": "What's the weather like in Boston today in Fahrenheit?",
    }
]
try:
    # test without max tokens
    response = completion(
        model="anthropic/claude-3-opus-20240229",
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

    messages.append(
        response.choices[0].message.model_dump()
    )  # Add assistant tool invokes
    tool_result = (
        '{"location": "Boston", "temperature": "72", "unit": "fahrenheit"}'
    )
    # Add user submitted tool results in the OpenAI format
    messages.append(
        {
            "tool_call_id": response.choices[0].message.tool_calls[0].id,
            "role": "tool",
            "name": response.choices[0].message.tool_calls[0].function.name,
            "content": tool_result,
        }
    )
    ### 2ND FUNCTION CALL ###
    # In the second response, Claude should deduce answer from tool results
    second_response = completion(
        model="anthropic/claude-3-opus-20240229",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    print(second_response)
except Exception as e:
    print(f"An error occurred - {str(e)}")
```

이 예제를 요청해 준 @[Shekhar Patnaik](https://www.linkedin.com/in/patnaikshekhar)에게 감사드립니다.

### Context management 베타 {#context-management-beta}

Anthropic의 [context editing](https://docs.claude.com/en/docs/build-with-claude/context-editing) API를 사용하면 오래된 tool result나 thinking block을 자동으로 지울 수 있습니다. LiteLLM은 Anthropic 모델을 호출할 때 native `context_management` payload를 전달하고, 필요한 `context-management-2025-06-27` beta 헤더를 자동으로 붙입니다.

```python
from litellm import completion

response = completion(
    model="anthropic/claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Summarize the latest tool results"}],
    context_management={
        "edits": [
            {
                "type": "clear_tool_uses_20250919",
                "trigger": {"type": "input_tokens", "value": 30000},
                "keep": {"type": "tool_uses", "value": 3},
                "clear_at_least": {"type": "input_tokens", "value": 5000},
                "exclude_tools": ["web_search"],
            }
        ]
    },
)
```

### Anthropic 호스팅 도구(Computer, Text Editor, Web Search, Memory) {#anthropic-hosted-tools-computer-text-editor-web-search-memory}


<Tabs>
<TabItem value="computer" label="Computer">

```python
from litellm import completion

tools = [
    {
        "type": "computer_20241022",
        "function": {
            "name": "computer",
            "parameters": {
                "display_height_px": 100,
                "display_width_px": 100,
                "display_number": 1,
            },
        },
    }
]
model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "Save a picture of a cat to my desktop."}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
    # headers={"anthropic-beta": "computer-use-2024-10-22"},
)

print(resp)
```

</TabItem>
<TabItem value="text_editor" label="Text Editor">

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

tools = [{
    "type": "text_editor_20250124",
    "name": "str_replace_editor"
}]
model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: claude-3-5-sonnet-latest
  litellm_params:
    model: anthropic/claude-3-5-sonnet-latest
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}],
    "tools": [{"type": "text_editor_20250124", "name": "str_replace_editor"}]
  }'
```
</TabItem>
</Tabs>

</TabItem>
<TabItem value="web_search" label="Web Search">

:::info
v1.70.1+부터 사용할 수 있습니다.
:::

LiteLLM은 OpenAI의 `search_context_size` 파라미터를 Anthropic의 `max_uses` 파라미터로 매핑합니다.

| OpenAI | Anthropic |
| --- | --- |
| Low | 1 | 
| Medium | 5 | 
| High | 10 | 


<Tabs>
<TabItem value="sdk" label="SDK">


<Tabs>
<TabItem value="openai" label="OpenAI Format">

```python
from litellm import completion

model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "What's the weather like today?"}]

resp = completion(
    model=model,
    messages=messages,
    web_search_options={
        "search_context_size": "medium",
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
)

print(resp)
```
</TabItem>
<TabItem value="anthropic" label="Anthropic Format">

```python
from litellm import completion

tools = [{
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5
}]
model = "claude-3-5-sonnet-20241022"
messages = [{"role": "user", "content": "There's a syntax error in my primes.py file. Can you help me fix it?"}]

resp = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(resp)
```
</TabItem>

</Tabs>
</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: claude-3-5-sonnet-latest
  litellm_params:
    model: anthropic/claude-3-5-sonnet-latest
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

<Tabs>
<TabItem value="openai" label="OpenAI Format">


```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "What's the weather like today?"}],
    "web_search_options": {
        "search_context_size": "medium",
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
  }'
```
</TabItem>
<TabItem value="anthropic" label="Anthropic Format">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "What's the weather like today?"}],
    "tools": [{
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5
    }]
  }'
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

</TabItem>

<TabItem value="memory" label="Memory">

:::info
Anthropic Memory tool은 현재 beta입니다.
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

tools = [{
    "type": "memory_20250818",
    "name": "memory"
}]

model = "claude-sonnet-4-5-20250929" 
messages = [{"role": "user", "content": "Please remember that my favorite color is blue."}]

response = completion(
    model=model,
    messages=messages,
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

1. config.yaml 설정

```yaml
model_list:
    - model_name: claude-memory-model
    litellm_params:
        model: anthropic/claude-sonnet-4-5-20250929
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $LITELLM_KEY" \
    -d '{
    "model": "claude-memory-model",
    "messages": [{"role": "user", "content": "Please remember that my favorite color is blue."}],
    "tools": [{"type": "memory_20250818", "name": "memory"}]
    }'
```
</TabItem>
</Tabs>

</TabItem>

</Tabs>



## 사용법 - Vision {#usage-vision}

```python
from litellm import completion

# set env
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


image_path = "../proxy/cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
resp = litellm.completion(
    model="anthropic/claude-3-opus-20240229",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Whats in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + base64_image
                    },
                },
            ],
        }
    ],
)
print(f"\nResponse: {resp}")
```

## 사용법 - Thinking / `reasoning_content` {#usage-thinking--reasoning_content}

LiteLLM은 OpenAI의 `reasoning_effort`를 Anthropic의 `thinking` 파라미터로 변환합니다. [Code](https://github.com/BerriAI/litellm/blob/23051d89dd3611a81617d84277059cd88b2df511/litellm/llms/anthropic/chat/transformation.py#L298)

| reasoning_effort | thinking |
| ---------------- | -------- |
| "low"            | "budget_tokens": 1024 |
| "medium"         | "budget_tokens": 2048 |
| "high"           | "budget_tokens": 4096 |

:::note
Claude 4.6 및 4.7 모델(`claude-opus-4-6`, `claude-opus-4-7`, `claude-sonnet-4-6` 등)에서 `reasoning_effort`는 `budget_tokens`가 아니라 Anthropic의 [adaptive thinking](https: //docs.claude.com/en/docs/build-with-claude/extended-thinking/adaptive-thinking)과 `output_config.effort` 파라미터로 매핑됩니다. 특히 OpenAI-compatible `/chat/completions` route에서 LiteLLM은 underlying Anthropic request에 다음 값을 주입합니다.

```json
{
  "thinking": {"type": "adaptive"},
  "output_config": {"effort": "<low|medium|high|xhigh|max>"}
}
```

즉 OpenAI-compatible request body에 별도 `thinking` field가 없더라도, `reasoning_effort`가 `"none"`이 아닌 값이면 이 모델들에서는 thinking이 자동으로 켜집니다. 이는 Anthropic의 권장 usage와 맞추기 위한 동작입니다. 4.6 모델에서는 `budget_tokens`가 deprecated되었고, adaptive만 지원되는 thinking mode인 Opus 4.7에서는 완전히 reject됩니다.

`reasoning_effort`를 완전히 생략하거나 `"none"`으로 설정하면 thinking을 비활성화할 수 있습니다. 이 경우 LiteLLM은 `thinking` field를 보내지 않습니다. 이전 모델에서 fixed budget으로 thinking을 명시적으로 제어하려면 native `thinking` 파라미터를 직접 전달할 수 있습니다.

```python
from litellm import completion

# Disable thinking on Claude 4.6/4.7
resp = completion(
    model="anthropic/claude-opus-4-7",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="none",  # no thinking field sent
)

# Explicit budget (pre-4.6 models; deprecated on 4.6, rejected on Opus 4.7)
resp = completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    thinking={"type": "enabled", "budget_tokens": 1024},
)
```

Anthropic `/v1/messages` passthrough route는 이 reasoning effort mapping의 영향을 받지 않습니다. `thinking`은 변경 없이 pass-through됩니다.
:::

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

resp = completion(
    model="anthropic/claude-3-7-sonnet-20250219",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: claude-3-7-sonnet-20250219
  litellm_params:
    model: anthropic/claude-3-7-sonnet-20250219
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>


**예상 응답**

```python
ModelResponse(
    id='chatcmpl-c542d76d-f675-4e87-8e5f-05855f5d0f5e',
    created=1740470510,
    model='claude-3-7-sonnet-20250219',
    object='chat.completion',
    system_fingerprint=None,
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content="The capital of France is Paris.",
                role='assistant',
                tool_calls=None,
                function_call=None,
                provider_specific_fields={
                    'citations': None,
                    'thinking_blocks': [
                        {
                            'type': 'thinking',
                            'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                            'signature': 'EuYBCkQYAiJAy6...'
                        }
                    ]
                }
            ),
            thinking_blocks=[
                {
                    'type': 'thinking',
                    'thinking': 'The capital of France is Paris. This is a very straightforward factual question.',
                    'signature': 'EuYBCkQYAiJAy6AGB...'
                }
            ],
            reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
        )
    ],
    usage=Usage(
        completion_tokens=68,
        prompt_tokens=42,
        total_tokens=110,
        completion_tokens_details=None,
        prompt_tokens_details=PromptTokensDetailsWrapper(
            audio_tokens=None,
            cached_tokens=0,
            text_tokens=None,
            image_tokens=None
        ),
        cache_creation_input_tokens=0,
        cache_read_input_tokens=0
    )
)
```

### Anthropic 모델에 `thinking` 전달 {#passing-thinking-to-anthropic-models}

Anthropic 모델에 `thinking` 파라미터를 전달할 수도 있습니다.

아래 예시는 SDK와 Proxy에서 같은 파라미터를 사용하는 방법을 보여줍니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/claude-3-7-sonnet-20250219",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/claude-3-7-sonnet-20250219",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

#### 적응형 thinking(Claude Opus 4.6) {#adaptive-thinking-claude-opus-46}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/claude-opus-4-6",
  messages=[{"role": "user", "content": "What is the optimal strategy for solving this problem?"}],
  thinking={"type": "adaptive"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/claude-opus-4-6",
    "messages": [{"role": "user", "content": "What is the optimal strategy for solving this problem?"}],
    "thinking": {"type": "adaptive"}
  }'
```

</TabItem>
</Tabs>

#### Budget을 지정한 Thinking 활성화 {#enable-thinking-with-a-budget}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="anthropic/claude-opus-4-6",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 5000},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "anthropic/claude-opus-4-6",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 5000}
  }'
```

</TabItem>
</Tabs>

## **Anthropic API에 Extra Headers 전달** {#passing-extra-headers-to-anthropic-api}

`litellm.completion`에 `extra_headers: dict`를 전달합니다.

```python
from litellm import completion
messages = [{"role": "user", "content": "What is Anthropic?"}]
response = completion(
    model="claude-3-5-sonnet-20240620", 
    messages=messages, 
    extra_headers={"anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15"}
)
```

## 사용법 - "Assistant Pre-fill" {#usage-assistant-pre-fill}

`messages` array의 마지막 item으로 `assistant` role message를 포함하면 Claude의 응답 시작 부분을 미리 채울 수 있습니다.

> [!IMPORTANT]
> 반환되는 completion에는 "pre-fill" text가 포함되지 않습니다. 해당 text는 prompt 자체의 일부이기 때문입니다. Claude의 completion 앞에 pre-fill을 직접 붙여야 합니다.

```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "How do you say 'Hello' in German? Return your answer as a JSON object, like this:\n\n{ \"Hello\": \"Hallo\" }"},
    {"role": "assistant", "content": "{"},
]
response = completion(model="claude-2.1", messages=messages)
print(response)
```

#### Claude로 전송되는 예제 prompt {#example-prompt-sent-to-claude}

```

Human: How do you say 'Hello' in German? Return your answer as a JSON object, like this:

{ "Hello": "Hallo" }

Assistant: {
```

## 사용법 - "System" messages {#usage-system-messages}
Anthropic Claude 2.1을 사용하는 경우 `system` role message는 LiteLLM이 올바른 형식으로 변환합니다.

```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [
    {"role": "system", "content": "You are a snarky assistant."},
    {"role": "user", "content": "How do I boil water?"},
]
response = completion(model="claude-2.1", messages=messages)
```

#### Claude로 전송되는 예제 prompt {#example-prompt-sent-to-claude-1}

```
You are a snarky assistant.

Human: How do I boil water?

Assistant:
```


## 사용법 - PDF

`file_data` field가 있는 `file` content type을 사용해 base64 encoded PDF file을 Anthropic 모델에 전달합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

### **base64 사용** {#using-base64}
```python
from litellm import completion, supports_pdf_input
import base64
import requests

# URL of the file
url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

## check if model supports pdf input - (2024/11/11) only claude-3-5-haiku-20241022 supports it
supports_pdf_input("anthropic/claude-3-5-haiku-20241022") # True

response = completion(
    model="anthropic/claude-3-5-haiku-20241022",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "You are a very professional document summarization specialist. Please summarize the given document."},
                {
                    "type": "file",
                    "file": {
                       "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                    }
                },
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0])
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config에 model 추가

```yaml
- model_name: claude-3-5-haiku-20241022
  litellm_params:
    model: anthropic/claude-3-5-haiku-20241022
    api_key: os.environ/ANTHROPIC_API_KEY
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "You are a very professional document summarization specialist. Please summarize the given document"
          },
          {
                "type": "file",
                "file": {
                    "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
                }
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }'

```
</TabItem>
</Tabs>

## [BETA] Citations API {#beta-citations-api}

document response에서 citation을 받으려면 Anthropic에 `citations: {"enabled": true}`를 전달합니다.

참고: 이 interface는 BETA입니다. citation 반환 방식에 대한 feedback이 있으면 [여기](https://github.com/BerriAI/litellm/issues/7970#issuecomment-2644437943)에 남겨 주세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

resp = completion(
    model="claude-3-5-sonnet-20241022",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "text",
                        "media_type": "text/plain",
                        "data": "The grass is green. The sky is blue.",
                    },
                    "title": "My Document",
                    "context": "This is a trustworthy document.",
                    "citations": {"enabled": True},
                },
                {
                    "type": "text",
                    "text": "What color is the grass and sky?",
                },
            ],
        }
    ],
)

citations = resp.choices[0].message.provider_specific_fields["citations"]

assert citations is not None
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: anthropic/claude-3-5-sonnet-20241022
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "anthropic-claude",
  "messages": [
    {
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "text",
                    "media_type": "text/plain",
                    "data": "The grass is green. The sky is blue.",
                },
                "title": "My Document",
                "context": "This is a trustworthy document.",
                "citations": {"enabled": True},
            },
            {
                "type": "text",
                "text": "What color is the grass and sky?",
            },
        ],
    }
  ]
}'
```

</TabItem>
</Tabs>

## Files API {#files-api}

file을 한 번 upload한 뒤 여러 request에서 `file_id`로 참조할 수 있습니다. 매번 content를 다시 upload할 필요가 없습니다.

:::info
Anthropic에서 받은 `file_id`는 Anthropic Claude 모델에서만 동작합니다. 다른 provider(OpenAI, Bedrock 등)에서는 사용할 수 없습니다.
:::

- **최대 file size:** 500 MB | **총 storage:** org당 100 GB
- **가격:** File API operation은 무료입니다. Messages request에서 사용하는 file content는 input token으로 과금됩니다.

**file type별 지원 모델:**
- **Images:** 모든 Claude 3+ 모델
- **PDFs:** 모든 Claude 3.5+ 모델
- **기타 file type** (code execution용): Claude 3.5 Haiku + 모든 Claude 3.7+ 모델

### 빠른 시작

```python
import litellm
import os

os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

# 1. Upload a file once
file = litellm.create_file(
    file=open("document.pdf", "rb"),
    purpose="messages",
    custom_llm_provider="anthropic",
)

# 2. Use file_id in messages (no re-upload needed)
response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Summarize this document"},
            {"type": "file", "file": {"file_id": file.id, "format": "application/pdf"}}
        ]
    }]
)
```

### File Operations {#file-operations}

| 작업 | 함수 |
|-----------|----------|
| Upload | `litellm.create_file(file, purpose="messages", custom_llm_provider="anthropic")` |
| List | `litellm.file_list(custom_llm_provider="anthropic")` |
| Retrieve | `litellm.file_retrieve(file_id, custom_llm_provider="anthropic")` |
| Delete | `litellm.file_delete(file_id, custom_llm_provider="anthropic")` |
| Download | `litellm.file_content(file_id, custom_llm_provider="anthropic")` |

:::note
[code execution tool](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool)이 만든 file만 download할 수 있습니다. upload한 file은 download할 수 없습니다.
:::

### 지원 format {#supported-formats}

| File Type | Format Value |
|-----------|-------------|
| PDF | `application/pdf` |
| Plain text | `text/plain` |
| JPEG | `image/jpeg` |
| PNG | `image/png` |
| GIF | `image/gif` |
| WebP | `image/webp` |

### Image 사용 {#image-usage}

```python
# Upload image
image = litellm.create_file(
    file=open("photo.jpg", "rb"),
    purpose="messages",
    custom_llm_provider="anthropic",
)

# Use in message
response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "file", "file": {"file_id": image.id, "format": "image/jpeg"}}
        ]
    }]
)
```

## 사용법 - Anthropic에 `user_id` 전달 {#usage-passing-user_id-to-anthropic}

LiteLLM은 OpenAI `user` 파라미터를 Anthropic의 `metadata[user_id]` 파라미터로 변환합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="claude-3-5-sonnet-20240620",
    messages=messages,
    user="user_123",
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: claude-3-5-sonnet-20240620
      litellm_params:
        model: anthropic/claude-3-5-sonnet-20240620
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "claude-3-5-sonnet-20240620",
    "messages": [{"role": "user", "content": "What is Anthropic?"}],
    "user": "user_123"
  }'
```

</TabItem>
</Tabs>


## 사용법 - Agent Skills {#usage-agent-skills}

LiteLLM은 API에서 Agent Skills 사용을 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="claude-sonnet-4-5-20250929",
    messages=messages,
    tools= [
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        }
    ],
    container= {
        "skills": [
            {
                "type": "anthropic",
                "skill_id": "pptx",
                "version": "latest"
            }
        ]
    }
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: claude-sonnet-4-5-20250929
        litellm_params:
        model: anthropic/claude-sonnet-4-5-20250929
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl --location 'http://localhost:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <YOUR-LITELLM-KEY>' \
--data '{
    "model": "claude-sonnet-4-5-20250929",
    "messages": [
        {
            "role": "user",
            "content": "Hi"
        }
    ],
    "tools": [
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        }
    ],
    "container": {
        "skills": [
            {
                "type": "anthropic",
                "skill_id": "pptx",
                "version": "latest"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

container와 해당 "id"는 streaming/non-streaming response의 `provider_specific_fields`에 포함됩니다.
