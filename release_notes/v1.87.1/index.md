---
title: "v1.87.1 - Azure AD, Batch Auth & Key Access Backports"
slug: "v1-87-1"
date: 2026-06-03T21:54:19
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
docker.litellm.ai/berriai/litellm:1.87.1
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.87.1
```

</TabItem>
</Tabs>

`v1.87.1` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.87.0`](/release_notes/v1.87.0/v1-87-0). 이 릴리스는 다음 수정 사항을 백포트합니다: five staged fixes: Azure AD token refresh, batch 및 video model routing, org-scoped team key creation, 및 Vertex Claude effort handling. The duplicate passthrough cost-callback fix the other lines received is deliberately held back here, since 1.87.x branched separately 및 carries a different passthrough logging path where that guard does not exist.

### 변경 사항

- fix(azure): v1 OpenAI 클라이언트 경로에서 AD 토큰 갱신을 보존 - [PR #28627](https://github.com/BerriAI/litellm/pull/28627)
- fix(proxy): 제거된 batch `body.model`을 proxy alias로 다시 매핑해 키 접근 검사가 통과되도록 수정 - [PR #29264](https://github.com/BerriAI/litellm/pull/29264)
- fix(proxy): 인증, 예산, 키 검사 전에 관리형 비디오 모델 ID를 router를 통해 해석 - [PR #29545](https://github.com/BerriAI/litellm/pull/29545)
- fix(key_generate): 팀 멤버가 org-scoped team에서 키를 만들 수 있게 수정(v1.84.0-rc.1 이후 회귀) - [PR #29310](https://github.com/BerriAI/litellm/pull/29310)
- fix(vertex): Haiku 4.5처럼 이를 거부하는 Vertex Claude 모델에서 `output_config.effort` 제거 - [PR #29585](https://github.com/BerriAI/litellm/pull/29585)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.87.0...v1.87.1
