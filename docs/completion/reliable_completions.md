# 안정성 - Retries, Fallbacks

LiteLLM은 다음 2가지 방식으로 요청 실패를 방지하는 데 도움을 줍니다: 
- Retries
- Fallbacks: Context Window + 일반

## 헬퍼 유틸리티 
LiteLLM은 안정성을 위해 다음 함수를 지원합니다:
* `litellm.longer_context_model_fallback_dict`: 더 큰 동등 모델이 있는 모델에 대한 매핑을 담은 Dictionary  
* `num_retries`: tenacity retries 사용
* fallbacks와 함께 쓰는 `completion()`: 오류 발생 시 models/keys/api bases 간 전환 

## 실패한 요청 재시도

`completion(..num_retries=2)`처럼 completion에서 호출합니다.


사용 방법을 간단히 살펴보면 다음과 같습니다: 

```python 
from litellm import completion

user_message = "Hello, whats the weather in San Francisco??"
messages = [{"content": user_message, "role": "user"}]

# normal call 
response = completion(
            model="gpt-3.5-turbo",
            messages=messages,
            num_retries=2
        )
```

## Fallbacks (SDK)

:::info

[PROXY에서 수행하는 방법 보기](../proxy/reliability.md)

:::

### Context Window Fallbacks로 SDK 처리 {#context-window-fallbacks-sdk}
```python 
from litellm import completion

fallback_dict = {"gpt-3.5-turbo": "gpt-3.5-turbo-16k"}
messages = [{"content": "how does a court case get to the Supreme Court?" * 500, "role": "user"}]

completion(model="gpt-3.5-turbo", messages=messages, context_window_fallback_dict=fallback_dict)
```

### Fallbacks - 모델/API Keys/API Bases 전환 (SDK)

LLM APIs는 불안정할 수 있으며, fallbacks와 함께 쓰는 completion()은 호출에서 항상 응답을 받을 수 있도록 보장합니다

#### 사용법 
`completion()`에서 fallback models를 사용하려면 `fallbacks` 파라미터에 models 목록을 지정합니다. 

`fallbacks` 목록에는 사용하려는 기본 model을 먼저 넣고, 기본 model이 응답을 제공하지 못할 경우 backups로 사용할 수 있는 추가 models를 이어서 넣어야 합니다.

#### models 전환 
```python
response = completion(model="bad-model", messages=messages, 
    fallbacks=["gpt-3.5-turbo" "command-nightly"])
```

#### api keys/bases 전환 (예: azure deployment)
동일한 azure deployment에서 서로 다른 keys 간 전환하거나, 다른 deployment도 사용할 수 있습니다. 

```python
api_key="bad-key"
response = completion(model="azure/gpt-4", messages=messages, api_key=api_key,
    fallbacks=[{"api_key": "good-key-1"}, {"api_key": "good-key-2", "api_base": "good-api-base-2"}])
```

[구현 세부 정보는 이 섹션을 확인하세요](#fallbacks-1)

## 구현 세부 정보 (SDK)

### Fallbacks
#### 호출 출력
```
Completion with 'bad-model': got exception Unable to map your input to a model. Check your input - {'model': 'bad-model'



completion call gpt-3.5-turbo
{
  "id": "chatcmpl-7qTmVRuO3m3gIBg4aTmAumV1TmQhB",
  "object": "chat.completion",
  "created": 1692741891,
  "model": "gpt-3.5-turbo-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I apologize, but as an AI, I do not have the capability to provide real-time weather updates. However, you can easily check the current weather in San Francisco by using a search engine or checking a weather website or app."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 46,
    "total_tokens": 62
  }
}

```

#### fallbacks 작동 방식

`completion`에 `fallbacks`를 전달하면 `completion(model=model)`에서 `model`로 지정한 기본 model을 사용해 첫 번째 `completion` 호출을 수행합니다. 기본 model이 실패하거나 오류가 발생하면 지정된 순서대로 `fallbacks` models를 자동으로 시도합니다. 이렇게 하면 기본 model을 사용할 수 없는 경우에도 응답을 보장할 수 있습니다.


#### Model Fallbacks 구현의 핵심 구성 요소:
* `fallbacks` 순회
* rate-limited models에 대한 Cool-Downs

#### `fallbacks` 순회
각 요청에 `45seconds`를 허용합니다. 이 함수는 45초 동안 `model`로 설정된 기본 model 호출을 시도합니다. model이 실패하면 backup `fallbacks` models를 순회하며 여기에서 설정된 할당 시간 `45s` 안에 응답을 받으려고 시도합니다: 
```python
while response == None and time.time() - start_time < 45:
        for model in fallbacks:
```

#### rate-limited models에 대한 Cool-Downs
model API 호출에서 오류가 발생하면 `60s` 동안 cooldown하도록 허용합니다
```python
except Exception as e:
  print(f"got exception {e} for model {model}")
  rate_limited_models.add(model)
  model_expiration_times[model] = (
      time.time() + 60
  )  # cool down this selected model
  pass
```

LLM API 호출을 수행하기 전에 선택된 model이 `rate_limited_models`에 있는지 확인하고, 포함되어 있으면 API 호출을 건너뜁니다
```python
if (
  model in rate_limited_models
):  # check if model is currently cooling down
  if (
      model_expiration_times.get(model)
      and time.time() >= model_expiration_times[model]
  ):
      rate_limited_models.remove(
          model
      )  # check if it's been 60s of cool down and remove model
  else:
      continue  # skip model

```

#### fallbacks()를 포함한 completion 전체 코드
```python

    response = None
    rate_limited_models = set()
    model_expiration_times = {}
    start_time = time.time()
    fallbacks = [kwargs["model"]] + kwargs["fallbacks"]
    del kwargs["fallbacks"]  # remove fallbacks so it's not recursive

    while response == None and time.time() - start_time < 45:
        for model in fallbacks:
            # loop thru all models
            try:
                if (
                    model in rate_limited_models
                ):  # check if model is currently cooling down
                    if (
                        model_expiration_times.get(model)
                        and time.time() >= model_expiration_times[model]
                    ):
                        rate_limited_models.remove(
                            model
                        )  # check if it's been 60s of cool down and remove model
                    else:
                        continue  # skip model

                # delete model from kwargs if it exists
                if kwargs.get("model"):
                    del kwargs["model"]

                print("making completion call", model)
                response = litellm.completion(**kwargs, model=model)

                if response != None:
                    return response

            except Exception as e:
                print(f"got exception {e} for model {model}")
                rate_limited_models.add(model)
                model_expiration_times[model] = (
                    time.time() + 60
                )  # cool down this selected model
                pass
    return response
```
