import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Streaming + Async

| Feature | LiteLLM SDK | LiteLLM Proxy |
|---------|-------------|---------------|
| Streaming | ✅ [여기서 시작](#streaming-responses) | ✅ [여기서 시작](../proxy/user_keys#streaming) |
| Async | ✅ [여기서 시작](#async-completion) | ✅ [여기서 시작](../proxy/user_keys#streaming) |
| Async Streaming | ✅ [여기서 시작](#async-streaming) | ✅ [여기서 시작](../proxy/user_keys#streaming) |

## Streaming Response {#streaming-responses}
LiteLLM은 completion 함수에 `stream=True`를 argument로 전달해 model response를 streaming으로 반환하는 기능을 지원합니다.
### 사용법
```python
from litellm import completion
messages = [{"role": "user", "content": "Hey, how's it going?"}]
response = completion(model="gpt-3.5-turbo", messages=messages, stream=True)
for part in response:
    print(part.choices[0].delta.content or "")
```

### Helper function

LiteLLM은 chunk list에서 완전한 streaming response를 다시 조립하는 helper function도 제공합니다. 

```python
from litellm import completion
messages = [{"role": "user", "content": "Hey, how's it going?"}]
response = completion(model="gpt-3.5-turbo", messages=messages, stream=True)

for chunk in response: 
    chunks.append(chunk)

print(litellm.stream_chunk_builder(chunks, messages=messages))
```

## Async Completion {#async-completion}
LiteLLM으로 asynchronous completion을 사용할 수 있습니다. LiteLLM은 completion 함수의 asynchronous version인 `acompletion`을 제공합니다.
### 사용법
```python
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

## Async Streaming {#async-streaming}
반환되는 streaming object에는 `__anext__()` function이 구현되어 있습니다. 이를 통해 streaming object를 async iteration으로 순회할 수 있습니다. 

### 사용법
OpenAI와 함께 사용하는 예제입니다.
```python
from litellm import acompletion
import asyncio, os, traceback

async def completion_call():
    try:
        print("test acompletion + streaming")
        response = await acompletion(
            model="gpt-3.5-turbo", 
            messages=[{"content": "Hello, how are you?", "role": "user"}], 
            stream=True
        )
        print(f"response: {response}")
        async for chunk in response:
            print(chunk)
    except:
        print(f"error occurred: {traceback.format_exc()}")
        pass

asyncio.run(completion_call())
```

## 오류 처리 - 무한 루프

때때로 model이 infinite loop에 들어가 같은 chunk를 계속 반복할 수 있습니다. 예시는 [이 issue](https://github.com/BerriAI/litellm/issues/5158)를 참고하세요.

다음 설정으로 빠져나올 수 있습니다. 

```python
litellm.REPEATED_STREAMING_CHUNK_LIMIT = 100 # # catch if model starts looping the same chunk while streaming. Uses high default to prevent false positives.
```

LiteLLM은 chunk가 'n'번 반복되는지 확인해 이 상황을 처리합니다(default는 100). 이 limit을 넘으면 `litellm.InternalServerError`를 발생시켜 retry logic이 동작할 수 있게 합니다. 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm 
import os 

litellm.set_verbose = False
loop_amount = litellm.REPEATED_STREAMING_CHUNK_LIMIT + 1
chunks = [
    litellm.ModelResponse(**{
    "id": "chatcmpl-123",
    "object": "chat.completion.chunk",
    "created": 1694268190,
    "model": "gpt-3.5-turbo-0125",
    "system_fingerprint": "fp_44709d6fcb",
    "choices": [
        {"index": 0, "delta": {"content": "How are you?"}, "finish_reason": "stop"}
    ],
}, stream=True)
] * loop_amount
completion_stream = litellm.ModelResponseListIterator(model_responses=chunks)

response = litellm.CustomStreamWrapper(
    completion_stream=completion_stream,
    model="gpt-3.5-turbo",
    custom_llm_provider="cached_response",
    logging_obj=litellm.Logging(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hey"}],
        stream=True,
        call_type="completion",
        start_time=time.time(),
        litellm_call_id="12345",
        function_id="1245",
    ),
)

for chunk in response:
    continue # expect to raise InternalServerError 
```

</TabItem>
<TabItem value="proxy" label="PROXY">

Proxy의 config.yaml에 다음을 정의하세요. 

```yaml
litellm_settings:
    REPEATED_STREAMING_CHUNK_LIMIT: 100 # this overrides the litellm default
```

Proxy는 litellm SDK를 사용합니다. 이 동작을 검증하려면 'SDK' code snippet을 실행해 보세요. 

</TabItem>
</Tabs>
