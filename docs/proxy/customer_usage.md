import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Customer 사용법

대시보드에서 최종 사용자 지출을 직접 추적하고 시각화합니다. 고객이 LLM 서비스를 어떻게 사용하는지 파악할 수 있도록 고객 수준의 사용량 분석, 지출 로그, 활동 지표를 모니터링합니다.

이 기능은 **v1.80.8-stable 이상에서 사용할 수 있습니다**.

## 개요

Customer 사용법은 API 요청에 ID를 전달해 개별 고객(최종 사용자)의 지출과 사용량을 추적할 수 있게 해줍니다. 이를 통해 다음을 수행할 수 있습니다.

- 고객별 지출을 자동으로 추적
- 관리자 UI에서 고객 수준의 사용량 분석 확인
- 고객 ID로 지출 로그와 활동 지표 필터링
- 고객별 예산과 속도 제한 설정
- 고객 사용 패턴과 추세 모니터링

<Image img={require('../../img/customer_usage.png')} />

## 지출 추적 방법

API 요청에 `user` 필드를 포함하거나 고객 ID 헤더를 전달해 고객 지출을 추적합니다. 고객 ID는 자동으로 추적되며 해당 요청에서 발생한 모든 지출과 연결됩니다.

<Tabs>
<TabItem value="body" label="요청 본문" default>

### 요청 본문 사용

고객 ID를 포함한 `user` 필드로 `/chat/completions` 호출을 보냅니다.

```bash showLineNumbers title="Track spend with customer ID in body"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer sk-1234' \
  --data '{
    "model": "gpt-3.5-turbo",
    "user": "customer-123",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ]
  }'
```

</TabItem>
<TabItem value="header" label="요청 헤더">

### 요청 헤더 사용

HTTP 헤더로도 고객 ID를 전달할 수 있습니다. 이는 사용자 지정 헤더를 지원하지만 요청 본문 수정을 허용하지 않는 도구(`ANTHROPIC_CUSTOM_HEADERS`를 사용하는 Claude Code 등)에 유용합니다.

LiteLLM은 다음 표준 헤더를 자동으로 인식합니다(설정 불필요).
- `x-litellm-customer-id`
- `x-litellm-end-user-id`

```bash showLineNumbers title="Track spend with customer ID in header"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'x-litellm-customer-id: customer-123' \
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

#### Claude Code와 함께 사용

Claude Code는 `ANTHROPIC_CUSTOM_HEADERS` 환경 변수를 통해 사용자 지정 헤더를 지원합니다. 고객 ID를 전달하도록 설정합니다.

```bash title="Configure Claude Code with customer tracking"
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000/v1/messages"
export ANTHROPIC_API_KEY="sk-1234"
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-customer-id: my-customer-id"
```

이제 Claude Code에서 보내는 모든 요청의 지출이 `my-customer-id` 아래에 자동으로 추적됩니다.

</TabItem>
</Tabs>

고객 ID는 새 지출과 함께 데이터베이스에 자동으로 upsert됩니다. 고객 ID가 이미 있으면 지출이 증가합니다.

### OpenWebUI 사용 예제

Open WebUI를 LiteLLM에 연결하고 고객 사용량을 추적하는 자세한 방법은 [Open WebUI 튜토리얼](../tutorials/openweb_ui.md)을 참조하세요.

## 지출 확인 방법

### 관리자 UI에서 지출 확인

고객 수준의 지출 분석을 확인하려면 관리자 UI의 Customer 사용법 탭으로 이동합니다.

#### 1. Customer 사용법 접근

관리자 UI의 사용법 페이지(`PROXY_BASE_URL/ui/?login=success&page=new_usage`)로 이동한 뒤 **Customer 사용법** 탭을 클릭합니다.

<Image img={require('../../img/customer_usage_ui_navigation.png')} />

#### 2. 고객 분석 확인

Customer 사용법 대시보드는 다음을 제공합니다.

- **고객별 총 지출**: 모든 고객의 집계 지출 확인
- **일별 지출 추세**: 시간에 따른 고객 지출 변화 확인
- **모델 사용량 분석**: 각 고객이 어떤 모델을 사용하는지 파악
- **활동 지표**: 고객별 요청, 토큰, 성공률 추적

<Image img={require('../../img/customer_usage_analytics.png')} />

#### 3. 고객별 필터링

고객 필터 드롭다운을 사용해 특정 고객의 지출을 확인합니다.

- 드롭다운에서 하나 이상의 고객 ID 선택
- 필터링된 분석, 지출 로그, 활동 지표 확인
- 여러 고객 간 지출 비교

<Image img={require('../../img/customer_usage_filter.png')} />

## 사용 사례

### 고객 청구

최종 사용자에게 정확히 청구할 수 있도록 고객별 지출을 추적합니다.

- 개별 고객 사용량 모니터링
- 실제 지출을 기준으로 청구서 생성
- 고객별 지출 한도 설정

### 사용량 분석

여러 고객이 서비스를 어떻게 사용하는지 파악합니다.

- 고가치 고객 식별
- 사용 패턴 분석
- 리소스 할당 최적화

---

## 관련 기능

- [Customers / End-User Budgets](./customers.md) - 고객 예산과 속도 제한 설정
- [Cost Tracking](./cost_tracking.md) - 종합적인 비용 추적 및 분석
- [Billing](./billing.md) - 고객 사용량에 따른 청구
