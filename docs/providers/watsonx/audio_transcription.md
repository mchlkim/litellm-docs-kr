# WatsonX 오디오 트랜스크립션 {#watsonx-audio-transcription}

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Whisper 모델을 사용해 음성을 텍스트로 변환하는 WatsonX 오디오 트랜스크립션 |
| LiteLLM의 Provider Route | `watsonx/` |
| 지원 작업 | `/v1/audio/transcriptions` |
| Provider 문서 링크 | [IBM WatsonX.ai ↗](https://www.ibm.com/watsonx) |

## 빠른 시작

### **LiteLLM SDK**

```python showLineNumbers title="transcription.py"
import litellm

response = litellm.transcription(
    model="watsonx/whisper-large-v3-turbo",
    file=open("audio.mp3", "rb"),
    api_base="https://us-south.ml.cloud.ibm.com",
    api_key="your-api-key",
    project_id="your-project-id"
)
print(response.text)
```

### **LiteLLM 프록시**

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: whisper-large-v3-turbo
    litellm_params:
      model: watsonx/whisper-large-v3-turbo
      api_key: os.environ/WATSONX_APIKEY
      api_base: os.environ/WATSONX_URL
      project_id: os.environ/WATSONX_PROJECT_ID
```

```bash title="Request"
curl http://localhost:4000/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-1234" \
  -F file="@audio.mp3" \
  -F model="whisper-large-v3-turbo"
```

## 지원 파라미터

| 파라미터 | 유형 | 설명 |
|-----------|------|-------------|
| `model` | string | 모델 ID(예: `watsonx/whisper-large-v3-turbo`) |
| `file` | file | 트랜스크립션할 오디오 파일 |
| `language` | string | 언어 코드(예: `en`) |
| `prompt` | string | 트랜스크립션을 안내하는 선택적 프롬프트 |
| `temperature` | float | 샘플링 temperature(0-1) |
| `response_format` | string | `json`, `text`, `srt`, `verbose_json`, `vtt` |
