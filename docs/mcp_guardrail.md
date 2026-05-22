import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 가드레일

LiteLLM은 보안과 컴플라이언스를 보장하기 위해 MCP 도구 호출에 가드레일을 적용할 수 있습니다. MCP 호출 전이나 호출 중에 가드레일이 실행되도록 구성하여 입력을 검증하고 민감한 정보를 차단하거나 마스킹할 수 있습니다.

### 지원되는 MCP 가드레일 모드 {#supported-mcp-guardrail-modes}

MCP 가드레일은 다음 모드를 지원합니다.

- `pre_mcp_call`: MCP 호출 **전**에 **입력**을 대상으로 실행됩니다. MCP 요청에 검증, 마스킹, 차단을 적용하려면 이 모드를 사용하세요.
- `during_mcp_call`: MCP 호출 실행 **중**에 실행됩니다. 실시간 모니터링과 개입이 필요할 때 이 모드를 사용하세요.

### 설정 예제

MCP 도구 호출 전에 가드레일을 실행하여 입력을 검증하고 정리하도록 구성합니다.

```yaml title="config.yaml" showLineNumbers
guardrails:
  - guardrail_name: "mcp-input-validation"
    litellm_params:
      guardrail: presidio  # or other supported guardrails
      mode: "pre_mcp_call" # or during_mcp_call
      pii_entities_config:
        CREDIT_CARD: "BLOCK"  # Will block requests containing credit card numbers
        EMAIL_ADDRESS: "MASK"  # Will mask email addresses
        PHONE_NUMBER: "MASK"   # Will mask phone numbers
      default_on: true
```


### 사용법 예제

#### Pre-MCP Call 가드레일 테스트 {#testing-pre-mcp-call-guardrails}

민감한 정보가 포함된 요청으로 MCP 가드레일을 테스트합니다.

```bash title="Test MCP Guardrail" showLineNumbers
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "My credit card is 4111-1111-1111-1111 and my email is john@example.com"}
    ],
    "guardrails": ["mcp-input-validation"]
  }'
```

요청은 다음과 같이 처리됩니다.
1. 신용카드 번호가 차단됩니다(요청 거부).
2. 이메일 주소가 마스킹됩니다(예: `<EMAIL_ADDRESS>`로 대체).

#### MCP 도구와 함께 사용 {#using-with-mcp-tools}

MCP 도구를 사용할 때 가드레일은 도구 입력에 적용됩니다.

```python title="Python Example with MCP Guardrails" showLineNumbers
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="http://localhost:4000"
)

# This request will trigger MCP guardrails
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "Send an email to 555-123-4567 with my SSN 123-45-6789"}
    ],
    tools=[{"type": "mcp", "server_label": "litellm", "server_url": "litellm_proxy"}],
    guardrails=["mcp-input-validation"]
)
```

### 지원되는 가드레일 프로바이더 {#supported-guardrail-providers}

MCP 가드레일은 LiteLLM이 지원하는 모든 가드레일 프로바이더와 함께 작동합니다.

- **Presidio**: PII 탐지 및 마스킹
- **Bedrock**: AWS Bedrock 가드레일
- **Lakera**: 콘텐츠 모더레이션
- **Aporia**: 사용자 지정 가드레일
- **Noma**: Noma Security
- **PANW Prisma AIRS**: Prisma AIRS 가드레일
- **Custom**: 자체 가드레일 구현
