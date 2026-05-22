import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 서버 제출

LiteLLM은 MCP 서버의 제출 및 승인 워크플로를 지원합니다. 팀 구성원은 관리자 검토를 위해 MCP 서버를 제출할 수 있으며, 관리자가 승인하거나 거부할 때까지 서버는 `pending_review` 상태로 유지됩니다.

이를 통해 조직은 승인되지 않은 서버를 모든 사용자에게 즉시 노출하지 않고도 팀 구성원에게 셀프서비스 MCP 등록 기능을 제공할 수 있습니다.

:::info 관련 문서
- [MCP 개요](./mcp.md) - MCP 서버 추가 및 관리
- [MCP 권한 관리](./mcp_control.md) - 키, 팀 또는 조직별 MCP 액세스 제어
:::

## 작동 방식

```
팀 구성원이 API로 MCP 서버 제출
        ↓
서버가 "pending_review"로 저장됨(레지스트리에 로드되지 않음)
        ↓
관리자가 Submitted MCPs 탭에서 검토
        ↓
Approve → 서버가 "active"가 되고 레지스트리에 로드됨
Reject  → 서버가 검토 메모와 함께 레지스트리 밖에 유지됨
```

**사전 준비:**
- 프록시 설정에 `store_model_in_db: true`를 설정해야 합니다(MCP 서버를 영구 저장하는 데 필요).
- 제출하는 사용자는 **팀 범위 API 키**를 사용해야 합니다(관리자 키는 이 워크플로를 우회하고 `POST /v1/mcp/server`를 직접 사용합니다).

```yaml title="config.yaml" showLineNumbers
general_settings:
  store_model_in_db: true
```

---

## 사용자: MCP 서버 제출

팀 범위 API 키를 사용하세요. 이 엔드포인트에서는 관리자 키가 거부됩니다. 관리자는 `POST /v1/mcp/server`를 직접 사용해야 합니다.

<Tabs>
<TabItem value="curl" label="curl">

```bash title="검토를 위해 MCP 서버 제출" showLineNumbers
curl -X POST http://localhost:4000/v1/mcp/server/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEAM_API_KEY" \
  -d '{
    "server_name": "github_mcp",
    "url": "https://api.githubcopilot.com/mcp",
    "transport": "sse",
    "description": "GitHub MCP for code search and PR management"
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python title="검토를 위해 MCP 서버 제출" showLineNumbers
import requests

response = requests.post(
    "http://localhost:4000/v1/mcp/server/register",
    headers={
        "Authorization": f"Bearer {team_api_key}",
        "Content-Type": "application/json",
    },
    json={
        "server_name": "github_mcp",
        "url": "https://api.githubcopilot.com/mcp",
        "transport": "sse",
        "description": "GitHub MCP for code search and PR management",
    },
)
print(response.json())
```

</TabItem>
</Tabs>

**응답** - 서버가 `pending_review` 상태로 생성됩니다.

```json
{
  "server_id": "832d6abc-7a5c-457a-a9f6-cfe4ae05f776",
  "server_name": "github_mcp",
  "url": "https://api.githubcopilot.com/mcp",
  "transport": "sse",
  "approval_status": "pending_review",
  "submitted_by": "7fd77c87-207b-4d6c-9d51-b72efb8962dc",
  "submitted_at": "2026-04-29T18:50:34Z"
}
```

:::note
이 서버는 아직 MCP 클라이언트에서 액세스할 수 **없습니다**. 관리자가 승인한 후에만 활성화됩니다.
:::

---

## 관리자: 제출 항목 검토

### UI로 검토

**MCP Servers → Submitted MCPs** 탭으로 이동하세요. 다음을 확인할 수 있습니다.
- 제출 수: Total Submitted, Pending Review, Active, Rejected
- 서버 이름, 설명, URL, transport, 제출 날짜가 포함된 각 제출 카드
- 각 카드의 **Approve** 및 **Reject** 버튼

<Image
  img={require('../static/img/mcp/02_submitted_mcps_tab.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

서버를 **승인**하면 확인 대화 상자가 표시됩니다. **Approve**를 클릭하면 서버가 활성화되고 MCP 레지스트리에 즉시 로드됩니다.

<Image
  img={require('../static/img/mcp/04_approve_dialog.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

승인 후 카드 배지가 **Active**로 변경되고 카운터가 업데이트됩니다.

<Image
  img={require('../static/img/mcp/05_after_approve.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

**거부**를 선택하면 선택 사항인 검토 메모 필드가 포함된 대화 상자가 열립니다. 제출이 거절된 이유를 설명할 때 유용합니다.

<Image
  img={require('../static/img/mcp/03_reject_dialog.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

### API로 검토

관리자 또는 `proxy_admin_viewer` 역할이 필요합니다.

<Tabs>
<TabItem value="list" label="제출 항목 목록">

```bash title="모든 MCP 제출 항목 나열" showLineNumbers
curl http://localhost:4000/v1/mcp/server/submissions \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

응답:

```json
{
  "total": 1,
  "pending_review": 1,
  "active": 0,
  "rejected": 0,
  "items": [
    {
      "server_id": "832d6abc-7a5c-457a-a9f6-cfe4ae05f776",
      "server_name": "github_mcp",
      "approval_status": "pending_review",
      "submitted_by": "7fd77c87-207b-4d6c-9d51-b72efb8962dc",
      "submitted_at": "2026-04-29T18:50:34Z"
    }
  ]
}
```

</TabItem>
<TabItem value="approve" label="승인">

```bash title="제출된 MCP 서버 승인" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server/{server_id}/approve \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

서버 상태가 `active`로 변경되고 MCP 런타임 레지스트리에 즉시 로드됩니다.

</TabItem>
<TabItem value="reject" label="거부">

```bash title="제출된 MCP 서버 거부" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server/{server_id}/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -d '{"review_notes": "This URL is not on the approved vendor list."}'
```

`review_notes`는 선택 사항입니다. 서버는 레지스트리에 포함되지 않은 상태로 유지됩니다.

</TabItem>
</Tabs>

---

## 승인 상태 값

| 상태 | 의미 |
|--------|---------|
| `pending_review` | 제출되었으며 관리자 검토를 기다리는 상태입니다. MCP 클라이언트에서 액세스할 수 없습니다. |
| `active` | 승인되었습니다. MCP 레지스트리에 로드되어 클라이언트에서 사용할 수 있습니다. |
| `rejected` | 관리자가 거부했습니다. 액세스할 수 없습니다. `review_notes`가 포함될 수 있습니다. |

---

## FAQ

**관리자가 거부된 서버를 다시 승인할 수 있나요?**

예. `PUT /v1/mcp/server/{id}/approve`를 호출하세요. 이 엔드포인트는 `pending_review` 및 `rejected` 상태의 서버를 모두 허용합니다.

**이전에 활성 상태였던 서버가 거부되면 어떻게 되나요?**

런타임 레지스트리에서 즉시 제거되며, 클라이언트는 더 이상 해당 도구를 볼 수 없습니다.

**제출 기능을 활성화하려면 특별한 설정 플래그가 필요한가요?**

아니요. `store_model_in_db: true`가 설정되어 있으면 제출 엔드포인트는 기본적으로 사용할 수 있습니다. 추가 기능 플래그는 필요하지 않습니다.
