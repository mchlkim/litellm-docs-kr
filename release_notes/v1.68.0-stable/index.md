---
title: v1.68.0-stable
slug: v1.68.0-stable
date: 2025-05-03T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
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
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.68.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.68.0.post1
```
</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

LiteLLM v1.68.0-stable이 곧 공개됩니다. 이번 릴리스의 주요 내용은 다음과 같습니다.

- **Bedrock Knowledge Base**: 이제 모든 LiteLLM 모델에서 `/chat/completion` 또는 `/responses` API를 통해 Bedrock Knowledge Base를 쿼리할 수 있습니다.
- **Rate Limits**: 이번 릴리스는 여러 인스턴스 전반에서 정확한 속도 제한을 제공하며, 높은 트래픽에서도 spillover를 최대 10개 추가 요청으로 줄입니다.
- **Meta Llama API**: Meta Llama API 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/meta_llama)
- **LlamaFile**: LlamaFile 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/llamafile)

## `Bedrock Knowledge Base`(Vector Store) {#bedrock-knowledge-base-vector-store}

<Image img={require('../../img/release_notes/bedrock_kb.png')}/>
<br/>

이번 릴리스는 LiteLLM에 Bedrock vector store(knowledge base) 지원을 추가합니다. 이 업데이트로 다음을 할 수 있습니다.

- 모든 LiteLLM 지원 모델에서 OpenAI `/chat/completions` spec으로 Bedrock vector store를 사용할 수 있습니다.
- LiteLLM UI 또는 API를 통해 사용 가능한 모든 vector store를 볼 수 있습니다.
- 특정 모델에서 vector store가 항상 활성화되도록 구성할 수 있습니다.
- LiteLLM 로그에서 vector store 사용량을 추적할 수 있습니다.

다음 릴리스에서는 vector store에 대해 key, user, team, org 권한을 설정할 수 있도록 할 계획입니다.

[여기에서 자세히 읽기](https://docs.litellm.ai/docs/completion/knowledgebase)

## Rate Limiting {#rate-limiting}

<Image img={require('../../img/multi_instance_rate_limiting.png')}/>
<br/>


이번 릴리스는 key/user/team 전반에 정확한 multi-instance rate limiting을 제공합니다. 핵심 엔지니어링 변경 사항은 아래와 같습니다.

- **변경 사항**: 이제 인스턴스가 cache value를 설정하는 대신 증가시킵니다. 각 요청마다 Redis를 호출하지 않도록 0.01초마다 동기화합니다.
- **정확도**: 테스트에서 높은 트래픽(100 RPS, 인스턴스 3개) 기준 예상치 대비 최대 spillover가 10개 요청으로 나타났습니다. 기존에는 189개 요청 spillover였습니다.
- **성능**: 로드 테스트에서 높은 트래픽 시 median response time이 100ms 줄어드는 것으로 확인되었습니다.

현재 이 기능은 feature flag 뒤에 있으며, 다음 주까지 기본값으로 전환할 계획입니다. 지금 활성화하려면 다음 환경 변수를 추가하면 됩니다.

```
export LITELLM_RATE_LIMIT_ACCURACY=true
```

[여기에서 자세히 읽기](../../docs/proxy/users#beta-multi-instance-rate-limiting)



## 신규 모델 / 업데이트된 모델 {#new--updated-models}
- **Gemini ([VertexAI](https://docs.litellm.ai/docs/providers/vertex#usage-with-litellm-proxy-server) + [Google AI Studio](https://docs.litellm.ai/docs/providers/gemini))**
    - 더 많은 json schema - openapi schema 변환 edge case 처리 [PR](https://github.com/BerriAI/litellm/pull/10351)
    - Tool calls - gemini tool calling 응답에서 `finish_reason="tool_calls"` 반환 [PR](https://github.com/BerriAI/litellm/pull/10485)
- **[VertexAI](../../docs/providers/vertex#metallama-api)**
    - Meta/llama-4 모델 지원 [PR](https://github.com/BerriAI/litellm/pull/10492)
    - Meta/llama3 - content 안의 tool call result 처리 [PR](https://github.com/BerriAI/litellm/pull/10492)
    - Meta/* - tool calling 응답에서 `finish_reason="tool_calls"` 반환 [PR](https://github.com/BerriAI/litellm/pull/10492)
- **[Bedrock](../../docs/providers/bedrock#litellm-proxy-usage)**
    - [Image Generation](../../docs/providers/bedrock#image-generation) - 새로운 `stable-image-core` 모델 지원 [PR](https://github.com/BerriAI/litellm/pull/10351)
    - [Knowledge Bases](../../docs/completion/knowledgebase) - `/chat/completions`에서 Bedrock knowledge base 사용 지원 [PR](https://github.com/BerriAI/litellm/pull/10413)
    - [Anthropic](../../docs/providers/bedrock#litellm-proxy-usage) - claude-3.7-bedrock 모델에 `supports_pdf_input` 추가 [PR](https://github.com/BerriAI/litellm/pull/9917), [시작하기](../../docs/completion/document_understanding#checking-if-a-model-supports-pdf-input)
- **[OpenAI](../../docs/providers/openai)**
    - OPENAI_API_BASE에 더해 OPENAI_BASE_URL 지원 [PR](https://github.com/BerriAI/litellm/pull/10423)
    - 504 timeout error를 올바르게 다시 발생 [PR](https://github.com/BerriAI/litellm/pull/10462)
    - Native Gpt-4o-mini-tts 지원 [PR](https://github.com/BerriAI/litellm/pull/10462)
- 🆕 **[Meta Llama API](../../docs/providers/meta_llama)** provider [PR](https://github.com/BerriAI/litellm/pull/10451)
- 🆕 **[LlamaFile](../../docs/providers/llamafile)** provider [PR](https://github.com/BerriAI/litellm/pull/10482)

## LLM API 엔드포인트 {#llm-api-endpoints}
- **[Response API](../../docs/response_api)** 
    - multi turn session 처리 수정 [PR](https://github.com/BerriAI/litellm/pull/10415)
- **[Embeddings](../../docs/embedding/supported_embedding)**
    - 캐싱 수정 [PR](https://github.com/BerriAI/litellm/pull/10424)
        - str -> list cache 처리
        - cache hit 시 usage token 반환
        - partial cache hit 시 usage token 결합
- 🆕 **[Vector Stores](../../docs/completion/knowledgebase)**
    - Vector Store Config 정의 허용 [PR](https://github.com/BerriAI/litellm/pull/10448)
    - vector store가 사용된 요청을 위한 새 StandardLoggingPayload field 추가 [PR](https://github.com/BerriAI/litellm/pull/10509)
    - LiteLLM 로그 페이지에 Vector Store / KB Request 표시 [PR](https://github.com/BerriAI/litellm/pull/10514)
    - OpenAI API spec에서 tools와 함께 vector store 사용 허용 [PR](https://github.com/BerriAI/litellm/pull/10516)
- **[MCP](../../docs/mcp)**
    - Non-Admin virtual key가 /mcp route에 접근할 수 있도록 보장 [PR](https://github.com/BerriAI/litellm/pull/10473)
      
      **참고:** 현재 모든 가상 키가 MCP endpoint에 접근할 수 있습니다. key/team/user/org별로 MCP 접근을 제한할 수 있는 기능을 작업 중입니다. 업데이트는 [여기](https://github.com/BerriAI/litellm/discussions/9891)를 확인하세요.
- **Moderations**
    - `/moderations` API에 logging callback 지원 추가 [PR](https://github.com/BerriAI/litellm/pull/10390)


## 비용 추적 / Budget 개선 사항 {#cost-tracking--budget-improvements}
- **[OpenAI](../../docs/providers/openai)**
    - [computer-use-preview](../../docs/providers/openai/responses_api#computer-use) 비용 추적 / pricing [PR](https://github.com/BerriAI/litellm/pull/10422)
    - [gpt-4o-mini-tts](../../docs/providers/openai/text_to_speech) input 비용 추적 [PR](https://github.com/BerriAI/litellm/pull/10462)
- **[Fireworks AI](../../docs/providers/fireworks_ai)** - pricing 업데이트 - 새로운 `0-4b` model pricing tier + llama4 model pricing
- **[Budgets](../../docs/proxy/users#set-budgets)**
    - [Budget reset](../../docs/proxy/users#reset-budgets)이 이제 일/주/월 시작 시점에 실행됩니다. [PR](https://github.com/BerriAI/litellm/pull/10333)
    - key가 threshold를 넘으면 [Soft Budget Alerts](../../docs/proxy/alerting#soft-budget-alerts-for-virtual-keys) 트리거 [PR](https://github.com/BerriAI/litellm/pull/10491)
- **[Token Counting](../../docs/completion/token_usage#3-token_counter)**
    - token undercounting을 방지하도록 token_counter() 함수 재작성 [PR](https://github.com/BerriAI/litellm/pull/10409)


## 관리 엔드포인트 / UI {#management-endpoints--ui}
- **가상 키**
    - key alias 필터링 수정 [PR](https://github.com/BerriAI/litellm/pull/10455)
    - key의 global filtering 지원 [PR](https://github.com/BerriAI/litellm/pull/10455)
    - Pagination - table의 next/back button 클릭 수정 [PR](https://github.com/BerriAI/litellm/pull/10528)
- **모델**
    - Triton - UI에서 model/provider 추가 지원 [PR](https://github.com/BerriAI/litellm/pull/10456)
    - VertexAI - reusable credential로 vertex model을 추가하는 문제 수정 [PR](https://github.com/BerriAI/litellm/pull/10528)
    - LLM Credentials - 쉽게 편집할 수 있도록 기존 credential 표시 [PR](https://github.com/BerriAI/litellm/pull/10519)
- **Teams**
    - team을 다른 org로 재할당 허용 [PR](https://github.com/BerriAI/litellm/pull/10527)
- **Organizations**
    - table에 org budget 표시 수정 [PR](https://github.com/BerriAI/litellm/pull/10528)



## 로깅 / Guardrail 통합 {#logging--guardrail-integrations}
- **[Langsmith](../../docs/observability/langsmith_integration)**
    - [langsmith_batch_size](../../docs/observability/langsmith_integration#local-testing---control-batch-size) param 준수 [PR](https://github.com/BerriAI/litellm/pull/10411)

## 성능 / Loadbalancing / 안정성 개선 {#performance--loadbalancing--reliability-improvements}
- **[Redis](../../docs/proxy/caching)**
    - 모든 redis queue가 주기적으로 flush되도록 보장합니다. request tag를 사용할 때 redis queue size가 무기한 증가하던 문제를 수정합니다. [PR](https://github.com/BerriAI/litellm/pull/10393)
- **[Rate Limits](../../docs/proxy/users#set-rate-limit)**
    - key/team/user/customer 전반에서 [Multi-instance rate limiting](../../docs/proxy/users#beta-multi-instance-rate-limiting) 지원 [PR](https://github.com/BerriAI/litellm/pull/10458), [PR](https://github.com/BerriAI/litellm/pull/10497), [PR](https://github.com/BerriAI/litellm/pull/10500)
- **[Azure OpenAI OIDC](../../docs/providers/azure#entra-id---use-azure_ad_token)**
    - [OIDC Auth](../../docs/providers/azure#entra-id---use-azure_ad_token)에 litellm 정의 param 사용 허용 [PR](https://github.com/BerriAI/litellm/pull/10394)


## 일반 Proxy 개선 사항 {#general-proxy-improvements}
- **Security**
    - [web crawler 차단](../../docs/proxy/enterprise#blocking-web-crawlers) 허용 [PR](https://github.com/BerriAI/litellm/pull/10420)
- **Auth**
    - 기본적으로 [`x-litellm-api-key` header param](../../docs/pass_through/vertex_ai#use-with-virtual-keys)을 지원합니다. 이전 릴리스에서 vertex ai passthrough request에 `x-litellm-api-key`가 사용되지 않던 문제를 수정합니다. [PR](https://github.com/BerriAI/litellm/pull/10392)
    - max budget에 도달한 key가 non-llm api endpoint를 호출할 수 있도록 허용 [PR](https://github.com/BerriAI/litellm/pull/10392)
- 🆕 **LiteLLM Proxy 관리 엔드포인트용 [Python Client Library](../../docs/proxy/management_cli)**
    - 초기 PR [PR](https://github.com/BerriAI/litellm/pull/10445)
    - HTTP request 실행 지원 [PR](https://github.com/BerriAI/litellm/pull/10452)
- **Dependencies**
    - windows에서 uvloop가 필요하지 않도록 변경 [PR](https://github.com/BerriAI/litellm/pull/10483)
