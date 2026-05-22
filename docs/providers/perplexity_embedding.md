import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Perplexity Embeddings`

https://docs.perplexity.ai/docs/embeddings/quickstart

LiteLLM은 웹 스케일 텍스트 검색용 Perplexity `pplx-embed` 임베딩 모델을 지원합니다.

## API 키

```python
# env variable
os.environ['PERPLEXITYAI_API_KEY']
```

## 사용 예시 - Embedding

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""

response = embedding(
    model="perplexity/pplx-embed-v1-0.6b",
    input=["good morning from litellm"],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

1. `config.yaml`을 설정합니다.

```yaml
model_list:
  - model_name: pplx-embed-v1-0.6b
    litellm_params:
      model: perplexity/pplx-embed-v1-0.6b
      api_key: os.environ/PERPLEXITYAI_API_KEY
  - model_name: pplx-embed-v1-4b
    litellm_params:
      model: perplexity/pplx-embed-v1-4b
      api_key: os.environ/PERPLEXITYAI_API_KEY
```

2. proxy를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "pplx-embed-v1-0.6b",
    "input": ["good morning from litellm"]
  }'
```

</TabItem>
</Tabs>

## 지원 파라미터

Perplexity embeddings는 다음 선택 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `dimensions` | int | 출력 임베딩 차원입니다. 0.6b 모델은 128-1024, 4b 모델은 128-2560을 지원합니다. 기본값은 최대 차원입니다. |
| `encoding_format` | string | 압축 출력에 `"base64_int8"`(기본값) 또는 `"base64_binary"`를 사용합니다. |

### 파라미터 사용 예제

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""

response = embedding(
    model="perplexity/pplx-embed-v1-4b",
    input=["Your text here"],
    dimensions=512,
)
print(f"Embedding dimensions: {len(response.data[0]['embedding'])}")
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```bash
curl http://0.0.0.0:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "pplx-embed-v1-4b",
    "input": ["Your text here"],
    "dimensions": 512
  }'
```

</TabItem>
</Tabs>

## 지원 모델

Perplexity Embeddings [문서](https://docs.perplexity.ai/docs/embeddings/quickstart)에 나열된 모든 모델을 지원합니다. `model=perplexity/<model-name>` 형식으로 사용하세요.

| 모델명 | 차원 | 최대 토큰 | 가격(토큰 100만 개당) | 함수 호출 |
|---|---|---|---|---|
| `pplx-embed-v1-0.6b` | 1024 | 32K | $0.004 | `embedding(model="perplexity/pplx-embed-v1-0.6b", input)` |
| pplx-embed-v1-4b | 2560 | 32K | $0.03 | `embedding(model="perplexity/pplx-embed-v1-4b", input)` |

### 주요 사양

- **요청당 최대 텍스트 수:** 512
- **입력당 최대 토큰 수:** 32,768
- **통합 요청 제한:** 120,000 tokens
- **Matryoshka 차원 축소** - 더 빠른 검색과 저장 공간 절감을 위해 차원을 128 이상으로 줄일 수 있습니다.
- **instruction prefix 불필요** - 텍스트를 직접 임베딩합니다.
- **정규화되지 않은 임베딩** - 비교에는 cosine similarity를 사용합니다.
