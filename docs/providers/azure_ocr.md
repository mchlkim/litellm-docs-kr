# Azure AI OCR(Mistral) 설정

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Azure AI OCR은 Mistral 기반 문서 인텔리전스 기능을 제공하며, PDF와 이미지에서 텍스트를 추출할 수 있습니다 |
| LiteLLM 제공자 라우트 | `azure_ai/` |
| 지원 작업 | `/ocr` |
| 제공자 문서 링크 | [Azure AI ↗](https://ai.azure.com/)

Mistral 기반 Azure AI OCR 모델을 사용해 문서와 이미지에서 텍스트를 추출합니다.

## 빠른 시작

### **LiteLLM SDK**

```python showLineNumbers title="SDK Usage"
import litellm
import os

# Set environment variables
os.environ["AZURE_AI_API_KEY"] = ""
os.environ["AZURE_AI_API_BASE"] = ""

# OCR with PDF URL
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
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
  - model_name: azure-ocr
    litellm_params:
      model: azure_ai/mistral-document-ai-2505
      api_key: "os.environ/AZURE_AI_API_KEY"
      api_base: "os.environ/AZURE_AI_API_BASE"
    model_info:
      mode: ocr
```

## 문서 유형 {#document-types}

Azure AI OCR은 PDF와 이미지를 모두 지원합니다.

### PDF 문서 {#pdf-documents}

```python showLineNumbers title="PDF OCR"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)
```

### 이미지 문서 {#image-documents}

```python showLineNumbers title="Image OCR"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "image_url",
        "image_url": "https://example.com/image.png"
    }
)
```

### Base64 인코딩 문서 {#base64-encoded-documents}

```python showLineNumbers title="Base64 PDF"
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode()

response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{pdf_base64}"
    }
)
```

## 지원 파라미터

```python showLineNumbers title="All Parameters"
response = litellm.ocr(
    model="azure_ai/mistral-document-ai-2505",
    document={                           # Required: Document to process
        "type": "document_url",
        "document_url": "https://..."
    },
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
    model="azure_ai/mistral-document-ai-2505",
    document={
        "type": "document_url",
        "document_url": "https://example.com/document.pdf"
    }
)
```

## 중요 참고 사항 {#important-참고}

:::info URL 변환
Azure AI OCR 엔드포인트는 인터넷에 접근할 수 없습니다. LiteLLM은 Azure AI로 요청을 보내기 전에 공개 URL을 base64 data URI로 자동 변환합니다.
:::

## 지원 모델 {#supported-모델}

- `mistral-document-ai-2505` - Azure AI의 최신 Mistral OCR 모델

Azure AI 제공자 접두사를 사용하세요: `azure_ai/<model-name>`
