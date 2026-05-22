import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Fal AI

Fal AI는 FLUX, Stable Diffusion, Imagen 등 최신 이미지 생성 모델에 빠르고 확장 가능한 액세스를 제공합니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Fal AI는 낮은 지연 시간으로 이미지 생성 모델을 대규모로 실행할 수 있는 최적화된 인프라를 제공합니다. |
| LiteLLM의 공급자 라우트 | `fal_ai/` |
| 공급자 문서 | [Fal AI 문서 ↗](https://fal.ai/models) |
| 지원 작업 | [`/images/generations`](#image-generation) |

## 설정 {#setup}

### API 키 {#api-key}

```python showLineNumbers
import os

# Set your Fal AI API key
os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"
```

API 키는 [fal.ai](https://fal.ai/)에서 받을 수 있습니다.

## 지원 모델 {#supported-models}

| 모델 이름 | 설명 | 문서 |
|------------|-------------|---------------|
| `fal_ai/fal-ai/flux-pro/v1.1` | FLUX Pro v1.1 - 속도와 품질의 균형 | [문서 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1) |
| `fal_ai/flux/schnell` | Flux Schnell - `image_size`를 지원하는 낮은 지연 시간 생성 | [문서 ↗](https://fal.ai/models/fal-ai/flux/schnell) |
| `fal_ai/fal-ai/bytedance/seedream/v3/text-to-image` | ByteDance Seedream v3 - `image_size` 제어를 지원하는 텍스트-이미지 변환 | [문서 ↗](https://fal.ai/models/fal-ai/bytedance/seedream/v3/text-to-image) |
| `fal_ai/fal-ai/bytedance/dreamina/v3.1/text-to-image` | ByteDance Dreamina v3.1 - `image_size` 제어를 지원하는 텍스트-이미지 변환 | [문서 ↗](https://fal.ai/models/fal-ai/bytedance/dreamina/v3.1/text-to-image) |
| `fal_ai/fal-ai/flux-pro/v1.1-ultra` | FLUX Pro v1.1 Ultra - 고품질 이미지 생성 | [문서 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra) |
| `fal_ai/fal-ai/imagen4/preview` | Google Imagen 4 - 최고 품질 모델 | [문서 ↗](https://fal.ai/models/fal-ai/imagen4/preview) |
| `fal_ai/fal-ai/recraft/v3/text-to-image` | Recraft v3 - 여러 스타일 옵션 | [문서 ↗](https://fal.ai/models/fal-ai/recraft/v3/text-to-image) |
| `fal_ai/fal-ai/ideogram/v3` | Ideogram v3 - 레터링 우선 크리에이티브 모델(Balanced: $0.06/image) | [문서 ↗](https://fal.ai/models/fal-ai/ideogram/v3) |
| `fal_ai/fal-ai/stable-diffusion-v35-medium` | Stable Diffusion v3.5 Medium | [문서 ↗](https://fal.ai/models/fal-ai/stable-diffusion-v35-medium) |
| `fal_ai/bria/text-to-image/3.2` | Bria 3.2 - 상용 등급 생성 | [문서 ↗](https://fal.ai/models/bria/text-to-image/3.2) |

## 이미지 생성 {#image-generation}

### 사용법 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

```python showLineNumbers title="Basic Image Generation"
import litellm
import os

# Set your API key
os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate an image
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A serene mountain landscape at sunset with vibrant colors"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="imagen4" label="Imagen 4">

```python showLineNumbers title="Google Imagen 4 Generation"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with Imagen 4
response = litellm.image_generation(
    model="fal_ai/fal-ai/imagen4/preview",
    prompt="A vintage 1960s kitchen with flour package on countertop",
    aspect_ratio="16:9",
    num_images=1
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="recraft" label="Recraft v3">

```python showLineNumbers title="Recraft v3 with Style"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with specific style
response = litellm.image_generation(
    model="fal_ai/fal-ai/recraft/v3/text-to-image",
    prompt="A red panda eating bamboo",
    style="realistic_image",
    image_size="landscape_4_3"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="async" label="비동기 사용법">

```python showLineNumbers title="Async Image Generation"
import litellm
import asyncio
import os

async def generate_image():
    os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"
    
    response = await litellm.aimage_generation(
        model="fal_ai/fal-ai/stable-diffusion-v35-medium",
        prompt="A cyberpunk cityscape with neon lights",
        guidance_scale=7.5,
        num_inference_steps=50
    )
    
    print(response.data[0].url)
    return response

asyncio.run(generate_image())
```

</TabItem>

<TabItem value="advanced" label="고급 파라미터">

```python showLineNumbers title="Advanced FLUX Pro Generation"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with advanced parameters
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A majestic dragon soaring over mountains",
    n=2,
    size="1792x1024",  # Maps to aspect_ratio="16:9"
    seed=42,
    safety_tolerance="2",
    enhance_prompt=True
)

for image in response.data:
    print(f"Generated image: {image.url}")
```

</TabItem>
</Tabs>

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 구성 {#1-configure-your-configyaml}

```yaml showLineNumbers title="Fal AI Image Generation Configuration"
model_list:
  - model_name: flux-ultra
    litellm_params:
      model: fal_ai/fal-ai/flux-pro/v1.1-ultra
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation
  
  - model_name: imagen4
    litellm_params:
      model: fal_ai/fal-ai/imagen4/preview
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation
  
  - model_name: stable-diffusion
    litellm_params:
      model: fal_ai/fal-ai/stable-diffusion-v35-medium
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: sk-1234
```

#### 2. LiteLLM Proxy Server 시작 {#2-start-litellm-proxy-server}

```bash showLineNumbers title="Start Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 요청 보내기 {#3-make-requests}

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Generate via Proxy - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-1234"
)

response = client.images.generate(
    model="flux-ultra",
    prompt="A beautiful sunset over the ocean",
    n=1,
    size="1024x1024"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Generate via Proxy - LiteLLM SDK"
import litellm

response = litellm.image_generation(
    model="litellm_proxy/imagen4",
    prompt="A cozy coffee shop interior",
    api_base="http://localhost:4000",
    api_key="sk-1234"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Generate via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "stable-diffusion",
    "prompt": "A serene Japanese garden with cherry blossoms",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
</Tabs>

## 모델별 파라미터 사용 {#using-model-specific-parameters}

LiteLLM은 추가 파라미터를 Fal AI API로 직접 전달합니다. 요청에 모델별 파라미터를 넣으면 해당 값이 Fal AI로 전송됩니다.

```python showLineNumbers title="Pass Model-Specific Parameters"
import litellm

# Any parameters beyond the standard ones are forwarded to Fal AI
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A beautiful sunset",
    # Model-specific Fal AI parameters
    aspect_ratio="16:9",
    safety_tolerance="2",
    enhance_prompt=True,
    seed=42
)
```

각 모델에서 지원하는 전체 파라미터 목록은 다음을 참조하세요.
- [FLUX Pro v1.1-ultra 파라미터 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra/api)
- [Imagen 4 파라미터 ↗](https://fal.ai/models/fal-ai/imagen4/preview/api)
- [Recraft v3 파라미터 ↗](https://fal.ai/models/fal-ai/recraft/v3/text-to-image/api)
- [Stable Diffusion v3.5 파라미터 ↗](https://fal.ai/models/fal-ai/stable-diffusion-v35-medium/api)
- [Bria 3.2 파라미터 ↗](https://fal.ai/models/bria/text-to-image/3.2/api)

## 지원 파라미터

모든 모델에서 동작하는 표준 OpenAI 호환 파라미터:

| 파라미터 | 유형 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `prompt` | string | 원하는 이미지의 텍스트 설명 | 필수 |
| `model` | string | 사용할 Fal AI 모델 | 필수 |
| `n` | integer | 생성할 이미지 수(1-4) | `1` |
| `size` | string | 이미지 크기(모델별 형식으로 매핑됨) | 모델 기본값 |
| `api_key` | string | Fal AI API 키 | 환경 변수 |

## 시작하기

1. [fal.ai](https://fal.ai/)에 가입합니다.
2. 계정 설정에서 API 키를 가져옵니다.
3. `FAL_AI_API_KEY` 환경 변수를 설정합니다.
4. [Fal AI 모델 갤러리](https://fal.ai/models)에서 모델을 선택합니다.
5. LiteLLM으로 이미지 생성을 시작합니다.

## 추가 자료 {#additional-resources}

- [Fal AI 문서](https://fal.ai/docs)
- [모델 갤러리](https://fal.ai/models)
- [API 참조](https://fal.ai/docs/api-reference)
- [가격](https://fal.ai/pricing)
