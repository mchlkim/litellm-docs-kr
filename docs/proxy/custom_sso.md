# ✨ SSO 로그인용 이벤트 Hook {#event-hooks-for-sso-login}

:::info
✨ SSO는 최대 5명의 사용자까지 무료입니다. 그 이후에는 엔터프라이즈 라이선스가 필요합니다. [여기에서 엔터프라이즈 시작하기](https://www.litellm.ai/enterprise)
:::

## 개요

LiteLLM은 인증 설정에 따라 두 가지 SSO hook을 제공합니다.

| Hook 유형 | 사용 시점 | 수행 작업 |
|-----------|-------------|--------------|
| **`Custom UI SSO Sign-in Handler`** | LiteLLM 앞단에 OAuth proxy(oauth2-proxy, Gatekeeper, Vouch 등)가 있는 경우 | 요청 헤더에서 사용자 정보를 파싱하고 사용자를 UI에 로그인시킵니다 |
| **Custom SSO Handler** | 직접 SSO provider(Google, Microsoft, SAML)를 사용하며 인증 후 사용자 정의 로직을 실행하려는 경우 | 표준 OAuth 흐름 이후 사용자 정의 코드를 실행해 사용자 권한/팀을 설정합니다 |

**빠른 결정 가이드:**
- ✅ 사용자 인증이 LiteLLM 외부에서(headers를 통해) 처리되는 경우 **`Custom UI SSO Sign-in Handler`**를 사용하세요
- ✅ LiteLLM이 OAuth 흐름을 처리하고 이후 사용자 정의 로직을 실행하게 하려는 경우 **Custom SSO Handler**를 사용하세요

---

## 옵션 1: `Custom UI SSO Sign-in Handler` {#option-1-custom-ui-sso-sign-in-handler}

이미 사용자를 인증하고 요청 헤더를 통해 사용자 정보를 전달하는 **LiteLLM 앞단의 OAuth proxy**가 있을 때 사용하세요.

### 동작 방식
- 사용자가 관리자 UI에 도착합니다  
- 👉 **`custom SSO sign-in handler`가 호출되어 요청 헤더를 파싱하고 사용자 정보를 반환합니다**
- LiteLLM이 사용자 정의 handler에서 사용자 정보를 가져옵니다
- 사용자가 UI에 로그인됩니다

### 사용법

#### 1. custom UI SSO handler 파일 생성 {#1-create-a-custom-ui-sso-handler-file}

이 handler는 요청 헤더를 파싱하고 사용자 정보를 OpenID 객체로 반환합니다.

```python
from fastapi import Request
from fastapi_sso.sso.base import OpenID
from litellm.integrations.custom_sso_handler import CustomSSOLoginHandler


class MyCustomSSOLoginHandler(CustomSSOLoginHandler):
    """
    Custom handler for parsing OAuth proxy headers
    
    Use this when you have an OAuth proxy (like oauth2-proxy, Vouch, etc.) 
    in front of LiteLLM that adds user info to request headers
    """
    async def handle_custom_ui_sso_sign_in(
        self,
        request: Request,
    ) -> OpenID:
        # Parse headers from your OAuth proxy
        request_headers = dict(request.headers)
        
        # Extract user info from headers (adjust header names for your proxy)
        user_id = request_headers.get("x-forwarded-user") or request_headers.get("x-user")
        user_email = request_headers.get("x-forwarded-email") or request_headers.get("x-email")
        user_name = request_headers.get("x-forwarded-preferred-username") or request_headers.get("x-preferred-username")
        
        # Return OpenID object with user information
        return OpenID(
            id=user_id or "unknown",
            email=user_email or "unknown@example.com", 
            first_name=user_name or "Unknown",
            last_name="User",
            display_name=user_name or "Unknown User",
            picture=None,
            provider="oauth-proxy",
        )

# Create an instance to be used by LiteLLM
custom_ui_sso_sign_in_handler = MyCustomSSOLoginHandler()
```

#### 2. config.yaml에서 구성 {#2-configure-in-configyaml}

```yaml
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "gpt-3.5-turbo"

general_settings:
  custom_ui_sso_sign_in_handler: custom_sso_handler.custom_ui_sso_sign_in_handler

litellm_settings:
  drop_params: True
  set_verbose: True
```

#### 3. 프록시 시작
```shell
$ litellm --config /path/to/config.yaml 
```

#### 4. 관리자 UI로 이동 {#4-navigate-to-the-admin-ui}

사용자가 LiteLLM 관리자 UI로 이동하려고 하면 요청이 `custom UI SSO sign-in handler`로 라우팅됩니다.

---

## 옵션 2: Custom SSO Handler (인증 후) {#option-2-custom-sso-handler-post-auth}

사용자가 표준 SSO provider(Google, Microsoft 등)를 사용해 LiteLLM UI에 로그인한 **후** 직접 작성한 코드를 실행하려는 경우 사용하세요.

### 동작 방식
- 사용자가 관리자 UI에 도착합니다
- LiteLLM이 사용자를 SSO provider(Google, Microsoft 등)로 리디렉션합니다
- SSO provider가 사용자를 LiteLLM으로 다시 리디렉션합니다  
- LiteLLM이 IDP에서 사용자 정보를 가져옵니다
- 👉 **custom SSO handler가 호출되고 SSOUserDefinedValues 타입의 객체를 반환합니다**
- 사용자가 UI에 로그인됩니다

### 사용법

#### 1. custom SSO handler 파일 생성 {#1-create-a-custom-sso-handler-file}

응답 타입이 `SSOUserDefinedValues` pydantic 객체를 따르는지 확인하세요. 이는 사용자를 관리자 UI에 로그인시키는 데 사용됩니다.

```python
from fastapi_sso.sso.base import OpenID

from litellm.proxy._types import LitellmUserRoles, SSOUserDefinedValues
from litellm.proxy import proxy_server

# These imports are available if you need to create users or manage team membership:
# from litellm.proxy.management_endpoints.internal_user_endpoints import new_user
# from litellm.proxy.management_endpoints.team_endpoints import add_new_member


async def custom_sso_handler(userIDPInfo: OpenID) -> SSOUserDefinedValues:
    try:
        print("inside custom sso handler")  # noqa
        print(f"userIDPInfo: {userIDPInfo}")  # noqa

        if userIDPInfo.id is None:
            raise ValueError(
                f"No ID found for user. userIDPInfo.id is None {userIDPInfo}"
            )
        
        #################################################
        # Access extra fields from SSO provider (requires GENERIC_USER_EXTRA_ATTRIBUTES env var)
        # Example: Set GENERIC_USER_EXTRA_ATTRIBUTES="department,employee_id,groups"
        extra_fields = getattr(userIDPInfo, 'extra_fields', None) or {}
        user_department = extra_fields.get("department")
        employee_id = extra_fields.get("employee_id")
        user_groups = extra_fields.get("groups", [])
        
        print(f"User department: {user_department}")  # noqa
        print(f"Employee ID: {employee_id}")  # noqa
        print(f"User groups: {user_groups}")  # noqa
        #################################################

        #################################################
        # Run your custom code / logic here
        # check if user exists in litellm proxy DB
        if proxy_server.prisma_client is not None:
            _user_info = await proxy_server.prisma_client.get_data(user_id=userIDPInfo.id)
            print("_user_info from litellm DB ", _user_info)  # noqa
        #################################################

        return SSOUserDefinedValues(
            models=[],                                      # models user has access to
            user_id=userIDPInfo.id,                         # user id to use in the LiteLLM DB
            user_email=userIDPInfo.email,                   # user email to use in the LiteLLM DB
            user_role=LitellmUserRoles.INTERNAL_USER.value, # role to use for the user 
            max_budget=0.01,                                # Max budget for this UI login Session
            budget_duration="1d",                           # Duration of the budget for this UI login Session, 1d, 2d, 30d ...
        )
    except Exception as e:
        raise Exception("Failed custom auth")
```

#### 2. config.yaml에서 구성 {#2-configure-in-configyaml-1}

config.yaml에 파일 경로를 전달하세요.

예를 들어 `./config.yaml`과 `./custom_sso.py`가 같은 디렉터리에 있으면 다음과 같습니다.

```yaml 
model_list: 
  - model_name: "openai-model"
    litellm_params: 
      model: "gpt-3.5-turbo"

general_settings:
  custom_sso: custom_sso.custom_sso_handler

litellm_settings:
  drop_params: True
  set_verbose: True
```

#### 3. 프록시 시작
```shell
$ litellm --config /path/to/config.yaml 
```
