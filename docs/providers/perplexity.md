import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Perplexity AI (`pplx-api`)
https://www.perplexity.ai

## API 키 {#api-key}
```python
# env variable
os.environ['PERPLEXITYAI_API_KEY']
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-pro", 
    messages=messages
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage-streaming}
```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-pro", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 추론 노력 수준 {#reasoning-effort}

v1.72.6 이상이 필요합니다.

:::info

LiteLLM에서 추론 기능을 사용하는 전체 가이드는 [여기](../reasoning_content)에서 확인하세요.

:::

`reasoning_effort` 파라미터를 설정해 추론 노력 수준을 지정할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-reasoning", 
    messages=messages,
    reasoning_effort="high"
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: perplexity-sonar-reasoning-model
    litellm_params:
        model: perplexity/sonar-reasoning
        api_key: os.environ/PERPLEXITYAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

[설정](../proxy/virtual_keys)한 LiteLLM Proxy Virtual Key가 있다면 `anything`을 해당 키로 바꾸세요.

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "perplexity-sonar-reasoning-model",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "reasoning_effort": "high"
  }'
```

</TabItem>
</Tabs>

## 지원 모델 {#supported-models}
여기에 나열된 모든 모델 https://docs.perplexity.ai/docs/model-cards 이 지원됩니다. `model=perplexity/<model-name>` 형식으로 사용하면 됩니다.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sonar-deep-research` | `completion(model="perplexity/sonar-deep-research", messages)` | 
| `sonar-reasoning-pro` | `completion(model="perplexity/sonar-reasoning-pro", messages)` | 
| `sonar-reasoning` | `completion(model="perplexity/sonar-reasoning", messages)` | 
| `sonar-pro` | `completion(model="perplexity/sonar-pro", messages)` | 
| `sonar` | `completion(model="perplexity/sonar", messages)` | 
| `r1-1776` | `completion(model="perplexity/r1-1776", messages)` | 






## Agent API (Responses API) 개요 {#agent-api-responses-api}

v1.72.6 이상이 필요합니다.


### 프리셋 사용 {#using-presets}

프리셋은 특정 사용 사례에 맞는 최적화된 기본값을 제공합니다. 빠르게 설정하려면 프리셋으로 시작하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

# Using the pro-search preset
response = responses(
    model="perplexity/preset/pro-search",
    input="What are the latest developments in AI?",
    custom_llm_provider="perplexity",
)

print(response.output)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: perplexity-pro-search
    litellm_params:
        model: perplexity/preset/pro-search
        api_key: os.environ/PERPLEXITY_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "perplexity-pro-search",
    "input": "What are the latest developments in AI?"
  }'
```

</TabItem>
</Tabs>

### 서드파티 모델 사용 {#using-third-party-models}

Perplexity의 통합 API를 통해 OpenAI, Anthropic, Google, xAI 및 기타 제공자의 모델에 접근할 수 있습니다.

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/gpt-5.2",
    input="Explain quantum computing in simple terms",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/anthropic/claude-sonnet-4-5",
    input="Write a short story about a robot learning to paint",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="google" label="Google">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/google/gemini-2.5-flash",
    input="Explain the concept of neural networks",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="xai" label="xAI">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/xai/grok-4-1-fast-non-reasoning",
    input="What makes a good AI assistant?",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
</Tabs>

### 웹 검색 도구 {#web-search-tool}

실시간 정보에 접근하려면 웹 검색 기능을 활성화하세요.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/gpt-5.2",
    input="What's the weather in San Francisco today?",
    custom_llm_provider="perplexity",
    tools=[{"type": "web_search"}],
    instructions="You have access to a web_search tool. Use it for questions about current events.",
)

print(response.output)
```

### 함수 호출 {#function-calling}

Agent API는 사용자 지정 함수 도구를 지원합니다. 함수 도구는 변경하지 않고 그대로 전달하세요.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/gpt-5.2",
    input="What's the weather in San Francisco?",
    custom_llm_provider="perplexity",
    tools=[
        {"type": "web_search"},
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                },
            },
        },
    ],
    instructions="Use tools when appropriate.",
)

print(response.output)
```

### 구조화된 출력 {#structured-outputs}

`text` 파라미터를 통해 JSON 스키마 구조화 출력을 요청할 수 있습니다.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/preset/pro-search",
    input="Extract key facts about the Eiffel Tower",
    custom_llm_provider="perplexity",
    text={
        "format": {
            "type": "json_schema",
            "name": "facts",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "height_meters": {"type": "number"},
                    "year_built": {"type": "integer"},
                },
                "required": ["name", "height_meters", "year_built"],
            },
            "strict": True,
        }
    },
)

print(response.output)
```


### 추론 노력 수준 (Responses API) {#reasoning-effort-responses-api}

추론을 지원하는 모델의 추론 노력 수준을 제어합니다.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/gpt-5.2",
    input="Solve this complex problem step by step",
    custom_llm_provider="perplexity",
    reasoning={"effort": "high"},  # Options: low, medium, high
    max_output_tokens=1000,
)

print(response.output)
```

### 멀티턴 대화 {#multi-turn-conversations}

컨텍스트가 있는 멀티턴 대화에는 메시지 배열을 사용하세요.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/anthropic/claude-sonnet-4-5",
    input=[
        {"type": "message", "role": "system", "content": "You are a helpful assistant."},
        {"type": "message", "role": "user", "content": "What are the latest AI developments?"},
    ],
    custom_llm_provider="perplexity",
    instructions="Provide detailed, well-researched answers.",
    max_output_tokens=800,
)

print(response.output)
```

### 스트리밍 응답 {#streaming-responses}

실시간 출력에는 응답을 스트림으로 받으세요.

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/gpt-5.2",
    input="Tell me a story about space exploration",
    custom_llm_provider="perplexity",
    stream=True,
    max_output_tokens=500,
)

for chunk in response:
    if hasattr(chunk, 'type'):
        if chunk.type == "response.output_text.delta":
            print(chunk.delta, end="", flush=True)
```

### 지원되는 서드파티 모델 {#supported-third-party-models}

| 제공자 | 모델 이름 | 함수 호출 |
|----------|------------|---------------|
| OpenAI | `gpt-5.2` | `responses(model="perplexity/openai/gpt-5.2", ...)` |
| OpenAI | `gpt-5.1` | `responses(model="perplexity/openai/gpt-5.1", ...)` |
| OpenAI | `gpt-5-mini` | `responses(model="perplexity/openai/gpt-5-mini", ...)` |
| Anthropic | `claude-opus-4-6` | `responses(model="perplexity/anthropic/claude-opus-4-6", ...)` |
| Anthropic | `claude-opus-4-5` | `responses(model="perplexity/anthropic/claude-opus-4-5", ...)` |
| Anthropic | `claude-sonnet-4-5` | `responses(model="perplexity/anthropic/claude-sonnet-4-5", ...)` |
| Anthropic | `claude-haiku-4-5` | `responses(model="perplexity/anthropic/claude-haiku-4-5", ...)` |
| Google | `gemini-3-pro-preview` | `responses(model="perplexity/google/gemini-3-pro-preview", ...)` |
| Google | `gemini-3-flash-preview` | `responses(model="perplexity/google/gemini-3-flash-preview", ...)` |
| Google | `gemini-2.5-pro` | `responses(model="perplexity/google/gemini-2.5-pro", ...)` |
| Google | `gemini-2.5-flash` | `responses(model="perplexity/google/gemini-2.5-flash", ...)` |
| xAI | `grok-4-1-fast-non-reasoning` | `responses(model="perplexity/xai/grok-4-1-fast-non-reasoning", ...)` |
| Perplexity | `sonar` | `responses(model="perplexity/perplexity/sonar", ...)` |

### 사용 가능한 프리셋 {#available-presets}

| 프리셋 이름 | 함수 호출 |
|-------------|---------------|
| `fast-search` | `responses(model="perplexity/preset/fast-search", ...)` |
| `pro-search` | `responses(model="perplexity/preset/pro-search", ...)` |
| `deep-research` | `responses(model="perplexity/preset/deep-research", ...)` |
| `advanced-deep-research` | `responses(model="perplexity/preset/advanced-deep-research", ...)` |

### 전체 예제 {#complete-example}

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

# Comprehensive example with multiple features
response = responses(
    model="perplexity/openai/gpt-5.2",
    input="Research the latest developments in quantum computing and provide sources",
    custom_llm_provider="perplexity",
    tools=[
        {"type": "web_search"},
        {"type": "fetch_url"}
    ],
    instructions="Use web_search to find relevant information and fetch_url to retrieve detailed content from sources. Provide citations for all claims.",
    max_output_tokens=1000,
    temperature=0.7,
)

print(f"Response ID: {response.id}")
print(f"Model: {response.model}")
print(f"Status: {response.status}")
print(f"Output: {response.output}")
print(f"Usage: {response.usage}")
```

:::info

제공자별 파라미터 전달에 대한 자세한 내용은 [여기](../completion/provider_specific_params.md)를 참고하세요.
:::
