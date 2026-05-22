# LiteLLM을 사용한 모델 폴백 {#model-fallbacks-w-litellm}

LiteLLM을 사용해 3개의 LLM 제공업체(OpenAI, Anthropic, Azure)에 걸쳐 모델 폴백을 구현하는 방법입니다. 

## 1. LiteLLM 설치 {#1-install-litellm}
```python 
!uv add litellm
```

## 2. 기본 폴백 코드 {#2-basic-fallbacks-code}
```python 
import litellm
from litellm import embedding, completion

# set ENV variables
os.environ["OPENAI_API_KEY"] = ""
os.environ["ANTHROPIC_API_KEY"] = ""
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

model_fallback_list = ["claude-instant-1", "gpt-3.5-turbo", "chatgpt-test"]

user_message = "Hello, how are you?"
messages = [{ "content": user_message,"role": "user"}]

for model in model_fallback_list:
  try:
      response = completion(model=model, messages=messages)
  except Exception as e:
      print(f"error occurred: {traceback.format_exc()}")
```

## 3. 컨텍스트 창 예외 {#3-context-window-exceptions}
LiteLLM은 Context Window Exceeded 오류를 위해 `InvalidRequestError` 클래스의 하위 클래스를 제공합니다([docs](https://docs.litellm.ai/docs/exception_mapping)).

컨텍스트 창 예외를 기준으로 모델 폴백을 구현합니다. 

LiteLLM은 `get_max_tokens()` 함수도 노출하며, 이 함수로 초과된 컨텍스트 창 한도를 확인할 수 있습니다. 

```python 
import litellm
from litellm import completion, ContextWindowExceededError, get_max_tokens

# set ENV variables
os.environ["OPENAI_API_KEY"] = ""
os.environ["COHERE_API_KEY"] = ""
os.environ["ANTHROPIC_API_KEY"] = ""
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""

context_window_fallback_list = [{"model":"gpt-3.5-turbo-16k", "max_tokens": 16385}, {"model":"gpt-4-32k", "max_tokens": 32768}, {"model": "claude-instant-1", "max_tokens":100000}]

user_message = "Hello, how are you?"
messages = [{ "content": user_message,"role": "user"}]

initial_model = "command-nightly"
try:
    response = completion(model=initial_model, messages=messages)
except ContextWindowExceededError as e:
    model_max_tokens = get_max_tokens(model)
    for model in context_window_fallback_list:
        if model_max_tokens < model["max_tokens"]
        try:
            response = completion(model=model["model"], messages=messages)
            return response
        except ContextWindowExceededError as e:
            model_max_tokens = get_max_tokens(model["model"])
            continue

print(response)
```
