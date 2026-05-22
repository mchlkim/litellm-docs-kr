---
slug: gemini_3_1_flash_lite_preview
title: "출시 당일 지원: LiteLLM에서 Gemini 3.1 Flash Lite Preview 사용"
date: 2026-03-03T08:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM Proxy와 SDK에서 Gemini 3.1 Flash Lite Preview를 출시 당일 지원으로 사용하는 방법."
tags: [gemini, 출시 당일 지원, llms, supernova]
hide_table_of_contents: false
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini 3.1 Flash Lite Preview 출시 당일 지원

LiteLLM은 `gemini-3.1-flash-lite-preview`를 출시 당일부터 완전히 지원합니다.

:::note
비용 추적만 필요하다면 현재 LiteLLM version을 바꿀 필요가 없습니다. 다만 thinking level처럼 함께 추가된 새 기능 지원이 필요하다면 `v1.80.8-stable.1` 이상을 사용해야 합니다.
:::

{/* truncate */}

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-v1.80.8-stable.1
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==v1.80.8-stable.1
```

</TabItem>
</Tabs>

## 새로운 기능

네 가지 thinking level을 모두 지원합니다.
- **MINIMAL**: 최소 추론으로 매우 빠른 응답
- **LOW**: 단순 지시 이행
- **MEDIUM**: 복잡한 작업을 위한 균형 잡힌 추론
- **HIGH**: 최대 추론 깊이(dynamic)

---

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

**기본 사용법**

```python
from litellm import completion

response = completion(
    model="gemini/gemini-3.1-flash-lite-preview",
    messages=[{"role": "user", "content": "Extract key entities from this text: ..."}],
)

print(response.choices[0].message.content)
```

**Thinking Level 사용**

```python
from litellm import completion

# Use MEDIUM thinking for complex reasoning tasks
response = completion(
    model="gemini/gemini-3.1-flash-lite-preview",
    messages=[{"role": "user", "content": "Analyze this dataset and identify patterns"}],
    reasoning_effort="medium",  # low, medium , high
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gemini-3.1-flash-lite
    litellm_params:
      model: gemini/gemini-3.1-flash-lite-preview
      api_key: os.environ/GEMINI_API_KEY
  
  # Or use Vertex AI
  - model_name: vertex-gemini-3.1-flash-lite
    litellm_params:
      model: vertex_ai/gemini-3.1-flash-lite-preview
      vertex_project: your-project-id
      vertex_location: us-central1
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 요청 보내기**

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-3.1-flash-lite",
    "messages": [{"role": "user", "content": "Extract structured data from this text"}],
    "reasoning_effort": "low"
  }'
```

</TabItem>
</Tabs>

---

## 지원 엔드포인트

LiteLLM은 Gemini 3.1 Flash Lite Preview에 대해 다음 엔드포인트에서 **엔드투엔드 전체 지원**을 제공합니다.

- ✅ `/v1/chat/completions` - OpenAI 호환 chat completions 엔드포인트
- ✅ `/v1/responses` - OpenAI Responses API 엔드포인트(streaming 및 non-streaming)
- ✅ [`/v1/messages`](/litellm-docs-kr/docs/anthropic_unified) - Anthropic 호환 messages 엔드포인트
- ✅ `/v1/generateContent` - [Google Gemini API](/litellm-docs-kr/docs/generateContent) 호환 엔드포인트

모든 엔드포인트는 다음을 지원합니다.
- Streaming 및 non-streaming 응답
- thought signature를 포함한 function calling
- 멀티턴 대화
- thinking level, thought signature 등 Gemini 3 전용 기능 전체
- text, image, audio, video를 포함한 전체 multimodal 지원

---

## Gemini 3.1의 `reasoning_effort` 매핑

LiteLLM은 OpenAI `reasoning_effort` parameter를 Gemini의 `thinkingLevel`로 자동 매핑합니다.

| reasoning_effort | thinking_level | 사용 사례 |
|------------------|----------------|----------|
| `minimal` | `minimal` | 매우 빠른 응답, 단순 query |
| `low` | `low` | 기본 지시 이행 |
| `medium` | `medium` | 중간 복잡도 작업을 위한 균형 잡힌 추론 |
| `high` | `high` | 최대 추론 깊이, 복잡한 문제 |
| `disable` | `minimal` | 확장 추론 비활성화 |
| `none` | `minimal` | 확장 추론 없음 |
