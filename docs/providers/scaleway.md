
# Scaleway 
LiteLLM은 [Scaleway Generative APIs에서 사용 가능한 모든 모델 ↗](https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/)을 지원합니다. 

## LiteLLM Python SDK 사용법 {#usage-with-litellm-python-sdk}

```python
import os
from litellm import completion 

os.environ["SCW_SECRET_KEY"] = "your-scaleway-secret-key"

messages = [{"role": "user", "content": "Write a short poem"}]
response = completion(model="scaleway/qwen3-235b-a22b-instruct-2507", messages=messages)
print(response)
```

## LiteLLM Proxy 사용법 {#usage-with-litellm-proxy}

### 1. config.yaml에서 Scaleway 모델 설정 {#1-set-scaleway-models-in-configyaml}

```yaml
model_list:
  - model_name: scaleway-model
    litellm_params:
      model: scaleway/qwen3-235b-a22b-instruct-2507
      api_key: "os.environ/SCW_SECRET_KEY" # ensure you have `SCW_SECRET_KEY` in your .env
```

### 2. proxy 시작 {#2-start-proxy}

```bash
litellm --config config.yaml
```

### 3. proxy 쿼리 {#3-query-proxy}

proxy가 [http://localhost:4000](http://localhost:4000)에서 실행 중이라고 가정합니다.
```bash
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" \
  -d '{
    "model": "scaleway-model",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Write a short poem"
      }
    ]
  }'
```
`-H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" `는 LiteLLM master key를 설정한 경우에만 필요합니다.


## 지원 기능 {#supported-features}

Scaleway provider는 streaming, structured outputs, tool calling 등 [Generative APIs reference documentation ↗](https://www.scaleway.com/en/developers/api/generative-apis/)의 모든 기능을 지원합니다.

## 오디오 전사 {#audio-transcription}

Scaleway의 `/audio/transcriptions` 엔드포인트는 OpenAI 호환이며 Whisper 모델과 함께 작동합니다.

### Python SDK

```python
import os
from litellm import transcription

os.environ["SCW_SECRET_KEY"] = "your-scaleway-secret-key"

with open("speech.mp3", "rb") as audio_file:
    response = transcription(
        model="scaleway/whisper-large-v3",
        file=audio_file,
    )
print(response.text)
```

### Proxy 설정 {#proxy-config}

```yaml
model_list:
  - model_name: scaleway-whisper
    litellm_params:
      model: scaleway/whisper-large-v3
      api_key: "os.environ/SCW_SECRET_KEY"
```

### Proxy 요청 {#proxy-request}

```bash
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY" \
  -F model="scaleway-whisper" \
  -F file="@speech.mp3"
```

지원되는 선택적 매개변수: `language`, `prompt`, `response_format`, `temperature`, `timestamp_granularities`.
