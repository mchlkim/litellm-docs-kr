import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google AI Studio로 Veo 비디오 생성 {#veo-video-generation-with-google-ai-studio}

LiteLLM의 pass-through 엔드포인트를 통해 Google의 Veo 모델로 비디오를 생성합니다.

## 빠른 시작

LiteLLM을 사용하면 별도 설정 없이 pass-through 라우트로 Google AI Studio의 Veo 비디오 생성 API를 사용할 수 있습니다.

### 1. 환경에 Google AI Studio API 키 추가 {#1-add-google-ai-studio-api-key-to-your-environment}

```bash
export GEMINI_API_KEY="your_google_ai_studio_api_key"
```

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

### 3. 비디오 생성 {#3-generate-video}

<Tabs>
<TabItem value="python" label="Python">

```python
import requests
import time
import json

# Configuration
BASE_URL = "http://localhost:4000/gemini/v1beta"
API_KEY = "anything"  # Use "anything" as the key

headers = {
    "x-goog-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Step 1: Initiate video generation
def generate_video(prompt):
    url = f"{BASE_URL}/models/veo-3.0-generate-preview:predictLongRunning"
    payload = {
        "instances": [{
            "prompt": prompt
        }]
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    data = response.json()
    return data.get("name")  # Operation name

# Step 2: Poll for completion
def wait_for_completion(operation_name):
    operation_url = f"{BASE_URL}/{operation_name}"
    
    while True:
        response = requests.get(operation_url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("done", False):
            # Extract video URI
            video_uri = data["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
            return video_uri
        
        time.sleep(10)  # Wait 10 seconds before next poll

# Step 3: Download video
def download_video(video_uri, filename="generated_video.mp4"):
    # Replace Google URL with LiteLLM proxy URL
    litellm_url = video_uri.replace(
        "https://generativelanguage.googleapis.com/v1beta", 
        BASE_URL
    )
    
    response = requests.get(litellm_url, headers=headers, stream=True)
    response.raise_for_status()
    
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    
    return filename

# Complete workflow
prompt = "A cat playing with a ball of yarn in a sunny garden"

print("Generating video...")
operation_name = generate_video(prompt)

print("Waiting for completion...")
video_uri = wait_for_completion(operation_name)

print("Downloading video...")
filename = download_video(video_uri)

print(f"Video saved as: {filename}")
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
# Step 1: Initiate video generation
curl -X POST "http://localhost:4000/gemini/v1beta/models/veo-3.0-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: anything" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "A cat playing with a ball of yarn in a sunny garden"
    }]
  }'

# Response will include operation name:
# {"name": "operations/generate_12345"}

# Step 2: Poll for completion
curl -X GET "http://localhost:4000/gemini/v1beta/operations/generate_12345" \
  -H "x-goog-api-key: anything"

# Step 3: Download video (when done=true)
curl -X GET "http://localhost:4000/gemini/v1beta/files/VIDEO_ID:download?alt=media" \
  -H "x-goog-api-key: anything" \
  --output generated_video.mp4
```

</TabItem>
</Tabs>

## 전체 예제 {#complete-예제}

오류 처리와 로깅이 포함된 전체 동작 예제는 [Veo Video Generation Cookbook](https://github.com/BerriAI/litellm/blob/main/cookbook/veo_video_generation.py)을 참고하세요.

## 작동 방식 {#how-it-works}

1. **비디오 생성 요청**: Veo의 `predictLongRunning` 엔드포인트로 프롬프트를 보냅니다.
2. **작업 폴링**: 장기 실행 작업이 완료될 때까지 상태를 확인합니다.
3. **파일 다운로드**: 자동 리디렉션 처리가 적용된 LiteLLM pass-through를 통해 생성된 비디오를 다운로드합니다.

LiteLLM은 다음을 처리합니다.
- ✅ Google AI Studio 인증
- ✅ 요청 라우팅 및 프록시
- ✅ 파일 다운로드를 위한 자동 리디렉션 처리

## 설정 옵션 {#설정-options}

### 환경 변수 {#environment-variables}

```bash
export GEMINI_API_KEY="your_google_ai_studio_api_key"
```
