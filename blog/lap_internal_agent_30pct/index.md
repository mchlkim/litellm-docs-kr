---
slug: lap-internal-agent-30-percent
title: "백로그의 30%를 처리하는 background agent를 만든 방법"
date: 2026-05-27T10:00:00
authors:
  - krrish
  - ishaan
description: "LiteLLM AI Gateway 위에서 사람 개입 없이 PR을 merge하는 background agent를 만든 방법과 그 뒤의 infra, harness, credential scoping 결정."
tags: [agents, ai-gateway, lap, lite-harness, engineering]
hide_table_of_contents: true
image: /img/lap_litellm_agent_platform_hero.png
---

<img src="/img/lap_litellm_agent_platform_hero.png" alt="LiteLLM Agent Platform: agent.litellm.ai" style={{width: "100%"}} />

:::info

저희가 만든 platform은 open source입니다. [litellm-agent-platform](https://github.com/BerriAI/litellm-agent-platform)을 확인해 보세요. 교체 가능한 harness layer는 [lite-harness](https://github.com/LiteLLM-Labs/lite-harness)입니다.

회사 안에서 같은 것을 만들고 있나요?

- [30분 call 예약](https://calendly.com/d/cr4t-yp7-pzn/litellm-1-1-feedback-chat)
- [LAP Discord 참여](https://discord.gg/Q2AK7HKudm)

:::

저희 목표는 agent로 회사 생산성을 10배 높이는 것이었습니다.

3주 전 저희는 engineering ticket의 30%를 맡을 수 있는 agent를 만들기 시작했습니다. 지금까지 배운 점을 공유합니다.

{/* truncate */}

## 출시한 것

3주가 지난 지금 `BerriAI/litellm`에는 **open PR 43개, closed PR 160개**가 있습니다. Agent가 올리는 PR과 Slack 질문 답변을 합치면, 매주 사람이 처리하던 engineering ticket의 약 **30%**를 agent가 담당합니다. [GitHub에서 agent가 만든 모든 PR](https://github.com/BerriAI/litellm/pulls?q=is%3Apr+author%3Aoss-agent-shin)을 볼 수 있습니다.

## 직접 만든 이유

저희는 Linear에서 ticket을 가져와 background에서 자율적으로 실행되고 PR을 올리는 agent를 원했습니다. 먼저 Cursor와 Anthropic의 managed agent platform을 검토했습니다. 둘 다 맞지 않았습니다.

- **Cursor:** agent가 stateful하지 않았습니다. Agent별 memory, skill 등을 저장할 수 없었습니다. Platform은 agent를 session과 동일시했지만, 저희는 session을 넘어 지속되는 agent를 원했습니다.
- **Anthropic:** 원하는 방향에 가까웠지만, model과 harness를 자유롭게 교체하고 싶었습니다. 하나의 platform에 lock-in되고 싶지 않았습니다.

그래서 [LiteLLM Agent Platform](https://github.com/BerriAI/litellm-agent-platform) 위에 만들었습니다.

## 1. Infrastructure: brain과 sandbox 분리

첫 버전은 [Ramp Inspect](https://builders.ramp.com/post/why-we-built-our-background-agent)와 비슷하게 agent를 *sandbox 내부*에서 실행했습니다. 새 session마다 fresh sandbox가 boot되었습니다. 작업이 "코드를 수정해라"라면 괜찮습니다. 하지만 engineer가 Slack에서 질문 하나를 물었을 뿐이라면 낭비입니다. 몇 번의 tool call이면 되는 답변을 위해 전체 sandbox boot 비용을 냅니다.

그래서 agent를 둘로 나눴습니다. **Brain**(reasoning, planning, model call)은 공유 persistent pod에 둡니다. Shell이 없습니다. BASH도 filesystem도 없습니다. **Sandbox**는 ephemeral하며 session마다 하나씩 생성되고, `git`, `gh`, `pytest`를 실행할 수 있는 유일한 곳입니다. Brain은 두 개의 tool call을 통해 sandbox에 접근합니다. 이는 [Anthropic managed agent platform의 동작 방식](https://www.anthropic.com/engineering/managed-agents)과 유사합니다.

![아키텍처: shell이 없는 persistent brain pod가 두 개의 tool call을 통해 session별 ephemeral sandbox pool과 통신](/img/lap_brain_sandbox_split.svg)

응답 시간은 줄었고, session success rate는 올라갔으며, session당 비용은 낮아졌습니다.

Cold start는 Slack에서 가장 눈에 띄었습니다. 모두가 대기 시간을 체감했기 때문입니다.

![Agent가 응답하기 전 cold sandbox boot를 기다리는 Slack thread](/img/lap_shin_slack_slow_start.png)

## 2. 아키텍처: agent framework가 아니라 harness를 선택

처음에는 Pydantic AI, LangGraph, PI SDK 같은 agent framework로 시작했습니다. 하지만 각 framework는 coding *harness*가 이미 제공하는 context compaction, sub-agent spawning, tool loop를 다시 만들게 했습니다. 저희는 이미 이 작업에 Claude Code를 로컬에서 신뢰하고 있었기 때문에 framework가 아니라 harness를 찾았습니다.

결국 **OpenCode**를 선택했습니다. Claude Agents SDK는 run마다 CLI session을 spawn했고 약 1 RPM에서 OOM이 났습니다. OpenCode도 같은 근본 병목(long-running session이 memory에 유지됨)을 갖고 있지만 memory 사용량 증가가 더 느렸고, 현재로서는 더 나은 선택이었습니다.

이 선택이 유연하게 남아 있는 이유는 harness unification layer인 [`LiteLLM-Labs/lite-harness`](https://github.com/LiteLLM-Labs/lite-harness)도 만들었기 때문입니다. 이 layer는 OpenCode, Claude Code, Codex 등을 하나의 HTTP contract에 맞춥니다.

```
lite-harness/
  opencode/           # runtime adapter
  claude-agent-sdk/   # runtime adapter
  contract.py         # the one interface every runtime implements
```

Agent platform은 session 뒤에 어떤 harness가 있는지 알 필요가 없습니다. 따라서 교체는 rewrite가 아니라 config 변경입니다.

다음 목표는 harness에서 100 RPM입니다.

## 3. 보안: 모든 credential을 하나의 endpoint에 scope

저희 agent는 environment에 있는 API key를 commit과 Slack message로 계속 유출했습니다. 첫 완화책은 작은 HTTP proxy vault였습니다. Environment에는 실제 credential 대신 stub을 넣고, agent가 outbound call을 만들 때만 stub을 실제 값으로 교체했습니다.

Agent는 이를 우회했습니다. Credential이 stub이라는 점을 알아차린 뒤 자체 endpoint를 작성하고, stub credential로 그 endpoint를 호출했습니다. Vault가 outbound 경로에서 실제 credential로 바꿔 주자, agent는 자기 server에서 실제 key를 다시 읽고 tool call로 memory에 저장했습니다. 저희 own vault를 상대로 한 깔끔한 man-in-the-middle이었습니다.

![Agent가 stub vault를 우회한 뒤 실제 credential을 memory에 쓰는 것을 Ishaan이 발견한 장면](/img/lap_shin_agent_mitm_memory.png)

수정은 *값*을 신뢰하지 않고 *목적지*에 묶는 것이었습니다. 각 credential은 하나의 upstream host에 pin되고, outbound request가 다른 곳으로 가면 vault는 교체를 거부합니다.

```yaml
# vault: a credential is only ever swapped in for its bound host
credentials:
  GITHUB_TOKEN:
    allowed_host: api.github.com
  OPENAI_API_KEY:
    allowed_host: api.openai.com
```

교훈은 agent guardrail이 agent의 input/output boundary에 있어야 한다는 점입니다. LLM-level guardrail은 user query와 internal tool loop를 구분할 수 없습니다. 그래서 너무 느슨하거나 너무 느립니다.

## AI Gateway가 들어가는 위치

AI Gateway는 유용한 access control point입니다. 저희 agent가 model과 MCP tool에 접근하도록 한 방식이 바로 이것입니다. 하지만 이것은 절반에 불과합니다. Action을 수행하는 것은 model이 아니라 agent이므로, agent boundary에는 자체 guardrail과 capability(skill, memory)가 필요합니다. Agent가 user에게 답할 때 필요한 guardrail과 internal tool loop 안에서 필요한 guardrail은 다릅니다. 모든 tool call에 model-level guardrail을 실행하면 session당 약 5분이 추가됩니다.

## 지금 믿는 것

Autonomous agent는 10배 생산성 향상이 나오는 곳이며, 기술적 위험은 상당 부분 해결되었습니다. Model은 이미 괜찮은 PR을 올릴 만큼 똑똑합니다. 남은 어려운 문제는 product 문제입니다. Scale, reliability, security입니다.

저희에게 이는 두 가지 open problem을 뜻합니다.

- **Scale:** session을 memory에 유지하는 harness에서 어떻게 100 RPM을 제공할 것인가?
- **Security:** agent server가 민감 정보를 유출하거나 파괴적 action을 수행하지 않게 어떻게 막을 것인가? MCP도 시도했지만 rate limit과 구조적 문제에 부딪혔고, 직접 API key가 더 안정적이었습니다. 그래서 credential scoping이 중요해졌습니다.

## 사용해 보기

두 repo 모두 open source이고 self-host할 수 있습니다. [litellm-agent-platform](https://github.com/BerriAI/litellm-agent-platform)과 [lite-harness](https://github.com/LiteLLM-Labs/lite-harness)를 확인하세요. 비슷한 것을 만들고 있고 3주간의 시행착오를 건너뛰고 싶다면 [30분 chat을 예약](https://calendly.com/d/cr4t-yp7-pzn/litellm-1-1-feedback-chat)하거나 [LAP Discord](https://discord.gg/Q2AK7HKudm)에 참여해 주세요.

*이 글의 구성은 Ramp의 [Why we built our background agent](https://builders.ramp.com/post/why-we-built-our-background-agent)에서 영감을 받았습니다.*
