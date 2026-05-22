---
title: v1.70.1-stable - Gemini Realtime API 지원
slug: v1.70.1-stable
date: 2025-05-17T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
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
docker.litellm.ai/berriai/litellm:main-v1.70.1-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.70.1
```
</TabItem>
</Tabs>


## 주요 하이라이트 {#key-highlights}

LiteLLM v1.70.1-stable이 지금 공개되었습니다. 이번 릴리스의 주요 하이라이트는 다음과 같습니다.

- **Gemini Realtime API**: 이제 OpenAI /v1/realtime API를 통해 Gemini의 Live API를 호출할 수 있습니다.
- **Spend 로그 보관 기간**: 특정 기간보다 오래된 spend log 삭제를 활성화합니다.
- **PII Masking 2.0**: UI에서 특정 PII/PHI 엔터티를 마스킹하거나 차단하도록 쉽게 구성할 수 있습니다.

## Gemini Realtime API 지원 {#gemini-realtime-api}

<Image img={require('../../img/gemini_realtime.png')}/>


이번 릴리스에서는 OpenAI의 /v1/realtime API를 통해 Gemini realtime 모델(예: gemini-2.0-flash-live)을 호출할 수 있습니다. 개발자는 모델 이름만 바꿔 OpenAI에서 Gemini로 쉽게 전환할 수 있습니다.

주요 하이라이트:
- 텍스트 + 오디오 입력/출력 지원
- OpenAI 형식의 세션 구성(modality, instructions, activity detection) 설정 지원
- realtime 세션의 로깅 + 사용량 추적 지원

현재 Google AI Studio를 통해 지원됩니다. VertexAI 지원은 다음 주에 공개할 예정입니다.

[**자세히 보기**](../../docs/providers/google_ai_studio/realtime)

## Spend 로그 보관 기간 {#spend-로그-retention-period}

<Image img={require('../../img/delete_spend_logs.jpg')}/>



이번 릴리스에서는 특정 기간보다 오래된 LiteLLM Spend 로그를 삭제할 수 있습니다. 이제 로그에 원본 request/response 저장을 활성화할 수 있으므로, 오래된 로그를 삭제하면 프로덕션에서 데이터베이스 성능을 유지하는 데 도움이 됩니다.

[**자세히 보기**](../../docs/proxy/spend_logs_deletion)

## PII Masking 2.0

<Image img={require('../../img/pii_masking_v2.png')}/>

이번 릴리스에서는 Presidio PII Integration이 개선되었습니다. Proxy Admin은 이제 다음 작업을 할 수 있습니다.

- 특정 엔터티를 마스킹하거나 차단합니다(예: 이메일 같은 다른 엔터티는 마스킹하면서 의료 면허는 차단).
- 프로덕션에서 가드레일을 모니터링합니다. 이제 LiteLLM 로그에는 guardrail run, 감지된 엔터티, 각 엔터티의 confidence score가 표시됩니다.

[**자세히 보기**](../../docs/proxy/guardrails/pii_masking_v2)

## 새 모델 / 업데이트된 모델 {#new-모델--updated-모델}

- **Gemini ([VertexAI](https://docs.litellm.ai/docs/providers/vertex#usage-with-litellm-proxy-server) + [Google AI Studio](https://docs.litellm.ai/docs/providers/gemini))**
    - `/chat/completion`
        - 오디오 입력 처리 - [PR](https://github.com/BerriAI/litellm/pull/10739)
        - Vertex AI에서 깊게 중첩된 response schema를 사용할 때 발생하는 maximum recursion depth 문제를 수정했습니다. constants에서 DEFAULT_MAX_RECURSE_DEPTH를 10에서 100으로 늘렸습니다. [PR](https://github.com/BerriAI/litellm/pull/10798)
        - streaming mode에서 reasoning token 캡처 - [PR](https://github.com/BerriAI/litellm/pull/10789)
- **[Google AI Studio](../../docs/providers/google_ai_studio/realtime)**
    - `/realtime`
        - Gemini Multimodal Live API 지원
        - 오디오 입력/출력 지원, optional param mapping, 정확한 사용량 계산 - [PR](https://github.com/BerriAI/litellm/pull/10909)
- **[VertexAI](../../docs/providers/vertex#metallama-api)**
    - `/chat/completion`
        - 반환된 streaming chunk 안에 모델 응답이 중첩되던 llama streaming 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/10878)
- **[Ollama](../../docs/providers/ollama)**
    - `/chat/completion`
        - structured response 수정 - [PR](https://github.com/BerriAI/litellm/pull/10617)
- **[Bedrock](../../docs/providers/bedrock#litellm-proxy-usage)**
    - [`/chat/completion`](../../docs/providers/bedrock#litellm-proxy-usage)
        - assistant.content가 None일 때 thinking_blocks 처리 - [PR](https://github.com/BerriAI/litellm/pull/10688)
        - tool json schema에서 허용된 필드만 허용하도록 수정 - [PR](https://github.com/BerriAI/litellm/pull/10062)
        - Bedrock Sonnet prompt caching 비용 정보 추가
        - Mistral Pixtral 지원 - [PR](https://github.com/BerriAI/litellm/pull/10439)
        - tool caching 지원 - [PR](https://github.com/BerriAI/litellm/pull/10897)
    - [`/messages`](../../docs/anthropic_unified)
        - dynamic AWS Params 사용 허용 - [PR](https://github.com/BerriAI/litellm/pull/10769)
- **[Nvidia NIM](../../docs/providers/nvidia_nim)**
    - [`/chat/completion`](../../docs/providers/nvidia_nim#usage---litellm-proxy-server)
        - tools, tool_choice, parallel_tool_calls 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/10763)
- **[Novita AI](../../docs/providers/novita)**
    - `/chat/completion` route용 새 provider 추가 - [PR](https://github.com/BerriAI/litellm/pull/9527)
- **[Azure](../../docs/providers/azure)**
    - [`/image/generation`](../../docs/providers/azure#image-generation)
        - custom model name으로 azure dall e 3 호출 시 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/10776)
- **[Cohere](../../docs/providers/cohere)**
    - [`/embeddings`](../../docs/providers/cohere#embedding)
        - embedding을 `/v2/embed` 사용으로 마이그레이션하고 output_dimensions param 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/10809)
- **[Anthropic](../../docs/providers/anthropic)**
    - [`/chat/completion`](../../docs/providers/anthropic#usage-with-litellm-proxy)
        - web search tool 지원 - native + openai format - [시작하기](../../docs/providers/anthropic#anthropic-hosted-tools-computer-text-editor-web-search)
- **[VLLM](../../docs/providers/vllm)**
    - [`/embeddings`](../../docs/providers/vllm#embeddings)
        - 정수 목록 형태의 embedding input 지원
- **[OpenAI](../../docs/providers/openai)**
    - [`/chat/completion`](../../docs/providers/openai#usage---litellm-proxy-server)
        - b64 file data input 처리 수정 - [시작하기](../../docs/providers/openai#pdf-file-parsing)
        - 모든 vision model에 ‘supports_pdf_input’ 추가 - [PR](https://github.com/BerriAI/litellm/pull/10897)

## LLM API 엔드포인트 {#llm-api-endpoints}
- [**Responses API**](../../docs/response_api)
    - delete API 지원 수정 - [PR](https://github.com/BerriAI/litellm/pull/10845)
- [**Rerank API**](../../docs/rerank)
    - 이제 `/v2/rerank`가 ‘llm_api_route’로 등록되어 non-admin도 호출할 수 있습니다. - [PR](https://github.com/BerriAI/litellm/pull/10861)

## 비용 추적 개선 사항 {#비용-추적-improvements}
- **`/chat/completion`, `/messages`**
    - Anthropic - web search tool 비용 추적 - [PR](https://github.com/BerriAI/litellm/pull/10846)
    - Groq - model max tokens + 비용 정보 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/10077)
- **`/audio/transcription`**
    - Azure - gpt-4o-mini-tts pricing 추가 - [PR](https://github.com/BerriAI/litellm/pull/10807)
    - Proxy - tag별 spend 추적 수정 - [PR](https://github.com/BerriAI/litellm/pull/10832)
- **`/embeddings`**
    - Azure AI - cohere embed v4 pricing 추가 - [PR](https://github.com/BerriAI/litellm/pull/10806)

## 관리 엔드포인트 / UI {#management-endpoints--ui}
- **모델**
    - Ollama - UI에 api base param 추가
- **로그**
    - 로그에 team id, key alias, key hash filter 추가 - https://github.com/BerriAI/litellm/pull/10831
    - 이제 로그 UI에서 guardrail tracing 제공 - https://github.com/BerriAI/litellm/pull/10893
- **팀**
    - team은 org에 있고 member는 org에 없을 때 team info 업데이트 패치 - https://github.com/BerriAI/litellm/pull/10835
- **가드레일**
    - UI에 Bedrock, Presidio, Lakers guardrails 추가 - https://github.com/BerriAI/litellm/pull/10874
    - guardrail info page 보기 - https://github.com/BerriAI/litellm/pull/10904
    - UI에서 guardrail 편집 허용 - https://github.com/BerriAI/litellm/pull/10907
- **키 테스트**
    - UI에서 테스트할 guardrail 선택



## 로깅 / 알림 통합 {#logging--alerting-integrations}
- **[StandardLoggingPayload](../../docs/proxy/logging_spec)**
    - requester metadata에 있는 모든 `x-` header 로깅 - [시작하기](../../docs/proxy/logging_spec#standardloggingmetadata)
    - 이제 standard logging payload에서 guardrail tracing 제공 - [시작하기](../../docs/proxy/logging_spec#standardloggingguardrailinformation)
- **[Generic API Logger](../../docs/proxy/logging#custom-callback-apis-async)**
    - application/json header 전달 지원
- **[Arize Phoenix](../../docs/observability/phoenix_integration)**
    - 수정: Phoenix Integration용 OTEL_EXPORTER_OTLP_TRACES_HEADERS를 URL encode 처리 - [PR](https://github.com/BerriAI/litellm/pull/10654)
    - OTEL, Arize phoenix에 guardrail tracing 추가 - [PR](https://github.com/BerriAI/litellm/pull/10896)
- **[PagerDuty](../../docs/proxy/pagerduty)**
    - PagerDuty가 이제 무료 기능입니다. - [PR](https://github.com/BerriAI/litellm/pull/10857)
- **[Alerting](../../docs/proxy/alerting)**
    - virtual key/user/team 업데이트 시 Slack alert 전송이 이제 무료입니다. - [PR](https://github.com/BerriAI/litellm/pull/10863)


## 가드레일
- **가드레일**
    - guardrail을 직접 테스트하기 위한 새 `/apply_guardrail` endpoint - [PR](https://github.com/BerriAI/litellm/pull/10867)
- **[Lakera](../../docs/proxy/guardrails/lakera_ai)**
    - `/v2` endpoint 지원 - [PR](https://github.com/BerriAI/litellm/pull/10880)
- **[Presidio](../../docs/proxy/guardrails/pii_masking_v2)**
    - Presidio guardrail integration에서 message content 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/10197)
    - PII Entities Config 지정 허용 - [PR](https://github.com/BerriAI/litellm/pull/10810)
- **[Aim Security](../../docs/proxy/guardrails/aim_security)**
    - AIM 가드레일에서 anonymization 지원 - [PR](https://github.com/BerriAI/litellm/pull/10757)



## 성능 / 로드밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}
- **.env variable을 사용해 모든 constant override 허용** - [PR](https://github.com/BerriAI/litellm/pull/10803)
- **[spend log의 최대 보관 기간](../../docs/proxy/spend_logs_deletion)**
    - config에 retention flag 추가 - [PR](https://github.com/BerriAI/litellm/pull/10815)
    - 구성된 기간을 기준으로 로그 정리 지원 - [PR](https://github.com/BerriAI/litellm/pull/10872)

## 일반 Proxy 개선 사항 {#general-proxy-improvements}
- **인증**
    - x-litellm-api-key custom header의 Bearer $LITELLM_API_KEY 처리 [PR](https://github.com/BerriAI/litellm/pull/10776)
- **새 엔터프라이즈 pip package** - `litellm-enterprise` - pip package 사용 시 `enterprise` 폴더를 찾을 수 없던 문제 수정
- **[Proxy CLI](../../docs/proxy/management_cli)**
    - `models import` command 추가 - [PR](https://github.com/BerriAI/litellm/pull/10581)
- **[OpenWebUI](../../docs/tutorials/openweb_ui#per-user-tracking)**
    - Open Web UI의 User Header를 파싱하도록 LiteLLM 구성
- **[LiteLLM Proxy w/ LiteLLM SDK](../../docs/providers/litellm_proxy#send-all-sdk-requests-to-litellm-proxy)**
    - LiteLLM SDK를 통해 호출할 때 litellm proxy 사용을 강제/항상 적용하는 옵션


## 새 기여자 {#new-contributors}
* [@imdigitalashish](https://github.com/imdigitalashish)가 PR [#10617](https://github.com/BerriAI/litellm/pull/10617)에서 첫 기여를 했습니다.
* [@LouisShark](https://github.com/LouisShark)가 PR [#10688](https://github.com/BerriAI/litellm/pull/10688)에서 첫 기여를 했습니다.
* [@OscarSavNS](https://github.com/OscarSavNS)가 PR [#10764](https://github.com/BerriAI/litellm/pull/10764)에서 첫 기여를 했습니다.
* [@arizedatngo](https://github.com/arizedatngo)가 PR [#10654](https://github.com/BerriAI/litellm/pull/10654)에서 첫 기여를 했습니다.
* [@jugaldb](https://github.com/jugaldb)가 PR [#10805](https://github.com/BerriAI/litellm/pull/10805)에서 첫 기여를 했습니다.
* [@daikeren](https://github.com/daikeren)가 PR [#10781](https://github.com/BerriAI/litellm/pull/10781)에서 첫 기여를 했습니다.
* [@naliotopier](https://github.com/naliotopier)가 PR [#10077](https://github.com/BerriAI/litellm/pull/10077)에서 첫 기여를 했습니다.
* [@damienpontifex](https://github.com/damienpontifex)가 PR [#10813](https://github.com/BerriAI/litellm/pull/10813)에서 첫 기여를 했습니다.
* [@Dima-Mediator](https://github.com/Dima-Mediator)가 PR [#10789](https://github.com/BerriAI/litellm/pull/10789)에서 첫 기여를 했습니다.
* [@igtm](https://github.com/igtm)가 PR [#10814](https://github.com/BerriAI/litellm/pull/10814)에서 첫 기여를 했습니다.
* [@shibaboy](https://github.com/shibaboy)가 PR [#10752](https://github.com/BerriAI/litellm/pull/10752)에서 첫 기여를 했습니다.
* [@camfarineau](https://github.com/camfarineau)가 PR [#10629](https://github.com/BerriAI/litellm/pull/10629)에서 첫 기여를 했습니다.
* [@ajac-zero](https://github.com/ajac-zero)가 PR [#10439](https://github.com/BerriAI/litellm/pull/10439)에서 첫 기여를 했습니다.
* [@damgem](https://github.com/damgem)가 PR [#9802](https://github.com/BerriAI/litellm/pull/9802)에서 첫 기여를 했습니다.
* [@hxdror](https://github.com/hxdror)가 PR [#10757](https://github.com/BerriAI/litellm/pull/10757)에서 첫 기여를 했습니다.
* [@wwwillchen](https://github.com/wwwillchen)가 PR [#10894](https://github.com/BerriAI/litellm/pull/10894)에서 첫 기여를 했습니다.


## 데모 인스턴스 {#demo-instance}

변경 사항을 테스트할 수 있는 데모 인스턴스는 다음과 같습니다.

- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234


## [Git Diff](https://github.com/BerriAI/litellm/releases)
