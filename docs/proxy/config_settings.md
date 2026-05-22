# 전체 설정

```yaml
environment_variables: {}

model_list:
  - model_name: string
    litellm_params: {}
    model_info:
      id: string
      mode: embedding
      input_cost_per_token: 0
      output_cost_per_token: 0
      max_tokens: 2048
      base_model: gpt-4-1106-preview
      additionalProp1: {}

litellm_settings:
  # 로깅/Callback 설정
  success_callback: ["langfuse"]  # 성공 callback 목록
  failure_callback: ["sentry"]  # 실패 callback 목록
  callbacks: ["otel"]  # 성공과 실패 모두에서 실행되는 callback 목록
  service_callbacks: ["datadog", "prometheus"]  # redis, postgres 실패를 datadog, prometheus에 기록
  turn_off_message_logging: boolean  # 메시지와 응답이 callback에 기록되지 않게 합니다. 요청 metadata는 계속 기록됩니다. 민감 데이터 처리 시 개인정보 보호/규정 준수에 유용합니다.
  redact_user_api_key_info: boolean  # log에서 user API key 정보(hashed token, user_id, team id 등)를 마스킹합니다. 현재 Langfuse, OpenTelemetry, Logfire, ArizeAI logging을 지원합니다.
  langfuse_default_tags: ["cache_hit", "cache_key", "proxy_base_url", "user_api_key_alias", "user_api_key_user_id", "user_api_key_user_email", "user_api_key_team_alias", "semantic-similarity", "proxy_base_url"] # Langfuse Logging 기본 tag
  # 네트워크 설정
  request_timeout: 10 # (int) LLM request timeout(초). 호출이 10초보다 오래 걸리면 Timeout error를 발생시킵니다. litellm.request_timeout을 설정합니다.
  force_ipv4: boolean # true이면 litellm이 모든 LLM request에 ipv4를 강제합니다. 일부 사용자는 ipv6 + Anthropic API 사용 시 httpx ConnectionError를 경험했습니다.

  # 비용 추적 설정
  cost_discount_config:
    vertex_ai: 0.05 # Vertex AI cost에 5% discount 적용
    gemini: 0.05 # Gemini cost에 5% discount 적용
  cost_margin_config:
    global: 0.05 # 모든 provider에 5% margin 적용
    openai: 0.10 # OpenAI cost에 10% margin 적용
  
  # 디버깅 - 추가 옵션은 debugging 문서를 참고하세요
  # `--debug` 또는 `--detailed_debug` CLI flag를 사용하거나 LITELLM_LOG env var를 "INFO", "DEBUG", "ERROR" 중 하나로 설정하세요
  json_logs: boolean # true이면 log가 JSON format으로 기록됩니다

  # Fallback과 reliability
  default_fallbacks: ["claude-opus"] # 특정 model group이 잘못 구성되었거나 문제가 있을 때 사용할 default_fallbacks 설정
  content_policy_fallbacks: [{ "gpt-3.5-turbo-small": ["claude-opus"] }] # ContentPolicyErrors용 fallback
  context_window_fallbacks: [{ "gpt-3.5-turbo-small": ["gpt-3.5-turbo-large", "claude-opus"] }] # ContextWindowExceededErrors용 fallback

  # MCP Aliases - 더 쉬운 tool 접근을 위해 alias를 MCP server name에 매핑
  mcp_aliases: {
      "github": "github_mcp_server",
      "zapier": "zapier_mcp_server",
      "deepwiki": "deepwiki_mcp_server",
    } # 사람이 읽기 쉬운 alias를 MCP server name에 매핑합니다. 각 server의 첫 번째 alias만 사용됩니다.

  # Caching 설정
  cache: true
  cache_params: # redis용 cache param 설정
    type: redis # 초기화할 cache type(options: "local", "redis", "s3", "gcs")

    # 선택 사항 - Redis 설정
    host: "localhost" # Redis cache host address. type이 "redis"이면 필요합니다.
    port: 6379 # Redis cache port number. type이 "redis"이면 필요합니다.
    password: "your_password" # Redis cache password. type이 "redis"이면 필요합니다.
    namespace: "litellm.caching.caching" # redis cache namespace
    max_connections: 100  # [선택 사항] Redis connection 최대 수입니다. redis-py로 직접 전달됩니다.
    # 선택 사항 - Redis Cluster 설정
    redis_startup_nodes: [{ "host": "127.0.0.1", "port": "7001" }]

    # 선택 사항 - Redis Sentinel 설정
    service_name: "mymaster"
    sentinel_nodes: [["localhost", 26379]]

    # 선택 사항 - Redis용 GCP IAM Authentication
    gcp_service_account: "projects/-/serviceAccounts/your-sa@project.iam.gserviceaccount.com" # IAM authentication용 GCP service account
    gcp_ssl_ca_certs: "./server-ca.pem" # GCP Memorystore Redis용 SSL CA certificate file path
    ssl: true # secure connection을 위해 SSL 활성화
    ssl_cert_reqs: null # self-signed certificate에는 null로 설정
    ssl_check_hostname: false # self-signed certificate에는 false로 설정

    # 선택 사항 - Qdrant Semantic Cache 설정
    qdrant_semantic_cache_embedding_model: openai-embedding # model_list에 정의된 model이어야 합니다
    qdrant_collection_name: test_collection
    qdrant_quantization_config: binary
    qdrant_semantic_cache_vector_size: 1536 # vector size는 embedding model dimensionality와 일치해야 합니다
    similarity_threshold: 0.8 # semantic cache용 similarity threshold

    # 선택 사항 - S3 Cache 설정
    s3_bucket_name: cache-bucket-litellm # S3용 AWS Bucket Name
    s3_region_name: us-west-2 # S3용 AWS Region Name
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # 환경 변수를 전달하려면 os.environ/<variable name>을 사용합니다. S3용 AWS Access Key ID입니다.
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # S3용 AWS Secret Access Key
    s3_endpoint_url: https://s3.amazonaws.com # [선택 사항] Backblaze/cloudflare s3 bucket을 사용하려는 경우 S3 endpoint URL

    # 선택 사항 - GCS Cache 설정
    gcs_bucket_name: cache-bucket-litellm # caching용 GCS Bucket Name
    gcs_path_service_account: os.environ/GCS_PATH_SERVICE_ACCOUNT # GCS service account JSON file path
    gcs_path: cache/ # [선택 사항] cache object용 GCS path prefix

    # 공통 Cache 설정
    # 선택 사항 - caching을 지원할 call type
    supported_call_types:
      ["acompletion", "atext_completion", "aembedding", "atranscription"]
      # /chat/completions, /completions, /embeddings, /audio/transcriptions
    mode: default_off # default_off이면 call별로 caching을 opt in해야 합니다
    ttl: 600 # caching용 ttl
    disable_copilot_system_to_assistant: False # DEPRECATED - GitHub Copilot API는 system prompt를 지원합니다.

  # Virtual key auth cache - Redis를 통해 worker 간 API key / virtual-key auth를 공유합니다.
  # 새 worker 또는 pod에서 cache가 cold 상태일 때 DB round trip을 줄입니다.
  # 위의 litellm_settings.cache: true 및 cache_params.type: redis가 필요합니다.
  enable_redis_auth_cache: false

callback_settings:
  otel:
    message_logging: boolean # OTEL logging callback 전용 설정

general_settings:
  completion_model: string
  store_prompts_in_spend_logs: boolean
  forward_client_headers_to_llm_api: boolean
  disable_spend_logs: boolean  # 각 transaction을 DB에 쓰지 않습니다
  disable_master_key_return: boolean  # UI에서 master key 반환을 끕니다('/user/info' endpoint에서 확인)
  disable_retry_on_max_parallel_request_limit_error: boolean  # max parallel request limit에 도달했을 때 retry를 끕니다
  disable_reset_budget: boolean  # budget reset scheduled task를 끕니다
  disable_adding_master_key_hash_to_db: boolean  # spend tracking용 master key hash DB 저장을 끕니다
  disable_responses_id_security: boolean  # 사용자가 다른 사용자의 response에 접근하지 못하게 하는 response ID security check를 끕니다
  enable_jwt_auth: boolean  # claim에 'litellm_proxy_admin'이 있는 jwt token으로 proxy admin 인증을 허용합니다
  enforce_user_param: boolean  # 모든 openai endpoint request에 'user' param을 요구합니다
  reject_clientside_metadata_tags: boolean  # true이면 클라이언트 측 'metadata.tags'가 있는 request를 거부해 사용자가 budget에 영향을 주지 못하게 합니다
  allowed_routes: ["route1", "route2"]  # 사용자가 접근할 수 있는 proxy API route 목록입니다(현재 JWT-Auth 전용)
  key_management_system: google_kms  # google_kms 또는 azure_kms
  master_key: string
  maximum_spend_logs_retention_period: 30d # 삭제 전 spend log를 보관할 최대 시간입니다.
  maximum_spend_logs_retention_interval: 1d # spend log cleanup task가 실행될 interval입니다.
  user_mcp_management_mode: restricted  # or "view_all"

  # Database 설정
  database_url: string
  database_connection_pool_limit: 0  # default 10
  database_connection_timeout: 0  # default 60s
  allow_requests_on_db_unavailable: boolean  # true이면 Virtual Key 검증을 위해 DB에 연결할 수 없는 request도 동작하도록 허용합니다

  custom_auth: string
  max_parallel_requests: 0 # deployment별 허용되는 최대 parallel request 수
  global_max_parallel_requests: 0 # proxy 전체에서 허용되는 최대 parallel request 수
  infer_model_from_keys: true
  background_health_checks: true
  health_check_interval: 300
  alerting: ["slack", "email"]
  alerting_threshold: 0
  use_client_credentials_pass_through_routes: boolean  # "/vertex-ai", /bedrock/ 같은 모든 pass-through route에 client credential을 사용합니다. true이면 이 endpoint에는 Virtual Key auth가 적용되지 않습니다

router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle" - 성능상 권장
  redis_host: <your-redis-host>           # string
  redis_password: <your-redis-password>   # string
  redis_port: <your-redis-port>           # string
  enable_pre_call_checks: true            # bool - 호출 전 요청이 model context window 안에 있는지 확인
  allowed_fails: 3 # 1분 안에 1회보다 많이 실패하면 model cooldown
  cooldown_time: 30 # (초) fails/min > allowed_fails일 때 model cooldown 기간
  disable_cooldowns: True                  # bool - 모든 model cooldown 비활성화
  enable_tag_filtering: True                # bool - Use tag 기반 routing for requests
  tag_filtering_match_any: True             # bool - tag matching 동작(enable_tag_filtering=true일 때만). `true`: deployment가 요청 tag 중 하나라도 가지면 match; `false`: 모든 요청 tag를 가져야 match
  retry_policy: {                          # Dict[str, int]: exception type별 retry policy
    "AuthenticationErrorRetries": 3,
    "TimeoutErrorRetries": 3,
    "RateLimitErrorRetries": 3,
    "ContentPolicyViolationErrorRetries": 4,
    "InternalServerErrorRetries": 4
  }
  allowed_fails_policy: {
    "BadRequestErrorAllowedFails": 1000, # deployment cooldown 전 BadRequestError 1000회 허용
    "AuthenticationErrorAllowedFails": 10, # int 
    "TimeoutErrorAllowedFails": 12, # int 
    "RateLimitErrorAllowedFails": 10000, # int 
    "ContentPolicyViolationErrorAllowedFails": 15, # int 
    "InternalServerErrorAllowedFails": 20, # int 
  }
  content_policy_fallbacks=[{"claude-2": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: content policy violation용 fallback model
  fallbacks=[{"claude-2": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: 모든 error용 fallback model

```

### litellm_settings - 참조 {#litellm_settings---reference}

| 이름 | 타입 | 설명 |
|------|------|-------------|
| success_callback | 문자열 배열 | 성공 시 실행할 callback 목록입니다. [Proxy 로깅 callback 문서](logging), [메트릭 문서](prometheus) |
| failure_callback | 문자열 배열 | 실패 시 실행할 callback 목록입니다. [Proxy 로깅 callback 문서](logging), [메트릭 문서](prometheus) |
| callbacks | 문자열 배열 | 성공과 실패 모두에서 실행되는 callback 목록입니다. [Proxy 로깅 callback 문서](logging), [메트릭 문서](prometheus) |
| service_callbacks | 문자열 배열 | 시스템 상태 모니터링용 설정입니다. 지정한 서비스(예: datadog, prometheus)에 redis, postgres 실패를 로깅합니다. [메트릭 문서](prometheus) |
| turn_off_message_logging | boolean | `true`이면 메시지와 응답이 callback에 기록되지 않습니다. 요청 metadata는 계속 기록됩니다. 민감 데이터를 다룰 때 개인정보 보호와 규정 준수 용도로 유용합니다. [Proxy 로깅](logging) |
| modify_params | boolean | `true`이면 요청이 LLM provider로 전송되기 전에 요청 파라미터를 수정할 수 있습니다. |
| enable_preview_features | boolean | `true`이면 Azure O1 streaming 지원 같은 미리보기 기능을 활성화합니다. |
| LITELLM_DISABLE_STOP_SEQUENCE_LIMIT | stop sequence 제한 검증을 비활성화합니다. 기본 제한은 4입니다. |  
| redact_user_api_key_info | boolean | `true`이면 로그에서 사용자 API key 정보(hashed token, user_id, team id 등)를 마스킹합니다. [Proxy Logging](logging#redacting-userapikeyinfo) |
| mcp_aliases | object | 더 쉬운 도구 접근을 위해 alias를 MCP server 이름에 매핑합니다. 각 server의 첫 번째 alias만 사용됩니다. [MCP Aliases](../mcp#mcp-aliases) |
| langfuse_default_tags | 문자열 배열 | Langfuse Logging 기본 tag입니다. LiteLLM proxy가 어떤 LiteLLM 전용 필드를 tag로 기록할지 제어할 때 사용합니다. 기본적으로 LiteLLM Proxy는 LiteLLM 전용 필드를 tag로 기록하지 않습니다. [추가 문서](/docs/proxy/logging#litellm-specific-tags-on-langfuse---cache_hit-cache_key) |
| set_verbose | boolean | [사용 중단됨 - debugging 문서 참고](./debugging) 대신 `--debug`, `--detailed_debug` CLI flag를 사용하거나 `LITELLM_LOG` env var를 "INFO", "DEBUG", "ERROR" 중 하나로 설정하세요. |
| json_logs | boolean | `true`이면 로그가 JSON 형식으로 기록됩니다. 로그를 JSON으로 저장해야 한다면 `litellm.json_logs = True`를 설정하세요. 현재는 litellm의 raw POST request를 JSON으로 로깅합니다. [추가 문서](./debugging) |
| default_fallbacks | 문자열 배열 | 특정 model group이 잘못 구성되었거나 실패할 때 사용할 fallback model 목록입니다. [추가 문서](/docs/proxy/reliability#default-fallbacks) |
| request_timeout | integer | 요청 timeout(초)입니다. 설정하지 않으면 기본값은 `6000 seconds`입니다. [참고로 OpenAI Python SDK 기본값은 `600 seconds`입니다.](https://github.com/openai/openai-python/blob/main/src/openai/_constants.py) |
| force_ipv4 | boolean | `true`이면 litellm이 모든 LLM 요청에 ipv4를 강제합니다. 일부 사용자는 ipv6와 Anthropic API 조합에서 httpx ConnectionError를 경험했습니다. |
| content_policy_fallbacks | array of objects | ContentPolicyViolationError 발생 시 사용할 fallback입니다. [추가 문서](./reliability#content-policy-fallbacks) |
| context_window_fallbacks | array of objects | ContextWindowExceededError 발생 시 사용할 fallback입니다. [추가 문서](./reliability#context-window-fallbacks) |
| cache | boolean | `true`이면 caching을 활성화합니다. [추가 문서](./caching) |
| cache_params | object | cache 파라미터입니다. [추가 문서](/docs/proxy/caching#supported-cache_params-on-proxy-configyaml) |
| enable_redis_auth_cache | boolean | `true`이면 virtual-key auth payload를 Redis(response caching과 같은 client)에 저장해 모든 worker/pod가 cached auth lookup을 공유합니다. cache miss 시 반복 데이터베이스 read가 줄어듭니다. **`cache: true`와 `cache_params.type: redis`가 필요합니다**(Redis 또는 Redis Cluster). 선택 사항으로 `general_settings.user_api_key_cache_ttl`을 설정하면 memory와 Redis에 TTL이 일관되게 적용됩니다. [추가 문서](./caching#virtual-key-authentication-cache-redis) |
| disable_end_user_cost_tracking | boolean | `true`이면 proxy에서 Prometheus metrics와 litellm spend logs table의 최종 사용자 비용 추적을 끕니다. |
| enable_end_user_cost_tracking_prometheus_only | boolean | `true`이면 Prometheus metrics에 `end_user` label을 포함합니다. Prometheus cardinality를 제한하기 위해 기본값은 비활성화입니다. [추가 문서](/docs/proxy/prometheus#tracking-end_user-on-prometheus) |
| cost_discount_config | object | cost 계산에 적용할 provider별 percentage discount입니다. `litellm_settings` 아래에 구성합니다. [추가 문서](./provider_discounts) |
| cost_margin_config | object | cost 계산에 적용할 provider별 또는 global percentage/fixed margin입니다. `litellm_settings` 아래에 구성합니다. [추가 문서](./provider_margins) |
| key_generation_settings | object | key를 생성할 수 있는 주체를 제한합니다. [추가 문서](./virtual_keys.md#restricting-key-generation) |
| disable_add_transform_inline_image_block | boolean | Fireworks AI model용 설정입니다. `true`이면 model이 vision model이 아닐 때 image_url에 `#transform=inline`을 자동 추가하지 않습니다. |
| use_chat_completions_url_for_anthropic_messages | boolean | `true`이면 OpenAI `/v1/messages` 요청을 Responses API 대신 chat/completions로 라우팅합니다. `LITELLM_USE_CHAT_COMPLETIONS_URL_FOR_ANTHROPIC_MESSAGES=true` env var로도 설정할 수 있습니다. |
| route_all_chat_openai_to_responses | boolean | `true`이면 모든 OpenAI `/chat/completions` 요청을 Responses API bridge로 라우팅합니다. OpenAI model에는 권장됩니다. `LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES=true` env var로도 설정할 수 있습니다. |
| skip_system_message_in_guardrail | boolean | `true`이면 unified guardrail이 **chat completions**와 **Anthropic `/v1/messages`**에서만 스캔 입력의 `role: system`을 생략합니다. LLM에는 전체 메시지가 계속 전달됩니다. guardrail별 override는 각 guardrail의 `litellm_params.skip_system_message_in_guardrail`로 설정합니다. [가드레일 quick start](/docs/proxy/guardrails/quick_start#skip-system-messages-in-guardrail-evaluation) |
| disable_hf_tokenizer_download | boolean | `true`이면 모든 model(huggingface model 포함)에 openai tokenizer를 기본으로 사용합니다. |
| enable_json_schema_validation | boolean | `true`이면 모든 요청에 json schema validation을 활성화합니다. |
| enable_key_alias_format_validation | boolean | `true`이면 `/key/generate`와 `/key/update`에서 `key_alias` 형식을 검증합니다. 2-255자, 시작/끝은 alphanumeric, 허용 문자는 `a-zA-Z0-9_-/.@`입니다. 기본값은 `false`입니다. |
| user_url_validation | boolean | 기본값은 `true`입니다. `true`이면 proxy가 fetch 전에 사용자 제어 URL(예: `http(s)` URL인 OpenAPI `spec_path`, image URL 등)을 검증합니다. DNS를 확인하고, URL의 **hostname**이 `user_url_allowed_hosts`에 없으면 RFC1918, loopback, link-local 등 globally-routable이 아닌 주소 연결을 차단합니다. URL 제공자를 신뢰할 수 있을 때만 `false`로 설정해 검증을 건너뜁니다. **`general_settings`가 아니라 `litellm_settings` 아래에 설정해야 합니다.** |
| user_url_allowed_hosts | 문자열 배열 | `user_url_validation`이 `true`일 때 private/internal IP로 resolve될 수 있는 hostname 목록입니다. host는 **URL에 나타난 그대로** 맞춰야 합니다(예: `api.corp.internal`, `127.0.0.1`, `127.0.0.1:8080`, `[::1]:443`). split-horizon DNS에서는 resolved `10.x` 주소가 아니라 public hostname을 allowlist에 넣습니다. **`general_settings`가 아니라 `litellm_settings` 아래에 설정해야 합니다.** [MCP from OpenAPI](../mcp_openapi#internal-spec-urls-ssrf)를 참고하세요. |
| disable_copilot_system_to_assistant | boolean | **DEPRECATED** - GitHub Copilot API는 system prompt를 지원합니다. |
| default_team_params | object | `/team/new`로 생성되는 모든 새 team(SSO로 자동 생성되는 team 포함)에 적용할 기본 파라미터입니다. 요청에서 명시하지 않은 필드만 채웁니다. 하위 필드: `max_budget`(float), `budget_duration`(string, 예: `"30d"`), `tpm_limit`(integer), `rpm_limit`(integer), `team_member_permissions`(문자열 배열, 예: `["/team/daily/activity", "/key/generate"]`), `models`(문자열 배열 - SSO 자동 생성 team에만 적용). |

### general_settings - 참조 {#general_settings---reference}

| 이름 | 타입 | 설명 |
|------|------|-------------|
| completion_model | string | 모든 completion에 사용할 model입니다. 요청에 지정된 `model`을 override합니다. |
| disable_spend_logs | boolean | `true`이면 각 transaction을 데이터베이스에 기록하지 않습니다. |
| disable_spend_updates | boolean | `true`이면 key/user/team spend update를 포함해 모든 spend update를 DB에 쓰지 않습니다. |
| disable_master_key_return | boolean | `true`이면 UI에서 master key를 반환하지 않습니다. (`/user/info` endpoint에서 확인) |
| disable_retry_on_max_parallel_request_limit_error | boolean | `true`이면 max parallel request limit에 도달했을 때 retry를 끕니다. |
| disable_reset_budget | boolean | `true`이면 budget reset scheduled task를 끕니다. |
| disable_adding_master_key_hash_to_db | boolean | `true`이면 master key hash를 db에 저장하지 않습니다. |
| disable_responses_id_security | boolean | `true`이면 사용자가 다른 사용자의 response ID에 접근하지 못하게 하는 response ID security check를 비활성화합니다. `false`(기본값)이면 response ID가 사용자 정보로 암호화되어 사용자가 자신의 response에만 접근할 수 있습니다. `/v1/responses` endpoint에 적용됩니다. |
| enable_jwt_auth | boolean | claim에 `litellm_proxy_admin`이 있는 jwt token으로 proxy admin 인증을 허용합니다. [JWT Tokens 문서](token_auth) |
| enforce_user_param | boolean | `true`이면 모든 OpenAI endpoint 요청에 `user` param이 필요합니다. [call hook 문서](call_hooks) |
| reject_clientside_metadata_tags | boolean | `true`이면 클라이언트 측 `metadata.tags`가 포함된 요청을 거부해 사용자가 tag를 바꿔 budget에 영향을 주지 못하게 합니다. tag는 API key metadata에서만 상속될 수 있습니다. |
| allowed_routes | 문자열 배열 | 사용자가 접근할 수 있는 proxy API route 목록입니다. [allowed route 제어 문서](enterprise#control-available-public-private-routes) |
| key_management_system | string | key management system을 지정합니다. [Secret Managers 문서](../secret) |
| master_key | string | proxy의 master key입니다. [가상 키 설정](virtual_keys) |
| database_url | string | 데이터베이스 연결 URL입니다. [가상 키 설정](virtual_keys) |
| database_connection_pool_limit | integer | 데이터베이스 연결 pool limit입니다. [DB Connection Pool limit 설정](#configure-db-pool-limits--connection-timeouts) |
| database_connection_timeout | integer | 데이터베이스 연결 timeout(초)입니다. [DB Connection Pool limit/timeout 설정](#configure-db-pool-limits--connection-timeouts) |
| allow_requests_on_db_unavailable | boolean | `true`이면 DB에 도달할 수 없어도 요청 성공을 허용합니다. **LiteLLM을 VPC에서 실행할 때만 사용하세요.** LiteLLM이 DB에 연결해 Virtual Key를 검증할 수 없을 때도 요청이 동작할 수 있습니다. [DB unavailable graceful handling 문서](/docs/proxy/prod#5-if-running-litellm-on-vpc-gracefully-handle-db-unavailability) |
| custom_auth | string | 직접 작성한 사용자 정의 인증 logic입니다. [Custom Auth 문서](virtual_keys#custom-auth) |
| max_parallel_requests | integer | deployment별 허용되는 최대 parallel request 수입니다. |
| global_max_parallel_requests | integer | proxy 전체에서 허용되는 최대 parallel request 수입니다. |
| infer_model_from_keys | boolean | `true`이면 제공된 key에서 model을 추론합니다. |
| background_health_checks | boolean | `true`이면 백그라운드 health check를 활성화합니다. [health check 문서](health) |
| health_check_interval | integer | health check 간격(초)입니다. [health check 문서](health) |
| alerting | 문자열 배열 | alerting method 목록입니다. [Slack Alerting 문서](alerting) |
| alerting_threshold | integer | alert 발생 임계값입니다. [Slack Alerting 문서](alerting) |
| use_client_credentials_pass_through_routes | boolean | `true`이면 모든 pass-through route에 client credential을 사용합니다. [pass-through route 문서](pass_through) |
| health_check_details | boolean | `false`이면 남은 rate limit 같은 health check detail을 숨깁니다. [health check 문서](health) |
| public_routes | List[str] | (엔터프라이즈 Feature) public route 목록을 제어합니다. |
| alert_types | List[str] | Slack으로 보낼 alert type 목록을 제어합니다. [alert type 문서](./alerting.md) |
| enforced_params | List[str] | (엔터프라이즈 Feature) proxy로 들어오는 모든 요청에 포함되어야 하는 param 목록입니다. |
| enable_oauth2_auth | boolean | (엔터프라이즈 Feature) `true`이면 LLM + info route에 oauth2.0 authentication을 활성화합니다. |
| use_x_forwarded_for | str | `true`이면 `X-Forwarded-For` header를 사용해 client IP 주소를 가져옵니다. |
| service_account_settings | List[Dict[str, Any]] | service account key에만 적용되는 설정을 만들려면 `service_account_settings`를 설정합니다. [service account 문서](./service_accounts.md) | 
| image_generation_model | str | image generation에 사용할 기본 model입니다. 요청에 설정된 model은 무시합니다. |
| store_model_in_db | boolean | `true`이면 model과 credential 정보를 DB에 저장합니다. |
| supported_db_objects | List[str] | `store_model_in_db`가 True일 때 데이터베이스에서 load할 object type을 세밀하게 제어합니다. 사용 가능한 type은 `"models"`, `"mcp"`, `"guardrails"`, `"vector_stores"`, `"pass_through_endpoints"`, `"prompts"`, `"model_cost_map"`입니다. 설정하지 않으면 모든 object type을 load합니다(기본 동작). 예: `supported_db_objects: ["mcp"]`는 DB에서 MCP server만 load합니다. |
| user_mcp_management_mode | string | non-admin이 MCP dashboard에서 볼 수 있는 항목을 제어합니다. `restricted`(기본값)는 사용자의 team이 명시적으로 접근 허용된 MCP server만 표시합니다. `view_all`은 모든 사용자에게 전체 MCP server 목록을 보여줍니다. tool list/call은 항상 key별 권한을 따르므로, 접근 권한이 없으면 MCP call은 실행할 수 없습니다. |
| store_prompts_in_spend_logs | boolean | `true`이면 prompt와 response를 spend logs table에 저장할 수 있습니다. |
| max_request_size_mb | int | 요청 최대 크기(MB)입니다. 이 크기를 넘는 요청은 거부됩니다. |
| max_response_size_mb | int | 응답 최대 크기(MB)입니다. 이 크기를 넘는 LLM Response는 전송되지 않습니다. |
| proxy_budget_rescheduler_min_time | int | budget reset 확인을 위해 db를 조회하기 전 대기하는 최소 시간(초)입니다. **기본값은 597 seconds입니다.** |
| proxy_budget_rescheduler_max_time | int | budget reset 확인을 위해 db를 조회하기 전 대기하는 최대 시간(초)입니다. **기본값은 605 seconds입니다.** |
| proxy_batch_write_at | int | spend log를 db에 batch write하기 전 대기 시간(초)입니다. **기본값은 10 seconds입니다.** |
| proxy_batch_polling_interval | int | batch 완료 여부를 확인하기 위해 polling하기 전 대기 시간(초)입니다. **기본값은 6000 seconds(1 hour)입니다.** |
| alerting_args | dict | Slack Alerting 인자입니다. [Slack Alerting 문서](./alerting.md) |
| custom_key_generate | str | key generation용 custom function입니다. [사용자 정의 key generation 문서](./virtual_keys.md#custom--key-generate) |
| allowed_ips | List[str] | proxy 접근을 허용할 IP 목록입니다. 설정하지 않으면 모든 IP가 허용됩니다. |
| embedding_model | str | embedding에 사용할 기본 model입니다. 요청에 설정된 model은 무시합니다. |
| default_team_disabled | boolean | `true`이면 사용자가 team_id 없는 `personal` key를 만들 수 없습니다. |
| alert_to_webhook_url | Dict[str] | [각 alert type별 webhook URL을 지정합니다.](/docs/proxy/alerting#set-specific-slack-channels-per-alert-type) |
| key_management_settings | List[Dict[str, Any]] | key management system 설정입니다(예: AWS KMS, Azure Key Vault). [key management 문서](../secret.md) |
| allow_user_auth | boolean | (Deprecated) user authentication의 이전 방식입니다. |
| user_api_key_cache_ttl | int | user api key를 memory에 cache할 시간(초)입니다. |
| disable_prisma_schema_update | boolean | `true`이면 DB 자동 schema update를 끕니다. |
| litellm_key_header_name | str | 설정하면 LiteLLM key를 custom header로 전달할 수 있습니다. [custom header 문서](./virtual_keys.md#custom-headers) |
| moderation_model | str | moderation에 사용할 기본 model입니다. |
| custom_sso | str | custom SSO logic을 구현하는 python file 경로입니다. [custom SSO 문서](./custom_sso.md) |
| allow_client_side_credentials | boolean | `true`이면 클라이언트 측 credential을 proxy로 전달할 수 있습니다. finetuning model 테스트에 유용합니다. [클라이언트 측 credential 문서](./virtual_keys.md#클라이언트 측-credentials) |
| admin_only_routes | List[str] | (엔터프라이즈 Feature) admin 사용자만 접근할 수 있는 route 목록입니다. [admin only route 문서](./enterprise#control-available-public-private-routes) |
| use_azure_key_vault | boolean | `true`이면 azure key vault에서 key를 load합니다. | 
| use_google_kms | boolean | `true`이면 google kms에서 key를 load합니다. |
| spend_report_frequency | str | Spend Report를 보낼 주기를 지정합니다(예: `"1d"`, `"2d"`, `"30d"`). [관련 문서](./alerting.md#spend-report-frequency) |
| ui_access_mode | Literal["admin_only"] | 설정하면 admin 사용자만 UI에 접근할 수 있습니다. [문서](./ui.md#restrict-ui-access) |
| litellm_jwtauth | Dict[str, Any] | JWT authentication 설정입니다. [문서](./token_auth.md) |
| litellm_license | str | proxy license key입니다. [문서](/docs/enterprise#how-does-deployment-with-enterprise-license-work) |
| oauth2_config_mappings | Dict[str, str] | OAuth2 config mapping을 정의합니다. | 
| pass_through_endpoints | List[Dict[str, Any]] | pass-through endpoint를 정의합니다. [문서](./pass_through) |
| enable_oauth2_proxy_auth | boolean | (엔터프라이즈 Feature) `true`이면 oauth2.0 authentication을 활성화합니다. |
| forward_openai_org_id | boolean | `true`이면 backend LLM call이 OpenAI일 때 OpenAI Organization ID를 전달합니다. |
| forward_client_headers_to_llm_api | boolean | `true`이면 client header(`x-` header와 `anthropic-beta` header)를 backend LLM call로 전달합니다. |
| maximum_spend_logs_retention_period               | str                   | spend log가 auto-purge되기 전 db에 보관되는 최대 시간을 설정합니다. |
| maximum_spend_logs_retention_interval             | str                   | spend log cleanup task가 실행될 간격을 설정합니다. |
| alert_type_config | dict | alert type을 handler 설정에 매핑하는 설정입니다. |
| always_include_stream_usage | boolean | `true`이면 모든 streaming response chunk에 usage metrics를 포함합니다. |
| auto_redirect_ui_login_to_sso | boolean | `true`이면 UI login page를 SSO provider로 자동 redirect합니다. |
| control_plane_url | string | instance 간 state 공유을 위한 control plane URL입니다. |
| custom_auth_run_common_checks | boolean | `true`이면 custom auth handler와 함께 표준 auth validation check를 실행합니다. |
| custom_ui_sso_sign_in_handler | string | UI의 SSO sign-in logic용 custom handler입니다. |
| database_connection_pool_timeout | integer | 데이터베이스 연결 pool timeout(초)입니다. |
| disable_error_logs | boolean | `true`이면 데이터베이스의 error tracking 및 storage를 억제합니다. |
| enable_health_check_routing | boolean | `true`이면 unhealthy deployment로 라우팅하지 않도록 health check 기반 request routing을 활성화합니다. |
| health_check_ignore_transient_errors | boolean | `true`이면 429(rate limit)와 408(timeout) health check 실패를 무시해 routing이나 cooldown에 영향을 주지 않게 합니다. |
| enable_mcp_registry | boolean | `true`이면 centralized MCP server registry 접근을 활성화합니다. |
| enforce_rbac | boolean | `true`이면 모든 proxy operation에 role-based access control(RBAC)을 활성화합니다. |
| forward_llm_provider_auth_headers | boolean | `true`이면 provider별 auth header를 LLM API call로 전달합니다. |
| health_check_concurrency | integer | 동시에 실행할 수 있는 health check operation의 최대 수입니다. |
| health_check_staleness_threshold | integer | health check result가 stale로 표시되기 전 최대 age(초)입니다. |
| maximum_spend_logs_cleanup_cron | string | 자동 spend log cleanup task scheduling용 cron expression입니다. |
| mcp_client_side_auth_header_name | string | 클라이언트 측 MCP server credential용 HTTP header 이름입니다. |
| mcp_internal_ip_ranges | list | non-public MCP server access control에서 internal로 간주할 CIDR range입니다. |
| mcp_required_fields | list | MCP server submission에 필요한 field name 목록입니다. |
| mcp_trusted_proxy_ranges | list | MCP용 `X-Forwarded-For` header 전달을 신뢰할 proxy CIDR 범위입니다. |
| require_end_user_mcp_access_defined | boolean | `true`이면 end user에게 명시적인 MCP access permission이 정의되어 있어야 합니다. |
| role_permissions | list | role-based permission configuration 목록입니다. |
| search_tools | list | web search capability를 활성화하기 위한 search tool configuration 목록입니다. |
| token_rate_limit_type | string | rate limit 계산 방식입니다. `"total"`, `"output"`, `"input"` token 중 하나입니다. |
| use_redis_transaction_buffer | boolean | `true`이면 데이터베이스 transaction을 쓰기 전에 Redis에 buffer합니다. |
| use_shared_health_check | boolean | `true`이면 여러 proxy instance에서 Redis-backed shared health check state를 사용합니다. |
| user_header_mappings | dict | lookup rule을 사용해 custom request header를 user ID에 매핑합니다. |
| user_header_name | string | 요청에서 user identity를 추출할 HTTP header 이름입니다. |

### router_settings - 참조 {#router_settings---reference}

:::info

대부분의 값은 `litellm_settings`로도 설정할 수 있습니다. 겹치는 값이 있으면
`router_settings`의 설정이 `litellm_settings`의 값을 override합니다. :::

```yaml
router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle" - 성능상 권장
  redis_host: <your-redis-host>           # string
  redis_password: <your-redis-password>   # string
  redis_port: <your-redis-port>           # string
  enable_pre_call_checks: true            # bool - 호출 전 요청이 model context window 안에 있는지 확인
  allowed_fails: 3 # 1분 안에 1회보다 많이 실패하면 model cooldown
  cooldown_time: 30 # (초) fails/min > allowed_fails일 때 model cooldown 기간
  disable_cooldowns: True                  # bool - 모든 model cooldown 비활성화
  enable_tag_filtering: True                # bool - Use tag 기반 routing for requests
  tag_filtering_match_any: True             # bool - tag matching 동작(enable_tag_filtering=true일 때만). `true`: deployment가 요청 tag 중 하나라도 가지면 match; `false`: 모든 요청 tag를 가져야 match
  retry_policy: {                          # Dict[str, int]: exception type별 retry policy
    "AuthenticationErrorRetries": 3,
    "TimeoutErrorRetries": 3,
    "RateLimitErrorRetries": 3,
    "ContentPolicyViolationErrorRetries": 4,
    "InternalServerErrorRetries": 4
  }
  allowed_fails_policy: {
    "BadRequestErrorAllowedFails": 1000, # deployment cooldown 전 BadRequestError 1000회 허용
    "AuthenticationErrorAllowedFails": 10, # int
    "TimeoutErrorAllowedFails": 12, # int
    "RateLimitErrorAllowedFails": 10000, # int
    "ContentPolicyViolationErrorAllowedFails": 15, # int
    "InternalServerErrorAllowedFails": 20, # int
  }
  content_policy_fallbacks=[{"claude-2": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: content policy violation용 fallback model
  fallbacks=[{"claude-2": ["my-fallback-model"]}] # List[Dict[str, List[str]]]: 모든 error용 fallback model
```

| 이름 | 타입 | 설명 |
|------|------|-------------|
| routing_strategy | string | 요청 라우팅에 사용할 strategy입니다. 옵션: "simple-shuffle", "least-busy", "usage-based-routing", "latency-based-routing". 기본값은 "simple-shuffle"입니다. [추가 정보](../routing) |
| redis_host | string | Redis server host 주소입니다. **LiteLLM Proxy 인스턴스가 여러 개이고 현재 tpm/rpm 추적을 인스턴스 간 공유하려는 경우에만 설정하세요.** |
| redis_password | string | Redis server password입니다. **LiteLLM Proxy 인스턴스가 여러 개이고 현재 tpm/rpm 추적을 인스턴스 간 공유하려는 경우에만 설정하세요.** |
| redis_port | string | Redis server port 번호입니다. **LiteLLM Proxy 인스턴스가 여러 개이고 현재 tpm/rpm 추적을 인스턴스 간 공유하려는 경우에만 설정하세요.** |
| redis_db | int | Redis server 데이터베이스 number입니다. **LiteLLM Proxy 인스턴스가 여러 개이고 현재 tpm/rpm 추적을 인스턴스 간 공유하려는 경우에만 설정하세요.** |
| enable_pre_call_check | boolean | `true`이면 호출 실행 전에 요청이 model context window 안에 들어오는지 확인합니다. [추가 정보](reliability) |
| content_policy_fallbacks | array of objects | content policy violation에 사용할 fallback model을 지정합니다. [추가 정보](reliability) |
| fallbacks | array of objects | 모든 오류 유형에 사용할 fallback model을 지정합니다. [추가 정보](reliability) |
| enable_tag_filtering | boolean | `true`이면 request에 tag 기반 routing을 사용합니다. [Tag Based Routing](tag_routing) |
| tag_filtering_match_any | boolean | tag matching 동작입니다(`enable_tag_filtering=true`일 때만 적용). `true`: deployment가 요청 tag 중 하나라도 가지면 match, `false`: 모든 요청 tag를 가져야 match합니다. |
| cooldown_time | integer | 허용 failure 수를 초과했을 때 model을 cooldown할 기간(초)입니다. |
| disable_cooldowns | boolean | `true`이면 모든 model의 cooldown을 비활성화합니다. [추가 정보](reliability) |
| retry_policy | object | exception type별 retry 횟수를 지정합니다. [추가 정보](reliability) |
| allowed_fails | integer | model cooldown 전 허용되는 failure 수입니다. [추가 정보](reliability) |
| allowed_fails_policy | object | deployment cooldown 전 오류 유형별 허용 failure 수를 지정합니다. [추가 정보](reliability) |
| default_max_parallel_requests | Optional[int] | deployment의 기본 최대 parallel request 수입니다. |
| default_priority | (Optional[int]) | request의 기본 priority입니다. `.scheduler_acompletion()`에서만 사용합니다. 기본값은 None입니다. | 
| polling_interval | (Optional[float]) | polling queue 빈도입니다. `.scheduler_acompletion()`에서만 사용합니다. 기본값은 3ms입니다. |
| max_fallbacks | Optional[int] | call 종료 전 시도할 최대 fallback 수입니다. 기본값은 5입니다. |
| default_litellm_params | Optional[dict] | 모든 request에 추가할 기본 litellm parameter입니다(예: `temperature`, `max_tokens`). |
| timeout | Optional[float] | request 기본 timeout입니다. 기본값은 10 minutes입니다. |
| stream_timeout | Optional[float] | streaming request의 기본 timeout입니다. 설정하지 않으면 `timeout` 값을 사용합니다. |
| debug_level | Literal["DEBUG", "INFO"] | router logging library의 debug level입니다. 기본값은 "INFO"입니다. |
| client_ttl | int | cached client의 TTL(초)입니다. 기본값은 3600입니다. |
| cache_kwargs | dict | cache 초기화에 넘길 추가 keyword argument입니다. `REDIS_*` environment variable로 설정하면 실패할 수 있는 non-string Redis parameter에 사용합니다. |
| routing_strategy_args | dict | routing strategy에 넘길 추가 keyword argument입니다. 예: lowest latency routing 기본 TTL |
| model_group_alias | dict | model group alias mapping입니다. 예: `{"claude-3-haiku": "claude-3-haiku-20240229"}` |
| num_retries | int | request retry 횟수입니다. 기본값은 3입니다. |
| default_fallbacks | Optional[List[str]] | model group별 fallback이 정의되지 않았을 때 시도할 fallback입니다. |
| caching_groups | Optional[List[tuple]] | model group 간 caching에 사용할 model group 목록입니다. 기본값은 None입니다. 예: caching_groups=[("openai-gpt-3.5-turbo", "azure-gpt-3.5-turbo")] |
| alerting_config | AlertingConfig | [SDK-only arg] Slack alerting configuration입니다. 기본값은 None입니다. [추가 문서](../routing.md#alerting-) |
| assistants_config | AssistantsConfig | proxy에서는 `assistant_settings`로 설정합니다. [추가 문서](../assistants.md) |
| set_verbose | boolean | [DEPRECATED PARAM - debug 문서 참고](./debugging) `true`이면 logging level을 verbose로 설정합니다. |
| retry_after | int | request retry 전 대기 시간(초)입니다. 기본값은 0입니다. LLM API에서 `x-retry-after`를 받으면 이 값이 override됩니다. |
| provider_budget_config | ProviderBudgetConfig | provider budget configuration입니다. llm_provider 예산 한도를 설정할 때 사용합니다. 예: OpenAI에 $100/day, Azure에 $100/day 등. 기본값은 None입니다. [추가 문서](./provider_budget_routing.md) |
| enable_pre_call_checks | boolean | `true`이면 호출 실행 전에 요청이 model context window 안에 들어오는지 확인합니다. `model_info.max_input_tokens` enforcement에 **필수**입니다. 기본값: false. [추가 정보](reliability) |
| model_group_retry_policy | Dict[str, RetryPolicy] | [SDK-only arg] model group별 retry policy를 설정합니다. |
| context_window_fallbacks | List[Dict[str, List[str]]] | context window violation에 사용할 fallback model입니다. |
| redis_url | str | Redis server URL입니다. **Redis URL에는 알려진 performance issue가 있습니다.** |
| cache_responses | boolean | `router_settings` 아래에 cache가 설정된 경우 LLM 응답 caching을 활성화하는 flag입니다. `true`이면 response를 cache합니다. 기본값은 False입니다. |
| router_general_settings | RouterGeneralSettings | [SDK-Only] router general setting입니다. `async_only_mode` 같은 optimization을 포함합니다. [문서](../routing.md#router-general-settings) |
| optional_pre_call_checks | List[str] | router에 추가할 pre-call check 목록입니다. 지원 항목: `router_budget_limiting`, `prompt_caching`, `responses_api_deployment_check`, `encrypted_content_affinity`(LiteLLM >= 1.82.3 필요), `deployment_affinity`, `session_affinity`, `forward_client_headers_by_model_group` |
| deployment_affinity_ttl_seconds | int | `deployment_affinity`가 활성화될 때 user-key → deployment affinity mapping TTL(초)입니다(Router init / proxy startup에서 구성). 기본값은 `3600`(1 hour)입니다. |
| model_group_affinity_config | Dict[str, List[str]] | model group별 affinity flag입니다. key는 model group name이고 값은 활성화할 check 목록(`deployment_affinity`, `responses_api_deployment_check`, `session_affinity`)입니다. 목록에 없는 group은 global `optional_pre_call_checks`를 사용합니다. [문서](../response_api.md#per-model-group-affinity-configuration) |
| ignore_invalid_deployments | boolean | `true`이면 invalid deployment를 무시합니다. invalid model이 다른 model load를 막지 않도록 proxy 기본값은 True입니다. |
| search_tools | List[SearchToolTypedDict] | Search API integration용 search tool configuration 목록입니다. 각 tool은 search_tool_name과 search_provider, api_key, api_base 등을 포함한 litellm_params를 지정합니다. [추가 문서](../search/index.md) |
| guardrail_list | List[GuardrailTypedDict] | guardrail load balancing용 guardrail configuration 목록입니다. 같은 guardrail_name을 가진 여러 guardrail deployment 간 load balancing을 활성화합니다. [추가 문서](./guardrails/guardrail_load_balancing.md) |
| enable_health_check_routing | boolean | `true`이면 unhealthy deployment로 라우팅하지 않도록 health check 기반 deployment filtering을 활성화합니다. |
| health_check_staleness_threshold | integer | cached health check result가 stale로 표시되기 전 최대 age(초)입니다. |
| health_check_ignore_transient_errors | boolean | `true`이면 429(rate limit)와 408(timeout) health check 실패를 무시해 routing이나 cooldown에 영향을 주지 않게 합니다. |
| routing_groups | Optional[List[RoutingGroup]] | 각자 routing strategy를 적용하는 model group 목록입니다. 각 group은 `group_name`, `models`(request model과 matching할 model name 목록), `routing_strategy`, 선택적 `routing_strategy_args`를 가집니다. 기본값은 None입니다. |


### 환경 변수 - 참조 {#environment-variables---reference}

| 이름 | 설명 |
|------|-------------|
| ACTIONS_ID_TOKEN_REQUEST_TOKEN | GitHub Actions에서 ID를 요청하기 위한 token
| ACTIONS_ID_TOKEN_REQUEST_URL | GitHub Actions에서 ID token을 요청하는 URL입니다.
| AGENTOPS_ENVIRONMENT | AgentOps 로깅 integration의 environment입니다.
| AGENTOPS_API_KEY | AgentOps 로깅 integration용 API key입니다.
| AGENTOPS_SERVICE_NAME | AgentOps 로깅 integration용 service name입니다.
| AISPEND_ACCOUNT_ID | AI Spend account ID입니다.
| AISPEND_API_KEY | AI Spend API key입니다.
| AIOHTTP_CONNECTOR_LIMIT | aiohttp connector connection limit입니다. 0으로 설정하면 제한이 적용되지 않습니다. **기본값은 0입니다.**
| AIOHTTP_CONNECTOR_LIMIT_PER_HOST | aiohttp connector의 host별 connection limit입니다. 0으로 설정하면 제한이 적용되지 않습니다. **기본값은 0입니다.**
| AIOHTTP_KEEPALIVE_TIMEOUT | aiohttp connection keep-alive timeout(초)입니다. **기본값은 120입니다.**
| AIOHTTP_SO_KEEPALIVE | aiohttp socket에서 TCP `SO_KEEPALIVE`를 활성화해 idle provider connection이 NAT/load balancer에 의해 조용히 끊기기 전에 감지하고 정리합니다. **기본값은 False입니다.**
| AIOHTTP_TCP_KEEPCNT | connection을 dead로 간주하기 전 응답 없는 TCP keepalive probe 수입니다(`AIOHTTP_SO_KEEPALIVE=True`일 때 적용). **기본값은 5입니다.**
| AIOHTTP_TCP_KEEPIDLE | aiohttp TCP connection이 idle 상태로 유지된 뒤 keepalive probe를 보내기까지의 시간(초)입니다(`AIOHTTP_SO_KEEPALIVE=True`일 때 적용). **기본값은 60입니다.**
| AIOHTTP_TCP_KEEPINTVL | 연속 aiohttp TCP keepalive probe 사이의 시간(초)입니다(`AIOHTTP_SO_KEEPALIVE=True`일 때 적용). **기본값은 30입니다.**
| AIOHTTP_TRUST_ENV | aiohttp trust environment를 활성화하는 flag입니다. True로 설정하면 aiohttp가 HTTP(S)_PROXY env var를 따릅니다. **기본값은 False입니다.**
| AIOHTTP_TTL_DNS_CACHE | aiohttp DNS cache TTL(초)입니다. **기본값은 300입니다.**
| AKTO_GUARDRAIL_API_BASE | Akto Guardrail API base URL입니다(예: `http://localhost:9090`). Akto guardrail integration에서 사용됩니다.
| AKTO_API_KEY | Akto Guardrail service 인증용 API key입니다.
| ALLOWED_EMAIL_DOMAINS | 접근을 허용할 email domain 목록입니다.
| APSCHEDULER_COALESCE | job의 pending execution 여러 개를 하나로 합칠지 여부입니다. **기본값은 False입니다.**
| APSCHEDULER_MAX_INSTANCES | 각 job의 최대 concurrent instance 수입니다. **기본값은 1입니다.**
| APSCHEDULER_MISFIRE_GRACE_TIME | misfired job의 grace time(초)입니다. **기본값은 1입니다.**
| APSCHEDULER_REPLACE_EXISTING | 같은 ID의 기존 job을 교체할지 여부입니다. **기본값은 False입니다.**
| ARIZE_API_KEY | Arize platform integration용 API key입니다.
| ARIZE_SPACE_KEY | Arize platform space key입니다.
| ARGILLA_BATCH_SIZE | Argilla 로깅 batch size입니다.
| ARGILLA_API_KEY | Argilla platform API key입니다.
| ARGILLA_SAMPLING_RATE | Argilla 로깅 sampling rate입니다.
| ARGILLA_DATASET_NAME | Argilla 로깅 dataset name입니다.
| ARGILLA_BASE_URL | Argilla service base URL입니다.
| ATHINA_API_KEY | Athina service API key입니다.
| ATHINA_BASE_URL | Athina service base URL입니다. 기본값은 `https://log.athina.ai`입니다.
| AUTH_STRATEGY | authentication에 사용하는 strategy입니다(예: OAuth, API key).
| AUTO_REDIRECT_UI_LOGIN_TO_SSO | SSO가 구성된 경우 UI login page를 SSO로 자동 redirect하는 flag입니다. 기본값은 **false**입니다.
| AUDIO_SPEECH_CHUNK_SIZE | audio speech 처리 chunk size입니다. 기본값은 1024입니다.
| ANTHROPIC_API_KEY | Anthropic service API key입니다. 인증에 `x-api-key` header를 사용합니다.
| ANTHROPIC_AUTH_TOKEN | Anthropic service의 대체 auth token입니다. `x-api-key` 대신 `Authorization: Bearer` header를 사용합니다. `ANTHROPIC_API_KEY`가 설정되지 않았을 때 fallback으로 사용됩니다.
| ANTHROPIC_API_BASE | Anthropic API base URL입니다. 기본값은 https://api.anthropic.com 입니다.
| ANTHROPIC_BASE_URL | Anthropic API base URL 설정용 `ANTHROPIC_API_BASE` 대안입니다. `ANTHROPIC_API_BASE`가 설정되지 않았을 때 fallback으로 사용됩니다.
| ANTHROPIC_TOKEN_COUNTING_BETA_VERSION | Anthropic token counting API용 beta version header입니다. 기본값은 `token-counting-2024-11-01`입니다.
| AWS_ACCESS_KEY_ID | AWS service용 Access Key ID입니다.
| AWS_BATCH_ROLE_ARN | batch operation용 AWS IAM role ARN입니다.
| AWS_DEFAULT_REGION | AWS_REGION이 설정되지 않았을 때 service interaction에 사용할 기본 AWS region입니다.
| AWS_PROFILE_NAME | 사용할 AWS CLI profile name입니다.
| AWS_REGION | service interaction용 AWS region입니다. AWS_DEFAULT_REGION보다 우선합니다.
| AWS_REGION_NAME | service interaction용 기본 AWS region입니다.
| AWS_ROLE_ARN | authentication을 위해 assume할 AWS IAM role ARN입니다.
| AWS_ROLE_NAME | AWS IAM 사용용 role name입니다.
| AWS_S3_BUCKET_NAME | file operation용 AWS S3 bucket name입니다.
| AWS_S3_OUTPUT_BUCKET_NAME | batch operation용 AWS S3 output bucket name입니다.
| AWS_SECRET_ACCESS_KEY | AWS service용 Secret Access Key입니다.
| AWS_SESSION_NAME | AWS session name입니다.
| AWS_WEB_IDENTITY_TOKEN | AWS용 web identity token입니다.
| AWS_WEB_IDENTITY_TOKEN_FILE | AWS web identity token이 들어 있는 file path입니다.
| AZURE_API_VERSION | 사용 중인 Azure API version입니다.
| AZURE_AI_API_BASE | Azure AI service base URL입니다(예: Azure AI Anthropic).
| AZURE_AI_API_KEY | Azure AI service API key입니다(예: Azure AI Anthropic).
| AZURE_AUTHORITY_HOST | Azure authority host URL입니다.
| AZURE_CERTIFICATE_PASSWORD | Azure OpenAI certificate password입니다.
| AZURE_CLIENT_ID | Azure service client ID입니다.
| AZURE_CLIENT_SECRET | Azure service client secret입니다.
| AZURE_COMPUTER_USE_INPUT_COST_PER_1K_TOKENS | `Azure Computer Use service`의 1K token당 input 비용입니다.
| AZURE_COMPUTER_USE_OUTPUT_COST_PER_1K_TOKENS | `Azure Computer Use service`의 1K token당 output 비용입니다.
| AZURE_DEFAULT_RESPONSES_API_VERSION | 사용 중인 `Azure Default Responses API` 버전입니다. 기본값은 "preview"입니다.
| AZURE_DOCUMENT_INTELLIGENCE_API_VERSION | Azure Document Intelligence service API version입니다.
| AZURE_DOCUMENT_INTELLIGENCE_DEFAULT_DPI | Azure Document Intelligence service 기본 DPI(dots per inch) 설정입니다.
| AZURE_TENANT_ID | Azure Active Directory tenant ID입니다.
| AZURE_USERNAME | Azure service username입니다. 기본 username/password workflow에서 AZURE_PASSWORD와 함께 azure ad token용으로 사용합니다.
| AZURE_PASSWORD | Azure service password입니다. 기본 username/password workflow에서 AZURE_USERNAME과 함께 azure ad token용으로 사용합니다.
| AZURE_FEDERATED_TOKEN_FILE | Azure federated token file path입니다.
| AZURE_FILE_SEARCH_COST_PER_GB_PER_DAY | Azure File Search service의 GB/day cost입니다.
| AZURE_SCOPE | EntraID Auth에서 Azure service scope입니다. 기본값은 "https://cognitiveservices.azure.com/.default"입니다.
| AZURE_SENTINEL_DCR_IMMUTABLE_ID | Azure Sentinel logging용 Data Collection Rule immutable ID입니다.
| AZURE_SENTINEL_STREAM_NAME | Azure Sentinel logging stream name입니다.
| AZURE_SENTINEL_CLIENT_SECRET | Azure Sentinel authentication client secret입니다.
| AZURE_SENTINEL_ENDPOINT | Azure Sentinel logging endpoint입니다.
| AZURE_SENTINEL_TENANT_ID | Azure Sentinel authentication tenant ID입니다.
| AZURE_SENTINEL_CLIENT_ID | Azure Sentinel authentication client ID입니다.
| AZURE_KEY_VAULT_URI | Azure Key Vault URI입니다.
| AZURE_OPERATION_POLLING_TIMEOUT | Azure operation polling timeout(초)입니다.
| AZURE_STORAGE_ACCOUNT_KEY | Azure Blob Storage logging 인증에 사용할 Azure Storage Account Key입니다.
| AZURE_STORAGE_ACCOUNT_NAME | Azure Blob Storage logging에 사용할 Azure Storage Account name입니다.
| AZURE_STORAGE_FILE_SYSTEM | Azure Blob Storage logging에 사용할 Azure Storage File System name입니다. 일반적으로 Container name입니다.
| AZURE_STORAGE_TENANT_ID | Azure Blob Storage logging 인증에 사용할 Application Tenant ID입니다.
| AZURE_STORAGE_CLIENT_ID | Azure Blob Storage logging 인증에 사용할 Application Client ID입니다.
| AZURE_STORAGE_CLIENT_SECRET | Azure Blob Storage logging 인증에 사용할 Application Client Secret입니다.
| AZURE_VECTOR_STORE_COST_PER_GB_PER_DAY | Azure Vector Store service의 GB/day cost입니다.
| BACKGROUND_HEALTH_CHECK_MAX_TOKENS | model에 `health_check_max_tokens`가 없을 때 proxy 백그라운드 health check의 `max_tokens`에 사용할 선택적 global 기본값입니다. 설정하지 않으면 non-wildcard model의 기본값은 5입니다. 설정하면 wildcard route에도 적용됩니다. 기본값은 unset입니다.
| BACKGROUND_HEALTH_CHECK_MAX_TOKENS_REASONING | **non-wildcard** reasoning model(`supports_reasoning(model)=true`)에서 설정하면 `BACKGROUND_HEALTH_CHECK_MAX_TOKENS`보다 우선합니다. 설정하지 않으면 reasoning model은 `BACKGROUND_HEALTH_CHECK_MAX_TOKENS`(설정된 경우) 또는 기본 동작을 사용합니다. Wildcard route는 이를 무시합니다. 기본값은 unset입니다.
| BATCH_STATUS_POLL_INTERVAL_SECONDS | batch status polling 간격(초)입니다. 기본값은 3600(1 hour)입니다.
| BATCH_STATUS_POLL_MAX_ATTEMPTS | batch status polling 최대 시도 횟수입니다. 기본값은 24(24 hours)입니다.
| BEDROCK_MAX_POLICY_SIZE | Bedrock policy의 최대 크기입니다. 기본값은 75입니다.
| BEDROCK_MIN_THINKING_BUDGET_TOKENS | Bedrock reasoning model의 최소 thinking budget token 수입니다. `budget_tokens`가 이 값보다 낮으면 Bedrock은 400 error를 반환합니다. 더 낮은 값이 들어온 request는 이 최소값으로 clamp됩니다. 기본값은 1024입니다.
| BERRISPEND_ACCOUNT_ID | BerriSpend service account ID입니다.
| BRAINTRUST_API_KEY | Braintrust integration용 API key입니다.
| BRAINTRUST_API_BASE | Braintrust API base URL입니다. 기본값은 https://api.braintrustdata.com/v1 입니다.
| BRAINTRUST_MOCK | Braintrust integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 Braintrust API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| BRAINTRUST_MOCK_LATENCY_MS | mock mode가 활성화된 Braintrust API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| CACHED_STREAMING_CHUNK_DELAY | cached streaming chunk 지연 시간(초)입니다. 기본값은 0.02입니다.
| CHATGPT_API_BASE | ChatGPT API base URL입니다. 기본값은 https://chatgpt.com/backend-api/codex 입니다.
| CHATGPT_AUTH_FILE | ChatGPT authentication data file name입니다. 기본값은 "auth.json"입니다.
| CHATGPT_DEFAULT_INSTRUCTIONS | ChatGPT provider의 기본 system instructions입니다.
| CHATGPT_ORIGINATOR | ChatGPT API request용 originator identifier입니다. 기본값은 "codex_cli_rs"입니다.
| CHATGPT_TOKEN_DIR | ChatGPT authentication token을 저장할 directory입니다. 기본값은 "~/.config/litellm/chatgpt"입니다.
| CHATGPT_USER_AGENT | ChatGPT API request용 custom user agent string입니다.
| CHATGPT_USER_AGENT_SUFFIX | ChatGPT user agent string에 추가할 suffix입니다.
| CIRCLE_OIDC_TOKEN | CircleCI용 OpenID Connect token입니다.
| CIRCLE_OIDC_TOKEN_V2 | CircleCI용 OpenID Connect token version 2입니다.
| CLI_JWT_EXPIRATION_HOURS | CLI가 생성한 JWT token의 만료 시간(시간)입니다. 기본값은 24 hours입니다. `LITELLM_CLI_JWT_EXPIRATION_HOURS`로도 설정할 수 있습니다.
| CLOUDZERO_API_KEY | authentication용 CloudZero API key입니다.
| CLOUDZERO_CONNECTION_ID | data submission용 CloudZero connection ID입니다.
| CLOUDZERO_EXPORT_INTERVAL_MINUTES | CloudZero data export operation 간격(분)입니다.
| CLOUDZERO_MAX_FETCHED_DATA_RECORDS | CloudZero에서 fetch할 최대 data record 수입니다.
| CLOUDZERO_TIMEZONE | date handling용 timezone입니다. 기본값은 UTC입니다.
| CONFIG_FILE_PATH | configuration file path입니다.
| CYBERARK_ACCOUNT | secret management용 CyberArk account name입니다.
| CYBERARK_API_BASE | CyberArk API base URL입니다.
| CYBERARK_API_KEY | CyberArk secret management service API key입니다.
| CYBERARK_CLIENT_CERT | CyberArk authentication용 client certificate path입니다.
| CYBERARK_CLIENT_KEY | CyberArk authentication용 client key path입니다.
| CYBERARK_USERNAME | CyberArk authentication username입니다.
| CYBERARK_SSL_VERIFY | CyberArk SSL certificate verification을 활성화/비활성화하는 flag입니다. 기본값은 True입니다.
| CONFIDENT_API_KEY | DeepEval integration용 API key입니다.
| CUSTOM_TIKTOKEN_CACHE_DIR | Tiktoken cache용 custom directory입니다.
| CONFIDENT_API_KEY | Confident AI(Deepeval) Logging service용 API key입니다.
| COHERE_API_BASE | Cohere API base URL입니다. 기본값은 https://api.cohere.com 입니다.
| COMPETITOR_LLM_TEMPERATURE | competitor discovery에 사용하는 LLM의 temperature 설정입니다. 기본값은 0.3입니다.
| CURSOR_API_BASE | Cursor AI provider integration용 API base URL입니다. 기본값은 https://api.cursor.com 입니다.
| DATABASE_HOST | 데이터베이스 server hostname입니다.
| DATABASE_NAME | 데이터베이스 name입니다.
| DATABASE_PASSWORD | 데이터베이스 user password입니다.
| DATABASE_PORT | 데이터베이스 연결 port number입니다.
| DATABASE_SCHEMA | 데이터베이스에서 사용할 schema name입니다.
| DATABASE_URL | 데이터베이스 연결 URL입니다.
| DATABASE_URL_READ_REPLICA | 선택적 read-replica connection URL입니다. 설정하면 proxy는 read-only query(find_*, count, group_by, query_raw/_first)를 이 endpoint로 라우팅하고 write는 계속 `DATABASE_URL`을 사용합니다. reader/writer endpoint가 분리된 Aurora 스타일 cluster에 유용합니다. 설정하지 않으면 writer-only 동작으로 fallback합니다. `IAM_TOKEN_DB_AUTH=True`이면 reader IAM token도 writer와 함께 자동 refresh됩니다.
| DATABASE_USER | 데이터베이스 연결 username입니다.
| DATABASE_USERNAME | 데이터베이스 user의 alias입니다.
| DATABRICKS_API_BASE | Databricks API base URL입니다.
| DATABRICKS_API_KEY | Databricks API authentication용 API key(Personal Access Token)입니다.
| DATABRICKS_CLIENT_ID | Databricks OAuth M2M authentication용 client ID입니다(Service Principal application ID).
| DATABRICKS_CLIENT_SECRET | Databricks OAuth M2M authentication용 client secret입니다.
| DATABRICKS_USER_AGENT | Databricks API request용 custom user agent string입니다. partner telemetry attribution에 사용됩니다.
| DAYS_IN_A_MONTH | 계산에 사용할 한 달의 일수입니다. 기본값은 28입니다.
| DAYS_IN_A_WEEK | 계산에 사용할 한 주의 일수입니다. 기본값은 7입니다.
| DAYS_IN_A_YEAR | 계산에 사용할 1년의 일수입니다. 기본값은 365입니다.
| DYNAMOAI_API_KEY | DynamoAI 가드레일 service API key입니다.
| DYNAMOAI_API_BASE | DynamoAI API base URL입니다. 기본값은 https://api.dynamo.ai 입니다.
| DYNAMOAI_MODEL_ID | DynamoAI tracking/logging용 model ID입니다.
| DYNAMOAI_POLICY_IDS | 적용할 DynamoAI policy ID의 comma-separated 목록입니다.
| DD_BASE_URL | Datadog integration base URL입니다.
| DATADOG_BASE_URL | DD_BASE_URL의 대안인 Datadog integration base URL입니다.
| _DATADOG_BASE_URL | DD_BASE_URL의 대안인 Datadog integration base URL입니다.
| DD_AGENT_HOST | DataDog agent hostname 또는 IP입니다(예: "localhost"). 설정하면 log가 direct API 대신 agent로 전송됩니다.
| DD_AGENT_PORT | DataDog agent log intake port입니다. 기본값은 10518입니다.
| DD_API_KEY | Datadog integration용 API key입니다.
| DD_APP_KEY | Datadog Cost Management integration용 application key입니다. cost metrics에는 DD_API_KEY와 함께 필요합니다.
| DD_SITE | Datadog site URL입니다(예: datadoghq.com).
| DD_SOURCE | Datadog log source identifier입니다.
| DD_TRACER_STREAMING_CHUNK_YIELD_RESOURCE | streaming chunk yield의 Datadog tracing resource name입니다. 기본값은 "streaming.chunk.yield"입니다.
| DD_ENV | Datadog log environment identifier입니다. `datadog_llm_observability` callback에서만 지원됩니다.
| DD_SERVICE | Datadog log service identifier입니다. 기본값은 "litellm-server"입니다.
| DD_VERSION | Datadog log version identifier입니다. 기본값은 "unknown"입니다.
| DATADOG_MOCK | Datadog integration testing용 mock mode를 활성화합니다. true이면 실제 network call 없이 Datadog API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| DATADOG_MOCK_LATENCY_MS | mock mode가 활성화된 Datadog API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| DEBUG_OTEL | OpenTelemetry debug mode를 활성화합니다.
| DEFAULT_ALLOWED_FAILS | model cooldown 전 허용되는 최대 failure 수입니다. 기본값은 3입니다.
| DEFAULT_A2A_AGENT_TIMEOUT | `A2A(Agent-to-Agent)` 프로토콜 요청의 기본 timeout(초)입니다. 기본값은 6000입니다.
| DEFAULT_ACCESS_GROUP_CACHE_TTL | cached access group information의 TTL(초)입니다. 기본값은 600(10 minutes)입니다.
| DEFAULT_ANTHROPIC_CHAT_MAX_TOKENS | Anthropic chat completion의 기본 maximum token 수입니다. 기본값은 4096입니다.
| DEFAULT_BATCH_SIZE | operation 기본 batch size입니다. 기본값은 512입니다.
| DEFAULT_CHUNK_OVERLAP | RAG text splitter 기본 chunk overlap입니다. 기본값은 200입니다.
| DEFAULT_CHUNK_SIZE | RAG text splitter 기본 chunk size입니다. 기본값은 1000입니다.
| DEFAULT_CLIENT_DISCONNECT_CHECK_TIMEOUT_SECONDS | client disconnection 확인 timeout(초)입니다. 기본값은 1입니다.
| DEFAULT_COOLDOWN_TIME_SECONDS | failure 후 model cooldown 기간(초)입니다. 기본값은 5입니다.
| DEFAULT_CRON_JOB_LOCK_TTL_SECONDS | cron job lock TTL(초)입니다. 기본값은 60(1 minute)입니다.
| DEFAULT_DATAFORSEO_LOCATION_CODE | DataForSEO search API 기본 location code입니다. 기본값은 2250(France)입니다.
| DEFAULT_FAILURE_THRESHOLD_PERCENT | deployment cooldown을 적용할 failure threshold percentage입니다. 기본값은 0.5(50%)입니다.
| DEFAULT_FAILURE_THRESHOLD_MINIMUM_REQUESTS | error rate cooldown 적용 전 최소 request 수입니다. 첫 failure만으로 cooldown이 trigger되는 것을 방지합니다. 기본값은 5입니다.
| DEFAULT_FLUSH_INTERVAL_SECONDS | flush operation 기본 interval(초)입니다. 기본값은 5입니다.
| DEFAULT_HEALTH_CHECK_INTERVAL | health check 기본 interval(초)입니다. 기본값은 300(5 minutes)입니다.
| DEFAULT_HEALTH_CHECK_PROMPT | non-image model health check에 사용하는 기본 prompt입니다. 기본값은 "test from litellm"입니다.
| DEFAULT_IMAGE_HEIGHT | image 기본 height입니다. 기본값은 300입니다.
| DEFAULT_IMAGE_TOKEN_COUNT | image 기본 token count입니다. 기본값은 250입니다.
| DEFAULT_IMAGE_WIDTH | image 기본 width입니다. 기본값은 300입니다.
| DEFAULT_IN_MEMORY_TTL | in-memory cache 기본 TTL(초)입니다. 기본값은 5입니다.
| DEFAULT_MANAGEMENT_OBJECT_IN_MEMORY_CACHE_TTL | management object(User, Team, Key, Organization)의 memory cache 기본 TTL(초)입니다. 기본값은 60 seconds입니다.
| DEFAULT_MAX_LRU_CACHE_SIZE | LRU cache 기본 maximum size입니다. 기본값은 64입니다.
| DEFAULT_MAX_RECURSE_DEPTH | 기본 maximum recursion depth입니다. 기본값은 100입니다.
| DEFAULT_MAX_RECURSE_DEPTH_SENSITIVE_DATA_MASKER | sensitive data masker 기본 maximum recursion depth입니다. 기본값은 10입니다.
| DEFAULT_MAX_RETRIES | 기본 maximum retry attempt 수입니다. 기본값은 2입니다.
| DEFAULT_MAX_TOKENS | LLM call 기본 maximum token 수입니다. 기본값은 4096입니다.
| DEFAULT_MAX_TOKENS_FOR_TRITON | Triton model 기본 maximum token 수입니다. 기본값은 2000입니다.
| DEFAULT_MAX_REDIS_BATCH_CACHE_SIZE | redis batch cache 기본 maximum size입니다. 기본값은 1000입니다.
| DEFAULT_MCP_SEMANTIC_FILTER_EMBEDDING_MODEL | MCP semantic tool filtering용 기본 embedding model입니다. 기본값은 "text-embedding-3-small"입니다.
| DEFAULT_MCP_SEMANTIC_FILTER_SIMILARITY_THRESHOLD | MCP semantic tool filtering 기본 similarity threshold입니다. 기본값은 0.3입니다.
| DEFAULT_MCP_SEMANTIC_FILTER_TOP_K | MCP semantic tool filtering에서 반환할 기본 top result 수입니다. 기본값은 10입니다.
| MCP_NPM_CACHE_DIR | STDIO MCP server가 사용하는 npm cache directory입니다. container에서는 기본값(`~/.npm`)이 없거나 read-only일 수 있습니다. 기본값은 `/tmp/.npm_mcp_cache`입니다.
| LITELLM_MCP_CLIENT_TIMEOUT | MCP client connection timeout(초)입니다(stdio 및 HTTP/SSE transport). 기본값은 60입니다.
| LITELLM_MCP_TOOL_LISTING_TIMEOUT | MCP server에서 tool 목록을 가져오는 timeout(초)입니다. 기본값은 30입니다.
| LITELLM_MCP_METADATA_TIMEOUT | OAuth metadata fetching용 HTTP client timeout(초)입니다. 기본값은 10입니다.
| LITELLM_MCP_HEALTH_CHECK_TIMEOUT | MCP server health check timeout(초)입니다. 기본값은 10입니다.
| LITELLM_MCP_STDIO_EXTRA_COMMANDS | 기본 allowlist 외에 MCP stdio transport에서 허용할 추가 command basename의 comma-separated 목록입니다. 예제: `my-mcp-bin`. 기본값은 empty입니다.
| MCP_OAUTH2_TOKEN_CACHE_DEFAULT_TTL | MCP OAuth2 token cache의 기본 TTL(초)입니다. 기본값은 3600입니다.
| MCP_OAUTH2_TOKEN_CACHE_MAX_SIZE | MCP OAuth2 token cache의 최대 entry 수입니다. 기본값은 200입니다.
| MCP_OAUTH2_TOKEN_CACHE_MIN_TTL | MCP OAuth2 token cache의 최소 TTL(초)입니다. 기본값은 10입니다.
| MCP_OAUTH2_TOKEN_EXPIRY_BUFFER_SECONDS | cache TTL 계산 시 token expiry에서 차감할 시간(초)입니다. 기본값은 60입니다.
| MCP_PER_USER_TOKEN_DEFAULT_TTL | Redis에 저장되는 per-user MCP OAuth token의 기본 TTL(초)입니다. 기본값은 43200(12 hours)입니다.
| MCP_PER_USER_TOKEN_EXPIRY_BUFFER_SECONDS | Redis TTL 계산 시 per-user MCP OAuth token expiry에서 차감할 시간(초)입니다. 기본값은 60입니다.
| MCP_TOKEN_EXCHANGE_CACHE_MAX_SIZE | MCP OAuth2 token exchange cache의 최대 entry 수입니다. 기본값은 500입니다.
| DEFAULT_MOCK_RESPONSE_COMPLETION_TOKEN_COUNT | mock response completion의 기본 token count입니다. 기본값은 20입니다.
| DEFAULT_MOCK_RESPONSE_PROMPT_TOKEN_COUNT | mock response prompt의 기본 token count입니다. 기본값은 10입니다.
| DEFAULT_MODEL_CREATED_AT_TIME | model의 기본 creation timestamp입니다. 기본값은 1677610602입니다.
| DEFAULT_NUM_WORKERS_LITELLM_PROXY | `NUM_WORKERS`가 설정되지 않았을 때 LiteLLM proxy의 기본 worker 수입니다. 기본값은 1입니다. **사용 가능한 vCPU 수에 맞춰 NUM_WORKERS를 설정하는 것을 강력히 권장합니다**(예: `NUM_WORKERS=8` 또는 `--num_workers 8`).
| DEFAULT_PROMPT_INJECTION_SIMILARITY_THRESHOLD | prompt injection similarity 기본 threshold입니다. 기본값은 0.7입니다.
| DEFAULT_POLLING_INTERVAL | scheduler의 기본 polling interval(초)입니다. 기본값은 0.03입니다.
| DEFAULT_REASONING_EFFORT_DISABLE_THINKING_BUDGET | reasoning effort에서 thinking budget을 비활성화할 때의 기본값입니다. 기본값은 0입니다.
| DEFAULT_REASONING_EFFORT_HIGH_THINKING_BUDGET | high reasoning effort thinking budget 기본값입니다. 기본값은 4096입니다.
| DEFAULT_REASONING_EFFORT_LOW_THINKING_BUDGET | low reasoning effort thinking budget 기본값입니다. 기본값은 1024입니다.
| DEFAULT_REASONING_EFFORT_MAX_THINKING_BUDGET | `thinking.budget_tokens`를 사용하는 legacy Anthropic model(Claude 4.5 series + Haiku)의 기본 `max` reasoning effort thinking budget입니다. Claude 4.6/4.7에서는 `max` tier가 adaptive `output_config.effort=max`를 통해 라우팅되며 이 상수를 무시합니다. 기본값은 16384입니다.
| DEFAULT_REASONING_EFFORT_MEDIUM_THINKING_BUDGET | medium reasoning effort thinking budget 기본값입니다. 기본값은 2048입니다.
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET | minimal reasoning effort thinking budget 기본값입니다. 기본값은 512입니다.
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_FLASH | Gemini 2.5 Flash용 minimal reasoning effort thinking budget 기본값입니다. 기본값은 512입니다.
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_FLASH_LITE | Gemini 2.5 Flash Lite용 minimal reasoning effort thinking budget 기본값입니다. 기본값은 512입니다.
| DEFAULT_REASONING_EFFORT_MINIMAL_THINKING_BUDGET_GEMINI_2_5_PRO | Gemini 2.5 Pro용 minimal reasoning effort thinking budget 기본값입니다. 기본값은 512입니다.
| DEFAULT_REASONING_EFFORT_XHIGH_THINKING_BUDGET | `thinking.budget_tokens`를 사용하는 legacy Anthropic model의 기본 `xhigh` reasoning effort thinking budget입니다. low/medium/high의 1024 &rarr; 2048 &rarr; 4096 &rarr; 8192 2&times; progression을 따릅니다. Claude 4.6/4.7에서는 `xhigh` tier가 adaptive `output_config.effort=xhigh`로 라우팅되며 이 상수를 무시합니다. 기본값은 8192입니다.
| DEFAULT_REDIS_MAJOR_VERSION | version을 확인할 수 없을 때 가정할 기본 Redis major version입니다. 기본값은 7입니다.
| DEFAULT_REDIS_SYNC_INTERVAL | Redis synchronization 기본 interval(초)입니다. 기본값은 1입니다.
| DEFAULT_SEMANTIC_GUARD_EMBEDDING_MODEL | Semantic Guard(route-matching guardrail)의 기본 embedding model입니다. 기본값은 "text-embedding-3-small"입니다.
| DEFAULT_SEMANTIC_GUARD_SIMILARITY_THRESHOLD | Semantic Guard route matching의 기본 similarity threshold입니다. 기본값은 0.75입니다.
| DEFAULT_REPLICATE_GPU_PRICE_PER_SECOND | Replicate GPU의 second당 기본 price입니다. 기본값은 0.001400입니다.
| DEFAULT_REPLICATE_POLLING_DELAY_SECONDS | Replicate polling의 기본 delay(초)입니다. 기본값은 1입니다.
| DEFAULT_REPLICATE_POLLING_RETRIES | Replicate polling의 기본 retry 횟수입니다. 기본값은 5입니다.
| DEFAULT_SQS_BATCH_SIZE | SQS logging 기본 batch size입니다. 기본값은 512입니다.
| DEFAULT_SQS_FLUSH_INTERVAL_SECONDS | SQS logging 기본 flush interval(초)입니다. 기본값은 10입니다.
| DEFAULT_S3_BATCH_SIZE | S3 logging 기본 batch size입니다. 기본값은 512입니다.
| DEFAULT_S3_FLUSH_INTERVAL_SECONDS | S3 logging 기본 flush interval(초)입니다. 기본값은 10입니다.
| DEFAULT_SLACK_ALERTING_THRESHOLD | Slack alerting 기본 threshold입니다. 기본값은 300입니다.
| DEFAULT_SOFT_BUDGET | LiteLLM proxy key의 기본 soft budget입니다. 기본값은 50.0입니다.
| DEFAULT_TRIM_RATIO | prompt 끝에서 trim할 token 비율 기본값입니다. 기본값은 0.75입니다.
| DEFAULT_GOOGLE_VIDEO_DURATION_SECONDS | Google video generation의 기본 duration(초)입니다. 기본값은 8입니다.
| DIRECT_URL | service endpoint의 direct URL입니다.
| DISABLE_ADMIN_UI | admin UI를 비활성화하는 toggle입니다.
| DISABLE_AIOHTTP_TRANSPORT | aiohttp transport를 비활성화하는 flag입니다. True로 설정하면 litellm은 aiohttp 대신 httpx를 사용합니다. **기본값은 False입니다.**
| DISABLE_AIOHTTP_TRUST_ENV | aiohttp trust environment를 비활성화하는 flag입니다. True로 설정하면 litellm은 aiohttp에서 environment를 신뢰하지 않으므로 `HTTP_PROXY`, `HTTPS_PROXY` 환경 변수가 사용되지 않습니다. **기본값은 False입니다.**
| DISABLE_SCHEMA_UPDATE | schema update를 비활성화하는 toggle입니다.
| DYNAMIC_RATE_LIMIT_ERROR_THRESHOLD_PER_MINUTE | parallel request limiter에서 rate limit을 적용하기 전 분당 deployment failure threshold입니다. 기본값은 1입니다.
| DOCS_DESCRIPTION | documentation page용 description text입니다.
| DOCS_FILTERED | filtered documentation 여부를 나타내는 flag입니다.
| DOCS_TITLE | documentation page title입니다.
| DOCS_URL | Swagger API documentation path입니다. **기본값은 "/"입니다.**
| EMAIL_LOGO_URL | email에서 사용할 logo URL입니다.
| EMAIL_BUDGET_ALERT_TTL | email budget alert의 time-to-live(초)입니다.
| EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE | email budget alert를 trigger할 maximum spend percentage입니다.
| EMAIL_SUPPORT_CONTACT | support contact email address입니다.
| EMAIL_SIGNATURE | 모든 email에 사용할 custom HTML footer/signature입니다. formatting과 link용 HTML tag를 포함할 수 있습니다.
| EMAIL_SUBJECT_INVITATION | invitation email용 custom subject template입니다.
| EMAIL_SUBJECT_KEY_CREATED | key creation email용 custom subject template입니다.
| EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE | alert를 trigger하는 max budget 대비 percentage입니다(decimal: 0.8 = 80%). 기본값은 0.8입니다.
| EMAIL_BUDGET_ALERT_TTL | budget alert deduplication용 time-to-live(초)입니다. 기본값은 86400(24 hours)입니다.
| ENKRYPTAI_API_BASE | EnkryptAI 가드레일 API base URL입니다. **기본값은 https://api.enkryptai.com 입니다.**
| ENKRYPTAI_API_KEY | EnkryptAI 가드레일 service용 API key입니다.
| FIREWORKS_AI_4_B | Fireworks AI 4B model용 size parameter입니다. 기본값은 4입니다.
| FIREWORKS_AI_16_B | Fireworks AI 16B model용 size parameter입니다. 기본값은 16입니다.
| FIREWORKS_AI_56_B_MOE | Fireworks AI 56B MOE model용 size parameter입니다. 기본값은 56입니다.
| FIREWORKS_AI_80_B | Fireworks AI 80B model용 size parameter입니다. 기본값은 80입니다.
| FIREWORKS_AI_176_B_MOE | Fireworks AI 176B MOE model용 size parameter입니다. 기본값은 176입니다.
| FOCUS_PROVIDER | Focus export 대상 provider입니다(예: `s3`). 기본값은 `s3`입니다.
| FOCUS_FORMAT | Focus export output format입니다. 기본값은 `parquet`입니다.
| FOCUS_FREQUENCY | scheduled Focus export frequency입니다(`hourly`, `daily`, `interval`). 기본값은 `hourly`입니다.
| FOCUS_CRON_OFFSET | hourly/daily Focus export scheduling에 사용할 minute offset입니다. 기본값은 `5` minutes입니다.
| FOCUS_INTERVAL_SECONDS | `frequency`가 `interval`일 때 Focus export interval(초)입니다.
| FOCUS_PREFIX | Focus export file upload 시 사용할 object key prefix 또는 folder입니다. 기본값은 `focus_exports`입니다.
| FOCUS_S3_BUCKET_NAME | S3 destination 사용 시 Focus export file을 upload할 S3 bucket입니다.
| FOCUS_S3_REGION_NAME | Focus export S3 bucket의 AWS region입니다.
| FOCUS_S3_ENDPOINT_URL | Focus export S3 client용 custom endpoint입니다(optional; S3-compatible storage에 유용).
| FOCUS_S3_ACCESS_KEY | Focus export S3 client가 사용하는 AWS access key ID입니다.
| FOCUS_S3_SECRET_KEY | Focus export S3 client가 사용하는 AWS secret access key입니다.
| FOCUS_S3_SESSION_TOKEN | Focus export S3 client가 사용하는 AWS session token입니다(optional).
| FUNCTION_DEFINITION_TOKEN_COUNT | function definition의 token count입니다. 기본값은 9입니다.
| GALILEO_BASE_URL | Galileo platform base URL입니다.
| GALILEO_PASSWORD | Galileo authentication용 password입니다.
| GALILEO_PROJECT_ID | Galileo usage용 project ID입니다.
| GALILEO_USERNAME | Galileo authentication용 username입니다.
| GOOGLE_SECRET_MANAGER_PROJECT_ID | Google Secret Manager project ID입니다.
| GCS_BUCKET_NAME | Google Cloud Storage bucket name입니다.
| GCS_MOCK | GCS integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 GCS API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| GCS_MOCK_LATENCY_MS | mock mode가 활성화된 GCS API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 150ms입니다.
| GCS_PATH_SERVICE_ACCOUNT | Google Cloud service account JSON file path입니다.
| GCS_FLUSH_INTERVAL | GCS logging flush interval(초)입니다. log를 GCS로 얼마나 자주 보낼지 지정합니다. **기본값은 20 seconds입니다.**
| GCS_BATCH_SIZE | GCS 로깅 batch size입니다. 몇 개의 log마다 GCS로 flush할지 지정합니다. `BATCH_SIZE`가 10이면 log 10개마다 flush됩니다. **기본값은 2048입니다.**
| GCS_USE_BATCHED_LOGGING | GCS batched logging을 활성화합니다. 활성화된 경우(기본값) 여러 log payload를 하나의 GCS object upload(NDJSON format)로 합쳐 API call을 크게 줄입니다. 비활성화하면 각 log를 별도 GCS object로 개별 전송합니다(legacy behavior). **기본값은 true입니다.**
| GCS_PUBSUB_TOPIC_ID | LiteLLM Spend로그를 보낼 PubSub Topic ID입니다.
| GCS_PUBSUB_PROJECT_ID | LiteLLM Spend로그를 보낼 PubSub Project ID입니다.
| GENERIC_AUTHORIZATION_ENDPOINT | generic OAuth provider용 authorization endpoint입니다.
| GENERIC_CLIENT_ID | generic OAuth provider용 client ID입니다.
| GENERIC_CLIENT_SECRET | generic OAuth provider용 client secret입니다.
| GENERIC_CLIENT_STATE | generic client authentication용 state parameter입니다.
| GENERIC_CLIENT_USE_PKCE | generic OAuth provider용 `PKCE(Proof Key for Code Exchange)`를 활성화합니다. OAuth provider가 PKCE를 요구하면 "true"로 설정하세요. **기본값은 false입니다.**
| GENERIC_SSO_HEADERS | request에 추가할 additional header의 comma-separated 목록입니다. 예: Authorization=Bearer `<token>`, Content-Type=application/json 등.
| GENERIC_INCLUDE_CLIENT_ID | OAuth request에 client ID를 포함합니다.
| GENERIC_SCOPE | generic OAuth provider용 scope 설정입니다.
| GENERIC_TOKEN_ENDPOINT | generic OAuth provider용 token endpoint입니다.
| GENERIC_USER_DISPLAY_NAME_ATTRIBUTE | generic auth에서 user display name에 사용할 attribute입니다.
| GENERIC_USER_EMAIL_ATTRIBUTE | generic auth에서 user email에 사용할 attribute입니다.
| GENERIC_USER_EXTRA_ATTRIBUTES | generic SSO provider response에서 추출할 additional field의 comma-separated 목록입니다(예: "department,employee_id,groups"). custom SSO handler에서 `CustomOpenID.extra_fields`로 접근할 수 있습니다. nested field에는 dot notation을 지원합니다.
| GENERIC_USER_FIRST_NAME_ATTRIBUTE | generic auth에서 user first name에 사용할 attribute입니다.
| GENERIC_USER_ID_ATTRIBUTE | generic auth에서 user ID에 사용할 attribute입니다.
| GENERIC_USER_LAST_NAME_ATTRIBUTE | generic auth에서 user last name에 사용할 attribute입니다.
| GENERIC_USER_PROVIDER_ATTRIBUTE | user provider를 지정하는 attribute입니다.
| GENERIC_USER_ROLE_ATTRIBUTE | user role을 지정하는 attribute입니다.
| GENERIC_USERINFO_ENDPOINT | generic OAuth에서 user information을 가져올 endpoint입니다.
| GENERIC_LOGGER_ENDPOINT | Generic Logger callback이 log를 보낼 endpoint URL입니다.
| GENERIC_LOGGER_HEADERS | Generic Logger callback request에 포함할 header의 JSON string입니다.
| GENERIC_ROLE_MAPPINGS_DEFAULT_ROLE | generic SSO에서 role mapping이 match되지 않을 때 할당할 기본 LiteLLM role입니다. `GENERIC_ROLE_MAPPINGS_ROLES`와 함께 사용합니다.
| GENERIC_ROLE_MAPPINGS_GROUP_CLAIM | user group을 포함하는 SSO token의 claim/attribute name입니다. role mapping에 사용합니다.
| GENERIC_ROLE_MAPPINGS_ROLES | LiteLLM role을 SSO group name에 매핑하는 Python dict string입니다. 예제: `{"proxy_admin": ["admin-group"], "internal_user": ["users"]}`
| GENERIC_USER_ROLE_MAPPINGS | SSO에서 user role mapping을 구성하기 위한 `GENERIC_ROLE_MAPPINGS_ROLES`의 대안입니다.
| GEMINI_API_BASE | Gemini API base URL입니다. 기본값은 https://generativelanguage.googleapis.com 입니다.
| GALILEO_BASE_URL | Galileo platform base URL입니다.
| GALILEO_PASSWORD | Galileo authentication용 password입니다.
| GALILEO_PROJECT_ID | Galileo usage용 project ID입니다.
| GALILEO_USERNAME | Galileo authentication용 username입니다.
| GITHUB_COPILOT_TOKEN_DIR | `github_copilot` llm provider용 GitHub Copilot token 저장 directory입니다.
| GITHUB_COPILOT_API_KEY_FILE | `github_copilot` llm provider용 GitHub Copilot API key 저장 file입니다.
| GITHUB_COPILOT_ACCESS_TOKEN_FILE | `github_copilot` llm provider용 GitHub Copilot access token 저장 file입니다.
| GITHUB_COPILOT_API_BASE | GitHub Copilot API base URL입니다. custom host가 있는 GitHub 엔터프라이즈 subscription에서는 https://copilot-api.my-company.ghe.com 과 유사합니다. 기본값은 https://api.githubcopilot.com 입니다.
| GITHUB_COPILOT_DEVICE_CODE_URL | GitHub Copilot device code authentication용 URL입니다. custom host가 있는 GitHub 엔터프라이즈 subscription에서는 https://my-company.ghe.com/login/device/code 와 유사합니다. 기본값은 https://github.com/login/device/code 입니다.
| GITHUB_COPILOT_ACCESS_TOKEN_URL | GitHub Copilot access token retrieval용 URL입니다. custom host가 있는 GitHub 엔터프라이즈 subscription에서는 https://my-company.ghe.com/login/oauth/access_token 과 유사합니다. 기본값은 https://github.com/login/oauth/access_token 입니다.
| GITHUB_COPILOT_API_KEY_URL | GitHub Copilot API key retrieval용 URL입니다. custom host가 있는 GitHub 엔터프라이즈 subscription에서는 https://my-company.ghe.com/api/v3/copilot_internal/v2/token 과 유사합니다. 기본값은 https://api.github.com/copilot_internal/v2/token 입니다.
| GITHUB_COPILOT_CLIENT_ID | GitHub Copilot device flow authentication용 client ID입니다. `github_copilot` provider가 device code authentication에 사용합니다. 기본값은 `Iv1.b507a08c87ecfe98`입니다.
| GREENSCALE_API_KEY | Greenscale service용 API key입니다.
| GREENSCALE_ENDPOINT | Greenscale service endpoint URL입니다.
| GRAYSWAN_API_BASE | GraySwan API base URL입니다. 기본값은 https://api.grayswan.ai 입니다.
| GRAYSWAN_API_KEY | GraySwan Cygnal service용 API key입니다.
| GRAYSWAN_REASONING_MODE | GraySwan guardrail의 reasoning mode입니다.
| GRAYSWAN_VIOLATION_THRESHOLD | GraySwan guardrail의 violation threshold입니다.
| GOOGLE_APPLICATION_CREDENTIALS | Google Cloud credentials JSON file path입니다.
| GOOGLE_CLIENT_ID | Google OAuth용 client ID입니다.
| GOOGLE_CLIENT_SECRET | Google OAuth용 client secret입니다.
| GOOGLE_KMS_RESOURCE_NAME | Google KMS resource name입니다.
| GUARDRAILS_AI_API_BASE | 가드레일 AI API base URL입니다.
| HEALTH_CHECK_TIMEOUT_SECONDS | health check timeout(초)입니다. 기본값은 60입니다.
| HEROKU_API_BASE | Heroku API base URL입니다.
| HEROKU_API_KEY | Heroku service용 API key입니다.
| HF_API_BASE | Hugging Face API base URL입니다.
| HCP_VAULT_ADDR | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault) address입니다.
| HCP_VAULT_APPROLE_MOUNT_PATH | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 AppRole authentication mount path입니다. 기본값은 "approle"입니다.
| HCP_VAULT_APPROLE_ROLE_ID | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 AppRole authentication role ID입니다.
| HCP_VAULT_APPROLE_SECRET_ID | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 AppRole authentication secret ID입니다.
| HCP_VAULT_CLIENT_CERT | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)용 client certificate path입니다.
| HCP_VAULT_CLIENT_KEY | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)용 client key path입니다.
| HCP_VAULT_MOUNT_NAME | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 mount name입니다.
| HCP_VAULT_NAMESPACE | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 namespace입니다.
| HCP_VAULT_PATH_PREFIX | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)의 path prefix입니다.
| HCP_VAULT_TOKEN | [Hashicorp Vault Secret Manager](../secret.md#hashicorp-vault)용 token입니다.
| HCP_VAULT_CERT_ROLE | [Hashicorp Vault Secret Manager Auth](../secret.md#hashicorp-vault)용 role입니다.
| HELICONE_API_KEY | Helicone service용 API key입니다.
| HELICONE_API_BASE | Helicone service base URL입니다. 기본값은 `https://api.helicone.ai`입니다.
| HELICONE_MOCK | Helicone integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 Helicone API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| HELICONE_MOCK_LATENCY_MS | mock mode가 활성화된 Helicone API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| HOSTNAME | server hostname입니다. 이 값은 [`datadog` logs](https://docs.litellm.ai/docs/proxy/logging#datadog)로 emit됩니다.
| HOURS_IN_A_DAY | 계산에 사용할 하루의 시간 수입니다. 기본값은 24입니다.
| HIDDENLAYER_API_BASE | HiddenLayer API base URL입니다. 기본값은 `https://api.hiddenlayer.ai`입니다.
| HIDDENLAYER_AUTH_URL | HiddenLayer 인증 URL입니다. 기본값은 `https://auth.hiddenlayer.ai`입니다.
| HIDDENLAYER_CLIENT_ID | HiddenLayer SaaS authentication용 client ID입니다.
| HIDDENLAYER_CLIENT_SECRET | HiddenLayer SaaS authentication용 client secret입니다.
| HUGGINGFACE_API_BASE | Hugging Face API base URL입니다.
| HUGGINGFACE_API_KEY | Hugging Face API용 API key입니다.
| HUMANLOOP_PROMPT_CACHE_TTL_SECONDS | Humanloop cached prompt의 time-to-live(초)입니다. 기본값은 60입니다.
| IAM_TOKEN_DB_AUTH | 데이터베이스 authentication용 IAM token입니다.
| IBM_GUARDRAILS_API_BASE | IBM 가드레일 API base URL입니다.
| IBM_GUARDRAILS_AUTH_TOKEN | IBM 가드레일 API용 authorization bearer token입니다.
| INITIAL_RETRY_DELAY | request retry 전 initial delay(초)입니다. 기본값은 0.5입니다.
| JITTER | retry delay 계산용 jitter factor입니다. 기본값은 0.75입니다.
| JSON_LOGS | JSON formatted logging을 활성화합니다.
| JWT_AUDIENCE | JWT token의 expected audience입니다.
| JWT_ISSUER | JWT token의 expected issuer(`iss` claim)입니다. 설정하면 PyJWT가 `iss` claim을 검증하고 다른 issuer의 token을 거부합니다.
| JWT_PUBLIC_KEY_URL | JWT verification용 public key를 가져올 URL입니다.
| LAGO_API_BASE | Lago API base URL입니다.
| LAGO_API_CHARGE_BY | Lago에서 charge basis를 결정하는 parameter입니다.
| LAGO_API_EVENT_CODE | Lago API event code입니다.
| LAGO_API_KEY | Lago service 접근용 API key입니다.
| LANGFUSE_DEBUG | Langfuse debug mode toggle입니다.
| LANGFUSE_FLUSH_INTERVAL | Langfuse log flush interval입니다.
| LANGFUSE_TRACING_ENVIRONMENT | Langfuse tracing environment입니다.
| LANGFUSE_HOST | Langfuse service host URL입니다.
| LANGFUSE_MOCK | Langfuse integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 Langfuse API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| LANGFUSE_MOCK_LATENCY_MS | mock mode가 활성화된 Langfuse API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| LANGFUSE_PUBLIC_KEY | Langfuse authentication용 public key입니다.
| LANGFUSE_RELEASE | Langfuse integration release version입니다.
| LANGFUSE_SECRET_KEY | Langfuse authentication용 secret key입니다.
| LANGFUSE_PROPAGATE_TRACE_ID | trace ID를 Langfuse로 propagate하는 flag입니다. 기본값은 False입니다.
| LANGSMITH_API_KEY | Langsmith platform용 API key입니다.
| LANGSMITH_BASE_URL | Langsmith service base URL입니다.
| LANGSMITH_BATCH_SIZE | Langsmith operation batch size입니다.
| LANGSMITH_DEFAULT_RUN_NAME | Langsmith run의 기본 name입니다.
| LANGSMITH_PROJECT | Langsmith integration project name입니다.
| LANGSMITH_SAMPLING_RATE | Langsmith 로깅 sampling rate입니다.
| LANGSMITH_TENANT_ID | Langsmith multi-tenant deployment용 tenant ID입니다.
| LANGSMITH_MOCK | Langsmith integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 Langsmith API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| LANGSMITH_MOCK_LATENCY_MS | mock mode가 활성화된 Langsmith API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| LANGTRACE_API_KEY | Langtrace service용 API key입니다.
| LASSO_API_BASE | Lasso API base URL입니다.
| LASSO_API_KEY | Lasso service용 API key입니다.
| LASSO_USER_ID | Lasso service용 user ID입니다.
| LASSO_CONVERSATION_ID | Lasso service용 conversation ID입니다.
| LENGTH_OF_LITELLM_GENERATED_KEY | LiteLLM이 생성하는 key 길이입니다. 기본값은 16입니다.
| LEGACY_MULTI_INSTANCE_RATE_LIMITING | legacy multi-instance rate limiting을 활성화하는 flag입니다. **기본값은 False입니다.**
| LITERAL_API_KEY | Literal integration용 API key입니다.
| LITERAL_API_URL | Literal service API URL입니다.
| LITERAL_BATCH_SIZE | Literal operation batch size입니다.
| LITELLM_ANTHROPIC_BETA_HEADERS_URL | Anthropic beta header configuration을 가져올 custom URL입니다. 기본값은 GitHub main branch URL입니다.
| LITELLM_ANTHROPIC_DISABLE_URL_SUFFIX | Anthropic API base URL에 URL suffix를 자동으로 붙이는 동작을 비활성화합니다. `true`로 설정하면 LiteLLM이 custom Anthropic API endpoint에 `/v1/messages` 또는 `/v1/complete`를 자동 추가하지 않습니다.
| LITELLM_ASSETS_PATH | UI asset과 logo directory path입니다. read-only filesystem(예: Kubernetes)에서 실행할 때 사용합니다. Docker 기본값은 `/var/lib/litellm/assets`입니다.
| LITELLM_BLOG_POSTS_URL | LiteLLM blog posts JSON을 가져올 custom URL입니다. 기본값은 GitHub main branch URL입니다.
| LITELLM_CLI_JWT_EXPIRATION_HOURS | CLI에서 생성한 JWT token의 만료 시간(시간)입니다. 기본값은 24 hours입니다.
| LITELLM_CORS_ALLOW_CREDENTIALS | CORS response에서 credentials를 명시적으로 허용하려면 `true`로 설정합니다. 설정하지 않은 경우 `LITELLM_CORS_ORIGINS`가 `*`이면 browser 보안 misconfiguration을 막기 위해 credentials가 자동으로 비활성화됩니다.
| LITELLM_CORS_ORIGINS | 허용할 CORS origin의 comma-separated 목록입니다(예: `https://app.example.com,https://admin.example.com`). 설정하지 않으면 기본값은 `*`(all origins)입니다.
| LITELLM_DD_AGENT_HOST | LiteLLM-specific logging용 DataDog agent hostname 또는 IP입니다. 설정하면 log가 direct API 대신 agent로 전송됩니다.
| LITELLM_DEPLOYMENT_ENVIRONMENT | deployment environment name입니다(예: "production", "staging"). `OTEL_ENVIRONMENT_NAME`이 설정되지 않았을 때 fallback으로 사용되며 telemetry data의 `environment` tag를 설정합니다.
| LITELLM_DETAILED_TIMING | true이면 response에 detailed per-phase timing header(`x-litellm-timing-{pre-processing,llm-api,post-processing,message-copy}-ms`)를 추가합니다. 기본값은 false입니다. [latency overhead docs](../troubleshoot/latency_overhead.md)를 참고하세요.
| LITELLM_DD_AGENT_PORT | LiteLLM-specific log intake용 DataDog agent port입니다. 기본값은 10518입니다.
| LITELLM_DD_LLM_OBS_PORT | Datadog LLM observability agent port입니다. 기본값은 8126입니다.
| LITELLM_DEFAULT_EMBEDDING_ENCODING_FORMAT | request 또는 model `litellm_params`에 설정되지 않은 OpenAI-compatible embedding call의 기본 `encoding_format`입니다(예: `float`, `base64`). fallback은 `float`입니다. [Embeddings](./embedding.md#embedding-encoding-format)를 참고하세요.
| LITELLM_DONT_SHOW_FEEDBACK_BOX | LiteLLM UI의 feedback box를 숨기는 flag입니다.
| LITELLM_DROP_PARAMS | LiteLLM request에서 제거할 parameter입니다.
| LITELLM_MODIFY_PARAMS | LiteLLM request에서 수정할 parameter입니다.
| LITELLM_EMAIL | LiteLLM account와 연결된 email입니다.
| LITELLM_FAVICON_URL | LiteLLM UI favicon용 custom URL입니다. 설정하면 기본 favicon을 override합니다.
| LITELLM_GLOBAL_MAX_PARALLEL_REQUEST_RETRIES | LiteLLM parallel request의 최대 retry 횟수입니다.
| LITELLM_GLOBAL_MAX_PARALLEL_REQUEST_RETRY_TIMEOUT | LiteLLM parallel request retry timeout입니다.
| LITELLM_DISABLE_LAZY_LOADING | "1", "true", "yes", "on"으로 설정하면 attribute lazy loading을 비활성화합니다(현재 encoding/tiktoken에만 영향). VCR이 HTTP request recording을 시작하기 전에 encoding을 초기화해 VCR cassette 생성 문제를 해결합니다. [issue #18659](https://github.com/BerriAI/litellm/issues/18659)를 참고하세요.
| LITELLM_DISABLE_REDACT_SECRETS | "true"로 설정하면 proxy log output에서 secret(API key, token, credential)을 자동 redaction하는 동작을 비활성화합니다. secret redaction은 기본적으로 활성화됩니다.
| LITELLM_MIGRATION_DIR | read-only file system에서 DB baseline을 잡기 위해 사용할 Prisma migration custom directory입니다.
| LITELLM_HOSTED_UI | LiteLLM hosted UI URL입니다.
| LITELLM_UI_API_DOC_BASE_URL | admin UI가 proxy와 다른 host에서 실행될 때 sample code/docs에 사용할 API Reference base URL override입니다. 설정하지 않으면 `PROXY_BASE_URL`을 사용합니다.
| LITELLM_UI_PATH | admin UI file directory path입니다. read-only filesystem(예: Kubernetes)에서 실행할 때 사용합니다. Docker 기본값은 `/var/lib/litellm/ui`입니다.
| LITELLM_UI_SESSION_DURATION | UI login session 기간입니다(username/password, SSO, invitation link). 형식: "30s", "30m", "24h", "7d". security를 위해 고정 10분 만료를 쓰는 `EXPERIMENTAL_UI_LOGIN` flow에는 적용되지 않습니다. 기본값은 "24h"입니다.
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_BATCH_SIZE | cleanup run마다 삭제할 expired LiteLLM dashboard session key의 최대 수입니다. 기본값은 1000입니다.
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_ENABLED | expired LiteLLM dashboard session key background cleanup job을 활성화하려면 `true`로 설정합니다. 기본값은 `false`입니다.
| LITELLM_EXPIRED_UI_SESSION_KEY_CLEANUP_INTERVAL_SECONDS | expired LiteLLM dashboard session key cleanup job 실행 interval(초)입니다. 기본값은 86400(24 hours)입니다.
| LITELM_ENVIRONMENT | LiteLLM Instance environment입니다. logging service에서 사용되며 현재는 DeepEval에서만 사용됩니다.
| LITELLM_KEY_ROTATION_ENABLED | LiteLLM auto-key rotation을 활성화합니다(boolean). 기본값은 false입니다.
| LITELLM_KEY_ROTATION_CHECK_INTERVAL_SECONDS | key auto-rotation job 실행 interval(초)입니다. 기본값은 86400(24 hours)입니다.
| LITELLM_KEY_ROTATION_GRACE_PERIOD | rotation 후 old key를 유효하게 유지할 기간입니다(예: "24h", "2d"). 기본값은 empty(immediate revoke)입니다. scheduled rotation과 regenerate request에서 지정되지 않았을 때 fallback으로 사용됩니다.
| LITELLM_KEY_ROTATION_LOCK_TTL_SECONDS | key rotation job에서 사용하는 distributed lock TTL(초)입니다. 기본값은 600(10 minutes)입니다.
| LITELLM_LICENSE | LiteLLM usage용 license key입니다.
| LITELLM_LOCAL_ANTHROPIC_BETA_HEADERS | remote fetching을 비활성화하고 local bundled Anthropic beta headers config만 사용하려면 `True`로 설정합니다. 기본값은 `False`입니다.
| LITELLM_OIDC_ALLOWED_CREDENTIAL_DIRS | `oidc/file/` provider가 token file을 읽을 수 있는 absolute directory의 comma-separated 목록입니다. 기본값은 `/var/run/secrets,/run/secrets`입니다.
| LITELLM_LOCAL_BLOG_POSTS | `True`로 설정하면 GitHub에서 remote fetching하지 않고 local bundled blog posts만 사용합니다. 기본값은 `False`입니다.
| LITELLM_LOCAL_MODEL_COST_MAP | LiteLLM model cost mapping용 local configuration입니다.
| LITELLM_LOCAL_POLICY_TEMPLATES | "true"로 설정하면 GitHub에서 가져오는 대신 local backup policy template을 사용합니다. 기본적으로 policy template은 https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json 에서 가져오며 실패 시 local backup으로 자동 fallback합니다.
| LITELLM_LOG | LiteLLM detailed logging을 활성화합니다.
| LITELLM_MODEL_COST_MAP_URL | model cost map data를 가져올 URL입니다. 기본값은 https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json 입니다.
| LITELLM_LOG_FILE | LiteLLM log를 기록할 file path입니다. 설정하면 console과 지정 file 양쪽에 log가 기록됩니다.
| LITELLM_LOGGER_NAME | OTEL logger name입니다.
| LITELLM_METER_NAME | OTEL Meter name입니다.
| LITELLM_OTEL_INTEGRATION_ENABLE_EVENTS | OTEL용 semantic log(`gen_ai.content.prompt`/`gen_ai.content.completion`, 또는 semconv mode의 `gen_ai.client.inference.operation.details`)를 선택적으로 활성화합니다. 기본값은 `false`입니다. [OpenTelemetry](/docs/observability/opentelemetry_integration#configuration-reference)를 참고하세요.
| LITELLM_OTEL_INTEGRATION_ENABLE_METRICS | OTEL용 semantic metric(TTFT, TPOT, response duration, cost, token usage)을 선택적으로 활성화합니다. 기본값은 `false`입니다. [OpenTelemetry](/docs/observability/opentelemetry_integration#metrics-reference)를 참고하세요.
| LITELLM_ENABLE_PYROSCOPE | true이면 Pyroscope CPU profiling을 활성화합니다. profile은 `PYROSCOPE_SERVER_ADDRESS`로 전송됩니다. 기본값은 off입니다. [Pyroscope profiling](/proxy/pyroscope_profiling)을 참고하세요.
| LITELLM_ENABLE_TEAM_STALE_ALIAS_BYPASS | `true`이면 team의 legacy `model_aliases` entry가 public model name을 internal `model_name_<team_id>_<uuid>` deployment로 매핑하더라도, public name의 team-scoped sibling deployment가 있을 때 pre-call 처리에서 rewrite를 건너뛸 수 있습니다. 따라서 sibling 간 load balancing / `order`가 적용됩니다. backward compatibility를 위해 기본값은 `false`입니다. [Team-scoped model과 legacy alias](/docs/proxy/load_balancing#team-scoped-models-and-legacy-model_aliases)를 참고하세요. stale alias가 감지되고 이 flag가 off이면 proxy가 one-time warning을 기록할 수 있습니다.
| PYROSCOPE_APP_NAME | Pyroscope에 보고할 application name입니다. `LITELLM_ENABLE_PYROSCOPE`가 true일 때 필요합니다. 기본값은 없습니다.
| PYROSCOPE_SERVER_ADDRESS | profile을 전송할 Pyroscope server URL입니다. `LITELLM_ENABLE_PYROSCOPE`가 true일 때 필요합니다. 기본값은 없습니다.
| PYROSCOPE_SAMPLE_RATE | Pyroscope profiling sample rate입니다(integer). 기본값은 없으며, 설정하지 않으면 pyroscope-io library 기본값을 사용합니다.
| LITELLM_MASTER_KEY | proxy authentication용 master key입니다.
| LITELLM_MAX_BUDGET_PER_SESSION_TTL | max-budget-per-session limiter가 사용하는 session budget counter TTL(초)입니다. 기본값은 3600(1 hour)입니다.
| LITELLM_MAX_ITERATIONS_TTL | max-iterations limiter가 사용하는 session iteration counter TTL(초)입니다. 기본값은 3600(1 hour)입니다.
| LITELLM_MAX_STREAMING_DURATION_SECONDS | streaming response에 허용되는 최대 duration(초)입니다. 이 시간을 넘는 stream은 Timeout error로 종료됩니다. 기본값은 None(no limit)입니다.
| LITELLM_MODE | LiteLLM operating mode입니다(예: production, development).
| LITELLM_NON_ROOT | Docker container에서 향상된 security를 위해 LiteLLM을 non-root mode로 실행하는 flag입니다.
| LITELLM_RATE_LIMIT_WINDOW_SIZE | LiteLLM rate limit window size입니다. 기본값은 60입니다.
| LITELLM_REASONING_AUTO_SUMMARY | "true"로 설정하면 reasoning model에 대해 모든 translation path(Anthropic adapter, Responses API 등)에서 detailed reasoning summary(`summary: "detailed"`)를 자동 활성화합니다. 기본값은 "false"입니다.
| LITELLM_SALT_KEY | LiteLLM encryption용 salt key입니다.
| LITELLM_SSL_CIPHERS | 더 빠른 handshake를 위한 SSL/TLS cipher configuration입니다. OpenSSL connection의 cipher suite preference를 제어합니다.
| LITELLM_SECRET_AWS_KMS_LITELLM_LICENSE | AWS KMS로 암호화된 LiteLLM license입니다.
| LITELLM_TOKEN | LiteLLM integration용 access token입니다.
| LITELLM_USE_CHAT_COMPLETIONS_URL_FOR_ANTHROPIC_MESSAGES | "true"로 설정하면 Anthropic model에 대한 OpenAI `/v1/messages` request를 Responses API 대신 chat/completions로 route합니다. `litellm_settings.use_chat_completions_url_for_anthropic_messages`로도 설정할 수 있습니다.
| LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES | "true"로 설정하면 모든 OpenAI `/chat/completions` request를 Responses API bridge로 route합니다. OpenAI model에 권장됩니다. `litellm_settings.route_all_chat_openai_to_responses`로도 설정할 수 있습니다.
| LITELLM_USER_AGENT | LiteLLM API request용 custom user agent string입니다. partner telemetry attribution에 사용됩니다.
| LITELLM_WORKER_STARTUP_HOOKS | 각 worker process startup 중 실행할 `module.path:function_name` callable의 comma-separated 목록입니다. worker lifecycle 초기에(config/DB loading 전) 실행됩니다. [gflags](https://github.com/google/python-gflags) 같은 per-process state를 다시 초기화할 때 유용합니다. 자세한 내용은 [Worker Startup Hooks](/proxy/worker_startup_hooks)를 참고하세요.
| LITELLM_PRINT_STANDARD_LOGGING_PAYLOAD | true이면 standard logging payload를 console에 출력합니다. debugging에 유용합니다.
| LITELM_ENVIRONMENT | LiteLLM Instance environment입니다. 현재 DeepEval integration에서 environment 판단용으로만 logging됩니다.
| LITELLM_ASYNCIO_QUEUE_MAXSIZE | asyncio queue의 최대 size입니다(예: log queue, spend update queue, `nova_sonic_realtime.py` 같은 cookbook 예제의 realtime audio). OOM 방지를 위해 in-memory growth를 제한합니다. 기본값은 1000입니다.
| LOGFIRE_TOKEN | Logfire logging service용 token입니다.
| LOGFIRE_BASE_URL | Logfire logging service base URL입니다(self-hosted deployment에 유용).
| LOGGING_WORKER_CONCURRENCY | asyncio event loop에서 logging worker가 사용할 concurrent coroutine slot의 최대 수입니다. 기본값은 100입니다. 너무 높게 설정하면 event loop에 logging task가 몰려 request 전체 latency가 높아질 수 있습니다.
| LOGGING_WORKER_MAX_QUEUE_SIZE | logging worker queue의 최대 size입니다. queue가 가득 차면 log를 drop하는 대신 worker가 task를 공격적으로 비워 공간을 만듭니다. 기본값은 50,000입니다.
| LOGGING_WORKER_MAX_TIME_PER_COROUTINE | logging worker의 각 coroutine에 허용되는 최대 시간(초)입니다. 기본값은 20.0입니다.
| LOGGING_WORKER_CLEAR_PERCENTAGE | clearing 시 queue에서 추출할 percentage입니다. 기본값은 50%입니다.
| MAX_BASE64_LENGTH_FOR_LOGGING | logging payload에 유지할 base64 character 최대 수입니다. 이 값을 넘는 Data URI는 size placeholder로 대체됩니다. 0으로 설정하면 truncation을 비활성화합니다. 기본값은 64입니다.
| MAX_COMPETITOR_NAMES | policy template enrichment에서 허용할 competitor name 최대 수입니다. 기본값은 100입니다.
| MAX_EXCEPTION_MESSAGE_LENGTH | exception message 최대 길이입니다. 기본값은 2000입니다.
| MAX_ITERATIONS_TO_CLEAR_QUEUE | shutdown 중 logging worker queue clearing을 시도할 최대 iteration 수입니다. 기본값은 200입니다.
| MAX_TIME_TO_CLEAR_QUEUE | shutdown 중 logging worker queue clearing에 사용할 최대 시간(초)입니다. 기본값은 5.0입니다.
| LOGGING_WORKER_AGGRESSIVE_CLEAR_COOLDOWN_SECONDS | queue가 가득 찼을 때 다음 aggressive clear operation을 허용하기 전 cooldown time(초)입니다. 기본값은 0.5입니다.
| MAX_STRING_LENGTH_PROMPT_IN_DB | request body sanitization 중 spend log에 저장할 string 최대 길이입니다. 이보다 긴 string은 truncate됩니다. 기본값은 1000입니다.
| MAX_IN_MEMORY_QUEUE_FLUSH_COUNT | `in-memory queue flush` 작업의 최대 count입니다. 기본값은 1000입니다.
| MAX_IMAGE_URL_DOWNLOAD_SIZE_MB | URL에서 image를 download할 때 허용되는 최대 size(MB)입니다. 매우 큰 image download로 인한 memory issue를 방지합니다. limit을 넘는 image는 download 전 reject됩니다. 0으로 설정하면 image URL handling을 완전히 비활성화합니다. 기본값은 50MB([OpenAI's limit](https://platform.openai.com/docs/guides/images-vision?api-mode=chat#image-input-requirements)와 동일)입니다.
| MAX_LONG_SIDE_FOR_IMAGE_HIGH_RES | high-resolution image의 long side 최대 길이입니다. 기본값은 2000입니다.
| MAX_REDIS_BUFFER_DEQUEUE_COUNT | Redis buffer dequeue operation의 최대 count입니다. 기본값은 100입니다.
| MAX_SHORT_SIDE_FOR_IMAGE_HIGH_RES | high-resolution image의 short side 최대 길이입니다. 기본값은 768입니다.
| MAX_SIZE_IN_MEMORY_QUEUE | in-memory queue의 최대 size입니다. 기본값은 10000입니다.
| MAX_SIZE_PER_ITEM_IN_MEMORY_CACHE_IN_KB | memory cache item당 최대 size(KB)입니다. 기본값은 512 또는 1024입니다.
| MAX_SPENDLOG_ROWS_TO_QUERY | query할 spend log row의 최대 수입니다. 기본값은 1,000,000입니다.
| MAX_TEAM_LIST_LIMIT | list할 team의 최대 수입니다. 기본값은 20입니다.
| MAX_TILE_HEIGHT | image tile의 최대 height입니다. 기본값은 512입니다.
| MAX_TILE_WIDTH | image tile의 최대 width입니다. 기본값은 512입니다.
| MAX_TOKEN_TRIMMING_ATTEMPTS | token message trim을 시도할 최대 횟수입니다. 기본값은 10입니다.
| MAXIMUM_TRACEBACK_LINES_TO_LOG | LiteLLM log UI에 기록할 traceback line 최대 수입니다. 기본값은 100입니다.
| MAX_RETRY_DELAY | request retry의 최대 delay(초)입니다. 기본값은 8.0입니다.
| MAX_LANGFUSE_INITIALIZED_CLIENTS | proxy에서 초기화할 Langfuse client 최대 수입니다. 기본값은 50입니다. Langfuse는 client가 초기화될 때마다 thread 1개를 생성하므로 이 값을 둡니다. 과거 Langfuse가 여러 번 초기화되어 CPU utilization이 100%에 도달한 incident가 있었습니다.
| MAX_MCP_SEMANTIC_FILTER_TOOLS_HEADER_LENGTH | MCP semantic filter tool header의 최대 길이입니다. 기본값은 150입니다.
| MAX_POLICY_ESTIMATE_IMPACT_ROWS | policy 영향 추정 시 반환할 row의 최대 수입니다. 기본값은 1000입니다.
| MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG | full DEBUG serialization payload의 최대 size(bytes)입니다. 이 값을 넘는 payload는 log에서 truncate됩니다. 기본값은 102400(100 KB)입니다.
| MIN_NON_ZERO_TEMPERATURE | 0이 아닌 temperature의 최소값입니다. 기본값은 0.0001입니다.
| MINIMUM_PROMPT_CACHE_TOKEN_COUNT | prompt caching을 위한 최소 token count입니다. 기본값은 1024입니다.
| MISTRAL_API_BASE | Mistral API base URL입니다. 기본값은 https://api.mistral.ai 입니다.
| MISTRAL_API_KEY | Mistral API용 API key입니다.
| MICROSOFT_AUTHORIZATION_ENDPOINT | Microsoft SSO용 custom authorization endpoint URL입니다. 기본 Microsoft OAuth authorization endpoint를 override합니다.
| MICROSOFT_CLIENT_ID | Microsoft service용 client ID입니다.
| MICROSOFT_CLIENT_SECRET | Microsoft service용 client secret입니다.
| MICROSOFT_SERVICE_PRINCIPAL_ID | Microsoft Enterprise Application의 Service Principal ID입니다. Microsoft Entra ID Group 기반으로 Litellm Team member를 자동 할당하려는 경우 사용하는 advanced feature입니다.
| MICROSOFT_TENANT | Microsoft Azure tenant ID입니다.
| MICROSOFT_TOKEN_ENDPOINT | Microsoft SSO용 custom token endpoint URL입니다. 기본 Microsoft OAuth token endpoint를 override합니다.
| MICROSOFT_USER_DISPLAY_NAME_ATTRIBUTE | Microsoft SSO response에서 user display name에 사용할 field name입니다. 기본값은 `displayName`입니다.
| MICROSOFT_USER_EMAIL_ATTRIBUTE | Microsoft SSO response에서 user email에 사용할 field name입니다. 기본값은 `userPrincipalName`입니다.
| MICROSOFT_USER_FIRST_NAME_ATTRIBUTE | Microsoft SSO response에서 user first name에 사용할 field name입니다. 기본값은 `givenName`입니다.
| MICROSOFT_USER_ID_ATTRIBUTE | Microsoft SSO response에서 user ID에 사용할 field name입니다. 기본값은 `id`입니다.
| MICROSOFT_USER_LAST_NAME_ATTRIBUTE | Microsoft SSO response에서 user last name에 사용할 field name입니다. 기본값은 `surname`입니다.
| MICROSOFT_USERINFO_ENDPOINT | Microsoft SSO용 custom userinfo endpoint URL입니다. 기본 Microsoft Graph userinfo endpoint를 override합니다.
| MODEL_COST_MAP_MAX_SHRINK_RATIO | fetched model cost map을 local backup과 비교해 검증할 때 허용되는 최대 shrinkage ratio입니다. fetched map이 backup의 이 fraction보다 작으면 reject합니다. 기본값은 0.5입니다.
| MODEL_COST_MAP_MIN_MODEL_COUNT | fetched cost map이 valid로 간주되기 위해 포함해야 하는 model 최소 수입니다. 기본값은 50입니다.
| NO_DOCS | Swagger UI documentation을 비활성화하는 flag입니다.
| NO_OPENAPI | `/openapi.json` endpoint를 비활성화하는 flag입니다.
| NO_REDOC | Redoc documentation을 비활성화하는 flag입니다.
| NO_PROXY | proxy를 우회할 address 목록입니다.
| NON_LLM_CONNECTION_TIMEOUT | non-LLM service connection timeout(초)입니다. 기본값은 15입니다.
| OAUTH_TOKEN_INFO_ENDPOINT | OAuth token info retrieval endpoint입니다.
| OPENAI_BASE_URL | OpenAI API base URL입니다.
| OPENAI_API_BASE | OpenAI API base URL입니다. 기본값은 https://api.openai.com/ 입니다.
| OPENAI_API_KEY | OpenAI service용 API key입니다.
| OPENAI_CHATGPT_API_BASE | `CHATGPT_API_BASE`의 대안입니다. ChatGPT API base URL입니다.
| OPENAI_FILE_SEARCH_COST_PER_1K_CALLS | OpenAI file search 1000 call당 cost입니다. 기본값은 0.0025입니다.
| OPENAI_ORGANIZATION | OpenAI organization identifier입니다.
| OPENAPI_URL | OpenAPI JSON endpoint path입니다. **기본값은 "/openapi.json"입니다.**
| OPENID_BASE_URL | OpenID Connect service base URL입니다.
| OPENID_CLIENT_ID | OpenID Connect authentication용 client ID입니다.
| OPENID_CLIENT_SECRET | OpenID Connect authentication용 client secret입니다.
| OPENMETER_API_ENDPOINT | OpenMeter integration용 API endpoint입니다.
| OPENMETER_API_KEY | OpenMeter service용 API key입니다.
| OPENMETER_EVENT_TYPE | OpenMeter로 전송되는 event type입니다.
| ONYX_API_BASE | Onyx Security AI Guard service base URL입니다(기본값: https://ai-guard.onyx.security).
| ONYX_API_KEY | Onyx Security AI Guard service용 API key입니다.
| ONYX_TIMEOUT | Onyx Guard server request timeout(초)입니다. 기본값은 10입니다.
| OTEL_ENDPOINT | trace용 OpenTelemetry endpoint입니다.
| OTEL_EXPORTER_OTLP_ENDPOINT | trace용 OpenTelemetry endpoint입니다.
| OTEL_ENVIRONMENT_NAME | OpenTelemetry environment name입니다.
| OTEL_EXPORTER | OpenTelemetry exporter type입니다.
| OTEL_EXPORTER_OTLP_PROTOCOL | OpenTelemetry exporter type입니다.
| OTEL_HEADERS | OpenTelemetry request용 headers입니다.
| OTEL_MODEL_ID | OpenTelemetry tracing용 model ID입니다.
| OTEL_EXPORTER_OTLP_HEADERS | OpenTelemetry request용 headers입니다.
| OTEL_SERVICE_NAME | OpenTelemetry service name identifier입니다.
| OTEL_TRACER_NAME | OpenTelemetry tracing용 tracer name입니다.
| OTEL_LOGS_EXPORTER | OpenTelemetry logs exporter type입니다(예: console).
| OTEL_IGNORE_CONTEXT_PROPAGATION | true이면 parent span context propagation(inbound `traceparent` headers 및 active span)을 무시해 모든 LiteLLM trace가 자체 root가 됩니다. 기본값은 `false`입니다.
| OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT | prompt와 completion을 OpenTelemetry trace에 캡처할지 제어합니다. `NO_CONTENT`(spec 기본값), `SPAN_ONLY`, `EVENT_ONLY`, `SPAN_AND_EVENT`, 또는 boolean 형식(`true`는 `EVENT_ONLY`, `false`는 `NO_CONTENT`)을 허용합니다.
| OTEL_SEMCONV_STABILITY_OPT_IN | 최신 [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/)를 따르는 span을 emit하려면 `gen_ai_latest_experimental`로 설정합니다. LLM-call span을 `{operation} {model}`로 rename하고, `raw_gen_ai_request`를 억제하며, `gen_ai.provider.name`을 추가하고 event를 통합합니다. OTEL spec에 따라 comma-separated로 설정할 수 있습니다.
| USE_OTEL_LITELLM_REQUEST_SPAN | `true`이면 proxy가 LLM call마다 `Received Proxy Server Request` span의 child로 별도 `litellm_request` span을 emit합니다. 기본값은 `false`입니다(v1.81.0 이후). LLM-call attribute는 proxy root span에 직접 설정됩니다. [왜 `litellm_request` span이 보이지 않나요?](/docs/observability/opentelemetry_integration#why-dont-i-see-a-litellm_request-span)를 참고하세요.
| OTEL_DEBUG | `true`이면 exporter와 span creation diagnostics를 stderr에 출력합니다. trace가 backend에 도달하지 않을 때 유용합니다. 기본값은 `false`입니다.
| DEBUG_OTEL | `OTEL_DEBUG`의 alias입니다.
| PAGERDUTY_API_KEY | PagerDuty Alerting용 API key입니다.
| PANW_PRISMA_AIRS_API_KEY | PANW Prisma AIRS service용 API key입니다.
| PANW_PRISMA_AIRS_API_BASE | PANW Prisma AIRS service base URL입니다.
| PHOENIX_API_KEY | Arize Phoenix용 API key입니다.
| PHOENIX_COLLECTOR_ENDPOINT | Arize Phoenix API endpoint입니다.
| PHOENIX_COLLECTOR_HTTP_ENDPOINT | Arize Phoenix API http endpoint입니다.
| PILLAR_API_BASE | Pillar API 가드레일 base URL입니다.
| PILLAR_API_KEY | Pillar API 가드레일용 API key입니다.
| PILLAR_ON_FLAGGED_ACTION | content가 flagged될 때 수행할 action입니다('block' 또는 'monitor').
| PKCE_STRICT_CACHE_MISS | `true`로 설정하면 SSO callback에서 PKCE code_verifier를 cache에서 찾지 못할 때(예: pod 간 cache miss) 401 error를 반환합니다. `false`(기본값)이면 warning을 기록하고 code_verifier 없이 계속합니다.
| POD_NAME | server pod name입니다. 이 값은 `POD_NAME`으로 [`datadog` logs](https://docs.litellm.ai/docs/proxy/logging#datadog)에 emit됩니다.
| POSTHOG_API_KEY | PostHog analytics integration용 API key입니다.
| POSTHOG_API_URL | PostHog API base URL입니다(기본값: https://us.i.posthog.com).
| POSTHOG_MOCK | PostHog integration testing용 mock mode를 활성화합니다. true로 설정하면 실제 network call 없이 PostHog API call을 가로채 mock response를 반환합니다. 기본값은 false입니다.
| POSTHOG_MOCK_LATENCY_MS | mock mode가 활성화된 PostHog API call의 mock latency(ms)입니다. network round-trip time을 simulate합니다. 기본값은 100ms입니다.
| PRISMA_AUTH_RECONNECT_LOCK_TIMEOUT_SECONDS | Prisma auth reconnection용 lock timeout(초)입니다. 기본값은 0.1입니다.
| PRISMA_AUTH_RECONNECT_TIMEOUT_SECONDS | Prisma auth reconnection attempt timeout(초)입니다. 기본값은 2.0입니다.
| PRISMA_HEALTH_WATCHDOG_ENABLED | connection loss를 감시하고 reconnect하는 Prisma DB health watchdog을 활성화합니다. 기본값은 true입니다.
| PRISMA_HEALTH_WATCHDOG_INTERVAL_SECONDS | Prisma health watchdog probe interval(초)입니다. 기본값은 30입니다.
| PRISMA_HEALTH_WATCHDOG_PROBE_TIMEOUT_SECONDS | 각 Prisma health probe timeout(초)입니다. 기본값은 5.0입니다.
| PRISMA_RECONNECT_COOLDOWN_SECONDS | Prisma reconnection attempt 사이의 cooldown(초)입니다. 기본값은 15입니다.
| PRISMA_RECONNECT_ESCALATION_THRESHOLD | reconnection strategy escalate 전 연속 reconnect failure 수입니다. 기본값은 3입니다.
| PRISMA_WATCHDOG_RECONNECT_TIMEOUT_SECONDS | Prisma watchdog이 시작한 reconnection timeout(초)입니다. 기본값은 30.0입니다.
| PREDIBASE_API_BASE | Predibase API base URL입니다.
| PRESIDIO_ANALYZER_API_BASE | Presidio Analyzer service base URL입니다.
| PRESIDIO_ANONYMIZER_API_BASE | Presidio Anonymizer service base URL입니다.
| PROMETHEUS_BUDGET_METRICS_REFRESH_INTERVAL_MINUTES | Prometheus budget metrics refresh interval(분)입니다. 기본값은 5입니다.
| PROMETHEUS_FALLBACK_STATS_SEND_TIME_HOURS | stats를 Prometheus로 보낼 fallback time(시간)입니다. 기본값은 9입니다.
| PROMETHEUS_URL | Prometheus service URL입니다.
| PROMPTLAYER_API_KEY | PromptLayer integration용 API key입니다.
| PROXY_ADMIN_ID | proxy server admin identifier입니다.
| PROXY_BASE_URL | proxy service base URL입니다.
| PROXY_BATCH_WRITE_AT | spend logs를 데이터베이스에 batch write하기 전 대기 시간(초)입니다. 기본값은 10입니다.
| PROXY_BATCH_POLLING_INTERVAL | batch 완료 여부 확인을 위해 polling하기 전 대기 시간(초)입니다. 기본값은 6000s(1 hour)입니다.
| PROXY_BATCH_POLLING_ENABLED | `false`로 설정하면 `CheckBatchCost`와 `CheckResponsesCost` background polling job을 완전히 비활성화합니다. stale managed object가 많은 install에서 긴급 완화에 유용합니다. 기본값은 `true`입니다.
| MAX_OBJECTS_PER_POLL_CYCLE | polling cycle마다 fetch할 managed object(batches / responses)의 최대 수입니다. stale row가 많은 install에서 OOM을 방지합니다. 기본값은 `50`입니다.
| MANAGED_OBJECT_STALENESS_CUTOFF_DAYS | non-terminal state에서 이 일수보다 오래된 managed object는 각 poll cycle 시작 시 `stale_expired`로 표시되고 skip됩니다. 기본값은 `7`입니다.
| PROXY_BUDGET_RESCHEDULER_MAX_TIME | budget reset 확인을 위해 데이터베이스를 조회하기 전 최대 대기 시간(초)입니다. 기본값은 605입니다.
| PROXY_BUDGET_RESCHEDULER_MIN_TIME | budget reset 확인을 위해 데이터베이스를 조회하기 전 최소 대기 시간(초)입니다. 기본값은 597입니다.
| PYTHON_GC_THRESHOLD | GC threshold입니다('gen0,gen1,gen2', 예: '1000,50,50'). 기본값은 Python 값입니다.
| PROXY_LOGOUT_URL | proxy service logout URL입니다.
| QDRANT_API_BASE | Qdrant API base URL입니다.
| QDRANT_API_KEY | Qdrant service용 API key입니다.
| QDRANT_SCALAR_QUANTILE | Qdrant operation용 scalar quantile입니다. 기본값은 0.99입니다.
| QDRANT_URL | Qdrant 데이터베이스 연결 URL입니다.
| QDRANT_VECTOR_SIZE | Qdrant operation용 vector size입니다. 기본값은 1536입니다.
| REDIS_CONNECTION_POOL_TIMEOUT | Redis connection pool timeout(초)입니다. 기본값은 5입니다.
| REDIS_CIRCUIT_BREAKER_FAILURE_THRESHOLD | Redis circuit breaker가 open되기 전 연속 failure 수입니다. 기본값은 5입니다.
| REDIS_CIRCUIT_BREAKER_RECOVERY_TIMEOUT | Redis circuit breaker가 open된 뒤 recovery를 시도하기 전 대기 시간(초)입니다. 기본값은 60입니다.
| REDIS_CLUSTER_NODES | Redis Cluster mode용 Redis cluster startup node의 JSON-formatted list입니다. 예제: `[{"host": "node1", "port": 6379}]`
| REDIS_HOST | Redis server hostname입니다.
| REDIS_PASSWORD | Redis service password입니다.
| REDIS_PORT | Redis server port 번호입니다.
| REDIS_SOCKET_TIMEOUT | Redis socket operation timeout(초)입니다. 기본값은 0.1입니다.
| REDIS_GCP_SERVICE_ACCOUNT | Redis IAM authentication용 GCP service account입니다. 형식: "projects/-/serviceAccounts/name@project.iam.gserviceaccount.com"
| REDIS_GCP_SSL_CA_CERTS | secure GCP Memorystore Redis connection용 SSL CA certificate file path입니다.
| REDOC_URL | Redoc Fast API documentation path입니다. **기본값은 "/redoc"입니다.**
| REPEATED_STREAMING_CHUNK_LIMIT | looping 감지를 위한 repeated streaming chunk limit입니다. 기본값은 100입니다.
| REALTIME_WEBSOCKET_MAX_MESSAGE_SIZE_BYTES | realtime connection에서 WebSocket message의 최대 크기(bytes)입니다. 기본값은 None입니다.
| REPLICATE_MODEL_NAME_WITH_ID_LENGTH | ID가 포함된 Replicate model name 길이입니다. 기본값은 64입니다.
| REPLICATE_POLLING_DELAY_SECONDS | Replicate polling operation delay(초)입니다. 기본값은 0.5입니다.
| REQUEST_TIMEOUT | request timeout(초)입니다. 기본값은 6000입니다.
| ROOT_REDIRECT_URL | DOCS_URL이 "/"가 아닌 값으로 설정된 경우 root path(/)를 redirect할 URL입니다(DOCS_URL 기본값은 "/"입니다).
| ROUTER_MAX_FALLBACKS | router의 최대 fallback 수입니다. 기본값은 5입니다.
| RUBRIK_API_KEY | Rubrik webhook service authentication용 bearer token입니다.
| RUBRIK_BATCH_SIZE | Rubrik으로 flush하기 전 buffer할 log entry 수입니다. 기본값은 512입니다.
| RUBRIK_SAMPLING_RATE | Rubrik에 logging할 request 비율입니다(0.0부터 1.0). 기본값은 1.0입니다.
| RUBRIK_WEBHOOK_URL | tool blocking 및 batch logging용 Rubrik webhook service base URL입니다.
| RUNWAYML_DEFAULT_API_VERSION | RunwayML service 기본 API version입니다. 기본값은 "2024-11-06"입니다.
| RUNWAYML_POLLING_TIMEOUT | RunwayML image generation polling timeout(초)입니다. 기본값은 600(10 minutes)입니다.
| S3_VECTORS_DEFAULT_DIMENSION | S3 Vectors RAG ingestion의 기본 vector dimension입니다. 기본값은 1024입니다.
| S3_VECTORS_DEFAULT_DISTANCE_METRIC | S3 Vectors RAG ingestion의 기본 distance metric입니다. 옵션: "cosine", "euclidean". 기본값은 "cosine"입니다.
| SECRET_MANAGER_REFRESH_INTERVAL | secret manager refresh interval(초)입니다. 기본값은 86400(24 hours)입니다.
| SERVER_ROOT_PATH | server application root path입니다.
| SEND_USER_API_KEY_ALIAS | user API key alias를 Zscaler AI Guard로 전송하는 flag입니다. 기본값은 False입니다.
| SEND_USER_API_KEY_TEAM_ID | user API key team ID를 Zscaler AI Guard로 전송하는 flag입니다. 기본값은 False입니다.
| SEND_USER_API_KEY_USER_ID | user API key user ID를 Zscaler AI Guard로 전송하는 flag입니다. 기본값은 False입니다.
| SET_VERBOSE | [DEPRECATED] 대신 `LITELLM_LOG`를 "INFO", "DEBUG", "ERROR" 값과 함께 사용하세요. [debugging docs](./debugging)를 참고하세요.
| SINGLE_DEPLOYMENT_TRAFFIC_FAILURE_THRESHOLD | single-deployment cooldown logic에서 "reasonable traffic"으로 간주할 최소 request 수입니다. 기본값은 1000입니다.
| SLACK_DAILY_REPORT_FREQUENCY | daily Slack report frequency입니다(예: daily, weekly).
| SLACK_WEBHOOK_URL | Slack integration용 webhook URL입니다.
| SMTP_HOST | SMTP server hostname입니다.
| SMTP_PASSWORD | SMTP authentication용 password입니다(SMTP가 auth를 요구하지 않으면 설정하지 마세요).
| SMTP_PORT | SMTP server port number입니다.
| SMTP_SENDER_EMAIL | SMTP transaction에서 sender로 사용할 email address입니다.
| SMTP_SENDER_LOGO | SMTP로 전송되는 email에 사용할 logo입니다.
| SMTP_TLS | SMTP connection에서 TLS를 활성화/비활성화하는 flag입니다.
| SMTP_USERNAME | SMTP authentication용 username입니다(SMTP가 auth를 요구하지 않으면 설정하지 마세요).
| SENDGRID_API_KEY | SendGrid email service용 API key입니다.
| RESEND_API_KEY | Resend email service용 API key입니다.
| SENDGRID_SENDER_EMAIL | SendGrid email transaction에서 sender로 사용할 email address입니다.
| SPEND_LOGS_URL | spend logs retrieval용 URL입니다.
| SPEND_LOG_CLEANUP_BATCH_SIZE | cleanup 중 batch마다 삭제할 log 수입니다. 기본값은 1000입니다.
| STALE_OBJECT_CLEANUP_BATCH_SIZE | cleanup cycle마다 update할 stale managed object의 최대 수입니다. 기본값은 1000입니다.
| SSL_CERTIFICATE | SSL certificate file path입니다.
| SSL_ECDH_CURVE | SSL/TLS key exchange용 ECDH curve입니다(예: PQC 비활성화를 위한 'X25519').
| SSL_SECURITY_LEVEL | [BETA] SSL/TLS connection security level입니다. 예: `DEFAULT@SECLEVEL=1`
| SSL_VERIFY | SSL certificate verification을 활성화/비활성화하는 flag입니다.
| SSL_CERT_FILE | custom CA bundle용 SSL certificate file path입니다.
| SUPABASE_KEY | Supabase service용 API key입니다.
| SUPABASE_URL | Supabase instance base URL입니다.
| STORE_MODEL_IN_DB | true이면 model과 credential 정보를 DB에 저장합니다.
| SYSTEM_MESSAGE_TOKEN_COUNT | system message token count입니다. 기본값은 4입니다.
| TEST_EMAIL_ADDRESS | testing purpose용 email address입니다.
| TOGETHER_AI_4_B | Together AI 4B model용 size parameter입니다. 기본값은 4입니다.
| TOGETHER_AI_8_B | Together AI 8B model용 size parameter입니다. 기본값은 8입니다.
| TOGETHER_AI_21_B | Together AI 21B model용 size parameter입니다. 기본값은 21입니다.
| TOGETHER_AI_41_B | Together AI 41B model용 size parameter입니다. 기본값은 41입니다.
| TOGETHER_AI_80_B | Together AI 80B model용 size parameter입니다. 기본값은 80입니다.
| TOGETHER_AI_110_B | Together AI 110B model용 size parameter입니다. 기본값은 110입니다.
| TOGETHER_AI_EMBEDDING_150_M | Together AI 150M embedding model용 size parameter입니다. 기본값은 150입니다.
| TOGETHER_AI_EMBEDDING_350_M | Together AI 350M embedding model용 size parameter입니다. 기본값은 350입니다.
| TOOL_CHOICE_OBJECT_TOKEN_COUNT | tool choice object token count입니다. 기본값은 4입니다.
| TOOL_POLICY_CACHE_TTL_SECONDS | tool policy guardrail result caching용 TTL(초)입니다. 기본값은 60입니다.
| UI_LOGO_PATH | UI에서 사용할 logo image path입니다.
| UI_PASSWORD | UI 접근용 password입니다.
| UI_USERNAME | UI 접근용 username입니다.
| UPSTREAM_LANGFUSE_DEBUG | upstream Langfuse debugging을 활성화하는 flag입니다.
| UPSTREAM_LANGFUSE_HOST | upstream Langfuse service host URL입니다.
| UPSTREAM_LANGFUSE_PUBLIC_KEY | upstream Langfuse authentication용 public key입니다.
| UPSTREAM_LANGFUSE_RELEASE | upstream Langfuse release version identifier입니다.
| UPSTREAM_LANGFUSE_SECRET_KEY | upstream Langfuse authentication용 secret key입니다.
| USE_AWS_KMS | encryption에 AWS Key Management Service를 활성화하는 flag입니다.
| USE_PRISMA_MIGRATE | prisma db push 대신 prisma migrate를 사용하는 flag입니다. production environment에 권장됩니다.
| VANTAGE_API_KEY | Vantage cost-import integration용 API key입니다.
| VANTAGE_BASE_URL | Vantage API base URL입니다. 기본값은 `https://api.vantage.sh`입니다.
| VANTAGE_EXPORT_FREQUENCY | Vantage export frequency입니다. `hourly`(기본값), `daily`, `interval` 중 하나입니다.
| VANTAGE_EXPORT_INTERVAL_SECONDS | `VANTAGE_EXPORT_FREQUENCY`가 `interval`일 때 interval(초)입니다.
| VANTAGE_INTEGRATION_TOKEN | cost-import endpoint용 Vantage integration token입니다.
| WANDB_API_KEY | Weights & Biases(W&B) 로깅 integration용 API key입니다.
| WANDB_HOST | Weights & Biases(W&B) service host URL입니다.
| WANDB_PROJECT_ID | Weights & Biases(W&B) 로깅 integration용 project ID입니다.
| WEBHOOK_URL | external service에서 webhook을 수신할 URL입니다.
| SPEND_LOG_RUN_LOOPS | spend_log_cleanup task가 1000개 batch delete를 몇 번 실행할지 설정하는 constant입니다.
| SPEND_LOG_CLEANUP_BATCH_SIZE | cleanup 중 batch마다 삭제할 log 수입니다. 기본값은 1000입니다.
| SPEND_LOG_QUEUE_POLL_INTERVAL | spend log queue polling interval(초)입니다. 기본값은 2.0입니다.
| SPEND_LOG_QUEUE_SIZE_THRESHOLD | processing 전 spend log queue size threshold입니다. 기본값은 100입니다.
| SPEND_LOG_CLEANUP_MAX_CONSECUTIVE_BATCH_FAILURES | spend log cleanup run이 abort되기 전 허용되는 연속 batch failure 수입니다. 기본값은 3입니다.
| SPEND_LOG_CLEANUP_BATCH_FAILURE_BACKOFF_SECONDS | 실패한 spend log cleanup batch 사이의 backoff(초)입니다. 기본값은 0.5입니다.
| SPEND_COUNTER_RESEED_LOCKS_MAX_SIZE | enforcement path에서 DB 기반 concurrent spend-counter reseed를 coalesce하는 per-counter LRU lock dict의 최대 크기입니다. 기본값은 10000입니다.
| COROUTINE_CHECKER_MAX_SIZE_IN_MEMORY | `CoroutineChecker in-memory cache`의 최대 크기입니다. 기본값은 1000입니다.
| DEFAULT_SHARED_HEALTH_CHECK_TTL | shared health check mode에서 cached health check result의 time-to-live(초)입니다. 기본값은 300(5 minutes)입니다.
| DEFAULT_SHARED_HEALTH_CHECK_LOCK_TTL | shared health check mode에서 health check lock의 time-to-live(초)입니다. 기본값은 60(1 minute)입니다.
| ZSCALER_AI_GUARD_API_KEY | Zscaler AI Guard service용 API key입니다.
| ZSCALER_AI_GUARD_POLICY_ID | Zscaler AI Guard guardrails용 policy ID입니다.
| ZSCALER_AI_GUARD_URL | Zscaler AI Guard API base URL입니다. 기본값은 https://api.us1.zseclipse.net/v1/detection/execute-policy 입니다.
