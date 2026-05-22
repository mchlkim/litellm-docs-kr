import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GigaChat
https://developers.sber.ru/docs/ru/gigachat/api/overview

GigaChat은 러시아의 주요 LLM 제공업체인 Sber AI의 대규모 언어 모델입니다.

:::tip

**모든 GigaChat 모델을 지원합니다. litellm 요청을 보낼 때 `model=gigachat/<any-model-on-gigachat>` 접두사를 설정하기만 하면 됩니다.**

:::

:::warning

GigaChat API는 자체 서명 SSL 인증서를 사용합니다. 요청에 `ssl_verify=False`를 전달해야 합니다.

:::

## 지원 기능

| 기능 | 지원 여부 |
|---------|-----------|
| Chat Completion | 예 |
| Streaming | 예 |
| Async | 예 |
| Function Calling / Tools | 예 |
| Structured Output (JSON Schema) | 예(function call 에뮬레이션 사용) |
| Image Input | 예(base64 및 URL) - GigaChat-2-Max, GigaChat-2-Pro만 해당 |
| Embeddings | 예 |

## API 키

GigaChat은 OAuth 인증을 사용합니다. 자격 증명을 환경 변수로 설정하세요.

```python
import os

# Required: Set credentials (base64-encoded client_id:client_secret)
os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

# Optional: Set scope (default is GIGACHAT_API_PERS for personal use)
os.environ['GIGACHAT_SCOPE'] = "GIGACHAT_API_PERS"  # or GIGACHAT_API_B2B for business
```

자격 증명은 https://developers.sber.ru/studio/ 에서 받을 수 있습니다.

## 샘플 사용법

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 샘플 사용법 - Streaming

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
    stream=True,
    ssl_verify=False,  # Required for GigaChat
)

for chunk in response:
    print(chunk)
```

## 샘플 사용법 - Function Calling

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
        }
    }
}]

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[{"role": "user", "content": "What's the weather in Moscow?"}],
    tools=tools,
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 샘플 사용법 - Structured Output

GigaChat은 JSON schema를 통한 구조화된 출력을 지원합니다(function calling으로 에뮬레이션됨).

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",
    messages=[{"role": "user", "content": "Extract info: John is 30 years old"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                }
            }
        }
    },
    ssl_verify=False,  # Required for GigaChat
)
print(response)  # Returns JSON: {"name": "John", "age": 30}
```

## 샘플 사용법 - Image Input

GigaChat은 base64 또는 URL을 통한 이미지 입력을 지원합니다(GigaChat-2-Max 및 GigaChat-2-Pro만 해당).

```python
from litellm import completion
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = completion(
    model="gigachat/GigaChat-2-Max",  # Vision requires GigaChat-2-Max or GigaChat-2-Pro
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## 샘플 사용법 - Embeddings

```python
from litellm import embedding
import os

os.environ['GIGACHAT_CREDENTIALS'] = "your-credentials-here"

response = embedding(
    model="gigachat/Embeddings",
    input=["Hello world", "How are you?"],
    ssl_verify=False,  # Required for GigaChat
)
print(response)
```

## LiteLLM Proxy 사용법

### 1. config.yaml에 GigaChat 모델 설정

```yaml
model_list:
  - model_name: gigachat
    litellm_params:
      model: gigachat/GigaChat-2-Max
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
  - model_name: gigachat-lite
    litellm_params:
      model: gigachat/GigaChat-2-Lite
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
  - model_name: gigachat-embeddings
    litellm_params:
      model: gigachat/Embeddings
      api_key: "os.environ/GIGACHAT_CREDENTIALS"
      ssl_verify: false
```

### 2. Proxy 시작

```bash
litellm --config config.yaml
```

### 3. 테스트

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "gigachat",
    "messages": [
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
}'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gigachat",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response)
```
</TabItem>
</Tabs>

## 지원 모델

### Chat 모델

| 모델 이름 | 컨텍스트 창 | Vision | 설명 |
|------------|----------------|--------|-------------|
| gigachat/GigaChat-2-Lite | 128K | 아니요 | 빠르고 가벼운 모델 |
| gigachat/GigaChat-2-Pro | 128K | 예 | Vision을 지원하는 전문가용 모델 |
| gigachat/GigaChat-2-Max | 128K | 예 | 최대 성능 모델 |

### Embedding 모델

| 모델 이름 | 최대 입력 | 차원 | 설명 |
|------------|-----------|------------|-------------|
| gigachat/Embeddings | 512 | 1024 | 표준 embeddings |
| gigachat/Embeddings-2 | 512 | 1024 | 업데이트된 embeddings |
| gigachat/EmbeddingsGigaR | 4096 | 2560 | 고차원 embeddings |

:::note
사용 가능한 모델은 API 액세스 수준(개인 또는 비즈니스)에 따라 달라질 수 있습니다.
:::

## 제한 사항

- 요청당 function call은 하나만 사용할 수 있습니다(GigaChat API 제한).
- 메시지당 이미지는 최대 1개, 대화당 총 10개까지 사용할 수 있습니다.
- GigaChat API는 자체 서명 SSL 인증서를 사용하므로 `ssl_verify=False`가 필요합니다.
