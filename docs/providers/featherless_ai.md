# Featherless AI
https://featherless.ai/

:::tip

**모든 Featherless AI 모델을 지원합니다. LiteLLM 요청을 보낼 때 `model=featherless_ai/<any-model-on-featherless>`를 접두사로 설정하세요. 지원되는 전체 모델 목록은 https://featherless.ai/models 에서 확인할 수 있습니다.**

:::


## API 키 {#api-key}
```python
# env variable
os.environ['FEATHERLESS_AI_API_KEY']
```

## 샘플 사용법 {#sample-사용법}
```python
from litellm import completion
import os

os.environ['FEATHERLESS_AI_API_KEY'] = ""
response = completion(
    model="featherless_ai/featherless-ai/Qwerky-72B", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}]
)
```

## 샘플 사용법 - 스트리밍 {#sample-사용법---streaming}
```python
from litellm import completion
import os

os.environ['FEATHERLESS_AI_API_KEY'] = ""
response = completion(
    model="featherless_ai/featherless-ai/Qwerky-72B", 
    messages=[{"role": "user", "content": "write code for saying hi from LiteLLM"}],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 채팅 모델 {#chat-모델}
| 모델 이름                                  | 함수 호출                                                                                       |
|---------------------------------------------|-----------------------------------------------------------------------------------------------|
| `featherless-ai/Qwerky-72B`                   | `completion(model="featherless_ai/featherless-ai/Qwerky-72B", messages)`                      |
| `featherless-ai/Qwerky-QwQ-32B`               | `completion(model="featherless_ai/featherless-ai/Qwerky-QwQ-32B", messages)`                  |
| `Qwen/Qwen2.5-72B-Instruct`                   | `completion(model="featherless_ai/Qwen/Qwen2.5-72B-Instruct", messages)`                      |
| `all-hands/openhands-lm-32b-v0.1`             | `completion(model="featherless_ai/all-hands/openhands-lm-32b-v0.1", messages)`                |
| `Qwen/Qwen2.5-Coder-32B-Instruct`             | `completion(model="featherless_ai/Qwen/Qwen2.5-Coder-32B-Instruct", messages)`                |
| `deepseek-ai/DeepSeek-V3-0324`                | `completion(model="featherless_ai/deepseek-ai/DeepSeek-V3-0324", messages)`                   |
| `mistralai/Mistral-Small-24B-Instruct-2501`   | `completion(model="featherless_ai/mistralai/Mistral-Small-24B-Instruct-2501", messages)`      |
| `mistralai/Mistral-Nemo-Instruct-2407`        | `completion(model="featherless_ai/mistralai/Mistral-Nemo-Instruct-2407", messages)`           |
| `ProdeusUnity/Stellar-Odyssey-12b-v0.0`       | `completion(model="featherless_ai/ProdeusUnity/Stellar-Odyssey-12b-v0.0", messages)`          |
