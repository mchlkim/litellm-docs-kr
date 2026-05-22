---
slug: claude_opus_4_6
title: "출시 당일 지원: Claude Opus 4.6"
date: 2026-02-05T10:00:00
authors:
  - sameer
  - ishaan-alt
  - krrish
description: "LiteLLM AI Gateway에서 Claude Opus 4.6을 출시 당일 지원합니다. Anthropic, Azure, Vertex AI, Bedrock 전반에서 사용할 수 있습니다."
tags: [anthropic, claude, opus 4.6]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 Claude Opus 4.6을 출시 당일 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock 전반에서 사용할 수 있습니다.

{/* truncate */}

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:litellm_stable_release_branch-v1.80.0-stable.opus-4-6
```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

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

**3. 테스트**

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

**1. config.yaml 설정**

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

**3. 테스트**

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

**1. config.yaml 설정**

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

**3. 테스트**

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

**1. config.yaml 설정**

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

**3. 테스트**

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

### Compaction

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 새 `claude-opus-4-6`에서 compaction 활성화를 지원합니다.

**Compaction 활성화**

compaction을 활성화하려면 `compact_20260112` edit type과 함께 `context_management` parameter를 추가합니다.

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
Anthropic이 `context_management`에서 지원하는 모든 parameter를 그대로 추가할 수 있습니다. LiteLLM은 요청에 `compact-2026-01-12` beta header를 자동으로 추가합니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

핵심 정보를 보존하면서 context size를 줄이려면 compaction을 활성화하세요. compaction이 활성화되면 LiteLLM은 `compact-2026-01-12` beta header를 자동으로 추가합니다.

:::info
**Provider 지원:** Compaction은 Anthropic, Azure AI, Vertex AI에서 지원됩니다. Bedrock(Invoke 또는 Converse API)에서는 **지원되지 않습니다**.
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


**Compaction block이 포함된 응답**

응답에는 `provider_specific_fields.compaction_blocks`에 compaction summary가 포함됩니다.

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

**후속 요청에서 compaction block 사용**

compaction을 유지한 채 대화를 이어가려면 assistant message의 `provider_specific_fields`에 compaction block을 포함합니다.

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

**Streaming 지원**

Compaction block은 streaming mode에서도 지원됩니다. 다음 항목을 받게 됩니다.
- compaction block이 시작될 때 `compaction_start` event
- compaction content를 담은 `compaction_delta` event
- `provider_specific_fields` 안에 누적된 `compaction_blocks`

### Adaptive Thinking

:::note
Claude Opus 4.6에서 `reasoning_effort`를 사용하면 모든 값(`low`, `medium`, `high`)이 `thinking: {type: "adaptive"}`로 mapping됩니다. `type: "enabled"`와 함께 명시적인 thinking budget을 사용하려면 native `thinking` parameter를 직접 전달하세요. 아래 "네이티브 thinking parameter" tab을 참고하세요.
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` parameter를 통해 adaptive thinking을 지원합니다.

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

adaptive thinking mode를 활성화하려면 `type: "adaptive"`와 함께 `thinking` parameter를 사용합니다.

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
<TabItem value="native" label="네이티브 thinking parameter">

SDK에서 adaptive thinking을 사용하려면 `thinking` parameter를 직접 전달합니다.

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

### Effort Level

<Tabs>
<TabItem value="completions" label="/chat/completions">

사용 가능한 effort level은 `low`, `medium`, `high`(기본값), `max` 네 가지입니다. `output_config` parameter로 직접 전달합니다.

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

모델 제어를 더 세밀하게 하려면 reasoning effort와 `output_config`를 함께 사용할 수 있습니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

사용 가능한 effort level은 `low`, `medium`, `high`(기본값), `max` 네 가지입니다. `output_config` parameter로 직접 전달합니다.

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

### 1M 토큰 컨텍스트(베타)

Opus 4.6은 1M token context를 지원합니다. 200k token을 초과하는 prompt에는 premium pricing이 적용됩니다(입력/출력 100만 token당 $10/$37.50). LiteLLM은 1M token context의 비용 계산을 지원합니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

1M token context window를 사용하려면 client의 `anthropic-beta` header를 LLM provider로 전달해야 합니다.

**1단계: config에서 header forwarding 활성화**

```yaml
general_settings:
  forward_client_headers_to_llm_api: true
```

**2단계: beta header와 함께 요청 전송**

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

1M token context window를 사용하려면 client의 `anthropic-beta` header를 LLM provider로 전달해야 합니다.

**1단계: config에서 header forwarding 활성화**

```yaml
general_settings:
  forward_client_headers_to_llm_api: true
```

**2단계: beta header와 함께 요청 전송**

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
여러 beta header는 comma로 구분해 함께 사용할 수 있습니다.
```bash
--header 'anthropic-beta: context-1m-2025-08-07,compact-2026-01-12'
```
:::

</TabItem>
</Tabs>

### US-Only Inference

1.1배 token 가격으로 사용할 수 있습니다. LiteLLM은 US-only inference 비용을 자동으로 추적합니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

US-only inference를 지정하려면 `inference_geo` parameter를 사용합니다.

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

LiteLLM은 비용 추적에서 US-only inference에 1.1배 pricing multiplier를 자동 적용합니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

US-only inference를 지정하려면 `inference_geo` parameter를 사용합니다.

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

LiteLLM은 비용 추적에서 US-only inference에 1.1배 pricing multiplier를 자동 적용합니다.

</TabItem>
</Tabs>

### Fast Mode

:::info
Fast mode는 **Anthropic provider에서만 지원됩니다**(`anthropic/claude-opus-4-6`). Azure AI, Vertex AI, Bedrock에서는 사용할 수 없습니다.
:::

**가격:**
- Standard: MTok당 입력 $5 / 출력 $25
- Fast: MTok당 입력 $30 / 출력 $150(6배 premium)

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

**OpenAI SDK 사용:**

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

**LiteLLM SDK 사용:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-opus-4-6",
    messages=[{"role": "user", "content": "Refactor this module..."}],
    max_tokens=4096,
    speed="fast"
)
```

LiteLLM은 usage와 cost calculation에서 fast mode의 더 높은 비용을 자동으로 추적합니다.

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

LiteLLM은 자동으로 다음을 처리합니다.
- `fast-mode-2026-02-01` beta header 추가
- 비용 계산에서 6배 premium pricing 추적

</TabItem>
</Tabs>
