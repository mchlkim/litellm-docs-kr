# 안정성을 위해 completion()에 Fallbacks 사용하기 {#using-completion-with-fallbacks-for-reliability}

이 튜토리얼에서는 안정성을 확보하기 위해 모델 fallback과 함께 `completion()` 함수를 사용하는 방법을 설명합니다. LLM API는 불안정할 수 있으므로, fallback을 적용한 completion()은 호출에서 항상 응답을 받을 수 있도록 보장합니다.

## Virtual Key용 Fallbacks 설정하기 {#set-up-fallbacks-for-a-virtual-key}

<iframe width="840" height="500" src="https://www.loom.com/embed/35539129dd104313aff40eb1cd255778" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 사용법 
`completion()`에서 fallback 모델을 사용하려면 `fallbacks` 매개변수에 모델 목록을 지정하세요.

`fallbacks` 목록에는 사용하려는 기본 모델을 먼저 넣고, 기본 모델이 응답을 제공하지 못할 경우 백업으로 사용할 추가 모델을 그 뒤에 넣어야 합니다.

```python
response = completion(model="bad-model", fallbacks=["gpt-3.5-turbo" "command-nightly"], messages=messages)
```

## `completion_with_fallbacks()` 작동 방식 {#how-does-completion_with_fallbacks-work}

`completion_with_fallbacks()` 함수는 `completion(model=model)`에서 `model`로 지정된 기본 모델을 사용해 completion 호출을 시도합니다. 기본 모델이 실패하거나 오류가 발생하면 지정된 순서대로 `fallbacks` 모델을 자동으로 시도합니다. 이를 통해 기본 모델을 사용할 수 없는 경우에도 응답을 받을 수 있습니다.

### 호출 출력 {#output-from-calls}
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

### Model Fallbacks 구현의 핵심 구성 요소 {#key-components-of-model-fallbacks-implementation}
* `fallbacks` 순회
* 속도 제한이 적용된 모델의 Cool-Downs

#### `fallbacks` 순회 {#looping-through-fallbacks}
각 요청에 `45seconds`를 허용합니다. 이 함수는 45초 동안 `model`로 설정된 기본 모델 호출을 시도합니다. 모델이 실패하면 백업 `fallbacks` 모델을 순회하며, 여기에서 설정한 할당 시간 `45s` 안에 응답을 받으려고 시도합니다.
```python
while response == None and time.time() - start_time < 45:
        for model in fallbacks:
```

#### 속도 제한이 적용된 모델의 Cool-Downs {#cool-downs-for-rate-limited-models}
모델 API 호출에서 오류가 발생하면 해당 모델이 `60s` 동안 cooldown되도록 합니다.
```python
except Exception as e:
  print(f"got exception {e} for model {model}")
  rate_limited_models.add(model)
  model_expiration_times[model] = (
      time.time() + 60
  )  # cool down this selected model
  pass
```

LLM API 호출을 수행하기 전에 선택한 모델이 `rate_limited_models`에 있는지 확인하고, 포함되어 있으면 API 호출을 건너뜁니다.
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

#### fallback을 포함한 completion 전체 코드 {#full-code-of-completion-with-fallbacks}
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
