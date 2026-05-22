import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 'Thinking' 및 'Reasoning Content' {#thinking--reasoning-content}

:::info

LiteLLM v1.63.0+가 필요합니다.

:::

지원 프로바이더:
- Deepseek (`deepseek/`)
- Anthropic API (`anthropic/`)
- Bedrock (Anthropic + Deepseek + GPT-OSS) 지원 (`bedrock/`)
- OpenAI Responses API 지원 (`openai/responses/`)
- Vertex AI (Anthropic) (`vertexai/`)
- OpenRouter (`openrouter/`)
- XAI (`xai/`)
- Google AI Studio 지원 (`google/`)
- Vertex AI (`vertex_ai/`)
- Perplexity (`perplexity/`)
- Mistral AI (Magistral models) 지원 (`mistral/`)
- Groq (`groq/`)

LiteLLM은 응답의 `reasoning_content`와 assistant message의 `thinking_blocks`를 표준화합니다.

```python title="Example response from litellm"
"message": {
    ...
    "reasoning_content": "The capital of France is Paris.",
    "thinking_blocks": [ # only returned for Anthropic models
        {
            "type": "thinking",
            "thinking": "The capital of France is Paris.",
            "signature": "EqoBCkgIARABGAIiQL2UoU0b1OHYi+..."
        }
    ]
}
```

## 빠른 시작 {#quick-start}

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion
import os 

os.environ["ANTHROPIC_API_KEY"] = ""

response = completion(
  model="anthropic/claude-3-7-sonnet-20250219",
  messages=[
    {"role": "user", "content": "What is the capital of France?"},
  ],
  reasoning_effort="low", 
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
    "model": "anthropic/claude-3-7-sonnet-20250219",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "reasoning_effort": "low"
}'
```
</TabItem>
</Tabs>

**예상 응답**

```bash
{
    "id": "3b66124d79a708e10c603496b363574c",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": " won the FIFA World Cup in 2022.",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null
            }
        }
    ],
    "created": 1723323084,
    "model": "deepseek/deepseek-chat",
    "object": "chat.completion",
    "system_fingerprint": "fp_7e0991cad4",
    "usage": {
        "completion_tokens": 12,
        "prompt_tokens": 16,
        "total_tokens": 28,
    },
    "service_tier": null
}
```

## `thinking`을 사용한 도구 호출 {#tool-calling-with-thinking}

Anthropic의 `thinking` block을 tool calling과 함께 사용하는 방법입니다.

### 중요: OpenAI 호환 API 제한

:::warning 호환성 안내

tool calling과 함께 사용하는 Anthropic extended thinking은 OpenAI 호환 API client와 **완전히 호환되지 않습니다**. 이는 multi-turn conversation에서 OpenAI와 Anthropic이 reasoning을 처리하는 방식에 근본적인 아키텍처 차이가 있기 때문입니다.

:::

Anthropic 모델에서 `thinking`을 활성화하고 tool calling을 사용할 때는 tool result를 다시 보낼 때 이전 assistant 응답의 `thinking_blocks`를 **반드시 포함해야 합니다**. 포함하지 않으면 `400 Bad Request` 오류가 발생합니다.

**OpenAI와 Anthropic 아키텍처 비교:**

| 프로바이더 | API 아키텍처 | Reasoning 저장 위치 | Multi-turn 처리 |
|----------|------------------|-------------------|---------------------|
| **OpenAI** (o1, o3) | Responses API (stateful) | server-side | server가 reasoning을 내부에 저장하고, client는 `previous_response_id`를 보냅니다. |
| **Anthropic** (Claude) | Messages API (stateless) | client-side | client가 `thinking_blocks`를 저장하고 모든 요청마다 다시 보내야 합니다. |


1. OpenAI Chat Completions spec에는 `thinking_blocks`용 field가 **없습니다**.
2. OpenAI 호환 client(LibreChat, Open WebUI, Vercel AI SDK 등)는 응답의 `thinking_blocks` field를 **무시합니다**.
3. 이런 client가 다음 turn을 위해 assistant message를 재구성할 때 thinking block이 사라집니다.
4. assistant message가 thinking block으로 시작하지 않기 때문에 Anthropic이 요청을 거부합니다.

:::tip LiteLLM은 thinking_blocks를 지원합니다
LiteLLM의 `completion()` API는 assistant message에 `thinking_blocks`를 보내는 방식을 **지원합니다**. OpenAI 호환 client를 거치지 않고 LiteLLM을 직접 사용한다면 `thinking_blocks`를 보존하고 다시 보내서 정상적으로 동작시킬 수 있습니다.
:::

**해결 방법:**

1. **LiteLLM 내장 workaround 사용**(권장): `litellm.modify_params = True`를 설정하면 `thinking_blocks`가 없을 때 LiteLLM이 `thinking` param을 제거해 이 비호환성을 자동으로 처리합니다(아래 참고).
2. **Client 개발자용**: `thinking_blocks` field를 명시적으로 처리하고 다시 전송합니다(아래 예제 참고).
3. `thinking_blocks`를 지원하지 않는 OpenAI 호환 client에서 tool을 사용할 때는 **extended thinking을 비활성화**합니다.
4. OpenAI 호환 endpoint 대신 **Anthropic native API**를 직접 사용합니다.

### LiteLLM 내장 Workaround {#litellm-built-in-workaround}

`modify_params=True`를 설정하면 LiteLLM이 이 비호환성을 자동으로 처리할 수 있습니다. client가 `thinking`이 활성화된 요청을 보내지만 `tool_calls`가 포함된 assistant message에 `thinking_blocks`가 없으면, LiteLLM은 오류를 피하기 위해 해당 turn에서 `thinking` param을 자동으로 제거합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
import litellm

# Enable automatic parameter modification
litellm.modify_params = True

# Now this will work even if thinking_blocks are missing from the assistant message
response = litellm.completion(
    model="anthropic/claude-sonnet-4-20250514",
    thinking={"type": "enabled", "budget_tokens": 1024},
    tools=[...],
    messages=[
        {"role": "user", "content": "What's the weather in Madrid?"},
        {
            "role": "assistant",
            "tool_calls": [{"id": "call_123", "type": "function", "function": {"name": "get_weather", "arguments": '{"city": "Madrid"}'}}]
            # Note: thinking_blocks is missing here - LiteLLM will handle it
        },
        {"role": "tool", "tool_call_id": "call_123", "content": "22°C sunny"}
    ]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  modify_params: true  # Enable automatic parameter modification

model_list:
  - model_name: claude-thinking
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      thinking:
        type: enabled
        budget_tokens: 1024
```

</TabItem>
</Tabs>

:::info
`modify_params=True`이고 LiteLLM이 `thinking` param을 제거하면, 해당 turn에서 모델은 extended thinking을 **사용하지 않습니다**. conversation은 정상적으로 계속되지만 그 응답에는 reasoning이 포함되지 않습니다.
:::

**`thinking_blocks`를 포함하는 올바른 방식:**

```python
# After receiving a response with tool_calls, include thinking_blocks when sending back:
assistant_message = {
    "role": "assistant",
    "content": response.choices[0].message.content,
    "tool_calls": [...],
    "thinking_blocks": response.choices[0].message.thinking_blocks  # ← Required!
}
```

---

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
litellm._turn_on_debug()
litellm.modify_params = True
model = "anthropic/claude-3-7-sonnet-20250219" # works across Anthropic, Bedrock, Vertex AI
# Step 1: send the conversation and available functions to the model
messages = [
    {
        "role": "user",
        "content": "What's the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses",
    }
]
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
                        "description": "The city and state",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        },
    }
]
response = litellm.completion(
    model=model,
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
    reasoning_effort="low",
)
print("Response\n", response)
response_message = response.choices[0].message
tool_calls = response_message.tool_calls

print("Expecting there to be 3 tool calls")
assert (
    len(tool_calls) > 0
)  # this has to call the function for SF, Tokyo and paris

# Step 2: check if the model wanted to call a function
print(f"tool_calls: {tool_calls}")
if tool_calls:
    # Step 3: call the function
    # Note: the JSON response may not always be valid; be sure to handle errors
    available_functions = {
        "get_current_weather": get_current_weather,
    }  # only one function in this example, but you can have multiple
    messages.append(
        response_message
    )  # extend conversation with assistant's reply
    print("Response message\n", response_message)
    # Step 4: send the info for each function call and function response to the model
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        if function_name not in available_functions:
            # the model called a function that does not exist in available_functions - don't try calling anything
            return
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
    print(f"messages: {messages}")
    second_response = litellm.completion(
        model=model,
        messages=messages,
        seed=22,
        reasoning_effort="low",
        # tools=tools,
        drop_params=True,
    )  # get a new response from the model where it can see the function response
    print("second response\n", second_response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml showLineNumbers
model_list:
  - model_name: claude-3-7-sonnet-thinking
    litellm_params:
      model: anthropic/claude-3-7-sonnet-20250219
      api_key: os.environ/ANTHROPIC_API_KEY
      thinking: {
        "type": "enabled",
        "budget_tokens": 1024
      }
```

2. proxy 실행

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 첫 번째 호출 수행

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-thinking",
    "messages": [
      {"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses"},
    ],
    "tools": [
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
                          "description": "The city and state",
                      },
                      "unit": {
                          "type": "string",
                          "enum": ["celsius", "fahrenheit"],
                      },
                  },
                  "required": ["location"],
              },
          },
        }
    ],
    "tool_choice": "auto"
  }'
```

4. tool call 결과로 두 번째 호출 수행

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-thinking",
    "messages": [
      {
        "role": "user",
        "content": "What\'s the weather like in San Francisco, Tokyo, and Paris? - give me 3 responses"
      },
      {
        "role": "assistant",
        "content": "I\'ll check the current weather for these three cities for you:",
        "tool_calls": [
          {
            "index": 2,
            "function": {
              "arguments": "{\"location\": \"San Francisco\"}",
              "name": "get_current_weather"
            },
            "id": "tooluse_mnqzmtWYRjCxUInuAdK7-w",
            "type": "function"
          }
        ],
        "function_call": null,
        "reasoning_content": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user.",
        "thinking_blocks": [
          {
            "type": "thinking",
            "thinking": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user.",
            "signature": "EqoBCkgIARABGAIiQCkBXENoyB+HstUOs/iGjG+bvDbIQRrxPsPpOSt5yDxX6iulZ/4K/w9Rt4J5Nb2+3XUYsyOH+CpZMfADYvItFR4SDPb7CmzoGKoolCMAJRoM62p1ZRASZhrD3swqIjAVY7vOAFWKZyPEJglfX/60+bJphN9W1wXR6rWrqn3MwUbQ5Mb/pnpeb10HMploRgUqEGKOd6fRKTkUoNDuAnPb55c="
          }
        ],
        "provider_specific_fields": {
          "reasoningContentBlocks": [
            {
              "reasoningText": {
                "signature": "EqoBCkgIARABGAIiQCkBXENoyB+HstUOs/iGjG+bvDbIQRrxPsPpOSt5yDxX6iulZ/4K/w9Rt4J5Nb2+3XUYsyOH+CpZMfADYvItFR4SDPb7CmzoGKoolCMAJRoM62p1ZRASZhrD3swqIjAVY7vOAFWKZyPEJglfX/60+bJphN9W1wXR6rWrqn3MwUbQ5Mb/pnpeb10HMploRgUqEGKOd6fRKTkUoNDuAnPb55c=",
                "text": "The user is asking for the current weather in three different locations: San Francisco, Tokyo, and Paris. I have access to the `get_current_weather` function that can provide this information.\n\nThe function requires a `location` parameter, and has an optional `unit` parameter. The user hasn't specified which unit they prefer (celsius or fahrenheit), so I'll use the default provided by the function.\n\nI need to make three separate function calls, one for each location:\n1. San Francisco\n2. Tokyo\n3. Paris\n\nThen I'll compile the results into a response with three distinct weather reports as requested by the user."
              }
            }
          ]
        }
      },
      {
        "tool_call_id": "tooluse_mnqzmtWYRjCxUInuAdK7-w",
        "role": "tool",
        "name": "get_current_weather",
        "content": "{\"location\": \"San Francisco\", \"temperature\": \"72\", \"unit\": \"fahrenheit\"}"
      }
    ]
  }'
```

</TabItem>
</Tabs>

## Anthropic + Deepseek 모델 간 전환 {#switching-between-anthropic-deepseek-models}

Anthropic에서 Deepseek 모델로 전환할 때 'thinking' block을 제거하려면 `drop_params=True`를 설정합니다. 이 접근 방식에 대한 개선 제안은 [여기](https://github.com/BerriAI/litellm/discussions/8927)에 남겨주세요.

```python showLineNumbers
litellm.drop_params = True # 👈 EITHER GLOBALLY or per request

# or per request
## Anthropic
response = litellm.completion(
  model="anthropic/claude-3-7-sonnet-20250219",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  reasoning_effort="low",
  drop_params=True,
)

## Deepseek
response = litellm.completion(
  model="deepseek/deepseek-chat",
  messages=[{"role": "user", "content": "What is the capital of France?"}],
  reasoning_effort="low",
  drop_params=True,
)
```

## 사양 {#spec}


이 field들은 `response.choices[0].message.reasoning_content`와 `response.choices[0].message.thinking_blocks`로 접근할 수 있습니다.

- `reasoning_content` - str: 모델이 반환한 reasoning content입니다. 모든 provider에서 반환됩니다.
- `thinking_blocks` - Optional[List[Dict[str, str]]]: 모델이 반환한 thinking block 목록입니다. Anthropic 모델에서만 반환됩니다.
  - `type` - str: thinking block의 type입니다.
  - `thinking` - str: 모델의 thinking 내용입니다.
  - `signature` - str: 모델의 signature delta입니다.



## Anthropic 모델에 `thinking` 전달 {#passing-thinking-to-anthropic-models}

Anthropic 모델에는 `thinking` parameter를 직접 전달할 수도 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
response = litellm.completion(
  model="anthropic/claude-3-7-sonnet-20250219",
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
    "model": "anthropic/claude-3-7-sonnet-20250219",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "thinking": {"type": "enabled", "budget_tokens": 1024}
  }'
```

</TabItem>
</Tabs>

## 모델의 reasoning 지원 여부 확인 {#checking-if-a-model-supports-reasoning}

<Tabs>
<TabItem label="LiteLLM Python SDK" value="Python">

`litellm.supports_reasoning(model="")`를 사용하세요. 모델이 reasoning을 지원하면 `True`, 지원하지 않으면 `False`를 반환합니다.

```python showLineNumbers title="litellm.supports_reasoning() usage"
import litellm 

# Example models that support reasoning
assert litellm.supports_reasoning(model="anthropic/claude-3-7-sonnet-20250219") == True
assert litellm.supports_reasoning(model="deepseek/deepseek-chat") == True 

# Example models that do not support reasoning
assert litellm.supports_reasoning(model="openai/gpt-3.5-turbo") == False 
```
</TabItem>

<TabItem label="LiteLLM Proxy Server" value="proxy">

1. `config.yaml`에 reasoning을 지원하는 모델을 정의합니다. LiteLLM이 custom model을 자동 감지하지 못하는 경우 `model_info`에 `supports_reasoning: True`를 선택적으로 추가할 수 있습니다.

```yaml showLineNumbers title="litellm proxy config.yaml"
model_list:
  - model_name: claude-3-sonnet-reasoning
    litellm_params:
      model: anthropic/claude-3-7-sonnet-20250219
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: deepseek-reasoning
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
  # Example for a custom model where detection might be needed
  - model_name: my-custom-reasoning-model 
    litellm_params:
      model: openai/my-custom-model # Assuming it's OpenAI compatible
      api_base: http://localhost:8000
      api_key: fake-key
    model_info:
      supports_reasoning: True # Explicitly mark as supporting reasoning
```

2. proxy server를 실행합니다.

```bash showLineNumbers title="litellm --config config.yaml"
litellm --config config.yaml
```

3. `/model_group/info`를 호출해 모델이 `reasoning`을 지원하는지 확인합니다.

```shell showLineNumbers title="curl /model_group/info"
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H 'x-api-key: sk-1234'
```

예상 응답

```json showLineNumbers title="response from /model_group/info"
{
  "data": [
    {
      "model_group": "claude-3-sonnet-reasoning",
      "providers": ["anthropic"],
      "mode": "chat",
      "supports_reasoning": true,
    },
    {
      "model_group": "deepseek-reasoning",
      "providers": ["deepseek"],
      "supports_reasoning": true,
    },
    {
      "model_group": "my-custom-reasoning-model",
      "providers": ["openai"],
      "supports_reasoning": true,
    }
  ]
}
````


</TabItem>
</Tabs>

:::tip gpt-5.4: `reasoning_effort` + function tools 사용

`litellm.completion()`으로 들어오는 `gpt-5.4+` 요청에 `reasoning_effort`와 `tools`가 모두 포함되어 있으면 LiteLLM은 요청을 Responses API bridge로 **자동 라우팅**합니다. 이는 **OpenAI**(`openai/gpt-5.4`)와 **Azure**(`azure/gpt-5.4`) provider 모두에서 동작하며, 추가 설정은 필요하지 않습니다.

`openai/responses/gpt-5.4` 또는 `azure/responses/gpt-5.4`로 명시적으로 라우팅할 수도 있습니다. 자세한 내용은 [Responses API Bridge](/docs/providers/openai#openai-chat-completion-to-responses-api-bridge)를 참고하세요.

**Azure custom deployment name:** 자동 라우팅은 deployment 이름이 `gpt-5.4*` 패턴과 일치하는지에 의존합니다. custom deployment 이름(예: `"my-reasoning-model"`)을 사용한다면 다음 방식으로 라우팅을 활성화하세요.

**SDK:**
```python
litellm.completion(model="azure/responses/my-reasoning-model", ...)
```

**Proxy config:**
```yaml
model_list:
  - model_name: my-reasoning-model
    litellm_params:
      model: azure/my-reasoning-model
    model_info:
      mode: responses
```

:::

## OpenAI Responses API - Auto-Summary 제어 {#openai-responses-api-auto-summary-control}

`/chat/completions`에서 `reasoning_effort`와 함께 OpenAI Responses API 모델(예: `gpt-5`)을 사용할 때, reasoning parameter에 `summary="detailed"`를 자동으로 추가할지 제어할 수 있습니다.

### Auto-Summary 활성화 {#enabling-auto-summary}

자동 `summary="detailed"`는 두 가지 방식으로 활성화할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable auto-summary globally
litellm.reasoning_auto_summary = True

response = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",  # Will automatically add summary="detailed"
)
```

</TabItem>

<TabItem value="env" label="Environment Variable">

```bash
# Set environment variable
export LITELLM_REASONING_AUTO_SUMMARY=true

# Or in your .env file
LITELLM_REASONING_AUTO_SUMMARY=true
```

</TabItem>

<TabItem value="proxy" label="Proxy Config">

```yaml
litellm_settings:
  reasoning_auto_summary: true  # Enable auto-summary for all requests

model_list:
  - model_name: gpt-5-mini
    litellm_params:
      model: openai/responses/gpt-5-mini
```

**모델별 설정**(`extra_body`를 설정할 수 없는 Open WebUI 또는 client를 사용할 때 권장):

```yaml
model_list:
  - model_name: gpt-5.1
    litellm_params:
      model: openai/gpt-5.1
      # String format - uses reasoning_auto_summary for summary when set
      reasoning_effort: "high"
    model_info:
      mode: responses  # if using Responses API bridge

  - model_name: gpt-5.1-with-summary
    litellm_params:
      model: openai/gpt-5.1
      # Dict format - explicit control over effort and summary
      reasoning_effort: {"effort": "high", "summary": "detailed"}
```

</TabItem>
</Tabs>

### 수동 제어(권장) {#manual-control-recommended}

세밀하게 제어하려면 `reasoning_effort`를 dictionary로 전달합니다.

```python
response = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort={"effort": "low", "summary": "detailed"},  # Explicit control
)
```

### `/v1/messages` Adapter를 통한 Summary 보존 {#preserving-summary-via-v1messages-adapter}

Anthropic `/v1/messages` adapter를 사용해 Claude가 아닌 모델(예: `openai/gpt-5.1`)로 라우팅하면 `thinking.summary` 값이 보존되어 downstream provider로 전달됩니다. 예:

```python
import litellm

response = await litellm.anthropic.messages.acreate(
    model="openai/gpt-5.1",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=8096,
    thinking={"type": "enabled", "budget_tokens": 5000, "summary": "concise"},
)
# The summary="concise" is preserved when routing to OpenAI's Responses API
```

### `/v1/messages` Adapter의 기본 Summary 주입 활성화 {#enabling-default-summary-injection-for-v1messages-adapter}

Anthropic `/v1/messages` adapter가 Claude가 아닌 모델을 위해 `thinking` parameter를 OpenAI `reasoning_effort`로 변환할 때, `reasoning_auto_summary` flag를 사용해 자동 `summary="detailed"` 주입을 opt-in할 수 있습니다. 이렇게 하면 Anthropic thinking 동작과 맞게 응답에 reasoning text가 반환됩니다.

이 기본 주입을 **활성화**하려면 `reasoning_auto_summary` flag를 사용하세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable default summary="detailed" injection
litellm.reasoning_auto_summary = True

response = await litellm.anthropic.messages.acreate(
    model="openai/gpt-5.1",
    messages=[{"role": "user", "content": "Hello"}],
    max_tokens=8096,
    thinking={"type": "enabled", "budget_tokens": 5000},
)
# summary="detailed" will be automatically added to reasoning_effort
```

</TabItem>

<TabItem value="env" label="Environment Variable">

```bash
export LITELLM_REASONING_AUTO_SUMMARY=true
```

</TabItem>

<TabItem value="proxy" label="Proxy Config">

```yaml
litellm_settings:
  reasoning_auto_summary: true
```

</TabItem>
</Tabs>

:::info

이 flag는 사용자가 제공한 summary가 없을 때 `summary="detailed"`를 자동 주입하는 동작에만 영향을 줍니다. `thinking.summary`를 명시적으로 전달하면(예: `"concise"` 또는 `"auto"`) 이 flag와 관계없이 해당 값이 항상 보존됩니다.

:::
