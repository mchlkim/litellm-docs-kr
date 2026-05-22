import Image from '@theme/IdealImage';

# Langtrace AI

LLM 앱을 모니터링, 평가, 개선하세요

## 사전 준비 {#pre-requisites}

[Langtrace AI](https://langtrace.ai/login) 계정을 만드세요

## 빠른 시작

코드 2줄만으로 langtrace를 통해 **모든 제공업체**의 응답을 즉시 로깅할 수 있습니다

```python
litellm.callbacks = ["langtrace"]
langtrace.init()
```

```python
import litellm
import os
from langtrace_python_sdk import langtrace

# Langtrace API Keys
os.environ["LANGTRACE_API_KEY"] = "<your-api-key>"

# LLM API Keys
os.environ['OPENAI_API_KEY']="<openai-api-key>"

# set langtrace as a callback, litellm will send the data to langtrace
litellm.callbacks = ["langtrace"]

#  init langtrace
langtrace.init()

# openai call
response = completion(
    model="gpt-4o",
    messages=[
        {"content": "respond only in Yoda speak.", "role": "system"},
        {"content": "Hello, how are you?", "role": "user"},
    ],
)
print(response)
```

### LiteLLM Proxy와 함께 사용하기 {#using-with-litellm-proxy}

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["langtrace"]

environment_variables:
  LANGTRACE_API_KEY: "141a****"
```
