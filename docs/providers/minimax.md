import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MiniMax  

# `MiniMax - v1/messages` {#minimax-v1messages}

## 개요

LiteLLM은 MiniMax에 대해 Anthropic spec 호환 지원을 제공합니다.

## Supported 모델

MiniMax는 Anthropic 호환 API를 통해 세 가지 모델을 제공합니다.

| 모델 | 설명 | 입력 비용 | 출력 비용 | Prompt 캐싱 읽기 | Prompt 캐싱 쓰기 |
|-------|-------------|------------|-------------|---------------------|----------------------|
| **MiniMax-M2.1** | 향상된 프로그래밍 경험을 제공하는 강력한 다국어 프로그래밍 모델(~60 tps) | $0.3/M tokens | $1.2/M tokens | $0.03/M tokens | $0.375/M tokens |
| **MiniMax-M2.1-lightning** | 더 빠르고 민첩한 모델(~100 tps) | $0.3/M tokens | $2.4/M tokens | $0.03/M tokens | $0.375/M tokens |
| **MiniMax-M2** | agentic 기능과 고급 reasoning 지원 | $0.3/M tokens | $1.2/M tokens | $0.03/M tokens | $0.375/M tokens |


## 사용법 예제

### 기본 Chat Completion

```python
import litellm

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/anthropic/v1/messages",
    max_tokens=1000
)

print(response.choices[0].message.content)
```

### 환경 변수 사용

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
export MINIMAX_API_BASE="https://api.minimax.io/anthropic/v1/messages"
```

```python
import litellm

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=1000
)
```

### Thinking 사용(M2.1 기능)

```python
response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Solve: 2+2=?"}],
    thinking={"type": "enabled", "budget_tokens": 1000},
    api_key="your-minimax-api-key"
)

# Access thinking content
for block in response.choices[0].message.content:
    if hasattr(block, 'type') and block.type == 'thinking':
        print(f"Thinking: {block.thinking}")
```

### With 도구 호출

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = litellm.anthropic.messages.acreate(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "What's the weather in SF?"}],
    tools=tools,
    api_key="your-minimax-api-key",
    max_tokens=1000
)
```



## LiteLLM Proxy 사용법 

LiteLLM Proxy를 통해 routing하면 Anthropic SDK에서 MiniMax 모델을 사용할 수 있습니다.

| 단계 | 설명 |
|------|-------------|
| **1. LiteLLM Proxy 시작** | `config.yaml`에 MiniMax 모델을 포함해 proxy를 설정합니다. |
| **2. 환경 변수 설정** | Anthropic SDK가 proxy endpoint를 바라보도록 설정합니다. |
| **3. Anthropic SDK 사용** | native Anthropic SDK로 MiniMax 모델을 호출합니다. |

### 1단계: LiteLLM Proxy 설정

`config.yaml`을 생성합니다.

```yaml
model_list:
  - model_name: minimax/MiniMax-M2.1
    litellm_params:
      model: minimax/MiniMax-M2.1
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/anthropic/v1/messages
```

프록시 시작:

```bash
litellm --config config.yaml
```

### 2단계: Anthropic SDK와 함께 사용

```python
import os
os.environ["ANTHROPIC_BASE_URL"] = "http://localhost:4000"
os.environ["ANTHROPIC_API_KEY"] = "sk-1234"  # Your LiteLLM proxy key

import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="minimax/MiniMax-M2.1",
    max_tokens=1000,
    system="You are a helpful assistant.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Hi, how are you?"
                }
            ]
        }
    ]
)

for block in message.content:
    if block.type == "thinking":
        print(f"Thinking:\n{block.thinking}\n")
    elif block.type == "text":
        print(f"Text:\n{block.text}\n")
```

# `MiniMax - v1/chat/completions` {#minimax-v1chatcompletions}

## LiteLLM SDK 사용법

LiteLLM에서 MiniMax의 OpenAI 호환 API를 직접 사용할 수 있습니다.

### 기본 Chat Completion

```python
import litellm

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ],
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

print(response.choices[0].message.content)
```

### 환경 변수 사용

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
export MINIMAX_API_BASE="https://api.minimax.io/v1"
```

```python
import litellm

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Reasoning Split 사용

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Solve: 2+2=?"}
    ],
    extra_body={"reasoning_split": True},
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

# Access reasoning details if available
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking: {response.choices[0].message.reasoning_details}")
print(f"Response: {response.choices[0].message.content}")
```

### With 도구 호출

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "What's the weather in SF?"}],
    tools=tools,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)
```

### Streaming

```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True,
    api_key="your-minimax-api-key",
    api_base="https://api.minimax.io/v1"
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```


## LiteLLM Proxy를 통한 OpenAI SDK 사용법

LiteLLM Proxy를 통해 routing하면 OpenAI SDK에서도 MiniMax 모델을 사용할 수 있습니다.

| 단계 | 설명 |
|------|-------------|
| **1. LiteLLM Proxy 시작** | `config.yaml`에 MiniMax 모델을 포함해 proxy를 설정합니다. |
| **2. 환경 변수 설정** | OpenAI SDK가 proxy endpoint를 바라보도록 설정합니다. |
| **3. OpenAI SDK 사용** | native OpenAI SDK로 MiniMax 모델을 호출합니다. |

### 1단계: LiteLLM Proxy 설정

`config.yaml`을 생성합니다.

```yaml
model_list:
  - model_name: minimax/MiniMax-M2.1
    litellm_params:
      model: minimax/MiniMax-M2.1
      api_key: os.environ/MINIMAX_API_KEY
      api_base: https://api.minimax.io/v1
```

프록시 시작:

```bash
litellm --config config.yaml
```

### 2단계: OpenAI SDK와 함께 사용

```python
import os
os.environ["OPENAI_BASE_URL"] = "http://localhost:4000"
os.environ["OPENAI_API_KEY"] = "sk-1234"  # Your LiteLLM proxy key

from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hi, how are you?"},
    ],
    # Set reasoning_split=True to separate thinking content
    extra_body={"reasoning_split": True},
)

# Access thinking and response
if hasattr(response.choices[0].message, 'reasoning_details'):
    print(f"Thinking:\n{response.choices[0].message.reasoning_details[0]['text']}\n")
print(f"Text:\n{response.choices[0].message.content}\n")
```

### OpenAI SDK로 Streaming

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="minimax/MiniMax-M2.1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a story"},
    ],
    extra_body={"reasoning_split": True},
    stream=True,
)

reasoning_buffer = ""
text_buffer = ""

for chunk in stream:
    if hasattr(chunk.choices[0].delta, "reasoning_details") and chunk.choices[0].delta.reasoning_details:
        for detail in chunk.choices[0].delta.reasoning_details:
            if "text" in detail:
                reasoning_text = detail["text"]
                new_reasoning = reasoning_text[len(reasoning_buffer):]
                if new_reasoning:
                    print(new_reasoning, end="", flush=True)
                    reasoning_buffer = reasoning_text

    if chunk.choices[0].delta.content:
        content_text = chunk.choices[0].delta.content
        new_text = content_text[len(text_buffer):] if text_buffer else content_text
        if new_text:
            print(new_text, end="", flush=True)
            text_buffer = content_text
```

## 비용 계산

비용 계산은 `model_prices_and_context_window.json`의 pricing 정보를 사용해 자동으로 동작합니다.

예제:
```python
response = litellm.completion(
    model="minimax/MiniMax-M2.1",
    messages=[{"role": "user", "content": "Hello!"}],
    api_key="your-minimax-api-key"
)

# Access cost information
print(f"Cost: ${response._hidden_params.get('response_cost', 0)}")
```

# `MiniMax - Text-to-Speech` {#minimax-text-to-speech}

## 빠른 시작

## **LiteLLM Python SDK 사용법**

### 기본 사용법

```python
from pathlib import Path
from litellm import speech
import os 

os.environ["MINIMAX_API_KEY"] = "your-api-key"

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="The quick brown fox jumped over the lazy dogs",
)
response.stream_to_file(speech_file_path)
```

### 비동기 사용법

```python
from litellm import aspeech
from pathlib import Path
import os, asyncio

os.environ["MINIMAX_API_KEY"] = "your-api-key"

async def test_async_speech(): 
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response = await aspeech(
        model="minimax/speech-2.6-hd",
        voice="alloy",
        input="The quick brown fox jumped over the lazy dogs",
    )
    response.stream_to_file(speech_file_path)

asyncio.run(test_async_speech())
```

### Voice 선택

MiniMax는 다양한 voice를 지원합니다. LiteLLM은 MiniMax voice로 매핑되는 OpenAI 호환 voice 이름을 제공합니다.

```python
from litellm import speech

# OpenAI-compatible voice names
voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

for voice in voices:
    response = speech(
        model="minimax/speech-2.6-hd",
        voice=voice,
        input=f"This is the {voice} voice",
    )
    response.stream_to_file(f"speech_{voice}.mp3")
```

MiniMax native voice ID를 직접 사용할 수도 있습니다.

```python
response = speech(
    model="minimax/speech-2.6-hd",
    voice="male-qn-qingse",  # MiniMax native voice ID
    input="Using native MiniMax voice ID",
)
```

### 사용자 지정 파라미터

MiniMax TTS는 audio output을 세밀하게 조정하기 위한 추가 파라미터를 지원합니다.

```python
from litellm import speech

response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="Custom audio parameters",
    speed=1.5,  # Speed: 0.5 to 2.0
    response_format="mp3",  # Format: mp3, pcm, wav, flac
    extra_body={
        "vol": 1.2,  # Volume: 0.1 to 10
        "pitch": 2,  # Pitch adjustment: -12 to 12
        "sample_rate": 32000,  # 16000, 24000, or 32000
        "bitrate": 128000,  # For MP3: 64000, 128000, 192000, 256000
        "channel": 1,  # 1 for mono, 2 for stereo
    }
)
response.stream_to_file("custom_speech.mp3")
```

### 응답 형식

```python
from litellm import speech

# MP3 format (default)
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="MP3 format audio",
    response_format="mp3",
)

# PCM format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="PCM format audio",
    response_format="pcm",
)

# WAV format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="WAV format audio",
    response_format="wav",
)

# FLAC format
response = speech(
    model="minimax/speech-2.6-hd",
    voice="alloy",
    input="FLAC format audio",
    response_format="flac",
)
```

## **LiteLLM Proxy 사용법**

LiteLLM은 MiniMax TTS용 OpenAI 호환 `/audio/speech` 엔드포인트를 제공합니다.

### 설정

proxy 구성에 MiniMax를 추가합니다.

```yaml
model_list:
  - model_name: tts
    litellm_params:
      model: minimax/speech-2.6-hd
      api_key: os.environ/MINIMAX_API_KEY
  
  - model_name: tts-turbo
    litellm_params:
      model: minimax/speech-2.6-turbo
      api_key: os.environ/MINIMAX_API_KEY
```

프록시 시작:

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 요청 보내기

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

사용자 지정 파라미터 사용:

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts",
    "input": "Custom parameters example.",
    "voice": "nova",
    "speed": 1.5,
    "response_format": "mp3",
    "extra_body": {
      "vol": 1.2,
      "pitch": 1,
      "sample_rate": 32000
    }
  }' \
  --output custom_speech.mp3
```

## Voice 매핑

LiteLLM은 OpenAI 호환 voice 이름을 MiniMax voice ID로 매핑합니다.

| OpenAI Voice | MiniMax Voice ID | 설명 |
|--------------|------------------|-------------|
| alloy | male-qn-qingse | 남성 voice |
| echo | male-qn-jingying | 남성 voice |
| fable | female-shaonv | 여성 voice |
| onyx | male-qn-badao | 남성 voice |
| nova | female-yujie | 여성 voice |
| shimmer | female-tianmei | 여성 voice |

MiniMax native voice ID를 `voice` 파라미터로 전달해 직접 사용할 수도 있습니다.


### `Streaming(WebSocket)` {#streaming-websocket}

:::note
현재 구현은 MiniMax의 HTTP endpoint를 사용합니다. WebSocket streaming 지원은 MiniMax 공식 문서 [https://platform.minimax.io/docs](https://platform.minimax.io/docs)를 참고하세요.
:::

## 오류 처리

```python
from litellm import speech
import litellm

try:
    response = speech(
        model="minimax/speech-2.6-hd",
        voice="alloy",
        input="Test input",
    )
    response.stream_to_file("output.mp3")
except litellm.exceptions.BadRequestError as e:
    print(f"Bad request: {e}")
except litellm.exceptions.AuthenticationError as e:
    print(f"Authentication failed: {e}")
except Exception as e:
    print(f"Error: {e}")
```

### Extra Body 파라미터

다음 값을 `extra_body`로 전달합니다.

| 파라미터 | 타입 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| vol | float | volume(0.1~10) | 1.0 |
| pitch | int | pitch 조정(-12~12) | 0 |
| sample_rate | int | sample rate 값: 16000, 24000, 32000 | 32000 |
| bitrate | int | MP3 bitrate 값: 64000, 128000, 192000, 256000 | 128000 |
| channel | int | audio channel: 1(mono) 또는 2(stereo) | 1 |
| output_format | string | output format: "hex" 또는 "url"(`url`은 24시간 유효한 URL 반환) | hex |
