# /videos

| 기능 | 지원 여부 | 
|---------|-----------|
| 비용 추적 | ✅ |
| 로깅 | ✅ (전체 request/response 로깅) |
| Fallbacks | ✅ (지원 모델 간) |
| Load Balancing | ✅ |
| 가드레일 Support | ✅ Content moderation 및 safety check 지원 |
| Proxy Server Support | ✅ Virtual key와 전체 proxy 통합 |
| Spend Management | ✅ Budget tracking 및 rate limiting |
| 지원 프로바이더 | `openai`, `azure`, `gemini`, `vertex_ai`, `runwayml` |

:::tip

LiteLLM은 [OpenAI Video Generation API specification](https://platform.openai.com/docs/guides/video-generation)을 따릅니다.

:::

## **LiteLLM Python SDK 사용법**
### 빠른 시작 

```python
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["OPENAI_API_KEY"] = "sk-.."

# Generate video
response = video_generation(
    model="openai/sora-2",
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

### Async 사용법 

```python
from litellm import avideo_generation, avideo_status, avideo_content
import os, asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

async def test_async_video(): 
    response = await avideo_generation(
        model="openai/sora-2",
        prompt="A cat playing with a ball of yarn in a sunny garden",
        seconds="8",
        size="720x1280"
    )
    
    print(f"Video ID: {response.id}")
    print(f"Initial Status: {response.status}")
    
    # Check status until video is ready
    while True:
        status_response = await avideo_status(
            video_id=response.id
        )
        
        print(f"Current Status: {status_response.status}")
        
        if status_response.status == "completed":
            break
        elif status_response.status == "failed":
            print("Video generation failed")
            break
        
        await asyncio.sleep(10)  # Wait 10 seconds before checking again
    
    # Download video content when ready
    video_bytes = await avideo_content(
        video_id=response.id
    )
    
    # Save to file
    with open("generated_video.mp4", "wb") as f:
        f.write(video_bytes)

asyncio.run(test_async_video())
```

### Video 상태 확인

```python
from litellm import video_status

status_response = video_status(
    video_id="video_1234567890"
)

print(f"Video Status: {status_response.status}")
print(f"Created At: {status_response.created_at}")
print(f"Model: {status_response.model}")
```

### Video 목록 조회

Video 목록을 조회할 때는 decode할 `video_id`가 없으므로 provider를 지정해야 합니다.

```python
from litellm import video_list

# List videos from OpenAI
videos = video_list(custom_llm_provider="openai")

for video in videos:
    print(f"Video ID: {video['id']}")
```

### Reference Image로 Video 생성

```python
from litellm import video_generation

# Video generation with reference image
response = video_generation(
    model="openai/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
```

### Video Remix(Video 편집)

```python
from litellm import video_remix

# Video remix with reference image
response = video_remix(
    model="openai/sora-2",
    prompt="Make the cat jump higher",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    seconds="8"
)

print(f"Video ID: {response.id}")
```

### 선택 파라미터

```python
response = video_generation(
    model="openai/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",                    # Video duration in seconds
    size="720x1280",               # Video dimensions
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image as file object
    user="user_123"                # User identifier for tracking
)
```

### Azure Video 생성

```python
from litellm import video_generation
import os

os.environ["AZURE_OPENAI_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_OPENAI_API_BASE"] = "https://your-resource.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2024-02-15-preview"

response = video_generation(
    model="azure/sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
```

## **LiteLLM Proxy 사용법**

LiteLLM은 전체 video 생성 workflow를 위한 OpenAI API 호환 video endpoint를 제공합니다.

- `/videos` - 새 video 생성
- `/videos/remix` - reference image로 기존 video 편집
- `/videos/status` - video generation 상태 확인
- `/videos/retrieval` - 완료된 video 다운로드

**설정**

LiteLLM proxy `config.yaml`에 다음을 추가합니다.

```yaml
model_list:
  - model_name: sora-2
    litellm_params:
      model: openai/sora-2
      api_key: os.environ/OPENAI_API_KEY
  - model_name: azure-sora-2
    litellm_params:
      model: azure/sora-2
      api_key: os.environ/AZURE_OPENAI_API_KEY
      api_base: os.environ/AZURE_OPENAI_API_BASE
```

LiteLLM을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

Video 생성 request를 테스트합니다.

```bash
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--data '{
    "model": "sora-2",
    "prompt": "A beautiful sunset over the ocean"
}'
```

Video 상태 request를 테스트합니다.

```bash
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-1234'
```

Video retrieval request를 테스트합니다.

```bash
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-1234' \
--output video.mp4
```

Video remix request를 테스트합니다.

```bash
curl --location --request POST 'http://localhost:4000/v1/videos/{video_id}/remix' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--data '{
    "prompt": "New remix instructions"
}'
```

Video list request를 테스트합니다(`custom_llm_provider` 필요).

```bash
# Note: video_list requires custom_llm_provider since there's no video_id to decode from
curl --location 'http://localhost:4000/v1/videos?custom_llm_provider=openai' \
--header 'x-litellm-api-key: sk-1234'

# Or using header
curl --location 'http://localhost:4000/v1/videos' \
--header 'x-litellm-api-key: sk-1234' \
--header 'custom-llm-provider: azure'
```

### Character, Edit, Extension 엔드포인트

LiteLLM proxy는 다음 OpenAI 호환 video route도 지원합니다.

- `POST /v1/videos/characters`
- `GET /v1/videos/characters/{character_id}`
- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

#### Routing 동작(`target_model_names`, encoded ID, provider override)

- `POST /v1/videos/characters`는 `POST /v1/videos`처럼 `target_model_names`를 지원합니다.
- Character 생성 시 `target_model_names`가 제공되면 LiteLLM은 반환되는 `character_id`에 routing metadata를 encoding합니다.
- `GET /v1/videos/characters/{character_id}`는 encoded character ID를 직접 받을 수 있습니다. LiteLLM은 내부에서 ID를 decode하고 올바른 model/provider metadata로 route합니다.
- `POST /v1/videos/edits`와 `POST /v1/videos/extensions`는 다음 두 형식을 모두 지원합니다.
  - plain `video.id`
  - LiteLLM이 반환한 encoded `video.id` 값
- `custom_llm_provider`는 다른 proxy endpoint와 같은 패턴으로 제공할 수 있습니다.
  - header: `custom-llm-provider`
  - query: `?custom_llm_provider=...`
  - body: `custom_llm_provider` (또는 적용 가능한 경우 `extra_body.custom_llm_provider`)

#### `target_model_names`로 Character 생성

```bash
curl --location 'http://localhost:4000/v1/videos/characters' \
--header 'Authorization: Bearer sk-1234' \
-F 'name=hero' \
-F 'target_model_names=gpt-4' \
-F 'video=@/path/to/character.mp4'
```

예제 response(encoded `id`):

```json
{
  "id": "character_...",
  "object": "character",
  "created_at": 1712697600,
  "name": "hero"
}
```

#### Encoded `character_id`로 character 조회

```bash
curl --location 'http://localhost:4000/v1/videos/characters/character_...' \
--header 'Authorization: Bearer sk-1234'
```

#### Encoded `video.id`로 video edit

```bash
curl --location 'http://localhost:4000/v1/videos/edits' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Make this brighter",
  "video": { "id": "video_..." }
}'
```

#### `extra_body`의 provider override로 video extension

```bash
curl --location 'http://localhost:4000/v1/videos/extensions' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Continue this scene",
  "seconds": "4",
  "video": { "id": "video_..." },
  "extra_body": { "custom_llm_provider": "openai" }
}'
```

Azure video 생성 request를 테스트합니다.

```bash
curl http://localhost:4000/v1/videos \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "azure-sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280"
  }'
```

## **LiteLLM Proxy에서 OpenAI Client 사용**

표준 OpenAI Python client로 LiteLLM의 video endpoint를 사용할 수 있습니다. 익숙한 interface를 유지하면서 LiteLLM의 provider abstraction과 proxy 기능을 함께 활용할 수 있습니다.

### 설정

먼저 OpenAI client가 LiteLLM proxy를 바라보도록 설정합니다.

```python
from openai import OpenAI

# Point the OpenAI client to your LiteLLM proxy
client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy API key
    base_url="http://localhost:4000/v1"  # Your LiteLLM proxy URL
)
```

### Video 생성

OpenAI client interface로 새 video를 생성합니다.

```python
# Basic video generation
response = client.videos.create(
    model="sora-2",
    prompt="A cat playing with a ball of yarn in a sunny garden",
    seconds=8,
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

### Reference Image로 Video 생성

reference image를 사용해 video를 생성합니다.

```python
# Video generation with reference image
response = client.videos.create(
    model="sora-2",
    prompt="Add clouds to the video",
    seconds=4,
    input_reference=open("/path/to/your/image.jpg", "rb")
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

### Video 상태 확인

video generation 상태를 확인합니다.

```python
# Check video status
status_response = client.videos.retrieve(
    video_id="video_6900378779308191a7359266e59b53fc01cd6bbd27a70763"
)

print(f"Status: {status_response.status}")
print(f"Progress: {status_response.progress}%")

# Poll until completion
import time

while status_response.status not in ["completed", "failed"]:
    time.sleep(10)  # Wait 10 seconds
    status_response = client.videos.retrieve(
        video_id="video_6900378779308191a7359266e59b53fc01cd6bbd27a70763"
    )
    print(f"Current status: {status_response.status}")
```

### Video 목록 조회

video 목록을 가져옵니다.

```python
# List all videos
videos = client.videos.list()

for video in videos.data:
    print(f"Video ID: {video.id}, Status: {video.status}")
```

### Video Content 다운로드

완료된 video를 다운로드합니다.

```python
# Download video content
response = client.videos.download_content(
    video_id="video_68fa2938848c8190bb718f977503aba6092ab18d68938fed"
)

# Save the video to file
with open("generated_video.mp4", "wb") as f:
    f.write(response.content)

print("Video downloaded successfully!")
```

### Video Remix(편집)

새 instruction으로 기존 video를 편집합니다.

```python
# Remix/edit an existing video
response = client.videos.remix(
    video_id="video_68fa2574bdd88190873a8af06a370ff407094ddbc4bbb91b",
    prompt="Slow the cloud movement",
    seconds=8
)

print(f"Remix Video ID: {response.id}")
print(f"Status: {response.status}")
```

### Complete Workflow 예제

전체 video 생성 workflow를 보여주는 완성 예제입니다.

```python
from openai import OpenAI
import time

# Initialize client
client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000/v1"
)

# 1. Generate video
print("Generating video...")
response = client.videos.create(
    model="sora-2",
    prompt="A serene lake with mountains in the background",
    seconds=8,
    size="1280x720"
)

video_id = response.id
print(f"Video generation started. ID: {video_id}")

# 2. Poll for completion
print("Waiting for video to complete...")
while True:
    status = client.videos.retrieve(video_id=video_id)
    print(f"Status: {status.status}")
    
    if status.status == "completed":
        print("Video generation completed!")
        break
    elif status.status == "failed":
        print("Video generation failed!")
        break
    
    time.sleep(10)

# 3. Download video
if status.status == "completed":
    print("Downloading video...")
    video_content = client.videos.download_content(video_id=video_id)
    
    with open(f"video_{video_id}.mp4", "wb") as f:
        f.write(video_content.content)
    
    print("Video saved successfully!")

# 4. Optional: Remix the video
print("Creating a remix...")
remix_response = client.videos.remix(
    video_id=video_id,
    prompt="Add gentle ripples to the lake surface"
)

print(f"Remix started. ID: {remix_response.id}")
```

## **Request/응답 형식**

:::info

LiteLLM은 **OpenAI Video Generation API specification**을 따릅니다.

전체 세부사항은 [official OpenAI Video Generation documentation](https://platform.openai.com/docs/guides/video-generation)을 참고하세요.

:::

### 예제 Request

```python
{
    "model": "openai/sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280",
    "user": "user_123"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | 사용할 video 생성 model입니다(예: `"openai/sora-2"`). |
| `prompt` | string | Yes | 원하는 video를 설명하는 text입니다. |
| `seconds` | string | No | video 길이(초)입니다(예: "8", "16"). |
| `size` | string | No | video dimensions입니다(예: "720x1280", "1280x720"). |
| `input_reference` | file object | No | video generation 또는 editing에 사용할 reference image입니다(generation과 remix 모두). |
| `user` | string | No | 추적용 user identifier입니다. |
| `video_id` | string | Yes (status/retrieval) | 상태 확인 또는 retrieval에 사용할 Video ID입니다. |

#### Video 생성 Request 예제

**video generation의 경우:**
```json
{
  "model": "sora-2",
  "prompt": "A cat playing with a ball of yarn in a sunny garden",
  "seconds": "8",
  "size": "720x1280"
}
```

**reference image를 사용한 video generation의 경우:**
```python
{
  "model": "sora-2",
  "prompt": "A cat playing with a ball of yarn in a sunny garden",
  "input_reference": open("path/to/image.jpg", "rb"),  # File object
  "seconds": "8",
  "size": "720x1280"
}
```

**video status check의 경우:**
```json
{
  "video_id": "video_1234567890",
  "model": "sora-2"
}
```

**video retrieval의 경우:**
```json
{
  "video_id": "video_1234567890",
  "model": "sora-2"
}
```

### 응답 형식

response는 다음 구조의 OpenAI video generation format을 따릅니다.

```json
{
    "id": "video_6900378779308191a7359266e59b53fc01cd6bbd27a70763",
    "object": "video",
    "status": "queued",
    "created_at": 1761621895,
    "completed_at": null,
    "expires_at": null,
    "error": null,
    "progress": 0,
    "remixed_from_video_id": null,
    "seconds": "4",
    "size": "720x1280",
    "model": "sora-2",
    "usage": {
        "duration_seconds": 4.0
    }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | video의 unique identifier입니다. |
| `object` | string | video response에서는 항상 `"video"`입니다. |
| `status` | string | video 처리 status입니다(`"queued"`, `"processing"`, `"completed"`). |
| `created_at` | integer | video가 생성된 시점의 Unix timestamp입니다. |
| `model` | string | video generation에 사용된 model입니다. |
| `size` | string | video dimensions입니다. |
| `seconds` | string | video 길이(초)입니다. |
| `usage` | object | token usage 및 duration information입니다. |


## **지원 프로바이더**

| Provider    | 사용법 Link      |
|-------------|--------------------|
| OpenAI      |   [사용법](providers/openai/videos)  |
| Azure       |   [사용법](providers/azure/videos)   |
| Gemini       |   [사용법](providers/gemini/videos)   |
| Vertex AI   |   [사용법](providers/vertex_ai/videos) |
| RunwayML    |   [사용법](providers/runwayml/videos) |
