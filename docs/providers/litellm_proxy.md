import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM Proxy (LLM 게이트웨이)


| 속성 | 세부 정보 |
|-------|-------|
| 설명 | LiteLLM Proxy는 통합 API를 통해 여러 LLM 제공자와 상호 작용할 수 있게 해주는 OpenAI 호환 게이트웨이입니다. 모델 이름 앞에 `litellm_proxy/` 접두사를 붙이기만 하면 요청이 프록시를 통해 라우팅됩니다. |
| LiteLLM의 제공자 라우트 | `litellm_proxy/` (요청을 litellm_proxy로 라우팅하려면 모델 이름 앞에 이 접두사를 추가하세요. 예: `litellm_proxy/your-model-name`) |
| LiteLLM Gateway 설정 | [LiteLLM Gateway ↗](../simple_proxy) |
| 지원 엔드포인트 |`/chat/completions`, `/completions`, `/embeddings`, `/audio/speech`, `/audio/transcriptions`, `/images`, `/images/edits`, `/rerank` |



## 필수 변수

```python
os.environ["LITELLM_PROXY_API_KEY"] = "" # "sk-1234" your litellm proxy api key 
os.environ["LITELLM_PROXY_API_BASE"] = "" # "http://localhost:4000" your litellm proxy api base
```


## 사용법 (비스트리밍)
```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

# set custom api base to your proxy
# either set .env or litellm.api_base
# os.environ["LITELLM_PROXY_API_BASE"] = ""
litellm.api_base = "your-openai-proxy-url"


messages = [{ "content": "Hello, how are you?","role": "user"}]

# litellm proxy call
response = completion(model="litellm_proxy/your-model-name", messages)
```

## 사용법 - 요청마다 `api_base`, `api_key` 전달하기

`api_base`를 동적으로 설정해야 하는 경우에는 completions 호출에 직접 전달하세요. 예: completions(...,api_base="your-proxy-api-base")

```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# litellm proxy call
response = completion(
    model="litellm_proxy/your-model-name", 
    messages=messages, 
    api_base = "your-litellm-proxy-url",
    api_key = "your-litellm-proxy-api-key"
)
```
## 사용법 - 스트리밍

```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(
    model="litellm_proxy/your-model-name", 
    messages=messages,
    api_base = "your-litellm-proxy-url", 
    stream=True
)

for chunk in response:
    print(chunk)
```

## 임베딩

```python
import litellm

response = litellm.embedding(
    model="litellm_proxy/your-embedding-model",
    input="Hello world",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 이미지 생성

```python
import litellm

response = litellm.image_generation(
    model="litellm_proxy/dall-e-3",
    prompt="A beautiful sunset over mountains",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 이미지 편집

```python
import litellm

with open("your-image.png", "rb") as f:
    response = litellm.image_edit(
        model="litellm_proxy/gpt-image-1",
        prompt="Make this image a watercolor painting",
        image=[f],
        api_base="your-litellm-proxy-url",
        api_key="your-litellm-proxy-api-key",
    )
```

## 오디오 전사

```python
import litellm

response = litellm.transcription(
    model="litellm_proxy/whisper-1",
    file="your-audio-file",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 텍스트 음성 변환

```python
import litellm

response = litellm.speech(
    model="litellm_proxy/tts-1",
    input="Hello world",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
``` 

## 재순위화

```python
import litellm

import litellm

response = litellm.rerank(
    model="litellm_proxy/rerank-english-v2.0",
    query="What is machine learning?",
    documents=[
        "Machine learning is a field of study in artificial intelligence",
        "Biology is the study of living organisms"
    ],
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```


## 다른 라이브러리와의 통합

LiteLLM Proxy는 Langchain, LlamaIndex, OpenAI JS, Anthropic SDK, Instructor 등과 원활하게 작동합니다.

[이러한 라이브러리에서 LiteLLM Proxy를 사용하는 방법 알아보기 →](../proxy/user_keys)

## 모든 SDK 요청을 LiteLLM Proxy로 보내기 {#send-all-sdk-requests-to-litellm-proxy}

:::info

v1.72.1 이상이 필요합니다.

:::

이미 LiteLLM SDK를 사용하는 라이브러리나 코드베이스에서 LiteLLM Proxy를 호출할 때 사용하세요.

이 플래그들은 지정된 모델과 관계없이 모든 요청을 LiteLLM 프록시를 통해 라우팅합니다.

활성화하면 요청은 `LITELLM_PROXY_API_BASE`를 사용하고 `LITELLM_PROXY_API_KEY`를 인증 값으로 사용합니다.

### 옵션 1: 코드에서 전역으로 설정하기

```python
# Set the flag globally for all requests
litellm.use_litellm_proxy = True

response = litellm.completion(
    model="vertex_ai/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### 옵션 2: 환경 변수로 제어하기

```python
# Control proxy usage through environment variable
os.environ["USE_LITELLM_PROXY"] = "True"

response = litellm.completion(
    model="vertex_ai/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### 옵션 3: 요청마다 설정하기

```python
# Enable proxy for specific requests only
response = litellm.completion(
    model="vertex_ai/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    use_litellm_proxy=True
)
```

## OAuth2/JWT 인증

LiteLLM Proxy에 OAuth2/JWT 인증이 필요한 경우(예: Azure AD, Keycloak, Okta), SDK가 토큰을 자동으로 가져오고 갱신할 수 있습니다.

```python
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

[SDK Proxy 인증(OAuth2/JWT 자동 갱신)에 대해 자세히 알아보기 →](../proxy_auth)

## LiteLLM Proxy로 `tags` 보내기

태그를 사용하면 모니터링, 디버깅, 분석 목적으로 API 요청을 분류하고 추적할 수 있습니다. `extra_body` 파라미터를 사용해 문자열 목록 형태의 태그를 LiteLLM Proxy로 보낼 수 있습니다.

### 사용법

completion 요청의 `extra_body` 파라미터에 태그를 포함해 보내세요.

```python showLineNumbers title="Usage"
import litellm

response = litellm.completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000",
    api_key="sk-1234",
    extra_body={"tags": ["user:ishaan", "department:engineering", "priority:high"]}
)
```

### 비동기 사용법

```python showLineNumbers title="Async Usage"
import litellm

response = await litellm.acompletion(
    model="gpt-4",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000", 
    api_key="sk-1234",
    extra_body={"tags": ["user:ishaan", "department:engineering"]}
)
```
