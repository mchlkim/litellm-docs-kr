---
title: "v1.79.1-stable - Guardrail Playground"
slug: "v1-79-1"
date: 2025-11-01T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.79.1-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.0
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Container API 지원** - 프록시 통합, 로깅, 비용 추적을 포함한 엔드투엔드 OpenAI Container API 지원
- **FAL AI 이미지 생성** - 비용 추적을 포함해 FAL AI 이미지 생성 모델을 네이티브로 지원
- **UI 개선** - Guardrail Playground, Cache Settings, Tag Routing, SSO Settings
- **Batch API 속도 제한** - Batch API 요청에 입력 기반 속도 제한 지원
- **Vector Store 확장** - Milvus 벡터 저장소 지원 및 Azure AI 가상 인덱스
- **메모리 누수 수정** - Python SDK 및 AI Gateway 메모리 누수의 90%를 차지하던 문제 해결

---

## 의존성 업그레이드 {#dependency-upgrades}

- **의존성**
    - Build(deps): starlette를 0.47.2에서 0.49.1로 상향 - [PR #16027](https://github.com/BerriAI/litellm/pull/16027)
    - Build(deps): fastapi를 0.116.1에서 0.120.1로 상향 - [PR #16054](https://github.com/BerriAI/litellm/pull/16054)
    - Build(deps): /litellm-js/spend-logs의 hono를 4.9.7에서 4.10.3으로 상향 - [PR #15915](https://github.com/BerriAI/litellm/pull/15915)


## 신규 모델 / 업데이트된 모델 {#new-model--updated-model}

#### 신규 모델 지원 {#new-model-support}

| 공급자 | 모델 | 컨텍스트 윈도우 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Mistral | `mistral/codestral-embed` | 8K | $0.15 | - | 임베딩 |
| Mistral | `mistral/codestral-embed-2505` | 8K | $0.15 | - | 임베딩 |
| Gemini | `gemini/gemini-embedding-001` | 2K | $0.15 | - | 임베딩 |
| FAL AI | `fal_ai/fal-ai/flux-pro/v1.1-ultra` | - | - | - | 이미지 생성 - $0.0398/image |
| FAL AI | `fal_ai/fal-ai/imagen4/preview` | - | - | - | 이미지 생성 - $0.0398/image |
| FAL AI | `fal_ai/fal-ai/recraft/v3/text-to-image` | - | - | - | 이미지 생성 - $0.0398/image |
| FAL AI | `fal_ai/fal-ai/stable-diffusion-v35-medium` | - | - | - | 이미지 생성 - $0.0398/image |
| FAL AI | `fal_ai/bria/text-to-image/3.2` | - | - | - | 이미지 생성 - $0.0398/image |
| OpenAI | `openai/sora-2-pro` | - | - | - | 동영상 생성 - $0.30/video/second |

#### 기능 {#features}

- **[Anthropic](../../docs/providers/anthropic)**
    - Claude 3-7 Sonnet 지원 중단일을 2026-02-01에서 2026-02-19로 연장 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - Claude Opus 4-0 지원 중단일을 2025-03-01에서 2026-05-01로 연장 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - Claude Haiku 3-5 지원 중단일 제거(이전 2025-03-01) - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - Claude Opus 4-1, Claude Opus 4-0 20250513, Claude Sonnet 4 20250514 지원 중단일 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - Claude Opus 4-1에 웹 검색 지원 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)

- **[Bedrock](../../docs/providers/bedrock)**
    - AWS Bedrock Converse API에서 빈 assistant 메시지 처리를 수정해 400 Bad Request 오류 방지 - [PR #15850](https://github.com/BerriAI/litellm/pull/15850)
    - Bedrock으로 이미지를 생성할 때 ARN 사용 허용 - [PR #15789](https://github.com/BerriAI/litellm/pull/15789)
    - Bedrock Invoke API에 모델 그룹별 헤더 전달 추가 - [PR #16042](https://github.com/BerriAI/litellm/pull/16042)
    - 헬스 체크에서 Bedrock 추론 프로필 ID 보존 - [PR #15947](https://github.com/BerriAI/litellm/pull/15947)
    - S3가 일반 타입을 반환할 때 파일 content-type을 감지하는 폴백 로직 추가 - S3 호스팅 파일과 함께 Bedrock을 사용할 때 S3 객체의 Content-Type이 올바르게 설정되지 않은 경우(예: image/png 대신 binary/octet-stream)에도 Bedrock이 올바르게 처리할 수 있음 - [PR #15635](https://github.com/BerriAI/litellm/pull/15635)

- **[Azure](../../docs/providers/azure)**
    - Azure OpenAI 모델(gpt-4o-2024-08-06, gpt-4o-2024-11-20, gpt-4.1 series, o3-2025-04-16, text-embedding-3-small)에 지원 중단일 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - Azure 오류에서 Azure OpenAI ContextWindowExceededError 매핑 수정 - [PR #15981](https://github.com/BerriAI/litellm/pull/15981)
    - Azure API 버전에서 `v1` 처리 추가 - [PR #15984](https://github.com/BerriAI/litellm/pull/15984)
    - Azure가 추가 body 매개변수를 허용하지 않는 문제 수정 - [PR #16116](https://github.com/BerriAI/litellm/pull/16116)

- **[OpenAI](../../docs/providers/openai)**
    - gpt-3.5-turbo-1106, gpt-4-0125-preview, gpt-4-1106-preview, o1-mini-2024-09-12의 지원 중단일 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - 확장된 Sora-2 모달리티 지원(텍스트 + 이미지 입력) 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)
    - OpenAI Sora-2-Pro 가격을 $0.30/video/second로 업데이트 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)

- **[OpenRouter](../../docs/providers/openrouter)**
    - OpenRouter용 Claude Haiku 4.5 가격 추가 - [PR #15909](https://github.com/BerriAI/litellm/pull/15909)
    - 환경 변수 문서와 함께 base_url 설정 추가 - [PR #15946](https://github.com/BerriAI/litellm/pull/15946)

- **[Mistral](../../docs/providers/mistral)**
    - codestral-embed-2505 임베딩 모델 추가 - [PR #16071](https://github.com/BerriAI/litellm/pull/16071)

- **[Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - 도구 사용 시 gemini 요청 변형 문제 수정 - [PR #16002](https://github.com/BerriAI/litellm/pull/16002)
    - Google GenAI API용 gemini-embedding-001 가격 항목 추가 - [PR #16078](https://github.com/BerriAI/litellm/pull/16078)
    - gemini-2.5-pro 모델의 frequency_penalty 및 presence_penalty 문제 수정 - [PR #16041](https://github.com/BerriAI/litellm/pull/16041)

- **[DeepInfra](../../docs/providers/deepinfra)**
    - Qwen/Qwen3-chat-32b 모델에 비전 지원 추가 - [PR #15976](https://github.com/BerriAI/litellm/pull/15976)

- **[Vercel AI Gateway](../../docs/providers/vercel_ai_gateway)**
    - glm-4.6의 vercel_ai_gateway 항목 수정(vercel_ai_gateway/glm-4.6에서 vercel_ai_gateway/zai/glm-4.6으로 이동) - [PR #16084](https://github.com/BerriAI/litellm/pull/16084)

- **[Fireworks](../../docs/providers/fireworks_ai)**
    - Fireworks Provider에 "accounts/fireworks/models" 접두사를 추가하지 않도록 수정 - [PR #15938](https://github.com/BerriAI/litellm/pull/15938)

- **[Cohere](../../docs/providers/cohere)**
    - Cohere v2 citations에 OpenAI 호환 annotations 지원 추가 - [PR #16038](https://github.com/BerriAI/litellm/pull/16038)

- **[Deepgram](../../docs/providers/deepgram)**
    - 사용 가능한 경우 Deepgram 감지 언어 처리 - [PR #16093](https://github.com/BerriAI/litellm/pull/16093)

### 버그 수정 {#bug-fixes}

- **[Xai](../../docs/providers/xai)**
    - Xai 웹 검색 비용 추적 추가 - [PR #16001](https://github.com/BerriAI/litellm/pull/16001)

#### 신규 공급자 지원 {#new-provider-support}

- **[FAL AI](../../docs/image_generation)**
    - FAL AI 이미지 생성 지원 추가 - [PR #16067](https://github.com/BerriAI/litellm/pull/16067)

- **[OCI (Oracle Cloud Infrastructure)](../../docs/providers/oci)**
    - OCI Signer 인증 지원 추가 - [PR #16064](https://github.com/BerriAI/litellm/pull/16064)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Container API](../../docs/containers)**
    - LiteLLM SDK에 엔드투엔드 OpenAI Container API 지원 추가 - [PR #16136](https://github.com/BerriAI/litellm/pull/16136)
    - container API에 프록시 지원 추가 - [PR #16049](https://github.com/BerriAI/litellm/pull/16049)
    - Container API에 로깅 지원 추가 - [PR #16049](https://github.com/BerriAI/litellm/pull/16049)
    - 문서와 함께 container 비용 추적 지원 추가 - [PR #16117](https://github.com/BerriAI/litellm/pull/16117)

- **[Responses API](../../docs/response_api)**
    - Responses API에서 `LiteLLM-Disable-Message-Redaction` 헤더 준수 - [PR #15966](https://github.com/BerriAI/litellm/pull/15966)
    - responses API에 /openai 라우트 추가(Azure OpenAI SDK 호환성) - [PR #15988](https://github.com/BerriAI/litellm/pull/15988)
    - 메시지 로깅이 비활성화된 경우 ResponsesAPI 출력에서 추론 요약 마스킹 - [PR #15965](https://github.com/BerriAI/litellm/pull/15965)
    - 네이티브 ResponsesAPIConfig가 없는 공급자를 위해 Responses API에서 text.format 매개변수 지원 - [PR #16023](https://github.com/BerriAI/litellm/pull/16023)
    - Responses API에 LLM 공급자 응답 헤더 추가 - [PR #16091](https://github.com/BerriAI/litellm/pull/16091)

- **[Video Generation API](../../docs/video_generation)**
    - 동영상 엔드포인트(비생성)에 `custom_llm_provider` 지원 추가 - [PR #16121](https://github.com/BerriAI/litellm/pull/16121)
    - 동영상 문서 수정 - [PR #15937](https://github.com/BerriAI/litellm/pull/15937)
    - 동영상용 OpenAI 클라이언트 사용 문서 추가 및 탐색 표시 문제 수정 - [PR #15996](https://github.com/BerriAI/litellm/pull/15996)

- **[Moderations API](../../docs/moderations)**
    - Moderations 엔드포인트가 이제 `api_base` 설정 매개변수를 준수 - [PR #16087](https://github.com/BerriAI/litellm/pull/16087)

- **[Vector Stores](../../docs/vector_stores)**
    - Milvus - 검색 벡터 저장소 지원 - [PR #16035](https://github.com/BerriAI/litellm/pull/16035)
    - Azure AI Vector Stores - "virtual" 인덱스 지원 + passthrough API에서 벡터 저장소 생성 - [PR #16160](https://github.com/BerriAI/litellm/pull/16160)

- **[Passthrough Endpoints](../../docs/pass_through/vertex_ai)**
    - passthrough에서 multi-part form data 지원 - [PR #16035](https://github.com/BerriAI/litellm/pull/16035)


---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **가상 키**
    - SSO Settings에서 Proxy Base URL 검증 추가 - [PR #16082](https://github.com/BerriAI/litellm/pull/16082)
    - Test Key UI에 Embeddings 지원 추가 - [PR #16065](https://github.com/BerriAI/litellm/pull/16065)
    - Key Settings에 Key Type Select 추가 - [PR #16034](https://github.com/BerriAI/litellm/pull/16034)
    - Key Already Exist 오류 알림 추가 - [PR #15993](https://github.com/BerriAI/litellm/pull/15993)

- **모델 + Endpoints**
    - New LLM Credentials에서 API Base를 Select에서 Input으로 변경 - [PR #15987](https://github.com/BerriAI/litellm/pull/15987)
    - 관리자 UI 숫자 입력의 제한 제거 - [PR #15991](https://github.com/BerriAI/litellm/pull/15991)
    - Config 모델을 편집할 수 없도록 수정 - [PR #16020](https://github.com/BerriAI/litellm/pull/16020)
    - 모델 생성에 tags 추가 - [PR #16138](https://github.com/BerriAI/litellm/pull/16138)
    - 모델 업데이트에 Tags 추가 - [PR #16140](https://github.com/BerriAI/litellm/pull/16140)

- **가드레일**
    - Apply Guardrail Testing Playground 추가 - [PR #16030](https://github.com/BerriAI/litellm/pull/16030)
    - Config 가드레일을 편집할 수 없도록 수정하고 가드레일 정보 수정 - [PR #16142](https://github.com/BerriAI/litellm/pull/16142)

- **Cache Settings**
    - UI에서 캐시 설정을 지정할 수 있도록 허용 - [PR #16143](https://github.com/BerriAI/litellm/pull/16143)

- **Routing**
    - UI에서 모든 라우팅 전략과 태그 필터링을 설정할 수 있도록 허용 - [PR #16139](https://github.com/BerriAI/litellm/pull/16139)

- **Admin Settings**
    - health/readiness 엔드포인트에 라이선스 메타데이터 추가 - [PR #15997](https://github.com/BerriAI/litellm/pull/15997)
    - LiteLLM Backend SSO 변경 - [PR #16029](https://github.com/BerriAI/litellm/pull/16029)



---

## 로깅 / 가드레일 / 프롬프트 관리 통합 {#logging--guardrail--prompt-management-integrations}

#### 기능 {#features-3}

- **[OpenTelemetry](../../docs/proxy/logging#opentelemetry)**
    - 외부 tracer를 통한 OpenTelemetry 컨텍스트 전파 활성화 - [PR #15940](https://github.com/BerriAI/litellm/pull/15940)
    - OTEL에 오류 정보가 로깅되도록 보장 - [PR #15978](https://github.com/BerriAI/litellm/pull/15978)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - langfuse_otel의 중복 trace 수정 - [PR #15931](https://github.com/BerriAI/litellm/pull/15931)
    - Langfuse OTEL 통합에서 도구 사용 메시지 지원 - [PR #15932](https://github.com/BerriAI/litellm/pull/15932)

- **[DataDog](../../docs/proxy/logging#datadog)**
    - key의 metadata와 guardrail이 DD에 로깅되도록 보장 - [PR #15980](https://github.com/BerriAI/litellm/pull/15980)

- **[Opik](../../docs/proxy/logging#opik)**
    - API key auth에서 요청자 메타데이터 조회 개선 - [PR #15897](https://github.com/BerriAI/litellm/pull/15897)
    - 사용자 인증 키 메타데이터 문서화 - [PR #16004](https://github.com/BerriAI/litellm/pull/16004)

- **[SQS](../../docs/proxy/logging#sqs)**
    - SQS Logger에 Base64 처리 추가 - [PR #16028](https://github.com/BerriAI/litellm/pull/16028)

- **일반**
    - 수정: custom callback에서 사용자 API key, team id, user id가 누락되어도 오작동하지 않도록 수정 - [PR #15982](https://github.com/BerriAI/litellm/pull/15982)

#### 가드레일

- **[IBM 가드레일](../../docs/proxy/guardrails)**
    - IBM 가드레일이 SSL Verify 인수를 올바르게 사용하도록 업데이트 - [PR #15975](https://github.com/BerriAI/litellm/pull/15975)
    - ibm_guardrails.md 문서에 추가 세부 정보 보강 - [PR #15971](https://github.com/BerriAI/litellm/pull/15971)

- **[Model Armor](../../docs/proxy/guardrails)**
    - model armor guardrails에 during_call 지원 - [PR #15970](https://github.com/BerriAI/litellm/pull/15970)

- **[Lasso Security](../../docs/proxy/guardrails)**
    - Lasso API v3로 업그레이드하고 ULID 생성 수정 - [PR #15941](https://github.com/BerriAI/litellm/pull/15941)

- **[PANW Prisma AIRS](../../docs/proxy/guardrails)**
    - PANW Prisma AIRS에 요청별 프로필 override 추가 - [PR #16069](https://github.com/BerriAI/litellm/pull/16069)

- **[Grayswan](../../docs/proxy/guardrails)**
    - Grayswan 가드레일 문서 개선 - [PR #15875](https://github.com/BerriAI/litellm/pull/15875)

- **[Pillar AI](../../docs/proxy/guardrails)**
    - litellm 사용 시 pillar service에 graceful degradation 적용 - [PR #15857](https://github.com/BerriAI/litellm/pull/15857)

- **일반**
    - Key 가드레일이 적용되도록 보장 - [PR #16025](https://github.com/BerriAI/litellm/pull/16025)

#### 프롬프트 관리 {#prompt-management}

- **[GitLab](../../docs/prompt_management)**
    - GitlabPromptCache를 추가하고 하위 폴더 접근 활성화 - [PR #15712](https://github.com/BerriAI/litellm/pull/15712)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

- **비용 추적**
    - OCR/aOCR 요청의 지출 추적 수정(`pages_processed` 로깅 + `OCRResponse` 인식) - [PR #16070](https://github.com/BerriAI/litellm/pull/16070)

- **속도 제한**
    - Batch API 속도 제한 지원 추가 - PR1에서 입력 기반 속도 제한 지원 추가 - [PR #16075](https://github.com/BerriAI/litellm/pull/16075)
    - descriptor별 여러 속도 제한 유형을 처리하고 IndexError 방지 - [PR #16039](https://github.com/BerriAI/litellm/pull/16039)

---

## MCP Gateway

- **OAuth**
    - dynamic client registration 지원 추가 - [PR #15921](https://github.com/BerriAI/litellm/pull/15921)
    - OAuth 엔드포인트에서 X-Forwarded- 헤더 준수 - [PR #16036](https://github.com/BerriAI/litellm/pull/16036)

---

## 성능 / 로드 밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

- **메모리 누수 수정**
    - 수정: AsyncHTTPHandler에서 httpx DeprecationWarning 메모리 누수 방지 - [PR #16024](https://github.com/BerriAI/litellm/pull/16024)
    - 수정: Pydantic 2.11+ 지원 중단 경고로 인한 메모리 누적 해결 - [PR #16110](https://github.com/BerriAI/litellm/pull/16110)
    - Fix(apscheduler): jitter와 잦은 작업 간격으로 인한 메모리 누수 방지 - [PR #15846](https://github.com/BerriAI/litellm/pull/15846)

- **설정**
    - cache control injection index의 최소값 검증 제거 - [PR #16149](https://github.com/BerriAI/litellm/pull/16149)
    - prompt_caching.md 수정: 잘못된 prompt_tokens 정의 - [PR #16044](https://github.com/BerriAI/litellm/pull/16044)


---

## 문서 업데이트 {#documentation-updates}

- **공급자 문서**
    - 예제에서 custom-llm-provider 헤더 사용 - [PR #16055](https://github.com/BerriAI/litellm/pull/16055)
    - LiteLLM docs readme 수정 - [PR #16107](https://github.com/BerriAI/litellm/pull/16107)
    - Readme 수정 및 지원 공급자 추가 - [PR #16109](https://github.com/BerriAI/litellm/pull/16109)

- **모델 참조**
    - model_prices_and_context_window.json의 qwen-vl 모델에 supports vision 필드 추가 - [PR #16106](https://github.com/BerriAI/litellm/pull/16106)

- **일반 문서**
    - 1-79-0 문서 - [PR #15936](https://github.com/BerriAI/litellm/pull/15936)
    - 프로덕션 최소 리소스 요구사항 추가 - [PR #16146](https://github.com/BerriAI/litellm/pull/16146)

---

## 신규 기여자 {#new-contributors}

* @RobGeada가 [PR #15975](https://github.com/BerriAI/litellm/pull/15975)에서 첫 기여를 했습니다
* @shanto12가 [PR #15946](https://github.com/BerriAI/litellm/pull/15946)에서 첫 기여를 했습니다
* @dima-hx430가 [PR #15976](https://github.com/BerriAI/litellm/pull/15976)에서 첫 기여를 했습니다
* @m-misiura가 [PR #15971](https://github.com/BerriAI/litellm/pull/15971)에서 첫 기여를 했습니다
* @ylgibby가 [PR #15947](https://github.com/BerriAI/litellm/pull/15947)에서 첫 기여를 했습니다
* @Somtom이 [PR #15909](https://github.com/BerriAI/litellm/pull/15909)에서 첫 기여를 했습니다
* @rodolfo-nobrega가 [PR #16023](https://github.com/BerriAI/litellm/pull/16023)에서 첫 기여를 했습니다
* @bernata가 [PR #15997](https://github.com/BerriAI/litellm/pull/15997)에서 첫 기여를 했습니다
* @AlbertDeFusco가 [PR #15881](https://github.com/BerriAI/litellm/pull/15881)에서 첫 기여를 했습니다
* @komarovd95가 [PR #15789](https://github.com/BerriAI/litellm/pull/15789)에서 첫 기여를 했습니다
* @langpingxue가 [PR #15635](https://github.com/BerriAI/litellm/pull/15635)에서 첫 기여를 했습니다
* @OrionCodeDev가 [PR #16070](https://github.com/BerriAI/litellm/pull/16070)에서 첫 기여를 했습니다
* @sbinnee가 [PR #16078](https://github.com/BerriAI/litellm/pull/16078)에서 첫 기여를 했습니다
* @JetoPistola가 [PR #16106](https://github.com/BerriAI/litellm/pull/16106)에서 첫 기여를 했습니다
* @gvioss가 [PR #16093](https://github.com/BerriAI/litellm/pull/16093)에서 첫 기여를 했습니다
* @pale-aura가 [PR #16084](https://github.com/BerriAI/litellm/pull/16084)에서 첫 기여를 했습니다
* @tanvithakur94가 [PR #16041](https://github.com/BerriAI/litellm/pull/16041)에서 첫 기여를 했습니다
* @li-boxuan이 [PR #16044](https://github.com/BerriAI/litellm/pull/16044)에서 첫 기여를 했습니다
* @1stprinciple이 [PR #15938](https://github.com/BerriAI/litellm/pull/15938)에서 첫 기여를 했습니다
* @raghav-stripe가 [PR #16137](https://github.com/BerriAI/litellm/pull/16137)에서 첫 기여를 했습니다
* @steve-gore-snapdocs가 [PR #16149](https://github.com/BerriAI/litellm/pull/16149)에서 첫 기여를 했습니다

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 변경 이력 보기](https://github.com/BerriAI/litellm/compare/v1.79.0-stable...v1.80.0-stable)**
