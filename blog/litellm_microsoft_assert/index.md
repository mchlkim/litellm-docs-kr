---
slug: litellm-microsoft-assert
title: "Announcing LiteLLM x Microsoft ASSERT"
date: 2026-06-03T10:00:00
authors:
  - mubashir
  - krrish
description: "LiteLLM now integrates with Microsoft ASSERT for policy-driven agent evaluation — catch safety and quality defects before they reach production."
hide_table_of_contents: false
---

오늘 우리는 **LiteLLM x Microsoft ASSERT**을 공식적으로 출시하게 되어 매우 기쁩니다 — LiteLLM AI 게이트웨이를 통해 실행되는 모든 모델에 정책 기반 에이전트 평가를 제공합니다.

{/* truncate */}

## ASSERT이란 무엇인가?

ASSERT는 마이크로소프트가 제공하는 정책 기반 에이전트 평가를 위한 오픈소스 프레임워크로, 검증된 마이크로소프트 연구소의 접근법을 기반으로 개발되었습니다. ASSERT는 조직의 정책 및 요구사항을 입력으로 받아, 체계적으로 타겟팅된 평가 시나리오를 생성하고, 생산에 도달하기 전에 안전성 및 품질 결함을 표시합니다.

## 왜 이 것이 중요한가

팀들이 에이전트를 프로덕션 환경에 배포하면서 "디모에서 작동한다"는 것과 "저희 정책에 따라 동작한다"는 사이의 격차가 실제 위험을 담고 있습니다. ASSERT는 이 격차를 메우며, 작성한 정책을 구체적이고 테스트 가능한 평가 시나리오로 변환합니다. 이제 이러한 평가는 100+ LLM 제공업체를 포함해 LiteLLM이 지원하는 모든 제공업체에서 단일 통합 인터페이스를 통해 실행됩니다.

## LiteLLM과의 동작 방식

- **정책을 가져오세요** — ASSERT는 조직의 정책 및 요구사항을 흡수합니다.
- **시나리오 생성** — ASSERT는 체계적으로 타겟팅된 평가 시나리오를 생성합니다.
- **LiteLLM을 통해 실행** — LiteLLM 게이트웨이 뒤에 있는 모든 모델을 일관된 인증, 로깅 및 비용 추적을 통해 평가합니다.
- **결함을 조기에 발견** — 생산에 도달하기 전에 안전 및 품질 문제를 포착합니다.

## 시작하기

ASSERT는 오픈소스입니다. 자신의 LiteLLM 게이트웨이 엔드포인트를 지정하고, 오늘부터 자신의 정책에 따라 에이전트를 평가해 보세요.

- [LiteLLM 게이트웨이 설정](/docs/proxy/quick_start) — 분단 내에 게이트웨이 엔드포인트를 실행합니다.
- [Microsoft ASSERT GitHub](https://github.com/microsoft/assert) — ASSERT를 설치하고 게이트웨이에 대해 실행합니다.
