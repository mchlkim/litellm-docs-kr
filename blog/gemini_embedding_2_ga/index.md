---
slug: gemini_embedding_2_ga
title: "Gemini Embedding 2(GA): LiteLLM의 멀티모달 임베딩"
date: 2026-04-24T10:00:00
authors:
  - sameer
description: "Gemini API와 Vertex AI를 통해 LiteLLM에서 GA 모델인 gemini-embedding-2로 멀티모달 임베딩을 사용하는 방법입니다. Preview와 같은 흐름을 사용하되 안정화된 모델 ID를 사용합니다."
tags: [gemini, embeddings, multimodal, vertex ai]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini Embedding 2(GA): 멀티모달 임베딩

LiteLLM은 이제 Gemini Embedding 2 GA를 완전히 지원합니다.

:::info
엔드투엔드 동작, 입력 형태, MIME type은 [Gemini Embedding 2 Preview 안내](/litellm-docs-kr/blog/gemini_embedding_2_multimodal)를 참고하세요. 이 글은 **GA 이름 체계**와 **비용 맵** 적용 범위에 집중합니다.
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
    model="gemini/gemini-embedding-2",
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
    model="vertex_ai/gemini-embedding-2",
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
  - model_name: gemini-embedding-2
    litellm_params:
      model: gemini/gemini-embedding-2
      api_key: os.environ/GEMINI_API_KEY
  - model_name: vertex-gemini-embedding-2
    litellm_params:
      model: vertex_ai/gemini-embedding-2
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: global

general_settings:
  master_key: sk-1234
```

**2. Proxy 시작**

```bash
litellm --config config.yaml
```

**3. 임베딩 호출**(Proxy의 OpenAI 호환 **`POST /v1/embeddings`**)

```bash
curl -sS -X POST http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2",
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
    model="gemini/gemini-embedding-2",
    input=["text to embed"],
    dimensions=768,  # Optional: control output vector size
)
```
