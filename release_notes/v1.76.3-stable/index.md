---
title: "v1.76.3-stable - 성능, Video Generation 및 CloudZero 통합"
slug: "v1-76-3"
date: 2025-09-06T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

hide_table_of_contents: false
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::warning

이 릴리스에는 Kubernetes에 배포할 때 startup이 `Out of Memory` errors로 이어지는 알려진 문제가 있습니다. 이 버전으로 업그레이드하기 전에 기다리는 것을 권장합니다.

:::


## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.76.3
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.76.3
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **주요 성능 개선** 올바른 workers 수와 CPU cores 조합을 사용할 때 +400 RPS
- **Video Generation 지원** - LiteLLM Pass 통해 routes를 통해 Google AI Studio 및 Vertex AI Veo Video Generation 추가
- **CloudZero 통합** - LiteLLM usage 및 spend data를 CloudZero로 export하기 위한 새 cost tracking integration입니다.

## 주요 변경 사항 {#major-changes}
- **성능 Optimization**: LiteLLM Proxy now achieves +400 RPS 때 사용해 correct amount of CPU cores - [PR #14153](https://github.com/BerriAI/litellm/pull/14153), [PR #14242](https://github.com/BerriAI/litellm/pull/14242)
  
  이제 LiteLLM은 기본적으로 최적 성능을 위해 `num_workers = os.cpu_count()`를 사용합니다.
  
  **Override 옵션:**
  
  환경 변수를 설정합니다.
  ```bash
  DEFAULT_NUM_WORKERS_LITELLM_PROXY=1
  ```
  
  또는 LiteLLM Proxy를 다음과 같이 시작합니다.
  ```bash
  litellm --num_workers 1
  ```

- **Security Fix**: memory_usage_in_mem_cache cache endpoint vulnerability 수정 - [PR #14229](https://github.com/BerriAI/litellm/pull/14229)

---

## 성능 개선 {#performance-improvements}

이번 릴리스에는 중요한 성능 최적화가 포함됩니다. 내부 benchmark에서 올바른 workers 수와 CPU cores 조합을 사용할 때 1개 instance가 +400 RPS를 달성했습니다.

- **+400 RPS 성능 향상** - LiteLLM Proxy가 이제 최적 성능을 위해 올바른 수의 CPU cores를 사용합니다 - [PR #14153](https://github.com/BerriAI/litellm/pull/14153)
- **기본 CPU Workers** - DEFAULT_NUM_WORKERS_LITELLM_PROXY 기본값을 CPU 수로 변경 - [PR #14242](https://github.com/BerriAI/litellm/pull/14242)


---

## New 모델 / Updated 모델

#### 신규 모델 지원 {#new-model-support}

| Provider    | Model                                  | 컨텍스트 윈도우 | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | -------- |
| OpenRouter | `openrouter/openai/gpt-4.1` | 1M | $2.00 | $8.00 | vision 포함 chat completions |
| OpenRouter | `openrouter/openai/gpt-4.1-mini` | 1M | $0.40 | $1.60 | 효율적인 chat completions |
| OpenRouter | `openrouter/openai/gpt-4.1-nano` | 1M | $0.10 | $0.40 | 초고효율 chat |
| Vertex AI | `vertex_ai/openai/gpt-oss-20b-maas` | 131K | $0.075 | $0.30 | Reasoning support |
| Vertex AI | `vertex_ai/openai/gpt-oss-120b-maas` | 131K | $0.15 | $0.60 | 고급 reasoning |
| Gemini | `gemini/veo-3.0-generate-preview` | 1K | - | $0.75/sec | Video generation |
| Gemini | `gemini/veo-3.0-fast-generate-preview` | 1K | - | $0.40/sec | 빠른 video generation |
| Gemini | `gemini/veo-2.0-generate-001` | 1K | - | $0.35/sec | Video generation |
| Volcengine | `doubao-embedding-large` | 4K | Free | Free | 2048-dim embeddings |
| Together AI | `together_ai/deepseek-ai/DeepSeek-V3.1` | 128K | $0.60 | $1.70 | Reasoning support |

#### 기능

- **[Google Gemini](../../docs/providers/gemini)**
    - Added 'thoughtSignature' support via 'thinking_blocks' - [PR #14122](https://github.com/BerriAI/litellm/pull/14122)
    - Added support for reasoning_effort='minimal' for Gemini models - [PR #14262](https://github.com/BerriAI/litellm/pull/14262)
- **[OpenRouter](../../docs/providers/openrouter)**
    - Added GPT-4.1 model family - [PR #14101](https://github.com/BerriAI/litellm/pull/14101)
- **[Groq](../../docs/providers/groq)**
    - Added support for reasoning_effort parameter - [PR #14207](https://github.com/BerriAI/litellm/pull/14207)
- **[X.AI](../../docs/providers/xai)**
    - Fixed XAI cost calculation - [PR #14127](https://github.com/BerriAI/litellm/pull/14127)
- **[Vertex AI](../../docs/providers/vertex)**
    - Added support for GPT-OSS models on Vertex AI - [PR #14184](https://github.com/BerriAI/litellm/pull/14184)
    - Added additionalProperties to Vertex AI Schema definition - [PR #14252](https://github.com/BerriAI/litellm/pull/14252)
- **[VLLM](../../docs/providers/vllm)**
    - Handle output parsing responses API output - [PR #14121](https://github.com/BerriAI/litellm/pull/14121)
- **[Ollama](../../docs/providers/ollama)**
    - Added unified 'thinking' param support via `reasoning_content` - [PR #14121](https://github.com/BerriAI/litellm/pull/14121)
- **[Anthropic](../../docs/providers/anthropic)**
    - Added supported text field to anthropic citation response - [PR #14126](https://github.com/BerriAI/litellm/pull/14126)
- **[OCI Provider](../../docs/providers/oci)**
    - Handle assistant messages with both content 및 tool_calls - [PR #14171](https://github.com/BerriAI/litellm/pull/14171)
- **[Bedrock](../../docs/providers/bedrock)**
    - Fixed structure output - [PR #14130](https://github.com/BerriAI/litellm/pull/14130)
    - Added initial support for Bedrock Batches API - [PR #14190](https://github.com/BerriAI/litellm/pull/14190)
- **[Databricks](../../docs/providers/databricks)**
    - Added support for anthropic citation API in Databricks - [PR #14077](https://github.com/BerriAI/litellm/pull/14077)

### 버그 수정
- **[Google Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - Fixed Gemini 2.5 Pro schema validation with OpenAI-style type arrays in tools - [PR #14154](https://github.com/BerriAI/litellm/pull/14154)
    - Fixed Gemini 도구 호출 empty enum property - [PR #14155](https://github.com/BerriAI/litellm/pull/14155)

#### 신규 Provider 지원 {#new-provider-support}

- **[Volcengine](../../docs/providers/volcengine)**
    - Added Volcengine embedding module with handler 및 transformation logic - [PR #14028](https://github.com/BerriAI/litellm/pull/14028)

---

## LLM API 엔드포인트

#### 기능

- **[Images API](../../docs/image_generation)**
    - Added pass 통해 image generation 및 image editing on OpenAI - [PR #14292](https://github.com/BerriAI/litellm/pull/14292)
    - extra_body parameter for image generation 지원 - [PR #14211](https://github.com/BerriAI/litellm/pull/14211)
- **[Responses API](../../docs/response_api)**
    - Fixed response API for reasoning item in input for litellm proxy - [PR #14200](https://github.com/BerriAI/litellm/pull/14200)
    - Added structured output for SDK - [PR #14206](https://github.com/BerriAI/litellm/pull/14206)
- **[Bedrock Passthrough](../../docs/pass_through/bedrock)**
    - AWS_BEDROCK_RUNTIME_ENDPOINT on bedrock passthrough 지원 - [PR #14156](https://github.com/BerriAI/litellm/pull/14156)
- **[Google AI Studio Passthrough](../../docs/pass_through/google_ai_studio)**
    - 사용해 Veo Video Generation 통해 LiteLLM Pass 통해 routes 허용 - [PR #14228](https://github.com/BerriAI/litellm/pull/14228)
- **일반**
    - Added support for safety_identifier parameter in chat.completions.create - [PR #14174](https://github.com/BerriAI/litellm/pull/14174)
    - Fixed misclassified 500 error on invalid image_url in /chat/completions request - [PR #14149](https://github.com/BerriAI/litellm/pull/14149)
    - Fixed token count error for Gemini CLI - [PR #14133](https://github.com/BerriAI/litellm/pull/14133)

#### 버그

- **일반**
    - "/" or ":" from model name 때 being used as h11 header name 제거 - [PR #14191](https://github.com/BerriAI/litellm/pull/14191)
    - Bug fix for openai.gpt-oss 때 사용해 reasoning_effort parameter - [PR #14300](https://github.com/BerriAI/litellm/pull/14300)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

### 기능
    - Added header support for spend_logs_metadata - [PR #14186](https://github.com/BerriAI/litellm/pull/14186)
    - Litellm passthrough cost tracking for chat completion - [PR #14256](https://github.com/BerriAI/litellm/pull/14256)

### 버그 수정
    - Fixed TPM Rate Limit Bug - [PR #14237](https://github.com/BerriAI/litellm/pull/14237)
    - Fixed Key Budget not resets at expectable times - [PR #14241](https://github.com/BerriAI/litellm/pull/14241)



## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능

- **UI Improvements**
    - 로그 page screen size fixed - [PR #14135](https://github.com/BerriAI/litellm/pull/14135)
    - Create Organization Tooltip added on Success - [PR #14132](https://github.com/BerriAI/litellm/pull/14132)
    - Back to Keys should say Back to 로그 - [PR #14134](https://github.com/BerriAI/litellm/pull/14134)
    - client side pagination on All 모델 table 추가 - [PR #14136](https://github.com/BerriAI/litellm/pull/14136)
    - Model Filters UI improvement - [PR #14131](https://github.com/BerriAI/litellm/pull/14131)
    - table filter on user info page 제거 - [PR #14169](https://github.com/BerriAI/litellm/pull/14169)
    - Team name badge added on the User Details - [PR #14003](https://github.com/BerriAI/litellm/pull/14003)
    - Fix: Log page parameter passing error - [PR #14193](https://github.com/BerriAI/litellm/pull/14193)
- **인증 & Authorization**
    - for ES256/ES384/ES512 및 EdDSA JWT verification 지원 - [PR #14118](https://github.com/BerriAI/litellm/pull/14118)
    - Ensure `team_id` is a required field for generating service account keys - [PR #14270](https://github.com/BerriAI/litellm/pull/14270)

#### 버그

- **일반**
    - store model in db setting 검증 - [PR #14269](https://github.com/BerriAI/litellm/pull/14269)

---

## Logging / Guardrail 통합 {#logging--guardrail-integrations}

#### 기능

- **[Datadog](../../docs/proxy/logging#datadog)**
    - Ensure `apm_id` is set on DD LLM 관측성 traces - [PR #14272](https://github.com/BerriAI/litellm/pull/14272)
- **[Braintrust](../../docs/proxy/logging#braintrust)**
    - logging 때 OTEL is enabled 수정 - [PR #14122](https://github.com/BerriAI/litellm/pull/14122)
- **[OTEL](../../docs/proxy/logging#otel)**
    - Optional Metrics 및 로그 following semantic conventions - [PR #14179](https://github.com/BerriAI/litellm/pull/14179)
- **[Slack Alerting](../../docs/proxy/alerting)**
    - Added alert type to alert message to slack for easier handling - [PR #14176](https://github.com/BerriAI/litellm/pull/14176)

#### 가드레일
    - Added guardrail to the Anthropic API endpoint - [PR #14107](https://github.com/BerriAI/litellm/pull/14107)

#### New Integration

- **[CloudZero](../../docs/proxy/cost_tracking)**
    - LiteLLM x CloudZero Integration for Cost Tracking - [PR #14296](https://github.com/BerriAI/litellm/pull/14296)

---

## 성능 / 부하 분산 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

#### 기능

- **성능**
    - LiteLLM Proxy: +400 RPS 때 사용해 correct amount of CPU cores - [PR #14153](https://github.com/BerriAI/litellm/pull/14153)
    - 사용해 `x-litellm-stream-timeout` header for stream timeout in requests 허용 - [PR #14147](https://github.com/BerriAI/litellm/pull/14147)
    - Change DEFAULT_NUM_WORKERS_LITELLM_PROXY default to number CPUs - [PR #14242](https://github.com/BerriAI/litellm/pull/14242)
- **Monitoring**
    - Added Prometheus missing metrics - [PR #14139](https://github.com/BerriAI/litellm/pull/14139)
- **Timeout**
    - **Stream Timeout Control** - Allow 사용해 `x-litellm-stream-timeout` header for stream timeout in requests - [PR #14147](https://github.com/BerriAI/litellm/pull/14147)
- **Routing**
    - Fixed x-litellm-tags not routing with Responses API - [PR #14289](https://github.com/BerriAI/litellm/pull/14289)

#### 버그

- **Security**
    - Fixed memory_usage_in_mem_cache cache endpoint vulnerability - [PR #14229](https://github.com/BerriAI/litellm/pull/14229)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

#### 기능

- **SCIM Support**
    - Added better SCIM debugging - [PR #14221](https://github.com/BerriAI/litellm/pull/14221)
    - Bug fixes for handling SCIM Group Memberships - [PR #14226](https://github.com/BerriAI/litellm/pull/14226)
- **Kubernetes**
    - Added optional PodDisruptionBudget for litellm proxy - [PR #14093](https://github.com/BerriAI/litellm/pull/14093)
- **Error Handling**
    - model to azure error message 추가 - [PR #14294](https://github.com/BerriAI/litellm/pull/14294)

---

## 새 기여자
* @iabhi4 made their first contribution in [PR #14093](https://github.com/BerriAI/litellm/pull/14093)
* @zainhas made their first contribution in [PR #14087](https://github.com/BerriAI/litellm/pull/14087)
* @LifeDJIK made their first contribution in [PR #14146](https://github.com/BerriAI/litellm/pull/14146)
* @retanoj made their first contribution in [PR #14133](https://github.com/BerriAI/litellm/pull/14133)
* @zhxlp made their first contribution in [PR #14193](https://github.com/BerriAI/litellm/pull/14193)
* @kayoch1n made their first contribution in [PR #14191](https://github.com/BerriAI/litellm/pull/14191)
* @kutsushitaneko made their first contribution in [PR #14171](https://github.com/BerriAI/litellm/pull/14171)
* @mjmendo made their first contribution in [PR #14176](https://github.com/BerriAI/litellm/pull/14176)
* @HarshavardhanK made their first contribution in [PR #14213](https://github.com/BerriAI/litellm/pull/14213)
* @eycjur made their first contribution in [PR #14207](https://github.com/BerriAI/litellm/pull/14207)
* @22mSqRi made their first contribution in [PR #14241](https://github.com/BerriAI/litellm/pull/14241)
* @onlylhf made their first contribution in [PR #14028](https://github.com/BerriAI/litellm/pull/14028)
* @btpemercier made their first contribution in [PR #11319](https://github.com/BerriAI/litellm/pull/11319)
* @tremlin made their first contribution in [PR #14287](https://github.com/BerriAI/litellm/pull/14287)
* @TobiMayr made their first contribution in [PR #14262](https://github.com/BerriAI/litellm/pull/14262)
* @Eitan1112 made their first contribution in [PR #14252](https://github.com/BerriAI/litellm/pull/14252)

---

## **[Full 변경 이력](https://github.com/BerriAI/litellm/compare/v1.76.1-nightly...v1.76.3-nightly)**
