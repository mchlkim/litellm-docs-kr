import Image from '@theme/IdealImage';

# Hashicorp Vault

:::info

✨ **엔터프라이즈 기능입니다**

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

| 기능 | 지원 | 설명 |
|---------|----------|-------------|
| 시크릿 읽기 | ✅ | 시크릿을 읽습니다. 예: `OPENAI_API_KEY` |
| 시크릿 쓰기 | ✅ | 시크릿을 저장합니다. 예: `가상 키` |
| Hashicorp Vault 인증 방법 | ✅ | AppRole, TLS Certificate, Token |

[Hashicorp Vault](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2)에서 시크릿을 읽습니다.

**1단계.** 환경에 Hashicorp Vault 세부 정보를 추가합니다.

LiteLLM은 세 가지 인증 방법을 지원합니다.

1. AppRole 인증(권장) - `HCP_VAULT_APPROLE_ROLE_ID` 및 `HCP_VAULT_APPROLE_SECRET_ID`
2. TLS 인증서 인증 - `HCP_VAULT_CLIENT_CERT` 및 `HCP_VAULT_CLIENT_KEY`
3. 토큰 인증 - `HCP_VAULT_TOKEN`

```bash
HCP_VAULT_ADDR="https://test-cluster-public-vault-0f98180c.e98296b2.z1.hashicorp.cloud:8200"
HCP_VAULT_NAMESPACE="admin"

# Authentication via AppRole (recommended)
HCP_VAULT_APPROLE_ROLE_ID="your-role-id"
HCP_VAULT_APPROLE_SECRET_ID="your-secret-id"
HCP_VAULT_APPROLE_MOUNT_PATH="approle" # OPTIONAL. defaults to "approle"

# OR - Authentication via TLS cert
HCP_VAULT_CLIENT_CERT="path/to/client.pem"
HCP_VAULT_CLIENT_KEY="path/to/client.key"

# OR - Authentication via token
HCP_VAULT_TOKEN="hvs.CAESIG52gL6ljBSdmq*****"


# OPTIONAL
HCP_VAULT_REFRESH_INTERVAL="86400" # defaults to 86400, frequency of cache refresh for Hashicorp Vault
HCP_VAULT_MOUNT_NAME="secret" # OPTIONAL. defaults to "secret", set this if your KV engine is mounted elsewhere
HCP_VAULT_PATH_PREFIX="litellm" # OPTIONAL. defaults to None, set this if your secrets live under a custom prefix like secret/data/litellm/OPENAI_API_KEY
```

**2단계.** 프록시 `config.yaml`에 추가합니다.

```yaml
general_settings:
  key_management_system: "hashicorp_vault"

  # [OPTIONAL SETTINGS]
  key_management_settings: 
    store_virtual_keys: true # OPTIONAL. Defaults to False, when True will store virtual keys in secret manager
    prefix_for_stored_virtual_keys: "litellm/" # OPTIONAL. If set, this prefix will be used for stored virtual keys in the secret manager
    access_mode: "read_and_write" # Literal["read_only", "write_only", "read_and_write"]
```

**3단계.** 프록시를 시작하고 테스트합니다.

```
$ litellm --config /path/to/config.yaml
```

[프록시 빠른 테스트](../proxy/user_keys)


## 인증 방법 {#인증-methods}

LiteLLM은 Hashicorp Vault에 대해 세 가지 인증 방법을 지원하며, 우선순위는 다음과 같습니다.

1. **AppRole** - 프로덕션 애플리케이션에 권장됩니다.
2. **TLS Certificate** - 인증서 기반 인증에 사용합니다.
3. **Token** - 직접 토큰 인증에 사용합니다.

### 1. AppRole 인증

AppRole 인증을 설정하려면 다음을 수행합니다.

1. Vault에서 AppRole 인증을 활성화합니다.
```bash
vault auth enable approle
```

2. LiteLLM용 정책과 역할을 생성합니다.
```bash
# Create a policy file (litellm-policy.hcl)
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Apply the policy
vault policy write litellm-policy litellm-policy.hcl

# Create an AppRole
vault write auth/approle/role/litellm \
    token_policies="litellm-policy" \
    token_ttl=32d \
    token_max_ttl=32d
```

3. Role ID와 Secret ID를 가져옵니다.
```bash
# Get Role ID
vault read auth/approle/role/litellm/role-id

# Generate Secret ID
vault write -f auth/approle/role/litellm/secret-id
```

4. 환경 변수를 설정합니다.
```bash
export HCP_VAULT_APPROLE_ROLE_ID="your-role-id"
export HCP_VAULT_APPROLE_SECRET_ID="your-secret-id"
```

### 2. TLS 인증서 인증 {#2-tls-certificate-인증}

TLS 인증서 인증은 Vault와의 상호 TLS 인증에 클라이언트 인증서를 사용합니다.

**환경 변수:**
```bash
export HCP_VAULT_CLIENT_CERT="path/to/client.pem"
export HCP_VAULT_CLIENT_KEY="path/to/client.key"
export HCP_VAULT_CERT_ROLE="your-cert-role"  # Optional
```

**동작 방식:**
- LiteLLM은 상호 TLS 인증에 클라이언트 인증서와 키를 사용합니다.
- Vault는 인증서를 검증하고 임시 토큰을 발급합니다.
- 토큰은 리스 기간 동안 캐시됩니다.

### 3. 토큰 인증 {#3-token-인증}

직접 토큰 인증은 정적 Vault 토큰을 사용합니다.

**환경 변수:**
```bash
export HCP_VAULT_TOKEN="hvs.CAESIG52gL6ljBSdmq*****"
```

## 동작 방식

**시크릿 읽기**

LiteLLM은 다음 URL 형식을 사용해 Hashicorp Vault의 KV v2 엔진에서 시크릿을 읽습니다.
```
{VAULT_ADDR}/v1/{NAMESPACE}/{MOUNT_NAME}/data/{PATH_PREFIX}/{SECRET_NAME}
```

예를 들어 다음 값이 있는 경우:
- `HCP_VAULT_ADDR="https://vault.example.com:8200"`
- `HCP_VAULT_NAMESPACE="admin"`
- `HCP_VAULT_MOUNT_NAME="secret"`
- `HCP_VAULT_PATH_PREFIX="litellm"`
- 시크릿 이름: `AZURE_API_KEY`


LiteLLM은 다음 위치를 조회합니다.
```
https://vault.example.com:8200/v1/admin/secret/data/litellm/AZURE_API_KEY
```

### 예상 시크릿 형식 {#expected-secret-format}

LiteLLM은 모든 시크릿이 시크릿 값을 포함하는 `key` 필드가 있는 JSON 객체로 저장되어 있다고 가정합니다.

예를 들어 `AZURE_API_KEY`의 경우 시크릿은 다음과 같이 저장되어야 합니다.

```json
{
  "key": "sk-1234"
}
```

<Image img={require('../../img/hcorp.png')} />

**시크릿 쓰기**

LiteLLM에서 가상 키가 생성되거나 삭제되면 LiteLLM은 Hashicorp Vault에서 해당 시크릿을 자동으로 생성하거나 삭제합니다.

- LiteLLM 관리자 UI 또는 API를 통해 LiteLLM에서 가상 키를 생성합니다.

<Image img={require('../../img/hcorp_create_virtual_key.png')} />


- Hashicorp Vault에서 시크릿을 확인합니다.

LiteLLM은 `prefix_for_stored_virtual_keys` 경로 아래에 시크릿을 저장합니다(기본값: `litellm/`).

<Image img={require('../../img/hcorp_virtual_key.png')} />

### 팀별 재정의 {#team-specific-overrides}

LiteLLM 프록시를 실행할 때 팀별로 Vault 위치를 재정의할 수 있습니다. 대시보드에서 [팀 수준 시크릿 관리자 설정](./overview.md#team-level-secret-manager-settings) 흐름을 사용하고 아래에 표시된 패널을 구성합니다.

<Image img={require('../../img/secret_manager_hashicorp_vault_settings.png')} />

JSON 페이로드에는 다음 구조를 사용합니다.

```json
{
  "namespace": "teams/team-a",
  "mount": "kv-prod",
  "path_prefix": "virtual-keys",
  "data": "password"
}
```

- `namespace` - `X-Vault-Namespace` 헤더를 재정의합니다.
- `mount` - 사용할 KV 엔진 마운트입니다(기본값: `secret`).
- `path_prefix` - 마운트와 시크릿 이름 사이에 추가할 경로 세그먼트입니다.
- `data` - KV 페이로드 내부의 필드 이름입니다(기본값: `key`).

LiteLLM이 해당 팀의 가상 키를 저장하거나 삭제할 때마다 이러한 재정의가 적용됩니다. 따라서 전역 Vault 구성을 변경하지 않고도 각 팀의 자격 증명을 자체 namespace, mount 또는 필드 레이아웃에 보관할 수 있습니다.
