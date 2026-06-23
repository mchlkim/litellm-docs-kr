---
slug: lite-harness-sdk
title: "LiteLLM Labs: Announcing Lite-Harness SDK — Unified API for Claude Code, Codex, and Pi AI"
date: 2026-06-02T09:00:00
authors:
  - krrish
  - ishaan-alt
description: "One SDK. Swap between Claude Code, Codex, and Pi AI by changing a string. Pairs with the LiteLLM AI Gateway for keys, budgets, logs, and fallbacks."
tags: [litellm-labs, product, agents, sdk, ai-gateway]
hide_table_of_contents: true
---


Harnesses는 벤더 락인의 다음 단계입니다. LiteLLM은 모델 제공업체를 쉽게 교체할 수 있도록 설계되었습니다. 그러나 모델이 포화 상태에 접어들면서 다음 경쟁 분야는 harnesses 및 관리형 에이전트가 됩니다. harness 레이어에서 제공업체를 쉽게 변경할 수 있도록 하기 위해 Lite-Harness SDK를 출시합니다. 이는 간단한 TypeScript+Python SDK이며, 개발자는 모델을 변경하는 것처럼 harness를 변경할 수 있습니다.

그것은 Claude Agents SDK 사양을 통합적으로 노출합니다. 이는 Claude Agents SDK로 앱을 작성했고, Pi AI, Hermes, Codex, OpenCode와 같은 다른 harness를 시도하고자 할 때 코드를 다시 작성하지 않고도 이를 수행할 수 있음을 의미합니다.

오늘날, 우리는 Claude Code, Codex, 그리고 Pi AI라는 3가지 harness를 지원하고 있습니다. 다른 harness를 추가하고자 한다면 [here](https://github.com/LiteLLM-Labs/lite-harness/issues)에서 이슈를 생성해 주세요.

이것이 어떻게 작동하는지 보겠습니다:

**TypeScript 예제**

```ts
import { query } from "@lite-harness/sdk";

const prompt = "Fix the failing test";

// Claude Code harness
for await (const message of query({
  prompt,
  options: { harness: "claude-code", model: "claude-opus-4-8" },
})) {
  console.log(message);
}

// Codex harness
for await (const message of query({
  prompt,
  options: { harness: "codex", model: "gpt-5.5" },
})) {
  console.log(message);
}
```

**Python 예제**

```python
from lite_harness import query, AgentOptions

prompt = "Fix the failing test"

# Claude Code harness
async for message in query(
    prompt=prompt,
    options=AgentOptions(harness="claude-code", model="claude-opus-4-8"),
):
    print(message)

# Codex harness
async for message in query(
    prompt=prompt,
    options=AgentOptions(harness="codex", model="gpt-5.5"),
):
    print(message)
```

## LiteLLM AI 게이트웨이

Lite-Harness는 LiteLLM AI Gateway를 통해 harness를 프록시할 수 있습니다. 이는 쉽게 모델 교체, 비용 제어 및 로깅을 가능하게 합니다.

게이트웨이에서 Point Lite-Harness를 지정하려면 두 개의 환경 변수를 설정하세요:

```bash
export LITELLM_API_BASE=https://litellm.your-company.com/v1
export LITELLM_API_KEY=sk-litellm-...
```

그러면 일반적으로 호출하면 됩니다 — 모든 밑단 모델 요청은 게이트웨이를 통해 전달됩니다:

```python
from lite_harness import query, AgentOptions

prompt = "Fix the failing test"

# Claude Code harness
async for message in query(
    prompt=prompt,
    options=AgentOptions(harness="claude-code", model="claude-opus-4-8"),
):
    print(message)

# Codex harness
async for message in query(
    prompt=prompt,
    options=AgentOptions(harness="codex", model="gpt-5.5"),
):
    print(message)
```

---

### 자주 묻는 질문

### LiteLLM AI 게이트웨이를 사용해야 하나요?

1. `lite-harness`는 독립적으로 작동하며, 네이티브 키를 사용해 제공업체 API에 연결할 수 있습니다. AI 게이트웨이 통합은 팀이 중앙 키 관리, 예산, 대체 옵션, 그리고 모든 모델 호출에 대한 단일 감사 로그를 원하는 경우에만 선택적으로 사용할 수 있습니다.

### 허브스를 교체하면 에이전트의 동작이 바뀝니까?

네 — 바로 그 점입니다. 각 허arness는 자체적인 루프, 도구 호출 의미, 프롬프트 형식을 유지합니다. `lite-harness`는 어떻게 실행되는지가 아니라, 어떻게 호출되는지를 통일합니다. 세 가지 모두에 동일한 프롬프트를 실행해 보세요. 어떤 조합이 작업을 가장 잘 수행하는지 확인해 보세요.

### 이 것이 생산용으로 준비되었나요?

`lite-harness`는 초기 단계의 실험 프로젝트이며, 공개 베타 단계입니다. 저희 [discord](https://discord.gg/Nkxw3rm3EE)에 참여하여 선호하는 방식으로 설계하는 데 도움을 주세요.

### LiteLLM OSS에 해당 기능은 제공되나요?

네. `lite-harness`은 [github.com/LiteLLM-Labs/lite-harness](https://github.com/LiteLLM-Labs/lite-harness)에서 MIT 라이선스로 제공됩니다. [LiteLLM 엔터프라이즈](https://litellm.ai/enterprise)는 AI Gateway와 결합하여 SSO, /SCIM, air-gapped 배포, 24/7 SLA, 그리고 고급 가드레일을 추가합니다.

## 추천 읽기

- [LiteLLM AI Gateway — full feature overview](https://docs.litellm.ai/docs/simple_proxy)
- [LiteLLM Managed Agents Platform — Alpha](https://docs.litellm.ai/blog/agent-platform-alpha)
- [Load balancing and routing across 100+ LLM providers](https://docs.litellm.ai/docs/routing)
