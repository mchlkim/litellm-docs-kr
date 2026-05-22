---
title: "v1.76.0-stable - RPS 개선"
slug: "v1-76-0"
date: 2025-08-23T10:00:00
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

:::info

LiteLLM은 샌프란시스코에서 **Founding Backend Engineer**를 채용하고 있습니다.

관심이 있다면 [여기에서 지원하세요](https://www.ycombinator.com/companies/litellm/jobs/6uvoBp3-founding-backend-engineer)!
:::





## 이 버전 배포 {#deploy-this-version}

:::info

이 릴리스는 아직 라이브 상태가 아닙니다.
:::


---

## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

#### 버그 {#bugs}
- **[OpenAI](../../docs/providers/openai)**
    - Gpt-5 chat: function calling을 지원하지 않는다는 점을 명확히 함 [PR #13612](https://github.com/BerriAI/litellm/pull/13612), s/o  @[superpoussin22](https://github.com/superpoussin22)
- **[VertexAI](../../docs/providers/vertex)**
    - vertexai batch file format 수정 by @[thiagosalvatore](https://github.com/thiagosalvatore) in [PR #13576](https://github.com/BerriAI/litellm/pull/13576)
- **[LiteLLM Proxy](../../docs/providers/litellm_proxy)**
    - SDK를 통해 Proxy에서 image_edits + image_generations를 호출하는 지원 추가 - [PR #13735](https://github.com/BerriAI/litellm/pull/13735)
- **[OpenRouter](../../docs/providers/openrouter)**
    - anthropic Claude 4의 max_output_tokens 값 수정 - [PR #13526](https://github.com/BerriAI/litellm/pull/13526)
- **[Gemini](../../docs/providers/gemini)**
    - prompt caching 비용 계산 수정 - [PR #13742](https://github.com/BerriAI/litellm/pull/13742)
- **[Azure](../../docs/providers/azure)**
    - `../openai/v1/respones` api base 지원 - [PR #13526](https://github.com/BerriAI/litellm/pull/13526)
    - azure/gpt-5-chat max_input_tokens 수정 - [PR #13660](https://github.com/BerriAI/litellm/pull/13660)
- **[Groq](../../docs/providers/groq)**
    - streaming ASCII encoding 문제 수정 - [PR #13675](https://github.com/BerriAI/litellm/pull/13675)
- **[Baseten](../../docs/providers/baseten)**
    - 새 openai-compatible endpoints를 사용하도록 integration 리팩터링 - [PR #13783](https://github.com/BerriAI/litellm/pull/13783)
- **[Bedrock](../../docs/providers/bedrock)**
    - bedrock의 pass-through endpoints용 application inference profile 수정 - [PR #13881](https://github.com/BerriAI/litellm/pull/13881)
- **[DataRobot](../../docs/providers/datarobot)**
    - DataRobot provider URL의 URL 처리 업데이트 - [PR #13880](https://github.com/BerriAI/litellm/pull/13880)

#### 기능 {#features}
- **[Together AI](../../docs/providers/together)**
    - Qwen3, Deepseek R1 0528 Throughput, GLM 4.5 및 GPT-OSS models 비용 추적 추가 - [PR #13637](https://github.com/BerriAI/litellm/pull/13637), s/o  @[Tasmay-Tibrewal](https://github.com/Tasmay-Tibrewal)
- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - fireworks_ai/accounts/fireworks/models/deepseek-v3-0324 추가 - [PR #13821](https://github.com/BerriAI/litellm/pull/13821)
- **[VertexAI](../../docs/providers/vertex)**
    - VertexAI qwen API Service 추가 - [PR #13828](https://github.com/BerriAI/litellm/pull/13828)
    - 새 VertexAI image models vertex_ai/imagen-4.0-generate-001, vertex_ai/imagen-4.0-ultra-generate-001, vertex_ai/imagen-4.0-fast-generate-001 추가 - [PR #13874](https://github.com/BerriAI/litellm/pull/13874)
- **[Anthropic](../../docs/providers/anthropic)**
    - 비용 추적이 포함된 long context 지원 추가 - [PR #13759](https://github.com/BerriAI/litellm/pull/13759)
- **[DeepInfra](../../docs/providers/deepinfra)**
    - deepinfra용 rerank endpoint 지원 추가 - [PR #13820](https://github.com/BerriAI/litellm/pull/13820)
    - 비용 추적용 새 models 추가 - [PR #13883](https://github.com/BerriAI/litellm/pull/13883), s/o  @[Toy-97](https://github.com/Toy-97)
- **[Bedrock](../../docs/providers/bedrock)**
    - async calls에서 tool prompt caching 추가 - [PR #13803](https://github.com/BerriAI/litellm/pull/13803), s/o  @[UlookEE](https://github.com/UlookEE)
    - aws bedrock용 webauthentication에서 role chaining 및 session name 지원 - [PR #13753](https://github.com/BerriAI/litellm/pull/13753), s/o @[RichardoC](https://github.com/RichardoC)
- **[Ollama](../../docs/providers/ollama)**
    - non-tool trained models에서 tool calling을 사용할 때 Ollama null response 처리 - [PR #13902](https://github.com/BerriAI/litellm/pull/13902)
- **[OpenRouter](../../docs/providers/openrouter)**
    - deepseek/deepseek-chat-v3.1 지원 추가 - [PR #13897](https://github.com/BerriAI/litellm/pull/13897)
- **[Mistral](../../docs/providers/mistral)**
    - chat completions를 통한 mistral files 호출 지원 추가 - [PR #13866](https://github.com/BerriAI/litellm/pull/13866), s/o  @[jinskjoy](https://github.com/jinskjoy)
    - 빈 assistant content 처리 - [PR #13671](https://github.com/BerriAI/litellm/pull/13671)
    - 새 ‘thinking’ response block 지원 - [PR #13671](https://github.com/BerriAI/litellm/pull/13671)
- **[Databricks](../../docs/providers/databricks)**
    - deprecated dbrx models(dbrx-instruct, llama 3.1) 제거 - [PR #13843](https://github.com/BerriAI/litellm/pull/13843)
- **[AI/ML API](../../docs/providers/ai_ml_api)**
    - Image gen api 지원 - [PR #13893](https://github.com/BerriAI/litellm/pull/13893)


## LLM API 엔드포인트 {#llm-api-endpoints}
#### 버그 {#bugs-1}
- **[Responses API](../../docs/response_api)**
    - openai responses api calls용 기본 api version 추가 - [PR #13526](https://github.com/BerriAI/litellm/pull/13526)
    - allowed_openai_params 지원 - [PR #13671](https://github.com/BerriAI/litellm/pull/13671)


## MCP 게이트웨이 {#mcp-gateway}
#### 버그 {#bugs-2}
- StreamableHTTPSessionManager .run() 오류 수정 - [PR #13666](https://github.com/BerriAI/litellm/pull/13666)

## 벡터 저장소 {#vector-stores}
#### 버그 {#bugs-3}
- **[Bedrock](../../docs/providers/bedrock)**
    - Query에 LiteLLM Managed Credentials 사용 - [PR #13787](https://github.com/BerriAI/litellm/pull/13787)

## 관리 엔드포인트 / UI {#management-endpoints-ui}
#### 버그 {#bugs-4}
- **[Passthrough](../../docs/pass_through/intro)**
    - query passthrough 삭제 수정 - [PR #13622](https://github.com/BerriAI/litellm/pull/13622)

#### 기능 {#features-1}
- **모델**
    - 모델 대시보드에서 공개 모델 이름 검색 기능 추가 - [PR #13687](https://github.com/BerriAI/litellm/pull/13687)
    - UI에서 deployment Name에 `azure/` 자동 추가 - [PR #13685](https://github.com/BerriAI/litellm/pull/13685)
    - 모델 page row UI 재구성 - [PR #13771](https://github.com/BerriAI/litellm/pull/13771)
- **알림**
    - 전체 영역에 새 notifications toast UI 추가 - [PR #13813](https://github.com/BerriAI/litellm/pull/13813)
- **키**
    - key 재생성 후 key edit settings 수정 - [PR #13815](https://github.com/BerriAI/litellm/pull/13815)
    - 서비스 계정 키 생성 시 team_id 필수화 - [PR #13873](https://github.com/BerriAI/litellm/pull/13873)
    - 필터 - 필터 옵션 클릭 시 모든 옵션 표시 - [PR #13858](https://github.com/BerriAI/litellm/pull/13858)
- **사용법**
    - user agent activity tab의 ‘Cannot read properties of undefined’ 예외 수정 - [PR #13892](https://github.com/BerriAI/litellm/pull/13892)
- **SSO**
    - 최대 5명 사용자까지 무료 SSO 사용 지원 - [PR #13843](https://github.com/BerriAI/litellm/pull/13843)

## 로깅 / 가드레일 통합 {#logging-guardrail-integrations}
#### 버그 {#bugs-5}
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - bedrock api key 지원 추가 - [PR #13835](https://github.com/BerriAI/litellm/pull/13835)
#### 기능 {#features-2}
- **[Datadog LLM 관측성](../../docs/integrations/datadog)**
    - 실패 로깅 지원 추가 [PR #13726](https://github.com/BerriAI/litellm/pull/13726)
    - 최초 토큰까지의 시간, litellm overhead, guardrail overhead latency metrics 추가 - [PR #13734](https://github.com/BerriAI/litellm/pull/13734)
    - guardrail input/output tracing 지원 추가 - [PR #13767](https://github.com/BerriAI/litellm/pull/13767)
- **[Langfuse OTEL](../../docs/integrations/langfuse)**
    - 키/팀 기반 로깅 사용 허용 - [PR #13791](https://github.com/BerriAI/litellm/pull/13791)
- **[AIM](../../docs/integrations/aim)**
    - 새 firewall API로 마이그레이션 - [PR #13748](https://github.com/BerriAI/litellm/pull/13748)
- **[OTEL](../../docs/observability/opentelemetry_integration)**
    - 실제 LLM API call용 OTEL tracing 추가 - [PR #13836](https://github.com/BerriAI/litellm/pull/13836)
- **[MLFlow](../../docs/observability/mlflow_integration)**
    - MLflow tracing에 predicted output 포함 - [PR #13795](https://github.com/BerriAI/litellm/pull/13795), s/o @TomeHirata  


## 성능 / 로드밸런싱 / 안정성 개선 {#performance-loadbalancing-reliability-improvements}
#### 버그 {#bugs-6}
- **[Cooldowns](../../docs/routing#how-cooldowns-work)**
    - raw Azure Exceptions를 client에 반환하지 않도록 수정(prompt leakage 포함 가능) - [PR #13529](https://github.com/BerriAI/litellm/pull/13529)
- **[Auto-router](../../docs/proxy/auto_routing)**
    - LiteLLM Docker에 auto router 관련 dependencies가 존재하도록 보장 - [PR #13788](https://github.com/BerriAI/litellm/pull/13788)
- **Model Alias**
    - model alias 접근 권한이 있는 key 호출 수정 - [PR #13830](https://github.com/BerriAI/litellm/pull/13830)

#### 기능 {#features-3}
- **[S3 캐싱](../../docs/proxy/caching)**
    - s3 cache의 prefix로 namespace 사용 - [PR #13704](https://github.com/BerriAI/litellm/pull/13704)
    - Async S3 캐싱 지원(4x RPS 개선) - [PR #13852](https://github.com/BerriAI/litellm/pull/13852), s/o @[michal-otmianowski](https://github.com/michal-otmianowski)
- **Model Group 헤더 전달**
    - global header forwarding과 동일한 로직 재사용 - [PR #13741](https://github.com/BerriAI/litellm/pull/13741)
    - UI에서 hosted_vllm 지원 추가 - [PR #13885](https://github.com/BerriAI/litellm/pull/13885)
- **성능**
    - LiteLLM Python SDK RPS를 +200 RPS 개선(braintrust import + aiohttp transport 수정) - [PR #13839](https://github.com/BerriAI/litellm/pull/13839)
    - model routing에 O(1) Set lookup 사용 - [PR #13879](https://github.com/BerriAI/litellm/pull/13879)
    - litellm_logging.py의 상당한 CPU overhead 감소 - [PR #13895](https://github.com/BerriAI/litellm/pull/13895)
    - Async Success Handler(Logging Callbacks) 개선 - 약 +130 RPS - [PR #13905](https://github.com/BerriAI/litellm/pull/13905)


## 일반 Proxy 개선 {#general-proxy-improvements}
#### 버그 {#bugs-7}

- **SDK**
    - 최신 openAI 릴리스(>v1.100.0)와 litellm 호환성 수정 - [PR #13728](https://github.com/BerriAI/litellm/pull/13728)
- **Helm**
    - migrations-job의 resources 구성 가능성 추가 - [PR #13617](https://github.com/BerriAI/litellm/pull/13617)
    - Helm chart가 자동 생성한 master keys가 sk-xxxx 형식을 따르도록 보장 - [PR #13871](https://github.com/BerriAI/litellm/pull/13871)
    - database configuration 개선: optional endpointKey 지원 추가 - [PR #13763](https://github.com/BerriAI/litellm/pull/13763)
- **Rate Limits**
    - parallel_request_limiter_v3의 descriptor/response size mismatch 수정 - [PR #13863](https://github.com/BerriAI/litellm/pull/13863), s/o  @[luizrennocosta](https://github.com/luizrennocosta)
- **Non-root**
    - non-root image에서 prisma migrate permission access 수정 - [PR #13848](https://github.com/BerriAI/litellm/pull/13848), s/o @[Ithanil](https://github.com/Ithanil)
