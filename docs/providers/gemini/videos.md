import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini Video 생성(Veo)

LiteLLM은 통합 API interface를 통해 Google Veo video 생성 model을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Google Veo AI video 생성 model |
| LiteLLM 제공자 라우트 | `gemini/` |
| 지원 모델 | **Veo 3.1 Lite**를 포함한 Veo 3.0 / 3.1 preview 및 production ID(아래 표 참고) |
| 비용 추적 | ✅ duration 기반 pricing. catalog에 있는 경우 선택적 **per-resolution** tier 지원(예: 720p vs 1080p) |
| 로깅 지원 | ✅ 전체 request/response 로깅 |
| Proxy Server 지원 | ✅ virtual key를 포함한 전체 proxy 통합 |
| Spend 관리 | ✅ budget tracking 및 rate limiting |
| 제공자 문서 링크 | [Google Veo 문서 ↗](https://ai.google.dev/gemini-api/docs/video) |

## 빠른 시작

### 필요한 API Key

```python
import os 
os.environ["GEMINI_API_KEY"] = "your-google-api-key"
# OR
os.environ["GOOGLE_API_KEY"] = "your-google-api-key"
```

### Basic 사용법

```python
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["GEMINI_API_KEY"] = "your-google-api-key"

# Step 1: Generate video
response = video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="A cat playing with a ball of yarn in a sunny garden"
)

print(f"Video ID: {response.id}")
print(f"Initial Status: {response.status}")  # "processing"

# Step 2: Poll for completion
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

# Step 3: Download video content
video_bytes = video_content(
    video_id=response.id
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)

print("Video downloaded successfully!")
```

## 지원 모델

| 모델 이름 | 설명 | 최대 길이 | 상태 |
|------------|-------------|--------------|--------|
| veo-3.0-generate-preview | Veo 3.0 video 생성 | 8초 | Preview |
| veo-3.1-generate-preview | Veo 3.1 video 생성 | 8초 | Preview |
| veo-3.1-lite-generate-preview | Veo 3.1 **Lite**(비용 효율형, [Gemini pricing](https://ai.google.dev/gemini-api/docs/video)) | Google docs 기준 | Preview |
| veo-3.1-fast-generate-preview / `…-001` | 더 빠른 variant / prod variant | Google docs 기준 | Preview / GA |
| veo-3.1-generate-001 | Veo 3.1 production | Google docs 기준 | GA |

`gemini/` prefix를 포함한 전체 LiteLLM model id를 사용하세요(예: `gemini/veo-3.1-lite-generate-preview`).

## Video 생성 Parameters {#video-generation-parameters}

LiteLLM은 OpenAI 스타일 parameter를 Veo 형식으로 자동 mapping합니다.

| OpenAI Parameter | Veo Parameter | 설명 | 예제 |
|------------------|---------------|-------------|---------|
| `prompt` | `prompt` | video에 대한 text description | "A cat playing" |
| `size` | `aspectRatio` 및, 적용 가능한 경우 **`resolution`** | 표준 width/height는 가로/세로 방향 및 API용 `720p` 또는 `1080p`로 mapping됩니다. | 아래 참고 |
| `seconds` | `durationSeconds` | 초 단위 duration | "8" -> 8 |
| `input_reference` | `image` | animation에 사용할 reference image | file object 또는 path |
| `model` | `model` | 사용할 model | "gemini/veo-3.0-generate-preview" |

### `size`와 output resolution

**표준 `size`** string을 전달하면 LiteLLM은 다음 두 값을 모두 설정합니다.

- **Aspect ratio**(`16:9` 또는 `9:16`) - 기존과 동일합니다.
- **Output resolution**(`720p` 또는 `1080p`) - preset에서 height가 명확하면 추가 field 없이 올바른 Veo tier를 요청합니다.

| `size` | Aspect ratio | Veo로 전송되는 resolution |
|--------|----------------|-------------------------|
| `1280x720`, `720x1280` | `16:9` / `9:16` | `720p` |
| `1920x1080`, `1080x1920` | `16:9` / `9:16` | `1080p` |

다른 `size` 값도 aspect ratio로 mapping됩니다(알 수 없으면 기본값 `16:9`). `resolution`은 직접 설정하지 않는 한 **Google 기본값**을 사용합니다.

위 preset과 맞지 않는 명시적 값이 필요하면 Veo의 **`resolution`**을 전달할 수도 있습니다(예: `extra_body` 사용). `resolution`을 직접 설정하면 `size`에서 추론한 값보다 우선합니다.

### Size에서 aspect ratio로의 변환(reference) {#size-to-aspect-ratio-reference}

- `"1280x720"`, `"1920x1080"` → `"16:9"` (landscape)
- `"720x1280"`, `"1080x1920"` → `"9:16"` (portrait)

### 지원 Veo Parameters

Veo API 기준:
- **prompt**(required): 선택적 audio cue를 포함한 text description
- **aspectRatio**: `"16:9"` (default) or `"9:16"`
- **resolution**: `"720p"`(default) 또는 `"1080p"`(Veo 3.1 전용, 16:9 aspect ratio 전용)
- **durationSeconds**: video 길이(대부분 model에서 최대 8초)
- **image**: animation용 reference image
- **negativePrompt**: video에서 제외할 내용(Veo 3.1)
- **referenceImages**: style 및 content reference(Veo 3.1 only)

## Complete Workflow 예제

```python
import litellm
import time

def generate_and_download_veo_video(
    prompt: str, 
    output_file: str = "video.mp4",
    size: str = "1280x720",
    seconds: str = "8"
):
    """
    Complete workflow for Veo video generation.
    
    Args:
        prompt: Text description of the video
        output_file: Where to save the video
        size: Video dimensions (e.g., "1280x720" for 16:9)
        seconds: Duration in seconds
        
    Returns:
        bool: True if successful
    """
    print(f"🎬 Generating video: {prompt}")
    
    # Step 1: Initiate generation
    response = litellm.video_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt=prompt,
        size=size,      # Maps to aspectRatio
        seconds=seconds  # Maps to durationSeconds
    )
    
    video_id = response.id
    print(f"✓ Video generation started (ID: {video_id})")
    
    # Step 2: Wait for completion
    max_wait_time = 600  # 10 minutes
    start_time = time.time()
    
    while time.time() - start_time < max_wait_time:
        status_response = litellm.video_status(video_id=video_id)
        
        if status_response.status == "completed":
            print("✓ Video generation completed!")
            break
        elif status_response.status == "failed":
            print("✗ Video generation failed")
            return False
        
        print(f"⏳ Status: {status_response.status}")
        time.sleep(10)
    else:
        print("✗ Timeout waiting for video generation")
        return False
    
    # Step 3: Download video
    print("⬇️  Downloading video...")
    video_bytes = litellm.video_content(video_id=video_id)
    
    with open(output_file, "wb") as f:
        f.write(video_bytes)
    
    print(f"✓ Video saved to {output_file}")
    return True

# Use it
generate_and_download_veo_video(
    prompt="A serene lake at sunset with mountains in the background",
    output_file="sunset_lake.mp4"
)
```

## Async 사용법

```python
from litellm import avideo_generation, avideo_status, avideo_content
import asyncio

async def async_video_workflow():
    # Generate video
    response = await avideo_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt="A cat playing with a ball of yarn"
    )
    
    # Poll for completion
    while True:
        status = await avideo_status(video_id=response.id)
        if status.status == "completed":
            break
        await asyncio.sleep(10)
    
    # Download content
    video_bytes = await avideo_content(video_id=response.id)
    
    with open("video.mp4", "wb") as f:
        f.write(video_bytes)

# Run it
asyncio.run(async_video_workflow())
```

## LiteLLM Proxy 사용법

### 설정

`config.yaml`에 Veo model을 추가합니다.

```yaml
model_list:
  - model_name: veo-3
    litellm_params:
      model: gemini/veo-3.0-generate-preview
      api_key: os.environ/GEMINI_API_KEY
```

프록시 시작:

```bash
litellm --config config.yaml
# Server running on http://0.0.0.0:4000
```

### Request 만들기

<Tabs>
<TabItem value="curl" label="Curl">

```bash
# Step 1: Generate video
curl --location 'http://0.0.0.0:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "veo-3",
    "prompt": "A cat playing with a ball of yarn in a sunny garden"
}'

# Response: {"id": "gemini::operations/generate_12345::...", "status": "processing", ...}

# Step 2: Check status
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-1234'

# Step 3: Download video (when status is "completed")
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

# Generate video
response = litellm.video_generation(
    model="veo-3",
    prompt="A cat playing with a ball of yarn in a sunny garden"
)

# Check status
import time
while True:
    status = litellm.video_status(video_id=response.id)
    if status.status == "completed":
        break
    time.sleep(10)

# Download video
video_bytes = litellm.video_content(video_id=response.id)
with open("video.mp4", "wb") as f:
    f.write(video_bytes)
```

</TabItem>
</Tabs>

## Cost Tracking 및 Spend

LiteLLM은 다음 기준으로 **video spend**를 추정합니다.

1. 생성된 clip이 과금되는 **길이**(초)
2. LiteLLM model catalog의 해당 model **초당 가격**(가능한 경우 [Google Gemini API video pricing](https://ai.google.dev/gemini-api/docs/video)과 정렬)

일부 model은 **720p**와 **1080p**에 서로 다른 **초당 요금**을 적용합니다. 위 표준 `size` preset을 사용하거나 `resolution`을 명시하면 LiteLLM은 matching tier를 사용하므로 **proxy spend, logs, budgets**가 요청한 resolution과 맞춰집니다.

LiteLLM은 Veo video 생성 비용을 자동 추적합니다.

```python
response = litellm.video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="A beautiful sunset"
)

# Cost is calculated based on video duration
# Veo pricing: ~$0.10 per second (estimated)
# Default video duration: ~5 seconds
# Estimated cost: ~$0.50
```

## OpenAI Video API와의 차이

| 기능 | OpenAI (Sora) | Gemini (Veo) |
|---------|---------------|--------------|
| Reference Images | ✅ 지원 | ❌ 미지원 |
| Size / dimensions | ✅ 지원 | ✅ `size`를 통해 지원. preset이 있으면 aspect ratio + `720p`/`1080p`로 mapping |
| Duration (`seconds`) | ✅ 지원 | ✅ 지원(`durationSeconds`로 mapping, 제한은 Google docs 기준) |
| Video Remix/Edit | ✅ 지원 | ❌ 미지원 |
| Video List | ✅ 지원 | ❌ 미지원 |
| Prompt 기반 생성 | ✅ 지원 | ✅ 지원 |
| Async Operations | ✅ 지원 | ✅ 지원 |

## Error Handling

```python
from litellm import video_generation, video_status, video_content
from litellm.exceptions import APIError, Timeout

try:
    response = video_generation(
        model="gemini/veo-3.0-generate-preview",
        prompt="A beautiful landscape"
    )
    
    # Poll with timeout
    max_attempts = 60  # 10 minutes (60 * 10s)
    for attempt in range(max_attempts):
        status = video_status(video_id=response.id)
        
        if status.status == "completed":
            video_bytes = video_content(video_id=response.id)
            with open("video.mp4", "wb") as f:
                f.write(video_bytes)
            break
        elif status.status == "failed":
            raise APIError("Video generation failed")
        
        time.sleep(10)
    else:
        raise Timeout("Video generation timed out")
        
except APIError as e:
    print(f"API Error: {e}")
except Timeout as e:
    print(f"Timeout: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## 권장 사항

1. **완료될 때까지 항상 polling**: Veo video 생성은 asynchronous 방식이며 몇 분이 걸릴 수 있습니다.
2. **합리적인 timeout 설정**: video 생성에 최소 5-10분을 허용하세요.
3. **실패를 graceful하게 처리**: `failed` status를 확인하고 retry logic을 구현하세요.
4. **구체적인 prompt 사용**: 일반적으로 더 자세한 prompt가 더 좋은 결과를 만듭니다.
5. **Video ID 저장**: application이 재시작되어도 polling을 재개할 수 있도록 operation ID/video ID를 저장하세요.

## 문제 해결

### Video 생성 timeout 발생

```python
# Increase polling timeout
max_wait_time = 900  # 15 minutes instead of 10
```

### 다운로드 시 Video not found 발생

```python
# Make sure video is completed before downloading
status = video_status(video_id=video_id)
if status.status != "completed":
    print("Video not ready yet!")
```

### API key error

```python
# Verify your API key is set
import os
print(os.environ.get("GEMINI_API_KEY"))

# Or pass it explicitly
response = video_generation(
    model="gemini/veo-3.0-generate-preview",
    prompt="...",
    api_key="your-api-key-here"
)
```

## 함께 보기

- [OpenAI Video 생성](../openai/videos.md)
- [Azure Video 생성](../azure/videos.md)
- [Vertex AI Video 생성](../vertex_ai/videos.md)
- [Video 생성 API Reference](/docs/videos)
- [Veo Pass-through Endpoints](/docs/pass_through/google_ai_studio#example-4-video-generation-with-veo)
