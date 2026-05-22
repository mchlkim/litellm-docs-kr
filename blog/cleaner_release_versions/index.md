---
slug: cleaner-release-versions
title: "LiteLLM 릴리즈 버전 체계 변경: 표준 이름, 주간 릴리즈는 MINOR, hotfix는 PATCH"
date: 2026-04-28
authors:
  - yuneng
description: "`-stable`, `-nightly` suffix를 제거합니다. 주간 릴리즈는 MINOR를 올리고, PATCH는 실제 hotfix에만 사용합니다. 기존 릴리즈 태그는 유지되며 새 체계는 `1.84.0`부터 시작합니다."
tags: [release, packaging, docker]
hide_table_of_contents: false
---

LiteLLM 릴리즈 버전 이름이 변경됩니다. 이번 변경은 두 가지 문제를 해결하기 위한 것입니다.

**1. `-stable`, `-nightly` suffix는 표준 형식이 아닙니다.**

`v1.83.3-stable`, `v1.83.0-nightly` 같은 버전은 PEP 440(PyPI) 또는 SemVer 2.0(Docker / Helm) 규칙과 맞지 않습니다. 표준 버전 문자열을 기대하는 사용자는 혼란을 겪고, 버전을 분류하는 도구는 suffix를 별도로 처리해야 합니다.

**2. 주간 릴리즈가 PATCH를 올리면서 실제 hotfix를 위한 공간이 부족했습니다.**

기존 모델에서는 예정된 주간 릴리즈마다 PATCH 번호가 올라갔습니다. 예를 들어 `1.83.0` -> `1.83.1` -> `1.83.2` -> `1.83.3` 방식입니다. `1.83.3`에 실제 hotfix가 필요해도 다음 PATCH인 `1.83.4`는 이미 다음 주 릴리즈용으로 예약되어 있었습니다. Docker에서는 `v1.83.3-stable.patch.1` 같은 우회 형식을 썼지만, PyPI는 이 문법을 허용하지 않기 때문에 Docker image와 Python wheel을 함께 배포해야 하는 hotfix를 깔끔하게 낼 방법이 없었습니다.

<!-- truncate -->

## 변경 사항

**`1.84.0`**부터 다음 체계를 적용합니다.

- **suffix를 제거합니다.** Stable 릴리즈는 `1.84.0`처럼 PEP 440 / SemVer 2.0 형식을 그대로 사용합니다. Pre-release는 PyPI와 Docker에 맞춰 각각 표준 PEP 440(`1.84.0rc1`, `1.84.0.dev42`) 및 SemVer(`1.84.0-rc.1`, `1.84.0-dev.42`) 형식을 사용합니다.
- **주간 릴리즈는 MINOR를 올립니다.** 예정된 stable 릴리즈마다 MINOR component를 올립니다. 예: `1.84.0` -> `1.85.0` -> `1.86.0`.
- **PATCH는 hotfix에만 사용합니다.** `1.84.0`에 수정이 필요하면 `1.84.1`이 됩니다. `pip install litellm==1.84.1`, `docker pull ghcr.io/berriai/litellm:1.84.1`처럼 모든 배포 채널에서 일관되게 설치할 수 있습니다.

## 비교

| 시나리오 | 기존 이름 | 새 이름 |
|---|---|---|
| 예정된 주간 stable | `v1.83.3-stable` | `1.84.0` (Docker + PyPI) |
| 현재 stable에 대한 hotfix | `v1.83.3-stable.patch.1` (Docker 전용 - PyPI 릴리즈 없음) | `1.84.1` (Docker + PyPI) |
| 릴리즈 후보 | `v1.84.0-rc` | `1.84.0-rc.1` (Docker) / `1.84.0rc1` (PyPI) |
| Nightly | `v1.83.0-nightly` | `1.84.0-dev.42` (Docker) / `1.84.0.dev42` (PyPI) |

가장 중요한 부분은 hotfix 행입니다. 기존 체계에서는 `v1.83.3-stable.patch.1`에 해당하는 PyPI 배포가 없었습니다. 새 체계에서는 hotfix가 일반 릴리즈처럼 registry와 PyPI에 모두 배포됩니다.

## 하위 호환성

기존 이름으로 이미 배포된 릴리즈(`v1.83.x-stable`, `v1.83.x-stable.patch.N`, 기존 `1.83.x` PyPI 버전)는 **registry와 PyPI에 계속 유지됩니다**. 지금 고정해서 쓰는 버전은 계속 동작합니다. 새 이름 체계는 `1.84.0`부터 새로 나오는 릴리즈에 적용됩니다.

전환 이전 릴리즈 라인에 유지보수 패치가 필요한 경우(예: 현재 버전이 `1.84.x`인 상태에서 `1.83.x`에 수정이 필요한 경우), 해당 라인 내 일관성을 위해 예전 이름 체계를 계속 사용할 수 있습니다. 릴리즈 노트에는 어떤 형식을 사용했는지 명시합니다. 장기적으로는 모든 새 릴리즈가 새 이름 체계로 이동합니다.

## 알아두면 좋은 점

- **`litellm-dev`** - 임시 빌드와 일회성 빌드(예: 수정 사항이 정식 릴리즈에 들어가기 전에 테스트하는 빌드)를 위한 별도의 `litellm-dev` PyPI 패키지와 `*-dev` Docker image 계열이 있습니다. **프로덕션 용도가 아닙니다.** 표준 `litellm` 패키지나 `ghcr.io/berriai/litellm:*` Docker 태그에 고정한 환경은 실수로 `litellm-dev` 빌드를 가져오지 않습니다.
- **`:latest` Docker tag**는 각 registry의 최신 stable 릴리즈를 가리키며, 새 stable이 배포되면 자동으로 이동합니다. 프로덕션 배포에서는 재현 가능한 배포를 위해 여전히 콘텐츠 태그(예: `:1.84.0`)에 고정하는 방식을 권장합니다.
- **Image signing**([cosign verify](/litellm-docs-kr/blog/ci-cd-v2-improvements#verify-docker-image-signatures))과 검증 명령은 새 태그 형식에서도 변경 없이 계속 동작합니다.
