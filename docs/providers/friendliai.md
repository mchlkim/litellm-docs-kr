# FriendliAI

:::info
**모든 FriendliAI model을 지원합니다. completion request를 보낼 때 `friendliai/`를 prefix로 설정하세요.**
:::

| 속성                   | 세부 정보                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| 설명                | production-ready compound AI system을 구축하기 위한 빠르고 효율적인 inference engine입니다. |
| LiteLLM provider 경로  | `friendliai/`                                                                                   |
| Provider 문서               | [FriendliAI ↗](https://friendli.ai/docs/sdk/integrations/litellm)                               |
| 지원 OpenAI endpoint | `/chat/completions`, `/completions`                                                             |

## API key {#api-key}

```python
# env variable
os.environ['FRIENDLI_TOKEN']
```

## 샘플 사용법 {#sample-usage}

```python
from litellm import completion
import os

os.environ['FRIENDLI_TOKEN'] = ""
response = completion(
    model="friendliai/meta-llama-3.1-8b-instruct",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - streaming {#sample-usage-streaming}

```python
from litellm import completion
import os

os.environ['FRIENDLI_TOKEN'] = ""
response = completion(
    model="friendliai/meta-llama-3.1-8b-instruct",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 지원 model {#supported-models}

모든 FriendliAI model을 지원합니다. completion request를 보낼 때 `friendliai/`를 prefix로 설정하세요.

| Model name                  | 함수 호출                                                          |
| --------------------------- | ---------------------------------------------------------------------- |
| `meta-llama-3.1-8b-instruct`  | `completion(model="friendliai/meta-llama-3.1-8b-instruct", messages)`  |
| `meta-llama-3.1-70b-instruct` | `completion(model="friendliai/meta-llama-3.1-70b-instruct", messages)` |
