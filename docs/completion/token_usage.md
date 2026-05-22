# Completion Token 사용법 및 비용 {#completion-token-사용법--cost}
기본적으로 LiteLLM은 모든 completion 요청에서 토큰 사용량을 반환합니다([여기 보기](https://litellm.readthedocs.io/en/latest/output/)).

LiteLLM은 모든 호출에서 `response_cost`를 반환합니다.

```python
from litellm import completion 

response = litellm.completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],
            mock_response="Hello world",
        )

print(response._hidden_params["response_cost"])
```

LiteLLM은 다음과 같은 헬퍼 함수도 제공합니다.

- `encode`: 전달된 텍스트를 모델별 tokenizer로 인코딩합니다. [**코드로 이동**](#1-encode)

- `decode`: 전달된 토큰을 모델별 tokenizer로 디코딩합니다. [**코드로 이동**](#2-decode)

- `token_counter`: 주어진 입력의 토큰 수를 반환합니다. 모델에 맞는 tokenizer를 사용하며, 모델별 tokenizer가 없으면 기본값으로 tiktoken을 사용합니다. [**코드로 이동**](#3-token_counter)

- `create_pretrained_tokenizer` 및 `create_tokenizer`: LiteLLM은 OpenAI, Cohere, Anthropic, Llama2, Llama3 모델에 대한 기본 tokenizer 지원을 제공합니다. 다른 모델을 사용하는 경우 custom tokenizer를 만들고 `encode`, `decode`, `token_counter` 메서드에 `custom_tokenizer`로 전달할 수 있습니다. 아래 4번 섹션을 참고하세요.

- `cost_per_token`: prompt(input) 및 completion(output) 토큰의 비용(USD)을 반환합니다. `api.litellm.ai`의 실시간 목록을 사용합니다. [**코드로 이동**](#5-cost_per_token)

- `completion_cost`: 주어진 LLM API Call의 전체 비용(USD)을 반환합니다. `token_counter`와 `cost_per_token`을 결합해 해당 query 비용을 반환합니다(input 및 output 비용 모두 계산). [**코드로 이동**](#6-completion_cost)

- `get_max_tokens`: 주어진 모델에 허용되는 최대 토큰 수를 반환합니다. [**코드로 이동**](#7-get_max_tokens)

- `model_cost`: 모든 모델의 `max_tokens`, `input_cost_per_token`, `output_cost_per_token`을 포함한 딕셔너리를 반환합니다. 아래에 표시된 `api.litellm.ai` 호출을 사용합니다. [**코드로 이동**](#8-model_cost)

- `register_model`: model cost dictionary에 새 모델과 가격 정보를 등록하거나 기존 모델을 override합니다. [**코드로 이동**](#9-register_model)

- `api.litellm.ai`: [지원되는 모든 모델](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)의 실시간 token 및 price count입니다. [**코드로 이동**](#10-apilitellmai)

📣 [이 목록은 커뮤니티에서 관리합니다](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json). 기여를 환영합니다! ❤️

## 예제 사용법 

### 1. `encode`
인코딩은 anthropic, cohere, llama2, openai에 대한 모델별 tokenizer를 제공합니다. 지원되지 않는 모델이 전달되면 기본값으로 tiktoken(openai의 tokenizer)을 사용합니다.

```python
from litellm import encode, decode

sample_text = "Hellö World, this is my input string!"
# openai encoding + decoding
openai_tokens = encode(model="gpt-3.5-turbo", text=sample_text)
print(openai_tokens)
```

### 2. `decode`

디코딩은 anthropic, cohere, llama2, openai에서 지원됩니다.

```python
from litellm import encode, decode

sample_text = "Hellö World, this is my input string!"
# openai encoding + decoding
openai_tokens = encode(model="gpt-3.5-turbo", text=sample_text)
openai_text = decode(model="gpt-3.5-turbo", tokens=openai_tokens)
print(openai_text)
```

### 3. `token_counter`

```python
from litellm import token_counter

messages = [{"user": "role", "content": "Hey, how's it going"}]
print(token_counter(model="gpt-3.5-turbo", messages=messages))
```

### 4. `create_pretrained_tokenizer` 및 `create_tokenizer` {#4-create_pretrained_tokenizer-and-create_tokenizer}

```python
from litellm import create_pretrained_tokenizer, create_tokenizer

# get tokenizer from huggingface repo
custom_tokenizer_1 = create_pretrained_tokenizer("Xenova/llama-3-tokenizer")

# use tokenizer from json file
with open("tokenizer.json") as f:
    json_data = json.load(f)

json_str = json.dumps(json_data)

custom_tokenizer_2 = create_tokenizer(json_str)
```

### 5. `cost_per_token`

```python
from litellm import cost_per_token

prompt_tokens =  5
completion_tokens = 10
prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar = cost_per_token(model="gpt-3.5-turbo", prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)

print(prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar)
```

### 6. `completion_cost`

* 입력: `litellm.completion()` 응답 **또는** prompt + completion 문자열을 받습니다.
* 출력: `completion` 호출 비용을 `float`로 반환합니다.

**litellm.completion()**
```python
from litellm import completion, completion_cost

response = completion(
            model="bedrock/anthropic.claude-v2",
            messages=messages,
            request_timeout=200,
        )
# pass your response from completion to completion_cost
cost = completion_cost(completion_response=response)
formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```

**prompt + completion 문자열**
```python
from litellm import completion_cost
cost = completion_cost(model="bedrock/anthropic.claude-v2", prompt="Hey!", completion="How's it going?")
formatted_string = f"${float(cost):.10f}"
print(formatted_string)
```
### 7. `get_max_tokens`

입력: 모델 이름을 받습니다. 예: gpt-3.5-turbo. 전체 목록을 가져오려면 litellm.model_list를 호출하세요.
출력: 주어진 모델에 허용되는 최대 토큰 수를 반환합니다.

```python 
from litellm import get_max_tokens 

model = "gpt-3.5-turbo"

print(get_max_tokens(model)) # Output: 4097
```

### 8. `model_cost`

* 출력: [커뮤니티 관리 목록](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에 있는 모든 모델의 max_tokens, input_cost_per_token, output_cost_per_token을 포함한 dict object를 반환합니다.

```python 
from litellm import model_cost 

print(model_cost) # {'gpt-3.5-turbo': {'max_tokens': 4000, 'input_cost_per_token': 1.5e-06, 'output_cost_per_token': 2e-06}, ...}
```

### 9. `register_model`

* 입력: model cost dictionary 또는 hosted json blob의 url 중 하나를 제공합니다.
* 출력: 업데이트된 model_cost dictionary를 반환하고 모델 세부 정보로 litellm.model_cost를 업데이트합니다.

**딕셔너리**
```python
import litellm

litellm.register_model({
        "gpt-4": {
        "max_tokens": 8192, 
        "input_cost_per_token": 0.00002, 
        "output_cost_per_token": 0.00006, 
        "litellm_provider": "openai", 
        "mode": "chat"
    },
})
```

**json blob용 URL**
```python
import litellm

litellm.register_model(model_cost=
"https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json")
```

### hosted model_cost_map을 가져오지 않기 {#dont-pull-hosted-model_cost_map}
방화벽이 있거나 model cost map의 로컬 복사본만 사용하려는 경우 다음과 같이 설정할 수 있습니다.
```bash
export LITELLM_LOCAL_MODEL_COST_MAP="True"
```

참고: 이 경우 업데이트된 가격과 더 새로운 모델을 가져오려면 업그레이드해야 합니다.
