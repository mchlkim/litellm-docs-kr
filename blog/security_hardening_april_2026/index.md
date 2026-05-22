---
slug: security-hardening-april-2026
title: "보안 업데이트: 취약점 공개와 지속적인 보안 강화"
date: 2026-04-03T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "LiteLLM v1.83.0에서 수정된 보안 취약점 공개와 버그 바운티 프로그램 시작 안내입니다."
tags: [보안]
hide_table_of_contents: false
---

3월의 [supply chain incident](https://docs.litellm.ai/blog/security-update-march-2026) 이후, [Veria Labs](https://verialabs.com/)에 LiteLLM proxy 감사를 의뢰했고 독립 연구자들이 제보한 여러 취약점도 수정했습니다. 아래 모든 문제는 v1.83.0에서 수정되었습니다. 영향을 받는 경우, 특히 JWT auth를 활성화한 경우 업그레이드를 권장합니다.

[버그 바운티 프로그램](#bug-bounty-program)도 시작했으며, Veria Labs는 계속 proxy 감사를 진행하고 있습니다. 추가 수정 사항은 향후 버전에 포함될 예정입니다.

두 high severity 문제([CVE-2026-35029](https://github.com/BerriAI/litellm/security/advisories/GHSA-53mr-6c8q-9789) 및 [GHSA-69x8-hrgq-fjj8](https://github.com/BerriAI/litellm/security/advisories/GHSA-69x8-hrgq-fjj8))는 **공격자가 이미 proxy에 대한 유효한 API key를 가지고 있어야 합니다**. 인증되지 않은 사용자가 악용할 수 있는 문제는 아닙니다.

critical severity 문제([CVE-2026-35030](https://github.com/BerriAI/litellm/security/advisories/GHSA-jjhc-v7c2-5hh6))는 인증 우회이지만, 기본값으로 꺼져 있는 `enable_jwt_auth`를 명시적으로 활성화한 배포에만 영향을 줍니다. **기본 LiteLLM 설정은 영향을 받지 않으며, LiteLLM Cloud 고객 중 이 기능을 활성화한 고객은 없었습니다.**

{/* truncate */}

## 취약점

### CVE-2026-35030: OIDC cache collision을 통한 인증 우회(Critical)

Veria Labs가 발견했습니다.

`enable_jwt_auth`가 활성화되면 LiteLLM은 `token[:20]`을 cache key로 사용해 OIDC userinfo를 cache했습니다. 같은 signing algorithm에서 나온 JWT는 동일한 header prefix를 공유하므로, 공격자는 다른 사용자의 cache entry에 맞는 token을 위조해 해당 session을 이어받을 수 있었습니다. 이를 `sha256(token)`을 cache key로 사용하도록 수정했습니다.

**대부분의 배포는 영향을 받지 않습니다.** 이 문제는 기본값으로 꺼져 있는 `enable_jwt_auth: true`가 필요합니다. 업그레이드할 수 없다면 workaround로 JWT auth를 비활성화하세요.

전체 권고문: [GHSA-jjhc-v7c2-5hh6](https://github.com/BerriAI/litellm/security/advisories/GHSA-jjhc-v7c2-5hh6)

### CVE-2026-35029: `/config/update`를 통한 권한 상승(High)

Lakera가 발견했습니다.

`/config/update`는 호출자의 role을 확인하지 않았습니다. 인증된 모든 사용자가 proxy runtime configuration을 수정할 수 있었고, 이는 임의 파일 읽기, admin account takeover, remote code execution으로 이어질 수 있었습니다. 이제 이 endpoint에는 `proxy_admin` role이 필요합니다.

전체 권고문: [GHSA-53mr-6c8q-9789](https://github.com/BerriAI/litellm/security/advisories/GHSA-53mr-6c8q-9789)

### Password hash 노출 및 `pass-the-hash` login(High)

약한 hashing 문제는 GitHub 사용자 [hamzayevmaqsud](https://github.com/hamzayevmaqsud)가 처음 제보했습니다([#15484](https://github.com/BerriAI/litellm/issues/15484)). 전체 공격 chain은 [iO Digital](https://www.iodigital.com/)의 Luca Vandenweghe와 Maarten De Rammelaere가 식별했습니다.

password는 unsalted SHA-256 hash로 저장되었고, 일부 경우에는 plaintext로 저장되었습니다. 여러 API endpoint가 인증된 사용자에게 hash를 반환했으며, `/v2/login`은 raw hash를 다시 hashing하지 않고 credential로 받아들였습니다. 따라서 탈취된 hash는 password 자체와 동일한 효과를 가졌습니다. 이제 random salt를 사용하는 scrypt로 이동했고 모든 API response에서 hash를 제거했습니다.

전체 권고문: [GHSA-69x8-hrgq-fjj8](https://github.com/BerriAI/litellm/security/advisories/GHSA-69x8-hrgq-fjj8)

## 버그 바운티 프로그램

supply chain incident와 이번 공개 이후, 프로젝트에 더 많은 외부 검토가 필요하다는 점이 분명해졌습니다. 연구자들이 문제를 제보할 수 있도록 버그 바운티 프로그램을 마련했습니다.

현재 bounty는 P0(supply chain) 및 P1(인증되지 않은 proxy access) 취약점에 지급됩니다.

| 심각도 | Bounty | 예제 |
|----------|--------|---------|
| Critical | $1,500 – $3,000 | 공급망 침해 |
| High | $500 – $1,500 | 보호 데이터에 대한 인증되지 않은 access |

앞으로 몇 달 동안 프로그램을 더 확장할 계획입니다. 버그 바운티 프로그램에 대한 자세한 정보는 [여기](https://github.com/BerriAI/litellm/security)에서 확인할 수 있습니다.

## 다음 계획

Veria Labs는 proxy에 대한 더 넓은 범위의 감사를 계속 함께 진행하고 있습니다. Github를 통해 들어온 security advisory에는 영업일 기준 5일 이내에 응답하겠습니다. 문제가 확인되고 수정되면 advisory를 게시하겠습니다.
