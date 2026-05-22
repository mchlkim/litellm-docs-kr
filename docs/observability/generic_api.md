# Generic API 콜백(Webhook) {#generic-api-callback-webhook}

LiteLLM 로그를 원하는 HTTP 엔드포인트로 전송합니다.

## 빠른 시작

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["custom_api_name"]

callback_settings:
  custom_api_name:
    callback_type: generic_api
    endpoint: https://your-endpoint.com/logs
    headers:
      Authorization: Bearer sk-1234
```

## 설정

### 기본 설정 {#basic-setup}

```yaml
callback_settings:
  <callback_name>:
    callback_type: generic_api
    endpoint: https://your-endpoint.com  # required
    headers:                              # optional
      Authorization: Bearer <token>
      Custom-Header: value
    event_types:                          # optional, defaults to all events
      - llm_api_success
      - llm_api_failure
```

### 파라미터 {#parameters}

| 파라미터 | 유형 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `callback_type` | string | 예 | `generic_api`여야 합니다. |
| `endpoint` | string | 예 | 로그를 전송할 HTTP 엔드포인트입니다. |
| `headers` | dict | 아니요 | 요청에 사용할 사용자 지정 헤더입니다. |
| `event_types` | list | 아니요 | 이벤트를 필터링합니다: `llm_api_success`, `llm_api_failure`. 기본값은 모든 이벤트입니다. |
| `log_format` | string | 아니요 | 출력 형식입니다: `json_array`(기본값), `ndjson`, 또는 `single`. 로그를 배치 처리하고 전송하는 방식을 제어합니다. |

## 사전 구성된 콜백 {#pre-configured-callbacks}

`generic_api_compatible_callbacks.json`의 기본 제공 구성을 사용할 수 있습니다.

```yaml
litellm_settings:
  callbacks: ["rubrik"]  # loads pre-configured settings

callback_settings:
  rubrik:
    callback_type: generic_api
    endpoint: https://your-endpoint.com  # override defaults
    headers:
      Authorization: Bearer ${RUBRIK_API_KEY}
```

## 페이로드 형식 {#payload-format}

로그는 JSON 형식의 `StandardLoggingPayload` [객체](https://docs.litellm.ai/docs/proxy/logging_spec)로 전송됩니다.

```json
[
  {
    "id": "chatcmpl-123",
    "call_type": "litellm.completion",
    "model": "gpt-3.5-turbo",
    "messages": [...],
    "response": {...},
    "usage": {...},
    "cost": 0.0001,
    "startTime": "2024-01-01T00:00:00",
    "endTime": "2024-01-01T00:00:01",
    "metadata": {...}
  }
]
```

## 환경 변수 {#environment-variables}

설정 파일 대신 환경 변수로 지정할 수 있습니다.

```bash
export GENERIC_LOGGER_ENDPOINT=https://your-endpoint.com
export GENERIC_LOGGER_HEADERS="Authorization=Bearer token,Custom-Header=value"
```

## 배치 설정 {#batch-settings}

배치 처리 동작을 제어합니다(`CustomBatchLogger`에서 상속).

```yaml
callback_settings:
  my_api:
    callback_type: generic_api
    endpoint: https://your-endpoint.com
    batch_size: 100        # default: 100
    flush_interval: 60     # seconds, default: 60
```

## 로그 형식 옵션 {#log-format-options}

로그가 어떤 형식으로 엔드포인트에 전송되는지 제어합니다.

### JSON Array(기본값) {#json-array-default}

```yaml
callback_settings:
  my_api:
    callback_type: generic_api
    endpoint: https://your-endpoint.com
    log_format: json_array  # default if not specified
```

배치의 모든 로그를 단일 JSON 배열 `[{log1}, {log2}, ...]`로 전송합니다. 이는 기본 동작이며 이전 버전과의 호환성을 유지합니다.

**사용 시점**: 배치 JSON 데이터를 기대하는 대부분의 HTTP 엔드포인트.

### NDJSON(줄 구분 JSON) {#ndjson-newline-delimited-json}

```yaml
callback_settings:
  my_api:
    callback_type: generic_api
    endpoint: https://your-endpoint.com
    log_format: ndjson
```

로그를 줄 단위 JSON(한 줄에 한 레코드)으로 전송합니다.
```
{log1}
{log2}
{log3}
```

**사용 시점**: 개별 레코드의 필드 추출을 지원하는 Sumo Logic, Splunk, Datadog 같은 로그 집계 서비스.

**장점**:
- 각 로그가 별도 메시지로 수집됩니다.
- 수집 시점에 Field Extraction Rules가 동작합니다.
- 파싱 및 쿼리 성능이 더 좋습니다.

### Single

```yaml
callback_settings:
  my_api:
    callback_type: generic_api
    endpoint: https://your-endpoint.com
    log_format: single
```

배치가 플러시될 때 각 로그를 개별 HTTP 요청으로 병렬 전송합니다.

**사용 시점**: 개별 레코드를 기대하는 엔드포인트이거나 최대 호환성이 필요한 경우.

**참고**: 이 모드는 배치당 N개의 HTTP 요청을 전송하므로 오버헤드가 더 큽니다. 엔드포인트가 지원한다면 대신 `ndjson` 사용을 고려하세요.
