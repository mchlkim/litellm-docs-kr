# RunwayML - 비디오 생성 {#runwayml-video-generation}

LiteLLM은 RunwayML의 Gen-4 비디오 생성 API를 지원하므로 text prompt와 image에서 video를 생성할 수 있습니다.

## 빠른 시작

```python showLineNumbers title="기본 비디오 생성"
from litellm import video_generation
import os

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

# Generate video from text and image
response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")
```

## 인증

RunwayML API key를 설정합니다.

```python showLineNumbers title="API Key 설정"
import os

os.environ["RUNWAYML_API_KEY"] = "your-api-key"
```

## 지원 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `model` | string | 예 | 사용할 model(예: `runwayml/gen4_turbo`) |
| `prompt` | string | 예 | video에 대한 text description |
| `input_reference` | string/file | 예 | reference image의 URL 또는 file path |
| `seconds` | int | 아니요 | video duration(5초 또는 10초) |
| `size` | string | 아니요 | video dimension(`1280x720` 또는 `720x1280`). `ratio` format(`1280:720`)도 사용할 수 있습니다 |

## 전체 Workflow {#complete-workflow}

```python showLineNumbers title="전체 비디오 생성 Workflow"
from litellm import video_generation, video_status, video_content
import os
import time

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

# 1. Generate video
response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

video_id = response.id
print(f"Video generation started: {video_id}")

# 2. Check status until completed
while True:
    status_response = video_status(video_id=video_id)
    print(f"Status: {status_response.status}")
    
    if status_response.status == "completed":
        print("Video generation completed!")
        break
    elif status_response.status == "failed":
        print("Video generation failed")
        break
    
    time.sleep(10)  # Wait 10 seconds before checking again

# 3. Download video content
video_bytes = video_content(video_id=video_id)

# 4. Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)

print("Video saved successfully!")
```

## Async 사용법

```python showLineNumbers title="비동기 비디오 생성"
from litellm import avideo_generation, avideo_status, avideo_content
import os
import asyncio

os.environ["RUNWAYML_API_KEY"] = "your-api-key"

async def generate_video():
    # Generate video
    response = await avideo_generation(
        model="runwayml/gen4_turbo",
        prompt="A serene lake with mountains in the background",
        input_reference="https://example.com/lake.jpg",
        seconds=5,
        size="1280x720"
    )
    
    video_id = response.id
    print(f"Video generation started: {video_id}")
    
    # Poll for completion
    while True:
        status_response = await avideo_status(video_id=video_id)
        print(f"Status: {status_response.status}")
        
        if status_response.status == "completed":
            break
        elif status_response.status == "failed":
            print("Video generation failed")
            return
        
        await asyncio.sleep(10)
    
    # Download video
    video_bytes = await avideo_content(video_id=video_id)
    
    # Save to file
    with open("generated_video.mp4", "wb") as f:
        f.write(video_bytes)
    
    print("Video saved successfully!")

asyncio.run(generate_video())
```

## LiteLLM Proxy 사용법

proxy configuration에 RunwayML을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gen4-turbo
    litellm_params:
      model: runwayml/gen4_turbo
      api_key: os.environ/RUNWAYML_API_KEY
```

프록시 시작:

```bash
litellm --config /path/to/config.yaml
```

proxy를 통해 video를 생성합니다.

```bash showLineNumbers title="Proxy 요청"
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--data '{
    "model": "runwayml/gen4_turbo",
    "prompt": "A high quality demo video of litellm ai gateway",
    "input_reference": "https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    "ratio": "1280:720"
}'
```

video status를 확인합니다.

```bash showLineNumbers title="상태 확인"
curl --location 'http://localhost:4000/v1/videos/{video_id}' \
--header 'x-litellm-api-key: sk-1234'
```

video content를 다운로드합니다.

```bash showLineNumbers title="비디오 다운로드"
curl --location 'http://localhost:4000/v1/videos/{video_id}/content' \
--header 'x-litellm-api-key: sk-1234' \
--output video.mp4
```

## 지원 모델 {#supported-models}

| Model | 설명 | Duration | Aspect ratios |
|-------|-------------|----------|---------------|
| `runwayml/gen4_turbo` | 빠른 video generation | 5-10s | 1280x720, 720x1280 |

## Error handling {#error-handling}

```python showLineNumbers title="Error handling"
from litellm import video_generation, video_status
import time

try:
    response = video_generation(
        model="runwayml/gen4_turbo",
        prompt="A scenic mountain view",
        input_reference="https://example.com/mountain.jpg",
        seconds=5
    )
    
    # Poll for completion
    max_attempts = 60  # 10 minutes max
    attempts = 0
    
    while attempts < max_attempts:
        status_response = video_status(video_id=response.id)
        
        if status_response.status == "completed":
            print("Video generation completed!")
            break
        elif status_response.status == "failed":
            error = status_response.error or {}
            print(f"Video generation failed: {error.get('message', 'Unknown error')}")
            break
        
        time.sleep(10)
        attempts += 1
    
    if attempts >= max_attempts:
        print("Video generation timed out")
        
except Exception as e:
    print(f"Error: {str(e)}")
```

## Cost tracking {#cost-tracking}

LiteLLM은 RunwayML video generation 비용을 자동으로 추적합니다.

```python showLineNumbers title="Cost tracking"
from litellm import video_generation, completion_cost

response = video_generation(
    model="runwayml/gen4_turbo",
    prompt="A high quality demo video of litellm ai gateway",
    input_reference="https://media.licdn.com/dms/image/v2/D4D0BAQFqOrIAJEgtLw/company-logo_200_200/company-logo_200_200/0/1714076049190/berri_ai_logo?e=2147483647&v=beta&t=7tG_KRZZ4MPGc7Iin79PcFcrpvf5Hu6rBM4ptHGU1DY",
    seconds=5,
    size="1280x720"
)

# Calculate cost
cost = completion_cost(completion_response=response)
print(f"Video generation cost: ${cost}")
```

## API reference {#api-reference}

전체 API 세부 정보는 LiteLLM이 따르는 [OpenAI Video Generation API specification](https://platform.openai.com/docs/guides/video-generation)을 참고하세요.

## 지원 기능 {#supported-features}

| 기능 | 지원 |
|---------|-----------|
| Video generation | ✅ |
| Image-to-video | ✅ |
| Status checking | ✅ |
| Content download | ✅ |
| Cost tracking | ✅ |
| Logging | ✅ |
| Fallbacks | ✅ |
| Load balancing | ✅ |
