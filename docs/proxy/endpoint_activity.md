import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Endpoint Activity

대시보드에서 API 엔드포인트 사용량을 직접 추적하고 시각화합니다. 엔드포인트별 활동 분석, 지출 내역, 성능 지표를 모니터링하여 어떤 엔드포인트에 가장 많은 트래픽이 발생하는지와 각 엔드포인트가 어떻게 동작하는지 파악할 수 있습니다.

## 개요

Endpoint Activity를 사용하면 개별 API 엔드포인트의 지출과 사용량을 자동으로 추적할 수 있습니다. LiteLLM proxy를 통해 엔드포인트를 호출할 때마다 활동이 자동으로 추적되고 집계됩니다. 이를 통해 다음을 수행할 수 있습니다.

- 엔드포인트별 지출을 자동으로 추적
- 관리자 UI에서 엔드포인트별 사용량 분석 확인
- 엔드포인트별 토큰 소비량 모니터링
- 엔드포인트별 성공률과 실패율 분석
- 활동이 가장 많은 엔드포인트 식별
- 시간에 따른 엔드포인트 사용량을 보여주는 추세 데이터 확인

<Image img={require('../../img/ui_endpoint_activity.png')} />

## Endpoint Activity 작동 방식

LiteLLM proxy를 통해 API 호출을 수행할 때마다 엔드포인트 활동이 **자동으로 추적**됩니다. 추가 구성이 필요하지 않으며, 평소처럼 엔드포인트를 호출하기만 하면 활동이 추적됩니다.

### 예제 API 호출

어떤 엔드포인트로든 요청을 보내면 활동이 자동으로 기록됩니다.

```bash showLineNumbers title="Endpoint activity is automatically tracked"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \ # 👈 ENDPOINT AUTOMATICALLY TRACKED
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer sk-1234' \ # 👈 YOUR PROXY KEY
  --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ]
  }'
```

엔드포인트(`/chat/completions`)는 다음 정보와 함께 자동으로 추적됩니다.

- 토큰 수(프롬프트 토큰, 완료 토큰, 전체 토큰)
- 요청 지출
- 요청 상태(성공 또는 실패)
- 타임스탬프 및 기타 메타데이터

## Endpoint Activity 확인 방법

### 관리자 UI에서 활동 보기

관리자 UI의 Endpoint Activity 탭으로 이동하면 엔드포인트별 분석을 확인할 수 있습니다.

#### 1. Endpoint Activity 접근

관리자 UI의 사용법 페이지(`PROXY_BASE_URL/ui/?login=success&page=new_usage`)로 이동한 뒤 **Endpoint Activity** 탭을 클릭합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/67601fc0-8415-49b4-8e55-0673d37540c2/ascreenshot_f609a506dfe745c5aadccd332681c32d_text_export.jpeg)

#### 2. 엔드포인트 분석 보기

Endpoint Activity 대시보드는 다음을 제공합니다.

- **엔드포인트 사용량 표**: 다음 집계 지표와 함께 모든 엔드포인트를 확인합니다.
  - 전체 요청 수(성공 및 실패)
  - 성공률 백분율
  - 소비된 전체 토큰
  - 엔드포인트별 전체 지출
- **성공 요청과 실패 요청 차트**: 엔드포인트별 요청 성공률과 실패율을 시각화합니다.
- **사용량 추세**: 일별 추세 데이터로 엔드포인트 활동이 시간에 따라 어떻게 변하는지 확인합니다.

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/41b2b158-3ab3-4154-a0d0-7233451d3f2b/ascreenshot_ff46db6e09b54ea9bf34ae9028aff58a_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-10/bce32f99-f0ba-4502-8a3a-76257ff5e47a/ascreenshot_2273d3a94acd42e983ad7d6436722c2a_text_export.jpeg)

#### 3. 엔드포인트 지표 이해

각 엔드포인트에는 다음 지표가 표시됩니다.

- **Successful Requests**: 성공적으로 완료된 요청 수
- **Failed Requests**: 오류가 발생한 요청 수
- **Total Requests**: 성공 요청과 실패 요청의 합계
- **Success Rate**: 성공한 요청의 비율
- **Total Tokens**: 프롬프트 토큰과 완료 토큰의 합계
- **Spend**: 해당 엔드포인트로 보낸 모든 요청의 총비용

## 사용 사례

### 성능 모니터링

엔드포인트 상태와 성능을 모니터링합니다.

- 실패율이 높은 엔드포인트 식별
- 트래픽을 가장 많이 받는 엔드포인트 추적
- 엔드포인트별 토큰 소비 패턴 모니터링
- 엔드포인트 사용량의 이상 징후 감지

### 비용 최적화

엔드포인트 전반의 지출 분포를 파악합니다.

- 비용이 높은 엔드포인트 식별
- 비용이 많이 드는 엔드포인트 최적화
- 엔드포인트 사용량을 기준으로 예산 배분
- 시간에 따른 비용 추세 추적

---

## 관련 기능

- [Customer 사용법](./customer_usage.md) - 개별 고객의 지출과 사용량 추적
- [Cost Tracking](./cost_tracking.md) - 포괄적인 비용 추적 및 분석
- [Spend 로그](./cost_tracking.md#-spend-logs-api---individual-transaction-logs) - 자세한 요청 수준 지출 로그
