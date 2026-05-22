import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🆕 `OVHCloud AI Endpoints`
데이터 주권과 개인정보 보호를 중시하는 유럽의 대표적인 프랑스 cloud provider입니다.

최근 제공되는 모델은 [catalog](https://endpoints.ai.cloud.ovh.net/catalog)에서 확인할 수 있습니다.

:::tip

모든 `OVHCloud AI Endpoints` 모델을 지원합니다. LiteLLM request를 보낼 때 `model=ovhcloud/<any-model-on-ai-endpoints>` prefix만 설정하세요.
전체 모델 catalog는 https://endpoints.ai.cloud.ovh.net/catalog 에서 확인할 수 있습니다.

:::

## 샘플 사용법 {#sample-usage}
### Chat completion {#chat-completion}
`OVHCLOUD_API_KEY` environment variable을 설정하거나 `api_key` parameter를 override해 API key를 지정할 수 있습니다. key는 [OVHCloud Manager](https://www.ovh.com/manager)에서 생성할 수 있습니다.

```python
from litellm import completion
import os

# Our API is free but ratelimited for calls without an API key.
os.environ['OVHCLOUD_API_KEY'] = "your-api-key"

response = completion(
    model = "ovhcloud/Meta-Llama-3_3-70B-Instruct",
    messages = [
        {
            "role": "user",
            "content": "Hello, how are you?",
        }
    ],
    max_tokens = 10,
    stop = [],
    temperature = 0.2,
    top_p = 0.9,
    user = "user",
    api_key = "your-api-key" # Optional if set through the enviromnent variable.
)

print(response)
```

### Streaming {#streaming}
response를 streaming하려면 `stream` parameter를 `True`로 설정하세요.
```python
from litellm import completion
import os

os.environ['OVHCLOUD_API_KEY'] = "your-api-key"

response = completion(
    model = "ovhcloud/Meta-Llama-3_3-70B-Instruct",
    messages = [
        {
            "role": "user",
            "content": "Hello, how are you?",
        }
    ],
    max_tokens = 10,
    stop = [],
    temperature = 0.2,
    top_p = 0.9,
    user = "user",
    api_key = "your-api-key" # Optional if set through the enviromnent variable,
    stream = True
)

for part in response:
    print(response)
```

### 도구 호출

```python
from litellm import completion
import json

def get_current_weather(location, unit="celsius"):
    if unit == "celsius":
        return {"location": location, "temperature": "22", "unit": "celsius"}
    else:
        return {"location": location, "temperature": "72", "unit": "fahrenheit"}

def print_message(role, content, is_tool_call=False, function_name=None):
    if role == "user":
        print(f"🧑 User: {content}")
    elif role == "assistant":
        if is_tool_call:
            print(f"🤖 Assistant: I will call the function '{function_name}' to get some informations.")
        else:
            print(f"🤖 Assistant: {content}")
    elif role == "tool":
        print(f"🔧 Tool ({function_name}): {content}")
    print()

messages = [{"role": "user", "content": "What's the weather like in Paris?"}]
model = "ovhcloud/Meta-Llama-3_3-70B-Instruct"

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
                        "description": "The city and country, e.g. Montréal, Canada",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

print("🌟 Beginning of the conversation")

# Initial user message
print_message("user", messages[0]["content"])

# First request to the model
print("📡 Sending first request to the model...")
response = completion(
    model=model,
    messages=messages,
    tools=tools,
    tool_choice="auto",
)

response_message = response.choices[0].message
tool_calls = response_message.tool_calls

if tool_calls:
    available_functions = {
        "get_current_weather": get_current_weather,
    }
    
    # Display the tool calls suggested by the model
    for tool_call in tool_calls:
        print_message("assistant", "", is_tool_call=True, function_name=tool_call.function.name)
        print(f"   📋 Arguments: {tool_call.function.arguments}")
        print()
    
    # Add assistant message with tool calls to the conversation history
    assistant_message = {
        "role": "assistant",
        "content": response_message.content,
        "tool_calls": [
            {
                "id": tool_call.id,
                "type": "function", 
                "function": {
                    "name": tool_call.function.name,
                    "arguments": tool_call.function.arguments
                }
            } for tool_call in tool_calls
        ]
    }
    
    messages.append(assistant_message)
    
    # Execute each tool call and add the results to the conversation history
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_to_call = available_functions[function_name]
        function_args = json.loads(tool_call.function.arguments)
        
        print(f"🔧 Executing function '{function_name}'...")
        function_response = function_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )
        
        # Display tool response
        print_message("tool", json.dumps(function_response, indent=2), function_name=function_name)
        
        messages.append({
            "tool_call_id": tool_call.id,
            "role": "tool",
            "name": function_name,
            "content": json.dumps(function_response),
        })
    
    print("📡 Sending second request to the model with results...")
    
    # Second request with function results
    second_response = completion(
        model=model,
        messages=messages
    )
    
    # Display final response
    final_content = second_response.choices[0].message.content
    print_message("assistant", final_content)
    
else:
    print("❌ No function call detected")
    print_message("assistant", response_message.content)
```

### Vision 예제 {#vision-example}

```python
from base64 import b64encode
from mimetypes import guess_type
import litellm

# Auxiliary function to get b64 images
def data_url_from_image(file_path):
    mime_type, _ = guess_type(file_path)
    if mime_type is None:
        raise ValueError("Could not determine MIME type of the file")

    with open(file_path, "rb") as image_file:
        encoded_string = b64encode(image_file.read()).decode("utf-8")

    data_url = f"data:{mime_type};base64,{encoded_string}"
    return data_url

response = litellm.completion(
    model = "ovhcloud/Mistral-Small-3.2-24B-Instruct-2506", 
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
                        "url": data_url_from_image("your_image.jpg"),
                        "format": "image/jpeg"
                    }
                }
            ]
        }
    ],
    stream=False
)

print(response.choices[0].message.content)
```


### Structured Output {#structured-output}

```python
from litellm import completion

response = completion(
    model="ovhcloud/Meta-Llama-3_3-70B-Instruct",
    messages=[
        {
            "role": "system",
            "content": (
                "You are a specialist in extracting structured data from unstructured text. "
                "Your task is to identify relevant entities and categories, then format them "
                "according to the requested structure."
            ),
        },
        {
            "role": "user",
            "content": "Room 12 contains books, a desk, and a lamp."
        },
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "title": "data",
            "name": "data_extraction",
            "schema": {
                "type": "object",
                "properties": {
                    "section": {"type": "string"},
                    "products": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["section", "products"],
                "additionalProperties": False
            },
            "strict": False
        }
    },
    stream=False
)

print(response.choices[0].message.content)
```

### Embeddings {#embeddings}

```python
from litellm import embedding

response = embedding(
    model="ovhcloud/BGE-M3",
    input=["sample text to embed", "another sample text to embed"]
)

print(response.data)
```

### 오디오 전사 {#audio-transcription}

```python
from litellm import transcription

audio_file = open("path/to/your/audio.wav", "rb")

response = transcription(
    model="ovhcloud/whisper-large-v3-turbo",
    file=audio_file
)

print(response.text)
```

## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 `OVHCloud AI Endpoints` 모델을 호출하는 방법은 다음과 같습니다.

1. `config.yaml` 수정

  ```yaml
  model_list:
    - model_name: my-model
      litellm_params:
        model: ovhcloud/<your-model-name>  # add ovhcloud/ prefix to route as OVHCloud provider
        api_key: api-key                   # api key to send your model
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
