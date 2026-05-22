### Provider별 Params 설정 {#setting-provider-specific-params}

목표: OpenAI + Cohere 전반에서 max tokens 설정

**1. completion을 통해**

LiteLLM은 max_tokens를 해당 모델 provider가 따르는 명명 규칙에 맞게 자동으로 변환합니다.

```python
from litellm import completion
import os

## set ENV variables 
os.environ["OPENAI_API_KEY"] = "your-openai-key" 
os.environ["COHERE_API_KEY"] = "your-cohere-key" 

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(model="gpt-3.5-turbo", messages=messages, max_tokens=100)

# cohere call
response = completion(model="command-nightly", messages=messages, max_tokens=100)
print(response)
```

**2. provider-specific config를 통해**

LiteLLM의 모든 provider에 대해 각 provider의 특정 params(명명 규칙 등)를 준비해 두었습니다. `litellm.<provider_name>Config`로 해당 provider를 불러와 그 provider에 맞게 설정하면 됩니다. 

모든 provider configs에는 타입이 지정되어 있고 docstrings가 있으므로, VSCode에서 자동 완성과 함께 각 항목의 의미 설명을 확인할 수 있습니다. 

다음은 provider configs를 통해 max tokens를 설정하는 예시입니다. 
