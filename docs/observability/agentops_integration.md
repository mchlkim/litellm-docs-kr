# 🖇️ AgentOps - LLM 관측성 플랫폼

:::tip

이 문서는 커뮤니티에서 관리합니다. 버그가 발생하면 이슈를 생성해 주세요:
https://github.com/BerriAI/litellm

:::

[AgentOps](https://docs.agentops.ai)는 LLM 호출의 추적과 모니터링을 지원하는 관측성 플랫폼으로, AI 운영에 대한 자세한 인사이트를 제공합니다.

## LiteLLM에서 AgentOps 사용하기 {#using-agentops-with-litellm}

LiteLLM은 `success_callbacks`와 `failure_callbacks`를 제공하므로, AgentOps를 쉽게 통합해 LLM 운영을 포괄적으로 추적하고 모니터링할 수 있습니다.

### 통합 {#integration}

몇 줄의 코드만으로 AgentOps에서 **모든 제공자에 걸쳐** 응답을 즉시 추적할 수 있습니다:
AgentOps API 키는 https://app.agentops.ai/ 에서 발급받으세요.
```python
import litellm

# Configure LiteLLM to use AgentOps
litellm.success_callback = ["agentops"]

# Make your LLM calls as usual
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
```

전체 코드:

```python
import os
from litellm import completion

# Set env variables
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["AGENTOPS_API_KEY"] = "your-agentops-api-key"

# Configure LiteLLM to use AgentOps
litellm.success_callback = ["agentops"]

# OpenAI call
response = completion(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hi 👋 - I'm OpenAI"}],
)

print(response)
```

### 설정 옵션 {#설정-options}

AgentOps 통합은 환경 변수를 통해 설정할 수 있습니다:

- `AGENTOPS_API_KEY` (str, 선택 사항): AgentOps API 키
- `AGENTOPS_ENVIRONMENT` (str, 선택 사항): 배포 환경(기본값: "production")
- `AGENTOPS_SERVICE_NAME` (str, 선택 사항): 추적용 서비스 이름(기본값: "agentops")

### 고급 사용법

환경 변수를 통해 추가 설정을 구성할 수 있습니다:

```python
import os

# Configure AgentOps settings
os.environ["AGENTOPS_API_KEY"] = "your-agentops-api-key"
os.environ["AGENTOPS_ENVIRONMENT"] = "staging"
os.environ["AGENTOPS_SERVICE_NAME"] = "my-service"

# Enable AgentOps tracing
litellm.success_callback = ["agentops"]
```

### 지원 {#support}

문제나 질문이 있으면 다음을 참고하세요:
- [AgentOps 문서](https://docs.agentops.ai)
- [LiteLLM 문서](https://docs.litellm.ai)
