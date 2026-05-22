# Claude Code에서 Bring Your Own Key (BYOK) 사용하기

LiteLLM 프록시를 통해 자체 Anthropic API key로 Claude Code를 사용할 수 있습니다. Anthropic 계정으로 Claude의 `/login`을 사용하면 API key가 `x-api-key`로 전송됩니다. BYOK를 활성화하면 LiteLLM은 프록시에 설정된 키 대신 사용자의 키를 Anthropic으로 전달합니다. 따라서 Anthropic에 직접 비용을 지불하면서도 LiteLLM의 라우팅, 로깅, 가드레일을 그대로 활용할 수 있습니다.

## 동작 방식

1. **Claude Code `/login`** — Anthropic 계정으로 로그인하면 Claude Code가 Anthropic API key를 `x-api-key`로 전송합니다.
2. **LiteLLM 인증** — 프록시가 사용자를 인증하고 사용량을 추적할 수 있도록 `ANTHROPIC_CUSTOM_HEADERS`를 통해 LiteLLM 프록시 키를 전달합니다.
3. **키 전달** — `forward_llm_provider_auth_headers: true`를 설정하면 LiteLLM이 사용자의 `x-api-key`를 Anthropic으로 전달하며, 이 키가 프록시에 설정된 키보다 우선합니다.

## 사전 준비

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 설치
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com)에서 발급)
- 인증용 virtual key가 있는 LiteLLM 프록시

## Step 1: LiteLLM 프록시 설정

Anthropic 키가 우선 적용되도록 LLM provider 인증 헤더 전달을 활성화합니다.

```yaml title="config.yaml"
model_list:
  - model_name: claude-sonnet-4-5
    litellm_params:
      model: anthropic/claude-sonnet-4-5
      # No api_key needed — client's key will be used

litellm_settings:
  forward_llm_provider_auth_headers: true  # Required for BYOK
```

:::info `forward_llm_provider_auth_headers`가 필요한 이유

기본적으로 LiteLLM은 보안을 위해 클라이언트 요청에서 `x-api-key`를 제거합니다. 이 값을 `true`로 설정하면 클라이언트가 제공한 provider 키(`/login`에서 받은 Anthropic 키 등)를 Anthropic으로 전달할 수 있으며, 프록시에 설정된 키보다 우선 적용됩니다.

:::

:::tip config.yaml 대신 UI에서 설정

LiteLLM admin UI에서도 이 설정을 완료할 수 있습니다.

- **모델 → Add Model**에서 모델을 추가하고 **API Key** 필드는 비워 둡니다.
- **Settings → UI Settings → "Forward LLM provider auth headers"** 토글을 활성화합니다.

두 UI 작업은 모두 데이터베이스에 저장되며 런타임에는 `config.yaml`보다 우선합니다.

:::

## Step 2: LiteLLM Virtual Key 생성

LiteLLM UI 또는 API로 virtual key를 생성합니다.
```bash
# Example: Create key via API
curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer sk-your-master-key" \
  -H "Content-Type: application/json" \
  -d '{"key_alias": "claude-code-byok", "models": ["claude-sonnet-4-5"]}'
```

## Step 3: Claude Code 설정

Claude Code가 LiteLLM을 사용하고 프록시 인증을 위해 LiteLLM 키를 전송하도록 환경 변수를 설정합니다.

```bash
# Point Claude Code to your LiteLLM proxy
export ANTHROPIC_BASE_URL="http://localhost:4000"

# Model name from your config
export ANTHROPIC_MODEL="claude-sonnet-4-5"

# LiteLLM proxy auth — this is added to every request
# Use x-litellm-api-key so the proxy authenticates you; your Anthropic key goes via x-api-key from /login
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-api-key: sk-12345"
```

`sk-12345`를 실제 LiteLLM virtual key로 바꿉니다.

:::tip 여러 헤더

여러 헤더를 사용할 때는 줄바꿈으로 구분된 값을 사용합니다.

```bash
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-api-key: sk-12345
x-litellm-user-id: my-user-id"
```

:::

## Step 4: Claude Code로 로그인

1. Claude Code를 실행합니다.

   ```bash
   claude
   ```

2. **`/login`**을 사용해 Anthropic 계정으로 로그인합니다. 또는 API key를 직접 사용합니다.

3. Claude Code는 다음을 전송합니다.
   - `x-api-key`: 사용자의 Anthropic API key (`/login`에서 전달)
   - `x-litellm-api-key`: 사용자의 LiteLLM 키 (`ANTHROPIC_CUSTOM_HEADERS`에서 전달)

4. LiteLLM은 `x-litellm-api-key`로 사용자를 인증한 다음 `x-api-key`를 Anthropic으로 전달합니다. 사용자의 Anthropic 키는 프록시에 설정된 어떤 키보다 우선합니다.

## 요약

| 헤더 | 출처 | 목적 |
|--------|--------|---------|
| `x-api-key` | Claude Code `/login` (Anthropic key) | API 호출을 위해 Anthropic으로 전송 |
| `x-litellm-api-key` | `ANTHROPIC_CUSTOM_HEADERS` | 프록시 인증, 추적, rate limit |

## 문제 해결

### "invalid x-api-key"로 요청 실패

- `litellm_settings` 또는 `general_settings`에 `forward_llm_provider_auth_headers: true`가 설정되어 있는지 확인합니다.
- 설정을 변경한 뒤 LiteLLM 프록시를 다시 시작합니다.
- Anthropic 키가 전송되도록 Claude Code에서 `/login`을 완료했는지 확인합니다.

### 프록시가 401을 반환

- `ANTHROPIC_CUSTOM_HEADERS`에 `x-litellm-api-key: <your-key>`가 포함되어 있는지 확인합니다.
- LiteLLM 키가 유효하고 해당 모델에 접근할 수 있는지 확인합니다.

### 내 Anthropic 키 대신 프록시 키가 사용됨

- 설정에 `forward_llm_provider_auth_headers: true`가 있는지 확인합니다.
- 설정 구조에 따라 이 값은 `litellm_settings` 또는 `general_settings`에 있을 수 있습니다.
- 어떤 키가 전달되는지 확인하려면 debug logging을 활성화합니다: `LITELLM_LOG=DEBUG`.

## 관련 문서

- [Forward Client Headers](./../proxy/forward_client_headers.md) — 전체 BYOK 및 헤더 전달 문서
- [Claude Code Max Subscription](./claude_code_max_subscription.md) — LiteLLM을 통해 OAuth/Max subscription으로 Claude Code 사용
