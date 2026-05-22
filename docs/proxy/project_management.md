# ✨ [Beta] 프로젝트 관리

:::info

엔터프라이즈 기능입니다.
[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험판을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

LiteLLM의 프로젝트는 조직 계층에서 팀과 키 사이에 위치하며, 특정 사용 사례나 애플리케이션에 대해 세분화된 액세스 제어와 예산 관리를 제공합니다.

```mermaid
graph TD
    A[Organization] --> B[Team 1]
    A --> C[Team 2]
    B --> D[Project A]
    B --> E[Project B]
    C --> F[Project C]
    D --> G[API Key 1]
    D --> H[API Key 2]
    E --> I[API Key 3]
    F --> J[API Key 4]
    
    style A fill:#e1f5ff
    style B fill:#fff4e6
    style C fill:#fff4e6
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#f3e5f5
    style G fill:#e8f5e9
    style H fill:#e8f5e9
    style I fill:#e8f5e9
    style J fill:#e8f5e9
```

**계층 구조**: `Organizations > Teams > Projects > Keys`

## 빠른 시작

이 안내에서는 프로젝트 생성, API 키 생성, 요청 전송, UI에서 프로젝트 수준 비용 추적 확인 방법을 보여줍니다.

### 1단계: 프로젝트 생성

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/project/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "flight-search-assistant",
    "team_id": "ad898803-c8a3-4f4a-976a-a3c372cffa45",
    "models": ["gpt-4", "gpt-3.5-turbo"],
    "max_budget": 100,
    "metadata": {
        "use_case_id": "SNOW-12345",
        "responsible_ai_id": "RAI-67890"
    }
}' | jq
```

**응답:**
```json
{
  "project_id": "e402a141-725a-4437-bff5-d47459189716",
  "project_alias": "flight-search-assistant",
  "team_id": "ad898803-c8a3-4f4a-976a-a3c372cffa45",
  "models": ["gpt-4", "gpt-3.5-turbo"],
  "max_budget": 100,
  ...
}
```

### 2단계: 프로젝트용 API 키 생성

```bash showLineNumbers
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data-raw '{
    "models": ["gpt-3.5-turbo", "gpt-4"],
    "metadata": {"user": "ishaan@berri.ai"},
    "project_id": "e402a141-725a-4437-bff5-d47459189716"
}' | jq
```

**응답:**
```json
{
  "key": "sk-W8VbscpfuyvHm5TkxRYiXA",
  "key_name": "sk-...YiXA",
  "project_id": "e402a141-725a-4437-bff5-d47459189716",
  ...
}
```

### 3단계: Chat Completions에서 API 키 사용

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-W8VbscpfuyvHm5TkxRYiXA' \
--data '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "What is litellm?"}]
}' | jq
```

### 4단계: UI에서 프로젝트 비용 확인

LiteLLM 관리자 UI의 **로그** 페이지로 이동합니다. 요청 메타데이터에서 추적되는 `user_api_key_project_id`를 확인할 수 있습니다.

![Project 비용 추적](/img/project_spend.png)

위와 같이 비용 로그 메타데이터에는 다음이 포함됩니다.
- `"user_api_key_project_id": "e402a141-725a-4437-bff5-d47459189716"` - 요청을 프로젝트에 연결합니다.
- 모든 비용과 토큰 사용량은 프로젝트에 자동으로 귀속됩니다.
- 자세한 보고를 위해 프로젝트 ID로 로그를 쿼리하고 필터링할 수 있습니다.

## API 엔드포인트

### `POST /project/new`

새 프로젝트를 생성합니다.

**호출 가능 사용자**: 관리자 또는 팀 관리자

**매개변수**:
- `project_alias` (string, optional): 사람이 읽기 쉬운 프로젝트 이름
- `team_id` (string, required): 이 프로젝트가 속한 팀
- `models` (array, optional): 프로젝트가 액세스할 수 있는 모델 목록
- `max_budget` (float, optional): 프로젝트의 최대 비용 예산
- `tpm_limit` (int, optional): 분당 토큰 제한
- `rpm_limit` (int, optional): 분당 요청 제한
- `budget_duration` (string, optional): 예산 재설정 주기(예: "30d", "1mo")
- `metadata` (object, optional): 프로젝트용 사용자 지정 메타데이터
- `blocked` (boolean, optional): 이 프로젝트의 모든 API 호출 차단

**예제**:

```bash
curl --location 'http://0.0.0.0:4000/project/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "hotel-recommendations",
    "team_id": "team-123",
    "models": ["claude-3-sonnet"],
    "max_budget": 200,
    "tpm_limit": 100000,
    "metadata": {
        "use_case_id": "SNOW-12346",
        "cost_center": "travel-products"
    }
}'
```

**응답**:

```json
{
    "project_id": "project-def",
    "project_alias": "hotel-recommendations",
    "team_id": "team-123",
    "models": ["claude-3-sonnet"],
    "spend": 0.0,
    "budget_id": "budget-xyz",
    "metadata": {
        "use_case_id": "SNOW-12346",
        "cost_center": "travel-products"
    },
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
}
```

### `POST /project/update`

기존 프로젝트를 업데이트합니다.

**호출 가능 사용자**: 관리자 또는 팀 관리자

**매개변수**:
- `project_id` (string, required): 업데이트할 프로젝트
- `project_alias` (string, optional): 업데이트된 프로젝트 이름
- `team_id` (string, optional): 프로젝트를 다른 팀으로 이동
- `models` (array, optional): 업데이트된 허용 모델 목록
- `max_budget` (float, optional): 업데이트된 예산
- `tpm_limit` (int, optional): 업데이트된 TPM 제한
- `rpm_limit` (int, optional): 업데이트된 RPM 제한
- `metadata` (object, optional): 업데이트된 메타데이터
- `blocked` (boolean, optional): 업데이트된 차단 상태

**예제**:

```bash
curl --location 'http://0.0.0.0:4000/project/update' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "project_id": "project-abc",
    "max_budget": 200,
    "tpm_limit": 200000,
    "metadata": {
        "status": "production"
    }
}'
```

### GET /project/info

특정 프로젝트에 대한 정보를 가져옵니다.

**매개변수**:
- `project_id` (string, required): 쿼리 매개변수

**예제**:

```bash
curl --location 'http://0.0.0.0:4000/project/info?project_id=project-abc' \
--header 'Authorization: Bearer sk-1234'
```

**응답**:

```json
{
    "project_id": "project-abc",
    "project_alias": "flight-search-assistant",
    "team_id": "team-123",
    "models": ["gpt-4", "gpt-3.5-turbo"],
    "spend": 45.67,
    "model_spend": {
        "gpt-4": 42.30,
        "gpt-3.5-turbo": 3.37
    },
    "litellm_budget_table": {
        "budget_id": "budget-xyz",
        "max_budget": 100.0,
        "tpm_limit": 100000,
        "rpm_limit": 100
    },
    "metadata": {
        "use_case_id": "SNOW-12345"
    }
}
```

### GET /project/list

사용자가 액세스할 수 있는 모든 프로젝트를 나열합니다.

**예제**:

```bash
curl --location 'http://0.0.0.0:4000/project/list' \
--header 'Authorization: Bearer sk-1234'
```

**응답**:

```json
[
    {
        "project_id": "project-abc",
        "project_alias": "flight-search-assistant",
        "team_id": "team-123",
        "spend": 45.67
    },
    {
        "project_id": "project-def",
        "project_alias": "hotel-recommendations",
        "team_id": "team-123",
        "spend": 23.45
    }
]
```

### `DELETE /project/delete`

하나 이상의 프로젝트를 삭제합니다.

**호출 가능 사용자**: 관리자만

**매개변수**:
- `project_ids` (array, required): 삭제할 프로젝트 ID 목록

**예제**:

```bash
curl --location --request DELETE 'http://0.0.0.0:4000/project/delete' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "project_ids": ["project-abc", "project-def"]
}'
```

**참고**: 연결된 API 키가 있는 프로젝트는 삭제할 수 없습니다. 먼저 키를 삭제하거나 다시 할당하세요.

## 모델별 할당량

프로젝트 내에서 모델별로 서로 다른 할당량을 설정할 수 있습니다.

```bash
curl --location 'http://0.0.0.0:4000/project/new' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "project_alias": "multi-model-project",
    "team_id": "team-123",
    "models": ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet"],
    "max_budget": 500,
    "metadata": {
        "model_tpm_limit": {
            "gpt-4": 50000,
            "gpt-3.5-turbo": 200000,
            "claude-3-sonnet": 100000
        },
        "model_rpm_limit": {
            "gpt-4": 50,
            "gpt-3.5-turbo": 500,
            "claude-3-sonnet": 100
        }
    }
}'
```
