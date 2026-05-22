---
slug: agent-platform-alpha
title: "LiteLLM 관리형 에이전트 플랫폼 - Alpha 공개 프리뷰 시작"
date: 2026-05-08T10:00:00
authors:
  - krrish
  - ishaan-alt
description: "LiteLLM Gateway에서 격리된 에이전트 세션을 실행하는 관리형 에이전트 제어 plane이 공개 프리뷰로 제공됩니다."
tags: [제품, 에이전트]
hide_table_of_contents: false
---

**LiteLLM 관리형 에이전트 플랫폼**을 소개합니다. 운영 환경에서 여러 에이전트를 실행하기 위한 단순한 self-hosted 인프라 플랫폼입니다.

{/* truncate */}

![LiteLLM 관리형 에이전트 플랫폼 Alpha](/img/litellm_agent_platform_alpha.png)

이 플랫폼을 사용하면 다음을 관리할 수 있습니다.
- 팀과 context별로 분리된 sandbox
- pod 재시작 및 업그레이드 이후에도 이어지는 세션 관리

완전히 self-hosted 방식으로 운영할 수 있는 관리형 에이전트 솔루션이 필요했기 때문에 이 플랫폼을 만들었습니다. 이제 오픈소스로 공개되어 누구나 사용할 수 있습니다.

**Repo:** [github.com/BerriAI/litellm-agent-platform](https://github.com/BerriAI/litellm-agent-platform)

질문이나 피드백이 있다면 issue를 남겨 주세요.
