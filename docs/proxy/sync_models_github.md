# 새 모델 자동 동기화 (Day-0 출시) {#auto-sync-new-model-day-0-launches}

서비스를 다시 시작하지 않고도 모델 가격 및 컨텍스트 창 데이터를 자동으로 최신 상태로 유지합니다. **이를 통해 서비스를 재시작하지 않고 새 모델에 대한 day-0 지원을 추가할 수 있습니다.**

## 개요

OpenAI 또는 Anthropic 같은 제공자가 새 모델(예: GPT-5, Claude 4)을 출시하면, 일반적으로 최신 가격 및 컨텍스트 창 데이터를 가져오기 위해 LiteLLM 서비스를 다시 시작해야 합니다.

자동 동기화를 사용하면 LiteLLM은 재시작 없이 GitHub의 [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 최신 모델 데이터를 자동으로 가져옵니다. 즉, 다음을 의미합니다.

- 새 모델이 출시될 때 **다운타임 없음**
- 비용 추적 및 예산 관리를 위한 **항상 정확한 가격 정보**
- 한 번 설정하면 계속 동작하는 **자동 업데이트**

<iframe width="840" height="500" src="https://www.loom.com/embed/ba41acc1882d41b284bbddbb0e9c27ce?sid=bdae351e-2026-4e39-932b-fcb185ff612c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<br/>
<br/>

## 빠른 시작

**수동 동기화:**
```bash
curl -X POST "https://your-proxy-url/reload/model_cost_map" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**6시간마다 자동 동기화:**
```bash
curl -X POST "https://your-proxy-url/schedule/model_cost_map_reload?hours=6" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## API 엔드포인트 {#api-endpoints}

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reload/model_cost_map` | POST | 수동 동기화 |
| `/schedule/model_cost_map_reload?hours={hours}` | POST | 주기적 동기화 예약 |
| `/schedule/model_cost_map_reload` | DELETE | 예약된 동기화 취소 |
| `/schedule/model_cost_map_reload/status` | GET | 동기화 상태 확인 |

**인증:** admin role 또는 master key가 필요합니다.

## Python 예제

```python
import requests

def sync_models(proxy_url, admin_token):
    response = requests.post(
        f"{proxy_url}/reload/model_cost_map",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()

# Usage
result = sync_models("https://your-proxy-url", "your-admin-token")
print(result['message'])
```

## 설정

**사용자 지정 model cost map URL:**
```bash
export LITELLM_MODEL_COST_MAP_URL="https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json"
```

**로컬 model cost map 사용:**
```bash
export LITELLM_LOCAL_MODEL_COST_MAP=True
```
