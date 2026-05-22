import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /embeddings

## 빠른 시작
```python
from litellm import embedding
import os
os.environ['OPENAI_API_KEY'] = ""
response = embedding(model='text-embedding-ada-002', input=["good morning from litellm"])
```

## 비동기 사용법 - `aembedding()` {#async-usage-aembedding}

LiteLLM은 `embedding` 함수의 비동기 버전인 `aembedding`을 제공합니다.

```python
from litellm import aembedding
import asyncio

async def get_embedding():
    response = await aembedding(
        model='text-embedding-ada-002',
        input=["good morning from litellm"]
    )
    return response

response = asyncio.run(get_embedding())
print(response)
```

## 프록시 사용법 {#proxy-usage}

**참고**
`vertex_ai`의 경우:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="absolute/path/to/service_account.json"
```

### config에 모델 추가 {#add-models-to-config}

```yaml
model_list:
- model_name: textembedding-gecko
  litellm_params:
    model: vertex_ai/textembedding-gecko

general_settings:
  master_key: sk-1234
```

### 프록시 시작 {#start-proxy}

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 테스트

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/embeddings' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"input": ["Academia.edu uses"], "model": "textembedding-gecko", "encoding_format": "base64"}'
```

</TabItem>
<TabItem value="openai" label="OpenAI (Python)">

```python
from openai import OpenAI
client = OpenAI(
  api_key="sk-1234",
  base_url="http://0.0.0.0:4000"
)

client.embeddings.create(
  model="textembedding-gecko",
  input="The food was delicious and the waiter...",
  encoding_format="float"
)
```
</TabItem>
<TabItem value="langchain" label="LangChain 임베딩">

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="textembedding-gecko", openai_api_base="http://0.0.0.0:4000", openai_api_key="sk-1234")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"VERTEX AI EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
</Tabs>


## 이미지 Embedding {#image-embedding}

이미지 embedding을 지원하는 모델에서는 base64로 인코딩된 이미지 문자열을 `input` 파라미터에 전달할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

# set your api key
os.environ["COHERE_API_KEY"] = ""

response = embedding(model="cohere/embed-english-v3.0", input=["<base64 encoded image>"])
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. config.yaml 설정

```yaml
model_list:
  - model_name: cohere-embed
    litellm_params:
      model: cohere/embed-english-v3.0
      api_key: os.environ/COHERE_API_KEY
```


2. 프록시 시작

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/v1/embeddings' \
-H 'Authorization: Bearer sk-54d77cd67b9febbb' \
-H 'Content-Type: application/json' \
-d '{
  "model": "cohere/embed-english-v3.0",
  "input": ["<base64 encoded image>"]
}'
```
</TabItem>
</Tabs>

## `litellm.embedding()` 입력 파라미터


:::info

OpenAI가 아닌 모든 파라미터는 provider별 파라미터로 처리되며, provider에 보내는 request body의 kwargs로 전달됩니다.

[**예약 파라미터 보기**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L3130)

[**예제 보기**](#example)
:::

### 필수 필드

- `model`: *string* - 사용할 모델의 ID입니다. `model='text-embedding-ada-002'`

- `input`: *string or array* - embedding할 입력 text입니다. string 또는 token array로 인코딩됩니다. 단일 요청에서 여러 입력을 embedding하려면 string array나 token array의 array를 전달하세요. 입력은 모델의 최대 입력 token 수(text-embedding-ada-002의 경우 8192 token)를 넘을 수 없고, 빈 string일 수 없으며, 모든 array는 2048 dimensions 이하여야 합니다.
```python
input=["good morning from litellm"]
```

### 선택 LiteLLM 필드

- `user`: *string (optional)* 최종 사용자를 나타내는 고유 identifier입니다.

- `dimensions`: *integer (Optional)* 결과 output embedding이 가져야 할 dimension 수입니다. OpenAI/Azure text-embedding-3 및 이후 모델에서만 지원됩니다.

- `encoding_format`: *string (Optional)* embedding을 반환할 format입니다. `"float"` 또는 `"base64"`를 사용할 수 있습니다. 기본값은 `encoding_format="float"`입니다.

- `timeout`: *integer (Optional)* - API 응답을 기다릴 최대 시간(초)입니다. 기본값은 600초(10분)입니다.

- `api_base`: *string (optional)* - 모델 호출에 사용할 API endpoint입니다.

- `api_version`: *string (optional)* - (Azure-specific) 호출에 사용할 API version입니다.

- `api_key`: *string (optional)* - 요청 인증과 권한 부여에 사용할 API key입니다. 제공하지 않으면 기본 API key가 사용됩니다.

- `api_type`: *string (optional)* - 사용할 API type입니다.

### `litellm.embedding()` 출력

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.0022326677571982145,
        0.010749882087111473,
        ...
        ...
        ...
   
      ]
    }
  ],
  "model": "text-embedding-ada-002-v2",
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

## OpenAI Embedding 모델

### 사용법
```python
from litellm import embedding
import os
os.environ['OPENAI_API_KEY'] = ""
response = embedding(
    model="text-embedding-3-small",
    input=["good morning from litellm", "this is another item"],
    metadata={"anything": "good day"},
    dimensions=5 # Only supported in text-embedding-3 and later models.
)
```

| 모델 이름           | 함수 호출                               | 필수 OS 변수                |
|----------------------|---------------------------------------------|--------------------------------------|
| `text-embedding-3-small` | `embedding('text-embedding-3-small', input)` | `os.environ['OPENAI_API_KEY']`       |
| `text-embedding-3-large` | `embedding('text-embedding-3-large', input)` | `os.environ['OPENAI_API_KEY']`       |
| `text-embedding-ada-002` | `embedding('text-embedding-ada-002', input)` | `os.environ['OPENAI_API_KEY']`       |

## OpenAI 호환 Embedding 모델 {#openai-compatible-embedding-models}
OpenAI 호환 서버의 `/embedding` 엔드포인트를 호출할 때 사용합니다. 예: https://github.com/xorbitsai/inference

**참고: litellm이 OpenAI로 route해야 함을 알 수 있도록 모델 앞에 `openai/` prefix를 추가하세요.**

### 사용법
```python
from litellm import embedding
response = embedding(
  model = "openai/<your-llm-name>",     # add `openai/` prefix to model so litellm knows to route to OpenAI
  api_base="http://0.0.0.0:4000/"       # set API Base of your Custom OpenAI Endpoint
  input=["good morning from litellm"]
)
```

## Bedrock Embedding {#bedrock-embedding}

### API key
환경 변수로 설정하거나 **litellm.embedding()의 파라미터**로 전달할 수 있습니다.
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""  # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = "" # Secret access key
os.environ["AWS_REGION_NAME"] = "" # us-east-1, us-east-2, us-west-1, us-west-2
```

### 사용법
```python
from litellm import embedding
response = embedding(
    model="amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

| 모델 이름           | 함수 호출                               |
|----------------------|---------------------------------------------|
| Amazon Nova Multimodal Embeddings | `embedding(model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0", input=input)` | [Nova 문서](../providers/bedrock_embedding#amazon-nova-multimodal-embeddings) |
| Amazon Nova (Async) | `embedding(model="bedrock/async_invoke/amazon.nova-2-multimodal-embeddings-v1:0", input=input, input_type="text", output_s3_uri="s3://bucket/")` | [Nova Async 문서](../providers/bedrock_embedding) |
| `Titan Embeddings - G1` | `embedding(model="amazon.titan-embed-text-v1", input=input)` |
| Cohere Embeddings - 영어 | `embedding(model="cohere.embed-english-v3", input=input)` |
| Cohere Embeddings - 다국어 | `embedding(model="cohere.embed-multilingual-v3", input=input)` |
| TwelveLabs Marengo (Async) | `embedding(model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text")` | [Async Invoke 문서](../providers/bedrock_embedding#async-invoke-embedding) |

## TwelveLabs Bedrock Embedding 모델 {#twelvelabs-bedrock-embedding-models}

TwelveLabs Marengo 모델은 multimodal embedding(text, image, video, audio)을 지원하며, 입력 format을 지정하려면 `input_type` 파라미터가 필요합니다.

### 사용법

```python
from litellm import embedding
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Text embedding
response = embedding(
    model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world from LiteLLM!"],
    input_type="text"  # Required parameter
)

# Image embedding (base64)
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."],
    input_type="image",  # Required parameter
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

# Video embedding (S3 URL)
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["s3://your-bucket/video.mp4"],
    input_type="video",  # Required parameter
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)
```

### 필수 파라미터

| 파라미터 | 설명 | 값 |
|-----------|-------------|--------|
| `input_type` | 입력 content의 type | `"text"`, `"image"`, `"video"`, `"audio"` |

### 지원 모델 {#supported-models}

| 모델 이름 | 함수 호출 | 참고 |
|------------|---------------|-------|
| TwelveLabs Marengo 2.7 (Sync) | `embedding(model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text")` | text embedding만 지원 |
| TwelveLabs Marengo 2.7 (Async) | `embedding(model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text/image/video/audio")` | 모든 입력 type 지원, `output_s3_uri` 필요 |

## Cohere Embedding 모델
https://docs.cohere.com/reference/embed

### 사용법
```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" # optional param for v3 llms
)
```
| 모델 이름               | 함수 호출                                                |
|--------------------------|--------------------------------------------------------------|
| `embed-english-v3.0`       | `embedding(model="embed-english-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-light-v3.0` | `embedding(model="embed-english-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-v3.0`  | `embedding(model="embed-multilingual-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-light-v3.0` | `embedding(model="embed-multilingual-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-v2.0`       | `embedding(model="embed-english-v2.0", input=["good morning from litellm", "this is another item"])` |
| `embed-english-light-v2.0` | `embedding(model="embed-english-light-v2.0", input=["good morning from litellm", "this is another item"])` |
| `embed-multilingual-v2.0`  | `embedding(model="embed-multilingual-v2.0", input=["good morning from litellm", "this is another item"])` |

## NVIDIA NIM Embedding 모델

### API key
환경 변수로 설정하거나 **litellm.embedding()의 파라미터**로 전달할 수 있습니다.
```python
import os
os.environ["NVIDIA_NIM_API_KEY"] = ""  # api key
os.environ["NVIDIA_NIM_API_BASE"] = "" # nim endpoint url
```

### 사용법
```python
from litellm import embedding
import os
os.environ['NVIDIA_NIM_API_KEY'] = ""
response = embedding(
    model='nvidia_nim/<model_name>', 
    input=["good morning from litellm"],
    input_type="query"
)
```
## Embedding 모델용 `input_type` 파라미터 {#input-type-parameter-for-embedding-models}

`nvidia/embed-qa-4`, E5 family 같은 일부 embedding 모델은 **문서 indexing(passages)** 용도와 **querying** 용도의 dual mode로 동작합니다. 높은 retrieval 정확도를 유지하려면 `input_type` 파라미터를 올바르게 설정해 입력 text가 어떻게 사용되는지 지정해야 합니다.

### 사용법

`input_type` 파라미터를 다음 값 중 하나로 설정하세요.

- `"passage"` - **indexing** 중 content embedding에 사용합니다(예: documents).
- `"query"` - **retrieval** 중 content embedding에 사용합니다(예: user queries).

> **경고:** `input_type`을 잘못 사용하면 retrieval 성능이 크게 떨어질 수 있습니다.



[여기](https://build.nvidia.com/explore/retrieval)에 나열된 모든 모델이 지원됩니다.

| 모델 이름         | 함수 호출                                         |
| :---               | :---                                                  |
| NV-Embed-QA | `embedding(model="nvidia_nim/NV-Embed-QA", input)` |
| `nvidia/nv-embed-v1` | `embedding(model="nvidia_nim/nvidia/nv-embed-v1", input)` |
| `nvidia/nv-embedqa-mistral-7b-v2` | `embedding(model="nvidia_nim/nvidia/nv-embedqa-mistral-7b-v2", input)` |
| `nvidia/nv-embedqa-e5-v5` | `embedding(model="nvidia_nim/nvidia/nv-embedqa-e5-v5", input)` |
| nvidia/embed-qa-4 | `embedding(model="nvidia_nim/nvidia/embed-qa-4", input)` |
| `nvidia/llama-3.2-nv-embedqa-1b-v1` | `embedding(model="nvidia_nim/nvidia/llama-3.2-nv-embedqa-1b-v1", input)` |
| `nvidia/llama-3.2-nv-embedqa-1b-v2` | `embedding(model="nvidia_nim/nvidia/llama-3.2-nv-embedqa-1b-v2", input)` |
| `snowflake/arctic-embed-l` | `embedding(model="nvidia_nim/snowflake/arctic-embed-l", input)` |
| baai/bge-m3 | `embedding(model="nvidia_nim/baai/bge-m3", input)` |


## HuggingFace Embedding 모델 {#huggingface-embedding-models}
LiteLLM은 모든 Feature-Extraction 및 Sentence Similarity Embedding 모델을 지원합니다: https://huggingface.co/models?pipeline_tag=feature-extraction

### 사용법
```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm"]
)
```

### 사용법 - input_type 설정

LiteLLM은 API base에 GET request를 보내 input type(feature-extraction 또는 sentence-similarity)을 추론합니다.

`input_type`을 직접 설정해 이 동작을 override할 수 있습니다.

```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm", "you are a good bot"],
    api_base = "https://p69xlsj6rpno5drq.us-east-1.aws.endpoints.huggingface.cloud", 
    input_type="sentence-similarity"
)
```

### 사용법 - 사용자 정의 API Base
```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm"],
    api_base = "https://p69xlsj6rpno5drq.us-east-1.aws.endpoints.huggingface.cloud"
)
```

| 모델 이름            | 함수 호출 | 필수 OS 변수                        |
|-----------------------|--------------------------------------------------------------|-------------------------------------------------|
| `microsoft/codebert-base`    | `embedding('huggingface/microsoft/codebert-base', input=input)`               | `os.environ['HUGGINGFACE_API_KEY']`                                             |
| BAAI/bge-large-zh | `embedding('huggingface/BAAI/bge-large-zh', input=input)`         | `os.environ['HUGGINGFACE_API_KEY']`                                             |
| `any-hf-embedding-model` | `embedding('huggingface/hf-embedding-model', input=input)`         | `os.environ['HUGGINGFACE_API_KEY']`                                             |


## Mistral AI Embedding 모델 {#mistral-ai-embedding-models}
여기에 나열된 모든 모델이 지원됩니다: https://docs.mistral.ai/platform/endpoints

### 사용법
```python
from litellm import embedding
import os

os.environ['MISTRAL_API_KEY'] = ""
response = embedding(
    model="mistral/mistral-embed",
    input=["good morning from litellm"],
)
print(response)
```

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mistral-embed | `embedding(model="mistral/mistral-embed", input)` | 

## Gemini AI Embedding 모델

### API key

환경 변수로 설정하거나 **litellm.embedding()의 파라미터**로 전달할 수 있습니다.
```python
import os
os.environ["GEMINI_API_KEY"] = ""
```

### 사용법 - Embedding
```python
from litellm import embedding
response = embedding(
  model="gemini/text-embedding-004",
  input=["good morning from litellm"],
)
print(response)
```

[여기](https://ai.google.dev/gemini-api/docs/models/gemini)에 나열된 모든 모델이 지원됩니다.

| 모델 이름         | 함수 호출                                         |
| :---               | :---                                                  |
| `text-embedding-004` | `embedding(model="gemini/text-embedding-004", input)` |
| gemini-embedding-2-preview | `embedding(model="gemini/gemini-embedding-2-preview", input)` | [Multimodal 문서](#gemini-embedding-2-preview-multimodal) |
| gemini-embedding-2 *(GA)* | `embedding(model="gemini/gemini-embedding-2", input)` | [Multimodal 문서](#gemini-embedding-2-preview-multimodal) · [GA 참고 사항](/litellm-docs-kr/blog/gemini_embedding_2_ga) |

### Gemini Embedding 2 Preview (멀티모달) {#gemini-embedding-2-preview-multimodal}

`gemini-embedding-2-preview`는 단일 요청에서 text, images, audio, video, PDF를 처리하는 **multimodal embedding**을 지원합니다. 자세한 내용은 [블로그 게시물](/litellm-docs-kr/blog/gemini_embedding_2_multimodal)을 참고하세요. GA 모델 ID `gemini-embedding-2`도 같은 동작을 제공하므로 아래 예제에서 모델 이름만 바꾸면 됩니다. 비용 매핑 범위와 가격 참고 사항은 [GA 블로그](/litellm-docs-kr/blog/gemini_embedding_2_ga)를 참고하세요.

:::info 응답 형태

Gemini API path(`gemini/gemini-embedding-2-preview`)에서는 각 input element가 **자체** embedding(indexed `0..N-1`)을 반환합니다. 이는 OpenAI의 `/embeddings`와 같은 semantics입니다. LiteLLM은 input마다 하나의 `EmbedContentRequest`를 사용해 Gemini의 `batchEmbedContents` endpoint로 route합니다. 모든 part를 하나의 unified vector로 결합하는 Vertex AI path와 다릅니다. [Vertex AI embeddings 문서](../providers/vertex_embedding#gemini-embedding-2-preview-multimodal)를 참고하세요.

:::


**입력 format:**
- **Data URI:** `data:image/png;base64,<encoded_data>`
- **Gemini file reference:** `files/abc123` (Gemini Files API로 미리 upload)

**지원 MIME type:** `image/png`, `image/jpeg`, `audio/mpeg`, `audio/wav`, `video/mp4`, `video/quicktime`, `application/pdf`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os
os.environ["GEMINI_API_KEY"] = ""

# Text + Image (base64)
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[
        "The food was delicious and the waiter...",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="프록시">

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2-preview",
    "input": [
      "The food was delicious and the waiter...",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ]
  }'
```

</TabItem>
</Tabs>

**선택 사항:** `dimensions`는 Gemini의 `outputDimensionality`에 매핑됩니다.

#### 결합 Multimodal Embeddings {#combined-multimodal-embeddings}

기본적으로 `input` list의 각 element는 **별도** embedding(OpenAI-compatible)을 생성합니다. 여러 input을 **단일** embedding으로 결합하려면(예: 하나의 entity를 나타내는 text + image) nested list로 감싸세요.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding

# Separate: 2 inputs → 2 embeddings
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=["a red shoe", "data:image/png;base64,..."],
)
# response.data has 2 embeddings

# Combined: text + image → 1 embedding
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."]],
)
# response.data has 1 embedding representing both together

# Mixed: 1 combined + 1 separate → 2 embeddings
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."], "just text"],
)
# response.data has 2 embeddings
```

</TabItem>
<TabItem value="proxy" label="프록시">

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2-preview",
    "input": [["a red shoe", "data:image/png;base64,..."], "just text"]
  }'
```

</TabItem>
</Tabs>

이 방식은 multimodal entity(예: 이름과 사진이 있는 product)를 search 및 retrieval용 단일 vector로 표현할 때 유용합니다. Gemini API에서만 적용됩니다. Vertex AI는 input shape와 관계없이 항상 단일 combined vector를 반환합니다([Vertex AI embeddings 문서](../providers/vertex_embedding#gemini-embedding-2-preview-multimodal) 참고).


## Vertex AI Embedding 모델

### 사용법 - Embedding
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

### 지원 모델
[여기](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835)에 나열된 모든 모델이 지원됩니다.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `textembedding-gecko` | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| `textembedding-gecko-multilingual` | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| `textembedding-gecko-multilingual@001` | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| `textembedding-gecko@001` | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| `textembedding-gecko@003` | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| `text-embedding-preview-0409` | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| `text-multilingual-embedding-preview-0409` | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 

## Voyage AI Embedding 모델

### 사용법 - Embedding
```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = ""
response = embedding(
    model="voyage/voyage-01",
    input=["good morning from litellm"],
)
print(response)
```

### 지원 모델
여기에 나열된 모든 모델이 지원됩니다: https://docs.voyageai.com/embeddings/#models-and-specifics

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| voyage-01 | `embedding(model="voyage/voyage-01", input)` | 
| voyage-lite-01 | `embedding(model="voyage/voyage-lite-01", input)` | 
| `voyage-lite-01-instruct` | `embedding(model="voyage/voyage-lite-01-instruct", input)` | 

### Provider별 파라미터 {#provider-specific-params}


:::info

OpenAI가 아닌 모든 파라미터는 provider별 파라미터로 처리되며, provider에 보내는 request body의 kwargs로 전달됩니다.

[**예약 파라미터 보기**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L3130)
:::

### **예제**

Cohere v3 모델에는 필수 파라미터 `input_type`이 있으며, 다음 네 값 중 하나를 사용할 수 있습니다.

- `input_type="search_document"`: (기본값) vector database에 저장할 text(documents)에 사용합니다.
- `input_type="search_query"`: vector database에서 가장 관련성 높은 documents를 찾는 search query에 사용합니다.
- `input_type="classification"`: embedding을 classification system의 입력으로 사용할 때 사용합니다.
- `input_type="clustering"`: embedding을 text clustering에 사용할 때 사용합니다.

https://txt.cohere.com/introducing-embed-v3/

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="프록시">

**config 사용**

```yaml
model_list:
  - model_name: "cohere-embed"
    litellm_params:
      model: embed-english-v3.0
      input_type: search_document # 👈 PROVIDER-SPECIFIC PARAM
```

**request 사용**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/embeddings' \
-H 'Authorization: Bearer sk-54d77cd67b9febbb' \
-H 'Content-Type: application/json' \
-d '{
  "model": "cohere-embed",
  "input": ["Are you authorized to work in United States of America?"],
  "input_type": "search_document" # 👈 PROVIDER-SPECIFIC PARAM
}'
```
</TabItem>
</Tabs>

## Nebius AI Studio Embedding 모델

### 사용법 - Embedding
```python
from litellm import embedding
import os

os.environ['NEBIUS_API_KEY'] = ""
response = embedding(
    model="nebius/BAAI/bge-en-icl",
    input=["Good morning from litellm!"],
)
print(response)
```

### 지원 모델
지원되는 모든 모델은 여기에서 확인할 수 있습니다: https://studio.nebius.ai/models/embedding

| 모델 이름               | 함수 호출                                                   |
|--------------------------|-----------------------------------------------------------------|
| BAAI/bge-en-icl | `embedding(model="nebius/BAAI/bge-en-icl", input)`              | 
| `BAAI/bge-multilingual-gemma2` | `embedding(model="nebius/BAAI/bge-multilingual-gemma2", input)` | 
| `intfloat/e5-mistral-7b-instruct` | `embedding(model="nebius/intfloat/e5-mistral-7b-instruct", input)`      | 
