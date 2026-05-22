---
title: "v1.76.1-stable - Gemini 2.5 Flash Image"
slug: "v1-76-1"
date: 2025-08-30T10:00:00
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

## 이 버전 배포하기

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.76.1
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.76.1
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **주요 성능 개선** - fastuuid 통합으로 LiteLLM Python SDK completion이 6.5배 빨라졌습니다.
- **새 모델 지원** - Gemini 2.5 Flash Image Preview, Grok Code Fast, GPT Realtime 모델
- **강화된 Provider 지원** - Fireworks AI의 DeepSeek-v3.1 가격, Vercel AI Gateway, Anthropic/GitHub Copilot 통합 개선
- **MCP 개선** - 더 나은 연결 테스트와 SSE MCP tools 버그 수정

## 주요 변경 사항
- /chat/completions에서 Gemini 2.5 Flash Image Preview 사용을 지원합니다. **🚨 경고** `gemini-2.0-flash-exp-image-generation`을 사용 중이었다면 이 마이그레이션 가이드를 따르세요.
  [Gemini Image Generation Migration Guide](../../docs/extras/gemini_img_migration)
---

## 성능 개선

이번 릴리스에는 중요한 성능 최적화가 포함되어 있습니다.

- **LiteLLM Python SDK Completion 6.5배 향상** - completion 작업의 성능이 크게 개선되었습니다. - [PR #13990](https://github.com/BerriAI/litellm/pull/13990)
- **fastuuid 통합** - UUID 생성이 2.1배 빨라지고 /chat/completions 및 기타 LLM endpoints에서 +80 RPS 개선이 있었습니다. - [PR #13992](https://github.com/BerriAI/litellm/pull/13992), [PR #14016](https://github.com/BerriAI/litellm/pull/14016)
- **Request Logging 최적화** - 기본적으로 request params를 출력하지 않아 +50 RPS 개선을 제공합니다. - [PR #14015](https://github.com/BerriAI/litellm/pull/14015)
- **Cache 성능** - InMemoryCache.evict_cache가 21%, `_is_debugging_on` 함수가 45% 빨라졌습니다. - [PR #14012](https://github.com/BerriAI/litellm/pull/14012), [PR #13988](https://github.com/BerriAI/litellm/pull/13988)

---

## 신규 모델 / 업데이트된 모델

#### 새 모델 지원

| Provider    | Model                                  | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | -------- |
| Google | `gemini-2.5-flash-image-preview` | 1M | $0.30 | $2.50 | Chat completions + 이미지 생성($0.039/image) |
| X.AI | `xai/grok-code-fast` | 256K | $0.20 | $1.50 | 코드 생성 |
| OpenAI | `gpt-realtime` | 32K | $4.00 | $16.00 | 실시간 대화 + 오디오 |
| Vercel AI Gateway | `vercel_ai_gateway/openai/o3` | 200K | $2.00 | $8.00 | 고급 reasoning |
| Vercel AI Gateway | `vercel_ai_gateway/openai/o3-mini` | 200K | $1.10 | $4.40 | 효율적인 reasoning |
| Vercel AI Gateway | `vercel_ai_gateway/openai/o4-mini` | 200K | $1.10 | $4.40 | 최신 mini 모델 |
| DeepInfra | `deepinfra/zai-org/GLM-4.5` | 131K | $0.55 | $2.00 | Chat completions |
| Perplexity | `perplexity/codellama-34b-instruct` | 16K | $0.35 | $1.40 | 코드 생성 |
| Fireworks AI | `fireworks_ai/accounts/fireworks/models/deepseek-v3p1` | 128K | $0.56 | $1.68 | Chat completions |

**추가 모델:** 여러 Vercel AI Gateway 모델도 추가되었습니다. 전체 목록은 [models.litellm.ai](https://models.litellm.ai)를 참조하세요.

#### 기능

- **[Google Gemini](../../docs/providers/gemini)**
    - 이미지 반환 기능이 있는 `gemini-2.5-flash-image-preview` 지원 추가 - [PR #13979](https://github.com/BerriAI/litellm/pull/13979), [PR #13983](https://github.com/BerriAI/litellm/pull/13983)
    - system prompt만 있는 요청 지원 - [PR #14010](https://github.com/BerriAI/litellm/pull/14010)
    - Gemini Imagen 모델의 잘못된 모델명 오류 수정 - [PR #13991](https://github.com/BerriAI/litellm/pull/13991)
- **[X.AI](../../docs/providers/xai)**
    - `xai/grok-code-fast` 모델 패밀리 지원 추가 - [PR #14054](https://github.com/BerriAI/litellm/pull/14054)
    - grok-4 모델의 frequency_penalty 파라미터 수정 - [PR #14078](https://github.com/BerriAI/litellm/pull/14078)
- **[OpenAI](../../docs/providers/openai)**
    - gpt-realtime 모델 지원 추가 - [PR #14082](https://github.com/BerriAI/litellm/pull/14082)
    - reasoning 및 reasoning_effort 파라미터 기본 지원 - [PR #12865](https://github.com/BerriAI/litellm/pull/12865)
- **[Fireworks AI](../../docs/providers/fireworks_ai)**
    - DeepSeek-v3.1 가격 추가 - [PR #13958](https://github.com/BerriAI/litellm/pull/13958)
- **[DeepInfra](../../docs/providers/deepinfra)**
    - DeepSeek-V3.1의 reasoning_effort 설정 수정 - [PR #14053](https://github.com/BerriAI/litellm/pull/14053)
- **[GitHub Copilot](../../docs/providers/github_copilot)**
    - thinking 및 reasoning_effort 파라미터 지원 추가 - [PR #13691](https://github.com/BerriAI/litellm/pull/13691)
    - 이미지 headers 지원 추가 - [PR #13955](https://github.com/BerriAI/litellm/pull/13955)
- **[Anthropic](../../docs/providers/anthropic)**
    - 사용자 지정 Anthropic 호환 API endpoints 지원 - [PR #13945](https://github.com/BerriAI/litellm/pull/13945)
    - Anthropic API에서 Bedrock API로의 /messages fallback 수정 - [PR #13946](https://github.com/BerriAI/litellm/pull/13946)
- **[Nebius](../../docs/providers/nebius)**
    - provider 모델 확장 및 model IDs 정규화 - [PR #13965](https://github.com/BerriAI/litellm/pull/13965)
- **[Vertex AI](../../docs/providers/vertex)**
    - Vertex Mistral streaming 문제 수정 - [PR #13952](https://github.com/BerriAI/litellm/pull/13952)
    - Gemini tool calls의 anyOf corner cases 수정 - [PR #12797](https://github.com/BerriAI/litellm/pull/12797)
- **[Bedrock](../../docs/providers/bedrock)**
    - structured output 문제 수정 - [PR #14005](https://github.com/BerriAI/litellm/pull/14005)
- **[OpenRouter](../../docs/providers/openrouter)**
    - GPT-5 family models 가격 추가 - [PR #13536](https://github.com/BerriAI/litellm/pull/13536)

#### 새 Provider 지원

- **[Vercel AI Gateway](../../docs/providers/vercel_ai_gateway)**
    - 새 provider 지원 추가 - [PR #13144](https://github.com/BerriAI/litellm/pull/13144)
- **[DataRobot](../../docs/providers/datarobot)**
    - provider 문서 추가 - [PR #14038](https://github.com/BerriAI/litellm/pull/14038), [PR #14074](https://github.com/BerriAI/litellm/pull/14074)

---

## LLM API Endpoints

#### 기능

- **[Images API](../../docs/image_generation)**
    - OpenAI images/edits endpoint에서 여러 이미지 지원 - [PR #13916](https://github.com/BerriAI/litellm/pull/13916)
    - 이미지 생성 요청에 동적 `api_key` 사용 허용 - [PR #14007](https://github.com/BerriAI/litellm/pull/14007)
- **[Responses API](../../docs/response_api)**
    - GitHub Copilot에서 `/responses` endpoint가 extra_headers를 무시하던 문제 수정 - [PR #13775](https://github.com/BerriAI/litellm/pull/13775)
    - 새 web_search tool 지원 추가 - [PR #14083](https://github.com/BerriAI/litellm/pull/14083)
- **[Azure Passthrough](../../docs/providers/azure/azure)**
    - streaming을 사용하는 Azure Passthrough 요청 수정 - [PR #13831](https://github.com/BerriAI/litellm/pull/13831)

#### 버그

- **General**
    - batch 요청에서 None metadata 처리 수정 - [PR #13996](https://github.com/BerriAI/litellm/pull/13996)
    - special token input을 사용하는 token_counter 수정 - [PR #13374](https://github.com/BerriAI/litellm/pull/13374)
    - azure/gpt-4.1 family에 대한 잘못된 web search 지원 제거 - [PR #13566](https://github.com/BerriAI/litellm/pull/13566)

---

## [MCP Gateway](../../docs/mcp)

#### 기능

- **SSE MCP Tools**
    - SSE MCP tools 추가 관련 버그 수정 - MCP 추가 시 연결 테스트 개선 - [PR #14048](https://github.com/BerriAI/litellm/pull/14048)

[더 읽기](../../docs/mcp)

---

## 관리 Endpoints / UI

#### 기능

- **Team Management**
    - team 생성 시 Team Member RPM/TPM 제한 설정 허용 - [PR #13943](https://github.com/BerriAI/litellm/pull/13943)
- **UI Improvements**
    - UI Dashboard의 Next.js Security Vulnerabilities 수정 - [PR #14084](https://github.com/BerriAI/litellm/pull/14084)
    - 접을 수 있는 navbar 디자인 수정 - [PR #14075](https://github.com/BerriAI/litellm/pull/14075)

#### 버그

- **인증**
    - llm_api type의 Virtual keys가 /anthropic/* 및 기타 LLM passthrough routes에서 Internal Server Error를 일으키던 문제 수정 - [PR #14046](https://github.com/BerriAI/litellm/pull/14046)

---

## Logging / Guardrail 통합

#### 기능

- **[Langfuse OTEL](../../docs/proxy/logging#langfuse)**
    - host 구성에 LANGFUSE_OTEL_HOST 사용 허용 - [PR #14013](https://github.com/BerriAI/litellm/pull/14013)
- **[Braintrust](../../docs/proxy/logging#braintrust)**
    - span name metadata 기능 추가 - [PR #13573](https://github.com/BerriAI/litellm/pull/13573)
    - `braintrust_logging` 모듈에서 이동된 attributes를 참조하도록 tests 수정 - [PR #13978](https://github.com/BerriAI/litellm/pull/13978)
- **[OpenMeter](../../docs/proxy/logging#openmeter)**
    - OpenMeter 통합에서 token user_id로 user 설정 - [PR #13152](https://github.com/BerriAI/litellm/pull/13152)

#### 새 Guardrail 지원

- **[Noma Security](../../docs/proxy/guardrails)**
    - Noma Security guardrail 지원 추가 - [PR #13572](https://github.com/BerriAI/litellm/pull/13572)
- **[Pangea](../../docs/proxy/guardrails)**
    - 새 AIDR endpoint를 지원하도록 Pangea Guardrail 업데이트 - [PR #13160](https://github.com/BerriAI/litellm/pull/13160)

---

## 성능 / Loadbalancing / Reliability 개선

#### 기능

- **캐싱**
    - client에 제공하기 전에 cache entry 만료 여부 확인 - [PR #13933](https://github.com/BerriAI/litellm/pull/13933)
    - Redis에 latency를 timedelta로 저장할 때 발생하던 오류 수정 - [PR #14040](https://github.com/BerriAI/litellm/pull/14040)
- **Router**
    - simple_shuffle에서 한 번의 loop로 'weight', 'rpm', 'tpm' 기준 weights를 선택하도록 router 리팩터링 - [PR #13562](https://github.com/BerriAI/litellm/pull/13562)
- **Logging**
    - CancelledError warnings를 방지하도록 LoggingWorker graceful shutdown 수정 - [PR #14050](https://github.com/BerriAI/litellm/pull/14050)
    - containers에서 일반 format과 json format 모두로 파일 logging하도록 개선 - [PR #13394](https://github.com/BerriAI/litellm/pull/13394)

#### 버그

- **Dependencies**
    - `orjson` version을 "3.11.2"로 상향 - [PR #13969](https://github.com/BerriAI/litellm/pull/13969)

---

## 일반 Proxy 개선

#### 기능

- **AWS**
    - session token을 사용하는 AWS assume_role 지원 추가 - [PR #13919](https://github.com/BerriAI/litellm/pull/13919)
- **OCI Provider**
    - optional_parameter로 oci_key_file 추가 - [PR #14036](https://github.com/BerriAI/litellm/pull/14036)
- **설정**
    - spend log의 request entry가 잘리기 전에 threshold를 설정할 수 있도록 configuration 허용 - [PR #14042](https://github.com/BerriAI/litellm/pull/14042)
    - proxy_config configuration 개선: Helm charts의 기존 configmap 지원 추가 - [PR #14041](https://github.com/BerriAI/litellm/pull/14041)
- **Docker**
    - non-root image에 supervisor 다시 추가 - [PR #13922](https://github.com/BerriAI/litellm/pull/13922)


---

## 신규 기여자
* @ArthurRenault 님이 [PR #13922](https://github.com/BerriAI/litellm/pull/13922)에서 첫 기여를 했습니다.
* @stevenmanton 님이 [PR #13919](https://github.com/BerriAI/litellm/pull/13919)에서 첫 기여를 했습니다.
* @uc4w6c 님이 [PR #13914](https://github.com/BerriAI/litellm/pull/13914)에서 첫 기여를 했습니다.
* @nielsbosma 님이 [PR #13573](https://github.com/BerriAI/litellm/pull/13573)에서 첫 기여를 했습니다.
* @Yuki-Imajuku 님이 [PR #13567](https://github.com/BerriAI/litellm/pull/13567)에서 첫 기여를 했습니다.
* @codeflash-ai[bot] 님이 [PR #13988](https://github.com/BerriAI/litellm/pull/13988)에서 첫 기여를 했습니다.
* @ColeFrench 님이 [PR #13978](https://github.com/BerriAI/litellm/pull/13978)에서 첫 기여를 했습니다.
* @dttran-glo 님이 [PR #13969](https://github.com/BerriAI/litellm/pull/13969)에서 첫 기여를 했습니다.
* @manascb1344 님이 [PR #13965](https://github.com/BerriAI/litellm/pull/13965)에서 첫 기여를 했습니다.
* @DorZion 님이 [PR #13572](https://github.com/BerriAI/litellm/pull/13572)에서 첫 기여를 했습니다.
* @edwardsamuel 님이 [PR #13536](https://github.com/BerriAI/litellm/pull/13536)에서 첫 기여를 했습니다.
* @blahgeek 님이 [PR #13374](https://github.com/BerriAI/litellm/pull/13374)에서 첫 기여를 했습니다.
* @Deviad 님이 [PR #13394](https://github.com/BerriAI/litellm/pull/13394)에서 첫 기여를 했습니다.
* @XSAM 님이 [PR #13775](https://github.com/BerriAI/litellm/pull/13775)에서 첫 기여를 했습니다.
* @KRRT7 님이 [PR #14012](https://github.com/BerriAI/litellm/pull/14012)에서 첫 기여를 했습니다.
* @ikaadil 님이 [PR #13991](https://github.com/BerriAI/litellm/pull/13991)에서 첫 기여를 했습니다.
* @timelfrink 님이 [PR #13691](https://github.com/BerriAI/litellm/pull/13691)에서 첫 기여를 했습니다.
* @qidu 님이 [PR #13562](https://github.com/BerriAI/litellm/pull/13562)에서 첫 기여를 했습니다.
* @nagyv 님이 [PR #13243](https://github.com/BerriAI/litellm/pull/13243)에서 첫 기여를 했습니다.
* @xywei 님이 [PR #12885](https://github.com/BerriAI/litellm/pull/12885)에서 첫 기여를 했습니다.
* @ericgtkb 님이 [PR #12797](https://github.com/BerriAI/litellm/pull/12797)에서 첫 기여를 했습니다.
* @NoWall57 님이 [PR #13945](https://github.com/BerriAI/litellm/pull/13945)에서 첫 기여를 했습니다.
* @lmwang9527 님이 [PR #14050](https://github.com/BerriAI/litellm/pull/14050)에서 첫 기여를 했습니다.
* @WilsonSunBritten 님이 [PR #14042](https://github.com/BerriAI/litellm/pull/14042)에서 첫 기여를 했습니다.
* @Const-antine 님이 [PR #14041](https://github.com/BerriAI/litellm/pull/14041)에서 첫 기여를 했습니다.
* @dmvieira 님이 [PR #14040](https://github.com/BerriAI/litellm/pull/14040)에서 첫 기여를 했습니다.
* @gotsysdba 님이 [PR #14036](https://github.com/BerriAI/litellm/pull/14036)에서 첫 기여를 했습니다.
* @moshemorad 님이 [PR #14005](https://github.com/BerriAI/litellm/pull/14005)에서 첫 기여를 했습니다.
* @joshualipman123 님이 [PR #13144](https://github.com/BerriAI/litellm/pull/13144)에서 첫 기여를 했습니다.

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.76.0-nightly...v1.76.1)**
