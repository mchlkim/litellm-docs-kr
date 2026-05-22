import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Claude Code에서 MCP 사용하기

이 튜토리얼에서는 LiteLLM Proxy를 통해 MCP 서버를 Claude Code에 연결하는 방법을 설명합니다.

참고: LiteLLM은 MCP 서버용 OAuth도 지원합니다. [자세히 알아보기](https://docs.litellm.ai/docs/mcp#mcp-oauth)

## MCP 서버 연결하기

LiteLLM Proxy를 통해 MCP 서버를 Claude Code에 연결할 수 있습니다.


1. MCP 서버를 `config.yaml`에 추가합니다

<Tabs>
<TabItem value="github" label="GitHub MCP">

이 예시에서는 GitHub MCP 서버를 `config.yaml`에 추가합니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    transport: "http"
    auth_type: oauth2
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
```

</TabItem>
<TabItem value="atlassian" label="Atlassian MCP">

이 예시에서는 Atlassian MCP 서버를 `config.yaml`에 추가합니다.

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  atlassian_mcp:
    url: "https://mcp.atlassian.com/v1/mcp"
    transport: "http"
    auth_type: oauth2
```

</TabItem>
</Tabs>

:::important
`mcp_servers:` 아래의 서버 이름(예: `atlassian_mcp`, `github_mcp`)은 Claude Code URL 경로(`/mcp/<server_name>`)에 사용하는 이름과 **반드시 일치해야 합니다**. 일치하지 않으면 OAuth 중 404 오류가 발생합니다.
:::

2. LiteLLM Proxy를 시작합니다

Claude Code에는 OAuth 콜백을 위한 공개 접근 가능 URL이 필요하므로, ngrok 또는 유사한 도구로 프록시를 외부에 노출합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

```bash
# 별도 터미널에서 OAuth 콜백용 프록시 노출
ngrok http 4000
```

3. MCP 서버를 Claude Code에 추가합니다

<Tabs>
<TabItem value="github" label="GitHub MCP">

```bash
claude mcp add --transport http litellm-github https://your-ngrok-url.ngrok-free.dev/mcp/github_mcp \
  --header "x-litellm-api-key: Bearer sk-1234"
```

</TabItem>
<TabItem value="atlassian" label="Atlassian MCP">

```bash
claude mcp add --transport http litellm-atlassian https://your-ngrok-url.ngrok-free.dev/mcp/atlassian_mcp \
  --header "x-litellm-api-key: Bearer sk-1234"
```

</TabItem>
</Tabs>

**파라미터 설명:**

| 파라미터 | 설명 |
|-----------|-------------|
| `--transport http` | MCP 연결에 HTTP transport를 사용합니다 |
| `litellm-atlassian` | **Claude Code에서** 이 MCP 서버에 붙일 이름입니다. 원하는 값으로 지정할 수 있습니다 |
| `https://your-ngrok-url.ngrok-free.dev/mcp/atlassian_mcp` | LiteLLM proxy URL입니다. 형식: `<PROXY_URL>/mcp/<server_name_on_litellm>`. `atlassian_mcp` 부분은 LiteLLM proxy config의 `mcp_servers:` 아래 키와 **반드시 일치해야 합니다** |
| `--header "x-litellm-api-key: Bearer sk-1234"` | 프록시에 인증할 때 사용하는 LiteLLM virtual key입니다 |

`claude mcp add`를 사용하는 대신 MCP 서버를 `~/.claude.json` 파일에 직접 추가할 수도 있습니다. [Claude Code 문서 보기](https://docs.anthropic.com/en/docs/claude-code/mcp).

:::note
Atlassian처럼 OAuth가 필요한 MCP 서버의 경우 LiteLLM virtual key에는 `Authorization` 대신 `x-litellm-api-key`를 사용합니다. `Authorization` 헤더는 OAuth 흐름용으로 예약되어 있습니다.
:::

4. Claude Code를 통해 인증합니다

a. Claude Code를 시작합니다

```bash
claude
```

b. MCP 메뉴를 엽니다

```bash
/mcp
```

c. MCP 서버를 선택합니다(예: `litellm-atlassian`)

d. OAuth 흐름을 시작합니다

```bash
> 1. Authenticate
 2. Reconnect
 3. Disable
```

e. 완료되면 다음 성공 메시지가 표시됩니다.

<img src={require('../../img/oauth_2_success.png').default} alt="OAuth 2.0 성공" style={{ width: '500px', height: 'auto' }} />
