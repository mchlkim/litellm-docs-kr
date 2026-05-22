# 사용자 지정 HTTP 핸들러 {#custom-http-handler}

LiteLLM completion에서 더 나은 성능과 제어를 위해 사용자 지정 aiohttp 세션을 구성합니다.

## 개요 {#overview}

이제 다음 용도로 사용자 지정 `aiohttp.ClientSession` 인스턴스를 LiteLLM에 주입할 수 있습니다.
- 사용자 지정 연결 풀링 및 제한 시간
- 기업 프록시 및 SSL 구성
- 성능 최적화
- 요청 모니터링

## 기본 사용법 {#basic-usage}

### 기본값(변경 필요 없음) {#default-no-changes-required}
```python
import litellm

# Works exactly as before
response = await litellm.acompletion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 사용자 지정 세션 {#custom-session}
```python
import aiohttp
import litellm
from litellm.llms.custom_httpx.aiohttp_handler import BaseLLMAIOHTTPHandler

# Create optimized session
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=180),
    connector=aiohttp.TCPConnector(limit=300, limit_per_host=75)
)

# Replace global handler
litellm.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)

# All completions now use your session
response = await litellm.acompletion(model="gpt-3.5-turbo", messages=[...])
```

## 일반적인 패턴 {#common-patterns}

### FastAPI 통합 {#fastapi-integration}
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
import aiohttp
import litellm

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    session = aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=180),
        connector=aiohttp.TCPConnector(limit=300)
    )
    litellm.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(
        client_session=session
    )
    yield
    # Shutdown
    await session.close()

app = FastAPI(lifespan=lifespan)

@app.post("/chat")
async def chat(messages: list[dict]):
    return await litellm.acompletion(model="gpt-3.5-turbo", messages=messages)
```

### 기업 프록시 {#corporate-proxy}
```python
import ssl

# Custom SSL context
ssl_context = ssl.create_default_context()
ssl_context.load_cert_chain('cert.pem', 'key.pem')

# Proxy session
session = aiohttp.ClientSession(
    connector=aiohttp.TCPConnector(ssl=ssl_context),
    trust_env=True  # Use environment proxy settings
)

litellm.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)
```

### 고성능 {#high-performance}
```python
# Optimized for high throughput
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=300),
    connector=aiohttp.TCPConnector(
        limit=1000,             # High connection limit
        limit_per_host=200,     # Per host limit
        ttl_dns_cache=600,      # DNS cache
        keepalive_timeout=60,   # Keep connections alive
        enable_cleanup_closed=True
    )
)

litellm.base_llm_aiohttp_handler = BaseLLMAIOHTTPHandler(client_session=session)
```

## 생성자 옵션 {#constructor-options}

```python
BaseLLMAIOHTTPHandler(
    client_session=None,    # Custom aiohttp.ClientSession
    transport=None,         # Advanced transport control
    connector=None,         # Custom aiohttp.BaseConnector
)
```

## 리소스 관리 {#resource-management}

- **사용자 세션**: 수명 주기는 사용자가 관리합니다(`await session.close()` 호출).
- **자동 생성 세션**: 핸들러가 자동으로 정리합니다.
- **100% 이전 버전과 호환**: 기존 코드는 변경 없이 작동합니다.

## 설정 팁 {#configuration-tips}

### 개발 {#development}
```python
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=60),
    connector=aiohttp.TCPConnector(limit=50)
)
```

### 프로덕션 {#production}
```python
session = aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=300),
    connector=aiohttp.TCPConnector(
        limit=1000,
        limit_per_host=200,
        keepalive_timeout=60
    )
)
```
