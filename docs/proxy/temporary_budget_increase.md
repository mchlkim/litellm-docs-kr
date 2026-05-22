# ✨ 임시 예산 증액 {#temporary-budget-increase}

LiteLLM Virtual Key에 임시 예산 증액을 설정합니다. 특정 키의 예산을 일시적으로 늘려야 할 때 사용하세요.


| 계층 | 지원 여부 | 
|-----------|-----------|
| `LiteLLM Virtual Key` | ✅ |
| 사용자 | ❌ |
| 팀 | ❌ |
| 조직 | ❌ |

:::note

✨ 임시 예산 증액은 LiteLLM Enterprise 기능입니다.

[Enterprise 가격](https://www.litellm.ai/#pricing)

[무료 7일 평가판 키 받기](https://www.litellm.ai/enterprise#trial)

:::


1. 예산이 설정된 LiteLLM Virtual Key 만들기

```bash
curl -L -X POST 'http://localhost:4000/key/generate' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-d '{
    "max_budget": 0.0000001
}'
```

예상 응답:

```json
{
    "key": "sk-your-new-key"
}
```

2. 임시 예산 증액으로 키 업데이트하기

```bash
curl -L -X POST 'http://localhost:4000/key/update' \
-H 'Authorization: Bearer LITELLM_MASTER_KEY' \
-H 'Content-Type: application/json' \
-d '{
    "key": "sk-your-new-key",
    "temp_budget_increase": 100, 
    "temp_budget_expiry": "2025-01-15"
}'
```

3. 테스트하기

```bash
curl -L -X POST 'http://localhost:4000/chat/completions' \
-H 'Authorization: Bearer sk-your-new-key' \
-H 'Content-Type: application/json' \
-d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello, world!"}]
}'
```

예상 응답 헤더:

```
x-litellm-key-max-budget: 100.0000001
```
