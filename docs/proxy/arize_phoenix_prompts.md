# Arize Phoenix 프롬프트 관리 {#arize-phoenix-prompt-management}

[Arize Phoenix](https://phoenix.arize.com/)의 프롬프트 버전을 LiteLLM SDK 및 Proxy와 함께 사용합니다.

## 빠른 시작

### SDK

```python
import litellm

response = litellm.completion(
    model="gpt-4o",
    prompt_id="UHJvbXB0VmVyc2lvbjox",
    prompt_integration="arize_phoenix",
    api_key="your-arize-phoenix-token",
    api_base="https://app.phoenix.arize.com/s/your-workspace",
    prompt_variables={"question": "What is AI?"},
)
```

### Proxy

**1. config에 프롬프트 추가**

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_id: "UHJvbXB0VmVyc2lvbjox"
      prompt_integration: "arize_phoenix"
      api_base: https://app.phoenix.arize.com/s/your-workspace
      api_key: os.environ/PHOENIX_API_KEY
      ignore_prompt_manager_model: true # optional: use model from config instead
      ignore_prompt_manager_optional_params: true # optional: ignore temp, max_tokens from prompt
```

**2. 요청 보내기**

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-3.5-turbo",
    "prompt_id": "simple_prompt",
    "prompt_variables": {
      "question": "Explain quantum computing"
    }
  }'
```

## 설정

### Arize Phoenix 인증 정보 가져오기 {#get-arize-phoenix-credentials}

1. **API Token**: [Arize Phoenix Settings](https://app.phoenix.arize.com/)에서 가져옵니다.
2. **Workspace URL**: `https://app.phoenix.arize.com/s/{your-workspace}`
3. **Prompt ID**: 프롬프트 버전 URL에서 확인합니다.

**환경 변수 설정**:
```bash
export PHOENIX_API_KEY="your-token"
```

### SDK + PROXY 옵션 {#sdk--proxy-options}

| 매개변수 | 필수 여부 | 설명 |
|-----------|----------|-------------|
| `prompt_id` | 예 | Arize Phoenix 프롬프트 버전 ID |
| `prompt_integration` | 예 | `"arize_phoenix"`로 설정합니다. |
| `api_base` | 예 | Workspace URL |
| `api_key` | 예 | 액세스 토큰 |
| `prompt_variables` | 아니요 | 템플릿에 사용할 변수 |

### Proxy 전용 옵션 {#proxy-only-options}

| 매개변수 | 설명 |
|-----------|-------------|
| `ignore_prompt_manager_model` | 프롬프트의 모델 대신 config 모델을 사용합니다. |
| `ignore_prompt_manager_optional_params` | 프롬프트의 temperature, max_tokens를 무시합니다. |

## 변수 템플릿 {#variable-templates}

Arize Phoenix는 Mustache/Handlebars 문법을 사용합니다.

```python
# Template: "Hello {{name}}, question: {{question}}"
prompt_variables = {
    "name": "Alice",
    "question": "What is ML?"
}
# Result: "Hello Alice, question: What is ML?"
```


## 추가 메시지와 함께 사용 {#combine-with-additional-messages}

```python
response = litellm.completion(
    model="gpt-4o",
    prompt_id="UHJvbXB0VmVyc2lvbjox",
    prompt_integration="arize_phoenix",
    api_base="https://app.phoenix.arize.com/s/your-workspace",
    prompt_variables={"question": "Explain AI"},
    messages=[
        {"role": "user", "content": "Keep it under 50 words"}
    ]
)
```


## 오류 처리 {#error-handling}

```python
try:
    response = litellm.completion(
        model="gpt-4o",
        prompt_id="invalid-id",
        prompt_integration="arize_phoenix",
        api_base="https://app.phoenix.arize.com/s/workspace"
    )
except Exception as e:
    print(f"Error: {e}")
    # 404: Prompt not found
    # 401: Invalid credentials
    # 403: Access denied
```

## 지원 {#support}

- [LiteLLM GitHub Issues](https://github.com/BerriAI/litellm/issues)
- [Arize Phoenix 문서](https://docs.arize.com/phoenix)
