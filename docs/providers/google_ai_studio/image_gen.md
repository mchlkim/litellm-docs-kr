import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google AI Studio 이미지 생성 {#google-ai-studio-image-generation}

Google AI Studio는 Google의 Imagen 모델을 사용해 텍스트 설명에서 고품질 이미지를 생성하는 강력한 이미지 생성 기능을 제공합니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Google AI Studio Image Generation은 Google의 Imagen 모델을 사용해 텍스트 설명에서 고품질 이미지를 생성합니다. |
| LiteLLM Provider 라우트 | `gemini/` |
| Provider 문서 | [Google AI Studio Image Generation ↗](https://ai.google.dev/gemini-api/docs/imagen) |
| 지원 작업 | [`/images/generations`](#image-generation) |

## 설정 {#setup}

### API 키 {#api-key}

```python showLineNumbers
# Set your Google AI Studio API key
import os
os.environ["GEMINI_API_KEY"] = "your-api-key-here"
```

[Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키를 가져오세요.

## 이미지 생성 {#image-generation}

### 사용법 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="기본 사용법">

```python showLineNumbers title="Basic Image Generation"
import litellm
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key-here"

# Generate a single image
response = litellm.image_generation(
    model="gemini/imagen-4.0-generate-001",
    prompt="A cute baby sea otter swimming in crystal clear water"
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
    # Set your API key
    os.environ["GEMINI_API_KEY"] = "your-api-key-here"
    
    # Generate image asynchronously
    response = await litellm.aimage_generation(
        model="gemini/imagen-4.0-generate-001",
        prompt="A beautiful sunset over mountains with vibrant colors",
        n=1,
    )
    
    print(response.data[0].url)
    return response

# Run the async function
asyncio.run(generate_image())
```

</TabItem>

<TabItem value="advanced" label="고급 파라미터">

```python showLineNumbers title="Advanced Image Generation with Parameters"
import litellm
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key-here"

# Generate image with additional parameters
response = litellm.image_generation(
    model="gemini/imagen-4.0-generate-001",
    prompt="A futuristic cityscape at night with neon lights",
    n=1,
    size="1024x1024",
    quality="standard",
    response_format="url"
)

for image in response.data:
    print(f"Generated image URL: {image.url}")
```

</TabItem>
</Tabs>

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 구성 {#1-configure-your-configyaml}

```yaml showLineNumbers title="Google AI Studio Image Generation Configuration"
model_list:
  - model_name: google-imagen
    litellm_params:
      model: gemini/imagen-4.0-generate-001
      api_key: os.environ/GEMINI_API_KEY
  model_info:
    mode: image_generation

general_settings:
  master_key: sk-1234
```

#### 2. LiteLLM Proxy Server 시작 {#2-start-litellm-proxy-server}

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. OpenAI Python SDK로 요청 보내기 {#3-make-requests-with-openai-python-sdk}

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Google AI Studio Image Generation via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="sk-1234"                  # Your proxy API key
)

# Generate image
response = client.images.generate(
    model="google-imagen",
    prompt="A majestic eagle soaring over snow-capped mountains",
    n=1,
    size="1024x1024"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Google AI Studio Image Generation via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.image_generation(
    model="litellm_proxy/google-imagen",
    prompt="A serene Japanese garden with cherry blossoms",
    api_base="http://localhost:4000",
    api_key="sk-1234"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Google AI Studio Image Generation via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "google-imagen",
    "prompt": "A cozy coffee shop interior with warm lighting",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
</Tabs>

## 지원 파라미터

Google AI Studio Image Generation은 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 | 기본값 | 예제 |
|-----------|------|-------------|---------|---------|
| `prompt` | string | 생성할 이미지의 텍스트 설명 | 필수 | `"A sunset over the ocean"` |
| `model` | string | 생성에 사용할 모델 | 필수 | `"gemini/imagen-4.0-generate-001"` |
| `n` | integer | 생성할 이미지 수 (1-4) | `1` | `2` |
| `size` | string | 이미지 크기 | `"1024x1024"` | `"512x512"`, `"1024x1024"` |

1. [Google AI Studio](https://aistudio.google.com/)에서 계정을 만듭니다.
2. [API 키 섹션](https://aistudio.google.com/app/apikey)에서 API 키를 생성합니다.
3. `GEMINI_API_KEY` 환경 변수를 설정합니다.
4. LiteLLM을 사용해 이미지 생성을 시작합니다.

## 추가 리소스 {#additional-resources}

- [Google AI Studio 문서](https://ai.google.dev/gemini-api/docs)
- [Imagen Model 개요](https://ai.google.dev/gemini-api/docs/imagen)
- [LiteLLM Image Generation 가이드](../../completion/image_generation)
