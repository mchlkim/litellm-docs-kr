import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 고가용성 설정(DB 데드락 해결) {#high-availability-setup-resolve-db-deadlocks}

:::tip 프로덕션 필수 사항

초당 1000개 이상의 요청을 처리하는 프로덕션 배포에는 이 설정이 **필수**입니다. Redis를 설정하지 않으면 PostgreSQL 연결이 고갈될 수 있습니다(`FATAL: sorry, too many clients already`).

:::

트래픽이 많은 환경에서 발생하는 DB 데드락은 이 설정으로 해결할 수 있습니다.

## 문제의 원인 {#what-causes-the-problem}

LiteLLM은 DB에 `UPDATE` 및 `UPSERT` 쿼리를 작성합니다. LiteLLM 인스턴스를 10개 이상 사용하는 경우 각 인스턴스가 동일한 `user_id`, `team_id`, `key` 등을 동시에 업데이트하려고 할 수 있어 이러한 쿼리로 데드락이 발생할 수 있습니다.

## 고가용성 설정이 문제를 해결하는 방식 {#how-the-high-availability-setup-fixes-the-problem}
- 모든 인스턴스가 DB 대신 Redis 큐에 기록합니다.
- 단일 인스턴스가 DB 잠금을 획득하고 Redis 큐를 DB로 플러시합니다.


## 동작 방식 

### 1단계. 각 인스턴스가 업데이트를 Redis에 기록 {#stage-1-each-instance-writes-updates-to-redis}

각 인스턴스는 키, 사용자, 팀 등에 대한 지출 업데이트를 누적한 뒤 Redis 큐에 기록합니다.

<Image img={require('../../img/deadlock_fix_1.png')}  style={{ width: '900px', height: 'auto' }} />
<p style={{textAlign: 'left', color: '#666'}}>
각 인스턴스가 업데이트를 Redis에 기록
</p>


### 2단계. 단일 인스턴스가 Redis 큐를 DB로 플러시 {#stage-2-a-single-instance-flushes-the-redis-queue-to-the-db}

단일 인스턴스가 DB 잠금을 획득하고 Redis 큐의 모든 요소를 DB로 플러시합니다.

- 인스턴스 1개가 DB 업데이트 작업의 잠금 획득을 시도합니다.
- 잠금 상태는 Redis에 저장됩니다.
- 인스턴스가 DB에 쓰기 위한 잠금을 획득하면 다음을 수행합니다.
    - Redis에서 모든 업데이트를 읽습니다.
    - 모든 업데이트를 하나의 트랜잭션으로 집계합니다.
    - 업데이트를 DB에 기록합니다.
    - 잠금을 해제합니다.
- 참고: 한 번에 인스턴스 1개만 잠금을 획득할 수 있으므로 동시에 DB에 쓸 수 있는 인스턴스 수가 제한됩니다.


<Image img={require('../../img/deadlock_fix_2.png')}  style={{ width: '900px', height: 'auto' }} />
<p style={{textAlign: 'left', color: '#666'}}>
단일 인스턴스가 Redis 큐를 DB로 플러시
</p>


## 사용법

### 필수 구성 요소 {#required-components}

- Redis
- Postgres

### LiteLLM config 설정 {#setup-on-litellm-config}

`proxy_config.yaml` 파일의 `general_settings` 섹션에서 `use_redis_transaction_buffer: true`를 설정하여 Redis 버퍼 사용을 활성화할 수 있습니다.

참고: 이 설정을 사용하려면 LiteLLM이 Redis 인스턴스에 연결되어 있어야 합니다.

```yaml showLineNumbers title="litellm proxy_config.yaml"
general_settings:
  use_redis_transaction_buffer: true

litellm_settings:
  cache: True
  cache_params:
    type: redis
    supported_call_types: [] # Optional: Set cache for proxy, but not on the actual llm api call
```

## 모니터링 {#monitoring}

LiteLLM은 인메모리 버퍼와 Redis 버퍼의 상태를 모니터링할 수 있도록 다음 Prometheus 메트릭을 내보냅니다.


| 메트릭 이름                                         | 설명                                                                 | 저장소 유형 |
|-----------------------------------------------------|-----------------------------------------------------------------------------|--------------|
| `litellm_pod_lock_manager_size`                     | 데이터베이스에 업데이트를 기록하기 위한 잠금을 보유한 pod를 나타냅니다.         | Redis    |
| `litellm_in_memory_daily_spend_update_queue_size`   | 인메모리 일일 지출 업데이트 큐의 항목 수입니다. 각 사용자별 집계 지출 로그입니다.                 | 인메모리    |
| `litellm_redis_daily_spend_update_queue_size`       | Redis 일일 지출 업데이트 큐의 항목 수입니다. 각 사용자별 집계 지출 로그입니다.                    | Redis        |
| `litellm_in_memory_spend_update_queue_size`         | 키, 사용자, 팀, 팀 구성원 등에 대한 인메모리 집계 지출 값입니다.| 인메모리    |
| `litellm_redis_spend_update_queue_size`             | 키, 사용자, 팀 등에 대한 Redis 집계 지출 값입니다.                  | Redis        |


## 문제 해결: Redis 연결 오류 {#troubleshooting-redis-connection-errors}

다음과 같은 오류가 표시될 수 있습니다.

```
LiteLLM Redis Caching: async async_increment() - Got exception from REDIS No connection available., Writing value=21
LiteLLM Redis Caching: async set_cache_pipeline() - Got exception from REDIS No connection available., Writing value=None
```
 
이는 사용 가능한 모든 Redis 연결이 사용 중이어서 LiteLLM이 풀에서 새 연결을 얻을 수 없다는 뜻입니다. 높은 부하나 많은 동시 프록시 요청이 있을 때 발생할 수 있습니다.

**해결 방법:**

- 더 많은 동시 연결을 허용하려면 `proxy_config.yaml`의 Redis 설정 섹션에서 `max_connections` 매개변수를 늘립니다. 예:

```yaml
litellm_settings:
  cache: True
  cache_params:
    type: redis
    max_connections: 100  # Increase as needed for your traffic
```

예상 동시성과 Redis 서버 용량에 맞춰 이 값을 조정하세요.
