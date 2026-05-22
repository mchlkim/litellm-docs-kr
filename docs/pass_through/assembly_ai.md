# AssemblyAI

AssemblyAI용 패스스루 엔드포인트입니다. AssemblyAI 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 |
|-------|-------|-------|
| 비용 추적 | ✅ | 모든 통합에서 작동 |
| 로깅 | ✅ | 모든 통합에서 작동 |


**모든** AssemblyAI 엔드포인트를 지원합니다.

[**모든 AssemblyAI 엔드포인트 보기**](https://www.assemblyai.com/docs/api-reference)


## 지원되는 라우트 {#supported-routes}

| AssemblyAI 서비스 | LiteLLM 라우트 | AssemblyAI 기본 URL |
|-------------------|---------------|---------------------|
| 음성 텍스트 변환(미국) | `/assemblyai/*` | `api.assemblyai.com` |
| 음성 텍스트 변환(EU) | `/eu.assemblyai/*` | `eu.api.assemblyai.com` |

## 빠른 시작

AssemblyAI [`/v2/transcripts` 엔드포인트](https://www.assemblyai.com/docs/api-reference/transcripts)를 호출해 보겠습니다.

1. 환경에 AssemblyAI API 키를 추가합니다.

```bash
export ASSEMBLYAI_API_KEY=""
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

AssemblyAI [`/v2/transcripts` 엔드포인트](https://www.assemblyai.com/docs/api-reference/transcripts)를 호출해 보겠습니다. 필요할 때 켤 수 있도록 주석 처리된 [Speech Understanding](https://www.assemblyai.com/docs/speech-understanding) 기능도 포함되어 있습니다.

```python
import assemblyai as aai

aai.settings.base_url = "http://0.0.0.0:4000/assemblyai" # <your-proxy-base-url>/assemblyai
aai.settings.api_key = "Bearer sk-1234" # Bearer <your-virtual-key>

# Use a publicly-accessible URL
audio_file = "https://assembly.ai/wildfires.mp3"

# Or use a local file:
# audio_file = "./example.mp3"

config = aai.TranscriptionConfig(
    speech_models=["universal-3-pro", "universal-2"],
    language_detection=True,
    speaker_labels=True,
    # Speech understanding features
    # sentiment_analysis=True,
    # entity_detection=True,
    # auto_chapters=True,
    # summarization=True,
    # summary_type=aai.SummarizationType.bullets,
    # redact_pii=True,
    # content_safety=True,
)

transcript = aai.Transcriber().transcribe(audio_file, config=config)

if transcript.status == aai.TranscriptStatus.error:
    raise RuntimeError(f"Transcription failed: {transcript.error}")

print(f"\nFull Transcript:\n\n{transcript.text}")

# Optionally print speaker diarization results
# for utterance in transcript.utterances:
#     print(f"Speaker {utterance.speaker}: {utterance.text}")
```

4. [Universal-3 Pro로 프롬프트 사용하기](https://www.assemblyai.com/docs/speech-to-text/prompting)(선택 사항)

```python
import assemblyai as aai

aai.settings.base_url = "http://0.0.0.0:4000/assemblyai" # <your-proxy-base-url>/assemblyai
aai.settings.api_key = "Bearer sk-1234" # Bearer <your-virtual-key>

audio_file = "https://assemblyaiassets.com/audios/verbatim.mp3"

config = aai.TranscriptionConfig(
    speech_models=["universal-3-pro", "universal-2"],
    language_detection=True,
    prompt="Produce a transcript suitable for conversational analysis. Every disfluency is meaningful data. Include: fillers (um, uh, er, ah, hmm, mhm, like, you know, I mean), repetitions (I I, the the), restarts (I was- I went), stutters (th-that, b-but, no-not), and informal speech (gonna, wanna, gotta)",
)

transcript = aai.Transcriber().transcribe(audio_file, config)

print(transcript.text)
```

## AssemblyAI EU 엔드포인트 호출 {#calling-assemblyai-eu-endpoints}

요청을 AssemblyAI EU 엔드포인트로 보내려면 `LITELLM_PROXY_BASE_URL`을 `<your-proxy-base-url>/eu.assemblyai`로 설정하면 됩니다.


```python
import assemblyai as aai

aai.settings.base_url = "http://0.0.0.0:4000/eu.assemblyai" # <your-proxy-base-url>/eu.assemblyai
aai.settings.api_key = "Bearer sk-1234" # Bearer <your-virtual-key>

# Use a publicly-accessible URL
audio_file = "https://assembly.ai/wildfires.mp3"

# Or use a local file:
# audio_file = "./path/to/file.mp3"

transcriber = aai.Transcriber()
transcript = transcriber.transcribe(audio_file)
print(transcript)
print(transcript.id)
```

## LLM Gateway

AssemblyAI의 [LLM Gateway](https://www.assemblyai.com/docs/llm-gateway)를 OpenAI 호환 제공자로 사용합니다. Claude, GPT, Gemini 모델을 위한 통합 API이며 LiteLLM 로깅, 가드레일, 비용 추적을 모두 지원합니다.

[**사용 가능한 모델 보기**](https://www.assemblyai.com/docs/llm-gateway#available-models)

### 사용법

#### LiteLLM Python SDK

```python
import litellm
import os

os.environ["ASSEMBLYAI_API_KEY"] = "your-assemblyai-api-key"

response = litellm.completion(
    model="assemblyai/claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "What is the capital of France?"}]
)

print(response.choices[0].message.content)
```

#### LiteLLM Proxy

1. 구성

```yaml
model_list:
  - model_name: assemblyai/*
    litellm_params:
      model: assemblyai/*
      api_key: os.environ/ASSEMBLYAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```python
import requests

headers = {
    "authorization": "Bearer sk-1234"  # Bearer <your-virtual-key>
}

response = requests.post(
    "http://0.0.0.0:4000/v1/chat/completions",
    headers=headers,
    json={
        "model": "assemblyai/claude-sonnet-4-5-20250929",
        "messages": [
            {"role": "user", "content": "What is the capital of France?"}
        ],
        "max_tokens": 1000
    }
)

result = response.json()
print(result["choices"][0]["message"]["content"])
```
