---
title: "v1.75.5-stable - Redis 지연 시간 개선"
slug: "v1-75-5"
date: 2025-08-10T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.75.5-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.75.5.post2
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Redis - 지연 시간 개선** - Redis가 활성화된 경우 P99 지연 시간을 50% 줄입니다.
- **Responses API 세션 관리** - 이미지가 포함된 Responses API 세션 관리를 지원합니다.
- **Oracle Cloud Infrastructure** - Oracle Cloud Infrastructure의 모델을 호출할 수 있는 새 LLM 제공자입니다.
- **Digital Ocean's Gradient AI** - Digital Ocean's Gradient AI 플랫폼의 모델을 호출할 수 있는 새 LLM 제공자입니다.

---

### 업그레이드 위험 {#risk-of-upgrade}

pip package에서 proxy를 빌드하는 경우 업그레이드를 보류하는 것이 좋습니다. 이 버전은 DB 관리를 위한 기본값을 `prisma migrate deploy`로 변경합니다. DB를 재설정하지 않으므로 더 안전하지만, 수동 `prisma generate` 단계가 필요합니다.

Docker image 사용자는 이 변경의 영향을 받지 **않습니다**.

---

## Redis 지연 시간 개선 {#redis-latency-improvements}

<Image 
  img={require('../../img/release_notes/faster_caching_calls.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

이번 릴리스는 Redis 요청에 in-memory caching을 추가해 트래픽이 많은 환경에서 더 빠른 응답 시간을 제공합니다. 이제 LiteLLM instance는 Redis를 확인하기 전에 in-memory cache에서 cache hit 여부를 먼저 확인합니다. cache hit 시 LLM API 호출의 캐싱 관련 지연 시간이 100ms에서 1ms 미만으로 줄어듭니다.

---

## 이미지가 포함된 Responses API 세션 관리 {#responses-api-session-management-w-images}

<Image 
  img={require('../../img/release_notes/responses_api_session_mgt_images.jpg')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

LiteLLM은 이제 이미지가 포함된 Responses API 요청의 세션 관리를 지원합니다. 이는 Responses API로 대화 상태를 추적하는 chatbot 같은 use case에 유용합니다. LiteLLM 세션 관리는 Anthropic, Bedrock, OpenAI 등을 포함한 **모든** LLM API에서 동작합니다. LiteLLM 세션 관리는 요청 및 응답 콘텐츠를 사용자가 지정할 수 있는 s3 bucket에 저장하는 방식으로 동작합니다.

---


## 신규 모델 / 업데이트된 모델 {#new-model-updated-model}

#### 신규 모델 지원

| 제공자    | 모델                                  | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | 
| Bedrock | `bedrock/us.anthropic.claude-opus-4-1-20250805-v1:0` | 200k | $15 | $75 |
| Bedrock | `bedrock/openai.gpt-oss-20b-1:0` | 200k | 0.07 | 0.3 |
| Bedrock | `bedrock/openai.gpt-oss-120b-1:0` | 200k | 0.15 | 0.6 |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/glm-4p5` | 128k | 0.55 | 2.19 |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/glm-4p5-air` | 128k | 0.22 | 0.88 |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/gpt-oss-120b` | 131072 | 0.15 | 0.6 |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/gpt-oss-20b` | 131072 | 0.05 | 0.2 |
| Groq | `groq/openai/gpt-oss-20b` | 131072 | 0.1 | 0.5 |
| Groq | `groq/openai/gpt-oss-120b` | 131072 | 0.15 | 0.75 |
| OpenAI | `openai/gpt-5` | 400k | 1.25 | 10 | 
| OpenAI | `openai/gpt-5-2025-08-07` | 400k | 1.25 | 10 | 
| OpenAI | `openai/gpt-5-mini` | 400k | 0.25 | 2 |
| OpenAI | `openai/gpt-5-mini-2025-08-07` | 400k | 0.25 | 2 | 
| OpenAI | `openai/gpt-5-nano` | 400k | 0.05 | 0.4 | 
| OpenAI | `openai/gpt-5-nano-2025-08-07` | 400k | 0.05 | 0.4 | 
| OpenAI | `openai/gpt-5-chat` | 400k | 1.25 | 10 | 
| OpenAI | `openai/gpt-5-chat-latest` | 400k | 1.25 | 10 | 
| Azure | `azure/gpt-5` | 400k | 1.25 | 10 | 
| Azure | `azure/gpt-5-2025-08-07` | 400k | 1.25 | 10 | 
| Azure | `azure/gpt-5-mini` | 400k | 0.25 | 2 | 
| Azure | `azure/gpt-5-mini-2025-08-07` | 400k | 0.25 | 2 | 
| Azure | `azure/gpt-5-nano-2025-08-07` | 400k | 0.05 | 0.4 | 
| Azure | `azure/gpt-5-nano` | 400k | 0.05 | 0.4 | 
| Azure | `azure/gpt-5-chat` | 400k | 1.25 | 10 | 
| Azure | `azure/gpt-5-chat-latest` | 400k | 1.25 | 10 | 

#### 기능

- **[OCI](../../docs/providers/oci)**
    - 새 LLM 제공자 - [PR #13206](https://github.com/BerriAI/litellm/pull/13206)
- **[JinaAI](../../docs/providers/jina_ai)**
    - multimodal embedding models 지원 - [PR #13181](https://github.com/BerriAI/litellm/pull/13181)
- **GPT-5 ([OpenAI](../../docs/providers/openai)/[Azure](../../docs/providers/azure))**
    - temperature에 대한 drop_params 지원 - [PR #13390](https://github.com/BerriAI/litellm/pull/13390)
    - max_tokens를 max_completion_tokens에 매핑 - [PR #13390](https://github.com/BerriAI/litellm/pull/13390)
- **[Anthropic](../../docs/providers/anthropic)**
    - model cost map에 claude-opus-4-1 추가 - [PR #13384](https://github.com/BerriAI/litellm/pull/13384)
- **[OpenRouter](../../docs/providers/openrouter)**
    - model cost map에 gpt-oss 추가 - [PR #13442](https://github.com/BerriAI/litellm/pull/13442)
- **[Cerebras](../../docs/providers/cerebras)**
    - model cost map에 gpt-oss 추가 - [PR #13442](https://github.com/BerriAI/litellm/pull/13442)
- **[Azure](../../docs/providers/azure)**
    - o-series models에서 ‘temperature’에 대한 drop params 지원 - [PR #13353](https://github.com/BerriAI/litellm/pull/13353)
- **[GradientAI](../../docs/providers/gradient_ai)**
    - 새 LLM 제공자 - [PR #12169](https://github.com/BerriAI/litellm/pull/12169)

#### 버그

- **[OpenAI](../../docs/providers/openai)**
    - ‘service_tier’ 및 ‘safety_identifier’를 지원되는 responses api params로 추가 - [PR #13258](https://github.com/BerriAI/litellm/pull/13258)
    - 4o-mini의 web search 가격 수정 - [PR #13269](https://github.com/BerriAI/litellm/pull/13269)
- **[Mistral](../../docs/providers/mistral)**
    - mistral 호출 시 $id 및 $schema fields 처리 - [PR #13389](https://github.com/BerriAI/litellm/pull/13389)
---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능

- `/responses` 
    - 이미지 지원이 포함된 Responses API 세션 처리 - [PR #13347](https://github.com/BerriAI/litellm/pull/13347)
    - input에 ResponseReasoningItem이 포함된 경우 실패하던 문제 수정 - [PR #13465](https://github.com/BerriAI/litellm/pull/13465)
    - custom tools 지원 - [PR #13418](https://github.com/BerriAI/litellm/pull/13418)

#### 버그

- `/chat/completions` 
    - completion_token_details usage object에서 ‘text’ tokens가 누락되는 문제 수정 - [PR #13234](https://github.com/BerriAI/litellm/pull/13234)
    - (SDK) tool이 pydantic object인 경우 처리 - [PR #13274](https://github.com/BerriAI/litellm/pull/13274)
    - streaming usage object에 비용 포함 - [PR #13418](https://github.com/BerriAI/litellm/pull/13418)
    - /chat/completion에서 none fields 제외 - n8n과 함께 사용할 수 있도록 허용 - [PR #13320](https://github.com/BerriAI/litellm/pull/13320)
- `/responses` 
    - non-openai models(gemini/anthropic)의 response에서 function call 변환 - [PR #13260](https://github.com/BerriAI/litellm/pull/13260)
    - model groups에서 발생하는 unsupported operand error 수정 - [PR #13293](https://github.com/BerriAI/litellm/pull/13293)
    - streaming responses에 대한 Responses api 세션 관리 - [PR #13396](https://github.com/BerriAI/litellm/pull/13396)
- `/v1/messages`
    - litellm claude code count tokens 추가 - [PR #13261](https://github.com/BerriAI/litellm/pull/13261)
- `/vector_stores`
    - vector store 생성/검색 오류 수정 - [PR #13285](https://github.com/BerriAI/litellm/pull/13285)
---

## [MCP Gateway](../../docs/mcp)

#### 기능

- internal users에 대한 route check 추가 - [PR #13350](https://github.com/BerriAI/litellm/pull/13350)
- MCP 가드레일 - docs - [PR #13392](https://github.com/BerriAI/litellm/pull/13392)


#### 버그

- bearer token servers용 UI auth 수정 - [PR #13312](https://github.com/BerriAI/litellm/pull/13312)
- mcp tool retrieval에서 access group 허용 - [PR #13425](https://github.com/BerriAI/litellm/pull/13425)


---

## 관리 엔드포인트 / UI {#management-endpoints-ui}

#### 기능

- **Teams(팀)**
    - keys가 있는 teams에 대한 team 삭제 check 추가 - [PR #12953](https://github.com/BerriAI/litellm/pull/12953)
- **모델**
    - key/team별 model alias 설정 기능 추가 - [PR #13276](https://github.com/BerriAI/litellm/pull/13276)
    - model cost map에서 model pricing을 다시 로드하는 새 버튼 추가 - [PR #13464](https://github.com/BerriAI/litellm/pull/13464), [PR #13470](https://github.com/BerriAI/litellm/pull/13470)
- **Keys(키)**
    - service account keys 생성 시 ‘team’ field를 필수로 설정 - [PR #13302](https://github.com/BerriAI/litellm/pull/13302)
    - non-enterprise users에게 key-based logging settings를 비활성화 표시 - ‘logging’ 전체 지원 여부에 대한 혼란 방지 - [PR #13431](https://github.com/BerriAI/litellm/pull/13431)
- **Navbar(탐색 모음)**
    - LiteLLM admin UI의 logo customization 추가 - [PR #12958](https://github.com/BerriAI/litellm/pull/12958)
- **로그**
    - logs + session page에 token breakdowns 추가 - [PR #13357](https://github.com/BerriAI/litellm/pull/13357)
- **사용법**
    - DB에 large entries가 있어도 사용법 Page가 로드되도록 보장 - [PR #13400](https://github.com/BerriAI/litellm/pull/13400)
- **Test Key Page(테스트 키 페이지)**
    - /chat/completions 및 /responses용 이미지 업로드 허용 - [PR #13445](https://github.com/BerriAI/litellm/pull/13445)
- **MCP**
    - local storage auth에 auth tokens 추가 - [PR #13473](https://github.com/BerriAI/litellm/pull/13473)

#### 버그

- **Custom Root Path(사용자 지정 루트 경로)**
    - SSO가 활성화된 경우 login route 수정 - [PR #13267](https://github.com/BerriAI/litellm/pull/13267)
- **Customers/End-users(고객/최종 사용자)**
    - end user가 예산을 초과해도 /v1/models 호출 허용 - customer가 예산을 초과해도 OpenWebUI에서 model listing이 동작하도록 허용 - [PR #13320](https://github.com/BerriAI/litellm/pull/13320)
- **Teams(팀)**
    - user가 team에서 제거될 때 user - team membership 제거 - [PR #13433](https://github.com/BerriAI/litellm/pull/13433)
- **Errors(오류)**
    - Logging and Alerts page에서 network errors를 user에게 표시 - [PR #13427](https://github.com/BerriAI/litellm/pull/13427)
- **Model Hub(모델 허브)**
    - base model이 설정된 경우 azure models의 pricing 표시 - [PR #13418](https://github.com/BerriAI/litellm/pull/13418)
---

## 로깅 / Guardrail 통합 {#logging-guardrail-integrations}

#### 기능

- **Bedrock 가드레일**
    - bedrock guardrails error message에서 민감한 정보 마스킹 - [PR #13356](https://github.com/BerriAI/litellm/pull/13356)
- **Standard Logging Payload(표준 로깅 페이로드)**
    - ‘can’t register atextexit’ 버그 수정 - [PR #13436](https://github.com/BerriAI/litellm/pull/13436)

#### 버그

- **Braintrust**
    - braintrust callback base url 설정 허용 - [PR #13368](https://github.com/BerriAI/litellm/pull/13368)
- **OTEL**
    - pre_call hook latency 추적 - [PR #13362](https://github.com/BerriAI/litellm/pull/13362)

---

## 성능 / 로드 밸런싱 / 안정성 개선 {#performance-loadbalancing-reliability-improvements}

#### 기능

- **Team-BYOK models(Team-BYOK 모델)**
    - wildcard model 지원 추가 - [PR #13278](https://github.com/BerriAI/litellm/pull/13278)
- **캐싱**
    - caching용 GCP IAM auth 지원 - [PR #13275](https://github.com/BerriAI/litellm/pull/13275)
- **Latency(지연 시간)**
    - redis가 활성화된 경우 p99 latency를 50% 감소 - tpm/rpm limits가 설정된 경우에만 model usage 업데이트 - [PR #13362](https://github.com/BerriAI/litellm/pull/13362)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

#### 기능

- **모델**
    - /v1/models/\{model_id\} retrieval 지원 - [PR #13268](https://github.com/BerriAI/litellm/pull/13268)
- **Multi-instance(다중 인스턴스)**
    - disable_llm_api_endpoints가 동작하도록 보장 - [PR #13278](https://github.com/BerriAI/litellm/pull/13278)
- **로그**
    - apscheduler log suppress 추가 - [PR #13299](https://github.com/BerriAI/litellm/pull/13299)
- **Helm**
    - migrations job template에 labels 추가 - [PR #13343](https://github.com/BerriAI/litellm/pull/13343) s/o [@unique-jakub](https://github.com/unique-jakub)

#### 버그

- **Non-root image(Non-root 이미지)**
    - migration용 non-root image 수정 - [PR #13379](https://github.com/BerriAI/litellm/pull/13379)
- **Get Routes(GET 라우트)**
    - fastapi-offline 사용 시 get routes 로드 - [PR #13466](https://github.com/BerriAI/litellm/pull/13466)
- **Health checks(상태 확인)**
    - Langfuse health checks용 고유 trace IDs 생성 - [PR #13468](https://github.com/BerriAI/litellm/pull/13468)
- **Swagger**
    - /chat/completions에서 Swagger 사용 허용 - [PR #13469](https://github.com/BerriAI/litellm/pull/13469)
- **Auth**
    - model access groups에서 JWTs access가 동작하지 않는 문제 수정 - [PR #13474](https://github.com/BerriAI/litellm/pull/13474)
    
---

## 새 기여자 {#new-contributors}

* @bbartels님이 https://github.com/BerriAI/litellm/pull/13244 에서 첫 기여를 했습니다.
* @breno-aumo님이 https://github.com/BerriAI/litellm/pull/13206 에서 첫 기여를 했습니다.
* @pascalwhoop님이 https://github.com/BerriAI/litellm/pull/13122 에서 첫 기여를 했습니다.
* @ZPerling님이 https://github.com/BerriAI/litellm/pull/13045 에서 첫 기여를 했습니다.
* @zjx20님이 https://github.com/BerriAI/litellm/pull/13181 에서 첫 기여를 했습니다.
* @edwarddamato님이 https://github.com/BerriAI/litellm/pull/13368 에서 첫 기여를 했습니다.
* @msannan2님이 https://github.com/BerriAI/litellm/pull/12169 에서 첫 기여를 했습니다.


## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.74.15-stable...v1.75.5-stable.rc-draft)** {#full-changelog}
