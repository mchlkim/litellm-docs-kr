import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI 비디오 생성

LiteLLM은 Sora를 포함한 OpenAI 비디오 생성 모델을 지원합니다.

## 빠른 시작

### 필수 API 키

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 기본 사용법

```python
from litellm import video_generation, video_content
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

# Generate a video
response = video_generation(
    prompt="A cat playing with a ball of yarn in a sunny garden",
    model="sora-2",
    seconds="8",
    size="720x1280"
)

print(f"Video ID: {response.id}")
print(f"Status: {response.status}")

# Download video content when ready
video_bytes = video_content(
    video_id=response.id,
)

# Save to file
with open("generated_video.mp4", "wb") as f:
    f.write(video_bytes)
```

## **LiteLLM Proxy 사용법**

LiteLLM은 전체 비디오 생성 워크플로우를 위해 OpenAI API와 호환되는 비디오 엔드포인트를 제공합니다.

- `/videos/generations` - 새 비디오 생성
- `/videos/remix` - 참조 이미지로 기존 비디오 편집
- `/videos/status` - 비디오 생성 상태 확인
- `/videos/retrieval` - 완료된 비디오 다운로드

**설정**

다음을 litellm proxy `config.yaml`에 추가합니다.

```yaml
model_list:
  - model_name: sora-2
    litellm_params:
      model: openai/sora-2
      api_key: os.environ/OPENAI_API_KEY
```

litellm을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

비디오 생성 요청을 테스트합니다.

```bash
curl --location 'http://localhost:4000/v1/videos' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--data '{
    "model": "sora-2",
    "prompt": "A beautiful sunset over the ocean"
}'
```

비디오 상태 요청을 테스트합니다.

```bash
# Using custom-llm-provider header
curl --location 'http://localhost:4000/v1/videos/video_id' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--header 'custom-llm-provider: openai'
```

비디오 조회 요청을 테스트합니다.

```bash
# Using custom-llm-provider header
curl --location 'http://localhost:4000/v1/videos/video_id/content' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--header 'custom-llm-provider: openai' \
--output video.mp4

# Or using query parameter
curl --location 'http://localhost:4000/v1/videos/video_id/content?custom_llm_provider=openai' \
--header 'Accept: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--output video.mp4
```

비디오 리믹스 요청을 테스트합니다.

```bash
# Using custom_llm_provider in request body
curl --location --request POST 'http://localhost:4000/v1/videos/video_id/remix' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--data '{
    "prompt": "New remix instructions",
    "custom_llm_provider": "openai"
}'

# Or using custom-llm-provider header
curl --location --request POST 'http://localhost:4000/v1/videos/video_id/remix' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'x-litellm-api-key: sk-1234' \
--header 'custom-llm-provider: openai' \
--data '{
    "prompt": "New remix instructions"
}'
```

### 캐릭터, 편집, 확장 라우트

LiteLLM proxy가 지원하는 OpenAI 비디오 라우트:

- `POST /v1/videos/characters`
- `GET /v1/videos/characters/{character_id}`
- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

#### 캐릭터 생성 시 `target_model_names` 지원

`POST /v1/videos/characters`는 모델 기반 라우팅을 위해 `target_model_names`를 지원합니다(비디오 생성과 동일한 동작).

```bash
curl --location 'http://localhost:4000/v1/videos/characters' \
--header 'Authorization: Bearer sk-1234' \
-F 'name=hero' \
-F 'target_model_names=gpt-4' \
-F 'video=@/path/to/character.mp4'
```

`target_model_names`를 사용하면 LiteLLM은 인코딩된 캐릭터 ID를 반환합니다.

```json
{
  "id": "character_...",
  "object": "character",
  "created_at": 1712697600,
  "name": "hero"
}
```

조회 요청에서 해당 인코딩된 ID를 그대로 사용합니다.

```bash
curl --location 'http://localhost:4000/v1/videos/characters/character_...' \
--header 'Authorization: Bearer sk-1234'
```

#### 편집/확장용 인코딩 및 비인코딩 비디오 ID

두 라우트 모두 일반 `video.id`와 인코딩된 `video.id`를 모두 허용합니다.

- `POST /v1/videos/edits`
- `POST /v1/videos/extensions`

```bash
curl --location 'http://localhost:4000/v1/videos/edits' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Make this brighter",
  "video": { "id": "video_..." }
}'
```

```bash
curl --location 'http://localhost:4000/v1/videos/extensions' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "prompt": "Continue this scene",
  "seconds": "4",
  "video": { "id": "video_..." }
}'
```

#### `custom_llm_provider` 입력 소스

이 라우트에서는 다음 방식으로 `custom_llm_provider`를 제공할 수 있습니다.

- 헤더: `custom-llm-provider`
- 쿼리: `?custom_llm_provider=...`
- 본문: `custom_llm_provider`(지원되는 경우 `extra_body.custom_llm_provider` 포함)

OpenAI 비디오 생성 요청을 테스트합니다.

```bash
curl http://localhost:4000/v1/videos \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A cat playing with a ball of yarn in a sunny garden",
    "seconds": "8",
    "size": "720x1280"
  }'
```


## 지원 모델

| 모델 이름 | 설명 | 최대 길이 | 지원 크기 |
|------------|-------------|--------------|-----------------|
| sora-2 | OpenAI의 최신 비디오 생성 모델 | 8초 | 720x1280, 1280x720 |

## 비디오 생성 파라미터

- `prompt` (필수): 원하는 비디오에 대한 텍스트 설명
- `model` (선택 사항): 사용할 모델이며 기본값은 "sora-2"입니다.
- `seconds` (선택 사항): 초 단위 비디오 길이(예: "8", "16")
- `size` (선택 사항): 비디오 크기(예: "720x1280", "1280x720")
- `input_reference` (선택 사항): 비디오 편집에 사용할 참조 이미지
- `user` (선택 사항): 추적용 사용자 식별자

## 비디오 콘텐츠 조회

```python
# Download video content
video_bytes = video_content(
    video_id="video_1234567890"
)

# Save to file
with open("video.mp4", "wb") as f:
    f.write(video_bytes)
```

## 전체 워크플로우

```python
import litellm
import time

def generate_and_download_video(prompt):
    # Step 1: Generate video
    response = litellm.video_generation(
        prompt=prompt,
        model="sora-2",
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


## 참조 이미지를 사용한 비디오 편집

```python
# Video editing with reference image
response = litellm.video_generation(
    prompt="Make the cat jump higher",
    input_reference=open("path/to/image.jpg", "rb"),  # Reference image
    model="sora-2",
    seconds="8"
)

print(f"Video ID: {response.id}")
```

## 오류 처리

```python
from litellm.exceptions import BadRequestError, AuthenticationError

try:
    response = video_generation(
        prompt="A cat playing with a ball of yarn"
    )
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except BadRequestError as e:
    print(f"Bad request: {e}")
```
