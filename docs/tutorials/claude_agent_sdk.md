import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM에서 Claude Agent SDK 사용하기 {#claude-agent-sdk-with-litellm}

LiteLLM Proxy를 통해 모든 LLM 공급자에서 Anthropic의 Claude Agent SDK를 사용할 수 있습니다.

Claude Agent SDK는 AI 에이전트를 빌드하기 위한 고수준 인터페이스를 제공합니다. LiteLLM을 대상으로 지정하면 동일한 에이전트 코드를 OpenAI, Bedrock, Azure, Vertex AI 또는 다른 공급자와 함께 사용할 수 있습니다.

## 빠른 시작

### 1. 의존성 설치 {#1-install-dependencies}

```bash
uv add claude-agent-sdk
```

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: bedrock-claude-sonnet-3.5
    litellm_params:
      model: "bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0"
      aws_region_name: "us-east-1"

  - model_name: bedrock-claude-sonnet-4
    litellm_params:
      model: "bedrock/us.anthropic.claude-sonnet-4-20250514-v1:0"
      aws_region_name: "us-east-1"

  - model_name: bedrock-claude-sonnet-4.5
    litellm_params:
      model: "bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0"
      aws_region_name: "us-east-1"

  - model_name: bedrock-claude-opus-4.5
    litellm_params:
      model: "bedrock/us.anthropic.claude-opus-4-5-20251101-v1:0"
      aws_region_name: "us-east-1"

  - model_name: bedrock-nova-premier
    litellm_params:
      model: "bedrock/amazon.nova-premier-v1:0"
      aws_region_name: "us-east-1"
```

```bash
litellm --config config.yaml
```

### 3. Agent SDK가 LiteLLM을 가리키도록 설정 {#3-point-agent-sdk-to-litellm}

| 환경 변수 | 값 | 설명 |
|---------------------|-------|-------------|
| `ANTHROPIC_BASE_URL` | `http://localhost:4000` | LiteLLM Proxy URL |
| `ANTHROPIC_API_KEY` | `sk-1234` | LiteLLM API 키(Anthropic 키가 아님) |

```python title="agent.py" showLineNumbers
import os
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

# Point to LiteLLM proxy (not Anthropic)
os.environ["ANTHROPIC_BASE_URL"] = "http://localhost:4000"
os.environ["ANTHROPIC_API_KEY"] = "sk-1234"  # Your LiteLLM key

# Configure agent with any model from your config
options = ClaudeAgentOptions(
    system_prompt="You are a helpful AI assistant.",
    model="bedrock-claude-sonnet-4",  # Use any model from config.yaml
    max_turns=20,
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("What is LiteLLM?")
    
    async for msg in client.receive_response():
        if hasattr(msg, 'content'):
            for content_block in msg.content:
                if hasattr(content_block, 'text'):
                    print(content_block.text, end='', flush=True)
```



## Agent SDK와 함께 LiteLLM을 사용하는 이유 {#why-use-litellm-with-agent-sdk}

| 기능 | 이점 |
|---------|---------|
| **다중 공급자** | 동일한 에이전트 코드를 OpenAI, Bedrock, Azure, Vertex AI 등과 함께 사용할 수 있습니다. |
| **비용 추적** | 모든 에이전트 대화의 지출을 추적합니다. |
| **요청 제한** | 에이전트 사용량에 예산과 제한을 설정합니다. |
| **부하 분산** | 여러 API 키 또는 리전에 요청을 분산합니다. |
| **대체 모델** | 한 모델이 실패하면 다른 모델로 자동 재시도합니다. |

## 전체 예제 {#complete-예제}

다음 기능을 갖춘 완전한 대화형 CLI 에이전트는 [cookbook 예제](https://github.com/BerriAI/litellm/tree/main/cookbook/anthropic_agent_sdk)를 참고하세요.
- 응답을 실시간으로 스트리밍합니다.
- 모델을 동적으로 전환합니다.
- 프록시에서 사용 가능한 모델을 가져옵니다.

```bash
# Clone and run the example
git clone https://github.com/BerriAI/litellm.git
cd litellm/cookbook/anthropic_agent_sdk
uv add -r requirements.txt
python main.py
```

## 관련 리소스 {#related-resources}

- [Claude Agent SDK 문서](https://github.com/anthropics/anthropic-agent-sdk)
- [LiteLLM Proxy 빠른 시작](../proxy/quick_start)
- [전체 Cookbook 예제](https://github.com/BerriAI/litellm/tree/main/cookbook/anthropic_agent_sdk)
