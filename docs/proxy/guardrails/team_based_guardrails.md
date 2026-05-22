import Image from '@theme/IdealImage';

# 팀 Bring-Your-Own 가드레일 {#team-bring-your-own-guardrails}

팀 기반 가드레일을 사용하면 **개발자**가 API를 통해 자신의 팀용 가드레일을 등록할 수 있습니다. 이후 **관리자**가 LiteLLM UI에서 이를 검토하고 승인하거나 거부합니다. 이 방식으로는 [Generic Guardrail API](/litellm-docs-kr/docs/adding_provider/generic_guardrail_api) 가드레일만 등록할 수 있습니다.

## 개요

- **개발자 흐름:** **team-scoped API 키**를 사용해 가드레일 구성과 함께 `POST /guardrails/register`를 호출합니다. 제출 항목은 `pending_review` 상태로 저장됩니다.
- **관리자 흐름:** proxy UI에서 **가드레일 → Team 가드레일**을 열고 대기 중인 제출 항목을 검토한 뒤 **Approve** 또는 **Reject**합니다. 승인된 가드레일은 활성화되고 메모리에 초기화됩니다.

---

## 개발자 흐름: 가드레일 등록 {#developer-flow-register-a-guardrail}

### 사전 준비

- **team-scoped** API 키. 이 키는 팀에 연결되어 있어야 합니다. 팀이 없는 키로는 가드레일을 등록할 수 없습니다.
- 가드레일은 [Generic Guardrail API](/litellm-docs-kr/docs/adding_provider/generic_guardrail_api) 계약과 구성을 따라야 합니다.

### 요청 {#request}

**엔드포인트:** `POST /guardrails/register`

**헤더:** `Authorization: Bearer <team_scoped_api_key>`

**본문:** Generic Guardrail API 구성과 일치하는 JSON입니다.

| 필드 | 타입 | 필수 여부 | 설명 |
|-------|------|----------|-------------|
| `guardrail_name` | string | 예 | 가드레일의 고유 이름입니다. |
| `litellm_params` | object | 예 | `guardrail: "generic_guardrail_api"`, `mode`(예: `pre_call`, `post_call`), `api_base`를 반드시 포함해야 합니다. [Generic Guardrail API](/litellm-docs-kr/docs/adding_provider/generic_guardrail_api#litellm-configuration)를 참고하세요. |
| `guardrail_info` | object | 아니요 | 선택적 메타데이터입니다(예: `description`). |

### `litellm_params` 요구 사항 {#requirements-for-litellm_params}

- `guardrail`은 정확히 `"generic_guardrail_api"`여야 합니다.
- `api_base`는 필수입니다. 가드레일 API 기본 URL입니다.
- `mode`는 필수입니다(예: `pre_call`, `post_call`, `during_call`).

### 예제

```bash
curl -X POST "http://localhost:4000/guardrails/register" \
  -H "Authorization: Bearer <your_team_scoped_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "guardrail_name": "my-team-guard",
    "litellm_params": {
      "guardrail": "generic_guardrail_api",
      "mode": "pre_call",
      "api_base": "https://your-guardrail-api.com",
      "api_key": "optional-api-key",
      "unreachable_fallback": "fail_closed",
      "forward_api_key": true
    },
    "guardrail_info": {
      "description": "Team content moderation guardrail"
    }
  }'
```

### 예제 응답 {#example-response}

```json
{
  "guardrail_id": "123e4567-e89b-12d3-a456-426614174000",
  "guardrail_name": "my-team-guard",
  "status": "pending_review",
  "submitted_at": "2025-02-28T12:00:00.000Z"
}
```

### 오류 {#errors}

- **400** – 본문이 없거나 유효하지 않습니다. 예: `guardrail`이 `generic_guardrail_api`가 아니거나, `api_base` 또는 `mode`가 누락되었거나, 같은 `guardrail_name`을 가진 가드레일이 이미 존재합니다.
- **400** – 팀이 연결된 API 키가 필요하다는 오류(`Registration requires an API key associated with a team. Use a team-scoped key.`) → 팀이 연결된 API 키를 사용하세요.
- **500** – 서버/데이터베이스 오류입니다.

등록에 성공하면 관리자가 승인하거나 거부할 때까지 가드레일은 `pending_review` 상태로 유지됩니다.

---

## 관리자 흐름: UI에서 승인 또는 거부 {#admin-flow-approve-or-reject-in-the-ui}

관리자는 LiteLLM proxy UI에서 팀 가드레일 제출 항목을 검토하고 승인하거나 거부합니다.

### 1. 가드레일 페이지 열기 {#1-open-the-guardrails-page}

proxy 대시보드에서 **가드레일**로 이동합니다(사이드바 또는 탐색 메뉴).

### 2. Team 가드레일 탭 열기 {#2-open-the-team-guardrails-tab}

**Team 가드레일** 탭으로 전환합니다. 이 탭에는 팀이 제출한 모든 가드레일과 해당 상태가 표시됩니다.

<Image img={require('../../../img/admin_team_guardrails.png')} alt="Team 가드레일 관리자 화면: 상태 요약(Total, Pending Review, Active, Rejected), Pending Review 태그가 있는 가드레일 목록, Approve/Reject 버튼과 구성 옵션이 있는 세부 정보 패널." style={{ width: '100%', maxWidth: '900px', height: 'auto' }} />

### 3. 제출 항목 검토 {#3-review-submissions}

표에는 다음 항목이 표시됩니다.

- **Name**, **Team**, **Endpoint**(api_base), **Status**(Pending Review / Active / Rejected), **Submitted** 날짜, **Submitted by**(user/email), 기타 구성 세부 정보.

요약 카드에는 **Total**, **Pending Review**, **Active**, **Rejected** 개수가 표시됩니다.

<!-- Optional: screenshot of the Team 가드레일 table and summary -->

### 4. 승인 또는 거부 {#4-approve-or-reject}

- **검토 대기**(`Pending Review`): **Approve**를 사용해 가드레일을 활성화합니다. proxy는 상태를 `active`로 설정하고 요청에서 사용할 수 있도록 메모리에 초기화합니다.
- 제출 항목을 거부하려면 **Reject**를 사용합니다. 상태는 `rejected`가 됩니다.

승인하면 구성 또는 관리자 guardrail API로 가드레일을 추가할 때와 같은 초기화가 실행됩니다. 거부는 상태만 업데이트하며 가드레일을 로드하지 않습니다.

<!-- Optional: screenshot of Approve/Reject actions or confirmation dialog -->

### 동등한 API(관리자 전용) {#api-equivalent-admin-only}

관리자는 REST API도 사용할 수 있습니다.

- **제출 항목 목록 조회:** `GET /guardrails/submissions`(선택적 쿼리: `status`, `team_id`, `search`)
- **단일 항목 조회:** `GET /guardrails/submissions/{guardrail_id}`
- **Approve:** `POST /guardrails/submissions/{guardrail_id}/approve`
- **Reject:** `POST /guardrails/submissions/{guardrail_id}/reject`

이 엔드포인트들은 **관리자** 인증이 필요합니다(예: `PROXY_ADMIN`).

---

## 요약 {#summary}

| 역할 | 작업 |
|------|--------|
| **개발자** | team-scoped 키와 `generic_guardrail_api` 구성으로 `POST /guardrails/register`를 호출합니다. 제출 항목은 `pending_review` 상태가 됩니다. |
| **관리자** | UI에서 **가드레일 → Team 가드레일**을 열거나 submissions API를 사용한 뒤, 각 제출 항목을 **Approve** 또는 **Reject**합니다. 승인된 가드레일은 활성화됩니다. |

`litellm_params.guardrail: "generic_guardrail_api"`인 가드레일만 등록할 수 있습니다. 전체 계약과 구성 옵션은 [Generic Guardrail API](/litellm-docs-kr/docs/adding_provider/generic_guardrail_api)를 참고하세요.
