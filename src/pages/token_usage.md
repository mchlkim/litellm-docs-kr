# 토큰 사용량
기본적으로 LiteLLM은 모든 completion 요청에서 토큰 사용량을 반환합니다([여기 참조](https://litellm.readthedocs.io/en/latest/output/)).

또한 제공자 전반의 토큰 사용량을 계산하기 위해 3개의 공개 헬퍼 함수를 제공합니다.

- `token_counter`: 주어진 입력의 토큰 수를 반환합니다. 모델 기반 토크나이저를 사용하며, 모델별 토크나이저를 사용할 수 없는 경우 기본값으로 tiktoken을 사용합니다. 

- `cost_per_token`: prompt(input) 및 completion(output) 토큰의 비용(USD)을 반환합니다. `__init__.py`와 [커뮤니티 리소스](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 확인할 수 있는 model_cost map을 사용합니다.

- `completion_cost`: 주어진 LLM API 호출의 전체 비용(USD)을 반환합니다. `token_counter`와 `cost_per_token`을 결합하여 해당 쿼리의 비용을 반환합니다(input과 output 비용 모두 계산).

## 사용 예 

1. `token_counter`

```python
from litellm import token_counter

messages = [{"role": "user", "content": "Hey, how's it going"}]
print(token_counter(model="gpt-3.5-turbo", messages=messages))
```

2. `cost_per_token`

```python
from litellm import cost_per_token

prompt_tokens =  5
completion_tokens = 10
prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar = cost_per_token(model="gpt-3.5-turbo", prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)

print(prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar)
```

3. `completion_cost`

```python
from litellm import completion_cost

prompt = "Hey, how's it going"
completion = "Hi, I'm gpt - I am doing well"
cost_of_query = completion_cost(model="gpt-3.5-turbo", prompt=prompt, completion=completion))

print(cost_of_query)
```
