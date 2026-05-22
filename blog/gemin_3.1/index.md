---
slug: gemini_3_1_pro
title: "출시 당일 지원: LiteLLM에서 Gemini 3.1 Pro 사용"
date: 2026-02-19T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM Proxy와 SDK에서 Gemini 3.1 Pro를 출시 당일 지원으로 사용하는 방법."
tags: [gemini, 출시 당일 지원, llms]
hide_table_of_contents: false
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini 3.1 Pro 출시 당일 지원

LiteLLM은 `gemini-3.1-pro-preview`와 관련된 새 API 변경 사항을 함께 지원합니다.

{/* truncate */}

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-v1.81.9-stable.gemini.3.1-pro
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==v1.81.9-stable.gemini.3.1-pro
```

</TabItem>
</Tabs>

## 새로운 기능

### 1. 새 Thinking Level: MINIMAL 및 MEDIUM을 포함한 `thinkingLevel`

Gemini 3.1 Pro는 **medium** thinking level을 지원합니다.

LiteLLM은 OpenAI `reasoning_effort` parameter를 Gemini의 `thinkingLevel`로 자동 매핑합니다. 따라서 코드를 바꾸지 않고 익숙한 `reasoning_effort` 값(`minimal`, `low`, `medium`, `high`)을 사용할 수 있습니다.

---
## 지원 엔드포인트

LiteLLM은 Gemini 3.1 Pro에 대해 다음 엔드포인트에서 **엔드투엔드 전체 지원**을 제공합니다.

- ✅ `/v1/chat/completions` - OpenAI 호환 chat completions 엔드포인트
- ✅ `/v1/responses` - OpenAI Responses API 엔드포인트(streaming 및 non-streaming)
- ✅ [`/v1/messages`](/litellm-docs-kr/docs/anthropic_unified) - Anthropic 호환 messages 엔드포인트
- ✅ `/v1/generateContent` - [Google Gemini API](/litellm-docs-kr/docs/generateContent) 호환 엔드포인트

모든 엔드포인트는 다음을 지원합니다.
- Streaming 및 non-streaming 응답
- thought signature를 포함한 function calling
- 멀티턴 대화
- Gemini 3 전용 기능 전체
- provider별 thinking 관련 parameter를 `thinkingLevel`로 변환

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

**MEDIUM 사고 수준 기본 사용법(신규)**

```python
from litellm import completion

# No need to make any changes to your code as we map openai reasoning param to thinkingLevel
response = completion(
    model="gemini/gemini-3.1-pro-preview",
    messages=[{"role": "user", "content": "Solve this complex math problem: 25 * 4 + 10"}],
    reasoning_effort="medium",  # NEW: MEDIUM thinking level
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gemini-3.1-pro-preview
    litellm_params:
      model: gemini/gemini-3.1-pro-preview
      api_key: os.environ/GEMINI_API_KEY
  - model_name: vertex-gemini-3.1-pro-preview
    litellm_params:
      model: vertex_ai/gemini-3.1-pro-preview
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. MEDIUM 사고 수준으로 호출**

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [{"role": "user", "content": "Complex reasoning task"}],
    "reasoning_effort": "medium"
  }'
```

</TabItem>
</Tabs>

---

## Gemini 3+의 `reasoning_effort` 매핑

| reasoning_effort | thinking_level | 
|------------------|----------------|
| `minimal` | `minimal` |
| `low` | `low` |
| `medium` | `medium` |
| `high` | `high` |
| `disable` | `minimal` |
| `none` | `minimal` |
