---
title: "v1.88.0 - Claude Opus 4.8, MCP Access-Group Authorization & Typed OpenTelemetry"
slug: "v1-88-0"
date: 2026-06-04T18:45:10
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Yuneng Jiang
    title: Senior Full Stack Engineer, LiteLLM
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
hide_table_of_contents: false
---

## 이 버전 배포

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:1.88.0
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.88.0
```

</TabItem>
</Tabs>

## 주요 변경 사항

`v1.88.0` 는 stable 릴리스이며 다음 릴리즈 후보에서 승격되었습니다: `v1.88.0` release candidates.

- **Claude Opus 4.8** Anthropic, Bedrock(`global` / `us` / `eu` / `au` regional route 포함), Azure AI, Vertex 전반에서 1M-token context, adaptive thinking, `output_config` goal mode와 함께 지원됩니다.
- **MCP access-group authorization** end-to-end로 재작업되었습니다. key 및 team access group이 이제 MCP server로 해석되고, grant는 opt-in member assignment와 함께 additive 방식으로 동작하며, client는 session id 기준으로 stateful/stateless session에 라우팅할 수 있습니다.
- **Typed OpenTelemetry instrumentation** inference span에 `team_metadata`, `http.route`, model name을 담는 semconv-aligned span model을 반영했습니다.
- **Streaming은 chunk당 약 30% 더 저렴해졌습니다** Anthropic 및 Bedrock hot path 기준입니다.
- **Agent-to-agent (A2A)** well-known agent-card discovery와 LangGraph Platform mode를 추가했습니다.

## New 모델 / Updated 모델

#### 새 모델 지원 (Claude Opus 4.8 across 9 provider routes)

| Provider | Model | 컨텍스트 윈도우 | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| --- | --- | --- | --- | --- | --- |
| Anthropic | `claude-opus-4-8` | 1,000,000 | $5.00 | $25.00 | Vision, function calling, prompt caching, reasoning (adaptive + max/xhigh effort), PDF input, computer use, response schema, tool choice, output_config |
| Vertex AI | `vertex_ai/claude-opus-4-8` | 1,000,000 | $5.00 | $25.00 | Same as Anthropic direct |
| Azure AI | `azure_ai/claude-opus-4-8` | 200,000 | $5.00 | $25.00 | Same as Anthropic direct |
| Bedrock | `anthropic.claude-opus-4-8` (+ `global.` / `us.` / `eu.` / `au.` routes) | 1,000,000 | $5.00 | $25.00 | Same, 추가로 native structured output |

Plus a reasoning-effort flag cleanup across existing Claude catalog entries: `supports_minimal_reasoning_effort` removed where unsupported, `supports_max_reasoning_effort` normalized, 및 a new `bedrock_output_config_effort_ceiling` (`high` / `xhigh` / `max`) field on Bedrock entries - [PR #29238](https://github.com/BerriAI/litellm/pull/29238).

#### 기능

- **[Anthropic](https://docs.litellm.ai/docs/providers/anthropic)**
    - Claude Opus 4.8 및 prune stale reasoning-effort flags 추가 - [PR #29238](https://github.com/BerriAI/litellm/pull/29238)
- **[Bedrock](https://docs.litellm.ai/docs/providers/bedrock)**
    - Claude Code goal mode via `output_config` for Bedrock Opus - [PR #28898](https://github.com/BerriAI/litellm/pull/28898)
    - tool search results 및 chat annotations 지원 - [PR #29120](https://github.com/BerriAI/litellm/pull/29120)

#### 버그 수정

- **[Anthropic](https://docs.litellm.ai/docs/providers/anthropic)**
    - injecting unsupported `output_config.effort=xhigh` for Claude Code on Sonnet/Opus 4.6 중지 - [PR #29304](https://github.com/BerriAI/litellm/pull/29304)
- **[Vertex AI](https://docs.litellm.ai/docs/providers/vertex)**
    - `output_config.effort` for Vertex Claude models that reject it (Haiku 4.5) 제거 - [PR #29585](https://github.com/BerriAI/litellm/pull/29585)
- **[Bedrock](https://docs.litellm.ai/docs/providers/bedrock)**
    - Align `toolUse` / `toolSpec` names 및 allow hyphens - [PR #28874](https://github.com/BerriAI/litellm/pull/28874)
- **[Azure](https://docs.litellm.ai/docs/providers/azure)**
    - AD token refresh in the v1 OpenAI client path 보존 - [PR #28627](https://github.com/BerriAI/litellm/pull/28627)
- **[OpenAI](https://docs.litellm.ai/docs/providers/openai)**
    - the double provider-prefix bug on model names 수정 - [PR #28661](https://github.com/BerriAI/litellm/pull/28661)
- **일반**
    - Hydrate wildcard model-discovery credentials - [PR #28284](https://github.com/BerriAI/litellm/pull/28284)

## LLM API 엔드포인트

#### 기능

- **[Realtime API](https://docs.litellm.ai/docs/realtime)**
    - Tool calling for the Gemini 및 Vertex AI live API - [PR #26590](https://github.com/BerriAI/litellm/pull/26590)
- **[A2A](https://docs.litellm.ai/docs/a2a)**
    - Well-known agent-card discovery 및 LangGraph Platform mode - [PR #28860](https://github.com/BerriAI/litellm/pull/28860)
- **Context Management**
    - `compact_20260112` polyfill 따라서 non-Anthropic providers get context compaction - [PR #28868](https://github.com/BerriAI/litellm/pull/28868)
- **Video**
    - Vertex Veo video edit, 사용해 DB credentials in the video handlers - [PR #29098](https://github.com/BerriAI/litellm/pull/29098)
- **Pass-through**
    - Extend `passthrough_managed_object_ids` to Azure - [PR #29160](https://github.com/BerriAI/litellm/pull/29160)

#### 버그

- **[Realtime API](https://docs.litellm.ai/docs/realtime)**
    - Send TEXT frames 및 a valid guardrail `session.update` - [PR #28848](https://github.com/BerriAI/litellm/pull/28848)
- **[Moderations](https://docs.litellm.ai/docs/moderation)**
    - Wire streaming flags 통해 to the unified dispatcher - [PR #27324](https://github.com/BerriAI/litellm/pull/27324)
- **[Batches](https://docs.litellm.ai/docs/batches)**
    - LiteLLM policy tracking from OpenAI batch metadata 제거 - [PR #28425](https://github.com/BerriAI/litellm/pull/28425)
    - the stripped batch `body.model` back to the proxy alias for auth 매핑 - [PR #29264](https://github.com/BerriAI/litellm/pull/29264)
- **Vector Stores**
    - Restrict vector store index create/delete to proxy admins - [PR #29202](https://github.com/BerriAI/litellm/pull/29202)
- **Video**
    - managed video model ids for auth 해석 - [PR #29545](https://github.com/BerriAI/litellm/pull/29545)
- **Pass-through**
    - Bedrock Knowledge Base pass-through: preserve SigV4 headers 및 the signed request body - [PR #27526](https://github.com/BerriAI/litellm/pull/27526)
    - `allowed_passthrough_routes` for `auth=true` pass-through 강제 - [PR #29256](https://github.com/BerriAI/litellm/pull/29256)
    - De-duplicate pass-through endpoint logs - [PR #29598](https://github.com/BerriAI/litellm/pull/29598)
    - Match pass-through registry routes bare-to-bare 때 `SERVER_ROOT_PATH` is set, fixing pass-through 404s - [PR #29658](https://github.com/BerriAI/litellm/pull/29658)

## 관리 엔드포인트 / UI

#### 기능

- **가상 키 & Teams**
    - `keys_count` on `/v2/team/list` 및 wire the UI Resources badge 노출 - [PR #28502](https://github.com/BerriAI/litellm/pull/28502)
    - team members to create keys on org-scoped teams 허용 - [PR #29310](https://github.com/BerriAI/litellm/pull/29310)
    - Exempt UI 및 CLI session tokens from team-key budget ceilings, hardened 따라서 custom `default_key_generate_params` cannot re-impose them - [PR #29612](https://github.com/BerriAI/litellm/pull/29612), [PR #29639](https://github.com/BerriAI/litellm/pull/29639)
    - Record ownership for service-account keys, 추가로 a Prisma JSON serialization fix - [PR #28990](https://github.com/BerriAI/litellm/pull/28990)
- **배포**
    - Helm: split per-component ServiceAccounts for gateway, backend, 및 UI - [PR #28712](https://github.com/BerriAI/litellm/pull/28712)
    - 엔터프라이즈: `RESEND_FROM_EMAIL` for self-hosted Resend sends - [PR #28830](https://github.com/BerriAI/litellm/pull/28830)

#### 버그

- **가상 키 & Teams**
    - Refresh the team cache on `team_model_add` / `team_model_delete` - [PR #28683](https://github.com/BerriAI/litellm/pull/28683)
    - Keep the `team_alias` cache in sync on `_cache_team_object` writes - [PR #28737](https://github.com/BerriAI/litellm/pull/28737)
    - spend-logs v2 route permissions 수정 - [PR #28705](https://github.com/BerriAI/litellm/pull/28705)
    - Normalize the Bearer prefix in the safe-hash helper - [PR #29343](https://github.com/BerriAI/litellm/pull/29343)
- **UI**
    - clearing custom pricing on wildcard models 허용 - [PR #28719](https://github.com/BerriAI/litellm/pull/28719)
    - `vertex_ai-anthropic_models` from leaking into the Anthropic dropdown 중지 - [PR #28723](https://github.com/BerriAI/litellm/pull/28723)
    - API Reference back to the query-param page 라우팅 - [PR #28726](https://github.com/BerriAI/litellm/pull/28726)
    - Show 2-decimal precision for `max_budget` on the key overview - [PR #28809](https://github.com/BerriAI/litellm/pull/28809)
    - Break the logout redirect loop across dev 및 proxy origins - [PR #29360](https://github.com/BerriAI/litellm/pull/29360)
    - Internal refactors: extract auth state into `AuthContext`, remove dead App Router scaffolding - [PR #28910](https://github.com/BerriAI/litellm/pull/28910), [PR #28891](https://github.com/BerriAI/litellm/pull/28891)

## AI 통합

### 로깅

- **[DataDog](https://docs.litellm.ai/docs/proxy/logging#datadog)**
    - Drain the cost-management queue 및 add an opt-in FinOps tag allowlist - [PR #28487](https://github.com/BerriAI/litellm/pull/28487)
- **Galileo**
    - the hosted v2 spans API 및 string output extraction 지원 - [PR #28771](https://github.com/BerriAI/litellm/pull/28771)
- **[OpenTelemetry](https://docs.litellm.ai/docs/proxy/logging#opentelemetry)**
    - Typed, semconv-aligned instrumentation - [PR #28909](https://github.com/BerriAI/litellm/pull/28909)
    - `team_metadata`, `http.route`, 및 model names to inference spans 추가 - [PR #29319](https://github.com/BerriAI/litellm/pull/29319)
    - the SERVER span on management-endpoint success without an `http_request` export - [PR #28794](https://github.com/BerriAI/litellm/pull/28794)
    - Link pass-through success spans to the SERVER root span - [PR #29315](https://github.com/BerriAI/litellm/pull/29315)
- **일반**
    - Exclude `proxy_server_request` from its own body snapshot - [PR #28618](https://github.com/BerriAI/litellm/pull/28618)
    - duplicate Claude Code traces 수정 - [PR #29311](https://github.com/BerriAI/litellm/pull/29311)

### 가드레일

- **일반**
    - HTTP 400 for LiteLLM content-filter blocks 반환 - [PR #28418](https://github.com/BerriAI/litellm/pull/28418)
    - Wire `apply_guardrail` into proxy logging callbacks - [PR #28970](https://github.com/BerriAI/litellm/pull/28970)
    - Persist `disable_global_guardrails` on keys - [PR #29233](https://github.com/BerriAI/litellm/pull/29233)

## 비용 추적, Budgets 및 Rate Limiting

- **Cost Tracking** — [OpenAI](https://docs.litellm.ai/docs/providers/openai) regional-processing cost uplift for EU/US data residency - [PR #28626](https://github.com/BerriAI/litellm/pull/28626)
- **Rate Limiting** — Cap the no-`max_tokens` TPM floor at the smallest configured limit (v3 limiter) - [PR #28805](https://github.com/BerriAI/litellm/pull/28805)
- **Budgets** — Enforce tag budgets for key-level tags - [PR #29108](https://github.com/BerriAI/litellm/pull/29108)
- **Budgets** — Enforce deployment budgets for dynamically added models - [PR #29273](https://github.com/BerriAI/litellm/pull/29273)
- **Budgets** — `reset_budget` writes only `{spend, budget_reset_at}` 및 stops pre-zeroing the counter - [PR #29358](https://github.com/BerriAI/litellm/pull/29358)

## MCP Gateway

- **Session Routing** — Stateless 및 stateful clients via session-id routing - [PR #26857](https://github.com/BerriAI/litellm/pull/26857)
- **Access Groups** — Additive key access-group grants with opt-in member assignment - [PR #29313](https://github.com/BerriAI/litellm/pull/29313)
- **Access Groups** — Resolve team `access_group_ids` to MCP servers - [PR #28997](https://github.com/BerriAI/litellm/pull/28997)
- **Access Groups** — Resolve key `access_group_ids` to MCP servers (ungated) - [PR #29195](https://github.com/BerriAI/litellm/pull/29195)
- **Access Groups** — Extend the key access-group union to MCP servers - [PR #28890](https://github.com/BerriAI/litellm/pull/28890)
- **Discovery** — Allow `llm_api_routes` virtual keys to list MCP servers - [PR #28442](https://github.com/BerriAI/litellm/pull/28442)
- **Server CRUD** — Preserve `source_url` on `GET /v1/mcp/server` list responses - [PR #29249](https://github.com/BerriAI/litellm/pull/29249)
- **Server CRUD** — Preserve omitted fields on `PUT /v1/mcp/server` partial updates - [PR #29253](https://github.com/BerriAI/litellm/pull/29253)
- **가상 키** — Ignore stale ids on key save - [PR #29128](https://github.com/BerriAI/litellm/pull/29128)

## 성능 / 부하 분산 / 안정성 개선

- **Streaming hot path** — ~30% lower per-chunk overhead on the Anthropic 및 Bedrock streaming path - [PR #28720](https://github.com/BerriAI/litellm/pull/28720)
- **Docker** — Use system Node in the componentized builders 및 retry `apk add` - [PR #28888](https://github.com/BerriAI/litellm/pull/28888)
- **Dependencies** — Routine dependency bumps, including a Starlette bad-host fix - [PR #29208](https://github.com/BerriAI/litellm/pull/29208), [PR #29373](https://github.com/BerriAI/litellm/pull/29373)

## 문서 업데이트

- Hand-written `CLAUDE.md`; remove `AGENTS.md` 및 point `GEMINI.md` at it - [PR #29252](https://github.com/BerriAI/litellm/pull/29252)
- Agent guidance: require consent 전에 writing new third-party names - [PR #28908](https://github.com/BerriAI/litellm/pull/28908)
- Cookbook: bump the Go directive to 1.26.3 in the gollem example - [PR #29234](https://github.com/BerriAI/litellm/pull/29234)

## 일반 Proxy 개선

Testing, CI & build hardening:

- UI e2e coverage across roles 및 flows — Team-BYOK add-model, Router fallback, MCP add-server, AI Hub make-public, Team Admin, Internal User / Viewer, logout 및 navbar identity - [PR #29068](https://github.com/BerriAI/litellm/pull/29068), [PR #29069](https://github.com/BerriAI/litellm/pull/29069), [PR #29070](https://github.com/BerriAI/litellm/pull/29070), [PR #29071](https://github.com/BerriAI/litellm/pull/29071), [PR #29072](https://github.com/BerriAI/litellm/pull/29072), [PR #29074](https://github.com/BerriAI/litellm/pull/29074), [PR #29075](https://github.com/BerriAI/litellm/pull/29075), [PR #29076](https://github.com/BerriAI/litellm/pull/29076), [PR #29077](https://github.com/BerriAI/litellm/pull/29077), [PR #29080](https://github.com/BerriAI/litellm/pull/29080), [PR #29083](https://github.com/BerriAI/litellm/pull/29083), [PR #28652](https://github.com/BerriAI/litellm/pull/28652)
- Pass-through `SERVER_ROOT_PATH` login-redirect trailing-slash e2e - [PR #29369](https://github.com/BerriAI/litellm/pull/29369)
- Behavior-pinning harnesses for `proxy_server.py` - [PR #28827](https://github.com/BerriAI/litellm/pull/28827), [PR #29309](https://github.com/BerriAI/litellm/pull/29309)
- Deterministic Redis cassette replay 및 live Google OAuth token minting for VCR - [PR #28826](https://github.com/BerriAI/litellm/pull/28826), [PR #29229](https://github.com/BerriAI/litellm/pull/29229)
- Reasoning-effort grid test 포함: Claude Opus 4.8 across provider routes - [PR #29327](https://github.com/BerriAI/litellm/pull/29327)
- Bedrock CI account moves 및 restore - [PR #28728](https://github.com/BerriAI/litellm/pull/28728), [PR #29326](https://github.com/BerriAI/litellm/pull/29326), [PR #29245](https://github.com/BerriAI/litellm/pull/29245)
- Keep `litellm_internal_staging` green - [PR #29344](https://github.com/BerriAI/litellm/pull/29344)
- Regenerate the admin-ui static export with `trailingSlash: true` - [PR #28112](https://github.com/BerriAI/litellm/pull/28112)

### 담당 영역별 PR 요약

PRs by ownership area (total: 97)
  - Other (CI / tests / build hardening): 23
  - UI / Auth & Management: 18
  - LLM API Endpoints: 15
  - MCP: 9
  - 모델 & Providers: 9
  - Logging: 8
  - Spend / Budgets / Rate Limits: 5
  - 성능: 4
  - 문서: 3
  - 가드레일: 3

## 릴리즈 후보 changelog (rc.1 → rc.2 → rc.3)

Almost everything above shipped in **rc.1**. The later candidates are small, targeted patches cut by cherry-pick.

**rc.2** added six fixes:

- managed video model ids for auth 해석 - [PR #29545](https://github.com/BerriAI/litellm/pull/29545)
- team members to create keys on org-scoped teams 허용 - [PR #29310](https://github.com/BerriAI/litellm/pull/29310)
- `output_config.effort` for Vertex Claude Haiku 4.5 제거 - [PR #29585](https://github.com/BerriAI/litellm/pull/29585)
- De-duplicate pass-through endpoint logs - [PR #29598](https://github.com/BerriAI/litellm/pull/29598)
- Exempt UI/CLI session tokens from team-key budget ceilings - [PR #29612](https://github.com/BerriAI/litellm/pull/29612)
- Harden that exemption against custom `default_key_generate_params` - [PR #29639](https://github.com/BerriAI/litellm/pull/29639)

**rc.3** added one fix:

- Match pass-through registry routes bare-to-bare 때 `SERVER_ROOT_PATH` is set, fixing pass-through 404s - [PR #29658](https://github.com/BerriAI/litellm/pull/29658)

## 새 기여자

No new contributors this release; all 11 authors are returning contributors.

**Full 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.87.0...v1.88.0

---

## 06/04/2026 (`v1.88.0`)

* New 모델 / Updated 모델: 9
* LLM API Endpoints: 15
* Management Endpoints / UI: 18
* AI Integrations (Logging / 가드레일): 11
* 비용 추적, Budgets 및 Rate Limiting: 5
* MCP Gateway: 9
* 성능 / 부하 분산 / 안정성 improvements: 4
* 일반 Proxy Improvements (testing / CI / build): 23
* 문서 업데이트: 3

Total: 97 PRs
