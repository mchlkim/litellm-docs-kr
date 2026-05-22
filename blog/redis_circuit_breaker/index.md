---
slug: redis-circuit-breaker
title: "Redis 장애에도 AI Gateway를 견고하게 유지하기"
date: 2026-04-11T09:00:00
authors:
  - ishaan
description: "LiteLLM 프로덕션 AI Gateway가 연쇄 장애 없이 대규모 Redis 성능 저하를 처리하는 방식 - 서킷 브레이커 패턴, 0ms fast-fail, 자동 복구."
tags: [reliability, redis, infrastructure, engineering, ai-gateway]
hide_table_of_contents: true
---

import { CascadeFailure, CircuitBreakerStates, CircuitBreakerFlow, IncidentTimeline } from './diagrams';

*마지막 업데이트: 2026년 4월*

엔터프라이즈 AI Gateway 배포에서는 거의 모든 요청의 핵심 경로에 Redis가 들어갑니다. rate limiting, cache lookup, spend tracking이 모두 여기에 해당합니다. Redis가 정상일 때 추가 지연은 한 자릿수 밀리초 수준이라 최종 사용자에게 거의 보이지 않습니다. 하지만 Redis 성능이 저하될 때도 프로덕션 AI Gateway는 계속 살아 있어야 합니다.

100개 이상의 pod에서 LiteLLM을 대규모로 운영한다는 것은 장애 모드가 실제로 나타나기 전에 미리 설계해야 한다는 뜻입니다. 쉬운 경우는 Redis가 완전히 내려가는 상황입니다. 빠르게 실패시키고, 데이터베이스로 fallback하며, 요청 처리를 계속하면 됩니다. 어려운 경우, 그리고 gateway를 실제로 중단시키는 경우는 *느린* Redis입니다. 연결은 받고 응답도 하지만, 각 작업이 20-30초 뒤에 timeout되는 상태입니다.

{/* truncate */}

## 느린 Redis가 완전 장애보다 더 어려운 이유

<CascadeFailure />

100개의 pod가 모든 인증 검사에서 각각 30초씩 멈추면 threadpool이 가득 차고 요청이 대기열에 쌓입니다. Redis timeout 이후 Postgres로 fallback되는 시점에는 데이터베이스가 동시에 밀려드는 fallback 때문에 평소의 100배 부하를 받습니다. 느린 Redis가 데이터베이스 장애가 되고, 다시 전체 gateway 장애가 됩니다. 프로덕션급 AI Gateway는 하나의 성능 저하된 의존성이 전체 장애로 번지는 것을 허용해서는 안 됩니다.

## 해결책: 서킷 브레이커 패턴

서킷 브레이커 패턴은 연속 실패를 추적하고, 문제가 있는 의존성이 연쇄 장애를 만들기 전에 차단합니다. 각 Redis 호출에서 30초씩 멈추는 대신, 5번 연속 실패하면 circuit을 열고 0ms에 fast-fail합니다. 네트워크 호출도, 대기도 없습니다.

<CircuitBreakerStates />

세 가지 상태가 있습니다.

- **CLOSED** - 정상 상태입니다. 모든 Redis 호출이 통과합니다.
- **OPEN** - Redis가 비정상 상태입니다. 모든 호출이 즉시 fast-fail합니다. 요청은 성능이 낮아진 상태로 계속 동작하며, auth와 rate limiting은 데이터베이스로 fallback됩니다.
- **HALF-OPEN** - 60초 후 하나의 probe 요청으로 복구 여부를 확인합니다. 성공하면 circuit을 닫고, 실패하면 타이머를 다시 시작합니다.

신뢰할 수 있는 AI Gateway는 인프라 성능 저하를 이렇게 처리합니다. 계속 동작하고, 점진적으로 기능을 낮추며, 자동으로 복구합니다.

## AI Gateway에서 요청이 흐르는 방식

<CircuitBreakerFlow />

Circuit이 열린 상태에서는 gateway가 멈추지 않습니다. 인증 검사는 Postgres로 fallback됩니다. 더 느리지만 한계가 정해져 있습니다. 데이터베이스는 부하를 흡수할 수 있습니다. 30초 timeout 이후 100개 pod가 쌓인 요청을 한꺼번에 쏟아내는 것이 아니라, *일부* 요청만 DB fallback 경로로 들어오기 때문입니다.

견고한 AI Gateway와 취약한 AI Gateway의 차이는 통제된 성능 저하와 통제되지 않은 연쇄 장애의 차이입니다.

## 구현

```python
class RedisCircuitBreaker:
    def __init__(self, failure_threshold: int, recovery_timeout: int):
        self.failure_threshold = failure_threshold  # default: 5
        self.recovery_timeout = recovery_timeout    # default: 60s
        self._failure_count = 0
        self._state = self.CLOSED

    def is_open(self) -> bool:
        if self._state == self.OPEN:
            if time.time() - self._opened_at > self.recovery_timeout:
                self._state = self.HALF_OPEN
                return False  # this caller is the recovery probe
            return True       # fast-fail
        return False

    def record_failure(self):
        self._failure_count += 1
        self._opened_at = time.time()
        if self._failure_count >= self.failure_threshold:
            self._state = self.OPEN  # open the circuit

    def record_success(self):
        self._failure_count = 0
        self._state = self.CLOSED   # Redis recovered
```

모든 async Redis 작업은 네트워크에 접근하기 전에 breaker를 확인하는 decorator를 거칩니다. 열린 상태이면 즉시 예외를 발생시킵니다.

```python
@_redis_circuit_breaker_guard
async def async_get_cache(self, key: str):
    ...
```

Decorator가 모든 상태 관리를 처리합니다. 성공은 별도 reset을 만들지 않고, 실패는 counter를 증가시키며, 예외는 `record_failure()`를 트리거합니다. 호출자는 깔끔한 예외를 보고 일반적인 non-Redis 경로로 fallback합니다. 호출 코드 변경은 필요 없습니다.

## 프로덕션에서의 AI Gateway 복원력

<IncidentTimeline />

Redis 성능 저하 이벤트는 더 이상 프로덕션에서 연쇄 장애로 번지지 않습니다. Redis slowdown 중 관측되는 증상은 cache miss rate의 일시적인 증가입니다. 견고한 AI Gateway에 적합한 실패 모드입니다. Auth는 계속 동작합니다. Rate limiting도 계속 동작합니다. Spend tracking도 약간 더 높은 DB 비용으로 계속 동작합니다. Redis가 돌아오면 복구는 완전히 자동으로 이루어집니다.

```bash
# configure via environment variables
REDIS_CIRCUIT_BREAKER_FAILURE_THRESHOLD=5   # failures before opening
REDIS_CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60  # seconds before probe
```

서킷 브레이커는 `v1.82.0` 이후 모든 LiteLLM 버전에서 기본으로 활성화되어 제공됩니다. 대부분의 배포에서는 별도 설정이 필요 없습니다.

## 핵심 요약

- 느린 Redis는 완전히 내려간 Redis보다 더 위험합니다. 100개 이상의 pod에서 30초 timeout이 누적되면 Postgres가 평소 100배 부하를 받습니다.
- LiteLLM AI Gateway는 5번 연속 실패 이후 Redis 호출을 0ms에 fast-fail하는 서킷 브레이커를 사용합니다.
- 상태는 CLOSED(정상), OPEN(fast-fail + DB fallback), HALF-OPEN(복구 probe) 세 가지입니다.
- Redis 장애 중에도 auth, rate limiting, spend tracking은 계속 동작합니다.
- `v1.82.0` 이후 기본 활성화되는 프로덕션급 복원력이며, 별도 설정이 필요 없습니다.

---

### 자주 묻는 질문

### 서킷 브레이커가 정상 Redis 성능에 영향을 주나요?

아니요. Redis가 정상(circuit CLOSED)일 때는 모든 호출이 추가 overhead 없이 통과합니다. Breaker는 5번 연속 실패한 뒤에만 활성화되므로, 정상 상황에서는 투명하게 동작합니다.

### Circuit이 열리면 rate limiting은 어떻게 되나요?

Rate limiting은 한계가 정해진 부하로 Postgres에 fallback됩니다. Redis가 복구되고 circuit이 자동으로 닫힐 때까지, 약간 더 높은 DB 비용으로 limit이 계속 적용됩니다.

### 기본 Redis retry 로직과 무엇이 다른가요?

Retry 로직은 각 timeout을 계속 기다립니다(30초 x retry 횟수). 서킷 브레이커는 실패 임계값 이후 0ms에 연결을 즉시 차단해 모든 pod의 threadpool이 동시에 고갈되는 것을 막습니다. Retry는 느린 Redis 문제를 악화시키지만, 서킷 브레이커는 문제를 격리합니다.

### LiteLLM OSS에서도 사용할 수 있나요?

네. 서킷 브레이커는 `v1.82.0` 이후 LiteLLM OSS(Apache 2.0)에 기본 포함되어 있습니다. [LiteLLM 엔터프라이즈](https://litellm.ai/enterprise)는 OSS 기반 위에 SSO/SCIM, air-gapped 배포, 24/7 SLA 지원, 고급 guardrail을 추가합니다.

---

## 결론

Redis 복원력은 LiteLLM을 대규모 프로덕션에서 신뢰할 수 있는 AI Gateway로 만드는 여러 계층 중 하나입니다. 서킷 브레이커 패턴은 인프라 성능 저하가 격리된 상태로 머물게 합니다. 올바른 실패 모드는 전체 장애가 아니라 일시적인 cache miss rate 증가입니다. 부하 상황에서 AI Gateway 인프라는 이렇게 동작해야 합니다. 점진적으로 성능을 낮추고, 자동으로 복구하며, 트래픽 처리를 계속합니다. 엄격한 uptime과 compliance 요구사항이 있는 팀을 위해 [LiteLLM 엔터프라이즈](https://litellm.ai/enterprise)는 규제된 프로덕션 환경에 필요한 추가 제어 기능을 제공합니다.

## 추천 자료

- [LiteLLM AI Gateway - 전체 기능 개요](https://docs.litellm.ai/docs/simple_proxy)
- [100개 이상 LLM provider 전반의 load balancing 및 routing](https://docs.litellm.ai/docs/routing)
- [Spend tracking 및 budget control](https://docs.litellm.ai/docs/proxy/cost_tracking)
