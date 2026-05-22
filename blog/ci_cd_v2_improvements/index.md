---
slug: ci-cd-v2-improvements
title: "LiteLLM CI/CD v2 발표"
date: 2026-03-30T21:30:00
authors:
  - krrish
description: "CI/CD v2는 LiteLLM에 격리된 환경, 더 강한 보안 gate, 더 안전한 release 분리를 도입합니다."
tags: [엔지니어링, ci-cd, 보안]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

LiteLLM에 CI/CD v2가 적용되었습니다.

<Image
  img={require('../../img/ci_cd_architecture.png')}
  style={{width: '700px', height: 'auto', display: 'block'}}
/>

<br/>
[보안 incident](https://docs.litellm.ai/blog/security-townhall-updates#roadmap) 이후 공개한 roadmap을 기반으로, CI/CD v2는 LiteLLM에 격리된 환경, 더 강한 보안 gate, 더 안전한 release 분리를 도입합니다.

{/* truncate */}

## 변경 사항

- 보안 scan과 unit test는 격리된 환경에서 실행됩니다.
- validation과 release는 서로 다른 repository로 분리되어, 공격자가 release credential에 도달하기 더 어렵습니다.
- PyPI release에는 Trusted Publishing을 사용합니다. 즉, release 게시에 장기 credential을 사용하지 않습니다.
- Docker release tag는 immutable하게 관리합니다. 게시 이후 Docker release tag가 변조되지 않도록 하기 위한 조치입니다. [자세히 보기](https://docs.docker.com/docker-hub/repos/manage/hub-images/immutable-tags/). GHCR Docker release에 대한 작업도 계획되어 있습니다.
- [Cosign](https://github.com/sigstore/cosign)으로 Docker image를 서명합니다. 모든 release image가 서명되므로 사용자는 image가 LiteLLM에서 온 것인지 독립적으로 검증할 수 있습니다.

## Docker image signature 검증

`v1.83.0-nightly`부터 GHCR에 게시되는 모든 LiteLLM Docker image는 [cosign](https://docs.sigstore.dev/cosign/overview/)으로 서명됩니다. 모든 release는 [commit `0112e53`](https://github.com/BerriAI/litellm/commit/0112e53046018d726492c814b3644b7d376029d0)에서 도입된 동일한 key로 서명됩니다.

**고정된 commit hash로 검증(권장):**

commit hash는 암호학적으로 immutable하므로, 원본 signing key를 사용 중인지 확인하는 가장 강한 방법입니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/0112e53046018d726492c814b3644b7d376029d0/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

**release tag로 검증(편의 방식):**

이 repository의 tag는 보호되어 있으며 동일한 key로 resolve됩니다. 이 방식은 읽기 쉽지만 tag protection rule에 의존합니다.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/BerriAI/litellm/<release-tag>/cosign.pub \
  ghcr.io/berriai/litellm:<release-tag>
```

`<release-tag>`를 배포할 version으로 바꾸세요. 예: `v1.83.0-stable`.

예상 출력:

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

## 다음 계획

앞으로는 다음을 계획하고 있습니다.
- OpenSSF 도입. OpenSSF는 project가 강한 보안 태세를 입증하기 위해 충족해야 하는 보안 기준 집합입니다. [자세히 보기](https://baseline.openssf.org/versions/2026-02-19.html)
  - GitHub에 Scorecard와 Allstar를 추가했습니다.

- CI/CD pipeline에 SLSA build provenance 추가. 이를 통해 사용자는 release가 LiteLLM에서 온 것인지 독립적으로 검증하고, 게시 이후 release가 조용히 수정되는 것을 방지할 수 있습니다.


이 작업을 통해 사용자가 사용하는 release가 안전하고 LiteLLM에서 제공된 것임을 더 확신할 수 있기를 바랍니다.


## 원칙

새 CI/CD pipeline은 아래 원칙을 반영하며, 더 안전하고 신뢰성 있게 설계되었습니다.

- 각 package가 접근할 수 있는 범위를 **제한**
- 민감한 환경 변수 수를 **축소**
- compromise된 package 사용을 **방지**
- release 변조를 **방지**


## 참여 방법

4월 안정성 sprint 계획에 의견을 남겨 주세요: https://github.com/BerriAI/litellm/issues/24825
