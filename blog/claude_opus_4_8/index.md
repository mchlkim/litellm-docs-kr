---
slug: claude_opus_4_8
title: "데이 0 지원: Claude Opus 4.8"
date: 2026-05-28T10:00:00
authors:
  - mateo
  - krrish
  - ishaan-alt
description: "LiteLLM AI Gateway에서 Claude Opus 4.8에 대한 Day 0 지원. Anthropic, Azure, Vertex AI, 및 Bedrock에서 사용할 수 있습니다."
tags: [anthropic, claude, opus 4.8, day 0 support]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 [Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8)을 Day 0부터 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock을 통해 사용할 수 있습니다. 이미 사용 중인 OpenAI 호환 요청으로 호출할 수 있으며, 지출, 제한 수준, 로깅 등을 한 곳에서 추적할 수 있습니다.

{/* truncate */}

## Opus 4.8 변경 사항

Opus 4.8은 Opus 4.7에 비해 코딩, 에이전트, 추론 벤치마크에서 성능 향상을 기록하며 **동일한 가격**에 제공합니다. 게이트웨이를 통해 실행하는 팀에게는 다음과 같은 점이 주목할 만합니다:

- **더 정확하고 솔직한 에이전트.** Anthropic은 Opus 4.8이 Opus 4.7보다 코드의 결함을 지나치게 허용할 가능성이 **4배 더 낮고**, 불확실성을 표시할 가능성이 더 높으며, 지원되지 않는 주장을 내놓는 경우가 적다고 보고합니다. 이 신뢰성은 모델이 프록시 뒤에서 다단계 도구 호출을 수행할 때 더욱 증가합니다. ([Anthropic 자세한 내용](https://www.anthropic.com/news/claude-opus-4-8))
- **요청별 전체 작업 단계.** `low`, `medium`, `high` (기본값), `xhigh`, 및 `max`. 어려운, 오랜 시간 동안 실행되는 에이전트 작업에는 추론을 *업그레이드*하고, 빠르고 저비용의 응답에는 *다운그레이드*하세요. 각 호출별로 `reasoning_effort` 또는 `output_config`를 설정합니다.
- **중간 작업 시스템 메시지.** Messages API는 이제 `messages` 배열 내부에 `system` 항목을 받을 수 있게 되었으므로, 에이전트는 실행 중에 지시사항, 권한, 또는 토큰 예산을 업데이트할 수 있으며, 프롬프트 캐시를 깨지 않고 실행할 수 있습니다. 이는 LiteLLM의 `/v1/messages` 전달 기능을 통해 바로 이어집니다.
- **Opus 4.7과 동일한 토큰당 가격.** 입력은 $5 / MTok, 출력은 $25 / MTok이며, 프롬프트 캐싱은 읽기 시 $0.50 / MTok, 쓰기 시 $6.25 / MTok입니다. 더 나은 결과, 가격 변동 없음.
- **1M 토큰 컨텍스트**, 최대 128K 출력 토큰.
- **하나의 게이트웨이, 모든 표면.** 시각, PDF 입력, 컴퓨터 사용, 도구 호출, 프롬프트 캐싱, 적응적 사고, 구조화된 출력 등이 Anthropic, Azure, Vertex AI, Bedrock에서 통합된 지출 추적, 로깅, 및 대체 기능을 통해 사용 가능합니다.

## Opus 4.8 활성화

Opus 4.8은 nightly **`v1.88.0-dev.1`** 이미지(그리고 이 후 모든 릴리스)에 배포됩니다. 어떻게 사용할지는 프록시가 가격을 읽는 위치에 따라 달라집니다:

- **기본 (리모트 비용 지도): 업그레이드 필요 없음.** LiteLLM UI에서 **모델 + Endpoints** 아래의 **Price Data** 탭을 열고 **Reload Price Data**를 클릭하세요 (또는 프록시 관리자로서 `POST /reload/model_cost_map`). 이 작업은 LiteLLM의 비용 지도에서 최신 가격을 다시 가져오고, 한 번에 제공업체 라우팅을 다시 등록하므로, `claude-opus-4-8`는 Anthropic, Azure, Vertex AI, 그리고 Bedrock에서 모두 사용 가능하게 됩니다. 이는 프록시 버전이 오래된 경우에도 적용됩니다.
- **`LITELLM_LOCAL_MODEL_COST_MAP=true`를 실행 중인가요?** 비용 지도는 이미 이미지에 포함되어 있으므로, Reload 버튼은 이를 닿을 수 없습니다. `v1.88.0-dev.1` 또는 이후 버전을 뽑아 Opus 4.8 메타데이터가 포함된 버전을 얻으세요:

  ```bash
  docker pull ghcr.io/berriai/litellm:v1.88.0-dev.1
  ```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-opus-4-8
    litellm_params:
      model: anthropic/claude-opus-4-8
      api_key: os.environ/ANTHROPIC_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.88.0-dev.1 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
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
  - model_name: claude-opus-4-8
    litellm_params:
      model: azure_ai/claude-opus-4-8
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
  ghcr.io/berriai/litellm:v1.88.0-dev.1 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
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
  - model_name: claude-opus-4-8
    litellm_params:
      model: vertex_ai/claude-opus-4-8
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
  ghcr.io/berriai/litellm:v1.88.0-dev.1 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
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
  - model_name: claude-opus-4-8
    litellm_params:
      model: bedrock/anthropic.claude-opus-4-8
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
  ghcr.io/berriai/litellm:v1.88.0-dev.1 \
  --config /app/config.yaml
```

**3. 테스트해 보세요!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
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
`reasoning_effort`을 Claude Opus 4.8과 함께 사용할 때, 모든 값 (`low`, `medium`, `high`, `xhigh`, `max`)은 `thinking: {type: "adaptive"}`에 매핑됩니다. Opus 4.8은 적응형 사고만 지원하며, `thinking: {type: "enabled", budget_tokens: ...}`를 통해 명시적으로 예산을 설정하는 것은 Anthropic API에서 400 오류로 거부됩니다. 사고 깊이를 제어하려면, 고정된 예산 대신 `output_config.effort` (아래 [Effort Levels](#effort-levels) 참조)과 적응형 사고를 결합하세요.
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` 파라미터를 통해 적응적 사고를 지원합니다:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
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
    "model": "claude-opus-4-8",
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

Claude Opus 4.8은 다섯 가지 노력을 제공합니다: `low`, `medium`, `high` (기본값), `xhigh`, 그리고 `max`. 이는 모델이 작업에 대해 얼마나 많은 추론을 수행할지를 더 세밀하게 제어할 수 있게 합니다. 노력 수준은 `output_config` 파라미터를 통해 전달합니다.

Opus 4.8은 전체 노력 계단을 지원합니다. `xhigh` (Opus 4.7과 함께 도입됨)과 `max` (Opus 4.6 및 4.7에서도 사용 가능) 모두 사용할 수 있습니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-opus-4-8",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "output_config": {
    "effort": "max"
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
    model="claude-opus-4-8",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    extra_body={"output_config": {"effort": "max"}}
)
```

**LiteLLM 사용법 SDK:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-opus-4-8",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    output_config={"effort": "max"},
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
    "model": "claude-opus-4-8",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "Explain quantum computing"
        }
    ],
    "output_config": {
        "effort": "max"
    }
}'
```

</TabItem>
</Tabs>

**노력 수준 가이드:**

| 노력 | 사용 시기 |
|--------|-------------|
| `low` | 단순 검색, 포맷팅 및 분류에 적합한 짧고 빠른 응답 |
| `medium` | 일상적인 Q&A 및 가벼운 추론에 적합한 균형 잡힌 트레이드오프 |
| `high` (기본값) | 복잡한 추론, 코드 생성 및 분석에 적합 |
| `xhigh` | 다단계 수학, 깊은 연구 및 에이전트 계획과 같은 어려운 문제 |
| `max` | 지연 여부와 관계없이 최대 추론 깊이가 필요한 가장 어려운 작업 |
