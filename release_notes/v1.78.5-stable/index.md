---
title: "v1.78.5-stable - 네이티브 OCR 지원"
slug: "v1-78-5"
date: 2025-10-18T10:00:00
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
docker.litellm.ai/berriai/litellm:v1.78.5-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.78.5
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **네이티브 OCR 엔드포인트** - Mistral OCR 및 Azure AI OCR 비용 추적과 함께 네이티브 `/v1/ocr` 엔드포인트 지원
- **전역 벤더 할인** - 정확한 비용 추적 및 리포팅을 위해 전역 벤더 할인율 지정 가능
- **팀 지출 리포트** - 이제 팀 관리자가 팀의 상세 지출 리포트를 내보낼 수 있음
- **Claude Haiku 4.5** - 200K 컨텍스트 창과 함께 Bedrock, Vertex AI, OpenRouter에서 Claude Haiku 4.5 Day 0 지원
- **GPT-5-Codex** - OpenAI 및 Azure에서 Responses API를 통한 GPT-5-Codex 지원
- **성능 개선** - 주요 라우터 최적화: O(1) 모델 조회, 10-100배 더 빠른 shallow copy, 30-40% 더 빠른 타이밍 호출, O(n)에서 O(1)로 개선된 해시 생성

---

## 신규/업데이트 모델 {#new-모델--updated-모델}

#### 신규 모델 지원 {#new-model-support}

| 제공자 | 모델 | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Anthropic | `claude-haiku-4-5` | 200K | $1.00 | $5.00 | 채팅, 추론, 비전, 함수 호출, `prompt caching`, `computer use` |
| Anthropic | `claude-haiku-4-5-20251001` | 200K | $1.00 | $5.00 | 채팅, 추론, 비전, 함수 호출, `prompt caching`, `computer use` |
| Bedrock | `anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.00 | $5.00 | 채팅, 추론, 비전, 함수 호출, prompt caching |
| Bedrock | `global.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.00 | $5.00 | 채팅, 추론, 비전, 함수 호출, prompt caching |
| Bedrock | `jp.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.10 | $5.50 | 채팅, 추론, 비전, 함수 호출, prompt caching (JP Cross-Region) |
| Bedrock | `us.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.10 | $5.50 | 채팅, 추론, 비전, 함수 호출, prompt caching (US region) |
| Bedrock | `eu.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.10 | $5.50 | 채팅, 추론, 비전, 함수 호출, prompt caching (EU region) |
| Bedrock | `apac.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.10 | $5.50 | 채팅, 추론, 비전, 함수 호출, prompt caching (APAC region) |
| Bedrock | `au.anthropic.claude-haiku-4-5-20251001-v1:0` | 200K | $1.10 | $5.50 | 채팅, 추론, 비전, 함수 호출, prompt caching (AU region) |
| Vertex AI | `vertex_ai/claude-haiku-4-5@20251001` | 200K | $1.00 | $5.00 | 채팅, 추론, 비전, 함수 호출, prompt caching |
| OpenAI | `gpt-5` | 272K | $1.25 | $10.00 | 채팅, Responses API, 추론, 비전, 함수 호출, prompt caching |
| OpenAI | `gpt-5-codex` | 272K | $1.25 | $10.00 | Responses API mode 지원 |
| Azure | `azure/gpt-5-codex` | 272K | $1.25 | $10.00 | Responses API mode 지원 |
| Gemini | `gemini-2.5-flash-image` | 32K | $0.30 | $2.50 | 이미지 생성(GA - Nano Banana) - $0.039/image |
| ZhipuAI | `glm-4.6` | - | - | - | Chat completions |

#### 기능 {#features}

- **[OpenAI](../../docs/providers/openai)**
    - GPT-5가 `/chat/completions`를 통해 reasoning content를 반환하고 GPT-5-Codex가 Claude Code에서 동작하도록 지원 - [PR #15441](https://github.com/BerriAI/litellm/pull/15441)

- **[Anthropic](../../docs/providers/anthropic)**
    - `claude-4-sonnet`의 `max_output_tokens`를 64k로 축소 - [PR #15409](https://github.com/BerriAI/litellm/pull/15409)
    - `claude-haiku-4.5` 추가 - [PR #15579](https://github.com/BerriAI/litellm/pull/15579)
    - Anthropic `v1/messages` API에서 thinking block 및 redacted thinking block 지원 추가 - [PR #15501](https://github.com/BerriAI/litellm/pull/15501)

- **[Bedrock](../../docs/providers/bedrock)**
    - Bedrock 및 VertexAI에 `anthropic.claude-haiku-4-5-20251001-v1:0` 추가 - [PR #15581](https://github.com/BerriAI/litellm/pull/15581)
    - Bedrock global 및 US 리전에 Claude Haiku 4.5 지원 추가 - [PR #15650](https://github.com/BerriAI/litellm/pull/15650)
    - Bedrock 기타 리전에 Claude Haiku 4.5 지원 추가 - [PR #15653](https://github.com/BerriAI/litellm/pull/15653)
    - JP Cross-Region Inference `jp.anthropic.claude-haiku-4-5-20251001` 추가 - [PR #15598](https://github.com/BerriAI/litellm/pull/15598)
    - 수정: `bedrock-pricing-geo-inregion-cross-region` / Global Cross-Region Inference 추가 - [PR #15685](https://github.com/BerriAI/litellm/pull/15685)
    - 수정: AWS GovCloud Bedrock 모델의 `us-gov` prefix 지원 - [PR #15626](https://github.com/BerriAI/litellm/pull/15626)
    - 수정: Bedrock의 GPT-OSS가 이제 streaming을 지원하므로 fake streaming 되돌림 - [PR #15668](https://github.com/BerriAI/litellm/pull/15668)

- **[Gemini](../../docs/providers/gemini)**
    - 기능(pricing): GA 상태의 Gemini 2.5 Flash Image (Nano Banana) 추가 - [PR #15557](https://github.com/BerriAI/litellm/pull/15557)
    - 수정: Gemini 2.5 Flash Image에는 `supports_web_search=true`가 없어야 함 - [PR #15642](https://github.com/BerriAI/litellm/pull/15642)
    - Gemini preview 모델의 지원 파라미터에서 penalty params 제거 - [PR #15503](https://github.com/BerriAI/litellm/pull/15503)

- **[Ollama](../../docs/providers/ollama)**
    - 수정(ollama/chat): 요청에서 `reasoning_effort`를 `think`로 올바르게 매핑 - [PR #15465](https://github.com/BerriAI/litellm/pull/15465)

- **[OpenRouter](../../docs/providers/openrouter)**
    - OpenRouter cost map에 `anthropic/claude-sonnet-4.5` 추가 - [PR #15472](https://github.com/BerriAI/litellm/pull/15472)
    - OpenRouter에서 Anthropic 모델의 prompt caching 지원 - [PR #15535](https://github.com/BerriAI/litellm/pull/15535)
    - OpenRouter에서 completion cost를 직접 가져오도록 변경 - [PR #15448](https://github.com/BerriAI/litellm/pull/15448)
    - OpenRouter Claude Opus 4 모델 이름 수정 - [PR #15495](https://github.com/BerriAI/litellm/pull/15495)

- **[CometAPI](../../docs/providers/comet)**
    - 수정(cometapi): CometAPI provider 지원 개선(embeddings, image generation, docs) - [PR #15591](https://github.com/BerriAI/litellm/pull/15591)

- **[Lemonade](../../docs/providers/lemonade)**
    - Lemonade provider에 신규 모델 추가 - [PR #15554](https://github.com/BerriAI/litellm/pull/15554)

- **[Watson X](../../docs/providers/watsonx)**
    - 수정(pricing): 여러 모델의 watsonx 모델 패밀리 pricing 수정 - [PR #15670](https://github.com/BerriAI/litellm/pull/15670)

- **[Vercel AI Gateway](../../docs/providers/vercel_ai_gateway)**
    - pricing 구성에 `glm-4.6` 모델 추가 - [PR #15679](https://github.com/BerriAI/litellm/pull/15679)

- **[Vertex AI](../../docs/providers/vertex)**
    - Vertex AI Discovery Engine Rerank 지원 추가 - [PR #15532](https://github.com/BerriAI/litellm/pull/15532)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
    - 수정: US 리전의 Claude Sonnet 4.5 pricing이 10배 높게 설정된 문제 수정 - [PR #15374](https://github.com/BerriAI/litellm/pull/15374)

- **[OpenRouter](../../docs/providers/openrouter)**
    - `model_price` json의 `gpt-5-codex` 지원 변경 - [PR #15540](https://github.com/BerriAI/litellm/pull/15540)

- **[Bedrock](../../docs/providers/bedrock)**
    - signature 계산을 위한 header filtering 수정 - [PR #15590](https://github.com/BerriAI/litellm/pull/15590)

- **General**
    - `gpt-5-codex`에 native reasoning 및 streaming 지원 flag 추가 - [PR #15569](https://github.com/BerriAI/litellm/pull/15569)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[Responses API](../../docs/response_api)**
    - Responses API - openai ruby sdk의 Responses API streaming에서 anthropic/gemini 모델 호출 활성화 + DB - 시작 전 pending migration sanity check - [PR #15432](https://github.com/BerriAI/litellm/pull/15432)
    - health check에 responses mode 지원 추가 - [PR #15658](https://github.com/BerriAI/litellm/pull/15658)

- **[OCR API](../../docs/ocr)**
    - 기능: 네이티브 `litellm.ocr()` 함수 추가 - [PR #15567](https://github.com/BerriAI/litellm/pull/15567)
    - 기능: LiteLLM AI Gateway에 `/ocr` route 추가 - 네이티브 Mistral OCR 호출 지원 추가 - [PR #15571](https://github.com/BerriAI/litellm/pull/15571)
    - 기능: Azure AI Mistral OCR 통합 추가 - [PR #15572](https://github.com/BerriAI/litellm/pull/15572)
    - 기능: 네이티브 `/ocr` 엔드포인트 지원 - [PR #15573](https://github.com/BerriAI/litellm/pull/15573)
    - 기능: `/ocr` 엔드포인트 비용 추적 추가 - [PR #15678](https://github.com/BerriAI/litellm/pull/15678)

- **[/generateContent](../../docs/providers/gemini)**
    - 수정: GEMINI - CLI - `llm_api_routes`에 `google_routes` 추가 - [PR #15500](https://github.com/BerriAI/litellm/pull/15500)
    - Google GenAI responses의 `citationMetadata.citationSources`에 대한 Pydantic validation error 수정 - [PR #15592](https://github.com/BerriAI/litellm/pull/15592)

- **[Images API](../../docs/image_generation)**
    - 수정: Image Edits API의 Dall-e-2 처리 - [PR #15604](https://github.com/BerriAI/litellm/pull/15604)

- **[Bedrock Passthrough](../../docs/pass_through/bedrock)**
    - 기능: AI Gateway와 `config.yaml`의 모델을 통해 `/invoke`, `/converse` route 호출 허용 - [PR #15618](https://github.com/BerriAI/litellm/pull/15618)

#### 버그 {#bugs}

- **General**
    - 수정: object를 올바른 type으로 변환 - [PR #15634](https://github.com/BerriAI/litellm/pull/15634)
    - 버그 수정: metadata dict인 tag가 예외를 발생시키던 문제 수정 - [PR #15625](https://github.com/BerriAI/litellm/pull/15625)
    - `function_to_dict`에 type hint를 추가하고 오타 수정 - [PR #15580](https://github.com/BerriAI/litellm/pull/15580)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **가상 키**
    - 문서: Key Rotations - [PR #15455](https://github.com/BerriAI/litellm/pull/15455)
    - 수정: UI - Key Max Budget 제거 오류 수정 - [PR #15672](https://github.com/BerriAI/litellm/pull/15672)
    - `litellm_Key` Settings Max Budget 제거 오류 수정 - [PR #15669](https://github.com/BerriAI/litellm/pull/15669)

- **Teams**
    - 기능: Team Admin이 팀 지출 리포트를 내보낼 수 있도록 허용 - [PR #15542](https://github.com/BerriAI/litellm/pull/15542)

- **Passthrough**
    - 기능: Passthrough - admin이 특정 passthrough endpoint에 대한 access를 부여할 수 있도록 허용 - [PR #15401](https://github.com/BerriAI/litellm/pull/15401)

- **SCIM v2**
    - 기능(scim_v2.py): `group.id`가 없으면 external id 사용 + Passthrough - update 및 delete가 instance 간에 유지되도록 보장 - [PR #15276](https://github.com/BerriAI/litellm/pull/15276)

- **SSO**
    - 기능: UI SSO - OKTA SSO용 PKCE 추가 - [PR #15608](https://github.com/BerriAI/litellm/pull/15608)
    - 수정: OAuth M2M 인증을 UI SSO와 분리 + Oauth2 Introspection endpoint 처리 - [PR #15667](https://github.com/BerriAI/litellm/pull/15667)
    - 수정: entraid app roles jwt claim 정리 - [PR #15583](https://github.com/BerriAI/litellm/pull/15583)

---

## 로깅 / Guardrail / Prompt Management 통합 {#logging--guardrail--prompt-management-integrations}

#### 가드레일 {#가드레일}

- **General**
    - `apply_guardrail` endpoint가 `ApplyGuardrailResponse` 대신 raw string을 반환하던 문제 수정 - [PR #15436](https://github.com/BerriAI/litellm/pull/15436)
    - 수정: database update 후 guardrail memory sync 보장 - [PR #15633](https://github.com/BerriAI/litellm/pull/15633)
    - 기능: image generation용 guardrail 추가 - [PR #15619](https://github.com/BerriAI/litellm/pull/15619)
    - 기능: `/v1/messages` 및 `/v1/responses` API용 가드레일 추가 - [PR #15686](https://github.com/BerriAI/litellm/pull/15686)

- **[Pillar Security](../../docs/proxy/guardrails)**
    - 기능: litellm proxy에서 no persistence mode를 지원하도록 Pillar Security 통합 업데이트 - [PR #15599](https://github.com/BerriAI/litellm/pull/15599)

#### Prompt Management {#prompt-management}

- **General**
    - `custom_prompt_management.md` code snippet 소규모 수정 - [PR #15544](https://github.com/BerriAI/litellm/pull/15544)

---

## 비용 추적, budget 및 rate limiting {#cost-tracking-budgets-and-rate-limiting}

- **비용 추적**
    - 기능: 비용 추적 - 비용에 적용할 전역 vendor discount 지정 - [PR #15546](https://github.com/BerriAI/litellm/pull/15546)
    - 기능: UI - UI에서 Provider Discounts 설정 허용 - [PR #15550](https://github.com/BerriAI/litellm/pull/15550)

- **예산**
    - 수정: budget 명확성 개선 - [PR #15682](https://github.com/BerriAI/litellm/pull/15682)

---

## 성능 / load balancing / reliability 개선 {#performance-loadbalancing-reliability-improvements}

- **라우터 최적화**
    - 성능(router): model alias에 deepcopy 대신 shallow copy 사용 - 중첩 dict 구조에서 deepcopy보다 10-100배 빠름 - [PR #15576](https://github.com/BerriAI/litellm/pull/15576)
    - 성능(router): hash generation의 string concatenation 최적화 - 시간 복잡도를 O(n²)에서 O(n)으로 개선 - [PR #15575](https://github.com/BerriAI/litellm/pull/15575)
    - 성능(router): O(1) data structure로 model lookup 최적화 - O(n) scan을 index map lookup으로 대체 - [PR #15578](https://github.com/BerriAI/litellm/pull/15578)
    - 성능(router): O(1) index map으로 model lookup 최적화 - 즉시 lookup을 위해 `model_id_to_deployment_index_map` 및 `model_name_to_deployment_indices` 사용 - [PR #15574](https://github.com/BerriAI/litellm/pull/15574)
    - 성능(router): completion hot path의 timing function 최적화 - duration 측정에는 `time.perf_counter()`를, timeout 계산에는 `time.monotonic()`을 사용해 timing call을 30-40% 더 빠르게 처리 - [PR #15617](https://github.com/BerriAI/litellm/pull/15617)

- **SSL/TLS 성능**
    - 기능(ssl): TLS 성능을 위한 configurable ECDH curve 추가 - 성능 개선을 위해 OpenSSL 3.x에서 PQC를 비활성화하도록 `ssl_ecdh_curve` setting으로 구성 가능 - [PR #15617](https://github.com/BerriAI/litellm/pull/15617)

- **토큰 카운터**
    - 수정(token-counter): `custom_tokenizer`를 위해 deployment에서 `model_info` 추출 - [PR #15680](https://github.com/BerriAI/litellm/pull/15680)

- **성능 metric**
    - 추가: perf summary - [PR #15458](https://github.com/BerriAI/litellm/pull/15458)

- **CI/CD**
    - 수정: CI/CD - 누락된 env key 및 linter type error 수정 - [PR #15606](https://github.com/BerriAI/litellm/pull/15606)

---

## 문서 업데이트 {#documentation-updates}

- **Provider 문서**
    - Litellm docs 10 11 2025 - [PR #15457](https://github.com/BerriAI/litellm/pull/15457)
    - 문서: ecs deployment guide 추가 - [PR #15468](https://github.com/BerriAI/litellm/pull/15468)
    - 문서: benchmark result 업데이트 - [PR #15461](https://github.com/BerriAI/litellm/pull/15461)
    - 수정: benchmark docs에 누락된 context 추가 - [PR #15688](https://github.com/BerriAI/litellm/pull/15688)

- **General**
    - 몇 가지 오타 수정 - [PR #15267](https://github.com/BerriAI/litellm/pull/15267)

---

## 신규 기여자 {#new-contributors}

* @jlan-nl 님이 [PR #15374](https://github.com/BerriAI/litellm/pull/15374)에서 첫 기여를 했습니다.
* @ImadSaddik 님이 [PR #15267](https://github.com/BerriAI/litellm/pull/15267)에서 첫 기여를 했습니다.
* @huangyafei 님이 [PR #15472](https://github.com/BerriAI/litellm/pull/15472)에서 첫 기여를 했습니다.
* @mubashir1osmani 님이 [PR #15468](https://github.com/BerriAI/litellm/pull/15468)에서 첫 기여를 했습니다.
* @kowyo 님이 [PR #15465](https://github.com/BerriAI/litellm/pull/15465)에서 첫 기여를 했습니다.
* @dhruvyad 님이 [PR #15448](https://github.com/BerriAI/litellm/pull/15448)에서 첫 기여를 했습니다.
* @davizucon 님이 [PR #15544](https://github.com/BerriAI/litellm/pull/15544)에서 첫 기여를 했습니다.
* @FelipeRodriguesGare 님이 [PR #15540](https://github.com/BerriAI/litellm/pull/15540)에서 첫 기여를 했습니다.
* @ndrsfel 님이 [PR #15557](https://github.com/BerriAI/litellm/pull/15557)에서 첫 기여를 했습니다.
* @shinharaguchi 님이 [PR #15598](https://github.com/BerriAI/litellm/pull/15598)에서 첫 기여를 했습니다.
* @TensorNull 님이 [PR #15591](https://github.com/BerriAI/litellm/pull/15591)에서 첫 기여를 했습니다.
* @TeddyAmkie 님이 [PR #15583](https://github.com/BerriAI/litellm/pull/15583)에서 첫 기여를 했습니다.
* @aniketmaurya 님이 [PR #15580](https://github.com/BerriAI/litellm/pull/15580)에서 첫 기여를 했습니다.
* @eddierichter-amd 님이 [PR #15554](https://github.com/BerriAI/litellm/pull/15554)에서 첫 기여를 했습니다.
* @konekohana 님이 [PR #15535](https://github.com/BerriAI/litellm/pull/15535)에서 첫 기여를 했습니다.
* @Classic298 님이 [PR #15495](https://github.com/BerriAI/litellm/pull/15495)에서 첫 기여를 했습니다.
* @afogel 님이 [PR #15599](https://github.com/BerriAI/litellm/pull/15599)에서 첫 기여를 했습니다.
* @orolega 님이 [PR #15633](https://github.com/BerriAI/litellm/pull/15633)에서 첫 기여를 했습니다.
* @LucasSugi 님이 [PR #15634](https://github.com/BerriAI/litellm/pull/15634)에서 첫 기여를 했습니다.
* @uc4w6c 님이 [PR #15619](https://github.com/BerriAI/litellm/pull/15619)에서 첫 기여를 했습니다.
* @Sameerlite 님이 [PR #15658](https://github.com/BerriAI/litellm/pull/15658)에서 첫 기여를 했습니다.
* @yuneng-jiang 님이 [PR #15672](https://github.com/BerriAI/litellm/pull/15672)에서 첫 기여를 했습니다.
* @Nikro 님이 [PR #15680](https://github.com/BerriAI/litellm/pull/15680)에서 첫 기여를 했습니다.

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 changelog 보기](https://github.com/BerriAI/litellm/compare/v1.78.0-stable...v1.78.4-stable)**
