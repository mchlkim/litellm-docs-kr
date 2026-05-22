# /containers

격리된 환경에서 코드를 실행하기 위한 OpenAI code interpreter 컨테이너(세션)를 관리합니다.

:::tip
Code Interpreter 사용 방법을 찾고 있다면 [Code Interpreter 가이드](/litellm-docs-kr/docs/guides/code_interpreter)를 확인하세요.
:::

| 기능 | 지원 여부 | 
|---------|-----------|
| 비용 추적 | ✅ |
| 로깅 | ✅ (전체 요청/응답 로깅) |
| 로드 밸런싱 | ✅ |
| Proxy Server 지원 | ✅ 가상 키와 전체 프록시 통합 |
| 지출 관리 | ✅ 예산 추적 및 rate limiting |
| 지원 프로바이더 | `openai`|

:::tip

컨테이너는 code interpreter 세션을 위한 격리 실행 환경을 제공합니다. 컨테이너를 생성, 나열, 조회, 삭제할 수 있습니다.

:::

## **LiteLLM Python SDK 사용법**

### 빠른 시작

**컨테이너 생성**

```python
import litellm
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

container = litellm.create_container(
    name="My Code Interpreter Container",
    custom_llm_provider="openai",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    }
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
```

### Async 사용법

```python
from litellm import acreate_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

container = await acreate_container(
    name="My Code Interpreter Container",
    custom_llm_provider="openai",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    }
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
```

### 컨테이너 목록 조회 {#list-containers}

```python
from litellm import list_containers
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

containers = list_containers(
    custom_llm_provider="openai",
    limit=20,
    order="desc"
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

**Async 사용법:**

```python
from litellm import alist_containers

containers = await alist_containers(
    custom_llm_provider="openai",
    limit=20,
    order="desc"
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

### 컨테이너 조회 {#retrieve-a-container}

```python
from litellm import retrieve_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

container = retrieve_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Created: {container.created_at}")
```

**Async 사용법:**

```python
from litellm import aretrieve_container

container = await aretrieve_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Created: {container.created_at}")
```

### 컨테이너 삭제 {#delete-a-container}

```python
from litellm import delete_container
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

result = delete_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

**Async 사용법:**

```python
from litellm import adelete_container

result = await adelete_container(
    container_id="cntr_123...",
    custom_llm_provider="openai"
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

## **LiteLLM Proxy 사용법**

LiteLLM은 code interpreter 세션 관리를 위해 OpenAI API 호환 컨테이너 엔드포인트를 제공합니다.

- `/v1/containers` - 컨테이너 생성 및 목록 조회
- `/v1/containers/{container_id}` - 컨테이너 조회 및 삭제

**설정**

```bash
$ export OPENAI_API_KEY="sk-..."

$ litellm

# RUNNING on http://0.0.0.0:4000
```

**커스텀 공급자 지정**

커스텀 LLM 공급자는 여러 방식으로 지정할 수 있습니다(우선순위 순서).
1. 헤더: `-H "custom-llm-provider: openai"`
2. 쿼리 매개변수: `?custom_llm_provider=openai`
3. 요청 본문: `{"custom_llm_provider": "openai", ...}`
4. 지정하지 않으면 기본값은 `"openai"`입니다.

**컨테이너 생성**

```bash
# Default provider (openai)
curl -X POST "http://localhost:4000/v1/containers" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container",
        "expires_after": {
            "anchor": "last_active_at",
            "minutes": 20
        }
    }'
```

```bash
# Via header
curl -X POST "http://localhost:4000/v1/containers" \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: openai" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container"
    }'
```

```bash
# Via query parameter
curl -X POST "http://localhost:4000/v1/containers?custom_llm_provider=openai" \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My Container"
    }'
```

**컨테이너 목록 조회**

```bash
curl "http://localhost:4000/v1/containers?limit=20&order=desc" \
    -H "Authorization: Bearer sk-1234"
```

**컨테이너 조회**

```bash
curl "http://localhost:4000/v1/containers/cntr_123..." \
    -H "Authorization: Bearer sk-1234"
```

**컨테이너 삭제**

```bash
curl -X DELETE "http://localhost:4000/v1/containers/cntr_123..." \
    -H "Authorization: Bearer sk-1234"
```

## **LiteLLM Proxy에서 OpenAI Client 사용** {#using-openai-client-with-litellm-proxy}

표준 OpenAI Python 클라이언트를 사용해 LiteLLM의 컨테이너 엔드포인트와 상호작용할 수 있습니다. 익숙한 인터페이스를 유지하면서 LiteLLM 프록시 기능을 활용할 수 있습니다.

### 설정 {#setup}

먼저 OpenAI 클라이언트가 LiteLLM 프록시를 바라보도록 설정합니다.

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy key
    base_url="http://localhost:4000"  # LiteLLM proxy URL
)
```

### 컨테이너 생성 {#create-a-container}

```python
container = client.containers.create(
    name="test-container",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    },
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container ID: {container.id}")
print(f"Container Name: {container.name}")
print(f"Created at: {container.created_at}")
```

### 컨테이너 목록 조회 {#list-containers-1}

```python
containers = client.containers.list(
    limit=20,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Found {len(containers.data)} containers")
for container in containers.data:
    print(f"  - {container.id}: {container.name}")
```

### 컨테이너 조회 {#retrieve-a-container-1}

```python
container = client.containers.retrieve(
    container_id="cntr_6901d28b3c8881908b702815828a5bde0380b3408aeae8c7",
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container: {container.name}")
print(f"Status: {container.status}")
print(f"Last active: {container.last_active_at}")
```

### 컨테이너 삭제 {#delete-a-container-1}

```python
result = client.containers.delete(
    container_id="cntr_6901d28b3c8881908b702815828a5bde0380b3408aeae8c7",
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Deleted: {result.deleted}")
print(f"Container ID: {result.id}")
```

### 전체 워크플로 예제 {#complete-workflow-example}

전체 컨테이너 관리 워크플로를 보여주는 완성 예제입니다.

```python
from openai import OpenAI

# Initialize client
client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000"
)

# 1. Create a container
print("Creating container...")
container = client.containers.create(
    name="My Code Interpreter Session",
    expires_after={
        "anchor": "last_active_at",
        "minutes": 20
    },
    extra_body={"custom_llm_provider": "openai"}
)

container_id = container.id
print(f"Container created. ID: {container_id}")

# 2. List all containers
print("\nListing containers...")
containers = client.containers.list(
    extra_body={"custom_llm_provider": "openai"}
)

for c in containers.data:
    print(f"  - {c.id}: {c.name} (Status: {c.status})")

# 3. Retrieve specific container
print(f"\nRetrieving container {container_id}...")
retrieved = client.containers.retrieve(
    container_id=container_id,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Container: {retrieved.name}")
print(f"Status: {retrieved.status}")
print(f"Last active: {retrieved.last_active_at}")

# 4. Delete container
print(f"\nDeleting container {container_id}...")
result = client.containers.delete(
    container_id=container_id,
    extra_body={"custom_llm_provider": "openai"}
)

print(f"Deleted: {result.deleted}")
```

## 컨테이너 매개변수 {#container-parameters}

### 컨테이너 생성 매개변수 {#create-container-parameters}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `name` | string | 예 | 컨테이너 이름 |
| `expires_after` | object | 아니요 | 컨테이너 만료 설정 |
| `expires_after.anchor` | string | 아니요 | 만료 기준점(예: `"last_active_at"`) |
| `expires_after.minutes` | integer | 아니요 | 기준점부터 만료까지의 분 단위 시간 |
| `file_ids` | array | 아니요 | 컨테이너에 포함할 파일 ID 목록 |
| `custom_llm_provider` | string | 아니요 | 사용할 LLM 공급자(기본값: `"openai"`) |

### 컨테이너 목록 조회 매개변수 {#list-container-parameters}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `after` | string | 아니요 | 페이지네이션 커서 |
| `limit` | integer | 아니요 | 반환할 항목 수(1-100, 기본값: 20) |
| `order` | string | 아니요 | 정렬 순서: `"asc"` 또는 `"desc"`(기본값: `"desc"`) |
| `custom_llm_provider` | string | 아니요 | 사용할 LLM 공급자(기본값: `"openai"`) |

### 컨테이너 조회/삭제 매개변수 {#retrievedelete-container-parameters}

| 매개변수 | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `container_id` | string | 예 | 조회/삭제할 컨테이너 ID |
| `custom_llm_provider` | string | 아니요 | 사용할 LLM 공급자(기본값: `"openai"`) |

## 응답 객체 {#response-objects}

### ContainerObject

```json
{
  "id": "cntr_123...",
  "object": "container",
  "created_at": 1234567890,
  "name": "My Container",
  "status": "active",
  "last_active_at": 1234567890,
  "expires_at": 1234569090,
  "file_ids": []
}
```

### `ContainerListResponse`

```json
{
  "object": "list",
  "data": [
    {
      "id": "cntr_123...",
      "object": "container",
      "created_at": 1234567890,
      "name": "My Container",
      "status": "active"
    }
  ],
  "first_id": "cntr_123...",
  "last_id": "cntr_456...",
  "has_more": false
}
```

### `DeleteContainerResult`

```json
{
  "id": "cntr_123...",
  "object": "container.deleted",
  "deleted": true
}
```

## **지원 프로바이더**

| Provider    | 지원 상태 | 참고 |
|-------------|----------------|-------|
| OpenAI      | ✅ 지원   | 모든 컨테이너 작업 전체 지원 |

:::info

현재는 OpenAI만 code interpreter 세션의 컨테이너 관리를 지원합니다. 향후 추가 공급자 지원이 추가될 수 있습니다.

:::

## 관련 문서 {#related}

- [Container Files API](/litellm-docs-kr/docs/container_files) - 컨테이너 내부 파일 관리
- [Code Interpreter Guide](/litellm-docs-kr/docs/guides/code_interpreter) - LiteLLM에서 Code Interpreter 사용
