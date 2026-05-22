import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI Agents SDK

LiteLLM Proxy를 통해 모든 LLM 제공자와 함께 OpenAI Agents SDK를 사용하세요.

[OpenAI Agents SDK](https://github.com/openai/openai-agents-python)는 다중 에이전트 워크플로를 구축하기 위한 경량 프레임워크입니다. 100개 이상의 지원 제공자를 사용할 수 있는 공식 LiteLLM 확장이 포함되어 있습니다.

## 빠른 시작

### 1. 의존성 설치 {#install-dependencies}

```bash
uv add "openai-agents[litellm]"
```

### 2. 설정에 모델 추가 {#add-model-to-config}

```yaml title="config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: "openai/gpt-4o"
      api_key: "os.environ/OPENAI_API_KEY"

  - model_name: claude-sonnet
    litellm_params:
      model: "anthropic/claude-3-5-sonnet-20241022"
      api_key: "os.environ/ANTHROPIC_API_KEY"

  - model_name: gemini-pro
    litellm_params:
      model: "gemini/gemini-2.0-flash-exp"
      api_key: "os.environ/GEMINI_API_KEY"
```

### 3. LiteLLM Proxy 시작 {#start-litellm-proxy}

```bash
litellm --config config.yaml
```

### 4. Proxy와 함께 사용 {#use-with-proxy}

<Tabs>
<TabItem value="proxy" label="Proxy 경유">

```python
from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel

# Point to LiteLLM proxy
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=LitellmModel(
        model="claude-sonnet",  # Model from config.yaml
        api_key="sk-1234",      # LiteLLM API key
        base_url="http://localhost:4000"
    )
)

result = await Runner.run(agent, "What is LiteLLM?")
print(result.final_output)
```

</TabItem>
<TabItem value="direct" label="직접 사용(Proxy 없음)">

```python
from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel

# Use any provider directly
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=LitellmModel(
        model="anthropic/claude-3-5-sonnet-20241022",
        api_key="your-anthropic-key"
    )
)

result = await Runner.run(agent, "What is LiteLLM?")
print(result.final_output)
```

</TabItem>
</Tabs>

## 사용량 추적 {#track-usage}

토큰 사용량을 모니터링하려면 사용량 추적을 활성화하세요.

```python
from agents import Agent, ModelSettings
from agents.extensions.models.litellm_model import LitellmModel

agent = Agent(
    name="Assistant",
    model=LitellmModel(model="claude-sonnet", api_key="sk-1234"),
    model_settings=ModelSettings(include_usage=True)
)

result = await Runner.run(agent, "Hello")
print(result.context_wrapper.usage)  # Token counts
```

## 환경 변수 {#environment-variables}

| 변수 | 값 | 설명 |
|----------|-------|-------------|
| `LITELLM_BASE_URL` | `http://localhost:4000` | LiteLLM proxy URL |
| `LITELLM_API_KEY` | `sk-1234` | 사용자의 LiteLLM API 키 |

## 관련 자료 {#related-resources}

- [OpenAI Agents SDK 문서](https://openai.github.io/openai-agents-python/)
- [LiteLLM Extension 문서](https://openai.github.io/openai-agents-python/models/litellm/)
- [LiteLLM Proxy 빠른 시작](../proxy/quick_start)
