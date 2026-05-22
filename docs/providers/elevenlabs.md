import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ElevenLabs

ElevenLabs는 변환 API를 통한 음성-텍스트 변환 기능을 포함해 고품질 AI 음성 기술을 제공합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | ElevenLabs는 여러 언어와 화자 분리를 지원하는 음성-텍스트 변환 및 텍스트-음성 변환 기능을 갖춘 고급 AI 음성 기술을 제공합니다. |
| LiteLLM의 프로바이더 경로 | `elevenlabs/` |
| 프로바이더 문서 | [ElevenLabs API ↗](https://elevenlabs.io/docs/api-reference) |
| 지원 엔드포인트 | `/audio/transcriptions`, `/audio/speech` |

## 빠른 시작

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

```python showLineNumbers title="Basic audio transcription with ElevenLabs"
import litellm

# Transcribe audio file
with open("audio.mp3", "rb") as audio_file:
    response = litellm.transcription(
        model="elevenlabs/scribe_v1",
        file=audio_file,
        api_key="your-elevenlabs-api-key"  # or set ELEVENLABS_API_KEY env var
    )

print(response.text)
```

</TabItem>

<TabItem value="advanced" label="고급 기능">

```python showLineNumbers title="Audio transcription with advanced features"
import litellm

# Transcribe with speaker diarization and language specification
with open("audio.wav", "rb") as audio_file:
    response = litellm.transcription(
        model="elevenlabs/scribe_v1",
        file=audio_file,
        language="en",           # Language hint (maps to language_code)
        temperature=0.3,         # Control randomness in transcription
        diarize=True,           # Enable speaker diarization
        api_key="your-elevenlabs-api-key"
    )

print(f"Transcription: {response.text}")
print(f"Language: {response.language}")

# Access word-level timestamps if available
if hasattr(response, 'words') and response.words:
    for word_info in response.words:
        print(f"Word: {word_info['word']}, Start: {word_info['start']}, End: {word_info['end']}")
```

</TabItem>

<TabItem value="async" label="비동기 사용법">

```python showLineNumbers title="Async audio transcription"
import litellm
import asyncio

async def transcribe_audio():
    with open("audio.mp3", "rb") as audio_file:
        response = await litellm.atranscription(
            model="elevenlabs/scribe_v1",
            file=audio_file,
            api_key="your-elevenlabs-api-key"
        )
    
    return response.text

# Run async transcription
result = asyncio.run(transcribe_audio())
print(result)
```

</TabItem>
</Tabs>

### LiteLLM Proxy

#### 1. 프록시 설정

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="ElevenLabs configuration in config.yaml"
model_list:
  - model_name: elevenlabs-transcription
    litellm_params:
      model: elevenlabs/scribe_v1
      api_key: os.environ/ELEVENLABS_API_KEY

general_settings:
  master_key: your-master-key
```

</TabItem>

<TabItem value="env-vars" label="환경 변수">

```bash showLineNumbers title="Required environment variables"
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"
export LITELLM_MASTER_KEY="your-master-key"
```

</TabItem>
</Tabs>

#### 2. 프록시 시작

```bash showLineNumbers title="Start LiteLLM proxy server"
litellm --config config.yaml

# Proxy will be available at http://localhost:4000
```

#### 3. 변환 요청 보내기

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Audio transcription with curl"
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@audio.mp3" \
  -F model="elevenlabs-transcription" \
  -F language="en" \
  -F temperature="0.3"
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Using OpenAI SDK with LiteLLM proxy"
from openai import OpenAI

# Initialize client with your LiteLLM proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

# Transcribe audio file
with open("audio.mp3", "rb") as audio_file:
    response = client.audio.transcriptions.create(
        model="elevenlabs-transcription",
        file=audio_file,
        language="en",
        temperature=0.3,
        # ElevenLabs-specific parameters
        diarize=True,
        speaker_boost=True,
        custom_vocabulary="technical,AI,machine learning"
    )

print(response.text)
```

</TabItem>

<TabItem value="javascript" label="JavaScript/Node.js">

```javascript showLineNumbers title="Audio transcription with JavaScript"
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  baseURL: 'http://localhost:4000',
  apiKey: 'your-litellm-api-key'
});

async function transcribeAudio() {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream('audio.mp3'),
    model: 'elevenlabs-transcription',
    language: 'en',
    temperature: 0.3,
    diarize: true,
    speaker_boost: true
  });

  console.log(response.text);
}

transcribeAudio();
```

</TabItem>
</Tabs>

## 응답 형식

ElevenLabs는 변환 응답을 OpenAI 호환 형식으로 반환합니다.

```json showLineNumbers title="Example transcription response"
{
  "text": "Hello, this is a sample transcription with multiple speakers.",
  "task": "transcribe",
  "language": "en",
  "words": [
    {
      "word": "Hello",
      "start": 0.0,
      "end": 0.5
    },
    {
      "word": "this",
      "start": 0.5,
      "end": 0.8
    }
  ]
}
```

### 자주 발생하는 문제

1. **잘못된 API 키**: `ELEVENLABS_API_KEY`가 올바르게 설정되었는지 확인하세요.

---

## 텍스트-음성 변환 (TTS)

ElevenLabs는 TTS API를 통해 여러 음성, 언어, 오디오 형식을 지원하는 고품질 텍스트-음성 변환 기능을 제공합니다.

### 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | ElevenLabs의 고급 TTS 모델을 사용해 텍스트를 자연스럽게 들리는 음성으로 변환합니다. |
| LiteLLM의 프로바이더 경로 | `elevenlabs/` |
| 지원 작업 | `/audio/speech` |
| 프로바이더 문서 링크 | [ElevenLabs TTS API ↗](https://elevenlabs.io/docs/api-reference/text-to-speech) |

### 지원 모델

| 모델 | 경로 | 설명 |
|-------|-------|-------------|
| Eleven v3 | `elevenlabs/eleven_v3` | 가장 표현력이 뛰어난 모델입니다. 70개 이상의 언어와 효과음 및 일시 정지를 위한 오디오 태그를 지원합니다. |
| Eleven Multilingual v2 | `elevenlabs/eleven_multilingual_v2` | 기본 TTS 모델입니다. 29개 언어를 지원하며 안정적이고 프로덕션에 사용할 수 있습니다. |

### 빠른 시작

#### LiteLLM Python SDK

```python showLineNumbers title="ElevenLabs Text-to-Speech with SDK"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

# Basic usage with voice mapping
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing ElevenLabs speech from LiteLLM.",
    voice="alloy",  # Maps to ElevenLabs voice ID automatically
)

# Save audio to file
with open("test_output.mp3", "wb") as f:
    f.write(audio.read())
```

#### 오디오 태그와 함께 Eleven v3 사용

Eleven v3는 텍스트 안에 효과음과 일시 정지를 직접 추가할 수 있는 [오디오 태그](https://elevenlabs.io/docs/overview/capabilities/text-to-speech#audio-tags)를 지원합니다.

```python showLineNumbers title="Eleven v3 with audio tags"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

audio = litellm.speech(
    model="elevenlabs/eleven_v3",
    input='Welcome back. <sfx>applause</sfx> Today we have a special guest. <pause duration="1.5s"/> Let me introduce them.',
    voice="alloy",
)

with open("eleven_v3_output.mp3", "wb") as f:
    f.write(audio.read())
```

#### 고급 사용법: 파라미터 재정의 및 ElevenLabs 전용 기능

```python showLineNumbers title="Advanced TTS with custom parameters"
import litellm
import os

os.environ["ELEVENLABS_API_KEY"] = "your-elevenlabs-api-key"

# Example showing parameter overriding and ElevenLabs-specific parameters
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing ElevenLabs speech from LiteLLM.",
    voice="alloy",  # Can use mapped voice name or raw ElevenLabs voice_id
    response_format="pcm",  # Maps to ElevenLabs output_format
    speed=1.1,  # Maps to voice_settings.speed
    # ElevenLabs-specific parameters - passed directly to API
    pronunciation_dictionary_locators=[
        {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
    ],
    model_id="eleven_multilingual_v2",  # Override model if needed
)

# Save audio to file
with open("test_output.mp3", "wb") as f:
    f.write(audio.read())
```

### 음성 매핑

LiteLLM은 일반적인 OpenAI 음성 이름을 ElevenLabs 음성 ID로 자동 매핑합니다.

| OpenAI 음성 | ElevenLabs 음성 ID | 설명 |
|--------------|---------------------|-------------|
| `alloy` | `21m00Tcm4TlvDq8ikWAM` | Rachel - 중립적이고 균형 잡힘 |
| `amber` | `5Q0t7uMcjvnagumLfvZi` | Paul - 따뜻하고 친근함 |
| `ash` | `AZnzlk1XvdvUeBnXmlld` | Domi - 활기참 |
| `august` | `D38z5RcWu1voky8WS1ja` | Fin - 전문적 |
| `blue` | `2EiwWnXFnvU5JabPnv8n` | Clyde - 깊고 권위 있음 |
| `coral` | `9BWtsMINqrJLrRacOk9x` | Aria - 표현력 있음 |
| `lily` | `EXAVITQu4vr4xnSDxMaL` | Sarah - 친근함 |
| `onyx` | `29vD33N1CtxCmqQRPOHJ` | Drew - 강한 느낌 |
| `sage` | `CwhRBWXzGAHq8TQ4Fs17` | Roger - 차분함 |
| `verse` | `CYw3kZ02Hs0563khs1Fj` | Dave - 대화체 |

**사용자 지정 음성 ID 사용**: ElevenLabs 음성 ID를 직접 전달할 수도 있습니다. 음성 이름이 매핑에 없으면 LiteLLM은 해당 값을 그대로 사용합니다.

```python showLineNumbers title="Using custom ElevenLabs voice ID"
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",
    input="Testing with a custom voice.",
    voice="21m00Tcm4TlvDq8ikWAM",  # Direct ElevenLabs voice ID
)
```

### 응답 형식 매핑

LiteLLM은 OpenAI 응답 형식을 ElevenLabs 출력 형식으로 매핑합니다.

| OpenAI 형식 | ElevenLabs 형식 |
|---------------|-------------------|
| `mp3` | `mp3_44100_128` |
| `pcm` | `pcm_44100` |
| `opus` | `opus_48000_128` |

`output_format` 파라미터를 사용해 ElevenLabs 전용 출력 형식을 직접 전달할 수도 있습니다.

### 지원 파라미터

```python showLineNumbers title="All Supported Parameters"
audio = litellm.speech(
    model="elevenlabs/eleven_multilingual_v2",  # Required
    input="Text to convert to speech",           # Required
    voice="alloy",                               # Required: Voice selection (mapped or raw ID)
    response_format="mp3",                      # Optional: Audio format (mp3, pcm, opus)
    speed=1.0,                                  # Optional: Speech speed (maps to voice_settings.speed)
    # ElevenLabs-specific parameters (passed directly):
    model_id="eleven_multilingual_v2",           # Optional: Override model
    voice_settings={                             # Optional: Voice customization
        "stability": 0.5,
        "similarity_boost": 0.75,
        "speed": 1.0
    },
    pronunciation_dictionary_locators=[         # Optional: Custom pronunciation
           {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
    ],
)
```

### LiteLLM Proxy

#### 1. 프록시 설정

```yaml showLineNumbers title="ElevenLabs TTS configuration in config.yaml"
model_list:
  - model_name: elevenlabs-tts
    litellm_params:
      model: elevenlabs/eleven_multilingual_v2
      api_key: os.environ/ELEVENLABS_API_KEY

general_settings:
  master_key: your-master-key
```

#### 2. TTS 요청 보내기

##### 간단한 사용법 (OpenAI 파라미터)

프로바이더 전용 설정 없이 표준 OpenAI 호환 파라미터를 사용할 수 있습니다.

```bash showLineNumbers title="Simple TTS request with curl"
curl http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "elevenlabs-tts",
    "input": "Testing ElevenLabs speech via the LiteLLM proxy.",
    "voice": "alloy",
    "response_format": "mp3"
  }' \
  --output speech.mp3
```

```python showLineNumbers title="Simple TTS with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.audio.speech.create(
    model="elevenlabs-tts",
    input="Testing ElevenLabs speech via the LiteLLM proxy.",
    voice="alloy",
    response_format="mp3"
)

# Save audio
with open("speech.mp3", "wb") as f:
    f.write(response.content)
```

##### 고급 사용법 (ElevenLabs 전용 파라미터)

**참고**: 프록시를 사용할 때는 `pronunciation_dictionary_locators`, `voice_settings` 같은 프로바이더 전용 파라미터를 `extra_body` 필드에 전달해야 합니다.

```bash showLineNumbers title="Advanced TTS request with curl"
curl http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "elevenlabs-tts",
    "input": "Testing ElevenLabs speech via the LiteLLM proxy.",
    "voice": "alloy",
    "response_format": "pcm",
    "extra_body": {
      "pronunciation_dictionary_locators": [
          {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
      ],
      "voice_settings": {
        "speed": 1.1,
        "stability": 0.5,
        "similarity_boost": 0.75
      }
    }
  }' \
  --output speech.mp3
```

```python showLineNumbers title="Advanced TTS with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.audio.speech.create(
    model="elevenlabs-tts",
    input="Testing ElevenLabs speech via the LiteLLM proxy.",
    voice="alloy",
    response_format="pcm",
    extra_body={
        "pronunciation_dictionary_locators": [
               {"pronunciation_dictionary_id": "dict_123", "version_id": "v1"}
        ],
        "voice_settings": {
            "speed": 1.1,
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
)

# Save audio
with open("speech.mp3", "wb") as f:
    f.write(response.content)
```
