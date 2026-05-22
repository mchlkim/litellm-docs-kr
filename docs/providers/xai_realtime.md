import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `xAI Voice Agent`(`Realtime API`) {#xai-voice-agent-realtime-api}

xAI의 Grok Voice Agent는 WebSocket 연결을 통해 실시간 음성 대화 기능을 제공하며, 자연스러운 양방향 오디오 상호작용을 지원합니다.

| 기능 | 설명 | 비고 |
| --- | --- | --- |
| `LiteLLM AI Gateway` | ✅ |  |
| LiteLLM Python SDK | ✅ | `litellm.realtime()`를 통해 완전히 지원 |

## 빠른 시작

### 지원 모델 {#supported-model}

| 모델 | 컨텍스트 | 기능 |
|-------|---------|----------|
| `xai/grok-4-1-fast-non-reasoning` | 2M 토큰 | 음성 대화, 함수 호출, 비전, 오디오, 웹 검색, 캐싱 |

**참고:** xAI Realtime API는 최적의 실시간 성능을 위해 non-reasoning 변형을 사용합니다.

## Python SDK 사용법

### 기본 Realtime 연결 {#basic-realtime-connection}

```python
import asyncio
from litellm import realtime

async def test_xai_realtime():
    """
    Test xAI Grok Voice Agent via LiteLLM SDK
    """
    # Initialize realtime connection
    ws = await realtime(
        model="xai/grok-4-1-fast-non-reasoning",
        api_key="your-xai-api-key",  # or set XAI_API_KEY env var
    )
    
    # Connection established, xAI sends "conversation.created" event
    print("Connected to xAI Grok Voice Agent")
    
    # Send a message
    await ws.send_text(json.dumps({
        "type": "conversation.item.create",
        "item": {
            "type": "message",
            "role": "user",
            "content": [{
                "type": "input_text",
                "text": "Hello! How are you?"
            }]
        }
    }))
    
    # Request a response
    await ws.send_text(json.dumps({
        "type": "response.create"
    }))
    
    # Listen for responses
    async for message in ws:
        data = json.loads(message)
        print(f"Received: {data['type']}")
        
        if data['type'] == 'response.done':
            break
    
    await ws.close()

# Run the async function
asyncio.run(test_xai_realtime())
```

### 오디오 입력/출력 사용 {#with-audio-inputoutput}

```python
import asyncio
import json
from litellm import realtime

async def xai_voice_conversation():
    """
    Voice conversation with xAI Grok Voice Agent
    """
    ws = await realtime(
        model="xai/grok-4-1-fast-non-reasoning",
        api_key="your-xai-api-key",
    )
    
    # Send audio data (base64 encoded PCM16 24kHz)
    await ws.send_text(json.dumps({
        "type": "conversation.item.create",
        "item": {
            "type": "message",
            "role": "user",
            "content": [{
                "type": "input_audio",
                "audio": "base64_encoded_audio_data_here"
            }]
        }
    }))
    
    # Request response with audio
    await ws.send_text(json.dumps({
        "type": "response.create",
        "response": {
            "modalities": ["text", "audio"],
            "instructions": "Please respond in a friendly tone."
        }
    }))
    
    # Process streaming audio response
    async for message in ws:
        data = json.loads(message)
        
        if data['type'] == 'response.audio.delta':
            # Handle audio chunks
            audio_chunk = data['delta']
            # Process audio_chunk (play it, save it, etc.)
            
        elif data['type'] == 'response.done':
            break
    
    await ws.close()

asyncio.run(xai_voice_conversation())
```

## LiteLLM Proxy (AI Gateway) 사용법

여러 xAI 배포 간에 로드 밸런싱하거나 다른 provider와 함께 사용할 수 있습니다.

### 1. 설정에 모델 추가 {#1-add-model-to-config}

```yaml
model_list:
  - model_name: grok-voice-agent
    litellm_params:
      model: xai/grok-4-1-fast-non-reasoning
      api_key: os.environ/XAI_API_KEY
    model_info:
      mode: realtime

  # Optional: Add fallback to OpenAI
  - model_name: grok-voice-agent
    litellm_params:
      model: openai/gpt-4o-realtime-preview-2024-10-01
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

### 2. Proxy 시작 {#2-start-proxy}

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 3. 연결 테스트 {#3-test-connection}

#### Python 클라이언트 {#python-client}

```python
import asyncio
import websockets
import json

async def test_proxy():
    url = "ws://0.0.0.0:4000/v1/realtime?model=grok-voice-agent"
    
    async with websockets.connect(
        url,
        extra_headers={
            "Authorization": "Bearer sk-1234",  # Your LiteLLM proxy key
            "OpenAI-Beta": "realtime=v1"
        }
    ) as ws:
        # Wait for conversation.created event from xAI
        message = await ws.recv()
        print(f"Connected: {message}")
        
        # Send a message
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{
                    "type": "input_text",
                    "text": "Hello from LiteLLM proxy!"
                }]
            }
        }))
        
        # Request response
        await ws.send(json.dumps({
            "type": "response.create"
        }))
        
        # Listen for response
        async for message in ws:
            data = json.loads(message)
            print(f"Event: {data['type']}")
            
            if data['type'] == 'response.done':
                break

asyncio.run(test_proxy())
```

#### Node.js 클라이언트 {#nodejs-client}

```javascript
// test.js - Run with: node test.js
const WebSocket = require("ws");

const url = "ws://0.0.0.0:4000/v1/realtime?model=grok-voice-agent";

const ws = new WebSocket(url, {
    headers: {
        "Authorization": "Bearer sk-1234",
        "OpenAI-Beta": "realtime=v1",
    },
});

ws.on("open", function open() {
    console.log("Connected to xAI via LiteLLM proxy");
    
    // Send a message
    ws.send(JSON.stringify({
        type: "conversation.item.create",
        item: {
            type: "message",
            role: "user",
            content: [{
                type: "input_text",
                text: "What's the weather like?"
            }]
        }
    }));
    
    // Request response
    ws.send(JSON.stringify({
        type: "response.create",
        response: {
            modalities: ["text"],
            instructions: "Please assist the user."
        }
    }));
});

ws.on("message", function incoming(message) {
    const data = JSON.parse(message.toString());
    console.log(`Event: ${data.type}`);
    
    if (data.type === 'response.done') {
        ws.close();
    }
});

ws.on("error", function handleError(error) {
    console.error("Error: ", error);
});
```

## OpenAI와의 주요 차이점 {#key-differences-from-openai}

xAI의 Grok Voice Agent는 OpenAI의 Realtime API와 몇 가지 차이가 있습니다.

| 기능 | xAI | OpenAI | LiteLLM 처리 |
|---------|-----|--------|------------------|
| 초기 이벤트 | `conversation.created` | `session.created` | ⚠️ 그대로 전달 |
| WebSocket URL | `wss://api.x.ai/v1/realtime` | `wss://api.openai.com/v1/realtime` | ✅ 자동 설정 |
| 모델 | `grok-4-1-fast-non-reasoning` | `gpt-4o-realtime-preview` | ✅ 모델 접두사를 통해 처리 |
| 오디오 형식 | PCM16 24kHz mono | PCM16 24kHz mono | ✅ 호환 |
| 컨텍스트 윈도우 | 2M 토큰 | 128K 토큰 | N/A |

**LiteLLM이 처리하는 항목:**
- ✅ 올바른 provider로 자동 URL 라우팅
- ✅ 인증 headers(xAI에는 `OpenAI-Beta` header 없음)
- ✅ WebSocket 연결 관리
- ✅ 기타 모든 이벤트 타입 호환

**직접 처리해야 하는 항목:**
- ⚠️ 초기 이벤트 타입 차이(`conversation.created` vs `session.created`)

**팁:** 클라이언트가 두 이벤트 타입을 모두 처리할 수 있게 만드세요.
```python
# Handle both providers
if event['type'] in ['session.created', 'conversation.created']:
    print("Connection established")
```

## 관련 문서

- [xAI Chat/Text 모델](/docs/providers/xai)
- [LiteLLM Realtime API 개요](/docs/realtime)
- [xAI 공식 문서](https://docs.x.ai/docs)

## 지원 {#support}

이슈 또는 질문:
- [LiteLLM GitHub Issues](https://github.com/BerriAI/litellm/issues)
- [xAI 문서](https://docs.x.ai/docs)
