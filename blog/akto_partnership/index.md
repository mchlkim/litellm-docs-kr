---
slug: akto-partnership
title: "LiteLLM × Akto: 내장 가드레일과 함께 쓰는 모델 기반 탐지"
date: 2026-04-21T10:00:00
authors:
  - krrish
  - ishaan-alt
description: "Akto의 모델 기반 탐지를 LiteLLM 내장 가드레일과 연결해, 패턴 기반 검사로 놓치기 쉬운 PII, prompt injection, 정책 위반을 탐지합니다."
tags: [파트너십, 보안, 가드레일, akto]
hide_table_of_contents: false
---

![LiteLLM x Akto 파트너십](/img/litellm_akto_announcement.png)

[Akto](https://akto.io)는 이제 LiteLLM proxy 안에서 chained guardrail로 네이티브하게 실행됩니다.

{/* truncate */}

LiteLLM은 빠르고 결정적인 검사를 위한 내장 가드레일을 제공합니다. 예를 들어 regex 기반 PII 탐지, secret scanning, 금지어 목록 검사가 여기에 해당합니다. Akto는 그 위에 두 번째 계층을 추가합니다. 결정적 규칙만으로 다루기 어려운 prompt injection, 의미 기반 PII 유출, LLM의 의도 분류가 필요한 사용자 정의 정책 위반을 **모델 기반 탐지**로 탐지합니다.

두 기능은 함께 실행됩니다. LiteLLM 가드레일은 저렴하고 빠른 검사를 처리하고, Akto는 모델 판단이 필요한 시나리오를 처리합니다.

![가드레일 체이닝: Client에서 LiteLLM Proxy를 거쳐 LLMs, MCPs, Agents로 연결되고 LiteLLM 가드레일이 Akto로 체이닝됨](/img/litellm_guardrail_chaining.png)

Akto는 **sync mode** 또는 **async mode**로 실행할 수 있습니다. sync mode는 LLM 호출 전에 위반을 차단하고, async mode는 지연 시간을 추가하지 않고 로그와 알림을 남깁니다. 기존 proxy에 callback으로 설정하면 되며 앱 코드는 바꿀 필요가 없습니다.

**시작하기:** [Akto guardrail 설정 가이드](../../docs/proxy/guardrails/akto)

**전체 발표문**은 [Akto 블로그 →](https://www.akto.io/blog/akto-partners-litellm-ai-gateway-security-agents)에서 확인할 수 있습니다.
