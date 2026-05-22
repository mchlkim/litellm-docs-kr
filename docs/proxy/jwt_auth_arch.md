import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OIDC(Azure AD/Keycloak 등)로 모델 액세스 제어 {#control-model-access-with-oidc-azure-adkeycloaketc}

:::info

✨ JWT Auth는 LiteLLM 엔터프라이즈에서 제공됩니다

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

<Image img={require('../../img/control_model_access_jwt.png')} style={{ width: '100%', maxWidth: '4000px' }} />

## Token 예제 {#example-token}

<Tabs>
<TabItem value="Azure AD">

```bash
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "roles": ["basic_user"] # 👈 ROLE
}
```
</TabItem>
<TabItem value="Keycloak">

```bash
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "resource_access": {
    "litellm-test-client-id": {
      "roles": ["basic_user"] # 👈 ROLE
    }
  }
}
```
</TabItem>
</Tabs>

## Proxy 설정

<Tabs>
<TabItem value="Azure AD">

```yaml
general_settings:
  enable_jwt_auth: True 
  litellm_jwtauth:
    user_roles_jwt_field: "roles" # the field in the JWT that contains the roles 
    user_allowed_roles: ["basic_user"] # roles that map to an 'internal_user' role on LiteLLM 
    enforce_rbac: true # if true, will check if the user has the correct role to access the model
  
  role_permissions: # control what models are allowed for each role
    - role: internal_user
      models: ["anthropic-claude"]

model_list:
    - model: anthropic-claude
      litellm_params:
        model: claude-3-5-haiku-20241022
    - model: openai-gpt-4o
      litellm_params:
        model: gpt-4o
```

</TabItem>
<TabItem value="Keycloak">

```yaml
general_settings:
  enable_jwt_auth: True 
  litellm_jwtauth:
    user_roles_jwt_field: "resource_access.litellm-test-client-id.roles" # the field in the JWT that contains the roles
    user_allowed_roles: ["basic_user"] # roles that map to an 'internal_user' role on LiteLLM 
    enforce_rbac: true # if true, will check if the user has the correct role to access the model
  
  role_permissions: # control what models are allowed for each role
    - role: internal_user
      models: ["anthropic-claude"]

model_list:
    - model: anthropic-claude
      litellm_params:
        model: claude-3-5-haiku-20241022
    - model: openai-gpt-4o
      litellm_params:
        model: gpt-4o
```

</TabItem>
</Tabs>


## 동작 방식

1. JWT_PUBLIC_KEY_URL 지정 - OpenID provider의 public keys endpoint입니다. Azure AD에서는 `https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys`를 사용합니다. Keycloak에서는 `{keycloak_base_url}/realms/{your-realm}/protocol/openid-connect/certs`를 사용합니다.

1. JWT role을 LiteLLM role에 매핑 - `user_roles_jwt_field` 및 `user_allowed_roles`로 설정합니다.
    - 현재 role mapping은 `internal_user`만 지원합니다.
2. 모델 액세스 지정:
    - `role_permissions`: 각 role에 허용할 모델을 제어합니다.
        - `role`: 액세스를 제어할 LiteLLM role입니다. 허용되는 role = ["internal_user", "proxy_admin", "team"]
        - `models`: 해당 role이 액세스할 수 있는 모델 목록입니다.
    - `model_list`: proxy의 상위 모델 목록입니다. [자세히 알아보기](./configs.md#llm-configs-model_list)

3. 모델 검사: proxy는 수신한 JWT에 대해 validation check를 실행합니다. [코드](https://github.com/BerriAI/litellm/blob/3a4f5b23b5025b87b6d969f2485cc9bc741f9ba6/litellm/proxy/auth/user_api_key_auth.py#L284)
