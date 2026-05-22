# `Bedrock Realtime API` {#bedrock-realtime-api}

## 개요

Amazon Bedrock의 Nova Sonic 모델은 음성 대화를 위한 실시간 양방향 오디오 스트리밍을 지원합니다. 이 튜토리얼은 LiteLLM Proxy를 통해 사용하는 방법을 보여줍니다.

## 설정 {#setup}

### 1. LiteLLM Proxy 구성 {#1-configure-litellm-proxy}

`config.yaml` 파일을 생성합니다.

```yaml
model_list:
  - model_name: "bedrock-sonic"
    litellm_params:
      model: bedrock/amazon.nova-sonic-v1:0
      aws_region_name: us-east-1  # or your preferred region
    model_info:
      mode: realtime
```

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```bash
litellm --config config.yaml
```

## 기본 텍스트 상호작용 {#basic-text-interaction}

```python
import asyncio
import websockets
import json

LITELLM_API_KEY = "sk-1234"  # Your LiteLLM API key
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

async def test_text_conversation():
    async with websockets.connect(
        LITELLM_URL,
        additional_headers={
            "Authorization": f"Bearer {LITELLM_API_KEY}"
        }
    ) as ws:
        # Wait for session.created
        response = await ws.recv()
        print(f"Connected: {json.loads(response)['type']}")
        
        # Configure session
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a helpful assistant.",
                "modalities": ["text"],
                "temperature": 0.8
            }
        }
        await ws.send(json.dumps(session_update))
        
        # Send a message
        message = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "Hello!"}]
            }
        }
        await ws.send(json.dumps(message))
        
        # Trigger response
        await ws.send(json.dumps({"type": "response.create"}))
        
        # Listen for response
        while True:
            response = await ws.recv()
            event = json.loads(response)
            
            if event['type'] == 'response.text.delta':
                print(event['delta'], end='', flush=True)
            elif event['type'] == 'response.done':
                print("\n✓ Complete")
                break

if __name__ == "__main__":
    asyncio.run(test_text_conversation())
```

## 음성 대화를 위한 오디오 스트리밍 {#audio-streaming-with-voice-conversation}

```python
import asyncio
import websockets
import json
import base64
import pyaudio

LITELLM_API_KEY = "sk-1234"
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

# Audio configuration
INPUT_RATE = 16000   # Nova Sonic expects 16kHz input
OUTPUT_RATE = 24000  # Nova Sonic outputs 24kHz
CHUNK = 1024

async def audio_conversation():
    # Initialize PyAudio
    p = pyaudio.PyAudio()
    
    # Input stream (microphone)
    input_stream = p.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=INPUT_RATE,
        input=True,
        frames_per_buffer=CHUNK
    )
    
    # Output stream (speakers)
    output_stream = p.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=OUTPUT_RATE,
        output=True,
        frames_per_buffer=CHUNK
    )
    
    async with websockets.connect(
        LITELLM_URL,
        additional_headers={"Authorization": f"Bearer {LITELLM_API_KEY}"}
    ) as ws:
        # Wait for session.created
        await ws.recv()
        print("✓ Connected")
        
        # Configure session with audio
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a friendly voice assistant.",
                "modalities": ["text", "audio"],
                "voice": "matthew",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16"
            }
        }
        await ws.send(json.dumps(session_update))
        print("🎤 Speak into your microphone...")
        
        async def send_audio():
            """Capture and send audio from microphone"""
            while True:
                audio_data = input_stream.read(CHUNK, exception_on_overflow=False)
                audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                await ws.send(json.dumps({
                    "type": "input_audio_buffer.append",
                    "audio": audio_b64
                }))
                await asyncio.sleep(0.01)
        
        async def receive_audio():
            """Receive and play audio responses"""
            while True:
                response = await ws.recv()
                event = json.loads(response)
                
                if event['type'] == 'response.audio.delta':
                    audio_b64 = event.get('delta', '')
                    if audio_b64:
                        audio_bytes = base64.b64decode(audio_b64)
                        output_stream.write(audio_bytes)
                
                elif event['type'] == 'response.text.delta':
                    print(event['delta'], end='', flush=True)
                
                elif event['type'] == 'response.done':
                    print("\n✓ Response complete")
        
        # Run both tasks concurrently
        await asyncio.gather(send_audio(), receive_audio())

if __name__ == "__main__":
    try:
        asyncio.run(audio_conversation())
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
```

## 도구/함수 호출 사용 {#using-toolsfunction-calling}

```python
import asyncio
import websockets
import json
from datetime import datetime

LITELLM_API_KEY = "sk-1234"
LITELLM_URL = 'ws://localhost:4000/v1/realtime?model=bedrock-sonic'

# Define tools
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

def get_weather(location: str) -> dict:
    """Simulated weather function"""
    return {
        "location": location,
        "temperature": 72,
        "conditions": "sunny"
    }

async def conversation_with_tools():
    async with websockets.connect(
        LITELLM_URL,
        additional_headers={"Authorization": f"Bearer {LITELLM_API_KEY}"}
    ) as ws:
        # Wait for session.created
        await ws.recv()
        
        # Configure session with tools
        session_update = {
            "type": "session.update",
            "session": {
                "instructions": "You are a helpful assistant with access to tools.",
                "modalities": ["text"],
                "tools": TOOLS
            }
        }
        await ws.send(json.dumps(session_update))
        
        # Send a message that requires a tool
        message = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "What's the weather in San Francisco?"}]
            }
        }
        await ws.send(json.dumps(message))
        await ws.send(json.dumps({"type": "response.create"}))
        
        # Handle responses and tool calls
        while True:
            response = await ws.recv()
            event = json.loads(response)
            
            if event['type'] == 'response.text.delta':
                print(event['delta'], end='', flush=True)
            
            elif event['type'] == 'response.function_call_arguments.done':
                # Execute the tool
                function_name = event['name']
                arguments = json.loads(event['arguments'])
                
                print(f"\n🔧 Calling {function_name}({arguments})")
                result = get_weather(**arguments)
                
                # Send tool result back
                tool_result = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": event['call_id'],
                        "output": json.dumps(result)
                    }
                }
                await ws.send(json.dumps(tool_result))
                await ws.send(json.dumps({"type": "response.create"}))
            
            elif event['type'] == 'response.done':
                print("\n✓ Complete")
                break

if __name__ == "__main__":
    asyncio.run(conversation_with_tools())
```

## 설정 옵션 {#설정-options}

### 음성 옵션 {#voice-options}
사용 가능한 음성: `matthew`, `joanna`, `ruth`, `stephen`, `gregory`, `amy`

### 오디오 형식 {#audio-formats}
- **입력**: 16kHz PCM16 (mono)
- **출력**: 24kHz PCM16 (mono)

### Modalities
- `["text"]` - 텍스트만
- `["audio"]` - 오디오만  
- `["text", "audio"]` - 텍스트와 오디오 모두

## 예제 테스트 스크립트 {#예제-test-scripts}

완전히 동작하는 예제는 LiteLLM 저장소에서 확인할 수 있습니다.

- **기본 오디오 스트리밍**: `test_bedrock_realtime_client.py`
- **간단한 텍스트 테스트**: `test_bedrock_realtime_simple.py`
- **도구 호출**: `test_bedrock_realtime_tools.py`

## 요구 사항 {#requirements}

```bash
uv add litellm websockets pyaudio
```

## AWS 설정

AWS 자격 증명이 구성되어 있는지 확인합니다.

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION_NAME=us-east-1
```

또는 AWS CLI 구성을 사용합니다.

```bash
aws configure
```

## 문제 해결

### 연결 문제 {#connection-issues}
- LiteLLM proxy가 올바른 포트에서 실행 중인지 확인합니다.
- AWS 자격 증명이 올바르게 구성되어 있는지 확인합니다.
- 해당 Bedrock 모델을 현재 리전에서 사용할 수 있는지 확인합니다.

### 오디오 문제 {#audio-issues}
- PyAudio가 올바르게 설치되어 있는지 확인합니다.
- 마이크/스피커 권한을 확인합니다.
- 올바른 샘플 레이트를 사용하는지 확인합니다(16kHz 입력, 24kHz 출력).

### 도구 호출 문제 {#도구-호출-issues}
- 도구가 `session.update`에 올바르게 정의되어 있는지 확인합니다.
- 도구 결과가 올바른 `call_id`와 함께 다시 전송되는지 확인합니다.
- 도구 결과 이후 `response.create`가 전송되는지 확인합니다.

## 관련 리소스 {#related-resources}

- [OpenAI Realtime API 문서](https://platform.openai.com/docs/guides/realtime)
- [Amazon Bedrock Nova Sonic 문서](https://docs.aws.amazon.com/bedrock/latest/userguide/nova-sonic.html)
- [LiteLLM Realtime API 문서](/docs/realtime)
