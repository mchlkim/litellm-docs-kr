import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 알림 / Webhooks {#alerting--webhooks}

다음 항목에 대한 알림을 받을 수 있습니다.

| 범주 | 알림 유형 |
|----------|------------|
| **LLM 성능** | 멈춘 API 호출, 느린 API 호출, 실패한 API 호출, 모델 장애 알림 |
| **예산 및 지출** | key/user별 budget 추적, soft budget 알림, Team/Tag별 주간 및 월간 spend report |
| **시스템 상태** | 실패한 database read/write |
| **일일 보고서** | 가장 느린 LLM deployment 상위 5개, 실패 요청이 가장 많은 LLM deployment 상위 5개, Team/Tag별 주간 및 월간 spend |



다음 채널에서 동작합니다.
- [Slack](#quick-start)
- Discord
- Microsoft Teams

## 빠른 시작

proxy에서 알림을 받을 Slack 알림 channel을 설정합니다.

### 1단계: env에 Slack Webhook URL 추가 {#step-1-add-slack-webhook-url-to-env}

https://api.slack.com/messaging/webhooks 에서 Slack webhook URL을 가져옵니다.

Discord Webhooks도 사용할 수 있습니다. 자세한 내용은 [여기](#using-discord-webhooks)를 참고하세요.


Slack 알림을 활성화하려면 proxy env에 `SLACK_WEBHOOK_URL`을 설정합니다.

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/<>/<>/<>"
```

### 2단계: Proxy 설정 {#step-2-proxy-configuration}

```yaml
general_settings: 
    alerting: ["slack"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 
    spend_report_frequency: "1d" # [Optional] set as 1d, 2d, 30d .... Specify how often you want a Spend Report to be sent
    
    # [OPTIONAL ALERTING ARGS]
    alerting_args:
        daily_report_frequency: 43200  # 12 hours in seconds
        report_check_interval: 3600    # 1 hour in seconds
        budget_alert_ttl: 86400        # 24 hours in seconds
        outage_alert_ttl: 60           # 1 minute in seconds
        region_outage_alert_ttl: 60    # 1 minute in seconds
        minor_outage_alert_threshold: 5 
        major_outage_alert_threshold: 10
        max_outage_alert_list_size: 1000
        log_to_console: false
    
```

proxy를 시작합니다.
```bash
$ litellm --config /path/to/config.yaml
```


### 3단계: 테스트 {#step-3-test}


```bash
curl -X GET 'http://0.0.0.0:4000/health/services?service=slack' \
-H 'Authorization: Bearer sk-1234'
```

## 고급 설정

### 알림에서 메시지 제거

기본적으로 알림에는 LLM에 전달된 `messages/input`이 표시됩니다. Slack 알림에서 이를 제거하려면 설정에 다음 값을 지정합니다.


```shell
general_settings:
  alerting: ["slack"]
  alert_types: ["spend_reports"] 

litellm_settings:
  redact_messages_in_exceptions: True
```

### 가상 키용 Soft Budget 알림 {#soft-budget-alerts-for-virtual-keys}

key/team의 budget 소진이 가까워졌을 때 알림을 보내려면 이 기능을 사용합니다.

Step 1. soft budget이 있는 virtual key를 생성합니다.

`soft_budget`을 0.001로 설정합니다.

```shell
curl -X 'POST' \
  'http://localhost:4000/key/generate' \
  -H 'accept: application/json' \
  -H 'x-goog-api-key: sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
  "key_alias": "prod-app1",
  "team_id": "113c1a22-e347-4506-bfb2-b320230ea414",
  "soft_budget": 0.001
}'
```

Step 2. virtual key로 proxy에 요청을 전송합니다.

```shell
curl http://0.0.0.0:4000/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer sk-Nb5eCf427iewOlbxXIH4Ow" \
-d '{
  "model": "openai/gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "this is a test request, write a short poem"
    }
  ]
}'

```

Step 3. Slack에서 예상 알림을 확인합니다.

<Image img={require('../../img/soft_budget_alert.png')}/>




### 알림에 Metadata 추가

디버깅을 위해 proxy 호출에 alerting metadata를 추가합니다.

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-4o",
    messages = [], 
    extra_body={
        "metadata": {
            "alerting_metadata": {
                "hello": "world"
            }
        }
    }
)
```

**예상 응답**

<Image img={require('../../img/alerting_metadata.png')}/>

### 특정 알림 유형 선택 {#opting-into-specific-alert-types}

특정 알림 유형만 선택하려면 `alert_types`를 설정합니다. `alert_types`가 설정되지 않으면 모든 기본 알림 유형이 활성화됩니다.

👉 [**모든 알림 유형 보기**](#all-possible-alert-types)

```shell
general_settings:
  alerting: ["slack"]
  alert_types: [
    "llm_exceptions",
    "llm_too_slow",
    "llm_requests_hanging",
    "budget_alerts",
    "spend_reports",
    "db_exceptions",
    "daily_reports",
    "cooldown_deployment",
    "new_model_added",
  ] 
```

### 알림 유형별 Slack channel 매핑

알림 유형마다 별도 channel을 지정하려면 이 설정을 사용합니다.

**예를 들면 다음처럼 라우팅할 수 있습니다.**
```
llm_exceptions -> go to slack channel #llm-exceptions
spend_reports -> go to slack channel #llm-spend-reports
```

`config.yaml`에 `alert_to_webhook_url`을 설정합니다.

<Tabs>

<TabItem label="알림별 channel 1개" value="1">

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: sk-1234
  alerting: ["slack"]
  alerting_threshold: 0.0001 # (Seconds) set an artificially low threshold for testing alerting
  alert_to_webhook_url: {
    "llm_exceptions": "example-slack-webhook-url",
    "llm_too_slow": "example-slack-webhook-url",
    "llm_requests_hanging": "example-slack-webhook-url",
    "budget_alerts": "example-slack-webhook-url",
    "db_exceptions": "example-slack-webhook-url",
    "daily_reports": "example-slack-webhook-url",
    "spend_reports": "example-slack-webhook-url",
    "cooldown_deployment": "example-slack-webhook-url",
    "new_model_added": "example-slack-webhook-url",
    "outage_alerts": "example-slack-webhook-url",
  }

litellm_settings:
  success_callback: ["langfuse"]
```
</TabItem>

<TabItem label="알림별 channel 여러 개" value="2">

특정 알림 유형에 여러 Slack channel을 제공합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: sk-1234
  alerting: ["slack"]
  alerting_threshold: 0.0001 # (Seconds) set an artificially low threshold for testing alerting
  alert_to_webhook_url: {
    "llm_exceptions": ["os.environ/SLACK_WEBHOOK_URL", "os.environ/SLACK_WEBHOOK_URL_2"],
    "llm_too_slow": ["https://webhook.site/7843a980-a494-4967-80fb-d502dbc16886", "https://webhook.site/28cfb179-f4fb-4408-8129-729ff55cf213"],
    "llm_requests_hanging": ["os.environ/SLACK_WEBHOOK_URL_5", "os.environ/SLACK_WEBHOOK_URL_6"],
    "budget_alerts": ["os.environ/SLACK_WEBHOOK_URL_7", "os.environ/SLACK_WEBHOOK_URL_8"],
    "db_exceptions": ["os.environ/SLACK_WEBHOOK_URL_9", "os.environ/SLACK_WEBHOOK_URL_10"],
    "daily_reports": ["os.environ/SLACK_WEBHOOK_URL_11", "os.environ/SLACK_WEBHOOK_URL_12"],
    "spend_reports": ["os.environ/SLACK_WEBHOOK_URL_13", "os.environ/SLACK_WEBHOOK_URL_14"],
    "cooldown_deployment": ["os.environ/SLACK_WEBHOOK_URL_15", "os.environ/SLACK_WEBHOOK_URL_16"],
    "new_model_added": ["os.environ/SLACK_WEBHOOK_URL_17", "os.environ/SLACK_WEBHOOK_URL_18"],
    "outage_alerts": ["os.environ/SLACK_WEBHOOK_URL_19", "os.environ/SLACK_WEBHOOK_URL_20"],
  }

litellm_settings:
  success_callback: ["langfuse"]
```

</TabItem>

</Tabs>

테스트하려면 유효한 LLM 요청을 보냅니다. 전용 Slack channel에 `llm_too_slow` 알림이 표시되어야 합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
}'
```


### MS Teams Webhooks {#using-ms-teams-webhooks}

MS Teams는 알림에 사용할 수 있는 Slack 호환 webhook URL을 제공합니다.

##### 빠른 시작

1. Microsoft Teams channel용 [webhook URL을 가져옵니다](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet#create-an-incoming-webhook).

2. `.env`에 추가합니다.

```bash
SLACK_WEBHOOK_URL="https://berriai.webhook.office.com/webhookb2/...6901/IncomingWebhook/b55fa0c2a48647be8e6effedcd540266/e04b1092-4a3e-44a2-ab6b-29a0a4854d1d"
```

3. LiteLLM 설정에 추가합니다.

```yaml
model_list: 
    model_name: "azure-model"
    litellm_params:
        model: "azure/gpt-35-turbo"
        api_key: "my-bad-key" # 👈 bad key

general_settings: 
    alerting: ["slack"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 
```

4. health check를 실행합니다.

알림 연결이 올바르게 설정되었는지 테스트하려면 proxy의 `/health/services` endpoint를 호출합니다.

```bash
curl --location 'http://0.0.0.0:4000/health/services?service=slack' \
--header 'Authorization: Bearer sk-1234'
```


**예상 응답**

<Image img={require('../../img/ms_teams_alerting.png')}/>

### Discord Webhooks {#using-discord-webhooks}

Discord는 알림에 사용할 수 있는 Slack 호환 webhook URL을 제공합니다.

##### 빠른 시작

1. Discord channel용 webhook URL을 가져옵니다.

2. Discord webhook에 `/slack`을 붙입니다. 다음과 같은 형태가 됩니다.

```
"https://discord.com/api/webhooks/1240030362193760286/cTLWt5ATn1gKmcy_982rl5xmYHsrM1IWJdmCL1AyOmU9JdQXazrp8L1_PYgUtgxj8x4f/slack"
```

3. LiteLLM 설정에 추가합니다.

```yaml
model_list: 
    model_name: "azure-model"
    litellm_params:
        model: "azure/gpt-35-turbo"
        api_key: "my-bad-key" # 👈 bad key

general_settings: 
    alerting: ["slack"]
    alerting_threshold: 300 # sends alerts if requests hang for 5min+ and responses take 5min+ 

environment_variables:
    SLACK_WEBHOOK_URL: "https://discord.com/api/webhooks/1240030362193760286/cTLWt5ATn1gKmcy_982rl5xmYHsrM1IWJdmCL1AyOmU9JdQXazrp8L1_PYgUtgxj8x4f/slack"
```


## [BETA] Budget Alert용 Webhook {#beta-budget-alert-webhook}

**참고**: 이 기능은 beta이므로 spec이 변경될 수 있습니다.

budget alert 알림을 받도록 webhook을 설정합니다.

1. `config.yaml` 설정

환경에 URL을 추가합니다. 테스트에는 [webhook.site](https://webhook.site/) 링크를 사용할 수 있습니다.

```bash
export WEBHOOK_URL="https://webhook.site/6ab090e8-c55f-4a23-b075-3209f5c57906"
```

`config.yaml`에 `webhook`을 추가합니다.
```yaml
general_settings: 
  alerting: ["webhook"] # 👈 KEY CHANGE
```

2. proxy 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -X GET --location 'http://0.0.0.0:4000/health/services?service=webhook' \
--header 'Authorization: Bearer sk-1234'
```

**예상 응답**

```bash
{
  "spend": 1, # the spend for the 'event_group'
  "max_budget": 0, # the 'max_budget' set for the 'event_group'
  "token": "example-api-key-123",
  "user_id": "default_user_id",
  "team_id": null,
  "user_email": null,
  "key_alias": null,
  "projected_exceeded_data": null,
  "projected_spend": null,
  "event": "budget_crossed", # Literal["budget_crossed", "threshold_crossed", "projected_limit_exceeded"]
  "event_group": "user",
  "event_message": "User Budget: Budget Crossed"
}
```

### Webhook 이벤트 API 사양 {#webhook-event-api-spec}

- `spend` *float*: `event_group`의 현재 spend 금액입니다.
- `max_budget` *float or null*: `event_group`에 허용된 최대 budget입니다. 설정되지 않았으면 null입니다.
- `token` *str*: 인증 또는 식별 목적으로 사용되는 key의 hash 값입니다.
- `customer_id` *str or null*: event와 연결된 customer ID입니다(선택 사항).
- `internal_user_id` *str or null*: event와 연결된 internal user ID입니다(선택 사항).
- `team_id` *str or null*: event와 연결된 team ID입니다(선택 사항).
- `user_email` *str or null*: event와 연결된 internal user email입니다(선택 사항).
- `key_alias` *str or null*: event와 연결된 key alias입니다(선택 사항).
- `projected_exceeded_date` *str or null*: key에 `soft_budget`이 설정된 경우 budget 초과가 예상되는 날짜입니다(선택 사항).
- `projected_spend` *float or null*: key에 `soft_budget`이 설정된 경우 예상 spend 금액입니다(선택 사항).
- `event` *Literal["budget_crossed", "threshold_crossed", "projected_limit_exceeded"]*: webhook을 발생시킨 event 유형입니다. 가능한 값:
    * "spend_tracked": customer id의 spend가 추적될 때마다 발생합니다.
    * "budget_crossed": spend가 max budget을 초과했음을 나타냅니다.
    * "threshold_crossed": spend가 threshold를 넘었음을 나타냅니다. 현재 budget의 85% 및 95% 도달 시 전송됩니다.
    * "projected_limit_exceeded": "key" 전용입니다. 예상 spend가 soft budget threshold를 초과할 것으로 예상됨을 나타냅니다.
- `event_group` *Literal["customer", "internal_user", "key", "team", "proxy"]*: event와 연결된 group입니다. 가능한 값:
    * "customer": 특정 customer와 관련된 event입니다.
    * "internal_user": 특정 internal user와 관련된 event입니다.
    * "key": 특정 key와 관련된 event입니다.
    * "team": team과 관련된 event입니다.
    * "proxy": proxy와 관련된 event입니다.

- `event_message` *str*: event에 대한 사람이 읽을 수 있는 설명입니다.

### Digest Mode(알림 노이즈 줄이기) {#digest-mode}

기본적으로 LiteLLM은 **모든** alert event마다 별도의 Slack 메시지를 보냅니다. `llm_requests_hanging` 또는 `llm_too_slow`처럼 빈도가 높은 알림 유형에서는 하루에 수백 개의 중복 메시지가 발생할 수 있습니다.

**Digest mode**는 설정 가능한 시간 창 내의 중복 알림을 집계하고, 전체 횟수와 시간 범위를 포함한 단일 summary message를 전송합니다.

#### 설정

알림 유형별 digest mode를 활성화하려면 `general_settings`에서 `alert_type_config`를 사용합니다.

```yaml
general_settings:
  alerting: ["slack"]
  alert_type_config:
    llm_requests_hanging:
      digest: true
      digest_interval: 86400  # 24 hours (default)
    llm_too_slow:
      digest: true
      digest_interval: 3600   # 1 hour
    llm_exceptions:
      digest: true
      # uses default interval (86400 seconds / 24 hours)
```

| 매개변수 | 유형 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `digest` | bool | `false` | 이 알림 유형에 digest mode를 활성화합니다. |
| `digest_interval` | int | `86400` (24h) | 초 단위 시간 창입니다. 이 구간 내의 알림이 집계됩니다. |

#### 동작 방식

1. digest가 활성화된 유형의 alert가 발생하면 즉시 전송하지 않고 `(alert_type, request_model, api_base)` 기준으로 **그룹화**합니다.
2. 카운터가 interval 내 alert 발생 횟수를 추적합니다.
3. interval이 끝나면 **단일 summary message**가 전송됩니다.

```
Alert type: `llm_requests_hanging` (Digest)
Level: `Medium`
Start: `2026-02-19 03:27:39`
End: `2026-02-20 03:27:39`
Count: `847`

Message: `Requests are hanging - 600s+ request time`
Request Model: `gemini-2.5-flash`
API Base: `None`
```

#### 제한 사항

- **Instance별 동작**: Digest state는 proxy instance별 memory에 저장됩니다. 여러 instance를 실행하면(예: autoscaling이 적용된 Cloud Run) 각 instance가 자체 digest를 유지하고 자체 summary를 발행합니다.
- **영속성 없음**: digest interval이 만료되기 전에 instance가 종료되면 해당 instance에 집계된 alert는 손실됩니다.

## Region 장애 알림(엔터프라이즈 기능) {#region-outage-alerting--enterprise-feature}

:::info
[무료 2주 license 받기](https://forms.gle/P518LXsAZ7PhXpDn8)
:::

provider region에 장애가 발생했을 때 알림을 받도록 설정합니다.

```yaml
general_settings:
    alerting: ["slack"]
    alert_types: ["region_outage_alerts"] 
```

기본적으로 한 region의 여러 모델에서 1분 동안 요청 실패가 5회 이상 발생하면 알림이 트리거됩니다. `400` status code 오류는 집계하지 않습니다. 예: BadRequestErrors.

threshold는 다음 설정으로 제어합니다.

```yaml
general_settings:
    alerting: ["slack"]
    alert_types: ["region_outage_alerts"] 
    alerting_args:
        region_outage_alert_ttl: 60 # time-window in seconds
        minor_outage_alert_threshold: 5 # number of errors to trigger a minor alert
        major_outage_alert_threshold: 10 # number of errors to trigger a major alert
```

## **가능한 모든 알림 유형** {#all-possible-alert-types}

👉 [**특정 알림 유형 설정 방법**](#opting-into-specific-alert-types)

LLM 관련 알림

| 알림 유형 | 설명 | 기본 활성화 |
|------------|-------------|---------|
| `llm_exceptions` | LLM API exception 알림 | ✅ |
| `llm_too_slow` | 설정된 threshold보다 느린 LLM response 알림 | ✅ |
| `llm_requests_hanging` | 완료되지 않는 LLM request 알림 | ✅ |
| `cooldown_deployment` | deployment가 cooldown 상태가 될 때 알림 | ✅ |
| `new_model_added` | `/model/new`를 통해 litellm proxy에 새 모델이 추가될 때 알림 | ✅ |
| `outage_alerts` | 특정 LLM deployment에 장애가 발생할 때 알림 | ✅ |
| `region_outage_alerts` | 특정 LLM region에 장애가 발생할 때 알림. 예: us-east-1 | ✅ |

Budget 및 Spend 알림

| 알림 유형 | 설명 | 기본 활성화 |
|------------|-------------|---------|
| `budget_alerts` | budget limit 또는 threshold 관련 알림 | ✅ |
| `spend_reports` | team 또는 tag별 spend에 대한 주기적 report | ✅ |
| `failed_tracking_spend` | spend tracking 실패 알림 | ✅ |
| `daily_reports` | 일일 spend report | ✅ |
| `fallback_reports` | LLM fallback 발생에 대한 주간 report | ✅ |

Database 알림

| 알림 유형 | 설명 | 기본 활성화 |
|------------|-------------|---------|
| `db_exceptions` | database 관련 exception 알림 | ✅ |

Management Endpoint 알림 - Virtual Key, Team, Internal User

| 알림 유형 | 설명 | 기본 활성화 |
|------------|-------------|---------|
| `new_virtual_key_created` | 새 virtual key가 생성될 때 알림 | ❌ |
| `virtual_key_updated` | virtual key가 수정될 때 알림 | ❌ |
| `virtual_key_deleted` | virtual key가 제거될 때 알림 | ❌ |
| `new_team_created` | 새 team 생성 알림 | ❌ |
| `team_updated` | team 세부 정보가 수정될 때 알림 | ❌ |
| `team_deleted` | team 삭제 알림 | ❌ |
| `new_internal_user_created` | 새 internal user account 생성 알림 | ❌ |
| `internal_user_updated` | internal user 세부 정보가 변경될 때 알림 | ❌ |
| `internal_user_deleted` | internal user account 제거 알림 | ❌ |


## `alerting_args` 사양 {#alerting-args-specification}

| 매개변수 | 기본값 | 설명 |
|-----------|---------|-------------|
| `daily_report_frequency` | 43200 (12 hours) | deployment latency/failure report를 받는 주기(초) |
| `report_check_interval` | 3600 (1 hour) | report 전송 여부를 확인하는 주기(초, background process) |
| `budget_alert_ttl` | 86400 (24 hours) | budget 초과 시 spam 방지를 위한 budget alert cache TTL |
| `outage_alert_ttl` | 60 (1 minute) | model outage error를 수집하는 시간 창(초) |
| `region_outage_alert_ttl` | 60 (1 minute) | region 기반 outage error를 수집하는 시간 창(초) |
| `minor_outage_alert_threshold` | 5 | minor outage alert를 트리거하는 error 개수(`400` error 제외) |
| `major_outage_alert_threshold` | 10 | major outage alert를 트리거하는 error 개수(`400` error 제외) |
| `max_outage_alert_list_size` | 1000 | model/region별 cache에 저장할 최대 error 수 |
| `log_to_console` | false | true이면 alerting payload를 `.warning` log로 console에 출력합니다. |
