# Gemini 이미지 생성 마이그레이션 가이드 {#gemini-image-generation-migration-guide}

## 이 변경의 영향 대상 {#who-is-impacted-by-this-change}

`/chat/completions`에서 다음 모델을 사용하는 모든 사용자가 대상입니다.
- `gemini/gemini-2.0-flash-exp-image-generation`
- `vertex_ai/gemini-2.0-flash-exp-image-generation`

## 주요 변경 사항 {#key-change}

:::info
v1.77.0부터 LiteLLM은 단일 이미지를 `response.choices[0].message.image`에 반환하지 않고, 이미지 목록을 `response.choices[0].message.images`에 반환합니다.
:::

Gemini 모델은 이제 chat completions를 통한 이미지 생성을 지원합니다. 이미지는 base64 data URL과 함께 `response.choices[0].message.images`에 반환됩니다.

## 변경 전후 {#before-and-after}

### 변경 전 {#before}
```python
from litellm import completion

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)


base_64_image_data = response.choices[0].message.content
```

### 변경 후 {#after}
```python
from litellm import completion

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)

# Image is now available in the response
image_url = response.choices[0].message.images[0]["image_url"]["url"]  # "data:image/png;base64,..."
```

### 변경 이유 {#why-the-change}

새로운 `gemini-2.5-flash-image-preview` 모델은 텍스트와 이미지 응답을 같은 응답 안에 함께 보냅니다. 이 인터페이스를 사용하면 개발자가 응답의 이미지 또는 텍스트 구성 요소에 명시적으로 접근할 수 있습니다. 이전에는 모델이 생성한 이미지를 찾기 위해 개발자가 메시지 콘텐츠를 직접 검색해야 했습니다.

**`image`에서 `images`로 변경한 이유는 무엇인가요?**
OpenRouter API와 일관성을 맞추고, 가능한 경우 단순하고 널리 알려진 인터페이스를 사용하기 위한 변경입니다.

## 사용법

### Python SDK 사용 {#using-the-python-sdk}

**주요 변경 사항:**
```diff
# Before
-- base_64_image_data = response.choices[0].message.content

# After
++ image_url = response.choices[0].message.images[0]["image_url"]["url"]
```

#### 기본 이미지 생성 {#basic-image-generation}

```python
from litellm import completion
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key"

# Generate an image
response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)

# Access the generated image
print(response.choices[0].message.content)  # Text response (if any)
print(response.choices[0].message.images[0])    # Image data
```

#### 응답 형식

이미지는 `message.images` 필드에 반환됩니다.

```python
{
    "image_url": {
        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "detail": "auto"
    },
    "index": 0,
    "type": "image_url"
}
```

### LiteLLM Proxy 서버 사용 {#using-the-litellm-proxy-server}

**주요 변경 사항:**
```diff
# Before
-- "content": "base64-image-data..."

# After  
++ "images": [{
++   "image_url": {
++     "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
++     "detail": "auto"
++   },
++   "index": 0,
++   "type": "image_url"
++ }]
```

#### 설정 {#setup}

1. **`config.yaml`에서 모델을 설정합니다.**

```yaml
model_list:
  - model_name: gemini-image-gen
    litellm_params:
      model: gemini/gemini-2.0-flash-exp-image-generation
      api_key: os.environ/GEMINI_API_KEY
  - model_name: vertex-image-gen  
    litellm_params:
      model: vertex_ai/gemini-2.5-flash-image-preview
      vertex_project: your-project-id
      vertex_location: us-central1

general_settings:
  master_key: sk-1234  # Your proxy API key
```

2. **프록시 서버를 시작합니다.**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 요청 보내기 {#making-requests}

**OpenAI SDK 사용:**

```python
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-1234",  # Your proxy API key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gemini-image-gen",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    extra_body={"modalities": ["image", "text"]}
)

# Access the generated image
print(response.choices[0].message.content)  # Text response (if any)
print(response.choices[0].message.image)    # Image data
```

**curl 사용:**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gemini-image-gen",
  "messages": [
    {
      "role": "user",
      "content": "Generate an image of a cat"
    }
  ],
  "modalities": ["image", "text"]
}'
```

**프록시 응답 형식:**

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1704089632,
  "model": "gemini-image-gen",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's an image of a cat for you!",
        "images": [{
          "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
          "detail": "auto"
        }
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```
