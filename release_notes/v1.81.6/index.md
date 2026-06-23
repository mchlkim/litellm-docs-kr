---
title: "[Preview] v1.81.6 - 로그 v2 with Tool Call Tracing"
slug: "v1-81-6"
date: 2026-01-31T00:00:00
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

:::danger Known Issue - CPU 사용법

이 릴리스에는 CPU 사용량 관련 알려진 문제가 있었습니다. 이 문제는 [v1.81.9-stable](../v1.81.9/v1-81-9)에서 수정되었습니다.

**대신 v1.81.9-stable 사용을 권장합니다.**

:::

## 이 버전 배포

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:main-v1.81.6
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.81.6
```

</TabItem>
</Tabs>

## 주요 변경 사항

Tool Call Tracing을 포함한 로그 View v2 - 더 빠른 디버깅을 위해 사이드 패널, 구조화된 도구 시각화, 오류 메시지 검색을 갖춘 로그 인터페이스로 재설계했습니다.

Let's dive in.

### Tool Call Tracing을 포함한 로그 View v2

이번 릴리스는 LiteLLM의 재설계된 로그 View v2를 통해 포괄적인 tool call tracing을 도입하여, 개발자가 프로덕션 환경의 AI agent workflow를 매끄럽게 디버깅하고 모니터링할 수 있게 합니다.

이제 syntax highlighting이 적용된 request/response payload 전체 가시성을 유지하면서, 복잡한 다단계 agent 상호작용 추적, tool 실행 실패 디버깅, MCP server call 모니터링 같은 사용 사례를 온보딩할 수 있습니다.

개발자는 LiteLLM UI에서 새 로그 View에 접근해 tool call을 구조화된 형식으로 살펴보고, 오류 메시지나 요청 패턴으로 로그를 검색하며, 접을 수 있는 사이드 패널 view로 세션 간 agent activity를 연결해 볼 수 있습니다.

{/* TODO: Add image from Slack (group_7219.png) - save as logs_v2_tool_tracing.png */}
{/* <Image img={require('../../img/release_notes/logs_v2_tool_tracing.png')} style={{ maxWidth: '800px', width: '100%' }} /> */}

[시작하기](../../docs/proxy/ui_logs)

## New 모델 / Updated 모델

#### 새 모델 지원

| Provider | Model | 컨텍스트 윈도우 | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| AWS Bedrock | `amazon.nova-2-pro-preview-20251202-v1:0` | 1M | $2.19 | $17.50 | Chat completions, vision, video, PDF, function calling, prompt caching, reasoning 지원 |
| Google Vertex AI | `gemini-robotics-er-1.5-preview` | 1M | $0.30 | $2.50 | Chat completions, multimodal(text, image, video, audio), function calling, reasoning 지원 |
| OpenRouter | `openrouter/xiaomi/mimo-v2-flash` | 262K | $0.09 | $0.29 | Chat completions, function calling, reasoning 지원 |
| OpenRouter | `openrouter/moonshotai/kimi-k2.5` | - | - | - | Chat completions |
| OpenRouter | `openrouter/z-ai/glm-4.7` | 202K | $0.40 | $1.50 | Chat completions, vision, function calling, reasoning 지원 |

#### 기능

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Messages API Bedrock Converse caching 및 PDF support - [PR #19785](https://github.com/BerriAI/litellm/pull/19785)
    - Translate advanced-tool-use to Bedrock-specific headers for Claude Opus 4.5 - [PR #19841](https://github.com/BerriAI/litellm/pull/19841)
    - tool search header translation for Sonnet 4.5 지원 - [PR #19871](https://github.com/BerriAI/litellm/pull/19871)
    - Filter unsupported beta headers for AWS Bedrock Invoke API - [PR #19877](https://github.com/BerriAI/litellm/pull/19877)
    - Nova grounding improvements - [PR #19598](https://github.com/BerriAI/litellm/pull/19598), [PR #20159](https://github.com/BerriAI/litellm/pull/20159)

- **[Anthropic](../../docs/providers/anthropic)**
    - explicit cache_control null in tool_result content 제거 - [PR #19919](https://github.com/BerriAI/litellm/pull/19919)
    - tool handling 수정 - [PR #19805](https://github.com/BerriAI/litellm/pull/19805)

- **[Google Gemini / Vertex AI](../../docs/providers/gemini)**
    - Gemini Robotics-ER 1.5 preview support 추가 - [PR #19845](https://github.com/BerriAI/litellm/pull/19845)
    - file retrieval in GoogleAIStudioFilesHandle 지원 - [PR #20018](https://github.com/BerriAI/litellm/pull/20018)
    - /delete endpoint support 추가 - [PR #20055](https://github.com/BerriAI/litellm/pull/20055)
    - custom_llm_provider as gemini translation 추가 - [PR #19988](https://github.com/BerriAI/litellm/pull/19988)
    - Subtract implicit cached tokens from text_tokens for correct cost calculation - [PR #19775](https://github.com/BerriAI/litellm/pull/19775)
    - unsupported prompt-caching-scope-2026-01-05 header for vertex ai 제거 - [PR #20058](https://github.com/BerriAI/litellm/pull/20058)
    - disable flag for anthropic gemini cache translation 추가 - [PR #20052](https://github.com/BerriAI/litellm/pull/20052)
    - Convert image URLs to base64 in tool messages for Anthropic on Vertex AI - [PR #19896](https://github.com/BerriAI/litellm/pull/19896)

- **[xAI](../../docs/providers/xai)**
    - grok reasoning content support 추가 - [PR #19850](https://github.com/BerriAI/litellm/pull/19850)
    - websearch params support for Responses API 추가 - [PR #19915](https://github.com/BerriAI/litellm/pull/19915)
    - routing of xai chat completions to responses 때 web search options is present 추가 - [PR #20051](https://github.com/BerriAI/litellm/pull/20051)
    - cached token cost calculation 수정 - [PR #19772](https://github.com/BerriAI/litellm/pull/19772)

- **[Azure OpenAI](../../docs/providers/azure)**
    - generic cost calculator for audio token pricing 사용 - [PR #19771](https://github.com/BerriAI/litellm/pull/19771)
    - tool_choice for Azure GPT-5 chat models 허용 - [PR #19813](https://github.com/BerriAI/litellm/pull/19813)
    - Set gpt-5.2-codex mode to responses for Azure 및 OpenRouter - [PR #19770](https://github.com/BerriAI/litellm/pull/19770)

- **[OpenAI](../../docs/providers/openai)**
    - max_input_tokens for gpt-5.2-codex 수정 - [PR #20009](https://github.com/BerriAI/litellm/pull/20009)
    - gpt-image-1.5 cost calculation not including output image tokens 수정 - [PR #19515](https://github.com/BerriAI/litellm/pull/19515)

- **[Hosted VLLM](../../docs/providers/vllm)**
    - thinking parameter in anthropic_messages() 및 .completion() 지원 - [PR #19787](https://github.com/BerriAI/litellm/pull/19787)
    - 통해 base_llm_http_handler to support ssl_verify 라우팅 - [PR #19893](https://github.com/BerriAI/litellm/pull/19893)
    - vllm embedding format 수정 - [PR #20056](https://github.com/BerriAI/litellm/pull/20056)

- **[OCI GenAI](../../docs/providers/oci)**
    - Serialize imageUrl as object for OCI GenAI API - [PR #19661](https://github.com/BerriAI/litellm/pull/19661)

- **[Volcengine](../../docs/providers/volcano)**
    - context for volcengine models (deepseek-v3-2, glm-4-7, kimi-k2-thinking) 추가 - [PR #19335](https://github.com/BerriAI/litellm/pull/19335)

- **[Chinese Providers](../../docs/providers/)**
    - prompt caching 및 reasoning support for MiniMax, GLM, Xiaomi 추가 - [PR #19924](https://github.com/BerriAI/litellm/pull/19924)

- **[Vercel AI Gateway](../../docs/providers/vercel_ai_gateway)**
    - embeddings support 추가 - [PR #19660](https://github.com/BerriAI/litellm/pull/19660)

### 버그 수정

- **[Google](../../docs/providers/gemini)**
    - gemini-robotics-er-1.5-preview entry 수정 - [PR #19974](https://github.com/BerriAI/litellm/pull/19974)

- **일반**
    - output_tokens_details.reasoning_tokens None 수정 - [PR #19914](https://github.com/BerriAI/litellm/pull/19914)
    - stream_chunk_builder to preserve images from streaming chunks 수정 - [PR #19654](https://github.com/BerriAI/litellm/pull/19654)
    - aspectRatio mapping in image edit 수정 - [PR #20053](https://github.com/BerriAI/litellm/pull/20053)
    - Handle unknown models in Azure AI cost calculator - [PR #20150](https://github.com/BerriAI/litellm/pull/20150)

- **[GigaChat](../../docs/providers/gigachat)**
    - Ensure function content is valid JSON - [PR #19232](https://github.com/BerriAI/litellm/pull/19232)

## LLM API 엔드포인트

#### 기능

- **[Messages API (/messages)](../../docs/mcp)**
    - LiteLLM x Claude Agent SDK Integration 추가 - [PR #20035](https://github.com/BerriAI/litellm/pull/20035)

- **[A2A / MCP Gateway API (/a2a, /mcp)](../../docs/mcp)**
    - A2A agent header-based context propagation support 추가 - [PR #19504](https://github.com/BerriAI/litellm/pull/19504)
    - Enable progress notifications for MCP tool calls - [PR #19809](https://github.com/BerriAI/litellm/pull/19809)
    - support for non-standard MCP URL patterns 수정 - [PR #19738](https://github.com/BerriAI/litellm/pull/19738)
    - backward compatibility for legacy A2A card formats (/.well-known/agent.json) 추가 - [PR #19949](https://github.com/BerriAI/litellm/pull/19949)
    - support for agent parameter in /interactions endpoint 추가 - [PR #19866](https://github.com/BerriAI/litellm/pull/19866)

- **[Responses API (/responses)](../../docs/response_api)**
    - custom_llm_provider for provider-specific params 수정 - [PR #19798](https://github.com/BerriAI/litellm/pull/19798)
    - Extract input tokens details as dict in ResponseAPILoggingUtils - [PR #20046](https://github.com/BerriAI/litellm/pull/20046)

- **[Batch API (/batches)](../../docs/batches)**
    - /batches to return encoded ids (from managed objects table) 수정 - [PR #19040](https://github.com/BerriAI/litellm/pull/19040)
    - Batch 및 File user level permissions 수정 - [PR #19981](https://github.com/BerriAI/litellm/pull/19981)
    - cost tracking 및 usage object in retrieve_batch call type 추가 - [PR #19986](https://github.com/BerriAI/litellm/pull/19986)

- **[Embeddings API (/embeddings)](../../docs/embedding/supported_embedding)**
    - supported input formats documentation 추가 - [PR #20073](https://github.com/BerriAI/litellm/pull/20073)

- **[RAG API (/rag/ingest, /vector_store)](../../docs/rag_ingest)**
    - UI for /rag/ingest API - Upload docs, pdfs etc to create vector stores 추가 - [PR #19822](https://github.com/BerriAI/litellm/pull/19822)
    - support for 사용해 S3 Vectors as Vector Store Provider 추가 - [PR #19888](https://github.com/BerriAI/litellm/pull/19888)
    - s3_vectors as provider on /vector_store/search API + UI for creating + PDF support 추가 - [PR #19895](https://github.com/BerriAI/litellm/pull/19895)
    - permission management for users 및 teams on Vector Stores 추가 - [PR #19972](https://github.com/BerriAI/litellm/pull/19972)
    - Enable router support for completions in RAG query pipeline - [PR #19550](https://github.com/BerriAI/litellm/pull/19550)

- **[Search API (/search)](../../docs/search)**
    - /list endpoint to list what search tools exist in router 추가 - [PR #19969](https://github.com/BerriAI/litellm/pull/19969)
    - router search tools v2 integration 수정 - [PR #19840](https://github.com/BerriAI/litellm/pull/19840)

- **[Passthrough Endpoints (/\{provider\}_passthrough)](../../docs/pass_through/intro)**
    - /openai_passthrough route for OpenAI passthrough requests 추가 - [PR #19989](https://github.com/BerriAI/litellm/pull/19989)
    - support for configuring role_mappings via environment variables 추가 - [PR #19498](https://github.com/BerriAI/litellm/pull/19498)
    - Vertex AI LLM credentials sensitive keyword "vertex_credentials" for masking 추가 - [PR #19551](https://github.com/BerriAI/litellm/pull/19551)
    - prevention of provider-prefixed model name leaks in responses 수정 - [PR #19943](https://github.com/BerriAI/litellm/pull/19943)
    - proxy support for slashes in Google Vertex generateContent model names 수정 - [PR #19737](https://github.com/BerriAI/litellm/pull/19737), [PR #19753](https://github.com/BerriAI/litellm/pull/19753)
    - model names with slashes in Vertex AI passthrough URLs 지원 - [PR #19944](https://github.com/BerriAI/litellm/pull/19944)
    - regression in Vertex AI passthroughs for router models 수정 - [PR #19967](https://github.com/BerriAI/litellm/pull/19967)
    - regression tests for Vertex AI passthrough model names 추가 - [PR #19855](https://github.com/BerriAI/litellm/pull/19855)

#### 버그

- **일반**
    - token calculations 및 refactor 수정 - [PR #19696](https://github.com/BerriAI/litellm/pull/19696)

## 관리 엔드포인트 / UI

#### 기능

- **Proxy CLI Auth**
    - configurable CLI JWT expiration via environment variable 추가 - [PR #19780](https://github.com/BerriAI/litellm/pull/19780)
    - team cli auth flow 수정 - [PR #19666](https://github.com/BerriAI/litellm/pull/19666)

- **가상 키**
    - UI: Auto Truncation of Table Values - [PR #19718](https://github.com/BerriAI/litellm/pull/19718)
    - Create Key: Expire Key Input Duration 수정 - [PR #19807](https://github.com/BerriAI/litellm/pull/19807)
    - Bulk Update Keys Endpoint - [PR #19886](https://github.com/BerriAI/litellm/pull/19886)

- **로그 View**
    - **v2 로그 view with side panel 및 improved UX** - [PR #20091](https://github.com/BerriAI/litellm/pull/20091)
    - New View to render "Tools" on 로그 View - [PR #20093](https://github.com/BerriAI/litellm/pull/20093)
    - Pretty print view of request/response 추가 - [PR #20096](https://github.com/BerriAI/litellm/pull/20096)
    - error_message search in Spend 로그 Endpoint 추가 - [PR #19960](https://github.com/BerriAI/litellm/pull/19960)
    - UI: Adding Error message search to ui spend logs - [PR #19963](https://github.com/BerriAI/litellm/pull/19963)
    - Spend 로그: Settings Modal - [PR #19918](https://github.com/BerriAI/litellm/pull/19918)
    - error_code in Spend 로그 metadata 수정 - [PR #20015](https://github.com/BerriAI/litellm/pull/20015)
    - Spend 로그: Show Current Store 및 Retention Status - [PR #20017](https://github.com/BerriAI/litellm/pull/20017)
    - Dynamic Setting of store_prompts_in_spend_logs 허용 - [PR #19913](https://github.com/BerriAI/litellm/pull/19913)
    - [문서: UI Spend 로그 Settings](../../docs/proxy/ui_spend_log_settings) - [PR #20197](https://github.com/BerriAI/litellm/pull/20197)

- **모델 + Endpoints**
    - sortBy 및 sortOrder params for /v2/model/info 추가 - [PR #19903](https://github.com/BerriAI/litellm/pull/19903)
    - Sorting for /v2/model/info 수정 - [PR #19971](https://github.com/BerriAI/litellm/pull/19971)
    - UI: Model Page Server Sort - [PR #19908](https://github.com/BerriAI/litellm/pull/19908)

- **사용법 & Analytics**
    - UI: 사용법 Export: Breakdown by Teams 및 Keys - [PR #19953](https://github.com/BerriAI/litellm/pull/19953)
    - UI: 사용법: Model Breakdown Per Key - [PR #20039](https://github.com/BerriAI/litellm/pull/20039)

- **UI Improvements**
    - UI: Allow Admins to control what pages are visible on LeftNav - [PR #19907](https://github.com/BerriAI/litellm/pull/19907)
    - UI: Add Light/Dark Mode Switch for Development - [PR #19804](https://github.com/BerriAI/litellm/pull/19804)
    - UI: Dark Mode: Delete Resource Modal - [PR #20098](https://github.com/BerriAI/litellm/pull/20098)
    - UI: Tables: Reusable Table Sort Component - [PR #19970](https://github.com/BerriAI/litellm/pull/19970)
    - UI: New Badge Dot Render - [PR #20024](https://github.com/BerriAI/litellm/pull/20024)
    - UI: Feedback Prompts: Option To Hide Prompts - [PR #19831](https://github.com/BerriAI/litellm/pull/19831)
    - UI: Navbar: Fixed Default Logo + Bound Logo Box - [PR #20092](https://github.com/BerriAI/litellm/pull/20092)
    - UI: Navbar: User Dropdown - [PR #20095](https://github.com/BerriAI/litellm/pull/20095)
    - Change default key type from 'Default' to 'LLM API' - [PR #19516](https://github.com/BerriAI/litellm/pull/19516)

- **팀 및 사용자 관리**
    - /team/member_add User Email 및 ID Verifications 수정 - [PR #19814](https://github.com/BerriAI/litellm/pull/19814)
    - SSO Email Case Sensitivity 수정 - [PR #19799](https://github.com/BerriAI/litellm/pull/19799)
    - UI: Internal User: Bulk Add - [PR #19721](https://github.com/BerriAI/litellm/pull/19721)

- **AI Gateway 기능**
    - support for making silent LLM calls without logging 추가 - [PR #19544](https://github.com/BerriAI/litellm/pull/19544)
    - UI: Fix MCP tools instructions to display comma-separated strings - [PR #20101](https://github.com/BerriAI/litellm/pull/20101)

#### 버그

- Model Name During Fallback 수정 - [PR #20177](https://github.com/BerriAI/litellm/pull/20177)
- Health Endpoints 때 Callback Objects Defined 수정 - [PR #20182](https://github.com/BerriAI/litellm/pull/20182)
- Unable to reset user max budget to unlimited 수정 - [PR #19796](https://github.com/BerriAI/litellm/pull/19796)
- Password comparison with non-ASCII characters 수정 - [PR #19568](https://github.com/BerriAI/litellm/pull/19568)
- error message for DISABLE_ADMIN_ENDPOINTS 수정 - [PR #19861](https://github.com/BerriAI/litellm/pull/19861)
- Prevent clearing content filter patterns 때 editing guardrail - [PR #19671](https://github.com/BerriAI/litellm/pull/19671)
- Prompt Studio history to load tools 및 system messages 수정 - [PR #19920](https://github.com/BerriAI/litellm/pull/19920)
- WATSONX_ZENAPIKEY to WatsonX credentials 추가 - [PR #20086](https://github.com/BerriAI/litellm/pull/20086)
- UI: Vector Store: Allow Config Defined 모델 to Be Selected - [PR #20031](https://github.com/BerriAI/litellm/pull/20031)

## 로깅 / Guardrail / Prompt Management 통합

#### 기능

- **[DataDog](../../docs/proxy/logging#datadog)**
    - agent support for LLM 관측성 추가 - [PR #19574](https://github.com/BerriAI/litellm/pull/19574)
    - datadog cost management support 및 fix startup callback issue 추가 - [PR #19584](https://github.com/BerriAI/litellm/pull/19584)
    - datadog_llm_observability to /health/services allowed list 추가 - [PR #19952](https://github.com/BerriAI/litellm/pull/19952)
    - Check for agent mode 전에 requiring DD_API_KEY/DD_SITE - [PR #20156](https://github.com/BerriAI/litellm/pull/20156)

- **[OpenTelemetry](../../docs/observability/opentelemetry_integration)**
    - Propagate JWT auth metadata to OTEL spans - [PR #19627](https://github.com/BerriAI/litellm/pull/19627)
    - thread leak in dynamic header path 수정 - [PR #19946](https://github.com/BerriAI/litellm/pull/19946)

- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - callbacks 및 labels 추가 - [PR #19708](https://github.com/BerriAI/litellm/pull/19708)
    - clientip 및 user agent in metrics 추가 - [PR #19717](https://github.com/BerriAI/litellm/pull/19717)
    - tpm-rpm limit metrics 추가 - [PR #19725](https://github.com/BerriAI/litellm/pull/19725)
    - model_id label to metrics 추가 - [PR #19678](https://github.com/BerriAI/litellm/pull/19678)
    - Safely handle None metadata in logging - [PR #19691](https://github.com/BerriAI/litellm/pull/19691)
    - high CPU 때 router_settings in DB by avoiding REGISTRY.collect() 해석 - [PR #20087](https://github.com/BerriAI/litellm/pull/20087)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - litellm_callback_logging_failures_metric for Langfuse, Langfuse Otel 및 other Otel providers 추가 - [PR #19636](https://github.com/BerriAI/litellm/pull/19636)

- **일반 Logging**
    - return value from CustomLogger.async_post_call_success_hook 사용 - [PR #19670](https://github.com/BerriAI/litellm/pull/19670)
    - async_post_call_response_headers_hook to CustomLogger 추가 - [PR #20083](https://github.com/BerriAI/litellm/pull/20083)
    - mock client factory pattern 및 mock support for PostHog, Helicone, 및 Braintrust integrations 추가 - [PR #19707](https://github.com/BerriAI/litellm/pull/19707)

#### 가드레일

- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)**
    - Reuse HTTP connections to prevent performance degradation - [PR #19964](https://github.com/BerriAI/litellm/pull/19964)

- **Onyx**
    - timeout to onyx guardrail 추가 - [PR #19731](https://github.com/BerriAI/litellm/pull/19731)

- **일반**
    - guardrail model argument feature 추가 - [PR #19619](https://github.com/BerriAI/litellm/pull/19619)
    - guardrails issues with streaming-response regex 수정 - [PR #19901](https://github.com/BerriAI/litellm/pull/19901)
    - enterprise requirement for guardrail monitoring (docs) 제거 - [PR #19833](https://github.com/BerriAI/litellm/pull/19833)

## 비용 추적, 예산 및 속도 제한

- event-driven coordination for global spend query to prevent cache stampede 추가 - [PR #20030](https://github.com/BerriAI/litellm/pull/20030)

## 성능 / 로드 밸런싱 / 안정성 개선

- **Resolve high CPU 때 router_settings in DB** - by avoiding REGISTRY.collect() in PrometheusServicesLogger - [PR #20087](https://github.com/BerriAI/litellm/pull/20087)
- **Reuse HTTP connections in Presidio** - to prevent performance degradation - [PR #19964](https://github.com/BerriAI/litellm/pull/19964)
- **Event-driven coordination for global spend query** - prevent cache stampede - [PR #20030](https://github.com/BerriAI/litellm/pull/20030)
- recursive Pydantic validation issue 수정 - [PR #19531](https://github.com/BerriAI/litellm/pull/19531)
- Refactor argument handling into helper function to reduce code bloat - [PR #19720](https://github.com/BerriAI/litellm/pull/19720)
- Optimize logo fetching 및 resolve MCP import blockers - [PR #19719](https://github.com/BerriAI/litellm/pull/19719)
- Improve logo download performance 사용해 async HTTP client - [PR #20155](https://github.com/BerriAI/litellm/pull/20155)
- server root path configuration 수정 - [PR #19790](https://github.com/BerriAI/litellm/pull/19790)
- Refactor: Extract transport context creation into separate method - [PR #19794](https://github.com/BerriAI/litellm/pull/19794)
- native_background_mode configuration to override polling_via_cache for specific models 추가 - [PR #19899](https://github.com/BerriAI/litellm/pull/19899)
- Initialize tiktoken environment at import time to enable offline usage - [PR #19882](https://github.com/BerriAI/litellm/pull/19882)
- Improve tiktoken performance 사용해 local cache in lazy loading - [PR #19774](https://github.com/BerriAI/litellm/pull/19774)
- timeout errors in chat completion calls to be correctly reported in failure callbacks 수정 - [PR #19842](https://github.com/BerriAI/litellm/pull/19842)
- environment variable type handling for NUM_RETRIES 수정 - [PR #19507](https://github.com/BerriAI/litellm/pull/19507)
- safe_deep_copy in silent experiment kwargs to prevent mutation 사용 - [PR #20170](https://github.com/BerriAI/litellm/pull/20170)
- Improve error handling by inspecting BadRequestError 후 all other policy types - [PR #19878](https://github.com/BerriAI/litellm/pull/19878)

## Database Changes

### Schema Updates

| Table | Change Type | 설명 | PR | Migration |
| ----- | ----------- | ----------- | -- | --------- |
| `LiteLLM_ManagedVectorStoresTable` | New Columns | Added `team_id` 및 `user_id` fields for permission management | [PR #19972](https://github.com/BerriAI/litellm/pull/19972) | [Migration](https://github.com/BerriAI/litellm/blob/main/litellm-proxy-extras/litellm_proxy_extras/migrations/20260131150814_add_team_user_to_vector_stores/migration.sql) |

### 마이그레이션 개선

- Docker: Use correct schema path for Prisma generation 수정 - [PR #19631](https://github.com/BerriAI/litellm/pull/19631)
- 'relation does not exist' migration errors in setup_database 해석 - [PR #19281](https://github.com/BerriAI/litellm/pull/19281)
- migration issue 및 improve Docker image stability 수정 - [PR #19843](https://github.com/BerriAI/litellm/pull/19843)
- Run Prisma generate as nobody user in non-root Docker container for security - [PR #20000](https://github.com/BerriAI/litellm/pull/20000)
- litellm-proxy-extras version to 0.4.28 업데이트 - [PR #20166](https://github.com/BerriAI/litellm/pull/20166)

## 문서 업데이트

- **[Add Claude Agents SDK x LiteLLM Guide](../../docs/mcp)** - [PR #20036](https://github.com/BerriAI/litellm/pull/20036)
- **[Add Cookbook: Using Claude Agent SDK + MCPs with LiteLLM](https://github.com/BerriAI/litellm/tree/main/cookbook)** - [PR #20081](https://github.com/BerriAI/litellm/pull/20081)
- A2A Python SDK URL in documentation 수정 - [PR #19832](https://github.com/BerriAI/litellm/pull/19832)
- **[Add Sarvam usage documentation](../../docs/providers/sarvam)** - [PR #19844](https://github.com/BerriAI/litellm/pull/19844)
- **[Add supported input formats for embeddings](../../docs/embedding/supported_embedding)** - [PR #20073](https://github.com/BerriAI/litellm/pull/20073)
- **[UI Spend 로그 Settings 문서](../../docs/proxy/ui_spend_log_settings)** - [PR #20197](https://github.com/BerriAI/litellm/pull/20197)
- OpenAI Agents SDK to OSS Adopters list in README 추가 - [PR #19820](https://github.com/BerriAI/litellm/pull/19820)
- Update docs: Remove enterprise requirement for guardrail monitoring - [PR #19833](https://github.com/BerriAI/litellm/pull/19833)
- missing environment variable documentation 추가 - [PR #20138](https://github.com/BerriAI/litellm/pull/20138)
- Improve documentation blog index page - [PR #20188](https://github.com/BerriAI/litellm/pull/20188)

## 인프라 / 테스트 개선

- test coverage for Router.get_valid_args 및 improve code coverage reporting 추가 - [PR #19797](https://github.com/BerriAI/litellm/pull/19797)
- validation of model cost map as CI job 추가 - [PR #19993](https://github.com/BerriAI/litellm/pull/19993)
- Realtime API benchmarks 추가 - [PR #20074](https://github.com/BerriAI/litellm/pull/20074)
- Init Containers support in community helm chart 추가 - [PR #19816](https://github.com/BerriAI/litellm/pull/19816)
- libsndfile to main Dockerfile for ARM64 audio processing support 추가 - [PR #19776](https://github.com/BerriAI/litellm/pull/19776)

## 새 기여자

* @ruanjf made their first contribution in https://github.com/BerriAI/litellm/pull/19551
* @moh-dev-stack made their first contribution in https://github.com/BerriAI/litellm/pull/19507
* @formorter made their first contribution in https://github.com/BerriAI/litellm/pull/19498
* @priyam-that made their first contribution in https://github.com/BerriAI/litellm/pull/19516
* @marcosgriselli made their first contribution in https://github.com/BerriAI/litellm/pull/19550
* @natimofeev made their first contribution in https://github.com/BerriAI/litellm/pull/19232
* @zifeo made their first contribution in https://github.com/BerriAI/litellm/pull/19805
* @pragyasardana made their first contribution in https://github.com/BerriAI/litellm/pull/19816
* @ryewilson made their first contribution in https://github.com/BerriAI/litellm/pull/19833
* @lizhen921 made their first contribution in https://github.com/BerriAI/litellm/pull/19919
* @boarder7395 made their first contribution in https://github.com/BerriAI/litellm/pull/19666
* @rushilchugh01 made their first contribution in https://github.com/BerriAI/litellm/pull/19938
* @cfchase made their first contribution in https://github.com/BerriAI/litellm/pull/19893
* @ayim made their first contribution in https://github.com/BerriAI/litellm/pull/19872
* @varunsripad123 made their first contribution in https://github.com/BerriAI/litellm/pull/20018
* @nht1206 made their first contribution in https://github.com/BerriAI/litellm/pull/20046
* @genga6 made their first contribution in https://github.com/BerriAI/litellm/pull/20009

**Full 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.81.3.rc...v1.81.6
