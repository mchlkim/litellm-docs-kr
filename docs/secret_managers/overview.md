import Image from '@theme/IdealImage';

# Secret Manager 개요

:::info

✨ **엔터프라이즈 기능입니다**

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 원하시면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

LiteLLM은 Azure Key Vault, Google Secret Manager, Hashicorp Vault, CyberArk Conjur, AWS Secret Manager에서 **시크릿 읽기(예: `OPENAI_API_KEY`)**와 **시크릿 쓰기(예: 가상 키)**를 지원합니다.

## 지원되는 Secret Manager {#supported-secret-managers}

- [`AWS Key Management Service`](./aws_kms)
- [AWS Secret Manager](./aws_secret_manager)
- [Azure Key Vault](./azure_key_vault)
- [CyberArk Conjur](./cyberark)
- [`Google Secret Manager`](./google_secret_manager)
- [`Google Key Management Service`](./google_kms)
- [Hashicorp Vault](./hashicorp_vault)

## 모든 Secret Manager 설정 {#all-secret-manager-settings}

시크릿 관리와 관련된 모든 설정입니다.

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

## 팀 수준 Secret Manager 설정 {#team-level-secret-manager-settings}

팀 수준 Secret Manager 설정을 사용하면 각 팀이 자체 키 관리 구성을 가져올 수 있습니다. 이 설정은 해당 팀에 연결된 가상 키를 만들 때 사용됩니다.

다음 단계에 따라 설정합니다.

1. **팀 만들기**  
   Teams 페이지를 열고 `Create Team`을 클릭해 모달을 엽니다.  

   <Image img={require('../../img/secret_manager_settings_create_team.png')} />

2. **추가 설정 펼치기**  
   `Additional Settings` 토글을 사용해 고급 구성 패널을 표시합니다.  
   
  <Image img={require('../../img/secret_manager_settings_additional_settings.png')} />

3. **Secret Manager 설정하기**  
   `Secret Manager Settings` 패널에 프로바이더별 JSON을 붙여넣습니다. 지원되는 키/값은 각 프로바이더 페이지(AWS, Azure, Google, Hashicorp 등)를 참고하세요. 현재는 JSON이 필요하지만, 더 사용하기 쉬운 UI 편집기를 추가할 예정입니다.  
   
   <Image img={require('../../img/secret_manager_settings.png')} />

4. **팀 생성하기**  
   입력값을 검토한 뒤 `Create Team`을 클릭해 저장합니다.  
   
   <Image img={require('../../img/secret_manager_settings_create_button.png')} />

저장 후 LiteLLM은 이 구성을 사용합니다.
