import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Hyperbolic

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Hyperbolic은 기존 클라우드 비용보다 훨씬 낮은 비용으로 최신 모델을 사용할 수 있게 하며, LLM, 이미지 생성 등을 위한 OpenAI 호환 API를 제공합니다. |
| LiteLLM 제공자 라우트 | `hyperbolic/` |
| 제공자 문서 링크 | [Hyperbolic Documentation ↗](https://docs.hyperbolic.xyz) |
| 기본 URL | `https://api.hyperbolic.xyz/v1` |
| 지원 작업 | [`/chat/completions`](#sample-usage) |

<br />
<br />

https://docs.hyperbolic.xyz

**모든 Hyperbolic 모델을 지원합니다. completion 요청을 보낼 때 `hyperbolic/`을 접두사로 설정하기만 하면 됩니다.**

## 사용 가능한 모델

### 언어 모델

| 모델 | 설명 | 컨텍스트 창 | 토큰 100만 개당 가격 |
|-------|-------------|----------------|----------------------|
| `hyperbolic/deepseek-ai/DeepSeek-V3` | DeepSeek V3 - 빠르고 효율적 | 131,072 tokens | $0.25 |
| `hyperbolic/deepseek-ai/DeepSeek-V3-0324` | DeepSeek V3 2024년 3월 버전 | 131,072 tokens | $0.25 |
| `hyperbolic/deepseek-ai/DeepSeek-R1` | DeepSeek R1 - 추론 모델 | 131,072 tokens | $2.00 |
| `hyperbolic/deepseek-ai/DeepSeek-R1-0528` | DeepSeek R1 2028년 5월 버전 | 131,072 tokens | $0.25 |
| `hyperbolic/Qwen/Qwen2.5-72B-Instruct` | Qwen 2.5 72B Instruct 모델 | 131,072 tokens | $0.40 |
| `hyperbolic/Qwen/Qwen2.5-Coder-32B-Instruct` | 코드 생성용 Qwen 2.5 Coder 32B | 131,072 tokens | $0.20 |
| `hyperbolic/Qwen/Qwen3-235B-A22B` | Qwen 3 235B A22B 변형 | 131,072 tokens | $2.00 |
| `hyperbolic/Qwen/QwQ-32B` | Qwen QwQ 32B | 131,072 tokens | $0.20 |
| `hyperbolic/meta-llama/Llama-3.3-70B-Instruct` | Llama 3.3 70B Instruct 모델 | 131,072 tokens | $0.80 |
| `hyperbolic/meta-llama/Meta-Llama-3.1-405B-Instruct` | Llama 3.1 405B Instruct 모델 | 131,072 tokens | $5.00 |
| `hyperbolic/moonshotai/Kimi-K2-Instruct` | Kimi K2 Instruct | 131,072 tokens | $2.00 |

## 필수 변수

```python showLineNumbers title="Environment Variables"
os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key
```

[Hyperbolic dashboard](https://app.hyperbolic.ai)에서 API 키를 가져오세요.

## 사용법 - LiteLLM Python SDK

### 비스트리밍

```python showLineNumbers title="Hyperbolic Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Hyperbolic call
response = completion(
    model="hyperbolic/Qwen/Qwen2.5-72B-Instruct", 
    messages=messages
)

print(response)
```

### 스트리밍

```python showLineNumbers title="Hyperbolic Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Hyperbolic call with streaming
response = completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 함수 호출

```python showLineNumbers title="Hyperbolic Function Calling"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3",
    messages=[{"role": "user", "content": "What's the weather like in New York?"}],
    tools=tools,
    tool_choice="auto"
)

print(response)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 설정 파일에 다음 내용을 추가하세요.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: deepseek-fast
    litellm_params:
      model: hyperbolic/deepseek-ai/DeepSeek-V3
      api_key: os.environ/HYPERBOLIC_API_KEY

  - model_name: qwen-coder
    litellm_params:
      model: hyperbolic/Qwen/Qwen2.5-Coder-32B-Instruct
      api_key: os.environ/HYPERBOLIC_API_KEY

  - model_name: deepseek-reasoning
    litellm_params:
      model: hyperbolic/deepseek-ai/DeepSeek-R1
      api_key: os.environ/HYPERBOLIC_API_KEY
```

LiteLLM Proxy 서버를 시작하세요.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Hyperbolic via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="deepseek-fast",
    messages=[{"role": "user", "content": "Explain quantum computing in simple terms"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Hyperbolic via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="qwen-coder",
    messages=[{"role": "user", "content": "Write a Python function to sort a list"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Hyperbolic via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/deepseek-fast",
    messages=[{"role": "user", "content": "What are the benefits of renewable energy?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Hyperbolic via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/qwen-coder",
    messages=[{"role": "user", "content": "Implement a binary search algorithm"}],
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

```bash showLineNumbers title="Hyperbolic via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "deepseek-fast",
    "messages": [{"role": "user", "content": "What is machine learning?"}]
  }'
```

```bash showLineNumbers title="Hyperbolic via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "qwen-coder",
    "messages": [{"role": "user", "content": "Write a REST API in Python"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

LiteLLM Proxy 사용에 대한 자세한 내용은 [LiteLLM Proxy documentation](../providers/litellm_proxy)을 참고하세요.

## 지원되는 OpenAI 파라미터

Hyperbolic은 다음 OpenAI 호환 파라미터를 지원합니다.

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `messages` | array | **필수**. 'role'과 'content'가 포함된 메시지 객체 배열 |
| `model` | string | **필수**. 모델 ID(예: deepseek-ai/DeepSeek-V3, Qwen/Qwen2.5-72B-Instruct) |
| `stream` | boolean | 선택 사항. 스트리밍 응답 활성화 |
| `temperature` | float | 선택 사항. 샘플링 온도(0.0~2.0) |
| `top_p` | float | 선택 사항. Nucleus sampling 파라미터 |
| `max_tokens` | integer | 선택 사항. 생성할 최대 토큰 수 |
| `frequency_penalty` | float | 선택 사항. 자주 등장하는 토큰에 패널티 적용 |
| `presence_penalty` | float | 선택 사항. 등장 여부를 기준으로 토큰에 패널티 적용 |
| `stop` | string/array | 선택 사항. 중지 시퀀스 |
| `n` | integer | 선택 사항. 생성할 completion 수 |
| `tools` | array | 선택 사항. 사용 가능한 도구/함수 목록 |
| `tool_choice` | string/object | 선택 사항. 도구/함수 호출 제어 |
| `response_format` | object | 선택 사항. 응답 형식 명세 |
| `seed` | integer | 선택 사항. 재현성을 위한 난수 시드 |
| `user` | string | 선택 사항. 사용자 식별자 |

## 고급 사용법

### 사용자 지정 API Base

사용자 지정 Hyperbolic 배포를 사용하는 경우:

```python showLineNumbers title="Custom API Base"
import litellm

response = litellm.completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="https://your-custom-hyperbolic-endpoint.com/v1",
    api_key="your-api-key"
)
```

### 사용량 제한

Hyperbolic은 여러 티어를 제공합니다.
- **Basic**: 분당 요청 60건(RPM)
- **Pro**: 600 RPM
- **엔터프라이즈**: 사용자 지정 제한

## 가격

Hyperbolic은 숨겨진 수수료나 장기 약정 없이 경쟁력 있는 종량제 가격을 제공합니다. 토큰 100만 개당 구체적인 가격은 위의 모델 표를 참고하세요.

### 정밀도 옵션
- **BF16**: 가장 좋은 정밀도와 성능을 제공하며, 정확도가 중요한 작업에 적합합니다.
- **FP8**: 효율성과 속도에 최적화되어 있으며, 더 낮은 비용의 고처리량 애플리케이션에 적합합니다.

## 추가 리소스

- [Hyperbolic Official Documentation](https://docs.hyperbolic.xyz)
- [Hyperbolic Dashboard](https://app.hyperbolic.ai)
- [API Reference](https://docs.hyperbolic.xyz/docs/rest-api)
