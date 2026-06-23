---
title: "v1.80.11-stable - Google Interactions API"
slug: "v1-80-11"
date: 2025-12-20T10:00:00
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

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.80.11-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.11
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Gemini 3 Flash Preview** - [reasoning 기능을 포함한 Google Gemini 3 Flash Preview Day 0 지원](../../docs/providers/gemini)
- **Stability AI Image Generation** - [Stability AI 이미지 생성 및 편집용 새 provider](../../docs/providers/stability)
- **LiteLLM Content Filter** - [이미지 지원과 함께 harmful content, bias, PII detection을 제공하는 내장 가드레일](../../docs/proxy/guardrails/litellm_content_filter)
- **New Provider: Venice.ai** - providers.json을 통한 Venice.ai API 지원
- **Unified Skills API** - [Skills API가 Anthropic, Vertex, Azure, Bedrock 전반에서 동작](../../docs/skills)
- **Azure Sentinel Logging** - [Azure Sentinel용 새 logging integration](../../docs/observability/azure_sentinel)
- **가드레일 Load Balancing** - [여러 guardrail provider 간 load balance](../../docs/proxy/guardrails)
- **Email Budget Alerts** - [budget에 도달하면 email notification 전송](../../docs/proxy/email)
- **UI의 Cloudzero integration** - UI에서 Cloudzero integration을 직접 설정

---

### UI의 Cloudzero integration {#cloudzero-integration-on-ui}

<Image
img={require('../../img/ui_cloudzero.png')}
style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이제 사용자는 UI에서 Cloudzero integration을 직접 구성할 수 있습니다.

---
### 성능: LiteLLM SDK의 memory 사용량 및 import latency 50% 감소 {#performance-50-reduction-in-memory-usage-and-import-latency-for-the-litellm-sdk}

`litellm.__init__.py`를 완전히 재구성해 무거운 import를 실제로 필요할 때까지 지연하고, **109개 component**에 lazy loading을 구현했습니다.

이번 refactoring에는 **41개 provider config class**, **40개 utility function**, cache 구현(Redis, DualCache, InMemoryCache), HTTP handler, logging, type 및 기타 무거운 dependency가 포함됩니다. tiktoken, boto3 같은 무거운 library는 이제 import 시점에 즉시 load되지 않고 필요할 때 load됩니다.

이 변경은 cold start 시간과 memory footprint가 중요한 serverless function, Lambda deployment, container 환경에서 특히 유용합니다.

---

## 신규 provider 및 endpoint {#new-providers-and-endpoints}

### 신규 provider(5개) {#new-providers-5-new-providers}

| Provider | 지원되는 LiteLLM endpoint | 설명 |
| -------- | ------------------- | ----------- |
| [Stability AI](../../docs/providers/stability) | `/images/generations`, `/images/edits` | Stable Diffusion 3, SD3.5, image editing 및 generation |
| Venice.ai | `/chat/completions`, `/messages`, `/responses` | providers.json을 통한 Venice.ai API integration |
| [Pydantic AI Agents](../../docs/providers/pydantic_ai_agent) | `/a2a` | A2A protocol workflow용 Pydantic AI agent |
| [VertexAI Agent Engine](../../docs/providers/vertex_ai_agent_engine) | `/a2a` | agentic workflow용 Google Vertex AI Agent Engine |
| [LinkUp Search](../../docs/search/linkup) | `/search` | LinkUp web search API integration |

### 신규 LLM API endpoint(2개) {#new-llm-api-endpoints-2-new-endpoints}

| Endpoint | Method | 설명 | 문서 |
| -------- | ------ | ----------- | ------------- |
| `/interactions` | POST | conversational AI용 Google Interactions API | [문서](../../docs/interactions) |
| `/search` | POST | reranker를 포함한 RAG Search API | [문서](../../docs/search/index) |

---

## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

#### 신규 모델 지원(55개 이상) {#new-model-support-55-new-models}

| Provider | Model | 컨텍스트 윈도우 | Input($/1M tokens) | Output($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Gemini | `gemini/gemini-3-flash-preview` | 1M | $0.50 | $3.00 | Reasoning, vision, audio, video, PDF 지원 |
| Vertex AI | `vertex_ai/gemini-3-flash-preview` | 1M | $0.50 | $3.00 | Reasoning, vision, audio, video, PDF 지원 |
| Azure AI | `azure_ai/deepseek-v3.2` | 164K | $0.58 | $1.68 | Reasoning, function calling, caching 지원 |
| Azure AI | `azure_ai/cohere-rerank-v4.0-pro` | 32K | $0.0025/query | - | Rerank |
| Azure AI | `azure_ai/cohere-rerank-v4.0-fast` | 32K | $0.002/query | - | Rerank |
| OpenRouter | `openrouter/openai/gpt-5.2` | 400K | $1.75 | $14.00 | Reasoning, vision, caching 지원 |
| OpenRouter | `openrouter/openai/gpt-5.2-pro` | 400K | $21.00 | $168.00 | Reasoning, vision |
| OpenRouter | `openrouter/mistralai/devstral-2512` | 262K | $0.15 | $0.60 | Function calling |
| OpenRouter | `openrouter/mistralai/ministral-3b-2512` | 131K | $0.10 | $0.10 | Function calling, vision 지원 |
| OpenRouter | `openrouter/mistralai/ministral-8b-2512` | 262K | $0.15 | $0.15 | Function calling, vision 지원 |
| OpenRouter | `openrouter/mistralai/ministral-14b-2512` | 262K | $0.20 | $0.20 | Function calling, vision 지원 |
| OpenRouter | `openrouter/mistralai/mistral-large-2512` | 262K | $0.50 | $1.50 | Function calling, vision 지원 |
| OpenAI | `gpt-4o-transcribe-diarize` | 16K | $6.00/audio | - | diarization 포함 audio transcription |
| OpenAI | `gpt-image-1.5-2025-12-16` | - | Various | Various | Image generation |
| Stability | `stability/sd3-large` | - | - | $0.065/image | Image generation |
| Stability | `stability/sd3.5-large` | - | - | $0.065/image | Image generation |
| Stability | `stability/stable-image-ultra` | - | - | $0.08/image | Image generation |
| Stability | `stability/inpaint` | - | - | $0.005/image | Image editing |
| Stability | `stability/outpaint` | - | - | $0.004/image | Image editing |
| Bedrock | `stability.stable-conservative-upscale-v1:0` | - | - | $0.40/image | Image upscaling |
| Bedrock | `stability.stable-creative-upscale-v1:0` | - | - | $0.60/image | Image upscaling |
| Vertex AI | `vertex_ai/deepseek-ai/deepseek-ocr-maas` | - | $0.30 | $1.20 | OCR |
| LinkUp | `linkup/search` | - | $5.87/1K queries | - | Web search |
| LinkUp | `linkup/search-deep` | - | $58.67/1K queries | - | Deep web search |
| GitHub Copilot | 20+ models | Various | - | - | Chat completions |

#### 기능 {#features}

- **[Gemini](../../docs/providers/gemini)**
    - Gemini 3 Flash Preview day 0 support with reasoning 추가 - [PR #18135](https://github.com/BerriAI/litellm/pull/18135)
    - extra_headers in batch embeddings 지원 - [PR #18004](https://github.com/BerriAI/litellm/pull/18004)
    - Propagate token usage 때 generating images - [PR #17987](https://github.com/BerriAI/litellm/pull/17987)
    - JSON instead of form-data for image edit requests 사용 - [PR #18012](https://github.com/BerriAI/litellm/pull/18012)
    - web search requests count 수정 - [PR #17921](https://github.com/BerriAI/litellm/pull/17921)
- **[Anthropic](../../docs/providers/anthropic)**
    - dynamic max_tokens based on model 사용 - [PR #17900](https://github.com/BerriAI/litellm/pull/17900)
    - claude-3-7-sonnet max_tokens to 64K default 수정 - [PR #17979](https://github.com/BerriAI/litellm/pull/17979)
    - OpenAI-compatible API with modify_params=True 추가 - [PR #17106](https://github.com/BerriAI/litellm/pull/17106)
- **[Vertex AI](../../docs/providers/vertex)**
    - Gemini 3 Flash Preview support 추가 - [PR #18164](https://github.com/BerriAI/litellm/pull/18164)
    - reasoning support for gemini-3-flash-preview 추가 - [PR #18175](https://github.com/BerriAI/litellm/pull/18175)
    - image edit credential source 수정 - [PR #18121](https://github.com/BerriAI/litellm/pull/18121)
    - Pass credentials to PredictionServiceClient for custom endpoints - [PR #17757](https://github.com/BerriAI/litellm/pull/17757)
    - multimodal embeddings for text + base64 image combinations 수정 - [PR #18172](https://github.com/BerriAI/litellm/pull/18172)
    - OCR support for DeepSeek model 추가 - [PR #17971](https://github.com/BerriAI/litellm/pull/17971)
- **[Azure AI](../../docs/providers/azure_ai)**
    - Azure Cohere 4 reranking models 추가 - [PR #17961](https://github.com/BerriAI/litellm/pull/17961)
    - Azure DeepSeek V3.2 versions 추가 - [PR #18019](https://github.com/BerriAI/litellm/pull/18019)
    - AzureAnthropicConfig for Claude models in get_provider_chat_config 반환 - [PR #18086](https://github.com/BerriAI/litellm/pull/18086)
- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - reasoning param support for Fireworks AI models 추가 - [PR #17967](https://github.com/BerriAI/litellm/pull/17967)
- **[Bedrock](../../docs/providers/bedrock)**
    - Qwen 2 및 Qwen 3 to get_bedrock_model_id 추가 - [PR #18100](https://github.com/BerriAI/litellm/pull/18100)
    - ttl field 때 routing to bedrock 제거 - [PR #18049](https://github.com/BerriAI/litellm/pull/18049)
    - Bedrock Stability image edit models 추가 - [PR #18254](https://github.com/BerriAI/litellm/pull/18254)
- **[Perplexity](../../docs/providers/perplexity)**
    - API-provided cost instead of manual calculation 사용 - [PR #17887](https://github.com/BerriAI/litellm/pull/17887)
- **[OpenAI](../../docs/providers/openai)**
    - diarize model for audio transcription 추가 - [PR #18117](https://github.com/BerriAI/litellm/pull/18117)
    - gpt-image-1.5-2025-12-16 in model cost map 추가 - [PR #18107](https://github.com/BerriAI/litellm/pull/18107)
    - cost calculation of gpt-image-1 model 수정 - [PR #17966](https://github.com/BerriAI/litellm/pull/17966)
- **[GitHub Copilot](../../docs/providers/github_copilot)**
    - github_copilot model info 추가 - [PR #17858](https://github.com/BerriAI/litellm/pull/17858)
- **[Custom LLM](../../docs/providers/custom_llm_server)**
    - image_edit 및 aimage_edit support 추가 - [PR #17999](https://github.com/BerriAI/litellm/pull/17999)

### 버그 수정

- **[Gemini](../../docs/providers/gemini)**
    - pricing for Gemini 3 Flash on Vertex AI 수정 - [PR #18202](https://github.com/BerriAI/litellm/pull/18202)
    - output_cost_per_image_token for gemini-2.5-flash-image models 추가 - [PR #18156](https://github.com/BerriAI/litellm/pull/18156)
    - properties should be non-empty for OBJECT type 수정 - [PR #18237](https://github.com/BerriAI/litellm/pull/18237)
- **[Qwen](../../docs/providers/fireworks_ai)**
    - qwen3-embedding-8b input per token price 추가 - [PR #18018](https://github.com/BerriAI/litellm/pull/18018)
- **일반**
    - image URL handling 수정 - [PR #18139](https://github.com/BerriAI/litellm/pull/18139)
    - Signed URLs with Query Parameters in Image Processing 지원 - [PR #17976](https://github.com/BerriAI/litellm/pull/17976)
    - none to encoding_format instead of omitting it 추가 - [PR #18042](https://github.com/BerriAI/litellm/pull/18042)

---

## LLM API 엔드포인트

#### 기능

- **[Responses API](../../docs/response_api)**
    - provider specific tools support 추가 - [PR #17980](https://github.com/BerriAI/litellm/pull/17980)
    - custom headers support 추가 - [PR #18036](https://github.com/BerriAI/litellm/pull/18036)
    - tool calls transformation in completion bridge 수정 - [PR #18226](https://github.com/BerriAI/litellm/pull/18226)
    - list format with input_text for tool results 사용 - [PR #18257](https://github.com/BerriAI/litellm/pull/18257)
    - cost tracking in background mode 추가 - [PR #18236](https://github.com/BerriAI/litellm/pull/18236)
    - Claude code responses API bridge errors 수정 - [PR #18194](https://github.com/BerriAI/litellm/pull/18194)
- **[Chat Completions API](../../docs/completion/input)**
    - support for agent skills 추가 - [PR #18031](https://github.com/BerriAI/litellm/pull/18031)
- **[Skills API](../../docs/skills)**
    - Unified Skills API works across Anthropic, Vertex, Azure, Bedrock - [PR #18232](https://github.com/BerriAI/litellm/pull/18232)
- **[Search API](../../docs/search/index)**
    - new RAG Search API with rerankers 추가 - [PR #18217](https://github.com/BerriAI/litellm/pull/18217)
- **[Interactions API](../../docs/interactions)**
    - Google Interactions API on SDK 및 AI Gateway 추가 - [PR #18079](https://github.com/BerriAI/litellm/pull/18079), [PR #18081](https://github.com/BerriAI/litellm/pull/18081)
- **[Image Edit API](../../docs/image_edits)**
    - drop_params support 및 fix Vertex AI config 추가 - [PR #18077](https://github.com/BerriAI/litellm/pull/18077)
- **일반**
    - Skip adding beta headers for Vertex AI as it is not supported - [PR #18037](https://github.com/BerriAI/litellm/pull/18037)
    - managed files endpoint 수정 - [PR #18046](https://github.com/BerriAI/litellm/pull/18046)
    - base_model for non-Azure providers in proxy 허용 - [PR #18038](https://github.com/BerriAI/litellm/pull/18038)

#### 버그

- **일반**
    - basemodel import in guardrail translation 수정 - [PR #17977](https://github.com/BerriAI/litellm/pull/17977)
    - No module named 'fastapi' error 수정 - [PR #18239](https://github.com/BerriAI/litellm/pull/18239)

---

## 관리 endpoint / UI {#management-endpoints-ui}

#### 기능

- **가상 키**
    - master key rotation for credentials table 추가 - [PR #17952](https://github.com/BerriAI/litellm/pull/17952)
    - tag management to preserve encrypted fields in litellm_params 수정 - [PR #17484](https://github.com/BerriAI/litellm/pull/17484)
    - key delete 및 regenerate permissions 수정 - [PR #18214](https://github.com/BerriAI/litellm/pull/18214)
- **모델 + Endpoints**
    - 모델 Conditional Rendering in UI 추가 - [PR #18071](https://github.com/BerriAI/litellm/pull/18071)
    - Health Check Model for Wildcard Model in UI 추가 - [PR #18269](https://github.com/BerriAI/litellm/pull/18269)
    - Auto Resolve Vector Store Embedding Model Config - [PR #18167](https://github.com/BerriAI/litellm/pull/18167)
- **Vector Stores**
    - Milvus Vector Store UI support 추가 - [PR #18030](https://github.com/BerriAI/litellm/pull/18030)
    - Persist Vector Store Settings in Team Update - [PR #18274](https://github.com/BerriAI/litellm/pull/18274)
- **로그 & Spend**
    - LiteLLM Overhead to 로그 추가 - [PR #18033](https://github.com/BerriAI/litellm/pull/18033)
    - Show LiteLLM Overhead in 로그 UI - [PR #18034](https://github.com/BerriAI/litellm/pull/18034)
    - Team ID to Team Alias in 사용법 Page 해석 - [PR #18275](https://github.com/BerriAI/litellm/pull/18275)
    - 사용법 Page Top Key View Button Visibility 수정 - [PR #18203](https://github.com/BerriAI/litellm/pull/18203)
- **SSO & Health**
    - SSO Readiness Health Check 추가 - [PR #18078](https://github.com/BerriAI/litellm/pull/18078)
    - /health/test_connection to resolve env variables like /chat/completions 수정 - [PR #17752](https://github.com/BerriAI/litellm/pull/17752)
- **CloudZero**
    - CloudZero Cost Tracking UI 추가 - [PR #18163](https://github.com/BerriAI/litellm/pull/18163)
    - Delete CloudZero Settings Route 및 UI 추가 - [PR #18168](https://github.com/BerriAI/litellm/pull/18168), [PR #18170](https://github.com/BerriAI/litellm/pull/18170)
- **일반**
    - Update UI path handling for non-root Docker - [PR #17989](https://github.com/BerriAI/litellm/pull/17989)

#### 버그

- **UI Fixes**
    - Login Page Failed To Parse JSON Error 수정 - [PR #18159](https://github.com/BerriAI/litellm/pull/18159)
    - new user route user_id collision handling 수정 - [PR #17559](https://github.com/BerriAI/litellm/pull/17559)
    - Callback Environment Variables Casing 수정 - [PR #17912](https://github.com/BerriAI/litellm/pull/17912)

---

## AI 통합

### 로깅

- **[Azure Sentinel](../../docs/observability/azure_sentinel)**
    - new Azure Sentinel Logger integration 추가 - [PR #18146](https://github.com/BerriAI/litellm/pull/18146)
- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - extraction of top level metadata for custom labels 추가 - [PR #18087](https://github.com/BerriAI/litellm/pull/18087)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - not working log_failure_event 수정 - [PR #18234](https://github.com/BerriAI/litellm/pull/18234)
- **[Arize Phoenix](../../docs/observability/phoenix_integration)**
    - nested spans 수정 - [PR #18102](https://github.com/BerriAI/litellm/pull/18102)
- **일반**
    - Change extra_headers to additional_headers - [PR #17950](https://github.com/BerriAI/litellm/pull/17950)

### 가드레일

- **[LiteLLM Content Filter](../../docs/proxy/guardrails/litellm_content_filter)**
    - built-in guardrails for harmful content, bias, etc. 추가 - [PR #18029](https://github.com/BerriAI/litellm/pull/18029)
    - support for running content filters on images 추가 - [PR #18044](https://github.com/BerriAI/litellm/pull/18044)
    - support for Brazil PII field 추가 - [PR #18076](https://github.com/BerriAI/litellm/pull/18076)
    - configurable guardrail options for content filtering 추가 - [PR #18007](https://github.com/BerriAI/litellm/pull/18007)
- **[가드레일 API](../../docs/adding_provider/generic_guardrail_api)**
    - LLM tool call response checks on `/chat/completions`, `/v1/responses`, `/v1/messages` 지원 - [PR #17619](https://github.com/BerriAI/litellm/pull/17619)
    - guardrails load balancing 추가 - [PR #18181](https://github.com/BerriAI/litellm/pull/18181)
    - guardrails for passthrough endpoint 수정 - [PR #18109](https://github.com/BerriAI/litellm/pull/18109)
    - headers to metadata for guardrails on pass-through endpoints 추가 - [PR #17992](https://github.com/BerriAI/litellm/pull/17992)
    - Various fixes for guardrail on OpenRouter models - [PR #18085](https://github.com/BerriAI/litellm/pull/18085)
- **[Lakera](../../docs/proxy/guardrails/lakera_ai)**
    - monitor mode for Lakera 추가 - [PR #18084](https://github.com/BerriAI/litellm/pull/18084)
- **[Pillar Security](../../docs/proxy/guardrails/pillar_security)**
    - masking support 및 MCP call support 추가 - [PR #17959](https://github.com/BerriAI/litellm/pull/17959)
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - support for Bedrock image guardrails 추가 - [PR #18115](https://github.com/BerriAI/litellm/pull/18115)
    - 가드레일 block action takes precedence over masking - [PR #17968](https://github.com/BerriAI/litellm/pull/17968)

### Secret Managers

- **[HashiCorp Vault](../../docs/secret_managers/hashicorp_vault)**
    - documentation for configurable Vault mount 추가 - [PR #18082](https://github.com/BerriAI/litellm/pull/18082)
    - per-team Vault configuration 추가 - [PR #18150](https://github.com/BerriAI/litellm/pull/18150)
- **UI**
    - secret manager settings controls to team management UI 추가 - [PR #18149](https://github.com/BerriAI/litellm/pull/18149)

---

## 비용 추적, budget 및 rate limiting {#cost-tracking-budgets-and-rate-limiting}

- **Email Budget Alerts** - Send email notifications 때 budgets are reached - [PR #17995](https://github.com/BerriAI/litellm/pull/17995)

---

## MCP Gateway

- **Auth Header Propagation** - Add MCP auth header propagation - [PR #17963](https://github.com/BerriAI/litellm/pull/17963)
- **Fix deepcopy error** - Fix MCP tool call deepcopy error 때 processing requests - [PR #18010](https://github.com/BerriAI/litellm/pull/18010)
- **Fix list tool** - Fix MCP list_tools not working without database connection - [PR #18161](https://github.com/BerriAI/litellm/pull/18161)

---

## Agent Gateway(A2A) {#agent-gateway-a2a}

- **New Provider: Agent Gateway** - Add pydantic ai agents support - [PR #18013](https://github.com/BerriAI/litellm/pull/18013)
- **VertexAI Agent Engine** - Add Vertex AI Agent Engine provider - [PR #18014](https://github.com/BerriAI/litellm/pull/18014)
- **Fix model extraction** - Fix get_model_from_request() to extract model ID from Vertex AI passthrough URLs - [PR #18097](https://github.com/BerriAI/litellm/pull/18097)

---

## 성능 / load balancing / reliability 개선 {#performance-loadbalancing-reliability-improvements}

- **Lazy Imports** - Use per-attribute lazy imports 및 extract shared constants - [PR #17994](https://github.com/BerriAI/litellm/pull/17994)
- **Lazy Load HTTP Handlers** - Lazy load http handlers - [PR #17997](https://github.com/BerriAI/litellm/pull/17997)
- **Lazy Load Caches** - Lazy load caches - [PR #18001](https://github.com/BerriAI/litellm/pull/18001)
- **Lazy Load Types** - Lazy load bedrock types, .types.utils, GuardrailItem - [PR #18053](https://github.com/BerriAI/litellm/pull/18053), [PR #18054](https://github.com/BerriAI/litellm/pull/18054), [PR #18072](https://github.com/BerriAI/litellm/pull/18072)
- **Lazy Load Configs** - Lazy load 41 configuration classes - [PR #18267](https://github.com/BerriAI/litellm/pull/18267)
- **Lazy Load Client Decorators** - Lazy load heavy client decorator imports - [PR #18064](https://github.com/BerriAI/litellm/pull/18064)
- **Prisma Build Time** - Download Prisma binaries at build time instead of runtime for security restricted environments - [PR #17695](https://github.com/BerriAI/litellm/pull/17695)
- **Docker Alpine** - Add libsndfile to Alpine image for ARM64 audio processing - [PR #18092](https://github.com/BerriAI/litellm/pull/18092)
- **Security** - Prevent LiteLLM API key leakage on /health endpoint failures - [PR #18133](https://github.com/BerriAI/litellm/pull/18133)

---

## 문서 업데이트 {#documentation-updates}

- **SAP 문서** - Update SAP documentation - [PR #17974](https://github.com/BerriAI/litellm/pull/17974)
- **Pydantic AI Agents** - Add docs on 사용해 pydantic ai agents with LiteLLM A2A gateway - [PR #18026](https://github.com/BerriAI/litellm/pull/18026)
- **Vertex AI Agent Engine** - Add Vertex AI Agent Engine documentation - [PR #18027](https://github.com/BerriAI/litellm/pull/18027)
- **Router Order** - Add router order parameter documentation - [PR #18045](https://github.com/BerriAI/litellm/pull/18045)
- **Secret Manager Settings** - Improve secret manager settings documentation - [PR #18235](https://github.com/BerriAI/litellm/pull/18235)
- **Gemini 3 Flash** - Add version requirement in Gemini 3 Flash blog - [PR #18227](https://github.com/BerriAI/litellm/pull/18227)
- **README** - Expand Responses API section 및 update endpoints - [PR #17354](https://github.com/BerriAI/litellm/pull/17354)
- **Amazon Nova** - Add Amazon Nova to sidebar 및 supported models - [PR #18220](https://github.com/BerriAI/litellm/pull/18220)
- **벤치마크** - Add infrastructure recommendations to benchmarks documentation - [PR #18264](https://github.com/BerriAI/litellm/pull/18264)
- **Broken Links** - Fix broken link corrections - [PR #18104](https://github.com/BerriAI/litellm/pull/18104)
- **README Fixes** - Various README improvements - [PR #18206](https://github.com/BerriAI/litellm/pull/18206)

---

## 인프라 / CI/CD {#infrastructure-cicd}

- **PR Templates** - Add LiteLLM team PR template 및 CI/CD rules - [PR #17983](https://github.com/BerriAI/litellm/pull/17983), [PR #17985](https://github.com/BerriAI/litellm/pull/17985)
- **Issue Labeling** - Improve issue labeling with component dropdown 및 more provider keywords - [PR #17957](https://github.com/BerriAI/litellm/pull/17957)
- **PR Template Cleanup** - Remove redundant fields from PR template - [PR #17956](https://github.com/BerriAI/litellm/pull/17956)
- **Dependencies** - Bump altcha-lib from 1.3.0 to 1.4.1 - [PR #18017](https://github.com/BerriAI/litellm/pull/18017)

---

## 새 기여자

* @dongbin-lunark made their first contribution in [PR #17757](https://github.com/BerriAI/litellm/pull/17757)
* @qdrddr made their first contribution in [PR #18004](https://github.com/BerriAI/litellm/pull/18004)
* @donicrosby made their first contribution in [PR #17962](https://github.com/BerriAI/litellm/pull/17962)
* @NicolaivdSmagt made their first contribution in [PR #17992](https://github.com/BerriAI/litellm/pull/17992)
* @Reapor-Yurnero made their first contribution in [PR #18085](https://github.com/BerriAI/litellm/pull/18085)
* @jk-f5 made their first contribution in [PR #18086](https://github.com/BerriAI/litellm/pull/18086)
* @castrapel made their first contribution in [PR #18077](https://github.com/BerriAI/litellm/pull/18077)
* @dtikhonov made their first contribution in [PR #17484](https://github.com/BerriAI/litellm/pull/17484)
* @opleonnn made their first contribution in [PR #18175](https://github.com/BerriAI/litellm/pull/18175)
* @eurogig made their first contribution in [PR #18084](https://github.com/BerriAI/litellm/pull/18084)

---

## Full 변경 이력

**[View complete changelog on GitHub](https://github.com/BerriAI/litellm/compare/v1.80.10-nightly...v1.80.11)**
