import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# VertexAI [Gemini]

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Vertex AI는 생성형 AI를 구축하고 사용하는 완전 관리형 AI 개발 플랫폼입니다. |
| LiteLLM provider 경로 | `vertex_ai/` |
| Provider 문서 링크 | [Vertex AI ↗](https://cloud.google.com/vertex-ai) |
| Base URL | 1. 리전 엔드포인트<br/>`https://{vertex_location}-aiplatform.googleapis.com/`<br/>2. 전역 엔드포인트(제한적 제공)<br/>`https://aiplatform.googleapis.com/`|
| 지원 작업 | [`/chat/completions`](#sample-usage), `/completions`, [`/embeddings`](/docs/providers/vertex#embedding-models), [`/audio/speech`](/docs/providers/vertex#text-to-speech-apis), [`/fine_tuning`](/docs/providers/vertex#fine-tuning-apis), [`/batches`](/docs/providers/vertex#batch-apis), [`/files`](/docs/providers/vertex#batch-apis), [`/images`](/docs/providers/vertex#image-generation-models), [`/rerank`](/docs/providers/vertex#rerank-api) |

:::tip Vertex AI와 Gemini API 비교
| 모델 형식 | Provider | 필요한 인증 |
|-------------|----------|---------------|
| `vertex_ai/gemini-2.0-flash` | Vertex AI | GCP 자격 증명 + project |
| `gemini-2.0-flash` (prefix 없음) | Vertex AI | GCP 자격 증명 + project |
| `gemini/gemini-2.0-flash` | Gemini API | `GEMINI_API_KEY`(단순 API key) |

**OpenAI처럼 API key만 사용하고 싶다면** `gemini/` prefix를 사용하세요. [Gemini - Google AI Studio](./gemini.md)를 참고하세요.

prefix가 없는 모델은 기본적으로 GCP 인증이 필요한 Vertex AI로 처리됩니다.
:::

<br />
<br />

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_VertextAI_예제.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## `vertex_ai/` 경로 {#vertex_ai-route}

`vertex_ai/` 경로는 [VertexAI REST API](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#syntax)를 사용합니다.

```python
from litellm import completion
import json 

## GET CREDENTIALS 
## RUN ## 
# !gcloud auth application-default login - run this to add vertex credentials to your env
## OR ## 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)

## COMPLETION CALL 
response = completion(
  model="vertex_ai/gemini-2.5-pro",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  vertex_credentials=vertex_credentials_json
)
```

### **시스템 메시지** {#system-message}

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


response = completion(
  model="vertex_ai/gemini-2.5-pro",
  messages=[{"content": "You are a good bot.","role": "system"}, {"content": "Hello, how are you?","role": "user"}], 
  vertex_credentials=vertex_credentials_json
)
```

### **함수 호출** {#function-calling}

`tool_choice="required"`로 Gemini가 tool call을 수행하도록 강제합니다.

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


messages = [
    {
        "role": "system",
        "content": "Your name is Litellm Bot, you are a helpful assistant",
    },
    # User asks for their name and weather in San Francisco
    {
        "role": "user",
        "content": "Hello, what is your name and can you tell me the weather?",
    },
]

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
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"],
            },
        },
    }
]

data = {
    "model": "vertex_ai/gemini-1.5-pro-preview-0514"),
    "messages": messages,
    "tools": tools,
    "tool_choice": "required",
    "vertex_credentials": vertex_credentials_json
}

## COMPLETION CALL 
print(completion(**data))
```

### **JSON Schema**

v`1.40.1+`부터 LiteLLM은 Vertex AI의 Gemini-1.5-Pro에 `response_schema`를 매개변수로 전송하는 방식을 지원합니다. 다른 모델(예: `gemini-1.5-flash`, `claude-3-5-sonnet`)에서는 LiteLLM이 사용자가 제어하는 prompt와 함께 schema를 message list에 추가합니다.

**Response schema**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

response_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }


completion(
    model="vertex_ai/gemini-1.5-pro", 
    messages=messages, 
    response_format={"type": "json_object", "response_schema": response_schema} # 👈 KEY CHANGE
    )

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: gemini-2.5-pro
    litellm_params:
      model: vertex_ai/gemini-2.5-pro
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json" # [OPTIONAL] Do this OR `!gcloud auth application-default login` - run this to add vertex credentials to your env
```
or
```yaml
model_list:
 - model_name: gemini-pro
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      litellm_credential_name: vertex-global
      vertex_project: project-name-here
      vertex_location: global
      base_model: gemini
      model_info:
        provider: Vertex
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. 요청 전송

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
  "model": "gemini-2.5-pro",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }}
}
'
```

</TabItem>
</Tabs>

**Schema 검증**

`response_schema`를 검증하려면 `enforce_validation: true`를 설정하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion, JSONSchemaValidationError
try: 
	completion(
    model="vertex_ai/gemini-1.5-pro", 
    messages=messages, 
    response_format={
        "type": "json_object", 
        "response_schema": response_schema,
        "enforce_validation": true # 👈 KEY CHANGE
    }
	)
except JSONSchemaValidationError as e: 
	print("Raw Response: {}".format(e.raw_response))
	raise e
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: gemini-2.5-pro
    litellm_params:
      model: vertex_ai/gemini-2.5-pro
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json" # [OPTIONAL] Do this OR `!gcloud auth application-default login` - run this to add vertex credentials to your env
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. 요청 전송

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
  "model": "gemini-2.5-pro",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object", "response_schema": { 
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "recipe_name": {
                    "type": "string",
                },
            },
            "required": ["recipe_name"],
        },
    }, 
    "enforce_validation": true
    }
}
'
```

</TabItem>
</Tabs>

LiteLLM은 response를 schema와 비교해 검증하고, response가 schema와 일치하지 않으면 `JSONSchemaValidationError`를 발생시킵니다.

`JSONSchemaValidationError`는 `openai.APIError`를 상속합니다.

원본 response는 `e.raw_response`로 접근할 수 있습니다.

**직접 prompt에 추가하기**

```python 
from litellm import completion 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)

messages = [
    {
        "role": "user",
        "content": """
List 5 popular cookie recipes.

Using this JSON schema:

    Recipe = {"recipe_name": str}

Return a `list[Recipe]`
        """
    }
]

completion(model="vertex_ai/gemini-1.5-flash-preview-0514", messages=messages, response_format={ "type": "json_object" })
```

### **Google 호스팅 도구(Web Search, Code Execution 등)** {#google-hosted-toolsweb-search-code-execution-etc}

#### **Web Search**

Vertex AI 호출에 Google Search Result grounding을 추가합니다.

[**관련 VertexAI 문서**](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/grounding#examples)

grounding metadata는 `response_obj._hidden_params["vertex_ai_grounding_metadata"]`로 확인할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

resp = litellm.completion(
                    model="vertex_ai/gemini-1.0-pro-001",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                )

print(resp)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="gemini-2.5-pro",
    messages=[{"role": "user", "content": "Who won the world cup?"}],
    tools=[{"googleSearch": {}}],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {"role": "user", "content": "Who won the world cup?"}
    ],
   "tools": [
        {
            "googleSearch": {} 
        }
    ]
  }'

```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **URL Context** {#url-context}
URL context 도구를 사용하면 prompt의 추가 context로 Gemini에 URL을 제공할 수 있습니다. 그러면 모델은 URL에서 content를 가져와 response를 구성하고 보강하는 데 사용할 수 있습니다.

[**관련 문서**](https://ai.google.dev/gemini-api/docs/url-context)

grounding metadata는 `response_obj._hidden_params["vertex_ai_url_context_metadata"]`로 확인할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

# 👇 ADD URL CONTEXT
tools = [{"urlContext": {}}]

response = completion(
    model="gemini/gemini-2.0-flash",
    messages=[{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    tools=tools,
)

print(response)

# Access URL context metadata
url_context_metadata = response.model_extra['vertex_ai_url_context_metadata']
urlMetadata = url_context_metadata[0]['urlMetadata'][0]
print(f"Retrieved URL: {urlMetadata['retrievedUrl']}")
print(f"Retrieval Status: {urlMetadata['urlRetrievalStatus']}")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정
```yaml
model_list:
  - model_name: gemini-2.0-flash
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작
```bash
$ litellm --config /path/to/config.yaml
```

3. 요청 전송
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "Summarize this document: https://ai.google.dev/gemini-api/docs/models"}],
    "tools": [{"urlContext": {}}]
  }'
```
</TabItem>
</Tabs>

#### **엔터프라이즈 Web Search** {#enterprise-web-search}

[enterprise compliant search](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/web-grounding-enterprise)를 위해 `enterpriseWebSearch` 도구도 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion 

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"enterpriseWebSearch": {}}] # 👈 ADD GOOGLE ENTERPRISE SEARCH

resp = litellm.completion(
                    model="vertex_ai/gemini-1.0-pro-001",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                )

print(resp)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="gemini-2.5-pro",
    messages=[{"role": "user", "content": "Who won the world cup?"}],
    tools=[{"enterpriseWebSearch": {}}],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {"role": "user", "content": "Who won the world cup?"}
    ],
   "tools": [
        {
            "enterpriseWebSearch": {} 
        }
    ]
  }'

```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **Code Execution** {#code-execution}



<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env


tools = [{"codeExecution": {}}] # 👈 ADD CODE EXECUTION

response = completion(
    model="vertex_ai/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-2.0-flash",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"codeExecution": {}}]
}
'
```

</TabItem>
</Tabs>





#### **Google Maps** {#google-maps}

Google Maps를 사용해 Gemini 모델에 위치 기반 context를 제공합니다.

[**관련 Vertex AI 문서**](https://ai.google.dev/gemini-api/docs/grounding#google-maps)

<Tabs>
<TabItem value="sdk" label="SDK">

**기본 사용법 - widget만 활성화**

```python showLineNumbers
from litellm import completion

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleMaps": {"enableWidget": "ENABLE_WIDGET"}}] # 👈 ADD GOOGLE MAPS

resp = litellm.completion(
    model="vertex_ai/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=tools,
)

print(resp)
```

**Location data 포함**

모델 response를 위치별 정보로 grounding하기 위해 location을 지정할 수 있습니다.

```python showLineNumbers
from litellm import completion

## SETUP ENVIRONMENT
# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{
    "googleMaps": {
        "enableWidget": "ENABLE_WIDGET",
        "latitude": 37.7749,        # San Francisco latitude
        "longitude": -122.4194,     # San Francisco longitude
        "languageCode": "en_US"     # Optional: language for results
    }
}] # 👈 ADD GOOGLE MAPS WITH LOCATION

resp = litellm.completion(
    model="vertex_ai/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=tools,
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

**기본 사용법 - widget만 활성화**

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=[{"googleMaps": {"enableWidget": "ENABLE_WIDGET"}}],
)

print(response)
```

**Location data 포함**

```python showLineNumbers
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000/v1/" # point to litellm proxy
)

response = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[{"role": "user", "content": "What restaurants are nearby?"}],
    tools=[{
        "googleMaps": {
            "enableWidget": "ENABLE_WIDGET",
            "latitude": 37.7749,        # San Francisco latitude
            "longitude": -122.4194,     # San Francisco longitude
            "languageCode": "en_US"     # Optional: language for results
        }
    }],
)

print(response)
```
</TabItem>
<TabItem value="curl" label="cURL">

**기본 사용법 - widget만 활성화**

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "What restaurants are nearby?"}
    ],
   "tools": [
        {
            "googleMaps": {"enableWidget": "ENABLE_WIDGET"}
        }
    ]
  }'
```

**Location data 포함**

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {"role": "user", "content": "What restaurants are nearby?"}
    ],
   "tools": [
        {
            "googleMaps": {
                "enableWidget": "ENABLE_WIDGET",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "languageCode": "en_US"
            }
        }
    ]
  }'
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>

#### **Vertex AI SDK에서 LiteLLM으로 이동(GROUNDING)** {#moving-from-vertex-ai-sdk-to-litellmgrounding}


기존 VertexAI Grounding code가 다음과 같았다면,

```python
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig, Tool, grounding


vertexai.init(project=project_id, location="us-central1")

model = GenerativeModel("gemini-1.5-flash-001")

# Use Google Search for grounding
tool = Tool.from_google_search_retrieval(grounding.GoogleSearchRetrieval())

prompt = "When is the next total solar eclipse in US?"
response = model.generate_content(
    prompt,
    tools=[tool],
    generation_config=GenerationConfig(
        temperature=0.0,
    ),
)

print(response)
```

이제 LiteLLM에서는 다음처럼 작성합니다.

```python
from litellm import completion


# !gcloud auth application-default login - run this to add vertex credentials to your env

tools = [{"googleSearch": {"disable_attributon": False}}] # 👈 ADD GOOGLE SEARCH

resp = litellm.completion(
                    model="vertex_ai/gemini-1.0-pro-001",
                    messages=[{"role": "user", "content": "Who won the world cup?"}],
                    tools=tools,
                    vertex_project="project-id"
                )

print(resp)
```


<span id="thinking--reasoning_content"></span>

### **Thinking / `reasoning_content`** {#usage---thinking--reasoning_content}

LiteLLM은 OpenAI의 `reasoning_effort`를 Gemini의 `thinking` 매개변수로 변환합니다. [Code](https://github.com/BerriAI/litellm/blob/620664921902d7a9bfb29897a7b27c1a7ef4ddfb/litellm/llms/vertex_ai/gemini/vertex_and_google_ai_studio_gemini.py#L362)

reasoning을 사용하지 않는 Gemini request를 위해 OpenAI 표준이 아닌 추가 `"disable"` 값을 제공합니다.

**매핑**

| reasoning_effort | thinking |
| ---------------- | -------- |
| "disable"        | "budget_tokens": 0    |
| "low"            | "budget_tokens": 1024 |
| "medium"         | "budget_tokens": 2048 |
| "high"           | "budget_tokens": 4096 |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# !gcloud auth application-default login - run this to add vertex credentials to your env

resp = completion(
    model="vertex_ai/gemini-2.5-flash-preview-04-17",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
    vertex_project="project-id",
    vertex_location="us-central1"
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: gemini-2.5-flash
  litellm_params:
    model: vertex_ai/gemini-2.5-flash-preview-04-17
    vertex_credentials: {"project_id": "project-id", "location": "us-central1", "project_key": "project-key"}
    vertex_project: "project-id"
    vertex_location: "us-central1"
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>


**예상 response**

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
                reasoning_content='The capital of France is Paris. This is a very straightforward factual question.'
            ),
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

#### Gemini 모델에 `thinking` 전달

Gemini 모델에 `thinking` 매개변수를 직접 전달할 수도 있습니다.

이 값은 Gemini의 [`thinkingConfig` 매개변수](https://ai.google.dev/gemini-api/docs/thinking#set-budget)로 변환됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# !gcloud auth application-default login - run this to add vertex credentials to your env

response = litellm.completion(
  model="vertex_ai/gemini-2.5-flash-preview-04-17",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  thinking={"type": "enabled", "budget_tokens": 1024},
  vertex_project="project-id",
  vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "vertex_ai/gemini-2.5-flash-preview-04-17",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>


### **Context 캐싱** {#context-caching}

#### 통합 엔드포인트 {#unified-endpoint}

Vertex AI context caching은 [**Google AI Studio - Context 캐싱**](../providers/gemini.md#context-caching)과 같은 방식으로 사용할 수 있습니다.


##### 사용 예제 {#example-usage}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

for _ in range(2): 
    resp = completion(
        model="vertex_ai/gemini-2.5-pro",
        messages=[
        # System Message
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the full text of a complex legal agreement" * 4000,
                        "cache_control": {"type": "ephemeral"}, # 👈 KEY CHANGE
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
            }]
    )

    print(resp.usage) # 👈 2nd usage block will be less, since cached tokens used
```

</TabItem>
<TabItem value="sdk-ttl" label="SDK with Custom TTL">

```python
from litellm import completion 

# Cache for 2 hours (7200 seconds)
resp = completion(
    model="vertex_ai/gemini-2.5-pro",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral", 
                        "ttl": "7200s"  # 👈 Cache for 2 hours
                    },
                }
            ],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "3600s"  # 👈 This TTL will be ignored (first one is used)
                    },
                }
            ],
        }
    ]
)

print(resp.usage)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gemini-2.5-pro
    litellm_params:
      model: vertex_ai/gemini-2.5-pro
      vertex_project: "project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash

curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gemini-2.5-flash",
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Long cache message (must be >= 1024 tokens)",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "7200s"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is the text about?"
                }
            ]
        }
    ]
}'

```

</TabItem>
</Tabs>

#### Provider API 직접 호출 {#direct-provider-api-calls}

[**Provider로 바로 전달**](../pass_through/vertex_ai.md#context-caching)

##### 1. Cache 생성 {#1-create-cache}

먼저 LiteLLM proxy를 통해 `cachedContents` endpoint로 `POST` 요청을 보내 cache를 생성합니다.

<Tabs>
<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/vertex_ai/v1/projects/{project_id}/locations/{location}/cachedContents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "projects/{project_id}/locations/{location}/publishers/google/models/gemini-2.5-flash",
    "displayName": "example_cache",
    "contents": [{
      "role": "user",
      "parts": [{
        "text": ".... a long book to be cached"
      }]
    }]
  }'
```

</TabItem>
</Tabs>

##### 2. Response에서 cache name 가져오기 {#2-get-cache-name-from-response}

Vertex AI는 cached content의 `name`을 포함한 response를 반환합니다. 이 name은 cached data의 identifier입니다.

```json
{
    "name": "projects/12341234/locations/{location}/cachedContents/123123123123123",
    "model": "projects/{project_id}/locations/{location}/publishers/google/models/gemini-2.5-flash",
    "createTime": "2025-09-23T19:13:50.674976Z",
    "updateTime": "2025-09-23T19:13:50.674976Z",
    "expireTime": "2025-09-23T20:13:50.655988Z",
    "displayName": "example_cache",
    "usageMetadata": {
        "totalTokenCount": 1246,
        "textCount": 5132
    }
}
```

##### 3. Cached content 사용 {#3-use-cached-content}

후속 API 호출에서 cached information을 재사용하려면 response의 `name`을 `cachedContent` 또는 `cached_content`로 사용하세요. 이 값은 `/chat/completions` request body에 전달됩니다.

<Tabs>
<TabItem value="proxy" label="PROXY">

```bash

curl http://0.0.0.0:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "cachedContent": "projects/545201925769/locations/us-central1/cachedContents/4511135542628319232",
    "model": "gemini-2.5-flash",
    "messages": [
        {
            "role": "user",
            "content": "what is the book about?"
        }
    ]
  }'
```

</TabItem>
</Tabs>

## 사전 요구 사항
* `uv add google-cloud-aiplatform`(proxy docker image에는 미리 설치됨)
* 인증: 
    * `gcloud auth application-default login`을 실행하세요. [Google Cloud 문서](https://cloud.google.com/docs/authentication/external/set-up-adc)를 참고하세요.
    * 또는 `GOOGLE_APPLICATION_CREDENTIALS`를 설정할 수 있습니다.

    방법: [**코드로 이동**](#extra)

      - GCP에서 service account를 생성합니다.
      - credentials를 json으로 export합니다.
      - json을 load하고 `json.dump`로 string으로 변환합니다.
      - json string을 `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수로 저장합니다.

## 사용 예제 {#sample-usage}
```python
import litellm
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = litellm.completion(model="gemini-2.5-pro", messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}])
```

## LiteLLM Proxy Server와 함께 사용 {#using-with-litellm-proxy-server}

LiteLLM Proxy Server로 Vertex AI를 사용하는 방법입니다.

1. config.yaml 수정

  <Tabs>

  <TabItem value="completion_param" label="모델별로 다른 location">

  각 Vertex 모델마다 다른 location을 설정해야 할 때 사용하세요.

  ```yaml
  model_list:
    - model_name: gemini-vision
      litellm_params:
        model: vertex_ai/gemini-1.0-pro-vision-001
        vertex_project: "project-id"
        vertex_location: "us-central1"
    - model_name: gemini-vision
      litellm_params:
        model: vertex_ai/gemini-1.0-pro-vision-001
        vertex_project: "project-id2"
        vertex_location: "us-east"
  ```

  </TabItem>

  <TabItem value="litellm_param" label="모든 Vertex 모델에 하나의 location">

  모든 모델에 하나의 Vertex location을 사용할 때 사용하세요.

  ```yaml
  litellm_settings: 
    vertex_project: "hardy-device-38811" # Your Project ID
    vertex_location: "us-central1" # proj location

  model_list: 
    -model_name: team1-gemini-2.5-pro
    litellm_params: 
      model: gemini-2.5-pro
  ```

  </TabItem>

  </Tabs>

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
      model="team1-gemini-2.5-pro",
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
      "model": "team1-gemini-2.5-pro",
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


## 인증 - vertex_project, vertex_location 등 {#auth---vertex_project-vertex_location-etc}

Vertex credentials는 다음 방식으로 설정할 수 있습니다.
- 동적 매개변수
또는
- 환경 변수 


### **동적 매개변수** {#dynamic-params}

다음을 설정할 수 있습니다.
- `vertex_credentials` (str) - Vertex AI service account.json의 json string 또는 file path
- `vertex_location` (str) - Vertex model이 배포된 위치(us-central1, asia-southeast1 등). 일부 모델은 global location을 지원합니다. [Vertex AI 문서](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations#supported_models)를 참고하세요.
- `vertex_project` Optional[str] - vertex project가 `vertex_credentials`의 project와 다를 때 사용

위 값은 `litellm.completion` 호출의 동적 매개변수로 전달할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import json 

## GET CREDENTIALS 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)


response = completion(
  model="vertex_ai/gemini-2.5-pro",
  messages=[{"content": "You are a good bot.","role": "system"}, {"content": "Hello, how are you?","role": "user"}], 
  vertex_credentials=vertex_credentials_json,
  vertex_project="my-special-project", 
  vertex_location="my-special-location"
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
    - model_name: gemini-1.5-pro
      litellm_params:
        model: gemini-1.5-pro
        vertex_credentials: os.environ/VERTEX_FILE_PATH_ENV_VAR # os.environ["VERTEX_FILE_PATH_ENV_VAR"] = "/path/to/service_account.json" 
        vertex_project: "my-special-project"
        vertex_location: "my-special-location:
```

</TabItem>
</Tabs>




### **Workload Identity Federation 설정** {#workload-identity-federation-setup}

LiteLLM은 [Google Cloud Workload Identity Federation (WIF)](https://cloud.google.com/iam/docs/workload-identity-federation)를 지원합니다. WIF를 사용하면 service account key 없이 on-premises 또는 multi-cloud workload에 Google Cloud resource 접근 권한을 부여할 수 있습니다. 다른 cloud environment(AWS, Azure 등)나 on-premises에서 실행되는 workload에는 이 방식이 권장됩니다.

Workload Identity Federation을 사용하려면 WIF credentials configuration file의 path를 `vertex_credentials`로 전달하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-1.5-pro",
    messages=[{"role": "user", "content": "Hello!"}],
    vertex_credentials="/path/to/wif-credentials.json",  # 👈 WIF credentials file
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      vertex_credentials: /path/to/wif-credentials.json  # 👈 WIF credentials file
```

또는 LiteLLM UI의 **LLM Credentials**에서 credentials를 생성하고 이를 모델 인증에 사용할 수 있습니다.

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      litellm_credential_name: my-vertex-wif-credential  # 👈 Reference credential stored in UI
```

</TabItem>
</Tabs>

**WIF credentials file format**

WIF credentials JSON file은 일반적으로 다음과 같습니다(AWS federation 예시).

```json
{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/SERVICE_ACCOUNT_EMAIL:generateAccessToken",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15"
  }
}
```

Workload Identity Federation 설정에 대한 자세한 내용은 [Google Cloud WIF 문서](https://cloud.google.com/iam/docs/workload-identity-federation)를 참고하세요.

#### WIF용 명시적 AWS credentials {#explicit-aws-credentials-for-wif}

기본적으로 AWS 기반 WIF는 AWS credentials를 얻기 위해 EC2 instance metadata service에 의존합니다. LiteLLM이 IAM role이 연결된 EC2 instance 또는 ECS task에서 실행될 때 이 방식이 동작합니다.

환경에서 **EC2 metadata service에 접근할 수 없는 경우**(예: on-premises 실행, host networking 없는 container, security restriction이 있는 다른 cloud), WIF credential JSON file에 explicit AWS credentials를 직접 제공할 수 있습니다. LiteLLM은 GCP token exchange를 수행하기 전에 이 값으로 AWS에 인증합니다.

WIF credential JSON의 **top level**에 `aws_*` key를 추가하세요(`type`, `audience` 등과 같은 level).

```json
{
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/SERVICE_ACCOUNT_EMAIL:generateAccessToken",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15"
  },
  "aws_role_name": "arn:aws:iam::123456789012:role/MyWifRole",
  "aws_region_name": "us-east-1"
}
```

**지원되는 `aws_*` 매개변수:**

| 매개변수 | 필수 여부 | 설명 |
|---|---|---|
| `aws_region_name` | 예 | credential verification에 사용할 AWS region(예: `us-east-1`) |
| `aws_role_name` | 아니요 | STS AssumeRole용 IAM role ARN |
| `aws_access_key_id` | 아니요 | static AWS access key ID |
| `aws_secret_access_key` | 아니요 | static AWS secret access key |
| `aws_session_token` | 아니요 | 임시 session token |
| `aws_profile_name` | 아니요 | AWS CLI profile name |
| `aws_session_name` | 아니요 | AssumeRole용 session name |
| `aws_web_identity_token` | 아니요 | STS용 web identity token |
| `aws_sts_endpoint` | 아니요 | custom STS endpoint URL |
| `aws_external_id` | 아니요 | cross-account AssumeRole용 external ID |

explicit AWS credentials를 사용할 때 `aws_region_name`은 항상 필요합니다. 다른 매개변수는 [Bedrock AWS auth](/docs/providers/bedrock#authentication)와 같은 authentication flow를 따릅니다. role assumption, static key, profile, web identity token을 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-1.5-pro",
    messages=[{"role": "user", "content": "Hello!"}],
    vertex_credentials="/path/to/wif-credentials-with-aws.json",  # WIF JSON with aws_* keys
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1"
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
      vertex_credentials: /path/to/wif-credentials-with-aws.json  # WIF JSON with aws_* keys
```

</TabItem>
</Tabs>

JSON에 `aws_*` key가 있으면 LiteLLM은 EC2 metadata service 대신 explicit AWS authentication을 자동으로 사용합니다. key가 없으면 standard metadata-based flow가 그대로 사용됩니다.

### **환경 변수**

다음을 설정할 수 있습니다.
- `GOOGLE_APPLICATION_CREDENTIALS` - service_account.json file path를 여기에 저장합니다(Vertex SDK가 직접 사용).
- VERTEXAI_LOCATION - Vertex model이 배포된 위치(us-central1, asia-southeast1 등)
- VERTEXAI_PROJECT - Optional[str] - vertex project가 `vertex_credentials`의 project와 다를 때 사용

1. GOOGLE_APPLICATION_CREDENTIALS

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service_account.json"
```

2. VERTEXAI_LOCATION

```bash
export VERTEXAI_LOCATION="us-central1" # can be any vertex location
```

3. VERTEXAI_PROJECT

```bash
export VERTEXAI_PROJECT="my-test-project" # ONLY use if model project is different from service account project
```


## Safety settings 지정 {#specifying-safety-settings}
특정 use case에서는 기본값과 다른 [safety settings](https://ai.google.dev/docs/safety_setting_gemini)를 model call에 전달해야 할 수 있습니다. 이 경우 `completion` 또는 `acompletion`에 `safety_settings` 인수를 전달하면 됩니다. 예:

### Model/request별 설정 {#per-modelrequest-settings}

<Tabs>

<TabItem value="sdk" label="SDK">

```python
response = completion(
    model="vertex_ai/gemini-2.5-pro", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
    safety_settings=[
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]
)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

**옵션 1: config에서 설정**
```yaml
model_list:
  - model_name: gemini-experimental
    litellm_params:
      model: vertex_ai/gemini-experimental
      vertex_project: litellm-epic
      vertex_location: us-central1
      safety_settings:
      - category: HARM_CATEGORY_HARASSMENT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_HATE_SPEECH
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_SEXUALLY_EXPLICIT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_DANGEROUS_CONTENT
        threshold: BLOCK_NONE
```

**옵션 2: call에서 설정**

```python
response = client.chat.completions.create(
    model="gemini-experimental",
    messages=[
        {
            "role": "user",
            "content": "Can you write exploits?",
        }
    ],
    max_tokens=8192,
    stream=False,
    temperature=0.0,

    extra_body={
        "safety_settings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE",
            },
        ],
    }
)
```
</TabItem>
</Tabs>

### 전역 설정 {#global-settings}

<Tabs>

<TabItem value="sdk" label="SDK">

```python
import litellm 

litellm.set_verbose = True 👈 See RAW REQUEST/RESPONSE 

litellm.vertex_ai_safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]
response = completion(
    model="vertex_ai/gemini-2.5-pro", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml
model_list:
  - model_name: gemini-experimental
    litellm_params:
      model: vertex_ai/gemini-experimental
      vertex_project: litellm-epic
      vertex_location: us-central1

litellm_settings:
    vertex_ai_safety_settings:
      - category: HARM_CATEGORY_HARASSMENT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_HATE_SPEECH
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_SEXUALLY_EXPLICIT
        threshold: BLOCK_NONE
      - category: HARM_CATEGORY_DANGEROUS_CONTENT
        threshold: BLOCK_NONE
```
</TabItem>
</Tabs>

## Vertex project와 Vertex location 설정 {#setting-vertex-project-and-vertex-location}
Vertex AI를 사용하는 모든 call에는 다음 매개변수가 필요합니다.
* Project ID
```python
import os, litellm 

# set via env var
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811" # Your Project ID`

### OR ###

# set directly on module 
litellm.vertex_project = "hardy-device-38811" # Your Project ID`
```
* Project location
```python
import os, litellm 

# set via env var
os.environ["VERTEXAI_LOCATION"] = "us-central1 # Your Location

### OR ###

# set directly on module 
litellm.vertex_location = "us-central1 # Your Location
```

## Gemini Pro
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| gemini-2.5-pro   | `completion('gemini-2.5-pro', messages)`, `completion('vertex_ai/gemini-2.5-pro', messages)` |
| `gemini-2.5-flash-preview-09-2025`   | `completion('gemini-2.5-flash-preview-09-2025', messages)`, `completion('vertex_ai/gemini-2.5-flash-preview-09-2025', messages)` |
| `gemini-2.5-flash-lite-preview-09-2025`   | `completion('gemini-2.5-flash-lite-preview-09-2025', messages)`, `completion('vertex_ai/gemini-2.5-flash-lite-preview-09-2025', messages)` |
| `gemini-3.1-flash-lite-preview`   | `completion('gemini-3.1-flash-lite-preview', messages)`, `completion('vertex_ai/gemini-3.1-flash-lite-preview', messages)` |

## PayGo / Priority 비용 추적 {#paygo--priority-cost-tracking}

LiteLLM은 response의 `usageMetadata.trafficType`을 기준으로 올바른 pricing tier를 적용해 Vertex AI Gemini 모델의 spend를 자동으로 추적합니다.

| Vertex AI `trafficType` | LiteLLM `service_tier` | 적용되는 pricing |
|-------------------------|-------------------------|-----------------|
| `ON_DEMAND_PRIORITY` | `priority` | PayGo / priority 가격(`input_cost_per_token_priority`, `output_cost_per_token_priority`) |
| `ON_DEMAND` | standard | 기본 on-demand pricing |
| `FLEX` / `BATCH` | `flex` | Batch/flex 가격 |

[Vertex AI PayGo](https://cloud.google.com/vertex-ai/generative-ai/pricing)(on-demand priority) 또는 batch workload를 사용하면 LiteLLM은 response에서 `trafficType`을 읽고 [model cost map](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)의 matching cost per token을 적용합니다. 별도 설정은 필요하지 않으며, standard request와 PayGo request 모두에서 spend tracking이 바로 동작합니다.

일반 cost tracking 설정은 [비용 추적](../proxy/cost_tracking.md)을 참고하세요.

## Private Service Connect(PSC) 엔드포인트 {#private-service-connectpsc-endpoints}

LiteLLM은 Private Service Connect(PSC) endpoint에 배포된 Vertex AI 모델을 지원하므로 private deployment에 custom `api_base` URL을 사용할 수 있습니다.

### 사용법

```python
from litellm import completion

# Use PSC endpoint with custom api_base
response = completion(
    model="vertex_ai/1234567890",  # Numeric endpoint ID
    messages=[{"role": "user", "content": "Hello!"}],
    api_base="http://10.96.32.8",  # Your PSC endpoint
    vertex_project="my-project-id",
    vertex_location="us-central1",
    use_psc_endpoint_format=True
)
```

**주요 기능:**
- numeric endpoint ID와 custom model name을 모두 지원합니다.
- completion endpoint와 embedding endpoint 모두에서 동작합니다.
- 전체 PSC URL을 자동 구성합니다: `{api_base}/v1/projects/{project}/locations/{location}/endpoints/{model}:{endpoint}`
- streaming request와 호환됩니다.

### 설정

PSC endpoint를 `config.yaml`에 추가합니다.

```yaml
model_list:
  - model_name: psc-gemini
    litellm_params:
      model: vertex_ai/1234567890  # Numeric endpoint ID
      api_base: "http://10.96.32.8"  # Your PSC endpoint
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
      use_psc_endpoint_format: True
  - model_name: psc-embedding
    litellm_params:
      model: vertex_ai/text-embedding-004
      api_base: "http://10.96.32.8"  # Your PSC endpoint
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
      use_psc_endpoint_format: True
```

## Fine-tuned 모델 {#fine-tuned-models}

LiteLLM을 통해 fine-tuned Vertex AI Gemini 모델을 호출할 수 있습니다.

| 속성 | 세부 정보 |
|----------|---------|
| Provider Route | `vertex_ai/gemini/{MODEL_ID}` |
| Vertex 문서 | [Vertex AI - Fine-tuned Gemini 모델](https://cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-use-supervised-tuning#test_the_tuned_model_with_a_prompt)|
| 지원 작업 | `/chat/completions`, `/completions`, `/embeddings`, `/images` |

`/gemini` request/response format을 따르는 모델을 사용하려면 model parameter를 다음처럼 설정하면 됩니다.

```python title="Model parameter for calling fine-tuned gemini models"
model="vertex_ai/gemini/<your-finetuned-model>"
```

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python showLineNumbers title="Example"
import litellm
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = litellm.completion(
  model="vertex_ai/gemini/<your-finetuned-model>",  # e.g. vertex_ai/gemini/4965075652664360960
  messages=[{ "content": "Hello, how are you?","role": "user"}],
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. 환경에 Vertex credentials 추가

```bash title="Authenticate to Vertex AI"
!gcloud auth application-default login
```

2. config.yaml 설정

```yaml showLineNumbers title="Add to litellm config"
- model_name: finetuned-gemini
  litellm_params:
    model: vertex_ai/gemini/<ENDPOINT_ID>
    vertex_project: <PROJECT_ID>
    vertex_location: <LOCATION>
```

3. 테스트

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Example request"
from openai import OpenAI

client = OpenAI(
    api_key="your-litellm-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="finetuned-gemini",
    messages=[
        {"role": "user", "content": "hi"}
    ]
)
print(response)
```

</TabItem>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Example request"
curl --location 'https://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: <LITELLM_KEY>' \
--data '{"model": "finetuned-gemini" ,"messages":[{"role": "user", "content":[{"type": "text", "text": "hi"}]}]}'
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

## Gemini Pro Vision
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| `gemini-2.5-pro-vision`   | `completion('gemini-2.5-pro-vision', messages)`, `completion('vertex_ai/gemini-2.5-pro-vision', messages)`|

## Gemini 1.5 Pro 및 Vision
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| gemini-1.5-pro   | `completion('gemini-1.5-pro', messages)`, `completion('vertex_ai/gemini-1.5-pro', messages)` |
| `gemini-1.5-flash-preview-0514`   | `completion('gemini-1.5-flash-preview-0514', messages)`, `completion('vertex_ai/gemini-1.5-flash-preview-0514', messages)` |
| `gemini-1.5-pro-preview-0514`   | `completion('gemini-1.5-pro-preview-0514', messages)`, `completion('vertex_ai/gemini-1.5-pro-preview-0514', messages)` |




#### Gemini Pro Vision 사용

OpenAI [`gpt-4-vision`](https://docs.litellm.ai/docs/providers/openai#openai-vision-models)과 동일한 input/output format으로 `gemini-2.5-pro-vision`을 호출합니다.

LiteLLM은 `url`에 전달되는 다음 image type을 지원합니다.
- Cloud Storage URI 이미지 - gs://cloud-samples-data/generative-ai/image/boats.jpeg
- direct link image - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
- Cloud Storage URI video - https://storage.googleapis.com/github-repo/img/gemini/multimodality_usecases_overview/pixel8.mp4
- Base64 encoded 로컬 이미지

**예제 request - image url**

<Tabs>

<TabItem value="direct" label="Images with direct links">

```python
import litellm

response = litellm.completion(
  model = "vertex_ai/gemini-2.5-pro-vision",
  messages=[
      {
          "role": "user",
          "content": [
                          {
                              "type": "text",
                              "text": "Whats in this image?"
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
print(response)
```
</TabItem>

<TabItem value="base" label="Local Base64 Images">

```python
import litellm

def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

image_path = "cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
response = litellm.completion(
    model="vertex_ai/gemini-2.5-pro-vision",
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
print(response)
```
</TabItem>
</Tabs>

## 사용법 - Function Calling {#usage---function-calling}

LiteLLM은 Vertex AI Gemini 모델의 function calling을 지원합니다.

```python
from litellm import completion
import os
# set env
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ".."
os.environ["VERTEX_AI_PROJECT"] = ".."
os.environ["VERTEX_AI_LOCATION"] = ".."

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
    model="vertex_ai/gemini-2.5-pro-vision",
    messages=messages,
    tools=tools,
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)

```

## Media resolution 제어(images & videos) {#media-resolution-controlimages--videos}

LiteLLM은 모든 Gemini 모델에서 OpenAI의 `detail` parameter를 사용한 part별 media resolution control을 지원합니다. `image_url` 또는 `file` content type을 사용할 때 request 안의 개별 image와 video마다 다른 resolution level을 지정할 수 있습니다.

**지원되는 `detail` 값:**
- `"low"` - `media_resolution: "low"`로 매핑(image는 280 tokens, video는 frame당 70 tokens)
- `"medium"` - `media_resolution: "medium"`으로 매핑
- `"high"` - `media_resolution: "high"`로 매핑(image는 1120 tokens)
- `"ultra_high"` - `media_resolution: "ultra_high"`로 매핑
- `"auto"` 또는 `None` - 모델이 최적 resolution을 결정(`media_resolution` 설정 없음)

**사용법 예제:**

<Tabs>
<TabItem value="images" label="Images">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/chart.png",
                    "detail": "high"  # High resolution for detailed chart analysis
                }
            },
            {
                "type": "text",
                "text": "Analyze this chart"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://example.com/icon.png",
                    "detail": "low"  # Low resolution for simple icon
                }
            }
        ]
    }
]

response = completion(
    model="vertex_ai/gemini-3-pro-preview",
    messages=messages,
)
```

</TabItem>
<TabItem value="videos" label="Videos with Files">

```python
from litellm import completion

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Analyze this video"
            },
            {
                "type": "file",
                "file": {
                    "file_id": "gs://my-bucket/video.mp4",
                    "format": "video/mp4",
                    "detail": "high"  # High resolution for detailed video analysis
                }
            }
        ]
    }
]

response = completion(
    model="vertex_ai/gemini-3-pro-preview",
    messages=messages,
)
```

</TabItem>
</Tabs>

:::info
**Part별 resolution:** request 안의 각 image 또는 video는 자체 `detail` 설정을 가질 수 있으므로 mixed-resolution request(예: high-res chart와 low-res icon 조합)가 가능합니다. 이 기능은 모든 Gemini 모델에서 `image_url` 및 `file` content type 모두와 함께 동작합니다.
:::

## Video metadata 제어 {#video-metadata-control}

LiteLLM은 모든 Gemini 모델(1.x, 2.x, 3+)에서 `video_metadata` field를 통한 세밀한 video processing control을 지원합니다. 이를 통해 video analysis용 frame extraction rate와 time range를 지정할 수 있습니다.

**지원되는 `video_metadata` parameter:**

| Parameter | Type | 설명 | 예제 |
|-----------|------|-------------|---------|
| `fps` | Number | Frame extraction rate(초당 frame 수) | `5` |
| `start_offset` | String | video clip processing 시작 시간 | `"10s"` |
| `end_offset` | String | video clip processing 종료 시간 | `"60s"` |

:::note
**Field name conversion:** LiteLLM은 Gemini API용으로 snake_case field name을 camelCase로 자동 변환합니다.
- `start_offset` → `startOffset`
- `end_offset` → `endOffset`
- `fps`는 변경되지 않음
:::

:::tip
Video clipping(`start_offset`/`end_offset`)과 frame rate control(`fps`)은 모든 Gemini 모델에서 지원되지만, **Gemini 2.5 series**(예: `gemini-2.5-flash`, `gemini-2.5-pro`)에서 analysis quality가 훨씬 높습니다.
:::

:::warning
- **Video file 권장:** `video_metadata`는 video file용으로 설계되었습니다. 다른 media type의 error handling은 Vertex AI API에 위임됩니다.
- **지원 file format:** `gs://`, `https://`, base64-encoded video file과 함께 동작합니다.
:::

**사용법 예제:**

<Tabs>
<TabItem value="basic" label="Basic Video Metadata">

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-3-pro-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Analyze this video clip"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://my-bucket/video.mp4",
                        "format": "video/mp4",
                        "video_metadata": {
                            "fps": 5,               # Extract 5 frames per second
                            "start_offset": "10s",  # Start from 10 seconds
                            "end_offset": "60s"     # End at 60 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="combined" label="Combined with Detail">

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-3-pro-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Provide detailed analysis of this video segment"},
                {
                    "type": "file",
                    "file": {
                        "file_id": "https://example.com/presentation.mp4",
                        "format": "video/mp4",
                        "detail": "high",  # High resolution for detailed analysis
                        "video_metadata": {
                            "fps": 10,              # Extract 10 frames per second
                            "start_offset": "30s",  # Start from 30 seconds
                            "end_offset": "90s"     # End at 90 seconds
                        }
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gemini-3-pro
    litellm_params:
      model: vertex_ai/gemini-3-pro-preview
      vertex_project: your-project
      vertex_location: us-central1
```

2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 요청 전송

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-3-pro",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Analyze this video clip"},
          {
            "type": "file",
            "file": {
              "file_id": "gs://my-bucket/video.mp4",
              "format": "video/mp4",
              "detail": "high",
              "video_metadata": {
                "fps": 5,
                "start_offset": "10s",
                "end_offset": "60s"
              }
            }
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

## 사용법 - PDF / video / audio 등 file {#usage---pdf--video--audio-and-other-files}

Vertex AI가 지원하는 모든 file을 LiteLLM을 통해 전달할 수 있습니다.

LiteLLM은 url에 전달되는 다음 file type을 지원합니다.

VertexAI용 `file` message type은 v1.65.1+부터 사용할 수 있습니다.

```
Files with Cloud Storage URIs - gs://cloud-samples-data/generative-ai/image/boats.jpeg
Files with direct links - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
Videos with Cloud Storage URIs - https://storage.googleapis.com/github-repo/img/gemini/multimodality_usecases_overview/pixel8.mp4
Base64 Encoded Local Files
```

<Tabs>
<TabItem value="sdk" label="SDK">

### **`gs://` 또는 임의 URL 사용**
```python
from litellm import completion

response = completion(
    model="vertex_ai/gemini-1.5-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "You are a very professional document summarization specialist. Please summarize the given document."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf",
                        "format": "application/pdf" # OPTIONAL - specify mime-type
                    }
                },
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0])
```

### **base64 사용**
```python
from litellm import completion
import base64
import requests

# URL of the file
url = "https://storage.googleapis.com/cloud-samples-data/generative-ai/pdf/2403.05530.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

response = completion(
    model="vertex_ai/gemini-1.5-flash",
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
                {
                    "type": "audio_input",
                    "audio_input {
                        "audio_input": f"data:audio/mp3;base64,{encoded_file}", # 👈 AUDIO File ('file' message works as too)
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

1. config에 모델 추가

```yaml
- model_name: gemini-1.5-flash
  litellm_params:
    model: vertex_ai/gemini-1.5-flash
    vertex_credentials: "/path/to/service_account.json"
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트

**`gs://` 사용**
```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-1.5-flash",
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
                    "file_id": "gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf",
                    "format": "application/pdf" # OPTIONAL
                }
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }'

```


```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-1.5-flash",
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
                },
            },
            {
                "type": "audio_input",
                "audio_input {
                    "audio_input": f"data:audio/mp3;base64,{encoded_file}", # 👈 AUDIO File ('file' message works as too)
                }  
            },
    ]
      }
    ],
    "max_tokens": 300
  }'

```
</TabItem>
</Tabs>


## Chat 모델 {#chat-models}
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| chat-bison-32k   | `completion('chat-bison-32k', messages)` |
| chat-bison       | `completion('chat-bison', messages)`     |
| chat-bison@001   | `completion('chat-bison@001', messages)` |

## Code Chat 모델 {#code-chat-models}
| 모델명           | Function Call                              |
|----------------------|--------------------------------------------|
| `codechat-bison`       | `completion('codechat-bison', messages)`     |
| `codechat-bison-32k`   | `completion('codechat-bison-32k', messages)` |
| codechat-bison@001   | `completion('codechat-bison@001', messages)` |

## Text 모델 {#text-models}
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| text-bison       | `completion('text-bison', messages)` |
| text-bison@001   | `completion('text-bison@001', messages)` |

## Code Text 모델 {#code-text-models}
| 모델명       | Function Call                        |
|------------------|--------------------------------------|
| code-bison       | `completion('code-bison', messages)` |
| code-bison@001   | `completion('code-bison@001', messages)` |
| code-gecko@001   | `completion('code-gecko@001', messages)` |
| code-gecko@latest| `completion('code-gecko@latest', messages)` |


## **Embedding 모델** {#embedding-models}

#### 사용법 - Embedding {#usage---embedding}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
from litellm import embedding
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = embedding(
    model="vertex_ai/textembedding-gecko",
    input=["good morning from litellm"],
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">


1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: snowflake-arctic-embed-m-long-1731622468876
    litellm_params:
      model: vertex_ai/<your-model-id>
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 request 전송

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="snowflake-arctic-embed-m-long-1731622468876", 
    input = ["good morning from litellm", "this is another item"],
)

print(response)
```


</TabItem>
</Tabs>

#### 지원되는 embedding 모델 {#supported-embedding-models}
[여기](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835)에 나열된 모든 모델을 지원합니다.

| 모델명               | Function Call                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `text-embedding-004` | `embedding(model="vertex_ai/text-embedding-004", input)` | 
| `text-multilingual-embedding-002` | `embedding(model="vertex_ai/text-multilingual-embedding-002", input)` | 
| `textembedding-gecko` | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| `textembedding-gecko-multilingual` | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| `textembedding-gecko-multilingual@001` | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| `textembedding-gecko@001` | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| `textembedding-gecko@003` | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| `text-embedding-preview-0409` | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| `text-multilingual-embedding-preview-0409` | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 
| Fine-tuned 또는 Custom Embedding models | `embedding(model="vertex_ai/<your-model-id>", input)` | 

### 지원되는 OpenAI(unified) params {#supported-openaiunified-params}

| [param](../embedding/supported_embedding.md#input-params-for-litellmembedding) | type | [Vertex equivalent](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api) |
|-------|-------------|--------------------|
| `input` | **string or List[string]** | `instances` |
| `dimensions` | **int** | `output_dimensionality` |
| `input_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** | `task_type` |

#### OpenAI(unified) params 사용법 {#openaiunified-params-usage}


<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"]
    input_type = "RETRIEVAL_DOCUMENT",
    dimensions=1,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "input_type": "RETRIEVAL_QUERY",
    }
)

print(response)
```
</TabItem>
</Tabs>


### 지원되는 Vertex-specific params {#supported-vertex-specific-params}

| param | type |
|-------|-------------|
| `auto_truncate` | **bool** |
| `task_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** |
| `title` | **str** |

#### Vertex-specific params 사용법(`task_type` 및 `title` 사용) {#vertex-specific-params-usagewith-task_type-and-title}

embedding model에 모든 Vertex-specific params를 전달할 수 있습니다. 다음처럼 embedding function에 전달하면 됩니다.

[전체 embedding params가 있는 관련 Vertex AI 문서](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api#request_body)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"]
    task_type = "RETRIEVAL_DOCUMENT",
    title = "test",
    dimensions=1,
    auto_truncate=True,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "task_type": "RETRIEVAL_QUERY",
        "auto_truncate": True,
        "title": "test",
    }
)

print(response)
```
</TabItem>
</Tabs>

## **Multi-modal embeddings 사용** {#using-multi-modal-embeddings}


알려진 제한 사항:
- request당 image/video/image 1개만 지원합니다.
- GCS 또는 base64 encoded image/video만 지원합니다.

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

GCS image 사용

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png" # will be sent as a gcs image
)
```

base64 encoded image 사용

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="data:image/jpeg;base64,..." # will be sent as a base64 encoded image
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY (Unified Endpoint)">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 request 전송


<Tabs>

<TabItem value="OpenAI SDK" label="OpenAI SDK">

GCS image/video URI 요청

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png",
)

print(response)
```

base64 encoded image 요청

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "data:image/jpeg;base64,...",
)

print(response)
```

</TabItem>

<TabItem value="langchain" label="Langchain">

GCS image/video URI 요청
```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # type: ignore
)


query_result = embeddings.embed_query(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)
print(query_result)

```

base64 encoded image 요청

```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # type: ignore
)


query_result = embeddings.embed_query(
    "data:image/jpeg;base64,..."
)
print(query_result)

```

</TabItem>

</Tabs>
</TabItem>


<TabItem value="proxy-vtx" label="LiteLLM PROXY (Vertex SDK)">

1. config.yaml에 모델 추가
```yaml
default_vertex_config:
  vertex_project: "adroit-crow-413218"
  vertex_location: "us-central1"
  vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK로 request 전송

```python
import vertexai

from vertexai.vision_models import Image, MultiModalEmbeddingModel, Video
from vertexai.vision_models import VideoSegmentConfig
from google.auth.credentials import Credentials


LITELLM_PROXY_API_KEY = "sk-1234"
LITELLM_PROXY_BASE = "http://0.0.0.0:4000/vertex-ai"

import datetime

class CredentialsWrapper(Credentials):
    def __init__(self, token=None):
        super().__init__()
        self.token = token
        self.expiry = None  # or set to a future date if needed
        
    def refresh(self, request):
        pass
    
    def apply(self, headers, token=None):
        headers['Authorization'] = f'Bearer {self.token}'

    @property
    def expired(self):
        return False  # Always consider the token as non-expired

    @property
    def valid(self):
        return True  # Always consider the credentials as valid

credentials = CredentialsWrapper(token=LITELLM_PROXY_API_KEY)

vertexai.init(
    project="adroit-crow-413218",
    location="us-central1",
    api_endpoint=LITELLM_PROXY_BASE,
    credentials = credentials,
    api_transport="rest",
   
)

model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
image = Image.load_from_file(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)

embeddings = model.get_embeddings(
    image=image,
    contextual_text="Colosseum",
    dimension=1408,
)
print(f"Image Embedding: {embeddings.image_embedding}")
print(f"Text Embedding: {embeddings.text_embedding}")
```

</TabItem>
</Tabs>


### Text + image + video embeddings 사용 {#using-text--image--video-embeddings}

<Tabs>
<TabItem value="sdk" label="SDK">

Text + Image 

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"] # will be sent as a gcs image
)
```

Text + Video 

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```

Image + Video 

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```


</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY (Unified Endpoint)">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 request 전송


Text + Image 

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"],
)

print(response)
```

Text + Video 
```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

Image + Video 
```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

</TabItem>
</Tabs>

## **Fine tuning API** {#fine-tuning-apis}


| 속성 | 세부 정보 |
|----------|---------|
| 설명 | OpenAI Python SDK를 사용해 Vertex AI에서 fine tuning job(`/tuningJobs`) 생성 |
| Vertex Fine Tuning 문서 | [Vertex Fine Tuning](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/tuning#create-tuning) |

### 사용법

#### 1. config.yaml에 `finetune_settings` 추가
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

# 👇 Key change: For /fine_tuning/jobs endpoints
finetune_settings:
  - custom_llm_provider: "vertex_ai"
    vertex_project: "adroit-crow-413218"
    vertex_location: "us-central1"
    vertex_credentials: "/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json"
```

#### 2. Fine tuning job 생성 {#2-create-fine-tuning-job}

<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python
ft_job = await client.fine_tuning.jobs.create(
    model="gemini-1.0-pro-002",                  # Vertex model you want to fine-tune
    training_file="gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",                 # file_id from create file response
    extra_headers={"custom-llm-provider": "vertex_ai"}, # tell litellm proxy which provider to use
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: vertex_ai" \
    -d '{
    "model": "gemini-1.0-pro-002",
    "training_file": "gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl"
    }'
```
</TabItem>

</Tabs>


**고급 사용 사례 - Vertex AI API에 `adapter_size` 전달**

`n_epochs`, `learning_rate_multiplier`, `adapter_size` 같은 hyper_parameters를 설정합니다. [Vertex Advanced Hyperparameters](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/tuning#advanced_use_case)를 참고하세요.


<Tabs>
<TabItem value="openai" label="OpenAI Python SDK">

```python

ft_job = client.fine_tuning.jobs.create(
    model="gemini-1.0-pro-002",                  # Vertex model you want to fine-tune
    training_file="gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",                 # file_id from create file response
    hyperparameters={
        "n_epochs": 3,                      # epoch_count on Vertex
        "learning_rate_multiplier": 0.1,    # learning_rate_multiplier on Vertex
        "adapter_size": "ADAPTER_SIZE_ONE"  # type: ignore, vertex specific hyperparameter
    },
    extra_headers={"custom-llm-provider": "vertex_ai"},
)
```
</TabItem>

<TabItem value="curl" label="curl">

```shell
curl http://localhost:4000/v1/fine_tuning/jobs \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: vertex_ai" \
    -d '{
    "model": "gemini-1.0-pro-002",
    "training_file": "gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl",
    "hyperparameters": {
        "n_epochs": 3,
        "learning_rate_multiplier": 0.1,
        "adapter_size": "ADAPTER_SIZE_ONE"
    }
    }'
```
</TabItem>

</Tabs>


## Labels {#labels}


Google은 `generateContent`와 `streamGenerateContent` call에 custom metadata를 추가할 수 있게 합니다.
이 mechanism은 여러 application 또는 user에 걸친 cost 및 usage tracking을 가능하게 하므로 Vertex AI에서 유용합니다.


### 사용법

request에 `labels` 또는 `metadata` field를 보내면 LiteLLM을 통해 이 기능을 사용할 수 있습니다.

client가 LiteLLM request에 `labels` field를 설정하면,
LiteLLM은 `labels` field를 Vertex AI backend로 전달합니다.

client가 LiteLLM request에 `metadata` field를 설정하고 `labels` field는 설정하지 않은 경우,
LiteLLM은 string value에 해당하는 `metadata` key/value pair로 채운 `labels` field를 생성한 뒤
Vertex AI backend로 전달합니다.


다음은 labels 사용법을 보여주는 JSON request 예시입니다.

```json
{
    "model": "gemini-2.0-flash-lite",
    "messages": [
        { "role": "user", "content": "respond in 20 words. who are you?" }
    ],
    "labels": {
        "client_app": "acme_comp_financial_app",
        "department": "finance",
        "project": "acme_ai"
    }
}
```



## Extra {#extra}

### `GOOGLE_APPLICATION_CREDENTIALS` 사용
service account credentials를 `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수로 저장하는 코드입니다.


```python
import os 
import tempfile

def load_vertex_ai_credentials():
  # Define the path to the vertex_key.json file
  print("loading vertex ai credentials")
  filepath = os.path.dirname(os.path.abspath(__file__))
  vertex_key_path = filepath + "/vertex_key.json"

  # Read the existing content of the file or create an empty dictionary
  try:
      with open(vertex_key_path, "r") as file:
          # Read the file content
          print("Read vertexai file path")
          content = file.read()

          # If the file is empty or not valid JSON, create an empty dictionary
          if not content or not content.strip():
              service_account_key_data = {}
          else:
              # Attempt to load the existing JSON content
              file.seek(0)
              service_account_key_data = json.load(file)
  except FileNotFoundError:
      # If the file doesn't exist, create an empty dictionary
      service_account_key_data = {}

  # Create a temporary file
  with tempfile.NamedTemporaryFile(mode="w+", delete=False) as temp_file:
      # Write the updated content to the temporary file
      json.dump(service_account_key_data, temp_file, indent=2)

  # Export the temporary file as GOOGLE_APPLICATION_CREDENTIALS
  os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(temp_file.name)
```


### GCP service account 사용

:::info

Google Cloud Run에 LiteLLM을 배포하려면 [이 tutorial](https://docs.litellm.ai/docs/proxy/deploy#deploy-on-google-cloud-run)을 참고하세요.

:::

1. Google Cloud Run service에 연결된 service account를 확인합니다.

<Image img={require('../../img/gcp_acc_1.png')} />

2. 해당 service account의 전체 email address를 가져옵니다.

3. IAM & Admin > Manage Resources로 이동한 뒤 Google Cloud Run service가 있는 top-level project를 선택합니다.

`Add Principal`을 클릭합니다.

<Image img={require('../../img/gcp_acc_2.png')}/>

4. service account를 principal로, Vertex AI User를 role로 지정합니다.

<Image img={require('../../img/gcp_acc_3.png')}/>

이 작업이 끝나면 Google Cloud Run service에 새 container를 배포할 때 LiteLLM이 모든 Vertex AI endpoint에 자동으로 접근할 수 있습니다.


이 tutorial은 @[Darien Kindlund](https://www.linkedin.com/in/kindlund/)에게 감사드립니다.

## **Rerank API** {#rerank-api}

Vertex AI는 Discovery Engine API를 통한 reranking을 지원하며, document retrieval을 위한 semantic ranking capability를 제공합니다.

### 설정

Google Cloud project ID를 설정합니다.

```bash
export VERTEXAI_PROJECT="your-project-id"
```

### 사용법

```python
from litellm import rerank

# Using the latest model (recommended)
response = rerank(
    model="vertex_ai/semantic-ranker-default@latest",
    query="What is Google Gemini?",
    documents=[
        "Gemini is a cutting edge large language model created by Google.",
        "The Gemini zodiac symbol often depicts two figures standing side-by-side.",
        "Gemini is a constellation that can be seen in the night sky."
    ],
    top_n=2,
    return_documents=True  # Set to False for ID-only responses
)

# Using specific model versions
response_v003 = rerank(
    model="vertex_ai/semantic-ranker-default-003",
    query="What is Google Gemini?",
    documents=documents,
    top_n=2
)

print(response.results)
```

### 매개변수 {#parameters}

| 매개변수 | Type | 설명 |
|-----------|------|-------------|
| `model` | string | model name(예: `vertex_ai/semantic-ranker-default@latest`) |
| `query` | string | search query |
| `documents` | list | rank할 document |
| `top_n` | int | 반환할 top result 수 |
| `return_documents` | bool | full content(`True`) 또는 ID만(`False`) 반환 |

### 지원되는 모델 {#supported-models}

- `semantic-ranker-default@latest`
- `semantic-ranker-fast@latest` 
- `semantic-ranker-default-003`
- `semantic-ranker-default-002`

자세한 model specification은 [Google Cloud ranking API 문서](https://cloud.google.com/generative-ai-app-builder/docs/ranking#rank_or_rerank_a_set_of_records_according_to_a_query)를 참고하세요.

### Proxy 사용법

`config.yaml`에 추가합니다.

```yaml
model_list:
  - model_name: semantic-ranker-default@latest
    litellm_params:
      model: vertex_ai/semantic-ranker-default@latest
      vertex_ai_project: "your-project-id"
      vertex_ai_location: "us-central1"
      vertex_ai_credentials: "path/to/service-account.json" 
```

프록시 시작:

```bash
litellm --config /path/to/config.yaml
```

curl로 테스트합니다.

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "semantic-ranker-default@latest",
    "query": "What is Google Gemini?",
    "documents": [
      "Gemini is a cutting edge large language model created by Google.",
      "The Gemini zodiac symbol often depicts two figures standing side-by-side.",
      "Gemini is a constellation that can be seen in the night sky."
    ],
    "top_n": 2
  }'
```
