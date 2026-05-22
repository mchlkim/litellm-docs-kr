# watsonx.ai Rerank

## 개요

| 속성 | 세부 정보                                                                  |
|----------|--------------------------------------------------------------------------|
| 설명 | watsonx.ai rerank 연동                                            |
| LiteLLM의 제공자 라우트 | `watsonx/`                                                               |
| 지원 작업 | `/ml/v1/text/rerank`                                                     |
| 제공자 문서 링크 | [IBM WatsonX.ai ↗](https://cloud.ibm.com/apidocs/watsonx-ai#text-rerank) |

## 빠른 시작

### **LiteLLM SDK**

```python
import os
from litellm import rerank

os.environ["WATSONX_APIKEY"] = "YOUR_WATSONX_APIKEY"
os.environ["WATSONX_API_BASE"] = "YOUR_WATSONX_API_BASE"
os.environ["WATSONX_PROJECT_ID"] = "YOUR_WATSONX_PROJECT_ID"

query="Best programming language for beginners?"
documents=[
    "Python is great for beginners due to simple syntax.",
    "JavaScript runs in browsers and is versatile.",
    "Rust has a steep learning curve but is very safe.",
]

response = rerank(
    model="watsonx/cross-encoder/ms-marco-minilm-l-12-v2",
    query=query,
    documents=documents,
    top_n=2,
    return_documents=True,
)

print(response)
```

### **LiteLLM Proxy**

```yaml
model_list:
  - model_name: cross-encoder/ms-marco-minilm-l-12-v2
    litellm_params:
      model: watsonx/cross-encoder/ms-marco-minilm-l-12-v2
      api_key: os.environ/WATSONX_APIKEY
      api_base: os.environ/WATSONX_API_BASE
      project_id: os.environ/WATSONX_PROJECT_ID
```
