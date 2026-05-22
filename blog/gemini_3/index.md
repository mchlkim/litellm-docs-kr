---
slug: gemini_3
title: "DAY 0 지원: LiteLLM에서 Gemini 3 사용"
date: 2025-11-19T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM Proxy와 SDK에서 gemini-3-pro-preview를 사용할 때 자주 묻는 질문과 권장 사항."
tags: [gemini, day 0 support, llms]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info

이 가이드는 LiteLLM Proxy와 SDK에서 `gemini-3-pro-preview`를 사용할 때 자주 묻는 질문과 권장 사항을 다룹니다.

:::

{/* truncate */}

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="Python SDK">

```python
from litellm import completion
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Hello!"}],
    reasoning_effort="low"
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml에 추가:**

```yaml
model_list:
  - model_name: gemini-3-pro-preview
    litellm_params:
      model: gemini/gemini-3-pro-preview
      api_key: os.environ/GEMINI_API_KEY
```

**2. proxy 시작:**

```bash
litellm --config /path/to/config.yaml
```

**3. 요청 보내기:**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [{"role": "user", "content": "Hello!"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

## 지원 엔드포인트

LiteLLM은 Gemini 3 Pro Preview에 대해 다음 엔드포인트에서 **엔드투엔드 전체 지원**을 제공합니다.

- ✅ `/v1/chat/completions` - OpenAI 호환 chat completions 엔드포인트
- ✅ `/v1/responses` - OpenAI Responses API 엔드포인트(스트리밍 및 비스트리밍)
- ✅ [`/v1/messages`](/litellm-docs-kr/docs/anthropic_unified) - Anthropic 호환 messages 엔드포인트
- ✅ `/v1/generateContent` - [Google Gemini API](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini#rest) 호환 엔드포인트(code는 `client.models.generate_content(...)` 참고)

모든 엔드포인트는 다음을 지원합니다.
- 스트리밍 및 비스트리밍 응답
- thought signature를 포함한 함수 호출
- 멀티턴 대화
- Gemini 3 전용 기능 전체

## Thought Signatures

#### Thought Signature란?

Thought signature는 모델 내부 추론 과정의 암호화된 표현입니다. 특히 함수 호출을 사용하는 멀티턴 대화에서 context를 유지하는 데 필요합니다.

#### Thought Signature 동작 방식

1. **자동 추출**: Gemini 3가 함수 호출을 반환하면 LiteLLM이 응답에서 `thought_signature`를 자동 추출합니다.
2. **저장**: Thought signature는 도구 호출의 `provider_specific_fields.thought_signature`에 저장됩니다.
3. **자동 보존**: 대화 기록에 assistant message를 포함하면 LiteLLM이 thought signature를 자동으로 보존해 Gemini에 다시 전달합니다.

## 예제: 멀티턴 함수 호출

#### Thought Signature와 스트리밍

`stream_chunk_builder()`와 스트리밍 모드를 함께 사용할 때 thought signature가 자동 보존됩니다.

<Tabs>
<TabItem value="streaming" label="Streaming SDK">

```python
import os
import litellm
from litellm import completion

os.environ["GEMINI_API_KEY"] = "your-api-key"

MODEL = "gemini/gemini-3-pro-preview"

messages = [
    {"role": "system", "content": "You are a helpful assistant. Use the calculate tool."},
    {"role": "user", "content": "What is 2+2?"},
]

tools = [{
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Calculate a mathematical expression",
        "parameters": {
            "type": "object",
            "properties": {"expression": {"type": "string"}},
            "required": ["expression"],
        },
    },
}]

print("Step 1: Sending request with stream=True...")
response = completion(
    model=MODEL,
    messages=messages,
    stream=True,
    tools=tools,
    reasoning_effort="low"
)

# Collect all chunks
chunks = []
for part in response:
    chunks.append(part)

# Reconstruct message using stream_chunk_builder
# Thought signatures are now preserved automatically!
full_response = litellm.stream_chunk_builder(chunks, messages=messages)
print(f"Full response: {full_response}")

assistant_msg = full_response.choices[0].message

# ✅ Thought signature is now preserved in provider_specific_fields
if assistant_msg.tool_calls and assistant_msg.tool_calls[0].provider_specific_fields:
    thought_sig = assistant_msg.tool_calls[0].provider_specific_fields.get("thought_signature")
    print(f"Thought signature preserved: {thought_sig is not None}")

# Append assistant message (includes thought signatures automatically)
messages.append(assistant_msg)

# Mock tool execution
messages.append({
    "role": "tool",
    "content": "4",
    "tool_call_id": assistant_msg.tool_calls[0].id
})

print("\nStep 2: Sending tool result back to model...")
response_2 = completion(
    model=MODEL,
    messages=messages,
    stream=True,
    tools=tools,
    reasoning_effort="low"
)

for part in response_2:
    if part.choices[0].delta.content:
        print(part.choices[0].delta.content, end="")
print()  # New line
```

**핵심 포인트:**
- ✅ `stream_chunk_builder()`는 thought signature를 포함한 `provider_specific_fields`를 보존합니다.
- ✅ `assistant_msg`를 대화 기록에 추가하면 thought signature가 자동으로 포함됩니다.
- ✅ 멀티턴 대화가 스트리밍에서도 자연스럽게 동작합니다.

</TabItem>
<TabItem value="sdk" label="Non-Streaming SDK">

```python
from openai import OpenAI
import json

client = OpenAI(api_key="sk-1234", base_url="http://localhost:4000")

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

# Step 1: Initial request
messages = [{"role": "user", "content": "What's the weather in Tokyo?"}]

response = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=messages,
    tools=tools,
    reasoning_effort="low"
)

# Step 2: Append assistant message (thought signatures automatically preserved)
messages.append(response.choices[0].message)

# Step 3: Execute tool and append result
for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "get_weather":
        result = {"temperature": 30, "unit": "celsius"}
        messages.append({
            "role": "tool",
            "content": json.dumps(result),
            "tool_call_id": tool_call.id
        })

# Step 4: Follow-up request (thought signatures automatically included)
response2 = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=messages,
    tools=tools,
    reasoning_effort="low"
)

print(response2.choices[0].message.content)
```

**핵심 포인트:**
- ✅ Thought signature는 `response.choices[0].message.tool_calls[].provider_specific_fields.thought_signature`에서 자동 추출됩니다.
- ✅ `response.choices[0].message`를 대화 기록에 추가하면 thought signature가 자동 보존됩니다.
- ✅ Thought signature를 수동으로 추출하거나 관리할 필요가 없습니다.

</TabItem>
<TabItem value="proxy" label="cURL">

```bash
# Step 1: Initial request
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {"role": "user", "content": "What'\''s the weather in Tokyo?"}
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      }
    ],
    "reasoning_effort": "low"
  }'
```

**Response에는 thought signature가 포함됩니다.**

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"Tokyo\"}"
        },
        "provider_specific_fields": {
          "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ..."
        }
      }]
    }
  }]
}
```

```bash
# Step 2: Follow-up request (include assistant message with thought signature)
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {"role": "user", "content": "What'\''s the weather in Tokyo?"},
      {
        "role": "assistant",
        "content": null,
        "tool_calls": [{
          "id": "call_abc123",
          "type": "function",
          "function": {
            "name": "get_weather",
            "arguments": "{\"location\": \"Tokyo\"}"
          },
          "provider_specific_fields": {
            "thought_signature": "CpcHAdHtim9+q4rstcbvQC0ic4x1/vqQlCJWgE+UZ6dTLYGHMMBkF/AxqL5UmP6SY46uYC8t4BTFiXG5zkw6EMJ..."
          }
        }]
      },
      {
        "role": "tool",
        "content": "{\"temperature\": 30, \"unit\": \"celsius\"}",
        "tool_call_id": "call_abc123"
      }
    ],
    "tools": [...],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

#### Thought Signature 관련 중요 참고

1. **자동 처리**: LiteLLM이 thought signature를 자동으로 추출하고 보존합니다. 직접 관리할 필요가 없습니다.

2. **병렬 함수 호출**: 모델이 병렬 함수 호출을 수행하면 **첫 번째 함수 호출**에만 thought signature가 있습니다.

3. **순차 함수 호출**: 다단계 함수 호출에서는 각 단계의 첫 번째 함수 호출이 보존해야 할 자체 thought signature를 가집니다.

4. **Context 유지에 필요**: Thought signature는 reasoning context 유지에 필수입니다. 없으면 모델이 이전 추론 context를 잃을 수 있습니다.

## 대화 기록: Non-Gemini-3 모델에서 전환

#### 자주 묻는 질문: non-Gemini-3 모델에서 Gemini 3로 전환하면 대화 기록이 깨지나요?

**답변: 아니요.** LiteLLM은 필요할 때 dummy thought signature를 추가해 이를 자동 처리합니다.

#### 동작 방식

Thought signature를 사용하지 않는 모델(예: `gemini-2.5-flash`)에서 Gemini 3로 전환하면 LiteLLM은 다음을 수행합니다.

1. **누락 signature 감지**: thought signature가 없는 tool call 포함 assistant message를 식별합니다.
2. **dummy signature 추가**: 호환성을 위해 dummy thought signature(`skip_thought_signature_validator`)를 자동 삽입합니다.
3. **대화 흐름 유지**: 기존 대화 기록이 계속 자연스럽게 동작합니다.

#### 예제: 대화 중간에 모델 전환

<Tabs>
<TabItem value="sdk" label="Python SDK">

```python
from openai import OpenAI

client = OpenAI(api_key="sk-1234", base_url="http://localhost:4000")

# Step 1: Start with gemini-2.5-flash (no thought signatures)
messages = [{"role": "user", "content": "What's the weather?"}]

response1 = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=messages,
    tools=[...],
    reasoning_effort="low"
)

# Append assistant message (no tool call thought signature from gemini-2.5-flash)
messages.append(response1.choices[0].message)

# Step 2: Switch to gemini-3-pro-preview
# LiteLLM automatically adds dummy thought signature to the previous assistant message
response2 = client.chat.completions.create(
    model="gemini-3-pro-preview",  # 👈 Switched model
    messages=messages,  # 👈 Same conversation history
    tools=[...],
    reasoning_effort="low"
)

# ✅ Works seamlessly! No errors, no breaking changes
print(response2.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="cURL">

```bash
# Step 1: Start with gemini-2.5-flash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "What'\''s the weather?"}],
    "tools": [...],
    "reasoning_effort": "low"
  }'

# Step 2: Switch to gemini-3-pro-preview with same conversation history
# LiteLLM automatically handles the missing thought signature
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",  # 👈 Switched model
    "messages": [
      {"role": "user", "content": "What'\''s the weather?"},
      {
        "role": "assistant",
        "tool_calls": [...]  # 👈 No thought_signature from gemini-2.5-flash
      }
    ],
    "tools": [...],
    "reasoning_effort": "low"
  }'
# ✅ Works! LiteLLM adds dummy signature automatically
```

</TabItem>
</Tabs>

#### Dummy Signature 세부 정보

사용되는 dummy signature는 `base64("skip_thought_signature_validator")`입니다.

이는 thought signature를 지원하지 않는 모델의 대화 기록을 처리하기 위해 Google이 권장하는 방식입니다. 이를 통해 Gemini 3는 다음을 수행할 수 있습니다.
- validation error 없이 대화 기록 수락
- 대화를 자연스럽게 이어가기
- 모델 전환 시에도 context 유지

## Thinking Level 파라미터

#### `reasoning_effort`가 `thinking_level`로 매핑되는 방식

Gemini 3 Pro Preview에서 LiteLLM은 `reasoning_effort`를 새 `thinking_level` 파라미터로 자동 매핑합니다.

| `reasoning_effort` | `thinking_level` | 참고 |
|-------------------|------------------|-------|
| `"minimal"` | `"low"` | low thinking level로 매핑 |
| `"low"` | `"low"` | 대부분의 사용 사례에 대한 기본 선택 |
| `"medium"` | `"high"` | medium은 아직 제공되지 않아 high로 매핑 |
| `"high"` | `"high"` | 최대 추론 깊이 |
| `"disable"` | `"low"` | Gemini 3는 thinking을 완전히 끌 수 없음 |
| `"none"` | `"low"` | Gemini 3는 thinking을 완전히 끌 수 없음 |

#### 기본 동작
`reasoning_effort`를 생략하면 LiteLLM은 `thinking_level`을 설정하지 않습니다. Gemini API가 **기본값**을 적용하므로 Google에 직접 호출할 때와 동일합니다.


### 예제 사용법

<Tabs>
<TabItem value="sdk" label="Python SDK">

```python
from litellm import completion

# Low thinking level (faster, lower cost)
response = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "What's the weather?"}],
    reasoning_effort="low"  # Maps to thinking_level="low"
)

# High thinking level (deeper reasoning, higher cost)
response = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Solve this complex math problem step by step."}],
    reasoning_effort="high"  # Maps to thinking_level="high"
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

```bash
# Low thinking level
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [{"role": "user", "content": "What'\''s the weather?"}],
    "reasoning_effort": "low"
  }'

# High thinking level
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [{"role": "user", "content": "Solve this complex problem."}],
    "reasoning_effort": "high"
  }'
```

</TabItem>
</Tabs>

## 중요 참고

1. **Gemini 3는 thinking을 완전히 끌 수 없음**: Gemini 2.5 모델과 달리 Gemini 3는 thinking을 완전히 비활성화할 수 없습니다. `reasoning_effort="none"` 또는 `"disable"`을 설정해도 `thinking_level="low"`로 매핑됩니다.

2. **Temperature 권장값**: Gemini 3 모델에서 LiteLLM은 `temperature` 기본값을 `1.0`으로 설정하며 이 값을 유지하는 것을 강하게 권장합니다. `temperature < 1.0`은 다음 문제를 일으킬 수 있습니다.
   - 무한 루프
   - reasoning 성능 저하
   - 복잡한 작업 실패

3. **Thinking 기본값은 API에서 결정됨**: `reasoning_effort`를 생략하면 LiteLLM은 `thinking_level`을 덮어쓰지 않습니다. 비용이나 지연 시간을 예측 가능하게 만들고 싶을 때만 `reasoning_effort` 또는 native thinking 파라미터를 설정하세요. 예를 들어 가벼운 추론에는 `reasoning_effort="low"`를 사용합니다.

## 비용 추적: Prompt 캐싱 및 Context Window

LiteLLM은 Gemini 3 Pro Preview에 대해 포괄적인 비용 추적을 제공합니다. 여기에는 prompt caching과 context window 크기 기반 tiered pricing 지원이 포함됩니다.

### Prompt 캐싱 비용 추적

Gemini 3는 자주 쓰는 prompt prefix를 cache해 비용을 줄일 수 있는 prompt caching을 지원합니다. LiteLLM은 다음 비용을 자동으로 추적하고 계산합니다.

- **Cache Hit Tokens**: cache에서 읽은 token(더 낮은 요율 적용)
- **Cache Creation Tokens**: cache에 기록한 token(1회성 비용)
- **Text Tokens**: 일반적으로 처리되는 regular prompt token

#### 동작 방식

LiteLLM은 usage object의 `prompt_tokens_details` field에서 caching 정보를 추출합니다.

```python
{
  "usage": {
    "prompt_tokens": 50000,
    "completion_tokens": 1000,
    "total_tokens": 51000,
    "prompt_tokens_details": {
      "cached_tokens": 30000,  # Cache hit tokens
      "cache_creation_tokens": 5000,  # Tokens written to cache
      "text_tokens": 15000  # Regular processed tokens
    }
  }
}
```

### Context Window 계층형 가격

Gemini 3 Pro Preview는 최대 1M token context를 지원하며, prompt가 200k token을 넘으면 tiered pricing이 자동 적용됩니다.

#### 자동 tier 감지

LiteLLM은 prompt가 200k token threshold를 넘는지 자동 감지하고 적절한 tiered pricing을 적용합니다.

```python
from litellm import completion_cost

# Example: Small prompt (< 200k tokens)
response_small = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Hello!"}]
)
# Uses base pricing: $0.000002/input token, $0.000012/output token

# Example: Large prompt (> 200k tokens)
response_large = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "..." * 250000}]  # 250k tokens
)
# Automatically uses tiered pricing: $0.000004/input token, $0.000018/output token
```

#### 비용 구성

비용 계산에는 다음 항목이 포함됩니다.

1. **Text Processing Cost**: base 또는 tiered rate로 처리되는 regular token
2. **Cache Read Cost**: discounted rate로 읽는 cached token
3. **Cache Creation Cost**: token을 cache에 기록할 때의 1회성 비용(200k 초과 시 tiered rate 적용)
4. **Output Cost**: base 또는 tiered rate로 계산되는 generated token

### 예제: 비용 구성 확인

LiteLLM 비용 추적으로 상세 비용 구성을 확인할 수 있습니다.

```python
from litellm import completion, completion_cost

response = completion(
    model="gemini/gemini-3-pro-preview",
    messages=[{"role": "user", "content": "Explain prompt caching"}],
    caching=True  # Enable prompt caching
)

# Get total cost
total_cost = completion_cost(completion_response=response)
print(f"Total cost: ${total_cost:.6f}")

# Access usage details
usage = response.usage
print(f"Prompt tokens: {usage.prompt_tokens}")
print(f"Completion tokens: {usage.completion_tokens}")

# Access caching details
if usage.prompt_tokens_details:
    print(f"Cache hit tokens: {usage.prompt_tokens_details.cached_tokens}")
    print(f"Cache creation tokens: {usage.prompt_tokens_details.cache_creation_tokens}")
    print(f"Text tokens: {usage.prompt_tokens_details.text_tokens}")
```

### 비용 최적화 팁

1. **Prompt 캐싱 사용**: 반복되는 prompt prefix에는 caching을 켜서 cached portion 비용을 최대 90%까지 줄일 수 있습니다.
2. **Context Size 모니터링**: 200k token을 넘는 prompt에는 tiered pricing이 적용됩니다(input 2x, output 1.5x).
3. **Cache Management**: cache creation token은 cache에 쓸 때 한 번만 과금되고, 이후 읽기는 훨씬 저렴합니다.
4. **사용량 추적**: LiteLLM 내장 비용 추적으로 token type별 지출을 모니터링합니다.

### LiteLLM Proxy와 통합

LiteLLM Proxy를 사용하면 모든 비용 추적이 자동으로 기록되며 다음 경로에서 확인할 수 있습니다.

- **사용 로그**: proxy log의 상세 token 및 cost breakdown
- **Budget Management**: 실제 사용량 기반 budget 및 alert 설정
- **Analytics Dashboard**: token type별 비용 추세와 breakdown 확인

```yaml
# config.yaml
model_list:
  - model_name: gemini-3-pro-preview
    litellm_params:
      model: gemini/gemini-3-pro-preview
      api_key: os.environ/GEMINI_API_KEY

litellm_settings:
  # Enable detailed cost tracking
  success_callback: ["langfuse"]  # or your preferred logging service
```

## Claude Code CLI와 함께 사용

Anthropic의 command-line interface인 **Claude Code CLI**와 함께 `gemini-3-pro-preview`를 사용할 수 있습니다. 이를 통해 Claude Code의 native syntax와 workflow로 Gemini 3 Pro Preview를 사용할 수 있습니다.

### 설정

**1. `config.yaml`에 Gemini 3 Pro Preview 추가:**

```yaml
model_list:
  - model_name: gemini-3-pro-preview
    litellm_params:
      model: gemini/gemini-3-pro-preview
      api_key: os.environ/GEMINI_API_KEY

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

**2. 환경 변수 설정:**

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export LITELLM_MASTER_KEY="sk-1234567890"  # Generate a secure key
```

**3. LiteLLM Proxy 시작:**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**4. Claude Code가 LiteLLM Proxy를 사용하도록 설정:**

```bash
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"
```

**5. Claude Code에서 Gemini 3 Pro Preview 사용:**

```bash
# Claude Code will use gemini-3-pro-preview from your LiteLLM proxy
claude --model gemini-3-pro-preview

```

### 예제 사용법

설정이 끝나면 Claude Code의 native interface로 Gemini 3 Pro Preview와 상호작용할 수 있습니다.

```bash
$ claude --model gemini-3-pro-preview
> Explain how thought signatures work in multi-turn conversations.

# Gemini 3 Pro Preview responds through Claude Code interface
```

### 장점

- ✅ **Native Claude Code Experience**: Claude Code의 익숙한 CLI interface로 Gemini 3 Pro Preview 사용
- ✅ **통합 인증**: LiteLLM proxy를 통해 모든 모델에 단일 API key 사용
- ✅ **비용 추적**: 모든 사용량을 LiteLLM 중앙 logging으로 추적
- ✅ **간편한 모델 전환**: Claude와 Gemini 모델 간 손쉬운 전환
- ✅ **전체 기능 지원**: thought signature, function calling 등 모든 Gemini 3 기능이 Claude Code에서 동작

### 문제 해결

**Claude Code가 모델을 찾지 못하는 경우:**
- Claude Code의 모델명이 정확히 `gemini-3-pro-preview`인지 확인하세요.
- proxy가 실행 중인지 확인하세요: `curl http://0.0.0.0:4000/health`
- `ANTHROPIC_BASE_URL`이 LiteLLM proxy를 가리키는지 확인하세요.

**인증 오류:**
- `ANTHROPIC_AUTH_TOKEN`이 LiteLLM master key와 일치하는지 확인하세요.
- `GEMINI_API_KEY`가 올바르게 설정되어 있는지 확인하세요.
- 상세 error message는 LiteLLM proxy log에서 확인하세요.

## Responses API 지원

LiteLLM은 Gemini 3 Pro Preview에 대해 streaming 및 non-streaming mode를 포함한 OpenAI Responses API를 완전히 지원합니다. Responses API는 function calling이 포함된 multi-turn conversation을 구조적으로 처리하는 방법을 제공하며, LiteLLM은 대화 전체에서 thought signature를 자동 보존합니다.

### 예제: Gemini 3에서 Responses API 사용

<Tabs>
<TabItem value="sdk" label="Non-Streaming">

```python
from openai import OpenAI
import json

client = OpenAI()

# 1. Define a list of callable tools for the model
tools = [
    {
        "type": "function",
        "name": "get_horoscope",
        "description": "Get today's horoscope for an astrological sign.",
        "parameters": {
            "type": "object",
            "properties": {
                "sign": {
                    "type": "string",
                    "description": "An astrological sign like Taurus or Aquarius",
                },
            },
            "required": ["sign"],
        },
    },
]

def get_horoscope(sign):
    return f"{sign}: Next Tuesday you will befriend a baby otter."

# Create a running input list we will add to over time
input_list = [
    {"role": "user", "content": "What is my horoscope? I am an Aquarius."}
]

# 2. Prompt the model with tools defined
response = client.responses.create(
    model="gemini-3-pro-preview",
    tools=tools,
    input=input_list,
)

# Save function call outputs for subsequent requests
input_list += response.output

for item in response.output:
    if item.type == "function_call":
        if item.name == "get_horoscope":
            # 3. Execute the function logic for get_horoscope
            horoscope = get_horoscope(json.loads(item.arguments))
            
            # 4. Provide function call results to the model
            input_list.append({
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": json.dumps({
                  "horoscope": horoscope
                })
            })

print("Final input:")
print(input_list)

response = client.responses.create(
    model="gemini-3-pro-preview",
    instructions="Respond only with a horoscope generated by a tool.",
    tools=tools,
    input=input_list,
)

# 5. The model should be able to give a response!
print("Final output:")
print(response.model_dump_json(indent=2))
print("\n" + response.output_text)
```

**핵심 포인트:**
- ✅ function call에서 thought signature가 자동 보존됩니다.
- ✅ 멀티턴 대화와 자연스럽게 동작합니다.
- ✅ 모든 Gemini 3 전용 기능을 완전히 지원합니다.

</TabItem>
<TabItem value="streaming" label="Streaming">

```python
from openai import OpenAI
import json

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_horoscope",
        "description": "Get today's horoscope for an astrological sign.",
        "parameters": {
            "type": "object",
            "properties": {
                "sign": {
                    "type": "string",
                    "description": "An astrological sign like Taurus or Aquarius",
                },
            },
            "required": ["sign"],
        },
    },
]

def get_horoscope(sign):
    return f"{sign}: Next Tuesday you will befriend a baby otter."

input_list = [
    {"role": "user", "content": "What is my horoscope? I am an Aquarius."}
]

# Streaming mode
response = client.responses.create(
    model="gemini-3-pro-preview",
    tools=tools,
    input=input_list,
    stream=True,
)

# Collect all chunks
chunks = []
for chunk in response:
    chunks.append(chunk)
    # Process streaming chunks as they arrive
    print(chunk)

# Thought signatures are automatically preserved in streaming mode
```

**핵심 포인트:**
- ✅ 스트리밍 모드 완전 지원
- ✅ 스트리밍 chunk 전반에서 thought signature 보존
- ✅ 함수 호출과 응답을 실시간 처리

</TabItem>
</Tabs>

### Responses API 장점

- ✅ **구조화된 출력**: Responses API는 함수 호출과 멀티턴 대화를 처리하기 위한 명확한 구조를 제공합니다.
- ✅ **Thought Signature 보존**: LiteLLM은 스트리밍 및 비스트리밍 모드 모두에서 thought signature를 자동 보존합니다.
- ✅ **매끄러운 통합**: 기존 OpenAI SDK pattern과 함께 동작합니다.
- ✅ **전체 기능 지원**: thought signature, function calling, reasoning 등 모든 Gemini 3 기능을 완전히 지원합니다.


## 권장 사항

#### 1. 대화 기록에 Thought Signature를 항상 포함

함수 호출을 사용하는 멀티턴 대화를 만들 때는 다음을 따르세요.

✅ **권장:**
```python
# Append the full assistant message (includes thought signatures)
messages.append(response.choices[0].message)
```

❌ **비권장:**
```python
# Don't manually construct assistant messages without thought signatures
messages.append({
    "role": "assistant",
    "tool_calls": [...]  # Missing thought signatures!
})
```

#### 2. 적절한 Thinking Level 사용

- **`reasoning_effort="low"`**: 단순 query, 빠른 response, 비용 최적화
- **`reasoning_effort="high"`**: 깊은 reasoning이 필요한 복잡한 문제

#### 3. Temperature는 기본값 유지

Gemini 3 모델에는 항상 `temperature=1.0`(기본값)을 사용하세요. 더 낮은 temperature는 문제를 일으킬 수 있습니다.

#### 4. 모델 전환을 안정적으로 처리

non-Gemini-3에서 Gemini 3로 전환할 때:
- ✅ LiteLLM이 누락된 thought signature를 자동 처리합니다.
- ✅ 수동 개입이 필요 없습니다.
- ✅ conversation history가 자연스럽게 이어집니다.


## 문제 해결

#### 문제: Thought Signatures 누락

**증상**: 대화 기록에 assistant message를 포함할 때 error 발생

**해결**: response에서 받은 전체 assistant message를 추가하는지 확인하세요.
```python
messages.append(response.choices[0].message)  # ✅ Includes thought signatures
```

#### 문제: 모델 전환 시 대화가 깨짐

**증상**: gemini-2.5-flash에서 gemini-3-pro-preview로 전환할 때 error 발생

**해결**: 이 흐름은 자동으로 동작해야 합니다. LiteLLM이 dummy signature를 추가합니다. error가 보이면 최신 LiteLLM version을 사용하는지 확인하세요.

#### 문제: 무한 루프 또는 성능 저하

**증상**: 모델이 멈추거나 낮은 품질의 결과를 생성

**해결**:
- `temperature=1.0`인지 확인하세요(Gemini 3 기본값).
- `reasoning_effort`가 적절히 설정되어 있는지 확인하세요.
- 올바른 모델명 `gemini/gemini-3-pro-preview`를 사용하는지 확인하세요.

## 추가 리소스

- [Gemini Provider 문서](/litellm-docs-kr/docs/providers/gemini)
- [Thought Signatures 가이드](/litellm-docs-kr/docs/providers/gemini#thought-signatures)
- [Reasoning Content 문서](/litellm-docs-kr/docs/reasoning_content)
- [Function Calling 가이드](/litellm-docs-kr/docs/completion/function_call)
