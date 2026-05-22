---
slug: minimax_m2_5
title: "출시 당일 지원: MiniMax-M2.5"
date: 2026-02-12T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM의 MiniMax-M2.5 출시 당일 지원 안내"
tags: [minimax, M2.5, llm]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 MiniMax-M2.5를 출시 당일부터 지원합니다. LiteLLM AI Gateway를 통해 OpenAI 호환 및 Anthropic 호환 API 전반에서 사용할 수 있습니다.

{/* truncate */}

## 지원 모델

LiteLLM은 다음 MiniMax 모델을 지원합니다.

| 모델 | 설명 | 입력 비용 | 출력 비용 | 컨텍스트 창 |
|-------|-------------|------------|-------------|----------------|
| **MiniMax-M2.5** | 고급 추론 및 에이전트 기능 | $0.3/M tokens | $1.2/M tokens | 1M tokens |
| **MiniMax-M2.5-lightning** | 더 빠른 모델(~100 tps) | $0.3/M tokens | $2.4/M tokens | 1M tokens |

## 지원 기능

- **프롬프트 캐싱**: 캐시된 프롬프트로 비용 절감(cache read $0.03/M tokens, cache write $0.375/M tokens)
- **함수 호출**: 내장 도구 호출 지원
- **추론**: thinking 지원이 포함된 고급 추론 기능
- **시스템 메시지**: 전체 system message 지원
- **비용 추적**: 모든 요청에 대한 자동 비용 계산

## Docker 이미지

```bash
docker pull litellm/litellm:v1.81.3-stable
```

## 사용법 - OpenAI 호환 API (/v1/chat/completions)

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: minimax-m2-5
    litellm_params:
      model: minimax/MiniMax-M2.5
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/v1
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e MINIMAX_API_KEY=$MINIMAX_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.81.3-stable \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "minimax-m2-5",
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

### Reasoning Split 사용

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "minimax-m2-5",
  "messages": [
    {
      "role": "user",
      "content": "Solve: 2+2=?"
    }
  ],
  "extra_body": {
    "reasoning_split": true
  }
}'
```

## 사용법 - Anthropic 호환 API (/v1/messages)

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: minimax-m2-5
    litellm_params:
      model: minimax/MiniMax-M2.5
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/anthropic/v1/messages
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e MINIMAX_API_KEY=$MINIMAX_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.81.3-stable \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "minimax-m2-5",
  "max_tokens": 1000,
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

### Thinking 사용

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "minimax-m2-5",
  "max_tokens": 1000,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 1000
  },
  "messages": [
    {
      "role": "user",
      "content": "Solve: 2+2=?"
    }
  ]
}'
```

## 사용법 - LiteLLM SDK

### OpenAI 호환 API

```python
import litellm

response = litellm.completion(
    model="minimax/MiniMax-M2.5",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

print(response.choices[0].message.content)
```

### Anthropic 호환 API

```python
import litellm

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.5",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/anthropic/v1/messages",
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### Thinking 사용

```python
response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.5",
    messages=[{"role": "user", "content": "Solve: 2+2=?"}],
    thinking={"type": "enabled", "budget_tokens": 1000},
    api_key="your-minimax-api-key"
)

# Access thinking content
for block in response.choices[0].message.content:
    if hasattr(block, 'type') and block.type == 'thinking':
        print(f"Thinking: {block.thinking}")
```

### Reasoning Split 사용(OpenAI API)

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.5",
    messages=[
        {"role": "user", "content": "Solve: 2+2=?"}
    ],
    extra_body={"reasoning_split": True},
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

# Access thinking and response
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking: {response.choices[0].message.reasoning_details}")
print(f"Response: {response.choices[0].message.content}")
```

## 비용 추적

LiteLLM은 MiniMax-M2.5 요청 비용을 자동으로 추적합니다. 가격은 다음과 같습니다.

- **입력**: 1M tokens당 $0.3
- **출력**: 1M tokens당 $1.2
- **캐시 읽기**: 1M tokens당 $0.03
- **캐시 쓰기**: 1M tokens당 $0.375

### 비용 정보 접근

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.5",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="your-minimax-api-key"
)

# Access cost information
print(f"Cost: ${response._hidden_params.get('response_cost', 0)}")
```

## Streaming 지원

### OpenAI API

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.5",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### Reasoning Split과 함께 Streaming 사용

```python
stream = litellm.completion(
    model="minimax/MiniMax-M2.5",
    messages=[
        {"role": "user", "content": "Tell me a story"},
    ],
    extra_body={"reasoning_split": True},
    stream=True,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

reasoning_buffer = ""
text_buffer = ""

for chunk in stream:
    if hasattr(chunk.choices[0].delta, "reasoning_details") and chunk.choices[0].delta.reasoning_details:
        for detail in chunk.choices[0].delta.reasoning_details:
            if "text" in detail:
                reasoning_text = detail["text"]
                new_reasoning = reasoning_text[len(reasoning_buffer):]
                if new_reasoning:
                    print(new_reasoning, end="", flush=True)
                    reasoning_buffer = reasoning_text

    if chunk.choices[0].delta.content:
        content_text = chunk.choices[0].delta.content
        new_text = content_text[len(text_buffer):] if text_buffer else content_text
        if new_text:
            print(new_text, end="", flush=True)
            text_buffer = content_text
```

## 네이티브 SDK와 함께 사용

### LiteLLM Proxy를 통한 Anthropic SDK

```python
import os
os.environ["ANTHROPIC_BASE_URL"] = "http://localhost:4000"
os.environ["ANTHROPIC_API_KEY"] = "sk-1234"  # Your LiteLLM proxy key

import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="minimax-m2-5",
    max_tokens=1000,
    system="You are a helpful assistant.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Hi, how are you?"
                }
            ]
        }
    ]
)

for block in message.content:
    if block.type == "thinking":
        print(f"Thinking:\n{block.thinking}\n")
    elif block.type == "text":
        print(f"Text:\n{block.text}\n")
```

### LiteLLM Proxy를 통한 OpenAI SDK

```python
import os
os.environ["OPENAI_BASE_URL"] = "http://localhost:4000"
os.environ["OPENAI_API_KEY"] = "sk-1234"  # Your LiteLLM proxy key

from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="minimax-m2-5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hi, how are you?"},
    ],
    extra_body={"reasoning_split": True},
)

# Access thinking and response
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking:\n{response.choices[0].message.reasoning_details[0]['text']}\n")
print(f"Text:\n{response.choices[0].message.content}\n")
```
