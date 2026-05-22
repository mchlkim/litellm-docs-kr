import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CloudZero 통합

LiteLLM은 CloudZero의 AnyCost API와 통합되어 LLM 사용량 데이터를 CloudZero로 내보내고 비용 추적 분석에 활용할 수 있습니다.

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | 비용 추적 및 분석을 위해 LiteLLM 사용량 데이터를 CloudZero AnyCost API로 내보냅니다 |
| 콜백 이름 | `cloudzero`|
| 지원 작업 | • 시간별 자동 데이터 내보내기<br/>• 수동 데이터 내보내기<br/>• 드라이 런 테스트<br/>• 비용 및 토큰 사용량 추적 |
| 데이터 형식 | 적절한 리소스 태그가 포함된 CloudZero Billing Format (CBF) |
| 내보내기 빈도 | 매시간 (`CLOUDZERO_EXPORT_INTERVAL_MINUTES`로 설정 가능) |

## 환경 변수

| 변수 | 필수 여부 | 설명 | 예제 |
|----------|----------|-------------|---------|
| `CLOUDZERO_API_KEY` | 예 | CloudZero API 키 | `cz_api_xxxxxxxxxx` |
| `CLOUDZERO_CONNECTION_ID` | 예 | 데이터 제출에 사용할 CloudZero 연결 ID | `conn_xxxxxxxxxx` |
| `CLOUDZERO_TIMEZONE` | 아니요 | 날짜 처리에 사용할 시간대 (기본값: UTC) | `America/New_York` |
| `CLOUDZERO_EXPORT_INTERVAL_MINUTES` | 아니요 | 분 단위 내보내기 빈도 (기본값: 60) | `60` |

## 설정

### 엔드 투 엔드 동영상 안내
이 동영상은 LiteLLM에서 CloudZero 통합을 설정하고 LiteLLM에서 내보낸 사용량 데이터를 CloudZero에서 확인하는 전체 과정을 안내합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/59b57593183f4cc3b1c05a2dd3277f92" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

### 1단계: 환경 변수 구성

환경에 CloudZero 자격 증명을 설정합니다.

```bash
export CLOUDZERO_API_KEY="cz_api_xxxxxxxxxx"
export CLOUDZERO_CONNECTION_ID="conn_xxxxxxxxxx"
export CLOUDZERO_TIMEZONE="UTC"  # Optional, defaults to UTC
```

### 2단계: CloudZero 통합 활성화

LiteLLM 구성 YAML 파일에 CloudZero 콜백을 추가합니다.


```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-xxxxxxx

litellm_settings:
  callbacks: ["cloudzero"]  # Enable CloudZero integration
```

### 3단계: LiteLLM 프록시 시작

구성 파일을 사용해 LiteLLM 프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

## UI에서 설정

1\. "Settings"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/5ac36280-c688-41a3-8d0e-23e19c6a470b/ascreenshot.jpeg?tl_px=0,332&br_px=1308,1064&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=119,444)


2\. "Logging & Alerts"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/13f76b09-e0c4-4738-ba05-2d5111c6ad3e/ascreenshot.jpeg?tl_px=0,332&br_px=1308,1064&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=58,507)


3\. "CloudZero Cost Tracking"을 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/f96cc1e5-7bc0-4d7c-9aeb-5cbbec549b12/ascreenshot.jpeg?tl_px=0,0&br_px=1308,731&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=389,56)


4\. "Add CloudZero Integration"을 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/04fbc748-0e6f-43bb-8a57-dd2e83dbfcb5/ascreenshot.jpeg?tl_px=0,90&br_px=1308,821&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=616,277)


5\. CloudZero API 키를 입력합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/080e82f1-f94f-4ed7-8014-e495380336f3/ascreenshot.jpeg?tl_px=0,0&br_px=1308,731&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=506,129)


6\. CloudZero 연결 ID를 입력합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/af417aa2-67a8-4dee-a014-84b1892dc07e/ascreenshot.jpeg?tl_px=0,0&br_px=1308,731&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=488,213)


7\. "Create"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/647e672f-9a4a-4754-a7b0-abf1397abad4/ascreenshot.jpeg?tl_px=0,88&br_px=1308,819&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=711,277)


8\. "Run Dry Run Simulation"으로 페이로드를 테스트합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/7447cbe0-3450-4be5-bdc4-37fb8280aa58/ascreenshot.jpeg?tl_px=0,125&br_px=1308,856&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=334,277)


10\. CloudZero로 내보내려면 "Export Data Now"를 클릭합니다.

![](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-22/7be9bd48-6e27-4c68-bc75-946f3ab593d9/ascreenshot.jpeg?tl_px=0,130&br_px=1308,861&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=518,277)

## 설정 테스트

### 드라이 런 내보내기

CloudZero로 데이터를 보내지 않고 CloudZero 구성을 테스트하려면 드라이 런 엔드포인트를 호출합니다. 이 엔드포인트는 CloudZero로 데이터를 전송하지 않으며, 내보내기 대상이 될 데이터만 반환합니다.

```bash
curl -X POST "http://localhost:4000/cloudzero/dry-run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "limit": 10
  }' | jq
```

**예상 응답:**
```json
{
  "message": "CloudZero dry run export completed successfully.",
  "status": "success",
  "dry_run_data": {
    "usage_data": [...],
    "cbf_data": [...],
    "summary": {
      "total_cost": 0.05,
      "total_tokens": 1250,
      "total_records": 10
    }
  }
}
```

### 수동 내보내기

데이터를 즉시 CloudZero로 보내려면 내보내기 엔드포인트를 호출합니다. 내보내기를 테스트할 때는 작은 `limit` 값을 설정하는 것을 권장합니다. 이렇게 하면 최근 10개 레코드만 CloudZero로 내보냅니다. 참고: CloudZero가 내보낸 데이터를 처리하는 데 최대 15분이 걸릴 수 있습니다.

```bash
curl -X POST "http://localhost:4000/cloudzero/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "limit": 10
  }' | jq
```

**예상 응답:**
```json
{
  "message": "CloudZero export completed successfully",
  "status": "success"
}
```

## 데이터 내보내기 세부 정보

### 자동 내보내기 일정

- **빈도**: 60분마다 (`CLOUDZERO_EXPORT_INTERVAL_MINUTES`로 설정 가능)
- **데이터 처리**: LiteLLM은 사용량 데이터를 매시간 자동으로 처리하고 내보냅니다
- **CloudZero 처리**: CloudZero는 일반적으로 LiteLLM의 데이터를 처리하는 데 10~15분이 걸립니다

### 데이터 형식

LiteLLM은 다음 구조의 CloudZero Billing Format (CBF)으로 데이터를 내보냅니다.

```json
{
  "time/usage_start": "2024-01-15T14:00:00Z",
  "cost/cost": 0.002,
  "usage/amount": 150,
  "usage/units": "tokens",
  "resource/id": "czrn:litellm:openai:cross-region:team-123:llm-usage:gpt-4o",
  "resource/service": "litellm",
  "resource/account": "team-123",
  "resource/region": "cross-region",
  "resource/usage_family": "llm-usage",
  "resource/tag:provider": "openai",
  "resource/tag:model": "gpt-4o",
  "resource/tag:prompt_tokens": "100",
  "resource/tag:completion_tokens": "50"
}
```

### 리소스 태그 지정

LiteLLM은 비용 귀속을 위한 포괄적인 리소스 태그를 자동으로 생성합니다.

- **공급자 태그**: `openai`, `anthropic`, `azure` 등
- **모델 태그**: `gpt-4o`, `claude-3-sonnet` 같은 특정 모델 이름
- **팀/사용자 태그**: 비용 할당을 위한 팀 ID 및 사용자 ID
- **토큰 세부 내역**: 프롬프트 토큰과 완료 토큰을 별도로 추적
- **사용량 지표**: 요청별 총 토큰 소비량

## 고급 설정

### 사용자 지정 내보내기 빈도

내보내기 빈도를 변경합니다. 60분 미만으로 설정하는 것은 권장하지 않습니다.

```bash
export CLOUDZERO_EXPORT_INTERVAL_MINUTES=120  # Export every 2 hours
```

### 사용자 지정 시간 범위 내보내기

특정 시간 범위의 데이터를 내보냅니다.

```bash
curl -X POST "http://localhost:4000/cloudzero/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "start_time_utc": "2024-01-15T00:00:00Z",
    "end_time_utc": "2024-01-15T23:59:59Z",
    "operation": "replace_hourly"
  }' | jq
```

## 문제 해결

### 자주 발생하는 문제

1. **자격 증명 누락 오류**
   ```
   CloudZero configuration missing. Please set CLOUDZERO_API_KEY and CLOUDZERO_CONNECTION_ID environment variables.
   ```
   **해결 방법**: 두 환경 변수가 모두 유효한 값으로 설정되어 있는지 확인합니다.

2. **연결 문제**
   - CloudZero API 키가 유효한지 확인합니다
   - 연결 ID가 CloudZero 계정에 존재하는지 확인합니다
   - 프록시가 CloudZero API에 접근할 수 있도록 인터넷 액세스가 있는지 확인합니다

3. **CloudZero에 데이터가 없음**
   - CloudZero가 데이터를 처리하는 데 10~15분이 걸릴 수 있습니다
   - LiteLLM 프록시가 사용량 데이터를 생성하고 있는지 확인합니다
   - 데이터 형식이 올바르게 구성되는지 확인하려면 드라이 런 엔드포인트를 사용합니다

## 관련 링크

- [CloudZero 문서](https://docs.cloudzero.com/)
- [CloudZero AnyCost API](https://docs.cloudzero.com/reference/anycost-api)
