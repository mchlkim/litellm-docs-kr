---
title: v1.63.2-stable
slug: v1.63.2-stable
date: 2025-03-08T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGiM7ZrUwqu_Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675971026692?e=1741824000&v=beta&t=eQnRdXPJo4eiINWTZARoYTfqh064pgZ-E21pQTSy8jc
tags: [llm translation, thinking, reasoning_content, claude-3-7-sonnet]
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';


`v1.61.20-stable` 이후 변경 사항입니다.

이번 릴리스는 주로 다음에 집중합니다.
- LLM Translation 개선(더 많은 `thinking` content 개선)
- UI 개선(Error logs를 이제 UI에서 표시)


:::info

이 릴리스는 2025년 3월 9일에 live로 전환됩니다.

::: 

<Image img={require('../../img/release_notes/v1632_release.jpg')} />


## Demo Instance {#demo-instance}

변경 사항을 테스트할 수 있는 Demo Instance입니다.
- Instance: https://demo.litellm.ai/
- Login Credentials:
    - Username: admin
    - Password: sk-1234


## New 모델 / Updated 모델

1. Add `supports_pdf_input` for specific Bedrock Claude models [PR](https://github.com/BerriAI/litellm/commit/f63cf0030679fe1a43d03fb196e815a0f28dae92)
2. Add pricing for amazon `eu` models [PR](https://github.com/BerriAI/litellm/commits/main/model_prices_and_context_window.json)
3. Fix Azure O1 mini pricing [PR](https://github.com/BerriAI/litellm/commit/52de1949ef2f76b8572df751f9c868a016d4832c)

## LLM Translation

<Image img={require('../../img/release_notes/anthropic_thinking.jpg')}/>

1. Support `/openai/` passthrough for Assistant endpoints. [Get Started](https://docs.litellm.ai/docs/pass_through/openai_passthrough)
2. Bedrock Claude - fix tool calling transformation on invoke route. [Get Started](../../docs/providers/bedrock#usage---function-calling--tool-calling)
3. Bedrock Claude - response_format support for claude on invoke route. [Get Started](../../docs/providers/bedrock#usage---structured-output--json-mode)
4. Bedrock - pass `description` if set in response_format. [Get Started](../../docs/providers/bedrock#usage---structured-output--json-mode)
5. Bedrock - Fix passing response_format: `{"type": "text"}`. [PR](https://github.com/BerriAI/litellm/commit/c84b489d5897755139aa7d4e9e54727ebe0fa540)
6. OpenAI - Handle sending image_url as str to openai. [Get Started](https://docs.litellm.ai/docs/completion/vision)
7. Deepseek - return 'reasoning_content' missing on streaming. [Get Started](https://docs.litellm.ai/docs/reasoning_content)
8. 캐싱 - Support caching on reasoning content. [Get Started](https://docs.litellm.ai/docs/proxy/caching)
9. Bedrock - handle thinking blocks in assistant message. [Get Started](https://docs.litellm.ai/docs/providers/bedrock#usage---thinking--reasoning-content)
10. Anthropic - Return `signature` on streaming. [Get Started](https://docs.litellm.ai/docs/providers/bedrock#usage---thinking--reasoning-content)
- Note: We've also migrated from `signature_delta` to `signature`. [Read more](https://docs.litellm.ai/release_notes/v1.63.0)
11. Support format param for specifying image type. [Get Started](../../docs/completion/vision#explicitly-specify-image-type)
12. Anthropic - `/v1/messages` endpoint - `thinking` param support. [Get Started](../../docs/anthropic_unified)
- 참고: [BETA] unified `/v1/messages` endpoint를 Anthropic API에서 바로 동작하도록 리팩터링합니다.
13. Vertex AI - handle $id in response schema when calling vertex ai. [Get Started](https://docs.litellm.ai/docs/providers/vertex#json-schema)

## 비용 추적 개선 {#cost-tracking-improvements}

1. Batches API - Fix cost calculation to run on retrieve_batch. [Get Started](https://docs.litellm.ai/docs/batches)
2. Batches API - Log batch models in spend logs / standard logging payload. [Get Started](../../docs/proxy/logging_spec#standardlogginghiddenparams)

## 관리 엔드포인트 / UI {#management-endpoints--ui}

<Image img={require('../../img/release_notes/error_logs.jpg')} />

1. 가상 키 Page
    - Create Key Page에서 team/org filters를 검색 가능하게 변경
    - Keys table에 created_by 및 updated_by fields 추가
    - key table에 'user_email' 표시
    - 페이지당 100개 Keys 표시, full height 사용, key alias 너비 확대
2. 로그 Page
    - Show Error 로그 on LiteLLM UI
    - Internal Users가 자신의 logs를 볼 수 있도록 허용
3. Internal Users 페이지
    - admin이 internal users의 기본 model access를 제어할 수 있도록 허용
7. cookies 기반 session handling 수정

## Logging / Guardrail 통합 {#logging--guardrail-integrations}

1. Fix prometheus metrics w/ custom metrics, when keys containing team_id make requests. [PR](https://github.com/BerriAI/litellm/pull/8935)

## 성능 / Loadbalancing / Reliability 개선 {#performance--loadbalancing--reliability-improvements}

1. Cooldowns - Support cooldowns on models called with client side credentials. [Get Started](https://docs.litellm.ai/docs/proxy/clientside_auth#pass-user-llm-api-keys--api-base)
2. Tag-based Routing - ensures tag-based routing across all endpoints (`/embeddings`, `/image_generation`, etc.). [Get Started](https://docs.litellm.ai/docs/proxy/tag_routing)

## 일반 Proxy 개선 {#general-proxy-improvements}

1. request에 unknown model이 전달되면 BadRequestError 발생
2. Azure OpenAI proxy route에서 model access restrictions 적용
3. Reliability fix - text 내 emoji 처리로 orjson error 수정
4. Model Access Patch - auth checks 실행 시 litellm.anthropic_models를 덮어쓰지 않음
5. docker image에서 timezone information 설정 지원

## 전체 Git Diff {#complete-git-diff}

[전체 git diff 보기](https://github.com/BerriAI/litellm/compare/v1.61.20-stable...v1.63.2-stable)
