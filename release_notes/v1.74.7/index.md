---
title: "v1.74.7-stable"
slug: "v1-74-7"
date: 2025-07-19T10:00:00
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

## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.74.7-stable.patch.1
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.74.7.post2
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}


- **Vector Stores** - Vertex RAG Engine, PG Vector, OpenAI 및 Azure OpenAI Vector Stores를 지원합니다.
- **사용자 일괄 편집** - UI에서 사용자를 일괄 편집할 수 있습니다.
- **Health Check 개선** - 트래픽이 많은 동안 불필요한 pod 재시작을 방지합니다.
- **새 LLM Providers** - Moonshot AI 및 Vercel v0 provider 지원을 추가했습니다.

---

## Vector Stores API {#vector-stores-api}

<Image img={require('../../img/release_notes/vector_stores.png')} />


이번 릴리스에서는 LiteLLM에서 VertexAI RAG Engine, PG Vector, Bedrock Knowledge Bases, OpenAI Vector Stores를 사용할 수 있도록 지원합니다.

LLM과 함께 외부 지식 소스가 필요한 사용 사례에 적합합니다.

LiteLLM 사용자에게 다음과 같은 이점을 제공합니다.

**Proxy 관리자 이점:**
- 세분화된 액세스 제어: 특정 Vector Stores에 액세스할 수 있는 Keys와 Teams를 지정할 수 있습니다.
- 모든 vector store 작업 전반에 대한 완전한 사용량 추적 및 모니터링

**개발자 이점:**
- vector store를 쿼리하고 LLM API 요청과 함께 사용할 수 있는 간단하고 통합된 인터페이스
- 지원되는 모든 vector store provider에서 일관된 API 경험 제공



[시작하기](../../docs/completion/knowledgebase)


---

## 사용자 일괄 편집 {#bulk-editing-users}

<Image img={require('../../img/bulk_edit_graphic.png')} />

v1.74.7-stable에서는 UI에 사용자 일괄 편집 기능이 도입되었습니다. 다음과 같은 경우에 유용합니다.
- 모든 기존 사용자를 기본 팀에 부여합니다. 팀별 액세스 제어 및 비용 추적에 유용합니다.
- 기존 사용자의 개인 모델 액세스를 제어합니다.

[자세히 보기](https://docs.litellm.ai/docs/proxy/ui/bulk_edit_users)

---

## Health Check 서버 {#health-check-server}

<Image alt="Separate Health App 아키텍처" img={require('../../img/separate_health_app_architecture.png')} style={{ borderRadius: '8px', marginBottom: '1em', maxWidth: '100%' }} />

이번 릴리스에는 트래픽이 많은 동안 불필요한 pod 재시작을 방지하는 안정성 개선 사항이 포함되어 있습니다. 이전에는 기본 LiteLLM 앱이 트래픽을 처리하느라 바쁠 때 pod가 정상이어도 health endpoints가 timeout될 수 있었습니다. 
 
이번 릴리스부터는 전용 포트가 있는 격리된 프로세스에서 health endpoints를 실행할 수 있습니다. 이를 통해 기본 LiteLLM 앱에 부하가 큰 경우에도 liveness 및 readiness probes가 계속 응답할 수 있습니다.

[자세히 보기](https://docs.litellm.ai/docs/proxy/prod#10-use-a-separate-health-check-app)


---

## 새 모델 / 업데이트된 모델 {#new--updated-models}

#### 가격 / 컨텍스트 창 업데이트 {#pricing--context-window-updates}

| 공급자    | 모델                                  | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- |
| Azure AI | `azure_ai/grok-3` | 131k | $3.30 | $16.50 |
| Azure AI | `azure_ai/global/grok-3` | 131k | $3.00 | $15.00 |
| Azure AI | `azure_ai/global/grok-3-mini` | 131k | $0.25 | $1.27 |
| Azure AI | `azure_ai/grok-3-mini` | 131k | $0.275 | $1.38 |
| Azure AI | `azure_ai/jais-30b-chat` | 8k | $3200 | $9710 |
| Groq | `groq/moonshotai-kimi-k2-instruct` | 131k | $1.00 | $3.00 |
| AI21 | `jamba-large-1.7` | 256k | $2.00 | $8.00 |
| AI21 | `jamba-mini-1.7` | 256k | $0.20 | $0.40 |
| Together.ai | `together_ai/moonshotai/Kimi-K2-Instruct` | 131k | $1.00 | $3.00 |
| v0 | `v0/v0-1.0-md` | 128k | $3.00 | $15.00 |
| v0 | `v0/v0-1.5-md` | 128k | $3.00 | $15.00 |
| v0 | `v0/v0-1.5-lg` | 512k | $15.00 | $75.00 |
| Moonshot | `moonshot/moonshot-v1-8k` | 8k | $0.20 | $2.00 |
| Moonshot | `moonshot/moonshot-v1-32k` | 32k | $1.00 | $3.00 |
| Moonshot | `moonshot/moonshot-v1-128k` | 131k | $2.00 | $5.00 |
| Moonshot | `moonshot/moonshot-v1-auto` | 131k | $2.00 | $5.00 |
| Moonshot | `moonshot/kimi-k2-0711-preview` | 131k | $0.60 | $2.50 |
| Moonshot | `moonshot/moonshot-v1-32k-0430` | 32k | $1.00 | $3.00 |
| Moonshot | `moonshot/moonshot-v1-128k-0430` | 131k | $2.00 | $5.00 |
| Moonshot | `moonshot/moonshot-v1-8k-0430` | 8k | $0.20 | $2.00 |
| Moonshot | `moonshot/kimi-latest` | 131k | $2.00 | $5.00 |
| Moonshot | `moonshot/kimi-latest-8k` | 8k | $0.20 | $2.00 |
| Moonshot | `moonshot/kimi-latest-32k` | 32k | $1.00 | $3.00 |
| Moonshot | `moonshot/kimi-latest-128k` | 131k | $2.00 | $5.00 |
| Moonshot | `moonshot/kimi-thinking-preview` | 131k | $30.00 | $30.00 |
| Moonshot | `moonshot/moonshot-v1-8k-vision-preview` | 8k | $0.20 | $2.00 |
| Moonshot | `moonshot/moonshot-v1-32k-vision-preview` | 32k | $1.00 | $3.00 |
| Moonshot | `moonshot/moonshot-v1-128k-vision-preview` | 131k | $2.00 | $5.00 |


#### 기능 {#features}

- **[🆕 Moonshot API (Kimi)](../../docs/providers/moonshot)**
    - Kimi 모델에 액세스하기 위한 새 LLM API 통합 - [PR #12592](https://github.com/BerriAI/litellm/pull/12592), [시작하기](../../docs/providers/moonshot)
- **[🆕 v0 Provider](../../docs/providers/v0)**
    - v0.dev를 위한 새 provider 통합 - [PR #12751](https://github.com/BerriAI/litellm/pull/12751), [시작하기](../../docs/providers/v0)
- **[OpenAI](../../docs/providers/openai)**
    - `litellm.completion` (`/chat/completions`)에서 OpenAI DeepResearch 모델 사용 - [PR #12627](https://github.com/BerriAI/litellm/pull/12627) **DOC NEEDED**
- **[Azure OpenAI](../../docs/providers/azure_openai)**
    - `litellm.completion` (`/chat/completions`)에서 Azure OpenAI DeepResearch 모델 사용 - [PR #12627](https://github.com/BerriAI/litellm/pull/12627) **DOC NEEDED**
    - openai gpt-4.1 모델에 `response_format` 지원 추가 - [PR #12745](https://github.com/BerriAI/litellm/pull/12745)
- **[Anthropic](../../docs/providers/anthropic)**
    - Tool cache control 지원 - [PR #12668](https://github.com/BerriAI/litellm/pull/12668)
- **[Bedrock](../../docs/providers/bedrock)**
    - Claude 4 /invoke route 지원 - [PR #12599](https://github.com/BerriAI/litellm/pull/12599), [시작하기](../../docs/providers/bedrock)
    - Application inference profile tool choice 지원 - [PR #12599](https://github.com/BerriAI/litellm/pull/12599)
- **[Gemini](../../docs/providers/gemini)**
    - context caching을 위한 Custom TTL 지원 - [PR #12541](https://github.com/BerriAI/litellm/pull/12541)
    - Gemini 2.x 모델의 implicit caching 비용 계산 수정 - [PR #12585](https://github.com/BerriAI/litellm/pull/12585)
- **[VertexAI](../../docs/providers/vertex)**
    - Vertex AI RAG Engine 지원 추가(OpenAI 호환 `/vector_stores` API와 함께 사용) - [PR #12752](https://github.com/BerriAI/litellm/pull/12595), [시작하기](../../docs/completion/knowledgebase)
- **[vLLM](../../docs/providers/vllm)**
    - vLLM에서 Rerank endpoints 사용 지원 추가 - [PR #12738](https://github.com/BerriAI/litellm/pull/12738), [시작하기](../../docs/providers/vllm#rerank)
- **[AI21](../../docs/providers/ai21)**
    - ai21/jamba-1.7 모델 제품군 가격 추가 - [PR #12593](https://github.com/BerriAI/litellm/pull/12593), [시작하기](../../docs/providers/ai21)
- **[Together.ai](../../docs/providers/together_ai)**
    - [새 모델] together_ai/moonshotai/Kimi-K2-Instruct 추가 - [PR #12645](https://github.com/BerriAI/litellm/pull/12645), [시작하기](../../docs/providers/together_ai)
- **[Groq](../../docs/providers/groq)**
    - groq/moonshotai-kimi-k2-instruct 모델 구성 추가 - [PR #12648](https://github.com/BerriAI/litellm/pull/12648), [시작하기](../../docs/providers/groq)
- **[Github Copilot](../../docs/providers/github_copilot)**
    - GH Copilot용 System prompts를 assistant prompts로 변경 - [PR #12742](https://github.com/BerriAI/litellm/pull/12742), [시작하기](../../docs/providers/github_copilot)


#### 버그 {#bugs}
- **[Anthropic](../../docs/providers/anthropic)**
    - streaming + response_format + tools 버그 수정 - [PR #12463](https://github.com/BerriAI/litellm/pull/12463)
- **[XAI](../../docs/providers/xai)**
    - grok-4는 `stop` param을 지원하지 않음 - [PR #12646](https://github.com/BerriAI/litellm/pull/12646)
- **[AWS](../../docs/providers/bedrock)**
    - AWS Bedrock용 web authentication에서 Role chaining 지원 - [PR #12607](https://github.com/BerriAI/litellm/pull/12607)
- **[VertexAI](../../docs/providers/vertex)**
    - cached credentials에 project_id 추가 - [PR #12661](https://github.com/BerriAI/litellm/pull/12661)
- **[Bedrock](../../docs/providers/bedrock)**
    - bedrock nova micro 및 nova lite context window 정보 수정 - [PR #12619](https://github.com/BerriAI/litellm/pull/12619)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}
- **[/chat/completions](../../docs/completion/input)** 
    - trim_messages 출력에 tool calls 포함 - [PR #11517](https://github.com/BerriAI/litellm/pull/11517)
- **[/v1/vector_stores](../../docs/vector_stores/search)**
    - 새 OpenAI 호환 vector store endpoints - [PR #12699](https://github.com/BerriAI/litellm/pull/12699), [시작하기](../../docs/vector_stores/search)
    - Vector store search endpoint - [PR #12749](https://github.com/BerriAI/litellm/pull/12749), [시작하기](../../docs/vector_stores/search)
    - PG Vector를 vector store로 사용하는 기능 지원 - [PR #12667](https://github.com/BerriAI/litellm/pull/12667), [시작하기](../../docs/completion/knowledgebase)
- **[/streamGenerateContent](../../docs/generateContent)**
    - Non-gemini 모델 지원 - [PR #12647](https://github.com/BerriAI/litellm/pull/12647)

#### 버그 {#bugs-1}
- **[/vector_stores](../../docs/vector_stores/search)**
    - `tools`로 전달할 때 Knowledge Base Call이 오류를 반환하던 문제 수정 - [PR #12628](https://github.com/BerriAI/litellm/pull/12628)

---

## [MCP Gateway](../../docs/mcp)

#### 기능 {#features-2}
- **[Access Groups](../../docs/mcp#grouping-mcps-access-groups)**
    - litellm proxy config.yaml을 통해 MCP access groups를 추가할 수 있도록 허용 - [PR #12654](https://github.com/BerriAI/litellm/pull/12654)
    - keys의 access list에서 tools 나열 - [PR #12657](https://github.com/BerriAI/litellm/pull/12657)
- **[Namespacing](../../docs/mcp#mcp-namespacing)**
    - 더 나은 분리를 위한 URL 기반 namespacing - [PR #12658](https://github.com/BerriAI/litellm/pull/12658)
    - MCP_TOOL_PREFIX_SEPARATOR를 env에서 구성할 수 있도록 변경 - [PR #12603](https://github.com/BerriAI/litellm/pull/12603)
- **[Gateway 기능](../../docs/mcp#mcp-gateway-features)**
    - /responses 사용 시 모든 LLM API(VertexAI, Gemini, Groq 등)에서 MCPs를 사용할 수 있도록 허용 - [PR #12546](https://github.com/BerriAI/litellm/pull/12546)

#### 버그 {#bugs-2}
    - key/team 업데이트 또는 삭제 시 object permission을 업데이트하도록 수정 - [PR #12701](https://github.com/BerriAI/litellm/pull/12701)
    - proxy의 사용 가능한 routes 목록에 /mcp 포함 - [PR #12612](https://github.com/BerriAI/litellm/pull/12612)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-3}
- **키**
    - Regenerate Key State Management 개선 - [PR #12729](https://github.com/BerriAI/litellm/pull/12729)
- **모델**
    - Wildcard 모델 filter 지원 - [PR #12597](https://github.com/BerriAI/litellm/pull/12597)
    - UI에서 team only 모델을 처리하는 방식 수정 - [PR #12632](https://github.com/BerriAI/litellm/pull/12632)
- **Usage 페이지**
    - Spend per Tag 차트의 Y축 labels 겹침 수정 - [PR #12754](https://github.com/BerriAI/litellm/pull/12754)
- **Teams**
    - custom key duration 설정 허용 및 key creation stats 표시 - [PR #12722](https://github.com/BerriAI/litellm/pull/12722)
    - team admins가 member roles를 업데이트할 수 있도록 활성화 - [PR #12629](https://github.com/BerriAI/litellm/pull/12629)
- **사용자**
    - 새 `/user/bulk_update` endpoint - [PR #12720](https://github.com/BerriAI/litellm/pull/12720)
- **Logs 페이지**
    - UI Logs Page에 `end_user` filter 추가 - [PR #12663](https://github.com/BerriAI/litellm/pull/12663)
- **MCP Servers**
    - MCP Server name 복사 기능 - [PR #12760](https://github.com/BerriAI/litellm/pull/12760)
- **Vector Stores**
    - UI에서 Vector Stores를 클릭해 상세로 들어갈 수 있도록 지원 - [PR #12741](https://github.com/BerriAI/litellm/pull/12741)
    - UI를 통해 Vertex RAG Engine, OpenAI, Azure를 추가할 수 있도록 허용 - [PR #12752](https://github.com/BerriAI/litellm/pull/12752)
- **일반**
    - 모든 IDs(Key, Team, Organization, MCP Server)에 Copy-on-Click 추가 - [PR #12615](https://github.com/BerriAI/litellm/pull/12615)
- **[SCIM](../../docs/proxy/scim)**
    - GET /ServiceProviderConfig endpoint 추가 - [PR #12664](https://github.com/BerriAI/litellm/pull/12664)

#### 버그 {#bugs-3}
- **Teams**
    - 새 teams 생성 시 user id가 올바르게 추가되도록 보장 - [PR #12719](https://github.com/BerriAI/litellm/pull/12719)
    - UI에서 team-only 모델을 처리하는 방식 수정 - [PR #12632](https://github.com/BerriAI/litellm/pull/12632)

---

## 로깅 / Guardrail 통합 {#logging--guardrail-integrations}

#### 기능 {#features-4}
- **[Google Cloud Model Armor](../../docs/proxy/guardrails/google_cloud_model_armor)**
    - 새 guardrails 통합 - [PR #12492](https://github.com/BerriAI/litellm/pull/12492)
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - 'BLOCKED' action에서 exception 비활성화 허용 - [PR #12693](https://github.com/BerriAI/litellm/pull/12693)
- **[가드레일 AI](../../docs/proxy/guardrails/guardrails_ai)**
    - `llmOutput` 기반 guardrails를 pre-call hooks로 지원 - [PR #12674](https://github.com/BerriAI/litellm/pull/12674)
- **[DataDog LLM 관측성](../../docs/proxy/logging#datadog)**
    - 사용된 LLM Endpoint를 기준으로 올바른 span type을 추적하는 지원 추가 - [PR #12652](https://github.com/BerriAI/litellm/pull/12652)
- **[Custom Logging](../../docs/proxy/logging)**
    - S3 또는 GCS Bucket에서 custom logger python scripts를 읽을 수 있도록 허용 - [PR #12623](https://github.com/BerriAI/litellm/pull/12623)

#### 버그 {#bugs-4}
- **[General Logging](../../docs/proxy/logging)**
    - cache_hits의 StandardLoggingPayload가 custom llm provider를 추적해야 함 - [PR #12652](https://github.com/BerriAI/litellm/pull/12652)
- **[S3 Buckets](../../docs/proxy/logging#s3-buckets)**
    - guardrails와 함께 사용할 때 S3 v2 log uploader가 crash되는 문제 수정 - [PR #12733](https://github.com/BerriAI/litellm/pull/12733)

---

## 성능 / 로드 밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

#### 기능 {#features-5}
- **Health Checks**
    - liveness probes를 위한 별도 health app - [PR #12669](https://github.com/BerriAI/litellm/pull/12669)
    - 별도 포트의 health check app - [PR #12718](https://github.com/BerriAI/litellm/pull/12718)
- **캐싱**
    - Azure Blob cache 지원 추가 - [PR #12587](https://github.com/BerriAI/litellm/pull/12587)
- **Router**
    - lowest_latency strategy에서 completion tokens가 0일 때 ZeroDivisionError 처리 - [PR #12734](https://github.com/BerriAI/litellm/pull/12734)

#### 버그 {#bugs-5}
- **Database**
    - UniqueViolationError를 방지하기 위해 managed object table에 upsert 사용 - [PR #11795](https://github.com/BerriAI/litellm/pull/11795)
    - helm hook용 use_prisma_migrate 지원을 위한 refactor - [PR #12600](https://github.com/BerriAI/litellm/pull/12600)
- **Cache**
    - 수정: embedding response models용 redis caching - [PR #12750](https://github.com/BerriAI/litellm/pull/12750)

---

## Helm Chart {#helm-chart}

- DB Migration Hook: helm hook용 use_prisma_migrate 지원을 위한 refactor [PR](https://github.com/BerriAI/litellm/pull/12600)
- Helm migrations job에 envVars 및 extraEnvVars 지원 추가 - [PR #12591](https://github.com/BerriAI/litellm/pull/12591)

## 일반 Proxy 개선 {#general-proxy-improvements}

#### 기능 {#features-6}
- **Control Plane + Data Plane 아키텍처**
    - Control Plane + Data Plane 지원 - [PR #12601](https://github.com/BerriAI/litellm/pull/12601)
- **Proxy CLI**
    - CLI에 "keys import" command 추가 - [PR #12620](https://github.com/BerriAI/litellm/pull/12620)
- **Swagger 문서**
    - LiteLLM /chat/completions, /embeddings, /responses에 대한 swagger docs 추가 - [PR #12618](https://github.com/BerriAI/litellm/pull/12618)
- **의존성**
    - rich version을 ==13.7.1에서 >=13.7.1로 완화 - [PR #12704](https://github.com/BerriAI/litellm/pull/12704)


#### 버그 {#bugs-6}

- Verbose log가 기본으로 활성화되는 문제 수정 - [PR #12596](https://github.com/BerriAI/litellm/pull/12596)

- request body에서 callbacks 비활성화 지원 추가 - [PR #12762](https://github.com/BerriAI/litellm/pull/12762)
- spend tracking metadata JSON serialization의 circular references 처리 - [PR #12643](https://github.com/BerriAI/litellm/pull/12643)

---

## 새 기여자 {#new-contributors}
* @AntonioKL님이 https://github.com/BerriAI/litellm/pull/12591 에서 첫 기여를 했습니다.
* @marcelodiaz558님이 https://github.com/BerriAI/litellm/pull/12541 에서 첫 기여를 했습니다.
* @dmcaulay님이 https://github.com/BerriAI/litellm/pull/12463 에서 첫 기여를 했습니다.
* @demoray님이 https://github.com/BerriAI/litellm/pull/12587 에서 첫 기여를 했습니다.
* @staeiou님이 https://github.com/BerriAI/litellm/pull/12631 에서 첫 기여를 했습니다.
* @stefanc-ai2님이 https://github.com/BerriAI/litellm/pull/12622 에서 첫 기여를 했습니다.
* @RichardoC님이 https://github.com/BerriAI/litellm/pull/12607 에서 첫 기여를 했습니다.
* @yeahyung님이 https://github.com/BerriAI/litellm/pull/11795 에서 첫 기여를 했습니다.
* @mnguyen96님이 https://github.com/BerriAI/litellm/pull/12619 에서 첫 기여를 했습니다.
* @rgambee님이 https://github.com/BerriAI/litellm/pull/11517 에서 첫 기여를 했습니다.
* @jvanmelckebeke님이 https://github.com/BerriAI/litellm/pull/12725 에서 첫 기여를 했습니다.
* @jlaurendi님이 https://github.com/BerriAI/litellm/pull/12704 에서 첫 기여를 했습니다.
* @doublerr님이 https://github.com/BerriAI/litellm/pull/12661 에서 첫 기여를 했습니다.

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.74.3-stable...v1.74.7-stable)** {#full-changelog}
