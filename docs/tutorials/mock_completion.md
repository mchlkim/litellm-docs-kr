# Mock Completion Responses - 테스트 비용 절감

LLM API를 호출하지 않고 LLM Completion 호출을 테스트하려 하나요?
`mock_response`를 `litellm.completion`에 전달하면 LiteLLM이 LLM API를 호출하거나 비용을 쓰지 않고 응답을 바로 반환합니다.

## `mock_response`와 함께 `completion()` 사용

```python
from litellm import completion 

model = "gpt-3.5-turbo"
messages = [{"role":"user", "content":"Why is LiteLLM amazing?"}]

completion(model=model, messages=messages, mock_response="It's simple to use and easy to get started")
```

## `completion`을 사용하는 pytest 함수 만들기

```python
from litellm import completion
import pytest

def test_completion_openai():
    try:
        response = completion(
            model="gpt-3.5-turbo",
            messages=[{"role":"user", "content":"Why is LiteLLM amazing?"}],
            mock_response="LiteLLM is awesome"
        )
        # Add any assertions here to check the response
        print(response)
        print(response['choices'][0]['finish_reason'])
    except Exception as e:
        pytest.fail(f"Error occurred: {e}")
```
