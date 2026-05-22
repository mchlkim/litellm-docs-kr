---
title: "[Preview] v1.80.10.rc.1 - Agent Gateway: Azure Foundry & Bedrock AgentCore"
slug: "v1-80-10"
date: 2025-12-13T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.80.10.rc.1
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.80.10
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Agent (A2A) Gateway 비용 추적** - [쿼리별 agent 비용, 토큰별 가격을 추적하고 dashboard에서 agent 사용량을 확인합니다](../../docs/a2a_cost_tracking)
- **신규 Agent Provider 2개** - agentic workflow를 위한 [LangGraph Agents](../../docs/providers/langgraph) 및 [Azure AI Foundry Agents](../../docs/providers/azure_ai_agents)
- **신규 Provider: SAP Gen AI Hub** - [chat completions를 포함한 SAP Generative AI Hub 전체 지원](../../docs/providers/sap)
- **신규 Bedrock Writer 모델** - Bedrock에 Palmyra-X4 및 Palmyra-X5 모델 추가
- **OpenAI GPT-5.2 모델** - reasoning 지원과 함께 GPT-5.2, GPT-5.2-pro 및 Azure GPT-5.2 모델 전체 지원
- **신규 Fireworks AI 모델 227개** - Fireworks AI platform을 위한 포괄적인 모델 커버리지
- **/chat/completions의 MCP 지원** - [chat completions endpoint를 통해 MCP server를 직접 사용합니다](../../docs/mcp)
- **성능 개선** - memory leak 50% 감소

---

### Agent Gateway - 신규 Agent Provider 4개 {#agent-gateway---4-new-agent-providers}

<Image
img={require('../../img/a2a_gateway2.png')}
style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

이번 릴리스에서는 다음 provider의 agent를 지원합니다.
- **LangGraph Agents** - LangGraph 기반 agent 배포 및 관리
- **Azure AI Foundry Agents** - Azure의 enterprise agent deployment
- **Bedrock AgentCore** - AWS Bedrock agent 통합
- **A2A Agents** - Agent-to-Agent 프로토콜 지원

AI Gateway 관리자는 이제 이러한 provider의 agent를 추가할 수 있으며, 개발자는 A2A protocol을 사용하는 통합 interface를 통해 agent를 호출할 수 있습니다.

AI Gateway를 통해 실행되는 모든 agent request에 대해 LiteLLM은 request/response log, cost, token usage를 자동으로 추적합니다.

### Agent (A2A) 사용량 UI {#agent-a2a-사용법-ui}

<Image
img={require('../../img/agent_usage.png')}
style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이제 사용자는 agent별로 사용량 통계를 필터링할 수 있으며, team, organization, customer에서 제공되는 것과 동일한 세부 필터링 기능을 사용할 수 있습니다.

**세부 내용:**

- agent ID별로 usage analytics, spend log, activity metric 필터링
- agent 단위 breakdown 확인
- 모든 usage 및 analytics view에서 일관된 필터링 경험 제공

---

## 신규 Provider 및 Endpoint {#new-providers-and-endpoints}

### 신규 Provider (신규 provider 5개) {#new-providers-5-new-providers}

| Provider | 지원되는 LiteLLM Endpoint | 설명 |
| -------- | ------------------- | ----------- |
| [SAP Gen AI Hub](../../docs/providers/sap) | `/chat/completions`, `/messages`, `/responses` | enterprise AI를 위한 SAP Generative AI Hub 통합 |
| [LangGraph](../../docs/providers/langgraph) | `/chat/completions`, `/messages`, `/responses`, `/a2a` | agentic workflow를 위한 LangGraph agent |
| [Azure AI Foundry Agents](../../docs/providers/azure_ai_agents) | `/chat/completions`, `/messages`, `/responses`, `/a2a` | enterprise agent deployment를 위한 Azure AI Foundry Agents |
| [Voyage AI Rerank](../../docs/providers/voyage) | `/rerank` | Voyage AI rerank 모델 지원 |
| [Fireworks AI Rerank](../../docs/providers/fireworks_ai) | `/rerank` | Fireworks AI rerank endpoint 지원 |

### 신규 LLM API Endpoint (신규 endpoint 4개) {#new-llm-api-endpoints-4-new-endpoints}

| Endpoint | Method | 설명 | 문서 |
| -------- | ------ | ----------- | ------------- |
| `/containers/{id}/files` | GET | container의 파일 목록 조회 | [문서](../../docs/container_files) |
| `/containers/{id}/files/{file_id}` | GET | container file metadata 조회 | [문서](../../docs/container_files) |
| `/containers/{id}/files/{file_id}` | DELETE | container에서 파일 삭제 | [문서](../../docs/container_files) |
| `/containers/{id}/files/{file_id}/content` | GET | container file content 조회 | [문서](../../docs/container_files) |

---

## 신규 모델 / 업데이트된 모델 {#new-models--updated-models}

#### 신규 모델 지원 (신규 모델 270개 이상) {#new-model-support-270-new-models}

| Provider | Model | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5.2` | 400K | $1.75 | $14.00 | 추론, vision, PDF, 캐싱 |
| OpenAI | `gpt-5.2-pro` | 400K | $21.00 | $168.00 | 추론, web search, vision |
| Azure | `azure/gpt-5.2` | 400K | $1.75 | $14.00 | 추론, vision, PDF, 캐싱 |
| Azure | `azure/gpt-5.2-pro` | 400K | $21.00 | $168.00 | 추론, web search |
| Bedrock | `us.writer.palmyra-x4-v1:0` | 128K | $2.50 | $10.00 | 함수 호출, PDF 입력 |
| Bedrock | `us.writer.palmyra-x5-v1:0` | 1M | $0.60 | $6.00 | 함수 호출, PDF 입력 |
| Bedrock | `eu.anthropic.claude-opus-4-5-20251101-v1:0` | 200K | $5.00 | $25.00 | 추론, 컴퓨터 사용, vision |
| Bedrock | `google.gemma-3-12b-it` | 128K | $0.10 | $0.30 | audio input |
| Bedrock | `moonshot.kimi-k2-thinking` | 128K | $0.60 | $2.50 | 추론 |
| Bedrock | `nvidia.nemotron-nano-12b-v2` | 128K | $0.20 | $0.60 | Vision |
| Bedrock | `qwen.qwen3-next-80b-a3b` | 128K | $0.15 | $1.20 | function calling |
| Vertex AI | `vertex_ai/deepseek-ai/deepseek-v3.2-maas` | 164K | $0.56 | $1.68 | 추론, 캐싱 |
| Mistral | `mistral/codestral-2508` | 256K | $0.30 | $0.90 | function calling |
| Mistral | `mistral/devstral-2512` | 256K | $0.40 | $2.00 | function calling |
| Mistral | `mistral/labs-devstral-small-2512` | 256K | $0.10 | $0.30 | function calling |
| Cerebras | `cerebras/zai-glm-4.6` | 128K | - | - | Chat completions |
| NVIDIA NIM | `nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2` | - | 무료 | 무료 | Rerank |
| Voyage | `voyage/rerank-2.5` | 32K | $0.05/1K tokens | - | Rerank |
| Fireworks AI | 신규 모델 227개 | Various | Various | Various | 전체 모델 catalog |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - reasoning_effort='xhigh'가 포함된 OpenAI GPT-5.2 모델 지원 추가 - [PR #17836](https://github.com/BerriAI/litellm/pull/17836), [PR #17875](https://github.com/BerriAI/litellm/pull/17875)
    - responses API 모델에 'user' param 포함 - [PR #17648](https://github.com/BerriAI/litellm/pull/17648)
    - text completions에 최적화된 async http client 사용 - [PR #17831](https://github.com/BerriAI/litellm/pull/17831)
- **[Azure](../../docs/providers/azure)**
    - Azure GPT-5.2 모델 지원 추가 - [PR #17866](https://github.com/BerriAI/litellm/pull/17866)
- **[Azure AI](../../docs/providers/azure_ai)**
    - Azure AI Anthropic api-key header 및 passthrough cost calculation 수정 - [PR #17656](https://github.com/BerriAI/litellm/pull/17656)
    - Azure AI Anthropic request에서 지원되지 않는 param 제거 - [PR #17822](https://github.com/BerriAI/litellm/pull/17822)
- **[Anthropic](../../docs/providers/anthropic)**
    - 동일한 tool을 가진 중복 tool_result block 방지 - [PR #17632](https://github.com/BerriAI/litellm/pull/17632)
    - streaming response의 부분 JSON chunk 처리 - [PR #17493](https://github.com/BerriAI/litellm/pull/17493)
    - multi-turn conversation에서 server_tool_use 및 web_search_tool_result 보존 - [PR #17746](https://github.com/BerriAI/litellm/pull/17746)
    - multi-turn conversation을 위한 streaming에서 web_search_tool_result 캡처 - [PR #17798](https://github.com/BerriAI/litellm/pull/17798)
    - retrieve batches 및 retrieve file content 지원 추가 - [PR #17700](https://github.com/BerriAI/litellm/pull/17700)
- **[Bedrock](../../docs/providers/bedrock)**
    - model list에 신규 Bedrock OSS 모델 추가 - [PR #17638](https://github.com/BerriAI/litellm/pull/17638)
    - Bedrock Writer 모델(Palmyra-X4, Palmyra-X5) 추가 - [PR #17685](https://github.com/BerriAI/litellm/pull/17685)
    - EU Claude Opus 4.5 모델 추가 - [PR #17897](https://github.com/BerriAI/litellm/pull/17897)
    - Converse API에 serviceTier 지원 추가 - [PR #17810](https://github.com/BerriAI/litellm/pull/17810)
    - Bedrock embeddings용 custom API에서 header forwarding 수정 - [PR #17872](https://github.com/BerriAI/litellm/pull/17872)
- **[Gemini](../../docs/providers/gemini)**
    - Gemini의 computer use 지원 추가 - [PR #17756](https://github.com/BerriAI/litellm/pull/17756)
    - context window error 처리 - [PR #17751](https://github.com/BerriAI/litellm/pull/17751)
    - Gemini TTS용 GenerationConfig에 speechConfig 추가 - [PR #17851](https://github.com/BerriAI/litellm/pull/17851)
- **[Vertex AI](../../docs/providers/vertex)**
    - DeepSeek-V3.2 모델 지원 추가 - [PR #17770](https://github.com/BerriAI/litellm/pull/17770)
    - generate content request의 systemInstructions 보존 - [PR #17803](https://github.com/BerriAI/litellm/pull/17803)
- **[Mistral](../../docs/providers/mistral)**
    - Codestral 2508, Devstral 2512 모델 추가 - [PR #17801](https://github.com/BerriAI/litellm/pull/17801)
- **[Cerebras](../../docs/providers/cerebras)**
    - zai-glm-4.6 모델 지원 추가 - [PR #17683](https://github.com/BerriAI/litellm/pull/17683)
    - context window error가 인식되지 않는 문제 수정 - [PR #17587](https://github.com/BerriAI/litellm/pull/17587)
- **[DeepSeek](../../docs/providers/deepseek)**
    - thinking 및 reasoning_effort param의 native support 추가 - [PR #17712](https://github.com/BerriAI/litellm/pull/17712)
- **[NVIDIA NIM Rerank](../../docs/providers/nvidia_nim_rerank)**
    - llama-3.2-nv-rerankqa-1b-v2 rerank 모델 추가 - [PR #17670](https://github.com/BerriAI/litellm/pull/17670)
- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - 신규 Fireworks AI 모델 227개 추가 - [PR #17692](https://github.com/BerriAI/litellm/pull/17692)
- **[Dashscope](../../docs/providers/dashscope)**
    - 기본 base_url error 수정 - [PR #17584](https://github.com/BerriAI/litellm/pull/17584)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - Anthropic에서 OpenAI로 변환할 때 누락되는 content 수정 - [PR #17693](https://github.com/BerriAI/litellm/pull/17693)
    - input에 tool_calls만 있을 때 error 방지 - [PR #17753](https://github.com/BerriAI/litellm/pull/17753)
- **[Azure](../../docs/providers/azure)**
    - Azure의 video id encoding 관련 error 수정 - [PR #17708](https://github.com/BerriAI/litellm/pull/17708)
- **[Azure AI](../../docs/providers/azure_ai)**
    - model map에서 azure_ai의 LLM provider 수정 - [PR #17805](https://github.com/BerriAI/litellm/pull/17805)
- **[Watsonx](../../docs/providers/watsonx)**
    - Watsonx Audio Transcription이 API에 지원되는 param만 보내도록 수정 - [PR #17840](https://github.com/BerriAI/litellm/pull/17840)
- **[Router](../../docs/routing)**
    - completion request에서 tools=None 처리 - [PR #17684](https://github.com/BerriAI/litellm/pull/17684)
    - error rate cooldown을 위한 minimum request threshold 추가 - [PR #17464](https://github.com/BerriAI/litellm/pull/17464)

---

## LLM API Endpoint {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - responses usage object에 usage detail 추가 - [PR #17641](https://github.com/BerriAI/litellm/pull/17641)
    - response API polling error 수정 - [PR #17654](https://github.com/BerriAI/litellm/pull/17654)
    - text + tool_calls일 때 streaming tool_calls가 drop되는 문제 수정 - [PR #17652](https://github.com/BerriAI/litellm/pull/17652)
    - Responses API에서 tool result의 image content 변환 - [PR #17799](https://github.com/BerriAI/litellm/pull/17799)
    - responses api가 api key의 tpm rate limit을 적용하지 않는 문제 수정 - [PR #17707](https://github.com/BerriAI/litellm/pull/17707)
- **[Containers API](../../docs/containers)**
    - custom-llm-provider로 LIST 및 Create Containers 사용 허용 - [PR #17740](https://github.com/BerriAI/litellm/pull/17740)
    - 신규 container API file management + UI Interface 추가 - [PR #17745](https://github.com/BerriAI/litellm/pull/17745)
- **[Rerank API](../../docs/rerank)**
    - /rerank endpoint에서 client header forwarding 지원 추가 - [PR #17873](https://github.com/BerriAI/litellm/pull/17873)
- **[Files API](../../docs/files_endpoints)**
    - Files endpoint에 expires_after param 지원 추가 - [PR #17860](https://github.com/BerriAI/litellm/pull/17860)
- **[Video API](../../docs/videos)**
    - 모든 videos API에 litellm param 사용 - [PR #17732](https://github.com/BerriAI/litellm/pull/17732)
    - videos content db creds 준수 - [PR #17771](https://github.com/BerriAI/litellm/pull/17771)
- **[Embeddings API](../../docs/proxy/embedding)**
    - embeddings의 token array input decoding 처리 수정 - [PR #17468](https://github.com/BerriAI/litellm/pull/17468)
- **[Chat Completions API](../../docs/completion/input)**
    - v0 target storage 지원 추가 - Azure AI storage에 파일을 저장하고 chat completions API와 함께 사용 - [PR #17758](https://github.com/BerriAI/litellm/pull/17758)
- **[generateContent API](../../docs/providers/gemini)**
    - Gemini generateContent endpoint에서 slash가 포함된 model name 지원 - [PR #17743](https://github.com/BerriAI/litellm/pull/17743)
- **General**
    - caching에 audio content 사용 - [PR #17651](https://github.com/BerriAI/litellm/pull/17651)
    - GET responses API 호출 시 403 exception 반환 - [PR #17629](https://github.com/BerriAI/litellm/pull/17629)
    - additional_drop_params에 nested field removal 지원 추가 - [PR #17711](https://github.com/BerriAI/litellm/pull/17711)
    - Async post_call_streaming_iterator_hook이 이제 async generator를 올바르게 순회 - [PR #17626](https://github.com/BerriAI/litellm/pull/17626)

#### 버그 {#bugs}

- **General**
    - is_cached_message에서 string content 처리 수정 - [PR #17853](https://github.com/BerriAI/litellm/pull/17853)

---

## 관리 Endpoint / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **UI Settings**
    - UI Settings용 Get 및 Update Backend Route 추가 - [PR #17689](https://github.com/BerriAI/litellm/pull/17689)
    - UI Settings page 구현 - [PR #17697](https://github.com/BerriAI/litellm/pull/17697)
    - Model Page가 UI Settings를 준수하도록 보장 - [PR #17804](https://github.com/BerriAI/litellm/pull/17804)
    - Default User Settings에 모든 Proxy 모델 추가 - [PR #17902](https://github.com/BerriAI/litellm/pull/17902)
- **Agent & 사용량 UI**
    - Daily Agent 사용량 Backend - [PR #17781](https://github.com/BerriAI/litellm/pull/17781)
    - Agent 사용량 UI - [PR #17797](https://github.com/BerriAI/litellm/pull/17797)
    - UI에 agent cost tracking 추가 - [PR #17899](https://github.com/BerriAI/litellm/pull/17899)
    - Agent 사용량에 신규 Badge 추가 - [PR #17883](https://github.com/BerriAI/litellm/pull/17883)
    - filtering용 사용량 Entity label - [PR #17896](https://github.com/BerriAI/litellm/pull/17896)
    - Agent 사용량 Page minor fix - [PR #17901](https://github.com/BerriAI/litellm/pull/17901)
    - 사용량 Page View Select component - [PR #17854](https://github.com/BerriAI/litellm/pull/17854)
    - 사용량 Page Component refactor - [PR #17848](https://github.com/BerriAI/litellm/pull/17848)
- **로그 & Spend**
    - logs view의 spend analytics 개선 - [PR #17623](https://github.com/BerriAI/litellm/pull/17623)
    - user management용 user info delete modal 추가 - [PR #17625](https://github.com/BerriAI/litellm/pull/17625)
    - logs view에 request 및 response detail 표시 - [PR #17928](https://github.com/BerriAI/litellm/pull/17928)
- **가상 키**
    - x-litellm-key-spend header update 수정 - [PR #17864](https://github.com/BerriAI/litellm/pull/17864)
- **모델 & Endpoint**
    - Model Hub Useful Links 재배치 - [PR #17859](https://github.com/BerriAI/litellm/pull/17859)
    - Create Team Model Dropdown이 Organization의 모델을 준수하도록 수정 - [PR #17834](https://github.com/BerriAI/litellm/pull/17834)
- **SSO & Auth**
    - SSO provider role 변경 시 user role upsert 허용 - [PR #17754](https://github.com/BerriAI/litellm/pull/17754)
    - generic SSO provider(Keycloak)에서 role 가져오기 허용 - [PR #17787](https://github.com/BerriAI/litellm/pull/17787)
    - JWT Auth - request header에서 team_id 선택 허용 - [PR #17884](https://github.com/BerriAI/litellm/pull/17884)
    - SSO Update 시 Config Table에서 SSO Config Value 제거 - [PR #17668](https://github.com/BerriAI/litellm/pull/17668)
- **Teams**
    - org table에 team 연결 - [PR #17832](https://github.com/BerriAI/litellm/pull/17832)
    - authenticating 시 team alias 노출 - [PR #17725](https://github.com/BerriAI/litellm/pull/17725)
- **MCP Server 관리**
    - UpdateMCPServerRequest에 extra_headers 및 allowed_tools 추가 - [PR #17940](https://github.com/BerriAI/litellm/pull/17940)
- **Notifications**
    - Notifications에 progress 표시 및 hover 시 pause 추가 - [PR #17942](https://github.com/BerriAI/litellm/pull/17942)
- **General**
    - 문서가 Root Path에 없을 때 Root Path redirect 허용 - [PR #16843](https://github.com/BerriAI/litellm/pull/16843)
    - logo 근처 좌측 상단에 UI version number 표시 - [PR #17891](https://github.com/BerriAI/litellm/pull/17891)
    - root의 올바른 category 및 agent로 left navigation 재구성 - [PR #17890](https://github.com/BerriAI/litellm/pull/17890)
    - UI Playground - model selector dropdown에서 custom model name 허용 - [PR #17892](https://github.com/BerriAI/litellm/pull/17892)

#### 버그 {#bugs-1}

- **UI Fixes**
    - link 및 old login page deprecation message 수정 - [PR #17624](https://github.com/BerriAI/litellm/pull/17624)
    - Chat UI Endpoint Selector용 filtering - [PR #17567](https://github.com/BerriAI/litellm/pull/17567)
    - SCIM v2의 Race Condition Handling - [PR #17513](https://github.com/BerriAI/litellm/pull/17513)
    - /litellm_model_cost_map public 전환 - [PR #16795](https://github.com/BerriAI/litellm/pull/16795)
    - UI의 Custom Callback - [PR #17522](https://github.com/BerriAI/litellm/pull/17522)
    - Logo를 위해 Non Root Docker에 User Writable Directory 추가 - [PR #17180](https://github.com/BerriAI/litellm/pull/17180)
    - URL Input과 Display Name input 교체 - [PR #17682](https://github.com/BerriAI/litellm/pull/17682)
    - deprecation banner를 /sso/key/generate에서만 표시하도록 변경 - [PR #17681](https://github.com/BerriAI/litellm/pull/17681)
    - credential encryption이 db credential에만 영향을 주도록 변경 - [PR #17741](https://github.com/BerriAI/litellm/pull/17741)
- **Auth & Routes**
    - unauthorized route에 503 대신 403 반환 - [PR #17723](https://github.com/BerriAI/litellm/pull/17723)
    - AI Gateway Auth - public route에 wildcard pattern 사용 허용 - [PR #17686](https://github.com/BerriAI/litellm/pull/17686)

---

## AI Integration {#ai-integrations}

### 신규 Integration (신규 integration 4개) {#new-integrations-4-new-integrations}

| Integration | Type | 설명 |
| ----------- | ---- | ----------- |
| [SumoLogic](../../docs/proxy/logging#sumologic) | Logging | SumoLogic용 native webhook integration - [PR #17630](https://github.com/BerriAI/litellm/pull/17630) |
| [Arize Phoenix](../../docs/proxy/arize_phoenix_prompts) | Prompt Management | Arize Phoenix OSS prompt management integration - [PR #17750](https://github.com/BerriAI/litellm/pull/17750) |
| [Sendgrid](../../docs/proxy/email) | Email | Sendgrid email notification integration - [PR #17775](https://github.com/BerriAI/litellm/pull/17775) |
| [Onyx](../../docs/proxy/guardrails/onyx_security) | 가드레일 | Onyx guardrail hook integration - [PR #16591](https://github.com/BerriAI/litellm/pull/16591) |

### 로깅 {#logging}

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Langfuse trace_id 전파 - [PR #17669](https://github.com/BerriAI/litellm/pull/17669)
    - Langfuse logging에 standard trace id 우선 사용 - [PR #17791](https://github.com/BerriAI/litellm/pull/17791)
    - Langfuse passthrough에서 query param을 create_pass_through_route call로 이동 - [PR #17660](https://github.com/BerriAI/litellm/pull/17660)
    - custom masking function 지원 추가 - [PR #17826](https://github.com/BerriAI/litellm/pull/17826)
- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - prometheus logger에 'exception_status' 추가 - [PR #17847](https://github.com/BerriAI/litellm/pull/17847)
- **[OpenTelemetry](../../docs/proxy/logging#otel)**
    - OTEL payload에 latency metric(TTFT, TPOT, Total Generation Time) 추가 - [PR #17888](https://github.com/BerriAI/litellm/pull/17888)
- **General**
    - async logging용 cache 기반 polling feature 추가 - [PR #16862](https://github.com/BerriAI/litellm/pull/16862)

### 가드레일 {#가드레일}

- **[HiddenLayer](../../docs/proxy/guardrails/hiddenlayer)**
    - HiddenLayer Guardrail Hook 추가 - [PR #17728](https://github.com/BerriAI/litellm/pull/17728)
- **[Pillar Security](../../docs/proxy/guardrails/pillar_security)**
    - monitoring 중 Pillar Security guardrail에 opt-in evidence result 추가 - [PR #17812](https://github.com/BerriAI/litellm/pull/17812)
- **[PANW Prisma AIRS](../../docs/proxy/guardrails/panw_prisma_airs)**
    - configurable fail-open, timeout 및 app_user tracking 추가 - [PR #17785](https://github.com/BerriAI/litellm/pull/17785)
- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)**
    - Presidio PII masking에서 configurable confidence score threshold 및 scope 지원 추가 - [PR #17817](https://github.com/BerriAI/litellm/pull/17817)
- **[LiteLLM Content Filter](../../docs/proxy/guardrails/litellm_content_filter)**
    - 첫 번째 match뿐 아니라 모든 regex pattern match를 masking - [PR #17727](https://github.com/BerriAI/litellm/pull/17727)
- **[Regex 가드레일](../../docs/proxy/guardrails/secret_detection)**
    - guardrail용 enhanced regex pattern matching 추가 - [PR #17915](https://github.com/BerriAI/litellm/pull/17915)
- **[Gray Swan Guardrail](../../docs/proxy/guardrails/grayswan)**
    - model response용 passthrough mode 추가 - [PR #17102](https://github.com/BerriAI/litellm/pull/17102)

### Prompt Management {#prompt-management}

- **General**
    - prompt management provider 통합용 신규 API - [PR #17829](https://github.com/BerriAI/litellm/pull/17829)

---

## 비용 추적, Budget 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Service Tier Pricing** - OpenAI flex pricing을 위해 response/usage에서 service_tier 추출 - [PR #17748](https://github.com/BerriAI/litellm/pull/17748)
- **Agent Cost Tracking** - Spend로그에서 agent_id 추적 - [PR #17795](https://github.com/BerriAI/litellm/pull/17795)
- **Tag Activity** - /tag/daily/activity metadata deduplicate - [PR #16764](https://github.com/BerriAI/litellm/pull/16764)
- **Rate Limiting** - Dynamic Rate Limiter - in memory cache에 ttl 지정 허용 - [PR #17679](https://github.com/BerriAI/litellm/pull/17679)

---

## MCP Gateway {#mcp-gateway}

- **Chat Completions Integration** - /chat/completions에서 MCP 사용 지원 추가 - [PR #17747](https://github.com/BerriAI/litellm/pull/17747)
- **UI Session Permissions** - 실제 team 전반에서 UI session MCP permission 수정 - [PR #17620](https://github.com/BerriAI/litellm/pull/17620)
- **OAuth Callback** - MCP OAuth callback routing 및 URL handling 수정 - [PR #17789](https://github.com/BerriAI/litellm/pull/17789)
- **Tool Name Prefix** - MCP tool name prefix 수정 - [PR #17908](https://github.com/BerriAI/litellm/pull/17908)

---

## Agent Gateway 업데이트 (A2A) {#agent-gateway-a2a}

- **Cost Per Query** - agent invocation에 cost per query 추가 - [PR #17774](https://github.com/BerriAI/litellm/pull/17774)
- **Token Counting** - non streaming 및 streaming token counting 추가 - [PR #17779](https://github.com/BerriAI/litellm/pull/17779)
- **Cost Per Token** - A2A에 cost per token pricing 추가 - [PR #17780](https://github.com/BerriAI/litellm/pull/17780)
- **LangGraph Provider** - Agent Gateway용 LangGraph provider 추가 - [PR #17783](https://github.com/BerriAI/litellm/pull/17783)
- **Bedrock & LangGraph Agents** - A2A Gateway에서 Bedrock AgentCore, LangGraph agent 사용 허용 - [PR #17786](https://github.com/BerriAI/litellm/pull/17786)
- **Agent Management** - LangGraph 및 Bedrock Agent Core agent 추가 허용 - [PR #17802](https://github.com/BerriAI/litellm/pull/17802)
- **Azure Foundry Agents** - Azure AI Foundry Agents 지원 추가 - [PR #17845](https://github.com/BerriAI/litellm/pull/17845)
- **Azure Foundry UI** - UI에서 Azure Foundry Agents 추가 허용 - [PR #17909](https://github.com/BerriAI/litellm/pull/17909)
- **Azure Foundry Fixes** - Azure Foundry agent가 올바르게 동작하도록 보장 - [PR #17943](https://github.com/BerriAI/litellm/pull/17943)

---

## 성능 / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

- **Memory Leak Fix** - memory leak 절반 감소 - [PR #17784](https://github.com/BerriAI/litellm/pull/17784)
- **Spend 로그 Memory** - spend_logs의 memory accumulation 감소 - [PR #17742](https://github.com/BerriAI/litellm/pull/17742)
- **Router Optimization** - time.perf_counter()를 time.time()으로 교체 - [PR #17881](https://github.com/BerriAI/litellm/pull/17881)
- **Filter Internal Params** - fallback code에서 internal param filtering - [PR #17941](https://github.com/BerriAI/litellm/pull/17941)
- **Gunicorn Suggestion** - max_requests_before_restart 사용 시 uvicorn 대신 Gunicorn 제안 - [PR #17788](https://github.com/BerriAI/litellm/pull/17788)
- **Pydantic Warnings** - PydanticDeprecatedSince20 warning 완화 - [PR #17657](https://github.com/BerriAI/litellm/pull/17657)
- **Python 3.14 Support** - grpcio version constraint를 통해 Python 3.14 지원 추가 - [PR #17666](https://github.com/BerriAI/litellm/pull/17666)
- **OpenAI Package** - openai package를 2.9.0으로 bump - [PR #17818](https://github.com/BerriAI/litellm/pull/17818)

---

## 문서 업데이트 {#documentation-updates}

- **기여하기** - 먼저 fork하도록 권장하는 clone instruction으로 업데이트 - [PR #17637](https://github.com/BerriAI/litellm/pull/17637)
- **시작하기** - 시작하기 page 및 SDK documentation structure 개선 - [PR #17614](https://github.com/BerriAI/litellm/pull/17614)
- **JSON Mode** - Pydantic model output을 얻는 방법을 더 명확하게 설명 - [PR #17671](https://github.com/BerriAI/litellm/pull/17671)
- **drop_params** - drop_params용 litellm docs 업데이트 - [PR #17658](https://github.com/BerriAI/litellm/pull/17658)
- **Environment Variables** - 누락된 environment variable 문서화 및 잘못된 type 수정 - [PR #17649](https://github.com/BerriAI/litellm/pull/17649)
- **SumoLogic** - SumoLogic integration documentation 추가 - [PR #17647](https://github.com/BerriAI/litellm/pull/17647)
- **SAP Gen AI** - SAP Gen AI provider documentation 추가 - [PR #17667](https://github.com/BerriAI/litellm/pull/17667)
- **인증** - 인증용 Note 추가 - [PR #17733](https://github.com/BerriAI/litellm/pull/17733)
- **Known Issues** - 1.80.5-stable docs에 known issue 추가 - [PR #17738](https://github.com/BerriAI/litellm/pull/17738)
- **지원 엔드포인트** - 지원 엔드포인트 page 수정 - [PR #17710](https://github.com/BerriAI/litellm/pull/17710)
- **Token Count** - token count endpoint 문서화 - [PR #17772](https://github.com/BerriAI/litellm/pull/17772)
- **개요** - table을 사용해 litellm proxy와 SDK 차이를 overview에서 더 명확하게 정리 - [PR #17790](https://github.com/BerriAI/litellm/pull/17790)
- **Containers API** - LiteLLM의 containers files API 및 code interpreter 문서 추가 - [PR #17749](https://github.com/BerriAI/litellm/pull/17749)
- **Target Storage** - target storage documentation 추가 - [PR #17882](https://github.com/BerriAI/litellm/pull/17882)
- **Agent 사용량** - Agent 사용량 documentation - [PR #17931](https://github.com/BerriAI/litellm/pull/17931), [PR #17932](https://github.com/BerriAI/litellm/pull/17932), [PR #17934](https://github.com/BerriAI/litellm/pull/17934)
- **Cursor Integration** - Cursor Integration documentation - [PR #17855](https://github.com/BerriAI/litellm/pull/17855), [PR #17939](https://github.com/BerriAI/litellm/pull/17939)
- **A2A Cost Tracking** - A2A cost tracking docs - [PR #17913](https://github.com/BerriAI/litellm/pull/17913)
- **Azure Search** - azure search docs 업데이트 - [PR #17726](https://github.com/BerriAI/litellm/pull/17726)
- **Milvus Client** - milvus client docs 수정 - [PR #17736](https://github.com/BerriAI/litellm/pull/17736)
- **Streaming Logging** - streaming logging doc 제거 - [PR #17739](https://github.com/BerriAI/litellm/pull/17739)
- **Integration 문서** - integration docs location 업데이트 - [PR #17644](https://github.com/BerriAI/litellm/pull/17644)
- **Links** - mistral 및 anthropic용 docs link 업데이트 - [PR #17852](https://github.com/BerriAI/litellm/pull/17852)
- **커뮤니티** - community doc link 추가 - [PR #17734](https://github.com/BerriAI/litellm/pull/17734)
- **Pricing** - global.anthropic.claude-haiku-4-5-20251001-v1:0 pricing 업데이트 - [PR #17703](https://github.com/BerriAI/litellm/pull/17703)
- **gpt-image-1-mini** - gpt-image-1-mini의 model type 수정 - [PR #17635](https://github.com/BerriAI/litellm/pull/17635)

---

## 인프라 / 배포 {#infrastructure--deployment}

- **Docker** - docker-compose.yml healthcheck에서 wget 대신 python 사용 - [PR #17646](https://github.com/BerriAI/litellm/pull/17646)
- **Helm Chart** - Helm chart deployment용 extraResources 지원 추가 - [PR #17627](https://github.com/BerriAI/litellm/pull/17627)
- **Helm Versioning** - helm chart version에 semver prerelease suffix 추가 - [PR #17678](https://github.com/BerriAI/litellm/pull/17678)
- **Database Schema** - target storage feature용 storage_backend 및 storage_url column을 schema.prisma에 추가 - [PR #17936](https://github.com/BerriAI/litellm/pull/17936)

---

## 신규 Contributor {#new-contributors}

* @xianzongxie-stripe 님이 [PR #16862](https://github.com/BerriAI/litellm/pull/16862)에서 첫 contribution을 했습니다.
* @krisxia0506 님이 [PR #17637](https://github.com/BerriAI/litellm/pull/17637)에서 첫 contribution을 했습니다.
* @chetanchoudhary-sumo 님이 [PR #17630](https://github.com/BerriAI/litellm/pull/17630)에서 첫 contribution을 했습니다.
* @kevinmarx 님이 [PR #17632](https://github.com/BerriAI/litellm/pull/17632)에서 첫 contribution을 했습니다.
* @expruc 님이 [PR #17627](https://github.com/BerriAI/litellm/pull/17627)에서 첫 contribution을 했습니다.
* @rcII 님이 [PR #17626](https://github.com/BerriAI/litellm/pull/17626)에서 첫 contribution을 했습니다.
* @tamirkiviti13 님이 [PR #16591](https://github.com/BerriAI/litellm/pull/16591)에서 첫 contribution을 했습니다.
* @Eric84626 님이 [PR #17629](https://github.com/BerriAI/litellm/pull/17629)에서 첫 contribution을 했습니다.
* @vasilisazayka 님이 [PR #16053](https://github.com/BerriAI/litellm/pull/16053)에서 첫 contribution을 했습니다.
* @juliettech13 님이 [PR #17663](https://github.com/BerriAI/litellm/pull/17663)에서 첫 contribution을 했습니다.
* @jason-nance 님이 [PR #17660](https://github.com/BerriAI/litellm/pull/17660)에서 첫 contribution을 했습니다.
* @yisding 님이 [PR #17671](https://github.com/BerriAI/litellm/pull/17671)에서 첫 contribution을 했습니다.
* @emilsvennesson 님이 [PR #17656](https://github.com/BerriAI/litellm/pull/17656)에서 첫 contribution을 했습니다.
* @kumekay 님이 [PR #17646](https://github.com/BerriAI/litellm/pull/17646)에서 첫 contribution을 했습니다.
* @chenzhaofei01 님이 [PR #17584](https://github.com/BerriAI/litellm/pull/17584)에서 첫 contribution을 했습니다.
* @shivamrawat1 님이 [PR #17733](https://github.com/BerriAI/litellm/pull/17733)에서 첫 contribution을 했습니다.
* @ephrimstanley 님이 [PR #17723](https://github.com/BerriAI/litellm/pull/17723)에서 첫 contribution을 했습니다.
* @hwittenborn 님이 [PR #17743](https://github.com/BerriAI/litellm/pull/17743)에서 첫 contribution을 했습니다.
* @peterkc 님이 [PR #17727](https://github.com/BerriAI/litellm/pull/17727)에서 첫 contribution을 했습니다.
* @saisurya237 님이 [PR #17725](https://github.com/BerriAI/litellm/pull/17725)에서 첫 contribution을 했습니다.
* @Ashton-Sidhu 님이 [PR #17728](https://github.com/BerriAI/litellm/pull/17728)에서 첫 contribution을 했습니다.
* @CyrusTC 님이 [PR #17810](https://github.com/BerriAI/litellm/pull/17810)에서 첫 contribution을 했습니다.
* @jichmi 님이 [PR #17703](https://github.com/BerriAI/litellm/pull/17703)에서 첫 contribution을 했습니다.
* @ryan-crabbe 님이 [PR #17852](https://github.com/BerriAI/litellm/pull/17852)에서 첫 contribution을 했습니다.
* @nlineback 님이 [PR #17851](https://github.com/BerriAI/litellm/pull/17851)에서 첫 contribution을 했습니다.
* @butnarurazvan 님이 [PR #17468](https://github.com/BerriAI/litellm/pull/17468)에서 첫 contribution을 했습니다.
* @yoshi-p27 님이 [PR #17915](https://github.com/BerriAI/litellm/pull/17915)에서 첫 contribution을 했습니다.

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.80.8.rc.1...v1.80.10)**
