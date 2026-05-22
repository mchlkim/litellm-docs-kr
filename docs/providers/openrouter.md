# OpenRouter
LiteLLM은 [OpenRouter](https://openrouter.ai/docs)의 모든 text / chat / vision / embedding 모델을 지원합니다.

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_OpenRouter.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## 사용법
```python
import os
from litellm import completion

os.environ["OPENROUTER_API_KEY"] = ""
os.environ["OPENROUTER_API_BASE"] = "" # [OPTIONAL] defaults to https://openrouter.ai/api/v1
os.environ["OR_SITE_URL"] = "" # [OPTIONAL]
os.environ["OR_APP_NAME"] = "" # [OPTIONAL]

response = completion(
            model="openrouter/google/palm-2-chat-bison",
            messages=messages,
        )
```

## 환경 변수로 설정

프로덕션 환경에서는 환경 변수를 사용해 `base_url`을 동적으로 구성할 수 있습니다.

```python
import os
from litellm import completion

# Configure with environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")

# Set environment for LiteLLM
os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
os.environ["OPENROUTER_API_BASE"] = OPENROUTER_BASE_URL

response = completion(
    model="openrouter/google/palm-2-chat-bison",
    messages=messages,
    base_url=OPENROUTER_BASE_URL  # Explicitly pass base_url for clarity
)
```

이 방식은 dev, staging, production 같은 여러 환경에서 설정을 더 유연하게 관리하게 해 주며, 자체 호스팅 엔드포인트와 클라우드 엔드포인트를 더 쉽게 전환할 수 있게 합니다.

## OpenRouter Completion 모델
🚨 LiteLLM은 모든 OpenRouter 모델을 지원합니다. OpenRouter로 요청을 보내려면 `model=openrouter/<your-openrouter-model>`을 전달하세요. 전체 OpenRouter 모델은 [여기](https://openrouter.ai/models)에서 확인할 수 있습니다.

| 모델 이름                | 함수 호출                                       | 필수 환경 변수 |
|---------------------------|-----------------------------------------------------|----------------|
| `openrouter/openai/gpt-3.5-turbo` | `completion('openrouter/openai/gpt-3.5-turbo', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/openai/gpt-3.5-turbo-16k` | `completion('openrouter/openai/gpt-3.5-turbo-16k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/openai/gpt-4` | `completion('openrouter/openai/gpt-4', messages)`       | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/openai/gpt-4-32k` | `completion('openrouter/openai/gpt-4-32k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/anthropic/claude-2` | `completion('openrouter/anthropic/claude-2', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/anthropic/claude-instant-v1` | `completion('openrouter/anthropic/claude-instant-v1', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/google/palm-2-chat-bison` | `completion('openrouter/google/palm-2-chat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/google/palm-2-codechat-bison` | `completion('openrouter/google/palm-2-codechat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/meta-llama/llama-2-13b-chat` | `completion('openrouter/meta-llama/llama-2-13b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| `openrouter/meta-llama/llama-2-70b-chat` | `completion('openrouter/meta-llama/llama-2-70b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |

## OpenRouter 파라미터 전달 - transforms, models, route
`transforms`, `models`, `route`를 `litellm.completion()`의 인자로 전달하세요.

```python
import os
from litellm import completion

os.environ["OPENROUTER_API_KEY"] = ""

response = completion(
            model="openrouter/google/palm-2-chat-bison",
            messages=messages,
            transforms = [""],
            route= ""
        )
```

## 임베딩

```python
from litellm import embedding
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = embedding(
    model="openrouter/openai/text-embedding-3-small",
    input=["good morning from litellm", "this is another item"],
)
print(response)
```

## 이미지 생성

OpenRouter는 Google Gemini 이미지 생성 모델 같은 일부 모델을 통해 이미지 생성을 지원합니다. LiteLLM은 표준 이미지 생성 요청을 OpenRouter의 chat completion 형식으로 변환합니다.

### 지원 파라미터

- `size`: OpenRouter의 `aspect_ratio` 형식으로 매핑됩니다.
  - `1024x1024` → `1:1` (정사각형)
  - `1536x1024` → `3:2` (가로)
  - `1024x1536` → `2:3` (세로)
  - `1792x1024` → `16:9` (넓은 가로)
  - `1024x1792` → `9:16` (긴 세로)

- `quality`: OpenRouter의 `image_size` 형식으로 매핑됩니다(Gemini 모델).
  - `low` 또는 `standard` → `1K`
  - `medium` → `2K`
  - `high` 또는 `hd` → `4K`

- `n`: 생성할 이미지 수

### 사용법

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Basic image generation
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 파라미터를 사용하는 고급 사용법

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Generate high-quality landscape image
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A serene mountain landscape with a lake",
    size="1536x1024",  # Landscape format
    quality="high",     # High quality (4K)
)

# Access the generated image
image_data = response.data[0]
if image_data.b64_json:
    # Base64 encoded image
    print(f"Generated base64 image: {image_data.b64_json[:50]}...")
elif image_data.url:
    # Image URL
    print(f"Generated image URL: {image_data.url}")
```

### OpenRouter 전용 파라미터 사용

`image_config`를 사용해 OpenRouter 전용 파라미터를 직접 전달할 수도 있습니다.

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A futuristic cityscape at night",
    image_config={
        "aspect_ratio": "16:9",  # OpenRouter native format
        "image_size": "4K"       # OpenRouter native format
    }
)
print(response)
```

### 응답 형식

응답은 표준 LiteLLM ImageResponse 형식을 따릅니다.

```python
{
    "created": 1703658209,
    "data": [{
        "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",  # Base64 encoded image
        "url": None,
        "revised_prompt": None
    }],
    "usage": {
        "input_tokens": 10,
        "output_tokens": 1290,
        "total_tokens": 1300
    }
}
```

### 비용 추적

OpenRouter는 응답에 비용 정보를 제공하며, LiteLLM은 이를 자동으로 추적합니다.

```python
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A cute baby sea otter",
)

# Cost is available in the response metadata
print(f"Request cost: ${response._hidden_params['additional_headers']['llm_provider-x-litellm-response-cost']}")
```

## 이미지 편집

OpenRouter는 Google Gemini 이미지 모델 같은 일부 모델을 통해 이미지 편집을 지원합니다. LiteLLM은 원본 이미지를 base64 data URL과 `modalities: ["image", "text"]`로 보내면서 image edit 요청을 OpenRouter의 chat completions 엔드포인트로 라우팅합니다.

### 지원 모델

| 모델 | 설명 |
|-------|-------------|
| `openrouter/google/gemini-2.5-flash-image` | 이미지 편집을 지원하는 Gemini 2.5 Flash |

사용 가능한 모든 이미지 모델은 [OpenRouter 모델 목록](https://openrouter.ai/models?modality=image)에서 확인하세요.

### 지원 파라미터

| 파라미터 | OpenRouter 매핑 | 참고 |
|-----------|--------------------|-------|
| `size` | `image_config.aspect_ratio` | `1024x1024` → `1:1`, `1536x1024` → `3:2`, `1024x1536` → `2:3`, `1792x1024` → `16:9`, `1024x1792` → `9:16` |
| `quality` | `image_config.image_size` | `low`/`standard` → `1K`, `medium` → `2K`, `high`/`hd` → `4K` |
| `n` | `n` | 이미지 수 |

:::note
`quality=high` (4K)는 `google/gemini-3-pro-image-preview`와 `google/gemini-3.1-flash-image-preview`에서만 지원됩니다. `google/gemini-2.5-flash-image` 모델은 최대 `medium` (2K)까지 지원합니다.
:::

### 사용법

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Basic image edit
response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Make the sky a vibrant purple sunset",
)

print(response)
```

### 파라미터를 사용하는 고급 사용법

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Edit with size and quality parameters
response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("photo.png", "rb"),
    prompt="Add northern lights to the sky",
    size="1536x1024",   # Maps to aspect_ratio 3:2
    quality="high",      # Maps to image_size 4K
)

# Access the edited image
image_data = response.data[0]
if image_data.b64_json:
    import base64
    with open("edited.png", "wb") as f:
        f.write(base64.b64decode(image_data.b64_json))
```

### 여러 이미지 편집

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene",
)

print(response)
```
