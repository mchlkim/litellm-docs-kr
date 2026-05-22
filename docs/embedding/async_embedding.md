# `litellm.aembedding()`

LiteLLM은 `embedding` 함수의 비동기 버전인 `aembedding`을 제공합니다.
### 사용법
```python
from litellm import aembedding
import asyncio

async def test_get_response():
    response = await aembedding('text-embedding-ada-002', input=["good morning from litellm"])
    return response

response = asyncio.run(test_get_response())
print(response)
```
