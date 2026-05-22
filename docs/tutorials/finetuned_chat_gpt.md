# Fine-Tuned `gpt-3.5-turbo` 사용하기 {#using-fine-tuned-gpt-35-turbo}
LiteLLM에서는 fine-tuned `gpt-3.5-turbo` 모델을 `completion`으로 호출할 수 있습니다.
사용자 지정 fine-tuned `gpt-3.5-turbo` 모델을 만들려면 다음 튜토리얼을 참고하세요: https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset

fine-tuned 모델을 만든 뒤에는 `litellm.completion()`으로 호출할 수 있습니다.

## 사용법
```python
import os
from litellm import completion

# LiteLLM reads from your .env
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="ft:gpt-3.5-turbo:my-org:custom_suffix:id",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ]
)

print(response.choices[0].message)
```

## 사용법 - OpenAI Organization ID 설정 {#usage---setting-openai-organization-id}
LiteLLM에서는 OpenAI LLM을 호출할 때 OpenAI Organization을 지정할 수 있습니다. 자세한 내용은 [Organization ID 설정](https://docs.litellm.ai/docs/providers/openai#setting-organization-id-for-completion-calls)을 참고하세요.
다음 방법 중 하나로 설정할 수 있습니다.
- 환경 변수 `OPENAI_ORGANIZATION`
- `litellm.completion(model=model, organization="your-organization-id")` 파라미터
- `litellm.organization="your-organization-id"`로 설정
```python
import os
from litellm import completion

# LiteLLM reads from your .env
os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENAI_ORGANIZATION"] = "your-org-id" # Optional

response = completion(
  model="ft:gpt-3.5-turbo:my-org:custom_suffix:id",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ]
)

print(response.choices[0].message)
```
