---
title: v1.55.8-stable
slug: v1.55.8-stable
date: 2024-12-22T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [langfuse, fallbacks, new models, azure_storage]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

# v1.55.8-stable

새 LiteLLM Stable 릴리스가 [방금 배포되었습니다](https://github.com/BerriAI/litellm/releases/tag/v1.55.8-stable). v1.52.2-stable 이후의 업데이트 5가지를 소개합니다.

`langfuse`, `fallbacks`, `new models`, `azure_storage`

<Image img={require('../../img/langfuse_prmpt_mgmt.png')} />

## Langfuse 프롬프트 관리 {#langfuse-prompt-management}

애플리케이션을 수정하지 않고 Langfuse에서 실험을 실행하거나 특정 모델을 `gpt-4o`에서 `gpt-4o-mini`로 쉽게 변경할 수 있습니다. [시작하기](https://docs.litellm.ai/docs/proxy/prompt_management)

## 클라이언트 측에서 폴백 프롬프트 제어 {#control-fallback-prompts-client-side}

> Claude 프롬프트는 OpenAI와 다릅니다.

폴백을 수행할 때 모델별 프롬프트를 전달합니다. [시작하기](https://docs.litellm.ai/docs/proxy/reliability#control-fallback-prompts)


## 새 제공업체 / 모델 {#new-providers--models}

- [NVIDIA Triton](https://developer.nvidia.com/triton-inference-server) `/infer` 엔드포인트. [시작하기](https://docs.litellm.ai/docs/providers/triton-inference-server)
- [Infinity](https://github.com/michaelfeil/infinity) Rerank 모델. [시작하기](https://docs.litellm.ai/docs/providers/infinity)


## ✨ Azure Data Lake Storage 지원 {#azure-data-lake-storage-support}

LLM 사용량(지출, 토큰) 데이터를 [Azure Data Lake](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)로 전송합니다. 그러면 다른 서비스(예: Databricks)에서 사용량 데이터를 쉽게 소비할 수 있습니다.
 [시작하기](https://docs.litellm.ai/docs/proxy/logging#azure-blob-storage)

## Docker로 LiteLLM 실행 {#docker-run-litellm}

```shell
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:litellm_stable_release_branch-v1.55.8-stable
```

## 일일 업데이트 받기 {#get-daily-updates}

LiteLLM은 매일 새 릴리스를 제공합니다. 일일 업데이트를 받으려면 [LinkedIn에서 팔로우하세요](https://www.linkedin.com/company/berri-ai/).
