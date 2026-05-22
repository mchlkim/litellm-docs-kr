---
slug: sub-millisecond-proxy-overhead
title: "밀리초 미만 proxy overhead 달성"
date: 2026-02-02T10:00:00
authors:
  - alexsander
  - krrish
  - ishaan-alt
description: "보급형 hardware에서 밀리초 미만 proxy overhead를 달성하기 위한 Q1 성능 목표와 architecture 방향."
tags: [성능, architecture]
hide_table_of_contents: false
---

![Sidecar architecture: Python control plane과 sidecar hot path 비교](https://raw.githubusercontent.com/AlexsanderHamir/assets/main/Screenshot%202026-02-02%20172554.png)

# 밀리초 미만 proxy overhead 달성

## 소개

Q1 성능 목표는 4 CPU, 8 GB RAM 단일 instance에서 밀리초 미만 proxy overhead에 공격적으로 가까워지고, 시간이 지나면서 그 한계를 계속 밀어붙이는 것입니다. 더 큰 목표는 LiteLLM을 저렴하게 배포할 수 있고, 가볍고, 빠르게 만드는 것입니다. 이 글은 그 작업의 architecture 방향을 설명합니다.

Proxy overhead는 upstream provider와 무관하게 LiteLLM 자체가 추가하는 latency를 의미합니다.

이를 측정하기 위해 동일한 workload를 provider에 직접 보내는 경우와 LiteLLM을 거치는 경우에 동일한 QPS(예: 1,000 QPS)로 실행하고 latency 차이를 비교합니다. 노이즈를 줄이기 위해 load generator, LiteLLM, mock LLM endpoint를 모두 같은 machine에서 실행해, 차이가 network latency가 아니라 proxy overhead를 반영하도록 합니다.

{/* truncate */}

---

## 현재 기준선

[TensorZero](https://www.tensorzero.com/docs/gateway/benchmarks)가 원래 수행한 것과 동일한 benchmark에서, LiteLLM은 이전에 약 1,000 QPS 부근에서 실패했습니다.

이제는 그렇지 않습니다. 현재 LiteLLM은 4 CPU, 8 GB RAM 단일 instance 구성에서 1,000 QPS stress test를 실패 없이 통과하며, 5,000 QPS까지도 실패 없이 scale할 수 있습니다.

이는 더 최신의 기준선을 세우며, proxy overhead와 전체 성능 개선을 계속하는 데 유용한 context를 제공합니다.

---

## 설계 선택

Python 기반 system에서 밀리초 미만 proxy overhead를 달성하려면 어떤 작업을 어디에서 수행할지 신중하게 정해야 합니다.

Python은 유연성과 확장성이 중요한 영역에 잘 맞습니다. provider abstraction, configuration-driven routing, 풍부한 callback ecosystem이 그 예입니다. 이런 영역에서는 raw throughput보다 개발 속도와 정확성이 더 중요합니다.

하지만 request rate가 높아지면, 일부 작업은 모든 요청마다 Python process 안에서 실행될 때 비용이 커집니다. LiteLLM을 다시 작성하거나 복잡한 배포 요구사항을 추가하는 대신, optional **sidecar architecture**를 채택합니다.

이 architecture 변경은 LiteLLM을 **장기적으로 빠르게** 만들기 위한 방식입니다. 단기 성능 목표를 지원하지만, 본질적으로 장기 투자입니다.

Python은 계속 다음을 담당합니다.

- request validation 및 normalization
- model 및 provider 선택
- callback 및 integration

Sidecar는 다음과 같은 **성능 핵심 실행 경로**를 담당합니다.

- 효율적인 request forwarding
- connection reuse 및 pooling
- timeout 및 limit 적용
- 고빈도 metric 집계

이 분리는 각 component가 가장 잘하는 일에 집중하게 합니다. Python은 control plane으로 동작하고, sidecar는 hot path를 처리합니다.

---

### Sidecar가 optional인 이유

Sidecar는 의도적으로 **optional**입니다.

이를 통해 sidecar를 점진적으로 배포하고, 실제 workload에서 검증하며, 모든 LiteLLM 기능 전반에서 충분히 battle-test되기 전에 hard dependency로 만들지 않을 수 있습니다.

마찬가지로 중요한 점은 LiteLLM self-hosting이 계속 단순하게 유지된다는 것입니다. Sidecar는 bundled되어 자동으로 시작되고, 추가 infrastructure가 필요 없으며, 완전히 비활성화할 수 있습니다. 사용자 관점에서 LiteLLM은 계속 단일 service처럼 동작합니다.

현재 sidecar는 요구사항이 아니라 최적화입니다.

---

## 결론

밀리초 미만 proxy overhead는 단일 최적화가 아니라 architecture 변경을 통해 달성됩니다.

Python은 orchestration과 extensibility에 집중시키고, 성능 핵심 실행은 sidecar로 offload함으로써 LiteLLM을 **시간이 지나도 계속 빠르게** 만들 기반을 마련합니다. 1 CPU, 2 GB RAM instance 같은 보급형 hardware에서도 이를 목표로 하며, 배포와 self-hosting은 단순하게 유지합니다.

이 작업은 Q1을 넘어 계속되며, architecture가 발전함에 따라 benchmark와 update를 계속 공유하겠습니다.
