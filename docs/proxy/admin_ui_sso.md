import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ✨ 관리자 UI용 SSO

:::info
v1.76.0부터 SSO는 최대 5명의 user까지 무료입니다.
:::

:::info

✨ SSO는 LiteLLM Enterprise에서 제공됩니다.

[Enterprise 가격](https://www.litellm.ai/#pricing)

[무료 7일 체험 key 받기](https://www.litellm.ai/enterprise#trial)

:::

### 사용법(Google, Microsoft, Okta 등)

<Tabs>
<TabItem value="okta" label="Okta SSO">

### 동영상 안내

<iframe width="100%" height="415" src="https://www.loom.com/embed/cac5be90f2714ceaa95d7f89cf4ac548" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

#### 1단계: Okta에서 OIDC Application 생성

Okta Admin Console에서 새 **OIDC Web Application**을 생성합니다. 자세한 절차는 [OIDC app integration 생성에 대한 Okta 가이드](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_oidc.htm)를 참고하세요.

application을 설정할 때:
- **`Sign-in redirect URI`**: `https://<your-proxy-base-url>/sso/callback`
- **`Sign-out redirect URI`**(선택 사항): `https://<your-proxy-base-url>`

<Image img={require('../../img/okta_redirect_uri.png')} />

app을 만든 뒤 application의 **General** tab에서 **Client ID**와 **Client Secret**을 복사합니다.

<Image img={require('../../img/okta_client_credentials.png')} />

#### 2단계: Application에 User 할당

**Assignments** tab에서 user가 app에 할당되어 있는지 확인합니다. **Federation Broker Mode**가 활성화되어 있으면 user를 수동으로 할당하기 위해 비활성화해야 할 수 있습니다.

#### 3단계: 환경 변수 설정

다음 환경 변수를 설정합니다. 두 Okta authorization server의 차이는 endpoint URL뿐입니다.

**Org Authorization Server**(모든 Okta plan에서 사용 가능, 추가 SKU 필요 없음):
```bash
GENERIC_CLIENT_ID="<your-client-id>"
GENERIC_CLIENT_SECRET="<your-client-secret>"
GENERIC_AUTHORIZATION_ENDPOINT="https://<your-okta-domain>/oauth2/v1/authorize"
GENERIC_TOKEN_ENDPOINT="https://<your-okta-domain>/oauth2/v1/token"
GENERIC_USERINFO_ENDPOINT="https://<your-okta-domain>/oauth2/v1/userinfo"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

**Custom Authorization Server**(Okta API Access Management SKU 필요):
```bash
GENERIC_CLIENT_ID="<your-client-id>"
GENERIC_CLIENT_SECRET="<your-client-secret>"
GENERIC_AUTHORIZATION_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/authorize"
GENERIC_TOKEN_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/token"
GENERIC_USERINFO_ENDPOINT="https://<your-okta-domain>/oauth2/default/v1/userinfo"
PROXY_BASE_URL="https://<your-proxy-base-url>"
```

:::tip
모든 OAuth endpoint는 `https://<your-okta-domain>/.well-known/openid-configuration`에서 확인할 수 있습니다.
:::

#### 3a단계: Access Policy 설정(Custom Authorization Server만 해당)

Custom Authorization Server를 사용하는 경우 Access Policy를 반드시 설정해야 합니다. 설정하지 않으면 user는 `no_matching_policy` 오류를 받습니다. Org Authorization Server를 사용하는 경우 이 단계를 건너뜁니다.

1. **Security** → **API**로 이동합니다.

<Image img={require('../../img/okta_security_api.png')} />

2. **default** authorization server 또는 직접 만든 authorization server를 선택합니다.

<Image img={require('../../img/okta_authorization_server.png')} />

3. **Access Policies** tab을 클릭하고 LiteLLM app에 할당할 새 policy를 생성합니다.
4. **Authorization Code** grant type을 허용하는 rule을 추가합니다.

<Image img={require('../../img/okta_access_policies.png')} />

자세한 내용은 [Okta Access Policy 문서](https://help.okta.com/en-us/content/topics/security/api-access-management/access-policies.htm)를 참고하세요.

#### 4단계: Okta Security 설정 {#step-4-configure-okta-security-settings}

CSRF 공격을 방지하려면 Okta에서 **GENERIC_CLIENT_STATE** 사용을 권장합니다.

```bash
GENERIC_CLIENT_STATE="random-string"
```

**PKCE(Proof Key for Code Exchange)** — Okta application이 PKCE를 요구하도록 설정되어 있다면 다음을 설정해 활성화합니다.

```bash
GENERIC_CLIENT_USE_PKCE="true"
```

LiteLLM은 OAuth flow 중 PKCE parameter 생성과 검증을 자동으로 처리합니다.

#### 5단계: SSO Flow 테스트

1. LiteLLM proxy를 시작합니다.
2. `https://<your-proxy-base-url>/ui`로 이동합니다.
3. SSO login button을 클릭합니다.
4. Okta로 인증하고 LiteLLM으로 다시 redirect되는지 확인합니다.

#### 문제 해결

| 오류 | 원인 | 해결 방법 |
|-------|-------|----------|
| `redirect_uri` 오류 | Redirect URI가 설정되지 않음 | Okta의 `Sign-in redirect URI`에 `<proxy_base_url>/sso/callback` 추가 |
| `access_denied` | user가 app에 할당되지 않음 | Assignments tab에서 user 할당 |
| `no_matching_policy` | Access Policy 누락(Custom Authorization Server만 해당) | Authorization Server에서 Access Policy 생성(3a단계 참고) |

</TabItem>
<TabItem value="google" label="Google SSO">

- https://console.cloud.google.com/ 에서 새 OAuth 2.0 Client를 생성합니다.

**Proxy에 필요한 `.env` 변수**
```shell
# for Google SSO Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- https://console.cloud.google.com/ 의 OAuth 2.0 Client에서 Redirect URL을 설정합니다.
    - redirect URL = `<your proxy base url>/sso/callback`로 설정합니다.
    ```shell
    https://litellm-production-7002.up.railway.app/sso/callback
    ```

</TabItem>

<TabItem value="msft" label="Microsoft SSO">

- https://portal.azure.com/ 에서 새 App Registration을 생성합니다.
- App Registration용 client secret을 생성합니다.

**Proxy에 필요한 `.env` 변수**
```shell
MICROSOFT_CLIENT_ID="84583a4d-"
MICROSOFT_CLIENT_SECRET="nbk8Q~"
MICROSOFT_TENANT="5a39737"
```

**선택 사항: Custom Microsoft SSO Endpoint**

custom identity provider, sovereign cloud, proxy 등의 이유로 custom Microsoft SSO endpoint가 필요하면 기본 endpoint를 override할 수 있습니다.

```shell
MICROSOFT_AUTHORIZATION_ENDPOINT="https://your-custom-url.com/oauth2/v2.0/authorize"
MICROSOFT_TOKEN_ENDPOINT="https://your-custom-url.com/oauth2/v2.0/token"
MICROSOFT_USERINFO_ENDPOINT="https://your-custom-graph-api.com/v1.0/me"
```

이 값을 설정하지 않으면 tenant를 기준으로 기본 Microsoft endpoint가 사용됩니다.

- https://portal.azure.com/ 의 App Registration에서 Redirect URI를 설정합니다.
    - redirect URL = `<your proxy base url>/sso/callback`로 설정합니다.
    ```shell
    http://localhost:4000/sso/callback
    ```

**User Permission에 App Roles 사용**

App Roles를 사용해 Entra ID에서 user role을 직접 할당할 수 있습니다. LiteLLM은 JWT token에서 app role을 자동으로 읽고 user에게 해당 role을 할당합니다.

지원 role:
- `proxy_admin` - platform admin
- `proxy_admin_viewer` - login, 모든 key 조회, 전체 spend 조회 가능(read-only)
- `internal_user` - 일반 user입니다. login과 spend 조회가 가능하며 team-member permission에 따라 본인 key 조회/생성/삭제가 가능합니다.


app role 설정:
1. https://portal.azure.com/ 의 App Registration으로 이동합니다.
2. "App roles"로 이동해 새 app role을 생성합니다.
3. 위의 지원 role 이름 중 하나를 사용합니다(예: `proxy_admin`).
4. 엔터프라이즈 Application에서 user를 이 role에 할당합니다.
5. user가 SSO로 sign in하면 LiteLLM이 해당 role을 자동으로 할당합니다.

**고급: Custom User Attribute Mapping**

일부 Microsoft Entra ID 구성에서는 기본 user attribute field name을 override해야 할 수 있습니다. 조직이 SSO response에서 custom claim이나 비표준 attribute name을 사용할 때 유용합니다.

**1단계: SSO Response Debug**

먼저 [SSO Debug Route](#debugging-sso-jwt-fields)를 사용해 Microsoft SSO provider가 반환하는 JWT field를 확인합니다.

1. Azure App Registration에 `/sso/debug/callback`을 redirect URL로 추가합니다.
2. `https://<proxy_base_url>/sso/debug/login`으로 이동합니다.
3. SSO flow를 완료해 반환된 user attribute를 확인합니다.

**2단계: Field Attribute Name 확인**

debug response에서 email, display name, user ID, first name, last name에 사용되는 field name을 확인합니다.

**3단계: 환경 변수 설정**

다음 환경 변수를 설정해 기본 attribute name을 override합니다.

| 환경 변수 | 설명 | 기본값 |
|---------------------|-------------|---------------|
| `MICROSOFT_USER_EMAIL_ATTRIBUTE` | user email field 이름 | `userPrincipalName` |
| `MICROSOFT_USER_DISPLAY_NAME_ATTRIBUTE` | display name field 이름 | `displayName` |
| `MICROSOFT_USER_ID_ATTRIBUTE` | user ID field 이름 | `id` |
| `MICROSOFT_USER_FIRST_NAME_ATTRIBUTE` | first name field 이름 | `givenName` |
| `MICROSOFT_USER_LAST_NAME_ATTRIBUTE` | last name field 이름 | `surname` |

**4단계: Proxy 재시작**

환경 변수를 설정한 뒤 proxy를 재시작합니다.

```bash
litellm --config /path/to/config.yaml
```

</TabItem>

<TabItem value="Generic" label="Generic SSO Provider">

거의 code 없이 모든 OAuth provider 지원을 빠르게 만들 수 있는 generic OAuth client입니다.

**Proxy에 필요한 .env variable**
```shell

GENERIC_CLIENT_ID = "******"
GENERIC_CLIENT_SECRET = "G*******"
GENERIC_AUTHORIZATION_ENDPOINT = "http://localhost:9090/auth"
GENERIC_TOKEN_ENDPOINT = "http://localhost:9090/token"
GENERIC_USERINFO_ENDPOINT = "http://localhost:9090/me"
```

**선택 사항 .env variable**
generic OAuth provider와 연동할 때 attribute name을 customize하려면 다음 값을 사용할 수 있습니다. LiteLLM은 SSO Provider 결과에서 이 attribute를 읽습니다.

```shell
GENERIC_USER_ID_ATTRIBUTE = "given_name"
GENERIC_USER_EMAIL_ATTRIBUTE = "family_name"
GENERIC_USER_DISPLAY_NAME_ATTRIBUTE = "display_name"
GENERIC_USER_FIRST_NAME_ATTRIBUTE = "first_name"
GENERIC_USER_LAST_NAME_ATTRIBUTE = "last_name"
GENERIC_USER_ROLE_ATTRIBUTE = "given_role"
GENERIC_USER_PROVIDER_ATTRIBUTE = "provider"
GENERIC_USER_EXTRA_ATTRIBUTES = "department,employee_id,manager" # comma-separated list of additional fields to extract from SSO response
GENERIC_CLIENT_STATE = "some-state" # if the provider needs a state parameter
GENERIC_INCLUDE_CLIENT_ID = "false" # some providers enforce that the client_id is not in the body
GENERIC_SCOPE = "openid profile email" # default scope openid is sometimes not enough to retrieve basic user info like first_name and last_name located in profile scope
```

**SSO로 User Role 할당**

SSO token의 어떤 attribute에 user role이 들어 있는지 지정하려면 `GENERIC_USER_ROLE_ATTRIBUTE`를 사용합니다. role 값은 다음 지원 LiteLLM role 중 하나여야 합니다.

- `proxy_admin` - platform admin
- `proxy_admin_viewer` - login, 모든 key 조회, 전체 spend 조회 가능(read-only)
- `internal_user` - login, 본인 key 조회/생성/삭제, 본인 spend 조회 가능
- `internal_user_view_only` - login, 본인 key 조회, 본인 spend 조회 가능

중첩 attribute path도 지원됩니다(예: `claims.role` 또는 `attributes.litellm_role`).

**추가 SSO Field 캡처**

표준 user attribute(id, email, name 등) 외에 SSO provider response에서 추가 field를 추출하려면 `GENERIC_USER_EXTRA_ATTRIBUTES`를 사용합니다. [custom SSO handler](./custom_sso.md)에서 조직별 custom data(예: department, employee ID, groups)에 접근해야 할 때 유용합니다.

```shell
# Comma-separated list of field names to extract
GENERIC_USER_EXTRA_ATTRIBUTES="department,employee_id,manager,groups"
```

**Custom SSO Handler에서 Extra Field 접근:**

```python
from litellm.proxy.management_endpoints.types import CustomOpenID

async def custom_sso_handler(userIDPInfo: CustomOpenID):
    # Access the extra fields
    extra_fields = getattr(userIDPInfo, 'extra_fields', None) or {}
    
    user_department = extra_fields.get("department")
    employee_id = extra_fields.get("employee_id")
    user_groups = extra_fields.get("groups", [])
    
    # Use these fields for custom logic (e.g., team assignment, access control)
    # ...
```

**중첩 Field Path:**

중첩 field에는 dot notation이 지원됩니다.

```shell
GENERIC_USER_EXTRA_ATTRIBUTES="org_info.department,org_info.cost_center,metadata.employee_type"
```

- provider가 요구하는 경우 Redirect URI를 설정합니다.
    - redirect url = `<your proxy base url>/sso/callback`로 설정합니다.
    ```shell
    http://localhost:4000/sso/callback
    ```

</TabItem>

</Tabs>

### 기본 Login, Logout URL

일부 SSO provider는 login과 logout에 특정 redirect url을 요구합니다. 다음 값을 입력할 수 있습니다.

- Login: `<your-proxy-base-url>/sso/key/generate`
- Logout: `<your-proxy-base-url>`

proxy의 logout url을 설정하는 env var는 다음과 같습니다.
```bash
PROXY_LOGOUT_URL="https://www.google.com"
```

#### 3단계. .env에서 `PROXY_BASE_URL` 설정

.env에 이 값을 설정합니다. 그래야 proxy가 올바른 redirect url을 설정할 수 있습니다.
```shell
PROXY_BASE_URL=https://litellm-api.up.railway.app
```

#### 4단계. Flow 테스트
<Image img={require('../../img/litellm_ui_3.gif')} />

### SSO에서 Email Subdomain 제한

SSO를 사용하면서 특정 subdomain의 user만 UI에 접근하도록 허용하려면(예: @berri.ai email account) 다음을 설정합니다.

```bash
export ALLOWED_EMAIL_DOMAINS="berri.ai"
```

접근을 허용하기 전에 SSO에서 받은 user email에 이 domain이 포함되어 있는지 확인합니다.

### Proxy Admin 설정

SSO가 활성화된 상태에서 Proxy Admin을 설정합니다. SSO가 활성화되면 user의 `user_id`는 SSO provider에서 가져옵니다. Proxy Admin을 설정하려면 UI에서 `user_id`를 복사한 뒤 `.env`에 `PROXY_ADMIN_ID`로 설정해야 합니다.

#### 1단계: UI에서 ID 복사

<Image img={require('../../img/litellm_ui_copy_id.png')} />

#### 2단계: .env에 PROXY_ADMIN_ID로 설정

```env
export PROXY_ADMIN_ID="116544810872468347480"
```

이 설정은 `LiteLLM_UserTable`의 user role을 `proxy_admin`으로 업데이트합니다.

이 ID를 변경할 계획이라면 API `/user/update` 또는 UI(Internal Users page)를 통해 user role을 업데이트하세요.

#### 3단계: 모든 proxy key 확인

<Image img={require('../../img/litellm_ui_admin.png')} />

:::info

모든 key가 보이지 않는다면 cached token 때문일 수 있습니다. 다시 로그인하면 정상 동작합니다.

:::

### 관리자 UI에서 `Default Team` 비활성화

관리자 UI에서 Default Team을 숨기려면 이 설정을 사용합니다.

다음 logic이 적용됩니다.
- team이 할당되어 있으면 `Default Team`을 표시하지 않습니다.
- team이 할당되어 있지 않으면 `Default Team`을 표시합니다.

litellm config.yaml에 `default_team_disabled: true`를 설정합니다.

```yaml
general_settings:
  master_key: sk-1234
  default_team_disabled: true # OR you can set env var PROXY_DEFAULT_TEAM_DISABLED="true"
```

### SSO 사용 중 Username, Password 사용

SSO가 켜져 있을 때 username/password로 UI에 접근해야 한다면 `/fallback/login`으로 이동합니다. 이 route에서 username/password credential로 sign in할 수 있습니다.

### UI Access 제한

UI Access를 admin으로만 제한할 수 있습니다. 여기에는 본인(`proxy_admin`)과 global spend를 볼 수 있도록 view-only access를 부여한 사용자(`proxy_admin_viewer`)가 포함됩니다.

**1단계. 'admin_only' access 설정**
```yaml
general_settings:
    ui_access_mode: "admin_only"
```

**2단계. view-only user 초대**

<Image img={require('../../img/admin_ui_viewer.png')} />

### 관리자 UI Custom Branding

LiteLLM 관리자 UI에 회사의 custom branding을 적용합니다.
다음을 customize할 수 있습니다.
- UI Logo
- UI color scheme
<Image img={require('../../img/litellm_custom_ai.png')} />

#### Custom Logo 설정
local image 또는 image의 http/https url을 전달할 수 있습니다.

env에 `UI_LOGO_PATH`를 설정합니다. 설정, 구성, debug가 훨씬 쉬우므로 hosted image 사용을 권장합니다.

Hosted image 설정 예제
```shell
UI_LOGO_PATH="https://litellm-logo-aws-marketplace.s3.us-west-2.amazonaws.com/berriai-logo-github.png"
```

local image(container 내부) 설정 예제
```shell
UI_LOGO_PATH="ui_images/logo.jpg"
```

#### 또는 관리자 UI에서 직접 logo 설정:
<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  <Image img={require('../../img/admin_settings_ui_theme.png')} />
  <Image img={require('../../img/admin_settings_ui_theme_logo.png')} />
</div>

#### Custom Color Theme 설정
- [/enterprise/enterprise_ui](https://github.com/BerriAI/litellm/blob/main/enterprise/enterprise_ui/_enterprise_colors.json)로 이동합니다.
- `enterprise_ui` directory 안에서 `_enterprise_colors.json`을 `enterprise_colors.json`으로 rename합니다.
- `enterprise_colors.json`에 회사의 custom color scheme을 설정합니다.
`enterprise_colors.json` contents 예제
color는 다음 color 중 하나로 설정합니다: https://www.tremor.so/docs/layout/color-palette#default-colors
```json
{
    "brand": {
      "DEFAULT": "teal",
      "faint": "teal",
      "muted": "teal",
      "subtle": "teal",
      "emphasis": "teal",
      "inverted": "teal"
    }
}

```
- LiteLLM Proxy Server를 deploy합니다.

## 문제 해결

### 오류: `The 'redirect_uri' parameter must be a Login redirect URI in the client app settings` {#redirect-uri-parameter-must-be-a-login-redirect-uri-in-the-client-app-settings}

이 오류는 Okta 및 기타 SSO provider에서 redirect URI 구성이 잘못되었을 때 자주 발생합니다.

#### 문제
```
Your request resulted in an error. The 'redirect_uri' parameter must be a Login redirect URI in the client app settings
```

#### 해결 방법

**1. .env에 PROXY_BASE_URL을 설정했고 protocol이 포함되어 있는지 확인**

`PROXY_BASE_URL`에 protocol(`http://` 또는 `https://`)이 포함된 전체 URL이 들어 있는지 확인합니다.

```bash
# ✅ 올바름 - https:// 포함
PROXY_BASE_URL=https://litellm.platform.com

# ✅ 올바름 - http:// 포함
PROXY_BASE_URL=http://litellm.platform.com

# ❌ 잘못됨 - protocol 누락
PROXY_BASE_URL=litellm.platform.com
```

**2. Okta의 경우 `GENERIC_CLIENT_STATE`가 설정되어 있고, 필요한 경우 PKCE가 구성되어 있는지 확인**

`GENERIC_CLIENT_STATE` 및 PKCE 구성에 대한 자세한 내용은 [Okta SSO — 4단계: Okta Security 설정](#step-4-configure-okta-security-settings)을 참고하세요.

### 일반적인 설정 문제

#### Base URL에 Protocol 누락
```bash
# redirect_uri 오류를 일으킵니다
PROXY_BASE_URL=mydomain.com

# 수정: protocol 추가
PROXY_BASE_URL=https://mydomain.com
```

### Fallback Login

SSO가 켜져 있을 때 username/password로 UI에 접근해야 한다면 `/fallback/login`으로 이동합니다. 이 route에서 username/password credential로 sign in할 수 있습니다.

<Image img={require('../../img/fallback_login.png')} />


### SSO JWT 필드 디버그 {#debugging-sso-jwt-fields}

LiteLLM이 SSO provider에서 받은 JWT field를 확인해야 한다면 다음 절차를 따르세요. 이 guide는 SSO process 중 JWT data를 볼 수 있도록 debug callback을 설정하는 방법을 안내합니다.


<Image img={require('../../img/debug_sso.png')}  style={{ width: '500px', height: 'auto' }} />
<br />

1. SSO provider에 `/sso/debug/callback`을 redirect URL로 추가합니다.

  SSO provider 설정에서 다음 URL을 새 redirect(callback) URL로 추가합니다.

  ```bash showLineNumbers title="Redirect URL"
  http://<proxy_base_url>/sso/debug/callback
  ```


2. browser에서 debug login page로 이동합니다.

    browser에서 다음 URL로 이동합니다.

    ```bash showLineNumbers title="URL to navigate to"
    https://<proxy_base_url>/sso/debug/login
    ```

    표준 SSO flow가 시작됩니다. SSO provider의 login screen으로 redirect되고, 인증에 성공하면 LiteLLM의 debug callback route로 다시 redirect됩니다.


3. JWT field를 확인합니다.

redirect되면 "SSO Debug Information" page가 표시됩니다. 이 page는 SSO provider에서 받은 JWT field를 표시합니다(위 image 참고).


## 고급

### Azure App Roles로 User Role 관리

Azure Entra ID에서 user permission을 정의해 role 관리를 중앙화합니다. user가 sign in하면 LiteLLM이 Azure 구성에 따라 role을 자동으로 할당하므로 LiteLLM에서 role을 수동으로 관리할 필요가 없습니다.

#### 1단계: Azure App Registration에서 App Roles 생성

1. https://portal.azure.com/ 의 App Registration으로 이동합니다.
2. **App roles** > **Create app role**로 이동합니다.
3. [지원 LiteLLM role](./access_control.md#global-proxy-roles) 중 하나를 사용해 app role을 구성합니다.
   - **Display name**: Admin Viewer 또는 원하는 display name
   - **Value**: `proxy_admin_viewer`(LiteLLM role value 중 하나와 정확히 일치해야 함)
4. **Apply**를 클릭해 role을 저장합니다.
5. 사용할 LiteLLM role마다 반복합니다.


**지원 LiteLLM role value**([전체 role documentation](./access_control.md#global-proxy-roles) 참고):
- `proxy_admin` - 전체 admin access
- `proxy_admin_viewer` - 읽기 전용 admin access
- `internal_user` - 본인 key 생성/조회/삭제 가능
- `internal_user_viewer` - 본인 key 조회 가능(read-only)

<Image img={require('../../img/app_roles.png')} style={{ width: '900px', height: 'auto' }} />

---

#### 2단계: User를 App Role에 할당

1. https://portal.azure.com/ 에서 **엔터프라이즈 Applications**로 이동합니다.
2. LiteLLM application을 선택합니다.
3. **Users and groups** > **Add user/group**으로 이동합니다.
4. user를 선택합니다.
5. **Select a role**에서 생성한 app role을 선택합니다(예: `proxy_admin_viewer`).
6. **Assign**을 클릭해 저장합니다.

<Image img={require('../../img/app_role2.png')} style={{ width: '900px', height: 'auto' }} />

---

#### 3단계: Sign in 후 확인

1. SSO로 LiteLLM UI에 sign in합니다.
2. LiteLLM은 JWT token에서 app role을 자동으로 추출합니다.
3. user에게 해당 role이 할당됩니다. UI의 user profile dropdown에서 확인할 수 있습니다.

<Image img={require('../../img/app_role3.png')} style={{ width: '900px', height: 'auto' }} />

**참고:** Entra ID의 role은 LiteLLM database에 있는 기존 role보다 우선합니다. 이를 통해 SSO provider가 user role의 authoritative source가 됩니다.
