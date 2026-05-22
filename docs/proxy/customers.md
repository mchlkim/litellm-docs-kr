import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 고객 / End-Users

고객별 지출을 추적하고 예산과 권한을 설정합니다.

## 고객 지출 및 권한 추적

### 1. Customer ID로 LLM API 호출하기

LiteLLM은 customer/end-user ID를 다음 순서로 확인합니다. 먼저 매칭되는 값이 사용됩니다.

| 우선순위 | 방식 | 위치 | 참고 |
|----------|--------|-------|-------|
| 1 | `x-litellm-customer-id` header | Request headers | 표준 header이며 항상 확인됩니다 |
| 2 | `x-litellm-end-user-id` header | Request headers | 표준 header이며 항상 확인됩니다 |
| 3 | `user_header_mappings`를 통한 custom header | Request headers | `general_settings`에서 설정 |
| 4 | `user_header_name`을 통한 custom header | Request headers | Deprecated - `user_header_mappings` 사용 권장 |
| 5 | `user` field | Request body | 표준 OpenAI field |
| 6 | `litellm_metadata.user` field | Request body | Anthropic 스타일 metadata |
| 7 | `metadata.user_id` field | Request body | 일반 metadata 패턴 |
| 8 | `safety_identifier` field | Request body | Responses API |

**옵션 1: 표준 headers** (권장 - request body 수정이 필요 없음)

```bash showLineNumbers title="header에 customer ID를 넣어 요청"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-1234' \
        --header 'x-litellm-end-user-id: ishaan3' \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

`x-litellm-customer-id`와 `x-litellm-end-user-id`는 모두 지원되며 별도 설정 없이 항상 확인됩니다.

**옵션 2: request body의 `user` field** (OpenAI 호환)

```bash showLineNumbers title="body에 customer ID를 넣어 요청"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-1234' \
        --data '{
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

**옵션 3: `user_header_mappings`를 통한 custom header** (설정 가능)

```yaml showLineNumbers title="config.yaml"
general_settings:
  user_header_mappings:
    - header_name: "x-my-app-user-id"
      litellm_user_role: "customer"
```

```bash showLineNumbers title="custom header로 요청"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-1234' \
        --header 'x-my-app-user-id: ishaan3' \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

**옵션 4: `litellm_metadata.user`** (Anthropic 스타일)

```bash showLineNumbers title="litellm_metadata.user로 요청"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-1234' \
        --data '{
        "model": "claude-3-5-sonnet",
        "messages": [{"role": "user", "content": "what time is it"}],
        "litellm_metadata": {"user": "ishaan3"}
        }'
```

**옵션 5: `metadata.user_id`**

```bash showLineNumbers title="metadata.user_id로 요청"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-1234' \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}],
        "metadata": {"user_id": "ishaan3"}
        }'
```

`customer_id`는 새 지출 정보와 함께 DB에 upsert됩니다.

`customer_id`가 이미 있으면 지출이 증가합니다.

### 2. 고객 지출 조회

<Tabs>
<TabItem value="all-up" label="전체 지출">

고객의 전체 지출을 가져오려면 `/customer/info`를 호출합니다.

```bash showLineNumbers title="고객 지출 조회"
curl -X GET 'http://0.0.0.0:4000/customer/info?end_user_id=ishaan3' \ # 👈 CUSTOMER ID
        -H 'Authorization: Bearer sk-1234' \ # 👈 YOUR PROXY KEY
```

예상 응답:

```json showLineNumbers title="응답"
{
    "user_id": "ishaan3",
    "blocked": false,
    "alias": null,
    "spend": 0.001413,
    "allowed_model_region": null,
    "default_model": null,
    "litellm_budget_table": null
}
```

</TabItem>
<TabItem value="event-webhook" label="Event Webhook">

client-side DB의 지출을 업데이트하려면 proxy가 webhook을 바라보도록 설정합니다.

예를 들어 서버가 `https://webhook.site`이고 `6ab090e8-c55f-4a23-b075-3209f5c57906`에서 수신 중이라면 다음과 같이 설정합니다.

1. proxy 환경에 webhook URL을 추가합니다.

```bash showLineNumbers title="webhook URL 설정"
export WEBHOOK_URL="https://webhook.site/6ab090e8-c55f-4a23-b075-3209f5c57906"
```

2. `config.yaml`에 `webhook`을 추가합니다.

```yaml showLineNumbers title="config.yaml"
general_settings: 
  alerting: ["webhook"] # 👈 핵심 변경
```

3. 테스트합니다.

```bash showLineNumbers title="webhook 테스트"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "mistral",
    "messages": [
        {
        "role": "user",
        "content": "What's the weather like in Boston today?"
        }
    ],
    "user": "krrish12"
}
'
```

예상 응답

```json showLineNumbers title="Webhook event payload"
{
  "spend": 0.0011120000000000001, # 👈 SPEND
  "max_budget": null,
  "token": "example-api-key-123",
  "customer_id": "krrish12",  # 👈 CUSTOMER ID
  "user_id": null,
  "team_id": null,
  "user_email": null,
  "key_alias": null,
  "projected_exceeded_date": null,
  "projected_spend": null,
  "event": "spend_tracked",
  "event_group": "customer",
  "event_message": "Customer spend tracked. Customer=krrish12, spend=0.0011120000000000001"
}
```

[Webhook Spec 보기](./alerting.md)

</TabItem>
</Tabs>


## 고객 Object 권한 설정

고객이 접근할 수 있는 resource(MCP servers, vector stores, agents)를 제어합니다.

### Object 권한이란?

Object 권한을 사용하면 고객이 접근할 수 있는 대상을 구체적으로 제한할 수 있습니다.
- **MCP Servers**: 고객이 호출할 수 있는 MCP server 제한
- **MCP Access Groups**: 고객을 미리 정의한 MCP server group에 할당
- **MCP Tool Permissions**: MCP server 안에서 고객이 사용할 수 있는 tool을 세밀하게 제어
- **Vector Stores**: 고객이 query할 수 있는 vector store 제어
- **Agents**: 고객이 상호작용할 수 있는 agent 제한
- **Agent Access Groups**: 고객을 미리 정의한 agent group에 할당

### Object 권한이 있는 고객 생성

```bash showLineNumbers title="object 권한이 있는 고객 생성"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "object_permission": {
      "mcp_servers": ["server_1", "server_2"],
      "mcp_access_groups": ["public_group"],
      "mcp_tool_permissions": {
        "server_1": ["tool_a", "tool_b"]
      },
      "vector_stores": ["vector_store_1"],
      "agents": ["agent_1"],
      "agent_access_groups": ["basic_agents"]
    }
  }'
```

**Parameters:**
- `mcp_servers` (Optional[List[str]]): 허용된 MCP server ID 목록
- `mcp_access_groups` (Optional[List[str]]): MCP access group 이름 목록
- `mcp_tool_permissions` (Optional[Dict[str, List[str]]]): server ID와 허용된 tool 이름의 매핑
- `vector_stores` (Optional[List[str]]): 허용된 vector store ID 목록
- `agents` (Optional[List[str]]): 허용된 agent ID 목록
- `agent_access_groups` (Optional[List[str]]): agent access group 이름 목록

**참고:** `object_permission`이 `null` 또는 `{}`이면 고객에게 object 수준 제한이 없습니다.

### 고객 Object 권한 업데이트

기존 고객의 object 권한을 업데이트할 수 있습니다.

```bash showLineNumbers title="고객 object 권한 업데이트"
curl -L -X POST 'http://localhost:4000/customer/update' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "object_permission": {
      "mcp_servers": ["server_3"],
      "vector_stores": ["vector_store_2", "vector_store_3"]
    }
  }'
```

### 고객 Object 권한 보기

고객 정보를 조회하면 응답에 object 권한이 포함됩니다.

```bash showLineNumbers title="object 권한이 포함된 고객 정보 조회"
curl -X GET 'http://0.0.0.0:4000/customer/info?end_user_id=user_1' \
    -H 'Authorization: Bearer sk-1234'
```

**응답:**
```json showLineNumbers title="object 권한이 포함된 응답"
{
  "user_id": "user_1",
  "blocked": false,
  "alias": "John Doe",
  "spend": 0.0,
  "object_permission": {
    "object_permission_id": "perm_abc123",
    "mcp_servers": ["server_1", "server_2"],
    "mcp_access_groups": ["public_group"],
    "mcp_tool_permissions": {
      "server_1": ["tool_a", "tool_b"]
    },
    "vector_stores": ["vector_store_1"],
    "agents": ["agent_1"],
    "agent_access_groups": ["basic_agents"]
  },
  "litellm_budget_table": null
}
```

### 사용 사례

**1. 계층형 접근 제어**
고객별로 서로 다른 권한 tier를 만듭니다.

```bash showLineNumbers title="무료 tier 고객"
# 무료 tier - 제한된 접근
curl -L -X POST 'http://localhost:4000/customer/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "free_user",
    "budget_id": "free_tier",
    "object_permission": {
      "mcp_access_groups": ["public_group"],
      "agent_access_groups": ["basic_agents"]
    }
  }'
```

```bash showLineNumbers title="프리미엄 tier 고객"
# 프리미엄 tier - 전체 접근
curl -L -X POST 'http://localhost:4000/customer/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "premium_user",
    "budget_id": "premium_tier",
    "object_permission": {
      "mcp_servers": ["server_1", "server_2", "server_3"],
      "vector_stores": ["vector_store_1", "vector_store_2"],
      "agents": ["agent_1", "agent_2", "agent_3"]
    }
  }'
```

**2. 부서별 접근**
고객이 부서와 관련된 resource에만 접근하도록 제한합니다.

```bash showLineNumbers title="영업팀 고객"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "sales_user",
    "object_permission": {
      "mcp_servers": ["crm_server", "email_server"],
      "agents": ["sales_assistant"],
      "vector_stores": ["sales_knowledge_base"]
    }
  }'
```

**3. Tool 수준 제한**
MCP server 안의 특정 tool에만 접근 권한을 부여합니다.

```bash showLineNumbers title="제한된 tool 접근"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "restricted_user",
    "object_permission": {
      "mcp_servers": ["database_server"],
      "mcp_tool_permissions": {
        "database_server": ["read_only_query", "get_table_schema"]
      }
    }
  }'
```

## 고객 예산 설정

LiteLLM Proxy에서 고객 예산(예: 월별 예산, tpm/rpm 제한)을 설정합니다.

### 모든 고객의 기본 예산

명시적 예산이 없는 모든 고객에게 예산 제한을 적용합니다. 전체 end user에 대한 rate limit과 지출 제어에 유용합니다.

**1단계: 기본 예산 생성**

```bash showLineNumbers title="기본 예산 생성"
curl -X POST 'http://localhost:4000/budget/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "max_budget": 10,
    "rpm_limit": 2,
    "tpm_limit": 1000
}'
```

**2단계: 기본 예산 ID 설정**

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  max_end_user_budget_id: "budget_id_from_step_1"
```

**3단계: 테스트**

```bash showLineNumbers title="customer ID로 요청"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "user": "my-customer-id"
}'
```

이 고객은 기본 예산 제한(RPM, TPM, 금액 예산)의 적용을 받습니다. 명시적 예산이 있는 고객은 영향을 받지 않습니다.

### 빠른 시작 

예산이 있는 고객을 생성하거나 업데이트합니다.

**예산이 있는 새 고객 생성**
```bash showLineNumbers title="예산이 있는 고객 생성"
curl -X POST 'http://0.0.0.0:4000/customer/new'         
    -H 'Authorization: Bearer sk-1234'         
    -H 'Content-Type: application/json'         
    -d '{
        "user_id" : "my-customer-id",
        "max_budget": "0", # 👈 FLOAT 가능
    }'
```

**테스트**

```bash showLineNumbers title="고객 예산 테스트"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "mistral",
    "messages": [
        {
        "role": "user",
        "content": "What'\''s the weather like in Boston today?"
        }
    ],
    "user": "ishaan-jaff-48"
}
```

### Pricing Tier 할당

pricing tier를 만들고 고객에게 할당합니다.

#### 1. 예산 생성

<Tabs>
<TabItem value="ui" label="UI">

- UI에서 `Budgets` tab으로 이동합니다.
- `+ Create Budget`을 클릭합니다.
- pricing tier를 만듭니다(예: 예산 $4의 `my-free-tier`). 이 pricing tier에 속한 각 user의 max budget이 $4라는 뜻입니다.

<Image img={require('../../img/create_budget_modal.png')} />

</TabItem>
<TabItem value="api" label="API">

새 예산을 만들려면 `/budget/new` endpoint를 사용합니다. [API Reference](https://litellm-api.up.railway.app/#/budget%20management/new_budget_budget_new_post)

```bash showLineNumbers title="API로 예산 생성"
curl -X POST 'http://localhost:4000/budget/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "budget_id": "my-free-tier", 
    "max_budget": 4 
}
```

</TabItem>
</Tabs>


#### 2. 고객에게 예산 할당

애플리케이션 코드에서 새 고객을 만들 때 예산을 할당합니다.

예산을 만들 때 사용한 `budget_id`를 그대로 사용하면 됩니다. 이 예시에서는 `my-free-tier`입니다.

```bash showLineNumbers title="고객에게 예산 할당"
curl -X POST 'http://localhost:4000/customer/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "user_id": "my-customer-id",
    "budget_id": "my-free-tier" # 👈 핵심 변경
}
```

#### 3. 테스트

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="curl로 테스트"
curl -X POST 'http://localhost:4000/customer/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "user_id": "my-customer-id",
    "budget_id": "my-free-tier" # 👈 핵심 변경
}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python showLineNumbers title="OpenAI SDK로 테스트"
from openai import OpenAI
client = OpenAI(
  base_url="<your_proxy_base_url>",
  api_key="<your_proxy_key>"
)

completion = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  user="my-customer-id"
)

print(completion.choices[0].message)
```

</TabItem>
</Tabs>
