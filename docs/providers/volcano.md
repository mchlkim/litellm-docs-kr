# `Volcano Engine (Volcengine)`
https://www.volcengine.com/docs/82379/1263482

:::tip

**LiteLLM 요청을 보낼 때 `model=volcengine/<any-model-on-volcengine>` 접두사를 설정하면 채팅과 임베딩을 포함한 모든 Volcengine 모델을 지원합니다.**

:::

## API 키 {#api-key}
```python
# env variable
os.environ['VOLCENGINE_API_KEY']
# or
os.environ['ARK_API_KEY']
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = completion(
    model="volcengine/<OUR_ENDPOINT_ID>",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = completion(
    model="volcengine/<OUR_ENDPOINT_ID>",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    temperature=0.2,        # optional
    top_p=0.9,              # optional
    frequency_penalty=0.1,  # optional
    presence_penalty=0.1,   # optional
    max_tokens=10,          # optional
    stop=["\n\n"],          # optional
)

for chunk in response:
    print(chunk)
```

## 샘플 사용법 - 임베딩 {#sample-usage---embedding}
```python
from litellm import embedding
import os

os.environ['VOLCENGINE_API_KEY'] = ""
response = embedding(
    model="volcengine/doubao-embedding-text-240715",
    input=["hello world", "good morning"]
)
print(response)
```

### 지원되는 임베딩 모델 {#supported-embedding-models}
- `doubao-embedding-large`(2048차원)
- `doubao-embedding-large-text-250515`(2048차원)
- `doubao-embedding-large-text-240915`(4096차원)
- `doubao-embedding`(2560차원) 
- `doubao-embedding-text-240715`(2560차원)

### 임베딩 파라미터 {#embedding-parameters}
```python
from litellm import embedding

response = embedding(
    model="volcengine/doubao-embedding-text-240715",
    input=["sample text"],
    encoding_format="float",  # optional: "float" (default), "base64"
    user="user-123",          # optional: user identifier for tracking
)
```

## 지원되는 모델 - 모든 `Volcengine` 모델 지원 {#supported-models}
채팅 completion과 임베딩 모두에서 모든 `volcengine` 모델을 지원합니다.
- **채팅 모델**: completion 요청을 보낼 때 `volcengine/<OUR_ENDPOINT_ID>`를 접두사로 설정합니다.
- **임베딩 모델**: 위에 나열된 특정 모델명을 사용합니다. 예: `volcengine/doubao-embedding-text-240715`

## 샘플 사용법 - LiteLLM Proxy {#sample-usage---litellm-proxy}

### Config.yaml 설정 {#configyaml-setting}

```yaml
model_list:
  # Chat model
  - model_name: volcengine-model
    litellm_params:
      model: volcengine/<OUR_ENDPOINT_ID>
      api_key: os.environ/VOLCENGINE_API_KEY
  # Embedding model
  - model_name: volcengine-embedding
    litellm_params:
      model: volcengine/doubao-embedding-text-240715
      api_key: os.environ/VOLCENGINE_API_KEY
```

### 요청 보내기 {#send-request}

#### Chat Completion {#chat-completion}
```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "volcengine-model",
    "messages": [
        {
        "role": "user",
        "content": "here is my api key. openai_api_key=sk-1234"
        }
    ]
}'
```

#### Embedding
```shell
curl --location 'http://localhost:4000/embeddings' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "volcengine-embedding",
    "input": ["hello world", "good morning"]
}'
```
