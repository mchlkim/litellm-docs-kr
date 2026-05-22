import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Clarifai
Anthropic, OpenAI, Qwen, xAI, Gemini와 대부분의 오픈 소스 LLM은 Clarifai에서 지원됩니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Clarifai는 통합 API를 통해 다양한 LLM에 접근할 수 있게 해주는 강력한 AI 플랫폼입니다. LiteLLM은 OpenAI 호환 인터페이스로 Clarifai 모델과 매끄럽게 연동할 수 있게 해줍니다. |
| 제공자 문서 | [Clarifai ↗](https://docs.clarifai.com/) |
| 제공자용 OpenAI 호환 엔드포인트 | `https://api.clarifai.com/v2/ext/openai/v1` |
| 지원 엔드포인트 | `/chat/completions` |

## 사전 요구 사항 {#pre-requisites}

```bash
uv add litellm
```

## 필수 환경 변수 {#required-environment-variables}
Clarifai Personal access token을 발급하려면 이 [링크](https://docs.clarifai.com/clarifai-basics/authentication/personal-access-tokens/)를 따르세요.

```python
os.environ["CLARIFAI_PAT"] = "CLARIFAI_API_KEY"  # CLARIFAI_PAT
```

## 사용법

```python
import os
from litellm import completion

os.environ["CLARIFAI_API_KEY"] = ""

response = completion(
  model="clarifai/openai.chat-completion.gpt-oss-20b",
  messages=[{ "content": "Tell me a joke about physics?","role": "user"}]
)
```
## 스트리밍 지원 {#streaming-support}

LiteLLM은 Clarifai 모델의 스트리밍 응답을 지원합니다.

```python
import litellm

for chunk in litellm.completion(
    model="clarifai/openai.chat-completion.gpt-oss-20b",
    api_key="CLARIFAI_API_KEY",
    messages=[
        {"role": "user", "content": "Tell me a fun fact about space."}
    ],
    stream=True,
):
    print(chunk.choices[0].delta)
```

## 도구 호출 (Function Calling)

LiteLLM을 통해 접근하는 Clarifai 모델은 function calling을 지원합니다.

```python
import litellm

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Tokyo, Japan"
                }
            },
            "required": ["location"],
            "additionalProperties": False
        },
    }
  }
}]

response = litellm.completion(
    model="clarifai/openai.chat-completion.gpt-oss-20b",
    api_key="CLARIFAI_API_KEY",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=tools,
)

print(response.choices[0].message.tool_calls)
```

## Clarifai 모델 {#clarifai-models}
LiteLLM은 [Clarifai community](https://clarifai.com/explore/models?filterData=%5B%7B%22field%22%3A%22use_cases%22%2C%22value%22%3A%5B%22llm%22%5D%7D%5D&page=1&perPage=24)의 모든 모델을 지원합니다.

### 🧠 OpenAI 모델
- [gpt-oss-20b](https://clarifai.com/openai/chat-completion/models/gpt-oss-20b)
- [gpt-oss-120b](https://clarifai.com/openai/chat-completion/models/gpt-oss-120b)
- [gpt-5-nano](https://clarifai.com/openai/chat-completion/models/gpt-5-nano)
- [gpt-5-mini](https://clarifai.com/openai/chat-completion/models/gpt-5-mini)
- [gpt-5](https://clarifai.com/openai/chat-completion/models/gpt-5)
- [gpt-4o](https://clarifai.com/openai/chat-completion/models/gpt-4o)
- [o3](https://clarifai.com/openai/chat-completion/models/o3)
- 그 외 다수...


### 🤖 Anthropic 모델
- [claude-sonnet-4](https://clarifai.com/anthropic/completion/models/claude-sonnet-4)
- [claude-opus-4](https://clarifai.com/anthropic/completion/models/claude-opus-4)
- [claude-3_5-haiku](https://clarifai.com/anthropic/completion/models/claude-3_5-haiku)
- [claude-3_7-sonnet](https://clarifai.com/anthropic/completion/models/claude-3_7-sonnet)
- 그 외 다수...


### 🪄 xAI 모델
- [grok-3](https://clarifai.com/xai/chat-completion/models/grok-3)
- [grok-2-vision-1212](https://clarifai.com/xai/chat-completion/models/grok-2-vision-1212)
- [grok-2-1212](https://clarifai.com/xai/chat-completion/models/grok-2-1212)
- [grok-code-fast-1](https://clarifai.com/xai/chat-completion/models/grok-code-fast-1)
- [grok-2-image-1212](https://clarifai.com/xai/image-generation/models/grok-2-image-1212)
- 그 외 다수...


### 🔷 Google Gemini 모델
- [gemini-2_5-pro](https://clarifai.com/gcp/generate/models/gemini-2_5-pro)
- [gemini-2_5-flash-lite](https://clarifai.com/gcp/generate/models/gemini-2_5-flash-lite)
- [gemini-2_0-flash](https://clarifai.com/gcp/generate/models/gemini-2_0-flash)
- [gemini-2_0-flash-lite](https://clarifai.com/gcp/generate/models/gemini-2_0-flash-lite)
- 그 외 다수...


### 🧩 Qwen 모델
- [Qwen3-30B-A3B-Instruct-2507](https://clarifai.com/qwen/qwenLM/models/Qwen3-30B-A3B-Instruct-2507)
- [Qwen3-30B-A3B-Thinking-2507](https://clarifai.com/qwen/qwenLM/models/Qwen3-30B-A3B-Thinking-2507)
- [Qwen3-14B](https://clarifai.com/qwen/qwenLM/models/Qwen3-14B)
- [QwQ-32B-AWQ](https://clarifai.com/qwen/qwenLM/models/QwQ-32B-AWQ)
- [Qwen2_5-VL-7B-Instruct](https://clarifai.com/qwen/qwen-VL/models/Qwen2_5-VL-7B-Instruct)
- [Qwen3-Coder-30B-A3B-Instruct](https://clarifai.com/qwen/qwenCoder/models/Qwen3-Coder-30B-A3B-Instruct)
- 그 외 다수...


### 💡 MiniCPM (OpenBMB) 모델
- [MiniCPM-o-2_6-language](https://clarifai.com/openbmb/miniCPM/models/MiniCPM-o-2_6-language)
- [MiniCPM3-4B](https://clarifai.com/openbmb/miniCPM/models/MiniCPM3-4B)
- [MiniCPM4-8B](https://clarifai.com/openbmb/miniCPM/models/MiniCPM4-8B)
- 그 외 다수...


### 🧬 Microsoft Phi 모델
- [Phi-4-reasoning-plus](https://clarifai.com/microsoft/text-generation/models/Phi-4-reasoning-plus)
- [phi-4](https://clarifai.com/microsoft/text-generation/models/phi-4)
- 그 외 다수...


### 🦙 Meta Llama 모델
- [Llama-3_2-3B-Instruct](https://clarifai.com/meta/Llama-3/models/Llama-3_2-3B-Instruct)
- 그 외 다수...


### 🔍 DeepSeek 모델
- [DeepSeek-R1-0528-Qwen3-8B](https://clarifai.com/deepseek-ai/deepseek-chat/models/DeepSeek-R1-0528-Qwen3-8B)
- 그 외 다수...

## LiteLLM Proxy에서 사용하기 {#usage-with-litellm-proxy}

LiteLLM Proxy Server에서 Clarifai를 호출하는 방법은 다음과 같습니다.

### 1. 환경에 키 저장 {#1-save-key-in-your-environment}

```bash
export CLARIFAI_PAT="CLARIFAI_API_KEY"
```

### 2. 프록시 시작

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: clarifai-model
    litellm_params:
      model: clarifai/openai.chat-completion.gpt-oss-20b
      api_key: os.environ/CLARIFAI_PAT
```

```bash
litellm --config /path/to/config.yaml

# Server running on http://0.0.0.0:4000
```
</TabItem>
</Tabs>

### 3. 테스트 {#3-test-it}

<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "clarifai-model",
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

response = client.chat.completions.create(
    model="clarifai-model",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
)

print(response)
```
</TabItem>
</Tabs>

## 중요 참고 사항 {#important-notes}

- 모델 이름을 지정할 때는 Clarifai model ID 앞에 항상 `clarifai/`를 붙이세요.
- API 키로 Clarifai Personal Access Token (PAT)을 사용하세요.
- 사용량은 Clarifai를 통해 추적되고 과금됩니다.
- API rate limit은 Clarifai 계정 설정의 적용을 받습니다.
- 대부분의 OpenAI 파라미터가 지원되지만, 일부 고급 기능은 모델에 따라 다를 수 있습니다.


## FAQ {#faqs}

| 질문 | 답변 |
|----------|---------|
| 모든 Clarifai 모델을 LiteLLM에서 사용할 수 있나요? | 대부분의 chat-completion 모델이 지원됩니다. Clarifai model URL을 `model`로 사용하세요. |
| 별도의 Clarifai PAT가 필요한가요? | 예. 유효한 Clarifai Personal Access Token을 사용해야 합니다. |
| tool calling이 지원되나요? | 예. 기반 Clarifai 모델이 function/tool calling을 지원하는 경우 사용할 수 있습니다. |
| 과금은 어떻게 처리되나요? | Clarifai 사용량은 Clarifai를 통해 별도로 과금됩니다. |

## 추가 리소스 {#additional-resources}

- [Clarifai 문서](https://docs.clarifai.com/)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm)
- [Clarifai Runners 예제](https://github.com/Clarifai/runners-examples)
