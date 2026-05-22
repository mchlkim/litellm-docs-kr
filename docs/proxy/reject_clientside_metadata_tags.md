# 클라이언트 측 metadata.tags 거부

## 개요

`reject_clientside_metadata_tags` 설정을 사용하면 사용자가 API 요청에서 클라이언트 측 `metadata.tags`를 전달하지 못하게 할 수 있습니다. 이를 통해 태그가 API 키 metadata에서만 상속되도록 보장하고, 사용자가 예산 추적 또는 라우팅 결정에 영향을 줄 수 있도록 태그를 재정의하는 것을 방지할 수 있습니다.

## 사용 사례

이 기능은 다음과 같은 멀티 테넌트 시나리오에서 특히 유용합니다.
- API 키 태그를 기준으로 엄격한 예산 추적을 강제하려는 경우
- 사용자가 사용자 지정 클라이언트 측 태그를 보내 라우팅 결정을 조작하지 못하게 하려는 경우
- 일관된 태그 기반 필터링 및 보고를 보장해야 하는 경우

## 설정

`config.yaml`에 다음 내용을 추가합니다.

```yaml
general_settings:
  reject_clientside_metadata_tags: true  # Default is false/null
```

## 동작

### `reject_clientside_metadata_tags: true`인 경우

**거부되는 요청 예제:**
```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "tags": ["custom-tag"]  # This will be rejected
    }
  }'
```

**오류 응답:**
```json
{
  "error": {
    "message": "Client-side 'metadata.tags' not allowed in request. 'reject_clientside_metadata_tags'=True. Tags can only be set via API key metadata.",
    "type": "bad_request_error",
    "param": "metadata.tags",
    "code": 400
  }
}
```

**허용되는 요청 예제:**
```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {
      "custom_field": "value"  # Other metadata fields are allowed
    }
  }'
```

### `reject_clientside_metadata_tags: false`이거나 설정하지 않은 경우

클라이언트 측 `metadata.tags`가 포함된 요청을 포함하여 모든 요청이 허용됩니다.

## API 키로 태그 설정

`reject_clientside_metadata_tags`가 활성화된 경우 태그는 API 키 metadata에 설정해야 합니다.

```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer sk-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "tags": ["team-a", "production"]
    }
  }'
```

이 태그는 해당 API 키로 수행되는 모든 요청에 자동으로 상속됩니다.

## 전체 예제 설정

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: sk-1234
  database_url: "postgresql://user:password@localhost:5432/litellm"
  
  # Reject client-side tags
  reject_clientside_metadata_tags: true
  
  # Optional: Also enforce user parameter
  enforce_user_param: true
```

## 유사 기능

- `enforce_user_param` - 모든 요청에 'user' 파라미터가 포함되도록 요구합니다.
- 태그 기반 라우팅 - 지능형 요청 라우팅에 태그를 사용합니다.
- 예산 추적 - 태그별 지출을 추적합니다.

## 참고

- 이 검사는 LLM API 라우트(예: `/chat/completions`, `/embeddings`)에만 적용됩니다.
- 관리 엔드포인트(예: `/key/generate`)는 영향을 받지 않습니다.
- 이 검사는 요청 본문에 클라이언트 측 `metadata.tags`가 없는지 확인합니다.
- 다른 metadata 필드는 계속 요청에 전달할 수 있습니다.
- API 키에 설정된 태그는 계속 모든 요청에 적용됩니다.
