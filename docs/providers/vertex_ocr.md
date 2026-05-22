# Vertex AI OCR

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Vertex AI OCR은 Mistral 기반 문서 인텔리전스 기능을 제공하며, PDF와 이미지에서 텍스트를 추출할 수 있습니다 |
| LiteLLM의 제공자 라우트 | `vertex_ai/` |
| 지원 작업 | `/ocr` |
| 제공자 문서 링크 | [Vertex AI ↗](https://cloud.google.com/vertex-ai)

Mistral 기반 Vertex AI OCR 모델을 사용해 문서와 이미지에서 텍스트를 추출합니다.

## 빠른 시작

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set environment variables
os.environ["VERTEXAI_PROJECT"] = "your-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# OCR with PDF URL
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)

# Access extracted text
for page in response.pages:
    print(page.text)
```

### **LiteLLM PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: vertex-ocr
    litellm_params:
      model: vertex_ai/mistral-ocr-2505
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: path/to/service-account.json  # Optional
    model_info:
      mode: ocr
```

**Proxy 시작**
```bash
litellm --config proxy_config.yaml
```

**Proxy를 통해 OCR 호출**
```bash showLineNumbers title="cURL Request"
curl -X POST http://localhost:4000/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "vertex-ocr",
    "document": {
      "type": "document_url",
      "document_url": "https://arxiv.org/pdf/2201.04234"
    }
  }'
```

## 인증

Vertex AI OCR은 여러 인증 방식을 지원합니다.

### 서비스 계정 JSON {#service-account-json}

```python showLineNumbers title="Service Account Auth"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id",
    vertex_location="us-central1",
    vertex_credentials="path/to/service-account.json"
)
```

### 애플리케이션 기본 사용자 인증 정보 {#application-default-credentials}

```python showLineNumbers title="Default Credentials"
# Relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 문서 유형 {#document-types}

Vertex AI OCR은 PDF와 이미지를 모두 지원합니다.

### PDF 문서 {#pdf-documents}

```python showLineNumbers title="PDF OCR"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

### 이미지 문서 {#image-documents}

```python showLineNumbers title="Image OCR"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "image_url",
        "image_url": "https://example.com/image.png"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

### Base64 인코딩 문서 {#base64-encoded-documents}

```python showLineNumbers title="Base64 PDF"
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode()

response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505", # This doesn't work for deepseek
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{pdf_base64}"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 지원 파라미터

```python showLineNumbers title="All Parameters"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={                           # Required: Document to process
        "type": "document_url",
        "document_url": "https://..."
    },
    vertex_project="your-project-id",   # Required: GCP project ID
    vertex_location="us-central1",       # Optional: Defaults to us-central1
    vertex_credentials="path/to/key.json", # Optional: Service account key
    include_image_base64=True,           # Optional: Include base64 images
    pages=[0, 1, 2],                     # Optional: Specific pages to process
    image_limit=10                       # Optional: Limit number of images
)
```

## 응답 형식

```python showLineNumbers title="Response Structure"
# Response has the following structure
response.pages          # List of pages with extracted text
response.model          # Model used
response.object         # "ocr"
response.usage_info     # Token usage information

# Access page content
for page in response.pages:
    print(f"Page {page.page_number}:")
    print(page.text)
```

## 비동기 지원 {#async-support}

```python showLineNumbers title="Async Usage"
import litellm

response = await litellm.aocr(
    model="vertex_ai/mistral-ocr-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    },
    vertex_project="your-project-id",
    vertex_location="us-central1"
)
```

## 비용 추적 {#cost-tracking}

LiteLLM은 Vertex AI OCR의 비용을 자동으로 추적합니다.

- **페이지당 비용**: $0.0005(1,000페이지당 $1.50 기준)

```python showLineNumbers title="View Cost"
response = litellm.ocr(
    model="vertex_ai/mistral-ocr-2505",
    document={"type": "document_url", "document_url": "https://..."},
    vertex_project="your-project-id"
)

# Access cost information
print(f"Cost: ${response._hidden_params.get('response_cost', 0)}")
```

## 중요 참고 {#important-참고}

:::info URL 변환
Vertex AI Mistral OCR 엔드포인트는 인터넷에 액세스할 수 없습니다. LiteLLM은 Vertex AI로 요청을 보내기 전에 공개 URL을 base64 data URI로 자동 변환합니다.
:::

:::tip 리전 가용성
Mistral OCR은 여러 리전에서 사용할 수 있습니다. 데이터와 더 가까운 리전을 사용하려면 `vertex_location`을 지정하세요.
- `us-central1`(기본값)
- `europe-west1`
- `asia-southeast1`

Deepseek OCR은 global 리전에서만 사용할 수 있습니다.
:::

## 지원 모델 {#supported-모델}

- `mistral-ocr-2505` - Vertex AI의 최신 Mistral OCR 모델
- `deepseek-ocr-maas` - Vertex AI의 최신 Deepseek OCR 모델

Vertex AI 제공자 prefix를 사용하세요: `vertex_ai/<model-name>`
