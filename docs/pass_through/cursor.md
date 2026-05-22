import Image from '@theme/IdealImage';

# `Cursor Cloud Agents`

[Cursor Cloud Agents API](https://docs.cursor.com/account/api)를 위한 Pass-through 엔드포인트입니다. 네이티브 형식(변환 없음)으로 저장소에서 작업하는 클라우드 에이전트를 시작하고 관리합니다.

| 기능 | 지원 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | $0.00로 기록됨(구독 기반, 요청별 과금 없음) |
| 로깅 | ✅ | 모든 요청이 작업 분류와 함께 기록됨 |
| 최종 사용자 추적 | ❌ | [필요하다면 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ❌ | Cursor API는 스트리밍을 사용하지 않음 |

`https://api.cursor.com`을 `LITELLM_PROXY_BASE_URL/cursor`로 바꾸기만 하면 됩니다. 🚀

**지원되는 엔드포인트:**

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|-------------|
| `/v0/agents` | GET | 에이전트 목록 조회 |
| `/v0/agents` | POST | 에이전트 시작 |
| `/v0/agents/{id}` | GET | 에이전트 상태 |
| `/v0/agents/{id}` | DELETE | 에이전트 삭제 |
| `/v0/agents/{id}/conversation` | GET | 에이전트 대화 |
| `/v0/agents/{id}/followup` | POST | 후속 요청 추가 |
| `/v0/agents/{id}/stop` | POST | 에이전트 중지 |
| `/v0/me` | GET | API 키 정보 |
| `/v0/models` | GET | 모델 목록 조회 |
| `/v0/repositories` | GET | GitHub 저장소 목록 조회 |

## 빠른 시작

### 1. UI에서 Cursor API 키 추가 {#1-add-cursor-api-key-on-the-ui}

**모델 + Endpoints → LLM Credentials**로 이동한 뒤 **Add Credential**을 클릭합니다. 공급자 드롭다운에서 **Cursor**를 선택하면 Cursor 로고가 표시됩니다. [cursor.com/settings](https://cursor.com/settings)의 API 키를 입력합니다.

<Image img={require('../../img/cursor_add_credential.png')} alt="Add Cursor credential with logo" style={{maxWidth: '800px'}} />

### 2. Cursor Agent 시작 {#2-launch-a-cursor-agent}

```bash
curl -X POST http://0.0.0.0:4000/cursor/v0/agents \
  -H "Authorization: Bearer <your-litellm-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "text": "Add a README.md with installation instructions"
    },
    "source": {
      "repository": "https://github.com/your-org/your-repo",
      "ref": "main"
    },
    "target": {
      "autoCreatePr": true
    }
  }'
```

**예상 응답:**

```json
{
  "id": "bc_abc123",
  "name": "Add README Documentation",
  "status": "CREATING",
  "source": {
    "repository": "https://github.com/your-org/your-repo",
    "ref": "main"
  },
  "target": {
    "branchName": "cursor/add-readme-1234",
    "url": "https://cursor.com/agents?id=bc_abc123",
    "autoCreatePr": true
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3. 로그 보기 {#3-view-logs}

사이드바의 **로그**로 이동합니다. 에이전트 요청을 보려면 "cursor"로 필터링합니다. 각 요청에는 작업 유형(예: `cursor/cursor:agent:create`), 상태, 소요 시간, 비용이 표시됩니다.

<Image img={require('../../img/cursor_logs.png')} alt="Cursor requests in 로그 page" style={{maxWidth: '800px'}} />

로그 항목을 클릭하면 공급자, API base, metadata를 포함한 전체 요청 세부 정보를 볼 수 있습니다.

<Image img={require('../../img/cursor_log_detail.png')} alt="Cursor log entry detail" style={{maxWidth: '800px'}} />

## 예제

`http://0.0.0.0:4000/cursor` 뒤의 모든 경로는 공급자별 라우트로 취급되며 그에 맞게 처리됩니다.

| **원본 엔드포인트** | **대체 값** |
|---|---|
| `https://api.cursor.com` | `http://0.0.0.0:4000/cursor` (LITELLM_PROXY_BASE_URL) |
| `-u YOUR_API_KEY:` (기본 인증) | `-H "Authorization: Bearer <your-litellm-key>"` (LiteLLM 가상 키) |

### 사용 가능한 모델 목록 조회 {#list-available-models}

```bash
curl http://0.0.0.0:4000/cursor/v0/models \
  -H "Authorization: Bearer <your-litellm-key>"
```

### 에이전트 상태 확인 {#check-agent-status}

```bash
curl http://0.0.0.0:4000/cursor/v0/agents/bc_abc123 \
  -H "Authorization: Bearer <your-litellm-key>"
```

### 모든 에이전트 목록 조회 {#list-all-agents}

```bash
curl http://0.0.0.0:4000/cursor/v0/agents \
  -H "Authorization: Bearer <your-litellm-key>"
```

### 에이전트에 후속 요청 추가 {#add-follow-up-to-agent}

```bash
curl -X POST http://0.0.0.0:4000/cursor/v0/agents/bc_abc123/followup \
  -H "Authorization: Bearer <your-litellm-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "text": "Also add a section about troubleshooting"
    }
  }'
```

### 에이전트 중지 {#stop-an-agent}

```bash
curl -X POST http://0.0.0.0:4000/cursor/v0/agents/bc_abc123/stop \
  -H "Authorization: Bearer <your-litellm-key>"
```

### 에이전트 삭제 {#delete-an-agent}

```bash
curl -X DELETE http://0.0.0.0:4000/cursor/v0/agents/bc_abc123 \
  -H "Authorization: Bearer <your-litellm-key>"
```

### API 키 정보 가져오기 {#get-api-key-info}

```bash
curl http://0.0.0.0:4000/cursor/v0/me \
  -H "Authorization: Bearer <your-litellm-key>"
```

## 관련 항목 {#related}

- [Cursor Cloud Agents API 문서](https://docs.cursor.com/account/api)
- [Pass-through Endpoints 개요](./intro.md)
- [가상 키](../proxy/virtual_keys.md)
