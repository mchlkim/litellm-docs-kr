# 로컬 디버깅 {#local-debugging}
로컬 디버깅에는 두 가지 방법이 있습니다. `litellm._turn_on_debug()`를 사용하거나, 사용자 지정 함수 `completion(...logger_fn=<your_local_function>)`를 전달하는 방식입니다. 경고: 프로덕션에서는 `_turn_on_debug()`를 사용하지 마세요. API 키를 로깅하므로 로그 파일에 남을 수 있습니다.

## 상세 로그 설정 {#set-verbose}

litellm이 수행하는 모든 작업의 출력문을 확인하는 데 유용합니다.
```python
import litellm
from litellm import completion

litellm._turn_on_debug() # 👈 this is the 1-line change you need to make

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["COHERE_API_KEY"] = "cohere key"

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="gpt-3.5-turbo", messages=messages)

# cohere call
response = completion("command-nightly", messages)
```

## JSON 로그 

로그를 JSON으로 저장해야 한다면 `litellm.json_logs = True`만 설정하면 됩니다.

현재는 litellm의 원시 POST 요청만 JSON으로 로깅합니다 - [**코드 보기**]. 

[여기에서 피드백 공유](https://github.com/BerriAI/litellm/issues)

## 로거 함수 {#logger-function}
하지만 때로는 API 호출에 정확히 무엇이 전송되고 무엇이 반환되는지만 확인하면 충분할 때가 있습니다. 예를 들어 API 호출이 실패한다면 왜 실패하는지, 어떤 정확한 파라미터가 설정되는지 확인해야 할 수 있습니다. 

이 경우 LiteLLM에서는 모델 호출의 입력/출력을 확인하거나 수정할 수 있도록 사용자 지정 로깅 함수를 전달할 수 있습니다. 

**참고**: dict 객체를 받도록 작성해야 합니다. 

사용자 지정 함수 

```python
def my_custom_logging_fn(model_call_dict):
    print(f"model call details: {model_call_dict}")
```

### 전체 예제 {#complete-예제}
```python
from litellm import completion

def my_custom_logging_fn(model_call_dict):
    print(f"model call details: {model_call_dict}")

## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["COHERE_API_KEY"] = "cohere key"

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="gpt-3.5-turbo", messages=messages, logger_fn=my_custom_logging_fn)

# cohere call
response = completion("command-nightly", messages, logger_fn=my_custom_logging_fn)
```

## 문제가 계속 발생하나요? {#still-seeing-issues}

[Discord](https://discord.com/invite/wuPM9dRgDw)에 참여하세요. 

최대한 빠르게 도와드리겠습니다 ❤️
