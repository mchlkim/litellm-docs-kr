import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock Agents

OpenAI request/response 형식으로 Bedrock Agents를 호출합니다.


| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Amazon Bedrock Agents는 foundation model(FM), API, data의 reasoning을 사용해 user request를 세분화하고, 관련 정보를 수집하며, task를 효율적으로 완료합니다. |
| LiteLLM provider 경로 | `bedrock/agent/{AGENT_ID}/{ALIAS_ID}` |
| Provider 문서 | [AWS Bedrock Agents ↗](https://aws.amazon.com/bedrock/agents/) |

## 빠른 시작

### LiteLLM model 형식 {#model-format-to-litellm}

LiteLLM을 통해 Bedrock agent를 호출하려면 다음 model 형식을 사용합니다.

여기서 `model=bedrock/agent/`는 LiteLLM이 Bedrock `InvokeAgent` API를 호출하도록 지정합니다.

```shell showLineNumbers title="Model Format to LiteLLM"
bedrock/agent/{AGENT_ID}/{ALIAS_ID}
```

**예제:**
- `bedrock/agent/L1RT58GYRW/MFPSBCXYTW`
- `bedrock/agent/ABCD1234/LIVE`

이 ID는 AWS Bedrock console의 Agents에서 확인할 수 있습니다.


### LiteLLM Python SDK

```python showLineNumbers title="Basic Agent Completion"
import litellm

# Make a completion request to your Bedrock Agent
response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",  # agent/{AGENT_ID}/{ALIAS_ID}
    messages=[
        {
            "role": "user", 
            "content": "Hi, I need help with analyzing our Q3 sales data and generating a summary report"
        }
    ],
)

print(response.choices[0].message.content)
print(f"Response cost: ${response._hidden_params['response_cost']}")
```

```python showLineNumbers title="Streaming Agent Responses"
import litellm

# Stream responses from your Bedrock Agent
response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",
    messages=[
        {
            "role": "user",
            "content": "Can you help me plan a marketing campaign and provide step-by-step execution details?"
        }
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```


### LiteLLM Proxy

#### 1. config.yaml에 model 구성 {#configure-your-model-in-configyaml}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: bedrock-agent-1
    litellm_params:
      model: bedrock/agent/L1RT58GYRW/MFPSBCXYTW
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2

  - model_name: bedrock-agent-2  
    litellm_params:
      model: bedrock/agent/AGENT456/ALIAS789
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

</TabItem>
</Tabs>

#### 2. LiteLLM Proxy 시작 {#start-the-litellm-proxy}

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

#### 3. Bedrock Agents에 request 전송 {#make-requests-to-your-bedrock-agents}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Basic Agent Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "bedrock-agent-1",
    "messages": [
      {
        "role": "user", 
        "content": "Analyze our customer data and suggest retention strategies"
      }
    ]
  }'
```

```bash showLineNumbers title="Streaming Agent Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "bedrock-agent-2",
    "messages": [
      {
        "role": "user",
        "content": "Create a comprehensive social media strategy for our new product"
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

# Make a completion request to your agent
response = client.chat.completions.create(
    model="bedrock-agent-1",
    messages=[
      {
        "role": "user",
        "content": "Help me prepare for the quarterly business review meeting"
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

# Stream agent responses
stream = client.chat.completions.create(
    model="bedrock-agent-2",
    messages=[
      {
        "role": "user",
        "content": "Walk me through launching a new feature beta program"
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

## Provider별 parameter {#provider-specific-parameters}

OpenAI parameter가 아닌 값은 custom parameter로 agent에 전달됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Using custom parameters"
from litellm import completion

response = litellm.completion(
    model="bedrock/agent/L1RT58GYRW/MFPSBCXYTW",
    messages=[
        {
            "role": "user",
            "content": "Hi who is ishaan cto of litellm, tell me 10 things about him",
        }
    ],
    invocationId="my-test-invocation-id", # PROVIDER-SPECIFIC VALUE
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: bedrock-agent-1
    litellm_params:
      model: bedrock/agent/L1RT58GYRW/MFPSBCXYTW
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
      invocationId: my-test-invocation-id
```

</TabItem>
</Tabs>





## 추가 자료 {#further-reading}

- [AWS Bedrock Agents 문서](https://aws.amazon.com/bedrock/agents/)
- [LiteLLM 인증 to Bedrock](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
