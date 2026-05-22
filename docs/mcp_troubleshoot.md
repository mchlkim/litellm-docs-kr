import Image from '@theme/IdealImage';

# MCP 문제 해결 가이드

LiteLLM이 MCP 프록시로 동작할 때 트래픽은 일반적으로 `Client → LiteLLM Proxy → MCP Server` 순서로 흐르며, OAuth가 활성화된 구성에서는 메타데이터 검색을 위한 authorization server가 추가됩니다.

프로비저닝 단계, transport 옵션, 구성 필드는 [mcp.md](./mcp.md)를 참고하세요.

## 빠른 시작: 한 명령으로 디버그하기

MCP 문제를 디버그하는 가장 빠른 방법은 **debug headers**를 활성화하는 것입니다. LiteLLM 프록시에 대해 아래 curl을 실행한 뒤 응답 헤더를 확인하세요.

```bash
curl -si -X POST http://localhost:4000/{your_mcp_server}/mcp \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-YOUR_KEY" \
  -H "x-litellm-mcp-debug: true" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  2>&1 | grep -i "x-mcp-debug"
```

이 명령은 authentication에서 실제로 어떤 일이 일어나는지 보여 주는 마스킹된 진단 헤더를 반환합니다.

```
x-mcp-debug-inbound-auth: x-litellm-api-key=Bearer****1234
x-mcp-debug-oauth2-token: Bearer****ef01
x-mcp-debug-auth-resolution: oauth2-passthrough
x-mcp-debug-outbound-url: https://mcp.atlassian.com/v1/mcp
x-mcp-debug-server-auth-type: oauth2
```

`x-mcp-debug-oauth2-token`에 `SAME_AS_LITELLM_KEY`가 보이면 OAuth2 token 대신 LiteLLM API key가 MCP server로 유출되고 있는 것입니다. 수정 방법과 다른 일반적인 문제는 [OAuth 디버깅](./mcp_oauth#debugging-oauth)을 참고하세요.

Claude Code에서는 MCP config에 debug header를 추가하세요.

```bash
claude mcp add --transport http my_server http://localhost:4000/my_mcp/mcp \
  --header "x-litellm-api-key: Bearer sk-..." \
  --header "x-litellm-mcp-debug: true"
```

## 오류 발생 지점 찾기

설정을 조정하기 전에 실패가 발생한 위치를 먼저 좁혀야 서로 다른 hop의 증상을 섞어 보지 않을 수 있습니다.

### LiteLLM UI / Playground 오류 (LiteLLM → MCP)
MCP 생성 form이나 MCP Tool Testing Playground에 표시되는 실패는 LiteLLM proxy가 MCP server에 도달하지 못한다는 뜻입니다. 일반적인 원인은 잘못된 구성(transport, headers, credentials), MCP/server 장애, network/firewall 차단, 접근할 수 없는 OAuth metadata입니다.

<Image
  img={require('../img/mcp_tool_testing_playground.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

**조치**
- request/response 쌍과 stack trace를 확인할 수 있도록 LiteLLM proxy logs와 MCP-server logs를 함께 수집하세요([Error Log 예제](./mcp_troubleshoot#error-log-example-failed-mcp-call) 참고).
- 기본 connectivity를 확인하려면 LiteLLM server에서 MCP endpoint를 대상으로 [`curl` 스모크 테스트](./mcp_troubleshoot#curl-smoke-test)를 실행하세요.

### Client 트래픽 문제 (Client → LiteLLM)
실제 client 요청만 실패한다면 LiteLLM이 MCP hop까지 도달했는지 확인하세요.

#### MCP Protocol 세션
IDE나 agent runtime 같은 client는 LiteLLM과 직접 MCP protocol로 통신합니다.

**조치**
- client 요청이 proxy에 도달했는지, 어떤 MCP server를 대상으로 했는지 확인하려면 LiteLLM access logs를 살펴보세요([Access Log 예제](./mcp_troubleshoot#access-log-example-successful-mcp-call) 참고).
- MCP call이 시작되기 전에 요청을 막는 TLS, authentication, routing 오류가 있는지 LiteLLM error logs를 검토하세요([Error Log 예제](./mcp_troubleshoot#error-log-example-failed-mcp-call) 참고).
- 실패하는 client 외부에서 MCP server에 도달할 수 있는지 [MCP Inspector](./mcp_troubleshoot#mcp-inspector)로 확인하세요.

#### MCP Call이 포함된 Responses/Completions
`/responses` 또는 `/chat/completions` 처리 중 LiteLLM이 요청 중간에 MCP tool call을 트리거할 수 있습니다. 오류는 MCP call이 시작되기 전이나 MCP가 응답한 뒤에 발생할 수 있습니다.

**조치**
- MCP 시도가 기록되었는지 LiteLLM request logs에서 확인하세요([Access Log 예제](./mcp_troubleshoot#access-log-example-successful-mcp-call) 참고). 기록이 없다면 문제는 `Client → LiteLLM` 구간에 있습니다.
- server가 응답하는지 확인하려면 [MCP Inspector](./mcp_troubleshoot#mcp-inspector)로 MCP connectivity를 검증하세요.
- LiteLLM이 MCP hop을 독립적으로 완료할 수 있는지 확인하려면 LiteLLM Playground에서 같은 MCP call을 재현하세요.

<Image
  img={require('../img/mcp_playground.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

### OAuth Metadata 검색
LiteLLM은 MCP spec([section 2.3](https://modelcontextprotocol.info/specification/draft/basic/authorization/#23-server-metadata-discovery))에 따라 metadata discovery를 수행합니다. OAuth가 활성화된 경우 authorization server가 metadata URL을 노출하고 LiteLLM이 이를 가져올 수 있는지 확인하세요.

**조치**
- LiteLLM host에서 `curl <metadata_url>` 또는 유사한 명령을 사용해 discovery document에 도달할 수 있고 예상한 authorization/token endpoints가 포함되어 있는지 확인하세요.
- support가 필요할 때 discovery 단계를 재현할 수 있도록 정확한 metadata URL, requested scopes, static client credentials를 기록하세요.

## OAuth 디버깅

debug header reference, 일반적인 misconfiguration, example output을 포함한 자세한 OAuth2 디버깅 내용은 [OAuth 디버깅](./mcp_oauth#debugging-oauth)을 참고하세요.

## Connectivity 검증

production traffic에 영향을 주기 전에 가벼운 검증을 먼저 실행하세요.

<a id="mcp-inspector"></a>
### MCP Inspector
`Client → LiteLLM`과 `Client → MCP` 통신을 한곳에서 모두 테스트해야 할 때 MCP Inspector를 사용하세요. 실패한 hop을 분리하기 쉬워집니다.

1. workstation에서 `npx @modelcontextprotocol/inspector`를 실행합니다.
2. 구성한 뒤 연결합니다.
   - **Transport Type:** client가 사용하는 transport를 선택합니다(LiteLLM의 경우 Streamable HTTP).
   - **URL:** 테스트 대상 endpoint입니다(`Client → LiteLLM`의 경우 LiteLLM MCP URL, `Client → MCP`의 경우 MCP server URL).
   - **Custom Headers:** 예: `x-litellm-api-key: Bearer <LiteLLM API Key>`.
3. **Tools** 탭을 열고 **List Tools**를 클릭해 MCP alias가 응답하는지 확인합니다.

<a id="curl-smoke-test"></a>
### `curl` 스모크 테스트
Inspector 설치가 현실적이지 않은 server에서는 `curl`이 적합합니다. LiteLLM이 수행할 MCP tool call을 재현합니다. 테스트 대상 system(LiteLLM 또는 MCP server)의 domain으로 바꿔 넣으세요.

```bash
curl -X POST https://your-target-domain.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

대상이 authentication을 요구하는 LiteLLM endpoint라면 `-H "x-litellm-api-key: Bearer <LiteLLM API Key>"`를 추가하세요. 다른 MCP methods를 대상으로 하려면 headers 또는 payload를 조정하세요. `curl`과 LiteLLM에서 같은 실패가 나타나면 MCP server 또는 network/OAuth layer가 원인임을 확인할 수 있습니다.

## 로그 검토

범위가 잘 잡힌 logs는 LiteLLM이 MCP server에 도달했는지와 그다음에 무슨 일이 일어났는지를 명확히 보여 줍니다.

<a id="access-log-example-successful-mcp-call"></a>
### Access Log 예제 (성공한 MCP call)
```text
INFO:     127.0.0.1:57230 - "POST /everything/mcp HTTP/1.1" 200 OK
```

<a id="error-log-example-failed-mcp-call"></a>
### Error Log 예제 (실패한 MCP call)
```text
07:22:00 - LiteLLM:ERROR: client.py:224 - MCP client list_tools failed - Error Type: ExceptionGroup, Error: unhandled errors in a TaskGroup (1 sub-exception), Server: http://localhost:3001/mcp, Transport: MCPTransport.http
  httpcore.ConnectError: All connection attempts failed
ERROR:LiteLLM:MCP client list_tools failed - Error Type: ExceptionGroup, Error: unhandled errors in a TaskGroup (1 sub-exception)...
  httpx.ConnectError: All connection attempts failed
```
