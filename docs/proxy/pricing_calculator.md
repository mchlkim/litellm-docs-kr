# Pricing Calculator (비용 추정) {#pricing-calculator-cost-estimation}

예상 토큰 사용량과 요청량을 기준으로 LLM 비용을 추정합니다. 이 도구는 개발자와 플랫폼 팀이 모델을 프로덕션에 배포하기 전에 지출을 예측하는 데 도움이 됩니다.

## 이 기능을 사용하는 경우 {#when-to-use-this-feature}

Pricing Calculator를 사용하면 다음을 할 수 있습니다.
- **예산 계획** - 모델 사용을 확정하기 전에 월별 비용 추정
- **모델 비교** - 사용 사례에 맞는 여러 모델의 비용 비교
- **용량 계획** - 요청량 확장에 따른 비용 영향 파악
- **비용 최적화** - 토큰 요구사항에 가장 비용 효율적인 모델 식별

## Pricing Calculator 사용하기 {#using-the-pricing-calculator}

이 안내에서는 LiteLLM UI의 Pricing Calculator를 사용해 LLM 비용을 추정하는 방법을 보여줍니다.

### 1단계: Settings로 이동 {#step-1-navigate-to-settings}

LiteLLM 대시보드의 왼쪽 사이드바에서 **Settings**를 클릭합니다.

![Settings 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/183c437e-bda9-48b4-ab8f-95f023ba1146/ascreenshot_a1013487f545484194a9a4929eef4c49_text_export.jpeg)

### 2단계: Cost Tracking 열기 {#step-2-open-cost-tracking}

비용 구성 옵션에 접근하려면 **Cost Tracking**을 클릭합니다.

![Cost Tracking 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/05c92350-cbae-42ed-935b-e96a26003de8/ascreenshot_cc85f175a6664fc5be8dfdcc1759b442_text_export.jpeg)

### 3단계: Pricing Calculator 열기 {#step-3-open-pricing-calculator}

계산기 패널을 펼치려면 **Pricing Calculator**를 클릭합니다. 이 섹션에서는 예상 토큰 사용량과 요청량을 기준으로 LLM 비용을 추정할 수 있습니다.

![Pricing Calculator 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/31ab5547-fa7d-4abd-b41a-7b4bbc0401f7/ascreenshot_f7f8b098ceba4b5199e5cbc60dddfd0a_text_export.jpeg)

### 4단계: 모델 선택 {#step-4-select-a-model}

비용을 추정할 모델을 선택하려면 **Model** 드롭다운을 클릭합니다.

![Model 필드 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/a6c236ce-3154-42a8-9701-120e3f7a017b/ascreenshot_635c61b832594e809f8ab79b5b3f32e1_text_export.jpeg)

목록에서 모델을 선택합니다. 표시되는 모델은 LiteLLM proxy에 구성된 모델입니다.

![모델 선택](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/96c4ebc4-1b88-4dea-b3b2-ea32fde36d9e/ascreenshot_7c2920f05a984ebbb530a8a85e669537_text_export.jpeg)

### 5단계: 토큰 수 구성 {#step-5-configure-token-counts}

예상 **Input Tokens (per request)**를 입력합니다. 이는 프롬프트의 평균 토큰 수입니다.

![Input Tokens 필드 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/d0b5ad8a-56e4-4f73-ac66-e1d728c81dc5/ascreenshot_42502082d6204a3891e0a2c3e89a1e38_text_export.jpeg)

예상 **Output Tokens (per request)**를 입력합니다. 이는 모델 응답의 평균 토큰 수입니다.

![Output Tokens 필드 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/d7481177-c63c-47f5-9316-1e87695f67f9/ascreenshot_8718cac4c0d14a82ab9f2b71795250c2_text_export.jpeg)

### 6단계: 요청량 설정 {#step-6-set-request-volume}

예상 요청량을 입력합니다. **Requests per Day** 및/또는 **Requests per Month**를 지정할 수 있습니다.

![Requests per Month 필드 클릭](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/42270e11-93f1-41dc-b9c7-3bb6971ced31/ascreenshot_79f2ea9937b34e48ab1ff832ce7f7cb7_text_export.jpeg)

예를 들어 월 1천만 건의 요청은 `10000000`을 입력합니다.

![요청량 입력](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/5e6c4338-ff87-44dd-9059-7577217fa3c8/ascreenshot_15c36610dc914536ac9446470eb39f05_text_export.jpeg)

### 7단계: 비용 추정치 확인 {#step-7-view-cost-estimates}

값을 변경하면 계산기가 자동으로 업데이트됩니다. 다음 항목을 포함한 비용 내역을 확인합니다.

- **Per-Request Cost** - 요청당 총 비용, 입력 비용, 출력 비용, margin/fee
- **Daily Costs** - 일별 요청 수를 지정한 경우의 집계 비용
- **Monthly Costs** - 월별 요청 수를 지정한 경우의 집계 비용

![비용 추정치 확인](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/4436cd11-df58-47cb-9742-c0d08865a61c/ascreenshot_f961298a4231464ea841bc4d184f731e_text_export.jpeg)

### 8단계: 보고서 내보내기 {#step-8-export-the-report}

비용 추정치를 다운로드하려면 **Export** 버튼을 클릭합니다. 다음 형식으로 내보낼 수 있습니다.

- **PDF** - PDF로 저장할 수 있는 인쇄 대화상자를 엽니다. 이해관계자와 공유하기에 적합합니다.
- **CSV** - 추가 분석에 사용할 수 있는 스프레드시트 호환 파일을 다운로드합니다.

## 비용 내역 세부 정보 {#cost-breakdown-details}

Pricing Calculator에는 다음 항목이 표시됩니다.

| 필드 | 설명 |
|-------|-------------|
| **Total Cost** | 구성된 margin을 포함한 전체 비용 |
| **Input Cost** | 입력/프롬프트 토큰 비용 |
| **Output Cost** | 출력/completion 토큰 비용 |
| **Margin/Fee** | 구성된 [provider margins](/docs/proxy/provider_margins) |
| **Token Pricing** | 토큰당 요율($/1M tokens로 표시) |

## API Endpoint {#api-endpoint}

`/cost/estimate` endpoint를 사용해 프로그래밍 방식으로도 비용을 추정할 수 있습니다.

```bash
curl -X POST "http://localhost:4000/cost/estimate" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "input_tokens": 1000,
    "output_tokens": 500,
    "num_requests_per_day": 1000,
    "num_requests_per_month": 30000
  }'
```

**응답:**
```json
{
  "model": "gpt-4",
  "input_tokens": 1000,
  "output_tokens": 500,
  "num_requests_per_day": 1000,
  "num_requests_per_month": 30000,
  "cost_per_request": 0.045,
  "input_cost_per_request": 0.03,
  "output_cost_per_request": 0.015,
  "margin_cost_per_request": 0.0,
  "daily_cost": 45.0,
  "daily_input_cost": 30.0,
  "daily_output_cost": 15.0,
  "daily_margin_cost": 0.0,
  "monthly_cost": 1350.0,
  "monthly_input_cost": 900.0,
  "monthly_output_cost": 450.0,
  "monthly_margin_cost": 0.0,
  "input_cost_per_token": 3e-05,
  "output_cost_per_token": 6e-05,
  "provider": "openai"
}
```

## 관련 기능 {#related-features}

- [Provider Margins](/docs/proxy/provider_margins) - LLM 비용에 수수료 또는 margin 추가
- [Provider Discounts](/docs/proxy/provider_discounts) - provider 비용에 할인 적용
- [Cost Tracking](/docs/proxy/cost_tracking) - LLM 지출 추적 및 모니터링
