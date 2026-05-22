# Mock Completion() 응답 - 테스트 비용 절감 💰 {#mock-completion-responses-save-testing-costs}

테스트 목적으로 `completion()`에 `mock_response`를 함께 사용하여 completion 엔드포인트 호출을 모의 처리할 수 있습니다. 

이렇게 하면 LLM API를 호출하지 않고 기본 응답이 포함된 응답 객체를 반환합니다. 스트리밍에서도 동일하게 동작합니다. 

## 빠른 시작 {#quick-start}
```python
from litellm import completion 

model = "gpt-3.5-turbo"
messages = [{"role":"user", "content":"This is a test request"}]

completion(model=model, messages=messages, mock_response="It's simple to use and easy to get started")
```

## 스트리밍 {#streaming}

```python
from litellm import completion 
model = "gpt-3.5-turbo"
messages = [{"role": "user", "content": "Hey, I'm a mock request"}]
response = completion(model=model, messages=messages, stream=True, mock_response="It's simple to use and easy to get started")
for chunk in response: 
    print(chunk) # {'choices': [{'delta': {'role': 'assistant', 'content': 'Thi'}, 'finish_reason': None}]}
    complete_response += chunk["choices"][0]["delta"]["content"]
```

## (비스트리밍) Mock Response 객체 {#non-streaming-mock-response-object}

```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "This is a mock request",
        "role": "assistant",
        "logprobs": null
      }
    }
  ],
  "created": 1694459929.4496052,
  "model": "MockResponse",
  "usage": {
    "prompt_tokens": null,
    "completion_tokens": null,
    "total_tokens": null
  }
}
```

## `completion`과 `mock_response`를 사용해 pytest 함수 작성하기 {#building-a-pytest-function-using-completion-with-mock-response}

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
        assert(response['choices'][0]['message']['content'] == "LiteLLM is awesome")
    except Exception as e:
        pytest.fail(f"Error occurred: {e}")
```
