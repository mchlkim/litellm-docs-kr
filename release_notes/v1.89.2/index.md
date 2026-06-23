---
title: "v1.89.2 - Cost Tracking & Model-List Fixes"
slug: "v1-89-2"
date: 2026-06-17T19:22:38
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
docker.litellm.ai/berriai/litellm:1.89.2
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.89.2
```

</TabItem>
</Tabs>

`v1.89.2` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.89.1`](/release_notes/v1.89.1/v1-89-1). 이 릴리스는 다음 영역을 강화합니다: cost tracking around `service_tier`, corrects `/v1/models` listing for team 및 BYOK setups, 및 tightens vector-store access 및 OTEL error reporting.

### 변경 사항

- fix(cost): 문자열이 아닌 `service_tier` 때문에 비용 추적이 조용히 누락되지 않도록 수정 - [PR #30690](https://github.com/BerriAI/litellm/pull/30690)
- fix(anthropic): cost tracking에서 응답 `service_tier` 가격을 계산하고 표시 - [PR #30558](https://github.com/BerriAI/litellm/pull/30558)
- fix(proxy): `/v1/models`에서 public team model name 표시 - [PR #30588](https://github.com/BerriAI/litellm/pull/30588)
- feat(proxy): `GET /v1/models`에 opt-in `healthy_only` 필터 추가 - [PR #30130](https://github.com/BerriAI/litellm/pull/30130)
- fix(proxy): team BYOK deployment에서 list-files 자격 증명 해석 - [PR #30495](https://github.com/BerriAI/litellm/pull/30495)
- fix(proxy): internal role이 vector store CRUD route에 접근할 수 있도록 허용 - [PR #30503](https://github.com/BerriAI/litellm/pull/30503)
- fix(otel): OTEL v2 standard exception event에 전체 오류 메시지 기록 - [PR #30380](https://github.com/BerriAI/litellm/pull/30380)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.89.1...v1.89.2
