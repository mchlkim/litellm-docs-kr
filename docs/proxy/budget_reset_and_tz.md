# 예산 재설정 시간과 시간대 {#budget-reset-times-and-timezones}

LiteLLM은 자연스러운 달력 경계에 맞춰 예측 가능한 예산 재설정 시간을 지원합니다.

## 예산 재설정 작동 방식 {#how-budget-resets-work}

모든 예산은 설정된 시간대의 자정(00:00:00)에 재설정되며, 일반적인 기간에는 다음과 같은 특별 처리가 적용됩니다.

| 기간 | 재설정 동작 |
| --- | --- |
| 일간 (24h/1d) | 매일 자정에 재설정됩니다 |
| 주간 (7d) | 월요일 자정에 재설정됩니다 |
| 월간 (30d) | 매월 1일 자정에 재설정됩니다 |

## 시간대 설정 {#configuring-the-timezone}

구성 파일에서 모든 예산 재설정에 사용할 시간대를 지정하세요.

```yaml
litellm_settings:
  max_budget: 100 # (float) sets max budget as $100 USD
  budget_duration: 30d # (number)(s/m/h/d)
  timezone: "US/Eastern" # Any valid timezone string
```

이렇게 하면 모든 예산 재설정이 UTC가 아니라 지정한 시간대의 자정에 실행됩니다. 시간대를 지정하지 않으면 기본값으로 UTC가 사용됩니다.

## 지원되는 시간대 {#supported-timezones}

유효한 모든 [IANA timezone string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)을 지원합니다(Python의 `zoneinfo` 모듈 기반). DST 전환은 자동으로 처리됩니다.

**일반적인 시간대 값:**

| 시간대 | 설명 |
| --- | --- |
| `UTC` | 협정 세계시 |
| `US/Eastern` | 미국 동부 시간 |
| `US/Pacific` | 미국 태평양 시간 |
| `Europe/London` | 영국 시간 |
| `Asia/Kolkata` | 인도 표준시(IST) |
| `Asia/Bangkok` | 인도차이나 시간(ICT) |
| `Asia/Tokyo` | 일본 표준시 |
| `Australia/Sydney` | 호주 동부 시간 |
