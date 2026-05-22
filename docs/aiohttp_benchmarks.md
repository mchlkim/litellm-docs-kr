# LiteLLM v1.71.1 벤치마크

## 개요

이 문서는 LiteLLM v1.71.1과 이전 litellm 버전의 성능 벤치마크를 비교합니다.

**관련 PR:** [#11097](https://github.com/BerriAI/litellm/pull/11097)

## 테스트 방법론 {#testing-methodology}

부하 테스트는 다음 매개변수로 수행했습니다.
- **요청 속도:** 200 RPS(Requests Per Second)
- **사용자 증가:** 동시 사용자 200명
- **Transport 비교:** httpx(기존) vs aiohttp(새 구현)
- **litellm pod/instance 수:** 1
- **머신 사양:** 2 vCPU, 4GB RAM
- **LiteLLM 설정:**
    - [fake openai endpoint](https://exampleopenaiendpoint-production.up.railway.app/)를 대상으로 테스트
    - 환경 변수에 `USE_AIOHTTP_TRANSPORT="True"`를 설정했습니다. 이 feature flag는 aiohttp transport를 활성화합니다.


## 벤치마크 결과 {#benchmark-results}

| 지표 | httpx(기존) | aiohttp(LiteLLM v1.71.1) | 개선폭 | 계산식 |
|--------|------------------|-------------------|-------------|-------------|
| **RPS** | 50.2 | 224 | **+346%** ✅ | (224 - 50.2) / 50.2 × 100 = 346% |
| **중앙값 지연 시간** | 2,500ms | 74ms | **-97%** ✅ | (74 - 2500) / 2500 × 100 = -97% |
| **95번째 백분위수** | 5,600ms | 250ms | **-96%** ✅ | (250 - 5600) / 5600 × 100 = -96% |
| **99번째 백분위수** | 6,200ms | 330ms | **-95%** ✅ | (330 - 6200) / 6200 × 100 = -95% |

## 주요 개선 사항 {#key-improvements}

- 초당 요청 수가 **4.5배 증가**했습니다(50.2에서 224 RPS).
- 중앙값 응답 시간이 **97% 감소**했습니다(2.5초에서 74ms).
- 95번째 백분위수 지연 시간이 **96% 감소**했습니다(5.6초에서 250ms).
- 99번째 백분위수 지연 시간이 **95% 감소**했습니다(6.2초에서 330ms).

