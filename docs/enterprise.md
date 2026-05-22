import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ✨ 엔터프라이즈

:::info

- **무료 체험**: [7일 enterprise license](https://www.litellm.ai/enterprise#trial)
- **문의하기**: [데모 예약](https://enterprise.litellm.ai/demo)
- **SSO는 최대 5명까지 무료입니다.** 그 이상은 enterprise license가 필요합니다.

:::

## 엔터프라이즈는 누구를 위한 것인가요?

LiteLLM을 대규모로 운영하는 팀을 위한 제품입니다. 100명 이상의 사용자 또는 10개 이상의 프로덕션 AI use case가 있고, OSS 위에 SSO, audit log, 세밀한 access control, 전문 지원이 필요한 팀에 적합합니다. 대상에 해당하는지 확실하지 않다면 [문의해 주세요](https://enterprise.litellm.ai/demo).

## 왜 엔터프라이즈인가요?

LiteLLM OSS는 OpenAI-compatible gateway, virtual key, spend tracking, budget, fallback, request/response logging 같은 기본 기능을 이미 제공합니다. 엔터프라이즈는 더 큰 조직이 수백 명의 사용자와 수십 개 application에 LLM access를 안전하게 제공하는 데 필요한 제어 기능을 추가합니다.

| | **OSS** | **엔터프라이즈** |
|---|---|---|
| **인증** | API key | SSO + SCIM, OIDC/JWT |
| **Key 관리** | LLM API, MCP, Agent 전반의 virtual key, user, team | Organization, org/team admin, delegated admin role |
| **보안** | — | Key rotation, secret manager read/write |
| **가드레일** | 항상 실행 / 요청 기반 | Key 및 team 범위 guardrail |
| **로깅** | Request/response logging, Prometheus metric | Key/team별 Langfuse, Langsmith, Arize 등으로 routing. Management operation log |
| **배포** | Single-region proxy | Multi-region architecture용 control plane |

## 핵심 엔터프라이즈 기능

### 보안 및 접근 제어

- **[관리자 UI용 SSO](./proxy/ui.md#-enterprise-features)** - Okta, Azure AD, Google Workspace 및 모든 OIDC/SAML provider
- **[JWT 기반 인증](./proxy/token_auth.md)** - Identity provider token으로 요청 인증
- **[보존 정책이 있는 audit log](./proxy/multiple_admins.md)** - 모든 admin action과 key-level 변경 추적
- **[Role-Based Access Control](./proxy/access_control.md)** - Organization, team, user role 관리
- **[Public/private route 제어](./proxy/public_routes.md)** - Admin route를 제한하고 노출 면적 축소
- **[IP address 기반 access control list](./proxy/ip_address.md)** - 특정 CIDR range로 proxy access 제한
- **[Key rotation](./proxy/virtual_keys.md#-key-rotations)** - Virtual key rotation 자동화
- **[Secret Manager](./secret_managers/overview.md)** - AWS KMS, AWS Secrets Manager, Azure Key Vault, Google KMS, Google Secret Manager, HashiCorp Vault, CyberArk 또는 custom secret manager
- **[AI Hub](./proxy/ai_hub.md)** - 사용 가능한 model과 agent를 사용자에게 공개 branded page로 공유

### 거버넌스 및 비용 제어

- **[멀티테넌트 아키텍처](./proxy/multi_tenant_architecture.md)** - Organizations -> Teams -> Projects -> Keys
- **[Project Management](./proxy/project_management.md)** - Budget, owner, isolated spend tracking과 함께 application 또는 use case별로 key grouping
- **[Tag 기반 budget](./proxy/provider_budget_routing.md)** - Custom tag별 budget 및 spend tracking
- **[Virtual Key별 model-specific budget](./proxy/users.md)** - Model별, key별 서로 다른 limit
- **[임시 budget 증가](./proxy/temporary_budget_increase.md)** - 영구 변경 없이 시간 제한 spend bump 적용
- **[Soft budget email alert](./proxy/ui_team_soft_budget_alerts.md)** - Hard limit에 도달하기 전에 team에 경고
- **[Spend report 생성](./proxy/cost_tracking.md#-enterprise-generate-spend-reports)** - Key/team/tag/model별 spend에 programmatic access 제공

### 관측성 및 Compliance

- **[Team-Based Logging](./proxy/team_logging.md)** - 각 team의 log를 해당 team의 Langfuse project 또는 callback으로 routing
- **[Team별 logging 비활성화](/litellm-docs-kr/docs/proxy/team_logging#disable-logging-for-a-team)** - Team level GDPR-friendly opt-out
- **[GCS / Azure Blob으로 log export](./observability/gcs_bucket_integration.md)** - Compliance를 위한 durable storage
- **[Key/team별 guardrail](#guardrails---secret-detectionredaction)** - Secret redaction, content moderation, banned keyword
- **필수 param 강제** - 필수 metadata가 없는 요청 거부

### 운영 및 Branding

- **[Custom Swagger branding](#swagger-docs---custom-routes--branding)** - 자체 title, description, filtered route 사용
- **[Custom email branding](./proxy/email.md#customizing-email-branding)** - System email에 자체 logo와 color 적용
- **최대 request/response size limit** - 과도한 payload로부터 proxy 보호
- **[Team-managed model](./proxy/team_model_add.md)** - Team이 자체 key와 fine-tune을 가져올 수 있도록 허용

### Projects

[Projects](./proxy/project_management.md)는 application 또는 use case별로 virtual key를 묶을 수 있게 해줍니다. 각 project는 자체 budget, owner, rate limit, isolated spend view를 가지며, 하나의 team이 여러 app을 운영하고 app별 별도 reporting이 필요한 경우 유용합니다.

- Application, environment, customer별 key grouping
- Project별 budget, rate limit, model allowlist
- 전담 owner 및 spend dashboard
- Organization, team, tag와 함께 동작

설정 방법은 [Project Management](./proxy/project_management.md)와 [UI walkthrough](./proxy/ui_project_management.md)를 참고하세요.

---


## 배포 옵션

### Self-Hosted

자체 infrastructure에 Docker image를 배포하거나 pip package에서 build합니다. 위 enterprise 기능을 활성화하는 license key와 전용 support channel을 제공합니다.

```env
LITELLM_LICENSE="eyJ..."
```

**데이터는 사용자 environment를 벗어나지 않습니다.** [AWS 및 Azure Marketplace를 통한 procurement가 가능합니다.](./data_security.md#legalcompliance-faqs)

가격은 deployment size에 따라 달라집니다. 범위 산정을 위해 [문의해 주세요](https://enterprise.litellm.ai/demo).

### LiteLLM Cloud 호스팅 {#hosted-litellm-cloud}

Proxy는 LiteLLM이 운영하고, 사용자는 제품에 집중합니다.

- **상태**: GA - [live reliability](https://status.litellm.ai/)
- **Scale**: 초당 1k request로 test 완료
- **Compliance**: SOC 2 Type 2 및 ISO 27001 인증
- **Region**: [지원되는 data region](../docs/data_security#supported-data-regions-for-litellm-cloud)

---

## 전문 지원

모든 enterprise license에는 integration, deployment, provider troubleshooting을 위한 engineering team 전용 Slack/Teams channel이 포함됩니다.

| 심각도 | Response SLA |
|---|---|
| **Sev 0** - production traffic 100% 실패 | 1시간 |
| **Sev 1** - 부분적 production 영향 | 6시간 |
| **Sev 2-3** - 설정 문제, 긴급하지 않은 bug | 24시간(PT 7am-7pm, 월-토) |
| **Security patch** | 72시간 |

요청 시 custom SLA를 제공할 수 있습니다.

---

## Public AI Hub

사용 가능한 model, MCP, Agent, skill을 사용자에게 공개 page로 공유합니다.

[자세히 알아보기](./proxy/ai_hub.md)

<Image img={require('../img/everything_ai_hub.png')} style={{ width: '900px', height: 'auto' }}/>

## Secret Managers

LiteLLM 엔터프라이즈는 다음 secret manager와 통합됩니다.

- [AWS KMS](./secret_managers/aws_kms.md)
- [AWS Secrets Manager 문서](./secret_managers/aws_secret_manager.md)
- [Azure Key Vault](./secret_managers/azure_key_vault.md)
- [Google KMS](./secret_managers/google_kms.md)
- [Google Secret Manager 문서](./secret_managers/google_secret_manager.md)
- [HashiCorp Vault](./secret_managers/hashicorp_vault.md)
- [CyberArk](./secret_managers/cyberark)
- [Custom Secret Manager 문서](./secret_managers/custom_secret_manager.md)

설정 방법은 [Secret Managers overview](./secret_managers/overview.md)를 참고하세요.


## 엔터프라이즈 기능 reference

이 페이지의 나머지 부분은 전체 기능 reference입니다. 각 enterprise capability에 대한 configuration snippet과 예제를 제공합니다.

### 💸 비용 추적

#### Tag별 spend 보기

#### `/spend/tags` 요청 형식
```shell
curl -X GET "http://0.0.0.0:4000/spend/tags" \
-H "Authorization: Bearer sk-1234"
```

#### `/spend/tags`응답 형식
```shell
[
  {
    "individual_request_tag": "model-anthropic-claude-v2.1",
    "log_count": 6,
    "total_spend": 0.000672
  },
  {
    "individual_request_tag": "app-ishaan-local",
    "log_count": 4,
    "total_spend": 0.000448
  },
  {
    "individual_request_tag": "app-ishaan-prod",
    "log_count": 2,
    "total_spend": 0.000224
  }
]
```

:::tip
Budget, alert, 상세 analytics를 포함한 전체 spend tracking 기능은 [비용 추적](./proxy/cost_tracking.md)을 참고하세요.

:::

### Web crawler 차단

Web crawler가 proxy server endpoint를 indexing하지 못하게 하려면 `litellm_config.yaml` 파일에서 `block_robots` setting을 `true`로 설정하세요.

```yaml showLineNumbers title="litellm_config.yaml"
general_settings:
  block_robots: true
```

#### 동작 방식

이 기능을 활성화하면 `/robots.txt` endpoint가 다음 content와 함께 200 status code를 반환합니다.

```shell showLineNumbers title="robots.txt"
User-agent: *
Disallow: /
```

### LLM 요청의 필수 Param

모든 요청이 특정 param을 반드시 포함하도록 강제하려면 이 기능을 사용하세요. 예를 들어 모든 요청에 `user` 및 `["metadata]["generation_name"]` param이 필요할 수 있습니다.

<Tabs>

<TabItem value="config" label="Config에 설정">

**1단계** config.yaml에서 강제할 모든 param을 정의합니다.

이는 LiteLLM으로 들어오는 모든 LLM request에 `["user"]`와 `["metadata]["generation_name"]`이 필요하다는 뜻입니다.

```yaml
general_settings:
  master_key: sk-1234
  enforced_params:
    - user
    - metadata.generation_name
```
</TabItem>

<TabItem value="key" label="Key에 설정">

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "enforced_params": ["user", "metadata.generation_name"]
}'
```

</TabItem>
</Tabs>

**2단계 동작 확인**

<Tabs>

<TabItem value="bad" label="Invalid Request (`user` 없음)">

```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-5fmYeaUEbAMpwBNT-QpxyA' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "hi"
        }
    ]
}'
```

예상 응답

```shell
{"error":{"message":"Authentication Error, BadRequest please pass param=user in request body. This is a required param","type":"auth_error","param":"None","code":401}}%
```

</TabItem>

<TabItem value="bad2" label="Invalid Request (`metadata` 없음)">

```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-5fmYeaUEbAMpwBNT-QpxyA' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "user": "gm",
    "messages": [
        {
        "role": "user",
        "content": "hi"
        }
    ],
   "metadata": {}
}'
```

예상 응답

```shell
{"error":{"message":"Authentication Error, BadRequest please pass param=[metadata][generation_name] in request body. This is a required param","type":"auth_error","param":"None","code":401}}%
```

</TabItem>
<TabItem value="good" label="Valid Request">

```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-5fmYeaUEbAMpwBNT-QpxyA' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "user": "gm",
    "messages": [
        {
        "role": "user",
        "content": "hi"
        }
    ],
   "metadata": {"generation_name": "prod-app"}
}'
```

예상 응답

```shell
{"id":"chatcmpl-9XALnHqkCBMBKrOx7Abg0hURHqYtY","choices":[{"finish_reason":"stop","index":0,"message":{"content":"Hello! How can I assist you today?","role":"assistant"}}],"created":1717691639,"model":"gpt-3.5-turbo-0125","object":"chat.completion","system_fingerprint":null,"usage":{"completion_tokens":9,"prompt_tokens":8,"total_tokens":17}}%
```

</TabItem>
</Tabs>

### 사용 가능한 public/private route 제어

[Control Public & Private Routes](./proxy/public_routes.md)에서 public route, admin-only route, allowed route, wildcard pattern 설정에 대한 자세한 문서를 확인하세요.


## 가드레일 - Secret Detection/Redaction
❓ LLM 요청에 포함되어 전송되는 API key와 secret을 REDACT하려면 이 기능을 사용하세요.

예를 들어 다음 요청에서 `OPENAI_API_KEY` 값을 redact하려는 경우입니다.

#### 들어오는 요청

```json
{
    "messages": [
        {
            "role": "user",
            "content": "Hey, how's it going, API_KEY = 'sk_1234567890abcdef'",
        }
    ]
}
```

#### Moderation 이후 요청

```json
{
    "messages": [
        {
            "role": "user",
            "content": "Hey, how's it going, API_KEY = '[REDACTED]'",
        }
    ]
}
```

**사용법**

**1단계** config.yaml에 다음을 추가합니다.

```yaml
litellm_settings:
  callbacks: ["hide_secrets"]
```

**2단계** server log를 확인할 수 있도록 `--detailed_debug`로 litellm proxy를 실행합니다.

```
litellm --config config.yaml --detailed_debug
```

**3단계** 요청으로 test합니다.

다음 요청을 보냅니다.
```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "what is the value of my open ai key? openai_api_key=sk-1234998222"
        }
    ]
}'
```

litellm server log에서 다음 warning을 확인할 수 있습니다.

```shell
LiteLLM Proxy:WARNING: secret_detection.py:88 - Detected and redacted secrets in message: ['Secret Keyword']
```

litellm에서 API Provider로 전송한 raw request도 확인할 수 있습니다.
```json
POST Request Sent from LiteLLM:
curl -X POST \
https://api.groq.com/openai/v1/ \
-H 'Authorization: Bearer gsk_mySVchjY********************************************' \
-d {
  "model": "llama3-8b-8192",
  "messages": [
    {
      "role": "user",
      "content": "what is the time today, openai_api_key=[REDACTED]"
    }
  ],
  "stream": false,
  "extra_body": {}
}
```

### API Key별 Secret Detection 켜기/끄기 {#secret-detection-onoff}

❓ API Key별로 guardrail을 켜거나 끄고 싶을 때 사용합니다.

**1단계** `hide_secrets`가 꺼진 key를 생성합니다.

👉 `/key/generate` 또는 `/key/update`로 `"permissions": {"hide_secrets": false}`를 설정합니다.

이는 해당 API Key에서 오는 모든 request에 대해 `hide_secrets` guardrail이 꺼져 있다는 뜻입니다.

<Tabs>
<TabItem value="/key/generate" label="/key/generate">

```shell
curl --location 'http://0.0.0.0:4000/key/generate' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "permissions": {"hide_secrets": false}
}'
```

```shell
# {"permissions":{"hide_secrets":false},"key":"sk-jNm1Zar7XfNdZXp49Z1kSQ"}
```

</TabItem>
<TabItem value="/key/update" label="/key/update">

```shell
curl --location 'http://0.0.0.0:4000/key/update' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
        "key": "sk-jNm1Zar7XfNdZXp49Z1kSQ",
        "permissions": {"hide_secrets": false}
}'
```

```shell
# {"permissions":{"hide_secrets":false},"key":"sk-jNm1Zar7XfNdZXp49Z1kSQ"}
```

</TabItem>
</Tabs>

**2단계** 새 key로 test합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-jNm1Zar7XfNdZXp49Z1kSQ' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "does my openai key look well formatted OpenAI_API_KEY=sk-1234777"
        }
    ]
}'
```

Callback의 server log에서 `sk-1234777`을 확인할 수 있어야 합니다.

:::info
api key=sk-jNm1Zar7XfNdZXp49Z1kSQ에 `"permissions": {"hide_secrets": false}`가 있으므로 이 request에서는 `hide_secrets` guardrail check가 실행되지 않았습니다.
:::

## Content Moderation
### LLM Guard로 Content Moderation

Environment에 LLM Guard API Base를 설정합니다.

```env
LLM_GUARD_API_BASE = "http://0.0.0.0:8192" # deployed llm guard api
```

`llmguard_moderations`를 callback으로 추가합니다.

```yaml
litellm_settings:
    callbacks: ["llmguard_moderations"]
```

이제 쉽게 test할 수 있습니다.

- 일반 /chat/completion 호출을 실행합니다.

- Proxy log에서 `LLM Guard:`가 포함된 statement를 확인합니다.

예상 결과:

```
LLM Guard: Received response - {"sanitized_prompt": "hello world", "is_valid": true, "scanners": { "Regex": 0.0 }}
```
#### Key별 on/off

**1. Config 업데이트**
```yaml
litellm_settings:
    callbacks: ["llmguard_moderations"]
    llm_guard_mode: "key-specific"
```

**2. 새 key 생성**

```bash
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "models": ["fake-openai-endpoint"],
    "permissions": {
        "enable_llm_guard_check": true # 👈 KEY CHANGE
    }
}'

# Returns {..'key': 'my-new-key'}
```

**3. Test 실행**

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer my-new-key' \ # 👈 TEST KEY
--data '{"model": "fake-openai-endpoint", "messages": [
        {"role": "system", "content": "Be helpful"},
        {"role": "user", "content": "What do you know?"}
    ]
    }'
```

#### Request별 on/off

**1. Config 업데이트**
```yaml
litellm_settings:
    callbacks: ["llmguard_moderations"]
    llm_guard_mode: "request-specific"
```

**2. 새 key 생성**

```bash
curl --location 'http://localhost:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data '{
    "models": ["fake-openai-endpoint"],
}'

# Returns {..'key': 'my-new-key'}
```

**3. Test 실행**

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": {
            "permissions": {
                "enable_llm_guard_check": True # 👈 KEY CHANGE
            },
        }
    }
)

print(response)
```
</TabItem>
<TabItem value="curl" label="Curl Request">

```bash
curl --location 'http://0.0.0.0:4000/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer my-new-key' \ # 👈 TEST KEY
--data '{"model": "fake-openai-endpoint", "messages": [
        {"role": "system", "content": "Be helpful"},
        {"role": "user", "content": "What do you know?"}
    ]
    }'
```

</TabItem>
</Tabs>

### LlamaGuard로 Content Moderation

현재 Sagemaker의 LlamaGuard endpoint와 함께 동작합니다.

config.yaml에서 활성화하는 방법:

```yaml
litellm_settings:
   callbacks: ["llamaguard_moderations"]
   llamaguard_model_name: "sagemaker/jumpstart-dft-meta-textgeneration-llama-guard-7b"
```

Environment에 관련 key가 있는지 확인하세요. 예:

```
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""
```

#### LlamaGuard prompt 사용자 지정 {#llamaguard-prompt-customize}

LlamaGuard가 평가하는 unsafe category를 수정하려면 [이 category list](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/llamaguard_prompt.txt)의 자체 version을 만들면 됩니다.

Proxy가 해당 파일을 바라보도록 설정합니다.

```yaml
callbacks: ["llamaguard_moderations"]
  llamaguard_model_name: "sagemaker/jumpstart-dft-meta-textgeneration-llama-guard-7b"
  llamaguard_unsafe_content_categories: /path/to/llamaguard_prompt.txt
```

### Google Text Moderation으로 Content Moderation

`.env`에 GOOGLE_APPLICATION_CREDENTIALS가 설정되어 있어야 합니다(VertexAI와 동일).

config.yaml에서 활성화하는 방법:

```yaml
litellm_settings:
   callbacks: ["google_text_moderation"]
```

#### Custom confidence threshold 설정

Google Moderations는 여러 category에 대해 text를 검사합니다. [Source](https://cloud.google.com/natural-language/docs/moderating-text#safety_attribute_confidence_scores)

#### 전역 기본 confidence threshold 설정 {#global-default-confidence-threshold}

기본값은 0.8입니다. config.yaml에서 override할 수 있습니다.

```yaml
litellm_settings:
    google_moderation_confidence_threshold: 0.4
```

#### Category-specific confidence threshold 설정

config.yaml에서 category별 confidence threshold를 설정합니다. 설정하지 않으면 global default가 사용됩니다.

```yaml
litellm_settings:
    toxic_confidence_threshold: 0.1
```

Category별 값은 다음과 같습니다.

| Category | 설정 |
| -------- | -------- |
| "toxic" | toxic_confidence_threshold: 0.1 |
| "insult" | insult_confidence_threshold: 0.1 |
| "profanity" | profanity_confidence_threshold: 0.1 |
| "derogatory" | derogatory_confidence_threshold: 0.1 |
| "sexual" | sexual_confidence_threshold: 0.1 |
| "death_harm_and_tragedy" | death_harm_and_tragedy_threshold: 0.1 |
| "violent" | violent_threshold: 0.1 |
| "firearms_and_weapons" | firearms_and_weapons_threshold: 0.1 |
| "public_safety" | public_safety_threshold: 0.1 |
| "health" | health_threshold: 0.1 |
| "religion_and_belief" | religion_and_belief_threshold: 0.1 |
| "illicit_drugs" | illicit_drugs_threshold: 0.1 |
| "war_and_conflict" | war_and_conflict_threshold: 0.1 |
| "politics" | politics_threshold: 0.1 |
| "finance" | finance_threshold: 0.1 |
| "legal" | legal_threshold: 0.1 |

## Swagger 문서 - Custom Routes + Branding

:::info

사용하려면 LiteLLM 엔터프라이즈 key가 필요합니다. [여기](https://forms.gle/sTDVprBs18M4V8Le8)에서 2주 무료 license를 받을 수 있습니다.

:::

Environment에 LiteLLM key를 설정합니다.

```bash
LITELLM_LICENSE=""
```

#### Title + Description 사용자 지정 {#title--description-customize}

Environment에서 다음을 설정합니다.

```bash
DOCS_TITLE="TotalGPT"
DOCS_DESCRIPTION="Sample Company Description"
```

#### Route customize

사용자에게 admin route를 숨깁니다.

Environment에서 다음을 설정합니다.

```bash
DOCS_FILTERED="True" # only shows openai routes to user
```

<Image img={require('../img/custom_swagger.png')}  style={{ width: '900px', height: 'auto' }} />

## Blocked User List 활성화
이 user id로 proxy에 호출이 들어오면 거부됩니다. 사용자가 AI 기능을 opt-out할 수 있게 하려면 이 기능을 사용하세요.

```yaml
litellm_settings:
     callbacks: ["blocked_user_check"]
     blocked_user_list: ["user_id_1", "user_id_2", ...]  # can also be a .txt filepath e.g. `/relative/path/blocked_list.txt`
```

### Test 방법

<Tabs>

<TabItem value="openai" label="OpenAI Python v1.0.0+">

Opt-out했을 수 있는 사용자의 user id로 `user=<user_id>`를 설정합니다.

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    user="user_id_1"
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl Request">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
      "user": "user_id_1" # this is also an openai supported param
    }
'
```

</TabItem>
</Tabs>

:::info

[개선 제안하기](https://github.com/BerriAI/litellm/issues/new/choose)

:::

### API로 사용

**Customer id에 대한 모든 호출 차단**

```
curl -X POST "http://0.0.0.0:4000/customer/block" \
-H "Authorization: Bearer sk-1234" \
-D '{
"user_ids": [<user_id>, ...]
}'
```

**User id에 대한 호출 차단 해제**

```
curl -X POST "http://0.0.0.0:4000/user/unblock" \
-H "Authorization: Bearer sk-1234" \
-D '{
"user_ids": [<user_id>, ...]
}'
```

## Banned Keywords List 활성화

```yaml
litellm_settings:
     callbacks: ["banned_keywords"]
     banned_keywords_list: ["hello"] # can also be a .txt file - e.g.: `/relative/path/keywords.txt`
```

### Test 방법

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "Hello world!"
        }
      ]
    }
'
```

## LiteLLM Proxy에서 최대 Request / Response Size 설정

Proxy server의 최대 request / response size를 설정하려면 이 기능을 사용하세요. Request size가 limit을 넘으면 거부되고 Slack alert가 트리거됩니다.

#### 사용법
**1단계.** `max_request_size_mb`와 `max_response_size_mb` 설정

이 예제에서는 `max_request_size_mb`를 매우 낮게 설정해 요청이 거부되는 것을 확인합니다.

:::info
Production에서는 `max_request_size_mb` / `max_response_size_mb`를 약 `32 MB`로 설정하는 것을 권장합니다.

:::

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
general_settings:
  master_key: sk-1234

  # Security controls
  max_request_size_mb: 0.000000001 # 👈 Key Change - Max Request Size in MB. Set this very low for testing
  max_response_size_mb: 100 # 👈 Key Change - Max Response Size in MB
```

**2단계.** `/chat/completions` request로 test

```shell
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

**Request의 예상 응답**
Request size가 `max_request_size_mb`를 넘기 때문에 실패해야 합니다.
```shell
{"error":{"message":"Request size is too large. Request size is 0.0001125335693359375 MB. Max size is 1e-09 MB","type":"bad_request_error","param":"content-length","code":400}}
```

---

## FAQ

### 엔터프라이즈 License는 어떻게 설정하고 검증하나요?

1. Environment에 license key를 추가합니다.

   ```env
   LITELLM_LICENSE="eyJ..."
   ```

2. LiteLLM Proxy를 재시작합니다.

3. `http://<your-proxy-host>:<port>/`를 엽니다. Swagger page description에 **"엔터프라이즈 Edition"**이 표시되어야 합니다. 표시되지 않으면 key가 올바른지, 만료되지 않았는지, proxy가 완전히 재시작되었는지 확인하세요.

### Data security와 compliance는 어디에서 더 볼 수 있나요?

[Data Security / Legal / Compliance FAQs](./data_security.md)를 참고하세요.

### 가격 구조는 어떻게 되나요?

가격은 사용량 기반입니다. 팀에 맞춘 견적은 [문의해 주세요](https://enterprise.litellm.ai/demo).

### 재시작 없이 새 model의 day-0 support를 받으려면 어떻게 하나요?

[Auto Sync New 모델](./proxy/sync_models_github.md)을 사용해 GitHub에서 최신 pricing 및 context-window data를 필요 시 또는 schedule에 따라 가져오세요. 재시작은 필요 없습니다. `POST /reload/model_cost_map`으로 manual sync를 실행하거나, `POST /schedule/model_cost_map_reload?hours=6`으로 주기적 sync를 schedule할 수 있습니다.
