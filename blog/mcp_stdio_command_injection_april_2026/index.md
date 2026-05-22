---
slug: mcp-stdio-command-injection-april-2026
title: "보안 업데이트: CVE-2026-30623 — Anthropic MCP SDK를 통한 command injection"
date: 2026-04-21T12:00:00
authors:
  - krrish
  - ishaan-alt
description: "CVE-2026-30623(MCP stdio transport를 통한 인증된 RCE)이 수정되었습니다. v1.83.6-nightly 또는 v1.83.7-stable 이상으로 업그레이드하세요."
tags: [보안]
hide_table_of_contents: false
---

2026년 4월 15일, [OX Security](https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/)는 **Anthropic MCP SDK의 stdio transport에서 발생하는 command injection**에 관한 권고문을 게시했습니다(`StdioServerParameters`가 전달받은 `command`를 실행하는 문제). 이 문제는 LiteLLM `v1.83.6-nightly`부터 수정되었습니다.

수정 사항은 [commit `7b7f304`](https://github.com/BerriAI/litellm/commit/7b7f304675)(PR [#25343](https://github.com/BerriAI/litellm/pull/25343))에 반영되었고, `v1.83.6-nightly` 이후 모든 릴리스에 포함되어 있습니다. `v1.83.7-stable`에도 포함됩니다.

## 요약

- **인증되지 않은 사용자가 악용할 수 있는 문제는 아니었습니다.** 영향받는 endpoint(MCP server 생성 및 `/mcp-rest/test/*` preview endpoint)는 모두 LiteLLM 인증 뒤에 있습니다. 공격자가 이 코드 경로에 도달하려면 유효한 LiteLLM API key가 필요했고, 패치 이후에는 `PROXY_ADMIN` 역할도 필요합니다.
- **수정 사항은 `v1.83.6-nightly`부터 적용되어 있습니다.** 수정 사항이 포함된 첫 stable 릴리스는 **`v1.83.7-stable`**입니다. 패치된 버전 전체 목록은 아래 섹션에 있습니다.
- **다른 취약점을 발견하면 제보해 주세요.** LiteLLM은 [버그 바운티 프로그램](https://github.com/BerriAI/litellm/security)을 운영하며 P0(supply chain) 및 P1(인증되지 않은 proxy 접근) 문제에 보상합니다. 현재 bounty table은 [이전 보안 업데이트](https://docs.litellm.ai/blog/security-hardening-april-2026#bug-bounty-program)를 참고하세요.

{/* truncate */}

## 어떤 문제였나요?

OX Security 권고문에 따르면:

> LiteLLM의 MCP server 생성 기능에는 인증된 원격 command 실행 취약점이 있었습니다. 사용자는 JSON 설정에서 임의의 command 및 args 값을 지정해 MCP server를 추가할 수 있었고, LiteLLM은 이를 검증 없이 host에서 실행해 공격자가 임의의 운영체제 command를 실행할 수 있었습니다.

구체적으로는 `transport: stdio`로 MCP server를 추가할 때 `command` field가 `StdioServerParameters`로 그대로 전달되어 proxy host에서 subprocess로 실행되었습니다. MCP server 생성 권한이 있는 인증된 사용자는 LiteLLM process 권한으로 임의의 command를 실행할 수 있었습니다.

- **CVE:** [CVE-2026-30623](https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/)
- **심각도:** Critical
- **인증 필요:** 예(인증된 RCE, 인증되지 않은 RCE 아님)
- **영향받는 표면:**
  - MCP server 생성/수정(`NewMCPServerRequest`, `UpdateMCPServerRequest`)
  - `/mcp-rest/test/connection` 및 `/mcp-rest/test/tools/list` preview endpoint
  - runtime에 config 또는 DB에서 재구성되는 server

## 수정 사항

Commit [`7b7f304`](https://github.com/BerriAI/litellm/commit/7b7f304675)는 네 가지 변경을 포함합니다.

1. **stdio transport용 command allowlist.** 새 상수 `MCP_STDIO_ALLOWED_COMMANDS`는 stdio `command` 값을 알려진 MCP launcher의 작은 집합으로 제한합니다.

    ```python
    MCP_STDIO_ALLOWED_COMMANDS = frozenset(
        {"npx", "uvx", "python", "python3", "node", "docker", "deno"}
    )
    ```

    추가 binary를 허용해야 한다면 배포 시 `LITELLM_MCP_STDIO_EXTRA_COMMANDS` 환경 변수(comma-separated)를 통해 목록을 확장할 수 있습니다.

2. **Pydantic 수준 검증.** 이제 `NewMCPServerRequest`와 `UpdateMCPServerRequest`는 `command` basename이 allowlist에 없는 config를 거부합니다. 따라서 잘못된 입력이 request parsing 단계를 통과하지 못합니다.

3. **runtime 방어 심화.** `_create_mcp_client`는 stdio client를 생성할 때 command를 다시 검증합니다. 따라서 allowlist 도입 전의 오래된 DB row 또는 config file에서 재구성된 `MCPServer`도 spawn 시점에 차단됩니다.

4. **preview endpoint 잠금 강화.** 이제 `/mcp-rest/test/connection`과 `/mcp-rest/test/tools/list`는 `PROXY_ADMIN` 역할을 요구합니다. 이 "추가 전 테스트" endpoint는 아무것도 저장하지 않고 command 실행을 trigger하는 가장 쉬운 경로였습니다.

## 수정 사항이 포함된 버전

패치는 `v1.83.6-nightly` 이후 tag가 붙은 모든 LiteLLM 릴리스에 포함되어 있습니다. 게시 시점에 확인된 tag는 다음과 같습니다.

| 버전 | 유형 |
|---------|------|
| `v1.83.6-nightly` | 수정 사항이 포함된 첫 릴리스 |
| `v1.83.7.rc.1` | 릴리즈 후보 |
| `v1.83.7-stable` | Stable |
| `v1.83.8-nightly` | Nightly |
| `v1.83.9-nightly` | Nightly |
| `v1.83.10-nightly` | Nightly |

이보다 새로운 LiteLLM 릴리스도 모두 수정 사항을 포함합니다.

## 사용자가 해야 할 일

- **업그레이드하세요.** `v1.83.7-stable` 이상으로 이동하세요. nightly를 추적하고 있다면 `>= v1.83.6-nightly`는 패치되어 있습니다.
- **기존 MCP server를 감사하세요.** 업그레이드 전에 설정된 stdio MCP server가 있다면, `command` basename이 allowlist에 없는 row는 이제 시작에 실패합니다. 허용된 launcher(예: `npx`, `uvx`, `python`)를 사용하도록 config를 수정하거나 binary를 `LITELLM_MCP_STDIO_EXTRA_COMMANDS`에 추가하세요.
- **`PROXY_ADMIN` 보유자를 검토하세요.** stdio test endpoint는 이제 admin-only입니다. 이전에 MCP testing을 non-admin 사용자에게 위임했다면 이제 403을 받게 됩니다.

## 크레딧

제보해 준 OX Security research team의 **Moshe Siman Tov Bustan**, **Mustafa Naamnih**, **Nir Zadok**에게 감사드립니다. 전체 cross-ecosystem writeup은 [여기](https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/)에서 확인할 수 있습니다.

LiteLLM에서 보안 문제를 발견하면 [버그 바운티 프로그램](https://github.com/BerriAI/litellm/security)을 통해 제보해 주세요.
