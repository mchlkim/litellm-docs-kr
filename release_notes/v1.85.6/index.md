---
title: "v1.85.6 - Database Resilience Backport"
slug: "v1-85-6"
date: 2026-06-13T17:14:49
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
docker.litellm.ai/berriai/litellm:1.85.6
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.85.6
```

</TabItem>
</Tabs>

`v1.85.6` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.85.5`](/release_notes/v1.85.5/v1-85-5). 이 릴리스는 다음 수정 사항을 백포트합니다: the database-resilience set (Prisma reconnection, prepared-statement 및 timeout controls, 5xx on DB infra errors during auth) 및 passthrough logging 및 costing fixes, a routing correction, 및 a dependency bump.

### 변경 사항

- fix(router): native Azure container ID에 전달된 model_id 사용 - [PR #27921](https://github.com/BerriAI/litellm/pull/27921)
- fix(proxy): Prisma idle/connect timeout 및 추가 DB URL 파라미터 노출 - [PR #28395](https://github.com/BerriAI/litellm/pull/28395)
- fix(proxy): Prisma client를 재연결해 cached-plan 오류에서 복구 - [PR #29983](https://github.com/BerriAI/litellm/pull/29983)
- feat(proxy): DB 조회에서 서버 측 prepared statement를 비활성화하는 옵션 추가 - [PR #29984](https://github.com/BerriAI/litellm/pull/29984)
- fix(proxy): 인증 중 DB 인프라 오류가 발생하면 5xx 반환 - [PR #29986](https://github.com/BerriAI/litellm/pull/29986)
- fix(passthrough): body model을 알 수 없을 때 비용 계산 모델 해석 - [PR #30160](https://github.com/BerriAI/litellm/pull/30160)
- fix(passthrough): Anthropic streaming logging에서 `[DONE]` sentinel과 non-JSON SSE frame 건너뛰기 - [PR #30404](https://github.com/BerriAI/litellm/pull/30404)
- fix(proxy): get_data combined view에서 deprecated-key 조회 결과를 직접 반환 - [PR #30327](https://github.com/BerriAI/litellm/pull/30327)
- chore(deps): vitest, brace-expansion, pypdf, tornado 업데이트 - [PR #30220](https://github.com/BerriAI/litellm/pull/30220)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.85.5...v1.85.6
