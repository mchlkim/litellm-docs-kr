import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiveKit xAI Realtime 음성 에이전트 {#livekit-xai-realtime-voice-agent}

LiteLLM Proxy와 함께 LiveKit의 xAI Grok Voice Agent 플러그인을 사용해 지연 시간이 낮은 음성 AI 에이전트를 빌드합니다.

LiveKit Agents 프레임워크는 실시간 음성 및 비디오 AI 애플리케이션을 만들기 위한 도구를 제공합니다. LiteLLM Proxy를 통해 라우팅하면 여러 realtime 음성 provider에 대한 통합 접근, 비용 추적, rate limit 등을 사용할 수 있습니다.

## 빠른 시작

### 1. 의존성 설치 {#1-install-dependencies}

```bash
uv add livekit-agents[xai]
```

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

xAI realtime 모델을 포함한 설정 파일을 만듭니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: grok-voice-agent
    litellm_params:
      model: xai/grok-2-vision-1212
      api_key: os.environ/XAI_API_KEY
    model_info:
      mode: realtime

litellm_settings:
  drop_params: True

general_settings:
  master_key: sk-1234  # Change this to a secure key
```

프록시 시작:

```bash
litellm --config config.yaml --port 4000
```

### 3. LiveKit xAI 플러그인 구성 {#3-configure-livekit-xai-plugin}

LiveKit의 xAI 플러그인이 LiteLLM proxy를 바라보도록 설정합니다.

```python
from livekit.plugins import xai

# Configure xAI to use LiteLLM proxy
model = xai.realtime.RealtimeModel(
    voice="ara",                      # Voice option
    api_key="sk-1234",               # Your LiteLLM proxy master key
    base_url="http://localhost:4000", # LiteLLM proxy URL
)
```

## 전체 예제 {#complete-example}

아래는 바로 실행 가능한 전체 예제입니다.

<Tabs>
<TabItem value="python" label="Python Client">

```python
#!/usr/bin/env python3
"""
Simple xAI realtime voice agent through LiteLLM proxy.
"""
import asyncio
import json
import websockets

PROXY_URL = "ws://localhost:4000/v1/realtime"
API_KEY = "sk-1234"
MODEL = "grok-voice-agent"

async def run_voice_agent():
    """Connect to xAI realtime API through LiteLLM proxy"""
    url = f"{PROXY_URL}?model={MODEL}"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    
    async with websockets.connect(url, extra_headers=headers) as ws:
        # Wait for initial connection event
        initial = json.loads(await ws.recv())
        print(f"✅ Connected: {initial['type']}")
        
        # Send user message
        await ws.send(json.dumps({
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [{
                    "type": "input_text",
                    "text": "Hello! Tell me a joke."
                }]
            }
        }))
        
        # Request response
        await ws.send(json.dumps({
            "type": "response.create",
            "response": {"modalities": ["text", "audio"]}
        }))
        
        # Collect response
        transcript = []
        async for message in ws:
            event = json.loads(message)
            
            # Capture text response
            if event['type'] == 'response.output_audio_transcript.delta':
                transcript.append(event['delta'])
                print(event['delta'], end='', flush=True)
            
            # Done when response completes
            elif event['type'] == 'response.done':
                break
        
        print(f"\n\n✅ Full response: {''.join(transcript)}")

if __name__ == "__main__":
    asyncio.run(run_voice_agent())
```

</TabItem>

<TabItem value="livekit" label="LiveKit Agent">

```python
from livekit.agents import Agent, AgentSession, WorkerOptions, cli
from livekit.plugins import xai

class VoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are a helpful voice assistant.",
            llm=xai.realtime.RealtimeModel(
                voice="ara",
                api_key="sk-1234",
                base_url="http://localhost:4000",
            ),
        )

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            agent_factory=VoiceAgent,
        )
    )
```

</TabItem>
</Tabs>

## 예제 실행 {#running-the-example}

1. **LiteLLM Proxy 시작**(아직 실행 중이 아니라면):
   ```bash
   litellm --config config.yaml --port 4000
   ```

2. **예제 실행**:
   ```bash
   python your_script.py
   ```

## 예상 출력 {#expected-output}

```
✅ Connected: conversation.created
Hello! Here's a joke for you: Why don't scientists trust atoms? 
Because they make up everything!

✅ Full response: Hello! Here's a joke for you: Why don't scientists trust atoms? Because they make up everything!
```


## 전체 동작 예제 {#complete-working-example}

**[LiveKit Agent SDK Cookbook](https://github.com/BerriAI/litellm/tree/main/cookbook/livekit_agent_sdk)**


## 학습 더 보기

- [xAI Realtime API](/litellm-docs-kr/docs/providers/xai_realtime)
- [LiveKit xAI Plugin](https://docs.livekit.io/agents/models/realtime/plugins/xai/)
- [LiteLLM Realtime API](/litellm-docs-kr/docs/realtime)
