import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI TTS {#vertex-ai-text-to-speech}

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Chirp3 HD 음성 및 Gemini TTS를 사용하는 `Google Cloud Text-to-Speech` |
| LiteLLM의 Provider Route | `vertex_ai/chirp` (Chirp), `vertex_ai/gemini-*-tts` (Gemini) |

## Chirp3 HD Voices {#chirp3-hd-voices}

고품질 Chirp3 HD 음성을 사용하는 `Google Cloud Text-to-Speech API`입니다.

### 빠른 시작

#### LiteLLM Python SDK

```python showLineNumbers title="Chirp3 Quick Start"
from litellm import speech
from pathlib import Path

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="vertex_ai/chirp",
    voice="alloy",  # OpenAI voice name - automatically mapped
    input="Hello, this is Vertex AI Text to Speech",
    vertex_project="your-project-id",
    vertex_location="us-central1",
)
response.stream_to_file(speech_file_path)
```

#### LiteLLM AI Gateway

**1. config.yaml 설정**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: vertex-tts
    litellm_params:
      model: vertex_ai/chirp
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

**2. 프록시 시작**

```bash title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml
```

**3. 요청 보내기**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Chirp3 Quick Start"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "alloy",
    "input": "Hello, this is Vertex AI Text to Speech"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Chirp3 Quick Start"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice="alloy",
    input="Hello, this is Vertex AI Text to Speech",
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

### 음성 매핑 {#voice-mapping}

LiteLLM은 OpenAI 음성 이름을 Google Cloud 음성에 매핑합니다. OpenAI 음성 또는 Google Cloud 음성을 직접 사용할 수 있습니다.

| OpenAI 음성 | Google Cloud 음성 |
|-------------|-------------------|
| `alloy` | en-US-Studio-O |
| `echo` | en-US-Studio-M |
| `fable` | en-GB-Studio-B |
| `onyx` | en-US-Wavenet-D |
| `nova` | en-US-Studio-O |
| `shimmer` | en-US-Wavenet-F |

### Google Cloud Voices 직접 사용 {#using-google-cloud-voices-directly}

#### LiteLLM Python SDK

```python showLineNumbers title="Chirp3 HD Voice"
from litellm import speech

# Pass Chirp3 HD voice name directly
response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Chirp3-HD-Charon",
    input="Hello with a Chirp3 HD voice",
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Voice as Dict (Multilingual)"
from litellm import speech

# Pass as dict for full control over language and voice
response = speech(
    model="vertex_ai/chirp",
    voice={
        "languageCode": "de-DE",
        "name": "de-DE-Chirp3-HD-Charon",
    },
    input="Hallo, dies ist ein Test",
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

#### LiteLLM AI Gateway

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Chirp3 HD Voice"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "en-US-Chirp3-HD-Charon",
    "input": "Hello with a Chirp3 HD voice"
  }' \
  --output speech.mp3
```

```bash showLineNumbers title="Voice as Dict (Multilingual)"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": {"languageCode": "de-DE", "name": "de-DE-Chirp3-HD-Charon"},
    "input": "Hallo, dies ist ein Test"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Chirp3 HD Voice"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice="en-US-Chirp3-HD-Charon",
    input="Hello with a Chirp3 HD voice",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Voice as Dict (Multilingual)"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.audio.speech.create(
    model="vertex-tts",
    voice={"languageCode": "de-DE", "name": "de-DE-Chirp3-HD-Charon"},
    input="Hallo, dies ist ein Test",
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

사용 가능한 음성은 [Google Cloud Text-to-Speech Console](https://console.cloud.google.com/vertex-ai/generative/speech/text-to-speech)에서 확인할 수 있습니다.

### Raw SSML 전달 {#passing-raw-ssml}

입력에 `<speak>` 태그가 포함되어 있으면 LiteLLM이 SSML을 자동 감지하고 변경 없이 전달합니다.

#### LiteLLM Python SDK

```python showLineNumbers title="SSML Input"
from litellm import speech

ssml = """
<speak>
    <p>Hello, world!</p>
    <p>This is a test of the <break strength="medium" /> text-to-speech API.</p>
</speak>
"""

response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Studio-O",
    input=ssml,  # Auto-detected as SSML
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Force SSML Mode"
from litellm import speech

# Force SSML mode with use_ssml=True
response = speech(
    model="vertex_ai/chirp",
    voice="en-US-Studio-O",
    input="<speak><prosody rate='slow'>Speaking slowly</prosody></speak>",
    use_ssml=True,
    vertex_project="your-project-id",
)
response.stream_to_file("speech.mp3")
```

#### LiteLLM AI Gateway

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="SSML Input"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "voice": "en-US-Studio-O",
    "input": "<speak><p>Hello!</p><break time=\"500ms\"/><p>How are you?</p></speak>"
  }' \
  --output speech.mp3
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="SSML Input"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

ssml = """<speak><p>Hello!</p><break time="500ms"/><p>How are you?</p></speak>"""

response = client.audio.speech.create(
    model="vertex-tts",
    voice="en-US-Studio-O",
    input=ssml,
)
response.stream_to_file("speech.mp3")
```

</TabItem>
</Tabs>

### 지원 파라미터

| 파라미터 | 설명 | 값 |
|-----------|-------------|--------|
| `voice` | 음성 선택 | OpenAI 음성, Google Cloud 음성 이름 또는 dict |
| `input` | 변환할 텍스트 | 일반 텍스트 또는 SSML |
| `speed` | 말하기 속도 | 0.25~4.0 (기본값: 1.0) |
| `response_format` | 오디오 형식 | `mp3`, `opus`, `wav`, `pcm`, `flac` |
| `use_ssml` | SSML 모드 강제 적용 | `True` / `False` |

### 비동기 사용법 {#async-사용법}

```python showLineNumbers title="Async Speech Generation"
import asyncio
from litellm import aspeech

async def main():
    response = await aspeech(
        model="vertex_ai/chirp",
        voice="alloy",
        input="Hello from async",
        vertex_project="your-project-id",
    )
    response.stream_to_file("speech.mp3")

asyncio.run(main())
```

---

## Gemini TTS {#gemini-tts}

chat completions API를 사용해 오디오 출력 기능을 제공하는 Gemini 모델입니다.

:::warning
**제한 사항:**
- `pcm16` 오디오 형식만 지원합니다.
- 스트리밍은 아직 지원되지 않습니다.
- `modalities: ["audio"]`를 설정해야 합니다.
- LiteLLM Proxy를 통해 사용할 때는 오디오 파라미터를 활성화하기 위해 요청 본문에 `"allowed_openai_params": ["audio", "modalities"]`를 포함해야 합니다.
:::

### 빠른 시작

#### LiteLLM Python SDK

```python showLineNumbers title="Gemini TTS Quick Start"
from litellm import completion
import json

# Load credentials
with open('path/to/service_account.json', 'r') as file:
    vertex_credentials = json.dumps(json.load(file))

response = completion(
    model="vertex_ai/gemini-2.5-flash-preview-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],
    audio={
        "voice": "Kore",
        "format": "pcm16"
    },
    vertex_credentials=vertex_credentials
)
print(response)
```

#### LiteLLM AI Gateway

**1. config.yaml 설정**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-tts
    litellm_params:
      model: vertex_ai/gemini-2.5-flash-preview-tts
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: "/path/to/service_account.json"
```

**2. 프록시 시작**

```bash title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml
```

**3. 요청 보내기**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Gemini TTS Request"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemini-tts",
    "messages": [{"role": "user", "content": "Say hello in a friendly voice"}],
    "modalities": ["audio"],
    "audio": {"voice": "Kore", "format": "pcm16"},
    "allowed_openai_params": ["audio", "modalities"]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Gemini TTS Request"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="gemini-tts",
    messages=[{"role": "user", "content": "Say hello in a friendly voice"}],
    modalities=["audio"],
    audio={"voice": "Kore", "format": "pcm16"},
    extra_body={"allowed_openai_params": ["audio", "modalities"]}
)
print(response)
```

</TabItem>
</Tabs>

### 지원 모델 {#supported-모델}

- `vertex_ai/gemini-2.5-flash-preview-tts`
- `vertex_ai/gemini-2.5-pro-preview-tts`

사용 가능한 음성은 [Gemini TTS documentation](https://ai.google.dev/gemini-api/docs/speech-generation)을 참고하세요.

### 고급 사용법

```python showLineNumbers title="Gemini TTS with System Prompt"
from litellm import completion

response = completion(
    model="vertex_ai/gemini-2.5-pro-preview-tts",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that speaks clearly."},
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    modalities=["audio"],
    audio={"voice": "Charon", "format": "pcm16"},
    temperature=0.7,
    max_tokens=150,
    vertex_credentials=vertex_credentials
)
```
