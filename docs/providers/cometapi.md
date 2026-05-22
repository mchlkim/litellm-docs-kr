# CometAPI
LiteLLM은 [CometAPI](https://www.cometapi.com/)의 모든 AI 모델을 지원합니다. CometAPI는 통합 API 인터페이스를 통해 GPT-5, Claude Opus 4.1과 여러 최신 언어 모델을 포함한 500개 이상의 AI 모델에 접근할 수 있게 합니다.

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_CometAPI.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## 인증

CometAPI 모델을 사용하려면 [CometAPI Token Console](https://api.cometapi.com/console/token)에서 API 키를 발급받아야 합니다. CometAPI는 신규 사용자에게 무료 토큰을 제공하므로, 가입하면 무료 API 키를 즉시 받을 수 있습니다.

## 사용법

CometAPI 키를 환경 변수로 설정한 뒤 `completion` 함수를 사용합니다.

```python
import os
from litellm import completion

# Set API key
os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"

# Define messages
messages = [{"content": "Hello, how are you?", "role": "user"}]

# Method 1: Using environment variable (recommended)
response = completion(
    model="cometapi/gpt-5", 
    messages=messages
)

print(response.choices[0].message.content)
```

### 대체 사용법 - 명시적 API 키 {#alternative-사용법---explicit-api-key}

API 키를 명시적으로 전달할 수도 있습니다.

```python
import os
from litellm import completion

# Define messages
messages = [{"content": "Hello, how are you?", "role": "user"}]

# Method 2: Explicitly passing API key
response = completion(
    model="cometapi/gpt-4o", 
    messages=messages, 
    api_key="your_comet_api_key_here"
)

print(response.choices[0].message.content)
```

## 사용법 - 스트리밍 {#사용법---streaming}

completion을 호출할 때 `stream=True`만 설정하면 됩니다.

```python
import os
from litellm import completion

os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(
    model="cometapi/gpt-5",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

## 사용법 - 비동기 스트리밍 {#사용법---async-streaming}

비동기 스트리밍에는 `acompletion`을 사용합니다.

```python
from litellm import acompletion
import asyncio, os, traceback

async def completion_call():
    try:
        os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"
        
        print("test acompletion + streaming")
        response = await acompletion(
            model="cometapi/chatgpt-4o-latest", 
            messages=[{"content": "Hello, how are you?", "role": "user"}], 
            stream=True
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass

# Run the async function
await completion_call()
```

## CometAPI 모델

CometAPI는 통합 API를 통해 500개 이상의 AI 모델에 접근할 수 있게 합니다. 많이 사용하는 모델은 다음과 같습니다.

| 모델 이름 | 함수 호출 |
|------------|---------------|
| `cometapi/gpt-5` | `completion('cometapi/gpt-5', messages)` |
| `cometapi/gpt-5-mini` | `completion('cometapi/gpt-5-mini', messages)` |
| `cometapi/gpt-5-nano` | `completion('cometapi/gpt-5-nano', messages)` |
| `cometapi/gpt-oss-20b` | `completion('cometapi/gpt-oss-20b', messages)` |
| `cometapi/gpt-oss-120b` | `completion('cometapi/gpt-oss-120b', messages)` |
| `cometapi/chatgpt-4o-latest` | `completion('cometapi/chatgpt-4o-latest', messages)` |

사용 가능한 전체 모델 목록은 [CometAPI 모델 페이지](https://www.cometapi.com/model/)를 참조하세요.

## 환경 변수 {#environment-variables}

| 변수 | 설명 | 필수 여부 |
|----------|-------------|----------|
| `COMETAPI_KEY` | CometAPI API 키 | 예 |

## 오류 처리 {#error-handling}

```python
import os
from litellm import completion

try:
    os.environ["COMETAPI_KEY"] = "your_comet_api_key_here"
    
    messages = [{"content": "Hello, how are you?", "role": "user"}]
    
    response = completion(
        model="cometapi/gpt-5",
        messages=messages
    )
    
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"Error: {e}")
```
