---
slug: april-townhall-updates
title: "4월 타운홀 업데이트: CI/CD v2, 안정성, 제품 로드맵"
date: 2026-04-10T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "CI/CD v2, 제품 안정성 작업, 단기 로드맵을 다룬 LiteLLM 4월 타운홀 요약입니다."
tags: [타운홀, 보안, 신뢰성, 제품]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

4월 타운홀에 참석해 주신 모든 분께 감사드립니다.

이번 세션에서는 CI/CD v2 개선 사항, 제품 안정성 작업, 그리고 신뢰성과 제품 로드맵에서 다음으로 우선순위를 두는 항목을 공유했습니다.

{/* truncate */}

## CI/CD v2 개선 사항

CI/CD v2 작업은 네 가지 목표를 중심으로 진행됩니다.

1. 각 패키지가 접근할 수 있는 범위를 **제한**
2. 민감한 환경 변수 수를 **축소**
3. 손상된 패키지 사용을 **방지**
4. 릴리즈 변조 위험을 **감소**

#### 새 아키텍처: 격리된 환경

하나의 손상된 단계가 전체 파이프라인에 대한 넓은 접근 권한을 상속받는 위험을 줄이기 위해, CI/CD 단계별로 격리된 환경으로 이동하기 시작했습니다.

<Image
  img={require('../../img/april_townhall_isolated_environments.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

#### 현재 배포 상태

이 변경 사항은 현재 릴리즈 워크플로에 배포되어 있습니다. [여기에서 확인하세요](https://github.com/BerriAI/litellm/tags).

#### 릴리즈 독립 검증

CI/CD v2의 핵심은 공개된 검증 절차를 통해 릴리즈 산출물을 독립적으로 검증할 수 있게 하는 것입니다. 동시에 단일 자격 증명 또는 단일 릴리즈 경로에 대한 의존도를 줄입니다.

[**릴리즈 검증 방법 자세히 보기**](https://docs.litellm.ai/docs/proxy/docker_image_security)

<Image
  img={require('../../img/verify_releases.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

## 안정성 개선

### SDLC 개선

이번 달에는 다음 프로세스 안정성 개선에 집중하고 있습니다.
- `main` branch 안정성 개선
- UI QA를 실제 빌드된 Docker image에 맞춰 1:1 환경 일치성 확보
- PyPI와 Docker 간 릴리즈 태그 일관성 확보
- 릴리즈 노트 게시 문제 수정

#### main branch 안정성 개선

staging gate 기반 흐름을 도입합니다.

<Image
  img={require('../../img/stable_main.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

- 내부 staging branch만 `main`에 push할 수 있습니다.
- staging branch로 들어가는 PR은 CircleCI LLM API test를 통과해야 합니다.
- 충돌 처리는 staging에서 수행되며, 불안정한 변경이 `main`에 도달하는 위험을 줄이도록 설계되어 있습니다.

#### Docker 환경에서의 UI QA

앞으로 모든 UI QA는 사용자가 실제로 실행하는 빌드된 Docker image에서 수행됩니다.

기존에는 일부 UI QA 경로가 Docker runtime 조건을 완전히 재현하지 못하는 로컬 환경에서 실행되었습니다.

이로 인해 `v1.82.3`의 MCP registration 문제처럼 특정 릴리즈에서만 발생하는 문제가 생겼습니다.

#### 일관된 릴리즈 태그

현재는 여러 시나리오에 맞춰 릴리즈를 게시합니다.
- Dev: 고객별 시나리오를 위한 PR 빌드
- Nightly: 모든 CI/CD check를 통과한 빌드
- Release Candidate: 모든 CI/CD check와 수동 UI QA를 통과한 빌드
- Stable: 모든 CI/CD check, 수동 UI QA, 7일간의 production test를 통과하는 것을 목표로 하는 빌드

4월 말까지 PyPI와 Docker 전반에서 일관된 명명 규칙을 적용하는 것을 목표로 합니다.

#### 릴리즈 노트

CI/CD v2 변경으로 릴리즈 노트 게시가 임시 수동 경로로 이동했습니다. 더 나은 자동화 워크플로를 검토하는 동안 사용하는 임시 방안입니다. 4월 말까지 더 일관된 프로세스를 목표로 합니다.

### 제품 안정성 개선

#### 안정적인 Prisma migration

현재 몇 가지 migration 실패 유형을 확인했습니다.
- migration이 적용되지 않음
- migration이 적용된 것으로 표시되었지만 불완전함
- non-root image 문제로 migration이 적용되지 않음

이번 달에는 이 작업에 우선순위를 두고 엔지니어링 담당자를 지정했습니다. 4월 말까지 이러한 오류 유형을 해결하는 것이 목표입니다.

#### UI 타입 안정성

또 다른 집중 영역은 UI 안정성 개선입니다. 현재 오류 원인 중 하나는 UI가 backend API 타입에 대한 자체 가정을 유지한다는 점입니다. backend 응답이 UI의 가정과 달라지면 문제가 발생할 수 있습니다.

UI와 backend가 서로 동기화된 상태를 유지하도록 이동하는 것이 목표이며, 이를 위해 OpenAPI 기반 mapping을 검토하고 있습니다.

## 제품 로드맵

### 가정

앞으로 몇 년 동안 다음 흐름을 예상합니다.
- 기업은 직원에게 더 많은 AI 도구를 제공할 것입니다.
- 더 많은 AI agent가 HR, finance, support, operations 전반의 production workflow로 이동할 것입니다.

### 추론
#### 단기

- AI 비용은 증가할 것입니다.
- 가동 시간과 지연 시간은 더 중요해질 것입니다.
- AI 리소스(skills, CLI, 관련 asset)는 거버넌스가 필요해질 것입니다.
- Agent 및 MCP 사용 패턴에는 더 깊은 제어가 필요해질 것입니다.
- 개발자 채택이 넓어질수록 더 단순하고 발견하기 쉬운 도구 수요가 증가할 것입니다.

#### 장기

- 많은 조직이 agent 감사 가능성, 즉 LLM + MCP + sub-agent input/output 전반에서 의사결정이 어떻게 이루어졌는지를 컴플라이언스 요구사항으로 다루게 될 것으로 예상합니다.
- user-agent 상호작용 chain이 깊어질수록 권한 관리는 더 복잡해질 것입니다.

이 글의 로드맵 일정은 목표이며, 검증과 사용자 피드백에 따라 바뀔 수 있습니다.

## 4월 투자 영역

### 신뢰성

- 10k+ RPS 시나리오의 가동 시간 향상
- 장시간 실행되는 Claude Code 요청의 latency overhead 조사

### 기능 신뢰성

- MCP authentication 정교화
- 팀이 LiteLLM을 통해 agent를 사용하는 방식을 더 잘 이해

### 거버넌스

- LiteLLM에서 Skills를 일급 기능으로 출시

## Q&A

질문과 직접적인 피드백을 주신 모든 분께 다시 감사드립니다. 각 작업이 출시될 때마다 구체적인 진행 상황을 계속 공유하겠습니다.

## 채용

여러 포지션에서 적극적으로 채용 중입니다. 관심이 있다면 [여기](https://jobs.ashbyhq.com/litellm)에서 지원해 주세요.
