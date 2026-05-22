# [BETA] 공개 팀

사용자가 가입할 때 참여할 수 있는 팀을 노출합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/7871ea15035a48d2a118b7486c2f7598?sid=267cd0ab-d92b-42fa-b97a-9f385ef8930c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>


## 빠른 시작

1. LiteLLM에서 팀 생성

```bash
curl -X POST '<PROXY_BASE_URL>/team/new' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <MASTER_KEY>' \
-d '{"name": "My Team", "team_id": "team_id_1"}'
```

2. 사용자에게 팀 노출

```yaml
litellm_settings:
    default_internal_user_params:
        available_teams: ["team_id_1"] # 👈 Make team available to new SSO users
```

3. 테스트합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/team/member_add' \
-H 'Authorization: Bearer sk-<USER_KEY>' \
-H 'Content-Type: application/json' \
--data-raw '{
    "team_id": "team_id_1", 
    "member": [{"role": "user", "user_id": "my-test-user"}]
}'
```


