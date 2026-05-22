import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Black Forest Labs Image Editing 사용

Black Forest Labs는 FLUX 모델을 사용해 텍스트 설명에 따라 기존 이미지를 수정하는 강력한 이미지 편집 기능을 제공합니다.

## 개요

| 속성 | 상세 |
|----------|---------|
| 설명 | Black Forest Labs Image Editing은 FLUX Kontext와 기타 모델을 사용해 텍스트 prompt 기반으로 이미지를 수정, inpaint, 확장합니다. |
| LiteLLM Provider Route 값 | `black_forest_labs/` |
| Provider 문서 | [Black Forest Labs API ↗](https://docs.bfl.ai/) |
| 지원 작업 | [`/images/edits`](#image-editing) |

## 설정

### API 키

```python showLineNumbers
import os

# Set your Black Forest Labs API key
os.environ["BFL_API_KEY"] = "your-api-key-here"
```

[Black Forest Labs](https://blackforestlabs.ai/)에서 API 키를 발급받습니다.

## Supported 모델

| 모델 이름 | 설명 | 사용 사례 |
|------------|-------------|----------|
| `black_forest_labs/flux-kontext-pro` | FLUX Kontext Pro - prompt 기반 일반 이미지 편집 | 일반 편집, 스타일 변환 |
| `black_forest_labs/flux-kontext-max` | FLUX Kontext Max - 프리미엄 품질 편집 | 고품질 편집 |
| `black_forest_labs/flux-pro-1.0-fill` | FLUX Pro Fill - mask 기반 inpainting | 객체 제거/교체 |
| `black_forest_labs/flux-pro-1.0-expand` | FLUX Pro Expand - outpainting | 이미지 테두리 확장 |

## 이미지 편집

### 사용법 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic-edit" label="기본 사용법">

```python showLineNumbers title="Basic Image Editing"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Edit an image with a prompt
response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a green leaf to the scene",
)

# BFL returns URLs
print(response.data[0].url)
```

</TabItem>

<TabItem value="async-edit" label="Async 사용법">

```python showLineNumbers title="Async Image Editing"
import os
import asyncio
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

async def edit_image():
    response = await litellm.aimage_edit(
        model="black_forest_labs/flux-kontext-pro",
        image=open("path/to/your/image.png", "rb"),
        prompt="Make this image look like a watercolor painting",
    )
    print(response.data[0].url)

# Run the async function
asyncio.run(edit_image())
```

</TabItem>

<TabItem value="inpainting" label="Inpainting (Fill)">

```python showLineNumbers title="Inpainting with Mask"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Use flux-pro-1.0-fill for inpainting
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-fill",
    image=open("path/to/your/image.png", "rb"),
    mask=open("path/to/mask.png", "rb"),  # White areas will be edited
    prompt="Replace with a beautiful garden",
    steps=50,  # BFL-specific parameter
    guidance=30,  # BFL-specific parameter
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="outpainting" label="Outpainting (Expand)">

```python showLineNumbers title="Outpainting - Expand Image Borders"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Use flux-pro-1.0-expand to extend image borders
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-expand",
    image=open("path/to/your/image.png", "rb"),
    prompt="Continue the scene with a mountain landscape",
    top=256,     # Expand 256 pixels at top
    bottom=256,  # Expand 256 pixels at bottom
    left=128,    # Expand 128 pixels at left
    right=128,   # Expand 128 pixels at right
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="advanced" label="고급 파라미터">

```python showLineNumbers title="Advanced Image Editing with BFL Parameters"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Edit image with BFL-specific parameters
response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Transform into cyberpunk style with neon lights",
    seed=42,                    # For reproducible results
    output_format="png",        # png or jpeg
    safety_tolerance=2,         # 0-6, higher = more permissive
    aspect_ratio="16:9",        # Output aspect ratio
)

print(response.data[0].url)
```

</TabItem>
</Tabs>

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 구성

```yaml showLineNumbers title="Black Forest Labs Image Editing Configuration"
model_list:
  - model_name: bfl-kontext-pro
    litellm_params:
      model: black_forest_labs/flux-kontext-pro
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-kontext-max
    litellm_params:
      model: black_forest_labs/flux-kontext-max
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-fill
    litellm_params:
      model: black_forest_labs/flux-pro-1.0-fill
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-expand
    litellm_params:
      model: black_forest_labs/flux-pro-1.0-expand
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

general_settings:
  master_key: sk-1234
```

#### 2. LiteLLM Proxy Server 시작

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 이미지 편집 요청 보내기

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Black Forest Labs via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

# Edit image with FLUX Kontext Pro
response = client.images.edit(
    model="bfl-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add magical sparkles and fairy dust",
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Black Forest Labs via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/edits' \
--header 'Authorization: Bearer sk-1234' \
--form 'model="bfl-kontext-pro"' \
--form 'prompt="Add a sunset in the background"' \
--form 'image=@"path/to/your/image.png"'
```

</TabItem>
</Tabs>

## 지원 파라미터

### OpenAI 호환 파라미터

| Parameter | Type | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `image` | file | 편집할 이미지 파일입니다. | 필수 |
| `prompt` | string | 원하는 변경 사항을 설명하는 텍스트입니다. | 필수 |
| `model` | string | 사용할 FLUX 모델입니다. | 필수 |
| `mask` | file | inpainting용 mask 이미지입니다(`flux-pro-1.0-fill`). | 선택 사항 |
| `n` | integer | 이미지 수입니다. BFL은 요청당 1개를 반환합니다. | `1` |
| `size` | string | `aspect_ratio`로 매핑됩니다. | 선택 사항 |
| `response_format` | string | `url` 또는 `b64_json`입니다. | `url` |

### Black Forest Labs 전용 파라미터

| Parameter | Type | 설명 | 기본값 | 모델 |
|-----------|------|-------------|---------|--------|
| `seed` | integer | 재현 가능한 결과를 위한 seed입니다. | Random | All |
| `output_format` | string | 출력 형식입니다: `png` 또는 `jpeg`. | `png` | All |
| `safety_tolerance` | integer | safety filter 허용치입니다(0-6). | 2 | All |
| `aspect_ratio` | string | 출력 aspect ratio입니다. 예: `16:9`, `1:1`. | Original | Kontext models |
| `steps` | integer | inference step 수입니다. | Model default | Fill |
| `guidance` | float | guidance scale입니다. | Model default | Fill |
| `grow_mask` | integer | mask를 확장할 pixel 수입니다. | 0 | Fill |
| `top` | integer | 위쪽으로 확장할 pixel 수입니다. | 0 | Expand |
| `bottom` | integer | 아래쪽으로 확장할 pixel 수입니다. | 0 | Expand |
| `left` | integer | 왼쪽으로 확장할 pixel 수입니다. | 0 | Expand |
| `right` | integer | 오른쪽으로 확장할 pixel 수입니다. | 0 | Expand |

## 동작 방식

Black Forest Labs는 polling 기반 API를 사용합니다.

1. **요청 제출**: LiteLLM이 이미지와 prompt를 BFL로 보냅니다.
2. **Task ID 받기**: BFL이 task ID와 polling URL을 반환합니다.
3. **결과 polling**: LiteLLM이 이미지가 준비될 때까지 자동으로 polling합니다.
4. **결과 반환**: 생성된 이미지 URL이 반환됩니다.

이 polling은 LiteLLM이 자동으로 처리합니다. `image_edit()`만 호출하면 결과를 받을 수 있습니다.

## 시작하기

1. [Black Forest Labs](https://blackforestlabs.ai/)에서 계정을 생성합니다.
2. dashboard에서 API 키를 발급받습니다.
3. `BFL_API_KEY` 환경 변수를 설정합니다.
4. 지원 모델 중 하나로 `litellm.image_edit()`을 사용합니다.

## 추가 리소스

- [Black Forest Labs 문서](https://docs.bfl.ai/)
- [FLUX 모델 정보](https://blackforestlabs.ai/)
