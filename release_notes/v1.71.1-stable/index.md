---
title: v1.71.1-stable - 초당 요청 수(RPS) 2배 향상
slug: v1.71.1-stable
date: 2025-05-24T10:00:00
authors:
  - name: Krrish Dholakia
    title: LiteLLM CEO
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://media.licdn.com/dms/image/v2/D4D03AQGrlsJ3aqpHmQ/profile-displayphoto-shrink_400_400/B4DZSAzgP7HYAg-/0/1737327772964?e=1749686400&v=beta&t=Hkl3U8Ps0VtvNxX0BNNq24b4dtX5wQaPFp6oiKCIHD8
  - name: Ishaan Jaffer
    title: LiteLLM CTO
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg

hide_table_of_contents: false
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run
-e STORE_MODEL_IN_DB=True
-p 4000:4000
docker.litellm.ai/berriai/litellm:main-v1.71.1-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.71.1
```
</TabItem>
</Tabs>

## 주요 하이라이트

LiteLLM v1.71.1-stable이 이제 공개되었습니다. 이번 릴리스의 주요 하이라이트는 다음과 같습니다.

- **성능 개선**: 이제 LiteLLM은 인스턴스당 200 RPS까지 확장할 수 있으며 중앙값 응답 시간은 74ms입니다.
- **파일 권한**: OpenAI, Azure, VertexAI 전반에서 파일 접근을 제어합니다.
- **MCP x OpenAI**: OpenAI Responses API와 함께 MCP 서버를 사용합니다.



## 성능 개선

<Image img={require('../../img/perf_imp.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>


이번 릴리스는 모든 LLM API provider에 aiohttp 지원을 제공합니다. 따라서 LiteLLM은 40ms 중앙값 지연 오버헤드에서 인스턴스당 200 RPS까지 확장할 수 있습니다.

이 변경으로 해당 지연 오버헤드에서 LiteLLM이 확장할 수 있는 RPS가 두 배가 됩니다.

아래 플래그를 활성화해 이 기능을 사용할 수 있습니다. 1주일 뒤 기본값으로 전환할 예정입니다.


### 활성화 플래그

**LiteLLM Proxy에서**

환경 변수에 `USE_AIOHTTP_TRANSPORT=True`를 설정합니다.

```yaml showLineNumbers title="Environment Variable"
export USE_AIOHTTP_TRANSPORT="True"
```

**LiteLLM Python SDK에서**

aiohttp transport를 활성화하려면 `use_aiohttp_transport=True`를 설정합니다.

```python showLineNumbers title="Python SDK"
import litellm

litellm.use_aiohttp_transport = True # default is False, enable this to use aiohttp transport
result = litellm.completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello, world!"}],
)
print(result)
```

## 파일 권한

<Image img={require('../../img/files_api_graphic.png')}  style={{ width: '800px', height: 'auto' }} />

<br/>

이번 릴리스는 [LiteLLM Managed Files](../../docs/proxy/litellm_managed_files)에 [File Permissions](../../docs/proxy/litellm_managed_files#file-permissions)와 [Finetuning APIs](../../docs/proxy/managed_finetuning) 지원을 추가합니다. 이 기능은 다음 사용자에게 유용합니다.

- **Proxy 관리자**: 공유 OpenAI/Azure/Vertex 배포를 사용하더라도 사용자는 자신이 만든 파일만 조회/수정/삭제할 수 있습니다.
- **개발자**: Chat/Finetuning/Batch API 전반에서 Files를 사용할 수 있는 표준 인터페이스를 얻습니다.


## 신규 모델 / 업데이트된 모델

- **Gemini [VertexAI](https://docs.litellm.ai/docs/providers/vertex), [Google AI Studio](https://docs.litellm.ai/docs/providers/gemini)**
    - 신규 gemini 모델 - [PR 1](https://github.com/BerriAI/litellm/pull/10991), [PR 2](https://github.com/BerriAI/litellm/pull/10998)
        - `gemini-2.5-flash-preview-tts`
        - `gemini-2.0-flash-preview-image-generation`
        - `gemini/gemini-2.5-flash-preview-05-20`
        - `gemini-2.5-flash-preview-05-20`
- **[Anthropic](../../docs/providers/anthropic)**
    - Claude-4 model family 지원 - [PR](https://github.com/BerriAI/litellm/pull/11060)
- **[Bedrock](../../docs/providers/bedrock)**
    - Claude-4 model family 지원 - [PR](https://github.com/BerriAI/litellm/pull/11060)
    - Claude-4용 `reasoning_effort` 및 `thinking` 파라미터 지원 - [PR](https://github.com/BerriAI/litellm/pull/11114)
- **[VertexAI](../../docs/providers/vertex)**
    - Claude-4 model family 지원 - [PR](https://github.com/BerriAI/litellm/pull/11060)
    - Global endpoints 지원 - [PR](https://github.com/BerriAI/litellm/pull/10658)
    - authorized_user credentials type 지원 - [PR](https://github.com/BerriAI/litellm/pull/10899)
- **[xAI](../../docs/providers/xai)**
    - `xai/grok-3` 가격 정보 - [PR](https://github.com/BerriAI/litellm/pull/11028)
- **[LM Studio](../../docs/providers/lm_studio)**
    - Structured JSON schema outputs 지원 - [PR](https://github.com/BerriAI/litellm/pull/10929)
- **[SambaNova](../../docs/providers/sambanova)**
    - 모델 및 파라미터 업데이트 - [PR](https://github.com/BerriAI/litellm/pull/10900)
- **[Databricks](../../docs/providers/databricks)**
    - Llama 4 Maverick 모델 비용 - [PR](https://github.com/BerriAI/litellm/pull/11008)
    - Claude 3.7 Sonnet 출력 토큰 비용 수정 - [PR](https://github.com/BerriAI/litellm/pull/11007)
- **[Azure](../../docs/providers/azure)**
    - Mistral Medium 25.05 지원 - [PR](https://github.com/BerriAI/litellm/pull/11063)
    - 인증서 기반 인증 지원 - [PR](https://github.com/BerriAI/litellm/pull/11069)
- **[Mistral](../../docs/providers/mistral)**
    - devstral-small-2505 모델 가격 및 context window - [PR](https://github.com/BerriAI/litellm/pull/11103)
- **[Ollama](../../docs/providers/ollama)**
    - 와일드카드 모델 지원 - [PR](https://github.com/BerriAI/litellm/pull/10982)
- **[CustomLLM](../../docs/providers/custom_llm_server)**
    - Embeddings 지원 추가 - [PR](https://github.com/BerriAI/litellm/pull/10980)
- **[Featherless AI](../../docs/providers/featherless_ai)**
    - 4200개 이상의 모델 접근 지원 - [PR](https://github.com/BerriAI/litellm/pull/10596)

## LLM API 엔드포인트

- **[Image Edits](../../docs/image_generation)**
    - `/v1/images/edits` - /images/edits 엔드포인트 지원 - [PR](https://github.com/BerriAI/litellm/pull/11020) [PR](https://github.com/BerriAI/litellm/pull/11123)
    - 콘텐츠 정책 위반 오류 매핑 - [PR](https://github.com/BerriAI/litellm/pull/11113)
- **[Responses API](../../docs/response_api)**
    - Responses API용 MCP 지원 - [PR](https://github.com/BerriAI/litellm/pull/11029)
- **[Files API](../../docs/fine_tuning)**
    - finetuning용 LiteLLM Managed Files 지원 - [PR](https://github.com/BerriAI/litellm/pull/11039) [PR](https://github.com/BerriAI/litellm/pull/11040)
    - 파일 작업(retrieve/list/delete) 검증 - [PR](https://github.com/BerriAI/litellm/pull/11081)

## 관리 엔드포인트 / UI

- **Teams**
    - Key 및 멤버 수 표시 - [PR](https://github.com/BerriAI/litellm/pull/10950)
    - Spend를 소수점 4자리로 반올림 - [PR](https://github.com/BerriAI/litellm/pull/11013)
    - Organization 및 team 생성 버튼 위치 조정 - [PR](https://github.com/BerriAI/litellm/pull/10948)
- **Keys**
    - Key 재할당 및 'updated at' 열 추가 - [PR](https://github.com/BerriAI/litellm/pull/10960)
    - 생성 중 model access group 표시 - [PR](https://github.com/BerriAI/litellm/pull/10965)
- **로그**
    - 로그의 Model 필터 - [PR](https://github.com/BerriAI/litellm/pull/11048)
    - Passthrough endpoint 오류 로그 지원 - [PR](https://github.com/BerriAI/litellm/pull/10990)
- **가드레일**
    - Config.yaml guardrails 표시 - [PR](https://github.com/BerriAI/litellm/pull/10959)
- **조직/사용자**
    - Spend를 소수점 4자리로 반올림 - [PR](https://github.com/BerriAI/litellm/pull/11023)
    - 사용자를 팀에 추가할 때 명확한 오류 표시 - [PR](https://github.com/BerriAI/litellm/pull/10978)
- **Audit 로그**
    - Audit 로그용 `/list` 및 `/info` 엔드포인트 - [PR](https://github.com/BerriAI/litellm/pull/11102)

## Logging / Alerting 연동

- **[Prometheus](../../docs/proxy/prometheus)**
    - proxy_* metrics에서 `route` 추적 - [PR](https://github.com/BerriAI/litellm/pull/10992)
- **[Langfuse](../../docs/proxy/logging#langfuse)**
    - `prompt_label` 파라미터 지원 - [PR](https://github.com/BerriAI/litellm/pull/11018)
    - 일관된 modelParams 로깅 - [PR](https://github.com/BerriAI/litellm/pull/11018)
- **[DeepEval/ConfidentAI](../../docs/proxy/logging#deepeval)**
    - proxy 및 SDK 로깅 활성화 - [PR](https://github.com/BerriAI/litellm/pull/10649)
- **[Logfire](../../docs/proxy/logging)**
    - Logfire 사용 시 otel proxy server 초기화 수정 - [PR](https://github.com/BerriAI/litellm/pull/11091)

## 인증 & Security

- **[JWT 인증](../../docs/proxy/token_auth)**
    - JWT authentication으로 사용자를 upsert할 때 기본 internal user 파라미터 적용 지원 - [PR](https://github.com/BerriAI/litellm/pull/10995)
    - JWT authentication으로 사용자를 upsert할 때 사용자를 team에 매핑 - [PR](https://github.com/BerriAI/litellm/pull/11108)
- **Custom Auth**
    - custom auth와 API key auth 간 전환 지원 - [PR](https://github.com/BerriAI/litellm/pull/11070)

## 성능 / 안정성 개선

- **aiohttp Transport**
    - 중앙값 지연 시간 97% 감소(feature flag 적용) - [PR](https://github.com/BerriAI/litellm/pull/11097) [PR](https://github.com/BerriAI/litellm/pull/11132)
- **백그라운드 상태 확인**
    - 안정성 개선 - [PR](https://github.com/BerriAI/litellm/pull/10887)
- **Response Handling**
    - streaming status code 감지 개선 - [PR](https://github.com/BerriAI/litellm/pull/10962)
    - Response ID 전파 개선 - [PR](https://github.com/BerriAI/litellm/pull/11006)
- **Thread Management**
    - 안정성을 위해 오류 생성 thread 제거 - [PR](https://github.com/BerriAI/litellm/pull/11066)

## 일반 Proxy 개선

- **[Proxy CLI](../../docs/proxy/cli)**
    - 서버 시작 건너뛰기 플래그 - [PR](https://github.com/BerriAI/litellm/pull/10665)
    - 제공된 경우 DATABASE_URL override 방지 - [PR](https://github.com/BerriAI/litellm/pull/11076)
- **Model Management**
    - 모델 업데이트 후 캐시 삭제 및 reload - [PR](https://github.com/BerriAI/litellm/pull/10853)
    - Computer use 지원 추적 - [PR](https://github.com/BerriAI/litellm/pull/10881)
- **Helm Chart**
    - LoadBalancer class 지원 - [PR](https://github.com/BerriAI/litellm/pull/11064)

## 버그 수정

이번 릴리스에는 안정성과 신뢰성을 높이기 위한 여러 버그 수정이 포함되어 있습니다.

- **LLM Provider 수정**
    - VertexAI: 
        - quota_project_id 파라미터 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/10915)
        - credential refresh 예외 수정 - [PR](https://github.com/BerriAI/litellm/pull/10969)
    - Cohere: 
        LiteLLM UI를 통한 Cohere 모델 추가 수정 - [PR](https://github.com/BerriAI/litellm/pull/10822)
    - Anthropic: 
        - /v1/messages의 streaming dict object 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/11032)
    - OpenRouter: 
        - stream usage ID 문제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11004)

- **인증 & Users**
    - 초대 이메일 링크 생성 수정 - [PR](https://github.com/BerriAI/litellm/pull/10958) 
    - JWT authentication 기본 role 수정 - [PR](https://github.com/BerriAI/litellm/pull/10995)
    - 사용자 budget reset 기능 수정 - [PR](https://github.com/BerriAI/litellm/pull/10993)
    - SSO user 호환성 및 이메일 검증 수정 - [PR](https://github.com/BerriAI/litellm/pull/11106)

- **데이터베이스 & 인프라**
    - DB connection 파라미터 처리 수정 - [PR](https://github.com/BerriAI/litellm/pull/10842)
    - 이메일 초대 링크 수정 - [PR](https://github.com/BerriAI/litellm/pull/11031)

- **UI & Display**
    - 인수가 필요 없는 경우 MCP tool 렌더링 수정 - [PR](https://github.com/BerriAI/litellm/pull/11012)
    - team model alias 삭제 수정 - [PR](https://github.com/BerriAI/litellm/pull/11121)
    - team viewer 권한 수정 - [PR](https://github.com/BerriAI/litellm/pull/11127)

- **Model & Routing**
    - route 요청의 team model mapping 수정 - [PR](https://github.com/BerriAI/litellm/pull/11111)
    - 표준 optional parameter 전달 수정 - [PR](https://github.com/BerriAI/litellm/pull/11124)


## 신규 기여자
* [@DarinVerheijke](https://github.com/DarinVerheijke)님이 PR [#10596](https://github.com/BerriAI/litellm/pull/10596)에서 첫 기여를 했습니다.
* [@estsauver](https://github.com/estsauver)님이 PR [#10929](https://github.com/BerriAI/litellm/pull/10929)에서 첫 기여를 했습니다.
* [@mohittalele](https://github.com/mohittalele)님이 PR [#10665](https://github.com/BerriAI/litellm/pull/10665)에서 첫 기여를 했습니다.
* [@pselden](https://github.com/pselden)님이 PR [#10899](https://github.com/BerriAI/litellm/pull/10899)에서 첫 기여를 했습니다.
* [@unrealandychan](https://github.com/unrealandychan)님이 PR [#10842](https://github.com/BerriAI/litellm/pull/10842)에서 첫 기여를 했습니다.
* [@dastaiger](https://github.com/dastaiger)님이 PR [#10946](https://github.com/BerriAI/litellm/pull/10946)에서 첫 기여를 했습니다.
* [@slytechnical](https://github.com/slytechnical)님이 PR [#10881](https://github.com/BerriAI/litellm/pull/10881)에서 첫 기여를 했습니다.
* [@daarko10](https://github.com/daarko10)님이 PR [#11006](https://github.com/BerriAI/litellm/pull/11006)에서 첫 기여를 했습니다.
* [@sorenmat](https://github.com/sorenmat)님이 PR [#10658](https://github.com/BerriAI/litellm/pull/10658)에서 첫 기여를 했습니다.
* [@matthid](https://github.com/matthid)님이 PR [#10982](https://github.com/BerriAI/litellm/pull/10982)에서 첫 기여를 했습니다.
* [@jgowdy-godaddy](https://github.com/jgowdy-godaddy)님이 PR [#11032](https://github.com/BerriAI/litellm/pull/11032)에서 첫 기여를 했습니다.
* [@bepotp](https://github.com/bepotp)님이 PR [#11008](https://github.com/BerriAI/litellm/pull/11008)에서 첫 기여를 했습니다.
* [@jmorenoc-o](https://github.com/jmorenoc-o)님이 PR [#11031](https://github.com/BerriAI/litellm/pull/11031)에서 첫 기여를 했습니다.
* [@martin-liu](https://github.com/martin-liu)님이 PR [#11076](https://github.com/BerriAI/litellm/pull/11076)에서 첫 기여를 했습니다.
* [@gunjan-solanki](https://github.com/gunjan-solanki)님이 PR [#11064](https://github.com/BerriAI/litellm/pull/11064)에서 첫 기여를 했습니다.
* [@tokoko](https://github.com/tokoko)님이 PR [#10980](https://github.com/BerriAI/litellm/pull/10980)에서 첫 기여를 했습니다.
* [@spike-spiegel-21](https://github.com/spike-spiegel-21)님이 PR [#10649](https://github.com/BerriAI/litellm/pull/10649)에서 첫 기여를 했습니다.
* [@kreatoo](https://github.com/kreatoo)님이 PR [#10927](https://github.com/BerriAI/litellm/pull/10927)에서 첫 기여를 했습니다.
* [@baejooc](https://github.com/baejooc)님이 PR [#10887](https://github.com/BerriAI/litellm/pull/10887)에서 첫 기여를 했습니다.
* [@keykbd](https://github.com/keykbd)님이 PR [#11114](https://github.com/BerriAI/litellm/pull/11114)에서 첫 기여를 했습니다.
* [@dalssoft](https://github.com/dalssoft)님이 PR [#11088](https://github.com/BerriAI/litellm/pull/11088)에서 첫 기여를 했습니다.
* [@jtong99](https://github.com/jtong99)님이 PR [#10853](https://github.com/BerriAI/litellm/pull/10853)에서 첫 기여를 했습니다.

## 데모 인스턴스

변경 사항을 테스트할 수 있는 데모 인스턴스입니다.

- Instance: https://demo.litellm.ai/
- 로그인 정보:
    - Username: admin
    - Password: sk-1234

## [Git Diff](https://github.com/BerriAI/litellm/releases)
