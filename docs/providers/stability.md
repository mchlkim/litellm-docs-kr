# Stability AI
https://stability.ai/

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Stability AI는 이미지, 비디오, 오디오, 3D 생성을 위한 오픈 AI 모델을 제공합니다. Stable Diffusion으로 잘 알려져 있습니다. |
| LiteLLM 제공자 라우트 | `stability/` |
| Provider 문서 링크 | [Stability AI API ↗](https://platform.stability.ai/docs/api-reference) |
| 지원 작업 | [`/images/generations`](#image-generation), [`/images/edits`](#image-editing) |

LiteLLM은 Stability AI REST API를 통해 Stability AI 이미지 생성 호출을 지원합니다(Bedrock 경유 아님).

## API 키

```python
# env variable
os.environ['STABILITY_API_KEY'] = "your-api-key"
```

[Stability AI Platform](https://platform.stability.ai/)에서 API key를 발급받으세요.

## 이미지 생성 {#image-generation}

### 사용법 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Stability AI image generation call
response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 설정

```yaml showLineNumbers
model_list:
  - model_name: sd3
    litellm_params:
      model: stability/sd3.5-large
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: sk-1234
```

#### 2. 프록시 시작

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 테스트

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "sd3",
    "prompt": "A beautiful sunset over a calm ocean"
}'
```

### 고급 사용법 - 추가 파라미터 사용

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    size="1792x1024",  # Maps to aspect_ratio 16:9
    negative_prompt="blurry, low quality",  # Stability-specific
    seed=12345,  # For reproducibility
)
print(response)
```

### 지원 파라미터

Stability AI는 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 | 예제 |
|-----------|------|-------------|---------|
| `size` | string | 이미지 크기(`aspect_ratio`로 매핑) | `"1024x1024"` |
| `n` | integer | 이미지 수(참고: Stability는 요청당 1개 반환) | `1` |
| `response_format` | string | 응답 형식(Stability는 `b64_json`만 지원) | `"b64_json"` |

### Size와 Aspect Ratio 매핑 {#size-and-aspect-ratio-mapping}

`size` 파라미터는 Stability의 `aspect_ratio`로 자동 매핑됩니다.

| OpenAI size | Stability 비율 |
|-------------|----------------------|
| `1024x1024` | `1:1` |
| `1792x1024` | `16:9` |
| `1024x1792` | `9:16` |
| `512x512` | `1:1` |
| `256x256` | `1:1` |

### Stability 전용 파라미터 사용

Stability AI 전용 파라미터를 요청에 직접 전달할 수 있습니다.

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    # Stability-specific parameters
    negative_prompt="blurry, watermark, text",
    aspect_ratio="16:9",  # Use directly instead of size
    seed=42,
    output_format="png",  # png, jpeg, or webp
)
print(response)
```

### 지원되는 이미지 생성 모델 {#supported-image-generation-models}

| 모델명 | 함수 호출 | 설명 |
|------------|---------------|-------------|
| `sd3` | `image_generation(model="stability/sd3", ...)` | `Stable Diffusion 3` |
| `sd3-large` | `image_generation(model="stability/sd3-large", ...)` | `SD3 Large` |
| `sd3-large-turbo` | `image_generation(model="stability/sd3-large-turbo", ...)` | `SD3 Large Turbo`(더 빠름) |
| `sd3-medium` | `image_generation(model="stability/sd3-medium", ...)` | `SD3 Medium` |
| `sd3.5-large` | `image_generation(model="stability/sd3.5-large", ...)` | `SD 3.5 Large`(권장) |
| `sd3.5-large-turbo` | `image_generation(model="stability/sd3.5-large-turbo", ...)` | `SD 3.5 Large Turbo` |
| `sd3.5-medium` | `image_generation(model="stability/sd3.5-medium", ...)` | `SD 3.5 Medium` |
| `stable-image-ultra` | `image_generation(model="stability/stable-image-ultra", ...)` | `Stable Image Ultra` |
| `stable-image-core` | `image_generation(model="stability/stable-image-core", ...)` | `Stable Image Core` |

사용 가능한 모델과 기능에 대한 자세한 내용은 https://platform.stability.ai/docs/api-reference 를 참고하세요.

## 응답 형식

Stability AI는 이미지를 base64 형식으로 반환합니다. 응답은 OpenAI 호환 형식입니다.

```python
{
    "created": 1234567890,
    "data": [
        {
            "b64_json": "iVBORw0KGgo..."  # Base64 encoded image
        }
    ]
}
```

## 이미지 편집 {#image-editing}

Stability AI는 인페인팅, 업스케일링, 아웃페인팅, 배경 제거 등 다양한 이미지 편집 작업을 지원합니다.

:::info 선택적 파라미터
**중요:** Stability 모델마다 파라미터 요구사항이 다릅니다.
- 일부 모델은 `prompt`가 필요하지 않습니다(예: 업스케일링, 배경 제거).
- `style-transfer` 모델은 `image` 대신 `init_image`와 `style_image`를 사용합니다.
- `outpaint` 모델은 숫자 파라미터(`left`, `right`, `up`, `down`)가 필요합니다.
LiteLLM은 이러한 차이를 자동으로 처리합니다.
:::

### 사용법 - LiteLLM Python SDK

#### Inpainting(mask로 편집) {#inpainting-edit-with-mask}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Inpainting - edit specific areas using a mask
response = image_edit(
    model="stability/stable-image-inpaint-v1:0",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"), 
    prompt="Add a beautiful sunset in the masked area",
    size="1024x1024",
)
print(response)
```

#### 이미지 업스케일링 {#image-upscaling}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Conservative upscaling - preserves details
response = image_edit(
    model="stability/stable-conservative-upscale-v1:0",
    image=open("low_res_image.png", "rb"),
    prompt="Upscale this image while preserving details",
)

# Creative upscaling - adds creative details
response = image_edit(
    model="stability/stable-creative-upscale-v1:0",
    image=open("low_res_image.png", "rb"),
    prompt="Upscale and enhance with creative details",
    creativity=0.3,  # 0-0.35, higher = more creative
)

# Fast upscaling - quick upscaling (no prompt needed)
response = image_edit(
    model="stability/stable-fast-upscale-v1:0",
    image=open("low_res_image.png", "rb"),
    # No prompt required for fast upscale
)
print(response)
```

#### 이미지 아웃페인팅 {#image-outpainting}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Extend image beyond its borders
response = image_edit(
    model="stability/stable-outpaint-v1:0",
    image=open("original_image.png", "rb"),
    prompt="Extend this landscape with mountains",
    left=100,   # Pixels to extend on the left
    right=100,  # Pixels to extend on the right
    up=50,      # Pixels to extend on top
    down=50,    # Pixels to extend on bottom
)
print(response)
```

#### 배경 제거 {#background-removal}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Remove background from image
response = image_edit(
    model="stability/stable-image-remove-background-v1:0",
    image=open("portrait.png", "rb"),
    # No prompt required for fast upscale
)
print(response)
```

#### 검색 및 교체 {#search-and-replace}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Search and replace objects in image
response = image_edit(
    model="stability/stable-image-search-replace-v1:0",
    image=open("scene.png", "rb"),
    prompt="A red sports car",
    search_prompt="blue sedan",  # What to replace
)

# Search and recolor
response = image_edit(
    model="stability/stable-image-search-recolor-v1:0",
    image=open("scene.png", "rb"),
    prompt="Make it golden yellow",
    select_prompt="the car",  # What to recolor
)
print(response)
```

#### 이미지 제어(스케치/구조) {#image-control-sketchstructure}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Control with sketch
response = image_edit(
    model="stability/stable-image-control-sketch-v1:0",
    image=open("sketch.png", "rb"),
    prompt="Turn this sketch into a realistic photo",
    control_strength=0.7,  # 0-1, higher = more control
)

# Control with structure
response = image_edit(
    model="stability/stable-image-control-structure-v1:0",
    image=open("structure_reference.png", "rb"),
    prompt="Generate image following this structure",
    control_strength=0.7,
)
print(response)
```

#### 객체 지우기 {#object-erase}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Erase objects from image
response = image_edit(
    model="stability/stable-image-erase-object-v1:0",
    image=open("scene.png", "rb"),
    mask=open("object_mask.png", "rb"),  # Mask the object to erase
    # No prompt needed
)
print(response)
```
#### Style Transfer {#style-transfer}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Transfer style from one image to another
# Note: Uses init_image (via image param) and style_image
response = image_edit(
    model="stability/stable-style-transfer-v1:0",
    image=open("content_image.png", "rb"),  # Maps to init_image
    style_image=open("style_reference.png", "rb"),  # Style to apply
    fidelity=0.5,  # 0-1, balance between content and style
    # No prompt needed
)

print(response)
```

### 지원되는 이미지 편집 모델 {#supported-image-edit-models}

| 모델명 | 함수 호출 | 설명 |
|------------|---------------|-------------|
| `stable-image-inpaint-v1:0` | `image_edit(model="stability/stable-image-inpaint-v1:0", ...)` | mask를 사용한 인페인팅 |
| `stable-conservative-upscale-v1:0` | `image_edit(model="stability/stable-conservative-upscale-v1:0", ...)` | 보수적 업스케일링 |
| `stable-creative-upscale-v1:0` | `image_edit(model="stability/stable-creative-upscale-v1:0", ...)` | 창의적 업스케일링 |
| `stable-fast-upscale-v1:0` | `image_edit(model="stability/stable-fast-upscale-v1:0", ...)` | 빠른 업스케일링 |
| `stable-outpaint-v1:0` | `image_edit(model="stability/stable-outpaint-v1:0", ...)` | 이미지 경계 확장 |
| `stable-image-remove-background-v1:0` | `image_edit(model="stability/stable-image-remove-background-v1:0", ...)` | 배경 제거 |
| `stable-image-search-replace-v1:0` | `image_edit(model="stability/stable-image-search-replace-v1:0", ...)` | 객체 검색 및 교체 |
| `stable-image-search-recolor-v1:0` | `image_edit(model="stability/stable-image-search-recolor-v1:0", ...)` | 검색 및 재색상화 |
| `stable-image-control-sketch-v1:0` | `image_edit(model="stability/stable-image-control-sketch-v1:0", ...)` | 스케치로 제어 |
| `stable-image-control-structure-v1:0` | `image_edit(model="stability/stable-image-control-structure-v1:0", ...)` | 구조로 제어 |
| `stable-image-erase-object-v1:0` | `image_edit(model="stability/stable-image-erase-object-v1:0", ...)` | 객체 제거 |
| `stable-image-style-guide-v1:0` | `image_edit(model="stability/stable-image-style-guide-v1:0", ...)` | style guide 적용 |
| `stable-style-transfer-v1:0` | `image_edit(model="stability/stable-style-transfer-v1:0", ...)` | style transfer |

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 설정

```yaml showLineNumbers
model_list:
  - model_name: stability-inpaint
    litellm_params:
      model: stability/stable-image-inpaint-v1:0
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_edit

  - model_name: stability-upscale
    litellm_params:
      model: stability/stable-conservative-upscale-v1:0
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_edit

general_settings:
  master_key: sk-1234
```

#### 2. 프록시 시작

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 테스트

```bash showLineNumbers
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer sk-1234" \
  -F "model=stability-inpaint" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Add a beautiful garden in the masked area"
```

## AWS Bedrock(Stability) 지원 {#aws-bedrock-stability}

LiteLLM은 AWS Bedrock을 통한 Stability AI 모델도 지원합니다. 이미 AWS 인프라를 사용 중이라면 유용합니다.

### 사용법 - Bedrock Stability

```python showLineNumbers
from litellm import image_edit
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Bedrock Stability inpainting
response = image_edit(
    model="bedrock/us.stability.stable-image-inpaint-v1:0",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),
    prompt="Add flowers in the masked area",
)
print(response)
```
```python showLineNumbers
# Fast upscale without prompt
response = image_edit(
    model="bedrock/stability.stable-fast-upscale-v1:0",
    image=open("low_res_image.png", "rb"),
)

# Outpaint with numeric parameters
response = image_edit(
    model="bedrock/stability.stable-outpaint-v1:0",
    image=open("original_image.png", "rb"),
    left=100,   # Automatically converted to int
    right=100,
    up=50,
    down=50,
)

print(response)
```

### 지원되는 Bedrock Stability 모델

모든 Stability AI 이미지 편집 모델은 `bedrock/` prefix를 통해 Bedrock에서 사용할 수 있습니다.

| Direct API 모델 | Bedrock 모델 | 설명 |
|------------------|---------------|-------------|
| `stability/stable-image-inpaint-v1:0` | `bedrock/us.stability.stable-image-inpaint-v1:0` | 인페인팅 |
| `stability/stable-conservative-upscale-v1:0` | `bedrock/stability.stable-conservative-upscale-v1:0` | 보수적 업스케일링 |
| `stability/stable-creative-upscale-v1:0` | `bedrock/stability.stable-creative-upscale-v1:0` | 창의적 업스케일링 |
| `stability/stable-fast-upscale-v1:0` | `bedrock/stability.stable-fast-upscale-v1:0` | 빠른 업스케일링 |
| `stability/stable-outpaint-v1:0` | `bedrock/stability.stable-outpaint-v1:0` | 아웃페인팅 |
| `stability/stable-image-remove-background-v1:0` | `bedrock/stability.stable-image-remove-background-v1:0` | 배경 제거 |
| `stability/stable-image-search-replace-v1:0` | `bedrock/stability.stable-image-search-replace-v1:0` | 검색 및 교체 |
| `stability/stable-image-search-recolor-v1:0` | `bedrock/stability.stable-image-search-recolor-v1:0` | 검색 및 재색상화 |
| `stability/stable-image-control-sketch-v1:0` | `bedrock/stability.stable-image-control-sketch-v1:0` | 스케치로 제어 |
| `stability/stable-image-control-structure-v1:0` | `bedrock/stability.stable-image-control-structure-v1:0` | 구조로 제어 |
| `stability/stable-image-erase-object-v1:0` | `bedrock/stability.stable-image-erase-object-v1:0` | 객체 제거 |

**참고:** Bedrock 모델 ID는 리전과 모델에 따라 `us.stability.*` 또는 `stability.*` prefix를 사용할 수 있습니다.

## 라우트 비교 {#route-comparison}

LiteLLM은 두 가지 라우트로 Stability AI 모델을 지원합니다.

| 라우트 | Provider | 사용 사례 | Image Generation | Image Editing |
|-------|----------|----------|------------------|---------------|
| `stability/` | Stability AI Direct API | 직접 접근, 최신 모델 전체 | ✅ | ✅ |
| `bedrock/stability.*` | AWS Bedrock | AWS 통합, 엔터프라이즈 기능 | ✅ | ✅ |

직접 API 접근에는 `stability/`를 사용하세요. 이미 AWS Bedrock을 사용 중이면 `bedrock/stability.*`를 사용하세요.
