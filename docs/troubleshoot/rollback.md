# 안전한 롤백 가이드

이 가이드는 LiteLLM Proxy 배포를 이전 버전으로 안전하게 롤백하는 절차를 설명합니다.

이전 [stable release](https://github.com/BerriAI/litellm/releases)로 롤백하는 것을 권장합니다. Stable release는 매주 나오며 `main-v<VERSION>-stable` 태그 규칙을 따릅니다(예: `main-v1.77.2-stable`).

## 1. 롤백 범위 결정

진행하기 전에 롤백하는 이유를 확인합니다.
- **애플리케이션 로직 오류**: 데이터베이스 스키마는 유지하고 코드 변경만 되돌립니다.
- **데이터베이스 마이그레이션 실패**: 데이터베이스 스키마 업데이트가 포함된 변경을 되돌립니다.
- **성능 회귀**: 안정적인 것으로 확인된 버전으로 되돌립니다.

## 2. 데이터베이스 백업

> **롤백 전에는 항상 백업하세요.** 변경을 적용하기 전에 데이터베이스 snapshot 또는 dump를 생성합니다. 롤백 중 문제가 발생할 때 사용할 안전장치입니다.

```bash
# PostgreSQL example
pg_dump -h <host> -U <user> -d <database> -F c -f litellm_backup_$(date +%Y%m%d_%H%M%S).dump
```

관리형 데이터베이스(예: AWS RDS, GCP Cloud SQL)를 사용 중이라면 클라우드 콘솔에서 snapshot을 생성하세요.

## 3. 롤백 전 점검

되돌리기 전에 다음 항목을 확인합니다.

- **`LITELLM_SALT_KEY`**: 롤백 중 이 값을 **변경하지 마세요**. 데이터베이스에 저장된 LLM API Key 자격 증명을 암호화/복호화하는 데 사용됩니다. 변경하면 기존 자격 증명을 읽을 수 없게 됩니다. [프로덕션 권장 사항](../proxy/prod)을 참고하세요.
- **`config.yaml`**: 새 버전에만 있는 설정을 추가했다면 이전 버전이 이를 인식하지 못할 수 있습니다. 설정을 검토하고 롤백하려는 버전에서 도입된 설정은 제거하거나 주석 처리하세요.
- **`DISABLE_SCHEMA_UPDATE`**: pod에서 `DISABLE_SCHEMA_UPDATE=true`와 함께 [마이그레이션용 Helm PreSync hook](../proxy/prod)을 사용한다면 재시작 시 마이그레이션이 자동 실행되지 **않습니다**. 마이그레이션 정리를 수동으로 처리하거나(5단계 참고), 이전 chart 버전을 대상으로 PreSync hook을 다시 실행해야 합니다.

## 4. 애플리케이션 버전 되돌리기

배포를 이전 stable Docker image 또는 Helm chart 버전으로 되돌립니다.

### Docker
배포 manifest(예: K8s Deployment, Docker Compose)를 이전 버전을 사용하도록 업데이트합니다.
```yaml
# Example: Reverting to the previous stable release
image: docker.litellm.ai/berriai/litellm:main-v<VERSION>-stable
```

사용 가능한 전체 image는 [여기](https://github.com/orgs/BerriAI/packages)에서 확인하세요.

### Helm
Helm으로 배포했다면 `helm rollback`을 사용합니다.
```bash
helm rollback <release-name> [revision-number]
```

## 5. 데이터베이스 마이그레이션 처리

특정 마이그레이션이 없던 버전으로 롤백하는 경우, 데이터베이스의 마이그레이션 상태를 정리해야 할 수 있습니다.

> LiteLLM은 프로덕션에서 `prisma migrate deploy`를 사용합니다(`USE_PRISMA_MIGRATE=True`로 활성화). 마이그레이션이 일부만 실패했거나 더 오래된 스키마를 기대하는 코드로 되돌리는 경우, `_prisma_migrations` 테이블의 마이그레이션 이력을 정리해야 합니다. [프로덕션 권장 사항](../proxy/prod)을 참고하세요.

### 옵션 A — 오래된 마이그레이션 항목 삭제(권장)

PostgreSQL 데이터베이스에 연결하고 롤백 대상 버전에서 생성된 마이그레이션 항목을 제거합니다. 이렇게 하면 나중에 다시 업그레이드할 때 LiteLLM이 해당 마이그레이션을 깔끔하게 다시 적용할 수 있습니다.

```sql
-- View recent migrations
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 10;

-- Delete migration entries from the version you are rolling back from
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<migration_name_from_newer_version>';
```

항목을 삭제한 뒤 LiteLLM을 재시작합니다. 시작 시 해당 버전에 맞는 올바른 마이그레이션을 다시 적용합니다.

> **참고:** pod에 `DISABLE_SCHEMA_UPDATE=true`가 설정되어 있으면 마이그레이션이 자동 실행되지 않습니다. 임시로 `false`로 설정하거나, 이전 버전을 대상으로 Helm PreSync migration job을 다시 실행해야 합니다.

### 옵션 B — `prisma migrate resolve` 사용(CLI 접근 가능 시)

Prisma CLI에 접근할 수 있다면(예: 로컬 개발 환경 또는 `litellm-proxy-extras` 패키지가 설치된 debug container):

```bash
DATABASE_URL="<your_database_url>" prisma migrate resolve --rolled-back "<migration_name>"
```

> **참고:** 이 방법은 환경에서 Prisma CLI를 사용할 수 있어야 합니다(`prisma-client-py`로 설치). CLI 접근이 없다면(예: 실행 중인 container에 shell 접근 불가) 대신 **옵션 A**(직접 SQL)를 사용하세요.

### 자동 복구 로직
LiteLLM 내부 `ProxyDBManager`는 idempotent migration 처리를 자동으로 시도합니다. 데이터베이스 변경이 새 column 또는 table 추가처럼 additive한 경우에는, 버전을 롤백하고 프록시를 재시작하는 것만으로 충분한 경우가 많습니다.

## 6. 검증 체크리스트

롤백 후 시스템 상태를 확인합니다.

- [ ] **Health 엔드포인트**: `/health` 엔드포인트가 `200 OK`를 반환하는지 확인합니다.
- [ ] **로그 확인**: Prisma 오류가 없는지 확인합니다. 로그에서 `relation "..." does not exist`, `column "..." does not exist`, `prisma migrate` 실패를 찾습니다.
- [ ] **비용 추적**: 테스트 completion을 실행하고 지출이 `LiteLLM_SpendLogs` 테이블에 기록되는지 확인합니다.
- [ ] **Billing(Lago)**: Lago를 billing에 사용한다면(예: Lago → Stripe), 프록시 로그에서 `Logged Lago Object`를 확인해 usage event가 전송되는지 검증합니다.
- [ ] **상태 일관성**: Redis를 caching 또는 rate limiting에 사용하고 새 버전에서 cache key 구조가 변경되었다면 cache 삭제를 고려합니다.
- [ ] **관리자 UI**: 관리자 UI가 로드되고 key와 team의 올바른 데이터를 표시하는지 확인합니다.

## 7. 문제 해결

### "New migrations cannot be applied" 오류
롤백 후 이 오류가 보인다면 데이터베이스에 "failed" 상태의 마이그레이션이 있다는 뜻입니다.
1. 실패한 마이그레이션 이름을 확인합니다(5단계의 SQL 쿼리 참고).
2. `_prisma_migrations`에서 실패한 항목을 삭제합니다.
3. 프록시를 재시작합니다.

### "relation X does not exist" 오류
이는 일반적으로 `_prisma_migrations`에는 마이그레이션 항목이 있지만 실제 table/column이 생성되지 않았거나 삭제되었음을 의미합니다.
1. 오래된 마이그레이션 항목을 삭제합니다.
2. LiteLLM을 재시작해 마이그레이션을 다시 실행하게 합니다.

Prisma 오류에 대한 자세한 내용은 [Prisma Migrations 문제 해결](prisma_migrations)을 참고하세요.
