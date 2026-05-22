---
slug: gemini_3_flash
title: "LiteLLM의 Gemini 3 Flash 출시 당일 지원"
date: 2025-12-17T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM Proxy와 SDK에서 출시 당일 지원으로 Gemini 3 Flash를 사용하는 방법입니다."
tags: [gemini, 출시 당일 지원, llms]
hide_table_of_contents: false
---


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini 3 Flash 출시 당일 지원

LiteLLM은 이제 `gemini-3-flash-preview`와 함께 제공되는 새 API 변경 사항을 지원합니다.

:::note
비용 추적만 필요하다면 현재 LiteLLM 버전을 변경하지 않아도 됩니다. 다만 thinking level 같은 새 기능까지 사용하려면 `v1.80.8-stable.1` 이상을 사용해야 합니다.
:::

{/* truncate */}

## 이 버전 배포하기

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
pip install litellm==1.80.8.post1
```

</TabItem>
</Tabs>

## 새로운 기능

### 1. 새로운 thinking level: `thinkingLevel`의 MINIMAL 및 MEDIUM 지원

Gemini 3 Flash는 `thinkingBudget` 대신 `thinkingLevel`로 더 세밀한 사고 제어를 제공합니다.
- **MINIMAL**: 빠른 응답을 위한 초경량 사고
- **MEDIUM**: 복잡한 추론을 위한 균형 잡힌 사고
- **HIGH**: 최대 추론 깊이

LiteLLM은 OpenAI의 `reasoning_effort` 파라미터를 Gemini의 `thinkingLevel`로 자동 매핑합니다. 따라서 코드를 바꾸지 않고도 익숙한 `reasoning_effort` 값(`minimal`, `low`, `medium`, `high`)을 그대로 사용할 수 있습니다.

### 2. Thought Signatures

`gemini-3-pro`와 마찬가지로 이 모델도 도구 호출용 thought signatures를 포함합니다. LiteLLM은 서명 추출과 삽입을 내부에서 처리합니다. [thought signatures 자세히 보기](../gemini_3/index.md#thought-signatures).

**엣지 케이스 처리**: 요청에 thought signatures가 없으면 LiteLLM이 더미 서명을 추가해 API 호출이 깨지지 않도록 합니다.

---
## 지원 엔드포인트

LiteLLM은 Gemini 3 Flash에 대해 다음 엔드포인트에서 **엔드투엔드 전체 지원**을 제공합니다.

- ✅ `/v1/chat/completions` - OpenAI 호환 chat completions 엔드포인트
- ✅ `/v1/responses` - OpenAI Responses API 엔드포인트(스트리밍 및 비스트리밍)
- ✅ [`/v1/messages`](/litellm-docs-kr/docs/anthropic_unified) - Anthropic 호환 messages 엔드포인트
- ✅ `/v1/generateContent` – [Google Gemini API](/litellm-docs-kr/docs/generateContent) 호환 엔드포인트
모든 엔드포인트는 다음을 지원합니다.
- 스트리밍 및 비스트리밍 응답
- thought signatures가 포함된 함수 호출
- 멀티턴 대화
- 모든 Gemini 3 전용 기능
- provider별 thinking 관련 파라미터를 `thinkingLevel`로 변환

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

**MEDIUM 사고 수준을 사용하는 기본 예시(신규)**

```python
from litellm import completion

# OpenAI reasoning 파라미터를 thinkingLevel로 매핑하므로 코드를 변경할 필요가 없습니다.
response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Solve this complex math problem: 25 * 4 + 10"}],
    reasoning_effort="medium",  # 신규: MEDIUM thinking level
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: gemini-3-flash
    litellm_params:
      model: gemini/gemini-3-flash-preview
      api_key: os.environ/GEMINI_API_KEY
```

**2. Proxy 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. MEDIUM 사고 수준으로 호출**

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Complex reasoning task"}],
    "reasoning_effort": "medium"
  }'
```

</TabItem>
</Tabs>

---

## 모든 `reasoning_effort` 레벨

<Tabs>
<TabItem value="minimal" label="MINIMAL">

**초고속 최소 추론**

```python
from litellm import completion

response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "What's 2+2?"}],
    reasoning_effort="minimal",
)
```

</TabItem>

<TabItem value="low" label="LOW">

**단순 지시 이행**

```python
response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Write a haiku about coding"}],
    reasoning_effort="low",
)
```

</TabItem>

<TabItem value="medium" label="MEDIUM (신규)">

**복잡한 작업을 위한 균형 잡힌 추론** ✨

```python
response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Analyze this dataset and find patterns"}],
    reasoning_effort="medium",  # NEW!
)
```

</TabItem>

<TabItem value="high" label="HIGH">

**최대 추론 깊이**

```python
response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Prove this mathematical theorem"}],
    reasoning_effort="high",
)
```

</TabItem>
</Tabs>

---

## 주요 기능

✅ **Thinking Levels**: `MINIMAL`, `LOW`, `MEDIUM`, `HIGH`  
✅ **Thought Signatures**: 고유 식별자로 추론을 추적  
✅ **원활한 통합**: 기존 OpenAI 호환 클라이언트와 함께 동작  
✅ **하위 호환성**: Gemini 2.5 모델은 계속 `thinkingBudget` 사용  

---

## 설치

```bash
pip install litellm --upgrade
```

```python
import litellm
from litellm import completion

response = completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Your question here"}],
    reasoning_effort="medium",  # Use MEDIUM thinking
)
print(response)
```

:::note
이 모델을 `vertex_ai`를 통해 사용하는 경우 현재 지원되는 위치가 `global`뿐이므로 location을 `global`로 유지하세요.
:::


## Gemini 3+용 `reasoning_effort` 매핑

| reasoning_effort | thinking_level | 
|------------------|----------------|
| `minimal` | `minimal` |
| `low` | `low` |
| `medium` | `medium` |
| `high` | `high` |
| `disable` | `minimal` |
| `none` | `minimal` |
