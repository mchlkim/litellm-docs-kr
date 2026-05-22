# Abliteration

## 개요 {#overview}

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Abliteration은 OpenAI 호환 `/chat/completions` 엔드포인트를 제공합니다. |
| LiteLLM의 제공자 경로 | `abliteration/` |
| 제공자 문서 링크 | [Abliteration](https://abliteration.ai) |
| 기본 URL | `https://api.abliteration.ai/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["ABLITERATION_API_KEY"] = ""  # your Abliteration API key
```

## 샘플 사용법 {#sample-usage}

```python showLineNumbers title="Abliteration Completion"
import os
from litellm import completion

os.environ["ABLITERATION_API_KEY"] = ""

response = completion(
    model="abliteration/abliterated-model",
    messages=[{"role": "user", "content": "Hello from LiteLLM"}],
)

print(response)
```

## 샘플 사용법 - Streaming {#sample-usage-streaming}

```python showLineNumbers title="Abliteration Streaming Completion"
import os
from litellm import completion

os.environ["ABLITERATION_API_KEY"] = ""

response = completion(
    model="abliteration/abliterated-model",
    messages=[{"role": "user", "content": "Stream a short reply"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

1. 프록시 설정에 모델을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: abliteration-chat
    litellm_params:
      model: abliteration/abliterated-model
      api_key: os.environ/ABLITERATION_API_KEY
```

2. 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

## Direct API 사용법 (Bearer Token) {#direct-api-usage-bearer-token}

OpenAI 호환 엔드포인트에 대해 환경 변수를 Bearer token으로 사용합니다.
`https://api.abliteration.ai/v1/chat/completions`.

```bash showLineNumbers title="cURL"
export ABLITERATION_API_KEY=""
curl https://api.abliteration.ai/v1/chat/completions \
  -H "Authorization: Bearer ${ABLITERATION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "abliterated-model",
    "messages": [{"role": "user", "content": "Hello from Abliteration"}]
  }'
```

```python showLineNumbers title="Python (requests)"
import os
import requests

api_key = os.environ["ABLITERATION_API_KEY"]

response = requests.post(
    "https://api.abliteration.ai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "abliterated-model",
        "messages": [{"role": "user", "content": "Hello from Abliteration"}],
    },
    timeout=60,
)

print(response.json())
```
