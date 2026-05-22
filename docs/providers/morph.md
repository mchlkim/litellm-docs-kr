# Morph

LiteLLM은 [Morph](https://morphllm.com)의 모든 model을 지원합니다.

## 개요

Morph는 agentic workflow를 위해 설계된 특화 AI model을 제공하며, 특히 정밀한 code editing과 조작에 강점이 있습니다. "Apply" model은 전체 file rewrite 없이 targeted code change를 수행할 수 있어, context-aware code modification이 필요한 AI agent에 적합합니다.

## API key {#api-key}
```python
import os 
os.environ["MORPH_API_KEY"] = "your-api-key"
```

## 샘플 사용법 {#sample-usage}

```python
from litellm import completion

# set env variable 
os.environ["MORPH_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "Write a Python function to calculate factorial"}
]

## Morph v3 Fast - Optimized for speed
response = completion(
    model="morph/morph-v3-fast",
    messages=messages,
)
print(response)

## Morph v3 Large - Most capable model
response = completion(
    model="morph/morph-v3-large", 
    messages=messages,
)
print(response)
```

## 샘플 사용법 - streaming {#sample-usage-streaming}
```python
from litellm import completion

# set env variable
os.environ["MORPH_API_KEY"] = "your-api-key"

messages = [
    {"role": "user", "content": "Write a Python function to calculate factorial"}
]

## Morph v3 Fast with streaming
response = completion(
    model="morph/morph-v3-fast",
    messages=messages,
    stream=True,
)

for chunk in response:
    print(chunk)
```

## 지원 model {#supported-models}

| Model name               | 함수 호출                              | 설명 | Context window |
|--------------------------|--------------------------------------------|-----------------------|----------------|
| `morph-v3-fast`            | `completion('morph/morph-v3-fast', messages)` | 빠른 response에 최적화된 가장 빠른 model | 16k tokens |
| `morph-v3-large`           | `completion('morph/morph-v3-large', messages)` | complex task에 가장 적합한 고성능 model | 16k tokens |

## 사용법 - LiteLLM Proxy Server

LiteLLM Proxy Server에서 Morph를 사용하는 방법은 다음과 같습니다.

1. 환경에 API key 저장
```bash
export MORPH_API_KEY="your-api-key"
```

2. config.yaml에 model 추가
```yaml
model_list:
  - model_name: morph-v3-fast
    litellm_params:
      model: morph/morph-v3-fast
      
  - model_name: morph-v3-large
    litellm_params:
      model: morph/morph-v3-large
```

3. proxy server 시작
```bash
litellm --config config.yaml
```

## 고급 사용법

### API base 설정 {#setting-api-base}
```python
import litellm 

# set custom api base
response = completion(
    model="morph/morph-v3-large",
    messages=[{"role": "user", "content": "Hello, world!"}],
    api_base="https://api.morphllm.com/v1"
)
print(response)
```

### API key 설정 {#setting-api-key}
```python 
import litellm 

# set api key via completion
response = completion(
    model="morph/morph-v3-large",
    messages=[{"role": "user", "content": "Hello, world!"}],
    api_key="your-api-key"
)
print(response)
```
