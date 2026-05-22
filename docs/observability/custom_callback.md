# 사용자 지정 콜백 {#custom-callbacks}

:::info
**PROXY용** [여기로 이동](../proxy/logging.md#custom-callback-class-async)
::: 

## 콜백 클래스 {#callback-class}
litellm에서 이벤트가 발생하는 시점에 맞춰 정확히 로그를 남기도록 사용자 지정 콜백 클래스를 만들 수 있습니다. 

```python
import litellm
from litellm.integrations.custom_logger import CustomLogger
from litellm import completion, acompletion

class MyCustomHandler(CustomLogger):
    def log_pre_api_call(self, model, messages, kwargs): 
        print(f"Pre-API Call")
    
    def log_post_api_call(self, kwargs, response_obj, start_time, end_time): 
        print(f"Post-API Call")
    

    def log_success_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Success")

    def log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Failure")
    
    #### ASYNC #### - for acompletion/aembeddings

    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success")

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Failure")

customHandler = MyCustomHandler()

litellm.callbacks = [customHandler]

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

## 일반적인 훅 {#common-hooks}

- `async_log_success_event` - 성공한 API 호출을 기록합니다.
- `async_log_failure_event` - 실패한 API 호출을 기록합니다.  
- `log_pre_api_call` - API 호출 전에 기록합니다.
- `log_post_api_call` - API 호출 후에 기록합니다.

**Proxy 전용 훅**(LiteLLM Proxy에서만 동작):
- `async_post_call_success_hook` - 사용자 데이터에 접근하고 응답을 수정합니다.
- `async_pre_call_hook` - 전송 전에 요청을 수정합니다.

### 예제: async_post_call_success_hook에서 응답 수정하기 {#example-modifying-the-response-in-async_post_call_success_hook}

`async_post_call_success_hook`을 사용하면 응답이 클라이언트에 반환되기 전에 사용자 지정 헤더나 메타데이터를 추가할 수 있습니다. 예:

```python
async def async_post_call_success_hook(data, user_api_key_dict, response):
    # Add a custom header to the response
    additional_headers = getattr(response, "_hidden_params", {}).get("additional_headers", {}) or {}
    additional_headers["x-litellm-custom-header"] = "my-value"
    if not hasattr(response, "_hidden_params"):
        response._hidden_params = {}
    response._hidden_params["additional_headers"] = additional_headers
    return response
```

이렇게 하면 다운스트림 소비자가 사용할 사용자 지정 메타데이터나 헤더를 응답에 주입할 수 있습니다. 이 패턴을 사용해 클라이언트, 프록시 또는 관측성 도구로 정보를 전달할 수 있습니다.

## 콜백 함수 {#callback-functions}
특정 이벤트(예: 입력 시점)에만 로그를 남기고 싶다면 콜백 함수를 사용할 수 있습니다. 

다음 시점에 트리거되도록 사용자 지정 콜백을 설정할 수 있습니다.
- `litellm.input_callback`   - LLM API 호출을 만들기 전에 입력/변환된 입력을 추적합니다.
- `litellm.success_callback` - LLM API 호출 후 입력/출력을 추적합니다.
- `litellm.failure_callback` - litellm 호출의 입력/출력과 예외를 추적합니다.

## 사용자 지정 콜백 함수 정의 {#defining-a-custom-callback-function}
특정 인수를 받는 사용자 지정 콜백 함수를 만듭니다.

```python
def custom_callback(
    kwargs,                 # kwargs to completion
    completion_response,    # response from completion
    start_time, end_time    # start/end time
):
    # Your custom code here
    print("LITELLM: in custom callback function")
    print("kwargs", kwargs)
    print("completion_response", completion_response)
    print("start_time", start_time)
    print("end_time", end_time)
```

### 사용자 지정 콜백 함수 설정 {#setting-the-custom-callback-function}
```python
import litellm
litellm.success_callback = [custom_callback]
```

## 사용자 지정 콜백 함수 사용 {#using-your-custom-callback-function}

```python
import litellm
from litellm import completion

# Assign the custom callback function
litellm.success_callback = [custom_callback]

response = completion(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": "Hi 👋 - i'm openai"
        }
    ]
)

print(response)

```

## 비동기 콜백 함수 {#async-callback-functions}

비동기 처리에는 Custom Logger 클래스를 사용하는 것을 권장합니다.

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm import acompletion 

class MyCustomHandler(CustomLogger):
    #### ASYNC #### 
    


    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success")

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Failure")

import asyncio 
customHandler = MyCustomHandler()

litellm.callbacks = [customHandler]

def async completion():
    response = await acompletion(model="gpt-3.5-turbo", messages=[{ "role": "user", "content": "Hi 👋 - i'm openai"}],
                              stream=True)
    async for chunk in response: 
        continue
asyncio.run(completion())
```

**함수**

로그 기록용 비동기 함수만 전달하고 싶은 경우입니다. 

LiteLLM은 현재 비동기 completion/embedding 호출에 대해 비동기 성공 콜백 함수만 지원합니다. 

```python
import asyncio, litellm 

async def async_test_logging_fn(kwargs, completion_obj, start_time, end_time):
    print(f"On Async Success!")

async def test_chat_openai():
    try:
        # litellm.set_verbose = True
        litellm.success_callback = [async_test_logging_fn]
        response = await litellm.acompletion(model="gpt-3.5-turbo",
                              messages=[{
                                  "role": "user",
                                  "content": "Hi 👋 - i'm openai"
                              }],
                              stream=True)
        async for chunk in response: 
            continue
    except Exception as e:
        print(e)
        pytest.fail(f"An error occurred - {str(e)}")

asyncio.run(test_chat_openai())
```

## kwargs에서 사용할 수 있는 항목 {#whats-available-in-kwargs}

kwargs 딕셔너리에는 API 호출에 대한 모든 세부 정보가 들어 있습니다.

:::info
전체 로깅 페이로드 명세는 [Standard Logging Payload Spec](https://docs.litellm.ai/docs/proxy/logging_spec)을 참고하세요.
:::

```python
def custom_callback(kwargs, completion_response, start_time, end_time):
    # Access common data
    model = kwargs.get("model")
    messages = kwargs.get("messages", [])
    cost = kwargs.get("response_cost", 0)
    cache_hit = kwargs.get("cache_hit", False)
    
    # Access metadata you passed in
    metadata = kwargs.get("litellm_params", {}).get("metadata", {})
```

**kwargs의 주요 필드:**
- `model` - 모델 이름
- `messages` - 입력 메시지  
- `response_cost` - 계산된 비용
- `cache_hit` - 응답이 캐시되었는지 여부
- `litellm_params.metadata` - 사용자 지정 메타데이터

## 실용 예제 {#practical-examples}

### API 비용 추적 {#track-api-costs}
```python
def track_cost_callback(kwargs, completion_response, start_time, end_time):
    cost = kwargs["response_cost"] # litellm calculates this for you
    print(f"Request cost: ${cost}")

litellm.success_callback = [track_cost_callback]

response = completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hello"}])
```

### LLM 입력 기록 {#log-inputs-to-llms}
```python
def get_transformed_inputs(kwargs):
    params_to_model = kwargs["additional_args"]["complete_input_dict"]
    print("params to model", params_to_model)

litellm.input_callback = [get_transformed_inputs]

response = completion(model="claude-2", messages=[{"role": "user", "content": "Hello"}])
```

### 외부 서비스로 전송 {#send-to-external-service}
```python
import requests

def send_to_analytics(kwargs, completion_response, start_time, end_time):
    data = {
        "model": kwargs.get("model"),
        "cost": kwargs.get("response_cost", 0),
        "duration": (end_time - start_time).total_seconds()
    }
    requests.post("https://your-analytics.com/api", json=data)

litellm.success_callback = [send_to_analytics]
```

## 자주 발생하는 문제 {#common-issues}

### 콜백이 호출되지 않음 {#callback-not-called}
다음을 확인하세요.
1. 콜백을 올바르게 등록했는지 확인합니다. `litellm.callbacks = [MyHandler()]`
2. 올바른 훅 이름을 사용하는지 확인합니다(철자 확인).
3. 라이브러리 모드에서 Proxy 전용 훅을 사용하지 않습니다.

### 성능 문제 {#performance-issues}
- I/O 작업에는 비동기 훅을 사용합니다.
- 콜백 함수에서 블로킹하지 않습니다.
- 예외를 적절히 처리합니다.

```python
class SafeHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        try:
            await external_service(response_obj)
        except Exception as e:
            print(f"Callback error: {e}")  # Log but don't break the flow
```
