---
title: v1.59.8-stable
slug: v1.59.8-stable
date: 2025-01-31T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [admin ui, logging, db schema]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

# v1.59.8-stable



:::info

LiteLLM 엔터프라이즈 7일 무료 체험판은 [여기](https://litellm.ai/#trial)에서 받을 수 있습니다.

**통화는 필요하지 않습니다**

:::


## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

1. 새로운 OpenAI `/image/variations` endpoint BETA 지원 [문서](../../docs/image_variations)
2. OpenAI `/image/variations` BETA endpoint에서 Topaz API 지원 [문서](../../docs/providers/topaz)
3. Deepseek - reasoning_content가 포함된 r1 지원 ([Deepseek API](../../docs/providers/deepseek#reasoning-models), [Vertex AI](../../docs/providers/vertex#model-garden), [Bedrock](../../docs/providers/bedrock#deepseek)) 
4. Azure - azure o1 pricing 추가 [여기서 보기](https://github.com/BerriAI/litellm/blob/b8b927f23bc336862dacb89f59c784a8d62aaa15/model_prices_and_context_window.json#L952)
5. Anthropic - 비용 계산을 위해 model의 `-latest` tag 처리
6. Gemini-2.0-flash-thinking - model pricing 추가(값은 0.0) [여기서 보기](https://github.com/BerriAI/litellm/blob/b8b927f23bc336862dacb89f59c784a8d62aaa15/model_prices_and_context_window.json#L3393)
7. Bedrock - stability sd3 model pricing 추가 [여기서 보기](https://github.com/BerriAI/litellm/blob/b8b927f23bc336862dacb89f59c784a8d62aaa15/model_prices_and_context_window.json#L6814)  (s/o [Marty Sullivan](https://github.com/marty-sullivan))
8. Bedrock - model cost map에 us.amazon.nova-lite-v1:0 추가 [여기서 보기](https://github.com/BerriAI/litellm/blob/b8b927f23bc336862dacb89f59c784a8d62aaa15/model_prices_and_context_window.json#L5619)
9. TogetherAI - 새로운 together_ai llama3.3 models 추가 [여기서 보기](https://github.com/BerriAI/litellm/blob/b8b927f23bc336862dacb89f59c784a8d62aaa15/model_prices_and_context_window.json#L6985)

## LLM 변환 {#llm-translation}

1. LM Studio -> async embedding call 수정
2. Gpt 4o models - response_format translation 수정
3. Bedrock nova - 지원되는 문서 유형을 .md, .csv 등으로 확장 [여기서 시작](../../docs/providers/bedrock#usage---pdf--document-understanding)
4. Bedrock - bedrock의 IAM role based access 문서 추가 - [여기서 시작](https://docs.litellm.ai/docs/providers/bedrock#sts-role-based-auth)
5. Bedrock - 사용 시 IAM role credentials 캐시
6. Google AI Studio (`gemini/`) - gemini 'frequency_penalty' 및 'presence_penalty' 지원
7. Azure O1 - model name check 수정
8. WatsonX - WatsonX용 ZenAPIKey 지원 [문서](../../docs/providers/watsonx)
9. Ollama Chat - json schema response format 지원 [여기서 시작](../../docs/providers/ollama#json-schema-support)
10. Bedrock - streaming 중 오류가 발생하면 올바른 bedrock status code와 error message 반환
11. Anthropic - anthropic calls에서 nested json schema 지원
12. OpenAI - `metadata` param preview 지원
    1. SDK - `litellm.enable_preview_features = True`로 활성화
    2. PROXY - `litellm_settings::enable_preview_features: true`로 활성화
13. Replicate - status=processing일 때 completion response 재시도

## 비용 추적 개선 {#비용-추적-improvements}

1. Bedrock - 모든 bedrock regional models가 base model과 동일한 `supported_` 값을 갖는지 QA 검증 추가
2. Bedrock - region name이 지정된 경우 bedrock converse cost tracking 수정
3. Spend 로그 reliability 수정 - request body에 전달된 `user`가 string이 아닌 int인 경우
4. 모든 endpoints에서 ‘base_model’ cost tracking이 동작하도록 보장
5. Image generation cost tracking 수정
6. Anthropic - anthropic end user cost tracking 수정
7. JWT / OIDC Auth - jwt auth에서 end user id tracking 추가

## 관리 Endpoints / UI {#management-endpoints--ui}

1. team member가 추가된 뒤 admin이 될 수 있도록 허용(ui + endpoints)
2. UI에서 team membership을 업데이트하는 새 edit/delete button 추가
3. team admin인 경우 모든 team keys 표시
4. Model Hub - models 비용이 1m tokens 기준임을 명확히 표시
5. Invitation Links - 잘못된 url 생성 수정
6. New - Spend로그 Table Viewer - proxy admin이 UI에서 spend logs를 볼 수 있도록 허용
    1. New spend logs - proxy admin이 spend logs table에 request/response logging을 ‘opt in’할 수 있도록 허용하여 abuse detection을 더 쉽게 수행
    2. spend logs에 country of origin 표시
    3. key name/team name 기준 pagination + filtering 추가
7. `/key/delete` - team admin이 team keys를 삭제할 수 있도록 허용
8. Internal User ‘view’ - team 선택 시 spend calculation 수정
9. Model Analytics가 이제 Free에서 제공됨
10. 사용법 page - spend = 0인 날짜를 표시하고 charts의 spend를 2 sig figs로 반올림
11. Public Teams - admins가 새 users가 UI에서 ‘join’할 수 있는 teams를 노출하도록 허용 - [여기서 시작](https://docs.litellm.ai/docs/proxy/public_teams)
12. 가드레일
    1. virtual key에서 guardrails 설정/수정
    2. team에서 guardrails 설정 허용
    3. team create + edit page에서 guardrails 설정
13. `/key/update`에서 temporary budget increases 지원 - 새로운 `temp_budget_increase` 및 `temp_budget_expiry` fields - [여기서 시작](../../docs/proxy/virtual_keys#temporary-budget-increase)
14. key rotation 시 새 key alias를 AWS Secret Manager에 쓰도록 지원 [여기서 시작](../../docs/secret#aws-secret-manager)

## Helm {#helm}

1. migration job에 securityContext 및 pull policy values 추가(s/o https://github.com/Hexoplon)
2. values.yaml에서 envVars를 지정할 수 있도록 허용
3. 새로운 helm lint test

## Logging / Guardrail 통합 {#logging--guardrail-integrations}

1. prompt management를 사용할 때 사용된 prompt를 기록합니다. [여기서 시작](../../docs/proxy/prompt_management)
2. team alias prefixes가 포함된 s3 logging 지원 - [여기서 시작](https://docs.litellm.ai/docs/proxy/logging#team-alias-prefix-in-object-key)
3. Prometheus [여기서 시작](../../docs/proxy/prometheus)
    1. bedrock models에서 litellm_llm_api_time_to_first_token_metric이 채워지지 않는 문제 수정
    2. 정기적으로 remaining team budget metric 방출(call이 없어도 수행) - Grafana 등에서 더 안정적인 metrics 제공
    3. key 및 team level budget metrics 추가
    4. `litellm_overhead_latency_metric` 방출
    5. `litellm_team_budget_reset_at_metric` 및 `litellm_api_key_budget_remaining_hours_metric` 방출
4. Datadog - Datadog에 spend tags logging 지원. [여기서 시작](../../docs/proxy/enterprise#tracking-spend-for-custom-tags)
5. Langfuse - logging request tags 수정, standard logging payload에서 읽기
6. GCS - logging 시 payload를 자르지 않음
7. 새로운 GCS Pub/Sub logging 지원 [여기서 시작](https://docs.litellm.ai/docs/proxy/logging#google-cloud-storage---pubsub-topic)
8. AIM 가드레일 support 추가 [여기서 시작](../../docs/proxy/guardrails/aim_security)

## Security {#security}

1. security vulnerabilities 패치를 위한 새로운 엔터프라이즈 SLA. [여기서 보기](../../docs/enterprise#slas--professional-support)
2. Hashicorp - TLS auth에 vault namespace 사용 지원. [여기서 시작](../../docs/secret#hashicorp-vault)
3. Azure - DefaultAzureCredential 지원

## Health Checks {#health-checks}

1. wildcard route list에서 pricing-only model names 정리 - 잘못된 health checks 방지
2. wildcard routes에 health check model을 지정할 수 있도록 허용 - https://docs.litellm.ai/docs/proxy/health#wildcard-routes
3. 잘못된 model의 health check가 멈춰 pod restarts를 유발하지 않도록 기본 1분 상한의 새로운 ‘health_check_timeout ‘ param 추가. [여기서 시작](../../docs/proxy/health#health-check-timeout)
4. Datadog - data dog service health check 추가 + 새 `/health/services` endpoint 노출. [여기서 시작](../../docs/proxy/health#healthservices)

## 성능 / 안정성 개선 {#performance--reliability-improvements}

1. RPS 3배 증가 - request body 읽기에 orjson 사용
2. LLM Routing 속도 개선 - 캐시된 get model group info 사용
3. SDK 속도 개선 - 캐시된 get model info helper 사용 - model info를 가져오는 CPU 작업 감소
4. Proxy 속도 개선 - request당 request body를 1번만 읽음
5. Infinite loop detection scripts를 codebase에 추가
6. Bedrock - pure async image transformation requests 지원
7. Cooldowns - high traffic에서 calls가 100% 실패하면 single deployment model group 처리 - o1 outage가 다른 calls에 영향을 주지 않도록 방지
8. Response Headers - 반환 항목
    1. `x-litellm-timeout` 
    2. `x-litellm-attempted-retries`
    3. `x-litellm-overhead-duration-ms` 
    4. `x-litellm-response-duration-ms` 
9. proxy에 duplicate callbacks가 추가되지 않도록 보장
10. Requirements.txt - certifi version 상향

## 일반 Proxy 개선 {#general-proxy-improvements}

1. JWT / OIDC Auth - 새로운 `enforce_rbac` param으로 proxy admin이 매핑되지 않았지만 인증된 jwt tokens가 proxy를 호출하지 못하도록 방지할 수 있습니다. [여기서 시작](../../docs/proxy/token_auth#enforce-role-based-access-control-rbac)
2. customized swagger’s용 custom openapi schema generation 수정
3. Request Headers - request headers에서 `x-litellm-timeout` param 읽기 지원. Vercel’s AI SDK + LiteLLM Proxy 사용 시 model timeout control을 활성화합니다. [여기서 시작](../../docs/proxy/request_headers#litellm-headers)
4. JWT / OIDC Auth - model authentication을 위한 새로운 `role` based permissions. [여기서 보기](https://docs.litellm.ai/docs/proxy/jwt_auth_arch)

## 전체 Git Diff {#complete-git-diff}

v1.57.8-stable과 v1.59.8-stable 사이의 diff입니다.

codebase의 변경 사항을 확인할 때 사용하세요.

[**Git Diff**](https://github.com/BerriAI/litellm/compare/v1.57.8-stable...v1.59.8-stable)
