import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# OpenAPI 사양에서 MCP 생성

LiteLLM은 모든 OpenAPI/Swagger 사양을 MCP 서버로 변환할 수 있습니다. 별도의 커스텀 MCP 서버 코드는 필요하지 않습니다.

## 1단계 - MCP 서버 추가 {#step-1--add-the-mcp-server}

`config.yaml`에 OpenAPI 기반 서버를 추가합니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  petstore_mcp:
    url: "https://petstore.swagger.io/v2"
    spec_path: "/path/to/openapi.json"
    auth_type: "none"

  my_api_mcp:
    url: "http://0.0.0.0:8090"
    spec_path: "/path/to/openapi.json"
    auth_type: "api_key"
    auth_value: "your-api-key-here"

  secured_api_mcp:
    url: "https://api.example.com"
    spec_path: "/path/to/openapi.json"
    auth_type: "bearer_token"
    auth_value: "your-bearer-token"
```

또는 UI에서 **MCP Servers → Add New MCP Server**로 이동해 URL과 사양 경로를 입력합니다. 그러면 LiteLLM이 사양을 가져와 모든 엔드포인트를 도구로 로드합니다.

**설정 매개변수:**

| 매개변수 | 필수 | 설명 |
|-----------|----------|-------------|
| `url` | 예 | API의 기본 URL |
| `spec_path` | 예 | OpenAPI 사양의 경로 또는 URL(JSON 또는 YAML) |
| `auth_type` | No | `none`, `api_key`, `bearer_token`, `basic`, `authorization`, `oauth2` |
| `auth_value` | 아니요 | 인증 값(`auth_type`이 설정된 경우 필요) |
| `description` | 아니요 | 선택 설명 |
| `allowed_tools` | 아니요 | 특정 도구의 허용 목록 |
| `disallowed_tools` | 아니요 | 특정 도구의 차단 목록 |

**지원되는 사양 버전:** OpenAPI 3.0.x, 3.1.x, Swagger 2.0. 각 작업의 `operationId`가 도구 이름이 되므로 고유한지 확인하세요.

## 내부 사양 URL(SSRF) {#internal-spec-urls-ssrf}

`spec_path`가 `http://` 또는 `https://` URL이면 LiteLLM 프록시는 기본적으로 **SSRF protection**을 활성화한 상태로 이를 가져옵니다. 호스트 이름을 해석한 뒤, 해석된 주소 중 하나라도 전역 라우팅이 불가능하면(예: `10.x`, `192.168.x`, `127.0.0.1`) 요청이 **거부**됩니다. 단, 해석된 IP가 아니라 **URL의 호스트 이름**을 허용 목록에 추가한 경우는 예외입니다.

일반적인 사례:

- 사양 URL은 `https://api.example.com/...`을 사용하지만 네트워크 내부 DNS가 사설 IP를 반환하는 경우: `api.example.com`을 허용 목록에 추가합니다. 포트를 고정한다면 `api.example.com:443`을 추가합니다.
- 사양 URL이 `http://127.0.0.1:8080/openapi.json`인 경우: `127.0.0.1` 또는 `127.0.0.1:8080`을 추가합니다.

프록시 `config.yaml`의 **`litellm_settings`** 아래에 설정합니다. 이 값은 **`general_settings`에서 읽지 않습니다**.

```yaml title="config.yaml" showLineNumbers
litellm_settings:
  user_url_validation: true # default; set false only if you fully trust URL sources
  user_url_allowed_hosts:
    - "api.example.com"
    - "127.0.0.1"
    - "127.0.0.1:8080"
```

이 필드의 전체 참조는 [config settings - `litellm_settings`](./proxy/config_settings.md#litellm_settings---reference)를 확인하세요.

도구가 로드되면 Tool 설정 섹션에서 확인할 수 있습니다.

<Image
  img={require('../img/mcp_openapi_tools_loaded.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

## 2단계 - 선택적으로 도구 이름과 설명 재정의 {#step-2--optionally-override-tool-names-and-descriptions}

기본적으로 도구 이름과 설명은 사양의 `operationId` 및 설명 필드에서 가져옵니다. 업스트림 사양을 수정하지 않고도 MCP 클라이언트에 더 깔끔한 이름과 설명이 보이도록 바꾸거나 다시 작성할 수 있습니다.

### UI에서 설정 {#from-the-ui}

각 도구 카드에는 연필 아이콘이 있습니다. 클릭하면 인라인 편집기가 열립니다.

<Image
  img={require('../img/mcp_openapi_tool_edit_panel.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

- **Display Name** - MCP 클라이언트가 보는 이름을 재정의합니다.
- **Description** - MCP 클라이언트가 보는 설명을 재정의합니다.
- 필드를 비워 두면 사양의 원본 값을 유지합니다.

재정의를 설정하면 도구 카드에 보라색 **Custom name** 배지가 표시됩니다.

<Image
  img={require('../img/mcp_openapi_custom_name_badge.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

### API에서 설정 {#from-the-api}

생성 또는 업데이트 요청에 `tool_name_to_display_name`과 `tool_name_to_description`을 전달합니다.

```bash title="Create server with tool name overrides" showLineNumbers
curl -X POST http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "petstore_mcp",
    "url": "https://petstore.swagger.io/v2",
    "spec_path": "/path/to/openapi.json",
    "tool_name_to_display_name": {
      "getPetById": "Get Pet",
      "findPetsByStatus": "List Available Pets"
    },
    "tool_name_to_description": {
      "getPetById": "Look up a pet by its ID",
      "findPetsByStatus": "Returns all pets matching a given status (available, pending, sold)"
    }
  }'
```

```bash title="Update overrides on an existing server" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server/{server_id} \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name_to_display_name": {
      "getPetById": "Get Pet"
    },
    "tool_name_to_description": {
      "getPetById": "Look up a pet by its ID"
    }
  }'
```

맵 키는 접두사가 붙은 도구 이름이 아니라 사양의 **원본 `operationId`**입니다. LiteLLM은 조회 전에 서버 접두사를 제거합니다.

예를 들어 서버가 `petstore_mcp`이면 도구는 `petstore_mcp-getPetById`로 노출됩니다. 그래도 맵 키는 `getPetById`입니다.

**변경 전과 후:**

```
# Without overrides
Tool: "petstore_mcp-getPetById"
Description: "Returns a single pet"

Tool: "petstore_mcp-findPetsByStatus"
Description: "Finds Pets by status"

# After overrides
Tool: "Get Pet"
Description: "Look up a pet by its ID"

Tool: "List Available Pets"
Description: "Returns all pets matching a given status (available, pending, sold)"
```

## 서버 사용 {#using-the-server}

<Tabs>
<TabItem value="fastmcp" label="Python FastMCP">

```python title="Using OpenAPI-based MCP Server" showLineNumbers
from fastmcp import Client
import asyncio

config = {
    "mcpServers": {
        "petstore": {
            "url": "http://localhost:4000/petstore_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-1234"
            }
        }
    }
}

client = Client(config)

async def main():
    async with client:
        tools = await client.list_tools()
        print(f"Available tools: {[tool.name for tool in tools]}")

        response = await client.call_tool(
            name="Get Pet",        # overridden name
            arguments={"petId": "1"}
        )
        print(f"Response: {response}")

if __name__ == "__main__":
    asyncio.run(main())
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration" showLineNumbers
{
  "mcpServers": {
    "Petstore": {
      "url": "http://localhost:4000/petstore_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY"
      }
    }
  }
}
```

</TabItem>

<TabItem value="openai" label="OpenAI Responses API">

```bash title="Using OpenAPI MCP Server with OpenAI" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "gpt-4o",
    "tools": [
        {
            "type": "mcp",
            "server_label": "petstore",
            "server_url": "http://localhost:4000/petstore_mcp/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY"
            }
        }
    ],
    "input": "Find all available pets",
    "tool_choice": "required"
}'
```

</TabItem>
</Tabs>
