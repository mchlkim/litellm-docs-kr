---
title: v1.65.0 - 팀 모델 추가 - 업데이트
slug: v1.65.0
date: 2025-03-28T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
tags: [management endpoints, team models, ui]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

v1.65.0에서는 팀 관리자가 아닌 사용자가 팀 모델을 생성하지 못하도록 `/model/new` 엔드포인트를 업데이트했습니다.

즉, 프록시 관리자 또는 팀 관리자만 팀 모델을 생성할 수 있습니다.

## 추가 변경 사항 {#additional-changes}

- 팀 관리자가 `/model/update`를 호출해 팀 모델을 업데이트할 수 있습니다.
- 팀 관리자가 `/model/delete`를 호출해 팀 모델을 삭제할 수 있습니다.
- `/v2/model/info`에 새로운 `user_models_only` 매개변수를 도입했습니다. 이 사용자가 추가한 모델만 반환합니다.


이 변경으로 팀 관리자는 LiteLLM UI와 API에서 자신의 팀용 모델을 추가하고 관리할 수 있습니다.


<Image img={require('../../img/release_notes/team_model_add.png')} />
