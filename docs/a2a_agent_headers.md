import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# A2A Agent 인증 Headers

client에서 backend A2A agent로 인증 credential(Bearer token, API key 등)을 전달합니다.

## 개요

LiteLLM이 backend A2A agent로 request를 proxy할 때, agent 자체 인증 header가 필요할 수 있습니다. 이를 제공하는 방법은 세 가지입니다.

| 방식 | 설정 주체 | 동작 방식 |
|---|---|---|
| **Static headers** | Admin(UI / API) | client request와 관계없이 항상 전송 |
| **Forward client headers** | Admin(UI / API) | client request에서 추출해 전달할 header 이름 |
| **Convention-based** | Client(admin 설정 없음) | client가 `x-a2a-{agent_name}-{header}`를 보내면 자동 routing |

세 가지 방법은 함께 사용할 수 있습니다. key가 충돌하면 **Static headers가 항상 우선**합니다.

---

## 방법 1 - Static Headers

Admin이 설정하며 backend agent로 항상 전송되는 header입니다. client가 보거나 override해서는 안 되는 `server-to-server` token 또는 내부 credential에 사용하세요.

<Tabs>
<TabItem value="ui" label="UI">

1. LiteLLM dashboard에서 **Agents**로 이동합니다.
2. agent를 생성하거나 편집합니다.
3. Open the **인증 Headers** panel.
4. **Static Headers**에서 **Add Static Header**를 클릭하고 header 이름과 값을 입력합니다.

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "static_headers": {
      "Authorization": "Bearer internal-server-token",
      "X-Internal-Service": "litellm-proxy"
    }
  }'
```

기존 agent를 업데이트하려면 다음을 사용합니다.

```bash
curl -X PATCH http://localhost:4000/v1/agents/{agent_id} \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "static_headers": {
      "Authorization": "Bearer new-token"
    }
  }'
```

</TabItem>
</Tabs>

**Client call - 별도 header 불필요:**

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0", "id": "1", "method": "message/send",
    "params": { "message": { "role": "user", "parts": [{"kind": "text", "text": "Hello"}], "messageId": "msg-1" } }
  }'
```

backend agent는 client가 값을 알지 못한 상태로 `Authorization: Bearer internal-server-token`을 받습니다.

---

## 방법 2 - Forward Client Headers

Admin은 header **이름** 목록을 지정합니다. client가 해당 header를 포함해 request를 보내면 LiteLLM이 값을 추출해 backend agent로 전달합니다. client는 값을 제어하고, admin은 어떤 header를 전달할 수 있는지 제어합니다.

<Tabs>
<TabItem value="ui" label="UI">

1. LiteLLM dashboard에서 **Agents**로 이동합니다.
2. agent를 생성하거나 편집합니다.
3. Open the **인증 Headers** panel.
4. **Forward Client Headers**에서 header 이름을 입력하고 **Enter**를 누릅니다(예: `x-api-key`, `Authorization`).

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "extra_headers": ["x-api-key", "x-user-token"]
  }'
```

</TabItem>
</Tabs>

**Client call - 전달할 header 포함:**

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-api-key: user-secret-value" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

backend agent는 `x-api-key: user-secret-value`를 받습니다.

:::note
Header 이름 매칭은 **대소문자를 구분하지 않습니다**. client가 `X-API-Key`를 보내고 `extra_headers`에 `x-api-key`가 있으면 서로 일치합니다.
:::

---

## 방법 3 - Convention-Based Forwarding

client는 naming convention을 사용해 admin 사전 설정 없이 특정 agent로 header를 전달할 수 있습니다.

```
x-a2a-{agent_name_or_id}-{header_name}: value
```

LiteLLM은 이러한 header를 자동으로 parse하고 일치하는 agent에만 route합니다.

**예제:**

| client가 보낸 header | Agent name/ID | 전달되는 형태 |
|---|---|---|
| `x-a2a-my-agent-authorization: Bearer tok` | `my-agent` | `authorization: Bearer tok` |
| `x-a2a-my-agent-x-api-key: secret` | `my-agent` | `x-api-key: secret` |
| `x-a2a-abc123-authorization: Bearer tok` | agent ID `abc123` | `authorization: Bearer tok` |

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-a2a-my-agent-authorization: Bearer agent-specific-token" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

같은 request에 포함된 `x-a2a-other-agent-authorization` header는 `my-agent`로 **전달되지 않으며**, 조용히 무시됩니다.

:::tip agent name과 agent ID 모두 매칭
사람이 읽기 쉬운 이름(예: `my-agent`)과 UUID(예: `abc123-...`)가 모두 유효합니다. client에 편한 값을 사용하세요.
:::

---

## 병합 우선순위

여러 방법이 같은 header 이름을 제공하면 **static headers가 우선**합니다.

```
dynamic (forwarded/convention)  →  merged  ←  static (overlays, wins)
```

예제:

| Source | `Authorization` 값 |
|---|---|
| client 전송(`extra_headers` 또는 convention 사용) | `Bearer client-token` |
| Admin이 설정한 `static_headers` | `Bearer server-token` |
| **backend agent가 받는 값** | **`Bearer server-token`** |

이를 통해 admin이 제어하는 credential이 client request에 의해 override되지 않도록 보장합니다.

---

## 세 가지 방법 함께 사용하기

```bash
# Register agent with static + forwarded headers
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "static_headers": {
      "X-Internal-Token": "secret123"
    },
    "extra_headers": ["x-user-id"]
  }'

# Client call using all three mechanisms
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-user-id: user-42" \
  -H "x-a2a-my-agent-x-request-id: req-abc" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

backend agent는 다음을 받습니다.

```
X-Internal-Token: secret123          ← static header (always)
x-user-id: user-42                   ← forwarded (in extra_headers)
x-request-id: req-abc                ← convention-based (x-a2a-my-agent-*)
X-LiteLLM-Trace-Id: <uuid>           ← LiteLLM internal
X-LiteLLM-Agent-Id: <agent-id>       ← LiteLLM internal
```

---

## Header 격리

각 agent invocation은 격리된 HTTP connection을 사용합니다. 두 agent가 동시에 실행되고 request를 받더라도 agent A에 설정된 header는 agent B로 **절대 전송되지 않습니다**.

---

## API Reference

### `POST /v1/agents` / `PATCH /v1/agents/{agent_id}`

| Field | Type | 설명 |
|---|---|---|
| `static_headers` | `object` | `{"Header-Name": "value"}` - 항상 전달 |
| `extra_headers` | `string[]` | client request에서 추출해 전달할 header 이름 |

### Agent Response

두 field는 `GET /v1/agents`와 `GET /v1/agents/{agent_id}`에서 반환됩니다.

```json
{
  "agent_id": "...",
  "agent_name": "my-agent",
  "static_headers": { "X-Internal-Token": "secret123" },
  "extra_headers": ["x-user-id"],
  ...
}
```

:::caution
`static_headers` 값은 database에 저장되고 API에서 반환됩니다. 일반 credential처럼 취급하세요. API가 공개적으로 접근 가능하다면 민감한 long-lived token을 여기에 저장하지 마세요. 대신 short-lived token 또는 environment에서 주입되는 secret 사용을 고려하세요.
:::
