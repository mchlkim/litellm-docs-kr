---
title: "v1.86.6 - DB Resilience, Passthrough & Dependency Backports"
slug: "v1-86-6"
date: 2026-06-13T17:37:03
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
docker.litellm.ai/berriai/litellm:1.86.6
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.86.6
```

</TabItem>
</Tabs>

`v1.86.6` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.86.5`](/release_notes/v1.86.5/v1-86-5). 이 릴리스는 다음 항목을 반영합니다: the 1.84.8 database-resilience 및 passthrough set onto the 1.86 line, adds the budget-reservation toggle, hardens Anthropic streaming logging, 및 refreshes dependencies.

### 변경 사항

- fix(router): native Azure container ID에 전달된 model_id 사용 - [PR #27921](https://github.com/BerriAI/litellm/pull/27921)
- fix(proxy): Prisma idle/connect timeout 및 추가 DB URL 파라미터 노출 - [PR #28395](https://github.com/BerriAI/litellm/pull/28395)
- feat(proxy): `disable_budget_reservation` general setting 추가 - [PR #29493](https://github.com/BerriAI/litellm/pull/29493)
- fix(proxy): Prisma client를 재연결해 cached-plan 오류에서 복구 - [PR #29983](https://github.com/BerriAI/litellm/pull/29983)
- feat(proxy): DB 조회에서 서버 측 prepared statement를 비활성화하는 옵션 추가 - [PR #29984](https://github.com/BerriAI/litellm/pull/29984)
- fix(proxy): 인증 중 DB 인프라 오류는 5xx로 반환하고, 실제 인증 실패에만 401 사용 - [PR #29986](https://github.com/BerriAI/litellm/pull/29986)
- fix(passthrough): body model을 알 수 없을 때 비용 계산 모델 해석 - [PR #30160](https://github.com/BerriAI/litellm/pull/30160)
- fix(passthrough): Anthropic streaming logging에서 `[DONE]` sentinel과 non-JSON SSE frame 건너뛰기 - [PR #30202](https://github.com/BerriAI/litellm/pull/30202)
- fix(proxy): get_data combined view에서 deprecated-key 조회 결과를 직접 반환 - [PR #30327](https://github.com/BerriAI/litellm/pull/30327)
- chore(deps): pypdf, tornado, aiohttp constraint, vitest, brace-expansion 업데이트 - [PR #30220](https://github.com/BerriAI/litellm/pull/30220)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.86.5...v1.86.6
