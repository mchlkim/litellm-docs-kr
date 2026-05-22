import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP - AWS SigV4 인증

[AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/latest/userguide/agentcore.html)에 호스팅된 MCP 서버에 LiteLLM을 연결할 때 AWS SigV4 인증을 사용합니다.

## SigV4를 사용하는 이유

AWS service는 [Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)를 사용해 요청을 인증합니다. 이는 요청 본문까지 암호화 서명에 포함하는 요청별 signing protocol입니다. 모든 요청에 같은 header를 보내는 static-header 인증 방식(`api_key`, `bearer_token` 등)과 근본적으로 다릅니다.

LiteLLM의 `aws_sigv4` 인증 타입은 이 과정을 자동으로 처리합니다. 전송되는 모든 MCP 요청은 보내기 전에 AWS 자격 증명으로 서명됩니다.

## 빠른 시작

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

1. **MCP Servers**로 이동하고 **Add New MCP Server**를 클릭합니다.
2. transport를 **Streamable HTTP**로 설정합니다.
3. authentication type으로 **AWS SigV4**를 선택합니다.
4. AWS 자격 증명을 입력합니다.

<Image
  img={require('../img/mcp_aws_sigv4_ui.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>

| 필드 | 필수 | 설명 |
|-------|----------|-------------|
| **AWS Region** | 예 | SigV4 signing에 사용할 AWS region(예: `us-east-1`) |
| **AWS Service Name** | 아니요 | 기본값은 `bedrock-agentcore` |
| **AWS Access Key ID** | 아니요 | 비워 두면 boto3 credential chain으로 fallback |
| **AWS Secret Access Key** | 아니요 | Access Key ID를 제공한 경우 필수 |
| **AWS Session Token** | 아니요 | 임시 STS 자격 증명을 사용할 때만 필요 |
| **AWS Role ARN** | 아니요 | STS AssumeRole용 IAM role ARN(예: `arn:aws:iam::123456789012:role/MyRole`). 설정하면 LiteLLM이 signing 전에 이 role을 assume합니다. |
| **AWS Session Name** | 아니요 | AssumeRole 호출의 session name입니다. CloudTrail에 표시되며, 생략하면 자동 생성됩니다. |

생성 후 LiteLLM은 모든 outgoing MCP 요청을 SigV4로 서명합니다. 서버의 tool은 MCP Tools 목록에 자동으로 표시됩니다.

**자격 증명 편집:** 기존 SigV4 서버를 편집할 때 현재 값을 유지하려면 credential 필드를 비워 둡니다. 입력한 필드만 업데이트됩니다.

</TabItem>
<TabItem value="config" label="config.yaml">

### 1. AWS 자격 증명 설정

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION_NAME="us-east-1"
```

### 2. AgentCore MCP 서버를 config.yaml에 추가

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN          # IAM role to assume (recommended)
    aws_session_name: "litellm-prod"                 # optional — for CloudTrail auditing
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

:::info URL encoding

AgentCore runtime ARN은 `url` 필드에서 URL-encode되어야 합니다. 예:

```
arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/my-mcp-server
```

다음과 같이 변환됩니다.

```
arn%3Aaws%3Abedrock-agentcore%3Aus-east-1%3A123456789012%3Aruntime%2Fmy-mcp-server
```

:::

### 3. 프록시 시작

```bash
litellm --config config.yaml
```

</TabItem>
</Tabs>

## MCP tool 사용

설정이 완료되면 AgentCore MCP tool을 다른 MCP 서버와 동일하게 LiteLLM을 통해 사용할 수 있습니다.

```bash title="List available tools"
curl http://localhost:4000/mcp-rest/tools/list \
  -H "Authorization: Bearer sk-1234"
```

```bash title="Call a tool"
curl http://localhost:4000/mcp-rest/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "name": "my_agentcore_mcp_your_tool_name",
    "arguments": {"key": "value"}
  }'
```

## 설정 참조

| 필드 | 필수 | 설명 |
|-------|----------|-------------|
| `url` | 예 | AgentCore MCP server URL(URL-encoded ARN 포함) |
| `transport` | 예 | 반드시 `"http"`여야 함 |
| `auth_type` | 예 | 반드시 `"aws_sigv4"`여야 함 |
| `aws_access_key_id` | 아니요 | AWS access key. `os.environ/VAR_NAME`을 지원하며, 생략하면 boto3 credential chain으로 fallback |
| `aws_secret_access_key` | 아니요 | AWS secret key. `os.environ/VAR_NAME`을 지원하며, 생략하면 boto3 credential chain으로 fallback |
| `aws_region_name` | 예 | AWS region(예: `us-east-1`) |
| `aws_service_name` | 아니요 | signing에 사용할 AWS service name. 기본값은 `bedrock-agentcore` |
| `aws_session_token` | 아니요 | 임시 자격 증명용 AWS session token. `os.environ/VAR_NAME` 지원 |
| `aws_role_name` | 아니요 | STS AssumeRole용 IAM role ARN. `os.environ/VAR_NAME` 지원. 설정하면 LiteLLM이 signing 전에 `sts:AssumeRole`을 호출해 임시 자격 증명을 가져옵니다. |
| `aws_session_name` | 아니요 | AssumeRole 호출의 session name(CloudTrail에 표시). 생략하면 자동 생성됩니다. `os.environ/VAR_NAME` 지원 |

## 작동 방식

LiteLLM은 HTTP 요청 lifecycle에 연결되는 `httpx.Auth` subclass(`MCPSigV4Auth`)를 사용합니다.

1. 모든 outgoing MCP 요청에 대해 auth handler가 요청 본문의 SHA-256 hash를 계산합니다.
2. AWS 자격 증명, 요청 URL, header, body hash를 사용해 SigV4 signature를 생성합니다.
3. 서명된 `Authorization` 및 `x-amz-date` header를 요청에 추가합니다.
4. AWS가 signature를 검증하고 MCP 요청을 처리합니다.

이 과정은 투명하게 처리되므로 수동 token 관리가 필요하지 않습니다.

## 임시 자격 증명 사용(STS)

AWS STS 임시 자격 증명(예: IAM role 또는 SSO 기반)을 사용한다면 session token을 포함합니다.

```yaml title="config.yaml with STS credentials" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_session_token: os.environ/AWS_SESSION_TOKEN
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

## IAM Role Assumption 사용(AssumeRole)

LiteLLM instance가 IAM role(예: EKS pod role, EC2 instance profile)로 인증하는 production 환경에서는 `aws_role_name`을 설정해 LiteLLM이 MCP 요청을 signing하기 전에 `sts:AssumeRole`을 호출하도록 할 수 있습니다.

```yaml title="config.yaml with AssumeRole" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: "arn:aws:iam::123456789012:role/BedrockAgentCoreRole"
    aws_session_name: "litellm-prod"    # optional
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

LiteLLM은 주변 자격 증명(pod role, instance profile, env var)을 사용해 `sts:AssumeRole`을 호출한 뒤, assume한 role의 임시 자격 증명으로 MCP 요청을 signing합니다.

`aws_role_name`을 명시적 access key와 함께 사용할 수도 있습니다. 이 경우 해당 key가 AssumeRole 호출의 source identity로 사용됩니다.

```yaml title="config.yaml with AssumeRole + explicit source keys" showLineNumbers
mcp_servers:
  my_agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_region_name: "us-east-1"
```

:::tip
대부분의 Kubernetes 배포에서는 `aws_role_name`과 `aws_region_name`만 필요합니다. pod의 IAM role이 source credential을 자동으로 제공합니다.
:::

## 문제 해결

### AWS에서 403 Forbidden 발생

- AWS 자격 증명이 유효하고 만료되지 않았는지 확인합니다.
- `aws_region_name`이 AgentCore URL의 region과 일치하는지 확인합니다.
- `aws_service_name`이 `bedrock-agentcore`로 설정되어 있는지 확인합니다.
- STS 자격 증명을 사용한다면 `aws_session_token`이 설정되어 있고 만료되지 않았는지 확인합니다.

### AssumeRole 사용 시 AccessDenied

`aws_role_name` 사용 시 `AccessDenied`가 발생하면 다음을 확인합니다.

- role ARN이 올바른지 확인합니다.
- 대상 role의 trust policy가 source identity의 assume을 허용하는지 확인합니다.
- EKS에서 실행 중이라면 pod의 service account에 올바른 IAM role annotation이 있는지 확인합니다.
- CloudTrail에서 실패한 `sts:AssumeRole` 호출을 확인해 정확한 오류를 봅니다.

### 시작 시 Health check 오류

SigV4로 인증되는 MCP 서버는 proxy 시작 시 표준 health check를 건너뜁니다. 이는 정상 동작입니다. tool이 호출될 때 proxy는 요청을 정상적으로 signing합니다.

### "botocore not found" 오류

`botocore` 패키지를 설치합니다.

```bash
uv add botocore
```

`botocore`는 SigV4 credential 처리에 사용되며 `aws_sigv4` 인증을 사용할 때 필요합니다.
