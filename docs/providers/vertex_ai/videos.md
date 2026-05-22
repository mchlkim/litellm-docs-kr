import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 비디오 생성 (Veo) {#vertex-ai-video-generation-veo}

LiteLLM은 통합 OpenAI 비디오 API 표면을 통해 Vertex AI의 Veo 비디오 생성 모델을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Google Cloud Vertex AI Veo 비디오 생성 모델 |
| LiteLLM의 프로바이더 라우트 | `vertex_ai/` |
| 지원 모델 | `veo-2.0-generate-001`, `veo-3.0-generate-preview`, `veo-3.0-fast-generate-preview`, `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview` |
| 비용 추적 | ✅ 시간 기반 가격 책정 |
| 로깅 지원 | ✅ 전체 요청/응답 로깅 |
| Proxy 서버 지원 | ✅ 가상 키와 완전히 통합되는 Proxy |
| 지출 관리 | ✅ 예산 추적 및 속도 제한 |
| 프로바이더 문서 링크 | [Vertex AI Veo 문서 ↗](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation) |

## 빠른 시작

### 필수 환경 설정 {#required-environment-setup}

```python
import json
import os

os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Option 1: Point to a service account file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service_account.json"

# Option 2: Store the service account JSON directly
with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    os.environ["VERTEXAI_CREDENTIALS"] = f.read()
```

### 기본 사용법 {#basic-사용법}

```python
from litellm import video_generation, video_status, video_content
import json
import os
import time

with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()

response = video_generation(
    model="vertex_ai/veo-3.0-generate-preview",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
    seconds="8",
    size="1280x720",
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")

# Poll for completion
while True:
    status = video_status(
        video_id=response.id,
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    print(f"Current Status: {status.status}")

    if status.status == "completed":
        break
    if status.status == "failed":
        raise RuntimeError("Video generation failed")

    time.sleep(10)

# Download the rendered video
video_bytes = video_content(
    video_id=response.id,
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
)

with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

## 지원 모델 {#supported-모델}

| 모델 이름 | 설명 | 최대 길이 | 상태 |
|------------|-------------|--------------|--------|
| veo-2.0-generate-001 | Veo 2.0 비디오 생성 | 5초 | GA |
| veo-3.0-generate-preview | Veo 3.0 고품질 | 8초 | Preview |
| veo-3.0-fast-generate-preview | Veo 3.0 빠른 생성 | 8초 | Preview |
| veo-3.1-generate-preview | Veo 3.1 고품질 | 10초 | Preview |
| veo-3.1-fast-generate-preview | Veo 3.1 빠른 생성 | 10초 | Preview |

## 비디오 생성 매개변수 {#video-generation-parameters}

LiteLLM은 OpenAI 스타일 매개변수를 Veo의 API 형식으로 자동 변환합니다.

| OpenAI 매개변수 | Vertex AI 매개변수 | 설명 | 예제 |
|------------------|---------------------|-------------|---------|
| `prompt` | `instances[].prompt` | 비디오의 텍스트 설명 | "A cat playing" |
| `size` | `parameters.aspectRatio` | `16:9` 또는 `9:16`으로 변환됨 | "1280x720" → `16:9` |
| `seconds` | `parameters.durationSeconds` | 클립 길이(초) | "8" → `8` |
| `input_reference` | `instances[].image` | 애니메이션용 참조 이미지 | `open("image.jpg", "rb")` |
| 프로바이더별 매개변수 | `extra_body` | Vertex API로 전달됨 | `{"negativePrompt": "blurry"}` |

### 크기와 화면 비율 매핑 {#size-to-aspect-ratio-mapping}

- `1280x720`, `1920x1080` → `16:9`
- `720x1280`, `1080x1920` → `9:16`
- 알 수 없는 크기는 기본값으로 `16:9`를 사용합니다.

## Async 사용법

```python
from litellm import avideo_generation, avideo_status, avideo_content
import asyncio
import json

with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()


async def workflow():
    response = await avideo_generation(
        model="vertex_ai/veo-3.1-generate-preview",
        prompt="Slow motion water droplets splashing into a pool",
        seconds="10",
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    while True:
        status = await avideo_status(
            video_id=response.id,
            vertex_project="your-gcp-project-id",
            vertex_location="us-central1",
            vertex_credentials=vertex_credentials,
        )

        if status.status == "completed":
            break
        if status.status == "failed":
            raise RuntimeError("Video generation failed")

        await asyncio.sleep(10)

    video_bytes = await avideo_content(
        video_id=response.id,
        vertex_project="your-gcp-project-id",
        vertex_location="us-central1",
        vertex_credentials=vertex_credentials,
    )

    with open("veo_water.mp4", "wb") as f:
        f.write(video_bytes)

asyncio.run(workflow())
```

## LiteLLM Proxy 사용법 {#litellm-proxy-사용법}

`config.yaml`에 Veo 모델을 추가합니다.

```yaml
model_list:
  - model_name: veo-3
    litellm_params:
      model: vertex_ai/veo-3.0-generate-preview
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/VERTEXAI_CREDENTIALS
```

프록시를 시작하고 요청을 보냅니다.

<Tabs>
<TabItem value="curl" label="Curl">

```bash
# Step 1: Generate video
curl --location 'http://0.0.0.0:4000/videos' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
  "model": "veo-3",
  "prompt": "Aerial shot over a futuristic city at sunrise",
  "seconds": "8"
}'

# Step 2: Poll status
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-1234'

# Step 3: Download video
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-1234' \
--output video.mp4
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python
import litellm

litellm.api_base = "http://0.0.0.0:4000"
litellm.api_key = "sk-1234"

response = litellm.video_generation(
    model="veo-3",
    prompt="Aerial shot over a futuristic city at sunrise",
)

status = litellm.video_status(video_id=response.id)
while status.status not in ["completed", "failed"]:
    status = litellm.video_status(video_id=response.id)

if status.status == "completed":
    content = litellm.video_content(video_id=response.id)
    with open("veo_city.mp4", "wb") as f:
        f.write(content)
```

</TabItem>
</Tabs>

## 비용 추적 {#cost-tracking}

LiteLLM은 Veo가 반환한 길이를 기록하므로 시간 기반 가격 책정을 적용할 수 있습니다.

```python
with open("/path/to/service_account.json", "r", encoding="utf-8") as f:
    vertex_credentials = f.read()

response = video_generation(
    model="vertex_ai/veo-2.0-generate-001",
    prompt="Flowers blooming in fast forward",
    seconds="5",
    vertex_project="your-gcp-project-id",
    vertex_location="us-central1",
    vertex_credentials=vertex_credentials,
)

print(response.usage)  # {"duration_seconds": 5.0}
```

## 문제 해결

- **`vertex_project is required`**: `VERTEXAI_PROJECT` env var를 설정하거나 요청에 `vertex_project`를 전달합니다.
- **`Permission denied`**: 서비스 계정에 `Vertex AI User` 역할이 있고 올바른 리전이 활성화되어 있는지 확인합니다.
- **비디오가 `processing`에 멈춤**: Veo 작업은 오래 실행됩니다. 최대 약 10분 동안 10~15초마다 계속 폴링합니다.

## 함께 보기 {#see-also}

- [OpenAI 비디오 생성](../openai/videos.md)
- [Azure 비디오 생성](../azure/videos.md)
- [Gemini 비디오 생성](../gemini/videos.md)
- [비디오 생성 API 참조](/docs/videos)
