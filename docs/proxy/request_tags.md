import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 비용 추적을 위한 요청 태그 {#request-tags-for-cost-tracking}

모델 배포에 태그를 추가하면 환경, AWS 계정 또는 원하는 사용자 지정 레이블별로 지출을 추적할 수 있습니다.

태그는 LiteLLM 지출 로그의 `request_tags` 필드에 표시됩니다.

:::info 요구 사항
가상 키와 데이터베이스가 설정되어 있어야 합니다. [가상 키 설정](./virtual_keys.md)을 참고하세요.
:::

## Config 설정 {#config-setup}

`config.yaml`에서 모델 배포에 태그를 설정합니다.

```yaml title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-prod
      api_key: os.environ/AZURE_PROD_API_KEY
      api_base: https://prod.openai.azure.com/
      tags: ["AWS_IAM_PROD"]  # 👈 Tag for production

  - model_name: gpt-4-dev
    litellm_params:
      model: azure/gpt-4-dev
      api_key: os.environ/AZURE_DEV_API_KEY
      api_base: https://dev.openai.azure.com/
      tags: ["AWS_IAM_DEV"]  # 👈 Tag for development
```

## 요청 보내기 {#make-request}

### 옵션 1: Config 태그 사용(자동) {#option-1-use-config-tags-automatic}

요청에서는 모델만 지정하면 됩니다. 태그는 Config에서 자동으로 적용됩니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 옵션 2: `x-litellm-tags` 헤더 사용 {#option-2-use-x-litellm-tags-header}

`x-litellm-tags` 헤더를 통해 쉼표로 구분된 문자열로 태그를 동적으로 전달합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -H 'x-litellm-tags: team-api,production,us-east-1' \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

형식: 쉼표로 구분된 문자열입니다. 공백은 자동으로 제거됩니다. `"tag1,tag2,tag3"`

### 옵션 3: 요청 본문의 `tags` 사용 {#option-3-use-request-body-tags}

요청 본문에서 태그를 직접 전달합니다. 두 가지 형식이 모두 지원됩니다.

<Tabs>
<TabItem value="direct" label="직접 tags 필드">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "tags": ["team-api", "production", "us-east-1"]
  }'
```

</TabItem>

<TabItem value="metadata" label="Metadata 중첩">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "tags": ["team-api", "production", "us-east-1"]
    }
  }'
```

</TabItem>
</Tabs>

`tags` 필드는 문자열 배열이어야 합니다.

:::info
헤더나 요청 본문으로 태그를 제공하면 모델 배포에 설정된 태그를 덮어씁니다. 헤더 태그와 본문 태그를 모두 제공한 경우 본문 태그가 우선합니다.
:::

## 키 또는 팀에 태그 설정 {#set-tags-on-keys-or-teams}

API 키 또는 팀 수준에서도 기본 태그를 설정할 수 있습니다.

<Tabs>
<TabItem value="key" label="키에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "metadata": {
      "tags": ["customer-acme", "tier-premium"]
    }
  }'
```

</TabItem>
<TabItem value="team" label="팀에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "metadata": {
      "tags": ["team-engineering", "department-ai"]
    }
  }'
```

</TabItem>
</Tabs>

## 고급: 사용자 지정 헤더 추적 {#advanced-custom-header-tracking}

Config에 원하는 사용자 지정 헤더를 추가하여 지출을 추적할 수 있습니다.

```yaml
litellm_settings:
  extra_spend_tag_headers:
    - "x-custom-header"
    - "x-customer-id"
```

**User-Agent 추적 비활성화:**

```yaml
litellm_settings:
  disable_add_user_agent_to_request_tags: true
```

## 지출 로그 {#spend-logs}

모델 Config의 태그는 `LiteLLM_Spend로그`에 표시됩니다.

```json
{
  "request_id": "chatcmpl-abc123",
  "request_tags": ["AWS_IAM_PROD"],
  "spend": 0.002,
  "model": "gpt-4"
}
```

## 관련 문서 {#related}

- [비용 추적 개요](cost_tracking.md) - 태그로 지출을 추적하는 전체 튜토리얼
- [태그 예산](tag_budgets.md) - 태그별 예산 한도 설정
- [가상 키 설정](virtual_keys.md) - 태그 추적에 필요
