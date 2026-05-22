---
slug: gpt_5_5
title: "출시 당일 지원: GPT-5.5 및 GPT-5.5 Pro"
date: 2026-04-24T10:00:00
authors:
  - mateo
  - krrish
  - ishaan-alt
description: "LiteLLM에서 GPT-5.5 및 GPT-5.5 Pro를 출시 당일 지원합니다."
tags: [openai, gpt-5.5, gpt-5.5-pro, completion, 출시 당일 지원]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 [GPT-5.5 및 GPT-5.5 Pro](https://openai.com/index/introducing-gpt-5-5/)를 출시 당일 지원합니다. 코드 변경 없이 LiteLLM AI Gateway를 통해 OpenAI의 최신 frontier 모델로 트래픽을 라우팅할 수 있습니다.

{/* truncate */}

GPT-5.5는 OpenAI가 소개한 가장 직관적이고 강력한 모델로, 에이전트형 코딩, computer use, 심층 리서치 워크플로에서 큰 개선을 제공합니다. OpenAI 설명에 따르면 GPT-5.4보다 더 적은 토큰으로 더 빠르고 선명한 추론을 수행합니다. GPT-5.5 Pro는 가장 까다로운 추론 작업을 대상으로 합니다.

:::note
**Docker image upgrade는 필요하지 않습니다.** GPT-5.5는 LiteLLM의 기존 `OpenAIGPT5Config`를 통해 라우팅되므로, 최근 버전이면 바로 동작합니다.

비용 추적을 위해서는 관리자 UI의 **모델 비용 맵 다시 불러오기** 버튼 또는 `POST /reload/model_cost_map`을 사용해 GitHub에서 최신 가격 정보를 가져오세요. 이 기능은 `v1.76.0` 이상에서 사용할 수 있습니다.
:::

## 사용법

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gpt-5.5
    litellm_params:
      model: openai/gpt-5.5
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-5.5-pro
    litellm_params:
      model: openai/gpt-5.5-pro
      api_key: os.environ/OPENAI_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.83.7-stable \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl -X POST "http://0.0.0.0:4000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "Write a Python function to check if a number is prime."}
    ]
  }'
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

response = completion(
    model="openai/gpt-5.5",
    messages=[
        {"role": "user", "content": "Write a Python function to check if a number is prime."}
    ],
)

print(response.choices[0].message.content)
```

```python
# GPT-5.5 Pro
response = completion(
    model="openai/gpt-5.5-pro",
    messages=[
        {"role": "user", "content": "Prove that the sum of two odd integers is even."}
    ],
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## Responses API

에이전트형 워크플로와 multi-turn 워크플로에서는 `/v1/responses`를 사용해 turn 사이의 추론 상태와 출력 항목 메타데이터를 보존합니다.

```bash
curl -X POST "http://0.0.0.0:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Plan and write a Python script that scrapes a webpage and summarizes it."
  }'
```

## 추론 강도

`reasoning_effort`는 모델이 적용하는 추론 강도를 제어합니다. 모델별 지원 값은 다음과 같습니다. 이 값은 2026-04-24에 OpenAI live API 기준으로 검증되었습니다.

| 모델 | 기본값 | 허용 값 |
|-------|---------|----------------|
| `gpt-5.5` | `medium` | `none`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5-pro` | `high` | `medium`, `high`, `xhigh` |

```python
from litellm import completion

response = completion(
    model="openai/gpt-5.5",
    messages=[{"role": "user", "content": "Solve: what is the optimal strategy for..."}],
    reasoning_effort="high",
)
```

LiteLLM은 이 제한을 로컬에서 적용합니다. 지원하지 않는 값(예: `minimal`)을 전달하면 OpenAI까지 왕복해 400을 받기 전에 `UnsupportedParamsError`를 발생시킵니다.

## 참고

- `gpt-5.5` 및 `gpt-5.5-pro` 비용 추적은 관리자 UI의 **모델 비용 맵 다시 불러오기** 버튼 또는 `POST /reload/model_cost_map`으로 최신 가격 정보를 불러오면 됩니다. LiteLLM `v1.76.0` 이상에서 동작하며 container restart나 image upgrade는 필요하지 않습니다.
- `gpt-5.5-pro`는 Responses API 전용 모델입니다(`mode: "responses"`). LiteLLM의 Responses API bridge는 `completion()` 호출을 `/v1/responses`로 투명하게 변환하므로, 위 SDK 예제는 코드 변경 없이 동작합니다.
- GPT-5.5는 reasoning, function calling, parallel tool calls, vision(image input), PDF input, prompt caching, web search, structured output을 지원합니다. 고급 사용법은 [OpenAI 제공자 문서](/litellm-docs-kr/docs/providers/openai)를 참고하세요.
- 컨텍스트 창: 입력 1.05M token / 출력 128K token. 272K token을 초과하면 long-context tier 가격이 적용됩니다.
- Azure 제공 여부: 아직 제공되지 않습니다. 이 글은 OpenAI direct만 다룹니다.
