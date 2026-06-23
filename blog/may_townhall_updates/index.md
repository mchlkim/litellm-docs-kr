---
slug: may-townhall-updates
title: "5월 타운홀 업데이트: 보안 강화, 릴리스 버전 체계, Agent Platform"
date: 2026-05-26T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "89건의 보안 수정, 새 릴리스 버전 체계, MCP Toolsets, 성능 개선, LiteLLM Agent Platform을 다룬 5월 LiteLLM 타운홀 요약입니다."
tags: [townhall, security, performance, product, agents]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

5월 타운홀에 참석해 주신 모든 분께 감사드립니다.

이번 타운홀에서는 보안 강화, 릴리스 버전 체계 변경, 신규 제품 출시(MCP Toolsets와 대리 OAuth), 성능 개선, 그리고 지금까지 가장 큰 베팅인 LiteLLM Agent Platform을 다뤘습니다.

{/* truncate */}

## 보안 업데이트

### v1.84.1에 보안 강화 항목이 포함되었습니다

지난 4주 동안의 모든 보안 수정은 v1.84.0 위의 패치인 [v1.84.1](/release_notes/v1.84.1/v1-84-1)에 포함되어 있습니다. 가능한 시점에 업그레이드하세요.

```
pip install --upgrade litellm
```

- v1.83.x 구성과 하위 호환됩니다.
- 새 릴리스 버전 체계를 적용합니다(아래 참고).

### 버그 바운티가 시작되었습니다

이제 보안 제보에 대해 보상을 지급합니다.

- **범위** - LiteLLM 게이트웨이와 SDK.
- **제출** - GitHub의 [비공개 취약점 보고](https://github.com/BerriAI/litellm/security)를 통해 제출합니다.
- **분류** - 메인테이너와 Veria Labs 보안 팀이 분류합니다.

### 모든 PR에 자동 보안 리뷰 적용

모든 PR은 이제 Veria AI + zizmor + semgrep을 통한 자동 보안 검사를 받습니다. 필수 체크인 **Veria scan**을 확인하세요. 오탐은 표시만 되며 차단하지 않습니다.

### 지난 4주: 숫자로 보는 결과

| 지표 | 수 |
|--------|-------|
| 패치된 취약점 | **89** |
| Veria scanner가 보고한 건 | 78 |
| 수정된 GHSA | 58 |
| 종료된 GHSA | 96 |

모든 수정은 [v1.84.1](/release_notes/v1.84.1/v1-84-1)에 포함되어 배포됩니다.

### 보안의 다음 단계

- GHSA 분류와 검증 프로세스를 개선합니다.
- CI 파이프라인을 추가로 개선합니다.
- 자매 프로젝트(project-releaser)에 zizmor를 추가합니다.
- 이전 릴리스에 대한 지원 기간을 정의합니다.

## 안정성 업데이트

### 릴리스 버전 체계: 문제

`-nightly`, `-dev`, `-stable`, `-stable-patch`처럼 버전 접미사가 너무 많았습니다. 매주 stable 버전이 올라가면서 핫픽스를 넣을 여지가 부족했고, 사용자가 검색에서 `-stable`로 필터링해도 여러 릴리스 사이를 계속 살펴봐야 했습니다.

### v1.84.0부터 적용되는 새 버전 체계

릴리스 버전은 이제 PyPI와 Docker에서 일관되게 관리됩니다.

- **`-stable` 제거** - 안정 릴리스는 PEP-440 / SemVer 2.0을 따릅니다. 이제 `v1.84.0`처럼 표시됩니다.
- **매주 MINOR 증가** - 예정된 안정 릴리스마다 PATCH가 아니라 MINOR 버전을 올립니다.
- **핫픽스는 PATCH** - `v1.84.0`에 수정이 필요하면 `v1.84.1`이 됩니다.

### 안정성의 다음 단계

- EKS 다중 Pod 내부 배포.
- 배포 회귀와 Claude Code 변경을 포착.
- 코드 커버리지 확대 - 5개 주요 회귀 파일에서 70% 목표.
- 목표: 안정 릴리스마다 회귀를 최소화.

## 제품 업데이트

### 출시한 항목

**Routing & Memory**
- Adaptive Routing
- 메모리 관리(beta)
- Prompt Compression

**MCP**
- MCP Toolsets
- 대리 MCP OAuth

**Quality & Safety**
- LLM-as-a-judge 가드레일
- Skills Marketplace

### MCP Toolsets

MCP Toolsets를 사용하면 여러 MCP 서버의 도구를 하나의 평평한 목록으로 합칠 수 있습니다. 에이전트는 여러 서버를 따로 다루는 대신 하나의 도구 목록만 보게 됩니다.

도구 이름은 스코프가 지정되므로, 서로 다른 서버 사이의 이름 충돌도 안전하게 처리됩니다.

**예제:** "deploy-flow" toolset은 GitHub MCP의 `create_issue`, Slack MCP의 `post_message`, Jira MCP의 `create_ticket`을 합쳐 에이전트에게 하나의 도구 목록으로 노출할 수 있습니다.

<Image
  img={require('../../img/may_townhall_mcp_toolsets.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

### MCP 대리 OAuth

OAuth 토큰은 프록시에 보관되며 클라이언트로 반환되지 않습니다.

- 클라이언트는 토큰 없이 요청을 보냅니다.
- LiteLLM은 다운스트림 MCP 서버를 호출할 때 토큰을 추가합니다.
- 갱신은 투명하게 처리됩니다. 클라이언트는 401을 보지 않습니다.

<Image
  img={require('../../img/may_townhall_mcp_obo_oauth.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

### 제품의 다음 단계

- MCP - 정적 사용자 자격 증명을 저장.
- Claude Code - 헤더 호환성 차트를 자동 업데이트.
- 모델과 제공자 전반의 reasoning level 지원.
- Claude Code에서 Bedrock Converse 전체 지원.

## 성능 개선

### RPS + TPM 20% 개선

스트리밍 `/chat/completions`는 이제 초당 요청 수와 분당 토큰 수를 20% 더 많이 처리합니다.

### 적용된 최적화

<Image
  img={require('../../img/may_townhall_perf_numbers.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

### 성능의 다음 단계

- Rust 마이그레이션 진행 중 - 10k 동시성에서 안정적인 1K+ RPS.
- 높은 부하에서 게이트웨이 오버헤드 감소에 집중.
- 추적 지표: TTFT, TPM(스트리밍), RPS, E2E 대비 오버헤드 비율(비스트리밍).

## 제품 로드맵: LiteLLM Agent Platform

### 우리의 베팅

앞으로 3년 안에 AI 워크로드의 80%가 에이전트가 될 것이라고 봅니다.

우리가 보고 있는 신호:
- OpenClaw 사용량 급증
- 엔터프라이즈 요청이 채팅에서 에이전트로 이동
- Claude Code 도입 증가

### LiteLLM Agent Platform - 실제로 거버넌스할 수 있는 에이전트 실행

네 가지 축. 하나의 제어 평면.

<Image
  img={require('../../img/may_townhall_agent_platform.png')}
  style={{width: '900px', height: 'auto', display: 'block'}}
/>

- Agent Templates - 일반적인 작업을 위한 사전 구성 템플릿.
- Skills - 여러 에이전트에서 업로드하고 재사용할 수 있는 스킬.
- Projects - 저장소와 환경 변수를 재사용 가능한 단위로 패키징.

## 다음 단계

질문과 피드백을 보내 주신 모든 분께 다시 한번 감사드립니다. 각 작업이 출시될 때마다 구체적인 진행 상황을 계속 공유하겠습니다.

## 채용

여러 직무에서 적극적으로 채용 중입니다. 관심이 있다면 [여기](https://jobs.ashbyhq.com/litellm)에서 지원하세요.
