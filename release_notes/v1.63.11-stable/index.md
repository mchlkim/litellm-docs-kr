---
title: v1.63.11-stable
slug: v1.63.11-stable
date: 2025-03-15T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

tags: [credential management, thinking content, responses api, snowflake]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

`v1.63.2-stable` 이후의 변경 사항입니다.

이번 릴리스는 주로 다음 항목에 집중했습니다.
- [Beta] Responses API 지원
- Snowflake Cortex 지원, Amazon Nova Image Generation
- UI - 자격 증명 관리, 새 모델 추가 시 자격 증명 재사용
- UI - 모델 추가 전 LLM Provider 연결 테스트

## 알려진 문제 {#known-issues}
- 🚨 Azure OpenAI의 알려진 문제 - Azure OpenAI를 사용 중이라면 업그레이드를 권장하지 않습니다. 이 버전은 Azure OpenAI 부하 테스트에 실패했습니다.


## Docker로 LiteLLM Proxy 실행 {#docker-run-litellm-proxy}

```
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.63.11-stable
```

## 데모 인스턴스 {#demo-instance}

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.
- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234



## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

- Amazon Nova Canvas의 Image Generation 지원 [시작하기](https://docs.litellm.ai/docs/providers/bedrock#image-generation)
- Jamba 신규 모델 가격 추가 [PR](https://github.com/BerriAI/litellm/pull/9032/files)
- Amazon EU 모델 가격 추가 [PR](https://github.com/BerriAI/litellm/pull/9056/files)
- Bedrock Deepseek R1 모델 가격 추가 [PR](https://github.com/BerriAI/litellm/pull/9108/files)
- Gemini 가격 업데이트: Gemma 3, Flash 2 thinking 업데이트, 학습LM [PR](https://github.com/BerriAI/litellm/pull/9190/files)
- Cohere Embedding 3 모델을 Multimodal로 표시 [PR](https://github.com/BerriAI/litellm/pull/9176/commits/c9a576ce4221fc6e50dc47cdf64ab62736c9da41)
- Azure Data Zone 가격 추가 [PR](https://github.com/BerriAI/litellm/pull/9185/files#diff-19ad91c53996e178c1921cbacadf6f3bae20cfe062bd03ee6bfffb72f847ee37)
   - LiteLLM은 `azure/eu` 및 `azure/us` 모델의 비용을 추적합니다.



## LLM 변경 사항 {#llm-translation}

<Image img={require('../../img/release_notes/responses_api.png')} />

1. **새 엔드포인트**
- [Beta] POST `/responses` API. [시작하기](https://docs.litellm.ai/docs/response_api)

2. **새 LLM Provider**
- Snowflake Cortex [시작하기](https://docs.litellm.ai/docs/providers/snowflake)

3. **새 LLM 기능**

- streaming에서 OpenRouter `reasoning_content` 지원 [시작하기](https://docs.litellm.ai/docs/reasoning_content)

4. **버그 수정**

- OpenAI: 잘못된 요청 오류에서 `code`, `param`, `type` 반환 [LiteLLM 예외에 대한 자세한 정보](https://docs.litellm.ai/docs/exception_mapping)
- Bedrock: tool use 시 빈 dict만 반환하도록 converse chunk 파싱 수정 [PR](https://github.com/BerriAI/litellm/pull/9166)
- Bedrock: extra_headers 지원 [PR](https://github.com/BerriAI/litellm/pull/9113)
- Azure: Function Calling 버그 수정 및 기본 API 버전을 `2025-02-01-preview`로 업데이트 [PR](https://github.com/BerriAI/litellm/pull/9191)
- Azure: AI services URL 수정 [PR](https://github.com/BerriAI/litellm/pull/9185)
- Vertex AI: 응답에서 HTTP 201 상태 코드 처리 [PR](https://github.com/BerriAI/litellm/pull/9193)
- Perplexity: 잘못된 streaming 응답 수정 [PR](https://github.com/BerriAI/litellm/pull/9081)
- Triton: streaming completions 버그 수정 [PR](https://github.com/BerriAI/litellm/pull/8386)
- Deepgram: transcription용 오디오 파일 처리 시 bytes.IO 지원 [PR](https://github.com/BerriAI/litellm/pull/9071)
- Ollama: "system" role을 사용할 수 없게 된 문제 수정 [PR](https://github.com/BerriAI/litellm/pull/9261)
- 모든 Provider(Streaming): streamed response의 전체 content에서 문자열 `data:`가 제거되는 문제 수정 [PR](https://github.com/BerriAI/litellm/pull/9070)



## 비용 추적 개선 사항 {#비용-추적-improvements}

1. Bedrock converse cache token 추적 지원 [시작하기](https://docs.litellm.ai/docs/completion/prompt_caching)
2. Responses API 비용 추적 [시작하기](https://docs.litellm.ai/docs/response_api)
3. Azure Whisper 비용 추적 수정 [시작하기](https://docs.litellm.ai/docs/audio_transcription)


## UI

### UI에서 자격 증명 재사용 {#re-use-credentials-on-ui}

이제 LiteLLM UI에서 LLM provider 자격 증명을 온보딩할 수 있습니다. 자격 증명을 추가한 후에는 새 모델을 추가할 때 재사용할 수 있습니다. [시작하기](https://docs.litellm.ai/docs/proxy/ui_credentials)

<Image img={require('../../img/release_notes/credentials.jpg')} />


### 모델 추가 전 연결 테스트 {#test-connections-before-adding-models}

모델을 추가하기 전에 LLM provider 연결을 테스트하여 API Base + API Key가 올바르게 설정되었는지 확인할 수 있습니다.

<Image img={require('../../img/release_notes/litellm_test_connection.gif')} />

### 일반 UI 개선 사항 {#general-ui-improvements}
1. 모델 추가 페이지
   - 관리자 UI에서 Cerebras, Sambanova, Perplexity, Fireworks, Openrouter, TogetherAI 모델 및 Text-Completion OpenAI 추가 허용
   - EU OpenAI 모델 추가 허용
   - 수정: 모델 편집 및 삭제를 즉시 표시
2. Keys 페이지
   - 수정: 관리자 UI에서 새로 생성한 key를 즉시 표시(새로고침 불필요)
   - 수정: 사용자 Top API Key 표시 시 Top Keys로 클릭 이동 허용
   - 수정: Team Alias, Key Alias, Org로 key 필터링 허용
   - UI 개선: 페이지당 100개 key 표시, 전체 높이 사용, key alias 너비 확대
3. Users 페이지
   - 수정: Users 페이지에서 internal user key의 정확한 개수 표시
   - 수정: Team UI에서 metadata가 업데이트되지 않는 문제
4. 로그 페이지
   - UI 개선: LiteLLM UI에서 펼친 로그에 포커스 유지
   - UI 개선: 로그 페이지의 사소한 개선
   - 수정: internal user가 자신의 로그를 조회하도록 허용
   - Error 로그의 DB 저장 끄기 허용 [시작하기](https://docs.litellm.ai/docs/proxy/ui_logs)
5. Sign In/Sign Out
   - 수정: 설정된 경우 `PROXY_LOGOUT_URL`을 올바르게 사용 [시작하기](https://docs.litellm.ai/docs/proxy/self_serve#setting-custom-logout-urls)


## 보안 {#security}

1. Master Key 순환 지원 [시작하기](https://docs.litellm.ai/docs/proxy/master_key_rotations)
2. 수정: Internal User Viewer 권한. `internal_user_viewer` role이 `Test Key Page` 또는 `Create Key Button`을 볼 수 없도록 변경 [역할 기반 접근 제어에 대한 자세한 정보](https://docs.litellm.ai/docs/proxy/access_control)
3. 모든 사용자 및 모델 Create/Update/Delete endpoint에서 audit log 내보내기 [시작하기](https://docs.litellm.ai/docs/proxy/multiple_admins)
4. JWT
    - 여러 JWT OIDC provider 지원 [시작하기](https://docs.litellm.ai/docs/proxy/token_auth)
    - team에 All Proxy 모델 access가 할당된 경우 Groups가 있는 JWT access가 작동하지 않는 문제 수정
5. 1개 AWS Secret에서 K/V 쌍 사용 [시작하기](https://docs.litellm.ai/docs/secret#using-kv-pairs-in-1-aws-secret)


## Logging 통합 {#logging-integrations}

1. Prometheus: Azure LLM API latency metric 추적 [시작하기](https://docs.litellm.ai/docs/proxy/prometheus#request-latency-metrics)
2. Athina: Athina로 보낼 수 있는 additional_keys에 tags, user_feedback, model_options 추가 [시작하기](https://docs.litellm.ai/docs/observability/athina_integration)


## 성능 / 안정성 개선 사항 {#performance--reliability-improvements}

1. Redis + litellm router - litellm router의 Redis cluster mode 수정 [PR](https://github.com/BerriAI/litellm/pull/9010)


## 일반 개선 사항 {#general-improvements}

1. OpenWebUI Integration - `thinking` token 표시
- LiteLLM x OpenWebUI 시작 가이드. [시작하기](https://docs.litellm.ai/docs/tutorials/openweb_ui)
- OpenWebUI에서 `thinking` token 표시(Bedrock, Anthropic, Deepseek) [시작하기](https://docs.litellm.ai/docs/tutorials/openweb_ui#render-thinking-content-on-openweb-ui)

<Image img={require('../../img/litellm_thinking_openweb.gif')} />


## 전체 Git Diff {#complete-git-diff}

[전체 git diff 보기](https://github.com/BerriAI/litellm/compare/v1.63.2-stable...v1.63.11-stable)
