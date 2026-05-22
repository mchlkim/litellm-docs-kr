---
title: "v1.72.0-stable"
slug: "v1-72-0-stable"
date: 2025-05-31T10:00:00
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
docker.litellm.ai/berriai/litellm:main-v1.72.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.72.0
```
</TabItem>
</Tabs>


## 주요 하이라이트 {#key-highlights}

LiteLLM v1.72.0-stable.rc가 공개되었습니다. 이번 릴리스의 주요 내용은 다음과 같습니다.

- **Vector Store 권한**: Key, Team, Organization 수준에서 Vector Store 액세스를 제어합니다.
- **Rate Limiting Sliding Window 지원**: 분 단위 요청 추적으로 Key/Team/User 속도 제한의 정확도를 개선했습니다.
- **Aiohttp Transport 기본 사용**: 이제 Aiohttp transport가 LiteLLM 네트워킹 요청의 기본 transport입니다. 인스턴스당 RPS는 2배 높이고, 중앙값 지연 시간 오버헤드는 40ms 수준으로 제공합니다.
- **Bedrock Agents**: `/chat/completions`, `/response` 엔드포인트로 Bedrock Agents를 호출합니다.
- **Anthropic File API**: LiteLLM을 통해 Anthropic에서 Claude-4로 CSV 파일을 업로드하고 분석합니다.
- **Prometheus**: 최종 사용자(`end_user`)는 더 이상 Prometheus에서 기본 추적되지 않습니다. Prometheus에서 end_users 추적은 이제 opt-in입니다. 이는 `/metrics`의 응답이 너무 커지는 것을 방지하기 위한 조치입니다. [자세히 보기](../../docs/proxy/prometheus#tracking-end_user-on-prometheus)


---

## Vector Store 권한 {#vector-store-permissions}

이번 릴리스는 LiteLLM에서 Keys, Teams, Organizations(엔티티)별로 Vector Store 권한을 관리하는 기능을 지원합니다. 요청이 Vector Store 조회를 시도할 때, 요청 엔티티에 적절한 권한이 없으면 LiteLLM이 이를 차단합니다.

모든 사용자에게 공개하고 싶지 않은 제한된 데이터에 대한 액세스가 필요한 사용 사례에 적합합니다.

다음 주에는 MCP Servers에 대한 권한 관리를 추가할 계획입니다.

---
## Aiohttp Transport 기본 사용 {#aiohttp-transport-used-by-default}

이제 Aiohttp transport가 LiteLLM 네트워킹 요청의 기본 transport입니다. 인스턴스당 RPS는 2배 높이고, 중앙값 지연 시간 오버헤드는 40ms 수준으로 제공합니다. 이 기능은 LiteLLM Cloud에서 일주일 동안 운영되었고, alpha users 테스트도 일주일 동안 거쳤습니다.


문제가 발생하면 다음 방법으로 aiohttp transport 사용을 비활성화할 수 있습니다.

**LiteLLM Proxy에서**

환경 변수에 `DISABLE_AIOHTTP_TRANSPORT=True`를 설정합니다.

```yaml showLineNumbers title="Environment Variable"
export DISABLE_AIOHTTP_TRANSPORT="True"
```

**LiteLLM Python SDK에서**

aiohttp transport를 비활성화하려면 `disable_aiohttp_transport=True`를 설정합니다.

```python showLineNumbers title="Python SDK"
import litellm

litellm.disable_aiohttp_transport = True # default is False, enable this to disable aiohttp transport
result = litellm.completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello, world!"}],
)
print(result)
```

---


## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

- **[Bedrock](../../docs/providers/bedrock)**
    - Bedrock Converse의 동영상 지원 - [PR](https://github.com/BerriAI/litellm/pull/11166)
    - /chat/completions 경로의 InvokeAgents 지원 - [PR](https://github.com/BerriAI/litellm/pull/11239), [시작하기](../../docs/providers/bedrock_agents)
    - AI21 Jamba models 호환성 수정 - [PR](https://github.com/BerriAI/litellm/pull/11233)
    - thinking을 사용하는 Claude에서 중복 maxTokens 파라미터 수정 - [PR](https://github.com/BerriAI/litellm/pull/11181)
- **[Gemini (Google AI Studio + Vertex AI)](https://docs.litellm.ai/docs/providers/gemini)**
    - `parallel_tool_calls` 파라미터를 통한 병렬 tool calling 지원 - [PR](https://github.com/BerriAI/litellm/pull/11125)
    - 모든 Gemini models가 이제 병렬 function calling을 지원 - [PR](https://github.com/BerriAI/litellm/pull/11225)
- **[VertexAI](../../docs/providers/vertex)**
    - codeExecution tool 지원 및 anyOf 처리 - [PR](https://github.com/BerriAI/litellm/pull/11195)
    - /v1/messages에서 Vertex AI Anthropic 지원 - [PR](https://github.com/BerriAI/litellm/pull/11246)
    - Thinking, global regions, 병렬 tool calling 개선 - [PR](https://github.com/BerriAI/litellm/pull/11194)
    - Web Search 지원 [PR](https://github.com/BerriAI/litellm/commit/06484f6e5a7a2f4e45c490266782ed28b51b7db6)
- **[Anthropic](../../docs/providers/anthropic)**
    - 스트리밍에서 thinking blocks 지원 - [PR](https://github.com/BerriAI/litellm/pull/11194)
    - passthrough에서 form-data를 사용하는 Files API 지원 - [PR](https://github.com/BerriAI/litellm/pull/11256)
    - /chat/completion에서 File ID 지원 - [PR](https://github.com/BerriAI/litellm/pull/11256)
- **[xAI](../../docs/providers/xai)**
    - Web Search 지원 [PR](https://github.com/BerriAI/litellm/commit/06484f6e5a7a2f4e45c490266782ed28b51b7db6)
- **[Google AI Studio](../../docs/providers/gemini)**
    - Web Search 지원 [PR](https://github.com/BerriAI/litellm/commit/06484f6e5a7a2f4e45c490266782ed28b51b7db6)
- **[Mistral](../../docs/providers/mistral)**
    - mistral-medium 가격과 context sizes 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/10729)
- **[Ollama](../../docs/providers/ollama)**
    - 스트리밍에서 tool calls 파싱 - [PR](https://github.com/BerriAI/litellm/pull/11171)
- **[Cohere](../../docs/providers/cohere)**
    - Cohere와 Cohere Chat provider 위치 교체 - [PR](https://github.com/BerriAI/litellm/pull/11173)
- **[Nebius AI Studio](../../docs/providers/nebius)**
    - 신규 provider 통합 - [PR](https://github.com/BerriAI/litellm/pull/11143)

## LLM API 엔드포인트 {#llm-api-endpoints}

- **[Image Edits API](../../docs/image_generation)**
    - /v1/images/edits의 Azure 지원 - [PR](https://github.com/BerriAI/litellm/pull/11160)
    - image edits 엔드포인트(OpenAI, Azure)의 비용 추적 - [PR](https://github.com/BerriAI/litellm/pull/11186)
- **[Completions API](../../docs/completion/chat)**
    - /v1/completions에서 Codestral 지연 시간 오버헤드 추적 - [PR](https://github.com/BerriAI/litellm/pull/10879)
- **[Audio Transcriptions API](../../docs/audio/speech)**
    - 날짜가 없는 GPT-4o mini audio preview 가격 - [PR](https://github.com/BerriAI/litellm/pull/11207)
    - audio transcription의 non-default params 지원 - [PR](https://github.com/BerriAI/litellm/pull/11212)
- **[Responses API](../../docs/response_api)**
    - Non-OpenAI models 사용 시 session management 수정 - [PR](https://github.com/BerriAI/litellm/pull/11254)

## 관리 엔드포인트 / UI {#management-endpoints--ui}

- **Vector Stores**
    - LiteLLM Keys, Teams, Organizations의 권한 관리 - [PR](https://github.com/BerriAI/litellm/pull/11213)
    - Vector Store 권한의 UI 표시 - [PR](https://github.com/BerriAI/litellm/pull/11277)
    - Vector Store 액세스 제어 적용 - [PR](https://github.com/BerriAI/litellm/pull/11281)
    - Object permissions 수정 및 QA 개선 - [PR](https://github.com/BerriAI/litellm/pull/11291)
- **Teams**
    - 모델을 선택하지 않았을 때 "All proxy models" 표시 - [PR](https://github.com/BerriAI/litellm/pull/11187)
    - 중복 teamInfo 호출을 제거하고 기존 teamsList 사용 - [PR](https://github.com/BerriAI/litellm/pull/11051)
    - Keys, Teams, Org 페이지의 model tags 표시 개선 - [PR](https://github.com/BerriAI/litellm/pull/11022)
- **SSO/SCIM**
    - UI에 SCIM token을 표시하는 버그 수정 - [PR](https://github.com/BerriAI/litellm/pull/11220)
- **일반 UI**
    - "UI Session Expired. Logging out" 수정 - [PR](https://github.com/BerriAI/litellm/pull/11279)
    - /sso/key/generate를 server root path URL로 전달하는 기능 지원 - [PR](https://github.com/BerriAI/litellm/pull/11165)


## 로깅 / 가드레일 통합 {#logging--가드레일-integrations}

#### 로깅 {#logging}
- **[Prometheus](../../docs/proxy/prometheus)**
    - 최종 사용자는 더 이상 Prometheus에서 기본 추적되지 않습니다. Prometheus에서 end_users 추적은 이제 opt-in입니다. [PR](https://github.com/BerriAI/litellm/pull/11192)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - 성능 개선: "Max langfuse clients reached" 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11285)
- **[Helicone](../../docs/observability/helicone_integration)**
    - Base URL 지원 - [PR](https://github.com/BerriAI/litellm/pull/11211)
- **[Sentry](../../docs/proxy/logging#sentry)**
    - sentry sample rate 설정 추가 - [PR](https://github.com/BerriAI/litellm/pull/10283)

#### 가드레일 {#가드레일}
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - bedrock post guard의 Streaming 지원 - [PR](https://github.com/BerriAI/litellm/pull/11247)
    - Auth parameter persistence 수정 - [PR](https://github.com/BerriAI/litellm/pull/11270)
- **[Pangea 가드레일](../../docs/proxy/guardrails/pangea)**
    - 가드레일 hook에 Pangea provider 추가 - [PR](https://github.com/BerriAI/litellm/pull/10775)


## 성능 / 안정성 개선 {#performance--reliability-improvements}
- **aiohttp Transport**
    - aiohttp.ClientPayloadError 처리 - [PR](https://github.com/BerriAI/litellm/pull/11162)
    - SSL verification settings 지원 - [PR](https://github.com/BerriAI/litellm/pull/11162)
    - 안정성을 위해 httpx==0.27.0으로 롤백 - [PR](https://github.com/BerriAI/litellm/pull/11146)
- **Request Limiting**
    - parallel request limiter v2의 Sliding window 로직 - [PR](https://github.com/BerriAI/litellm/pull/11283)


## 버그 수정 {#bug-fixes}

- **LLM API 수정**
    - get_available_deployment 호출에 누락된 request_kwargs 추가 - [PR](https://github.com/BerriAI/litellm/pull/11202)
    - Azure O-series models 호출 수정 - [PR](https://github.com/BerriAI/litellm/pull/11212)
    - additional_drop_params를 통한 non-OpenAI params 삭제 지원 - [PR](https://github.com/BerriAI/litellm/pull/11246)
    - frequency_penalty에서 repeat_penalty 파라미터로의 매핑 수정 - [PR](https://github.com/BerriAI/litellm/pull/11284)
    - string input에서 embedding cache hits 수정 - [PR](https://github.com/BerriAI/litellm/pull/11211)
- **일반**
    - OIDC provider 개선 및 audience 버그 수정 - [PR](https://github.com/BerriAI/litellm/pull/10054)
    - AZURE_CREDENTIAL의 AzureCredentialType 제한 제거 - [PR](https://github.com/BerriAI/litellm/pull/11272)
    - Langfuse로 민감한 key가 유출되지 않도록 방지 - [PR](https://github.com/BerriAI/litellm/pull/11165)
    - 이미지에 curl이 없을 때 curl을 사용하는 healthcheck test 수정 - [PR](https://github.com/BerriAI/litellm/pull/9737)

## 신규 기여자 {#new-contributors}
* [@agajdosi](https://github.com/agajdosi)가 [#9737](https://github.com/BerriAI/litellm/pull/9737)에서 첫 기여를 했습니다.
* [@ketangangal](https://github.com/ketangangal)가 [#11161](https://github.com/BerriAI/litellm/pull/11161)에서 첫 기여를 했습니다.
* [@Aktsvigun](https://github.com/Aktsvigun)가 [#11143](https://github.com/BerriAI/litellm/pull/11143)에서 첫 기여를 했습니다.
* [@ryanmeans](https://github.com/ryanmeans)가 [#10775](https://github.com/BerriAI/litellm/pull/10775)에서 첫 기여를 했습니다.
* [@nikoizs](https://github.com/nikoizs)가 [#10054](https://github.com/BerriAI/litellm/pull/10054)에서 첫 기여를 했습니다.
* [@Nitro963](https://github.com/Nitro963)가 [#11202](https://github.com/BerriAI/litellm/pull/11202)에서 첫 기여를 했습니다.
* [@Jacobh2](https://github.com/Jacobh2)가 [#11207](https://github.com/BerriAI/litellm/pull/11207)에서 첫 기여를 했습니다.
* [@regismesquita](https://github.com/regismesquita)가 [#10729](https://github.com/BerriAI/litellm/pull/10729)에서 첫 기여를 했습니다.
* [@Vinnie-Singleton-NN](https://github.com/Vinnie-Singleton-NN)가 [#10283](https://github.com/BerriAI/litellm/pull/10283)에서 첫 기여를 했습니다.
* [@trashhalo](https://github.com/trashhalo)가 [#11219](https://github.com/BerriAI/litellm/pull/11219)에서 첫 기여를 했습니다.
* [@VigneshwarRajasekaran](https://github.com/VigneshwarRajasekaran)가 [#11223](https://github.com/BerriAI/litellm/pull/11223)에서 첫 기여를 했습니다.
* [@AnilAren](https://github.com/AnilAren)가 [#11233](https://github.com/BerriAI/litellm/pull/11233)에서 첫 기여를 했습니다.
* [@fadil4u](https://github.com/fadil4u)가 [#11242](https://github.com/BerriAI/litellm/pull/11242)에서 첫 기여를 했습니다.
* [@whitfin](https://github.com/whitfin)가 [#11279](https://github.com/BerriAI/litellm/pull/11279)에서 첫 기여를 했습니다.
* [@hcoona](https://github.com/hcoona)가 [#11272](https://github.com/BerriAI/litellm/pull/11272)에서 첫 기여를 했습니다.
* [@keyute](https://github.com/keyute)가 [#11173](https://github.com/BerriAI/litellm/pull/11173)에서 첫 기여를 했습니다.
* [@emmanuel-ferdman](https://github.com/emmanuel-ferdman)가 [#11230](https://github.com/BerriAI/litellm/pull/11230)에서 첫 기여를 했습니다.

## 데모 인스턴스 {#demo-instance}

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.

- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234

## [Git Diff](https://github.com/BerriAI/litellm/releases)
