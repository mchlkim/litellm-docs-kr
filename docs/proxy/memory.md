import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 메모리 관리 {#memory-management}

사용자 선호도와 피드백을 저장하여 LLM이 세션이 바뀌어도 이를 기억하게 할 수 있습니다. 사용자와 팀 단위로 범위가 지정되며, 기본 제공 액세스 제어가 적용됩니다.

**필수 조건:** PostgreSQL에 연결된 LiteLLM `v1.83.10+`가 필요합니다. 설정 변경은 필요하지 않습니다.

### 생성 {#create}

<Tabs>
<TabItem value="curl" label="curl">

```shell
curl -X POST "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"version": 1}
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:4000",
    headers={"Authorization": "Bearer sk-1234"},
)

client.post("/v1/memory", json={
    "key": "user:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"version": 1},
})
```

</TabItem>
</Tabs>

### 읽기 {#read}

```shell
curl "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer sk-1234"
```

### 업데이트 {#update}

```shell
curl -X PUT "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{"value": "Prefers concise responses. Timezone: EST."}'
```

### 목록 {#list}

```shell
# All entries
curl "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer sk-1234"

# By prefix
curl "http://localhost:4000/v1/memory?key_prefix=user:" \
  -H "Authorization: Bearer sk-1234"
```

### 삭제 {#delete}

```shell
curl -X DELETE "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer sk-1234"
```

## 액세스 제어 {#access-control}

범위 지정은 API 키를 기준으로 자동 처리됩니다.

| 역할 | 읽기 | 쓰기 |
|------|-------|--------|
| 사용자 | 본인 항목 + 팀 항목 | 본인 항목만 |
| 팀 관리자 | 본인 항목 + 팀 항목 | 본인 항목 + 팀 항목 |
| Proxy 관리자 | 전체 | 전체 |

## 키 이름 지정 {#key-naming}

키는 전역적으로 고유합니다. 접두사를 사용해 네임스페이스를 나누고 쿼리하세요.

```
user:preferences           → per-user settings
team:playbook:onboarding   → shared team resources
agent:memory:scratchpad    → agent working memory
```

## 예제: Slack bot의 사용자별 메모리 {#example-per-user-memory-in-a-slack-bot}

각 사용자의 선호도가 분리되도록 Slack 워크스페이스와 사용자별로 메모리를 나누세요.

**키 형식:** `slack:{team_id}:{user_id}`

```python
import httpx

LITELLM_BASE = "http://localhost:4000"
LITELLM_KEY = "sk-1234"

def memory_key(team_id: str, user_id: str) -> str:
    return f"slack:{team_id}:{user_id}"

async def get_preferences(team_id: str, user_id: str) -> str:
    """Read saved preferences. Returns "" if none exist."""
    key = memory_key(team_id, user_id)
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{LITELLM_BASE}/v1/memory/{key}",
            headers={"Authorization": f"Bearer {LITELLM_KEY}"},
        )
    if r.status_code == 404:
        return ""
    return r.json().get("value", "")

async def save_preference(team_id: str, user_id: str, note: str):
    """Append a preference. PUT upserts — creates or updates."""
    key = memory_key(team_id, user_id)
    existing = await get_preferences(team_id, user_id)

    # Store as bullet list
    bullets = [b for b in existing.split("\n") if b.strip()]
    bullets.append(f"- {note}")
    
    async with httpx.AsyncClient() as client:
        await client.put(
            f"{LITELLM_BASE}/v1/memory/{key}",
            headers={"Authorization": f"Bearer {LITELLM_KEY}"},
            json={"value": "\n".join(bullets)},
        )
```

**각 턴마다 시스템 프롬프트에 주입하세요.**

```python
prefs = await get_preferences(team_id, user_id)

messages = [
    {"role": "system", "content": f"""You are a helpful assistant.

SAVED USER PREFERENCES:
{prefs}

Follow these unless the current message contradicts them."""},
    {"role": "user", "content": user_message},
]
```

**워크스페이스의 모든 선호도를 쿼리하세요.**

```shell
curl "http://localhost:4000/v1/memory?key_prefix=slack:T024BE7LD:" \
  -H "Authorization: Bearer sk-1234"
```

## 메타데이터 {#metadata}

항목에 원하는 JSON을 연결할 수 있습니다.

```json
{
  "key": "agent:findings",
  "value": "Q1 API usage up 15%...",
  "metadata": {"tags": ["research"], "confidence": 0.92}
}
```

## API 참조 {#api-reference}

전체 요청/응답 스키마, 파라미터, 오류 코드는 [/memory endpoint reference](/docs/memory_management)를 참고하세요.
