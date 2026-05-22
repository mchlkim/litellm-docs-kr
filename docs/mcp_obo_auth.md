# MCP OBO 인증

OAuth 2.0 대리 권한(OBO) 인증을 사용하면 LiteLLM이 사용자의 인바운드 bearer token을 특정 MCP 서버에 유효한 범위 제한 토큰으로 교환할 수 있습니다.

다음 상황에서 OBO를 사용합니다.

- MCP 서버가 해당 MCP 서버용으로 발급된 토큰만 받아야 합니다.
- IdP가 [RFC 8693 OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)를 지원합니다.
- 사용자의 원본 토큰이 MCP 서버로 직접 전달되지 않도록 LiteLLM에서 제어하고 싶습니다.

## 동작 방식

```mermaid
flowchart TD
    A[User or agent calls LiteLLM with a bearer token] --> B[LiteLLM identifies the target MCP server]
    B --> C{MCP server auth_type is oauth2_token_exchange?}
    C -- No --> D[Use the server's configured auth flow]
    C -- Yes --> E[LiteLLM extracts the caller bearer token as the subject token]
    E --> F[LiteLLM POSTs an RFC 8693 token exchange request to the IdP]
    F --> G[IdP validates the subject token, audience, client, and scopes]
    G --> H[IdP returns a scoped access token for the MCP server]
    H --> I[LiteLLM caches the scoped token per subject token and MCP server]
    I --> J[LiteLLM calls the MCP server with the scoped bearer token]
    J --> K[MCP server executes the tool and returns the result]
```

요약하면 다음과 같습니다.

1. 클라이언트가 bearer token을 포함해 LiteLLM으로 요청을 보냅니다.
2. LiteLLM은 해당 bearer token을 RFC 8693 `subject_token`으로 사용합니다.
3. LiteLLM은 IdP의 token exchange endpoint에서 토큰을 교환합니다.
4. LiteLLM은 교환된 범위 제한 토큰만 MCP 서버로 전달합니다.
5. LiteLLM은 교환된 토큰이 만료될 때까지 캐시하므로, 반복 호출에서는 IdP 왕복을 다시 수행하지 않습니다.

## OBO용 MCP 서버 구성

MCP 서버에 `auth_type: oauth2_token_exchange`를 설정합니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  internal_tools:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: oauth2_token_exchange

    # IdP의 OAuth 2.0 Token Exchange endpoint
    token_exchange_endpoint: "https://idp.example.com/oauth2/token"

    # IdP에 등록된 token exchange client
    client_id: "<idp-client-id>"
    client_secret: "<idp-client-secret>"

    # 선택 사항이지만 권장: 교환된 토큰을 이 MCP 서버로 제한
    audience: "api://internal-tools-mcp"
    scopes:
      - "mcp.tools.read"
      - "mcp.tools.execute"

    # 선택 사항. 기본값은 access_token.
    subject_token_type: "urn:ietf:params:oauth:token-type:access_token"
```

### 구성 필드

| 필드 | 필수 여부 | 설명 |
|-------|----------|-------------|
| `auth_type` | 예 | `oauth2_token_exchange`여야 합니다. |
| `token_exchange_endpoint` | 예 | RFC 8693 token exchange 요청을 받는 IdP endpoint입니다. |
| `client_id` | 예 | LiteLLM이 token exchange endpoint를 호출할 때 사용하는 OAuth client identifier입니다. |
| `client_secret` | 예 | LiteLLM이 token exchange endpoint를 호출할 때 사용하는 OAuth client secret입니다. |
| `audience` | 권장 | MCP 서버의 resource identifier입니다. LiteLLM은 이를 token exchange `audience`로 전송합니다. |
| `scopes` | 선택 | LiteLLM이 교환된 토큰에 요청하는 scope입니다. LiteLLM은 목록을 OAuth `scope` 파라미터로 결합합니다. |
| `subject_token_type` | 선택 | RFC 8693 subject token type입니다. 기본값은 `urn:ietf:params:oauth:token-type:access_token`입니다. |

## Token Exchange 요청

캐시에 없는 subject token과 MCP 서버 조합마다 LiteLLM은 다음과 같은 form-encoded 요청을 `token_exchange_endpoint`로 보냅니다.

```http
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<caller-bearer-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&client_id=<idp-client-id>
&client_secret=<idp-client-secret>
&audience=api://internal-tools-mcp
&scope=mcp.tools.read mcp.tools.execute
```

IdP는 access token을 반환해야 합니다.

```json
{
  "access_token": "scoped-token-for-mcp-server",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

이후 LiteLLM은 다음 헤더로 MCP 서버를 호출합니다.

```http
Authorization: Bearer scoped-token-for-mcp-server
```

## OBO MCP 서버 호출

LiteLLM이 교환할 `subject_token`을 확보할 수 있도록 인바운드 요청에는 사용자의 bearer token이 포함되어야 합니다.

직접 MCP 호출에서는 LiteLLM key를 `x-litellm-api-key`에 넣고, `Authorization`은 사용자 토큰용으로 남겨둡니다.

```bash title="Direct MCP call" showLineNumbers
curl -X POST "https://litellm.example.com/internal_tools/mcp" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer <litellm-api-key>" \
  -H "Authorization: Bearer <user-token>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Responses API에서는 LiteLLM key와 사용자 토큰을 분리해 MCP tool header로 전달합니다.

```bash title="Responses API with MCP OBO" showLineNumbers
curl -X POST "https://litellm.example.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <litellm-api-key>" \
  -d '{
    "model": "gpt-4o",
    "input": "List the available internal tools",
    "tools": [
      {
        "type": "mcp",
        "server_label": "internal_tools",
        "server_url": "https://litellm.example.com/internal_tools/mcp",
        "require_approval": "never",
        "headers": {
          "x-litellm-api-key": "Bearer <litellm-api-key>",
          "Authorization": "Bearer <user-token>"
        }
      }
    ]
  }'
```

:::tip
MCP 클라이언트가 `Authorization` 헤더를 하나만 보낼 수 있다면 LiteLLM key는 `x-litellm-api-key`에 넣고, `Authorization`은 사용자 토큰용으로 남겨두세요. LiteLLM은 OBO `subject_token`으로 사용자 토큰이 필요합니다.
:::

## 캐싱 동작

LiteLLM은 교환된 토큰을 다음 기준으로 캐시합니다.

- subject token
- MCP server ID

즉 서로 다른 두 사용자는 별도의 교환 토큰을 받지만, 같은 사용자가 같은 MCP 서버를 반복 호출하면 만료 전까지 캐시된 토큰을 재사용합니다.

캐시 TTL은 `expires_in`에서 LiteLLM의 OAuth 만료 버퍼를 뺀 값으로 계산됩니다. `expires_in`이 없거나 유효하지 않으면 LiteLLM은 기본 OAuth token cache TTL을 사용합니다.

## Fallback 동작

OBO 서버에 인바운드 subject token이 없으면 다음처럼 동작합니다.

- `client_id`, `client_secret`, `token_url`이 구성되어 있으면 LiteLLM은 OAuth `client_credentials`로 fallback할 수 있습니다.
- 그렇지 않으면 LiteLLM은 경고를 기록하고 token exchange 없이 진행합니다.

엄격한 OBO 배포에서는 모든 요청에 사용자 bearer token이 포함되도록 클라이언트를 구성하세요.

## 문제 해결

| 증상 | 확인할 사항 |
|---------|-------|
| MCP server가 LiteLLM key를 받음 | LiteLLM key를 `x-litellm-api-key`로 옮기고, `Authorization`은 사용자 토큰에 사용합니다. |
| Token exchange endpoint가 400을 반환함 | `audience`, `scopes`, `client_id`, `subject_token_type`이 IdP 구성과 일치하는지 확인합니다. |
| MCP server가 `Authorization` header를 받지 못함 | MCP server에 `auth_type: oauth2_token_exchange`가 설정되어 있고, 인바운드 요청에 사용자 bearer token이 포함되어 있는지 확인합니다. |
| IdP가 모든 요청마다 호출됨 | IdP가 `expires_in`을 반환하는지, 같은 사용자 토큰과 MCP server가 재사용되고 있는지 확인합니다. |
