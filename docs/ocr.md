# /ocr

| 기능 | 지원 여부 | 
|---------|-----------|
| 비용 추적 | ✅ |
| 로깅 | ✅ (Basic Logging 미지원) |
| 로드 밸런싱 | ✅ |
| 지원 프로바이더 | `mistral`, `azure_ai`, `vertex_ai` |

:::tip

LiteLLM은 [OCR API용 Mistral API 요청/응답](https://docs.mistral.ai/capabilities/vision/#optical-character-recognition-ocr)을 따릅니다.

:::

## **LiteLLM Python SDK 사용법**
### 빠른 시작 {#quick-start}

```python
from litellm import ocr
import os

os.environ["MISTRAL_API_KEY"] = "sk-.."

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    }
)

# Access extracted text
for page in response.pages:
    print(f"Page {page.index}:")
    print(page.markdown)
```

### 비동기 사용법 {#async-usage}

```python
from litellm import aocr
import os, asyncio

os.environ["MISTRAL_API_KEY"] = "sk-.."

async def test_async_ocr(): 
    response = await aocr(
        model="mistral/mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": "https://arxiv.org/pdf/2201.04234"
        }
    )
    
    # Access extracted text
    for page in response.pages:
        print(f"Page {page.index}:")
        print(page.markdown)

asyncio.run(test_async_ocr())
```

### 로컬 파일 사용 {#using-local-files}

LiteLLM은 로컬 파일을 직접 읽을 수 있습니다. 수동 base64 인코딩이 필요하지 않습니다.

```python
from litellm import ocr

# OCR with a local PDF file path
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": "/path/to/document.pdf"
    }
)

# OCR with a file object
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": open("document.pdf", "rb")
    }
)

# OCR with raw bytes
with open("document.pdf", "rb") as f:
    pdf_bytes = f.read()

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "file",
        "file": pdf_bytes,
        "mime_type": "application/pdf"  # recommended for raw bytes (auto-detected from extension for file paths)
    }
)
```

`file` 필드는 다음 입력을 받습니다.
- **파일 경로** (`str` 또는 `pathlib.Path`) - LiteLLM이 파일을 읽고 확장자에서 MIME 타입을 감지합니다.
- **파일 객체** (바이너리 file-like object) - 예: `open("doc.pdf", "rb")`
- **원시 bytes** (`bytes`) - 콘텐츠 타입을 지정하려면 `mime_type`을 사용합니다.

LiteLLM은 내부적으로 파일 입력을 base64 data URI로 자동 변환하므로 모든 프로바이더에서 자연스럽게 작동합니다.

### base64 인코딩 문서 사용 {#using-base64-encoded-documents}

```python
import base64
from litellm import ocr

# Encode PDF to base64
with open("document.pdf", "rb") as f:
    base64_pdf = base64.b64encode(f.read()).decode('utf-8')

response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{base64_pdf}"
    }
)
```

### 선택적 파라미터 {#optional-parameters}

```python
response = ocr(
    model="mistral/mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://example.com/doc.pdf"
    },
    # Optional Mistral parameters
    pages=[0, 1, 2],              # Only process specific pages
    include_image_base64=True,     # Include extracted images
    image_limit=10,                # Max images to return
    image_min_size=100             # Min image size to include
)
```

## **LiteLLM Proxy 사용법**

LiteLLM은 OCR 호출을 위해 Mistral API와 호환되는 `/ocr` 엔드포인트를 제공합니다.

**설정**

litellm proxy `config.yaml`에 다음을 추가합니다.

```yaml
model_list:
  - model_name: mistral-ocr
    litellm_params:
      model: mistral/mistral-ocr-latest
      api_key: os.environ/MISTRAL_API_KEY
```

litellm을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**테스트 요청 - JSON 본문**

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-ocr",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    }
  }'
```

**테스트 요청 - multipart 파일 업로드**

multipart form data를 사용해 파일을 직접 업로드합니다. 파일을 직접 base64로 인코딩할 필요가 없습니다.

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer sk-1234" \
  -F "model=mistral-ocr" \
  -F "file=@/path/to/document.pdf"
```

선택적 파라미터를 추가 폼 필드로 전달할 수도 있습니다.

```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer sk-1234" \
  -F "model=mistral-ocr" \
  -F "file=@screenshot.png" \
  -F 'pages=[0,1,2]' \
  -F "include_image_base64=true"
```

## **요청/응답 형식** {#requestresponse-format}

:::info

LiteLLM은 **Mistral OCR API 사양**을 따릅니다.

전체 세부 내용은 [공식 Mistral OCR 문서](https://docs.mistral.ai/capabilities/vision/#optical-character-recognition-ocr)를 참고하세요.

:::

### 예제 요청 {#example-request}

```python
{
    "model": "mistral/mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    "pages": [0, 1, 2],              # Optional: specific pages to process
    "include_image_base64": True,     # Optional: include extracted images
    "image_limit": 10,                # Optional: max images to return
    "image_min_size": 100             # Optional: min image size in pixels
}
```

### 요청 파라미터 {#request-parameters}

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `model` | string | 예 | 사용할 OCR 모델 (예: `"mistral/mistral-ocr-latest"`) |
| `document` | object | 예 | 처리할 문서입니다. `type`과 그에 대응하는 필드를 포함해야 합니다. |
| `document.type` | string | 예 | PDF/문서는 `"document_url"`, 이미지는 `"image_url"`, 로컬 파일은 `"file"`을 사용합니다. |
| `document.document_url` | string | 조건부 | 문서의 URL 또는 data URI입니다. `type`이 `"document_url"`이면 필수입니다. |
| `document.image_url` | string | 조건부 | 이미지의 URL 또는 data URI입니다. `type`이 `"image_url"`이면 필수입니다. |
| `document.file` | string/bytes/file | 조건부 | 파일 경로, bytes 또는 file-like object입니다. `type`이 `"file"`이면 필수입니다. |
| `document.mime_type` | string | 아니요 | 파일 입력의 명시적 MIME 타입입니다. 제공하지 않으면 확장자에서 자동 감지됩니다. |
| `pages` | array | 아니요 | 처리할 특정 페이지 인덱스 목록입니다(0-indexed). |
| `include_image_base64` | boolean | 아니요 | 추출된 이미지를 base64 문자열로 포함할지 여부입니다. |
| `image_limit` | integer | 아니요 | 반환할 최대 이미지 수입니다. |
| `image_min_size` | integer | 아니요 | 포함할 이미지의 최소 크기(픽셀)입니다. |

#### 문서 형식 예제 {#document-format-examples}

**PDF 및 문서(URL):**
```json
{
  "type": "document_url",
  "document_url": "https://example.com/document.pdf"
}
```

**이미지(URL):**
```json
{
  "type": "image_url",
  "image_url": "https://example.com/image.png"
}
```

**base64 인코딩 콘텐츠:**
```json
{
  "type": "document_url",
  "document_url": "data:application/pdf;base64,JVBERi0xLjQKJ..."
}
```

**로컬 파일(SDK):**
```python
{"type": "file", "file": "/path/to/document.pdf"}
{"type": "file", "file": open("image.png", "rb")}
{"type": "file", "file": pdf_bytes, "mime_type": "application/pdf"}
```

**파일 업로드(Proxy - multipart form):**
```bash
curl http://0.0.0.0:4000/v1/ocr \
  -H "Authorization: Bearer sk-1234" \
  -F "model=mistral-ocr" \
  -F "file=@document.pdf"
```

### 응답 형식

응답은 다음 구조의 Mistral OCR 형식을 따릅니다.

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Document Title\n\nExtracted text content...",
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      },
      "images": [
        {
          "image_base64": "base64string...",
          "bbox": {
            "x": 100,
            "y": 200,
            "width": 300,
            "height": 400
          }
        }
      ]
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "usage_info": {
    "pages_processed": 29,
    "doc_size_bytes": 3002783
  },
  "document_annotation": null,
  "object": "ocr"
}
```

#### 응답 필드 {#response-fields}

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `pages` | array | 추출된 콘텐츠가 포함된 처리 완료 페이지 목록입니다. |
| `pages[].index` | integer | 페이지 번호입니다(0-indexed). |
| `pages[].markdown` | string | Markdown 형식으로 추출된 텍스트입니다. |
| `pages[].dimensions` | object | 페이지 크기입니다(dpi, 높이, 너비는 픽셀 단위). |
| `pages[].images` | array | 페이지에서 추출된 이미지입니다(`include_image_base64=true`인 경우). |
| `model` | string | OCR 처리에 사용된 모델입니다. |
| `usage_info` | object | 처리 통계입니다(처리된 페이지, 문서 크기). |
| `document_annotation` | object | 선택적 문서 수준 annotation입니다. |
| `object` | string | OCR 응답에서는 항상 `"ocr"`입니다. |


## **지원 프로바이더**

| 프로바이더    | 사용법 링크      |
|-------------|--------------------|
| Mistral AI  |   [사용법](#quick-start)                 |
| Azure AI    |   [사용법](../docs/providers/azure_ocr)                 |
| Vertex AI   |   [사용법](../docs/providers/vertex_ocr)                 |
