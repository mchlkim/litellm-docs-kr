# Anthropic Beta Headers 자동 동기화

서비스를 재시작하지 않고 Anthropic beta headers 구성을 자동으로 최신 상태로 유지합니다. **이를 통해 서비스를 재시작하지 않아도 모든 제공자에서 새로운 Anthropic beta 기능을 지원할 수 있습니다.**

## 개요

Anthropic이 새로운 beta 기능(예: 새로운 도구 기능, 확장된 context window)을 출시하면, 일반적으로 Anthropic, Bedrock, Vertex AI, Azure AI 같은 여러 제공자에 대한 최신 beta header 매핑을 가져오기 위해 LiteLLM 서비스를 재시작해야 합니다.

자동 동기화를 사용하면 LiteLLM이 재시작 없이 GitHub의 [`anthropic_beta_headers_config.json`](https://github.com/BerriAI/litellm/blob/main/litellm/anthropic_beta_headers_config.json)에서 최신 구성을 자동으로 가져옵니다. 즉, 다음이 가능합니다.

- 새 beta 기능이 출시되어도 **다운타임 없음**
- **항상 최신 상태인** 제공자 지원 매핑
- **자동 업데이트** - 한 번 설정하면 계속 동작

## 빠른 시작

**수동 동기화:**
```bash
curl -X POST "https://your-proxy-url/reload/anthropic_beta_headers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**24시간마다 자동 동기화:**
```bash
curl -X POST "https://your-proxy-url/schedule/anthropic_beta_headers_reload?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|----------|--------|-------------|
| `/reload/anthropic_beta_headers` | POST | 수동 동기화 |
| `/schedule/anthropic_beta_headers_reload?hours={hours}` | POST | 주기적 동기화 예약 |
| `/schedule/anthropic_beta_headers_reload` | DELETE | 예약된 동기화 취소 |
| `/schedule/anthropic_beta_headers_reload/status` | GET | 동기화 상태 확인 |

**인증:** admin role 또는 master key가 필요합니다.

## Python 예제

```python
import requests

def sync_anthropic_beta_headers(proxy_url, admin_token):
    response = requests.post(
        f"{proxy_url}/reload/anthropic_beta_headers",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()

# Usage
result = sync_anthropic_beta_headers("https://your-proxy-url", "your-admin-token")
print(result['message'])
```

## 설정

**사용자 지정 beta headers config URL:**
```bash
export LITELLM_ANTHROPIC_BETA_HEADERS_URL="https://raw.githubusercontent.com/BerriAI/litellm/main/litellm/anthropic_beta_headers_config.json"
```

**로컬 beta headers config 사용:**
```bash
export LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS=True
```

## 자동 Reload 예약

프록시가 항상 최신 beta header 매핑을 갖도록 자동 reload를 예약하세요.

```bash
# Reload every 24 hours
curl -X POST "https://your-proxy-url/schedule/anthropic_beta_headers_reload?hours=24" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**reload 상태 확인:**
```bash
curl -X GET "https://your-proxy-url/schedule/anthropic_beta_headers_reload/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**응답:**
```json
{
  "scheduled": true,
  "interval_hours": 24,
  "last_run": "2026-02-13T10:00:00",
  "next_run": "2026-02-14T10:00:00"
}
```

**예약된 reload 취소:**
```bash
curl -X DELETE "https://your-proxy-url/schedule/anthropic_beta_headers_reload" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 환경 변수 {#environment-variables}

| 변수 | 설명 | 기본값 |
|----------|-------------|---------|
| `LITELLM_ANTHROPIC_BETA_HEADERS_URL` | beta headers config를 가져올 URL | GitHub main branch |
| `LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS` | 로컬 config만 사용하려면 `True`로 설정 | `False` |

## 동작 방식

1. **초기 로드:** 시작 시 LiteLLM은 원격 URL 또는 설정된 로컬 파일에서 beta headers 구성을 로드합니다.
2. **캐싱:** 모든 요청마다 반복해서 가져오지 않도록 구성이 메모리에 캐시됩니다.
3. **예약된 Reload:** 설정된 경우 프록시는 10초마다 일정에 따라 reload할 시점인지 확인합니다.
4. **수동 Reload:** API 엔드포인트를 통해 즉시 reload를 트리거할 수 있습니다.
5. **Multi-Pod 지원:** multi-pod 배포에서는 모든 pod가 동기화 상태를 유지하도록 reload 구성이 데이터베이스에 저장됩니다.

## 이점

- **재시작 불필요:** 다운타임 없이 새로운 Anthropic beta 기능 지원을 추가합니다.
- **제공자 호환성:** Bedrock, Vertex AI, Azure AI 등의 업데이트된 매핑을 자동으로 가져옵니다.
- **성능:** 설정은 캐시되고 필요할 때만 reload됩니다.
- **안정성:** 원격 가져오기에 실패하면 로컬 구성으로 fallback합니다.

## 관련 문서

- [Model Cost Map Sync](./sync_models_github.md) - 모델 가격 데이터 자동 동기화
- [Anthropic Beta Headers](../providers/anthropic.md) - Anthropic beta 기능 사용
