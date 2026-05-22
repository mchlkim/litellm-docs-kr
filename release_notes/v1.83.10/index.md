---
title: "v1.83.10 - Claude Opus 4.7, 프롬프트 압축 및 다중 기간 예산"
slug: "v1-83-10"
date: 2026-04-27T00:00:00
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

## 이 버전 배포 {#deploy-this-version}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:main-v1.83.10-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.83.10
```

</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

- **Claude Opus 4.7 day-0 지원** — [Anthropic](../../docs/providers/anthropic), [Bedrock](../../docs/providers/bedrock), [Vertex AI](../../docs/providers/vertex), [Azure AI](../../docs/providers/azure_ai), [Perplexity](../../docs/providers/perplexity) 전반의 Opus 4.7 지원. reasoning, vision, prompt caching, computer use, 1M-token 컨텍스트를 포함합니다.
- **`litellm.compress()`** — 모델에 전달되기 전에 긴 컨텍스트를 줄일 수 있는 [retrieval tool 포함 BM25 기반 prompt compression](../../docs/completion/prompt_compression).
- **다중 임계값 예산 알림** — [virtual key가 단일 soft-budget 수준 대신 여러 구성 가능한 지출 임계값에서 알림을 발생](../../docs/proxy/alerting)(예: 50% / 80% / 95%)할 수 있습니다.
- **동시 예산 기간** — [key와 team이 여러 예산 기간(일별 + 월별)을 동시에 실행](../../docs/proxy/users)할 수 있으며, 각 기간은 자체 reset cadence를 가집니다.
- **팀별 Guardrail 제외** — config file을 수정하지 않고 [team settings에서 특정 global guardrail을 제외](../../docs/proxy/guardrails/quick_start)할 수 있습니다.
- **PromptGuard Guardrail 통합** — [prompt-injection detection을 위한 일급 pre/post-call guardrail](../../docs/proxy/guardrails/promptguard)을 제공합니다.
- **uv Packaging 마이그레이션** — 더 빠르고 재현 가능한 build를 위해 [packaging, CI, Docker 전반에서 Poetry를 uv로 대체](../../docs/extras/code_quality)했습니다.

---

## 주요 변경 사항 {#breaking-changes}

#### key/team이 opt in하지 않으면 caller가 제공한 `tags`가 제거됩니다 {#caller-supplied-tags-are-stripped-unless-the-keyteam-opts-in}

- **변경된 내용:** 호출하는 key 또는 상위 team에 `metadata.allow_client_tags: true`가 없으면 caller가 제공한 tag(`metadata.tags`, `litellm_metadata.tags`, root-level `tags`, `x-litellm-tags` header)는 [tag-based routing](../../docs/proxy/tag_routing) 및 [tag-based spend attribution](../../docs/proxy/cost_tracking#custom-tags)이 실행되기 전에 request에서 제거됩니다. model deployment, key metadata, team metadata에 구성된 tag는 영향을 받지 않습니다. proxy는 제거할 때마다 `WARNING` line을 기록합니다.
  ```
  Stripped caller-supplied tags from metadata, tags (root): this key/team does not have `allow_client_tags: true` in its metadata. Set it to opt into client-supplied routing/budget tags.
  ```
  — [PR #25905](https://github.com/BerriAI/litellm/pull/25905)

- **영향을 받는 대상:** tag-based cost tracking, tag budget, tag-based routing을 위해 client가 request body 또는 `x-litellm-tags` header로 `tags`를 전달하는 방식에 의존하던 모든 deployment입니다. upgrade 후 해당 tag는 조용히 기본 bucket / 기본 deployment로 fall through되며, tag별 spend report는 비어 있는 것처럼 보입니다.

- **기존 동작 복원:** 영향을 받는 key(또는 해당 key를 소유한 team)의 metadata에 `allow_client_tags: true`를 설정하세요. 둘 중 하나만 있어도 충분합니다. key 또는 상위 team에 이 flag가 있으면 caller가 제공한 tag가 통과합니다.
  ```bash
  # Per key
  curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{"metadata": {"allow_client_tags": true}}'

  # Per team
  curl -L -X POST 'http://0.0.0.0:4000/team/new' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{"metadata": {"allow_client_tags": true}}'
  ```

  기존 key/team은 동일한 `metadata` payload를 포함해 `/key/update` 또는 `/team/update`로 patch할 수 있습니다.

---

## 신규 모델 / 업데이트된 모델 {#new--updated-models}

#### 신규 모델 지원(신규 모델 10개) {#new-model-support-10-new-models}

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Anthropic | `claude-opus-4-7`, `claude-opus-4-7-20260416` | 1M | $5.00 | $25.00 | 채팅, 추론, 비전, 컴퓨터 사용, prompt caching, PDF 입력, xhigh reasoning effort |
| AWS Bedrock | `anthropic.claude-opus-4-7`, `us.anthropic.claude-opus-4-7`, `eu.anthropic.claude-opus-4-7`, `au.anthropic.claude-opus-4-7`, `global.anthropic.claude-opus-4-7` | 1M | $5.50 | $27.50 | 채팅, 추론, 비전, 컴퓨터 사용, prompt caching, PDF 입력, native structured output |
| Vertex AI | `vertex_ai/claude-opus-4-7`, `vertex_ai/claude-opus-4-7@default` | 1M | $5.00 | $25.00 | 채팅, 추론, 비전, 컴퓨터 사용, prompt caching, PDF 입력 |
| Azure AI | `azure_ai/claude-opus-4-7` | 200K | $5.00 | $25.00 | 채팅, 추론, 비전, 컴퓨터 사용, prompt caching, PDF 입력 |
| Perplexity | `perplexity/anthropic/claude-opus-4-7` | - | - | - | web search, function calling(Responses mode) 지원 |
| Google Gemini | `gemini/veo-3.1-lite-generate-preview` | 1024 | - | $0.05 / sec | video generation preview 지원 |
| OpenRouter | `openrouter/google/gemini-3.1-flash-lite-preview` | 1.05M | $0.25 | $1.50 | 채팅, code execution, file search, function calling, prompt caching, 추론, web search, 비전, video/audio/PDF 입력 |
| xAI | `xai/grok-4.20-0309-reasoning` | 2M | $2.00 | $6.00 | function calling, 추론, tool choice, 비전, web search |
| W&B Inference | `wandb/MiniMaxAI/MiniMax-M2.5` | 197K | $0.30 | $1.20 | function calling, 추론, response schema |
| W&B Inference | `wandb/moonshotai/Kimi-K2.5` | 262K | $0.60 | $3.00 | function calling, 추론, response schema, 비전 |

#### 기능 {#features}

- **[Anthropic](../../docs/providers/anthropic)**
    - Anthropic native, Bedrock, Vertex AI, Azure AI, Perplexity 전반에서 Claude Opus 4.7 day-0 지원 - [PR #25867](https://github.com/BerriAI/litellm/pull/25867)
    - Opus 4.7 routing/version-string 처리에 대한 후속 hotfix - [PR #25875](https://github.com/BerriAI/litellm/pull/25875), [PR #25876](https://github.com/BerriAI/litellm/pull/25876)
    - invalid thinking signature error 이후 `/v1/messages` 재시도 - [PR #25674](https://github.com/BerriAI/litellm/pull/25674)

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Invoke 및 Converse API 모두에서 custom tool JSON schema 정규화 - [PR #25396](https://github.com/BerriAI/litellm/pull/25396)
    - Bedrock API response null-type 처리 - [PR #25810](https://github.com/BerriAI/litellm/pull/25810), [PR #24147](https://github.com/BerriAI/litellm/pull/24147)
    - start-only cache usage의 음수 streaming cost 방지 - [PR #25846](https://github.com/BerriAI/litellm/pull/25846)
    - UI 및 Spend로그에서 정확한 cache token cost breakdown 제공 - [PR #25735](https://github.com/BerriAI/litellm/pull/25735)
    - Bedrock test file의 미해결 merge conflict marker 제거 - [PR #25995](https://github.com/BerriAI/litellm/pull/25995)
    - 불안정한 Bedrock gpt-oss tool-call live test를 request-body mock으로 교체 - [PR #25739](https://github.com/BerriAI/litellm/pull/25739)
    - Bedrock Moonshot test mock 처리 및 `TogetherAIConfig` recursion 수정 - [PR #25920](https://github.com/BerriAI/litellm/pull/25920)
    - dead Bedrock `clear_thinking` interleaved-thinking-beta assertion 제거 - [PR #25913](https://github.com/BerriAI/litellm/pull/25913)

- **[Google Vertex AI](../../docs/providers/vertex)**
    - `map_finish_reason`을 통해 Gemini `finish_reason` enum 정규화 - [PR #25337](https://github.com/BerriAI/litellm/pull/25337)
    - `vertex_ai/qwen3-235b-a22b-instruct-2507-maas`에 `us-south1` region 추가 - [PR #25382](https://github.com/BerriAI/litellm/pull/25382)
    - `vertex_ai/claude-opus-4-7` 및 `vertex_ai/claude-opus-4-7@default` cost map entry 추가 - cost map

- **[Google Gemini](../../docs/providers/gemini)**
    - Veo 3.1 Lite pricing, video resolution usage, tiered cost tracking 추가 - [PR #25348](https://github.com/BerriAI/litellm/pull/25348)

- **[Azure AI](../../docs/providers/azure_ai)**
    - `azure_ai/claude-opus-4-7` cost map entry 추가 - cost map
    - logging hook을 통해 Azure passthrough용 `standard_logging_object` 채우기 - [PR #25679](https://github.com/BerriAI/litellm/pull/25679)

- **[OpenAI](../../docs/providers/openai)**
    - OpenAI embedding request에서 null `encoding_format` 생략 - [PR #25395](https://github.com/BerriAI/litellm/pull/25395) (이후 [PR #25698](https://github.com/BerriAI/litellm/pull/25698)에서 revert됨. Bug Fixes 참고)

- **[xAI](../../docs/providers/xai)**
    - `xai/grok-4.20-0309-reasoning` cost map entry 추가 - [PR #25930](https://github.com/BerriAI/litellm/pull/25930)

- **[Together AI](../../docs/providers/togetherai)**
    - `get_model_info`에서 reasoning effort field를 노출하고 `together_ai/gpt-oss-120b` 추가 - [PR #25263](https://github.com/BerriAI/litellm/pull/25263)
    - test에서 deprecated Mixtral을 serverless Qwen3.5-9B로 교체 - [PR #25728](https://github.com/BerriAI/litellm/pull/25728)

- **[DashScope](../../docs/providers/dashscope)**
    - explicit prompt caching을 위해 `cache_control` 보존 - [PR #25331](https://github.com/BerriAI/litellm/pull/25331)

- **[GitHub Copilot](../../docs/providers/github_copilot)**
    - default GitHub Copilot authentication endpoint override 허용 - [PR #25915](https://github.com/BerriAI/litellm/pull/25915)

- **[W&B Inference](../../docs/providers/wandb_inference)**
    - Kimi-K2.5 및 MiniMax-M2.5 cost map entry 추가 - [PR #25409](https://github.com/BerriAI/litellm/pull/25409)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - 항상 200을 반환하는 대신 `/v1/messages/count_tokens`에서 실제 upstream status code 반환 - [PR #21352](https://github.com/BerriAI/litellm/pull/21352)

- **[Vertex AI](../../docs/providers/vertex)**
    - Gemini `finish_reason` enum 정규화(위 Features 참고) - [PR #25337](https://github.com/BerriAI/litellm/pull/25337)

- **[Embeddings API](../../docs/embedding/supported_embedding)**
    - downstream regression 이후 null `encoding_format` 생략 변경 revert - [PR #25698](https://github.com/BerriAI/litellm/pull/25698)

- **General**
    - docs banner에 표시되는 `version` 수정 - [PR #25875](https://github.com/BerriAI/litellm/pull/25875)

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - cache key allow-list에 Responses API params 추가 - [PR #25673](https://github.com/BerriAI/litellm/pull/25673)

- **[OCR API](../../docs/ocr)**
    - Azure DI analyze query string을 통한 Mistral-style `pages` param 지원 - [PR #25929](https://github.com/BerriAI/litellm/pull/25929)
    - allowlist에 누락된 Mistral OCR params 추가 - [PR #25858](https://github.com/BerriAI/litellm/pull/25858)

- **[Embeddings API](../../docs/embedding/supported_embedding)**
    - null value에 대한 OpenAI `encoding_format` 처리(initial fix는 이후 revert됨) - [PR #25395](https://github.com/BerriAI/litellm/pull/25395), [PR #25698](https://github.com/BerriAI/litellm/pull/25698)

- **[Anthropic Messages](../../docs/anthropic_unified/)**
    - invalid thinking signature 발생 시 재시도 - [PR #25674](https://github.com/BerriAI/litellm/pull/25674)
    - `count_tokens` upstream error에서 실제 status code 반환 - [PR #21352](https://github.com/BerriAI/litellm/pull/21352)

- **[Pass-Through Endpoints](../../docs/pass_through/intro)**
    - Azure passthrough용 `standard_logging_object` 채우기 - [PR #25679](https://github.com/BerriAI/litellm/pull/25679)
    - credential 및 protocol header에 대한 `x-pass-` header forwarding 제한 - [PR #25916](https://github.com/BerriAI/litellm/pull/25916)

- **[Video Generation](../../docs/proxy/veo_video_generation)**
    - Veo 3.1 Lite의 resolution-aware tiered cost tracking - [PR #25348](https://github.com/BerriAI/litellm/pull/25348)

- **General — `litellm.compress()`**
    - model invocation 전에 긴 prompt를 줄일 수 있도록 `litellm.compress()`로 노출되는 retrieval tool 포함 신규 BM25 기반 [prompt compression API](../../docs/completion/prompt_compression) - [PR #25637](https://github.com/BerriAI/litellm/pull/25637)

#### 버그 {#bugs}

- **General**
    - credential validation에서 `api_key` value check 강화 - [PR #25917](https://github.com/BerriAI/litellm/pull/25917)
    - request parameter의 environment-reference handling 강화 - [PR #25592](https://github.com/BerriAI/litellm/pull/25592)
    - request parameter handling 강화 - [PR #25827](https://github.com/BerriAI/litellm/pull/25827)
    - shared path utility 추가 및 directory traversal 방지 - [PR #25834](https://github.com/BerriAI/litellm/pull/25834)
    - user-supplied URL에 대한 URL validation 추가 - [PR #25906](https://github.com/BerriAI/litellm/pull/25906)
    - admin metadata에서 guardrail config를 읽고 tag-routing consistency 수정 - [PR #25905](https://github.com/BerriAI/litellm/pull/25905)
    - admin operation에서 organization boundary 적용 - [PR #25904](https://github.com/BerriAI/litellm/pull/25904)
    - `/global/spend/logs`를 깨뜨리던 `prometheus_helpers` file/package shadow 문제 해결 - [PR #26026](https://github.com/BerriAI/litellm/pull/26026)
    - CORS credentials, `create_views` exception handling, spend-log cleanup loop 강화 - [PR #25559](https://github.com/BerriAI/litellm/pull/25559)
    - error traceback, log, alert에서 API key leak 방지 - [PR #25117](https://github.com/BerriAI/litellm/pull/25117)
    - license `public_key.pem`의 leading space 제거 - [PR #25339](https://github.com/BerriAI/litellm/pull/25339)
    - cache invalidation: bulk update와 key rotation에서 token double-hashing 중단 - [PR #25552](https://github.com/BerriAI/litellm/pull/25552)
    - routed model에서 조용히 깨지던 `model_max_budget` 수정 - [PR #25549](https://github.com/BerriAI/litellm/pull/25549)
    - dependabot이 보고한 vulnerable dependency 25개 중 22개 bump - [PR #25442](https://github.com/BerriAI/litellm/pull/25442)
    - `get_cache_key`의 `multiple values` `TypeError` 수정 - [PR #20261](https://github.com/BerriAI/litellm/pull/20261)
    - S3v2: SigV4-signed S3 request에 prepared URL 사용 - [PR #25074](https://github.com/BerriAI/litellm/pull/25074)
    - health-check reasoning-token max-token precedence 수정 - [PR #25936](https://github.com/BerriAI/litellm/pull/25936)
    - `BACKGROUND_HEALTH_CHECK_MAX_TOKENS` env var 추가 - [PR #25344](https://github.com/BerriAI/litellm/pull/25344)
    - 300K-row UPDATE를 방지하기 위해 stale managed object cleanup batch 제한 - [PR #25227](https://github.com/BerriAI/litellm/pull/25227)
    - `StandardLoggingPayload`에서 provider response header 보존 - [PR #25807](https://github.com/BerriAI/litellm/pull/25807)
    - health check 중 OOM을 방지하도록 DB query 최적화 - [PR #25732](https://github.com/BerriAI/litellm/pull/25732)
    - `PodLockManager.release_lock` atomic compare-and-delete 재반영(#21226) - [PR #24466](https://github.com/BerriAI/litellm/pull/24466)
    - strategy가 latency-based가 아닐 때 `routing_strategy_args`가 `None` 반환 - [PR #25882](https://github.com/BerriAI/litellm/pull/25882)
    - `is_tool_name_prefixed`가 알려진 MCP server prefix 기준으로 validate하도록 변경 - [PR #25085](https://github.com/BerriAI/litellm/pull/25085)
    - restart 후에도 default router end-budget 유지 - [PR #25991](https://github.com/BerriAI/litellm/pull/25991)
    - team-scoped key management check에 team membership 적용 - [PR #25686](https://github.com/BerriAI/litellm/pull/25686)
    - Agent endpoint 및 routing permission check 추가 - [PR #25922](https://github.com/BerriAI/litellm/pull/25922)
    - Prometheus metrics용 JWT-auth `key_alias=user_id`: initial fix 및 revert - [PR #25340](https://github.com/BerriAI/litellm/pull/25340), [PR #25438](https://github.com/BerriAI/litellm/pull/25438)
    - post-custom-auth DB lookup을 opt-in flag 뒤로 이동 - [PR #25634](https://github.com/BerriAI/litellm/pull/25634)
    - user 및 key update endpoint에서 field-level check 정렬 - [PR #25541](https://github.com/BerriAI/litellm/pull/25541)
    - `/spend/logs` filter handling을 user scoping에 맞춤 - [PR #25594](https://github.com/BerriAI/litellm/pull/25594)
    - `custom_code` guardrail sandbox를 RestrictedPython으로 교체 - [PR #25818](https://github.com/BerriAI/litellm/pull/25818)
    - Presidio: `anonymize_text`에서 올바른 text position 사용 - [PR #24998](https://github.com/BerriAI/litellm/pull/24998)

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **가상 키**
    - 구성 가능한 multi-threshold budget alert(예: 50% / 80% / 95%) - [PR #25989](https://github.com/BerriAI/litellm/pull/25989)
    - API key 및 team별 multiple concurrent budget window(`#24883`) - [PR #25109](https://github.com/BerriAI/litellm/pull/25109)
    - member별 model scope 및 team `default_team_member_models` - [PR #24950](https://github.com/BerriAI/litellm/pull/24950)
    - regenerate key modal을 AntD로 마이그레이션 - [PR #25406](https://github.com/BerriAI/litellm/pull/25406)
    - key update payload에서 빈 premium field 제거 - [PR #26023](https://github.com/BerriAI/litellm/pull/26023)
    - invite-user modal의 기본 global role을 least privilege로 설정 - [PR #25721](https://github.com/BerriAI/litellm/pull/25721)

- **Teams**
    - team 생성 후 router settings editing 허용 - [PR #25398](https://github.com/BerriAI/litellm/pull/25398)
    - 특정 global guardrail에 대한 team별 opt-out - [PR #25575](https://github.com/BerriAI/litellm/pull/25575)
    - 삭제된 Keys/Teams에 enterprise notice banner 표시 - [PR #25814](https://github.com/BerriAI/litellm/pull/25814)
    - team mutation 후 org query invalidate - [PR #25812](https://github.com/BerriAI/litellm/pull/25812)
    - team model TPM/RPM limit edit에 대한 E2E test - [PR #25658](https://github.com/BerriAI/litellm/pull/25658)

- **모델 + 엔드포인트**
    - UI Settings에서 Claude Code BYOK 지원 - [PR #25998](https://github.com/BerriAI/litellm/pull/25998)
    - Add Model flow용 E2E test - [PR #25590](https://github.com/BerriAI/litellm/pull/25590)
    - boolean guardrail provider field에 backend default 사전 선택 - [PR #25700](https://github.com/BerriAI/litellm/pull/25700)
    - guardrail `optional_params` bool default를 `Select`에 render - [PR #25806](https://github.com/BerriAI/litellm/pull/25806)
    - MCP `ToolTestPanel` boolean input에 AntD `Select` 사용 - [PR #25809](https://github.com/BerriAI/litellm/pull/25809)
    - MCP server edit 시 `extra_headers` 유지 - [PR #26003](https://github.com/BerriAI/litellm/pull/26003)
    - Guardrail Test Playground를 `@tremor/react`에서 AntD로 마이그레이션 - [PR #25749](https://github.com/BerriAI/litellm/pull/25749)
    - router_settings page를 Tremor에서 AntD로 마이그레이션 - [PR #25879](https://github.com/BerriAI/litellm/pull/25879)
    - 가드레일 Monitor layout에서 Tremor 사용 축소 - [PR #25803](https://github.com/BerriAI/litellm/pull/25803)
    - Swagger docs message에서 Chat UI link 제거 - [PR #25727](https://github.com/BerriAI/litellm/pull/25727)
    - controlled modal을 통한 policy attachment 삭제 - [PR #25324](https://github.com/BerriAI/litellm/pull/25324)

- **Auth / SSO**
    - reverse proxy가 cookie에 `HttpOnly`를 추가할 때 발생하는 login redirect loop 해결 - [PR #23532](https://github.com/BerriAI/litellm/pull/23532)
    - post-custom-auth DB lookup을 opt-in flag 뒤로 이동 - [PR #25634](https://github.com/BerriAI/litellm/pull/25634)

- **로그 / Activity**
    - logs team-filter dropdown을 root teams state bleed에서 격리 - [PR #25716](https://github.com/BerriAI/litellm/pull/25716)
    - `/spend/logs` filter handling을 user scoping에 맞춤 - [PR #25594](https://github.com/BerriAI/litellm/pull/25594)

- **Helm**
    - `extraContainers` 및 `extraInitContainers`에 `tpl` support 추가 - [PR #25494](https://github.com/BerriAI/litellm/pull/25494)

#### 버그 {#bugs-1}

- key update payload에서 빈 premium field 제거 - [PR #26023](https://github.com/BerriAI/litellm/pull/26023)
- credential validation에서 `api_key` value check 강화 - [PR #25917](https://github.com/BerriAI/litellm/pull/25917)
- MCP server edit 시 `extra_headers`가 유지되지 않던 문제 수정 - [PR #26003](https://github.com/BerriAI/litellm/pull/26003)
- 로그 team-filter dropdown leakage 수정 - [PR #25716](https://github.com/BerriAI/litellm/pull/25716)
- `user_dashboard` test의 `cookieUtils` mock에 `getCookie` 추가 - [PR #25719](https://github.com/BerriAI/litellm/pull/25719)
- deprecated `tests/ui_e2e_tests/` suite 제거 - [PR #25657](https://github.com/BerriAI/litellm/pull/25657)
- `x-pass-` header forwarding 제한 - [PR #25916](https://github.com/BerriAI/litellm/pull/25916)
- 블로그 dark-mode text가 dark background에서 보이지 않던 문제 수정 - [PR #25620](https://github.com/BerriAI/litellm/pull/25620)
- invite-user role 기본값을 least-privilege로 설정 - [PR #25721](https://github.com/BerriAI/litellm/pull/25721)

## AI 통합 {#ai-integrations}

### 로깅 {#logging}

- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - 7m 및 10m latency histogram bucket 추가 - [PR #25071](https://github.com/BerriAI/litellm/pull/25071)
    - Prometheus exporter 성능 개선 - [PR #25934](https://github.com/BerriAI/litellm/pull/25934)
    - `/global/spend/logs`를 깨뜨리던 `prometheus_helpers` file/package shadow 문제 해결 - [PR #26026](https://github.com/BerriAI/litellm/pull/26026)

- **[Azure Pass-Through](../../docs/pass_through/azure_passthrough)**
    - logging hook을 통해 `standard_logging_object` 채우기 - [PR #25679](https://github.com/BerriAI/litellm/pull/25679)

- **General**
    - `StandardLoggingPayload`에서 provider response header 보존 - [PR #25807](https://github.com/BerriAI/litellm/pull/25807)

### 가드레일

- **[PromptGuard](../../docs/proxy/guardrails/promptguard)**
    - prompt-injection detection을 위한 신규 PromptGuard guardrail 통합 - [PR #24268](https://github.com/BerriAI/litellm/pull/24268)

- **[Custom Code 가드레일](../../docs/proxy/guardrails/custom_guardrail)**
    - `custom_code` sandbox를 RestrictedPython으로 교체 - [PR #25818](https://github.com/BerriAI/litellm/pull/25818)

- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)**
    - `anonymize_text`에서 올바른 text position 사용 - [PR #24998](https://github.com/BerriAI/litellm/pull/24998)

- **General**
    - 특정 global guardrail에 대한 team별 opt-out - [PR #25575](https://github.com/BerriAI/litellm/pull/25575)
    - UI: boolean guardrail provider field에 backend default 사전 선택 - [PR #25700](https://github.com/BerriAI/litellm/pull/25700)
    - UI: guardrail `optional_params` boolean default를 `Select`에 render - [PR #25806](https://github.com/BerriAI/litellm/pull/25806)
    - admin metadata에서 guardrail config를 읽고 tag-routing consistency 수정 - [PR #25905](https://github.com/BerriAI/litellm/pull/25905)

### 캐싱

- cache key allow-list에 Responses API params 추가 - [PR #25673](https://github.com/BerriAI/litellm/pull/25673)
- `get_cache_key`의 `multiple values` `TypeError` 방지 - [PR #20261](https://github.com/BerriAI/litellm/pull/20261)
- S3v2: SigV4-signed S3 request에 prepared URL 사용 - [PR #25074](https://github.com/BerriAI/litellm/pull/25074)

### 프롬프트 관리 / 압축 {#prompt-management--compression}

- retrieval tool을 포함한 신규 `litellm.compress()` BM25 기반 [prompt compression API](../../docs/completion/prompt_compression) - [PR #25637](https://github.com/BerriAI/litellm/pull/25637)

### Secret Manager {#secret-managers}

- 이번 release에는 신규 secret manager provider 추가가 없습니다.

## 비용 추적, 예산 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- virtual key용 구성 가능한 multi-threshold budget alert(예: 50% / 80% / 95%) - [PR #25989](https://github.com/BerriAI/litellm/pull/25989)
- API key 및 team별 multiple concurrent budget window(`#24883`) - [PR #25109](https://github.com/BerriAI/litellm/pull/25109)
- Bedrock/Anthropic의 정확한 cache token cost breakdown을 UI 및 Spend로그에 표시 - [PR #25735](https://github.com/BerriAI/litellm/pull/25735)
- Bedrock: start-only cache usage의 음수 streaming cost 방지 - [PR #25846](https://github.com/BerriAI/litellm/pull/25846)
- virtual-key projected-spend soft budget alert 수정 - [PR #25838](https://github.com/BerriAI/litellm/pull/25838)
- parallel-request limiter에서 project-level model-specific rate limit 적용 - [PR #25994](https://github.com/BerriAI/litellm/pull/25994)
- restart 후에도 default router end-budget 유지 - [PR #25991](https://github.com/BerriAI/litellm/pull/25991)
- legacy entity(Team Members, End Users)의 reset time을 standardized calendar에 맞춤 - [PR #25440](https://github.com/BerriAI/litellm/pull/25440)
- 300K-row UPDATE를 방지하기 위해 stale managed-object cleanup batch 제한 - [PR #25227](https://github.com/BerriAI/litellm/pull/25227)
- cache invalidation: bulk update와 key rotation에서 token double-hashing 중단 - [PR #25552](https://github.com/BerriAI/litellm/pull/25552)
- routed model에서 조용히 깨지던 `model_max_budget` 수정 - [PR #25549](https://github.com/BerriAI/litellm/pull/25549)
- `get_model_info`에서 reasoning-effort field 노출 및 cost map에 `together_ai/gpt-oss-120b` 추가 - [PR #25263](https://github.com/BerriAI/litellm/pull/25263)
- Veo 3.1 Lite resolution-aware tiered cost tracking - [PR #25348](https://github.com/BerriAI/litellm/pull/25348)
- Vertex `qwen3-235b-a22b-instruct-2507-maas` cost map에 `us-south1` region 추가 - [PR #25382](https://github.com/BerriAI/litellm/pull/25382)

## MCP Gateway {#mcp-gateway}

- `is_tool_name_prefixed`를 알려진 MCP server prefix 집합에 대해 validate - [PR #25085](https://github.com/BerriAI/litellm/pull/25085)
- 저장된 per-user token이 없을 때 PKCE-triggering 401 복원 - [PR #26032](https://github.com/BerriAI/litellm/pull/26032)
- MCP gateway에서 server별 `InitializeResult.instructions` 노출 - [PR #25694](https://github.com/BerriAI/litellm/pull/25694)
- shared PKCE helper를 `utils/pkce.ts`로 추출 - [PR #25878](https://github.com/BerriAI/litellm/pull/25878)
- UI: MCP `ToolTestPanel` boolean input에 AntD `Select` 사용 - [PR #25809](https://github.com/BerriAI/litellm/pull/25809)
- UI: MCP server edit 시 `extra_headers` 유지 - [PR #26003](https://github.com/BerriAI/litellm/pull/26003)

## 성능 / Loadbalancing / 신뢰성 개선 {#performance--loadbalancing--reliability-improvements}

- Prometheus exporter 성능 개선 - [PR #25934](https://github.com/BerriAI/litellm/pull/25934)
- health check 중 OOM을 방지하도록 DB query 최적화 - [PR #25732](https://github.com/BerriAI/litellm/pull/25732)
- `PodLockManager.release_lock` atomic compare-and-delete(#21226 재반영) - [PR #24466](https://github.com/BerriAI/litellm/pull/24466)
- health-check reasoning-token max-token precedence 수정 - [PR #25936](https://github.com/BerriAI/litellm/pull/25936)
- 신규 `BACKGROUND_HEALTH_CHECK_MAX_TOKENS` environment variable - [PR #25344](https://github.com/BerriAI/litellm/pull/25344)
- strategy가 latency-based가 아닐 때 `routing_strategy_args`에 `None` 반환 - [PR #25882](https://github.com/BerriAI/litellm/pull/25882)
- proxy dependency bump 및 minimum Python을 3.10으로 상향 - [PR #26022](https://github.com/BerriAI/litellm/pull/26022)
- dependabot이 보고한 vulnerable dependency 25개 중 22개 bump - [PR #25442](https://github.com/BerriAI/litellm/pull/25442)
- packaging, CI, Docker를 Poetry에서 uv로 마이그레이션 - [PR #25007](https://github.com/BerriAI/litellm/pull/25007)
- `[Infra]` `llm_translation_testing` resource class를 `xlarge`로 bump하고 worker restart 허용 - [PR #25887](https://github.com/BerriAI/litellm/pull/25887), [PR #25898](https://github.com/BerriAI/litellm/pull/25898)
- `[Infra]` non-`main` PR target용 CI branch filter 확장 - [PR #25819](https://github.com/BerriAI/litellm/pull/25819)
- `[Infra]` `main`이 staging 및 hotfix branch의 PR만 받도록 guard 추가 - [PR #25733](https://github.com/BerriAI/litellm/pull/25733)
- `[Infra]` CircleCI config에서 사용하지 않는 `publish_proxy_extras` 및 `prisma_schema_sync` job 제거 - [PR #25821](https://github.com/BerriAI/litellm/pull/25821)
- `fix(ci)`: `test-server-root-path` timeout을 30m으로 증가 - [PR #25741](https://github.com/BerriAI/litellm/pull/25741)
- coverage combine에서 존재하지 않는 `litellm_mcps_tests_coverage` 제거 - [PR #25737](https://github.com/BerriAI/litellm/pull/25737)
- Helm: `extraContainers` / `extraInitContainers`에 `tpl` support 추가 - [PR #25494](https://github.com/BerriAI/litellm/pull/25494)
- non-Anthropic provider용 Advisor tool orchestration loop - [PR #25579](https://github.com/BerriAI/litellm/pull/25579)

## 문서 업데이트 {#documentation-updates}

- cost discrepancy debugging guide 추가 - [PR #25622](https://github.com/BerriAI/litellm/pull/25622)
- Week 2 onboarding checklist 추가 - [PR #25452](https://github.com/BerriAI/litellm/pull/25452)
- docs site에 "Copy Page as Markdown" 및 `llms.txt` 추가 - [PR #25975](https://github.com/BerriAI/litellm/pull/25975)
- Trivy compromise resolution용 문서 announcement bar - [PR #25870](https://github.com/BerriAI/litellm/pull/25870)
- docs.litellm.ai/blog를 engineering blog aesthetic으로 restyle - [PR #25580](https://github.com/BerriAI/litellm/pull/25580)
- Ramp-style engineering blog restyle 및 Redis circuit breaker post - [PR #25583](https://github.com/BerriAI/litellm/pull/25583)
- blog post page에 back arrow 추가 - [PR #25587](https://github.com/BerriAI/litellm/pull/25587)
- Fallbacks image 추가 - [PR #25731](https://github.com/BerriAI/litellm/pull/25731)
- 일반 docs update - [PR #25736](https://github.com/BerriAI/litellm/pull/25736)
- v1.83.3-stable 및 v1.83.7.rc.1 release note backfill - [PR #25723](https://github.com/BerriAI/litellm/pull/25723), [PR #25726](https://github.com/BerriAI/litellm/pull/25726)
- docs에 표시되는 version 수정 - [PR #25875](https://github.com/BerriAI/litellm/pull/25875)

## 신규 기여자 {#new-contributors}

* @hunterchris가 https://github.com/BerriAI/litellm/pull/20261 에서 첫 기여를 했습니다.
* @Dmitry-Kucher가 https://github.com/BerriAI/litellm/pull/24998 에서 첫 기여를 했습니다.
* @kulia26이 https://github.com/BerriAI/litellm/pull/25071 에서 첫 기여를 했습니다.
* @jaxhend가 https://github.com/BerriAI/litellm/pull/23532 에서 첫 기여를 했습니다.
* @abhyudayareddy가 https://github.com/BerriAI/litellm/pull/25337 에서 첫 기여를 했습니다.
* @avarga1이 https://github.com/BerriAI/litellm/pull/25263 에서 첫 기여를 했습니다.
* @acebot712가 https://github.com/BerriAI/litellm/pull/24268 에서 첫 기여를 했습니다.
* @meutsabdahal이 https://github.com/BerriAI/litellm/pull/25395 에서 첫 기여를 했습니다.
* @shreyescodes가 https://github.com/BerriAI/litellm/pull/25559 에서 첫 기여를 했습니다.
* @Lucas-Song-Dev가 https://github.com/BerriAI/litellm/pull/25324 에서 첫 기여를 했습니다.
* @steromano87이 https://github.com/BerriAI/litellm/pull/25915 에서 첫 기여를 했습니다.
* @jlav가 https://github.com/BerriAI/litellm/pull/25494 에서 첫 기여를 했습니다.

**전체 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.83.7-stable...v1.83.10-stable

---

## 04/27/2026

* 신규 모델 / 업데이트된 모델: 23
* LLM API 엔드포인트: 18
* 관리 엔드포인트 / UI: 22
* AI 통합(로깅 / 가드레일 / 캐싱 / Prompt): 16
* 비용 추적, 예산 및 Rate Limiting: 13
* MCP Gateway: 6
* 성능 / Loadbalancing / 신뢰성 개선: 17
* 문서 업데이트: 11
