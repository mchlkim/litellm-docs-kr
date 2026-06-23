---
title: "v1.88.3 - Guardrail Polling & Hook Fixes"
slug: "v1-88-3"
date: 2026-06-17T12:44:42
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
docker.litellm.ai/berriai/litellm:1.88.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.88.3
```

</TabItem>
</Tabs>

`v1.88.3` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.88.2`](/release_notes/v1.88.2/v1-88-2). 이 릴리스는 다음 문제를 수정합니다: two guardrail regressions: database-backed guardrails were being re-initialized on every poll, 및 model-level guardrails ran their pre-call hook more than once.

### 변경 사항

- fix(guardrails): 매 poll마다 DB guardrail을 다시 초기화하지 않도록 수정 - [PR #30542](https://github.com/BerriAI/litellm/pull/30542)
- fix(guardrails): model-level guardrail에서 `pre_call` hook을 한 번만 실행 - [PR #30543](https://github.com/BerriAI/litellm/pull/30543)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.88.2...v1.88.3
