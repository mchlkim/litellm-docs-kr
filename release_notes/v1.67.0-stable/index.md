---
title: v1.67.0-stable - SCIM 통합
slug: v1.67.0-stable
date: 2025-04-19T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

tags: ["sso", "unified_file_id", "cost_tracking", "security"]
hide_table_of_contents: false
---
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 주요 하이라이트

- **SCIM 통합**: ID 공급자(Okta, Azure AD, OneLogin 등)가 사용자와 팀(그룹)의 프로비저닝, 업데이트, 프로비저닝 해제를 자동화할 수 있습니다.
- **팀 및 태그 기반 사용량 추적**: 이제 100만 건 이상의 지출 로그에서도 팀과 태그별 사용량 및 지출을 확인할 수 있습니다.
- **통합 Responses API**: OpenAI의 새로운 Responses API를 통해 Anthropic, Gemini, Groq 등을 호출할 수 있습니다.

자세히 살펴보겠습니다.

## SCIM 통합

<Image img={require('../../img/scim_integration.png')}/>

이번 릴리스에는 LiteLLM의 SCIM 지원이 추가되었습니다. 이를 통해 SSO 공급자(Okta, Azure AD 등)가 LiteLLM에서 사용자, 팀, 멤버십을 자동으로 생성하거나 삭제할 수 있습니다. 즉, SSO 공급자에서 팀을 제거하면 SSO 공급자가 LiteLLM의 해당 팀도 자동으로 삭제합니다.

[자세히 보기](../../docs/tutorials/scim_litellm)
## 팀 및 태그 기반 사용량 추적

<Image img={require('../../img/release_notes/new_team_usage_highlight.jpg')}/>


이번 릴리스는 100만 건 이상의 지출 로그에서 팀 및 태그 기반 사용량 추적을 개선하여, 프로덕션 환경의 LLM API 지출을 쉽게 모니터링할 수 있게 합니다. 포함되는 항목은 다음과 같습니다.

- 팀 및 태그별 **일일 지출** 보기
- 팀 내부에서 **키별 사용량 / 지출** 보기
- **여러 태그별 지출** 보기
- **내부 사용자**가 자신이 속한 팀의 지출을 볼 수 있도록 허용

[자세히 보기](#management-endpoints--ui)

## 통합 Responses API

이번 릴리스에서는 LiteLLM의 POST /v1/responses 엔드포인트를 통해 Azure OpenAI, Anthropic, AWS Bedrock, Google Vertex AI 모델을 호출할 수 있습니다. 즉, 이제 [OpenAI Codex](https://docs.litellm.ai/docs/tutorials/openai_codex) 같은 인기 도구를 자체 모델과 함께 사용할 수 있습니다.

<Image img={require('../../img/release_notes/unified_responses_api_rn.png')}/>


[자세히 보기](https://docs.litellm.ai/docs/response_api)


## 신규 모델 / 업데이트된 모델

- **OpenAI**
    1. gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini 가격 책정 - [시작하기](../../docs/providers/openai#usage), [PR](https://github.com/BerriAI/litellm/pull/9990)
    2. o4 - o4를 openai o_series 모델에 올바르게 매핑
- **Azure AI**
    1. Phi-4 출력 토큰당 비용 수정 - [PR](https://github.com/BerriAI/litellm/pull/9880)
    2. Responses API 지원 [시작하기](../../docs/providers/azure#azure-responses-api),[PR](https://github.com/BerriAI/litellm/pull/10116)
- **Anthropic**
    1. 수정된 메시지 thinking 지원 - [시작하기](../../docs/providers/anthropic#usage---thinking--reasoning_content),[PR](https://github.com/BerriAI/litellm/pull/10129)
- **Cohere**
    1. 비용 추적이 포함된 `/v2/chat` Passthrough 엔드포인트 지원 - [시작하기](../../docs/pass_through/cohere), [PR](https://github.com/BerriAI/litellm/pull/9997)
- **Azure**
    1. azure tenant_id/client_id 환경 변수 지원 - [시작하기](../../docs/providers/azure#entra-id---use-tenant_id-client_id-client_secret), [PR](https://github.com/BerriAI/litellm/pull/9993)
    2. 2025년 이후 api 버전에 대한 response_format 검사 수정 - [PR](https://github.com/BerriAI/litellm/pull/9993)
    3. gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o3, o3-mini, o4-mini 가격 책정 추가
- **VLLM**
    1. 파일 - VLLM 동영상 url에 대한 'file' 메시지 타입 지원 - [시작하기](../../docs/providers/vllm#send-video-url-to-vllm), [PR](https://github.com/BerriAI/litellm/pull/10129)
    2. Passthrough - 새로운 `/vllm/` passthrough 엔드포인트 지원 [시작하기](../../docs/pass_through/vllm), [PR](https://github.com/BerriAI/litellm/pull/10002)
- **Mistral**
    1. 새로운 `/mistral` passthrough 엔드포인트 지원 [시작하기](../../docs/pass_through/mistral), [PR](https://github.com/BerriAI/litellm/pull/10002)
- **AWS**
    1. 새로 매핑된 bedrock 리전 - [PR](https://github.com/BerriAI/litellm/pull/9430)
- **VertexAI / Google AI Studio** 관련
    1. Gemini - Response format - propertyOrdering을 지정해 google gemini 및 vertex의 스키마 필드 순서 유지 - [시작하기](../../docs/providers/vertex#json-schema), [PR](https://github.com/BerriAI/litellm/pull/9828)
    2. Gemini-2.5-flash - reasoning content 반환 [Google AI Studio](../../docs/providers/gemini#usage---thinking--reasoning_content), [Vertex AI](../../docs/providers/vertex#usage---thinking--reasoning_content)
    3. Gemini-2.5-flash - 가격 책정 및 모델 정보 [PR](https://github.com/BerriAI/litellm/pull/10125)
    4. Passthrough - 새로운 `/vertex_ai/discovery` 라우트 - AgentBuilder API 라우트 호출 활성화 [시작하기](../../docs/pass_through/vertex_ai#supported-api-endpoints), [PR](https://github.com/BerriAI/litellm/pull/10084)
- **Fireworks AI**
    1. 도구 호출 응답을 `tool_calls` 필드로 반환(fireworks는 이를 content 안의 json 문자열로 잘못 반환함) [PR](https://github.com/BerriAI/litellm/pull/10130)
- **Triton**
    1. `/generate` 호출에서 고정된 bad_words / stop words 제거 - [시작하기](../../docs/providers/triton-inference-server#triton-generate---chat-completion), [PR](https://github.com/BerriAI/litellm/pull/10163)
- **기타**
    1. Responses API에서 모든 litellm 공급자 지원(Codex와 함께 동작) - [시작하기](../../docs/tutorials/openai_codex), [PR](https://github.com/BerriAI/litellm/pull/10132)
    2. 스트리밍 응답에서 여러 도구 호출 결합 수정 - [시작하기](../../docs/completion/stream#helper-function), [PR](https://github.com/BerriAI/litellm/pull/10040)


## 비용 추적 개선

- **비용 제어** - 비용 절감을 위해 프롬프트에 캐시 제어 지점 삽입 [시작하기](../../docs/tutorials/prompt_caching), [PR](https://github.com/BerriAI/litellm/pull/10000)
- **지출 태그** - 헤더의 지출 태그 - 태그 기반 라우팅이 활성화되지 않아도 x-litellm-tags 지원 [시작하기](../../docs/proxy/request_headers#litellm-headers), [PR](https://github.com/BerriAI/litellm/pull/10000)
- **Gemini-2.5-flash** - reasoning 토큰 비용 계산 지원 [PR](https://github.com/BerriAI/litellm/pull/10141)

## 관리 엔드포인트 / UI {#management-endpoints--ui}
- **사용자**
    1. 사용자 페이지에 created_at 및 updated_at 표시 - [PR](https://github.com/BerriAI/litellm/pull/10033)
- **가상 키**
    1. 키 별칭 기준 필터링 - https://github.com/BerriAI/litellm/pull/10085
- **사용량 탭**

    1. 팀 기반 사용량
        
        - 집계된 팀 기반 사용량 로깅을 위한 새 `LiteLLM_DailyTeamSpend` 테이블 - [PR](https://github.com/BerriAI/litellm/pull/10039)
        
        - 새 팀 기반 사용량 대시보드 및 새 `/team/daily/activity` API - [PR](https://github.com/BerriAI/litellm/pull/10081)
        - /team/daily/activity API에서 팀 별칭 반환 - [PR](https://github.com/BerriAI/litellm/pull/10157)
        - 내부 사용자가 자신이 속한 팀의 지출을 볼 수 있도록 허용 - [PR](https://github.com/BerriAI/litellm/pull/10157)
        - 팀별 상위 키 보기를 허용 - [PR](https://github.com/BerriAI/litellm/pull/10157)

        <Image img={require('../../img/release_notes/new_team_usage.png')}/>

    2. 태그 기반 사용량
        - 집계된 태그 기반 사용량 로깅을 위한 새 `LiteLLM_DailyTagSpend` 테이블 - [PR](https://github.com/BerriAI/litellm/pull/10071)
        - Proxy Admin으로만 제한 - [PR](https://github.com/BerriAI/litellm/pull/10157)
        - 태그별 상위 키 보기를 허용
        - 요청에서 전달된 태그(예: 동적 태그)를 `/tag/list` API에서 반환 - [PR](https://github.com/BerriAI/litellm/pull/10157)
        <Image img={require('../../img/release_notes/new_tag_usage.png')}/>
    3. 일일 사용자, 팀, 태그 테이블에서 프롬프트 캐싱 지표 추적 - [PR](https://github.com/BerriAI/litellm/pull/10029)
    4. 키별 사용량 표시(전체, 팀, 태그 사용량 대시보드 모두) - [PR](https://github.com/BerriAI/litellm/pull/10157)
    5. 기존 사용량 탭을 새 사용량 탭으로 교체
- **모델**
    1. 열 크기 조정 및 숨김 지원 - [PR](https://github.com/BerriAI/litellm/pull/10119)
- **API Playground**
    1. 내부 사용자가 api playground를 호출할 수 있도록 허용 - [PR](https://github.com/BerriAI/litellm/pull/10157)
- **SCIM**
    1. 팀 및 사용자 관리를 위한 LiteLLM SCIM 통합 추가 - [시작하기](../../docs/tutorials/scim_litellm), [PR](https://github.com/BerriAI/litellm/pull/10072)


## 로깅 / 가드레일 통합
- **GCS**
    1. 환경 변수 GCS_PROJECT_ID를 사용하는 gcs pub sub 로깅 수정 - [시작하기](../../docs/observability/gcs_bucket_integration#usage), [PR](https://github.com/BerriAI/litellm/pull/10042)
- **AIM**
    1. pre 및 post-hook 호출에서 Aim 가드레일로 litellm call id 전달 추가 - [시작하기](../../docs/proxy/guardrails/aim_security), [PR](https://github.com/BerriAI/litellm/pull/10021)
- **Azure blob storage**
    1. 높은 처리량 시나리오에서 로깅이 동작하도록 보장 - [시작하기](../../docs/proxy/logging#azure-blob-storage), [PR](https://github.com/BerriAI/litellm/pull/9962)

## 일반 Proxy 개선

- **환경 변수로 `litellm.modify_params` 설정 지원** [PR](https://github.com/BerriAI/litellm/pull/9964)
- **Model Discovery** - proxy의 `/v1/models` 엔드포인트 호출 시 공급자의 `/models` 엔드포인트 확인 - [시작하기](../../docs/proxy/model_discovery), [PR](https://github.com/BerriAI/litellm/pull/9958)
- **`/utils/token_counter`** - db 모델의 사용자 지정 토크나이저 조회 수정 - [시작하기](../../docs/proxy/configs#set-custom-tokenizer), [PR](https://github.com/BerriAI/litellm/pull/10047)
- **Prisma migrate** - db 테이블의 기존 열 처리 - [PR](https://github.com/BerriAI/litellm/pull/10138)
