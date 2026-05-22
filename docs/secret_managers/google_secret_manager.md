# `Google Secret Manager`

:::info

✨ **This is an 엔터프라이즈 Feature**

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[Contact us here to get a free trial](https://enterprise.litellm.ai/demo)

:::

[Google Secret Manager](https://cloud.google.com/security/products/secret-manager)를 지원합니다.

1. 환경 변수에 `Google Secret Manager` 세부 정보를 저장합니다.

```shell 
GOOGLE_SECRET_MANAGER_PROJECT_ID="your-project-id-on-gcp" # example: adroit-crow-413218
```

Optional Params

```shell
export GOOGLE_SECRET_MANAGER_REFRESH_INTERVAL = ""            # (int) defaults to 86400
export GOOGLE_SECRET_MANAGER_ALWAYS_READ_SECRET_MANAGER = ""  # (str) set to "true" if you want to always read from google secret manager without using in memory caching. NOT RECOMMENDED in PROD
```

2. proxy `config.yaml`에 추가합니다.
```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      api_key: os.environ/OPENAI_API_KEY # this will be read from Google Secret Manager

general_settings:
  key_management_system: "google_secret_manager"
```

이제 proxy를 시작해 테스트할 수 있습니다.
```bash
litellm --config /path/to/config.yaml
```

[Proxy 빠른 테스트](../proxy/quick_start#using-litellm-proxy---curl-request-openai-package-langchain-langchain-js)
