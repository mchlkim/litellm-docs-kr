# Xinference [Xorbits Inference]
https://inference.readthedocs.io/en/latest/index.html

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Xinference는 오픈 소스 LLM, 이미지 생성 모델 등으로 추론을 실행하기 위한 오픈 소스 플랫폼입니다. |
| LiteLLM의 Provider Route | `xinference/` |
| Provider 문서 링크 | [Xinference ↗](https://inference.readthedocs.io/en/latest/index.html) |
| 지원 작업 | [`/embeddings`](#sample-usage---embedding), [`/images/generations`](#image-generation) |

LiteLLM은 Xinference 임베딩 및 이미지 생성 호출을 지원합니다.

## API Base, Key
```python
# env variable
os.environ['XINFERENCE_API_BASE'] = "http://127.0.0.1:9997/v1"
os.environ['XINFERENCE_API_KEY'] = "anything" #[optional] no api key required
```

## 샘플 사용법 - Embedding {#sample-usage---embedding}
```python showLineNumbers
from litellm import embedding
import os

os.environ['XINFERENCE_API_BASE'] = "http://127.0.0.1:9997/v1"
response = embedding(
    model="xinference/bge-base-en",
    input=["good morning from litellm"],
)
print(response)
```

## 샘플 사용법 - `api_base` 파라미터
```python showLineNumbers
from litellm import embedding
import os

response = embedding(
    model="xinference/bge-base-en",
    api_base="http://127.0.0.1:9997/v1",
    input=["good morning from litellm"],
)
print(response)
```

## 이미지 생성 {#image-generation}

### 사용법 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

# xinference image generation call
response = image_generation(
    model="xinference/stabilityai/stable-diffusion-3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    api_base="http://127.0.0.1:9997/v1",
)
print(response)
```

### 사용법 - LiteLLM Proxy Server

#### 1. config.yaml 설정

```yaml showLineNumbers
model_list:
  - model_name: xinference-sd
    litellm_params:
      model: xinference/stabilityai/stable-diffusion-3.5-large
      api_base: http://127.0.0.1:9997/v1
      api_key: anything
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
    "model": "xinference-sd",
    "prompt": "A beautiful sunset over a calm ocean",
    "n": 1,
    "size": "1024x1024",
    "response_format": "url"
}'
```

### 고급 사용법 - 추가 파라미터 사용

```python showLineNumbers
from litellm import image_generation
import os

os.environ['XINFERENCE_API_BASE'] = "http://127.0.0.1:9997/v1"

response = image_generation(
    model="xinference/stabilityai/stable-diffusion-3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    n=1,                           # number of images
    size="1024x1024",             # image size
    response_format="b64_json",   # return format
)
print(response)
```

### 지원되는 이미지 생성 모델

Xinference는 다양한 Stable Diffusion 모델을 지원합니다. 예시는 다음과 같습니다.

| 모델명 | 함수 호출 |
|---------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `stabilityai/stable-diffusion-3.5-large` | `image_generation(model="xinference/stabilityai/stable-diffusion-3.5-large", prompt="...")` |
| `stabilityai/stable-diffusion-xl-base-1.0` | `image_generation(model="xinference/stabilityai/stable-diffusion-xl-base-1.0", prompt="...")` |
| `runwayml/stable-diffusion-v1-5` | `image_generation(model="xinference/runwayml/stable-diffusion-v1-5", prompt="...")` |

지원되는 이미지 생성 모델의 전체 목록은 https://inference.readthedocs.io/en/latest/models/builtin/image/index.html 에서 확인하세요.

## 지원되는 모델
https://inference.readthedocs.io/en/latest/models/builtin/embedding/index.html 에 나열된 모든 모델을 지원합니다.

| 모델명 | 함수 호출 |
|-----------------------------|--------------------------------------------------------------------|
| `bge-base-en` | `embedding(model="xinference/bge-base-en", input)` |
| `bge-base-en-v1.5` | `embedding(model="xinference/bge-base-en-v1.5", input)` |
| `bge-base-zh` | `embedding(model="xinference/bge-base-zh", input)` |
| `bge-base-zh-v1.5` | `embedding(model="xinference/bge-base-zh-v1.5", input)` |
| `bge-large-en` | `embedding(model="xinference/bge-large-en", input)` |
| `bge-large-en-v1.5` | `embedding(model="xinference/bge-large-en-v1.5", input)` |
| `bge-large-zh` | `embedding(model="xinference/bge-large-zh", input)` |
| `bge-large-zh-noinstruct` | `embedding(model="xinference/bge-large-zh-noinstruct", input)` |
| `bge-large-zh-v1.5` | `embedding(model="xinference/bge-large-zh-v1.5", input)` |
| `bge-small-en-v1.5` | `embedding(model="xinference/bge-small-en-v1.5", input)` |
| `bge-small-zh` | `embedding(model="xinference/bge-small-zh", input)` |
| `bge-small-zh-v1.5` | `embedding(model="xinference/bge-small-zh-v1.5", input)` |
| `e5-large-v2` | `embedding(model="xinference/e5-large-v2", input)` |
| `gte-base` | `embedding(model="xinference/gte-base", input)` |
| `gte-large` | `embedding(model="xinference/gte-large", input)` |
| `jina-embeddings-v2-base-en` | `embedding(model="xinference/jina-embeddings-v2-base-en", input)` |
| `jina-embeddings-v2-small-en` | `embedding(model="xinference/jina-embeddings-v2-small-en", input)` |
| `multilingual-e5-large` | `embedding(model="xinference/multilingual-e5-large", input)` |


