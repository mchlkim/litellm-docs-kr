# 입력 메시지 트리밍 {#trimming-input-messages}
**메시지가 모델의 토큰 제한 또는 지정된 `max_tokens`를 초과하지 않도록 `litellm.trim_messages()`를 사용하세요.**

## 사용법
```python
from litellm import completion
from litellm.utils import trim_messages

response = completion(
    model=model, 
    messages=trim_messages(messages, model) # trim_messages ensures tokens(messages) < max_tokens(model)
) 
```

## 사용법 - `max_tokens` 설정 {#usage---set-max_tokens}
```python
from litellm import completion
from litellm.utils import trim_messages

response = completion(
    model=model, 
    messages=trim_messages(messages, model, max_tokens=10), # trim_messages ensures tokens(messages) < max_tokens
) 
```

## 매개변수 {#parameters}

이 함수는 다음 매개변수를 사용합니다.

- `messages`:[필수] 입력 메시지 목록이어야 합니다.

- `model`:[선택 사항] 사용할 LiteLLM 모델입니다. 대신 `max_tokens` 매개변수를 지정할 수 있으므로 이 매개변수는 선택 사항입니다.

- `max_tokens`:[선택 사항] 메시지에 수동으로 설정하는 정수형 상한입니다.

- `trim_ratio`:[선택 사항] 트리밍 후 사용할 토큰의 목표 비율을 나타냅니다. 기본값은 0.75이며, 메시지가 약 75%를 사용하도록 트리밍된다는 뜻입니다.
