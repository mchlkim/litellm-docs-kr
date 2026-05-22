# Recraft
https://www.recraft.ai/

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Recraft는 스타일과 콘텐츠를 정밀하게 제어하면서 고품질 이미지를 생성하는 AI 기반 디자인 도구입니다. |
| LiteLLM의 제공자 라우트 | `recraft/` |
| 제공자 문서 링크 | [Recraft ↗](https://www.recraft.ai/docs) |
| 지원 작업 | [`/images/generations`](#image-generation), [`/images/edits`](#image-edit) |

LiteLLM은 Recraft 이미지 생성 및 이미지 편집 호출을 지원합니다.

## API Base, Key {#api-base-key}
```python
# env variable
os.environ['RECRAFT_API_KEY'] = "your-api-key"
os.environ['RECRAFT_API_BASE'] = "https://external.api.recraft.ai"  # [optional] 
```

## 이미지 생성 {#image-generation}

### 사용법 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

# recraft image generation call
response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 설정 {#setup-configyaml}

```yaml showLineNumbers
model_list:
  - model_name: recraft-v3
    litellm_params:
      model: recraft/recraftv3
      api_key: os.environ/RECRAFT_API_KEY
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

#### 3. 테스트 {#test-it}

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "recraft-v3",
    "prompt": "A beautiful sunset over a calm ocean",
}'
```

### 고급 사용법 - 추가 파라미터 사용 {#advanced-usage---with-additional-parameters}

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 지원 파라미터

Recraft는 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 유형 | 설명 | 예제 |
|-----------|------|-------------|---------|
| `n` | integer | 생성할 이미지 수(1-4) | `1` |
| `response_format` | string | 응답 형식(`url` 또는 `b64_json`) | `"url"` |
| `size` | string | 이미지 크기 | `"1024x1024"` |
| `style` | string | 이미지 스타일/예술적 방향 | `"realistic"` |

### Non-OpenAI 파라미터 사용 {#using-non-openai-parameters}

OpenAI에서 지원하지 않는 파라미터를 전달하려면 요청 본문에 포함하면 됩니다. LiteLLM이 자동으로 Recraft로 라우팅합니다.

이 예제에서는 Recraft 이미지 생성 호출에 `style_id` 파라미터를 전달합니다.

**LiteLLM Python SDK 사용법**

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
    style_id="your-style-id",
)
```

**LiteLLM Proxy Server + OpenAI Python SDK 사용법**

```python showLineNumbers
from openai import OpenAI
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

client = OpenAI(api_key=os.environ['RECRAFT_API_KEY'])

response = client.images.generate(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
    extra_body={
        "style_id": "your-style-id",
    },
)
print(response)
```

### 지원되는 이미지 생성 모델 {#supported-image-generation-models}

**참고: LiteLLM은 모든 Recraft 모델을 지원합니다.** `recraft/<model_name>` 형식으로 모델 이름만 전달하면 LiteLLM이 Recraft로 라우팅합니다.

| 모델 이름 | 함수 호출 |
|------------|---------------|
| recraftv3 | `image_generation(model="recraft/recraftv3", prompt="...")` |
| recraftv2 | `image_generation(model="recraft/recraftv2", prompt="...")` |

사용 가능한 모델과 기능에 대한 자세한 내용은 https://www.recraft.ai/docs 를 참조하세요.

## 이미지 편집 {#image-edit}

### 사용법 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

# Open the image file
with open("reference_image.png", "rb") as image_file:
    # recraft image edit call
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image that combines all the reference images. Make sure the person looks like a CTO.",
        image=image_file,
    )
print(response)
```

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 설정 {#setup-configyaml-1}

```yaml showLineNumbers
model_list:
  - model_name: recraft-v3
    litellm_params:
      model: recraft/recraftv3
      api_key: os.environ/RECRAFT_API_KEY
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

#### 3. 테스트 {#test-it-1}

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/v1/images/edits' \
--header 'Authorization: Bearer sk-1234' \
--form 'model="recraft-v3"' \
--form 'prompt="Create a studio ghibli style image that combines all the reference images. Make sure the person looks like a CTO."' \
--form 'image=@"reference_image.png"'
```

### 고급 사용법 - 추가 파라미터 사용 {#advanced-usage---with-additional-parameters-1}

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

with open("reference_image.png", "rb") as image_file:
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        n=2,  # Generate 2 variations
        response_format="url",  # Return URLs instead of base64
        style="realistic_image",  # Set artistic style
        strength=0.5  # Control transformation strength (0-1)
    )
print(response)
```

### 지원되는 이미지 편집 파라미터 {#supported-image-edit-parameters}

Recraft는 이미지 편집에 대해 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 유형 | 설명 | 기본값 | 예제 |
|-----------|------|-------------|---------|---------|
| `n` | integer | 생성할 이미지 수(1-4) | `1` | `2` |
| `response_format` | string | 응답 형식(`url` 또는 `b64_json`) | `"url"` | `"b64_json"` |
| `style` | string | 이미지 스타일/예술적 방향 | - | `"realistic_image"` |
| `strength` | float | 이미지를 얼마나 변환할지 제어합니다(0.0-1.0). | `0.2` | `0.5` |

### Non-OpenAI 파라미터 사용 {#using-non-openai-parameters-1}

OpenAI API에 포함되지 않는 Recraft 전용 파라미터는 요청에 포함해 전달할 수 있습니다.

**LiteLLM Python SDK 사용법**

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

with open("reference_image.png", "rb") as image_file:
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        style_id="your-style-id",  # Recraft-specific parameter
        strength=0.7
    )
```

**LiteLLM Proxy Server + OpenAI Python SDK 사용법**

```python showLineNumbers
from openai import OpenAI
import os

client = OpenAI(
    api_key="sk-1234",  # your LiteLLM proxy master key
    base_url="http://0.0.0.0:4000"  # your LiteLLM proxy URL
)

with open("reference_image.png", "rb") as image_file:
    response = client.images.edit(
        model="recraft-v3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        extra_body={
            "style_id": "your-style-id",
            "strength": 0.7
        }
    )
print(response)
```

### 지원되는 이미지 편집 모델 {#supported-image-edit-models}

**참고: LiteLLM은 모든 Recraft 모델을 지원합니다.** `recraft/<model_name>` 형식으로 모델 이름만 전달하면 LiteLLM이 Recraft로 라우팅합니다.

| 모델 이름 | 함수 호출 |
|------------|---------------|
| recraftv3 | `image_edit(model="recraft/recraftv3", ...)` |

## API Key 설정 {#api-key-setup}

[Recraft 웹사이트](https://www.recraft.ai/)에서 API 키를 발급받고 환경 변수로 설정하세요.

```bash
export RECRAFT_API_KEY="your-api-key"
```
