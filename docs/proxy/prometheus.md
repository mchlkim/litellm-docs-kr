import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 📈 Prometheus metrics


LiteLLM은 Prometheus가 poll할 수 있는 `/metrics` endpoint를 expose합니다.

## 빠른 시작

LiteLLM CLI를 `litellm --config proxy_config.yaml`로 사용한다면 `uv add prometheus_client==0.20.0`가 필요합니다. **litellm Docker image에는 이미 pre-installed되어 있습니다**

proxy config.yaml에 다음을 추가합니다 
```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
litellm_settings:
  callbacks:
    - prometheus
```

프록시 시작
```shell
litellm --config config.yaml --debug
```

Request 테스트
```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-4o",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

`/metrics`에서 metric을 확인합니다. `http://localhost:4000/metrics`를 방문하세요 
```shell
http://localhost:4000/metrics

# <proxy_base_url>/metrics
```

### Multiple Worker

LiteLLM을 multiple worker로 사용할 때 worker process 전체의 aggregated metric collection을 활성화하려면 `PROMETHEUS_MULTIPROC_DIR` environment variable을 설정해야 합니다.

```shell
export PROMETHEUS_MULTIPROC_DIR="/prometheus_multiproc"
```

이 directory는 Prometheus client library가 여러 worker process에서 공유할 수 있는 metric file을 저장하는 데 사용합니다. directory가 존재하고 LiteLLM process에서 write 가능해야 합니다.

## 가상 키, Teams, Internal Users

[user, key, team 등](virtual_keys) 단위 tracking에 사용합니다

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_spend_metric`                | `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user"`별 총 Spend                 |
| `litellm_total_tokens_metric`         | `"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "model"`별 input + output token     |
| `litellm_input_tokens_metric`         | `"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "model"`별 input token     |
| `litellm_output_tokens_metric`        | `"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "model"`별 output token             |

### Team - Budget


| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_team_max_budget_metric`                    | Team의 max budget. Labels: `"team", "team_alias"`|
| `litellm_remaining_team_budget_metric`             | LiteLLM에서 생성된 team의 remaining budget. Labels: `"team", "team_alias"`|
| `litellm_team_budget_remaining_hours_metric`        | team budget이 reset되기 전 남은 시간. Labels: `"team", "team_alias"`|

### Virtual Key - Budget 예산

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_api_key_max_budget_metric`                 | API key의 max budget. Labels: `"hashed_api_key", "api_key_alias"`|
| `litellm_remaining_api_key_budget_metric`                | LiteLLM에서 생성된 API key의 remaining budget. Labels: `"hashed_api_key", "api_key_alias"`|
| `litellm_api_key_budget_remaining_hours_metric`          | API key budget이 reset되기 전 남은 시간. Labels: `"hashed_api_key", "api_key_alias"`|

### Virtual Key - Rate Limit 제한

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_remaining_api_key_requests_for_model`                | LiteLLM virtual API key의 remaining request 수입니다. 해당 virtual key에 model-specific rate limit(rpm)이 설정된 경우에만 제공됩니다. Labels: `"hashed_api_key", "api_key_alias", "model"`|
| `litellm_remaining_api_key_tokens_for_model`                | LiteLLM virtual API key의 remaining token 수입니다. 해당 virtual key에 model-specific token limit(tpm)이 설정된 경우에만 제공됩니다. Labels: `"hashed_api_key", "api_key_alias", "model"`|


### Startup 시 Budget Metric 초기화

request 수신 여부와 관계없이 모든 key, team에 대해 budget metric을 emit하려면 `config.yaml`에서 `prometheus_initialize_budget_metrics`를 `true`로 설정합니다

**동작 방식:**

- If the `prometheus_initialize_budget_metrics` is set to `true`
  - litellm은 5분마다 cron job을 실행해 database에서 모든 key와 team을 읽습니다
  - 그 후 각 key와 team에 대한 budget metric을 emit합니다
  - 이는 `/metrics` endpoint의 budget metric을 채우는 데 사용됩니다

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_initialize_budget_metrics: true
```


## Pod Health Metric

pod별 queue depth를 측정하고 LiteLLM이 request 처리를 시작하기 **전** 발생하는 latency를 진단할 때 사용합니다.

| Metric Name | Type | Description |
|---|---|---|
| `litellm_in_flight_requests` | Gauge | 현재 이 uvicorn worker에서 in-flight 상태인 HTTP request 수입니다. pod의 queue depth를 실시간으로 추적합니다. multiple worker에서는 모든 live worker의 값이 합산됩니다(`livesum`). |

### 사용 시점

LiteLLM은 handler가 시작된 시점부터 latency를 측정합니다. request가 handler 실행 전에 uvicorn event loop에서 대기하면 그 대기 시간은 LiteLLM 자체 log에 보이지 않습니다. `litellm_in_flight_requests`는 특정 시점의 pod load를 보여줍니다.

```
high in_flight_requests + high ALB TargetResponseTime → pod overloaded, scale out
low  in_flight_requests + high ALB TargetResponseTime → delay is pre-ASGI (event loop blocking)
```

Prometheus 없이도 현재 값을 직접 확인할 수 있습니다:

```bash
curl http://localhost:4000/health/backlog \
  -H "Authorization: Bearer sk-..."
# {"in_flight_requests": 47}
```

## Proxy Level Tracking Metric 추적

전체 LiteLLM Proxy usage를 추적할 때 사용합니다.
- proxy의 실제 traffic rate 추적 
- proxy로 들어온 request의 **client side** request 및 failure 수 

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_proxy_failed_requests_metric`             | proxy에서 실패한 response의 총수입니다. client가 litellm proxy에서 성공 response를 받지 못한 경우입니다. Labels: `"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "user_email", "exception_status", "exception_class", "route", "model_id"`          |
| `litellm_proxy_total_requests_metric`             | proxy server로 들어온 request의 총수입니다. client side request 수를 추적합니다. Labels: `"end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "status_code", "user_email", "route", "model_id"`. 선택적으로 `"stream"`을 포함합니다. [Emit Stream Label](#emit-stream-label)을 참고하세요.          |

### Callback Logging Metric 로깅

`s3_v3` cold storage 같은 downstream callback으로 log를 전송하는 동안 발생하는 failure를 monitor합니다

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_callback_logging_failures_metric` | configured callback으로 log를 emit하는 데 실패한 attempt 총수입니다. Labels: `"callback_name"`. `s3_v3`, `langfuse`, `langfuse_otel` 및 기타 otel provider에 write할 때 반복 실패 같은 callback delivery issue에 alert를 걸 때 사용합니다 |

**지원 Callback:**
- `S3Logger` - S3 v2 cold storage 실패
- `langfuse` - Langfuse logging 실패
- `otel` -  OpenTelemetry logging 실패

## LLM Provider Metric 지표

LLM API error monitoring과 남은 rate limit 및 token limit tracking에 사용합니다

### 추적 Label

| Label | 설명 |
|-------|-------------|
| litellm_model_name | LiteLLM이 사용하는 LLM model name |
| requested_model | request로 전송된 model |
| model_id | deployment의 model_id입니다. LiteLLM이 자동 생성하며 각 deployment는 unique model_id를 가집니다 |
| api_base | deployment의 API Base |
| api_provider | provider에 사용되는 LLM API provider. 예제 (azure, openai, vertex_ai) |
| hashed_api_key | request의 hashed api key |
| api_key_alias | 사용된 api key alias |
| team | request의 team |
| team_alias | 사용된 team alias |
| exception_status | exception이 있으면 해당 status |
| exception_class | exception이 있으면 해당 class |

### Success와 Failure

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
 `litellm_deployment_success_responses`              | deployment의 successful LLM API call 총수. Labels: `"requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias"` |
| `litellm_deployment_failure_responses`              | 특정 LLM deployment의 failed LLM API call 총수. Labels: `"requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class"` |
| `litellm_deployment_total_requests`                 | deployment의 LLM API call 총수 - success + failure. Labels: `"requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias"` |

### 남은 Request와 Token

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_remaining_requests_metric`             | LLM API Deployment에서 반환된 `x-ratelimit-remaining-requests` 추적. Labels: `"model_group", "api_provider", "api_base", "litellm_model_name", "hashed_api_key", "api_key_alias"` |
| `litellm_remaining_tokens_metric`                | LLM API Deployment에서 반환된 `x-ratelimit-remaining-tokens` 추적. Labels: `"model_group", "api_provider", "api_base", "litellm_model_name", "hashed_api_key", "api_key_alias"` |

### Deployment State 
| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_deployment_state`             | deployment state입니다. 0 = healthy, 1 = partial outage, 2 = complete outage. Labels: `"litellm_model_name", "model_id", "api_base", "api_provider"` |
| `litellm_deployment_latency_per_output_token`       | deployment의 output token당 latency. Labels: `"litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias"` |

#### Fallback(Failover) Metric 지표

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_deployment_cooled_down`             | LiteLLM load balancing logic에 의해 deployment가 cooled down된 횟수. Labels: `"litellm_model_name", "model_id", "api_base", "api_provider"` |
| `litellm_deployment_successful_fallbacks`           | primary model -> fallback model의 successful fallback request 수. Labels: `"requested_model", "fallback_model", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class"` |
| `litellm_deployment_failed_fallbacks`               | primary model -> fallback model의 failed fallback request 수. Labels: `"requested_model", "fallback_model", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class"` |

## Request Counting Metric 집계

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_requests_metric`             | endpoint별 tracking된 request 총수. Labels: `"end_user", "hashed_api_key", "api_key_alias", "model", "team", "team_alias", "user", "user_email"` |

## Request Latency Metric 지연 시간

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_request_total_latency_metric`             | LiteLLM Proxy Server request의 total latency(seconds)입니다. "end_user", "hashed_api_key", "api_key_alias", "requested_model", "team", "team_alias", "user", "model", "model_id" label 기준으로 추적됩니다 |
| `litellm_overhead_latency_metric`             | LiteLLM processing이 추가한 latency overhead(seconds)입니다. "model_group", "api_provider", "api_base", "litellm_model_name", "hashed_api_key", "api_key_alias" label 기준으로 추적됩니다 |
| `litellm_llm_api_latency_metric`  | LLM API call 자체의 latency(seconds)입니다. "model", "hashed_api_key", "api_key_alias", "team", "team_alias", "requested_model", "end_user", "user" label 기준으로 추적됩니다 |
| `litellm_llm_api_time_to_first_token_metric`             | LLM API call에서 첫 token까지 걸린 시간입니다. `model`, `hashed_api_key`, `api_key_alias`, `team`, `team_alias`, `requested_model`, `end_user`, `user`, `model_id` label 기준으로 추적됩니다 [참고: streaming request에서만 emit] |

## Prometheus에서 `end_user` 추적 {#tracking-end_user-on-prometheus}

기본적으로 LiteLLM은 Prometheus에서 `end_user`를 track하지 않습니다. LiteLLM Proxy metric의 cardinality를 줄이기 위한 동작입니다.

Prometheus에서 `end_user`를 track하려면 다음처럼 설정하세요:

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  enable_end_user_cost_tracking_prometheus_only: true
```


### Stream Label Emit {#emit-stream-label}

streaming과 non-streaming request를 분리하려면 `litellm_proxy_total_requests_metric`에 `stream` label을 추가합니다. 기본값은 disabled입니다.

```yaml title="config.yaml"
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_emit_stream_label: true
```

활성화하면 `litellm_proxy_total_requests_metric`에 `"True"`, `"False"`, `"None"` 값을 갖는 `stream` label이 추가됩니다.

```
litellm_proxy_total_requests_metric{..., stream="True"} 42
litellm_proxy_total_requests_metric{..., stream="False"} 100
```

:::note
이 label은 opt-in입니다. 기존 metric에 새 label을 추가하면 cardinality가 바뀌고 이 metric을 대상으로 하는 기존 Prometheus query / Grafana dashboard가 깨질 수 있기 때문입니다. fresh deployment이거나 dashboard update 준비가 된 경우에만 활성화하세요.
:::


## [BETA] Custom Metric

위에서 언급한 모든 event에서 Prometheus custom metric을 track합니다.

### Custom Metadata Label 설정

1. `config.yaml`에 custom metadata label을 정의합니다

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_metadata_labels: ["metadata.foo", "metadata.bar"]
```

2. custom metadata label이 포함된 request를 보냅니다

<Tabs>
<TabItem value="Curl" label="Curl Request">
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <LITELLM_API_KEY>' \
-d '{
    "model": "openai/gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
<TabItem value="key" label="on Key">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
<TabItem value="team" label="on Team">

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "foo": "hello world"
    }
}'
```
</TabItem>
</Tabs>

3. `/metrics` endpoint에서 custom metric을 확인합니다  

```
... "metadata_foo": "hello world" ...
```

### Custom Tag {#custom-tags}

더 나은 filtering과 monitoring을 위해 특정 tag를 Prometheus label로 track합니다.

1. `config.yaml`에 custom tag를 정의합니다

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_metadata_labels: ["metadata.foo", "metadata.bar"]
  custom_prometheus_tags: 
    - "prod"
    - "staging"
    - "batch-job"
    - "User-Agent: RooCode/*"
    - "User-Agent: claude-cli/*"
```

2. tag가 포함된 request를 보냅니다

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <LITELLM_API_KEY>' \
-d '{
    "model": "openai/gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "metadata": {
        "tags": ["prod", "user-facing"]
    }
}'
```

3. `/metrics` endpoint에서 custom tag metric을 확인합니다

```
... "tag_prod": "true", "tag_staging": "false", "tag_batch_job": "false" ...
```

**Custom Tag 동작 방식:**
- configured tag마다 Prometheus metric의 boolean label이 됩니다  
- tag가 match(exact 또는 wildcard)되면 label value는 `"true"`, 그렇지 않으면 `"false"`입니다
- tag name은 Prometheus compatibility를 위해 sanitize됩니다 (e.g., `"batch-job"` becomes `"tag_batch_job"`)
- `*`를 사용하는 **Wildcard pattern**을 지원합니다 (e.g., `"User-Agent: RooCode/*"` matches `"User-Agent: RooCode/1.0.0"`)

**wildcard 예제:**
```yaml
litellm_settings:
  callbacks: ["prometheus"]
  custom_prometheus_tags:
    - "User-Agent: RooCode/*"
    - "User-Agent: claude-cli/*"
``` 

**Use Case:**
- Environment tracking 환경 구분 (`prod`, `staging`, `dev`)
- Request type classification 요청 유형 분류 (`batch-job`, `user-facing`, `background`)
- Feature flag 기능 플래그 (`new-feature`, `beta-users`)
- Team 또는 service identification 식별 (`team-a`, `service-xyz`)
- User-Agent Tracking - Roo Code, Claude Code, Gemini CLI가 얼마나 사용되는지 track할 때 사용 (`User-Agent: RooCode/*`, `User-Agent: claude-cli/*`, `User-Agent: gemini-cli/*`)


## Metric 및 Label 구성

performance를 최적화하고 cardinality를 줄이기 위해 특정 metric만 선택적으로 활성화하고 포함할 label을 제어할 수 있습니다.

### 특정 Metric 및 Label 활성화

`prometheus_metrics_config`에 지정해 emit할 metric을 구성합니다. 각 configuration group에는 구성을 위한 `group` name과 활성화할 `metrics` list가 필요합니다. 선택적으로 `include_labels` list를 포함해 metric label을 filter할 수 있습니다.

```yaml
model_list:
 - model_name: gpt-4o
    litellm_params:
      model: gpt-4o

litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    # High-cardinality metrics with minimal labels
    - group: "proxy_metrics"
      metrics:
        - "litellm_proxy_total_requests_metric"
        - "litellm_proxy_failed_requests_metric"
      include_labels:
        - "hashed_api_key"
        - "requested_model"
        - "model_group"
```

LiteLLM startup 시 metric이 올바르게 구성되었다면 container log에서 다음을 볼 수 있습니다

<Image 
  img={require('../../img/prom_config.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>


### Metric별 Label Filter

cardinality를 줄이기 위해 각 metric에 포함되는 label을 제어합니다:

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    - group: "token_consumption"
      metrics:
        - "litellm_input_tokens_metric"
        - "litellm_output_tokens_metric"
        - "litellm_total_tokens_metric"
      include_labels:
        - "model"
        - "team"
        - "hashed_api_key"
    - group: "request_tracking"
      metrics:
        - "litellm_proxy_total_requests_metric"
      include_labels:
        - "status_code"
        - "requested_model"
```

### Advanced 설정

서로 다른 label set을 가진 여러 configuration group을 만들 수 있습니다:

```yaml
litellm_settings:
  callbacks: ["prometheus"]
  prometheus_metrics_config:
    # High-cardinality metrics with minimal labels
    - group: "deployment_health"
      metrics:
        - "litellm_deployment_success_responses"
        - "litellm_deployment_failure_responses"
      include_labels:
        - "api_provider"
        - "requested_model"
    
    # Budget metrics with full label set
    - group: "budget_tracking"
      metrics:
        - "litellm_remaining_team_budget_metric"
      include_labels:
        - "team"
        - "team_alias"
        - "hashed_api_key"
        - "api_key_alias"
        - "model"
        - "end_user"
    
    # Latency metrics with performance-focused labels
    - group: "performance"
      metrics:
        - "litellm_request_total_latency_metric"
        - "litellm_llm_api_latency_metric"
      include_labels:
        - "model"
        - "api_provider"
        - "requested_model"
```

**설정 구조:**
- `group`: 관련 metric을 구성하기 위한 descriptive name
- `metrics`: 이 group에 포함할 metric name list  
- `include_labels`: (Optional) 이 metric에 포함할 label list

**기본 동작**: `prometheus_metrics_config`가 지정되지 않으면 모든 metric이 default label과 함께 활성화됩니다(backward compatible).

## System Health Monitor 상태 모니터링

litellm 인접 service(redis / postgres)의 health를 monitor하려면 다음처럼 설정합니다:

```yaml
model_list:
 - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
litellm_settings:
  service_callback: ["prometheus_system"]
```

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_redis_latency`         | redis call의 histogram latency     |
| `litellm_redis_fails`         | failed redis call 수    |
| `litellm_self_latency`         | successful litellm api call의 histogram latency    |

#### DB Transaction Queue Health Metric 상태 지표

DB Transaction Queue의 health를 monitor할 때 이 metric을 사용합니다. 예: in-memory 및 redis buffer size monitoring. 

| Metric Name                                         | 설명                                                                 | Storage Type |
|-----------------------------------------------------|-----------------------------------------------------------------------------|--------------|
| `litellm_pod_lock_manager_size`                     | database update write lock을 가진 pod를 나타냅니다.         | Redis    |
| `litellm_in_memory_daily_spend_update_queue_size`   | in-memory의 daily spend update queue item 수입니다. 각 user의 aggregate spend log입니다.                 | In-Memory    |
| `litellm_redis_daily_spend_update_queue_size`       | Redis daily spend update queue의 item 수입니다. 각 user의 aggregate spend log입니다.                    | Redis        |
| `litellm_in_memory_spend_update_queue_size`         | key, user, team, team member 등의 in-memory 집계 spend 값입니다.| In-Memory    |
| `litellm_redis_spend_update_queue_size`             | key, user, team 등의 Redis aggregate spend value입니다.                  | Redis        |



## 🔥 LiteLLM Maintained Grafana Dashboard 대시보드

LiteLLM이 유지 관리하는 Grafana Dashboard link

https://github.com/BerriAI/litellm/tree/main/cookbook/litellm_proxy_server/grafana_dashboard

LiteLLM Grafana Dashboard로 monitor할 수 있는 metric screenshot입니다


<Image img={require('../../img/grafana_1.png')} />

<Image img={require('../../img/grafana_2.png')} />

<Image img={require('../../img/grafana_3.png')} />


## Deprecated Metric 

| Metric Name          | 설명                          |
|----------------------|--------------------------------------|
| `litellm_llm_api_failed_requests_metric`             | **deprecated** 대신 `litellm_proxy_failed_requests_metric` |



## /metrics endpoint에 authentication 추가

**기본적으로 /metrics endpoint는 unauthenticated입니다.** 

config에 다음을 설정해 /metrics endpoint에서 litellm authentication을 실행하도록 opt-in할 수 있습니다 

```yaml
litellm_settings:
  require_auth_for_metrics_endpoint: true
```

## FAQ 

### `_created`와 `_total` metric은 무엇인가요?

- `_created` metric은 proxy 시작 시 생성되는 metric입니다
- `_total` metric은 각 request마다 증가하는 metric입니다

counting 목적에는 `_total` metric을 사용해야 합니다
