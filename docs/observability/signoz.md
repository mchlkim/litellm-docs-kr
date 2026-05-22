import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SigNoz LiteLLM 통합 {#signoz-litellm-integration}

LiteLLM의 observability 설정에 대한 자세한 내용은 [SigNoz LiteLLM observability 문서](https://signoz.io/docs/litellm-observability/)를 확인하세요.


## 개요

이 가이드는 [OpenTelemetry](https://opentelemetry.io/)를 사용해 LiteLLM SDK 및 Proxy Server의 observability와 모니터링을 설정하고, 로그, 트레이스, 메트릭을 SigNoz로 내보내는 과정을 안내합니다. 이 통합을 사용하면 다양한 모델의 성능을 관찰하고, 요청/응답 세부 정보를 캡처하며, SigNoz에서 시스템 수준 메트릭을 추적할 수 있어 LiteLLM 애플리케이션의 지연 시간, 오류율, 사용량 추세를 실시간으로 파악할 수 있습니다.

AI 애플리케이션에서 LiteLLM을 텔레메트리로 계측하면 AI 워크플로 전반의 observability를 확보할 수 있어 문제 디버깅, 성능 최적화, 사용자 상호작용 이해가 쉬워집니다. SigNoz를 활용하면 통합 대시보드에서 서로 연관된 트레이스, 로그, 메트릭을 분석하고, 알림을 구성하며, 안정성, 응답성, 사용자 경험을 지속적으로 개선하는 데 필요한 실행 가능한 인사이트를 얻을 수 있습니다.

## 사전 준비

- 활성 ingestion key가 있는 [SigNoz Cloud 계정](https://signoz.io/teams/)
- SigNoz Cloud로 텔레메트리 데이터를 보내기 위한 인터넷 연결
- [LiteLLM](https://www.litellm.ai/) SDK 또는 Proxy 통합
- Python 사용 시: Python 패키지 관리를 위한 `uv` 설치 및 의존성 격리를 위한 Python 가상 환경(_선택 사항이지만 권장_)

## LiteLLM 모니터링 {#monitoring-litellm}

LiteLLM은 두 가지 방식으로 모니터링할 수 있습니다. 프로그래밍 방식의 LLM 호출을 위해 Python 애플리케이션 코드에 직접 포함하는 **LiteLLM SDK**를 사용하거나, 인프라 전반의 LLM 요청을 중앙에서 관리하고 라우팅하는 독립 실행형 서버인 **LiteLLM Proxy Server**를 사용할 수 있습니다.

<Tabs>
<TabItem value="LiteLLM SDK" label="LiteLLM SDK" default>

LiteLLM SDK 애플리케이션 계측에 대한 더 자세한 정보는 [여기](https://docs.litellm.ai/docs/observability/opentelemetry_integration)를 클릭하세요.


<Tabs>
<TabItem value="No Code" label="No Code(권장)" default>

최소한의 코드 변경으로 빠르게 설정하려면 no-code 자동 계측을 권장합니다. 애플리케이션 코드를 수정하지 않고 observability를 빠르게 실행해야 하며 표준 instrumentor 라이브러리를 활용하는 경우에 적합합니다.

**1단계:** Python 환경에 필요한 패키지를 설치합니다.

```bash
uv add \
  opentelemetry-api \
  opentelemetry-distro \
  opentelemetry-exporter-otlp \
  httpx \
  opentelemetry-instrumentation-httpx \
  litellm
```

**2단계:** 자동 계측을 추가합니다.

```bash
opentelemetry-bootstrap --action=install
```

**3단계:** LiteLLM SDK 애플리케이션을 계측합니다.

`litellm.callbacks = ["otel"]`을 호출해 LiteLLM SDK 계측을 초기화합니다.

```python
from litellm import litellm

litellm.callbacks = ["otel"]
```

이 호출은 애플리케이션의 모든 LiteLLM SDK 호출에 대해 자동 트레이싱, 로그, 메트릭 수집을 활성화합니다.

> 📌 참고: 애플리케이션 계측이 올바르게 구성되도록 LiteLLM 관련 호출보다 먼저 호출해야 합니다.

**4단계:** 예제를 실행합니다.

```python
from litellm import completion, litellm

litellm.callbacks = ["otel"]

response = completion(
  model="openai/gpt-4o",
  messages=[{ "content": "What is SigNoz","role": "user"}]
)

print(response)
```

> 📌 참고: LiteLLM은 LLM용 [다양한 모델 공급자](https://docs.litellm.ai/docs/providers)를 지원합니다. 이 예제에서는 OpenAI를 사용합니다. 이 코드를 실행하기 전에 생성한 API 키로 환경 변수 `OPENAI_API_KEY`를 설정했는지 확인하세요.

**5단계:** 자동 계측으로 애플리케이션을 실행합니다.

```bash
OTEL_RESOURCE_ATTRIBUTES="service.name=<service_name>" \
OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.<region>.signoz.cloud:443" \
OTEL_EXPORTER_OTLP_HEADERS="signoz-ingestion-key=<your_ingestion_key>" \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_TRACES_EXPORTER=otlp \
OTEL_METRICS_EXPORTER=otlp \
OTEL_LOGS_EXPORTER=otlp \
OTEL_PYTHON_LOG_CORRELATION=true \
OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true \
OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=openai \
opentelemetry-instrument <your_run_command>
```

> 참고: OTLP gRPC에는 `grpcio`가 필요합니다. `uv add "litellm[grpc]"` 또는 `grpcio`로 설치하세요.

> 📌 참고: 실행 명령에서 `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=openai`를 사용해 트레이싱용 OpenAI instrumentor를 비활성화합니다. 이렇게 하면 LiteLLM의 네이티브 텔레메트리/계측과의 충돌을 피하고, LiteLLM에 내장된 계측을 통해서만 텔레메트리가 캡처되도록 할 수 있습니다.

- **`<service_name>`** 은 서비스 이름입니다.
- `<region>`은 SigNoz Cloud [region](https://signoz.io/docs/ingestion/signoz-cloud/overview/#endpoint)에 맞게 설정합니다.
- `<your_ingestion_key>`를 SigNoz [ingestion key](https://signoz.io/docs/ingestion/signoz-cloud/keys/)로 바꿉니다.
- `<your_run_command>`를 애플리케이션 실행에 실제로 사용할 명령으로 바꿉니다. 예: `python main.py`

> 📌 참고: 자체 호스팅 SigNoz를 사용 중인가요? 대부분의 단계는 동일합니다. 이 가이드를 맞게 조정하려면 [Cloud → Self-Hosted](https://signoz.io/docs/ingestion/cloud-vs-self-hosted/#cloud-to-self-hosted)에 나온 것처럼 endpoint를 업데이트하고 ingestion key header를 제거하세요.


</TabItem>

<TabItem value="Code" label="Code" default>

코드 기반 계측은 텔레메트리 구성을 세밀하게 제어할 수 있게 해줍니다. resource attribute, 샘플링 전략을 사용자 지정하거나 기존 observability 인프라와 통합해야 할 때 이 방식을 사용하세요.

**1단계:** Python 환경에 필요한 패키지를 설치합니다.

```bash
uv add \
  opentelemetry-api \
  opentelemetry-sdk \
  opentelemetry-exporter-otlp \
  opentelemetry-instrumentation-httpx \
  opentelemetry-instrumentation-system-metrics \
  litellm
```

**2단계:** Python 애플리케이션에서 필요한 모듈을 가져옵니다.

**트레이스:**

```python
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
```

**로그:**

```python
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry._logs import set_logger_provider
import logging
```

**메트릭:**

```python
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry import metrics
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
```

**3단계:** 트레이스를 SigNoz Cloud로 직접 보내도록 OpenTelemetry Tracer Provider를 설정합니다.

```python
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry import trace
import os

resource = Resource.create({"service.name": "<service_name>"})
provider = TracerProvider(resource=resource)
span_exporter = OTLPSpanExporter(
    endpoint= os.getenv("OTEL_EXPORTER_TRACES_ENDPOINT"),
    headers={"signoz-ingestion-key": os.getenv("SIGNOZ_INGESTION_KEY")},
)
processor = BatchSpanProcessor(span_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

- **`<service_name>`** 은 서비스 이름입니다.
- **`OTEL_EXPORTER_TRACES_ENDPOINT`** → 적절한 [region](https://signoz.io/docs/ingestion/signoz-cloud/overview/#endpoint)이 포함된 SigNoz Cloud trace endpoint:`https://ingest.<region>.signoz.cloud:443/v1/traces`
- **`SIGNOZ_INGESTION_KEY`** → SigNoz [ingestion key](https://signoz.io/docs/ingestion/signoz-cloud/keys/)


> 📌 참고: 자체 호스팅 SigNoz를 사용 중인가요? 대부분의 단계는 동일합니다. 이 가이드를 맞게 조정하려면 [Cloud → Self-Hosted](https://signoz.io/docs/ingestion/cloud-vs-self-hosted/#cloud-to-self-hosted)에 나온 것처럼 endpoint를 업데이트하고 ingestion key header를 제거하세요.


**4단계**: 로그를 설정합니다.

```python
import logging
from opentelemetry.sdk.resources import Resource
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
import os

resource = Resource.create({"service.name": "<service_name>"})
logger_provider = LoggerProvider(resource=resource)
set_logger_provider(logger_provider)

otlp_log_exporter = OTLPLogExporter(
    endpoint= os.getenv("OTEL_EXPORTER_LOGS_ENDPOINT"),
    headers={"signoz-ingestion-key": os.getenv("SIGNOZ_INGESTION_KEY")},
)
logger_provider.add_log_record_processor(
    BatchLogRecordProcessor(otlp_log_exporter)
)
# Attach OTel logging handler to root logger
handler = LoggingHandler(level=logging.INFO, logger_provider=logger_provider)
logging.basicConfig(level=logging.INFO, handlers=[handler])

logger = logging.getLogger(__name__)
```

- **`<service_name>`** 은 서비스 이름입니다.
- **`OTEL_EXPORTER_LOGS_ENDPOINT`** → 적절한 [region](https://signoz.io/docs/ingestion/signoz-cloud/overview/#endpoint)이 포함된 SigNoz Cloud endpoint:`https://ingest.<region>.signoz.cloud:443/v1/logs`
- **`SIGNOZ_INGESTION_KEY`** → SigNoz [ingestion key](https://signoz.io/docs/ingestion/signoz-cloud/keys/)

> 📌 참고: 자체 호스팅 SigNoz를 사용 중인가요? 대부분의 단계는 동일합니다. 이 가이드를 맞게 조정하려면 [Cloud → Self-Hosted](https://signoz.io/docs/ingestion/cloud-vs-self-hosted/#cloud-to-self-hosted)에 나온 것처럼 endpoint를 업데이트하고 ingestion key header를 제거하세요.


**5단계**: 메트릭을 설정합니다.

```python
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry import metrics
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
import os

resource = Resource.create({"service.name": "<service-name>"})
metric_exporter = OTLPMetricExporter(
    endpoint= os.getenv("OTEL_EXPORTER_METRICS_ENDPOINT"),
    headers={"signoz-ingestion-key": os.getenv("SIGNOZ_INGESTION_KEY")},
)
reader = PeriodicExportingMetricReader(metric_exporter)
metric_provider = MeterProvider(metric_readers=[reader], resource=resource)
metrics.set_meter_provider(metric_provider)

meter = metrics.get_meter(__name__)

# turn on out-of-the-box metrics
SystemMetricsInstrumentor().instrument()
HTTPXClientInstrumentor().instrument()
```

- **`<service_name>`** 은 서비스 이름입니다.
- **`OTEL_EXPORTER_METRICS_ENDPOINT`** → 적절한 [region](https://signoz.io/docs/ingestion/signoz-cloud/overview/#endpoint)이 포함된 SigNoz Cloud endpoint:`https://ingest.<region>.signoz.cloud:443/v1/metrics`
- **`SIGNOZ_INGESTION_KEY`** → SigNoz [ingestion key](https://signoz.io/docs/ingestion/signoz-cloud/keys/)

> 📌 참고: 자체 호스팅 SigNoz를 사용 중인가요? 대부분의 단계는 동일합니다. 이 가이드를 맞게 조정하려면 [Cloud → Self-Hosted](https://signoz.io/docs/ingestion/cloud-vs-self-hosted/#cloud-to-self-hosted)에 나온 것처럼 endpoint를 업데이트하고 ingestion key header를 제거하세요.


> 📌 참고: SystemMetricsInstrumentor는 시스템 메트릭(CPU, 메모리 등)을 제공하고, HTTPXClientInstrumentor는 요청 지속 시간 같은 outbound HTTP 요청 메트릭을 제공합니다. LiteLLM 애플리케이션에 사용자 지정 메트릭을 추가하려면 [Python Custom Metrics](https://signoz.io/opentelemetry/python-custom-metrics/)를 참고하세요.

**6단계:** LiteLLM 애플리케이션을 계측합니다.

`litellm.callbacks = ["otel"]`을 호출해 LiteLLM SDK 계측을 초기화합니다.

```python
from litellm import litellm

litellm.callbacks = ["otel"]
```

이 호출은 애플리케이션의 모든 LiteLLM SDK 호출에 대해 자동 트레이싱, 로그, 메트릭 수집을 활성화합니다.

> 📌 참고: 애플리케이션 계측이 올바르게 구성되도록 LiteLLM 관련 호출보다 먼저 호출해야 합니다.

**7단계:** 예제를 실행합니다.

```python
from litellm import completion, litellm

litellm.callbacks = ["otel"]

response = completion(
  model="openai/gpt-4o",
  messages=[{ "content": "What is SigNoz","role": "user"}]
)

print(response)
```

> 📌 참고: LiteLLM은 LLM용 [다양한 모델 공급자](https://docs.litellm.ai/docs/providers)를 지원합니다. 이 예제에서는 OpenAI를 사용합니다. 이 코드를 실행하기 전에 생성한 API 키로 환경 변수 `OPENAI_API_KEY`를 설정했는지 확인하세요.

</TabItem>
</Tabs>

## SigNoz에서 트레이스, 로그, 메트릭 보기 {#view-traces-logs-and-metrics-in-signoz}

이제 LiteLLM 명령은 트레이스, 로그, 메트릭을 자동으로 내보내야 합니다.

Signoz Cloud의 traces 탭에서 트레이스를 볼 수 있습니다.

![LiteLLM SDK 트레이스 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-traces.webp)

SigNoz에서 트레이스를 클릭하면 관련된 모든 span과 해당 이벤트 및 attribute가 포함된 트레이스 상세 보기가 표시됩니다.

![LiteLLM SDK 상세 트레이스 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-detailed-traces.webp)

Signoz Cloud의 logs 탭에서 로그를 볼 수 있습니다. 트레이스 보기에서 “Related Logs” 버튼을 클릭해 연관된 로그를 볼 수도 있습니다.

![LiteLLM SDK 로그 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-logs.webp)

SigNoz에서 이러한 로그 중 하나를 클릭하면 attribute가 포함된 로그 상세 보기가 표시됩니다.

![LiteLLM SDK 상세 로그 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-detailed-logs.webp)

Signoz Cloud의 metrics 탭에서 LiteLLM 관련 메트릭을 볼 수 있습니다.

![LiteLLM SDK 메트릭 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-metrics.webp)

SigNoz에서 이러한 메트릭 중 하나를 클릭하면 attribute가 포함된 메트릭 상세 보기가 표시됩니다.

![LiteLLM 상세 메트릭 보기](https://signoz.io/img/docs/llm/litellm/litellmsdk-detailed-metrics.webp)

## 대시보드 {#dashboard}

애플리케이션에서 LiteLLM 사용량을 모니터링하기 위한 특화된 시각화를 제공하는 사용자 지정 LiteLLM SDK 대시보드는 [여기](https://signoz.io/docs/dashboards/dashboard-templates/litellm-sdk-dashboard/)에서 확인할 수 있습니다. 이 대시보드에는 빠르게 시작할 수 있도록 LLM 사용량에 맞춰 미리 구성된 차트와 가져오기 안내가 포함되어 있습니다.

![LiteLLM SDK 대시보드 템플릿](https://signoz.io/img/docs/llm/litellm/litellm-sdk-dashboard.webp)

</TabItem>

<TabItem value="LiteLLM Proxy Server" label="LiteLLM Proxy Server" default>

**1단계:** Python 환경에 필요한 패키지를 설치합니다.

```bash
uv add opentelemetry-api \
  opentelemetry-sdk \
  opentelemetry-exporter-otlp \
  'litellm[proxy]'
```

**2단계:** LiteLLM Proxy Server용 otel을 구성합니다.

`config.yaml`에 다음 내용을 추가합니다.

```yaml
litellm_settings:
  callbacks: ['otel']
```

**3단계:** 다음 환경 변수를 설정합니다.

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.<region>.signoz.cloud:443"
export OTEL_EXPORTER_OTLP_HEADERS="signoz-ingestion-key=<your_ingestion_key>"
export OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
```

> 참고: OTLP gRPC에는 `grpcio`가 필요합니다. `uv add "litellm[grpc]"` 또는 `grpcio`로 설치하세요.

- `<region>`은 SigNoz Cloud [region](https://signoz.io/docs/ingestion/signoz-cloud/overview/#endpoint)에 맞게 설정합니다.
- `<your_ingestion_key>`를 SigNoz [ingestion key](https://signoz.io/docs/ingestion/signoz-cloud/keys/)로 바꿉니다.

> 📌 참고: 자체 호스팅 SigNoz를 사용 중인가요? 대부분의 단계는 동일합니다. 이 가이드를 맞게 조정하려면 [Cloud → Self-Hosted](https://signoz.io/docs/ingestion/cloud-vs-self-hosted/#cloud-to-self-hosted)에 나온 것처럼 endpoint를 업데이트하고 ingestion key header를 제거하세요.


**4단계:** config 파일을 사용해 proxy server를 실행합니다.

```bash
litellm --config config.yaml
```

이제 LiteLLM proxy server를 통해 이루어지는 모든 호출이 추적되어 SigNoz로 전송됩니다.

Signoz Cloud의 traces 탭에서 트레이스를 볼 수 있습니다.

![LiteLLM Proxy 트레이스 보기](https://signoz.io/img/docs/llm/litellm/litellmproxy-traces.webp)

SigNoz에서 트레이스를 클릭하면 관련된 모든 span과 해당 이벤트 및 attribute가 포함된 트레이스 상세 보기가 표시됩니다.

![LiteLLM Proxy 상세 트레이스 보기](https://signoz.io/img/docs/llm/litellm/litellmproxy-detailed-traces.webp)

## 대시보드 {#dashboard-1}

애플리케이션에서 LiteLLM Proxy 사용량을 모니터링하기 위한 특화된 시각화를 제공하는 사용자 지정 LiteLLM Proxy 대시보드는 [여기](https://signoz.io/docs/dashboards/dashboard-templates/litellm-proxy-dashboard/)에서 확인할 수 있습니다. 이 대시보드에는 빠르게 시작할 수 있도록 LLM 사용량에 맞춰 미리 구성된 차트와 가져오기 안내가 포함되어 있습니다.

![LiteLLM Proxy 대시보드 템플릿](https://signoz.io/img/docs/llm/litellm/litellm-proxy-dashboard.webp)

</TabItem>
</Tabs>
