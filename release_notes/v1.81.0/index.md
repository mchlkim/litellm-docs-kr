---
title: "v1.81.0-stable - Claude Code - 모든 제공자에서 Web Search 지원"
slug: "v1-81-0"
date: 2026-01-18T10:00:00
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

## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.81.0-stable
```

</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.81.0
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **Claude Code** - Bedrock, Vertex AI 및 모든 LiteLLM 제공자에서 web search 사용 지원
- **주요 변경 사항** - 안정성 향상을 위한 [이미지 URL 다운로드 50MB 제한](#major-change---chatcompletions-image-url-download-size-limit)
- **성능** - 핫 패스에서 이른 `model.dump()` 호출을 제거해 [CPU 사용량 25% 감소](#performance---25-cpu-usage-reduction)
- **UI의 삭제된 키 감사 테이블** - 삭제 시점의 지출 및 예산 정보와 함께 [감사용으로 삭제된 키와 팀 보기](../../docs/proxy/deleted_keys_teams)

---

## Claude Code - 모든 제공자에서 Web Search 지원 {#claude-code---web-search-across-all-providers}

<Image img={require('../../img/release_notes/claude_code_websearch.png')} />

이번 릴리스는 모든 LiteLLM 제공자(Bedrock, Azure, Vertex AI 등)에서 Claude Code의 web search를 지원하여, AI 코딩 어시스턴트가 실시간 정보를 웹에서 검색할 수 있게 합니다.

즉 이제 Anthropic 네이티브 API뿐 아니라 어떤 제공자에서도 Claude Code의 web search 도구를 사용할 수 있습니다. LiteLLM은 web search 요청을 자동으로 가로채고, 설정된 검색 제공자(Perplexity, Tavily, Exa AI 등)를 사용해 서버 측에서 실행합니다.

Proxy 관리자는 LiteLLM proxy 설정에서 web search 가로채기를 구성해, Bedrock, Azure 또는 지원되는 다른 제공자와 함께 Claude Code를 사용하는 팀에 이 기능을 활성화할 수 있습니다.

[**자세히 알아보기 →**](https://docs.litellm.ai/docs/tutorials/claude_code_websearch)

---

## 주요 변경 사항 - /chat/completions 이미지 URL 다운로드 크기 제한 {#major-change---chatcompletions-image-url-download-size-limit}

안정성을 높이고 메모리 문제를 방지하기 위해, LiteLLM은 이제 기본적으로 이미지 URL 다운로드에 설정 가능한 **50MB 제한**을 포함합니다. 이전에는 이미지 다운로드 제한이 없어 매우 큰 이미지에서 간헐적으로 메모리 문제가 발생할 수 있었습니다.

### 작동 방식 {#how-it-works}

50MB를 초과하는 이미지 URL 요청은 다음과 같은 안내 오류 메시지를 받습니다.

```bash
curl -X POST 'https://your-litellm-proxy.com/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/very-large-image.jpg"
            }
          }
        ]
      }
    ]
  }'
```

**오류 응답:**

```json
{
  "error": {
    "message": "Error: Image size (75.50MB) exceeds maximum allowed size (50.0MB). url=https://example.com/very-large-image.jpg",
    "type": "ImageFetchError"
  }
}
```

### 제한 설정하기 {#configuring-the-limit}

기본 50MB 제한은 대부분의 사용 사례에 적합하지만, 필요한 경우 쉽게 조정할 수 있습니다.

**제한 늘리기(예: 100MB):**

```bash
export MAX_IMAGE_URL_DOWNLOAD_SIZE_MB=100
```

**이미지 URL 다운로드 비활성화(보안 목적):**

```bash
export MAX_IMAGE_URL_DOWNLOAD_SIZE_MB=0
```

**Docker 설정:**

```bash
docker run \
  -e MAX_IMAGE_URL_DOWNLOAD_SIZE_MB=100 \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:v1.81.0
```

**Proxy 설정(config.yaml):**

```yaml
general_settings:
  master_key: sk-1234
  
# Set via environment variable
environment_variables:
  MAX_IMAGE_URL_DOWNLOAD_SIZE_MB: "100"
```

### 이 기능을 추가한 이유 {#why-add-this}

이 기능은 다음을 통해 안정성을 높입니다.
- 매우 큰 이미지로 인한 메모리 문제 방지
- OpenAI의 50MB 페이로드 제한과 정렬
- 이미지 크기를 조기에 검증(Content-Length 헤더가 있는 경우)

---

## 성능 - CPU 사용량 25% 감소 {#performance---25-cpu-usage-reduction}

LiteLLM은 이제 요청 처리의 핫 패스에서 이른 `model.dump()` 호출을 제거해 CPU 사용량을 줄입니다. 이전에는 Pydantic 모델 직렬화가 필요한 시점보다 더 일찍, 더 자주 수행되어 모든 요청에서 불필요한 CPU 오버헤드가 발생했습니다. 실제로 필요한 시점까지 직렬화를 지연함으로써 LiteLLM은 CPU 사용량을 줄이고 높은 부하에서 요청 처리량을 개선합니다.

---

## UI의 삭제된 키 감사 테이블 {#deleted-keys-audit-table-on-ui}

<Image img={require('../../img/ui_deleted_keys_table.png')} />

LiteLLM은 이제 삭제된 API 키와 팀에 대한 포괄적인 감사 테이블을 UI에서 직접 제공합니다. 이 기능을 사용하면 삭제된 키의 지출을 쉽게 추적하고, 연결된 팀 정보를 확인하며, 감사와 컴플라이언스 목적에 맞는 정확한 재무 기록을 유지할 수 있습니다. 테이블에는 키 별칭, 팀 연결, 삭제 시점에 캡처된 지출 정보 등 주요 세부 정보가 표시됩니다. 이 기능 사용 방법에 대한 자세한 내용은 [Deleted Keys & Teams 문서](../../docs/proxy/deleted_keys_teams)를 참조하세요.

---

## 신규 모델 / 업데이트된 모델 {#new-model--updated-model}

#### 신규 모델 지원 {#new-model-support}

| 제공자 | 모델 | 기능 |
| -------- | ----- | -------- |
| OpenAI | `gpt-5.2-codex` | 코드 생성 |
| Azure | `azure/gpt-5.2-codex` | 코드 생성 |
| Cerebras | `cerebras/zai-glm-4.7` | 추론, 함수 호출 |
| Replicate | 모든 채팅 모델 | 모든 Replicate 채팅 모델 전체 지원 |

#### 기능 {#features}

- **[Anthropic](../../docs/providers/anthropic)**
  - 응답에 누락된 anthropic 도구 결과 추가 - [PR #18945](https://github.com/BerriAI/litellm/pull/18945)
  - 멀티턴 대화에서 web_fetch_tool_result 보존 - [PR #18142](https://github.com/BerriAI/litellm/pull/18142)

- **[Gemini](../../docs/providers/gemini)**
  - Google AI Studio에 presence_penalty 지원 추가 - [PR #18154](https://github.com/BerriAI/litellm/pull/18154)
  - generateContent 어댑터에서 extra_headers 전달 - [PR #18935](https://github.com/BerriAI/litellm/pull/18935)
  - detail 매개변수에 medium 값 지원 추가 - [PR #19187](https://github.com/BerriAI/litellm/pull/19187)

- **[Vertex AI](../../docs/providers/vertex)**
  - passthrough 엔드포인트 URL 파싱 및 구성 개선 - [PR #17526](https://github.com/BerriAI/litellm/pull/17526)
  - type 필드가 누락된 도구 스키마에 type 객체 추가 - [PR #19103](https://github.com/BerriAI/litellm/pull/19103)
  - properties가 비어 있을 때 Gemini 스키마의 type 필드 유지 - [PR #18979](https://github.com/BerriAI/litellm/pull/18979)

- **[Bedrock](../../docs/providers/bedrock)**
  - OpenAI 호환 service_tier 매개변수 변환 추가 - [PR #18091](https://github.com/BerriAI/litellm/pull/18091)
  - Bedrock passthrough용 표준 로깅 객체에 사용자 인증 추가 - [PR #19140](https://github.com/BerriAI/litellm/pull/19140)
  - 모델 이름에서 처리량 티어 접미사 제거 - [PR #19147](https://github.com/BerriAI/litellm/pull/19147)

- **[OCI](../../docs/providers/oci)**
  - 멀티모달 메시지에서 OpenAI 스타일 image_url 객체 처리 - [PR #18272](https://github.com/BerriAI/litellm/pull/18272)

- **[Ollama](../../docs/providers/ollama)**
  - finish_reason을 tool_calls로 설정하고 깨진 기능 확인 제거 - [PR #18924](https://github.com/BerriAI/litellm/pull/18924)

- **[Watsonx](../../docs/providers/watsonx/index)**
  - Watsonx 추론에 scope ID 전달 허용 - [PR #18959](https://github.com/BerriAI/litellm/pull/18959)

- **[Replicate](../../docs/providers/replicate)**
  - 모든 Replicate 채팅 모델 지원 추가 - [PR #18954](https://github.com/BerriAI/litellm/pull/18954)

- **[OpenRouter](../../docs/providers/openrouter)**
  - image/generation 엔드포인트에 OpenRouter 지원 추가 - [PR #19059](https://github.com/BerriAI/litellm/pull/19059)

- **[Volcengine](../../docs/providers/volcano)**
  - Volcengine 모델(deepseek-v3-2, glm-4-7, kimi-k2-thinking)에 max_tokens 설정 추가 - [PR #19076](https://github.com/BerriAI/litellm/pull/19076)

- **Azure Model Router**
  - 신규 모델 - LiteLLM AI Gateway의 Azure Model Router - [PR #19054](https://github.com/BerriAI/litellm/pull/19054)

- **GPT-5 모델**
  - GPT-5 모델 변형의 컨텍스트 창 크기 수정 - [PR #18928](https://github.com/BerriAI/litellm/pull/18928)
  - GPT-5 모델의 max_input_tokens 수정 - [PR #19056](https://github.com/BerriAI/litellm/pull/19056)

- **텍스트 완성**
  - 토큰 ID(정수 목록)를 프롬프트로 지원 - [PR #18011](https://github.com/BerriAI/litellm/pull/18011)

### 버그 수정 {#bug-fixes}

- **[Anthropic](../../docs/providers/anthropic)**
  - 메시지에 thinking_blocks가 있을 때 thinking이 누락되지 않도록 수정 - [PR #18929](https://github.com/BerriAI/litellm/pull/18929)
  - thinking 사용 시 anthropic 토큰 카운터 수정 - [PR #19067](https://github.com/BerriAI/litellm/pull/19067)
  - Anthropic 오류 처리 개선 - [PR #18955](https://github.com/BerriAI/litellm/pull/18955)
  - Anthropic 호출 중 오류 수정 - [PR #19060](https://github.com/BerriAI/litellm/pull/19060)

- **[Gemini](../../docs/providers/gemini)**
  - reasoning_effort를 사용하지 않을 때 Gemini 3 Flash의 누락된 `completion_tokens_details` 수정 - [PR #18898](https://github.com/BerriAI/litellm/pull/18898)
  - Gemini Image Generation imageConfig 매개변수 수정 - [PR #18948](https://github.com/BerriAI/litellm/pull/18948)

- **[Vertex AI](../../docs/providers/vertex)**
  - CachedContent 모델 불일치 시 Vertex AI 400 오류 수정 - [PR #19193](https://github.com/BerriAI/litellm/pull/19193)
  - Vertex AI가 구조화된 출력을 지원하지 않는 문제 수정 - [PR #19201](https://github.com/BerriAI/litellm/pull/19201)

- **[Bedrock](../../docs/providers/bedrock)**
  - Claude Code(`/messages`) Bedrock Invoke 사용 및 요청 서명 수정 - [PR #19111](https://github.com/BerriAI/litellm/pull/19111)
  - Bedrock passthrough의 모델 ID 인코딩 수정 - [PR #18944](https://github.com/BerriAI/litellm/pull/18944)
  - thinking 기능에서 max_completion_tokens 준수 - [PR #18946](https://github.com/BerriAI/litellm/pull/18946)
  - Bedrock passthrough의 헤더 전달 수정 - [PR #19007](https://github.com/BerriAI/litellm/pull/19007)
  - Bedrock stability 모델 사용 문제 수정 - [PR #19199](https://github.com/BerriAI/litellm/pull/19199)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[/messages (Claude Code)](../../docs/providers/anthropic)**
  - Azure, Bedrock 및 Anthropic API 전반의 `/messages` API에서 Tool Search 지원 추가 - [PR #19165](https://github.com/BerriAI/litellm/pull/19165)
  - 더 나은 분석과 모니터링을 위해 Claude Code(`/messages`) 최종 사용자 추적 - [PR #19171](https://github.com/BerriAI/litellm/pull/19171)
  - Claude Code(`/messages`)에서 LiteLLM `/search` 엔드포인트를 사용하는 web search 지원 추가 - [PR #19263](https://github.com/BerriAI/litellm/pull/19263), [PR #19294](https://github.com/BerriAI/litellm/pull/19294)

- **[/messages (Claude Code) - Bedrock](../../docs/providers/bedrock)**
  - `/messages`에서 Bedrock Converse와 함께 프롬프트 캐싱 지원 추가 - [PR #19123](https://github.com/BerriAI/litellm/pull/19123)
  - `/messages`에서 예산 토큰이 Bedrock Converse API로 올바르게 전달되도록 보장 - [PR #19107](https://github.com/BerriAI/litellm/pull/19107)

- **[Responses API](../../docs/response_api)**
  - responses API에 캐싱 지원 추가 - [PR #19068](https://github.com/BerriAI/litellm/pull/19068)
  - responses API에 재시도 정책 지원 추가 - [PR #19074](https://github.com/BerriAI/litellm/pull/19074)

- **실시간 API**
  - v1/a2a/message/send 엔드포인트에 비스트리밍 메서드 사용 - [PR #19025](https://github.com/BerriAI/litellm/pull/19025)

- **배치 API**
  - 배치 삭제 및 조회 수정 - [PR #18340](https://github.com/BerriAI/litellm/pull/18340)

#### 버그 {#bugs}

- **일반**
  - responses content가 none일 수 없는 문제 수정 - [PR #19064](https://github.com/BerriAI/litellm/pull/19064)
  - realtime 요청의 query 매개변수에서 모델 이름 수정 - [PR #19135](https://github.com/BerriAI/litellm/pull/19135)
  - 와일드카드 모델의 video status/content 자격 증명 주입 수정 - [PR #18854](https://github.com/BerriAI/litellm/pull/18854)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

**가상 키**
- 감사 목적으로 삭제된 키 보기 - [PR #18228](https://github.com/BerriAI/litellm/pull/18228), [PR #19268](https://github.com/BerriAI/litellm/pull/19268)
- 키 목록에 status 쿼리 매개변수 추가 - [PR #19260](https://github.com/BerriAI/litellm/pull/19260)
- 키 생성 후 키 다시 가져오기 - [PR #18994](https://github.com/BerriAI/litellm/pull/18994)
- 삭제 시 키 목록 새로고침 - [PR #19262](https://github.com/BerriAI/litellm/pull/19262)
- 키 생성 권한 오류 단순화 - [PR #18997](https://github.com/BerriAI/litellm/pull/18997)
- 키 편집 팀 드롭다운에 검색 추가 - [PR #19119](https://github.com/BerriAI/litellm/pull/19119)

**팀 및 조직**
- 감사 목적으로 삭제된 팀 보기 - [PR #18228](https://github.com/BerriAI/litellm/pull/18228), [PR #19268](https://github.com/BerriAI/litellm/pull/19268)
- 조직 테이블에 필터 추가 - [PR #18916](https://github.com/BerriAI/litellm/pull/18916)
- `/organization/list`에 쿼리 매개변수 추가 - [PR #18910](https://github.com/BerriAI/litellm/pull/18910)
- 팀 목록에 status 쿼리 매개변수 추가 - [PR #19260](https://github.com/BerriAI/litellm/pull/19260)
- 내부 사용자에게 본인 지출만 표시 - [PR #19227](https://github.com/BerriAI/litellm/pull/19227)
- 팀 관리자가 팀에서 멤버를 삭제하지 못하도록 방지 허용 - [PR #19128](https://github.com/BerriAI/litellm/pull/19128)
- 팀 멤버 아이콘 버튼 리팩터링 - [PR #19192](https://github.com/BerriAI/litellm/pull/19192)

**모델 + 엔드포인트**
- 공개 모델 허브에 상태 정보 표시 - [PR #19256](https://github.com/BerriAI/litellm/pull/19256), [PR #19258](https://github.com/BerriAI/litellm/pull/19258)
- Anthropic 모델 사용성 개선 - [PR #19058](https://github.com/BerriAI/litellm/pull/19058)
- 재사용 가능한 모델 선택 컴포넌트 생성 - [PR #19164](https://github.com/BerriAI/litellm/pull/19164)
- 설정 모델 드롭다운 편집 - [PR #19186](https://github.com/BerriAI/litellm/pull/19186)
- 모델 허브 클라이언트 측 예외 수정 - [PR #19045](https://github.com/BerriAI/litellm/pull/19045)

**사용량 및 분석**
- 상위 가상 키와 모델에 더 많은 항목 표시 허용 - [PR #19050](https://github.com/BerriAI/litellm/pull/19050)
- 모델 활동 차트의 Y축 수정 - [PR #19055](https://github.com/BerriAI/litellm/pull/19055)
- 내보내기 보고서에 Team ID 및 Team Name 추가 - [PR #19047](https://github.com/BerriAI/litellm/pull/19047)
- Prometheus용 사용자 메트릭 추가 - [PR #18785](https://github.com/BerriAI/litellm/pull/18785)

**SSO 및 인증**
- 사용자 지정 MSFT Base URL 설정 허용 - [PR #18977](https://github.com/BerriAI/litellm/pull/18977)
- env var 속성 이름 재정의 허용 - [PR #18998](https://github.com/BerriAI/litellm/pull/18998)
- SCIM GET /Users 오류 수정 및 SCIM 2.0 준수 적용 - [PR #17420](https://github.com/BerriAI/litellm/pull/17420)
- SCIM 준수 수정용 기능 플래그 - [PR #18878](https://github.com/BerriAI/litellm/pull/18878)

**일반 UI**
- 더 나은 UX를 위해 드롭다운 컴포넌트에 allowClear 추가 - [PR #18778](https://github.com/BerriAI/litellm/pull/18778)
- 커뮤니티 참여 버튼 추가 - [PR #19114](https://github.com/BerriAI/litellm/pull/19114)
- UI 피드백 양식 - why LiteLLM - [PR #18999](https://github.com/BerriAI/litellm/pull/18999)
- 사용자 및 팀 테이블 필터를 재사용 가능한 컴포넌트로 리팩터링 - [PR #19010](https://github.com/BerriAI/litellm/pull/19010)
- new 배지 조정 - [PR #19278](https://github.com/BerriAI/litellm/pull/19278)

#### 버그 {#bugs-1}

- Container API 라우트가 비관리자 사용자에게 401을 반환하는 문제 수정 - openai_routes에 누락된 라우트 - [PR #19115](https://github.com/BerriAI/litellm/pull/19115)
- Containers API에서 리전별 엔드포인트로 라우팅 허용 - [PR #19118](https://github.com/BerriAI/litellm/pull/19118)
- Azure Storage 순환 참조 오류 수정 - [PR #19120](https://github.com/BerriAI/litellm/pull/19120)
- Prisma FieldNotFoundError로 프롬프트 삭제가 실패하는 문제 수정 - [PR #18966](https://github.com/BerriAI/litellm/pull/18966)

---

## AI 통합 {#ai-integrations}

### 로깅 {#logging}

- **[OpenTelemetry](../../docs/proxy/logging#opentelemetry)**
  - semantic conventions를 1.38(gen_ai 속성)로 업데이트 - [PR #18793](https://github.com/BerriAI/litellm/pull/18793)

- **[LangSmith](../../docs/proxy/logging#langsmith)**
  - 스레드 그룹화 메타데이터(session_id, thread) 상향 이동 - [PR #18982](https://github.com/BerriAI/litellm/pull/18982)

- **[Langfuse](../../docs/proxy/logging#langfuse)**
  - Langfuse 콜백 사용 시 JSON 로깅에 Langfuse logger 포함 - [PR #19162](https://github.com/BerriAI/litellm/pull/19162)

- **[Logfire](../../docs/observability/logfire)**
  - env var를 통해 Logfire base URL을 사용자 지정하는 기능 추가 - [PR #19148](https://github.com/BerriAI/litellm/pull/19148)

- **일반 로깅**
  - 설정을 통한 JSON 로깅 활성화 및 회귀 테스트 추가 - [PR #19037](https://github.com/BerriAI/litellm/pull/19037)
  - embeddings 엔드포인트의 헤더 전달 수정 - [PR #18960](https://github.com/BerriAI/litellm/pull/18960)
  - 오류 응답에서 llm_provider-* 헤더 보존 - [PR #19020](https://github.com/BerriAI/litellm/pull/19020)
  - turn_off_message_logging이 proxy_server_request 필드의 요청 메시지를 마스킹하지 않는 문제 수정 - [PR #18897](https://github.com/BerriAI/litellm/pull/18897)

### 가드레일 {#guardrails}

- **[Grayswan](../../docs/proxy/guardrails/grayswan)**
  - fail-open 옵션 구현(기본값: True) - [PR #18266](https://github.com/BerriAI/litellm/pull/18266)

- **[Pangea](../../docs/proxy/guardrails/pangea)**
  - 초기화 중 `default_on` 준수 - [PR #18912](https://github.com/BerriAI/litellm/pull/18912)

- **[Panw Prisma AIRS](../../docs/proxy/guardrails/panw_prisma_airs)**
  - 사용자 지정 위반 메시지 지원 추가 - [PR #19272](https://github.com/BerriAI/litellm/pull/19272)

- **일반 가드레일**
  - SerializationIterator 오류 수정 및 도구를 가드레일에 전달 - [PR #18932](https://github.com/BerriAI/litellm/pull/18932)
  - 사용자 지정 가드레일 매개변수를 올바르게 처리 - [PR #18978](https://github.com/BerriAI/litellm/pull/18978)
  - 차단된 요청에 명확한 오류 메시지 사용 - [PR #19023](https://github.com/BerriAI/litellm/pull/19023)
  - responses API에서 가드레일 moderation 지원 - [PR #18957](https://github.com/BerriAI/litellm/pull/18957)
  - 모델 수준 가드레일이 적용되지 않는 문제 수정 - [PR #18895](https://github.com/BerriAI/litellm/pull/18895)

---

## 비용 추적, 예산 및 속도 제한 {#cost-tracking-budgets-and-rate-limiting}

- **비용 계산 수정**
  - Gemini 모델 비용 계산에 IMAGE 토큰 수 포함 - [PR #18876](https://github.com/BerriAI/litellm/pull/18876)
  - 이미지와 함께 캐시 사용 시 음수 text_tokens 수정 - [PR #18768](https://github.com/BerriAI/litellm/pull/18768)
  - `/images/generations`의 이미지 토큰 지출 로깅 수정 - [PR #19009](https://github.com/BerriAI/litellm/pull/19009)
  - Gemini Image Generation의 잘못된 `prompt_tokens_details` 수정 - [PR #19070](https://github.com/BerriAI/litellm/pull/19070)
  - 대소문자 구분 없는 모델 비용 맵 조회 수정 - [PR #18208](https://github.com/BerriAI/litellm/pull/18208)

- **가격 업데이트**
  - `openrouter/openai/gpt-oss-20b` 가격 수정 - [PR #18899](https://github.com/BerriAI/litellm/pull/18899)
  - `azure_ai/claude-opus-4-5` 가격 추가 - [PR #19003](https://github.com/BerriAI/litellm/pull/19003)
  - Novita 모델 가격 업데이트 - [PR #19005](https://github.com/BerriAI/litellm/pull/19005)
  - Azure Grok 가격 수정 - [PR #19102](https://github.com/BerriAI/litellm/pull/19102)
  - GCP GLM-4.7 가격 수정 - [PR #19172](https://github.com/BerriAI/litellm/pull/19172)
  - DeepSeek chat/reasoner를 V3.2 가격에 동기화 - [PR #18884](https://github.com/BerriAI/litellm/pull/18884)
  - gemini-2.5-pro 모델의 cache_read 가격 수정 - [PR #18157](https://github.com/BerriAI/litellm/pull/18157)

- **예산 및 속도 제한**
  - 팀 멤버의 예산 제한 검증 연산자(>=) 수정 - [PR #19207](https://github.com/BerriAI/litellm/pull/19207)
  - 우선순위 큐 로직을 보장해 TPM 25% 제한 수정 - [PR #19092](https://github.com/BerriAI/litellm/pull/19092)
  - 지출 로그 cron 검증, 수정 및 문서 정리 - [PR #19085](https://github.com/BerriAI/litellm/pull/19085)

---

## MCP Gateway {#mcp-gateway}

- 중복 MCP reload scheduler 등록 방지 - [PR #18934](https://github.com/BerriAI/litellm/pull/18934)
- MCP extra headers를 대소문자 구분 없이 전달 - [PR #18940](https://github.com/BerriAI/litellm/pull/18940)
- MCP REST 인증 확인 수정 - [PR #19051](https://github.com/BerriAI/litellm/pull/19051)
- responses에서 telemetry 이벤트가 두 개 생성되는 문제 수정 - [PR #18938](https://github.com/BerriAI/litellm/pull/18938)
- MCP chat completions 수정 - [PR #19129](https://github.com/BerriAI/litellm/pull/19129)

---

## 성능 / 로드 밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

- **성능 개선**
  - 높은 부하에서 높은 CPU 사용량과 오버헤드를 유발하는 병목 제거 - [PR #19049](https://github.com/BerriAI/litellm/pull/19049)
  - 성능 회귀 방지를 위해 `_get_model_cost_key`의 O(1) 연산을 CI에서 강제 - [PR #19052](https://github.com/BerriAI/litellm/pull/19052)
  - 연결 누수를 방지하고 올바른 router cooldown을 보장하도록 Azure embeddings JSON 파싱 수정 - [PR #19167](https://github.com/BerriAI/litellm/pull/19167)
  - `disable_token_counter`가 활성화된 경우 토큰 카운터로 fallback하지 않음 - [PR #19041](https://github.com/BerriAI/litellm/pull/19041)

- **안정성**
  - fallback 엔드포인트 지원 추가 - [PR #19185](https://github.com/BerriAI/litellm/pull/19185)
  - stream_timeout 매개변수 기능 수정 - [PR #19191](https://github.com/BerriAI/litellm/pull/19191)
  - 설정의 모델 매칭 우선순위 수정 - [PR #19012](https://github.com/BerriAI/litellm/pull/19012)
  - 설정에 따라 litellm_params의 num_retries 수정 - [PR #18975](https://github.com/BerriAI/litellm/pull/18975)
  - response 매개변수가 없는 예외 처리 - [PR #18919](https://github.com/BerriAI/litellm/pull/18919)

- **인프라**
  - boto3 클라이언트에 사용자 지정 CA 인증서 추가 - [PR #18942](https://github.com/BerriAI/litellm/pull/18942)
  - boto3를 1.40.15로, aioboto3를 15.5.0으로 업데이트 - [PR #19090](https://github.com/BerriAI/litellm/pull/19090)
  - Gunicorn에서 keepalive_timeout 매개변수가 작동하도록 수정 - [PR #19087](https://github.com/BerriAI/litellm/pull/19087)

- **Helm Chart**
  - Helm chart에서 config.yaml을 단일 파일로 마운트하도록 수정 - [PR #19146](https://github.com/BerriAI/litellm/pull/19146)
  - Helm chart 버전을 프로덕션 표준 및 Docker 버전과 동기화 - [PR #18868](https://github.com/BerriAI/litellm/pull/18868)

---

## 데이터베이스 변경 사항 {#database-changes}

### 스키마 업데이트 {#schema-updates}

| 테이블 | 변경 유형 | 설명 | PR |
| ----- | ----------- | ----------- | -- |
| `LiteLLM_ProxyModelTable` | 새 컬럼 | `created_at` 및 `updated_at` 타임스탬프 필드 추가 | [PR #18937](https://github.com/BerriAI/litellm/pull/18937) |

---

## 문서 업데이트 {#documentation-updates}

- LiteLLM 아키텍처 md 문서 추가 - [PR #19057](https://github.com/BerriAI/litellm/pull/19057), [PR #19252](https://github.com/BerriAI/litellm/pull/19252)
- 문제 해결 가이드 추가 - [PR #19096](https://github.com/BerriAI/litellm/pull/19096), [PR #19097](https://github.com/BerriAI/litellm/pull/19097), [PR #19099](https://github.com/BerriAI/litellm/pull/19099)
- CPU 및 메모리 문제용 구조화된 이슈 보고 가이드 추가 - [PR #19117](https://github.com/BerriAI/litellm/pull/19117)
- 고트래픽 배포에 대한 Redis 요구사항 경고 추가 - [PR #18892](https://github.com/BerriAI/litellm/pull/18892)
- enable_pre_call_checks로 로드 밸런싱 및 라우팅 업데이트 - [PR #18888](https://github.com/BerriAI/litellm/pull/18888)
- guided 매개변수로 pass_through 업데이트 - [PR #18886](https://github.com/BerriAI/litellm/pull/18886)
- 메시지 content types 링크 업데이트 및 content types 테이블 추가 - [PR #18209](https://github.com/BerriAI/litellm/pull/18209)
- kwargs를 사용한 Redis 초기화 추가 - [PR #19183](https://github.com/BerriAI/litellm/pull/19183)
- SAP Gen AI Hub를 통한 LLM 호출 라우팅 문서 개선 - [PR #19166](https://github.com/BerriAI/litellm/pull/19166)
- 삭제된 키 및 팀 문서 - [PR #19291](https://github.com/BerriAI/litellm/pull/19291)
- Claude Code 최종 사용자 추적 가이드 - [PR #19176](https://github.com/BerriAI/litellm/pull/19176)
- MCP 문제 해결 가이드 추가 - [PR #19122](https://github.com/BerriAI/litellm/pull/19122)
- auth message UI 문서 추가 - [PR #19063](https://github.com/BerriAI/litellm/pull/19063)
- Helm/K8s에서 사용자 지정 콜백을 마운트하는 가이드 추가 - [PR #19136](https://github.com/BerriAI/litellm/pull/19136)

---

## 버그 수정 {#bug-fixes-1}

- OpenAPI 스키마의 server_root_path로 인한 Swagger UI path execute 오류 수정 - [PR #18947](https://github.com/BerriAI/litellm/pull/18947)
- Pydantic serializer 경고를 방지하도록 OpenAI SDK BaseModel choices/messages 정규화 - [PR #18972](https://github.com/BerriAI/litellm/pull/18972)
- 문맥 기반 간격 검사 및 단어 형태 숫자 추가 - [PR #18301](https://github.com/BerriAI/litellm/pull/18301)
- repository root의 고아 파일 정리 - [PR #19150](https://github.com/BerriAI/litellm/pull/19150)
- non-root에 proxy/prisma_migration.py 포함 - [PR #18971](https://github.com/BerriAI/litellm/pull/18971)
- prisma_migration.py 업데이트 - [PR #19083](https://github.com/BerriAI/litellm/pull/19083)

---

## 신규 기여자 {#new-contributors}

* @yogeshwaran10 님이 [PR #18898](https://github.com/BerriAI/litellm/pull/18898)에서 첫 기여를 했습니다
* @theonlypal 님이 [PR #18937](https://github.com/BerriAI/litellm/pull/18937)에서 첫 기여를 했습니다
* @jonmagic 님이 [PR #18935](https://github.com/BerriAI/litellm/pull/18935)에서 첫 기여를 했습니다
* @houdataali 님이 [PR #19025](https://github.com/BerriAI/litellm/pull/19025)에서 첫 기여를 했습니다
* @hummat 님이 [PR #18972](https://github.com/BerriAI/litellm/pull/18972)에서 첫 기여를 했습니다
* @berkeyalciin 님이 [PR #18966](https://github.com/BerriAI/litellm/pull/18966)에서 첫 기여를 했습니다
* @MateuszOssGit 님이 [PR #18959](https://github.com/BerriAI/litellm/pull/18959)에서 첫 기여를 했습니다
* @xfan001 님이 [PR #18947](https://github.com/BerriAI/litellm/pull/18947)에서 첫 기여를 했습니다
* @nulone 님이 [PR #18884](https://github.com/BerriAI/litellm/pull/18884)에서 첫 기여를 했습니다
* @debnil-mercor 님이 [PR #18919](https://github.com/BerriAI/litellm/pull/18919)에서 첫 기여를 했습니다
* @hakhundov 님이 [PR #17420](https://github.com/BerriAI/litellm/pull/17420)에서 첫 기여를 했습니다
* @rohanwinsor 님이 [PR #19078](https://github.com/BerriAI/litellm/pull/19078)에서 첫 기여를 했습니다
* @pgolm 님이 [PR #19020](https://github.com/BerriAI/litellm/pull/19020)에서 첫 기여를 했습니다
* @vikigenius 님이 [PR #19148](https://github.com/BerriAI/litellm/pull/19148)에서 첫 기여를 했습니다
* @burnerburnerburnerman 님이 [PR #19090](https://github.com/BerriAI/litellm/pull/19090)에서 첫 기여를 했습니다
* @yfge 님이 [PR #19076](https://github.com/BerriAI/litellm/pull/19076)에서 첫 기여를 했습니다
* @danielnyari-seon 님이 [PR #19083](https://github.com/BerriAI/litellm/pull/19083)에서 첫 기여를 했습니다
* @guilherme-segantini 님이 [PR #19166](https://github.com/BerriAI/litellm/pull/19166)에서 첫 기여를 했습니다
* @jgreek 님이 [PR #19147](https://github.com/BerriAI/litellm/pull/19147)에서 첫 기여를 했습니다
* @anand-kamble 님이 [PR #19193](https://github.com/BerriAI/litellm/pull/19193)에서 첫 기여를 했습니다
* @neubig 님이 [PR #19162](https://github.com/BerriAI/litellm/pull/19162)에서 첫 기여를 했습니다

---

## 전체 변경 이력 {#full-changelog}

**[GitHub에서 전체 변경 이력 보기](https://github.com/BerriAI/litellm/compare/v1.80.15.rc.1...v1.81.0.rc.1)**
