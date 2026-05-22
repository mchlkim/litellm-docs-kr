import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# A2A agent 호출

여러 방식으로 LiteLLM을 통해 A2A agent를 호출하는 방법을 알아봅니다.

:::tip 자체 A2A agent 배포

자체 agent로 테스트하고 싶으신가요? Google Gemini 기반의 이 template A2A agent를 배포해 보세요.

[**shin-bot-litellm/a2a-gemini-agent**](https://github.com/shin-bot-litellm/a2a-gemini-agent) - streaming을 지원하는 간단한 배포 가능 A2A agent

:::

## A2A SDK

[A2A Python SDK](https://pypi.org/project/a2a-sdk)를 사용해 A2A protocol로 LiteLLM을 통해 agent를 호출합니다.

### 비스트리밍

이 예제는 다음 방법을 보여줍니다.
1. **사용 가능한 agent 나열** - `/v1/agents`를 query해 key가 접근할 수 있는 agent를 확인합니다.
2. **agent 선택** - 목록에서 agent를 고릅니다.
3. **A2A로 호출** - A2A protocol을 사용해 agent에 message를 보냅니다.

```python showLineNumbers title="invoke_a2a_agent.py"
from uuid import uuid4
import httpx
import asyncio
from a2a.client import A2ACardResolver, A2AClient
from a2a.types import MessageSendParams, SendMessageRequest

# === CONFIGURE THESE ===
LITELLM_BASE_URL = "http://localhost:4000"  # Your LiteLLM proxy URL
LITELLM_VIRTUAL_KEY = "sk-1234"             # Your LiteLLM Virtual Key
# =======================

async def main():
    headers = {"Authorization": f"Bearer {LITELLM_VIRTUAL_KEY}"}
    
    async with httpx.AsyncClient(headers=headers) as client:
        # Step 1: List available agents
        response = await client.get(f"{LITELLM_BASE_URL}/v1/agents")
        agents = response.json()
        
        print("Available agents:")
        for agent in agents:
            print(f"  - {agent['agent_name']} (ID: {agent['agent_id']})")
        
        if not agents:
            print("No agents available for this key")
            return
        
        # Step 2: Select an agent and invoke it
        selected_agent = agents[0]
        agent_id = selected_agent["agent_id"]
        agent_name = selected_agent["agent_name"]
        print(f"\nInvoking: {agent_name}")
        
        # Step 3: Use A2A protocol to invoke the agent
        base_url = f"{LITELLM_BASE_URL}/a2a/{agent_id}"
        resolver = A2ACardResolver(httpx_client=client, base_url=base_url)
        agent_card = await resolver.get_agent_card()
        a2a_client = A2AClient(httpx_client=client, agent_card=agent_card)
        
        request = SendMessageRequest(
            id=str(uuid4()),
            params=MessageSendParams(
                message={
                    "role": "user",
                    "parts": [{"kind": "text", "text": "Hello, what can you do?"}],
                    "messageId": uuid4().hex,
                }
            ),
        )
        response = await a2a_client.send_message(request)
        print(f"Response: {response.model_dump(mode='json', exclude_none=True, indent=4)}")

if __name__ == "__main__":
    asyncio.run(main())
```

### streaming

streaming response에는 `send_message_streaming`을 사용합니다.

```python showLineNumbers title="invoke_a2a_agent_streaming.py"
from uuid import uuid4
import httpx
import asyncio
from a2a.client import A2ACardResolver, A2AClient
from a2a.types import MessageSendParams, SendStreamingMessageRequest

# === CONFIGURE THESE ===
LITELLM_BASE_URL = "http://localhost:4000"  # Your LiteLLM proxy URL
LITELLM_VIRTUAL_KEY = "sk-1234"             # Your LiteLLM Virtual Key
LITELLM_AGENT_NAME = "ij-local"             # Agent name registered in LiteLLM
# =======================

async def main():
    base_url = f"{LITELLM_BASE_URL}/a2a/{LITELLM_AGENT_NAME}"
    headers = {"Authorization": f"Bearer {LITELLM_VIRTUAL_KEY}"}
    
    async with httpx.AsyncClient(headers=headers) as httpx_client:
        # Resolve agent card and create client
        resolver = A2ACardResolver(httpx_client=httpx_client, base_url=base_url)
        agent_card = await resolver.get_agent_card()
        client = A2AClient(httpx_client=httpx_client, agent_card=agent_card)

        # Send a streaming message
        request = SendStreamingMessageRequest(
            id=str(uuid4()),
            params=MessageSendParams(
                message={
                    "role": "user",
                    "parts": [{"kind": "text", "text": "Tell me a long story"}],
                    "messageId": uuid4().hex,
                }
            ),
        )
        
        # Stream the response
        async for chunk in client.send_message_streaming(request):
            print(chunk.model_dump(mode="json", exclude_none=True))

if __name__ == "__main__":
    asyncio.run(main())
```

## OpenAI SDK로 `/chat/completions` 호출 {#chat-completions-apiopenai-sdk}

`a2a/` model prefix를 사용하면 익숙한 OpenAI SDK로도 A2A agent를 호출할 수 있습니다.

### 비스트리밍

<Tabs>
<TabItem value="python" label="Python" default>

```python showLineNumbers title="openai_non_streaming.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",  # Your LiteLLM Virtual Key
    base_url="http://localhost:4000"  # Your LiteLLM proxy URL
)

response = client.chat.completions.create(
    model="a2a/my-agent",  # Use a2a/ prefix with your agent name
    messages=[
        {"role": "user", "content": "Hello, what can you do?"}
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript showLineNumbers title="openai_non_streaming.ts"
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-1234',  // Your LiteLLM Virtual Key
  baseURL: 'http://localhost:4000'  // Your LiteLLM proxy URL
});

const response = await client.chat.completions.create({
  model: 'a2a/my-agent',  // Use a2a/ prefix with your agent name
  messages: [
    { role: 'user', content: 'Hello, what can you do?' }
  ]
});

console.log(response.choices[0].message.content);
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="curl_non_streaming.sh"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/my-agent",
    "messages": [
      {"role": "user", "content": "Hello, what can you do?"}
    ]
  }'
```

</TabItem>
</Tabs>

### streaming

<Tabs>
<TabItem value="python" label="Python" default>

```python showLineNumbers title="openai_streaming.py"
import openai

client = openai.OpenAI(
    api_key="sk-1234",  # Your LiteLLM Virtual Key
    base_url="http://localhost:4000"  # Your LiteLLM proxy URL
)

stream = client.chat.completions.create(
    model="a2a/my-agent",  # Use a2a/ prefix with your agent name
    messages=[
        {"role": "user", "content": "Tell me a long story"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript showLineNumbers title="openai_streaming.ts"
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-1234',  // Your LiteLLM Virtual Key
  baseURL: 'http://localhost:4000'  // Your LiteLLM proxy URL
});

const stream = await client.chat.completions.create({
  model: 'a2a/my-agent',  // Use a2a/ prefix with your agent name
  messages: [
    { role: 'user', content: 'Tell me a long story' }
  ],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="curl_streaming.sh"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "a2a/my-agent",
    "messages": [
      {"role": "user", "content": "Tell me a long story"}
    ],
    "stream": true
  }'
```

</TabItem>
</Tabs>

## 주요 차이점

| 방식 | 사용 사례 | 장점 |
|--------|----------|------------|
| **A2A SDK** | 네이티브 A2A protocol 통합 | • A2A protocol 전체 지원<br/>• task state 및 artifact 접근<br/>• context 관리 |
| **OpenAI SDK** | 익숙한 OpenAI 스타일 인터페이스 | • OpenAI call을 대체해 바로 사용 가능<br/>• LLM workflow에서 agent workflow로 더 쉬운 migration<br/>• 기존 OpenAI tooling과 함께 동작 |

:::tip model prefix

OpenAI SDK를 사용할 때는 request가 LLM provider가 아니라 A2A agent로 routing되도록 agent name 앞에 항상 `a2a/`를 붙이세요(예: `a2a/my-agent`).

:::
