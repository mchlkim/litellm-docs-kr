
import Image from '@theme/IdealImage';

# 벤치마크

가짜 OpenAI 엔드포인트를 대상으로 테스트한 LiteLLM Gateway(Proxy Server) 벤치마크입니다.


LiteLLM Gateway는 1k RPS에서 **8ms P95 지연 시간**을 기록했습니다. (벤치마크는 [여기](#4-instances)에서 확인하세요.)

## 테스트에 사용한 머신 사양 {#machine-spec-used-for-testing}

LiteLLM을 배포한 각 머신의 사양은 다음과 같습니다.

- 4 CPU
- 8GB RAM

## 설정

- 데이터베이스: PostgreSQL
- Redis: 사용하지 않음


### LiteLLM Proxy 인스턴스 2개 {#2-instance-litellm-proxy}

이 테스트에서는 fake-openai-endpoint를 기준으로 기본 지연 시간 특성을 측정했습니다.

#### 성능 지표 {#performance-metrics}

| **유형** | **이름** | **중앙값(ms)** | **95%ile(ms)** | **99%ile(ms)** | **평균(ms)** | **현재 RPS** |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /chat/completions | 200 | 630 | 1200 | 262.46 | 1035.7 |
| Custom | LiteLLM 오버헤드 지속 시간(ms) | 12 | 29 | 43 | 14.74 | 1035.7 |
|  | 집계 | 100 | 430 | 930 | 138.6 | 2071.4 |

<!-- <Image img={require('../img/1_instance_proxy.png')} /> -->

<!-- ## **Horizontal Scaling - 10K RPS**

<Image img={require('../img/instances_vs_rps.png')} /> -->


### 인스턴스 4개 {#4-instances}

| **유형** | **이름** | **중앙값(ms)** | **95%ile(ms)** | **99%ile(ms)** | **평균(ms)** | **현재 RPS** |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /chat/completions | 100 | 150 | 240 | 111.73 | 1170 |
| Custom | LiteLLM 오버헤드 지속 시간(ms) | 2 | 8 | 13 | 3.32 | 1170 |
|  | 집계 | 77 | 130 | 180 | 57.53 | 2340 |

#### 핵심 결과 {#key-findings}
- LiteLLM 인스턴스를 2개에서 4개로 늘리면 중앙값 지연 시간이 절반으로 줄어듭니다: 200ms -> 100ms.
- 상위 백분위 지연 시간이 크게 감소합니다: P95 630ms -> 150ms, P99 1,200ms -> 240ms.
- worker 수를 CPU 수와 동일하게 설정하면 최적의 성능을 얻을 수 있습니다.


## Network Mock으로 벤치마크 설정 {#setting-up-benchmarking-with-network-mock}

프록시 오버헤드를 벤치마크하는 가장 빠른 방법은 `network_mock` 모드를 사용하는 것입니다. 이 모드는 httpx 전송 계층에서 아웃바운드 요청을 가로채고 준비된 응답을 반환하므로, mock provider를 별도로 설정할 필요가 없습니다.

**1. 프록시 설정 생성:**

```yaml
model_list:
  - model_name: db-openai-endpoint
    litellm_params:
      model: openai/gpt-4o
      api_key: "sk-fake-key"
      api_base: "https://api.openai.com"

litellm_settings:
  network_mock: true
  callbacks: []
  num_retries: 0
  request_timeout: 30

general_settings:
  master_key: "sk-1234"
```

**2. 프록시 시작:**

```bash
litellm --config benchmark_config.yaml --port 4000 --num_workers 8
```

**3. 벤치마크 스크립트 실행:**

```bash
python scripts/benchmark_mock.py --requests 2000 --max-concurrent 200 --runs 3
```

벤치마크 스크립트는 [여기](https://github.com/BerriAI/litellm/blob/main/scripts/benchmark_mock.py)에서 확인할 수 있습니다.

이는 실제 또는 가짜 provider로 향하는 네트워크 지연 시간 없이 hot path에서 순수 프록시 오버헤드만 측정합니다.

## 가짜 OpenAI 엔드포인트 설정 {#setting-up-a-fake-openai-endpoint}

부하 테스트와 벤치마크에는 가짜 OpenAI 프록시 서버를 사용할 수 있습니다. LiteLLM은 다음을 제공합니다.

1. **호스팅 엔드포인트**: `https://exampleopenaiendpoint-production.up.railway.app/`에서 무료 호스팅 가짜 엔드포인트를 사용합니다.
2. **자체 호스팅**: [github.com/BerriAI/example_openai_endpoint](https://github.com/BerriAI/example_openai_endpoint)를 사용해 직접 가짜 OpenAI 프록시 서버를 설정합니다.

테스트에는 다음 설정을 사용합니다.

```yaml
model_list:
  - model_name: "fake-openai-endpoint"
    litellm_params:
      model: openai/any
      api_base: https://exampleopenaiendpoint-production.up.railway.app/  # or your self-hosted endpoint
      api_key: "test"
```

## `/realtime` API 벤치마크

가짜 realtime 엔드포인트를 대상으로 테스트한 `/realtime` 엔드포인트의 종단 간 지연 시간 벤치마크입니다.

### 성능 지표 {#performance-metrics-1}

| 지표            | 값         |
| --------------- | ---------- |
| 중앙값 지연 시간 | 59 ms      |
| p95 지연 시간   | 67 ms      |
| p99 지연 시간   | 99 ms      |
| 평균 지연 시간  | 63 ms      |
| RPS             | 1,207      |

### 테스트 설정 {#test-setup}

| 범주 | 사양 |
|----------|---------------|
| **부하 테스트** | Locust: 동시 사용자 1,000명, ramp-up 500 |
| **시스템** | vCPU 4개, RAM 8GB, worker 4개, 인스턴스 4개 |
| **데이터베이스** | PostgreSQL(Redis 사용 안 함) |


## 인프라 권장 사항 {#infrastructure-recommendations}

벤치마크 결과와 API gateway 배포에 대한 업계 표준을 바탕으로 한 권장 사양입니다.

### PostgreSQL

인증, 키 관리, 사용량 추적에 필요합니다.

| 워크로드 | CPU | RAM | 스토리지 | 연결 수 |
|----------|-----|-----|---------|-------------|
| 1-2K RPS | 4-8 cores | 16GB | `200GB SSD (3000+ IOPS)` | 100-200 |
| 2-5K RPS | 8 cores | 16-32GB | `500GB SSD (5000+ IOPS)` | 200-500 |
| 5K+ RPS | 16+ cores | 32-64GB | `1TB+ SSD (10000+ IOPS)` | 500+ |

**설정:** 쓰기를 배치 처리하고 DB 부하를 줄이려면 `proxy_batch_write_at: 60`을 설정합니다. 총 연결 수 = pool limit x 인스턴스 수입니다.

### Redis(권장) {#redis-recommended}

이 벤치마크에서는 Redis를 사용하지 않았지만, 프로덕션에서는 DB 부하를 60-80% 줄이는 큰 이점을 제공합니다.

| 워크로드 | CPU | RAM |
|----------|-----|-----|
| 1-2K RPS | 2-4 cores | 8GB |
| 2-5K RPS | 4 cores | 16GB |
| 5K+ RPS | 8+ cores | 32GB+ |

**요구 사항:** Redis 7.0 이상, AOF persistence 활성화, `allkeys-lru` eviction policy.

**설정:**
```yaml
router_settings:
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

:::tip
성능을 약 80 RPS 높이려면 `redis_url` 대신 `redis_host`, `redis_port`, `redis_password`를 사용하세요.
:::

**스케일링:** DB 연결 수는 인스턴스 수에 비례해 증가합니다. 5K RPS를 초과하면 PostgreSQL read replica를 고려하세요.

자세한 모범 사례는 [프로덕션 설정](./proxy/prod)을 참고하세요.

## Locust 설정 {#locust-settings}

- 사용자 1000명
- 사용자 ramp-up 500

## LiteLLM 오버헤드 측정 방법 {#how-to-measure-litellm-overhead}

litellm의 모든 응답에는 `x-litellm-overhead-duration-ms` 헤더가 포함됩니다. 이 값은 LiteLLM Proxy가 추가한 지연 시간 오버헤드를 밀리초 단위로 나타냅니다.


locust에서 이를 측정하려면 다음 코드를 사용할 수 있습니다.

```python showLineNumbers title="Locust Code for measuring LiteLLM Overhead"
import os
import uuid
from locust import HttpUser, task, between, events

# Custom metric to track LiteLLM overhead duration
overhead_durations = []

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, response, context, exception, start_time, url, **kwargs):
    if response and hasattr(response, 'headers'):
        overhead_duration = response.headers.get('x-litellm-overhead-duration-ms')
        if overhead_duration:
            try:
                duration_ms = float(overhead_duration)
                overhead_durations.append(duration_ms)
                # Report as custom metric
                events.request.fire(
                    request_type="Custom",
                    name="LiteLLM Overhead Duration (ms)",
                    response_time=duration_ms,
                    response_length=0,
                )
            except (ValueError, TypeError):
                pass

class MyUser(HttpUser):
    wait_time = between(0.5, 1)  # Random wait time between requests

    def on_start(self):
        self.api_key = os.getenv('API_KEY', 'sk-1234567890')
        self.client.headers.update({'Authorization': f'Bearer {self.api_key}'})

    @task
    def litellm_completion(self):
        # no cache hits with this
        payload = {
            "model": "db-openai-endpoint",
            "messages": [{"role": "user", "content": f"{uuid.uuid4()} This is a test there will be no cache hits and we'll fill up the context" * 150}],
            "user": "my-new-end-user-1"
        }
        response = self.client.post("chat/completions", json=payload)
        
        if response.status_code != 200:
            # log the errors in error.txt
            with open("error.txt", "a") as error_log:
                error_log.write(response.text + "\n")
```


## LiteLLM과 Portkey 성능 비교 {#litellm-vs-portkey-performance-comparison}

**테스트 설정**: 인스턴스당 CPU 4개, RAM 8GB | 부하: 동시 사용자 1k명, ramp-up 500
**버전:** Portkey **v1.14.0** | LiteLLM **v1.79.1-stable**  
**테스트 시간:** 5분  

### 다중 인스턴스(4x) 성능 {#multi-instance-4-performance}

| 지표                | Portkey(DB 없음) | LiteLLM(DB 사용) | 설명           |
| ------------------- | --------------- | ----------------- | -------------- |
| **총 요청 수**      | 293,796         | 312,405           | LiteLLM이 더 높음 |
| **실패한 요청 수**  | 0               | 0                 | 동일           |
| **중앙값 지연 시간** | 100 ms          | 100 ms            | 동일           |
| **p95 지연 시간**   | 230 ms          | 150 ms            | LiteLLM이 더 낮음 |
| **p99 지연 시간**   | 500 ms          | 240 ms            | LiteLLM이 더 낮음 |
| **평균 지연 시간**  | 123 ms          | 111 ms            | LiteLLM이 더 낮음 |
| **현재 RPS**        | 1,170.9         | 1,170             | 동일           |


*지연 시간 지표는 낮을수록 좋고, 요청 수와 RPS는 높을수록 좋습니다.*

### 기술적 인사이트 {#technical-insights}

**Portkey**

**장점**

* 메모리 사용량이 낮음
* 스파이크가 적고 지연 시간이 안정적임

**단점**

* CPU 사용률이 약 40%에서 제한되어, 사용 가능한 컴퓨팅 리소스를 충분히 활용하지 못하는 것으로 보임
* I/O timeout 장애가 세 번 발생함

**LiteLLM**

**장점**

* 사용 가능한 CPU 용량을 충분히 활용함
* 초기 warm-up 스파이크 이후 연결 처리 성능이 좋고 지연 시간이 낮음

**단점**

* 초기화 중 및 요청당 메모리 사용량이 높음



## 로깅 콜백 {#logging-callbacks}

### [GCS Bucket 로깅](https://docs.litellm.ai/docs/observability/gcs_bucket_integration) {#gcs-bucket-logging}

GCS Bucket을 사용해도 기본 LiteLLM Proxy와 비교해 **지연 시간과 RPS에 영향이 없습니다**.

| 지표 | 기본 LiteLLM Proxy | GCS Bucket 로깅을 사용하는 LiteLLM Proxy |
|--------|------------------------|---------------------|
| RPS | 1133.2 | 1137.3 |
| 중앙값 지연 시간(ms) | 140 | 138 |


### [LangSmith 로깅](https://docs.litellm.ai/docs/proxy/logging) {#langsmith-logging}

LangSmith를 사용해도 기본 LiteLLM Proxy와 비교해 **지연 시간과 RPS에 영향이 없습니다**.

| 지표 | 기본 LiteLLM Proxy | LangSmith를 사용하는 LiteLLM Proxy |
|--------|------------------------|---------------------|
| RPS | 1133.2 | 1135 |
| 중앙값 지연 시간(ms) | 140 | 132 |
