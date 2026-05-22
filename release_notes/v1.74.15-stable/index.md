---
title: "v1.74.15-stable"
slug: "v1-74-15"
date: 2025-08-02T10:00:00
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

## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.74.15-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.74.15.post2
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **User Agent Activity Tracking** - 각 코딩 도구가 얼마나 사용되는지 추적합니다.
- **Prompt Management** - prompt template을 사용해 Git-Ops 방식으로 prompt를 관리합니다.
- **MCP Gateway: 가드레일** - MCP server에서 가드레일을 사용할 수 있도록 지원합니다.
- **Google AI Studio Imagen4** - Google AI Studio에서 Imagen4 model을 사용할 수 있도록 지원합니다.

---

## User Agent 활동 추적 {#user-agent-activity-tracking}

<Image 
  img={require('../../img/agent_1.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

이번 릴리스에서는 LiteLLM을 통해 Claude Code, Roo Code, Gemini CLI 같은 AI 기반 코딩 도구의 사용량과 비용을 추적할 수 있습니다. 이제 각 코딩 도구별 LLM 비용, 전체 token 사용량, DAU/WAU/MAU를 추적할 수 있습니다.

개발자 생산성 향상에 어떤 도움을 주고 있는지 추적하려는 중앙 AI Platform 팀에 유용합니다. 

[더 읽기](https://docs.litellm.ai/docs/tutorials/cost_tracking_coding)

---

## Prompt Management {#prompt-management}

<br/>



[더 읽기](../../docs/proxy/prompt_management)

---

## 신규 모델 / 업데이트된 모델 {#new--updated-models}

#### 신규 모델 지원 {#new-model-support}

| Provider    | Model                                  | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 이미지당 비용 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | -------------- |
| OpenRouter | `openrouter/x-ai/grok-4` | 256k | $3 | $15 | N/A |
| Google AI Studio | `gemini/imagen-4.0-generate-001` | N/A | N/A | N/A | $0.04 |
| Google AI Studio | `gemini/imagen-4.0-ultra-generate-001` | N/A | N/A | N/A | $0.06 |
| Google AI Studio | `gemini/imagen-4.0-fast-generate-001` | N/A | N/A | N/A | $0.02 |
| Google AI Studio | `gemini/imagen-3.0-generate-002` | N/A | N/A | N/A | $0.04 |
| Google AI Studio | `gemini/imagen-3.0-generate-001` | N/A | N/A | N/A | $0.04 |
| Google AI Studio | `gemini/imagen-3.0-fast-generate-001` | N/A | N/A | N/A | $0.02 |

#### 기능 {#features}

- **[Google AI Studio](../../docs/providers/gemini)**
    - Google AI Studio Imagen4 model family 지원 추가 - [PR #13065](https://github.com/BerriAI/litellm/pull/13065), [시작하기](../../docs/providers/google_ai_studio/image_gen)
- **[Azure OpenAI](../../docs/providers/azure/azure)**
    - Azure `api_version="preview"` 지원 - [PR #13072](https://github.com/BerriAI/litellm/pull/13072), [시작하기](../../docs/providers/azure/azure#setting-api-version)
    - 암호로 보호된 인증서 파일 지원 - [PR #12995](https://github.com/BerriAI/litellm/pull/12995), [시작하기](../../docs/providers/azure/azure#authentication)
- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Anthropic `/v1/messages`를 통한 비용 추적 - [PR #13072](https://github.com/BerriAI/litellm/pull/13072)
    - Computer use 지원 - [PR #13150](https://github.com/BerriAI/litellm/pull/13150)
- **[OpenRouter](../../docs/providers/openrouter)**
    - Grok4 model 지원 추가 - [PR #13018](https://github.com/BerriAI/litellm/pull/13018)
- **[Anthropic](../../docs/providers/anthropic)**
    - Auto Cache Control Injection - 음수 index 지원으로 cache_control_injection_points 개선 - [PR #13187](https://github.com/BerriAI/litellm/pull/13187), [시작하기](../../docs/tutorials/prompt_caching)
    - token 사용량 추적과 함께 동작하는 mid-stream fallback - [PR #13149](https://github.com/BerriAI/litellm/pull/13149), [PR #13170](https://github.com/BerriAI/litellm/pull/13170)
- **[Perplexity](../../docs/providers/perplexity)**
    - Citation annotation 지원 - [PR #13225](https://github.com/BerriAI/litellm/pull/13225)

#### 버그 수정 {#bugs}

- **[Gemini](../../docs/providers/gemini)**
    - merge_reasoning_content_in_choices parameter 문제 수정 - [PR #13066](https://github.com/BerriAI/litellm/pull/13066), [시작하기](../../docs/tutorials/openweb_ui#render-thinking-content-on-open-webui)
    - Google AI Studio에서 `GOOGLE_API_KEY` environment variable 사용 지원 추가 - [PR #12507](https://github.com/BerriAI/litellm/pull/12507)
- **[vLLM/OpenAI-like](../../docs/providers/vllm)**
    - embedding에서 누락된 extra_headers 지원 수정 - [PR #13198](https://github.com/BerriAI/litellm/pull/13198)

---

## LLM API Endpoint {#llm-api-endpoints}

#### 버그 수정 {#bugs-1}

- **[/generateContent](../../docs/generateContent)**
    - API Key 설정을 위한 generateContent route의 query_params 지원 - [PR #13100](https://github.com/BerriAI/litellm/pull/13100)
    - LiteLLM에서 /generateContent 사용 시 google ai studio 인증에 "x-goog-api-key"가 사용되도록 보장 - [PR #13098](https://github.com/BerriAI/litellm/pull/13098)
    - generateContent에서 tool calling이 예상대로 동작하도록 보장 - [PR #13189](https://github.com/BerriAI/litellm/pull/13189)
- **[/vertex_ai (Passthrough)](../../docs/pass_through/vertex_ai)**
    - multimodal embedding response가 올바르게 기록되도록 보장 - [PR #13050](https://github.com/BerriAI/litellm/pull/13050)

---

## [MCP Gateway](../../docs/mcp)

#### 기능 {#features-1}

- **Health Check 개선**
    - MCP server용 health check endpoint 추가 - [PR #13106](https://github.com/BerriAI/litellm/pull/13106)
- **가드레일 Integration**
    - pre 및 during call hook 초기화 추가 - [PR #13067](https://github.com/BerriAI/litellm/pull/13067)
    - pre 및 during hook을 ProxyLogging으로 이동 - [PR #13109](https://github.com/BerriAI/litellm/pull/13109)
    - MCP pre 및 during guardrail 구현 - [PR #13188](https://github.com/BerriAI/litellm/pull/13188)
- **Protocol 및 Header 지원**
    - protocol header 지원 추가 - [PR #13062](https://github.com/BerriAI/litellm/pull/13062)
- **URL 및 Namespacing**
    - internal/Kubernetes URL에 대한 MCP server URL validation 개선 - [PR #13099](https://github.com/BerriAI/litellm/pull/13099)


#### 버그 수정 {#bugs-2}

- **UI**
    - MCP tool의 scrolling 문제 수정 - [PR #13015](https://github.com/BerriAI/litellm/pull/13015)
    - MCP client list 실패 수정 - [PR #13114](https://github.com/BerriAI/litellm/pull/13114)


[더 읽기](../../docs/mcp)


---

## 관리 Endpoint / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **사용법 Analytics**
    - user agent activity tracking용 새 tab 추가 - [PR #13146](https://github.com/BerriAI/litellm/pull/13146)
    - 사용자별 일별 usage analytics - [PR #13147](https://github.com/BerriAI/litellm/pull/13147)
    - 기본 usage chart 날짜 범위를 최근 7일로 설정 - [PR #12917](https://github.com/BerriAI/litellm/pull/12917)
    - 새로운 advanced date range picker component - [PR #13141](https://github.com/BerriAI/litellm/pull/13141), [PR #13221](https://github.com/BerriAI/litellm/pull/13221)
    - 날짜 선택 후 usage cost chart에 loader 표시 - [PR #13113](https://github.com/BerriAI/litellm/pull/13113)
- **모델**
    - UI에 Voyage, Jinai, Deepinfra, VolcEngine provider 추가 - [PR #13131](https://github.com/BerriAI/litellm/pull/13131)
    - UI에 Sagemaker 추가 - [PR #13117](https://github.com/BerriAI/litellm/pull/13117)
    - `/v1/models` 및 `/model_group/info` endpoint에서 model 순서 보존 - [PR #13178](https://github.com/BerriAI/litellm/pull/13178)

- **Key Management**
    - UI에서 key 생성을 위한 JSON option을 올바르게 parse - [PR #12989](https://github.com/BerriAI/litellm/pull/12989)
- **인증**
    - **JWT Fields**  
        - 모든 JWT field에 dot notation 지원 추가 - [PR #13013](https://github.com/BerriAI/litellm/pull/13013)

#### 버그 수정 {#bugs-3}

- **Permission**
    - organization의 object permission 수정 - [PR #13142](https://github.com/BerriAI/litellm/pull/13142)
    - list team v2 security check 수정 - [PR #13094](https://github.com/BerriAI/litellm/pull/13094)
- **모델**
    - model update 시 model reload 문제 수정 - [PR #13216](https://github.com/BerriAI/litellm/pull/13216)
- **Router Settings**
    - UI에서 fallback용 model 표시 문제 수정 - [PR #13191](https://github.com/BerriAI/litellm/pull/13191)
    - custom value가 있는 wildcard model name 처리 수정 - [PR #13116](https://github.com/BerriAI/litellm/pull/13116)
    - fallback 삭제 기능 수정 - [PR #12606](https://github.com/BerriAI/litellm/pull/12606)

---

## Logging / Guardrail 통합 {#logging--guardrail-integrations}

#### 기능 {#features-3}

- **[MLFlow](../../docs/proxy/logging#mlflow)**
    - MLFlow logging request에 tag를 추가할 수 있도록 허용 - [PR #13108](https://github.com/BerriAI/litellm/pull/13108)
- **[Langfuse OTEL](../../docs/proxy/logging#langfuse)**
    - Langfuse OpenTelemetry integration에 포괄적인 metadata 지원 추가 - [PR #12956](https://github.com/BerriAI/litellm/pull/12956)
- **[Datadog LLM 관측성](../../docs/proxy/logging#datadog)**
    - 특정 logging integration에서 message/response content를 redact할 수 있도록 허용 - [PR #13158](https://github.com/BerriAI/litellm/pull/13158)

#### 버그 수정 {#bugs-4}

- **API Key Logging**
    - API Key가 부적절하게 logging되는 문제 수정 - [PR #12978](https://github.com/BerriAI/litellm/pull/12978)
- **MCP 비용 추적**
    - spend table에서 MCP namespace tool name의 기본값 설정 - [PR #12894](https://github.com/BerriAI/litellm/pull/12894)

---

## Performance / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

#### 기능 {#features-4}

- **Background 상태 확인**
    - 특정 deployment에서 background health check를 비활성화할 수 있도록 허용 - [PR #13186](https://github.com/BerriAI/litellm/pull/13186)
- **Database Connection 관리**
    - 오래된 Prisma client가 DB connection을 올바르게 disconnect하도록 보장 - [PR #13140](https://github.com/BerriAI/litellm/pull/13140)
- **Jitter 개선**
    - jitter 계산 수정(곱하는 것이 아니라 더해야 함) - [PR #12901](https://github.com/BerriAI/litellm/pull/12901)

#### 버그 수정 {#bugs-5}

- **Anthropic 스트리밍**
    - Anthropic streaming response에 항상 choice index=0 사용 - [PR #12666](https://github.com/BerriAI/litellm/pull/12666)
- **Custom Auth**
    - custom exception이 올바르게 bubble up되도록 수정 - [PR #13093](https://github.com/BerriAI/litellm/pull/13093)
- **OTEL과 Managed File**
    - OTEL integration에서 managed file 사용 문제 수정 - [PR #13171](https://github.com/BerriAI/litellm/pull/13171)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

#### 기능 {#features-5}

- **Database Migration**
    - 기본값을 use_prisma_migrate 사용으로 변경 - [PR #13117](https://github.com/BerriAI/litellm/pull/13117)
    - auth check에서 team-only model resolve - [PR #13117](https://github.com/BerriAI/litellm/pull/13117)
- **Infrastructure**
    - MCP Python version 제한 완화 - [PR #13102](https://github.com/BerriAI/litellm/pull/13102)
    - build_and_test를 CI/CD Postgres DB로 migration - [PR #13166](https://github.com/BerriAI/litellm/pull/13166)
- **Helm Charts**
    - migration job에 Helm hook 허용 - [PR #13174](https://github.com/BerriAI/litellm/pull/13174)
    - Helm migration job schema update 수정 - [PR #12809](https://github.com/BerriAI/litellm/pull/12809)

#### 버그 수정 {#bugs-6}

- **Docker**
    - docker-compose에서 오래된 `version` attribute 제거 - [PR #13172](https://github.com/BerriAI/litellm/pull/13172)
    - non-root Dockerfile의 runtime stage에 openssl 추가 - [PR #13168](https://github.com/BerriAI/litellm/pull/13168)
- **Database 설정**
    - environment variable을 통한 DB config 수정 - [PR #13111](https://github.com/BerriAI/litellm/pull/13111)
- **Logging**
    - httpx logging 억제 - [PR #13217](https://github.com/BerriAI/litellm/pull/13217)
- **Token Counting**
    - token counter에서 prefix 같은 미지원 key 무시 - [PR #11954](https://github.com/BerriAI/litellm/pull/11954)
---

## 신규 기여자 {#new-contributors}
* @5731la가 https://github.com/BerriAI/litellm/pull/12989 에서 첫 기여를 했습니다.
* @restato가 https://github.com/BerriAI/litellm/pull/12980 에서 첫 기여를 했습니다.
* @strickvl이 https://github.com/BerriAI/litellm/pull/12956 에서 첫 기여를 했습니다.
* @Ne0-1이 https://github.com/BerriAI/litellm/pull/12995 에서 첫 기여를 했습니다.
* @maxrabin이 https://github.com/BerriAI/litellm/pull/13079 에서 첫 기여를 했습니다.
* @lvuna가 https://github.com/BerriAI/litellm/pull/12894 에서 첫 기여를 했습니다.
* @Maximgitman이 https://github.com/BerriAI/litellm/pull/12666 에서 첫 기여를 했습니다.
* @pathikrit이 https://github.com/BerriAI/litellm/pull/12901 에서 첫 기여를 했습니다.
* @huetterma가 https://github.com/BerriAI/litellm/pull/12809 에서 첫 기여를 했습니다.
* @betterthanbreakfast가 https://github.com/BerriAI/litellm/pull/13029 에서 첫 기여를 했습니다.
* @phosae가 https://github.com/BerriAI/litellm/pull/12606 에서 첫 기여를 했습니다.
* @sahusiddharth가 https://github.com/BerriAI/litellm/pull/12507 에서 첫 기여를 했습니다.
* @Amit-kr26이 https://github.com/BerriAI/litellm/pull/11954 에서 첫 기여를 했습니다.
* @kowyo가 https://github.com/BerriAI/litellm/pull/13172 에서 첫 기여를 했습니다.
* @AnandKhinvasara가 https://github.com/BerriAI/litellm/pull/13187 에서 첫 기여를 했습니다.
* @unique-jakub이 https://github.com/BerriAI/litellm/pull/13174 에서 첫 기여를 했습니다.
* @tyumentsev4가 https://github.com/BerriAI/litellm/pull/13134 에서 첫 기여를 했습니다.
* @aayush-malviya-acquia가 https://github.com/BerriAI/litellm/pull/12978 에서 첫 기여를 했습니다.
* @kankute-sameer가 https://github.com/BerriAI/litellm/pull/13225 에서 첫 기여를 했습니다.
* @AlexanderYastrebov가 https://github.com/BerriAI/litellm/pull/13178 에서 첫 기여를 했습니다.

## **[Full 변경 이력](https://github.com/BerriAI/litellm/compare/v1.74.9-stable...v1.74.15.rc)**
