import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Black Forest Labs 이미지 생성

Black Forest Labs는 FLUX 모델을 사용해 최신 텍스트-이미지 생성을 제공합니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | 고품질 텍스트-이미지 생성을 위한 Black Forest Labs FLUX 모델 |
| LiteLLM의 Provider Route | `black_forest_labs/` |
| Provider 문서 | [Black Forest Labs API ↗](https://docs.bfl.ai/) |
| 지원 작업 | [`/images/generations`](#image-generation) |

## 설정

### API 키

```python showLineNumbers
import os

# Set your Black Forest Labs API key
os.environ["BFL_API_KEY"] = "your-api-key-here"
```

[Black Forest Labs](https://blackforestlabs.ai/)에서 API 키를 가져오세요.

## Supported 모델

| 모델 이름 | 설명 | 가격 |
|------------|-------------|-------|
| `black_forest_labs/flux-pro-1.1` | 빠르고 안정적인 표준 생성 | $0.04/image |
| `black_forest_labs/flux-pro-1.1-ultra` | 초고해상도(최대 4MP) | $0.06/image |
| `black_forest_labs/flux-dev` | 개발/오픈 소스 변형 | $0.025/image |
| `black_forest_labs/flux-pro` | 원본 pro 모델 | $0.05/image |

## 이미지 생성

### 사용법 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

```python showLineNumbers title="Basic Image Generation"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate an image
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A beautiful sunset over the ocean with sailing boats",
)

# BFL returns URLs
print(response.data[0].url)
```

</TabItem>

<TabItem value="async" label="Async 사용법">

```python showLineNumbers title="Async Image Generation"
import os
import asyncio
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

async def generate_image():
    response = await litellm.aimage_generation(
        model="black_forest_labs/flux-pro-1.1",
        prompt="A futuristic city skyline at night",
    )
    print(response.data[0].url)

# Run the async function
asyncio.run(generate_image())
```

</TabItem>

<TabItem value="size" label="사용자 지정 크기">

```python showLineNumbers title="Image Generation with Custom Size"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate with specific dimensions
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A majestic mountain landscape",
    size="1792x1024",  # Maps to width/height
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="ultra" label="초고해상도">

```python showLineNumbers title="Ultra High Resolution with flux-pro-1.1-ultra"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate ultra high-resolution image
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1-ultra",
    prompt="Detailed portrait of a fantasy character",
    size="2048x2048",    # Up to 4MP supported
    quality="hd",        # Maps to raw=True for natural look
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="advanced" label="고급 파라미터">

```python showLineNumbers title="Advanced Image Generation with BFL Parameters"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate with BFL-specific parameters
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A cute orange cat sitting on a windowsill",
    seed=42,                    # For reproducible results
    output_format="png",        # png or jpeg
    safety_tolerance=2,         # 0-6, higher = more permissive
    prompt_upsampling=True,     # Enhance prompt for better results
)

print(response.data[0].url)
```

</TabItem>
</Tabs>

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 구성

```yaml showLineNumbers title="Black Forest Labs Image Generation Configuration"
model_list:
  - model_name: flux-pro
    litellm_params:
      model: black_forest_labs/flux-pro-1.1
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

  - model_name: flux-ultra
    litellm_params:
      model: black_forest_labs/flux-pro-1.1-ultra
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

  - model_name: flux-dev
    litellm_params:
      model: black_forest_labs/flux-dev
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: sk-1234
```

#### 2. LiteLLM Proxy Server 시작

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 이미지 생성 요청 보내기

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Black Forest Labs via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

# Generate image with FLUX Pro
response = client.images.generate(
    model="flux-pro",
    prompt="A beautiful garden with colorful flowers",
    size="1024x1024",
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Black Forest Labs via Proxy - cURL"
curl -X POST 'http://localhost:4000/v1/images/generations' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "flux-pro",
    "prompt": "A beautiful garden with colorful flowers",
    "size": "1024x1024"
  }'
```

</TabItem>
</Tabs>

## 지원 파라미터

### OpenAI 호환 파라미터

| 파라미터 | 타입 | 설명 | 매핑 |
|-----------|------|-------------|---------|
| `prompt` | string | 생성할 이미지의 텍스트 설명 | 직접 전달 |
| `model` | string | 사용할 FLUX 모델 | 직접 전달 |
| `size` | string | 이미지 크기(예: `1024x1024`) | `width` 및 `height`로 매핑 |
| `n` | integer | 이미지 수(ultra 모델만 해당, 최대 4개) | `num_images`로 매핑 |
| `quality` | string | 자연스러운 느낌에는 `hd` 사용 | ultra에서는 `raw=True`로 매핑 |
| `response_format` | string | `url` 또는 `b64_json` | 직접 전달 |

### Black Forest Labs 전용 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `width` | integer | 이미지 너비(256-1920, 16의 배수) | 1024 |
| `height` | integer | 이미지 높이(256-1920, 16의 배수) | 1024 |
| `aspect_ratio` | string | width/height 대신 사용할 비율(예: `16:9`, `1:1`) | - |
| `seed` | integer | 재현 가능한 결과를 위한 시드 | 랜덤 |
| `output_format` | string | 출력 형식: `png` 또는 `jpeg` | `png` |
| `safety_tolerance` | integer | 안전 필터 허용치(0-6, 높을수록 더 허용적) | 2 |
| `prompt_upsampling` | boolean | 더 나은 결과를 위해 프롬프트 개선 | `false` |

### Ultra 모델 전용 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `raw` | boolean | 더 자연스럽고 덜 합성된 느낌을 위한 raw 모드 | `false` |
| `num_images` | integer | 생성할 이미지 수(1-4) | 1 |

## 작동 방식

Black Forest Labs는 폴링 기반 API를 사용합니다.

1. **요청 제출**: LiteLLM이 프롬프트를 BFL로 전송합니다.
2. **작업 ID 가져오기**: BFL이 작업 ID와 폴링 URL을 반환합니다.
3. **결과 폴링**: 이미지가 준비될 때까지 LiteLLM이 자동으로 폴링합니다.
4. **결과 반환**: 생성된 이미지 URL이 반환됩니다.

이 폴링은 LiteLLM이 자동으로 처리하므로 `image_generation()`을 호출하면 결과를 받을 수 있습니다.

## 시작하기

1. [Black Forest Labs](https://blackforestlabs.ai/)에서 계정을 만듭니다.
2. 대시보드에서 API 키를 가져옵니다.
3. `BFL_API_KEY` 환경 변수를 설정합니다.
4. 지원되는 모델 중 하나와 함께 `litellm.image_generation()`을 사용합니다.

## 추가 리소스

- [Black Forest Labs Documentation](https://docs.bfl.ai/)
- [Black Forest Labs Image Editing](./black_forest_labs_img_edit.md) - 기존 이미지 편집용
- [FLUX Model Information](https://blackforestlabs.ai/)
