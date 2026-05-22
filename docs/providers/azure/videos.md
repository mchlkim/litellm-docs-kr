import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure 비디오 생성 {#azure-video-generation}

LiteLLM은 Sora를 포함한 Azure OpenAI 비디오 생성 모델을 전체 엔드투엔드 통합으로 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Sora-2를 포함한 Azure OpenAI 비디오 생성 모델 |
| LiteLLM의 Provider Route | `azure/` |
| 지원 모델 | `sora-2` |
| 비용 추적 | ✅ 기간 기반 가격 책정($0.10/second) |
| 로깅 지원 | ✅ 전체 요청/응답 로깅 |
| 가드레일 지원 | ✅ 콘텐츠 모더레이션 및 안전 검사 |
| Proxy Server 지원 | ✅ 가상 키를 통한 전체 프록시 통합 |
| 지출 관리 | ✅ 예산 추적 및 속도 제한 |
| 제공자 문서 링크 | [Azure OpenAI 비디오 생성 ↗](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/video-generation) |

## 빠른 시작

### 필수 API 키 {#required-api-keys}

```python
import os 
os.environ["AZURE_OPENAI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_OPENAI_API_BASE"] = "https://your-resource.openai.azure.com/"
```

### 기본 사용법 {#basic-usage}

```python
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["AZURE_OPENAI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_OPENAI_API_BASE"] = "https://your-resource.openai.azure.com/"

# Generate video
response = video_generation(
    model="azure/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")

# Check status until video is ready
while True:
    status_response = video_status(
        video_id=response.id
    )
    
    print(f"Current Status: {status_response.status}")
    
    if status_response.status == "completed":
        break
    elif status_response.status == "failed":
        print("Video generation failed")
        break
    
    time.sleep(10)  # Wait 10 seconds before checking again

# Download video content when ready
video_bytes = video_content(
    video_id=response.id
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

## LiteLLM Proxy Server 사용법

LiteLLM Proxy Server로 Azure 비디오 생성 모델을 호출하는 방법은 다음과 같습니다.

### 1. 환경에 키 저장 {#1-save-key-in-your-environment}

```bash
export AZURE_OPENAI_API_KEY="your-azure-api-key"
export AZURE_OPENAI_API_BASE="https://your-resource.openai.azure.com/"
```

### 2. 프록시 시작 

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: azure-sora-2
    litellm_params:
      model: azure/sora-2
      api_key: os.environ/AZURE_OPENAI_API_KEY
      api_base: os.environ/AZURE_OPENAI_API_BASE
```

</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model azure/sora-2

# Server running on http://0.0.0.0:4000
```

</TabItem>

</Tabs>

### 3. 테스트 {#3-test-it}

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/videos/generations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "azure-sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280"
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.videos.create(
    model="azure-sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds=8,
    size="720x1280"
)

print(response)
```

</TabItem>
</Tabs>

## 지원 모델 {#supported-models}

| 모델 이름 | 
|------------|
| sora-2 | 
|sora-2-pro |
|`sora-2-pro-high-res`|


## 로깅 및 관측성 {#logging--observability}

### 요청/응답 로깅 {#requestresponse-logging}

모든 비디오 생성 요청은 다음 정보와 함께 자동으로 기록됩니다.

- **요청 세부 정보**: prompt, model, duration, size
- **응답 세부 정보**: video ID, status, creation time
- **비용 추적**: 기간 기반 가격 계산
- **성능 지표**: 요청 지연 시간, 처리 시간

### 로깅 제공자 {#logging-providers}

비디오 생성은 모든 LiteLLM 로깅 제공자와 함께 작동합니다.

- **Datadog**: 실시간 모니터링 및 알림
- **Helicone**: 요청 추적 및 디버깅
- **LangSmith**: LangChain 통합 및 추적
- **사용자 지정 webhooks**: 자체 엔드포인트로 로그 전송

**예제: Datadog 로깅 활성화**

```yaml
general_settings:
  alerting: ["datadog"]
  datadog_api_key: os.environ/DATADOG_API_KEY
```


## 비디오 생성 매개변수 {#video-generation-parameters}

- `prompt` (required): 원하는 비디오에 대한 텍스트 설명
- `model` (optional): 사용할 모델이며 기본값은 "azure/sora-2"입니다.
- `seconds` (optional): 초 단위 비디오 길이(예: "8", "16")
- `size` (optional): 비디오 크기(예: "720x1280", "1280x720")
- `input_reference` (optional): 비디오 편집에 사용할 참조 이미지
- `user` (optional): 추적에 사용할 사용자 식별자

## 비디오 콘텐츠 가져오기 {#video-content-retrieval}

```python
# Download video content
video_bytes = video_content(
    video_id="video_1234567890"
)

# Save to file
with open("video.mp4", "wb") as f:
    f.write(video_bytes)
```

## 전체 워크플로 {#complete-workflow}

```python
import litellm
import time

def generate_and_download_video(prompt):
    # Step 1: Generate video
    response = litellm.video_generation(
        prompt=prompt,
        model="azure/sora-2",
        seconds="8",
        size="720x1280"
    )
    
    video_id = response.id
    print(f"Video ID: {video_id}")
    
    # Step 2: Wait for processing (in practice, poll status)
    time.sleep(30)
    
    # Step 3: Download video
    video_bytes = litellm.video_content(
        video_id=video_id
    )
    
    # Step 4: Save to file
    with open(f"video_{video_id}.mp4", "wb") as f:
        f.write(video_bytes)
    
    return f"video_{video_id}.mp4"

# Usage
video_file = generate_and_download_video(
    "A cat playing with a ball of yarn in a sunny garden"
)
```

## Video Remix(비디오 편집) {#video-remix-video-editing}

```python
# Video editing with reference image
response = litellm.video_remix(
    video_id="video_456",
    prompt="Make the cat jump higher",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    seconds="8"
)

print(f"Video ID: {response.id}")
```

## 오류 처리 {#error-handling}

```python
from litellm.exceptions import BadRequestError, AuthenticationError

try:
    response = video_generation(
        prompt="A cat playing with a ball of yarn",
        model="azure/sora-2"
    )
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except BadRequestError as e:
    print(f"Bad request: {e}")
```
