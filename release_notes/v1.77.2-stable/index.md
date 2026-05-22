---
title: "v1.77.2-stable - Bedrock Batches API"
slug: "v1-77-2"
date: 2025-09-13T10:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaffer
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
docker.litellm.ai/berriai/litellm:main-v1.77.2-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.77.2.post1
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **Bedrock Batches API** - LiteLLM의 통합 batch API(OpenAI 호환)를 사용해 Bedrock에서 Batch Inference Jobs를 생성할 수 있습니다.
- **Qwen API Tiered Pricing** - 여러 가격 구간을 사용하는 Dashscope(Qwen) 모델의 비용 추적을 지원합니다.

## 신규 모델 / 업데이트된 모델

#### 신규 모델 지원

| 공급자    | 모델                           | 컨텍스트 창 | 가격 ($/1M 토큰) | 기능 |
| ----------- | ------------------------------- | -------------- | --------------------- | -------- |
| DeepInfra   | `deepinfra/deepseek-ai/DeepSeek-R1` | 164K | **입력:** $0.70<br/>**출력:** $2.40 | 채팅 완성, 도구 호출 |
| Heroku      | `heroku/claude-4-sonnet`        | 8K | 가격은 공급자에 문의하세요. | 함수 호출, 도구 선택 |
| Heroku      | `heroku/claude-3-7-sonnet`      | 8K | 가격은 공급자에 문의하세요. | 함수 호출, 도구 선택 |
| Heroku      | `heroku/claude-3-5-sonnet-latest` | 8K | 가격은 공급자에 문의하세요. | 함수 호출, 도구 선택 |
| Heroku      | `heroku/claude-3-5-haiku`       | 4K | 가격은 공급자에 문의하세요. | 함수 호출, 도구 선택 |
| Dashscope   | `dashscope/qwen-plus-latest`    | 1M | **구간별 가격:**<br/>• 0-256K 토큰: $0.40 / $1.20<br/>• 256K-1M 토큰: $1.20 / $3.60 | 함수 호출, 추론 |
| Dashscope   | `dashscope/qwen3-max-preview`   | 262K | **구간별 가격:**<br/>• 0-32K 토큰: $1.20 / $6.00<br/>• 32K-128K 토큰: $2.40 / $12.00<br/>• 128K-252K 토큰: $3.00 / $15.00 | 함수 호출, 추론 |
| Dashscope   | `dashscope/qwen-flash`          | 1M | **구간별 가격:**<br/>• 0-256K 토큰: $0.05 / $0.40<br/>• 256K-1M 토큰: $0.25 / $2.00 | 함수 호출, 추론 |
| Dashscope   | `dashscope/qwen3-coder-plus`    | 1M | **구간별 가격:**<br/>• 0-32K 토큰: $1.00 / $5.00<br/>• 32K-128K 토큰: $1.80 / $9.00<br/>• 128K-256K 토큰: $3.00 / $15.00<br/>• 256K-1M 토큰: $6.00 / $60.00 | 함수 호출, 추론, 캐싱 |
| Dashscope   | `dashscope/qwen3-coder-flash`   | 1M | **구간별 가격:**<br/>• 0-32K 토큰: $0.30 / $1.50<br/>• 32K-128K 토큰: $0.50 / $2.50<br/>• 128K-256K 토큰: $0.80 / $4.00<br/>• 256K-1M 토큰: $1.60 / $9.60 | 함수 호출, 추론, 캐싱 |

---

#### 기능

- **[Bedrock](../../docs/providers/bedrock_batches)**
    - Bedrock Batches API - 파일 업로드와 요청 변환을 포함한 일괄 처리 지원 - [PR #14518](https://github.com/BerriAI/litellm/pull/14518), [PR #14522](https://github.com/BerriAI/litellm/pull/14522)
- **[VLLM](../../docs/providers/vllm)**
    - transcription 엔드포인트 지원 추가 - [PR #14523](https://github.com/BerriAI/litellm/pull/14523)
- **[Ollama](../../docs/providers/ollama)**
    - `ollama_chat/` - images, thinking, list 형식 content 처리 - [PR #14523](https://github.com/BerriAI/litellm/pull/14523)
- **일반**
    - 상세 요청/응답 로깅을 위한 새 디버그 플래그 추가 [PR #14482](https://github.com/BerriAI/litellm/pull/14482)

#### 버그 수정

- **[Azure OpenAI](../../docs/providers/azure)**
    - 이미지 생성에서 페이로드 거부를 유발하던 extra_body injection 수정 - [PR #14475](https://github.com/BerriAI/litellm/pull/14475)
- **[LM Studio](../../docs/providers/lm-studio)**
    - 잘못된 Bearer 헤더 값 문제 해결 - [PR #14512](https://github.com/BerriAI/litellm/pull/14512)

---

## LLM API 엔드포인트

#### 버그 수정

- **[/messages](../../docs/anthropic_unified)**
    - finish reason과 usage block이 있는 message 뒤에 content block을 보내지 않도록 수정 - [PR #14477](https://github.com/BerriAI/litellm/pull/14477)
- **[/generateContent](../../docs/generateContent)**
    - Gemini CLI Integration - 토큰 수 오류 수정 - [PR #14451](https://github.com/BerriAI/litellm/pull/14451), [PR #14417](https://github.com/BerriAI/litellm/pull/14417)

---

## 비용 추적, 예산 및 속도 제한

#### 기능

- **[Qwen API Tiered Pricing](../../docs/providers/dashscope)** - Dashscope/Qwen 모델을 위한 포괄적인 구간별 비용 추적 추가 - [PR #14471](https://github.com/BerriAI/litellm/pull/14471), [PR #14479](https://github.com/BerriAI/litellm/pull/14479)

#### 버그 수정

- **공급자 예산** - 공급자 예산 계산 수정 - [PR #14459](https://github.com/BerriAI/litellm/pull/14459)

---

## 관리 엔드포인트 / UI

#### 기능

- **사용자 헤더 매핑** - 향상된 사용자 추적을 위한 새 X-LiteLLM Users mapping 기능 - [PR #14485](https://github.com/BerriAI/litellm/pull/14485)
- **키 차단 해제** - `/key/unblock` 엔드포인트에서 해시된 토큰 지원 - [PR #14477](https://github.com/BerriAI/litellm/pull/14477)
- **모델 그룹 헤더 전달** - 문서와 함께 와일드카드 모델 지원 개선 - [PR #14528](https://github.com/BerriAI/litellm/pull/14528)

#### 버그 수정

- **로그 탭 키 별칭** - 실패 로그의 필터링 부정확성 수정 - [PR #14469](https://github.com/BerriAI/litellm/pull/14469), [PR #14529](https://github.com/BerriAI/litellm/pull/14529)

---

## 로깅 / Guardrail 통합

#### 기능

- **Noma 통합** - 입력 익명화 지원을 포함한 비차단 모니터 모드 추가 - [PR #14401](https://github.com/BerriAI/litellm/pull/14401)

---

## 성능 / 로드밸런싱 / 안정성 개선

#### 성능
- 정적 값의 동적 생성 제거 - [PR #14538](https://github.com/BerriAI/litellm/pull/14538)
- 최적의 처리량을 위해 기본적으로 `_PROXY_MaxParallelRequestsHandler_v3` 사용 - [PR #14450](https://github.com/BerriAI/litellm/pull/14450)
- 로깅 작업으로 전달되는 실행 컨텍스트 전파 개선 - [PR #14455](https://github.com/BerriAI/litellm/pull/14455)

---



## 신규 기여자
* @Sameerlite 님이 [PR #14460](https://github.com/BerriAI/litellm/pull/14460)에서 첫 기여를 했습니다.
* @holzman 님이 [PR #14459](https://github.com/BerriAI/litellm/pull/14459)에서 첫 기여를 했습니다.
* @sashank5644 님이 [PR #14469](https://github.com/BerriAI/litellm/pull/14469)에서 첫 기여를 했습니다.
* @TomAlon 님이 [PR #14401](https://github.com/BerriAI/litellm/pull/14401)에서 첫 기여를 했습니다.
* @AlexsanderHamir 님이 [PR #14538](https://github.com/BerriAI/litellm/pull/14538)에서 첫 기여를 했습니다.

---

## **[전체 변경 이력](https://github.com/BerriAI/litellm/compare/v1.77.1.dev.2...v1.77.2.dev)**
