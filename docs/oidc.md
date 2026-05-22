# [베타] OpenID Connect (OIDC) {#beta-openid-connect-oidc}
LiteLLM은 업스트림 서비스 인증에 OpenID Connect (OIDC)를 사용할 수 있습니다. 이를 통해 구성 파일에 민감한 자격 증명을 저장하지 않아도 됩니다.

:::info

이 기능은 베타입니다.

:::


## OIDC ID 공급자(IdP) {#oidc-identity-provider-idp}

LiteLLM은 다음 OIDC ID 공급자를 지원합니다.

| 공급자                   | 구성 이름    | 사용자 지정 대상 |
| -------------------------| ------------ | ---------------- |
| Google Cloud Run         | `google`     | 예               |
| CircleCI v1              | `circleci`   | 아니요           |
| CircleCI v2              | `circleci_v2`| 아니요           |
| GitHub Actions           | `github`     | 예               |
| Azure Kubernetes Service | `azure`      | 아니요           |
| Azure AD                 | `azure`      | 예               |
| 파일                     | `file`       | 아니요           |
| 환경 변수                | `env`        | 아니요           |
| 환경 경로                | `env_path`   | 아니요           |

다른 OIDC 공급자를 사용하려면 GitHub에 이슈를 열어 주세요.

:::tip

작동 방식을 정확히 알고 있고 다른 공급자가 사용 사례에 맞지 않는다고 확신하는 경우가 아니라면 `file`, `env`, `env_path` provider를 사용하지 마세요. 힌트: 대부분은 다른 공급자로 처리할 수 있습니다.

:::

## OIDC 신뢰 당사자(RP) {#oidc-connect-relying-party-rp}

LiteLLM은 다음 OIDC 신뢰 당사자 / 클라이언트를 지원합니다.

- Amazon Bedrock
- Azure OpenAI
- _(곧 지원 예정) Google Cloud Vertex AI_


### OIDC 구성 {#configuring-oidc}

비밀 키를 사용할 수 있는 곳에서는 OIDC를 대신 사용할 수 있습니다. 일반 형식은 다음과 같습니다.

```
oidc/config_name_here/audience_here
```

`audience` 매개변수를 사용하지 않는 공급자에서는 이를 생략할 수 있으며, 생략하는 것이 좋습니다.

```
oidc/config_name_here/
```

#### 비공식 Provider(권장하지 않음)

비공식 `file` provider에는 다음 형식을 사용할 수 있습니다.
이중 슬래시에 유의하세요. `oidc/file/` 뒤의 경로는 절대 경로여야 합니다.

```
oidc/file//var/run/secrets/my-token
```

안전을 위해 확인된 경로는 허용된 자격 증명 디렉터리 안에 있어야 합니다. 기본적으로 다음 디렉터리가 허용됩니다.

- `/var/run/secrets`
- `/run/secrets`

배포 환경에서 자격 증명을 다른 위치에 마운트하는 경우 `LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS` 환경 변수를 쉼표로 구분된 절대 디렉터리 목록으로 설정하세요. 이 값은 기본 목록을 대체하므로 기본값이 여전히 필요하다면 함께 포함하세요.

```bash
export LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS="/var/run/secrets,/etc/litellm/creds"
```

심볼릭 링크와 `..`을 따라 확인한 결과 허용 목록 밖으로 벗어나는 경로는 거부됩니다.

비공식 `env`에는 다음 형식을 사용하세요. 여기서 `SECRET_TOKEN`은 토큰이 들어 있는 환경 변수의 이름입니다.

```
oidc/env/SECRET_TOKEN
```

비공식 `env_path`에는 다음 형식을 사용하세요. 여기서 `SECRET_TOKEN`은 토큰이 들어 있는 파일 경로를 담은 환경 변수의 이름입니다.

```
oidc/env_path/SECRET_TOKEN
```

:::tip

oidc/env_path/AZURE_FEDERATED_TOKEN_FILE를 사용하려는 경우에는 그렇게 하지 마세요. 대신 `oidc/azure/`를 사용하세요. 이렇게 하면 Azure가 OIDC 구성을 변경하거나 새 기능을 추가하더라도 LiteLLM의 지속적인 지원을 받을 수 있습니다.

:::

## 예제

### Google Cloud Run -> Amazon Bedrock

```yaml
model_list:
  - model_name: claude-3-haiku-20240307
    litellm_params:
      model: bedrock/anthropic.claude-3-haiku-20240307-v1:0
      aws_region_name: us-west-2
      aws_session_name: "litellm"
      aws_role_name: "arn:aws:iam::YOUR_THING_HERE:role/litellm-google-demo"
      aws_web_identity_token: "oidc/google/https://example.com"
```

### CircleCI v2 -> Amazon Bedrock

```yaml
model_list:
  - model_name: command-r
    litellm_params:
      model: bedrock/cohere.command-r-v1:0
      aws_region_name: us-west-2
      aws_session_name: "my-test-session"
      aws_role_name: "arn:aws:iam::335785316107:role/litellm-github-unit-tests-circleci"
      aws_web_identity_token: "oidc/example-provider/"
```

#### CircleCI v2 -> Bedrock용 Amazon IAM Role 설정

아래 구성은 예시일 뿐입니다. 구체적인 사용 사례에 맞게 권한과 신뢰 관계를 조정해야 합니다.

권한:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:*::foundation-model/cohere.command-r-v1:0"
            ]
        }
    ]
}
```

더 많은 예시는 https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html 을 참고하세요.

신뢰 관계(Trust Relationship):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::335785316107:oidc-provider/oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd:aud": "c5a99188-154f-4f69-8da2-b442b1bf78dd"
                },
                "ForAnyValue:StringLike": {
                    "oidc.circleci.com/org/c5a99188-154f-4f69-8da2-b442b1bf78dd:sub": [
                        "org/c5a99188-154f-4f69-8da2-b442b1bf78dd/project/*/user/*/vcs-origin/github.com/BerriAI/litellm/vcs-ref/refs/heads/main",
                        "org/c5a99188-154f-4f69-8da2-b442b1bf78dd/project/*/user/*/vcs-origin/github.com/BerriAI/litellm/vcs-ref/refs/heads/litellm_*"
                    ]
                }
            }
        }
    ]
}
```

이 신뢰 관계는 CircleCI가 main 브랜치와 `litellm_`로 시작하는 브랜치에서만 role을 assume하도록 제한합니다.

CircleCI(v1 및 v2)의 경우 AWS IAM 설정에 조직의 OIDC 공급자도 추가해야 합니다. 자세한 내용은 https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html 을 참고하세요.

:::tip

IAM 사용자를 만들 필요는 _절대_ 없어야 합니다. 만들었다면 OIDC를 올바르게 사용하고 있지 않은 것입니다. OIDC 공급자에 대한 권한과 신뢰 관계가 있는 role만 생성해야 합니다.

:::


### Google Cloud Run -> Azure OpenAI

```yaml
model_list:
  - model_name: gpt-4o-2024-05-13
    litellm_params:
      model: azure/gpt-4o-2024-05-13
      azure_ad_token: "oidc/google/https://example.com"
      api_version: "2024-06-01"
      api_base: "https://demo-here.openai.azure.com"
    model_info:
      base_model: azure/gpt-4o-2024-05-13
```

Azure OpenAI의 경우 환경에 `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`를 정의해야 하며, 필요하면 `AZURE_AUTHORITY_HOST`도 정의할 수 있습니다.

```bash
export AZURE_CLIENT_ID="91a43c21-cf21-4f34-9085-331015ea4f91" # Azure AD Application (Client) ID
export AZURE_TENANT_ID="f3b1cf79-eba8-40c3-8120-cb26aca169c2" # Will be the same across of all your Azure AD applications
export AZURE_AUTHORITY_HOST="https://login.microsoftonline.com" # 👈 Optional, defaults to "https://login.microsoftonline.com"
```

:::tip

`https://login.microsoftonline.com/YOUR_DOMAIN_HERE/v2.0/.well-known/openid-configuration`에 접속한 뒤 `issuer` 필드의 UUID를 확인하면 `AZURE_CLIENT_ID`를 찾을 수 있습니다.

:::


:::tip

기본값을 재정의해야 하는 경우가 아니라면 환경에 `AZURE_AUTHORITY_HOST`를 설정하지 마세요. 이렇게 하면 나중에 기본값이 바뀌더라도 환경을 업데이트할 필요가 없습니다.

:::


:::tip

기본적으로 Azure AD 애플리케이션은 audience `api://AzureADTokenExchange`를 사용합니다. 애플리케이션에 더 구체적인 audience를 설정하는 것을 권장합니다.

:::


#### Azure AD 애플리케이션 설정 {#azure-ad-application-setup}

아쉽게도 Azure는 AWS 같은 다른 OIDC 신뢰 당사자보다 설정이 조금 더 복잡합니다. 기본적으로 다음 작업이 필요합니다.

1. Azure 애플리케이션을 생성합니다.
2. 사용 중인 OIDC IdP(예: Google Cloud Run)에 대한 federated credential을 추가합니다.
3. Azure OpenAI resource가 포함된 resource group에 Azure 애플리케이션을 추가합니다.
4. Azure OpenAI resource에 접근하는 데 필요한 role을 Azure 애플리케이션에 부여합니다.

아래 custom role은 Azure 애플리케이션이 Azure OpenAI resource에 접근하는 데 권장되는 최소 권한입니다. 구체적인 사용 사례에 맞게 권한을 조정해야 합니다.

```json
{
    "id": "/subscriptions/24ebb700-ec2f-417f-afad-78fe15dcc91f/providers/Microsoft.Authorization/roleDefinitions/baf42808-99ff-466d-b9da-f95bb0422c5f",
    "properties": {
        "roleName": "invoke-only",
        "description": "",
        "assignableScopes": [
            "/subscriptions/24ebb700-ec2f-417f-afad-78fe15dcc91f/resourceGroups/your-openai-group-name"
        ],
        "permissions": [
            {
                "actions": [],
                "notActions": [],
                "dataActions": [
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/audio/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/search/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/chat/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/extensions/chat/completions/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/deployments/embeddings/action",
                    "Microsoft.CognitiveServices/accounts/OpenAI/images/generations/action"
                ],
                "notDataActions": []
            }
        ]
    }
}
```

_참고: 사용자의 UUID는 다릅니다._

Azure AD 애플리케이션 설정에 도움이 필요하면 유료 enterprise support로 문의하세요.

### Azure AD -> Amazon Bedrock
```yaml
model list:
  - model_name: aws/claude-3-5-sonnet
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_region_name: "eu-central-1"
      aws_role_name: "arn:aws:iam::12345678:role/bedrock-role"
      aws_web_identity_token: "oidc/azure/api://123-456-789-9d04"
      aws_session_name: "litellm-session"
```
