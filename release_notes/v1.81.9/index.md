---
title: "v1.81.9 - 인터넷에 노출할 MCP 서버 제어"
slug: "v1-81-9"
date: 2026-02-07T00:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
hide_table_of_contents: false
---

:::info 안정 릴리스 브랜치

이제 각 안정 릴리스마다 해당 버전에 맞춰 `litellm_stable_release_branch_x_xx_xx` 형식의 전용 브랜치를 유지합니다.

이를 통해 day 0 모델 출시 시 패치를 더 쉽게 적용할 수 있습니다.

**v1.81.9 브랜치:** [litellm_stable_release_branch_1_81_9](https://github.com/BerriAI/litellm/tree/litellm_stable_release_branch_1_81_9)

:::

## 이 버전 배포하기 {#deploy-this-version}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-v1.81.9-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.81.9
```

</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

- **Claude Opus 4.6** - [adaptive thinking 및 1M context window와 함께 Anthropic, AWS Bedrock, Azure AI, Vertex AI 전반을 완전히 지원](../../blog/claude_opus_4_6)
- **A2A Agent Gateway** - [표준 `/chat/completions` API를 통해 A2A (Agent-to-Agent) 등록 에이전트 호출](../../docs/a2a_invoking_agents)
- **공개 인터넷에 MCP 서버 노출** - [인터넷 대상 배포를 위해 public/private visibility와 IP 기반 access control로 MCP 서버 실행](../../docs/mcp_public_internet)
- **UI 팀 Soft Budget 알림** - [요청을 차단하지 않고 팀에 soft budget을 설정하고 지출이 임계값을 넘으면 이메일 알림 수신](../../docs/proxy/ui_team_soft_budget_alerts)
- **성능 최적화** - Prometheus CPU 약 40% 감소, LRU 캐싱, 최적화된 로깅 경로를 포함한 여러 성능 개선
- **`LiteLLM Observatory`** - [자동화된 24시간 부하 테스트](../../blog/litellm-observatory)
- **Callback이 많은 배포에서 요청 처리 30% 향상** - [callback이 많은 배포를 위한 성능 개선][PR #20354](https://github.com/BerriAI/litellm/pull/20354)

---

## Callback이 많은 배포에서 요청 처리 30% 향상 {#30-faster-request-processing-for-callback-heavy-deployments}

 Langfuse, Datadog, Prometheus 같은 로깅 callback을 사용하는 경우, callback 목록이 바뀌지 않았는데도 모든 요청마다 callback을 다시 정렬하는 세 개의 루프 때문에 불필요한 비용이 발생했습니다. 설정한 callback이 많을수록 낭비되는 시간이 커졌습니다. 이 작업을 모든 요청마다 수행하지 않고 시작 시 한 번만 수행하도록 옮겼습니다. 기본 callback 세트를 사용하는 배포에서는 요청 설정 속도가 약 30% 향상됩니다. callback을 많이 설정한 배포에서는 개선 폭이 더 큽니다.

---

## `LiteLLM Observatory` {#litellm-observatory}

LiteLLM Observatory는 회귀가 사용자에게 도달하기 전에 잡아내기 위해 만든 장기 실행 릴리스 검증 시스템입니다. 이 시스템은 확장 가능하도록 설계되어 새 테스트를 추가하고, 모델과 실패 임계값을 구성하고, 어떤 배포에 대해서도 실행을 대기열에 넣을 수 있습니다. 목표는 이러한 테스트를 통해 LiteLLM 기능을 100% 커버하는 것입니다. 모든 릴리스 전에 프로덕션 배포를 대상으로 24시간 부하 테스트를 실행해, 지속 부하에서만 나타나는 리소스 수명 주기 버그, OOM, CPU 회귀 같은 문제를 드러냅니다.

---

## 공개 인터넷의 MCP 서버 {#mcp-servers-on-the-public-internet}

이번 릴리스는 public/private visibility와 IP 기반 access control을 추가해 MCP 서버를 공개 인터넷에 안전하게 노출할 수 있게 합니다. 이제 신뢰할 수 있는 네트워크로 접근을 제한하고 내부 도구는 비공개로 유지하면서, 인터넷 대상 MCP 서비스를 실행할 수 있습니다.

[시작하기](../../docs/mcp_public_internet)

<Image
img={require('../../img/release_notes/mcp_internet.png')}
style={{ maxWidth: '900px', width: '100%' }}
/>

## UI 팀 Soft Budget 알림 {#ui-team-soft-budget-alerts}

요청을 차단하지 않고, 어느 팀에든 soft budget을 설정해 지출이 임계값을 넘으면 이메일 알림을 받을 수 있습니다. proxy 재시작 없이 관리자 UI에서 임계값과 알림 이메일을 직접 구성합니다.

[시작하기](../../docs/proxy/ui_team_soft_budget_alerts)

<Image
img={require('../../img/ui_team_soft_budget_alerts.png')}
style={{ maxWidth: '900px', width: '100%' }}
/>

자세히 살펴보겠습니다.

---

## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

#### 신규 모델 지원 (새 모델 13개) {#new-model-support-13-new-models}

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) |
| -------- | ----- | -------------- | ------------------- | -------------------- |
| Anthropic | `claude-opus-4-6` | 1M | $5.00 | $25.00 |
| AWS Bedrock | `anthropic.claude-opus-4-6-v1` | 1M | $5.00 | $25.00 |
| Azure AI | `azure_ai/claude-opus-4-6` | 200K | $5.00 | $25.00 |
| Vertex AI | `vertex_ai/claude-opus-4-6` | 1M | $5.00 | $25.00 |
| Google Gemini | `gemini/deep-research-pro-preview-12-2025` | 65K | $2.00 | $12.00 |
| Vertex AI | `vertex_ai/deep-research-pro-preview-12-2025` | 65K | $2.00 | $12.00 |
| Moonshot | `moonshot/kimi-k2.5` | 262K | $0.60 | $3.00 |
| OpenRouter | `openrouter/qwen/qwen3-235b-a22b-2507` | 262K | $0.07 | $0.10 |
| OpenRouter | `openrouter/qwen/qwen3-235b-a22b-thinking-2507` | 262K | $0.11 | $0.60 |
| Together AI | `together_ai/zai-org/GLM-4.7` | 200K | $0.45 | $2.00 |
| Together AI | `together_ai/moonshotai/Kimi-K2.5` | 256K | $0.50 | $2.80 |
| ElevenLabs | `elevenlabs/eleven_v3` | - | $0.18/1K chars | - |
| ElevenLabs | `elevenlabs/eleven_multilingual_v2` | - | $0.18/1K chars | - |

#### 기능 {#features}

- **[Anthropic](../../docs/providers/anthropic)**
    - 모든 리전(us, eu, apac, au)에서 adaptive thinking과 함께 Claude Opus 4.6 완전 지원 - [PR #20506](https://github.com/BerriAI/litellm/pull/20506), [PR #20508](https://github.com/BerriAI/litellm/pull/20508), [PR #20514](https://github.com/BerriAI/litellm/pull/20514), [PR #20551](https://github.com/BerriAI/litellm/pull/20551)
    - reasoning content를 anthropic thinking block에 매핑(streaming + non-streaming) - [PR #20254](https://github.com/BerriAI/litellm/pull/20254)

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - long-context 모델에 1시간 tiered caching 비용 추가 - [PR #20214](https://github.com/BerriAI/litellm/pull/20214)
    - Bedrock Claude 4.5 모델의 prompt caching에서 TTL(1h) 필드 지원 - [PR #20338](https://github.com/BerriAI/litellm/pull/20338)
    - Nova Sonic speech-to-speech 모델 지원 추가 - [PR #20244](https://github.com/BerriAI/litellm/pull/20244)
    - Converse API의 빈 assistant message 수정 - [PR #20390](https://github.com/BerriAI/litellm/pull/20390)
    - content blocked 처리 수정 - [PR #20606](https://github.com/BerriAI/litellm/pull/20606)

- **[Google Gemini / Vertex AI](../../docs/providers/gemini)**
    - Gemini Deep Research 모델 지원 추가 - [PR #20406](https://github.com/BerriAI/litellm/pull/20406)
    - Vertex AI Gemini streaming `content_filter` 처리 수정 - [PR #20105](https://github.com/BerriAI/litellm/pull/20105)
    - Vertex AI/Gemini 모델에서 `web_search`에 OpenAI 스타일 tools 사용 허용 - [PR #20280](https://github.com/BerriAI/litellm/pull/20280)
    - Gemini 및 Vertex AI 모델의 `supports_native_streaming` 수정 - [PR #20408](https://github.com/BerriAI/litellm/pull/20408)
    - file IDs의 responses tools 매핑 추가 - [PR #20402](https://github.com/BerriAI/litellm/pull/20402)

- **[Cohere](../../docs/providers/cohere)**
    - Cohere embed v4의 `dimensions` param 지원 - [PR #20235](https://github.com/BerriAI/litellm/pull/20235)

- **[Cerebras](../../docs/providers/cerebras)**
    - GPT OSS Cerebras의 reasoning param 지원 추가 - [PR #20258](https://github.com/BerriAI/litellm/pull/20258)

- **[Moonshot](../../docs/providers/moonshot)**
    - Kimi K2.5 모델 항목 추가 - [PR #20273](https://github.com/BerriAI/litellm/pull/20273)

- **[OpenRouter](../../docs/providers/openrouter)**
    - Qwen3-235B 모델 추가 - [PR #20455](https://github.com/BerriAI/litellm/pull/20455)

- **[Together AI](../../docs/providers/togetherai)**
    - GLM-4.7 및 Kimi-K2.5 모델 추가 - [PR #20319](https://github.com/BerriAI/litellm/pull/20319)

- **[ElevenLabs](../../docs/providers/elevenlabs)**
    - `eleven_v3` 및 `eleven_multilingual_v2` TTS 모델 추가 - [PR #20522](https://github.com/BerriAI/litellm/pull/20522)

- **[Vercel AI Gateway](../../docs/providers/vercel_ai_gateway)**
    - 모델에 누락된 capability flag 추가 - [PR #20276](https://github.com/BerriAI/litellm/pull/20276)

- **[GitHub Copilot](../../docs/providers/github_copilot)**
    - system prompt가 누락되는 문제 수정 및 필요한 Copilot header 자동 추가 - [PR #20113](https://github.com/BerriAI/litellm/pull/20113)

- **[GigaChat](../../docs/providers/gigachat)**
    - GigaChat provider에서 연속 user message가 잘못 병합되는 문제 수정 - [PR #20341](https://github.com/BerriAI/litellm/pull/20341)

- **[xAI](../../docs/providers/xai_realtime)**
    - xAI `/realtime` API 지원 추가 - LiveKit SDK와 함께 동작 - [PR #20381](https://github.com/BerriAI/litellm/pull/20381)

- **[OpenAI](../../docs/providers/openai)**
    - `gpt-5-search-api` 모델 및 문서 설명 추가 - [PR #20512](https://github.com/BerriAI/litellm/pull/20512)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - `provider_specific_fields`의 extra inputs not permitted 오류 수정 - [PR #20334](https://github.com/BerriAI/litellm/pull/20334)

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Managed Batches의 list 및 cancel batches에서 일관되지 않은 상태 관리 수정 - [PR #20331](https://github.com/BerriAI/litellm/pull/20331)

- **[OpenAI Embeddings](../../docs/providers/openai)**
    - `open_ai_embedding_models`의 `custom_llm_provider`가 None이 되도록 수정 - [PR #20253](https://github.com/BerriAI/litellm/pull/20253)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Messages API](../../docs/providers/anthropic)**
    - non-Anthropic provider에 대해 지원되지 않는 Claude Code beta header 필터링 - [PR #20578](https://github.com/BerriAI/litellm/pull/20578)
    - non-Anthropic provider 사용 시 `anthropic.messages.acreate()`의 일관되지 않은 응답 형식 수정 - [PR #20442](https://github.com/BerriAI/litellm/pull/20442)
    - Claude Code "route not found" 오류를 일으키던 `/api/event_logging/batch` 엔드포인트의 404 수정 - [PR #20504](https://github.com/BerriAI/litellm/pull/20504)

- **[A2A Agent Gateway](../../docs/a2a)**
    - LiteLLM `/chat/completions` API를 통해 A2A agent 호출 허용 - [PR #20358](https://github.com/BerriAI/litellm/pull/20358)
    - `/chat/completions`에서 A2A 등록 에이전트 사용 - [PR #20362](https://github.com/BerriAI/litellm/pull/20362)
    - agent card에 localhost/internal URL이 있는 상태로 배포된 A2A agent 수정 - [PR #20604](https://github.com/BerriAI/litellm/pull/20604)

- **[Files API](../../docs/providers/gemini)**
    - Gemini에서 file_id를 통한 delete 및 GET 지원 추가 - [PR #20329](https://github.com/BerriAI/litellm/pull/20329)

- **일반**
    - User-Agent 사용자 지정 지원 추가 - [PR #19881](https://github.com/BerriAI/litellm/pull/19881)
    - per-request router 사용 시 search tools를 찾지 못하는 문제 수정 - [PR #19818](https://github.com/BerriAI/litellm/pull/19818)
    - chat에서 extra header 전달 - [PR #20386](https://github.com/BerriAI/litellm/pull/20386)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **SSO 설정**
    - SSO config team mappings - [PR #20111](https://github.com/BerriAI/litellm/pull/20111)
    - UI - SSO: team mappings 추가 - [PR #20299](https://github.com/BerriAI/litellm/pull/20299)
    - Keycloak 호환성을 위해 JWT access token에서 user role 추출 - [PR #20591](https://github.com/BerriAI/litellm/pull/20591)

- **Auth / SDK**
    - SDK의 자동 OAuth2/JWT token 관리를 위한 `proxy_auth` 추가 - [PR #20238](https://github.com/BerriAI/litellm/pull/20238)

- **가상 키**
    - Key `reset_spend` endpoint - [PR #20305](https://github.com/BerriAI/litellm/pull/20305)
    - UI - Keys: key info 및 edit page로 이동 가능한 route 추가 - [PR #20369](https://github.com/BerriAI/litellm/pull/20369)
    - Key info endpoint object permission data 추가 - [PR #20407](https://github.com/BerriAI/litellm/pull/20407)
    - Keys 및 Teams Router 설정 + Router 설정 override 허용 - [PR #20205](https://github.com/BerriAI/litellm/pull/20205)

- **팀 및 예산**
    - Team Table 및 Create/Update Endpoints에 `soft_budget` 추가 - [PR #20530](https://github.com/BerriAI/litellm/pull/20530)
    - 팀 Soft Budget 이메일 알림 - [PR #20553](https://github.com/BerriAI/litellm/pull/20553)
    - UI - Team Settings: Soft Budget 및 알림 이메일 - [PR #20634](https://github.com/BerriAI/litellm/pull/20634)
    - UI - User Budget Page: Unlimited Budget 체크박스 - [PR #20380](https://github.com/BerriAI/litellm/pull/20380)
    - `/user/update`에서 `max_budget` reset 허용 - [PR #20375](https://github.com/BerriAI/litellm/pull/20375)

- **UI 개선**
    - Default Team Settings: 재사용 가능한 Model Select를 사용하도록 마이그레이션 - [PR #20310](https://github.com/BerriAI/litellm/pull/20310)
    - Navbar: 커뮤니티 engagement button 숨김 옵션 - [PR #20308](https://github.com/BerriAI/litellm/pull/20308)
    - 모델 health page에 team alias 표시 - [PR #20359](https://github.com/BerriAI/litellm/pull/20359)
    - Admin Settings: public AI Hub용 인증 옵션 추가 - [PR #20444](https://github.com/BerriAI/litellm/pull/20444)
    - user timezone에 맞춰 daily spend date filtering 조정 - [PR #20472](https://github.com/BerriAI/litellm/pull/20472)

- **SCIM**
    - SCIM resource discovery를 위한 기본 `/scim/v2` endpoint 추가 - [PR #20301](https://github.com/BerriAI/litellm/pull/20301)

- **Proxy CLI**
    - RDS IAM auth용 CLI arguments 추가 - [PR #20437](https://github.com/BerriAI/litellm/pull/20437)

#### 버그 {#bugs}

- UI login에서 접근을 막던 불필요한 key blocking 제거 - [PR #20210](https://github.com/BerriAI/litellm/pull/20210)
- UI - Team Settings: Global Guardrail Persistence 비활성화 - [PR #20307](https://github.com/BerriAI/litellm/pull/20307)
- UI - Model Info Page: Input 및 Output label 수정 - [PR #20462](https://github.com/BerriAI/litellm/pull/20462)
- UI - Model Page: 작은 화면에서 column resizing 수정 - [PR #20599](https://github.com/BerriAI/litellm/pull/20599)
- `/key/list` `user_id` 빈 문자열 edge case 수정 - [PR #20623](https://github.com/BerriAI/litellm/pull/20623)
- UI crash 방지를 위해 model, agent, MCP hub data에 array type check 추가 - [PR #20469](https://github.com/BerriAI/litellm/pull/20469)
- daily table의 unique constraint 및 update 실패 시 logging 수정 - [PR #20394](https://github.com/BerriAI/litellm/pull/20394)

---

## Logging / Guardrail / Prompt Management 통합 {#logging--guardrail--prompt-management-integrations}

#### 버그 수정 (3건) {#bug-fixes-3-fixes}

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - span에 null attribute가 포함될 때 Langfuse OTEL trace export가 실패하는 문제 수정 - [PR #20382](https://github.com/BerriAI/litellm/pull/20382)

- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - error rate 오계산을 유발하던 잘못된 failure metrics label 수정 - [PR #20152](https://github.com/BerriAI/litellm/pull/20152)

- **[Slack Alerts](../../docs/proxy/alerting)**
    - 특정 budget threshold 구성에서 Slack alert delivery가 실패하는 문제 수정 - [PR #20257](https://github.com/BerriAI/litellm/pull/20257)

#### 가드레일 (업데이트 7건) {#가드레일-7-updates}

- **Custom Code 가드레일**
    - custom code guardrails에 HTTP 지원 추가 + MCP용 unified guardrails + Agent guardrail 지원 - [PR #20619](https://github.com/BerriAI/litellm/pull/20619)
    - Custom Code 가드레일 UI Playground - [PR #20377](https://github.com/BerriAI/litellm/pull/20377)

- **Team Bring-Your-Own 가드레일**
    - team 기반 isolation guardrails management 구현 - [PR #20318](https://github.com/BerriAI/litellm/pull/20318)

- **[OpenAI Moderations](../../docs/apply_guardrail)**
    - OpenAI Moderations Guard가 OpenAI Embeddings와 함께 동작하도록 보장 - [PR #20523](https://github.com/BerriAI/litellm/pull/20523)

- **[GraySwan / Cygnal](../../docs/apply_guardrail)**
    - GraySwan의 fail-open 수정 및 Cygnal API endpoint에 metadata 전달 - [PR #19837](https://github.com/BerriAI/litellm/pull/19837)

- **일반**
    - guardrail input 전에 `model_response_choices` 확인 - [PR #19784](https://github.com/BerriAI/litellm/pull/19784)
    - guardrail-sampled chunk에서 streaming content 보존 - [PR #20027](https://github.com/BerriAI/litellm/pull/20027)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

- **0 cost model 지원** - internal/free-tier 모델을 위한 zero-cost model entry 허용 - [PR #20249](https://github.com/BerriAI/litellm/pull/20249)

---

## MCP Gateway (업데이트 9건) {#mcp-gateway-9-updates}

- **MCP Semantic Filtering** - LLM 호출 시 tool sprawl을 줄이기 위해 semantic similarity로 MCP tool 필터링 - [PR #20296](https://github.com/BerriAI/litellm/pull/20296), [PR #20316](https://github.com/BerriAI/litellm/pull/20316)
- **UI - MCP Semantic Filtering** - UI에서 MCP Semantic Filtering 구성 지원 추가 - [PR #20454](https://github.com/BerriAI/litellm/pull/20454)
- **MCP IP-Based Access Control** - IP 기반 제한으로 MCP 서버를 인터넷에서 사용 가능한 private/public 상태로 설정 - [PR #20607](https://github.com/BerriAI/litellm/pull/20607), [PR #20620](https://github.com/BerriAI/litellm/pull/20620)
- **MCP "Session not found" 오류 수정** - VSCode reconnect 시 발생하던 문제 수정 - [PR #20298](https://github.com/BerriAI/litellm/pull/20298)
- **OAuth2 'Capabilities: none' 버그 수정** - upstream MCP server용 수정 - [PR #20602](https://github.com/BerriAI/litellm/pull/20602)
- **Config Defined Search Tools 포함** - `/search_tools/list`에 포함 - [PR #20371](https://github.com/BerriAI/litellm/pull/20371)
- **UI - Search Tools**: Config Defined Search Tools 표시 - [PR #20436](https://github.com/BerriAI/litellm/pull/20436)
- **MCP permission 강제 적용 보장** - JWT Auth 사용 시 적용 - [PR #20383](https://github.com/BerriAI/litellm/pull/20383)
- **`gcs_bucket_name` 전달 오류 수정** - MCP server storage configuration에 올바르게 전달되도록 수정 - [PR #20491](https://github.com/BerriAI/litellm/pull/20491)

---

## 성능 / Loadbalancing / Reliability 개선 (14건) {#performance--loadbalancing--reliability-improvements-14-improvements}

- **Prometheus CPU 약 40% 감소** - budget metrics 병렬화, caching bug 수정, CPU 사용량 감소 - [PR #20544](https://github.com/BerriAI/litellm/pull/20544)
- **closed client 오류 방지** - httpx client caching을 되돌려 방지 - [PR #20025](https://github.com/BerriAI/litellm/pull/20025)
- **불필요한 Router 생성 회피** - model 또는 search tool이 구성되지 않은 경우 적용 - [PR #20661](https://github.com/BerriAI/litellm/pull/20661)
- **`wrapper_async` 최적화** - `CallTypes` caching 및 lookup 감소 적용 - [PR #20204](https://github.com/BerriAI/litellm/pull/20204)
- **`_get_relevant_args_to_use_for_logging()` 캐시** - module level에 캐시 - [PR #20077](https://github.com/BerriAI/litellm/pull/20077)
- **`normalize_request_route`용 LRU cache** - [PR #19812](https://github.com/BerriAI/litellm/pull/19812)
- **`get_standard_logging_metadata` 최적화** - set intersection 사용 - [PR #19685](https://github.com/BerriAI/litellm/pull/19685)
- **`completion_cost`의 early-exit guard** - 사용되지 않는 기능에 적용 - [PR #20020](https://github.com/BerriAI/litellm/pull/20020)
- **`get_litellm_params` 최적화** - sparse kwargs extraction 사용 - [PR #19884](https://github.com/BerriAI/litellm/pull/19884)
- **debug log f-string 보호** 및 중복 dict copy 제거 - [PR #19961](https://github.com/BerriAI/litellm/pull/19961)
- **enum construction을 frozenset lookup으로 교체** - [PR #20302](https://github.com/BerriAI/litellm/pull/20302)
- **`update_environment_variables`의 debug f-string 보호** - [PR #20360](https://github.com/BerriAI/litellm/pull/20360)
- **budget lookup 실패 시 경고** - 조용한 caching miss를 드러내기 위해 추가 - [PR #20545](https://github.com/BerriAI/litellm/pull/20545)
- **요청별 INFO-level session reuse logging 추가** - observability 개선 - [PR #20597](https://github.com/BerriAI/litellm/pull/20597)

---

## 데이터베이스 변경 {#database-changes}

### 스키마 업데이트 {#schema-updates}

| Table | Change Type | Description | PR | Migration |
| ----- | ----------- | ----------- | -- | --------- |
| `LiteLLM_TeamTable` | New Column | team-based guardrail isolation을 위한 `allow_team_guardrail_config` boolean field 추가 | [PR #20318](https://github.com/BerriAI/litellm/pull/20318) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260205091235_allow_team_guardrail_config/migration.sql) |
| `LiteLLM_DeletedTeamTable` | New Column | `allow_team_guardrail_config` boolean field 추가 | [PR #20318](https://github.com/BerriAI/litellm/pull/20318) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260205091235_allow_team_guardrail_config/migration.sql) |
| `LiteLLM_TeamTable` | New Column | soft budget alerting을 위한 `soft_budget` (double precision) 추가 | [PR #20530](https://github.com/BerriAI/litellm/pull/20530) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260205144610_add_soft_budget_to_team_table/migration.sql) |
| `LiteLLM_DeletedTeamTable` | New Column | `soft_budget` (double precision) 추가 | [PR #20653](https://github.com/BerriAI/litellm/pull/20653) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260207110613_add_soft_budget_to_deleted_teams_table/migration.sql) |
| `LiteLLM_MCPServerTable` | New Column | MCP IP-based access control을 위한 `available_on_public_internet` boolean 추가 | [PR #20607](https://github.com/BerriAI/litellm/pull/20607) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260207093506_add_available_on_public_internet_to_mcp_servers/migration.sql) |

---

## 문서 업데이트 (14건) {#documentation-updates-14-updates}

- LITELLM_LICENSE 설정 및 검증 FAQ 추가 - [PR #20284](https://github.com/BerriAI/litellm/pull/20284)
- Model request tags 문서 - [PR #20290](https://github.com/BerriAI/litellm/pull/20290)
- Prisma migration troubleshooting guide 추가 - [PR #20300](https://github.com/BerriAI/litellm/pull/20300)
- MCP Semantic Filtering 문서 - [PR #20316](https://github.com/BerriAI/litellm/pull/20316)
- supported agents SDK로 CopilotKit SDK 문서 추가 - [PR #20396](https://github.com/BerriAI/litellm/pull/20396)
- Nova Sonic 문서 추가 - [PR #20320](https://github.com/BerriAI/litellm/pull/20320)
- audio 사용을 보여주도록 Vertex AI Text to Speech 문서 업데이트 - [PR #20255](https://github.com/BerriAI/litellm/pull/20255)
- 단계별 지침으로 Okta SSO setup guide 개선 - [PR #20353](https://github.com/BerriAI/litellm/pull/20353)
- Langfuse 문서 업데이트 - [PR #20443](https://github.com/BerriAI/litellm/pull/20443)
- 공개 인터넷에 MCP 노출 문서 - [PR #20626](https://github.com/BerriAI/litellm/pull/20626)
- blog post 추가: Achieving Sub-Millisecond Proxy Overhead - [PR #20309](https://github.com/BerriAI/litellm/pull/20309)
- litellm-observatory 관련 blog post 추가 - [PR #20622](https://github.com/BerriAI/litellm/pull/20622)
- adaptive thinking 내용으로 Opus 4.6 blog 업데이트 - [PR #20637](https://github.com/BerriAI/litellm/pull/20637)
- `gpt-5-search-api` docs clarifications - [PR #20512](https://github.com/BerriAI/litellm/pull/20512)

---

## 신규 기여자 {#new-contributors}
* @Quentin-M 님이 [PR #19818](https://github.com/BerriAI/litellm/pull/19818)에서 첫 기여를 했습니다.
* @amirzaushnizer 님이 [PR #20235](https://github.com/BerriAI/litellm/pull/20235)에서 첫 기여를 했습니다.
* @cscguochang 님이 [PR #20214](https://github.com/BerriAI/litellm/pull/20214)에서 첫 기여를 했습니다.
* @krauckbot 님이 [PR #20273](https://github.com/BerriAI/litellm/pull/20273)에서 첫 기여를 했습니다.
* @agrattan0820 님이 [PR #19784](https://github.com/BerriAI/litellm/pull/19784)에서 첫 기여를 했습니다.
* @nina-hu 님이 [PR #20472](https://github.com/BerriAI/litellm/pull/20472)에서 첫 기여를 했습니다.
* @swayambhu94 님이 [PR #20469](https://github.com/BerriAI/litellm/pull/20469)에서 첫 기여를 했습니다.
* @ssadedin 님이 [PR #20566](https://github.com/BerriAI/litellm/pull/20566)에서 첫 기여를 했습니다.

---

## 전체 변경 이력 {#full-변경-이력}
[v1.81.6-nightly...v1.81.9](https://github.com/BerriAI/litellm/compare/v1.81.6-nightly...v1.81.9)
