import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 권한 관리

LiteLLM에서 특정 key, team, organization이 접근할 수 있는 MCP server와 tool을 제어합니다. client가 tool 목록 조회 또는 호출을 시도하면 LiteLLM은 구성된 permission을 기준으로 access control을 적용합니다.

## 개요

LiteLLM은 MCP server에 대한 세밀한 권한 관리를 제공하며, 다음을 수행할 수 있습니다.

- **entity별 MCP 접근 제한**: 특정 MCP server에 접근할 수 있는 key, team, organization을 제어합니다.
- **tool 수준 filtering**: entity permission을 기준으로 사용 가능한 tool을 자동 filtering합니다.
- **중앙 제어**: LiteLLM 관리자 UI 또는 API에서 모든 MCP permission을 관리합니다.
- **한 번 클릭으로 public MCP 설정**: key별 제한이 필요 없을 때 특정 server를 모든 LiteLLM API key에서 사용할 수 있게 표시합니다.

이를 통해 승인된 entity만 MCP tool을 발견하고 사용할 수 있으며, MCP infrastructure에 추가 보안 계층을 제공합니다.

:::info 관련 문서
- [MCP 개요](./mcp.md) - LiteLLM의 MCP 알아보기
- [MCP 비용 추적](./mcp_cost.md) - MCP tool call 비용 추적
- [MCP 가드레일](./mcp_guardrail.md) - MCP call에 보안 guardrail 적용
- [MCP 사용](./mcp_usage.md) - LiteLLM에서 MCP 사용 방법
:::

## 동작 방식

LiteLLM은 key, team, organization(entity)별 MCP Server permission 관리를 지원합니다. MCP client가 tool 목록 조회를 시도하면 LiteLLM은 해당 entity가 접근 권한을 가진 tool만 반환합니다.

Key, Team, Organization을 생성할 때 해당 entity가 접근할 수 있는 MCP Server를 선택할 수 있습니다.

<Image 
  img={require('../img/mcp_key.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>


## MCP Tool 허용/차단
  
MCP server에서 사용할 수 있는 tool을 제어합니다. 특정 tool만 허용하거나 위험한 tool을 차단할 수 있습니다.

<Tabs>
<TabItem value="allowed" label="특정 Tool만 허용">

사용자가 접근할 수 있는 tool을 정확히 지정하려면 `allowed_tools`를 사용하세요. 나머지 모든 tool은 차단됩니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    authorization_url: https://github.com/login/oauth/authorize
    token_url: https://github.com/login/oauth/access_token
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
    scopes: ["public_repo", "user:email"]
    allowed_tools: ["list_tools"]
    # only list_tools will be available
```

**다음 상황에서 사용하세요.**
- 사용 가능한 tool을 엄격하게 제어해야 할 때
- 보안 요구사항이 높은 환경일 때
- 제한된 tool로 새 MCP server를 테스트할 때

</TabItem>
<TabItem value="blocked" label="특정 Tool 차단">

특정 tool을 차단하려면 `disallowed_tools`를 사용하세요. 나머지 모든 tool은 사용할 수 있습니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    authorization_url: https://github.com/login/oauth/authorize
    token_url: https://github.com/login/oauth/access_token
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
    scopes: ["public_repo", "user:email"]
    disallowed_tools: ["repo_delete"]
    # only repo_delete will be blocked
```

**다음 상황에서 사용하세요.**
- 대부분의 tool은 안전하지만 일부 위험한 tool만 차단하고 싶을 때
- 비용이 큰 API call을 방지하고 싶을 때
- 기존 server에 제한을 단계적으로 추가할 때

</TabItem>
</Tabs>

### 중요 참고

- `allowed_tools`와 `disallowed_tools`를 모두 지정하면 allow list가 우선합니다.
- tool name은 대소문자를 구분합니다.

## 공개 MCP 서버(`allow_all_keys`) {#public-mcp-server-allow_all_keys}

일부 MCP server는 넓게 공유되도록 설계됩니다. 예를 들어 내부 knowledge base, calendar integration, 모든 team이 별도 접근 요청 없이 연결할 수 있어야 하는 저위험 utility가 있습니다. 이러한 server를 모든 key, team, organization에 하나씩 추가하는 대신 `allow_all_keys` toggle을 활성화하세요.

<Tabs>
<TabItem value="ui" label="UI">

1. 관리자 UI에서 **MCP Servers → Add / Edit**를 엽니다.
2. **Permission Management / Access Control**을 펼칩니다.
3. **Allow All LiteLLM Keys** toggle을 켭니다.

<Image 
  img={require('../img/mcp_allow_all_ui.png')}
  style={{width: '80%', display: 'block', margin: '1rem auto'}}
  alt="MCP server configuration in 관리자 UI"
/> 

이 toggle은 기존 access group을 건드리지 않고 server를 "public"으로 만듭니다.

</TabItem>
<TabItem value="config" label="config.yaml">

server를 public으로 표시하려면 `allow_all_keys: true`를 설정하세요.

```yaml title="Make an MCP server public" showLineNumbers
mcp_servers:
  deepwiki:
    url: https://mcp.deepwiki.com/mcp
    allow_all_keys: true
```

</TabItem>
</Tabs>

### 사용 시점

- 세밀한 ACL이 오히려 관리 부담만 늘리는 공유 MCP utility가 있을 때
- 내부 사용자에게 기본 활성화 경험을 제공하되 tool 수준 제한은 계속 계층화하고 싶을 때
- 새 team을 온보딩하면서 가장 안전한 MCP를 기본으로 제공하고 싶을 때

활성화하면 LiteLLM은 tool discovery/call 과정에서 모든 key에 해당 server를 자동 포함합니다. 추가 virtual-key 또는 team 설정은 필요하지 않습니다.

---

## MCP tool parameter 허용/차단 {#mcp-tool-parameter-allow-block}

`allowed_params` 설정으로 특정 MCP tool에 허용되는 parameter를 제어합니다. 각 tool에 전달할 수 있는 parameter를 제한하여 tool 사용을 세밀하게 제어할 수 있습니다.

### 설정

`allowed_params`는 tool name을 허용된 parameter name 목록에 매핑하는 dictionary입니다. 설정하면 해당 tool에는 지정된 parameter만 허용되며, 그 외 parameter는 403 error로 거부됩니다.

```yaml title="config.yaml with allowed_params" showLineNumbers
mcp_servers:
  deepwiki_mcp:
    url: https://mcp.deepwiki.com/mcp
    transport: "http"
    auth_type: "none"
    allowed_params:
      # Tool name: list of allowed parameters
      read_wiki_contents: ["status"]
  
  my_api_mcp:
    url: "https://my-api-server.com"
    auth_type: "api_key"
    auth_value: "my-key"
    allowed_params:
      # Using unprefixed tool name
      getpetbyid: ["status"]
      # Using prefixed tool name (both formats work)
      my_api_mcp-findpetsbystatus: ["status", "limit"]
      # Another tool with multiple allowed params
      create_issue: ["title", "body", "labels"]
```

### 동작 방식

1. **Tool별 filtering**: 각 tool은 자체 허용 parameter 목록을 가질 수 있습니다.
2. **유연한 naming**: tool name은 server prefix 포함 또는 미포함으로 지정할 수 있습니다. 예: `"getpetbyid"`와 `"my_api_mcp-getpetbyid"` 모두 동작합니다.
3. **Whitelist 방식**: 허용 목록에 있는 parameter만 허용됩니다.
4. **목록에 없는 tool**: `allowed_params`가 설정되지 않으면 모든 parameter가 허용됩니다.
5. **Error handling**: 허용되지 않은 parameter가 포함된 요청은 어떤 parameter가 허용되는지에 대한 세부 정보와 함께 403 error를 받습니다.

### 예제 요청 동작

위 설정에서는 요청이 다음과 같이 처리됩니다.

**허용되는 요청:**
```json
{
  "tool": "read_wiki_contents",
  "arguments": {
    "status": "active"
  }
}
```

**거부되는 요청:**
```json
{
  "tool": "read_wiki_contents",
  "arguments": {
    "status": "active",
    "limit": 10  // This parameter is not allowed
  }
}
```

**Error Response:**
```json
{
  "error": "Parameters ['limit'] are not allowed for tool read_wiki_contents. Allowed parameters: ['status']. Contact proxy admin to allow these parameters."
}
```

### 사용 사례

- **보안**: 사용자가 민감한 parameter 또는 위험한 operation에 접근하지 못하게 합니다.
- **비용 제어**: 비용이 큰 parameter를 제한합니다. 예: result count 제한.
- **규정 준수**: 규제 요구사항에 맞는 parameter 사용 정책을 강제합니다.
- **단계적 rollout**: tool 테스트가 진행되는 동안 parameter를 단계적으로 활성화합니다.
- **Multi-tenant 격리**: 사용자 group별로 다른 parameter 접근을 제공합니다.

### Tool Filtering과 함께 사용

`allowed_params`는 `allowed_tools`, `disallowed_tools`와 함께 동작해 완전한 제어를 제공합니다.

```yaml title="Combined filtering example" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    authorization_url: https://github.com/login/oauth/authorize
    token_url: https://github.com/login/oauth/access_token
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
    scopes: ["public_repo", "user:email"]
    # Only allow specific tools
    allowed_tools: ["create_issue", "list_issues", "search_issues"]
    # Block dangerous operations
    disallowed_tools: ["delete_repo"]
    # Restrict parameters per tool
    allowed_params:
      create_issue: ["title", "body", "labels"]
      list_issues: ["state", "sort", "perPage"]
      search_issues: ["query", "sort", "order", "perPage"]
```

이 설정은 다음을 보장합니다.
1. 나열된 세 가지 tool만 사용할 수 있습니다.
2. `delete_repo` tool은 명시적으로 차단됩니다.
3. 각 tool은 지정된 parameter만 사용할 수 있습니다.

---

## MCP 서버 접근 제어 {#mcp-server-access-control}

LiteLLM Proxy는 특정 MCP server 접근을 제어하는 두 가지 방법을 제공합니다.

1. **URL 기반 네임스페이스** - URL path를 사용해 특정 server 또는 access group에 직접 접근합니다.
2. **Header 기반 네임스페이스** - `x-mcp-servers` header를 사용해 접근할 server를 지정합니다.

---

### 방법 1: URL 기반 네임스페이스 {#method-1-url-based-namespacing}

LiteLLM Proxy는 `/<servers or access groups>/mcp` 형식을 사용한 MCP server용 URL 기반 네임스페이스를 지원합니다. 이를 통해 다음을 수행할 수 있습니다.

- **직접 URL 접근**: URL을 통해 MCP client를 특정 server 또는 access group으로 직접 연결합니다.
- **간단한 설정**: server 선택에 header 대신 URL을 사용합니다.
- **Access Group 지원**: 그룹화된 server access를 위해 URL에서 access group name을 사용합니다.

#### URL 형식

```
<your-litellm-proxy-base-url>/<server_alias_or_access_group>/mcp
```

**예제:**
- `/github_mcp/mcp` - "github_mcp" MCP server의 tool에 접근
- `/zapier/mcp` - "zapier" MCP server의 tool에 접근
- `/dev_group/mcp` - "dev_group" access group의 모든 server tool에 접근
- `/github_mcp,zapier/mcp` - 여러 특정 server의 tool에 접근

#### 사용법 예제

<Tabs>
<TabItem value="openai" label="OpenAI API">

```bash title="cURL Example with URL Namespacing" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "<your-litellm-proxy-base-url>/github_mcp/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 예제는 URL 네임스페이스를 사용해 "github" MCP server에만 접근합니다.

</TabItem>

<TabItem value="litellm" label="LiteLLM Proxy">

```bash title="cURL Example with URL Namespacing" showLineNumbers
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
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 예제는 `x-mcp-servers` header를 사용해 "dev_group" access group의 모든 server에 접근합니다. proxy의 `/v1/responses` endpoint를 호출할 때는 전체 proxy URL이 아니라 `server_url: "litellm_proxy"`를 사용하세요.

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with URL Namespacing" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "<your-litellm-proxy-base-url>/github_mcp,zapier/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY"
      }
    }
  }
}
```

이 설정은 URL 네임스페이스를 사용해 "github" 및 "zapier" MCP server의 tool에 접근합니다.

</TabItem>
</Tabs>

#### URL 네임스페이스의 장점 {#benefits-of-url-namespacing}

- **직접 접근**: server를 지정하기 위한 추가 header가 필요 없습니다.
- **명확한 URL**: 접근 가능한 server를 명확히 보여주는 자체 설명형 URL입니다.
- **Access Group 지원**: 그룹화된 server access에 access group name을 사용합니다.
- **여러 server**: comma로 구분해 단일 URL에 여러 server를 지정합니다.
- **간단한 설정**: URL 기반 설정을 선호하는 MCP client에서 더 쉽게 구성할 수 있습니다.

---

### 방법 2: Header 기반 네임스페이스 {#method-2-header-based-namespacing}

`x-mcp-servers` header를 사용해 특정 MCP server에만 접근하고 해당 tool만 나열하도록 선택할 수 있습니다. 이 header로 다음을 수행할 수 있습니다.
- 하나 이상의 특정 MCP server로 tool 접근 제한
- 환경 또는 사용 사례별로 사용 가능한 tool 제어

header는 comma로 구분된 server alias 목록을 받습니다. `"alias_1,Server2,Server3"`

**참고:**
- header가 제공되지 않으면 사용 가능한 모든 MCP server의 tool에 접근할 수 있습니다.
- 이 방법은 표준 LiteLLM MCP endpoint와 함께 동작합니다.

<Tabs>
<TabItem value="openai" label="OpenAI API">

```bash title="cURL Example with Header Namespacing" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "<your-litellm-proxy-base-url>/mcp/",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-servers": "alias_1"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 예제에서 요청은 "alias_1" MCP server의 tool에만 접근할 수 있습니다.

</TabItem>

<TabItem value="litellm" label="LiteLLM Proxy">

```bash title="cURL Example with Header Namespacing" showLineNumbers
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
                "x-mcp-servers": "alias_1,Server2"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 설정은 지정된 MCP server의 tool만 사용하도록 요청을 제한합니다. proxy의 `/v1/responses` endpoint를 호출할 때는 `server_url: "litellm_proxy"`를 사용하세요.

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with Header Namespacing" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "<your-litellm-proxy-base-url>/mcp/",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-servers": "alias_1,Server2"
      }
    }
  }
}
```

Cursor IDE 설정의 이 구성은 지정된 MCP server로만 tool 접근을 제한합니다.

</TabItem>
</Tabs>

---

### 비교: Header와 URL 네임스페이스 {#comparison-header-vs-url-namespacing}

| 기능 | Header 네임스페이스 | URL 네임스페이스 |
|---------|-------------------|-----------------|
| **방식** | `x-mcp-servers` header 사용 | URL path `/<servers>/mcp` 사용 |
| **Endpoint** | 표준 `litellm_proxy` endpoint | 사용자 지정 `/<servers>/mcp` endpoint |
| **설정** | 추가 header 필요 | URL 자체에 포함 |
| **여러 Server** | header에서 comma로 구분 | URL path에서 comma로 구분 |
| **Access Group** | header로 지원 | URL path로 지원 |
| **Client 지원** | 모든 MCP client에서 동작 | URL 인식 MCP client에서 동작 |
| **사용 사례** | 동적 server 선택 | 고정 server configuration |

<Tabs>
<TabItem value="openai" label="OpenAI API">

```bash title="cURL Example with Server Segregation" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "<your-litellm-proxy-base-url>/mcp/",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-servers": "alias_1"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 예제에서 요청은 "alias_1" MCP server의 tool에만 접근할 수 있습니다.

</TabItem>

<TabItem value="litellm" label="LiteLLM Proxy">

```bash title="cURL Example with Server Segregation" showLineNumbers
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
                "x-mcp-servers": "alias_1,Server2"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

이 설정은 지정된 MCP server의 tool만 사용하도록 요청을 제한합니다.

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with Server Segregation" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "litellm_proxy",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-servers": "alias_1,Server2"
      }
    }
  }
}
```

Cursor IDE 설정의 이 구성은 지정된 MCP server로만 tool 접근을 제한합니다.

</TabItem>
</Tabs>

### MCP 그룹화(Access Group) {#mcp-grouping-access-groups}

MCP Access Group을 사용하면 더 쉽게 관리할 수 있도록 여러 MCP server를 함께 그룹화할 수 있습니다.

#### 1. Access Group 생성 {#create-an-access-group}

##### A. Config로 Access Group 생성 {#create-an-access-group-with-config}

```yaml title="Creating access groups for MCP using the config" showLineNumbers
mcp_servers:
  "deepwiki_mcp":
    url: https://mcp.deepwiki.com/mcp
    transport: "http"
    auth_type: "none"
    access_groups: ["dev_group"]
```

config로 `mcp_servers`를 추가할 때:
- `access_groups` 안에 string 목록을 전달합니다.
- 이후 이 group은 key, team, header를 사용하는 MCP client에서 access 분리에 사용할 수 있습니다.

##### B. UI로 Access Group 생성 {#create-an-access-group-with-ui}

access group 생성 방법:
- LiteLLM UI에서 MCP Servers로 이동합니다.
- `Add a New MCP Server`를 클릭합니다.
- "MCP Access Groups" 아래에서 새 group name을 입력해 생성합니다. 예: "dev_group".
- 다른 server에도 같은 group name을 추가해 함께 그룹화합니다.

<Image 
  img={require('../img/mcp_create_access_group.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

#### 2. Cursor에서 Access Group 사용 {#use-an-access-group-in-cursor}

`x-mcp-servers` header에 access group name을 포함합니다.

```json title="Cursor Configuration with Access Groups" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "litellm_proxy",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY",
        "x-mcp-servers": "dev_group"
      }
    }
  }
}
```

이렇게 하면 "dev_group" access group의 모든 server에 접근할 수 있습니다.
- 즉, `dev_group` access group이 할당된 deepwiki server 및 다른 server는 tool calling에 사용할 수 있습니다.

#### 고급: API key에 Access Group 연결 {#advanced-link-an-access-group-to-an-api-key}

API key를 생성할 때 permission 관리를 위해 특정 access group에 할당할 수 있습니다.

- LiteLLM UI에서 "Keys"로 이동하고 "Create Key"를 클릭합니다.
- dropdown에서 원하는 MCP access group을 선택합니다.
- 해당 key는 그 group의 모든 MCP server에 접근할 수 있습니다.
- 이는 Test Key page에 반영됩니다.

<Image 
  img={require('../img/mcp_key_access_group.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>



## Key, Team, Organization별 allowed tool 설정 {#set-allowed-tools-for-a-key-team-or-organization}

동일한 MCP server에서 team별로 접근할 수 있는 tool을 제어합니다. 예를 들어 Engineering team에는 `list_repositories`, `create_issue`, `search_code` 접근을 주고, Sales에는 `search_code`와 `close_issue`만 제공할 수 있습니다.


이 영상은 Key, Team, Organization별 allowed tool 설정 방법을 보여줍니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/7464d444c3324078892367272fe50745" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>


## 대시보드 보기 모드 {#dashboard-view-mode}

Proxy admin은 `general_settings.user_mcp_management_mode`를 통해 non-admin이 MCP dashboard에서 무엇을 볼 수 있는지도 제어할 수 있습니다.

- `restricted` *(default)* - 사용자는 자신의 team에 명시적으로 접근 권한이 있는 server만 볼 수 있습니다.
- `view_all` - 모든 dashboard 사용자가 전체 MCP server 목록을 볼 수 있습니다.

```yaml title="Config example"
general_settings:
  user_mcp_management_mode: view_all
```

추가 실행 권한을 부여하지 않으면서 MCP 제공 항목의 발견 가능성을 높이고 싶을 때 유용합니다.


## MCP Registry 게시

다른 system이 LiteLLM에 호스팅된 MCP server를 자동으로 발견하게 하려면 Model Context Protocol Registry endpoint를 노출할 수 있습니다. 예를 들어 네트워크 외부에서 실행되는 MCP 지원 IDE 같은 외부 agent framework가 여기에 해당합니다. 이 registry는 [공식 MCP Registry spec](https://github.com/modelcontextprotocol/registry)을 사용해 built-in LiteLLM MCP server와 설정한 모든 server를 나열합니다.

1. proxy config 또는 DB settings의 `general_settings` 아래에 `enable_mcp_registry: true`를 설정하고 proxy를 재시작합니다.
2. LiteLLM은 `GET /v1/mcp/registry.json`에서 registry를 제공합니다.
3. 각 entry는 `/mcp`(built-in server) 또는 custom server용 `/{mcp_server_name}/mcp`를 가리키므로 client는 공개된 Streamable HTTP URL로 직접 연결할 수 있습니다.

:::note Permission은 계속 적용됩니다.
registry는 server URL만 광고합니다. client가 `/mcp` 또는 `/{server}/mcp`에 연결할 때 실제 access control은 여전히 LiteLLM이 강제하므로, registry를 게시해도 key별 permission을 우회하지 않습니다.
:::
