import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Focus 내보내기(실험적)

:::caution 실험적 기능
Focus 형식 내보내기는 활발히 개발 중이며, 현재는 실험적 기능으로 간주됩니다.
사용자 피드백을 기반으로 반복 개선하는 과정에서 인터페이스, 스키마 매핑, 구성 옵션이 변경될 수 있습니다.
이 통합은 미리보기로 취급해 주시고, 워크플로를 안정화하고 개선할 수 있도록 문제나 제안을 알려 주세요.
:::

LiteLLM은 사용량 데이터를 [FinOps FOCUS 형식](https://focus.finops.org/focus-specification/v1-2/)으로 내보내고, 아티팩트(예: Parquet 파일)를 Amazon S3 같은 대상으로 푸시할 수 있습니다. 이를 통해 다운스트림 비용 분석 도구가 LiteLLM에서 표준화된 데이터셋을 직접 수집할 수 있습니다.

LiteLLM은 현재 이 데이터셋을 내보낼 때 FinOps FOCUS v1.2 사양을 따릅니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 대상 | LiteLLM 사용량 데이터를 FOCUS 형식으로 관리형 스토리지(현재 S3)에 내보냅니다. |
| 콜백 이름 | `focus` |
| 지원 작업 | 자동 예약 내보내기 |
| 데이터 형식 | FOCUS 정규화 데이터셋(Parquet) |

## 환경 변수

### 공통 설정

| 변수 | 필수 여부 | 설명 |
|----------|----------|-------------|
| `FOCUS_PROVIDER` | 아니요 | 대상 공급자입니다(기본값은 `s3`). |
| `FOCUS_FORMAT` | 아니요 | 출력 형식입니다(현재는 `parquet`만 지원). |
| `FOCUS_FREQUENCY` | 아니요 | 내보내기 주기입니다. 프로덕션에서는 `hourly` 또는 `daily`를 권장하며, `interval`은 짧은 테스트 루프용입니다. 기본값은 `hourly`입니다. |
| `FOCUS_CRON_OFFSET` | 아니요 | hourly/daily cron 트리거에 사용되는 분 단위 오프셋입니다. 기본값은 `5`입니다. |
| `FOCUS_INTERVAL_SECONDS` | 아니요 | `FOCUS_FREQUENCY="interval"`일 때의 간격(초)입니다. |
| `FOCUS_PREFIX` | 아니요 | 객체 키 접두사/폴더입니다. 기본값은 `focus_exports`입니다. |

### S3 대상

| 변수 | 필수 여부 | 설명 |
|----------|----------|-------------|
| `FOCUS_S3_BUCKET_NAME` | 예 | 내보낸 파일을 저장할 대상 버킷입니다. |
| `FOCUS_S3_REGION_NAME` | 아니요 | 버킷의 AWS 리전입니다. |
| `FOCUS_S3_ENDPOINT_URL` | 아니요 | 사용자 지정 엔드포인트입니다(S3 호환 스토리지에 유용). |
| `FOCUS_S3_ACCESS_KEY` | 예 | 업로드에 사용할 AWS 액세스 키입니다. |
| `FOCUS_S3_SECRET_KEY` | 예 | 업로드에 사용할 AWS 시크릿 키입니다. |
| `FOCUS_S3_SESSION_TOKEN` | 아니요 | 임시 자격 증명을 사용하는 경우의 AWS 세션 토큰입니다. |

## 구성 파일을 통한 설정

### 환경 변수 구성

```bash
export FOCUS_PROVIDER="s3"
export FOCUS_PREFIX="focus_exports"

# S3 example
export FOCUS_S3_BUCKET_NAME="my-litellm-focus-bucket"
export FOCUS_S3_REGION_NAME="us-east-1"
export FOCUS_S3_ACCESS_KEY="AKIA..."
export FOCUS_S3_SECRET_KEY="..."
```

### LiteLLM 구성 업데이트

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-your-key

litellm_settings:
  callbacks: ["focus"]
```

### 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

부팅 중 LiteLLM은 Focus 로거와 구성된 주기에 따라 실행되는 백그라운드 작업을 등록합니다.

## 계획된 개선 사항
- 현재 구성 기반 설정과 함께 "UI에서 설정" 흐름을 추가합니다.
- 대상 옵션에 GCS / Azure Blob을 추가합니다.
- Parquet과 함께 CSV 출력을 지원합니다.

## 관련 링크

- [Focus](https://focus.finops.org/)
