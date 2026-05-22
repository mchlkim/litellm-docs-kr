import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP Zero Trust 인증(JWT Signer)

![Zero Trust MCP 게이트웨이](/img/mcp_zero_trust_gateway.png)

MCP 서버에는 요청이 실제로 LiteLLM을 거쳐 왔는지 검증하는 내장 방법이 없습니다.
이 가드레일이 없으면 MCP 서버에 직접 접근할 수 있는 모든 클라이언트가 도구를 호출할 수 있으며, 접근 제어를 완전히 우회하게 됩니다.

`MCPJWTSigner`는 이 문제를 해결합니다.
모든 외부 도구 호출에 짧은 수명의 RS256 JWT로 서명합니다.
MCP 서버는 LiteLLM의 공개 키로 서명을 검증합니다.
LiteLLM을 거치지 않은 요청은 유효한 서명이 없으므로 거부됩니다.

---

## 기본 설정

설정에 가드레일을 추가하고 MCP 서버가 LiteLLM의 JWKS 엔드포인트를 바라보도록 합니다.
모든 도구 호출에는 서명된 JWT가 자동으로 추가되며, 클라이언트 측 변경은 필요하지 않습니다.

```yaml title="config.yaml"
mcp_servers:
  - server_name: weather
    url: http://localhost:8000/mcp
    transport: http

guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"  # defaults to request base URL
      audience: "mcp"                            # default: "mcp"
      ttl_seconds: 300                           # default: 300
```

**직접 준비한 서명 키 사용** — 프로덕션에서는 이 방식을 권장합니다. 자동 생성 키는 재시작 시 사라집니다.

```bash
export MCP_JWT_SIGNING_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
# or point to a file
export MCP_JWT_SIGNING_KEY="file:///secrets/mcp-signing-key.pem"
```

**[FastMCP](https://gofastmcp.com)로 검증 가능한 MCP 서버를 빌드합니다.**

```python title="weather_server.py"
from fastmcp import FastMCP, Context
from fastmcp.server.auth.providers.jwt import JWTVerifier

auth = JWTVerifier(
    jwks_uri="https://my-litellm.example.com/.well-known/jwks.json",
    issuer="https://my-litellm.example.com",
    audience="mcp",
    algorithm="RS256",
)

mcp = FastMCP("weather-server", auth=auth)

@mcp.tool()
async def get_weather(city: str, ctx: Context) -> str:
    caller = ctx.client_id  # JWT `sub` — the verified user identity
    return f"Weather in {city}: sunny, 72°F (requested by {caller})"

if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
```

FastMCP는 JWKS를 자동으로 가져오고, 서명 키가 변경되면 다시 가져옵니다.

LiteLLM은 OIDC discovery를 게시하므로 MCP 서버는 수동 설정 없이 키를 찾을 수 있습니다.

```
GET /.well-known/openid-configuration  →  { "jwks_uri": "https://<litellm>/.well-known/jwks.json" }
GET /.well-known/jwks.json             →  { "keys": [{ "kty": "RSA", "alg": "RS256", ... }] }
```

> **다음 내용은 필요한 경우에만 읽으세요:** 회사 IdP ID를 JWT에 전달하거나, 호출자에게 특정 claim을 강제하거나, 사용자 지정 메타데이터를 추가하거나, AWS Bedrock AgentCore Gateway를 사용하거나, JWT 거부를 디버깅할 때 필요합니다.

---

## MCP JWT에 IdP ID 전달

기본적으로 외부로 나가는 JWT의 `sub`는 LiteLLM 내부 `user_id`입니다.
사용자가 Okta, Azure AD 또는 다른 IdP로 인증하더라도 MCP 서버에는 사용자의 이메일이나 직원 ID가 아니라 LiteLLM 내부 ID가 보입니다.

verify+re-sign을 사용하면 LiteLLM이 먼저 들어오는 IdP 토큰을 검증한 뒤, 해당 토큰의 실제 ID claim을 사용해 외부로 나가는 JWT를 만듭니다.
MCP 서버는 원래 IdP를 직접 신뢰하지 않아도 사용자의 실제 ID를 받습니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"

      # Validate the incoming Bearer token against the IdP
      access_token_discovery_uri: "https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration"
      verify_issuer: "https://login.microsoftonline.com/{tenant}/v2.0"
      verify_audience: "api://my-app"

      # Which claim to use for `sub` in the outbound JWT — first non-empty value wins
      end_user_claim_sources:
        - "token:sub"       # from the verified incoming JWT
        - "token:email"     # fallback to email
        - "litellm:user_id" # last resort: LiteLLM's internal user_id
```

들어오는 토큰이 **opaque** 토큰(JWT가 아니며 일부 IdP가 발급)이라면 introspection 엔드포인트를 추가합니다.
LiteLLM은 토큰을 해당 엔드포인트에 POST(RFC 7662)하고 반환된 claim을 사용합니다.

```yaml
      token_introspection_endpoint: "https://idp.example.com/oauth2/introspect"
```

**지원되는 `end_user_claim_sources` 값:**

| 소스 | 해석 결과 |
|--------|-------------|
| `token:<claim>` | 검증된 들어오는 JWT의 임의 claim(예: `token:sub`, `token:email`, `token:oid`) |
| `litellm:user_id` | LiteLLM 내부 사용자 ID |
| `litellm:email` | LiteLLM 인증 컨텍스트의 사용자 이메일 |
| `litellm:end_user_id` | 별도로 설정된 경우 최종 사용자 ID |
| `litellm:team_id` | LiteLLM 인증 컨텍스트의 팀 ID |

---

## 필수 속성이 없는 호출자 차단

일부 MCP 서버는 검증된 직원만 접근해야 하는 민감한 작업을 노출합니다.
서비스 계정이나 외부 API 키에는 허용하지 않아야 합니다.
LiteLLM 계층에서 이를 강제하면 MCP 서버는 해당 요청을 아예 받지 않습니다.

들어오는 토큰에 목록의 claim이 하나라도 없으면 `required_claims`는 `403`으로 거부합니다.
`optional_claims`는 유용하지만 필수는 아닌 claim을 전달합니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      access_token_discovery_uri: "https://idp.example.com/.well-known/openid-configuration"

      # Service accounts without `employee_id` are blocked before the tool runs
      required_claims:
        - "sub"
        - "employee_id"

      # Forward these into the outbound JWT when present — skipped silently if absent
      optional_claims:
        - "groups"
        - "department"
```

**차단 시 클라이언트에 보이는 응답:**
```json
HTTP 403
{ "error": "MCPJWTSigner: incoming token is missing required claims: ['employee_id']. Configure the IdP to include these claims." }
```

---

## 모든 JWT에 사용자 지정 메타데이터 추가

MCP 서버에는 LiteLLM이 기본적으로 보유하지 않는 컨텍스트가 필요할 수 있습니다.
예를 들어 어떤 배포가 요청을 보냈는지, tenant ID, 환경 태그 등이 필요할 수 있습니다.
claim 작업을 사용해 외부로 나가는 JWT에 claim을 주입하거나, 덮어쓰거나, 제거할 수 있습니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      # add: insert only when the key is not already in the JWT
      add_claims:
        deployment_id: "prod-us-east-1"
        tenant_id: "acme-corp"

      # set: always override — even if the claim came from the incoming token
      set_claims:
        env: "production"

      # remove: strip claims the MCP server shouldn't see
      remove_claims:
        - "nbf"   # some validators reject nbf; remove it if yours does
```

작업은 `add_claims` → `set_claims` → `remove_claims` 순서로 실행됩니다.
`set_claims`는 항상 `add_claims`보다 우선하며, `remove_claims`는 둘 모두보다 우선합니다.

---

## AWS Bedrock AgentCore Gateway 설정

Bedrock AgentCore Gateway는 두 개의 별도 JWT를 사용합니다.
하나는 전송 연결 인증용이고, 다른 하나는 도구 호출 인가용입니다.
각각 다른 `aud` 값과 TTL이 필요하므로 하나의 JWT를 두 용도로 사용할 수 없습니다.

LiteLLM은 하나의 hook에서 두 토큰을 모두 발급하고 별도 헤더에 주입할 수 있습니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"
      audience: "mcp-resource"   # for the MCP resource layer
      ttl_seconds: 300

      # Second JWT for the transport channel — same sub/act/scope, different aud + TTL
      channel_token_audience: "bedrock-agentcore-gateway"
      channel_token_ttl: 60      # transport tokens should be short-lived
```

LiteLLM은 모든 도구 호출에 두 헤더를 주입합니다.
- `Authorization: Bearer <resource-token>` — audience `mcp-resource`, TTL 300초
- `x-mcp-channel-token: Bearer <channel-token>` — audience `bedrock-agentcore-gateway`, TTL 60초

두 토큰은 같은 LiteLLM 키로 서명되므로 MCP 서버는 하나의 JWKS 엔드포인트만 신뢰하면 됩니다.

---

## JWT에 포함할 scope 제어

기본적으로 LiteLLM은 요청별 최소 권한 scope를 생성합니다.
- 도구 호출 → `mcp:tools/call mcp:tools/{name}:call`
- 도구 목록 조회 → `mcp:tools/call mcp:tools/list`

MCP 서버가 자체 scope 강제를 수행하고 특정 형식이 필요하다면 `allowed_scopes`를 설정해 자동 생성을 완전히 대체합니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      allowed_scopes:
        - "mcp:tools/call"
        - "mcp:tools/list"
        - "mcp:admin"
```

어떤 도구가 호출되는지와 관계없이 모든 JWT에는 정확히 해당 scope만 포함됩니다.

---

## JWT 거부 디버깅

MCP 서버가 401을 반환하지만 JWT에 무엇이 들어 있는지 확실하지 않은 경우가 있습니다.
`debug_headers`를 활성화하면 LiteLLM은 서명된 주요 claim을 담은 `x-litellm-mcp-debug` 응답 헤더를 추가합니다.

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      debug_headers: true
```

Response header:
```
x-litellm-mcp-debug: v=1; kid=a3f1b2c4d5e6f708; sub=alice@corp.com; iss=https://my-litellm.example.com; exp=1712345678; scope=mcp:tools/call mcp:tools/get_weather:call
```

`kid`가 MCP 서버가 JWKS에서 가져온 값과 일치하는지, `iss`/`aud`가 서버의 예상 값과 일치하는지, `exp`가 지나지 않았는지 확인합니다.
이 헤더는 claim 메타데이터를 노출하므로 프로덕션에서는 비활성화하세요.

---

## JWT claim 참조

| Claim | 값 |
|-------|-------|
| `iss` | `issuer` 설정값 또는 요청 base URL |
| `aud` | `audience` 설정값(기본값: `"mcp"`) |
| `sub` | `end_user_claim_sources`로 해석됨(기본값: `user_id` → api-key hash → `"litellm-proxy"`) |
| `act.sub` | `team_id` → `org_id` → `"litellm-proxy"`(RFC 8693 위임) |
| `email` | LiteLLM 인증 컨텍스트의 `user_email`(사용 가능한 경우) |
| `scope` | 도구 호출별 자동 생성값 또는 설정된 경우 `allowed_scopes` |
| `iat`, `exp`, `nbf` | 표준 시간 claim(RFC 7519) |

---

## 제한 사항

- **OpenAPI 기반 MCP 서버**(`spec_path` 설정)는 JWT 주입을 지원하지 않습니다. LiteLLM은 경고를 기록하고 헤더를 건너뜁니다. 전체 JWT 주입을 사용하려면 SSE/HTTP transport 서버를 사용하세요.
- 키 쌍은 기본적으로 **메모리 내**에 있으며, `MCP_JWT_SIGNING_KEY`가 설정되지 않으면 재시작할 때마다 교체됩니다. FastMCP의 `JWTVerifier`는 JWKS key ID 매칭으로 키 교체를 투명하게 처리합니다.

---

## 관련 문서

- [MCP 가드레일](./mcp_guardrail) — MCP 호출에 대한 PII 마스킹과 차단
- [MCP OAuth](./mcp_oauth) — MCP 서버 접근을 위한 upstream OAuth2
- [MCP AWS SigV4](./mcp_aws_sigv4) — MCP 서버로 보내는 AWS 서명 요청
