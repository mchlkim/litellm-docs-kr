---
title: "v1.77.5-stable - MCP OAuth 2.0 지원"
slug: "v1-77-5"
date: 2025-09-29T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.77.5-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.77.5
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **MCP OAuth 2.0 지원** - Model Context Protocol 통합을 위한 인증 강화
- **예약된 키 로테이션** - 보안 강화를 위한 자동 키 로테이션 기능
- **새 Gemini 2.5 Flash & Flash-lite 모델** - 가격과 기능이 개선된 최신 2025년 9월 preview 모델
- **성능 개선** - RPS 54% 개선

---

### 성능 개선 - RPS 54% 개선 {#performance-improvements---54-rps-improvement}

<Image img={require('../../img/release_notes/perf_77_5.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 인스턴스당 RPS를 54% 개선했습니다(집계 기준 1,040 → 1,602 RPS).

이번 개선은 LiteLLM Router의 O(n²) 비효율을 수정한 결과이며, 주된 원인은 큰 배열을 순회하는 루프 안에서 `in` 문을 반복 사용한 것이었습니다.

테스트는 database-only 설정으로 실행했습니다(cache hits 없음).

#### 테스트 설정 {#test-setup}

모든 벤치마크는 동시 사용자 1,000명과 ramp-up 500으로 Locust를 사용해 실행했습니다. 환경은 routing layer에 부하를 주고 caching을 변수에서 제외하도록 구성했습니다.

**시스템 사양**

- **CPU:** 8 vCPUs
- **메모리:** 32 GB RAM

**설정 (config.yaml)**

전체 설정 보기: [gist.github.com/AlexsanderHamir/config.yaml](https://gist.github.com/AlexsanderHamir/53f7d554a5d2afcf2c4edb5b6be68ff4)

**부하 테스트 스크립트 (no_cache_hits.py)**

전체 부하 테스트 스크립트 보기: [gist.github.com/AlexsanderHamir/no_cache_hits.py](https://gist.github.com/AlexsanderHamir/42c33d7a4dc7a57f56a78b560dee3a42)

---


## 신규 모델 / 업데이트된 모델 {#new--updated-models}

#### 신규 모델 지원 {#new-model-support}

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Gemini | `gemini-2.5-flash-preview-09-2025` | 1M | $0.30 | $2.50 | 채팅, 추론, 비전, 오디오 |
| Gemini | `gemini-2.5-flash-lite-preview-09-2025` | 1M | $0.10 | $0.40 | 채팅, 추론, 비전, 오디오 |
| Gemini | `gemini-flash-latest` | 1M | $0.30 | $2.50 | 채팅, 추론, 비전, 오디오 |
| Gemini | `gemini-flash-lite-latest` | 1M | $0.10 | $0.40 | 채팅, 추론, 비전, 오디오 |
| DeepSeek | `deepseek-chat` | 131K | $0.60 | $1.70 | 채팅, function calling, 캐싱 |
| DeepSeek | `deepseek-reasoner` | 131K | $0.60 | $1.70 | 채팅, 추론 |
| Bedrock | `deepseek.v3-v1:0` | 164K | $0.58 | $1.68 | 채팅, 추론, function calling |
| Azure | `azure/gpt-5-codex` | 272K | $1.25 | $10.00 | Responses API, 추론, 비전 |
| OpenAI | `gpt-5-codex` | 272K | $1.25 | $10.00 | Responses API, 추론, 비전 |
| SambaNova | `sambanova/DeepSeek-V3.1` | 33K | $3.00 | $4.50 | 채팅, 추론, function calling |
| SambaNova | `sambanova/gpt-oss-120b` | 131K | $3.00 | $4.50 | 채팅, 추론, function calling |
| Bedrock | `qwen.qwen3-coder-480b-a35b-v1:0` | 262K | $0.22 | $1.80 | 채팅, 추론, function calling |
| Bedrock | `qwen.qwen3-235b-a22b-2507-v1:0` | 262K | $0.22 | $0.88 | 채팅, 추론, function calling |
| Bedrock | `qwen.qwen3-coder-30b-a3b-v1:0` | 262K | $0.15 | $0.60 | 채팅, 추론, function calling |
| Bedrock | `qwen.qwen3-32b-v1:0` | 131K | $0.15 | $0.60 | 채팅, 추론, function calling |
| Vertex AI | `vertex_ai/qwen/qwen3-next-80b-a3b-instruct-maas` | 262K | $0.15 | $1.20 | 채팅, function calling |
| Vertex AI | `vertex_ai/qwen/qwen3-next-80b-a3b-thinking-maas` | 262K | $0.15 | $1.20 | 채팅, function calling |
| Vertex AI | `vertex_ai/deepseek-ai/deepseek-v3.1-maas` | 164K | $1.35 | $5.40 | 채팅, 추론, function calling |
| OpenRouter | `openrouter/x-ai/grok-4-fast:free` | 2M | $0.00 | $0.00 | 채팅, 추론, function calling |
| XAI | `xai/grok-4-fast-reasoning` | 2M | $0.20 | $0.50 | 채팅, 추론, function calling |
| XAI | `xai/grok-4-fast-non-reasoning` | 2M | $0.20 | $0.50 | 채팅, function calling |

#### 기능 {#features}

- **[Gemini](../../docs/providers/gemini)**
    - 가격이 개선된 Gemini 2.5 Flash 및 Flash-lite preview 모델(2025년 9월 릴리스)을 추가했습니다 - [PR #14948](https://github.com/BerriAI/litellm/pull/14948)
    - 새 Anthropic web fetch tool 지원을 추가했습니다 - [PR #14951](https://github.com/BerriAI/litellm/pull/14951)
- **[XAI](../../docs/providers/xai)**
    - xai/grok-4-fast 모델을 추가했습니다 - [PR #14833](https://github.com/BerriAI/litellm/pull/14833)
- **[Anthropic](../../docs/providers/anthropic)**
    - million-token context window 가격을 반영하도록 Claude Sonnet 4 config를 업데이트했습니다 - [PR #14639](https://github.com/BerriAI/litellm/pull/14639)
    - anthropic citation response에 지원되는 text field를 추가했습니다 - [PR #14164](https://github.com/BerriAI/litellm/pull/14164)
- **[Bedrock](../../docs/providers/bedrock)**
    - Amazon Bedrock에 Qwen models family 및 Deepseek 3.1 지원을 추가했습니다 - [PR #14845](https://github.com/BerriAI/litellm/pull/14845)
    - Bedrock Converse API에서 requestMetadata를 지원합니다 - [PR #14570](https://github.com/BerriAI/litellm/pull/14570)
- **[Vertex AI](../../docs/providers/vertex)**
    - vertex_ai/qwen 모델과 azure/gpt-5-codex를 추가했습니다 - [PR #14844](https://github.com/BerriAI/litellm/pull/14844)
    - vertex ai qwen 모델 가격을 업데이트했습니다 - [PR #14828](https://github.com/BerriAI/litellm/pull/14828)
    - Vertex AI Context 캐싱: v1beta1 대신 Vertex ai API v1을 사용하고 'cachedContent' param을 허용합니다 - [PR #14831](https://github.com/BerriAI/litellm/pull/14831)
- **[SambaNova](../../docs/providers/sambanova)**
    - sambanova deepseek v3.1 및 gpt-oss-120b를 추가했습니다 - [PR #14866](https://github.com/BerriAI/litellm/pull/14866)
- **[OpenAI](../../docs/providers/openai)**
    - gpt-5 모델의 일관되지 않은 token config를 수정했습니다 - [PR #14942](https://github.com/BerriAI/litellm/pull/14942)
    - GPT-3.5-Turbo 가격을 업데이트했습니다 - [PR #14858](https://github.com/BerriAI/litellm/pull/14858)
- **[OpenRouter](../../docs/providers/openrouter)**
    - OpenRouter cost map에 gpt-5 및 gpt-5-codex를 추가했습니다 - [PR #14879](https://github.com/BerriAI/litellm/pull/14879)
- **[VLLM](../../docs/providers/vllm)**
    - vllm passthrough를 수정했습니다 - [PR #14778](https://github.com/BerriAI/litellm/pull/14778)
- **[Flux](../../docs/image_generation)**
    - flux image edit를 지원합니다 - [PR #14790](https://github.com/BerriAI/litellm/pull/14790)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - 수정: subscription(anthropic)을 통한 claude code auth를 지원합니다 - [PR #14821](https://github.com/BerriAI/litellm/pull/14821)
    - Anthropic streaming IDs를 수정했습니다 - [PR #14965](https://github.com/BerriAI/litellm/pull/14965)
    - sonnet-4 max output tokens에 대한 잘못된 변경을 되돌렸습니다 - [PR #14933](https://github.com/BerriAI/litellm/pull/14933)
- **[OpenAI](../../docs/providers/openai)**
    - openai image edit가 여러 이미지를 조용히 무시하던 버그를 수정했습니다 - [PR #14893](https://github.com/BerriAI/litellm/pull/14893)
- **[VLLM](../../docs/providers/vllm)**
    - 수정: vLLM provider의 rerank endpoint를 /v1/rerank에서 /rerank로 변경했습니다 - [PR #14938](https://github.com/BerriAI/litellm/pull/14938)

#### 신규 Provider 지원 {#new-provider-support}

- **[W&B Inference](../../docs/providers/wandb)**
    - LiteLLM에 W&B Inference를 추가했습니다 - [PR #14416](https://github.com/BerriAI/litellm/pull/14416)

---

## LLM API Endpoints {#llm-api-endpoints}

#### 기능 {#features-1}

- **공통**
    - additional headers를 위한 SDK 지원을 추가했습니다 - [PR #14761](https://github.com/BerriAI/litellm/pull/14761)
    - aiohttp ClientSession 재사용을 위한 shared_session parameter를 추가했습니다 - [PR #14721](https://github.com/BerriAI/litellm/pull/14721)

#### 버그 {#bugs}

- **공통**
    - 수정: 여러 tool calls에 대한 streaming tool call index 할당을 수정했습니다 - [PR #14587](https://github.com/BerriAI/litellm/pull/14587)
    - token counter proxy에서 credentials 로드를 수정했습니다 - [PR #14808](https://github.com/BerriAI/litellm/pull/14808)

---

## 관리 Endpoints / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **Proxy CLI Auth** 
    - cli auth token 재사용을 허용했습니다 - [PR #14780](https://github.com/BerriAI/litellm/pull/14780)
    - litellm proxy를 사용해 로그인하는 python method를 만들었습니다 - [PR #14782](https://github.com/BerriAI/litellm/pull/14782)
    - LiteLLM Proxy CLI가 Gateway에 Auth하는 흐름을 수정했습니다 - [PR #14836](https://github.com/BerriAI/litellm/pull/14836)
    
**가상 키**    
    - scheduled key rotations 초기 지원을 추가했습니다 - [PR #14877](https://github.com/BerriAI/litellm/pull/14877)
    - virtual keys 생성 시 key rotations 예약을 허용했습니다 - [PR #14960](https://github.com/BerriAI/litellm/pull/14960)

**모델 + Endpoints**
    - 수정: provider list에 Oracle을 추가했습니다 - [PR #14835](https://github.com/BerriAI/litellm/pull/14835)


#### 버그 {#bugs-1}

- **SSO** - 수정: SSO "Clear" 버튼이 SSO config를 제거하는 대신 빈 값을 쓰던 문제를 수정했습니다 - [PR #14826](https://github.com/BerriAI/litellm/pull/14826)
- **Admin Settings** - admin settings에서 useful links를 제거했습니다 - [PR #14918](https://github.com/BerriAI/litellm/pull/14918)
- **Management Routes** - management routes에 /user/list를 추가했습니다 - [PR #14868](https://github.com/BerriAI/litellm/pull/14868)
---

## Logging / Guardrail / Prompt Management 통합 {#logging--guardrail--prompt-management-integrations}

#### 기능 {#features-3}

- **[DataDog](../../docs/proxy/logging#datadog)**
    - Logging - `datadog` callback에서 message content를 datadog로 보내지 않고 log합니다 - [PR #14909](https://github.com/BerriAI/litellm/pull/14909)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - cached tokens에 대한 langfuse usage details를 추가했습니다 - [PR #10955](https://github.com/BerriAI/litellm/pull/10955)
- **[Opik](../../docs/proxy/logging#opik)**
    - opik integration code를 개선했습니다 - [PR #14888](https://github.com/BerriAI/litellm/pull/14888)
- **[SQS](../../docs/proxy/logging#sqs)**
    - SQS Logger에 error logging 지원을 추가했습니다 - [PR #14974](https://github.com/BerriAI/litellm/pull/14974)

#### 가드레일

- **LakeraAI v2 Guardrail** - exception이 올바르게 발생하도록 보장했습니다 - [PR #14867](https://github.com/BerriAI/litellm/pull/14867)
- **Presidio Guardrail** - Presidio guardrail에서 Union[PiiEntityType, str]로 custom entity types를 지원합니다 - [PR #14899](https://github.com/BerriAI/litellm/pull/14899)
- **Noma Guardrail** - ui에 noma guardrail provider를 추가했습니다 - [PR #14415](https://github.com/BerriAI/litellm/pull/14415)

#### Prompt Management {#prompt-management}

- **BitBucket Integration** - Prompt Management를 위한 BitBucket Integration을 추가했습니다 - [PR #14882](https://github.com/BerriAI/litellm/pull/14882)

---

## 비용 추적, 예산 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Service Tier Pricing** - openai에 service_tier 기반 pricing 지원을 추가했습니다(BOTH Service & Priority Support) - [PR #14796](https://github.com/BerriAI/litellm/pull/14796)
- **Cost Tracking** - StandardLoggingPayload에서 input, output, tool call cost breakdown을 표시합니다 - [PR #14921](https://github.com/BerriAI/litellm/pull/14921)
- **병렬 요청 제한기 v3** 
    - Lua scripts가 redis cluster에서 실행될 수 있도록 보장했습니다 - [PR #14968](https://github.com/BerriAI/litellm/pull/14968)
    - 수정: metadata 및 litellm_metadata fields 양쪽에서 metadata info를 가져옵니다 - [PR #14783](https://github.com/BerriAI/litellm/pull/14783)
- **Priority Reservation** - 수정: priority metadata가 없는 keys가 명시적 priority configurations가 있는 keys보다 더 높은 priority를 받던 문제를 수정했습니다 - [PR #14832](https://github.com/BerriAI/litellm/pull/14832)

---

## MCP Gateway {#mcp-gateway}

- **MCP 설정** - mcp_info configuration에서 custom fields를 활성화했습니다 - [PR #14794](https://github.com/BerriAI/litellm/pull/14794)
- **MCP Tools** - list_tools에서 server_name prefix를 제거했습니다 - [PR #14720](https://github.com/BerriAI/litellm/pull/14720)
- **OAuth Flow** - v2 oauth flow 초기 commit입니다 - [PR #14964](https://github.com/BerriAI/litellm/pull/14964)

---

## Performance / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

- **Memory Leak Fix** - TTL이 설정된 경우 InMemoryCache가 무제한으로 커지던 문제를 수정했습니다 - [PR #14869](https://github.com/BerriAI/litellm/pull/14869)
- **Cache Performance** - 수정: cache root cause를 수정했습니다 - [PR #14827](https://github.com/BerriAI/litellm/pull/14827)
- **Concurrency Fix** - 많은 Python threads가 *sync* completions로 streaming을 사용할 때의 concurrency/scaling 문제를 수정했습니다 - [PR #14816](https://github.com/BerriAI/litellm/pull/14816)
- **Performance Optimization** - 수정: get_deployment cost를 O(1)로 줄였습니다 - [PR #14967](https://github.com/BerriAI/litellm/pull/14967)
- **Performance Optimization** - 수정: 느린 string operation을 제거했습니다 - [PR #14955](https://github.com/BerriAI/litellm/pull/14955)
- **DB Connection Management** - 수정: DB connection state retries를 수정했습니다 - [PR #14925](https://github.com/BerriAI/litellm/pull/14925)



---

## 문서 업데이트 {#documentation-updates}

- **Provider Documentation** - provider_specific_params.md 문서를 수정했습니다 - [PR #14787](https://github.com/BerriAI/litellm/pull/14787)
- **Model References** - model references를 gemini-pro에서 gemini-2.5-pro로 업데이트했습니다 - [PR #14775](https://github.com/BerriAI/litellm/pull/14775)
- **Letta Guide** - Letta Guide 문서를 추가했습니다 - [PR #14798](https://github.com/BerriAI/litellm/pull/14798)
- **README** - README 문서를 더 명확하게 개선했습니다 - [PR #14860](https://github.com/BerriAI/litellm/pull/14860)
- **Session Management** - session management availability 문서를 업데이트했습니다 - [PR #14914](https://github.com/BerriAI/litellm/pull/14914)
- **Cost Documentation** - custom pricing의 추가 cost-related keys 문서를 추가했습니다 - [PR #14949](https://github.com/BerriAI/litellm/pull/14949)
- **Azure Passthrough** - azure passthrough 문서를 추가했습니다 - [PR #14958](https://github.com/BerriAI/litellm/pull/14958)
- **General Documentation** - 2025년 9월 문서 업데이트 - [PR #14769](https://github.com/BerriAI/litellm/pull/14769)
    - 문서에서 endpoints와 mode 사이의 bridging을 명확히 했습니다.
    - 관련 가이드에 대안으로 Vertex AI Gemini API configuration을 추가했습니다.
    - Bedrock guardrails 문서에 AWS authentication 정보를 연결했습니다.
    - code snippets와 함께 Cancel Response API 사용법을 추가했습니다.
- `SSO(Single Sign-On)`가 최대 5명까지 무료임을 명확히 했습니다.
    - quick start / intros를 카테고리 상단에 남기고 sidebar를 알파벳순으로 정렬했습니다.
    - cache_params 아래에 max_connections를 문서화했습니다.
    - IAM AssumeRole Policy requirements를 명확히 했습니다.
    - 시작하기에 transform utilities 예시를 추가했습니다(request transformation 표시).
    - 여러 문서에 전체 models list로 models.litellm.ai 참조를 추가했습니다.
    - async_post_call_success_hook code snippet을 추가했습니다.
    - callbacks management guide로 가는 깨진 링크를 제거하고, cookbooks 및 다른 관련 문서를 다시 포맷하고 연결했습니다.
- **Documentation Corrections** - 2025년 9월 문서 업데이트를 수정했습니다 - [PR #14916](https://github.com/BerriAI/litellm/pull/14916)

---

## 신규 기여자 {#new-contributors}

* @uzaxirr 님이 [PR #14761](https://github.com/BerriAI/litellm/pull/14761)에서 첫 기여를 했습니다
* @xprilion 님이 [PR #14416](https://github.com/BerriAI/litellm/pull/14416)에서 첫 기여를 했습니다
* @CH-GAGANRAJ 님이 [PR #14779](https://github.com/BerriAI/litellm/pull/14779)에서 첫 기여를 했습니다
* @otaviofbrito 님이 [PR #14778](https://github.com/BerriAI/litellm/pull/14778)에서 첫 기여를 했습니다
* @danielmklein 님이 [PR #14639](https://github.com/BerriAI/litellm/pull/14639)에서 첫 기여를 했습니다
* @Jetemple 님이 [PR #14826](https://github.com/BerriAI/litellm/pull/14826)에서 첫 기여를 했습니다
* @akshoop 님이 [PR #14818](https://github.com/BerriAI/litellm/pull/14818)에서 첫 기여를 했습니다
* @hazyone 님이 [PR #14821](https://github.com/BerriAI/litellm/pull/14821)에서 첫 기여를 했습니다
* @leventov 님이 [PR #14816](https://github.com/BerriAI/litellm/pull/14816)에서 첫 기여를 했습니다
* @fabriciojoc 님이 [PR #10955](https://github.com/BerriAI/litellm/pull/10955)에서 첫 기여를 했습니다
* @onlylonly 님이 [PR #14845](https://github.com/BerriAI/litellm/pull/14845)에서 첫 기여를 했습니다
* @Copilot 님이 [PR #14869](https://github.com/BerriAI/litellm/pull/14869)에서 첫 기여를 했습니다
* @arsh72 님이 [PR #14899](https://github.com/BerriAI/litellm/pull/14899)에서 첫 기여를 했습니다
* @berri-teddy 님이 [PR #14914](https://github.com/BerriAI/litellm/pull/14914)에서 첫 기여를 했습니다
* @vpbill 님이 [PR #14415](https://github.com/BerriAI/litellm/pull/14415)에서 첫 기여를 했습니다
* @kgritesh 님이 [PR #14893](https://github.com/BerriAI/litellm/pull/14893)에서 첫 기여를 했습니다
* @oytunkutrup1 님이 [PR #14858](https://github.com/BerriAI/litellm/pull/14858)에서 첫 기여를 했습니다
* @nherment 님이 [PR #14933](https://github.com/BerriAI/litellm/pull/14933)에서 첫 기여를 했습니다
* @deepanshululla 님이 [PR #14974](https://github.com/BerriAI/litellm/pull/14974)에서 첫 기여를 했습니다
* @TeddyAmkie 님이 [PR #14758](https://github.com/BerriAI/litellm/pull/14758)에서 첫 기여를 했습니다
* @SmartManoj 님이 [PR #14775](https://github.com/BerriAI/litellm/pull/14775)에서 첫 기여를 했습니다
* @uc4w6c 님이 [PR #14720](https://github.com/BerriAI/litellm/pull/14720)에서 첫 기여를 했습니다
* @luizrennocosta 님이 [PR #14783](https://github.com/BerriAI/litellm/pull/14783)에서 첫 기여를 했습니다
* @AlexsanderHamir 님이 [PR #14827](https://github.com/BerriAI/litellm/pull/14827)에서 첫 기여를 했습니다
* @dharamendrak 님이 [PR #14721](https://github.com/BerriAI/litellm/pull/14721)에서 첫 기여를 했습니다
* @TomeHirata 님이 [PR #14164](https://github.com/BerriAI/litellm/pull/14164)에서 첫 기여를 했습니다
* @mrFranklin 님이 [PR #14860](https://github.com/BerriAI/litellm/pull/14860)에서 첫 기여를 했습니다
* @luisfucros 님이 [PR #14866](https://github.com/BerriAI/litellm/pull/14866)에서 첫 기여를 했습니다
* @huangyafei 님이 [PR #14879](https://github.com/BerriAI/litellm/pull/14879)에서 첫 기여를 했습니다
* @thiswillbeyourgithub 님이 [PR #14949](https://github.com/BerriAI/litellm/pull/14949)에서 첫 기여를 했습니다
* @Maximgitman 님이 [PR #14965](https://github.com/BerriAI/litellm/pull/14965)에서 첫 기여를 했습니다
* @subnet-dev 님이 [PR #14938](https://github.com/BerriAI/litellm/pull/14938)에서 첫 기여를 했습니다
* @22mSqRi 님이 [PR #14972](https://github.com/BerriAI/litellm/pull/14972)에서 첫 기여를 했습니다

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.77.3.rc.1...v1.77.5.rc.1)** {#full-changelog}
