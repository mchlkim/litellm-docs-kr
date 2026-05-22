# `Splunk Observability Cloud` (`OpenTelemetry`)

기본 제공 **`otel`** 콜백과 표준 OpenTelemetry OTLP 환경 변수를 사용해 LiteLLM 트레이스를 [Splunk Observability Cloud](https://www.splunk.com/en_us/products/observability-cloud.html)로 보냅니다.

LiteLLM은 [OpenTelemetry 통합](./opentelemetry_integration.md)과 동일한 OpenTelemetry 경로를 사용합니다. Splunk의 OTLP/HTTP 트레이스 수집 URL은 **`/v2/trace/otlp`**를 사용합니다(**`/v1/traces`**가 아님). LiteLLM은 일반 collector URL을 정규화하지만, 스팬이 Splunk에 올바르게 도달하도록 Splunk 방식의 `/v2/trace/otlp` 엔드포인트는 **그대로 유지**합니다.

## 비디오 안내 {#video-walkthrough}

<iframe width="840" height="500" src="https://www.loom.com/embed/9dc21b753bbe4f6fb3c1b44c06e39c20" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen title="LiteLLM Splunk Observability Cloud OTEL demo"></iframe>

또는 [Loom에서 보기](https://www.loom.com/share/9dc21b753bbe4f6fb3c1b44c06e39c20)를 사용하세요.

## 사전 준비

1. Splunk Observability Cloud 계정과 **수집 액세스 토큰**(`X-SF-Token`으로 사용).
2. Splunk Observability Cloud UI 또는 문서에서 확인한 **realm**(예: `eu1`, `us0`).

## LiteLLM 프록시 {#litellm-proxy}

[Datadog Logs](./datadog#datadog-logs) 같은 통합과 동일한 흐름입니다. **`config.yaml`**을 구성한 다음 환경 변수를 설정하고 프록시를 시작합니다.

**1단계:** `config.yaml`에서 OpenTelemetry 콜백을 활성화합니다.

```yaml
litellm_settings:
  callbacks: ["otel"]
```

**2단계:** 아래 OTLP 환경 변수를 설정합니다.

프로세스 환경, `.env` 파일 또는 `config.yaml`의 프록시 **`environment_variables`** 블록([구성 필드](/litellm-docs-kr/docs/proxy/configs))에서 로드할 수 있습니다.

| 목적 | 변수 |
|--------|----------|
| 트레이스 수집 URL(Splunk OTLP/HTTP) | `OTEL_EXPORTER_OTLP_ENDPOINT` — 예: `https://ingest.<realm>.observability.splunkcloud.com/v2/trace/otlp` |
| 인증 | `OTEL_EXPORTER_OTLP_HEADERS` 또는 `OTEL_HEADERS` — 예: `X-SF-Token=<your-access-token>`(여러 헤더는 쉼표로 구분한 `key=value` 쌍 사용) |
| 프로토콜 | OTLP/HTTP에는 `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`를 사용합니다(gRPC OTLP 엔드포인트를 대상으로 할 때만 `grpc` 사용). |
| 선택적 리소스 이름 지정 | `OTEL_SERVICE_NAME`, `OTEL_ENVIRONMENT_NAME` 등 |

**우선순위:** `OTEL_EXPORTER_OTLP_PROTOCOL`은 레거시 `OTEL_EXPORTER`보다 먼저 읽힙니다. 둘 다 설정된 경우 OTLP 프로토콜 변수가 우선합니다. `OTEL_EXPORTER_OTLP_ENDPOINT`와 `OTEL_ENDPOINT`가 둘 다 설정된 경우 `OTEL_EXPORTER_OTLP_ENDPOINT`가 우선됩니다.

```shell
OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.eu1.observability.splunkcloud.com/v2/trace/otlp"
OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
OTEL_EXPORTER_OTLP_HEADERS="X-SF-Token=<your-ingest-access-token>"
OTEL_SERVICE_NAME="litellm-proxy"
```

**3단계:** 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

## Trace 확인 {#verify-traces}

1. Splunk Observability Cloud에서 **APM** / **Traces**를 엽니다(제품 이름은 버전에 따라 다를 수 있음).
2. 서비스 이름으로 필터링합니다(`OTEL_SERVICE_NAME`, 설정하지 않은 경우 기본값 `litellm`).
3. 필요하면 LiteLLM 환경에서 `OTEL_DEBUG=True`를 설정해 exporter 문제를 로그에 표시합니다([OpenTelemetry 문제 해결](/litellm-docs-kr/docs/observability/opentelemetry_integration#not-seeing-traces-land-on-integration) 참고).

## 함께 보기 {#see-also}

- [OpenTelemetry — LLM Trace 추적](./opentelemetry_integration.md)
- [Splunk Observability Cloud — OTLP exporter](https://docs.splunk.com/observability/en/gdi/opentelemetry/opentelemetry.html)(공급업체 문서)
