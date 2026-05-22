---
title: "v1.73.0-stable - 신규 사용자의 기본 팀 설정"
slug: "v1-73-0-stable"
date: 2025-06-21T10:00:00
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


:::warning

## 알려진 문제 {#known-issues}

`non-root` docker image에는 UI가 로드되지 않는 알려진 문제가 있습니다. `non-root` docker image를 사용하는 경우 이 버전으로 업그레이드하기 전에 기다리는 것을 권장합니다. 이 문제에 대한 패치 수정 사항을 게시할 예정입니다.

:::

## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.73.0-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.73.0.post1
```

</TabItem>
</Tabs>


## 요약 {#tldr}


* **업그레이드 이유**
    - 사용자 관리: 신규 사용자의 기본 팀을 설정할 수 있습니다. 모든 사용자에게 탐색용 $10 API key를 제공할 수 있습니다.
    - Passthrough Endpoints v2: passthrough endpoints의 하위 경로와 사용자 지정 비용 추적 지원이 강화되었습니다.
    - Health Check Dashboard: 모델 상태와 status를 모니터링하는 새 frontend UI입니다.
* **읽어야 하는 대상**
    - **Passthrough Endpoints**를 사용하는 팀
    - LiteLLM에서 **User Management**를 사용하는 팀
    - 모델용 **Health Check Dashboard**를 사용하는 팀
    - LiteLLM과 함께 **Claude Code**를 사용하는 팀
* **업그레이드 위험도**
    - **낮음**
        - 기존 기능에 대한 주요 breaking change는 없습니다.
- **주요 변경 사항**
    - `User Agent`가 LiteLLM UI 로그 Page에서 tag로 자동 추적됩니다. 즉, 모든 LLM 요청에 대해 logs page에서 `User Agent` tag를 볼 수 있습니다.

---

## 주요 하이라이트 {#key-highlights}



### 신규 사용자의 기본 팀 설정 {#set-default-team-for-new-users}

<Image img={require('../../img/default_teams_product_ss.jpg')}/>

<br/>

v1.73.0에서는 신규 사용자를 Default Teams에 할당할 수 있습니다. 이를 통해 회사 내부에서 LLM 실험을 훨씬 쉽게 활성화하면서도 **탐색 비용이 올바르게 추적되도록 보장할 수 있습니다.**
 
**Proxy Admins**에게 의미하는 내용:
- 팀 멤버별 최대 예산 설정: 개인이 팀 내에서 사용할 수 있는 최대 금액을 설정합니다.
- 신규 사용자의 기본 팀 설정: 신규 사용자가 SSO / invitation link로 로그인하면 이 팀에 자동으로 추가됩니다.

**Developers**에게 의미하는 내용:
- 팀 전체 모델 보기: 이제 `모델 + Endpoints`로 이동해, 자신이 소속된 모든 팀에서 접근 가능한 모델을 볼 수 있습니다.
- 안전한 create key modal: 팀 외부의 모델 접근 권한이 없는 경우(기본 동작), Create Key modal에서 팀을 선택하도록 안내됩니다. 이는 proxy에 온보딩하는 신규 사용자가 흔히 겪는 혼란을 해결합니다.

[시작하기](https://docs.litellm.ai/docs/tutorials/default_team_self_serve)


### Passthrough Endpoints v2 개선 {#passthrough-endpoints-v2}

<Image img={require('../../img/release_notes/v2_pt.png')}/>


<br/>

이번 릴리스에서는 passthrough endpoints에 대한 billing 추가와 전체 URL forwarding을 지원합니다.

이전에는 단순한 endpoints만 매핑할 수 있었지만, 이제 `/bria`만 추가하면 모든 하위 경로가 자동으로 전달됩니다. 예를 들어 `/bria/v1/text-to-image/base/model`과 `/bria/v1/enhance_image`가 모두 동일한 path structure로 target URL에 전달됩니다.

즉, Proxy Admin은 Bria API 및 Mistral OCR 같은 third-party endpoints를 온보딩하고, 요청당 비용을 설정하며, 개발자에게 완전한 API 기능 접근 권한을 제공할 수 있습니다.

[Passthrough Endpoints 자세히 알아보기](../../docs/proxy/pass_through)


### v2 Health Checks {#v2-health-checks}

<Image img={require('../../img/release_notes/v2_health.png')}/>

<br/>

이번 릴리스에서는 Proxy Admins가 health check할 특정 모델을 선택하고, 개별 check가 완료되는 즉시 마지막 check 시간과 함께 health status를 볼 수 있습니다.

이를 통해 Proxy Admins는 문제가 있는 특정 모델을 즉시 식별하고 전체 error stack trace를 확인해 더 빠르게 문제를 해결할 수 있습니다.

---


## 신규 / 업데이트된 모델 {#new--updated-model}

### 가격 / Context Window 업데이트 {#pricing--context-window-updates}

| Provider    | 모델                                  | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | Type |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | ---- |
| Google VertexAI | `vertex_ai/imagen-4` | N/A | Image Generation | Image Generation | New |
| Google VertexAI | `vertex_ai/imagen-4-preview` | N/A | Image Generation | Image Generation | New |
| Gemini | `gemini-2.5-pro` | 2M | $1.25 | $5.00 | New |
| Gemini | `gemini-2.5-flash-lite` | 1M | $0.075 | $0.30 | New |
| OpenRouter | Various models | Updated | Updated | Updated | Updated |
| Azure | `azure/o3` | 200k | $2.00 | $8.00 | Updated |
| Azure | `azure/o3-pro` | 200k | $2.00 | $8.00 | Updated |
| Azure OpenAI | Azure Codex 모델 | Various | Various | Various | New |

### 업데이트된 모델 {#updated-model}

#### 기능 {#features}
- **[Azure](../../docs/providers/azure)**
    - 새로운 /v1 preview Azure OpenAI API 지원 - [PR](https://github.com/BerriAI/litellm/pull/11934), [시작하기](../../docs/providers/azure/azure_responses#azure-codex-models)
    - Azure Codex 모델 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11934), [시작하기](../../docs/providers/azure/azure_responses#azure-codex-models)
    - Azure AD scope를 구성 가능하게 변경 - [PR](https://github.com/BerriAI/litellm/pull/11621)
    - 더 많은 GPT 사용자 지정 naming pattern 처리 - [PR](https://github.com/BerriAI/litellm/pull/11914)
    - OpenAI pricing에 맞춰 o3 pricing 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/11937)
- **[VertexAI](../../docs/providers/vertex)**
    - Vertex Imagen-4 models 추가 - [PR](https://github.com/BerriAI/litellm/pull/11767), [시작하기](../../docs/providers/vertex_image)
    - Anthropic streaming passthrough 비용 추적 - [PR](https://github.com/BerriAI/litellm/pull/11734)
- **[Gemini](../../docs/providers/gemini)**
    - `/v1/speech` endpoint를 통한 Gemini TTS 지원 동작 - [PR](https://github.com/BerriAI/litellm/pull/11832)
    - gemini 2.5 flash config 수정 - [PR](https://github.com/BerriAI/litellm/pull/11830)
    - 누락된 `flash-2.5-flash-lite` model 추가 및 pricing 수정 - [PR](https://github.com/BerriAI/litellm/pull/11901)
    - 모든 gemini-2.5 models가 PDF input을 지원하는 것으로 표시 - [PR](https://github.com/BerriAI/litellm/pull/11907)
    - reasoning support가 포함된 `gemini-2.5-pro` 추가 - [PR](https://github.com/BerriAI/litellm/pull/11927)
- **[AWS Bedrock](../../docs/providers/bedrock)**
    - AWS credentials를 더 이상 필수로 요구하지 않음 - [PR](https://github.com/BerriAI/litellm/pull/11765)
    - APAC region용 AWS Bedrock profiles 추가 - [PR](https://github.com/BerriAI/litellm/pull/11883)
    - AWS Bedrock Claude tool call index 수정 - [PR](https://github.com/BerriAI/litellm/pull/11842)
    - `qs:..` prefix가 있는 base64 file data 처리 - [PR](https://github.com/BerriAI/litellm/pull/11908)
    - BEDROCK_CONVERSE_MODELS에 Mistral Small 추가 - [PR](https://github.com/BerriAI/litellm/pull/11760)
- **[Mistral](../../docs/providers/mistral)**
    - parallel tool calls 지원으로 Mistral API 개선 - [PR](https://github.com/BerriAI/litellm/pull/11770)
- **[Meta Llama API](../../docs/providers/meta_llama)**
    - meta_llama models에 tool calling 활성화 - [PR](https://github.com/BerriAI/litellm/pull/11895)
- **[Volcengine](../../docs/providers/volcengine)**
    - thinking parameter 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11914)


#### 버그 {#bugs}

- **[VertexAI](../../docs/providers/vertex)**
    - promptTokensDetails의 누락된 tokenCount 처리 - [PR](https://github.com/BerriAI/litellm/pull/11896)
    - vertex AI claude thinking params 수정 - [PR](https://github.com/BerriAI/litellm/pull/11796)
- **[Gemini](../../docs/providers/gemini)**
    - responses API의 web search 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/11894), [시작하기](../../docs/completion/web_search#responses-litellmresponses)
- **[Custom LLM](../../docs/providers/custom_llm_server)**
    - anthropic custom LLM provider property 설정 - [PR](https://github.com/BerriAI/litellm/pull/11907)
- **[Anthropic](../../docs/providers/anthropic)**
    - anthropic package version 상향 - [PR](https://github.com/BerriAI/litellm/pull/11851)
- **[Ollama](../../docs/providers/ollama)**
    - sync API에서 작동하도록 ollama_embeddings 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/11746)
    - response_format이 작동하지 않는 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11880)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}
- **[Responses API](../../docs/response_api)**
    - OpenAI reusable prompts Responses API에 대한 Day-0 지원 - [PR](https://github.com/BerriAI/litellm/pull/11782), [시작하기](../../docs/providers/openai/responses_api#reusable-prompts)
    - Completion-to-Responses bridge에서 image URLs 전달 지원 - [PR](https://github.com/BerriAI/litellm/pull/11833)
- **[MCP Gateway](../../docs/mcp)**
    - Creating/Editing Organizations에 Allowed MCPs 추가 - [PR](https://github.com/BerriAI/litellm/pull/11893), [시작하기](../../docs/mcp#-mcp-permission-management)
    - authentication headers로 MCP에 연결할 수 있도록 허용 - [PR](https://github.com/BerriAI/litellm/pull/11891), [시작하기](../../docs/mcp#using-your-mcp-with-client-side-credentials)
- **[Speech API](../../docs/speech)**
    - OpenAI의 `/v1/speech` endpoint를 통한 Gemini TTS 지원 동작 - [PR](https://github.com/BerriAI/litellm/pull/11832)
- **[Passthrough Endpoints](../../docs/proxy/pass_through)**
    - passthrough endpoints의 하위 경로 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11827)
    - passthrough request당 사용자 지정 비용 설정 지원 - [PR](https://github.com/BerriAI/litellm/pull/11870)
    - LiteLLM Proxy에서 passthrough requests에 대해 "Request"가 추적되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/11873)
    - UI에 V2 Passthrough endpoints 추가 - [PR](https://github.com/BerriAI/litellm/pull/11905)
    - UI에서 passthrough endpoints를 모델 + Endpoints 아래로 이동 - [PR](https://github.com/BerriAI/litellm/pull/11871)
    - passthrough endpoints 추가를 위한 QA 개선 - [PR](https://github.com/BerriAI/litellm/pull/11909), [PR](https://github.com/BerriAI/litellm/pull/11939)
- **[모델 API](../../docs/completion/model_alias)**
    - `/models`가 custom wildcard prefixes에 대해 올바른 models를 반환하도록 허용 - [PR](https://github.com/BerriAI/litellm/pull/11784)

#### 버그 {#bugs-1}

- **[Messages API](../../docs/anthropic_unified)**
    - vertex_ai-anthropic models 사용 시 `/v1/messages` endpoint가 항상 us-central1을 사용하는 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11831)
    - `/v1/messages` 및 `/moderations`의 model_group 추적 수정 - [PR](https://github.com/BerriAI/litellm/pull/11933)
    - Claude Code 사용 시 `/v1/messages` API를 통한 비용 추적 및 logging 수정 - [PR](https://github.com/BerriAI/litellm/pull/11928)
- **[MCP Gateway](../../docs/mcp)**
    - config.yaml에 정의된 MCPs 사용 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11824)
- **[Chat Completion API](../../docs/completion/input)**
    - acompletion에서 tool_choice argument로 dict 허용 - [PR](https://github.com/BerriAI/litellm/pull/11860)
- **[Passthrough Endpoints](../../docs/pass_through/langfuse)**
    - Langfuse에서 Langfuse passthrough request를 기록하지 않도록 수정 - [PR](https://github.com/BerriAI/litellm/pull/11768)

---

## 비용 추적 {#cost-tracking}

#### 기능 {#features-2}
- **[User Agent Tracking](../../docs/proxy/cost_tracking)**
    - user agent별 spend 자동 추적(Claude Code 비용 추적 가능) - [PR](https://github.com/BerriAI/litellm/pull/11781)
    - spend logs payload에 user agent tags 추가 - [PR](https://github.com/BerriAI/litellm/pull/11872)
- **[Tag Management](../../docs/proxy/cost_tracking)**
    - tag management에서 public model names 추가 지원 - [PR](https://github.com/BerriAI/litellm/pull/11908)

---

## 관리 Endpoints / UI {#management-endpoints--ui}

#### 기능 {#features-3}
- **Test Key Page**
    - Test Key Page에서 `/v1/messages` testing 허용 - [PR](https://github.com/BerriAI/litellm/pull/11930)
- **[SSO](../../docs/proxy/sso)**
    - additional headers 전달 허용 - [PR](https://github.com/BerriAI/litellm/pull/11781)
- **[JWT Auth](../../docs/proxy/jwt_auth)**
    - user email을 올바르게 반환 - [PR](https://github.com/BerriAI/litellm/pull/11783)
- **[Model Management](../../docs/proxy/model_management)**
    - existing model의 model access group 편집 허용 - [PR](https://github.com/BerriAI/litellm/pull/11783)
- **[Team Management](../../docs/proxy/team_management)**
    - 신규 사용자의 default team 설정 허용 - [PR](https://github.com/BerriAI/litellm/pull/11874), [PR](https://github.com/BerriAI/litellm/pull/11877)
    - default team settings 수정 - [PR](https://github.com/BerriAI/litellm/pull/11887)
- **[SCIM](../../docs/proxy/scim)**
    - SCIM의 existing user에 대한 error handling 추가 - [PR](https://github.com/BerriAI/litellm/pull/11862)
    - users용 SCIM PATCH 및 PUT operations 추가 - [PR](https://github.com/BerriAI/litellm/pull/11863)
- **Health Check Dashboard 개선**
    - health check backend API 및 storage functionality 구현 - [PR](https://github.com/BerriAI/litellm/pull/11852)
    - database schema에 LiteLLM_HealthCheckTable 추가 - [PR](https://github.com/BerriAI/litellm/pull/11677)
    - health check frontend UI components 및 dashboard integration 구현 - [PR](https://github.com/BerriAI/litellm/pull/11679)
    - health check responses용 success modal 추가 - [PR](https://github.com/BerriAI/litellm/pull/11899)
    - health check table에서 클릭 가능한 model ID 수정 - [PR](https://github.com/BerriAI/litellm/pull/11898)
    - health check UI table design 수정 - [PR](https://github.com/BerriAI/litellm/pull/11897)

---

## Logging / Guardrails 연동 {#logging--guardrail-integrations}

#### 버그 {#bugs-2}
- **[Prometheus](../../docs/observability/prometheus)**
    - prometheus metrics config 사용 버그 수정 - [PR](https://github.com/BerriAI/litellm/pull/11779)

---

## 보안 및 안정성 {#security--reliability}

#### 보안 수정 {#security-fixes}
- **[문서 보안](../../docs)**
    - docs 보안 수정 - [PR](https://github.com/BerriAI/litellm/pull/11776)
    - UI + 문서 folder에 Trivy Security Scan 추가 및 모든 vulnerabilities 제거 - [PR](https://github.com/BerriAI/litellm/pull/11778)

#### 안정성 개선 {#reliability-improvements}
- **[Dependencies](../../docs)**
    - aiohttp version requirement 수정 - [PR](https://github.com/BerriAI/litellm/pull/11777)
    - UI dashboard에서 next를 14.2.26에서 14.2.30으로 상향 - [PR](https://github.com/BerriAI/litellm/pull/11720)
- **[Networking](../../docs)**
    - CA Bundles 사용 허용 - [PR](https://github.com/BerriAI/litellm/pull/11906)
    - GCP와 AWS 간 workload identity federation 추가 - [PR](https://github.com/BerriAI/litellm/pull/10210)

---

## 일반 Proxy 개선 사항 {#general-proxy-improvements}

#### 기능 {#features-4}
- **[Deployment](../../docs/proxy/deploy)**
    - Kubernetes용 deployment annotations 추가 - [PR](https://github.com/BerriAI/litellm/pull/11849)
    - command에 ciphers를 추가하고 proxy용 hypercorn에 전달 - [PR](https://github.com/BerriAI/litellm/pull/11916)
- **[Custom Root Path](../../docs/proxy/deploy)**
    - custom root path에서 UI 로드 수정 - [PR](https://github.com/BerriAI/litellm/pull/11912)
- **[SDK Improvements](../../docs/proxy/reliability)**
    - LiteLLM SDK / Proxy 개선(message를 client-side에서 변환하지 않음) - [PR](https://github.com/BerriAI/litellm/pull/11908)

#### 버그 {#bugs-3}
- **[관측성](../../docs/observability)**
    - observability용 boto3 tracer wrapping 수정 - [PR](https://github.com/BerriAI/litellm/pull/11869)


---

## 신규 기여자 {#new-contributors}
* @kjoth가 [PR](https://github.com/BerriAI/litellm/pull/11621)에서 첫 기여를 했습니다.
* @shagunb-acn이 [PR](https://github.com/BerriAI/litellm/pull/11760)에서 첫 기여를 했습니다.
* @MadsRC가 [PR](https://github.com/BerriAI/litellm/pull/11765)에서 첫 기여를 했습니다.
* @Abiji-2020이 [PR](https://github.com/BerriAI/litellm/pull/11746)에서 첫 기여를 했습니다.
* @salzubi401이 [PR](https://github.com/BerriAI/litellm/pull/11803)에서 첫 기여를 했습니다.
* @orolega가 [PR](https://github.com/BerriAI/litellm/pull/11826)에서 첫 기여를 했습니다.
* @X4tar가 [PR](https://github.com/BerriAI/litellm/pull/11796)에서 첫 기여를 했습니다.
* @karen-veigas가 [PR](https://github.com/BerriAI/litellm/pull/11858)에서 첫 기여를 했습니다.
* @Shankyg가 [PR](https://github.com/BerriAI/litellm/pull/11859)에서 첫 기여를 했습니다.
* @pascallim이 [PR](https://github.com/BerriAI/litellm/pull/10210)에서 첫 기여를 했습니다.
* @lgruen-vcgs가 [PR](https://github.com/BerriAI/litellm/pull/11883)에서 첫 기여를 했습니다.
* @rinormaloku가 [PR](https://github.com/BerriAI/litellm/pull/11851)에서 첫 기여를 했습니다.
* @InvisibleMan1306이 [PR](https://github.com/BerriAI/litellm/pull/11849)에서 첫 기여를 했습니다.
* @ervwalter가 [PR](https://github.com/BerriAI/litellm/pull/11937)에서 첫 기여를 했습니다.
* @ThakeeNathees가 [PR](https://github.com/BerriAI/litellm/pull/11880)에서 첫 기여를 했습니다.
* @jnhyperion이 [PR](https://github.com/BerriAI/litellm/pull/11842)에서 첫 기여를 했습니다.
* @Jannchie가 [PR](https://github.com/BerriAI/litellm/pull/11860)에서 첫 기여를 했습니다.

---

## Demo Instance {#demo-instance}

변경 사항을 테스트할 수 있는 Demo Instance입니다.

- Instance: https://demo.litellm.ai/
- Login Credentials:
    - Username: admin
    - Password: sk-1234

## [Git Diff](https://github.com/BerriAI/litellm/compare/v1.72.6-stable...v1.73.0.rc)
