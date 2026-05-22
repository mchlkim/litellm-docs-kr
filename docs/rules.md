# Rules {#rules}

LLM API 호출의 입력 또는 출력을 기준으로 요청을 실패 처리할 때 사용합니다.


```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENROUTER_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 

litellm.post_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="gpt-3.5-turbo", messages=[{"role": "user", 
"content": "Hey, how's it going?"}], fallbacks=["openrouter/gryphe/mythomax-l2-13b"])
```

## 사용 가능한 엔드포인트 {#available-endpoints}

* `litellm.pre_call_rules = []` - API 호출을 수행하기 전에 순회할 함수 목록입니다. 각 함수는 True(호출 허용) 또는 False(호출 실패 처리)를 반환해야 합니다.

* `litellm.post_call_rules = []` - API 호출을 수행한 뒤 순회할 함수 목록입니다. 각 함수는 True(호출 허용) 또는 False(호출 실패 처리)를 반환해야 합니다.


## rule의 예상 형식 {#expected-format-of-rule}

```python
def my_custom_rule(input: str) -> bool: # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 
```

#### 입력 {#inputs}
* `input`: *str*: 사용자 입력 또는 LLM 응답입니다.

#### 출력 {#outputs}
* `bool`: True(호출 허용) 또는 False(호출 실패 처리)를 반환합니다.


## 예제 Rules

### 예제 1: 사용자 입력이 너무 길면 실패 처리 {#example-1-fail-if-user-input-is-too-long}

```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if len(input) > 10: # fail call if too long
        return False 
    return True 

litellm.pre_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hey, how's it going?"}])
```

### 예제 2: LLM이 답변을 거부하면 uncensored model로 fallback {#example-2-fallback-to-uncensored-model-if-llm-refuses-to-answer}


```python
import litellm 
import os 

# set env vars 
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENROUTER_API_KEY"] = "your-api-key"

def my_custom_rule(input): # receives the model response 
    if "i don't think i can answer" in input: # trigger fallback if the model refuses to answer 
        return False 
    return True 

litellm.post_call_rules = [my_custom_rule] # have these be functions that can be called to fail a call

response = litellm.completion(model="gpt-3.5-turbo", messages=[{"role": "user", 
"content": "Hey, how's it going?"}], fallbacks=["openrouter/gryphe/mythomax-l2-13b"])
```
