---
title: "v1.77.3-stable - 우선순위 기반 속도 제한"
slug: "v1-77-3"
date: 2025-09-21T10:00:00
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

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.77.3-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.77.3
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **+550 RPS 성능 개선** - 요청 처리와 객체 초기화를 최적화했습니다.
- **우선순위 할당량 예약** - Proxy 관리자가 이제 특정 키에 TPM/RPM 용량을 예약할 수 있습니다.

## 우선순위 할당량 예약

이번 릴리스에는 우선순위 할당량 예약 지원이 추가되었습니다. 이를 통해 Proxy 관리자는 사용 사례별로 모델 용량의 특정 비율을 예약할 수 있습니다. 
 
실시간 사용 사례는 항상 우선 응답을 받아야 하고 백그라운드 개발 작업은 더 오래 걸려도 되는 환경에 유용합니다. 

<Image img={require('../../img/release_notes/quota.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스에는 우선순위 할당량 예약 지원이 추가되었습니다. **Proxy Admins**는 metadata 우선순위 수준을 기준으로 키에 TPM/RPM 용량을 예약할 수 있으며, 이를 통해 개발 트래픽 규모와 관계없이 중요한 프로덕션 워크로드가 보장된 접근 권한을 받을 수 있습니다.

[여기](../../docs/proxy/dynamic_rate_limit#priority-quota-reservation)에서 시작하세요.

## +550 RPS 성능 개선

<Image img={require('../../img/release_notes/perf_imp.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 선별된 최적화를 통해 RPS를 크게 개선합니다. 
 
잦은 캐시 미스를 유발하던 캐시 타입 불일치를 수정해 +500 RPS 향상을 달성했고, hot path에서 불필요한 coroutine 검사를 제거해 추가로 +50 RPS를 개선했습니다. 


## New 모델 / Updated 모델

#### 신규 모델 지원

| Provider | Model | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| SambaNova | `sambanova/deepseek-v3.1` | 128K | $0.90 | $0.90 | Chat completions |
| SambaNova | `sambanova/gpt-oss-120b` | 128K | $0.72 | $0.72 | Chat completions |
| OVHCloud | 다양한 모델 | 모델별 상이 | 공급자 문의 | 공급자 문의 | Chat completions |
| CompactifAI | 다양한 모델 | 모델별 상이 | 공급자 문의 | 공급자 문의 | Chat completions |
| TwelveLabs | `twelvelabs/marengo-embed-2.7` | 32K | $0.12 | $0.00 | Embeddings |

#### 기능

- **[OVHCloud AI Endpoints](../../docs/providers/ovhcloud)**
    - 포괄적인 모델 카탈로그를 포함한 신규 공급자 지원 - [PR #14494](https://github.com/BerriAI/litellm/pull/14494)
- **[CompactifAI](../../docs/providers/compactifai)**
    - 신규 공급자 통합 - [PR #14532](https://github.com/BerriAI/litellm/pull/14532)
- **[SambaNova](../../docs/providers/sambanova)**
    - DeepSeek v3.1 및 GPT-OSS-120B 모델 추가 - [PR #14500](https://github.com/BerriAI/litellm/pull/14500)
- **[Bedrock](../../docs/providers/bedrock)**
    - 교차 리전 inference profile 비용 계산 - [PR #14566](https://github.com/BerriAI/litellm/pull/14566)
    - 인증을 위한 AWS external ID 파라미터 지원 - [PR #14582](https://github.com/BerriAI/litellm/pull/14582)
    - CountTokens API 구현 - [PR #14557](https://github.com/BerriAI/litellm/pull/14557)
    - Titan V2 encoding_format 파라미터 지원 - [PR #14687](https://github.com/BerriAI/litellm/pull/14687)
    - Nova Canvas 이미지 생성 inference profile - [PR #14578](https://github.com/BerriAI/litellm/pull/14578)
    - Bedrock Batches API - 파일 업로드와 요청 변환을 포함한 배치 처리 지원 - [PR #14618](https://github.com/BerriAI/litellm/pull/14618)
    - Bedrock Twelve Labs embedding 공급자 지원 - [PR #14697](https://github.com/BerriAI/litellm/pull/14697)
- **[Vertex AI](../../docs/providers/vertex)**
    - Gemini labels 필드에 공급자 인식 필터링 적용 - [PR #14563](https://github.com/BerriAI/litellm/pull/14563)
    - Gemini Batch API 지원 - [PR #14733](https://github.com/BerriAI/litellm/pull/14733)
- **[Volcengine](../../docs/providers/volcengine)**
    - 비활성화된 경우 thinking 파라미터 수정 - [PR #14569](https://github.com/BerriAI/litellm/pull/14569)
- **[Cohere](../../docs/providers/cohere)**
    - Generate API 지원 중단을 처리하고 기본값을 chat endpoints로 설정 - [PR #14676](https://github.com/BerriAI/litellm/pull/14676)
- **[TwelveLabs](../../docs/providers/twelvelabs)**
    - Marengo Embed 2.7 embedding 지원 추가 - [PR #14674](https://github.com/BerriAI/litellm/pull/14674)

### 버그 수정

- **[Bedrock](../../docs/providers/bedrock)**
    - tool call invocation에서 빈 arguments 처리 - [PR #14583](https://github.com/BerriAI/litellm/pull/14583)
- **[Vertex AI](../../docs/providers/vertex)**
    - Gemini/Vertex에서 non-pickleable 객체로 인한 deepcopy 충돌 방지 - [PR #14418](https://github.com/BerriAI/litellm/pull/14418)
- **[XAI](../../docs/providers/xai)**
    - grok-code 모델의 지원되지 않는 stop 파라미터 수정 - [PR #14565](https://github.com/BerriAI/litellm/pull/14565)
- **[Gemini](../../docs/providers/gemini)**
    - Gemini API 오류 메시지 업데이트 - [PR #14589](https://github.com/BerriAI/litellm/pull/14589)
    - 2.5 Flash Image Preview 모델 라우팅 수정 - [PR #14715](https://github.com/BerriAI/litellm/pull/14715)
    - 토큰 계산 endpoints에 API key 전달 - [PR #14744](https://github.com/BerriAI/litellm/pull/14744)

#### 신규 공급자 지원

- **[OVHCloud AI Endpoints](../../docs/providers/ovhcloud)**
    - 모델 카탈로그와 인증을 포함한 완전한 공급자 통합 - [PR #14494](https://github.com/BerriAI/litellm/pull/14494)
- **[CompactifAI](../../docs/providers/compactifai)**
    - 문서를 포함한 신규 공급자 지원 - [PR #14532](https://github.com/BerriAI/litellm/pull/14532)

---

## LLM API Endpoints

#### 기능

- **[/responses](../../docs/response_api)**
    - non-admin 사용자를 위한 cancel endpoint 지원 추가 - [PR #14594](https://github.com/BerriAI/litellm/pull/14594)
    - response session 처리와 s3 기반 cold storage 구성을 개선 - [PR #14534](https://github.com/BerriAI/litellm/pull/14534)
    - OpenAI 및 Azure /responses/cancel endpoint 지원 추가 - [PR #14561](https://github.com/BerriAI/litellm/pull/14561)
- **General**
    - 세부 정보가 포함된 rate limit 오류 메시지 개선 - [PR #14736](https://github.com/BerriAI/litellm/pull/14736)
    - spend log payload에 middle-truncation 적용 - [PR #14637](https://github.com/BerriAI/litellm/pull/14637)

#### 버그

- **[/chat/completions](../../docs/completion/input)**
    - completion chat ID 처리 수정 - [PR #14548](https://github.com/BerriAI/litellm/pull/14548)
    - _get_tags_from_request_kwargs의 AttributeError 방지 - [PR #14735](https://github.com/BerriAI/litellm/pull/14735)
- **[/responses](../../docs/response_api)**
    - 비용 계산 수정 - [PR #14675](https://github.com/BerriAI/litellm/pull/14675)
- **General**
    - rate limiter AttributeError 수정 - [PR #14609](https://github.com/BerriAI/litellm/pull/14609)

---

## 비용 추적, Budgets 및 Rate Limiting

- **Responses API Cost Calculation** 수정 - [PR #14675](https://github.com/BerriAI/litellm/pull/14675)
- **Anthropic Cache Token Pricing** - 1시간과 5분 cache creation 비용 분리 - [PR #14620](https://github.com/BerriAI/litellm/pull/14620), [PR #14652](https://github.com/BerriAI/litellm/pull/14652)
- **Indochina Time Timezone** - budget reset 지원 - [PR #14666](https://github.com/BerriAI/litellm/pull/14666)
- **Soft Budget Alert Cache Issues** - soft budget alert cache 문제 해결 - [PR #14491](https://github.com/BerriAI/litellm/pull/14491)
- **Dynamic Rate Limiter v3** - 우선순위 라우팅 개선 - [PR #14734](https://github.com/BerriAI/litellm/pull/14734)
- **Enhanced Rate Limit Errors** - 더 자세한 오류 메시지 제공 - [PR #14736](https://github.com/BerriAI/litellm/pull/14736)

---

## 관리 엔드포인트 / UI

#### 기능

- **Team Member Service Account Keys** - 팀원이 직접 생성한 키를 볼 수 있도록 허용 - [PR #14619](https://github.com/BerriAI/litellm/pull/14619)
- **Default Budget for JWT Teams** - 생성된 팀에 budget 자동 할당 - [PR #14514](https://github.com/BerriAI/litellm/pull/14514)
- **SSO Access Control Groups** - token info endpoint 통합 개선 - [PR #14738](https://github.com/BerriAI/litellm/pull/14738)
- **Health Test Connect Protection** - 모델 생성 권한을 기준으로 접근 제한 - [PR #14650](https://github.com/BerriAI/litellm/pull/14650)
- **Amazon Bedrock Guardrail Info View** - 로깅 시각화 개선 - [PR #14696](https://github.com/BerriAI/litellm/pull/14696)

#### 버그 수정

- **SCIM v2** - 존재하지 않는 멤버에 대한 group PUSH 및 PUT 작업 수정 - [PR #14581](https://github.com/BerriAI/litellm/pull/14581)
- **Guardrail View/Edit/Delete** 동작 수정 - [PR #14622](https://github.com/BerriAI/litellm/pull/14622)
- **In-Memory Guardrail** 업데이트 실패 수정 - [PR #14653](https://github.com/BerriAI/litellm/pull/14653)

---

## Logging / Guardrail 통합

#### 기능

- **[DataDog](../../docs/proxy/logging#datadog)**
    - spend tracking metrics 개선 - [PR #14555](https://github.com/BerriAI/litellm/pull/14555)
    - is_streamed_request 파라미터를 통한 stream 지원 - [PR #14673](https://github.com/BerriAI/litellm/pull/14673)
    - tool calls metadata 전달 수정 - [PR #14531](https://github.com/BerriAI/litellm/pull/14531)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - Responses API 로깅 지원 추가 - [PR #14597](https://github.com/BerriAI/litellm/pull/14597)
- **[Langsmith](../../docs/proxy/logging#langsmith)**
    - Langsmith Sampling Rate - 키/팀 수준 tracing 구성 - [PR #14740](https://github.com/BerriAI/litellm/pull/14740)
- **[Prometheus](../../docs/proxy/logging#prometheus)**
    - multi-worker 지원 개선 - [PR #14530](https://github.com/BerriAI/litellm/pull/14530)
    - 모니터링에 사용자 이메일 labels 추가 - [PR #14520](https://github.com/BerriAI/litellm/pull/14520)
- **[Opik](../../docs/proxy/logging#opik)**
    - timezone 문제 수정 - [PR #14708](https://github.com/BerriAI/litellm/pull/14708)

### 버그 수정

- **[S3](../../docs/proxy/logging#s3-buckets)**
    - s3_endpoint_url 사용 시 발생하는 404 오류 수정 - [PR #14559](https://github.com/BerriAI/litellm/pull/14559)

#### 가드레일

- **Tool Permission Guardrail** - 세분화된 도구 접근 제어 - [PR #14519](https://github.com/BerriAI/litellm/pull/14519)
- **Bedrock 가드레일** - runtime endpoint 구성을 통한 선택적 보호 지원 - [PR #14575](https://github.com/BerriAI/litellm/pull/14575), [PR #14650](https://github.com/BerriAI/litellm/pull/14650)
- **Default Last Message** - guardrails에서 기본 마지막 메시지 지원 - [PR #14640](https://github.com/BerriAI/litellm/pull/14640)
- **AWS exceptions handling despite 200 response** - 200 응답이어도 AWS 예외 처리 - [PR #14658](https://github.com/BerriAI/litellm/pull/14658)
#### 신규 통합

- **[PostHog](../../docs/observability/posthog)** - LiteLLM 사용량 추적과 분석을 위한 완전한 observability 통합 - [PR #14610](https://github.com/BerriAI/litellm/pull/14610)

---


## MCP Gateway

- **MCP Server Alias Parsing** - 여러 부분으로 구성된 URL 경로 지원 - [PR #14558](https://github.com/BerriAI/litellm/pull/14558)
- **MCP Filter Recomputation** - 서버 삭제 후 재계산 - [PR #14542](https://github.com/BerriAI/litellm/pull/14542)
- **MCP Gateway Tools List** 개선 - [PR #14695](https://github.com/BerriAI/litellm/pull/14695)

---

## 성능 / Loadbalancing / Reliability 개선

- `user` 필드 전송 시 **+500 RPS 성능 향상** - [PR #14616](https://github.com/BerriAI/litellm/pull/14616)
- hot path에서 iscoroutine을 제거해 **+50 RPS** 개선 - [PR #14649](https://github.com/BerriAI/litellm/pull/14649)
- __init__ 오버헤드 **7% 감소** - [PR #14689](https://github.com/BerriAI/litellm/pull/14689)
- 더 나은 리소스 관리를 위한 **Generic Object Pool** 구현 - [PR #14702](https://github.com/BerriAI/litellm/pull/14702)

---

## 일반 Proxy 개선

- spend log payload에 **Middle-Truncation** 적용 - [PR #14637](https://github.com/BerriAI/litellm/pull/14637)

#### Security

- **보안 업데이트** - aiohttp==3.12.14로 상향하고 CVE-2025-53643 수정 - [PR #14638](https://github.com/BerriAI/litellm/pull/14638)

---

## 신규 기여자

* @luisfucros가 [PR #14500](https://github.com/BerriAI/litellm/pull/14500)에서 첫 기여를 했습니다.
* @hanakannzashi가 [PR #14548](https://github.com/BerriAI/litellm/pull/14548)에서 첫 기여를 했습니다.
* @eliasto가 [PR #14494](https://github.com/BerriAI/litellm/pull/14494)에서 첫 기여를 했습니다.
* @Rasmusafj가 [PR #14491](https://github.com/BerriAI/litellm/pull/14491)에서 첫 기여를 했습니다.
* @LingXuanYin이 [PR #14569](https://github.com/BerriAI/litellm/pull/14569)에서 첫 기여를 했습니다.
* @ronaldpereira가 [PR #14613](https://github.com/BerriAI/litellm/pull/14613)에서 첫 기여를 했습니다.
* @hula-la가 [PR #14534](https://github.com/BerriAI/litellm/pull/14534)에서 첫 기여를 했습니다.
* @carlos-marchal-ph가 [PR #14610](https://github.com/BerriAI/litellm/pull/14610)에서 첫 기여를 했습니다.
* @akraines가 [PR #14637](https://github.com/BerriAI/litellm/pull/14637)에서 첫 기여를 했습니다.
* @mrFranklin이 [PR #14708](https://github.com/BerriAI/litellm/pull/14708)에서 첫 기여를 했습니다.
* @tcx4c70이 [PR #14675](https://github.com/BerriAI/litellm/pull/14675)에서 첫 기여를 했습니다.
* @michaeltansg가 [PR #14666](https://github.com/BerriAI/litellm/pull/14666)에서 첫 기여를 했습니다.
* @tosi29가 [PR #14725](https://github.com/BerriAI/litellm/pull/14725)에서 첫 기여를 했습니다.
* @gmdfalk가 [PR #14735](https://github.com/BerriAI/litellm/pull/14735)에서 첫 기여를 했습니다.
* @FelipeRodriguesGare가 [PR #14733](https://github.com/BerriAI/litellm/pull/14733)에서 첫 기여를 했습니다.
* @mritunjaysharma394가 [PR #14678](https://github.com/BerriAI/litellm/pull/14678)에서 첫 기여를 했습니다.

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.77.2.rc.1...v1.77.3.rc.1)**
