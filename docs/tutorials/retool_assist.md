import Image from '@theme/IdealImage';

# Retool Assist

이 가이드는 [Retool Assist](https://docs.retool.com/apps/guides/assist/)를 LiteLLM Proxy에 연결하는 방법을 안내합니다. Retool Assist는 Retool 앱 IDE 안에서 AI를 사용해 앱을 생성하고 편집합니다. Retool Assist에서 LiteLLM을 사용하면 다음을 할 수 있습니다.

- Retool Assist를 통해 100개 이상의 LLM에 접근
- 지출과 사용량을 추적하고, 가상 키별 예산 한도 설정
- Retool Assist가 접근할 수 있는 모델 제어
- 통합 OpenAI 호환 API를 통해 자체 LLM 제공자 사용

<div style={{ maxWidth: '100%', overflow: 'hidden', paddingBottom: '59.52%', position: 'relative', height: 0 }}>
  <iframe 
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', maxWidth: '840px' }}
    src="https://www.youtube.com/embed/aN-Iua5dHGg" 
    frameborder="0" 
    webkitallowfullscreen="true"
    mozallowfullscreen="true"
    allowfullscreen="true"
  ></iframe>
</div>

---

:::info
**호스팅 Retool에는 공개 URL이 필요합니다.** Retool Cloud는 Retool 서버에서 실행되므로 `localhost`는 작동하지 않습니다. ngrok, Cloudflare Tunnel을 사용하거나 클라우드 제공자에 배포해 LiteLLM proxy를 공개해야 합니다.
:::

## 빠른 참조 {#quick-reference}

| 설정 | 값 |
|---------|-------|
| 제공자 스키마 | OpenAI |
| 기본 URL | ngrok URL(예: `https://abc123.ngrok-free.app`) 또는 배포된 proxy URL |
| API 키 | LiteLLM 가상 키 |
| 모델 | LiteLLM의 공개 모델 이름(예: `openai/gpt-4o-mini`, `openai/gpt-5.2-2025-12-11`) |

---

## 사전 준비

- 로컬에서 실행 중이거나 배포된 LiteLLM Proxy
- 호스팅 Retool로 로컬 개발을 할 때 사용할 [ngrok](https://ngrok.com/download) 또는 유사한 터널
- [Retool](https://retool.com) 계정(Cloud 또는 자체 호스팅)

## 1. LiteLLM Proxy 시작 {#1-start-litellm-proxy}

[시작하기 가이드](https://docs.litellm.ai/docs/proxy/docker_quick_start)에 따라 LiteLLM Proxy를 설정합니다. proxy가 포트 4000에서 실행 중인지 확인하세요.

## 2. 공개 URL로 LiteLLM 노출 {#2-expose-litellm-with-a-public-url}

<Image img={require('../../img/ngrok_public_url.gif')} />

Retool Cloud는 Retool 서버에서 실행됩니다. 로컬 LiteLLM proxy를 공개 URL로 노출해야 합니다.

### ngrok 사용 {#using-ngrok}

- [ngrok](https://ngrok.com/download)을 설치합니다.
- 별도 터미널에서 다음을 실행합니다.
  
```bash
ngrok http 4000
```
- 생성된 HTTPS URL(예: `https://abc123.ngrok-free.app`)을 복사합니다. 이 URL이 Retool에서 사용할 **Base URL**입니다.


### 대안 {#alternative}

LiteLLM을 Railway, Render, Fly.io 또는 다른 클라우드 제공자에 배포했다면 해당 공개 URL을 Base URL로 사용합니다. 자세한 내용은 [배포 가이드](https://docs.litellm.ai/docs/proxy/deploy)를 참고하세요.

## 3. 가상 키 생성 {#3-generate-a-virtual-key}

<Image img={require('../../img/litellm_virtual_key.gif')} />

Retool Assist가 LiteLLM 인증에 사용할 가상 키를 만듭니다. 이 키는 사용하려는 모델에 접근할 수 있어야 합니다(예: 모든 OpenAI 모델에는 `openai/*`).

### LiteLLM UI에서 생성 {#via-litellm-ui}

- [http://localhost:4000/ui](http://localhost:4000/ui)로 이동합니다.
- **가상 키** → **+ Create New Key**로 이동합니다.
- 필요한 모델을 선택합니다. 모든 OpenAI 모델을 사용하려면 `openai/*`를 선택합니다.
- 키를 복사합니다.

## 4. Retool에 LiteLLM을 사용자 지정 제공자로 추가 {#4-add-litellm-as-a-custom-provider-in-retool}

Retool 대시보드에서 LiteLLM을 사용자 지정 AI 리소스로 구성합니다.

<Image img={require('../../img/retool_resource_setup.gif')} />

1. **Resources**로 이동합니다.

2. **AI** 카테고리에서 **Custom Provider**를 선택합니다.

3. 양식을 입력합니다.
   - **이름:** `LiteLLM`
   - **설명:** 선택 사항입니다. 예: `LiteLLM Proxy - 100+ LLMs`
   - **제공자 스키마:** `OpenAI`
   - **기본 URL:** ngrok에서 생성된 URL(예: `https://abc123.ngrok-free.app`) 또는 배포된 proxy URL입니다. Retool에서 요구하지 않는 한 `/v1`을 추가하지 마세요.
   - **API 키:** 3단계에서 만든 LiteLLM 가상 키입니다.
4. LiteLLM proxy의 **모델 이름을 추가**합니다(예: `openai/gpt-4o-mini`, `openai/gpt-5.2-2025-12-11`).
5. **Create Resource**를 클릭합니다.

<Image img={require('../../img/retool_llm_setup.gif')} />

## 5. 연결 테스트 {#5-test-the-connection}

<Image img={require('../../img/retool_litellm_connection.gif')} />

- Retool에서 앱을 열고 **Assist**를 활성화합니다. 조직에서 아직 활성화하지 않았다면 먼저 활성화하세요.
- Assist로 앱 요소를 생성하거나 편집합니다. 요청은 LiteLLM을 통해 라우팅됩니다.
- 사이드바의 코드 옵션으로 리소스 쿼리를 추가하고 LiteLLM 리소스를 선택한 뒤 실행하여 설정을 테스트합니다.
- LiteLLM **로그** 섹션에서 요청을 확인하고 사용량을 추적합니다.

<Image img={require('../../img/retool_litellm_logs.gif')} />

---

## 문제 해결

### 401 Unauthorized

- Retool의 **API Key**가 LiteLLM 가상 키와 정확히 일치하는지 확인합니다.
- LiteLLM에서 키가 만료되었거나 차단되지 않았는지 확인합니다.

### 401 `key not allowed to access model`

가상 키가 특정 모델로 제한되어 있습니다. `openai/*`로 새 키를 생성하거나, 필요한 모델(예: `openai/gpt-5.2-2025-12-11`)을 키의 허용 모델 목록에 포함하세요.

### 500 `api_key client option must be set`

LiteLLM이 제공자를 호출하는 데 OpenAI API 키를 사용할 수 없었습니다. `openai/*` 모델을 사용할 때 LiteLLM 환경(예: `.env` 또는 `docker-compose.yml`)에 `OPENAI_API_KEY`가 설정되어 있는지 확인하세요.

### localhost가 작동하지 않음 {#localhost-does-not-work}

Retool Cloud는 `localhost`에 접근할 수 없습니다. 이 주소는 Retool 서버를 가리킵니다. ngrok을 사용하거나 LiteLLM을 공개 URL에 배포하세요.

---

## 추가 리소스 {#additional-resources}

- [가상 키](https://docs.litellm.ai/docs/proxy/virtual_keys) - API 키 생성 및 관리
- [LiteLLM 배포](https://docs.litellm.ai/docs/proxy/deploy) - 프로덕션 배포 옵션
- [Retool Assist 문서](https://docs.retool.com/apps/guides/assist/) - Assist 구성 및 프롬프팅 가이드
