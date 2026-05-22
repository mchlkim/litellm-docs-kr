# LiteLLM Proxy 업그레이드(uv/venv)

가상 환경에서 uv로 설치한 LiteLLM Proxy를 업그레이드하는 가이드입니다.

:::info 중요
`litellm` 또는 `prisma` 명령을 실행하기 전에 항상 가상 환경을 활성화하세요. 이 가이드의 모든 명령은 활성화된 venv 안에서 작업한다고 가정합니다.
:::

## uv/venv 업그레이드 작동 방식

동기화 상태를 유지해야 하는 두 가지 요소가 있습니다.

1. **Prisma client** - DB와 통신하는 생성된 Python 코드
2. **DB schema** - PostgreSQL의 테이블/컬럼

uv로 업그레이드하면 `litellm-proxy-extras` 패키지에 새 `schema.prisma`와 `migrations/` 디렉터리가 포함됩니다. 하지만 Docker 이미지와 달리 `uv add`는 Prisma client를 자동으로 다시 생성하거나 마이그레이션을 실행하지 않습니다. 두 작업 모두 직접 수행해야 합니다.

## 업그레이드 워크플로(uv/venv)

### 1. 프록시 중지

실행 중인 LiteLLM proxy 인스턴스를 중지합니다.

### 2. (선택 사항) DB 백업

```bash
pg_dump -h <host> -U <user> -d <db> -F c -f backup_$(date +%Y%m%d).dump
```

### 3. 패키지 업그레이드

```bash
uv add 'litellm[proxy]==<version>'
```

### 4. Prisma client 다시 생성

```bash
prisma generate --schema <venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma
```

`<venv>`는 가상 환경 경로로, `<version>`은 Python 버전(예: `python3.11`, `python3.12`, `python3.13`)으로 바꾸세요.

### 5. DB 마이그레이션 적용

두 가지 옵션이 있습니다.

**옵션 A: 프록시만 시작**(가장 간단)

프록시는 시작 시 `prisma migrate deploy`를 자동으로 실행하여 새 마이그레이션을 적용합니다.

먼저 가상 환경을 활성화합니다.

```bash
source <venv>/bin/activate
```

그다음 프록시를 시작합니다.

```bash
litellm --config your_config.yaml --port 4000
```

**옵션 B: 시작 전에 수동 실행**

먼저 가상 환경을 활성화합니다.

```bash
source <venv>/bin/activate
```

그다음 명시적인 schema 경로로 마이그레이션을 실행합니다.

```bash
prisma migrate deploy --schema <venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma
```

`<venv>`는 가상 환경 경로로, `<version>`은 Python 버전(예: `python3.11`, `python3.12`, `python3.13`)으로 바꾸세요.

### 6. 프록시 시작

위의 옵션 B를 사용했다면 이제 프록시를 시작합니다(venv는 계속 활성화된 상태여야 함).

```bash
litellm --config your_config.yaml --port 4000
```

## 마이그레이션 확인 방법

> **참고:** `<schema-path>` = `<venv>/lib/python<version>/site-packages/litellm_proxy_extras/schema.prisma`

### 마이그레이션 적용 전: 변경 내용 미리 보기

새 `schema.prisma`를 사용할 수 있도록 먼저 `uv add 'litellm[proxy]==<version>'`를 실행하세요(3단계).

```bash
prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema-datamodel <schema-path> \
  --script
```

### 마이그레이션 적용 후: 상태 확인

```bash
prisma migrate status --schema <schema-path>
```

모든 마이그레이션에는 `finished_at` 타임스탬프가 있어야 하며 `rolled_back_at`은 없어야 합니다.

## 알아야 할 핵심 사항

- **`DISABLE_SCHEMA_UPDATE=true`** 환경 변수는 시작 시 자동 마이그레이션을 방지합니다. 전체를 수동으로 제어하려는 경우 유용합니다.

- **`prisma db push`**는 최후의 수단입니다. 마이그레이션 기록을 우회하고 DB가 스키마와 일치하도록 강제로 동기화합니다. 모든 변경이 추가형(새 컬럼/테이블)인 경우에는 안전하지만, 항상 백업을 준비하세요.

- **`litellm_proxy_extras` 안의 `schema.prisma`가 기준 파일입니다.** 다른 버전이나 git 저장소의 파일이 아니라 항상 이 파일을 사용하세요.

## 문제 해결

마이그레이션 오류가 발생하면 [Prisma Migration 문제 해결 가이드](./prisma_migrations)를 참고하세요.
