---
title: v1.65.4-stable
slug: v1.65.4-stable
date: 2025-04-05T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

tags: []
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.65.4-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.65.4.post1
```
</TabItem>
</Tabs>

v1.65.4-stable이 배포되었습니다. v1.65.0-stable 이후의 개선 사항은 다음과 같습니다.

## 주요 하이라이트 {#key-highlights}
- **DB 데드락 방지**: 여러 인스턴스가 동시에 DB에 쓰기 작업을 수행할 때 발생하던 고트래픽 문제를 수정했습니다.
- **새로운 사용법 탭**: 모델별 지출 조회와 날짜 범위 사용자 지정을 지원합니다.

자세히 살펴보겠습니다.

### DB 데드락 방지 {#preventing-db-deadlocks}

<Image img={require('../../img/prevent_deadlocks.jpg')} />

이번 릴리스는 고트래픽(10K+ RPS) 환경에서 사용자가 겪던 DB 데드락 문제를 수정합니다. 이를 통해 해당 규모에서도 사용자/키/팀 지출 추적이 동작할 수 있습니다.

새 아키텍처에 대한 자세한 내용은 [여기](https://docs.litellm.ai/docs/proxy/db_deadlocks)에서 확인하세요.


### 새로운 사용법 탭 {#new-사용법-tab}

<Image img={require('../../img/release_notes/spend_by_model.jpg')} />

새 사용법 탭에서 이제 모델별 일일 지출을 추적할 수 있습니다. 성공한 요청과 토큰 사용량을 함께 확인할 수 있어 지출 추적 또는 토큰 계산 오류를 더 쉽게 찾을 수 있습니다.

직접 테스트하려면 Experimental > New 사용법 > Activity로 이동하세요.


## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}

1. Databricks - claude-3-7-sonnet 비용 추적 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L10350)
2. VertexAI - `gemini-2.5-pro-exp-03-25` 비용 추적 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L4492)
3. VertexAI - `gemini-2.0-flash` 비용 추적 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L4689)
4. Groq - whisper ASR 모델을 모델 비용 맵에 추가 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L3324)
5. IBM - watsonx/ibm/granite-3-8b-instruct를 모델 비용 맵에 추가 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L91)
6. Google AI Studio - gemini/gemini-2.5-pro-preview-03-25를 모델 비용 맵에 추가 [PR](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/model_prices_and_context_window.json#L4850)

## LLM 변환 {#llm-translation}
1. Vertex AI - OpenAI json schema 변환에서 anyOf param 지원 [Get Started](https://docs.litellm.ai/docs/providers/vertex#json-schema)
2. Anthropic - response_format + thinking param 지원(Anthropic API, Bedrock, Vertex 전반에서 동작) [Get Started](https://docs.litellm.ai/docs/reasoning_content)
3. Anthropic - thinking token이 지정되고 max tokens가 지정되지 않은 경우, Anthropic에 전달되는 max token이 thinking tokens보다 크도록 보장(Anthropic API, Bedrock, Vertex 전반에서 동작) [PR](https://github.com/BerriAI/litellm/pull/9594)
4. Bedrock - latency optimized inference 지원 [Get Started](https://docs.litellm.ai/docs/providers/bedrock#usage---latency-optimized-inference)
5. Sagemaker - 응답의 special tokens + multibyte character code 처리 [Get Started](https://docs.litellm.ai/docs/providers/aws_sagemaker)
6. MCP - SSE MCP servers 사용 지원 추가 [Get Started](https://docs.litellm.ai/docs/mcp#usage)
8. Anthropic - passthrough를 통해 Anthropic `/v1/messages`를 호출하는 새 `litellm.messages.create` 인터페이스 [Get Started](https://docs.litellm.ai/docs/anthropic_unified#usage)
11. Anthropic - message param에서 ‘file’ content type 지원(Anthropic API, Bedrock, Vertex 전반에서 동작) [Get Started](https://docs.litellm.ai/docs/providers/anthropic#usage---pdf)
12. Anthropic - openai 'reasoning_effort'를 anthropic 'thinking' param에 매핑(Anthropic API, Bedrock, Vertex 전반에서 동작) [Get Started](https://docs.litellm.ai/docs/providers/anthropic#usage---thinking--reasoning_content)
13. Google AI Studio (Gemini) - [BETA] `/v1/files` 업로드 지원 [Get Started](../../docs/providers/google_ai_studio/files)
14. Azure - o-series tool calling 수정 [Get Started](../../docs/providers/azure#tool-calling--function-calling)
15. Unified file id - [ALPHA] 동일한 file id로 여러 provider를 호출할 수 있도록 허용 [PR](https://github.com/BerriAI/litellm/pull/9718)
    - 실험적 기능이며 프로덕션 사용은 권장하지 않습니다.
    - 다음 주까지 프로덕션 준비가 된 구현을 제공할 계획입니다.
16. Google AI Studio (Gemini) - logprobs 반환 [PR](https://github.com/BerriAI/litellm/pull/9713)
17. Anthropic - Anthropic tool calls에 대한 prompt caching 지원 [Get Started](https://docs.litellm.ai/docs/completion/prompt_caching)
18. OpenRouter - OpenRouter 호출에서 extra body unwrap 처리 [PR](https://github.com/BerriAI/litellm/pull/9747)
19. VertexAI - credential caching 문제 수정 [PR](https://github.com/BerriAI/litellm/pull/9756)
20. XAI - XAI에 대해 'name' param 필터링 [PR](https://github.com/BerriAI/litellm/pull/9761)
21. Gemini - image generation output 지원 [Get Started](../../docs/providers/gemini#image-generation)
22. Databricks - thinking + response_format을 사용하는 claude-3-7-sonnet 지원 [Get Started](../../docs/providers/databricks#usage---thinking--reasoning_content)

## 비용 추적 개선 사항 {#비용-추적-improvements}
1. 안정성 수정 - 비용 계산을 위해 전송된 모델과 수신된 모델 확인 [PR](https://github.com/BerriAI/litellm/pull/9669)
2. Vertex AI - Multimodal embedding 비용 추적 [Get Started](https://docs.litellm.ai/docs/providers/vertex#multi-modal-embeddings), [PR](https://github.com/BerriAI/litellm/pull/9623)

## 관리 엔드포인트 / UI {#management-endpoints--ui}

<Image img={require('../../img/release_notes/new_activity_tab.png')} />

1. 새로운 사용법 탭
    - 'total_tokens' 보고 + 성공/실패 호출 보고
    - 스크롤 시 이중 막대 제거
    - ‘daily spend’ 차트가 가장 이른 날짜부터 가장 늦은 날짜 순서로 정렬되도록 보장
    - 일별 모델별 지출 표시
    - usage tab에 key alias 표시
    - 관리자가 아닌 사용자도 자신의 활동을 볼 수 있도록 허용
    - 새 usage tab에 date picker 추가
2. 가상 키 Tab
    - 사용자 가입 시 'default key' 제거
    - personal key 생성에 사용할 수 있는 사용자 모델 표시 수정
3. Test Key Tab
    - image generation 모델 테스트 허용
4. 모델 Tab
    - 모델 일괄 추가 수정
    - passthrough endpoints에 reusable credentials 지원
    - 팀 멤버가 팀 모델을 볼 수 있도록 허용
5. Teams Tab
    - team metadata 업데이트 시 json serialization error 수정
6. Request 로그 Tab
    - streaming에서 모든 provider에 걸쳐 reasoning_content token tracking 추가
7. API 
    - /user/daily/activity에서 key alias 반환 [Get Started](../../docs/proxy/cost_tracking#daily-spend-breakdown-api)
8. SSO
    - MSFT SSO에서 SSO 사용자를 팀에 할당할 수 있도록 허용 [PR](https://github.com/BerriAI/litellm/pull/9745)

## Logging / Guardrail 통합 {#logging--guardrail-integrations}

1. Console 로그 - uncaught exceptions에 json formatting 추가 [PR](https://github.com/BerriAI/litellm/pull/9619)
2. 가드레일 - virtual key 기반 policies에 AIM 가드레일 지원 [Get Started](../../docs/proxy/guardrails/aim_security)
3. Logging - completion start time tracking 수정 [PR](https://github.com/BerriAI/litellm/pull/9688)
4. Prometheus
    - Prometheus /metrics endpoints에 authentication 추가 허용 [PR](https://github.com/BerriAI/litellm/pull/9766)
    - metric naming에서 LLM Provider Exception과 LiteLLM Exception 구분 [PR](https://github.com/BerriAI/litellm/pull/9760)
    - 새 DB Transaction architecture의 operational metrics 내보내기 [PR](https://github.com/BerriAI/litellm/pull/9719)

## 성능 / 로드밸런싱 / 안정성 개선 사항 {#performance--loadbalancing--reliability-improvements}
1. 데드락 방지
    - spend updates를 Redis에 저장한 다음 DB에 커밋하여 DB Deadlocks 감소 [PR](https://github.com/BerriAI/litellm/pull/9608)
    - DailyUserSpendTransaction 업데이트 시 데드락이 발생하지 않도록 보장 [PR](https://github.com/BerriAI/litellm/pull/9690)
    - 고트래픽 수정 - 새 DB + Redis architecture가 지출을 정확하게 추적하도록 보장 [PR](https://github.com/BerriAI/litellm/pull/9673)
    - PG 대신 Redis를 PodLock Manager에 사용(데드락이 발생하지 않도록 보장) [PR](https://github.com/BerriAI/litellm/pull/9715)
    - v2 DB Deadlock Reduction 아키텍처 - In-Memory Queue의 Max Size + Backpressure Mechanism 추가 [PR](https://github.com/BerriAI/litellm/pull/9759)
    
2. Prisma Migrations [Get Started](../../docs/proxy/prod#9-use-prisma-migrate-deploy)
    - litellm proxy를 litellm의 prisma migration files에 연결
    - 새 `litellm-proxy-extras` sdk의 db schema updates 처리
3. Redis - sync sentinel clients에 password 지원 [PR](https://github.com/BerriAI/litellm/pull/9622)
4. max_parallel_requests = 0일 때 발생하는 "Circular reference detected" 오류 수정 [PR](https://github.com/BerriAI/litellm/pull/9671)
5. Code QA - hardcoded numbers 금지 [PR](https://github.com/BerriAI/litellm/pull/9709)

## Helm
1. fix: chart의 ttlSecondsAfterFinished 들여쓰기 오류 [PR](https://github.com/BerriAI/litellm/pull/9611)

## 일반 Proxy 개선 사항 {#general-proxy-improvements}
1. Fix - service accounts에만 service_account_settings.enforced_params 적용 [PR](https://github.com/BerriAI/litellm/pull/9683)
2. Fix - `/chat/completion`에서 metadata null 처리 [PR](https://github.com/BerriAI/litellm/issues/9717)
3. Fix - daily user transaction logging은 관련이 없으므로 'disable_spend_logs' flag 밖으로 이동 [PR](https://github.com/BerriAI/litellm/pull/9772)

## Demo

데모 인스턴스에서 [오늘](https://docs.litellm.ai/docs/proxy/demo) 사용해 보세요.

## 전체 Git Diff {#complete-git-diff}

v1.65.0-stable 이후의 전체 git diff는 [여기](https://github.com/BerriAI/litellm/releases/tag/v1.65.4-stable)에서 확인할 수 있습니다.
