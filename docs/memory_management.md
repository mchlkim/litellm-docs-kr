import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /memory

LiteLLM 프록시에서 사용자/팀 범위의 메모리 항목을 저장하고 조회하는 CRUD 엔드포인트입니다. 대화 컨텍스트, 에이전트 메모리, 팀 플레이북 또는 사용자와 팀에 연결된 임의의 키-값 데이터를 영속화할 때 사용합니다.

## 개요

| 기능 | 지원 | 참고 |
|---------|-----------|-------|
| 메모리 생성 | ✅ | `POST /v1/memory` |
| 메모리 목록 조회 | ✅ | 선택적 필터링을 지원하는 `GET /v1/memory` |
| 키로 메모리 조회 | ✅ | `GET /v1/memory/{key}` |
| 메모리 upsert | ✅ | `PUT /v1/memory/{key}` |
| 메모리 삭제 | ✅ | `DELETE /v1/memory/{key}` |
| 사용자 범위 접근 | ✅ | `user_id` 범위에 속한 항목 |
| 팀 범위 접근 | ✅ | `team_id` 범위에 속한 항목 |
| JSON 메타데이터 | ✅ | 항목별 임의 JSON 메타데이터 |
| 페이지네이션 | ✅ | 설정 가능한 페이지 크기의 페이지 기반 조회 |
| 키 접두사 필터링 | ✅ | Redis 스타일 네임스페이스 스캔 |
| 감사 추적 | ✅ | 타임스탬프가 포함된 `created_by`, `updated_by` |
| 지원 LiteLLM 버전 | `v1.83.10+` | |

## 사전 준비

- **PostgreSQL** 데이터베이스가 연결된 상태로 실행 중인 LiteLLM Proxy
- 데이터베이스 마이그레이션 적용 완료(`LiteLLM_MemoryTable`은 자동 생성됨)
- 인증에 사용할 유효한 API 키

추가 `config.yaml` 항목은 필요하지 않습니다. 데이터베이스가 연결된 상태로 프록시가 시작되면 엔드포인트가 자동으로 제공됩니다.

## 빠른 시작

### 메모리 항목 생성

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Create memory"
curl -X POST "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:123:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"tags": ["preferences", "user-settings"]}
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Create memory"
import httpx

client = httpx.Client(
    base_url="http://localhost:4000",
    headers={"Authorization": "Bearer sk-1234"},
)

response = client.post("/v1/memory", json={
    "key": "user:123:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"tags": ["preferences", "user-settings"]},
})
print(response.json())
```

</TabItem>
</Tabs>

**응답:**

```json
{
  "memory_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "key": "user:123:preferences",
  "value": "Prefers concise responses. Timezone: PST.",
  "metadata": {"tags": ["preferences", "user-settings"]},
  "user_id": "user-123",
  "team_id": "team-abc",
  "created_at": "2025-04-21T12:00:00Z",
  "created_by": "user-123",
  "updated_at": "2025-04-21T12:00:00Z",
  "updated_by": "user-123"
}
```

### 메모리 목록 조회

<Tabs>
<TabItem value="curl" label="curl">

```shell title="List all memories"
curl "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer sk-1234"
```

```shell title="Filter by key prefix"
curl "http://localhost:4000/v1/memory?key_prefix=user:123:" \
  -H "Authorization: Bearer sk-1234"
```

```shell title="Paginate results"
curl "http://localhost:4000/v1/memory?page=2&page_size=10" \
  -H "Authorization: Bearer sk-1234"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="List memories"
# List all
response = client.get("/v1/memory")
print(response.json())

# Filter by key prefix
response = client.get("/v1/memory", params={"key_prefix": "user:123:"})
print(response.json())

# Paginate
response = client.get("/v1/memory", params={"page": 2, "page_size": 10})
print(response.json())
```

</TabItem>
</Tabs>

**응답:**

```json
{
  "memories": [
    {
      "memory_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "key": "user:123:preferences",
      "value": "Prefers concise responses. Timezone: PST.",
      "metadata": {"tags": ["preferences", "user-settings"]},
      "user_id": "user-123",
      "team_id": "team-abc",
      "created_at": "2025-04-21T12:00:00Z",
      "created_by": "user-123",
      "updated_at": "2025-04-21T12:00:00Z",
      "updated_by": "user-123"
    }
  ],
  "total": 1
}
```

### 키로 메모리 조회

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Get memory by key"
curl "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer sk-1234"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Get memory by key"
response = client.get("/v1/memory/user:123:preferences")
print(response.json())
```

</TabItem>
</Tabs>

### 메모리 업데이트(Upsert)

키가 있으면 업데이트하고, 없으면 새 항목을 생성합니다.

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Upsert memory"
curl -X PUT "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Prefers concise responses. Timezone: EST. Language: English.",
    "metadata": {"tags": ["preferences", "user-settings"], "version": 2}
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Upsert memory"
response = client.put("/v1/memory/user:123:preferences", json={
    "value": "Prefers concise responses. Timezone: EST. Language: English.",
    "metadata": {"tags": ["preferences", "user-settings"], "version": 2},
})
print(response.json())
```

</TabItem>
</Tabs>

### 메모리 삭제

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Delete memory"
curl -X DELETE "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer sk-1234"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Delete memory"
response = client.delete("/v1/memory/user:123:preferences")
print(response.json())
```

</TabItem>
</Tabs>

**응답:**

```json
{
  "key": "user:123:preferences",
  "deleted": true
}
```

## API 레퍼런스

### POST `/v1/memory`

새 메모리 항목을 생성합니다.

**요청 본문:**

| 파라미터 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `key` | string | ✅ | 전역 고유 키입니다. 네임스페이스가 포함된 키를 사용하세요(예: `user:123:notes`). |
| `value` | string | ✅ | 메모리 내용입니다. 일반적으로 markdown 또는 일반 텍스트입니다. |
| `metadata` | any (JSON) | ❌ | 선택적 JSON 메타데이터입니다(딕셔너리, 목록, 스칼라). |
| `user_id` | string | ❌ | 사용자 범위입니다. 기본값은 호출자의 `user_id`입니다. 관리자만 재정의할 수 있습니다. |
| `team_id` | string | ❌ | 팀 범위입니다. 기본값은 호출자의 `team_id`입니다. 관리자만 재정의할 수 있습니다. |

**응답:** `201` — 생성된 `LiteLLM_MemoryRow`를 반환합니다.

---

### GET `/v1/memory`

호출자에게 보이는 메모리 항목 목록을 조회합니다.

**쿼리 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `key` | string | — | 정확히 일치하는 키로 필터링합니다. |
| `key_prefix` | string | — | 키 접두사로 필터링합니다(예: `user:123:`). `key`보다 우선합니다. |
| `page` | int | 1 | 페이지 번호입니다(1부터 시작). |
| `page_size` | int | 50 | 페이지당 항목 수입니다(최대 500). |

**응답:** `200` — `memories` 배열과 `total` 개수가 포함된 `MemoryListResponse`를 반환합니다.

---

### GET `/v1/memory/{key}`

키로 단일 메모리 항목을 조회합니다.

**경로 파라미터:**

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `key` | string | 조회할 메모리 키입니다. |

**응답:** `200` — `LiteLLM_MemoryRow`를 반환합니다.

---

### PUT `/v1/memory/{key}`

메모리 항목을 upsert합니다. 키가 없으면 항목을 생성하고, 있으면 업데이트합니다.

**경로 파라미터:**

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `key` | string | 생성하거나 업데이트할 메모리 키입니다. |

**요청 본문:**

| 파라미터 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `value` | string | ✅ (생성 시) | 메모리 내용입니다. 생성할 때는 필수이고, 업데이트할 때는 선택 사항입니다. |
| `metadata` | any (JSON) | ❌ | 업데이트할 메타데이터입니다. 생략하면 기존 값을 유지하고, `null`로 설정하면 지웁니다. |
| `user_id` | string | ❌ | 생성 시에만 사용됩니다. 관리자만 재정의할 수 있습니다. |
| `team_id` | string | ❌ | 생성 시에만 사용됩니다. 관리자만 재정의할 수 있습니다. |

**응답:** `200` — 생성/업데이트된 `LiteLLM_MemoryRow`를 반환합니다.

---

### DELETE `/v1/memory/{key}`

키로 메모리 항목을 삭제합니다.

**경로 파라미터:**

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `key` | string | 삭제할 메모리 키입니다. |

**응답:** `200` — `{"key": "...", "deleted": true}`를 반환합니다.

## 응답 객체

메모리 항목을 반환하는 모든 엔드포인트는 이 스키마를 사용합니다.

```json
{
  "memory_id": "string (UUID)",
  "key": "string",
  "value": "string",
  "metadata": "any (JSON) or null",
  "user_id": "string or null",
  "team_id": "string or null",
  "created_at": "datetime",
  "created_by": "string",
  "updated_at": "datetime",
  "updated_by": "string"
}
```

## 접근 제어

메모리 항목은 `user_id`와 `team_id`로 범위가 지정되며, 역할 기반 조회 권한과 쓰기 권한을 사용합니다.

### 조회 가능 범위(Read)

| 역할 | 볼 수 있는 항목 |
|------|---------|
| **Proxy Admin** | 모든 메모리 항목 |
| **Regular User** | 자신의 `user_id`와 일치하거나 자신의 `team_id`와 일치하는 항목 |

### 쓰기 권한(Update / Delete)

| 시나리오 | 쓸 수 있는 주체 |
|----------|---------------|
| 항목의 `user_id`가 호출자와 일치 | 소유자가 업데이트/삭제 가능 |
| 항목이 팀 범위에만 속함(`user_id` 없음) | 팀 관리자와 조직 관리자만 가능 |
| 모든 항목 | Proxy 관리자 |

:::info

팀 멤버는 팀 범위 항목을 **읽을 수 있지만**, 수정하거나 삭제할 수 있는 주체는 **팀 관리자**뿐입니다. 이를 통해 팀원이 서로의 항목을 덮어쓰는 일을 방지합니다.

:::

### 생성 시 범위 지정

- `user_id`와 `team_id`의 기본값은 호출자의 API 키에서 가져온 ID입니다.
- **Proxy 관리자**는 `user_id` / `team_id`를 재정의해 다른 사용자 또는 팀의 항목을 생성할 수 있습니다.
- 관리자가 아닌 호출자는 `user_id` 또는 `team_id` 중 하나 이상 없이 항목을 생성할 수 없습니다.

## 키 명명 규칙

키는 전역적으로 고유합니다. 네임스페이스가 포함된 키를 사용해 항목을 정리하세요.

```
user:{user_id}:preferences      # User preferences
user:{user_id}:context          # Conversation context
team:{team_id}:playbook         # Team playbook
agent:{agent_id}:memory         # Agent memory
project:{project_id}:config     # Project configuration
```

목록 조회 엔드포인트에서 `key_prefix`를 사용하면 네임스페이스의 모든 항목을 스캔할 수 있습니다.

```shell
# Get all entries for a user
curl "http://localhost:4000/v1/memory?key_prefix=user:123:" \
  -H "Authorization: Bearer sk-1234"
```

## 오류 코드

| 상태 코드 | 의미 |
|-------------|---------|
| `200` | 성공(GET, PUT, DELETE) |
| `201` | 생성됨(POST) |
| `400` | 잘못된 입력(필수 필드 누락, 빈 PUT 본문, 고아 row) |
| `403` | 권한 거부(쓰기 권한 위반, 비관리자의 범위 재정의) |
| `404` | 키를 찾을 수 없거나 호출자에게 보이지 않음 |
| `409` | 생성 시 중복 키 |
| `500` | 내부 서버 오류(데이터베이스 문제) |
