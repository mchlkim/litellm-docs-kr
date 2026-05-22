# LiteLLM - 로컬 캐싱 {#litellm---local-caching}

## 활성화된 경우 `completion()` 및 `embedding()` 호출 캐싱 {#caching-completion-and-embedding-calls-when-switched-on}

liteLLM은 정확히 일치하는 캐싱을 구현하며 다음 캐싱을 지원합니다.
* 인메모리 캐싱 [기본값]
* 로컬 Redis 캐싱
* 호스팅 Redis 캐싱

## 빠른 시작 사용법 - Completion {#quick-start-usage---completion}
캐싱 - 캐시
캐시의 키는 `model`이며, 다음 예시는 캐시 적중으로 이어집니다.
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache()

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}]
    caching=True
)
response2 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}],
    caching=True
)

# response1 == response2, response 1 is cached
```

## 사용자 지정 키-값 쌍 {#custom-key-value-pairs}
캐시에 사용자 지정 키-값 쌍을 추가합니다.

```python 
from litellm.caching.caching import Cache
cache = Cache()

cache.add_cache(cache_key="test-key", result="1234")

cache.get_cache(cache_key="test-key")
```

## 스트리밍 캐싱 {#caching-with-streaming}
LiteLLM은 스트리밍 응답을 캐시할 수 있습니다.

### 사용법
```python
import litellm
from litellm import completion
from litellm.caching.caching import Cache
litellm.cache = Cache()

# Make completion calls
response1 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}], 
    stream=True,
    caching=True)
for chunk in response1:
    print(chunk)
response2 = completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "Tell me a joke."}], 
    stream=True,
    caching=True)
for chunk in response2:
    print(chunk)
```

## 사용법 - Embedding()
1. 캐싱 - 캐시
캐시의 키는 `model`이며, 다음 예시는 캐시 적중으로 이어집니다.
```python
import time
import litellm
from litellm import embedding
from litellm.caching.caching import Cache
litellm.cache = Cache()

start_time = time.time()
embedding1 = embedding(model="text-embedding-ada-002", input=["hello from litellm"*5], caching=True)
end_time = time.time()
print(f"Embedding 1 response time: {end_time - start_time} seconds")

start_time = time.time()
embedding2 = embedding(model="text-embedding-ada-002", input=["hello from litellm"*5], caching=True)
end_time = time.time()
print(f"Embedding 2 response time: {end_time - start_time} seconds")
```
