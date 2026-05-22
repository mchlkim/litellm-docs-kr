---
title: "v1.79.3-stable - AI Gateway의 내장 가드레일"
slug: "v1-79-3"
date: 2025-11-08T10:00:00
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

## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.79.3-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.79.3.rc.1
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **LiteLLM Custom Guardrail** - UI 설정을 지원하는 내장 가드레일
- **성능 개선** - `/responses` API의 중앙값 지연 시간 19배 감소
- **Veo3 Video Generation (Vertex AI + Google AI Studio)** - OpenAI Video API로 Vertex AI 및 Google AI Studio Veo3 모델에서 동영상 생성

---

### AI Gateway의 내장 가드레일 {#built-in-guardrails-on-ai-gateway}

<Image 
  img={require('../../img/release_notes/built_in_guard.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

이번 릴리스는 LiteLLM AI Gateway에 내장 가드레일을 도입해, 외부 가드레일 API에 의존하지 않고 보호 정책을 적용할 수 있게 합니다.

- **키워드 차단** - "litellm", "python" 등 알려진 민감 키워드를 차단합니다.
- **패턴 감지** - 이메일, Social Security Numbers, API keys 등 알려진 민감 패턴을 차단합니다.
- **사용자 지정 정규식 패턴** - 특정 사용 사례에 맞는 사용자 지정 정규식 패턴을 정의합니다.


AI Gateway의 내장 가드레일 시작 방법은 [여기](https://docs.litellm.ai/docs/proxy/guardrails/litellm_content_filter)에서 확인할 수 있습니다.

---

### 성능 - `/responses` 중앙값 지연 시간 19배 감소 {#performance-responses-19x-lower-median-latency}

이번 업데이트는 연결 처리를 위한 내부 네트워크 관리를 통합해 요청별 설정 오버헤드를 제거함으로써 `/responses` 지연 시간을 크게 개선합니다.

#### 결과 {#results}

| 지표 | 이전 | 이후 | 개선 |
|--------|--------|-------|-------------|
| 중앙값 지연 시간 | 3,600 ms | **190 ms** | **−95% (약 19배 더 빠름)** |
| p95 지연 시간 | 4,300 ms | **280 ms** | −93% |
| p99 지연 시간 | 4,600 ms | **590 ms** | −87% |
| 평균 지연 시간 | 3,571 ms | **208 ms** | −94% |
| RPS | 231 | **1,059** | +358% |

#### 테스트 설정 {#test-setup}

| 범주 | 사양 |
|----------|---------------|
| **부하 테스트** | Locust: 동시 사용자 1,000명, ramp-up 500 |
| **시스템** | 4 vCPUs, 8 GB RAM, workers 4개, instances 4개 |
| **데이터베이스** | PostgreSQL (Redis 미사용) |
| **설정** | [config.yaml](https://gist.github.com/AlexsanderHamir/550791675fd752befcac6a9e44024652) |
| **부하 스크립트** | [no_cache_hits.py](https://gist.github.com/AlexsanderHamir/99d673bf74cdd81fd39f59fa9048f2e8) |

---

## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

#### 신규 모델 지원 {#new-model-support}

| 제공자 | 모델 | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Azure | `azure/gpt-5-pro` | 272K | $15.00 | $120.00 | Responses API, 추론, 비전, PDF 입력 |
| Azure | `azure/gpt-image-1-mini` | - | - | - | 이미지 생성 - 픽셀 단위 가격 |
| Azure | `azure/container` | - | - | - | Container API - $0.03/session |
| OpenAI | `openai/container` | - | - | - | Container API - $0.03/session |
| Cohere | `cohere/embed-v4.0` | 128K | $0.12 | - | 이미지 입력을 지원하는 embeddings |
| Gemini | `gemini/gemini-live-2.5-flash-preview-native-audio-09-2025` | 1M | $0.30 | $2.00 | 네이티브 오디오, 비전, 웹 검색 |
| Vertex AI | `vertex_ai/minimaxai/minimax-m2-maas` | 196K | $0.30 | $1.20 | 함수 호출, 도구 선택 |
| NVIDIA | `nvidia/nemotron-nano-9b-v2` | - | - | - | 채팅 완성 |

#### OCR 모델

| 제공자 | 모델 | 페이지당 비용 | 기능 |
| -------- | ----- | ------------- | -------- |
| Azure AI | `azure_ai/doc-intelligence/prebuilt-read` | $0.0015 | 문서 읽기 |
| Azure AI | `azure_ai/doc-intelligence/prebuilt-layout` | $0.01 | 레이아웃 분석 |
| Azure AI | `azure_ai/doc-intelligence/prebuilt-document` | $0.01 | 문서 처리 |
| Vertex AI | `vertex_ai/mistral-ocr-2505` | $0.0005 | OCR 처리 |

#### Search 모델

| 제공자 | 모델 | 가격 | 기능 |
| -------- | ----- | ------- | -------- |
| Firecrawl | `firecrawl/search` | 구간별: $0.00166-$0.0166/query | 쿼리당 결과 10-100개 |
| SearXNG | `searxng/search` | 무료 | 오픈 소스 메타검색 |

#### 기능 {#features}

- **[Azure](../../docs/providers/azure)**
    - reasoning 기능이 포함된 Azure GPT-5-Pro Responses API 지원 추가 - [PR #16235](https://github.com/BerriAI/litellm/pull/16235)
    - 품질 구간(low/medium/high)이 포함된 Azure용 gpt-image-1-mini 가격 추가 - [PR #16182](https://github.com/BerriAI/litellm/pull/16182)
    - Azure OpenAI 예외 발생 시 Azure Content Policy 오류 정보를 반환하는 지원 추가 - [PR #16231](https://github.com/BerriAI/litellm/pull/16231)
    - Azure GPT-5가 O-series 설정으로 잘못 라우팅되는 문제 수정(temperature parameter 미지원) - [PR #16246](https://github.com/BerriAI/litellm/pull/16246)
    - Azure가 extra body param을 허용하지 않는 문제 수정 - [PR #16116](https://github.com/BerriAI/litellm/pull/16116)
    - 안전한 기본 prompt를 사용해 Azure DALL-E-3 상태 확인의 content policy 위반 수정 - [PR #16329](https://github.com/BerriAI/litellm/pull/16329)

- **[Bedrock](../../docs/providers/bedrock)**
    - 400 Bad Request 오류를 방지하도록 AWS Bedrock Converse API의 빈 assistant message 처리 수정 - [PR #15850](https://github.com/BerriAI/litellm/pull/15850)
    - Bedrock InvokeModel 요청 본문에서 AWS 인증 params를 필터링하도록 수정 - [PR #16315](https://github.com/BerriAI/litellm/pull/16315)
    - `cache_control` 사용 시 깨지는 Bedrock proxy의 file content에 name 추가 문제 수정 - [PR #16275](https://github.com/BerriAI/litellm/pull/16275)
    - `global.anthropic.claude-haiku-4-5-20251001-v1:0` `supports_reasoning` flag 수정 및 가격 업데이트 - [PR #16263](https://github.com/BerriAI/litellm/pull/16263)

- **[Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - model map에 gemini live audio model 비용 추가 - [PR #16183](https://github.com/BerriAI/litellm/pull/16183)
    - Gemini parallel tool calls의 translation 문제 수정 - [PR #16194](https://github.com/BerriAI/litellm/pull/16194)
    - custom `api_base` 사용 시 `x-goog-api-key` header로 Gemini API key를 전송하도록 수정 - [PR #16085](https://github.com/BerriAI/litellm/pull/16085)
    - `gemini-2.5-flash-image`에서 `image_config.aspect_ratio`가 동작하지 않는 문제 수정 - [PR #15999](https://github.com/BerriAI/litellm/pull/15999)
    - Gemini minimal reasoning env overrides가 thoughts를 비활성화하는 문제 수정 - [PR #16347](https://github.com/BerriAI/litellm/pull/16347)
    - `gemini-2.5-flash`의 `cache_read_input_token_cost` 수정 - [PR #16354](https://github.com/BerriAI/litellm/pull/16354)

- **[Anthropic](../../docs/providers/anthropic)**
    - VertexAI용 Anthropic token counting 수정 - [PR #16171](https://github.com/BerriAI/litellm/pull/16171)
    - anthropic-adapter: Anthropic image format을 OpenAI 형식으로 올바르게 변환하도록 수정 - [PR #16202](https://github.com/BerriAI/litellm/pull/16202)
    - Databricks의 Claude에 자동 prompt caching message format 활성화 - [PR #16200](https://github.com/BerriAI/litellm/pull/16200)
    - Anthropic Memory Tool 지원 추가 - [PR #16115](https://github.com/BerriAI/litellm/pull/16115)
    - Anthropic long context 비용 계산을 수정하도록 model info에 cache creation/read token 비용 전파 - [PR #16376](https://github.com/BerriAI/litellm/pull/16376)

- **[Vertex AI](../../docs/providers/vertex_ai)**
    - Vertex MiniMAX m2 모델 지원 추가 - [PR #16373](https://github.com/BerriAI/litellm/pull/16373)
    - 429 Resource Exhausted를 RateLimitError로 올바르게 매핑 - [PR #16363](https://github.com/BerriAI/litellm/pull/16363)
    - Vertex AI용 `litellm.rerank()`에 `vertex_credentials` 지원 추가 - [PR #16266](https://github.com/BerriAI/litellm/pull/16266)

- **[Databricks](../../docs/providers/databricks)**
    - databricks streaming 수정 - [PR #16368](https://github.com/BerriAI/litellm/pull/16368)

- **[Deepgram](../../docs/providers/deepgram)**
    - 요청에서 필요한 경우 diarized transcript 반환 - [PR #16133](https://github.com/BerriAI/litellm/pull/16133)

- **[Fireworks](../../docs/providers/fireworks_ai)**
    - Fireworks audio endpoints를 새 `api.fireworks.ai` domains로 업데이트 - [PR #16346](https://github.com/BerriAI/litellm/pull/16346)

- **[Cohere](../../docs/providers/cohere)**
    - cohere embed-v4.0 모델 지원 추가 - [PR #16358](https://github.com/BerriAI/litellm/pull/16358)

- **[Watsonx](../../docs/providers/watsonx)**
    - watsonx chat models에서 `reasoning_effort` 지원 - [PR #16261](https://github.com/BerriAI/litellm/pull/16261)

- **[OpenAI](../../docs/providers/openai)**
    - `reasoning_effort` 변환에서 automatic summary 제거 - [PR #16210](https://github.com/BerriAI/litellm/pull/16210)

- **[XAI](../../docs/providers/xai)**
    - Grok 4 모델 Reasoning Effort Parameter 제거 - [PR #16265](https://github.com/BerriAI/litellm/pull/16265)

- **[Hosted VLLM](../../docs/providers/vllm)**
    - HostedVLLMRerankConfig가 사용되지 않는 문제 수정 - [PR #16352](https://github.com/BerriAI/litellm/pull/16352)

#### 신규 제공자 지원 {#new-provider-support}

- **[Bedrock Agentcore](../../docs/providers/bedrock)**
    - LiteLLM Python SDK와 LiteLLM AI Gateway에 Bedrock Agentcore를 제공자로 추가 - [PR #16252](https://github.com/BerriAI/litellm/pull/16252)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#llm-api-endpoints-features}

- **[OCR API](../../docs/ocr)**
    - VertexAI OCR 제공자 지원 및 비용 추적 추가 - [PR #16216](https://github.com/BerriAI/litellm/pull/16216)
    - Azure AI Doc Intelligence OCR 지원 추가 - [PR #16219](https://github.com/BerriAI/litellm/pull/16219)

- **[Search API](../../docs/search)**
    - 구간별 가격이 포함된 firecrawl search API 지원 추가 - [PR #16257](https://github.com/BerriAI/litellm/pull/16257)
    - searxng search API 제공자 추가 - [PR #16259](https://github.com/BerriAI/litellm/pull/16259)

- **[Responses API](../../docs/response_api)**
    - langfuse otel에서 responses API streaming 지원 - [PR #16153](https://github.com/BerriAI/litellm/pull/16153)
    - Responses API 요청에서 제공자로 `extra_body` parameters 전달 - [PR #16320](https://github.com/BerriAI/litellm/pull/16320)

- **[Container API](../../docs/container_api)**
    - E2E Container API 지원 추가 - [PR #16136](https://github.com/BerriAI/litellm/pull/16136)
    - container 문서를 다른 문서와 유사하게 업데이트 - [PR #16327](https://github.com/BerriAI/litellm/pull/16327)

- **[Video Generation API](../../docs/video_generation)**
    - 비용 추적 및 UI 지원이 포함된 Vertex 및 Gemini Videos API 추가 - [PR #16323](https://github.com/BerriAI/litellm/pull/16323)
    - video endpoints(non-generation)에 `custom_llm_provider` 지원 추가 - [PR #16121](https://github.com/BerriAI/litellm/pull/16121)

- **[Audio API](../../docs/audio)**
    - gpt-4o-transcribe 비용 추적 추가 - [PR #16412](https://github.com/BerriAI/litellm/pull/16412)

- **[Vector Stores](../../docs/vector_stores)**
    - Milvus - search vector store 지원 및 passthrough의 multi-part form data 지원 - [PR #16035](https://github.com/BerriAI/litellm/pull/16035)
    - Azure AI Vector Stores - "virtual" indexes 지원 및 passthrough API에서 vector store 생성 지원 - [PR #16160](https://github.com/BerriAI/litellm/pull/16160)
    - Milvus - Passthrough API 지원 - passthrough API를 통한 vector store 생성 및 읽기 지원 추가 - [PR #16170](https://github.com/BerriAI/litellm/pull/16170)

- **[Embeddings API](../../docs/embedding/supported_embedding)**
    - embeddings endpoint에서 유효한 CallTypes enum value 사용 - [PR #16328](https://github.com/BerriAI/litellm/pull/16328)

- **[Rerank API](../../docs/rerank)**
    - generic cost calculator에서 구간별 가격 계산 일반화 - [PR #16150](https://github.com/BerriAI/litellm/pull/16150)

#### 버그 {#bugs}

- **일반**
    - n>1 및 tool calls를 사용하는 streaming mode에서 index field가 채워지지 않는 문제 수정 - [PR #15962](https://github.com/BerriAI/litellm/pull/15962)
    - `litellm_params`에 `aws_region_name` 전달 - [PR #16321](https://github.com/BerriAI/litellm/pull/16321)
    - `502`, `503`, `504` 오류에 대한 `retry-after` header 지원 추가 - [PR #16288](https://github.com/BerriAI/litellm/pull/16288)

---

## 관리 엔드포인트 / UI {#management-endpoints-ui}

#### 기능 {#management-endpoints-ui-features}

- **가상 키**
    - UI - Team Member 삭제 시 확인 절차 추가 - [PR #16167](https://github.com/BerriAI/litellm/pull/16167)
    - UI - Litellm test key audio 지원 - [PR #16251](https://github.com/BerriAI/litellm/pull/16251)
    - UI - Test Key Page의 Model을 단일 선택으로 되돌림 - [PR #16390](https://github.com/BerriAI/litellm/pull/16390)

- **모델 + 엔드포인트**
    - UI - Add Model의 기존 credentials 개선 - [PR #16166](https://github.com/BerriAI/litellm/pull/16166)
    - UI - Azure AD Token field 추가 및 Azure API Key 선택 사항 처리 - [PR #16331](https://github.com/BerriAI/litellm/pull/16331)
    - UI - Model Create Flow에서 vLLM label 수정 - [PR #16285](https://github.com/BerriAI/litellm/pull/16285)
    - UI - Team 모델 Table에 Model Access Group 모델 포함 - [PR #16298](https://github.com/BerriAI/litellm/pull/16298)
    - SSO Users에서 `/model_group/info`가 전체 Model List를 반환하는 문제 수정 - [PR #16296](https://github.com/BerriAI/litellm/pull/16296)
    - Litellm non-root docker Model Hub Table 수정 - [PR #16282](https://github.com/BerriAI/litellm/pull/16282)

- **가드레일**
    - UI - Guardrail Entity를 선택할 수 없고 entity가 표시되지 않던 regression 수정 - [PR #16165](https://github.com/BerriAI/litellm/pull/16165)
    - UI - Guardrail Info Page에 PII Config 표시 - [PR #16164](https://github.com/BerriAI/litellm/pull/16164)
    - `guardrail_information`을 list type으로 변경 - [PR #16127](https://github.com/BerriAI/litellm/pull/16127)
    - UI - LiteLLM Guardrail - PII Patterns의 UI friendly name을 볼 수 있도록 보장 - [PR #16382](https://github.com/BerriAI/litellm/pull/16382)
    - UI - 가드레일 - LiteLLM Content Filter에서 Content Filter Settings 조회/편집 허용 - [PR #16383](https://github.com/BerriAI/litellm/pull/16383)
    - UI - 가드레일 - UI를 통한 guardrails 업데이트 허용 및 `litellm_params`가 실제로 메모리에서 업데이트되도록 보장 - [PR #16384](https://github.com/BerriAI/litellm/pull/16384)

- **SSO 설정**
    - UI SSO에서 dot notation 지원 - [PR #16135](https://github.com/BerriAI/litellm/pull/16135)
    - UI - SSO proxy base URL 입력에서 trailing slash 방지 - [PR #16244](https://github.com/BerriAI/litellm/pull/16244)
    - UI - SSO Proxy Base URL 입력 검증 및 `/` 정규화 제거 - [PR #16332](https://github.com/BerriAI/litellm/pull/16332)
    - UI - SSO Create 오류를 create flow에 표시 - [PR #16369](https://github.com/BerriAI/litellm/pull/16369)

- **사용량 및 분석**
    - UI - Tag 사용량 Top Model Table View 및 label 수정 - [PR #16249](https://github.com/BerriAI/litellm/pull/16249)
    - UI - Litellm usage date picker - [PR #16264](https://github.com/BerriAI/litellm/pull/16264)

- **Cache 설정**
    - UI - Cache Settings Redis에 Semantic Cache Settings 추가 - [PR #16398](https://github.com/BerriAI/litellm/pull/16398)

#### 버그 {#management-endpoints-ui-bugs}

- **일반**
    - UI - embedding models 요청에서 `encoding_format` 제거 - [PR #16367](https://github.com/BerriAI/litellm/pull/16367)
    - UI - Test Key Multiple Model Select 변경 사항 되돌림 - [PR #16372](https://github.com/BerriAI/litellm/pull/16372)
    - UI - 여러 작은 문제 수정 - [PR #16406](https://github.com/BerriAI/litellm/pull/16406)

---

## AI 통합 {#ai-integrations}

### 로깅 {#logging}

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - cached tokens에 대한 langfuse input tokens 로직 수정 - [PR #16203](https://github.com/BerriAI/litellm/pull/16203)

- **[Opik](../../docs/proxy/logging#opik)**
    - 기존 trace에 잘못 attachment되는 버그 수정 및 refactor - [PR #15529](https://github.com/BerriAI/litellm/pull/15529)

- **[S3](../../docs/proxy/logging#s3)**
    - S3 logger에서 minio logger 사용 시 `ssl_verify` 지원 추가 - [PR #16211](https://github.com/BerriAI/litellm/pull/16211)
    - s3에서 base64 제거 - [PR #16157](https://github.com/BerriAI/litellm/pull/16157)
    - s3 path에 Key 기반 prefix 허용 추가 - [PR #16237](https://github.com/BerriAI/litellm/pull/16237)
    - S3의 callback logging failures를 추적하는 Prometheus metric 추가 - [PR #16209](https://github.com/BerriAI/litellm/pull/16209)

- **[OpenTelemetry](../../docs/proxy/logging#opentelemetry)**
    - OTEL - OTEL Logger에 Cost Breakdown 기록 - [PR #16334](https://github.com/BerriAI/litellm/pull/16334)

- **[DataDog](../../docs/proxy/logging#datadog)**
    - `datadog` callback에 DD Agent Host 지원 추가 - [PR #16379](https://github.com/BerriAI/litellm/pull/16379)

### 가드레일

- **[Noma](../../docs/proxy/guardrails)**
    - Noma Apply Guardrail 구현 되돌림 - [PR #16214](https://github.com/BerriAI/litellm/pull/16214)
    - Litellm noma guardrail image 지원 - [PR #16199](https://github.com/BerriAI/litellm/pull/16199)

- **[PANW Prisma AIRS](../../docs/proxy/guardrails)**
    - PANW prisma airs guardrail deduplication 및 향상된 session tracking - [PR #16273](https://github.com/BerriAI/litellm/pull/16273)

- **[LiteLLM Custom Guardrail](../../docs/proxy/guardrails)**
    - LiteLLM Gateway built-in guardrail 추가 - [PR #16338](https://github.com/BerriAI/litellm/pull/16338)
    - UI - LiteLLM Custom Guardrail 설정 허용 - [PR #16339](https://github.com/BerriAI/litellm/pull/16339)
    - 버그 수정: Content Filter Guard - [PR #16414](https://github.com/BerriAI/litellm/pull/16414)

### Secret Managers {#secret-managers}

- **[CyberArk](../../docs/secret_managers)**
    - CyberArk Secrets Manager Integration 추가 - [PR #16278](https://github.com/BerriAI/litellm/pull/16278)
    - Cyber Ark - Key Rotations 지원 추가 - [PR #16289](https://github.com/BerriAI/litellm/pull/16289)

- **[HashiCorp Vault](../../docs/secret_managers)**
    - HashiCorp Vault에 설정 가능한 mount name 및 path prefix 추가 - [PR #16253](https://github.com/BerriAI/litellm/pull/16253)
    - Secret Manager - Hashicorp, approle을 통한 auth 추가 - [PR #16374](https://github.com/BerriAI/litellm/pull/16374)

- **[AWS Secrets Manager](../../docs/secret_managers)**
    - aws secrets manager에 tags 및 descriptions 지원 추가 - [PR #16224](https://github.com/BerriAI/litellm/pull/16224)

- **[Custom Secret Manager](../../docs/secret_managers)**
    - Custom Secret Manager 추가 - 사용자가 custom secret manager를 정의하고 작성할 수 있도록 허용 - [PR #16297](https://github.com/BerriAI/litellm/pull/16297)

- **일반**
    - Email Notifications - Users가 Key Rotated Email을 받도록 보장 - [PR #16292](https://github.com/BerriAI/litellm/pull/16292)
    - sts boto3의 verify ssl 수정 - [PR #16313](https://github.com/BerriAI/litellm/pull/16313)

---

## 비용 추적, Budgets 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **비용 추적**
    - OpenAI Responses API streaming tests의 usage field names 및 비용 계산 수정 - [PR #16236](https://github.com/BerriAI/litellm/pull/16236)

---

## MCP Gateway {#mcp-gateway}

- **설정**
    - static mcp header 설정 - [PR #16179](https://github.com/BerriAI/litellm/pull/16179)
    - mcp credentials를 db에 유지 - [PR #16308](https://github.com/BerriAI/litellm/pull/16308)


## 성능 / Loadbalancing / Reliability 개선 {#performance-loadbalancing-reliability-improvements}

- **Memory Leak 수정**
    - Pydantic 2.11+ deprecation warnings로 인한 메모리 누적 해결 - [PR #16110](https://github.com/BerriAI/litellm/pull/16110)

- **Session Management**
    - responses API에 `shared_session` 지원 추가 - [PR #16260](https://github.com/BerriAI/litellm/pull/16260)

- **Error Handling**
    - streaming 중 connection closed errors를 우아하게 처리 - [PR #16294](https://github.com/BerriAI/litellm/pull/16294)
    - daily spend sort key의 None 값을 처리 - [PR #16245](https://github.com/BerriAI/litellm/pull/16245)

- **설정**
    - cache control injection index의 minimum validation 제거 - [PR #16149](https://github.com/BerriAI/litellm/pull/16149)
    - clearing logic 개선 - 방문하지 않은 endpoints만 제거 - [PR #16400](https://github.com/BerriAI/litellm/pull/16400)

- **Redis**
    - AWS ElastiCache Valkey의 float `redis_version` 처리 - [PR #16207](https://github.com/BerriAI/litellm/pull/16207)

- **Hooks**
    - `during_call_hook`에 parallel execution 처리 추가 - [PR #16279](https://github.com/BerriAI/litellm/pull/16279)

- **Infrastructure**
    - prisma용 runtime node 설치 - [PR #16410](https://github.com/BerriAI/litellm/pull/16410)



---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - 문서 - v1.79.1 - [PR #16163](https://github.com/BerriAI/litellm/pull/16163)
    - model_management.md의 broken link 수정 - [PR #16217](https://github.com/BerriAI/litellm/pull/16217)
    - image generation response format 수정 - 'image' object 대신 'images' array 사용 - [PR #16378](https://github.com/BerriAI/litellm/pull/16378)

- **일반 문서**
    - production용 minimum resource requirement 추가 - [PR #16146](https://github.com/BerriAI/litellm/pull/16146)
    - 다른 AI gateways와의 benchmark comparison 추가 - [PR #16248](https://github.com/BerriAI/litellm/pull/16248)
    - LiteLLM content filter guard documentation - [PR #16413](https://github.com/BerriAI/litellm/pull/16413)
    - orginal 단어의 오타 수정 - [PR #16255](https://github.com/BerriAI/litellm/pull/16255)

- **보안**
    - tornado test files(test.key 포함)를 제거해 Python 3.13 security issues 수정 - [PR #16342](https://github.com/BerriAI/litellm/pull/16342)

---

## 신규 기여자 {#new-contributors}

* @steve-gore-snapdocs가 [PR #16149](https://github.com/BerriAI/litellm/pull/16149)에서 첫 기여를 했습니다.
* @timbmg가 [PR #16120](https://github.com/BerriAI/litellm/pull/16120)에서 첫 기여를 했습니다.
* @Nivg가 [PR #16202](https://github.com/BerriAI/litellm/pull/16202)에서 첫 기여를 했습니다.
* @pablobgar가 [PR #16194](https://github.com/BerriAI/litellm/pull/16194)에서 첫 기여를 했습니다.
* @AlanPonnachan이 [PR #16150](https://github.com/BerriAI/litellm/pull/16150)에서 첫 기여를 했습니다.
* @Chesars가 [PR #16236](https://github.com/BerriAI/litellm/pull/16236)에서 첫 기여를 했습니다.
* @bowenliang123가 [PR #16255](https://github.com/BerriAI/litellm/pull/16255)에서 첫 기여를 했습니다.
* @dean-zavad가 [PR #16199](https://github.com/BerriAI/litellm/pull/16199)에서 첫 기여를 했습니다.
* @alexkuzmik이 [PR #15529](https://github.com/BerriAI/litellm/pull/15529)에서 첫 기여를 했습니다.
* @Granine이 [PR #16281](https://github.com/BerriAI/litellm/pull/16281)에서 첫 기여를 했습니다.
* @Oodapow가 [PR #16279](https://github.com/BerriAI/litellm/pull/16279)에서 첫 기여를 했습니다.
* @jgoodyear가 [PR #16275](https://github.com/BerriAI/litellm/pull/16275)에서 첫 기여를 했습니다.
* @Qanpi가 [PR #16321](https://github.com/BerriAI/litellm/pull/16321)에서 첫 기여를 했습니다.
* @ShimonMimoun이 [PR #16313](https://github.com/BerriAI/litellm/pull/16313)에서 첫 기여를 했습니다.
* @andriykislitsyn이 [PR #16288](https://github.com/BerriAI/litellm/pull/16288)에서 첫 기여를 했습니다.
* @reckless-huang이 [PR #16263](https://github.com/BerriAI/litellm/pull/16263)에서 첫 기여를 했습니다.
* @chenmoneygithub이 [PR #16368](https://github.com/BerriAI/litellm/pull/16368)에서 첫 기여를 했습니다.
* @stembe-digitalex가 [PR #16354](https://github.com/BerriAI/litellm/pull/16354)에서 첫 기여를 했습니다.
* @jfcherng이 [PR #16352](https://github.com/BerriAI/litellm/pull/16352)에서 첫 기여를 했습니다.
* @xingyaoww가 [PR #16246](https://github.com/BerriAI/litellm/pull/16246)에서 첫 기여를 했습니다.
* @emerzon이 [PR #16373](https://github.com/BerriAI/litellm/pull/16373)에서 첫 기여를 했습니다.
* @wwwillchen이 [PR #16376](https://github.com/BerriAI/litellm/pull/16376)에서 첫 기여를 했습니다.
* @fabriciojoc이 [PR #16203](https://github.com/BerriAI/litellm/pull/16203)에서 첫 기여를 했습니다.
* @jroberts2600이 [PR #16273](https://github.com/BerriAI/litellm/pull/16273)에서 첫 기여를 했습니다.

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.79.1-nightly...v1.79.2.rc.1)**
