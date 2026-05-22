---
slug: security-townhall-updates
title: "보안 타운홀 업데이트"
date: 2026-03-27T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "LiteLLM 릴리스 및 보안 프로세스에서 어떤 일이 있었고, 무엇을 조치했으며, 앞으로 무엇이 바뀌는지 정리합니다."
tags: [보안, 사고-보고]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

타운홀에 참석해 주신 모든 분께 감사드립니다.

그 자리에서 현재까지 확인한 내용, 지금까지 조치한 내용, 그리고 앞으로 LiteLLM 릴리스 및 보안 프로세스를 어떻게 개선할지 설명드리고자 했습니다. 이 글은 해당 업데이트의 서면 버전입니다. [슬라이드는 여기에서 확인할 수 있습니다](https://drive.google.com/file/d/17hsSG7nk-OYL7VRCTbTa7McrWREtS9OO/view?usp=sharing).

{/* truncate */}

## 무슨 일이 있었나요?

2026년 3월 24일 10:39 UTC에 LiteLLM v1.82.7이 PyPI에 push되었습니다. 곧이어 v1.82.8도 publish되었습니다. 해당 package들은 PyPI가 격리하기 전까지 약 40분 동안 live 상태였습니다. 16:00 UTC까지 LiteLLM 팀은 PyPI와 협력해 영향을 받은 package를 삭제했습니다.

현재 이해로는, 이는 publish된 두 version에 영향을 준 공급망 사고였습니다.

## 어떻게 발생했나요?

현재 파악으로는 CI/CD pipeline의 [compromised Trivy security scanner](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/) dependency에서 문제가 시작되었습니다.

<Image 
  img={require('../../img/shared_ci_cd_environment.png')}
  style={{width: '500px', height: '400px', display: 'block'}}
/>

주요 기여 요인은 세 가지였습니다.

### 1. 공유 CI/CD 환경

당시 모든 작업은 CircleCI에서 실행되었고, 모든 step이 공통 환경을 공유했습니다. 이 구조는 영향 범위를 키웠습니다. 한 component가 compromise되면 pipeline의 다른 부분을 위한 credential이나 context에 접근할 가능성이 있었습니다.

### 2. 환경 변수에 저장된 static credential

PyPI, GHCR, Docker publishing credential을 포함한 release credential이 environment의 static secret으로 존재했습니다. 즉 compromised step이 장기 release credential에 접근할 수 있었습니다.

### 3. 고정되지 않은 Trivy dependency

보안 scan component에 고정되지 않은 Trivy dependency가 있었습니다. 현재 파악으로는 compromised Trivy package가 scan 중 실행되었고 environment variable에 접근할 수 있었으며, 공격자가 해당 credential을 얻을 수 있게 했습니다.

**요약:** CI 안의 compromised package가 접근해서는 안 되는 secret에 접근했고, 그 secret이 release path에서 사용되었습니다.

## 이미 조치한 내용


최근 3일 동안 다음 조치를 수행했습니다.

### 1. 영향 범위 최소화

#### 추가 key abuse 방지

PyPI, GitHub, Docker 및 관련 credential을 포함해 영향을 받았거나 인접한 모든 secret key를 삭제하거나 rotate했습니다. 충분한 예방 조치로 LiteLLM maintainer account도 rotate했습니다.

#### Branch 공격 방지

약 6,000개의 open branch를 제거하고 `main`에 merge된 branch에 대한 자동 삭제 policy를 추가했습니다. 이를 통해 branch 기반 abuse의 공격 표면을 줄였습니다.

#### CI/CD dependency 고정

모든 Github Actions를 pin했으며, CircleCI dependency도 pinning하는 작업을 진행 중입니다.

#### 릴리스 일시 중단

codebase security를 확인하고 더 강한 release control을 적용할 때까지 새 release를 일시 중단했습니다.

### 2. LiteLLM 보안 강화

#### 포렌식 분석

공격의 출처를 확인하고 codebase security를 검증하기 위해 Google의 Mandiant cybersecurity team과 협력하고 있습니다. 또한 `main`에 악성 code가 push되지 않았음을 확인했습니다.

#### 애플리케이션 보안 확인

동시에 [Veria Labs](https://verialabs.com/)의 whitehat hacker와 협력해 application security를 검증하고 CI/CD process 개선 사항을 review하고 있습니다.

또한 최근 20개 LiteLLM release에 compromise indicator가 없고, 현재 조사 기준으로 LiteLLM Proxy에 대해 unauthenticated attack이 가능하지 않음을 확인했습니다. [릴리스 검증은 Security 블로그를 확인하세요.](https://docs.litellm.ai/blog/security-update-march-2026#verified-safe-versions)

#### 보안 working group 생성

LiteLLM 내부에 다음에 집중하는 새 security working group을 만들었습니다.

- threat model 구축
- build process 및 dependency audit

Security working group 참여에 관심이 있다면 [여기](https://github.com/BerriAI/litellm-security-wg)에 issue를 남겨 주세요.

### 3. CI/CD 개선

release가 build되고 publish되는 방식을 구조적으로 바꾸기 시작했습니다. 이는 다음 섹션에서 설명하는 격리 환경, 임시 credential, release auditing 목표와 맞닿아 있습니다.

## 로드맵

새 CI/CD pipeline에는 네 가지 원칙을 적용할 계획입니다.

1. 각 package가 접근할 수 있는 범위를 **제한**
2. 민감한 environment variable 수를 **감소**
3. compromised package를 **회피**
4. release tampering을 **방지**


### 격리 환경

<Image 
  img={require('../../img/isolated_ci_cd_environments.png')}
  style={{width: '400px', height: 'auto'}}
/>

CI/CD를 네 가지 의미 단위로 나누고 있습니다.

1. unit test
2. integration test
3. security scan
4. release publishing

그리고 각각을 격리 환경에서 실행할 예정입니다.

이를 통해 단일 compromised component가 일으킬 수 있는 피해를 제한합니다.

### 임시 credential

PyPI(Trusted Publisher)와 GHCR(Token-based authentication) release에 임시 credential을 사용할 계획입니다. 이를 통해 credential 유출 또는 compromise 위험을 줄입니다.

이미 다음 작업을 시작했습니다.

- GitHub Actions의 PyPI Trusted Publisher [PR](https://github.com/BerriAI/litellm/pull/24654)
- GitHub Actions의 GHCR token-based authentication [PR](https://github.com/BerriAI/litellm/pull/24683)

### 릴리스 감사

목표는 사용자가 release가 LiteLLM에서 나온 것인지 독립적으로 검증할 수 있게 하고, publish 이후 release가 조용히 수정되는 것을 방지하는 것입니다.

이는 다음 상황에서도 release가 안전함을 보장하는 데 도움이 됩니다.
- 도난당한 PyPI/GHCR credential로 악성 release가 publish되는 경우
- tampered registry artifact가 publish되는 경우
- release publish 이후 tag mutation이 발생하는 경우

[Cosign](https://github.com/sigstore/cosign)이 이 목적에 잘 맞는다고 판단했고, [PR #24683](https://github.com/BerriAI/litellm/pull/24683)에서 적용했습니다.

#### Cosign으로 Docker image 검증하기

`v1.83.0-nightly`부터 GHCR에 publish되는 모든 LiteLLM Docker image는 [cosign](https://docs.sigstore.dev/cosign/overview/)으로 서명됩니다. 모든 release는 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0)에서 도입된 동일한 key로 서명됩니다.

**고정된 commit hash로 검증(권장):**

commit hash는 암호학적으로 immutable하므로, 원래 signing key를 사용하고 있는지 확인하는 가장 강한 방법입니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

**release tag로 검증(편의용):**

이 repository의 tag는 보호되며 동일한 key로 resolve됩니다. 이 option은 읽기 쉽지만 tag protection rule에 의존합니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/<release-tag>/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

`<release-tag>`를 배포하려는 version으로 바꾸세요(예: `v1.83.0-stable`).

예상 출력:

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

### compromised package 회피

- CI/CD에서 사용하는 package와 action을 pinned, verified SHA로 전환하고 가능한 한 `latest`를 피합니다.
- package를 새 version으로 upgrade하기 전에 cooldown period를 둡니다. 이를 통해 새 version을 조사하고 검증할 시간을 더 확보합니다.

Unpinned dependency와 credential leakage 같은 문제를 잡기 위해 zizmor를 추가했습니다. [commit](https://github.com/BerriAI/litellm/commit/a671275f5c5b0e1fb1adacdf3b6ef779aaa5d56c).


## 자주 묻는 질문

**Q: 이번 사고 중 corporate environment로 lateral movement가 있었나요?**

A: 아니요. 외부 security expert와 함께 진행한 현재까지의 조사에서는 내부 corporate system으로 lateral movement가 있었다는 증거를 찾지 못했습니다. 사고는 CI/CD pipeline과 특정 version(v1.82.7 및 v1.82.8)의 release path에 격리되어 있었습니다. 선제 조치로 PyPI, GitHub, Docker credential을 포함해 영향을 받았거나 인접할 수 있는 모든 secret을 rotate했고, 지속적인 격리를 보장하기 위해 maintainer account security를 업데이트했습니다.

**Q: 새 보안 조치 때문에 향후 product release가 지연될 것으로 예상하나요?**

A: 우리는 security와 speed의 균형을 중요하게 생각합니다. 더 강한 control을 적용하기 위해 release를 일시 중단했지만, 새 security protocol을 자동화하기 위해 빠르게 움직이고 있습니다. 현재 격리된 CI/CD 환경, Trusted Publisher를 통한 임시 credential, Cosign 기반 release auditing을 구현 중입니다. 이러한 개선은 automated pipeline에 통합되도록 설계되어, 모든 package가 검증되고 안전한 상태를 보장하면서도 빠른 release cadence를 유지할 수 있게 합니다.

**Q: 이전 package도 영향받았나요?**

현재 조사 결과 최근 20개 LiteLLM version에서는 compromise indicator가 발견되지 않았습니다. 이는 우리 팀이 수동으로 검증했고 Veria Labs가 독립적으로 review했습니다.

사용자가 사용할 수 있도록 검증된 version도 publish했습니다. [릴리스 검증은 Security 블로그를 확인하세요.](https://docs.litellm.ai/blog/security-update-march-2026#verified-safe-versions)



## 질문 및 지원 

시스템이 영향을 받았을 수 있다고 생각되면 즉시 연락해 주세요.

- **보안:** security@berri.ai
- **지원:** support@berri.ai
- **Slack:** [여기](https://join.slack.com/t/litellmossslack/shared_invite/zt-3o7nkuyfr-p_kbNJj8taRfXGgQI1~YyA)에서 LiteLLM team에 직접 연락하세요.

## 채용 

현재 다음 직무를 채용 중입니다.

- DevOps Engineer - CI/CD를 안전하고 원활하게 운영
- Security Engineer - application 보안 유지

합류에 관심이 있다면 [여기](https://jobs.ashbyhq.com/litellm)에서 지원해 주세요.
