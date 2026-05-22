# Vertex AI 이미지 생성 {#vertex-ai-image-generation}

Vertex AI는 두 가지 유형의 이미지 생성을 지원합니다.

1. **Gemini Image Generation 모델** (Nano Banana 🍌) - `generateContent` API를 사용하는 대화형 이미지 생성
2. **Imagen 모델** - `predict` API를 사용하는 기존 방식의 이미지 생성

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Vertex AI Image Generation은 Gemini 이미지 생성 모델을 모두 지원합니다. |
| LiteLLM의 Provider Route | `vertex_ai/` |
| Provider 문서 | [Google Cloud Vertex AI Image Generation ↗](https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images) |
| Gemini Image Generation 문서 | [Gemini Image Generation ↗](https://ai.google.dev/gemini-api/docs/image-generation) |

## 빠른 시작

### Gemini Image Generation 모델

Gemini 이미지 생성 모델은 다음과 같은 기능으로 대화형 이미지 생성을 지원합니다.
- 텍스트-이미지 생성
- 이미지 편집(텍스트 + 이미지 → 이미지)
- 멀티턴 이미지 개선
- 고품질 텍스트 렌더링
- 최대 4K 해상도(Gemini 3 Pro)

```python showLineNumbers title="Gemini 2.5 Flash 이미지"
import litellm

# Generate a single image
response = await litellm.aimage_generation(
    prompt="A nano banana dish in a fancy restaurant with a Gemini theme",
    model="vertex_ai/gemini-2.5-flash-image",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
)

print(response.data[0].b64_json)  # Gemini returns base64 images
```

```python showLineNumbers title="Gemini 3 Pro Image Preview(4K 출력)"
import litellm

# Generate high-resolution image
response = await litellm.aimage_generation(
    prompt="Da Vinci style anatomical sketch of a dissected Monarch butterfly",
    model="vertex_ai/gemini-3-pro-image-preview",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
    # Optional: specify image size for Gemini 3 Pro
    # imageSize="4K",  # Options: "1K", "2K", "4K"
)

print(response.data[0].b64_json)
```

### Imagen 모델

```python showLineNumbers title="Imagen 이미지 생성"
import litellm

# Generate a single image
response = await litellm.aimage_generation(
    prompt="An olympic size swimming pool with crystal clear water and modern architecture",
    model="vertex_ai/imagen-4.0-generate-001",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
)

print(response.data[0].b64_json)  # Imagen also returns base64 images
```

### LiteLLM Proxy

#### 1. config.yaml 구성하기 {#1-configure-your-configyaml}

```yaml showLineNumbers title="Vertex AI Image Generation 구성"
model_list:
  - model_name: vertex-imagen
    litellm_params:
      model: vertex_ai/imagen-4.0-generate-001
      vertex_ai_project: "your-project-id"
      vertex_ai_location: "us-central1"
      vertex_ai_credentials: "path/to/service-account.json"  # Optional if using environment auth
```

#### 2. LiteLLM Proxy 서버 시작 {#2-start-litellm-proxy-server}

```bash title="LiteLLM Proxy 서버 시작"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. OpenAI Python SDK로 요청 보내기 {#3-make-requests-with-openai-python-sdk}

```python showLineNumbers title="Proxy를 통한 기본 이미지 생성"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"      # Your proxy API key
)

# Generate image
response = client.images.generate(
    model="vertex-imagen",
    prompt="An olympic size swimming pool with crystal clear water and modern architecture",
)

print(response.data[0].url)
```

## 지원되는 모델 {#supported-모델}

### Gemini Image Generation 모델

- `vertex_ai/gemini-2.5-flash-image` - 빠르고 효율적인 이미지 생성(1024px 해상도)
- `vertex_ai/gemini-3-pro-image-preview` - 4K 출력, Google Search 그라운딩, thinking mode를 지원하는 고급 모델
- `vertex_ai/gemini-2.0-flash-preview-image` - 미리보기 모델
- `vertex_ai/gemini-2.5-flash-image-preview` - 미리보기 모델

### Imagen 모델

- `vertex_ai/imagegeneration@006` - 레거시 Imagen 모델
- `vertex_ai/imagen-4.0-generate-001` - 최신 Imagen 모델
- `vertex_ai/imagen-3.0-generate-001` - Imagen 3.0 모델

:::tip

**모든 Vertex AI Image Generation 모델을 지원합니다. litellm 요청을 보낼 때 `model=vertex_ai/<any-model-on-vertex_ai>`를 접두사로 설정하기만 하면 됩니다.**

:::

지원되는 모델의 전체 최신 목록은 [https://models.litellm.ai/](https://models.litellm.ai/)에서 확인하세요.
