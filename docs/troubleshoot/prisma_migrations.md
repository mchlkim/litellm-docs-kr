# Prisma 마이그레이션 오류 문제 해결

LiteLLM 프록시 버전을 업그레이드하거나 다운그레이드할 때 자주 발생하는 Prisma 마이그레이션 문제와 해결 방법입니다.

LiteLLM 버전을 안전하게 되돌리는 전체 가이드는 **[안전한 롤백 가이드](rollback)**를 참조하세요.

## LiteLLM에서 Prisma 마이그레이션이 작동하는 방식

- LiteLLM은 [Prisma](https://www.prisma.io/)를 사용해 PostgreSQL 데이터베이스 스키마를 관리합니다.
- 마이그레이션 기록은 데이터베이스의 `_prisma_migrations` 테이블에서 추적됩니다.
- LiteLLM이 시작되면 `prisma migrate deploy`를 실행해 새 마이그레이션을 적용합니다.
- LiteLLM을 업그레이드하면 마지막으로 적용된 버전 이후 추가된 모든 마이그레이션이 적용됩니다.

## 일반적인 오류

### 1. `relation "X" does not exist`

**예제 오류:**

```
ERROR: relation "LiteLLM_DeletedTeamTable" does not exist
Migration: 20260116142756_update_deleted_keys_teams_table_routing_settings
```

**원인:** 일반적으로 버전 롤백 이후 발생합니다. `_prisma_migrations` 테이블에는 여전히 더 새 버전의 마이그레이션이 "적용됨"으로 기록되어 있지만, 실제 데이터베이스 테이블은 수정되었거나 삭제되었거나 완전히 생성되지 않았을 수 있습니다.

**해결 방법:**

#### 1단계 — 실패한 마이그레이션 항목 삭제 후 재시작

문제가 있는 마이그레이션을 기록에서 제거하여 다시 적용될 수 있도록 합니다.

```sql
-- View recent migrations
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 10;

-- Delete the failed migration entry
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<failed_migration_name>';
```

항목을 삭제한 뒤 LiteLLM을 재시작하세요. 시작 시 마이그레이션이 다시 적용됩니다.

<a id="step-2--if-that-doesnt-work-use-prisma-db-push"></a>

#### 2단계 — 그래도 해결되지 않으면 `prisma db push` 사용 {#db-push-warning}

마이그레이션 항목을 삭제하고 재시작해도 문제가 해결되지 않으면 스키마를 직접 동기화합니다.

> **경고:** Prisma schema가 데이터베이스에 존재하는 컬럼이나 테이블을 제거하는 경우 `prisma db push`는 **데이터 손실**을 유발할 수 있습니다. 반드시 최후의 수단으로만 사용하고, 먼저 데이터베이스 백업이 있는지 확인하세요.

```bash
DATABASE_URL="<your_database_url>" prisma db push
```

이 명령은 마이그레이션 기록을 우회하고 데이터베이스 스키마가 Prisma schema와 일치하도록 강제합니다.

---

### 2. `New migrations cannot be applied before the error is recovered from`

**원인:** 이전 마이그레이션이 실패했고(`_prisma_migrations`에 오류로 기록됨), Prisma는 해당 실패가 해결될 때까지 새 마이그레이션 적용을 거부합니다.

**해결 방법:**

1. 실패한 마이그레이션을 찾습니다.

```sql
SELECT migration_name, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
ORDER BY started_at DESC;
```

2. 실패한 항목을 삭제하고 LiteLLM을 재시작합니다.

```sql
DELETE FROM "_prisma_migrations"
WHERE migration_name = '<failed_migration_name>';
```

3. 그래도 해결되지 않으면 `prisma db push`를 사용합니다([위 경고](#db-push-warning) 참조, 먼저 데이터베이스를 백업하세요).

```bash
DATABASE_URL="<your_database_url>" prisma db push
```

---

### 3. 버전 롤백 이후 마이그레이션 상태 불일치

**원인:** 버전 X로 업그레이드해 새 마이그레이션이 적용된 뒤 버전 Y로 롤백하고, 이후 다시 업그레이드한 경우입니다. `_prisma_migrations` 테이블에 부분적으로 적용되었거나 더 이상 존재하지 않는 스키마 상태에 해당하는 마이그레이션 항목이 오래된 상태로 남아 있습니다.

**해결 방법:**

1. 마이그레이션 테이블에서 문제가 있는 항목을 확인합니다.

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at, logs
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 20;
```

2. 존재하면 안 되는 각 마이그레이션(예: 롤백하기 전 버전의 마이그레이션)에 대해 해당 항목을 삭제합니다.
     ```sql
     DELETE FROM "_prisma_migrations" WHERE migration_name = '<migration_name>';
     ```

3. LiteLLM을 재시작해 마이그레이션을 다시 실행합니다.

4. 그래도 해결되지 않으면 `prisma db push`를 사용합니다([위 경고](#db-push-warning) 참조, 먼저 데이터베이스를 백업하세요).

```bash
DATABASE_URL="<your_database_url>" prisma db push
```
