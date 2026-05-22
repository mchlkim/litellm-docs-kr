import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DeepInfra
https://deepinfra.com/

:::tip

**모든 DeepInfra 모델을 지원합니다. litellm 요청을 보낼 때 `model=deepinfra/<any-model-on-deepinfra>`를 접두사로 설정하면 됩니다.**

:::

## 목차 {#table-of-contents}

- [API 키](#api-key)
- [채팅 모델](#chat-models)
- [Rerank 엔드포인트](#rerank-endpoint)

## API 키 {#api-key}
```python
# env variable
os.environ['DEEPINFRA_API_KEY']
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['DEEPINFRA_API_KEY'] = ""
response = completion(
    model="deepinfra/meta-llama/Llama-2-70b-chat-hf", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```

## 샘플 사용법 - 스트리밍 {#sample-usage-streaming}
```python
from litellm import completion
import os

os.environ['DEEPINFRA_API_KEY'] = ""
response = completion(
    model="deepinfra/meta-llama/Llama-2-70b-chat-hf", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 채팅 모델 {#chat-models}
| 모델 이름       | 함수 호출                        |
|------------------|--------------------------------------|
| `meta-llama/Meta-Llama-3-8B-Instruct`  | `completion(model="deepinfra/meta-llama/Meta-Llama-3-8B-Instruct", messages)` | 
| `meta-llama/Meta-Llama-3-70B-Instruct`  | `completion(model="deepinfra/meta-llama/Meta-Llama-3-70B-Instruct", messages)` | 
| `meta-llama/Llama-2-70b-chat-hf`  | `completion(model="deepinfra/meta-llama/Llama-2-70b-chat-hf", messages)` | 
| `meta-llama/Llama-2-7b-chat-hf`  | `completion(model="deepinfra/meta-llama/Llama-2-7b-chat-hf", messages)` | 
| `meta-llama/Llama-2-13b-chat-hf` | `completion(model="deepinfra/meta-llama/Llama-2-13b-chat-hf", messages)` | 
| `codellama/CodeLlama-34b-Instruct-hf` | `completion(model="deepinfra/codellama/CodeLlama-34b-Instruct-hf", messages)` |
| `mistralai/Mistral-7B-Instruct-v0.1` | `completion(model="deepinfra/mistralai/Mistral-7B-Instruct-v0.1", messages)` | 
| `jondurbin/airoboros-l2-70b-gpt4-1.4.1` | `completion(model="deepinfra/jondurbin/airoboros-l2-70b-gpt4-1.4.1", messages)` |

## Rerank 엔드포인트 {#rerank-endpoint}

LiteLLM은 DeepInfra rerank 모델을 위한 Cohere API 호환 `/rerank` 엔드포인트를 제공합니다.

### 지원되는 Rerank 모델 {#supported-rerank-models}

| 모델 이름 | 설명 |
|------------|-------------|
| `deepinfra/Qwen/Qwen3-Reranker-0.6B` | 경량 rerank 모델(0.6B 파라미터) |
| `deepinfra/Qwen/Qwen3-Reranker-4B` | 중간 규모 rerank 모델(4B 파라미터) |
| `deepinfra/Qwen/Qwen3-Reranker-8B` | 대규모 rerank 모델(8B 파라미터) |

### 사용법 - LiteLLM Python SDK {#usage-litellm-python-sdk}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["DEEPINFRA_API_KEY"] = "your-api-key"

response = rerank(
    model="deepinfra/Qwen/Qwen3-Reranker-0.6B",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ]
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 추가합니다.
```yaml
model_list:
  - model_name: Qwen/Qwen3-Reranker-0.6B
    litellm_params:
      model: deepinfra/Qwen/Qwen3-Reranker-0.6B
      api_key: os.environ/DEEPINFRA_API_KEY
```

2. 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000/
```

3. 테스트합니다.

```bash 
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "model": "Qwen/Qwen3-Reranker-0.6B",
    "query": "What is the capital of France?",
    "documents": [
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ]
}'
```

</TabItem>
</Tabs>

### 지원되는 Cohere Rerank API 파라미터 {#supported-cohere-rerank-api-params}

| 파라미터              | 타입        | 설명                                     |
| ------------------ | ----------- | ----------------------------------------------- |
| `query`            | `str`       | 문서를 rerank할 기준 쿼리       |
| `documents`        | `list[str]` | rerank할 문서                         |


### 제공자별 파라미터 {#provider-specific-parameters}
DeepInfra 전용 파라미터가 있으면 rerank 함수에 키워드 인수로 전달합니다. 예:

```
response = rerank(
    model="deepinfra/Qwen/Qwen3-Reranker-0.6B",
    query="What is the capital of France?",
    documents=[
        "Paris is the capital of France.",
        "London is the capital of the United Kingdom.",
        "Berlin is the capital of Germany.",
        "Madrid is the capital of Spain.",
        "Rome is the capital of Italy."
    ],
    my_custom_param="my_custom_value", # any other deepinfra specific parameters
)
```

### 응답 형식 {#response-format}

```json
{
  "id": "request-id",
  "results": [
    {
      "index": 0,
      "relevance_score": 0.9975274205207825
    },
    {
      "index": 1,
      "relevance_score": 0.011687257327139378
    }
  ],
  "meta": {
    "billed_units": {
      "total_tokens": 427
    },
    "tokens": {
      "input_tokens": 427,
      "output_tokens": 0
    }
  }
}
```
