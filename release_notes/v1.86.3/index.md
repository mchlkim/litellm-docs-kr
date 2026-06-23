---
title: "v1.86.3 - Gemini 3.5 Flash Day-0 & Pending Line Backports"
slug: "v1-86-3"
date: 2026-06-02T17:31:21
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
docker.litellm.ai/berriai/litellm:1.86.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.86.3
```

</TabItem>
</Tabs>

`v1.86.3` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.86.2`](/release_notes/v1.86.2/v1-86-2). 이 릴리스는 다음 라인과의 차이를 줄입니다: the 1.84 및 1.85 lines: day-0 Gemini 3.5 Flash on Vertex AI 및 Google AI Studio with its paired Vertex tool-call fix, Redis spend-counter seeding, 및 the observability, budget, 및 flag-leak fixes.

### 변경 사항

- feat: Vertex AI 및 Google AI Studio에서 Gemini 3.5 Flash day-0 지원 - [PR #28268](https://github.com/BerriAI/litellm/pull/28268)
- fix(vertex): Gemini 3.5+ tool turn에서 function_call `id` 생략(#28268과 쌍) - [PR #28324](https://github.com/BerriAI/litellm/pull/28324)
- fix(spend): `SET NX`로 Redis spend counter를 seed해 동시 pod가 중복 seed하지 않도록 수정 - [PR #27854](https://github.com/BerriAI/litellm/pull/27854)
- fix(logging): Claude Code trace 중복 생성 및 `_build_passthrough_logging_result` helper 수정 - [PR #29311](https://github.com/BerriAI/litellm/pull/29311)
- fix(proxy): safe-hash helper에서 Bearer prefix 정규화 - [PR #29343](https://github.com/BerriAI/litellm/pull/29343)
- fix(budget): reset_budget이 `{spend, budget_reset_at}`만 기록하도록 수정 - [PR #29358](https://github.com/BerriAI/litellm/pull/29358)
- fix(proxy): `use_chat_completions_api` flag가 provider request body로 유출되지 않도록 수정 - [PR #29447](https://github.com/BerriAI/litellm/pull/29447)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.86.2...v1.86.3
