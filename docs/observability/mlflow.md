import Image from '@theme/IdealImage';

# 🔁 MLflow - OSS LLM 관측성 및 평가

## MLflow란? {#what-is-mlflow}

**MLflow**는 [실험 추적](https://www.mlflow.org/docs/latest/tracking.html), [모델 관리](https://www.mlflow.org/docs/latest/models.html), [평가](https://www.mlflow.org/docs/latest/llms/llm-evaluate/index.html), [관측성(트레이싱)](https://www.mlflow.org/docs/latest/llms/tracing/index.html), [배포](https://www.mlflow.org/docs/latest/deployment/index.html)를 위한 엔드투엔드 오픈 소스 MLOps 플랫폼입니다. MLflow는 팀이 LLM 애플리케이션을 효율적으로 공동 개발하고 개선할 수 있도록 지원합니다.

MLflow의 LiteLLM 통합은 OpenTelemetry와 호환되는 고급 관측성을 지원합니다.


<Image img={require('../../img/mlflow_tracing.png')} />


## 시작하기

MLflow를 설치합니다.

```shell
uv add "litellm[mlflow]"
```

LiteLLM에 대해 MLflow 자동 트레이싱을 활성화합니다.

```python
import mlflow

mlflow.litellm.autolog()

# Alternative, you can set the callback manually in LiteLLM
# litellm.callbacks = ["mlflow"]
```

MLflow는 오픈 소스이며 무료이므로, **트레이스를 기록하기 위해 가입이나 API 키가 필요하지 않습니다!**

```python
import litellm
import os

# Set your LLM provider's API key
os.environ["OPENAI_API_KEY"] = ""

# Call LiteLLM as usual
response = litellm.completion(
    model="gpt-4o-mini",
    messages=[
      {"role": "user", "content": "Hi 👋 - i'm openai"}
    ]
)
```

MLflow UI를 열고 `Traces` 탭으로 이동하면 기록된 트레이스를 볼 수 있습니다.

```bash
mlflow ui
```

## 도구 호출 트레이싱 {#tracing-tool-calls}

MLflow와 LiteLLM 통합은 메시지뿐 아니라 도구 호출 추적도 지원합니다.

```python
import mlflow

# Enable MLflow auto-tracing for LiteLLM
mlflow.litellm.autolog()

# Define the tool function.
def get_weather(location: str) -> str:
    if location == "Tokyo":
        return "sunny"
    elif location == "Paris":
        return "rainy"
    return "unknown"

# Define function spec
get_weather_tool = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
            "properties": {
                "location": {
                    "description": "The city and state, e.g., San Francisco, CA",
                    "type": "string",
                },
            },
            "required": ["location"],
            "type": "object",
        },
    },
}

# Call LiteLLM as usual
response = litellm.completion(
    model="gpt-4o-mini",
    messages=[
      {"role": "user", "content": "What's the weather like in Paris today?"}
    ],
    tools=[get_weather_tool]
)
```

<Image img={require('../../img/mlflow_tool_calling_tracing.png')} />


## 평가 {#evaluation}

MLflow LiteLLM 통합을 사용하면 LLM에 대한 정성 평가를 실행하여 GenAI 애플리케이션을 평가하거나 모니터링할 수 있습니다.

LiteLLM 및 MLflow로 평가 스위트를 실행하는 전체 가이드는 [LLM 평가 튜토리얼](../tutorials/eval_suites.md)을 참고하세요.


## OpenTelemetry collector로 트레이스 내보내기 {#exporting-traces-to-opentelemetry-collectors}

MLflow 트레이스는 OpenTelemetry와 호환됩니다. 환경 변수에 엔드포인트 URL을 설정하면 트레이스를 모든 OpenTelemetry collector(예: Jaeger, Zipkin, Datadog, New Relic)로 내보낼 수 있습니다.

```
# Set the endpoint of the OpenTelemetry Collector
os.environ["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] = "http://localhost:4317/v1/traces"
# Optionally, set the service name to group traces
os.environ["OTEL_SERVICE_NAME"] = "<your-service-name>"
```

자세한 내용은 [MLflow 문서](https://mlflow.org/docs/latest/llms/tracing/index.html#using-opentelemetry-collector-for-exporting-traces)를 참고하세요.

## LiteLLM 트레이스와 애플리케이션 트레이스 결합 {#combine-litellm-trace-with-your-application-trace}

LiteLLM은 에이전트형 모델과 같은 더 큰 LLM 애플리케이션의 일부로 사용되는 경우가 많습니다. MLflow Tracing을 사용하면 사용자 지정 Python 코드를 계측할 수 있으며, 이 트레이스를 LiteLLM 트레이스와 결합할 수 있습니다.

```python
import litellm
import mlflow
from mlflow.entities import SpanType

# Enable MLflow auto-tracing for LiteLLM
mlflow.litellm.autolog()


class CustomAgent:
    # Use @mlflow.trace to instrument Python functions.
    @mlflow.trace(span_type=SpanType.AGENT)
    def run(self, query: str):
        # do something

        while i < self.max_turns:
            response = litellm.completion(
                model="gpt-4o-mini",
                messages=messages,
            )

            action = self.get_action(response)
            ...

    @mlflow.trace
    def get_action(llm_response):
        ...
```

이 방식은 사용자 지정 Python 코드와 LiteLLM 호출을 결합한 통합 트레이스를 생성합니다.

## LiteLLM Proxy 서버 {#litellm-proxy-server}

### 의존성 {#dependencies}

LiteLLM Proxy Server에서 `mlflow`를 사용하려면 Docker 컨테이너에 `mlflow` 패키지를 설치해야 합니다.

```shell
uv add "mlflow>=3.1.4"
```

### 설정

LiteLLM proxy 설정 파일에서 MLflow를 구성합니다.

```yaml
model_list:
  - model_name: openai/*
    litellm_params:
      model: openai/*

litellm_settings:
  success_callback: ["mlflow"]
  failure_callback: ["mlflow"]
```

### 환경 변수 {#environment-variables}

Databricks 서비스와 함께 MLflow를 사용하려면 다음 필수 환경 변수를 설정합니다.

```shell
DATABRICKS_TOKEN="dapixxxxx"
DATABRICKS_HOST="https://dbc-xxxx.cloud.databricks.com"
MLFLOW_TRACKING_URI="databricks"
MLFLOW_REGISTRY_URI="databricks-uc"
MLFLOW_EXPERIMENT_ID="xxxx"
```

### 더 나은 트레이싱을 위한 태그 추가 {#adding-tags-for-better-tracing}

MLflow에서 트레이스 구성과 필터링을 개선하기 위해 요청에 사용자 지정 태그를 추가할 수 있습니다. 태그를 사용하면 작업 ID, 태스크 이름 또는 사용자 지정 메타데이터 기준으로 트레이스를 분류하고 검색할 수 있습니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="curl" label="curl">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
    "model": "gemini-2.5-flash",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "litellm_metadata": {
        "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
    }
}'
```

</TabItem>
<TabItem value="openai-python" label="OpenAI Python SDK">

```python
from openai import OpenAI

# Initialize the OpenAI client pointing to your LiteLLM proxy
client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy API key
    base_url="http://0.0.0.0:4000"  # Your LiteLLM proxy URL
)

# Make a request with tags in metadata
response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "user", 
            "content": "what llm are you"
        }
    ],
    extra_body={
        "litellm_metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
        }
    }
)
```

</TabItem>
</Tabs>

## 지원 {#support}

* 트레이싱의 고급 사용법과 통합은 [MLflow Tracing 문서](https://mlflow.org/docs/latest/llms/tracing/index.html)을 참고하세요.
* 이 통합에 대한 질문이나 문제가 있으면 [GitHub](https://github.com/mlflow/mlflow) 저장소에 [이슈를 제출](https://github.com/mlflow/mlflow/issues/new/choose)해 주세요!
