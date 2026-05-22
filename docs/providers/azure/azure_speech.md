# Azure TTS 사용 {#azure-text-to-speech-tts}

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure OpenAI의 Text to Speech 모델을 사용하여 텍스트를 자연스러운 음성으로 변환합니다 |
| LiteLLM의 Provider Route | `azure/` |
| 지원 작업 | `/audio/speech` |
| Provider 문서 링크 | [Azure OpenAI TTS ↗](https://learn.microsoft.com/en-us/azure/ai-services/openai/text-to-speech-quickstart)

## 빠른 시작

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
from litellm import speech
from pathlib import Path
import os

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

# azure call
speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
        model="azure/<your-deployment-name>",
        voice="alloy",
        input="the quick brown fox jumped over the lazy dogs",
    )
response.stream_to_file(speech_file_path)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
 - model_name: azure/tts-1
    litellm_params:
      model: azure/tts-1
      api_base: "os.environ/AZURE_API_BASE_TTS"
      api_key: "os.environ/AZURE_API_KEY_TTS"
      api_version: "os.environ/AZURE_API_VERSION" 
```

## 사용 가능한 음성 {#available-voices}

Azure OpenAI는 다음 음성을 지원합니다.
- `alloy` - 중립적이고 균형 잡힌 음성
- `echo` - 따뜻하고 활기찬 음성
- `fable` - 표현력이 풍부하고 극적인 음성
- `onyx` - 깊이 있고 권위 있는 음성
- `nova` - 친근하고 대화체에 가까운 음성
- `shimmer` - 밝고 경쾌한 음성

## 지원 파라미터

```python showLineNumbers title="All Parameters"
response = speech(
    model="azure/<your-deployment-name>",
    voice="alloy",                    # Required: Voice selection
    input="text to convert",          # Required: Input text
    speed=1.0,                        # Optional: 0.25 to 4.0 (default: 1.0)
    response_format="mp3"             # Optional: mp3, opus, aac, flac, wav, pcm
)
```

## 지원 모델 {#supported-models}

- `tts-1` - 표준 품질, 속도에 최적화됨
- `tts-1-hd` - 고해상도 품질, 품질에 최적화됨

Azure 배포 이름을 사용하세요: `azure/<your-deployment-name>`
