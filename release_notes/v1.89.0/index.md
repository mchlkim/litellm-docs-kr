---
title: "v1.89.0 - Claude Fable 5, A2A Agent Providers & MCP Per-Server Controls"
slug: "v1-89-0"
date: 2026-06-10T11:04:00
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
docker.litellm.ai/berriai/litellm:v1.89.0
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.89.0
```

</TabItem>
</Tabs>

## 주요 변경 사항

`v1.89.0` 를 기반으로 합니다: [`v1.88.0`](/release_notes/v1.88.0/v1-88-0).

- **Claude Fable 5** Anthropic, Bedrock, Azure AI, Vertex 전반에서 1M-token context, adaptive thinking, computer use와 함께 지원됩니다.
- **Agent-to-agent (A2A)** watsonx Orchestrate 및 LangFlow(A2A session bridging 포함)라는 새 agent provider 2개와 Databricks Apps agent용 OAuth M2M을 추가했습니다.
- **MCP gateway** global/per-user scope의 server별 환경 변수, key/team용 server별 RPM rate limit, issuer-scoped JWT auth를 쓰는 OAuth passthrough, server 등록 시 `oauth2_flow` 저장을 추가했습니다.
- **관측성** Arize/Phoenix의 OpenInference rendering parity(tool call, cost, passthrough I/O, session, multimodal, cache token), typed OTel v2 span의 MCP semantic convention, ingest-traces API를 쓰는 Galileo logger를 반영했습니다.
- **새 검색 및 음성 전사 프로바이더** - APISerpent, You.com, 및 Soniox - gateway에 합류했고, dashboard는 fully typed OpenAPI-generated API client로 migration되었습니다.

---

### MCP 자격 증명 저장소

<Image img={require('../../img/release_notes/mcp_credential_store.png')} style={{ width: '800px', height: 'auto' }} />

<br/>

이 릴리스에서는 MCP server별 자격 증명을 gateway에 직접 안전하게 저장할 수 있습니다. server에서 변수를 한 번 정의하고 **Instance**(모든 사용자 공유) 또는 **Per-user**(각 사용자가 자체 값을 제공) scope로 지정한 뒤, static header나 인증 설정에서 `${VAR_NAME}` 문법(예: `${DB_PROTOCOL}://${CORP_USERNAME}:${CORP_PASSWORD}@${DB_HOSTNAME}`)으로 참조할 수 있어 각 사용자가 자신의 identity로 연결할 수 있습니다.

[시작하기](../../docs/mcp#server-variables)

## 새 프로바이더 및 엔드포인트

### 새 프로바이더 (3 새 프로바이더)

| Provider                  | Supported LiteLLM Endpoints | 설명                           |
| ------------------------- | --------------------------- | ------------------------------------- |
| APISerpent (`apiserpent`) | Search                      | Web search 및 deep-search API        |
| You.com (`you_com`)       | Search                      | You.com web search API                |
| Soniox (`soniox`)         | 음성 전사         | Async speech-to-text (`stt-async-v4`) |

## New 모델 / Updated 모델

#### 새 모델 지원 (selected)

| Provider       | Model                                                           | 컨텍스트 윈도우 | Input ($/1M tokens) | Output ($/1M tokens) | 기능                                                                  |
| -------------- | --------------------------------------------------------------- | -------------- | ------------------- | -------------------- | ------------------------------------------------------------------------- |
| Anthropic      | `claude-fable-5`                                                | 1,000,000      | $10.00              | $50.00               | Adaptive thinking, computer use, function calling, prompt caching, vision |
| Vertex AI      | `vertex_ai/claude-fable-5`                                      | 1,000,000      | $10.00              | $50.00               | Same as Anthropic direct                                                  |
| Azure AI       | `azure_ai/claude-fable-5`                                       | 1,000,000      | $10.00              | $50.00               | Same as Anthropic direct                                                  |
| Bedrock        | `anthropic.claude-fable-5` (+ `global.` / `us.` / `eu.` routes) | 1,000,000      | $10.00              | $50.00               | Same as Anthropic direct                                                  |
| Bedrock Mantle | `bedrock_mantle/openai.gpt-5.5`                                 | 272,000        | $5.50               | $33.00               | Responses API, reasoning, function calling, prompt caching                |
| Bedrock Mantle | `bedrock_mantle/openai.gpt-5.4`                                 | 272,000        | $2.75               | $16.50               | Responses API, reasoning, function calling, prompt caching                |
| Azure AI       | `azure_ai/kimi-k2.6`                                            | 262,144        | $0.95               | $4.00                | Reasoning, vision, function calling, tool choice                          |
| MiniMax        | `minimax/MiniMax-M3`                                            | 512,000        | $0.60               | $2.40                | Reasoning, prompt caching, function calling                               |
| Inception      | `inception/mercury-2` (+ `mercury-edit-2`)                      | 128,000        | $0.25               | $0.75                | Function calling, prompt caching, response schema                         |

Additional model-map additions: fal.ai Nano Banana 및 Gemini 2.5 Flash Image generation - [PR #29798](https://github.com/BerriAI/litellm/pull/29798); `mistral/ministral-8b-latest` - [PR #29453](https://github.com/BerriAI/litellm/pull/29453); a batch of new Snowflake Cortex model entries (Claude, GPT, Llama, embeddings); `vertex_ai/google/gemma-4-26b-a4b-it-maas`; APISerpent, You.com, 및 Soniox catalog entries; 및 a `jp.` regional route for Claude Opus 4.7.

#### 기능

- **[Anthropic](../../docs/providers/anthropic)**
  - future Claude models to the Anthropic provider via pattern matching 라우팅 - [PR #29239](https://github.com/BerriAI/litellm/pull/29239)
  - Claude Opus 4.8 통해 adaptive thinking 라우팅 - [PR #29702](https://github.com/BerriAI/litellm/pull/29702)
  - a thinking block for `reasoning_content`-only streaming chunks in the Anthropic adapter emit - [PR #29600](https://github.com/BerriAI/litellm/pull/29600)
  - Inline legacy `$ref` defs in tool schemas (Anthropic 및 Fireworks) - [PR #28646](https://github.com/BerriAI/litellm/pull/28646)
- **[Gemini](../../docs/providers/gemini)**
  - `googleSearch` with server-side tools 및 `googleMaps` JSON schema 지원 - [PR #29582](https://github.com/BerriAI/litellm/pull/29582)
  - GA event names for Pipecat 1.3.x compatibility on Gemini realtime 사용 - [PR #29662](https://github.com/BerriAI/litellm/pull/29662)
- **[Vertex AI](../../docs/providers/vertex)**
  - a user-supplied `api_base` as-is for the Model Garden OpenAI-compatible path 사용 - [PR #29530](https://github.com/BerriAI/litellm/pull/29530)
  - Handle namespace tools 및 strip `client_metadata` for Codex compatibility on Vertex/Anthropic - [PR #29489](https://github.com/BerriAI/litellm/pull/29489)
- **[Azure AI](../../docs/providers/azure_ai)**
  - tool-level extra fields on a 400 및 retry 제거 - [PR #29479](https://github.com/BerriAI/litellm/pull/29479)

#### 버그 수정

- **일반**
  - a 400 (not 500) on Anthropic context overflow, 및 seed identity on failed auth 반환 - [PR #29848](https://github.com/BerriAI/litellm/pull/29848)
  - Omit the OpenAI `[DONE]` sentinel on google-genai `streamGenerateContent` - [PR #29426](https://github.com/BerriAI/litellm/pull/29426)

## LLM API 엔드포인트

#### 기능

- **[Batches](../../docs/batches)**
  - Skip unnecessary batch input-file reads - [PR #29114](https://github.com/BerriAI/litellm/pull/29114)
  - credentials correctly 때 cancelling a managed batch 해석 - [PR #29734](https://github.com/BerriAI/litellm/pull/29734)
- **Vector Stores**
  - vector-store file-list credentials from team deployments 해석 - [PR #29739](https://github.com/BerriAI/litellm/pull/29739)
  - an engines URL for Vertex AI Search 지원 - [PR #27885](https://github.com/BerriAI/litellm/pull/27885)
  - Forward per-request params to Vertex AI Search - [PR #29459](https://github.com/BerriAI/litellm/pull/29459)
- **Realtime**
  - Track realtime audio token cost - [PR #29722](https://github.com/BerriAI/litellm/pull/29722)
  - null transcripts in stream logging payloads 허용 - [PR #29625](https://github.com/BerriAI/litellm/pull/29625)
  - WebSocket connection improvements - [PR #29563](https://github.com/BerriAI/litellm/pull/29563)

#### Agents (A2A)

- watsonx Orchestrate agent provider - [PR #29410](https://github.com/BerriAI/litellm/pull/29410)
- LangFlow agent provider with A2A session bridging - [PR #28963](https://github.com/BerriAI/litellm/pull/28963)
- OAuth M2M for Databricks Apps A2A agents - [PR #29586](https://github.com/BerriAI/litellm/pull/29586)
- A2A bug fixes - [PR #29566](https://github.com/BerriAI/litellm/pull/29566)

## 관리 엔드포인트 / UI

#### 기능

- **가상 키 & Auth**
  - JWT-to-virtual-key mapping - [PR #28510](https://github.com/BerriAI/litellm/pull/28510)
  - Let internal users view search tools - [PR #29542](https://github.com/BerriAI/litellm/pull/29542)
  - Expand the all-team-models sentinel in `can_key_call_model` for batch validation - [PR #29746](https://github.com/BerriAI/litellm/pull/29746)
- **대시보드**
  - dashboard API types from the proxy OpenAPI spec 생성 - [PR #29816](https://github.com/BerriAI/litellm/pull/29816)
  - Centralize proxy base-URL resolution into a tested resolver - [PR #29793](https://github.com/BerriAI/litellm/pull/29793)
  - networking calls 통해 a shared, location-pinned `apiClient` 라우팅 - [PR #29723](https://github.com/BerriAI/litellm/pull/29723), [PR #29806](https://github.com/BerriAI/litellm/pull/29806), [PR #29815](https://github.com/BerriAI/litellm/pull/29815)
  - ESLint to flat config 및 bump `eslint-config-next` to 16 마이그레이션 - [PR #29626](https://github.com/BerriAI/litellm/pull/29626)

#### 버그 수정

- the resolved DB `user_id` for spend on legacy email match (JWT) 사용 - [PR #29217](https://github.com/BerriAI/litellm/pull/29217)
- the 401 status for expired JWTs in OTel traces 보존 - [PR #29510](https://github.com/BerriAI/litellm/pull/29510)
- team BYOK model-name corruption on model edit 중지 - [PR #29731](https://github.com/BerriAI/litellm/pull/29731)
- Drop a deleted team BYOK model name from `team.models` - [PR #29820](https://github.com/BerriAI/litellm/pull/29820)
- `default=None` to `LiteLLM_TeamMembership.litellm_budget_table` 추가 - [PR #29684](https://github.com/BerriAI/litellm/pull/29684)
- a new expiration 때 regenerating an expired key 요구 - [PR #29838](https://github.com/BerriAI/litellm/pull/29838)
- Render caller-supplied filter options in caller order (LIT-3151) - [PR #29462](https://github.com/BerriAI/litellm/pull/29462)
- Make A2A skill tags enterable 및 validated - [PR #29512](https://github.com/BerriAI/litellm/pull/29512)
- Persist the Tools-tab MCP OAuth token to the DB - [PR #29809](https://github.com/BerriAI/litellm/pull/29809)
- MCP playground auth by OAuth2 mode instead of `token_url` 라우팅 - [PR #29714](https://github.com/BerriAI/litellm/pull/29714)
- MCP playground tool calls from sending twice 중지 - [PR #29821](https://github.com/BerriAI/litellm/pull/29821)

## AI 통합

### 로깅

- **[Arize / Phoenix](../../docs/proxy/logging)**
  - OpenInference rendering parity: tool calls, cost, passthrough I/O, session/user, multimodal, 및 cache tokens - [PR #28800](https://github.com/BerriAI/litellm/pull/28800)
- **[Datadog](../../docs/proxy/logging#datadog)**
  - Split oversized batches on a 413 instead of re-queueing forever - [PR #29444](https://github.com/BerriAI/litellm/pull/29444)
- **Galileo**
  - the ingest-traces API 및 the standard logging payload 사용 - [PR #29651](https://github.com/BerriAI/litellm/pull/29651)
- **OpenTelemetry**
  - Allowlist `team_metadata` sub-keys promoted to baggage - [PR #29442](https://github.com/BerriAI/litellm/pull/29442)
  - MCP semantic conventions to OTel v2 추가 - [PR #29468](https://github.com/BerriAI/litellm/pull/29468)
  - Capture 401 error details in management-endpoint spans - [PR #29535](https://github.com/BerriAI/litellm/pull/29535)
  - the missing MCP span attributes emit - [PR #29554](https://github.com/BerriAI/litellm/pull/29554)
  - a guardrail span on passthrough, including 때 a guardrail blocks emit - [PR #29552](https://github.com/BerriAI/litellm/pull/29552), [PR #29470](https://github.com/BerriAI/litellm/pull/29470)

### 가드레일

- **[Sensitive Data Routing](../../docs/proxy/guardrails/quick_start)**
  - sensitive data to on-premise models 라우팅 - [PR #29531](https://github.com/BerriAI/litellm/pull/29531)

## 비용 추적, Budgets 및 Rate Limiting

- NUL bytes from spend-log payloads to prevent PostgreSQL `22P05` errors 제거 - [PR #29515](https://github.com/BerriAI/litellm/pull/29515)
- Scope the session-token team-key budget exemption to a caller-supplied `team_id` - [PR #29641](https://github.com/BerriAI/litellm/pull/29641)

## MCP Gateway

- Per-server environment variables with global 및 per-user scopes - [PR #28917](https://github.com/BerriAI/litellm/pull/28917)
- Per-MCP-server RPM rate limiting for keys 및 teams - [PR #29482](https://github.com/BerriAI/litellm/pull/29482)
- MCP OAuth passthrough 및 issuer-scoped JWT auth 지원 - [PR #28356](https://github.com/BerriAI/litellm/pull/28356)
- Persist `oauth2_flow` on MCP server registration - [PR #29690](https://github.com/BerriAI/litellm/pull/29690)
- Clear `allowed_tools` 및 tool overrides on MCP server edit - [PR #29411](https://github.com/BerriAI/litellm/pull/29411)
- Gate `/public/mcp_hub` strictly on `litellm.public_mcp_servers` - [PR #27764](https://github.com/BerriAI/litellm/pull/27764)

## 성능 / 부하 분산 / 안정성 개선

- Native `/health/drain` preStop hook for graceful shutdown - [PR #29439](https://github.com/BerriAI/litellm/pull/29439)
- Disable proxy buffering on streaming SSE responses - [PR #29557](https://github.com/BerriAI/litellm/pull/29557)
- Populate `llm_provider` on internal rate-limit errors - [PR #27707](https://github.com/BerriAI/litellm/pull/27707)
- Hot-reload `.env` in dev 때 running with `--reload` - [PR #29783](https://github.com/BerriAI/litellm/pull/29783)
- Enable the Helm backend deployment to mount the gateway `config.yaml` - [PR #29605](https://github.com/BerriAI/litellm/pull/29605)
- Convert the AWS 및 GCP Terraform stacks into reusable modules - [PR #28103](https://github.com/BerriAI/litellm/pull/28103)
- Terraform GCP: abandon the SQL user on destroy - [PR #29855](https://github.com/BerriAI/litellm/pull/29855); prompt for `image_registry` in the DeployStack one-click - [PR #29852](https://github.com/BerriAI/litellm/pull/29852)
- Dependency bumps - [PR #29860](https://github.com/BerriAI/litellm/pull/29860)

## 문서 업데이트

- Clarify 때 to create new test files - [PR #29472](https://github.com/BerriAI/litellm/pull/29472)
- fixed dimensions from the README hero image 제거 - [PR #29496](https://github.com/BerriAI/litellm/pull/29496)
- CLAUDE.md nits - [PR #29504](https://github.com/BerriAI/litellm/pull/29504), [PR #29749](https://github.com/BerriAI/litellm/pull/29749)

### 담당 영역별 PR 요약

```
PRs by ownership area (visible, non-vehicle set; total: 101)
  - UI / Dashboard: 22
  - General Proxy (testing / CI / build): 22
  - Models & Providers: 13
  - Performance / Reliability: 10
  - Logging: 9
  - LLM API Endpoints: 8
  - MCP: 6
  - Auth & Management: 5
  - Agents (A2A): 4
  - Docs: 4
  - Spend / Budgets / Rate Limits: 2
  - Models & Providers (new providers): 3
  - Guardrails: 1
```

## 새 기여자

- @someswar177 made their first contribution in https://github.com/BerriAI/litellm/pull/26585
- @trexinc made their first contribution in https://github.com/BerriAI/litellm/pull/26597
- @navnitshukla made their first contribution in https://github.com/BerriAI/litellm/pull/26609
- @tanmay958 made their first contribution in https://github.com/BerriAI/litellm/pull/27580
- @samagana made their first contribution in https://github.com/BerriAI/litellm/pull/27810
- @DrishnaTrivedi made their first contribution in https://github.com/BerriAI/litellm/pull/28330
- @brainsparker made their first contribution in https://github.com/BerriAI/litellm/pull/28370
- @icep87 made their first contribution in https://github.com/BerriAI/litellm/pull/28846
- @adriangomez24 made their first contribution in https://github.com/BerriAI/litellm/pull/29097
- @zzw-math made their first contribution in https://github.com/BerriAI/litellm/pull/29325
- @BeginnerRudy made their first contribution in https://github.com/BerriAI/litellm/pull/29392
- @danisalvaa made their first contribution in https://github.com/BerriAI/litellm/pull/29394
- @kapelame made their first contribution in https://github.com/BerriAI/litellm/pull/29412
- @Zhao73 made their first contribution in https://github.com/BerriAI/litellm/pull/29419
- @suleimanelkhoury made their first contribution in https://github.com/BerriAI/litellm/pull/29420
- @aneeshsangvikar made their first contribution in https://github.com/BerriAI/litellm/pull/29427
- @Ar-maan05 made their first contribution in https://github.com/BerriAI/litellm/pull/29483
- @kingdoooo made their first contribution in https://github.com/BerriAI/litellm/pull/29490
- @dan2k3k4 made their first contribution in https://github.com/BerriAI/litellm/pull/29508
- @yanismiraoui made their first contribution in https://github.com/BerriAI/litellm/pull/29522
- @josx made their first contribution in https://github.com/BerriAI/litellm/pull/29532
- @1qh made their first contribution in https://github.com/BerriAI/litellm/pull/29561
- @tin-berri made their first contribution in https://github.com/BerriAI/litellm/pull/29605
- @mak2508 made their first contribution in https://github.com/BerriAI/litellm/pull/29606
- @VANDRANKI made their first contribution in https://github.com/BerriAI/litellm/pull/29620
- @andrey-dubnik made their first contribution in https://github.com/BerriAI/litellm/pull/29621
- @ErRickow made their first contribution in https://github.com/BerriAI/litellm/pull/29646
- @saswatds made their first contribution in https://github.com/BerriAI/litellm/pull/29650
- @Dinesh-Girbide made their first contribution in https://github.com/BerriAI/litellm/pull/29655
- @BWAAEEEK made their first contribution in https://github.com/BerriAI/litellm/pull/29660
- @hectorc98 made their first contribution in https://github.com/BerriAI/litellm/pull/29672
- @abhay23-AI made their first contribution in https://github.com/BerriAI/litellm/pull/29779

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.88.0...v1.89.0

---

## 06/10/2026

- New 모델 / Updated 모델: 16
- LLM API Endpoints: 12
- Management Endpoints / UI: 22
- AI Integrations (Logging / 가드레일): 10
- 비용 추적, Budgets 및 Rate Limiting: 2
- MCP Gateway: 6
- 성능 / 부하 분산 / 안정성 improvements: 10
- 일반 Proxy Improvements (testing / CI / build): 22
- 문서 업데이트: 4
