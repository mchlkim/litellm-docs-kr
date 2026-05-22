import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Datadog

LiteLLM은 다음 Datadog 통합으로 로그를 전송할 수 있습니다.
- `datadog` [Datadog 로그](https://docs.datadoghq.com/logs/)
- `datadog_llm_observability` [Datadog LLM 관측성](https://www.datadoghq.com/product/llm-observability/)
- `datadog_metrics` [Datadog 사용자 지정 메트릭](#datadog-custom-metrics)
- `datadog_cost_management` [Datadog 클라우드 비용 관리](#datadog-cloud-cost-management)
- `ddtrace-run` [Datadog 추적](#datadog-tracing)

## Datadog 로그

| 기능 | 세부 정보 |
|---------|---------|
| **로그 대상** | [StandardLoggingPayload](../proxy/logging_spec) |
| **이벤트** | 성공 + 실패 |
| **제품 링크** | [Datadog 로그](https://docs.datadoghq.com/logs/) |


`--config`로 `litellm.callbacks = ["datadog"]`를 설정합니다. 이렇게 하면 모든 성공한 LLM 호출이 Datadog에 기록됩니다.

**1단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["datadog"] # logs llm success + failure logs on datadog
  service_callback: ["datadog"] # logs redis, postgres failures on datadog
```


## Datadog LLM 관측성

**개요**

| 기능 | 세부 정보 |
|---------|---------|
| **로그 대상** | [StandardLoggingPayload](../proxy/logging_spec) |
| **이벤트** | 성공 + 실패 |
| **제품 링크** | [Datadog LLM 관측성](https://www.datadoghq.com/product/llm-observability/) |

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["datadog_llm_observability"] # logs llm success logs on datadog
```



**2단계**: Datadog에 필요한 환경 변수를 설정합니다.

#### Direct API

로그를 Datadog API로 직접 전송합니다.

```shell
DD_API_KEY="5f2d0f310***********" # your datadog API Key
DD_SITE="us5.datadoghq.com"       # your datadog base url
DD_SOURCE="litellm_dev"       # [OPTIONAL] your datadog source. use to differentiate dev vs. prod deployments
```

#### Via DataDog Agent

로컬 DataDog Agent를 통해 로그를 전송합니다. 컨테이너 환경에서 유용합니다.

```shell
LITELLM_DD_AGENT_HOST="localhost"         # hostname or IP of DataDog agent
LITELLM_DD_AGENT_PORT="10518"             # [OPTIONAL] port of DataDog agent (default: 10518)
DD_API_KEY="5f2d0f310***********"         # [OPTIONAL] your datadog API Key (Agent handles auth for Logs. REQUIRED for LLM Observability)
DD_SOURCE="litellm_dev"                   # [OPTIONAL] your datadog source
```

`LITELLM_DD_AGENT_HOST`가 설정되면 로그는 Datadog API로 직접 전송되지 않고 Agent로 전송됩니다. 다음 상황에 유용합니다.
- 컨테이너 환경에서 로그 전송을 중앙화할 때
- 여러 서비스에서 발생하는 직접 API 호출을 줄일 때
- Agent 측 처리와 필터링을 활용할 때

**참고:** APM 추적을 위해 `DD_AGENT_HOST`를 자동 설정하는 `ddtrace`와의 충돌을 피하려고 `DD_AGENT_HOST` 대신 `LITELLM_DD_AGENT_HOST`를 사용합니다.

> [!IMPORTANT]
> **Datadog LLM 관측성**: Datadog Agent(`LITELLM_DD_AGENT_HOST`)를 사용하는 경우에도 `DD_API_KEY`는 **필수**입니다. Agent는 프록시 역할을 하지만 LLM 관측성 엔드포인트에는 API 키 헤더가 반드시 필요합니다.

**3단계**: 프록시를 시작하고 테스트 요청을 보냅니다.

프록시 시작:

```shell
litellm --config config.yaml --debug
```

테스트 요청:

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "your-custom-metadata": "custom-field",
    }
}'
```

Datadog에서 예상되는 출력:

<Image img={require('../../img/dd_small1.png')} />

### 메시지와 응답 마스킹

이 섹션은 Datadog LLM 관측성에 기록되는 페이로드에서 메시지와 응답의 민감 데이터를 마스킹하는 방법을 설명합니다.


마스킹이 활성화되면 실제 메시지 내용과 응답 텍스트는 Datadog 로그에서 제외되고, 토큰 수, 지연 시간, 모델 정보 같은 메타데이터는 유지됩니다.

**1단계**: `config.yaml`에서 마스킹을 설정합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["datadog_llm_observability"] # logs llm success logs on datadog

  # Params to apply only for "datadog_llm_observability" callback
  datadog_llm_observability_params:
    turn_off_message_logging: true # redacts input messages and output responses
```

**2단계**: 채팅 완료 요청을 보냅니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

**3단계**: Datadog LLM 관측성에서 마스킹을 확인합니다.

Datadog LLM 관측성 페이지에서 입력 메시지와 출력 응답이 모두 마스킹되고, 메타데이터(토큰 수, 시간, 모델 정보)는 계속 표시되는지 확인합니다.

<Image img={require('../../img/dd_llm_obs.png')} />



<Image img={require('../../img/dd_llm_obs.png')} />


## Datadog 사용자 지정 메트릭

| 기능 | 세부 정보 |
|---------|---------|
| **로그 대상** | 지연 시간 메트릭, 상태 코드별 요청 수 |
| **이벤트** | 성공 + 실패 |
| **제품 링크** | [Datadog Metrics](https://docs.datadoghq.com/metrics/) |

`/api/v2/series` 엔드포인트를 통해 다음 메트릭을 Datadog에 게시합니다.

| 메트릭 | 유형 | 설명 |
|--------|------|-------------|
| `litellm.request.total_latency` | Gauge | 엔드투엔드 요청 지연 시간(초) |
| `litellm.llm_api.latency` | Gauge | LLM 제공자 응답을 기다리는 데 걸린 시간(초) |
| `litellm.llm_api.request_count` | Count | 상태 코드 태그가 포함된 요청 수 |

`total_latency`와 `llm_api.latency`를 사용해 **내부 지연 시간** = `total_latency - llm_api.latency`를 계산할 수 있습니다.

모든 메트릭에는 `env`, `service`, `version`, `HOSTNAME`, `POD_NAME`, `provider`, `model_name`, `model_group`, `team`, `status_code` 태그가 포함됩니다.

**1단계**: `config.yaml` 파일을 만듭니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["datadog_metrics"]
  failure_callback: ["datadog_metrics"]
```

**2단계**: 필요한 환경 변수를 설정합니다.

```shell
DD_API_KEY="your-api-key"
DD_SITE="us5.datadoghq.com"  # your datadog site
```

**3단계**: 프록시를 시작하고 테스트 요청을 보냅니다.

```shell
litellm --config config.yaml
```

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "hello"}]
}'
```

**4단계**: Datadog Metrics Explorer에서 메트릭을 확인합니다.

Datadog에서 **Metrics > Explorer**로 이동한 뒤 `litellm.request.total_latency`, `litellm.llm_api.latency`, 또는 `litellm.llm_api.request_count`를 검색합니다.

## Datadog 클라우드 비용 관리

| 기능 | 세부 정보 |
|---------|---------|
| **로그 대상** | 집계된 LLM 비용(FOCUS 형식) |
| **이벤트** | 집계 비용 데이터의 주기적 업로드 |
| **제품 링크** | [Datadog Cloud Cost Management](https://docs.datadoghq.com/cost_management/) |

`--config`로 `litellm.callbacks = ["datadog_cost_management"]`를 설정합니다. 이렇게 하면 집계된 LLM 비용 데이터가 Datadog에 주기적으로 업로드됩니다.

**1단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["datadog_cost_management"]
```

**2단계**: 필요한 환경 변수를 설정합니다.

```shell
DD_API_KEY="your-api-key"
DD_APP_KEY="your-app-key" # REQUIRED for Cost Management
DD_SITE="us5.datadoghq.com"
```

**3단계**: 프록시 시작

```shell
litellm --config config.yaml
```

**동작 방식**
* LiteLLM은 Provider, Model, Date, Tags 기준으로 비용을 메모리에서 집계합니다.
* Custom Costs API에는 `DD_APP_KEY`가 필요합니다.
* 비용은 주기적으로 업로드(flush)됩니다.


### Datadog 추적

LiteLLM 프록시에서 [Datadog Tracing](https://ddtrace.readthedocs.io/en/stable/installation_quickstart.html)을 활성화하려면 `ddtrace-run`을 사용합니다.

**DD Tracer**
Docker 실행 명령에 `USE_DDTRACE=true`를 전달합니다. `USE_DDTRACE=true`이면 프록시는 단순히 `litellm`을 실행하지 않고 `ENTRYPOINT`로 `ddtrace-run litellm`을 실행합니다.

**DD Profiler**

Docker 실행 명령에 `USE_DDPROFILER=true`를 전달합니다. `USE_DDPROFILER=true`이면 프록시는 [Datadog Profiler](https://docs.datadoghq.com/profiler/enabling/python/)를 활성화합니다. CPU%와 메모리 사용량을 디버깅할 때 유용합니다.

프로덕션에서 `USE_DDPROFILER`를 사용하는 것은 권장하지 않습니다. CPU%와 메모리 사용량을 디버깅할 때만 권장됩니다.


```bash
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e USE_DDTRACE=true \
    -e USE_DDPROFILER=true \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm:main-latest \
    --config /app/config.yaml --detailed_debug
```

## DD 변수 설정(`DD_SERVICE` 등)

LiteLLM은 다음 Datadog 환경 변수의 사용자 지정을 지원합니다.

| 환경 변수 | 설명 | 기본값 | 필수 여부 |
|---------------------|-------------|---------------|----------|
| `DD_API_KEY` | 인증에 사용하는 Datadog API 키(Direct API에는 필수, Agent에는 선택 사항) | None | 조건부* |
| `DD_SITE` | Datadog 사이트(예: "us5.datadoghq.com", Direct API에는 필수) | None | 조건부* |
| `LITELLM_DD_AGENT_HOST` | DataDog Agent의 호스트명 또는 IP(예: "localhost"). 설정하면 로그가 직접 API 대신 Agent로 전송됩니다. | None | ❌ 아니요 |
| `LITELLM_DD_AGENT_PORT` | 로그 수집용 DataDog Agent 포트 | "10518" | ❌ 아니요 |
| `DD_ENV` | 로그의 환경 태그(예: "production", "staging") | "unknown" | ❌ 아니요 |
| `DD_SERVICE` | 로그의 서비스 이름 | "litellm-server" | ❌ 아니요 |
| `DD_SOURCE` | 로그의 소스 이름 | "litellm" | ❌ 아니요 |
| `DD_VERSION` | 로그의 버전 태그 | "unknown" | ❌ 아니요 |
| `HOSTNAME` | 로그의 호스트명 태그 | "" | ❌ 아니요 |
| `POD_NAME` | Pod 이름 태그(Kubernetes 배포에 유용) | "unknown" | ❌ 아니요 |

\* **Direct API 사용 시 필수**(기본값): `DD_API_KEY`와 `DD_SITE`가 필요합니다.  
\* **DataDog Agent 사용 시 선택 사항**: Agent 모드를 사용하려면 `LITELLM_DD_AGENT_HOST`를 설정합니다. **Datadog 로그**에는 `DD_API_KEY`와 `DD_SITE`가 필요하지 않습니다. (**참고: Datadog LLM 관측성에는 `DD_API_KEY`가 필수입니다.**)

## 자동 태그

요청에서 정보를 사용할 수 있으면 LiteLLM은 Datadog 로그와 메트릭에 다음 태그를 자동으로 추가합니다.

| 태그 | 설명 | 소스 |
|-----|-------------|--------|
| `team` | API Key와 연결된 팀 별칭 또는 ID | metadata의 `user_api_key_team_alias`, `team_alias`, `user_api_key_team_id`, 또는 `team_id` |
| `request_tag` | 요청에 전달된 사용자 지정 태그 | logging payload의 `request_tags` |
