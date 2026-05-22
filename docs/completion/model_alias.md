# 모델 별칭 {#model-alias}

최종 사용자에게 표시하는 모델 이름은 LiteLLM에 전달하는 이름과 다를 수 있습니다. 예를 들어 백엔드에서는 `gpt-3.5-turbo-16k`를 호출하면서 사용자에게는 `GPT-3.5`를 표시할 수 있습니다.

LiteLLM은 모델 별칭 매핑을 전달할 수 있게 하여 이를 간소화합니다.

# 예상 형식 {#expected-format}

```python
litellm.model_alias_map = {
    # a dictionary containing a mapping of the alias string to the actual litellm model name string
    "model_alias": "litellm_model_name"
}
```

# 사용법 {#usage}

### 관련 코드 {#relevant-code}
```python
model_alias_map = {
    "GPT-3.5": "gpt-3.5-turbo-16k",
    "llama2": "replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf"
}

litellm.model_alias_map = model_alias_map
```

### 전체 코드 {#complete-code}
```python
import litellm 
from litellm import completion 


## set ENV variables
os.environ["OPENAI_API_KEY"] = "openai key"
os.environ["REPLICATE_API_KEY"] = "cohere key"

## set model alias map
model_alias_map = {
    "GPT-3.5": "gpt-3.5-turbo-16k",
    "llama2": "replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf"
}

litellm.model_alias_map = model_alias_map

messages = [{ "content": "Hello, how are you?","role": "user"}]

# call "gpt-3.5-turbo-16k"
response = completion(model="GPT-3.5", messages=messages)

# call replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca1...
response = completion("llama2", messages)
```
