import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 에이전트 게이트웨이(A2A Protocol) 개요 {#agent-gatewaya2a-protocol}

LiteLLM AI Gateway에 A2A 에이전트를 추가하고, A2A Protocol로 에이전트를 호출하며, LiteLLM 로그에서 요청/응답 로그를 추적합니다. 등록된 에이전트에 어떤 팀과 키가 접근할 수 있는지도 관리할 수 있습니다.

<Image 
  img={require('../img/a2a_gateway.png')}
  style={{width: '80%', display: 'block', margin: '0', borderRadius: '8px'}}
/>

<br />
<br />

| 기능 | 지원 여부 |
|---------|-----------|
| 지원 에이전트 제공자 | `A2A`, `Vertex AI Agent Engine`, `LangGraph`, `Azure AI Foundry`, `Bedrock AgentCore`, `Pydantic AI` |
| 로깅 | ✅ |
| 로드 밸런싱 | ✅ |
| 스트리밍 | ✅ |
| [반복 예산](a2a_iteration_budgets) | ✅ |


:::tip

LiteLLM은 에이전트 호출에 [A2A(Agent-to-Agent) Protocol](https://github.com/google/A2A)을 따릅니다.

:::

## 에이전트 추가 {#agent-addition}

### A2A 에이전트 추가 {#a2a-agent}

LiteLLM 관리자 UI에서 A2A 호환 에이전트를 추가할 수 있습니다.

1. **Agents** 탭으로 이동합니다.
2. **Add Agent**를 클릭합니다.
3. 에이전트 이름(예: `ij-local`)과 A2A 에이전트 URL을 입력합니다.

<Image 
  img={require('../img/add_agent_1.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

URL은 A2A 에이전트의 호출 URL이어야 합니다(예: `http://localhost:10001`).


### Azure AI Foundry 에이전트 추가 {#azure-ai-foundry-agent}

[이 가이드](/litellm-docs-kr/docs/providers/azure_ai_agents#litellm-a2a-gateway)에 따라 Azure AI Foundry 에이전트를 LiteLLM Agent Gateway에 추가하세요.

### Vertex AI Agent Engine 추가 {#vertex-ai-agent-engine}

[이 가이드](./providers/vertex_ai_agent_engine)에 따라 Vertex AI Agent Engine을 LiteLLM Agent Gateway에 추가하세요.

### Bedrock AgentCore 에이전트 추가 {#bedrock-agentcore-agent}

[이 가이드](/litellm-docs-kr/docs/providers/bedrock_agentcore#litellm-a2a-gateway)에 따라 Bedrock AgentCore 에이전트를 LiteLLM Agent Gateway에 추가하세요.

### LangGraph 에이전트 추가 {#langgraph-agent}

[이 가이드](/litellm-docs-kr/docs/providers/langgraph#litellm-a2a-gateway)에 따라 LangGraph 에이전트를 LiteLLM Agent Gateway에 추가하세요.

### Pydantic AI 에이전트 추가 {#pydantic-ai-agent}

[이 가이드](/litellm-docs-kr/docs/providers/pydantic_ai_agent#litellm-a2a-gateway)에 따라 Pydantic AI 에이전트를 LiteLLM Agent Gateway에 추가하세요.

## 에이전트 호출 {#agent-invocation}

[A2A 에이전트 호출](./a2a_invoking_agents) 가이드에서 다음 방식으로 에이전트를 호출하는 방법을 확인하세요.
- **A2A SDK** - task와 artifact를 완전히 지원하는 네이티브 A2A protocol
- **OpenAI SDK** - `a2a/` model prefix를 사용하는 익숙한 `/chat/completions` 인터페이스

## 에이전트 로그 추적 {#agent-log-tracking}

에이전트를 호출한 뒤 LiteLLM **로그** 탭에서 요청 로그를 확인할 수 있습니다.

로그에는 다음 정보가 표시됩니다.
- 에이전트로 보내고 받은 **요청/응답 내용**
- 요청자를 추적하기 위한 **user, key, team** 정보
- **latency 및 cost** 지표

<Image 
  img={require('../img/agent2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


## LiteLLM 컨텍스트 헤더 전달

LiteLLM이 A2A 에이전트를 호출할 때 다음 기능을 가능하게 하는 특별한 헤더를 보냅니다.
- **trace grouping**: 같은 에이전트 실행에서 발생한 모든 LLM 호출이 하나의 trace 아래에 표시됩니다.
- **에이전트 비용 추적**: 비용이 특정 에이전트에 귀속됩니다.

| 헤더 | 목적 |
|--------|---------|
| `X-LiteLLM-Trace-Id` | 모든 LLM 호출을 같은 실행 흐름에 연결 |
| `X-LiteLLM-Agent-Id` | 지출을 올바른 에이전트에 귀속 |


이 기능을 활성화하려면 A2A 서버가 LiteLLM으로 다시 보내는 모든 LLM 호출에 대해 **이 헤더들을 전달**해야 합니다.

### 구현 단계

**1단계: 들어오는 A2A 요청에서 헤더 추출**
```python def get_litellm_headers(request) -> dict:
    """Extract X-LiteLLM-* headers from incoming A2A request."""
    all_headers = request.call_context.state.get('headers', {})
    return {
        k: v for k, v in all_headers.items() 
        if k.lower().startswith('x-litellm-')
    }
```

**2단계: LLM 호출에 헤더 전달**
LiteLLM으로 다시 호출할 때 추출한 헤더를 전달합니다.
<Tabs>
<TabItem value="openai" label="OpenAI SDK" default>

```python from openai import OpenAI

headers = get_litellm_headers(request)

client = OpenAI(
    api_key="sk-your-litellm-key",
    base_url="http://localhost:4000",
    default_headers=headers,  # Forward headers
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
```
</TabItem>

<TabItem value="langchain" label="LangChain">

```python
from langchain_openai import ChatOpenAI

headers = get_litellm_headers(request)

llm = ChatOpenAI(
    model="gpt-4o",
    openai_api_key="sk-your-litellm-key",
    base_url="http://localhost:4000",
    default_headers=headers,  # Forward headers
)
```
</TabItem>
<TabItem value="litellm" label="LiteLLM SDK">

```python
import litellm

headers = get_litellm_headers(request)

response = litellm.completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="http://localhost:4000",
    extra_headers=headers,  # Forward headers
)
```
</TabItem>
<TabItem value="requests" label="HTTP (requests/httpx)">

```python
import httpx

headers = get_litellm_headers(request)
headers["Authorization"] = "Bearer sk-your-litellm-key"

response = httpx.post(
    "http://localhost:4000/v1/chat/completions",
    headers=headers,
    json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}
)
```
</TabItem>
</Tabs>

### 결과

헤더 전달이 활성화되면 다음을 볼 수 있습니다.

**Langfuse의 trace grouping:**

<Image
  img={require('../img/a2a_trace_grouping.png')}
  style={{width: '80%', display: 'block', margin: '0', borderRadius: '8px'}}
/>

**에이전트 지출 귀속:**

<Image
  img={require('../img/a2a_agent_spend.png')}
  style={{width: '80%', display: 'block', margin: '0', borderRadius: '8px'}}
/>

## API 참조

### 엔드포인트

```
POST /a2a/{agent_name}/message/send
```

### 인증

`Authorization` 헤더에 LiteLLM Virtual Key를 포함합니다.

```
Authorization: Bearer sk-your-litellm-key
```

### 요청 형식

LiteLLM은 [A2A JSON-RPC 2.0 사양](https://github.com/google/A2A)을 따릅니다.

```json title="Request Body"
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{"kind": "text", "text": "Your message here"}],
      "messageId": "unique-message-id"
    }
  }
}
```

### 응답 형식

```json title="Response"
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "kind": "task",
    "id": "task-id",
    "contextId": "context-id",
    "status": {"state": "completed", "timestamp": "2025-01-01T00:00:00Z"},
    "artifacts": [
      {
        "artifactId": "artifact-id",
        "name": "response",
        "parts": [{"kind": "text", "text": "Agent response here"}]
      }
    ]
  }
}
```

## 에이전트 레지스트리 {#agent-registry}

팀이 회사 안에서 사용할 수 있는 에이전트를 찾을 수 있도록 중앙 레지스트리를 만들고 싶으신가요?

[AI Hub](./proxy/ai_hub)를 사용해 에이전트를 조직 전체에 공개하고 검색 가능하게 만들 수 있습니다. 이를 통해 개발자는 에이전트를 다시 만들 필요 없이 사용 가능한 에이전트를 탐색할 수 있습니다.
