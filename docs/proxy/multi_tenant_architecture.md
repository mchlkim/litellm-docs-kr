import Image from '@theme/IdealImage';

# LiteLLM 기반 Multi-Tenant 아키텍처

## 개요

LiteLLM은 여러 tenant로 확장되는 중앙화된 솔루션을 제공하며, 조직은 다음을 수행할 수 있습니다.

- 여러 tenant(organization/team/부서)의 LLM 접근을 **중앙에서 관리**
- 서로 다른 조직 단위 간 비용과 사용량 **격리**
- 보안을 훼손하지 않고 관리 권한 **위임**
- 세분화된 계층(organization -> team -> user -> key)에서 **비용 추적**
- 새 team과 user가 추가되어도 **매끄럽게 확장**

:::info Open Source와 엔터프라이즈
- **Teams + 가상 키**: ✅ open source에서 사용 가능
- **Organizations + Org Admins**: ✨ 엔터프라이즈 기능 ([7일 trial 받기](https://www.litellm.ai/#trial))

open source 버전에서는 **Teams**만으로 multi-tenancy를 구현할 수 있고, enterprise 버전에서는 추가 계층을 위해 그 위에 **Organizations**를 더할 수 있습니다.
:::

## Multi-tenant 과제

multi-tenant 구조를 가진 조직은 LLM 솔루션을 배포할 때 여러 과제를 마주합니다.

1. **중앙화 vs. 분산화**: tenant 격리를 유지하면서 단일 unified gateway가 필요합니다.
2. **Cost attribution**: 서로 다른 사업부, 부서, customer별 비용을 추적해야 합니다.
3. **Access control**: team마다 필요한 model, budget, rate limit이 다릅니다.
4. **권한 위임**: team lead는 platform 전체 admin 접근 권한 없이 자신의 team을 관리할 수 있어야 합니다.
5. **확장성**: architecture 변경 없이 10명에서 10,000명 이상까지 확장할 수 있어야 합니다.

## LiteLLM이 multi-tenancy를 해결하는 방식

<Image img={require('../../img/litellm_user_heirarchy.png')} style={{ width: '100%', maxWidth: '4000px' }} />

LiteLLM은 네 단계의 계층형 multi-tenant 구조를 구현합니다.

### 1. Organizations(최상위 tenant) ✨ 엔터프라이즈 기능

**Organizations**는 가장 높은 수준의 tenant 격리를 나타냅니다. 일반적으로 서로 다른 business unit, 부서, customer를 의미합니다.

- 각 organization은 자체 항목을 가집니다.
  - Budget 제한
  - 허용 model
  - 관리자 사용자(org admin)
  - Teams
  - 비용 추적

**사용 사례:**
- **엔터프라이즈 부서**: Engineering, Marketing, Sales를 별도 organization으로 분리
- **Multi-customer SaaS**: 각 customer를 완전히 격리된 organization으로 구성
- **지리적 region**: EMEA/APAC/Americas를 별도 organization으로 구성

**주요 기능:**
- organization은 서로의 데이터를 볼 수 없습니다.
- 각 organization은 여러 team을 가질 수 있습니다.
- organization admin은 자신의 organization 안의 team만 관리합니다.
- 비용과 사용량은 organization level에서 추적됩니다.

[Organizations API reference](https://litellm-api.up.railway.app/#/organization%20management)

---

### 2. Teams(중간 수준 grouping) ✅ Open source

**Teams**는 독립적으로 동작하거나 organization 안에 배치될 수 있으며, 함께 일하는 user의 논리적 grouping을 나타냅니다.

:::tip
Teams는 **open source**에서 사용할 수 있으며 Organizations 없이 기본 multi-tenant boundary로 사용할 수 있습니다. Organizations는 enterprise 배포를 위한 추가 계층 layer를 제공합니다.
:::

- 각 team은 다음을 가집니다.
  - team 전용 budget 및 rate limit
  - member를 관리하는 team admin
  - shared resource용 service account key
  - model access 제어
  - 세분화된 team member 권한

**사용 사례:**
- **프로젝트 팀**: ML Research, Product, Data Science 팀
- **Customer 하위 group**: customer organization 안의 서로 다른 division
- **환경 분리**: Development, Staging, Production team

**주요 기능:**
- team은 organization 제약을 상속합니다(org budget/model을 초과할 수 없음).
- team admin은 다른 team에 영향을 주지 않고 자신의 team을 관리할 수 있습니다.
- service account key는 team member 변경 후에도 유지됩니다.
- team별 비용 추적 및 billing이 가능합니다.

[Teams API reference](https://litellm-api.up.railway.app/#/team%20management)

---

### 3. Users(개별 member) ✅ Open source

**Users**는 team에 속하고 API key를 생성/사용하는 개인입니다.

- 각 user는 다음을 할 수 있습니다.
  - 여러 team에 소속
  - 자체 budget limit 보유
  - personal API key 생성
  - 개인별 비용 추적

**User 유형:**
- **내부 사용자**: 직원, 개발자, 데이터 과학자
- **Team admins**: team을 lead하고 member를 관리
- **Org admins**: organization 안의 여러 team 관리
- **Proxy admins**: platform 전체 administrator

**주요 기능:**
- user 비용을 individual level로 추적합니다.
- user는 동시에 여러 team에 속할 수 있습니다.
- role 기반 permission으로 user가 할 수 있는 일을 제어합니다.
- user가 제거되면 user key도 삭제됩니다.

[Users API reference](https://litellm-api.up.railway.app/#/user%20management)

---

### 4. 가상 키(인증 layer) ✅ Open Source

**가상 키**는 request를 authenticate하고 비용을 추적하는 데 사용하는 API key입니다.

각 key는 세 가지 type 중 하나입니다.

| Key type | 설정 | 사용 사례 | 비용 추적 | Lifecycle |
|----------|---------------|----------|----------------|-----------|
| **User-only** | `user_id`만 | developer 개인 key | User level | user와 함께 삭제 |
| **Team service account** | `team_id`만 | production app 및 CI/CD | Team level | member 변경 후에도 유지 |
| **User + Team** | `user_id`와 `team_id` 모두 | team context 안의 user | User AND Team | user와 함께 삭제 |

**예제 시나리오:**
- local에서 test하는 developer에게는 **user-only key**를 사용합니다.
- employee가 떠나도 중단되면 안 되는 production application에는 **team service account key**를 사용합니다.
- team budget 안에서 개인별 책임 추적이 필요하면 **user + team key**를 사용합니다.

[Keys API reference](https://litellm-api.up.railway.app/#/key%20management)

---

## 역할 기반 access control(RBAC)

LiteLLM은 hierarchy 전반에 세분화된 RBAC를 제공합니다.

### Global proxy 역할(platform-wide)

| 역할 | 범위 | 권한 |
|------|-------|-------------|
| **Proxy Admin** | 전체 platform | org, team, user 생성. 모든 비용 조회. 전체 제어. |
| **Proxy Admin Viewer** | 전체 platform | 모든 데이터에 view-only access. 변경 불가. |
| **Internal User** | 자체 resource | own key 생성/삭제. own 비용 조회. |

### Organization/team 역할(scoped)

| 역할 | 범위 | 권한 |
|------|-------|-------------|
| **Org Admin** ✨ | 특정 organization | 자신의 org 안에서만 team 생성, user 추가, org 비용 조회. |
| **Team Admin** ✨ | 특정 team | 자신의 team 안에서만 team member, budget, key 관리. |

✨ = Premium Feature

### 팀원 권한

team admin은 일반 team member에 대해 세분화된 permission을 구성할 수 있습니다.

**Read-only**(default):
```json
["/key/info", "/key/health"]
```

**Key 생성 허용**:
```json
["/key/info", "/key/health", "/key/generate", "/key/update"]
```

**Full key management**:
```json
["/key/info", "/key/health", "/key/generate", "/key/update", "/key/delete", "/key/regenerate", "/key/block", "/key/unblock"]
```

[RBAC 자세히 보기](./access_control)

---

## 비용 추적 및 Cost Attribution

LiteLLM은 hierarchy를 따라 흐르는 다단계 비용 추적을 제공합니다.

### 계층형 비용 흐름

```
Organization Spend
    ├── Team 1 Spend
    │   ├── User A Spend
    │   │   ├── Key 1 Spend
    │   │   └── Key 2 Spend
    │   └── Service Account Spend
    │       └── Key 3 Spend
    └── Team 2 Spend
        └── User B Spend
            └── Key 4 Spend
```

### Budget enforcement

budget은 상속 관계를 포함해 모든 level에서 설정할 수 있습니다.

1. **Organization 예산**: `$10,000/month`
   - Team 1: `$6,000/month` (org limit 안)
     - User A: `$3,000/month` (팀 한도 안)
     - User B: `$3,000/month` (team limit 안)
   - Team 2: `$4,000/month` (org limit 안)

**Enforcement rule:**
- team budget은 organization budget을 초과할 수 없습니다.
- user budget은 team budget을 초과할 수 없습니다.
- 어떤 level이든 budget을 초과하면 request가 block됩니다.
- real-time tracking으로 overrun을 방지합니다.

[Budget 자세히 보기](./team_budgets)

---

## 일반적인 multi-tenant pattern

### 패턴 1: enterprise department

**시나리오**: 중앙화된 LLM 접근이 필요한 여러 department를 가진 large enterprise

**엔터프라이즈 설정**(Organizations 사용):
```
Platform (LiteLLM Instance)
├── Engineering Organization ✨
│   ├── Backend Team
│   ├── Frontend Team
│   └── ML Team
├── Marketing Organization ✨
│   ├── Content Team
│   └── Analytics Team
└── Sales Organization ✨
    ├── Sales Ops Team
    └── Customer Success Team
```

**Open source 대안**(Teams only):
```
Platform (LiteLLM Instance)
├── Engineering Backend Team
├── Engineering Frontend Team
├── Engineering ML Team
├── Marketing Content Team
├── Marketing Analytics Team
├── Sales Ops Team
└── Customer Success Team
```

**장점:**
- 각 department/team이 자체 budget을 관리합니다.
- department lead(org/team admin)가 자신의 team을 제어합니다.
- billing과 model access를 중앙화합니다.
- finance team이 department 간 비용 가시성을 확보합니다.

---

### 패턴 2: multi-customer SaaS

**시나리오**: 여러 customer에게 LLM-powered 기능을 제공하는 SaaS provider

**엔터프라이즈 설정**(Organizations 사용):
```
Platform (LiteLLM Instance)
├── Customer A Organization ✨
│   ├── Production Team (Service Accounts)
│   ├── Development Team
│   └── QA Team
├── Customer B Organization ✨
│   ├── Production Team (Service Accounts)
│   └── Development Team
└── Customer C Organization ✨
    └── Production Team (Service Accounts)
```

**Open source 대안**(Teams only):
```
Platform (LiteLLM Instance)
├── Customer A Production Team (Service Accounts)
├── Customer A Development Team
├── Customer A QA Team
├── Customer B Production Team (Service Accounts)
├── Customer B Development Team
└── Customer C Production Team (Service Accounts)
```

**장점:**
- customer/team 간 완전한 isolation
- customer/team별 billing 및 사용량 추적
- customer/team admin의 self-service 가능
- production service account key는 employee가 바뀐 뒤에도 유지

---

### 패턴 3: 환경 분리

**시나리오**: 여러 environment를 가진 단일 organization

```
Platform (LiteLLM Instance)
└── Company Organization
    ├── Production Team
    │   └── Service Account Keys (strict rate limits)
    ├── Staging Team
    │   └── Service Account Keys (moderate limits)
    └── Development Team
        └── User Keys (generous limits for testing)
```

**장점:**
- environment별 budget 분리
- 서로 다른 model access(production vs. development)
- development 사용량이 production budget에 영향을 주지 않도록 방지
- environment별 cost attribution 용이

---

## 권한 위임 및 self-service

LiteLLM의 핵심 장점 중 하나는 위임형 관리입니다.

### LiteLLM이 없을 때
```
Every team → Requests platform admin → Admin makes changes
```
❌ platform team에 bottleneck 발생  
❌ 느린 onboarding  
❌ 낮은 확장성  

### LiteLLM을 사용할 때
```
Proxy Admin → Creates org + org admin
Org Admin → Creates teams + team admins  
Team Admin → Manages their team independently
```
✅ 분산형 관리  
✅ 빠른 onboarding  
✅ 수천 명의 user까지 확장  

### Self-service 기능

**Team admin이 할 수 있는 일:**
- team member 추가/제거
- team member용 API key 생성
- team budget 업데이트(org limit 내)
- team member permission 구성
- team 사용량 및 비용 조회

**Org admin이 할 수 있는 일:**
- organization 안에 새 team 생성
- team admin 지정
- organization 전체 비용 조회
- 여러 team의 user 관리

**Platform admin이 할 수 있는 일:**
- organization 생성
- org admin 지정
- organization level policy 설정
- platform 전체 analytics 조회

---

## 확장성

LiteLLM architecture는 small team부터 enterprise 배포까지 확장됩니다.

### 소규모 팀(사용자 10-100명)
- 단일 organization
- 적은 수의 team(5-10)
- proxy admin이 모든 것을 관리

### 중간 규모(사용자 100-1,000명)
- 여러 organization
- 많은 team(50+)
- org admin이 team admin에게 위임

### 엔터프라이즈 (1,000+ users)
- 많은 organization(department/region)
- 수백 개의 team
- 완전히 위임된 admin structure
- 중앙화된 observability 및 billing

**주요 scalability 기능:**
- 성장해도 architecture 변경이 필요 없습니다.
- reliability를 위한 database backed(PostgreSQL) 구조
- horizontal scaling 지원
- 효율적인 비용 추적 및 logging

---

## Security 및 isolation

### Tenant isolation

각 tenant(organization)는 격리됩니다.
- ✅ 다른 organization의 데이터를 볼 수 없습니다.
- ✅ 다른 organization의 key에 접근할 수 없습니다.
- ✅ budget limit을 초과할 수 없습니다.
- ✅ allowed list에 없는 model에 접근할 수 없습니다.

### 인증 security

- platform admin용 master key
- scoped permission이 있는 virtual key
- SSO integration 지원
- JWT authentication
- IP allowlisting

### Audit 및 compliance

- 모든 API call을 user/team/org context와 함께 logging
- chargeback/showback을 위한 비용 추적
- admin action audit
- observability tool과 integration

[Security 자세히 보기](../data_security)

---

## 시작하기

:::info 엔터프라이즈 vs. Open Source 설정
아래 단계는 Organizations를 포함한 **전체 enterprise hierarchy**를 보여줍니다.

**open source**에서는 Step 1-2를 건너뛰고 **Step 3**(team 생성)부터 시작하세요. Teams는 Organizations 없이 top-level tenant boundary로 동작할 수 있습니다.
:::

### Step 1: Organizations 설정 ✨ 엔터프라이즈

첫 organization을 생성합니다.

```bash
curl --location 'http://0.0.0.0:4000/organization/new' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "organization_alias": "engineering_department",
        "models": ["gpt-4", "gpt-4o", "claude-3-5-sonnet"],
        "max_budget": 10000
    }'
```

### Step 2: Organization admin 추가 ✨ 엔터프라이즈

```bash
curl -X POST 'http://0.0.0.0:4000/organization/member_add' \
    -H 'Authorization: Bearer sk-1234' \
    -H 'Content-Type: application/json' \
    -d '{
        "organization_id": "org-123",
        "member": {
            "role": "org_admin",
            "user_id": "admin@company.com"
        }
    }'
```

### Step 3: Teams 생성 ✅ Open source

**엔터프라이즈:** organization admin이 자신의 organization 안에 team 생성  
**Open source:** proxy admin이 team을 직접 생성(`organization_id` 불필요)

```bash
# Enterprise: Org admin creates team in their organization
curl --location 'http://0.0.0.0:4000/team/new' \
    --header 'Authorization: Bearer sk-org-admin-key' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_alias": "ml_team",
        "organization_id": "org-123",
        "max_budget": 5000
    }'

# Open Source: Proxy admin creates team directly
curl --location 'http://0.0.0.0:4000/team/new' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "team_alias": "ml_team",
        "max_budget": 5000
    }'
```

### Step 4: Team admin 추가

```bash
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-org-admin-key' \
    -H 'Content-Type: application/json' \
    -d '{
        "team_id": "team-456",
        "member": {
            "role": "admin",
            "user_id": "team-lead@company.com"
        }
    }'
```

### Step 5: Team admin이 team 관리

```bash
# Team admin adds members
curl -X POST 'http://0.0.0.0:4000/team/member_add' \
    -H 'Authorization: Bearer sk-team-admin-key' \
    -H 'Content-Type: application/json' \
    -d '{
        "team_id": "team-456",
        "member": {
            "role": "user",
            "user_id": "developer@company.com"
        }
    }'

# Team admin creates keys for members
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-team-admin-key' \
    --header 'Content-Type: application/json' \
    --data '{
        "user_id": "developer@company.com",
        "team_id": "team-456"
    }'
```

---

## 사용 사례 예제

### 예제 1: chargeback model

**목표**: 각 business unit이 자신의 LLM 사용 비용을 부담

**설정:**
1. business unit별 organization 생성
2. allocated budget 기준으로 budget 설정
3. organization별 비용 추적
4. finance용 monthly report 생성

**결과**: finance가 정확한 attribution으로 각 department에 비용을 chargeback할 수 있습니다.

---

### 예제 2: customer-facing AI product

**목표**: isolation과 cost tracking을 갖춘 LLM capability를 customer에게 제공

**설정:**
1. customer별 organization 생성
2. production workload에 service account key 사용
3. customer organization별 비용 추적
4. customer tier별 rate limit 설정

**결과**: customer에게 정확히 billing하고, noisy neighbor를 방지하며, isolation을 유지합니다.

---

### 예제 3: development vs. production

**목표**: 서로 다른 policy로 development와 production environment 분리

**설정:**
1. "Development"와 "Production" team 생성
2. Development: 넉넉한 budget, 모든 model, user key
3. Production: 엄격한 예산, 승인된 모델만 허용, service account key
4. environment별 다른 rate limit

**결과**: developer는 production budget이나 reliability에 영향을 주지 않고 자유롭게 실험할 수 있습니다.

---

## 권장 사항

### 1. Organization 설계

- ✅ organization을 cost center 또는 customer에 매핑하세요.
- ✅ growth buffer가 있는 realistic budget을 설정하세요.
- ✅ organization마다 1-2명의 org admin을 지정하세요.
- ❌ 너무 많은 organization을 만들지 마세요(management overhead 증가).

### 2. Team structure

- ✅ 실제 working group과 team을 맞추세요.
- ✅ production에는 service account key를 사용하세요.
- ✅ team admin이 self-serve할 수 있을 만큼 permission을 부여하세요.
- ❌ single-user team을 만들지 마세요(대신 user-only key 사용).

### 3. Key management

- ✅ 설명적인 key name을 사용하세요.
- ✅ key를 정기적으로 rotate하세요.
- ✅ 사용하지 않는 key는 삭제하세요.
- ✅ use case에 맞는 key type을 사용하세요.
- ❌ user/team 간 key를 공유하지 마세요.

### 4. Budget management

- ✅ 여러 level(org -> team -> user)에 budget을 설정하세요.
- ✅ spend를 정기적으로 monitor하세요.
- ✅ budget exhaustion 전에 alert를 설정하세요.
- ❌ budget을 너무 빡빡하게 설정하지 마세요(legitimate usage가 block될 수 있음).

### 5. 권한 위임

- ✅ large organization에는 org admin을 지정하세요.
- ✅ active team에는 team admin을 지정하세요.
- ✅ team member permission을 적절히 구성하세요.
- ❌ 모든 사람을 proxy admin으로 만들지 마세요.

---

## Monitoring 및 관측성

LiteLLM은 포괄적인 monitoring을 제공합니다.

- **비용 추적**: org/team/user/key별 real-time spend
- **사용량 analytics**: request count, token usage, model usage
- **관리자 UI**: 모든 metric을 위한 visual dashboard
- **Logging**: tenant context가 포함된 detailed log
- **Alerting**: 예산 알림, rate limit 알림, 오류 알림

[Logging 자세히 보기](./logging)

---

## 다른 접근 방식과 비교

| 접근 방식 | 장점 | 단점 | LiteLLM 장점 |
|----------|------|------|-------------------|
| **tenant별 separate instance** | 강한 isolation | 높은 operational overhead, 비용 비효율 | single instance, 동일한 isolation, 90% cost reduction |
| **Single shared pool** | 단순한 setup | cost attribution 없음, access control 없음 | full attribution, granular access control |
| **API key prefix** | 기본 separation | manual tracking, hierarchy 없음, RBAC 없음 | automatic tracking, hierarchical, full RBAC |
| **External auth layer** | 유연함 | 복잡한 integration, 내장 예산 없음 | native integration, 내장 예산 제공 |

---

## FAQ

**Q: user가 여러 team에 속할 수 있나요?**  
A: 네. user는 여러 team의 member가 될 수 있고, team마다 다른 key를 가질 수 있습니다.

**Q: user가 떠나면 어떻게 되나요?**  
A: 사용자별 key는 삭제되지만 team service account key는 active 상태로 유지됩니다.

**Q: team budget이 organization budget을 초과할 수 있나요?**  
A: 아니요. system은 team budget이 organization budget을 초과하지 못하도록 enforce합니다.

**Q: cost tracking은 얼마나 granular한가요?**  
A: 모든 API call은 organization, team, user, key context와 함께 추적됩니다.

**Q: organization 없이 team만 둘 수 있나요?**  
A: 네. Teams는 **open source**에서 Organizations 없이 독립적으로 동작합니다. Organizations는 team 위에 추가 hierarchy layer를 더하는 **enterprise 기능**입니다.

**Q: hierarchy depth 제한이 있나요?**  
A: hierarchy는 Organization -> Team -> User -> Key(4 levels)입니다. 대부분의 use case를 포괄합니다.

**Q: flat structure에서 hierarchical structure로 어떻게 migration하나요?**  
A: organization과 team을 점진적으로 생성한 뒤 기존 user/key를 그 안으로 이동할 수 있습니다.

---

## 관련 문서

- [User Management Hierarchy](./user_management_heirarchy) - 시각적 hierarchy overview
- [Access Control (RBAC)](./access_control) - 자세한 role permission
- [Team Budgets](./team_budgets) - 예산 관리 가이드
- [가상 키](./virtual_keys) - API key management
- [관리자 UI](./ui) - management용 visual dashboard

---

## 요약

LiteLLM은 다음을 통해 multi-tenant architecture challenge를 해결합니다.

1. **계층형 구조**: Organizations -> Teams -> Users -> Keys
2. **Granular RBAC**: platform-wide 및 tenant-scoped role
3. **Cost attribution**: 모든 level의 비용 추적
4. **Delegation**: org admin과 team admin의 self-management
5. **Isolation**: 강한 tenant boundary
6. **Scalability**: 동일한 architecture로 10명부터 10,000명 이상까지 처리

### Open Source vs. 엔터프라이즈

**Open source**(Teams + Users + Keys):
- ✅ 기본 tenant boundary로 Teams 사용
- ✅ team admin이 자신의 team 관리
- ✅ team/user tracking이 포함된 virtual key
- ✅ team별 budget 및 rate limit
- ✅ 비용 추적 및 logging

**엔터프라이즈**(Organizations layer 추가):
- ✨ top-level tenant isolation을 위한 Organizations
- ✨ organization admin이 여러 team 관리
- ✨ organization-level budget 및 model access
- ✨ hierarchical delegation 및 reporting

따라서 LiteLLM은 다음에 적합합니다.
- ✅ 여러 department가 있는 enterprise
- ✅ 여러 customer를 가진 SaaS provider
- ✅ cost chargeback/showback이 필요한 organization
- ✅ self-service LLM access가 필요한 team
- ✅ 모든 multi-tenant LLM deployment

[LiteLLM Proxy로 시작하기 →](./quick_start)
