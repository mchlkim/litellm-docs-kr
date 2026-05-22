---
title: "v1.77.7-stable - 중앙값 지연 시간 2.9배 감소"
slug: "v1-77-7"
date: 2025-10-04T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.77.7.rc.1
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.77.7.rc.1
```

</TabItem>
</Tabs>

---

## 주요 내용 {#key-highlights}

- **Dynamic Rate Limiter v3** - 사용 가능한 용량이 있을 때(< 80% 포화도) 낮은 우선순위 요청이 미사용 용량을 활용하도록 하여 처리량을 자동으로 극대화하고, 높은 부하(≥ 80%)에서는 차단을 방지하기 위해 공정한 우선순위 기반 할당으로 전환합니다.
- **주요 성능 개선** - 동시 사용자 1,000명 기준 중앙값 지연 시간이 2.9배 감소했습니다.
- **Claude Sonnet 4.5** - 200K+ context와 단계별 가격을 제공하는 Anthropic의 새로운 Claude Sonnet 4.5 모델군을 지원합니다.
- **MCP Gateway 개선** - 세분화된 도구 제어, 서버 권한, 전달 가능한 헤더를 지원합니다.
- **AMD Lemonade & Nvidia NIM** - AMD Lemonade 및 Nvidia NIM Rerank에 대한 새 provider 지원을 추가했습니다.
- **GitLab Prompt Management** - GitLab 기반 prompt management 통합을 추가했습니다.

### 성능 - 중앙값 지연 시간 2.9배 감소 {#performance---29x-lower-median-latency}

<Image img={require('../../img/release_notes/perf_77_7.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 업데이트는 LiteLLM router의 비효율을 제거하여 복잡도를 O(M×N)에서 O(1)로 낮춥니다. 이전에는 새 배열을 만들고 `llm_router.get_model_ids()` 안의 `data["model"]` 같은 검사를 반복했습니다. 이제 직접적인 ID-to-deployment 매핑으로 불필요한 할당과 스캔을 제거합니다.

그 결과 모든 지연 시간 백분위에서 성능이 개선되었습니다.

- **중앙값 지연 시간:** 320 ms → **110 ms** (−65.6%)
- **p95 지연 시간:** 850 ms → **440 ms** (−48.2%)
- **p99 지연 시간:** 1,400 ms → **810 ms** (−42.1%)
- **평균 지연 시간:** 864 ms → **310 ms** (−64%)


#### 테스트 설정 {#test-setup}

**Locust**

- **동시 사용자:** 1,000
- **Ramp-up:** 500

**시스템 사양**

- **CPU:** 4 vCPUs
- **메모리:** 8 GB RAM
- **LiteLLM Workers:** 4
- **인스턴스**: 4

**설정 (config.yaml)**

전체 설정 보기: [gist.github.com/AlexsanderHamir/config.yaml](https://gist.github.com/AlexsanderHamir/53f7d554a5d2afcf2c4edb5b6be68ff4)

**Load Script (no_cache_hits.py)**

전체 부하 테스트 스크립트 보기: [gist.github.com/AlexsanderHamir/no_cache_hits.py](https://gist.github.com/AlexsanderHamir/42c33d7a4dc7a57f56a78b560dee3a42)

### MCP OAuth 2.0 지원 {#mcp-oauth-20-support}

<Image img={require('../../img/mcp_updates.jpg')} style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 MCP servers용 OAuth 2.0 Client Credentials 지원을 추가합니다. 사용자가 자신의 credentials로 MCP servers를 호출할 수 있으므로 **Internal Dev Tools** 사용 사례에 적합합니다. 예를 들어 개발자가 자신의 credentials로 Github MCP를 호출할 수 있습니다.

[Claude Code에서 지금 설정하기](../../docs/tutorials/claude_responses_api#connecting-mcp-servers)

### 예약된 키 교체 {#scheduled-key-rotations}

<Image img={require('../../img/release_notes/schedule_key_rotations.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 LiteLLM AI Gateway에서 virtual key rotation 예약을 지원합니다.
 
이번 릴리스부터 15일/30일/60일 등 원하는 일정에 따라 가상 키가 교체되도록 강제할 수 있습니다.
 
프로덕션 워크로드에 보안 정책을 적용해야 하는 Proxy Admins에게 유용합니다.

[시작하기](../../docs/proxy/virtual_keys#scheduled-key-rotations)


## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

#### 신규 모델 지원 {#new-model-support}

| Provider | Model | Context Window | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Anthropic | `claude-sonnet-4-5` | 200K | $3.00 | $15.00 | `Chat`, `reasoning`, `vision`, `function calling`, `prompt caching` |
| Anthropic | `claude-sonnet-4-5-20250929` | 200K | $3.00 | $15.00 | `Chat`, `reasoning`, `vision`, `function calling`, `prompt caching` |
| Bedrock | `eu.anthropic.claude-sonnet-4-5-20250929-v1:0` | 200K | $3.00 | $15.00 | `Chat`, `reasoning`, `vision`, `function calling`, `prompt caching` |
| Azure AI | `azure_ai/grok-4` | 131K | $5.50 | $27.50 | `Chat`, `reasoning`, `function calling`, `web search` |
| Azure AI | `azure_ai/grok-4-fast-reasoning` | 131K | $0.43 | $1.73 | `Chat`, `reasoning`, `function calling`, `web search` |
| Azure AI | `azure_ai/grok-4-fast-non-reasoning` | 131K | $0.43 | $1.73 | `Chat`, `function calling`, `web search` |
| Azure AI | `azure_ai/grok-code-fast-1` | 131K | $3.50 | $17.50 | `Chat`, `function calling`, `web search` |
| Groq | `groq/moonshotai/kimi-k2-instruct-0905` | Context varies | 가격 변동 | 가격 변동 | Chat, function calling |
| Ollama | Ollama Cloud models | Varies | 무료 | 무료 | Ollama Cloud를 통한 self-hosted models |

#### 기능 {#features}

- **[Anthropic](../../docs/providers/anthropic)**
    - 200K tokens 초과 구간에 단계별 가격을 적용하는 새 claude-sonnet-4-5 모델군 추가 - [PR #15041](https://github.com/BerriAI/litellm/pull/15041)
    - prompt caching 지원과 함께 model price json에 anthropic/claude-sonnet-4-5 추가 - [PR #15049](https://github.com/BerriAI/litellm/pull/15049)
    - Sonnet 4.5용 200K 가격 추가 - [PR #15140](https://github.com/BerriAI/litellm/pull/15140)
    - streaming response의 /v1/messages에 cost tracking 추가 - [PR #15102](https://github.com/BerriAI/litellm/pull/15102)
    - non-admin user access를 위해 Anthropic routes에 /v1/messages/count_tokens 추가 - [PR #15034](https://github.com/BerriAI/litellm/pull/15034)
- **[Gemini](../../docs/providers/gemini)**
    - gemini tools에서 type param 무시 - [PR #15022](https://github.com/BerriAI/litellm/pull/15022)
- **[Vertex AI](../../docs/providers/vertex)**
    - VertexAI용 LiteLLM Overhead metric 추가 - [PR #15040](https://github.com/BerriAI/litellm/pull/15040)
    - vertex ai에서 googlemap grounding 지원 - [PR #15179](https://github.com/BerriAI/litellm/pull/15179)
- **[Azure](../../docs/providers/azure)**
    - azure_ai grok-4 모델군 추가 - [PR #15137](https://github.com/BerriAI/litellm/pull/15137)
    - Azure Batch의 GET 요청에 `extra_query` parameter 사용 - [PR #14997](https://github.com/BerriAI/litellm/pull/14997)
    - download results에 extra_query 사용 (Batch API) - [PR #15025](https://github.com/BerriAI/litellm/pull/15025)
    - Azure AD token-based authorization 지원 추가 - [PR #14813](https://github.com/BerriAI/litellm/pull/14813)
- **[Ollama](../../docs/providers/ollama)**
    - ollama cloud models 추가 - [PR #15008](https://github.com/BerriAI/litellm/pull/15008)
- **[Groq](../../docs/providers/groq)**
    - groq/moonshotai/kimi-k2-instruct-0905 추가 - [PR #15079](https://github.com/BerriAI/litellm/pull/15079)
- **[OpenAI](../../docs/providers/openai)**
    - GPT 5 codex models 지원 추가 - [PR #14841](https://github.com/BerriAI/litellm/pull/14841)
- **[DeepInfra](../../docs/providers/deepinfra)**
    - 최신 가격으로 DeepInfra model data refresh 업데이트 - [PR #14939](https://github.com/BerriAI/litellm/pull/14939)
- **[Bedrock](../../docs/providers/bedrock)**
    - JP Cross-Region Inference 추가 - [PR #15188](https://github.com/BerriAI/litellm/pull/15188)
    - "eu.anthropic.claude-sonnet-4-5-20250929-v1:0" 추가 - [PR #15181](https://github.com/BerriAI/litellm/pull/15181)
    - twelvelabs bedrock Async Invoke Support 추가 - [PR #14871](https://github.com/BerriAI/litellm/pull/14871)
- **[Nvidia NIM](../../docs/providers/nvidia_nim)**
    - Nvidia NIM Rerank Support 추가 - [PR #15152](https://github.com/BerriAI/litellm/pull/15152)

### 버그 수정 {#bug-fixes}

- **[VLLM](../../docs/providers/vllm)**
    - hosted vllm audio_transcription의 response_format 버그 수정 - [PR #15010](https://github.com/BerriAI/litellm/pull/15010)
    - upstream provider로 전달되는 kwargs에 atranscription이 passthrough되는 문제 수정 - [PR #15005](https://github.com/BerriAI/litellm/pull/15005)
- **[OCI](../../docs/providers/oci)**
    - Proxy 사용 시 OCI Generative AI Integration 수정 - [PR #15072](https://github.com/BerriAI/litellm/pull/15072)
- **일반**
    - Authorization header가 올바른 "Bearer" 대소문자를 사용하도록 수정 - [PR #14764](https://github.com/BerriAI/litellm/pull/14764)
    - gpt-5-chat-latest의 잘못된 max_input_tokens 값 수정 - [PR #15116](https://github.com/BerriAI/litellm/pull/15116)
    - original exceptions에 대한 request handling 업데이트 - [PR #15013](https://github.com/BerriAI/litellm/pull/15013)

#### 신규 Provider 지원 {#new-provider-support}

- **[AMD Lemonade](../../docs/providers/lemonade)**
    - AMD Lemonade provider support 추가 - [PR #14840](https://github.com/BerriAI/litellm/pull/14840)

---

## LLM API Endpoints {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - Responses API Streaming requests의 Cost 반환 - [PR #15053](https://github.com/BerriAI/litellm/pull/15053)

- **[/generateContent](../../docs/providers/gemini)**
    - native Gemini API translation 전체 지원 추가 - [PR #15029](https://github.com/BerriAI/litellm/pull/15029)

- **Gemini passthrough 경로**
    - Gemini generateContent passthrough cost tracking 추가 - [PR #15014](https://github.com/BerriAI/litellm/pull/15014)
    - passthrough에 streamGenerateContent cost tracking 추가 - [PR #15199](https://github.com/BerriAI/litellm/pull/15199)

- **Vertex AI passthrough 경로**
    - Vertex AI Passthrough `/predict` endpoint에 cost tracking 추가 - [PR #15019](https://github.com/BerriAI/litellm/pull/15019)
    - Vertex AI Live API WebSocket Passthrough에 cost tracking 추가 - [PR #14956](https://github.com/BerriAI/litellm/pull/14956)

- **일반**
    - Model Response Streams에서 Whitespace Characters 보존 - [PR #15160](https://github.com/BerriAI/litellm/pull/15160)
    - payload specification에 provider name 추가 - [PR #15130](https://github.com/BerriAI/litellm/pull/15130)
    - origin url의 query params가 downstream request로 전달되도록 보장 - [PR #15087](https://github.com/BerriAI/litellm/pull/15087)

---

## Management Endpoint 및 UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **가상 키**
    - LLM_API_KEYs가 pass through routes에 접근할 수 있도록 보장 - [PR #15115](https://github.com/BerriAI/litellm/pull/15115)
    - team에 속한 keys에 limits를 설정할 때 'guaranteed_throughput' 지원 - [PR #15120](https://github.com/BerriAI/litellm/pull/15120)
    
- **모델 + Endpoints**
    - /models 및 /v1/models endpoints에서 OCI secret fields가 공유되지 않도록 보장 - [PR #15085](https://github.com/BerriAI/litellm/pull/15085)
    - UI에 snowflake 추가 - [PR #15083](https://github.com/BerriAI/litellm/pull/15083)
    - custom branding을 위해 UI theme settings를 공개 접근 가능하게 변경 - [PR #15074](https://github.com/BerriAI/litellm/pull/15074)
    
- **Admin Settings**
    - UI에서 설정한 뒤 OTEL settings가 DB에 저장되도록 보장 - [PR #15118](https://github.com/BerriAI/litellm/pull/15118)
    - 상위 api key tags 추가 - [PR #15151](https://github.com/BerriAI/litellm/pull/15151), [PR #15156](https://github.com/BerriAI/litellm/pull/15156)

- **MCP**
    - MCP servers의 health status 표시 - [PR #15185](https://github.com/BerriAI/litellm/pull/15185)
    - UI에서 extra headers 설정 허용 - [PR #15185](https://github.com/BerriAI/litellm/pull/15185)
    - UI에서 allowed tools 편집 허용 - [PR #15185](https://github.com/BerriAI/litellm/pull/15185)

### 버그 수정 {#bug-fixes-1}

- **가상 키**
    - (security) user key가 다른 user keys를 업데이트하지 못하도록 방지 - [PR #15201](https://github.com/BerriAI/litellm/pull/15201)
    - (security) /v2/key/info에서 blank key alias가 있는 모든 keys를 반환하지 않도록 수정 - [PR #15201](https://github.com/BerriAI/litellm/pull/15201)
    - Session Token Cookie Infinite Logout Loop 수정 - [PR #15146](https://github.com/BerriAI/litellm/pull/15146)

- **모델 + Endpoints**
    - custom branding을 위해 UI theme settings를 공개 접근 가능하게 변경 - [PR #15074](https://github.com/BerriAI/litellm/pull/15074)

- **Teams**
    - http ui에서 copy to clipboard 실패 수정 - [PR #15195](https://github.com/BerriAI/litellm/pull/15195)

- **로그**
    - filter lookup 시 logs page의 logs 렌더링 수정 - [PR #15195](https://github.com/BerriAI/litellm/pull/15195)
    - end users의 lookup list 수정(더 효율적인 /customers/list lookup으로 마이그레이션) - [PR #15195](https://github.com/BerriAI/litellm/pull/15195)

- **Test key**
    - key 변경 시 selected model 업데이트 - [PR #15197](https://github.com/BerriAI/litellm/pull/15197)

- **Dashboard**
    - dashboard overview의 LiteLLM model name fallback 수정 - [PR #14998](https://github.com/BerriAI/litellm/pull/14998)


---

## Logging / Guardrail / Prompt Management 통합 {#logging--guardrail--prompt-management-integrations}

#### 기능 {#features-3}

- **[OpenTelemetry](../../docs/observability/otel)**
    - logging method에서 span naming에 generation_name 사용 - [PR #14799](https://github.com/BerriAI/litellm/pull/14799)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Langfuse logging에서 non-serializable objects 처리 - [PR #15148](https://github.com/BerriAI/litellm/pull/15148)
    - langfuse integration에서 usage_details.total 설정 - [PR #15015](https://github.com/BerriAI/litellm/pull/15015)
- **[Prometheus](../../docs/proxy/prometheus)**
    - key/team의 custom metadata labels 지원 - [PR #15094](https://github.com/BerriAI/litellm/pull/15094)


#### 가드레일 {#가드레일}

- **[Javelin](../../docs/proxy/guardrails)**
    - LiteLLM Proxy용 Javelin standalone guardrails integration 추가 - [PR #14983](https://github.com/BerriAI/litellm/pull/14983)
    - guardrails의 중요한 status fields에 logging 추가 - [PR #15090](https://github.com/BerriAI/litellm/pull/15090)
    - Bedrock에서 text가 반환되지 않으면 post_call guardrail을 실행하지 않도록 변경 - [PR #15106](https://github.com/BerriAI/litellm/pull/15106)

#### Prompt Management {#prompt-management}

- **[GitLab](../../docs/proxy/prompt_management)**
    - GitLab 기반 Prompt manager 추가 - [PR #14988](https://github.com/BerriAI/litellm/pull/14988)

---

## 비용 추적, 예산 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Cost Tracking** 
    - Proxy: responses API의 end user cost tracking 추가 - [PR #15124](https://github.com/BerriAI/litellm/pull/15124)
- **Parallel Request Limiter v3 개선** 
    - 잘 알려진 redis cluster hashing algorithm 사용 - [PR #15052](https://github.com/BerriAI/litellm/pull/15052)
    - dynamic rate limiter v3 수정 - saturation detection 추가 - [PR #15119](https://github.com/BerriAI/litellm/pull/15119)
    - Dynamic Rate Limiter v3 - saturation 감지 수정 및 post saturation behavior 수정 - [PR #15192](https://github.com/BerriAI/litellm/pull/15192)
- **Teams** 
    - LiteLLM의 teams에 model specific tpm/rpm limits 추가 - [PR #15044](https://github.com/BerriAI/litellm/pull/15044)

---

## MCP Gateway {#mcp-gateway}

- **Server 설정** 
    - MCP servers에 forwardable headers와 allowed/disallowed tools 지정 - [PR #15002](https://github.com/BerriAI/litellm/pull/15002)
    - call tools에서 server permissions 적용 - [PR #15044](https://github.com/BerriAI/litellm/pull/15044)
    - MCP Gateway Fine-grained Tools 추가 - [PR #15153](https://github.com/BerriAI/litellm/pull/15153)
- **버그 수정** 
    - servername prefix mcp tools tests 제거 - [PR #14986](https://github.com/BerriAI/litellm/pull/14986)
    - 중복 Mcp-Protocol-Version header regression 해결 - [PR #15050](https://github.com/BerriAI/litellm/pull/15050)
    - test_mcp_server.py 수정 - [PR #15183](https://github.com/BerriAI/litellm/pull/15183)

---

## Performance / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

- **Router 최적화**
    - **P99 Latency +62.5% 개선** - router 비효율 제거(O(M*N)에서 O(1)로 개선) - [PR #15046](https://github.com/BerriAI/litellm/pull/15046)
    - Router에서 hasattr checks 제거 - [PR #15082](https://github.com/BerriAI/litellm/pull/15082)
    - Double Lookups 제거 - [PR #15084](https://github.com/BerriAI/litellm/pull/15084)
    - _filter_cooldown_deployments를 O(n×m + k×n)에서 O(n)으로 최적화 - [PR #15091](https://github.com/BerriAI/litellm/pull/15091)
    - retry path의 unhealthy deployment filtering 최적화(O(n*m) → O(n+m)) - [PR #15110](https://github.com/BerriAI/litellm/pull/15110)
- **Cache Optimization**
    - InMemoryCache.evict_cache의 복잡도를 O(n*log(n))에서 O(log(n))으로 감소 - [PR #15000](https://github.com/BerriAI/litellm/pull/15000)
    - cache를 사용할 수 없을 때 비용이 큰 작업 회피 - [PR #15182](https://github.com/BerriAI/litellm/pull/15182)
- **Worker Management**
    - N requests 이후 workers를 recycle하는 proxy CLI option 추가 - [PR #15007](https://github.com/BerriAI/litellm/pull/15007)
- **Metrics 및 Monitoring**
    - LiteLLM Overhead metric tracking - cache hits에서 litellm overhead tracking 지원 추가 - [PR #15045](https://github.com/BerriAI/litellm/pull/15045)

---

## 문서 업데이트 {#documentation-updates}

- **Provider Documentation 업데이트** 
    - 최신 릴리스 기준으로 litellm docs 업데이트 - [PR #15004](https://github.com/BerriAI/litellm/pull/15004)
    - 누락된 api_key parameter 추가 - [PR #15058](https://github.com/BerriAI/litellm/pull/15058)
- **일반 문서** 
    - docker-compose 대신 docker compose 사용 - [PR #15024](https://github.com/BerriAI/litellm/pull/15024)
    - litellm을 사용하는 projects에 railtracks 추가 - [PR #15144](https://github.com/BerriAI/litellm/pull/15144)
    - Perf: 지난주 개선 사항 반영 - [PR #15193](https://github.com/BerriAI/litellm/pull/15193)
    - models GitHub documentation을 Loom video 및 cross-reference와 동기화 - [PR #15191](https://github.com/BerriAI/litellm/pull/15191)

---

## 보안 수정 {#security-fixes}

- **JWT Token Security** - .info() log에 JWT SSO token을 기록하지 않도록 수정 - [PR #15145](https://github.com/BerriAI/litellm/pull/15145)

---

## 신규 기여자 {#new-contributors}

* @herve-ves 님이 [PR #14998](https://github.com/BerriAI/litellm/pull/14998)에서 첫 기여를 했습니다.
* @wenxi-onyx 님이 [PR #15008](https://github.com/BerriAI/litellm/pull/15008)에서 첫 기여를 했습니다.
* @jpetrucciani 님이 [PR #15005](https://github.com/BerriAI/litellm/pull/15005)에서 첫 기여를 했습니다.
* @abhijitjavelin 님이 [PR #14983](https://github.com/BerriAI/litellm/pull/14983)에서 첫 기여를 했습니다.
* @ZeroClover 님이 [PR #15039](https://github.com/BerriAI/litellm/pull/15039)에서 첫 기여를 했습니다.
* @cedarm 님이 [PR #15043](https://github.com/BerriAI/litellm/pull/15043)에서 첫 기여를 했습니다.
* @Isydmr 님이 [PR #15025](https://github.com/BerriAI/litellm/pull/15025)에서 첫 기여를 했습니다.
* @serializer 님이 [PR #15013](https://github.com/BerriAI/litellm/pull/15013)에서 첫 기여를 했습니다.
* @eddierichter-amd 님이 [PR #14840](https://github.com/BerriAI/litellm/pull/14840)에서 첫 기여를 했습니다.
* @malags 님이 [PR #15000](https://github.com/BerriAI/litellm/pull/15000)에서 첫 기여를 했습니다.
* @henryhwang 님이 [PR #15029](https://github.com/BerriAI/litellm/pull/15029)에서 첫 기여를 했습니다.
* @plafleur 님이 [PR #15111](https://github.com/BerriAI/litellm/pull/15111)에서 첫 기여를 했습니다.
* @tyler-liner 님이 [PR #14799](https://github.com/BerriAI/litellm/pull/14799)에서 첫 기여를 했습니다.
* @Amir-R25 님이 [PR #15144](https://github.com/BerriAI/litellm/pull/15144)에서 첫 기여를 했습니다.
* @georg-wolflein 님이 [PR #15124](https://github.com/BerriAI/litellm/pull/15124)에서 첫 기여를 했습니다.
* @niharm 님이 [PR #15140](https://github.com/BerriAI/litellm/pull/15140)에서 첫 기여를 했습니다.
* @anthony-liner 님이 [PR #15015](https://github.com/BerriAI/litellm/pull/15015)에서 첫 기여를 했습니다.
* @rishiganesh2002 님이 [PR #15153](https://github.com/BerriAI/litellm/pull/15153)에서 첫 기여를 했습니다.
* @danielaskdd 님이 [PR #15160](https://github.com/BerriAI/litellm/pull/15160)에서 첫 기여를 했습니다.
* @JVenberg 님이 [PR #15146](https://github.com/BerriAI/litellm/pull/15146)에서 첫 기여를 했습니다.
* @speglich 님이 [PR #15072](https://github.com/BerriAI/litellm/pull/15072)에서 첫 기여를 했습니다.
* @daily-kim 님이 [PR #14764](https://github.com/BerriAI/litellm/pull/14764)에서 첫 기여를 했습니다.

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.77.5.rc.4...v1.77.7.rc.1)** {#full-변경-이력}
