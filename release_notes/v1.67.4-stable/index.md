---
title: v1.67.4-stable - 향상된 사용자 관리
slug: v1.67.4-stable
date: 2025-04-26T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

tags: ["responses_api", "ui_improvements", "security", "session_management"]
hide_table_of_contents: false
---
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.67.4-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.67.4.post1
```
</TabItem>
</Tabs>

## 주요 하이라이트 {#key-highlights}

- **향상된 사용자 관리**: 이번 릴리스에서는 사용자, 키, 팀, 모델 전반에 걸쳐 검색과 필터링을 사용할 수 있습니다.
- **Responses API 로드 밸런싱**: 공급자 리전 간에 요청을 라우팅하고 세션 연속성을 보장합니다. 
- **UI 세션 로그**: LiteLLM으로 보내는 여러 요청을 하나의 세션으로 그룹화합니다. 

## 향상된 사용자 관리 {#improved-user-management}

<Image img={require('../../img/release_notes/ui_search_users.png')}/>
<br/>

이번 릴리스에서는 LiteLLM에서 사용자와 키를 더 쉽게 관리할 수 있습니다. 이제 사용자, 키, 팀, 모델 전반을 검색하고 필터링할 수 있으며 사용자 설정도 더 간편하게 제어할 수 있습니다.

새 기능은 다음과 같습니다.

- 이메일, ID, 역할 또는 팀으로 사용자를 검색합니다.
- 사용자의 모든 모델, 팀, 키를 한곳에서 확인합니다.
- Users 탭에서 바로 사용자 역할과 모델 접근 권한을 변경합니다.

이러한 변경으로 LiteLLM에서 사용자 설정과 관리에 들이는 시간을 줄일 수 있습니다.

## Responses API 로드 밸런싱 {#responses-api-load-balancing}

<Image img={require('../../img/release_notes/ui_responses_lb.png')}/>
<br/>

이번 릴리스에서는 Responses API에 로드 밸런싱을 도입하여 공급자 리전 간에 요청을 라우팅하고 세션 연속성을 보장할 수 있습니다. 동작 방식은 다음과 같습니다.

- `previous_response_id`가 제공되면 LiteLLM은 이전 응답을 생성한 원래 배포로 요청을 라우팅하여 세션 연속성을 보장합니다.
- `previous_response_id`가 제공되지 않으면 LiteLLM은 사용 가능한 배포 전반에 요청을 로드 밸런싱합니다.

[자세히 보기](https://docs.litellm.ai/docs/response_api#load-balancing-with-session-continuity)

## UI 세션 로그 {#ui-session-로그}

<Image img={require('../../img/ui_session_logs.png')}/>
<br/>

이번 릴리스에서는 LiteLLM proxy로 보내는 요청을 하나의 세션으로 그룹화할 수 있습니다. 요청에 `litellm_session_id`를 지정하면 LiteLLM이 같은 세션의 모든 로그를 자동으로 그룹화합니다. 이를 통해 세션별 사용량과 요청 내용을 쉽게 추적할 수 있습니다. 

[자세히 보기](https://docs.litellm.ai/docs/proxy/ui_logs_sessions)

## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

- **OpenAI**
    1. `gpt-image-1` 비용 추적을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/image_generation)
    2. 버그 수정: quality가 지정되지 않은 경우 gpt-image-1 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10247)
- **Azure**
    1. Azure에서 whisper로 timestamp granularities가 전달되는 문제를 수정했습니다. [시작하기](https://docs.litellm.ai/docs/audio_transcription)
    2. azure/gpt-image-1 가격을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/image_generation), [PR](https://github.com/BerriAI/litellm/pull/10327)
    3. `azure/computer-use-preview`, `azure/gpt-4o-audio-preview-2024-12-17`, `azure/gpt-4o-mini-audio-preview-2024-12-17` 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10178)
- **Bedrock**
    1. model="arn:.."인 경우, 즉 Bedrock application inference profile models에서 호환되는 모든 Bedrock 파라미터 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/bedrock#bedrock-application-inference-profile), [PR](https://github.com/BerriAI/litellm/pull/10256)
    2. 잘못된 system prompt 변환을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10120)
- **`VertexAI` / `Google AI Studio`**
    1. `gemini-2.5-flash`에서 `budget_tokens=0` 설정을 허용했습니다. [시작하기](https://docs.litellm.ai/docs/providers/gemini#usage---thinking--reasoning_content),[PR](https://github.com/BerriAI/litellm/pull/10198)
    2. 반환되는 `usage`에 thinking token 사용량이 포함되도록 보장했습니다. [PR](https://github.com/BerriAI/litellm/pull/10198)
    3. `gemini-2.5-pro-preview-03-25` 비용 추적을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10178)
- **Cohere**
    1. cohere command-a-03-2025 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/cohere), [PR](https://github.com/BerriAI/litellm/pull/10295)
- **SageMaker**
    1. max_completion_tokens 파라미터 지원을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/providers/sagemaker), [PR](https://github.com/BerriAI/litellm/pull/10300)
- **Responses API**
    1. GET 및 DELETE 작업 지원을 추가했습니다 - `/v1/responses/{response_id}` [시작하기](../../docs/response_api)
    2. 지원되는 모든 모델에 세션 관리 지원을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10321)
    3. 세션 내 모델 일관성을 유지하기 위한 routing affinity를 추가했습니다. [시작하기](https://docs.litellm.ai/docs/response_api#load-balancing-with-routing-affinity), [PR](https://github.com/BerriAI/litellm/pull/10193)


## 비용 추적 개선 {#비용-추적-improvements}

- **버그 수정**: 기본 litellm params가 메모리에서 수정되지 않도록 spend tracking 버그를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10167)
- **지원 중단 날짜**: Azure, VertexAI 모델의 지원 중단 날짜를 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10308)

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 사용자 {#users}
- **필터링 및 검색**: 
  - user_id, role, team, sso_id로 사용자를 필터링합니다. 
  - 이메일로 사용자를 검색합니다.

  <br/>

  <Image img={require('../../img/release_notes/user_filters.png')}/>

- **사용자 정보 패널**: 새 사용자 정보 창을 추가했습니다. [PR](https://github.com/BerriAI/litellm/pull/10213)
  - User와 연결된 팀, 키, 모델을 확인합니다. 
  - 사용자 역할과 모델 권한을 편집합니다. 



#### 팀 {#teams}
- **필터링 및 검색**: 
    - Organization, Team ID로 팀을 필터링합니다. [PR](https://github.com/BerriAI/litellm/pull/10324)
    - Team Name으로 팀을 검색합니다. [PR](https://github.com/BerriAI/litellm/pull/10324)

  <br/>

  <Image img={require('../../img/release_notes/team_filters.png')}/>



#### 키 {#keys}
- **키 관리**: 
  - 교차 필터링과 key hash 기준 필터링을 지원합니다. [PR](https://github.com/BerriAI/litellm/pull/10322)
  - 필터를 초기화할 때 key alias가 재설정되는 문제를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10099)
  - 키 생성 시 테이블 렌더링 문제를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10224)

#### UI 로그 페이지 {#ui-로그-page}

- **세션 로그**: UI 세션 로그를 추가했습니다. [시작하기](https://docs.litellm.ai/docs/proxy/ui_logs_sessions)


#### UI 인증 및 보안 {#ui-인증--security}
- **필수 인증**: 이제 모든 대시보드 페이지에 인증이 필요합니다. [PR](https://github.com/BerriAI/litellm/pull/10229)
- **SSO 수정**: SSO 사용자 로그인 시 invalid token 오류를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10298)
- [BETA] **암호화된 토큰**: UI가 암호화된 토큰을 사용하도록 전환했습니다. [PR](https://github.com/BerriAI/litellm/pull/10302)
- **토큰 만료**: 로그인 페이지로 다시 라우팅하여 토큰 갱신을 지원합니다. 만료된 토큰 때문에 빈 페이지가 표시되던 문제를 수정합니다. [PR](https://github.com/BerriAI/litellm/pull/10250)

#### UI 일반 수정 {#ui-general-fixes}
- **UI 깜빡임 수정**: Dashboard의 UI 깜빡임 문제를 해결했습니다. [PR](https://github.com/BerriAI/litellm/pull/10261)
- **용어 개선**: Keys 및 Tools 페이지의 로딩 상태와 데이터 없음 상태 문구를 개선했습니다. [PR](https://github.com/BerriAI/litellm/pull/10253)
- **Azure 모델 지원**: Azure 공개 모델명 편집과 생성 후 모델명 변경 문제를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10249)
- **팀 모델 선택기**: 팀 모델 선택 버그를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10171)


## 로깅 / Guardrail 통합 {#logging--guardrail-integrations}

- **Datadog**:
    1. Datadog LLM 관측성 로깅을 수정했습니다. [시작하기](https://docs.litellm.ai/docs/proxy/logging#datadog), [PR](https://github.com/BerriAI/litellm/pull/10206)
- **`Prometheus` / `Grafana`**: 
    1. LiteLLM Grafana Template에서 datasource 선택을 활성화했습니다. [시작하기](https://docs.litellm.ai/docs/proxy/prometheus#-litellm-maintained-grafana-dashboards-), [PR](https://github.com/BerriAI/litellm/pull/10257)
- **AgentOps**: 
    1. AgentOps 통합을 추가했습니다. [시작하기](https://docs.litellm.ai/docs/observability/agentops_integration), [PR](https://github.com/BerriAI/litellm/pull/9685)
- **Arize**: 
    1. Arize 및 Phoenix 통합에 누락된 attributes를 추가했습니다. [시작하기](https://docs.litellm.ai/docs/observability/arize_integration), [PR](https://github.com/BerriAI/litellm/pull/10215)


## 일반 Proxy 개선 사항 {#general-proxy-improvements}

- **캐싱**: cache key 계산 시 `thinking` 또는 `reasoning_effort`를 반영하도록 캐싱을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10140)
- **Model Groups**: 사용자가 model_info 안에 model_group을 설정한 경우의 처리를 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10191)
- **Passthrough Endpoints**: `PassthroughStandardLoggingPayload`가 method, URL, request/response body와 함께 로깅되도록 보장했습니다. [PR](https://github.com/BerriAI/litellm/pull/10194)
- **SQL Injection 수정**: spend_management_endpoints.py의 잠재적 SQL injection 취약점을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/9878)



## Helm

- migration job의 serviceAccountName을 수정했습니다. [PR](https://github.com/BerriAI/litellm/pull/10258)

## 전체 변경 이력 {#full-변경-이력}

전체 변경 목록은 [GitHub 릴리스 노트](https://github.com/BerriAI/litellm/compare/v1.67.0-stable...v1.67.4-stable)에서 확인할 수 있습니다.
