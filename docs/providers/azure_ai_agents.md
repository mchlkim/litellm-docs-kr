import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Foundry Agents 사용하기 {#azure-ai-foundry-agents}

OpenAI 요청/응답 형식으로 Azure AI Foundry Agents를 호출합니다.

| 속성 | 상세 |
|----------|---------|
| 설명 | Azure AI Foundry Agents는 foundation model, tool, code interpreter로 agentic workflow를 실행할 수 있는 hosted agent runtime을 제공합니다. |
| LiteLLM provider route(경로) | `azure_ai/agents/{AGENT_ID}` |
| provider 문서 | [Azure AI Foundry Agents ↗](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/quickstart) |

## 인증

Azure AI Foundry Agents는 API key가 아니라 **Azure AD 인증**이 필요합니다. 다음 방식으로 인증할 수 있습니다.

### 옵션 1: Service Principal(production 권장) {#option-1-service-principal-production-recommended}

다음 환경 변수를 설정합니다.

```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

LiteLLM은 이 credential을 사용해 Azure AD token을 자동으로 가져옵니다.

### 옵션 2: Azure AD token(수동) {#option-2-azure-ad-token-manual}

`api_key`로 token을 직접 전달합니다.

```bash
# Get token via Azure CLI
az account get-access-token --resource "https://ai.azure.com" --query accessToken -o tsv
```

### 필요한 Azure role {#required-azure-role}

Service Principal 또는 user는 Azure AI Foundry project에서 **Azure AI Developer** 또는 **Azure AI User** role을 가져야 합니다.

Azure CLI로 할당하려면:
```bash
az role assignment create \
  --assignee-object-id "<service-principal-object-id>" \
  --assignee-principal-type "ServicePrincipal" \
  --role "Azure AI Developer" \
  --scope "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<resource>"
```

또는 **Azure AI Foundry Portal** → 대상 project → **Project users** → **+ New user**에서 추가합니다.

## 빠른 시작

### LiteLLM model 형식

LiteLLM을 통해 Azure AI Foundry Agent를 호출하려면 다음 model 형식을 사용합니다.

여기서 `model=azure_ai/agents/`는 LiteLLM에 Azure AI Foundry Agent Service API를 호출하라고 알려줍니다.

```shell showLineNumbers title="Model Format to LiteLLM"
azure_ai/agents/{AGENT_ID}
```

**예제:**
- `azure_ai/agents/asst_abc123`

Agent ID는 Azure AI Foundry portal의 Agents에서 찾을 수 있습니다.

### LiteLLM Python SDK

```python showLineNumbers title="Basic Agent Completion"
import litellm

# Make a completion request to your Azure AI Foundry Agent
# Uses AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET env vars for auth
response = litellm.completion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user", 
            "content": "Explain machine learning in simple terms"
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
)

print(response.choices[0].message.content)
print(f"Usage: {response.usage}")
```

```python showLineNumbers title="Streaming Agent Responses"
import litellm

# Stream responses from your Azure AI Foundry Agent
response = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user",
            "content": "What are the key principles of software architecture?"
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    stream=True,
)

async for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM Proxy

#### 1. config.yaml에 model 설정 {#1-set-model-in-configyaml}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: azure-agent-1
    litellm_params:
      model: azure_ai/agents/asst_abc123
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      # Service Principal auth (recommended)
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET

  - model_name: azure-agent-math-tutor
    litellm_params:
      model: azure_ai/agents/asst_def456
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      # Or pass Azure AD token directly
      api_key: os.environ/AZURE_AD_TOKEN
```

</TabItem>
</Tabs>

#### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

#### 3. Azure AI Foundry Agents로 요청 보내기 {#3-send-requests-to-azure-ai-foundry-agents}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Basic Agent Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "azure-agent-1",
    "messages": [
      {
        "role": "user", 
        "content": "Summarize the main benefits of cloud computing"
      }
    ]
  }'
```

```bash showLineNumbers title="Streaming Agent Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "azure-agent-math-tutor",
    "messages": [
      {
        "role": "user",
        "content": "What is 25 * 4?"
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

# Make a completion request to your Azure AI Foundry Agent
response = client.chat.completions.create(
    model="azure-agent-1",
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

# Stream Agent responses
stream = client.chat.completions.create(
    model="azure-agent-math-tutor",
    messages=[
      {
        "role": "user",
        "content": "Explain the Pythagorean theorem"
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

## 환경 변수 {#environment-variable}

| 변수 | 설명 |
|----------|-------------|
| `AZURE_TENANT_ID` | Service Principal 인증용 Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Service Principal의 application(client) ID |
| `AZURE_CLIENT_SECRET` | Service Principal의 client secret |

```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## 대화 연속성(thread management) {#thread-management}

Azure AI Foundry Agents는 thread를 사용해 conversation context를 유지합니다. LiteLLM이 thread를 자동으로 관리하지만, 기존 thread ID를 전달해 대화를 이어갈 수도 있습니다.

```python showLineNumbers title="Continuing a Conversation"
import litellm

# First message creates a new thread
response1 = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[{"role": "user", "content": "My name is Alice"}],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
)

# Get the thread_id from the response
thread_id = response1._hidden_params.get("thread_id")

# Continue the conversation using the same thread
response2 = await litellm.acompletion(
    model="azure_ai/agents/asst_abc123",
    messages=[{"role": "user", "content": "What's my name?"}],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    thread_id=thread_id,  # Pass the thread_id to continue conversation
)

print(response2.choices[0].message.content)  # Should mention "Alice"
```

## provider별 parameter {#provider-specific-parameters}

Azure AI Foundry Agents는 agent invocation을 custom하기 위한 추가 parameter를 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Using Agent-specific parameters"
from litellm import completion

response = litellm.completion(
    model="azure_ai/agents/asst_abc123",
    messages=[
        {
            "role": "user",
            "content": "Analyze this data and provide insights",
        }
    ],
    api_base="https://your-resource.services.ai.azure.com/api/projects/your-project",
    thread_id="thread_abc123",  # Optional: Continue existing conversation
    instructions="Be concise and focus on key insights",  # Optional: Override agent instructions
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml showLineNumbers title="LiteLLM Proxy Configuration with Parameters"
model_list:
  - model_name: azure-agent-analyst
    litellm_params:
      model: azure_ai/agents/asst_abc123
      api_base: https://your-resource.services.ai.azure.com/api/projects/your-project
      tenant_id: os.environ/AZURE_TENANT_ID
      client_id: os.environ/AZURE_CLIENT_ID
      client_secret: os.environ/AZURE_CLIENT_SECRET
      instructions: "Be concise and focus on key insights"
```

</TabItem>
</Tabs>

### 사용 가능한 parameter {#available-parameters}

| parameter | type | 설명 |
|-----------|------|-------------|
| `thread_id` | string | 기존 conversation을 이어가기 위한 선택적 thread ID |
| `instructions` | string | 이번 run에서 agent의 기본 instruction을 override하는 선택적 instruction |

## LiteLLM `A2A` Gateway 사용하기 {#litellm-a2a-gateway}

LiteLLM의 A2A Gateway UI를 통해 Azure AI Foundry Agents에 연결할 수도 있습니다. 코드 작성 없이 agent를 등록하고 테스트할 수 있는 시각적인 방식입니다.

### 1. Agents로 이동 {#1-navigate-to-agents}

sidebar에서 "Agents"를 클릭해 agent 관리 page를 열고, "+ Add New Agent"를 클릭합니다.

![새 agent 추가](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/f8efe335-a08a-4f2b-9f7f-de28e4d58b05/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=217,118)

### 2. Azure AI Foundry agent type 선택 {#2-select-azure-ai-foundry-agent-type}

"A2A Standard"를 클릭해 사용 가능한 agent type을 확인한 뒤 "Azure AI Foundry"를 선택합니다.

![A2A Standard 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/ede38044-3e18-43b9-afe3-b7513bf9963e/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=409,143)

![Azure AI Foundry 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/33c396fc-a927-4b03-8ee2-ea04950b12c1/ascreenshot.jpeg?tl_px=0,86&br_px=2201,1317&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=433,277)

### 3. agent 설정

다음 field를 입력합니다.

#### Agent Name {#agent-name}

읽기 쉬운 agent name을 입력합니다. caller는 이 이름을 사용 가능한 agent 이름으로 보게 됩니다.

![agent name 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/18c02804-7612-40c4-9ba4-3f1a4c0725d5/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

#### Agent ID {#agent-id}

Azure AI Foundry portal에서 Agent ID를 가져옵니다.

1. [https://ai.azure.com/](https://ai.azure.com/)으로 이동해 "Agents"를 클릭합니다.

![Azure agents](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/5e29fc48-c0f7-4b6d-8313-2063d1240d15/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=39,187)

2. 추가하려는 agent의 "ID"를 복사합니다(예: `asst_hbnoK9BOCcHhC3lC4MDroVGG`).

![Agent ID 복사](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/bf17dfec-a627-41c6-9121-3935e86d3700/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1463&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=504,241)

3. LiteLLM에 Agent ID를 붙여넣습니다. 이를 통해 LiteLLM은 Azure Foundry에서 어떤 agent를 호출할지 알 수 있습니다.

![Agent ID 붙여넣기](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/45230c28-54f6-441c-9a20-4ef8b74076e2/ascreenshot.jpeg?tl_px=0,97&br_px=2617,1560&force_format=jpeg&q=100&width=1120.0)

#### Azure AI API Base {#azure-ai-api-base}

Azure AI Foundry에서 API base URL을 가져옵니다.

1. [https://ai.azure.com/](https://ai.azure.com/)으로 이동해 "개요"를 클릭합니다.
2. libraries 아래에서 Microsoft Foundry를 선택합니다.
3. endpoint를 가져옵니다. `https://<domain>.services.ai.azure.com/api/projects/<project-name>` 형태여야 합니다.

![API base 가져오기](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/60e2c735-4480-44b7-ab12-d69f4200b12c/ascreenshot.jpeg?tl_px=0,40&br_px=2618,1503&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=278,277)

4. LiteLLM에 URL을 붙여넣습니다.

![API base 붙여넣기](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/e9c6f48e-7602-449a-9261-0df4a0a66876/ascreenshot.jpeg?tl_px=267,456&br_px=2468,1687&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,277)

#### 인증

인증을 위해 Azure AD credential을 추가합니다.
- **Azure Tenant ID** 값
- **Azure Client ID** 값
- **Azure Client Secret** 값

![인증 정보 추가](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/e5e2b636-cf2e-4283-a1cc-8d497d349243/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=339,405)

"Create Agent"를 클릭해 저장합니다.

![agent 생성](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/799a720a-639e-4217-a6f5-51687fc07611/ascreenshot.jpeg?tl_px=416,653&br_px=2618,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=693,519)

### 4. Playground에서 테스트 {#4-test-in-playground}

agent를 테스트하려면 sidebar의 "Playground"로 이동합니다.

![Playground로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/7da84247-db1c-4d55-9015-6e3d60ea63ce/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=63,106)

endpoint type을 `/v1/a2a/message/send`로 변경합니다.

![A2A endpoint 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/733265a8-412d-4eac-bc19-03436d7846c4/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=286,234)

### 5. agent 선택 후 message 보내기 {#5-select-agent-and-send-message}

dropdown에서 Azure AI Foundry agent를 선택하고 테스트 message를 보냅니다.

![agent 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/59a8e66e-6f82-42e3-ab48-78355464e6be/ascreenshot.jpeg?tl_px=0,28&br_px=2201,1259&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=269,277)

agent가 자신의 capability로 응답합니다. 이제 A2A protocol을 통해 Azure AI Foundry agent와 상호작용할 수 있습니다.

![agent 응답](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-14/a0aafb69-6c28-4977-8210-96f9de750cdf/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=487,272)

## 추가 자료

- [Azure AI Foundry Agents 문서](https://learn.microsoft.com/en-us/azure/ai-services/agents/)
- [Create Thread and Run API 참조](https://learn.microsoft.com/en-us/rest/api/aifoundry/aiagents/create-thread-and-run/create-thread-and-run)
- [A2A Agent Gateway 문서](../a2a.md)
- [A2A 비용 추적](../a2a_cost_tracking.md)
