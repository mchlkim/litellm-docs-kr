---
slug: litellm-observatory
title: "24시간 부하 테스트로 릴리스 안정성 개선"
date: 2026-02-06T10:00:00
authors:
  - alexsander
  - krrish
  - ishaan-alt
description: "사용자에게 도달하기 전에 회귀를 포착하기 위해 장시간 실행 릴리스 검증 시스템을 구축한 방법입니다."
tags: [테스트, 관측성, 신뢰성, 릴리스]
hide_table_of_contents: false
---

![LiteLLM Observatory](https://raw.githubusercontent.com/AlexsanderHamir/assets/main/Screenshot%202026-01-31%20175355.png)

# 24시간 부하 테스트로 릴리스 안정성 개선

LiteLLM 채택이 늘어나면서 신뢰성, 성능, 운영 안전성에 대한 기대도 높아졌습니다. 이러한 기대를 충족하려면 정확성 중심의 test만으로는 부족하며, 실제 조건에서 시간이 지남에 따라 시스템이 어떻게 동작하는지 검증해야 합니다.

이 글에서는 회귀가 사용자에게 도달하기 전에 포착하기 위해 구축한 장시간 실행 릴리스 검증 시스템인 **LiteLLM Observatory**를 소개합니다.

{/* truncate */}

---

## Observatory를 구축한 이유

LiteLLM은 외부 provider, 장시간 유지되는 네트워크 연결, 고처리량 워크로드가 교차하는 지점에서 동작합니다. unit test와 integration test는 정확성 검증에는 뛰어나지만, 장시간 동작 후에만 드러나는 문제를 노출하도록 설계되어 있지는 않습니다.

v1.81.3에서 발견된 미묘한 lifecycle edge case는 이 영역에서 더 강한 릴리스 검증이 필요하다는 점을 다시 확인시켰습니다.

---

## 실제 lifecycle edge case

v1.81.3에서 HTTP client memory leak 수정 사항을 릴리스했습니다. 이 변경은 unit 및 integration test를 통과했고, 짧게 실행한 경우에는 올바르게 동작했습니다.

드러난 문제는 단일 로직 라인의 오류가 아니라, 여러 component가 시간이 지나며 상호작용하는 방식에서 발생했습니다.

- cached `httpx` client가 1시간 TTL로 설정됨
- cache가 만료되면 내부 HTTP connection은 예상대로 닫힘
- 더 높은 수준의 client가 해당 connection reference를 계속 보유함
- 이후 request가 다음 오류로 실패함

```
Cannot send a request, as the client has been closed
```

**수정 전(버그 있음):**

| Provider | Requests | Success | Failures | Fail % |
|----------|----------|---------|----------|--------|
| OpenAI   | 720,000  | 432,000 | 288,000  | 40%    |
| Azure    | 692,000  | 415,200 | 276,800  | 40%    |

**수정 후:**

| Provider | Requests   | Success   | Failures | Fail %  |
|----------|------------|-----------|----------|---------|
| OpenAI   | 1,200,000  | 1,199,988 | 12       | 0.001%  |
| Azure    | 1,150,000  | 1,149,982 | 18       | 0.002%  |

앞으로의 초점은 unit test가 다루지 못하는 문제라도 가장 먼저 감지하는 것입니다. LiteLLM Observatory는 릴리스 검증 중 **자체 production deployment**의 실제 traffic pattern에서만 나타나는 latency regression, OOM, failure mode를 드러내도록 설계되었습니다.


---

### Observatory 동작 방식

[LiteLLM Observatory](https://github.com/BerriAI/litellm-observatory)는 LiteLLM deployment를 대상으로 장시간 실행 test를 수행하는 testing service입니다. API request를 보내 test를 trigger하고, test가 완료되면 결과가 자동으로 Slack에 전송됩니다.

#### 테스트 실행 방식

1. **테스트 시작**: Observatory API에 다음 정보를 담아 request를 보냅니다.
   - 테스트할 LiteLLM deployment(URL 및 API key)
   - 실행할 test(예: `TestOAIAzureRelease`)
   - test 설정(테스트할 model, 실행 시간, failure threshold)

2. **스마트 큐잉**:
   - system은 동일한 test를 두 번 이상 실행하려는지 확인합니다.
   - duplicate test가 이미 실행 중이거나 queue에 있으면 resource 낭비를 피하기 위해 error를 반환합니다.
   - 그렇지 않으면 test가 queue에 추가되고 capacity가 있을 때 실행됩니다(기본적으로 최대 5개 test 동시 실행).

3. **즉시 응답**: API는 즉시 응답하며 test 완료를 기다리지 않습니다. test는 몇 시간 동안 실행될 수 있지만 request 자체는 millisecond 단위로 완료됩니다.

4. **백그라운드 실행**:
   - test는 background에서 실행되며 LiteLLM deployment에 request를 보냅니다.
   - 시간에 따른 request success/failure rate를 추적합니다.
   - test가 완료되면 결과가 자동으로 Slack channel에 게시됩니다.

#### 예제: OpenAI / Azure 신뢰성 test

`TestOAIAzureRelease` test는 지속 실행 이후에만 드러나는 bug class를 잡기 위해 설계되었습니다.

- **실행 시간**: 3시간 동안 계속 실행
- **동작**: 지정된 model(예: `gpt-4`, `gpt-3.5-turbo`)을 순회하며 request를 계속 전송
- **3시간인 이유**: 장시간 사용 후 HTTP client가 degrade되거나 실패하는 문제를 잡는 데 도움이 됩니다(예: LiteLLM v1.81.3에서 관찰된 bug).
- **통과 / 실패 기준**: request 실패율이 1% 미만이면 통과합니다. 실패율이 1%를 넘으면 test가 실패하고 Slack으로 알림을 받습니다.
- **핵심 세부사항**: 전체 실행 동안 같은 HTTP client를 재사용해, 장시간 reuse에서만 나타나는 lifecycle 관련 bug를 감지할 수 있습니다.

#### 사용하는 시점

- **배포 전**: 새 LiteLLM version을 production으로 승격하기 전에 test 실행
- **정기 검증**: regression을 조기에 잡기 위해 daily 또는 weekly run 예약
- **Issue 조사**: deployment issue가 의심될 때 on demand로 test 실행
- **장시간 실패 감지**: 짧은 smoke test로는 드러나지 않는 sustained load 하의 bug 식별


### Unit test 보완

Unit test는 여전히 개발 프로세스의 기반입니다. 빠르고 정확하지만 다음을 다루지는 못합니다.

- 실제 provider 동작
- 장시간 유지되는 network 상호작용
- resource lifecycle 경계 사례
- 시간 의존적 regression

LiteLLM Observatory는 production-like environment에서 실제로 실행되는 방식 그대로 system을 검증해 unit test를 보완합니다.

---

### 앞으로의 계획

신뢰성은 지속적인 투자 영역입니다.

LiteLLM Observatory는 릴리스 품질과 운영 안전성 기준을 계속 높이기 위해 구축 중인 여러 system 중 하나입니다. LiteLLM이 발전함에 따라 validation tooling도 실제 사용 사례와 배운 점을 반영해 함께 발전할 것입니다.

앞으로도 이러한 개선 사항을 공개적으로 공유하겠습니다.
