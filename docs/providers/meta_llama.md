import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Meta Llama

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Meta Llama API는 Meta의 대규모 언어 모델 제품군에 대한 액세스를 제공합니다. |
| LiteLLM의 제공자 경로 | `meta_llama/` |
| 지원 엔드포인트 | `/chat/completions`, `/completions`, `/responses` |
| API 참조 | [Llama API 참조 ↗](https://llama.developer.meta.com?utm_source=partner-litellm&utm_medium=website) |

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key
```

## 지원 모델 {#supported-models}

:::info
여기에 나열된 모든 모델 https://llama.developer.meta.com/docs/models/ 을 지원합니다. 모델 목록, 토큰 윈도우 등은 [여기](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 적극적으로 관리하고 있습니다.

:::


| 모델 ID | 입력 컨텍스트 길이 | 출력 컨텍스트 길이 | 입력 모달리티 | 출력 모달리티 |
| --- | --- | --- | --- | --- |
| `Llama-4-Scout-17B-16E-Instruct-FP8` | 128k | 4028 | Text, Image | Text |
| `Llama-4-Maverick-17B-128E-Instruct-FP8` | 128k | 4028 | Text, Image | Text |
| `Llama-3.3-70B-Instruct` | 128k | 4028 | Text | Text |
| `Llama-3.3-8B-Instruct` | 128k | 4028 | Text | Text |

## 사용법 - LiteLLM Python SDK

### 비스트리밍 {#non-streaming}

```python showLineNumbers title="Meta Llama Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Meta Llama call
response = completion(model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8", messages=messages)
```

### 스트리밍 {#streaming}

```python showLineNumbers title="Meta Llama Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Meta Llama call with streaming
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 함수 호출 {#function-calling}

```python showLineNumbers title="Meta Llama Function Calling"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "What's the weather like in San Francisco?", "role": "user"}]

# Define the function
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
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
]

# Meta Llama call with function calling
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

### 도구 사용 {#tool-use}

```python showLineNumbers title="Meta Llama Tool Use"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Create a chart showing the population growth of New York City from 2010 to 2020", "role": "user"}]

# Define the tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "create_chart",
            "description": "Create a chart with the provided data",
            "parameters": {
                "type": "object",
                "properties": {
                    "chart_type": {
                        "type": "string",
                        "enum": ["bar", "line", "pie", "scatter"],
                        "description": "The type of chart to create"
                    },
                    "title": {
                        "type": "string",
                        "description": "The title of the chart"
                    },
                    "data": {
                        "type": "object",
                        "description": "The data to plot in the chart"
                    }
                },
                "required": ["chart_type", "title", "data"]
            }
        }
    }
]

# Meta Llama call with tool use
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.content)
```

## 사용법 - LiteLLM Proxy


LiteLLM Proxy 설정 파일에 다음 내용을 추가하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: meta_llama/Llama-3.3-70B-Instruct
    litellm_params:
      model: meta_llama/Llama-3.3-70B-Instruct
      api_key: os.environ/LLAMA_API_KEY

  - model_name: meta_llama/Llama-3.3-8B-Instruct
    litellm_params:
      model: meta_llama/Llama-3.3-8B-Instruct
      api_key: os.environ/LLAMA_API_KEY
```

LiteLLM Proxy 서버를 시작하세요.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Meta Llama via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=[{"role": "user", "content": "Write a short poem about AI."}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Meta Llama via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Meta Llama via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/meta_llama/Llama-3.3-70B-Instruct",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Meta Llama via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/meta_llama/Llama-3.3-70B-Instruct",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Meta Llama via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "meta_llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Write a short poem about AI."}]
  }'
```

```bash showLineNumbers title="Meta Llama via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "meta_llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Write a short poem about AI."}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 대한 자세한 내용은 [LiteLLM Proxy 문서](../providers/litellm_proxy)을 참조하세요.
