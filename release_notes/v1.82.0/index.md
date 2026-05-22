---
title: "v1.82.0 - Realtime 가드레일, Projects Management, 10개 이상의 성능 최적화"
slug: "v1-82-0"
date: 2026-02-28T00:00:00
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

## 이 버전 배포 {#deploy-this-version}

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
ghcr.io/berriai/litellm:main-1.82.0-stable
```

</TabItem>
<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.82.0
```

</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

- **Realtime API 가드레일** — [`/v1/realtime` WebSocket 세션에 대한 전체 가드레일 지원: 호출 전/후 적용, 음성 전사 훅, 세션 종료 정책, Vertex AI Gemini Live 지원](../../docs/proxy/guardrails) - [PR #22152](https://github.com/BerriAI/litellm/pull/22152), [PR #22153](https://github.com/BerriAI/litellm/pull/22153), [PR #22161](https://github.com/BerriAI/litellm/pull/22161), [PR #22165](https://github.com/BerriAI/litellm/pull/22165)
- **Projects Management** — [전체 CRUD, 프로젝트 범위 가상 키, 관리자 opt-in 토글을 제공하는 새로운 Projects UI로 팀과 키를 프로젝트별로 구성](../../docs/proxy/ui_store_model_db_setting) - [PR #22315](https://github.com/BerriAI/litellm/pull/22315), [PR #22360](https://github.com/BerriAI/litellm/pull/22360), [PR #22373](https://github.com/BerriAI/litellm/pull/22373), [PR #22412](https://github.com/BerriAI/litellm/pull/22412)
- **가드레일 생태계 확장** — [Noma v2, Lakera v2 호출 후 처리, 싱가포르 규제 정책(PDPA + MAS), 고용 차별 차단기, 코드 실행 차단기, 가드레일 정책 버전 관리, 프로덕션 모니터링](../../docs/proxy/guardrails) - [PR #21400](https://github.com/BerriAI/litellm/pull/21400), [PR #21783](https://github.com/BerriAI/litellm/pull/21783), [PR #21948](https://github.com/BerriAI/litellm/pull/21948)
- **OpenAI Codex 5.3 — day 0** — [OpenAI 및 Azure의 `gpt-5.3-codex` 전체 지원과 `gpt-audio-1.5`, `gpt-realtime-1.5` 모델 범위 추가](../../docs/providers/openai) - [PR #22035](https://github.com/BerriAI/litellm/pull/22035)
- **10개 이상의 성능 최적화** — Streaming hot-path 수정, Redis pipeline batching, 데이터베이스 작업 batching, ModelResponse 초기화 생략, router cache 개선으로 모든 요청의 지연 시간과 CPU 사용량 감소
- **`/v1/messages` → `/responses` 라우팅** — OpenAI/Azure 모델의 `/v1/messages` 요청은 이제 기본적으로 [Responses API](../../docs/response_api)로 라우팅됩니다.

:::danger v1/messages 라우팅 변경
이 버전부터 `/v1/messages` 요청은 기본적으로 `/responses` API로 라우팅됩니다. 이를 사용하지 않고 chat/completions를 계속 사용하려면 config에서 `LITELLM_USE_CHAT_COMPLETIONS_URL_FOR_ANTHROPIC_MESSAGES=true` 또는 `litellm_settings.use_chat_completions_url_for_anthropic_messages: true`를 설정하세요.
:::

---

## 신규 모델 / 업데이트된 모델 {#new-updated-models}

#### 신규 모델 지원(신규 모델 20개) {#new-model-support-20-new-models}

| 제공업체 | 모델 | 컨텍스트 창 | 입력($/1M 토큰) | 출력($/1M 토큰) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| OpenAI | `gpt-5.3-codex` | 272K | $1.75 | $14.00 | 추론, 코딩 |
| Azure OpenAI | `azure/gpt-5.3-codex` | 272K | $1.75 | $14.00 | Azure 배포 |
| OpenAI | `gpt-audio-1.5` | 128K | $2.50 | $10.00 | 오디오 모델 |
| Azure OpenAI | `azure/gpt-audio-1.5-2026-02-23` | 128K | $2.50 | $10.00 | 오디오 모델 |
| OpenAI | `gpt-realtime-1.5` | 32K | $4.00 | $16.00 | Realtime 모델 |
| Azure OpenAI | `azure/gpt-realtime-1.5-2026-02-23` | 32K | $4.00 | $16.00 | Realtime 모델 |
| Groq | `groq/openai/gpt-oss-safeguard-20b` | 131K | $0.075 | $0.30 | 가드레일 추론 |
| Google Vertex AI | `vertex_ai/gemini-3.1-flash-image-preview` | - | - | - | 이미지 생성 |
| Perplexity | `perplexity/perplexity/sonar` | - | - | - | Sonar 검색 |
| Perplexity | `perplexity/openai/gpt-5.1` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/openai/gpt-5-mini` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/google/gemini-2.5-flash` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/google/gemini-2.5-pro` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/google/gemini-3-flash-preview` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/google/gemini-3-pro-preview` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/anthropic/claude-haiku-4-5` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/anthropic/claude-sonnet-4-5` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/anthropic/claude-opus-4-5` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/anthropic/claude-opus-4-6` | - | - | - | 호스팅 라우팅 |
| Perplexity | `perplexity/xai/grok-4-1-fast-non-reasoning` | - | - | - | 호스팅 라우팅 |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - OpenAI 및 Azure에서 `gpt-5.3-codex` day 0 지원 - [PR #22035](https://github.com/BerriAI/litellm/pull/22035)
    - `gpt-audio-1.5` 모델 비용 맵 추가 - [PR #22303](https://github.com/BerriAI/litellm/pull/22303)
    - `gpt-realtime-1.5` 모델 비용 맵 추가 - [PR #22304](https://github.com/BerriAI/litellm/pull/22304)
    - 지원되는 OpenAI 매개변수로 `audio` 추가 - [PR #22092](https://github.com/BerriAI/litellm/pull/22092)
    - `prompt_cache_key` 및 `prompt_cache_retention` 지원 추가 - [PR #20397](https://github.com/BerriAI/litellm/pull/20397)

- **[Azure OpenAI](../../docs/providers/azure)**
    - 2026-02-25 신규 Azure OpenAI 모델 추가 - [PR #22114](https://github.com/BerriAI/litellm/pull/22114)

- **[Anthropic](../../docs/providers/anthropic)**
    - v1 Anthropic Responses API 변환 추가 - [PR #22087](https://github.com/BerriAI/litellm/pull/22087)
    - `convert_to_anthropic_tool_invoke`에서 `tool_use` ID 정리 - [PR #21964](https://github.com/BerriAI/litellm/pull/21964)
    - 모델 와일드카드 접근 문제 수정 - [PR #21917](https://github.com/BerriAI/litellm/pull/21917)

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - OpenAI 호환 Bedrock 가져온 모델의 모델 ARN 인코딩 - [PR #21701](https://github.com/BerriAI/litellm/pull/21701)
    - 역할 수임에서 선택적 리전 STS 엔드포인트 지원 - [PR #21640](https://github.com/BerriAI/litellm/pull/21640)
    - 네이티브 구조화 출력 API 지원 - [PR #21222](https://github.com/BerriAI/litellm/pull/21222)

- **[Google Vertex AI](../../docs/providers/vertex)**
    - 모델 비용 맵에 `gemini-3.1-flash-image-preview` 추가 - [PR #22223](https://github.com/BerriAI/litellm/pull/22223)
    - Vertex AI provider에 `context-1m-2025-08-07` beta header 활성화 - [PR #21867](https://github.com/BerriAI/litellm/pull/21867)

- **[OpenRouter](../../docs/providers/openrouter)**
    - 모델 비용 맵에 OpenRouter native 모델 추가 - [PR #20520](https://github.com/BerriAI/litellm/pull/20520)
    - 모델 맵에 OpenRouter Opus 4.6 추가 - [PR #20525](https://github.com/BerriAI/litellm/pull/20525)

- **[Mistral](../../docs/providers/mistral)**
    - `mistral-small-2503`의 토큰당 입력/출력 비용 조정 - [PR #22097](https://github.com/BerriAI/litellm/pull/22097)

- **[Groq](../../docs/providers/groq)**
    - `groq/openai/gpt-oss-safeguard-20b` 모델 가격 추가 - [PR #21951](https://github.com/BerriAI/litellm/pull/21951)

- **[AI/ML](../../docs/providers/aiml)**
    - AIML 모델 가격 업데이트 - [PR #22139](https://github.com/BerriAI/litellm/pull/22139)

- **[Ollama](../../docs/providers/ollama)**
    - `get_model_info`까지 `api_base` 전달 및 graceful fallback 추가 - [PR #21970](https://github.com/BerriAI/litellm/pull/21970)

- **[PublicAI](../../docs/providers/openai)**
    - PublicAI Apertus 모델의 function calling 수정 - [PR #21582](https://github.com/BerriAI/litellm/pull/21582)

- **[xAI](../../docs/providers/xai)**
    - `grok-2-vision-1212` 및 `grok-3-mini` 모델의 지원 중단 날짜 추가 - [PR #20102](https://github.com/BerriAI/litellm/pull/20102)

- **일반**
    - provider의 인증 헤더 전달 - [PR #22070](https://github.com/BerriAI/litellm/pull/22070)
    - camelCase `thinking` 매개변수 키를 snake_case로 정규화 - [PR #21762](https://github.com/BerriAI/litellm/pull/21762)
    - non-text-embedding-3 OpenAI 모델에서 `dimensions` 매개변수 passthrough 허용 - [PR #22144](https://github.com/BerriAI/litellm/pull/22144)

### 버그 수정 {#bug-fixes}

- **[AWS Bedrock](../../docs/providers/bedrock)**
    - `parallel_tool_calls`의 converse 처리 수정 - [PR #22267](https://github.com/BerriAI/litellm/pull/22267)
    - `map_openai_params`에서 `parallel_tool_calls` 매핑 복원 - [PR #22333](https://github.com/BerriAI/litellm/pull/22333)
    - Converse API batch 모델의 `modelInput` 형식 수정 - [PR #21656](https://github.com/BerriAI/litellm/pull/21656)
    - `create_file` S3 키에서 UUID가 중복되는 문제 방지 - [PR #21650](https://github.com/BerriAI/litellm/pull/21650)
    - 실제 도구와 섞인 내부 `json_tool_call` 필터링 - [PR #21107](https://github.com/BerriAI/litellm/pull/21107)
    - Bedrock rerank HTTP 클라이언트에 timeout 매개변수 전달 - [PR #22021](https://github.com/BerriAI/litellm/pull/22021)

- **[Anthropic](../../docs/providers/anthropic)**
    - anthropic fast 및 `inference_geo`의 모델 비용 맵 수정 - [PR #21904](https://github.com/BerriAI/litellm/pull/21904)

- **[Image Generation](../../docs/image_generation)**
    - upstream image generation으로 `extra_headers` 전파 - [PR #22026](https://github.com/BerriAI/litellm/pull/22026)
    - `OpenAIChatCompletionAssistantMessage`에 `ChatCompletionImageObject` 추가 - [PR #22155](https://github.com/BerriAI/litellm/pull/22155)

- **일반**
    - 서버 측에서 호출된 도구의 forwarding 보존 - [PR #22260](https://github.com/BerriAI/litellm/pull/22260)
    - UI 경로의 무료 모델 처리 수정 - [PR #22258](https://github.com/BerriAI/litellm/pull/22258)
    - 매핑 중 `None` TypeError 수정 - [PR #22080](https://github.com/BerriAI/litellm/pull/22080)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Realtime API](../../docs/response_api)**
    - `/v1/realtime` WebSocket 엔드포인트의 가드레일 지원 - [PR #22152](https://github.com/BerriAI/litellm/pull/22152)
    - 통합 `/realtime` 엔드포인트를 통한 Vertex AI Gemini Live 지원 - [PR #22153](https://github.com/BerriAI/litellm/pull/22153)
    - realtime WebSocket에서 `pre_call`/`post_call` 모드 가드레일 지원 - [PR #22161](https://github.com/BerriAI/litellm/pull/22161)
    - `end_session_after_n_fails` 및 Endpoint Settings wizard 단계 추가 - [PR #22165](https://github.com/BerriAI/litellm/pull/22165)
    - 음성 전사를 위한 가드레일 훅 추가 - [PR #21976](https://github.com/BerriAI/litellm/pull/21976)
    - Gemini/Vertex AI 및 `provider_config` realtime 세션에서 가드레일이 실행되지 않던 문제 수정 - [PR #22168](https://github.com/BerriAI/litellm/pull/22168)
    - 로깅, 비용 추적 지원 및 도구 tracing 추가 - [PR #22105](https://github.com/BerriAI/litellm/pull/22105)

- **[Video Generation](../../docs/video_generation)**
    - 비디오 콘텐츠 다운로드에 `variant` 매개변수 추가 - [PR #21955](https://github.com/BerriAI/litellm/pull/21955)
    - `litellm_params`의 `api_key`를 video remix handler로 전달 - [PR #21965](https://github.com/BerriAI/litellm/pull/21965)
    - 배포 `model_info`의 커스텀 비디오 가격 적용 - [PR #21923](https://github.com/BerriAI/litellm/pull/21923)
    - videos API에서 이미지와 매개변수 전달 수정 - [PR #22170](https://github.com/BerriAI/litellm/pull/22170)

- **[OCR](../../docs/providers/openai#ocr--document-understanding)**
    - OCR의 로컬 파일 지원 활성화 - [PR #22133](https://github.com/BerriAI/litellm/pull/22133)

- **[Websearch / 도구 호출](../../docs/completion/input)**
    - agentic loop 후속 메시지에서 thinking block 보존 - [PR #21604](https://github.com/BerriAI/litellm/pull/21604)

- **일반**
    - chunk 처리 시간의 구성 가능한 상한 추가 - [PR #22209](https://github.com/BerriAI/litellm/pull/22209)
    - streaming 요청에 `x-litellm-overhead-duration-ms` 헤더 방출 - [PR #22027](https://github.com/BerriAI/litellm/pull/22027)

#### 버그 {#bugs}

- **일반**
    - realtime websocket 호출의 mypy attr-defined 오류 수정 - [PR #22202](https://github.com/BerriAI/litellm/pull/22202)

---

## Management 엔드포인트 / UI {#management-endpoints-ui}

#### 기능 {#features-2}

- **Projects**
    - 목록 및 생성 flow가 있는 Projects 페이지 추가 - [PR #22315](https://github.com/BerriAI/litellm/pull/22315)
    - 편집 modal이 있는 Project Details 페이지 추가 - [PR #22360](https://github.com/BerriAI/litellm/pull/22360)
    - 키 생성/편집 시 프로젝트 키 테이블 및 프로젝트 dropdown 추가 - [PR #22373](https://github.com/BerriAI/litellm/pull/22373)
    - Projects 테이블에 프로젝트 삭제 action 추가 - [PR #22412](https://github.com/BerriAI/litellm/pull/22412)
    - Admin Settings에 Projects Opt-In Toggle 추가 - [PR #22416](https://github.com/BerriAI/litellm/pull/22416)
    - `/project/list` 응답에 `created_at` 및 `updated_at` 포함 - [PR #22323](https://github.com/BerriAI/litellm/pull/22323)
    - 프로젝트에 태그 추가 - [PR #22216](https://github.com/BerriAI/litellm/pull/22216)

- **가상 키 + Access Groups**
    - Access Group CRUD flow에 양방향 team/key sync 추가 - [PR #22253](https://github.com/BerriAI/litellm/pull/22253)
    - OOM 방지를 위해 `/key/aliases`에 pagination 및 search 추가 - [PR #22137](https://github.com/BerriAI/litellm/pull/22137)
    - UI에 페이지네이션된 key alias selector 추가 - [PR #22157](https://github.com/BerriAI/litellm/pull/22157)
    - key list 엔드포인트에 `project_id` 및 `access_group_id` 필터 추가 - [PR #22356](https://github.com/BerriAI/litellm/pull/22356)
    - KeyInfoHeader 컴포넌트 추가 - [PR #22047](https://github.com/BerriAI/litellm/pull/22047)
    - Edit Settings를 키 소유자로 제한 - [PR #21985](https://github.com/BerriAI/litellm/pull/21985)
    - env/UI의 가상 키 grace period 수정 - [PR #20321](https://github.com/BerriAI/litellm/pull/20321)

- **Agents**
    - agents에 가상 키 할당 - [PR #22045](https://github.com/BerriAI/litellm/pull/22045)
    - agents에 도구 할당 - [PR #22064](https://github.com/BerriAI/litellm/pull/22064)
    - 내부 사용자가 agents를 생성할 수 없도록 보장(RBAC 적용) - [PR #22329](https://github.com/BerriAI/litellm/pull/22329)

- **Proxy Auth / SSO**
    - OIDC discovery URL, roles 배열 처리, dot-notation 오류 hint 추가 - [PR #22336](https://github.com/BerriAI/litellm/pull/22336)
    - 키 rotation을 위해 system user에 PROXY_ADMIN role 추가 - [PR #21896](https://github.com/BerriAI/litellm/pull/21896)

- **사용법 / Spend 로그**
    - usage 페이지에 사용자 필터링 추가 - [PR #22059](https://github.com/BerriAI/litellm/pull/22059)
    - AI를 사용해 사용 패턴을 이해할 수 있도록 허용 - [PR #22042](https://github.com/BerriAI/litellm/pull/22042)
    - backend `request_duration_ms`를 사용하고 로그에서 Duration 정렬 가능하게 변경 - [PR #22122](https://github.com/BerriAI/litellm/pull/22122)
    - Spend 로그에 `request_duration_ms` 추가 - [PR #22066](https://github.com/BerriAI/litellm/pull/22066)
    - 실패 spend 로그에 key/team metadata 보강 - [PR #22049](https://github.com/BerriAI/litellm/pull/22049)
    - Anthropic 형식 도구의 실제 도구 이름을 로그에 표시 - [PR #22048](https://github.com/BerriAI/litellm/pull/22048)

- **모델 + Endpoints**
    - ModelHub에 proxy URL 표시 - [PR #21660](https://github.com/BerriAI/litellm/pull/21660)
    - provider 엔드포인트 지원을 위해 `/public/endpoints` 추가 - [PR #22248](https://github.com/BerriAI/litellm/pull/22248)

- **UI 개선**
    - 커스텀 favicon 지원 추가 - [PR #21653](https://github.com/BerriAI/litellm/pull/21653)
    - Navbar에 블로그 Dropdown 추가 - [PR #21859](https://github.com/BerriAI/litellm/pull/21859)
    - detailed debug mode에 대한 UI banner warning 추가 - [PR #21527](https://github.com/BerriAI/litellm/pull/21527)
    - MCP Server 생성 flow에서 auth 값을 선택 사항으로 변경 - [PR #22119](https://github.com/BerriAI/litellm/pull/22119)
    - Tool policies: 도구 자동 발견 및 policy enforcement 가드레일 - [PR #22041](https://github.com/BerriAI/litellm/pull/22041)

- **Health Checks**
    - health check max tokens 설정 추가 - [PR #22299](https://github.com/BerriAI/litellm/pull/22299)
    - `health_check_concurrency`로 동시 health check 제한 - [PR #20584](https://github.com/BerriAI/litellm/pull/20584)
    - health check `model_id` 필터링 수정 - [PR #21071](https://github.com/BerriAI/litellm/pull/21071)

#### 버그 {#bugs-1}

- `/user/info`에서 admin 사용자의 `user_id` 및 `user_info` 채우기 - [PR #22239](https://github.com/BerriAI/litellm/pull/22239)
- 필터링 시 virtual keys pagination의 stale total 수정 - [PR #22222](https://github.com/BerriAI/litellm/pull/22222)
- 기본 preset에서 Spend Update Queue aggregation이 실행되지 않는 문제 수정 - [PR #21963](https://github.com/BerriAI/litellm/pull/21963)
- timezone config 조회를 수정하고 하드코딩된 timezone map을 `ZoneInfo`로 교체 - [PR #21754](https://github.com/BerriAI/litellm/pull/21754)
- custom auth budget 문제 수정 - [PR #22164](https://github.com/BerriAI/litellm/pull/22164)
- 누락된 OAuth session state 수정 - [PR #21992](https://github.com/BerriAI/litellm/pull/21992)
- UI에서 OpenAPI Spec의 Transport Type 수정 - [PR #22005](https://github.com/BerriAI/litellm/pull/22005)
- Claude Code plugin schema 수정 - [PR #22271](https://github.com/BerriAI/litellm/pull/22271)
- `LiteLLM_ClaudeCodePluginTable`의 누락된 migration 추가 - [PR #22335](https://github.com/BerriAI/litellm/pull/22335)
- access group 생성 시 선택한 deployment에만 tag 지정 - [PR #21655](https://github.com/BerriAI/litellm/pull/21655)
- CheckBatchCost의 state management 수정 - [PR #21921](https://github.com/BerriAI/litellm/pull/21921)
- ToolPolicies에서 중복 antd import 제거 - [PR #22107](https://github.com/BerriAI/litellm/pull/22107)

---

## AI 통합 {#ai-integrations}

### Logging

- **[DataDog](../../docs/proxy/logging#datadog)**
    - DataDog에서 metric을 trace하는 기능 추가 - [PR #22103](https://github.com/BerriAI/litellm/pull/22103)
    - LiteLLM call ID와 DataDog APM span 연결 - [PR #22219](https://github.com/BerriAI/litellm/pull/22219)
    - TTS metric emission 문제 수정 - [PR #20632](https://github.com/BerriAI/litellm/pull/20632)

- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - `litellm_proxy_total_requests_metric`에 opt-in `stream` label 추가 - [PR #22023](https://github.com/BerriAI/litellm/pull/22023)
    - Prometheus metrics의 team `+Inf` budget 수정 - [PR #22243](https://github.com/BerriAI/litellm/pull/22243)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Langfuse OTEL trace 문제 수정 - [PR #21309](https://github.com/BerriAI/litellm/pull/21309)

- **[Arize Phoenix](../../docs/observability/arize_phoenix)**
    - OTEL callback과 nested trace 공존 문제 수정 - [PR #22169](https://github.com/BerriAI/litellm/pull/22169)

- **[Slack](../../docs/proxy/alerting)**
    - Slack alert type에 선택적 digest mode 추가 - [PR #21683](https://github.com/BerriAI/litellm/pull/21683)

- **일반**
    - logging에서 Gemini trace ID가 누락되는 문제 수정 - [PR #22077](https://github.com/BerriAI/litellm/pull/22077)
    - OpenAI/Azure의 `prompt_tokens_details`에서 `cache_read_input_tokens` 채우기 - [PR #22090](https://github.com/BerriAI/litellm/pull/22090)

### 가드레일 {#guardrails}

- **[Noma](../../docs/proxy/guardrails)**
    - custom guardrails framework 기반 Noma guardrails v2 - [PR #21400](https://github.com/BerriAI/litellm/pull/21400)

- **[LakeraAI](../../docs/proxy/guardrails)**
    - PII masking을 수정한 Lakera v2 post-call hook 추가 - [PR #21783](https://github.com/BerriAI/litellm/pull/21783)

- **[Presidio](../../docs/proxy/guardrails)**
    - Presidio streaming 및 오탐 수정 - [PR #21949](https://github.com/BerriAI/litellm/pull/21949)
    - Presidio streaming v3 reliability 개선 수정 - [PR #22283](https://github.com/BerriAI/litellm/pull/22283)
    - non-JSON 응답에서 Presidio crash 방지 - [PR #22084](https://github.com/BerriAI/litellm/pull/22084)

- **Built-in 가드레일**
    - agents가 코드를 실행하지 못하게 하는 코드 실행 차단 가드레일 - [PR #22154](https://github.com/BerriAI/litellm/pull/22154)
    - 5개 보호 계층에 대한 고용 차별 topic blocker - [PR #21962](https://github.com/BerriAI/litellm/pull/21962)
    - Claims agent 가드레일(5개 category + policy template) - [PR #22113](https://github.com/BerriAI/litellm/pull/22113)
    - 신규 코드 실행 평가 dataset - [PR #22065](https://github.com/BerriAI/litellm/pull/22065)
    - Tool policies: 도구 자동 발견 및 policy enforcement - [PR #22041](https://github.com/BerriAI/litellm/pull/22041)

- **Policy Templates**
    - 싱가포르 guardrail policies(PDPA + MAS AI Risk Management) - [PR #21948](https://github.com/BerriAI/litellm/pull/21948)
    - SG guardrail policy ID에 country code prefix 적용 - [PR #21974](https://github.com/BerriAI/litellm/pull/21974)
    - Guardrail policy versioning - [PR #21862](https://github.com/BerriAI/litellm/pull/21862)

- **가드레일 모니터링**
    - Guardrail Monitor — 프로덕션에서 가드레일 신뢰성 측정 - [PR #21944](https://github.com/BerriAI/litellm/pull/21944)

- **보안**
    - custom code guardrail의 unauthenticated RCE 및 sandbox escape 수정 - [PR #22095](https://github.com/BerriAI/litellm/pull/22095)

### Prompt Management {#prompt-management}

이번 릴리스에는 주요 prompt management 변경 사항이 없습니다.

### Secret Managers {#secret-managers}

이번 릴리스에는 주요 secret manager 변경 사항이 없습니다.

---

## 비용 추적, Budgets 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- Gemini/Vertex AI의 **Priority PayGo 비용 추적** - [PR #21909](https://github.com/BerriAI/litellm/pull/21909)
- 요청별 지연 시간 추적을 위해 Spend 로그에 **`request_duration_ms` 추가** - [PR #22066](https://github.com/BerriAI/litellm/pull/22066)
- `/health/backlog` 및 Prometheus에 **`in_flight_requests` metric 추가** - [PR #22319](https://github.com/BerriAI/litellm/pull/22319)
- key/team metadata로 **실패 spend 로그 보강** - [PR #22049](https://github.com/BerriAI/litellm/pull/22049)
- spend flow 디버깅을 위한 **spend tracking lifecycle logging 추가** - [PR #22029](https://github.com/BerriAI/litellm/pull/22029)
- **budget timezone config 조회 수정** 및 하드코딩된 timezone map을 `ZoneInfo`로 교체 - [PR #21754](https://github.com/BerriAI/litellm/pull/21754)
- 기본 preset에서 실행되지 않던 **Spend Update Queue aggregation 수정** - [PR #21963](https://github.com/BerriAI/litellm/pull/21963)
- `SpendUpdateQueue` aggregation에서 **호출자 소유 dict 변경 방지** - [PR #21742](https://github.com/BerriAI/litellm/pull/21742)
- 오래된 spendlog 삭제 **cron job 최적화** - [PR #21930](https://github.com/BerriAI/litellm/pull/21930)
- **Health check max tokens** 설정 - [PR #22299](https://github.com/BerriAI/litellm/pull/22299)

---

## MCP Gateway {#mcp-gateway}

- `/v1/responses` 및 `/chat/completions`의 tool fetch에 request context의 **MCP auth header 전달** - [PR #22291](https://github.com/BerriAI/litellm/pull/22291)
- MCP server 동작 일관성을 위해 **`available_on_public_internet` 기본값을 true로 설정** - [PR #22331](https://github.com/BerriAI/litellm/pull/22331)
- IP filtering / 사용 가능한 도구 없음에 대한 **명확한 오류 메시지** - [PR #22142](https://github.com/BerriAI/litellm/pull/22142)
- proxy worker 간 400 오류 방지를 위해 **stale `mcp-session-id` header 제거** - [PR #21417](https://github.com/BerriAI/litellm/pull/21417)
- passthrough token auth 사용 시 **MCP health check 건너뛰기** - [PR #21982](https://github.com/BerriAI/litellm/pull/21982)
- **누락된 OAuth session state 수정** - [PR #21992](https://github.com/BerriAI/litellm/pull/21992)
- UI에서 OpenAPI Spec의 **Transport Type 수정** - [PR #22005](https://github.com/BerriAI/litellm/pull/22005)
- stateless StreamableHTTP 동작에 대한 **e2e test 추가** - [PR #22033](https://github.com/BerriAI/litellm/pull/22033)

---

## 성능 / Loadbalancing / Reliability 개선 {#performance-loadbalancing-reliability-improvements}

**Streaming 및 hot-path**

- Streaming 지연 시간 개선 — targeted hot-path 수정 4건 - [PR #22346](https://github.com/BerriAI/litellm/pull/22346)
- `ModelResponse.__init__`에서 버려지는 `사용법()` 생성 건너뛰기 - [PR #21611](https://github.com/BerriAI/litellm/pull/21611)
- `startswith`로 `is_model_o_series_model` 최적화 - [PR #21690](https://github.com/BerriAI/litellm/pull/21690)
- 요청마다 생성하는 대신 cached `_safe_get_request_headers` 사용 - [PR #21430](https://github.com/BerriAI/litellm/pull/21430)
- streaming 요청에 `x-litellm-overhead-duration-ms` 헤더 방출 - [PR #22027](https://github.com/BerriAI/litellm/pull/22027)

**Database 및 Redis**

- `update_database()`에서 `create_task()` 호출 11개를 1개로 batching - [PR #22028](https://github.com/BerriAI/litellm/pull/22028)
- batched write를 위한 Redis pipeline spend update - [PR #22044](https://github.com/BerriAI/litellm/pull/22044)
- prisma-query-engine zombie process에서 복구 - [PR #21899](https://github.com/BerriAI/litellm/pull/21899)
- 오래된 spendlog 삭제 cron job 최적화 - [PR #21930](https://github.com/BerriAI/litellm/pull/21930)

**Router 및 caching**

- `_cached_get_model_group_info`에 cache invalidation 추가 - [PR #20376](https://github.com/BerriAI/litellm/pull/20376)
- 사용 중인 httpx client를 종료하던 cache eviction close 제거 - [PR #22247](https://github.com/BerriAI/litellm/pull/22247)
- unawaited coroutine warning 방지를 위해 `LLMClientCache._remove_key`에 background task reference 저장 - [PR #22143](https://github.com/BerriAI/litellm/pull/22143)
- queue time 계산 전에 `ensure_arrival_time`이 설정되는 문제 수정 - [PR #21918](https://github.com/BerriAI/litellm/pull/21918)

**Connection management**

- 필요할 때만 aiohttp에 `enable_cleanup_closed` 설정 - [PR #21897](https://github.com/BerriAI/litellm/pull/21897)
- gunicorn worker를 위한 Prometheus child_exit cleanup - [PR #22324](https://github.com/BerriAI/litellm/pull/22324)
- Prometheus multiprocess cleanup - [PR #22221](https://github.com/BerriAI/litellm/pull/22221)
- `health_check_concurrency`로 동시 health check 제한 - [PR #20584](https://github.com/BerriAI/litellm/pull/20584)
- model sync loop에서 `get_config` 실패 격리 - [PR #22224](https://github.com/BerriAI/litellm/pull/22224)

**기타**

- Semantic cache: 구성 가능한 vector dimension 지원 - [PR #21649](https://github.com/BerriAI/litellm/pull/21649)
- config env var의 `MAX_STRING_LENGTH_PROMPT_IN_DB` 준수 - [PR #22106](https://github.com/BerriAI/litellm/pull/22106)
- 원래 status code 및 attribute를 보존하도록 `MidStreamFallbackError` 개선 - [PR #22225](https://github.com/BerriAI/litellm/pull/22225)
- testing을 위한 network mock utility - [PR #21942](https://github.com/BerriAI/litellm/pull/21942)
- streaming_handler의 iterator protocol method에 누락된 return type annotation 추가 - [PR #21750](https://github.com/BerriAI/litellm/pull/21750)

---

## 보안 {#security}

- OS-level libs 및 NPM transitive dependency의 critical/high CVE 수정 - [PR #22008](https://github.com/BerriAI/litellm/pull/22008)
- custom code guardrail의 unauthenticated RCE 및 sandbox escape 수정 - [PR #22095](https://github.com/BerriAI/litellm/pull/22095)
- secret scanner가 감지한 하드코딩된 base64 문자열 제거 - [PR #22125](https://github.com/BerriAI/litellm/pull/22125)

---

## 문서 업데이트 {#documentation-updates}

- LiteLLM Proxy를 사용하는 OpenAI Agents SDK tutorial 추가 - [PR #21221](https://github.com/BerriAI/litellm/pull/21221)
- OpenClaw integration tutorial 추가 - [PR #21605](https://github.com/BerriAI/litellm/pull/21605)
- Google GenAI SDK tutorial(JS 및 Python) 추가 - [PR #21885](https://github.com/BerriAI/litellm/pull/21885)
- Gollem Go agent framework cookbook example 추가 - [PR #21747](https://github.com/BerriAI/litellm/pull/21747)
- Universal-3 Pro, Speech Understanding, LLM Gateway로 AssemblyAI 문서 업데이트 - [PR #21130](https://github.com/BerriAI/litellm/pull/21130)
- `store_model_in_db` release docs 추가 - [PR #21863](https://github.com/BerriAI/litellm/pull/21863)
- Credential 사용량 Tracking 문서 추가 - [PR #22112](https://github.com/BerriAI/litellm/pull/22112)
- proxy request tags 문서 추가 - [PR #22129](https://github.com/BerriAI/litellm/pull/22129)
- `/mcp` endpoint URL에 trailing slash 추가 - [PR #20509](https://github.com/BerriAI/litellm/pull/20509)
- UI contributing guide에 pre-PR checklist 추가 - [PR #21886](https://github.com/BerriAI/litellm/pull/21886)
- 문서의 Azure OpenAI key를 mock key로 교체 - [PR #21997](https://github.com/BerriAI/litellm/pull/21997)
- v1.81.14 release notes에 performance & reliability section 추가 - [PR #21950](https://github.com/BerriAI/litellm/pull/21950)
- v1.81.12-stable release notes가 stable.1을 가리키도록 업데이트 - [PR #22036](https://github.com/BerriAI/litellm/pull/22036)
- v1.81.14 release notes에 security vulnerability scan report 추가 - [PR #22385](https://github.com/BerriAI/litellm/pull/22385)

---

## 신규 기여자 {#new-contributors}

* @janfrederickk 님이 [PR #21660](https://github.com/BerriAI/litellm/pull/21660)에서 첫 기여를 했습니다.
* @hztBUAA 님이 [PR #21656](https://github.com/BerriAI/litellm/pull/21656)에서 첫 기여를 했습니다.
* @LeeJuOh 님이 [PR #21754](https://github.com/BerriAI/litellm/pull/21754)에서 첫 기여를 했습니다.
* @WhoisMonesh 님이 [PR #21750](https://github.com/BerriAI/litellm/pull/21750)에서 첫 기여를 했습니다.
* @trevorprater 님이 [PR #21747](https://github.com/BerriAI/litellm/pull/21747)에서 첫 기여를 했습니다.
* @edwiniac 님이 [PR #21870](https://github.com/BerriAI/litellm/pull/21870)에서 첫 기여를 했습니다.
* @stakeswky 님이 [PR #21867](https://github.com/BerriAI/litellm/pull/21867)에서 첫 기여를 했습니다.
* @ta-stripe 님이 [PR #21701](https://github.com/BerriAI/litellm/pull/21701)에서 첫 기여를 했습니다.
* @ron-zhong 님이 [PR #21948](https://github.com/BerriAI/litellm/pull/21948)에서 첫 기여를 했습니다.
* @Arindam200 님이 [PR #21221](https://github.com/BerriAI/litellm/pull/21221)에서 첫 기여를 했습니다.
* @Canvinus 님이 [PR #21964](https://github.com/BerriAI/litellm/pull/21964)에서 첫 기여를 했습니다.
* @nicolopignatelli 님이 [PR #21951](https://github.com/BerriAI/litellm/pull/21951)에서 첫 기여를 했습니다.
* @MarshHawk 님이 [PR #20584](https://github.com/BerriAI/litellm/pull/20584)에서 첫 기여를 했습니다.
* @gavksingh 님이 [PR #22106](https://github.com/BerriAI/litellm/pull/22106)에서 첫 기여를 했습니다.
* @roni-frantchi 님이 [PR #22090](https://github.com/BerriAI/litellm/pull/22090)에서 첫 기여를 했습니다.
* @noahnistler 님이 [PR #22133](https://github.com/BerriAI/litellm/pull/22133)에서 첫 기여를 했습니다.
* @dylan-duan-aai 님이 [PR #21130](https://github.com/BerriAI/litellm/pull/21130)에서 첫 기여를 했습니다.
* @rasmi 님이 [PR #22322](https://github.com/BerriAI/litellm/pull/22322)에서 첫 기여를 했습니다.

---

## Diff 요약 {#diff-summary}

## 02/28/2026
* 신규 모델 / 업데이트된 모델: 26
* LLM API 엔드포인트: 14
* Management Endpoints / UI: 38
* AI Integrations: 25
* 비용 추적, Budgets 및 Rate Limiting: 10
* MCP Gateway: 8
* Performance / Loadbalancing / Reliability 개선: 22
* Security: 3
* 문서 업데이트: 14

---

## 전체 변경 이력 {#full-changelog}
[v1.81.14.rc.1...v1.82.0](https://github.com/BerriAI/litellm/compare/v1.81.14.rc.1...v1.82.0)
