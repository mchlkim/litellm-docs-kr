---
title: v1.63.14-stable
slug: v1.63.14-stable
date: 2025-03-22T10:00:00
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

`v1.63.11-stable` 이후의 변경 사항입니다.

이번 릴리스에는 다음 내용이 포함됩니다.
- LLM Translation 개선 사항(MCP 지원 및 Bedrock Application Profiles)
- 사용량 기반 Routing 성능 개선
- WebSocket을 통한 스트리밍 guardrail 지원
- Azure OpenAI 클라이언트 성능 수정(이전 릴리스에서 이어짐)

## Docker로 LiteLLM Proxy 실행 {#docker-run-litellm-proxy}

```
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.63.14-stable.patch1
```

## 데모 인스턴스 {#demo-instance}

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.
- 인스턴스: https://demo.litellm.ai/
- 로그인 자격 증명:
    - 사용자 이름: admin
    - 비밀번호: sk-1234



## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

- Azure gpt-4o - 최신 글로벌 가격으로 가격 수정 - [PR](https://github.com/BerriAI/litellm/pull/9361)
- O1-Pro - 가격 및 모델 정보 추가 - [PR](https://github.com/BerriAI/litellm/pull/9397)
- Azure AI - mistral 3.1 small 가격 추가 - [PR](https://github.com/BerriAI/litellm/pull/9453)
- Azure - gpt-4.5-preview 가격 추가 - [PR](https://github.com/BerriAI/litellm/pull/9453)



## LLM Translation {#llm-translation}

1. **새 LLM 기능**

- Bedrock: Bedrock application inference profiles 지원 [문서](https://docs.litellm.ai/docs/providers/bedrock#bedrock-application-inference-profile)
   - Bedrock application profile id에서 aws region 추론 - (`arn:aws:bedrock:us-east-1:...`)
- Ollama - `/v1/completions`를 통한 호출 지원 [시작하기](../../docs/providers/ollama#using-ollama-fim-on-v1completions)
- Bedrock - `us.deepseek.r1-v1:0` 모델명 지원 [문서](../../docs/providers/bedrock#supported-aws-bedrock-models)
- OpenRouter - `OPENROUTER_API_BASE` 환경 변수 지원 [문서](../../docs/providers/openrouter)
- Azure - 오디오 모델 파라미터 지원 추가 - [문서](../../docs/providers/azure#azure-audio-model)
- OpenAI - PDF 파일 지원 [문서](../../docs/completion/document_understanding#openai-file-message-type)
- OpenAI - o1-pro Responses API 스트리밍 지원 [문서](../../docs/response_api#streaming)
- [BETA] MCP - LiteLLM SDK에서 MCP Tools 사용 [문서](../../docs/mcp)

2. **버그 수정**

- Voyage: 임베딩 추적에서 prompt token 수정 - [PR](https://github.com/BerriAI/litellm/commit/56d3e75b330c3c3862dc6e1c51c1210e48f1068e)
- Sagemaker - 'Too little data for declared Content-Length' 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/9326)
- OpenAI-compatible models - `custom_llm_provider`가 설정된 상태로 OpenAI-compatible models 호출 시 발생하는 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/9355)
- VertexAI - Embedding `outputDimensionality` 지원 - [PR](https://github.com/BerriAI/litellm/commit/437dbe724620675295f298164a076cbd8019d304)
- Anthropic - 스트리밍/비스트리밍에서 일관된 json 응답 형식 반환 - [PR](https://github.com/BerriAI/litellm/pull/9437)

## 비용 추적 개선 사항 {#비용-추적-improvements}

- `litellm_proxy/` - 클라이언트 sdk 사용 시 proxy에서 LiteLLM 응답 비용 헤더 읽기 지원
- Reset Budget Job - keys/teams/users에서 예산 재설정 오류 수정 [PR](https://github.com/BerriAI/litellm/pull/9329)
- Streaming - usage가 포함된 최종 청크가 무시되지 않도록 수정(Bedrock 스트리밍 및 비용 추적에 영향) [PR](https://github.com/BerriAI/litellm/pull/9314)


## UI

1. Users Page
   - 기능: 기본 내부 사용자 설정 제어 [PR](https://github.com/BerriAI/litellm/pull/9328)
2. Icons:
   - 기능: 외부 "artificialanalysis.ai" 아이콘을 로컬 svg로 교체 [PR](https://github.com/BerriAI/litellm/pull/9374)
3. Sign In/Sign Out
   - 수정: `default_user_id` 사용자가 DB에 없을 때 기본 로그인 처리 [PR](https://github.com/BerriAI/litellm/pull/9395)


## 로깅 통합 {#logging-integrations}

- 스트리밍 응답에 대한 post-call guardrails 지원 [시작하기](../../docs/proxy/guardrails/custom_guardrail#1-write-a-customguardrail-class)
- Arize [시작하기](../../docs/observability/arize_integration)
   - 잘못된 패키지 import 수정 [PR](https://github.com/BerriAI/litellm/pull/9338)
   - metadata에 standardloggingpayload를 사용하도록 마이그레이션하여 spans가 정상적으로 기록되도록 보장 [PR](https://github.com/BerriAI/litellm/pull/9338)
   - LLM I/O만 로깅하도록 수정 [PR](https://github.com/BerriAI/litellm/pull/9353)
   - 동적 API Key/Space 파라미터 지원 [시작하기](../../docs/observability/arize_integration#pass-arize-spacekey-per-request)
- StandardLoggingPayload - payload에 litellm_model_name 기록. API provider로 전송된 모델을 확인할 수 있음 [시작하기](../../docs/proxy/logging_spec#standardlogginghiddenparams)
- Prompt Management - 커스텀 prompt management 통합을 만들 수 있도록 지원 [시작하기](../../docs/proxy/custom_prompt_management)

## 성능 / 안정성 개선 사항 {#performance--reliability-improvements}

- Redis 캐싱 - 기본 타임아웃 5초 추가. Redis 연결 지연이 LLM 호출에 영향을 주지 않도록 방지 [PR](https://github.com/BerriAI/litellm/commit/db92956ae33ed4c4e3233d7e1b0c7229817159bf)
- 모든 spend 업데이트 / DB 쓰기 비활성화 허용 - 플래그로 DB에 대한 모든 spend 업데이트를 비활성화할 수 있는 패치 [PR](https://github.com/BerriAI/litellm/pull/9331)
- Azure OpenAI - Azure OpenAI 클라이언트를 올바르게 재사용하여 이전 Stable 릴리스의 성능 문제 수정 [PR](https://github.com/BerriAI/litellm/commit/f2026ef907c06d94440930917add71314b901413)
- Azure OpenAI - Azure/OpenAI 클라이언트에서 litellm.ssl_verify 사용 [PR](https://github.com/BerriAI/litellm/commit/f2026ef907c06d94440930917add71314b901413)
- 사용량 기반 routing - 와일드카드 모델 지원 [시작하기](../../docs/proxy/usage_based_routing#wildcard-model-support)
- 사용량 기반 routing - Redis에 증분 값을 배치로 쓰기 지원. 지연 시간을 `simple-shuffle`과 동일한 수준으로 줄임 [PR](https://github.com/BerriAI/litellm/pull/9357)
- Router - 'no healthy deployments available error'에서 모델 cooldown 사유 표시 [PR](https://github.com/BerriAI/litellm/pull/9438)
- 캐싱 - in-memory cache 항목의 최대값 제한 추가(1MB). 큰 image url이 proxy를 통해 전송될 때 OOM 오류 방지 [PR](https://github.com/BerriAI/litellm/pull/9448)


## 일반 개선 사항 {#general-improvements}

- Passthrough Endpoints - pass-through endpoints Response Headers에서 api-base 반환 지원 [문서](../../docs/proxy/response_headers#litellm-specific-headers)
- SSL - 환경 변수에서 ssl security level 읽기 지원. 사용자가 더 낮은 보안 설정을 지정할 수 있음 [시작하기](../../docs/guides/security_settings)
- Credentials - `STORE_MODEL_IN_DB`가 True일 때만 Credentials 테이블 polling [PR](https://github.com/BerriAI/litellm/pull/9376)
- Image URL Handling - image url handling에 대한 새 아키텍처 문서 추가 [문서](../../docs/proxy/image_handling)
- OpenAI - pip install "openai==1.68.2"로 버전 상향 [PR](https://github.com/BerriAI/litellm/commit/e85e3bc52a9de86ad85c3dbb12d87664ee567a5a)
- Gunicorn - 보안 수정 - gunicorn==23.0.0으로 버전 상향 [PR](https://github.com/BerriAI/litellm/commit/7e9fc92f5c7fea1e7294171cd3859d55384166eb)


## 전체 Git Diff {#complete-git-diff}

[전체 git diff 보기](https://github.com/BerriAI/litellm/compare/v1.63.11-stable...v1.63.14.rc)
