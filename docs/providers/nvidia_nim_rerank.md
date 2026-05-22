import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Nvidia NIM` 재순위화 {#nvidia-nim-rerank}

LiteLLM을 통해 Nvidia NIM Rerank 모델을 사용합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Nvidia NIM은 시맨틱 검색과 retrieval-augmented generation (RAG)을 위한 고성능 rerank 모델을 제공합니다 |
| 프로바이더 문서 | [Nvidia NIM Rerank API ↗](https://docs.api.nvidia.com/nim/reference/nvidia-llama-3_2-nv-rerankqa-1b-v2-infer) |
| 지원 엔드포인트 | `/rerank` |

## 개요

Nvidia NIM rerank 모델은 다음 작업에 도움이 됩니다.
- 쿼리 관련도에 따라 검색 결과를 다시 정렬
- RAG (Retrieval-Augmented Generation) 정확도 향상
- 대규모 문서 세트를 효율적으로 필터링하고 순위화

**지원 모델:**
- Nvidia NIM 플랫폼의 모든 rerank 모델

:::tip

LiteLLM이 지원하는 Nvidia NIM rerank 모델의 전체 목록은 [Nvidia NIM](https://models.litellm.ai)에서 확인하세요.

:::

## 사용법

### LiteLLM Python SDK

<Tabs>
<TabItem value="llama-1b" label="LLaMa 1B 모델">

```python
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="What is the GPU memory bandwidth of H100 SXM?",
    documents=[
        "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth.",
        "A100 provides up to 20X higher performance over the prior generation.",
        "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
    ],
    top_n=3,
)

print(response)
```

</TabItem>
<TabItem value="mistral-4b" label="Mistral 4B 모델">

```python
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

response = litellm.rerank(
    model="nvidia_nim/nvidia/nv-rerankqa-mistral-4b-v3",
    query="What is the GPU memory bandwidth of H100 SXM?",
    documents=[
        "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth.",
        "A100 provides up to 20X higher performance over the prior generation.",
        "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
    ],
    top_n=3,
)

print(response)
```

</TabItem>
</Tabs>

**응답:**
```json
{
    "results": [
        {
            "index": 2,
            "relevance_score": 6.828125,
            "document": {
                "text": "Accelerated servers with H100 deliver 3 terabytes per second (TB/s) of memory bandwidth per GPU."
            }
        },
        {
            "index": 0,
            "relevance_score": -1.564453125,
            "document": {
                "text": "The Hopper GPU is paired with the Grace CPU using NVIDIA's ultra-fast chip-to-chip interconnect, delivering 900GB/s of bandwidth."
            }
        }
    ]
}
```


## LiteLLM Proxy 사용법 {#usage-with-litellm-proxy}

### 1. Config 설정 {#1-setup-config}

Proxy 설정에 Nvidia NIM rerank 모델을 추가합니다.

```yaml
model_list:
  - model_name: nvidia-rerank
    litellm_params:
      model: nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2
      api_key: os.environ/NVIDIA_NIM_API_KEY
```

### 2. Proxy 시작 {#2-start-proxy}

```bash
litellm --config /path/to/config.yaml
```

### 3. Rerank 요청 보내기 {#3-make-rerank-requests}

```bash
curl -X POST http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia-rerank",
    "query": "What is the GPU memory bandwidth of H100?",
    "documents": [
      "H100 delivers 3TB/s memory bandwidth",
      "A100 has 2TB/s memory bandwidth",
      "V100 offers 900GB/s memory bandwidth"
    ],
    "top_n": 2
  }'
```

## `/v1/ranking` 모델 (llama-3.2-nv-rerankqa-1b-v2)

일부 Nvidia NIM rerank 모델은 기본 `/v1/retrieval/{model}/reranking` 엔드포인트 대신 `/v1/ranking` 엔드포인트를 사용합니다.

요청을 `/v1/ranking` 엔드포인트로 강제하려면 `ranking/` prefix를 사용합니다.

### LiteLLM Python SDK

```python showLineNumbers title="Force /v1/ranking endpoint with ranking/ prefix"
import litellm
import os

os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

# Use "ranking/" prefix to force /v1/ranking endpoint
response = litellm.rerank(
    model="nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2",
    query="which way did the traveler go?",
    documents=[
        "two roads diverged in a yellow wood...",
        "then took the other, as just as fair...",
        "i shall be telling this with a sigh somewhere ages and ages hence..."
    ],
    top_n=3,
    truncate="END",  # Optional: truncate long text from the end
)

print(response)
```

### `LiteLLM Proxy`

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: nvidia-ranking
    litellm_params:
      model: nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2
      api_key: os.environ/NVIDIA_NIM_API_KEY
```

```bash title="Request to LiteLLM Proxy"
curl -X POST http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia-ranking",
    "query": "which way did the traveler go?",
    "documents": [
      "two roads diverged in a yellow wood...",
      "then took the other, as just as fair..."
    ],
    "top_n": 2
  }'
```

### 모델 해석 방식 이해 {#understanding-model-resolution}

**Ranking Endpoint (`/v1/ranking`):**

```
model: nvidia_nim/ranking/nvidia/llama-3.2-nv-rerankqa-1b-v2
       └────┬────┘ └──┬──┘ └─────────────┬──────────────────┘
            │        │                   │
            │        │                   └────▶ Model name sent to provider
            │        │
            │        └────────────────────────▶ Tells LiteLLM the request/response and url should be sent to Nvidia NIM /v1/ranking endpoint
            │
            └─────────────────────────────────▶ Provider prefix

API URL: https://ai.api.nvidia.com/v1/ranking
```

**시각적 흐름:**

```
Client Request                LiteLLM                              Provider API
──────────────              ────────────                         ─────────────

# Default reranking endpoint
model: "nvidia_nim/nvidia/model-name"
                            1. Extracts model: nvidia/model-name
                            2. Routes to default endpoint ──────▶ POST /v1/retrieval/nvidia/model-name/reranking


# Forced ranking endpoint  
model: "nvidia_nim/ranking/nvidia/model-name"
                            1. Detects "ranking/" prefix
                            2. Extracts model: nvidia/model-name
                            3. Routes to ranking endpoint ──────▶ POST /v1/ranking
                                                                  Body: {"model": "nvidia/model-name", ...}
```

**각 엔드포인트를 사용할 때:**

| 엔드포인트 | 모델 Prefix | 사용 사례 |
|----------|--------------|----------|
| `/v1/retrieval/{model}/reranking` | `nvidia_nim/<model>` | 대부분의 rerank 모델에 대한 기본값 |
| `/v1/ranking` | `nvidia_nim/ranking/<model>` | 이 엔드포인트가 필요한 `nvidia/llama-3.2-nv-rerankqa-1b-v2` 같은 모델용 |

:::tip

모델에 필요한 엔드포인트는 [Nvidia NIM 모델 배포 페이지](https://build.nvidia.com/nvidia/llama-3_2-nv-rerankqa-1b-v2/deploy)에서 확인하세요.

:::

## API 매개변수 {#api-parameters}

### 필수 매개변수 {#required-parameters}

| 매개변수 | Type | 설명 |
|-----------|------|-------------|
| `model` | string | `nvidia_nim/` prefix가 붙은 Nvidia NIM rerank 모델 이름 |
| `query` | string | 문서 순위를 매길 기준 검색 쿼리 |
| `documents` | array | 순위를 매길 문서 목록(문서 1-1000개) |

### 선택 매개변수 {#optional-parameters}

| 매개변수 | Type | Default | 설명 |
|-----------|------|---------|-------------|
| `top_n` | integer | 모든 문서 | 반환할 상위 순위 문서 수 |

### Nvidia 전용 매개변수 {#nvidia-specific-parameters}

**`truncate`**: 텍스트가 모델의 context window를 초과할 때 잘라내는 방식을 제어합니다.
- `"NONE"`: 잘라내지 않음(너무 길면 요청이 실패할 수 있음)
- `"END"`: 텍스트 끝부분부터 잘라냄

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="GPU performance",
    documents=["High performance computing", "Fast GPU processing"],
    top_n=2,
    truncate="END",  # Nvidia-specific parameter
)
```

## 인증

Nvidia NIM API key를 설정합니다.

<Tabs>
<TabItem value="env" label="환경 변수">

```bash
export NVIDIA_NIM_API_KEY="nvapi-..."
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
os.environ['NVIDIA_NIM_API_KEY'] = "nvapi-..."

# Or pass directly
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_key="nvapi-...",
)
```

</TabItem>
</Tabs>

## 사용자 지정 API Base URL {#custom-api-base-url}

다음 여러 방식으로 기본 base URL을 재정의할 수 있습니다.

**옵션 1: 환경 변수**

```bash
export NVIDIA_NIM_API_BASE="https://your-custom-endpoint.com"
```

**옵션 2: 매개변수로 전달**

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_base="https://your-custom-endpoint.com",
)
```

**옵션 3: 전체 URL(모델 경로 포함)**

전체 엔드포인트 URL이 있다면 직접 전달할 수 있습니다.

```python
response = litellm.rerank(
    model="nvidia_nim/nvidia/llama-3_2-nv-rerankqa-1b-v2",
    query="test",
    documents=["doc1"],
    api_base="https://your-custom-endpoint.com/v1/retrieval/nvidia/llama-3_2-nv-rerankqa-1b-v2/reranking",
)
```

LiteLLM은 전체 URL을 감지하고(경로의 `/retrieval/` 확인) 그대로 사용합니다.

### API key는 어떻게 받나요? {#how-do-i-get-an-api-key}

[Nvidia 웹사이트](https://developer.nvidia.com/nim/)에서 Nvidia NIM API key를 받을 수 있습니다.

## 관련 문서

- [Nvidia NIM - 메인 문서](./nvidia_nim)
- [`Nvidia NIM` 채팅 완료](./nvidia_nim#sample-usage)
- [LiteLLM Rerank 엔드포인트](../rerank)
- [Nvidia NIM Official 문서 ↗](https://docs.api.nvidia.com/nim/reference/)
