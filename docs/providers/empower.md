# Empower
LiteLLM은 Empower의 모든 모델을 지원합니다.

## API 키 {#api-keys}

```python 
import os 
os.environ["EMPOWER_API_KEY"] = "your-api-key"
```
## 예제 사용법 {#example-usage}

```python
from litellm import completion 
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

response = completion(model="empower/empower-functions", messages=messages)
print(response)
```

## 예제 사용법 - 스트리밍 {#example-usage---streaming}
```python
from litellm import completion 
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Write me a poem about the blue sky"}]

response = completion(model="empower/empower-functions", messages=messages, streaming=True)
for chunk in response:
    print(chunk['choices'][0]['delta'])

```

## 예제 사용법 - 자동 도구 호출 {#example-usage---automatic-tool-calling}

```python
from litellm import completion 
import os

os.environ["EMPOWER_API_KEY"] = "your-api-key"

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

response = completion(
    model="empower/empower-functions-small",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response:\n", response)
```

## Empower 모델
liteLLM은 https://empower.dev/ 의 모든 모델에 대해 `non-streaming` 및 `streaming` 요청을 지원합니다.

Empower 사용 예시 - 참고: liteLLM은 Empower에 배포된 모든 모델을 지원합니다.


### Empower LLM - 자동 도구 사용 모델 {#empower-llms---automatic-tool-using-models}
| 모델 이름                        | 함수 호출                                                          | 필수 OS 변수           |
|-----------------------------------|------------------------------------------------------------------------|---------------------------------|
| `empower/empower-functions`  | `completion('empower/empower-functions', messages)`            | `os.environ['TOGETHERAI_API_KEY']` |
| `empower/empower-functions-small`  | `completion('empower/empower-functions-small', messages)`            | `os.environ['TOGETHERAI_API_KEY']` |
