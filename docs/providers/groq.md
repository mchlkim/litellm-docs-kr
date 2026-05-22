import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Groq
https://groq.com/

:::tip

**모든 Groq 모델을 지원합니다. LiteLLM 요청을 보낼 때 `model=groq/<any-model-on-groq>` 형식의 접두사만 설정하면 됩니다.**

:::

## API 키 {#api-key}
```python
# env variable
os.environ['GROQ_API_KEY']
```

## 샘플 사용법 {#sample-사용법}
```python
from litellm import completion
import os

os.environ['GROQ_API_KEY'] = ""
response = completion(
    model="groq/llama3-8b-8192", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-사용법---streaming}
```python
from litellm import completion
import os

os.environ['GROQ_API_KEY'] = ""
response = completion(
    model="groq/llama3-8b-8192", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```



## LiteLLM Proxy 사용법 {#사용법-with-litellm-proxy}

### 1. config.yaml에 Groq 모델 설정 {#1-set-groq-모델-on-configyaml}

```yaml
model_list:
  - model_name: groq-llama3-8b-8192 # Model Alias to use for requests
    litellm_params:
      model: groq/llama3-8b-8192
      api_key: "os.environ/GROQ_API_KEY" # ensure you have `GROQ_API_KEY` in your .env
```

### 2. Proxy 시작 {#2-start-proxy}

```
litellm --config config.yaml
```

### 3. 테스트 {#3-test-it}

LiteLLM Proxy로 요청을 보냅니다.

<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "groq-llama3-8b-8192",
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

response = client.chat.completions.create(model="groq-llama3-8b-8192", messages = [
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
    model = "groq-llama3-8b-8192",
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



## 지원 모델 - 모든 Groq 모델 지원 {#supported-모델---all-groq-모델-supported}
모든 Groq 모델을 지원합니다. completion 요청을 보낼 때 `groq/`를 접두사로 설정하면 됩니다.

| 모델 이름         | 사용법                                           |
|--------------------|---------------------------------------------------------|
| `llama-3.3-70b-versatile`     | `completion(model="groq/llama-3.3-70b-versatile", messages)`     |
| `llama-3.1-8b-instant`     | `completion(model="groq/llama-3.1-8b-instant", messages)`     |
| `meta-llama/llama-4-scout-17b-16e-instruct` | `completion(model="groq/meta-llama/llama-4-scout-17b-16e-instruct", messages)` |
| `meta-llama/llama-4-maverick-17b-128e-instruct` | `completion(model="groq/meta-llama/llama-4-maverick-17b-128e-instruct", messages)` |
| `meta-llama/llama-guard-4-12b` | `completion(model="groq/meta-llama/llama-guard-4-12b", messages)` |
| `qwen/qwen3-32b`       | `completion(model="groq/qwen/qwen3-32b", messages)`       |
| `moonshotai/kimi-k2-instruct-0905` | `completion(model="groq/moonshotai/kimi-k2-instruct-0905", messages)` |
| `openai/gpt-oss-120b` | `completion(model="groq/openai/gpt-oss-120b", messages)` |
| `openai/gpt-oss-20b` | `completion(model="groq/openai/gpt-oss-20b", messages)` |
| `openai/gpt-oss-safeguard-20b` | `completion(model="groq/openai/gpt-oss-safeguard-20b", messages)` |

## Groq - Tool / Function Calling 예제 {#groq---tool--function-calling-예제}

```python
# Example dummy function hard coded to return the current weather
import json
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps(
            {"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"}
        )
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})




# Step 1: send the conversation and available functions to the model
messages = [
    {
        "role": "system",
        "content": "You are a function calling LLM that uses the data extracted from get_current_weather to answer questions about the weather in San Francisco.",
    },
    {
        "role": "user",
        "content": "What's the weather like in San Francisco?",
    },
]
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
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        },
    }
]
response = litellm.completion(
    model="groq/llama3-8b-8192",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("Response\n", response)
response_message = response.choices[0].message
tool_calls = response_message.tool_calls


# Step 2: check if the model wanted to call a function
if tool_calls:
    # Step 3: call the function
    # Note: the JSON response may not always be valid; be sure to handle errors
    available_functions = {
        "get_current_weather": get_current_weather,
    }
    messages.append(
        response_message
    )  # extend conversation with assistant's reply
    print("Response message\n", response_message)
    # Step 4: send the info for each function call and function response to the model
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_to_call = available_functions[function_name]
        function_args = json.loads(tool_call.function.arguments)
        function_response = function_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )
        messages.append(
            {
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": function_response,
            }
        )  # extend conversation with function response
    print(f"messages: {messages}")
    second_response = litellm.completion(
        model="groq/llama3-8b-8192", messages=messages
    )  # get a new response from the model where it can see the function response
    print("second response\n", second_response)
```

## Groq - Vision 예제 {#groq---vision-예제}

Groq의 Llama 4 모델은 vision을 지원합니다. 자세한 내용은 [모델 목록](https://console.groq.com/docs/vision)을 확인하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["GROQ_API_KEY"] = "your-api-key"

response = completion(
    model = "groq/meta-llama/llama-4-scout-17b-16e-instruct",
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What's in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 Groq 모델을 추가합니다.

```yaml
model_list:
  - model_name: groq-llama3-8b-8192 # Model Alias to use for requests
    litellm_params:
      model: groq/llama3-8b-8192
      api_key: "os.environ/GROQ_API_KEY" # ensure you have `GROQ_API_KEY` in your .env
```

2. Proxy를 시작합니다.

```bash
litellm --config config.yaml
```

3. 테스트합니다.

```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # your litellm proxy api key
)

response = client.chat.completions.create(
    model = "gpt-4-vision-preview",  # use model="llava-hf" to test your custom OpenAI endpoint
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```
</TabItem>
</Tabs>

## 음성-텍스트 변환 - Whisper {#speech-to-text---whisper}

```python
os.environ["GROQ_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

transcript = litellm.transcription(
    model="groq/whisper-large-v3",
    file=audio_file,
    prompt="Specify context or spelling",
    temperature=0,
    response_format="json"
)

print("response=", transcript)
```
