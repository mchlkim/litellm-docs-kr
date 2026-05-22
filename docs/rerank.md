# /rerank

:::tip

LiteLLM은 [rerank api용 cohere api request / response](https://cohere.com/rerank)를 따릅니다.

:::

## 개요

| 기능 | 지원 여부                                                                                           | 참고 |
|---------|-----------------------------------------------------------------------------------------------------|-------|
| Cost Tracking | ✅                                                                                                   | 지원되는 모든 model에서 동작 |
| Logging | ✅                                                                                                   | 모든 integration에서 동작 |
| End-user Tracking | ✅                                                                                                   | |
| Fallbacks | ✅                                                                                                   | 지원되는 model 간에 동작 |
| Loadbalancing | ✅                                                                                                   | 지원되는 model 간에 동작 |
| 가드레일 | ✅                                                                                                   | input query에만 적용(documents에는 미적용) |
| 지원 프로바이더 | Cohere, Together AI, Azure AI, DeepInfra, Nvidia NIM, Infinity, Fireworks AI, Voyage AI, watsonx.ai | |

## **LiteLLM Python SDK 사용법**
### 빠른 시작 

```python
from litellm import rerank
import os

os.environ["COHERE_API_KEY"] = "sk-.."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="cohere/rerank-english-v3.0",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```

### Async 사용법 

```python
from litellm import arerank
import os, asyncio

os.environ["COHERE_API_KEY"] = "sk-.."

async def test_async_rerank(): 
    query = "What is the capital of the United States?"
    documents = [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country.",
    ]

    response = await arerank(
        model="cohere/rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=3,
    )
    print(response)

asyncio.run(test_async_rerank())
```

## **LiteLLM Proxy 사용법**

LiteLLM은 Rerank 호출을 위해 cohere api와 호환되는 `/rerank` endpoint를 제공합니다.

**설정**

다음을 `litellm` proxy `config.yaml`에 추가합니다.

```yaml
model_list:
  - model_name: Salesforce/Llama-Rank-V1
    litellm_params:
      model: together_ai/Salesforce/Llama-Rank-V1
      api_key: os.environ/TOGETHERAI_API_KEY
  - model_name: rerank-english-v3.0
    litellm_params:
      model: cohere/rerank-english-v3.0
      api_key: os.environ/COHERE_API_KEY
```

`litellm`을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

요청을 테스트합니다.

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

## **지원 프로바이더**

#### ⚡️지원되는 모든 model과 provider는 [models.litellm.ai](https://models.litellm.ai/)에서 확인하세요.

| Provider                 | 사용법 링크                                        |
|--------------------------|------------------------------------------------------|
| Cohere (v1 + v2 clients) | [사용법](#quick-start)                                |
| Together AI              | [사용법](../docs/providers/togetherai)                |  
| Azure AI                 | [사용법](../docs/providers/azure_ai#rerank-endpoint)  |  
| Jina AI                  | [사용법](../docs/providers/jina_ai)                   |  
| AWS Bedrock              | [사용법](../docs/providers/bedrock#rerank-api)        |  
| HuggingFace              | [사용법](../docs/providers/huggingface_rerank)        |  
| Infinity                 | [사용법](../docs/providers/infinity)                  |  
| vLLM                     | [사용법](../docs/providers/vllm#rerank-endpoint)      |  
| DeepInfra                | [사용법](../docs/providers/deepinfra#rerank-endpoint) |
| Vertex AI                | [사용법](../docs/providers/vertex#rerank-api)         |
| Fireworks AI             | [사용법](../docs/providers/fireworks_ai#rerank-endpoint) |
| Voyage AI                | [사용법](../docs/providers/voyage#rerank)             |  
| IBM watsonx.ai           | [사용법](../docs/providers/watsonx/rerank)            |  
