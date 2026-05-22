---
title: v1.57.3 - 새 기본 Docker 이미지
slug: v1.57.3
date: 2025-01-08T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [docker image, security, vulnerability]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';

`docker image`, `security`, `vulnerability`

# Critical/High 취약점 0건 {#0-criticalhigh-vulnerabilities}

<Image img={require('../../img/release_notes/security.png')} />

## 변경 사항 {#what-changed}
- LiteLLMBase 이미지가 이제 `cgr.dev/chainguard/python:latest-dev`를 사용합니다.

## 변경 이유 {#why-the-change}

LiteLLM Docker 이미지의 critical/high 취약점을 0건으로 유지하기 위한 변경입니다.

## 마이그레이션 가이드 {#migration-guide}

- litellm을 기본 이미지로 사용하고 `apt-get`을 함께 쓰는 커스텀 Dockerfile을 사용하는 경우

`apt-get` 대신 `apk`를 사용하세요. 기본 litellm 이미지에는 더 이상 `apt-get`이 설치되어 있지 않습니다.

**Dockerfile에서 `apt-get`을 사용하는 경우에만 영향이 있습니다.**
```shell
# Use the provided base image
FROM docker.litellm.ai/berriai/litellm:main-latest

# Set the working directory
WORKDIR /app

# Install dependencies - CHANGE THIS to `apk`
RUN apt-get update && apt-get install -y dumb-init 
```


변경 전
```
RUN apt-get update && apt-get install -y dumb-init
```

변경 후
```
RUN apk update && apk add --no-cache dumb-init
```





