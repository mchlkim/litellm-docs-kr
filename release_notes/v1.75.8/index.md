---
title: "v1.75.8-stable - 팀 멤버 Rate Limits"
slug: "v1-75-8"
date: 2025-08-16T10:00:00
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

## 이 버전 배포

<Tabs>
<TabItem value="docker" label="Docker">

``` showLineNumbers title="docker run litellm"
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:v1.75.8-stable
```
</TabItem>

<TabItem value="pip" label="Pip">

``` showLineNumbers title="pip install litellm"
pip install litellm==1.75.8
```

</TabItem>
</Tabs>

---

## 주요 하이라이트

- **팀 멤버 Rate Limits** - JWT 인증 지원과 함께 팀 멤버별 개별 rate limit을 설정할 수 있습니다.
- **성능 개선** - OpenAI 호출에서 100+ RPS 개선을 제공하는 새로운 실험적 HTTP handler 플래그가 추가되었습니다.
- **GPT-5 모델 패밀리 지원** - `reasoning_effort` 파라미터와 Azure OpenAI 통합을 포함해 OpenAI GPT-5 모델을 완전히 지원합니다.
- **Azure AI Flux 이미지 생성** - Azure AI의 Flux 이미지 생성 모델을 지원합니다.

---

## 팀 멤버 Rate Limits

<Image 
  img={require('../../img/release_notes/team_member_rate_limits.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM 팀 멤버 Rate Limits UI
</p>


이번 릴리스에서는 팀 안의 개별 멤버(머신 사용자 포함)에 rate limit을 설정하는 기능이 추가되었습니다. 이제 팀은 각 agent에 자체 rate limit을 부여해 트래픽이 많은 agent가 다른 agent나 사용자에게 영향을 주지 않도록 할 수 있습니다.

Agent는 사용자와 동일한 팀 역할로 JWT를 사용해 LiteLLM에 인증할 수 있으며, 동시에 agent별 rate limit이 계속 적용됩니다.


## 신규 모델 / 업데이트된 모델

#### 신규 모델 지원

| Provider    | Model                                  | Context Window | Input ($/1M tokens) | Output ($/1M tokens) | 기능 |
| ----------- | -------------------------------------- | -------------- | ------------------- | -------------------- | -------- |
| Azure AI | `azure_ai/FLUX-1.1-pro` | - | - | $40/image | 이미지 생성 |
| Azure AI | `azure_ai/FLUX.1-Kontext-pro` | - | - | $40/image | 이미지 생성 |
| Vertex AI | `vertex_ai/deepseek-ai/deepseek-r1-0528-maas` | 65k | $1.35 | $5.4 | 채팅 완료 + reasoning |
| OpenRouter | `openrouter/deepseek/deepseek-chat-v3-0324` | 65k | $0.14 | $0.28 | 채팅 완료 |


#### 기능

- **[OpenAI](../../docs/providers/openai)**
    - GPT-5 모델 패밀리에 `reasoning_effort` 파라미터 지원 추가 - [PR #13475](https://github.com/BerriAI/litellm/pull/13475), [시작하기](../../docs/providers/openai#openai-chat-completion-models)
    - Responses API에서 `reasoning` 파라미터 지원 - [PR #13475](https://github.com/BerriAI/litellm/pull/13475), [시작하기](../../docs/response_api)
- **[Azure OpenAI](../../docs/providers/azure/azure)**
    - max_tokens와 `reasoning` 파라미터를 포함한 GPT-5 지원 - [PR #13510](https://github.com/BerriAI/litellm/pull/13510), [시작하기](../../docs/providers/azure/azure#gpt-5-models)
- **[AWS Bedrock](../../docs/providers/bedrock)**
    - bedrock gpt-oss 모델 패밀리의 streaming 지원 - [PR #13346](https://github.com/BerriAI/litellm/pull/13346), [시작하기](../../docs/providers/bedrock#openai-gpt-oss)
    - `bedrock/converse/<model>`에 대한 `/messages` endpoint 호환성 - [PR #13627](https://github.com/BerriAI/litellm/pull/13627)
    - assistant 및 tool 메시지의 cache point 지원 - [PR #13640](https://github.com/BerriAI/litellm/pull/13640)
- **[Azure AI](../../docs/providers/azure)**
    - 새로운 Azure AI Flux Image Generation provider - [PR #13592](https://github.com/BerriAI/litellm/pull/13592), [시작하기](../../docs/providers/azure_ai_img)
    - 이미지 생성용 Content-Type header 수정 - [PR #13584](https://github.com/BerriAI/litellm/pull/13584)
- **[CometAPI](../../docs/providers/comet)**
    - chat completions 및 streaming을 제공하는 새 provider 지원 - [PR #13458](https://github.com/BerriAI/litellm/pull/13458)
- **[SambaNova](../../docs/providers/sambanova)**
    - embedding 모델 지원 추가 - [PR #13308](https://github.com/BerriAI/litellm/pull/13308), [시작하기](../../docs/providers/sambanova#sambanova---embeddings)
- **[Vertex AI](../../docs/providers/vertex)**
    - Gemini CLI 통합을 위한 `/countTokens` endpoint 지원 추가 - [PR #13545](https://github.com/BerriAI/litellm/pull/13545)
    - VertexAI 모델용 token counter 지원 - [PR #13558](https://github.com/BerriAI/litellm/pull/13558)
- **[hosted_vllm](../../docs/providers/vllm)**
    - `reasoning_effort` 파라미터 지원 추가 - [PR #13620](https://github.com/BerriAI/litellm/pull/13620), [시작하기](../../docs/providers/vllm#reasoning-effort)

#### 버그

- **[OCI](../../docs/providers/oci)**
    - streaming 문제 수정 - [PR #13437](https://github.com/BerriAI/litellm/pull/13437)
- **[Ollama](../../docs/providers/ollama)**
    - 'thinking' 필드가 포함된 GPT-OSS streaming 수정 - [PR #13375](https://github.com/BerriAI/litellm/pull/13375)
- **[VolcEngine](../../docs/providers/volcengine)**
    - thinking disabled 파라미터 처리 수정 - [PR #13598](https://github.com/BerriAI/litellm/pull/13598)
- **[Streaming](../../docs/completion/stream)**
    - 'finish_reason' chunk indexing 일관화 - [PR #13560](https://github.com/BerriAI/litellm/pull/13560)
---

## LLM API Endpoints

#### 기능

- **[/messages](../../docs/anthropic/messages)**
    - non-anthropic 모델에서도 tool use arguments가 올바르게 반환되도록 수정 - [PR #13638](https://github.com/BerriAI/litellm/pull/13638)

#### 버그

- **[Real-time API](../../docs/realtime)**
    - intent가 없는 시나리오의 endpoint 수정 - [PR #13476](https://github.com/BerriAI/litellm/pull/13476)
- **[Responses API](../../docs/response_api)**
    - Responses API에서 `stream=True` + `background=True` 조합 수정 - [PR #13654](https://github.com/BerriAI/litellm/pull/13654)

---

## [MCP Gateway](../../docs/mcp)

#### 기능

- **Access Control 및 설정**
    - access group과 description 지원을 포함해 MCPServerManager 개선 - [PR #13549](https://github.com/BerriAI/litellm/pull/13549)

#### 버그

- **인증**
    - MCP gateway key authentication 수정 - [PR #13630](https://github.com/BerriAI/litellm/pull/13630)

[더 읽기](../../docs/mcp)

---

## 관리 Endpoints / UI

#### 기능

- **팀 관리**
    - 팀 멤버 Rate Limits 구현 - [PR #13601](https://github.com/BerriAI/litellm/pull/13601)
    - 팀 멤버 rate limits를 위한 JWT authentication 지원 - [PR #13601](https://github.com/BerriAI/litellm/pull/13601)
    - UI에서 팀 멤버 TPM/RPM limits 표시 - [PR #13662](https://github.com/BerriAI/litellm/pull/13662)
    - 팀 멤버 RPM/TPM limits 편집 허용 - [PR #13669](https://github.com/BerriAI/litellm/pull/13669)
    - Teams Settings에서 TPM 및 RPM 해제 허용 - [PR #13430](https://github.com/BerriAI/litellm/pull/13430)
    - Team Member Permissions Page의 access 열 변경 - [PR #13145](https://github.com/BerriAI/litellm/pull/13145)
- **Key 관리**
    - UI Keys 페이지에 backend 오류 표시 - [PR #13435](https://github.com/BerriAI/litellm/pull/13435)
    - key 삭제 전 확인 modal 추가 - [PR #13655](https://github.com/BerriAI/litellm/pull/13655)
    - LiteLLM SDK에서 Proxy로 통신할 때 `user` 파라미터 지원 - [PR #13555](https://github.com/BerriAI/litellm/pull/13555)
- **UI 개선**
    - internal users table overflow 수정 - [PR #12736](https://github.com/BerriAI/litellm/pull/12736)
    - 큰 숫자에 short-form notation을 적용해 chart 가독성 개선 - [PR #12370](https://github.com/BerriAI/litellm/pull/12370)
    - LiteLLM 모델 표시의 image overflow 수정 - [PR #13639](https://github.com/BerriAI/litellm/pull/13639)
    - 모호한 network response errors 제거 - [PR #13582](https://github.com/BerriAI/litellm/pull/13582)
- **Credentials**
    - CredentialDeleteModal component 추가 및 CredentialsPanel과 통합 - [PR #13550](https://github.com/BerriAI/litellm/pull/13550)
- **Admin 및 Permissions**
    - admin viewer용 route 허용 - [PR #13588](https://github.com/BerriAI/litellm/pull/13588)

#### 버그

- **SCIM Integration**
    - SCIM Team Memberships metadata 처리 수정 - [PR #13553](https://github.com/BerriAI/litellm/pull/13553)
- **인증**
    - 잘못된 key info endpoint 수정 - [PR #13633](https://github.com/BerriAI/litellm/pull/13633)

---

## Logging / Guardrail 통합

#### 기능

- **[Langfuse OTEL](../../docs/proxy/logging#langfuse)**
    - Langfuse OTEL Logger에 key/team logging 추가 - [PR #13512](https://github.com/BerriAI/litellm/pull/13512)
    - expected values와 일치하도록 LangfuseOtelSpanAttributes constants 수정 - [PR #13659](https://github.com/BerriAI/litellm/pull/13659)
- **[MLflow](../../docs/proxy/logging#mlflow)**
    - MLflow logger usage span attributes 업데이트 - [PR #13561](https://github.com/BerriAI/litellm/pull/13561)

#### 버그

- **Security**
    - `/model/info`에서 민감 데이터 숨김 - azure entra client_secret - [PR #13577](https://github.com/BerriAI/litellm/pull/13577)
    - trivy/secrets false positives 수정 - [PR #13631](https://github.com/BerriAI/litellm/pull/13631)

---

## 성능 / Loadbalancing / Reliability 개선

#### 기능

- **HTTP 성능**
    - OpenAI 호출에서 +100 RPS 개선을 제공하는 새 'EXPERIMENTAL_OPENAI_BASE_LLM_HTTP_HANDLER' 플래그 - [PR #13625](https://github.com/BerriAI/litellm/pull/13625)
- **Database 모니터링**
    - Prometheus에 DB metrics 추가 - [PR #13626](https://github.com/BerriAI/litellm/pull/13626)
- **오류 처리**
    - crash 방지를 위한 안전한 divide by 0 보호 추가 - [PR #13624](https://github.com/BerriAI/litellm/pull/13624)

#### 버그

- **Dependencies**
    - boto3를 1.36.0으로, aioboto3를 13.4.0으로 업데이트 - [PR #13665](https://github.com/BerriAI/litellm/pull/13665)

---

## 일반 Proxy 개선

#### 기능

- **Database**
    - 중복된 `use_prisma_migrate` 플래그 제거 - 이제 기본값입니다 - [PR #13555](https://github.com/BerriAI/litellm/pull/13555)
- **LLM Translation**
    - model ID check 추가 - [PR #13507](https://github.com/BerriAI/litellm/pull/13507)
    - Anthropic configurations 리팩터링 및 `anthropic_beta` headers 지원 추가 - [PR #13590](https://github.com/BerriAI/litellm/pull/13590)


---

## 신규 기여자
* @TensorNull 님이 [PR #13458](https://github.com/BerriAI/litellm/pull/13458)에서 첫 기여를 했습니다.
* @MajorD00m 님이 [PR #13577](https://github.com/BerriAI/litellm/pull/13577)에서 첫 기여를 했습니다.
* @VerunicaM 님이 [PR #13584](https://github.com/BerriAI/litellm/pull/13584)에서 첫 기여를 했습니다.
* @huangyafei 님이 [PR #13607](https://github.com/BerriAI/litellm/pull/13607)에서 첫 기여를 했습니다.
* @TomeHirata 님이 [PR #13561](https://github.com/BerriAI/litellm/pull/13561)에서 첫 기여를 했습니다.
* @willfinnigan 님이 [PR #13659](https://github.com/BerriAI/litellm/pull/13659)에서 첫 기여를 했습니다.
* @dcbark01 님이 [PR #13633](https://github.com/BerriAI/litellm/pull/13633)에서 첫 기여를 했습니다.
* @javacruft 님이 [PR #13631](https://github.com/BerriAI/litellm/pull/13631)에서 첫 기여를 했습니다.

---

## **[Full 변경 이력](https://github.com/BerriAI/litellm/compare/v1.75.5-stable.rc-draft...v1.75.8-nightly)**
