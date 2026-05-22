---
title: "v1.82.3 - Nebius AI, gpt-5.4, Gemini 3.x, FLUX Kontext, 신규 모델 116개"
slug: "v1-82-3"
date: 2026-03-16T00:00:00
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

## 이 버전 배포

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-1.82.3-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.82.3
```

</TabItem>
</Tabs>

## 주요 하이라이트

- **Nebius AI — 신규 제공자** — [Nebius AI 클라우드에서 DeepSeek, Qwen, Llama, Mistral, NVIDIA, BAAI 계열 30개 모델 사용 가능](../../docs/providers/nebius) - [PR #22614](https://github.com/BerriAI/litellm/pull/22614)
- **OpenAI gpt-5.4 / gpt-5.4-pro — 출시 당일 지원** — OpenAI와 Azure에서 `gpt-5.4`(1M 컨텍스트, $2.50/$15.00) 및 `gpt-5.4-pro`($30.00/$180.00)의 가격과 라우팅을 완전 지원합니다.
- **Gemini 3.x 모델** — Google AI와 Vertex AI 비용 맵에 `gemini-3-flash-preview`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-image-preview`, `gemini-embedding-2-preview`를 추가했습니다.
- **FLUX Kontext 이미지 편집** — Black Forest Labs에 `flux-kontext-pro`, `flux-kontext-max`를 추가하고, 인페인팅/아웃페인팅용 `flux-pro-1.0-fill`, `flux-pro-1.0-expand`도 함께 추가했습니다.
- **신규 모델 116개, 지원 중단 모델 132개 정리** — Mistral Magistral, Dashscope Qwen3 VL, Azure AI 기반 xAI Grok, ZAI GLM-5, Serper Search 등을 포함해 모델 맵을 대폭 갱신했습니다. OpenAI GPT-3.5/GPT-4 레거시 변형, Gemini 1.5, Vertex AI PaLM2는 제거했습니다.
- **SageMaker Nova 제공자** — [SageMaker의 Amazon Nova 모델용 신규 `sagemaker_nova` 제공자](../../docs/providers/aws_sagemaker) - [PR #21542](https://github.com/BerriAI/litellm/pull/21542)
- **Hashicorp Vault 시크릿 관리자** — Hashicorp Vault 기반 구성 재정의 백엔드와 Vault에서 가져온 자격 증명 관리를 위한 전체 UI를 추가했습니다. - [PR #22939](https://github.com/BerriAI/litellm/pull/22939), [PR #23036](https://github.com/BerriAI/litellm/pull/23036)
- **Responses API WebSocket 스트리밍** — 모든 제공자 지원을 포함해 Responses API용 실시간 WebSocket 스트리밍을 추가했습니다. - [PR #22559](https://github.com/BerriAI/litellm/pull/22559), [PR #22771](https://github.com/BerriAI/litellm/pull/22771)
- **Org Admin RBAC 확장** — Org Admin이 전역 관리자 역할 없이 팀 관리 엔드포인트 접근, 내부 사용자 조회/초대, 팀 멤버십 관리를 수행할 수 있습니다. - [PR #23085](https://github.com/BerriAI/litellm/pull/23085), [PR #23080](https://github.com/BerriAI/litellm/pull/23080)
- **가드레일 모드 기본값 및 태그 기반 모드** — 전역 기본 가드레일 모드 목록을 설정하고, 태그 기반 가드레일 구성에서 모드 목록을 지정할 수 있습니다. - [PR #22676](https://github.com/BerriAI/litellm/pull/22676), [PR #23020](https://github.com/BerriAI/litellm/pull/23020)
- **로그 시크릿 마스킹** — 모든 프록시 로그 출력에서 API 키, 토큰, 자격 증명을 자동 제거합니다. 기본으로 활성화되며, `LITELLM_DISABLE_REDACT_SECRETS=true`로 해제할 수 있습니다. - [PR #23668](https://github.com/BerriAI/litellm/pull/23668)
- **스트리밍 안정성 수정** — 운영 환경에서 약 1시간 후 `RuntimeError: Cannot send a request, as the client has been closed.` 충돌이 발생하던 문제를 수정했습니다. - [PR #22926](https://github.com/BerriAI/litellm/pull/22926)

---

## 신규 제공자 및 엔드포인트 {#new-providers-and-endpoints}

### 신규 제공자(7개) {#new-providers}

| 제공자 | 지원 LiteLLM 엔드포인트 | 설명 |
| -------- | --------------------------- | ----------- |
| [Nebius AI](../../docs/providers/nebius) (`nebius/`) | `/chat/completions`, `/embeddings` | DeepSeek, Qwen3, Llama 3.1/3.3, NVIDIA Nemotron, BAAI 임베딩 등 30개 이상의 오픈 모델을 제공하는 EU 기반 AI 클라우드 |
| [ZAI](../../docs/providers/zai) (`zai/`) | `/chat/completions` | ZAI 클라우드를 통한 ZhipuAI GLM-5 모델 |
| [Black Forest Labs](../../docs/providers/black_forest_labs) (`black_forest_labs/`) | `/images/generations`, `/images/edits` | FLUX 이미지 생성 및 편집 — Kontext Pro/Max, Pro 1.0 Fill/Expand |
| [Serper](../../docs/providers/serper) (`serper/`) | `/search` | Serper API를 통한 웹 검색 |
| [SageMaker Nova](../../docs/providers/aws_sagemaker) (`sagemaker_nova/`) | `/chat/completions` | SageMaker 엔드포인트를 통한 Amazon Nova 모델 |
| [Google Search API](../../docs/providers/google_search) (`google_search/`) | `/search` | Google Search API 통합 - [PR #22752](https://github.com/BerriAI/litellm/pull/22752) |
| [Bedrock Mantle](../../docs/providers/bedrock) (`bedrock_mantle/`) | `/chat/completions` | Mantle을 통한 Amazon Bedrock — Bedrock 모델용 대체 인증 및 라우팅 경로 - [PR #22866](https://github.com/BerriAI/litellm/pull/22866) |

---

## 신규 모델 / 업데이트된 모델 {#new-models--updated-models}

#### 신규 모델 지원(116개) {#new-model-support}

| 제공자 | 모델 | 컨텍스트 창 | 입력($/1M 토큰) | 출력($/1M 토큰) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5.4` | 1.05M | $2.50 | $15.00 | 채팅, 비전, 도구, 추론 |
| OpenAI | `gpt-5.4-pro` | 1.05M | $30.00 | $180.00 | 응답, 비전, 도구, 추론 |
| OpenAI | `gpt-5.3-chat-latest` | 128K | $1.75 | $14.00 | 채팅, 비전, 도구, 추론 |
| Azure OpenAI | `azure/gpt-5.4` | 1.05M | $2.50 | $15.00 | 채팅, 비전, 도구, 추론 |
| Azure OpenAI | `azure/gpt-5.4-pro` | 1.05M | $30.00 | $180.00 | 응답, 비전, 도구, 추론 |
| Azure OpenAI | `azure/gpt-5.3-chat` | 128K | $1.75 | $14.00 | 채팅, 비전, 도구, 추론 |
| Google Gemini | `gemini/gemini-3-flash-preview` | 1M | $0.50 | $3.00 | 채팅, 비전, 도구, 추론 |
| Google Gemini | `gemini/gemini-3.1-pro-preview` | 1M | $2.00 | $12.00 | 채팅, 비전, 도구, 추론 |
| Google Gemini | `gemini/gemini-3.1-flash-image-preview` | 65K | $0.25 | $1.50 | 이미지 생성, 비전 |
| Google Gemini | `gemini/gemini-3.1-flash-lite-preview` | - | - | - | 채팅 |
| Google Gemini | `gemini/gemini-3-pro-image-preview` | - | - | - | 이미지 생성 |
| Google Gemini | `gemini/gemini-embedding-2-preview` | 8K | $0.20 | - | 임베딩 |
| Google Vertex AI | `vertex_ai/gemini-3-flash-preview` | - | - | - | 채팅 |
| Google Vertex AI | `vertex_ai/gemini-3.1-pro-preview` | - | - | - | 채팅 |
| Google Vertex AI | `vertex_ai/gemini-3.1-flash-lite-preview` | - | - | - | 채팅 |
| Google Vertex AI | `vertex_ai/gemini-embedding-2-preview` | - | $0.20 | - | 임베딩 |
| Mistral | `mistral/magistral-medium-1-2-2509` | 40K | $2.00 | $5.00 | 채팅, 도구, 추론 |
| Mistral | `mistral/magistral-small-1-2-2509` | 40K | $0.50 | $1.50 | 채팅, 도구, 추론 |
| Mistral | `mistral/mistral-large-2512` | 262K | $0.50 | $1.50 | 채팅, 비전, 도구 |
| Mistral | `mistral/mistral-medium-3-1-2508` | - | - | - | 채팅 |
| Mistral | `mistral/mistral-small-3-2-2506` | - | - | - | 채팅 |
| Mistral | `mistral/ministral-3-3b-2512` | - | - | - | 채팅 |
| Mistral | `mistral/ministral-3-8b-2512` | - | - | - | 채팅 |
| Mistral | `mistral/ministral-3-14b-2512` | - | - | - | 채팅 |
| Black Forest Labs | `black_forest_labs/flux-kontext-pro` | - | - | - | 이미지 편집 |
| Black Forest Labs | `black_forest_labs/flux-kontext-max` | - | - | - | 이미지 편집 |
| Black Forest Labs | `black_forest_labs/flux-pro-1.0-fill` | - | - | - | 이미지 편집(인페인트) |
| Black Forest Labs | `black_forest_labs/flux-pro-1.0-expand` | - | - | - | 이미지 편집(아웃페인트) |
| Black Forest Labs | `black_forest_labs/flux-pro-1.1` | - | - | - | 이미지 생성 |
| Black Forest Labs | `black_forest_labs/flux-pro-1.1-ultra` | - | - | - | 이미지 생성 |
| Black Forest Labs | `black_forest_labs/flux-dev` | - | - | - | 이미지 생성 |
| Black Forest Labs | `black_forest_labs/flux-pro` | - | - | - | 이미지 생성 |
| Azure AI | `azure_ai/grok-4-1-fast-non-reasoning` | 131K | $0.20 | $0.50 | 채팅, 도구 |
| Azure AI | `azure_ai/grok-4-1-fast-reasoning` | 131K | $0.20 | $0.50 | 채팅, 도구, 추론 |
| Azure AI | `azure_ai/mistral-document-ai-2512` | - | - | - | OCR |
| Dashscope | `dashscope/qwen3-next-80b-a3b-instruct` | 262K | $0.15 | $1.20 | 채팅 |
| Dashscope | `dashscope/qwen3-next-80b-a3b-thinking` | 262K | $0.15 | $1.20 | 채팅, 추론 |
| Dashscope | `dashscope/qwen3-vl-235b-a22b-instruct` | 131K | $0.40 | $1.60 | 채팅, 비전 |
| Dashscope | `dashscope/qwen3-vl-235b-a22b-thinking` | 131K | $0.40 | $4.00 | 채팅, 비전, 추론 |
| Dashscope | `dashscope/qwen3-vl-32b-instruct` | 131K | $0.16 | $0.64 | 채팅, 비전 |
| Dashscope | `dashscope/qwen3-vl-32b-thinking` | 131K | $0.16 | $2.87 | 채팅, 비전, 추론 |
| Dashscope | `dashscope/qwen3-vl-plus` | 260K | - | - | 채팅, 비전 |
| Dashscope | `dashscope/qwen3.5-plus` | 992K | - | - | 채팅 |
| Dashscope | `dashscope/qwen3-max-2026-01-23` | 258K | - | - | 채팅 |
| Nebius AI | `nebius/deepseek-ai/DeepSeek-R1` | 128K | $0.80 | $2.40 | 채팅, 추론 |
| Nebius AI | `nebius/deepseek-ai/DeepSeek-R1-0528` | 164K | $0.80 | $2.40 | 채팅, 추론 |
| Nebius AI | `nebius/deepseek-ai/DeepSeek-V3` | 128K | $0.50 | $1.50 | 채팅 |
| Nebius AI | `nebius/deepseek-ai/DeepSeek-V3-0324` | 128K | $0.50 | $1.50 | 채팅 |
| Nebius AI | `nebius/deepseek-ai/DeepSeek-R1-Distill-Llama-70B` | 128K | $0.25 | $0.75 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen3-235B-A22B` | 262K | $0.20 | $0.60 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen3-32B` | 32K | $0.10 | $0.30 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen3-30B-A3B` | 32K | $0.10 | $0.30 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen3-14B` | 32K | $0.08 | $0.24 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen3-4B` | 32K | $0.08 | $0.24 | 채팅 |
| Nebius AI | `nebius/Qwen/QwQ-32B` | 32K | $0.15 | $0.45 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen2.5-72B-Instruct` | 128K | $0.13 | $0.40 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen2.5-32B-Instruct` | 128K | $0.06 | $0.20 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen2.5-VL-72B-Instruct` | 131K | $0.13 | $0.40 | 채팅, 비전 |
| Nebius AI | `nebius/Qwen/Qwen2-VL-72B-Instruct` | 131K | $0.13 | $0.40 | 채팅, 비전 |
| Nebius AI | `nebius/Qwen/Qwen2-VL-7B-Instruct` | 131K | $0.02 | $0.06 | 채팅, 비전 |
| Nebius AI | `nebius/meta-llama/Meta-Llama-3.1-405B-Instruct` | 128K | $1.00 | $3.00 | 채팅 |
| Nebius AI | `nebius/meta-llama/Meta-Llama-3.1-70B-Instruct` | 128K | $0.13 | $0.40 | 채팅 |
| Nebius AI | `nebius/meta-llama/Meta-Llama-3.1-8B-Instruct` | 128K | $0.02 | $0.06 | 채팅 |
| Nebius AI | `nebius/meta-llama/Llama-3.3-70B-Instruct` | 128K | $0.13 | $0.40 | 채팅 |
| Nebius AI | `nebius/meta-llama/Llama-Guard-3-8B` | 128K | $0.02 | $0.06 | 채팅 |
| Nebius AI | `nebius/nvidia/Llama-3.1-Nemotron-Ultra-253B-v1` | 128K | $0.60 | $1.80 | 채팅 |
| Nebius AI | `nebius/nvidia/Llama-3.3-Nemotron-Super-49B-v1` | 131K | $0.10 | $0.40 | 채팅 |
| Nebius AI | `nebius/NousResearch/Hermes-3-Llama-3.1-405B` | 128K | $1.00 | $3.00 | 채팅 |
| Nebius AI | `nebius/google/gemma-3-27b-it` | 128K | $0.06 | $0.20 | 채팅 |
| Nebius AI | `nebius/mistralai/Mistral-Nemo-Instruct-2407` | 128K | $0.04 | $0.12 | 채팅 |
| Nebius AI | `nebius/Qwen/Qwen2.5-Coder-7B` | 32K | $0.01 | $0.03 | 채팅 |
| Nebius AI | `nebius/BAAI/bge-en-icl` | 32K | $0.01 | - | 임베딩 |
| Nebius AI | `nebius/BAAI/bge-multilingual-gemma2` | 8K | $0.01 | - | 임베딩 |
| Nebius AI | `nebius/intfloat/e5-mistral-7b-instruct` | 32K | $0.01 | - | 임베딩 |
| AWS Bedrock | `mistral.devstral-2-123b` | 256K | $0.40 | $2.00 | 채팅, 도구 |
| AWS Bedrock | `zai.glm-4.7-flash` | 200K | $0.07 | $0.40 | 채팅, 도구, 추론 |
| ZAI | `zai/glm-5` | 200K | $1.00 | $3.20 | 채팅, 도구, 추론 |
| ZAI | `zai/glm-5-code` | 200K | $1.20 | $5.00 | 채팅, 도구, 추론 |
| OpenRouter | `openrouter/anthropic/claude-sonnet-4.6` | - | - | - | 채팅 |
| OpenRouter | `openrouter/google/gemini-3.1-pro-preview` | - | - | - | 채팅 |
| OpenRouter | `openrouter/openai/gpt-5.1-codex-max` | - | - | - | 채팅 |
| OpenRouter | `openrouter/qwen/qwen3-coder-plus` | - | - | - | 채팅 |
| OpenRouter | `openrouter/qwen/qwen3.5-*` (5개 모델) | - | - | - | 채팅 |
| OpenRouter | `openrouter/z-ai/glm-5` | - | - | - | 채팅 |
| Together AI | `together_ai/Qwen/Qwen3.5-397B-A17B` | - | - | - | 채팅 |
| Perplexity | `perplexity/pplx-embed-v1-0.6b` | 32K | $0.00 | - | 임베딩 |
| Perplexity | `perplexity/pplx-embed-v1-4b` | 32K | $0.03 | - | 임베딩 |
| Serper | `serper/search` | - | - | - | 검색 |

#### 업데이트된 모델 {#updated-models}

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - Bedrock 호스팅 Anthropic 모델(`claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`, APAC/EU 변형)에 `cache_read_input_token_cost`와 `cache_creation_input_token_cost`를 추가했습니다. 이제 프롬프트 캐싱이 비용 추정에 반영됩니다.
    - 올바른 리전 식별자를 반영하도록 `apac.anthropic.claude-sonnet-4-6` → `au.anthropic.claude-sonnet-4-6`로 이름을 변경했습니다.

- **[Azure OpenAI](../../docs/providers/azure)**
    - 모든 `gpt-5.1-chat`, `gpt-5.1-codex`, `gpt-5.4` 변형(global, EU, standard deployment)에 `supports_none_reasoning_effort`를 추가했습니다. `reasoning_effort: null`을 전달해 추론을 비활성화할 수 있습니다.

- **[Azure OpenAI](../../docs/providers/azure)** — 지원 중단 모델 제거
    - `azure/gpt-35-turbo-0301` 제거(2025-02-13 지원 중단)
    - `azure/gpt-35-turbo-0613` 제거(2025-02-13 지원 중단)

#### 기능

- **[OpenAI](../../docs/providers/openai)**
    - OpenAI와 Azure에서 `gpt-5.4`, `gpt-5.4-pro` 출시 당일 지원

- **[Google Gemini](../../docs/providers/gemini)**
    - Gemini 3.x 모델 비용 맵 항목 추가 — `gemini-3-flash-preview`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`, `gemini-3-pro-image-preview`, `gemini-embedding-2-preview`
    - Gemini 2.0 Flash와 Flash Lite를 비용 맵에 추가(업데이트된 가격으로 재추가)

- **[Google Vertex AI](../../docs/providers/vertex)**
    - Vertex AI 모델 비용 맵에 `gemini-3-flash-preview`, `gemini-3.1-flash-lite-preview`, `gemini-flash-experimental`, `gemini-embedding-2-preview` 추가

- **[Mistral](../../docs/providers/mistral)**
    - Magistral 추론 모델 추가(`magistral-medium-1-2-2509`, `magistral-small-1-2-2509`)
    - `mistral-large-2512`, `mistral-medium-3-1-2508`, `mistral-small-3-2-2506`, `ministral-3-*` 변형 추가

- **[Dashscope / Qwen](../../docs/providers/dashscope)**
    - Qwen3 VL 멀티모달 모델 추가(`qwen3-vl-235b`, `qwen3-vl-32b` — instruct 및 thinking 변형)
    - `qwen3-next-80b-a3b`(instruct + thinking), `qwen3.5-plus`, `qwen3-max-2026-01-23` 추가

- **[Black Forest Labs](../../docs/providers/black_forest_labs)**
    - FLUX Kontext 이미지 편집 모델 추가(`flux-kontext-pro`, `flux-kontext-max`)
    - FLUX Pro 1.0 Fill(인페인팅) 및 Expand(아웃페인팅) 추가
    - `flux-pro-1.1`, `flux-pro-1.1-ultra`, `flux-dev`, `flux-pro` 추가

- **[Azure AI](../../docs/providers/azure_ai)**
    - Azure AI Foundry를 통한 xAI Grok 모델 추가(`grok-4-1-fast-non-reasoning`, `grok-4-1-fast-reasoning`)
    - Mistral Document AI(`mistral-document-ai-2512`) 추가 — OCR 모드

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - `mistral.devstral-2-123b` 추가(256K 컨텍스트, 도구)
    - Bedrock Converse를 통한 `zai.glm-4.7-flash` 추가(200K 컨텍스트, 도구, 추론)

- **[SageMaker](../../docs/providers/aws_sagemaker)**
    - SageMaker의 Amazon Nova 모델용 `sagemaker_nova` 제공자 추가 - [PR #21542](https://github.com/BerriAI/litellm/pull/21542)

#### 지원 중단 / 제거된 모델 {#deprecated--removed-models}

**OpenAI** — 비용 맵에서 레거시 모델 제거:
- `gpt-3.5-turbo-0301`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-16k-0613`
- `gpt-4-0314`, `gpt-4-32k`, `gpt-4-32k-0314`, `gpt-4-32k-0613`, `gpt-4-1106-vision-preview`, `gpt-4-vision-preview`
- `gpt-4.5-preview`, `gpt-4.5-preview-2025-02-27`
- `gpt-4o-audio-preview-2024-10-01`, `gpt-4o-realtime-preview-2024-10-01`
- `o1-mini`, `o1-mini-2024-09-12`, `o1-preview`, `o1-preview-2024-09-12`

**Google Gemini** — Gemini 1.5 및 레거시 2.0 변형 제거:
- 모든 `gemini-1.5-*` 변형(flash, flash-8b, pro, 날짜 버전)
- `gemini-2.0-flash-exp`, `gemini-2.0-pro-exp-02-05`, `gemini-2.5-flash-preview-04-17`, `gemini-2.5-flash-preview-05-20`

**Google Vertex AI** — PaLM 2 / 레거시 모델 제거:
- 모든 `chat-bison`, `text-bison`, `codechat-bison`, `code-bison`, `code-gecko` 변형
- Gemini 1.0 Pro, 1.5 Flash/Pro, 2.0 Flash experimental 및 preview 변형

**Perplexity** — 레거시 Llama-sonar 모델 제거:
- `llama-3.1-sonar-huge-128k-online`, `llama-3.1-sonar-large/small-128k-chat/online`

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능

- **[Responses API](../../docs/response_api)**
    - 백그라운드 스트리밍에서 `response.failed`, `response.incomplete`, `response.cancelled` 종료 이벤트 타입 처리. 이전에는 `response.completed`만 처리했습니다. - [PR #23492](https://github.com/BerriAI/litellm/pull/23492)
    - Responses API용 WebSocket 스트리밍 지원 — 모든 제공자에서 WebSocket 기반 실시간 스트리밍 제공 - [PR #22559](https://github.com/BerriAI/litellm/pull/22559), [PR #22771](https://github.com/BerriAI/litellm/pull/22771)
    - 실시간 오디오/비디오 통신용 WebRTC 지원 - [PR #23446](https://github.com/BerriAI/litellm/pull/23446)
    - OpenAI 호환 JSON 제공자(`openai_like`)용 Responses API 지원 - [PR #21398](https://github.com/BerriAI/litellm/pull/21398)
    - 도구와 추론을 모두 사용하는 `gpt-5.4+` 호출을 Responses API로 자동 라우팅 - [PR #23577](https://github.com/BerriAI/litellm/pull/23577)

- **[Anthropic Files API](../../docs/providers/anthropic)**
    - Anthropic Files API 전체 지원 — 파일 업로드, 조회, 목록, 삭제 및 메시지 내 파일 참조 사용 - [PR #16594](https://github.com/BerriAI/litellm/pull/16594)

- **[Mistral](../../docs/providers/mistral)**
    - Voxtral 오디오 전사 지원 — Mistral을 통한 오디오 전사용 `mistral/voxtral-mini-*`, `mistral/voxtral-*` - [PR #22801](https://github.com/BerriAI/litellm/pull/22801)

- **[OpenAI](../../docs/providers/openai)**
    - `litellm.acount_tokens()` 공개 API — 전체 OpenAI 제공자 지원이 포함된 비동기 토큰 계산 - [PR #22809](https://github.com/BerriAI/litellm/pull/22809)
    - 채팅 완료 API용 `reasoning_effort` dict를 문자열로 정규화 - [PR #22981](https://github.com/BerriAI/litellm/pull/22981)

- **[OpenRouter](../../docs/providers/openrouter)**
    - OpenRouter 모델의 이미지 편집 지원 - [PR #22403](https://github.com/BerriAI/litellm/pull/22403)

- **[Google Gemini](../../docs/providers/gemini)**
    - Gemini 3 — `reasoning_effort`가 생략되면 기본 `thinking_level`을 주입하지 않습니다(Gemini API와 일치, Flash는 기존 `minimal` 대신 `high`가 기본일 수 있음). — [Gemini 3 blog](../../blog/gemini_3)

- **[Google Vertex AI](../../docs/providers/vertex)**
    - `completion_tokens_details`에서 VIDEO 모달리티 토큰 사용량 추적 - [PR #22550](https://github.com/BerriAI/litellm/pull/22550)

- **Images API**
    - 이미지 편집 API용 `input_fidelity` 파라미터 - [PR #23201](https://github.com/BerriAI/litellm/pull/23201)

- **일반**
    - 스레드 안전 JSON 스키마 검증을 위한 요청별 `enable_json_schema_validation` 플래그 - [PR #21233](https://github.com/BerriAI/litellm/pull/21233)
    - 모델 비용 별칭 확장 — 부모 모델의 가격을 상속하는 별칭을 비용 맵에 정의 - [PR #23314](https://github.com/BerriAI/litellm/pull/23314), [PR #23457](https://github.com/BerriAI/litellm/pull/23457)
    - Files API의 와일드카드 모델 지원 - [PR #22740](https://github.com/BerriAI/litellm/pull/22740)

#### 버그 수정

- **[Anthropic](../../docs/providers/anthropic)**
    - 가드레일이 Anthropic Messages API용으로 도구를 변환할 때 네이티브 도구 형식(web_search, bash, tool_search 등)을 보존합니다. - [PR #23526](https://github.com/BerriAI/litellm/pull/23526)
    - `_map_tool_helper`의 도구 입력 스키마에 `type: "object"`를 강제해 엄격한 스키마 제공자의 도구 호출 실패를 수정했습니다. - [PR #23103](https://github.com/BerriAI/litellm/pull/23103)
    - `tool_result` 메시지를 `tool_call_id` 기준으로 중복 제거해 멀티턴 대화에서 중복 도구 결과 오류를 방지합니다. - [PR #23104](https://github.com/BerriAI/litellm/pull/23104)
    - Claude 4.6 모델에서 `reasoning_effort`를 `output_config`에 매핑합니다. - [PR #22220](https://github.com/BerriAI/litellm/pull/22220)

- **[Google Gemini](../../docs/providers/gemini)**
    - 도구 호출의 스트리밍 `finish_reason` 수정 — `tool_calls` 대신 `null`을 잘못 반환하던 문제를 고쳤습니다. - [PR #21577](https://github.com/BerriAI/litellm/pull/21577)
    - Gemini 2.0+용 JSON Schema에서 `$ref` 보존 — 스키마 참조가 제거되어 구조화된 출력이 깨지던 문제를 수정했습니다. - [PR #21597](https://github.com/BerriAI/litellm/pull/21597)
    - Gemini 3.1 모델의 `minimal` `reasoning_effort` 파라미터 처리 - [PR #22920](https://github.com/BerriAI/litellm/pull/22920)

- **[Google Vertex AI](../../docs/providers/vertex)**
    - 이미지 생성에서 네이티브 Gemini `imageConfig` 파라미터를 그대로 전달합니다. - [PR #21585](https://github.com/BerriAI/litellm/pull/21585)
    - 스트리밍에서 `finish_reason`이 콘텐츠 청크보다 먼저 도착할 때 콘텐츠가 잘리는 문제를 방지합니다. - [PR #22692](https://github.com/BerriAI/litellm/pull/22692)
    - Gemini 요청 본문으로 병합하기 전에 `extra_body`에서 LiteLLM 내부 키를 제거합니다. - [PR #23131](https://github.com/BerriAI/litellm/pull/23131)
    - 모든 Vertex AI 요청에서 지원되지 않는 `output_config` 파라미터를 제거합니다. - [PR #22884](https://github.com/BerriAI/litellm/pull/22884)
    - Gemini 2.0+ 도구 파라미터의 스키마 변환을 건너뛰어 네이티브 Gemini 스키마 처리가 깨지지 않도록 합니다. - [PR #23265](https://github.com/BerriAI/litellm/pull/23265)

- **[OpenRouter](../../docs/providers/openrouter)**
    - 제공자 접두사가 모델 이름과 일치할 때 네이티브 모델이 두 번 제거되는 문제를 패턴 기반으로 수정했습니다. - [PR #22320](https://github.com/BerriAI/litellm/pull/22320)
    - `stream_options`가 설정되지 않은 경우 스트리밍 응답에서 제공자가 보고한 사용량을 사용합니다. - [PR #21592](https://github.com/BerriAI/litellm/pull/21592)

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - `bedrock/{region}/{model}` 경로 형식에서 리전과 모델 ID를 추출합니다. - [PR #22546](https://github.com/BerriAI/litellm/pull/22546)
    - Bedrock 및 Azure AI의 Anthropic 메시지에서 `cache_control`의 `scope`를 제거합니다. - [PR #22867](https://github.com/BerriAI/litellm/pull/22867)
    - Responses API 응답에 `completion_tokens_details`를 채웁니다. - [PR #23243](https://github.com/BerriAI/litellm/pull/23243)

- **[Azure AI](../../docs/providers/azure_ai)**
    - Document Intelligence OCR에서 환경 변수로부터 `api_base`를 해석합니다. - [PR #21581](https://github.com/BerriAI/litellm/pull/21581)

- **[Moonshot / Kimi](../../docs/providers/openai_compatible)**
    - Moonshot Kimi 추론 모델의 `reasoning_content`를 자동으로 채웁니다. - [PR #23580](https://github.com/BerriAI/litellm/pull/23580)
    - Moonshot의 멀티모달 메시지에서 `image_url` 블록을 보존합니다. - [PR #21595](https://github.com/BerriAI/litellm/pull/21595)

- **[HuggingFace](../../docs/providers/huggingface)**
    - HuggingFace 임베딩 API로 `extra_headers`를 전달합니다. - [PR #23525](https://github.com/BerriAI/litellm/pull/23525)

- **토큰 계산 / 비용**
    - 토큰 계산 API 요청에서 시스템 프롬프트와 도구를 포함하도록 `count_tokens`를 수정했습니다. - [PR #22301](https://github.com/BerriAI/litellm/pull/22301)
    - `completion()`과 `embedding()`에서 모든 사용자 지정 가격 필드를 `register_model`로 전달합니다. - [PR #22552](https://github.com/BerriAI/litellm/pull/22552)

- **도구 / 함수 호출**
    - 도구 호출 인자의 잘린 JSON을 복구해 잘못된 형식의 도구 응답에서 충돌이 발생하지 않도록 합니다. - [PR #22503](https://github.com/BerriAI/litellm/pull/22503)
    - 스트리밍에서 `finish_reason`을 내보내지 않는 함수 호출의 `output_item.done`을 수정했습니다. - [PR #22553](https://github.com/BerriAI/litellm/pull/22553)
    - 여러 웹 검색이 있을 때 thinking 블록 순서를 보존합니다. - [PR #23093](https://github.com/BerriAI/litellm/pull/23093)

- **일반**
    - 제공자 전반에서 `content_filtered` 완료 이유를 정규화합니다. - [PR #23564](https://github.com/BerriAI/litellm/pull/23564)
    - 모든 제공자의 `finish_reason` 매핑을 OpenAI 호환 값으로 통합합니다. - [PR #22138](https://github.com/BerriAI/litellm/pull/22138)
    - `/v1/messages`와 `/v1/responses` 배포의 사용자 지정 비용 추적을 수정했습니다. - [PR #23647](https://github.com/BerriAI/litellm/pull/23647)
    - `router_model_id`에 가격 데이터가 없을 때 요청별 사용자 지정 가격을 수정했습니다. 이제 모델 이름으로 대체합니다.
    - 완료 후 배치 목록이 오래된 `validating` 상태를 표시하던 문제를 수정했습니다. - [PR #22982](https://github.com/BerriAI/litellm/pull/22982)
    - `model_id`가 없을 때 배치 조회가 원시 `output_file_id`를 반환하던 문제를 수정했습니다. - [PR #23194](https://github.com/BerriAI/litellm/pull/23194)
    - `x-litellm-model` 헤더가 사용될 때 배치 ID를 인코딩합니다. - [PR #22653](https://github.com/BerriAI/litellm/pull/22653)
    - gpt-oss 제공자의 스트리밍 Delta에서 `reasoning`을 `reasoning_content`로 매핑합니다. - [PR #22803](https://github.com/BerriAI/litellm/pull/22803)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능

- **가상 키**
    - 키 생성/수정 양식에 조직 드롭다운 추가 — `organization_id`가 키 소유권의 일급 필드가 되었습니다. - [PR #23595](https://github.com/BerriAI/litellm/pull/23595)
    - `/key/update`에서 `organization_id` 설정 허용 — 생성 후 키를 다른 조직에 할당하거나 이동할 수 있습니다. - [PR #23557](https://github.com/BerriAI/litellm/pull/23557)
    - UI에서 가상 키의 수동 사용액 재설정 지원 — 관리자가 필요할 때 키 사용액을 0으로 재설정할 수 있습니다. - [PR #22715](https://github.com/BerriAI/litellm/pull/22715)
    - BYOK(Bring Your Own Key) — Anthropic `/v1/messages`에서 클라이언트 측 제공자 API 키가 프록시 키보다 우선합니다. - [PR #22964](https://github.com/BerriAI/litellm/pull/22964)
    - `LITELLM_UI_SESSION_DURATION` 환경 변수로 UI 로그인 세션 기간 구성 가능 - [PR #22182](https://github.com/BerriAI/litellm/pull/22182)
    - config.yaml의 `auto_redirect_ui_login_to_sso: true`로 UI 로그인을 SSO로 자동 리디렉션 - [PR #23367](https://github.com/BerriAI/litellm/pull/23367)

- **접근 제어(RBAC)**
    - Org Admin이 팀 관리 엔드포인트에 접근 가능 — `/team/new`, `/team/update`, `/team/delete`, `/team/member_add`, `/team/member_delete` - [PR #23085](https://github.com/BerriAI/litellm/pull/23085), [PR #23095](https://github.com/BerriAI/litellm/pull/23095)
    - Org Admin이 내부 사용자를 조회하고 초대할 수 있습니다. 전역 관리자 역할 없이 전체 사용자 관리가 가능합니다. - [PR #23080](https://github.com/BerriAI/litellm/pull/23080)
    - Admin Viewer의 감사 로그 접근 허용 — 보기 전용 관리자 역할에 감사 로그 접근 권한이 포함됩니다. - [PR #23419](https://github.com/BerriAI/litellm/pull/23419)
    - Vector Store와 Agent용 RBAC — 벡터 저장소 및 에이전트 리소스에 대한 키/팀 수준 접근 제어 - [PR #22858](https://github.com/BerriAI/litellm/pull/22858)
    - 사용자 필터 범위(`scope_user_search_to_org`)가 opt-in으로 변경되었습니다. 이전에는 기본 활성화라 의도치 않은 제한을 만들 수 있었습니다. - [PR #23057](https://github.com/BerriAI/litellm/pull/23057)

- **벡터 저장소**
    - Vector Store 관리 엔드포인트 — `/v1/vector_stores/*`를 통해 벡터 저장소 조회, 목록, 업데이트, 삭제 지원 - [PR #23435](https://github.com/BerriAI/litellm/pull/23435)

- **팀**
    - 팀용 배치 만료 설정 — 모든 팀 키의 기본 만료 기간 구성 - [PR #22705](https://github.com/BerriAI/litellm/pull/22705)
    - Team Admin이 키 사용액을 재설정할 수 있습니다. - [PR #22725](https://github.com/BerriAI/litellm/pull/22725)

- **내부 사용자**
    - 내부 사용자 정보 페이지에서 팀 멤버십을 직접 추가/제거할 수 있습니다. 검색 가능한 드롭다운과 역할 선택기를 포함하며, 더 이상 각 팀으로 이동할 필요가 없습니다. - [PR #23638](https://github.com/BerriAI/litellm/pull/23638)

- **모델**
    - UI를 통해 모델에 지식 베이스 연결 - [PR #22656](https://github.com/BerriAI/litellm/pull/22656)

- **기본 팀 설정**
    - 페이지를 antd 기반으로 현대화했습니다(앱 나머지 부분과 일관성 유지). - [PR #23614](https://github.com/BerriAI/litellm/pull/23614)
    - 수정: 기본 팀 파라미터(budget, duration, tpm, rpm, permissions)가 `/team/new`에 올바르게 적용됩니다. - [PR #23614](https://github.com/BerriAI/litellm/pull/23614)
    - 수정: 프록시 재시작 후에도 설정이 유지됩니다(`default_team_params`가 `LITELLM_SETTINGS_SAFE_DB_OVERRIDES`에 추가됨). - [PR #23614](https://github.com/BerriAI/litellm/pull/23614)
    - 수정: `_update_litellm_setting`에서 `get_config()`가 방금 저장된 값을 덮어쓸 수 있던 경쟁 상태 해결 - [PR #23614](https://github.com/BerriAI/litellm/pull/23614)

- **사용법**
    - 일일 사용액 데이터 자동 페이지네이션 — 모든 엔티티 보기(teams, orgs, customers, tags, agents, users)가 페이지를 점진적으로 가져오고 각 페이지 이후 차트를 업데이트합니다. - [PR #23622](https://github.com/BerriAI/litellm/pull/23622)

- **모델 / 비용**
    - UI의 Azure Model Router 비용 상세 — `CostBreakdownViewer`에서 `hidden_params`의 하위 모델별 `additional_costs` 표시 - [PR #23550](https://github.com/BerriAI/litellm/pull/23550)

- **사용자 관리**
    - 신규 `/user/info/v2` 엔드포인트 — 대규모 설치에서 메모리 및 안정성 문제를 만들던 기존 god 엔드포인트를 범위 지정 및 페이지네이션 방식으로 대체 - [PR #23437](https://github.com/BerriAI/litellm/pull/23437)

#### 버그 수정

- 잘못된 Prisma `group_by` kwargs 때문에 태그 목록 엔드포인트가 500을 반환하던 문제 수정 - [PR #23606](https://github.com/BerriAI/litellm/pull/23606)
- `scope_user_search_to_org`가 활성화된 경우 Team Admin이 `/user/filter/ui`에서 403을 받던 문제 수정 - [PR #23671](https://github.com/BerriAI/litellm/pull/23671)
- 저장 후 Public Model Hub가 구성에 정의된 모델을 표시하지 않던 문제 수정 - [PR #23501](https://github.com/BerriAI/litellm/pull/23501)
- 대체 팝업 모델 드롭다운 z-index 문제 수정 - [PR #23516](https://github.com/BerriAI/litellm/pull/23516)
- `/key/update`에서 조직/팀 키 제한 확인이 중복 계산되던 버그 수정
- 동일한 초대 링크로 여러 번 비밀번호 재설정이 가능하던 문제 수정 - [PR #22462](https://github.com/BerriAI/litellm/pull/22462)
- `duration`이 설정되지 않았을 때 키 만료 기본 기간이 적용되지 않던 문제 수정 - [PR #22956](https://github.com/BerriAI/litellm/pull/22956)
- 키 생성에서 모든 프록시 모델이 모델 접근 그룹을 포함하지 않던 문제 수정 - [PR #23236](https://github.com/BerriAI/litellm/pull/23236)
- 관리자 뷰어가 모든 조직을 볼 수 없던 문제 수정 - [PR #22940](https://github.com/BerriAI/litellm/pull/22940)
- 감사 로그 UI 수정: 서버 측 페이지네이션, 필터링, drawer view 추가 - [PR #22476](https://github.com/BerriAI/litellm/pull/22476)
- 팀 보기의 가상 키에 팀 필터가 올바르게 적용되지 않던 문제 수정 - [PR #23065](https://github.com/BerriAI/litellm/pull/23065)
- 팀 만료 적용 검증 수정 - [PR #22728](https://github.com/BerriAI/litellm/pull/22728)

---

## AI 통합 {#ai-integrations}

### 로깅 {#logging}

- **[Helicone](../../docs/observability/helicone_integration)**
    - HeliconeLogger에 Gemini 및 Vertex AI 지원 추가 — Gemini와 Vertex AI 요청을 올바른 Helicone 제공자 URL로 라우팅합니다. - [PR #19288](https://github.com/BerriAI/litellm/pull/19288)
    - Vertex AI Gemini 모델의 올바른 제공자 URL 수정 - [PR #22603](https://github.com/BerriAI/litellm/pull/22603)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - 실패한 요청에서 추적이 누락되던 실패 경로 kwargs 불일치 수정 - [PR #22390](https://github.com/BerriAI/litellm/pull/22390)

- **[Vantage](https://vantage.sh)**
    - FOCUS 1.2 CSV 내보내기용 Vantage 통합 추가 — LiteLLM 프록시 사용액 데이터를 FinOps Open Cost & Usage Specification 보고서로 내보내고, 덮어쓰기 방지를 위해 시간 창 기반 파일 이름을 사용합니다. - [PR #23333](https://github.com/BerriAI/litellm/pull/23333)

- **일반**
    - 실험 간 지표 충돌을 만들던 조용한 지표 경쟁 상태 수정 - [PR #23542](https://github.com/BerriAI/litellm/pull/23542)

### 가드레일

- **가드레일 모드 기본 목록** — 요청별 모드가 지정되지 않았을 때 전역으로 적용되는 기본 가드레일 모드 목록 구성 - [PR #22676](https://github.com/BerriAI/litellm/pull/22676)
- **태그 기반 가드레일 모드 목록** — 태그 기반 가드레일 구성에서 단일 모드 대신 모드 목록 지정 - [PR #23020](https://github.com/BerriAI/litellm/pull/23020)
- **presidio PII 토큰 누출 수정** — Presidio의 Anthropic 핸들러가 토큰 응답에서 PII 데이터 노출을 만들던 예외 사례 수정 - [PR #22627](https://github.com/BerriAI/litellm/pull/22627)
- **OTEL 고아 가드레일 추적 수정** — OpenTelemetry 가드레일 추적의 span 중복과 누락된 응답 ID 수정 - [PR #23001](https://github.com/BerriAI/litellm/pull/23001)

### 프롬프트 관리 {#prompt-management}

이번 릴리스에는 주요 프롬프트 관리 변경이 없습니다.

### 시크릿 관리자 {#secret-managers}

- **[Hashicorp Vault](../../docs/secret_managers)** — 구성 재정의 백엔드로 Hashicorp Vault 전체 통합 지원 — Vault에 정의된 시크릿을 시작 시 가져와 `config.yaml` 값을 재정의합니다. Vault에서 가져온 자격 증명을 관리하는 UI 지원 포함 - [PR #22939](https://github.com/BerriAI/litellm/pull/22939), [PR #23036](https://github.com/BerriAI/litellm/pull/23036)

---

## MCP 게이트웨이 {#mcp-gateway}

#### 기능

- **MCP 서버용 토큰 인증** — MCP 서버별 `auth_type: "bearer"`를 구성해 도구 호출에 토큰 기반 인증을 요구할 수 있습니다. - [PR #23260](https://github.com/BerriAI/litellm/pull/23260)
- **팀 범위 MCP 서버 필터링** — 팀 아래 생성된 키는 해당 팀에서 사용 가능한 MCP 서버만 볼 수 있습니다. - [PR #23323](https://github.com/BerriAI/litellm/pull/23323)
- **UI의 서버별 상태 재확인** — 모든 서버를 다시 로드하지 않고 개별 MCP 서버의 상태 확인을 트리거할 수 있습니다. - [PR #23328](https://github.com/BerriAI/litellm/pull/23328)

#### 버그 수정

- 도구 검색 실패를 만들던 MCP 서버 URL 및 도구 관리 문제 수정 - [PR #22751](https://github.com/BerriAI/litellm/pull/22751)
- 서버 삭제 시 MCP 서버 상태 확인이 트리거되던 문제 수정 - [PR #23063](https://github.com/BerriAI/litellm/pull/23063)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

- **예산 연결 키의 사용액 재설정 누락 수정** — 예산 객체에 연결된 키의 사용액이 구성된 재설정 주기에 재설정되지 않던 문제 수정 - [PR #20688](https://github.com/BerriAI/litellm/pull/20688)
- **Flex 가격 지원** — 동적 가격 계층을 제공하는 제공자용 `flex_pricing` 필드를 비용 맵에 추가 - [PR #22992](https://github.com/BerriAI/litellm/pull/22992)
- **사용액 로그 정리 수정** — 사용액 로그 정리 작업의 잠금 추적, 정수 보존, 건너뛸 로그 레벨 문제 해결 - [PR #22687](https://github.com/BerriAI/litellm/pull/22687)
- **WebSearch 사용액 로그 중복 제거 수정** — thinking이 활성화된 경우 WebSearch 가로채기가 실패하던 문제와 사용액 로그 중복 제거를 함께 수정 - [PR #22679](https://github.com/BerriAI/litellm/pull/22679)
- **요청에 API 키가 없을 때 TypeError 수정** — 요청에 API 키가 없을 때 사용액 추적이 처리되지 않은 예외를 던지던 문제 수정 - [PR #23363](https://github.com/BerriAI/litellm/pull/23363)

---

## 성능 / 로드밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability}

- **약 1시간 후 스트리밍 충돌 수정** — `LLMClientCache._remove_key()`가 제거된 HTTP/SDK 클라이언트에 더 이상 `close()`/`aclose()`를 호출하지 않습니다. 1시간 TTL 만료 후 진행 중 요청이 `RuntimeError: Cannot send a request, as the client has been closed.`로 충돌하던 문제를 해결했습니다. 정리는 이제 종료 시 `close_litellm_async_clients()`를 통해서만 실행됩니다. - [PR #22926](https://github.com/BerriAI/litellm/pull/22926)
- **대규모 설치의 OOM / Prisma 연결 손실 수정** — 336K+ 대기 중 응답 행이 있는 인스턴스에서 무제한 관리 객체 폴링이 약 60~70분 후 Prisma 연결을 소진하던 문제를 수정했습니다. - [PR #23472](https://github.com/BerriAI/litellm/pull/23472)
- **로깅 kwargs 업데이트 중앙화** — 모든 로깅 업데이트를 단일 함수로 이관해 로깅 경로 전반의 kwargs 불일치를 제거한 근본 원인 수정입니다. - [PR #23659](https://github.com/BerriAI/litellm/pull/23659)
- **루트가 아닌 오프라인 컨테이너의 tiktoken 캐시 수정** — 루트가 아닌 사용자로 실행되는 오프라인 환경에서 tiktoken 캐시가 올바르게 동작합니다. - [PR #23498](https://github.com/BerriAI/litellm/pull/23498)
- **Redis 트랜잭션 버퍼에 Redis가 없으면 프록시 시작 차단** — Redis 연결 없이 `use_redis_transaction_buffer: true`가 설정된 경우 조용한 데이터 손실을 방지합니다. - [PR #23019](https://github.com/BerriAI/litellm/pull/23019)
- **`InFlightRequestsMiddleware` 충돌 수정** — 미들웨어의 정의되지 않은 kwargs로 요청 실패가 발생하던 문제를 수정했습니다. - [PR #22523](https://github.com/BerriAI/litellm/pull/22523)
- **문자열이 아닌 스트림 청크에서 `BaseModelResponseIterator` 충돌 수정** — 제공자가 문자열이 아닌 청크 데이터를 반환할 때 스트리밍이 충돌하던 문제를 수정했습니다. - [PR #23497](https://github.com/BerriAI/litellm/pull/23497)
- **`SERVER_ROOT_PATH` 접두사 처리 수정** — 매핑된 패스스루 라우트를 확인하기 전에 접두사를 제거해 이중 접두사 문제를 방지합니다. - [PR #23414](https://github.com/BerriAI/litellm/pull/23414)
- **CodSpeed 지속 성능 벤치마크 추가** — CI에서 자동 성능 회귀 추적 지원 - [PR #23676](https://github.com/BerriAI/litellm/pull/23676)

---

## 보안 {#security}

- **프록시 로그의 시크릿 마스킹** — 모든 LiteLLM 로거에 `SecretRedactionFilter`를 추가해 로그 메시지, 형식 인자, 예외 추적, 추가 필드에서 API 키, 토큰, 자격 증명을 제거합니다. 기본으로 활성화되며, `LITELLM_DISABLE_REDACT_SECRETS=true`로 해제할 수 있습니다. - [PR #23668](https://github.com/BerriAI/litellm/pull/23668), [PR #23667](https://github.com/BerriAI/litellm/pull/23667)
- **PyJWT를 `^2.12.0`으로 상향** — `^2.10.1`의 보안 취약점을 해결합니다. - [PR #23678](https://github.com/BerriAI/litellm/pull/23678)
- **`tar`를 7.5.11, `tornado`를 6.5.5로 상향** — 전이 의존성의 CVE를 해결합니다. - [PR #23602](https://github.com/BerriAI/litellm/pull/23602)

---

## 데이터베이스 / 프록시 운영 {#database--proxy-operations}

- **기존 인스턴스에서 Prisma migrate deploy 수정** — 마이그레이션 복구 로직의 여러 버그를 해결했습니다. P3018 멱등 오류 핸들러의 누락된 반환과, 복구 성공 후에도 조용한 실패를 만들던 `_roll_back_migration`의 처리되지 않은 예외를 수정했습니다. - [PR #23655](https://github.com/BerriAI/litellm/pull/23655)
- **DB 마이그레이션 실패 시 종료를 opt-in으로 변경** — 프록시는 더 이상 기본적으로 `prisma migrate deploy` 실패 시 종료하지 않습니다. `--enforce_prisma_migration_check`로 활성화할 수 있습니다. - [PR #23675](https://github.com/BerriAI/litellm/pull/23675)

---

## 문서 업데이트 {#documentation-updates}

- Anthropic `/v1/messages` → `/responses` 파라미터 매핑 참조 추가 - [PR #22893](https://github.com/BerriAI/litellm/pull/22893)
- Okta SSO 문서 및 사용자 지정 SSO 핸들러 예제 업데이트 - [PR #22786](https://github.com/BerriAI/litellm/pull/22786)
- 환경 변수 참조에 `LITELLM_MAX_BUDGET_PER_SESSION_TTL` 추가 - [PR #23186](https://github.com/BerriAI/litellm/pull/23186)
- `CLAUDE.md`에 DB 쿼리 성능 가이드라인 추가 - [PR #23196](https://github.com/BerriAI/litellm/pull/23196)
- Gemini Vertex AI PayGo/priority 비용 추적 문서 추가 - [PR #22948](https://github.com/BerriAI/litellm/pull/22948)

---

## 신규 기여자 {#new-contributors}

* @ryanh-ai가 [PR #21542](https://github.com/BerriAI/litellm/pull/21542)에서 첫 contribution을 했습니다.
* @ryan-crabbe가 [PR #23668](https://github.com/BerriAI/litellm/pull/23668)에서 첫 contribution을 했습니다.
* @Jah-yee가 [PR #23525](https://github.com/BerriAI/litellm/pull/23525)에서 첫 contribution을 했습니다.
* @gambletan이 [PR #23516](https://github.com/BerriAI/litellm/pull/23516)에서 첫 contribution을 했습니다.
* @awais786가 [PR #23183](https://github.com/BerriAI/litellm/pull/23183)에서 첫 contribution을 했습니다.
* @pradyyadav가 [PR #23580](https://github.com/BerriAI/litellm/pull/23580)에서 첫 contribution을 했습니다.
* @xianzongxie-stripe가 [PR #23492](https://github.com/BerriAI/litellm/pull/23492)에서 첫 contribution을 했습니다.
* @Harshit28j가 [PR #23333](https://github.com/BerriAI/litellm/pull/23333)에서 첫 contribution을 했습니다.
* @codspeed-hq[bot]이 [PR #23676](https://github.com/BerriAI/litellm/pull/23676)에서 첫 contribution을 했습니다.

---

## 변경 요약 {#diff-summary}

## 03/16/2026
* 신규 제공자: 7
* 신규 모델 / 업데이트된 모델: 신규 116개, 제거 132개
* LLM API 엔드포인트: 37
* 관리 엔드포인트 / UI: 31
* AI 통합: 8
* MCP 게이트웨이: 5
* 비용 추적, 예산 및 속도 제한: 5
* 성능 / 로드밸런싱 / 안정성 개선: 9
* 보안: 3
* 데이터베이스 / 프록시 운영: 2
* 문서 업데이트: 5

---

## 전체 변경 이력 {#full-changelog}
[v1.82.0-stable...v1.82.3-stable](https://github.com/BerriAI/litellm/compare/v1.82.0-stable...v1.82.3-stable)
