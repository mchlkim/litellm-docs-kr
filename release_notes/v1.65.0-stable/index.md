---
title: v1.65.0-stable - Model Context Protocol
slug: v1.65.0-stable
date: 2025-03-30T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
tags: [mcp, custom_prompt_management]
hide_table_of_contents: false
---
import Image from '@theme/IdealImage';

v1.65.0-stable이 공개되었습니다. 이번 릴리스의 주요 내용은 다음과 같습니다.
- **MCP 지원**: LiteLLM 프록시에서 MCP 서버를 추가하고 사용할 수 있습니다.
- **1M+ 로그 이후 UI 총 사용량 보기**: DB 로그가 1M+건을 넘어도 사용량 분석을 확인할 수 있습니다. 

## MCP 프로토콜 {#model-context-protocol-mcp}

이번 릴리스에서는 LiteLLM에서 MCP 서버를 중앙에서 추가하는 기능을 지원합니다. MCP 서버 엔드포인트를 추가하면 개발자가 LiteLLM을 통해 MCP 도구를 `list`하고 `call`할 수 있습니다.

MCP에 대한 자세한 내용은 [여기](https://docs.litellm.ai/docs/mcp)에서 확인하세요.

<Image 
  img={require('../../img/release_notes/mcp_ui.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM을 통해 MCP 서버 노출 및 사용
</p>

## 1M+ 로그 이후 UI 총 사용량 보기 {#ui-view-total-usage-after-1m-logs}

이번 릴리스에서는 데이터베이스 로그가 1M+건을 초과해도 총 사용량 분석을 볼 수 있습니다. 집계된 사용량 데이터만 저장하는 확장 가능한 아키텍처를 구현해 쿼리 효율을 크게 높이고 데이터베이스 CPU 사용량을 줄였습니다.


<Image 
  img={require('../../img/release_notes/ui_usage.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  1M+ 로그 이후 총 사용량 보기
</p>


- 작동 방식:
    - 이제 사용량 데이터를 전용 DailyUserSpend 테이블로 집계하여, 로그가 1M+건을 넘어도 쿼리 부하와 CPU 사용량을 크게 줄입니다.

- 일별 지출 세부 분석 API:

    - 단일 엔드포인트로 세부 일별 사용량 데이터(모델, provider, API key 기준)를 조회합니다.
    예제 요청:

    ```shell title="Daily Spend Breakdown API" showLineNumbers
    curl -L -X GET 'http://localhost:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27' \
    -H 'Authorization: Bearer sk-...'
    ```

    ```json title="Daily Spend Breakdown API Response" showLineNumbers
    {
        "results": [
            {
                "date": "2025-03-27",
                "metrics": {
                    "spend": 0.0177072,
                    "prompt_tokens": 111,
                    "completion_tokens": 1711,
                    "total_tokens": 1822,
                    "api_requests": 11
                },
                "breakdown": {
                    "models": {
                        "gpt-4o-mini": {
                            "spend": 1.095e-05,
                            "prompt_tokens": 37,
                            "completion_tokens": 9,
                            "total_tokens": 46,
                            "api_requests": 1
                    },
                    "providers": { "openai": { ... }, "azure_ai": { ... } },
                    "api_keys": { "3126b6eaf1...": { ... } }
                }
            }
        ],
        "metadata": {
            "total_spend": 0.7274667,
            "total_prompt_tokens": 280990,
            "total_completion_tokens": 376674,
            "total_api_requests": 14
        }
    }
    ```




## 신규 모델 / 업데이트된 모델 {#new-모델--updated-모델}
- Vertex AI gemini-2.0-flash-lite 및 Google AI Studio gemini-2.0-flash-lite 지원 [PR](https://github.com/BerriAI/litellm/pull/9523)
- Vertex AI Fine-Tuned LLMs 지원 [PR](https://github.com/BerriAI/litellm/pull/9542)
- Nova Canvas 이미지 생성 지원 [PR](https://github.com/BerriAI/litellm/pull/9525)
- OpenAI gpt-4o-transcribe 지원 [PR](https://github.com/BerriAI/litellm/pull/9517)
- 새로운 Vertex AI 텍스트 임베딩 모델 추가 [PR](https://github.com/BerriAI/litellm/pull/9476)

## LLM 변환 계층 {#llm-translation}
- OpenAI Web Search Tool Call 지원 [PR](https://github.com/BerriAI/litellm/pull/9465)
- Vertex AI topLogprobs 지원 [PR](https://github.com/BerriAI/litellm/pull/9518) 
- Vertex AI multimodal embedding으로 이미지와 동영상 전송 지원 [Doc](https://docs.litellm.ai/docs/providers/vertex#multi-modal-embeddings)
- completion, embedding, image_generation 전반에서 Vertex AI + Gemini용 litellm.api_base 지원 [PR](https://github.com/BerriAI/litellm/pull/9516)
- LiteLLM Proxy와 함께 litellm python SDK를 사용할 때 `response_cost`를 반환하도록 버그 수정 [PR](https://github.com/BerriAI/litellm/commit/6fd18651d129d606182ff4b980e95768fc43ca3d)
- Mistral API의 `max_completion_tokens` 지원 [PR](https://github.com/BerriAI/litellm/pull/9606)
- Vertex AI passthrough routes 리팩터링 - router 모델 추가 시 default_vertex_region 자동 설정으로 발생하던 예측하기 어려운 동작 수정 [PR](https://github.com/BerriAI/litellm/pull/9467)

## 비용 추적 개선 {#비용-추적-improvements}
- spend logs에 'api_base' 기록 [PR](https://github.com/BerriAI/litellm/pull/9509)
- Gemini 오디오 토큰 비용 추적 지원 [PR](https://github.com/BerriAI/litellm/pull/9535)
- OpenAI 오디오 입력 토큰 비용 추적 수정 [PR](https://github.com/BerriAI/litellm/pull/9535)

## UI

### 모델 관리 {#model-management}
- team admins가 UI에서 모델을 추가/업데이트/삭제할 수 있도록 허용 [PR](https://github.com/BerriAI/litellm/pull/9572)
- model hub에 supports_web_search 렌더링 추가 [PR](https://github.com/BerriAI/litellm/pull/9469)

### 요청 로그 {#request-로그}
- request logs에 API base와 model ID 표시 [PR](https://github.com/BerriAI/litellm/pull/9572)
- request logs에서 keyinfo를 볼 수 있도록 허용 [PR](https://github.com/BerriAI/litellm/pull/9568)

### 사용량 탭 {#사용법-tab}
- Daily User Spend Aggregate view 추가 - UI 사용량 탭이 1m rows를 초과해도 동작하도록 지원 [PR](https://github.com/BerriAI/litellm/pull/9538)
- UI를 "LiteLLM_DailyUserSpend" spend table에 연결 [PR](https://github.com/BerriAI/litellm/pull/9603)

## 로깅 통합 {#logging-integrations}
- GCS Pub Sub Logging Integration용 StandardLoggingPayload 수정 [PR](https://github.com/BerriAI/litellm/pull/9508)
- `StandardLoggingPayload`에서 `litellm_model_name` 추적 [문서](https://docs.litellm.ai/docs/proxy/logging_spec#standardlogginghiddenparams)

## 성능 / 안정성 개선 {#performance--reliability-improvements}
- LiteLLM Redis semantic caching 구현 [PR](https://github.com/BerriAI/litellm/pull/9356)
- DB 장애 시 예외를 안정적으로 처리 [PR](https://github.com/BerriAI/litellm/pull/9533)
- DB가 down 상태이고 allow_requests_on_db_unavailable: True일 때 Pods가 startup하고 /health/readiness를 통과하도록 허용 [PR](https://github.com/BerriAI/litellm/pull/9569)


## 일반 개선 사항 {#general-improvements}
- litellm proxy에서 MCP 도구 노출 지원 [PR](https://github.com/BerriAI/litellm/pull/9426)
- /v1/model 엔드포인트 호출을 통해 Gemini, Anthropic, xAI 모델 검색 지원 [PR](https://github.com/BerriAI/litellm/pull/9530)
- JWT auth에서 non-proxy admins에 대한 route check 수정 [PR](https://github.com/BerriAI/litellm/pull/9454)
- 기본 Prisma 데이터베이스 마이그레이션 추가 [PR](https://github.com/BerriAI/litellm/pull/9565)
- /model/info에서 모든 wildcard models 보기 [PR](https://github.com/BerriAI/litellm/pull/9572)


## 보안 {#security}
- UI dashboard에서 next를 14.2.21에서 14.2.25로 업데이트 [PR](https://github.com/BerriAI/litellm/pull/9458)

## 전체 Git Diff {#complete-git-diff}

[전체 git diff는 여기에서 확인할 수 있습니다](https://github.com/BerriAI/litellm/compare/v1.63.14-stable.patch1...v1.65.0-stable)
