# Anyscale
https://app.endpoints.anyscale.com/

## API 키 {#api-key}
```python
# env variable
os.environ['ANYSCALE_API_KEY']
```

## Sample 사용법
```python
from litellm import completion
import os

os.environ['ANYSCALE_API_KEY'] = ""
response = completion(
    model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", 
    messages=messages
)
print(response)
```

## Sample 사용법 - Streaming
```python
from litellm import completion
import os

os.environ['ANYSCALE_API_KEY'] = ""
response = completion(
    model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```


## 지원 모델 {#supported-models}
https://app.endpoints.anyscale.com/에 나열된 모든 모델을 지원합니다. 모델 목록, 가격, 토큰 윈도우 등은 [여기](https://github.com/BerriAI/litellm/blob/31fbb095c2c365ef30caf132265fe12cff0ef153/model_prices_and_context_window.json#L957)에서 계속 관리합니다.

| 모델 이름               | 함수 호출                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| llama2-7b-chat | `completion(model="anyscale/meta-llama/Llama-2-7b-chat-hf", messages)` | 
| llama-2-13b-chat | `completion(model="anyscale/meta-llama/Llama-2-13b-chat-hf", messages)` | 
| llama-2-70b-chat | `completion(model="anyscale/meta-llama/Llama-2-70b-chat-hf", messages)` | 
| `mistral-7b-instruct` | `completion(model="anyscale/mistralai/Mistral-7B-Instruct-v0.1", messages)` | 
| `CodeLlama-34b-Instruct` | `completion(model="anyscale/codellama/CodeLlama-34b-Instruct-hf", messages)` | 



