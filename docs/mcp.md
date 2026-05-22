import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 개요

LiteLLM Proxy는 모든 MCP 도구에 고정 엔드포인트를 사용할 수 있고 Key, Team 단위로 MCP 접근을 제어할 수 있는 MCP Gateway를 제공합니다.

<Image 
  img={require('../img/mcp_2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM MCP 아키텍처: LiteLLM이 지원하는 모든 모델에서 MCP 도구 사용
</p>

## 개요
| 기능 | 설명 |
|---------|-------------|
| MCP 작업 | • 도구 목록 조회<br/>• 도구 호출 <br/>• 프롬프트 <br/>• 리소스 |
| 지원되는 MCP 전송 방식 | • Streamable HTTP<br/>• SSE<br/>• Standard Input/Output (stdio) |
| LiteLLM 권한 관리 | • Key 기준<br/>• Team 기준<br/>• Organization 기준 |

:::caution MCP protocol 업데이트
LiteLLM v1.80.18부터 LiteLLM MCP protocol version은 `2025-11-25`입니다.<br/>
LiteLLM은 각 tool name 앞에 MCP server name을 붙여 여러 MCP server의 namespace를 구분합니다. 따라서 새로 생성하는 server는 SEP-986을 준수하는 이름을 사용해야 하며, 준수하지 않는 이름은 더 이상 추가할 수 없습니다. 기존 server 중 SEP-986을 위반하는 server는 현재 warning만 발생시키지만, 이후 MCP 측 rollout에서 해당 이름이 완전히 차단될 수 있습니다. MCP enforcement로 사용할 수 없게 되기 전에 legacy server name을 미리 갱신하는 것을 권장합니다.
:::

## MCP 추가하기

### 사전 준비

MCP server를 database에 저장하려면 database storage를 활성화해야 합니다.

**Environment Variable:**
```bash
export STORE_MODEL_IN_DB=True
```

**또는 config.yaml에서 설정:**
```yaml
general_settings:
  store_model_in_db: true
```

#### 세부 Database Storage 제어

기본적으로 `store_model_in_db`가 `true`이면 모든 object type(models, MCPs, guardrails, vector stores 등)이 database에 저장됩니다. 특정 object type만 저장하려면 `supported_db_objects` 설정을 사용하세요.

**예제: MCP server만 database에 저장**

```yaml title="config.yaml" showLineNumbers
general_settings:
  store_model_in_db: true
  supported_db_objects: ["mcp"]  # Only store MCP servers in DB

model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx
```

**사용 가능한 모든 object type 보기:** [Config Settings - supported_db_objects](./proxy/config_settings.md#general_settings---reference)

`supported_db_objects`를 설정하지 않으면 모든 object type이 database에서 로드됩니다(기본 동작).

설정 후 연결 문제를 진단하려면 [MCP 문제 해결 Guide](./mcp_troubleshoot.md)를 참고하세요.

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

LiteLLM UI에서 "MCP Servers"로 이동한 뒤 "Add New MCP Server"를 클릭합니다.

이 form에 MCP Server URL과 사용할 transport를 입력합니다.

LiteLLM은 다음 MCP transport를 지원합니다.
- Streamable HTTP
- SSE(Server-Sent Events) 방식
- 표준 입력/출력(stdio)

<Image 
  img={require('../img/add_mcp.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>
<br/>

### HTTP MCP Server 추가

이 video는 LiteLLM UI에서 HTTP MCP server를 추가하고 사용하는 방법과 Cursor IDE에서 사용하는 방법을 안내합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/e2aebce78e8d46beafeb4bacdde31f14" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<br/>
<br/>

### SSE MCP Server 추가

이 video는 LiteLLM UI에서 SSE MCP server를 추가하고 사용하는 방법과 Cursor IDE에서 사용하는 방법을 안내합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/07e04e27f5e74475b9cf8ef8247d2c3e" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<br/>
<br/>

### STDIO MCP Server 추가

stdio MCP server의 경우 transport type으로 "Standard Input/Output (stdio)"를 선택하고 stdio configuration을 JSON 형식으로 입력합니다.

<Image 
  img={require('../img/add_stdio_mcp.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>
<br/>

### OAuth 설정 & Overrides

LiteLLM은 기본적으로 [OAuth 2.0 Authorization Server Discovery](https://datatracker.ietf.org/doc/html/rfc8414)를 시도합니다. UI에서 MCP server를 만들고 `인증: OAuth`로 설정하면, LiteLLM이 provider metadata를 찾고 client를 동적으로 등록한 뒤 추가 세부 정보를 요구하지 않고 PKCE 기반 authorization을 수행합니다.

**필요할 때 OAuth flow 사용자 지정:**

<Image 
  img={require('../img/mcp_oauth.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

- **명시적 client credentials 제공** – MCP provider가 dynamic client registration을 제공하지 않거나 client를 직접 관리하려면 `client_id`, `client_secret`, 원하는 `scopes`를 입력하세요.
- **Discovery URL 재정의** – 일부 환경에서는 LiteLLM이 provider의 metadata endpoint에 접근하지 못할 수 있습니다. 선택 항목인 `authorization_url`, `token_url`, `registration_url` field를 사용해 LiteLLM이 올바른 endpoint를 직접 바라보게 하세요.

<br/>

### AWS SigV4 인증

[AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/latest/userguide/agentcore.html)에 호스팅된 MCP server의 경우 authentication type으로 **AWS SigV4**를 선택하세요. LiteLLM은 [Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)를 사용해 AWS credentials로 모든 outgoing MCP request에 서명합니다.

<Image
  img={require('../img/mcp_aws_sigv4_ui.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

AWS region, service name(기본값 `bedrock-agentcore`)을 입력하고 필요하면 AWS access key와 secret도 입력합니다. credentials를 생략하면 LiteLLM은 boto3 credential chain(IAM roles, environment variables 등)으로 fallback합니다.

[**전체 SigV4 설정 guide 보기**](./mcp_aws_sigv4.md)

<br/>

### Static Headers

때로는 MCP server가 모든 request에 특정 header를 요구합니다. API key일 수도 있고 server가 기대하는 custom header일 수도 있습니다. auth를 구성하는 대신 header를 직접 설정할 수 있습니다.

<Image 
  img={require('../img/static_headers.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

이 header들은 server로 보내는 모든 request에 포함됩니다.


**사용하는 경우:**
- server가 표준 auth pattern에 맞지 않는 custom header를 필요로 하는 경우
- 어떤 header를 보낼지 정확히 제어하고 싶은 경우
- debugging 중이며 auth configuration 변경 없이 header를 빠르게 추가해야 하는 경우

</TabItem>

<TabItem value="config" label="config.yaml">

`config.yaml` 파일에 MCP server를 직접 추가합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx

litellm_settings:
  # MCP Aliases - Map aliases to server names for easier tool access
  mcp_aliases:
    "github": "github_mcp_server"
    "zapier": "zapier_mcp_server"
    "deepwiki": "deepwiki_mcp_server"

mcp_servers:
  # HTTP Streamable Server
  deepwiki_mcp:
    url: "https://mcp.deepwiki.com/mcp"
  # SSE Server
  zapier_mcp:
    url: "https://actions.zapier.com/mcp/sk-akxxxxx/sse"
  
  # Standard Input/Output (stdio) Server - CircleCI Example
  circleci_mcp:
    transport: "stdio"
    command: "npx"
    args: ["-y", "@circleci/mcp-server-circleci"]
    env:
      CIRCLECI_TOKEN: "your-circleci-token"
      CIRCLECI_BASE_URL: "https://circleci.com"
  
  # Full configuration with all optional fields
  my_http_server:
    url: "https://my-mcp-server.com/mcp"
    transport: "http"
    description: "My custom MCP server"
    auth_type: "api_key"
    auth_value: "abc123"
```

**설정 Options:**
- **Server Name**: MCP server를 설명하는 임의의 이름을 사용합니다(예: `zapier_mcp`, `deepwiki_mcp`, `circleci_mcp`).
- **Alias**: 기본적으로 server name에서 space를 "_"로 바꾼 값이 채워지며, 필요하면 tool name prefix로 사용할 값을 직접 수정합니다.
- **URL**: MCP server의 endpoint URL입니다(HTTP/SSE transport에서 필수).
- **Transport**: 선택 항목인 transport type입니다(기본값 `sse`).
  - `sse` - SSE(Server-Sent Events) transport 방식
  - `http` - Streamable HTTP transport 방식
  - `stdio` - 표준 입력/출력 transport
- **Command**: stdio transport에서 실행할 command입니다(stdio에서 필수).
- **allow_all_keys**: `true`로 설정하면 key/team의 MCP permissions에 해당 server가 명시되어 있지 않아도 모든 LiteLLM API key에서 server를 사용할 수 있습니다.
- **Args**: command에 전달할 argument array입니다(stdio에서 선택).
- **Env**: stdio process에 설정할 environment variable입니다(stdio에서 선택).
- **Description**: server에 대한 선택 설명입니다.
- **Auth Type**: 선택 항목인 authentication type입니다. 지원 값:

  | 값 | 전송되는 Header |
  |-------|-------------|
  | `api_key` | `X-API-Key: <auth_value>` |
  | `bearer_token` | `Authorization: Bearer <auth_value>` |
  | `basic` | `Authorization: Basic <auth_value>` |
  | `authorization` | `Authorization: <auth_value>` |
  | `aws_sigv4` | request별 AWS SigV4 signature([상세 정보](./mcp_aws_sigv4.md)) |

- **Extra Headers**: client에서 MCP server로 forwarding할 추가 header name 목록입니다.
- **Static Headers**: MCP server로 보내는 모든 request에 포함할 header key/value pair map입니다.
- **Spec Version**: 선택 항목인 MCP specification version입니다(기본값 `2025-06-18`).

auth type별 예제:

```yaml title="MCP auth examples (config.yaml)" showLineNumbers
mcp_servers:
  api_key_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "api_key"
    auth_value: "abc123"        # headers={"X-API-Key": "abc123"}

  # NEW – OAuth 2.0 Client Credentials (v1.77.5)
  oauth2_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "oauth2"         # 👈 KEY CHANGE
    authorization_url: "https://my-mcp-server.com/oauth/authorize" # optional override
    token_url: "https://my-mcp-server.com/oauth/token"             # optional override
    registration_url: "https://my-mcp-server.com/oauth/register"   # optional override
    client_id: os.environ/OAUTH_CLIENT_ID
    client_secret: os.environ/OAUTH_CLIENT_SECRET
    scopes: ["tool.read", "tool.write"] # optional override

  bearer_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "bearer_token"
    auth_value: "abc123"        # headers={"Authorization": "Bearer abc123"}

  basic_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "basic"
    auth_value: "dXNlcjpwYXNz"  # headers={"Authorization": "Basic dXNlcjpwYXNz"}

  custom_auth_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "authorization"
    auth_value: "Token example123"  # headers={"Authorization": "Token example123"}

  # AWS SigV4 for Bedrock AgentCore MCP servers
  agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN          # optional — IAM role to assume
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID  # optional — falls back to IAM role
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_region_name: us-east-1
    aws_service_name: bedrock-agentcore

  # Example with extra headers forwarding
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: "bearer_token"
    auth_value: "ghp_example_token"
    extra_headers: ["custom_key", "x-custom-header"]  # These headers will be forwarded from client

  # Example with static headers
  my_mcp_server:
    url: "https://my-mcp-server.com/mcp"
    static_headers: # These headers will be requested to the MCP server
      X-API-Key: "abc123"
      X-Custom-Header: "some-value"
```

### MCP Walkthroughs

- **Strands (STDIO)** – [tutorial 보기](https://screen.studio/share/ruv4D73F)

> UI에서 추가

```json title="strands-mcp" showLineNumbers
{
  "mcpServers": {
    "strands-agents": {
      "command": "uvx",
      "args": ["strands-agents-mcp-server"],
      "env": {
        "FASTMCP_LOG_LEVEL": "INFO"
      },
      "disabled": false,
      "autoApprove": ["search_docs", "fetch_doc"]
    }
  }
}
```

> config.yml

```yaml title="config.yml – strands MCP" showLineNumbers
mcp_servers:
  strands_mcp:
    transport: "stdio"
    command: "uvx"
    args: ["strands-agents-mcp-server"]
    env:
      FASTMCP_LOG_LEVEL: "INFO"
```


### MCP Aliases

`litellm_settings` section에서 MCP server alias를 정의할 수 있습니다. 이를 통해 다음을 할 수 있습니다.

1. **친숙한 이름을 server name에 mapping**: 더 짧고 기억하기 쉬운 alias를 사용합니다.
2. **Server alias 재정의**: server에 alias가 정의되어 있지 않으면 system이 `mcp_aliases`에서 처음 일치하는 alias를 사용합니다.
3. **고유성 보장**: 각 server에는 첫 번째 alias만 사용되어 충돌을 방지합니다.

**예제:**
```yaml
litellm_settings:
  mcp_aliases:
    "github": "github_mcp_server"      # Maps "github" alias to "github_mcp_server"
    "zapier": "zapier_mcp_server"      # Maps "zapier" alias to "zapier_mcp_server"
    "docs": "deepwiki_mcp_server"      # Maps "docs" alias to "deepwiki_mcp_server"
    "github_alt": "github_mcp_server"  # This will be ignored since "github" already maps to this server
```

**장점:**
- **단순한 tool access**: `github_mcp_server_create_issue` 대신 `github_create_issue`를 사용합니다.
- **일관된 naming**: organization 전체에서 alias pattern을 표준화합니다.
- **쉬운 migration**: 기존 tool reference를 깨지 않고 server name을 변경합니다.

</TabItem>
</Tabs>


## OpenAPI Specs를 MCP Servers로 변환

LiteLLM은 OpenAPI specification을 MCP server로 변환해 custom server code를 작성하지 않고도 REST API를 MCP tool로 노출할 수 있습니다.

전체 설정, 사용 예제, tool name과 description 재정의 방법은 **[OpenAPI Specs에서 MCP로 변환하는 guide](./mcp_openapi.md)**를 참고하세요.

## MCP OAuth

LiteLLM은 MCP server용 OAuth 2.0을 지원합니다. user-facing client를 위한 interactive (PKCE) flow와 backend service를 위한 머신 투 머신(M2M) `client_credentials`를 모두 지원합니다.

설정 지침, sequence diagram, test server는 **[MCP OAuth guide](./mcp_oauth.md)**를 참고하세요.

<details>
<summary>상세 OAuth reference (클릭하여 펼치기)</summary>

LiteLLM v1.77.6에서 MCP server용 OAuth 2.0 Client Credentials 지원이 추가되었습니다.

`config.yaml` 또는 LiteLLM UI(MCP Servers → 인증 → OAuth)에서 직접 구성할 수 있습니다.

```yaml
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
```

[**Claude Code Tutorial 보기**](./tutorials/claude_responses_api#connecting-mcp-servers)

### 작동 방식

```mermaid
sequenceDiagram
    participant Browser as User-Agent (Browser)
    participant Client as Client
    participant LiteLLM as LiteLLM Proxy
    participant MCP as MCP Server (Resource Server)
    participant Auth as Authorization Server

    Note over Client,LiteLLM: Step 1 – Resource discovery
    Client->>LiteLLM: GET /.well-known/oauth-protected-resource/{mcp_server_name}/mcp
    LiteLLM->>Client: Return resource metadata

    Note over Client,LiteLLM: Step 2 – Authorization server discovery
    Client->>LiteLLM: GET /.well-known/oauth-authorization-server/{mcp_server_name}
    LiteLLM->>Client: Return authorization server metadata

    Note over Client,Auth: Step 3 – Dynamic client registration
    Client->>LiteLLM: POST /{mcp_server_name}/register
    LiteLLM->>Auth: Forward registration request
    Auth->>LiteLLM: Issue client credentials
    LiteLLM->>Client: Return client credentials

    Note over Client,Browser: Step 4 – User authorization (PKCE)
    Client->>Browser: Open authorization URL + code_challenge + resource
    Browser->>Auth: Authorization request
    Note over Auth: User authorizes
    Auth->>Browser: Redirect with authorization code
    Browser->>LiteLLM: Callback to LiteLLM with code
    LiteLLM->>Browser: Redirect back with authorization code
    Browser->>Client: Callback with authorization code

    Note over Client,Auth: Step 5 – Token exchange
    Client->>LiteLLM: Token request + code_verifier + resource
    LiteLLM->>Auth: Forward token request
    Auth->>LiteLLM: Access (and refresh) token
    LiteLLM->>Client: Return tokens

    Note over Client,MCP: Step 6 – Authenticated MCP call
    Client->>LiteLLM: MCP request with access token + LiteLLM API key
    LiteLLM->>MCP: MCP request with Bearer token
    MCP-->>LiteLLM: MCP response
    LiteLLM-->>Client: Return MCP response
```

**참여 구성 요소**

- **Client** – user를 대신해 OAuth discovery, authorization, tool invocation을 시작하는 MCP 지원 AI agent입니다(예: Claude Code, Cursor 또는 다른 IDE/agent).
- **LiteLLM Proxy** – 저장된 credentials를 보호하면서 모든 OAuth discovery, registration, token exchange, MCP traffic을 중재합니다.
- **Authorization Server** – dynamic client registration, PKCE authorization, token endpoint를 통해 OAuth 2.0 token을 발급합니다.
- **MCP Server (Resource Server)** – LiteLLM의 authenticated JSON-RPC request를 받는 보호된 MCP endpoint입니다.
- **User-Agent (Browser)** – authorization 단계에서 end user가 consent를 부여할 수 있도록 일시적으로 관여합니다.

**Flow 단계**

1. **Resource Discovery**: client는 scope와 capability를 파악하기 위해 LiteLLM의 `.well-known/oauth-protected-resource` endpoint에서 MCP resource metadata를 가져옵니다.
2. **Authorization Server Discovery**: client는 LiteLLM의 `.well-known/oauth-authorization-server` endpoint를 통해 OAuth server metadata(token endpoint, authorization endpoint, 지원되는 PKCE method)를 가져옵니다.
3. **Dynamic Client Registration**: client는 LiteLLM을 통해 등록하고, LiteLLM은 request를 authorization server(RFC 7591)로 forwarding합니다. provider가 dynamic registration을 지원하지 않으면 `client_id`/`client_secret`을 LiteLLM에 미리 저장할 수 있으며(예: GitHub MCP), flow는 동일하게 진행됩니다.
4. **User Authorization**: client가 browser session(code challenge와 resource hint 포함)을 엽니다. user가 access를 승인하면 authorization server가 LiteLLM을 통해 client로 code를 보냅니다.
5. **Token Exchange**: client가 authorization code, code verifier, resource와 함께 LiteLLM을 호출합니다. LiteLLM은 이를 authorization server와 exchange하고 발급된 access/refresh token을 반환합니다.
6. **MCP Invocation**: 유효한 token이 있으면 client는 MCP JSON-RPC request(LiteLLM API key 포함)를 LiteLLM에 보내고, LiteLLM은 이를 MCP server로 forwarding한 뒤 tool response를 중계합니다.

추가 reference는 공식 [MCP Authorization Flow](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#authorization-flow-steps)를 참고하세요.

</details>


## MCP Servers로 Custom Headers Forwarding

LiteLLM은 `extra_headers` configuration parameter를 사용해 MCP client의 추가 custom header를 backend MCP server로 forwarding하는 기능을 지원합니다. 이를 통해 MCP server가 요구하는 custom authentication token, API key 또는 기타 header를 전달할 수 있습니다.

**설정**


<Tabs>
<TabItem value="config" label="config.yaml">
MCP server configuration에서 `extra_headers`를 설정해 forwarding할 header name을 지정합니다.

```yaml title="config.yaml with extra_headers" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: "bearer_token"
    auth_value: "ghp_default_token"
    extra_headers: ["custom_key", "x-custom-header", "Authorization"]
    description: "GitHub MCP server with custom header forwarding"
```
</TabItem>
<TabItem value="clientside" label="Client Side에서 동적 설정">

user에게 [MCP server group](#grouping-mcps-access-groups)에 대한 access를 제공할 때 사용합니다.

**형식:** `x-mcp-{server_alias}-{header_name}: value`

이를 통해 MCP server마다 서로 다른 authentication을 사용할 수 있습니다.


**예제:**
- `x-mcp-github-authorization: Bearer ghp_xxxxxxxxx` - Bearer token을 사용하는 GitHub MCP server
- `x-mcp-zapier-x-api-key: sk-xxxxxxxxx` - API key를 사용하는 Zapier MCP server
- `x-mcp-deepwiki-authorization: Basic base64_encoded_creds` - Basic auth를 사용하는 DeepWiki MCP server

```python title="Python Client with Server-Specific Auth" showLineNumbers
from fastmcp import Client
import asyncio

# Standard MCP configuration with multiple servers
config = {
    "mcpServers": {
        "mcp_group": {
            "url": "http://localhost:4000/mcp/",
            "headers": {
                "x-mcp-servers": "dev_group", # assume this gives access to github, zapier and deepwiki
                "x-litellm-api-key": "Bearer sk-1234",
                "x-mcp-github-authorization": "Bearer gho_token", 
                "x-mcp-zapier-x-api-key": "sk-xxxxxxxxx",
                "x-mcp-deepwiki-authorization": "Basic base64_encoded_creds",
                "custom_key": "value"
            }
        }
    }
}

# Create a client that connects to all servers
client = Client(config)


async def main():
    async with client:
        tools = await client.list_tools()
        print(f"Available tools: {tools}")

        # call mcp 
        await client.call_tool(
            name="github_mcp-search_issues",
            arguments={'query': 'created:>2024-01-01', 'sort': 'created', 'order': 'desc', 'perPage': 30}
        )

if __name__ == "__main__":
    asyncio.run(main())

```



**장점:**
- **Server별 authentication**: 각 MCP server가 서로 다른 auth method를 사용할 수 있습니다.
- **더 나은 security**: 모든 server가 동일한 auth token을 공유할 필요가 없습니다.
- **유연한 header name**: 다양한 auth header type(authorization, x-api-key 등)을 지원합니다.
- **명확한 분리**: 각 server의 auth가 명확히 식별됩니다.



</TabItem>
</Tabs>


#### Client 사용법

MCP client에서 연결할 때는 `extra_headers` configuration과 일치하는 custom header를 포함하세요.

<Tabs>
<TabItem value="fastmcp" label="Python FastMCP">

```python title="FastMCP Client with Custom Headers" showLineNumbers
from fastmcp import Client
import asyncio

# MCP client configuration with custom headers
config = {
    "mcpServers": {
        "github": {
            "url": "http://localhost:4000/github_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234",
                "Authorization": "Bearer gho_token", 
                "custom_key": "custom_value",
                "x-custom-header": "additional_data"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {tools}")
        
        # Call a tool if available
        if tools:
            result = await client.call_tool(tools[0].name, {})
            print(f"Tool result: {result}")

# Run the client
asyncio.run(main())
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with Custom Headers" showLineNumbers
{
  "mcpServers": {
    "GitHub": {
      "url": "http://localhost:4000/github_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "Authorization": "Bearer $GITHUB_TOKEN",
        "custom_key": "custom_value",
        "x-custom-header": "additional_data"
      }
    }
  }
}
```

</TabItem>

<TabItem value="http" label="HTTP Client">

```bash title="cURL with Custom Headers" showLineNumbers
curl --location 'http://localhost:4000/github_mcp/mcp' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: Bearer sk-1234' \
--header 'Authorization: Bearer gho_token' \
--header 'custom_key: custom_value' \
--header 'x-custom-header: additional_data' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
}'
```

</TabItem>
</Tabs>

#### 작동 방식

1. **설정**: forwarding하려는 header name을 MCP server config의 `extra_headers`에 정의합니다.
2. **Client Headers**: MCP client request에 해당 header를 포함합니다.
3. **Header Forwarding**: LiteLLM이 일치하는 header를 backend MCP server로 자동 forwarding합니다.
4. **인증**: backend MCP server는 구성된 auth header와 custom header를 모두 받습니다.


### Request Header를 STDIO env Vars로 전달

stdio MCP server가 request별 credentials를 필요로 하는 경우, client request의 HTTP header를 시작된 stdio process의 environment로 직접 mapping할 수 있습니다. env value에서 `${X-HEADER_NAME}` syntax로 header name을 참조하세요. LiteLLM은 incoming request에서 해당 header를 읽고 command를 시작하기 전에 env var를 설정합니다.

```json title="Forward X-GITHUB_PERSONAL_ACCESS_TOKEN header to stdio env" showLineNumbers
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${X-GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

이 예제에서 client가 `X-GITHUB_PERSONAL_ACCESS_TOKEN` header를 포함해 request를 보내면, proxy는 해당 값을 `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable로 stdio process에 전달합니다.

## End User의 MCP Access 제어

AI application의 end user가 어떤 MCP server에 접근할 수 있는지 제어합니다(예: internal chat UI user). `x-litellm-end-user-id` header에 customer ID를 전달하면 다음을 수행할 수 있습니다.
- object permission 적용(접근 가능한 MCP server 제한)
- customer별 budget 적용
- customer별 spend tracking

**FastMCP Client 예제:**

```python title="Track customer spend with x-litellm-end-user-id" showLineNumbers
from fastmcp import Client
import asyncio

# MCP client configuration with customer tracking
config = {
    "mcpServers": {
        "github": {
            "url": "http://localhost:4000/github_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234",
                "x-litellm-end-user-id": "customer_123",  # 👈 CUSTOMER ID
                "Authorization": "Bearer gho_token"
            }
        }
    }
}

client = Client(config)

async def main():
    async with client:
        # All MCP calls will be tracked under customer_123
        tools = await client.list_tools()
        result = await client.call_tool(tools[0].name, {})
        print(f"Tool result: {result}")

asyncio.run(main())
```

**Cursor IDE 예제:**

```json title="Cursor config with customer tracking" showLineNumbers
{
  "mcpServers": {
    "GitHub": {
      "url": "http://localhost:4000/github_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-litellm-end-user-id": "customer_123"
      }
    }
  }
}
```

**동작:**
- customer별 object permission이 적용됩니다(허용된 MCP server만 접근 가능).
- customer budget이 적용됩니다.
- 모든 tool call이 `customer_123` 아래에서 tracking됩니다.

[customer management 더 알아보기 →](./proxy/customers)

## Proxy의 /v1/responses Endpoint 호출

MCP tool을 사용하기 위해 LiteLLM Proxy의 `/v1/responses` endpoint를 호출할 때는 tools array에서 **항상 `server_url: "litellm_proxy"`**를 사용하세요. 이는 proxy가 구성된 MCP server를 사용해야 함을 알려줍니다.

:::important 전체 proxy URL을 사용하지 마세요
request가 이미 proxy로 향하고 있다면 `server_url: "https://your-proxy.com/mcp"`를 사용하는 것은 올바르지 않습니다. proxy가 구성된 MCP server로 routing하려면 literal value인 `litellm_proxy`가 필요합니다.
:::

```bash title="Correct: Using litellm_proxy" showLineNumbers
curl --location 'https://your-proxy.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gpt-4",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

### MCP Servers로 Custom Headers 전송

특정 MCP server에 custom header(예: API key, auth token)를 전달하려면 다음 중 하나를 사용하세요.

**Option 1: Request headers** – request header에 `x-mcp-{server_alias}-{header_name}`를 추가합니다. proxy는 이를 일치하는 MCP server로 forwarding합니다.

```bash
# Send Authorization header to the "weather2" MCP server
--header 'x-mcp-weather2-authorization: Bearer your-token'

# Send custom header to the "github" MCP server  
--header 'x-mcp-github-x-api-key: your-api-key'
```

**Option 2: tool config의 Headers** – tool definition에 `headers` object를 포함합니다. 이 값은 request header와 merge됩니다.

```json
{
    "type": "mcp",
    "server_label": "litellm",
    "server_url": "litellm_proxy",
    "require_approval": "never",
    "headers": {
        "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
        "x-mcp-servers": "Zapier_MCP,dev-group",
        "x-mcp-weather2-authorization": "Bearer your-weather-api-token"
    }
}
```

## Client Side Credentials로 MCP 사용

client side authentication token을 LiteLLM에 전달하고, LiteLLM이 이를 MCP로 전달해 MCP 인증에 사용하게 하려면 이 방식을 사용하세요.


### 새 Server-Specific Auth Headers(권장)

`x-mcp-{server_alias}-{header_name}` 형식의 server-specific header를 사용해 MCP auth token을 지정할 수 있습니다. 이를 통해 MCP server마다 서로 다른 authentication을 사용할 수 있습니다.

**장점:**
- **Server별 authentication**: 각 MCP server가 서로 다른 auth method를 사용할 수 있습니다.
- **더 나은 security**: 모든 server가 동일한 auth token을 공유할 필요가 없습니다.
- **유연한 header name**: 다양한 auth header type(authorization, x-api-key 등)을 지원합니다.
- **명확한 분리**: 각 server의 auth가 명확히 식별됩니다.

### 레거시 Auth Header(사용 중단됨) {#legacy-auth-headerdeprecated}

`x-mcp-auth` header를 사용해 MCP auth token을 지정할 수도 있습니다. 이 값은 모든 MCP server로 forwarding되며, server-specific header를 권장하기 때문에 deprecated 상태입니다.

<Tabs>
<TabItem value="openai" label="OpenAI API">

#### Server-Specific Auth로 OpenAI Responses API 연결

OpenAI Responses API를 사용하고 server-specific auth header를 포함합니다.

```bash title="cURL Example with Server-Specific Auth" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
                "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

#### Legacy Auth로 OpenAI Responses API 연결

OpenAI Responses API를 사용하고 MCP server authentication을 위해 `x-mcp-auth` header를 포함합니다.

```bash title="cURL Example with Legacy MCP Auth" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-auth": YOUR_MCP_AUTH_TOKEN
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

</TabItem>

<TabItem value="litellm" label="LiteLLM Proxy">

#### Server-Specific Auth로 LiteLLM Proxy Responses API 연결

server-specific authentication으로 `/v1/responses` endpoint에 LLM API request를 보내기 위해 LiteLLM Proxy를 호출할 때 사용합니다.

```bash title="cURL Example with Server-Specific Auth" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
                "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

#### Legacy Auth로 LiteLLM Proxy Responses API 연결

MCP authentication으로 `/v1/responses` endpoint에 LLM API request를 보내기 위해 LiteLLM Proxy를 호출할 때 사용합니다.

```bash title="cURL Example with Legacy MCP Auth" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-auth": "YOUR_MCP_AUTH_TOKEN"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

#### Server-Specific Auth로 Cursor IDE 연결

LiteLLM MCP를 통해 Cursor IDE에서 직접 tool을 사용하고 server-specific authentication을 포함합니다.

**설정 지침:**

1. **Cursor Settings 열기**: `⇧+⌘+J`(Mac) 또는 `Ctrl+Shift+J`(Windows/Linux)를 사용합니다.
2. **MCP Tools로 이동**: "MCP Tools" tab으로 이동해 "New MCP Server"를 클릭합니다.
3. **설정 추가**: 아래 JSON configuration을 복사해 붙여넣은 뒤 `Cmd+S` 또는 `Ctrl+S`로 저장합니다.

```json title="Cursor MCP Configuration with Server-Specific Auth" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "litellm_proxy",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-github-authorization": "Bearer $GITHUB_TOKEN",
        "x-mcp-zapier-x-api-key": "$ZAPIER_API_KEY"
      }
    }
  }
}
```

#### Legacy Auth로 Cursor IDE 연결

LiteLLM MCP를 통해 Cursor IDE에서 직접 tool을 사용하고 MCP authentication token을 포함합니다.

**설정 지침:**

1. **Cursor Settings 열기**: `⇧+⌘+J`(Mac) 또는 `Ctrl+Shift+J`(Windows/Linux)를 사용합니다.
2. **MCP Tools로 이동**: "MCP Tools" tab으로 이동해 "New MCP Server"를 클릭합니다.
3. **설정 추가**: 아래 JSON configuration을 복사해 붙여넣은 뒤 `Cmd+S` 또는 `Ctrl+S`로 저장합니다.

```json title="Cursor MCP Configuration with Legacy Auth" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "litellm_proxy",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-auth": "$MCP_AUTH_TOKEN"
      }
    }
  }
}
```

</TabItem>

<TabItem value="http" label="Streamable HTTP">

#### Server-Specific Auth로 Streamable HTTP Transport 연결

server-specific authentication과 함께 HTTP transport를 사용해 LiteLLM MCP에 연결합니다.

**Server URL:**
```text showLineNumbers
litellm_proxy
```

**Headers:**
```text showLineNumbers
x-litellm-api-key: Bearer YOUR_LITELLM_API_KEY
x-mcp-github-authorization: Bearer YOUR_GITHUB_TOKEN
x-mcp-zapier-x-api-key: YOUR_ZAPIER_API_KEY
```

#### Legacy Auth로 Streamable HTTP Transport 연결

MCP authentication과 함께 HTTP transport를 사용해 LiteLLM MCP에 연결합니다.

**Server URL:**
```text showLineNumbers
litellm_proxy
```

**Headers:**
```text showLineNumbers
x-litellm-api-key: Bearer YOUR_LITELLM_API_KEY
x-mcp-auth: Bearer YOUR_MCP_AUTH_TOKEN
```

이 URL은 HTTP transport를 지원하는 모든 MCP client에서 사용할 수 있습니다. `x-mcp-auth` header는 authentication을 위해 MCP server로 forwarding됩니다.

</TabItem>

<TabItem value="fastmcp" label="Python FastMCP">

#### Server-Specific Auth로 Python FastMCP Client 연결

Python FastMCP client를 사용해 server-specific authentication으로 LiteLLM MCP server에 연결합니다.

```python title="Python FastMCP Example with Server-Specific Auth" showLineNumbers
import asyncio
import json

from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

# Create the transport with your LiteLLM MCP server URL and server-specific auth headers
server_url = "litellm_proxy"
transport = StreamableHttpTransport(
    server_url,
    headers={
        "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
        "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
        "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
    }
)

# Initialize the client with the transport
client = Client(transport=transport)


async def main():
    # Connection is established here
    print("Connecting to LiteLLM MCP server with server-specific authentication...")
    async with client:
        print(f"Client connected: {client.is_connected()}")

        # Make MCP calls within the context
        print("Fetching available tools...")
        tools = await client.list_tools()

        print(f"Available tools: {json.dumps([t.name for t in tools], indent=2)}")
        
        # Example: Call a tool (replace 'tool_name' with an actual tool name)
        if tools:
            tool_name = tools[0].name
            print(f"Calling tool: {tool_name}")
            
            # Call the tool with appropriate arguments
            result = await client.call_tool(tool_name, arguments={})
            print(f"Tool result: {result}")


# Run the example
if __name__ == "__main__":
    asyncio.run(main())
```

#### Legacy Auth로 Python FastMCP Client 연결

Python FastMCP client를 사용해 MCP authentication으로 LiteLLM MCP server에 연결합니다.

```python title="Python FastMCP Example with Legacy MCP Auth" showLineNumbers
import asyncio
import json

from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

# Create the transport with your LiteLLM MCP server URL and auth headers
server_url = "litellm_proxy"
transport = StreamableHttpTransport(
    server_url,
    headers={
        "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
        "x-mcp-auth": "Bearer YOUR_MCP_AUTH_TOKEN"
    }
)

# Initialize the client with the transport
client = Client(transport=transport)


async def main():
    # Connection is established here
    print("Connecting to LiteLLM MCP server with authentication...")
    async with client:
        print(f"Client connected: {client.is_connected()}")

        # Make MCP calls within the context
        print("Fetching available tools...")
        tools = await client.list_tools()

        print(f"Available tools: {json.dumps([t.name for t in tools], indent=2)}")
        
        # Example: Call a tool (replace 'tool_name' with an actual tool name)
        if tools:
            tool_name = tools[0].name
            print(f"Calling tool: {tool_name}")
            
            # Call the tool with appropriate arguments
            result = await client.call_tool(tool_name, arguments={})
            print(f"Tool result: {result}")


# Run the example
if __name__ == "__main__":
    asyncio.run(main())
```

</TabItem>
</Tabs>

### MCP Auth Header Name 사용자 지정

기본적으로 LiteLLM은 MCP server에 credentials를 전달하기 위해 `x-mcp-auth`를 사용합니다. 다음 방법 중 하나로 이 header name을 변경할 수 있습니다.
1. `LITELLM_MCP_CLIENT_SIDE_AUTH_HEADER_NAME` environment variable 설정

```bash title="Environment Variable" showLineNumbers
export LITELLM_MCP_CLIENT_SIDE_AUTH_HEADER_NAME="authorization"
```


2. config.yaml 파일의 general settings에서 `mcp_client_side_auth_header_name` 설정

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx

general_settings:
  mcp_client_side_auth_header_name: "authorization"
```

#### authorization header 사용

이 예제에서는 `authorization` header가 authentication을 위해 MCP server로 전달됩니다.

```bash title="cURL with authorization header" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "authorization": "Bearer sk-zapier-token-123"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

## `/chat/completions`에서 MCP tools 사용

:::tip 모든 provider에서 작동
이 flow는 **provider-agnostic**입니다. 동일한 MCP tool definition이 LiteLLM 뒤의 _모든_ LLM backend(OpenAI, Azure OpenAI, Anthropic, Amazon Bedrock, Vertex, self-hosted deployment 등)에서 작동합니다.
:::

LiteLLM Proxy는 classic `/v1/chat/completions` endpoint에서도 MCP-aware tooling을 지원합니다. MCP tool definition을 `tools` array에 직접 제공하면 LiteLLM이 MCP server의 tool을 가져와 OpenAI-compatible function call로 변환합니다. `require_approval`이 `"never"`로 설정되면 proxy가 반환된 tool call을 자동 실행하고 결과를 model에 다시 전달한 뒤 assistant response를 반환합니다.

```bash title="Chat Completions with MCP Tools" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Summarize the latest open PR."}
  ],
  "tools": [
    {
      "type": "mcp",
      "server_url": "litellm_proxy/mcp/github",
      "server_label": "github_mcp",
      "require_approval": "never"
    }
  ]
}'
```

`require_approval`을 생략하거나 `"never"`가 아닌 값으로 설정하면 MCP tool call이 client로 반환되어 직접 검토하고 실행할 수 있습니다. 이는 upstream OpenAI behavior와 동일합니다.


## LiteLLM Proxy - MCP Gateway 둘러보기 {#litellm-proxy---mcp-gateway-walkthrough}
LiteLLM은 admin이 모든 MCP server를 LiteLLM에 추가할 수 있도록 MCP Gateway를 제공합니다. MCP와 함께 LiteLLM Proxy를 사용할 때의 핵심 장점은 다음과 같습니다.

1. 모든 MCP tool에 고정 endpoint 사용
2. Key, Team, User 기준 MCP Permission management

이 video는 MCP server를 LiteLLM Proxy에 onboarding하고, 사용하고, access control을 설정하는 방법을 보여줍니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/f7aa8d217879430987f3e64291757bfc" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## LiteLLM Python SDK MCP 브리지 {#litellm-python-sdk-mcp-bridge}

LiteLLM Python SDK는 LiteLLM이 지원하는 모든 모델에서 MCP tool을 활용할 수 있도록 MCP bridge 역할을 합니다. LiteLLM은 MCP 사용을 위해 다음 기능을 제공합니다.

- 사용 가능한 MCP Tools **List**: OpenAI client가 사용 가능한 모든 MCP tool을 볼 수 있습니다.
  - `litellm.experimental_mcp_client.load_mcp_tools`로 사용 가능한 모든 MCP tool list 조회
- MCP Tools **Call**: OpenAI client가 MCP tool을 호출할 수 있습니다.
  - `litellm.experimental_mcp_client.call_openai_tool`로 MCP server의 OpenAI tool 호출


### 1. 사용 가능한 MCP Tools 조회

이 예제에서는 `litellm.experimental_mcp_client.load_mcp_tools`를 사용해 MCP server에서 사용 가능한 모든 MCP tool을 조회합니다. 이 method는 두 가지 방식으로 사용할 수 있습니다.

- `format="mcp"` - (기본값) MCP tool 반환
  - 반환: `mcp.types.Tool`
- `format="openai"` - OpenAI API compatible tool로 변환된 MCP tool 반환. OpenAI endpoint와 함께 사용할 수 있습니다.
  - 반환: `openai.types.chat.ChatCompletionToolParam`

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python title="MCP Client List Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
import litellm
from litellm import experimental_mcp_client


server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = await litellm.acompletion(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print("LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str))
```

</TabItem>

<TabItem value="openai" label="OpenAI SDK + LiteLLM Proxy">

이 예제에서는 LiteLLM proxy를 바라보도록 설정한 OpenAI SDK로 MCP tool을 호출하는 방법을 살펴봅니다. 핵심 차이는 LLM API request를 보낼 때 OpenAI SDK를 사용한다는 점입니다.

```python title="MCP Client List Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
from openai import OpenAI
from litellm import experimental_mcp_client

server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools using litellm mcp client
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        # Use OpenAI SDK pointed to LiteLLM proxy
        client = OpenAI(
            api_key="your-api-key",  # Your LiteLLM proxy API key
            base_url="http://localhost:4000"  # Your LiteLLM proxy URL
        )

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=tools
        )
        print("LLM RESPONSE: ", llm_response)
```
</TabItem>
</Tabs>


### 2. MCP Tools 조회 및 호출

이 예제에서는 다음을 사용합니다.
- `litellm.experimental_mcp_client.load_mcp_tools`: MCP server에서 사용 가능한 모든 MCP tool 조회
- `litellm.experimental_mcp_client.call_openai_tool`: MCP server의 OpenAI tool 호출

첫 번째 LLM response는 OpenAI tool 목록을 반환합니다. LLM response에서 첫 번째 tool call을 가져와 `litellm.experimental_mcp_client.call_openai_tool`에 전달하고, MCP server에서 해당 tool을 호출합니다.

#### `litellm.experimental_mcp_client.call_openai_tool` 작동 방식

- LLM response의 OpenAI Tool Call을 받습니다.
- OpenAI Tool Call을 MCP Tool로 변환합니다.
- MCP server에서 MCP Tool을 호출합니다.
- MCP Tool call 결과를 반환합니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python title="MCP Client List and Call Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
import litellm
from litellm import experimental_mcp_client


server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = await litellm.acompletion(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print("LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str))

        openai_tool = llm_response["choices"][0]["message"]["tool_calls"][0]
        # Call the tool using MCP client
        call_result = await experimental_mcp_client.call_openai_tool(
            session=session,
            openai_tool=openai_tool,
        )
        print("MCP TOOL CALL RESULT: ", call_result)

        # send the tool result to the LLM
        messages.append(llm_response["choices"][0]["message"])
        messages.append(
            {
                "role": "tool",
                "content": str(call_result.content[0].text),
                "tool_call_id": openai_tool["id"],
            }
        )
        print("final messages with tool result: ", messages)
        llm_response = await litellm.acompletion(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print(
            "FINAL LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str)
        )
```

</TabItem>
<TabItem value="proxy" label="OpenAI SDK + LiteLLM Proxy">

이 예제에서는 LiteLLM proxy를 바라보도록 설정한 OpenAI SDK로 MCP tool을 호출하는 방법을 살펴봅니다. 핵심 차이는 LLM API request를 보낼 때 OpenAI SDK를 사용한다는 점입니다.

```python title="MCP Client with OpenAI SDK" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
from openai import OpenAI
from litellm import experimental_mcp_client

server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools using litellm mcp client
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        # Use OpenAI SDK pointed to LiteLLM proxy
        client = OpenAI(
            api_key="your-api-key",  # Your LiteLLM proxy API key
            base_url="http://localhost:8000"  # Your LiteLLM proxy URL
        )

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=tools
        )
        print("LLM RESPONSE: ", llm_response)

        # Get the first tool call
        tool_call = llm_response.choices[0].message.tool_calls[0]
        
        # Call the tool using MCP client
        call_result = await experimental_mcp_client.call_openai_tool(
            session=session,
            openai_tool=tool_call.model_dump(),
        )
        print("MCP TOOL CALL RESULT: ", call_result)

        # Send the tool result back to the LLM
        messages.append(llm_response.choices[0].message.model_dump())
        messages.append({
            "role": "tool",
            "content": str(call_result.content[0].text),
            "tool_call_id": tool_call.id,
        })

        final_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=tools
        )
        print("FINAL RESPONSE: ", final_response)
```

</TabItem>
</Tabs>

## FAQ

**Q: LiteLLM 뒤의 MCP server에서 OAuth2 client_credentials(머신 투 머신)를 어떻게 사용하나요?**

LiteLLM은 `client_credentials` grant의 automatic token management를 지원합니다. MCP server에 `client_id`, `client_secret`, `token_url`을 설정하면 LiteLLM이 token을 자동으로 가져오고 cache하며 refresh합니다. 설정 지침은 MCP OAuth M2M guide를 참고하세요.

**Q: LiteLLM UI에서 OAuth token을 가져오면 어디에 저장되나요?**

UI는 OAuth redirect flow를 완료하기 위한 transient state만 `sessionStorage`에 보관합니다. token은 server나 database에 영구 저장되지 않습니다.

**Q: MCP connection error가 보이면 무엇을 확인해야 하나요?**

[MCP 문제 해결 Guide](./mcp_troubleshoot.md)를 따라 Client → LiteLLM 구간과 LiteLLM → MCP 구간을 단계별로 분리해 확인하세요. log example과 MCP Inspector, `curl` 같은 verification method도 포함되어 있습니다.
