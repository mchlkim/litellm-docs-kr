import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [BETA] Google AI Studio (Gemini) 파일 API {#beta-google-ai-studio-gemini-files-api}

Google AI Studio (Gemini)에 파일을 업로드할 때 사용합니다.

대용량 미디어 파일을 Gemini의 `/generateContent` 엔드포인트로 전달할 때 유용합니다.

| 작업 | 지원 여부 | 
|----------|-----------|
| `create` | 예 |
| `delete` | 아니요 |
| `retrieve` | 아니요 |
| `list` | 아니요 |

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import base64
import requests
from litellm import completion, create_file
import os


### UPLOAD FILE ### 

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')


file = create_file(
    file=wav_data,
    purpose="user_data",
    extra_headers={"custom-llm-provider": "gemini"},
    api_key=os.getenv("GEMINI_API_KEY"),
)

print(f"file: {file}")

assert file is not None


### GENERATE CONTENT ### 
completion = completion(
    model="gemini-2.0-flash",
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                        "filename": "my-test-name",
                        "format": "audio/wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: "gemini-2.0-flash"
      litellm_params:
        model: gemini/gemini-2.0-flash
        api_key: os.environ/GEMINI_API_KEY
```

2. proxy 시작

```bash
litellm --config config.yaml
```

3. 테스트

```python
import base64
import requests
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234"
)

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')


file = client.files.create(
    file=wav_data,
    purpose="user_data",
    extra_body={"target_model_names": "gemini-2.0-flash"}
)

print(f"file: {file}")

assert file is not None

completion = client.chat.completions.create(
    model="gemini-2.0-flash",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                        "filename": "my-test-name",
                        "format": "audio/wav"
                    }
                }
            ]
        },
    ],
    extra_body={"drop_params": True}
)

print(completion.choices[0].message)
```




</TabItem>
</Tabs>

## Azure Blob Storage 통합 {#azure-blob-storage-integration}

LiteLLM은 Gemini 파일 업로드의 대상 스토리지 백엔드로 Azure Blob Storage를 사용하는 방식을 지원합니다. 이를 사용하면 Google 관리형 스토리지 대신 Azure Data Lake Storage Gen2에 파일을 저장할 수 있습니다.

### 1단계: Azure Blob Storage 설정 {#step-1-setup-azure-blob-storage}

다음 환경 변수를 설정해 Azure Blob Storage 계정을 구성합니다.

**필수 환경 변수:**
- `AZURE_STORAGE_ACCOUNT_NAME` - Azure Storage 계정 이름
- `AZURE_STORAGE_FILE_SYSTEM` - 파일이 저장될 컨테이너/파일 시스템 이름
- `AZURE_STORAGE_ACCOUNT_KEY` - 계정 키

### 2단계: Azure Blob Storage를 대상 스토리지로 전달 {#step-2-pass-azure-blob-storage-as-target-storage}

파일을 업로드할 때 기본 스토리지 대신 Azure Blob Storage를 사용하려면 `target_storage: "azure_storage"`를 지정합니다.

**지원되는 파일 형식:**

Azure Blob Storage는 Gemini와 호환되는 모든 파일 형식을 지원합니다.

- **이미지**: PNG, JPEG, WEBP
- **오디오**: AAC, FLAC, MP3, MPA, MPEG, MPGA, OPUS, PCM, WAV, WEBM
- **비디오**: FLV, MOV, MPEG, MPEGPS, MPG, MP4, WEBM, WMV, 3GPP
- **문서**: PDF, TXT

> **참고:** 전체 요청 크기 제한이 20 MB이므로 작은 파일만 inline data로 전송할 수 있습니다.


### 3단계: Gemini용 Azure Blob Storage로 파일 업로드 {#step-3-upload-files-with-azure-blob-storage-for-gemini}

<Tabs>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: "gemini-2.5-flash"
      litellm_params:
        model: gemini/gemini-2.5-flash
        api_key: os.environ/GEMINI_API_KEY
```

2. 환경 변수 설정

```bash
export AZURE_STORAGE_ACCOUNT_NAME="your-storage-account"
export AZURE_STORAGE_FILE_SYSTEM="your-container-name"
export AZURE_STORAGE_ACCOUNT_KEY="your-account-key"
```
또는 `.env`에 추가합니다.

3. proxy 시작

```bash
litellm --config config.yaml
```

4. Azure Blob Storage로 파일 업로드

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234"
)

# Upload file to Azure Blob Storage
file = client.files.create(
    file=open("document.pdf", "rb"),
    purpose="user_data",
    extra_body={
        "target_model_names": "gemini-2.0-flash",
        "target_storage": "azure_storage"  # 👈 Use Azure Blob Storage
    }
)

print(f"File uploaded to Azure Blob Storage: {file.id}")

# Use the file with Gemini
completion = client.chat.completions.create(
    model="gemini-2.0-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Summarize this document"},
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    }
                }
            ]
        }
    ]
)

print(completion.choices[0].message.content)
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash
# Upload file with Azure Blob Storage
curl -X POST "http://0.0.0.0:4000/v1/files" \
  -H "Authorization: Bearer sk-1234" \
  -F "file=@document.pdf" \
  -F "purpose=user_data" \
  -F "target_storage=azure_storage" \
  -F "target_model_names=gemini-2.0-flash" \
  -F "custom_llm_provider=gemini"

# Use the file with Gemini
curl -X POST "http://0.0.0.0:4000/v1/chat/completions" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Summarize this document"},
          {
            "type": "file",
            "file": {
              "file_id": "file-id-from-upload",
              "format": "application/pdf"
            }
          }
        ]
      }
    ]
  }'
```

</TabItem>
</Tabs>

:::info
Azure Blob Storage에 업로드된 파일은 Azure 계정에 저장되며 반환된 file ID로 접근할 수 있습니다. 파일 URL 형식은 `https://{account}.blob.core.windows.net/{container}/{path}`입니다.
:::
