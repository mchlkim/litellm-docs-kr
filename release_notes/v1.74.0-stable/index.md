---
title: "v1.74.0-stable"
slug: "v1-74-0-stable"
date: 2025-07-05T10:00:00
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

## 이 버전 배포하기 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.74.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.74.0.post2
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **MCP Gateway 네임스페이스 서버** - LiteLLM에 연결하는 클라이언트가 사용할 MCP 서버를 지정할 수 있습니다. 
- **UI의 키/팀 기반 로깅** - Proxy 관리자가 UI에서 팀 또는 키 기반 로깅 설정을 직접 구성할 수 있습니다. 
- **Azure Content Safety 가드레일** - Azure Content Safety 가드레일로 프롬프트 인젝션과 텍스트 모더레이션을 지원합니다. 
- **VertexAI Deepseek 모델** - LiteLLM의 /chat/completions 또는 /responses API로 VertexAI Deepseek 모델 호출을 지원합니다.
- **Github Copilot API** - 이제 Github Copilot을 LLM API provider로 사용할 수 있습니다.


### MCP Gateway: 네임스페이스 MCP 서버 {#mcp-gateway-namespaced-mcp-servers}

이번 릴리스에서는 LiteLLM MCP Gateway에서 MCP 서버 네임스페이스를 지원합니다. 즉 `x-mcp-servers` 헤더를 지정해 어떤 서버의 도구를 나열할지 정할 수 있습니다. 
 
MCP 클라이언트를 LiteLLM의 특정 MCP 서버로 연결하려는 경우 유용합니다. 


#### 사용법

<Tabs>
<TabItem value="openai" label="OpenAI API">

```bash title="cURL Example with Server Segregation" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "<your-litellm-proxy-base-url>/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-servers": "Zapier_Gmail"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 예시에서 요청은 "Zapier_Gmail" MCP 서버의 도구에만 접근할 수 있습니다.

</TabItem>

<TabItem value="litellm" label="LiteLLM Proxy">

```bash title="cURL Example with Server Segregation" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "<your-litellm-proxy-base-url>/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-servers": "Zapier_Gmail,Server2"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 구성은 지정된 MCP 서버의 도구만 요청에서 사용하도록 제한합니다.

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with Server Segregation" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "<your-litellm-proxy-base-url>/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-servers": "Zapier_Gmail,Server2"
      }
    }
  }
}
```

Cursor IDE 설정의 이 구성은 도구 접근을 지정된 MCP 서버로만 제한합니다.

</TabItem>
</Tabs>

### UI의 팀 / 키 기반 로깅 {#team--key-based-logging-on-ui}

<Image 
  img={require('../../img/release_notes/team_key_logging.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />

이번 릴리스에서는 Proxy 관리자가 UI에서 팀/키 기반 로깅 설정을 구성할 수 있습니다. 이를 통해 팀 또는 키에 따라 LLM 요청/응답 로그를 서로 다른 Langfuse/Arize 프로젝트로 라우팅할 수 있습니다.

LiteLLM을 사용하는 개발자의 로그는 각자의 Arize/Langfuse 프로젝트로 자동 라우팅됩니다. 이번 릴리스에서는 키/팀 기반 로깅에 대해 다음 통합을 지원합니다.

- `langfuse`
- `arize`
- `langsmith`

### Azure Content Safety 가드레일

<Image 
  img={require('../../img/azure_content_safety_guardrails.jpg')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br />


LiteLLM은 이제 프롬프트 인젝션과 텍스트 모더레이션을 위한 **Azure Content Safety 가드레일**을 지원합니다. Azure의 Harm Categories 감지 기능을 포함한 가드레일을 만들고, 사용자 지정 심각도 임계값을 지정한 뒤, 해당 사용 사례에만 또는 모든 호출에 대해 100개 이상의 LLM에서 실행할 수 있으므로 **내부 chat-ui** 사용 사례에 특히 적합합니다. 

[시작하기](../../docs/proxy/guardrails/azure_content_guardrail)


### Python SDK: 가져오기 시간 2.3초 단축 {#python-sdk-23-second-faster-import-times}

이번 릴리스에서는 가져오기 시간이 2.3초 단축되는 등 Python SDK의 성능이 크게 개선되었습니다. 초기화 프로세스를 리팩터링해 시작 오버헤드를 줄였고, 빠른 초기화가 필요한 애플리케이션에서 LiteLLM을 더 효율적으로 사용할 수 있게 했습니다. LiteLLM을 빠르게 초기화해야 하는 애플리케이션에 중요한 개선입니다.


---

## 신규 모델 / 업데이트된 모델 {#new--updated-}

#### 가격 / 컨텍스트 창 업데이트 {#pricing--context-window-updates}

| 제공자    | 모델                                  | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 유형 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | ---- |
| Watsonx | `watsonx/mistralai/mistral-large` | 131k | $3.00 | $10.00 | 신규 |
| Azure AI | `azure_ai/cohere-rerank-v3.5` | 4k | $2.00/1k queries | - | 신규 (Rerank) |


#### 기능 {#features}
- **[🆕 GitHub Copilot](../../docs/providers/github_copilot)** - LiteLLM에서 GitHub Copilot API 사용 - [PR](https://github.com/BerriAI/litellm/pull/12325), [시작하기](../../docs/providers/github_copilot)
- **[🆕 VertexAI DeepSeek](../../docs/providers/vertex)** - VertexAI DeepSeek 모델 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12312), [시작하기](../../docs/providers/vertex_partner#vertexai-deepseek)
- **[Azure AI](../../docs/providers/azure_ai)**
  - azure_ai cohere rerank v3.5 추가 - [PR](https://github.com/BerriAI/litellm/pull/12283), [시작하기](../../docs/providers/azure_ai#rerank-endpoint)
- **[Vertex AI](../../docs/providers/vertex)**
  - 이미지 생성을 위한 size 파라미터 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12292), [시작하기](../../docs/providers/vertex_image)
- **[Custom LLM](../../docs/providers/custom_llm_server)**
  - "custom" llm provider에서 extra_ 속성 전달 - [PR](https://github.com/BerriAI/litellm/pull/12185)

#### 버그 {#bugs}
- **[Mistral](../../docs/providers/mistral)**
  - 빈 문자열 콘텐츠에 대한 transform_response 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/12202)
  - Mistral이 llm_http_handler를 사용하도록 변경 - [PR](https://github.com/BerriAI/litellm/pull/12245)
- **[Gemini](../../docs/providers/gemini)**
  - 도구 호출 순서 수정 - [PR](https://github.com/BerriAI/litellm/pull/11999)
  - 사용자 지정 api_base 경로 보존 수정 - [PR](https://github.com/BerriAI/litellm/pull/12215)
- **[Anthropic](../../docs/providers/anthropic)**
  - user_id 검증 로직 수정 - [PR](https://github.com/BerriAI/litellm/pull/11432)
- **[Bedrock](../../docs/providers/bedrock)**
  - bedrock용 선택적 인자 지원 - [PR](https://github.com/BerriAI/litellm/pull/12287)
- **[Ollama](../../docs/providers/ollama)**
  - ollama-chat의 기본 파라미터 수정 - [PR](https://github.com/BerriAI/litellm/pull/12201)
- **[VLLM](../../docs/providers/vllm)**
  - 'audio_url' 메시지 타입 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12270)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **[/batches](../../docs/batches)**
  - 대상 모델 Query Param을 사용한 배치 조회 지원 - [PR](https://github.com/BerriAI/litellm/pull/12228)
  - Anthropic completion 브리지 개선 - [PR](https://github.com/BerriAI/litellm/pull/12228)
- **[/responses](../../docs/response_api)**
  - Azure responses api 브리지 개선 - [PR](https://github.com/BerriAI/litellm/pull/12224)
  - responses api 오류 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/12225)
- **[/mcp (MCP Gateway)](../../docs/mcp)**
  - 프론트엔드에 MCP url 마스킹 추가 - [PR](https://github.com/BerriAI/litellm/pull/12247)
  - 범위를 지정하기 위한 MCP servers 헤더 추가 - [PR](https://github.com/BerriAI/litellm/pull/12266)
  - Litellm mcp 도구 접두사 - [PR](https://github.com/BerriAI/litellm/pull/12289)
  - 헤더를 사용해 연결에서 MCP 도구 분리 - [PR](https://github.com/BerriAI/litellm/pull/12296)
  - mcp url 래핑 변경 사항 추가 - [PR](https://github.com/BerriAI/litellm/pull/12207)


#### 버그 {#bugs-1}
- **[/v1/messages](../../docs/anthropic_unified)**
  - 스트리밍에서 하드코딩된 모델 이름 제거 - [PR](https://github.com/BerriAI/litellm/pull/12131)
  - 최저 지연 시간 라우팅 지원 - [PR](https://github.com/BerriAI/litellm/pull/12180)
  - Non-anthropic 모델의 토큰 사용량 반환 - [PR](https://github.com/BerriAI/litellm/pull/12184)
- **[/chat/completions](../../docs/providers/anthropic_unified)**
  - Cursor IDE tool_choice 형식 `{"type": "auto"}` 지원 - [PR](https://github.com/BerriAI/litellm/pull/12168)
- **[/generateContent](../../docs/generate_content)**
  - litellm_params 전달 허용 - [PR](https://github.com/BerriAI/litellm/pull/12177)
  - OpenAI 모델 사용 시 지원되는 params만 전달 - [PR](https://github.com/BerriAI/litellm/pull/12297)
  - Vertex Anthropic 모델에서 gemini-cli 사용 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/12246)
- **Streaming**
  - LlamaAPI Streaming Chat의 Error code: 307 수정 - [PR](https://github.com/BerriAI/litellm/pull/11946)
  - is_finished인 경우에도 종료 사유 저장 - [PR](https://github.com/BerriAI/litellm/pull/12250)

---

## 비용 추적 / 예산 개선 {#budget-improvements}

#### 버그 {#bugs-2}
  - 비용 계산에서 문자열 허용 수정 - [PR](https://github.com/BerriAI/litellm/pull/12200)
  - 프롬프트 캐싱을 사용하는 VertexAI Anthropic 스트리밍 비용 추적 수정 - [PR](https://github.com/BerriAI/litellm/pull/12188)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 버그 {#bugs-3}
- **팀 관리**
  - 모델 추가 시 팀 모델 재설정 방지 - [PR](https://github.com/BerriAI/litellm/pull/12144)
  - /v2/model/info에서 팀 전용 모델 반환 - [PR](https://github.com/BerriAI/litellm/pull/12144)
  - 팀 멤버 예산을 올바르게 렌더링 - [PR](https://github.com/BerriAI/litellm/pull/12144)
- **UI 렌더링**
  - non-root 이미지에서 UI 렌더링 수정 - [PR](https://github.com/BerriAI/litellm/pull/12226)
  - 'Internal Viewer' 사용자 역할을 올바르게 표시 - [PR](https://github.com/BerriAI/litellm/pull/12284)
- **설정**
  - 빈 config.yaml 처리 - [PR](https://github.com/BerriAI/litellm/pull/12189)
  - gemini /models 수정 - 예상대로 models/ 교체 - [PR](https://github.com/BerriAI/litellm/pull/12189)

#### 기능 {#features-2}
- **팀 관리**
  - 팀별 로깅 콜백 추가 허용 - [PR](https://github.com/BerriAI/litellm/pull/12261)
  - Arize 팀 기반 로깅 추가 - [PR](https://github.com/BerriAI/litellm/pull/12264)
  - 팀 기반 콜백 보기/편집 허용 - [PR](https://github.com/BerriAI/litellm/pull/12265)
- **UI 개선**
  - 지출 및 예산을 쉼표로 구분해 표시 - [PR](https://github.com/BerriAI/litellm/pull/12317)
  - 콜백 목록에 로고 추가 - [PR](https://github.com/BerriAI/litellm/pull/12244)
- **CLI**
  - litellm proxy 사용 시작을 위한 litellm-proxy cli 로그인 추가 - [PR](https://github.com/BerriAI/litellm/pull/12216)
- **이메일 템플릿**
  - 사용자 지정 가능한 이메일 템플릿 - 제목 및 서명 - [PR](https://github.com/BerriAI/litellm/pull/12218)

---

## 로깅 / 가드레일 통합 {#logging--guardrail-integrations}

#### 기능 {#features-3}
- 가드레일 
  - 이제 모든 가드레일이 UI에서 지원됩니다 - [PR](https://github.com/BerriAI/litellm/pull/12349)
- **[Azure Content Safety](../../docs/guardrails/azure_content_safety)**
  - LiteLLM proxy에 Azure Content Safety 가드레일 추가 - [PR](https://github.com/BerriAI/litellm/pull/12268)
  - UI에 azure content safety 가드레일 추가 - [PR](https://github.com/BerriAI/litellm/pull/12309)
- **[DeepEval](../../docs/observability/deepeval_integration)**
  - 실패 이벤트의 DeepEval 로깅 형식 수정 - [PR](https://github.com/BerriAI/litellm/pull/12303)
- **[Arize](../../docs/proxy/logging#arize)**
  - Arize 팀 기반 로깅 추가 - [PR](https://github.com/BerriAI/litellm/pull/12264)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
  - Langfuse prompt_version 지원 - [PR](https://github.com/BerriAI/litellm/pull/12301)
- **[Sentry 통합](../../docs/observability/sentry)**
  - sentry 스크러빙 추가 - [PR](https://github.com/BerriAI/litellm/pull/12210)
- **[AWS SQS Logging](../../docs/proxy/logging#aws-sqs)**
  - 신규 AWS SQS Logging 통합 - [PR](https://github.com/BerriAI/litellm/pull/12176)
- **[S3 Logger](../../docs/proxy/logging#s3-buckets)**
  - 실패 로깅 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12299)
- **[Prometheus Metrics](../../docs/proxy/prometheus)**
  - prometheus metrics 및 labels에 대한 오류 검증 개선 추가 - [PR](https://github.com/BerriAI/litellm/pull/12182)

#### 버그 {#bugs-4}
- **보안**
  - LLM API 경로 실패만 Langfuse에 로깅되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12308)
- **OpenMeter**
  - 통합 오류 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/12147)
- **메시지 삭제**
  - responses API 로깅에서 메시지 삭제가 작동하도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12291)
- **Bedrock 가드레일**
  - 스트리밍 응답을 위한 bedrock guardrails post_call 수정 - [PR](https://github.com/BerriAI/litellm/pull/12252)
---

## 성능 / 로드밸런싱 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

#### 기능 {#features-4}
- **Python SDK**
  - 가져오기 시간 2초 단축 - [PR](https://github.com/BerriAI/litellm/pull/12135)
  - python sdk 가져오기 시간 .3초 단축 - [PR](https://github.com/BerriAI/litellm/pull/12140)
- **오류 처리**
  - MCP 도구를 찾을 수 없거나 서버가 유효하지 않은 경우의 오류 처리 추가 - [PR](https://github.com/BerriAI/litellm/pull/12223)
- **SSL/TLS**
  - SSL 인증서 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/12327)
  - aiohttp transport에서 사용자 지정 ca bundle 지원 수정 - [PR](https://github.com/BerriAI/litellm/pull/12281)


---

## 일반 Proxy 개선 {#general-proxy-improvements}

- **시작**
  - 시작 시 새 배너 추가 - [PR](https://github.com/BerriAI/litellm/pull/12328)
- **종속성**
  - pydantic 버전 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/12213)


---

## 신규 기여자 {#new-contributors}
* @wildcard 님이 https://github.com/BerriAI/litellm/pull/12157 에서 첫 기여를 했습니다
* @colesmcintosh 님이 https://github.com/BerriAI/litellm/pull/12168 에서 첫 기여를 했습니다
* @seyeong-han 님이 https://github.com/BerriAI/litellm/pull/11946 에서 첫 기여를 했습니다
* @dinggh 님이 https://github.com/BerriAI/litellm/pull/12162 에서 첫 기여를 했습니다
* @raz-alon 님이 https://github.com/BerriAI/litellm/pull/11432 에서 첫 기여를 했습니다
* @tofarr 님이 https://github.com/BerriAI/litellm/pull/12200 에서 첫 기여를 했습니다
* @szafranek 님이 https://github.com/BerriAI/litellm/pull/12179 에서 첫 기여를 했습니다
* @SamBoyd 님이 https://github.com/BerriAI/litellm/pull/12147 에서 첫 기여를 했습니다
* @lizzij 님이 https://github.com/BerriAI/litellm/pull/12219 에서 첫 기여를 했습니다
* @cipri-tom 님이 https://github.com/BerriAI/litellm/pull/12201 에서 첫 기여를 했습니다
* @zsimjee 님이 https://github.com/BerriAI/litellm/pull/12185 에서 첫 기여를 했습니다
* @jroberts2600 님이 https://github.com/BerriAI/litellm/pull/12175 에서 첫 기여를 했습니다
* @njbrake 님이 https://github.com/BerriAI/litellm/pull/12202 에서 첫 기여를 했습니다
* @NANDINI-star 님이 https://github.com/BerriAI/litellm/pull/12244 에서 첫 기여를 했습니다
* @utsumi-fj 님이 https://github.com/BerriAI/litellm/pull/12230 에서 첫 기여를 했습니다
* @dcieslak19973 님이 https://github.com/BerriAI/litellm/pull/12283 에서 첫 기여를 했습니다
* @hanouticelina 님이 https://github.com/BerriAI/litellm/pull/12286 에서 첫 기여를 했습니다
* @lowjiansheng 님이 https://github.com/BerriAI/litellm/pull/11999 에서 첫 기여를 했습니다
* @JoostvDoorn 님이 https://github.com/BerriAI/litellm/pull/12281 에서 첫 기여를 했습니다
* @takashiishida 님이 https://github.com/BerriAI/litellm/pull/12239 에서 첫 기여를 했습니다

## **[Git Diff](https://github.com/BerriAI/litellm/compare/v1.73.6-stable...v1.74.0-stable)** {#git-diff}
