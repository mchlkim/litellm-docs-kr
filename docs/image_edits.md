import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /images/edits

LiteLLM은 OpenAI의 `/images/edits` API endpoint에 매핑되는 image editing 기능을 제공합니다. 이제 단일 이미지와 다중 이미지 편집을 모두 지원합니다.

| 기능 | 지원 여부 | 참고 |
|---------|-----------|--------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 동작 |
| Logging | ✅ | 모든 integration에서 동작 |
| 최종 사용자 추적 | ✅ | |
| Fallbacks | ✅ | 지원되는 모델 간 동작 |
| Load balancing | ✅ | 지원되는 모델 간 동작 |
| 지원 작업 | Image edit 생성 | 단일 및 다중 이미지 지원 |
| 지원 LiteLLM SDK version | 1.63.8+ | Gemini 지원에는 1.79.3+ 필요 |
| 지원 LiteLLM Proxy version | 1.71.1+ | Gemini 지원에는 1.79.3+ 필요 |
| 지원 LLM provider | **OpenAI**, **Gemini (Google AI Studio)**, **Vertex AI**, **OpenRouter**, **Stability AI**, **AWS Bedrock (Stability)**, **Black Forest Labs** | Gemini는 새 `gemini-2.5-flash-image` family를 지원합니다. Vertex AI는 Gemini와 Imagen 모델을 모두 지원합니다. OpenRouter는 chat completions를 통해 image edit를 route합니다. Stability AI와 Bedrock Stability는 다양한 image editing 작업을 지원합니다. Black Forest Labs는 FLUX Kontext 모델을 지원합니다. |

 #### ⚡️지원되는 모든 모델과 provider는 [models.litellm.ai](https://models.litellm.ai/)에서 확인하세요.


## 사용법

### LiteLLM Python SDK

<Tabs>
<TabItem value="openai" label="OpenAI">

#### 기본 Image Edit
```python showLineNumbers title="OpenAI Image Edit"
import litellm

# Edit an image with a prompt
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
    n=1,
    size="1024x1024"
)

print(response)
```

#### 다중 이미지 Edit
```python showLineNumbers title="OpenAI Multiple Images Edit"
import litellm

# Edit multiple images with a prompt
response = litellm.image_edit(
    model="gpt-image-1",
    image=[
        open("image1.png", "rb"),
        open("image2.png", "rb"),
        open("image3.png", "rb")
    ],
    prompt="Apply vintage filter to all images",
    n=1,
    size="1024x1024"
)

print(response)
```

#### Mask를 사용한 Image Edit
```python showLineNumbers title="OpenAI Image Edit with Mask"
import litellm

# Edit an image with a mask to specify the area to edit
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),  # Transparent areas will be edited
    prompt="Replace the background with a beach scene",
    n=2,
    size="512x512",
    response_format="url"
)

print(response)
```

#### Async Image Edit
```python showLineNumbers title="Async OpenAI Image Edit"
import litellm
import asyncio

async def edit_image():
    response = await litellm.aimage_edit(
        model="gpt-image-1",
        image=open("original_image.png", "rb"),
        prompt="Make the image look like a painting",
        n=1,
        size="1024x1024",
        response_format="b64_json"
    )
    return response

# Run the async function
response = asyncio.run(edit_image())
print(response)
```

#### Async 다중 이미지 Edit
```python showLineNumbers title="Async OpenAI Multiple Images Edit"
import litellm
import asyncio

async def edit_multiple_images():
    response = await litellm.aimage_edit(
        model="gpt-image-1",
        image=[
            open("portrait1.png", "rb"),
            open("portrait2.png", "rb")
        ],
        prompt="Add professional lighting to the portraits",
        n=1,
        size="1024x1024",
        response_format="url"
    )
    return response

# Run the async function
response = asyncio.run(edit_multiple_images())
print(response)
```

#### Custom Parameter를 사용한 Image Edit
```python showLineNumbers title="OpenAI Image Edit with Custom Parameters"
import litellm

# Edit image with additional parameters
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("portrait.png", "rb"),
    prompt="Add sunglasses and a smile",
    n=3,
    size="1024x1024",
    response_format="url",
    user="user-123",
    timeout=60,
    extra_headers={"Custom-Header": "value"}
)

print(f"Generated {len(response.data)} image variations")
for i, image_data in enumerate(response.data):
    print(f"Image {i+1}: {image_data.url}")
```

</TabItem>

<TabItem value="gemini" label="Gemini">

#### 기본 Image Edit
```python showLineNumbers title="Gemini Image Edit"
import base64
import os
from litellm import image_edit

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = image_edit(
    model="gemini/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Add aurora borealis to the night sky",
    size="1792x1024",  # mapped to aspectRatio=16:9 for Gemini
)

edited_image_bytes = base64.b64decode(response.data[0].b64_json)
with open("edited_image.png", "wb") as f:
    f.write(edited_image_bytes)
```

#### 다중 이미지 Edit
```python showLineNumbers title="Gemini Multiple Images Edit"
import base64
import os
from litellm import image_edit

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = image_edit(
    model="gemini/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene while keeping the subject sharp.",
)

for idx, image_obj in enumerate(response.data):
    with open(f"gemini_edit_{idx}.png", "wb") as f:
        f.write(base64.b64decode(image_obj.b64_json))
```
</TabItem>

<TabItem value="bfl" label="Black Forest Labs">

#### 기본 Image Edit
```python showLineNumbers title="Black Forest Labs Image Edit"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("original_image.png", "rb"),
    prompt="Add a green leaf to the scene",
)

print(response.data[0].url)
```

#### Mask를 사용한 Inpainting
```python showLineNumbers title="Black Forest Labs Inpainting"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

# Use flux-pro-1.0-fill for inpainting
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-fill",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),
    prompt="Replace with a garden",
)

print(response.data[0].url)
```

#### Outpainting(확장)
```python showLineNumbers title="Black Forest Labs Outpainting"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

# Use flux-pro-1.0-expand to extend image borders
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-expand",
    image=open("original_image.png", "rb"),
    prompt="Continue the scene with mountains",
    top=256,
    bottom=256,
)

print(response.data[0].url)
```
</TabItem>

<TabItem value="vertex_ai" label="Vertex AI">

#### 기본 Image Edit(Gemini)
```python showLineNumbers title="Vertex AI Gemini Image Edit"
import os
import litellm

# Set Vertex AI credentials
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service-account.json"

response = litellm.image_edit(
    model="vertex_ai/gemini-2.5-flash",
    image=open("original_image.png", "rb"),
    prompt="Add neon lights in the background",
    size="1024x1024",
)

print(response)
```

#### Imagen Image Edit(Mask 지원)
```python showLineNumbers title="Vertex AI Imagen Image Edit"
import os
import litellm

# Set Vertex AI credentials
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service-account.json"

# Imagen supports mask for inpainting
response = litellm.image_edit(
    model="vertex_ai/imagen-3.0-capability-001",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),  # Optional: for inpainting
    prompt="Turn this into watercolor style scenery",
    n=2,  # Number of variations
    size="1024x1024",
)

print(response)
```
</TabItem>

<TabItem value="openrouter" label="OpenRouter">

#### 기본 Image Edit
```python showLineNumbers title="OpenRouter Image Edit"
import os
from litellm import image_edit

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Add aurora borealis to the night sky",
)

print(response)
```

#### 다중 이미지 Edit
```python showLineNumbers title="OpenRouter Multiple Images Edit"
import os
from litellm import image_edit

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene",
    size="1536x1024",   # mapped to aspect_ratio 3:2
    quality="high",      # mapped to image_size 4K
)

print(response)
```
</TabItem>
</Tabs>

### OpenAI SDK로 LiteLLM Proxy 사용


<Tabs>
<TabItem value="openai" label="OpenAI">

먼저 LiteLLM proxy `config.yaml`에 다음을 추가합니다.
```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: gpt-image-1
    litellm_params:
      model: gpt-image-1
      api_key: os.environ/OPENAI_API_KEY
```

LiteLLM proxy server를 시작합니다.

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### Proxy를 통한 기본 Image Edit
```python showLineNumbers title="OpenAI Proxy Image Edit"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Edit an image
response = client.images.edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
    n=1,
    size="1024x1024"
)

print(response)
```

#### cURL 예제
```bash showLineNumbers title="cURL Image Edit Request"
curl -X POST "http://localhost:4000/v1/images/edits" \
  -H "Authorization: Bearer your-api-key" \
  -F "model=gpt-image-1" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Add a beautiful sunset in the background" \
  -F "n=1" \
  -F "size=1024x1024" \
  -F "response_format=url"
```

#### cURL 다중 이미지 예제
```bash showLineNumbers title="cURL Multiple Images Edit Request"
curl -X POST "http://localhost:4000/v1/images/edits" \
  -H "Authorization: Bearer your-api-key" \
  -F "model=gpt-image-1" \
  -F "image=@image1.png" \
  -F "image=@image2.png" \
  -F "image=@image3.png" \
  -F "prompt=Apply artistic filter to all images" \
  -F "n=1" \
  -F "size=1024x1024" \
  -F "response_format=url"
```

</TabItem>

<TabItem value="gemini" label="Gemini">

1. Gemini image edit 모델을 `config.yaml`에 추가합니다.
```yaml showLineNumbers title="Gemini Proxy Configuration"
model_list:
  - model_name: gemini-image-edit
    litellm_params:
      model: gemini/gemini-2.5-flash-image
      api_key: os.environ/GEMINI_API_KEY
```

2. LiteLLM proxy server를 시작합니다.
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. image edit 요청을 보냅니다(Gemini 응답은 base64만 지원).
```bash showLineNumbers title="Gemini Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=gemini-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Add a warm golden-hour glow to the scene" \
  -F "size=1024x1024"
```

</TabItem>

<TabItem value="bfl" label="Black Forest Labs">

1. Black Forest Labs image edit 모델을 `config.yaml`에 추가합니다.
```yaml showLineNumbers title="Black Forest Labs Proxy Configuration"
model_list:
  - model_name: bfl-kontext-pro
    litellm_params:
      model: black_forest_labs/flux-kontext-pro
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit
```

2. LiteLLM proxy server를 시작합니다.
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. image edit 요청을 보냅니다.
```bash showLineNumbers title="Black Forest Labs Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=bfl-kontext-pro" \
  -F "image=@original_image.png" \
  -F "prompt=Add a sunset in the background"
```

</TabItem>

<TabItem value="vertex_ai" label="Vertex AI">

1. Vertex AI image edit 모델을 `config.yaml`에 추가합니다.
```yaml showLineNumbers title="Vertex AI Proxy Configuration"
model_list:
  - model_name: vertex-gemini-image-edit
    litellm_params:
      model: vertex_ai/gemini-2.5-flash
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/GOOGLE_APPLICATION_CREDENTIALS

  - model_name: vertex-imagen-image-edit
    litellm_params:
      model: vertex_ai/imagen-3.0-capability-001
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/GOOGLE_APPLICATION_CREDENTIALS
```

2. LiteLLM proxy server를 시작합니다.
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. image edit 요청을 보냅니다.
```bash showLineNumbers title="Vertex AI Gemini Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=vertex-gemini-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Add neon lights in the background" \
  -F "size=1024x1024"
```

4. mask를 사용한 Imagen image edit:
```bash showLineNumbers title="Vertex AI Imagen Proxy Image Edit with Mask"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=vertex-imagen-image-edit" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Turn this into watercolor style scenery" \
  -F "n=2" \
  -F "size=1024x1024"
```

</TabItem>

<TabItem value="openrouter" label="OpenRouter">

1. OpenRouter image edit 모델을 `config.yaml`에 추가합니다.
```yaml showLineNumbers title="OpenRouter Proxy Configuration"
model_list:
  - model_name: openrouter-image-edit
    litellm_params:
      model: openrouter/google/gemini-2.5-flash-image
      api_key: os.environ/OPENROUTER_API_KEY
```

2. LiteLLM proxy server를 시작합니다.
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. image edit 요청을 보냅니다.
```bash showLineNumbers title="OpenRouter Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=openrouter-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Make the sky a vibrant purple sunset" \
  -F "size=1024x1024"
```

</TabItem>
</Tabs>

## 지원되는 Image Edit Parameter

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `image` | `FileTypes` | 편집할 이미지입니다. 4MB 미만의 정사각형 유효 PNG 파일이어야 합니다. | ✅ |
| `prompt` | `str` | 원하는 image edit를 설명하는 text입니다. | ✅ |
| `model` | `str` | image editing에 사용할 모델 | 선택 사항(기본값: `dall-e-2`) |
| `mask` | `str` | 완전히 투명한 영역으로 원본 이미지에서 편집할 위치를 나타내는 추가 이미지입니다. 4MB 미만의 유효 PNG 파일이어야 하며 `image`와 같은 크기여야 합니다. | 선택 사항 |
| `n` | `int` | 생성할 이미지 수입니다. 1에서 10 사이여야 합니다. | 선택 사항(기본값: 1) |
| `size` | `str` | 생성된 이미지의 크기입니다. `256x256`, `512x512`, `1024x1024` 중 하나여야 합니다. | 선택 사항(기본값: `1024x1024`) |
| `response_format` | `str` | 생성된 이미지를 반환할 형식입니다. `url` 또는 `b64_json` 중 하나여야 합니다. | 선택 사항(기본값: `url`) |
| `user` | `str` | 최종 사용자를 나타내는 고유 식별자입니다. | 선택 사항 |


## 응답 형식

응답은 OpenAI Images API 형식을 따릅니다.

```python showLineNumbers title="Image Edit Response Structure"
{
    "created": 1677649800,
    "data": [
        {
            "url": "https://example.com/edited_image_1.png"
        },
        {
            "url": "https://example.com/edited_image_2.png"
        }
    ]
}
```

`b64_json` 형식의 경우:
```python showLineNumbers title="Base64 Response Structure"
{
    "created": 1677649800,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ]
}
```
