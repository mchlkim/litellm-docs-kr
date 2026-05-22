---
title: "v1.72.2-stable"
slug: "v1-72-2-stable"
date: 2025-06-07T10:00:00
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


## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.72.2-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.72.2.post1
```

</TabItem>
</Tabs>

## 요약 {#tldr}

* **업그레이드해야 하는 이유**
    - /v1/messages 성능 개선: 이 엔드포인트에서 LiteLLM Proxy 오버헤드가 이제 250 RPS에서 50ms까지 낮아졌습니다. 
    - 정확한 속도 제한: 다중 인스턴스 속도 제한이 이제 키, 모델, 팀, 사용자 전반의 속도 제한을 spillover 없이 추적합니다.
    - UI의 Audit 로그: LiteLLM UI에서 Audit 로그를 확인해 Keys, Teams, 모델이 언제 삭제되었는지 추적할 수 있습니다.
    - /v1/messages 전체 모델 지원: 이제 /v1/messages API에서 모든 LiteLLM 모델(`gpt-4.1`, `o1-pro`, `gemini-2.5-pro`)을 사용할 수 있습니다. 
    - [Anthropic MCP](../../docs/providers/anthropic#mcp-tool-calling): Anthropic 모델에서 원격 MCP Servers를 사용할 수 있습니다. 
* **읽어야 할 대상**
    - `/v1/messages` API(Claude Code)를 사용하는 팀
    - LiteLLM 가상 키를 사용하고 속도 제한을 설정하는 Proxy 관리자
* **업그레이드 위험**
    - **중간**
        - `ddtrace==3.8.0`으로 업그레이드되었습니다. DataDog 추적을 사용하는 경우 이는 중간 수준의 위험입니다. 문제가 없는지 로그를 모니터링하는 것을 권장합니다.



---

## `/v1/messages` 성능 개선 {#v1messages-performance-improvements}

<Image 
  img={require('../../img/release_notes/v1_messages_perf.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이번 릴리스는 LiteLLM의 /v1/messages API에 큰 성능 개선을 제공합니다. 

이 엔드포인트에서 LiteLLM Proxy 오버헤드 지연 시간은 이제 50ms까지 낮아졌으며, 각 인스턴스는 250 RPS를 처리할 수 있습니다. 1,000개가 넘는 스트리밍 청크가 포함된 페이로드로 부하 테스트를 수행해 이러한 개선을 검증했습니다.

이는 대용량 요청이 포함된 실시간 사용 사례(예: 다중 턴 대화, Claude Code 등)에 적합합니다. 

## 다중 인스턴스 속도 제한 개선 {#multi-instance-rate-limiting-improvements}

<Image 
  img={require('../../img/release_notes/multi_instance_rate_limits_v3.jpg')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

LiteLLM은 이제 키, 모델, 팀, 사용자 전반의 속도 제한을 spillover 없이 정확하게 추적합니다.

이는 트래픽이 많은 다중 인스턴스 구성에서 누수와 spillover 문제가 있었던 이전 버전 대비 큰 개선입니다.

**주요 변경 사항:**
- Redis가 이제 백그라운드 동기화가 아니라 속도 제한 검사에 포함됩니다. 이를 통해 정확성을 보장하고 활동이 적을 때 읽기/쓰기 작업을 줄입니다.
- LiteLLM은 이제 Lua 스크립트를 사용해 모든 검사가 원자적으로 수행되도록 합니다.
- 인메모리 캐싱은 Redis 값을 사용합니다. 이를 통해 드리프트를 방지하고 객체가 한도를 초과한 뒤 Redis 쿼리를 줄입니다.

이 변경 사항은 현재 기능 플래그인 `EXPERIMENTAL_ENABLE_MULTI_INSTANCE_RATE_LIMITING=True` 뒤에 있습니다. 피드백에 따라 다음 릴리스에서 GA로 전환할 계획입니다.

## UI의 Audit 로그 {#audit-logs-on-ui}

<Image 
  img={require('../../img/release_notes/ui_audit_log.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

이번 릴리스는 UI에서 audit logs를 볼 수 있는 기능을 도입합니다. Proxy 관리자는 이제 키가 삭제되었는지와 삭제된 시점, 그리고 해당 작업을 수행한 사용자를 확인할 수 있습니다.

LiteLLM은 다음 엔터티와 작업에 대한 변경 사항을 추적합니다. 

- **엔터티:** Keys, Teams, Users, 모델
- **작업:** Create, Update, Delete, Regenerate



## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

**새로 추가된 모델**

| 제공자    | 모델                                  | 컨텍스트 창 | 입력($/1M tokens) | 출력($/1M tokens) |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- |
| Anthropic   | `claude-4-opus-20250514`               | 200K           | $15.00              | $75.00               |
| Anthropic   | `claude-4-sonnet-20250514`             | 200K           | $3.00               | $15.00               |
| `VertexAI`, `Google AI Studio`  | `gemini-2.5-pro-preview-06-05`         | 1M             | $1.25               | $10.00               |
| OpenAI      | `codex-mini-latest`                    | 200K           | $1.50               | $6.00                |
| Cerebras    | `qwen-3-32b`                           | 128K           | $0.40               | $0.80                |
| SambaNova   | `DeepSeek-R1`                          | 32K            | $5.00               | $7.00                |
| SambaNova   | `DeepSeek-R1-Distill-Llama-70B`       | 131K           | $0.70               | $1.40                |



### 모델 업데이트 {#model-updates}

- **[Anthropic](../../docs/providers/anthropic)**
    - 신규 Claude 모델에 비용 추적 추가 - [PR](https://github.com/BerriAI/litellm/pull/11339)
        - `claude-4-opus-20250514`
        - `claude-4-sonnet-20250514`
    - Anthropic 모델에서 MCP 도구 호출 지원 - [PR](https://github.com/BerriAI/litellm/pull/11474)
- **[Google AI Studio](../../docs/providers/gemini)**
    - Google Gemini 2.5 Pro Preview 06-05 지원 - [PR](https://github.com/BerriAI/litellm/pull/11447)
    - `reasoning_content`를 사용한 Gemini 스트리밍 사고 콘텐츠 파싱 - [PR](https://github.com/BerriAI/litellm/pull/11298)
    - Gemini 모델의 no reasoning 옵션 지원 - [PR](https://github.com/BerriAI/litellm/pull/11393)
    - Gemini 모델의 URL 컨텍스트 지원 - [PR](https://github.com/BerriAI/litellm/pull/11351)
    - Gemini embeddings-001 모델 가격 및 컨텍스트 창 - [PR](https://github.com/BerriAI/litellm/pull/11332)
- **[OpenAI](../../docs/providers/openai)**
    - `codex-mini-latest` 비용 추적 - [PR](https://github.com/BerriAI/litellm/pull/11492)
- **[Vertex AI](../../docs/providers/vertex)**
    - 스트리밍 호출에서 캐시 토큰 추적 - [PR](https://github.com/BerriAI/litellm/pull/11387)
    - 스트리밍 및 비스트리밍에서 upstream 응답 ID와 일치하는 response_id 반환 - [PR](https://github.com/BerriAI/litellm/pull/11456)
- **[Cerebras](../../docs/providers/cerebras)**
    - Cerebras/qwen-3-32b 모델 가격 및 컨텍스트 창 - [PR](https://github.com/BerriAI/litellm/pull/11373)
- **[HuggingFace](../../docs/providers/huggingface)**
    - 기본값이 아닌 `input_type`을 사용하는 임베딩 수정 - [PR](https://github.com/BerriAI/litellm/pull/11452)
- **[DataRobot](../../docs/providers/datarobot)**
    - 엔터프라이즈 AI 워크플로를 위한 신규 provider integration - [PR](https://github.com/BerriAI/litellm/pull/10385)
- **[DeepSeek](../../docs/providers/together_ai)**
    - Together AI를 통한 DeepSeek R1 family 모델 구성 - [PR](https://github.com/BerriAI/litellm/pull/11394)
    - DeepSeek R1 가격 및 컨텍스트 창 구성 - [PR](https://github.com/BerriAI/litellm/pull/11339)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

- **[Images API](../../docs/image_generation)**
    - 이미지 엔드포인트에 Azure endpoint 지원 - [PR](https://github.com/BerriAI/litellm/pull/11482)
- **[Anthropic Messages API](../../docs/completion/chat)**
    - /v1/messages API Spec에서 모든 LiteLLM Providers(OpenAI, Azure, Bedrock, Vertex, DeepSeek 등) 지원 - [PR](https://github.com/BerriAI/litellm/pull/11502)
    - /v1/messages 경로 성능 개선 - [PR](https://github.com/BerriAI/litellm/pull/11421)
    - Bedrock 모델과 함께 LiteLLM을 사용할 때 스트리밍 사용량 통계 반환 - [PR](https://github.com/BerriAI/litellm/pull/11469)
- **[Embeddings API](../../docs/embedding/supported_embedding)**
    - 임베딩 호출에 대한 provider-specific optional params 처리 - [PR](https://github.com/BerriAI/litellm/pull/11346)
    - 임베딩에 적절한 Sagemaker request attribute 사용 - [PR](https://github.com/BerriAI/litellm/pull/11362)
- **[Rerank API](../../docs/rerank/supported_rerank)**
    - 신규 HuggingFace rerank provider 지원 - [PR](https://github.com/BerriAI/litellm/pull/11438), [Guide](../../docs/providers/huggingface_rerank)

---

## 비용 추적

- /anthropic passthrough route를 통한 anthropic batch calls에 토큰 추적 추가 - [PR](https://github.com/BerriAI/litellm/pull/11388)

---

## 관리 엔드포인트 / UI {#management-endpoints-ui}


- **SSO/인증**
    - 영구 설정을 사용하는 SSO configuration endpoints 및 UI integration - [PR](https://github.com/BerriAI/litellm/pull/11417)
    - DB에서 proxy admin ID role 업데이트 + custom root path로 SSO redirects 처리 - [PR](https://github.com/BerriAI/litellm/pull/11384)
    - custom auth에서 virtual key 반환 지원 - [PR](https://github.com/BerriAI/litellm/pull/11346)
    - User ID가 이메일이나 전화번호가 아닌지 확인하는 검증 - [PR](https://github.com/BerriAI/litellm/pull/10102)
- **Teams**
    - Create/Update team member API 500 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/10479)
    - KeyInfoView의 RegenerateKeyModal에 엔터프라이즈 기능 게이팅 적용 - [PR](https://github.com/BerriAI/litellm/pull/11400)
- **SCIM**
    - SCIM running patch operation의 대소문자 민감도 수정 - [PR](https://github.com/BerriAI/litellm/pull/11335)
- **일반**
    - action buttons를 sticky footer action buttons로 변환 - [PR](https://github.com/BerriAI/litellm/pull/11293)
    - Custom Server Root Path - custom root path에서 UI 제공 지원 - [Guide](../../docs/proxy/custom_root_ui)
---

## 로깅 / 가드레일 통합 {#logging-guardrail-integrations}

#### 로깅 {#logging}
- **[S3](../../docs/proxy/logging#s3)**
    - 성능 개선을 위한 Async + Batched S3 Logging - [PR](https://github.com/BerriAI/litellm/pull/11340)
- **[DataDog](../../docs/observability/datadog_integration)**
    - 스트리밍 청크용 instrumentation 추가 - [PR](https://github.com/BerriAI/litellm/pull/11338)
    - LiteLLM CPU%의 Python profile을 모니터링하기 위한 DD profiler 추가 - [PR](https://github.com/BerriAI/litellm/pull/11375)
    - DD trace version 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/11426)
- **[Prometheus](../../docs/proxy/prometheus)**
    - litellm_total_token metrics에 custom metadata labels 전달 - [PR](https://github.com/BerriAI/litellm/pull/11414)
- **[GCS](../../docs/proxy/logging#google-cloud-storage)**
    - 전달된 경우 GSM project ID를 처리하도록 GCSBucketBase 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/11409)

#### 가드레일 {#guardrails}
- **[Presidio](../../docs/proxy/guardrails/presidio)**
    - guardrails용 presidio_language yaml configuration 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11331)

---

## 성능 / 안정성 개선 {#performance-reliability-improvements}

- **성능 최적화**
    - /health/liveliness endpoints에서 auth를 실행하지 않음 - [PR](https://github.com/BerriAI/litellm/pull/11378)
    - 모든 hanging request alert마다 task를 1개씩 생성하지 않음 - [PR](https://github.com/BerriAI/litellm/pull/11385)
    - 활성 /asyncio-tasks를 추적하는 debugging endpoint 추가 - [PR](https://github.com/BerriAI/litellm/pull/11382)
    - spend logs의 최대 보존용 batch size를 제어 가능하게 변경 - [PR](https://github.com/BerriAI/litellm/pull/11459)
    - token counter를 비활성화하는 flag 노출 - [PR](https://github.com/BerriAI/litellm/pull/11344)
    - 이전 redis 버전을 위한 pipeline redis lpop 지원 - [PR](https://github.com/BerriAI/litellm/pull/11425)
---

## 버그 수정 {#bug-fixes}

- **LLM API 수정**
    - **Anthropic**: file url's를 'file_id' parameter로 전달할 때 발생한 regression 수정 - [PR](https://github.com/BerriAI/litellm/pull/11387)
    - **Vertex AI**: Description 및 Default에 대한 Vertex AI any_of 문제 수정 - [PR](https://github.com/BerriAI/litellm/issues/11383) 
    - transcription model name mapping 수정 - [PR](https://github.com/BerriAI/litellm/pull/11333)
    - **Image Generation**: gpt-image-1 모델 응답의 usage field에 있는 None values 수정 - [PR](https://github.com/BerriAI/litellm/pull/11448)
    - **Responses API**: _transform_responses_api_content_to_chat_completion_content가 file content type을 지원하지 않는 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11494)
    - **Fireworks AI**: rate limit exception mapping 수정 - 오류 메시지에서 "rate limit" 텍스트 감지 - [PR](https://github.com/BerriAI/litellm/pull/11455)
- **비용 추적/Budgets**
    - budget selection 및 user identification에 user_header_name property 반영 - [PR](https://github.com/BerriAI/litellm/pull/11419)
- **MCP Server**
    - 중복된 server_id MCP config servers 제거 - [PR](https://github.com/BerriAI/litellm/pull/11327)
- **함수 호출**
    - supports_function_calling이 llm_proxy models와 함께 동작 - [PR](https://github.com/BerriAI/litellm/pull/11381)
- **지식 베이스**
    - Knowledge Base 호출이 오류를 반환하던 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11467)

---

## 신규 기여자 {#new-contributors}
* [@mjnitz02](https://github.com/mjnitz02)님이 [#10385](https://github.com/BerriAI/litellm/pull/10385)에서 첫 기여를 했습니다.
* [@hagan](https://github.com/hagan)님이 [#10479](https://github.com/BerriAI/litellm/pull/10479)에서 첫 기여를 했습니다.
* [@wwells](https://github.com/wwells)님이 [#11409](https://github.com/BerriAI/litellm/pull/11409)에서 첫 기여를 했습니다.
* [@likweitan](https://github.com/likweitan)님이 [#11400](https://github.com/BerriAI/litellm/pull/11400)에서 첫 기여를 했습니다.
* [@raz-alon](https://github.com/raz-alon)님이 [#10102](https://github.com/BerriAI/litellm/pull/10102)에서 첫 기여를 했습니다.
* [@jtsai-quid](https://github.com/jtsai-quid)님이 [#11394](https://github.com/BerriAI/litellm/pull/11394)에서 첫 기여를 했습니다.
* [@tmbo](https://github.com/tmbo)님이 [#11362](https://github.com/BerriAI/litellm/pull/11362)에서 첫 기여를 했습니다.
* [@wangsha](https://github.com/wangsha)님이 [#11351](https://github.com/BerriAI/litellm/pull/11351)에서 첫 기여를 했습니다.
* [@seankwalker](https://github.com/seankwalker)님이 [#11452](https://github.com/BerriAI/litellm/pull/11452)에서 첫 기여를 했습니다.
* [@pazevedo-hyland](https://github.com/pazevedo-hyland)님이 [#11381](https://github.com/BerriAI/litellm/pull/11381)에서 첫 기여를 했습니다.
* [@cainiaoit](https://github.com/cainiaoit)님이 [#11438](https://github.com/BerriAI/litellm/pull/11438)에서 첫 기여를 했습니다.
* [@vuanhtu52](https://github.com/vuanhtu52)님이 [#11508](https://github.com/BerriAI/litellm/pull/11508)에서 첫 기여를 했습니다.

---

## 데모 인스턴스 {#demo-instance}

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.

- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234

## [Git Diff](https://github.com/BerriAI/litellm/releases/tag/v1.72.2-stable)
