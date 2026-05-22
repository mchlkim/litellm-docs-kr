# Pod 간 공유 Health Check 상태

이 기능은 여러 LiteLLM 프록시 Pod 사이에서 health check를 조율해 중복 health check를 피하고 비용을 줄입니다.

## 개요

여러 LiteLLM 프록시 Pod를 실행할 때(예: Kubernetes), 각 Pod는 보통 모든 모델에 대해 독립적인 health check를 수행합니다. 이 방식은 다음 문제를 만들 수 있습니다.

- Pod 간 **중복 health check**
- 비싼 모델(예: Gemini 2.5-pro)에 대한 **비용 증가**
- **불필요한 모니터링/로그 노이즈**
- **비효율적인 리소스 사용**

공유 health check 상태 기능은 다음 방식으로 이를 해결합니다.

- Redis를 사용해 Pod 간 **health check 조율**
- 구성 가능한 TTL로 **결과 캐싱**
- 한 번에 하나의 Pod만 health check를 실행하도록 **분산 락 사용**
- 다른 Pod는 중복 검사를 실행하는 대신 **캐시된 결과 읽기**

## 동작 방식

### 1. 락 획득
Pod가 health check를 실행해야 할 때:
- Redis 락 획득을 시도합니다.
- 성공하면 health check를 실행합니다.
- 실패하면 잠시 기다린 뒤 캐시된 결과를 확인합니다.

### 2. 결과 캐싱
health check 실행 후:
- 결과는 구성 가능한 TTL과 함께 Redis에 캐시됩니다.
- 다른 Pod는 이 캐시된 결과를 읽을 수 있습니다.
- 캐시에는 추적을 위한 타임스탬프와 Pod ID가 포함됩니다.

### 3. Fallback 동작
Redis를 사용할 수 없거나 캐시가 만료된 경우:
- Pod는 로컬 health check 실행으로 fallback합니다.
- 시스템은 정상 동작을 계속합니다.

## 설정

### 공유 Health Check 활성화

`proxy_config.yaml`에 다음을 추가합니다.

```yaml
general_settings:
  # Enable background health checks (required)
  background_health_checks: true
  
  # Enable shared health check state across pods
  use_shared_health_check: true
  
  # Health check interval (seconds)
  health_check_interval: 300  # 5 minutes

# Redis configuration (required for shared health check)
litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: your-redis-host
    port: 6379
    password: your-redis-password
```

### 환경 변수

환경 변수로도 구성할 수 있습니다.

```bash
# Enable shared health check
export USE_SHARED_HEALTH_CHECK=true

# Health check TTL (seconds)
export DEFAULT_SHARED_HEALTH_CHECK_TTL=300

# Lock TTL (seconds)
export DEFAULT_SHARED_HEALTH_CHECK_LOCK_TTL=60
```

## 요구 사항

- **Redis**: 공유 상태 조율에 필요합니다.
- **백그라운드 health check**: 반드시 활성화해야 합니다(`background_health_checks: true`).
- **Multiple Pods**: 프록시 인스턴스가 2개 이상일 때 가장 효과적입니다.

## API 엔드포인트

### 공유 Health Check 상태 확인

```bash
GET /health/shared-status
```

공유 health check 조율 상태 정보를 반환합니다.

```json
{
  "shared_health_check_enabled": true,
  "status": {
    "pod_id": "pod_1703123456789",
    "redis_available": true,
    "lock_ttl": 60,
    "cache_ttl": 300,
    "lock_owner": "pod_1703123456788",
    "lock_in_progress": true,
    "cache_available": true,
    "cache_age_seconds": 45.2,
    "last_checked_by": "pod_1703123456788"
  }
}
```

## 모니터링

### Health Check 상태

공유 health check 상태를 모니터링해 조율이 정상적으로 이뤄지는지 확인합니다.

```bash
curl -H "Authorization: Bearer your-api-key" \
  http://your-proxy-host/health/shared-status
```

### 로그

다음 로그 메시지를 확인합니다.

```
INFO: Initialized shared health check manager
INFO: Pod pod_123 acquired health check lock
INFO: Pod pod_123 released health check lock
INFO: Cached health check results for 5 healthy and 0 unhealthy endpoints
DEBUG: Using cached health check results
```

## 문제 해결

### 자주 발생하는 문제

#### 1. 공유 Health Check가 동작하지 않음

**증상**: 각 Pod가 여전히 독립적인 health check를 실행합니다.

**해결 방법**:
- Redis가 구성되어 있고 접근 가능한지 확인합니다.
- `use_shared_health_check: true`가 설정되어 있는지 확인합니다.
- `background_health_checks: true`가 활성화되어 있는지 확인합니다.
- 로그에서 Redis 연결 상태를 확인합니다.

#### 2. Redis 연결 문제

**증상**: Health check가 로컬 실행으로 fallback합니다.

**해결 방법**:
- Redis 호스트, 포트, 자격 증명을 확인합니다.
- Pod와 Redis 사이의 네트워크 연결을 확인합니다.
- Redis 서버 로그에서 오류를 모니터링합니다.

#### 3. 락이 해제되지 않음

**증상**: 하나의 Pod가 락을 계속 보유합니다.

**해결 방법**:
- 락에는 자동 TTL이 있습니다(기본 60초).
- Pod 로그에서 락 해제 메시지를 확인합니다.
- Redis TTL 설정을 확인합니다.

### 디버그 모드

상세 조율 과정을 보려면 디버그 로깅을 활성화합니다.

```yaml
general_settings:
  set_verbose: true
```

## 성능 영향

### 이점

- **API 호출 감소**: 각 interval마다 하나의 Pod만 health check를 실행합니다.
- **비용 절감**: 비싼 모델에서 특히 효과가 큽니다.
- **리소스 활용 개선**: Pod 간 중복 작업이 줄어듭니다.
- **모니터링 정리**: 로그와 메트릭의 노이즈가 줄어듭니다.

### 오버헤드

- **Redis 작업**: 락/캐시 작업에 대한 오버헤드는 작습니다.
- **네트워크 지연**: Redis 통신에 따른 짧은 지연이 있습니다.
- **메모리 사용량**: 추가 메모리 사용량은 무시할 수 있는 수준입니다.

## 권장 사항

### 1. Redis 설정

- persistence를 활성화한 Redis를 사용합니다.
- 적절한 메모리 제한을 구성합니다.
- Redis 모니터링과 알림을 설정합니다.

### 2. TTL 설정

- 원하는 확인 주기에 맞게 `health_check_interval`을 설정합니다.
- 특별한 요구사항이 없다면 기본 TTL 값을 사용합니다.
- 비싼 모델에는 모델별 timeout을 고려합니다.

### 3. 모니터링

- 공유 health check 상태 엔드포인트를 모니터링합니다.
- Redis 연결 문제에 대한 알림을 설정합니다.
- Health check 비용과 빈도를 추적합니다.

### 4. 확장

- 이 기능은 Pod 수와 관계없이 동작합니다.
- Pod가 많을수록 조율 효과가 커집니다.
- 고가용성이 필요하면 Redis cluster를 고려합니다.

## 예제 설정

### 전체 예제

```yaml
# proxy_config.yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_timeout: 30  # 30 second timeout for health checks

general_settings:
  # Enable background health checks
  background_health_checks: true
  
  # Enable shared health check coordination
  use_shared_health_check: true
  
  # Health check interval (5 minutes)
  health_check_interval: 300
  
  # Health check details
  health_check_details: true

litellm_settings:
  # Redis configuration
  cache: true
  cache_params:
    type: redis
    host: redis-cluster.example.com
    port: 6379
    password: os.environ/REDIS_PASSWORD
    ssl: true
```

### Kubernetes 예제

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-proxy
spec:
  replicas: 3  # Multiple pods for coordination
  template:
    spec:
      containers:
      - name: litellm-proxy
        image: docker.litellm.ai/berriai/litellm:latest
        env:
        - name: USE_SHARED_HEALTH_CHECK
          value: "true"
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
```

## 마이그레이션

### 독립 Health Check에서 전환

1. **Redis 활성화**: Redis가 구성되어 있고 접근 가능한지 확인합니다.
2. **백그라운드 health check 활성화**: `background_health_checks: true`를 설정합니다.
3. **Shared Health Check 활성화**: `use_shared_health_check: true`를 설정합니다.
4. **배포**: 프록시 구성을 업데이트합니다.
5. **모니터링**: `/health/shared-status` 엔드포인트를 확인합니다.

### 롤백

공유 health check를 비활성화하려면:

```yaml
general_settings:
  use_shared_health_check: false
  # background_health_checks can remain true for independent checks
```

## 관련 기능

- [백그라운드 Health Check](./health.md#background-health-checks)
- [Redis 캐싱](./caching.md)
- [High Availability 설정](./db_deadlocks.md)
- [Health Check 엔드포인트](./health.md#health-endpoints)
