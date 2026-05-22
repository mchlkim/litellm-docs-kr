---
slug: gpt_5_4_mini_nano
title: "출시 당일 지원: GPT-5.4-mini 및 GPT-5.4-nano"
date: 2026-03-17T10:00:00
authors:
  - name: Sameer Kankute
    title: SWE @ LiteLLM (LLM 번역)
    url: https://www.linkedin.com/in/sameer-kankute/
    image_url: https://pbs.twimg.com/profile_images/2001352686994907136/ONgNuSk5_400x400.jpg
  - name: Krrish Dholakia
    title: "CEO, LiteLLM"
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: "CTO, LiteLLM"
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
description: "LiteLLM의 GPT-5.4-mini 및 GPT-5.4-nano 모델 지원 안내"
tags: [openai, gpt-5.4-mini, gpt-5.4-nano, completion]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

LiteLLM은 이제 GPT-5.4-mini와 GPT-5.4-nano를 지원합니다. 두 모델은 간단한 completion과 고처리량 워크로드에 적합한 비용 효율적인 모델입니다.

:::note
**v1.82.3-stable** 이상을 사용 중이라면 이 모델을 사용하기 위해 별도 업데이트가 필요하지 않습니다.
:::

{/* truncate */}

## 사용법

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gpt-5.4-mini
    litellm_params:
      model: openai/gpt-5.4-mini
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-5.4-nano
    litellm_params:
      model: openai/gpt-5.4-nano
      api_key: os.environ/OPENAI_API_KEY
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

```bash
# GPT-5.4-mini
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'

# GPT-5.4-nano
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-5.4-nano",
    "messages": [{"role": "user", "content": "What is 2 + 2?"}]
  }'
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

# GPT-5.4-mini
response = completion(
    model="openai/gpt-5.4-mini",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)
print(response.choices[0].message.content)

# GPT-5.4-nano
response = completion(
    model="openai/gpt-5.4-nano",
    messages=[{"role": "user", "content": "What is 2 + 2?"}],
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## 참고

- 두 모델 모두 function calling, vision, tool-use를 지원합니다. 고급 사용법은 [OpenAI 제공자 문서](../../docs/providers/openai)를 참고하세요.
- GPT-5.4-nano는 단순 작업에 가장 비용 효율적인 선택지이고, GPT-5.4-mini는 속도와 성능의 균형을 제공합니다.
