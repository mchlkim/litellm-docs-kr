# ✨ 지출 로그 최대 보존 기간

이 문서는 지출 로그의 최대 보존 기간을 설정하는 방법을 설명합니다. 오래된 로그를 자동으로 삭제하여 데이터베이스 크기를 관리하는 데 도움이 됩니다.

:::info

✨ 이 기능은 LiteLLM 엔터프라이즈에서 제공됩니다

[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

### 요구 사항

- **Postgres** (로그 저장용)
- **Redis** *(선택 사항)* — 여러 프록시 인스턴스를 실행하면서 분산 잠금을 활성화하려는 경우에만 필요합니다

## 사용법

### 설정

`proxy_config.yaml`의 `general_settings` 아래에 다음을 추가하세요.

```yaml title="proxy_config.yaml"
general_settings:
  maximum_spend_logs_retention_period: "7d"  # Keep logs for 7 days

  # Optional: set how frequently cleanup should run - default is daily
  maximum_spend_logs_retention_interval: "1d"  # Run cleanup daily

  # Optional: set exact time for cleanup (Cron syntax)
  maximum_spend_logs_cleanup_cron: "0 4 * * *" # Run at 04:00 AM daily

litellm_settings:
  cache: true
  cache_params:
    type: redis
```

### 설정 옵션

#### `maximum_spend_logs_retention_period` (필수)

삭제 전 로그를 얼마나 오래 보관할지 지정합니다. 지원되는 형식은 다음과 같습니다.

- `"7d"` – 7일
- `"24h"` – 24시간
- `"60m"` – 60분
- `"3600s"` – 3600초

#### `maximum_spend_logs_retention_interval` (선택 사항)

정리 작업을 얼마나 자주 실행할지 지정합니다. 위와 같은 형식을 사용합니다. 설정하지 않으면 `maximum_spend_logs_retention_period`가 설정된 경우에만 정리 작업이 24시간마다 실행됩니다.

#### `maximum_spend_logs_cleanup_cron` (선택 사항)

표준 cron 문법으로 정리 일정을 지정합니다. 이 설정은 `maximum_spend_logs_retention_interval`보다 우선합니다.

예제:
- `"0 4 * * *"` – 매일 오전 04:00에 실행
- `"0 0 * * 0"` – 매주 일요일 자정에 실행
- `"*/30 * * * *"` – 30분마다 실행

## 동작 방식

### 1단계. 잠금 획득 (Redis 사용 시 선택 사항)

Redis가 활성화되어 있으면 LiteLLM은 한 번에 하나의 인스턴스만 정리 작업을 실행하도록 Redis를 사용합니다.

- 잠금을 획득한 경우:
  - 해당 인스턴스가 정리 작업을 진행합니다
  - 다른 인스턴스는 건너뜁니다
- 잠금이 없는 경우:
  - 정리 작업은 계속 실행됩니다(단일 노드 설정에 유용)

![지출 로그 삭제 동작 방식](../../img/spend_log_deletion_working.png)  
*지출 로그 삭제 동작 방식*

### 2단계. 배치 삭제

정리 작업이 시작되면 다음 작업을 수행합니다.

- 설정된 보존 기간을 사용해 기준 날짜를 계산합니다
- 기준 날짜보다 오래된 로그를 배치 단위로 삭제합니다(기본 크기 `1000`)
- 데이터베이스 과부하를 방지하기 위해 배치 사이에 짧은 지연을 추가합니다

### 기본 설정:
- **배치 크기**: 로그 1000개(`SPEND_LOG_CLEANUP_BATCH_SIZE`로 설정 가능)
- **실행당 최대 배치 수**: 500
- **실행당 최대 삭제 수**: 로그 500,000개

환경 변수를 사용해 정리 파라미터를 변경할 수 있습니다.

```bash
SPEND_LOG_RUN_LOOPS=200
# optional: change batch size from the default 1000
SPEND_LOG_CLEANUP_BATCH_SIZE=2000
```

이렇게 하면 한 번의 실행에서 최대 200,000개의 로그를 삭제할 수 있습니다.

![오래된 로그의 배치 삭제](../../img/spend_log_deletion_multi_pod.jpg)  
*오래된 로그의 배치 삭제*
