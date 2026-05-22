# LiteLLM Proxy CLI

`litellm-proxy` CLI는 LiteLLM proxy server를 관리하기 위한 command-line 도구입니다.
모델, 자격 증명, API 키, 사용자 등을 관리하는 명령과 proxy server로 chat 및 HTTP 요청을 보내는 명령을 제공합니다.

| 기능                | 수행할 수 있는 작업                                 |
|------------------------|-------------------------------------------------|
| 모델 관리      | 모델을 나열, 추가, 업데이트, 삭제합니다.            |
| 자격 증명 관리 | Provider 자격 증명을 관리합니다.                     |
| 키 관리        | API 키를 생성, 나열, 삭제합니다.             |
| 사용자 관리        | 사용자를 생성, 나열, 삭제합니다.                  |
| Chat Completions       | chat completions를 실행합니다.                            |
| HTTP 요청          | proxy server로 사용자 지정 HTTP 요청을 보냅니다.   |

## 빠른 시작

1. **CLI 설치**

   [uv](https://github.com/astral-sh/uv)가 설치되어 있다면 다음을 시도할 수 있습니다.

   ```shell
   uv tool install 'litellm[proxy]'
   ```

   정상 동작하면 다음과 비슷한 출력이 표시됩니다.

   ```shell
   ...
   Installed 2 executables: litellm, litellm-proxy
   ```

   이제 터미널에서 `litellm-proxy`만 입력해 도구를 사용할 수 있습니다.

   ```shell
   litellm-proxy
   ```

2. **환경 변수 설정**

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   export LITELLM_PROXY_API_KEY=sk-your-key
   ```

   *(실제 proxy URL과 API 키로 바꾸세요.)*

3. **첫 요청 실행(모델 목록 조회)**

   ```bash
   litellm-proxy models list
   ```

   CLI가 올바르게 설정되어 있으면 사용 가능한 모델 목록이나 표 형식 출력이 표시됩니다.

4. **문제 해결**

   - 오류가 표시되면 환경 변수와 proxy server 상태를 확인하세요.

## CLI로 인증

CLI를 사용해 LiteLLM Gateway에 인증할 수 있습니다. 많은 개발자에게 LiteLLM Gateway 셀프서비스 접근 권한을 제공하려는 경우에 유용합니다.

:::info

자세한 가이드는 [CLI 인증](./cli_sso)을 참고하세요.

:::

### 사전 준비

:::warning[Beta Feature - 필수 환경 변수]

CLI SSO 인증은 현재 beta입니다. **LiteLLM Proxy를 시작할 때** 이 환경 변수를 설정해야 합니다.

```bash
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

또는 proxy 시작 명령에 추가하세요.

```bash
EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

:::

### 단계

1. **proxy URL 설정**

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   ```

   *(실제 proxy URL로 바꾸세요.)*

2. **로그인**

   ```bash
   litellm-proxy login
   ```

   인증을 위해 브라우저 창이 열립니다. LiteLLM Proxy를 SSO provider에 연결했다면 SSO 자격 증명으로 로그인할 수 있습니다. 로그인 후 CLI로 LiteLLM Gateway에 요청을 보낼 수 있습니다.

3. **인증 테스트**

   ```bash
   litellm-proxy models list
   ```

   이 명령은 사용자에게 허용된 모든 모델을 나열합니다.

## 주요 명령

### 모델 관리

- proxy의 모델을 나열, 추가, 업데이트, 조회, 삭제합니다.
- 예제:

  ```bash
  litellm-proxy models list
  litellm-proxy models add gpt-4 \
    --param api_key=sk-123 \
    --param max_tokens=2048
  litellm-proxy models update <model-id> -p temperature=0.7
  litellm-proxy models delete <model-id>
  ```

  [사용 API(OpenAPI)](https://litellm-api.up.railway.app/#/model%20management)

### 자격 증명 관리

- LLM provider의 자격 증명을 나열, 생성, 조회, 삭제합니다.
- 예제:

  ```bash
  litellm-proxy credentials list
  litellm-proxy credentials create azure-prod \
    --info='{"custom_llm_provider": "azure"}' \
    --values='{"api_key": "sk-123", "api_base": "https://prod.azure.openai.com"}'
  litellm-proxy credentials get azure-cred
  litellm-proxy credentials delete azure-cred
  ```

  [사용 API(OpenAPI)](https://litellm-api.up.railway.app/#/credential%20management)

### 키 관리

- API 키를 나열, 생성, 정보 조회, 삭제합니다.
- 예제:

  ```bash
  litellm-proxy keys list
  litellm-proxy keys generate \
    --models=gpt-4 \
    --spend=100 \
    --duration=24h \
    --key-alias=my-key
  litellm-proxy keys info --key sk-key1
  litellm-proxy keys delete --keys sk-key1,sk-key2 --key-aliases alias1,alias2
  ```

  [사용 API(OpenAPI)](https://litellm-api.up.railway.app/#/key%20management)

### 사용자 관리

- 사용자를 나열, 생성, 정보 조회, 삭제합니다.
- 예제:

  ```bash
  litellm-proxy users list
  litellm-proxy users create \
    --email=user@example.com \
    --role=internal_user \
    --alias="Alice" \
    --team=team1 \
    --max-budget=100.0
  litellm-proxy users get --id <user-id>
  litellm-proxy users delete <user-id>
  ```

  [사용 API(OpenAPI)](https://litellm-api.up.railway.app/#/Internal%20User%20management)

### Chat Completions

- proxy server에 chat completions를 요청합니다.
- 예제:

  ```bash
  litellm-proxy chat completions gpt-4 -m "user:Hello, how are you?"
  ```

  [사용 API(OpenAPI)](https://litellm-api.up.railway.app/#/chat%2Fcompletions)

### 일반 HTTP 요청

- proxy server로 직접 HTTP 요청을 보냅니다.
- 예제:

  ```bash
  litellm-proxy http request \
    POST /chat/completions \
    --json '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}'
  ```

  [전체 API(OpenAPI)](https://litellm-api.up.railway.app/#/)

## 환경 변수

- `LITELLM_PROXY_URL`: proxy server의 Base URL
- `LITELLM_PROXY_API_KEY`: 인증용 API 키

## 예제

1. **모든 모델 나열:**

   ```bash
   litellm-proxy models list
   ```

2. **새 모델 추가:**

   ```bash
   litellm-proxy models add gpt-4 \
     --param api_key=sk-123 \
     --param max_tokens=2048
   ```

3. **자격 증명 생성:**

   ```bash
   litellm-proxy credentials create azure-prod \
     --info='{"custom_llm_provider": "azure"}' \
     --values='{"api_key": "sk-123", "api_base": "https://prod.azure.openai.com"}'
   ```

4. **API 키 생성:**

   ```bash
   litellm-proxy keys generate \
     --models=gpt-4 \
     --spend=100 \
     --duration=24h \
     --key-alias=my-key
   ```

5. **Chat completion:**

   ```bash
   litellm-proxy chat completions gpt-4 \
     -m "user:Write a story"
   ```

6. **사용자 지정 HTTP 요청:**

   ```bash
   litellm-proxy http request \
     POST /chat/completions \
     --json '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}'
   ```

## 오류 처리

CLI는 다음 상황에서 오류 메시지를 표시합니다.

- server에 접근할 수 없음
- 인증 실패
- 잘못된 파라미터 또는 JSON
- 존재하지 않는 모델/자격 증명
- 기타 작업 실패

자세한 디버깅 출력을 보려면 `--debug` 플래그를 사용하세요.

전체 명령 reference와 고급 사용법은 [CLI README](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/client/cli/README.md)를 참고하세요.
