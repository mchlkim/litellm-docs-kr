
import Image from '@theme/IdealImage';


# LiteLLM에서 SCIM 사용하기

✨ **엔터프라이즈**: SCIM 지원에는 프리미엄 라이선스가 필요합니다.

ID 공급자(identity provider: Okta, Azure AD, OneLogin 등)가 LiteLLM에서 사용자 및 팀(그룹) 프로비저닝, 업데이트, 프로비저닝 해제를 자동화할 수 있도록 합니다.


이 튜토리얼에서는 IDP를 LiteLLM SCIM Endpoints에 연결하는 단계를 안내합니다.

### SCIM에 지원되는 SSO Provider
아래는 LiteLLM SCIM Endpoints에 연결할 수 있는 지원 SSO Provider 목록입니다.
- `Microsoft Entra ID (Azure AD)`
- Okta
- Google Workspace
- OneLogin
- Keycloak
- Auth0


## 1. SCIM Tenant URL 및 Bearer Token 가져오기

LiteLLM에서 Settings > Admin Settings > SCIM으로 이동합니다. 이 페이지에서 SCIM Token을 생성합니다. 이 토큰을 통해 IDP가 litellm `/scim` endpoints에 인증할 수 있습니다.

<Image img={require('../../img/scim_2.png')}  style={{ width: '800px', height: 'auto' }} />

## 2. IDP를 LiteLLM SCIM Endpoints에 연결하기

IDP Provider에서 SSO 애플리케이션으로 이동한 뒤 `Provisioning` > `New provisioning configuration`을 선택합니다.

이 페이지에 litellm scim tenant url과 bearer token을 붙여넣습니다.

붙여넣은 후 `Test Connection`을 클릭하여 IDP가 LiteLLM SCIM endpoints에 인증할 수 있는지 확인합니다.

<Image img={require('../../img/scim_4.png')}  style={{ width: '800px', height: 'auto' }} />


## 3. SCIM 연결 테스트

### 3.1 그룹을 LiteLLM 엔터프라이즈 App에 할당하기

IDP Portal에서 `엔터프라이즈 Applications`로 이동한 뒤 litellm 앱을 선택합니다.

<Image img={require('../../img/msft_enterprise_app.png')}  style={{ width: '800px', height: 'auto' }} />

<br />
<br />

litellm 앱을 선택한 후 `Users and Groups` > `Add user/group`을 클릭합니다.

<Image img={require('../../img/msft_enterprise_assign_group.png')}  style={{ width: '800px', height: 'auto' }} />

<br />

이제 1.1단계에서 생성한 그룹을 선택하고 LiteLLM 엔터프라이즈 App에 추가합니다. 이 시점에서는 `Production LLM Evals Group`을 LiteLLM 엔터프라이즈 App에 추가한 상태입니다. 다음 단계는 새 사용자가 로그인할 때 LiteLLM이 LiteLLM DB에 `Production LLM Evals Group`을 자동으로 생성하도록 하는 것입니다.

<Image img={require('../../img/msft_enterprise_select_group.png')}  style={{ width: '800px', height: 'auto' }} />


### 3.2 SSO를 통해 LiteLLM UI에 로그인하기

SSO를 통해 LiteLLM UI에 로그인합니다. Entra ID SSO 페이지로 리디렉션되어야 합니다. 이 SSO 로그인 흐름은 LiteLLM이 Azure Entra ID에서 최신 Groups와 Members를 가져오도록 트리거합니다.

<Image img={require('../../img/msft_sso_sign_in.png')}  style={{ width: '800px', height: 'auto' }} />

### 3.3 LiteLLM UI에서 새 팀 확인하기

LiteLLM UI에서 `Teams`로 이동합니다. LiteLLM에 새 팀 `Production LLM Evals Group`이 자동 생성된 것을 확인할 수 있습니다.

<Image img={require('../../img/msft_auto_team.png')}  style={{ width: '900px', height: 'auto' }} />

> **참고:** 사용자가 SCIM을 통해 조직에서 제거되면 해당 사용자와 연결된 모든 API keys 및 access tokens가 LiteLLM에서 자동으로 삭제됩니다. 이를 통해 제거된 사용자의 모든 접근 권한이 즉시 안전하게 해제됩니다.
