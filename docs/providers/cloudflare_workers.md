# Cloudflare Workers AI 제공자 {#cloudflare-workers-ai}
https://developers.cloudflare.com/workers-ai/models/text-generation/

## API 키 {#api-key}
```python
# env variable
os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"

response = completion(
    model="cloudflare/@cf/meta/llama-2-7b-chat-int8", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage-streaming}
```python
from litellm import completion
import os

os.environ['CLOUDFLARE_API_KEY'] = "3dnSGlxxxx"
os.environ['CLOUDFLARE_ACCOUNT_ID'] = "03xxxxx"

response = completion(
    model="cloudflare/@hf/thebloke/codellama-7b-instruct-awq", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 지원 모델 {#supported-models}
여기에 나열된 모든 모델을 지원합니다. https://developers.cloudflare.com/workers-ai/models/text-generation/

| 모델 이름                         | 함수 호출                                                |
|-----------------------------------|----------------------------------------------------------|
| `@cf/meta/llama-2-7b-chat-fp16`     | `completion(model="mistral/mistral-tiny", messages)`    |
| `@cf/meta/llama-2-7b-chat-int8`     | `completion(model="mistral/mistral-small", messages)`   |
| `@cf/mistral/mistral-7b-instruct-v0.1` | `completion(model="mistral/mistral-medium", messages)` |
| `@hf/thebloke/codellama-7b-instruct-awq` | `completion(model="codellama/codellama-medium", messages)` |
