import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI 이미지 편집

Azure AI는 Black Forest Labs의 FLUX 모델을 사용해 텍스트 설명에 따라 기존 이미지를 수정하는 강력한 이미지 편집 기능을 제공합니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Azure AI 이미지 편집은 FLUX 모델을 사용해 텍스트 프롬프트에 따라 기존 이미지를 수정합니다. |
| LiteLLM의 Provider Route | `azure_ai/` |
| Provider 문서 | [Azure AI FLUX 모델 ↗](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659) |
| 지원 작업 | [`/images/edits`](#image-editing) |

## 설정

### API Key, Base URL, API Version 설정

```python showLineNumbers
# Set your Azure AI API credentials
import os
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://your-endpoint.eastus2.inference.ai.azure.com/
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"  # Example API version
```

[Azure AI Studio](https://ai.azure.com/)에서 API key와 endpoint를 가져오세요.

## 지원 모델

| 모델 이름 | 설명 | 이미지당 비용 |
|------------|-------------|----------------|
| `azure_ai/FLUX.1-Kontext-pro` | 편집을 위한 향상된 컨텍스트 이해 기능을 갖춘 FLUX 1 Kontext Pro 모델 | $0.04 |

## 이미지 편집 {#image-editing}

### 사용법 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic-edit" label="기본 사용법">

```python showLineNumbers title="Basic Image Editing"
import os
import base64
from pathlib import Path

import litellm

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

# Edit an image with a prompt
response = litellm.image_edit(
    model="azure_ai/FLUX.1-Kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a winter theme with snow and cold colors",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version=os.environ["AZURE_AI_API_VERSION"]
)

img_base64 = response.data[0].get("b64_json")
img_bytes = base64.b64decode(img_base64)
path = Path("edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="async-edit" label="비동기 사용법">

```python showLineNumbers title="Async Image Editing"
import os
import base64
from pathlib import Path

import litellm
import asyncio

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

async def edit_image():
    # Edit image asynchronously
    response = await litellm.aimage_edit(
        model="azure_ai/FLUX.1-Kontext-pro",
        image=open("path/to/your/image.png", "rb"),
        prompt="Make this image look like a watercolor painting",
        api_base=os.environ["AZURE_AI_API_BASE"],
        api_key=os.environ["AZURE_AI_API_KEY"],
        api_version=os.environ["AZURE_AI_API_VERSION"]
    )
    img_base64 = response.data[0].get("b64_json")
    img_bytes = base64.b64decode(img_base64)
    path = Path("async_edited_image.png")
    path.write_bytes(img_bytes)

# Run the async function
asyncio.run(edit_image())
```

</TabItem>

<TabItem value="advanced-edit" label="고급 파라미터">

```python showLineNumbers title="Advanced Image Editing with Parameters"
import os
import base64
from pathlib import Path

import litellm

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

# Edit image with additional parameters
response = litellm.image_edit(
    model="azure_ai/FLUX.1-Kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add magical elements like floating crystals and mystical lighting",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version=os.environ["AZURE_AI_API_VERSION"],
    n=1
)
img_base64 = response.data[0].get("b64_json")
img_bytes = base64.b64decode(img_base64)
path = Path("advanced_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>
</Tabs>

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 구성

```yaml showLineNumbers title="Azure AI Image Editing Configuration"
model_list:
  - model_name: azure-flux-kontext-edit
    litellm_params:
      model: azure_ai/FLUX.1-Kontext-pro
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
      api_version: os.environ/AZURE_AI_API_VERSION
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

#### 3. OpenAI Python SDK로 이미지 편집 요청 보내기

<Tabs>
<TabItem value="openai-edit-sdk" label="OpenAI SDK">

```python showLineNumbers title="Azure AI Image Editing via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="sk-1234"                  # Your proxy API key
)

# Edit image with FLUX Kontext Pro
response = client.images.edit(
    model="azure-flux-kontext-edit",
    image=open("path/to/your/image.png", "rb"),
    prompt="Transform this image into a beautiful oil painting style",
)

img_base64 = response.data[0].b64_json
img_bytes = base64.b64decode(img_base64)
path = Path("proxy_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="litellm-edit-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Azure AI Image Editing via Proxy - LiteLLM SDK"
import litellm

# Edit image through proxy
response = litellm.image_edit(
    model="litellm_proxy/azure-flux-kontext-edit",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a mystical forest background with magical creatures",
    api_base="http://localhost:4000",
    api_key="sk-1234"
)

img_base64 = response.data[0].b64_json
img_bytes = base64.b64decode(img_base64)
path = Path("proxy_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="curl-edit" label="cURL">

```bash showLineNumbers title="Azure AI Image Editing via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/edits' \
--header 'Authorization: Bearer sk-1234' \
--form 'model="azure-flux-kontext-edit"' \
--form 'prompt="Convert this image to a vintage sepia tone with old-fashioned effects"' \
--form 'image=@"path/to/your/image.png"'
```

</TabItem>
</Tabs>

## 지원 파라미터

Azure AI 이미지 편집은 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 | 기본값 | 예제 |
|-----------|------|-------------|---------|---------|
| `image` | file | 편집할 이미지 파일 | 필수 | 파일 객체 또는 바이너리 데이터 |
| `prompt` | string | 원하는 변경 사항에 대한 텍스트 설명 | 필수 | `"Add snow and winter elements"` |
| `model` | string | 편집에 사용할 FLUX 모델 | 필수 | `"azure_ai/FLUX.1-Kontext-pro"` |
| `n` | integer | 생성할 편집 이미지 수(1만 지정 가능) | `1` | `1` |
| `api_base` | string | Azure AI endpoint URL | 필수 | `"https://your-endpoint.eastus2.inference.ai.azure.com/"` |
| `api_key` | string | Azure AI API key | 필수 | 환경 변수 또는 직접 값 |
| `api_version` | string | Azure AI의 API version | 필수 | `"2025-04-01-preview"` |

## 시작하기

1. [Azure AI Studio](https://ai.azure.com/)에서 계정을 만듭니다.
2. Azure AI Studio workspace에 FLUX 모델을 배포합니다.
3. 배포 세부 정보에서 API key와 endpoint를 가져옵니다.
4. `AZURE_AI_API_KEY`, `AZURE_AI_API_BASE`, `AZURE_AI_API_VERSION` 환경 변수를 설정합니다.
5. 원본 이미지를 준비합니다.
6. `litellm.image_edit()`을 사용해 텍스트 지침으로 이미지를 수정합니다.

## 추가 리소스

- [Azure AI Studio 문서](https://docs.microsoft.com/en-us/azure/ai-services/)
- [FLUX 모델 발표](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659)
