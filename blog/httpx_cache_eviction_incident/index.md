---
slug: httpx-cache-eviction-incident
title: "사고 보고서: cache eviction이 사용 중인 httpx client를 닫은 문제"
date: 2026-02-27T10:00:00
authors:
  - ryan
  - ishaan-alt
  - krrish
tags: [사고-보고, 캐싱, 안정성]
hide_table_of_contents: false
---

**날짜:** 2026년 2월 27일
**지속 시간:** 약 6일(2월 21일 merge -> 2월 27일 수정)
**심각도:** 높음
**상태:** 해결됨

> **참고:** 이 수정은 LiteLLM `v1.81.14.rc.2` 이상부터 사용할 수 있습니다.

## 요약

Redis connection pool cleanup을 개선하기 위한 변경에서, proxy가 아직 사용 중인 **httpx client**를 닫는 regression이 발생했습니다. `LLMClientCache`(메모리 내 TTL cache)는 Redis client와 httpx client를 같은 eviction 정책 아래 저장합니다. cache entry가 만료되거나 eviction될 때 새 cleanup code가 evicted value에 `aclose()`/`close()`를 호출했습니다. 이는 Redis client에는 올바르게 동작했지만, 시스템의 다른 부분이 여전히 참조하고 LLM API 호출에 사용 중이던 httpx client까지 종료했습니다.

**영향:** cache TTL(기본 10분) 또는 capacity limit(200 entries)에 도달한 proxy instance는 httpx client가 예상치 않게 닫혀, LLM provider 요청이 connection error로 실패할 수 있었습니다.

{/* truncate */}

---

## 배경

`LLMClientCache`는 `InMemoryCache`를 확장하며, 매 요청마다 새로 생성하지 않도록 SDK client(OpenAI, Anthropic 등)를 cache하는 데 사용됩니다. 이 client는 configuration + event loop ID를 key로 사용합니다. cache 설정은 다음과 같습니다.

- **최대 크기:** 200 entries
- **기본 TTL:** 10분

cache가 가득 차거나 entry가 만료되면 `InMemoryCache.evict_cache()`가 `_remove_key()`를 호출해 entry를 제거합니다.

cached value는 다음이 섞여 있습니다.
- **Redis/async Redis client** — cache가 독점적으로 소유하므로 eviction 시 닫아도 안전함
- **httpx-backed SDK client**(OpenAI, Anthropic 등) — 공유 reference이며 router/model instance가 계속 사용 중일 수 있음

---

## 근본 원인

[PR #21717](https://github.com/BerriAI/litellm/pull/21717)은 eviction 시 async client를 닫기 위해 `LLMClientCache`의 `_remove_key()`를 override했습니다.

<details>
<summary>PR #21717에서 추가된 문제 코드</summary>

```python
class LLMClientCache(InMemoryCache):
    def _remove_key(self, key: str) -> None:
        value = self.cache_dict.get(key)
        super()._remove_key(key)
        if value is not None:
            close_fn = getattr(value, "aclose", None) or getattr(value, "close", None)
            if close_fn and asyncio.iscoroutinefunction(close_fn):
                try:
                    asyncio.get_running_loop().create_task(close_fn())
                except RuntimeError:
                    pass
            elif close_fn and callable(close_fn):
                try:
                    close_fn()
                except Exception:
                    pass
```

</details>

의도는 Redis client에 대해서는 올바른 것이었습니다. cached Redis client가 만료될 때 connection pool leak을 방지하려는 목적이었습니다. 하지만 `LLMClientCache`는 httpx 기반 SDK client(예: `AsyncOpenAI`, `AsyncAnthropic`)도 저장합니다. 이 client는 다음 특성이 있습니다.

1. httpx에서 상속된 `aclose()` method를 가짐
2. codebase의 다른 위치(router, model instance)에서 여전히 reference를 보유함
3. 아직 사용 중인지 확인하지 않고 닫힘

따라서 cache가 entry를 evict하면, 활성 LLM request에 아직 사용 중인 httpx client에 `aclose()`를 호출하게 되었고, closed transport로 인해 connection error가 발생했습니다.

---

## 수정

[PR #22247](https://github.com/BerriAI/litellm/pull/22247)은 `_remove_key` override를 완전히 제거했습니다.

<details>
<summary>수정 내용(PR #22247)</summary>

```diff
 class LLMClientCache(InMemoryCache):
-    def _remove_key(self, key: str) -> None:
-        """Close async clients before evicting them to prevent connection pool leaks."""
-        value = self.cache_dict.get(key)
-        super()._remove_key(key)
-        if value is not None:
-            close_fn = getattr(value, "aclose", None) or getattr(
-                value, "close", None
-            )
-            ...
-
     def update_cache_key_with_event_loop(self, key):
```

</details>

이제 eviction은 reference만 제거하고 cleanup은 Python GC에 맡깁니다. 이 방식은 다음 이유로 안전합니다.
- 다른 곳에서 여전히 reference되는 httpx client는 살아 있음
- reference가 없는 client는 GC가 자연스럽게 정리함

PR #21717의 다른 개선 사항은 유지했습니다.
- **URL 기반 Redis config에서 `max_connections` 반영**, 이전에는 조용히 무시됨
- **`disconnect()`가 sync 및 async Redis client를 모두 닫음**, 이전에는 sync client가 leak됨
- **Connection pool passthrough**, URL config와 함께 pool이 제공되면 duplicate를 만들지 않고 직접 사용

---

## 조치

| 조치 | 상태 | 코드 |
|--------|--------|------|
| eviction 시 shared client를 닫는 `_remove_key` override 제거 | ✅ 완료 | [PR #22247](https://github.com/BerriAI/litellm/pull/22247) |
| e2e test 추가: evicted client still usable(capacity) | ✅ 완료 | [PR #22313](https://github.com/BerriAI/litellm/pull/22313) |
| e2e test 추가: expired client still usable(TTL) | ✅ 완료 | [PR #22313](https://github.com/BerriAI/litellm/pull/22313) |

e2e test는 production에서 proxy가 사용하는 것과 같은 code path인 `get_async_httpx_client()`를 거치며, eviction 이후에도 client가 계속 동작하는지 assert합니다. 이 test는 `main` 대상 모든 PR의 CI에서 실행됩니다. 누군가 `LLMClientCache` eviction behavior를 수정하거나, `_remove_key`를 override하거나, eviction 시 어떤 형태로든 client cleanup을 추가하면 구현 방식과 관계없이 이 test가 실패합니다.
