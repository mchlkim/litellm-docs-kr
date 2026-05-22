
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 사용하기

이 문서는 LiteLLM을 MCP Gateway로 사용하는 방법을 다룹니다. Responses API, Cursor IDE, OpenAI SDK와 함께 사용하는 방법을 확인할 수 있습니다.

### LiteLLM UI에서 사용

LiteLLM UI에서 MCP를 사용하려면 이 walkthrough를 따라가세요.

<iframe width="840" height="500" src="https://www.loom.com/embed/57e0763267254bc79dbe6658d0b8758c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

### Responses API와 함께 사용

`http://localhost:4000`을 LiteLLM Proxy base URL로 바꾸세요.

LiteLLM Proxy와 Responses API를 함께 사용하는 데모 영상: [데모 영상 보기](https://www.loom.com/share/34587e618c5c47c0b0d67b4e4d02718f?sid=2caf3d45-ead4-4490-bcc1-8d6dd6041c02)


<Tabs>
<TabItem value="curl" label="cURL">

```bash title="cURL Example" showLineNumbers
curl --location 'http://localhost:4000/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer sk-1234" \
--data '{
    "model": "gpt-5",
    "input": [
    {
      "role": "user",
      "content": "give me TLDR of what BerriAI/litellm repo is about",
      "type": "message"
    }
  ],
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    "stream": true,
    "tool_choice": "required"
}'
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python title="Python SDK Example" showLineNumbers
"""
Use LiteLLM Proxy MCP Gateway to call MCP tools.

When using LiteLLM Proxy, you can use the same MCP tools across all your LLM providers.
"""
import openai

client = openai.OpenAI(
    api_key="sk-1234", # paste your litellm proxy api key here
    base_url="http://localhost:4000" # paste your litellm proxy base url here
)
print("Making API request to Responses API with MCP tools")

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": "give me TLDR of what BerriAI/litellm repo is about",
            "type": "message"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    stream=True,
    tool_choice="required"
)

for chunk in response:
    print("response chunk: ", chunk)
```

</TabItem>
</Tabs>

#### MCP 도구 지정

`allowed_tools` 파라미터를 사용해 사용 가능한 MCP 도구를 지정할 수 있습니다. 이를 통해 MCP 서버 안의 특정 도구에 대한 접근만 허용할 수 있습니다.

LiteLLM MCP Gateway에서 허용할 도구 목록을 얻으려면 LiteLLM UI의 MCP Servers > MCP Tools로 이동한 뒤 도구를 클릭하고 Tool Name을 복사하세요.

<Tabs>
<TabItem value="curl" label="cURL">

```bash title="cURL Example with allowed_tools" showLineNumbers
curl --location 'http://localhost:4000/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer sk-1234" \
--data '{
    "model": "gpt-5",
    "input": [
    {
      "role": "user",
      "content": "give me TLDR of what BerriAI/litellm repo is about",
      "type": "message"
    }
  ],
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy/mcp",
            "require_approval": "never",
            "allowed_tools": ["GitMCP-fetch_litellm_documentation"]
        }
    ],
    "stream": true,
    "tool_choice": "required"
}'
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python title="Python SDK Example with allowed_tools" showLineNumbers
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": "give me TLDR of what BerriAI/litellm repo is about",
            "type": "message"
        }
    ],
    tools=[
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy/mcp",
            "require_approval": "never",
            "allowed_tools": ["GitMCP-fetch_litellm_documentation"]
        }
    ],
    stream=True,
    tool_choice="required"
)

print(response)
```

</TabItem>
</Tabs>

### Cursor IDE와 함께 사용

LiteLLM MCP를 사용해 Cursor IDE에서 도구를 직접 사용합니다:

**설정 지침:**

1. **Cursor Settings 열기**: `⇧+⌘+J`(Mac) 또는 `Ctrl+Shift+J`(Windows/Linux)를 사용합니다.
2. **MCP Tools로 이동**: "MCP Tools" 탭으로 이동한 뒤 "New MCP Server"를 클릭합니다.
3. **설정 추가**: 아래 JSON 설정을 복사해 붙여 넣고 `Cmd+S` 또는 `Ctrl+S`로 저장합니다.

```json title="Basic Cursor MCP Configuration" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "litellm_proxy",
      "headers": {
        "x-litellm-api-key": "Bearer $LITELLM_API_KEY"
      }
    }
  }
}
```

#### `server_url="litellm_proxy"`일 때의 동작 방식

`server_url="litellm_proxy"`이면 LiteLLM이 non-MCP provider와 MCP 도구 사이를 연결합니다.

- Tool Discovery: LiteLLM이 MCP 도구를 가져와 OpenAI 호환 정의로 변환합니다.
- LLM Call: 도구가 사용자 입력과 함께 LLM으로 전달되고, LLM이 호출할 도구를 선택합니다.
- Tool Execution: LiteLLM이 인자를 자동으로 파싱하고, 호출을 MCP 서버로 라우팅하고, 도구를 실행한 뒤 결과를 가져옵니다.
- Response Integration: 최종 응답 생성을 위해 도구 결과를 LLM으로 다시 전달합니다.
- Output: LLM 추론과 도구 실행 결과가 결합된 완성 응답입니다.

이를 통해 native MCP 지원 여부와 관계없이 LiteLLM이 지원하는 모든 provider에서 MCP 도구를 사용할 수 있습니다.

#### `require_approval: "never"`의 자동 실행

`require_approval: "never"`를 설정하면 도구가 자동으로 실행되며, 추가 사용자 상호작용 없이 단일 API 호출에서 최종 응답이 반환됩니다.
