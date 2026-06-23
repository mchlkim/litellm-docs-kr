---
title: "v1.89.3 - 가드레일 & Cache-Control Fixes"
slug: "v1-89-3"
date: 2026-06-20T14:45:08
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

:::warning Potential performance regression — under investigation

We're investigating a potential throughput regression affecting recent releases. Correctness 및 error rates are not affected. We're still confirming which versions are impacted 및 a fix — we'll update this note as soon as we have them. For throughput-sensitive workloads, we recommend validating performance in a staging environment 전에 rolling out an upgrade.

:::

## 이 버전 배포

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:1.89.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.89.3
```

</TabItem>
</Tabs>

`v1.89.3` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.89.2`](/release_notes/v1.89.2/v1-89-2). 이 릴리스는 다음 수정 사항을 백포트합니다: guardrail correctness fixes (a single pre-call hook for model-level guardrails, no DB re-init on every poll, 400 instead of 500 때 AIM blocks a request) 및 caps Anthropic cache-control injection at the 4-block limit.

### 변경 사항

- fix(integrations): Anthropic cache_control 삽입을 4개 블록으로 제한 - [PR #30480](https://github.com/BerriAI/litellm/pull/30480)
- fix(guardrails): run pre_call hook once for model-level guardrails - [PR #30543](https://github.com/BerriAI/litellm/pull/30543)
- fix(guardrails): 매 poll마다 DB guardrail을 다시 초기화하지 않도록 수정 - [PR #30542](https://github.com/BerriAI/litellm/pull/30542)
- fix(guardrails): return 400 not 500 때 AIM blocks a request - [PR #30573](https://github.com/BerriAI/litellm/pull/30573)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.89.2...v1.89.3
