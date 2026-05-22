# `Azure AI Speech(Cognitive Services)` 제공자 {#azure-ai-speech-cognitive-services}

Azure AI Speech는 Azure OpenAI와 별도로 제공되는 Azure Cognitive Services의 텍스트 음성 변환 API입니다. 더 폭넓은 언어 지원과 고급 음성 사용자 지정 기능을 갖춘 고품질 신경망 음성을 제공합니다.

**Azure OpenAI TTS 대신 이 서비스를 사용할 때:**
- **Azure AI Speech** - 더 많은 언어, 신경망 음성, SSML 지원, 음성 사용자 지정
- **Azure OpenAI TTS** - OpenAI 모델, Azure OpenAI 서비스와의 통합


## 개요 {#overview}

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure AI Speech는 Azure OpenAI와 별도로 제공되는 Azure Cognitive Services의 텍스트 음성 변환 API입니다. 더 폭넓은 언어 지원과 고급 음성 사용자 지정 기능을 갖춘 고품질 신경망 음성을 제공합니다. |
| LiteLLM Provider 경로 | `azure/speech/` |

## 빠른 시작 {#quick-start}

**LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
from litellm import speech
from pathlib import Path
import os

os.environ["AZURE_TTS_API_KEY"] = "your-cognitive-services-key"

speech_file_path = Path(__file__).parent / "speech.mp3"
response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",
    input="Hello, this is Azure AI Speech",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file(speech_file_path)
```

**LiteLLM Proxy**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: azure-speech
    litellm_params:
      model: azure/speech/azure-tts
      api_base: https://eastus.tts.speech.microsoft.com
      api_key: os.environ/AZURE_TTS_API_KEY
```

## 설정 {#setup}

1. [Azure Portal](https://portal.azure.com)에서 Azure Cognitive Services 리소스를 만듭니다.
2. 리소스에서 API 키를 가져옵니다.
3. 리전 값을 확인합니다. 예: `eastus`, `westus`, `westeurope`
4. 리전별 엔드포인트를 사용합니다: `https://{region}.tts.speech.microsoft.com`

## 비용 추적(가격) {#cost-tracking-pricing}

LiteLLM은 처리된 문자 수를 기준으로 Azure AI Speech 비용을 자동으로 추적합니다.

### 사용 가능한 모델 {#available-models}

| 모델 | 음성 유형 | 100만 자당 비용 |
|-------|-----------|----------------------|
| `azure/speech/azure-tts` | Neural | $15 |
| `azure/speech/azure-tts-hd` | Neural HD | $30 |

### 비용 계산 방식 {#how-cost-calculation-works}

Azure AI Speech는 입력 텍스트의 문자 수를 기준으로 과금합니다. LiteLLM은 자동으로 다음을 수행합니다.
- `input` 파라미터의 문자 수를 계산합니다.
- 모델 가격을 기준으로 비용을 계산합니다.
- 응답 객체에 비용을 반환합니다.

```python showLineNumbers title="View Request Cost"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",
    input="Hello, this is a test message",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)

# Access the calculated cost
cost = response._hidden_params.get("response_cost")
print(f"Request cost: ${cost}")
```

### Azure 가격 확인 {#checking-azure-pricing}

최신 Azure AI Speech 가격을 확인하려면:

1. [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)로 이동합니다.
2. **Service**를 "AI Services"로 설정합니다.
3. **API**를 "Azure AI Speech"로 설정합니다.
4. **Text to Speech**와 리전을 선택합니다.
5. 현재 100만 자당 가격을 확인합니다.

**참고:** 가격은 리전과 Azure 구독 유형에 따라 달라질 수 있습니다.

## 음성 매핑 {#voice-mapping}

LiteLLM은 OpenAI 음성 이름을 Azure Neural 음성에 자동으로 매핑합니다.

| OpenAI 음성 | Azure Neural 음성 | 설명 |
|-------------|-------------------|-------------|
| `alloy` | en-US-JennyNeural | 중립적이고 균형 잡힌 음성 |
| `echo` | en-US-GuyNeural | 따뜻하고 경쾌한 음성 |
| `fable` | en-GB-RyanNeural | 표현력이 풍부하고 극적인 음성 |
| `onyx` | en-US-DavisNeural | 깊이 있고 권위적인 음성 |
| `nova` | en-US-AmberNeural | 친근하고 대화체에 가까운 음성 |
| `shimmer` | en-US-AriaNeural | 밝고 명랑한 음성 |

## 지원 파라미터 {#supported-parameters}

```python showLineNumbers title="All Parameters"
response = speech(
    model="azure/speech/azure-tts",
    voice="alloy",                    # Required: Voice selection
    input="text to convert",          # Required: Input text
    speed=1.0,                        # Optional: 0.25 to 4.0 (default: 1.0)
    response_format="mp3",            # Optional: mp3, opus, wav, pcm
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key="your-key",
)
```

### 응답 형식 {#response-formats}

| 형식 | Azure 출력 형식 | 샘플 레이트 |
|--------|-------------------|-------------|
| `mp3` | `audio-24khz-48kbitrate-mono-mp3` | 24kHz |
| `opus` | `ogg-48khz-16bit-mono-opus` | 48kHz |
| `wav` | `riff-24khz-16bit-mono-pcm` | 24kHz |
| `pcm` | `raw-24khz-16bit-mono-pcm` | 24kHz |

## 원시 SSML 전달 {#raw-ssml-passthrough}

LiteLLM은 `input`에 SSML이 포함되어 있는지(`<speak>` 태그 확인) 자동으로 감지하고, 변환 없이 그대로 Azure에 전달합니다. 이를 통해 음성 합성을 완전히 제어할 수 있습니다.

**원시 SSML을 사용할 때:**
- 다국어 음성과 함께 `<lang>` 요소를 사용해 텍스트를 변환할 때. 예: 영어 텍스트 → 스페인어 음성
- 여러 음성 또는 운율 변경을 포함하는 복잡한 SSML 구조가 필요할 때
- 발음, 휴지, 강조 및 기타 음성 기능을 세밀하게 제어해야 할 때

### LiteLLM SDK {#litellm-sdk}

```python showLineNumbers title="Raw SSML for Multilingual Translation"
from litellm import speech

# Use <lang> element to convert English text to Spanish speech
# The <lang> element forces the output language regardless of input text language
language_code = "es-ES"
text = "Hello, how are you today?"  # English text
voice = "en-US-AvaMultilingualNeural"

ssml = f"""<speak version="1.0"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="http://www.w3.org/2001/mstts"
    xml:lang="{language_code}">
<voice name="{voice}">
    <lang xml:lang="{language_code}">{text}</lang>
</voice>
</speak>"""

response = speech(
    model="azure/speech/azure-tts",
    voice=voice,
    input=ssml,  # LiteLLM auto-detects SSML and sends as-is
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file("speech.mp3")
```

```python showLineNumbers title="Raw SSML with Complex Features"
from litellm import speech

# Complex SSML with multiple prosody adjustments
ssml = """<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' 
    xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
<voice name='en-US-JennyNeural'>
    <mstts:express-as style='cheerful' styledegree='2'>
        <prosody rate='+20%' pitch='high'>
            Welcome to our service!
        </prosody>
    </mstts:express-as>
    <break time='500ms'/>
    <prosody rate='-10%'>
        How can I help you today?
    </prosody>
</voice>
</speak>"""

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-JennyNeural",
    input=ssml,  # LiteLLM detects <speak> and passes through unchanged
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
response.stream_to_file("speech.mp3")
```

### LiteLLM Proxy {#litellm-proxy}

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AvaMultilingualNeural",
    "input": "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xmlns:mstts=\"http://www.w3.org/2001/mstts\" xml:lang=\"es-ES\"><voice name=\"en-US-AvaMultilingualNeural\"><lang xml:lang=\"es-ES\">Hello, how are you today?</lang></voice></speak>"
  }' \
  --output speech.mp3
```


## Azure 전용 파라미터 보내기 {#sending-azure-specific-parameters}

Azure AI Speech는 선택적 파라미터를 통해 고급 SSML 기능을 지원합니다.

- `style`: 말하기 스타일. 예: "cheerful", "sad", "angry", "whispering"
- `styledegree`: 스타일 강도(0.01~2)
- `role`: 음성 역할. 예: "Girl", "Boy", "SeniorFemale", "SeniorMale"
- `lang`: 다국어 음성용 언어 코드. 예: "es-ES", "fr-FR", "hi-IN"

### **LiteLLM SDK** {#litellm-sdk-1}

#### 사용자 지정 Azure 음성 {#custom-azure-voice}

```python showLineNumbers title="Custom Azure Voice"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AndrewNeural",       # Use Azure voice directly
    input="Hello, this is a test",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    response_format="mp3"
)
response.stream_to_file("speech.mp3")
```

#### 말하기 스타일 {#speaking-style}

```python showLineNumbers title="Speaking Style"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-JennyNeural",        # Must be a voice that supports styles
    input="Who are you? What is chicken dinner?",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    style="whispering",               # Azure-specific: cheerful, sad, angry, whispering, etc.
)
response.stream_to_file("speech.mp3")
```

#### 강도와 역할이 포함된 스타일 {#style-with-degree-and-role}

```python showLineNumbers title="Style with Degree and Role"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AriaNeural",
    input="Good morning! How are you today?",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    style="cheerful",                 # Azure-specific: Speaking style
    styledegree="2",                  # Azure-specific: 0.01 to 2 (intensity)
    role="SeniorFemale",              # Azure-specific: Girl, Boy, SeniorFemale, etc.
)
response.stream_to_file("speech.mp3")
```

#### 다국어 음성의 언어 재정의 {#language-override-for-multilingual-voices}

```python showLineNumbers title="Language Override"
from litellm import speech

response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AvaMultilingualNeural",  # Multilingual voice
    input="आप कौन हैं? चिकन डिनर क्या है?",  # Hindi text
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
    lang="hi-IN",                         # Azure-specific: Override language
)
response.stream_to_file("speech.mp3")
```

### **`LiteLLM AI Gateway(CURL)` 사용법** {#litellm-ai-gateway-curl}

먼저 위의 [LiteLLM Proxy 설정](#quick-start)에 표시된 대로 프록시 설정을 완료했는지 확인합니다.

**설정의 모델 이름 사용:**

```yaml
model_list:
  - model_name: azure-speech  # This is what you'll use in your API calls
    litellm_params:
      model: azure/speech/azure-tts
      api_base: https://eastus.tts.speech.microsoft.com
      api_key: os.environ/AZURE_TTS_API_KEY
```

#### 사용자 지정 Azure 음성 {#custom-azure-voice-1}

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AndrewNeural",
    "input": "Hello, this is a test"
  }' \
  --output speech.mp3
```

#### 말하기 스타일 {#speaking-style-1}

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "input": "Who are you? What is chicken dinner?",
    "voice": "en-US-JennyNeural",
    "style": "whispering"
  }' \
  --output speech.mp3
```

#### 강도와 역할이 포함된 스타일 {#style-with-degree-and-role-1}

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "voice": "en-US-AriaNeural",
    "input": "Good morning! How are you today?",
    "style": "cheerful",
    "styledegree": "2",
    "role": "SeniorFemale"
  }' \
  --output speech.mp3
```

#### 언어 재정의 {#language-override}

```bash
curl http://0.0.0.0:4000/v1/audio/speech \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-speech",
    "input": "आप कौन हैं? चिकन डिनर क्या है?",
    "voice": "en-US-AvaMultilingualNeural",
    "lang": "hi-IN"
  }' \
  --output speech.mp3
```

### Azure 전용 파라미터 참조 {#azure-specific-parameters-reference}

| 파라미터 | 설명 | 예시 값 | 참고 |
|-----------|-------------|----------------|-------|
| `style` | 말하기 스타일 | `cheerful`, `sad`, `angry`, `excited`, `friendly`, `hopeful`, `shouting`, `terrified`, `unfriendly`, `whispering` | 일부 음성에서만 지원됩니다. [Azure 음성 스타일 문서](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#use-speaking-styles-and-roles)를 참고하세요. |
| `styledegree` | 스타일 강도 | `0.01`~`2` | 값이 높을수록 강도가 커집니다. 기본값은 `1`입니다. |
| `role` | 음성 역할 | `Girl`, `Boy`, `YoungAdultFemale`, `YoungAdultMale`, `OlderAdultFemale`, `OlderAdultMale`, `SeniorFemale`, `SeniorMale` | 일부 음성에서만 지원됩니다. |
| `lang` | 언어 코드 | `es-ES`, `fr-FR`, `de-DE`, `hi-IN` 등 | 다국어 음성에 사용합니다. 기본 언어를 재정의합니다. |

## 비동기 지원 {#async-support}

```python showLineNumbers title="Async Usage"
import asyncio
from litellm import aspeech
from pathlib import Path

async def generate_speech():
    response = await aspeech(
        model="azure/speech/azure-tts",
        voice="alloy",
        input="Hello from async",
        api_base="https://eastus.tts.speech.microsoft.com",
        api_key=os.environ["AZURE_TTS_API_KEY"],
    )
    
    speech_file_path = Path(__file__).parent / "speech.mp3"
    response.stream_to_file(speech_file_path)

asyncio.run(generate_speech())
```

## 리전별 엔드포인트 {#regional-endpoints}

`{region}`을 Azure 리소스 리전으로 바꿉니다.

- 미국 동부: `https://eastus.tts.speech.microsoft.com`
- 미국 서부: `https://westus.tts.speech.microsoft.com`
- 서유럽: `https://westeurope.tts.speech.microsoft.com`
- 동남아시아: `https://southeastasia.tts.speech.microsoft.com`

[전체 리전 목록](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions)

## 고급 기능 {#advanced-features}

### 사용자 지정 Neural 음성 {#custom-neural-voices}

전체 음성 이름을 전달하면 원하는 Azure Neural 음성을 사용할 수 있습니다.

```python showLineNumbers title="Custom Voice"
response = speech(
    model="azure/speech/azure-tts",
    voice="en-US-AriaNeural",  # Direct Azure voice name
    input="Using a specific neural voice",
    api_base="https://eastus.tts.speech.microsoft.com",
    api_key=os.environ["AZURE_TTS_API_KEY"],
)
```

[Azure Speech Gallery](https://speech.microsoft.com/portal/voicegallery)에서 사용 가능한 음성을 찾아볼 수 있습니다.

## 오류 처리 {#error-handling}

```python showLineNumbers title="Error Handling"
from litellm import speech
from litellm.exceptions import APIError

try:
    response = speech(
        model="azure/speech/azure-tts",
        voice="alloy",
        input="Test message",
        api_base="https://eastus.tts.speech.microsoft.com",
        api_key=os.environ["AZURE_TTS_API_KEY"],
    )
except APIError as e:
    print(f"Azure Speech error: {e}")
```

## 참고 자료 {#resources}

- [Azure Speech Service 문서](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Text-to-Speech REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)
