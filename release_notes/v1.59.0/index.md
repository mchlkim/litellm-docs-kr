---
title: v1.59.0
slug: v1.59.0
date: 2025-01-17T10:00:00
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

# v1.59.0



:::info

LiteLLM 엔터프라이즈 7일 무료 평가판은 [여기](https://litellm.ai/#trial)에서 시작할 수 있습니다.

**통화는 필요하지 않습니다**

:::

## UI 개선 사항

### [옵트인] 관리자 UI - 메시지 / 응답 보기

이제 관리자 UI에서 메시지와 응답 로그를 볼 수 있습니다.

<Image img={require('../../img/release_notes/ui_logs.png')} />

활성화 방법: `proxy_config.yaml`에 `store_prompts_in_spend_logs: true`를 추가하세요.

이 플래그를 활성화하면 `messages`와 `responses`가 `LiteLLM_Spend_로그` 테이블에 저장됩니다.

```yaml
general_settings:
  store_prompts_in_spend_logs: true
```

## DB 스키마 변경

`LiteLLM_Spend_로그` 테이블에 `messages`와 `responses`가 추가되었습니다.

**기본적으로는 로그로 기록되지 않습니다.** `messages`와 `responses`를 로그로 기록하려면 이 설정으로 옵트인해야 합니다.

```yaml
general_settings:
  store_prompts_in_spend_logs: true
```

