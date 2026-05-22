# Oobabooga Text Web API 튜토리얼

### LiteLLM 설치 및 가져오기
```python 
!uv add litellm
from litellm import completion 
import os
```

### oobabooga 모델 호출
`api_base` 설정을 잊지 마세요.
```python
response = completion(
  model="oobabooga/WizardCoder-Python-7B-V1.0-GPTQ",
  messages=[{ "content": "can you write a binary tree traversal preorder","role": "user"}], 
  api_base="http://localhost:5000",
  max_tokens=4000
)
```

### 응답 확인
```python 
print(response)
```

이 튜토리얼은 [Shuai Shao](https://www.linkedin.com/in/shuai-sh/) 님이 작성했습니다.
