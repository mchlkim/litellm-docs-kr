import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Novita AI

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Novita AI는 경제적이고 안정적인 GPU 클라우드 인프라를 기반으로, 개발자가 간단한 API를 통해 AI 모델을 쉽게 배포할 수 있도록 돕는 AI 클라우드 플랫폼입니다. LiteLLM은 [Novita AI](https://novita.ai/models/llm?utm_source=github_litellm&utm_medium=github_readme&utm_campaign=github_link)의 모든 모델을 지원합니다. |
| LiteLLM의 Provider 라우트 | `novita/` |
| Provider 문서 | [Novita AI 문서 ↗](https://novita.ai/docs/guides/introduction) |
| Provider API 엔드포인트 | https://api.novita.ai/v3/openai |
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/completions` |

<br />

## API 키 {#api-key}

[여기](https://novita.ai/settings/key-management)에서 API 키를 발급받으세요.
```python
import os
os.environ["NOVITA_API_KEY"] = "your-api-key"
```

## 지원되는 OpenAI 파라미터 {#supported-openai-params}
- max_tokens
- stream
- stream_options
- n
- seed
- frequency_penalty
- presence_penalty
- repetition_penalty
- stop
- temperature
- top_p
- top_k
- min_p
- logit_bias
- logprobs
- top_logprobs
- tools
- response_format
- separate_reasoning


## 예제 사용법 {#usage-example}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion
os.environ["NOVITA_API_KEY"] = ""

response = completion(
    model="novita/deepseek/deepseek-r1-turbo",
    messages=[{"role": "user", "content": "List 5 popular cookie recipes."}]
)

content = response.get('choices', [{}])[0].get('message', {}).get('content')
print(content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: deepseek-r1-turbo
    litellm_params:
      model: novita/deepseek/deepseek-r1-turbo
      api_key: os.environ/NOVITA_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. 요청 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk_sujEQQEjTRxGUiMLN3TJh2KadRX4pw2TLWRoIKeoYZ0' \
-d '{
  "model": "deepseek-r1-turbo",
  "messages": [
      {"role": "user", "content": "List 5 popular cookie recipes."}
  ]
}
'
```

</TabItem>
</Tabs>


## 도구 호출 {#tool-calling}

```python
from litellm import completion
import os
# set env
os.environ["NOVITA_API_KEY"] = ""

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
    model="novita/deepseek/deepseek-r1-turbo",
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

## JSON 모드 {#json-mode}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import json 
import os 

os.environ['NOVITA_API_KEY'] = ""

messages = [
    {
        "role": "user",
        "content": "List 5 popular cookie recipes."
    }
]

completion(
    model="novita/deepseek/deepseek-r1-turbo", 
    messages=messages, 
    response_format={"type": "json_object"} # 👈 KEY CHANGE
)

print(json.loads(completion.choices[0].message.content))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델 추가
```yaml
model_list:
  - model_name: deepseek-r1-turbo
    litellm_params:
      model: novita/deepseek/deepseek-r1-turbo
      api_key: os.environ/NOVITA_API_KEY
```

2. Proxy 시작

```
$ litellm --config /path/to/config.yaml
```

3. 요청 보내기

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "deepseek-r1-turbo",
  "messages": [
      {"role": "user", "content": "List 5 popular cookie recipes."}
  ],
  "response_format": {"type": "json_object"}
}
'
```

</TabItem>
</Tabs>


## 채팅 모델 {#chat-models}

🚨 LiteLLM은 모든 Novita AI 모델을 지원합니다. Novita AI로 요청을 보내려면 `model=novita/<your-novita-model>`을 전송하세요. 모든 Novita AI 모델은 [여기](https://novita.ai/models/llm?utm_source=github_litellm&utm_medium=github_readme&utm_campaign=github_link)에서 확인할 수 있습니다.

| 모델 이름                | 함수 호출                                       |
|---------------------------|-----------------------------------------------------|
| `novita/deepseek/deepseek-r1-turbo` | `completion('novita/deepseek/deepseek-r1-turbo', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/deepseek/deepseek-v3-turbo` | `completion('novita/deepseek/deepseek-v3-turbo', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/deepseek/deepseek-v3-0324` | `completion('novita/deepseek/deepseek-v3-0324', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/qwen/qwen3-235b-a22b-fp8` | `completion('novita/qwen/qwen/qwen3-235b-a22b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/qwen/qwen3-30b-a3b-fp8` | `completion('novita/qwen/qwen3-30b-a3b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/qwen/qwen/qwen3-32b-fp8` | `completion('novita/qwen/qwen3-32b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/qwen/qwen3-30b-a3b-fp8` | `completion('novita/qwen/qwen3-30b-a3b-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/qwen/qwen2.5-vl-72b-instruct` | `completion('novita/qwen/qwen2.5-vl-72b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/meta-llama/llama-4-maverick-17b-128e-instruct-fp8` | `completion('novita/meta-llama/llama-4-maverick-17b-128e-instruct-fp8', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/meta-llama/llama-3.3-70b-instruct` | `completion('novita/meta-llama/llama-3.3-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/meta-llama/llama-3.1-8b-instruct` | `completion('novita/meta-llama/llama-3.1-8b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/meta-llama/llama-3.1-8b-instruct-max` | `completion('novita/meta-llama/llama-3.1-8b-instruct-max', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/meta-llama/llama-3.1-70b-instruct` | `completion('novita/meta-llama/llama-3.1-70b-instruct', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/gryphe/mythomax-l2-13b` | `completion('novita/gryphe/mythomax-l2-13b', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/google/gemma-3-27b-it` | `completion('novita/google/gemma-3-27b-it', messages)` | `os.environ['NOVITA_API_KEY']` |
| `novita/mistralai/mistral-nemo` | `completion('novita/mistralai/mistral-nemo', messages)` | `os.environ['NOVITA_API_KEY']` |
