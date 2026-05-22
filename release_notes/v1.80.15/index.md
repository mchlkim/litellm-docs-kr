---
title: "v1.80.15-stable - Manus API 지원"
slug: "v1-80-15"
date: 2026-01-10T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.80.15-stable.1
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.15
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Manus API 지원** - [`/responses` 및 `GET /responses` 엔드포인트에서 Manus API 신규 provider 지원](../../docs/providers/manus)
- **MiniMax Provider** - [MiniMax chat completions, TTS, Anthropic native endpoint 전체 지원](../../docs/providers/minimax)
- **AWS Polly TTS** - [AWS Polly API를 사용하는 신규 TTS provider](../../docs/providers/aws_polly)
- **SSO Role Mapping** - UI에서 SSO provider별 role mapping을 직접 설정할 수 있습니다.
- **Cost Estimator** - 여러 model과 request의 비용을 추정하는 신규 UI 도구입니다.
- **MCP Global Mode** - [visibility 제어와 함께 MCP server를 전역으로 설정합니다.](../../docs/mcp)
- **Interactions API Bridge** - [Interactions API에서 모든 LiteLLM provider를 사용합니다.](../../docs/interactions)
- **RAG Query Endpoint** - [retrieval-augmented generation용 신규 RAG Search/Query endpoint](../../docs/search/index)
- **UI 사용법 - Endpoint Activity** - [이제 UI에서 Endpoint Activity Metrics를 볼 수 있습니다.](../../docs/proxy/endpoint_activity)
- **50% overhead 감소** - LiteLLM이 이제 LLM provider에 2.5배 더 많은 request를 보냅니다.


---

## 성능 - 50% overhead 감소 {#performance---50-overhead-reduction}

LiteLLM은 provider configuration resolution에서 순차 `if`/`elif` 체인을 O(1) dictionary lookup으로 대체해 이제 LLM provider에 2.5배 더 많은 request를 보냅니다(92.7% 개선). 이 최적화는 proxy server로 들어오는 모든 HTTP request마다 호출되는 client decorator 내부에서 실행되므로 영향이 큽니다.

### 이전 {#before}

> **참고:** 여기서는 provider metric이 더 나빠 보이는 것이 좋은 신호입니다. request가 LiteLLM 내부에서 쓰는 시간이 줄었다는 뜻입니다.

```
============================================================
Fake LLM Provider Stats (When called by LiteLLM)
============================================================
Total Time:            0.56s
Requests/Second:       10746.68

Latency Statistics (seconds):
   Mean:               0.2039s
   Median (p50):       0.2310s
   Min:                0.0323s
   Max:                0.3928s
   Std Dev:            0.1166s
   p95:                0.3574s
   p99:                0.3748s

Status Codes:
   200: 6000
```

### 이후 {#after}

```
============================================================
Fake LLM Provider Stats (When called by LiteLLM)
============================================================
Total Time:            1.42s
Requests/Second:       4224.49

Latency Statistics (seconds):
   Mean:               0.5300s
   Median (p50):       0.5871s
   Min:                0.0885s
   Max:                1.0482s
   Std Dev:            0.3065s
   p95:                0.9750s
   p99:                1.0444s

Status Codes:
   200: 6000
```

> benchmark는 network latency를 제거하기 위해 lightweight LLM provider와 함께 LiteLLM을 로컬에서 실행합니다. 내부 overhead와 병목만 분리해 단일 instance의 순수 LiteLLM overhead 감소에 집중하기 위한 방식입니다.

---

### UI 사용법 - Endpoint Activity {#ui-사용법---endpoint-activity}

<Image
img={require('../../img/ui_endpoint_activity.png')}
style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이제 사용자는 UI에서 Endpoint Activity Metrics를 볼 수 있습니다.

---

## 신규 provider 및 endpoint {#new-providers-and-endpoints}

### 신규 provider(11개) {#new-providers-11-new-providers}

| Provider | 지원되는 LiteLLM endpoint | 설명 |
| -------- | ------------------- | ----------- |
| [Manus](../../docs/providers/manus) | `/responses` | agentic workflow용 Manus API |
| [Manus](../../docs/providers/manus) | `GET /responses` | response 조회용 Manus API |
| [Manus](../../docs/providers/manus) | `/files` | file management용 Manus API |
| [MiniMax](../../docs/providers/minimax) | `/chat/completions` | MiniMax chat completions |
| [MiniMax](../../docs/providers/minimax) | `/audio/speech` | MiniMax text-to-speech |
| [AWS Polly](../../docs/providers/aws_polly) | `/audio/speech` | AWS Polly text-to-speech API |
| [GigaChat](../../docs/providers/gigachat) | `/chat/completions` | Russian language AI용 GigaChat provider |
| [LlamaGate](../../docs/providers/llamagate) | `/chat/completions` | LlamaGate chat completions |
| [LlamaGate](../../docs/providers/llamagate) | `/embeddings` | LlamaGate embeddings |
| [Abliteration AI](../../docs/providers/abliteration) | `/chat/completions` | Abliteration.ai provider 지원 |
| [Bedrock](../../docs/providers/bedrock) | `/v1/messages/count_tokens` | token counting용 신규 provider인 Bedrock |

### 신규 LLM API endpoint(3개) {#new-llm-api-endpoints-3-new-endpoints}

| Endpoint | Method | 설명 | 문서 |
| -------- | ------ | ----------- | ------------- |
| `/responses/compact` | POST | compact responses API endpoint | [문서](../../docs/response_api) |
| `/rag/query` | POST | RAG Search/Query endpoint | [문서](../../docs/search/index) |
| `/containers/{id}/files` | POST | container에 file upload | [문서](../../docs/container_files) |

---

## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

#### 신규 model 지원(100개 이상) {#new-model-support-100-new-models}

| Provider | Model | Context Window | Input($/1M tokens) | Output($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Azure | `azure/gpt-5.2` | 400K | $1.75 | $14.00 | 추론, vision, caching |
| Azure | `azure/gpt-5.2-chat` | 128K | $1.75 | $14.00 | reasoning, vision |
| Azure | `azure/gpt-5.2-pro` | 400K | $21.00 | $168.00 | 추론, vision, web search |
| Azure | `azure/gpt-image-1.5` | - | token 기준 | token 기준 | image generation/editing |
| Azure AI | `azure_ai/gpt-oss-120b` | 131K | $0.15 | $0.60 | function calling |
| Azure AI | `azure_ai/flux.2-pro` | - | - | $0.04/image | image generation |
| Azure AI | `azure_ai/deepseek-v3.2` | 164K | $0.58 | $1.68 | 추론, function calling |
| Bedrock | `amazon.nova-2-multimodal-embeddings-v1:0` | 8K | $0.135 | - | 멀티모달 embedding |
| Bedrock | `writer.palmyra-x4-v1:0` | 128K | $2.50 | $10.00 | function calling, PDF 처리 |
| Bedrock | `writer.palmyra-x5-v1:0` | 1M | $0.60 | $6.00 | function calling, PDF 처리 |
| Bedrock | `moonshot.kimi-k2-v1:0` | - | - | - | Kimi K2 model |
| Cerebras | `cerebras/zai-glm-4.6` | 128K | $2.25 | $2.75 | 추론, function calling |
| GigaChat | `gigachat/GigaChat-2-Lite` | - | - | - | chat completions |
| GigaChat | `gigachat/GigaChat-2-Max` | - | - | - | chat completions |
| GigaChat | `gigachat/GigaChat-2-Pro` | - | - | - | chat completions |
| Gemini | `gemini/veo-3.1-generate-001` | - | - | - | video generation |
| Gemini | `gemini/veo-3.1-fast-generate-001` | - | - | - | video generation |
| GitHub Copilot | 25개 이상 model | 다양함 | - | - | chat completions |
| LlamaGate | 15개 이상 model | 다양함 | - | - | chat, vision, embeddings |
| MiniMax | `minimax/abab7-chat-preview` | - | - | - | chat completions |
| Novita | 80개 이상 model | 다양함 | 다양함 | 다양함 | chat, vision, embeddings |
| OpenRouter | `openrouter/google/gemini-3-flash-preview` | - | - | - | chat completions |
| Together AI | 여러 model | 다양함 | 다양함 | 다양함 | response schema 지원 |
| Vertex AI | `vertex_ai/zai-glm-4.7` | - | - | - | GLM 4.7 지원 |

#### 기능 {#features}

- **[Gemini](../../docs/providers/gemini)**
    - chat completion에 image token 추가 - [PR #18327](https://github.com/BerriAI/litellm/pull/18327)
    - image generation에 usage object 추가 - [PR #18328](https://github.com/BerriAI/litellm/pull/18328)
    - tool call id를 통한 thought signature 지원 추가 - [PR #18374](https://github.com/BerriAI/litellm/pull/18374)
    - non tool call request용 thought signature 추가 - [PR #18581](https://github.com/BerriAI/litellm/pull/18581)
    - system instruction 보존 - [PR #18585](https://github.com/BerriAI/litellm/pull/18585)
    - tool response의 Gemini 3 image 수정 - [PR #18190](https://github.com/BerriAI/litellm/pull/18190)
    - `google_search` tool parameter에 `snake_case` 지원 - [PR #18451](https://github.com/BerriAI/litellm/pull/18451)
    - Google GenAI adapter inline data 지원 - [PR #18477](https://github.com/BerriAI/litellm/pull/18477)
    - 중단된 Google model에 `deprecation_date` 추가 - [PR #18550](https://github.com/BerriAI/litellm/pull/18550)
- **[Vertex AI](../../docs/providers/vertex)**
    - global location 지원을 위한 중앙화된 `get_vertex_base_url()` helper 추가 - [PR #18410](https://github.com/BerriAI/litellm/pull/18410)
    - Vertex AI Anthropic용 image URL을 base64로 변환 - [PR #18497](https://github.com/BerriAI/litellm/pull/18497)
    - API spec에 맞게 tool type별 Tool object 분리 - [PR #18514](https://github.com/BerriAI/litellm/pull/18514)
    - `VertexGeminiConfig`에 `thought_signatures` 추가 - [PR #18853](https://github.com/BerriAI/litellm/pull/18853)
    - Vertex AI API key 지원 추가 - [PR #18806](https://github.com/BerriAI/litellm/pull/18806)
    - zai glm-4.7 model 지원 추가 - [PR #18782](https://github.com/BerriAI/litellm/pull/18782)
- **[Azure](../../docs/providers/azure/azure)**
    - cost map에 Azure gpt-image-1.5 pricing 추가 - [PR #18347](https://github.com/BerriAI/litellm/pull/18347)
    - `azure/gpt-5.2-chat` model 추가 - [PR #18361](https://github.com/BerriAI/litellm/pull/18361)
    - Azure AD token을 통한 image generation 지원 추가 - [PR #18413](https://github.com/BerriAI/litellm/pull/18413)
    - Azure OpenAI GPT-5.2 model의 `logprobs` 지원 추가 - [PR #18856](https://github.com/BerriAI/litellm/pull/18856)
    - image generation/editing용 Azure BFL Flux 2 model 추가 - [PR #18764](https://github.com/BerriAI/litellm/pull/18764), [PR #18766](https://github.com/BerriAI/litellm/pull/18766)
- **[Bedrock](../../docs/providers/bedrock)**
    - Bedrock Kimi K2 model 지원 추가 - [PR #18797](https://github.com/BerriAI/litellm/pull/18797)
    - bedrock passthrough에서 model id 지원 추가 - [PR #18800](https://github.com/BerriAI/litellm/pull/18800)
    - Bedrock provider의 Nova model 감지 수정 - [PR #18250](https://github.com/BerriAI/litellm/pull/18250)
    - OpenAI format에서 변환할 때 `toolUse.input`이 항상 dict가 되도록 보장 - [PR #18414](https://github.com/BerriAI/litellm/pull/18414)
- **[Databricks](../../docs/providers/databricks)**
    - 향상된 authentication, security 기능, custom user-agent 지원 추가 - [PR #18349](https://github.com/BerriAI/litellm/pull/18349)
- **[MiniMax](../../docs/providers/minimax)**
    - MiniMax chat completion 지원 추가 - [PR #18380](https://github.com/BerriAI/litellm/pull/18380)
    - MiniMax용 Anthropic native endpoint 지원 추가 - [PR #18377](https://github.com/BerriAI/litellm/pull/18377)
    - MiniMax TTS 지원 추가 - [PR #18334](https://github.com/BerriAI/litellm/pull/18334)
    - UI dashboard에 MiniMax provider 지원 추가 - [PR #18496](https://github.com/BerriAI/litellm/pull/18496)
- **[Together AI](../../docs/providers/togetherai)**
    - 지원되는 모든 Together AI model에 `supports_response_schema` 추가 - [PR #18368](https://github.com/BerriAI/litellm/pull/18368)
- **[OpenRouter](../../docs/providers/openrouter)**
    - OpenRouter embeddings API 지원 추가 - [PR #18391](https://github.com/BerriAI/litellm/pull/18391)
- **[Anthropic](../../docs/providers/anthropic)**
    - `server_tool_use` 및 `tool_search_tool_result` block 전달 - [PR #18770](https://github.com/BerriAI/litellm/pull/18770)
    - image tool call result에 Anthropic cache control option 추가 - [PR #18674](https://github.com/BerriAI/litellm/pull/18674)
- **[Ollama](../../docs/providers/ollama)**
    - ollama embedding에 dimension 추가 - [PR #18536](https://github.com/BerriAI/litellm/pull/18536)
    - Ollama용 data URL에서 순수 base64 data 추출 - [PR #18465](https://github.com/BerriAI/litellm/pull/18465)
- **[Watsonx](../../docs/providers/watsonx/index)**
    - Watsonx field 지원 추가 - [PR #18569](https://github.com/BerriAI/litellm/pull/18569)
    - Watsonx Audio Transcription 수정: model field filter - [PR #18810](https://github.com/BerriAI/litellm/pull/18810)
- **[SAP](../../docs/providers/sap)**
    - proxy UI의 list에 SAP credential 추가 - [PR #18375](https://github.com/BerriAI/litellm/pull/18375)
    - `allowed_openai_params`의 extra param을 pass-through - [PR #18432](https://github.com/BerriAI/litellm/pull/18432)
    - SAP AI Core Tracking용 client header 추가 - [PR #18714](https://github.com/BerriAI/litellm/pull/18714)
- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - deepseek-v3p2 pricing 수정 - [PR #18483](https://github.com/BerriAI/litellm/pull/18483)
- **[ZAI](../../docs/providers/zai)**
    - reasoning을 지원하는 GLM-4.7 model 추가 - [PR #18476](https://github.com/BerriAI/litellm/pull/18476)
- **[Codestral](../../docs/providers/codestral)**
    - codestral chat 및 FIM endpoint를 올바르게 route - [PR #18467](https://github.com/BerriAI/litellm/pull/18467)
- **[Azure AI](../../docs/providers/azure_ai)**
    - `azure_ai`를 통한 messages API의 authentication error 수정 - [PR #18500](https://github.com/BerriAI/litellm/pull/18500)

#### 신규 provider 지원 {#new-provider-support}

- **[AWS Polly](../../docs/providers/aws_polly)** - TTS용 AWS Polly API 추가 - [PR #18326](https://github.com/BerriAI/litellm/pull/18326)
- **[GigaChat](../../docs/providers/gigachat)** - GigaChat provider 지원 추가 - [PR #18564](https://github.com/BerriAI/litellm/pull/18564)
- **[LlamaGate](../../docs/providers/llamagate)** - LlamaGate를 신규 provider로 추가 - [PR #18673](https://github.com/BerriAI/litellm/pull/18673)
- **[Abliteration AI](../../docs/providers/abliteration)** - abliteration.ai provider 추가 - [PR #18678](https://github.com/BerriAI/litellm/pull/18678)
- **[Manus](../../docs/providers/manus)** - `/responses`, `GET /responses`의 Manus API 지원 추가 - [PR #18804](https://github.com/BerriAI/litellm/pull/18804)
- **`openai_like`를 통한 5개 AI provider** - `openai_like`를 사용하는 5개 AI provider 추가 - [PR #18362](https://github.com/BerriAI/litellm/pull/18362)

### 버그 수정 {#bug-fixes}

- **[Gemini](../../docs/providers/gemini)**
    - context window 초과 error를 올바르게 catch - [PR #18283](https://github.com/BerriAI/litellm/pull/18283)
    - 지원이 제거된 prompt caching header 제거 - [PR #18579](https://github.com/BerriAI/litellm/pull/18579)
    - audio file id가 있는 generate content request 수정 - [PR #18745](https://github.com/BerriAI/litellm/pull/18745)
    - `google_genai` streaming adapter의 provider handling 수정 - [PR #18845](https://github.com/BerriAI/litellm/pull/18845)
- **[Groq](../../docs/providers/groq)**
    - deprecated Groq model 제거 및 model registry 업데이트 - [PR #18062](https://github.com/BerriAI/litellm/pull/18062)
- **[Vertex AI](../../docs/providers/vertex)**
    - Vertex AI count tokens endpoint의 unsupported region 처리 - [PR #18665](https://github.com/BerriAI/litellm/pull/18665)
- **일반**
    - image embedding request의 request body 수정 - [PR #18336](https://github.com/BerriAI/litellm/pull/18336)
    - streaming에 text와 `tool_calls`가 모두 있을 때 `tool_calls`가 사라지는 문제 수정 - [PR #18316](https://github.com/BerriAI/litellm/pull/18316)
    - gpt-image-1.5에 모든 resolution 추가 - [PR #18586](https://github.com/BerriAI/litellm/pull/18586)
    - token-based pricing을 사용하는 gpt-image-1 cost calculation 수정 - [PR #17906](https://github.com/BerriAI/litellm/pull/17906)
    - `response_format`이 `extra_body`로 새는 문제 수정 - [PR #18859](https://github.com/BerriAI/litellm/pull/18859)
    - 일관성을 위해 `max_tokens`와 `max_output_tokens` 정렬 - [PR #18820](https://github.com/BerriAI/litellm/pull/18820)

---

## LLM API endpoint {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - 신규 compact endpoint(`v1/responses/compact`) 추가 - [PR #18697](https://github.com/BerriAI/litellm/pull/18697)
    - streaming callback hook 추가 지원 - [PR #18513](https://github.com/BerriAI/litellm/pull/18513)
    - reasoning effort를 summary param에 mapping 추가 - [PR #18635](https://github.com/BerriAI/litellm/pull/18635)
    - `ResponsesAPIResponse`에 `output_text` property 추가 - [PR #18491](https://github.com/BerriAI/litellm/pull/18491)
    - completions responses API bridge에 annotation 추가 - [PR #18754](https://github.com/BerriAI/litellm/pull/18754)
- **[Interactions API](../../docs/interactions)**
    - 모든 LiteLLM provider 사용 허용(interactions -> responses API bridge) - [PR #18373](https://github.com/BerriAI/litellm/pull/18373)
- **[RAG Search API](../../docs/search/index)**
    - RAG Search/Query endpoint 추가 - [PR #18376](https://github.com/BerriAI/litellm/pull/18376)
- **[CountTokens API](../../docs/anthropic_count_tokens)**
    - `/v1/messages/count_tokens`용 신규 provider로 Bedrock 추가 - [PR #18858](https://github.com/BerriAI/litellm/pull/18858)
- **[Generate Content](../../docs/providers/gemini)**
    - LLM route에 generate content 추가 - [PR #18405](https://github.com/BerriAI/litellm/pull/18405)
- **일반**
    - error response 변환을 위해 `async_post_call_failure_hook` 활성화 - [PR #18348](https://github.com/BerriAI/litellm/pull/18348)
    - `total_tokens`가 없고 계산 가능하면 수동 계산 - [PR #18445](https://github.com/BerriAI/litellm/pull/18445)
    - UI에서 전송된 custom llm provider를 `get_llm_provider`에 추가 - [PR #18638](https://github.com/BerriAI/litellm/pull/18638)

#### 버그 {#bugs}

- **일반**
    - response conversion에서 빈 error object 처리 - [PR #18493](https://github.com/BerriAI/litellm/pull/18493)
    - streaming mode에서 client error status code 보존 - [PR #18698](https://github.com/BerriAI/litellm/pull/18698)
    - initial streaming error에 SSE format 대신 JSON error response 반환 - [PR #18757](https://github.com/BerriAI/litellm/pull/18757)
    - generateContent request의 custom api base용 auth header 수정 - [PR #18637](https://github.com/BerriAI/litellm/pull/18637)
    - Deepinfra의 tool content가 string이 되도록 수정 - [PR #18739](https://github.com/BerriAI/litellm/pull/18739)
    - 전달된 response object의 incomplete usage 수정 - [PR #18799](https://github.com/BerriAI/litellm/pull/18799)
    - model name을 provider-defined name으로 통일 - [PR #18573](https://github.com/BerriAI/litellm/pull/18573)

---

## 관리 endpoint / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **SSO 설정**
    - SSO Role Mapping 기능 추가 - [PR #18090](https://github.com/BerriAI/litellm/pull/18090)
    - SSO Settings Page 추가 - [PR #18600](https://github.com/BerriAI/litellm/pull/18600)
    - SSO용 role mapping 추가 허용 - [PR #18593](https://github.com/BerriAI/litellm/pull/18593)
    - SSO Settings Page에 Role Mapping 추가 - [PR #18677](https://github.com/BerriAI/litellm/pull/18677)
    - SSO Settings loading state 추가 및 이전 SSO flow deprecate - [PR #18617](https://github.com/BerriAI/litellm/pull/18617)
- **가상 키**
    - key expiry 삭제 허용 - [PR #18278](https://github.com/BerriAI/litellm/pull/18278)
    - `/key/list`에 optional query param `"expand"` 추가 - [PR #18502](https://github.com/BerriAI/litellm/pull/18502)
    - Key Table loading skeleton 추가 - [PR #18527](https://github.com/BerriAI/litellm/pull/18527)
    - Keys Table column resizing 허용 - [PR #18424](https://github.com/BerriAI/litellm/pull/18424)
    - page 전환 중 가상 키 Table loading state 추가 - [PR #18619](https://github.com/BerriAI/litellm/pull/18619)
    - Key 및 Team Router Setting 추가 - [PR #18790](https://github.com/BerriAI/litellm/pull/18790)
    - Keys 및 Teams에서 `router_settings` 허용 - [PR #18675](https://github.com/BerriAI/litellm/pull/18675)
    - generate 시 key expiry 계산에 `timedelta` 사용 - [PR #18666](https://github.com/BerriAI/litellm/pull/18666)
- **모델 + endpoint**
    - Team Admin용 Model Clearer Flow 추가 - [PR #18532](https://github.com/BerriAI/litellm/pull/18532)
    - Model Page loading state 추가 - [PR #18574](https://github.com/BerriAI/litellm/pull/18574)
    - Model Page model provider select 성능 개선 - [PR #18425](https://github.com/BerriAI/litellm/pull/18425)
    - Model Page sorting이 전체 set을 정렬하도록 수정 - [PR #18420](https://github.com/BerriAI/litellm/pull/18420)
    - Model Hub Page refactor - [PR #18568](https://github.com/BerriAI/litellm/pull/18568)
    - UI에 request provider form 추가 - [PR #18704](https://github.com/BerriAI/litellm/pull/18704)
- **Organization 및 Team**
    - Organization Admin이 Organization Tab을 볼 수 있도록 허용 - [PR #18400](https://github.com/BerriAI/litellm/pull/18400)
    - Team Table에서 Organization Alias resolve - [PR #18401](https://github.com/BerriAI/litellm/pull/18401)
    - Organization Info View에서 Team Alias resolve - [PR #18404](https://github.com/BerriAI/litellm/pull/18404)
    - Organization Admin이 자신의 Organization Info를 볼 수 있도록 허용 - [PR #18417](https://github.com/BerriAI/litellm/pull/18417)
    - `/team/update`에서 `team_member_budget_duration` editing 허용 - [PR #18735](https://github.com/BerriAI/litellm/pull/18735)
    - reusable Duration Select 및 Team Update Member Budget Duration 추가 - [PR #18736](https://github.com/BerriAI/litellm/pull/18736)
- **사용량 및 Spend**
    - Spend log에 Error Code Filtering 추가 - [PR #18359](https://github.com/BerriAI/litellm/pull/18359)
    - UI에 Error Code Filtering 추가 - [PR #18366](https://github.com/BerriAI/litellm/pull/18366)
    - 사용량 Page User Max Budget 수정 - [PR #18555](https://github.com/BerriAI/litellm/pull/18555)
    - Daily Activity Table에 endpoint 추가 - [PR #18729](https://github.com/BerriAI/litellm/pull/18729)
    - 사용량에 Endpoint Activity 추가 - [PR #18798](https://github.com/BerriAI/litellm/pull/18798)
- **Cost Estimator**
    - AI Gateway용 Cost Estimator 추가 - [PR #18643](https://github.com/BerriAI/litellm/pull/18643)
    - 여러 request의 비용을 추정하는 view 추가 - [PR #18645](https://github.com/BerriAI/litellm/pull/18645)
    - cost estimator에서 여러 model 선택 허용 - [PR #18653](https://github.com/BerriAI/litellm/pull/18653)
- **CloudZero**
    - CloudZero의 create/delete path 개선 - [PR #18263](https://github.com/BerriAI/litellm/pull/18263)
    - CloudZero UI 문서 추가 - [PR #18350](https://github.com/BerriAI/litellm/pull/18350)
- **Playground**
    - Playground completions에 MCP test 지원 추가 - [PR #18440](https://github.com/BerriAI/litellm/pull/18440)
    - playground에 선택 가능한 MCP server 추가 - [PR #18578](https://github.com/BerriAI/litellm/pull/18578)
    - Playground에 custom proxy base URL 지원 추가 - [PR #18661](https://github.com/BerriAI/litellm/pull/18661)
- **일반 UI**
    - UI styling 개선 및 수정 - [PR #18310](https://github.com/BerriAI/litellm/pull/18310)
    - feature highlight용 reusable `"New"` badge component 추가 - [PR #18537](https://github.com/BerriAI/litellm/pull/18537)
    - New Badge 숨김 - [PR #18547](https://github.com/BerriAI/litellm/pull/18547)
    - Budget page에 tab 추가 - [PR #18576](https://github.com/BerriAI/litellm/pull/18576)
    - logo click 시 올바른 URL로 이동 - [PR #18575](https://github.com/BerriAI/litellm/pull/18575)
    - meta URL 설정을 위한 UI 지원 추가 - [PR #18580](https://github.com/BerriAI/litellm/pull/18580)
    - login 시 이전 UI session token 만료 처리 - [PR #18557](https://github.com/BerriAI/litellm/pull/18557)
    - license endpoint 추가 - [PR #18311](https://github.com/BerriAI/litellm/pull/18311)
    - Router Fields endpoint 및 Router Fields용 React Query 추가 - [PR #18880](https://github.com/BerriAI/litellm/pull/18880)

#### 버그 {#bugs-1}

- **UI 수정**
    - Key Creation MCP Settings submit form이 의도치 않게 제출되는 문제 수정 - [PR #18355](https://github.com/BerriAI/litellm/pull/18355)
    - development environment에서 UI가 사라지는 문제 수정 - [PR #18399](https://github.com/BerriAI/litellm/pull/18399)
    - Disable 관리자 UI Flag 수정 - [PR #18397](https://github.com/BerriAI/litellm/pull/18397)
    - Model Page에서 Model Analytics 제거 - [PR #18552](https://github.com/BerriAI/litellm/pull/18552)
    - link 추가 시 Useful Links modal 제거 - [PR #18602](https://github.com/BerriAI/litellm/pull/18602)
    - provider 변경 시 SSO Edit Modal의 Role Mapping value clear - [PR #18680](https://github.com/BerriAI/litellm/pull/18680)
    - UI login case sensitivity 수정 - [PR #18877](https://github.com/BerriAI/litellm/pull/18877)
- **API 수정**
    - User Invite 및 Key Generation email notification logic 수정 - [PR #18524](https://github.com/BerriAI/litellm/pull/18524)
    - Proxy Config Callback normalize - [PR #18775](https://github.com/BerriAI/litellm/pull/18775)
    - model이 설정되지 않았을 때 500 대신 빈 data array 반환 - [PR #18556](https://github.com/BerriAI/litellm/pull/18556)
    - org level max budget 강제 적용 - [PR #18813](https://github.com/BerriAI/litellm/pull/18813)

---

## AI 통합 {#ai-integrations}

### 신규 통합(4개) {#new-integrations-4-new-integrations}

| Integration | Type | 설명 |
| ----------- | ---- | ----------- |
| [Focus](../../docs/observability/focus) | Logging | observability용 Focus export 지원 - [PR #18802](https://github.com/BerriAI/litellm/pull/18802) |
| [SigNoz](../../docs/observability/signoz) | Logging | observability용 SigNoz integration - [PR #18726](https://github.com/BerriAI/litellm/pull/18726) |
| [Qualifire](../../docs/proxy/guardrails/qualifire) | 가드레일 | Qualifire guardrail 및 eval webhook - [PR #18594](https://github.com/BerriAI/litellm/pull/18594) |
| [Levo AI](../../docs/observability/levo_integration) | 가드레일 | security용 Levo AI integration - [PR #18529](https://github.com/BerriAI/litellm/pull/18529) |

### Logging {#logging}

- **[DataDog](../../docs/proxy/logging#datadog)**
    - `parent_id`가 없을 때 span kind fallback 수정 - [PR #18418](https://github.com/BerriAI/litellm/pull/18418)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Gemini `cached_tokens`를 Langfuse `cache_read_input_tokens`로 mapping - [PR #18614](https://github.com/BerriAI/litellm/pull/18614)
- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - prometheus metric name을 `DEFINED_PROMETHEUS_METRICS`와 정렬 - [PR #18463](https://github.com/BerriAI/litellm/pull/18463)
    - request queue time 및 guardrail용 Prometheus metric 추가 - [PR #17973](https://github.com/BerriAI/litellm/pull/17973)
    - cache hit, miss, token용 caching metric 추가 - [PR #18755](https://github.com/BerriAI/litellm/pull/18755)
    - invalid API key request의 metric skip - [PR #18788](https://github.com/BerriAI/litellm/pull/18788)
- **[Braintrust](../../docs/proxy/logging#braintrust)**
    - async logging에서 `span_attributes`를 전달하고 non-root span의 tag skip - [PR #18409](https://github.com/BerriAI/litellm/pull/18409)
- **[CloudZero](../../docs/proxy/logging#cloudzero)**
    - CloudZero에 user email 추가 - [PR #18584](https://github.com/BerriAI/litellm/pull/18584)
- **[OpenTelemetry](../../docs/proxy/logging#opentelemetry)**
    - 이미 설정된 opentelemetry provider 사용 - [PR #18279](https://github.com/BerriAI/litellm/pull/18279)
    - LiteLLM이 external OTEL span을 닫지 않도록 방지 - [PR #18553](https://github.com/BerriAI/litellm/pull/18553)
    - OpenTelemetry service name용 arize project name 설정 허용 - [PR #18738](https://github.com/BerriAI/litellm/pull/18738)
- **[LangSmith](../../docs/proxy/logging#langsmith)**
    - tenant ID가 있는 LangSmith organization-scoped API key 지원 추가 - [PR #18623](https://github.com/BerriAI/litellm/pull/18623)
- **[Generic API Logger](../../docs/proxy/logging#generic-api-logger)**
    - GenericAPILogger에 `log_format` option 추가 - [PR #18587](https://github.com/BerriAI/litellm/pull/18587)

### 가드레일 {#가드레일}

- **[Content Filter](../../docs/proxy/guardrails/litellm_content_filter)**
    - content filter log page 추가 - [PR #18335](https://github.com/BerriAI/litellm/pull/18335)
    - guardrail의 실제 event type log 기록 - [PR #18489](https://github.com/BerriAI/litellm/pull/18489)
- **[Qualifire](../../docs/proxy/guardrails/qualifire)**
    - Qualifire eval webhook 추가 - [PR #18836](https://github.com/BerriAI/litellm/pull/18836)
- **[Lasso Security](../../docs/proxy/guardrails/lasso_security)**
    - Lasso guardrail API 문서 추가 - [PR #18652](https://github.com/BerriAI/litellm/pull/18652)
- **[Noma Security](../../docs/proxy/guardrails/noma_security)**
    - Noma용 MCP guardrail 지원 추가 - [PR #18668](https://github.com/BerriAI/litellm/pull/18668)
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - 중복 Bedrock guardrail block handling 제거 - [PR #18634](https://github.com/BerriAI/litellm/pull/18634)
- **일반**
    - generic guardrail API 업데이트 - [PR #18647](https://github.com/BerriAI/litellm/pull/18647)
    - case-sensitive tool permission guardrail validation으로 인한 proxy startup failure 방지 - [PR #18662](https://github.com/BerriAI/litellm/pull/18662)
    - 모든 guardrail type으로 case normalization 확장 - [PR #18664](https://github.com/BerriAI/litellm/pull/18664)
    - unified guardrail의 MCP handling 수정 - [PR #18630](https://github.com/BerriAI/litellm/pull/18630)
    - guardrail `precallhook`의 embeddings calltype 수정 - [PR #18740](https://github.com/BerriAI/litellm/pull/18740)

---

## 비용 추적, budget 및 rate limiting {#cost-tracking-budgets-and-rate-limiting}

- **Platform Fee / Margins** - Platform Fee / Margins 지원 추가 - [PR #18427](https://github.com/BerriAI/litellm/pull/18427)
- **Negative Budget Validation** - negative budget validation 추가 - [PR #18583](https://github.com/BerriAI/litellm/pull/18583)
- **Cost Calculation 수정**
    - `reasoning_tokens`만 있고 `text_tokens`가 없을 때 cost calculation 수정 - [PR #18607](https://github.com/BerriAI/litellm/pull/18607)
    - background cost tracking test 수정 - [PR #18588](https://github.com/BerriAI/litellm/pull/18588)
- **Tag Routing** - tag matching을 ANY와 ALL 사이에서 toggle하도록 지원 - [PR #18776](https://github.com/BerriAI/litellm/pull/18776)

---

## MCP Gateway {#mcp-gateway}

- **MCP Global Mode** - MCP global mode 추가 - [PR #18639](https://github.com/BerriAI/litellm/pull/18639)
- **MCP Server Visibility** - 설정 가능한 MCP server visibility 추가 - [PR #18681](https://github.com/BerriAI/litellm/pull/18681)
- **MCP Registry** - MCP registry 추가 - [PR #18850](https://github.com/BerriAI/litellm/pull/18850)
- **MCP Stdio Header** - MCP stdio header env override 지원 - [PR #18324](https://github.com/BerriAI/litellm/pull/18324)
- **Parallel Tool Fetching** - 여러 MCP server의 tool fetching 병렬화 - [PR #18627](https://github.com/BerriAI/litellm/pull/18627)
- **MCP Server Listing 최적화** - optimized listing용 health check 분리 - [PR #18530](https://github.com/BerriAI/litellm/pull/18530)
- **Auth 개선**
    - MCP connection test endpoint에 auth 요구 - [PR #18290](https://github.com/BerriAI/litellm/pull/18290)
    - MCP gateway OAuth2 auth issue 및 ClosedResourceError 수정 - [PR #18281](https://github.com/BerriAI/litellm/pull/18281)
- **버그 수정**
    - MCP server health status reporting 수정 - [PR #18443](https://github.com/BerriAI/litellm/pull/18443)
    - OpenAPI to MCP tool conversion 수정 - [PR #18597](https://github.com/BerriAI/litellm/pull/18597)
    - security를 위해 `exec()` 사용 제거 및 invalid OpenAPI parameter name 처리 - [PR #18480](https://github.com/BerriAI/litellm/pull/18480)
    - 여러 server를 동시에 사용할 때의 MCP error 수정 - [PR #18855](https://github.com/BerriAI/litellm/pull/18855)
- **MCP Fetching Logic을 React Query로 migration** - [PR #18352](https://github.com/BerriAI/litellm/pull/18352)

---

## 성능 / load balancing / reliability 개선 {#performance--loadbalancing--reliability-improvements}

- **Provider Config Lookup 92.7% 개선** - LiteLLM이 이제 LLM provider에 2.5배 더 많은 부하를 보냅니다. - [PR #18867](https://github.com/BerriAI/litellm/pull/18867)
- **Lazy Loading 개선**
    - registry pattern으로 lazy import handler 통합 - [PR #18389](https://github.com/BerriAI/litellm/pull/18389)
    - 180개 이상 LLM config class 전체의 lazy loading migration 완료 - [PR #18392](https://github.com/BerriAI/litellm/pull/18392)
    - 추가 component(type, callback, utility) lazy load - [PR #18396](https://github.com/BerriAI/litellm/pull/18396)
    - `get_llm_provider`에 lazy loading 추가 - [PR #18591](https://github.com/BerriAI/litellm/pull/18591)
    - heavy audio library 및 logger lazy-load - [PR #18592](https://github.com/BerriAI/litellm/pull/18592)
    - `litellm/utils.py`의 9개 heavy import lazy load - [PR #18595](https://github.com/BerriAI/litellm/pull/18595)
    - import time 및 memory usage 개선을 위해 heavy import lazy load - [PR #18610](https://github.com/BerriAI/litellm/pull/18610)
    - provider config, model info class, streaming handler의 lazy loading 구현 - [PR #18611](https://github.com/BerriAI/litellm/pull/18611)
    - 15개 additional import lazy load - [PR #18613](https://github.com/BerriAI/litellm/pull/18613)
    - 15개 이상 unused import lazy load - [PR #18616](https://github.com/BerriAI/litellm/pull/18616)
    - `DatadogLLMObsInitParams` lazy load - [PR #18658](https://github.com/BerriAI/litellm/pull/18658)
    - `utils.py` lazy import를 registry pattern으로 migration - [PR #18657](https://github.com/BerriAI/litellm/pull/18657)
    - `get_llm_provider` 및 `remove_index_from_tool_calls` lazy load - [PR #18608](https://github.com/BerriAI/litellm/pull/18608)
- **Router 개선**
    - startup에서 `routing_strategy`를 validate해 helpful error와 함께 fast fail - [PR #18624](https://github.com/BerriAI/litellm/pull/18624)
    - retry logic의 `num_retries` tracking 수정 - [PR #18712](https://github.com/BerriAI/litellm/pull/18712)
    - 여러 credential을 쓰는 wildcard routing의 error message 및 validation 개선 - [PR #18629](https://github.com/BerriAI/litellm/pull/18629)
- **Memory 개선**
    - memory pattern detection test 추가 및 bad memory pattern 수정 - [PR #18589](https://github.com/BerriAI/litellm/pull/18589)
    - memory test에 unbounded data structure detection 추가 - [PR #18590](https://github.com/BerriAI/litellm/pull/18590)
    - CI integration이 포함된 memory leak detection test 추가 - [PR #18881](https://github.com/BerriAI/litellm/pull/18881)
- **Database**
    - 더 빠른 duplicate email check를 위해 `LOWER(user_email)`에 index 추가 - [PR #18828](https://github.com/BerriAI/litellm/pull/18828)
    - 15분 connection failure 방지를 위해 RDS IAM token을 proactive refresh - [PR #18795](https://github.com/BerriAI/litellm/pull/18795)
    - `database_connection_pool_limit`이 worker별로 적용됨을 명확화 - [PR #18780](https://github.com/BerriAI/litellm/pull/18780)
    - `base_connection_pool_limit` default value를 동일하게 조정 - [PR #18721](https://github.com/BerriAI/litellm/pull/18721)
- **Docker**
    - audio processing을 위해 database Docker image에 `libsndfile` 추가 - [PR #18612](https://github.com/BerriAI/litellm/pull/18612)
    - performance analysis용 `line_profiler` 지원 추가 및 Windows CRLF issue 수정 - [PR #18773](https://github.com/BerriAI/litellm/pull/18773)
- **Helm**
    - Helm chart에 lifecycle 지원 추가 - [PR #18517](https://github.com/BerriAI/litellm/pull/18517)
- **인증**
    - Kubernetes ServiceAccount JWT authentication 지원 추가 - [PR #18055](https://github.com/BerriAI/litellm/pull/18055)
    - event loop blocking 방지를 위해 async anthropic client 사용 - [PR #18435](https://github.com/BerriAI/litellm/pull/18435)
- **Logging Worker**
    - multiprocessing에서 event loop 변경 처리 - [PR #18423](https://github.com/BerriAI/litellm/pull/18423)
- **Security**
    - error response에서 expired key plaintext leak 방지 - [PR #18860](https://github.com/BerriAI/litellm/pull/18860)
    - model info의 extra header secret masking - [PR #18822](https://github.com/BerriAI/litellm/pull/18822)
    - `request_tags`의 duplicate User-Agent tag 방지 - [PR #18723](https://github.com/BerriAI/litellm/pull/18723)
    - litellm api key를 올바르게 사용 - [PR #18832](https://github.com/BerriAI/litellm/pull/18832)
- **기타**
    - `main.py`의 중복 import 제거 - [PR #18406](https://github.com/BerriAI/litellm/pull/18406)
    - VCR cassette creation issue 수정을 위해 `LITELLM_DISABLE_LAZY_LOADING` env var 추가 - [PR #18725](https://github.com/BerriAI/litellm/pull/18725)
    - router 지원 수정을 위해 `LlmProviders` enum에 `xiaomi_mimo` 추가 - [PR #18819](https://github.com/BerriAI/litellm/pull/18819)
    - old Python에서 current `grpcio`로 installation 허용 - [PR #18473](https://github.com/BerriAI/litellm/pull/18473)
    - boto3 client에 Custom CA certificate 추가 - [PR #18852](https://github.com/BerriAI/litellm/pull/18852)
    - `bedrock_cache`, `metadata`, `max_model_budget` 수정 - [PR #18872](https://github.com/BerriAI/litellm/pull/18872)
    - LiteLLM SDK embedding header missing field 수정 - [PR #18844](https://github.com/BerriAI/litellm/pull/18844)
    - automatic reasoning summary inclusion을 feature flag 뒤로 이동 - [PR #18688](https://github.com/BerriAI/litellm/pull/18688)
    - `turn_off_message_logging`이 `proxy_server_request` field의 request message를 redact하지 않는 문제 수정 - [PR #18897](https://github.com/BerriAI/litellm/pull/18897)

---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - MiniMax 문서를 올바른 format으로 업데이트 - [PR #18403](https://github.com/BerriAI/litellm/pull/18403)
    - 5개 AI provider 문서 추가 - [PR #18388](https://github.com/BerriAI/litellm/pull/18388)
    - gpt-5-mini `reasoning_effort` supported value 수정 - [PR #18346](https://github.com/BerriAI/litellm/pull/18346)
    - Anthropic page의 PDF documentation inconsistency 수정 - [PR #18816](https://github.com/BerriAI/litellm/pull/18816)
    - embedding support를 포함하도록 OpenRouter 문서 업데이트 - [PR #18874](https://github.com/BerriAI/litellm/pull/18874)
    - 문서에 `LITELLM_REASONING_AUTO_SUMMARY` 추가 - [PR #18705](https://github.com/BerriAI/litellm/pull/18705)
- **MCP 문서**
    - Agentcore MCP server 문서 추가 - [PR #18603](https://github.com/BerriAI/litellm/pull/18603)
    - overview에서 MCP prompt/resource type 언급 - [PR #18669](https://github.com/BerriAI/litellm/pull/18669)
    - Focus 문서 추가 - [PR #18837](https://github.com/BerriAI/litellm/pull/18837)
- **가드레일 문서**
    - Qualifire 문서 hotfix - [PR #18724](https://github.com/BerriAI/litellm/pull/18724)
- **Infrastructure 문서**
    - IAM Roles Anywhere 문서 추가 - [PR #18559](https://github.com/BerriAI/litellm/pull/18559)
    - proxy config 문서의 formatting 수정 - [PR #18498](https://github.com/BerriAI/litellm/pull/18498)
    - proxy mode용 GCS cache 문서 누락 수정 - [PR #13328](https://github.com/BerriAI/litellm/pull/13328)
    - cloudzero sql 실행 방법 수정 - [PR #18841](https://github.com/BerriAI/litellm/pull/18841)
- **일반**
    - LiteLLM adopter section 추가 - [PR #18605](https://github.com/BerriAI/litellm/pull/18605)
    - `litellm.callbacks` 설정 관련 중복 comment 제거 - [PR #18711](https://github.com/BerriAI/litellm/pull/18711)
    - space 제거로 header가 markdown bold가 되도록 업데이트 - [PR #18846](https://github.com/BerriAI/litellm/pull/18846)
    - Manus 문서: 신규 provider - [PR #18817](https://github.com/BerriAI/litellm/pull/18817)

---

## 신규 기여자 {#new-contributors}

* @prasadkona님이 [PR #18349](https://github.com/BerriAI/litellm/pull/18349)에서 첫 기여를 했습니다
* @lucasrothman님이 [PR #18283](https://github.com/BerriAI/litellm/pull/18283)에서 첫 기여를 했습니다
* @aggeentik님이 [PR #18317](https://github.com/BerriAI/litellm/pull/18317)에서 첫 기여를 했습니다
* @mihidumh님이 [PR #18361](https://github.com/BerriAI/litellm/pull/18361)에서 첫 기여를 했습니다
* @Prazeina님이 [PR #18498](https://github.com/BerriAI/litellm/pull/18498)에서 첫 기여를 했습니다
* @systec-dk님이 [PR #18500](https://github.com/BerriAI/litellm/pull/18500)에서 첫 기여를 했습니다
* @xuan07t2님이 [PR #18514](https://github.com/BerriAI/litellm/pull/18514)에서 첫 기여를 했습니다
* @RensDimmendaal님이 [PR #18190](https://github.com/BerriAI/litellm/pull/18190)에서 첫 기여를 했습니다
* @yurekami님이 [PR #18483](https://github.com/BerriAI/litellm/pull/18483)에서 첫 기여를 했습니다
* @agertz7님이 [PR #18556](https://github.com/BerriAI/litellm/pull/18556)에서 첫 기여를 했습니다
* @yudelevi님이 [PR #18550](https://github.com/BerriAI/litellm/pull/18550)에서 첫 기여를 했습니다
* @smallp님이 [PR #18536](https://github.com/BerriAI/litellm/pull/18536)에서 첫 기여를 했습니다
* @kevinpauer님이 [PR #18569](https://github.com/BerriAI/litellm/pull/18569)에서 첫 기여를 했습니다
* @cansakiroglu님이 [PR #18517](https://github.com/BerriAI/litellm/pull/18517)에서 첫 기여를 했습니다
* @dee-walia20님이 [PR #18432](https://github.com/BerriAI/litellm/pull/18432)에서 첫 기여를 했습니다
* @luxinfeng님이 [PR #18477](https://github.com/BerriAI/litellm/pull/18477)에서 첫 기여를 했습니다
* @cantalupo555님이 [PR #18476](https://github.com/BerriAI/litellm/pull/18476)에서 첫 기여를 했습니다
* @andersk님이 [PR #18473](https://github.com/BerriAI/litellm/pull/18473)에서 첫 기여를 했습니다
* @majiayu000님이 [PR #18467](https://github.com/BerriAI/litellm/pull/18467)에서 첫 기여를 했습니다
* @amangupta-20님이 [PR #18529](https://github.com/BerriAI/litellm/pull/18529)에서 첫 기여를 했습니다
* @hamzaq453님이 [PR #18480](https://github.com/BerriAI/litellm/pull/18480)에서 첫 기여를 했습니다
* @ktsaou님이 [PR #18627](https://github.com/BerriAI/litellm/pull/18627)에서 첫 기여를 했습니다
* @FlibbertyGibbitz님이 [PR #18624](https://github.com/BerriAI/litellm/pull/18624)에서 첫 기여를 했습니다
* @drorIvry님이 [PR #18594](https://github.com/BerriAI/litellm/pull/18594)에서 첫 기여를 했습니다
* @urainshah님이 [PR #18524](https://github.com/BerriAI/litellm/pull/18524)에서 첫 기여를 했습니다
* @mangabits님이 [PR #18279](https://github.com/BerriAI/litellm/pull/18279)에서 첫 기여를 했습니다
* @0717376님이 [PR #18564](https://github.com/BerriAI/litellm/pull/18564)에서 첫 기여를 했습니다
* @nmgarza5님이 [PR #17330](https://github.com/BerriAI/litellm/pull/17330)에서 첫 기여를 했습니다
* @wileykestner님이 [PR #18445](https://github.com/BerriAI/litellm/pull/18445)에서 첫 기여를 했습니다
* @minijeong-log님이 [PR #14440](https://github.com/BerriAI/litellm/pull/14440)에서 첫 기여를 했습니다
* @Isaac4real님이 [PR #18710](https://github.com/BerriAI/litellm/pull/18710)에서 첫 기여를 했습니다
* @marukaz님이 [PR #18711](https://github.com/BerriAI/litellm/pull/18711)에서 첫 기여를 했습니다
* @rohitravirane님이 [PR #18712](https://github.com/BerriAI/litellm/pull/18712)에서 첫 기여를 했습니다
* @lizzzcai님이 [PR #18714](https://github.com/BerriAI/litellm/pull/18714)에서 첫 기여를 했습니다
* @hkd987님이 [PR #18673](https://github.com/BerriAI/litellm/pull/18673)에서 첫 기여를 했습니다
* @Mr-Pepe님이 [PR #18674](https://github.com/BerriAI/litellm/pull/18674)에서 첫 기여를 했습니다
* @gkarthi-signoz님이 [PR #18726](https://github.com/BerriAI/litellm/pull/18726)에서 첫 기여를 했습니다
* @Tianduo16님이 [PR #18723](https://github.com/BerriAI/litellm/pull/18723)에서 첫 기여를 했습니다
* @wilsonjr님이 [PR #18721](https://github.com/BerriAI/litellm/pull/18721)에서 첫 기여를 했습니다
* @abliteration-ai님이 [PR #18678](https://github.com/BerriAI/litellm/pull/18678)에서 첫 기여를 했습니다
* @danialkhan02님이 [PR #18770](https://github.com/BerriAI/litellm/pull/18770)에서 첫 기여를 했습니다
* @ihower님이 [PR #18409](https://github.com/BerriAI/litellm/pull/18409)에서 첫 기여를 했습니다
* @elkkhan님이 [PR #18391](https://github.com/BerriAI/litellm/pull/18391)에서 첫 기여를 했습니다
* @runixer님이 [PR #18435](https://github.com/BerriAI/litellm/pull/18435)에서 첫 기여를 했습니다
* @choby-shun님이 [PR #18776](https://github.com/BerriAI/litellm/pull/18776)에서 첫 기여를 했습니다
* @jutaz님이 [PR #18853](https://github.com/BerriAI/litellm/pull/18853)에서 첫 기여를 했습니다
* @sjmatta님이 [PR #18250](https://github.com/BerriAI/litellm/pull/18250)에서 첫 기여를 했습니다
* @andres-ortizl님이 [PR #18856](https://github.com/BerriAI/litellm/pull/18856)에서 첫 기여를 했습니다
* @gauthiermartin님이 [PR #18844](https://github.com/BerriAI/litellm/pull/18844)에서 첫 기여를 했습니다
* @mel2oo님이 [PR #18845](https://github.com/BerriAI/litellm/pull/18845)에서 첫 기여를 했습니다
* @DominikHallab님이 [PR #18846](https://github.com/BerriAI/litellm/pull/18846)에서 첫 기여를 했습니다
* @ji-chuan-che님이 [PR #18540](https://github.com/BerriAI/litellm/pull/18540)에서 첫 기여를 했습니다
* @raghav-stripe님이 [PR #18858](https://github.com/BerriAI/litellm/pull/18858)에서 첫 기여를 했습니다
* @akraines님이 [PR #18629](https://github.com/BerriAI/litellm/pull/18629)에서 첫 기여를 했습니다
* @otaviofbrito님이 [PR #18665](https://github.com/BerriAI/litellm/pull/18665)에서 첫 기여를 했습니다
* @chetanchoudhary-sumo님이 [PR #18587](https://github.com/BerriAI/litellm/pull/18587)에서 첫 기여를 했습니다
* @pascalwhoop님이 [PR #13328](https://github.com/BerriAI/litellm/pull/13328)에서 첫 기여를 했습니다
* @orgersh92님이 [PR #18652](https://github.com/BerriAI/litellm/pull/18652)에서 첫 기여를 했습니다
* @DevajMody님이 [PR #18497](https://github.com/BerriAI/litellm/pull/18497)에서 첫 기여를 했습니다
* @matt-greathouse님이 [PR #18247](https://github.com/BerriAI/litellm/pull/18247)에서 첫 기여를 했습니다
* @emerzon님이 [PR #18290](https://github.com/BerriAI/litellm/pull/18290)에서 첫 기여를 했습니다
* @Eric84626님이 [PR #18281](https://github.com/BerriAI/litellm/pull/18281)에서 첫 기여를 했습니다
* @LukasdeBoer님이 [PR #18055](https://github.com/BerriAI/litellm/pull/18055)에서 첫 기여를 했습니다
* @LingXuanYin님이 [PR #18513](https://github.com/BerriAI/litellm/pull/18513)에서 첫 기여를 했습니다
* @krisxia0506님이 [PR #18698](https://github.com/BerriAI/litellm/pull/18698)에서 첫 기여를 했습니다
* @LouisShark님이 [PR #18414](https://github.com/BerriAI/litellm/pull/18414)에서 첫 기여를 했습니다

---

## 전체 변경 이력 {#full-변경-이력}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.80.11.rc.1...v1.80.15-stable.1)**
