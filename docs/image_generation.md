
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 이미지 생성

## 개요

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 작동 |
| 로깅 | ✅ | 모든 연동에서 작동 |
| 최종 사용자 추적 | ✅ | |
| 폴백 | ✅ | 지원되는 모델 간 작동 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간 작동 |
| 가드레일 | ✅ | 입력 프롬프트에 적용(비스트리밍만 해당) |
| 지원 프로바이더 | OpenAI, Azure, Google AI Studio, Vertex AI, AWS Bedrock, Black Forest Labs, Recraft, OpenRouter, Xinference, Nscale | |

## 빠른 시작

### `LiteLLM Python SDK`

```python showLineNumbers
from litellm import image_generation
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""

response = image_generation(prompt="A cute baby sea otter", model="dall-e-3")

print(f"response: {response}")
```

### LiteLLM Proxy

### config.yaml 설정

```yaml showLineNumbers
model_list:
  - model_name: gpt-image-1 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.image_generation()
      model: azure/gpt-image-1 ### MODEL NAME sent to `litellm.image_generation()` ###
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU" # does os.getenv("AZURE_API_KEY_EU")

```

### 프록시 시작

```bash showLineNumbers
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 테스트

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-image-1",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python showLineNumbers
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)


image = client.images.generate(
    prompt="A cute baby sea otter",
    model="dall-e-3",
)

print(image)
```
</TabItem>
</Tabs>

## `litellm.image_generation()` 입력 파라미터

:::info

OpenAI가 아닌 파라미터는 프로바이더별 파라미터로 처리되며, 요청 본문에서 `kwargs`로 프로바이더에 전송됩니다.

[**예약 파라미터 보기**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L4082)
:::

### 필수 필드

- `prompt`: *string* - 원하는 이미지에 대한 텍스트 설명입니다.  

### 선택적 LiteLLM 필드

    model: Optional[str] = None,
    n: Optional[int] = None,
    quality: Optional[str] = None,
    response_format: Optional[str] = None,
    size: Optional[str] = None,
    style: Optional[str] = None,
    user: Optional[str] = None,
    timeout=600,  # 기본값은 10분
    api_key: Optional[str] = None,
    api_base: Optional[str] = None,
    api_version: Optional[str] = None,
    litellm_logging_obj=None,
    custom_llm_provider=None,

- `model`: *string (optional)* 이미지 생성에 사용할 모델입니다. 기본값은 `openai/gpt-image-1`입니다.

- `n`: *int (optional)* 생성할 이미지 수입니다. 1부터 10 사이여야 합니다. `dall-e-3`에서는 `n=1`만 지원됩니다.

- `quality`: *string (optional)* 생성될 이미지의 품질입니다.
  *   `auto`(기본값)는 지정된 모델에 가장 적합한 품질을 자동으로 선택합니다.
  *   `gpt-image-1`에서는 `high`, `medium`, `low`가 지원됩니다.
  *   `dall-e-3`에서는 `hd`와 `standard`가 지원됩니다.
  *   `dall-e-2`에서는 `standard`만 사용할 수 있습니다.
  
- `response_format`: *string (optional)* 생성된 이미지가 반환되는 형식입니다. `url` 또는 `b64_json` 중 하나여야 합니다.

- `size`: *string (optional)* 생성된 이미지의 크기입니다. `gpt-image-1`에서는 `1024x1024`, `1536x1024`(가로), `1024x1536`(세로), 또는 `auto`(기본값) 중 하나여야 하고, `dall-e-2`에서는 `256x256`, `512x512`, `1024x1024` 중 하나여야 하며, `dall-e-3`에서는 `1024x1024`, `1792x1024`, `1024x1792` 중 하나여야 합니다.

- `timeout`: *integer* - API 응답을 기다릴 최대 시간(초)입니다. 기본값은 600초(10분)입니다.

- `user`: *string (optional)* 최종 사용자를 나타내는 고유 식별자입니다.

- `api_base`: *string (optional)* - 모델 호출에 사용할 API 엔드포인트입니다.

- `api_version`: *string (optional)* - (Azure 전용) 호출에 사용할 API 버전입니다. Azure에서 `dall-e-3`를 사용할 때 필요합니다.

- `api_key`: *string (optional)* - 요청 인증 및 권한 부여에 사용할 API 키입니다. 제공하지 않으면 기본 API 키가 사용됩니다.

- `api_type`: *string (optional)* - 사용할 API 유형입니다.

### `litellm.image_generation()` 출력

```json

{
    "created": 1703658209,
    "data": [{
        'b64_json': None, 
        'revised_prompt': 'Adorable baby sea otter with a coat of thick brown fur, playfully swimming in blue ocean waters. Its curious, bright eyes gleam as it is surfaced above water, tiny paws held close to its chest, as it playfully spins in the gentle waves under the soft rays of a setting sun.', 
        'url': 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-ikDc4ex8NB5ZzfTf8m5WYVB7/user-JpwZsbIXubBZvan3Y3GchiiB/img-dpa3g5LmkTrotY6M93dMYrdE.png?st=2023-12-27T05%3A23%3A29Z&se=2023-12-27T07%3A23%3A29Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-12-26T13%3A22%3A56Z&ske=2023-12-27T13%3A22%3A56Z&sks=b&skv=2021-08-06&sig=hUuQjYLS%2BvtsDdffEAp2gwewjC8b3ilggvkd9hgY6Uw%3D'
    }],
    "usage": {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
}
```

## OpenAI 이미지 생성 모델

### 사용법
```python showLineNumbers
from litellm import image_generation
import os
os.environ['OPENAI_API_KEY'] = ""
response = image_generation(model='gpt-image-1', prompt="cute baby otter")
```

| 모델 이름           | 함수 호출                               | 필수 OS 변수                |
|----------------------|---------------------------------------------|--------------------------------------|
| gpt-image-1 | `image_generation(model='gpt-image-1', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |
| dall-e-3 | `image_generation(model='dall-e-3', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |
| dall-e-2 | `image_generation(model='dall-e-2', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |

## Azure OpenAI 이미지 생성 모델

### API 키
환경 변수로 설정하거나 **`litellm.image_generation()`의 파라미터로 전달**할 수 있습니다.
```python showLineNumbers
import os
os.environ['AZURE_API_KEY'] = 
os.environ['AZURE_API_BASE'] = 
os.environ['AZURE_API_VERSION'] = 
```

### 사용법
```python showLineNumbers
from litellm import embedding
response = embedding(
    model="azure/<your deployment name>",
    prompt="cute baby otter",
    api_key=api_key,
    api_base=api_base,
    api_version=api_version,
)
print(response)
```

| 모델 이름           | 함수 호출                               |
|----------------------|---------------------------------------------|
| gpt-image-1 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |
| dall-e-3 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |
| dall-e-2 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |

## Xinference 이미지 생성 모델

Xinference에서 호스팅되는 Stable Diffusion 모델에 사용합니다.

#### 사용법

LiteLLM에서 Xinference를 사용하는 방법은 [여기](./providers/xinference.md#image-generation)를 참고하세요.

## Recraft 이미지 생성 모델

Recraft의 AI 기반 디자인 및 이미지 생성에 사용합니다.

#### 사용법

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

LiteLLM에서 Recraft를 사용하는 방법은 [여기](./providers/recraft.md#image-generation)를 참고하세요.

## OpenRouter 이미지 생성 모델

OpenRouter를 통해 사용할 수 있는 이미지 생성 모델에 사용합니다(예: Google Gemini 이미지 생성 모델).

#### 사용법

```python showLineNumbers
from litellm import image_generation
import os

os.environ['OPENROUTER_API_KEY'] = "your-api-key"

response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A beautiful sunset over a calm ocean",
    size="1024x1024",
    quality="high",
)
print(response)
```

## OpenAI 호환 이미지 생성 모델
OpenAI 호환 서버의 `/image_generation` 엔드포인트를 호출할 때 사용합니다. 예: https://github.com/xorbitsai/inference

**참고: LiteLLM이 OpenAI로 라우팅해야 함을 알 수 있도록 모델에 `openai/` 접두사를 추가하세요.**

### 사용법
```python showLineNumbers
from litellm import image_generation
response = image_generation(
  model = "openai/<your-llm-name>",     # add `openai/` prefix to model so litellm knows to route to OpenAI
  api_base="http://0.0.0.0:8000/"       # set API Base of your Custom OpenAI Endpoint
  prompt="cute baby otter"
)
```

## Bedrock - `Stable Diffusion`
Bedrock에서 Stable Diffusion을 사용할 때 사용합니다.


### 사용법
```python showLineNumbers
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
            prompt="A cute baby sea otter",
            model="bedrock/stability.stable-diffusion-xl-v0",
        )
print(f"response: {response}")
```

## VertexAI - 이미지 생성 모델

### 사용법 

VertexAI의 이미지 생성 모델에 사용합니다.

```python showLineNumbers
response = litellm.image_generation(
    prompt="An olympic size swimming pool",
    model="vertex_ai/imagegeneration@006",
    vertex_ai_project="adroit-crow-413218",
    vertex_ai_location="us-central1",
)
print(f"response: {response}")
```

## 지원 프로바이더

#### ⚡️지원되는 모든 모델과 프로바이더는 [models.litellm.ai](https://models.litellm.ai/)에서 확인하세요.

| 프로바이더 | 문서 링크 |
|----------|-------------------|
| OpenAI | [OpenAI 이미지 생성 →](./providers/openai) |
| Azure OpenAI | [Azure OpenAI 이미지 생성 →](./providers/azure/azure) |
| Google AI Studio | [Google AI Studio 이미지 생성 →](./providers/google_ai_studio/image_gen) |
| Vertex AI | [Vertex AI 이미지 생성 →](./providers/vertex_image) |
| AWS Bedrock | [Bedrock 이미지 생성 →](./providers/bedrock) |
| Recraft | [Recraft 이미지 생성 →](./providers/recraft#image-generation) |
| OpenRouter | [OpenRouter 이미지 생성 →](./providers/openrouter#image-generation) |
| Xinference | [Xinference 이미지 생성 →](./providers/xinference#image-generation) |
| Nscale | [Nscale 이미지 생성 →](./providers/nscale#image-generation) | 
