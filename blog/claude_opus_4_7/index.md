---
slug: claude_opus_4_7
title: "데이 0 지원: Claude Opus 4.7"
date: 2026-04-16T10:00:00
authors:
  - sameer
  - ishaan-alt
  - krrish
description: "LiteLLM AI Gateway에서 Claude Opus 4.7에 대한 Day 0 지원 - Anthropic, Azure, Vertex AI, 및 Bedrock에서의 사용 가능"
tags: [anthropic, claude, opus 4.7]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)을 Day 0부터 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock을 통해 사용할 수 있습니다.

{/* truncate */}

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.83.3-stable.opus-4.7
```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

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

**3. 테스트해보기!**

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

**1. 설정 config.yaml**

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

**3. 테스트해 보세요!**

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

**1. 설정 config.yaml**

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

**3. 테스트해 보세요!**

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

**1. 설정 config.yaml**

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

**3. 테스트해보기!**

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

### 적응적 사고

:::note
`reasoning_effort`을 Claude Opus 4.7과 함께 사용할 때, 모든 값 (`low`, `medium`, `high`, `xhigh`, `max`)은 `thinking: {type: "adaptive"}`에 매핑됩니다. Opus 4.7은 적응형 사고만 지원하며, `thinking: {type: "enabled", budget_tokens: ...}`를 통해 명시적으로 예산을 설정하는 것은 Anthropic API에서 400 오류로 거부됩니다. 사고 깊이를 제어하려면, 고정된 예산 대신 `output_config.effort` (아래 [Effort Levels](#effort-levels) 참조)과 적응형 사고를 결합하세요.
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` 파라미터를 통해 적응적 사고를 지원합니다:

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

`thinking` 파라미터를 `type: "adaptive"`와 함께 사용하여 적응형 사고 모드를 활성화하십시오:

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

### 노력 수준

Claude Opus 4.7은 다섯 가지 노력을 수준을 지원합니다: `low`, `medium`, `high` (기본값), `xhigh`, 그리고 `max`. 이는 모델이 작업에 대해 얼마나 많은 추론을 수행할지를 더 세부적으로 제어할 수 있게 합니다. 노력을 수준은 `output_config` 파라미터를 통해 전달합니다.

`xhigh`는 Opus 4.7에서 새롭게 도입된 노력 수준으로, `high` 위에 위치하며 코딩 및 에이전트 작업의 권장 시작점으로 사용됩니다. `max`는 `xhigh` 위에 위치하며 절대적인 최고 능력을 제공하므로, 진정으로 최전선의 문제에만 사용해야 합니다. 대부분의 작업 부하에서는 상대적으로 작은 품질 향상에 비해 토큰 비용이 크게 증가하기 때문입니다.

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

**OpenAI SDK 사용하기:**

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

**LiteLLM 사용법 SDK:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-opus-4-7",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    output_config={"effort": "xhigh"},
)
```

`reasoning_effort`과 `output_config`을 결합하여 모델의 행동에 대해 더욱 세밀한 제어를 할 수 있습니다.

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

**노력 수준 가이드:**

| 노력 | 사용 시기 |
|--------|-------------|
| `low` | 짧고 빠른 응답 — 간단한 조회, 형식화, 분류 |
| `medium` | 일상적인 질문 및 가벼운 추론에 적합한 균형 잡힌 트레이드오프 |
| `high` (기본값) | 복잡한 추론, 코드 생성, 분석 |
| `xhigh` | 가장 어려운 문제 — 다단계 수학, 깊은 연구, 에이전트 계획 |

