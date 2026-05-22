import Image from '@theme/IdealImage';

# 역할 기반 접근 제어(RBAC)

역할 기반 접근 제어(RBAC)는 Organization, Team, Internal User 역할을 기준으로 동작합니다.

### 동영상 둘러보기

<iframe width="100%" height="415" src="https://www.loom.com/embed/a980e25027ad4ecc9e8db1af2777b2a2" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<Image img={require('../../img/litellm_user_heirarchy.png')} style={{ width: '100%', maxWidth: '4000px' }} />


- `Organizations`는 Team을 포함하는 최상위 엔터티입니다.
- `Team` - 여러 `Internal Users`로 구성된 그룹입니다.
- `Internal Users` - LiteLLM에서 키를 생성하고, LLM API를 호출하고, 사용량을 볼 수 있는 사용자입니다. 한 사용자는 여러 Team에 속할 수 있습니다.
- `가상 키` - LiteLLM API 인증에 사용하는 키입니다. 각 키는 선택적으로 `user_id`, `team_id`, 또는 둘 모두와 연결할 수 있습니다.
  - **User-only key**: `user_id`만 있고 `team_id`는 없습니다. 개별 사용자 기준으로 추적되며 사용자가 삭제되면 함께 삭제됩니다.
  - **Team key (Service Account)**: `team_id`만 있고 `user_id`는 없습니다. 팀이 공유하며 사용자가 제거되어도 삭제되지 않습니다. [service account key 자세히 보기](https://docs.litellm.ai/docs/proxy/virtual_keys#service-account-keys).
  - **User + Team key**: `user_id`와 `team_id`를 모두 가집니다. 팀 컨텍스트 안의 특정 사용자에게 속합니다.

### 키 유형별 사용 시점

| 키 유형 | 사용 사례 | 비용 추적 | 수명 주기 |
|----------|----------|----------------|-----------|
| **User-only** | 개별 개발자의 개인 API 키 | 사용자 기준으로 추적 | 사용자가 삭제되면 삭제 |
| **Team (Service Account)** | 프로덕션 앱, CI/CD 파이프라인, 공유 서비스 | 팀 기준으로만 추적 | 팀 구성원이 떠나도 유지 |
| **User + Team** | 팀 컨텍스트 안에서 작업하는 사용자 | 사용자와 팀 모두 기준으로 추적 | 사용자가 삭제되면 삭제 |

**예시 시나리오:**
- 로컬 테스트를 하는 개발자에게는 **user-only key**를 사용합니다.
- 직원이 퇴사해도 중단되면 안 되는 프로덕션 애플리케이션에는 **team service account key**를 사용합니다.
- 팀 예산 안에서 개인별 책임 추적이 필요하면 **user + team key**를 사용합니다.

---

## 사용자 역할

LiteLLM에는 두 종류의 역할이 있습니다.

1. **Global Proxy Roles** - 모든 Organization과 Team에 적용되는 플랫폼 전체 역할
2. **Organization/Team Specific Roles** - 특정 Organization 또는 Team 범위의 역할(**Premium Feature**)

### Global Proxy Roles

| 역할 이름 | 권한 |
|-----------|-------------|
| `proxy_admin` | 전체 플랫폼 관리자입니다. 모든 Organization, Team, User를 완전히 제어할 수 있습니다. |
| `proxy_admin_viewer` | 로그인, 모든 키 조회, 플랫폼 전체 비용 조회가 가능합니다. 키 생성/삭제/신규 사용자 추가는 **할 수 없습니다**. |
| `internal_user` | 로그인, 본인 키 조회/생성(팀별 권한이 허용한 경우)/삭제, 본인 비용 조회가 가능합니다. 신규 사용자 추가는 **할 수 없습니다**. |
| `internal_user_viewer` | ⚠️ **DEPRECATED** - 대신 team/org specific role을 사용하세요. 로그인, 본인 키 조회, 본인 비용 조회가 가능합니다. 키 생성/삭제, 신규 사용자 추가는 **할 수 없습니다**. |

### Organization/Team별 역할 {#organization-team-specific-roles}

| 역할 이름 | 권한 |
|-----------|-------------|
| `org_admin` | 특정 Organization의 관리자입니다. 해당 Organization 안에서 Team과 User를 생성할 수 있습니다. ✨ **Premium Feature** |
| `team_admin` | 특정 Team의 관리자입니다. 팀 구성원을 관리하고, 팀 구성원 권한을 업데이트하고, 해당 Team의 키를 생성할 수 있습니다. ✨ **Premium Feature** |

## 각 역할이 할 수 있는 일

각 역할이 실제로 수행할 수 있는 작업입니다. 접근 권한 수준으로 이해하면 됩니다.

---

## Global Proxy Roles

이 역할은 Organization 또는 Team 경계와 관계없이 LiteLLM 플랫폼 전체에 적용됩니다.

### Proxy Admin - 전체 접근 권한

proxy admin은 모든 것을 제어합니다. 전체 플랫폼 소유자에 가까운 권한입니다.

**할 수 있는 일:**
- 모든 Organization 생성 및 관리
- 모든 Organization의 모든 Team 생성 및 관리
- 모든 User 생성 및 관리
- 플랫폼 전체 비용과 사용량 조회
- 모든 사용자의 키 생성 및 삭제
- Team 예산, rate limit, 모델 업데이트
- Team 구성원 관리 및 역할 할당

**proxy admin 권장 대상:** LiteLLM 인스턴스를 운영하는 사람으로만 제한하세요.

---

### Proxy Admin Viewer - 플랫폼 전체 읽기 권한

proxy admin viewer는 플랫폼 전체를 볼 수 있지만 변경은 할 수 없습니다.

**할 수 있는 일:**
- 모든 Organization, Team, User 조회
- 플랫폼 전체 비용과 사용량 조회
- 모든 API 키 조회
- 관리자 대시보드 로그인

**할 수 없는 일:**
- 키 생성 또는 삭제
- User 추가 또는 제거
- 예산, rate limit, 설정 수정
- 플랫폼 변경 작업

**proxy admin viewer 권장 대상:** 수정 권한 없이 플랫폼 전체 가시성이 필요한 재무팀, 감사 담당자, 이해관계자입니다.

---

### Internal User

internal user는 팀별 권한이 허용하는 경우 API 키를 생성하고 호출할 수 있습니다. 본인 리소스만 볼 수 있습니다. 별도 역할이 할당되면 team admin 또는 org admin이 될 수 있습니다.

**할 수 있는 일:**
- 본인 API 키 생성
- 본인 API 키 삭제
- 본인 비용과 사용량 조회
- 본인 키로 API 호출


**internal user 권장 대상:** team/org specific 작업을 위해 UI 접근이 필요한 사람 또는 여러 키를 부여할 예정인 개발자입니다.

---

### Internal User Viewer - 읽기 전용 접근

:::warning DEPRECATED
이 역할은 team/org specific role로 대체되어 deprecated 상태입니다. Organization과 Team 안에서 사용자 권한을 더 세밀하게 제어하려면 `org_admin` 또는 `team_admin` 역할을 사용하세요.
:::

internal user viewer는 본인 정보를 볼 수 있지만 키를 생성하거나 삭제할 수 없습니다.

**할 수 있는 일:**
- 본인 API 키 조회
- 본인 비용과 사용량 조회
- 대시보드 로그인

**할 수 없는 일:**
- API 키 생성 또는 삭제
- 설정 변경
- Team 생성 또는 User 추가
- 다른 사용자의 정보 조회

**internal user viewer 권장 대상(deprecated):** 더 나은 접근 제어를 위해 team/org specific role 사용을 검토하세요.

---

## Organization/Team별 역할 {#organization-team-specific-roles}

:::info 
Organization/Team specific role은 premium feature입니다. 사용하려면 LiteLLM 엔터프라이즈 사용자여야 합니다. [여기에서 7일 체험판을 받으세요](https://www.litellm.ai/#trial).
:::

이 역할은 특정 Organization 또는 Team 범위에만 적용됩니다. 해당 역할을 가진 사용자는 할당된 Organization 또는 Team 안의 리소스만 관리할 수 있습니다.

### Org Admin - Organization 수준 접근

org admin은 하나 이상의 Organization을 관리합니다. 본인 Organization 안에서 Team을 만들 수 있지만 다른 Organization에는 접근할 수 없습니다.

**할 수 있는 일:**
- 본인 Organization 안에서 Team 생성
- 본인 Organization의 Team에 User 추가
- 본인 Organization의 비용 조회
- 본인 Organization 사용자용 키 생성

**할 수 없는 일:**
- 다른 Organization 생성 또는 관리
- Organization 예산 / rate limit 수정
- Organization 허용 모델 수정(예: proxy-level model을 Organization에 추가)

**org admin 권장 대상:** 여러 Team을 관리해야 하는 부서 리더 또는 관리자입니다.

---

### Team Admin - Team 수준 접근

✨ **Premium Feature입니다**

team admin은 특정 Team을 관리합니다. 사람을 추가하고 설정을 업데이트할 수 있는 팀 리더와 비슷하지만, 권한은 본인 Team으로 제한됩니다.

**할 수 있는 일:**
- 본인 Team의 구성원 추가 또는 제거
- Team 안에서 구성원의 예산과 rate limit 업데이트
- Team 설정 변경(예산, rate limit, 모델)
- Team 구성원의 키 생성 및 삭제
- [team-BYOK](./team_model_add) 모델을 LiteLLM에 온보딩(예: 팀의 finetuned model 온보딩)
- 일반 Team 구성원이 할 수 있는 일을 제어하도록 [team member permissions](#team-member-permissions) 구성

**할 수 없는 일:**
- 새 Team 생성
- Team 예산 / rate limit 수정
- 본인 Team에 global proxy model 추가/제거


**team admin 권장 대상:** IT에 요청하지 않고 본인 Team의 API 접근을 관리해야 하는 팀 리더입니다.

:::info team admin 생성 방법

team admin을 할당하려면 LiteLLM 엔터프라이즈 사용자여야 합니다. [여기에서 7일 체험판을 받으세요](https://www.litellm.ai/#trial).

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "team-123", "member": {"role": "admin", "user_id": "user@company.com"}}'
```

:::

---

## Team Member 권한 {#team-member-permissions}

✨ **Premium Feature입니다**

Team member permissions를 사용하면 일반 Team 구성원(role=`user`)이 본인 Team의 API 키로 수행할 수 있는 작업을 제어할 수 있습니다. 기본적으로 Team 구성원은 키 정보만 볼 수 있지만, 키 생성, 업데이트, 삭제 권한을 추가로 부여할 수 있습니다.

### 동작 방식

- **적용 대상**: role=`user`인 Team 구성원(team admin 또는 org admin 제외)
- **범위**: 권한은 해당 Team에 속한 키에만 적용됩니다.
- **설정**: Team 수준에서 `team_member_permissions`로 설정합니다.
- **Override**: team admin과 org admin은 이 설정과 관계없이 항상 전체 권한을 가집니다.

### 사용 가능한 권한

| 권한 | Method | 설명 |
|-----------|--------|-------------|
| `/key/info` | GET | Team 안의 가상 키 정보 조회 |
| `/key/health` | GET | Team 안의 가상 키 상태 확인 |
| `/key/list` | GET | Team에 속한 모든 가상 키 목록 조회 |
| `/key/generate` | POST | Team용 새 가상 키 생성 |
| `/key/service-account/generate` | POST | Team용 service account key 생성(특정 사용자에 연결되지 않음) |
| `/key/update` | POST | Team 안의 기존 가상 키 수정 |
| `/key/delete` | POST | Team에 속한 가상 키 삭제 |
| `/key/regenerate` | POST | Team 안의 가상 키 재생성 |
| `/key/block` | POST | Team 안의 가상 키 차단 |
| `/key/unblock` | POST | Team 안의 가상 키 차단 해제 |

### 기본 권한

기본적으로 Team 구성원은 다음 작업만 할 수 있습니다.
- `/key/info` - 키 정보 조회
- `/key/health` - 키 상태 확인

### 일반적인 권한 시나리오

**읽기 전용 접근**(기본값):
```json
["/key/info", "/key/health"]
```

**키 생성은 허용하지만 삭제는 허용하지 않음**:
```json
["/key/info", "/key/health", "/key/generate", "/key/update"]
```

**전체 키 관리**:
```json
["/key/info", "/key/health", "/key/generate", "/key/update", "/key/delete", "/key/regenerate", "/key/block", "/key/unblock", "/key/list"]
```

### Team Member Permissions 구성 방법

#### 현재 권한 조회

```shell
curl --location 'http://0.0.0.0:4000/team/permissions_list?team_id=team-123' \
    --header 'Authorization: Bearer sk-1234'
```

예상 응답:
```json
{
  "team_id": "team-123",
  "team_member_permissions": ["/key/info", "/key/health"],
  "all_available_permissions": ["/key/generate", "/key/update", "/key/delete", ...]
}
```

#### Team Member Permissions 업데이트

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "team-123",
        "team_member_permissions": ["/key/info", "/key/health", "/key/generate", "/key/update"]
    }'
```

이 설정은 Team 구성원에게 다음 작업을 허용합니다.
- 키 정보 조회
- 새 키 생성
- 기존 키 업데이트
- 단, 키 삭제는 허용하지 않음

### 이 권한을 구성할 수 있는 사람

- **Proxy Admin**: 모든 Team의 권한 구성 가능
- **Org Admin**: 본인 Organization 안의 Team 권한 구성 가능
- **Team Admin**: 본인 Team의 권한 구성 가능

---

## 빠른 비교

요약하면 다음과 같습니다.

### Global Proxy Roles

| 작업 | Proxy Admin | Proxy Admin Viewer | Internal User | Internal User Viewer ⚠️ (Deprecated) |
|--------|-------------|-------------------|---------------|-------------------------------------|
| Organization 생성 | ✅ | ❌ | ❌ | ❌ |
| Team 생성 | ✅ | ❌ | ❌ | ❌ |
| 모든 Team 관리 | ✅ | ❌ | ❌ | ❌ |
| 임의 키 생성/삭제 | ✅ | ❌ | ❌ | ❌ |
| 본인 키 생성/삭제 | ✅ | ❌ | ✅ | ❌ |
| 플랫폼 전체 비용 조회 | ✅ | ✅ | ❌ | ❌ |
| 본인 비용 조회 | ✅ | ✅ | ✅ | ✅ |
| 모든 키 조회 | ✅ | ✅ | ❌ | ❌ |
| 본인 키 조회 | ✅ | ✅ | ✅ | ✅ |
| User 추가/제거 | ✅ | ❌ | ❌ | ❌ |

> **참고:** `internal_user_viewer` 역할은 deprecated 상태입니다. 더 세밀한 접근 제어에는 team/org specific role을 사용하세요.

### Organization/Team별 역할 {#organization-team-specific-roles}

| 작업 | Org Admin | Team Admin |
|--------|-----------|------------|
| Team 생성(본인 org 안) | ✅ | ❌ |
| 본인 org 안의 Team 관리 | ✅ | ❌ |
| 특정 Team 관리 | ✅ | ✅ |
| Team 구성원 추가/제거 | ✅ (본인 org 안) | ✅ (본인 Team만) |
| Team 예산 업데이트 | ✅ (본인 org 안) | ✅ (본인 Team만) |
| Team 구성원용 키 생성 | ✅ (본인 org 안) | ✅ (본인 Team만) |
| Organization 비용 조회 | ✅ (본인 org) | ❌ |
| Team 비용 조회 | ✅ (본인 org 안) | ✅ (본인 Team) |
| Organization 생성 | ❌ | ❌ |
| 플랫폼 전체 비용 조회 | ❌ | ❌ |

## Organization 온보딩 

✨ **Premium Feature입니다**

### 1. 새 Organization 생성 {#1-creating-a-new-organization}

role=`proxy_admin`인 모든 사용자는 새 Organization을 생성할 수 있습니다.

**사용법**

[**/organization/new API Reference**](https://litellm-api.up.railway.app/#/organization%20management/new_organization_organization_new_post)

```shell
curl --location 'http://0.0.0.0:4000/organization/new' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "organization_alias": "marketing_department",
        "models": ["gpt-4"],
        "max_budget": 20
    }'
```

예상 응답

```json
{
  "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23",
  "organization_alias": "marketing_department",
  "budget_id": "98754244-3a9c-4b31-b2e9-c63edc8fd7eb",
  "metadata": {},
  "models": [
    "gpt-4"
  ],
  "created_by": "109010464461339474872",
  "updated_by": "109010464461339474872",
  "created_at": "2024-10-08T18:30:24.637000Z",
  "updated_at": "2024-10-08T18:30:24.637000Z"
}
```


### 2. Organization에 `org_admin` 추가 {#2-adding-an-org_admin-to-an-organization}

`marketing_department` Organization(위 1단계)에서 사용자(ishaan@berri.ai)를 `org_admin`으로 생성합니다.

다음 역할의 사용자는 `/organization/member_add`를 호출할 수 있습니다.
- `proxy_admin`
- `org_admin`은 본인 Organization 안에서만 호출 가능

```shell
curl -X POST 'http://0.0.0.0:4000/organization/member_add' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{"organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23", "member": {"role": "org_admin", "user_id": "ishaan@berri.ai"}}'
```

이제 `marketing_department` Organization 안에 user_id = `ishaan@berri.ai`, role = `org_admin`인 사용자가 생성되었습니다.

user_id = `ishaan@berri.ai`용 Virtual Key를 생성합니다. 이후 이 사용자는 Virtual Key로 Organization Admin 작업을 수행할 수 있습니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
        --header 'Authorization: Bearer sk-1234' \
        --header 'Content-Type: application/json' \
        --data '{
            "user_id": "ishaan@berri.ai"
    }'
```

예상 응답

```json
{
  "models": [],
  "user_id": "ishaan@berri.ai",
  "key": "sk-7shH8TGMAofR4zQpAAo6kQ",
  "key_name": "sk-...o6kQ",
}
```

### 3. `Organization Admin` - Team 생성 {#3-organization-admin---create-a-team}

organization admin은 위 2단계에서 생성한 virtual key를 사용해 `marketing_department` Organization 안에 `Team`을 생성합니다.

```shell
curl --location 'http://0.0.0.0:4000/team/new' \
    --header 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_alias": "engineering_team",
        "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23"
    }'
```

이 요청은 `marketing_department` Organization 안에 `engineering_team` Team을 생성합니다.

예상 응답

```json
{
  "team_alias": "engineering_team",
  "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8",
  "organization_id": "ad15e8ca-12ae-46f4-8659-d02debef1b23",
}
```


### 4. `Organization Admin` - Team Admin 추가

✨ **Premium Feature입니다**

이제 organization admin은 `engineering_team`을 관리할 team admin을 추가할 수 있습니다.

- 이 특정 Team의 team admin으로 만들기 위해 role=`admin`을 할당합니다.
- `team_id`는 위 3단계에서 가져옵니다.

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "01044ee8-441b-45f4-be7d-c70e002722d8", "member": {"role": "admin", "user_id": "john@company.com"}}'
```

이제 `john@company.com`은 team admin입니다. `engineering_team`의 구성원 추가, 예산 업데이트, 키 생성을 관리할 수 있지만 다른 Team에는 접근할 수 없습니다.

team admin용 Virtual Key를 생성합니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-7shH8TGMAofR4zQpAAo6kQ' \
    --header 'Content-Type: application/json' \
    --data '{"user_id": "john@company.com"}'
```

예상 응답:

```json
{
  "models": [],
  "user_id": "john@company.com",
  "key": "sk-TeamAdminKey123",
  "key_name": "sk-...Key123"
}
```

### 5. `Team Admin` - Team 구성원 추가

이제 team admin은 org admin에게 요청하지 않고 본인 키로 Team 구성원을 추가할 수 있습니다.

```shell
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-TeamAdminKey123' \
    -H 'Content-Type: application/json' \
    -d '{"team_id": "01044ee8-441b-45f4-be7d-c70e002722d8", "member": {"role": "user", "user_id": "krrish@berri.ai"}}'
```

team admin은 Team 구성원용 키도 생성할 수 있습니다.

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-TeamAdminKey123' \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "krrish@berri.ai",
        "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8"
    }'
```

### 6. `Team Admin` - Team 설정 업데이트

team admin은 Team 예산과 rate limit을 업데이트할 수 있습니다.

```shell
curl --location 'http://0.0.0.0:4000/team/update' \
    --header 'Authorization: Bearer sk-TeamAdminKey123' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_id": "01044ee8-441b-45f4-be7d-c70e002722d8",
        "max_budget": 100,
        "rpm_limit": 1000
    }'
```
