---
title: "v1.79.0-stable - 검색 API"
slug: "v1-79-0"
date: 2025-10-26T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
hide_table_of_contents: false
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포하기

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.79.0-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.79.0
```

</TabItem>
</Tabs>

---

## 주요 변경 사항

- **Cohere 모델은 이제 기본적으로 Cohere v2 API로 라우팅됩니다** - [PR #15722](https://github.com/BerriAI/litellm/pull/15722)

---

## 주요 하이라이트

- **Search API** - 비용 추적과 함께 Perplexity, Tavily, Parallel AI, Exa AI, DataforSEO, Google PSE를 지원하는 네이티브 `/v1/search` 엔드포인트
- **Vector Stores** - 패스스루 엔드포인트 지원과 함께 LiteLLM을 통해 Vertex AI Search API를 벡터 스토어로 통합
- **가드레일 확장** - 통합 `apply_guardrails` 함수를 통해 Responses API, Image Gen, Text completions, Audio transcriptions, Audio Speech, Rerank, Anthropic Messages API 전반에 가드레일 적용
- **새 가드레일 프로바이더** - Gray Swan, Dynamo AI, IBM 가드레일, Lasso Security v3, Bedrock Guardrail apply_guardrail 엔드포인트 지원
- **Video Generation API** - 비용 추적 및 로깅 지원과 함께 OpenAI Sora-2 및 Azure Sora-2(Pro, Pro-High-Res)를 네이티브로 지원
- **Azure AI Speech (TTS)** - 표준 및 HD 음성 비용 추적을 포함한 네이티브 Azure AI Speech 통합

---

## 새 모델 / 업데이트된 모델

#### 새 모델 지원

| 프로바이더 | 모델 | 컨텍스트 윈도우 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능 |
| -------- | ----- | -------------- | ------------------- | -------------------- | -------- |
| Bedrock | `anthropic.claude-3-7-sonnet-20240620-v1:0` | 200K | $3.60 | $18.00 | 채팅, 추론, 비전, 함수 호출, 프롬프트 캐싱, 컴퓨터 사용 |
| Bedrock GovCloud | `us-gov-west-1/anthropic.claude-3-7-sonnet-20250219-v1:0` | 200K | $3.60 | $18.00 | 채팅, 추론, 비전, 함수 호출, 프롬프트 캐싱, 컴퓨터 사용 |
| Vertex AI | `mistral-medium-3` | 128K | $0.40 | $2.00 | 채팅, 함수 호출, 도구 선택 |
| Vertex AI | `codestral-2` | 128K | $0.30 | $0.90 | 채팅, 함수 호출, 도구 선택 |
| Bedrock | `amazon.titan-image-generator-v1` | - | - | - | 이미지 생성 - $0.008/image, $0.01/premium image |
| Bedrock | `amazon.titan-image-generator-v2` | - | - | - | 이미지 생성 - $0.008/image, $0.01/premium image |
| OpenAI | `sora-2` | - | - | - | 동영상 생성 - $0.10/video/second |
| Azure | `sora-2` | - | - | - | 동영상 생성 - $0.10/video/second |
| Azure | `sora-2-pro` | - | - | - | 동영상 생성 - $0.30/video/second |
| Azure | `sora-2-pro-high-res` | - | - | - | 동영상 생성 - $0.50/video/second |

#### 기능

- **[Anthropic](../../docs/providers/anthropic)**
    - 마지막 항목에만 적용되어야 하는 cache_control이 모든 콘텐츠 항목에 잘못 적용되던 문제 수정 - [PR #15699](https://github.com/BerriAI/litellm/pull/15699)
    - anthropic-beta 헤더를 Bedrock, VertexAI로 전달 - [PR #15700](https://github.com/BerriAI/litellm/pull/15700)
    - claude sonnet에서 max_tokens 값을 max_output_tokens와 일치하도록 변경 - [PR #15715](https://github.com/BerriAI/litellm/pull/15715)

- **[Bedrock](../../docs/providers/bedrock)**
    - AWS us-gov-west-1 Claude 3.7 Sonnet 비용 추가 - [PR #15775](https://github.com/BerriAI/litellm/pull/15775)
    - govcloud의 sonnet 3.7 날짜 수정 - [PR #15800](https://github.com/BerriAI/litellm/pull/15800)
    - 헬스 체크에서 올바른 bedrock 모델 이름 사용 - [PR #15808](https://github.com/BerriAI/litellm/pull/15808)
    - Bedrock Cohere Embed v1에서 embeddings_by_type 응답 형식 지원 - [PR #15707](https://github.com/BerriAI/litellm/pull/15707)
    - 비용 추적을 포함한 titan 이미지 생성 추가 - [PR #15916](https://github.com/BerriAI/litellm/pull/15916)

- **[Gemini](../../docs/providers/gemini)**
    - gemini-2.5-flash-image용 imageConfig 파라미터 추가 - [PR #15530](https://github.com/BerriAI/litellm/pull/15530)
    - 지원 중단된 gemini-1.5-pro-preview-0514 교체 - [PR #15852](https://github.com/BerriAI/litellm/pull/15852)
    - vertex ai gemini 비용 업데이트 - [PR #15911](https://github.com/BerriAI/litellm/pull/15911)

- **[Ollama](../../docs/providers/ollama)**
    - reasoning effort가 minimal/none/disable일 때 'think'를 False로 설정 - [PR #15763](https://github.com/BerriAI/litellm/pull/15763)
    - ollama 청크 파싱 오류 처리 - [PR #15717](https://github.com/BerriAI/litellm/pull/15717)

- **[Vertex AI](../../docs/providers/vertex)**
    - vertex에 mistral medium 3 및 Codestral 2 추가 - [PR #15887](https://github.com/BerriAI/litellm/pull/15887)

- **[Databricks](../../docs/providers/databricks)**
    - Databricks의 Anthropic Claude에서 프롬프트 캐싱 사용 허용 - [PR #15801](https://github.com/BerriAI/litellm/pull/15801)

- **[Azure](../../docs/providers/azure)**
    - Azure AVA TTS 통합 추가 - [PR #15749](https://github.com/BerriAI/litellm/pull/15749)
    - Azure AVA(Speech AI) 비용 추적 추가 - [PR #15754](https://github.com/BerriAI/litellm/pull/15754)
    - Azure AI Speech - `voice`가 요청 본문에서 SSML 본문으로 매핑되도록 보장하고 `role` 및 `style` 전송 허용 - [PR #15810](https://github.com/BerriAI/litellm/pull/15810)
    - 동영상 생성 기능(Sora-2)에 대한 Azure 지원 추가 - [PR #15901](https://github.com/BerriAI/litellm/pull/15901)

- **[OpenAI](../../docs/providers/openai)**
    - OpenAI videos 리팩터링 - [PR #15900](https://github.com/BerriAI/litellm/pull/15900)

- **일반**
    - custom-llm-provider 헤더에서 읽도록 변경 - [PR #15528](https://github.com/BerriAI/litellm/pull/15528)

---

## LLM API 엔드포인트

#### 기능

- **[Responses API](../../docs/response_api)**
    - response 엔드포인트에 gpt 4.1 가격 추가 - [PR #15593](https://github.com/BerriAI/litellm/pull/15593)
    - gemini 사용 시 responses api의 잘못된 status 값 수정 - [PR #15753](https://github.com/BerriAI/litellm/pull/15753)
    - gpt-5-codex의 reasoning item 처리 단순화 - [PR #15815](https://github.com/BerriAI/litellm/pull/15815)
    - OpenAI Responses API가 중첩 오류 구조를 반환할 때 발생하는 ErrorEvent ValidationError 수정 - [PR #15804](https://github.com/BerriAI/litellm/pull/15804)
    - reasoning item ID 자동 생성으로 암호화된 콘텐츠 검증 오류가 발생하던 문제 수정 - [PR #15782](https://github.com/BerriAI/litellm/pull/15782)
    - metadata의 tags 지원 - [PR #15867](https://github.com/BerriAI/litellm/pull/15867)
    - 보안: response.id가 유출된 경우 User A가 User B의 response를 조회하지 못하도록 방지 - [PR #15757](https://github.com/BerriAI/litellm/pull/15757)

- **[Batch API](../../docs/batch_api)**
    - list batches에 pre 및 post call 추가 - [PR #15673](https://github.com/BerriAI/litellm/pull/15673)
    - precall 호출을 담당하는 함수 추가 - [PR #15636](https://github.com/BerriAI/litellm/pull/15636)
    - 객체가 db에 없을 때 발생하는 "User default_user_id does not have access to the object" 수정 - [PR #15873](https://github.com/BerriAI/litellm/pull/15873)

- **[OCR API](../../docs/ocr)**
    - 문서에 Azure AI - OCR 추가 - [PR #15768](https://github.com/BerriAI/litellm/pull/15768)
    - OCR 모델에 mode 및 헬스 체크 지원 추가 - [PR #15767](https://github.com/BerriAI/litellm/pull/15767)

- **[Search API](../../docs/search_api)**
    - Web Search - Perplexity API용 def search() API 추가 - [PR #15769](https://github.com/BerriAI/litellm/pull/15769)
    - Tavily Search API 추가 - [PR #15770](https://github.com/BerriAI/litellm/pull/15770)
    - Parallel AI - Search API 추가 - [PR #15772](https://github.com/BerriAI/litellm/pull/15772)
    - LiteLLM에 EXA AI Search API 추가 - [PR #15774](https://github.com/BerriAI/litellm/pull/15774)
    - LiteLLM Gateway에 /search 엔드포인트 추가 - [PR #15780](https://github.com/BerriAI/litellm/pull/15780)
    - DataforSEO Search API 추가 - [PR #15817](https://github.com/BerriAI/litellm/pull/15817)
    - Google PSE Search Provider 추가 - [PR #15816](https://github.com/BerriAI/litellm/pull/15816)
    - Search API 요청에 대한 비용 추적 추가 - Google PSE, Tavily, Parallel AI, Exa AI - [PR #15821](https://github.com/BerriAI/litellm/pull/15821)
    - Backend: 구성된 Search API를 DB에 저장할 수 있도록 허용 - [PR #15862](https://github.com/BerriAI/litellm/pull/15862)
    - Exa Search API - 요청 params가 Exa AI로 전송되도록 보장 - [PR #15855](https://github.com/BerriAI/litellm/pull/15855)

- **[Vector Stores](../../docs/vector_stores)**
    - LiteLLM을 통해 Vertex AI Search API를 벡터 스토어로 지원 - [PR #15781](https://github.com/BerriAI/litellm/pull/15781)
    - Azure AI - Search Vector Stores - [PR #15873](https://github.com/BerriAI/litellm/pull/15873)
    - VertexAI Search Vector Store - 패스스루 엔드포인트 지원 및 벡터 스토어 검색 비용 추적 지원 - [PR #15824](https://github.com/BerriAI/litellm/pull/15824)
    - 관리 객체를 찾지 못해도 오류를 발생시키지 않도록 변경 - [PR #15873](https://github.com/BerriAI/litellm/pull/15873)
    - UI에 config.yaml vector stores 표시 - [PR #15873](https://github.com/BerriAI/litellm/pull/15873)
    - search spend 비용 추적 - [PR #15859](https://github.com/BerriAI/litellm/pull/15859)

- **[Images API](../../docs/image_generation)**
    - 사용자 정의 headers 및 extra_headers를 image-edit 호출에 전달 - [PR #15811](https://github.com/BerriAI/litellm/pull/15811)

- **[Video Generation API](../../docs/video_generation)**
    - 동영상 생성 기능(Sora-2, Sora-2-Pro, Sora-2-Pro-High-Res)에 대한 Azure 지원 추가 - [PR #15901](https://github.com/BerriAI/litellm/pull/15901)
    - OpenAI 동영상 생성 리팩터링(Sora-2) - [PR #15900](https://github.com/BerriAI/litellm/pull/15900)

- **[Bedrock /invoke](../../docs/bedrock_invoke)**
    - 수정: 누락된 metadata 때문에 /bedrock 패스스루에서 Hooks가 깨지던 문제 - [PR #15849](https://github.com/BerriAI/litellm/pull/15849)

- **[Realtime API](../../docs/realtime_api)**
    - 수정: websockets.exceptions.PayloadTooBig 오류로 OpenAI Realtime API 통합이 실패하던 문제 - [PR #15751](https://github.com/BerriAI/litellm/pull/15751)

---

## 관리 엔드포인트 / UI

#### 기능

- **패스스루**
    - UI에서 패스스루 엔드포인트에 auth 설정 - [PR #15778](https://github.com/BerriAI/litellm/pull/15778)
    - pass-through 엔드포인트 budget enforcement 버그 수정 - [PR #15805](https://github.com/BerriAI/litellm/pull/15805)

- **조직**
    - org admin이 UI에서 team을 만들 수 있도록 허용 - [PR #15924](https://github.com/BerriAI/litellm/pull/15924)

- **검색 도구**
    - UI - Search Tools, UI에서 search tools 추가 및 search 테스트 허용 - [PR #15871](https://github.com/BerriAI/litellm/pull/15871)
    - UI - search providers 로고 추가 - [PR #15872](https://github.com/BerriAI/litellm/pull/15872)

- **일반**
    - custom server root path에 대한 라우팅 수정 - [PR #15701](https://github.com/BerriAI/litellm/pull/15701)

---

## 로깅 / 가드레일 / 프롬프트 관리 통합

#### 기능

- **[OpenTelemetry](../../docs/proxy/logging#opentelemetry)**
    - OpenTelemetry Logging 기능 수정 - [PR #15645](https://github.com/BerriAI/litellm/pull/15645)
    - headers가 올바르게 분할되지 않던 문제 수정 - [PR #15916](https://github.com/BerriAI/litellm/pull/15916)

- **[Sentry](../../docs/proxy/logging#sentry)**
    - Sentry 통합을 위한 SENTRY_ENVIRONMENT 구성 추가 - [PR #15760](https://github.com/BerriAI/litellm/pull/15760)

- **[Helicone](../../docs/proxy/logging#helicone)**
    - metadata에서 OpenTelemetry span을 제거하여 Helicone logging의 JSON 직렬화 오류 수정 - [PR #15728](https://github.com/BerriAI/litellm/pull/15728)

- **[MLFlow](../../docs/proxy/logging#mlflow)**
    - MLFlow tags 수정 - request_tag에 콜론이 있으면 request_tags를 (key, val)로 분할 - [PR #15914](https://github.com/BerriAI/litellm/pull/15914)

- **일반**
    - configured_cold_storage_logger를 cold_storage_custom_logger로 이름 변경 - [PR #15798](https://github.com/BerriAI/litellm/pull/15798)

#### 가드레일

- **[Gray Swan](../../docs/proxy/guardrails)**
    - GraySwan 가드레일 지원 추가 - [PR #15756](https://github.com/BerriAI/litellm/pull/15756)
    - GraySwan을 Gray Swan으로 이름 변경 - [PR #15771](https://github.com/BerriAI/litellm/pull/15771)

- **[Dynamo AI](../../docs/proxy/guardrails)**
    - 새 Guardrail - Dynamo AI Guardrail - [PR #15920](https://github.com/BerriAI/litellm/pull/15920)

- **[IBM 가드레일](../../docs/proxy/guardrails)**
    - IBM 가드레일 통합 - [PR #15924](https://github.com/BerriAI/litellm/pull/15924)

- **[Lasso Security](../../docs/proxy/guardrails)**
    - v3 API 지원 추가 - [PR #12452](https://github.com/BerriAI/litellm/pull/12452)
    - lasso import config 및 테스트 키용 redis cluster hash tags 수정 - [PR #15917](https://github.com/BerriAI/litellm/pull/15917)

- **[Bedrock 가드레일](../../docs/proxy/guardrails)**
    - Bedrock Guardrail apply_guardrail 엔드포인트 지원 구현 - [PR #15892](https://github.com/BerriAI/litellm/pull/15892)

- **일반**
    - 가드레일 - 통합 `apply_guardrails` 함수를 통해 Responses API, Image Gen, Text completions, Audio transcriptions, Audio Speech, Rerank, Anthropic Messages API 지원 - [PR #15706](https://github.com/BerriAI/litellm/pull/15706)

---

## 비용 추적, 예산 및 속도 제한

- **속도 제한**
    - priority_reservation에서 절대 RPM/TPM 지원 - [PR #15813](https://github.com/BerriAI/litellm/pull/15813)
    - org에 할당될 때 org 수준 tpm/rpm limits 및 Team tpm/rpm validation 추가 - [PR #15549](https://github.com/BerriAI/litellm/pull/15549)

---

## MCP Gateway

- **OAuth**
    - MCP Tool Call의 Auth Header 수정 - [PR #15736](https://github.com/BerriAI/litellm/pull/15736)
    - OAuth authorization 엔드포인트에 response_type 및 PKCE 파라미터 추가 - [PR #15720](https://github.com/BerriAI/litellm/pull/15720)

---

## 성능 / 로드밸런싱 / 안정성 개선

- **데이터베이스**
    - deadlock 발생 최소화 - [PR #15281](https://github.com/BerriAI/litellm/pull/15281)

- **Redis**
    - Redis async client에 max_connections 구성 적용 - [PR #15797](https://github.com/BerriAI/litellm/pull/15797)

- **캐싱**
    - `enable_caching_on_provider_specific_optional_params` 설정 문서 추가 - [PR #15885](https://github.com/BerriAI/litellm/pull/15885)

---

## 문서 업데이트

- **프로바이더 문서**
    - worker 권장 사항 업데이트 - [PR #15702](https://github.com/BerriAI/litellm/pull/15702)
    - json mode 문서의 잘못된 request body 수정 - [PR #15729](https://github.com/BerriAI/litellm/pull/15729)
    - 문서에 세부 정보 추가 - [PR #15721](https://github.com/BerriAI/litellm/pull/15721)
    - openai 문서에 responses api 추가 - [PR #15866](https://github.com/BerriAI/litellm/pull/15866)
    - OpenAI responses api 추가 - [PR #15868](https://github.com/BerriAI/litellm/pull/15868)

---

## 새 기여자

* @tlecomte가 [PR #15528](https://github.com/BerriAI/litellm/pull/15528)에서 첫 기여를 했습니다
* @tomhaynes가 [PR #15645](https://github.com/BerriAI/litellm/pull/15645)에서 첫 기여를 했습니다
* @talalryz가 [PR #15720](https://github.com/BerriAI/litellm/pull/15720)에서 첫 기여를 했습니다
* @1vinodsingh1가 [PR #15736](https://github.com/BerriAI/litellm/pull/15736)에서 첫 기여를 했습니다
* @nuernber가 [PR #15775](https://github.com/BerriAI/litellm/pull/15775)에서 첫 기여를 했습니다
* @Thomas-Mildner가 [PR #15760](https://github.com/BerriAI/litellm/pull/15760)에서 첫 기여를 했습니다
* @javiergarciapleo가 [PR #15721](https://github.com/BerriAI/litellm/pull/15721)에서 첫 기여를 했습니다
* @lshgdut가 [PR #15717](https://github.com/BerriAI/litellm/pull/15717)에서 첫 기여를 했습니다
* @kk-wangjifeng가 [PR #15530](https://github.com/BerriAI/litellm/pull/15530)에서 첫 기여를 했습니다
* @anthonyivn2가 [PR #15801](https://github.com/BerriAI/litellm/pull/15801)에서 첫 기여를 했습니다
* @romanglo가 [PR #15707](https://github.com/BerriAI/litellm/pull/15707)에서 첫 기여를 했습니다
* @mythral가 [PR #15859](https://github.com/BerriAI/litellm/pull/15859)에서 첫 기여를 했습니다
* @mubashirosmani가 [PR #15866](https://github.com/BerriAI/litellm/pull/15866)에서 첫 기여를 했습니다
* @CAFxX가 [PR #15281](https://github.com/BerriAI/litellm/pull/15281)에서 첫 기여를 했습니다
* @reflection이 [PR #15914](https://github.com/BerriAI/litellm/pull/15914)에서 첫 기여를 했습니다
* @shadielfares가 [PR #15917](https://github.com/BerriAI/litellm/pull/15917)에서 첫 기여를 했습니다

---

## PR 수 요약

### 10/26/2025
* 새 모델 / 업데이트된 모델: 20
* LLM API 엔드포인트: 29
* 관리 엔드포인트 / UI: 5
* 로깅 / 가드레일 / 프롬프트 관리 통합: 10
* 비용 추적, 예산 및 속도 제한: 2
* MCP Gateway: 2
* 성능 / 로드밸런싱 / 안정성 개선: 3
* 문서 업데이트: 5

---

## 전체 변경 이력

**[GitHub에서 전체 변경 이력 보기](https://github.com/BerriAI/litellm/compare/v1.78.5-stable...v1.79.0-stable)**
