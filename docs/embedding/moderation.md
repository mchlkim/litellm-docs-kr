# `litellm.moderation()`
LiteLLM은 OpenAI의 moderation 엔드포인트를 지원합니다.

## 사용법
```python
import os
from litellm import moderation
os.environ['OPENAI_API_KEY'] = ""
response = moderation(input="i'm ishaan cto of litellm")   
```
