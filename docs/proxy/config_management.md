# 파일 관리 {#file-management}

## config.yaml에서 외부 YAML 파일 `include`하기 {#include-external-yaml-files-in-a-configyaml}

`include`를 사용해 config.yaml에 외부 YAML 파일을 포함할 수 있습니다.

**빠른 시작 사용법:**

config 파일을 포함하려면 단일 파일 또는 파일 목록과 함께 `include`를 사용하세요.

`parent_config.yaml`의 내용:
```yaml
include:
  - model_config.yaml # 👈 Key change, will include the contents of model_config.yaml

litellm_settings:
  callbacks: ["prometheus"] 
```


`model_config.yaml`의 내용:
```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
  - model_name: fake-anthropic-endpoint
    litellm_params:
      model: anthropic/fake
      api_base: https://exampleanthropicendpoint-production.up.railway.app/

```

프록시 서버 시작

이 명령은 `parent_config.yaml` config로 프록시 서버를 시작합니다. `include` 지시문이 사용되었으므로 서버는 `model_config.yaml`의 내용도 함께 포함합니다.
```
litellm --config parent_config.yaml --detailed_debug
```





## `include` 사용 예제 {#examples-using-include}

단일 파일 포함:
```yaml
include:
  - model_config.yaml
```

여러 파일 포함:
```yaml
include:
  - model_config.yaml
  - another_config.yaml
```
