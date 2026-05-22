import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 팀/프로젝트별 Credential 라우팅

요청을 보낸 팀이나 프로젝트에 따라 같은 모델을 서로 다른 LLM provider endpoint(예: 서로 다른 Azure instance)로 라우팅합니다.

## 개요

멀티 테넌트 배포에서는 여러 팀이 같은 모델 이름(예: `gpt-4`)을 사용하더라도 서로 다른 provider endpoint로 요청을 보내야 하는 경우가 많습니다. 예를 들어 비용 분리, 데이터 거주성, rate limit 분리를 위해 사업부별로 별도의 Azure OpenAI instance를 사용할 수 있습니다.

**Credential 라우팅**을 사용하면 모델 정의를 중복하거나 팀마다 별도 모델 그룹을 만들지 않고, 기존 [credentials table](./ui_credentials.md)을 사용해 팀/프로젝트 metadata에서 이 동작을 설정할 수 있습니다.

```
Hotel Team → gpt-4 → https://hotel-eastus.openai.azure.com/
Flight Team → gpt-4 → https://flight-centralus.openai.azure.com/
```

### 우선순위 체인

요청이 들어오면 시스템은 다음 우선순위 체인을 순서대로 확인합니다. 먼저 일치하는 항목이 적용됩니다.

1. **Clientside credentials** — 요청 본문에 전달된 `api_base`/`api_key`([문서](./clientside_auth.md))
2. **프로젝트 모델별 설정** — 프로젝트의 `model_config`에 있는 해당 모델 전용 override
3. **프로젝트 기본값** — 프로젝트의 `model_config`에 있는 `defaultconfig`
4. **팀 모델별 설정** — 팀의 `model_config`에 있는 해당 모델 전용 override
5. **팀 기본값** — 팀의 `model_config`에 있는 `defaultconfig`
6. **배포 기본값** — `config.yaml`에 설정된 모델의 `litellm_params`

## 빠른 시작

### 1단계: Credential 생성

Azure endpoint credential을 credentials table에 저장합니다. [UI](./ui_credentials.md) 또는 API로 설정할 수 있습니다.

```bash showLineNumbers
# Create credential for Hotel team's Azure endpoint
curl -X POST 'http://0.0.0.0:4000/credentials' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "credential_name": "hotel-azure-eastus",
    "credential_values": {
        "api_base": "https://hotel-eastus.openai.azure.com/",
        "api_key": "sk-azure-hotel-key-xxx"
    }
}'
```

```bash showLineNumbers
# Create credential for Flight team's Azure endpoint
curl -X POST 'http://0.0.0.0:4000/credentials' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "credential_name": "flight-azure-centralus",
    "credential_values": {
        "api_base": "https://flight-centralus.openai.azure.com/",
        "api_key": "sk-azure-flight-key-xxx"
    }
}'
```

### 2단계: 팀에 `model_config` 설정

팀 metadata에 `model_config` key를 추가하고 credential 이름을 참조하도록 설정합니다.

```bash showLineNumbers
# Hotel team — default Azure endpoint for all models
curl -X PATCH 'http://0.0.0.0:4000/team/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "hotel-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-azure-eastus"
                }
            }
        }
    }
}'
```

```bash showLineNumbers
# Flight team — default Azure endpoint for all models
curl -X PATCH 'http://0.0.0.0:4000/team/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "flight-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "flight-azure-centralus"
                }
            }
        }
    }
}'
```

### 3단계: 요청 보내기

요청은 API key의 팀에 따라 올바른 Azure endpoint로 자동 라우팅됩니다.

```bash showLineNumbers
# Request using Hotel team's API key → routes to hotel-eastus.openai.azure.com
curl http://localhost:4000/v1/chat/completions \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-hotel-team-key' \
-d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}'

# Request using Flight team's API key → routes to flight-centralus.openai.azure.com
curl http://localhost:4000/v1/chat/completions \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-flight-team-key' \
-d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}'
```

## 모델별 Override

기본 credential은 유지하면서 특정 모델에만 다른 credential을 설정할 수 있습니다.

```bash showLineNumbers
curl -X PATCH 'http://0.0.0.0:4000/team/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "team_id": "hotel-team-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-azure-eastus"
                }
            },
            "gpt-4": {
                "azure": {
                    "litellm_credentials": "hotel-azure-westus"
                }
            }
        }
    }
}'
```

이 설정을 사용하면 다음과 같이 동작합니다.
- `gpt-4` 요청 → `hotel-azure-westus` credential(모델별 설정)
- 다른 모든 모델 → `hotel-azure-eastus` credential(기본값)

## 프로젝트 수준 Override

프로젝트는 팀의 `model_config`를 상속하지만 프로젝트 수준에서 override할 수 있습니다. 프로젝트 override는 팀 override보다 우선합니다.

```bash showLineNumbers
# Project overrides the team default for all models
curl -X PATCH 'http://0.0.0.0:4000/project/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "project_id": "hotel-rec-app-id",
    "metadata": {
        "model_config": {
            "defaultconfig": {
                "azure": {
                    "litellm_credentials": "hotel-rec-azure"
                }
            },
            "gpt-4-vision": {
                "azure": {
                    "litellm_credentials": "hotel-rec-vision"
                }
            }
        }
    }
}'
```

### 전체 예제: 두 프로젝트가 있는 Hotel Team

**설정:**
- **Hotel Team**: 기본값 `hotel-azure-eastus`, GPT-4 override는 `hotel-azure-westus`
- **Hotel Rec App**(project): 기본값 `hotel-rec-azure`, GPT-4-Vision override는 `hotel-rec-vision`
- **Hotel Review App**(project): override 없음 — 팀 설정 상속

**해결 결과:**

| 요청 | 확인된 Credential | 이유 |
|---|---|---|
| Hotel Rec App → `gpt-4` | `hotel-rec-azure` | 프로젝트 기본값(`gpt-4`에 대한 프로젝트 모델별 설정 일치 없음) |
| Hotel Rec App → `gpt-4-vision` | `hotel-rec-vision` | 프로젝트 모델별 설정 |
| Hotel Review App → `gpt-3.5` | `hotel-azure-eastus` | 팀 기본값(project config 없음) |
| Hotel Review App → `gpt-4` | `hotel-azure-westus` | 팀 모델별 설정 |

## `model_config` Schema

`model_config` key는 팀/프로젝트 `metadata` 안의 JSON object입니다.

```json
{
    "model_config": {
        "defaultconfig": {
            "<provider>": {
                "litellm_credentials": "<credential-name>"
            }
        },
        "<model-name>": {
            "<provider>": {
                "litellm_credentials": "<credential-name>"
            }
        }
    }
}
```

| 필드 | 설명 |
|---|---|
| `defaultconfig` | 명시적으로 나열되지 않은 모든 모델에 사용할 fallback credential |
| `<model-name>` | 모델별 override — LiteLLM model group name과 일치해야 함 |
| `<provider>` | Provider key(예: `azure`, `openai`, `bedrock`). 모델 이름에 provider prefix(예: `azure/gpt-4`)가 포함되면 시스템은 일치하는 provider key를 우선 사용 |
| `litellm_credentials` | [credentials table](./ui_credentials.md)에 있는 credential 이름 |

### Credential 값

참조된 credential에는 다음 값의 조합을 포함할 수 있습니다.

| Key | 설명 |
|---|---|
| `api_base` | Provider endpoint URL 값 |
| `api_key` | provider용 API key |
| `api_version` | API version(예: Azure용) |

credential에 있는 key만 적용됩니다. 요청에 이미 있는 key(예: clientside `api_version`)는 덮어쓰지 않습니다.

## 기능 활성화

이 기능은 **기본적으로 비활성화**되어 있으며 명시적으로 활성화해야 합니다. 활성화하려면 다음 중 하나를 설정합니다.

<Tabs>

<TabItem value="config" label="config.yaml">

```yaml
litellm_settings:
    enable_model_config_credential_overrides: true
```

</TabItem>

<TabItem value="env" label="환경 변수">

```bash
export LITELLM_ENABLE_MODEL_CONFIG_CREDENTIAL_OVERRIDES=true
```

</TabItem>

</Tabs>

:::info
팀/프로젝트 metadata의 `model_config` 항목이 적용되려면 feature flag를 먼저 활성화해야 합니다. 활성화하지 않으면 credential 라우팅은 완전히 동작하지 않으며, metadata를 읽지 않고 credential도 해석하지 않습니다.
:::

## 관련 문서

- [Adding LLM Credentials](./ui_credentials.md) — 재사용 가능한 credential 생성 및 관리
- [Project Management](./project_management.md) — 프로젝트 계층 구조와 API
- [Team Budgets](./team_budgets.md) — 팀 수준 예산 관리
- [Clientside LLM Credentials](./clientside_auth.md) — 요청 본문에 credential 전달
- [Credential 사용법 Tracking](./credential_usage_tracking.md) — credential별 spend 추적
