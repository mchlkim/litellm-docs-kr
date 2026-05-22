import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM으로 Elasticsearch 로깅하기 {#elasticsearch-logging-with-litellm}

OpenTelemetry를 사용해 LLM 요청, 응답, 비용, 성능 데이터를 Elasticsearch로 보내 분석과 모니터링에 활용합니다.

<Image img={require('../../img/elasticsearch_demo.png')} />

## 빠른 시작

### 1. Elasticsearch 시작 {#start-elasticsearch}

```bash
# Using Docker (simplest)
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.18.2
```

### 2. OpenTelemetry Collector 설정 {#set-up-opentelemetry-collector}

`otel_config.yaml` OTEL collector 구성 파일을 만듭니다.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  debug:
    verbosity: detailed
  otlphttp/elastic:
    endpoint: "http://localhost:9200"
    headers: 
      "Content-Type": "application/json"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [debug, otlphttp/elastic]
    traces:
      receivers: [otlp]
      exporters: [debug, otlphttp/elastic]
    logs: 
      receivers: [otlp]
      exporters: [debug, otlphttp/elastic]
```

OpenTelemetry collector를 시작합니다.
```bash
docker run -p 4317:4317 -p 4318:4318 \
    -v $(pwd)/otel_config.yaml:/etc/otel-collector-config.yaml \
    otel/opentelemetry-collector:latest \
    --config=/etc/otel-collector-config.yaml
```

### 3. OpenTelemetry 의존성 설치 {#install-opentelemetry-dependencies}

```bash
uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp
```

### 4. LiteLLM 구성 {#configure-litellm}

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

`config.yaml` 파일을 만듭니다.

```yaml
model_list:
  - model_name: gpt-4.1
    litellm_params:
      model: openai/gpt-4.1
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["otel"]

general_settings:
  otel: true
```

환경 변수를 설정하고 proxy를 시작합니다.
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"
litellm --config config.yaml
```

</TabItem>
<TabItem value="python-sdk" label="Python SDK">

Python 코드에서 OpenTelemetry를 구성합니다.

```python
import litellm
import os

# Configure OpenTelemetry
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4317"

# Enable OTEL logging
litellm.callbacks = ["otel"]

# Make your LLM calls
response = litellm.completion(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Hello, world!"}]
)
```

</TabItem>
</Tabs>

### 5. 연동 테스트 {#test-the-integration}

로깅이 작동하는지 확인하기 위해 테스트 요청을 보냅니다.

<Tabs>
<TabItem value="curl-proxy" label="Test Proxy">

```bash
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4.1",
    "messages": [{"role": "user", "content": "Hello from LiteLLM!"}]
  }'
```

</TabItem>
<TabItem value="python-test" label="Test Python SDK">

```python
import litellm

response = litellm.completion(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Hello from LiteLLM!"}],
    user="test-user"
)
print("Response:", response.choices[0].message.content)
```

</TabItem>
</Tabs>

### 6. 작동 여부 확인 {#verify-its-working}

```bash
# Check if traces are being created in Elasticsearch
curl "localhost:9200/_search?pretty&size=1"
```

LLM 요청에 대한 구조화된 필드가 포함된 OpenTelemetry trace 데이터를 볼 수 있어야 합니다.

### 7. Kibana에서 시각화 {#visualize-in-kibana}

LLM telemetry 데이터를 시각화하기 위해 Kibana를 시작합니다.

```bash
docker run -d --name kibana --link elasticsearch:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:8.18.2
```

http://localhost:5601 에서 Kibana를 열고 LiteLLM trace용 index pattern을 만듭니다.

<Image img={require('../../img/elasticsearch_demo.png')} />

## 프로덕션 설정 {#production-setup}

**Elasticsearch Cloud 사용:**

`otel_config.yaml`을 업데이트합니다.
```yaml
exporters:
  otlphttp/elastic:
    endpoint: "https://your-deployment.es.region.cloud.es.io"
    headers: 
      "Authorization": "Bearer your-api-key"
      "Content-Type": "application/json"
```

**Docker Compose (전체 스택):**
```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.18.2
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      
  otel-collector:
    image: otel/opentelemetry-collector:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel_config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"
      - "4318:4318"
    depends_on:
      - elasticsearch
      
  litellm:
    image: docker.litellm.ai/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
    command: ["--config", "/app/config.yaml"]
    volumes:
      - ./config.yaml:/app/config.yaml
    depends_on:
      - otel-collector
```

**config.yaml:**
```yaml
model_list:
  - model_name: gpt-4.1
    litellm_params:
      model: openai/gpt-4.1
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  callbacks: ["otel"]

general_settings:
  master_key: sk-1234
  otel: true
```
