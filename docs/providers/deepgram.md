import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Deepgram`

LiteLLM은 `Deepgram`의 `/listen` 엔드포인트를 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | `Deepgram`의 음성 AI 플랫폼은 음성-텍스트 변환, 텍스트-음성 변환, 언어 이해용 API를 제공합니다. |
| LiteLLM 제공자 경로 | `deepgram/` |
| 제공자 문서 | [Deepgram ↗](https://developers.deepgram.com/docs/introduction) |
| 지원되는 OpenAI 엔드포인트 | `/audio/transcriptions` |

## 빠른 시작

```python
from litellm import transcription
import os 

# set api keys 
os.environ["DEEPGRAM_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="deepgram/nova-2", file=audio_file)

print(f"response: {response}")
```

## LiteLLM Proxy 사용법

### config에 모델 추가하기 {#add-model-to-config}

1. `config.yaml`에 모델을 추가합니다.

```yaml
model_list:
- model_name: nova-2
  litellm_params:
    model: deepgram/nova-2
    api_key: os.environ/DEEPGRAM_API_KEY
  model_info:
    mode: audio_transcription
    
general_settings:
  master_key: sk-1234
```

### 프록시 시작하기 {#start-proxy}

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 테스트 {#test}

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="nova-2"'
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)


audio_file = open("speech.mp3", "rb")
transcript = client.audio.transcriptions.create(
  model="nova-2",
  file=audio_file
)
```
</TabItem>
</Tabs>
