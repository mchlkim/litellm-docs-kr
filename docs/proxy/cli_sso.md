# CLI 인증

litellm CLI를 사용해 LiteLLM Gateway에 인증합니다. 많은 개발자에게 LiteLLM Gateway 셀프서비스 접근 권한을 제공하려는 경우 유용합니다.


## 데모

<iframe width="840" height="500" src="https://www.loom.com/embed/87c5d243cde642ff942783024ff037e3" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 사용법 

### 사전 준비 - 베타 플래그로 LiteLLM Proxy 시작

:::warning[베타 기능 - 필수]

CLI SSO 인증은 현재 베타 상태입니다. **LiteLLM Proxy를 시작할 때** 이 환경 변수를 설정해야 합니다.

```bash
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

또는 프록시 시작 명령에 추가합니다.

```bash
EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

:::

### 설정

#### JWT 토큰 만료

기본적으로 CLI 인증 토큰은 **24시간** 후 만료됩니다. LiteLLM Proxy를 시작할 때 `LITELLM_CLI_JWT_EXPIRATION_HOURS` 환경 변수를 설정해 이 만료 시간을 사용자 지정할 수 있습니다.

```bash
# Set CLI JWT tokens to expire after 48 hours
export LITELLM_CLI_JWT_EXPIRATION_HOURS=48
export EXPERIMENTAL_UI_LOGIN="True"
litellm --config config.yaml
```

또는 단일 명령으로 실행할 수 있습니다.

```bash
LITELLM_CLI_JWT_EXPIRATION_HOURS=48 EXPERIMENTAL_UI_LOGIN="True" litellm --config config.yaml
```

**예제:**
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=12` - 토큰이 12시간 후 만료됩니다.
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=168` - 토큰이 7일(168시간) 후 만료됩니다.
- `LITELLM_CLI_JWT_EXPIRATION_HOURS=720` - 토큰이 30일(720시간) 후 만료됩니다.

:::note[실험적 UI 세션]
`EXPERIMENTAL_UI_LOGIN`이 활성화되면 **브라우저 UI 로그인** 세션은 고정된 10분 만료 시간(설정 불가)을 사용합니다. `LITELLM_UI_SESSION_DURATION`은 비실험 플로우에만 적용됩니다.
:::

:::tip
현재 토큰의 사용 시간과 만료 상태는 다음 명령으로 확인할 수 있습니다.
```bash
litellm-proxy whoami
```
:::

### 단계

1. **CLI 설치**

   [uv](https://github.com/astral-sh/uv)가 설치되어 있다면 다음을 시도할 수 있습니다.

   ```shell
   uv tool install 'litellm[proxy]'
   ```

   정상적으로 실행되면 다음과 비슷한 출력이 표시됩니다.

   ```shell
   ...
   Installed 2 executables: litellm, litellm-proxy
   ```

   이제 터미널에서 `litellm-proxy`를 입력해 도구를 사용할 수 있습니다.

   ```shell
   litellm-proxy
   ```

2. **환경 변수 설정**

   로컬 머신에서 프록시 URL을 설정합니다.

   ```bash
   export LITELLM_PROXY_URL=http://localhost:4000
   ```

   *(실제 프록시 URL로 바꾸세요)*

3. **로그인**

   ```shell
   litellm-proxy login
   ```

   인증을 위해 브라우저 창이 열립니다. LiteLLM Proxy를 SSO 공급자에 연결했다면 SSO 자격 증명으로 로그인할 수 있습니다. 로그인 후에는 CLI를 사용해 LiteLLM Gateway로 요청을 보낼 수 있습니다.

4. **모델 조회 테스트 요청 실행**

   ```shell
   litellm-proxy models list
   ```

   사용할 수 있는 모든 모델이 나열됩니다.
