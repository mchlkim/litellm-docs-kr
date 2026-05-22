import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 모델 관리 {#model-management}
proxy를 다시 시작하지 않고 새 모델을 추가하고 모델 정보를 가져옵니다.

## Config.yaml에서 {#in-configyaml}

```yaml
model_list:
  - model_name: text-davinci-003
    litellm_params: 
      model: "text-completion-openai/text-davinci-003"
    model_info: 
      metadata: "here's additional metadata on the model" # returned via GET /model/info
```

## 모델 정보 가져오기 - `/model/info` {#get-model-information---modelinfo}

`/model/info` 엔드포인트에 나열된 각 모델의 상세 정보를 가져옵니다. 여기에는 `config.yaml` 파일의 설명과, 사용자가 설정한 `model_info` 및 [litellm 모델 비용 맵](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 가져온 추가 모델 정보(예: max tokens, input token당 비용 등)가 포함됩니다. 보안을 위해 API 키 같은 민감한 세부 정보는 제외됩니다.

:::tip 모델 데이터 동기화
[GitHub에서 모델 동기화](sync_models_github.md)를 사용해 모델 가격 데이터를 최신 상태로 유지하세요.
:::

<Tabs
  defaultValue="curl"
  values={[
    {
      label: 'cURL',
      value: 'curl',
    },
  ]}>
  <TabItem value="curl">

```bash
curl -X GET "http://0.0.0.0:4000/model/info" \
     -H "accept: application/json" \
```
  </TabItem>
</Tabs>

## 새 모델 추가 {#add-a-new-model}

`/model/new` API를 통해 proxy에 새 모델을 추가하면 proxy를 다시 시작하지 않고 모델을 추가할 수 있습니다.

<Tabs>
<TabItem value="API">

```bash
curl -X POST "http://0.0.0.0:4000/model/new" \
    -H "accept: application/json" \
    -H "Content-Type: application/json" \
    -d '{ "model_name": "azure-gpt-turbo", "litellm_params": {"model": "azure/gpt-3.5-turbo", "api_key": "os.environ/AZURE_API_KEY", "api_base": "my-azure-api-base"} }'
```
</TabItem>
<TabItem value="Yaml">

```yaml
model_list:
  - model_name: gpt-3.5-turbo ### RECEIVED MODEL NAME ### `openai.chat.completions.create(model="gpt-3.5-turbo",...)`
    litellm_params: # all params accepted by litellm.completion() - https://github.com/BerriAI/litellm/blob/9b46ec05b02d36d6e4fb5c32321e51e7f56e4a6e/litellm/types/router.py#L297
      model: azure/gpt-turbo-small-eu ### MODEL NAME sent to `litellm.completion()` ###
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU" # does os.getenv("AZURE_API_KEY_EU")
      rpm: 6      # [OPTIONAL] Rate limit for this deployment: in requests per minute (rpm)
    model_info: 
      my_custom_key: my_custom_value # additional model metadata
```

</TabItem>
</Tabs>


### 모델 매개변수 구조 {#model-parameters-structure}

새 모델을 추가할 때 JSON 페이로드는 다음 구조를 따라야 합니다.

- `model_name`: 새 모델의 이름입니다(필수).
- `litellm_params`: LiteLLM 설정에 특화된 매개변수를 포함하는 딕셔너리입니다(필수).
- `model_info`: 모델에 대한 추가 정보를 제공하는 선택 사항 딕셔너리입니다.

다음은 `ModelParams` 구조를 구성하는 예시입니다.

```json
{
  "model_name": "my_awesome_model",
  "litellm_params": {
    "some_parameter": "some_value",
    "another_parameter": "another_value"
  },
  "model_info": {
    "author": "Your Name",
    "version": "1.0",
    "description": "A brief description of the model."
  }
}
```
---

두 엔드포인트 모두 [BETA] 상태이므로, 업데이트를 확인하거나 피드백을 제공하려면 API 설명에 연결된 관련 GitHub 이슈를 방문해야 할 수 있습니다.

- 모델 정보 가져오기: [Issue #933](https://github.com/BerriAI/litellm/issues/933)
- 새 모델 추가: [Issue #964](https://github.com/BerriAI/litellm/issues/964)

beta 엔드포인트에 대한 피드백은 모든 사용자를 위한 API 개선에 도움이 됩니다.


## 추가 모델 정보 추가 {#add-additional-model-information}

모델에 표시 이름, 설명, 레이블을 추가하려면 `model_info:`를 사용하세요.

```yaml
model_list:
  - model_name: "gpt-4"
    litellm_params:
      model: "gpt-4"
      api_key: "os.environ/OPENAI_API_KEY"
    model_info: # 👈 KEY CHANGE
      my_custom_key: "my_custom_value"
```

### 사용법

1. 모델에 추가 정보를 추가합니다.

```yaml
model_list:
  - model_name: "gpt-4"
    litellm_params:
      model: "gpt-4"
      api_key: "os.environ/OPENAI_API_KEY"
    model_info: # 👈 KEY CHANGE
      my_custom_key: "my_custom_value"
```

2. `/model/info`로 호출합니다.

모델 `gpt-4`에 접근할 수 있는 키를 사용하세요.

```bash
curl -L -X GET 'http://0.0.0.0:4000/v1/model/info' \
-H 'Authorization: Bearer LITELLM_KEY' \
```

3. **예상 응답**

반환되는 값은 `model_info = Your custom model_info + (if exists) LITELLM MODEL INFO`입니다.


[**LiteLLM Model Info를 찾는 방식**](https://github.com/BerriAI/litellm/blob/9b46ec05b02d36d6e4fb5c32321e51e7f56e4a6e/litellm/proxy/proxy_server.py#L7460)

[개선할 수 있는 방법을 알려주세요!](https://github.com/BerriAI/litellm/issues)

```bash
{
    "data": [
        {
            "model_name": "gpt-4",
            "litellm_params": {
                "model": "gpt-4"
            },
            "model_info": {
                "id": "e889baacd17f591cce4c63639275ba5e8dc60765d6c553e6ee5a504b19e50ddc",
                "db_model": false,
                "my_custom_key": "my_custom_value", # 👈 CUSTOM INFO
                "key": "gpt-4", # 👈 KEY in LiteLLM MODEL INFO/COST MAP - https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
                "max_tokens": 4096,
                "max_input_tokens": 8192,
                "max_output_tokens": 4096,
                "input_cost_per_token": 3e-05,
                "input_cost_per_character": null,
                "input_cost_per_token_above_128k_tokens": null,
                "output_cost_per_token": 6e-05,
                "output_cost_per_character": null,
                "output_cost_per_token_above_128k_tokens": null,
                "output_cost_per_character_above_128k_tokens": null,
                "output_vector_size": null,
                "litellm_provider": "openai",
                "mode": "chat"
            }
        },
    ]
}
```
