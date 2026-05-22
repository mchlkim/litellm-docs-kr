# Petals
Petals: https://github.com/bigscience-workshop/petals

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Petals.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## 사전 요구 사항 {#pre-requisites}
`petals`가 설치되어 있는지 확인하세요.
```shell
uv add git+https://github.com/bigscience-workshop/petals
```

## 사용법 {#usage}
모든 `petals` LLM에 `petals/`를 접두사로 추가하세요. 이렇게 하면 `custom_llm_provider`가 `petals`로 설정됩니다.

```python
from litellm import completion

response = completion(
    model="petals/petals-team/StableBeluga2", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response)
```

## 스트리밍 사용법 {#usage-with-streaming}

```python
response = completion(
    model="petals/petals-team/StableBeluga2", 
    messages=[{ "content": "Hello, how are you?","role": "user"}],
    stream=True
)

print(response)
for chunk in response:
  print(chunk)
```

### 모델 세부 정보 {#model-details}

| 모델 이름       | 함수 호출                              |
|------------------|--------------------------------------------|
| `petals-team/StableBeluga` | `completion('petals/petals-team/StableBeluga2', messages)` | 
| `huggyllama/llama-65b` | `completion('petals/huggyllama/llama-65b', messages)` | 
