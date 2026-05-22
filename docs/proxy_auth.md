import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SDK Proxy 인증 (OAuth2/JWT 자동 갱신)

JWT 인증이 필요한 LiteLLM Proxy와 함께 LiteLLM Python SDK를 사용할 때 OAuth2/JWT 토큰을 자동으로 가져오고 갱신합니다.

## 개요

LiteLLM Proxy가 OAuth2/OIDC 공급자(Azure AD, Keycloak, Okta, Auth0 등)로 보호되는 경우 SDK 클라이언트는 모든 요청에 유효한 JWT 토큰이 필요합니다. 토큰 수명 주기를 직접 관리하는 대신 `litellm.proxy_auth`가 이를 자동으로 처리합니다.

- ID 공급자에서 토큰을 가져옵니다.
- 불필요한 요청을 피하기 위해 토큰을 캐시합니다.
- 만료되기 전에 토큰을 갱신합니다(60초 버퍼).
- 모든 요청에 `Authorization: Bearer <token>` 헤더를 삽입합니다.

## 빠른 시작

### Azure AD

<Tabs>
<TabItem value="default" label="DefaultAzureCredential">

[DefaultAzureCredential](https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential) 체인(환경 변수, managed identity, Azure CLI 등)을 사용합니다.

```python
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

# One-time setup
litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),  # uses DefaultAzureCredential
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

# All requests now include Authorization headers automatically
response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

</TabItem>
<TabItem value="client-secret" label="ClientSecretCredential">

특정 Azure AD 앱 등록을 사용합니다.

```python
import litellm
from azure.identity import ClientSecretCredential
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

azure_cred = ClientSecretCredential(
    tenant_id="your-tenant-id",
    client_id="your-client-id",
    client_secret="your-client-secret"
)

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(credential=azure_cred),
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

</TabItem>
</Tabs>

**필수 패키지:** `uv add azure-identity`

### Generic OAuth2 (Okta, Auth0, Keycloak 등)

`client_credentials` grant type을 지원하는 모든 OAuth2 공급자와 함께 작동합니다.

```python
import litellm
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-client-id",
        client_secret="your-client-secret",
        token_url="https://your-idp.example.com/oauth2/token"
    ),
    scope="litellm_proxy_api"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 사용자 지정 Credential Provider

원하는 인증 메커니즘을 사용하려면 `TokenCredential` 프로토콜을 구현합니다.

```python
import time
import litellm
from litellm.proxy_auth import AccessToken, ProxyAuthHandler

class MyCustomCredential:
    """Any class with a get_token(scope) -> AccessToken method works."""

    def get_token(self, scope: str) -> AccessToken:
        # Your custom logic to obtain a token
        token = my_auth_system.get_jwt(scope=scope)
        return AccessToken(
            token=token,
            expires_on=int(time.time()) + 3600
        )

litellm.proxy_auth = ProxyAuthHandler(
    credential=MyCustomCredential(),
    scope="my-scope"
)
```

## 지원 엔드포인트

다음 항목에는 인증 헤더가 자동으로 삽입됩니다.

| 엔드포인트 | 함수 |
|----------|----------|
| Chat Completions | `litellm.completion()` / `litellm.acompletion()` |
| Embeddings | `litellm.embedding()` / `litellm.aembedding()` |

## 작동 방식

```
┌──────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Your    │     │  ProxyAuthHandler │     │   Identity   │     │  LiteLLM     │
│  Code    │────▶│  (token cache)   │────▶│   Provider   │     │  Proxy       │
│          │     │                  │◀────│  (Azure AD,  │     │              │
│          │     │                  │     │   Okta, etc) │     │              │
│          │     └────────┬─────────┘     └──────────────┘     │              │
│          │              │ Authorization: Bearer <token>      │              │
│          │──────────────┼───────────────────────────────────▶│              │
│          │◀─────────────┼────────────────────────────────────│              │
└──────────┘              │                                    └──────────────┘
```

1. 시작 시 `litellm.proxy_auth`를 한 번 설정합니다.
2. 각 SDK 호출(`completion()`, `embedding()`)마다 핸들러가 캐시된 토큰을 확인합니다.
3. 토큰이 없거나 60초 이내에 만료될 경우 ID 공급자에 새 토큰을 요청합니다.
4. 요청에 `Authorization: Bearer <token>` 헤더가 삽입됩니다.
5. 토큰을 가져오지 못하면 경고를 기록하고 인증 헤더 없이 요청을 계속 진행합니다.

## API 참조

### ProxyAuthHandler

토큰 수명 주기를 관리하는 기본 핸들러입니다.

```python
from litellm.proxy_auth import ProxyAuthHandler

handler = ProxyAuthHandler(
    credential=<TokenCredential>,  # required - credential provider
    scope="<oauth2-scope>"         # required - OAuth2 scope to request
)
```

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `credential` | `TokenCredential` | 예 | credential provider(AzureADCredential, GenericOAuth2Credential 또는 사용자 지정) |
| `scope` | `str` | 예 | 토큰을 요청할 OAuth2 scope |

**메서드:**

| 메서드 | 반환값 | 설명 |
|--------|---------|-------------|
| `get_token()` | `AccessToken` | 유효한 토큰을 가져오며, 필요한 경우 갱신합니다. |
| `get_auth_headers()` | `dict` | `{"Authorization": "Bearer <token>"}` 헤더를 가져옵니다. |

### AzureADCredential

지연 초기화를 사용해 모든 `azure-identity` credential을 래핑합니다.

```python
from litellm.proxy_auth import AzureADCredential

# Uses DefaultAzureCredential (recommended)
cred = AzureADCredential()

# Or wrap a specific azure-identity credential
from azure.identity import ManagedIdentityCredential
cred = AzureADCredential(credential=ManagedIdentityCredential())
```

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `credential` | Azure `TokenCredential` | 아니요 | azure-identity credential입니다. `None`이면 `DefaultAzureCredential`을 사용합니다. |

### GenericOAuth2Credential 클래스

모든 공급자에 사용할 수 있는 표준 OAuth2 client credentials flow입니다.

```python
from litellm.proxy_auth import GenericOAuth2Credential

cred = GenericOAuth2Credential(
    client_id="your-client-id",
    client_secret="your-client-secret",
    token_url="https://your-idp.com/oauth2/token"
)
```

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `client_id` | `str` | 예 | OAuth2 client ID |
| `client_secret` | `str` | 예 | OAuth2 client secret |
| `token_url` | `str` | 예 | 토큰 endpoint URL |

### AccessToken

OAuth2 access token을 나타내는 dataclass입니다.

```python
from litellm.proxy_auth import AccessToken

token = AccessToken(
    token="eyJhbG...",     # JWT string
    expires_on=1234567890  # Unix timestamp
)
```

### TokenCredential 프로토콜

이 프로토콜을 구현하는 모든 클래스는 credential provider로 사용할 수 있습니다.

```python
from litellm.proxy_auth import AccessToken

class MyCredential:
    def get_token(self, scope: str) -> AccessToken:
        ...
```

## 공급자별 예제

### Keycloak

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="litellm-client",
        client_secret="your-keycloak-client-secret",
        token_url="https://keycloak.example.com/realms/your-realm/protocol/openid-connect/token"
    ),
    scope="openid"
)
```

### Okta

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-okta-client-id",
        client_secret="your-okta-client-secret",
        token_url="https://your-org.okta.com/oauth2/default/v1/token"
    ),
    scope="litellm_api"
)
```

### Auth0

```python
from litellm.proxy_auth import GenericOAuth2Credential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=GenericOAuth2Credential(
        client_id="your-auth0-client-id",
        client_secret="your-auth0-client-secret",
        token_url="https://your-tenant.auth0.com/oauth/token"
    ),
    scope="https://my-proxy.example.com/api"
)
```

### Managed Identity를 사용하는 Azure AD

```python
from azure.identity import ManagedIdentityCredential
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(
        credential=ManagedIdentityCredential()
    ),
    scope="api://my-litellm-proxy/.default"
)
```

## `use_litellm_proxy`와 함께 사용

<span><code>proxy_auth</code>를 <a href="./providers/litellm_proxy#send-all-sdk-requests-to-litellm-proxy"><code>use_litellm_proxy</code></a>와 함께 사용하면 모든 SDK 요청을 인증된 proxy를 통해 라우팅할 수 있습니다.</span>

```python
import os
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

# Route all requests through the proxy
os.environ["LITELLM_PROXY_API_BASE"] = "https://my-proxy.example.com"
litellm.use_litellm_proxy = True

# Authenticate with OAuth2/JWT
litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),
    scope="api://my-litellm-proxy/.default"
)

# This request goes through the proxy with automatic JWT auth
response = litellm.completion(
    model="vertex_ai/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Hello!"}]
)
```
