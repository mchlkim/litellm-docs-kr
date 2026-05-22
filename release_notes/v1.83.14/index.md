---
title: "v1.83.14 - GPT-5.5, 프롬프트 압축 및 Memory API"
slug: "v1-83-14"
date: 2026-04-27T00:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Ryan Crabbe
    title: 풀스택 엔지니어, LiteLLM
    url: https://www.linkedin.com/in/ryan-crabbe-0b9687214
    image_url: https://github.com/ryan-crabbe.png
  - name: Yuneng Jiang
    title: 시니어 풀스택 엔지니어, LiteLLM
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
  - name: Shivam Rawat
    title: Forward Deployed 엔지니어, LiteLLM
    url: https://linkedin.com/in/shivam-rawat-482937318
    image_url: https://github.com/shivamrawat1.png
hide_table_of_contents: false
---

## 이 버전 배포 {#deploy-this-version}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:main-v1.83.14-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.83.14
```

</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

- **Day-0 GPT-5.5 및 GPT-5.5 Pro 지원** — OpenAI와 Azure 변형은 전체 가격 맵, 날짜가 지정된 스냅샷, Pro 티어용 Responses 모드 라우팅을 함께 제공합니다.
- **서버 측 Prompt Compression** — 클라이언트의 별도 선택 없이, 업스트림 모델에 도달하기 전에 긴 컨텍스트 입력(Claude Code, RAG, 문서 워크로드)을 투명하게 압축하는 일급 프록시 콜백입니다.
- **`/v1/memory` CRUD 엔드포인트** — 프록시가 이제 새 에이전트 루프에서 사용하는 Prisma 기반 메타데이터 포함 메모리 저장소 API를 노출합니다.
- **LLM-as-a-Judge 가드레일** — 구성 가능한 루브릭으로 모델이 사후 호출을 평가하는 가드레일이 Bedrock / Lakera / Presidio / Noma 계열에 추가되었습니다.
- **MCP OAuth 강화** — discoverable + BYOK authorize/token 엔드포인트가 강화되었고, 임시 OAuth 세션은 Redis를 통해 프록시 인스턴스 간에 공유되며, 서버별 접근 정책이 프록시와 브로커 전반에 일관되게 적용됩니다.
- **멤버별 팀 예산이 프로덕션에 도입** — 개별 멤버 예산, Teams UI의 멤버별 주기 표시, 사용자/조직 지출 검사용 원자적 카운터 정렬이 포함됩니다.
- **Adaptive routing** — 기존 와일드카드 폴백 위에서 최근 지연 시간/오류 이력에 따라 배포 가중치를 조정하는 선택형 라우터 정책입니다.

---

## 신규 모델 / 업데이트된 모델 {#new--updated-models}

#### 신규 모델 지원(신규 모델 22개) {#new-model-support-22-new-models}

| 제공자     | 모델                                                                                  | 컨텍스트 창 | 입력($/1M tokens) | 출력($/1M tokens) | 모드             |
| ------------ | -------------------------------------------------------------------------------------- | -------------- | ------------------- | -------------------- | ---------------- |
| OpenAI       | `gpt-5.5`, `gpt-5.5-2026-04-23`                                                        | 1,050,000      | $5.00               | $30.00               | chat             |
| OpenAI       | `gpt-5.5-pro`, `gpt-5.5-pro-2026-04-23`                                                | 1,050,000      | $60.00              | $360.00              | responses        |
| OpenAI       | `gpt-5.4-mini-2026-03-17`                                                              | 272,000        | $0.75               | $4.50                | chat             |
| OpenAI       | `gpt-5.4-nano-2026-03-17`                                                              | 272,000        | $0.20               | $1.25                | chat             |
| Azure OpenAI | `azure/gpt-5.5`, `azure/gpt-5.5-2026-04-23`                                            | 1,050,000      | $5.00               | $30.00               | chat             |
| Azure OpenAI | `azure/gpt-5.5-pro`, `azure/gpt-5.5-pro-2026-04-23`                                    | 1,050,000      | $60.00              | $360.00              | responses        |
| Azure OpenAI | `azure/gpt-5.4-mini-2026-03-17`                                                        | 1,050,000      | $0.75               | $4.50                | chat             |
| Azure OpenAI | `azure/gpt-5.4-nano-2026-03-17`                                                        | 1,050,000      | $0.20               | $1.25                | chat             |
| AWS Bedrock  | `anthropic.claude-mythos-preview`                                                      | 1,000,000      | -                   | -                    | chat             |
| AWS Bedrock  | `bedrock/us-east-1/zai.glm-5`, `bedrock/us-west-2/zai.glm-5`                           | 200,000        | $1.00               | $3.20                | chat             |
| AWS Bedrock  | `bedrock/us-east-1/minimax.minimax-m2.5`, `bedrock/us-west-2/minimax.minimax-m2.5`     | -              | -                   | -                    | chat             |
| Moonshot     | `moonshot/kimi-k2.6`                                                                   | 262,144        | $0.95               | $4.00                | chat             |
| OpenRouter   | `openrouter/anthropic/claude-opus-4.7`                                                 | 1,000,000      | $5.00               | $25.00               | chat             |
| Gemini       | `gemini/gemini-embedding-2`, `gemini-embedding-2`, `vertex_ai/gemini-embedding-2`      | 8,192          | $0.20               | -                    | embedding        |
| DashScope    | `dashscope/qwen-image-2.0`, `dashscope/qwen-image-2.0-pro`                             | -              | -                   | -                    | image_generation |

#### 기능 {#features}

- **[Bedrock](../../docs/providers/bedrock)**
    - 리전별 별칭과 함께 GLM-5 및 Minimax M2.5 항목 추가 - [PR #24423](https://github.com/BerriAI/litellm/pull/24423)
    - `bedrock-mantle` 엔드포인트를 통한 Claude Mythos Preview Day-0 지원 - [PR #26196](https://github.com/BerriAI/litellm/pull/26196)
    - Bedrock Invoke 본문 필드를 허용 목록화하고 모든 `anthropic-beta` 값을 필터링 - [PR #26148](https://github.com/BerriAI/litellm/pull/26148)
- **[OpenAI](../../docs/providers/openai)**
    - 버전이 지정된 GPT-5.4 mini / nano 스냅샷 - [PR #26115](https://github.com/BerriAI/litellm/pull/26115)
    - 모델 비용 맵에 `gpt-5.5` 및 `gpt-5.5-pro` 추가 - [PR #26345](https://github.com/BerriAI/litellm/pull/26345), [PR #26348](https://github.com/BerriAI/litellm/pull/26348)
    - GPT-5.5 및 GPT-5.5 Pro Day-0 지원 - [PR #26449](https://github.com/BerriAI/litellm/pull/26449)
- **[Azure OpenAI](../../docs/providers/azure)**
    - 날짜가 지정된 변형과 함께 `azure/gpt-5.5` + `azure/gpt-5.5-pro` 항목 추가 - [PR #26361](https://github.com/BerriAI/litellm/pull/26361)
- **[Gemini](../../docs/providers/gemini)**
    - Gemini Embedding 2 GA: 비용 맵, 블로그, 테스트 - [PR #26391](https://github.com/BerriAI/litellm/pull/26391)
    - 모든 Gemini 모델로 `VideoMetadata` 지원 확대 - [PR #25767](https://github.com/BerriAI/litellm/pull/25767)
- **[Vertex AI](../../docs/providers/vertex)**
    - 멀티 리전 Vertex 호스트(`aiplatform.*.rep.googleapis.com`) - [PR #26281](https://github.com/BerriAI/litellm/pull/26281)
- **[DashScope](../../docs/providers/dashscope)**
    - `qwen-image-2.0` 및 `qwen-image-2.0-pro` 이미지 생성 지원 - [PR #25672](https://github.com/BerriAI/litellm/pull/25672)
- **[Moonshot](../../docs/providers/moonshot)**
    - 모델 레지스트리에 `moonshot/kimi-k2.6` 추가 - [PR #26203](https://github.com/BerriAI/litellm/pull/26203)
- **[Anthropic](../../docs/providers/anthropic)**
    - 지원 종료된 `claude-3-haiku-20240307` 참조를 `claude-haiku-4-5-20251001`로 마이그레이션 - [PR #26139](https://github.com/BerriAI/litellm/pull/26139)
- **일반**
    - 38개 모델을 기존 `max_tokens`에서 `max_input_tokens` / `max_output_tokens`로 마이그레이션 - [PR #24422](https://github.com/BerriAI/litellm/pull/24422)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - 어댑터 스트리밍에서 `tool_use` 입력 인자 보존 - [PR #24355](https://github.com/BerriAI/litellm/pull/24355)
    - 스트리밍 `tool_use` id에서 Gemini thought 접미사 제거 - [PR #25935](https://github.com/BerriAI/litellm/pull/25935)
    - file-id 검색 헬퍼에서 OpenAI가 아닌 파일 콘텐츠 블록 건너뛰기 - [PR #26228](https://github.com/BerriAI/litellm/pull/26228)
    - messages API에서 `tool_choice` 타입 `'none'` 처리 - [PR #24457](https://github.com/BerriAI/litellm/pull/24457)
- **[Azure](../../docs/providers/azure)**
    - `include_usage`가 포함된 스트리밍에서 `role='assistant'` 보존 - [PR #24354](https://github.com/BerriAI/litellm/pull/24354)
- **[Bedrock](../../docs/providers/bedrock)**
    - 텍스트가 `toolUse`보다 앞서도록 assistant 콘텐츠 블록 정렬 - [PR #24368](https://github.com/BerriAI/litellm/pull/24368)
    - Claude Sonnet/Opus 4.6의 200k 초과 토큰 가격 수정 및 Sonnet 4.6 `max_input_tokens`를 1M으로 설정 - [PR #24164](https://github.com/BerriAI/litellm/pull/24164)
- **[Gemini](../../docs/providers/gemini)**
    - embedding 요청에서 파라미터 필터링 - [PR #24370](https://github.com/BerriAI/litellm/pull/24370)
    - 하드코딩 대신 `model_info`에서 웹 검색 비용 읽기 - [PR #24372](https://github.com/BerriAI/litellm/pull/24372)
    - 비용 계산에 DOCUMENT 모달리티 토큰 포함 - [PR #24410](https://github.com/BerriAI/litellm/pull/24410)
- **[Vertex AI](../../docs/providers/vertex)**
    - `multimodalembedding` 요청에서 `dimensions` 파라미터 전달 - [PR #24415](https://github.com/BerriAI/litellm/pull/24415)
- **[Zhipu / GLM](../../docs/providers/zhipu)**
    - 비표준 `finish_reason` 값 매핑 - [PR #24373](https://github.com/BerriAI/litellm/pull/24373)
- **[OVHcloud](../../docs/providers/ovhcloud)**
    - tool calling이 동작하지 않는 문제 수정 - [PR #25948](https://github.com/BerriAI/litellm/pull/25948)
- **[Scaleway](../../docs/providers/scaleway)**
    - 오디오 지원 추가 - [PR #26110](https://github.com/BerriAI/litellm/pull/26110)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### Features

- **[Responses API](../../docs/response_api)**
    - Responses API와 Chat Completions 브리지 간 공유 형식 매핑 추출 - [PR #24417](https://github.com/BerriAI/litellm/pull/24417)
    - 사용자 지정 `api_base`가 있는 `openai/` 모델용 `use_chat_completions_api` 플래그 - [PR #25346](https://github.com/BerriAI/litellm/pull/25346)
    - `route_all_chat_openai_to_responses` 전역 플래그 - [PR #25359](https://github.com/BerriAI/litellm/pull/25359)
    - 모든 제공자에서 `custom_tool_call` 네임스페이스 제거 - [PR #26221](https://github.com/BerriAI/litellm/pull/26221)
- **[Anthropic Messages API](../../docs/anthropic_unified)**
    - 네이티브 `/v1/messages`용 `reasoning_auto_summary`를 `thinking.display`로 매핑 - [PR #25883](https://github.com/BerriAI/litellm/pull/25883)
    - graceful degradation으로 reasoning effort 정규화 - [PR #26111](https://github.com/BerriAI/litellm/pull/26111)
- **Memory API**
    - `/v1/memory` CRUD 엔드포인트 추가 - [PR #26218](https://github.com/BerriAI/litellm/pull/26218)
    - Memory 개선 v2 - [PR #26541](https://github.com/BerriAI/litellm/pull/26541)
- **일반**
    - Responses API에 GPT-5 temperature 검증 적용 - [PR #24371](https://github.com/BerriAI/litellm/pull/24371)

#### 버그 {#bugs}

- **[Responses API](../../docs/response_api)**
    - 브리지된 객체 필드 정규화 - [PR #26327](https://github.com/BerriAI/litellm/pull/26327)
- **[Anthropic Messages API](../../docs/anthropic_unified)**
    - `/v1/messages` 로깅에서 `anthropic_messages` 호출 타입 보존 - [PR #26248](https://github.com/BerriAI/litellm/pull/26248)
- **[Image API](../../docs/image_generation)**
    - `image_edit`의 Vertex AI 자격 증명 검증을 위해 `litellm_params`를 `validate_environment`로 전달 - [PR #26160](https://github.com/BerriAI/litellm/pull/26160)
    - 이미지 편집 엔드포인트에서 multipart 전용 파일 입력 강제 - [PR #26293](https://github.com/BerriAI/litellm/pull/26293)
    - 이미지 URL 가져오기를 검증된 HTTP 클라이언트와 정렬(Bedrock + 토큰 카운터 경로) - [PR #26272](https://github.com/BerriAI/litellm/pull/26272)
- **[Vector Stores](../../docs/vector_stores)**
    - 팀 범위 배포가 있는 vector store 엔드포인트에서 BYOK 키 주입 복원 - [PR #25746](https://github.com/BerriAI/litellm/pull/25746)
    - 관리형 vector store 엔드포인트에서 객체 수준 권한 준수 - [PR #26351](https://github.com/BerriAI/litellm/pull/26351)
- **Memory API**
    - `/v1/memory`의 Prisma 쓰기 전에 메타데이터를 JSON화 - [PR #26536](https://github.com/BerriAI/litellm/pull/26536)
- **일반**
    - pass-through 대상 URL 구성 강화 - [PR #26467](https://github.com/BerriAI/litellm/pull/26467)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### Features

- **가상 키 / Auth**
    - `POST /model/update` 후 라우터 새로고침 - [PR #26427](https://github.com/BerriAI/litellm/pull/26427)
    - 이동 시 SSO 팀 멤버를 조직에 자동 추가(프록시 관리자 전용) - [PR #26377](https://github.com/BerriAI/litellm/pull/26377)
    - `x-litellm-team-id`를 사용하는 관리자에게 팀 TPM/RPM + attribution 적용 - [PR #26438](https://github.com/BerriAI/litellm/pull/26438)
    - JWT에 `team_id`가 없을 때 단일 팀 DB 폴백 - [PR #26418](https://github.com/BerriAI/litellm/pull/26418)
- **UI**
    - 팀 정보 페이지에 "My User" 탭 추가 - [PR #26520](https://github.com/BerriAI/litellm/pull/26520)
    - Users 탭에 Send Invitation Email 토글 추가 - [PR #25808](https://github.com/BerriAI/litellm/pull/25808)
    - 조직 관리자의 `/key/generate`를 비활성화하는 UI 설정 - [PR #26442](https://github.com/BerriAI/litellm/pull/26442)
    - Spend 로그에서 정렬 가능한 Model 및 TTFT 컬럼 - [PR #26488](https://github.com/BerriAI/litellm/pull/26488)
    - Teams › Members 탭에 멤버별 예산 주기 표시 - [PR #26207](https://github.com/BerriAI/litellm/pull/26207)
- **리팩터링**
    - 프로젝트 관리를 enterprise 패키지로 이동 - [PR #25677](https://github.com/BerriAI/litellm/pull/25677)

#### Bugs

- **가상 키 / Auth**
    - 권한 우회를 막기 위해 `common_checks` 중앙화 - [PR #26279](https://github.com/BerriAI/litellm/pull/26279)
    - key route 필드의 호출자 권한 검사 강화 - [PR #26492](https://github.com/BerriAI/litellm/pull/26492)
    - 호출자 권한 검사를 service-account까지 확장하고 raw-body 허용 범위 강화 - [PR #26493](https://github.com/BerriAI/litellm/pull/26493)
    - `/key/regenerate`에서 `upperbound_key_generate_params` 강제 - [PR #26340](https://github.com/BerriAI/litellm/pull/26340)
    - `/key/update`의 메타데이터에서 `service_account_id` 보존 - [PR #26004](https://github.com/BerriAI/litellm/pull/26004)
    - `/global/spend/*` 라우트를 관리자 역할로 제한 - [PR #26490](https://github.com/BerriAI/litellm/pull/26490)
    - `/team/new` 및 `/team/update`의 팀 메타데이터 처리 강화 - [PR #26464](https://github.com/BerriAI/litellm/pull/26464)
    - 요청 본문 파라미터 제한을 클라우드 제공자 인증 필드까지 확장 - [PR #26264](https://github.com/BerriAI/litellm/pull/26264)
    - 제공자 URL 파라미터의 형식 제약 강제 - [PR #26287](https://github.com/BerriAI/litellm/pull/26287)
    - RAG ingestion 구성을 저장된 자격 증명 값에 바인딩 - [PR #26512](https://github.com/BerriAI/litellm/pull/26512)
    - RAG ingestion 자격 증명 정리를 AWS 엔드포인트/식별자 필드까지 확대 - [PR #26525](https://github.com/BerriAI/litellm/pull/26525)
    - 복수형 자격 증명 필드 이름에 대한 `/model/info` redaction 강화 - [PR #26513](https://github.com/BerriAI/litellm/pull/26513)
- **UI**
    - 모델 편집 시 $0 비용 주입 중단 - [PR #26001](https://github.com/BerriAI/litellm/pull/26001)

---

## AI 통합 {#ai-integrations}

### Logging

- **General**
    - `StandardLoggingPayload` 및 OTel span에 `litellm_call_id` 추가 - [PR #26133](https://github.com/BerriAI/litellm/pull/26133)
- **[Vertex AI Passthrough](../../docs/pass_through/vertex_ai)**
    - `:embedContent` 및 `:batchEmbedContents` 응답 로깅 - [PR #26146](https://github.com/BerriAI/litellm/pull/26146)

### 가드레일

- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock_guardrails)**
    - 모델 응답 스캔 시 `apply_guardrail`에 Bedrock OUTPUT 소스 사용 - [PR #26144](https://github.com/BerriAI/litellm/pull/26144)
    - `post_call`만 구성된 경우 사후 호출 로그 항목 중복 제거 - [PR #26474](https://github.com/BerriAI/litellm/pull/26474)
    - 지출 로그용 Hook mode + match redaction + 스트리밍 `request_data` - [PR #25854](https://github.com/BerriAI/litellm/pull/25854), [PR #26266](https://github.com/BerriAI/litellm/pull/26266)
- **LLM-as-a-Judge**
    - LLM-as-a-Judge 가드레일 제공 - [PR #26360](https://github.com/BerriAI/litellm/pull/26360)
- **일반**
    - 팀 수준 가드레일과 전역 정책 가드레일을 함께 실행 가능 - [PR #26466](https://github.com/BerriAI/litellm/pull/26466)
    - 목록 및 제출 엔드포인트의 가드레일 파라미터 처리 - [PR #26390](https://github.com/BerriAI/litellm/pull/26390)
    - 스트리밍 사후 호출에서 `guardrail_information` 로깅 - [PR #26448](https://github.com/BerriAI/litellm/pull/26448)
    - 사후 호출 가드레일이 차단할 때 지연된 성공 로그 억제 - [PR #26528](https://github.com/BerriAI/litellm/pull/26528)

---

## 비용 추적, Budgets 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Per-member budgets**
    - Individual team-member budgets - [PR #26208](https://github.com/BerriAI/litellm/pull/26208)
    - Track per-member total spend on team memberships - [PR #26195](https://github.com/BerriAI/litellm/pull/26195)
    - Fix per-team member budget bypass - [PR #26204](https://github.com/BerriAI/litellm/pull/26204)
- **Rate limiting**
    - Reseed enforcement read path from DB on counter miss - [PR #26459](https://github.com/BerriAI/litellm/pull/26459)
- **Budgets**
    - Align user and org budget spend checks with the atomic counter pattern - [PR #26182](https://github.com/BerriAI/litellm/pull/26182)
    - Reset budget windows failing due to Prisma `Json?` null filter - [PR #26346](https://github.com/BerriAI/litellm/pull/26346)

---

## MCP Gateway

- **OAuth**
    - Harden OAuth `authorize`/`token` endpoints (BYOK + discoverable) - [PR #26274](https://github.com/BerriAI/litellm/pull/26274)
    - Share temporary MCP OAuth sessions across instances via Redis - [PR #26162](https://github.com/BerriAI/litellm/pull/26162), [PR #26318](https://github.com/BerriAI/litellm/pull/26318)
    - Align MCP OAuth proxy endpoints with per-server access policy - [PR #26516](https://github.com/BerriAI/litellm/pull/26516)
    - MCP broker OAuth endpoint access controls - [PR #26142](https://github.com/BerriAI/litellm/pull/26142)
- **권한 / routing**
    - Resolve team/key MCP permissions by name or alias - [PR #26338](https://github.com/BerriAI/litellm/pull/26338)
    - Split MCP routes into inference vs. management (unblocks 관리자 UI on `DISABLE_LLM_API_ENDPOINTS` nodes) - [PR #26367](https://github.com/BerriAI/litellm/pull/26367)
- **Tool filtering**
    - Match tools with client-side namespace prefix in `mcp_semantic_tool_filter` - [PR #26117](https://github.com/BerriAI/litellm/pull/26117)

---

## Performance / Loadbalancing / Reliability 개선 {#performance-loadbalancing-reliability-improvements}

- **Routing**
    - Adaptive routing - [PR #26049](https://github.com/BerriAI/litellm/pull/26049)
    - Wildcard order fallback to higher-order deployments - [PR #25772](https://github.com/BerriAI/litellm/pull/25772)
- **Prompt Compression**
    - First-class server-side prompt compression callback - [PR #25729](https://github.com/BerriAI/litellm/pull/25729)
- **Reliability**
    - Fix `/health/readiness` 503 loop when DB is unreachable - [PR #26134](https://github.com/BerriAI/litellm/pull/26134)
- **개발자 ergonomics**
    - `--reload` flag for uvicorn hot reload (dev only) - [PR #25901](https://github.com/BerriAI/litellm/pull/25901)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

- **Build / Docker**
    - Streamline `Dockerfile.non_root` build time - [PR #26055](https://github.com/BerriAI/litellm/pull/26055)
    - Use numeric UID 65534 in `docker.non_root` for K8s `runAsNonRoot` - [PR #26268](https://github.com/BerriAI/litellm/pull/26268)
    - Restore pre-uv Prisma cache path - [PR #26201](https://github.com/BerriAI/litellm/pull/26201)
- **Migrations**
    - Opt-in v2 migration resolver - [PR #26194](https://github.com/BerriAI/litellm/pull/26194)
    - Freshness and destructive guards on migration workflow - [PR #26185](https://github.com/BerriAI/litellm/pull/26185)
- **CI / Infra**
    - Migrate more CI jobs from CircleCI to GitHub Actions - [PR #26261](https://github.com/BerriAI/litellm/pull/26261)
    - CCI: cache, cleanup, anchors, install-path parity, Python 3.12, Ruby/Node pins - [PR #26286](https://github.com/BerriAI/litellm/pull/26286)
    - CircleCI config cleanup and consolidation - [PR #26226](https://github.com/BerriAI/litellm/pull/26226)
    - Speed up proxy unit tests and split `proxy-utils` into its own matrix entry - [PR #26150](https://github.com/BerriAI/litellm/pull/26150)
    - Remove CCI/GHA test duplication and semantically shard proxy DB tests - [PR #26356](https://github.com/BerriAI/litellm/pull/26356)
    - Standalone `create-release-branch` workflow + `contents:write` permission - [PR #26342](https://github.com/BerriAI/litellm/pull/26342), [PR #26359](https://github.com/BerriAI/litellm/pull/26359)
    - Supply-chain guard to block fork PRs that modify dependencies - [PR #26511](https://github.com/BerriAI/litellm/pull/26511)
    - Use Postgres sidecar instead of shared DB for `auth_ui_unit_tests` - [PR #26141](https://github.com/BerriAI/litellm/pull/26141)
    - Fix `e2e_ui_testing` stale-bundle issue on Ubuntu (`cp -r` merge semantics) - [PR #26047](https://github.com/BerriAI/litellm/pull/26047)
    - Apply black formatting to fix CI lint failures - [PR #26140](https://github.com/BerriAI/litellm/pull/26140)
- **Test stability**
    - Stabilize spend-accuracy tests + patch Redis buffer data-loss path - [PR #26270](https://github.com/BerriAI/litellm/pull/26270)
    - Stabilize spend-accuracy test transport flakes - [PR #26290](https://github.com/BerriAI/litellm/pull/26290)
    - Deflake spend-tracking tests - [PR #26349](https://github.com/BerriAI/litellm/pull/26349)
    - Drain logging worker in `test_router_caching_ttl` to fix flakiness - [PR #26355](https://github.com/BerriAI/litellm/pull/26355)
    - Isolate `master_key`/`prisma_client` module globals between proxy tests - [PR #26362](https://github.com/BerriAI/litellm/pull/26362)
- **Packaging / dependencies 관리**
    - Bump vulnerable dependencies - [PR #26365](https://github.com/BerriAI/litellm/pull/26365)
    - Declare MIT license in `litellm-proxy-extras` metadata - [PR #26369](https://github.com/BerriAI/litellm/pull/26369)
    - Declare proprietary license in `litellm-enterprise` metadata - [PR #26457](https://github.com/BerriAI/litellm/pull/26457)
- **UI**
    - Fetch button ignores active filters on Request 로그 page - [PR #25788](https://github.com/BerriAI/litellm/pull/25788)
    - Stale filters applied after sort/page/time change on Request 로그 - [PR #25789](https://github.com/BerriAI/litellm/pull/25789)
- **Misc**
    - Replace substring check with `startswith` in `is_model_gpt_5_model` - [PR #25793](https://github.com/BerriAI/litellm/pull/25793)

---

## 문서 업데이트 {#documentation-updates}

- Add missing observability integrations to View All page - [PR #24420](https://github.com/BerriAI/litellm/pull/24420)
- Clarify `x-litellm-model-group` vs. provider model id in proxy docs - [PR #25497](https://github.com/BerriAI/litellm/pull/25497)
- Gemini 3 thinking_level defaults and release note - [PR #25842](https://github.com/BerriAI/litellm/pull/25842)
- Align fenced code block padding on blog and doc pages - [PR #25932](https://github.com/BerriAI/litellm/pull/25932)
- Add supported providers to prompt caching doc - [PR #26124](https://github.com/BerriAI/litellm/pull/26124)
- Remove `docs/my-website`, point contributors to `BerriAI/litellm-docs` - [PR #26454](https://github.com/BerriAI/litellm/pull/26454)

---

## New Contributors

- @dongyu-turo made their first contribution in [#24164](https://github.com/BerriAI/litellm/pull/24164)
- @Alpha-Zark made their first contribution in [#25672](https://github.com/BerriAI/litellm/pull/25672)
- @vinhphamhuu-ct made their first contribution in [#25767](https://github.com/BerriAI/litellm/pull/25767)
- @Bytechoreographer made their first contribution in [#25788](https://github.com/BerriAI/litellm/pull/25788)
- @BraulioV made their first contribution in [#25793](https://github.com/BerriAI/litellm/pull/25793)
- @Vigilans made their first contribution in [#25883](https://github.com/BerriAI/litellm/pull/25883)
- @nhyy244 made their first contribution in [#26110](https://github.com/BerriAI/litellm/pull/26110)
- @sakenuGOD made their first contribution in [#26117](https://github.com/BerriAI/litellm/pull/26117)
- @Michael-RZ-Berri made their first contribution in [#26124](https://github.com/BerriAI/litellm/pull/26124)
- @anmolg1997 made their first contribution in [#26228](https://github.com/BerriAI/litellm/pull/26228)

**Full 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.83.10-stable...v1.83.14-stable

---

## 04/27/2026

* New 모델 / Updated 모델: 29
* LLM API Endpoints: 18
* Management Endpoints / UI: 23
* AI Integrations (Logging / 가드레일): 11
* 비용 추적, Budgets and Rate Limiting: 6
* MCP Gateway: 8
* Performance / Loadbalancing / Reliability improvements: 5
* General Proxy Improvements: 27
* Documentation Updates: 6
