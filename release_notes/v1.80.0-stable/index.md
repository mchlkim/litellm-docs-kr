---
title: "v1.80.0-stable - Agent Hub 소개: 에이전트 등록, 게시, 공유"
slug: "v1-80-0"
date: 2025-11-15T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.80.0-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.0
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **🆕 Agent Hub 지원** - 조직에서 에이전트를 등록하고 공개할 수 있습니다.
- **RunwayML Provider** - 동영상 생성, 이미지 생성, text-to-speech를 완전 지원합니다.
- **GPT-5.1 제품군 지원** - OpenAI의 최신 GPT-5.1 및 GPT-5.1-Codex 모델을 Day-0 지원합니다.
- **Prometheus OSS** - 이제 오픈 소스 버전에서도 Prometheus metrics를 사용할 수 있습니다.
- **Vector Store Files API** - 전체 CRUD 작업을 갖춘 OpenAI 호환 Vector Store Files API를 완전 지원합니다.
- **Embeddings Performance** - 공유 세션을 사용하는 router embeddings의 O(1) lookup 최적화가 적용되었습니다.

---

### Agent Hub {#agent-hub}

<Image img={require('../../img/agent_hub_clean.png')} />  

이번 릴리스에서는 조직에서 에이전트를 등록하고 공개할 수 있는 기능을 추가했습니다. 조직 내부에서 만든 에이전트를 사용자가 쉽게 찾을 수 있도록 중앙 위치에서 관리하려는 **Proxy Admins**에게 유용합니다.

흐름은 다음과 같습니다.
1. litellm에 에이전트를 추가합니다.
2. 에이전트를 공개 상태로 전환합니다.
3. 공개 AI Hub 페이지에서 누구나 에이전트를 찾을 수 있게 합니다.

[**Agent Hub 시작하기**](../../docs/proxy/ai_hub)


### 성능 - `/embeddings` p95 지연 시간 13배 감소 {#performance--embeddings-13-lower-p95-latency}

이번 업데이트는 `/embeddings`를 `/chat/completions`와 동일한 최적화 파이프라인으로 라우팅해, 기존에 적용된 모든 네트워킹 최적화의 이점을 받도록 하여 지연 시간을 크게 개선합니다.

### 결과 {#results}

| 지표 | 이전 | 이후 | 개선 |
| --- | --- | --- | --- |
| p95 지연 시간 | 5,700 ms | **430 ms** | −92% (~13배 빠름)** |
| p99 지연 시간 | 7,200 ms | **780 ms** | −89% |
| 평균 지연 시간 | 844 ms | **262 ms** | −69% |
| 중앙값 지연 시간 | 290 ms | **230 ms** | −21% |
| RPS | 1,216.7 | **1,219.7** | **+0.25%** |

### 테스트 구성 {#test-setup}

| 범주 | 사양 |
| --- | --- |
| **부하 테스트** | Locust: 동시 사용자 1,000명, ramp-up 500 |
| **시스템** | 4 vCPUs, 8 GB RAM, worker 4개, instance 4개 |
| **데이터베이스** | PostgreSQL (Redis 미사용) |
| **설정** | [config.yaml](https://gist.github.com/AlexsanderHamir/550791675fd752befcac6a9e44024652) |
| **부하 스크립트** | [no_cache_hits.py](https://gist.github.com/AlexsanderHamir/99d673bf74cdd81fd39f59fa9048f2e8) |

---

### 🆕 RunwayML {#runwayml}

RunwayML의 Gen-4 모델 제품군을 완전히 통합하여 동영상 생성, 이미지 생성, 텍스트 음성 변환을 지원합니다.

**지원 엔드포인트:**
- `/v1/videos` - 동영상 생성 (`Gen-4 Turbo`, `Gen-4 Aleph`, `Gen-3A Turbo`)
- `/v1/images/generations` - 이미지 생성 (Gen-4 Image, Gen-4 Image Turbo)
- `/v1/audio/speech` - 텍스트 음성 변환 (ElevenLabs Multilingual v2)

**빠른 시작:**

```bash showLineNumbers title="Generate Video with RunwayML"
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "runwayml/gen4_turbo",
    "prompt": "A high quality demo video of litellm ai gateway",
    "input_reference": "https://example.com/image.jpg",
    "seconds": 5,
    "size": "1280x720"
}'
```

[RunwayML 시작하기](../../docs/providers/runwayml/videos)

---

### Prometheus Metrics - 오픈 소스 {#prometheus-metrics---open-source}

이제 LiteLLM의 오픈 소스 버전에서 Prometheus metrics를 사용할 수 있습니다. Enterprise 라이선스 없이도 AI Gateway에 대한 포괄적인 관측성을 제공합니다.

**빠른 시작:**

```yaml
litellm_settings:
  success_callback: ["prometheus"]
  failure_callback: ["prometheus"]
```

[Prometheus 시작하기](../../docs/proxy/logging#prometheus)

---

### Vector Store Files API 안정화 {#vector-store-files-api}

완전한 OpenAI 호환 Vector Store Files API가 이제 안정화되어, vector store 안에서 전체 파일 수명 주기 관리를 사용할 수 있습니다.

**지원 엔드포인트:**
- `POST /v1/vector_stores/{vector_store_id}/files` - vector store file 생성
- `GET /v1/vector_stores/{vector_store_id}/files` - vector store files 목록 조회
- `GET /v1/vector_stores/{vector_store_id}/files/{file_id}` - vector store file 조회
- `GET /v1/vector_stores/{vector_store_id}/files/{file_id}/content` - 파일 콘텐츠 조회
- `DELETE /v1/vector_stores/{vector_store_id}/files/{file_id}` - vector store file 삭제
- `DELETE /v1/vector_stores/{vector_store_id}` - vector store 삭제

**빠른 시작:**

```bash showLineNumbers title="Create Vector Store File"
curl --location 'http://localhost:4000/v1/vector_stores/vs_123/files' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "file_id": "file_abc"
}'
```

[Vector Stores 시작하기](../../docs/vector_store_files)

---

## 신규 Providers 및 Endpoints {#new-providers-and-endpoints}

### 신규 Providers {#new-providers}

| Provider | 지원 엔드포인트 | 설명 |
| -------- | ------------------- | ----------- |
| **[RunwayML](../../docs/providers/runwayml/videos)** | `/v1/videos`, `/v1/images/generations`, `/v1/audio/speech` | Gen-4 동영상 생성, 이미지 생성, 텍스트 음성 변환 |

### 신규 LLM API Endpoints {#new-llm-api-endpoints}

| Endpoint | Method | 설명 | 문서 |
| -------- | ------ | ----------- | ------------- |
| `/v1/vector_stores/{vector_store_id}/files` | POST | vector store file 생성 | [문서](../../docs/vector_store_files) |
| `/v1/vector_stores/{vector_store_id}/files` | GET | vector store files 목록 조회 | [문서](../../docs/vector_store_files) |
| `/v1/vector_stores/{vector_store_id}/files/{file_id}` | GET | vector store file 조회 | [문서](../../docs/vector_store_files) |
| `/v1/vector_stores/{vector_store_id}/files/{file_id}/content` | GET | 파일 콘텐츠 조회 | [문서](../../docs/vector_store_files) |
| `/v1/vector_stores/{vector_store_id}/files/{file_id}` | DELETE | vector store file 삭제 | [문서](../../docs/vector_store_files) |
| `/v1/vector_stores/{vector_store_id}` | DELETE | vector store 삭제 | [문서](../../docs/vector_store_files) |

---

## 신규 모델 / 업데이트된 모델 {#new--updated-models}

#### 신규 모델 지원 {#new-model-support}

| Provider | Model | Context Window | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5.1` | 272K | $1.25 | $10.00 | `Reasoning`, `vision`, `PDF input`, `responses API` |
| OpenAI | `gpt-5.1-2025-11-13` | 272K | $1.25 | $10.00 | `Reasoning`, `vision`, `PDF input`, `responses API` |
| OpenAI | `gpt-5.1-chat-latest` | 128K | $1.25 | $10.00 | `Reasoning`, `vision`, `PDF input` |
| OpenAI | `gpt-5.1-codex` | 272K | $1.25 | $10.00 | `Responses API`, `reasoning`, `vision` |
| OpenAI | `gpt-5.1-codex-mini` | 272K | $0.25 | $2.00 | `Responses API`, `reasoning`, `vision` |
| Moonshot | `moonshot/kimi-k2-thinking` | 262K | $0.60 | $2.50 | `Function calling`, `web search`, `reasoning` |
| Mistral | `mistral/magistral-medium-2509` | 40K | $2.00 | $5.00 | `Reasoning`, `function calling` |
| Vertex AI | `vertex_ai/moonshotai/kimi-k2-thinking-maas` | 256K | $0.60 | $2.50 | `Function calling`, `web search` |
| OpenRouter | `openrouter/deepseek/deepseek-v3.2-exp` | 164K | $0.20 | $0.40 | `Function calling`, `prompt caching` |
| OpenRouter | `openrouter/minimax/minimax-m2` | 205K | $0.26 | $1.02 | `Function calling`, `reasoning` |
| OpenRouter | `openrouter/z-ai/glm-4.6` | 203K | $0.40 | $1.75 | `Function calling`, `reasoning` |
| OpenRouter | `openrouter/z-ai/glm-4.6:exacto` | 203K | $0.45 | $1.90 | `Function calling`, `reasoning` |
| Voyage | `voyage/voyage-3.5` | 32K | $0.06 | - | Embeddings |
| Voyage | `voyage/voyage-3.5-lite` | 32K | $0.02 | - | Embeddings |

#### Video Generation 모델 {#video-generation-models}

| Provider | Model | 초당 비용 | 해상도 | 기능 |
| -------- | ----- | --------------- | ----------- | -------- |
| RunwayML | `runwayml/gen4_turbo` | $0.05 | 1280x720, 720x1280 | 텍스트 + 이미지에서 동영상 생성 |
| RunwayML | `runwayml/gen4_aleph` | $0.15 | 1280x720, 720x1280 | 텍스트 + 이미지에서 동영상 생성 |
| RunwayML | `runwayml/gen3a_turbo` | $0.05 | 1280x720, 720x1280 | 텍스트 + 이미지에서 동영상 생성 |

#### Image Generation 모델 {#image-generation-models}

| Provider | Model | 이미지당 비용 | 해상도 | 기능 |
| -------- | ----- | -------------- | ----------- | -------- |
| RunwayML | `runwayml/gen4_image` | $0.05 | 1280x720, 1920x1080 | 텍스트 + 이미지에서 이미지 생성 |
| RunwayML | `runwayml/gen4_image_turbo` | $0.02 | 1280x720, 1920x1080 | 텍스트 + 이미지에서 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/flux-pro/v1.1` | $0.04/image | - | 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/flux/schnell` | $0.003/image | - | 빠른 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/bytedance/seedream/v3/text-to-image` | $0.03/image | - | 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/bytedance/dreamina/v3.1/text-to-image` | $0.03/image | - | 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/ideogram/v3` | $0.06/image | - | 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/imagen4/preview/fast` | $0.02/image | - | 빠른 이미지 생성 |
| Fal.ai | `fal_ai/fal-ai/imagen4/preview/ultra` | $0.06/image | - | 고품질 이미지 생성 |

#### Audio 모델 {#audio-models}

| Provider | Model | 비용 | 기능 |
| -------- | ----- | ---- | -------- |
| RunwayML | `runwayml/eleven_multilingual_v2` | $0.0003/char | 텍스트 음성 변환 |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - reasoning 기능을 포함한 GPT-5.1 제품군 지원 추가 - [PR #16598](https://github.com/BerriAI/litellm/pull/16598)
    - GPT-5.1의 `reasoning_effort='none'` 지원 추가 - [PR #16658](https://github.com/BerriAI/litellm/pull/16658)
    - GPT-5 제품군 모델의 `verbosity` 파라미터 지원 추가 - [PR #16660](https://github.com/BerriAI/litellm/pull/16660)
    - 이미지 생성에서 OpenAI organization 전달 수정 - [PR #16607](https://github.com/BerriAI/litellm/pull/16607)

- **[Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - Gemini 모델의 `reasoning_effort='none'` 지원 추가 - [PR #16548](https://github.com/BerriAI/litellm/pull/16548)
    - 이미지 생성에서 모든 Gemini 이미지 모델 지원 추가 - [PR #16526](https://github.com/BerriAI/litellm/pull/16526)
    - Gemini 이미지 편집 지원 추가 - [PR #16430](https://github.com/BerriAI/litellm/pull/16430)
    - function call arguments에서 non-ASCII 문자가 보존되도록 수정 - [PR #16550](https://github.com/BerriAI/litellm/pull/16550)
    - MCP 자동 실행 시 Gemini conversation format 문제 수정 - [PR #16592](https://github.com/BerriAI/litellm/pull/16592)

- **[Bedrock](../../docs/providers/bedrock)**
    - knowledge base queries 필터링 지원 추가 - [PR #16543](https://github.com/BerriAI/litellm/pull/16543)
    - embeddings에서 동적으로 제공된 `aws_region`이 올바르게 사용되도록 보장 - [PR #16547](https://github.com/BerriAI/litellm/pull/16547)
    - Bedrock Batch 작업의 custom KMS encryption keys 지원 추가 - [PR #16662](https://github.com/BerriAI/litellm/pull/16662)
    - AgentCore의 bearer token authentication 지원 추가 - [PR #16556](https://github.com/BerriAI/litellm/pull/16556)
    - 올바른 streaming 지원을 위해 AgentCore SSE stream iterator를 async로 수정 - [PR #16293](https://github.com/BerriAI/litellm/pull/16293)

- **[Anthropic](../../docs/providers/anthropic)**
    - context management param 지원 추가 - [PR #16528](https://github.com/BerriAI/litellm/pull/16528)
    - Anthropic tools input schema의 `$defs` 보존 수정 - [PR #16648](https://github.com/BerriAI/litellm/pull/16648)
    - token counter에서 Anthropic tool_use 및 tool_result 지원 수정 - [PR #16351](https://github.com/BerriAI/litellm/pull/16351)

- **[Vertex AI](../../docs/providers/vertex_ai)**
    - Vertex Kimi-K2-Thinking 지원 추가 - [PR #16671](https://github.com/BerriAI/litellm/pull/16671)
    - `litellm.rerank()`에 `vertex_credentials` 지원 추가 - [PR #16479](https://github.com/BerriAI/litellm/pull/16479)

- **[Mistral](../../docs/providers/mistral)**
    - Magistral streaming이 reasoning chunks를 내보내도록 수정 - [PR #16434](https://github.com/BerriAI/litellm/pull/16434)

- **[Moonshot (Kimi)](../../docs/providers/moonshot)**
    - Kimi K2 thinking 모델 지원 추가 - [PR #16445](https://github.com/BerriAI/litellm/pull/16445)

- **[SambaNova](../../docs/providers/sambanova)**
    - message content가 list format으로 전달될 때 SambaNova API가 요청을 거부하던 문제 수정 - [PR #16612](https://github.com/BerriAI/litellm/pull/16612)

- **[VLLM](../../docs/providers/vllm)**
    - hosted vllm provider에서 오류를 발생시키는 대신 vllm passthrough config를 사용하도록 수정 - [PR #16537](https://github.com/BerriAI/litellm/pull/16537)
    - success event logging과 함께 VLLM Passthrough 요청에 headers 추가 - [PR #16532](https://github.com/BerriAI/litellm/pull/16532)

- **[Azure](../../docs/providers/azure)**
    - None 값에 대한 Azure auth parameter 처리 개선 - [PR #14436](https://github.com/BerriAI/litellm/pull/14436)

- **[Groq](../../docs/providers/groq)**
    - Groq의 failed chunks 파싱 수정 - [PR #16595](https://github.com/BerriAI/litellm/pull/16595)

- **[Voyage](../../docs/providers/voyage)**
    - Voyage 3.5 및 3.5-lite embeddings 가격과 문서 업데이트 추가 - [PR #16641](https://github.com/BerriAI/litellm/pull/16641)

- **[Fal.ai](../../docs/image_generation)**
    - fal-ai/flux/schnell 지원 추가 - [PR #16580](https://github.com/BerriAI/litellm/pull/16580)
    - model map에 fal ai의 모든 Imagen4 variants 추가 - [PR #16579](https://github.com/BerriAI/litellm/pull/16579)

### 버그 수정 {#bug-fixes}

- **일반**
    - OpenAI 호환 responses에서 null token usage 정리 수정 - [PR #16493](https://github.com/BerriAI/litellm/pull/16493)
    - 제공된 timeout 값이 ClientTimeout.total에 적용되도록 수정 - [PR #16395](https://github.com/BerriAI/litellm/pull/16395)
    - 잘못된 예외에서 잘못된 429 오류가 발생하던 문제 수정 - [PR #16482](https://github.com/BerriAI/litellm/pull/16482)
    - 신규 모델 추가, 중복 모델 삭제, 가격 업데이트 - [PR #16491](https://github.com/BerriAI/litellm/pull/16491)
    - custom LLM provider의 model logging format 업데이트 - [PR #16485](https://github.com/BerriAI/litellm/pull/16485)

---

## LLM API Endpoints {#llm-api-endpoints}

#### 신규 Endpoints {#new-endpoints}

- **[GET /providers](../../docs/proxy/management_endpoints)**
    - providers 목록을 가져오는 GET endpoint 추가 - [PR #16432](https://github.com/BerriAI/litellm/pull/16432)

#### 기능 {#features-1}

- **[Video Generation API](../../docs/video_generation)**
    - 내부 사용자가 video generation routes에 접근할 수 있도록 허용 - [PR #16472](https://github.com/BerriAI/litellm/pull/16472)

- **[Vector Stores API](../../docs/vector_stores)**
    - 전체 CRUD 작업을 갖춘 vector store files 안정 버전 릴리스 - [PR #16643](https://github.com/BerriAI/litellm/pull/16643)
      - `POST /v1/vector_stores/{vector_store_id}/files` - vector store file 생성
      - `GET /v1/vector_stores/{vector_store_id}/files` - vector store files 목록 조회
      - `GET /v1/vector_stores/{vector_store_id}/files/{file_id}` - vector store file 조회
      - `GET /v1/vector_stores/{vector_store_id}/files/{file_id}/content` - 파일 콘텐츠 조회
      - `DELETE /v1/vector_stores/{vector_store_id}/files/{file_id}` - vector store file 삭제
      - `DELETE /v1/vector_stores/{vector_store_id}` - vector store 삭제
    - stream 및 non-stream response 모두에서 사용자가 `search_results`에 접근할 수 있도록 보장 - [PR #16459](https://github.com/BerriAI/litellm/pull/16459)

#### 버그 {#bugs}

- **[Video Generation API](../../docs/video_generation)**
    - `/v1/videos/{video_id}/content`에 GET을 사용하도록 수정 - [PR #16672](https://github.com/BerriAI/litellm/pull/16672)

- **일반**
    - generic exception handling 제거 수정 - [PR #16599](https://github.com/BerriAI/litellm/pull/16599)

---

## Management Endpoint 및 UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **Proxy CLI Auth**
    - add_deployment에서 엄격한 master_key 확인 제거 수정 - [PR #16453](https://github.com/BerriAI/litellm/pull/16453)

- **가상 키**
    - UI - Edit Key Flow에 Tags 추가 - [PR #16500](https://github.com/BerriAI/litellm/pull/16500)
    - UI - Test Key Page에서 선택한 endpoint 기준으로 모델 표시 - [PR #16452](https://github.com/BerriAI/litellm/pull/16452)
    - UI - view 및 update path에 user_alias 노출 - [PR #16669](https://github.com/BerriAI/litellm/pull/16669)

- **모델 + Endpoints**
    - UI - Edit Model에 LiteLLM Params 추가 - [PR #16496](https://github.com/BerriAI/litellm/pull/16496)
    - UI - Add Model에서 backend data 사용 - [PR #16664](https://github.com/BerriAI/litellm/pull/16664)
    - UI - LLM Credentials에서 Description 필드 제거 - [PR #16608](https://github.com/BerriAI/litellm/pull/16608)
    - UI - 관리자 UI supported models/providers에 RunwayML 추가 - [PR #16606](https://github.com/BerriAI/litellm/pull/16606)
    - Infra - Add Model Fields를 Backend로 마이그레이션 - [PR #16620](https://github.com/BerriAI/litellm/pull/16620)
    - model access group 생성을 위한 API Endpoint 추가 - [PR #16663](https://github.com/BerriAI/litellm/pull/16663)

- **Teams**
    - UI - Invite User에 검색 가능한 Team Select 추가 - [PR #16454](https://github.com/BerriAI/litellm/pull/16454)
    - 새 team 생성 시 key budget 대신 user budget을 사용하도록 수정 - [PR #16074](https://github.com/BerriAI/litellm/pull/16074)

- **Budgets**
    - UI - Budgets를 Experimental에서 이동 - [PR #16544](https://github.com/BerriAI/litellm/pull/16544)

- **가드레일**
    - UI - Config 가드레일을 table에서 삭제할 수 없도록 수정 - [PR #16540](https://github.com/BerriAI/litellm/pull/16540)
    - guardrails list endpoint에서 enterprise 제한 제거 수정 - [PR #15333](https://github.com/BerriAI/litellm/pull/15333)

- **Callbacks**
    - UI - 새 Callbacks table 추가 - [PR #16512](https://github.com/BerriAI/litellm/pull/16512)
    - callbacks 삭제 실패 수정 - [PR #16473](https://github.com/BerriAI/litellm/pull/16473)

- **사용법 & Analytics**
    - UI - 사용법 Indicator 개선 - [PR #16504](https://github.com/BerriAI/litellm/pull/16504)
    - UI - Model Info Page Health Check 추가 - [PR #16416](https://github.com/BerriAI/litellm/pull/16416)
    - Infra - Model Analytics Tab에 Deprecation Warning 표시 - [PR #16417](https://github.com/BerriAI/litellm/pull/16417)
    - Litellm tags usage에 request_id 추가 수정 - [PR #16111](https://github.com/BerriAI/litellm/pull/16111)

- **Health Check**
    - Health Check에 Langfuse OTEL 및 SQS 추가 - [PR #16514](https://github.com/BerriAI/litellm/pull/16514)

- **General UI**
    - UI - table action columns 표시 정규화 - [PR #16657](https://github.com/BerriAI/litellm/pull/16657)
    - UI - Settings Pages의 Button Styles 및 Sizing 개선 - [PR #16600](https://github.com/BerriAI/litellm/pull/16600)
    - UI - SSO Modal 시각적 변경 - [PR #16554](https://github.com/BerriAI/litellm/pull/16554)
    - SERVER_ROOT_PATH 사용 시 UI logos 로딩 수정 - [PR #16618](https://github.com/BerriAI/litellm/pull/16618)
    - OpenAI endpoint tooltips에서 오해를 부르는 'Custom' option 언급 제거 수정 - [PR #16622](https://github.com/BerriAI/litellm/pull/16622)

- **SSO**
    - 사용자가 LiteLLM에 삽입될 때 SSO provider의 `role`이 사용되도록 보장 - [PR #16794](https://github.com/BerriAI/litellm/pull/16794)

#### 버그 {#bugs-1}

- **Management Endpoint 기능**
    - customer management endpoints의 일관되지 않은 error responses 수정 - [PR #16450](https://github.com/BerriAI/litellm/pull/16450)
    - /spend/logs endpoint의 date range filtering 정확도 수정 - [PR #16443](https://github.com/BerriAI/litellm/pull/16443)
    - /spend/logs/ui Access Control 수정 - [PR #16446](https://github.com/BerriAI/litellm/pull/16446)
    - /spend/logs/session/ui endpoint에 pagination 추가 - [PR #16603](https://github.com/BerriAI/litellm/pull/16603)
    - LiteLLM 사용법에 key_hash가 표시되던 문제 수정 - [PR #16471](https://github.com/BerriAI/litellm/pull/16471)
    - jwt payload에서 app_roles가 누락되던 문제 수정 - [PR #16448](https://github.com/BerriAI/litellm/pull/16448)

---

## Logging / Guardrail / Prompt Management 통합 {#logging--guardrail--prompt-management-integrations}


#### 신규 통합 {#new-integration}

- **🆕 [Zscaler AI Guard](../../docs/proxy/guardrails/zscaler_ai_guard)**
    - security policy enforcement를 위한 Zscaler AI Guard hook 추가 - [PR #15691](https://github.com/BerriAI/litellm/pull/15691)

#### Logging {#logging}

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - validation errors를 방지하기 위해 null usage values 처리 수정 - [PR #16396](https://github.com/BerriAI/litellm/pull/16396)

- **[CloudZero](../../docs/proxy/logging)**
    - 업데이트된 spend가 CloudZero로 전송되지 않던 문제 수정 - [PR #16201](https://github.com/BerriAI/litellm/pull/16201)

#### 가드레일 {#guardrail}

- **[IBM Detector](../../docs/proxy/guardrails)**
    - detector-id가 IBM detector server에 header로 전달되도록 보장 - [PR #16649](https://github.com/BerriAI/litellm/pull/16649)

#### Prompt Management {#prompt-management}

- **[Custom Prompt Management](../../docs/proxy/prompt_management)**
    - custom prompt management를 위한 SDK 중심 예제 추가 - [PR #16441](https://github.com/BerriAI/litellm/pull/16441)

---

## 비용 추적, Budgets 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **End User Budgets**
    - 기본 ID가 모든 end users에 적용되도록 max_end_user budget이 id를 가리킬 수 있게 허용 - [PR #16456](https://github.com/BerriAI/litellm/pull/16456)

---

## MCP Gateway {#mcp-gateway}

- **설정**
    - MCP servers를 위한 dynamic OAuth2 metadata discovery 추가 - [PR #16676](https://github.com/BerriAI/litellm/pull/16676)
    - server name prefix가 없어도 tool call을 허용하도록 수정 - [PR #16425](https://github.com/BerriAI/litellm/pull/16425)
    - allowed server list에서 unauthorized MCP servers를 제외하도록 수정 - [PR #16551](https://github.com/BerriAI/litellm/pull/16551)
    - permission settings에서 MCP server를 삭제할 수 없던 문제 수정 - [PR #16407](https://github.com/BerriAI/litellm/pull/16407)
    - MCP server record에 credentials가 없을 때 crash를 피하도록 수정 - [PR #16601](https://github.com/BerriAI/litellm/pull/16601)

---

## Agents {#agents}

- **[Agent 등록 (A2A Spec)](../../docs/agents)**
    - Agent-to-Agent specification을 따르는 agent registration 및 discovery 지원 - [PR #16615](https://github.com/BerriAI/litellm/pull/16615)

---

## Performance / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

- **Embeddings Performance 개선**
    - embeddings에 router의 O(1) lookup 및 shared sessions 사용 - [PR #16344](https://github.com/BerriAI/litellm/pull/16344)

- **Router Reliability**
    - unknown models에 대한 default fallbacks 지원 - [PR #16419](https://github.com/BerriAI/litellm/pull/16419)

- **Callback Management 개선**
    - async completions의 callbacks를 flush하기 위한 atexit handlers 추가 - [PR #16487](https://github.com/BerriAI/litellm/pull/16487)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

- **설정 Management**
    - model_cost_map_url 업데이트가 environment variable을 사용하도록 수정 - [PR #16429](https://github.com/BerriAI/litellm/pull/16429)

---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - README의 streaming example 수정 - [PR #16461](https://github.com/BerriAI/litellm/pull/16461)
    - 깨진 Slack invite links를 support page로 업데이트 - [PR #16546](https://github.com/BerriAI/litellm/pull/16546)
    - fallbacks page의 code block indentation 수정 - [PR #16542](https://github.com/BerriAI/litellm/pull/16542)
    - 문서 code example 수정 - [PR #16502](https://github.com/BerriAI/litellm/pull/16502)
    - `reasoning_effort` summary field options 문서화 - [PR #16549](https://github.com/BerriAI/litellm/pull/16549)

- **API 문서**
    - model access management용 APIs 문서 추가 - [PR #16673](https://github.com/BerriAI/litellm/pull/16673)
    - 새 pricing data를 auto reload하는 방법을 보여주는 문서 추가 - [PR #16675](https://github.com/BerriAI/litellm/pull/16675)
    - LiteLLM Quick start - model resolution 작동 방식 표시 - [PR #16602](https://github.com/BerriAI/litellm/pull/16602)
    - callback failure 추적 문서 추가 - [PR #16474](https://github.com/BerriAI/litellm/pull/16474)

- **일반 문서**
    - release page의 container api link 수정 - [PR #16440](https://github.com/BerriAI/litellm/pull/16440)
    - litellm을 사용하는 projects에 softgen 추가 - [PR #16423](https://github.com/BerriAI/litellm/pull/16423)

---

## 신규 기여자 {#new-contributors}

* @artplan1 님이 [PR #16423](https://github.com/BerriAI/litellm/pull/16423)에서 첫 기여를 했습니다.
* @JehandadK 님이 [PR #16472](https://github.com/BerriAI/litellm/pull/16472)에서 첫 기여를 했습니다.
* @vmiscenko 님이 [PR #16453](https://github.com/BerriAI/litellm/pull/16453)에서 첫 기여를 했습니다.
* @mcowger 님이 [PR #16429](https://github.com/BerriAI/litellm/pull/16429)에서 첫 기여를 했습니다.
* @yellowsubmarine372 님이 [PR #16395](https://github.com/BerriAI/litellm/pull/16395)에서 첫 기여를 했습니다.
* @Hebruwu 님이 [PR #16201](https://github.com/BerriAI/litellm/pull/16201)에서 첫 기여를 했습니다.
* @jwang-gif 님이 [PR #15691](https://github.com/BerriAI/litellm/pull/15691)에서 첫 기여를 했습니다.
* @AnthonyMonaco 님이 [PR #16502](https://github.com/BerriAI/litellm/pull/16502)에서 첫 기여를 했습니다.
* @andrewm4894 님이 [PR #16487](https://github.com/BerriAI/litellm/pull/16487)에서 첫 기여를 했습니다.
* @f14-bertolotti 님이 [PR #16485](https://github.com/BerriAI/litellm/pull/16485)에서 첫 기여를 했습니다.
* @busla 님이 [PR #16293](https://github.com/BerriAI/litellm/pull/16293)에서 첫 기여를 했습니다.
* @MightyGoldenOctopus 님이 [PR #16537](https://github.com/BerriAI/litellm/pull/16537)에서 첫 기여를 했습니다.
* @ultmaster 님이 [PR #14436](https://github.com/BerriAI/litellm/pull/14436)에서 첫 기여를 했습니다.
* @bchrobot 님이 [PR #16542](https://github.com/BerriAI/litellm/pull/16542)에서 첫 기여를 했습니다.
* @sep-grindr 님이 [PR #16622](https://github.com/BerriAI/litellm/pull/16622)에서 첫 기여를 했습니다.
* @pnookala-godaddy 님이 [PR #16607](https://github.com/BerriAI/litellm/pull/16607)에서 첫 기여를 했습니다.
* @dtunikov 님이 [PR #16592](https://github.com/BerriAI/litellm/pull/16592)에서 첫 기여를 했습니다.
* @lukapecnik 님이 [PR #16648](https://github.com/BerriAI/litellm/pull/16648)에서 첫 기여를 했습니다.
* @jyeros 님이 [PR #16618](https://github.com/BerriAI/litellm/pull/16618)에서 첫 기여를 했습니다.

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.79.3.rc.1...v1.80.0.rc.1)**

---
