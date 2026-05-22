---
slug: gemini_embedding_2_multimodal
title: "Gemini Embedding 2 Preview: LiteLLM의 멀티모달 임베딩"
date: 2025-03-11T10:00:00
authors:
  - sameer
description: "Gemini API와 Vertex AI를 통해 LiteLLM에서 gemini-embedding-2-preview로 텍스트, 이미지, 오디오, 비디오, PDF 임베딩을 생성하는 방법입니다."
tags: [gemini, embeddings, multimodal, vertex ai]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini Embedding 2 Preview: 멀티모달 임베딩

LiteLLM은 이제 `gemini-embedding-2-preview`로 **멀티모달 임베딩**을 지원합니다. 하나의 요청에서 텍스트, 이미지, 오디오, 비디오, PDF 콘텐츠를 함께 사용할 수 있으며, **Gemini API**(API key)와 **Vertex AI**(GCP credentials) 모두에서 사용할 수 있습니다.

:::info Provider에 따라 응답 형태가 다릅니다

- **Gemini API**(`gemini/...`): 각 입력 요소가 `0..N-1` index로 자체 embedding을 반환합니다. OpenAI의 `/embeddings`와 같은 형태입니다. LiteLLM은 입력마다 하나의 `EmbedContentRequest`를 만들어 [`batchEmbedContents`](https://ai.google.dev/api/embeddings#method:-models.batchembedcontents) 엔드포인트로 라우팅합니다.
- **Vertex AI**(`vertex_ai/...`): 모든 입력 요소가 [`embedContent`](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-embeddings-api)를 통해 하나의 통합 embedding으로 결합됩니다. Vertex AI는 Gemini embedding 모델에 대해 `batchEmbedContents`를 노출하지 않으므로 `N`개 part가 `1`개 vector가 됩니다. 항목별 vector가 필요하면 입력마다 `embedding(...)`을 한 번씩 호출하세요.

:::


{/* truncate */}

## 지원 입력 유형

| 모달리티 | 지원 형식 | 
|----------|-------------------|
| **텍스트** | 일반 텍스트 |
| **이미지** | PNG, JPEG | 
| **오디오** | MP3, WAV | 
| **비디오** | MP4, MOV | 
| **문서** | PDF | 

## 입력 형식

LiteLLM은 멀티모달 콘텐츠에 대해 세 가지 입력 형식을 받습니다.

1. **Data URI** – Base64 인코딩 inline 데이터: `data:image/png;base64,<encoded_data>`
2. **GCS URL** – Cloud Storage 경로(Vertex AI): `gs://bucket/path/to/file.png`
3. **Gemini 파일 참조** – 미리 업로드된 파일(Gemini API): `files/abc123`

## 빠른 시작

<Tabs>
<TabItem value="gemini" label="Gemini API">

```python
from litellm import embedding
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

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

<TabItem value="vertex" label="Vertex AI">

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
print(response)
```

</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy">

**1. Config 설정(config.yaml)**

```yaml
model_list:
  - model_name: gemini-embedding-2-preview
    litellm_params:
      model: gemini/gemini-embedding-2-preview
      api_key: os.environ/GEMINI_API_KEY
  - model_name: vertex-gemini-embedding-2-preview
    litellm_params:
      model: vertex_ai/gemini-embedding-2-preview
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION

general_settings:
  master_key: sk-1234
```

**2. Proxy 시작**

```bash
litellm --config config.yaml
```

**3. 임베딩 호출**

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

## 입력 형식 예제

| 형식 | 예제 | 제공자 |
|--------|---------|----------|
| **Data URI** | `data:image/png;base64,...` | Gemini, Vertex AI |
| **GCS URL** | `gs://bucket/path/image.png` | Vertex AI |
| **파일 참조** | `files/abc123` | Gemini API 전용 |

### Data URI에서 지원되는 MIME Type

- **이미지:** `image/png`, `image/jpeg`
- **오디오:** `audio/mpeg`, `audio/wav`
- **비디오:** `video/mp4`, `video/quicktime`
- **문서:** `application/pdf`

### GCS URL MIME 추론

Vertex AI에서는 파일 확장자로 MIME type을 추론합니다.

- `.png` → `image/png`
- `.jpg` / `.jpeg` → `image/jpeg`
- `.mp3` → `audio/mpeg`
- `.wav` → `audio/wav`
- `.mp4` → `video/mp4`
- `.mov` → `video/quicktime`
- `.pdf` → `application/pdf`

## 선택 파라미터

| 파라미터 | 설명 | 매핑 대상 |
|-----------|-------------|---------|
| `dimensions` | 출력 임베딩 크기 | `outputDimensionality` |

```python
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=["text to embed"],
    dimensions=768,  # Optional: control output vector size
)
```

## 결합 임베딩(`Gemini API`, 선택 사용)

기본적으로 Gemini API 경로는 입력 요소마다 하나의 임베딩을 반환합니다(OpenAI 호환). 여러 모달리티를 **하나의** vector로 결합하려면, 예를 들어 상품명을 사진과 함께 하나의 상품 표현으로 만들려면, nested list로 감싸세요.

```python
from litellm import embedding

# Default: 2 inputs → 2 separate embeddings
embedding(
    model="gemini/gemini-embedding-2-preview",
    input=["a red shoe", "data:image/png;base64,..."],
)

# Combined: text + image fused into 1 embedding
embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."]],
)

# Mixed: 1 combined entity + 1 plain text → 2 embeddings total
embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."], "just text"],
)
```

하나의 entity가 여러 모달리티를 가지는 멀티모달 retrieval에 유용합니다. 자세한 내용은 [임베딩 문서](../../docs/embedding/supported_embedding#combined-multimodal-embeddings)를 참고하세요. Vertex AI에서는 모든 요청이 이미 하나의 결합 vector를 반환하므로 이 opt-in이 필요 없습니다.
