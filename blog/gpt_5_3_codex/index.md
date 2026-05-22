---
slug: gpt_5_3_codex
title: "출시 당일 지원: GPT-5.3-Codex"
date: 2026-02-24T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM에서 GPT-5.3-Codex를 출시 당일부터 지원합니다. Responses API의 phase 파라미터 처리도 포함합니다."
tags: [openai, gpt-5.3-codex, codex, 출시-당일-지원]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 GPT-5.3-Codex를 출시 당일부터 지원합니다. Responses API output item의 새로운 assistant `phase` metadata도 지원합니다.

{/* truncate */}

## GPT-5.3-Codex에서 `phase`가 중요한 이유

`phase`는 assistant output item에 표시되며, preamble/commentary turn과 최종 마무리 response를 구분하는 데 사용됩니다.

참고: [Phase parameter 문서](https://developers.openai.com/api/reference/overview)

지원 값:
- `null`
- `"commentary"`
- `"final_answer"`

중요:
- assistant output item의 `phase`를 반환된 그대로 저장하세요.
- 다음 turn에서 해당 assistant item을 다시 보내세요.
- user message에는 `phase`를 추가하지 마세요.

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:v1.81.12-stable.gpt-5.3
```

## 사용법 

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gpt-5.3-codex
    litellm_params:
      model: openai/gpt-5.3-codex
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=$OPENAI_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.81.12-stable.gpt-5.3 \
  --config /app/config.yaml
```


**3. 테스트**

```bash
curl -X POST "http://0.0.0.0:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.3-codex",
    "input": "Write a Python script that checks if a number is prime."
  }'
```

</TabItem>
</Tabs>

## Python 예제: OpenAI Client와 LiteLLM Base URL에서 `phase` 유지

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000/v1",  # LiteLLM Proxy
    api_key="your-litellm-api-key",
)

items = []  # Persist this per conversation/thread


def _item_get(item, key, default=None):
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


def run_turn(user_text: str):
    global items

    # User message: no phase field
    items.append(
        {
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": user_text}],
        }
    )

    resp = client.responses.create(
        model="gpt-5.3-codex",
        input=items,
    )

    # Persist assistant output items verbatim, including phase
    for out_item in (resp.output or []):
        items.append(out_item)

    # Optional: inspect latest phase for UI/telemetry routing
    latest_phase = None
    for out_item in reversed(resp.output or []):
        if _item_get(out_item, "type") == "output_item.done" and _item_get(out_item, "phase") is not None:
            latest_phase = _item_get(out_item, "phase")
            break

    return resp, latest_phase
```

## 참고

- GPT Codex 모델에는 `/v1/responses`를 사용하세요.
- 최상의 multi-turn 동작을 위해 전체 assistant output history를 보존하세요.
- history reconstruction 과정에서 `phase` metadata가 누락되면 장기 실행 작업에서 output 품질이 저하될 수 있습니다.
