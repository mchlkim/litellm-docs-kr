import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nscale {#nscale-eu-sovereign}

https://docs.nscale.com/docs/inference/chat

:::tip

**모든 Nscale 모델을 지원합니다. litellm 요청을 보낼 때 `model=nscale/<any-model-on-nscale>`을 접두사로 설정하기만 하면 됩니다.**

:::

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | LLM 및 이미지 생성을 위한 유럽 소재 풀스택 AI 클라우드 플랫폼입니다. |
| LiteLLM의 Provider Route | `nscale/` |
| 지원 엔드포인트 | `/chat/completions`, `/images/generations` |
| API 참조 | [Nscale docs](https://docs.nscale.com/docs/getting-started/overview) |

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
```

## 사용 가능한 모델 살펴보기 {#explore-available-모델}

경쟁력 높은 가격으로 제공되는 전체 텍스트 및 멀티모달 AI 모델 목록을 확인하세요.
📚 [전체 모델 목록](https://docs.nscale.com/docs/inference/serverless-models/current)  


## 주요 기능 {#key-features}
- **EU Sovereign**: 완전한 데이터 주권과 유럽 규정 준수를 제공합니다.
- **Ultra-Low Cost (starting at $0.01 / M tokens)**: 텍스트 및 이미지 생성 모델 모두에 매우 경쟁력 있는 가격을 제공합니다.
- **Production Grade**: 완전한 격리를 갖춘 안정적인 서버리스 배포를 제공합니다.
- **No Setup Required**: 인프라 관리 없이 컴퓨팅에 즉시 액세스할 수 있습니다.
- **Full Control**: 데이터는 비공개로 유지되며 격리됩니다.

## 사용법 - LiteLLM Python SDK

### 텍스트 생성 {#text-generation}

```python showLineNumbers title="Nscale Text Generation"
from litellm import completion
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
response = completion(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}]
)
print(response)
```

```python showLineNumbers title="Nscale Text Generation - Streaming"
from litellm import completion
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
stream = completion(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### 이미지 생성 {#image-generation}

```python showLineNumbers title="Nscale Image Generation"
from litellm import image_generation
import os

os.environ["NSCALE_API_KEY"] = ""  # your Nscale API key
response = image_generation(
    model="nscale/stabilityai/stable-diffusion-xl-base-1.0",
    prompt="A beautiful sunset over mountains",
    n=1,
    size="1024x1024"
)
print(response)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 구성 파일에 다음을 추가하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct
    litellm_params:
      model: nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct
      api_key: os.environ/NSCALE_API_KEY
  - model_name: nscale/meta-llama/Llama-3.3-70B-Instruct
    litellm_params:
      model: nscale/meta-llama/Llama-3.3-70B-Instruct
      api_key: os.environ/NSCALE_API_KEY
  - model_name: nscale/stabilityai/stable-diffusion-xl-base-1.0
    litellm_params:
      model: nscale/stabilityai/stable-diffusion-xl-base-1.0
      api_key: os.environ/NSCALE_API_KEY
```

LiteLLM Proxy 서버를 시작하세요.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Nscale via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}]
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Nscale via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Nscale via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "nscale/meta-llama/Llama-4-Scout-17B-16E-Instruct",
    "messages": [{"role": "user", "content": "What is LiteLLM?"}]
  }'
```

</TabItem>
</Tabs>

## 시작하기
1. [console.nscale.com](https://console.nscale.com)에서 계정을 만듭니다.
2. 무료 크레딧을 신청합니다.
3. 설정에서 API 키를 만듭니다.
4. LiteLLM을 사용해 API 호출을 시작합니다.

## 추가 리소스 {#additional-resources}
- [Nscale 문서](https://docs.nscale.com/docs/getting-started/overview)
- [블로그: Sovereign Serverless](https://www.nscale.com/blog/sovereign-serverless-how-we-designed-full-isolation-without-sacrificing-performance) 
