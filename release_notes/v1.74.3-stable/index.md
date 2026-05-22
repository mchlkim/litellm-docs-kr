---
title: "v1.74.3-stable"
slug: "v1-74-3-stable"
date: 2025-07-12T10:00:00
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

## 이 버전 배포 {#deploy-this-version}

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.74.3-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.74.3.post1
```

</TabItem>
</Tabs>

---

## 주요 하이라이트 {#key-highlights}

- **MCP: Model Access Groups** - 사용자와 팀 접근을 쉽게 관리하도록 MCP server를 access group에 추가합니다.
- **MCP: Tool Cost Tracking** - 각 MCP tool의 가격을 설정합니다.
- **Model Hub v2** - 개발자에게 proxy에서 사용할 수 있는 모델을 알려주는 새 OSS Model Hub입니다.
- **Bytez** - 새 LLM API provider입니다.
- **Dashscope API** - 새 Dashscope API provider를 통해 Alibaba qwen 모델을 호출합니다.

---

## MCP Gateway: 모델 access group {#mcp-gateway-model-access-groups}

<Image 
  img={require('../../img/release_notes/mcp_access_groups.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

v1.74.3-stable은 MCP server를 access group에 추가하는 기능을 지원합니다. 이를 통해 **Proxy Admin**이 사용자와 팀 전체의 MCP server 접근을 더 쉽게 관리할 수 있습니다.

**개발자**는 이제 `x-mcp-servers` header에 access group 이름을 전달해 여러 MCP server에 연결할 수 있습니다.

자세한 내용은 [여기](https://docs.litellm.ai/docs/mcp#grouping-mcps-access-groups)를 참고하세요.

---

## MCP Gateway: tool 비용 추적 {#mcp-gateway-tool-cost-tracking}

<Image 
  img={require('../../img/release_notes/mcp_tool_cost_tracking.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

이번 릴리스는 MCP tool call 비용 추적을 추가합니다. 개발자에게 MCP 접근을 제공하는 **Proxy Admin**은 이제 MCP tool call 비용을 특정 LiteLLM key와 team에 귀속할 수 있습니다.

설정할 수 있는 항목:
- **Uniform server cost**: 한 server의 모든 tool에 동일한 비용을 설정합니다.
- **Individual tool cost**: 특정 tool별 비용을 정의합니다. 예: search_tool은 $10, get_weather는 $5.
- **Dynamic costs**: MCP 응답에 따라 비용을 설정해야 하는 경우 custom post mcp call hook을 작성해 응답을 파싱하고 비용을 동적으로 설정할 수 있습니다.

[시작하기](https://docs.litellm.ai/docs/mcp#mcp-cost-tracking)

---

## Model Hub v2 {#model-hub-v2}

<Image 
  img={require('../../img/release_notes/model_hub_v2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

<br/>

v1.74.3-stable은 개발자에게 proxy에서 사용 가능한 모델을 알려주는 새 OSS Model Hub를 도입합니다.

**Proxy Admin**은 이제 개발자에게 proxy에서 사용할 수 있는 모델을 명확히 안내할 수 있습니다.

이전 model hub 대비 다음 기능이 개선되었습니다.
- **개발자**에게 LiteLLM key가 없어도 모델을 보여줄 수 있습니다.
- **Proxy Admin**이 model hub에 공개할 특정 모델을 선택할 수 있습니다.
- 검색 및 filtering 기능이 개선되었습니다.
    - 부분 이름으로 모델 검색(예: `xai grok-4`)
    - provider 및 기능으로 filtering(예: 'vision' 모델)
    - 비용 기준 정렬(예: OpenAI의 가장 저렴한 vision 모델)

[시작하기](../../docs/proxy/model_hub)

---


## 신규 모델 / 업데이트된 모델 {#new-models-updated-models}

#### 가격 / context window 업데이트 {#pricing-context-window-updates}

| Provider    | Model                                  | Context Window | Input($/1M tokens) | Output($/1M tokens) | 유형 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | ---- |
| Xai | `xai/grok-4` | 256k | $3.00 | $15.00 | 신규 |
| Xai | `xai/grok-4-0709` | 256k | $3.00 | $15.00 | 신규 |
| Xai | `xai/grok-4-latest` | 256k | $3.00 | $15.00 | 신규 |
| Mistral | `mistral/devstral-small-2507` | 128k | $0.1 | $0.3 | 신규 |
| Mistral | `mistral/devstral-medium-2507` | 128k | $0.4 | $2 | 신규 |
| Azure OpenAI | `azure/o3-deep-research` | 200k | $10 | $40 | 신규 |


#### 기능 {#features}
- **[Xinference](../../docs/providers/xinference)**
    - Image generation API 지원 - [PR](https://github.com/BerriAI/litellm/pull/12439)
- **[Bedrock](../../docs/providers/bedrock)**
    - AWS Bedrock API용 API Key Auth 지원 - [PR](https://github.com/BerriAI/litellm/pull/12495)
- **[🆕 Dashscope](../../docs/providers/dashscope)**
    - Alibaba의 새 integration(qwen 사용 가능) - [PR](https://github.com/BerriAI/litellm/pull/12361)
- **[🆕 Bytez](../../docs/providers/bytez)**
    - 새 /chat/completion integration - [PR](https://github.com/BerriAI/litellm/pull/12121)

#### 버그 {#bugs}
- **[Github Copilot](../../docs/providers/github_copilot)**
    - Github Copilot API base URL 수정 - [PR](https://github.com/BerriAI/litellm/pull/12418)
- **[Bedrock](../../docs/providers/bedrock)**
    - 지원되는 bedrock/converse/ param이 bedrock/ param과 일치하도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12466)
    - cache token 비용 계산 수정 - [PR](https://github.com/BerriAI/litellm/pull/12488)
- **[XAI](../../docs/providers/xai)**
    - xai 응답에 tool call이 있을 때 `finish_reason`에 tool call이 포함되도록 보장 - [PR](https://github.com/BerriAI/litellm/pull/12545)

---

## LLM API endpoints {#llm-api-endpoints}

#### Features
- **[/completions](../../docs/text_completion)**
    - streaming에서 `reasoning_content` 반환 - [PR](https://github.com/BerriAI/litellm/pull/12377)
- **[/chat/completions](../../docs/completion/input)** 
    - stream chunk builder에 `thinking blocks` 추가 - [PR](https://github.com/BerriAI/litellm/pull/12395)
- **[/v1/messages](../../docs/anthropic_unified)**
    - fallback 지원 - [PR](https://github.com/BerriAI/litellm/pull/12440)
    - non-anthropic model의 tool call 처리(/v1/messages에서 /chat/completion bridge) - [PR](https://github.com/BerriAI/litellm/pull/12473)

---

## [MCP Gateway](../../docs/mcp)

<Image 
  img={require('../../img/release_notes/mcp_tool_cost_tracking.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

#### Features
- **[Cost Tracking](../../docs/mcp#-mcp-cost-tracking)**
    - Cost Tracking 추가 - [PR](https://github.com/BerriAI/litellm/pull/12385)
    - usage tracking 추가 - [PR](https://github.com/BerriAI/litellm/pull/12397)
    - 각 MCP tool의 custom cost configuration 추가 - [PR](https://github.com/BerriAI/litellm/pull/12499)
    - MCP tool별 비용 편집 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12501)
    - 비용 추적에 custom post call MCP hook 사용 허용 - [PR](https://github.com/BerriAI/litellm/pull/12469)
- **[Auth](../../docs/mcp#using-your-mcp-with-client-side-credentials)**
    - 사용할 client side auth header custom 설정 허용 - [PR](https://github.com/BerriAI/litellm/pull/12460)
    - request의 MCP server header 형식이 잘못되면 오류 발생 - [PR](https://github.com/BerriAI/litellm/pull/12494)
- **[MCP Server](../../docs/mcp#adding-your-mcp)**
    - LiteLLM에서 stdio MCP 사용 허용(Circle CI MCP를 LiteLLM과 함께 사용 가능) - [PR](https://github.com/BerriAI/litellm/pull/12530), [시작하기](../../docs/mcp#adding-a-stdio-mcp-server)

#### Bugs
- **General**
    - task group is not initialized 오류 수정 - [PR](https://github.com/BerriAI/litellm/pull/12411) s/o [@juancarlosm](https://github.com/juancarlosm)
- **[MCP Server](../../docs/mcp#adding-your-mcp)**
    - Claude code에서 동작하도록 mcp tool separator 수정 - [PR](https://github.com/BerriAI/litellm/pull/12430), [시작하기](../../docs/mcp#adding-your-mcp)
    - namespace가 동작하도록 mcp server name에 "-"를 허용하지 않는 validation 추가 - [PR](https://github.com/BerriAI/litellm/pull/12515)


---

## 관리 endpoint / UI {#management-endpoints-ui}


<Image 
  img={require('../../img/release_notes/model_hub_v2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>

#### Features
- **Model Hub**
    - 새 model hub table view - [PR](https://github.com/BerriAI/litellm/pull/12468)
    - 새 /public/model_hub endpoint - [PR](https://github.com/BerriAI/litellm/pull/12468)
    - Model Hub OSS화 - [PR](https://github.com/BerriAI/litellm/pull/12553)
    - public model hub에 proxy model을 표시하는 새 `make public` modal flow - [PR](https://github.com/BerriAI/litellm/pull/12555)
- **MCP**
    - internal user가 MCP server를 사용하고 관리하도록 지원 - [PR](https://github.com/BerriAI/litellm/pull/12458)
    - namespace와 유사한 MCP access group 추가 UI 지원 - [PR](https://github.com/BerriAI/litellm/pull/12470)
    - MCP Tool Testing Playground - [PR](https://github.com/BerriAI/litellm/pull/12520)
    - MCP settings root에 cost config 표시 - [PR](https://github.com/BerriAI/litellm/pull/12526)
- **Test Key**
    - stick session 지원 - [PR](https://github.com/BerriAI/litellm/pull/12365)
    - MCP Access Groups - mcp access group 허용 - [PR](https://github.com/BerriAI/litellm/pull/12529)
- **사용법**
    - Top API Keys chart에서 긴 label truncate 및 tooltip 개선 - [PR](https://github.com/BerriAI/litellm/pull/12371)
    - Tag 사용법 chart 가독성 개선 - [PR](https://github.com/BerriAI/litellm/pull/12378)
- **Teams**
    - team member 작업 후 navigation reset 방지 - [PR](https://github.com/BerriAI/litellm/pull/12424)
    - Team Members - duration이 설정된 경우 budget reset - [PR](https://github.com/BerriAI/litellm/pull/12534)
    - UI에서 `max_budget_in_team`이 설정된 경우 central team member budget 사용 - [PR](https://github.com/BerriAI/litellm/pull/12533)
- **SSO**
    - 사용자가 custom sso login handler를 실행할 수 있도록 허용 - [PR](https://github.com/BerriAI/litellm/pull/12465)
- **Navbar**
    - premium badge와 더 깔끔한 layout으로 user dropdown UI 개선 - [PR](https://github.com/BerriAI/litellm/pull/12502)
- **General**
    - 모든 page에서 Create 및 Back button layout 일관화 - [PR](https://github.com/BerriAI/litellm/pull/12542)
    - Show Password를 checkbox와 정렬 - [PR](https://github.com/BerriAI/litellm/pull/12538)
    - default user setting update를 yaml에 쓰지 않도록 방지(non-root env에서 오류 유발) - [PR](https://github.com/BerriAI/litellm/pull/12533)

#### Bugs
- **Model Hub**
    - /model_group/info의 중복 수정 - [PR](https://github.com/BerriAI/litellm/pull/12468)
- **MCP**
    - UI가 MCP access group을 object permission과 제대로 sync하지 않던 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/12523)

---

## Logging / Guardrail 통합 {#logging-guardrail-integrations}

#### Features
- **[Langfuse](../../docs/observability/langfuse_integration)**
    - version bump - [PR](https://github.com/BerriAI/litellm/pull/12376)
    - LANGFUSE_TRACING_ENVIRONMENT 지원 - [PR](https://github.com/BerriAI/litellm/pull/12376)
- **[Bedrock 가드레일](../../docs/proxy/guardrails/bedrock)**
    - 가드레일의 `BLOCKED` action에서 Bedrock output text 반환 - [PR](https://github.com/BerriAI/litellm/pull/12435)
- **[OTEL](../../docs/observability/opentelemetry_integration)**
    - `OTEL_RESOURCE_ATTRIBUTES` 지원 - [PR](https://github.com/BerriAI/litellm/pull/12468)
- **[가드레일 AI](../../docs/proxy/guardrails/guardrails_ai)**
    - pre-call + logging only guardrail(PII detection/competitor name) 지원 - [PR](https://github.com/BerriAI/litellm/pull/12506)
- **[가드레일](../../docs/proxy/guardrails/quick_start)**
    - [엔터프라이즈] 가드레일용 tag based mode 지원 - [PR](https://github.com/BerriAI/litellm/pull/12508), [시작하기](../../docs/proxy/guardrails/quick_start#-tag-based-guardrail-modes)
- **[OpenAI Moderations API](../../docs/proxy/guardrails/openai_moderation)**
    - 새 guardrail integration - [PR](https://github.com/BerriAI/litellm/pull/12519)
- **[Prometheus](../../docs/proxy/prometheus)**
    - tag based metric 지원(roo-code/cline/claude code engagement 측정용 prometheus metric 활성화) - [PR](https://github.com/BerriAI/litellm/pull/12534), [시작하기](../../docs/proxy/prometheus#custom-tags)
- **[Datadog LLM 관측성](../../docs/observability/datadog)**
    - DataDog LLM observability metric에서 비용을 추적하기 위한 `total_cost` field 추가 - [PR](https://github.com/BerriAI/litellm/pull/12467)

#### Bugs
- **[Prometheus](../../docs/proxy/prometheus)**
    - experimental `_by_tag` metric 제거(cardinality 문제 수정) - [PR](https://github.com/BerriAI/litellm/pull/12395)
- **[Slack Alerting](../../docs/proxy/alerting)**
    - outage 및 region outage alert용 slack alerting 수정 - [PR](https://github.com/BerriAI/litellm/pull/12464), [시작하기](../../docs/proxy/alerting#region-outage-alerting--enterprise-feature)

---

## 성능 / load balancing / 안정성 개선 {#performance-loadbalancing-reliability-improvements}

#### Bugs
- **[Responses API Bridge](../../docs/response_api#calling-non-responses-api-endpoints-responses-to-chatcompletions-bridge)**
    - Chat Completions로 fallback할 때 Responses API image 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/12204) s/o [@ryan-castner](https://github.com/ryan-castner)
- **aiohttp**
    - resource leak 방지를 위해 aiohttp client session을 올바르게 close - [PR](https://github.com/BerriAI/litellm/pull/12251)
- **Router**
    - router pattern match에 invalid deployment를 추가하지 않도록 수정 - [PR](https://github.com/BerriAI/litellm/pull/12459)


---

## 일반 proxy 개선 {#general-proxy-improvements}

#### Bugs
- **S3**
  - s3 config.yaml file에서 yaml safe load 사용 보장 - [PR](https://github.com/BerriAI/litellm/pull/12373)
- **Audit 로그**
  - model update용 audit log 추가 - [PR](https://github.com/BerriAI/litellm/pull/12396)
- **Startup**
  - max_budget 활성화 시 startup에서 여러 API key가 생성되는 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/12436)
- **Auth**
  - Auth에서 model group alias 해석(사용자가 underlying model 접근 권한을 갖는 경우 alias request 허용) - [PR](https://github.com/BerriAI/litellm/pull/12440)
- **config.yaml**
  - config.yaml에서 `environment_variables` parsing 수정 - [PR](https://github.com/BerriAI/litellm/pull/12482)
- **Security**
  - 실제 값 대신 prefix가 포함된 hashed jwt 기록 - [PR](https://github.com/BerriAI/litellm/pull/12524)

#### Features
- **MCP**
    - docker image의 mcp version 상향 - [PR](https://github.com/BerriAI/litellm/pull/12362)
- **Request Headers**
    - `forward_client_headers_to_llm_api`가 true이면 `anthropic-beta` header 전달 - [PR](https://github.com/BerriAI/litellm/pull/12462)

---

## 신규 기여자 {#new-contributors}
* @kanaka 님이 https://github.com/BerriAI/litellm/pull/12418 에서 첫 기여를 했습니다.
* @juancarlosm 님이 https://github.com/BerriAI/litellm/pull/12411 에서 첫 기여를 했습니다.
* @DmitriyAlergant 님이 https://github.com/BerriAI/litellm/pull/12356 에서 첫 기여를 했습니다.
* @Rayshard 님이 https://github.com/BerriAI/litellm/pull/12487 에서 첫 기여를 했습니다.
* @minghao51 님이 https://github.com/BerriAI/litellm/pull/12361 에서 첫 기여를 했습니다.
* @jdietzsch91 님이 https://github.com/BerriAI/litellm/pull/12488 에서 첫 기여를 했습니다.
* @iwinux 님이 https://github.com/BerriAI/litellm/pull/12473 에서 첫 기여를 했습니다.
* @andresC98 님이 https://github.com/BerriAI/litellm/pull/12413 에서 첫 기여를 했습니다.
* @EmaSuriano 님이 https://github.com/BerriAI/litellm/pull/12509 에서 첫 기여를 했습니다.
* @strawgate 님이 https://github.com/BerriAI/litellm/pull/12528 에서 첫 기여를 했습니다.
* @inf3rnus 님이 https://github.com/BerriAI/litellm/pull/12121 에서 첫 기여를 했습니다.

## **[Git Diff](https://github.com/BerriAI/litellm/compare/v1.74.0-stable...v1.74.3-stable)**
