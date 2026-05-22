import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Galadriel
https://docs.galadriel.com/api-reference/chat-completion-API

LiteLLM은 Galadriel의 모든 모델을 지원합니다.

## API 키 {#api-key}
```python
import os 
os.environ['GALADRIEL_API_KEY'] = "your-api-key"
```

## 샘플 사용법 {#sample-사용법}
```python
from litellm import completion
import os

os.environ['GALADRIEL_API_KEY'] = ""
response = completion(
    model="galadriel/llama3.1", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-사용법---streaming}
```python
from litellm import completion
import os

os.environ['GALADRIEL_API_KEY'] = ""
response = completion(
    model="galadriel/llama3.1", 
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```


## 지원 모델 {#supported-모델}
### 서버리스 엔드포인트 {#serverless-endpoints}
모든 Galadriel AI 모델을 지원합니다. completion 요청을 보낼 때 `galadriel/`을 접두사로 설정하면 됩니다.

전체 모델 이름과 간소화된 이름 매칭을 모두 지원합니다.

모델 이름은 전체 이름 또는 간소화된 버전(예: `llama3.1:70b`)으로 지정할 수 있습니다.

| 모델 이름                                                | 간소화된 이름                    | 함수 호출                                               |
| -------------------------------------------------------- | -------------------------------- | ------------------------------------------------------- |
| neuralmagic/Meta-Llama-3.1-8B-Instruct-FP8               | llama3.1 또는 llama3.1:8b        | `completion(model="galadriel/llama3.1", messages)`      |
| `neuralmagic/Meta-Llama-3.1-70B-Instruct-quantized.w4a16`  | `llama3.1:70b`                     | `completion(model="galadriel/llama3.1:70b", messages)`  |
| `neuralmagic/Meta-Llama-3.1-405B-Instruct-quantized.w4a16` | `llama3.1:405b`                    | `completion(model="galadriel/llama3.1:405b", messages)` |
| `neuralmagic/Mistral-Nemo-Instruct-2407-quantized.w4a16`   | `mistral-nemo` 또는 `mistral-nemo:12b` | `completion(model="galadriel/mistral-nemo", messages)`  |
