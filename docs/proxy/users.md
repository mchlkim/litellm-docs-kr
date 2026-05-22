import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 예산, Rate Limit

:::info **Budget 설정 옵션**
**Personal budgets**: 개인 spend limit을 위해 `team_id` 없이 virtual key를 생성합니다.

**Team budgets**: team의 shared budget을 사용하려면 virtual key에 `team_id`를 추가합니다.

**Team member budgets**: team shared budget 안에서 개인 spend limit을 설정합니다.

**Agent budgets**: agent에 rate limit(tpm/rpm)과 session-level cap(iteration, dollar budget)을 설정합니다. [**이동**](#agents)

***key가 team에 속하면 사용자의 personal budget이 아니라 team budget이 적용됩니다.***
:::

요구사항:

- Postgres database가 필요합니다. 예: [Supabase](https://supabase.com/), [Neon](https://neon.tech/) 등. [**Setup 보기**](./virtual_keys.md#setup)


## 예산 설정

### Global Proxy

proxy의 모든 call에 budget을 적용합니다.

**1단계. config.yaml 수정**

```yaml
general_settings:
  master_key: sk-1234

litellm_settings:
  # other litellm settings
  max_budget: 0 # (float) sets max budget as $0 USD
  budget_duration: 30d # (str) frequency of reset - You can set duration as seconds ("30s"), minutes ("30m"), hours ("30h"), days ("30d").
```

**2단계. proxy 시작**

```bash
litellm /path/to/config.yaml
```

**3단계. test call 전송**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Autherization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
}'
```

### Team

가능한 작업:
- Team에 budget 추가

:::info

Team budget 설정 및 reset에 대한 단계별 tutorial입니다. API 또는 관리자 UI를 사용할 수 있습니다.


#### **team에 budget 추가**
```shell 
curl --location 'http://localhost:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "my-new-team_4",
  "members_with_roles": [{"role": "admin", "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"}],
  "rpm_limit": 99
}' 
```

[**See Swagger**](https://litellm-api.up.railway.app/#/team%20management/new_team_team_new_post)

**Sample Response**

```shell
{
    "team_alias": "my-new-team_4",
    "team_id": "13e83b19-f851-43fe-8e93-f96e21033100",
    "admins": [],
    "members": [],
    "members_with_roles": [
        {
            "role": "admin",
            "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"
        }
    ],
    "metadata": {},
    "tpm_limit": null,
    "rpm_limit": 99,
    "max_budget": null,
    "models": [],
    "spend": 0.0,
    "max_parallel_requests": null,
    "budget_duration": null,
    "budget_reset_at": null
}
```

#### **team에 budget duration 추가**

`budget_duration`: 지정한 duration이 끝나면 budget이 reset됩니다. 설정하지 않으면 budget은 reset되지 않습니다. duration은 seconds("30s"), minutes("30m"), hours("30h"), days("30d")로 설정할 수 있습니다.

```
curl 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_alias": "my-new-team_4",
  "members_with_roles": [{"role": "admin", "user_id": "5c4a0aa3-a1e1-43dc-bd87-3c2da8382a3a"}],
  "budget_duration": "30s",
}'
```

### Team Member

Team 안에서 user spend에 budget을 적용하고 싶을 때 사용합니다.


#### 1단계. User 생성

`user_id=ishaan`인 user를 생성합니다.

```shell
curl --location 'http://0.0.0.0:4000/user/new' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "ishaan"
}'
```

#### 2단계. 기존 Team에 User 추가 - `max_budget_in_team` 설정

User를 team에 추가할 때 `max_budget_in_team`을 설정합니다. 1단계에서 설정한 동일한 `user_id`를 사용합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32", "max_budget_in_team": 0.000000000001, "member": {"role": "user", "user_id": "ishaan"}}'
```

#### 3단계. 1단계의 Team member용 Key 생성

1단계의 `user_id=ishaan`을 설정합니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "ishaan",
        "team_id": "e8d1460f-846c-45d7-9b43-55f3cc52ac32"
}'
```
`/key/generate`의 response

4단계에서는 이 response의 `key`를 사용합니다.
```shell
{"key":"sk-RV-l2BJEZ_LYNChSx2EueQ", "models":[],"spend":0.0,"max_budget":null,"user_id":"ishaan","team_id":"e8d1460f-846c-45d7-9b43-55f3cc52ac32","max_parallel_requests":null,"metadata":{},"tpm_limit":null,"rpm_limit":null,"budget_duration":null,"allowed_cache_controls":[],"soft_budget":null,"key_alias":null,"duration":null,"aliases":{},"config":{},"permissions":{},"model_max_budget":{},"key_name":null,"expires":null,"token_id":null}% 
```

#### 4단계. Team member용 /chat/completions request 실행

이 request에는 3단계의 key를 사용합니다. 2~3회 request 후 `ExceededBudget: Crossed spend within team` error가 표시되어야 합니다.


```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-RV-l2BJEZ_LYNChSx2EueQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "tes4"
        }
    ]
}'
```


### Internal User

internal user(key owner)가 proxy에서 수행할 수 있는 모든 call에 budget을 적용합니다.

:::info

`team_id`가 설정된 key는 user의 personal budget 대신 team budget을 사용합니다.

team 안의 user에게 budget을 적용하려면 team member budget을 사용하세요.

:::

LiteLLM은 이를 위한 budget을 생성할 수 있도록 `/user/new` endpoint를 제공합니다.

You can:
- user에 budget 추가
- spend reset을 위한 budget duration 추가

기본적으로 `max_budget`은 `null`로 설정되며 key에 대해 검사되지 않습니다.

#### **user에 budget 추가** {#add-budgets-to-internal-users}
```shell 
curl --location 'http://localhost:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"models": ["azure-models"], "max_budget": 0, "user_id": "krrish3@berri.ai"}' 
```

[**Swagger 보기**](https://litellm-api.up.railway.app/#/user%20management/new_user_user_new_post)

**Sample Response**

```shell
{
    "key": "sk-YF2OxDbrgd1y2KgwxmEA2w",
    "expires": "2023-12-22T09:53:13.861000Z",
    "user_id": "krrish3@berri.ai",
    "max_budget": 0.0
}
```

#### **user에 budget duration 추가** {#add-budget-duration-to-internal-users}

`budget_duration`: 지정한 duration이 끝나면 budget이 reset됩니다. 설정하지 않으면 budget은 reset되지 않습니다. duration은 seconds("30s"), minutes("30m"), hours("30h"), days("30d")로 설정할 수 있습니다.

```
curl 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
  "budget_duration": "30s",
}'
```

#### 기존 user용 새 key 생성

이제 해당 user_id(예: krrish3@berri.ai)로 `/key/generate`를 호출하면 됩니다.
- **Budget Check**: 이 key에 대해 krrish3@berri.ai의 budget(예: $10)이 확인됩니다.
- **비용 추적**: 이 key의 spend는 krrish3@berri.ai의 spend도 함께 업데이트합니다.

```bash
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{"models": ["azure-models"], "user_id": "krrish3@berri.ai"}'
```

### Virtual Key

key에 budget을 적용합니다.

가능한 작업:
- key에 budget 추가
- spend reset을 위한 budget duration 추가

**예상 동작**
- key별 cost는 `LiteLLM_VerificationToken` table에 자동 입력됩니다.
- key가 `max_budget`을 넘으면 request가 실패합니다.
- duration이 설정되어 있으면 duration 끝에서 spend가 reset됩니다.

기본적으로 `max_budget`은 `null`로 설정되며 key에 대해 검사되지 않습니다.

#### **key에 budget 추가** {#add-budgets-to-virtual-keys}

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
}'
```

key가 budget을 초과했을 때 `/chat/completions` 예제 request

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <generated-key>' \
  --data ' {
  "model": "azure-gpt-3.5",
  "user": "e09b4da8-ed80-4b05-ac93-e16d9eb56fca",
  "messages": [
      {
      "role": "user",
      "content": "respond in 50 lines"
      }
  ],
}'
```


key가 budget을 초과했을 때 `/chat/completions`의 예상 response
```shell
{
  "detail":"Authentication Error, ExceededTokenBudget: Current spend for token: 7.2e-05; Max Budget for Token: 2e-07"
}   
```

#### **key에 budget duration 추가** {#add-budget-duration-to-virtual-keys}

`budget_duration`: 지정한 duration이 끝나면 budget이 reset됩니다. 설정하지 않으면 budget은 reset되지 않습니다. duration은 seconds("30s"), minutes("30m"), hours("30h"), days("30d")로 설정할 수 있습니다.

```
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "team_id": "core-infra", # [OPTIONAL]
  "max_budget": 10,
  "budget_duration": "30s",
}'
```

#### **key에 여러 budget window 설정**

동일한 key에 서로 다른 시간 단위의 여러 concurrent budget limit을 적용합니다. 예를 들어 key를 **$10/day** 그리고 **$100/month**로 제한할 수 있습니다.

**언제 유용한가요?**

단일 `budget_duration` window만으로는 하루의 비정상 사용량이 월 전체 예산을 소진하는 것을 막기 어렵습니다. 여러 budget window를 사용하면 다음이 가능합니다.

- 정상적인 월간 spend는 허용하면서 하루 안의 급격한 usage spike를 차단합니다.
- Claude Code rollout에 daily guardrail(`24h`)과 monthly ceiling(`30d`)을 함께 적용해 단일 heavy session이 한 달 budget을 모두 소진하지 않게 합니다.
- bursty workload에 주간 cap 위로 세밀한 hourly limit을 계층화합니다.

:::info

key, team, user 전반에서 budget이 동작하는 방식은 [User Budget docs](https://docs.litellm.ai/docs/proxy/users)를 참고하세요.

:::

**API 사용**

`budget_limits`를 `{budget_duration, max_budget}` object 목록으로 전달합니다.

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "budget_limits": [
    {"budget_duration": "24h",  "max_budget": 10},
    {"budget_duration": "30d",  "max_budget": 100}
  ]
}'
```

각 window는 독립적으로 추적되며 자체 schedule에 따라 reset됩니다.

| `budget_duration` | reset 시점 |
|---|---|
| `1h`  | 매시간 |
| `24h` | 매일 UTC 자정 |
| `7d`  | 매주 일요일 UTC 자정 |
| `30d` | 매월 1일 UTC 자정 |

**Dashboard 사용**

**가상 키 → Create Key → Optional Settings → Budget Windows**를 엽니다.

![Step 1 - open key settings](https://colony-recorder.s3.amazonaws.com/files/2026-04-01/18930ba5-67c0-4031-afc0-57f37b4e59e4/ascreenshot_ef79d8a000bb41cdacf1bd9827732ee8_text_export.jpeg)

**+ Add Budget Window**를 클릭해 행을 추가하고, 드롭다운에서 기간을 선택한 뒤 spend cap을 입력합니다.

![Step 2 - add a window](https://colony-recorder.s3.amazonaws.com/files/2026-04-01/5ae8c0b3-2d03-41ad-a63c-47b20c350dfe/ascreenshot_1a7dc6c7d65544f38fd8a65604674f22_text_export.jpeg)

다른 기간에 대한 두 번째 행을 추가합니다. 예: daily $10 위에 monthly $100 추가.

![Step 3 - add second window](https://colony-recorder.s3.amazonaws.com/files/2026-04-01/cbded3a7-1086-4e20-8f0f-de154b76146c/ascreenshot_c51c18752c3b4f8b976d28799b2638b6_text_export.jpeg)

각 window는 input 아래에 reset schedule을 표시하므로 spend가 언제 reset되는지 항상 명확히 알 수 있습니다.

![Step 4 - reset hints](https://colony-recorder.s3.amazonaws.com/files/2026-04-01/8754f121-1640-4892-9dd0-fd4a870418bf/ascreenshot_8079eb0df2194e8f99e5258ba4b3c082_text_export.jpeg)


### ✨ Virtual Key(Model별) {#virtual-key-model-specific}

key에 model별 budget을 적용합니다. 예:
- `key = "sk-12345"`에서 `gpt-4o` budget은 기간 `1d` 동안 $0.0000001입니다.
- `key = "sk-12345"`에서 `gpt-4o-mini` budget은 기간 `30d` 동안 $10입니다.

:::info

✨ 이 기능은 엔터프라이즈 전용입니다. [여기에서 엔터프라이즈 시작하기](https://www.litellm.ai/#pricing)

:::


`model_max_budget` spec은 **[`Dict[str, GenericBudgetInfo]`](#genericbudgetinfo)**입니다.

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "model_max_budget": {"gpt-4o": {"budget_limit": "0.0000001", "time_period": "1d"}}
}'
```


#### test request 실행

Virtual Key에서 `gpt-4o` budget을 넘기 때문에 첫 번째 request는 성공하고 두 번째 request는 실패해야 합니다.

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="성공하는 호출 " value = "allowed">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <sk-generated-key>' \
--data ' {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": "testing request"
        }
      ]
    }
'
```

</TabItem>
<TabItem label="실패하는 호출" value = "not-allowed">

Virtual Key에서 `model=gpt-4o` budget을 넘기므로 이 request는 실패해야 합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <sk-generated-key>' \
--data ' {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": "testing request"
        }
      ]
    }
'
```

실패 시 예상 response

```json
{
    "error": {
        "message": "LiteLLM Virtual Key: 9769f3f6768a199f76cc29xxxx, key_alias: None, exceeded budget for model=gpt-4o",
        "type": "budget_exceeded",
        "param": null,
        "code": "400"
    }
}
```

</TabItem>
</Tabs>


### Agents

LiteLLM의 [Agent Gateway](../a2a.md)에 등록된 agent에 budget과 rate limit을 설정합니다. 다음을 제어할 수 있습니다.
- **agent별 rate limit**: agent 자체의 `tpm_limit` 및 `rpm_limit`
- **session별 rate limit**: session마다 적용되는 `session_tpm_limit` 및 `session_rpm_limit`
- **session별 iteration cap**: agent `litellm_params`의 `max_iterations`
- **session별 budget cap**: agent `litellm_params`의 `max_budget_per_session`

<Tabs>
<TabItem value="agent-rate-limits" label="Agent Rate Limit">

모든 session 전체의 총 throughput을 제한하려면 agent에 `tpm_limit` 및 `rpm_limit`을 설정하세요.

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "tpm_limit": 100000,
    "rpm_limit": 100
  }'
```

</TabItem>
<TabItem value="session-rate-limits" label="Session Rate Limit">

개별 session별 throughput을 제한하려면 `session_tpm_limit` 및 `session_rpm_limit`을 설정하세요.

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "session_tpm_limit": 50000,
    "session_rpm_limit": 50
  }'
```

</TabItem>
<TabItem value="session-budgets" label="Session Budget">

개별 session을 제한하려면 agent `litellm_params`에 `max_iterations` 및 `max_budget_per_session`을 설정하세요. LiteLLM이 session별 call을 추적할 수 있도록 `require_trace_id_on_calls_by_agent`가 필요합니다.

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true,
      "max_iterations": 25,
      "max_budget_per_session": 5.00
    }
  }'
```

session이 limit을 초과하면 request는 **429 Too Many Requests** response를 받습니다.

전체 세부 정보는 [Agent Iteration Budgets](../a2a_iteration_budgets) guide를 참고하세요.

</TabItem>
</Tabs>

:::info

기존 agent의 rate limit은 `PATCH /v1/agents/{agent_id}`로도 업데이트할 수 있습니다.

```bash
curl -X PATCH 'http://localhost:4000/v1/agents/<agent_id>' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "tpm_limit": 200000,
    "rpm_limit": 200,
    "session_tpm_limit": 50000,
    "session_rpm_limit": 50
  }'
```

:::


### Customers

모든 user마다 key를 만들 필요 없이 `/chat/completions`에 전달되는 `user`에 budget을 적용할 때 사용합니다.

**1단계. config.yaml 수정**
`litellm.max_end_user_budget`를 정의합니다.
```yaml
general_settings:
  master_key: sk-1234

litellm_settings:
  max_end_user_budget: 0.0001 # budget for 'user' passed to /chat/completions
```

2. /chat/completions call 실행, 'user' 전달 - 첫 call은 동작합니다.
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-zi5onDRdHGD24v0Zdn7VBA' \
        --data ' {
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [
            {
            "role": "user",
            "content": "what time is it"
            }
        ]
        }'
```

3. /chat/completions call 실행, 'user' 전달 - 'ishaan3'가 budget을 초과했으므로 call이 실패합니다.
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Bearer sk-zi5onDRdHGD24v0Zdn7VBA' \
        --data ' {
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [
            {
            "role": "user",
            "content": "what time is it"
            }
        ]
        }'
```

오류
```shell
{"error":{"message":"Budget has been exceeded: User ishaan3 has exceeded their budget. Current spend: 0.0008869999999999999; Max Budget: 0.0001","type":"auth_error","param":"None","code":401}}%                
```

## Budget Reset

key/internal user/team/customer 전반의 budget을 reset합니다.

`budget_duration`: 지정한 duration이 끝나면 budget이 reset됩니다. 설정하지 않으면 budget은 reset되지 않습니다. duration은 seconds("30s"), minutes("30m"), hours("30h"), days("30d")로 설정할 수 있습니다.

<Tabs>
<TabItem value="users" label="Internal User">

```bash
curl 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```
</TabItem>
<TabItem value="keys" label="Keys">

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```

</TabItem>
<TabItem value="teams" label="Teams">

```bash
curl 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "max_budget": 10,
  "budget_duration": "30s", # 👈 KEY CHANGE
}'
```
</TabItem>
</Tabs>

**참고:** 기본적으로 server는 DB call을 최소화하기 위해 10분마다 reset 여부를 확인합니다.

이를 변경하려면 `proxy_budget_rescheduler_min_time`과 `proxy_budget_rescheduler_max_time`을 설정하세요.

예: 1초마다 확인
```yaml
general_settings: 
  proxy_budget_rescheduler_min_time: 1
  proxy_budget_rescheduler_max_time: 1
```

## Rate Limit 설정

다음을 설정할 수 있습니다.
- tpm limit(tokens per minute, 분당 토큰 수)
- rpm limit(requests per minute, 분당 요청 수)
- 최대 병렬 request 수
- 특정 key 또는 team의 model별 rpm / tpm limit

### TPM rate limit 유형 {#tpm-rate-limit-type-input-output-total}

기본적으로 TPM(tokens per minute) rate limit은 **전체 token**(input + output)을 계산합니다. 대신 input token만 또는 output token만 계산하도록 설정할 수 있습니다.

`config.yaml`에서 `token_rate_limit_type`을 설정합니다.

```yaml
general_settings:
  master_key: sk-1234
  token_rate_limit_type: "output"  # Options: "input", "output", "total" (default)
```

| 값 | 설명 |
|-------|-------------|
| `total` | 전체 token(prompt + completion)을 계산합니다. **기본 동작입니다.** |
| `input` | prompt/input token만 계산합니다. |
| `output` | completion/output token만 계산합니다. |

이 설정은 모든 TPM rate limit 검사(keys, users, teams 등)에 전역으로 적용됩니다.


<Tabs>
<TabItem value="per-team" label="Team별">

team의 여러 key에 걸쳐 rate limit을 유지하려면 `/team/new` 또는 `/team/update`를 사용합니다.


```shell
curl --location 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"team_id": "my-prod-team", "max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

[**Swagger 보기**](https://litellm-api.up.railway.app/#/team%20management/new_team_team_new_post)

**예상 response**

```json
{
    "key": "sk-sA7VDkyhlQ7m8Gt77Mbt3Q",
    "expires": "2024-01-19T01:21:12.816168",
    "team_id": "my-prod-team",
}
```

</TabItem>
<TabItem value="per-team-model" label="Team별 Model별">

**team의 model별 rate limit 설정**

team에 속한 모든 key에 대해 model별 rate limit을 설정하려면 `model_rpm_limit`과 `model_tpm_limit`을 사용합니다. 이 limit은 team의 모든 key에 적용되며, key level에서 override하지 않는 한 key가 상속합니다.

model 이름을 limit에 매핑하는 dictionary로 `model_rpm_limit`과 `model_tpm_limit`을 지정해 `/team/new` 또는 `/team/update`를 사용합니다.

```shell
curl --location 'http://0.0.0.0:4000/team/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "model_rpm_limit": {"gpt-4": 100, "gpt-3.5-turbo": 200},
  "model_tpm_limit": {"gpt-4": 10000, "gpt-3.5-turbo": 20000}
}'
```

**기존 team에 model별 limit 적용:**

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "model_rpm_limit": {"gpt-4": 100, "gpt-3.5-turbo": 200},
  "model_tpm_limit": {"gpt-4": 10000, "gpt-3.5-turbo": 20000}
}'
```

**대안: metadata 사용**

`metadata` field를 통해 model별 limit을 전달할 수도 있습니다.

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
  "team_id": "my-prod-team",
  "metadata": {
    "model_rpm_limit": {"gpt-4": 100, "gpt-3.5-turbo": 200},
    "model_tpm_limit": {"gpt-4": 10000, "gpt-3.5-turbo": 20000}
  }
}'
```

**해석 순서:** key가 team에 속하면 rate limit은 **Key metadata > Key model_max_budget > Team metadata** 순서로 해석됩니다. key는 자체 `model_rpm_limit` 또는 `model_tpm_limit`으로 team level의 model별 limit을 override할 수 있습니다.

**검증:** `/chat/completions` request를 실행하고 response header `x-litellm-key-remaining-requests-{model}` 및 `x-litellm-key-remaining-tokens-{model}`에서 model별 limit을 확인합니다.

[**Swagger 보기**](https://litellm-api.up.railway.app/#/team%20management/new_team_team_new_post)

</TabItem>
<TabItem value="per-user" label="Internal User별">

internal user의 여러 key에 걸쳐 rate limit을 유지하려면 `/user/new` 또는 `/user/update`를 사용합니다.


```shell
curl --location 'http://0.0.0.0:4000/user/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"user_id": "krrish@berri.ai", "max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

[**Swagger 보기**](https://litellm-api.up.railway.app/#/user%20management/new_user_user_new_post)

**예상 response**

```json
{
    "key": "sk-sA7VDkyhlQ7m8Gt77Mbt3Q",
    "expires": "2024-01-19T01:21:12.816168",
    "user_id": "krrish@berri.ai",
}
```

</TabItem>
<TabItem value="per-key" label="Key별">

해당 key에만 적용하려면 `/key/generate`를 사용합니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"max_parallel_requests": 10, "tpm_limit": 20, "rpm_limit": 4}' 
```

**예상 response**

```json
{
    "key": "sk-ulGNRXWtv7M0lFnnsQk0wQ",
    "expires": "2024-01-18T20:48:44.297973",
    "user_id": "78c2c8fc-c233-43b9-b0c3-eb931da27b84"  // 👈 auto-generated
}
```

</TabItem>
<TabItem value="per-key-model" label="API Key별 Model별">

**api key별 model별 rate limit 설정**

api key마다 model별 rate limit을 설정하려면 `model_rpm_limit`과 `model_tpm_limit`을 설정합니다.

여기서 `gpt-4`는 [litellm config.yaml](configs.md)에 설정된 `model_name`입니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"model_rpm_limit": {"gpt-4": 2}, "model_tpm_limit": {"gpt-4":}}' 
```

**예상 response**

```json
{
    "key": "sk-ulGNRXWtv7M0lFnnsQk0wQ",
    "expires": "2024-01-18T20:48:44.297973",
}
```

**이 key의 Model Rate Limit이 올바르게 설정되었는지 확인**

**/chat/completions request를 보내 `x-litellm-key-remaining-requests-gpt-4`가 반환되는지 확인**

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ulGNRXWtv7M0lFnnsQk0wQ" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude!ss eho ares"}
    ]
  }'
```


**예상 header**

```shell
x-litellm-key-remaining-requests-gpt-4: 1
x-litellm-key-remaining-tokens-gpt-4: 179
```

이 header는 다음을 의미합니다.

- key=`sk-ulGNRXWtv7M0lFnnsQk0wQ`에서 GPT-4 model에 남은 request 1개
- key=`sk-ulGNRXWtv7M0lFnnsQk0wQ`에서 GPT-4 model에 남은 token 179개

</TabItem>
<TabItem value="per-agent" label="Agent별">

[Agent Gateway](../a2a.md)에 등록된 agent에 rate limit을 설정합니다.

**Agent-level limit**은 모든 session 전체의 총 throughput을 제한합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"agent_name": "my-agent", "agent_card_params": {"name": "my-agent", "description": "My agent", "url": "http://my-agent:8080", "version": "1.0.0"}, "tpm_limit": 100000, "rpm_limit": 100}'
```

**Session-level limit**은 개별 session별 throughput을 제한합니다.

```shell
curl -X POST 'http://0.0.0.0:4000/v1/agents' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{"agent_name": "my-agent", "agent_card_params": {"name": "my-agent", "description": "My agent", "url": "http://my-agent:8080", "version": "1.0.0"}, "session_tpm_limit": 50000, "session_rpm_limit": 50}'
```

`litellm_params`를 통해 session별 **max_iterations**(call count cap)와 **max_budget_per_session**(dollar cap)도 설정할 수 있습니다. 자세한 내용은 [Agent Iteration Budgets](../a2a_iteration_budgets)를 참고하세요.

</TabItem>
<TabItem value="per-end-user" label="Customer용">

:::info 

UI의 'Rate Limits' tab에서 customer용 budget id를 생성할 수도 있습니다.

:::

모든 user마다 key를 만들 필요 없이 `/chat/completions`에 전달되는 `user`의 rate limit을 설정할 때 사용합니다.

#### 1단계. Budget 생성

budget에 `tpm_limit`을 설정합니다. 필요한 경우 `rpm_limit`도 전달할 수 있습니다.

```shell
curl --location 'http://0.0.0.0:4000/budget/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "budget_id" : "free-tier",
    "tpm_limit": 5
}'
```


#### 2단계. Budget이 있는 `Customer` 생성

새 customer를 생성할 때 1단계의 `budget_id="free-tier"`를 사용합니다.

```shell
curl --location 'http://0.0.0.0:4000/customer/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "user_id" : "palantir",
    "budget_id": "free-tier"
}'
```


#### 3단계. `/chat/completions` request에 `user_id` 전달

2단계의 `user_id`를 `user="palantir"`로 전달합니다.

```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "user": "palantir",
    "messages": [
        {
        "role": "user",
        "content": "gm"
        }
    ]
}'
```


</TabItem>
</Tabs>

## 모든 internal user의 기본 budget 설정

key를 발급한 user의 기본 budget을 설정할 때 사용합니다.

user가 [`user_role="internal_user"`](./self_serve.md#available-roles)를 가질 때 적용됩니다(`/user/new` 또는 `/user/update`로 설정).

key에 team_id가 있으면 적용되지 않습니다. 이 경우 team budget이 적용됩니다. [개선 의견을 알려주세요!](https://github.com/BerriAI/litellm/issues)

1. config.yaml에서 max budget을 정의합니다.

```yaml
model_list: 
  - model_name: "gpt-3.5-turbo"
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  max_internal_user_budget: 0 # amount in USD
  internal_user_budget_duration: "1mo" # reset every month
```

2. user용 key를 생성합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 response:

```bash
{
  ...
  "key": "sk-X53RdxnDhzamRwjKXR4IHg"
}
```

3. 테스트합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-X53RdxnDhzamRwjKXR4IHg' \
-d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hey, how's it going?"}]
}'
```

예상 response:

```bash
{
    "error": {
        "message": "ExceededBudget: User=<user_id> over budget. Spend=3.7e-05, Budget=0.0",
        "type": "budget_exceeded",
        "param": null,
        "code": "400"
    }
}
```

### 다중 인스턴스 rate limit {#multi-instance-rate-limiting}


**중요 참고:**
- **Rate limit은 proxy admin user에게 적용되지 않습니다.**
- rate limit을 테스트할 때는 limit이 예상대로 강제되는지 확인할 수 있도록 internal user role(non-admin)을 사용하세요.

변경 사항:
- 현재 request/token을 업데이트할 때 `async_set_cache` 대신 `async_increment`를 사용하도록 변경했습니다.
- 모든 request마다 redis를 호출하지 않도록 in-memory cache를 0.01초마다 redis와 동기화합니다.
- 테스트 결과 이전 구현보다 2배 빠르며, high-traffic(3개 instance에서 100 RPS)에서도 예상 실패 수와 실제 실패 수의 차이를 최대 10 request로 줄였습니다.


## 새 model 접근 권한 부여

model access group을 사용해 user에게 특정 model 접근 권한을 부여하고, 시간이 지나면서 새 model을 추가할 수 있습니다(예: mistral, llama-2 등).

`/key/generate`와 `/user/new`로 설정하는 것의 차이는 무엇인가요? `/user/new`에서 설정하면 해당 user에 대해 생성되는 여러 key에 걸쳐 유지됩니다.

**1단계. config.yaml에서 model과 access group 지정**

```yaml
model_list:
  - model_name: text-embedding-ada-002
    litellm_params:
      model: azure/azure-embedding-model
      api_base: "os.environ/AZURE_API_BASE"
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2023-07-01-preview"
    model_info:
      access_groups: ["beta-models"] # 👈 Model Access Group
```

**2단계. access group이 있는 key 생성**

```bash
curl --location 'http://localhost:4000/user/new' \
-H 'Authorization: Bearer <your-master-key>' \
-H 'Content-Type: application/json' \
-d '{"models": ["beta-models"], # 👈 Model Access Group
			"max_budget": 0}'
```


## 기존 internal user의 새 key 생성

`/key/generate` request에 user_id만 포함하면 됩니다.

```bash
curl --location 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data '{"models": ["azure-models"], "user_id": "krrish@berri.ai"}'
```


## API 사양

### `GenericBudgetInfo`

time period와 limit이 있는 budget 정보를 정의하는 Pydantic model입니다.

```python
class GenericBudgetInfo(BaseModel):
    budget_limit: float  # The maximum budget amount in USD
    time_period: str    # Duration string like "1d", "30d", etc.
```

#### Field:
- `budget_limit` (float): USD 기준 최대 budget 금액
- `time_period` (str): budget의 time period를 지정하는 duration string. 지원 형식:
  - 초: "30s"
  - 분: "30m"
  - 시간: "30h"
  - 일: "30d"

#### 예제:
```json
{
  "budget_limit": "0.0001",
  "time_period": "1d"
}
```
