---
title: "v1.78.0-stable - MCP Gateway: 팀 및 키별 도구 액세스 제어"
slug: "v1-78-0"
date: 2025-10-11T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.78.0-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.78.0.post1
```

</TabItem>
</Tabs>

---

## 주요 내용 {#key-highlights}

- **MCP Gateway - 팀 및 키별 도구 액세스 제어** - 팀/키 단위로 MCP 도구 액세스를 제어합니다.
- **성능 개선** - p99 지연 시간이 70% 감소했습니다.
- **GPT-5 Pro 및 GPT-Image-1-Mini** - OpenAI GPT-5 Pro(400K 컨텍스트)와 gpt-image-1-mini 이미지 생성을 출시 당일부터 지원합니다.
- **EnkryptAI 가드레일** - 콘텐츠 모더레이션을 위한 새 가드레일 통합을 추가했습니다.
- **태그 기반 예산** - 요청 태그를 기준으로 예산을 설정할 수 있습니다.

---

### MCP Gateway - 팀 및 키별 도구 액세스 제어 {#mcp-gateway-control-tool-access-by-team-key}

<Image 
  img={require('../../img/release_notes/tool_control.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

Proxy 관리자는 이제 팀 또는 키별로 MCP 도구 액세스를 제어할 수 있습니다. 같은 MCP 서버의 도구라도 팀마다 선택적으로 권한을 부여하기 쉬워졌습니다.

예를 들어 Engineering 팀에는 `list_repositories`, `create_issue`, `search_code` 도구 액세스를 부여하고, Sales 팀에는 `search_code`와 `close_issue` 도구만 부여할 수 있습니다.

이를 통해 Proxy Admin이 MCP Tool Access를 더 쉽게 관리할 수 있습니다.

[시작하기](../../docs/mcp_control#set-allowed-tools-for-a-key-team-or-organization)

---

## 성능 - p99 지연 시간 70% 감소 {#performance-70-lower-p99-latency}

<Image img={require('../../img/release_notes/1_78_0_perf.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 LiteLLM AI Gateway의 p99 지연 시간을 70% 줄여, 낮은 지연 시간이 중요한 사용 사례에 더 적합해졌습니다.

이 개선은 두 가지 핵심 변경에서 나왔습니다.

**안정적인 세션**

aiohttp의 공유 세션 지원을 추가했습니다. 이제 모든 호출에서 shared_session 파라미터를 일관되게 사용해 연결 풀링을 활성화합니다.

**더 빠른 라우팅**

새 `model_name_to_deployment_indices` 해시 맵이 `_get_all_deployments()`의 O(n) 리스트 스캔을 O(1) 해시 조회로 대체해 라우팅 성능과 확장성을 높입니다.

그 결과 모든 지연 시간 백분위에서 성능이 개선되었습니다.

- **중앙값 지연 시간:** 110 ms → **100 ms** (−9.1%)
- **p95 지연 시간:** 440 ms → **150 ms** (−65.9%)
- **p99 지연 시간:** 810 ms → **240 ms** (−70.4%)
- **평균 지연 시간:** 310 ms → **111.73 ms** (−64.0%)

### **테스트 설정** {#test-setup}

**Locust**

- **동시 사용자:** 1,000
- **Ramp-up:** 500

**시스템 사양**

- **데이터베이스 사용**
- **CPU:** 4 vCPUs
- **메모리:** 8 GB RAM
- **LiteLLM Workers:** 4
- **인스턴스**: 4

**설정 (config.yaml)**

전체 설정 보기: [gist.github.com/AlexsanderHamir/config.yaml](https://gist.github.com/AlexsanderHamir/53f7d554a5d2afcf2c4edb5b6be68ff4)

**부하 스크립트 (no_cache_hits.py)**

전체 부하 테스트 스크립트 보기: [gist.github.com/AlexsanderHamir/no_cache_hits.py](https://gist.github.com/AlexsanderHamir/42c33d7a4dc7a57f56a78b560dee3a42)

---

## 신규 모델 / 업데이트된 모델 {#new-models--updated-models}

#### 신규 모델 지원 {#new-model-support}

| Provider | Model | 컨텍스트 윈도우 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5-pro` | 400K | $15.00 | $120.00 | Responses API, 추론, 비전, 함수 호출, 프롬프트 캐싱, 웹 검색 |
| OpenAI | `gpt-5-pro-2025-10-06` | 400K | $15.00 | $120.00 | Responses API, 추론, 비전, 함수 호출, 프롬프트 캐싱, 웹 검색 |
| OpenAI | `gpt-image-1-mini` | - | $2.00/img | - | 이미지 생성 및 편집 |
| OpenAI | `gpt-realtime-mini` | 128K | $0.60 | $2.40 | 실시간 오디오, 함수 호출 |
| Azure AI | `azure_ai/Phi-4-mini-reasoning` | 131K | $0.08 | $0.32 | 함수 호출 |
| Azure AI | `azure_ai/Phi-4-reasoning` | 32K | $0.125 | $0.50 | 함수 호출, 추론 |
| Azure AI | `azure_ai/MAI-DS-R1` | 128K | $1.35 | $5.40 | 추론, 함수 호출 |
| Bedrock | `au.anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.30 | $16.50 | 채팅, 추론, 비전, 함수 호출, 프롬프트 캐싱 |
| Bedrock | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.00 | $15.00 | 채팅, 추론, 비전, 함수 호출, 프롬프트 캐싱 |
| Bedrock | `global.anthropic.claude-sonnet-4-20250514-v1:0` | 1M | $3.00 | $15.00 | 채팅, 추론, 비전, 함수 호출, 프롬프트 캐싱 |
| Bedrock | `cohere.embed-v4:0` | 128K | $0.12 | - | 임베딩, 이미지 입력 지원 |
| OCI | `oci/cohere.command-latest` | 128K | $1.56 | $1.56 | 함수 호출 |
| OCI | `oci/cohere.command-a-03-2025` | 256K | $1.56 | $1.56 | 함수 호출 |
| OCI | `oci/cohere.command-plus-latest` | 128K | $1.56 | $1.56 | 함수 호출 |
| Together AI | `together_ai/moonshotai/Kimi-K2-Instruct-0905` | 262K | $1.00 | $3.00 | 함수 호출 |
| Together AI | `together_ai/Qwen/Qwen3-Next-80B-A3B-Instruct` | 262K | $0.15 | $1.50 | 함수 호출 |
| Together AI | `together_ai/Qwen/Qwen3-Next-80B-A3B-Thinking` | 262K | $0.15 | $1.50 | 함수 호출 |
| Vertex AI | MedGemma models | 다양함 | 다양함 | 다양함 | 커스텀 엔드포인트의 의료 특화 Gemma 모델 |
| Watson X | 신규 foundation model 27개 | 다양함 | 다양함 | 다양함 | Granite, Llama, Mistral 계열 |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - GPT-5 Pro 모델 설정과 문서를 추가했습니다 - [PR #15258](https://github.com/BerriAI/litellm/pull/15258)
    - GPT-5의 미지원 파라미터에 stop 파라미터를 추가했습니다 - [PR #15244](https://github.com/BerriAI/litellm/pull/15244)
    - gpt-image-1-mini를 출시 당일부터 지원하도록 추가했습니다 - [PR #15259](https://github.com/BerriAI/litellm/pull/15259)
    - gpt-realtime-mini 지원을 추가했습니다 - [PR #15283](https://github.com/BerriAI/litellm/pull/15283)
    - model costs에 gpt-5-pro-2025-10-06을 추가했습니다 - [PR #15344](https://github.com/BerriAI/litellm/pull/15344)
    - 최소 수정: temperature!=1로 호출한 gpt5 모델이 cooldown에 들어가지 않도록 했습니다 - [PR #15330](https://github.com/BerriAI/litellm/pull/15330)

- **[Snowflake Cortex](../../docs/providers/snowflake)**
    - Snowflake Cortex REST API에 함수 호출 지원을 추가했습니다 - [PR #15221](https://github.com/BerriAI/litellm/pull/15221)

- **[Gemini](../../docs/providers/gemini)**
    - proxy mode에서 Gemini/Vertex AI provider의 헤더 전달을 수정했습니다 - [PR #15231](https://github.com/BerriAI/litellm/pull/15231)

- **[Azure](../../docs/providers/azure)**
    - 지원되지 않는 azure 모델에서 stop param을 제거했습니다 - [PR #15229](https://github.com/BerriAI/litellm/pull/15229)
    - Fix(azure/responses): azure call에서 잘못된 status param을 제거했습니다 - [PR #15253](https://github.com/BerriAI/litellm/pull/15253)
    - 가격 세부 정보와 함께 새 Azure AI 모델을 추가했습니다 - [PR #15387](https://github.com/BerriAI/litellm/pull/15387)
    - AzureAD Default credentials - 환경에 따라 credential type을 선택합니다 - [PR #14470](https://github.com/BerriAI/litellm/pull/14470)

- **[Bedrock](../../docs/providers/bedrock)**
    - Global Cross-Region Inference를 추가했습니다 - [PR #15210](https://github.com/BerriAI/litellm/pull/15210)
    - AWS Bedrock에 Cohere Embed v4 지원을 추가했습니다 - [PR #15298](https://github.com/BerriAI/litellm/pull/15298)
    - Fix(bedrock): prompt_tokens 계산에 cacheWriteInputTokens를 포함했습니다 - [PR #15292](https://github.com/BerriAI/litellm/pull/15292)
    - Claude Sonnet 4.5용 Bedrock AU Cross-Region Inference를 추가했습니다 - [PR #15402](https://github.com/BerriAI/litellm/pull/15402)
    - Claude 모델에서 Converse → /v1/messages 스트리밍이 병렬 도구 호출을 처리하지 못하던 문제를 수정했습니다 - [PR #15315](https://github.com/BerriAI/litellm/pull/15315)

- **[Vertex AI](../../docs/providers/vertex)**
    - Vertex AI provider에 Context 캐싱을 구현했습니다 - [PR #15226](https://github.com/BerriAI/litellm/pull/15226)
    - Custom Endpoints의 Vertex AI Gemma 모델을 지원합니다 - [PR #15397](https://github.com/BerriAI/litellm/pull/15397)
    - VertexAI - gemma model family 지원(custom endpoints)을 추가했습니다 - [PR #15419](https://github.com/BerriAI/litellm/pull/15419)
    - VertexAI Gemma model family 스트리밍 지원과 MedGemma를 추가했습니다 - [PR #15427](https://github.com/BerriAI/litellm/pull/15427)

- **[OCI](../../docs/providers/oci)**
    - tool calling 및 스트리밍 기능과 함께 OCI Cohere 지원을 추가했습니다 - [PR #15365](https://github.com/BerriAI/litellm/pull/15365)

- **[Watson X](../../docs/providers/watsonx)**
    - Watson X foundation model 정의를 model_prices_and_context_window.json에 추가했습니다 - [PR #15219](https://github.com/BerriAI/litellm/pull/15219)
    - Watsonx - openai/gpt-oss model family에 올바른 prompt template을 적용했습니다 - [PR #15341](https://github.com/BerriAI/litellm/pull/15341)

- **[OpenRouter](../../docs/providers/openrouter)**
    - Fix - (openrouter): claude/gemini에서 cache_control을 content block으로 이동했습니다 - [PR #15345](https://github.com/BerriAI/litellm/pull/15345)
    - Fix - OpenRouter cache_control이 마지막 content block에만 적용되도록 했습니다 - [PR #15395](https://github.com/BerriAI/litellm/pull/15395)

- **[Together AI](../../docs/providers/togetherai)**
    - 새 together 모델을 추가했습니다 - [PR #15383](https://github.com/BerriAI/litellm/pull/15383)

### 버그 수정 {#bug-fixes}

- **General**
    - 버그 수정: gpt-5-chat-latest의 max_input_tokens 값이 잘못된 문제를 수정했습니다 - [PR #15116](https://github.com/BerriAI/litellm/pull/15116)
    - reasoning response ID를 수정했습니다 - [PR #15265](https://github.com/BerriAI/litellm/pull/15265)
    - assistant messages 파싱 문제를 수정했습니다 - [PR #15320](https://github.com/BerriAI/litellm/pull/15320)
    - litellm_param 기반 비용 계산을 수정했습니다 - [PR #15336](https://github.com/BerriAI/litellm/pull/15336)
    - lint 오류를 수정했습니다 - [PR #15406](https://github.com/BerriAI/litellm/pull/15406)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - response api 스트리밍 이미지 생성에 스트리밍 지원을 추가했습니다 - [PR #15269](https://github.com/BerriAI/litellm/pull/15269)
    - litellm_proxy provider에 네이티브 Responses API 지원을 추가했습니다 - [PR #15347](https://github.com/BerriAI/litellm/pull/15347)
    - 커스텀 백엔드(예: vLLM)를 지원하도록 ResponsesAPIResponse 파싱을 일시적으로 완화했습니다 - [PR #15362](https://github.com/BerriAI/litellm/pull/15362)

- **[Files API](../../docs/files_api)**
    - Feat(files): file operations에 @client decorator를 추가했습니다 - [PR #15339](https://github.com/BerriAI/litellm/pull/15339)

- **[/generateContent](../../docs/providers/gemini)**
    - 실제로 응답을 스트리밍하도록 gemini cli를 수정했습니다 - [PR #15264](https://github.com/BerriAI/litellm/pull/15264)

- **[Azure Passthrough](../../docs/pass_through/azure)**
    - Azure - router models와 함께 passthrough를 지원합니다 - [PR #15240](https://github.com/BerriAI/litellm/pull/15240)

#### 버그 {#bugs}

- **General**
    - cache hit 시 x-litellm-cache-key 헤더가 반환되지 않는 문제를 수정했습니다 - [PR #15348](https://github.com/BerriAI/litellm/pull/15348)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **Proxy CLI 인증**
    - Proxy CLI - 기존 키를 URL에 저장하지 않고 state param에 저장합니다 - [PR #15290](https://github.com/BerriAI/litellm/pull/15290)

- **모델 + Endpoints**
    - PATCH `/model/{model_id}/update`가 POST `/model/new`와 일관되게 `team_id`를 처리하도록 했습니다 - [PR #15297](https://github.com/BerriAI/litellm/pull/15297)
    - 기능: UI에 Infinity를 provider로 추가했습니다 - [PR #15285](https://github.com/BerriAI/litellm/pull/15285)
    - 수정: 설정 파일에 router_settings.model_group_alias가 있을 때 model + endpoints 페이지가 크래시 나는 문제를 수정했습니다 - [PR #15308](https://github.com/BerriAI/litellm/pull/15308)
    - 모델 & Endpoints 초기 리팩터링 - [PR #15435](https://github.com/BerriAI/litellm/pull/15435)
    - Litellm UI API Reference 페이지를 업데이트했습니다 - [PR #15438](https://github.com/BerriAI/litellm/pull/15438)

- **Teams**
    - Teams 페이지: teams 테이블에 새 "Your Role" 열을 추가했습니다 - [PR #15384](https://github.com/BerriAI/litellm/pull/15384)
    - LiteLLM Dashboard Teams UI를 리팩터링했습니다 - [PR #15418](https://github.com/BerriAI/litellm/pull/15418)

- **UI 인프라**
    - frontend 자동 포매팅을 위해 prettier를 추가했습니다 - [PR #15215](https://github.com/BerriAI/litellm/pull/15215)
    - 개발 중 더 빠르게 빌드하도록 UI의 npm run dev 명령에 turbopack을 추가했습니다 - [PR #15250](https://github.com/BerriAI/litellm/pull/15250)
    - (perf) 수정: 비대한 key list 호출을 더 가벼운 key aliases endpoint로 교체했습니다 - [PR #15252](https://github.com/BerriAI/litellm/pull/15252)
    - 만료된 쿠키로 인한 UI spasm 문제를 완화할 수 있는 수정입니다 - [PR #15309](https://github.com/BerriAI/litellm/pull/15309)
    - LiteLLM UI 리팩터링 인프라를 정리했습니다 - [PR #15236](https://github.com/BerriAI/litellm/pull/15236)
    - UI에서 사용하지 않는 imports 제거를 강제합니다 - [PR #15416](https://github.com/BerriAI/litellm/pull/15416)
    - 수정: usage 페이지 >> Model Activity >> spend per day 그래프에서 큰 spend 값의 y-axis가 잘리는 문제를 수정했습니다 - [PR #15389](https://github.com/BerriAI/litellm/pull/15389)
    - guardrail provider 로고를 업데이트했습니다 - [PR #15421](https://github.com/BerriAI/litellm/pull/15421)

- **관리자 설정**
    - 수정: 성공 메시지가 표시되어도 Router settings가 업데이트되지 않는 문제를 수정했습니다 - [PR #15249](https://github.com/BerriAI/litellm/pull/15249)
    - 수정: DB 값이 비어 있을 때 DB가 config file 값을 실수로 덮어쓰지 않도록 했습니다 - [PR #15340](https://github.com/BerriAI/litellm/pull/15340)

- **SSO**
    - SSO - EntraID app roles를 지원합니다 - [PR #15351](https://github.com/BerriAI/litellm/pull/15351)

---

## 로깅 / 가드레일 / 프롬프트 관리 통합 {#logging--guardrail--prompt-management-integrations}

#### 기능 {#features-3}

- **[PostHog](../../docs/observability/posthog)**
    - Feat: 요청별 posthog api key를 추가했습니다 - [PR #15379](https://github.com/BerriAI/litellm/pull/15379)

#### 가드레일

- **[EnkryptAI](../../docs/proxy/guardrails)**
    - LiteLLM에 EnkryptAI 가드레일을 추가했습니다 - [PR #15390](https://github.com/BerriAI/litellm/pull/15390)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

- **태그 관리**
    - Tag Management - 태그 기반 예산 설정 지원을 추가했습니다 - [PR #15433](https://github.com/BerriAI/litellm/pull/15433)

- **Dynamic Rate Limiter v3 개선**
    - QA/Fixes - Dynamic Rate Limiter v3 - 최종 QA - [PR #15311](https://github.com/BerriAI/litellm/pull/15311)
    - Dynamic Rate limiter v3 수정 - litellm_model_saturation 삽입 - [PR #15394](https://github.com/BerriAI/litellm/pull/15394)

- **Shared Health Check 상태**
    - Pod 간 Shared Health Check State를 구현했습니다 - [PR #15380](https://github.com/BerriAI/litellm/pull/15380)

---

## MCP Gateway

- **도구 제어**
    - MCP Gateway - UI - Key, Teams에 허용된 도구를 선택할 수 있습니다 - [PR #15241](https://github.com/BerriAI/litellm/pull/15241)
    - MCP Gateway - Backend - 팀/키별 허용 도구 저장을 지원합니다 - [PR #15243](https://github.com/BerriAI/litellm/pull/15243)
    - MCP Gateway - 세분화된 Database Object Storage 제어를 추가했습니다 - [PR #15255](https://github.com/BerriAI/litellm/pull/15255)
    - MCP Gateway - Litellm mcp 팀 제어 수정 - [PR #15304](https://github.com/BerriAI/litellm/pull/15304)
    - MCP Gateway - QA/Fixes - Team/Key 수준 적용이 MCP에서 동작하는지 보장했습니다 - [PR #15305](https://github.com/BerriAI/litellm/pull/15305)
    - 기능: /v1/mcp/server/health endpoint 응답에 server_name을 포함했습니다 - [PR #15431](https://github.com/BerriAI/litellm/pull/15431)

- **OpenAPI 통합**
    - MCP - OpenAPI specs를 MCP servers로 변환하는 기능을 지원합니다 - [PR #15343](https://github.com/BerriAI/litellm/pull/15343)
    - MCP - 도구별 allowed params 지정을 지원합니다 - [PR #15346](https://github.com/BerriAI/litellm/pull/15346)

- **설정**
    - MCP - CA_BUNDLE_PATH 설정을 지원합니다 - [PR #15253](https://github.com/BerriAI/litellm/pull/15253)
    - 수정: 도구 호출 중 MCP client가 열린 상태를 유지하도록 보장했습니다 - [PR #15391](https://github.com/BerriAI/litellm/pull/15391)
    - migration.sql의 하드코딩된 "public" schema를 제거했습니다 - [PR #15363](https://github.com/BerriAI/litellm/pull/15363)

---

## 성능 / 부하 분산 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

- **Router 최적화**
    - Fix - Router: O(1) deployment 조회를 위해 model_name index를 추가했습니다 - [PR #15113](https://github.com/BerriAI/litellm/pull/15113)
    - Refactor Utils: client에서 내부 함수를 추출했습니다 - [PR #15234](https://github.com/BerriAI/litellm/pull/15234)
    - Fix Networking: 제한 사항을 제거했습니다 - [PR #15302](https://github.com/BerriAI/litellm/pull/15302)

- **세션 관리**
    - Fix - Sessions가 공유되지 않던 문제를 수정했습니다 - [PR #15388](https://github.com/BerriAI/litellm/pull/15388)
    - Fix: hot path에서 panic을 제거했습니다 - [PR #15396](https://github.com/BerriAI/litellm/pull/15396)
    - Fix - shared session 파싱 및 사용 문제를 수정했습니다 - [PR #15440](https://github.com/BerriAI/litellm/pull/15440)
    - Fix: 닫힌 aiohttp sessions를 처리합니다 - [PR #15442](https://github.com/BerriAI/litellm/pull/15442)
    - Fix: aiohttp sessions를 재생성할 때 session leak을 방지합니다 - [PR #15443](https://github.com/BerriAI/litellm/pull/15443)

- **SSL/TLS 성능**
    - Perf: 우선순위가 지정된 cipher로 SSL/TLS handshake 성능을 최적화했습니다 - [PR #15398](https://github.com/BerriAI/litellm/pull/15398)

- **의존성**
    - tenacity 버전을 8.5.0으로 업그레이드했습니다 - [PR #15303](https://github.com/BerriAI/litellm/pull/15303)

- **데이터 마스킹**
    - Fix - SensitiveDataMasker가 list를 string으로 변환하던 문제를 수정했습니다 - [PR #15420](https://github.com/BerriAI/litellm/pull/15420)

---


## 일반 AI Gateway 개선 {#general-ai-gateway-improvements}

#### 보안 {#security}

- **일반**
    - Fix: redact_user_api_key_info가 활성화된 경우 AWS credentials를 redact 처리합니다 - [PR #15321](https://github.com/BerriAI/litellm/pull/15321)

---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - 문서 업데이트: 성능 업데이트 - [PR #15211](https://github.com/BerriAI/litellm/pull/15211)
    - W&B Inference 문서를 추가했습니다 - [PR #15278](https://github.com/BerriAI/litellm/pull/15278)

- **배포**
    - `config.yaml` 기반 시작 실패를 유발하던 docker-compose의 잘못된 주석을 삭제했습니다 - [PR #15425](https://github.com/BerriAI/litellm/pull/15425)

---

## 신규 기여자 {#new-contributors}

* @Gal-bloch 님이 [PR #15219](https://github.com/BerriAI/litellm/pull/15219)에서 첫 기여를 했습니다.
* @lcfyi 님이 [PR #15315](https://github.com/BerriAI/litellm/pull/15315)에서 첫 기여를 했습니다.
* @ashengstd 님이 [PR #15362](https://github.com/BerriAI/litellm/pull/15362)에서 첫 기여를 했습니다.
* @vkolehmainen 님이 [PR #15363](https://github.com/BerriAI/litellm/pull/15363)에서 첫 기여를 했습니다.
* @jlan-nl 님이 [PR #15330](https://github.com/BerriAI/litellm/pull/15330)에서 첫 기여를 했습니다.
* @BCook98 님이 [PR #15402](https://github.com/BerriAI/litellm/pull/15402)에서 첫 기여를 했습니다.
* @PabloGmz96 님이 [PR #15425](https://github.com/BerriAI/litellm/pull/15425)에서 첫 기여를 했습니다.

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.77.7.rc.1...v1.78.0.rc.1)** {#full-changelog}
