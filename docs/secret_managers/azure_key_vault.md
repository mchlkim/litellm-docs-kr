# Azure Key Vault

:::info

✨ **이 기능은 엔터프라이즈 기능입니다**

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

## LiteLLM Proxy Server와 함께 사용하는 방법 {#usage-with-litellm-proxy-server}

1. Proxy 의존성을 설치합니다
```bash
uv tool install 'litellm[proxy]' 'litellm[extra_proxy]'
```

2. 환경에 Azure 세부 정보를 저장합니다
```bash 
export["AZURE_CLIENT_ID"]="your-azure-app-client-id"
export["AZURE_CLIENT_SECRET"]="your-azure-app-client-secret"
export["AZURE_TENANT_ID"]="your-azure-tenant-id"
export["AZURE_KEY_VAULT_URI"]="your-azure-key-vault-uri"
```

3. Proxy `config.yaml`에 추가합니다
```yaml
model_list: 
    - model_name: "my-azure-models" # model alias 
        litellm_params:
            model: "azure/<your-deployment-name>"
            api_key: "os.environ/AZURE-API-KEY" # reads from key vault - get_secret("AZURE_API_KEY")
            api_base: "os.environ/AZURE-API-BASE" # reads from key vault - get_secret("AZURE_API_BASE")

general_settings:
  key_management_system: "azure_key_vault"
```

이제 Proxy를 시작해서 테스트할 수 있습니다.
```bash
litellm --config /path/to/config.yaml
```

[Proxy 빠른 테스트](../proxy/quick_start#using-litellm-proxy---curl-request-openai-package-langchain-langchain-js)
