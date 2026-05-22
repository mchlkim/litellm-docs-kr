import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure OpenAI 임베딩 {#azure-openai-embeddings}

### API 키 {#api-keys}
이는 환경 변수로 설정하거나 **litellm.embedding()의 파라미터**로 전달할 수 있습니다.
```python
import os
os.environ['AZURE_API_KEY'] = 
os.environ['AZURE_API_BASE'] = 
os.environ['AZURE_API_VERSION'] = 
```

### 사용법
```python
from litellm import embedding
response = embedding(
    model="azure/<your deployment name>",
    input=["good morning from litellm"],
    api_key=api_key,
    api_base=api_base,
    api_version=api_version,
)
print(response)
```

| 모델 이름           | 함수 호출                               |
|----------------------|---------------------------------------------|
| `text-embedding-ada-002` | `embedding(model="azure/<your deployment name>", input=input)` |

이 통합에 도움을 준 [Mikko](https://www.linkedin.com/in/mikkolehtimaki/)에게 감사드립니다.


## **사용법 - LiteLLM Proxy Server**

LiteLLM Proxy Server로 Azure OpenAI 모델을 호출하는 방법은 다음과 같습니다.

### 1. 환경에 키 저장 {#1-save-key-in-your-environment}

```bash
export AZURE_API_KEY=""
```

### 2. 프록시 시작 

```yaml
model_list:
  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/my-deployment-name
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY # The `os.environ/` prefix tells litellm to read this from the env.
```

### 3. 테스트 {#3-test-it}

<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    input=["hello from litellm"],
    model="text-embedding-ada-002"
)

print(response)

```
</TabItem>
</Tabs>
