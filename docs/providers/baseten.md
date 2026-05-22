import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Baseten

LiteLLM은 Baseten Model API와 전용 배포를 모두 지원하며 자동 라우팅을 제공합니다.

## API 유형 {#api-types}

### Model API (기본값) {#model-api-default}
- **URL**: `https://inference.baseten.co/v1`
- **형식**: `baseten/<model-name>` (예: `baseten/openai/gpt-oss-120b`)
- **적합한 용도**: 인기 모델에 빠르게 접근

### 전용 배포 {#dedicated-deployments}
- **URL**: `https://model-{id}.api.baseten.co/environments/production/sync/v1`
- **형식**: `baseten/{8-digit-alphanumeric-code}` (예: `baseten/abcd1234`)
- **적합한 용도**: 커스텀 모델, 지연 시간 SLA

:::tip
**자동 라우팅**: LiteLLM은 모델 형식을 기준으로 유형을 감지합니다.
- 8자리 영숫자 코드 -> 전용 배포
- 그 외 모든 형식 -> Model API
:::


## 빠른 시작

```python
import os
from litellm import completion

os.environ['BASETEN_API_KEY'] = "your-api-key"

# Model API (default)
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Dedicated deployment (8-digit ID)
response = completion(
    model="baseten/abcd1234",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## 예제

### 기본 사용법 {#basic-usage}
```python
# Model API
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    max_tokens=500,
    temperature=0.7
)

# Dedicated deployment
response = completion(
    model="baseten/abcd1234",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    max_tokens=500,
    temperature=0.7
)
```

### 스트리밍 (Model API 전용) {#streaming-model-api-only}
```python
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Write a poem"}],
    stream=True,
    stream_options={"include_usage": True}
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## LiteLLM Proxy와 함께 사용하기 {#usage-with-litellm-proxy}

1. **구성**:
```yaml
model_list:
  - model_name: baseten-model
    litellm_params:
      model: baseten/openai/gpt-oss-120b
      api_key: your-baseten-api-key
```

2. **요청**:
```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="baseten-model",
    messages=[{"role": "user", "content": "Hello!"}]
)
```
