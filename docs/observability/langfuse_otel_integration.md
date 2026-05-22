import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';

# 🪢 Langfuse OpenTelemetry 통합

Langfuse OpenTelemetry 통합을 사용하면 OpenTelemetry 프로토콜로 LiteLLM trace와 관측성 데이터를 Langfuse에 보낼 수 있습니다. 이를 통해 LLM 사용 데이터를 표준화된 방식으로 수집하고 분석할 수 있습니다.

<Image img={require('../../img/langfuse_otel.png')} />

## 기능

- 모든 LiteLLM 요청에 대한 자동 trace 수집
- Langfuse Cloud 지원(EU 및 US region)
- self-hosted Langfuse instance 지원
- 사용자 지정 endpoint 설정
- Basic Auth를 사용한 안전한 인증
- 다른 OTEL 통합과 일관된 attribute mapping

## 사전 준비

1. **Langfuse 계정**: [Langfuse Cloud](https://cloud.langfuse.com)에 가입하거나 self-hosted instance를 설정합니다.
2. **API key**: Langfuse project settings에서 public key와 secret key를 가져옵니다.
3. **의존성**: 필요한 패키지를 설치합니다.
   ```bash
   uv add litellm opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp
   ```

## 설정

### 환경 변수

| 변수 | 필수 | 설명 | 예제 |
|----------|----------|-------------|---------|
| `LANGFUSE_PUBLIC_KEY` | 예 | Langfuse public key | `pk-lf-...` |
| `LANGFUSE_SECRET_KEY` | 예 | Langfuse secret key | `sk-lf-...` |
| `LANGFUSE_OTEL_HOST` | 아니요 | OTEL endpoint host | `https://otel.my-langfuse.com` |

### Endpoint 확인

이 통합은 `LANGFUSE_OTEL_HOST`에서 OTEL endpoint를 자동으로 구성합니다.
- **기본값(US)**: `https://us.cloud.langfuse.com/api/public/otel`
- **EU region**: `https://cloud.langfuse.com/api/public/otel`
- **Self-hosted**: `{LANGFUSE_OTEL_HOST}/api/public/otel`

## 사용법

### 기본 설정

```python
import os
import litellm

# Set your Langfuse credentials
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..."

# Enable Langfuse OTEL integration
litellm.callbacks = ["langfuse_otel"]

# Make LLM requests as usual
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 고급 설정

```python
import os
import litellm

# Set your Langfuse credentials
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..."

# Use EU region
os.environ["LANGFUSE_OTEL_HOST"] = "https://cloud.langfuse.com"  # EU region
# os.environ["LANGFUSE_OTEL_HOST"] = "https://otel.my-langfuse.company.com"  # custom OTEL endpoint

# Or use self-hosted instance
# os.environ["LANGFUSE_OTEL_HOST"] = "https://my-langfuse.company.com"

# Optional: Ignore otel context propagation to prevent parent-child relationships with spans from other providers
# os.environ["OTEL_IGNORE_CONTEXT_PROPAGATION"] = "true"

litellm.callbacks = ["langfuse_otel"]
```

### 수동 OTEL 설정

OpenTelemetry 설정을 직접 제어해야 하는 경우:

```python
import os
import base64
import litellm

# Get keys for your project from the project settings page: https://cloud.langfuse.com
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..." 
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..." 
os.environ["LANGFUSE_OTEL_HOST"] = "https://cloud.langfuse.com" # EU region
# os.environ["LANGFUSE_OTEL_HOST"] = "https://us.cloud.langfuse.com" # US region
# os.environ["LANGFUSE_OTEL_HOST"] = "https://otel.my-langfuse.company.com" # custom OTEL endpoint

LANGFUSE_AUTH = base64.b64encode(
    f"{os.environ.get('LANGFUSE_PUBLIC_KEY')}:{os.environ.get('LANGFUSE_SECRET_KEY')}".encode()
).decode()

host = os.environ.get("LANGFUSE_OTEL_HOST")
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = host + "/api/public/otel"
os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {LANGFUSE_AUTH}"

litellm.callbacks = ["langfuse_otel"]
```

### LiteLLM Proxy에서 사용

Proxy 설정에 통합을 추가합니다.

1. 환경 변수에 credential을 추가합니다.

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_OTEL_HOST="https://us.cloud.langfuse.com"  # Default US region
# export LANGFUSE_OTEL_HOST="https://otel.my-langfuse.company.com"  # custom OTEL endpoint

# Optional: Ignore otel context propagation to prevent parent-child relationships with spans from other providers
# export OTEL_IGNORE_CONTEXT_PROPAGATION="true"
```

2. config.yaml을 설정합니다.

```yaml
# config.yaml
litellm_settings:
  callbacks: ["langfuse_otel"]
```

3. Proxy를 실행합니다.

```bash
litellm --config /path/to/config.yaml
```

## 수집되는 데이터

이 통합은 다음 데이터를 자동으로 수집합니다.

- **요청 세부 정보**: model, messages, parameter(temperature, max_tokens 등)
- **응답 세부 정보**: 생성된 content, token usage, finish reason
- **타이밍 정보**: 요청 소요 시간, 첫 토큰까지 걸린 시간
- **Metadata**: user ID, session ID, custom tag(제공된 경우)
- **오류 정보**: exception 세부 정보 및 stack trace(오류 발생 시)

## Metadata 지원

기본 Langfuse 통합에서 사용할 수 있는 모든 metadata field는 OTEL 통합에서도 이제 **완전히 지원됩니다**.

- `metadata` dictionary에 전달하는 모든 key(`generation_name`, `trace_id`, `session_id`, `tags` 등)는 OpenTelemetry span attribute로 export됩니다.
- Attribute name에는 `langfuse.` prefix가 붙으므로 관측성 backend에서 쉽게 필터링하거나 검색할 수 있습니다.
  예제: `langfuse.generation.name`, `langfuse.trace.id`, `langfuse.trace.session_id`.

### Metadata 전달 예제

```python
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}],
    metadata={
        "generation_name": "welcome-message",
        "trace_id": "trace-123",
        "session_id": "sess-42",
        "tags": ["prod", "beta-user"]
    }
)
```

결과 span에는 다음과 유사한 attribute가 포함됩니다.

```
langfuse.generation.name   = "welcome-message"
langfuse.trace.id          = "trace-123"
langfuse.trace.session_id  = "sess-42"
langfuse.trace.tags        = ["prod", "beta-user"]
```

`langfuse.*` attribute가 포함된 span을 검색, 필터링, 분석하려면 **Langfuse UI**(Traces tab)를 사용하세요.
이 통합의 OTEL exporter는 데이터를 Langfuse의 OTLP HTTP endpoint로 직접 전송합니다. Grafana, Honeycomb, Datadog 또는 기타 범용 OTEL backend 용도가 **아닙니다**.

## 인증

이 통합은 Langfuse public key와 secret key로 HTTP Basic 인증을 사용합니다.

```
Authorization: Basic <base64(public_key:secret_key)>
```

이는 통합에서 자동으로 처리합니다. 환경 변수를 통해 key만 제공하면 됩니다.

## 문제 해결

### 자주 발생하는 문제

1. **Credential 누락 오류**
   ```
   ValueError: LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be set
   ```
   **해결 방법**: 두 환경 변수가 모두 유효한 key로 설정되어 있는지 확인합니다.

2. **연결 문제**
   - 인터넷 연결을 확인합니다.
   - endpoint URL이 올바른지 확인합니다.
   - self-hosted instance의 경우 `/api/public/otel` endpoint에 접근할 수 있는지 확인합니다.

3. **인증 오류**
   - public key와 secret key가 올바른지 확인합니다.
   - key가 동일한 Langfuse project에 속하는지 확인합니다.
   - key에 필요한 권한이 있는지 확인합니다.

### 디버그 모드

자세한 정보를 보려면 verbose logging을 활성화합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
litellm._turn_on_debug()
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
export LITELLM_LOG="DEBUG"
```

</TabItem>
</Tabs>

다음 정보를 확인할 수 있습니다.
- Endpoint 확인 로직
- 인증 header 생성
- OTEL trace 제출 세부 정보

## 관련 링크

- [Langfuse 문서](https://langfuse.com/docs)
- [Langfuse OpenTelemetry 가이드](https://langfuse.com/docs/integrations/opentelemetry)
- [OpenTelemetry Python SDK](https://opentelemetry.io/docs/languages/python/)
- [LiteLLM 관측성](https://docs.litellm.ai/docs/observability/) 
