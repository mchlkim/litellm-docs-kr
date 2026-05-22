# 로깅된 데이터 스크러빙 {#scrub-logged-data}

로깅 통합(langfuse 등)으로 데이터를 보내기 전에 메시지를 수정하거나 PII를 마스킹합니다.

참고용으로 [**Presidio PII 마스킹**](https://github.com/BerriAI/litellm/blob/a176feeacc5fdf504747978d82056eb84679c4be/litellm/proxy/hooks/presidio_pii_masking.py#L286)을 확인하세요.

1. 사용자 지정 콜백 설정

```python
from litellm.integrations.custom_logger import CustomLogger

class MyCustomHandler(CustomLogger):
    async def async_logging_hook(
        self, kwargs: dict, result: Any, call_type: str
    ) -> Tuple[dict, Any]:
        """
        For masking logged request/response. Return a modified version of the request/result. 
        
        Called before `async_log_success_event`.
        """
        if (
            call_type == "completion" or call_type == "acompletion"
        ):  # /chat/completions requests
            messages: Optional[List] = kwargs.get("messages", None)

            kwargs["messages"] = [{"role": "user", "content": "MASK_THIS_ASYNC_VALUE"}]

        return kwargs, responses

    def logging_hook(
        self, kwargs: dict, result: Any, call_type: str
    ) -> Tuple[dict, Any]:
        """
        For masking logged request/response. Return a modified version of the request/result.

        Called before `log_success_event`.
        """
        if (
            call_type == "completion" or call_type == "acompletion"
        ):  # /chat/completions requests
            messages: Optional[List] = kwargs.get("messages", None)

            kwargs["messages"] = [{"role": "user", "content": "MASK_THIS_SYNC_VALUE"}]

        return kwargs, responses


customHandler = MyCustomHandler()
```


2. 사용자 지정 핸들러를 LiteLLM에 연결

```python
import litellm

litellm.callbacks = [customHandler]
```

3. 테스트

```python
# uv add langfuse 

import os
import litellm
from litellm import completion 

os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""
# Optional, defaults to https://cloud.langfuse.com
os.environ["LANGFUSE_HOST"] # optional
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

litellm.callbacks = [customHandler]
litellm.success_callback = ["langfuse"]



## sync 
response = completion(model="gpt-3.5-turbo", messages=[{ "role": "user", "content": "Hi 👋 - i'm openai"}],
                              stream=True)
for chunk in response: 
    continue


## async
import asyncio 

def async completion():
    response = await acompletion(model="gpt-3.5-turbo", messages=[{ "role": "user", "content": "Hi 👋 - i'm openai"}],
                              stream=True)
    async for chunk in response: 
        continue
asyncio.run(completion())
```
