---
title: "v1.72.6-stable - MCP Gateway 권한 관리"
slug: "v1-72-6-stable"
date: 2025-06-14T10:00:00
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
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.72.6-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.72.6.post2
```

</TabItem>
</Tabs>


## TLDR


* **업그레이드 이유**
    - Claude Code의 Codex-mini: 이제 Claude Code를 통해 `codex-mini`(OpenAI 코드 어시스턴트 모델)를 사용할 수 있습니다.
    - MCP 권한 관리: LiteLLM에서 Keys, Teams, Organizations(entities)별 MCP Servers 권한을 관리할 수 있습니다.
    - UI: logs view의 auto refresh를 켜거나 끌 수 있습니다.
    - 속도 제한: output token 전용 rate limiting을 지원합니다.
* **읽어야 할 대상**
    - `/v1/messages` API(Claude Code)를 사용하는 팀
    - Teams using **MCP**
    - self-hosted model 접근 권한을 제공하고 rate limit을 설정하는 팀
* **업그레이드 위험도**
    - **낮음**
        - 기존 기능이나 package update에 대한 주요 변경은 없습니다.


---

## 주요 하이라이트 {#key-highlights}


### MCP 권한 관리 {#mcp-permissions-management}

<Image img={require('../../img/release_notes/mcp_permissions.png')}/>

이번 릴리스에서는 LiteLLM에서 Keys, Teams, Organizations(entities)별 MCP Servers 권한을 관리할 수 있습니다. MCP client가 tools 목록을 조회하면 LiteLLM은 해당 entity가 접근 권한을 가진 tools만 반환합니다.

모든 사용자가 접근하면 안 되는 제한 데이터(예: Jira MCP)에 대한 접근을 제어해야 하는 사용 사례에 적합합니다.

Proxy Admin은 접근 제어와 함께 모든 MCP Servers를 중앙에서 관리할 수 있습니다. 개발자는 자신에게 할당된 MCP tools만 보게 됩니다.




### Claude Code의 Codex-mini {#codex-mini-on-claude-code}

<Image img={require('../../img/release_notes/codex_on_claude_code.jpg')} />

이번 릴리스에서는 Claude Code를 통한 `codex-mini`(OpenAI 코드 어시스턴트 모델) 호출을 지원합니다.

LiteLLM이 `o3-pro`를 포함한 모든 Responses API model을 `/chat/completions` 및 `/v1/messages` endpoints로 호출할 수 있게 하면서 동작합니다. 포함 범위는 다음과 같습니다.

- Streaming 호출
- Non-streaming 호출
- Responses API models의 성공 및 실패 cost tracking

[지금 사용하는 방법](../../docs/tutorials/claude_responses_api)을 확인하세요.




---


## New / Updated 모델

### 가격 / Context Window 업데이트 {#pricing--context-window-updates}

| Provider    | Model                                  | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 유형 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | -------------------- |
| VertexAI   | `vertex_ai/claude-opus-4`               | 200K           | $15.00              | $75.00               | 신규 |
| OpenAI   | `gpt-4o-audio-preview-2025-06-03`             | 128k           | $2.5 (text), $40 (audio)              | $10 (text), $80 (audio)               | 신규 |
| OpenAI | `o3-pro` | 200k | 20 | 80 | 신규 |
| OpenAI | `o3-pro-2025-06-10` | 200k | 20 | 80 | 신규 |
| OpenAI | `o3` | 200k | 2 | 8 | 업데이트 |
| OpenAI | `o3-2025-04-16` | 200k | 2 | 8 | 업데이트 |
| Azure | `azure/gpt-4o-mini-transcribe` | 16k | 1.25 (text), 3 (audio) | 5 (text) | 신규 |
| Mistral | `mistral/magistral-medium-latest` | 40k | 2 | 5 | 신규 |
| Mistral | `mistral/magistral-small-latest` | 40k | 0.5 | 1.5 | 신규 |

- Deepgram: `nova-3` 초당 비용 가격 책정을 [이제 지원합니다](https://github.com/BerriAI/litellm/pull/11634).

### Updated 모델
#### Bugs
- **[Watsonx](../../docs/providers/watsonx)**
    - Watsonx deployments에서 JSON error를 일으키던 space id 무시 - [PR](https://github.com/BerriAI/litellm/pull/11527)
- **[Ollama](../../docs/providers/ollama)**
    - streaming calls용 tool call id 설정 - [PR](https://github.com/BerriAI/litellm/pull/11528)
- **Gemini ([VertexAI](../../docs/providers/vertex) + [Google AI Studio](../../docs/providers/gemini))**
    - tool call indexes 수정 - [PR](https://github.com/BerriAI/litellm/pull/11558)
    - function calls의 arguments에서 빈 문자열 처리 - [PR](https://github.com/BerriAI/litellm/pull/11601)
    - file url에서 추론할 때 audio/ogg mime type 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11635)
- **[Custom LLM](../../docs/providers/custom_llm_server)**
    - custom_llm embedding methods로 api_base, api_key, litellm_params_dict 전달 수정 - [PR](https://github.com/BerriAI/litellm/pull/11450) s/o [ElefHead](https://github.com/ElefHead)
- **[Huggingface](../../docs/providers/huggingface)**
    - endpoint url에 /chat/completions가 없을 때 추가 - [PR](https://github.com/BerriAI/litellm/pull/11630)
- **[Deepgram](../../docs/providers/deepgram)**
    - async httpx calls 지원 - [PR](https://github.com/BerriAI/litellm/pull/11641)
- **[Anthropic](../../docs/providers/anthropic)**
    - prefix가 설정된 경우 assistant content 시작 부분에 추가 - [PR](https://github.com/BerriAI/litellm/pull/11719)

#### Features
- **[VertexAI](../../docs/providers/vertex)**
    - passthrough에서 env var로 설정한 vertex credentials 지원 - [PR](https://github.com/BerriAI/litellm/pull/11527)
    - 모델이 해당 위치에서만 제공될 때 `global` region 선택 지원 - [PR](https://github.com/BerriAI/litellm/pull/11566)
    - Anthropic passthrough cost calculation 및 token tracking - [PR](https://github.com/BerriAI/litellm/pull/11611)
    - passthrough에서 `global` vertex region 지원 - [PR](https://github.com/BerriAI/litellm/pull/11661)
- **[Anthropic](../../docs/providers/anthropic)**
    - `none` tool choice param 지원 - [PR](https://github.com/BerriAI/litellm/pull/11695), [시작하기](../../docs/providers/anthropic#disable-tool-calling)
- **[Perplexity](../../docs/providers/perplexity)**
    - `reasoning_effort` 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11562), [시작하기](../../docs/providers/perplexity#reasoning-effort)
- **[Mistral](../../docs/providers/mistral)**
    - mistral reasoning 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/11642), [시작하기](../../docs/providers/mistral#reasoning)
- **[SGLang](../../docs/providers/openai_compatible)**
    - 적절한 처리를 위해 context window exceeded error 매핑 - [PR](https://github.com/BerriAI/litellm/pull/11575/)
- **[Deepgram](../../docs/providers/deepgram)**
    - provider specific params 지원 - [PR](https://github.com/BerriAI/litellm/pull/11638)
- **[Azure](../../docs/providers/azure)**
    - content safety filter results 반환 - [PR](https://github.com/BerriAI/litellm/pull/11655)
---

## LLM API Endpoints {#llm-api-endpoints}

#### Bugs
- **[Chat Completion](../../docs/completion/input)**
    - Streaming - chunks 전반에서 일관된 `created` 보장 - [PR](https://github.com/BerriAI/litellm/pull/11528)
#### Features
- **MCP**
    - MCP Permission Management controls 추가 - [PR](https://github.com/BerriAI/litellm/pull/11598), [문서](../../docs/mcp#-mcp-permission-management)
    - MCP List 및 Call Tool operations용 permission management 추가 - [PR](https://github.com/BerriAI/litellm/pull/11682), [문서](../../docs/mcp#-mcp-permission-management)
    - Streamable HTTP server 지원 - [PR](https://github.com/BerriAI/litellm/pull/11628), [PR](https://github.com/BerriAI/litellm/pull/11645), [문서](../../docs/mcp#using-your-mcp)
    - MCP tools list 및 calling에 Experimental dedicated Rest endpoints 사용 - [PR](https://github.com/BerriAI/litellm/pull/11684)
- **[Responses API](../../docs/response_api)**
    - 신규 API Endpoint - input items 목록 조회 - [PR](https://github.com/BerriAI/litellm/pull/11602)
    - OpenAI 및 Azure OpenAI용 background mode - [PR](https://github.com/BerriAI/litellm/pull/11640)
    - responses api requests에서 Langfuse 및 기타 Logging 지원 - [PR](https://github.com/BerriAI/litellm/pull/11685)
- **[Chat Completions](../../docs/completion/input)**
    - Responses API용 bridge - `/chat/completions` 및 `/v1/messages`로 codex-mini 호출 허용 - [PR](https://github.com/BerriAI/litellm/pull/11632), [PR](https://github.com/BerriAI/litellm/pull/11685)


---

## 비용 추적

#### Bugs
- **[End Users](../../docs/proxy/customers)**
    - budget duration 기준으로 enduser spend 및 budget reset date 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/8460) (s/o [laurien16](https://github.com/laurien16))
- **[Custom Pricing](../../docs/proxy/custom_pricing)**
    - scientific notation 문자열을 int로 변환 - [PR](https://github.com/BerriAI/litellm/pull/11655)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### Bugs
- **[Users](../../docs/proxy/users)**
    - `/user/info` - user id에 `+`가 있는 user 전달 수정
    - admin 주도 password reset flow 추가 - [PR](https://github.com/BerriAI/litellm/pull/11618)
    - default user settings UI rendering error 수정 - [PR](https://github.com/BerriAI/litellm/pull/11674)
- **[Budgets](../../docs/proxy/users)**
    - 새 user budget 생성 시 success message 수정 - [PR](https://github.com/BerriAI/litellm/pull/11608)

#### Features
- **Leftnav**
    - UI에 남은 enterprise users 표시
- **MCP**
    - 새 server add form - [PR](https://github.com/BerriAI/litellm/pull/11604)
    - mcp servers 편집 허용 - [PR](https://github.com/BerriAI/litellm/pull/11693)
- **모델**
    - UI에 deepgram models 추가
    - UI에서 Model Access Group 지원 - [PR](https://github.com/BerriAI/litellm/pull/11719)
- **Keys**
    - 긴 user id 자르기 - [PR](https://github.com/BerriAI/litellm/pull/11488)
- **로그**
    - logs view에 live tail feature 추가, high traffic 상황에서 사용자가 auto refresh를 비활성화할 수 있음 - [PR](https://github.com/BerriAI/litellm/pull/11712)
    - Audit 로그 - preview screenshot - [PR](https://github.com/BerriAI/litellm/pull/11715)

---

## Logging / 가드레일 Integrations

#### Bugs
- **[Arize](../../docs/observability/arize_integration)**
    - space_key header를 space_id로 변경 - [PR](https://github.com/BerriAI/litellm/pull/11595) (s/o [vanities](https://github.com/vanities))
- **[Prometheus](../../docs/proxy/prometheus)**
    - total requests increment 수정 - [PR](https://github.com/BerriAI/litellm/pull/11718)

#### Features
- **[Lasso 가드레일](../../docs/proxy/guardrails/lasso_security)**
    - [신규] Lasso 가드레일 지원 - [PR](https://github.com/BerriAI/litellm/pull/11565)
- **[Users](../../docs/proxy/users)**
    - `/user/new`에 새 `organizations` param 추가 - 생성 시 users를 orgs에 추가 가능 - [PR](https://github.com/BerriAI/litellm/pull/11572/files)
- **bridge logic 사용 시 double logging 방지** - [PR](https://github.com/BerriAI/litellm/pull/11687)

---

## Performance / Reliability 개선 {#performance--reliability-improvements}

#### Bugs
- **[Tag based routing](../../docs/proxy/tag_routing)**
    - request가 tag를 지정한 경우 `default` models를 고려하지 않음 - [PR](https://github.com/BerriAI/litellm/pull/11454) (s/o [thiagosalvatore](https://github.com/thiagosalvatore))

#### Features
- **[캐싱](../../docs/caching/all_caches)**
    - disk cache dependencies 추가를 위한 새 optional `litellm[caching]` pip install - [PR](https://github.com/BerriAI/litellm/pull/11600)

---

## 일반 Proxy 개선 {#general-proxy-improvements}

#### Bugs
- **aiohttp**
    - aiohttp transport의 transfer encoding error 수정 - [PR](https://github.com/BerriAI/litellm/pull/11561)

#### Features
- **aiohttp**
    - aiohttp transport용 System Proxy Support 활성화 - [PR](https://github.com/BerriAI/litellm/pull/11616) (s/o [idootop](https://github.com/idootop))
- **CLI**
    - 모든 commands가 server URL을 표시하도록 변경 - [PR](https://github.com/BerriAI/litellm/pull/10801)
- **Unicorn**
    - keep alive timeout 설정 허용 - [PR](https://github.com/BerriAI/litellm/pull/11594)
- **실험적 Rate Limiting v2** (`EXPERIMENTAL_MULTI_INSTANCE_RATE_LIMITING="True"`로 활성화)
    - output_tokens만 기준으로 rate limit 지정 지원 - [PR](https://github.com/BerriAI/litellm/pull/11646)
    - call failure 시 parallel requests 감소 - [PR](https://github.com/BerriAI/litellm/pull/11646)
    - In-memory 전용 rate limiting 지원 - [PR](https://github.com/BerriAI/litellm/pull/11646)
    - key/user/team별 remaining rate limits 반환 - [PR](https://github.com/BerriAI/litellm/pull/11646)
- **Helm**
    - migrations-job.yaml에서 extraContainers 지원 - [PR](https://github.com/BerriAI/litellm/pull/11649)




---

## 신규 기여자 {#new-contributors}
* @laurien16 님이 https://github.com/BerriAI/litellm/pull/8460 에서 첫 기여를 했습니다.
* @fengbohello 님이 https://github.com/BerriAI/litellm/pull/11547 에서 첫 기여를 했습니다.
* @lapinek 님이 https://github.com/BerriAI/litellm/pull/11570 에서 첫 기여를 했습니다.
* @yanwork 님이 https://github.com/BerriAI/litellm/pull/11586 에서 첫 기여를 했습니다.
* @dhs-shine 님이 https://github.com/BerriAI/litellm/pull/11575 에서 첫 기여를 했습니다.
* @ElefHead 님이 https://github.com/BerriAI/litellm/pull/11450 에서 첫 기여를 했습니다.
* @idootop 님이 https://github.com/BerriAI/litellm/pull/11616 에서 첫 기여를 했습니다.
* @stevenaldinger 님이 https://github.com/BerriAI/litellm/pull/11649 에서 첫 기여를 했습니다.
* @thiagosalvatore 님이 https://github.com/BerriAI/litellm/pull/11454 에서 첫 기여를 했습니다.
* @vanities 님이 https://github.com/BerriAI/litellm/pull/11595 에서 첫 기여를 했습니다.
* @alvarosevilla95 님이 https://github.com/BerriAI/litellm/pull/11661 에서 첫 기여를 했습니다.

---

## Demo Instance {#demo-instance}

변경 사항을 테스트할 수 있는 Demo Instance입니다.

- Instance: https://demo.litellm.ai/
- Login Credentials:
    - Username: admin
    - Password: sk-1234

## [Git Diff](https://github.com/BerriAI/litellm/compare/v1.72.2-stable...1.72.6.rc)
