---
title: v1.55.10
slug: v1.55.10
date: 2024-12-24T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [batches, guardrails, team management, custom auth]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

# v1.55.10

`batches`, `guardrails`, `team management`, `custom auth`


<Image img={require('../../img/batches_cost_tracking.png')} />

<br/>

:::info

무료 7일 LiteLLM 엔터프라이즈 체험을 여기서 시작하세요. [시작하기](https://www.litellm.ai/enterprise#trial)

**상담 전화는 필요하지 않습니다**

:::

## ✨ Batches API 비용 추적 및 로깅 (`/batches`) {#cost-tracking-logging-for-batches-api-batches}

배치 생성 작업의 비용과 사용량을 추적합니다. [시작하기](https://docs.litellm.ai/docs/batches)

## ✨ `/guardrails/list` 엔드포인트 {#guardrailslist-endpoint}

사용자에게 사용 가능한 가드레일을 표시합니다. [시작하기](https://litellm-api.up.railway.app/#/가드레일)


## ✨ 팀의 모델 추가 허용 {#allow-teams-to-add-models}

팀 관리자가 LiteLLM 프록시를 통해 자체 파인튜닝 모델을 호출할 수 있습니다. [시작하기](https://docs.litellm.ai/docs/proxy/team_model_add)


## ✨ 맞춤 인증용 공통 검사 {#common-checks-for-custom-auth}

맞춤 인증에서 내부 `common_checks` 함수를 호출하는 기능이 이제 엔터프라이즈 기능으로 적용됩니다. 이를 통해 관리자는 맞춤 인증 구현 안에서 LiteLLM의 기본 예산 및 인증 검사를 사용할 수 있습니다. [시작하기](https://docs.litellm.ai/docs/proxy/virtual_keys#custom-auth)


## ✨ 팀 관리자 지정 {#assigning-team-admins}

팀 관리자 기능이 베타를 벗어나 엔터프라이즈 티어로 이동합니다. 이를 통해 프록시 관리자는 다른 사용자가 자신의 팀에 대한 키와 모델을 관리하도록 허용할 수 있습니다. 프로덕션 프로젝트에 유용합니다. [시작하기](https://docs.litellm.ai/docs/proxy/virtual_keys#restricting-key-generation)


