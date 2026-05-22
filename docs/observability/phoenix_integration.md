import Image from '@theme/IdealImage';

# Arize Phoenix OSS

오픈 소스 추적 및 평가 플랫폼

:::tip

이 통합은 커뮤니티에서 유지 관리합니다. 버그가 발생하면 이슈를 만들어 주세요:
https://github.com/BerriAI/litellm

:::


## 사전 요구 사항 {#pre-requisites}
[Phoenix OSS](https://phoenix.arize.com)에서 계정을 만드세요.
또는 자체 [Phoenix](https://docs.arize.com/phoenix/deployment) 인스턴스를 셀프 호스팅하세요.

## 빠른 시작
코드 2줄만으로 **모든 제공자**의 응답을 Phoenix에 즉시 기록할 수 있습니다.

콜백 대신 instrumentor 옵션도 사용할 수 있으며, 자세한 내용은 [여기](https://docs.arize.com/phoenix/tracing/integrations-tracing/litellm)에서 확인할 수 있습니다.

```bash
uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp litellm[proxy]
```
```python
litellm.callbacks = ["arize_phoenix"]
```
```python
import litellm
import os

# Set env variables
os.environ["PHOENIX_API_KEY"] = "d0*****" # Set the Phoenix API key here. It is necessary only when using Phoenix Cloud.
os.environ["PHOENIX_COLLECTOR_HTTP_ENDPOINT"] = "https://app.phoenix.arize.com/s/<space-name>/v1/traces" # Set the URL of your Phoenix OSS instance, otherwise tracer would use https://app.phoenix.arize.com/v1/traces for Phoenix Cloud.
os.environ["PHOENIX_PROJECT_NAME"] = "litellm" # Configure the project name, otherwise traces would go to "default" project.
os.environ['OPENAI_API_KEY'] = "fake-key" # Set the OpenAI API key here.

# Set arize_phoenix as a callback & LiteLLM will send the data to Phoenix.
litellm.callbacks = ["arize_phoenix"]

# OpenAI call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ]
)
```

## LiteLLM Proxy와 함께 사용하기 {#using-with-litellm-proxy}

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["arize_phoenix"]

general_settings:
  master_key: "sk-1234"

environment_variables:
    PHOENIX_API_KEY: "d0*****"
    PHOENIX_COLLECTOR_ENDPOINT: "https://app.phoenix.arize.com/s/<space-name>/v1/traces" # OPTIONAL - For setting the gRPC endpoint
    PHOENIX_COLLECTOR_HTTP_ENDPOINT: "https://app.phoenix.arize.com/s/<space-name>/v1/traces" # OPTIONAL - For setting the HTTP endpoint
```

> 참고: gRPC 엔드포인트를 설정하는 경우 `uv add "litellm[grpc]"`(또는 `grpcio`)로 `grpcio`를 설치하세요.

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ "model": "gpt-4o", "messages": [{"role": "user", "content": "Hi 👋 - i'm openai"}]}'
```

## 지원되는 Phoenix 엔드포인트 {#supported-phoenix-endpoints}
Phoenix는 이제 여러 배포 유형을 지원합니다. 올바른 엔드포인트는 사용 중인 Phoenix Cloud 버전에 따라 달라집니다.

**Phoenix Cloud(Spaces 포함 - 새 버전)**
Phoenix URL에 `/s/<space-name>` 경로가 포함된 경우 이것을 사용하세요.

```bash
https://app.phoenix.arize.com/s/<space-name>/v1/traces
```

**Phoenix Cloud(Legacy - Deprecated)**
배포에서 여전히 `/legacy` 패턴이 표시되는 경우에만 이것을 사용하세요.

```bash
https://app.phoenix.arize.com/legacy/v1/traces
```

**Phoenix Cloud(Spaces 없음 - 이전 버전)**
Phoenix Cloud URL에 `/s/<space-name>` 또는 `/legacy` 경로가 포함되지 않은 경우 이것을 사용하세요.

```bash
https://app.phoenix.arize.com/v1/traces
```

**Self-Hosted Phoenix(로컬 인스턴스)**
Phoenix를 내 머신이나 개인 서버에서 실행하는 경우 이것을 사용하세요.

```bash
http://localhost:6006/v1/traces
```

사용 중인 Phoenix Cloud 버전 또는 배포 방식에 따라 `PHOENIX_COLLECTOR_HTTP_ENDPOINT` 또는 `PHOENIX_COLLECTOR_ENDPOINT`에 해당 엔드포인트를 설정해야 합니다.

## 지원 및 창업자와 대화하기 {#support--talk-to-founders}

- [데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)
- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
