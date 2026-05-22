import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Moonshot AI

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Moonshot AI는 moonshot-v1 시리즈와 kimi 모델을 포함한 대규모 언어 모델을 제공합니다. |
| LiteLLM의 Provider Route | `moonshot/` |
| Provider 문서 링크 | [Moonshot AI ↗](https://platform.moonshot.ai/) |
| Base URL | `https://api.moonshot.ai/` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />
<br />

https://platform.moonshot.ai/

**모든 Moonshot AI 모델을 지원합니다. completion 요청을 보낼 때 `moonshot/`를 prefix로 설정하기만 하면 됩니다.**

## 필수 변수 {#required-variables}

```python showLineNumbers title="Environment Variables"
os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key
```

**주의:**

Moonshot AI는 전역 endpoint와 중국 전용 endpoint, 두 가지 API endpoint를 제공합니다.
- 전역 API Base URL: `https://api.moonshot.ai/v1` (현재 구현된 endpoint)
- 중국 API Base URL: `https://api.moonshot.cn/v1`

다음과 같이 base url을 덮어쓸 수 있습니다.

```
os.environ["MOONSHOT_API_BASE"] = "https://api.moonshot.cn/v1"
```

## 사용법 - LiteLLM Python SDK

### 비스트리밍 {#non-streaming}

```python showLineNumbers title="Moonshot Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Moonshot call
response = completion(
    model="moonshot/moonshot-v1-8k", 
    messages=messages
)

print(response)
```

### 스트리밍 {#streaming}

```python showLineNumbers title="Moonshot Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["MOONSHOT_API_KEY"] = ""  # your Moonshot AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Moonshot call with streaming
response = completion(
    model="moonshot/moonshot-v1-8k", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 설정 파일에 다음 내용을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: moonshot-v1-8k
    litellm_params:
      model: moonshot/moonshot-v1-8k
      api_key: os.environ/MOONSHOT_API_KEY

  - model_name: moonshot-v1-32k
    litellm_params:
      model: moonshot/moonshot-v1-32k
      api_key: os.environ/MOONSHOT_API_KEY

  - model_name: moonshot-v1-128k
    litellm_params:
      model: moonshot/moonshot-v1-128k
      api_key: os.environ/MOONSHOT_API_KEY
```

LiteLLM Proxy 서버를 시작합니다.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Moonshot via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Moonshot via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Moonshot via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Moonshot via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/moonshot-v1-8k",
    messages=[{"role": "user", "content": "hello from litellm"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Moonshot via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role": "user", "content": "hello from litellm"}]
  }'
```

```bash showLineNumbers title="Moonshot via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role": "user", "content": "hello from litellm"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 대한 자세한 내용은 [LiteLLM Proxy 문서](../providers/litellm_proxy)를 참고하세요.

## 이미지 / 비전 지원 {#image--vision-support}

Moonshot 비전 모델(`kimi-k2.5`, `kimi-latest`, `moonshot-v1-*-vision-preview` 등)은 `image_url` 블록이 포함된 표준 OpenAI content array를 허용합니다.

LiteLLM은 메시지에 이미지가 포함된 경우를 자동으로 감지하고 content array를 유지하여 이미지 payload가 Moonshot API에 전달되도록 합니다. 텍스트 전용 요청의 경우 Moonshot 텍스트 모델 요구 사항에 따라 content가 일반 문자열로 평탄화됩니다.

```python showLineNumbers title="Moonshot Vision Example"
import os
import litellm

os.environ["MOONSHOT_API_KEY"] = ""

response = litellm.completion(
    model="moonshot/kimi-k2.5",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.png"},
                },
            ],
        }
    ],
)

print(response.choices[0].message.content)
```

## Moonshot AI 제한 사항 및 LiteLLM 처리 {#moonshot-ai-limitations--litellm-handling}

LiteLLM은 원활한 OpenAI 호환성을 제공하기 위해 다음 [Moonshot AI 제한 사항](https://platform.moonshot.ai/docs/guide/migrating-from-openai-to-kimi#about-api-compatibility)을 자동으로 처리합니다.

### Temperature 범위 제한 {#temperature-range-limitation}
**제한 사항**: Moonshot AI는 temperature 범위 [0, 1]만 지원합니다(OpenAI의 [0, 2]와 비교).  
**LiteLLM 처리**: temperature가 1보다 크면 자동으로 1로 제한합니다.

### Temperature + 다중 출력 제한 {#temperature--multiple-outputs-limitation}  
**제한 사항**: temperature < 0.3이고 n > 1이면 Moonshot AI가 예외를 발생시킵니다.  
**LiteLLM 처리**: 이 조건이 감지되면 temperature를 자동으로 0.3으로 설정합니다.

### Tool Choice "Required" 미지원 {#tool-choice-required-not-supported}
**제한 사항**: Moonshot AI는 `tool_choice="required"`를 지원하지 않습니다.  
**LiteLLM 처리**: 다음 방식으로 변환합니다.
- 메시지 추가: "현재 문제를 처리할 도구를 선택하세요."
- 요청에서 `tool_choice` parameter 제거
