# ✨ 팀의 모델 추가 허용

:::info

이 기능은 엔터프라이즈 기능입니다.
[엔터프라이즈 가격](https://www.litellm.ai/#pricing)

[무료 체험을 받으려면 여기로 문의하세요](https://enterprise.litellm.ai/demo)

:::

팀이 해당 프로젝트에 자체 모델/키를 추가할 수 있게 합니다. 그러면 팀이 수행하는 모든 OpenAI 호출은 팀의 OpenAI 키를 사용합니다.

자체 파인튜닝 모델을 호출하려는 팀에 유용합니다.

## `/model/add` 엔드포인트에 Team ID 지정


```bash
curl -L -X POST 'http://0.0.0.0:4000/model/new' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \ # 👈 Team API Key (has same 'team_id' as below)
-H 'Content-Type: application/json' \
-d '{
  "model_name": "my-team-model", # 👈 Call LiteLLM with this model name
  "litellm_params": {
    "model": "openai/gpt-4o",
    "custom_llm_provider": "openai",
    "api_key": "******ccb07",
    "api_base": "https://my-azure-endpoint.openai.azure.com",
    "api_version": "2023-12-01-preview"
  },
  "model_info": {
    "team_id": "e59e2671-a064-436a-a0fa-16ae96e5a0a1" # 👈 Specify the team ID it belongs to
  }
}'

```

## 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \ # 👈 Team API Key
-d '{
  "model": "my-team-model", # 👈 team model name
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in Boston today?"
    }
  ]
}'

```

## 디버깅

### 'model_name'을 찾을 수 없음

팀 테이블에 모델 별칭이 있는지 확인합니다.

```bash
curl -L -X GET 'http://localhost:4000/team/info?team_id=e59e2671-a064-436a-a0fa-16ae96e5a0a1' \
-H 'Authorization: Bearer sk-******2ql3-sm28WU0tTAmA' \
```

**예상 응답:**

```json
{
    {
    "team_id": "e59e2671-a064-436a-a0fa-16ae96e5a0a1",
    "team_info": {
        ...,
        "litellm_model_table": {
            "model_aliases": {
                "my-team-model": # 👈 public model name "model_name_e59e2671-a064-436a-a0fa-16ae96e5a0a1_e81c9286-2195-4bd9-81e1-cf393788a1a0" 👈 internally generated model name (used to ensure uniqueness)
            },
            "created_by": "default_user_id",
            "updated_by": "default_user_id"
        }
    },
}
```
