# NLP Cloud

LiteLLM은 `NLP Cloud`의 모든 LLM을 지원합니다.

## API 키 {#api-keys}

```python 
import os 

os.environ["NLP_CLOUD_API_KEY"] = "your-api-key"
```

## 샘플 사용법 {#sample-usage}

```python
import os
from litellm import completion 

# set env
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key" 

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="dolphin", messages=messages)
print(response)
```

## 스트리밍 {#streaming}
`completion`을 호출할 때 `stream=True`만 설정하면 됩니다.

```python
import os
from litellm import completion 

# set env
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key" 

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(model="dolphin", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

## `dolphin`이 아닌 모델 {#non-dolphin-models}

기본적으로 LiteLLM은 `dolphin`과 `chatdolphin`을 `NLP Cloud`에 매핑합니다.

`NLP Cloud`로 다른 모델(예: `GPT-J`, `Llama-2` 등)을 호출하려면 custom LLM provider로 설정하면 됩니다.


```python
import os
from litellm import completion 

# set env - [OPTIONAL] replace with your nlp cloud key
os.environ["NLP_CLOUD_API_KEY"] = "your-api-key" 

messages = [{"role": "user", "content": "Hey! how's it going?"}]

# e.g. to call Llama2 on NLP Cloud
response = completion(model="nlp_cloud/finetuned-llama-2-70b", messages=messages, stream=True)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```
