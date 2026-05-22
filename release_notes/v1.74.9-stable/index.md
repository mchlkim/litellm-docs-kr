---
title: "v1.74.9-stable - Auto-Router"
slug: "v1-74-9"
date: 2025-07-27T10:00:00
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

## 이 버전 배포하기

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.74.9-stable.patch.1
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.74.9.post2
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **Auto-Router** - 요청 콘텐츠를 기준으로 특정 모델에 요청을 자동 라우팅합니다.
- **Model-level 가드레일** - 특정 모델이 사용될 때만 가드레일을 실행합니다.
- **MCP Header Propagation** - 클라이언트의 헤더를 백엔드 MCP로 전달합니다.
- **새 LLM Providers** - Bedrock 인페인팅 지원과 Recraft API 이미지 생성 / 이미지 편집 지원을 추가했습니다.

---

## Auto-Router

<Image img={require('../../img/release_notes/auto_router.png')} />

<br/>

이번 릴리스에서는 요청 콘텐츠를 기준으로 모델에 자동 라우팅하는 기능을 도입했습니다. 즉, **Proxy Admins**는 **users**가 auto-router 사용을 선택했을 때 항상 특정 모델로 라우팅되는 키워드 세트를 정의할 수 있습니다.

이는 **users**가 어떤 모델을 사용할지 고민하지 않게 하려는 내부 사용 사례에 적합합니다. 예를 들어 코딩에는 Claude 모델을, 광고 문구 생성에는 GPT 모델을 사용할 수 있습니다.


[더 읽기](../../docs/proxy/auto_routing)

---

## Model-level 가드레일

<Image img={require('../../img/release_notes/model_level_guardrails.jpg')} />

<br/>

이번 릴리스에서는 config.yaml + UI에 model-level guardrails 지원을 추가했습니다. 온프레미스 모델과 호스팅 모델을 함께 쓰면서, 호스팅 모델로 PII가 전송되는 것만 막고 싶은 경우에 유용합니다.

```yaml
model_list:
  - model_name: claude-sonnet-4
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
      api_base: https://api.anthropic.com/v1
      guardrails: ["azure-text-moderation"] # 👈 KEY CHANGE

guardrails:
  - guardrail_name: azure-text-moderation
    litellm_params:
      guardrail: azure/text_moderations
      mode: "post_call" 
      api_key: os.environ/AZURE_GUARDRAIL_API_KEY
      api_base: os.environ/AZURE_GUARDRAIL_API_BASE 
```


[더 읽기](../../docs/proxy/guardrails/quick_start#model-level-guardrails)

---
## MCP 헤더 전달 {#mcp-header-propagation}

<Image img={require('../../img/release_notes/mcp_header_propogation.png')} />

<br/>

v1.74.9-stable에서는 LiteLLM을 통해 MCP 서버별 인증 헤더를 전달할 수 있습니다.

- 사용자가 헤더를 통해 어떤 `header_name`을 어떤 `mcp_server`로 전달할지 지정할 수 있습니다.
- 같은 MCP 서버 유형의 서로 다른 배포가 서로 다른 인증 헤더를 사용하도록 추가할 수 있습니다.


[더 읽기](https://docs.litellm.ai/docs/mcp#new-server-specific-auth-headers-recommended)

---
## 새 모델 / 업데이트된 모델

#### 가격 / 컨텍스트 창 업데이트

| 공급자    | 모델                                  | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- |
| Fireworks AI | `fireworks/models/kimi-k2-instruct` | 131k | $0.6 | $2.5 | 
| OpenRouter | `openrouter/qwen/qwen-vl-plus` | 8192 | $0.21 | $0.63 | 
| OpenRouter | `openrouter/qwen/qwen3-coder` | 8192 | $1 | $5 | 
| OpenRouter | `openrouter/bytedance/ui-tars-1.5-7b` | 128k | $0.10 | $0.20 | 
| Groq | `groq/qwen/qwen3-32b` | 131k | $0.29 | $0.59 | 
| VertexAI | `vertex_ai/meta/llama-3.1-8b-instruct-maas` | 128k | $0.00 | $0.00 | 
| VertexAI | `vertex_ai/meta/llama-3.1-405b-instruct-maas` | 128k | $5 | $16 | 
| VertexAI | `vertex_ai/meta/llama-3.2-90b-vision-instruct-maas` | 128k | $0.00 | $0.00 | 
| Google AI Studio | `gemini/gemini-2.0-flash-live-001` | 1,048,576 | $0.35 | $1.5 | 
| Google AI Studio | `gemini/gemini-2.5-flash-lite` | 1,048,576 | $0.1 | $0.4 | 
| VertexAI | `vertex_ai/gemini-2.0-flash-lite-001` | 1,048,576 | $0.35 | $1.5 | 
| OpenAI | `gpt-4o-realtime-preview-2025-06-03` | 128k | $5 | $20 |

#### 기능

- **[Lambda AI](../../docs/providers/lambda_ai)**
    - 새 LLM API provider - [PR #12817](https://github.com/BerriAI/litellm/pull/12817)
- **[Github Copilot](../../docs/providers/github_copilot)**
    - 동적 엔드포인트 지원 - [PR #12827](https://github.com/BerriAI/litellm/pull/12827)
- **[Morph](../../docs/providers/morph)**
    - 새 LLM API provider - [PR #12821](https://github.com/BerriAI/litellm/pull/12821)
- **[Groq](../../docs/providers/groq)**
    - 지원 중단된 groq/qwen-qwq-32b 제거 - [PR #12832](https://github.com/BerriAI/litellm/pull/12831)
- **[Recraft](../../docs/providers/recraft)**
    - 새 이미지 생성 API - [PR #12832](https://github.com/BerriAI/litellm/pull/12832)
    - 새 이미지 편집 API - [PR #12874](https://github.com/BerriAI/litellm/pull/12874)
- **[Azure OpenAI](../../docs/providers/azure/azure)**
    - 하드코딩된 환경 변수 없이 DefaultAzureCredential 지원 - [PR #12841](https://github.com/BerriAI/litellm/pull/12841)
- **[Hyperbolic](../../docs/providers/hyperbolic)**
    - 새 LLM API provider - [PR #12826](https://github.com/BerriAI/litellm/pull/12826)
- **[OpenAI](../../docs/providers/openai)**
    - `/realtime` API - intent 쿼리 파라미터를 그대로 전달 - [PR #12838](https://github.com/BerriAI/litellm/pull/12838)
- **[Bedrock](../../docs/providers/bedrock)**
    - Amazon Nova Canvas 인페인팅 지원 추가 - [PR #12949](https://github.com/BerriAI/litellm/pull/12949) s/o @[SantoshDhaladhuli](https://github.com/SantoshDhaladhuli)

#### 버그
- **Gemini ([Google AI Studio](../../docs/providers/gemini) + [VertexAI](../../docs/providers/vertex))**
    - 동기 호출에서 file descriptor가 누수되는 오류 수정 - [PR #12824](https://github.com/BerriAI/litellm/pull/12824)
- **IBM Watsonx**
    - tool choice에 올바른 파라미터 이름 사용 - [PR #9980](https://github.com/BerriAI/litellm/pull/9980)
- **[Anthropic](../../docs/providers/anthropic)**
    - 지원되는 모델에 대해서만 ‘reasoning_effort’ 표시 - [PR #12847](https://github.com/BerriAI/litellm/pull/12847)
    - tool call 요청의 $id 및 $schema 처리(Anthropic API가 더 이상 이를 허용하지 않음) - [PR #12959](https://github.com/BerriAI/litellm/pull/12959)
- **[Openrouter](../../docs/providers/openrouter)**
    - non-anthropic 모델에서 cache_control 플래그 필터링(claude code에서 사용할 수 있게 함) https://github.com/BerriAI/litellm/pull/12850
- **[Gemini](../../docs/providers/gemini)**
    - Open AI 호환성을 위해 Gemini tool_call_id 단축 - [PR #12941](https://github.com/BerriAI/litellm/pull/12941) s/o @[tonga54](https://github.com/tonga54)

---

## LLM API Endpoints

#### 기능

- **[Passthrough endpoints](../../docs/pass_through/)**
    - key/user/team 비용 추적을 OSS로 제공 - [PR #12847](https://github.com/BerriAI/litellm/pull/12847)
- **[/v1/models](../../docs/providers/passthrough)**
    - API 응답의 일부로 fallback models 반환 - [PR #12811](https://github.com/BerriAI/litellm/pull/12811) s/o @[murad-khafizov](https://github.com/murad-khafizov)
- **[/vector_stores](../../docs/providers/passthrough)**
    - 권한 관리를 OSS로 제공 - [PR #12990](https://github.com/BerriAI/litellm/pull/12990)

#### 버그
1. `/batches`
    1. 비용 추적 검사 중 유효하지 않은 batch 건너뛰기(이전에는 모든 검사가 중단됨) - [PR #12782](https://github.com/BerriAI/litellm/pull/12782)
2. `/chat/completions`
    1. .acompletion()의 비동기 retryer 수정 - [PR #12886](https://github.com/BerriAI/litellm/pull/12886)

---

## [MCP Gateway](../../docs/mcp)

#### 기능
- **[Permission Management](../../docs/mcp#grouping-mcps-access-groups)**
    - key/team별 권한 관리를 OSS로 제공 - [PR #12988](https://github.com/BerriAI/litellm/pull/12988)
- **[MCP Alias](../../docs/mcp#mcp-aliases)**
    - mcp server aliases 지원(Cursor에서 긴 mcp server 이름을 호출할 때 유용) - [PR #12994](https://github.com/BerriAI/litellm/pull/12994)
- **Header Propagation**
    - 클라이언트에서 백엔드 MCP로 헤더 전달 지원(개인 access token을 백엔드 MCP로 보낼 때 유용) - [PR #13003](https://github.com/BerriAI/litellm/pull/13003)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능
- **사용법**
    - model group별 사용량 보기 지원 - [PR #12890](https://github.com/BerriAI/litellm/pull/12890)
- **가상 키**
    - `/key/generate`에 새 `key_type` 필드 추가 - 키가 LLM API와 Management routes 중 무엇을 호출할 수 있는지 지정 가능 - [PR #12909](https://github.com/BerriAI/litellm/pull/12909)
- **모델**
    - UI에 ‘auto router’ 추가 - [PR #12960](https://github.com/BerriAI/litellm/pull/12960)
    - UI에 전역 retry policy 표시 - [PR #12969](https://github.com/BerriAI/litellm/pull/12969)
    - 생성 + 업데이트에 model-level guardrails 추가 - [PR #13006](https://github.com/BerriAI/litellm/pull/13006)

#### 버그
- **SSO**
    - SSO가 활성화된 경우 logout 수정 - [PR #12703](https://github.com/BerriAI/litellm/pull/12703)
    - ui_access_mode가 업데이트될 때 SSO reset 수정 - [PR #13011](https://github.com/BerriAI/litellm/pull/13011)
- **가드레일**
    - team 편집 시 올바른 guardrails 표시 - [PR #12823](https://github.com/BerriAI/litellm/pull/12823)
- **가상 키**
    - key 재생성 시 업데이트된 token 가져오기 - [PR #12788](https://github.com/BerriAI/litellm/pull/12788)
    - key injection 관련 CVE 수정 - [PR #12840](https://github.com/BerriAI/litellm/pull/12840)
---

## 로깅 / Guardrail 통합 {#logging--guardrail-integrations}

#### 기능
- **[Google Cloud Model Armor](../../docs/proxy/guardrails/model_armor)**
    - 새 guardrail 문서화 - [PR #12492](https://github.com/BerriAI/litellm/pull/12492)
- **[Pillar Security](../../docs/proxy/guardrails/pillar_security)**
    - 새 LLM Guardrail - [PR #12791](https://github.com/BerriAI/litellm/pull/12791)
- **CloudZero**
    - spend를 cloudzero로 내보낼 수 있도록 허용 - [PR #12908](https://github.com/BerriAI/litellm/pull/12908)
- **Model-level 가드레일**
    - model-level guardrails 지원 - [PR #12968](https://github.com/BerriAI/litellm/pull/12968)

#### 버그
- **[Prometheus](../../docs/proxy/prometheus)**
    - tag-based metrics에 tag가 설정된 경우 `[tag]=false` 수정 - [PR #12916](https://github.com/BerriAI/litellm/pull/12916)
- **[가드레일 AI](../../docs/proxy/guardrails/guardrails_ai)**
    - “fix” guards 사용을 허용하도록 ‘validatedOutput’ 사용 - [PR #12891](https://github.com/BerriAI/litellm/pull/12891) s/o @[DmitriyAlergant](https://github.com/DmitriyAlergant)

---

## 성능 / 로드밸런싱 / 안정성 개선

#### 기능
- **[Auto-Router](../../docs/proxy/auto_routing)**
    - `semantic-router` 기반의 새 auto-router - [PR #12955](https://github.com/BerriAI/litellm/pull/12955)

#### 버그
- **forward_clientside_headers**
    - 헤더에서 `content-length` 필터링(백엔드 요청이 멈추는 원인) - [PR #12886](https://github.com/BerriAI/litellm/pull/12886/files)
- **Message Redaction**
    - coroutine object를 pickle할 수 없는 오류 수정 - [PR #13005](https://github.com/BerriAI/litellm/pull/13005)
---

## 일반 Proxy 개선

#### 기능
- **벤치마크**
    - litellm proxy 벤치마크 업데이트(p50, p90, p99 오버헤드) - [PR #12842](https://github.com/BerriAI/litellm/pull/12842)
- **Request Headers**
    - 새 `x-litellm-num-retries` request header 추가 
- **Swagger**
    - custom root paths에서 local swagger 지원 - [PR #12911](https://github.com/BerriAI/litellm/pull/12911)
- **Health**
    - LiteLLM Proxy가 수행한 health checks에 대해 비용 추적 + tags 추가 - [PR #12880](https://github.com/BerriAI/litellm/pull/12880)
#### 버그

- **Proxy Startup**
    - 시작 시 team member budget이 None이면 시작이 차단되던 문제 수정 - [PR #12843](https://github.com/BerriAI/litellm/pull/12843)
- **Docker**
    - non-root docker를 chain guard image로 이동(취약점 감소) - [PR #12707](https://github.com/BerriAI/litellm/pull/12707)
    - Docker img에 azure-keyvault==4.2.0 추가 - [PR #12873](https://github.com/BerriAI/litellm/pull/12873)
- **별도 Health App**
    - supervisord를 통해 cmd args 전달(docker에서도 user config가 계속 작동하게 함) - [PR #12871](https://github.com/BerriAI/litellm/pull/12871)
- **Swagger**
    - DOMPurify 버전 상향(취약점 수정) - [PR #12911](https://github.com/BerriAI/litellm/pull/12911)
    - local swagger bundle 복원(air gapped env.에서 swagger가 작동하도록 함) - [PR #12911](https://github.com/BerriAI/litellm/pull/12911)
- **Request Headers**
    - ‘user_header_name’ 필드 검사를 대소문자 구분 없이 수행(OpenWebUi의 customer budget enforcement 수정) - [PR #12950](https://github.com/BerriAI/litellm/pull/12950)
- **Spend로그**
    - custom_llm_provider가 None일 때 DB에 쓰기 실패하는 문제 수정 - [PR #13001](https://github.com/BerriAI/litellm/pull/13001)

---

## 새 기여자
* @magicalne 님이 https://github.com/BerriAI/litellm/pull/12804 에서 첫 기여를 했습니다.
* @pavangudiwada 님이 https://github.com/BerriAI/litellm/pull/12798 에서 첫 기여를 했습니다.
* @mdiloreto 님이 https://github.com/BerriAI/litellm/pull/12707 에서 첫 기여를 했습니다.
* @murad-khafizov 님이 https://github.com/BerriAI/litellm/pull/12811 에서 첫 기여를 했습니다.
* @eagle-p 님이 https://github.com/BerriAI/litellm/pull/12791 에서 첫 기여를 했습니다.
* @apoorv-sharma 님이 https://github.com/BerriAI/litellm/pull/12920 에서 첫 기여를 했습니다.
* @SantoshDhaladhuli 님이 https://github.com/BerriAI/litellm/pull/12949 에서 첫 기여를 했습니다.
* @tonga54 님이 https://github.com/BerriAI/litellm/pull/12941 에서 첫 기여를 했습니다.
* @sings-to-bees-on-wednesdays 님이 https://github.com/BerriAI/litellm/pull/12950 에서 첫 기여를 했습니다.

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.74.7-stable...v1.74.9.rc-draft)**
