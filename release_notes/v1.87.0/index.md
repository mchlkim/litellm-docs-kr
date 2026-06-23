---
title: "v1.87.0 - OCI Generative AI Provider, Gemini 3.5 Flash Day-0, MCP UI for OAuth Servers"
slug: "v1-87-0"
date: 2026-05-23T16:35:00
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
docker.litellm.ai/berriai/litellm:1.87.0
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.87.0
```

</TabItem>
</Tabs>

## 주요 변경 사항

- **OCI Generative AI as a first-class provider** — production-ready chat, embeddings, streaming, reasoning 및 tool use across Cohere Command-A, Meta Llama 3.1/3.2/3.3/4, xAI Grok 3/4, Google Gemini 2.5, 및 OpenAI GPT-5 hosted on OCI; full model-pricing catalog included.
- **Gemini 3.5 Flash Day-0 support** — `gemini-3.5-flash` 및 `gemini-3.1-flash-lite` ship on Vertex AI, Google AI Studio, 및 OpenRouter with full pricing, function calling, web search, code execution, 및 managed-agents support.
- **MCP UI for OAuth tool calls** — the dashboard now resolves tool list 및 tool call against OAuth-protected MCP servers directly, 추가로 native MCP OAuth support for Cursor 및 clearer OAuth error messages.
- **Codex CLI auth hardening** — JWT-derived team aliases 및 SSO form-URL flow for the OpenAI Codex CLI, 추가로 allowlisted OIDC-claim persistence across the CLI SSO poll.
- **Anthropic streaming hot-path perf** — ~90% lower TTFT overhead 및 higher sustained throughput on the proxy's Anthropic `/v1/messages` SSE path, measured on a real 4-pod deployment against both Anthropic 및 Bedrock Invoke (wire output is parity-tested); 추가로 lazy-loaded response streaming for Bedrock SageMaker.

## 새 프로바이더 및 엔드포인트

### 새 프로바이더 (1 새 프로바이더)

| Provider | 지원 LiteLLM 엔드포인트 | 설명 |
| --- | --- | --- |
| [OCI Generative AI](https://docs.litellm.ai/docs/providers/oci) | `/v1/chat/completions`, `/v1/embeddings` | Official Oracle Cloud Infrastructure Generative AI integration. Production-ready support for chat, streaming, reasoning, tool calling, 및 embeddings across Cohere Command-A (incl. Reasoning + Vision), Meta Llama 3.1 / 3.2 / 3.3 / 4, xAI Grok 3 / 4, Google Gemini 2.5, 및 OpenAI GPT-5. Includes full model-pricing catalog. - [PR #28223](https://github.com/BerriAI/litellm/pull/28223) |

## New 모델 / Updated 모델

#### 새 모델 지원 (22 새 모델)

| Provider | Model | 컨텍스트 윈도우 | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| --- | --- | --- | --- | --- | --- |
| Azure | `azure/speech/azure-stt` | — | $0.000278/sec | — | Audio transcription |
| Fireworks AI | `fireworks_ai/glm-5p1` | 202,800 | $1.40 | $4.40 | Reasoning |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/glm-5p1` | 202,800 | $1.40 | $4.40 | Reasoning |
| Gemini | `gemini/gemini-3.5-flash` | 1,048,576 | $1.50 | $9.00 | Audio input, function calling, parallel function calling, PDF input, prompt caching, reasoning, response schema, system messages, tool choice, URL context, video input, vision, web search, service tier |
| Gemini | `gemini/gemini-3.1-flash-lite` | 1,048,576 | $0.25 | $1.50 | Audio input, code execution, file search, function calling, parallel function calling, PDF input, prompt caching, reasoning, response schema, system messages, tool choice, URL context, video input, vision, web search, service tier |
| Vertex AI | `vertex_ai/gemini-3.5-flash` | 1,048,576 | $1.50 | $9.00 | Same as Gemini direct |
| Vertex AI | `vertex_ai/gemini-3.1-flash-lite` | 1,048,576 | $0.25 | $1.50 | Same as Gemini direct |
| Mistral | `mistral/ministral-8b-2512` | 262,144 | $0.15 | $0.15 | Assistant prefill, function calling, response schema, tool choice, vision |
| OCI | `oci/openai.gpt-5` | 272,000 | $1.25 | $10.00 | Function calling, reasoning, response schema, vision |
| OCI | `oci/openai.gpt-5-mini` | 272,000 | $0.25 | $2.00 | Function calling, reasoning, response schema, vision |
| OCI | `oci/openai.gpt-5-nano` | 272,000 | $0.05 | $0.40 | Function calling, reasoning, response schema, vision |
| OCI | `oci/cohere.command-a-reasoning` | 256,000 | $1.56 | $1.56 | Reasoning, native streaming |
| OCI | `oci/cohere.command-a-vision` | 256,000 | $1.56 | $1.56 | Function calling, vision, native streaming |
| OCI | `oci/cohere.embed-multilingual-image-v3.0` | 512 | $0.10 | — | Embeddings, vision |
| OCI | `oci/meta.llama-3.1-8b-instruct` | 128,000 | $0.72 | $0.72 | Function calling, native streaming |
| OpenRouter | `openrouter/google/gemini-3.1-flash-lite` | 1,048,576 | $0.25 | $1.50 | Audio input, code execution, file search, function calling, parallel function calling, PDF input, prompt caching, reasoning, response schema, system messages, tool choice, URL context, video input, vision, web search |
| OpenRouter | `openrouter/xiaomi/mimo-v2.5` | 1,048,576 | $0.40 | $2.00 | Function calling, reasoning, vision, audio input, video input, response schema, prompt caching |
| OpenRouter | `openrouter/xiaomi/mimo-v2.5-pro` | 1,048,576 | $1.00 | $3.00 | Function calling, reasoning, response schema, prompt caching |
| Reducto | `reducto/parse-v3` | — | — | — | OCR |
| Reducto | `reducto/parse-legacy` | — | — | — | OCR |

Plus a Vertex / Anthropic `supports_output_config` flag flip on all `claude-opus-4-6`, `claude-opus-4-7`, 및 `claude-sonnet-4-6` regional variants, 및 an `oci/*` `supports_native_streaming` flip across Cohere, Gemini, Meta, 및 xAI catalog entries.

#### 기능

- **[Gemini](https://docs.litellm.ai/docs/providers/gemini)**
    - Day-0 support for `gemini-3.5-flash` - [PR #28268](https://github.com/BerriAI/litellm/pull/28268)
    - `gemini-3.1-flash-lite` model cost map 추가 - [PR #28320](https://github.com/BerriAI/litellm/pull/28320)
    - Additional `gemini-3.1-flash-lite` pricing entry - [PR #27933](https://github.com/BerriAI/litellm/pull/27933)
    - Gemini managed-agents support - [PR #28270](https://github.com/BerriAI/litellm/pull/28270)
- **[Azure](https://docs.litellm.ai/docs/providers/azure)**
    - Azure Speech STT config support 추가 - [PR #27482](https://github.com/BerriAI/litellm/pull/27482)
- **[OpenRouter](https://docs.litellm.ai/docs/providers/openrouter)**
    - Xiaomi MiMo-V2.5 및 MiMo-V2.5-Pro model entries 추가 - [PR #27700](https://github.com/BerriAI/litellm/pull/27700)
    - `openrouter/google/gemini-3.1-flash-lite` pricing entry 추가 - [PR #28280](https://github.com/BerriAI/litellm/pull/28280)

#### 버그 수정

- **[Vertex AI](https://docs.litellm.ai/docs/providers/vertex)**
    - Omit `function_call.id` on Vertex Gemini 3.5+ tool turns (the field is rejected by the new schema) - [PR #28324](https://github.com/BerriAI/litellm/pull/28324)
    - `vertex_gemma`: strip `context_management` from the request body - [PR #28438](https://github.com/BerriAI/litellm/pull/28438)
- **[Bedrock](https://docs.litellm.ai/docs/providers/bedrock)**
    - `bedrock/cohere`: send `embedding_types` as a JSON array, not a string - [PR #28172](https://github.com/BerriAI/litellm/pull/28172)
    - Sanitize batch metadata to prevent Pydantic `ValidationError` - [PR #28202](https://github.com/BerriAI/litellm/pull/28202)
    - Decouple STS region from Bedrock `aws_region_name` - [PR #28245](https://github.com/BerriAI/litellm/pull/28245)
- **[SageMaker](https://docs.litellm.ai/docs/providers/sagemaker)**
    - Send the native Cohere embed payload to Cohere SageMaker endpoints - [PR #28613](https://github.com/BerriAI/litellm/pull/28613)
- **[DeepSeek](https://docs.litellm.ai/docs/providers/deepseek)**
    - the native `/anthropic/v1/messages` endpoint 및 sanitize tools 사용 - [PR #28200](https://github.com/BerriAI/litellm/pull/28200)
- **[Azure](https://docs.litellm.ai/docs/providers/azure)**
    - Decouple Azure OpenAI deployment ID from model name via `base_model` 따라서 GPT-5 model routing works on custom deployment names - [PR #28490](https://github.com/BerriAI/litellm/pull/28490)
    - Router: use the forwarded `model_id` for native Azure container IDs - [PR #27921](https://github.com/BerriAI/litellm/pull/27921)
- **[vLLM](https://docs.litellm.ai/docs/providers/vllm)**
    - Anthropic tool-call transformation on vLLM deployments 수정 - [PR #28549](https://github.com/BerriAI/litellm/pull/28549)

## LLM API 엔드포인트

#### 기능

- **[Interactions API](https://docs.litellm.ai/docs/interactions)**
    - to the Google Interactions API steps schema (May 2026 revision) 마이그레이션 - [PR #28153](https://github.com/BerriAI/litellm/pull/28153)
- **Google-native passthrough**
    - Decode bytes 및 pass 통해 SSE for Google-native `streamGenerateContent` (no more `b'...'` literals on the wire) - [PR #28213](https://github.com/BerriAI/litellm/pull/28213)

#### 버그

- **[Responses API](https://docs.litellm.ai/docs/response_api)**
    - Forward `timeout` on the completion-transformation path for Anthropic, Bedrock, 및 Vertex - [PR #28133](https://github.com/BerriAI/litellm/pull/28133)
    - Accept dict-shape `reasoning_effort` from the Anthropic Responses bridge - [PR #28201](https://github.com/BerriAI/litellm/pull/28201)
    - Wrap `aresponses` streaming iterator for mid-stream router fallbacks - [PR #28215](https://github.com/BerriAI/litellm/pull/28215)
    - Unblock staging — mypy + coverage for `aresponses` streaming fallback - [PR #28318](https://github.com/BerriAI/litellm/pull/28318)
    - Anthropic `cache_control` from OpenAI Responses API requests 제거 - [PR #28431](https://github.com/BerriAI/litellm/pull/28431)
    - the OpenAI `SSEDecoder` for Responses API streaming 사용 - [PR #28566](https://github.com/BerriAI/litellm/pull/28566)
    - Replay `openai/responses` bridge cache hits as chat streams - [PR #28158](https://github.com/BerriAI/litellm/pull/28158)
- **[Interactions API](https://docs.litellm.ai/docs/interactions)**
    - Never drop streamed text deltas; always emit the terminal completion - [PR #28394](https://github.com/BerriAI/litellm/pull/28394)
- **[Batch API](https://docs.litellm.ai/docs/batches)**
    - Normalize batch file IDs 전에 the `ManagedObjectTable` write - [PR #28339](https://github.com/BerriAI/litellm/pull/28339)

## 관리 엔드포인트 / UI

#### 기능

- **모델 + Endpoints**
    - a pause/resume Switch on the models table 추가 - [PR #28151](https://github.com/BerriAI/litellm/pull/28151)
- **Spend 로그**
    - Consolidate filter state 및 extract components in the UI - [PR #25847](https://github.com/BerriAI/litellm/pull/25847)
- **Playground**
    - Interactions API endpoint in the Playground with SSE streaming - [PR #28156](https://github.com/BerriAI/litellm/pull/28156)
- **Passthrough Routes**
    - Team passthrough routes — create parity + edit-load fix - [PR #28098](https://github.com/BerriAI/litellm/pull/28098)
    - Gate `team.allowed_passthrough_routes` writes to proxy admins - [PR #28097](https://github.com/BerriAI/litellm/pull/28097)
- **Auth / Codex CLI**
    - Codex CLI JWT team alias propagation - [PR #28621](https://github.com/BerriAI/litellm/pull/28621)
    - Codex CLI SSO form-URL flow - [PR #28271](https://github.com/BerriAI/litellm/pull/28271)
    - Persist allowlisted OIDC claims in the CLI SSO poll - [PR #28463](https://github.com/BerriAI/litellm/pull/28463)
- **가상 키**
    - Encrypt `callback_vars` in key/team metadata at rest in the DB - [PR #27141](https://github.com/BerriAI/litellm/pull/27141)

#### 버그

- **Auth / Discovery**
    - Hydrate wildcard discovery credentials 따라서 OIDC discovery works against wildcarded providers - [PR #28284](https://github.com/BerriAI/litellm/pull/28284)
- **Spend 로그**
    - Restore the log-filter loading indicator - [PR #28282](https://github.com/BerriAI/litellm/pull/28282)
- **End-User 로그**
    - end-user logs surfacing 수정 - [PR #27758](https://github.com/BerriAI/litellm/pull/27758)

## AI 통합

### 로깅

- **[Prometheus](https://docs.litellm.ai/docs/proxy/logging#prometheus)**
    - per-token-type detail metrics — five sparse counters that break out `usage.prompt_tokens_details` / `usage.completion_tokens_details` fields providers already report (LIT-3220) emit - [PR #28372](https://github.com/BerriAI/litellm/pull/28372)
    - `user_email` 및 `user_alias` labels to user budget metrics 추가 - [PR #28155](https://github.com/BerriAI/litellm/pull/28155)
- **[OpenTelemetry](https://docs.litellm.ai/docs/proxy/logging#opentelemetry)**
    - Propagate `team_id` 및 `team_alias` to all child OTEL spans - [PR #28273](https://github.com/BerriAI/litellm/pull/28273)
    - a guardrail span on violations 및 surface status + categories emit - [PR #28364](https://github.com/BerriAI/litellm/pull/28364)
    - Serialize `guardrail_response` to JSON in OTEL traces - [PR #28362](https://github.com/BerriAI/litellm/pull/28362)
    - Stamp `http.response.status_code` on all error responses - [PR #28405](https://github.com/BerriAI/litellm/pull/28405)

### 가드레일

- **[Microsoft Purview DLP](https://docs.litellm.ai/docs/proxy/guardrails)**
    - New guardrail integration for Microsoft Purview DLP - [PR #24966](https://github.com/BerriAI/litellm/pull/24966)

## 비용 추적, Budgets 및 Rate Limiting

- **Spend Counter** — Seed the Redis counter via `SET NX` to prevent cross-pod double-seed on cold start - [PR #27854](https://github.com/BerriAI/litellm/pull/27854)
- **Cost Tracking** — Recalculate cost 후 router retry failures 따라서 the logged cost reflects the actual attempt that succeeded - [PR #28476](https://github.com/BerriAI/litellm/pull/28476)
- **Cost Tracking** — Treat `litellm_provider=None` as a wildcard in `_check_provider_match` 따라서 cost lookup works for catalog entries that omit the provider field - [PR #28523](https://github.com/BerriAI/litellm/pull/28523)

## MCP Gateway

- **OAuth in the UI** — Add tool-call 및 tool-list support via the dashboard for OAuth-protected MCP servers - [PR #28454](https://github.com/BerriAI/litellm/pull/28454)
- **Cursor OAuth** — Allow native MCP OAuth support for Cursor - [PR #28327](https://github.com/BerriAI/litellm/pull/28327)
- **Auth Resolution** — JWT on `tools/list` 및 REST `tools/call` server resolution - [PR #28227](https://github.com/BerriAI/litellm/pull/28227)
- **Cold-Start Init** — Forward upstream `initialize` instructions on cold gateway init - [PR #28231](https://github.com/BerriAI/litellm/pull/28231)
- **OAuth Errors** — Add `error_description` 및 hint to OAuth flow error responses - [PR #28471](https://github.com/BerriAI/litellm/pull/28471)
- **Inspector** — Trim whitespace from MCP inspector tool-call inputs - [PR #28203](https://github.com/BerriAI/litellm/pull/28203)

## 성능 / 부하 분산 / 안정성 개선

- **Anthropic `/v1/messages` streaming hot path** — cut per-request 및 per-chunk overhead on the proxy's Anthropic streaming path, with byte-identical wire output guaranteed by parity tests that diff the logged 및 billed payloads between the fast 및 legacy paths. Measured on a real 4-pod `m7i.xlarge` deployment (no HPA) streaming 256 `text_delta` chunks per request, against both Anthropic 및 Bedrock Invoke — **TTFT overhead ~90% lower** with **higher sustained throughput** (full numbers below) - [PR #28289](https://github.com/BerriAI/litellm/pull/28289)
    - Skip work that's a no-op in the default config: the per-chunk Datadog span 때 tracing is off, the per-chunk streaming hook 때 no callback / guardrail / cost-injection is active, 및 the agentic post-processing wrapper 때 no callback overrides its hook (it otherwise buffers every chunk 및 rebuilds the response from SSE just to call hooks that all return `(False, {})`).
    - doing the same work twice per request: serialize the request body once 및 reuse it for the pre-call log 및 the wire, memoize the optional-params type-hint resolution (~80µs/request), 및 skip the redundant `strip_empty_text_blocks` scan 때 the async wrapper already sanitized. 중지
    - Cheaper end-of-stream reconstruction: collapse the homogeneous run of `content_block_delta` text events into a single equivalent SSE event 전에 `stream_chunk_builder`, removing O(output-token) `ModelResponseStream` constructions; tool-use / thinking / citations streams fall back to the unchanged legacy path.
    - Cheaper hot-path logging: gate debug f-string evaluation behind `isEnabledFor(DEBUG)`, hoist `cost_injection_active` out of the per-chunk loop, 및 drop one async-generator layer per chunk in `async_sse_data_generator`.

*Anthropic `/v1/messages` streaming, 256 `text_delta` chunks/request — 4 pods on `m7i.xlarge` (4 vCPU / 16 GB), no HPA:*

| Metric | Baseline (`v1.87.0-dev.1`) | Patched ([#28289](https://github.com/BerriAI/litellm/pull/28289)) | Change |
| --- | --- | --- | --- |
| TPM (p50 / p95 / p99) | 2634 / 2808 / 2867 | 2952 / 2968 / 2971 | +12% / +6% / +4% |
| TTFT overhead % (p50 / p95 / p99) | 2220 / 3057 / 3111 | 165 / 316 / 328 | ~90% lower |

- **Bedrock / SageMaker** — Switch to lazy loading for response streaming - [PR #28189](https://github.com/BerriAI/litellm/pull/28189)
- **Granian ASGI** — Add Granian as a supported ASGI server for better throughput stability - [PR #26027](https://github.com/BerriAI/litellm/pull/26027)
- **Prisma** — Expose Prisma idle/connect timeout + extra DB URL params 따라서 production deployments can tune connection pools - [PR #28395](https://github.com/BerriAI/litellm/pull/28395)
- **Proxy auth** — Strict media-type match for form bodies (defensive against ambiguous `Content-Type`) - [PR #27939](https://github.com/BerriAI/litellm/pull/27939)
- **Proxy auth** — Carry the ASGI path into the WebSocket auth synthetic Request 따라서 auth resolves the right route - [PR #27940](https://github.com/BerriAI/litellm/pull/27940)
- **Docker** — Restore `npm` to the non-root builder image 따라서 UI builds run there - [PR #28519](https://github.com/BerriAI/litellm/pull/28519)
- **Helm** — Drop the `main-` prefix from the default image tag - [PR #28710](https://github.com/BerriAI/litellm/pull/28710)
- **License check** — Read PEP 639 `license-expression` metadata in `check_licenses` - [PR #28529](https://github.com/BerriAI/litellm/pull/28529)

## 문서 업데이트

- the incorrect `/v1/agents` request example 수정 - [PR #28131](https://github.com/BerriAI/litellm/pull/28131)
- misleading credential-passing examples in Gemini-agents GET/DELETE docstrings 수정 - [PR #28293](https://github.com/BerriAI/litellm/pull/28293)

## 일반 Proxy 개선

Testing, CI & build hardening:

- Behavior-pinning harness + Key Tier-1 matrix (및 tier-2/3 + team management endpoints + phase-4 payload matrix) - [PR #28321](https://github.com/BerriAI/litellm/pull/28321), [PR #28441](https://github.com/BerriAI/litellm/pull/28441), [PR #28620](https://github.com/BerriAI/litellm/pull/28620), [PR #28681](https://github.com/BerriAI/litellm/pull/28681)
- Stabilize image-edit VCR cassettes to stop live `gpt-image-1` spend - [PR #28110](https://github.com/BerriAI/litellm/pull/28110)
- realtime + rerank tests off shut-down upstream models; replace `gpt-4o-audio-preview` with `gpt-audio-1.5`; expect `session.created` as xAI realtime initial event 마이그레이션 - [PR #28191](https://github.com/BerriAI/litellm/pull/28191), [PR #28281](https://github.com/BerriAI/litellm/pull/28281), [PR #28424](https://github.com/BerriAI/litellm/pull/28424)
- Harden the flaky proxy callback-leak detector - [PR #28195](https://github.com/BerriAI/litellm/pull/28195)
- E2E runner migrated to `uv`; add an "All Proxy 모델" key test - [PR #28313](https://github.com/BerriAI/litellm/pull/28313)
- UI-e2e: admin key creation with a specific proxy model; forward `LITELLM_LICENSE` to the UI e2e proxy - [PR #28365](https://github.com/BerriAI/litellm/pull/28365), [PR #28398](https://github.com/BerriAI/litellm/pull/28398)
- Vertex AI grounding test tolerates transient 500; streaming test tolerates Vertex 429 wrapped in `MidStreamFallbackError` - [PR #28503](https://github.com/BerriAI/litellm/pull/28503), [PR #28669](https://github.com/BerriAI/litellm/pull/28669)
- black to 26.3.1 및 reapply formatting; one-shot lint fix 업데이트 - [PR #28525](https://github.com/BerriAI/litellm/pull/28525), [PR #28639](https://github.com/BerriAI/litellm/pull/28639)
- `audio_transcription_config` in the model-prices schema 허용 - [PR #28708](https://github.com/BerriAI/litellm/pull/28708)
- the dead old Playwright e2e suite 제거 - [PR #28632](https://github.com/BerriAI/litellm/pull/28632)
- Routine dependency/CI bumps - [PR #28287](https://github.com/BerriAI/litellm/pull/28287), [PR #28524](https://github.com/BerriAI/litellm/pull/28524), [PR #28528](https://github.com/BerriAI/litellm/pull/28528), [PR #27665](https://github.com/BerriAI/litellm/pull/27665), [PR #28296](https://github.com/BerriAI/litellm/pull/28296), [PR #28303](https://github.com/BerriAI/litellm/pull/28303), [PR #28707](https://github.com/BerriAI/litellm/pull/28707)

### 담당 영역별 PR 요약

PRs by ownership area (total: 93)
  - Other (CI / tests / build hardening): 25
  - 모델 & Providers (incl. 새 프로바이더): 18
  - UI / Auth & Management: 12
  - LLM API Endpoints: 11
  - 성능: 9
  - Logging: 6
  - MCP: 6
  - Spend / Budgets / Rate Limits: 3
  - 문서: 2
  - 가드레일: 1

## 새 기여자

- @IshaMeera made their first contribution in [#28131](https://github.com/BerriAI/litellm/pull/28131)
- @TorvaldUtne made their first contribution in [#27700](https://github.com/BerriAI/litellm/pull/27700)
- @adityasingh2400 made their first contribution in [#28523](https://github.com/BerriAI/litellm/pull/28523)
- @cwang-otto made their first contribution in [#28133](https://github.com/BerriAI/litellm/pull/28133)
- @ro31337 made their first contribution in [#28280](https://github.com/BerriAI/litellm/pull/28280)
- @withomasmicrosoft made their first contribution in [#28490](https://github.com/BerriAI/litellm/pull/28490)

**Full 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.86.0...v1.87.0

---

## 05/23/2026 (`v1.87.0`)

* 새 프로바이더: 1
* New 모델 / Updated 모델: 17
* LLM API Endpoints: 11
* Management Endpoints / UI: 12
* AI Integrations (Logging / 가드레일 / Secret Managers): 7
* 비용 추적, Budgets 및 Rate Limiting: 3
* MCP Gateway: 6
* 성능 / 부하 분산 / 안정성 improvements: 9
* 일반 Proxy Improvements (testing / CI / build): 25
* 문서 업데이트: 2

Total: 93 PRs
