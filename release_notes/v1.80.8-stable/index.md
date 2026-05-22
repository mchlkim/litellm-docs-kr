---
title: "v1.80.8-stable - A2A Agent Gateway 소개"
slug: "v1-80-8"
date: 2025-12-06T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.80.8-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.8
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Agent Gateway (A2A)** - [요청/응답 로깅과 액세스 제어를 적용해 AI Gateway를 통해 에이전트를 호출합니다](../../docs/a2a)
- **가드레일 API v2** - [스트리밍 지원, 구조화된 메시지, 도구 호출 검사를 제공하는 Generic Guardrail API](../../docs/adding_provider/generic_guardrail_api)
- **Customer (End User) 사용량 UI** - [대시보드에서 최종 사용자 지출을 직접 추적하고 시각화합니다](../../docs/proxy/customer_usage)
- **vLLM Batch + Files API** - [vLLM 배포에서 Batch 및 Files API를 지원합니다](../../docs/batches)
- **팀의 동적 Rate Limiting** - [팀 수준의 동적 rate limit과 우선순위 예약을 활성화합니다](../../docs/proxy/team_budgets)
- **Google Cloud Chirp3 HD** - [Chirp3 HD 음성을 제공하는 새 text-to-speech provider](../../docs/text_to_speech)

---

### `Agent Gateway(A2A)` 기능

<Image 
  img={require('../../img/a2a_gateway.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

이번 릴리스에서는 LiteLLM에 **A2A Agent Gateway**가 도입됩니다. 이제 LLM API에 적용하던 것과 동일한 제어 기능으로 A2A agent를 호출하고 관리할 수 있습니다.

**LiteLLM Gateway Admin**은 이제 다음을 수행할 수 있습니다.
    - **요청/응답 로깅** - 모든 agent 호출이 전체 요청 및 응답 추적과 함께 로그 페이지에 기록됩니다.
    - **액세스 제어** - 어떤 Team/Key가 어떤 agent에 접근할 수 있는지 제어합니다.

개발자는 A2A SDK를 계속 사용할 수 있습니다. `A2AClient`가 LiteLLM proxy URL과 API key를 가리키도록 설정하기만 하면 됩니다.

**A2A SDK와 함께 작동합니다.**

```python
from a2a.client import A2AClient

client = A2AClient(
    base_url="http://localhost:4000",  # Your LiteLLM proxy
    api_key="sk-1234"                   # LiteLLM API key
)

response = client.send_message(
    agent_id="my-agent",
    message="What's the status of my order?"
)
```

Agent Gateway 시작하기: [Agent Gateway Documentation](../../docs/a2a)

---

### Customer (End User) 사용량 UI {#customer-end-user-usage-ui}

<Image
img={require('../../img/customer_usage.png')}
style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이제 사용자가 customer별로 사용량 통계를 필터링할 수 있습니다. 팀과 조직에 제공되던 세분화된 필터링 기능을 동일하게 사용할 수 있습니다.

**세부 정보:**

- customer ID별로 사용량 분석, 지출 로그, 활동 지표를 필터링합니다.
- 기존 팀 및 사용자 수준 필터와 함께 customer 수준 분석을 확인합니다.
- 모든 사용량 및 분석 화면에서 일관된 필터링 경험을 제공합니다.

---

## 새 Provider 및 Endpoint {#new-providers-and-endpoints}

### 새 Provider (신규 5개) {#new-providers-5-new-providers}

| Provider | 지원되는 LiteLLM Endpoint | 설명 |
| -------- | ------------------- | ----------- |
| **[Z.AI (Zhipu AI)](../../docs/providers/zai)** | `/v1/chat/completions`, `/v1/responses`, `/v1/messages` | Zhipu AI GLM 모델 기본 지원 |
| **[RAGFlow](../../docs/providers/ragflow)** | `/v1/chat/completions`, `/v1/responses`, `/v1/messages`, `/v1/vector_stores` | vector store를 지원하는 RAG 기반 chat completion |
| **[PublicAI](../../docs/providers/publicai)** | `/v1/chat/completions`, `/v1/responses`, `/v1/messages` | JSON config를 통한 OpenAI 호환 provider |
| **[Google Cloud Chirp3 HD](../../docs/text_to_speech)** | `/v1/audio/speech`, `/v1/audio/speech/stream` | Google Cloud Chirp3 HD 음성을 사용하는 text-to-speech |

### 새 LLM API Endpoint (신규 2개) {#new-llm-api-endpoints-2-new-endpoints}

| Endpoint | Method | 설명 | 문서 |
| -------- | ------ | ----------- | ------------- |
| `/v1/agents/invoke` | POST | AI Gateway를 통해 A2A agent를 호출합니다 | [Agent Gateway](../../docs/a2a) |
| `/cursor/chat/completions` | POST | Cursor BYOK endpoint - Responses API 입력을 받아 Chat Completions 출력을 반환합니다 | [Cursor Integration](../../docs/tutorials/cursor_integration) |

---

## 새 모델 / 업데이트된 모델 {#new--updated-models}

#### 새 모델 지원 (신규 33개) {#new-model-support-33-new-models}

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | Features |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5.1-codex-max` | 400K | $1.25 | $10.00 | 추론, 비전, PDF 입력, responses API |
| Azure | `azure/gpt-5.1-codex-max` | 400K | $1.25 | $10.00 | 추론, 비전, PDF 입력, responses API |
| Anthropic | `claude-opus-4-5` | 200K | $5.00 | $25.00 | 컴퓨터 사용, 추론, 비전 |
| Bedrock | `global.anthropic.claude-opus-4-5-20251101-v1:0` | 200K | $5.00 | $25.00 | 컴퓨터 사용, 추론, 비전 |
| Bedrock | `amazon.nova-2-lite-v1:0` | 1M | $0.30 | $2.50 | 추론, 비전, 비디오, PDF 입력 |
| Bedrock | `amazon.titan-image-generator-v2:0` | - | - | $0.008/image | 이미지 생성 |
| Fireworks | `fireworks_ai/deepseek-v3p2` | 164K | $1.20 | $1.20 | 함수 호출, 응답 스키마 |
| Fireworks | `fireworks_ai/kimi-k2-instruct-0905` | 262K | $0.60 | $2.50 | 함수 호출, 응답 스키마 |
| DeepSeek | `deepseek/deepseek-v3.2` | 164K | $0.28 | $0.40 | 추론, 함수 호출 |
| Mistral | `mistral/mistral-large-3` | 256K | $0.50 | $1.50 | 함수 호출, 비전 |
| Azure AI | `azure_ai/mistral-large-3` | 256K | $0.50 | $1.50 | 함수 호출, 비전 |
| Moonshot | `moonshot/kimi-k2-0905-preview` | 262K | $0.60 | $2.50 | 함수 호출, 웹 검색 |
| Moonshot | `moonshot/kimi-k2-turbo-preview` | 262K | $1.15 | $8.00 | 함수 호출, 웹 검색 |
| Moonshot | `moonshot/kimi-k2-thinking-turbo` | 262K | $1.15 | $8.00 | 함수 호출, 웹 검색 |
| OpenRouter | `openrouter/deepseek/deepseek-v3.2` | 164K | $0.28 | $0.40 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-haiku-4-5` | 200K | $1.00 | $5.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-opus-4` | 200K | $15.00 | $75.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-opus-4-1` | 200K | $15.00 | $75.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-opus-4-5` | 200K | $5.00 | $25.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-sonnet-4` | 200K | $3.00 | $15.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-claude-sonnet-4-1` | 200K | $3.00 | $15.00 | 추론, 함수 호출 |
| Databricks | `databricks/databricks-gemini-2-5-flash` | 1M | $0.30 | $2.50 | 함수 호출 |
| Databricks | `databricks/databricks-gemini-2-5-pro` | 1M | $1.25 | $10.00 | 함수 호출 |
| Databricks | `databricks/databricks-gpt-5` | 400K | $1.25 | $10.00 | 함수 호출 |
| Databricks | `databricks/databricks-gpt-5-1` | 400K | $1.25 | $10.00 | 함수 호출 |
| Databricks | `databricks/databricks-gpt-5-mini` | 400K | $0.25 | $2.00 | 함수 호출 |
| Databricks | `databricks/databricks-gpt-5-nano` | 400K | $0.05 | $0.40 | 함수 호출 |
| Vertex AI | `vertex_ai/chirp` | - | $30.00/1M chars | - | 음성 합성(Chirp3 HD) |
| Z.AI | `zai/glm-4.6` | 200K | $0.60 | $2.20 | 함수 호출 |
| Z.AI | `zai/glm-4.5` | 128K | $0.60 | $2.20 | 함수 호출 |
| Z.AI | `zai/glm-4.5v` | 128K | $0.60 | $1.80 | 함수 호출, 비전 |
| Z.AI | `zai/glm-4.5-flash` | 128K | Free | Free | 함수 호출 |
| Vertex AI | `vertex_ai/bge-large-en-v1.5` | - | - | - | BGE Embeddings |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - `gpt-5.1-codex-max` 모델 가격 및 구성을 추가했습니다 - [PR #17541](https://github.com/BerriAI/litellm/pull/17541)
    - gpt-5.1-codex-max에 xhigh reasoning effort를 추가했습니다 - [PR #17585](https://github.com/BerriAI/litellm/pull/17585)
    - 빈 LLM endpoint 응답에 대한 명확한 오류 메시지를 추가했습니다 - [PR #17445](https://github.com/BerriAI/litellm/pull/17445)

- **[Azure OpenAI](../../docs/providers/azure/azure)**
    - Azure gpt-5.1 모델에서 reasoning_effort='none'을 허용했습니다 - [PR #17311](https://github.com/BerriAI/litellm/pull/17311)

- **[Anthropic](../../docs/providers/anthropic)**
    - 가격 데이터에 `claude-opus-4-5` alias를 추가했습니다 - [PR #17313](https://github.com/BerriAI/litellm/pull/17313)
    - opus 4.5의 `<budget:thinking>` block을 파싱합니다 - [PR #17534](https://github.com/BerriAI/litellm/pull/17534)
    - 검토된 새 Anthropic 기능을 업데이트했습니다 - [PR #17142](https://github.com/BerriAI/litellm/pull/17142)
    - Anthropic system message에서 빈 text block을 건너뜁니다 - [PR #17442](https://github.com/BerriAI/litellm/pull/17442)

- **[Bedrock](../../docs/providers/bedrock)**
    - Nova embedding 지원을 추가했습니다 - [PR #17253](https://github.com/BerriAI/litellm/pull/17253)
    - Bedrock Qwen 2 imported model 지원을 추가했습니다 - [PR #17461](https://github.com/BerriAI/litellm/pull/17461)
    - Bedrock OpenAI 모델 지원을 추가했습니다 - [PR #17368](https://github.com/BerriAI/litellm/pull/17368)
    - Bedrock batch의 file content 다운로드 지원을 추가했습니다 - [PR #17470](https://github.com/BerriAI/litellm/pull/17470)
    - Bedrock API에서 streaming chunk size를 설정 가능하게 했습니다 - [PR #17357](https://github.com/BerriAI/litellm/pull/17357)
    - Bedrock용 실험적 latest-user 필터링을 추가했습니다 - [PR #17282](https://github.com/BerriAI/litellm/pull/17282)
    - Cohere v4 embed 응답 dictionary 형식을 처리합니다 - [PR #17220](https://github.com/BerriAI/litellm/pull/17220)
    - Bedrock에서 호환되지 않는 beta header를 제거했습니다 - [PR #17301](https://github.com/BerriAI/litellm/pull/17301)
    - Global Opus 4.5 Bedrock endpoint의 모델 가격과 세부 정보를 추가했습니다 - [PR #17380](https://github.com/BerriAI/litellm/pull/17380)

- **[Gemini (Google AI Studio + Vertex AI)](../../docs/providers/gemini)**
    - Gemini 모델의 이미지 생성 처리를 개선했습니다 - [PR #17292](https://github.com/BerriAI/litellm/pull/17292)
    - streaming 응답에서 reasoning_content가 중복 content를 표시하는 문제를 수정했습니다 - [PR #17266](https://github.com/BerriAI/litellm/pull/17266)
    - 첫 번째 유효 chunk 이후의 부분 JSON chunk를 처리합니다 - [PR #17496](https://github.com/BerriAI/litellm/pull/17496)
    - Gemini 3 마지막 chunk thinking block을 수정했습니다 - [PR #17403](https://github.com/BerriAI/litellm/pull/17403)
    - 비용 계산에서 Gemini image_tokens가 text token으로 처리되던 문제를 수정했습니다 - [PR #17554](https://github.com/BerriAI/litellm/pull/17554)
    - media resolution이 Gemini 3 모델에만 적용되도록 보장했습니다 - [PR #17137](https://github.com/BerriAI/litellm/pull/17137)

- **[Vertex AI](../../docs/providers/vertex)**
    - /speech에 Google Cloud Chirp3 HD 지원을 추가했습니다 - [PR #17391](https://github.com/BerriAI/litellm/pull/17391)
    - BGE Embeddings 지원을 추가했습니다 - [PR #17362](https://github.com/BerriAI/litellm/pull/17362)
    - Vertex AI 이미지 생성 endpoint의 global location을 처리합니다 - [PR #17255](https://github.com/BerriAI/litellm/pull/17255)
    - Vertex AI field에 Google Private API Endpoint를 추가했습니다 - [PR #17382](https://github.com/BerriAI/litellm/pull/17382)

- **[Z.AI (Zhipu AI)](../../docs/providers/zai)**
    - Z.AI를 기본 provider로 추가했습니다 - [PR #17307](https://github.com/BerriAI/litellm/pull/17307)

- **[GitHub Copilot](../../docs/providers/github_copilot)**
    - Embedding API 지원을 추가했습니다 - [PR #17278](https://github.com/BerriAI/litellm/pull/17278)
    - multi-turn conversation의 reasoning item에서 encrypted_content를 보존합니다 - [PR #17130](https://github.com/BerriAI/litellm/pull/17130)

- **[Databricks](../../docs/providers/databricks)**
    - Databricks 모델 가격을 업데이트하고 새 모델을 추가했습니다 - [PR #17277](https://github.com/BerriAI/litellm/pull/17277)

- **[OVHcloud](../../docs/providers/ovhcloud)**
    - OVHcloud audio transcription 지원을 추가했습니다 - [PR #17305](https://github.com/BerriAI/litellm/pull/17305)

- **[Mistral](../../docs/providers/mistral)**
    - Mistral Large 3 모델 지원을 추가했습니다 - [PR #17547](https://github.com/BerriAI/litellm/pull/17547)

- **[Moonshot](../../docs/providers/moonshot)**
    - 누락된 Moonshot turbo 모델을 수정하고 잘못된 가격을 수정했습니다 - [PR #17432](https://github.com/BerriAI/litellm/pull/17432)

- **[Together AI](../../docs/providers/togetherai)**
    - Together AI용 context window exception mapping을 추가했습니다 - [PR #17284](https://github.com/BerriAI/litellm/pull/17284)

- **[WatsonX](../../docs/providers/watsonx/index)**
    - zen_api_key를 동적으로 전달할 수 있게 했습니다 - [PR #16655](https://github.com/BerriAI/litellm/pull/16655)
    - Watsonx Audio Transcription API를 수정했습니다 - [PR #17326](https://github.com/BerriAI/litellm/pull/17326)
    - audio transcription을 수정하고 요청 header에서 content type을 강제하지 않도록 했습니다 - [PR #17546](https://github.com/BerriAI/litellm/pull/17546)

- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - 새 모델 `fireworks_ai/kimi-k2-instruct-0905`를 추가했습니다 - [PR #17328](https://github.com/BerriAI/litellm/pull/17328)
    - `fireworks/deepseek-v3p2`를 추가했습니다 - [PR #17395](https://github.com/BerriAI/litellm/pull/17395)

- **[DeepSeek](../../docs/providers/deepseek)**
    - Reasoning이 포함된 Deepseek 3.2를 지원합니다 - [PR #17384](https://github.com/BerriAI/litellm/pull/17384)

- **[Nova Lite 2](../../docs/providers/bedrock)**
    - reasoningConfig를 사용하는 Nova Lite 2 reasoning 지원을 추가했습니다 - [PR #17371](https://github.com/BerriAI/litellm/pull/17371)

- **[Ollama](../../docs/providers/ollama)**
    - ollama.com에서 auth가 작동하지 않는 문제를 수정했습니다 - [PR #17191](https://github.com/BerriAI/litellm/pull/17191)

- **[Groq](../../docs/providers/groq)**
    - json_tool_call workaround 사용 전에 supports_response_schema를 수정했습니다 - [PR #17438](https://github.com/BerriAI/litellm/pull/17438)

- **[vLLM](../../docs/providers/vllm)**
    - 빈 응답 + vLLM streaming 문제를 수정했습니다 - [PR #17516](https://github.com/BerriAI/litellm/pull/17516)

- **[Azure AI](../../docs/providers/azure_ai)**
    - Anthropic provider를 Azure AI로 마이그레이션했습니다 - [PR #17202](https://github.com/BerriAI/litellm/pull/17202)
    - Azure OpenAI realtime 모델의 GA path를 수정했습니다 - [PR #17260](https://github.com/BerriAI/litellm/pull/17260)

- **[Bedrock TwelveLabs](../../docs/providers/bedrock#twelvelabs-pegasus---video-understanding)**
    - TwelveLabs Pegasus video understanding 지원을 추가했습니다 - [PR #17193](https://github.com/BerriAI/litellm/pull/17193)

### 버그 수정 {#bug-fixes}

- **[Bedrock](../../docs/providers/bedrock)**
    - messages API bedrock invoke의 extra_headers를 수정했습니다 - [PR #17271](https://github.com/BerriAI/litellm/pull/17271)
    - model map의 Bedrock 모델을 수정했습니다 - [PR #17419](https://github.com/BerriAI/litellm/pull/17419)
    - Bedrock converse message가 예상대로 modify_params를 따르도록 했습니다 - [PR #17427](https://github.com/BerriAI/litellm/pull/17427)
    - Bedrock imported Qwen 모델의 Anthropic beta header를 수정했습니다 - [PR #17467](https://github.com/BerriAI/litellm/pull/17467)
    - Bedrock의 OpenAI provider에서 JSON 응답의 usage를 보존합니다 - [PR #17589](https://github.com/BerriAI/litellm/pull/17589)

- **[SambaNova](../../docs/providers/sambanova)**
    - SambaNova 모델에서 acompletion이 오류를 발생시키는 문제를 수정했습니다 - [PR #17217](https://github.com/BerriAI/litellm/pull/17217)

- **General**
    - 요청 body에서 metadata가 null일 때 발생하는 AttributeError를 수정했습니다 - [PR #17306](https://github.com/BerriAI/litellm/pull/17306)
    - malformed request의 500 오류를 수정했습니다 - [PR #17291](https://github.com/BerriAI/litellm/pull/17291)
    - header의 custom LLM provider를 존중하도록 했습니다 - [PR #17290](https://github.com/BerriAI/litellm/pull/17290)
    - streaming_handler에서 deprecated .dict()를 .model_dump()로 교체했습니다 - [PR #17359](https://github.com/BerriAI/litellm/pull/17359)

---

## LLM API Endpoint {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - responses API 비용 추적을 추가했습니다 - [PR #17258](https://github.com/BerriAI/litellm/pull/17258)
    - responses API의 output_tokens_details를 completion_tokens_details에 매핑했습니다 - [PR #17458](https://github.com/BerriAI/litellm/pull/17458)
    - Responses API에 이미지 생성 지원을 추가했습니다 - [PR #16586](https://github.com/BerriAI/litellm/pull/16586)

- **[Batch API](../../docs/batches)**
    - vLLM batch+files API 지원을 추가했습니다 - [PR #15823](https://github.com/BerriAI/litellm/pull/15823)
    - optional parameter default value를 수정했습니다 - [PR #17434](https://github.com/BerriAI/litellm/pull/17434)
    - FileObject에 status parameter를 optional로 추가했습니다 - [PR #17431](https://github.com/BerriAI/litellm/pull/17431)

- **[Video Generation API](../../docs/videos)**
    - Veo passthrough 비용 추적을 추가했습니다 - [PR #17296](https://github.com/BerriAI/litellm/pull/17296)

- **[OCR API](../../docs/ocr)**
    - CallTypes enum에 누락된 OCR 및 aOCR을 추가했습니다 - [PR #17435](https://github.com/BerriAI/litellm/pull/17435)

- **General**
    - websearch를 지원하는 배포에만 routing하도록 지원했습니다 - [PR #17500](https://github.com/BerriAI/litellm/pull/17500)

#### 버그 {#bugs}

- **General**
    - streaming error validation을 수정했습니다 - [PR #17242](https://github.com/BerriAI/litellm/pull/17242)
    - delta의 빈 tool_calls에 대한 길이 validation을 추가했습니다 - [PR #17523](https://github.com/BerriAI/litellm/pull/17523)

---

## 관리 Endpoint / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **새 로그인 페이지**
    - 새 Login Page UI를 추가했습니다 - [PR #17443](https://github.com/BerriAI/litellm/pull/17443)
    - /login route를 refactor했습니다 - [PR #17379](https://github.com/BerriAI/litellm/pull/17379)
    - UI Config에 auto_redirect_to_sso를 추가했습니다 - [PR #17399](https://github.com/BerriAI/litellm/pull/17399)
    - 새 Login Page에 Auto Redirect to SSO를 추가했습니다 - [PR #17451](https://github.com/BerriAI/litellm/pull/17451)

- **Customer (End User) 사용량**
    - Customer (end user) 사용량 기능을 추가했습니다 - [PR #17498](https://github.com/BerriAI/litellm/pull/17498)
    - Customer 사용량 UI를 추가했습니다 - [PR #17506](https://github.com/BerriAI/litellm/pull/17506)
    - Customer 사용량용 Info Banner를 추가했습니다 - [PR #17598](https://github.com/BerriAI/litellm/pull/17598)

- **가상 키**
    - UI에서 API Key와 Virtual Key 표현을 표준화했습니다 - [PR #17325](https://github.com/BerriAI/litellm/pull/17325)
    - Internal User Table에 User Alias Column을 추가했습니다 - [PR #17321](https://github.com/BerriAI/litellm/pull/17321)
    - Credential 삭제 기능을 개선했습니다 - [PR #17317](https://github.com/BerriAI/litellm/pull/17317)

- **모델 + Endpoint**
    - Edit Credential Modal에서 모든 credential 값을 표시합니다 - [PR #17397](https://github.com/BerriAI/litellm/pull/17397)
    - Edit Team에 표시되는 모델을 Create Team과 맞추도록 변경했습니다 - [PR #17394](https://github.com/BerriAI/litellm/pull/17394)
    - Compare UI에서 이미지를 지원합니다 - [PR #17562](https://github.com/BerriAI/litellm/pull/17562)

- **Callbacks**
    - UI에 모든 callback을 표시합니다 - [PR #16335](https://github.com/BerriAI/litellm/pull/16335)
    - Credential에서 React Query를 사용하도록 했습니다 - [PR #17465](https://github.com/BerriAI/litellm/pull/17465)

- **Management Routes**
    - admin viewer가 global tag usage에 접근할 수 있도록 허용했습니다 - [PR #17501](https://github.com/BerriAI/litellm/pull/17501)
    - nonproxy admin(SCIM)에 wildcard route를 허용했습니다 - [PR #17178](https://github.com/BerriAI/litellm/pull/17178)
    - /user/info에서 사용자를 찾지 못하면 404를 반환합니다 - [PR #16850](https://github.com/BerriAI/litellm/pull/16850)

- **OCI 설정**
    - UI를 통한 Oracle Cloud Infrastructure 구성을 활성화했습니다 - [PR #17159](https://github.com/BerriAI/litellm/pull/17159)

#### 버그 {#bugs-1}

- **UI 수정**
    - Request 및 Response Panel JSONViewer를 수정했습니다 - [PR #17233](https://github.com/BerriAI/litellm/pull/17233)
    - Edit Settings에 button loading state를 추가했습니다 - [PR #17236](https://github.com/BerriAI/litellm/pull/17236)
    - 여러 text, button state, test 변경 사항을 수정했습니다 - [PR #17237](https://github.com/BerriAI/litellm/pull/17237)
    - API가 resolve되기 전에 Fallback이 즉시 삭제되는 문제를 수정했습니다 - [PR #17238](https://github.com/BerriAI/litellm/pull/17238)
    - Feature Flags를 제거했습니다 - [PR #17240](https://github.com/BerriAI/litellm/pull/17240)
    - Azure passthrough용 UI에서 metadata tag와 model name 표시를 수정했습니다 - [PR #17258](https://github.com/BerriAI/litellm/pull/17258)
    - Vertex Fields 주변 labeling을 변경했습니다 - [PR #17383](https://github.com/BerriAI/litellm/pull/17383)
    - sidebar 확장 시 두 번째 scrollbar가 생기는 문제와 tooltip z index를 제거했습니다 - [PR #17436](https://github.com/BerriAI/litellm/pull/17436)
    - Edit Membership Modal의 Select를 수정했습니다 - [PR #17524](https://github.com/BerriAI/litellm/pull/17524)
    - useAuthorized Hook이 새 Login Page로 redirect하도록 변경했습니다 - [PR #17553](https://github.com/BerriAI/litellm/pull/17553)

- **SSO**
    - generic SSO provider를 수정했습니다 - [PR #17227](https://github.com/BerriAI/litellm/pull/17227)
    - 모든 사용자에 대해 SSO integration을 지웁니다 - [PR #17287](https://github.com/BerriAI/litellm/pull/17287)
    - SSO 사용자가 Entra synced team에 추가되지 않는 문제를 수정했습니다 - [PR #17331](https://github.com/BerriAI/litellm/pull/17331)

- **Auth / JWT**
    - JWT Auth - user info endpoint와 함께 일반 OIDC flow를 사용할 수 있게 했습니다 - [PR #17324](https://github.com/BerriAI/litellm/pull/17324)
    - litellm user auth가 전달되지 않는 문제를 수정했습니다 - [PR #17342](https://github.com/BerriAI/litellm/pull/17342)
    - JWT auth에 다른 route를 추가했습니다 - [PR #17345](https://github.com/BerriAI/litellm/pull/17345)
    - 새 org team을 org 기준으로 validate하도록 수정했습니다 - [PR #17333](https://github.com/BerriAI/litellm/pull/17333)
    - litellm_enterprise에서 imported route가 존재하는지 보장하도록 수정했습니다 - [PR #17337](https://github.com/BerriAI/litellm/pull/17337)
    - deprecated organization field 대신 organization.members를 사용합니다 - [PR #17557](https://github.com/BerriAI/litellm/pull/17557)

- **조직/팀**
    - organization max budget이 적용되지 않는 문제를 수정했습니다 - [PR #17334](https://github.com/BerriAI/litellm/pull/17334)
    - budget update에서 null max_budget을 허용하도록 수정했습니다 - [PR #17545](https://github.com/BerriAI/litellm/pull/17545)

---

## AI Integration (신규 2개) {#ai-integrations-2-new-integrations}

### Logging (신규 1개) {#logging-1-new-integration}

#### 새 Integration {#new-integration}

- **[Weave](../../docs/proxy/logging)**
    - 기본 Weave OTEL integration을 추가했습니다 - [PR #17439](https://github.com/BerriAI/litellm/pull/17439)

#### 개선 및 수정 {#improvements--fixes}

- **[DataDog](../../docs/proxy/logging#datadog)**
    - ddtrace가 설치된 경우의 Datadog callback regression을 수정했습니다 - [PR #17393](https://github.com/BerriAI/litellm/pull/17393)

- **[Arize Phoenix](../../docs/observability/arize_integration)**
    - arize-phoenix trace 정리를 수정했습니다 - [PR #16611](https://github.com/BerriAI/litellm/pull/16611)

- **[MLflow](../../docs/proxy/logging#mlflow)**
    - Anthropic passthrough용 MLflow streaming span을 수정했습니다 - [PR #17288](https://github.com/BerriAI/litellm/pull/17288)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Langfuse logger test mock setup을 수정했습니다 - [PR #17591](https://github.com/BerriAI/litellm/pull/17591)

- **General**
    - logging callback의 PII anonymization 처리를 개선했습니다 - [PR #17207](https://github.com/BerriAI/litellm/pull/17207)

### 가드레일 (신규 1개) {#guardrails-1-new-integration}

#### 새 Integration {#new-integration-1}

- **[Generic Guardrail API](../../docs/adding_provider/generic_guardrail_api)**
    - Generic Guardrail API - guardrail provider가 repo PR 없이 LiteLLM에 즉시 지원을 추가할 수 있게 합니다 - [PR #17175](https://github.com/BerriAI/litellm/pull/17175)
    - 가드레일 API V2 - user api key metadata, session id, input type(request/response) 지정, image 지원 - [PR #17338](https://github.com/BerriAI/litellm/pull/17338)
    - 가드레일 API - streaming 지원을 추가했습니다 - [PR #17400](https://github.com/BerriAI/litellm/pull/17400)
    - 가드레일 API - OpenAI `/chat/completions`, OpenAI `/responses`, Anthropic `/v1/messages`의 tool call 검사를 지원합니다 - [PR #17459](https://github.com/BerriAI/litellm/pull/17459)
    - 가드레일 API - 새 `structured_messages` param을 추가했습니다 - [PR #17518](https://github.com/BerriAI/litellm/pull/17518)
    - v1/messages 호출을 anthropic unified guardrail에 올바르게 매핑합니다 - [PR #17424](https://github.com/BerriAI/litellm/pull/17424)
    - unified guardrail에서 during_call event type을 지원합니다 - [PR #17514](https://github.com/BerriAI/litellm/pull/17514)

#### 개선 및 수정 {#improvements--fixes-1}

- **[Noma Guardrail](../../docs/proxy/guardrails/noma_security)**
    - Noma guardrail이 공유 Responses transformation을 사용하고 system instruction을 포함하도록 refactor했습니다 - [PR #17315](https://github.com/BerriAI/litellm/pull/17315)

- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)**
    - guardrail의 빈 content 및 error dict 응답을 처리합니다 - [PR #17489](https://github.com/BerriAI/litellm/pull/17489)
    - Presidio guardrail test TypeError 및 license base64 decoding error를 수정했습니다 - [PR #17538](https://github.com/BerriAI/litellm/pull/17538)

- **[Tool Permissions](../../docs/proxy/guardrails/tool_permission)**
    - tool-permission에 regex 기반 tool_name/tool_type matching을 추가했습니다 - [PR #17164](https://github.com/BerriAI/litellm/pull/17164)
    - tool permission guardrail 문서에 이미지를 추가했습니다 - [PR #17322](https://github.com/BerriAI/litellm/pull/17322)

- **[AIM 가드레일](../../docs/proxy/guardrails/aim_security)**
    - AIM guardrail test를 수정했습니다 - [PR #17499](https://github.com/BerriAI/litellm/pull/17499)

- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - Bedrock Guardrail indent 및 import를 수정했습니다 - [PR #17378](https://github.com/BerriAI/litellm/pull/17378)

- **General 가드레일**
    - content filter에서 일치하는 모든 keyword를 마스킹합니다 - [PR #17521](https://github.com/BerriAI/litellm/pull/17521)
    - request_data에서 guardrail metadata가 보존되도록 보장했습니다 - [PR #17593](https://github.com/BerriAI/litellm/pull/17593)
    - apply_guardrail method를 수정하고 test isolation을 개선했습니다 - [PR #17555](https://github.com/BerriAI/litellm/pull/17555)

### Secret Managers

- **[CyberArk](../../docs/secret_managers/cyberark)**
    - SSL verify를 false로 설정할 수 있게 했습니다 - [PR #17433](https://github.com/BerriAI/litellm/pull/17433)

- **General**
    - key management hook에서 email 및 secret manager operation이 독립적으로 동작하도록 했습니다 - [PR #17551](https://github.com/BerriAI/litellm/pull/17551)

---

## 비용 추적, Budget 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Rate Limiting**
    - /messages와 함께 Parallel Request Limiter를 지원합니다 - [PR #17426](https://github.com/BerriAI/litellm/pull/17426)
    - team에서 dynamic rate limit/priority reservation을 사용할 수 있게 했습니다 - [PR #17061](https://github.com/BerriAI/litellm/pull/17061)
    - Dynamic Rate Limiter - token count가 실제 count 대신 1씩 증가/감소하던 문제와 Redis TTL을 수정했습니다 - [PR #17558](https://github.com/BerriAI/litellm/pull/17558)

- **Spend 로그**
    - `spend/logs`를 deprecated 처리하고 `spend/logs/v2`를 추가했습니다 - [PR #17167](https://github.com/BerriAI/litellm/pull/17167)
    - index 사용을 위해 timestamp filtering을 사용하도록 Spend 로그 query를 최적화했습니다 - [PR #17504](https://github.com/BerriAI/litellm/pull/17504)

- **Enforce User Param**
    - OpenAI post endpoint에 enforce_user_param 지원을 적용했습니다 - [PR #17407](https://github.com/BerriAI/litellm/pull/17407)

---

## MCP Gateway

- **MCP 설정**
    - MCP server endpoint의 URL format validation을 제거했습니다 - [PR #17270](https://github.com/BerriAI/litellm/pull/17270)
    - MCP error message에 stack trace를 추가했습니다 - [PR #17269](https://github.com/BerriAI/litellm/pull/17269)

- **MCP Tool Results**
    - CallToolResult에서 tool metadata를 보존합니다 - [PR #17561](https://github.com/BerriAI/litellm/pull/17561)

---

## `Agent Gateway(A2A)` 업데이트

- **Agent Invocation**
    - AI Gateway를 통한 agent 호출을 허용했습니다 - [PR #17440](https://github.com/BerriAI/litellm/pull/17440)
    - "로그" Page에서 request/response 추적을 허용했습니다 - [PR #17449](https://github.com/BerriAI/litellm/pull/17449)

- **Agent 액세스 제어**
    - key, team별 allowed agent를 적용하고 backend에 agent access group을 추가했습니다 - [PR #17502](https://github.com/BerriAI/litellm/pull/17502)

- **Agent Gateway UI**
    - UI에서 agent를 테스트할 수 있게 했습니다 - [PR #17455](https://github.com/BerriAI/litellm/pull/17455)
    - key, team별 allowed agent를 설정할 수 있게 했습니다 - [PR #17511](https://github.com/BerriAI/litellm/pull/17511)

---

## 성능 / Loadbalancing / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

- **Audio/Speech 성능**
    - `shared_sessions`를 사용해 `/audio/speech` 성능을 수정했습니다 - [PR #16739](https://github.com/BerriAI/litellm/pull/16739)

- **메모리 최적화**
    - aiohttp connection pooling의 memory leak을 방지했습니다 - [PR #17388](https://github.com/BerriAI/litellm/pull/17388)
    - memory 및 import time을 줄이기 위해 utils를 lazy-load합니다 - [PR #17171](https://github.com/BerriAI/litellm/pull/17171)

- **Database**
    - 기본 database connection number를 업데이트했습니다 - [PR #17353](https://github.com/BerriAI/litellm/pull/17353)
    - 기본 proxy_batch_write_at number를 업데이트했습니다 - [PR #17355](https://github.com/BerriAI/litellm/pull/17355)
    - db에 background health check를 추가했습니다 - [PR #17528](https://github.com/BerriAI/litellm/pull/17528)

- **Proxy 캐싱**
    - aiohttp transport에서 request 간 proxy caching 문제를 수정했습니다 - [PR #17122](https://github.com/BerriAI/litellm/pull/17122)

- **Session Management**
    - session consistency를 수정하고 Lasso API version을 source code에서 분리했습니다 - [PR #17316](https://github.com/BerriAI/litellm/pull/17316)
    - aiohttp TCPConnector에 enable_cleanup_closed를 조건부로 전달합니다 - [PR #17367](https://github.com/BerriAI/litellm/pull/17367)

- **Vector Store**
    - vector store configuration synchronization failure를 수정했습니다 - [PR #17525](https://github.com/BerriAI/litellm/pull/17525)

---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - Claude 모델용 Azure AI Foundry 문서를 추가했습니다 - [PR #17104](https://github.com/BerriAI/litellm/pull/17104)
    - GitHub Copilot용 responses 및 embedding API를 문서화했습니다 - [PR #17456](https://github.com/BerriAI/litellm/pull/17456)
    - OpenAI provider 문서에 gpt-5.1-codex-max를 추가했습니다 - [PR #17602](https://github.com/BerriAI/litellm/pull/17602)
    - Phoenix Integration 지침을 업데이트했습니다 - [PR #17373](https://github.com/BerriAI/litellm/pull/17373)

- **가이드**
    - gateway error와 provider error를 구분해 디버그하는 방법에 대한 guide를 추가했습니다 - [PR #17387](https://github.com/BerriAI/litellm/pull/17387)
    - Agent Gateway 문서를 추가했습니다 - [PR #17454](https://github.com/BerriAI/litellm/pull/17454)
    - A2A Permission management 문서를 추가했습니다 - [PR #17515](https://github.com/BerriAI/litellm/pull/17515)
    - agent hub에 link하도록 docs를 업데이트했습니다 - [PR #17462](https://github.com/BerriAI/litellm/pull/17462)

- **Projects**
    - project에 Google ADK와 Harbor를 추가했습니다 - [PR #17352](https://github.com/BerriAI/litellm/pull/17352)
    - project에 Microsoft Agent Lightning을 추가했습니다 - [PR #17422](https://github.com/BerriAI/litellm/pull/17422)

- **Cleanup**
    - Cleanup: orphan docs page와 Docusaurus template file을 제거했습니다 - [PR #17356](https://github.com/BerriAI/litellm/pull/17356)
    - docs에서 `source .env`를 제거했습니다 - [PR #17466](https://github.com/BerriAI/litellm/pull/17466)

---

## 인프라 / CI/CD {#infrastructure--cicd}

- **Helm Chart**
    - ingress-only label을 추가했습니다 - [PR #17348](https://github.com/BerriAI/litellm/pull/17348)

- **Docker**
    - Dockerfile.non_root의 apk package installation에 retry logic을 추가했습니다 - [PR #17596](https://github.com/BerriAI/litellm/pull/17596)
    - Chainguard 수정 사항을 반영했습니다 - [PR #17406](https://github.com/BerriAI/litellm/pull/17406)

- **OpenAPI Schema**
    - definition을 components/schemas로 옮기도록 add_schema_to_components를 refactor했습니다 - [PR #17389](https://github.com/BerriAI/litellm/pull/17389)

- **Security**
    - 보안 취약점 수정: mdast-util-to-hast를 13.2.1로 업데이트했습니다 - [PR #17601](https://github.com/BerriAI/litellm/pull/17601)
    - jws를 3.2.2에서 3.2.3으로 bump했습니다 - [PR #17494](https://github.com/BerriAI/litellm/pull/17494)

---

## 새 기여자 {#new-contributors}

* @weichiet 님이 [PR #17242](https://github.com/BerriAI/litellm/pull/17242)에서 첫 기여를 했습니다
* @AndyForest 님이 [PR #17220](https://github.com/BerriAI/litellm/pull/17220)에서 첫 기여를 했습니다
* @omkar806 님이 [PR #17217](https://github.com/BerriAI/litellm/pull/17217)에서 첫 기여를 했습니다
* @v0rtex20k 님이 [PR #17178](https://github.com/BerriAI/litellm/pull/17178)에서 첫 기여를 했습니다
* @hxomer 님이 [PR #17207](https://github.com/BerriAI/litellm/pull/17207)에서 첫 기여를 했습니다
* @orgersh92 님이 [PR #17316](https://github.com/BerriAI/litellm/pull/17316)에서 첫 기여를 했습니다
* @dannykopping 님이 [PR #17313](https://github.com/BerriAI/litellm/pull/17313)에서 첫 기여를 했습니다
* @rioiart 님이 [PR #17333](https://github.com/BerriAI/litellm/pull/17333)에서 첫 기여를 했습니다
* @codgician 님이 [PR #17278](https://github.com/BerriAI/litellm/pull/17278)에서 첫 기여를 했습니다
* @epistoteles 님이 [PR #17277](https://github.com/BerriAI/litellm/pull/17277)에서 첫 기여를 했습니다
* @kothamah 님이 [PR #17368](https://github.com/BerriAI/litellm/pull/17368)에서 첫 기여를 했습니다
* @flozonn 님이 [PR #17371](https://github.com/BerriAI/litellm/pull/17371)에서 첫 기여를 했습니다
* @richardmcsong 님이 [PR #17389](https://github.com/BerriAI/litellm/pull/17389)에서 첫 기여를 했습니다
* @matt-greathouse 님이 [PR #17384](https://github.com/BerriAI/litellm/pull/17384)에서 첫 기여를 했습니다
* @mossbanay 님이 [PR #17380](https://github.com/BerriAI/litellm/pull/17380)에서 첫 기여를 했습니다
* @mhielpos-asapp 님이 [PR #17376](https://github.com/BerriAI/litellm/pull/17376)에서 첫 기여를 했습니다
* @Joilence 님이 [PR #17367](https://github.com/BerriAI/litellm/pull/17367)에서 첫 기여를 했습니다
* @deepaktammali 님이 [PR #17357](https://github.com/BerriAI/litellm/pull/17357)에서 첫 기여를 했습니다
* @axiomofjoy 님이 [PR #16611](https://github.com/BerriAI/litellm/pull/16611)에서 첫 기여를 했습니다
* @DevajMody 님이 [PR #17445](https://github.com/BerriAI/litellm/pull/17445)에서 첫 기여를 했습니다
* @andrewtruong 님이 [PR #17439](https://github.com/BerriAI/litellm/pull/17439)에서 첫 기여를 했습니다
* @AnasAbdelR 님이 [PR #17490](https://github.com/BerriAI/litellm/pull/17490)에서 첫 기여를 했습니다
* @dominicfeliton 님이 [PR #17516](https://github.com/BerriAI/litellm/pull/17516)에서 첫 기여를 했습니다
* @kristianmitk 님이 [PR #17504](https://github.com/BerriAI/litellm/pull/17504)에서 첫 기여를 했습니다
* @rgshr 님이 [PR #17130](https://github.com/BerriAI/litellm/pull/17130)에서 첫 기여를 했습니다
* @dominicfallows 님이 [PR #17489](https://github.com/BerriAI/litellm/pull/17489)에서 첫 기여를 했습니다
* @irfansofyana 님이 [PR #17467](https://github.com/BerriAI/litellm/pull/17467)에서 첫 기여를 했습니다
* @GusBricker 님이 [PR #17191](https://github.com/BerriAI/litellm/pull/17191)에서 첫 기여를 했습니다
* @OlivverX 님이 [PR #17255](https://github.com/BerriAI/litellm/pull/17255)에서 첫 기여를 했습니다
* @withsmilo 님이 [PR #17585](https://github.com/BerriAI/litellm/pull/17585)에서 첫 기여를 했습니다

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.80.7-nightly...v1.80.8)**
