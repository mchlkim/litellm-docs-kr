---
title: v1.57.8-stable
slug: v1.57.8-stable
date: 2025-01-11T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [langfuse, humanloop, alerting, prometheus, secret management, management endpoints, ui, prompt management, finetuning, batch]
hide_table_of_contents: false
---

`alerting`, `prometheus`, `secret management`, `management endpoints`, `ui`, `prompt management`, `finetuning`, `batch`


## 신규/업데이트 모델 {#new--updated-모델}

1. Mistral large 가격 - https://github.com/BerriAI/litellm/pull/7452
2. Cohere command-r7b-12-2024 가격 - https://github.com/BerriAI/litellm/pull/7553/files
3. Voyage - 신규 모델, 가격, 컨텍스트 윈도우 정보 - https://github.com/BerriAI/litellm/pull/7472
4. Anthropic - Bedrock claude-3-5-haiku max_output_tokens를 8192로 상향

## 일반 Proxy 개선 사항 {#general-proxy-improvements}

1. realtime 모델의 health check 지원
2. virtual key를 통해 Azure realtime route 호출 지원
3. `/utils/token_counter`에서 custom tokenizer 지원 - 자체 호스팅 모델의 토큰 수를 확인할 때 유용합니다
4. Request Prioritization - `/v1/completion` 엔드포인트에서도 지원

## LLM Translation 개선 사항 {#llm-translation-improvements}

1. Deepgram STT 지원. [여기서 시작](https://docs.litellm.ai/docs/providers/deepgram)
2. OpenAI Moderations - `omni-moderation-latest` 지원. [여기서 시작](https://docs.litellm.ai/docs/moderation)
3. Azure O1 - fake streaming 지원. `stream=true`가 전달되면 응답이 스트리밍되도록 보장합니다. [여기서 시작](https://docs.litellm.ai/docs/providers/azure)
4. Anthropic - 공백이 아닌 문자로 구성된 stop sequence 처리 - [PR](https://github.com/BerriAI/litellm/pull/7484)
5. Azure OpenAI - Entra ID 사용자 이름 + 비밀번호 기반 인증 지원. [여기서 시작](https://docs.litellm.ai/docs/providers/azure#entra-id---use-tenant_id-client_id-client_secret)
6. LM Studio - embedding route 지원. [여기서 시작](https://docs.litellm.ai/docs/providers/lm-studio)
7. WatsonX - ZenAPIKeyAuth 지원. [여기서 시작](https://docs.litellm.ai/docs/providers/watsonx)
    
## Prompt Management 개선 사항 {#prompt-management-improvements}

1. Langfuse 통합
2. HumanLoop 통합
3. 로드 밸런싱된 모델 사용 지원
4. prompt manager에서 optional params 로드 지원

[여기서 시작](https://docs.litellm.ai/docs/proxy/prompt_management)

## Finetuning + Batch APIs 개선 사항 {#finetuning--batch-apis-improvements}

1. Vertex AI finetuning용 통합 엔드포인트 지원 개선 - [PR](https://github.com/BerriAI/litellm/pull/7487)
2. vertex api batch job 조회 지원 추가 - [PR](https://github.com/BerriAI/litellm/commit/13f364682d28a5beb1eb1b57f07d83d5ef50cbdc)

## *NEW* Alerting 통합 {#new-alerting-integration}

PagerDuty Alerting 통합.

두 가지 유형의 알림을 처리합니다.

- 높은 LLM API 실패율. Y초 동안 X건의 실패가 발생하면 알림이 트리거되도록 설정합니다.
- 대량의 지연된 LLM 요청. Y초 동안 X건의 중단 요청이 발생하면 알림이 트리거되도록 설정합니다.


[여기서 시작](https://docs.litellm.ai/docs/proxy/pagerduty)

## Prometheus 개선 사항 {#prometheus-improvements}

custom metric을 기준으로 latency/spend/tokens 추적을 지원합니다. [여기서 시작](https://docs.litellm.ai/docs/proxy/prometheus#beta-custom-metrics)

## *NEW* Hashicorp Secret Manager 지원 {#new-hashicorp-secret-manager-support}

credentials 읽기와 LLM API key 쓰기를 지원합니다. [여기서 시작](https://docs.litellm.ai/docs/secret#hashicorp-vault)

## Management Endpoints / UI 개선 사항 {#management-endpoints--ui-improvements}

1. Proxy UI에서 조직 생성 및 조회, org admin 할당 지원
2. key_alias로 key 삭제 지원
3. UI에서 org에 team 할당 허용
4. 'test key' 창에서 ui session token 사용 비활성화
5. 'test key' 창에 사용된 모델 표시
6. 'test key' 창에서 markdown 출력 지원

## Helm 개선 사항 {#helm-improvements}

1. db migration cron job에 대한 istio injection 방지
2. job 내에서 migrationJob.enabled 변수 사용 허용

## Logging 개선 사항 {#logging-improvements}

1. braintrust logging: project_id를 준수하고 더 많은 metric 추가 - https://github.com/BerriAI/litellm/pull/7613
2. Athina - base url 지원 - `ATHINA_BASE_URL`
3. Lunary - LLM Call에 custom parent run id 전달 허용



## Git Diff {#git-diff}

v1.56.3-stable과 v1.57.8-stable 사이의 diff입니다.

코드베이스 변경 사항을 확인할 때 사용하세요.

[Git Diff](https://github.com/BerriAI/litellm/compare/v1.56.3-stable...189b67760011ea313ca58b1f8bd43aa74fbd7f55)
