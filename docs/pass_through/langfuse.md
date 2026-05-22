# Langfuse SDK

Langfuse용 패스스루 엔드포인트입니다. LiteLLM Virtual Key로 langfuse 엔드포인트를 호출하세요.

`https://us.cloud.langfuse.com`을 `LITELLM_PROXY_BASE_URL/langfuse`로 바꾸기만 하면 됩니다. 🚀

#### **예제 사용법**
```python
from langfuse import Langfuse

langfuse = Langfuse(
    host="http://localhost:4000/langfuse", # your litellm proxy endpoint
    public_key="anything",        # no key required since this is a pass through
    secret_key="LITELLM_VIRTUAL_KEY",        # no key required since this is a pass through
)

print("sending langfuse trace request")
trace = langfuse.trace(name="test-trace-litellm-proxy-passthrough")
print("flushing langfuse request")
langfuse.flush()

print("flushed langfuse request")
```

**모든** Langfuse Endpoints를 지원합니다.

[**모든 Langfuse Endpoints 보기**](https://api.reference.langfuse.com/)

## 빠른 시작

Langfuse에 trace를 기록해 보겠습니다.

1. 환경에 Langfuse Public/Private keys 추가

```bash
export LANGFUSE_PUBLIC_KEY=""
export LANGFUSE_PRIVATE_KEY=""
```

2. LiteLLM Proxy 시작

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

Langfuse에 trace를 기록해 보겠습니다.

```python
from langfuse import Langfuse

langfuse = Langfuse(
    host="http://localhost:4000/langfuse", # your litellm proxy endpoint
    public_key="anything",        # no key required since this is a pass through
    secret_key="anything",        # no key required since this is a pass through
)

print("sending langfuse trace request")
trace = langfuse.trace(name="test-trace-litellm-proxy-passthrough")
print("flushing langfuse request")
langfuse.flush()

print("flushed langfuse request")
```


## 고급 - 가상 키와 함께 사용 {#advanced-use-with-가상-키}

사전 요구 사항
- [DB로 proxy 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Google AI Studio key를 제공하지 않으면서도 Google AI Studio endpoints를 사용할 수 있게 하려면 이 방식을 사용하세요.

### 사용법

1. 환경 설정

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export LANGFUSE_PUBLIC_KEY=""
export LANGFUSE_PRIVATE_KEY=""
```

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

2. virtual key 생성

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 응답

```bash
{
    ...
    "key": "sk-1234ewknldferwedojwojw"
}
```

3. 테스트


```python
from langfuse import Langfuse

langfuse = Langfuse(
    host="http://localhost:4000/langfuse", # your litellm proxy endpoint
    public_key="anything",        # no key required since this is a pass through
    secret_key="sk-1234ewknldferwedojwojw",        # no key required since this is a pass through
)

print("sending langfuse trace request")
trace = langfuse.trace(name="test-trace-litellm-proxy-passthrough")
print("flushing langfuse request")
langfuse.flush()

print("flushed langfuse request")
```

## [고급 - 별도 langfuse projects에 로그 기록(key/team 기준)](../proxy/team_logging.md) {#advanced-log-to-separate-langfuse-projects-by-keyteam}
