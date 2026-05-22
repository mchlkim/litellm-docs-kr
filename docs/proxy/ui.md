import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 빠른 시작

config / CRUD 엔드포인트를 직접 다루지 않고 키 생성, spend 추적, 모델 추가를 수행할 수 있습니다.

<Image img={require('../../img/litellm_ui_create_key.png')} />

## 빠른 시작

- 프록시 master key 설정이 필요합니다.
- DB 연결이 필요합니다.

[설정](./virtual_keys.md#setup)을 따르세요.

### 1. 프록시 시작

```bash
litellm --config /path/to/config.yaml

#INFO: Proxy running on http://0.0.0.0:4000
```

### 2. UI로 이동 {#2-go-to-ui}

```bash
http://0.0.0.0:4000/ui # <proxy_base_url>/ui
```

### 3. Swagger에서 관리자 UI 링크 확인 {#3-get-admin-ui-link-on-swagger}

Proxy Swagger는 프록시 루트에서 사용할 수 있습니다. 예: `http://localhost:4000/`

<Image img={require('../../img/ui_link.png')} />

### 4. 기본 사용자 이름 및 비밀번호 변경 {#4-change-default-username--password}

프록시의 `.env`에 다음 값을 설정합니다.

```shell
LITELLM_MASTER_KEY="sk-1234" # this is your master key for using the proxy server
UI_USERNAME=ishaan-litellm   # username to sign in on UI
UI_PASSWORD=langchain        # password to sign in on UI
```

LiteLLM UI에 접근하면 사용자 이름과 비밀번호를 입력하라는 메시지가 표시됩니다.

### 5. 루트 리디렉션 URL 구성 {#5-configure-root-redirect-url}

`DOCS_URL`이 `"/"`가 아닌 값으로 설정된 경우 `ROOT_REDIRECT_URL`을 사용해 루트 경로(`/`)가 리디렉션될 위치를 구성할 수 있습니다.

```shell
DOCS_URL="/docs"              # Set docs to a different path
ROOT_REDIRECT_URL="/ui"       # Redirect root path (/) to /ui
```

기본적으로 `DOCS_URL`은 `"/"`입니다. 따라서 이 설정은 `DOCS_URL`을 다른 경로로 변경한 경우에만 필요합니다.

## 다른 사용자 초대 {#invite-other-users}

다른 사용자가 자신의 키를 생성/삭제할 수 있게 합니다.

[**여기로 이동**](./self_serve.md)

## 모델 관리 {#model-management}

관리자 UI는 포괄적인 모델 관리 기능을 제공합니다.

- **모델 추가**: 프록시를 재시작하지 않고 UI에서 새 모델을 추가합니다.
- **AI Hub**: 개발자가 사용 가능한 항목을 확인할 수 있도록 모델과 에이전트를 공개합니다.
- **가격 데이터 동기화**: GitHub에서 동기화해 모델 가격 데이터를 최신 상태로 유지합니다.

모델 관리에 대한 자세한 내용은 [Model Management](./model_management.md)를 참고하세요.

모델 및 에이전트 공유에 대한 내용은 [AI Hub](./ai_hub.md)를 참고하세요.

:::tip 모델 가격 데이터 동기화
모델 비용 정보를 최신 상태로 유지하려면 [GitHub에서 모델 가격 데이터를 동기화](./sync_models_github.md)하세요.
:::

## 관리자 UI 비활성화 {#disable-admin-ui}

관리자 UI를 비활성화하려면 환경에 `DISABLE_ADMIN_UI="True"`를 설정합니다.

보안 팀이 UI 사용에 추가 제한을 두는 경우 유용합니다.

**예상 응답**

<Image img={require('../../img/admin_ui_disabled.png')}/>
