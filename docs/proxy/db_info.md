# DB에 저장되는 항목

LiteLLM Proxy는 PostgreSQL database를 사용해 여러 정보를 저장합니다. DB가 사용되는 주요 기능은 다음과 같습니다.
- 가상 키, 조직, 팀, 사용자, 예산 등(`Virtual Keys`, `Organizations`, `Teams`, `Users`, `Budgets`)
- 요청별 사용량 추적

## DB Schema 링크

전체 DB Schema는 [여기](https://github.com/BerriAI/litellm/blob/main/schema.prisma)에서 확인할 수 있습니다.

## DB Tables

### 조직, 팀, 사용자, 최종 사용자

| 테이블 이름 | 설명 | 행 삽입 빈도 |
|------------|-------------|---------------------|
| LiteLLM_OrganizationTable | Organization 수준 설정을 관리합니다. Organization spend, model access, metadata를 추적하고 budget configuration 및 team과 연결합니다. | Low |
| LiteLLM_TeamTable | Organization 내부의 team 수준 설정을 처리합니다. Team member, admin, role을 관리하고 team별 budget, rate limit, model access를 제어합니다. | Low |
| LiteLLM_UserTable | 사용자 정보와 설정을 저장합니다. 개별 user spend, model access, rate limit을 추적하고 user role 및 team membership을 관리합니다. | Low |
| LiteLLM_EndUserTable | End-user 설정을 관리합니다. Model access와 regional requirement를 제어하고 end-user spend를 추적합니다. | Low |
| LiteLLM_TeamMembership | 사용자의 team 참여를 추적합니다. Team별 user budget과 spend를 관리합니다. | Low |
| LiteLLM_OrganizationMembership | Organization 내 user role을 관리합니다. Organization별 user permission과 spend를 추적합니다. | Low |
| LiteLLM_InvitationLink | User invitation을 처리합니다. Invitation status와 expiration을 관리하고 누가 invitation을 만들고 수락했는지 추적합니다. | Low |
| LiteLLM_UserNotifications | Model access request를 처리합니다. Model access에 대한 user request와 approval status를 추적합니다. | Low |

### 인증

| 테이블 이름 | 설명 | 행 삽입 빈도 |
|------------|-------------|---------------------|
| LiteLLM_VerificationToken | Virtual Key와 권한을 관리합니다. Token별 budget, rate limit, model access를 제어하고 key별 spend와 metadata를 추적합니다. | **Medium** - 모든 Virtual Key 저장 |

### Model(LLM) 관리

| 테이블 이름 | 설명 | 행 삽입 빈도 |
|------------|-------------|---------------------|
| LiteLLM_ProxyModelTable | Model configuration을 저장합니다. 사용 가능한 model과 parameter를 정의하고 model별 정보와 설정을 포함합니다. | Low - 설정만 저장 |

### Budget 관리

| 테이블 이름 | 설명 | 행 삽입 빈도 |
|------------|-------------|---------------------|
| LiteLLM_BudgetTable | Organizations, keys, end users에 대한 budget 및 rate limit configuration을 저장합니다. Max budget, soft budget, TPM/RPM limit, model별 budget을 추적하고 budget duration과 reset timing을 처리합니다. | Low - 설정만 저장 |


### Tracking 및 Logging

| 테이블 이름 | 설명 | 행 삽입 빈도 |
|------------|-------------|---------------------|
| LiteLLM_SpendLogs | 모든 API request의 상세 로그입니다. Token usage, spend, timing 정보를 기록하고 어떤 model과 key가 사용되었는지 추적합니다. | **Medium - 일정 주기로 실행되는 batch process** |
| LiteLLM_AuditLog | System configuration 변경 사항을 추적합니다. 누가 무엇을 변경했는지 기록하고 teams, users, models 업데이트 이력을 유지합니다. | **기본값 Off**, **High - entity가 변경될 때마다 실행** |

## `LiteLLM_SpendLogs` 비활성화

`proxy_config.yaml` 파일의 `general_settings` 섹션에서 `disable_spend_logs`와 `disable_error_logs`를 `True`로 설정하면 spend_logs와 error_logs를 비활성화할 수 있습니다.

```yaml
general_settings:
  disable_spend_logs: True   # DB에 spend logs 쓰기 비활성화
  disable_error_logs: True   # DB에 error logs 쓰기만 비활성화. `disable_spend_logs: True`가 아니면 일반 spend logs는 계속 기록됨
```

### 이 로그를 비활성화하면 어떤 영향이 있나요?

Spend logs를 비활성화하는 경우(`disable_spend_logs: True`):
- LiteLLM UI에서 사용량을 **볼 수 없습니다**.
- s3, Prometheus, Langfuse 등 사용 중인 다른 logging integration에서는 cost metric을 **계속 볼 수 있습니다**.

Error logs를 비활성화하는 경우(`disable_error_logs: True`):
- LiteLLM UI에서 Errors를 **볼 수 없습니다**.
- 애플리케이션 로그와 사용 중인 다른 logging integration에서는 error log를 **계속 볼 수 있습니다**.


## Database 마이그레이션

Database를 마이그레이션해야 하는 경우 서비스 연속성과 무중단을 보장하려면 다음 table을 복사해야 합니다.


| 테이블 이름 | 설명 | 
|------------|-------------|
| LiteLLM_VerificationToken | 기존 virtual key가 계속 동작하도록 하려면 **필수** |
| LiteLLM_UserTable | 기존 virtual key가 계속 동작하도록 하려면 **필수** |
| LiteLLM_TeamTable | Teams를 마이그레이션하려면 **필수** |
| LiteLLM_TeamMembership | Team member budget을 마이그레이션하려면 **필수** |
| LiteLLM_BudgetTable | 기존 budgeting setting을 마이그레이션하려면 **필수** |
| LiteLLM_OrganizationTable | DB에서 Organizations를 사용하는 경우에만 마이그레이션하는 **선택 항목** |
| LiteLLM_OrganizationMembership | DB에서 Organizations를 사용하는 경우에만 마이그레이션하는 **선택 항목** | 
| LiteLLM_ProxyModelTable | LLM을 DB에 저장하는 경우(즉 `STORE_MODEL_IN_DB=True`를 설정한 경우)에만 마이그레이션하는 **선택 항목** |
| LiteLLM_SpendLogs | LiteLLM UI에서 historical data가 필요한 경우에만 마이그레이션하는 **선택 항목** |
| LiteLLM_ErrorLogs | LiteLLM UI에서 historical data가 필요한 경우에만 마이그레이션하는 **선택 항목** |
