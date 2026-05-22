import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI - 자체 배포 모델 {#vertex-ai-self-deployed-model}

Model Garden 또는 사용자 지정 엔드포인트를 통해 Vertex AI에 자체 모델을 배포하고 사용할 수 있습니다.

## Model Garden

:::tip

Vertex Model Garden의 모든 OpenAI compatible 모델을 지원합니다.

:::

### Model Garden 사용하기 {#using-model-garden}

**대부분의 Vertex Model Garden 모델은 OpenAI compatible 형식입니다.**

<Tabs>

<TabItem value="openai" label="OpenAI Compatible 모델">

| 속성 | 세부 정보 |
|----------|---------|
| Provider route | `vertex_ai/openai/{MODEL_ID}` |
| Vertex 문서 | [Model Garden LiteLLM Inference](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/open-models/use-cases/model_garden_litellm_inference.ipynb), [Vertex Model Garden](https://cloud.google.com/model-garden?hl=en) |
| 지원 작업 | `/chat/completions`, `/embeddings` |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/openai/<your-endpoint-id>", 
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. config에 추가**

```yaml
model_list:
    - model_name: llama3-1-8b-instruct
      litellm_params:
        model: vertex_ai/openai/5464397967697903616
        vertex_ai_project: "my-test-project"
        vertex_ai_location: "us-east-1"
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "llama3-1-8b-instruct", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```




</TabItem>

</Tabs>

</TabItem>

<TabItem value="non-openai" label="Non-OpenAI Compatible 모델">

```python
from litellm import completion
import os

## set ENV variables
os.environ["VERTEXAI_PROJECT"] = "hardy-device-38811"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/<your-endpoint-id>", 
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>

</Tabs>

## Gemma 모델 (Custom Endpoints)

OpenAI-compatible 형식으로 사용자 지정 Vertex AI prediction endpoint에 Gemma 모델을 배포할 수 있습니다.

| 속성 | 세부 정보 |
|----------|---------|
| Provider route | `vertex_ai/gemma/{MODEL_NAME}` |
| Vertex 문서 | [Vertex AI Prediction](https://cloud.google.com/vertex-ai/docs/predictions/get-predictions) |
| 필수 파라미터 | `api_base` - 전체 prediction endpoint URL |

**Proxy 사용법:**

**1. config.yaml에 추가**

```yaml
model_list:
  - model_name: gemma-model
    litellm_params:
      model: vertex_ai/gemma/gemma-3-12b-it-1222199011122
      api_base: https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gemma-model",
    "messages": [{"role": "user", "content": "What is machine learning?"}],
    "max_tokens": 100
  }'
```

**SDK 사용법:**

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemma/gemma-3-12b-it-1222199011122",
    messages=[{"role": "user", "content": "What is machine learning?"}],
    api_base="https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict",
    vertex_project="my-project-id",
    vertex_location="us-central1",
)
```

## MedGemma 모델 (Custom Endpoints)

OpenAI-compatible 형식으로 사용자 지정 Vertex AI prediction endpoint에 MedGemma 모델을 배포할 수 있습니다. MedGemma 모델은 동일한 `vertex_ai/gemma/` route를 사용합니다.

| 속성 | 세부 정보 |
|----------|---------|
| Provider route | `vertex_ai/gemma/{MODEL_NAME}` |
| Vertex 문서 | [Vertex AI Prediction](https://cloud.google.com/vertex-ai/docs/predictions/get-predictions) |
| 필수 파라미터 | `api_base` - 전체 prediction endpoint URL |

**Proxy 사용법:**

**1. config.yaml에 추가**

```yaml
model_list:
  - model_name: medgemma-model
    litellm_params:
      model: vertex_ai/gemma/medgemma-2b-v1
      api_base: https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict
      vertex_project: "my-project-id"
      vertex_location: "us-central1"
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "medgemma-model",
    "messages": [{"role": "user", "content": "What are the symptoms of hypertension?"}],
    "max_tokens": 100
  }'
```

**SDK 사용법:**

```python
from litellm import completion

response = completion(
    model="vertex_ai/gemma/medgemma-2b-v1",
    messages=[{"role": "user", "content": "What are the symptoms of hypertension?"}],
    api_base="https://ENDPOINT.us-central1-PROJECT.prediction.vertexai.goog/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict",
    vertex_project="my-project-id",
    vertex_location="us-central1",
)
```
