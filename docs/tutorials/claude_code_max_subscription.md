import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Claude Code Max Subscription 사용하기

<div style={{ textAlign: 'center' }}>
<Image img={require('../../img/claude_code_max.png')} style={{ width: '100%', maxWidth: '800px', height: 'auto' }} />

Claude Code Max subscription traffic을 LiteLLM AI Gateway를 통해 routing합니다.
</div>

**direct API 대신 Claude Code Max를 사용하는 이유**
- **비용 절감** - Claude Code를 많이 사용하는 user에게는 Claude Code Max subscription이 token 단위 API pricing보다 저렴합니다.

**LiteLLM을 통해 routing하는 이유**
- **Cost attribution** - user, team, key별 spend를 추적합니다.
- **Budgets & rate limits** - spending cap과 request limit을 설정합니다.
- **가드레일** - 모든 request에 content filtering과 safety control을 적용합니다.



## 빠른 시작 Video

LiteLLM Gateway로 Claude Code를 설정하는 전체 walkthrough를 확인하세요.

<iframe width="840" height="500" src="https://www.loom.com/embed/2d069b9e3bcc4cecaa5eb27a72ba7b3c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 사전 준비

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 설치
- Claude Max 구독
- LiteLLM Gateway 실행 중

## Step 1: LiteLLM Proxy 설정

핵심 설정인 `forward_client_headers_to_llm_api: true`가 포함된 `config.yaml`을 만듭니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514

  - model_name: claude-3-5-sonnet-20241022
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022

  - model_name: claude-3-5-haiku-20241022
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022

general_settings:
  forward_client_headers_to_llm_api: true  # Required: forwards OAuth token to Anthropic

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

:::info `forward_client_headers_to_llm_api`가 필요한 이유

이 설정은 user의 OAuth token(`Authorization` header)을 LiteLLM을 거쳐 Anthropic API로 전달합니다. 그래서 LiteLLM이 tracking과 control을 처리하면서도 각 user가 자신의 Max subscription으로 인증할 수 있습니다.

:::

## Step 2: LiteLLM Proxy 시작

```bash showLineNumbers title="LiteLLM Proxy 시작"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

## Walkthrough

### Part 1: LiteLLM에서 Virtual Key 생성

LiteLLM Dashboard로 이동해 Claude Code 사용을 위한 새 virtual key를 만듭니다.

#### 1.1 가상 키 Page 열기

LiteLLM Dashboard의 가상 키 section으로 이동합니다.

<Image img={require('../../img/claude_code_max/step1.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 1.2 "Create New Key" 클릭

<Image img={require('../../img/claude_code_max/step2.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 1.3 Key 세부 정보 설정

key name(예: `claude-code-test`)을 입력하고 접근을 허용할 model을 선택합니다.

<Image img={require('../../img/claude_code_max/step3.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 1.4 모델 선택

이 key로 접근할 수 있어야 하는 Anthropic model을 선택합니다(예: `anthropic-claude`, `claude-4.5-haiku`).

<Image img={require('../../img/claude_code_max/step5.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 1.5 Model 선택 확인

<Image img={require('../../img/claude_code_max/step7.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 1.6 Key 생성

"Create Key"를 클릭해 virtual key를 생성합니다. 생성된 key value(예: `sk-otsclFlEblQ-6D60ua2IZg`)를 복사합니다.

<Image img={require('../../img/claude_code_max/step8.jpeg')} style={{ width: '800px', height: 'auto' }} />

---

### Part 2: Claude Code Max Plan에 로그인(Client Side)

Claude Code environment variable을 설정하고 Max subscription으로 인증합니다.

#### 2.1 Environment Variable 설정

Claude Code가 virtual key로 LiteLLM Gateway를 사용하도록 설정합니다.

```bash showLineNumbers title="Claude Code Environment Variable 설정"
export ANTHROPIC_BASE_URL=http://localhost:4000
export ANTHROPIC_MODEL="anthropic-claude"
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-api-key: Bearer sk-otsclFlEblQ-6D60ua2IZg"
```

<Image img={require('../../img/claude_code_max/step15.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### Environment Variable 설명

| Variable | 설명 |
|----------|-------------|
| `ANTHROPIC_BASE_URL` | Claude Code가 사용할 LiteLLM Gateway endpoint |
| `ANTHROPIC_MODEL` | LiteLLM `config.yaml`에 설정된 model name |
| `ANTHROPIC_CUSTOM_HEADERS` | LiteLLM 인증용 `x-litellm-api-key` header |

#### 2.2 Claude Code 실행

Claude Code를 시작합니다.

```bash showLineNumbers title="Claude Code 실행"
claude
```

<Image img={require('../../img/claude_code_max/step16.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 2.3 Login Method 선택

"구독이 있는 Claude account"(Pro, Max, Team 또는 엔터프라이즈)을 선택합니다.

<Image img={require('../../img/claude_code_max/step17.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 2.4 Browser에서 승인

Claude Code가 인증을 위해 browser를 엽니다. Claude Max account를 연결하려면 "Authorize"를 클릭합니다.

<Image img={require('../../img/claude_code_max/step19.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 2.5 Login 성공

승인 후 login success confirmation이 표시됩니다.

<Image img={require('../../img/claude_code_max/step20.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 2.6 Setup 완료

Enter를 눌러 security notes를 지나가고 setup을 완료합니다.

<Image img={require('../../img/claude_code_max/step21.jpeg')} style={{ width: '800px', height: 'auto' }} />

---

### Part 3: LiteLLM과 함께 Claude Code 사용

이제 Claude Code를 평소처럼 사용할 수 있으며, 모든 request가 LiteLLM에서 추적됩니다.

#### 3.1 Claude Code에서 Request 보내기

Claude Code를 사용하기 시작하면 request가 LiteLLM Gateway를 통해 흐릅니다.

<Image img={require('../../img/claude_code_max/step24.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 3.2 LiteLLM Dashboard에서 로그 보기

모든 Claude Code request를 보려면 LiteLLM Dashboard의 로그 page로 이동합니다.

<Image img={require('../../img/claude_code_max/step25.jpeg')} style={{ width: '800px', height: 'auto' }} />

#### 3.3 Request 세부 정보 보기

request를 클릭하면 token, cost, duration, 사용 model 등 세부 정보를 볼 수 있습니다.

<Image img={require('../../img/claude_code_max/step27.jpeg')} style={{ width: '800px', height: 'auto' }} />

로그에는 다음 항목이 표시됩니다.
- **Key Name**: `claude-code-test` (생성한 virtual key)
- **Model**: `anthropic/claude-sonnet-4-20250514`
- **Tokens**: 65012 (입력 prompt 64679 + 출력 completion 333)
- **Cost**: $0.249754
- **Status**: Success

<Image img={require('../../img/claude_code_max/step28.jpeg')} style={{ width: '800px', height: 'auto' }} />

---

## 동작 방식

LiteLLM Gateway는 두 가지 authentication을 처리합니다.
1. **`x-litellm-api-key`**: LiteLLM에서 request를 인증합니다(usage tracking, budget, rate limit).
2. **OAuth Token(`Authorization` header 경유)**: Claude Max authentication을 위해 Anthropic API로 전달됩니다.

```mermaid
sequenceDiagram
    participant User as Claude Code User
    participant LiteLLM as LiteLLM AI Gateway
    participant Anthropic as Anthropic API

    User->>LiteLLM: Request with:<br/>- x-litellm-api-key (LiteLLM auth)<br/>- Authorization: Bearer {oauth_token}

    Note over LiteLLM: 1. Validate x-litellm-api-key<br/>2. Check budgets/rate limits<br/>3. Log request for tracking

    LiteLLM->>Anthropic: Forward request with:<br/>- Authorization: Bearer {oauth_token}<br/>(User's Claude Max OAuth token)

    Note over Anthropic: Authenticate user via<br/>OAuth token from Max plan

    Anthropic-->>LiteLLM: Response

    Note over LiteLLM: Log usage, tokens, cost

    LiteLLM-->>User: Response
```

### Header Flow

| Header | 목적 | 처리 주체 |
|--------|---------|------------|
| `x-litellm-api-key` | LiteLLM Gateway 인증, budget tracking, rate limit | LiteLLM |
| `Authorization: Bearer {oauth_token}` | Claude Max 구독 authentication | Anthropic API |

### Complete Request Flow 예제

Claude Code가 LiteLLM을 통해 call할 때 일반적인 request는 다음과 같습니다.

```bash showLineNumbers title="Claude Code에서 LiteLLM으로 보내는 예제 request"
curl -X POST "http://localhost:4000/v1/messages" \
  -H "x-litellm-api-key: Bearer sk-otsclFlEblQ-6D60ua2IZg" \
  -H "Authorization: Bearer oauth_token_from_max_plan" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic-claude",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, Claude!"}]
  }'
```

그 다음 LiteLLM은 다음을 수행합니다.
1. gateway access를 위해 `x-litellm-api-key`를 검증합니다.
2. usage tracking을 위해 request를 logging합니다.
3. `forward_client_headers_to_llm_api: true` 때문에 OAuth `Authorization` header와 함께 request를 Anthropic으로 전달합니다.

## Advanced 설정

### Model별 Header Forwarding

더 세밀하게 제어하려면 특정 model에만 header forwarding을 활성화할 수 있습니다.

```yaml showLineNumbers title="config.yaml - model별 header forwarding"
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514

  - model_name: claude-3-5-haiku-20241022
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  model_group_settings:
    forward_client_headers_to_llm_api:
      - anthropic-claude
      - claude-3-5-haiku-20241022
```

### Budget Control

Max subscription을 사용하면서 user별 budget을 설정합니다.

```yaml showLineNumbers title="config.yaml - budget tracking용 database 포함"
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514

general_settings:
  forward_client_headers_to_llm_api: true
  database_url: "postgresql://..."

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

그 다음 budget이 설정된 virtual key를 만듭니다.

```bash showLineNumbers title="budget이 있는 virtual key 생성"
curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key_alias": "developer-1",
    "max_budget": 100.00,
    "budget_duration": "monthly"
  }'
```

## 문제 해결

### OAuth Token이 전달되지 않음

**증상**: Anthropic API에서 인증 error 발생

**해결 방법**: config에 `forward_client_headers_to_llm_api: true`가 설정되어 있는지 확인합니다.

```yaml showLineNumbers title="config.yaml - header forwarding 활성화"
general_settings:
  forward_client_headers_to_llm_api: true
```

### LiteLLM 인증 실패

**증상**: LiteLLM Gateway에서 401 error 발생

**해결 방법**: `ANTHROPIC_CUSTOM_HEADERS`에 `x-litellm-api-key` header가 올바르게 설정되어 있는지 확인합니다.

```bash showLineNumbers title="key info 확인"
curl -X GET "http://localhost:4000/key/info" \
  -H "Authorization: Bearer sk-otsclFlEblQ-6D60ua2IZg"
```

### Model Not Found

**증상**: model not found error 발생

**해결 방법**: `ANTHROPIC_MODEL`이 config의 model name과 일치하는지 확인합니다.

```bash showLineNumbers title="사용 가능한 model 목록"
curl "http://localhost:4000/v1/models" \
  -H "Authorization: Bearer sk-otsclFlEblQ-6D60ua2IZg"
```

## 관련 문서

- [Forward Client Headers](/litellm-docs-kr/docs/proxy/forward_client_headers) - 자세한 header forwarding 설정
- [Claude Code 빠른 시작](/litellm-docs-kr/docs/tutorials/claude_responses_api) - 기본 Claude Code + LiteLLM setup
- [가상 키](/litellm-docs-kr/docs/proxy/virtual_keys) - API key 생성 및 관리
- [Budgets & Rate Limits](/litellm-docs-kr/docs/proxy/users) - usage control 설정
