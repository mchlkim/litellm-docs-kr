import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 구조화된 출력 (JSON Mode) {#structured-outputs-json-mode}

## 빠른 시작 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os 

os.environ["OPENAI_API_KEY"] = ""

response = completion(
  model="gpt-4o-mini",
  response_format={ "type": "json_object" },
  messages=[
    {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
    {"role": "user", "content": "Who won the world series in 2020?"}
  ]
)
print(response.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant designed to output JSON."
      },
      {
        "role": "user",
        "content": "Who won the world series in 2020?"
      }
    ]
  }'
```
</TabItem>
</Tabs>

## 모델 지원 확인 {#check-model-support}


### 1. 모델이 `response_format`을 지원하는지 확인 {#1-check-if-model-supports-response_format}

모델/제공자가 `response_format`을 지원하는지 확인하려면 `litellm.get_supported_openai_params`를 호출하세요.

```python
from litellm import get_supported_openai_params

params = get_supported_openai_params(model="anthropic.claude-3", custom_llm_provider="bedrock")

assert "response_format" in params
```

### 2. 모델이 `json_schema`를 지원하는지 확인 {#2-check-if-model-supports-json_schema}

다음을 전달할 수 있는지 확인할 때 사용합니다.
- `response_format={ "type": "json_schema", "json_schema": … , "strict": true }`
- `response_format=<Pydantic Model>`

```python
from litellm import supports_response_schema

assert supports_response_schema(model="gemini-1.5-pro-preview-0215", custom_llm_provider="bedrock")
```

[model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 전체 모델 목록과 `response_schema` 지원 여부를 확인하세요.

## 'json_schema' 전달 {#pass-in-json_schema}

구조화된 출력을 사용하려면 다음만 지정하면 됩니다.

```
response_format: { "type": "json_schema", "json_schema": … , "strict": true }
```

지원 대상:
- OpenAI 모델
- Azure OpenAI 모델
- xAI 모델(Grok-2 이상)
- Google AI Studio - Gemini 모델
- Vertex AI 모델(Gemini + Anthropic)
- Bedrock 모델
- Anthropic API 모델
- Groq 모델
- Ollama 모델
- Databricks 모델

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion 
from pydantic import BaseModel

# add to env var 
os.environ["OPENAI_API_KEY"] = ""

messages = [{"role": "user", "content": "List 5 important events in the XIX century"}]

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

class EventsList(BaseModel):
    events: list[CalendarEvent]

resp = completion(
    model="gpt-4o-2024-08-06",
    messages=messages,
    response_format=EventsList
)

print("Received={}".format(resp))

events_list = EventsList.model_validate_json(resp.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 openai 모델 추가

```yaml
model_list:
  - model_name: "gpt-4o"
    litellm_params:
      model: "gpt-4o-2024-08-06"
```

2. config.yaml로 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. OpenAI SDK / Curl로 호출하세요!

OpenAI 모델에서 `json_schema`로 프록시를 호출하려면 openai sdk의 `base_url`만 바꾸면 됩니다.

**OpenAI SDK**
```python
from pydantic import BaseModel
from openai import OpenAI

client = OpenAI(
    api_key="anything", # 👈 PROXY KEY (can be anything, if master_key not set)
    base_url="http://0.0.0.0:4000" # 👈 PROXY BASE URL
)

class Step(BaseModel):
    explanation: str
    output: str

class MathReasoning(BaseModel):
    steps: list[Step]
    final_answer: str

completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor. Guide the user through the solution step by step."},
        {"role": "user", "content": "how can I solve 8x + 7 = -23"}
    ],
    response_format=MathReasoning,
)

math_reasoning = completion.choices[0].message.parsed
```

**Curl**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "math_reasoning",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```

</TabItem>
</Tabs>


## JSON Schema 검증 {#validate-json-schema}


모든 vertex 모델이 json_schema 전달을 지원하는 것은 아닙니다(예: `gemini-1.5-flash`). 이를 해결하기 위해 LiteLLM은 json schema의 클라이언트 측 검증을 지원합니다.

```
litellm.enable_json_schema_validation=True
```
`litellm.enable_json_schema_validation=True`가 설정되어 있으면 LiteLLM은 `jsonvalidator`를 사용해 json 응답을 검증합니다.

[**코드 보기**](https://github.com/BerriAI/litellm/blob/671d8ac496b6229970c7f2a3bdedd6cb84f0746b/litellm/litellm_core_utils/json_validation_rule.py#L4)


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# !gcloud auth application-default login - run this to add vertex credentials to your env
import litellm, os
from litellm import completion 
from pydantic import BaseModel 


messages=[
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ]

litellm.enable_json_schema_validation = True
litellm.set_verbose = True # see the raw request made by litellm

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

resp = completion(
    model="gemini/gemini-1.5-pro",
    messages=messages,
    response_format=CalendarEvent,
)

print("Received={}".format(resp))
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 생성
```yaml
model_list:
  - model_name: "gemini-1.5-flash"
    litellm_params:
      model: "gemini/gemini-1.5-flash"
      api_key: os.environ/GEMINI_API_KEY

litellm_settings:
  enable_json_schema_validation: True
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트하세요!

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [
        {"role": "system", "content": "Extract the event information."},
        {"role": "user", "content": "Alice and Bob are going to a science fair on Friday."},
    ],
    "response_format": { 
        "type": "json_schema",
        "json_schema": {
          "name": "math_reasoning",
          "schema": {
            "type": "object",
            "properties": {
              "steps": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "explanation": { "type": "string" },
                    "output": { "type": "string" }
                  },
                  "required": ["explanation", "output"],
                  "additionalProperties": false
                }
              },
              "final_answer": { "type": "string" }
            },
            "required": ["steps", "final_answer"],
            "additionalProperties": false
          },
          "strict": true
        }
    },
  }'
```

</TabItem>
</Tabs>

## Gemini - 네이티브 JSON Schema 형식 (Gemini 2.0+) {#gemini---native-json-schema-format-gemini-20}

Gemini 2.0+ 모델은 네이티브 `responseJsonSchema` 파라미터를 자동으로 사용하며, 이 파라미터는 표준 JSON Schema 형식과 더 나은 호환성을 제공합니다.

### 장점 (Gemini 2.0+) {#benefits-gemini-20}
- 표준 JSON Schema 형식(`string`, `object` 같은 소문자 타입)
- 더 엄격한 검증을 위한 `additionalProperties: false` 지원
- Pydantic의 `model_json_schema()`와 더 나은 호환성
- `propertyOrdering`이 필요 없음

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    age: int

response = completion(
    model="gemini/gemini-2.0-flash",
    messages=[{"role": "user", "content": "Extract: John is 25 years old"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"],
                "additionalProperties": False  # Supported on Gemini 2.0+
            }
        }
    }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
        {"role": "user", "content": "Extract: John is 25 years old"}
    ],
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"],
                "additionalProperties": false
            }
        }
    }
  }'
```

</TabItem>
</Tabs>

### 모델 동작 {#model-behavior}

| 모델 | 사용되는 형식 | `additionalProperties` 지원 |
|-------|-------------|-------------------------------|
| Gemini 2.0+ | `responseJsonSchema` (JSON Schema) | ✅ 예 |
| Gemini 1.5 | `responseSchema` (OpenAPI) | ❌ 아니요 |

LiteLLM은 모델 버전에 따라 적절한 형식을 자동으로 선택합니다.
