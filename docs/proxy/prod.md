import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# ⚡ Production 권장 사항

## 1. 이 config.yaml 사용
Production에서는 자체 LLM 설정과 함께 이 `config.yaml`을 사용하세요.

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings:
  master_key: sk-1234      # enter your own master key, ensure it starts with 'sk-'
  alerting: ["slack"]      # Setup slack alerting - get alerts on LLM exceptions, Budget Alerts, Slow LLM Responses
  proxy_batch_write_at: 60 # Batch write spend updates every 60s
  database_connection_pool_limit: 10 # connection pool limit per worker process. Total connections = limit × workers × instances. Calculate: MAX_DB_CONNECTIONS / (instances × workers). Default: 10.

:::warning
**Multiple instances:** If running multiple LiteLLM instances (e.g., Kubernetes pods), remember each instance multiplies your total connections. Example: 3 instances × 4 workers × 10 connections = 120 total connections.
:::

  # OPTIONAL Best Practices
  disable_error_logs: True # turn off writing LLM Exceptions to DB
  allow_requests_on_db_unavailable: True # Only USE when running LiteLLM on your VPC. Allow requests to still be processed even if the DB is unavailable. We recommend doing this if you're running LiteLLM on VPC that cannot be accessed from the public internet.

litellm_settings:
  request_timeout: 600    # raise Timeout error if call takes longer than 600 seconds. Default value is 6000seconds if not set
  set_verbose: False      # Switch off Debug Logging, ensure your logs do not have any debugging on
  json_logs: true         # Get debug logs in json format
```

환경 변수에 Slack webhook URL을 설정합니다.
```shell
export SLACK_WEBHOOK_URL="example-slack-webhook-url"
```

FASTAPI의 기본 info log를 끕니다.
```bash
export LITELLM_LOG="ERROR"
```

:::info

도움이 필요하거나 전담 지원을 원한다면 [여기](https://enterprise.litellm.ai/demo)에서 founder에게 문의하세요.

:::


## 2. 권장 머신 사양

Production에서 최적의 성능을 위해 다음 최소 머신 사양을 권장합니다.

| 리소스 | 권장 값 |
|----------|------------------|
| CPU      | 4 vCPU           |
| Memory   | 8 GB RAM         |

이 사양은 다음을 제공합니다.
- 동시 요청을 처리하기에 충분한 compute 성능
- 요청 처리와 caching에 필요한 적절한 메모리


## 3. Kubernetes에서 Uvicorn Worker 수를 CPU 수와 맞추기 [권장 CMD]

다음 Docker `CMD`를 사용하세요. Uvicorn worker 수를 pod의 CPU 수에 자동으로 맞춰 각 worker가 하나의 core를 효율적으로 사용하게 하며, 더 나은 throughput과 안정적인 latency를 제공합니다.

```shell
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "$(nproc)"]
```

> **선택 사항:** 지속 부하에서 메모리가 점진적으로 증가한다면, 일정 요청 수 이후 worker를 재시작해 leak 영향을 줄이는 방안을 고려하세요.
> CLI 또는 환경 변수로 설정할 수 있습니다.

```shell
# CLI
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "$(nproc)", "--max_requests_before_restart", "10000"]

# or ENV (for deployment manifests / containers)
export MAX_REQUESTS_BEFORE_RESTART=10000
```

> **팁:** `--max_requests_before_restart`를 사용할 때는 `--run_gunicorn` flag가 더 안정적이고 성숙한 선택입니다. Uvicorn 구현 대신 Gunicorn의 검증된 worker recycling 메커니즘을 사용하기 때문입니다.

```shell
# Use Gunicorn for more stable worker recycling
CMD ["--port", "4000", "--config", "./proxy_server_config.yaml", "--num_workers", "$(nproc)", "--run_gunicorn", "--max_requests_before_restart", "10000"]
```


## 4. Redis는 `redis_url`이 아니라 `port`, `host`, `password` 사용

Redis를 사용한다면 `redis_url`을 사용하지 마세요. Redis port, host, password 파라미터 사용을 권장합니다.

`redis_url`은 80 RPS 더 느립니다.

이 문제는 아직 조사 중입니다. 진행 상황은 [여기](https://github.com/BerriAI/litellm/issues/3188)에서 확인할 수 있습니다.

### Redis 버전 요구 사항

| 구성 요소 | 최소 버전 |
|-----------|-----------------|
| Redis     | 7.0+            |

Production에서는 다음 설정을 권장합니다.

```yaml
router_settings:
  routing_strategy: simple-shuffle # (default) - recommended for best performance
  # redis_url: "os.environ/REDIS_URL"
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

litellm_settings:
  cache: True
  cache_params:
    type: redis
    host: os.environ/REDIS_HOST
    port: os.environ/REDIS_PORT
    password: os.environ/REDIS_PASSWORD
```

> **WARNING**
**사용량 기반 routing은 성능 영향 때문에 production에 권장하지 않습니다.** 트래픽이 많은 환경에서는 최적의 성능을 위해 `simple-shuffle`(기본값)을 사용하세요.

## 5. Disable 'load_dotenv'

`export LITELLM_MODE="PRODUCTION"`을 설정합니다.

이 설정은 로컬 `.env`에서 환경 자격 증명을 자동으로 로드하는 `load_dotenv()` 기능을 비활성화합니다.

## 6. VPC에서 LiteLLM 실행 시 DB 사용 불가 상태를 graceful하게 처리

LiteLLM을 VPC에서 실행하고 public internet에서 접근할 수 없는 경우, database가 일시적으로 사용할 수 없더라도 요청 처리가 계속되도록 graceful degradation을 활성화할 수 있습니다.


**WARNING: public internet에서 접근할 수 없는 VPC에서 LiteLLM을 실행하는 경우에만 이 설정을 사용하세요.**

#### 설정

```yaml showLineNumbers title="litellm config.yaml"
general_settings:
  allow_requests_on_db_unavailable: True
```

#### 예상 동작

`allow_requests_on_db_unavailable`이 `true`로 설정되면 LiteLLM은 오류를 다음과 같이 처리합니다.

| 오류 유형 | 예상 동작 | 세부 정보 |
|---------------|-------------------|----------------|
| Prisma Errors | ✅ 요청 허용 | LiteLLM이 사용하는 ORM인 Prisma를 통해 발생하는 DB connection reset 또는 DB rejection 같은 문제를 포함합니다. |
| Httpx Errors | ✅ 요청 허용 | database에 접근할 수 없을 때 발생하며, DB 장애 중에도 요청이 계속 진행되도록 합니다. |
| Pod Startup Behavior | ✅ Pod가 그대로 시작됨 | database가 중단되었거나 접근할 수 없어도 LiteLLM Pod가 시작되어 배포의 uptime 보장을 높입니다. |
| Health/Readiness Check | ✅ 항상 200 OK 반환 | database를 사용할 수 없어도 pod가 운영 상태를 유지하도록 `/health/readiness` endpoint가 200 OK status를 반환합니다. |
| LiteLLM Budget Errors 또는 Model Errors | ❌ 요청 차단 | DB에는 접근 가능하지만 authentication token이 유효하지 않거나, 접근 권한이 없거나, budget limit을 초과한 경우 발생합니다. |


[Database가 어디에 사용되는지 더 보기](db_info)

## 7. Database Migration에 Helm PreSync Hook 사용 [BETA] {#7-use-helm-presync-hook-for-database-migrations-beta}

하나의 service만 database migration을 관리하도록 [Database Migrations용 Helm PreSync hook](https://github.com/BerriAI/litellm/blob/main/deploy/charts/litellm-helm/templates/migrations-job.yaml)을 사용하세요. 이 방식은 `helm upgrade` 또는 `helm install` 중 migration이 처리되도록 하고, LiteLLM pod에서는 migration을 명시적으로 비활성화합니다.


1. **Helm PreSync Hook**:
   - Helm PreSync hook은 배포 중 database migration을 실행하도록 chart에 구성되어 있습니다.
   - hook은 항상 `DISABLE_SCHEMA_UPDATE=false`를 설정해 migration이 안정적으로 실행되도록 합니다.
  
  ArgoCD에서 `values.yaml`에 설정할 reference 설정입니다.

  ```yaml
  db:
    useExisting: true # use existing Postgres DB
    url: postgresql://ishaanjaffer0324:... # url of existing Postgres DB
  ```

2. **LiteLLM Pods**:
   - LiteLLM pod configuration에서 `DISABLE_SCHEMA_UPDATE=true`를 설정해 pod가 migration을 실행하지 않도록 합니다.
   
   LiteLLM pod configuration 예시:
   ```yaml
   env:
     - name: DISABLE_SCHEMA_UPDATE
       value: "true"
   ```


## 8. LiteLLM Salt Key 설정 {#8-set-litellm-salt-key}

DB를 사용할 계획이라면 DB 내 변수의 암호화/복호화를 위한 salt key를 설정하세요.

모델을 추가한 뒤에는 이 값을 변경하지 마세요. LLM API Key 자격 증명을 암호화/복호화하는 데 사용됩니다.

LiteLLM salt key에 사용할 random hash는 https://1password.com/password-generator/ password generator로 생성하는 것을 권장합니다.

```bash
export LITELLM_SALT_KEY="sk-1234"
```

[**See Code**](https://github.com/BerriAI/litellm/blob/036a6821d588bd36d170713dcf5a72791a694178/litellm/proxy/common_utils/encrypt_decrypt_utils.py#L15)


## 9. `prisma migrate deploy` 사용 {#9-use-prisma-migrate-deploy}

Production에서 LiteLLM 버전 간 DB migration을 처리할 때 사용하세요.

<Tabs>
<TabItem value="env" label="ENV">

```bash
USE_PRISMA_MIGRATE="True"
```

</TabItem>

<TabItem value="cli" label="CLI">

```bash
litellm
```

</TabItem>
</Tabs>

장점:

`migrate deploy` command는 다음과 같이 동작합니다.

- 이미 적용된 migration이 migration history에서 누락되어도 warning을 발생시키지 **않습니다**.
- drift를 감지하지 **않습니다**. 예: hotfix 때문에 production database schema가 migration history의 최종 상태와 다른 경우.
- database를 reset하거나 Prisma Client 같은 artifact를 생성하지 **않습니다**.
- shadow database에 의존하지 **않습니다**.


### LiteLLM은 production에서 DB migration을 어떻게 처리하나요?

1. 새 migration file이 `litellm-proxy-extras` package에 작성됩니다. [전체 보기](https://github.com/BerriAI/litellm/tree/main/litellm-proxy-extras/litellm_proxy_extras/migrations)

2. core `litellm` pip package가 새 `litellm-proxy-extras` package를 가리키도록 업데이트됩니다. 이를 통해 이전 버전의 LiteLLM은 계속 이전 migration을 사용합니다. [코드 보기](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/pyproject.toml#L58)

3. LiteLLM을 새 버전으로 업그레이드하면 migration file이 database에 적용됩니다. [코드 보기](https://github.com/BerriAI/litellm/blob/52b35cd8093b9ad833987b24f494586a1e923209/litellm-proxy-extras/litellm_proxy_extras/utils.py#L42)


### 읽기 전용 파일 시스템 {#read-only-file-system}

`readOnlyRootFilesystem: true`로 LiteLLM을 실행하는 것은 container process가 root filesystem에 쓰지 못하게 하는 Kubernetes 보안 best practice입니다. LiteLLM은 이 구성을 완전히 지원합니다.

#### Permission Error 빠른 해결

`Permission denied` error가 보인다면 LiteLLM pod가 read-only file system으로 실행 중이라는 뜻입니다. LiteLLM에는 다음 writable directory가 필요합니다.
- **Database migrations**: `LITELLM_MIGRATION_DIR="/path/to/writable/directory"` 설정
- **관리자 UI**: `LITELLM_UI_PATH="/path/to/writable/directory"` 설정
- **UI assets/logos**: `LITELLM_ASSETS_PATH="/path/to/writable/directory"` 설정

#### 완전한 Read-Only Filesystem 설정(Kubernetes)

보안을 강화한 production 배포에는 다음 구성을 사용하세요.

**옵션 1: InitContainer와 EmptyDir Volume 사용(권장)**

이 방식은 pod 시작 시 Docker image 안의 pre-built UI를 writable emptyDir volume으로 복사합니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-proxy
spec:
  template:
    spec:
      initContainers:
        - name: setup-ui
          image: ghcr.io/berriai/litellm:main-stable
          command:
            - sh
            - -c
            - |
              cp -r /var/lib/litellm/ui/* /app/var/litellm/ui/ && \
              cp -r /var/lib/litellm/assets/* /app/var/litellm/assets/
          volumeMounts:
            - name: ui-volume
              mountPath: /app/var/litellm/ui
            - name: assets-volume
              mountPath: /app/var/litellm/assets

      containers:
        - name: litellm
          image: ghcr.io/berriai/litellm:main-stable
          env:
            - name: LITELLM_NON_ROOT
              value: "true"
            - name: LITELLM_UI_PATH
              value: "/app/var/litellm/ui"
            - name: LITELLM_ASSETS_PATH
              value: "/app/var/litellm/assets"
            - name: LITELLM_MIGRATION_DIR
              value: "/app/migrations"
            - name: PRISMA_BINARY_CACHE_DIR
              value: "/app/cache/prisma-python/binaries"
            - name: XDG_CACHE_HOME
              value: "/app/cache"
          securityContext:
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 101
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: config
              mountPath: /app/config.yaml
              subPath: config.yaml
              readOnly: true
            - name: ui-volume
              mountPath: /app/var/litellm/ui
            - name: assets-volume
              mountPath: /app/var/litellm/assets
            - name: cache
              mountPath: /app/cache
            - name: migrations
              mountPath: /app/migrations

      volumes:
        - name: config
          configMap:
            name: litellm-config
        - name: ui-volume
          emptyDir:
            sizeLimit: 100Mi
        - name: assets-volume
          emptyDir:
            sizeLimit: 10Mi
        - name: cache
          emptyDir:
            sizeLimit: 500Mi
        - name: migrations
          emptyDir:
            sizeLimit: 64Mi
```

**옵션 2: UI 없이 실행(API-only 배포)**

Admin UI가 필요 없다면 최소 구성으로 실행할 수 있습니다.

```yaml
env:
  - name: LITELLM_NON_ROOT
    value: "true"
  - name: LITELLM_MIGRATION_DIR
    value: "/app/migrations"
securityContext:
  readOnlyRootFilesystem: true
```

Proxy는 UI 관련 warning을 log로 남기지만 API endpoint는 정상 동작합니다.

#### Read-Only Filesystem용 환경 변수

| 변수 | 목적 | 기본값 |
|----------|---------|---------|
| `LITELLM_UI_PATH` | 관리자 UI directory | `/var/lib/litellm/ui` (Docker) |
| `LITELLM_ASSETS_PATH` | UI assets/logos | `/var/lib/litellm/assets` (Docker) |
| `LITELLM_MIGRATION_DIR` | DB migration | package directory |
| `PRISMA_BINARY_CACHE_DIR` | Prisma 바이너리 cache | system default |
| `XDG_CACHE_HOME` | 일반 cache directory | system default |

#### 중요 참고 사항

1. **Migrations**: 항상 `LITELLM_MIGRATION_DIR`을 writable emptyDir path로 설정하세요.
2. **Prisma Cache**: `PRISMA_BINARY_CACHE_DIR`와 `XDG_CACHE_HOME`을 writable path로 설정하세요.
3. **Server Root Path**: custom `server_root_path`를 사용하는 경우, read-only filesystem에서는 proxy가 runtime에 file을 수정할 수 없으므로 Dockerfile에서 UI file을 미리 처리해야 합니다.
4. **Automatic Detection**: UI에 `.litellm_ui_ready` marker file(공식 Docker image가 생성)이 있으면 pre-restructured 상태로 자동 감지됩니다.

## 기타
### Production 예상 성능

Benchmark는 [여기](../benchmarks#performance-metrics)에서 확인하세요.

### Debugging log가 꺼져 있는지 확인

Proxy server log에는 다음 수준의 세부 정보만 보여야 합니다.
```shell
# INFO:     192.168.2.205:11774 - "POST /chat/completions HTTP/1.1" 200 OK
# INFO:     192.168.2.205:34717 - "POST /chat/completions HTTP/1.1" 200 OK
# INFO:     192.168.2.205:29734 - "POST /chat/completions HTTP/1.1" 200 OK
```
