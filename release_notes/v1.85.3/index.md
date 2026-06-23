---
title: "v1.85.3 - 관측성, Budget & Rate-Limit Fixes"
slug: "v1-85-3"
date: 2026-06-01T19:02:53
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
docker.litellm.ai/berriai/litellm:1.85.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.85.3
```

</TabItem>
</Tabs>

`v1.85.3` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.85.2`](/release_notes/v1.85.2/v1-85-2). 이 릴리스는 다음 수정 사항을 선별 반영합니다: duplicate Claude Code traces, Bearer-prefix hashing, budget-reset writes, 및 two flag-leak corrections in the rate limiter 및 the provider request body.

### 변경 사항

- fix(logging): Claude Code trace 중복 생성 중지(#29089 내부 반영) - [PR #29311](https://github.com/BerriAI/litellm/pull/29311)
- fix(proxy): safe-hash helper에서 Bearer prefix 정규화 - [PR #29343](https://github.com/BerriAI/litellm/pull/29343)
- fix(budget): reset_budget이 `{spend, budget_reset_at}`만 기록하고 counter를 미리 0으로 만들지 않도록 수정 - [PR #29358](https://github.com/BerriAI/litellm/pull/29358)
- fix(rate-limit): v3 limiter의 internal stash가 provider body로 유출되지 않도록 수정 - [PR #27913](https://github.com/BerriAI/litellm/pull/27913)
- fix(proxy): `use_chat_completions_api` flag가 provider request body로 유출되지 않도록 수정 - [PR #29447](https://github.com/BerriAI/litellm/pull/29447)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.85.2...v1.85.3
