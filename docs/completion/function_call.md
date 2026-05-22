# Function Calling

## 모델의 function calling 지원 여부 확인

`litellm.supports_function_calling(model="")`를 사용하면 모델이 Function calling을 지원하는 경우 `True`, 지원하지 않는 경우 `False`를 반환합니다.

```python
assert litellm.supports_function_calling(model="gpt-3.5-turbo") == True
assert litellm.supports_function_calling(model="azure/gpt-4-1106-preview") == True
assert litellm.supports_function_calling(model="palm/chat-bison") == False
assert litellm.supports_function_calling(model="xai/grok-2-latest") == True
assert litellm.supports_function_calling(model="ollama/llama2") == False
```


## 모델의 parallel function calling 지원 여부 확인

`litellm.supports_parallel_function_calling(model="")`를 사용하면 모델이 parallel function calling을 지원하는 경우 `True`, 지원하지 않는 경우 `False`를 반환합니다.

```python
assert litellm.supports_parallel_function_calling(model="gpt-4-turbo-preview") == True
assert litellm.supports_parallel_function_calling(model="gpt-4") == False
```
## 병렬 Function calling {#parallel-function-calling}
Parallel function calling은 모델이 여러 function call을 함께 수행할 수 있는 기능이며, 각 function call의 효과와 결과를 병렬로 처리할 수 있게 합니다.

## 빠른 시작 - gpt-3.5-turbo-1106
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/Parallel_function_calling.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Colab에서 열기"/>
</a>

이 예제에서는 단일 함수 `get_current_weather`를 정의합니다.

- 1단계: 사용자 질문과 함께 `get_current_weather`를 모델에 보냅니다.
- 2단계: 모델 응답의 출력을 파싱하고, 모델이 제공한 인수로 `get_current_weather`를 실행합니다.
- 3단계: `get_current_weather` 함수 실행 결과를 모델에 보냅니다.


### 전체 코드 - `gpt-3.5-turbo-1106`을 사용한 병렬 function calling

```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request

# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})


def test_parallel_function_call():
    try:
        # Step 1: send the conversation and available functions to the model
        messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
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
        response = litellm.completion(
            model="gpt-3.5-turbo-1106",
            messages=messages,
            tools=tools,
            tool_choice="auto",  # auto is default, but we'll be explicit
        )
        print("\nFirst LLM Response:\n", response)
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        print("\nLength of tool calls", len(tool_calls))

        # Step 2: check if the model wanted to call a function
        if tool_calls:
            # Step 3: call the function
            # Note: the JSON response may not always be valid; be sure to handle errors
            available_functions = {
                "get_current_weather": get_current_weather,
            }  # only one function in this example, but you can have multiple
            messages.append(response_message)  # extend conversation with assistant's reply

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
            second_response = litellm.completion(
                model="gpt-3.5-turbo-1106",
                messages=messages,
            )  # get a new response from the model where it can see the function response
            print("\nSecond LLM response:\n", second_response)
            return second_response
    except Exception as e:
      print(f"Error occurred: {e}")

test_parallel_function_call()
```

### 설명 - Parallel function calling
아래는 `gpt-3.5-turbo-1106`을 사용한 Parallel function calling 코드 스니펫에서 어떤 일이 일어나는지에 대한 설명입니다.
### 1단계: `tools`를 `get_current_weather`로 설정한 litellm.completion()
```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
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

response = litellm.completion(
    model="gpt-3.5-turbo-1106",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
```

##### 예상 출력
출력에서 모델이 San Francisco, Tokyo, Paris에 대해 함수를 여러 번 호출하는 것을 볼 수 있습니다.
```json
ModelResponse(
  id='chatcmpl-8MHBKZ9t6bXuhBvUMzoKsfmmlv7xq', 
  choices=[
    Choices(finish_reason='tool_calls', 
    index=0, 
    message=Message(content=None, role='assistant', 
      tool_calls=[
        ChatCompletionMessageToolCall(id='call_DN6IiLULWZw7sobV6puCji1O', function=Function(arguments='{"location": "San Francisco", "unit": "celsius"}', name='get_current_weather'), type='function'), 

        ChatCompletionMessageToolCall(id='call_ERm1JfYO9AFo2oEWRmWUd40c', function=Function(arguments='{"location": "Tokyo", "unit": "celsius"}', name='get_current_weather'), type='function'), 
        
        ChatCompletionMessageToolCall(id='call_2lvUVB1y4wKunSxTenR0zClP', function=Function(arguments='{"location": "Paris", "unit": "celsius"}', name='get_current_weather'), type='function')
        ]))
    ], 
    created=1700319953, 
    model='gpt-3.5-turbo-1106', 
    object='chat.completion', 
    system_fingerprint='fp_eeff13170a',
    usage={'completion_tokens': 77, 'prompt_tokens': 88, 'total_tokens': 165}, 
    _response_ms=1177.372
)
```

### 2단계 - 모델 응답 파싱 및 함수 실행
초기 요청을 보낸 후 모델 응답을 파싱하여 모델이 수행하려는 function call을 식별합니다. 이 예제에서는 각 위치(San Francisco, Tokyo, Paris)에 해당하는 세 개의 tool call을 예상합니다.

```python
# Check if the model wants to call a function
if tool_calls:
    # Execute the functions and prepare responses
    available_functions = {
        "get_current_weather": get_current_weather,
    }

    messages.append(response_message)  # Extend conversation with assistant's reply

    for tool_call in tool_calls:
      print(f"\nExecuting tool call\n{tool_call}")
      function_name = tool_call.function.name
      function_to_call = available_functions[function_name]
      function_args = json.loads(tool_call.function.arguments)
      # calling the get_current_weather() function
      function_response = function_to_call(
          location=function_args.get("location"),
          unit=function_args.get("unit"),
      )
      print(f"Result from tool call\n{function_response}\n")

      # Extend conversation with function response
      messages.append(
          {
              "tool_call_id": tool_call.id,
              "role": "tool",
              "name": function_name,
              "content": function_response,
          }
      )

```

### 3단계 - 두 번째 litellm.completion() 호출
함수가 실행되면 각 function call과 해당 응답에 대한 정보를 모델에 보냅니다. 이렇게 하면 모델이 function call의 결과를 고려하여 새 응답을 생성할 수 있습니다.
```python
second_response = litellm.completion(
    model="gpt-3.5-turbo-1106",
    messages=messages,
)
print("Second Response\n", second_response)
```

#### 예상 출력
```json
ModelResponse(
  id='chatcmpl-8MHBLh1ldADBP71OrifKap6YfAd4w', 
  choices=[
    Choices(finish_reason='stop', index=0, 
    message=Message(content="The current weather in San Francisco is 72°F, in Tokyo it's 10°C, and in Paris it's 22°C.", role='assistant'))
  ], 
  created=1700319955, 
  model='gpt-3.5-turbo-1106', 
  object='chat.completion', 
  system_fingerprint='fp_eeff13170a', 
  usage={'completion_tokens': 28, 'prompt_tokens': 169, 'total_tokens': 197}, 
  _response_ms=1032.431
)
```

## 병렬 Function Calling - Azure OpenAI {#parallel-function-calling---azure-openai}
```python
# set Azure env variables
import os
os.environ['AZURE_API_KEY'] = "" # litellm reads AZURE_API_KEY from .env and sends the request
os.environ['AZURE_API_BASE'] = "https://openai-gpt-4-test-v-1.openai.azure.com/"
os.environ['AZURE_API_VERSION'] = "2023-07-01-preview"

import litellm
import json
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

## Step 1: send the conversation and available functions to the model
messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
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

response = litellm.completion(
    model="azure/chatgpt-functioncalling", # model = azure/<your-azure-deployment-name>
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
print("\nTool Choice:\n", tool_calls)

## Step 2 - Parse the Model Response and Execute Functions
# Check if the model wants to call a function
if tool_calls:
    # Execute the functions and prepare responses
    available_functions = {
        "get_current_weather": get_current_weather,
    }

    messages.append(response_message)  # Extend conversation with assistant's reply

    for tool_call in tool_calls:
      print(f"\nExecuting tool call\n{tool_call}")
      function_name = tool_call.function.name
      function_to_call = available_functions[function_name]
      function_args = json.loads(tool_call.function.arguments)
      # calling the get_current_weather() function
      function_response = function_to_call(
          location=function_args.get("location"),
          unit=function_args.get("unit"),
      )
      print(f"Result from tool call\n{function_response}\n")

      # Extend conversation with function response
      messages.append(
          {
              "tool_call_id": tool_call.id,
              "role": "tool",
              "name": function_name,
              "content": function_response,
          }
      )

## Step 3 - Second litellm.completion() call
second_response = litellm.completion(
    model="azure/chatgpt-functioncalling",
    messages=messages,
)
print("Second Response\n", second_response)
print("Second Response Message\n", second_response.choices[0].message.content)

```

## 지원 중단됨 - `completion(functions=functions)`를 사용한 Function Calling
```python
import os, litellm
from litellm import completion

os.environ['OPENAI_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

# python function that will get executed
def get_current_weather(location):
  if location == "Boston, MA":
    return "The weather is 12F"

# JSON Schema to pass to OpenAI
functions = [
    {
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
  ]

response = completion(model="gpt-3.5-turbo-0613", messages=messages, functions=functions)
print(response)
```

## litellm.function_to_dict - OpenAI function calling용 딕셔너리로 함수 변환
`function_to_dict`를 사용하면 함수 docstring을 전달하여 OpenAI function calling에 사용할 수 있는 딕셔너리를 생성할 수 있습니다.

### `function_to_dict` 사용
1. 함수 `get_current_weather`를 정의합니다.
2. 함수 `get_current_weather`에 docstring을 추가합니다.
3. 함수를 `litellm.utils.function_to_dict`에 전달하여 OpenAI function calling용 딕셔너리를 가져옵니다.

```python
# function with docstring
def get_current_weather(location: str, unit: str):
        """Get the current weather in a given location

        Parameters
        ----------
        location : str
            The city and state, e.g. San Francisco, CA
        unit : {'celsius', 'fahrenheit'}
            Temperature unit

        Returns
        -------
        str
            a sentence indicating the weather
        """
        if location == "Boston, MA":
            return "The weather is 12F"

# use litellm.utils.function_to_dict to convert function to dict
function_json = litellm.utils.function_to_dict(get_current_weather)
print(function_json)
```

#### function_to_dict 출력
```json
{
    'name': 'get_current_weather', 
    'description': 'Get the current weather in a given location', 
    'parameters': {
        'type': 'object', 
        'properties': {
            'location': {'type': 'string', 'description': 'The city and state, e.g. San Francisco, CA'}, 
            'unit': {'type': 'string', 'description': 'Temperature unit', 'enum': "['fahrenheit', 'celsius']"}
        }, 
        'required': ['location', 'unit']
    }
}
```

### Function calling과 함께 function_to_dict 사용
```python
import os, litellm
from litellm import completion

os.environ['OPENAI_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

def get_current_weather(location: str, unit: str):
    """Get the current weather in a given location

    Parameters
    ----------
    location : str
        The city and state, e.g. San Francisco, CA
    unit : str {'celsius', 'fahrenheit'}
        Temperature unit

    Returns
    -------
    str
        a sentence indicating the weather
    """
    if location == "Boston, MA":
        return "The weather is 12F"

functions = [litellm.utils.function_to_dict(get_current_weather)]

response = completion(model="gpt-3.5-turbo-0613", messages=messages, functions=functions)
print(response)
```

## function-calling을 지원하지 않는 모델의 Function calling

### 프롬프트에 함수 추가
function calling을 지원하지 않는 모델/provider의 경우, LiteLLM은 함수가 프롬프트에 추가되도록 설정할 수 있습니다: `litellm.add_function_to_prompt = True`

#### 사용법
```python
import os, litellm
from litellm import completion

# IMPORTANT - Set this to TRUE to add the function to the prompt for Non OpenAI LLMs
litellm.add_function_to_prompt = True # set add_function_to_prompt for Non OpenAI LLMs

os.environ['ANTHROPIC_API_KEY'] = ""

messages = [
    {"role": "user", "content": "What is the weather like in Boston?"}
]

def get_current_weather(location):
  if location == "Boston, MA":
    return "The weather is 12F"

functions = [
    {
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
  ]

response = completion(model="claude-2", messages=messages, functions=functions)
print(response)
```
