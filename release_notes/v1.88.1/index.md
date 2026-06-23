---
title: "v1.88.1 - Dependency Bumps"
slug: "v1-88-1"
date: 2026-06-08T17:23:56
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
docker.litellm.ai/berriai/litellm:1.88.1
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.88.1
```

</TabItem>
</Tabs>

`v1.88.1` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.88.0`](/release_notes/v1.88.0/v1-88-0). 이 릴리스는 다음 의존성을 업데이트합니다: PyJWT 및 the `ws` override to clear dependency advisories on the 1.88 line.

### 변경 사항

- build(deps): PyJWT를 2.13.0으로, `ws` override를 8.20.1로 업데이트 - [PR #29987](https://github.com/BerriAI/litellm/pull/29987)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.88.0...v1.88.1
