import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `/batchPredictionJobs`

LiteLLM은 패스스루 엔드포인트를 통해 Vertex AI 배치 예측 작업을 지원하므로, 프록시 서버를 통해 배치 작업을 직접 생성하고 관리할 수 있습니다.

## 기능

- **배치 작업 생성**: Vertex AI 모델을 사용하여 배치 예측 작업을 생성합니다.
- **비용 추적**: 배치 작업의 비용 계산과 사용량 추적을 자동으로 처리합니다.
- **상태 모니터링**: 작업 상태를 추적하고 결과를 가져옵니다.
- **모델 지원**: 지원되는 모든 Vertex AI 모델(Gemini, Text Embedding)에서 작동합니다.

## 비용 추적 지원

| 기능 | 지원 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | 배치 작업의 비용을 자동으로 계산합니다. |
| 사용량 모니터링 | ✅ | 배치 작업 전반의 토큰 사용량과 비용을 추적합니다. |
| 로깅 | ✅ | 지원됨 |

## 빠른 시작

1. 프록시 설정에서 **모델을 구성합니다**.

```yaml
model_list:
  - model_name: gemini-1.5-flash
    litellm_params:
      model: vertex_ai/gemini-1.5-flash
      vertex_project: your-project-id
      vertex_location: us-central1
      vertex_credentials: path/to/service-account.json
```

2. **배치 작업을 생성합니다**.

```bash
curl -X POST "http://localhost:4000/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "my-batch-job",
    "model": "projects/your-project/locations/us-central1/publishers/google/models/gemini-1.5-flash",
    "inputConfig": {
      "gcsSource": {
        "uris": ["gs://my-bucket/input.jsonl"]
      },
      "instancesFormat": "jsonl"
    },
    "outputConfig": {
      "gcsDestination": {
        "outputUriPrefix": "gs://my-bucket/output/"
      },
      "predictionsFormat": "jsonl"
    }
  }'
```

3. **작업 상태를 모니터링합니다**.

```bash
curl -X GET "http://localhost:4000/v1/projects/your-project/locations/us-central1/batchPredictionJobs/job-id" \
  -H "Authorization: Bearer your-api-key"
```

## 모델 설정

배치 작업용 모델을 구성할 때는 다음 명명 규칙을 사용합니다.

- **`model_name`**: 기본 모델 이름(예: `gemini-1.5-flash`)
- **`model`**: 전체 LiteLLM 식별자(예: `vertex_ai/gemini-1.5-flash`)

## 지원 모델

- `gemini-1.5-flash` / `vertex_ai/gemini-1.5-flash`
- `gemini-1.5-pro` / `vertex_ai/gemini-1.5-pro`
- `gemini-2.0-flash` / `vertex_ai/gemini-2.0-flash`
- `gemini-2.0-pro` / `vertex_ai/gemini-2.0-pro`

## 고급 사용법

### 사용자 지정 매개변수가 포함된 배치 작업

```bash
curl -X POST "http://localhost:4000/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "advanced-batch-job",
    "model": "projects/your-project/locations/us-central1/publishers/google/models/gemini-1.5-pro",
    "inputConfig": {
      "gcsSource": {
        "uris": ["gs://my-bucket/advanced-input.jsonl"]
      },
      "instancesFormat": "jsonl"
    },
    "outputConfig": {
      "gcsDestination": {
        "outputUriPrefix": "gs://my-bucket/advanced-output/"
      },
      "predictionsFormat": "jsonl"
    },
    "labels": {
      "environment": "production",
      "team": "ml-engineering"
    }
  }'
```

### 모든 배치 작업 나열

```bash
curl -X GET "http://localhost:4000/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key"
```

### 배치 작업 취소

```bash
curl -X POST "http://localhost:4000/v1/projects/your-project/locations/us-central1/batchPredictionJobs/job-id:cancel" \
  -H "Authorization: Bearer your-api-key"
```

## 비용 추적 세부 정보

LiteLLM은 Vertex AI 배치 작업에 대한 포괄적인 비용 추적을 제공합니다.

- **토큰 사용량**: 각 배치 요청의 입력 및 출력 토큰을 추적합니다.
- **비용 계산**: 현재 Vertex AI 가격을 기준으로 비용을 자동 계산합니다.
- **사용량 집계**: 배치 작업의 모든 요청에 대한 비용을 집계합니다.
- **실시간 모니터링**: 배치 작업이 진행되는 동안 비용을 모니터링합니다.

비용 추적은 `generateContent` API와 원활하게 작동하며, 배치 처리 비용에 대한 자세한 인사이트를 제공합니다.

## 오류 처리

일반적인 오류 시나리오와 해결 방법은 다음과 같습니다.

| 오류 | 설명 | 해결 방법 |
|-------|-------------|----------|
| `INVALID_ARGUMENT` | 모델 또는 구성이 잘못됨 | 모델 이름과 프로젝트 설정을 확인합니다. |
| `PERMISSION_DENIED` | 권한이 부족함 | Vertex AI IAM 역할을 확인합니다. |
| `RESOURCE_EXHAUSTED` | 할당량 초과 | Vertex AI 할당량과 제한을 확인합니다. |
| `NOT_FOUND` | 작업 또는 리소스를 찾을 수 없음 | 작업 ID와 프로젝트 구성을 확인합니다. |

## 권장 사항

1. **적절한 배치 크기 사용**: 처리 효율성과 리소스 사용량 사이의 균형을 맞춥니다.
2. **작업 상태 모니터링**: 작업 상태를 정기적으로 확인하여 실패를 신속하게 처리합니다.
3. **알림 설정**: 작업 완료 및 실패를 모니터링하도록 구성합니다.
4. **비용 최적화**: 비용 추적을 사용해 최적화 기회를 파악합니다.
5. **작은 배치로 테스트**: 먼저 작은 테스트 배치로 설정을 검증합니다.

## 관련 문서

- [Vertex AI 공급자 문서](./providers/vertex.md)
- [일반 Batches API 문서](./batches.md)
- [비용 추적 및 모니터링](./observability/telemetry.md)
