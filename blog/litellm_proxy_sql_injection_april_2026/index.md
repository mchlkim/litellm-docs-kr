---
slug: cve-2026-42208-litellm-proxy-sql-injection
title: "보안 업데이트: LiteLLM Proxy의 CVE-2026-42208"
date: 2026-04-29T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "CVE-2026-42208(LiteLLM Proxy API 키 검증 경로의 SQL injection)가 수정되었습니다. v1.83.10-stable로 업그레이드하세요."
tags: [보안]
hide_table_of_contents: false
---

최근 LiteLLM Proxy에 대한 보안 권고를 게시했습니다.

버그 바운티 프로그램을 통해 LiteLLM Proxy의 API 키 검증 경로에 있는 SQL injection 취약점 제보를 받았으며, 이 취약점은 **CVE-2026-42208**로 추적됩니다.

이 문제는 팀에서 검토했고 안정 릴리스에서 수정한 뒤 GitHub Security Advisory로 게시했습니다.

* **영향받는 버전:** `v1.81.16`부터 `v1.83.6`까지
* **수정된 버전:** `v1.83.7` 이상
* **권장 버전:** `v1.83.10-stable`

안정 릴리스: https://github.com/BerriAI/litellm/releases/tag/v1.83.10-stable

권고문: https://github.com/BerriAI/litellm/security/advisories/GHSA-r75f-5x8p-qvmc

{/* truncate */}

## 요약

* 이 문제는 LiteLLM 버그 바운티 프로그램을 통해 제보되었습니다.
* GitHub Security Advisory를 게시하기 전에 안정 릴리스에서 문제를 수정했습니다.
* LiteLLM Proxy `v1.81.16`부터 `v1.83.6`까지가 영향을 받습니다.
* 수정 사항은 `v1.83.7` 이상에서 사용할 수 있습니다.
* `v1.83.10-stable`로 업그레이드하는 것을 권장합니다.
* 영향받는 버전을 실행하는 동안 proxy가 신뢰할 수 없는 네트워크에서 접근 가능했다면, 아래 helper query로 Postgres query history를 검토하는 것을 권장합니다.

## 어떤 문제였나요?

LiteLLM Proxy는 API 키 검증 중 `Authorization: Bearer` header를 확인해 들어오는 요청을 검증합니다.

영향받는 버전에서는 조작된 `Authorization: Bearer` header를 포함한 인증되지 않은 요청이 특정 조건에서 취약한 데이터베이스 query 경로에 도달할 수 있었습니다.

그 결과 의도하지 않은 데이터베이스 접근으로 이어질 가능성이 있었습니다. 실제 영향은 배포 설정, 네트워크 노출 범위, 데이터베이스 권한, 저장된 데이터에 따라 달라집니다.

## 보안 대응 절차

이 문제는 버그 바운티 프로그램을 통해 제보되었습니다. 팀은 제보 내용을 검토하고 취약한 경로를 패치했으며, 수정 사항을 검증한 뒤 GitHub Security Advisory 게시 전에 안정 빌드를 릴리스했습니다.

권고문이 게시되는 시점에 사용자가 명확한 조치 경로를 확보할 수 있도록 이 절차를 따릅니다.

## 사용자가 해야 할 일

### 1. `v1.83.10-stable`로 업그레이드

최신 안정 릴리스로 업그레이드하는 것을 권장합니다.

https://github.com/BerriAI/litellm/releases/tag/v1.83.10-stable

`v1.83.10-stable`로 바로 업그레이드할 수 없다면 `v1.83.7` 이상 버전으로 업그레이드하세요.

### 2. 해당되는 경우 Postgres query history 검토

영향받는 버전을 실행하는 동안 LiteLLM Proxy가 신뢰할 수 없는 네트워크에서 접근 가능했다면, 다음 helper query로 Postgres query history를 검토하는 것을 권장합니다.

https://gist.github.com/ishaan-berri/6f31e56e878338eb4c01990bd08378ab

query 결과를 저희가 함께 검토하길 원한다면 전달해 주세요. triage를 도울 수 있습니다.

## 지속적인 보안 투자

문제를 책임 있게 식별하고 수정하며 전달할 수 있도록 버그 바운티 프로그램과 coordinated disclosure 절차에 계속 투자하겠습니다.

LiteLLM에서 보안 문제를 발견하면 [GitHub Security Advisory 절차 또는 버그 바운티 프로그램](https://github.com/BerriAI/litellm/security)을 통해 제보해 주세요.
