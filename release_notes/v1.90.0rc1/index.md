---
title: "v1.90.0rc1 - Six New Providers, OpenTelemetry v2 Parity & Streaming Reliability"
slug: "v1-90-0-rc-1"
date: 2026-06-20T18:20:54
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:1.90.0-rc.1
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.90.0rc1
```

</TabItem>
</Tabs>

## 주요 변경 사항

`v1.90.0rc1` 는 다음 버전의 현재 릴리즈 후보입니다: 1.90.0.

- **새 프로바이더 6개** - ModelScope, LibertAI, Parasail, Pinstripes, TinyFish (search), 및 FastCRW (search) - 추가로 a new e2b code-execution sandbox primitive.
- **새 모델 91개** across Fireworks AI, Scaleway, Tensormesh, LibertAI, Azure AI (including `gpt-5.5` 및 DeepSeek V4), 및 Bedrock Mantle.
- **OpenTelemetry v2가 v1과 동일한 metrics 수준에 도달**, emitting the six `gen_ai.client.*` metrics, stamping input/output message content, 및 scoping OTLP credentials per tenant.
- **streaming 안정성을 전반적으로 개선**: upstream connections are now released 때 the client disconnects mid-stream (Gemini, aiohttp), requests are cancelled cleanly, 및 partial spend is recorded on interrupted streams.
- **새 guardrail 2개** (Cisco AI Defense, Repello Argus) 및 a large Next.js App Router UI migration 포함: the models, teams, users, organizations, api-keys, 및 usage pages.

## 새 프로바이더 및 엔드포인트

### 새 프로바이더 (6 새 프로바이더)

| Provider | 지원 LiteLLM 엔드포인트 | 설명 |
| --- | --- | --- |
| ModelScope (`modelscope`) | Chat Completions | OpenAI 호환 프로바이더 for ModelScope-hosted models - [PR #28460](https://github.com/BerriAI/litellm/pull/28460) |
| LibertAI (`libertai`) | Chat Completions, Embeddings | JSON-configured OpenAI 호환 프로바이더; ships 12 catalog models including `bge-m3` embeddings - [PR #30203](https://github.com/BerriAI/litellm/pull/30203) |
| TinyFish (`tinyfish`) | Search | Web search provider - [PR #30634](https://github.com/BerriAI/litellm/pull/30634) |
| FastCRW (`fastcrw`) | Search | Web search provider - [PR #30434](https://github.com/BerriAI/litellm/pull/30434) |
| Parasail (`parasail`) | Chat Completions | OpenAI 호환 프로바이더 |
| Pinstripes (`pinstripes`) | Chat Completions | New chat provider; ships 6 catalog models |

### 새 LLM API 엔드포인트

| 기능 | 설명 | 문서 |
| --- | --- | --- |
| 코드 실행 (e2b) | 모델이 생성한 코드를 실행하기 위한 새 sandbox / code-interpreter primitive - [PR #30898](https://github.com/BerriAI/litellm/pull/30898) | [Sandbox](../../docs/sandbox) |

## New 모델 / Updated 모델

#### 새 모델 지원 (새 모델 91개)

| Provider | Model | Context | Input ($/1M) | Output ($/1M) | 기능 |
| --- | --- | --- | --- | --- | --- |
| Azure AI | `azure_ai/gpt-5.5` | 1,050,000 | $5 | $30 | reasoning, function calling, prompt caching, pdf, vision |
| Azure AI | `azure_ai/gpt-5.5-2026-04-23` | 1,050,000 | $5 | $30 | reasoning, function calling, prompt caching, pdf, vision |
| Azure AI | `azure_ai/deepseek-v4-flash` | 1,000,000 | $0.19 | $0.51 | reasoning, function calling |
| Azure AI | `azure_ai/deepseek-v4-pro` | 1,000,000 | $1.74 | $3.48 | reasoning, function calling |
| Azure AI | `azure_ai/deepseek-v3.1` | 131,072 | $1.23 | $4.94 | reasoning, function calling |
| Azure AI | `azure_ai/MAI-Image-2.5` | - | $5 | - | image generation |
| Azure AI | `azure_ai/MAI-Image-2.5-Flash` | - | $1.75 | - | image generation |
| Azure AI | `azure_ai/MAI-Image-2e` | - | $5 | - | image generation |
| Azure | `azure/gpt-realtime-whisper` | - | - | - | audio transcription |
| OpenAI | `gpt-realtime-whisper` | - | - | - | audio transcription |
| DeepSeek | `deepseek-v4-flash` / `deepseek/deepseek-v4-flash` | 1,000,000 | $0.14 | $0.28 | function calling, prompt caching |
| DeepSeek | `deepseek-v4-pro` / `deepseek/deepseek-v4-pro` | 1,000,000 | $0.43 | $0.87 | function calling, prompt caching |
| Mistral | `mistral/mistral-medium-3-5` | 262,144 | $1.50 | $7.50 | function calling, vision |
| GitHub Copilot | `github_copilot/mai-code-1-flash` | 128,000 | $0.75 | $4.50 | function calling |
| Fireworks AI | 24 models incl. `deepseek-v4-pro`, `glm-5p2`, `kimi-k2p6`/`kimi-k2p7-code`, `minimax-m3`, `qwen3p7-plus`, `gpt-oss-120b`/`gpt-oss-20b` | up to 1,048,576 | $0.07-$2.80 | $0.28-$8.80 | function calling, reasoning, vision |
| Bedrock Mantle | `bedrock_mantle/google.gemma-4-26b-a4b` / `gemma-4-31b` / `gemma-4-e2b` | 128k-256k | $0.04-$0.14 | $0.08-$0.40 | function calling, reasoning, vision |
| LibertAI | 12 models incl. `qwen3.6-35b-a3b(-thinking)`, `gemma-4-31b-it(-thinking)`, `deepseek-v4-flash`, `bge-m3` | up to 262,144 | $0.01-$0.25 | free-$1.75 | function calling, reasoning, vision, embedding |
| Pinstripes | 6 models incl. `ps/minimax-m2.7`, `ps/qwen3.6-35b-a3b`, `ps/glm-4.5-air`, `ps/deepseek-v4-flash` | up to 1,000,192 | $0.09-$0.30 | $0.20-$0.60 | function calling, reasoning |
| Scaleway | 17 models incl. `qwen3.5-397b-a17b`, `mistral-medium-3.5-128b`, `gemma-4-26b-a4b-it`, `gpt-oss-120b`, `whisper-large-v3` | up to 256,000 | free-$1.50 | free-$7.50 | function calling, reasoning, vision, audio, embedding |
| Tensormesh | 10 models incl. `Qwen3-Coder-480B-A35B-FP8`, `Qwen3.5-397B-A17B-FP8`, `Kimi-K2.6`, `DeepSeek-V4-Flash`, `gpt-oss-120b`/`gpt-oss-20b` | up to 262,144 | $0.07-$1.40 | $0.28-$4.40 | function calling, reasoning, prompt caching |
| Soniox | `soniox/stt-async-v5` | 8,000 | - | - | audio transcription |
| TinyFish | `tinyfish/search` | - | - | - | search |

The 91 new entries also include the full `fireworks_ai/accounts/...` model 및 router paths. Claude Fable 5 already shipped in v1.89.0, 따라서 it is not counted here. 전체 diff: `model_prices_and_context_window.json`.

#### 기능

- **[Anthropic](../../docs/providers/anthropic)**
    - Surface compaction usage iterations data - [PR #27065](https://github.com/BerriAI/litellm/pull/27065)
    - Serve Anthropic-native `/v1/models` for Claude Code gateway discovery - [PR #30273](https://github.com/BerriAI/litellm/pull/30273)
- **[OpenRouter](../../docs/providers/openrouter)**
    - reasoning `max` level to `xhigh` 매핑 - [PR #28881](https://github.com/BerriAI/litellm/pull/28881)
- **[Bedrock](../../docs/providers/bedrock)**
    - Optionally forward multimodal content blocks in AgentCore `InvokeAgentRuntime` - [PR #28885](https://github.com/BerriAI/litellm/pull/28885)
    - file content retrieval for batch output files 지원 - [PR #30595](https://github.com/BerriAI/litellm/pull/30595)
    - Make Bedrock Mantle Responses routing data-driven per model - [PR #30700](https://github.com/BerriAI/litellm/pull/30700)
- **[DashScope](../../docs/providers/dashscope)**
    - Responses API support 추가 - [PR #30286](https://github.com/BerriAI/litellm/pull/30286)
- **[OCI](../../docs/providers/oci)**
    - Make Cohere `{{trace}}` judges work (tool param types + agentic tool-calling continuation) - [PR #30646](https://github.com/BerriAI/litellm/pull/30646)

#### 버그 수정

- **[Anthropic](../../docs/providers/anthropic)**
    - Apply `cache_control_injection_points` on the `/v1/messages` path - [PR #30341](https://github.com/BerriAI/litellm/pull/30341)
    - LiteLLM-injected `total_tokens` from `/v1/messages` responses 제거 - [PR #30382](https://github.com/BerriAI/litellm/pull/30382)
    - Cap cache_control injection at 4 blocks - [PR #30480](https://github.com/BerriAI/litellm/pull/30480)
    - Drop orphaned `server_tool_use` on multi-turn replay from generic OpenAI clients - [PR #30486](https://github.com/BerriAI/litellm/pull/30486)
    - Don't leak tool `type` into OpenAI function parameters schema - [PR #30618](https://github.com/BerriAI/litellm/pull/30618)
- **[Bedrock](../../docs/providers/bedrock)**
    - `cache_control` for ARN models in the `/v1/messages` adapter 보존 - [PR #29823](https://github.com/BerriAI/litellm/pull/29823)
    - Handle `role: "system"` inside the messages array on `/v1/messages` - [PR #30443](https://github.com/BerriAI/litellm/pull/30443)
    - a unique function-call id for Bedrock Mantle responses->chat tool calls 사용 - [PR #30426](https://github.com/BerriAI/litellm/pull/30426)
    - SigV4 fallback to Bedrock Mantle chat completions auth 추가 - [PR #30714](https://github.com/BerriAI/litellm/pull/30714)
- **[Gemini / Vertex AI](../../docs/providers/gemini)**
    - `get_vertex_base_url` for `cachedContents` host 사용 - [PR #29707](https://github.com/BerriAI/litellm/pull/29707)
    - Buffer native Gemini SSE frames - [PR #30225](https://github.com/BerriAI/litellm/pull/30225)
    - Gemini upstream-error body code 429 to `RateLimitError` 매핑 - [PR #30417](https://github.com/BerriAI/litellm/pull/30417)
    - Ensure checks show `gemini-3-flash-preview` supports `responseJsonSchema` - [PR #30696](https://github.com/BerriAI/litellm/pull/30696)
- **[OpenAI-compatible](../../docs/providers/openai_compatible)**
    - `cache_control` for OpenAI-compatible custom endpoints 보존 - [PR #30387](https://github.com/BerriAI/litellm/pull/30387)
    - hosted_vllm: remove `thinking_blocks` 및 convert list content to strings - [PR #30475](https://github.com/BerriAI/litellm/pull/30475)
    - Don't stack provider prefix on wildcard models with a custom prefix - [PR #30360](https://github.com/BerriAI/litellm/pull/30360)
- **[WatsonX](../../docs/providers/watsonx)**
    - Wrap string embedding input in an array for the WatsonX API - [PR #30897](https://github.com/BerriAI/litellm/pull/30897)
- **Pricing / Cost map**
    - cost mapping for `deepseek-v4-flash`/`deepseek-v4-pro` 추가 - [PR #27056](https://github.com/BerriAI/litellm/pull/27056)
    - `mistral-medium-3-5` to the cost map 추가 - [PR #29303](https://github.com/BerriAI/litellm/pull/29303)
    - `azure_ai/gpt-5.5` to the model cost map 추가 - [PR #30428](https://github.com/BerriAI/litellm/pull/30428)
    - GitHub Copilot MAI Code Flash pricing 추가 - [PR #30415](https://github.com/BerriAI/litellm/pull/30415)
    - the Fireworks AI model registry with the current platform catalog 동기화 - [PR #30616](https://github.com/BerriAI/litellm/pull/30616)
    - `soniox/stt-async-v5` 추가 - [PR #30672](https://github.com/BerriAI/litellm/pull/30672)
    - swapped input/output token costs for `command-r7b-12-2024` 수정 - [PR #30413](https://github.com/BerriAI/litellm/pull/30413)
    - 1h cache-write cost for Anthropic Sonnet 4.5/4.6 추가 - [PR #30474](https://github.com/BerriAI/litellm/pull/30474)
    - Volcengine (Doubao) tiered-pricing models to the tiered cost handler 라우팅 - [PR #30357](https://github.com/BerriAI/litellm/pull/30357); sort tiered thresholds numerically - [PR #30375](https://github.com/BerriAI/litellm/pull/30375); treat a DashScope explicit `0.0` tier cost as a real price - [PR #30653](https://github.com/BerriAI/litellm/pull/30653)
    - Drop synthesized zero costs in `register_model` to preserve sparse entries - [PR #30201](https://github.com/BerriAI/litellm/pull/30201)

## LLM API 엔드포인트

#### 기능

- **[Responses API](../../docs/response_api)**
    - Propagate `completed_response` 통해 `FallbackResponsesStreamWrapper` for streaming `/v1/responses` container ownership - [PR #30213](https://github.com/BerriAI/litellm/pull/30213)
- **[/v1/models](../../docs/proxy/model_management)**
    - Surface `max_input_tokens`/`max_output_tokens` on `/v1/models` - [PR #30272](https://github.com/BerriAI/litellm/pull/30272)
    - model group aliases in v1 model info 포함 - [PR #30626](https://github.com/BerriAI/litellm/pull/30626)
- **[Realtime](../../docs/realtime)**
    - non-admin virtual keys to call GA Realtime WebRTC HTTP routes 허용 - [PR #30089](https://github.com/BerriAI/litellm/pull/30089)
- **[Files](../../docs/files_endpoints)**
    - Attach existing OpenAI file ids - [PR #30628](https://github.com/BerriAI/litellm/pull/30628)

#### 버그

- **일반**
    - Token counter: handle Anthropic `tool_reference` blocks to stop dropped spend logs - [PR #30302](https://github.com/BerriAI/litellm/pull/30302)
    - Streaming: guard `raise_on_model_repetition` against empty choices - [PR #30485](https://github.com/BerriAI/litellm/pull/30485)
    - Audio: don't override an explicit `response_format` with `verbose_json` - [PR #30599](https://github.com/BerriAI/litellm/pull/30599)
    - the resolved model in `/realtime/client_secrets` for non-transcription sessions 검증 - [PR #30710](https://github.com/BerriAI/litellm/pull/30710)

## 관리 엔드포인트 / UI

#### 기능

- **App Router migration** - models - [PR #30677](https://github.com/BerriAI/litellm/pull/30677), teams - [PR #30343](https://github.com/BerriAI/litellm/pull/30343), users - [PR #30334](https://github.com/BerriAI/litellm/pull/30334), organizations - [PR #30336](https://github.com/BerriAI/litellm/pull/30336), api-keys - [PR #30699](https://github.com/BerriAI/litellm/pull/30699), usage report - [PR #30694](https://github.com/BerriAI/litellm/pull/30694), agents + router-settings - [PR #30323](https://github.com/BerriAI/litellm/pull/30323)
- **UI cleanup** - remove the unreachable `/chat` page - [PR #30178](https://github.com/BerriAI/litellm/pull/30178), dead UI components - [PR #30340](https://github.com/BerriAI/litellm/pull/30340), orphaned pass-through-settings route - [PR #30692](https://github.com/BerriAI/litellm/pull/30692); remove in-product survey and feedback nudges - [PR #30773](https://github.com/BerriAI/litellm/pull/30773)
- **가상 키** - expose per-model budget usage in `/key/info` - [PR #30394](https://github.com/BerriAI/litellm/pull/30394); grace-period key rotation returns the deprecated-key lookup result on 401 - [PR #30327](https://github.com/BerriAI/litellm/pull/30327)
- **Teams / Orgs** - add `key_limit` query param to `/team/info` - [PR #30006](https://github.com/BerriAI/litellm/pull/30006); list public team model names in `/v1/models` - [PR #30588](https://github.com/BerriAI/litellm/pull/30588)
- **Proxy CLI Auth** - add `verification_uri_complete` to the CLI SSO device flow - [PR #30571](https://github.com/BerriAI/litellm/pull/30571)
- **Proxy** - configurable response headers 및 login-page hint - [PR #30792](https://github.com/BerriAI/litellm/pull/30792); gate the "Default Credentials" hint on `/ui/login` behind an env flag - [PR #30234](https://github.com/BerriAI/litellm/pull/30234)

#### 버그

- **접근 제어 / 키**
    - `/key/list` now does exact `user_id`/`key_alias` matching by default, preventing cross-user key disclosure - [PR #30593](https://github.com/BerriAI/litellm/pull/30593)
    - Restrict `/customer/daily/activity` to admin-only - [PR #28849](https://github.com/BerriAI/litellm/pull/28849)
    - `org_admin` sees all org teams 때 the UI sends its own `user_id` - [PR #30247](https://github.com/BerriAI/litellm/pull/30247)
    - internal roles to access vector store CRUD routes 허용 - [PR #30503](https://github.com/BerriAI/litellm/pull/30503)
    - premium only 때 enabling premium metadata fields 요구 - [PR #30506](https://github.com/BerriAI/litellm/pull/30506)
    - Guard `check_and_fix_namespace` against a `None` key - [PR #30435](https://github.com/BerriAI/litellm/pull/30435)
    - at startup 때 `custom_auth` skips `common_checks` enforcement 경고 - [PR #30665](https://github.com/BerriAI/litellm/pull/30665)
    - list-files credentials from team BYOK deployments 해석 - [PR #30495](https://github.com/BerriAI/litellm/pull/30495); preserve `azure_ad_token` through `CredentialLiteLLMParams` for `/v1/files` + batches - [PR #30241](https://github.com/BerriAI/litellm/pull/30241)
    - budget for models not in the cost map 강제 - [PR #24949](https://github.com/BerriAI/litellm/pull/24949)
- **UI**
    - the 가상 키 page from an infinite render loop 중지 - [PR #30397](https://github.com/BerriAI/litellm/pull/30397)
    - Source api-keys identity from `useAuthorized` to stop "User ID is not set" - [PR #30903](https://github.com/BerriAI/litellm/pull/30903)
    - that team models are deleted in the delete-team modal 경고 - [PR #29990](https://github.com/BerriAI/litellm/pull/29990)
    - Three small fixes - Gemini `api_base`, credential form reset, Mode badge - [PR #30419](https://github.com/BerriAI/litellm/pull/30419)
    - Repoint the dead usage-guide link to cost-tracking docs - [PR #30859](https://github.com/BerriAI/litellm/pull/30859)
- **Proxy**
    - SMTP implicit SSL (port 465) 지원 - [PR #30395](https://github.com/BerriAI/litellm/pull/30395)

## AI 통합

### 로깅

- **[OpenTelemetry](../../docs/proxy/logging)**
    - the six `gen_ai.client.*` metrics at v1 parity in v2 emit - [PR #30326](https://github.com/BerriAI/litellm/pull/30326)
    - One v2 logger owns the global provider; scope tenant OTLP creds per exporter - [PR #30590](https://github.com/BerriAI/litellm/pull/30590)
    - v2 gen_ai client metrics to the configured meter provider export - [PR #30549](https://github.com/BerriAI/litellm/pull/30549)
    - Stamp `gen_ai.input/output.messages` on v2 spans - [PR #30548](https://github.com/BerriAI/litellm/pull/30548)
    - Cap metric attribute cardinality with include/exclude lists - [PR #30257](https://github.com/BerriAI/litellm/pull/30257)
    - Record the full error message on the standard exception event in v2 - [PR #30380](https://github.com/BerriAI/litellm/pull/30380)
    - Accept `UPPER_SNAKE_CASE` `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` in v2 - [PR #30562](https://github.com/BerriAI/litellm/pull/30562)
- **일반**
    - `error_message` on `ProxyException` failures in spend logs 보존 - [PR #30381](https://github.com/BerriAI/litellm/pull/30381)

### 가드레일

- **Cisco AI Defense** - 새 통합 - [PR #28249](https://github.com/BerriAI/litellm/pull/28249)
- **Repello Argus** - 새 통합 - [PR #30465](https://github.com/BerriAI/litellm/pull/30465)
- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)** - add missing UK PII entity types - [PR #30537](https://github.com/BerriAI/litellm/pull/30537); don't mask the live request when the guardrail is `logging_only` - [PR #30461](https://github.com/BerriAI/litellm/pull/30461)
- **AIM** - return 400 not 500 때 AIM blocks a request - [PR #30573](https://github.com/BerriAI/litellm/pull/30573)
- **일반**
    - re-initializing DB guardrails on every poll 중지 - [PR #30542](https://github.com/BerriAI/litellm/pull/30542)
    - Run the `pre_call` hook once for model-level guardrails - [PR #30543](https://github.com/BerriAI/litellm/pull/30543)
    - `disable_global_guardrails` overrides the team list - [PR #28563](https://github.com/BerriAI/litellm/pull/28563)
    - Surface OpenAI moderation `violation_categories` on guardrail traces - [PR #30659](https://github.com/BerriAI/litellm/pull/30659)

### Secret Managers

- **[AWS Secrets Manager](../../docs/secret)** - cross-region replication - [PR #30368](https://github.com/BerriAI/litellm/pull/30368)

## 비용 추적, Budgets 및 Rate Limiting

- **Service-tier pricing** - apply the `service_tier` suffix to above-threshold cache rates 및 expose priority+threshold keys in `ModelInfo` - [PR #30450](https://github.com/BerriAI/litellm/pull/30450); price and surface the Anthropic response `service_tier` in cost tracking - [PR #30558](https://github.com/BerriAI/litellm/pull/30558); stop non-string `service_tier` from silently dropping cost tracking - [PR #30690](https://github.com/BerriAI/litellm/pull/30690), [PR #30706](https://github.com/BerriAI/litellm/pull/30706)
- **Budgets** - enforce budgets against authoritative DB spend 때 the cross-pod counter is stale - [PR #30684](https://github.com/BerriAI/litellm/pull/30684); release a budget reservation when a request is cancelled mid-flight - [PR #30522](https://github.com/BerriAI/litellm/pull/30522); recompute `budget_reset_at` when `budget_duration` changes - [PR #30555](https://github.com/BerriAI/litellm/pull/30555)
- **Rate limiting** - prevent internal `parallel_request_limiter` fields from leaking to upstream providers - [PR #30545](https://github.com/BerriAI/litellm/pull/30545)
- **Spend accuracy** - record partial spend on the failure row for interrupted streams - [PR #30788](https://github.com/BerriAI/litellm/pull/30788); recover output tokens for interrupted Anthropic streams - [PR #30787](https://github.com/BerriAI/litellm/pull/30787); stop Perplexity double-billing reasoning tokens in the manual cost fallback - [PR #30488](https://github.com/BerriAI/litellm/pull/30488); correct cached-token usage with `ChatCompletion사용법Block` - [PR #30422](https://github.com/BerriAI/litellm/pull/30422)
- **사용법 aggregation** - drain all daily-spend batches per flush cycle - [PR #30505](https://github.com/BerriAI/litellm/pull/30505); show session-aggregate cost and duration in request logs - [PR #30507](https://github.com/BerriAI/litellm/pull/30507); coalesce null aggregates for no-spend keys - [PR #29945](https://github.com/BerriAI/litellm/pull/29945); remove timezone date expansion in daily-activity aggregation - [PR #29569](https://github.com/BerriAI/litellm/pull/29569)

## MCP Gateway

- Make the MCP gateway name 및 description configurable via env vars - [PR #30473](https://github.com/BerriAI/litellm/pull/30473)
- Fail closed 때 the scope filter resolves to no servers - [PR #30353](https://github.com/BerriAI/litellm/pull/30353)
- Re-raise instead of silently dropping MCP team permissions - [PR #30477](https://github.com/BerriAI/litellm/pull/30477)
- Drop the phantom 401 span on delegated OAuth2 tool calls - [PR #30494](https://github.com/BerriAI/litellm/pull/30494)
- Default the Linear MCP registry entry to streamable HTTP - [PR #30396](https://github.com/BerriAI/litellm/pull/30396)
- native tools in the semantic filter hook 보존 - [PR #26650](https://github.com/BerriAI/litellm/pull/26650)

## 성능 / 부하 분산 / 안정성 개선

- **Streaming connection hygiene** - cancel the upstream Gemini request 및 release the httpx connection on client disconnect - [PR #30075](https://github.com/BerriAI/litellm/pull/30075); close the upstream LLM stream when the client disconnects mid-stream - [PR #30245](https://github.com/BerriAI/litellm/pull/30245); release the aiohttp connection when stream iteration ends abnormally - [PR #30271](https://github.com/BerriAI/litellm/pull/30271); use `e.request_data` for `logging_obj` in `ModifyResponseException` streaming passthrough - [PR #30800](https://github.com/BerriAI/litellm/pull/30800)
- **캐싱** - add a valkey-semantic cache backend 및 fix semantic-cache scope keys - [PR #30675](https://github.com/BerriAI/litellm/pull/30675); url-encode the object name in the GCS cache GET path - [PR #30378](https://github.com/BerriAI/litellm/pull/30378); allow `use_redis_transaction_buffer` without a Redis cache - [PR #28764](https://github.com/BerriAI/litellm/pull/28764)
- **Router / fallbacks** - resolve a list-unhashable crash on model alias - [PR #30464](https://github.com/BerriAI/litellm/pull/30464); clean pattern_router state on upsert/delete - [PR #29601](https://github.com/BerriAI/litellm/pull/29601); preserve the fallback model in SDK fallback responses - [PR #28260](https://github.com/BerriAI/litellm/pull/28260); add `expose_router_debug_in_errors` (default True) to redact internal model_group/fallback names - [PR #30418](https://github.com/BerriAI/litellm/pull/30418)
- **Startup / workers** - fail fast on a non-PostgreSQL `DATABASE_URL` instead of hanging - [PR #30366](https://github.com/BerriAI/litellm/pull/30366); add `--max_requests_before_restart_jitter` to stagger worker restarts - [PR #30601](https://github.com/BerriAI/litellm/pull/30601); fix the IAM refresh-engine watcher race - [PR #30183](https://github.com/BerriAI/litellm/pull/30183); release the cron pod-lock by matching `async_set_cache` JSON encoding - [PR #30600](https://github.com/BerriAI/litellm/pull/30600)
- **Health checks** - correct Bedrock embedding health checks - [PR #30583](https://github.com/BerriAI/litellm/pull/30583); bump the health-check `max_tokens` default to 16 for GPT-5 compatibility - [PR #30708](https://github.com/BerriAI/litellm/pull/30708), [PR #26610](https://github.com/BerriAI/litellm/pull/26610)
- **Developer experience / CI** - around 30 PRs hardening the lint 및 type-check gates (standardizing on basedpyright, dropping mypy, ratcheting any-discipline budgets), an osv-scanner lockfile workflow, zizmor PR gating, a local fake-OpenAI test endpoint replacing the shared mock, dependency bumps, 및 a pinned build toolchain.

## 문서 업데이트

- 1-click AWS/GCP Terraform deploy buttons 및 fix README deploy-button rendering 추가 - [PR #29879](https://github.com/BerriAI/litellm/pull/29879)
- Strengthen the coding conventions in `CLAUDE.md` - [PR #30333](https://github.com/BerriAI/litellm/pull/30333)
- Clarify the Linear portion of the PR template - [PR #30766](https://github.com/BerriAI/litellm/pull/30766)

## 새 기여자

@hannahmadison, @ayushh0110, @Dotify71, @munnr, @V-3604, @yrk111222, @Silvenga, @djmaze, @apshada, @HumphreySun98, @Harshxth, @tomoyat1, @S0ngRu1, @habonlaci, @moshemalawach, @nahrinoda, @Vedant-Agarwal, @lollinng, @anneheartrecord, @hdt12a1, @vineethsaivs, @krishvsoni, @rvishwas26, @santino18727-debug, @darktheorys, @songkuan-zheng, @Thijmen, @Kropiunig, @jay-tau, @KnyazSh, @koztkozt, @us, @Anuj7411, @zkryakgul, @lavish619, @EugeneLugovtsov, @Bochenski, @menardorama, @factnn, @semmons99, @nitishagar, @FadelT, @jho1-godaddy, @yucheng-berri, @ad1269, @shzdehmd, @vanika02, @Nithish-Yenaganti, @simantak-dabhade, @devYRPauli, @clpatterson, @tcconnally

## Full 변경 이력

[`v1.89.0...v1.90.0-rc.1`](https://github.com/BerriAI/litellm/compare/v1.89.0...v1.90.0-rc.1)
