# 스트리밍 응답 및 비동기 Completion

- [스트리밍 응답](#streaming-responses)
- [비동기 Completion](#async-completion)

## 스트리밍 응답 {#streaming-responses}
LiteLLM은 completion 함수에 `stream=True` 인수를 전달하여 모델 응답을 스트리밍으로 반환하는 기능을 지원합니다.
### 사용법
```python
response = completion(model="gpt-3.5-turbo", messages=messages, stream=True)
for chunk in response:
    print(chunk['choices'][0]['delta'])

```

## 비동기 Completion {#async-completion}
LiteLLM의 비동기 Completion입니다.
LiteLLM은 `acompletion`이라는 completion 함수의 비동기 버전을 제공합니다.
### 사용법
```
from litellm import acompletion
import asyncio

async def test_get_response():
    user_message = "Hello, how are you?"
    messages = [{"content": user_message, "role": "user"}]
    response = await acompletion(model="gpt-3.5-turbo", messages=messages)
    return response

response = asyncio.run(test_get_response())
print(response)

```

## 스트리밍 토큰 사용량 

모든 제공자에서 지원됩니다. OpenAI와 동일하게 작동합니다. 

`stream_options={"include_usage": True}`

설정하면 data: [DONE] 메시지 전에 추가 chunk가 스트리밍됩니다. 이 chunk의 usage 필드는 전체 요청의 토큰 사용량 통계를 표시하며, choices 필드는 항상 빈 배열입니다. 다른 모든 chunk에도 usage 필드가 포함되지만 값은 null입니다.

### SDK 
```python 
from litellm import completion 
import os

os.environ["OPENAI_API_KEY"] = "" 

response = completion(model="gpt-3.5-turbo", messages=messages, stream=True, stream_options={"include_usage": True})
for chunk in response:
    print(chunk['choices'][0]['delta'])
```

### 프록시

```bash 
curl https://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ],
    "stream": true,
    "stream_options": {"include_usage": true}
  }'

```
