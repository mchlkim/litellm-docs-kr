import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Secret Manager

:::info

✨ **이 기능은 엔터프라이즈 기능입니다**

[엔터프라이즈 요금제](https://www.litellm.ai/#pricing)

[무료 평가판을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

프록시 키를 AWS Secret Manager에 저장합니다.

| 기능 | 지원 | 설명 |
|---------|----------|-------------|
| 시크릿 읽기 | ✅ | 예: `OPENAI_API_KEY` 같은 시크릿을 읽습니다 |
| 시크릿 쓰기 | ✅ | 예: `가상 키` 같은 시크릿을 저장합니다 |

## Proxy 사용법

1. 환경에 AWS 자격 증명을 저장합니다.
```bash
os.environ["AWS_ACCESS_KEY_ID"] = ""  # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = "" # Secret access key
os.environ["AWS_REGION_NAME"] = "" # us-east-1, us-east-2, us-west-1, us-west-2
```

2. 구성에서 AWS Secret Manager를 활성화합니다.

<Tabs>
<TabItem value="read_only" label="Read Keys from AWS Secret Manager">

```yaml
general_settings:
  master_key: os.environ/litellm_master_key 
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    hosted_keys: ["litellm_master_key"] # 👈 Specify which env keys you stored on AWS 

```

</TabItem>

<TabItem value="write_only" label="Write 가상 키 to AWS Secret Manager">

이 설정은 가상 키만 AWS Secret Manager에 저장합니다. AWS Secret Manager에서 키를 읽지는 않습니다.

```yaml
general_settings:
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "write_only" # Literal["read_only", "write_only", "read_and_write"]
    description: "litellm virtual key" # OPTIONAL, if set will set this as the description for all virtual keys
    tags: # OPTIONAL, if set will set this as the tags for all virtual keys
      Environment: "Prod"
      Owner: "AI Platform team"
```
</TabItem>
<TabItem value="read_and_write" label="Read + Write Keys with AWS Secret Manager">

```yaml
general_settings:
  master_key: os.environ/litellm_master_key 
  key_management_system: "aws_secret_manager" # 👈 KEY CHANGE
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
    hosted_keys: ["litellm_master_key"] # OPTIONAL. Specify which env keys you stored on AWS
```

</TabItem>
</Tabs>

3. 프록시를 실행합니다.

```bash
litellm --config /path/to/config.yaml
```

## 하나의 AWS Secret에서 K/V 쌍 사용 {#using-kv-pairs-in-1-aws-secret}

`primary_secret_name` 파라미터를 사용하면 하나의 AWS Secret에서 여러 키를 읽을 수 있습니다.

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    hosted_keys: [
      "OPENAI_API_KEY_MODEL_1",
      "OPENAI_API_KEY_MODEL_2",
    ]
    primary_secret_name: "litellm_secrets" # 👈 Read multiple keys from one JSON secret
```

`primary_secret_name`을 사용하면 하나의 AWS Secret에 있는 여러 키를 JSON 객체로 읽을 수 있습니다. 예를 들어 "litellm_secrets"에는 다음 값이 들어갑니다.

```json
{
  "OPENAI_API_KEY_MODEL_1": "sk-key1...",
  "OPENAI_API_KEY_MODEL_2": "sk-key2..."
}
```

이렇게 하면 관리해야 하는 AWS Secret 수를 줄일 수 있습니다.

## IAM Role 수임 {#iam-role-assumption}

보안을 강화하려면 정적 AWS 자격 증명 대신 IAM Role을 사용하세요.

### 기본 IAM Role {#basic-iam-role}

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::123456789012:role/LiteLLMSecretManagerRole"
    aws_session_name: "litellm-session"
```

### 교차 계정 액세스 {#cross-account-access}

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::999999999999:role/CrossAccountRole"
    aws_external_id: "unique-external-id"
```

### IRSA를 사용하는 EKS {#eks-with-irsa}

```yaml
general_settings:
  key_management_system: "aws_secret_manager"
  key_management_settings:
    store_virtual_keys: true
    aws_region_name: "us-east-1"
    aws_role_name: "arn:aws:iam::123456789012:role/LiteLLMServiceAccountRole"
    aws_web_identity_token: "os.environ/AWS_WEB_IDENTITY_TOKEN_FILE"
```

### 설정 파라미터 {#설정-parameters}

| 파라미터 | 설명 |
|-----------|-------------|
| `aws_region_name` | AWS 리전 |
| `aws_role_name` | 수임할 IAM Role ARN |
| `aws_session_name` | 세션 이름(선택 사항) |
| `aws_external_id` | 교차 계정용 External ID |
| `aws_profile_name` | `~/.aws/credentials`의 AWS profile |
| `aws_web_identity_token` | IRSA용 OIDC token 경로 |
| `aws_sts_endpoint` | VPC용 사용자 지정 STS endpoint |

