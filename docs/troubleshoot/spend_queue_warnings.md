# 지출 업데이트 큐 가득 참 경고 {#spend-update-queue-full-warnings}

## 개요

`Spend update queue is full` 경고는 트래픽이 많은 LiteLLM proxy 배포에서 내부 지출 추적 큐가 용량에 도달할 때 발생합니다. 이는 트래픽 급증 중 메모리 문제를 방지하기 위한 보호 메커니즘입니다.

## 경고 메시지 {#warning-message}

```
WARNING:litellm.proxy.db.db_transaction_queue.spend_update_queue:Spend update queue is full. Aggregating entries to prevent memory issues.
```

## 근본 원인 {#root-cause}

지출 업데이트 큐의 기본 최대 크기는 10,000개 항목(`MAX_SIZE_IN_MEMORY_QUEUE=10000`)입니다. 이 한도에 도달하면:

1. 새 지출 추적 항목은 개별적으로 큐에 추가되지 않고 집계됩니다
2. 이렇게 하면 메모리 고갈을 방지할 수 있지만 지출 업데이트가 약간 지연될 수 있습니다
3. 이 경고는 배포 환경이 데이터베이스가 지출 업데이트를 처리할 수 있는 속도보다 더 빠르게 요청을 처리하고 있음을 나타냅니다

## 해결 방법 {#solutions}

### 1. 큐 크기 늘리기 {#1-increase-queue-size}

`MAX_SIZE_IN_MEMORY_QUEUE` 환경 변수를 더 높은 값으로 설정합니다:

```bash
MAX_SIZE_IN_MEMORY_QUEUE=50000
```

**트레이드오프:**
큐 크기가 커지면 메모리에 더 많은 항목을 저장합니다 - 큰 큐를 사용할 경우 최소 8GB RAM을 프로비저닝하세요
- 지속적으로 트래픽이 많은 배포 환경에 권장됩니다

### 2. 수평 확장 {#2-horizontal-scaling}

로드 밸런싱과 함께 여러 proxy 인스턴스를 배포합니다. 이렇게 하면 지출 추적 부하가 여러 큐로 분산되어 단일 인스턴스의 지출 업데이트 큐에 가해지는 부담이 줄어듭니다.



## 관련 설정 {#related-settings}

```yaml
# Environment variables
MAX_SIZE_IN_MEMORY_QUEUE: 10000  # Default queue size
```
