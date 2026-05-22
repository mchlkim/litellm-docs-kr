import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini - Google AI Studio 설정

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Google AI Studio는 생성형 AI를 구축하고 사용하기 위한 완전 관리형 AI 개발 플랫폼입니다. |
| LiteLLM의 Provider Route | `gemini/` |
| Provider 문서 | [Google AI Studio ↗](https://aistudio.google.com/) |
| Provider API Endpoint | https://generativelanguage.googleapis.com |
| 지원되는 OpenAI Endpoints | `/chat/completions`, [`/embeddings`](../embedding/supported_embedding#gemini-ai-embedding-models), `/completions`, [`/videos`](./gemini/videos.md), [`/images/edits`](../image_edits.md) |
| Lyria (music) | [비용 맵 및 참고 사항](./gemini/music.md) |
| Pass-through Endpoint | [지원됨](../pass_through/google_ai_studio.md) |

<br />

:::tip Gemini API와 Vertex AI 비교
| 모델 형식 | Provider | 필요한 Auth |
|-------------|----------|---------------|
| `gemini/gemini-2.0-flash` | Gemini API | `GEMINI_API_KEY` (간단한 API key) |
| `vertex_ai/gemini-2.0-flash` | Vertex AI | GCP credentials 및 project |
| `gemini-2.0-flash` (prefix 없음) | Vertex AI | GCP credentials 및 project |

**OpenAI처럼 API key만 사용하려면** `gemini/` prefix를 사용하세요.

prefix가 없는 모델은 기본적으로 Vertex AI로 처리되며 전체 GCP authentication이 필요합니다.
:::

## API 키 {#api-keys}

```python
import os
os.environ["GEMINI_API_KEY"] = "your-api-key"
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['GEMINI_API_KEY'] = ""
response = completion(
    model="gemini/gemini-pro", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```

## 지원되는 OpenAI Params
- temperature
- top_p
- max_tokens
- max_completion_tokens
- stream
- tools
- tool_choice
- include_server_side_tool_invocations
- functions
- response_format
- n
- stop
- logprobs
- frequency_penalty
- modalities
- reasoning_content
- audio (TTS model 전용)
- service_tier

**Anthropic Params**
- thinking (anthropic/gemini model 전반에서 max budget tokens 설정에 사용)

[**업데이트된 목록 보기**](https://github.com/BerriAI/litellm/blob/main/litellm/llms/gemini/chat/transformation.py#L70)

## 사용법 - Thinking / `reasoning_content`

LiteLLM은 OpenAI의 `reasoning_effort`를 Gemini의 `thinking` parameter로 변환합니다. [Code](https://github.com/BerriAI/litellm/blob/620664921902d7a9bfb29897a7b27c1a7ef4ddfb/litellm/llms/vertex_ai/gemini/vertex_and_google_ai_studio_gemini.py#L362)

**비용 최적화:** 큰 비용 절감을 위해 `reasoning_effort="none"`(OpenAI 표준)을 사용하세요. 최대 96% 더 저렴합니다. [Google 문서](https://ai.google.dev/gemini-api/docs/openai)

:::info
참고: Gemini 2.5 Pro model에서는 reasoning을 끌 수 없습니다.
:::

:::tip Gemini 3 모델
**Gemini 3+ 모델**(예: `gemini-3-pro-preview`)에서는 `reasoning_effort`를 설정하면 LiteLLM이 이를 `thinking_budget` 대신 `thinking_level` field로 mapping합니다. 지원 level은 model에 따라 다릅니다(Flash-family model은 `minimal`과 `medium`도 지원). `reasoning_effort`를 생략하면 LiteLLM은 기본 `thinking_level`을 보내지 않습니다. request는 **Gemini API 기본값**을 사용합니다(Gemini 3 Flash는 API에서 기본값 `high`).
:::

:::warning Image 모델
**Gemini image 모델**(예: `gemini-3-pro-image-preview`, `gemini-2.0-flash-exp-image-generation`)는 `thinking_level` parameter를 지원하지 않습니다. LiteLLM은 API error를 방지하기 위해 image model에는 thinking configuration을 자동으로 제외합니다.
:::

**Gemini 2.5 및 이전 model mapping**

| reasoning_effort | thinking | 참고 |
| ---------------- | -------- | ----- |
| "none"           | "budget_tokens": 0, "includeThoughts": false | 💰 **비용 최적화 권장값** - OpenAI-compatible, 항상 0 |
| "disable"        | "budget_tokens": DEFAULT (0), "includeThoughts": false | LiteLLM-specific, env var로 구성 가능 |
| "low"            | "budget_tokens": 1024 | |
| "medium"         | "budget_tokens": 2048 | |
| "high"           | "budget_tokens": 4096 | |

**Gemini 3+ model mapping**

| reasoning_effort | thinking_level | 참고 |
| ---------------- | -------------- | ----- |
| "minimal"        | `"minimal"` (Flash / 일부 3.1) 또는 `"low"` | 지원되는 경우 Flash-family ID는 `minimal` 사용 |
| "low"            | "low" | 간단한 instruction following 또는 chat에 적합 |
| "medium"         | `"medium"` 또는 `"high"` | API가 지원하면 `"medium"`, 아니면 `"high"` |
| "high"           | "high" | reasoning depth 최대화 |
| "disable"        | `"minimal"` (Flash) 또는 `"low"` | Gemini 3에서는 thinking을 완전히 끌 수 없음 |
| "none"           | `"minimal"` (Flash) 또는 `"low"` | Gemini 3에서는 thinking을 완전히 끌 수 없음 |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# Cost-optimized: Use reasoning_effort="none" for best pricing
resp = completion(
    model="gemini/gemini-2.0-flash-thinking-exp-01-21",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="none",  # Up to 96% cheaper!
)

# Or use other levels: "low", "medium", "high"
resp = completion(
    model="gemini/gemini-2.5-flash-preview-04-17",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
- model_name: gemini-2.5-flash
  litellm_params:
    model: gemini/gemini-2.5-flash-preview-04-17
    api_key: os.environ/GEMINI_API_KEY
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
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### Gemini 3+ 모델 - `thinking_level` Parameter {#gemini-3-models---thinking_level-parameter}

Gemini 3+ model(예: `gemini-3-pro-preview`)에서는 새 `thinking_level` parameter를 직접 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# Use thinking_level for Gemini 3 models
resp = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Solve this complex math problem step by step."}],
    reasoning_effort="high",  # Options: "low" or "high"
)

# Low thinking level for faster, simpler tasks
resp = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "What is the weather today?"}],
    reasoning_effort="low",  # Minimizes latency and cost
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [{"role": "user", "content": "Solve this complex problem."}],
    "reasoning_effort": "high"
  }'
```

</TabItem>
</Tabs>

:::warning
**Gemini 3 모델의 Temperature 권장 사항**

Gemini 3 model의 경우 LiteLLM은 `temperature` 기본값을 `1.0`으로 설정하며 이 기본값을 유지하는 것을 강하게 권장합니다. `temperature < 1.0`으로 설정하면 다음 문제가 발생할 수 있습니다.
- 무한 루프
- reasoning performance 저하
- 복잡한 task 실패

Gemini 3+ model에서 명시하지 않으면 LiteLLM은 자동으로 `temperature=1.0`을 설정합니다.
:::

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

### Gemini model에 `thinking` 전달

Gemini model에 `thinking` parameter를 전달할 수도 있습니다.

이 값은 Gemini의 [`thinkingConfig` parameter](https://ai.google.dev/gemini-api/docs/thinking#set-budget)로 변환됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.completion(
  model="gemini/gemini-2.5-flash-preview-04-17",
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
    "model": "gemini/gemini-2.5-flash-preview-04-17",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

**Gemini 3+ 모델**의 경우 LiteLLM은 이제 기본적으로 provider default를 따르며, Anthropic-style `thinking={"type":"enabled","budget_tokens":...}`를 전달해도 `thinkingLevel`을 강제하지 않습니다.

legacy LiteLLM 동작(Pro에는 `thinkingLevel="low"`, Flash에는 `thinkingLevel="minimal"` 강제)을 원하면 다음을 활성화하세요.

```python
import litellm

litellm.enable_gemini_default_thinking_level_low = True
```

## 사용법 - `service_tier`

LiteLLM은 OpenAI의 `service_tier` parameter를 Gemini로 전파하고, response header(`x-gemini-service-tier`)에서 이를 추출해 `model_response.service_tier`에 넣습니다.

| OpenAI `service_tier` | Gemini `service_tier` | 참고 |
| --------------------- | --------------------- | ----- |
| `"auto"`              | `"priority"`          | `priority`는 Gemini에서 fallback되므로 LiteLLM은 OpenAI `"auto"`를 Gemini `"priority"` tier로 mapping합니다. |
| `"flex"`              | `"flex"`              | 직접 mapping |
| `"priority"`          | `"priority"`          | 직접 mapping |
| `"default"`           | `"standard"`          | LiteLLM은 `"default"`를 `"standard"`로 mapping합니다. |
| 기타 값       | 그대로 전달(lowercase) | 값은 case-insensitive이며 lowercase로 normalize됩니다. |

response에서는 LiteLLM이 Gemini API의 `"standard"`를 다시 `"default"`로 mapping합니다.


## 음성 합성(TTS) audio 출력 {#audio-output-for-speech-synthesis-tts}

:::info

LiteLLM은 OpenAI-compatible `audio` parameter format으로 audio response를 생성할 수 있는 Gemini TTS model을 지원합니다.

:::

### 지원되는 모델

LiteLLM은 audio capability가 있는 Gemini TTS model(예: `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`)을 지원합니다. 사용 가능한 TTS model과 voice의 전체 목록은 [공식 Gemini TTS 문서](https://ai.google.dev/gemini-api/docs/speech-generation)를 참고하세요.

### 제한 사항

:::warning

**중요 제한 사항**:
- Gemini TTS model은 `pcm16` audio format만 지원합니다.
- TTS model에는 아직 **streaming support가 추가되지 않았습니다**.
- TTS request에서는 `modalities` parameter를 `['audio']`로 설정해야 합니다.

:::

### 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['GEMINI_API_KEY'] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-preview-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],  # Required for TTS models
    audio={
        "voice": "Kore",
        "format": "pcm16"  # Required: must be "pcm16"
    }
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gemini-tts-flash
    litellm_params:
      model: gemini/gemini-2.5-flash-preview-tts
      api_key: os.environ/GEMINI_API_KEY
  - model_name: gemini-tts-pro
    litellm_params:
      model: gemini/gemini-2.5-pro-preview-tts
      api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. TTS request 보내기

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-tts-flash",
    "messages": [{"role": "user", "content": "Say hello in a friendly voice"}],
    "modalities": ["audio"],
    "audio": {
      "voice": "Kore",
      "format": "pcm16"
    }
  }'
```

</TabItem>
</Tabs>

### 고급 사용법

TTS를 다른 Gemini feature와 함께 사용할 수 있습니다.

```python
response = completion(
    model="gemini/gemini-2.5-pro-preview-tts",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that speaks clearly."},
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    modalities=["audio"],
    audio={
        "voice": "Charon",
        "format": "pcm16"
    },
    temperature=0.7,
    max_tokens=150
)
```

Gemini TTS capability와 사용 가능한 voice에 대한 자세한 내용은 [공식 Gemini TTS 문서](https://ai.google.dev/gemini-api/docs/speech-generation)를 참고하세요.

## Gemini 전용 Params 전달 {#gemini-specific-params}
### Response schema {#response-schema}
LiteLLM은 Google AI Studio의 Gemini-1.5-Pro에 `response_schema`를 parameter로 보내는 기능을 지원합니다.

**Response schema**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['GEMINI_API_KEY'] = ""

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
    model="gemini/gemini-1.5-pro", 
    messages=messages, 
    response_format={"type": "json_object", "response_schema": response_schema} # 👈 KEY CHANGE
    )

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 model 추가
```yaml
model_list:
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. Request 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-pro",
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
    model="gemini/gemini-1.5-pro", 
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

1. config.yaml에 model 추가
```yaml
model_list:
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. Request 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-pro",
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

LiteLLM은 response를 schema에 맞춰 검증하고, response가 schema와 일치하지 않으면 `JSONSchemaValidationError`를 raise합니다.

JSONSchemaValidationError는 `openai.APIError`를 상속합니다.

raw response는 `e.raw_response`로 접근할 수 있습니다.



### GenerationConfig Params 전달 {#generationconfig-params}

추가 GenerationConfig parameter(예: `topK`)를 전달하려면 call의 request body에 넣으면 됩니다. LiteLLM은 이를 request body의 key-value pair로 그대로 전달합니다.

[**Gemini GenerationConfigParams 보기**](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['GEMINI_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

completion(
    model="gemini/gemini-1.5-pro", 
    messages=messages, 
    topK=1 # 👈 KEY CHANGE
)

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 model 추가
```yaml
model_list:
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. Request 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-pro",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "topK": 1 # 👈 KEY CHANGE
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
    model="gemini/gemini-1.5-pro", 
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

1. config.yaml에 model 추가
```yaml
model_list:
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. Request 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-pro",
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

## Safety Settings 지정 {#safety-settings}
특정 사용 사례에서는 model을 호출하면서 기본값과 다른 [safety settings](https://ai.google.dev/docs/safety_setting_gemini)를 전달해야 할 수 있습니다. 이 경우 `completion` 또는 `acompletion`에 `safety_settings` argument를 전달하면 됩니다. 예:

```python
response = completion(
    model="gemini/gemini-pro", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
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

## 도구 호출 

```python
from litellm import completion
import os
# set env
os.environ["GEMINI_API_KEY"] = ".."

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
    model="gemini/gemini-1.5-flash",
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


### Google Search Tool {#google-search-tool}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
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

3. Request 보내기
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-2.0-flash",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"googleSearch": {}}]
}
'
```

</TabItem>
</Tabs>

### Context circulation(Server-Side Tool 조합) {#context-circulationserver-side-tool-combination}

Context circulation을 사용하면 Gemini 3+ model이 같은 request 안에서 Google Search 같은 **built-in tool**과 **custom function**을 함께 사용할 수 있습니다. 이 기능이 없으면 둘을 동시에 사용할 때 Gemini가 error를 반환합니다.

활성화하면 Gemini가 server-side에서 Google Search를 실행하고, 그 결과를 바탕으로 custom function 호출 여부를 결정하며, 전체 reasoning chain을 반환할 수 있습니다.

**동작 방식:**
1. Google Search와 function tool을 함께 전달하면서 `include_server_side_tool_invocations=True`를 설정합니다.
2. Gemini가 server-side tool을 내부적으로 실행하고 `functionCall` part와 함께 `toolCall`/`toolResponse` part를 반환합니다.
3. LiteLLM이 server-side invocation을 `provider_specific_fields["server_side_tool_invocations"]`로 추출합니다.
4. 이후 turn에서는 전체 assistant message를 conversation history에 포함합니다. LiteLLM이 server-side part를 자동으로 다시 주입합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "What's the weather in Buenos Aires? If it's raining, schedule a meeting."}],
    tools=[
        {"type": "web_search_preview"},  # Google Search (server-side)
        {
            "type": "function",
            "function": {
                "name": "schedule_meeting",
                "description": "Schedule a meeting",
                "parameters": {
                    "type": "object",
                    "properties": {"reason": {"type": "string"}},
                    "required": ["reason"],
                },
            },
        },
    ],
    include_server_side_tool_invocations=True,
)

msg = response.choices[0].message

# Server-side tool results are in provider_specific_fields
psf = msg.provider_specific_fields or {}
for invocation in psf.get("server_side_tool_invocations", []):
    print(invocation["tool_type"])  # e.g. "GOOGLE_SEARCH_WEB"
    print(invocation["id"])
    print(invocation["args"])       # e.g. {"queries": ["weather Buenos Aires"]}
    print(invocation["response"])   # Search results from Google

# For multi-turn: just append the full message to history
messages.append(msg)
messages.append({"role": "user", "content": "Thanks!"})
# LiteLLM automatically re-injects the server-side parts + thought signatures
response2 = completion(
    model="gemini/gemini-3-flash-preview",
    messages=messages,
    tools=tools,
    include_server_side_tool_invocations=True,
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정
```yaml
model_list:
  - model_name: gemini-3-flash
    litellm_params:
      model: gemini/gemini-3-flash-preview
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작
```bash
$ litellm --config /path/to/config.yaml
```

3. Request 보내기
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-3-flash",
  "messages": [{"role": "user", "content": "What is the weather in Buenos Aires?"}],
  "tools": [
    {"type": "web_search_preview"},
    {"type": "function", "function": {"name": "schedule_meeting", "description": "Schedule a meeting", "parameters": {"type": "object", "properties": {"reason": {"type": "string"}}}}}
  ],
  "include_server_side_tool_invocations": true
}'
```

</TabItem>
</Tabs>

:::info

- Context circulation에는 **Gemini 3+** model이 필요합니다.
- Server-side tool invocation(`toolCall`/`toolResponse`)은 `tool_calls`에 **포함되지 않습니다**. Google에서 이미 실행했고 사용자 코드가 실행한 것이 아니므로 `provider_specific_fields["server_side_tool_invocations"]`에 들어갑니다.
- `thought_signatures`는 multi-turn coherence를 위해 server-side invocation과 함께 자동으로 보존됩니다.

:::

### URL Context {#url-context}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
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

3. Request 보내기
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

### Google Search Retrieval 사용법 {#google-search-retrieval}


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"googleSearch": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
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

3. Request 보내기
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-2.0-flash",
  "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
  "tools": [{"googleSearch": {}}]
}
'
```

</TabItem>
</Tabs>


### Code Execution Tool 사용법 {#code-execution-tool}


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = ".."

tools = [{"codeExecution": {}}] # 👈 ADD GOOGLE SEARCH

response = completion(
    model="gemini/gemini-2.0-flash",
    messages=[{"role": "user", "content": "What is the weather in San Francisco?"}],
    tools=tools,
)

print(response)
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

3. Request 보내기
```bash
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


### Computer Use Tool {#computer-use-tool}

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

# Computer Use tool with browser environment
tools = [
    {
        "type": "computer_use",
        "environment": "browser",  # optional: "browser" or "unspecified"
        "excluded_predefined_functions": ["drag_and_drop"]  # optional
    }
]

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Navigate to google.com and search for 'LiteLLM'"
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/png;base64,..."  # screenshot of current browser state
                }
            }
        ]
    }
]

response = completion(
    model="gemini/gemini-2.5-computer-use-preview-10-2025",
    messages=messages,
    tools=tools,
)

print(response)

# Handling tool responses with screenshots
# When the model makes a tool call, send the response back with a screenshot:
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    
    # Add assistant message with tool call
    messages.append(response.choices[0].message.model_dump())
    
    # Add tool response with screenshot
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": [
            {
                "type": "text",
                "text": '{"url": "https://example.com", "status": "completed"}'
            },
            {
                "type": "input_image",
                "image_url": "data:image/png;base64,..."  # New screenshot after action (Can send an image url as well, litellm handles the conversion)
            }
        ]
    })
    
    # Continue conversation with updated screenshot
    response = completion(
        model="gemini/gemini-2.5-computer-use-preview-10-2025",
        messages=messages,
        tools=tools,
    )
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy Server">

1. config.yaml에 model 추가

```yaml
model_list:
  - model_name: gemini-computer-use
    litellm_params:
      model: gemini/gemini-2.5-computer-use-preview-10-2025
      api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. request 보내기

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-computer-use",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Click on the search button"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,..."
            }
          }
        ]
      }
    ],
    "tools": [
      {
        "type": "computer_use",
        "environment": "browser"
      }
    ]
  }'
```

**Tool 응답 형식:**

Computer Use 도구 호출에 응답할 때는 URL과 screenshot을 포함하세요.

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": [
    {
      "type": "text",
      "text": "{\"url\": \"https://example.com\", \"status\": \"completed\"}"
    },
    {
      "type": "input_image",
      "image_url": "data:image/png;base64,..."
    }
  ]
}
```

</TabItem>
</Tabs>

### Environment Mapping 표 {#environment-mapping}

| LiteLLM 입력 | Gemini API 값 |
|--------------|------------------|
| `"browser"` | `ENVIRONMENT_BROWSER` |
| `"unspecified"` | `ENVIRONMENT_UNSPECIFIED` |
| `ENVIRONMENT_BROWSER` | `ENVIRONMENT_BROWSER` (그대로 전달) |
| `ENVIRONMENT_UNSPECIFIED` | `ENVIRONMENT_UNSPECIFIED` (그대로 전달) |





## Thought Signatures {#thought-signatures}

Thought signature는 conversation의 특정 turn에서 model 내부 reasoning process를 암호화해 표현한 값입니다. 이후 request에서 thought signature를 다시 model에 전달하면 이전 reasoning context를 제공할 수 있어, model이 기존 reasoning을 이어가고 일관된 탐색 흐름을 유지할 수 있습니다.

Thought signature는 여러 tool invocation 사이에서 model이 context를 유지해야 하는 multi-turn function calling 시나리오에서 특히 중요합니다.

### Thought Signature 동작 방식

- **Signature가 포함된 function call**: Gemini가 function call을 반환할 때 response에 `thought_signature`를 포함합니다.
- **보존**: LiteLLM은 thought signature를 자동으로 추출해 tool call의 `provider_specific_fields`에 저장합니다.
- **Conversation history로 반환**: 이후 request에 tool call이 포함된 assistant message를 넣으면 LiteLLM이 thought signature를 자동으로 보존하고 Gemini로 다시 전달합니다.
- **Parallel function calls**: parallel set의 첫 번째 function call에만 thought signature가 있습니다.
- **Sequential function calls**: multi-step sequence에서는 각 function call이 자체 signature를 갖습니다.

### Thought Signature 활성화

Thought signature를 사용하려면 thinking/reasoning을 활성화해야 합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="gemini/gemini-2.5-flash",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=[...],
    reasoning_effort="low",  # Enable thinking to get thought signatures
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "What'\''s the weather in Tokyo?"}],
    "tools": [...],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### Thought Signature를 사용하는 Multi-Turn Function Calling

multi-turn function calling용 conversation history를 만들 때는 이전 response의 thought signature를 포함해야 합니다. 전체 assistant message를 conversation history에 추가하면 LiteLLM이 이를 자동으로 처리합니다.

<Tabs>
<TabItem value="sdk" label="OpenAI Client">

```python
from openai import OpenAI
import json

client = OpenAI(api_key="sk-1234", base_url="http://localhost:4000")

def get_current_temperature(location: str) -> dict:
    """Gets the current weather temperature for a given location."""
    return {"temperature": 30, "unit": "celsius"}

def set_thermostat_temperature(temperature: int) -> dict:
    """Sets the thermostat to a desired temperature."""
    return {"status": "success"}

get_weather_declaration = {
    "name": "get_current_temperature",
    "description": "Gets the current weather temperature for a given location.",
    "parameters": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"],
    },
}

set_thermostat_declaration = {
    "name": "set_thermostat_temperature",
    "description": "Sets the thermostat to a desired temperature.",
    "parameters": {
        "type": "object",
        "properties": {"temperature": {"type": "integer"}},
        "required": ["temperature"],
    },
}

# Initial request
messages = [
    {"role": "user", "content": "If it's too hot or too cold in London, set the thermostat to a comfortable level."}
]

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=messages,
    tools=[get_weather_declaration, set_thermostat_declaration],
    reasoning_effort="low"
)

# Append the assistant's message (includes thought signatures automatically)
messages.append(response.choices[0].message)

# Execute tool calls and append results
for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "get_current_temperature":
        result = get_current_temperature(**json.loads(tool_call.function.arguments))
        messages.append({
            "role": "tool",
            "content": json.dumps(result),
            "tool_call_id": tool_call.id
        })

# Second request - thought signatures are automatically preserved
response2 = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=messages,
    tools=[get_weather_declaration, set_thermostat_declaration],
    reasoning_effort="low"
)

print(response2.choices[0].message.content)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Step 1: Initial request
curl --location 'http://localhost:4000/v1/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer sk-1234' \
  --data '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "If it'\''s too hot or too cold in London, set the thermostat to a comfortable level."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "description": "Gets the current weather temperature for a given location.",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "set_thermostat_temperature",
          "description": "Sets the thermostat to a desired temperature.",
          "parameters": {
            "type": "object",
            "properties": {
              "temperature": {"type": "integer"}
            },
            "required": ["temperature"]
          }
        }
      }
    ],
    "tool_choice": "auto",
    "reasoning_effort": "low"
  }'
```

response에는 `provider_specific_fields` 안에 thought signature가 포함된 tool call이 들어갑니다.

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "arguments": "{\"location\": \"London\"}"
        },
        "index": 0,
        "provider_specific_fields": {
          "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ...=="
        }
      }]
    }
  }]
}
```

```bash
# Step 2: Follow-up request with tool response
# Include the assistant message from Step 1 (with thought signatures in provider_specific_fields)
curl --location 'http://localhost:4000/v1/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer sk-1234' \
  --data '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "If it'\''s too hot or too cold in London, set the thermostat to a comfortable level."
      },
      {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_c130b9f8c2c042e9b65e39a88245",
            "type": "function",
            "function": {
              "name": "get_current_temperature",
              "arguments": "{\"location\": \"London\"}"
            },
            "index": 0,
            "provider_specific_fields": {
              "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ...=="
            }
          }
        ]
      },
      {
        "role": "tool",
        "content": "{\"temperature\": 30, \"unit\": \"celsius\"}",
        "tool_call_id": "call_c130b9f8c2c042e9b65e39a88245"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "description": "Gets the current weather temperature for a given location.",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "set_thermostat_temperature",
          "description": "Sets the thermostat to a desired temperature.",
          "parameters": {
            "type": "object",
            "properties": {
              "temperature": {"type": "integer"}
            },
            "required": ["temperature"]
          }
        }
      }
    ],
    "tool_choice": "auto",
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

### 중요 참고 사항 {#important-notes}

1. **자동 처리**: LiteLLM은 Gemini response에서 thought signature를 자동으로 추출하고, assistant message를 conversation history에 포함할 때 이를 보존합니다. 직접 추출하거나 관리할 필요가 없습니다.

2. **Parallel function call**: model이 parallel function call을 만들면 첫 번째 function call에만 thought signature가 있습니다. 이후 parallel call에는 signature가 없습니다.

3. **Sequential function call**: multi-step function calling 시나리오에서는 각 step의 첫 번째 function call이 보존해야 할 자체 thought signature를 갖습니다.

4. **Context 유지에 필요**: Thought signature는 function calling을 사용하는 multi-turn conversation에서 reasoning context를 유지하는 데 필수입니다. 없으면 model이 이전 reasoning context를 잃을 수 있습니다.

5. **Format**: Thought signature는 response의 tool call에 있는 `provider_specific_fields.thought_signature`에 저장되며, assistant message를 conversation history에 추가하면 자동으로 포함됩니다.

6. **Chat Completions client**: 이전 assistant message가 그대로 포함되는지 제어하기 어려운 chat completions client(예: langchain의 ChatOpenAI)에서는 LiteLLM이 thought signature를 tool call id(`call_123__thought__<thought-signature>`)에 붙여 보존한 뒤, Gemini로 outbound request를 보내기 전에 다시 추출합니다.

## JSON Mode {#json-mode}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['GEMINI_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]



completion(
    model="gemini/gemini-1.5-pro", 
    messages=messages, 
    response_format={"type": "json_object"} # 👈 KEY CHANGE
)

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 model 추가
```yaml
model_list:
  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: os.environ/GEMINI_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. Request 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-pro",
  "messages": [
        {"role": "user", "content": "List 5 popular cookie recipes."}
    ],
  "response_format": {"type": "json_object"}
}
'
```

</TabItem>
</Tabs>
# Gemini-Pro-Vision
LiteLLM은 `url`에 전달되는 다음 image type을 지원합니다.
- direct link가 있는 image - https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg
- local storage의 image - ./localimage.jpeg

## Media Resolution 제어(Images & Videos) {#media-resolution-control-images--videos}

LiteLLM은 Gemini model 사용 시 image resolution을 지정하기 위한 OpenAI의 `detail` parameter를 지원합니다. 동작은 Gemini version에 따라 다릅니다.

| Gemini 버전 | Resolution Control | 동작 |
|----------------|-------------------|----------|
| Gemini 3+ | Per-part | 각 image/video가 자체 `detail` 설정을 가질 수 있음 |
| Gemini 2.x (2.0, 2.5) | Global | 모든 image 중 가장 높은 `detail`이 `generationConfig`의 `mediaResolution`을 통해 global로 적용됨 |

**지원되는 `detail` 값:**
- `"low"` - `MEDIA_RESOLUTION_LOW`로 mapping(이미지 280 token, video frame당 70 token)
- `"medium"` - `MEDIA_RESOLUTION_MEDIUM`으로 mapping
- `"high"` - `MEDIA_RESOLUTION_HIGH`로 mapping(이미지 1120 token)
- `"ultra_high"` - `MEDIA_RESOLUTION_ULTRA_HIGH`로 mapping
- `"auto"` 또는 `None` - model이 최적 resolution을 결정(`media_resolution` 미설정)

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

# Works with both Gemini 2.x and 3+
response = completion(
    model="gemini/gemini-2.5-flash",  # or gemini-3-pro-preview
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
    model="gemini/gemini-3-pro-preview",
    messages=messages,
)
```

</TabItem>
</Tabs>

:::info
**Gemini 3+ Per-Part Resolution:** 각 image 또는 video는 자체 `detail` 설정을 가질 수 있으므로, high-res chart와 low-res icon을 함께 보내는 것처럼 mixed-resolution request가 가능합니다. 이는 `image_url` 및 `file` content type 모두에서 동작합니다.

**Gemini 2.x Global Resolution:** 여러 image의 `detail` 값이 서로 다르면 LiteLLM은 가장 높은 resolution을 사용하고 `generationConfig`의 `mediaResolution`을 통해 global로 적용합니다. 예를 들어 한 image가 `"low"`이고 다른 image가 `"high"`이면 모든 image가 `"high"`를 사용합니다.
:::

## Video Metadata 제어 {#video-metadata-control}

Gemini 3+ model의 경우 LiteLLM은 `video_metadata` field를 통해 세밀한 video processing 제어를 지원합니다. 이를 사용하면 video analysis에 사용할 frame extraction rate와 time range를 지정할 수 있습니다.

**지원되는 `video_metadata` parameter:**

| Parameter | Type | 설명 | 예제 |
|-----------|------|-------------|---------|
| `fps` | Number | frame 추출 속도(frames per second) | `5` |
| `start_offset` | String | video clip processing 시작 시간 | `"10s"` |
| `end_offset` | String | video clip processing 종료 시간 | `"60s"` |

:::note
**Field name 변환:** LiteLLM은 Gemini API에 맞춰 snake_case field name을 camelCase로 자동 변환합니다.
- `start_offset` → `startOffset`
- `end_offset` → `endOffset`
- `fps`는 그대로 유지됩니다.
:::

:::warning
- **Gemini 3+ 전용:** 이 기능은 Gemini 3.0 이상 model에서만 사용할 수 있습니다.
- **Video file 권장:** `video_metadata`는 video file용으로 설계되어 있으며, 다른 media type의 error handling은 Vertex AI API에 위임됩니다.
- **지원 file format:** `gs://`, `https://`, base64-encoded video file에서 동작합니다.
:::

**사용법 예제:**

<Tabs>
<TabItem value="basic" label="기본 Video Metadata">

```python
from litellm import completion

response = completion(
    model="gemini/gemini-3-pro-preview",
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
<TabItem value="combined" label="Detail과 함께 사용">

```python
from litellm import completion

response = completion(
    model="gemini/gemini-3-pro-preview",
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
      model: gemini/gemini-3-pro-preview
      api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. request 보내기

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

## 샘플 사용법 {#sample-usage-1}
```python
import os
import litellm
from dotenv import load_dotenv

# Load the environment variables from .env file
load_dotenv()
os.environ["GEMINI_API_KEY"] = os.getenv('GEMINI_API_KEY')

prompt = 'Describe the image in a few sentences.'
# Note: You can pass here the URL or Path of image directly.
image_url = 'https://storage.googleapis.com/github-repo/img/gemini/intro/landmark3.jpg'

# Create the messages payload according to the documentation
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": prompt
            },
            {
                "type": "image_url",
                "image_url": {"url": image_url}
            }
        ]
    }
]

# Make the API call to Gemini model
response = litellm.completion(
    model="gemini/gemini-pro-vision",
    messages=messages,
)

# Extract the response content
content = response.get('choices', [{}])[0].get('message', {}).get('content')

# Print the result
print(content)
```

## gemini-robotics-er-1.5-preview 사용법

```python
from litellm import api_base
from openai import OpenAI
import os
import base64

client = OpenAI(base_url="http://0.0.0.0:4000", api_key="sk-12345")
base64_image = base64.b64encode(open("closeup-object-on-table-many-260nw-1216144471.webp", "rb").read()).decode()

import json
import re
tools = [{"codeExecution": {}}] 
response = client.chat.completions.create(
    model="gemini/gemini-robotics-er-1.5-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Point to no more than 10 items in the image. The label returned should be an identifying name for the object detected. The answer should follow the json format: [{\"point\": [y, x], \"label\": <label1>}, ...]. The points are in [y, x] format normalized to 0-1000."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]
        }
    ],
    tools=tools
)

# Extract JSON from markdown code block if present
content = response.choices[0].message.content
# Look for triple-backtick JSON block
match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
if match:
    json_str = match.group(1)
else:
    json_str = content

try:
    data = json.loads(json_str)
    print(json.dumps(data, indent=2))
except Exception as e:
    print("Error parsing response as JSON:", e)
    print("Response content:", content)
```

## 사용법 - PDF / Videos / 기타 Files {#usage---pdf--videos--other-files}

### Inline Data(예: audio stream)

LiteLLM은 OpenAI format을 따르며, inline data를 base64로 encoding된 string으로 전송하는 방식을 지원합니다.

사용할 format은 다음과 같습니다.

```python
data:<mime_type>;base64,<encoded_data>
```

**LITELLM CALL**

```python
import litellm
from pathlib import Path
import base64
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

audio_bytes = Path("speech_vertex.mp3").read_bytes()
encoded_data = base64.b64encode(audio_bytes).decode("utf-8")
print("Audio Bytes = {}".format(audio_bytes))
model = "gemini/gemini-1.5-flash"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the audio."},
                {
                    "type": "file",
                    "file": {
                        "file_data": "data:audio/mp3;base64,{}".format(encoded_data), # 👈 SET MIME_TYPE + DATA
                    }
                },
            ],
        }
    ],
)
```

**동일한 GOOGLE API CALL** 

```python
# Initialize a Gemini model appropriate for your use case.
model = genai.GenerativeModel('models/gemini-1.5-flash')

# Create the prompt.
prompt = "Please summarize the audio."

# Load the samplesmall.mp3 file into a Python Blob object containing the audio
# file's bytes and then pass the prompt and the audio to Gemini.
response = model.generate_content([
    prompt,
    {
        "mime_type": "audio/mp3",
        "data": pathlib.Path('samplesmall.mp3').read_bytes()
    }
])

# Output Gemini's response to the prompt and the inline audio.
print(response.text)
```

### https:// file 

```python
import litellm
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

model = "gemini/gemini-1.5-flash"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the file."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "https://storage...", # 👈 SET THE IMG URL
                        "format": "application/pdf" # OPTIONAL
                    }
                },
            ],
        }
    ],
)
```

### gs:// file 

```python
import litellm
import os

os.environ["GEMINI_API_KEY"] = "" 

litellm.set_verbose = True # 👈 See Raw call 

model = "gemini/gemini-1.5-flash"
response = litellm.completion(
    model=model,
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please summarize the file."},
                {
                    "type": "file",
                    "file": {
                        "file_id": "gs://storage...", # 👈 SET THE IMG URL
                        "format": "application/pdf" # OPTIONAL
                    }
                },
            ],
        }
    ],
)
```


## Chat 모델
:::tip

**모든 Gemini model을 지원합니다. LiteLLM request를 보낼 때 `model=gemini/<any-model-on-gemini>` prefix만 설정하면 됩니다.**

:::
| Model 이름            | Function Call                                          | 필요한 OS 변수          |
|-----------------------|--------------------------------------------------------|--------------------------------|
| `gemini-pro`            | `completion(model='gemini/gemini-pro', messages)`            | `os.environ['GEMINI_API_KEY']` |
| `gemini-1.5-pro-latest` | `completion(model='gemini/gemini-1.5-pro-latest', messages)` | `os.environ['GEMINI_API_KEY']` |
| `gemini-2.0-flash`     | `completion(model='gemini/gemini-2.0-flash', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-2.0-flash-exp`     | `completion(model='gemini/gemini-2.0-flash-exp', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-2.0-flash-lite-preview-02-05`	     | `completion(model='gemini/gemini-2.0-flash-lite-preview-02-05', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-2.5-flash-preview-09-2025`     | `completion(model='gemini/gemini-2.5-flash-preview-09-2025', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-2.5-flash-lite-preview-09-2025`     | `completion(model='gemini/gemini-2.5-flash-lite-preview-09-2025', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-3.1-flash-lite-preview`     | `completion(model='gemini/gemini-3.1-flash-lite-preview', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-flash-latest`     | `completion(model='gemini/gemini-flash-latest', messages)`     | `os.environ['GEMINI_API_KEY']` |
| `gemini-flash-lite-latest`     | `completion(model='gemini/gemini-flash-lite-latest', messages)`     | `os.environ['GEMINI_API_KEY']` |



## Context 캐싱

Google AI Studio context caching은 message content block에서 다음을 사용해 지원됩니다.

```bash
{
    {
        "role": "system",
        "content": ...,
        "cache_control": {"type": "ephemeral"} # 👈 KEY CHANGE
    },
    ...
}
```

### Custom TTL 지원 {#custom-ttl-support}

이제 `ttl` parameter를 사용해 cached content의 사용자 지정 Time-To-Live(TTL)를 지정할 수 있습니다.

```bash
{
    {
        "role": "system",
        "content": ...,
        "cache_control": {
            "type": "ephemeral",
            "ttl": "3600s"  # 👈 Cache for 1 hour
        }
    },
    ...
}
```

**TTL format 요구 사항:**
- 초를 의미하는 's'로 끝나는 string이어야 합니다.
- 양수를 포함해야 합니다(decimal 가능).
- 예제: `"3600s"` (1시간), `"7200s"` (2시간), `"1800s"` (30분), `"1.5s"` (1.5초)

**TTL 동작:**
- 여러 cached message가 서로 다른 TTL을 가지면 처음 발견된 유효한 TTL이 사용됩니다.
- 유효하지 않은 TTL format은 무시되며 cache는 Google의 기본 expiration time을 사용합니다.
- TTL을 지정하지 않으면 Google의 기본 cache expiration(약 1시간)이 적용됩니다.

### 아키텍처 Diagram {#architecture-diagram}

<Image img={require('../../img/gemini_context_caching.png')} />

**참고:**

- [관련 code](https://github.com/BerriAI/litellm/blob/main/litellm/llms/vertex_ai/context_caching/vertex_ai_context_caching.py#L255)

- Gemini Context 캐싱은 continuous message block 1개만 cache할 수 있습니다.

- 여러 non-continuous block에 `cache_control`이 있으면 첫 번째 continuous block이 사용됩니다. ([Gemini format](https://ai.google.dev/api/caching#cache_create-SHELL)으로 `/cachedContent`에 전송)

- Gemini의 `/generateContent` endpoint로 보내는 raw request는 다음과 같습니다.

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=$GOOGLE_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
      "contents": [
        {
          "parts":[{
            "text": "Please summarize this transcript"
          }],
          "role": "user"
        },
      ],
      "cachedContent": "'$CACHE_NAME'"
    }'

```

### 예제 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

for _ in range(2): 
    resp = completion(
        model="gemini/gemini-1.5-pro",
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
<TabItem value="sdk-ttl" label="Custom TTL 포함 SDK">

```python
from litellm import completion 

# Cache for 2 hours (7200 seconds)
resp = completion(
    model="gemini/gemini-1.5-pro",
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
    - model_name: gemini-1.5-pro
      litellm_params:
        model: gemini/gemini-1.5-pro
        api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

[**Langchain, OpenAI JS, Llamaindex 등 예제 보기**](../proxy/user_keys.md#request-format)

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gemini-1.5-pro",
    "messages": [
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
            }],
}'
```
</TabItem>
<TabItem value="curl-ttl" label="Custom TTL 포함 Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gemini-1.5-pro",
    "messages": [
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
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
                    "text": "What are the key terms and conditions in this agreement?",
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "3600s"
                    }
                }
            ]
        }
    ]
}'
```
</TabItem>
<TabItem value="openai-python" label="OpenAI Python SDK">

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)


response = await client.chat.completions.create(
    model="gemini-1.5-pro",
    messages=[
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
        {
            "role": "user",
            "content": "what are the key terms and conditions in this agreement?",
        },
    ]
)

```

</TabItem>
<TabItem value="openai-python-ttl" label="TTL 포함 OpenAI Python SDK">

```python 
import openai
client = openai.AsyncOpenAI(
    api_key="anything",            # litellm proxy api key
    base_url="http://0.0.0.0:4000" # litellm proxy base url
)

response = await client.chat.completions.create(
    model="gemini-1.5-pro",
    messages=[
        {
            "role": "system",
            "content": [
                {
                    "type": "text",
                    "text": "Here is the full text of a complex legal agreement" * 4000,
                    "cache_control": {
                        "type": "ephemeral",
                        "ttl": "7200s"  # Cache for 2 hours
                    }
                }
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

</TabItem>
</Tabs>

## Image Generation {#image-generation}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)
assert response.choices[0].message.content is not None # "data:image/png;base64,e4rr.."
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gemini-2.0-flash-exp-image-generation
    litellm_params:
      model: gemini/gemini-2.0-flash-exp-image-generation
      api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://localhost:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gemini-2.0-flash-exp-image-generation",
    "messages": [{"role": "user", "content": "Generate an image of a cat"}],
    "modalities": ["image", "text"]
}'
```

</TabItem>
</Tabs>

### Image Generation 가격 {#image-generation-pricing}

Gemini image generation model(예: `gemini-3-pro-image-preview`)은 response usage에 `image_tokens`를 반환합니다. 이 token은 text token과 다른 가격이 적용됩니다.

| Token type | 1M token당 가격 | token당 가격 |
|------------|---------------------|-----------------|
| Text output | $12 | $0.000012 |
| Image output | $120 | $0.00012 |

image token 수는 output resolution에 따라 달라집니다.

| Resolution | image당 token | image당 비용 |
|------------|------------------|----------------|
| 1K-2K (1024x1024~2048x2048) | 1,120 | $0.134 |
| 4K (4096x4096) | 2,000 | $0.24 |

LiteLLM은 model pricing configuration의 `output_cost_per_image_token`을 사용해 cost를 자동 계산합니다.

**예제 response usage:**
```json
{
    "completion_tokens_details": {
        "reasoning_tokens": 225,
        "text_tokens": 0,
        "image_tokens": 1120
    }
}
```

자세한 내용은 [Google Gemini 가격 문서](https://ai.google.dev/gemini-api/docs/pricing)를 참고하세요.
