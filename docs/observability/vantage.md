import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vantage 통합

LiteLLM은 프록시 지출 데이터를 [FOCUS 1.2](https://focus.finops.org/) 형식의 비용 보고서로 [Vantage](https://vantage.sh)에 내보낼 수 있습니다. 이를 통해 Vantage 대시보드에서 클라우드 인프라 비용과 함께 LLM 지출을 시각화할 수 있습니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 대상 | LiteLLM 사용량 데이터를 Vantage Custom Provider로 내보내기 |
| 데이터 형식 | FOCUS CSV (LiteLLM 지출 데이터에서 자동 변환) |
| 지원 작업 | 수동 내보내기, 자동 예약 내보내기 (hourly/daily/interval) |
| 인증 | Vantage API key + Custom Provider token |

## 사전 준비

[Vantage console](https://console.vantage.sh)에서 두 가지 자격 증명이 필요합니다.

1. **API Key** — **Settings → API Access Tokens**로 이동해 **Write** 범위의 토큰을 만듭니다. 토큰은 `vntg_tkn_...` 형태입니다.
2. **Custom Provider Token** — **Settings → Integrations**로 이동해 **Custom Provider** 통합을 만든 뒤 Provider ID를 복사합니다. Provider ID는 `accss_crdntl_...` 형태입니다.

## API로 설정

권장 설정 방식은 프록시 관리자 엔드포인트를 사용하는 것입니다. 설정 파일 변경은 필요하지 않습니다.

### 1. 자격 증명 초기화

```bash
curl -X POST http://localhost:4000/vantage/init \
  -H "Authorization: Bearer $LITELLM_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "vntg_tkn_YOUR_VANTAGE_API_KEY",
    "integration_token": "accss_crdntl_YOUR_PROVIDER_TOKEN"
  }'
```

자격 증명은 암호화되어 프록시 데이터베이스에 저장됩니다.

### 2. 데이터 미리 보기 (dry run)

```bash
curl -X POST http://localhost:4000/vantage/dry-run \
  -H "Authorization: Bearer $LITELLM_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

이 요청은 Vantage로 아무것도 전송하지 않고 FOCUS로 변환된 데이터를 반환합니다. 파이프라인이 정상 동작하는지 확인하고 데이터 매핑을 살펴볼 때 사용합니다.

### 3. Vantage로 내보내기

```bash
curl -X POST http://localhost:4000/vantage/export \
  -H "Authorization: Bearer $LITELLM_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

선택적 매개변수:
- `limit` — 내보낼 최대 레코드 수
- `start_time_utc` / `end_time_utc` — 시간 범위로 필터링합니다. 두 값을 함께 제공해야 합니다.

### 4. Vantage에서 확인

업로드된 CSV를 보려면 **Settings → Integrations → your Custom Provider → Import Costs** 탭으로 이동합니다. 상태가 "가져오기 및 처리 중"에서 "안정"으로 바뀌면 **Cost Reporting → All Resources**에 비용이 표시됩니다.

## 환경 변수로 설정

자동 예약 내보내기를 사용하려면 환경 변수와 프록시 설정으로 구성합니다.

### 환경 변수

| 변수 | 필수 | 설명 |
|----------|----------|-------------|
| `VANTAGE_API_KEY` | 예 | Vantage API 액세스 토큰 |
| `VANTAGE_INTEGRATION_TOKEN` | 예 | Vantage 대시보드의 Custom Provider 토큰 |
| `VANTAGE_BASE_URL` | 아니요 | API URL 재정의 (기본값: `https://api.vantage.sh`) |
| `VANTAGE_EXPORT_FREQUENCY` | 아니요 | `hourly` (기본값), `daily` 또는 `interval` |
| `VANTAGE_EXPORT_INTERVAL_SECONDS` | 아니요 | 빈도가 `interval`일 때 내보내기 사이의 초 단위 간격 |

### 프록시 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-your-key

litellm_settings:
  callbacks: ["vantage"]
```

```bash
export VANTAGE_API_KEY="vntg_tkn_..."
export VANTAGE_INTEGRATION_TOKEN="accss_crdntl_..."
litellm --config /path/to/config.yaml
```

프록시는 구성된 일정에 따라 데이터를 내보내는 백그라운드 작업을 등록합니다.

## API 엔드포인트

모든 엔드포인트에는 관리자 인증이 필요합니다.

| 메서드 | 엔드포인트 | 설명 |
|--------|----------|-------------|
| `POST` | `/vantage/init` | Vantage 자격 증명 저장 (암호화됨) |
| `GET` | `/vantage/settings` | 현재 설정 보기 (자격 증명은 마스킹됨) |
| `PUT` | `/vantage/settings` | 자격 증명 또는 기본 URL 업데이트 |
| `POST` | `/vantage/dry-run` | 업로드 없이 FOCUS 데이터 미리 보기 |
| `POST` | `/vantage/export` | 비용 데이터를 Vantage에 업로드 |
| `DELETE` | `/vantage/delete` | 자격 증명을 제거하고 예약 내보내기 중지 |

## FOCUS 필드 매핑

LiteLLM 지출 데이터는 FOCUS 1.2 스키마로 변환됩니다.

| LiteLLM 필드 | FOCUS 열 | 설명 |
|---------------|-------------|-------------|
| `spend` | BilledCost, EffectiveCost | 사용량 비용 |
| `model` | ChargeDescription, ResourceId | 모델 식별자 |
| `model_group` | ServiceName | 모델 그룹 / 배포 |
| `custom_llm_provider` | ProviderName, PublisherName | 공급자 (openai, anthropic 등) |
| `api_key` | BillingAccountId | 해시된 API 키 |
| `api_key_alias` | BillingAccountName | 사람이 읽을 수 있는 키 별칭 |
| `team_id` | SubAccountId | 팀 식별자 |
| `team_alias` | SubAccountName | 팀 이름 |

추가 메타데이터(user_id, model_group 등)는 JSON 형식으로 `Tags` 열에 포함됩니다.

## 업로드 제한

Vantage는 업로드별 제한을 적용합니다. LiteLLM은 이를 자동으로 처리합니다.

- 업로드당 **10,000 rows** — 큰 내보내기는 배치로 분할됩니다.
- 업로드당 **2 MB** — 너무 큰 배치는 크기 기준으로 다시 분할됩니다.
- **Unsupported columns** — 업로드 전에 제거됩니다.

## 관련 링크

- [Vantage](https://vantage.sh)
- [Vantage Custom Providers](https://docs.vantage.sh/connecting_custom_providers)
- [FOCUS 사양](https://focus.finops.org/)
- [Focus 내보내기 (S3/Parquet)](./focus.md)
