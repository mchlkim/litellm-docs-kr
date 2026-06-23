---
slug: claude_opus_4_6
title: "데이 0 지원: Claude Opus 4.6"
date: 2026-02-05T10:00:00
authors:
  - sameer
  - ishaan-alt
  - krrish
description: "LiteLLM AI Gateway에서 Claude Opus 4.6에 대한 Day 0 지원 - Anthropic, Azure, Vertex AI, 및 Bedrock에서의 사용 가능"
tags: [anthropic, claude, opus 4.6]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 Day 0부터 Claude Opus 4.6을 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock을 통해 사용할 수 있습니다.

{/* truncate */}

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6
```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-opus-4-6
    litellm_params:
      model: anthropic/claude-opus-4-6
      api_key: os.environ/ANTHROPIC_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6 \
  --config /app/config.yaml
```

**3. 테스트 해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
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
  - model_name: claude-opus-4-6
    litellm_params:
      model: azure_ai/claude-opus-4-6
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
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6 \
  --config /app/config.yaml
```

**3. 테스트해 보세요!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
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
  - model_name: claude-opus-4-6
    litellm_params:
      model: vertex_ai/claude-opus-4-6
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
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
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
  - model_name: claude-opus-4-6
    litellm_params:
      model: bedrock/anthropic.claude-opus-4-6-v1
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
  ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
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

### 압축

<Tabs>
<TabItem value="completions" label="/chat/completions">

Litellm은 새롭게 출시된 claude-opus-4-6에 대해 압축 기능을 활성화할 수 있습니다.

**컴팩션 활성화**

compaction을 활성화하려면 `context_management` 파라미터를 `compact_20260112` 수정 유형과 함께 추가하세요:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather in San Francisco?"
    }
  ],
  "context_management": {
    "edits": [
      {
        "type": "compact_20260112"
      }
    ]
  },
  "max_tokens": 100
}'
```
모든 anthropic의 context_management에 지원되는 파라미터는 지원되며 직접 추가할 수 있습니다. Litellm은 요청에 `compact-2026-01-12` 베타 헤더를 자동으로 추가합니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

압축을 활성화하여 컨텍스트 크기를 줄이면서도 중요한 정보는 유지할 수 있습니다. LiteLLM은 압축이 활성화될 때마다 자동으로 `compact-2026-01-12` 베타 헤더를 추가합니다.

:::info
**Provider Support:** Compaction은 Anthropic, Azure AI, 및 Vertex AI에서 지원됩니다. **Bedrock(Invoke 또는 Converse API)**에서는 지원되지 않습니다.
:::

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "Hi"
        }
    ],
    "context_management": {
        "edits": [
            {
                "type": "compact_20260112"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>


**압축 블록으로 응답**

응답에는 `provider_specific_fields.compaction_blocks`에 압축 요약이 포함됩니다:

```json
{
  "id": "chatcmpl-a6c105a3-4b25-419e-9551-c800633b6cb2",
  "created": 1770357619,
  "model": "claude-opus-4-6",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "message": {
        "content": "I don't have access to real-time data, so I can't provide the current weather in San Francisco. To get up-to-date weather information, I'd recommend checking:\n\n- **Weather websites** like weather.com, accuweather.com, or wunderground.com\n- **Search engines** – just Google \"San Francisco weather\"\n- **Weather apps** on your phone (e.g., Apple Weather, Google Weather)\n- **National",
        "role": "assistant",
        "provider_specific_fields": {
          "compaction_blocks": [
            {
              "type": "compaction",
              "content": "Summary of the conversation: The user requested help building a web scraper..."
            }
          ]
        }
      }
    }
  ],
  "usage": {
    "completion_tokens": 100,
    "prompt_tokens": 86,
    "total_tokens": 186
  }
}
```

**추적 요청에서 압축 블록 사용**

대화를 계속하려면 압축을 통해 대화를 이어가려면, 어시스턴트 메시지의 `provider_specific_fields`에 압축 블록을 포함하세요:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "How can I build a web scraper?"
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Certainly! To build a basic web scraper, you'll typically use a programming language like Python along with libraries such as `requests` (for fetching web pages) and `BeautifulSoup` (for parsing HTML). Here's a basic example:\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\n\nurl = 'https://example.com'\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, 'html.parser')\n\n# Extract and print all text\ntext = soup.get_text()\nprint(text)\n```\n\nLet me know what you're interested in scraping or if you need help with a specific website!"
        }
      ],
      "provider_specific_fields": {
        "compaction_blocks": [
          {
            "type": "compaction",
            "content": "Summary of the conversation: The user asked how to build a web scraper, and the assistant gave an overview using Python with requests and BeautifulSoup."
          }
        ]
      }
    },
    {
      "role": "user",
      "content": "How do I use it to scrape product prices?"
    }
  ],
  "context_management": {
    "edits": [
      {
        "type": "compact_20260112"
      }
    ]
  },
  "max_tokens": 100
}'
```

**스트리밍 지원**

스트리밍 모드에서도 콤팩션 블록이 지원됩니다. 다음 이벤트를 받게 됩니다:
- 콤팩션 블록이 시작될 때 `compaction_start` 이벤트
- 콤팩션 콘텐츠를 포함한 `compaction_delta` 이벤트
- `provider_specific_fields` 에서 `compaction_blocks` 누적된 내용

### 적응적 사고

:::note
`reasoning_effort`를 Claude Opus 4.6과 함께 사용할 때는 모든 값 (`low`, `medium`, `high`, `max`)이 `thinking: {type: "adaptive"}`로 매핑됩니다. `thinking: {type: "enabled", budget_tokens: ...}`를 통해 명시적으로 예산을 설정하는 방식은 Opus 4.6에서는 여전히 작동하지만, 이제는 비추천되며 사용하지 않는 것이 좋습니다. 대신 `output_config.effort`를 사용하여 적응적 사고를 통해 사고 깊이를 제어하는 것이 좋습니다(아래 [Effort Levels](#effort-levels) 참조).
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` 파라미터를 통해 적응적 사고를 지원합니다:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
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
    "model": "claude-opus-4-6",
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
<TabItem value="native" label="Native thinking param">

`thinking` 파라미터를 SDK를 통해 적응형 사고를 직접 사용합니다:

```python
import litellm

response = litellm.completion(
  model="anthropic/claude-opus-4-6",
  messages=[{"role": "user", "content": "Solve this complex problem: What is the optimal strategy for..."}],
  thinking={"type": "adaptive"},
)
```

</TabItem>
</Tabs>

### 노력 수준

<Tabs>
<TabItem value="completions" label="/chat/completions">

사용 가능한 노력 수준은 `low`, `medium`, `high` (기본값), 및 `max`입니다. 직접 `output_config` 파라미터를 통해 전달할 수 있습니다:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "output_config": {
        "effort": "medium"
    }
}'
```

이모델을 더 잘 제어할 수 있도록 reasoning_effort와 output_config를 사용할 수 있습니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

사용 가능한 노력 수준은 `low`, `medium`, `high` (기본값), 및 `max`입니다. 직접 `output_config` 파라미터를 통해 전달할 수 있습니다:

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "Explain quantum computing"
        }
    ],
    "output_config": {
        "effort": "medium"
    }
}'
```

</TabItem>
</Tabs>

### 1M Token Context (Beta)

Opus 4.6은 1M 토큰 컨텍스트를 지원합니다. 프롬프트 토큰이 200k를 초과하는 경우 프리미엄 요금이 적용되며, 1M 토큰당 $10/$37.50(input/output)입니다. LiteLLM은 1M 토큰 컨텍스트에 대한 비용 계산을 지원합니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

1M 토큰 컨텍스트 윈도우를 사용하려면 클라이언트에서 `anthropic-beta` 헤더를 LLM 제공업체로 전달해야 합니다.

**Step 1: Enable header forwarding in your config**

```yaml
general_settings:
  forward_client_headers_to_llm_api: true
```

**단계 2: 베타 헤더를 사용하여 요청 보내기**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--header 'anthropic-beta: context-1m-2025-08-07' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "Analyze this large document..."
    }
  ]
}'
```

</TabItem>
<TabItem value="messages" label="/v1/messages">

1M 토큰 컨텍스트 윈도우를 사용하려면 클라이언트에서 `anthropic-beta` 헤더를 LLM 제공업체로 전달해야 합니다.

**Step 1: Enable header forwarding in your config**

```yaml
general_settings:
  forward_client_headers_to_llm_api: true
```

**Step 2: 베타 헤더를 사용해 요청 보내기**

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'anthropic-beta: context-1m-2025-08-07' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-6",
    "max_tokens": 16000,
    "messages": [
        {
            "role": "user",
            "content": "Analyze this large document..."
        }
    ]
}'
```

:::tip
여러 베타 헤더를 쉼표로 구분하여 결합할 수 있습니다:
```bash
--header 'anthropic-beta: context-1m-2025-08-07,compact-2026-01-12'
```
:::

</TabItem>
</Tabs>

### 미국 전용 추론

1.1× 토큰 가격으로 이용 가능합니다. LiteLLM은 미국 전용 추론에 대한 비용을 자동으로 추적합니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

`inference_geo` 파라미터를 사용하여 미국 전용 추론을 지정하세요:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "inference_geo": "us"
}'
```

LiteLLM은 미국 전용 추론의 비용 추적에 대해 자동으로 1.1× 가격 상승률을 적용합니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

`inference_geo` 파라미터를 사용하여 미국 전용 추론을 지정합니다:

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "What is the capital of France?"
        }
    ],
    "inference_geo": "us"
}'
```

LiteLLM은 미국 전용 추론의 비용 추적에 대해 자동으로 1.1× 요금 인상률을 적용합니다.

</TabItem>
</Tabs>

### Fast Mode

:::info
Fast mode는 **Anthropic 제공업체에서만** 지원됩니다 (`anthropic/claude-opus-4-6`). Azure AI, Vertex AI, 또는 Bedrock에서는 사용할 수 없습니다.
:::

**요금:**
- 표준: MTok당 $5 입력 / $25 출력
- 빠른 처리: MTok당 $30 입력 / $150 출력 (6× 프리미엄)

<Tabs>
<TabItem value="completions" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-6",
  "messages": [
    {
      "role": "user",
      "content": "Refactor this module..."
    }
  ],
  "max_tokens": 4096,
  "speed": "fast"
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
    model="claude-opus-4-6",
    messages=[{"role": "user", "content": "Refactor this module..."}],
    max_tokens=4096,
    extra_body={"speed": "fast"}
)
```

**LiteLLM 사용하기 SDK:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-opus-4-6",
    messages=[{"role": "user", "content": "Refactor this module..."}],
    max_tokens=4096,
    speed="fast"
)
```

LiteLLM은 사용량 및 비용 계산 시 빠른 모드의 더 높은 비용을 자동으로 추적합니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "speed": "fast",
    "messages": [
        {
            "role": "user",
            "content": "Refactor this module..."
        }
    ]
}'
```

LiteLLM은 자동으로:
- `fast-mode-2026-02-01` 베타 헤더를 추가합니다
- 비용 계산에서 6× 프리미엄 가격을 추적합니다

</TabItem>
</Tabs>
