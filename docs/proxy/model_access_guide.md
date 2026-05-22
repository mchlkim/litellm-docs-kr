# 모델 액세스 작동 방식 {#how-model-access-works}

## 개념 {#concept}

온보딩된 각 모델은 LiteLLM에서 "model deployment"입니다.

이러한 model deployment는 config.yaml의 "model_name" 필드를 통해 "model group"에 할당됩니다.

## 예제

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

여기서는 `gpt-4o` 모델의 model deployment를 온보딩하고, 이를 `my-custom-model` model group에 할당합니다.

## 클라이언트 측 요청 {#client-side-request}

클라이언트 측 요청은 다음과 같습니다.

```bash
curl --location 'http://localhost:4000/chat/completions' \
-H 'Authorization: Bearer <your-api-key>' \
-H 'Content-Type: application/json' \
-d '{"model": "my-custom-model", "messages": [{"role": "user", "content": "Hello, how are you?"}]}'

```

## 액세스 제어 {#access-control}
키, 사용자, 팀에 액세스 권한을 부여하면 해당 대상에 "model group" 액세스 권한을 부여하는 것입니다.

예제:

```bash
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["my-custom-model"]}'
```

## 로드 밸런싱 {#loadbalancing}

하나의 "model group"에 여러 model deployment를 추가할 수 있습니다. LiteLLM은 그룹 안의 model deployment 간에 요청을 자동으로 로드 밸런싱합니다.

예제:

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  - model_name: my-custom-model
    litellm_params:
      model: azure/gpt-4o
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: os.environ/AZURE_API_VERSION
```

이 방식을 사용하면 여러 model deployment에 걸쳐 rate limit을 최대한 활용할 수 있습니다.

## 폴백 {#fallbacks}

model group 간에 폴백할 수 있습니다. 이는 "model group" 안의 모든 "model deployment"가 내려갔을 때, 예를 들어 429 오류가 발생할 때 유용합니다.

예제:

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
  - model_name: my-other-model
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  fallbacks: [{"my-custom-model": ["my-other-model"]}]
```

폴백은 순차적으로 수행되므로 목록의 첫 번째 model group이 먼저 시도됩니다. 실패하면 다음 model group이 시도됩니다.


## 고급: 모델 액세스 그룹 {#advanced-model-access-groups}

고급 사용 사례에서는 [Model Access Groups](./model_access_groups)를 사용해 여러 모델을 동적으로 그룹화하고, 프록시를 다시 시작하지 않고 액세스를 관리하세요.
