---
title: "v1.84.6 - CrowdStrike AIDR Identity Capture"
slug: "v1-84-6"
date: 2026-06-08T18:25:32
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Yuneng Jiang
    title: Senior Full Stack Engineer, LiteLLM
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
hide_table_of_contents: false
---

## 이 버전 배포

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:1.84.6
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.84.6
```

</TabItem>
</Tabs>

`v1.84.6` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.84.5`](/release_notes/v1.84.5/v1-84-5). 이 릴리스는 다음 수정 사항을 백포트합니다: CrowdStrike AIDR user 및 model metadata capture, 추가로 a follow-up fix 따라서 identity is read from both metadata bags 대신 being dropped 때 a request carries `litellm_metadata`.

### 변경 사항

- feat(guardrails): CrowdStrike AIDR 사용자 및 모델 메타데이터 수집 - [PR #29517](https://github.com/BerriAI/litellm/pull/29517)
- fix(guardrails): 두 metadata bag 모두에서 CrowdStrike AIDR identity를 읽도록 수정 - [PR #29991](https://github.com/BerriAI/litellm/pull/29991)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.84.5...v1.84.6
