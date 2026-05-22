
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# UI 로그 시작하기

LiteLLM으로 들어오는 각 요청의 spend, token usage, key, team name을 확인합니다.


<Image img={require('../../img/ui_request_logs.png')}/>


## 개요

| 로그 유형 | 기본 추적 여부 |
|----------|-------------------|
| Success 로그 | ✅ 예 |
| Error 로그 | ✅ 예 |
| Request/Response Content 저장 | ❌ 기본값은 아니며, `store_prompts_in_spend_logs`로 opt in |



**기본적으로 LiteLLM은 요청과 응답 본문을 추적하지 않습니다.**

## Logs 페이지에서 Request / Response Content 추적하기

LiteLLM 로그에서 요청과 응답 본문을 확인하려면 다음 중 하나의 위치에서 활성화할 수 있습니다.

- **UI에서 설정(재시작 없음):** [UI Spend Log Settings](./ui_spend_log_settings.md)를 사용합니다. Logs -> Settings를 열고 프롬프트 저장 옵션을 활성화한 뒤 Save를 누릅니다. 즉시 적용되며 config보다 우선합니다.
- **config에서 설정:** `proxy_config.yaml`에 다음을 추가합니다. 재시작이 필요합니다.

```yaml
general_settings:
  store_prompts_in_spend_logs: true
```

<Image img={require('../../img/ui_request_logs_content.png')}/>

## 도구 추적

completion 요청에 어떤 도구가 제공되었고 어떤 도구가 호출되었는지 확인합니다.

<Image img={require('../../img/ui_tools.png')}/>

**예제:** 도구가 포함된 completion 요청을 보냅니다.

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "What is the weather?"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            }
          }
        }
      }
    ]
  }'
```

Logs 페이지에서 제공된 모든 도구와 실제 호출된 도구를 확인합니다.

## DB에 Error 로그 저장 중지

error logs를 DB에 저장하고 싶지 않다면 다음 설정으로 제외할 수 있습니다.

```yaml
general_settings:
  disable_error_logs: True   # Only disable writing error logs to DB, regular spend logs will still be written unless `disable_spend_logs: True`
```

## DB에 Spend 로그 저장 중지

spend logs를 DB에 저장하고 싶지 않다면 다음 설정으로 제외할 수 있습니다.

```yaml
general_settings:
  disable_spend_logs: True   # Disable writing spend logs to DB
```

## 오래된 Spend 로그 자동 삭제

spend logs를 저장한다면 데이터베이스 성능을 유지하기 위해 정기적으로 삭제하는 것이 좋습니다.

보존 기간은 다음 중 하나의 위치에서 설정할 수 있습니다.

- **UI에서 설정(재시작 없음):** [UI Spend Log Settings](./ui_spend_log_settings.md)에서 Logs -> Settings로 이동해 Retention Period를 설정하고 Save를 누릅니다.
- **config에서 설정:** `proxy_config.yaml`에 다음을 추가합니다. 재시작이 필요합니다.

```yaml
general_settings:
  maximum_spend_logs_retention_period: "7d"  # Delete logs older than 7 days

  # Optional: how often to run cleanup
  maximum_spend_logs_retention_interval: "1d"  # Run once per day
```

다음 환경 변수로 한 번 실행할 때 삭제할 로그 수를 제어할 수 있습니다.

`SPEND_LOG_RUN_LOOPS=200  # Deletes up to 200,000 logs in one run`

`SPEND_LOG_CLEANUP_BATCH_SIZE`를 설정하면 batch당 삭제할 로그 수를 제어할 수 있습니다. 기본값은 `1000`입니다.

자세한 아키텍처와 동작 방식은 [Spend 로그 삭제](../proxy/spend_logs_deletion)를 참고하세요.


## 무엇이 기록되나요?

무엇이 기록되는지는 [스키마 분석](https://github.com/BerriAI/litellm/blob/1cdd4065a645021aea931afb9494e7694b4ec64b/schema.prisma#L285)에서 확인할 수 있습니다.
