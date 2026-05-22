import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM과 함께 OpenAI Agents SDK 사용하기

LiteLLM Proxy를 통해 어떤 LLM 제공업체와도 OpenAI의 Agents SDK를 사용할 수 있습니다.

이 튜토리얼에서는 LiteLLM을 통해 여러 LLM 제공업체를 지원하면서 OpenAI Agents SDK로 AI 에이전트를 빌드하는 방법을 보여줍니다.

## 개요

OpenAI Agents SDK는 AI 에이전트를 빌드하기 위한 고수준 인터페이스를 제공합니다. LiteLLM과 통합하면 다음을 할 수 있습니다.

- 동일한 에이전트 코드로 여러 LLM 제공업체(Bedrock, Azure, Vertex AI 등)를 사용할 수 있습니다.
- 서로 다른 제공업체의 모델 간에 쉽게 전환할 수 있습니다.
- 중앙 집중식 모델 관리를 위해 LiteLLM 프록시에 연결할 수 있습니다.

:::tip 내장 LiteLLM 확장

OpenAI Agents SDK에는 프록시 없이 작동하는 공식 LiteLLM 확장(`LitellmModel`)이 포함되어 있습니다. 중앙 집중식 프록시 기능(비용 추적, 속도 제한, 로드 밸런싱)이 필요하지 않다면 직접 사용할 수 있습니다.

```python
from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel


agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=LitellmModel(model="anthropic/claude-sonnet-4-20250514"),
)

result = Runner.run_sync(agent, "Hello!")
print(result.final_output)
```

자세한 내용은 [문서](https://openai.github.io/openai-agents-python/models/litellm/)를 참고하세요. 이 튜토리얼의 나머지 부분은 중앙 집중식 모델 관리가 필요한 팀을 위한 **프록시 기반 접근 방식**에 초점을 맞춥니다.

:::

## 사전 준비

- Python 환경 설정
- 사용할 LLM 제공업체의 API 키
- LLM과 에이전트 개념에 대한 기본 이해

## 설치

```bash showLineNumbers title="Install dependencies"
uv add openai-agents litellm
```

## 1. LiteLLM Proxy 시작

사용하려는 모델로 LiteLLM 프록시를 구성하고 시작합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: bedrock-claude-sonnet-4
    litellm_params:
      model: "bedrock/us.anthropic.claude-sonnet-4-20250514-v1:0"
      aws_region_name: "us-east-1"

  - model_name: gpt-4o
    litellm_params:
      model: "openai/gpt-4o"

  - model_name: claude-sonnet-4
    litellm_params:
      model: "anthropic/claude-sonnet-4-20250514"

  - model_name: bedrock-claude-haiku
    litellm_params:
      model: "bedrock/us.anthropic.claude-3-5-haiku-20241022-v1:0"
      aws_region_name: "us-east-1"

  - model_name: bedrock-nova-premier
    litellm_params:
      model: "bedrock/amazon.nova-premier-v1:0"
      aws_region_name: "us-east-1"
```

```bash
litellm --config config.yaml
```

필수 환경 변수:

| 변수 | 값 | 설명 |
|----------|-------|-------------|
| `LITELLM_BASE_URL` | `http://localhost:4000` | LiteLLM 프록시 URL |
| `LITELLM_API_KEY` | `sk-1234` | LiteLLM API 키(제공업체 키가 아님) |

## 2. 환경 설정

필요한 라이브러리를 가져오고 LiteLLM 프록시 연결을 구성합니다.

```python showLineNumbers title="Setup environment"
from __future__ import annotations

import asyncio
import os

from openai import AsyncOpenAI

from agents import (
    Agent,
    Model,
    ModelProvider,
    OpenAIChatCompletionsModel,
    RunConfig,
    Runner,
    function_tool,
    set_tracing_disabled,
)

# Point to LiteLLM proxy
BASE_URL = os.getenv("LITELLM_BASE_URL") or "http://localhost:4000"
API_KEY = os.getenv("LITELLM_API_KEY") or "sk-1234"

# Define model constants for cleaner code
MODEL_BEDROCK_SONNET = "bedrock-claude-sonnet-4"
MODEL_BEDROCK_HAIKU = "bedrock-claude-haiku"
MODEL_GPT_4O = "gpt-4o"

# Create the OpenAI client pointed at LiteLLM
client = AsyncOpenAI(base_url=BASE_URL, api_key=API_KEY)

# Disable tracing since we're not using OpenAI's platform directly
set_tracing_disabled(disabled=True)
```

## 3. 사용자 지정 모델 제공자 생성

Agents SDK는 모델 이름을 해석하기 위해 `ModelProvider`를 사용합니다. 모든 요청을 LiteLLM을 통해 라우팅하는 사용자 지정 제공자를 만듭니다.

```python showLineNumbers title="Custom LiteLLM model provider"
class LiteLLMModelProvider(ModelProvider):
    def get_model(self, model_name: str | None) -> Model:
        return OpenAIChatCompletionsModel(
            model=model_name or MODEL_BEDROCK_SONNET,
            openai_client=client,
        )


LITELLM_MODEL_PROVIDER = LiteLLMModelProvider()
```

## 4. 간단한 도구 정의

에이전트가 사용할 수 있는 도구를 만듭니다.

```python showLineNumbers title="Weather tool implementation"
@function_tool
def get_weather(city: str) -> str:
    """Retrieves the current weather report for a specified city.

    Args:
        city: The name of the city (e.g., "New York", "London", "Tokyo").

    Returns:
        A string containing the weather information for the city.
    """
    print(f"[debug] getting weather for {city}")

    mock_weather_db = {
        "new york": "The weather in New York is sunny with a temperature of 25°C.",
        "london": "It's cloudy in London with a temperature of 15°C.",
        "tokyo": "Tokyo is experiencing light rain and a temperature of 18°C.",
    }

    city_normalized = city.lower()

    if city_normalized in mock_weather_db:
        return mock_weather_db[city_normalized]
    else:
        return f"Sorry, I don't have weather information for '{city}'."
```

## 5. 에이전트에서 다른 모델 사용

### 5.1 Bedrock 모델 사용

```python showLineNumbers title="Bedrock model via LiteLLM proxy"
async def test_bedrock_agent():
    print("\n--- Testing Bedrock Claude Agent ---")

    agent = Agent(
        name="weather_agent_bedrock",
        instructions="You are a helpful weather assistant powered by Claude. "
                     "Use the 'get_weather' tool for city weather requests. "
                     "Present information clearly.",
        tools=[get_weather],
    )

    result = await Runner.run(
        agent,
        "What's the weather in Tokyo?",
        run_config=RunConfig(
            model_provider=LITELLM_MODEL_PROVIDER,
            model="bedrock-claude-sonnet-4",  # Uses the model name from your LiteLLM config
        ),
    )
    print(f"<<< Agent Response: {result.final_output}")


asyncio.run(test_bedrock_agent())
```

### 5.2 OpenAI 모델 사용

```python showLineNumbers title="OpenAI model via LiteLLM proxy"
async def test_openai_agent():
    print("\n--- Testing OpenAI GPT Agent ---")

    agent = Agent(
        name="weather_agent_gpt",
        instructions="You are a helpful weather assistant powered by GPT-4o. "
                     "Use the 'get_weather' tool for city weather requests. "
                     "Present information clearly.",
        tools=[get_weather],
    )

    result = await Runner.run(
        agent,
        "What's the weather in London?",
        run_config=RunConfig(
            model_provider=LITELLM_MODEL_PROVIDER,
            model="gpt-4o",  # Uses the model name from your LiteLLM config
        ),
    )
    print(f"<<< Agent Response: {result.final_output}")


asyncio.run(test_openai_agent())
```

### 5.3 Anthropic 모델 사용

```python showLineNumbers title="Anthropic model via LiteLLM proxy"
async def test_anthropic_agent():
    print("\n--- Testing Anthropic Claude Agent ---")

    agent = Agent(
        name="weather_agent_claude",
        instructions="You are a helpful weather assistant powered by Claude. "
                     "Use the 'get_weather' tool for city weather requests. "
                     "Present information clearly.",
        tools=[get_weather],
    )

    result = await Runner.run(
        agent,
        "What's the weather in New York?",
        run_config=RunConfig(
            model_provider=LITELLM_MODEL_PROVIDER,
            model="claude-sonnet-4",  # Uses the model name from your LiteLLM config
        ),
    )
    print(f"<<< Agent Response: {result.final_output}")


asyncio.run(test_anthropic_agent())
```

## 6. 전체 실행 예제

복사해서 처음부터 끝까지 실행할 수 있는 전체 스크립트입니다.

```python showLineNumbers title="complete_agent.py"
from __future__ import annotations

import asyncio
import os

from openai import AsyncOpenAI

from agents import (
    Agent,
    Model,
    ModelProvider,
    OpenAIChatCompletionsModel,
    RunConfig,
    Runner,
    function_tool,
    set_tracing_disabled,
)

# Point to LiteLLM proxy
BASE_URL = os.getenv("LITELLM_BASE_URL") or "http://localhost:4000"
API_KEY = os.getenv("LITELLM_API_KEY") or "sk-1234"
MODEL_NAME = os.getenv("MODEL_NAME") or "bedrock-claude-sonnet-4"

client = AsyncOpenAI(base_url=BASE_URL, api_key=API_KEY)
set_tracing_disabled(disabled=True)


class LiteLLMModelProvider(ModelProvider):
    def get_model(self, model_name: str | None) -> Model:
        return OpenAIChatCompletionsModel(
            model=model_name or MODEL_NAME,
            openai_client=client,
        )


LITELLM_MODEL_PROVIDER = LiteLLMModelProvider()


@function_tool
def get_weather(city: str) -> str:
    """Retrieves the current weather report for a specified city."""
    print(f"[debug] getting weather for {city}")

    mock_weather_db = {
        "new york": "The weather in New York is sunny with a temperature of 25°C.",
        "london": "It's cloudy in London with a temperature of 15°C.",
        "tokyo": "Tokyo is experiencing light rain and a temperature of 18°C.",
    }

    city_normalized = city.lower()
    if city_normalized in mock_weather_db:
        return mock_weather_db[city_normalized]
    else:
        return f"Sorry, I don't have weather information for '{city}'."


async def main():
    agent = Agent(
        name="Assistant",
        instructions="You are a helpful weather assistant. "
                     "Use the 'get_weather' tool for city weather requests. "
                     "Present information clearly and concisely.",
        tools=[get_weather],
    )

    # Run with the default model (bedrock-claude-sonnet-4)
    result = await Runner.run(
        agent,
        "What's the weather in Tokyo?",
        run_config=RunConfig(model_provider=LITELLM_MODEL_PROVIDER),
    )
    print(result.final_output)

    # Switch to a different model by passing model in RunConfig
    result = await Runner.run(
        agent,
        "What's the weather in London?",
        run_config=RunConfig(
            model_provider=LITELLM_MODEL_PROVIDER,
            model="gpt-4o",
        ),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

## Agents SDK와 함께 LiteLLM을 사용하는 이유

| 기능 | 장점 |
|---------|---------|
| **다중 제공업체** | 동일한 에이전트 코드로 OpenAI, Bedrock, Azure, Vertex AI 등을 사용할 수 있습니다. |
| **비용 추적** | 모든 에이전트 대화의 지출을 추적할 수 있습니다. |
| **속도 제한** | 에이전트 사용량에 예산과 제한을 설정할 수 있습니다. |
| **로드 밸런싱** | 여러 API 키 또는 리전에 요청을 분산할 수 있습니다. |
| **대체 처리** | 한 모델이 실패하면 다른 모델로 자동 재시도할 수 있습니다. |

## 관련 리소스

- [OpenAI Agents SDK 문서](https://openai.github.io/openai-agents-python/)
- [LiteLLM Proxy 빠른 시작](../proxy/quick_start)
