# Post-Call Rules

LLM API 호출의 출력에 따라 요청을 실패 처리하려면 이 기능을 사용하세요.

## 빠른 시작

### Step 1: 파일 생성(예: `post_call_rules.py`) {#step-1-create-a-file-eg-post_call_rulespy}

```python
def my_custom_rule(input): # receives the model response 
    if len(input) < 5: 
      return {
            "decision": False,
            "message": "This violates LiteLLM Proxy Rules. Response too short"
      }
    return {"decision": True}   # message not required since, request will pass
```

### Step 2. Proxy에서 해당 파일 지정 {#step-2-point-it-to-your-proxy}

```python
litellm_settings:
  post_call_rules: post_call_rules.my_custom_rule
```

### Step 3. Proxy 시작 및 테스트 {#step-3-start--test-your-proxy}

```bash
$ litellm /path/to/config.yaml
```

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-1234' \
--data '{
  "model": "gpt-3.5-turbo",
  "messages": [{"role":"user","content":"What llm are you?"}],
  "temperature": 0.7,
  "max_tokens": 10,
}'
```
---

이제 응답 길이가 `len 5`보다 큰지 확인하고, 규칙을 통과하지 못하면 최종 실패 전에 호출을 3회 재시도합니다.

### 규칙 실패 응답 {#response-that-fail-the-rule}

규칙 실패 시 LiteLLM Proxy가 반환하는 응답입니다.

```json
{
  "error":
    {
      "message":"This violates LiteLLM Proxy Rules. Response too short",
      "type":null,
      "param":null,
      "code":500
    }
}   
```
