---
title: "v1.73.6-stable"
slug: "v1-73-6-stable"
date: 2025-06-28T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.73.6-stable.patch.1
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.73.6.post1
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}


### gemini-cli에서 Claude 사용 {#claude-on-gemini-cli}


<Image img={require('../../img/release_notes/gemini_cli.png')} />

<br/>

이번 릴리스에서는 LiteLLM으로 gemini-cli를 사용할 수 있도록 지원합니다.

gemini-cli에서 claude-sonnet-4, gemini-2.5-flash(Vertex AI 및 Google AI Studio), gpt-4.1, 그리고 LiteLLM이 지원하는 모든 모델을 사용할 수 있습니다.

LiteLLM과 함께 gemini-cli를 사용하면 다음과 같은 이점이 있습니다.

**개발자 이점:**
- 범용 모델 접근: gemini-cli 인터페이스를 통해 LiteLLM이 지원하는 모든 모델(Anthropic, OpenAI, Vertex AI, Bedrock 등)을 사용할 수 있습니다.
- 더 높은 속도 제한과 안정성: 여러 모델과 제공자에 걸쳐 로드 밸런싱하여 개별 제공자 제한에 걸리지 않도록 하고, 한 제공자가 실패해도 응답을 받을 수 있도록 fallback을 제공합니다.

**프록시 관리자 이점:**
- 중앙 집중식 관리: 개발자에게 각 제공자의 API Key를 제공하지 않고도 단일 LiteLLM 프록시 인스턴스를 통해 모든 모델 접근을 제어할 수 있습니다.
- 예산 제어: 전체 gemini-cli 사용량에 대해 지출 한도를 설정하고 비용을 추적할 수 있습니다.

[시작하기](../../docs/tutorials/litellm_gemini_cli)

<br/>

### Batch API 비용 추적 {#batch-api-cost-tracking}

<Image img={require('../../img/release_notes/batch_api_cost_tracking.jpg')}/>

<br/>

v1.73.6에서는 [LiteLLM Managed Batch API](../../docs/proxy/managed_batches) 호출에 대한 비용 추적이 LiteLLM에 추가되었습니다. 이전에는 LiteLLM Managed Files를 사용하는 Batch API 호출에 대해 이 처리가 수행되지 않았습니다. 이제 LiteLLM은 각 배치 호출의 상태를 DB에 저장하고, 완료되지 않은 배치 작업을 백그라운드에서 폴링하며, 배치가 완료되면 비용 추적을 위한 spend log를 내보냅니다.

사용자 측에서 새 flag를 설정하거나 변경할 필요는 없습니다. 앞으로 몇 주 안에 Anthropic passthrough의 배치 비용 추적까지 확장하는 것을 목표로 하고 있습니다.


[시작하기](../../docs/proxy/managed_batches)

---

## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

### 가격 / 컨텍스트 창 업데이트 {#pricing-context-window-updates}

| 제공자    | 모델                                  | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 유형 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | ---- |
| Azure OpenAI | `azure/o3-pro` | 200k | $20.00 | $80.00 | 신규 |
| OpenRouter | `openrouter/mistralai/mistral-small-3.2-24b-instruct` | 32k | $0.1 | $0.3 | 신규 |
| OpenAI | `o3-deep-research` | 200k | $10.00 | $40.00 | 신규 |
| OpenAI | `o3-deep-research-2025-06-26` | 200k | $10.00 | $40.00 | 신규 |
| OpenAI | `o4-mini-deep-research` | 200k | $2.00 | $8.00 | 신규 |
| OpenAI | `o4-mini-deep-research-2025-06-26` | 200k | $2.00 | $8.00 | 신규 |
| Deepseek | `deepseek-r1` | 65k | $0.55 | $2.19 | 신규 |
| Deepseek | `deepseek-v3` | 65k | $0.27 | $0.07 | 신규 |


### 업데이트된 모델 {#updated-models}
#### 버그 {#bugs}
    - **[Sambanova](../../docs/providers/sambanova)**
        - float timestamp 처리 - [PR](https://github.com/BerriAI/litellm/pull/11971) s/o [@neubig](https://github.com/neubig)
    - **[Azure](../../docs/providers/azure)**
        - Responses API에서 Azure 인증 방식(azure ad token, api keys) 지원 - [PR](https://github.com/BerriAI/litellm/pull/11941) s/o [@hsuyuming](https://github.com/hsuyuming)
        - ‘image_url’ 문자열을 중첩 dict로 매핑 - [PR](https://github.com/BerriAI/litellm/pull/12075) s/o [@davis-featherstone](https://github.com/davis-featherstone)
    - **[Watsonx](../../docs/providers/watsonx)**
        - 모델이 custom deployment의 일부일 때 ‘model’ 필드를 None으로 설정하여 해당 경우 WatsonX가 발생시키던 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/11854) s/o [@cbjuan](https://github.com/cbjuan)
    - **[Perplexity](../../docs/providers/perplexity)**
        - web_search_options 지원 - [PR](https://github.com/BerriAI/litellm/pull/11983)
        - citation token 및 search queries 비용 계산 지원 - [PR](https://github.com/BerriAI/litellm/pull/11938)
    - **[Anthropic](../../docs/providers/anthropic)**
        - usage block의 null 값 처리 - [PR](https://github.com/BerriAI/litellm/pull/12068)
    - **Gemini ([Google AI Studio](../../docs/providers/gemini) + [VertexAI](../../docs/providers/vertex))**
        - 허용된 format 값(enum 및 datetime)만 사용하도록 처리. 그렇지 않으면 gemini가 오류를 발생시킵니다 - [PR](https://github.com/BerriAI/litellm/pull/11989) 
        - cached content와 함께 전달된 경우 tools를 캐시합니다. 그렇지 않으면 gemini가 오류를 발생시킵니다 - [PR](https://github.com/BerriAI/litellm/pull/11989)
        - Json schema 변환 개선: anyof 항목 내부의 중첩 $ref에 대한 unpack_def 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/11964)
    - **[Mistral](../../docs/providers/mistral)**
        - hugging face 권장 사항에 맞도록 thinking prompt 수정 - [PR](https://github.com/BerriAI/litellm/pull/12007)
        - codestral-mamba를 제외한 모든 mistral 모델에 `supports_response_schema: true` 추가 - [PR](https://github.com/BerriAI/litellm/pull/12024)
    - **[Ollama](../../docs/providers/ollama)**
        - embedding 호출에서 불필요한 await 수정 - [PR](https://github.com/BerriAI/litellm/pull/12024)
#### 기능 {#features}
    - **[Azure OpenAI](../../docs/providers/azure)**
        - o-series 모델이 reasoning effort를 지원하는지 확인합니다(o1 모델에서 drop_params가 동작하도록 함) 
        - Assistant 및 tool use 비용 추적 - [PR](https://github.com/BerriAI/litellm/pull/12045)
    - **[Nvidia Nim](../../docs/providers/nvidia_nim)**
        - ‘response_format’ param 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12003) @shagunb-acn 
    - **[ElevenLabs](../../docs/providers/elevenlabs)**
        - 신규 STT 제공자 - [PR](https://github.com/BerriAI/litellm/pull/12119)

---
## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}
    - [**/mcp**](../../docs/mcp)
        - `x-mcp-auth`를 사용해 `/tool/call` 엔드포인트로 적절한 auth string 값을 전송 - [PR](https://github.com/BerriAI/litellm/pull/11968) s/o [@wagnerjt](https://github.com/wagnerjt)
    - [**/v1/messages**](../../docs/anthropic_unified)
        - [Custom LLM](../../docs/providers/custom_llm_server#anthropic-v1messages) 지원 - [PR](https://github.com/BerriAI/litellm/pull/12016)
    - [**/chat/completions**](../../docs/completion/input)
        - chat completion을 통한 Azure Responses API 지원 - [PR](https://github.com/BerriAI/litellm/pull/12016)
    - [**/responses**](../../docs/response_api)
        - non-openai 제공자에 대한 reasoning content 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12055)
    - **[NEW] /generateContent**
        - gemini cli 지원을 위한 신규 엔드포인트 - [PR](https://github.com/BerriAI/litellm/pull/12040)
        - Google AI Studio / VertexAI Gemini 모델을 native format으로 호출하는 기능 지원 - [PR](https://github.com/BerriAI/litellm/pull/12046)
        - stream 및 non-stream vertex/google ai studio 라우트에 logging 및 비용 추적 추가 - [PR](https://github.com/BerriAI/litellm/pull/12058)
        - generateContent에서 /chat/completions로 이어지는 Bridge 추가 - [PR](https://github.com/BerriAI/litellm/pull/12081)
    - [**/batches**](../../docs/batches)
        - managed file이 기록된 deployment만 남기도록 필터링 - [PR](https://github.com/BerriAI/litellm/pull/12048)
        - 모든 model / file id 매핑을 db에 저장(기존에는 첫 번째만 저장)하여 ‘진정한’ loadbalancing 지원 - [PR](https://github.com/BerriAI/litellm/pull/12048)
        - target model name을 지정한 List Batches 지원 - [PR](https://github.com/BerriAI/litellm/pull/12049)

---
## 비용 추적 / 예산 개선 {#cost-tracking-budget-improvements}

#### 기능 {#features-2}
    - [**Passthrough**](../../docs/pass_through)
        - [Bedrock](../../docs/pass_through/bedrock) - streaming 및 non-streaming에서 비용 추적(`/invoke` + `/converse` 라우트) - [PR](https://github.com/BerriAI/litellm/pull/12123)
        - [VertexAI](../../docs/pass_through/vertex_ai) - anthropic 비용 계산 지원 - [PR](https://github.com/BerriAI/litellm/pull/11992)
    - [**Batches**](../../docs/batches)
        - LiteLLM Managed batches 비용 추적을 위한 백그라운드 작업 - [PR](https://github.com/BerriAI/litellm/pull/12125)

---
## 관리 엔드포인트 / UI {#management-endpoints-ui}

#### 버그 {#bugs-1}
    - **General UI**
        - dashboard components의 today selector date mutation 수정 - [PR](https://github.com/BerriAI/litellm/pull/12042)
    - **사용법**
        - paginated endpoint의 모든 페이지에 걸쳐 usage data 집계 - [PR](https://github.com/BerriAI/litellm/pull/12033)
    - **Teams**
        - team settings dropdown에서 models 중복 제거 - [PR](https://github.com/BerriAI/litellm/pull/12074)
    - **모델**
        - azure model에서 ‘test connect’를 선택할 때 public model name 보존(이전에는 reset됨) - [PR](https://github.com/BerriAI/litellm/pull/11713)
    - **Invitation Links**
        - tf provider 사용 시 Invite links email에 올바른 invite id가 포함되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12130)
#### 기능 {#features-3}
    - **모델**
        - health check table에 ‘last success’ 컬럼 추가 - [PR](https://github.com/BerriAI/litellm/pull/11903)
    - **MCP**
        - auth types(api key, bearer token, basic auth)를 지원하는 신규 UI component - [PR](https://github.com/BerriAI/litellm/pull/11968) s/o [@wagnerjt](https://github.com/wagnerjt)
        - internal users가 /mcp 및 /mcp/ 라우트에 접근할 수 있도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12106)
    - **SCIM**
        - 신규 사용자에게 default_internal_user_params가 적용되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12015)
    - **Team**
        - team member keys의 default key expiry 지원 - [PR](https://github.com/BerriAI/litellm/pull/12023)
        - team member add check 범위에 user email 포함 - [PR](https://github.com/BerriAI/litellm/pull/12082)
    - **UI**
        - SSO group별 UI 접근 제한 - [PR](https://github.com/BerriAI/litellm/pull/12023)
    - **Keys**
        - key 재생성을 위한 신규 new_key param 추가 - [PR](https://github.com/BerriAI/litellm/pull/12087)
    - **Test Keys**
        - ui configuration 기반으로 실행 가능한 python code snippet을 가져오는 신규 ‘get code’ 버튼 - [PR](https://github.com/BerriAI/litellm/pull/11629)

--- 

## Logging / Guardrail 통합 {#logging-guardrail-integrations}

#### 버그 {#bugs-2}
    - **Braintrust**
        - braintrust 비용 추정을 활성화하기 위해 metadata에 model 추가 - [PR](https://github.com/BerriAI/litellm/pull/12022)
#### 기능 {#features-4}
    - **Callbacks**
        - (엔터프라이즈) - request headers에서 logging callbacks 비활성화 - [PR](https://github.com/BerriAI/litellm/pull/11985)
        - List Callbacks API Endpoint 추가 - [PR](https://github.com/BerriAI/litellm/pull/11987)
    - **Bedrock Guardrail**
        - intervene action에서 exception을 발생시키지 않도록 수정 - [PR](https://github.com/BerriAI/litellm/pull/11875)
        - post call 사용 시 response streaming 또는 non streaming content에 PII Masking이 적용되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12086)
    - **[NEW] `Palo Alto Networks Prisma AIRS Guardrail`**
        - [PR](https://github.com/BerriAI/litellm/pull/12116)
    - **ElasticSearch**
        - 신규 Elasticsearch Logging Tutorial - [PR](https://github.com/BerriAI/litellm/pull/11761)
    - **Message Redaction**
        - Embedding redaction에서 usage / model information 보존 - [PR](https://github.com/BerriAI/litellm/pull/12088)

---

## 성능 / 로드 밸런싱 / 안정성 개선 {#performance-loadbalancing-reliability-improvements}

#### 버그 {#bugs-3}
    - **Team-only models**
        - non-team calls의 routing logic에서 team-only models 필터링
    - **Context Window Exceeded 오류**
        - anthropic exceptions 포착 - [PR](https://github.com/BerriAI/litellm/pull/12113)
#### 기능 {#features-5}
    - **Router**
        - 특정 deployment에 dynamic cooldown time 사용 허용 - [PR](https://github.com/BerriAI/litellm/pull/12037)
        - deployment의 cooldown_time = 0 처리 - [PR](https://github.com/BerriAI/litellm/pull/12108)
    - **Redis**
        - 어떤 variables가 설정되었는지 확인하기 위한 debugging 개선 추가 - [PR](https://github.com/BerriAI/litellm/pull/12073)

---

## 일반 프록시 개선 {#general-proxy-improvements}

#### 버그 {#bugs-4}
    - **aiohttp**
        - networking requests에서 HTTP_PROXY vars 확인
        - trust_env와 함께 HTTP_ Proxy settings 사용 허용

#### 기능 {#features-6}
    - **문서**
        - recommended spec 추가 - [PR](https://github.com/BerriAI/litellm/pull/11980)
    - **Swagger**
        - Redoc opt-out을 위한 신규 environment variable NO_REDOC 도입 - [PR](https://github.com/BerriAI/litellm/pull/12092)


---

## 신규 기여자 {#new-contributors}
* @mukesh-dream11 님이 https://github.com/BerriAI/litellm/pull/11969 에서 첫 기여를 했습니다.
* @cbjuan 님이 https://github.com/BerriAI/litellm/pull/11854 에서 첫 기여를 했습니다.
* @ryan-castner 님이 https://github.com/BerriAI/litellm/pull/12055 에서 첫 기여를 했습니다.
* @davis-featherstone 님이 https://github.com/BerriAI/litellm/pull/12075 에서 첫 기여를 했습니다.
* @Gum-Joe 님이 https://github.com/BerriAI/litellm/pull/12068 에서 첫 기여를 했습니다.
* @jroberts2600 님이 https://github.com/BerriAI/litellm/pull/12116 에서 첫 기여를 했습니다.
* @ohmeow 님이 https://github.com/BerriAI/litellm/pull/12022 에서 첫 기여를 했습니다.
* @amarrella 님이 https://github.com/BerriAI/litellm/pull/11942 에서 첫 기여를 했습니다.
* @zhangyoufu 님이 https://github.com/BerriAI/litellm/pull/12092 에서 첫 기여를 했습니다.
* @bougou 님이 https://github.com/BerriAI/litellm/pull/12088 에서 첫 기여를 했습니다.
* @codeugar 님이 https://github.com/BerriAI/litellm/pull/11972 에서 첫 기여를 했습니다.
* @glgh 님이 https://github.com/BerriAI/litellm/pull/12133 에서 첫 기여를 했습니다.

## **[Git Diff](https://github.com/BerriAI/litellm/compare/v1.73.0-stable...v1.73.6.rc-draft)**
