---
slug: claude_opus_4_7
title: "출시 당일 지원: Claude Opus 4.7"
date: 2026-04-16T10:00:00
authors:
  - sameer
  - ishaan-alt
  - krrish
description: "LiteLLM AI Gateway에서 Claude Opus 4.7을 출시 당일부터 Anthropic, Azure, Vertex AI, Bedrock 전반에 사용할 수 있습니다."
tags: [anthropic, claude, opus 4.7]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)을 출시 당일부터 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock 전반에서 같은 방식으로 사용할 수 있습니다.

{/* truncate */}

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7
```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-opus-4-7
    litellm_params:
      model: anthropic/claude-opus-4-7
      api_key: os.environ/ANTHROPIC_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7 \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
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

## 사용법 - Azure

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-opus-4-7
    litellm_params:
      model: azure_ai/claude-opus-4-7
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE  # https://<resource>.services.ai.azure.com
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e AZURE_AI_API_KEY=$AZURE_AI_API_KEY \
  -e AZURE_AI_API_BASE=$AZURE_AI_API_BASE \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7 \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
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

## 사용법 - Vertex AI

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-opus-4-7
    litellm_params:
      model: vertex_ai/claude-opus-4-7
      vertex_project: os.environ/VERTEX_PROJECT
      vertex_location: us-east5
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e VERTEX_PROJECT=$VERTEX_PROJECT \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/credentials.json:/app/credentials.json \
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7 \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
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

## 사용법 - Bedrock

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-opus-4-7
    litellm_params:
      model: bedrock/anthropic.claude-opus-4-7
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7 \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
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

## 고급 기능

### Adaptive Thinking

:::note
Claude Opus 4.7에서 `reasoning_effort`를 사용하면 모든 값(`low`, `medium`, `high`, `xhigh`)이 `thinking: {type: "adaptive"}`로 매핑됩니다. `type: "enabled"`와 명시적 thinking budget을 사용하려면 native `thinking` parameter를 직접 전달하세요.
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` parameter를 통해 adaptive thinking을 지원합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
  "messages": [
    {
      "role": "user",
      "content": "Solve this complex problem: What is the optimal strategy for..."
    }
  ],
  "reasoning_effort": "high"
}'
```

</TabItem>
<TabItem value="messages" label="/v1/messages">

adaptive thinking mode를 켜려면 `thinking` parameter에 `type: "adaptive"`를 사용하세요.

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-7",
    "max_tokens": 16000,
    "thinking": {
        "type": "adaptive"
    },
    "messages": [
        {
            "role": "user",
            "content": "Explain why the sum of two even numbers is always even."
        }
    ]
}'
```

</TabItem>
</Tabs>

### Effort Levels

Claude Opus 4.7은 네 가지 effort level인 `low`, `medium`, `high`(기본값), `xhigh`를 지원합니다. 이를 통해 모델이 작업에 적용하는 추론 강도를 더 세밀하게 제어할 수 있습니다. effort level은 `output_config` parameter로 전달합니다.

`xhigh`는 Opus 4.7에서 추가된 새 effort level이며 `high`보다 높은 단계입니다. `max` effort level은 Claude Opus 4.6 전용이므로 4.7에서는 사용할 수 없습니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-7",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "output_config": {
    "effort": "xhigh"
  }
}'
```

**OpenAI SDK 사용:**

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    extra_body={"output_config": {"effort": "xhigh"}}
)
```

**LiteLLM SDK 사용:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-opus-4-7",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    output_config={"effort": "xhigh"},
)
```

모델 동작을 더 세밀하게 제어하려면 `reasoning_effort`와 `output_config`를 함께 사용할 수 있습니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-7",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "Explain quantum computing"
        }
    ],
    "output_config": {
        "effort": "xhigh"
    }
}'
```

</TabItem>
</Tabs>

**Effort level 가이드:**

| Effort | 사용 시점 |
|--------|-------------|
| `low` | 짧고 빠른 응답: 간단한 조회, 포맷팅, 분류 |
| `medium` | 일반적인 Q&A와 가벼운 추론을 위한 균형 |
| `high` (기본값) | 복잡한 추론, 코드 생성, 분석 |
| `xhigh` | 다단계 수학, 깊은 리서치, 에이전트 계획처럼 가장 어려운 문제 |
