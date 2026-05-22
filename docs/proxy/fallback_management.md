# [신규] Fallback 관리 엔드포인트

일반 설정과 분리해 모델 fallback을 관리하기 위한 전용 엔드포인트입니다.

## 개요

이 엔드포인트를 사용하면 전체 프록시 설정을 수정하지 않고 fallback 모델을 구성, 조회, 삭제할 수 있습니다. `/config/update` 엔드포인트를 사용하는 방식보다 더 명확하고 안전하게 fallback을 관리할 수 있습니다.

## 사전 준비

- 데이터베이스 저장소가 활성화되어 있어야 합니다. 환경에 `STORE_MODEL_IN_DB=True`를 설정하세요.
- fallback을 구성하기 전에 모델이 router에 존재해야 합니다.

## 엔드포인트

### POST /fallback

특정 모델의 fallback을 생성하거나 업데이트합니다.

**요청 본문:**
```json
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4", "claude-3-haiku"],
  "fallback_type": "general"
}
```

**파라미터:**
- `model` (string, required): fallback을 구성할 기본 모델 이름
- `fallback_models` (문자열 배열, 필수): 우선순위 순서의 fallback 모델 이름 목록
- `fallback_type` (string, optional): fallback 유형. 옵션:
  - `"general"` (기본값): 모든 오류에 대한 표준 fallback
  - `"context_window"`: context window 초과 오류용 fallback
  - `"content_policy"`: 콘텐츠 정책 위반용 fallback

**응답:**
```json
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4", "claude-3-haiku"],
  "fallback_type": "general",
  "message": "Fallback configuration created successfully"
}
```

**cURL 사용 예제:**
```bash
curl -X POST "http://localhost:4000/fallback" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "fallback_models": ["gpt-4", "claude-3-haiku"],
    "fallback_type": "general"
  }'
```

**Python 사용 예제:**
```python
import requests

response = requests.post(
    "http://localhost:4000/fallback",
    headers={
        "Authorization": "Bearer sk-1234",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-3.5-turbo",
        "fallback_models": ["gpt-4", "claude-3-haiku"],
        "fallback_type": "general"
    }
)

print(response.json())
```

### GET /fallback/\{model\}

특정 모델의 fallback 구성을 가져옵니다.

**파라미터:**
- `model` (path parameter, required): fallback을 가져올 모델 이름
- `fallback_type` (query parameter, optional): 조회할 fallback 유형(기본값: "general")

**응답:**
```json
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4", "claude-3-haiku"],
  "fallback_type": "general"
}
```

**cURL 사용 예제:**
```bash
curl -X GET "http://localhost:4000/fallback/gpt-3.5-turbo?fallback_type=general" \
  -H "Authorization: Bearer sk-1234"
```

**Python 사용 예제:**
```python
import requests

response = requests.get(
    "http://localhost:4000/fallback/gpt-3.5-turbo",
    headers={"Authorization": "Bearer sk-1234"},
    params={"fallback_type": "general"}
)

print(response.json())
```

### DELETE /fallback/\{model\}

특정 모델의 fallback 구성을 삭제합니다.

**파라미터:**
- `model` (path parameter, required): fallback을 삭제할 모델 이름
- `fallback_type` (query parameter, optional): 삭제할 fallback 유형(기본값: "general")

**응답:**
```json
{
  "model": "gpt-3.5-turbo",
  "fallback_type": "general",
  "message": "Fallback configuration deleted successfully"
}
```

**cURL 사용 예제:**
```bash
curl -X DELETE "http://localhost:4000/fallback/gpt-3.5-turbo?fallback_type=general" \
  -H "Authorization: Bearer sk-1234"
```

**Python 사용 예제:**
```python
import requests

response = requests.delete(
    "http://localhost:4000/fallback/gpt-3.5-turbo",
    headers={"Authorization": "Bearer sk-1234"},
    params={"fallback_type": "general"}
)

print(response.json())
```

### fallback 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_fallbacks": true
}
'
```



## 검증

엔드포인트는 다음 검증을 수행합니다.

1. **모델 존재 여부**: 기본 모델이 router에 존재하는지 확인합니다.
2. **Fallback 모델 존재 여부**: 모든 fallback 모델이 router에 존재하는지 확인합니다.
3. **자기 자신으로 fallback 금지**: 모델이 자기 자신을 fallback으로 사용하지 못하게 합니다.
4. **중복 금지**: fallback 목록에 중복 모델이 없는지 확인합니다.
5. **데이터베이스 활성화**: `STORE_MODEL_IN_DB=True` 설정이 필요합니다.

## 오류 응답

### 400 Bad Request
```json
{
  "detail": {
    "error": "Invalid fallback models: ['non-existent-model']",
    "available_models": ["gpt-3.5-turbo", "gpt-4", "claude-3-haiku"]
  }
}
```

### 404 Not Found
```json
{
  "detail": {
    "error": "Model 'gpt-3.5-turbo' not found in router",
    "available_models": ["gpt-4", "claude-3-haiku"]
  }
}
```

### 500 내부 서버 오류
```json
{
  "detail": {
    "error": "Router not initialized"
  }
}
```

## Fallback 유형 설명

### General Fallback
모델 호출 중 발생하는 모든 유형의 오류에 사용됩니다. 가장 일반적인 fallback 유형입니다.

**사용 사례:** 모델을 사용할 수 없거나, rate limit에 걸렸거나, 오류를 반환하는 경우.

```json
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4", "claude-3-haiku"],
  "fallback_type": "general"
}
```

### 컨텍스트 윈도 Fallback
context window 초과 오류가 발생했을 때만 트리거됩니다.

**사용 사례:** 입력이 기본 모델에 비해 너무 길 때 더 큰 context window를 가진 모델로 fallback합니다.

```json
{
  "model": "gpt-3.5-turbo",
  "fallback_models": ["gpt-4-32k", "claude-3-opus"],
  "fallback_type": "context_window"
}
```

### 콘텐츠 정책 Fallback
콘텐츠 정책 위반이 발생했을 때만 트리거됩니다.

**사용 사례:** 기본 모델이 안전 필터 때문에 콘텐츠를 거부하면 다른 콘텐츠 정책을 가진 모델로 fallback합니다.

```json
{
  "model": "gpt-4",
  "fallback_models": ["claude-3-haiku"],
  "fallback_type": "content_policy"
}
```

## /config/update 대비 장점

1. **안전성**: fallback 구성만 수정하므로 다른 설정을 실수로 바꾸지 않습니다.
2. **단순성**: 명확한 검증 메시지를 제공하는 목적 중심 API입니다.
3. **세분성**: 모델별, 유형별로 fallback을 관리합니다.
4. **검증**: 적용 전에 포괄적인 검사로 구성이 유효한지 확인합니다.
5. **명확성**: 사용 가능한 모델 목록을 포함한 명확한 오류 메시지를 제공합니다.

## 참고

- 구성된 재시도 횟수가 모두 실패한 뒤 fallback이 트리거됩니다.
- fallback은 `fallback_models`에 지정된 순서대로 시도됩니다.
- 시도할 최대 fallback 수는 router의 `max_fallbacks` 설정으로 제어됩니다.
- 변경 사항은 즉시 적용되며 데이터베이스에 저장됩니다.
