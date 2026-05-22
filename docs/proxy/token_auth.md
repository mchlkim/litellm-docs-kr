import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OIDC - JWT 기반 인증 {#oidc-jwt-based-auth}

JWT를 사용해 admin, user, project를 proxy에 인증합니다.

:::info

✨ JWT 기반 Auth는 LiteLLM 엔터프라이즈에서 제공됩니다.

[엔터프라이즈 요금제](https://www.litellm.ai/#pricing)

[무료 체험 문의하기](https://enterprise.litellm.ai/demo)

:::


:::tip JWT → Virtual Key 매핑

API key를 배포하지 않고 사용자별 model 제한, spend limit, rate limit을 적용하려면 **[JWT → Virtual Key 매핑](./jwt_key_mapping.md)**을 참고하세요. JWT로 인증된 사용자(예: Claude Code + SSO)를 위한 엔터프라이즈급 세밀한 access control입니다.

:::

## 사용법

### 1단계. Proxy 설정 {#step-1-proxy-settings}

- `JWT_PUBLIC_KEY_URL`: OpenID provider의 public keys endpoint입니다. 일반적으로 `{openid-provider-base-url}/.well-known/openid-configuration/jwks`입니다. Keycloak에서는 `{keycloak_base_url}/realms/{your-realm}/protocol/openid-connect/certs`입니다.
- `JWT_AUDIENCE`: JWT decode에 사용할 audience입니다. 설정하지 않으면 decode 단계에서 audience를 검증하지 않습니다.

```bash
export JWT_PUBLIC_KEY_URL="" # "https://demo.duendesoftware.com/.well-known/openid-configuration/jwks"
```

- config의 `enable_jwt_auth`를 설정합니다. 그러면 proxy가 token이 JWT token인지 확인합니다.

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True

model_list:
- model_name: azure-gpt-3.5 
  litellm_params:
      model: azure/<your-deployment-name>
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

### 2단계. scope가 포함된 JWT 생성 {#step-2-generate-a-jwt-with-a-scope}

<Tabs>
<TabItem value="admin" label="admin">

OpenID provider(예: Keycloak)에 `litellm_proxy_admin`이라는 client scope를 생성합니다.

JWT를 생성할 때 사용자에게 `litellm_proxy_admin` scope를 부여합니다.

```bash
curl --location ' 'https://demo.duendesoftware.com/connect/token'' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={CLIENT_ID}' \
--data-urlencode 'client_secret={CLIENT_SECRET}' \
--data-urlencode 'username=test-{USERNAME}' \
--data-urlencode 'password={USER_PASSWORD}' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=litellm_proxy_admin' # 👈 grant this scope
```
</TabItem>
<TabItem value="project" label="project">

OpenID provider(예: Keycloak)에서 project용 JWT를 생성합니다.

```bash
curl --location ' 'https://demo.duendesoftware.com/connect/token'' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={CLIENT_ID}' \ # 👈 project id
--data-urlencode 'client_secret={CLIENT_SECRET}' \
--data-urlencode 'grant_type=client_credential' \
```

</TabItem>
</Tabs>

### 3단계. JWT 테스트 {#step-3-test-the-jwt}

<Tabs>
<TabItem value="key" label="/key/generate">

```bash
curl --location '{proxy_base_url}/key/generate' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiI...' \
--header 'Content-Type: application/json' \
--data '{}'
```
</TabItem>
<TabItem value="llm_call" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1...' \
--data '{"model": "azure-gpt-3.5", "messages": [ { "role": "user", "content": "What's the weather like in Boston today?" } ]}'
```

</TabItem>
</Tabs>

## 고급 설정

### 여러 OIDC provider

LiteLLM이 여러 OIDC provider(예: Google Cloud, GitHub Auth)를 기준으로 JWT를 검증하도록 하려면 이 설정을 사용합니다.

환경의 `JWT_PUBLIC_KEY_URL`을 OIDC provider URL의 쉼표로 구분된 목록으로 설정합니다.

```bash
export JWT_PUBLIC_KEY_URL="https://demo.duendesoftware.com/.well-known/openid-configuration/jwks,https://accounts.google.com/.well-known/openid-configuration/jwks"
```

### Kubernetes ServiceAccount 인증

Kubernetes ServiceAccount token을 사용해 cluster에서 실행되는 workload를 인증합니다. pod가 native Kubernetes identity로 LiteLLM에 인증해야 할 때 유용합니다.

#### 사전 준비

1. Kubernetes cluster에서 ServiceAccount token projection이 활성화되어 있어야 합니다(Kubernetes 1.20+ 기본값).
2. cluster의 OIDC issuer에 접근할 수 있어야 합니다(EKS, GKE, AKS에서는 자동).

#### 1단계: OIDC Discovery URL 구성 {#step-1-configure-the-oidc-discovery-url}

`JWT_PUBLIC_KEY_URL`을 cluster의 OIDC discovery endpoint로 설정합니다.

<Tabs>
<TabItem value="eks" label="Amazon EKS">

```bash
# Get your EKS OIDC issuer URL
aws eks describe-cluster --name <cluster-name> --query "cluster.identity.oidc.issuer" --output text

# Set the JWKS URL (append /keys to the issuer URL)
export JWT_PUBLIC_KEY_URL="https://oidc.eks.<region>.amazonaws.com/id/<id>/keys"
```

</TabItem>
<TabItem value="gke" label="Google GKE">

```bash
# GKE uses Google's OIDC provider
export JWT_PUBLIC_KEY_URL="https://container.googleapis.com/v1/projects/<project>/locations/<location>/clusters/<cluster>/jwks"
```

</TabItem>
<TabItem value="aks" label="Azure AKS">

```bash
# Get your AKS OIDC issuer URL
az aks show --name <cluster-name> --resource-group <resource-group> --query "oidcIssuerProfile.issuerUrl" -o tsv

# Set the JWKS URL
export JWT_PUBLIC_KEY_URL="<issuer-url>/openid/v1/jwks"
```

</TabItem>
<TabItem value="self-managed" label="Self-Managed">

```bash
# For self-managed clusters, check your API server's --service-account-issuer flag
# The JWKS endpoint is typically at:
export JWT_PUBLIC_KEY_URL="https://<api-server>/openid/v1/jwks"
```

</TabItem>
</Tabs>

#### 2단계: LiteLLM 구성 {#step-2-configure-litellm}

Kubernetes ServiceAccount token에서 identity 정보를 추출하도록 LiteLLM을 구성합니다.

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:  
    # Use namespace as team identifier (resolves via team_alias in DB)
    team_alias_jwt_field: "kubernetes\.io.namespace"
```

#### 3단계: ServiceAccount 생성 및 Pod 구성 {#step-3-create-serviceaccount-and-configure-pod}

연결된 secret이 있는 ServiceAccount를 만들고 pod가 해당 token을 사용하도록 구성합니다.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-llm-client
  namespace: my-app
---
apiVersion: v1
kind: Secret
metadata:
  name: my-llm-client-token
  namespace: my-app
  annotations:
    kubernetes.io/service-account.name: my-llm-client
type: kubernetes.io/service-account-token
---
apiVersion: v1
kind: Pod
metadata:
  name: llm-client-pod
  namespace: my-app
spec:
  serviceAccountName: my-llm-client
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: LITELLM_TOKEN
      valueFrom:
        secretKeyRef:
          name: my-llm-client-token
          key: token
```

LiteLLM에서 예상 audience를 설정합니다.

```bash
export JWT_AUDIENCE="https://kubernetes.default.svc"
```

#### 4단계: Namespace용 Team 생성 {#step-4-create-team-for-namespace}

`team_alias`를 사용해 namespace와 일치하는 team을 LiteLLM에 생성합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-d '{
    "team_alias": "my-app",
    "team_id": "my-app",
    "models": ["gpt-4", "claude-sonnet-4-20250514"]
}'
```

#### 5단계: Token 사용 {#step-5-use-the-token}

pod 내부에서는 `LITELLM_TOKEN` environment variable로 token을 사용할 수 있습니다.

```bash
# Make a request to LiteLLM using the env var
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_TOKEN" \
-d '{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "Hello!"}]
}'
```

#### 예제: ServiceAccount Token 구조

Kubernetes ServiceAccount token은 다음과 같은 형태입니다.

```json
{
  "aud": ["litellm-proxy"],
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLE",
  "kubernetes.io": {
    "namespace": "my-app",
    "pod": {
      "name": "llm-client-pod",
      "uid": "pod-uid"
    },
    "serviceaccount": {
      "name": "my-llm-client",
      "uid": "sa-uid"
    }
  },
  "nbf": 1234567890,
  "sub": "system:serviceaccount:my-app:my-llm-client"
}
```

#### 고급: 이름 해석으로 Namespace를 Team에 매핑 {#advanced-map-namespace-to-team-with-name-resolution}

`team_alias_jwt_field`를 사용하면 namespace를 team으로 자동 해석할 수 있습니다.

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    # Map the namespace to team_alias in the database
    team_alias_jwt_field: "kubernetes\.io.namespace"
    user_id_upsert: true
```

이렇게 하면 `production` namespace의 pod가 `team_alias: production`을 가진 team에 자동으로 연결됩니다.

### 허용할 JWT Scope 이름 설정 

LiteLLM이 사용자의 admin access 여부를 판단할 때 확인하는 JWT `scopes` 문자열을 변경합니다.

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
```

### End-User / Internal User / Team / Org 추적 {#end-user-internal-user-team-org-tracking}

JWT token에서 LiteLLM user, team, org에 대응하는 field를 설정합니다.

**참고:** 모든 JWT field는 nested claim 접근을 위해 dot notation을 지원합니다(예: `"user.sub"`, `"resource_access.client.roles"`).

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    team_id_jwt_field: "client_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    user_id_jwt_field: "sub" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    org_id_jwt_field: "org_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
    end_user_id_jwt_field: "customer_id" # 👈 CAN BE ANY FIELD (supports dot notation for nested claims)
```

예상 JWT(flat structure): 

```json
{
  "client_id": "my-unique-team",
  "sub": "my-unique-user",
  "org_id": "my-unique-org"
}
```

**또는 dot notation을 사용하는 nested structure:**

```json
{
  "user": {
    "sub": "my-unique-user",
    "email": "user@example.com"
  },
  "tenant": {
    "team_id": "my-unique-team"
  },
  "organization": {
    "id": "my-unique-org"
  }
}
```

**nested example용 설정:**

```yaml
litellm_jwtauth:
  user_id_jwt_field: "user.sub"
  user_email_jwt_field: "user.email"
  team_id_jwt_field: "tenant.team_id"
  org_id_jwt_field: "organization.id"
```

이제 LiteLLM은 각 call마다 user/team/org의 spend를 db에서 자동으로 update합니다. 

### ID 대신 이름(Alias)으로 해석 {#resolve-by-name-alias-instead-of-id}

JWT token에 database ID 대신 사람이 읽을 수 있는 name이 들어 있는 경우가 있습니다. LiteLLM은 database에서 해당 name을 조회해 ID로 해석할 수 있습니다.

**사용 사례:** IDP는 JWT에 team/org name을 제공하지만, LiteLLM은 spend tracking과 access control을 위해 실제 database ID가 필요한 경우입니다.

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    # Name-based fields (resolved via database lookup)
    team_alias_jwt_field: "team_alias"       # Resolves team by team_alias in DB
    org_alias_jwt_field: "org_alias"         # Resolves org by organization_alias in DB
```

**예상 JWT:**

```json
{
  "sub": "user-123",
  "team_alias": "engineering-team",
  "org_alias": "acme-corp"
}
```

**동작 방식:**

1. LiteLLM이 구성된 JWT field에서 name을 추출합니다
2. alias field로 database에서 entity를 조회합니다:
   - Teams: `LiteLLM_TeamTable`의 `team_alias` column
   - Organizations: `LiteLLM_OrganizationTable`의 `organization_alias` column
3. 해석된 ID를 spend tracking과 access control에 사용합니다

**우선순위:** ID field는 항상 name field보다 우선합니다. `team_id_jwt_field`와 `team_alias_jwt_field`가 모두 구성되어 있고 JWT에 두 값이 모두 있으면 ID가 사용됩니다.

```yaml
# Example: ID takes precedence
litellm_jwtauth:
  team_id_jwt_field: "team_id"        # Used if present in JWT
  team_alias_jwt_field: "team_alias"   # Fallback if team_id not present
```

**Nested Fields:** name field도 nested claim을 위한 dot notation을 지원합니다.

```yaml
litellm_jwtauth:
  team_alias_jwt_field: "organization.team.name"
  org_alias_jwt_field: "company.name"
```

**중요 참고:**
- entity(team/org)는 일치하는 alias와 함께 database에 이미 존재해야 합니다
- alias는 unique해야 합니다. 여러 entity가 같은 alias를 공유하면 error가 반환됩니다
- name resolution은 database lookup을 추가하므로 ID를 직접 사용하는 것이 약간 더 성능이 좋습니다

### JWT Scope {#jwt-scopes}

JWT-Auth token의 scope는 다음과 같은 형태입니다

**list일 수 있습니다**
```
scope: ["litellm-proxy-admin",...]
```

**공백으로 구분된 string일 수 있습니다**
```
scope: "litellm-proxy-admin ..."
```

### Team으로 model access 제어


1. 사용자가 속한 team id가 들어 있는 JWT field를 지정합니다. 

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups" 
    user_id_upsert: true # add user_id to the db if they don't exist
    enforce_team_based_model_access: true # don't allow users to access models unless the team has access
```

token이 다음과 같은 형태라고 가정합니다.
```
{
  ...,
  "sub": "my-unique-user",
  "groups": ["team_id_1", "team_id_2"]
}
```

2. LiteLLM에 team을 생성합니다 

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-D '{
    "team_alias": "team_1",
    "team_id": "team_id_1" # 👈 MUST BE THE SAME AS THE SSO GROUP ID
}'
```

3. flow 테스트

UI용 SSO: [**Walkthrough 보기**](https://www.loom.com/share/8959be458edf41fd85937452c29a33f3?sid=7ebd6d37-569a-4023-866e-e0cde67cb23e)

API용 OIDC Auth: [**Walkthrough 보기**](https://www.loom.com/share/00fe2deab59a426183a46b1e2b522200?sid=4ed6d497-ead6-47f9-80c0-ca1c4b6b4814)


### 흐름 {#flow}

- user id가 DB(`LiteLLM_UserTable`)에 있는지 검증합니다
- group 중 하나라도 DB(`LiteLLM_TeamTable`)에 있는지 검증합니다
- group 중 하나라도 model access를 가지는지 검증합니다
- 모든 check가 통과하면 request를 허용합니다

### Request Header로 Team 선택 {#select-team-with-request-header}

JWT token에 `team_ids_jwt_field`를 통해 여러 team이 포함되어 있으면 `x-litellm-team-id` header를 전달해 request에 사용할 team을 명시적으로 선택할 수 있습니다.

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your-jwt-token>' \
-H 'x-litellm-team-id: team_id_2' \
-d '{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

**검증:**
- header의 team ID는 JWT의 `team_ids_jwt_field` list에 있거나 `team_id_jwt_field`와 일치해야 합니다
- 유효하지 않은 team이 지정되면 403 error가 반환됩니다
- header가 제공되지 않으면 LiteLLM은 요청된 model에 access가 있는 첫 번째 team을 자동 선택합니다


### Custom JWT 검증 {#custom-jwt-validate}

LiteLLM Proxy에서 token 유효성을 추가 방식으로 확인해야 한다면 custom logic으로 JWT Token을 검증할 수 있습니다.

#### 1. custom validate function 설정

```python
from typing import Literal

def my_custom_validate(token: str) -> Literal[True]:
  """
  Only allow tokens with tenant-id == "my-unique-tenant", and claims == ["proxy-admin"]
  """
  allowed_tenants = ["my-unique-tenant"]
  allowed_claims = ["proxy-admin"]

  if token["tenant_id"] not in allowed_tenants:
    raise Exception("Invalid JWT token")
  if token["claims"] not in allowed_claims:
    raise Exception("Invalid JWT token")
  return True
```

#### 2. config.yaml 설정

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_id_jwt_field: "tenant_id"
    user_id_upsert: True
    custom_validate: custom_validate.my_custom_validate # 👈 custom validate function
```

#### 3. flow 테스트

**예상 JWT**

```
{
  "sub": "my-unique-user",
  "tenant_id": "INVALID_TENANT",
  "claims": ["proxy-admin"]
}
```

**예상 Response**

```
{
  "error": "Invalid JWT token"
}
```



### 허용 Route {#allowed-routes}

JWT가 access할 수 있는 route를 config로 구성합니다.

기본값: 

- Admin은 management route에만 access할 수 있습니다(`/team/*`, `/key/*`, `/user/*`)
- Team은 openai route에만 access할 수 있습니다(`/chat/completions`, etc.) + info route(`/*/info`)

[**Code 보기**](https://github.com/BerriAI/litellm/blob/b204f0c01c703317d812a1553363ab0cb989d5b6/litellm/proxy/_types.py#L95)

**Admin Route**
```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    admin_allowed_routes: ["/v1/embeddings"]
```

**Team Route**
```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    ...
    team_id_jwt_field: "litellm-team" # 👈 Set field in the JWT token that stores the team ID
    team_allowed_routes: ["/v1/chat/completions"] # 👈 Set accepted routes
```

### Team에 다른 provider route 허용

team JWT token이 `/v1/messages` 같은 Anthropic-style endpoint에 access할 수 있게 하려면 `litellm_jwtauth` 구성의 `team_allowed_routes`를 update합니다. `team_allowed_routes`는 다음 값을 지원합니다:

- `LiteLLMRoutes`의 named route group(예: `openai_routes`, `anthropic_routes`, `info_routes`, `mapped_pass_through_routes`).

사용할 수 있는 route group과 각 group의 대표 route 예시는 아래 quick reference를 참고하세요. 전체 목록이 필요하면 authoritative list인 `litellm/proxy/_types.py`의 `LiteLLMRoutes` enum을 확인하세요.

| Route Group | 포함 내용 | 대표 route |
|-------------|------------------|-----------------------|
| `openai_routes` | OpenAI-compatible REST endpoint(chat, completion, embeddings, images, responses, models 등) | `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`, `/v1/images/generations`, `/v1/models` |
| `anthropic_routes` | Anthropic-style endpoint(`/v1/messages` 및 관련 route) | `/v1/messages`, `/v1/messages/count_tokens`, `/v1/skills` |
| `mapped_pass_through_routes` | provider별 pass-through route prefix(예: `/anthropic`으로 proxy되는 Anthropic). provider wildcard mapping에는 `mapped_pass_through_routes`와 함께 사용 | `/anthropic/*`, `/vertex-ai/*`, `/bedrock/*` |
| `passthrough_routes_wildcard` | provider용 wildcard mapping(예: `/anthropic/*`) - proxy가 사용하는 사전 계산된 wildcard list | `/anthropic/*`, `/vllm/*` |
| `google_routes` | Google-specific endpoint(예: Vertex / Batching endpoint) | `/v1beta/models/{model_name}:generateContent` |
| `mcp_routes` | 내부 MCP management endpoint | `/mcp/tools`, `/mcp/tools/call` |
| `info_routes` | UI가 사용하는 read-only 및 info endpoint | `/key/info`, `/team/info`, `/v1/models` |
| `management_routes` | Admin 전용 management endpoint(user/team/model create/update/delete) | `/team/new`, `/key/generate`, `/model/new` |
| `spend_tracking_routes` | Budget/spend 관련 endpoint | `/spend/logs`, `/spend/keys` |
| `public_routes` | Public 및 unauthenticated endpoint | `/`, `/routes`, `/.well-known/litellm-ui-config` |

참고: `llm_api_routes`는 OpenAI, Anthropic, Google, pass-through 및 기타 LLM route의 union입니다 (`openai_routes + anthropic_routes + google_routes + mapped_pass_through_routes + passthrough_routes_wildcard + apply_guardrail_routes + mcp_routes + litellm_native_routes`).

기본값(`litellm_jwtauth`에서 override하지 않으면 proxy가 사용하는 값):

- `admin_jwt_scope`: `litellm_proxy_admin`
- `admin_allowed_routes`(default): `management_routes`, `spend_tracking_routes`, `global_spend_tracking_routes`, `info_routes` 
- `team_allowed_routes`(default): `openai_routes`, `info_routes` 
- `public_allowed_routes`(default): `public_routes`


예제: team JWT가 Anthropic `/v1/messages`를 호출하도록 허용(route group 또는 명시적 route string 사용):

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes", "info_routes", "anthropic_routes"]
```

또는 정확한 Anthropic message endpoint만 선택적으로 허용합니다:

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["/v1/messages", "info_routes"]
```


### Public Key 캐싱 {#public-key-caching}

public key를 cache할 시간(초)을 제어합니다.

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    admin_jwt_scope: "litellm-proxy-admin"
    admin_allowed_routes: ["/v1/embeddings"]
    public_key_ttl: 600 # 👈 KEY CHANGE
```

### Custom JWT Field {#custom-jwt-field}

team_id가 들어 있는 custom field를 설정합니다. 기본적으로 `client_id` field를 확인합니다. 

```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    team_id_jwt_field: "client_id" # 👈 KEY CHANGE
```

### Team 차단 

특정 team id의 모든 request를 차단하려면 `/team/block`을 사용합니다

**Team 차단**

```bash
curl --location 'http://0.0.0.0:4000/team/block' \
--header 'Authorization: Bearer <admin-token>' \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "litellm-test-client-id-new" # 👈 set team id
}'
```

**Team 차단 해제**

```bash
curl --location 'http://0.0.0.0:4000/team/unblock' \
--header 'Authorization: Bearer <admin-token>' \
--header 'Content-Type: application/json' \
--data '{
    "team_id": "litellm-test-client-id-new" # 👈 set team id
}'
```


### User Upsert + 허용 Email Domain {#user-upsert-allowed-email-domain}

특정 email domain에 속한 user에게 proxy 자동 access를 허용합니다.

**참고:** `user_allowed_email_domain`은 선택 사항입니다. 지정하지 않으면 email domain과 관계없이 모든 user가 허용됩니다.
 
```yaml
general_settings:
  master_key: sk-1234
  enable_jwt_auth: True
  litellm_jwtauth:
    user_email_jwt_field: "email" # 👈 checks 'email' field in jwt payload
    user_allowed_email_domain: "my-co.com" # 👈 OPTIONAL - allows user@my-co.com to call proxy
    user_id_upsert: true # 👈 upserts the user to db, if valid email but not in db
```

## OIDC UserInfo 엔드포인트 {#oidc-userinfo-endpoint}

JWT/access token에 user-identifying information이 없을 때 사용합니다. LiteLLM은 identity provider의 UserInfo endpoint를 호출해 user detail을 가져옵니다.

### 사용 시점

- JWT가 opaque(self-contained가 아님)이거나 user claim이 없습니다
- identity provider에서 최신 user information을 가져와야 합니다
- access token에 email, role 또는 기타 identifying data가 포함되어 있지 않습니다

### 설정

```yaml title="config.yaml" showLineNumbers
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    # Enable OIDC UserInfo endpoint
    oidc_userinfo_enabled: true
    oidc_userinfo_endpoint: "https://your-idp.com/oauth2/userinfo"
    oidc_userinfo_cache_ttl: 300  # Cache for 5 minutes (default: 300)
    
    # Map fields from UserInfo response
    user_id_jwt_field: "sub"
    user_email_jwt_field: "email"
    user_roles_jwt_field: "roles"
```

### Flow Diagram {#flow-diagram}

```mermaid
sequenceDiagram
    participant Client
    participant LiteLLM
    participant IdP as Identity Provider

    Client->>LiteLLM: Request with Bearer token
    Note over LiteLLM: Check cache for UserInfo
    
    LiteLLM->>IdP: GET /userinfo (if not cached)<br/>Authorization: Bearer {token}
    IdP-->>LiteLLM: User data (sub, email, roles)
    
    Note over LiteLLM: Cache response (TTL: 5min)<br/>Extract user_id, email, roles<br/>Perform RBAC checks
    
    LiteLLM-->>Client: Authorized/Denied
```

### 예제: Azure AD

```yaml title="config.yaml" showLineNumbers
litellm_jwtauth:
  oidc_userinfo_enabled: true
  oidc_userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo"
  user_id_jwt_field: "sub"
  user_email_jwt_field: "email"
```

### 예제: Keycloak

```yaml title="config.yaml" showLineNumbers
litellm_jwtauth:
  oidc_userinfo_enabled: true
  oidc_userinfo_endpoint: "https://keycloak.example.com/realms/your-realm/protocol/openid-connect/userinfo"
  user_id_jwt_field: "sub"
  user_roles_jwt_field: "resource_access.your-client.roles"
```

## JWT 형태 Machine Token을 OAuth2로 Route {#route-jwt-shaped-machine-tokens-to-oauth2}

다음 경우에 사용합니다:
- standard JWT validation에 `enable_jwt_auth: true`를 사용합니다
- machine token이 JWT 형태이고 claim을 기준으로 OAuth2에 route되어야 합니다

`routing_overrides`는 두 가지 operating mode를 지원합니다:
- **선택 모드**: `enable_oauth2_auth: false`를 설정하면 LLM + info route에서 matching JWT만 OAuth2로 보냅니다
- **전역 모드**: `enable_oauth2_auth: true`를 설정하면 LLM + info route에서도 OAuth2를 활성화합니다

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    routing_overrides:
      - iss: "machine-issuer.example.com"
        client_id: "MID_LITELLM"
        path: "oauth2"
```

### 매칭 동작 {#matching-behavior}

- 구성된 selector가 모두 token claim과 match되면 rule이 match됩니다
- 지원 selector: `iss`(required), `client_id`(optional), `aud`(optional)
- selector value는 string과 list form을 모두 지원합니다
- rule이 match되지 않으면 LiteLLM은 standard JWT validation을 계속합니다

### List 기반 override 예제

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    routing_overrides:
      - iss: ["machine-issuer.example.com", "backup-issuer.example.com"]
        client_id: ["MID_LITELLM", "MID_BACKUP"]
        aud: ["api://litellm", "api://fallback"]
        path: "oauth2"
```

## [BETA] OIDC Role로 Access 제어 {#beta-control-access-with-oidc-roles}

지원 role이 있는 JWT token이 proxy에 access할 수 있도록 허용합니다.

user와 team을 DB에 추가하지 않고도 proxy에 access할 수 있게 합니다.


중요: RBAC system이 활성화되도록 `enforce_rbac: true`를 설정하세요.

**참고:** 이 기능은 beta이며 예고 없이 변경될 수 있습니다.

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    object_id_jwt_field: "oid" # can be either user / team, inferred from the role mapping
    roles_jwt_field: "roles"
    role_mappings:
      - role: litellm.api.consumer
        internal_role: "team"
    enforce_rbac: true # 👈 VERY IMPORTANT

  role_permissions: # default model + endpoint permissions for a role. 
    - role: team
      models: ["anthropic-claude"]
      routes: ["/v1/chat/completions"]

environment_variables:
  JWT_AUDIENCE: "api://LiteLLM_Proxy" # ensures audience is validated
```

- `object_id_jwt_field`: JWT token에서 object ID를 담은 field입니다. 이 ID는 user ID 또는 team ID일 수 있습니다. `user_id_jwt_field`와 `team_id_jwt_field` 대신 사용하세요. 같은 field가 둘 다 될 수 있는 경우에도 사용할 수 있습니다. nested claim에는 **dot notation을 지원합니다**(예: `"profile.object_id"`).

- `roles_jwt_field`: JWT token에서 role을 담은 field입니다. 이 field는 user가 가진 role list입니다. nested field에는 **dot notation을 지원합니다**(예: `resource_access.litellm-test-client-id.roles`).

**추가 JWT Field 설정 옵션:**

- `team_ids_jwt_field`: team ID를 담은 field(list). **dot notation을 지원합니다**(예: `"groups"`, `"teams.ids"`).
- `user_email_jwt_field`: user email을 담은 field. **dot notation을 지원합니다**(예: `"email"`, `"user.email"`).
- `end_user_id_jwt_field`: cost tracking용 end-user ID를 담은 field. **dot notation을 지원합니다**(예: `"customer_id"`, `"customer.id"`).

- `role_mappings`: JWT token에서 받은 role을 LiteLLM 내부 role에 매핑하는 role mapping list입니다.

- `JWT_AUDIENCE`: JWT token의 audience입니다. JWT token의 audience를 validate하는 데 사용합니다. environment variable로 설정합니다.

### 예제 Token 

```bash
{
  "aud": "api://LiteLLM_Proxy",
  "oid": "eec236bd-0135-4b28-9354-8fc4032d543e",
  "roles": ["litellm.api.consumer"] 
}
```

### Role Mapping Spec {#role-mapping-spec}

- `role`: JWT token에서 기대하는 role입니다. 
- `internal_role`: access control에 사용할 LiteLLM 내부 role입니다. 

지원 internal role:
- `team`: Team object가 RBAC spend tracking에 사용됩니다. `use case`의 spend tracking에 사용하세요. 
- `internal_user`: User object가 RBAC spend tracking에 사용됩니다. `individual user`의 spend tracking에 사용하세요.
- `proxy_admin`: Proxy admin이 RBAC spend tracking에 사용됩니다. token에 admin access를 부여할 때 사용하세요.

### [아키텍처 Diagram (Control Model Access)](./jwt_auth_arch)

## [BETA] Scope로 Model Access 제어 {#beta-control-model-access-with-scopes}

JWT가 access할 수 있는 model을 제어합니다. scope 기반 access control을 강제하려면 `enforce_scope_based_access: true`를 설정하세요.

### 1. scope mapping으로 config.yaml 설정


```yaml
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-3-5-sonnet
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: gpt-3.5-turbo-testing
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_id_jwt_field: "client_id" # 👈 set the field in the JWT token that contains the team id
    team_id_upsert: true # 👈 upsert the team to db, if team id is not found in db
    scope_mappings:
      - scope: litellm.api.consumer
        models: ["anthropic-claude"]
      - scope: litellm.api.gpt_3_5_turbo
        models: ["gpt-3.5-turbo-testing"]
    enforce_scope_based_access: true # 👈 enforce scope-based access control
    enforce_rbac: true # 👈 enforces only a Team/User/ProxyAdmin can access the proxy.
```

#### Scope Mapping Spec {#scope-mapping-spec}

- `scope`: JWT token에 사용할 scope입니다.
- `models`: JWT token이 access할 수 있는 model입니다. 값은 `model_list`의 `model_name`입니다. 참고: wildcard route는 현재 지원되지 않습니다.

### 2. 올바른 scope가 포함된 JWT 생성

예상 Token:

```bash
{
  "scope": ["litellm.api.consumer", "litellm.api.gpt_3_5_turbo"] # can be a list or a space-separated string
}
```

### 3. flow 테스트.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJhbGci...' \
-d '{
  "model": "gpt-3.5-turbo-testing",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going 1234?"
    }
  ]
}'
```

## [BETA] IDP와 User Role 및 Team Sync {#beta-sync-user-roles-and-teams-with-idp}

Identity Provider(IDP)의 user role과 team membership을 LiteLLM database로 자동 sync합니다. 이를 통해 LiteLLM의 user permission과 team membership이 IDP와 동기화됩니다.

**참고:** 이 기능은 beta이며 예고 없이 변경될 수 있습니다.

### 사용 사례 {#use-case}

- **Role 동기화**: IDP에서 role이 변경되면 LiteLLM의 user role을 자동 update합니다
- **Team Membership 동기화**: IDP와 LiteLLM 사이의 team membership을 동기화합니다
- **중앙 집중식 Access 관리**: LiteLLM functionality를 유지하면서 모든 user permission을 IDP에서 관리합니다

### 설정

#### 1. JWT Role Mapping 구성

JWT token의 role을 LiteLLM user role에 매핑합니다:

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups"
    roles_jwt_field: "roles"
    user_id_upsert: true
    sync_user_role_and_teams: true # 👈 Enable sync functionality
    jwt_litellm_role_map: # 👈 Map JWT roles to LiteLLM roles
      - jwt_role: "ADMIN"
        litellm_role: "proxy_admin"
      - jwt_role: "USER"
        litellm_role: "internal_user"
      - jwt_role: "VIEWER"
        litellm_role: "internal_user"
```

#### 2. JWT Role 매핑 사양 {#jwt-role-mapping-spec}

- `jwt_role`: JWT token에 나타나는 role name입니다. `fnmatch`를 사용하는 wildcard pattern을 지원합니다(예: `"ADMIN_*"`는 `"ADMIN_READ"`, `"ADMIN_WRITE"` 등에 match됩니다).
- `litellm_role`: 대응하는 LiteLLM user role

**지원 LiteLLM Role:**
- `proxy_admin`: 전체 administrative access
- `internal_user`: standard user access를 제공합니다
- `internal_user_view_only`: read-only access

#### 3. 예제 JWT Token

```json
{
  "sub": "user-123",
  "roles": ["ADMIN"],
  "groups": ["team-alpha", "team-beta"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 동작 방식

user가 JWT token으로 request를 보내면:

1. **Role Sync**: 
   - LiteLLM은 JWT의 user role이 database의 role과 일치하는지 확인합니다
   - 다르면 LiteLLM database에서 user role을 update합니다
   - `jwt_litellm_role_map`을 사용해 JWT role을 LiteLLM role로 변환합니다

2. **Team Membership 동기화**:
   - JWT token의 team membership을 LiteLLM의 현재 user team과 비교합니다
   - JWT에서 발견한 새 team에 user를 추가합니다
   - JWT에 없는 team에서 user를 제거합니다

3. **Database Updates**:
   - authentication process 중 update가 자동으로 수행됩니다
   - manual intervention이 필요 없습니다

### 설정 옵션 {#configuration-options}

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    # Required fields
    user_id_jwt_field: "sub"
    team_ids_jwt_field: "groups"
    roles_jwt_field: "roles"
    
    # Sync configuration
    sync_user_role_and_teams: true
    user_id_upsert: true
    
    # Role mapping
    jwt_litellm_role_map:
      - jwt_role: "AI_ADMIN_*"  # Wildcard pattern
        litellm_role: "proxy_admin"
      - jwt_role: "AI_USER"
        litellm_role: "internal_user"
```

### 중요 참고

- **성능**: sync operation은 authentication 중 수행되므로 약간의 latency가 추가될 수 있습니다
- **Database Access**: user와 team update를 위해 database access가 필요합니다
- **Team 생성**: sync가 user를 할당하려면 JWT token에 언급된 team이 LiteLLM에 먼저 존재해야 합니다
- **Wildcard 지원**: JWT role pattern은 `fnmatch`를 사용하는 wildcard matching을 지원합니다

### Sync Feature 테스트 {#testing-the-sync-feature}

1. **initial role이 있는 test user 생성**:

```bash
curl -X POST 'http://0.0.0.0:4000/user/new' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user-123",
    "user_role": "internal_user"
}'
```

2. **다른 role을 포함한 JWT로 request 전송**:

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <JWT_WITH_ADMIN_ROLE>' \
-d '{
  "model": "claude-sonnet-4-20250514",
  "messages": [{"role": "user", "content": "Hello"}]
}'
```

3. **role이 update되었는지 검증**:

```bash
curl -X GET 'http://0.0.0.0:4000/user/info?user_id=user-123' \
-H 'Authorization: Bearer <PROXY_MASTER_KEY>'
```

## [BETA] JWT → Virtual Key 매핑 {#beta-jwt-to-virtual-key-mapping}

JWT identity를 LiteLLM virtual key에 매핑해 JWT 인증 user에게 사용자별 budget, rate limit, model access control, spend tracking을 적용합니다.

JWT가 들어오면 LiteLLM은 구성된 claim(예: `email`, `sub`)을 mapping table에서 조회합니다. mapping이 있으면 해당 virtual key로 들어온 request처럼 처리되며 모든 virtual key feature가 적용됩니다.

### 설정

JWT auth config에 `virtual_key_claim_field`를 추가합니다:

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    virtual_key_claim_field: "email"         # JWT claim to look up (supports dot notation)
    virtual_key_mapping_cache_ttl: 300       # Cache TTL in seconds (default: 300)
```

### Mapping 관리

모든 endpoint에는 admin auth가 필요합니다 (`Authorization: Bearer <master_key>`).

**mapping 생성** - JWT claim value를 existing virtual key에 연결합니다:

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/new \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "jwt_claim_name": "email",
    "jwt_claim_value": "user@example.com",
    "key": "sk-virtual-key-from-key-generate"
  }'
```

**mapping list 조회**(paginated):

```bash
curl http://localhost:4000/jwt/key/mapping/list?page=1&size=50 \
  -H "Authorization: Bearer sk-1234"
```

**특정 mapping 조회:**

```bash
curl "http://localhost:4000/jwt/key/mapping/info?id=<mapping-id>" \
  -H "Authorization: Bearer sk-1234"
```

**mapping update:**

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/update \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "<mapping-id>",
    "description": "Updated description",
    "is_active": true
  }'
```

**mapping delete:**

```bash
curl -X POST http://localhost:4000/jwt/key/mapping/delete \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{"id": "<mapping-id>"}'
```

### 동작 방식

1. JWT bearer token이 포함된 request가 도착합니다
2. LiteLLM이 JWT signature를 validate합니다
3. 구성된 claim을 추출합니다(예: `email` → `user@example.com`)
4. `LiteLLM_JWTKeyMapping` table에서 claim value를 조회합니다
5. mapping이 있으면 mapped virtual key가 사용된 것처럼 request가 진행됩니다. budget, rate limit, model access, spend tracking이 모두 적용됩니다
6. mapping이 없으면 standard JWT auth(team-level control)로 fallback합니다

### Error Code {#error-code}

| Code | 의미 |
|------|---------|
| 409 | Duplicate mapping - 해당 claim name + value의 mapping이 이미 존재합니다 |
| 400 | 제공된 key가 existing virtual key와 일치하지 않습니다 |
| 404 | mapping을 찾을 수 없습니다(update/delete/info) |
| 403 | non-admin user가 mapping operation을 시도했습니다 |

## 전체 JWT Param

[**Code 보기**](https://github.com/BerriAI/litellm/blob/b204f0c01c703317d812a1553363ab0cb989d5b6/litellm/proxy/_types.py#L95)
