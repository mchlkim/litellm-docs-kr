# [지원 중단됨] 지역 기반 라우팅 {#deprecated-region-based-routing}

:::info

이 기능은 지원 중단되었습니다. 대신 [태그 기반 라우팅](./tag_routing.md)을 사용하세요.

:::


특정 고객을 eu 전용 모델로 라우팅합니다.

고객에 대해 'allowed_model_region'을 지정하면 LiteLLM은 모델 그룹에서 허용된 리전(예: 'eu')에 속하지 않는 모델을 필터링합니다.

[**코드 보기**](https://github.com/BerriAI/litellm/blob/5eb12e30cc5faa73799ebc7e48fc86ebf449c879/litellm/router.py#L2938)

### 1. 리전 지정 고객 생성 {#1-create-customer-with-region-specification}

이를 위해 litellm 'end-user' 객체를 사용합니다.

openai chat completion/embedding 호출에서 'user' 매개변수를 litellm에 전달하면 최종 사용자를 추적하거나 식별할 수 있습니다.

```bash
curl -X POST --location 'http://0.0.0.0:4000/end_user/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "user_id" : "ishaan-jaff-45",
    "allowed_model_region": "eu", # 👈 SPECIFY ALLOWED REGION='eu'
}'
```

### 2. 모델 그룹에 eu 모델 추가 {#2-add-eu-models-to-model-group}

모델 그룹에 eu 모델을 추가합니다. 각 모델의 리전을 지정하려면 'region_name' 매개변수를 사용하세요.

지원되는 리전은 'eu'와 'us'입니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-35-turbo # 👈 EU azure model
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: os.environ/AZURE_EUROPE_API_KEY
      region_name: "eu"
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_API_KEY
      region_name: "us"

router_settings:
  enable_pre_call_checks: true # 👈 IMPORTANT
```

프록시 시작

```yaml
litellm --config /path/to/config.yaml
```

### 3. 테스트 {#3-test-it}

프록시에 간단한 chat completions 호출을 보냅니다. 응답 헤더에서 반환된 api base를 확인할 수 있습니다.

```bash
curl -X POST --location 'http://localhost:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
    "model": "gpt-3.5-turbo", 
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
    }],
    "user": "ishaan-jaff-45" # 👈 USER ID
}
'
```

응답 헤더의 예상 API Base

```
x-litellm-api-base: "https://my-endpoint-europe-berri-992.openai.azure.com/"
x-litellm-model-region: "eu" # 👈 CONFIRMS REGION-BASED ROUTING WORKED
```

### 자주 묻는 질문 {#faq}

**해당 리전에 사용 가능한 모델이 없으면 어떻게 되나요?**

라우터는 지정된 리전에 속하지 않는 모델을 필터링하므로, 해당 리전에 사용 가능한 모델이 없으면 사용자에게 오류를 반환합니다.
