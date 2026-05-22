# Heroku

## 모델 Provision {#provision-a-model}

LiteLLM에서 Heroku를 사용하려면 [Heroku app을 구성하고 지원 모델을 연결](https://devcenter.heroku.com/articles/heroku-inference#provision-access-to-an-ai-model-resource)하세요.


## Supported 모델

LiteLLM용 Heroku는 다양한 [chat](https://devcenter.heroku.com/articles/heroku-inference-api-v1-chat-completions) 모델을 지원합니다.

| 모델                             | Region  |
|-----------------------------------|---------|
| [`heroku/claude-sonnet-4`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-4-sonnet)          | US, EU  |
| [`heroku/claude-3-7-sonnet`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-7-sonnet)        | US, EU  |
| [`heroku/claude-3-5-sonnet-latest`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-5-sonnet-latest) | US      |
| [`heroku/claude-3-5-haiku`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-5-haiku)         | US      |
| [`heroku/claude-3`](https://devcenter.heroku.com/articles/heroku-inference-api-model-claude-3-haiku)                 | EU      |

## 환경 변수 {#environment-variables}

Heroku app에 모델을 연결하면 세 가지 config variable이 설정됩니다.

- `INFERENCE_KEY`: 모델 요청 인증에 사용하는 API key입니다.
- `INFERENCE_MODEL_ID`: 모델 이름입니다. 예: `claude-3-5-haiku`.
- `INFERENCE_URL`: 모델 호출에 사용하는 base URL입니다.

모델을 호출하려면 `INFERENCE_KEY`와 `INFERENCE_URL`이 모두 필요합니다.

이 변수에 대한 자세한 내용은 [Heroku 문서](https://devcenter.heroku.com/articles/heroku-inference#model-resource-config-vars)를 참고하세요.

## 사용법 예제
### Config variable 사용 {#using-config-variables}

Heroku는 다음 LiteLLM API config variable을 사용합니다.

- `HEROKU_API_KEY`: 이 값은 [LiteLLM의 `api_key` param](https://docs.litellm.ai/docs/set_keys#litellmapi_key)에 해당합니다. Heroku의 `INFERENCE_KEY` config variable 값으로 설정하세요.
- `HEROKU_API_BASE`: 이 값은 [LiteLLM의 `api_base` param](https://docs.litellm.ai/docs/set_keys#litellmapi_base)에 해당합니다. Heroku의 `INFERENCE_URL` config variable 값으로 설정하세요.

이 예제에서는 `api_key`와 `api_base` variable을 명시적으로 전달하지 않습니다. 대신 Heroku가 사용할 config variable을 설정합니다.

```python
import os
from litellm import completion

os.environ["HEROKU_API_BASE"] = "https://us.inference.heroku.com"
os.environ["HEROKU_API_KEY"] = "fake-heroku-key"

response = completion(
    model="heroku/claude-3-5-haiku",
    messages=[
        {"role": "user", "content": "write code for saying hey from LiteLLM"}
    ]
)

print(response)
```

> LiteLLM이 사용할 model provider를 알 수 있도록 model name에 `heroku/` prefix를 포함하세요.

### `api_key`와 `api_base`를 명시적으로 설정 {#explicitly-setting-api_key-and-api_base}

```python
from litellm import completion

response = completion(
    model="heroku/claude-sonnet-4",
    api_key="fake-heroku-key",
    api_base="https://us.inference.heroku.com",
    messages=[
        {"role": "user", "content": "write code for saying hey from LiteLLM"}
    ],
)
```

> LiteLLM이 사용할 model provider를 알 수 있도록 model name에 `heroku/` prefix를 포함하세요.
