---
title: "v1.83.7-stable - Per-User MCP OAuth, Team Spend 로그 RBAC"
slug: "v1-83-7-stable"
date: 2026-04-18T00:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Ryan Crabbe
    title: Full Stack Engineer, LiteLLM
    url: https://www.linkedin.com/in/ryan-crabbe-0b9687214
    image_url: https://github.com/ryan-crabbe.png
  - name: Yuneng Jiang
    title: Senior Full Stack Engineer, LiteLLM
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
  - name: Shivam Rawat
    title: Forward Deployed Engineer, LiteLLM
    url: https://linkedin.com/in/shivam-rawat-482937318
    image_url: https://github.com/shivamrawat1.png
hide_table_of_contents: false
---

## 이 버전 배포하기

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:main-v1.83.7-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.83.7
```

</TabItem>
</Tabs>

:::warning

**호환성 변경 — Prometheus 지연 시간 히스토그램 버킷이 줄었습니다.** Prometheus 카디널리티를 낮추기 위해 기본 `LATENCY_BUCKETS` 집합이 35개 경계에서 18개 경계로 축소되었습니다. 특정 `le=` 버킷 값을 참조하는 대시보드와 PromQL 쿼리는 더 이상 매칭되지 않을 수 있습니다. 업그레이드 전에 알림과 대시보드를 검토하고, 필요하면 `LATENCY_BUCKETS` env override로 이전 경계를 복원하세요 — [PR #25527](https://github.com/BerriAI/litellm/pull/25527).

:::

## 주요 하이라이트

- **사용자별 MCP OAuth Tokens** — [각 최종 사용자가 interactive MCP 서버 플로우에서 자신의 OAuth tokens를 보유할 수 있어 사용자 간 자격 증명이 격리됩니다](../../docs/mcp)
- **Team Spend 로그 RBAC** — `/spend/logs` 권한이 있는 Teams는 UI와 API에서 팀 전체 spend logs를 볼 수 있습니다
- **Bulk Team Permissions API** — 여러 팀의 멤버 권한을 한 번의 호출로 업데이트하는 새 `POST /team/permissions_bulk_update` endpoint입니다
- **Azure Container Routing** — Azure Responses API containers를 위한 container routing, managed container IDs, delete-response parsing을 추가했습니다
- **UI E2E Test Suite** — proxy admin, team, key management 플로우에 대한 Playwright 기반 end-to-end tests가 이제 CI에서 실행됩니다

---

## 신규 모델 / 업데이트된 모델

#### 신규 모델 지원 (신규 모델 14개)

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| AWS Bedrock (GovCloud) 지원 | `bedrock/us-gov-east-1/anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.30 | $16.50 | Chat, vision, 도구 사용, prompt caching, reasoning 지원 |
| AWS Bedrock (GovCloud) 지원 | `bedrock/us-gov-west-1/anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.30 | $16.50 | Chat, vision, 도구 사용, prompt caching, reasoning 지원 |
| AWS Bedrock (GovCloud) | `us-gov.anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.30 | $16.50 | Bedrock Converse, 200K 초과 tier pricing 포함 |
| Baseten | `baseten/MiniMaxAI/MiniMax-M2.5` | - | $0.30 | $1.20 | Chat |
| Baseten | `baseten/nvidia/Nemotron-120B-A12B` | - | $0.30 | $0.75 | Chat |
| Baseten | `baseten/zai-org/GLM-5` | - | $0.95 | $3.15 | Chat |
| Baseten | `baseten/zai-org/GLM-4.7` | - | $0.60 | $2.20 | Chat |
| Baseten | `baseten/zai-org/GLM-4.6` | - | $0.60 | $2.20 | Chat |
| Baseten | `baseten/moonshotai/Kimi-K2.5` | - | $0.60 | $3.00 | Chat |
| Baseten | `baseten/moonshotai/Kimi-K2-Thinking` | - | $0.60 | $2.50 | Chat |
| Baseten | `baseten/moonshotai/Kimi-K2-Instruct-0905` | - | $0.60 | $2.50 | Chat |
| Baseten | `baseten/openai/gpt-oss-120b` | - | $0.10 | $0.50 | Chat |
| Baseten | `baseten/deepseek-ai/DeepSeek-V3.1` | - | $0.50 | $1.50 | Chat |
| Baseten | `baseten/deepseek-ai/DeepSeek-V3-0324` | - | $0.77 | $0.77 | Chat |

#### 기능

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - AWS GovCloud mode 지원 (`us-gov` prefix routing) - [PR #25254](https://github.com/BerriAI/litellm/pull/25254)
    - GovCloud Claude Sonnet 4.5 pricing을 업데이트하고, `max_tokens`를 8192로 올리며, prompt-caching 비용을 추가했습니다
    - assistant prefix prefill이 설정된 경우 더미 `user` continue message를 건너뜁니다 - [PR #25419](https://github.com/BerriAI/litellm/pull/25419)
    - Anthropic Messages streaming usage에서 cache tokens가 중복 집계되지 않도록 했습니다 - [PR #25517](https://github.com/BerriAI/litellm/pull/25517)
- **[Anthropic](../../docs/providers/anthropic)**
    - `advisor_20260301` tool type을 지원합니다 - [PR #25525](https://github.com/BerriAI/litellm/pull/25525)
- **[Triton](../../docs/providers/triton-inference-server)**
    - self-hosted Triton responses를 위한 embedding usage estimation을 추가했습니다 - [PR #25345](https://github.com/BerriAI/litellm/pull/25345)
- **[Baseten](../../docs/providers/baseten)**
    - 신규 Baseten-hosted models 11개에 대한 pricing entries를 추가했습니다 - [PR #25358](https://github.com/BerriAI/litellm/pull/25358)
- **[Google Gemini / Vertex AI](../../docs/providers/gemini)**
    - 해당 Gemini 2.5/3 models에 `supports_service_tier`를 표시했습니다

### 버그 수정

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Bedrock JSON body와 multipart uploads의 pass-through 문제를 수정했습니다 - [PR #25464](https://github.com/BerriAI/litellm/pull/25464)
- **[OpenAI](../../docs/providers/openai)**
    - tests 안정화를 위해 `test_completion_fine_tuned_model`에서 headers를 mock 처리했습니다 - [PR #25444](https://github.com/BerriAI/litellm/pull/25444)

## LLM API Endpoints

#### 기능

- **[Responses API](../../docs/response_api)**
    - Containers: Azure routing, managed container IDs, delete-response parsing을 추가했습니다 - [PR #25287](https://github.com/BerriAI/litellm/pull/25287)
    - WebSocket: model selection이 올바르게 라우팅되도록 backend WebSocket URL에 `?model=`을 추가합니다 - [PR #25437](https://github.com/BerriAI/litellm/pull/25437)
- **[OpenAI / Files API](../../docs/providers/openai)**
    - OpenAI와 관련 utilities에 file content streaming support를 추가했습니다 - [PR #25450](https://github.com/BerriAI/litellm/pull/25450)
- **[A2A](../../docs/mcp)**
    - A2A client 생성 시 기본 60초 timeout을 적용합니다 - [PR #25514](https://github.com/BerriAI/litellm/pull/25514)

#### 버그

- **[Responses API](../../docs/response_api)**
    - streaming에서 refusal `stop_reason`을 `incomplete` status로 매핑합니다 - [PR #25498](https://github.com/BerriAI/litellm/pull/25498)
    - Responses WebSocket path의 duplicate keyword argument 오류를 수정했습니다 - [PR #25513](https://github.com/BerriAI/litellm/pull/25513)
- **Router**
    - prefix가 없는 model names에 대해 `custom_llm_provider`를 `get_llm_provider`로 전달합니다 - [PR #25334](https://github.com/BerriAI/litellm/pull/25334)
    - `encrypted_content_affinity`가 활성화된 경우 tag-based routing을 수정했습니다 - [PR #25347](https://github.com/BerriAI/litellm/pull/25347)
- **General**
    - web-search interception에서 `stream=True`일 때 spend/cost logging이 실행되도록 보장했습니다 - [PR #25424](https://github.com/BerriAI/litellm/pull/25424)

## 관리 Endpoints / UI

#### 기능

- **팀과 조직**
    - 여러 teams에 걸쳐 bulk permission updates를 수행하는 새 `POST /team/permissions_bulk_update` endpoint를 추가했습니다 - [PR #25239](https://github.com/BerriAI/litellm/pull/25239)
    - team-wide spend logs를 보기 위한 team member permission `/spend/logs`를 추가했습니다 (UI + RBAC) - [PR #25458](https://github.com/BerriAI/litellm/pull/25458)
    - org와 team endpoint permission checks를 정렬했습니다 - [PR #25554](https://github.com/BerriAI/litellm/pull/25554)
- **가상 키**
    - `/v2/key/info` response handling을 v1과 맞췄습니다 - [PR #25313](https://github.com/BerriAI/litellm/pull/25313)
- **인증 / Routing**
    - global OAuth2 enablement 없이도 JWT가 OAuth2 routing을 override할 수 있게 했습니다 - [PR #25252](https://github.com/BerriAI/litellm/pull/25252)
    - UI와 API tokens를 위한 route auth를 통합했습니다 - [PR #25473](https://github.com/BerriAI/litellm/pull/25473)
    - `combined_view` token lookup에 parameterized query를 사용합니다 - [PR #25467](https://github.com/BerriAI/litellm/pull/25467)
- **Provider 자격 증명**
    - `model_config` metadata를 통해 per-team / per-project credential overrides를 지원합니다 - [PR #24438](https://github.com/BerriAI/litellm/pull/24438)
- **UI**
    - browser storage handling과 Dockerfile consistency를 개선했습니다 - [PR #25384](https://github.com/BerriAI/litellm/pull/25384)
    - v1 guardrail 및 agent list responses를 v2 field handling과 맞췄습니다 - [PR #25478](https://github.com/BerriAI/litellm/pull/25478)
    - `user_edit_view` tests에서 Tremor Tooltip timers를 flush 처리했습니다 - [PR #25480](https://github.com/BerriAI/litellm/pull/25480)

#### 버그

- management endpoints의 input validation을 개선했습니다 - [PR #25445](https://github.com/BerriAI/litellm/pull/25445)
- skill archive extraction의 file path resolution을 강화했습니다 - [PR #25475](https://github.com/BerriAI/litellm/pull/25475)

## AI Integrations

### Logging

- **[Ramp](../../docs/proxy/logging)**
    - Ramp를 built-in success callback으로 추가했습니다 - [PR #23769](https://github.com/BerriAI/litellm/pull/23769)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - `/v1/messages` Langfuse traces에서 proxy key-auth metadata를 보존합니다 - [PR #25448](https://github.com/BerriAI/litellm/pull/25448)
- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - 기본 `LATENCY_BUCKETS`를 35개에서 18개 경계로 줄였습니다 (위 호환성 변경 참고) - [PR #25527](https://github.com/BerriAI/litellm/pull/25527)
- **General**
    - S3 logging: 일시적 503/500 errors에 대해 exponential backoff로 retry합니다 - [PR #25530](https://github.com/BerriAI/litellm/pull/25530)

### 가드레일

- unified guardrail inputs에서 system message를 선택적으로 건너뛸 수 있게 했습니다 - [PR #25481](https://github.com/BerriAI/litellm/pull/25481)
- Inline IAM: apply guardrail을 지원합니다 - [PR #25241](https://github.com/BerriAI/litellm/pull/25241)
- guardrail errors에서 `dict` `HTTPException.detail`과 Bedrock context를 보존합니다 - [PR #25558](https://github.com/BerriAI/litellm/pull/25558)

## 비용 추적, 예산 및 속도 제한

- spend / error log queries에서 session-TZ-independent date filtering을 적용했습니다 - [PR #25542](https://github.com/BerriAI/litellm/pull/25542)
- 300K+ row updates를 방지하기 위해 stale managed-object cleanup에 batch limit을 적용했습니다 - [PR #25258](https://github.com/BerriAI/litellm/pull/25258)

## MCP Gateway

- **interactive MCP flows를 위한 per-user OAuth token storage** - [PR #25441](https://github.com/BerriAI/litellm/pull/25441)
- MCP `stdio` transport를 통한 arbitrary command execution을 차단했습니다 - [PR #25343](https://github.com/BerriAI/litellm/pull/25343)
- 저장된 per-user token이 없을 때 PKCE-triggering 401을 복원했습니다 - [commit e0d5c28](https://github.com/BerriAI/litellm/commit/e0d5c28db02b3219dbd944666a55f49732197922)
- `config_settings`에 누락된 MCP per-user token environment variables를 문서화했습니다 - [PR #25471](https://github.com/BerriAI/litellm/pull/25471)

## 성능 / Loadbalancing / Reliability 개선

- Prometheus latency histogram cardinality를 줄였습니다 (기본 buckets 35 → 18) - [PR #25527](https://github.com/BerriAI/litellm/pull/25527)
- 일시적 errors에 대해 exponential backoff를 사용하는 S3 retry를 추가했습니다 - [PR #25530](https://github.com/BerriAI/litellm/pull/25530)

## 문서 업데이트

- cosign verification과 deployment best practices를 다루는 Docker Image Security Guide를 추가했습니다 - [PR #25439](https://github.com/BerriAI/litellm/pull/25439)
- April townhall announcements를 문서화했습니다 - [PR #25537](https://github.com/BerriAI/litellm/pull/25537)
- 누락된 MCP per-user token env vars를 문서화했습니다 - [PR #25471](https://github.com/BerriAI/litellm/pull/25471)
- PR template에 "Screenshots / Proof of Fix" 섹션을 추가했습니다 - [PR #25564](https://github.com/BerriAI/litellm/pull/25564)

## Infrastructure / Security 참고

- cosign.pub verification을 initial commit hash에 고정했습니다 - [PR #25273](https://github.com/BerriAI/litellm/pull/25273)
- Dockerfile에서 npm upgrade 후 node-gyp symlink path를 수정했습니다 - [PR #25048](https://github.com/BerriAI/litellm/pull/25048)
- `Dockerfile.non_root`: 누락된 `.npmrc`를 graceful하게 처리합니다 - [PR #25307](https://github.com/BerriAI/litellm/pull/25307)
- local PostgreSQL을 사용하는 Playwright E2E tests를 추가했습니다 - [PR #25126](https://github.com/BerriAI/litellm/pull/25126)
- proxy admin team 및 key management를 위한 UI E2E tests를 추가했습니다 - [PR #25365](https://github.com/BerriAI/litellm/pull/25365)
- Redis caching tests를 GHA에서 CircleCI로 마이그레이션했습니다 - [PR #25354](https://github.com/BerriAI/litellm/pull/25354)
- `_expire_stale_rows`에 맞춰 `check_responses_cost` tests를 업데이트했습니다 - [PR #25299](https://github.com/BerriAI/litellm/pull/25299)
- global vitest timeout을 늘리고 per-test overrides를 제거했습니다 - [PR #25468](https://github.com/BerriAI/litellm/pull/25468)
- Version bumps 및 UI rebuilds: [PR #25316](https://github.com/BerriAI/litellm/pull/25316), [PR #25528](https://github.com/BerriAI/litellm/pull/25528), [PR #25578](https://github.com/BerriAI/litellm/pull/25578), [PR #25571](https://github.com/BerriAI/litellm/pull/25571), [PR #25573](https://github.com/BerriAI/litellm/pull/25573), [PR #25577](https://github.com/BerriAI/litellm/pull/25577)

## 신규 기여자

* @kedarthakkar 님이 https://github.com/BerriAI/litellm/pull/23769 에서 첫 기여를 했습니다
* @csoni-cweave made their first contribution in https://github.com/BerriAI/litellm/pull/25441
* @jimmychen-p72 made their first contribution in https://github.com/BerriAI/litellm/pull/25530

**Full 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.83.3-stable...v1.83.7-stable
