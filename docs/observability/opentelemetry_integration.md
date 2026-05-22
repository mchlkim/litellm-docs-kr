import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenTelemetry - 어떤 관측성 도구로도 LLM 추적하기

OpenTelemetry는 관측성을 위한 CNCF 표준입니다. Jaeger, Zipkin, Datadog, New Relic, Traceloop, Levo AI 등 여러 관측성 도구와 연결할 수 있습니다.

<Image img={require('../../img/traceloop_dash.png')} />

:::note v1.81.0 변경 사항

v1.81.0부터 요청/응답은 기본적으로 상위 `Received Proxy Server Request` span의 attribute로 설정됩니다. 별도로 선택하지 않으면 **개별 `litellm_request` span은 생성되지 않습니다**. 중첩된 `litellm_request` span을 복원하려면 `USE_OTEL_LITELLM_REQUEST_SPAN=true`를 설정하세요. 전체 구조는 [Span 계층](#span-hierarchy)을, flag 전환이 필요한 경우는 [왜 `litellm_request` span이 보이지 않나요?](#otel-request-span-missing)를 참고하세요.

:::

## 시작하기

OpenTelemetry SDK를 설치합니다.

```
uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp
```

환경 변수를 설정합니다. 공급자에 따라 필요한 변수가 다를 수 있습니다.


<Tabs>

<TabItem value="traceloop" label="Traceloop Cloud에 로그 전송">

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="https://api.traceloop.com"
OTEL_HEADERS="Authorization=Bearer%20<your-api-key>"
```

</TabItem>

<TabItem value="otel-col" label="OTEL HTTP Collector에 로그 전송">

```shell
OTEL_EXPORTER_OTLP_ENDPOINT="http://0.0.0.0:4318"
OTEL_EXPORTER_OTLP_PROTOCOL=http/json
OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"
```

</TabItem>

<TabItem value="otel-col-grpc" label="OTEL GRPC Collector에 로그 전송">

```shell
OTEL_EXPORTER_OTLP_ENDPOINT="http://0.0.0.0:4318"
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_HEADERS="api-key=key,other-config-value=value"
```

> 참고: OTLP gRPC에는 `grpcio`가 필요합니다. `uv add "litellm[grpc]"` 또는 `grpcio`로 설치하세요.

</TabItem>

<TabItem value="laminar" label="Laminar에 로그 전송">

```shell
OTEL_EXPORTER="otlp_grpc"
OTEL_ENDPOINT="https://api.lmnr.ai:8443"
OTEL_HEADERS="authorization=Bearer <project-api-key>"
```

> 참고: OTLP gRPC에는 `grpcio`가 필요합니다. `uv add "litellm[grpc]"` 또는 `grpcio`로 설치하세요.

</TabItem>

<TabItem value="splunk" label="Splunk 관측성 Cloud">

```shell
OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.<realm>.observability.splunkcloud.com/v2/trace/otlp"
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_HEADERS="X-SF-Token=<your-ingest-access-token>"
OTEL_SERVICE_NAME="litellm-proxy"
```

**LiteLLM Proxy** 설정, 수집 토큰 패턴, trace 검증은 **[Splunk 관측성 Cloud (OpenTelemetry)](/docs/observability/splunk_observability_cloud)**를 참고하세요.

</TabItem>

</Tabs>

코드 한 줄만 추가하면 **모든 공급자**의 LLM 응답을 OpenTelemetry로 즉시 로깅할 수 있습니다.

```python
litellm.callbacks = ["otel"]
```

## Span 계층 {#span-hierarchy}

LiteLLM Proxy가 처리하는 모든 LLM 요청은 `Received Proxy Server Request`를 루트로 하는 span tree를 생성합니다. 아래 조건부 span은 제어 flag가 설정되어 있거나 해당 기능이 사용 중일 때만 emit됩니다.

```
Received Proxy Server Request                      (SpanKind.SERVER, root)
│
├── litellm_request                                (INTERNAL, only when USE_OTEL_LITELLM_REQUEST_SPAN=true)
│   ├── raw_gen_ai_request                         (INTERNAL — provider request/response, content-capture-gated)
│   └── guardrail                                  (INTERNAL — one per executed guardrail)
│
├── raw_gen_ai_request                             (INTERNAL — when litellm_request is collapsed into the root)
├── guardrail                                      (INTERNAL — when litellm_request is collapsed into the root)
│
├── auth, router, self, proxy_pre_call,            (INTERNAL — service-hook spans, see below)
│   redis, postgres, batch_write_to_db
│
└── Failed Proxy Server Request                    (INTERNAL — only on exception)
```

**semconv mode**(`OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`)에서는 LLM 호출 span이 생성될 때 이름이 `{operation} {model}`(예: `chat gpt-4`)이 되고 `SpanKind.CLIENT`를 사용하며, `raw_gen_ai_request`는 억제됩니다. span을 emit할지 여부는 동일하게 `USE_OTEL_LITELLM_REQUEST_SPAN` gating이 결정합니다. [최신 GenAI semantic convention 사용 설정](#genai-semconv-mode)을 참고하세요.

SDK만 사용하는 경우(proxy 없음) parent context가 없으면 `litellm_request`가 루트로 emit됩니다. 순수 SDK 사용에서는 `Received Proxy Server Request` span이 없습니다.

### Span 이름 참조 {#span-name-reference}

| Span 이름 | Span 종류 | 상위 span | emit 조건 |
|---|---|---|---|
| `Received Proxy Server Request` | `SERVER` | 루트 또는 외부 `traceparent`가 있으면 해당 parent | LiteLLM Proxy로 들어오는 HTTP 요청마다 한 번 |
| `litellm_request` | `INTERNAL` | proxy 루트(proxy) 또는 루트(SDK) | `USE_OTEL_LITELLM_REQUEST_SPAN=true`(proxy)이거나 parent context가 없을 때(SDK). semconv mode에서는 `{operation} {model}`로 대체됩니다. |
| `raw_gen_ai_request` | `INTERNAL` | `litellm_request`가 있으면 그 하위, 없으면 proxy 루트 | upstream 공급자 호출마다 하나씩 생성됩니다. `llm.{provider}.*` 아래에 provider-native request/response를 담습니다. semconv mode이거나 메시지 콘텐츠 캡처가 비활성화되면 억제됩니다. |
| `guardrail` | `INTERNAL`(OpenInference 종류 = `guardrail`) | `litellm_request`가 있으면 그 하위, 없으면 proxy 루트 | guardrail 실행마다 하나의 span(pre-call, during-call, post-call) |
| `Failed Proxy Server Request` | `INTERNAL` | proxy 루트 | 요청 완료 전에 proxy가 exception을 raise할 때 |
| `{route}`(예: `/user/info`, `/key/info`) | `INTERNAL` | proxy 루트 | management endpoint 호출(non-LLM proxy route) |
| `auth`, `router`, `self`, `proxy_pre_call`, `redis`, `postgres`, `batch_write_to_db`, `reset_budget_job`, `pod_lock_manager` | `INTERNAL` | proxy root | service-hook span입니다. 아래 설명을 참고하세요. |

### Service-hook span(일명 "infrastructure" span) {#service-hook-spans-aka-infrastructure-spans}

LiteLLM에는 router, auth check, Redis, Postgres, proxy pre-call pipeline 같은 내부 subsystem의 timing을 기록하는 별도 hook(`async_service_success_hook` / `async_service_failure_hook`)이 있습니다. OTEL integration이 활성화되어 있고 parent span이 context에 있으면, 각 hook은 INTERNAL child span을 생성합니다.

span **이름은 `ServiceTypes` enum value**입니다(`auth`, `router`, `self`, `proxy_pre_call`, `redis`, `postgres`, ...). 전체 목록은 `litellm/types/services.py`에 정의되어 있습니다. `self`는 LiteLLM SDK 자체입니다(예: `make_openai_chat_completion_request` timing). `router`는 request당 여러 번 나타날 수 있습니다(`async_get_available_deployment` 1회, wrapping `acompletion` 1회 등).

각 service-hook span은 다음 attribute를 담습니다.

| Attribute | 값 |
|---|---|
| `service` | service enum value(예: `"router"`, `"redis"`) |
| `call_type` | 구체적인 operation(예: `"async_get_available_deployment"`, `"acompletion"`, `"add_litellm_data_to_request"`) |
| `error` | failure span에만 설정됩니다. |
| (custom event_metadata) | caller가 attach한 값 |

이 span들은 GenAI semantic span이 아니라 **운영/인프라 span**입니다. SRE 수준의 디버깅(LiteLLM 내부에서 시간이 어디에 쓰이는지 확인)에 유용하지만 `gen_ai.*` attribute는 포함하지 않습니다. backend에서 AI-semantic span만 보고 싶다면 `gen_ai.system` 존재 여부 또는 span 이름으로 filter하세요.

현재 **개별 service-hook span을 비활성화하는 env var는 없습니다**. filter가 필요하면 OTLP collector 또는 backend layer에서 처리하세요(예: `name` 기준으로 drop하는 tail-based sampler).

### 왜 `litellm_request` span이 보이지 않나요? {#otel-request-span-missing}

동작은 **v1.81.0**에서 변경되었습니다. 기본값은 `USE_OTEL_LITELLM_REQUEST_SPAN=false`이며, proxy는 `litellm_request` span을 parent `Received Proxy Server Request` span으로 합칩니다. 따라서 `gen_ai.*` attribute는 별도 child가 아니라 parent에 설정됩니다. 이 방식은 다음 효과가 있습니다.

- parent와 child 사이의 attribute 중복을 피합니다.
- 요청당 약 1개 span을 줄여 span 수와 저장 비용을 낮춥니다.
- parent context가 이미 있을 때 trace를 얕게 유지합니다.

모든 LLM 호출이 proxy 루트 span의 child로 자체 `litellm_request` span을 갖던 이전 중첩 동작을 복원하려면 다음을 설정하세요.

```shell
USE_OTEL_LITELLM_REQUEST_SPAN=true
```

다음 경우에 적합한 설정입니다.

- 하나의 HTTP 요청이 여러 `litellm.completion` 호출을 만듭니다. 기본 동작에서는 마지막 호출의 attribute가 shared parent의 이전 값을 덮어씁니다.
- HTTP 요청 span이 아닌, `raw_gen_ai_request`와 `guardrail` child를 위한 깔끔한 parent가 필요합니다.
- backend UI가 `litellm_request` 같은 AI-semantic span name을 중심으로 구성되어 있습니다.

이는 **regression이 아닙니다**. 의도된 변경입니다. flag는 request마다 새로 읽기 때문에 재시작 없이 전환할 수 있습니다.

semconv mode(`OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`)에서도 LLM 호출 span emit 여부는 동일하게 `USE_OTEL_LITELLM_REQUEST_SPAN` gating이 결정합니다. semconv mode는 span 이름(`{operation} {model}`), kind(`CLIENT`), child 구조만 바꿉니다.

### 컨텍스트 전파(W3C `traceparent`) {#context-propagation-w3c-traceparent}

LiteLLM은 W3C Trace Context header를 따릅니다. client 또는 upstream gateway가 `traceparent` header를 보내면 LiteLLM은 `Received Proxy Server Request` span을 해당 external trace의 child로 생성합니다. 따라서 LiteLLM span은 애플리케이션이 이미 가진 분산 trace 안에 inline으로 표시됩니다.

parent context resolution 순서입니다. 위 항목일수록 우선순위가 높습니다.

1. request `metadata`의 명시적 `litellm_parent_otel_span`.
2. inbound `traceparent` HTTP header(`TraceContextTextMapPropagator`로 추출).
3. OTEL global context(thread-local)의 현재 active span.
4. 없음. 이 경우 LiteLLM span이 root입니다.

inbound header나 active context와 관계없이 모든 LiteLLM trace를 자체 root로 강제하려면 `OTEL_IGNORE_CONTEXT_PROPAGATION=true`를 설정하세요.

## 여러 OpenTelemetry handler 실행

같은 process 안에서 둘 이상의 OpenTelemetry handler를 실행할 수 있습니다. 예를 들어 범용 OTLP exporter와 backend 전용 subclass를 함께 사용할 수 있습니다. 첫 번째 이후의 모든 handler에는 `skip_set_global=True`를 설정해 각 handler가 자체 private `TracerProvider`, `MeterProvider`, `LoggerProvider`를 갖도록 하세요. 그러면 span, metric, log event는 해당 handler의 exporter로만 흐릅니다.

```python
import litellm
from litellm.integrations.opentelemetry import OpenTelemetry, OpenTelemetryConfig

# Primary handler. Claims the global TracerProvider.
primary = OpenTelemetry(config=OpenTelemetryConfig(
    exporter="otlp_http",
    endpoint="https://your-collector/v1/traces",
))

# Secondary handler. Has its own private providers.
secondary = OpenTelemetry(config=OpenTelemetryConfig(
    exporter="otlp_http",
    endpoint="https://second-collector/v1/traces",
    skip_set_global=True,
))

litellm.callbacks = [primary, secondary]
```

초기화 순서는 중요하지 않습니다. 어떤 handler가 먼저 생성되든 두 handler 모두 자체 span을 받습니다.

### Collector 간 동작(예: LangSmith + generic OTEL) {#cross-collector-behavior-e-g-langsmith-generic-otel}

두 OTEL-emitting integration이 동시에 활성화된 경우(예: customized LangSmith OTEL handler와 범용 `otel` exporter), 둘 다 [컨텍스트 전파](#context-propagation-w3c-traceparent)에 설명된 동일한 `traceparent` 전파 규칙과 parent-resolution 순서를 따릅니다. 한 handler가 `skip_set_global=True`를 사용하는 한 두 handler는 모두 다음처럼 동작합니다.

- 특정 request에 대해 같은 `trace_id`를 봅니다.
- 같은 span hierarchy를 emit합니다(`Received Proxy Server Request` -> 활성화된 경우 `litellm_request` -> `raw_gen_ai_request` / `guardrail`).
- span을 보내는 exporter만 다릅니다.

customized LangSmith OTEL handler가 요청에 `traceparent`가 있을 때만 `litellm_request`를 mount하도록 구성되어 있다면(그 외에는 no-op), 범용 OTEL handler는 여전히 전체 hierarchy를 emit합니다. span 이름과 attribute가 동일하므로 두 view는 각각 독립적으로 읽을 수 있습니다.

## 메시지 콘텐츠 캡처 {#message-content-capture}

LiteLLM은 표준 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` 환경 변수를 사용해 prompt와 completion을 캡처할지, 캡처한다면 어디에 저장할지 제어합니다.

```shell
# Do not capture message content
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=NO_CONTENT

# Capture content on span attributes only
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=SPAN_ONLY

# Capture content on event attributes only
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=EVENT_ONLY

# Capture content on both spans and events
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=SPAN_AND_EVENT
```

Boolean 형식도 허용됩니다. `true`는 `EVENT_ONLY`, `false`는 `NO_CONTENT`로 매핑됩니다.

### Handler별 콘텐츠 정책 {#per-handler-content-policy}

여러 OpenTelemetry handler를 실행할 때 각 `OpenTelemetryConfig`에 `capture_message_content`를 설정하면 handler마다 다른 콘텐츠 정책을 가질 수 있습니다. 예를 들어 전체 prompt는 디버깅 backend로 보내고, 규정 준수 중심 OTLP collector에서는 content를 제거할 수 있습니다.

```python
import litellm
from litellm.integrations.opentelemetry import OpenTelemetry, OpenTelemetryConfig

stripped = OpenTelemetry(config=OpenTelemetryConfig(
    exporter="otlp_http",
    endpoint="https://compliance-collector/v1/traces",
    capture_message_content="NO_CONTENT",
))

verbose = OpenTelemetry(config=OpenTelemetryConfig(
    exporter="otlp_http",
    endpoint="https://debug-collector/v1/traces",
    capture_message_content="SPAN_AND_EVENT",
    skip_set_global=True,
))

litellm.callbacks = [stripped, verbose]
```

해결 순서입니다(위 항목일수록 우선순위가 높습니다).

1. `litellm.turn_off_message_logging=True`는 `NO_CONTENT`를 강제합니다(dynamic kill-switch이며 아래 모든 설정을 override).
2. `OpenTelemetryConfig.capture_message_content`(handler별 field, handler init 시점에 sampling).
3. `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` env var(handler init 시점에 sampling).
4. legacy per-instance `message_logging` flag. 기본값은 `True`이며 `SPAN_AND_EVENT`로 매핑됩니다.

## 최신 GenAI semantic convention 사용 설정 {#genai-semconv-mode}

`OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`을 설정하면 [최신 OpenTelemetry GenAI semantic convention](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)을 따르는 span을 emit합니다.

```shell
OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental
```

이 설정은 LLM 호출 span의 이름, kind, 구조를 변경하고, 비표준 `raw_gen_ai_request` child span을 억제하며, `gen_ai.system`과 함께 `gen_ai.provider.name` attribute를 추가합니다. 또한 값이 있으면 추가 request/cache-token attribute를 채우고, message별 event를 단일 `gen_ai.client.inference.operation.details` event로 통합합니다. 행별 차이는 아래 [Span 참조](#spans-reference)와 [Attribute 참조](#attributes-reference)를 참고하세요.

`OpenTelemetryConfig.semconv_stability`는 코드에서 설정하는 대응 항목입니다. 이 flag는 OTEL spec에 따라 comma-separable입니다.

## OpenTelemetry 로깅에서 메시지와 응답 콘텐츠 가리기 {#redact-message-and-response-content-in-opentelemetry-logging}

### 모든 OpenTelemetry 로깅에서 메시지와 응답 가리기 {#redact-message-and-response-in-all-opentelemetry-logging}

`litellm.turn_off_message_logging=True`를 설정하세요. 그러면 message와 response가 OpenTelemetry에 logging되지 않지만 request metadata는 계속 logging됩니다.

### 특정 OpenTelemetry 로깅에서 메시지와 응답 가리기 {#redact-message-and-response-in-specific-opentelemetry-logging}

text completion 또는 embedding 호출에 일반적으로 전달하는 metadata에서 특정 key를 설정해 해당 호출의 message와 response를 mask할 수 있습니다.

`mask_input`을 `True`로 설정하면 이 호출에서 input이 logging되지 않도록 mask합니다.

`mask_output`을 `True`로 설정하면 이 호출에서 output이 logging되지 않도록 mask합니다.

기존 trace를 이어가면서 `update_trace_keys`에 `input` 또는 `output`을 포함하고, 대응하는 `mask_input` 또는 `mask_output`을 설정하면 해당 trace의 기존 input/output이 redacted message로 대체됩니다.

## 문제 해결

### `litellm_request` span이 보이지 않습니다

v1.81.0+ 기본값(`USE_OTEL_LITELLM_REQUEST_SPAN=false`)에서 이는 예상 동작입니다. proxy 루트 span이 LLM 호출 attribute를 흡수하며 별도 `litellm_request` span은 없습니다. 중첩 span을 복원하려면 `USE_OTEL_LITELLM_REQUEST_SPAN=true`를 설정하세요. [`litellm_request` span이 보이지 않는 이유](#otel-request-span-missing)를 참고하세요.

semconv mode에서는 LLM 호출 span이 존재하지만 `{operation} {model}`(예: `chat gpt-4`)로 이름이 바뀝니다. literal name `litellm_request` 대신 `gen_ai.system`으로 검색하세요.

### 인프라 span(`router`, `auth`, `redis`, `proxy_pre_call`)만 보입니다 {#i-only-see-infrastructure-spans-router-auth-redis-proxy-pre-call}

이들은 [service-hook span](#service-hook-spans-aka-infrastructure-spans)입니다. AI-semantic span(`raw_gen_ai_request`, `guardrail`, 활성화된 경우 `litellm_request`)을 대체하는 것이 아니라 함께 emit됩니다. trace 어디에서도 `gen_ai.*` attribute가 전혀 보이지 않는다면 다음을 확인하세요.

1. `litellm.callbacks`(또는 `litellm_settings.callbacks`)에 `"otel"`이 포함되어 있는지 확인하세요.
2. request가 실제로 `/chat/completions` 또는 다른 LLM route에 도달했는지 확인하세요. management endpoint(`/key/info`, `/user/info`, ...)에는 `gen_ai.*` attribute가 없습니다.
3. `litellm.turn_off_message_logging=true` 및/또는 `mask_input`/`mask_output` 설정 여부를 확인하세요. 이 설정들은 message와 raw-provider attribute를 억제합니다.
4. `USE_OTEL_LITELLM_REQUEST_SPAN=true`를 설정해 LLM attribute가 `Received Proxy Server Request`의 HTTP 요청 attribute와 섞이는 대신 `litellm_request`라는 span에 배치되도록 하세요.

### 실패한 request에서 LiteLLM Proxy user/key/org/team 정보 추적

LiteLLM은 **성공한 요청과 실패한 요청 모두**에서 `metadata.user_api_key_*` attribute(key hash, key alias, org ID, user ID, team ID)를 emit합니다. 해당 attribute는 있으면 `litellm_request` span에 표시되고, 없으면 `Received Proxy Server Request`에 표시됩니다.

<Image img={require('../../img/otel_debug_trace.png')} />

### 통합에 trace가 들어오지 않습니다

integration에 trace가 들어오지 않는다면 LiteLLM 환경에서 `OTEL_DEBUG="True"`를 설정하고 다시 시도하세요.

```shell
export OTEL_DEBUG="True"
```

그러면 logging 관련 문제가 console에 출력됩니다. 흔한 원인은 다음과 같습니다.

- `OTEL_EXPORTER_OTLP_ENDPOINT`는 HTTPS endpoint를 가리키지만 protocol은 `grpc`인 경우(또는 그 반대).
- `OTEL_HEADERS`에 backend가 기대하는 auth header가 없는 경우.
- firewall/sidecar가 4317/4318 outbound OTLP traffic을 drop하는 경우.
- gRPC에서 `grpcio`가 설치되지 않은 경우(`uv add "litellm[grpc]"`).

### Span이 잘리거나 drop됩니다

OTLP exporter는 span을 batch 처리합니다. 매우 큰 `gen_ai.input.messages`/`gen_ai.output.messages`(예: multi-megabyte prompt)는 collector의 기본 OTLP attribute size limit을 초과할 수 있습니다. 다음 중 하나를 선택하세요.

- 큰 payload를 trace 밖으로 옮깁니다(`litellm.turn_off_message_logging=true`를 설정하고 `metadata.cold_storage_object_key`로 참조되는 Spend 로그 / cold storage에 의존).
- collector의 `max_attribute_value_length`와 OTLP receiver `max_recv_msg_size_mib`를 높입니다.

## 설정 참조 {#configuration-reference}

별도 언급이 없으면 아래 flag는 모두 환경 변수에서 읽습니다. Boolean flag는 `true`/`false`를 허용하며 대소문자를 구분하지 않습니다.

### Exporter와 resource {#exporter-and-resource}

| 변수 | 기본값 | 목적 |
|---|---|---|
| `OTEL_EXPORTER` (alias: `OTEL_EXPORTER_OTLP_PROTOCOL`) | `console` | Exporter type입니다. 흔한 값: `console`, `otlp_http`, `otlp_grpc`, `http/json`, `http/protobuf`, `grpc` |
| `OTEL_ENDPOINT` (alias: `OTEL_EXPORTER_OTLP_ENDPOINT`) | none | OTLP endpoint URL |
| `OTEL_HEADERS` (alias: `OTEL_EXPORTER_OTLP_HEADERS`) | none | comma-separated `key=value,key2=value2` header 목록 |
| `OTEL_SERVICE_NAME` | `litellm` | Resource attribute `service.name`입니다. |
| `OTEL_ENVIRONMENT_NAME` | `production` | Resource attribute `deployment.environment`입니다. |
| `OTEL_MODEL_ID` | `OTEL_SERVICE_NAME` | Resource attribute `model_id`입니다. |
| `OTEL_TRACER_NAME` | `litellm` | Tracer name |
| `LITELLM_METER_NAME` | `litellm` | Meter name(metrics 활성화 시) |
| `LITELLM_LOGGER_NAME` | `litellm` | Logger name(event 활성화 시) |
| `OTEL_LOGS_EXPORTER` | none | event가 활성화되었을 때 로그 exporter(예: `console`) |

### Span / metric / event 토글 {#span-metric-event-toggles}

| 변수 | 기본값 | 효과 |
|---|---|---|
| `USE_OTEL_LITELLM_REQUEST_SPAN` | `false` | `litellm_request`를 항상 proxy 루트 span의 child로 emit하도록 강제합니다. [`litellm_request` span이 보이지 않는 이유](#otel-request-span-missing)를 참고하세요. |
| `OTEL_SEMCONV_STABILITY_OPT_IN` | unset | [최신 GenAI semantic convention](#genai-semconv-mode)으로 전환하려면 `gen_ai_latest_experimental`로 설정합니다. OTEL spec에 따라 comma-separable입니다. |
| `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT` | unset -> legacy `message_logging`으로 fallback(기본 `True` -> `SPAN_AND_EVENT`) | `NO_CONTENT` / `SPAN_ONLY` / `EVENT_ONLY` / `SPAN_AND_EVENT`. Boolean form도 허용됩니다(`true` -> `EVENT_ONLY`, `false` -> `NO_CONTENT`). |
| `LITELLM_OTEL_INTEGRATION_ENABLE_METRICS` | `false` | OTLP metric을 활성화합니다(TTFT, TPOT, response duration, cost, token usage, operation duration). |
| `LITELLM_OTEL_INTEGRATION_ENABLE_EVENTS` | `false` | OTLP semantic log를 활성화합니다(`gen_ai.content.prompt`/`gen_ai.content.completion`, semconv mode에서는 `gen_ai.client.inference.operation.details`). |
| `OTEL_IGNORE_CONTEXT_PROPAGATION` | `false` | `true`이면 inbound `traceparent` header와 active span을 무시합니다. 모든 LiteLLM trace가 자체 root가 됩니다. |
| `OTEL_DEBUG` / `DEBUG_OTEL` | `false` | exporter 및 span-creation diagnostics를 stderr에 출력합니다. |
| `litellm.turn_off_message_logging` (Python global / `litellm_settings.turn_off_message_logging`) | `false` | content capture kill-switch입니다. `llm.{provider}.*` raw request/response, `gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.content.*` log event를 suppress합니다. handler별 `capture_message_content`를 override합니다. |

### Request별 redaction(request `metadata`) {#per-request-redaction-request-metadata}

logging을 global로 비활성화하지 않고 단일 call만 redact하기 위해 `metadata`에 전달할 수 있는 request별 key입니다.

| Key | 효과 |
|---|---|
| `mask_input` | `true`이면 이 request의 input message를 redact합니다. |
| `mask_output` | `true`이면 이 request의 output message를 redact합니다. |
| `update_trace_keys` | 기존 trace를 이어갈 때 어떤 trace key(`input`, `output`)를 대체할지 제어합니다. |
| `generation_name` | `raw_gen_ai_request` span 이름을 이 값으로 override합니다. |

### `OpenTelemetryConfig` 코드 설정 대응 항목 {#opentelemetryconfig-programmatic-equivalents}

| Field | 기본값 | 목적 |
|---|---|---|
| `exporter` | `console` | `OTEL_EXPORTER`와 동일 |
| `endpoint` | none | `OTEL_ENDPOINT`와 동일 |
| `headers` | none | `OTEL_HEADERS`와 동일 |
| `enable_metrics` | `false` | `LITELLM_OTEL_INTEGRATION_ENABLE_METRICS`와 동일 |
| `enable_events` | `false` | `LITELLM_OTEL_INTEGRATION_ENABLE_EVENTS`와 동일 |
| `capture_message_content` | env var | handler별 override입니다. `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT`와 같은 value space를 사용합니다. |
| `semconv_stability` | env var | `OTEL_SEMCONV_STABILITY_OPT_IN`과 동일 |
| `skip_set_global` | `false` | process-global `TracerProvider`/`MeterProvider`/`LoggerProvider`를 claim하지 않습니다. |
| `ignore_context_propagation` | `false` | `OTEL_IGNORE_CONTEXT_PROPAGATION`과 동일 |

## 부록: Span, metric, attribute 참조 {#appendix-span-metric-attribute-reference}

이 부록은 LiteLLM이 emit하는 모든 span, metric, AI-semantic attribute를 나열하고, [semconv mode](#genai-semconv-mode)가 활성화될 때 각각이 어떻게 바뀌는지 설명합니다.

### Span 참조 {#spans-reference}

LLM 호출 span은 AI-semantic core입니다. 이름, kind, 보조 child span은 semconv mode 활성화 여부에 따라 달라집니다.

| Span | 종류 | 기본 mode | Semconv mode |
|---|---|---|---|
| Proxy 요청 frame | `SERVER` | `Received Proxy Server Request` | `Received Proxy Server Request`(변경 없음) |
| LLM 호출 span | `INTERNAL`(기본) / `CLIENT`(semconv) | `litellm_request`(`USE_OTEL_LITELLM_REQUEST_SPAN=true`일 때만. 그 외에는 attribute가 proxy frame span에 배치됨) | `{operation} {model}`(예: `chat gpt-4`, `embeddings text-embedding-3-small`). 기본 mode와 같은 `USE_OTEL_LITELLM_REQUEST_SPAN` gating을 사용합니다. |
| Raw provider payload | `INTERNAL` | `raw_gen_ai_request`(message content capture가 허용될 때) | emit되지 않음(data는 LLM 호출 span과 consolidated event에 있음) |
| Guardrail check | `INTERNAL` | guardrail invocation마다 하나의 span, guardrail별 name 사용 | 변경 없음 |
| Management endpoint | `INTERNAL` | proxy admin call마다 endpoint별 name으로 하나의 span | 변경 없음 |

semconv mode에서 emit되는 operation 이름: `chat`(기본값), `embeddings`(call type에 `embedding` 포함 시), `text_completion`(call type에 `text_completion` 포함 시).

### Event 참조 {#event-reference}

config에서 `enable_events=True`이면 event는 LiteLLM이 관리하는 `LoggerProvider`에 기록됩니다.

| Event | 기본 mode | Semconv mode |
|---|---|---|
| Message별 prompt | `gen_ai.content.prompt`(input message마다 event 하나) | consolidated event로 대체 |
| Choice별 completion | `gen_ai.content.completion`(choice마다 event 하나) | consolidated event로 대체 |
| Consolidated inference details | emit되지 않음 | `gen_ai.client.inference.operation.details`(call마다 event 하나, spec에 따라 `gen_ai.input.messages`와 `gen_ai.output.messages` array 포함) |

### Metric 참조 {#metric-reference}

`OpenTelemetryConfig`에서 `enable_metrics=True`가 설정되면 LiteLLM은 다음 histogram을 emit합니다. Metric name은 OTEL GenAI semantic convention과 일치합니다.

| Metric | 단위 | 설명 |
|---|---|---|
| `gen_ai.client.operation.duration` | `s` | LiteLLM overhead를 포함한 전체 operation duration입니다. |
| `gen_ai.client.token.usage` | `{token}` | Token usage입니다. call마다 두 histogram을 기록합니다(label `gen_ai.token.type`은 `"input"` 또는 `"output"`). |
| `gen_ai.client.token.cost` | `USD` | 계산된 request cost입니다. |
| `gen_ai.client.response.time_to_first_token` | `s` | 요청 시작부터 첫 streamed token까지의 시간입니다(streaming request만). |
| `gen_ai.client.response.time_per_output_token` | `s` | output token당 평균 시간입니다(generation time / completion tokens). |
| `gen_ai.client.response.duration` | `s` | LiteLLM overhead를 제외한 LLM API generation time입니다. |

모든 histogram의 공통 label: `gen_ai.operation.name`, `gen_ai.system`, `gen_ai.request.model`, `gen_ai.framework="litellm"`.

| 흔한 metric 질문 | Metric |
|---|---|
| TTFT | `gen_ai.client.response.time_to_first_token` |
| TPS | `1 / gen_ai.client.response.time_per_output_token`로 derive |
| Token 사용량 | `gen_ai.client.token.usage`(`gen_ai.token.type`별 split) |
| Vendor/model latency(overhead 제외) | `gen_ai.client.response.duration` |
| Vendor/model latency(overhead 포함) | `gen_ai.client.operation.duration` |

### Span에서 derive한 metric {#span-derived-metrics}

metric이 꺼져 있어도 아래 metric은 모두 span에서 derive할 수 있습니다. 대부분의 dashboard가 이 방식을 사용합니다.

| Metric | Span에서 derive하는 방법 |
|---|---|
| **TTFT** (첫 토큰까지 시간) | Streaming request만 해당합니다. 전용 `gen_ai.client.response.time_to_first_token` metric을 사용하거나, custom callback을 통해 request `kwargs`에서 `completion_start_time`을 capture하세요. |
| **TPOT** (output token당 시간) | `gen_ai.client.response.time_per_output_token` metric을 사용하거나 `gen_ai.client.response.duration ÷ gen_ai.usage.output_tokens`로 derive합니다. |
| **전체 response duration** | `gen_ai.client.response.duration` metric 또는 LLM 호출 span의 `end_time - start_time`(또는 proxy 루트 span에서 LiteLLM overhead를 뺀 값. `hidden_params.litellm_overhead_time_ms` 참고). |
| **Vendor(provider) latency** | `raw_gen_ai_request` span duration(기본 mode)입니다. upstream provider를 기다린 순수 시간입니다. semconv mode에서는 `gen_ai.client.response.duration`을 사용하세요. |
| **LiteLLM overhead** | proxy 루트 span의 `hidden_params.litellm_overhead_time_ms`. 또는 `Received Proxy Server Request.duration - raw_gen_ai_request.duration`. |
| **Token usage** | LLM span의 `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.total_tokens`(또는 `gen_ai.client.token.usage` metric). |
| **Cost** | LLM span의 `gen_ai.cost.total_cost` 및 나머지 `gen_ai.cost.*`, 또는 `gen_ai.client.token.cost` metric. |
| **Guardrail 평가 시간** | 각 `guardrail` span의 duration입니다. `guardrail_name`과 `guardrail_mode`로 구분하세요. |
| **Router / auth / Redis / DB latency** | 해당 [service-hook span](#service-hook-spans-aka-infrastructure-spans)(`router`, `auth`, `redis`, `postgres`, ...)의 duration. |
| **Retry / fallback count** | proxy 루트 span의 `hidden_params.x-litellm-attempted-retries`와 `hidden_params.x-litellm-attempted-fallbacks`입니다. |
| **Streaming?** | `llm.is_streaming` attribute(`"True"`/`"False"`). |

### Attribute 참조 {#attributes-reference}

LLM-call span에 설정되는 attribute입니다. Name은 [OTEL GenAI semconv](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)를 따릅니다.

| Attribute | 기본 mode | Semconv mode |
|---|---|---|
| `gen_ai.operation.name` | litellm `call_type`(예: `acompletion`) | semconv operation(`chat`, `embeddings`, `text_completion`) |
| `gen_ai.system` | provider name(예: `openai`) | 변경 없음 |
| `gen_ai.provider.name` | 설정되지 않음 | provider name(spec에서 renamed Required attribute) |
| `gen_ai.framework` | `litellm` | `litellm` |
| `gen_ai.request.model` | model | model |
| `gen_ai.request.max_tokens`, `temperature`, `top_p` | request에 설정된 경우 | request에 설정된 경우 |
| `gen_ai.request.frequency_penalty`, `presence_penalty`, `top_k`, `seed`, `stop_sequences`, `stream`, `choice.count` | 설정되지 않음 | request에 설정된 경우 |
| `gen_ai.response.model`, `gen_ai.response.id`, `gen_ai.response.finish_reasons` | response에 있는 경우 | 변경 없음 |
| `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, `gen_ai.usage.total_tokens` | 있는 경우 | 변경 없음 |
| `gen_ai.usage.cache_creation.input_tokens`, `gen_ai.usage.cache_read.input_tokens` | 설정되지 않음 | response에 있는 경우 |
| `gen_ai.input.messages`, `gen_ai.output.messages`, `gen_ai.system_instructions` | message content capture가 허용될 때, `{role, parts: [...]}` object의 JSON-encoded array | 변경 없음 |
| `gen_ai.cost.input_cost`, `output_cost`, `total_cost`(및 관련 cost breakdown attrs) | LiteLLM-specific cost attribute | 변경 없음 |

#### `gen_ai.cost.*` (cost breakdown, 모든 mode)

LiteLLM은 `standard_logging_payload["cost_breakdown"]`의 모든 key를 `gen_ai.cost.{key}`로 확장합니다. 현재 관측되는 key는 다음과 같습니다.

| Attribute | 의미 |
|---|---|
| `gen_ai.cost.input_cost` | prompt token 비용(USD) |
| `gen_ai.cost.output_cost` | completion token 비용(USD) |
| `gen_ai.cost.total_cost` | 청구된 total(USD) |
| `gen_ai.cost.tool_usage_cost` | tool/function call에 귀속되는 cost |
| `gen_ai.cost.original_cost` | discount 전 cost |
| `gen_ai.cost.discount_percent`, `gen_ai.cost.discount_amount` | 적용된 discount |
| `gen_ai.cost.margin_percent`, `gen_ai.cost.margin_fixed_amount`, `gen_ai.cost.margin_total_amount` | Margin component |

#### `litellm.*` (proxy root 및 LLM span)

| Attribute | 값 |
|---|---|
| `litellm.call_id` | `litellm.completion` invocation마다 고유합니다. trace data를 LiteLLM Spend 로그 및 LiteLLM UI와 correlate할 때 사용하세요. |
| `litellm.request.type` | `call_type`과 동일(예: `acompletion`, `aembedding`, `aimage_generation`) |

#### `llm.*` (proxy root 및 LLM span)

| Attribute | 값 |
|---|---|
| `llm.request.type` | LiteLLM `call_type` |
| `llm.is_streaming` | `"True"` 또는 `"False"` |
| `llm.user` | 설정된 경우 `user` parameter |

#### `llm.{provider}.*` (raw provider request/response, 기본 mode만)

Attribute duplication을 피하기 위해 **`raw_gen_ai_request`에만** 설정됩니다. raw provider request body의 각 key에 대해 LiteLLM은 `llm.{provider}.{key}`를 emit합니다. raw response body도 동일합니다.

`openai`에서 관측되는 예:

```
llm.openai.messages
llm.openai.model
llm.openai.temperature
llm.openai.max_tokens
llm.openai.id
llm.openai.object
llm.openai.created
llm.openai.choices
llm.openai.usage
llm.openai.system_fingerprint
llm.openai.service_tier
llm.openai.extra_body
```

Anthropic의 경우 `openai`를 `anthropic`으로 바꾸면 됩니다(`llm.anthropic.messages`, `llm.anthropic.stop_reason` 등). 다른 provider도 같은 pattern을 따릅니다.

이 attribute는 `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=NO_CONTENT`인 경우, `litellm.turn_off_message_logging=true`인 경우, 또는 semconv mode(`raw_gen_ai_request` span 전체가 억제됨)에서 억제됩니다.

#### `metadata.*` (proxy root, 일부 LLM span)

LiteLLM은 `standard_logging_payload["metadata"]`를 순회하며 각 entry를 `metadata.{key}`로 emit합니다. 흔한 key는 다음과 같습니다(전체 목록은 아님).

| Attribute | 의미 |
|---|---|
| `metadata.user_api_key_hash` | 사용된 virtual key의 SHA hash |
| `metadata.user_api_key_alias` | Virtual-key alias |
| `metadata.user_api_key_team_id`, `metadata.user_api_key_team_alias` | Team identifier |
| `metadata.user_api_key_org_id`, `metadata.user_api_key_org_alias` | organization 식별자 |
| `metadata.user_api_key_user_id`, `metadata.user_api_key_user_email` | LiteLLM 내부 user 식별자 |
| `metadata.user_api_key_end_user_id` | request에 전달된 end-user |
| `metadata.user_api_key_project_id`, `metadata.user_api_key_project_alias` | project 식별자 |
| `metadata.user_api_key_spend`, `metadata.user_api_key_max_budget`, `metadata.user_api_key_budget_reset_at` | Budget state |
| `metadata.user_api_key_request_route` | hit된 route(예: `/v1/chat/completions`) |
| `metadata.requester_ip_address`, `metadata.user_agent` | Client identifier |
| `metadata.requester_metadata`, `metadata.requester_custom_headers` | Header와 request context |
| `metadata.applied_guardrails` | 이 request에서 실행된 guardrail list |
| `metadata.mcp_tool_call_metadata`, `metadata.vector_store_request_metadata` | MCP 및 vector-store request info |
| `metadata.usage_object` | 전체 token-usage object |
| `metadata.spend_logs_metadata` | Spend 로그에 persist되는 custom metadata |
| `metadata.cold_storage_object_key` | request payload가 cold storage로 offload된 경우 |
| `metadata.user_api_key_auth_metadata` | 추가 auth context |

또한 `hidden_params`가 있습니다. 이는 `litellm_overhead_time_ms`, `api_base`, `response_cost`, `additional_headers`, `model_id`, `x-litellm-attempted-retries`, `x-litellm-attempted-fallbacks` 등을 포함하는 JSON-serialized dict를 담은 단일 attribute입니다.

#### Guardrail span attribute 목록

각 `guardrail` child span에 설정됩니다.

| Attribute | 값 |
|---|---|
| `openinference.span.kind` | `"guardrail"`(OpenInference convention 기준) |
| `guardrail_name` | 예: `"presidio-pii"`, `"lakera"`, `"aporia"` |
| `guardrail_mode` | `"pre_call"`, `"during_call"`, `"post_call"` 등 |
| `masked_entity_count` | guardrail이 entity를 mask한 경우 |
| `guardrail_response` | guardrail의 response/action |

span의 `start_time`/`end_time`은 guardrail 자체 timing에서 오므로 span duration은 **guardrail evaluation time**과 같습니다.

현재 별도 `guardrail_pre`/`guardrail_post` span name은 없습니다. 둘 다 `guardrail`로 emit되며 `guardrail_mode` attribute로 구분됩니다.

#### Service-hook span attribute 목록

[Service-hook span](#service-hook-spans-aka-infrastructure-spans)을 참고하세요. 각 span은 `service`, `call_type`, optional `error`, 그리고 caller가 attach한 custom event metadata를 담습니다.

#### Exception attribute 목록

`Failed Proxy Server Request` 및 실패 시 모든 LLM-call span에 설정됩니다.

| Attribute | 값 |
|---|---|
| `exception` | `str(original_exception)` |
| Span status | `StatusCode.ERROR` |

#### Resource attribute(모든 span)

| Attribute | 기본값 | Override |
|---|---|---|
| `service.name` | `litellm` | `OTEL_SERVICE_NAME` |
| `deployment.environment` | `production` | `OTEL_ENVIRONMENT_NAME` |
| `model_id` | `service.name`과 일치 | `OTEL_MODEL_ID` |
| `telemetry.sdk.{language,name,version}` | SDK가 설정 | - |

### 안정성

위 span 이름, metric 이름, attribute set은 LiteLLM patch release 전반에서 stable합니다. LLM 호출 span 이름과 kind는 [기본 mode와 Semconv mode](#genai-semconv-mode) 사이에서 달라지며, release 간 변경이 아니라 문서화된 opt-in flag를 통해 migration합니다.

## 지원

LiteLLM OTEL integration 질문은 [BerriAI/litellm](https://github.com/BerriAI/litellm/issues)에 issue를 등록하세요. OpenLLMetry / Traceloop semantic-convention 질문은 [Slack](https://traceloop.com/slack)을 참고하거나 [dev@traceloop.com](mailto:dev@traceloop.com)으로 email을 보내세요.
