import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lemonade

[Lemonade Server](https://lemonade-server.ai/)는 AMD GPU 및 NPU에 최적화된 OpenAI 호환 로컬 언어 모델 추론 provider입니다. `lemonade` LiteLLM provider는 OpenAI API와 완전히 호환되는 표준 chat completion을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | 로컬 및 클라우드 기반 언어 모델 추론을 위한 OpenAI 호환 AI provider |
| LiteLLM Provider Route | `lemonade/`(모델 이름 앞에 이 prefix를 추가합니다. 예: `lemonade/your-model-name`) |
| Provider API Endpoint | http://localhost:8000/api/v1(기본값) |
| 지원 엔드포인트 | `/chat/completions` |

## 지원되는 OpenAI 파라미터 {#supported-openai-parameters}

Lemonade는 OpenAI와 완전히 호환되며 다음 파라미터를 지원합니다.

```
"repeat_penalty"
"functions"
"logit_bias"
"max_tokens"
"max_completion_tokens"
"presence_penalty"
"stop"
"temperature"
"top_p"
"top_k"
"response_format"
"tools"
```


## API 키 설정 {#api-key-setup}

Lemonade는 custom API URL로 구성할 수 있으며 엄격한 API 키 검증이 필요하지 않습니다. base URL을 변경하려면 `LEMONADE_API_BASE` environment variable을 설정하세요.

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

# Optional: Set custom API base. Useful if your lemonade server is on
# a different port
os.environ['LEMONADE_API_BASE'] = "http://localhost:8000/api/v1"

response = completion(
    model="lemonade/your-model-name",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
)
print(response)
```

## Streaming {#streaming}

```python
from litellm import completion
import os

# Optional: Set custom API base. Useful if your lemonade server is on
# a different port
os.environ['LEMONADE_API_BASE'] = "http://localhost:8000/api/v1"

response = completion(
    model="lemonade/your-model-name",
    messages=[
       {"role": "user", "content": "Write a short story"}
   ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='', flush=True)
```

## 고급 사용법

### Custom Parameters {#custom-parameters}

Lemonade는 표준 OpenAI 세트 외의 추가 파라미터를 지원합니다.

```python
from litellm import completion

response = completion(
    model="lemonade/your-model-name",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    top_k=50,
    repeat_penalty=1.1,
    stop=["Human:", "AI:"]
)
print(response)
```

### 함수 호출 {#function-calling}

Lemonade는 OpenAI 호환 함수 호출을 지원합니다.

```python
from litellm import completion

functions = [
    {
        "name": "get_weather",
        "description": "Get current weather information",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state"
                }
            },
            "required": ["location"]
        }
    }
]

response = completion(
    model="lemonade/your-model-name",
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=[{"type": "function", "function": f} for f in functions],
    tool_choice="auto"
)
print(response)
```

### 응답 형식

Lemonade는 response format을 사용한 structured output을 지원합니다.

```python
from litellm import completion
import json

# Define schema in response_format
response = completion(
    model="lemonade/Qwen3-Coder-30B-A3B-Instruct-GGUF",
    messages=[{"role": "user", "content": "Generate JSON data for a person with their name, age, and city."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age"]
            }
        }
    }
)

print(f"Model: {response.model}")
print(f"JSON Output:")
json_data = json.loads(response.choices[0].message.content)
print(json.dumps(json_data, indent=2))
```

## 사용 가능한 모델 {#available-models}

Lemonade는 `/models` endpoint를 쿼리해 사용 가능한 모델을 자동으로 검증합니다. 사용 가능한 모델은 코드로도 확인할 수 있습니다.

```python
import httpx

api_base = "http://localhost:8000"  # or your custom base
response = httpx.get(f"{api_base}/api/v1/models")
models = response.json()
print("Available models:", [model['id'] for model in models.get('data', [])])
```

## 지원 {#support}

Lemonade에 대한 자세한 내용은 [Lemonade website](https://lemonade-server.ai/) 또는 [Lemonade repository](https://github.com/lemonade-sdk/lemonade)를 참고하세요.

</TabItem>
</Tabs>
