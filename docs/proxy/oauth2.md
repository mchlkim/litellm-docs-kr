# Oauth 2.0 인증

Oauth2.0 토큰으로 LiteLLM Proxy에 `/chat`, `/embeddings` 요청을 보내려면 이 설정을 사용합니다.

:::info

이 기능은 엔터프라이즈 기능입니다. 이 기능이 요구 사항에 맞는지 무료 평가판으로 확인하려면 [문의하세요](https://enterprise.litellm.ai/demo).

:::

## 사용법 

1. 환경 변수를 설정합니다.

```bash
export OAUTH_TOKEN_INFO_ENDPOINT="https://your-provider.com/token/info"
export OAUTH_USER_ID_FIELD_NAME="sub"
export OAUTH_USER_ROLE_FIELD_NAME="role"
export OAUTH_USER_TEAM_ID_FIELD_NAME="team_id"
```

- `OAUTH_TOKEN_INFO_ENDPOINT`: OAuth 토큰을 검증할 URL입니다.
- `OAUTH_USER_ID_FIELD_NAME`: 사용자 ID가 들어 있는 token info 응답 필드입니다.
- `OAUTH_USER_ROLE_FIELD_NAME`: 사용자 역할이 들어 있는 token info 필드입니다.
- `OAUTH_USER_TEAM_ID_FIELD_NAME`: 사용자 팀 ID가 들어 있는 token info 필드입니다.

2. LiteLLM `config.yaml`에서 활성화합니다.

`config.yaml`에 다음을 설정합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

general_settings: 
  master_key: sk-1234
  enable_oauth2_auth: true
```

3. LiteLLM 요청에서 토큰을 사용합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

## 디버깅 

LiteLLM Proxy를 [`--detailed_debug` 모드로 시작하면 더 자세한 로그를 볼 수 있습니다](cli.md#detailed_debug).

## OAuth2와 JWT 함께 사용

LiteLLM은 두 가지 OAuth2 + JWT 모드를 지원합니다.

1. **전역 OAuth2 모드** (`enable_oauth2_auth: true`)  
   LLM + info 라우트에서 OAuth2 인증이 활성화됩니다.
2. **선택적 JWT override 모드** (`enable_oauth2_auth: false`)  
   `litellm_jwtauth.routing_overrides`와 일치하는 JWT 형태 토큰만 LLM + info 라우트에서 OAuth2로 라우팅됩니다.

선택적 라우팅, 즉 특정 JWT에만 OAuth2를 적용하려면 다음처럼 설정합니다.

```yaml title="config.yaml"
general_settings:
  enable_jwt_auth: true
  enable_oauth2_auth: false
  litellm_jwtauth:
    routing_overrides:
      - iss: "machine-issuer.example.com"
        client_id: "MID_LITELLM"
        path: "oauth2"
```

전체 `routing_overrides` 동작과 목록 기반 selector는 다음 문서를 참고하세요.
<a href="./token_auth.md#route-jwt-shaped-machine-tokens-to-oauth2">`/proxy/token_auth` 문서</a>
