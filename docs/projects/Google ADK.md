
# Google ADK (`Agent Development Kit`)

[Google ADK](https://github.com/google/adk-python)는 정교한 AI 에이전트를 빌드, 평가, 배포하기 위한 오픈소스 code-first Python 프레임워크입니다. Gemini에 최적화되어 있지만 ADK는 모델에 독립적이며, LiteLLM을 통해 100개 이상의 provider를 사용할 수 있습니다.

```python
from google.adk.agents.llm_agent import Agent
from google.adk.models.lite_llm import LiteLlm

root_agent = Agent(
    model=LiteLlm(model="openai/gpt-4o"),  # Or any LiteLLM-supported model
    name="my_agent",
    description="An agent using LiteLLM",
    instruction="You are a helpful assistant.",
    tools=[your_tools],
)
```

- [GitHub](https://github.com/google/adk-python)
- [Documentation](https://google.github.io/adk-docs)
- [LiteLLM Samples](https://github.com/google/adk-python/tree/main/contributing/samples/hello_world_litellm)
