---
slug: agents-are-the-new-llms
title: "통합 Agent Control Plane"
date: 2026-06-10T09:00:00
authors:
- krrish
description: "AI Gateway는 model call routing에서 agent work routing으로 stack 위로 이동하고 있습니다."
tags: [ideas, harnesses, ai-gateway, agents]
hide_table_of_contents: true
---

import { StackComparison, ConvergenceHero } from './diagrams';

<ConvergenceHero />

*마지막 업데이트: 2026년 6월*

Agent infrastructure는 이미 model, harness, runtime이라는 세 계층으로 나뉘고 있습니다. 저희는 네 번째 계층인 unified agent control plane이 등장할 것이라고 봅니다. 이 계층은 서로 다른 agent runtime에 있는 agent를 한 곳에서 호출할 수 있게 합니다.

이유는 단순합니다. 기업은 모든 agent를 하나의 runtime에서 실행하지 않을 것입니다. Coding agent는 Bedrock AgentCore나 Claude Managed Agents에서 실행될 수 있습니다. Data agent는 Elastic, Databricks, Snowflake 안에서 실행될 수 있습니다. 내부 workflow agent는 custom infrastructure에서 실행될 수 있습니다. 기업은 이 agent들이 어디에서 만들어졌고 어디에서 실행되든, 모두 사용할 수 있는 한 장소를 원하기 때문에 control plane이 필요해집니다.

하지만 registry만으로는 충분하지 않습니다. Agent 목록은 누구나 만들 수 있습니다.

더 어려운 문제는 invocation입니다. Agent runtime은 agent, session, event, tool 같은 비슷한 primitive를 노출하지만, 같은 API로 노출하지는 않습니다. 따라서 agent를 단순히 나열하는 것이 아니라 실제로 사용할 수 있는 한 장소를 만들려면, control plane은 agent runtime, schedule, memory, session을 관리해야 합니다.

이는 LiteLLM이 model에서 봤던 것과 같은 패턴입니다. 기업은 model catalog만 필요했던 것이 아닙니다. Model을 호출할 하나의 interface가 필요했습니다. 달라진 점은 primitive가 model call이 아니라 agent session이 되었다는 것뿐입니다.

## 미래의 Stack

<StackComparison />

중요한 변화는 gateway가 더 이상 model call만 routing하지 않는다는 점입니다. 이제 agent work를 routing합니다.

LLM에서는 stack이 다음과 같이 정리되었습니다.

* **모델:** GPT, Claude, Gemini, Llama
* **Inference providers:** OpenAI, Anthropic, Bedrock, Vertex, Azure, vLLM
* **Gateway:** routing, fallback, logging, spend tracking, auth, billing
* **Applications:** copilot, workflow, internal tool, product

Agent에서는 stack이 다음과 같이 될 것이라고 봅니다.

* **모델:** Claude, GPT, Gemini, open-source model
* **Harnesses:** Claude Code, Codex, OpenCode, Hermes, DeepAgents
* **Agent runtimes:** Claude Managed Agents, Bedrock AgentCore, Gemini Enterprise Agent Platform, self-hosted runtime
* **Agent control plane:** team이 agent runtime, schedule, memory, session을 관리하는 multi-runtime platform
* **Applications:** coding agent, support agent, data agent, security agent

## 기업에 왜 필요한가

LiteLLM 안에서도 이미 team이 여러 agent runtime을 넘나들며 일하고 있습니다. 어떤 사람은 Claude Managed Agents 위에서 만들고, 어떤 사람은 N8N이나 Cursor 위에서 만듭니다.

이 fragmentation 때문에 각 platform에서 만든 agent를 공유하기 어렵고, 지금까지 만들어진 작업의 혜택을 모두가 받기 어렵습니다.

Agent가 한 곳에 있으면 누구나 이 agent를 활용할 수 있습니다. 예를 들어 PR Babysitter Agent가 Claude Managed Agents로 작성되어 모두가 직접 접근할 수 없는 환경이어도 마찬가지입니다.

이것이 control plane 문제입니다.

저희가 AI Gateway가 stack 위로 올라간다고 보는 이유도 여기에 있습니다. Gateway는 model call 관리에서 시작했습니다. 하지만 agent가 AI의 지배적인 use case가 되면, gateway는 agent session도 관리해야 합니다.

## 우리가 만들고 있는 것

[LiteLLM Agent Platform](https://github.com/LiteLLM-Labs/litellm-agent-platform)은 이 방향에 대한 저희 실험입니다.

LiteLLM Agent Platform은 Rust 기반 AI Gateway이자 Agent Control Plane입니다. 목표는 team이 여러 runtime에 걸쳐 agent를 register, invoke, observe, govern할 수 있게 하는 것입니다.

저희는 coding agent부터 시작하고 있습니다. 필요성이 명확하기 때문입니다. Coding agent는 오래 실행되고, stateful하며, tool을 많이 사용하고, 실제 infrastructure가 필요할 만큼 비쌉니다.

초기 사용자들도 이 패턴에 공감하고 있습니다. 어떤 회사는 LAP가 서로 다른 team이 서로 다른 runtime 위에서 만든 agent의 central control plane으로 동작하길 원합니다. 예를 들어 한 team이 Kibana log 분석을 위해 Elastic runtime 위에서 agent를 만들었더라도, 회사는 그 agent를 공통 gateway를 통해 내부에 노출하고 싶어 할 수 있습니다.

저희는 앞으로 architecture가 이렇게 변할 것이라고 봅니다. Model은 교체 가능해지고, harness는 전문화되고, runtime은 managed가 되며, gateway는 agent work의 control plane이 됩니다.

여러분이 보고 있는 흐름도 이와 같다면 LiteLLM Agent Platform에 대한 피드백을 받고 싶습니다.

https://github.com/LiteLLM-Labs/litellm-agent-platform

## 자주 묻는 질문

### LiteLLM이 두 번째 제품을 만드는 건가요?

아닙니다. LAP는 실험적인 project입니다. 목표는 빠르게 학습하고, 적절한 부분을 시간이 지나며 LiteLLM에 가져오는 것입니다.

### LAP는 production-ready인가요?

아닙니다. LAP는 pre-v0입니다. 초기 사용자와 contributor와 함께 작업하면서 API가 바뀔 수 있습니다.

기여하고 싶다면 issue를 열거나 Discord에 참여해 주세요.

https://discord.gg/Nkxw3rm3EE
