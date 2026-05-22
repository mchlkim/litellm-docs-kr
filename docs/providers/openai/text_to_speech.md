import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI - 텍스트 음성 변환 {#openai---text-to-speech}

## 개요

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 작동합니다 |
| 로깅 | ✅ | 모든 통합에서 작동합니다 |
| 최종 사용자 추적 | ✅ | |
| Fallbacks | ✅ | 지원되는 모델 간에 작동합니다 |
| Loadbalancing | ✅ | 지원되는 모델 간에 작동합니다 |
| 가드레일 | ✅ | 입력 텍스트에 적용됩니다 |
| 지원 모델 | tts-1, tts-1-hd, gpt-4o-mini-tts | |

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

### 비동기 사용법 {#async-사용법}

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

LiteLLM은 텍스트 음성 변환 호출을 위해 OpenAI와 호환되는 `/audio/speech` 엔드포인트를 제공합니다.

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

## 지원 모델 {#supported-모델}

| 모델 | 예제 |
|-------|-------------|
| tts-1 | speech(model="tts-1", voice="alloy", input="Hello, world!") |
| tts-1-hd | speech(model="tts-1-hd", voice="alloy", input="Hello, world!") |
| gpt-4o-mini-tts | speech(model="gpt-4o-mini-tts", voice="alloy", input="Hello, world!") |


## ✨ 엔터프라이즈 LiteLLM Proxy - 최대 요청 파일 크기 설정 {#enterprise-litellm-proxy---set-max-request-file-size}

`audio/transcriptions`로 전송되는 요청의 파일 크기를 제한하려면 이 설정을 사용합니다.

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
