---
slug: gpt_5_4
title: "출시 당일 지원: GPT-5.4"
date: 2026-03-05T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM의 GPT-5.4 모델 지원 안내"
tags: [openai, gpt-5.4, completion, 출시-당일-지원]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 GPT-5.4를 완전히 지원합니다.

{/* truncate */}

## Docker 이미지

```bash
docker pull ghcr.io/berriai/litellm:v1.81.14-stable.gpt-5.4_patch
```

## 사용법

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gpt-5.4
    litellm_params:
      model: openai/gpt-5.4
      api_key: os.environ/OPENAI_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.81.14-stable.gpt-5.4_patch \
  --config /app/config.yaml
```

**3. 테스트**

```bash
curl -X POST "http://0.0.0.0:4000/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.4",
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
    model="openai/gpt-5.4",
    messages=[
        {"role": "user", "content": "Write a Python function to check if a number is prime."}
    ],
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## 참고

- 이 모델의 비용 추적을 적용하려면 container를 재시작하세요.
- 더 나은 모델 성능을 위해 `/responses`를 사용하세요.
- GPT-5.4는 reasoning, function calling, vision, tool-use를 지원합니다. 고급 사용법은 [OpenAI 제공자 문서](/litellm-docs-kr/docs/providers/openai)를 참고하세요.
