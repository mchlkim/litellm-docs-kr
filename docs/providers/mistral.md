import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Mistral AI API
https://docs.mistral.ai/api/

## API 키 {#api-key}
```python
# env variable
os.environ['MISTRAL_API_KEY']
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = ""
response = completion(
    model="mistral/mistral-tiny", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - Streaming {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = ""
response = completion(
    model="mistral/mistral-tiny", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```



## LiteLLM Proxy 사용법 {#usage-with-litellm-proxy}

### 1. config.yaml에서 Mistral 모델 설정 {#1-set-mistral-model-on-configyaml}

```yaml
model_list:
  - model_name: mistral-small-latest
    litellm_params:
      model: mistral/mistral-small-latest
      api_key: "os.environ/MISTRAL_API_KEY" # ensure you have `MISTRAL_API_KEY` in your .env
```

### 2. Proxy 시작 {#2-start-proxy}

```
litellm --config config.yaml
```

### 3. 테스트 {#3-test-it}


<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "mistral-small-latest",
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

response = client.chat.completions.create(model="mistral-small-latest", messages = [
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
    model = "mistral-small-latest",
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

## 지원되는 모델 {#supported-models}

:::info
여기에 나열된 모든 모델 https://docs.mistral.ai/platform/endpoints 을 지원합니다. 모델, 가격, 토큰 윈도우 등의 목록은 [여기](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 지속적으로 관리합니다.

:::


| 모델 이름     | 함수 호출                                                | Reasoning 지원 |
|----------------|--------------------------------------------------------------|-------------------|
| Mistral Small  | `completion(model="mistral/mistral-small-latest", messages)` | 아니요 |
| Mistral Medium | `completion(model="mistral/mistral-medium-latest", messages)`| 아니요 |
| Mistral Large 2  | `completion(model="mistral/mistral-large-2407", messages)` | 아니요 |
| Mistral Large Latest  | `completion(model="mistral/mistral-large-latest", messages)` | 아니요 |
| **Magistral Small**  | `completion(model="mistral/magistral-small-2506", messages)` | 예 |
| **Magistral Medium** | `completion(model="mistral/magistral-medium-2506", messages)`| 예 |
| Mistral 7B     | `completion(model="mistral/open-mistral-7b", messages)`      | 아니요 |
| Mixtral 8x7B   | `completion(model="mistral/open-mixtral-8x7b", messages)`    | 아니요 |
| Mixtral 8x22B  | `completion(model="mistral/open-mixtral-8x22b", messages)`   | 아니요 |
| Codestral      | `completion(model="mistral/codestral-latest", messages)`     | 아니요 |
| Mistral NeMo      | `completion(model="mistral/open-mistral-nemo", messages)`     | 아니요 |
| Mistral NeMo 2407      | `completion(model="mistral/open-mistral-nemo-2407", messages)`     | 아니요 |
| Codestral Mamba      | `completion(model="mistral/open-codestral-mamba", messages)`     | 아니요 |
| Codestral Mamba    | `completion(model="mistral/codestral-mamba-latest"", messages)`     | 아니요 |

## Function Calling {#function-calling}

```python
from litellm import completion

# set env
os.environ["MISTRAL_API_KEY"] = "your-api-key"

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
    model="mistral/mistral-large-latest",
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

## Reasoning {#reasoning}

Mistral은 Reasoning을 직접 지원하지 않으며, 대신 Magistral 모델과 함께 사용할 특정 [system prompt](https://docs.mistral.ai/capabilities/reasoning/)를 권장합니다. `reasoning_effort` 파라미터를 설정하면 LiteLLM이 요청 앞에 system prompt를 추가합니다.

기존 system message가 제공되면 LiteLLM은 두 메시지를 system message 목록으로 함께 전송합니다. `litellm._turn_on_debug()`를 활성화해 이를 확인할 수 있습니다.

### 지원되는 모델 {#supported-models-1}

| 모델 이름     | 함수 호출                                                |
|----------------|--------------------------------------------------------------|
| Magistral Small  | `completion(model="mistral/magistral-small-2506", messages)` |
| Magistral Medium | `completion(model="mistral/magistral-medium-2506", messages)`|

### reasoning_effort 사용 {#using-reasoning-effort}

`reasoning_effort` 파라미터는 Magistral 모델과 함께 사용할 때 모델이 Reasoning에 들이는 노력의 정도를 제어합니다.

```python
from litellm import completion
import os

os.environ['MISTRAL_API_KEY'] = "your-api-key"

response = completion(
    model="mistral/magistral-medium-2506",
    messages=[
        {"role": "user", "content": "What is 15 multiplied by 7?"}
    ],
    reasoning_effort="medium"  # Options: "low", "medium", "high"
)

print(response)
```

### System Message 예제 {#example-with-system-message}

이미 system message가 있는 경우 LiteLLM은 Reasoning 지침을 앞에 추가합니다.

```python
response = completion(
    model="mistral/magistral-medium-2506",
    messages=[
        {"role": "system", "content": "You are a helpful math tutor."},
        {"role": "user", "content": "Explain how to solve quadratic equations."}
    ],
    reasoning_effort="high"
)

# The system message becomes:
# "When solving problems, think step-by-step in <think> tags before providing your final answer...
#  
#  You are a helpful math tutor."
```

### LiteLLM Proxy 사용법 {#usage-with-litellm-proxy-1}

LiteLLM Proxy를 통해서도 Reasoning 기능을 사용할 수 있습니다.

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
      "model": "magistral-medium-2506",
      "messages": [
        {
          "role": "user",
          "content": "What is the square root of 144? Show your reasoning."
        }
      ],
      "reasoning_effort": "medium"
    }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="magistral-medium-2506", 
    messages=[
        {
            "role": "user",
            "content": "Calculate the area of a circle with radius 5. Show your work."
        }
    ],
    reasoning_effort="high"
)

print(response)
```
</TabItem>
</Tabs>

### 중요 참고 사항 {#important-notes}

- **모델 호환성**: Reasoning 파라미터는 Magistral 모델에서만 작동합니다.
- **이전 버전 호환성**: Magistral이 아닌 모델은 Reasoning 파라미터를 무시하고 정상적으로 작동합니다.

## 오디오 전사 {#audio-transcription}

`litellm.transcription()`을 통해 Mistral의 Voxtral 모델로 오디오 전사를 사용할 수 있습니다.

### SDK 사용법

```python
from litellm import transcription
import os

os.environ["MISTRAL_API_KEY"] = ""

audio_file = open("path/to/audio.wav", "rb")

response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
)

print(response.text)
```

### Optional Parameters 사용 {#with-optional-parameters}

```python
response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
    language="en",
    temperature=0.0,
    response_format="json",
)
```

### Mistral 전용 파라미터 {#mistral-specific-parameters}

Mistral은 OpenAI 호환 파라미터 외에도 추가 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `diarize` | `bool` | speaker diarization 활성화 |

```python
response = transcription(
    model="mistral/voxtral-mini-latest",
    file=audio_file,
    diarize=True,
)
```

### LiteLLM Proxy 사용법 {#usage-with-litellm-proxy-2}

```yaml
model_list:
  - model_name: voxtral
    litellm_params:
      model: mistral/voxtral-mini-latest
      api_key: os.environ/MISTRAL_API_KEY
    model_info:
      mode: audio_transcription
```

```bash
litellm --config /path/to/config.yaml
```

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"audio.wav"' \
--form 'model="voxtral"'
```

## Embedding 샘플 사용법 {#sample-usage---embedding}
```python
from litellm import embedding
import os

os.environ['MISTRAL_API_KEY'] = ""
response = embedding(
    model="mistral/mistral-embed",
    input=["good morning from litellm"],
)
print(response)
```


## 지원되는 모델 {#supported-models-2}
여기에 나열된 모든 모델 https://docs.mistral.ai/platform/endpoints 을 지원합니다.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Mistral Embeddings` | `embedding(model="mistral/mistral-embed", input)` | 
