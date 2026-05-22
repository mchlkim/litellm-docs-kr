---
title: "v1.80.5-stable - Gemini 3.0 Support"
slug: "v1-80-5"
date: 2025-11-22T10:00:00
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

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.80.5-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.5
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **Gemini 3** - [thought signature를 포함한 Gemini 3 model day-0 지원](../../blog/gemini_3)
- **Prompt Management** - [편집, 테스트, version history UI를 포함한 전체 prompt versioning 지원](../../docs/proxy/litellm_prompt_management)
- **MCP Hub** - [조직 내 MCP server를 publish하고 discover](../../docs/proxy/ai_hub#mcp-servers)
- **Model Compare UI** - [테스트용 model comparison interface](../../docs/proxy/model_compare_ui)
- **Batch API 비용 추적** - [batch 및 file creation request용 custom metadata를 포함한 granular spend tracking](../../docs/proxy/cost_tracking#custom-spend-log-metadata)
- **AWS IAM Secret Manager** - [AWS Secret Manager용 IAM role authentication 지원](../../docs/secret_managers/aws_secret_manager#iam-role-assumption)
- **Logging Callback Controls** - [compliance environment에서 caller가 logging callback을 disable하지 못하도록 하는 admin-level control](../../docs/proxy/dynamic_logging#disabling-dynamic-callback-management-enterprise)
- **Proxy CLI JWT 인증** - [developer가 Proxy CLI로 LiteLLM AI Gateway에 authenticate할 수 있도록 지원](../../docs/proxy/cli_sso)
- **Batch API Routing** - [config.yaml의 model-specific credential을 사용해 batch operation을 다른 provider account로 routing](../../docs/batches#multi-account--model-based-routing)

---

### Prompt Management

<Image 
  img={require('../../img/prompt_history.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>
<br/>

이번 release는 LiteLLM UI에 직접 내장된 종합 prompt management solution인 **LiteLLM Prompt Studio**를 도입합니다. browser를 벗어나지 않고 prompt를 만들고, 테스트하고, versioning할 수 있습니다.

이제 LiteLLM Prompt Studio에서 다음 작업을 할 수 있습니다.

- **Prompt 생성 및 테스트**: developer message(system instruction)로 prompt를 만들고 interactive chat interface에서 실시간으로 테스트합니다.
- **Dynamic Variables**: `{{variable_name}}` syntax로 reusable prompt template을 만들고 variable을 자동 감지합니다.
- **Version Control**: 모든 prompt update에 automatic versioning, 전체 version history tracking, rollback 기능을 제공합니다.
- **Prompt Studio**: 전용 studio environment에서 live testing과 preview로 prompt를 편집합니다.

**API Integration:**

간단한 API call로 어떤 application에서도 prompt를 사용할 수 있습니다.

```python
response = client.chat.completions.create(
    model="gpt-4",
    extra_body={
        "prompt_id": "your-prompt-id",
        "prompt_version": 2,  # Optional: specify version
        "prompt_variables": {"name": "value"}  # Optional: pass variables
    }
)
```

시작하기: [LiteLLM Prompt Management 문서](../../docs/proxy/litellm_prompt_management)

---

### Performance – `/realtime` p99 latency 182배 감소

이번 update는 hot path의 redundant encoding을 제거하고 shared SSL context를 재사용하며, 거의 바뀌지 않는데 request마다 두 번 재생성되던 formatting string을 cache해 `/realtime` latency를 줄입니다.

#### 결과

| Metric          | 이전    | 이후     | 개선                |
| --------------- | --------- | --------- | -------------------------- |
| Median latency  | 2,200 ms  | **59 ms** | **−97% (약 37배 빠름)**     |
| p95 latency     | 8,500 ms  | **67 ms** | **−99% (약 127배 빠름)**    |
| p99 latency     | 18,000 ms | **99 ms** | **−99% (약 182배 빠름)**    |
| Average latency | 3,214 ms  | **63 ms** | **−98% (약 51배 빠름)**     |
| RPS             | 165       | **1,207** | **+631% (약 7.3배 증가)** |


#### 테스트 구성

| Category | 사양 |
|----------|---------------|
| **Load Testing** | Locust: 동시 사용자 1,000명, ramp-up 500 |
| **System** | 4 vCPU, 8 GB RAM, worker 4개, instance 4개 |
| **Database** | PostgreSQL(Redis 미사용) |
| **설정** | [config.yaml](https://gist.github.com/AlexsanderHamir/420fb44c31c00b4f17a99588637f01ec) |
| **Load Script** | [no_cache_hits.py](https://gist.github.com/AlexsanderHamir/73b83ada21d9b84d4fe09665cf1745f5) |

---

### Model Compare UI

새 interactive playground UI는 여러 LLM model을 side-by-side로 비교할 수 있게 하여 model response 평가와 비교를 쉽게 합니다.

**기능:**
- 여러 model의 response를 실시간 비교
- synchronized scrolling을 제공하는 comparison view
- 모든 LiteLLM-supported model 지원
- model별 cost tracking
- response time 비교
- 빠른 테스트를 위한 pre-configured prompt

**세부 정보:**

- **Parameterization**: API key, endpoint, model, model parameter 및 interaction type(chat completions, embeddings 등)을 설정합니다.

- **Model Comparison**: 나란히 표시되는 response view로 최대 3개 model을 동시에 비교합니다.

- **Comparison Metrics**: 다음을 포함한 상세 비교 정보를 확인합니다.

  - 첫 token까지 걸린 시간
  - `input/reasoning/output token`
  - Total Latency
  - Cost(config에서 활성화된 경우)

- **Safety Filters**: playground interface에서 guardrail(safety filter)을 직접 구성하고 테스트합니다.

[Model Compare 시작하기](../../docs/proxy/model_compare_ui)

## 신규 Provider 및 Endpoint

### 신규 Provider

| Provider | 지원 엔드포인트 | 설명 |
| -------- | ------------------- | ----------- |
| **[Docker Model Runner](../../docs/providers/docker_model_runner)** | `/v1/chat/completions` | Docker container에서 LLM model 실행 |

---

## New 모델 / Updated 모델

#### 신규 Model 지원

| Provider | Model | Context Window | Input($/1M tokens) | Output($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Azure | `azure/gpt-5.1` | 272K | $1.38 | $11.00 | `Reasoning`, `vision`, `PDF input`, `responses API` |
| Azure | `azure/gpt-5.1-2025-11-13` | 272K | $1.38 | $11.00 | `Reasoning`, `vision`, `PDF input`, `responses API` |
| Azure | `azure/gpt-5.1-codex` | 272K | $1.38 | $11.00 | `Responses API`, `reasoning`, `vision` |
| Azure | `azure/gpt-5.1-codex-2025-11-13` | 272K | $1.38 | $11.00 | `Responses API`, `reasoning`, `vision` |
| Azure | `azure/gpt-5.1-codex-mini` | 272K | $0.275 | $2.20 | `Responses API`, `reasoning`, `vision` |
| Azure | `azure/gpt-5.1-codex-mini-2025-11-13` | 272K | $0.275 | $2.20 | `Responses API`, `reasoning`, `vision` |
| Azure EU | `azure/eu/gpt-5-2025-08-07` | 272K | $1.375 | $11.00 | `Reasoning`, `vision`, `PDF input` |
| Azure EU | `azure/eu/gpt-5-mini-2025-08-07` | 272K | $0.275 | $2.20 | `Reasoning`, `vision`, `PDF input` |
| Azure EU | `azure/eu/gpt-5-nano-2025-08-07` | 272K | $0.055 | $0.44 | `Reasoning`, `vision`, `PDF input` |
| Azure EU | `azure/eu/gpt-5.1` | 272K | $1.38 | $11.00 | `Reasoning`, `vision`, `PDF input`, `responses API` |
| Azure EU | `azure/eu/gpt-5.1-codex` | 272K | $1.38 | $11.00 | `Responses API`, `reasoning`, `vision` |
| Azure EU | `azure/eu/gpt-5.1-codex-mini` | 272K | $0.275 | $2.20 | `Responses API`, `reasoning`, `vision` |
| Gemini | `gemini-3-pro-preview` | 2M | $1.25 | $5.00 | `Reasoning`, `vision`, `function calling` |
| Gemini | `gemini-3-pro-image` | 2M | $1.25 | $5.00 | `Image generation`, `reasoning` |
| OpenRouter | `openrouter/deepseek/deepseek-v3p1-terminus` | 164K | $0.20 | $0.40 | `Function calling`, `reasoning` |
| OpenRouter | `openrouter/moonshot/kimi-k2-instruct` | 262K | $0.60 | $2.50 | `Function calling`, `web search` |
| OpenRouter | `openrouter/gemini/gemini-3-pro-preview` | 2M | $1.25 | $5.00 | `Reasoning`, `vision`, `function calling` |
| XAI | `xai/grok-4.1-fast` | 2M | $0.20 | $0.50 | `Reasoning`, `function calling` |
| Together AI | `together_ai/z-ai/glm-4.6` | 203K | $0.40 | $1.75 | `Function calling`, `reasoning` |
| Cerebras | `cerebras/gpt-oss-120b` | 131K | $0.60 | $0.60 | `Function calling` |
| Bedrock | `anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.00 | $15.00 | `Computer use`, `reasoning`, `vision` |

#### 기능

- **[Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - gemini-3-pro-preview day 0 지원 추가 - [PR #16719](https://github.com/BerriAI/litellm/pull/16719)
    - Gemini 3 Pro Image model 지원 추가 - [PR #16938](https://github.com/BerriAI/litellm/pull/16938)
    - tool 활성화 streaming response에 reasoning_content 추가 - [PR #16854](https://github.com/BerriAI/litellm/pull/16854)
    - Gemini 3 reasoning_effort용 includeThoughts=True 추가 - [PR #16838](https://github.com/BerriAI/litellm/pull/16838)
    - responses API에서 Gemini 3 thought signature 지원 - [PR #16872](https://github.com/BerriAI/litellm/pull/16872)
    - gemma의 잘못된 system message handling 수정 - [PR #16767](https://github.com/BerriAI/litellm/pull/16767)
    - Gemini 3 Pro Image: image_tokens capture 및 cost_per_output_image 지원 - [PR #16912](https://github.com/BerriAI/litellm/pull/16912)
    - gemini-2.5-flash-image의 누락 cost 수정 - [PR #16882](https://github.com/BerriAI/litellm/pull/16882)
    - tool call id의 Gemini 3 thought signature - [PR #16895](https://github.com/BerriAI/litellm/pull/16895)

- **[Azure](../../docs/providers/azure)**
    - Azure gpt-5.1 model 추가 - [PR #16817](https://github.com/BerriAI/litellm/pull/16817)
    - Azure models 2025 11을 cost map에 추가 - [PR #16762](https://github.com/BerriAI/litellm/pull/16762)
    - Azure Pricing 업데이트 - [PR #16371](https://github.com/BerriAI/litellm/pull/16371)
    - Azure Text-to-Speech(AVA)에 SSML Support 추가 - [PR #16747](https://github.com/BerriAI/litellm/pull/16747)

- **[OpenAI](../../docs/providers/openai)**
    - proxy에서 GPT-5.1 `reasoning.effort='none'` 지원 - [PR #16745](https://github.com/BerriAI/litellm/pull/16745)
    - documentation에 gpt-5.1-codex 및 gpt-5.1-codex-mini model 추가 - [PR #16735](https://github.com/BerriAI/litellm/pull/16735)
    - OpenAI video용 async content response 활성화를 위해 BaseVideoConfig 상속 - [PR #16708](https://github.com/BerriAI/litellm/pull/16708)

- **[Anthropic](../../docs/providers/anthropic)**
    - Anthropic tool schema의 `strict` parameter 지원 추가 - [PR #16725](https://github.com/BerriAI/litellm/pull/16725)
    - Anthropic에 image as url 지원 추가 - [PR #16868](https://github.com/BerriAI/litellm/pull/16868)
    - v1/messages API에 thought signature 지원 추가 - [PR #16812](https://github.com/BerriAI/litellm/pull/16812)
    - Claude 4.5 sonnet 및 Opus 4.1용 Structured Outputs `output_format` 지원 - [PR #16949](https://github.com/BerriAI/litellm/pull/16949)

- **[Bedrock](../../docs/providers/bedrock)**
    - Haiku 4.5 Bedrock config 수정 - [PR #16732](https://github.com/BerriAI/litellm/pull/16732)
    - Bedrock streaming response에서 consistent chunk ID 보장 - [PR #16596](https://github.com/BerriAI/litellm/pull/16596)
    - US Gov Cloud에 Claude 4.5 추가 - [PR #16957](https://github.com/BerriAI/litellm/pull/16957)
    - Bedrock tool result에서 image가 drop되던 문제 수정 - [PR #16492](https://github.com/BerriAI/litellm/pull/16492)

- **[Vertex AI](../../docs/providers/vertex)**
    - Vertex AI Image Edit 지원 추가 - [PR #16828](https://github.com/BerriAI/litellm/pull/16828)
    - veo 3 pricing 업데이트 및 prod model 추가 - [PR #16781](https://github.com/BerriAI/litellm/pull/16781)
    - veo3 video download 수정 - [PR #16875](https://github.com/BerriAI/litellm/pull/16875)

- **[Snowflake](../../docs/providers/snowflake)**
    - Snowflake provider 지원: embeddings, PAT, account_id 추가 - [PR #15727](https://github.com/BerriAI/litellm/pull/15727)

- **[OCI](../../docs/providers/oci)**
    - OCI Dedicated Endpoints용 oci_endpoint_id parameter 추가 - [PR #16723](https://github.com/BerriAI/litellm/pull/16723)

- **[XAI](../../docs/providers/xai)**
    - Grok 4.1 Fast model 지원 추가 - [PR #16936](https://github.com/BerriAI/litellm/pull/16936)

- **[Together AI](../../docs/providers/togetherai)**
    - together.ai의 GLM 4.6 추가 - [PR #16942](https://github.com/BerriAI/litellm/pull/16942)

- **[Cerebras](../../docs/providers/cerebras)**
    - Cerebras GPT-OSS-120B model name 수정 - [PR #16939](https://github.com/BerriAI/litellm/pull/16939)

### Bug Fixes

- **[OpenAI](../../docs/providers/openai)**
    - 16863 수정: OpenAI responses에서 completions로 conversion - [PR #16864](https://github.com/BerriAI/litellm/pull/16864)
    - "Make all gpt-5 and reasoning models to responses by default" revert - [PR #16849](https://github.com/BerriAI/litellm/pull/16849)

- **General**
    - query param에서 custom_llm_provider 가져오기 - [PR #16731](https://github.com/BerriAI/litellm/pull/16731)
    - optional param mapping 수정 - [PR #16852](https://github.com/BerriAI/litellm/pull/16852)
    - litellm_params에 None check 추가 - [PR #16754](https://github.com/BerriAI/litellm/pull/16754)

---

## LLM API Endpoints

#### 기능

- **[Responses API](../../docs/response_api)**
    - gpt-5.1-codex model용 Responses API 지원 추가 - [PR #16845](https://github.com/BerriAI/litellm/pull/16845)
    - responses API용 managed files 지원 추가 - [PR #16733](https://github.com/BerriAI/litellm/pull/16733)
    - chat completion의 response supported API param용 extra_body 지원 추가 - [PR #16765](https://github.com/BerriAI/litellm/pull/16765)

- **[Batch API](../../docs/batches)**
    - file용 /delete 및 batch용 /cancel 지원 - [PR #16387](https://github.com/BerriAI/litellm/pull/16387)
    - batch 및 file에 config 기반 routing 지원 추가 - [PR #16872](https://github.com/BerriAI/litellm/pull/16872)
    - batch 및 files endpoint에 spend_logs_metadata 채우기 - [PR #16921](https://github.com/BerriAI/litellm/pull/16921)

- **[Search APIs](../../docs/search)**
    - Search APIs - firecrawl-search의 "Invalid request body" error 수정 - [PR #16943](https://github.com/BerriAI/litellm/pull/16943)

- **[Vector Stores](../../docs/vector_stores)**
    - vector store create issue 수정 - [PR #16804](https://github.com/BerriAI/litellm/pull/16804)
    - key access에서 team vector-store permission을 존중하도록 수정 - [PR #16639](https://github.com/BerriAI/litellm/pull/16639)

- **[Audio Transcription](../../docs/audio_transcription)**
    - audio transcription cost tracking 수정 - [PR #16478](https://github.com/BerriAI/litellm/pull/16478)
    - audio/transcriptions에 누락된 shared_sessions 추가 - [PR #16858](https://github.com/BerriAI/litellm/pull/16858)

- **[Video Generation API](../../docs/video_generation)**
    - videos tagging 수정 - [PR #16770](https://github.com/BerriAI/litellm/pull/16770)

#### Bugs

- **General**
    - custom deployment name을 사용하는 Responses API cost tracking - [PR #16778](https://github.com/BerriAI/litellm/pull/16778)
    - spend-logs에서 logged response string trim - [PR #16654](https://github.com/BerriAI/litellm/pull/16654)

---

## Management Endpoint 및 UI

#### 기능

- **Proxy CLI Auth**
    - Proxy CLI sign-in에 JWT 사용 허용 - [PR #16756](https://github.com/BerriAI/litellm/pull/16756)

- **가상 키**
    - Key Model Alias가 작동하지 않던 문제 수정 - [PR #16896](https://github.com/BerriAI/litellm/pull/16896)

- **모델 + Endpoints**
    - test key의 chat model에 추가 model setting 추가 - [PR #16793](https://github.com/BerriAI/litellm/pull/16793)
    - config model에 대해 model table의 delete button 비활성화 - [PR #16787](https://github.com/BerriAI/litellm/pull/16787)
    - Public Model Hub가 proxyBaseUrl을 사용하도록 변경 - [PR #16892](https://github.com/BerriAI/litellm/pull/16892)
    - request/response panel에 JSON Viewer 추가 - [PR #16687](https://github.com/BerriAI/litellm/pull/16687)
    - icon image 표준화 - [PR #16837](https://github.com/BerriAI/litellm/pull/16837)

- **Teams**
    - Teams table empty state 개선 - [PR #16738](https://github.com/BerriAI/litellm/pull/16738)

- **Fallbacks**
    - Fallbacks icon button tooltip 및 신중한 delete flow 추가 - [PR #16737](https://github.com/BerriAI/litellm/pull/16737)

- **MCP Servers**
    - user delete, MCP Server Modal, MCP Table Tooltip 개선 - [PR #16751](https://github.com/BerriAI/litellm/pull/16751)

- **Callbacks**
    - callback setting용 backend endpoint 노출 - [PR #16698](https://github.com/BerriAI/litellm/pull/16698)
    - backend data를 사용하도록 add callbacks route 수정 - [PR #16699](https://github.com/BerriAI/litellm/pull/16699)

- **사용법 & Analytics**
    - User Table에서 user ID partial match 허용 - [PR #16952](https://github.com/BerriAI/litellm/pull/16952)

- **General UI**
    - API reference docs에서 base_url 설정 허용 - [PR #16674](https://github.com/BerriAI/litellm/pull/16674)
    - /public field가 server root path를 존중하도록 변경 - [PR #16930](https://github.com/BerriAI/litellm/pull/16930)
    - UI build 수정 - [PR #16702](https://github.com/BerriAI/litellm/pull/16702)
    - system preference 기반 automatic dark/light mode 활성화 - [PR #16748](https://github.com/BerriAI/litellm/pull/16748)

#### Bugs

- **UI Fixes**
    - antd Notification Manager로 인한 flaky test 수정 - [PR #16740](https://github.com/BerriAI/litellm/pull/16740)
    - UI MCP Tool Test Regression 수정 - [PR #16695](https://github.com/BerriAI/litellm/pull/16695)
    - edit logging settings가 나타나지 않던 문제 수정 - [PR #16798](https://github.com/BerriAI/litellm/pull/16798)
    - request viewer에서 긴 request id를 truncate하는 CSS 추가 - [PR #16665](https://github.com/BerriAI/litellm/pull/16665)
    - Add Model의 Azure Placeholder에서 azure/ prefix 제거 - [PR #16597](https://github.com/BerriAI/litellm/pull/16597)
    - user/info return에서 UI Session Token 제거 - [PR #16851](https://github.com/BerriAI/litellm/pull/16851)
    - model tab에서 console log와 error 제거 - [PR #16455](https://github.com/BerriAI/litellm/pull/16455)
    - Backend와 맞도록 Bulk Invite User Role 변경 - [PR #16906](https://github.com/BerriAI/litellm/pull/16906)
    - flaky UI test 수정을 위해 Tremor Tooltip mock 처리 - [PR #16786](https://github.com/BerriAI/litellm/pull/16786)
    - e2e UI playwright test 수정 - [PR #16799](https://github.com/BerriAI/litellm/pull/16799)
    - CI/CD test 수정 - [PR #16972](https://github.com/BerriAI/litellm/pull/16972)

- **SSO**
    - 사용자가 LiteLLM에 insert될 때 SSO provider의 `role`이 사용되도록 보장 - [PR #16794](https://github.com/BerriAI/litellm/pull/16794)
    - 문서 - SSO - Manage User Roles via Azure App Roles - [PR #16796](https://github.com/BerriAI/litellm/pull/16796)

- **Auth**
    - JWT Auth 사용 시 Team Tags가 작동하도록 보장 - [PR #16797](https://github.com/BerriAI/litellm/pull/16797)
    - key가 만료되지 않던 문제 수정 - [PR #16692](https://github.com/BerriAI/litellm/pull/16692)

- **Swagger UI**
    - OpenAPI schema에서 Pydantic v2 `$defs`가 제대로 노출되지 않아 chat completion endpoint에서 발생하던 Swagger UI resolver error 수정 - [PR #16784](https://github.com/BerriAI/litellm/pull/16784)

---

## AI Integrations

### Logging

- **[Arize Phoenix](../../docs/observability/arize_phoenix)**
    - Arize Phoenix logging 수정 - [PR #16301](https://github.com/BerriAI/litellm/pull/16301)
    - Arize Phoenix root span logging - [PR #16949](https://github.com/BerriAI/litellm/pull/16949)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Langfuse에서 secret field filter 처리 - [PR #16842](https://github.com/BerriAI/litellm/pull/16842)

- **General**
    - Sensitive Data Masker에서 litellm_credential_name 제외(updated) - [PR #16958](https://github.com/BerriAI/litellm/pull/16958)
    - admin이 dynamic callback control을 disable할 수 있도록 허용 - [PR #16750](https://github.com/BerriAI/litellm/pull/16750)

### 가드레일

- **[IBM 가드레일](../../docs/proxy/guardrails)**
    - IBM guardrail optional param 수정 및 extra_headers field 추가 - [PR #16771](https://github.com/BerriAI/litellm/pull/16771)

- **[Noma Guardrail](../../docs/proxy/guardrails)**
    - NomaGuardrail에서 fallback Noma applicationId로 LiteLLM key alias 사용 - [PR #16832](https://github.com/BerriAI/litellm/pull/16832)
    - tool-permission guardrail용 custom violation message 허용 - [PR #16916](https://github.com/BerriAI/litellm/pull/16916)

- **[Grayswan Guardrail](../../docs/proxy/guardrails)**
    - flagged 상태에서 Grayswan guardrail passthrough 처리 - [PR #16891](https://github.com/BerriAI/litellm/pull/16891)

- **General 가드레일**
    - prompt injection이 작동하지 않던 문제 수정 - [PR #16701](https://github.com/BerriAI/litellm/pull/16701)

### Prompt Management

- **[Prompt Management](../../docs/proxy/prompt_management)**
    - model request에서 prompt_id만 지정할 수 있도록 허용 - [PR #16834](https://github.com/BerriAI/litellm/pull/16834)
    - prompt versioning 지원 추가 - [PR #16836](https://github.com/BerriAI/litellm/pull/16836)
    - DB에 prompt version 저장 허용 - [PR #16848](https://github.com/BerriAI/litellm/pull/16848)
    - prompt 편집 UI 추가 - [PR #16853](https://github.com/BerriAI/litellm/pull/16853)
    - Chat UI로 prompt 테스트 허용 - [PR #16898](https://github.com/BerriAI/litellm/pull/16898)
    - version history 조회 허용 - [PR #16901](https://github.com/BerriAI/litellm/pull/16901)
    - code에서 prompt version 지정 허용 - [PR #16929](https://github.com/BerriAI/litellm/pull/16929)
    - Prompt에 대한 model, prompt id를 UI에서 볼 수 있도록 허용 - [PR #16932](https://github.com/BerriAI/litellm/pull/16932)
    - prompt management용 "get code" section 표시 및 version history 표시 polish - [PR #16941](https://github.com/BerriAI/litellm/pull/16941)

### Secret Managers

- **[AWS Secrets Manager](../../docs/secret_managers)**
    - AWS Secret Manager용 IAM role assumption 지원 추가 - [PR #16887](https://github.com/BerriAI/litellm/pull/16887)

---

## MCP Gateway

- **MCP Hub** - company 내 MCP Server publish/discover - [PR #16857](https://github.com/BerriAI/litellm/pull/16857)
- **MCP Resources** - MCP resource 지원 - [PR #16800](https://github.com/BerriAI/litellm/pull/16800)
- **MCP OAuth** - mcp oauth flow detail 문서 - [PR #16742](https://github.com/BerriAI/litellm/pull/16742)
- **MCP Lifecycle** - MCPClient.connect를 제거하고 run_with_session lifecycle 사용 - [PR #16696](https://github.com/BerriAI/litellm/pull/16696)
- **MCP Server IDs** - mcp server id 추가 - [PR #16904](https://github.com/BerriAI/litellm/pull/16904)
- **MCP URL Format** - mcp url format 수정 - [PR #16940](https://github.com/BerriAI/litellm/pull/16940)


---

## Performance / Load Balancing / Reliability 개선

- **Realtime Endpoint Performance** - realtime endpoint performance를 저하하던 bottleneck 수정 - [PR #16670](https://github.com/BerriAI/litellm/pull/16670)
- **SSL Context 캐싱** - 과도한 memory allocation 방지를 위해 SSL context cache - [PR #16955](https://github.com/BerriAI/litellm/pull/16955)
- **Cache Optimization** - cache cooldown key generation 수정 - [PR #16954](https://github.com/BerriAI/litellm/pull/16954)
- **Router Cache** - cacheable prefix는 같지만 user message가 다른 request의 routing 수정 - [PR #16951](https://github.com/BerriAI/litellm/pull/16951)
- **Redis Event Loop** - 첫 call에서 redis event loop가 닫히던 문제 수정 - [PR #16913](https://github.com/BerriAI/litellm/pull/16913)
- **Dependency Management** - pydantic을 2.11.0으로 upgrade - [PR #16909](https://github.com/BerriAI/litellm/pull/16909)

---

## 문서 업데이트

- **Provider Documentation 업데이트**
    - benchmark comparison에 누락된 detail 추가 - [PR #16690](https://github.com/BerriAI/litellm/pull/16690)
    - anthropic pass-through endpoint 수정 - [PR #16883](https://github.com/BerriAI/litellm/pull/16883)
    - repo cleanup 및 AI docs 개선 - [PR #16775](https://github.com/BerriAI/litellm/pull/16775)

- **API Documentation**
    - OpenAI metadata 관련 docs 추가 - [PR #16872](https://github.com/BerriAI/litellm/pull/16872)
    - 모든 supported endpoint와 cost tracking으로 docs 업데이트 - [PR #16872](https://github.com/BerriAI/litellm/pull/16872)

- **General Documentation 업데이트**
    - Projects built on LiteLLM에 mini-swe-agent 추가 - [PR #16971](https://github.com/BerriAI/litellm/pull/16971)

---

## Infrastructure 및 CI/CD

- **UI Testing**
    - e2e_ui_testing을 build, unit, e2e step으로 분리 - [PR #16783](https://github.com/BerriAI/litellm/pull/16783)
    - testing용 UI build - [PR #16968](https://github.com/BerriAI/litellm/pull/16968)
    - CI/CD 수정 - [PR #16937](https://github.com/BerriAI/litellm/pull/16937)

- **Dependency Management 업데이트**
    - /tests/proxy_admin_ui_tests/ui_unit_tests에서 js-yaml을 3.14.1에서 3.14.2로 bump - [PR #16755](https://github.com/BerriAI/litellm/pull/16755)
    - js-yaml을 3.14.1에서 3.14.2로 bump - [PR #16802](https://github.com/BerriAI/litellm/pull/16802)

- **Migration**
    - migration job label 추가 - [PR #16831](https://github.com/BerriAI/litellm/pull/16831)

- **Config**
    - 실제로 동작하는 YAML 수정 - [PR #16757](https://github.com/BerriAI/litellm/pull/16757)

- **릴리즈 노트**
    - embeddings 성능 개선 사항을 release notes에 추가 - [PR #16697](https://github.com/BerriAI/litellm/pull/16697)
    - 문서 - v1.80.0 - [PR #16694](https://github.com/BerriAI/litellm/pull/16694)

- **Investigation**
    - issue root cause 조사 - [PR #16859](https://github.com/BerriAI/litellm/pull/16859)

---

## 신규 Contributor

* @mattmorgis 님이 [PR #16371](https://github.com/BerriAI/litellm/pull/16371)에서 첫 contribution을 했습니다.
* @mmandic-coatue 님이 [PR #16732](https://github.com/BerriAI/litellm/pull/16732)에서 첫 contribution을 했습니다.
* @Bradley-Butcher 님이 [PR #16725](https://github.com/BerriAI/litellm/pull/16725)에서 첫 contribution을 했습니다.
* @BenjaminLevy 님이 [PR #16757](https://github.com/BerriAI/litellm/pull/16757)에서 첫 contribution을 했습니다.
* @CatBraaain 님이 [PR #16767](https://github.com/BerriAI/litellm/pull/16767)에서 첫 contribution을 했습니다.
* @tushar8408 님이 [PR #16831](https://github.com/BerriAI/litellm/pull/16831)에서 첫 contribution을 했습니다.
* @nbsp1221 님이 [PR #16845](https://github.com/BerriAI/litellm/pull/16845)에서 첫 contribution을 했습니다.
* @idola9 님이 [PR #16832](https://github.com/BerriAI/litellm/pull/16832)에서 첫 contribution을 했습니다.
* @nkukard 님이 [PR #16864](https://github.com/BerriAI/litellm/pull/16864)에서 첫 contribution을 했습니다.
* @alhuang10 님이 [PR #16852](https://github.com/BerriAI/litellm/pull/16852)에서 첫 contribution을 했습니다.
* @sebslight 님이 [PR #16838](https://github.com/BerriAI/litellm/pull/16838)에서 첫 contribution을 했습니다.
* @TsurumaruTsuyoshi 님이 [PR #16905](https://github.com/BerriAI/litellm/pull/16905)에서 첫 contribution을 했습니다.
* @cyberjunk 님이 [PR #16492](https://github.com/BerriAI/litellm/pull/16492)에서 첫 contribution을 했습니다.
* @colinlin-stripe 님이 [PR #16895](https://github.com/BerriAI/litellm/pull/16895)에서 첫 contribution을 했습니다.
* @sureshdsk 님이 [PR #16883](https://github.com/BerriAI/litellm/pull/16883)에서 첫 contribution을 했습니다.
* @eiliyaabedini 님이 [PR #16875](https://github.com/BerriAI/litellm/pull/16875)에서 첫 contribution을 했습니다.
* @justin-tahara 님이 [PR #16957](https://github.com/BerriAI/litellm/pull/16957)에서 첫 contribution을 했습니다.
* @wangsoft 님이 [PR #16913](https://github.com/BerriAI/litellm/pull/16913)에서 첫 contribution을 했습니다.
* @dsduenas 님이 [PR #16891](https://github.com/BerriAI/litellm/pull/16891)에서 첫 contribution을 했습니다.

---

## Known Issues
* `/audit` 및 `/user/available_users` route가 404를 반환합니다. [PR #17337](https://github.com/BerriAI/litellm/pull/17337)에서 수정되었습니다.

---

## Full 변경 이력

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.80.0-nightly...v1.80.5.rc.2)**
