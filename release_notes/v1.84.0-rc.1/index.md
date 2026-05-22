---
title: "v1.84.0-rc.1 - 안정성 강화 + multi-pod budget 정확도 개선"
slug: "v1-84-0-rc-1"
date: 2026-05-05T00:00:00
authors:
  - name: Krrish Dholakia
    title: CEO, LiteLLM
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, LiteLLM
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Yuneng Jiang
    title: Senior Full Stack Engineer, LiteLLM
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
hide_table_of_contents: false
---

## 이 버전 배포

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.litellm.ai/berriai/litellm:1.84.0-rc.1
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install litellm==1.84.0rc1
```

</TabItem>
</Tabs>

> 이 릴리스 후보는 `v1.83.14-stable` 위에서 잘라낸 버전입니다. 다음 안정 태그로 승격하기 전에 스테이징 프록시에서 검증하세요.
>
> **주의 — 동작 변경이 많이 포함된 큰 묶음입니다.** 이번 rc는 짧은 간격으로 출시된 안정성 및 강화 작업을 한데 모았습니다. 아래 **중요 동작 변경** 섹션에는 기본값 변경, configuration shortcut 제거, request/response shape 변경, 그리고 이전 동작을 유지하기 위한 opt-out이 모두 정리되어 있습니다. 프로덕션 배포를 업그레이드하기 전에 해당 섹션을 읽으세요.

## 주요 하이라이트

- **Pass-through endpoint는 기본적으로 인증됩니다.** `general_settings.pass_through_endpoints` 아래 entry의 `auth` field 기본값이 이제 `true`입니다. 기존의 "OSS는 기본적으로 unauthenticated forwarder를 사용하고, `auth: true`는 enterprise-only" 조합은 사라졌습니다. `auth: true`는 OSS에서도 작동하며, unauthenticated forwarder가 필요한 operator는 `auth: false`를 명시해야 합니다.
- **Multi-pod budget enforcement의 정확도가 실질적으로 개선되었습니다.** `RedisCache.async_increment`에 `refresh_ttl` opt-in이 추가되었고 spend counter가 이를 사용합니다. Redis clean miss에서는 오래된 in-memory counter를 건너뜁니다. `ResetBudgetJob`은 DB reset과 함께 Redis counter도 invalidate해 refresh된 counter도 reset되도록 합니다.
- **Prisma DB reconnect가 더 이상 event loop를 멈추지 않습니다.** reconnect path는 `await self.db.disconnect()`(내부에서 `subprocess.Popen.wait()`를 synchronous 호출)를 SIGTERM→SIGKILL → 새 `Prisma()`+`connect()` sequence로 교체했습니다. database flap 중 liveness probe 실패가 줄어듭니다. 동반 fix는 `PrismaClient.get_generic_data`의 `reconnect-and-retry`를 복구합니다.
- **Two-worker Docker deployment에서 memory footprint가 약 700 MB 감소했습니다.** lazy-loaded feature router와 lazy-loaded front page를 사용합니다. lazy route의 첫 request에는 import cost가 발생하지만, 이후 request는 동일합니다.
- **MCP OAuth + Azure Entra discovery 지원**, MCP tool name을 60자 제한 아래로 유지하기 위한 `opt-in short-ID tool prefix`, OAuth root-endpoint visibility가 explicit server-name lookup과 동일해졌습니다.
- **Durable agent workflow run tracking**이 새 `/v1/workflows/runs` REST surface로 추가되었습니다. `LiteLLM_WorkflowRun` / `LiteLLM_WorkflowEvent` / `LiteLLM_WorkflowMessage` table이 backing합니다. Spend logs `session_id` join으로 별도 비용 없이 cost attribution을 할 수 있습니다.
- **Routing Groups를 통한 per-model routing strategies.** 새 `router_settings.routing_groups` schema는 단일 router 안에서 `model_name` 목록을 자체 routing strategy(예: `gpt-4o`에는 `latency-based-routing`, 저렴한 model에는 `simple-shuffle`)에 binding합니다. `proxy_config.yaml` 또는 LiteLLM dashboard의 General Settings → Routing Groups에서 구성할 수 있으며, UI-managed group은 persist되고 YAML 값을 override합니다.

---

## ⚠️ 중요 동작 변경

이번 릴리스는 auth, ingress, callbacks, MCP, UI 전반의 여러 기본값을 강화합니다. 아래 각 항목은 변경 내용과, 해당하는 경우 이전 동작을 복구하는 데 필요한 정확한 configuration을 함께 설명합니다.

### Auth 및 request ingress {#auth--request-ingress}

#### Pass-through endpoints 기본값이 `auth: true`로 변경 {#pass-through-endpoints-default-to-auth-true}
- **변경 내용:** `PassThroughGenericEndpoint.auth`의 기본값이 이제 `True`입니다. `user_api_key_auth.py`의 runtime dispatch는 endpoint를 raw dict로 읽기 때문에 dict에 명시 key가 없어도 `endpoint.get("auth", True)`가 적용됩니다. `auth: true`의 `premium_user` gate도 제거되어 OSS deployment에서도 `auth: true`를 사용할 수 있습니다.
- **영향 대상:** `general_settings.pass_through_endpoints`에서 `auth:`를 생략한 모든 pass-through entry입니다. 이 rc 이전에는 unauthenticated를 의미했지만, 이제 LiteLLM key authentication을 의미합니다.
- **이전 동작 복구:** public이어야 하는 모든 pass-through entry(예: webhook receiver)에 `auth: false`를 명시하세요.
  ```yaml
  general_settings:
    pass_through_endpoints:
      - path: /webhook/something
        target: https://example.com/webhook
        auth: false   # was implicit before; must be explicit now
  ```

#### Clientside `api_base` / `base_url`에 gate와 credential stripping 적용 {#clientside-api_base--base_url-are-gated-and-credential-stripped}
- **변경 내용:**
  1. `litellm.user_url_validation`이 활성화된 경우 clientside `api_base` / `base_url`은 `validate_url`로 검증됩니다.
  2. request가 `api_base` / `base_url`로 redirect되면 admin-configured provider credentials와 per-deployment metadata(OCI signing keys, AWS / Azure / Vertex tokens, observability vars, `CredentialLiteLLMParams`의 모든 field)가 call forwarding 전에 제거됩니다.
  3. `get_llm_provider_logic.py`의 provider-inference matcher는 더 이상 unanchored substring match를 하지 않고, parsed URL hostname + segment-bounded path prefix를 비교합니다.
  4. clientside-overridable param blocklist에 `aws_bedrock_runtime_endpoint`, `langsmith_base_url`, `langfuse_host`, `posthog_host`, `braintrust_host`, `slack_webhook_url`, `s3_endpoint_url`, `sagemaker_base_url`, `deployment_url`이 추가됩니다. 기존의 "`api_key`가 비어 있지 않으면 blocklist는 no-op" 조항은 제거되었습니다.
- **영향 대상:** request 시점에 `api_base` 또는 새로 block된 field를 전달하고 implicit-`api_key` bypass에 의존해 통과시키던 사용자입니다.
- **이전 동작 복구:** bypass 대신 문서화된 BYOK path를 사용하세요.
  - Proxy-wide: `general_settings.allow_client_side_credentials: true`
  - Per deployment: `litellm_params.configurable_clientside_auth_params: ["api_base", ...]`

  차단된 request에 대해 proxy가 반환하는 400은 문제가 된 field 이름과 동일한 두 setting을 안내합니다.

#### Master-key requests는 master-key hash 대신 alias를 전달 {#master-key-requests-now-propagate-an-alias-instead-of-the-master-key-hash}
- **변경 내용:** request가 master key로 authenticate되면 downstream code에 전달되는 `UserAPIKeyAuth.api_key` / `token` 값은 이제 constant `LITELLM_PROXY_MASTER_KEY_ALIAS = "litellm_proxy_master_key"`입니다. cache lookup은 변경되지 않았습니다(여전히 `hash_token(master_key)` 기준). `_is_master_key`는 더 이상 SHA-256 hash form을 받지 않고 raw master key만 허용합니다.
- **영향 대상:** spend logs 위 custom dashboard와 hash literal에 고정된 Prometheus `/metrics` query를 포함해, 기존 master-key hash value로 join 또는 filtering하던 모든 항목입니다.
- **이전 동작 복구:** 없음. master-key activity에 대해 spend logs 또는 metrics를 조회하는 operator는 filter를 alias `"litellm_proxy_master_key"`로 변경해야 합니다.

#### Invite-link onboarding은 더 이상 `GET`에서 key를 발급하지 않음 {#invite-link-onboarding-no-longer-mints-a-key-from-get}
- **변경 내용:** `GET /onboarding/get_token`은 invite + user id에 binding된 15분짜리 signed onboarding JWT를 반환합니다. `sk-...` virtual key를 발급하지 않습니다. `POST /onboarding/claim_token`은 해당 JWT를 요구하며 `update_many(... is_accepted=False, ... → True)`로 invite를 atomic하게 reserve합니다.
- **영향 대상:** `GET /onboarding/get_token`에서 embedded `sk-...`를 받아 password claim 완료 전에 usable session key처럼 처리하던 tooling입니다.
- **이전 동작 복구:** 없음. client는 live key를 얻기 위해 `POST /onboarding/claim_token`을 호출해야 합니다.

#### CLI SSO login flow가 server-side session 사용 {#cli-sso-login-flow-uses-a-server-side-session}
- **변경 내용:** `litellm-proxy login`은 이제 login id + polling secret + terminal verification code를 반환하는 CLI SSO flow를 시작합니다. polling endpoint가 JWT를 반환하기 전에 browser callback이 terminal code를 확인해야 합니다.
- **영향 대상:** upgraded proxy에 대해 오래된 `litellm-proxy` CLI를 실행하는 사용자입니다. 기존 caller-supplied-handle handoff는 제거되었습니다.
- **이전 동작 복구:** 없음. proxy와 함께 CLI도 업그레이드하세요.

#### Team self-join(`_is_available_team`)은 `role=user` self-add만 허용 {#team-self-join-_is_available_team-only-allows-self-add-as-roleuser}
- **변경 내용:**
  - `/team/member_add`: caller가 admin이 아니고 team이 "available"인 경우 request는 **caller 본인만** **`role="user"`**로 추가해야 합니다. bulk shape도 동일하게 검사됩니다. 유효한 self-entry와 `role="admin"` entry가 섞인 list는 거부됩니다. self-join path의 email-only member도 거부됩니다.
  - `/team/permissions_update`: `_is_available_team` clause가 완전히 제거되었습니다. proxy/team/org admin만 `team_member_permissions`를 update할 수 있습니다.
- **영향 대상:** admin privilege 없이 available team에 admin을 추가하거나, non-admin context에서 `team_member_permissions`를 변경하기 위해 blanket bypass에 의존하던 flow입니다.
- **이전 동작 복구:** 없음. admin-scoped operation은 admin key로 수행하세요.

#### Guardrail modification permission은 key 존재 여부로 gate {#guardrail-modification-permission-gates-on-key-presence}
- **변경 내용:** `auth_checks.py`의 guardrail-modification authz check는 이제 payload truthiness가 아니라 intent(request에 key가 존재하는지)에 따라 gate합니다. 이전에 허용되던 일부 shape는 이제 403을 반환합니다.
- **이전 동작 복구:** 없음. falsy payload로 통과하던 non-admin caller flow는 update가 필요합니다.

#### 신뢰할 수 없는 root control field는 client request에서 제거 {#untrusted-root-control-fields-are-stripped-from-client-requests}
- **변경 내용:** `litellm_pre_call_utils.py`의 `_UNTRUSTED_ROOT_CONTROL_FIELDS`에는 `mock_response`, `mock_tool_calls`, redaction-bypass control 및 몇 가지 기타 field가 포함됩니다. calling key/team이 `mock_response` / `mock_tool_calls`에 대해 `allow_client_mock_response: true`를 갖고 있거나, redaction bypass에 해당하는 `admin-opt-in metadata`를 갖고 있지 않으면 client request에서 제거됩니다. Pillar guardrail caching header와 Bedrock dynamic evaluation override도 명시적으로 허용되지 않으면 filtering됩니다.
- **영향 대상:** completion을 short-circuit하기 위해 `extra_body`에 `mock_response` / `mock_tool_calls`를 전달하는 test와 tooling입니다.
- **이전 동작 복구:** test key 또는 해당 key를 소유한 team의 admin metadata에 `allow_client_mock_response: true`를 설정하세요.
  ```python
  client.keys.generate(
      key_alias="ci-mock-key",
      metadata={"allow_client_mock_response": True},
  )
  ```

#### Error response는 더 이상 re-raise된 local parameter를 노출하지 않음 {#error-responses-no-longer-leak-re-raised-local-parameters}
- **변경 내용:** response-utils path의 broad `except` handler는 captured request parameter를 re-raised error message에 render하곤 했습니다. 해당 parameter에는 credential이 포함될 수 있으므로 이제 rendered message에서 제거됩니다.
- **영향 대상:** 5xx error body에서 credential-shaped field를 parsing하던 client입니다. error response shape 자체는 그 외 변경이 없습니다.
- **이전 동작 복구:** 없음.

### Vector stores {#vector-stores}

#### Credential redaction 및 `/vector_store/update` per-store gate
- **변경 내용:**
  - `/vector_store/list`, `/vector_store/info`, `/vector_store/update`는 persisted `litellm_params` 내부의 credential-bearing value를 redact합니다(dict, JSON-string-serialized params, `litellm_embedding_config` 같은 nested-dict shape 처리).
  - `/vector_store/update`는 이제 `_fetch_and_authorize_vector_store`로 gate됩니다. 이는 `/vector_store/info`가 이미 갖고 있던 per-store access check와 동일합니다.
  - `SensitiveDataMasker`는 기본 `sensitive-pattern set`에 plural `"credentials"`를 추가해 segment-exact matching이 `vertex_credentials`, `aws_credentials` 등을 잡습니다. vector store뿐 아니라 `default-instantiated masker` 전체에 영향을 주는 latent fix입니다.
  - `get_vector_store_info`와 `update_vector_store`는 catch-all이 `403` / `404`를 `500`으로 downgrade하게 두지 않고 `HTTPException`을 re-raise합니다.
- **영향 대상:** provider key를 복구하기 위해 이 response의 `litellm_params`를 읽던 항목, 또는 `/vector_store/update`로 임의의 vector store를 변경하던 non-store-admin caller입니다.
- **이전 동작 복구:** 없음.

### Logging callbacks 및 key/team metadata {#logging-callbacks--keyteam-metadata}

#### key/team metadata의 `os.environ/*` callback refs는 더 이상 resolve되지 않음 {#osenviron-callback-refs-in-keyteam-metadata-are-no-longer-resolved}
- **변경 내용:** `convert_key_logging_metadata_to_callback()`은 더 이상 key/team metadata의 `os.environ/*` 값을 `get_secret()`으로 resolve하지 않습니다. 해당 값이 있는 기존 row는 request를 crash시키는 대신 request setup에서 조용히 무시됩니다. `add_team_based_callbacks_from_config()`의 trusted `config.yaml` team-callback env resolution은 변경되지 않았습니다. key/team logging metadata에서 새로 만드는 `AddTeamCallback`도 `os.environ/*` callback var를 거부합니다.
- **영향 대상:** request 시점에 server env var를 가져오기 위해 callback metadata에 `os.environ/DATABASE_URL` 또는 유사 값을 저장한 key/team입니다.
- **이전 동작 복구:** DB-backed key 또는 team metadata에 `os.environ/*` reference를 넣는 대신 trusted proxy `config.yaml`(`team_callbacks` / `model_list[*].litellm_params`)에서 해당 callback secret을 구성하세요. 반드시 필요한 경우 literal credential value는 metadata에 계속 저장할 수 있습니다.

#### Team-callback admin mutations가 이제 audit logs를 emit {#team-callback-admin-mutations-now-emit-audit-logs}
- **변경 내용:** `litellm.store_audit_logs=True`일 때 `POST /team/{id}/callback`(`add_team_callbacks`)과 `POST /team/{id}/disable_logging`(`disable_team_logging`)이 `LiteLLM_Audit로그` row를 emit합니다. audit logging이 활성화된 경우 additive change입니다.
- **이전 동작 복구:** `litellm.store_audit_logs: false`(기본값)는 새 row를 suppress합니다.

### MCP

#### User-scoped MCP credentials는 저장 시 암호화 {#encrypted-user-scoped-mcp-credentials-at-rest}
- **변경 내용:** `LiteLLM_MCPUserCredentials.credential_b64` write는 plain `urlsafe_b64encode` 대신 `encrypt_value_helper`(nacl SecretBox)를 거칩니다. read path는 nacl decryption을 먼저 시도하고 legacy row에는 plain `urlsafe_b64decode`로 fallback합니다. 기존 row는 계속 읽을 수 있습니다.
- **영향 대상:** table을 직접 읽는 operator입니다. column content는 첫 rewrite 시 shape가 바뀝니다.
- **이전 동작 복구:** 없음. backward-compat read path가 legacy row를 다음 write 전까지 계속 작동하게 합니다.

#### OAuth metadata discovery가 SSRF guard를 따름 {#oauth-metadata-discovery-follows-ssrf-guard}
- **변경 내용:** MCP discovery가 따라가는 두 URL(`WWW-Authenticate`의 `resource_metadata`, protected-resource-metadata의 `authorization_servers[0]`)은 이제 `async_safe_get`의 적용을 받습니다. same-authority metadata fetch는 그대로 direct(`follow_redirects=False`)이며, cross-origin fetch는 기존 user URL validation policy로 검증됩니다. Public federated provider(Azure Entra, Google, Okta, GitHub)는 계속 지원됩니다.
- **영향 대상:** Cross-origin internal/loopback/cloud-metadata OAuth metadata URL입니다.
- **이전 동작 복구:** proxy URL-validation docs에 따라 `litellm.user_url_validation`과 기존 URL validation control을 조정해 특정 internal target을 허용하세요.

#### MCP public-route detection은 더 이상 query string을 match하지 않으며 OAuth2 fallback은 더 이상 fail-open하지 않음 {#mcp-public-route-detection-no-longer-matches-query-strings-oauth2-fallback-no-longer-fail-opens}
- **변경 내용:**
  - `MCPRequestHandler.process_mcp_request`는 `".well-known" in str(request.url)` 대신 `request.url.path.startswith("/.well-known/")`를 확인합니다. `?.well-known` 같은 query-string smuggling은 거부됩니다.
  - `Authorization` header가 LiteLLM-key validation에 실패하면 handler는 더 이상 이를 "OAuth2 passthrough"로 처리해 빈 `UserAPIKeyAuth()`를 반환하지 않습니다.
- **이전 동작 복구:** 없음.

#### MCP OAuth root endpoint가 request visibility rule로 resolve {#mcp-oauth-root-endpoint-resolves-with-request-visibility-rules}
- **변경 내용:** Root-endpoint fallback은 explicit server-name lookup과 동일한 visibility rule로 단일 OAuth2 server를 resolve합니다. non-visible server는 더 이상 fallback path로 선택되지 않습니다. callback redirect path는 state에 담긴 전체 client redirect URI를 validate하고 기존 query string을 잃지 않은 채 parameter를 append합니다.
- **이전 동작 복구:** 없음. fallback에 의존하지 말고 server visibility를 조정하세요.

### UI / static assets {#ui--static-assets}

#### `/get_image`, `/get_favicon`, `/get_logo_url`
- **변경 내용:**
  - Remote HTTP(S) `UI_LOGO_PATH` / `LITELLM_FAVICON_URL`은 이제 redirect를 통해 browser에서 load됩니다. proxy는 더 이상 unauthenticated endpoint에서 server-side로 fetch하지 않습니다.
  - Local file path는 계속 작동하지만, resolved file은 지원되는 image signature(`jpeg`, `png`, `gif`, `webp`, `ico`)를 가져야 합니다. non-image path는 bundled default로 fallback합니다.
  - `/get_logo_url`은 HTTP(S) 값만 반환합니다. local filesystem path는 노출되지 않습니다.
  - 오래된 `cached_logo.jpg` file은 더 이상 `/get_image`에서 serve되지 않습니다.
- **영향 대상:** `UI_LOGO_PATH` / `LITELLM_FAVICON_URL`을 non-image local file로 지정했거나, `/get_logo_url`이 local path를 드러내는 것에 의존하던 custom branding setup입니다.
- **이전 동작 복구:** 새 env var는 필요 없습니다. 기존 remote URL은 계속 작동합니다. local image path도 file이 인식 가능한 image type이면 계속 작동합니다.

#### `/ui/chat` 제거 {#uichat-removed}
- **변경 내용:** Static `chat.html` / `chat.txt` / `chat/`이 제거되어 해당 route는 404를 반환합니다. chat UI는 이미 nav에서 제거되었고, 남아 있던 static build도 이제 제거되었습니다.
- **이전 동작 복구:** 없음.

#### Spend 로그 prompt 저장 toggle이 Admin Settings로 이동 {#store-prompts-in-spend-logs-toggle-moved-to-admin-settings}
- **변경 내용:** `"Store Prompts in Spend 로그"`와 `"Maximum Spend 로그 Retention Period"`가 로그 page의 gear-icon modal에서 **Admin Settings → Logging Settings**로 이동했습니다. 기존 gear는 non-admin에게도 보였고 저장 시 403을 노출했습니다.
- **이전 동작 복구:** 없음. `/config/update`와 `/config/list`가 이미 요구하던 것처럼 control은 admin-only입니다.

---

## 신규 모델 / 업데이트된 모델

#### 신규 Model Support(16개 모델) {#new-model-support-16-models}

| 제공자       | 모델                                           | 컨텍스트 창 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 기능                                                      |
| ------------ | ---------------------------------------------- | -------------- | ------------------- | -------------------- | --------------------------------------------------------- |
| OpenAI       | `gpt-image-2`, `gpt-image-2-2026-04-21`        | 해당 없음(이미지) | $5.00               | $10.00               | 비전, PDF 입력                                            |
| Azure OpenAI | `azure/gpt-image-2`, `azure/gpt-image-2-2026-04-21` | 해당 없음(이미지) | $5.00               | $10.00               | 비전, PDF 입력                                            |
| AWS Bedrock  | `zai.glm-5`                                    | 200,000        | $1.00               | $3.20                | 함수 호출, 추론, 도구 선택                                |
| Crusoe       | `crusoe/deepseek-ai/DeepSeek-R1-0528`          | 163,840        | $3.00               | $7.00                | 추론                                                      |
| Crusoe       | `crusoe/deepseek-ai/DeepSeek-V3-0324`          | -              | -                   | -                    | -                                                         |
| Crusoe       | `crusoe/google/gemma-3-12b-it`                 | 131,072        | $0.10               | $0.10                | 함수 호출, 비전, 도구 선택                                |
| Crusoe       | `crusoe/meta-llama/Llama-3.3-70B-Instruct`     | 131,072        | $0.20               | $0.20                | 함수 호출, 도구 선택                                      |
| Crusoe       | `crusoe/moonshotai/Kimi-K2-Thinking`           | 262,144        | $2.50               | $2.50                | 추론                                                      |
| Crusoe       | `crusoe/openai/gpt-oss-120b`                   | 131,072        | $0.80               | $0.80                | 함수 호출, 도구 선택                                      |
| Crusoe       | `crusoe/Qwen/Qwen3-235B-A22B-Instruct-2507`    | 262,144        | $3.00               | $3.00                | 함수 호출, 도구 선택                                      |
| Vertex AI    | `vertex_ai/xai/grok-4.1-fast-reasoning`        | 2,000,000      | $0.20               | $0.50                | 함수 호출, 비전, 추론, 응답 스키마, 도구 선택             |
| Vertex AI    | `vertex_ai/xai/grok-4.1-fast-non-reasoning`    | 2,000,000      | $0.20               | $0.50                | 함수 호출, 비전, 응답 스키마, 도구 선택                   |
| Vertex AI    | `vertex_ai/xai/grok-4.20-reasoning`            | 2,000,000      | $2.00               | $6.00                | 함수 호출, 비전, 추론, 응답 스키마, 도구 선택             |
| Vertex AI    | `vertex_ai/xai/grok-4.20-non-reasoning`        | 2,000,000      | $2.00               | $6.00                | 함수 호출, 비전, 응답 스키마, 도구 선택                   |

#### 신규 Providers(2개 provider) {#new-providers-2-providers}

| 제공자       | 엔드포인트                                            | 참고                                                                                 |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **AIHubMix** | OpenAI 호환 chat completions                           | [PR #24294](https://github.com/BerriAI/litellm/pull/24294)                            |
| **Crusoe**   | reasoning / instruct catalog 전반의 chat completions   | 위 catalog                                                                            |

#### Pricing 업데이트

- **OpenAI [`gpt-5.5-pro`](../../docs/providers/openai)** — 수정됨: OpenAI published rate의 2배로 설정되어 있었습니다. `gpt-5.5-pro`의 cost-tracking output은 이전 release에서 보고되던 값의 절반으로 내려갑니다. upgrade boundary를 가로질러 spend report를 reconcile하는 operator는 이 discontinuity를 예상해야 합니다. - [PR #26651](https://github.com/BerriAI/litellm/pull/26651)
- **AWS Bedrock Anthropic Claude 4.5 / 4.6 / 4.7** (Global + US) — `cache_creation_input_token_cost_above_1hr`를 추가했습니다(Sonnet 4.5의 `_above_200k_tokens` LC variant 포함). Bedrock의 1-hour-TTL prompt-cache write는 이제 5-minute rate로 fallback하지 않고 published 1.6× rate로 bill됩니다(기존에는 약 60% undercount). - [PR #26800](https://github.com/BerriAI/litellm/pull/26800)

#### 기능 {#features}

- **[Bedrock](../../docs/providers/bedrock)**
    - Converse path에서 Claude 4.5+ tool의 `cache_control` TTL을 보존하고, Invoke path에서 `tools` block을 sanitize합니다. - [PR #25855](https://github.com/BerriAI/litellm/pull/25855)
    - tool-result path에서 OpenAI `file` content를 변환합니다(Bedrock Converse + direct Anthropic). - [PR #26710](https://github.com/BerriAI/litellm/pull/26710)
    - `extra_body`를 통한 vector-store search용 `retrieval설정` passthrough - [PR #26685](https://github.com/BerriAI/litellm/pull/26685)
- **[Vertex AI](../../docs/providers/vertex)**
    - metadata label을 embeddings(`labels`), Imagen(`labels`), Discovery Engine rerank(`userLabels`)로 전파합니다. path 전반에서 shared helper를 사용합니다. - [PR #25499](https://github.com/BerriAI/litellm/pull/25499)
    - `@lru_cache`로 Anthropic-messages config instance를 재사용해 `VertexBase` credential cache가 call 간 유지되도록 합니다. - [PR #26099](https://github.com/BerriAI/litellm/pull/26099)
- **[Google Native](../../docs/pass_through/google_ai_studio)**
    - `:generateContent` 및 `:streamGenerateContent`에서 LiteLLM proxy success headers(`x-litellm-*`)를 emit합니다. - [PR #25500](https://github.com/BerriAI/litellm/pull/25500)
    - Guardrail이 실행되도록 `:generateContent` / `:streamGenerateContent`에서 `pre_call_hook`을 실행합니다. - [PR #26914](https://github.com/BerriAI/litellm/pull/26914)
- **[Anthropic](../../docs/providers/anthropic)**
    - Non-streaming에서 JSON `response_format` + user tools를 지원합니다. 필터링된 tool calls와 structured JSON이 `content`로 merge되며, 내부 `json_tool_call`은 더 이상 surface되지 않습니다. - [PR #26222](https://github.com/BerriAI/litellm/pull/26222)
- **[Ollama](../../docs/providers/ollama)**
    - Assistant messages의 `tool_calls`와 `role: tool` messages의 `tool_call_id`를 forward합니다. Multi-turn agent의 무한 tool-call loop를 수정합니다. - [PR #26122](https://github.com/BerriAI/litellm/pull/26122)
- **[Predibase](../../docs/providers/predibase)**
    - `transform_request` / `transform_response`를 `transformation.py`로 migrate했습니다(refactor, behavior change 없음). - [PR #25249](https://github.com/BerriAI/litellm/pull/25249)
- **[AIHubMix](../../docs/providers/aihubmix) (신규)**
    - First-class OpenAI 호환 provider entry를 추가했습니다. - [PR #24294](https://github.com/BerriAI/litellm/pull/24294)

### 버그 수정 {#bug-fixes}

- **[Vertex AI](../../docs/providers/vertex)**
    - `null`이 포함된 `anyOf` schema의 array branch에서 `items`를 보존합니다(Vertex가 `INVALID_ARGUMENT`로 거부하던 문제). - [PR #26675](https://github.com/BerriAI/litellm/pull/26675)
- **[Bedrock](../../docs/providers/bedrock)**
    - `GET /v1/batches/{batch_id}`가 encoded id의 `model`을 forward합니다(기존에는 `LiteLLM doesn't support bedrock for 'create_batch'`를 반환). - [PR #26814](https://github.com/BerriAI/litellm/pull/26814)
    - Pass-through stream interruption 시 spend tracking을 flush합니다. Client disconnect의 `GeneratorExit` 때문에 per-chunk usage value가 누락되던 문제를 수정합니다. - [PR #26719](https://github.com/BerriAI/litellm/pull/26719)
    - 16개 test file에서 deprecated Claude 3.7 Sonnet test reference를 `claude-sonnet-4-5-20250929-v1:0`로 교체했습니다. - [PR #26721](https://github.com/BerriAI/litellm/pull/26721)
- **[Router custom pricing](../../docs/proxy/custom_pricing)**
    - DB `model_info`의 custom `cost_per_token`을 fallback path까지 전파합니다. - [PR #25888](https://github.com/BerriAI/litellm/pull/25888)

---

## LLM API 엔드포인트 {#llm-api-endpoints}

#### 기능 {#features-1}

- **Workflows API (신규)**
    - Durable agent workflow run tracking입니다. 새 schema(`LiteLLM_WorkflowRun`, `LiteLLM_WorkflowEvent`, `LiteLLM_WorkflowMessage`)와 `/v1/workflows/runs/...` 아래 8개 endpoint(create, list, get, patch, append/list events, append/list messages)를 추가했습니다. `session_id`는 `LiteLLM_Spend로그.session_id`와 join되어 추가 비용 없이 cost attribution을 제공합니다. - [PR #26793](https://github.com/BerriAI/litellm/pull/26793)
- **[Vector Stores](../../docs/vector_stores)**
    - `extra_body`를 통한 Bedrock `retrieval설정` passthrough를 지원하며, provider별 explicit allow-listing을 적용합니다. - [PR #26685](https://github.com/BerriAI/litellm/pull/26685)

#### 버그 {#bugs}

- **[Responses API](../../docs/response_api)**
    - `DELETE /openai/responses/{id}`가 더 이상 `json={}`를 보내지 않습니다. Azure가 이제 빈 `{}` body를 `unexpected_body`로 거부합니다. - [PR #26949](https://github.com/BerriAI/litellm/pull/26949)
- **Pass-through endpoint 버그**
    - Non-streaming pass-through response(`/vertex_ai/*`, `/openai/*`, `/bedrock/*`)에서 post-call guardrail을 invoke합니다. Route에 guardrail이 구성된 경우에만 opt-in됩니다. - [PR #26262](https://github.com/BerriAI/litellm/pull/26262)
    - Managed-files passthrough batch creation(Anthropic + Vertex AI)에서 `UserAPIKeyAuth`를 만들 때 `litellm_params` metadata의 caller identity를 상속합니다. - [PR #26831](https://github.com/BerriAI/litellm/pull/26831)
- **Embedding cache**
    - Cache round-trip에서 `prompt_tokens_details`(`image_count` 포함)를 보존합니다. Retrieval 시 per-item detail을 aggregate하고 partial cache hit에서는 `combine_usage()`로 merge합니다. - [PR #26653](https://github.com/BerriAI/litellm/pull/26653)
- **Streaming logging**
    - Streaming hidden response cost를 success log path에 backfill합니다. - [PR #26606](https://github.com/BerriAI/litellm/pull/26606)
- **Cost calculation**
    - Spend row가 `0`을 기록하고 그로 인해 budget-overrun report가 발생하지 않도록 `success_handler` typed branch와 dict branch를 통합합니다. - [PR #26629](https://github.com/BerriAI/litellm/pull/26629)

---

## 관리 엔드포인트 / UI {#management-endpoints--ui}

#### 기능 {#features-2}

- **Teams**
    - Team-level search-tool credentials: `LiteLLM_ObjectPermissionTable`에 새 `search_tools` array가 추가되었습니다. Per-key permission은 owning team의 subset인지 검증되며, team management 아래에 UI selector가 추가되었습니다. - [PR #26691](https://github.com/BerriAI/litellm/pull/26691)
- **[Routing Groups](../../docs/proxy/ui/routing_groups)**
    - 새 **General Settings → Routing Groups** page: `proxy_config.yaml`을 편집하지 않고 dashboard에서 per-model routing strategies를 create, edit, delete할 수 있습니다. UI-managed group은 persist되고 YAML에 정의된 값을 override합니다. Per-group state는 저장 시 rebuild됩니다. - [PR #27131](https://github.com/BerriAI/litellm/pull/27131)
- **Model Health**
    - Model health status page에 pagination control을 추가했습니다. - [PR #26826](https://github.com/BerriAI/litellm/pull/26826)
- **CLI / Workers**
    - `--timeout_worker_healthcheck` CLI flag(env `TIMEOUT_WORKER_HEALTHCHECK`)를 추가했습니다. uvicorn 0.37.0+ `Config` kwarg로 forward됩니다. 이전 uvicorn에서는 warning + no-op이며 gunicorn / hypercorn path는 변경하지 않습니다. - [PR #26622](https://github.com/BerriAI/litellm/pull/26622)
- **메모리 / lazy loading**
    - 첫 request에서 optional feature router를 lazy-load합니다(two-worker Docker deployment에서 memory 약 700 MB 감소). - [PR #26534](https://github.com/BerriAI/litellm/pull/26534)
    - openapi.json front page를 lazy-load합니다. Spec generation은 runtime stub fallback과 함께 CI로 이동했습니다. - [PR #26802](https://github.com/BerriAI/litellm/pull/26802)
- **Background jobs**
    - 만료된 LiteLLM dashboard session key cleanup job을 추가했습니다. - [PR #26460](https://github.com/BerriAI/litellm/pull/26460)
- **MCP OAuth**
    - Azure Entra discovery endpoint를 지원합니다. - [PR #26584](https://github.com/BerriAI/litellm/pull/26584)

#### 버그 {#bugs-1}

- **MCP UI**
    - MCP server edit page의 Tool 설정 panel이 `POST /mcp-rest/test/tools/list`(temp-session preview, inline creds 필요)에서 `GET /mcp-rest/tools/list?server_id=...`(stored credentials)로 전환되었습니다. `api_key` / `bearer_token` / `basic` / `authorization` `auth_type`을 사용하는 saved server는 이제 "Unable to load tools — Failed to connect to MCP server." 없이 tool을 load합니다. - [PR #26002](https://github.com/BerriAI/litellm/pull/26002)
- **Teams**
    - `max_budget=NULL`인 per-member row는 더 이상 조용히 enforcement를 disable하지 않고 team-level enforcement로 fall through됩니다. - [PR #26809](https://github.com/BerriAI/litellm/pull/26809)
- **Spend logs**
    - Spend-log error message에서 request data를 제거합니다. - [PR #26662](https://github.com/BerriAI/litellm/pull/26662)
- **Vertex retrieve mock 테스트**
    - Mocked retrieve response에 `is_redirect=False`를 설정했습니다. - [PR #26844](https://github.com/BerriAI/litellm/pull/26844)

---

## AI 통합 {#ai-integrations}

### Logging

- **General**
    - Generic API logger batch send에 opt-in retry setting을 추가했습니다. 일시적인 `litellm.Timeout` / `httpx.ConnectTimeout` failure는 batch를 drop하지 않고 retry합니다. - [PR #26645](https://github.com/BerriAI/litellm/pull/26645)
    - Redis에 사용하는 GCP IAM token을 cache합니다. 기존에는 connection마다 재생성되었고, synchronous `google-auth` + `google-cloud-iam` call이 asyncio event loop를 freeze해 production에서 약 25초 `INCRBYFLOAT` Redis span을 유발했습니다. - [PR #26441](https://github.com/BerriAI/litellm/pull/26441)
    - Streaming hidden response cost를 backfill합니다. - [PR #26606](https://github.com/BerriAI/litellm/pull/26606)

### 가드레일

- **CyCraft XecGuard (신규)**
    - First-class partner guardrail입니다. Multi-policy prompt/response scanning(prompt injection, harmful content, PII, system-prompt enforcement, bias, skills protection)과 `/grounding`을 통한 RAG context-grounding을 제공합니다. - [PR #26011](https://github.com/BerriAI/litellm/pull/26011)
- **Noma v2**
    - Unserializable object(예: `uvloop.Loop`)로 `deepcopy(request_data)`가 실패해도 `post_call` / `during_call` / `during_mcp_call` 중 `_build_scan_payload`가 더 이상 crash하지 않습니다. - [PR #26605](https://github.com/BerriAI/litellm/pull/26605)
- **Pass-through**
    - Non-streaming pass-through response에 post-call guardrail을 적용합니다(LLM API Endpoints 참조). - [PR #26262](https://github.com/BerriAI/litellm/pull/26262)

---

## 비용 추적, Budget 및 Rate Limiting {#cost-tracking-budgets-and-rate-limiting}

- **Multi-pod budget enforcement 개선**
    - `RedisCache.async_increment`에 `refresh_ttl` opt-in이 추가되었습니다(spend counter에서 사용). `get_current_spend`와 `SpendCounterReseed.coalesced`는 Redis clean miss 시 stale per-pod in-memory 값을 건너뜁니다. `ResetBudgetJob`은 모든 DB row reset(key, user, team, team member, budget-linked key)과 함께 Redis counter를 invalidate합니다. - [PR #26829](https://github.com/BerriAI/litellm/pull/26829)
- **비용 계산 통합**
    - `success_handler` typed + dict branch가 이제 동일한 방식으로 cost를 계산합니다. - [PR #26629](https://github.com/BerriAI/litellm/pull/26629)
- **Member별 null budget**
    - `max_budget=NULL`인 per-member row는 team enforcement로 fall through됩니다. - [PR #26809](https://github.com/BerriAI/litellm/pull/26809)
- **Bedrock 1-hour cache write pricing 수정**
    - Claude 4.5 / 4.6 / 4.7 Global + US entry에 `cache_creation_input_token_cost_above_1hr`를 추가했습니다(기존에는 약 60% undercount). - [PR #26800](https://github.com/BerriAI/litellm/pull/26800)
- **`gpt-5.5-pro` corrected pricing**
    - 기존 double-priced 문제를 수정했습니다. - [PR #26651](https://github.com/BerriAI/litellm/pull/26651)
- **Bedrock pass-through stream interruption 처리**
    - Client가 mid-stream에서 disconnect해도 spend tracking을 flush합니다. - [PR #26719](https://github.com/BerriAI/litellm/pull/26719)

---

## MCP 게이트웨이 {#mcp-gateway}

- **Tool prefix**
    - Opt-in `LITELLM_USE_SHORT_MCP_TOOL_PREFIX` env var: per-tool prefix를 human-readable server name(`github_onprem-get_repo`)에서 `server_id`에서 파생한 deterministic 3-char base62 id(`Xy7-get_repo`)로 전환합니다. 긴 server name도 일부 model API가 강제하는 60자 tool-name limit 아래에 머물 수 있습니다. - [PR #26733](https://github.com/BerriAI/litellm/pull/26733)
- **OAuth**
    - Azure Entra discovery endpoint를 지원합니다. - [PR #26584](https://github.com/BerriAI/litellm/pull/26584)
    - Public-route detection, OAuth root endpoint visibility, OAuth metadata SSRF guard, user-scoped credential encryption은 **중요 동작 변경**을 참조하세요.

---

## 성능 / 부하 분산 / 안정성 개선 {#performance--loadbalancing--reliability-improvements}

- **[Routing Groups (per-model strategies)](../../docs/routing#routing-groups---per-model-strategies)**
    - 새 `router_settings.routing_groups` schema는 `model_name` list를 자체 `routing_strategy`와 optional `routing_strategy_args`에 bind합니다. Ungrouped model은 top-level `routing_strategy`(implicit `default` group, name reserved)로 fallback합니다. 각 `model_name`은 최대 하나의 group에만 속할 수 있으며, overlap은 init 시 `ValueError`를 raise합니다. Runtime에서 `Router.update_settings(routing_groups=[...])` 또는 `/config/update`로 update할 수 있고, update 시 per-group state가 rebuild됩니다. - [PR #27022](https://github.com/BerriAI/litellm/pull/27022)
- **Database reconnect**
    - Prisma reconnect가 더 이상 asyncio event loop를 block하지 않습니다. `await self.db.disconnect()`(내부에서 `subprocess.Popen.wait()`를 synchronous 호출해 production에서 30-120초 이상 loop를 freeze하고 K8s liveness probe 실패를 유발)을 SIGTERM → 0.5초 sleep → SIGKILL → 새 `Prisma()` + `connect()`로 교체했습니다. Direct-reconnect path는 `recreate_prisma_client`에 delegate합니다. - [PR #26225](https://github.com/BerriAI/litellm/pull/26225)
    - `call_with_db_reconnect_retry` helper가 reconnect-and-retry-once pattern을 centralize합니다. 1.83.x가 `PrismaClient.get_generic_data`에서 잃었던 self-heal(issue [#25143](https://github.com/BerriAI/litellm/issues/25143))을 복구하고 reconnect state machine을 harden합니다. - [PR #26756](https://github.com/BerriAI/litellm/pull/26756)
- **Redis IAM token caching 개선**
    - GCP IAM token은 더 이상 Redis connection마다 재생성되지 않습니다. Production의 28.4초 trace에서 단일 Redis `INCRBYFLOAT`가 25.6초를 차지하던 문제를 줄입니다. - [PR #26441](https://github.com/BerriAI/litellm/pull/26441)
- **Config caching**
    - DualCache config parameter read를 cache하고 batch 처리합니다. Docker end-to-end 기준 read load가 2.8 q/s에서 0.7 q/s로 감소하며, 개선 폭은 pod 수에 따라 커집니다. 참고: config edit는 cache가 invalidated될 때까지 propagate되는 데 더 오래 걸립니다. - [PR #26469](https://github.com/BerriAI/litellm/pull/26469)
- **Memory footprint**
    - Feature router를 lazy-load합니다. - [PR #26534](https://github.com/BerriAI/litellm/pull/26534)
    - Front page를 lazy-load하고 openapi.json generation을 CI로 이동했습니다. - [PR #26802](https://github.com/BerriAI/litellm/pull/26802)
- **Connection layer**
    - aiohttp `TCPConnector`에서 optional TCP `SO_KEEPALIVE`를 지원합니다. - [PR #26730](https://github.com/BerriAI/litellm/pull/26730)
- **CLI**
    - uvicorn worker triage용 `--timeout_worker_healthcheck` flag를 추가했습니다(Management Endpoints 참조). - [PR #26622](https://github.com/BerriAI/litellm/pull/26622)
- **Test stability**
    - `asyncio` record(예: `Unclosed client session`)가 assertion을 간헐적으로 fail시키지 않도록 `test_model_alias_map` ERROR-log assertion scope를 LiteLLM logger로 제한했습니다. - [PR #26741](https://github.com/BerriAI/litellm/pull/26741)
    - Lazy-load subprocess startup-import diff를 static source scan으로 교체했습니다(2분을 넘겨 timeout되는 대신 약 13초). - [PR #26934](https://github.com/BerriAI/litellm/pull/26934)
    - Request-control hardening 이후 model-access E2E test를 `allow_client_mock_response: true`에 opt-in했습니다. - [PR #26941](https://github.com/BerriAI/litellm/pull/26941)
- **Validation**
    - Credential intake 시 AWS region name을 validate합니다. - [PR #26906](https://github.com/BerriAI/litellm/pull/26906)
    - Unsupported `dbName` 및 `partitionNames`를 `MILVUS_OPTIONAL_PARAMS`에서 drop했습니다. - [PR #26910](https://github.com/BerriAI/litellm/pull/26910)

---

## 일반 프록시 개선 {#general-proxy-improvements}

- **CI / Tooling**
    - `local_testing_part1` / `local_testing_part2` / `litellm_router_testing` job에서 CircleCI "Rerun failed tests"를 지원합니다(기존에는 0 items + exit 123 수집). - [PR #26461](https://github.com/BerriAI/litellm/pull/26461)
    - `.npmrc` file의 `min-release-age` 값을 수정했습니다. `d` suffix를 제거해 npm 11.x에서 `npm install`이 `RangeError: Invalid time value`로 crash하지 않도록 했습니다. - [PR #26850](https://github.com/BerriAI/litellm/pull/26850)
- **PR 템플릿**
    - Internal contributor용 Linear ticket field를 추가했습니다. - [PR #26655](https://github.com/BerriAI/litellm/pull/26655)

---

## 신규 기여자 {#new-contributors}

- @xinrui-z 님이 [#24294](https://github.com/BerriAI/litellm/pull/24294)에서 첫 기여를 했습니다.
- @Jerry-SDE 님이 [#25249](https://github.com/BerriAI/litellm/pull/25249)에서 첫 기여를 했습니다.
- @Zerohertz 님이 [#25888](https://github.com/BerriAI/litellm/pull/25888)에서 첫 기여를 했습니다.
- @clyang 님이 [#26011](https://github.com/BerriAI/litellm/pull/26011)에서 첫 기여를 했습니다.
- @mverrilli 님이 [#26122](https://github.com/BerriAI/litellm/pull/26122)에서 첫 기여를 했습니다.
- @tuhinspatra 님이 [#26262](https://github.com/BerriAI/litellm/pull/26262)에서 첫 기여를 했습니다.
- @omriShukrun08 님이 [#26605](https://github.com/BerriAI/litellm/pull/26605)에서 첫 기여를 했습니다.
- @lmcdonald-godaddy 님이 [#26651](https://github.com/BerriAI/litellm/pull/26651)에서 첫 기여를 했습니다.
- @minznerjosh 님이 [#26710](https://github.com/BerriAI/litellm/pull/26710)에서 첫 기여를 했습니다.
- @yassinkortam 님이 [#26730](https://github.com/BerriAI/litellm/pull/26730)에서 첫 기여를 했습니다.
- @sruthi-sixt-26 님이 [#26814](https://github.com/BerriAI/litellm/pull/26814)에서 첫 기여를 했습니다.

**전체 변경 이력**: https://github.com/BerriAI/litellm/compare/v1.83.14-stable...v1.84.0-rc.1

---

## 05/05/2026

* 신규 모델 / 업데이트된 모델: 19
* LLM API 엔드포인트: 6
* 관리 엔드포인트 / UI: 22
* AI 통합(Logging / 가드레일): 3
* 비용 추적, Budget 및 Rate Limiting: 5
* MCP 게이트웨이: 6
* 성능 / 부하 분산 / 안정성 개선: 14
* 일반 프록시 개선: 2
* 문서 업데이트: 1

총합: 78 PR
