import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI SDK

Vertex AI용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | `/generateContent` 엔드포인트의 모든 모델을 지원합니다 |
| 로깅 | ✅ | 모든 통합에서 작동합니다 |
| 최종 사용자 추적 | ❌ | [필요한 경우 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| Streaming | ✅ | |

## 지원 엔드포인트

LiteLLM은 3개의 Vertex AI 패스스루 라우트를 지원합니다.

1. `/vertex_ai` → `https://{vertex_location}-aiplatform.googleapis.com/`로 라우팅합니다
2. `/vertex_ai/discovery` → [`https://discoveryengine.googleapis.com`](https://discoveryengine.googleapis.com/)로 라우팅합니다 - [Search Datastores 가이드 보기](./vertex_ai_search_datastores.md)
3. `/vertex_ai/live` → Vertex AI Live API WebSocket(`google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`)으로 업그레이드합니다 - [Live WebSocket 가이드 보기](./vertex_ai_live_websocket.md)

## 사용 방법

`https://REGION-aiplatform.googleapis.com`을 `LITELLM_PROXY_BASE_URL/vertex_ai`로 바꾸기만 하면 됩니다.

LiteLLM은 패스스루로 Vertex AI 엔드포인트를 호출하는 3가지 흐름을 지원합니다.

1. **특정 자격 증명**: 관리자가 특정 프로젝트/리전에 대한 패스스루 자격 증명을 설정합니다.

2. **기본 자격 증명**: 관리자가 기본 자격 증명을 설정합니다.

3. **클라이언트 측 자격 증명**: 사용자가 클라이언트 측 자격 증명을 Vertex AI로 전달할 수 있습니다(기본 동작 - 기본 또는 매핑된 자격 증명이 없으면 요청이 그대로 전달됩니다).


## 예제 사용법

<Tabs>
<TabItem value="specific_credentials" label="특정 프로젝트/리전">

```yaml
model_list:
  - model_name: gemini-1.0-pro
    litellm_params:
      model: vertex_ai/gemini-1.0-pro
      vertex_project: adroit-crow-413218
      vertex_location: us-central1
      vertex_credentials: /path/to/credentials.json
      use_in_pass_through: true # 👈 KEY CHANGE
```

</TabItem>
<TabItem value="default_credentials" label="기본 자격 증명">

<Tabs>
<TabItem value="yaml" label="config.yaml에서 설정">

```yaml
default_vertex_config:
  vertex_project: adroit-crow-413218
  vertex_location: us-central1
  vertex_credentials: /path/to/credentials.json
```
</TabItem>
<TabItem value="env_var" label="환경 변수에서 설정">

```bash
export DEFAULT_VERTEXAI_PROJECT="adroit-crow-413218"
export DEFAULT_VERTEXAI_LOCATION="us-central1"
export DEFAULT_GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

</TabItem>
</Tabs>
</TabItem>
<TabItem value="client_credentials" label="클라이언트 자격 증명">

Gemini 2.0 Flash를 사용해 봅니다(curl).

```
MODEL_ID="gemini-2.0-flash-001"
PROJECT_ID="YOUR_PROJECT_ID"
```

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  "${LITELLM_PROXY_BASE_URL}/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:streamGenerateContent" -d \
  $'{
    "contents": {
      "role": "user",
      "parts": [
        {
        "fileData": {
          "mimeType": "image/png",
          "fileUri": "gs://generativeai-downloads/images/scones.jpg"
          }
        },
        {
          "text": "Describe this picture."
        }
      ]
    }
  }'
```

</TabItem>
</Tabs>


#### **예제 사용법**

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:generateContent \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{
    "contents":[{
      "role": "user", 
      "parts":[{"text": "How are you doing today?"}]
    }]
  }'
```

</TabItem>
<TabItem value="js" label="Vertex Node.js SDK">

```javascript
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
    project: 'your-project-id', // enter your vertex project id
    location: 'us-central1', // enter your vertex region
    apiEndpoint: "localhost:4000/vertex_ai" // <proxy-server-url>/vertex_ai # note, do not include 'https://' in the url
});

const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.0-pro'
}, {
    customHeaders: {
        "x-litellm-api-key": "sk-1234" // Your litellm Virtual Key
    }
});

async function generateContent() {
    try {
        const prompt = {
            contents: [{
                role: 'user',
                parts: [{ text: 'How are you doing today?' }]
            }]
        };

        const response = await model.generateContent(prompt);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

generateContent();
```

</TabItem>
</Tabs>


## Vertex AI Live API WebSocket 사용

이제 LiteLLM은 Vertex AI Live API를 프록시할 수 있으므로, Google 자격 증명을 클라이언트에 노출하지 않고 Gemini Live 모델의 오디오/텍스트 스트리밍을 실험할 수 있습니다.

- `default_vertex_config` 또는 환경 변수로 기본 Vertex 자격 증명을 구성합니다(위 예시 참고).
- `wss://<PROXY_URL>/vertex_ai/live`에 연결합니다. LiteLLM은 저장된 자격 증명을 단기 액세스 토큰으로 교환하고 메시지를 양방향으로 전달합니다.
- 선택적 쿼리 매개변수 `vertex_project`, `vertex_location`, `model`을 사용하면 멀티 프로젝트 설정이나 전역 전용 모델에서 기본값을 재정의할 수 있습니다.

```python title="client.py"
import asyncio
import json

from websockets.asyncio.client import connect


async def main() -> None:
    headers = {
        "x-litellm-api-key": "Bearer sk-your-litellm-key",
        "Content-Type": "application/json",
    }
    async with connect(
        "ws://localhost:4000/vertex_ai/live",
        additional_headers=headers,
    ) as ws:
        await ws.send(
            json.dumps(
                {
                    "setup": {
                        "model": "projects/your-project/locations/us-central1/publishers/google/models/gemini-2.0-flash-live-preview-04-09",
                        "generation_config": {"response_modalities": ["TEXT"]},
                    }
                }
            )
        )

        async for message in ws:
            print("server:", message)


if __name__ == "__main__":
    asyncio.run(main())
```


## 빠른 시작

Vertex AI [`/generateContent` 엔드포인트](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference)를 호출해 보겠습니다.

1. 환경에 Vertex AI 자격 증명을 추가합니다 

```bash
export DEFAULT_VERTEXAI_PROJECT="" # "adroit-crow-413218"
export DEFAULT_VERTEXAI_LOCATION="" # "us-central1"
export DEFAULT_GOOGLE_APPLICATION_CREDENTIALS="" # "/Users/Downloads/adroit-crow-413218-a956eef1a2a8.json"
```

2. LiteLLM Proxy를 시작합니다 

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다! 

Google AI Studio 토큰 계산 엔드포인트를 호출해 보겠습니다.

```bash
curl http://localhost:4000/vertex-ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "contents":[{
      "role": "user",
      "parts":[{"text": "How are you doing today?"}]
    }]
  }'
```



## 지원되는 API 엔드포인트 {#supported-api-endpoints}

- Gemini API
- Embeddings API
- Imagen API
- 코드 완성 API
- 배치 예측 API
- Tuning API
- CountTokens API

#### Vertex AI 인증

LiteLLM Proxy Server는 Vertex AI 인증을 위한 두 가지 방법을 지원합니다.

1. 클라이언트 측 Vertex 자격 증명을 프록시 서버에 전달합니다

2. 프록시 서버에 Vertex AI 자격 증명을 설정합니다


## 사용법 예제

### Gemini API (콘텐츠 생성)



```shell
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:generateContent \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{"contents":[{"role": "user", "parts":[{"text": "hi"}]}]}'
```



### Embeddings API


```shell
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/textembedding-gecko@001:predict \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{"instances":[{"content": "gm"}]}'
```


### Imagen API

```shell
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{"instances":[{"prompt": "make an otter"}], "parameters": {"sampleCount": 1}}'
```


### Count Tokens API

```shell
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:countTokens \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{"contents":[{"role": "user", "parts":[{"text": "hi"}]}]}'
```
### Tuning API 

파인 튜닝 작업을 생성합니다.


```shell
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:tuningJobs \
      -H "Content-Type: application/json" \
      -H "x-litellm-api-key: Bearer sk-1234" \
      -d '{
  "baseModel": "gemini-1.0-pro-002",
  "supervisedTuningSpec" : {
      "training_dataset_uri": "gs://cloud-samples-data/ai-platform/generative_ai/sft_train_data.jsonl"
  }
}'
```

## 고급

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Anthropic API 키를 제공하지 않으면서 Anthropic 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용합니다.

### 가상 키와 함께 사용 

1. 환경을 설정합니다

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""

# vertex ai credentials
export DEFAULT_VERTEXAI_PROJECT="" # "adroit-crow-413218"
export DEFAULT_VERTEXAI_LOCATION="" # "us-central1"
export DEFAULT_GOOGLE_APPLICATION_CREDENTIALS="" # "/Users/Downloads/adroit-crow-413218-a956eef1a2a8.json"
```

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

2. 가상 키를 생성합니다 

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'x-litellm-api-key: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 응답 

```bash
{
    ...
    "key": "sk-1234ewknldferwedojwojw"
}
```

3. 테스트합니다! 


```bash
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -d '{
    "contents":[{
      "role": "user", 
      "parts":[{"text": "How are you doing today?"}]
    }]
  }'
```

### 요청 헤더에 `tags` 보내기

`tags`가 LiteLLM DB와 로깅 콜백에서 추적되도록 하려면 이 방식을 사용합니다.

요청 헤더의 `tags`를 쉼표로 구분된 목록으로 전달합니다. 아래 예시에서는 다음 태그가 추적됩니다.

```
tags: ["vertex-js-sdk", "pass-through-endpoint"]
```

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-1234" \
  -H "tags: vertex-js-sdk,pass-through-endpoint" \
  -d '{
    "contents":[{
      "role": "user", 
      "parts":[{"text": "How are you doing today?"}]
    }]
  }'
```

</TabItem>
<TabItem value="js" label="Vertex Node.js SDK">

```javascript
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
    project: 'your-project-id', // enter your vertex project id
    location: 'us-central1', // enter your vertex region
    apiEndpoint: "localhost:4000/vertex_ai" // <proxy-server-url>/vertex_ai # note, do not include 'https://' in the url
});

const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.0-pro'
}, {
    customHeaders: {
        "x-litellm-api-key": "sk-1234", // Your litellm Virtual Key
        "tags": "vertex-js-sdk,pass-through-endpoint"
    }
});

async function generateContent() {
    try {
        const prompt = {
            contents: [{
                role: 'user',
                parts: [{ text: 'How are you doing today?' }]
            }]
        };

        const response = await model.generateContent(prompt);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

generateContent();
```

</TabItem>
</Tabs>

### Vertex AI에서 Anthropic 베타 기능 사용

Vertex AI 패스스루를 통해 Anthropic 모델을 사용할 때(예: Vertex의 Claude) 확장 컨텍스트 창과 같은 Anthropic 베타 기능을 활성화할 수 있습니다.

Anthropic 모델을 호출하면 `anthropic-beta` 헤더가 Vertex AI로 자동 전달됩니다.

```bash
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-east5/publishers/anthropic/models/claude-3-5-sonnet:rawPredict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -H "anthropic-beta: context-1m-2025-08-07" \
  -d '{
    "anthropic_version": "vertex-2023-10-16",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 500
  }'
```

### `x-pass-` 접두사로 커스텀 헤더 전달

커스텀 헤더 앞에 `x-pass-`를 붙이면 해당 헤더를 공급자에게 전달할 수 있습니다. 공급자에게 헤더를 보내기 전에 이 접두사는 제거됩니다.

예:
- `x-pass-anthropic-beta: value`는 `anthropic-beta: value`가 됩니다
- `x-pass-custom-header: value`는 `custom-header: value`가 됩니다

기본 허용 목록에 없는 공급자별 헤더를 보내야 할 때 유용합니다.

```bash
curl http://localhost:4000/vertex_ai/v1/projects/${PROJECT_ID}/locations/us-east5/publishers/anthropic/models/claude-3-5-sonnet:rawPredict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -H "x-pass-anthropic-beta: context-1m-2025-08-07" \
  -H "x-pass-custom-feature: enabled" \
  -d '{
    "anthropic_version": "vertex-2023-10-16",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 500
  }'
```

:::info
`x-pass-` 접두사는 Vertex AI뿐 아니라 모든 LLM 패스스루 엔드포인트에서 작동합니다.
:::
