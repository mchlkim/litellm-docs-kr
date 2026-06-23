---
title: "v1.84.7 - Claude Fable 5 & Batch File Authorization"
slug: "v1-84-7"
date: 2026-06-10T18:11:13
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
docker.litellm.ai/berriai/litellm:1.84.7
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.84.7
```

</TabItem>
</Tabs>

`v1.84.7` 는 다음 버전을 기반으로 한 패치 릴리스입니다: [`v1.84.6`](/release_notes/v1.84.6/v1-84-6). 이 릴리스는 다음 항목을 추가합니다: Claude Fable 5 across Anthropic, Bedrock, Vertex AI, 및 Azure AI, 및 authorizes batch files 사용해 the upload `target_model_names`.

### 변경 사항

- feat: Anthropic, Bedrock, Vertex AI, Azure AI 전반에 Claude Fable 5 추가 - [PR #30064](https://github.com/BerriAI/litellm/pull/30064)
- fix(proxy): 업로드된 `target_model_names`를 사용해 batch file을 인가 - [PR #30009](https://github.com/BerriAI/litellm/pull/30009)

## Full 변경 이력

https://github.com/BerriAI/litellm/compare/v1.84.6...v1.84.7
