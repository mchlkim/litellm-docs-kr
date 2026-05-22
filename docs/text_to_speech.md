import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /audio/speech

## 개요

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 작동 |
| 로깅 | ✅ | 모든 연동에서 작동 |
| 최종 사용자 추적 | ✅ | |
| 폴백 | ✅ | 지원되는 모델 간에 작동 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간에 작동 |
| 가드레일 | ✅ | 입력 텍스트에 적용됨(비스트리밍 전용) |
| 지원 프로바이더 | OpenAI, Azure OpenAI, Vertex AI, AWS Polly, ElevenLabs , MiniMax |

## **LiteLLM Python SDK 사용법**
### 빠른 시작 

```python
from pathlib import Path
from litellm import speech
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
        model="openai/tts-1",
        voice="alloy",
        input="the quick brown fox jumped over the lazy dogs",
    )
response.stream_to_file(speech_file_path)
```

### Async 사용법 

```python
from litellm import aspeech
from pathlib import Path
import os, asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

async def test_async_speech(): 
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response = await aspeech(
            model="openai/tts-1",
            voice="alloy",
            input="the quick brown fox jumped over the lazy dogs",
            api_base=None,
            api_key=None,
            organization=None,
            project=None,
            max_retries=1,
            timeout=600,
            client=None,
            optional_params={},
        )
    response.stream_to_file(speech_file_path)

asyncio.run(test_async_speech())
```

## **LiteLLM Proxy 사용법**

LiteLLM은 Text-to-speech 호출을 위해 OpenAI와 호환되는 `/audio/speech` 엔드포인트를 제공합니다.

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

**설정**

```bash
- model_name: tts
  litellm_params:
    model: openai/tts-1
    api_key: os.environ/OPENAI_API_KEY
```

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```
## **지원 프로바이더**

| 프로바이더    | 사용법 링크      |
|-------------|--------------------|
| OpenAI      |   [사용법](#quick-start)                 |
| Azure OpenAI|   [사용법](../docs/providers/azure#azure-text-to-speech-tts)                 |
| Azure AI Speech Service (AVA)|   [사용법](../docs/providers/azure_ai_speech)                 |
| AWS Polly   |   아래 AWS Polly 사용법 섹션                 |
| Vertex AI   |   [사용법](../docs/providers/vertex#text-to-speech-apis)                 |
| Gemini      |   아래 Gemini 사용법 섹션                 |
| ElevenLabs  |   [사용법](../docs/providers/elevenlabs#text-to-speech-tts)                 |
| MiniMax     |   [사용법](../docs/providers/minimax#minimax---text-to-speech)                 |

## `/audio/speech`에서 `/chat/completions`로 연결하는 브리지 {#audio-speech-to-chat-completions-bridge}

LiteLLM을 사용하면 `/chat/completions` 모델로 `/audio/speech` 엔드포인트에서 음성을 생성할 수 있습니다. 이는 `/chat/completions`를 통해서만 접근할 수 있는 Gemini의 TTS 지원 모델 같은 경우에 유용합니다.

### Gemini 음성 합성 {#gemini-text-to-speech}

#### Python SDK 사용법

```python showLineNumbers title="Gemini Text-to-Speech SDK Usage"
import litellm
import os

# Set your Gemini API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

def test_audio_speech_gemini():
    result = litellm.speech(
        model="gemini/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    
    # Save to file
    from pathlib import Path
    speech_file_path = Path(__file__).parent / "gemini_speech.mp3"
    result.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

test_audio_speech_gemini()
```

#### Async 사용법

```python showLineNumbers title="Gemini Text-to-Speech Async Usage"
import litellm
import asyncio
import os
from pathlib import Path

os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

async def test_async_gemini_speech():
    speech_file_path = Path(__file__).parent / "gemini_speech.mp3"
    response = await litellm.aspeech(
        model="gemini/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    response.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

asyncio.run(test_async_gemini_speech())
```

#### LiteLLM Proxy 사용법

**설정 구성:**

```yaml showLineNumbers title="Gemini Proxy Configuration"
model_list:
- model_name: gemini-tts
  litellm_params:
    model: gemini/gemini-2.5-flash-preview-tts
    api_key: os.environ/GEMINI_API_KEY
```

**Proxy 시작:**

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**요청 보내기:**

```bash showLineNumbers title="Gemini TTS Request"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "alloy"
  }' \
  --output gemini_speech.mp3
```

### Vertex AI 음성 합성 {#vertex-ai-text-to-speech}

#### Python SDK 사용법

```python showLineNumbers title="Vertex AI Text-to-Speech SDK Usage"
import litellm
import os
from pathlib import Path

# Set your Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path/to/service-account.json"

def test_audio_speech_vertex():
    result = litellm.speech(
        model="vertex_ai/gemini-2.5-flash-preview-tts",
        input="the quick brown fox jumped over the lazy dogs",
    )
    
    # Save to file
    speech_file_path = Path(__file__).parent / "vertex_speech.mp3"
    result.stream_to_file(speech_file_path)
    print(f"Audio saved to {speech_file_path}")

test_audio_speech_vertex()
```

#### LiteLLM Proxy 사용법

**설정 구성:**

```yaml showLineNumbers title="Vertex AI Proxy Configuration"
model_list:
- model_name: vertex-tts
  litellm_params:
    model: vertex_ai/gemini-2.5-flash-preview-tts
    vertex_project: your-project-id
    vertex_location: us-central1
```

**요청 보내기:**

```bash showLineNumbers title="Vertex AI TTS Request"
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-tts",
    "input": "The quick brown fox jumped over the lazy dog.",
    "voice": "en-US-Wavenet-D"
  }' \
  --output vertex_speech.mp3
```

### AWS Polly 음성 합성 {#aws-polly-text-to-speech}

AWS Polly는 여러 음성과 언어를 지원하는 뉴럴 및 표준 음성 합성 엔진을 제공합니다.

자세한 사용 예시는 [AWS Polly 프로바이더 문서](../docs/providers/aws_polly)을 참고하세요.

## ✨ 엔터프라이즈 LiteLLM Proxy - 최대 요청 파일 크기 설정 {#-enterprise-litellm-proxy---set-max-request-file-size}

`audio/transcriptions`로 전송되는 요청의 파일 크기를 제한하려면 이 설정을 사용하세요.

```yaml
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: sk-*******
    max_file_size_mb: 0.00001 # 👈 max file size in MB  (Set this intentionally very small for testing)
  model_info:
    mode: audio_transcription
```

유효한 파일로 테스트 요청을 보냅니다.
```shell
curl --location 'http://localhost:4000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"/Users/ishaanjaffer/Github/litellm/tests/gettysburg.wav"' \
--form 'model="whisper"'
```


다음 응답이 표시되어야 합니다.

```shell
{"error":{"message":"File size is too large. Please check your file size. Passed file size: 0.7392807006835938 MB. Max file size: 0.0001 MB","type":"bad_request","param":"file","code":500}}%  
```
