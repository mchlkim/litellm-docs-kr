import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 멀티 리전 아키텍처용 Control Plane (엔터프라이즈)

중앙 집중식 관리를 유지하고 관리 오버헤드 중복을 피하면서 LiteLLM을 여러 리전에 배포하는 방법을 알아봅니다.

:::info

✨ LiteLLM 엔터프라이즈 기능이 필요합니다.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

## 개요

프로덕션 용도로 LiteLLM을 확장할 때 단일 관리 지점을 유지하면서 여러 리전 또는 가용 영역에 여러 인스턴스를 배포해야 할 수 있습니다. 이 가이드는 다음 구성으로 분산 LiteLLM 배포를 설정하는 방법을 다룹니다.

- **리전별 Worker 인스턴스**: 특정 리전 사용자의 LLM 요청을 처리합니다.
- **중앙 집중식 Admin 인스턴스**: 설정, 사용자, 키, 모니터링을 관리합니다.

## 아키텍처 패턴: Regional + Admin 인스턴스

### 일반적인 배포 시나리오

<Image img={require('../../img/scaling_architecture.png')} />  

### 이 아키텍처의 이점

1. **관리 오버헤드 감소**: 하나의 인스턴스에만 admin 기능이 필요합니다.
2. **리전별 성능**: 사용자는 자신의 리전에서 낮은 지연 시간으로 접근할 수 있습니다.
3. **중앙 집중식 제어**: 모든 관리는 단일 인터페이스에서 수행됩니다.
4. **보안**: admin 접근을 지정된 인스턴스로만 제한합니다.
5. **비용 효율성**: admin 인프라 중복을 피합니다.

## 설정

### Admin 인스턴스 설정

Admin 인스턴스는 모든 관리 작업을 처리하고 UI를 제공합니다.

**Admin 인스턴스용 환경 변수:**
```bash
# Keep admin capabilities enabled (default behavior)
# DISABLE_ADMIN_UI=false          # Admin UI available
# DISABLE_ADMIN_ENDPOINTS=false   # Management APIs available
DISABLE_LLM_API_ENDPOINTS=true      # LLM APIs disabled
DATABASE_URL=postgresql://user:pass@global-db:5432/litellm
LITELLM_MASTER_KEY=your-master-key
```

### Worker 인스턴스 설정

Worker 인스턴스는 LLM 요청을 처리하지만 admin 기능은 비활성화되어 있습니다.

**Worker 인스턴스용 환경 변수:**
```bash
# Disable admin capabilities
DISABLE_ADMIN_UI=true           # No admin UI
DISABLE_ADMIN_ENDPOINTS=true    # No management endpoints

DATABASE_URL=postgresql://user:pass@global-db:5432/litellm
LITELLM_MASTER_KEY=your-master-key
```

## 환경 변수 참조

### `DISABLE_ADMIN_UI`

LiteLLM 관리자 UI 인터페이스를 비활성화합니다.

- **기본값**: `false`
- **Worker 인스턴스**: `true`로 설정합니다.
- **Admin 인스턴스**: `false`로 두거나 설정하지 않습니다.

```bash
# Worker instances
DISABLE_ADMIN_UI=true
```

**효과**: 활성화하면 `/ui`의 웹 UI를 사용할 수 없게 됩니다.

### `DISABLE_ADMIN_ENDPOINTS`

:::info

✨ 엔터프라이즈 기능입니다.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

모든 관리/admin API 엔드포인트를 비활성화합니다.

- **기본값**: `false`  
- **Worker 인스턴스**: `true`로 설정합니다.
- **Admin 인스턴스**: `false`로 두거나 설정하지 않습니다.

```bash
# Worker instances  
DISABLE_ADMIN_ENDPOINTS=true
```

**비활성화되는 엔드포인트**:
- `/key/*` - 키 관리
- `/user/*` - 사용자 관리  
- `/team/*` - 팀 관리
- `/config/*` - 설정 업데이트
- 기타 모든 관리 엔드포인트

**사용 가능한 엔드포인트**(비활성화된 경우):
- `/chat/completions` - LLM 요청
- `/v1/*` - OpenAI 호환 API
- `/vertex_ai/*` - Vertex AI 패스스루 API
- `/bedrock/*` - Bedrock 패스스루 API
- `/health` - 기본 상태 확인
- `/metrics` - Prometheus 메트릭
- 기타 모든 LLM API 엔드포인트


### `DISABLE_LLM_API_ENDPOINTS`

:::info

✨ 엔터프라이즈 기능입니다.

[엔터프라이즈 Pricing](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::

모든 LLM API 엔드포인트를 비활성화합니다.

- **기본값**: `false`
- **Worker 인스턴스**: `false`로 두거나 설정하지 않습니다.
- **Admin 인스턴스**: `true`로 설정합니다.

```bash
# Admin instance
DISABLE_LLM_API_ENDPOINTS=true
```


**비활성화되는 엔드포인트**:
- `/chat/completions` - LLM 요청
- `/v1/*` - OpenAI 호환 API
- `/vertex_ai/*` - Vertex AI 패스스루 API
- `/bedrock/*` - Bedrock 패스스루 API
- 기타 모든 LLM API 엔드포인트


**사용 가능한 엔드포인트**(비활성화된 경우):
- `/key/*` - 키 관리
- `/user/*` - 사용자 관리  
- `/team/*` - 팀 관리
- `/config/*` - 설정 업데이트
- 기타 모든 관리 엔드포인트

### `LITELLM_UI_API_DOC_BASE_URL`

admin UI가 proxy와 다른 호스트에서 실행될 때 API Reference 기본 URL(샘플 코드/문서에서 사용)을 선택적으로 재정의합니다.


## 사용 패턴

### Client 사용법

**LLM 요청용**(리전별 엔드포인트 사용):
```python
import openai

# US users
client_us = openai.OpenAI(
    base_url="https://us.company.com/v1",
    api_key="your-litellm-key"
)

# EU users  
client_eu = openai.OpenAI(
    base_url="https://eu.company.com/v1", 
    api_key="your-litellm-key"
)

response = client_us.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**관리용**(admin 엔드포인트 사용):
```python
import requests

# Create a new API key
response = requests.post(
    "https://admin.company.com/key/generate",
    headers={"Authorization": "Bearer sk-1234"},
    json={"duration": "30d"}
)
```

## 관련 문서

- [가상 키](./virtual_keys.md) - API 키와 사용자를 관리합니다.
- [Health Checks](./health.md) - 인스턴스 상태를 모니터링합니다.  
- [Prometheus Metrics](./logging.md#prometheus-metrics) - 메트릭을 수집합니다.
- [Production Deployment](./prod.md) - 프로덕션 모범 사례를 확인합니다. 
