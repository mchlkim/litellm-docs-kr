import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock AgentCore

OpenAI Request/Response 형식으로 Bedrock AgentCore를 호출합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Amazon Bedrock AgentCore는 파운데이션 모델로 에이전트형 워크플로를 실행하기 위한 호스팅된 agent runtimes에 직접 접근할 수 있게 합니다. |
| LiteLLM의 Provider Route | `bedrock/agentcore/{AGENT_RUNTIME_ARN}` |
| Provider 문서 | [AWS Bedrock AgentCore ↗](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agentcore_InvokeAgentRuntime.html) |

:::info

이 문서는 **AgentCore Agents**(agent runtimes)를 위한 문서입니다. LiteLLM에서 AgentCore MCP servers를 사용하려면 설정 방법은 [MCP AWS SigV4 Auth](https://docs.litellm.ai/docs/mcp_aws_sigv4) 가이드를 참고하세요.

:::

## 빠른 시작

### LiteLLM에 전달하는 Model Format {#model-format-to-litellm}

LiteLLM을 통해 bedrock agent runtime을 호출하려면 다음 model format을 사용합니다.

여기서 `model=bedrock/agentcore/`는 LiteLLM에 bedrock `InvokeAgentRuntime` API를 호출하라고 지시합니다.

```shell showLineNumbers title="Model Format to LiteLLM"
bedrock/agentcore/{AGENT_RUNTIME_ARN}
```

**예제:**
- `bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime`

Agent Runtime ARN은 AWS Bedrock 콘솔의 AgentCore에서 확인할 수 있습니다.

### LiteLLM Python SDK

```python showLineNumbers title="Basic AgentCore Completion"
import litellm

# Make a completion request to your AgentCore runtime
response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user", 
            "content": "Explain machine learning in simple terms"
        }
    ],
)

print(response.choices[0].message.content)
print(f"Usage: {response.usage}")
```

```python showLineNumbers title="Streaming AgentCore Responses"
import litellm

# Stream responses from your AgentCore runtime
response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user",
            "content": "What are the key principles of software architecture?"
        }
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM Proxy

#### 1. config.yaml에서 모델 구성 {#1-configure-your-model-in-configyaml}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: agentcore-runtime-1
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2

  - model_name: agentcore-runtime-2
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-east-1:987654321098:runtime/production-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

</TabItem>
</Tabs>

#### 2. LiteLLM Proxy 시작 {#2-start-the-litellm-proxy}

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

#### 3. AgentCore runtimes에 요청 보내기 {#3-make-requests-to-your-agentcore-runtimes}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Basic AgentCore Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "agentcore-runtime-1",
    "messages": [
      {
        "role": "user", 
        "content": "Summarize the main benefits of cloud computing"
      }
    ]
  }'
```

```bash showLineNumbers title="Streaming AgentCore Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "agentcore-runtime-2",
    "messages": [
      {
        "role": "user",
        "content": "Explain the differences between SQL and NoSQL databases"
      }
    ],
    "stream": true
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Using OpenAI SDK with LiteLLM Proxy"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Make a completion request to your AgentCore runtime
response = client.chat.completions.create(
    model="agentcore-runtime-1",
    messages=[
      {
        "role": "user",
        "content": "What are best practices for API design?"
      }
    ]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Streaming with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000", 
    api_key="your-litellm-api-key"
)

# Stream AgentCore responses
stream = client.chat.completions.create(
    model="agentcore-runtime-2",
    messages=[
      {
        "role": "user",
        "content": "Describe the microservices architecture pattern"
      }
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
</Tabs>

## Provider별 Parameters {#provider-specific-parameters}

AgentCore는 runtime invocation을 맞춤 설정하기 위해 전달할 수 있는 추가 parameters를 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Using AgentCore-specific parameters"
from litellm import completion

response = litellm.completion(
    model="bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime",
    messages=[
        {
            "role": "user",
            "content": "Analyze this data and provide insights",
        }
    ],
    qualifier="production",  # PROVIDER-SPECIFIC: Runtime qualifier/version
    runtimeSessionId="session-abc-123",  # PROVIDER-SPECIFIC: Custom session ID
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml showLineNumbers title="LiteLLM Proxy Configuration with Parameters"
model_list:
  - model_name: agentcore-runtime-prod
    litellm_params:
      model: bedrock/agentcore/arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/my-agent-runtime
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
      qualifier: production
```

</TabItem>
</Tabs>

### 사용 가능한 Parameters {#available-parameters}

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `qualifier` | string | agent runtime의 특정 버전을 호출하기 위한 선택적 runtime qualifier/version |
| `runtimeSessionId` | string | 선택적 custom session ID(33자 이상이어야 함). 제공하지 않으면 LiteLLM이 자동으로 생성합니다 |

## 추가 자료 {#further-reading}

- [AWS Bedrock AgentCore 문서](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agentcore_InvokeAgentRuntime.html)
- [LiteLLM 인증 to Bedrock](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
