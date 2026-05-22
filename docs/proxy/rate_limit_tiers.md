# ✨ 예산 / 속도 제한 티어

속도 제한이 있는 티어를 정의하고 키에 할당합니다.

여러 키의 액세스와 예산을 제어할 때 사용합니다.

:::info 

이 기능은 LiteLLM 엔터프라이즈 기능입니다.

[여기](https://litellm.ai/#trial)에서 7일 무료 체험을 시작하고 문의할 수 있습니다.

가격은 [여기](https://litellm.ai/#pricing)에서 확인하세요.

:::


## 1. 예산 생성

```bash
curl -L -X POST 'http://0.0.0.0:4000/budget/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "budget_id": "my-test-tier",
    "rpm_limit": 0
}'
```

## 2. 키에 예산 할당

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "budget_id": "my-test-tier"
}'
```

예상 응답:

```json
{
    "key": "sk-...",
    "budget_id": "my-test-tier",
    "litellm_budget_table": {
        "budget_id": "my-test-tier",
        "rpm_limit": 0
    }
}
```

## 3. 키에 예산이 적용되는지 확인

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-...' \ # 👈 KEY from step 2.
-d '{
    "model": "<REPLACE_WITH_MODEL_NAME_FROM_CONFIG.YAML>",
    "messages": [
      {"role": "user", "content": "hi my email is ishaan"}
    ]
}'
```


## [API 참조](https://litellm-api.up.railway.app/#/budget%20management)
