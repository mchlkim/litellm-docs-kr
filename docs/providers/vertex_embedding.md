import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI Embedding 가이드

## 사용법 - Embedding

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
from litellm import embedding
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = embedding(
    model="vertex_ai/textembedding-gecko",
    input=["good morning from litellm"],
)
print(response)
```
</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">


1. `config.yaml`에 모델을 추가합니다.
```yaml
model_list:
  - model_name: snowflake-arctic-embed-m-long-1731622468876
    litellm_params:
      model: vertex_ai/<your-model-id>
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy를 시작합니다.

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 요청합니다.

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="snowflake-arctic-embed-m-long-1731622468876", 
    input = ["good morning from litellm", "this is another item"],
)

print(response)
```


</TabItem>
</Tabs>

#### Supported Embedding 모델
지원 모델 목록에 있는 모든 모델을 사용할 수 있습니다. 목록은 [여기](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835)를 확인하세요.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `text-embedding-004` | `embedding(model="vertex_ai/text-embedding-004", input)` | 
| `text-multilingual-embedding-002` | `embedding(model="vertex_ai/text-multilingual-embedding-002", input)` | 
| `textembedding-gecko` | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| `textembedding-gecko-multilingual` | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| `textembedding-gecko-multilingual@001` | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| `textembedding-gecko@001` | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| `textembedding-gecko@003` | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| `text-embedding-preview-0409` | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| `text-multilingual-embedding-preview-0409` | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 
| `gemini-embedding-2-preview` | `embedding(model="vertex_ai/gemini-embedding-2-preview", input)` | [멀티모달 문서](#gemini-embedding-2-preview-multimodal) |
| `gemini-embedding-2` *(GA)* | `embedding(model="vertex_ai/gemini-embedding-2", input)` | [멀티모달 문서](#gemini-embedding-2-preview-multimodal) · [GA 참고 사항](/litellm-docs-kr/blog/gemini_embedding_2_ga) |
| 파인튜닝 또는 사용자 지정 Embedding 모델 | `embedding(model="vertex_ai/<your-model-id>", input)` | 

### 지원되는 OpenAI(Unified) 파라미터

| [파라미터](../embedding/supported_embedding.md#input-params-for-litellmembedding) | 타입 | [Vertex 대응값](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api) |
|-------|-------------|--------------------|
| `input` | **string or List[string]** | `instances` |
| `dimensions` | **int** | `output_dimensionality` |
| `input_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** | `task_type` |

#### OpenAI(Unified) 파라미터 사용법


<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"]
    input_type = "RETRIEVAL_DOCUMENT",
    dimensions=1,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "input_type": "RETRIEVAL_QUERY",
    }
)

print(response)
```
</TabItem>
</Tabs>


### 지원되는 Vertex 전용 파라미터

| param | type |
|-------|-------------|
| `auto_truncate` | **bool** |
| `task_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** |
| `title` | **str** |

#### Vertex 전용 파라미터 사용법(`task_type` 및 `title` 사용)

Embedding 모델에 Vertex 전용 파라미터를 전달할 수 있습니다. 다음처럼 embedding 함수에 넘기면 됩니다.

[모든 embedding 파라미터가 정리된 관련 Vertex AI 문서](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api#request_body)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"]
    task_type = "RETRIEVAL_DOCUMENT",
    title = "test",
    dimensions=1,
    auto_truncate=True,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "task_type": "RETRIEVAL_QUERY",
        "auto_truncate": True,
        "title": "test",
    }
)

print(response)
```
</TabItem>
</Tabs>

## **BGE Embeddings**

Vertex AI에 배포된 BGE(Baidu General Embedding) 모델을 사용합니다.

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Using BGE on Vertex AI"
import litellm

response = litellm.embedding(
    model="vertex_ai/bge/<your-endpoint-id>",
    input=["Hello", "World"],
    vertex_project="your-project-id",
    vertex_location="your-location"
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">

1. `config.yaml`에 모델을 추가합니다.
```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: bge-embedding
    litellm_params:
      model: vertex_ai/bge/<your-endpoint-id>
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: your-credentials.json

litellm_settings:
  drop_params: True
```

2. Proxy를 시작합니다.

```bash
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK로 요청합니다.

```python showLineNumbers title="Making requests to BGE"
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="bge-embedding",
    input=["good morning from litellm", "this is another item"]
)

print(response)
```

Private Service Connect(PSC) 엔드포인트 사용:

```yaml showLineNumbers title="config.yaml (PSC)"
model_list:
  - model_name: bge-small-en-v1.5
    litellm_params:
      model: vertex_ai/bge/1234567890 
      api_base: http://10.96.32.8  # Your PSC IP
      vertex_project: my-project-id  #optional
      vertex_location: us-central1 #optional
```

</TabItem>
</Tabs>

## **멀티모달 Embeddings**

### Gemini Embedding 2 Preview(멀티모달)

`gemini-embedding-2-preview`는 텍스트, 이미지, 오디오, 비디오, PDF를 단일 요청에서 처리하는 **통합 멀티모달 embedding**을 지원합니다.
자세한 내용은 [블로그 글](/litellm-docs-kr/blog/gemini_embedding_2_multimodal)을 확인하세요.
GA 모델 ID인 `gemini-embedding-2`도 동일한 동작을 제공하므로, 아래 예제의 모델 이름만 교체하면 됩니다.
비용 맵 적용 범위와 가격 참고 사항은 [GA 블로그](/litellm-docs-kr/blog/gemini_embedding_2_ga)를 확인하세요.

:::warning 응답 형태 — Vertex는 결합된 벡터 하나를 반환합니다

Vertex AI의 Gemini embedding 엔드포인트는 단일 콘텐츠 `embedContent`만 노출하며 `batchEmbedContents`는 제공하지 않습니다.
따라서 `input=[...]`에 `N`개 항목을 전달하면 각 항목별 벡터 N개가 아니라 모든 부분을 결합한 **통합 embedding 1개**가 반환됩니다.
항목마다 하나의 벡터가 필요하면 입력마다 `embedding(...)`을 한 번씩 호출하세요.

이는 입력 요소마다 하나의 embedding을 반환하는 Gemini API 경로(`gemini/gemini-embedding-2-preview`, OpenAI 호환)와 다릅니다.
[Gemini embedding 문서](../embedding/supported_embedding#gemini-embedding-2-preview-multimodal)를 확인하세요.

:::


**입력 형식:**
- **Data URIs:** `data:image/png;base64,<encoded_data>`
- **GCS URLs:** `gs://bucket/path/to/file.png`(확장자로 MIME 타입 추론)

**지원되는 MIME 타입:** `image/png`, `image/jpeg`, `audio/mpeg`, `audio/wav`, `video/mp4`, `video/quicktime`, `application/pdf`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
from litellm import embedding

litellm.vertex_project = "your-project-id"
litellm.vertex_location = "us-central1"

# Text + Image (GCS URL)
response = embedding(
    model="vertex_ai/gemini-embedding-2-preview",
    input=[
        "Describe this image",
        "gs://my-bucket/images/photo.png"
    ],
)

# Text + Image (base64)
response = embedding(
    model="vertex_ai/gemini-embedding-2-preview",
    input=[
        "The food was delicious",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ],
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">

```yaml
model_list:
  - model_name: vertex-gemini-embedding-2-preview
    litellm_params:
      model: vertex_ai/gemini-embedding-2-preview
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
```

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-gemini-embedding-2-preview",
    "input": ["Describe this", "gs://bucket/image.png"]
  }'
```

</TabItem>
</Tabs>

### multimodalembedding@001(레거시)

알려진 제한 사항:
- 요청당 이미지/비디오/이미지 1개만 지원합니다.
- GCS 또는 base64로 인코딩된 이미지/비디오만 지원합니다.

### 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

GCS 이미지 사용:

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png" # will be sent as a gcs image
)
```

base64로 인코딩된 이미지 사용:

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="data:image/jpeg;base64,..." # will be sent as a base64 encoded image
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY (Unified Endpoint)">

1. `config.yaml`에 모델을 추가합니다.
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy를 시작합니다.

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 요청합니다.


<Tabs>

<TabItem value="OpenAI SDK" label="OpenAI SDK">

GCS 이미지/비디오 URI 요청:

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png",
)

print(response)
```

base64로 인코딩된 이미지 요청:

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "data:image/jpeg;base64,...",
)

print(response)
```

</TabItem>

<TabItem value="langchain" label="Langchain">

GCS 이미지/비디오 URI 요청:
```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # type: ignore
)


query_result = embeddings.embed_query(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)
print(query_result)

```

base64로 인코딩된 이미지 요청:

```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",  # type: ignore
)


query_result = embeddings.embed_query(
    "data:image/jpeg;base64,..."
)
print(query_result)

```

</TabItem>

</Tabs>
</TabItem>


<TabItem value="proxy-vtx" label="LiteLLM PROXY (Vertex SDK)">

1. `config.yaml`에 모델을 추가합니다.
```yaml
default_vertex_config:
  vertex_project: "adroit-crow-413218"
  vertex_location: "us-central1"
  vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 
```

2. Proxy를 시작합니다.

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK로 요청합니다.

```python
import vertexai

from vertexai.vision_models import Image, MultiModalEmbeddingModel, Video
from vertexai.vision_models import VideoSegmentConfig
from google.auth.credentials import Credentials


LITELLM_PROXY_API_KEY = "sk-1234"
LITELLM_PROXY_BASE = "http://0.0.0.0:4000/vertex-ai"

import datetime

class CredentialsWrapper(Credentials):
    def __init__(self, token=None):
        super().__init__()
        self.token = token
        self.expiry = None  # or set to a future date if needed
        
    def refresh(self, request):
        pass
    
    def apply(self, headers, token=None):
        headers['Authorization'] = f'Bearer {self.token}'

    @property
    def expired(self):
        return False  # Always consider the token as non-expired

    @property
    def valid(self):
        return True  # Always consider the credentials as valid

credentials = CredentialsWrapper(token=LITELLM_PROXY_API_KEY)

vertexai.init(
    project="adroit-crow-413218",
    location="us-central1",
    api_endpoint=LITELLM_PROXY_BASE,
    credentials = credentials,
    api_transport="rest",
   
)

model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
image = Image.load_from_file(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)

embeddings = model.get_embeddings(
    image=image,
    contextual_text="Colosseum",
    dimension=1408,
)
print(f"Image Embedding: {embeddings.image_embedding}")
print(f"Text Embedding: {embeddings.text_embedding}")
```

</TabItem>
</Tabs>


### 텍스트 + 이미지 + 비디오 Embeddings

<Tabs>
<TabItem value="sdk" label="SDK">

텍스트 + 이미지

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"] # will be sent as a gcs image
)
```

텍스트 + 비디오

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```

이미지 + 비디오

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```


</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY (Unified Endpoint)">

1. `config.yaml`에 모델을 추가합니다.
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. Proxy를 시작합니다.

```
$ litellm --config /path/to/config.yaml
```

3. OpenAI Python SDK 또는 Langchain Python SDK로 요청합니다.


텍스트 + 이미지

```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"],
)

print(response)
```

텍스트 + 비디오
```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

이미지 + 비디오
```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

</TabItem>
</Tabs>
