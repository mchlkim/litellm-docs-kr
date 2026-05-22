# Secret Managers 개요 {#secret-managers-overview}

:::info

✨ **엔터프라이즈 기능입니다**

[엔터프라이즈 요금제](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

LiteLLM은 Azure Key Vault, Google Secret Manager, Hashicorp Vault, CyberArk Conjur, AWS Secret Manager에서 **secret 읽기(예: `OPENAI_API_KEY`)** 및 **secret 쓰기(예: 가상 키)**를 지원합니다.

## 지원되는 Secret Managers {#supported-secret-managers}

- [`AWS Key Management Service`](./secret_managers/aws_kms)
- [AWS Secret Manager](./secret_managers/aws_secret_manager)
- [Azure Key Vault](./secret_managers/azure_key_vault)
- [CyberArk Conjur](./secret_managers/cyberark)
- [`Google Secret Manager`](./secret_managers/google_secret_manager)
- [`Google Key Management Service`](./secret_managers/google_kms)
- [Hashicorp Vault](./secret_managers/hashicorp_vault)

## 모든 Secret Manager 설정 {#all-secret-manager-settings}

secret 관리와 관련된 모든 설정입니다.

```yaml
general_settings:
  key_management_system: "aws_secret_manager" # REQUIRED
  key_management_settings:  

    # Storing Virtual Keys Settings
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL.I f set, this prefix will be used for stored virtual keys in the secret manager
    
    # Access Mode Settings
    access_mode: "write_only" # OPTIONAL. Literal["read_only", "write_only", "read_and_write"]. Defaults to "read_only"
    
    # Hosted Keys Settings
    hosted_keys: ["litellm_master_key"] # OPTIONAL. Specify which env keys you stored on AWS

    # K/V pairs in 1 AWS Secret Settings
    primary_secret_name: "litellm_secrets" # OPTIONAL. Read multiple keys from one JSON secret on AWS Secret Manager
```
