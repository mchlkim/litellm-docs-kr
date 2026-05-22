import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `/audio/transcriptions`

## 개요 

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 작동 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ✅ | |
| 폴백 | ✅ | 지원되는 모델 간에 작동 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간에 작동 |
| 가드레일 | ✅ | 출력된 전사 텍스트에 적용됨(비스트리밍 전용) |
| 지원 프로바이더 | `openai`, `azure`, `vertex_ai`, `gemini`, `deepgram`, `groq`, `fireworks_ai`, `ovhcloud`, `mistral` | |

## 빠른 시작

### LiteLLM Python SDK

```python showLineNumbers title="Python SDK Example"
from litellm import transcription
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="whisper", file=audio_file)

print(f"response: {response}")
```

### LiteLLM Proxy

### config에 모델 추가 {#add-model-to-config}


<Tabs>
<TabItem value="openai" label="OpenAI">

```yaml showLineNumbers title="OpenAI Configuration"
model_list:
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
    
general_settings:
  master_key: sk-1234
```
</TabItem>
<TabItem value="openai+azure" label="OpenAI + Azure">

```yaml showLineNumbers title="OpenAI + Azure Configuration"
model_list:
- model_name: whisper
  litellm_params:
    model: whisper-1
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
- model_name: whisper
  litellm_params:
    model: azure/azure-whisper
    api_version: 2024-02-15-preview
    api_base: os.environ/AZURE_EUROPE_API_BASE
    api_key: os.environ/AZURE_EUROPE_API_KEY
  model_info:
    mode: audio_transcription

general_settings:
  master_key: sk-1234
```

</TabItem>
</Tabs>

### 프록시 시작 {#start-proxy}

```bash showLineNumbers title="Start Proxy Server"
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:8000
```

### 테스트 {#test}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Test with cURL"
curl --location 'http://0.0.0.0:8000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="whisper"'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Test with OpenAI Python SDK"
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:8000"
)


audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
  model="whisper",
  file=audio_file
)
```
</TabItem>
</Tabs>

## 지원 프로바이더

- OpenAI
- Azure
- [`Fireworks AI`](https://docs.litellm.ai/docs/providers/fireworks_ai#audio-transcription)
- [`Groq`](https://docs.litellm.ai/docs/providers/groq#speech-to-text---whisper)
- [`Deepgram`](https://docs.litellm.ai/docs/providers/deepgram)
- [`Mistral (Voxtral)`](https://docs.litellm.ai/docs/providers/mistral#audio-transcription)
- [`OVHcloud AI Endpoints`](https://docs.litellm.ai/docs/providers/ovhcloud)

---

## 폴백 {#fallbacks}

기본 모델이 실패할 경우 다른 모델로 자동 재시도하도록 오디오 전사 폴백을 설정할 수 있습니다.

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Test with cURL and Fallbacks"
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"gettysburg.wav"' \
--form 'model="groq/whisper-large-v3"' \
--form 'fallbacks[]="openai/whisper-1"'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Test with OpenAI Python SDK and Fallbacks"
from openai import OpenAI
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

audio_file = open("gettysburg.wav", "rb")
transcript = client.audio.transcriptions.create(
    model="groq/whisper-large-v3",
    file=audio_file,
    extra_body={
        "fallbacks": ["openai/whisper-1"]
    }
)
```
</TabItem>
</Tabs>

### 폴백 테스트 {#testing-fallbacks}

`mock_testing_fallbacks=true`를 사용해 실패를 시뮬레이션하고 폴백 설정을 테스트할 수 있습니다.

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Test Fallbacks with Mock Testing"
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"gettysburg.wav"' \
--form 'model="groq/whisper-large-v3"' \
--form 'fallbacks[]="openai/whisper-1"' \
--form 'mock_testing_fallbacks=true'
```

</TabItem>
<TabItem value="openai" label="OpenAI Python SDK">

```python showLineNumbers title="Test Fallbacks with Mock Testing"
from openai import OpenAI
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

audio_file = open("gettysburg.wav", "rb")
transcript = client.audio.transcriptions.create(
    model="groq/whisper-large-v3",
    file=audio_file,
    extra_body={
        "fallbacks": ["openai/whisper-1"],
        "mock_testing_fallbacks": True
    }
)
```
</TabItem>
</Tabs>
