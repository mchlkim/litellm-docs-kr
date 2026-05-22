import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /responses


LiteLLM은 다음 spec에 맞춘 endpoint를 제공합니다: [OpenAI의 `/responses` API](https://platform.openai.com/docs/api-reference/responses)

provider가 해당 endpoint를 지원하지 않으면 /chat/completions 요청이 여기로 자동 bridge될 수 있습니다. model의 기본 `mode`가 bridging 동작 방식을 결정합니다(`model_prices_and_context_window` 참고). 

| 기능 | 지원 | 참고 |
|---------|-----------|--------|
| 비용 추적 | ✅ | 지원되는 모든 model에서 동작 |
| 로깅 | ✅ | 모든 integration에서 동작 |
| 최종 사용자 추적 | ✅ | |
| 스트리밍 | ✅ | |
| WebSocket Mode | ✅ | 모든 provider에 대해 lower-latency persistent connection 제공 |
| Image Generation Streaming | ✅ | partial image(1-3)를 사용한 progressive image generation |
| 폴백 | ✅ | 지원되는 model 간 동작 |
| 로드 밸런싱 | ✅ | 지원되는 model 간 동작 |
| 가드레일 | ✅ | input 및 output text에 적용(non-streaming only) |
| 지원 operation | response 생성, response 조회, response 삭제 | |
| 지원 LiteLLM version | 1.63.8+ | |
| 지원 LLM provider | **LiteLLM이 지원하는 모든 provider** | `openai`, `anthropic`, `bedrock`, `vertex_ai`, `gemini`, `azure`, `azure_ai` etc. |

## 사용법

### LiteLLM Python SDK

<Tabs>
<TabItem value="openai" label="OpenAI">

#### 비스트리밍
```python showLineNumbers title="OpenAI Non-streaming Response"
import litellm

# Non-streaming response
response = litellm.responses(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 응답 형식(OpenAI Responses API 형식)

```json
{
    "id": "resp_abc123",
    "object": "response",
    "created_at": 1734366691,
    "status": "completed",
    "model": "o1-pro-2025-01-30",
    "output": [
        {
            "type": "message",
            "id": "msg_abc123",
            "status": "completed",
            "role": "assistant",
            "content": [
                {
                    "type": "output_text",
                    "text": "Once upon a time, a little unicorn named Stardust lived in a magical meadow where flowers sang lullabies. One night, she discovered that her horn could paint dreams across the sky, and she spent the evening creating the most beautiful aurora for all the forest creatures to enjoy. As the animals drifted off to sleep beneath her shimmering lights, Stardust curled up on a cloud of moonbeams, happy to have shared her magic with her friends.",
                    "annotations": []
                }
            ]
        }
    ],
    "usage": {
        "input_tokens": 18,
        "output_tokens": 98,
        "total_tokens": 116
    }
}
```

#### 스트리밍 {#streaming}
```python showLineNumbers title="OpenAI Streaming Response"
import litellm

# Streaming response
response = litellm.responses(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 스트리밍 Image Generation
```python showLineNumbers title="OpenAI Streaming Image Generation"
import litellm
import base64

# Streaming image generation with partial images
stream = litellm.responses(
    model="gpt-4.1",  # Use an actual image generation model
    input="Generate a gorgeous image of a river made of white owl feathers",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],

)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```

#### Image Generation(비스트리밍)

image를 생성하는 model에서는 image generation이 지원됩니다. 생성된 image는 `type: "image_generation_call"`과 함께 `output` array에 반환됩니다.

**Gemini (Google AI Studio):**
```python showLineNumbers title="Gemini Image Generation"
import litellm
import base64

# Gemini image generation models don't require tools parameter
response = litellm.responses(
    model="gemini/gemini-2.5-flash-image",
    input="Generate a cute cat playing with yarn"
)

# Access generated images from output
for item in response.output:
    if item.type == "image_generation_call":
        # item.result contains pure base64 (no data: prefix)
        image_bytes = base64.b64decode(item.result)

        # Save the image
        with open(f"generated_{item.id}.png", "wb") as f:
            f.write(image_bytes)

print(f"Image saved: generated_{response.output[0].id}.png")
```

**OpenAI:**
```python showLineNumbers title="OpenAI Image Generation"
import litellm
import base64

# OpenAI models require tools parameter for image generation
response = litellm.responses(
    model="openai/gpt-4o",
    input="Generate a futuristic city at sunset",
    tools=[{"type": "image_generation"}]
)

# Access generated images from output
for item in response.output:
    if item.type == "image_generation_call":
        image_bytes = base64.b64decode(item.result)
        with open(f"generated_{item.id}.png", "wb") as f:
            f.write(image_bytes)
```

**응답 형식:**

image generation이 성공하면 response에 다음이 포함됩니다:

```json
{
  "id": "resp_abc123",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",
      "id": "resp_abc123_img_0",
      "status": "completed",
      "result": "iVBORw0KGgo..."  // Pure base64 string (no data: prefix)
    }
  ]
}
```

**지원 모델:**

| Provider | 모델 | `tools` parameter 필요 여부 |
|----------|--------|---------------------------|
| Google AI Studio | `gemini/gemini-2.5-flash-image` | ❌ 아니요 |
| Vertex AI | `vertex_ai/gemini-2.5-flash-image-preview` | ❌ 아니요 |
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `o3` | ✅ 예 |
| AWS Bedrock | Stability AI, Amazon Nova Canvas models | model별 |
| Fal AI | 여러 image generation model | model docs 확인 |

**참고:** `result` field에는 `data:image/png;base64,` prefix가 없는 순수 base64-encoded image data가 들어 있습니다. 저장하기 전에 `base64.b64decode()`로 decode해야 합니다.

#### Response 조회
```python showLineNumbers title="Get Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = litellm.get_responses(
    response_id=response_id
)

print(retrieved_response)

# For async usage
# retrieved_response = await litellm.aget_responses(response_id=response_id)
```

#### Response 취소
provider가 지원하는 경우 진행 중인 response를 취소할 수 있습니다:

```python showLineNumbers title="Cancel Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Cancel the response by ID
cancel_response = litellm.cancel_responses(
    response_id=response_id
)

print(cancel_response)

# For async usage
# cancel_response = await litellm.acancel_responses(response_id=response_id)
```


**REST API:**
```bash
curl -X POST http://localhost:4000/v1/responses/response_id/cancel \
    -H "Authorization: Bearer sk-1234"
```

지정한 ID의 진행 중인 response 취소를 시도합니다.
**참고:** 모든 provider가 response cancellation을 지원하는 것은 아닙니다. 지원하지 않으면 error가 발생합니다.

#### Response 삭제
```python showLineNumbers title="Delete Response by ID"
import litellm

# First, create a response
response = litellm.responses(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = litellm.delete_responses(
    response_id=response_id
)

print(delete_response)

# For async usage
# delete_response = await litellm.adelete_responses(response_id=response_id)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

#### 비스트리밍
```python showLineNumbers title="Anthropic Non-streaming Response"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Non-streaming response
response = litellm.responses(
    model="anthropic/claude-3-5-sonnet-20240620",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Anthropic Streaming Response"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Streaming response
response = litellm.responses(
    model="anthropic/claude-3-5-sonnet-20240620",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

#### 비스트리밍
```python showLineNumbers title="Vertex AI Non-streaming Response"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Non-streaming response
response = litellm.responses(
    model="vertex_ai/gemini-1.5-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Vertex AI Streaming Response"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Streaming response
response = litellm.responses(
    model="vertex_ai/gemini-1.5-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

#### 비스트리밍
```python showLineNumbers title="AWS Bedrock Non-streaming Response"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

# Non-streaming response
response = litellm.responses(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="AWS Bedrock Streaming Response"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

# Streaming response
response = litellm.responses(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

#### 비스트리밍
```python showLineNumbers title="Google AI Studio Non-streaming Response"
import litellm
import os

# Set API key for Google AI Studio
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

# Non-streaming response
response = litellm.responses(
    model="gemini/gemini-1.5-flash",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Google AI Studio Streaming Response"
import litellm
import os

# Set API key for Google AI Studio
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

# Streaming response
response = litellm.responses(
    model="gemini/gemini-1.5-flash",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

### OpenAI SDK로 LiteLLM Proxy 사용

먼저 LiteLLM proxy server를 설정하고 시작합니다.

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai" label="OpenAI">

먼저 litellm proxy config.yaml에 다음을 추가합니다:
```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: openai/o1-pro
    litellm_params:
      model: openai/o1-pro
      api_key: os.environ/OPENAI_API_KEY
```

#### 비스트리밍
```python showLineNumbers title="OpenAI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="OpenAI Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

#### 스트리밍 Image Generation
```python showLineNumbers title="OpenAI Proxy Streaming Image Generation"
from openai import OpenAI
import base64

client = OpenAI(api_key="sk-1234", base_url="http://localhost:4000")

stream = client.responses.create(
    model="gpt-4.1",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)


for event in stream:
    print(f"event: {event}")
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)

```

#### Response 조회
```python showLineNumbers title="Get Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Retrieve the response by ID
retrieved_response = client.responses.retrieve(response_id)

print(retrieved_response)
```

#### Response 삭제
```python showLineNumbers title="Delete Response by ID with OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# First, create a response
response = client.responses.create(
    model="openai/o1-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

# Get the response ID
response_id = response.id

# Delete the response by ID
delete_response = client.responses.delete(response_id)

print(delete_response)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

먼저 litellm proxy config.yaml에 다음을 추가합니다:
```yaml showLineNumbers title="Anthropic Proxy Configuration"
model_list:
  - model_name: anthropic/claude-3-5-sonnet-20240620
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20240620
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 비스트리밍
```python showLineNumbers title="Anthropic Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="anthropic/claude-3-5-sonnet-20240620",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Anthropic Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="anthropic/claude-3-5-sonnet-20240620",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

먼저 litellm proxy config.yaml에 다음을 추가합니다:
```yaml showLineNumbers title="Vertex AI Proxy Configuration"
model_list:
  - model_name: vertex_ai/gemini-1.5-pro
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: your-gcp-project-id
      vertex_location: us-central1
```

#### 비스트리밍
```python showLineNumbers title="Vertex AI Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="vertex_ai/gemini-1.5-pro",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Vertex AI Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="vertex_ai/gemini-1.5-pro",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

먼저 litellm proxy config.yaml에 다음을 추가합니다:
```yaml showLineNumbers title="AWS Bedrock Proxy Configuration"
model_list:
  - model_name: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

#### 비스트리밍
```python showLineNumbers title="AWS Bedrock Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="AWS Bedrock Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

먼저 litellm proxy config.yaml에 다음을 추가합니다:
```yaml showLineNumbers title="Google AI Studio Proxy Configuration"
model_list:
  - model_name: gemini/gemini-1.5-flash
    litellm_params:
      model: gemini/gemini-1.5-flash
      api_key: os.environ/GEMINI_API_KEY
```

#### 비스트리밍
```python showLineNumbers title="Google AI Studio Proxy Non-streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Non-streaming response
response = client.responses.create(
    model="gemini/gemini-1.5-flash",
    input="Tell me a three sentence bedtime story about a unicorn."
)

print(response)
```

#### 스트리밍
```python showLineNumbers title="Google AI Studio Proxy Streaming Response"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Streaming response
response = client.responses.create(
    model="gemini/gemini-1.5-flash",
    input="Tell me a three sentence bedtime story about a unicorn.",
    stream=True
)

for event in response:
    print(event)
```

</TabItem>
</Tabs>

## WebSocket Mode

Responses API는 agentic workflow에 적합한 lower-latency persistent connection용 **WebSocket mode**를 지원합니다. WebSocket mode는 native WebSocket을 지원하는 provider뿐 아니라 **모든 LiteLLM provider**에서 동작합니다.

### 아키텍처

LiteLLM은 두 가지 WebSocket mode를 제공합니다.

1. **Native WebSocket**: 지원 provider(OpenAI, Azure)로 직접 `wss://` connection을 사용합니다.
2. **Managed WebSocket**: 기타 provider(Anthropic, Gemini, Bedrock 등)는 WebSocket을 통한 HTTP streaming을 사용합니다.

system은 provider capability를 기준으로 적절한 mode를 자동 선택합니다.

### 사용법

<Tabs>
<TabItem value="python" label="Python (websocket-client)">

```python showLineNumbers title="WebSocket with Python"
import json
from websocket import create_connection  # uv add websocket-client

# Connect to LiteLLM proxy WebSocket endpoint
ws = create_connection(
    "ws://localhost:4000/v1/responses?model=gemini-2.5-flash",
    header=["Authorization: Bearer sk-1234"]
)

try:
    # Send initial message
    ws.send(json.dumps({
        "type": "response.create",
        "model": "gemini-2.5-flash",
        "store": True,
        "input": [{
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "My favorite color is blue."}]
        }]
    }))
    
    # Collect response events
    response_id = None
    while True:
        event = json.loads(ws.recv())
        print(f"Event: {event['type']}")
        
        if event["type"] == "response.completed":
            response_id = event["response"]["id"]
            break
        elif event["type"] == "response.output_text.delta":
            print(f"Text: {event.get('delta', '')}", end="", flush=True)
    
    print(f"\nResponse ID: {response_id}")
    
    # Send follow-up with previous_response_id for multi-turn
    ws.send(json.dumps({
        "type": "response.create",
        "model": "gemini-2.5-flash",
        "previous_response_id": response_id,
        "input": [{
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "What is my favorite color?"}]
        }]
    }))
    
    # Collect follow-up response
    while True:
        event = json.loads(ws.recv())
        if event["type"] == "response.completed":
            break
        elif event["type"] == "response.output_text.delta":
            print(event.get("delta", ""), end="", flush=True)
            
finally:
    ws.close()
```

</TabItem>
<TabItem value="javascript" label="JavaScript (ws)">

```javascript showLineNumbers title="WebSocket with JavaScript"
const WebSocket = require('ws'); // npm install ws

const ws = new WebSocket(
    'ws://localhost:4000/v1/responses?model=gemini-2.5-flash',
    {
        headers: {
            'Authorization': 'Bearer sk-1234'
        }
    }
);

ws.on('open', () => {
    // Send initial message
    ws.send(JSON.stringify({
        type: 'response.create',
        model: 'gemini-2.5-flash',
        store: true,
        input: [{
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: 'My favorite color is blue.' }]
        }]
    }));
});

let responseId = null;

ws.on('message', (data) => {
    const event = JSON.parse(data.toString());
    console.log(`Event: ${event.type}`);
    
    if (event.type === 'response.completed') {
        responseId = event.response.id;
        console.log(`Response ID: ${responseId}`);
        
        // Send follow-up
        ws.send(JSON.stringify({
            type: 'response.create',
            model: 'gemini-2.5-flash',
            previous_response_id: responseId,
            input: [{
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: 'What is my favorite color?' }]
            }]
        }));
    } else if (event.type === 'response.output_text.delta') {
        process.stdout.write(event.delta || '');
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
```

</TabItem>
<TabItem value="curl" label="curl (websocat)">

```bash showLineNumbers title="WebSocket with websocat"
# Install websocat: brew install websocat (macOS) or cargo install websocat

# Connect to WebSocket endpoint
websocat "ws://localhost:4000/v1/responses?model=gemini-2.5-flash" \
  -H="Authorization: Bearer sk-1234"

# Then send JSON events (paste and press Enter):
{"type":"response.create","model":"gemini-2.5-flash","input":[{"type":"message","role":"user","content":[{"type":"input_text","text":"Hello!"}]}]}

# You'll receive streaming events back:
# {"type":"response.created",...}
# {"type":"response.in_progress",...}
# {"type":"response.output_text.delta","delta":"Hello",...}
# {"type":"response.completed",...}
```

</TabItem>
</Tabs>

### Event Type

WebSocket connection은 JSON 형식의 Server-Sent Events(SSE)를 받습니다.

| Event Type | 설명 |
|------------|-------------|
| `response.created` | Response generation 시작 |
| `response.in_progress` | Response 생성 중 |
| `response.output_item.added` | 새 output item(message, tool call 등) 추가 |
| `response.output_text.delta` | 증분 text chunk |
| `response.output_text.done` | Text output 완료 |
| `response.content_part.done` | Content part 완료 |
| `response.output_item.done` | Output item 완료 |
| `response.completed` | 전체 response가 성공적으로 완료됨 |
| `response.failed` | Response generation 실패 |
| `response.incomplete` | Response incomplete(예: max token 도달) |
| `error` | Error 발생 |

### Multi-turn Conversation 유지

여러 WebSocket message에서 conversation context를 유지하려면 `previous_response_id`를 사용합니다.

```python showLineNumbers title="Multi-turn WebSocket Conversation"
# Turn 1
ws.send(json.dumps({
    "type": "response.create",
    "model": "gemini-2.5-flash",
    "store": True,  # Required for multi-turn
    "input": [{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "Hello"}]}]
}))

# ... collect events and get response_id from response.completed event ...

# Turn 2 - reference previous response
ws.send(json.dumps({
    "type": "response.create",
    "model": "gemini-2.5-flash",
    "previous_response_id": response_id,  # Links to previous turn
    "input": [{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "Continue"}]}]
}))
```

### Provider 지원

| Provider | WebSocket Mode | 참고 |
|----------|----------------|-------|
| OpenAI | Native | OpenAI로 직접 `wss://` connection |
| Azure OpenAI | Native | Azure로 직접 `wss://` connection |
| Anthropic | Managed | WebSocket을 통한 HTTP streaming |
| Google AI Studio (Gemini) | Managed | WebSocket을 통한 HTTP streaming |
| Vertex AI | Managed | WebSocket을 통한 HTTP streaming |
| AWS Bedrock | Managed | WebSocket을 통한 HTTP streaming |
| 기타 모든 provider | Managed | WebSocket을 통한 HTTP streaming |

**참고**: native mode와 managed mode는 같은 event stream format을 제공합니다. client 입장에서는 차이가 투명하게 처리됩니다.

### 설정

별도 configuration은 필요하지 않습니다. WebSocket protocol(`ws://` 또는 `wss://`)로 access하면 `/v1/responses` endpoint에서 WebSocket mode를 자동으로 사용할 수 있습니다.

LiteLLM Proxy에서는 model이 일반적인 방식으로 구성되어 있는지 확인하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-2.5-flash
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
  
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

두 model 모두 `ws://localhost:4000/v1/responses`에서 WebSocket mode를 자동으로 지원합니다.

## Response ID 보안

기본적으로 LiteLLM Proxy는 user가 다른 user의 response ID에 access하지 못하게 합니다.

response ID를 user ID로 encrypt해 user가 자신의 response ID에만 access할 수 있게 합니다.

다른 사람의 response ID에 access하려고 하면 403이 반환됩니다:

```json
{
  "error": {
    "message": "Forbidden. The response id is not associated with the user, who this key belongs to.",
    "code": 403
  }
}
```

이를 비활성화하려면 `disable_responses_id_security: true`를 설정합니다:

```yaml
general_settings:
  disable_responses_id_security: true
```

이 설정은 모든 user가 모든 response ID에 access할 수 있게 합니다.

## 지원 Responses API Parameter

| Provider | 지원 파라미터 |
|----------|---------------------|
| `openai` | [모든 Responses API parameter 지원](https://github.com/BerriAI/litellm/blob/7c3df984da8e4dff9201e4c5353fdc7a2b441831/litellm/llms/openai/responses/transformation.py#L23) |
| `azure` | [모든 Responses API parameter 지원](https://github.com/BerriAI/litellm/blob/7c3df984da8e4dff9201e4c5353fdc7a2b441831/litellm/llms/openai/responses/transformation.py#L23) |
| `anthropic` | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `bedrock` | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `gemini` | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `vertex_ai` | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| `azure_ai` | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |
| 기타 모든 llm api provider | [지원 parameter 보기](https://github.com/BerriAI/litellm/blob/f39d9178868662746f159d5ef642c7f34f9bfe5f/litellm/responses/litellm_completion_transformation/transformation.py#L57) |

## Session Continuity를 사용한 Load Balancing

같은 model의 여러 deployment(예: 여러 Azure OpenAI endpoint)로 Responses API를 사용할 때 LiteLLM은 session continuity를 제공합니다. 이렇게 하면 `previous_response_id`를 사용하는 follow-up request가 원래 response를 생성한 동일 deployment로 route됩니다.


#### 예제 사용법

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python showLineNumbers title="Python SDK with Session Continuity"
import litellm

# Set up router with multiple deployments of the same model
router = litellm.Router(
    model_list=[
        {
            "model_name": "azure-gpt4-turbo",
            "litellm_params": {
                "model": "azure/gpt-4-turbo",
                "api_key": "your-api-key-1",
                "api_version": "2024-06-01",
                "api_base": "https://endpoint1.openai.azure.com",
            },
        },
        {
            "model_name": "azure-gpt4-turbo",
            "litellm_params": {
                "model": "azure/gpt-4-turbo",
                "api_key": "your-api-key-2",
                "api_version": "2024-06-01",
                "api_base": "https://endpoint2.openai.azure.com",
            },
        },
    ],
    # `responses_api_deployment_check` ensures Requests with `previous_response_id`
    # are routed to the same deployment. `deployment_affinity` adds sticky sessions
    # for requests without `previous_response_id` (useful for implicit caching).
    # `session_affinity` adds sticky sessions based on `session_id` metadata.
    optional_pre_call_checks=["responses_api_deployment_check", "deployment_affinity", "session_affinity"],
    # Optional (default is 3600 seconds / 1 hour)
    deployment_affinity_ttl_seconds=3600,
)

# Initial request
response = await router.aresponses(
    model="azure-gpt4-turbo",
    input="Hello, who are you?",
    truncation="auto",
)

# Store the response ID
response_id = response.id

# Follow-up request - will be automatically routed to the same deployment
follow_up = await router.aresponses(
    model="azure-gpt4-turbo",
    input="Tell me more about yourself",
    truncation="auto",
    previous_response_id=response_id  # This ensures routing to the same deployment
)
```

</TabItem>
<TabItem value="proxy-server" label="Proxy Server">

#### 1. proxy config.yaml에서 session continuity 설정

LiteLLM proxy에서 Responses API용 session continuity를 활성화하려면 proxy config.yaml에 `optional_pre_call_checks`를 설정합니다.

- `responses_api_deployment_check`: `previous_response_id`가 제공될 때 high priority routing
- `encrypted_content_affinity`: **[권장]** encrypted item용 content-aware routing(예: `rs_...` reasoning item)(**LiteLLM >= 1.82.3 필요**)
- `session_affinity`: session id 기반 sticky session(`deployment_affinity`보다 우선 적용)
- `deployment_affinity`: user key 기반 sticky session(`previous_response_id`가 없어도 적용)

:::tip 권장: `encrypted_content_affinity` 사용
**서로 다른 API key**를 가진 deployment 간 load balancing으로 Responses API를 사용할 때는 `deployment_affinity` 대신 `encrypted_content_affinity`를 사용하세요. encrypted content가 포함된 request만 pin하므로 quota 감소를 피하면서 `invalid_encrypted_content` error를 방지합니다.(LiteLLM >= 1.82.3 필요)
:::

참고:
- User-key affinity는 다음을 key로 사용합니다: `metadata.user_api_key_hash` (API key hash). OpenAI `user` request parameter는 end-user identifier이며 deployment affinity에는 의도적으로 사용되지 않습니다.
- Session-ID affinity는 다음을 key로 사용합니다: `metadata.session_id`. Proxy request에서는 `x-litellm-session-id` 또는 `x-litellm-trace-id` HTTP header로 전달할 수 있습니다(call chaining에서는 서로 바꿔 사용할 수 있음). Python SDK request에서는 request args에 `litellm_metadata={"session_id": "value"}`로 전달할 수 있습니다.
- `user_api_key_hash`는 이미 SHA-256이므로 그대로 사용됩니다(double hashing 없음).
- Affinity는 stable model identifier를 기준으로 scoped됩니다(model-map key, 예: `model_map_information.model_map_key`). 따라서 model alias는 같은 stickiness bucket에 매핑됩니다.
- mapping TTL은 다음으로 제어됩니다: `deployment_affinity_ttl_seconds` (Router init / proxy startup에서 구성).

```yaml showLineNumbers title="config.yaml with Session Continuity"
model_list:
  - model_name: azure-gpt4-turbo
    litellm_params:
      model: azure/gpt-4-turbo
      api_key: your-api-key-1
      api_version: 2024-06-01
      api_base: https://endpoint1.openai.azure.com
  - model_name: azure-gpt4-turbo
    litellm_params:
      model: azure/gpt-4-turbo
      api_key: your-api-key-2
      api_version: 2024-06-01
      api_base: https://endpoint2.openai.azure.com

router_settings:
  optional_pre_call_checks:
    - responses_api_deployment_check
    - session_affinity
    - deployment_affinity
  # Optional (default is 3600 seconds / 1 hour)
  deployment_affinity_ttl_seconds: 3600
```

#### 2. OpenAI Python SDK로 LiteLLM Proxy에 request 전송

```python showLineNumbers title="OpenAI Client with Proxy Server"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-api-key"
)

# Initial request
response = client.responses.create(
    model="azure-gpt4-turbo",
    input="Hello, who are you?"
)

response_id = response.id

# Follow-up request - will be automatically routed to the same deployment
follow_up = client.responses.create(
    model="azure-gpt4-turbo",
    input="Tell me more about yourself",
    previous_response_id=response_id  # This ensures routing to the same deployment
)
```

</TabItem>
</Tabs>

## Encrypted Content Affinity(다중 region Load Balancing) {#encrypted-content-affinity-multi-region-load-balancing}

**서로 다른 API key**를 가진 deployment(예: 다른 Azure region 또는 OpenAI organization) 간에 Responses API를 load balance할 때 encrypted content item(예: `rs_...` reasoning item)은 해당 item을 만든 API key로만 decrypt할 수 있습니다.

### 문제

```json
{
  "error": {
    "message": "The encrypted content for item rs_0d09d6e56879e76500699d6feee41c8197bd268aae76141f87 could not be verified. Reason: Encrypted content organization_id did not match the target organization.",
    "type": "invalid_request_error",
    "code": "invalid_encrypted_content"
  }
}
```

이 error는 다음 상황에서 발생합니다:
1. initial request가 배포 A(API key 1)로 이동해 encrypted item `rs_xyz`를 생성합니다
2. follow-up request가 `rs_xyz` input에 포함된 상태로 배포 B(API key 2)에 load balance됩니다
3. 배포 B가 배포 A에서 생성된 content를 decrypt할 수 없습니다 → **request 실패**

### 해결책: `encrypted_content_affinity`

`encrypted_content_affinity` pre-call check는 encrypted item이 포함된 follow-up request를 **필요할 때만** originating deployment로 route합니다

**주요 이점:**
- ✅ **quota 감소 없음**: `deployment_affinity`와 달리 encrypted item이 포함된 request만 pin합니다
- ✅ **rate limit 우회**: encrypted content가 특정 deployment를 요구할 때 RPM/TPM limit을 우회합니다(어차피 다른 deployment에서는 request가 실패함)
- ✅ **`previous_response_id` 불필요**: `model_id`를 item ID에 직접 encoding해 동작합니다
- ✅ **cache 불필요**: `model_id`가 on-the-fly로 decode되므로 Redis dependency나 관리할 TTL이 없습니다
- ✅ **전역 적용 가능**: 모든 model에 활성화할 수 있으며 non-Responses-API call(chat, embeddings)에는 영향이 없습니다

### 동작 방식

1. **Encoding Phase**(response 시점):
   - `encrypted_content`가 포함된 각 output item에 대해 LiteLLM은 originating `model_id`: `rs_xyz` → `encitem_{base64("litellm:model_id:{model_id};item_id:rs_xyz")}`
   - original item ID는 upstream provider로 request를 forward하기 전에 복원됩니다

2. **Routing Phase**(request 전):
   - request `input`에서 `encitem_` prefix ID를 scan합니다
   - 발견되면 → `model_id`를 decode하고 originating deployment에 pin한 뒤 rate limit을 우회합니다
   - encoded item이 없으면 → 일반 load balancing을 수행합니다

### 설정

<Tabs>
<TabItem value="sdk" label="Python SDK">

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "gpt-5.1-codex",
            "litellm_params": {
                "model": "openai/gpt-5.1-codex",
                "api_key": "org-1-api-key",  # Different API key
            },
            "model_info": {"id": "deployment-us-east"},
        },
        {
            "model_name": "gpt-5.1-codex",
            "litellm_params": {
                "model": "openai/gpt-5.1-codex",
                "api_key": "org-2-api-key",  # Different API key
            },
            "model_info": {"id": "deployment-eu-west"},
        },
    ],
    optional_pre_call_checks=["encrypted_content_affinity"],
)

# Initial request - routes to any deployment
response1 = await router.aresponses(
    model="gpt-5.1-codex",
    input="Explain quantum computing",
)

# Follow-up with encrypted items - automatically routes to same deployment
response2 = await router.aresponses(
    model="gpt-5.1-codex",
    input=response1.output,  # Contains encrypted items from response1
)
```

</TabItem>
<TabItem value="proxy" label="Proxy Server">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-5.1-codex
    litellm_params:
      model: azure/gpt-5.1-codex
      api_base: https://eastus.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_EASTUS
      rpm: 600
      tpm: 100000
    model_info:
      id: "gpt-5.1-codex-eastus"

  - model_name: gpt-5.1-codex
    litellm_params:
      model: azure/gpt-5.1-codex
      api_base: https://westeurope.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_WESTEUROPE
      rpm: 600
      tpm: 100000
    model_info:
      id: "gpt-5.1-codex-westeurope"

router_settings:
  routing_strategy: usage-based-routing-v2
  enable_pre_call_checks: true
  optional_pre_call_checks:
    - encrypted_content_affinity
```

**proxy 시작:**
```bash
litellm --config config.yaml
```

</TabItem>
</Tabs>

### Affinity Type별 사용 시점

| Affinity Type | 사용 사례 | 범위 | Quota 영향 |
|---------------|----------|-------|--------------|
| **`encrypted_content_affinity`** | **[권장]** 서로 다른 API key를 사용하는 다중 region Responses API | 추적된 encrypted item이 있는 request만 | ✅ 없음(정밀 pinning) |
| `responses_api_deployment_check` | `previous_response_id`를 사용할 수 있을 때 | `previous_response_id`가 있는 request | ✅ 없음 |
| `session_affinity` | session 기반 application | 같은 `session_id`를 가진 모든 request | ⚠️ session 수만큼 quota 감소 |
| `deployment_affinity` | 단순 sticky session | 같은 API key의 모든 request | ❌ user 수만큼 quota 감소 |


## Model Group별 Affinity 설정

기본적으로 `optional_pre_call_checks`는 모든 model group에 전역으로 적용됩니다. model group별로 다른 affinity 동작이 필요할 때는 `model_group_affinity_config`를 사용하세요. 예를 들어 여러 provider(Azure + Bedrock)에 걸친 model에만 stickiness를 활성화하고, 단일 provider group은 자유롭게 load balance하도록 둘 수 있습니다.

목록에 없는 group은 전역 `optional_pre_call_checks` 설정으로 fallback됩니다.

<Tabs>
<TabItem value="python-sdk" label="Python SDK">

```python
router = litellm.Router(
    model_list=[
        {
            "model_name": "gpt-4",
            "litellm_params": {"model": "azure/gpt-4", "api_key": "...", "api_base": "https://endpoint1.openai.azure.com"},
        },
        {
            "model_name": "gpt-4",
            "litellm_params": {"model": "bedrock/anthropic.claude-v2", "aws_region_name": "us-east-1"},
        },
        {
            "model_name": "text-embedding-ada-002",
            "litellm_params": {"model": "azure/text-embedding-ada-002", "api_key": "...", "api_base": "https://endpoint1.openai.azure.com"},
        },
        {
            "model_name": "text-embedding-ada-002",
            "litellm_params": {"model": "azure/text-embedding-ada-002", "api_key": "...", "api_base": "https://endpoint2.openai.azure.com"},
        },
    ],
    # gpt-4: cross-provider (Azure + Bedrock) — enable deployment affinity
    # text-embedding-ada-002: same provider — no affinity, let it load balance freely
    model_group_affinity_config={
        "gpt-4": ["deployment_affinity", "responses_api_deployment_check"],
    },
)
```

</TabItem>
<TabItem value="proxy-server" label="Proxy Server">

```yaml title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4
      api_key: os.environ/AZURE_API_KEY_1
      api_base: https://endpoint1.openai.azure.com

  - model_name: gpt-4
    litellm_params:
      model: bedrock/anthropic.claude-v2
      aws_region_name: us-east-1

  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/text-embedding-ada-002
      api_key: os.environ/AZURE_API_KEY_1
      api_base: https://endpoint1.openai.azure.com

  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/text-embedding-ada-002
      api_key: os.environ/AZURE_API_KEY_2
      api_base: https://endpoint2.openai.azure.com

router_settings:
  # gpt-4: cross-provider — enable stickiness
  # text-embedding-ada-002: not listed — load balances freely
  model_group_affinity_config:
    "gpt-4":
      - deployment_affinity
      - responses_api_deployment_check
```

</TabItem>
</Tabs>

**지원 값:** `deployment_affinity`, `responses_api_deployment_check`, `session_affinity`

## non-Responses API endpoint 호출(`/responses`에서 `/chat/completions` Bridge) {#calling-non-responses-api-endpoints-responses-to-chatcompletions-bridge}

LiteLLM은 LiteLLM의 `/chat/completions` endpoint로 bridge해 non-Responses API model을 호출할 수 있게 합니다. Anthropic, Gemini, non-Responses API OpenAI model 호출에 유용합니다.


#### Python SDK 사용법

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set API key
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key"

# Non-streaming response
response = litellm.responses(
    model="anthropic/claude-3-5-sonnet-20240620",
    input="Tell me a three sentence bedtime story about a unicorn.",
    max_output_tokens=100
)

print(response)
```

#### LiteLLM Proxy 사용법

**Config 설정:**

```yaml showLineNumbers title="Example Configuration"
model_list:
- model_name: anthropic-model
  litellm_params:
    model: anthropic/claude-3-5-sonnet-20240620
    api_key: os.environ/ANTHROPIC_API_KEY
```

**Proxy 시작:**

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**Request 전송:**

```bash showLineNumbers title="non-Responses API Model Request"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "anthropic-model",
    "input": "who is Michael Jordan"
  }'
```







### custom `api_base`가 있는 `openai/` model용 opt-in bridge

custom `api_base`와 `openai/` prefix로 **OpenAI-compatible third-party provider**(예: llama.cpp, vLLM, LM Studio)를 사용하면 LiteLLM은 일반적으로 `/responses` request를 해당 endpoint로 직접 forward합니다. provider가 `/chat/completions`만 지원하면 request가 실패합니다.

`/responses` -> `/chat/completions` bridge를 강제하려면 다음 중 하나를 사용하세요.

1. **`use_chat_completions_api: true`** - LiteLLM이 provider의 chat-completions API를 호출하도록 명시합니다.
2. **`openai/chat_completions/<model_name>`** - chat completions의 `responses/`와 같은 pattern입니다. model id가 routing choice를 encode합니다.

#### Python SDK 사용법

```python showLineNumbers title="Force bridge for custom openai/ endpoint (flag)"
import litellm

response = litellm.responses(
    model="openai/my-custom-model",
    input="Hello!",
    api_base="http://localhost:8080",
    api_key="fake-key",
    use_chat_completions_api=True,
)

print(response)
```

또는 model id에 encode합니다.

```python showLineNumbers title="Force bridge via openai/chat_completions/ model prefix"
import litellm

response = litellm.responses(
    model="openai/chat_completions/my-custom-model",
    input="Hello!",
    api_base="http://localhost:8080",
    api_key="fake-key",
)

print(response)
```

#### LiteLLM Proxy 사용법

**Config 설정:**

```yaml showLineNumbers title="config.yaml — bridge for custom openai/ endpoint"
model_list:
- model_name: my-local-model
  litellm_params:
    model: openai/my-custom-model
    api_base: http://localhost:8080/v1
    api_key: fake-key
    use_chat_completions_api: true
```

또는 flag 대신 `model: openai/chat_completions/my-custom-model`을 설정합니다.

**Proxy 시작:**

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**Request 전송:**

```bash showLineNumbers title="Request via bridge"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "my-local-model",
    "input": "Hello!"
  }'
```

`/responses` endpoint를 hardcode한 client(예: `wire_api = "responses"`를 쓰는 OpenAI Codex CLI)를 `/chat/completions`만 expose하는 local 또는 third-party OpenAI-compatible provider에 연결할 때 특히 유용합니다.

## 서버 측 compaction

long-running conversation에서는 **server-side compaction**을 활성화할 수 있습니다. rendered context size가 threshold를 넘으면 server가 in-stream으로 compaction을 자동 실행하고 compaction item을 emit합니다. 별도의 `POST /v1/responses/compact` call은 필요하지 않습니다.

`openai` 또는 `azure` provider를 사용할 때 OpenAI Responses API에서 지원됩니다. compaction entry와 `compact_threshold`(token count, minimum 1000)가 포함된 `context_management`를 전달하세요. context가 threshold를 넘으면 server가 in-stream으로 compact하고 계속 진행합니다. `previous_response_id`를 사용하거나 output item을 다음 input array에 append해 turn을 chain하세요. 자세한 내용은 [OpenAI Compaction guide](https://developers.openai.com/api/docs/guides/compaction)를 참고하세요.

> **참고:** LiteLLM Responses API를 통해 Anthropic model에서도 OpenAI `context_management` format을 사용할 수 있습니다. LiteLLM이 이 format을 Anthropic용으로 자동 translate하고 context management를 처리합니다.

compaction 실행 시점을 명시적으로 제어하려면 standalone compact endpoint(`POST /v1/responses/compact`)를 대신 사용하세요.

### Python SDK

```python showLineNumbers title="Server-side compaction with LiteLLM Python SDK"
import litellm

# Non-streaming: enable compaction when context exceeds 200k tokens
response = litellm.responses(
    model="openai/gpt-4o",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    max_output_tokens=1024,
)
print(response)

# Streaming: same context_management, compaction runs in-stream if threshold is crossed
stream = litellm.responses(
    model="openai/gpt-4o",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    stream=True,
)
for event in stream:
    print(event)
```

### LiteLLM Proxy(AI Gateway) 사용

proxy를 `base_url`로 지정해 OpenAI SDK를 사용하거나 curl로 proxy를 호출하세요. proxy는 `context_management`를 provider로 forward합니다.

**OpenAI Python SDK(`base_url`로 proxy 사용):**

```python showLineNumbers title="Server-side compaction via LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",  # LiteLLM Proxy (AI Gateway)
    api_key="your-proxy-api-key",
)

response = client.responses.create(
    model="openai/gpt-4o",
    input="Your conversation input...",
    context_management=[{"type": "compaction", "compact_threshold": 200000}],
    max_output_tokens=1024,
)
print(response)
```

**curl(proxy):**

```bash title="Server-side compaction via curl to LiteLLM Proxy"
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "openai/gpt-4o",
    "input": "Your conversation input...",
    "context_management": [{"type": "compaction", "compact_threshold": 200000}],
    "max_output_tokens": 1024
  }'
```

## Shell tool

**Shell tool**은 model이 hosted container 또는 local runtime에서 command를 실행할 수 있게 합니다(OpenAI Responses API). `tools=[{"type": "shell", "environment": {...}}]`를 전달하며, `environment` object가 runtime을 구성합니다(예: auto-provisioned container용 `type: "container_auto"`). 전체 option은 [OpenAI Shell tool guide](https://developers.openai.com/api/docs/guides/tools-shell)를 참고하세요.

Shell tool을 지원하는 model과 함께 `openai` 또는 `azure` provider를 사용할 때 지원됩니다.

### Python SDK

```python showLineNumbers title="Shell tool with LiteLLM Python SDK"
import litellm

response = litellm.responses(
    model="openai/gpt-5.2",
    input="List files in /mnt/data and run python --version.",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    tool_choice="auto",
    max_output_tokens=1024,
)
```

### LiteLLM Proxy(AI Gateway) 사용

proxy를 `base_url`로 지정해 OpenAI SDK를 사용하거나 curl로 proxy를 호출하세요. proxy는 `tools`(`type: "shell"` 포함)를 provider로 forward합니다.

**OpenAI Python SDK(`base_url`로 proxy 사용):**

```python showLineNumbers title="Shell tool via LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-api-key",
)

response = client.responses.create(
    model="openai/gpt-5.2",
    input="List files in /mnt/data.",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    tool_choice="auto",
    max_output_tokens=1024,
)
```

**curl:**

```bash title="Shell tool via curl to LiteLLM Proxy"
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "openai/gpt-5.2",
    "input": "List files in /mnt/data.",
    "tools": [{"type": "shell", "environment": {"type": "container_auto"}}],
    "tool_choice": "auto",
    "max_output_tokens": 1024
  }'
```

## File Search(Vector Stores) 사용 {#file-search-vector-stores}

전체 `file_search` 사용법(native + emulated fallback), SDK/Proxy 예제, 아키텍처 다이어그램, Q&A는 다음 문서를 참고하세요.

- [`File Search in the Responses API - E2E Testing Guide`](/docs/tutorials/file_search_responses_api)

## Session Management

LiteLLM Proxy는 지원되는 모든 model에 대해 session management를 지원합니다. 이를 통해 LiteLLM Proxy에서 conversation history(state)를 저장하고 가져올 수 있습니다.

#### 사용법

1. database에 request / response content 저장 활성화

proxy config.yaml에서 `store_prompts_in_cold_storage: true`를 설정합니다. 활성화하면 LiteLLM은 request와 response content를 지정한 s3 bucket에 저장합니다.

```yaml showLineNumbers title="config.yaml with Session Continuity"
litellm_settings:
  callbacks: ["s3_v2"]
  cold_storage_custom_logger: s3_v2
  s3_callback_params: # learn more https://docs.litellm.ai/docs/proxy/logging#s3-buckets
    s3_bucket_name: litellm-logs   # AWS Bucket Name for S3
    s3_region_name: us-west-2      

general_settings:
  store_prompts_in_cold_storage: true
  store_prompts_in_spend_logs: true
```

2. `previous_response_id` 없이 request 1 전송(new session)

previous response ID를 지정하지 않고 request를 보내 새 conversation을 시작합니다.

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet-latest",
    "input": "who is Michael Jordan"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

# Make initial request to start a new conversation
response = client.responses.create(
    model="anthropic/claude-3-5-sonnet-latest",
    input="who is Michael Jordan"
)

print(response.id)  # Store this ID for future requests in same session
print(response.output[0].content[0].text)
```

</TabItem>
</Tabs>

응답:

```json
{
  "id":"resp_123abc",
  "model":"claude-3-5-sonnet-20241022",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"Michael Jordan is widely considered one of the greatest basketball players of all time. He played for the Chicago Bulls (1984-1993, 1995-1998) and Washington Wizards (2001-2003), winning 6 NBA Championships with the Bulls."
    }]
  }]
}
```

3. `previous_response_id`로 request 2 전송(same session)

previous response ID를 참조해 conversation context를 유지하면서 conversation을 계속합니다.

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet-latest",
    "input": "can you tell me more about him",
    "previous_response_id": "resp_123abc"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

# Make follow-up request in the same conversation session
follow_up_response = client.responses.create(
    model="anthropic/claude-3-5-sonnet-latest",
    input="can you tell me more about him",
    previous_response_id="resp_123abc"  # ID from the previous response
)

print(follow_up_response.output[0].content[0].text)
```

</TabItem>
</Tabs>

응답:

```json
{
  "id":"resp_456def",
  "model":"claude-3-5-sonnet-20241022",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"Michael Jordan was born February 17, 1963. He attended University of North Carolina before being drafted 3rd overall by the Bulls in 1984. Beyond basketball, he built the Air Jordan brand with Nike and later became owner of the Charlotte Hornets."
    }]
  }]
}
```

4. `previous_response_id` 없이 request 3 전송(new session)

previous context를 참조하지 않고 완전히 새 conversation을 시작해 session 간 context가 유지되지 않는 방식을 보여줍니다.

<Tabs>
<TabItem value="curl" label="Curl">

```curl
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "anthropic/claude-3-5-sonnet-latest",
    "input": "can you tell me more about him"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

# Make a new request without previous context
new_session_response = client.responses.create(
    model="anthropic/claude-3-5-sonnet-latest",
    input="can you tell me more about him"
    # No previous_response_id means this starts a new conversation
)

print(new_session_response.output[0].content[0].text)
```

</TabItem>
</Tabs>

응답:

```json
{
  "id":"resp_789ghi",
  "model":"claude-3-5-sonnet-20241022",
  "output":[{
    "type":"message",
    "content":[{
      "type":"output_text",
      "text":"I don't see who you're referring to in our conversation. Could you let me know which person you'd like to learn more about?"
    }]
  }]
}
```
