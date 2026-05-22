---
title: v1.57.7
slug: v1.57.7
date: 2025-01-10T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [langfuse, management endpoints, ui, prometheus, secret management]
hide_table_of_contents: false
---

`langfuse`, `관리 엔드포인트`, `UI`, `prometheus`, `시크릿 관리`

## Langfuse Prompt 관리 {#langfuse-prompt-management}

Langfuse Prompt Management는 BETA로 표시됩니다. 이렇게 하면 받은 피드백을 빠르게 반영하면서 사용자에게 현재 상태를 더 명확하게 알릴 수 있습니다. 이 기능은 다음 달(2025년 2월)까지 안정화될 것으로 예상합니다.

변경 사항:
- LLM API Request에 클라이언트 메시지를 포함합니다. 이전에는 prompt template만 전송되고 클라이언트 메시지는 무시되었습니다.
- 기록된 요청에 prompt template을 로그로 남깁니다(예: s3/langfuse).
- 기록된 요청에 `prompt_id`와 `prompt_variables`를 로그로 남깁니다(예: s3/langfuse).


[여기서 시작](https://docs.litellm.ai/docs/proxy/prompt_management)

## 팀/조직 관리 + UI 개선 {#teamorganization-management--ui-improvements}

이제 UI에서 팀과 조직을 더 쉽게 관리할 수 있습니다.

변경 사항:
- UI에서 팀 내 사용자 역할 편집을 지원합니다.
- API를 통해 팀 멤버 역할을 admin으로 업데이트하는 기능을 지원합니다 - `/team/member_update`
- 팀 관리자에게 해당 팀의 모든 키를 표시합니다.
- 예산이 포함된 조직을 추가합니다.
- UI에서 팀을 조직에 할당할 수 있습니다.
- SSO 사용자를 팀에 자동 할당합니다.

[여기서 시작](https://docs.litellm.ai/docs/proxy/self_serve)

## Hashicorp Vault 지원 {#hashicorp-vault-support}

이제 LiteLLM Virtual API key를 Hashicorp Vault에 쓰는 기능을 지원합니다.

[여기서 시작](https://docs.litellm.ai/docs/proxy/vault)

## 커스텀 Prometheus Metrics {#custom-prometheus-metrics}

커스텀 prometheus metrics를 정의하고, 해당 metrics 기준으로 사용량, 지연 시간, 요청 수를 추적할 수 있습니다.

이를 통해 더 세밀하게 추적할 수 있습니다. 예를 들어 요청 metadata로 전달된 prompt template을 기준으로 추적할 수 있습니다.

[여기서 시작](https://docs.litellm.ai/docs/proxy/prometheus#beta-custom-metrics)
