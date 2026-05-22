# 공유 세션 지원 {#shared-session-support}

## 개요

LiteLLM은 이제 여러 API 호출에서 `aiohttp.ClientSession` 인스턴스를 공유해 불필요한 새 세션 생성을 피할 수 있습니다. 이를 통해 성능과 리소스 사용 효율이 개선됩니다.

## 사용법

### 기본 사용법 {#basic-usage}

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def main():
    # Create a shared session
    async with ClientSession() as shared_session:
        # Use the same session for multiple calls
        response1 = await acompletion(
            model="gpt-4o",
            messages=[{"role": "user", "content": "Hello"}],
            shared_session=shared_session
        )
        
        response2 = await acompletion(
            model="gpt-4o", 
            messages=[{"role": "user", "content": "How are you?"}],
            shared_session=shared_session
        )
        
        # Both calls reuse the same session!

asyncio.run(main())
```

### 공유 세션 미사용(기본값) {#without-shared-session-default}

```python
import asyncio
from litellm import acompletion

async def main():
    # Each call creates a new session
    response1 = await acompletion(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}]
    )
    
    response2 = await acompletion(
        model="gpt-4o",
        messages=[{"role": "user", "content": "How are you?"}]
    )
    # Two separate sessions created

asyncio.run(main())
```

## 이점 {#benefits}

- **성능**: 여러 호출에서 HTTP 연결을 재사용합니다.
- **리소스 효율성**: 메모리와 연결 오버헤드를 줄입니다.
- **제어 개선**: 세션 수명 주기를 명시적으로 관리합니다.
- **디버깅**: 어떤 호출이 어떤 세션을 사용하는지 쉽게 추적할 수 있습니다.

## 디버그 로깅 {#debug-logging}

세션 재사용 동작을 확인하려면 디버그 로깅을 활성화하세요.

```python
import os
import litellm

# Enable debug logging
os.environ['LITELLM_LOG'] = 'DEBUG'

# You'll see logs like:
# 🔄 SHARED SESSION: acompletion called with shared_session (ID: 12345)
# ✅ SHARED SESSION: Reusing existing ClientSession (ID: 12345)
```

## 일반적인 패턴 {#common-patterns}

### FastAPI 통합 {#fastapi-integration}

```python
from fastapi import FastAPI
import aiohttp
import litellm

app = FastAPI()

@app.post("/chat")
async def chat(messages: list[dict]):
    # Create session per request
    async with aiohttp.ClientSession() as session:
        return await litellm.acompletion(
            model="gpt-4o",
            messages=messages,
            shared_session=session
        )
```

### 배치 처리 {#batch-processing}

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def process_batch(messages_list):
    async with ClientSession() as shared_session:
        tasks = []
        for messages in messages_list:
            task = acompletion(
                model="gpt-4o",
                messages=messages,
                shared_session=shared_session
            )
            tasks.append(task)
        
        # All tasks use the same session
        results = await asyncio.gather(*tasks)
        return results
```

### 사용자 지정 세션 설정 {#custom-session-configuration}

```python
import aiohttp
import litellm

# Create optimized session
async with aiohttp.ClientSession(
    timeout=aiohttp.ClientTimeout(total=180),
    connector=aiohttp.TCPConnector(limit=300, limit_per_host=75)
) as shared_session:
    
    response = await litellm.acompletion(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
        shared_session=shared_session
    )
```

## 구현 세부 정보 {#implementation-details}

`shared_session` 파라미터는 전체 LiteLLM 호출 체인을 따라 전달됩니다.

1. **`acompletion()`** - `shared_session` 파라미터를 받습니다.
2. **`BaseLLMHTTPHandler`** - HTTP 클라이언트 생성 시 세션을 전달합니다.
3. **`AsyncHTTPHandler`** - 제공된 기존 세션을 사용합니다.
4. **`LiteLLMAiohttpTransport`** - HTTP 요청에 세션을 재사용합니다.

## 하위 호환성 {#backward-compatibility}

- **100% 하위 호환** - 기존 코드는 변경 없이 동작합니다.
- **선택적 파라미터** - 기본값은 `shared_session=None`입니다.
- **호환성을 깨는 변경 없음** - 기존 기능이 모두 유지됩니다.

## 테스트 {#testing}

공유 세션 기능을 테스트합니다.

```python
import asyncio
from aiohttp import ClientSession
from litellm import acompletion

async def test_shared_session():
    async with ClientSession() as session:
        print(f"✅ Created session: {id(session)}")
        
        try:
            response = await acompletion(
                model="gpt-4o",
                messages=[{"role": "user", "content": "Hello"}],
                shared_session=session,
                api_key="your-api-key"
            )
            print(f"Response: {response.choices[0].message.content}")
        except Exception as e:
            print(f"✅ Expected error: {type(e).__name__}")
        
        print("✅ Session control working!")

asyncio.run(test_shared_session())
```

## 수정된 파일 {#files-modified}

공유 세션 기능은 다음 파일에 추가되었습니다.

- `litellm/main.py` - `acompletion()` 및 `completion()`에 `shared_session` 파라미터 추가
- `litellm/llms/custom_httpx/http_handler.py` - 핵심 세션 재사용 로직
- `litellm/llms/custom_httpx/llm_http_handler.py` - HTTP 핸들러 통합
- `litellm/llms/openai/openai.py` - OpenAI 공급자 통합
- `litellm/llms/openai/common_utils.py` - OpenAI 클라이언트 생성
- `litellm/llms/azure/chat/o_series_handler.py` - Azure O Series 핸들러

## 문제 해결

### 세션이 재사용되지 않음 {#session-not-being-reused}

1. **디버그 로그 확인**: 세션 재사용 메시지를 보려면 `LITELLM_LOG=DEBUG`를 활성화합니다.
2. **세션이 닫히지 않았는지 확인**: 호출 시점에 세션이 여전히 활성 상태인지 확인합니다.
3. **파라미터 전달 확인**: 모든 `acompletion()` 호출에 `shared_session`이 전달되는지 확인합니다.

### 성능 문제 {#performance-issues}

1. **세션 구성**: 사용 사례에 맞게 `aiohttp.ClientSession` 파라미터를 조정합니다.
2. **연결 제한**: `TCPConnector`의 `limit` 및 `limit_per_host`를 조정합니다.
3. **타임아웃 설정**: 환경에 맞는 적절한 타임아웃을 구성합니다.
