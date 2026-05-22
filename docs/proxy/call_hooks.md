import Image from '@theme/IdealImage';

# 들어오는 요청 수정 / 거부

- 프록시에서 LLM API 호출을 만들기 전에 데이터 수정
- LLM API 호출 전 또는 응답을 반환하기 전에 데이터 거부
- 모든 OpenAI 엔드포인트 호출에 'user' 매개변수 적용

:::tip
**Callback Hook이 궁금하신가요?** `async_pre_call_hook` 같은 프록시 전용 훅과 `async_log_success_event` 같은 일반 로깅 훅의 차이는 [Callback 가이드](../observability/callbacks.md)에서 확인하세요.
:::

## 어떤 훅을 사용해야 하나요?

| 훅 | 사용 사례 | 실행 시점 |
|------|----------|--------------|
| `async_pre_call_hook` | 모델로 보내기 전에 들어오는 요청 수정 | LLM API 호출이 생성되기 전 |
| `async_moderation_hook` | 입력 검사를 LLM API 호출과 병렬로 실행 | LLM API 호출과 병렬 |
| `async_post_call_success_hook` | 나가는 응답 수정(비스트리밍) | LLM API 호출 성공 후, 비스트리밍 응답 대상 |
| `async_post_call_failure_hook` | 클라이언트에 전송되는 오류 응답 변환 | LLM API 호출 실패 후 |
| `async_post_call_streaming_hook` | 나가는 응답 수정(스트리밍) | LLM API 호출 성공 후, 스트리밍 응답 대상 |
| `async_post_call_response_headers_hook` | 사용자 지정 HTTP 응답 헤더 삽입 | LLM API 호출 후(성공 및 실패 모두) |

[parallel request rate limiter](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/hooks/parallel_request_limiter.py)에서 전체 예제를 확인하세요.

## 빠른 시작

1. Custom Handler에 새 `async_pre_call_hook` 함수를 추가합니다.

이 함수는 litellm completion 호출이 생성되기 직전에 호출되며, litellm 호출로 들어가는 데이터를 수정할 수 있습니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/589a6ca863000ba8e92c897ba0f776796e7a5904/litellm/proxy/proxy_server.py#L1000)

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm
from litellm.proxy.proxy_server import UserAPIKeyAuth, DualCache
from litellm.types.utils import ModelResponseStream
from typing import Any, AsyncGenerator, Optional, Literal

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger): # https://docs.litellm.ai/docs/observability/custom_callback#callback-class
    # Class variables or attributes
    def __init__(self):
        pass

    #### CALL HOOKS - proxy only #### 

    async def async_pre_call_hook(self, user_api_key_dict: UserAPIKeyAuth, cache: DualCache, data: dict, call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
        ]): 
        data["model"] = "my-new-model"
        return data 

    async def async_post_call_failure_hook(
        self, 
        request_data: dict,
        original_exception: Exception, 
        user_api_key_dict: UserAPIKeyAuth,
        traceback_str: Optional[str] = None,
    ) -> Optional[HTTPException]:
        """
        Transform error responses sent to clients.
        
        Return an HTTPException to replace the original error with a user-friendly message.
        Return None to use the original exception.
        
        Example:
            if isinstance(original_exception, litellm.ContextWindowExceededError):
                return HTTPException(
                    status_code=400,
                    detail="Your prompt is too long. Please reduce the length and try again."
                )
            return None  # Use original exception
        """
        pass

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        pass

    async def async_moderation_hook( # call made in parallel to llm api call
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: Literal["completion", "embeddings", "image_generation", "moderation", "audio_transcription"],
    ):
        pass

    async def async_post_call_streaming_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: str,
    ):
        pass

    async def async_post_call_streaming_iterator_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_data: dict,
    ) -> AsyncGenerator[ModelResponseStream, None]:
        """
        Passes the entire stream to the guardrail

        This is useful for plugins that need to see the entire stream.
        """
        async for item in response:
            yield item

    async def async_post_call_response_headers_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_headers: Optional[Dict[str, str]] = None,
    ) -> Optional[Dict[str, str]]:
        """
        Inject custom headers into HTTP response (runs for both success and failure).
        """
        return {"x-custom-header": "custom-value"}

proxy_handler_instance = MyCustomHandler()
```

2. 이 파일을 프록시 config에 추가합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]
```

3. 서버를 시작하고 요청을 테스트합니다.

```shell
$ litellm /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "good morning good sir"
        }
    ],
    "user": "ishaan-app",
    "temperature": 0.2
    }'
```


## [베타] *신규* async_moderation_hook 

실제 LLM API 호출과 병렬로 moderation 검사를 실행합니다.

Custom Handler에 새 `async_moderation_hook` 함수를 추가합니다.

- 현재 `/chat/completion` 호출에서만 지원됩니다.
- 이 함수는 실제 LLM API 호출과 병렬로 실행됩니다.
- `async_moderation_hook`에서 Exception이 발생하면 해당 Exception을 사용자에게 반환합니다.


:::info

향후 여러 엔드포인트를 지원하기 위해 함수 스키마를 업데이트해야 할 수 있습니다(예: call_type 수락). 이 기능을 사용해 볼 때 이 점을 염두에 두세요.

:::

[Llama Guard content moderation hook](https://github.com/BerriAI/litellm/blob/main/enterprise/enterprise_hooks/llm_guard.py)에서 전체 예제를 확인하세요.

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm
from fastapi import HTTPException

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger): # https://docs.litellm.ai/docs/observability/custom_callback#callback-class
    # Class variables or attributes
    def __init__(self):
        pass

    #### ASYNC #### 
    
    async def async_log_pre_api_call(self, model, messages, kwargs):
        pass

    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        pass

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time):
        pass

    #### CALL HOOKS - proxy only #### 

    async def async_pre_call_hook(self, user_api_key_dict: UserAPIKeyAuth, cache: DualCache, data: dict, call_type: Literal["completion", "embeddings"]):
        data["model"] = "my-new-model"
        return data 
    
    async def async_moderation_hook( ### 👈 KEY CHANGE ###
        self,
        data: dict,
    ):
        messages = data["messages"]
        print(messages)
        if messages[0]["content"] == "hello world": 
            raise HTTPException(
                    status_code=400, detail={"error": "Violated content safety policy"}
                )

proxy_handler_instance = MyCustomHandler()
```


2. 이 파일을 프록시 config에 추가합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]
```

3. 서버를 시작하고 요청을 테스트합니다.

```shell
$ litellm /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "Hello world"
        }
    ],
    }'
```

## 고급 - 'user' 매개변수 적용

OpenAI 엔드포인트에 대한 모든 호출에 'user' 매개변수가 포함되도록 하려면 `enforce_user_param`을 true로 설정합니다.

[**코드 보기**](https://github.com/BerriAI/litellm/blob/4777921a31c4c70e4d87b927cb233b6a09cd8b51/litellm/proxy/auth/auth_checks.py#L72)

```yaml
general_settings:
  enforce_user_param: True
```

**결과**

<Image img={require('../../img/end_user_enforcement.png')}/>

## 고급 - 거부된 메시지를 응답으로 반환

chat completions 및 text completion 호출에서는 거부된 메시지를 사용자 응답으로 반환할 수 있습니다.

문자열을 반환하면 됩니다. LiteLLM은 엔드포인트와 스트리밍/비스트리밍 여부에 따라 올바른 형식으로 응답을 반환합니다.

chat/text completion이 아닌 엔드포인트에서는 이 응답이 400 상태 코드 예외로 반환됩니다.


### 1. Custom Handler 생성

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm
from litellm.utils import get_formatted_prompt

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger):
    def __init__(self):
        pass

    #### CALL HOOKS - proxy only #### 

    async def async_pre_call_hook(self, user_api_key_dict: UserAPIKeyAuth, cache: DualCache, data: dict, call_type: Literal[
            "completion",
            "text_completion",
            "embeddings",
            "image_generation",
            "moderation",
            "audio_transcription",
        ]) -> Optional[dict, str, Exception]: 
        formatted_prompt = get_formatted_prompt(data=data, call_type=call_type)

        if "Hello world" in formatted_prompt:
            return "This is an invalid response"

        return data 

proxy_handler_instance = MyCustomHandler()
```

### 2. config.yaml 업데이트

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]
```


### 3. 테스트

```shell
$ litellm /path/to/config.yaml
```
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "Hello world"
        }
    ],
    }'
```

**예상 응답**

```
{
    "id": "chatcmpl-d00bbede-2d90-4618-bf7b-11a1c23cf360",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "This is an invalid response.", # 👈 REJECTED RESPONSE
                "role": "assistant"
            }
        }
    ],
    "created": 1716234198,
    "model": null,
    "object": "chat.completion",
    "system_fingerprint": null,
    "usage": {}
}
```

## 고급 - 오류 응답 변환

`async_post_call_failure_hook`을 사용해 기술적인 API 오류를 사용자 친화적인 메시지로 변환합니다. 원래 오류를 대체하려면 `HTTPException`을 반환하고, 원래 예외를 사용하려면 `None`을 반환합니다.

```python
from litellm.integrations.custom_logger import CustomLogger
from fastapi import HTTPException
from typing import Optional
import litellm

class MyErrorTransformer(CustomLogger):
    async def async_post_call_failure_hook(
        self,
        request_data: dict,
        original_exception: Exception,
        user_api_key_dict: UserAPIKeyAuth,
        traceback_str: Optional[str] = None,
    ) -> Optional[HTTPException]:
        if isinstance(original_exception, litellm.ContextWindowExceededError):
            return HTTPException(
                status_code=400,
                detail="Your prompt is too long. Please reduce the length and try again."
            )
        if isinstance(original_exception, litellm.RateLimitError):
            return HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again in a moment."
            )
        return None  # Use original exception

proxy_handler_instance = MyErrorTransformer()
```

**결과:** 클라이언트는 `"ContextWindowExceededError: Prompt exceeds context window"` 대신 `"Your prompt is too long..."`를 받습니다.

## 고급 - 사용자 지정 HTTP 응답 헤더 삽입

`async_post_call_response_headers_hook`을 사용해 응답에 사용자 지정 HTTP 헤더를 삽입합니다. 이 훅은 LLM API 호출 **성공 및 실패 모두**에서 실행됩니다.

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.proxy_server import UserAPIKeyAuth
from typing import Any, Dict, Optional

class CustomHeaderLogger(CustomLogger):
    def __init__(self):
        super().__init__()

    async def async_post_call_response_headers_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_headers: Optional[Dict[str, str]] = None,
    ) -> Optional[Dict[str, str]]:
        """
        Inject custom headers into all responses (success and failure).
        """
        return {"x-custom-header": "custom-value"}

proxy_handler_instance = CustomHeaderLogger()
```
