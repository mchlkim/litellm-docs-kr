---
title: v1.56.1
slug: v1.56.1
date: 2024-12-27T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [키 관리, 예산/속도 제한, 로깅, 가드레일]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

# v1.56.1

`키 관리`, `예산/속도 제한`, `로깅`, `가드레일`

:::info

LiteLLM 엔터프라이즈 7일 무료 체험은 [여기](https://litellm.ai/#trial)에서 시작할 수 있습니다.

**통화는 필요하지 않습니다**

:::

## ✨ 예산 / 속도 제한 티어 {#budget--rate-limit-tiers}

속도 제한이 포함된 티어를 정의하고 키에 할당하세요.

많은 키의 액세스와 예산을 함께 제어할 때 사용할 수 있습니다.

**[여기서 시작](https://docs.litellm.ai/docs/proxy/rate_limit_tiers)**

```bash
curl -L -X POST 'http://0.0.0.0:4000/budget/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "budget_id": "high-usage-tier",
    "model_max_budget": {
        "gpt-4o": {"rpm_limit": 1000000}
    }
}'
```


## OTEL 버그 수정 {#otel-bug-fix}

LiteLLM이 litellm_request span을 중복 로깅하던 문제가 수정되었습니다.

[관련 PR](https://github.com/BerriAI/litellm/pull/7435)

## Finetuning 엔드포인트 로깅 {#logging-for-finetuning-endpoints}

이제 finetuning 요청 로그를 모든 로깅 provider(예: Datadog)에서 사용할 수 있습니다.

요청마다 로깅되는 항목:

- file_id
- finetuning_job_id
- 모든 key/team metadata


**여기서 시작:**
- [Finetuning 설정](https://docs.litellm.ai/docs/fine_tuning)
- [로깅 설정](https://docs.litellm.ai/docs/proxy/logging#datadog)

## 가드레일 동적 파라미터 {#dynamic-params-for-guardrails}

이제 각 요청에서 가드레일에 사용자 지정 파라미터(예: 성공 임계값)를 설정할 수 있습니다.

[자세한 내용은 가드레일 사양을 참고하세요](https://docs.litellm.ai/docs/proxy/guardrails/custom_guardrail#-pass-additional-parameters-to-guardrail)









