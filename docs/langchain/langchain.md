import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ChatLiteLLM() 사용 - Langchain

## 사전 요구 사항
```shell
!uv add litellm langchain
```
## 빠른 시작

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['OPENAI_API_KEY'] = ""
chat = ChatLiteLLM(model="gpt-3.5-turbo")
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['ANTHROPIC_API_KEY'] = ""
chat = ChatLiteLLM(model="claude-2", temperature=0.3)
messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="replicate" label="Replicate">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['REPLICATE_API_TOKEN'] = ""
chat = ChatLiteLLM(model="replicate/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1")
messages = [
    HumanMessage(
        content="what model are you?"
    )
]
chat.invoke(messages)
```

</TabItem>

<TabItem value="cohere" label="Cohere">

```python
import os
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

os.environ['COHERE_API_KEY'] = ""
chat = ChatLiteLLM(model="command-nightly")
messages = [
    HumanMessage(
        content="what model are you?"
    )
]
chat.invoke(messages)
```

</TabItem>
</Tabs>

## Langchain ChatLiteLLM을 MLflow와 함께 사용

MLflow는 ChatLiteLLM을 위한 오픈소스 observability 솔루션을 제공합니다.

통합을 활성화하려면 코드에서 먼저 `mlflow.litellm.autolog()`를 호출하면 됩니다. 다른 설정은 필요하지 않습니다.

```python
import mlflow

mlflow.litellm.autolog()
```

auto-tracing이 활성화되면 `ChatLiteLLM`을 호출하고 MLflow에서 기록된 trace를 확인할 수 있습니다.

```python
import os
from langchain.chat_models import ChatLiteLLM

os.environ['OPENAI_API_KEY']="sk-..."

chat = ChatLiteLLM(model="gpt-4o-mini")
chat.invoke("Hi!")
```

## Langchain ChatLiteLLM을 Lunary와 함께 사용
```python
import os
from langchain.chat_models import ChatLiteLLM
from langchain.schema import HumanMessage
import litellm

os.environ["LUNARY_PUBLIC_KEY"] = "" # from https://app.lunary.ai/settings
os.environ['OPENAI_API_KEY']="sk-..."

litellm.success_callback = ["lunary"] 
litellm.failure_callback = ["lunary"] 

chat = ChatLiteLLM(
  model="gpt-4o"
  messages = [
    HumanMessage(
        content="what model are you"
    )
]
chat(messages)
```

자세한 내용은 [여기](../observability/lunary_integration.md)를 확인하세요.

## LangChain ChatLiteLLM + Langfuse 사용
Langfuse를 ChatLiteLLM과 통합하는 방법에 대한 자세한 내용은 [Langfuse 통합 문서](../observability/langfuse_integration)를 확인하세요.

## LangChain 및 LiteLLM에서 Tags 사용

Tags는 LLM 요청을 분류, 필터링, 추적할 수 있게 해 주는 LiteLLM의 강력한 기능입니다. LangChain을 LiteLLM과 함께 사용할 때는 metadata의 `extra_body` 파라미터를 통해 tags를 전달할 수 있습니다.

### Basic Tag 사용법

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

os.environ['OPENAI_API_KEY'] = "sk-your-key-here"

chat = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["production", "customer-support", "high-priority"]
        }
    }
)

messages = [
    SystemMessage(content="You are a helpful customer support assistant."),
    HumanMessage(content="How do I reset my password?")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>

<TabItem value="anthropic" label="Anthropic">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

os.environ['ANTHROPIC_API_KEY'] = "sk-ant-your-key-here"

chat = ChatOpenAI(
    model="claude-3-sonnet-20240229",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["research", "analysis", "claude-model"]
        }
    }
)

messages = [
    SystemMessage(content="You are a research analyst."),
    HumanMessage(content="Analyze this market trend...")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>

<TabItem value="litellm-proxy" label="LiteLLM Proxy">

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# No API key needed when using proxy
chat = ChatOpenAI(
    openai_api_base="http://localhost:4000",  # Your proxy URL
    model="gpt-4o",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": ["proxy", "team-alpha", "feature-flagged"],
            "generation_name": "customer-onboarding",
            "trace_user_id": "user-12345"
        }
    }
)

messages = [
    SystemMessage(content="You are an onboarding assistant."),
    HumanMessage(content="Welcome our new customer!")
]

response = chat.invoke(messages)
print(response)
```

</TabItem>
</Tabs>

### 고급 Tag 패턴

#### Context 기반 동적 Tags

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

def create_chat_with_tags(user_type: str, feature: str):
    """Create a chat instance with dynamic tags based on context"""
    
    # Build tags dynamically
    tags = ["langchain-integration"]
    
    if user_type == "premium":
        tags.extend(["premium-user", "high-priority"])
    elif user_type == "enterprise":
        tags.extend(["enterprise", "custom-sla"])
    else:
        tags.append("standard-user")
    
    # Add feature-specific tags
    if feature == "code-review":
        tags.extend(["development", "code-analysis"])
    elif feature == "content-gen":
        tags.extend(["marketing", "content-creation"])
    
    return ChatOpenAI(
        openai_api_base="http://localhost:4000",
        model="gpt-4o",
        temperature=0.7,
        extra_body={
            "metadata": {
                "tags": tags,
                "user_type": user_type,
                "feature": feature,
                "trace_user_id": f"user-{user_type}-{feature}"
            }
        }
    )

# Usage examples
premium_chat = create_chat_with_tags("premium", "code-review")
enterprise_chat = create_chat_with_tags("enterprise", "content-gen")

messages = [HumanMessage(content="Help me with this task")]
response = premium_chat.invoke(messages)
```

#### 비용 추적 및 Analytics용 Tags

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Tags for cost tracking
cost_tracking_chat = ChatOpenAI(
    openai_api_base="http://localhost:4000",
    model="gpt-4o",
    temperature=0.7,
    extra_body={
        "metadata": {
            "tags": [
                "cost-center-marketing",
                "budget-q4-2024",
                "project-launch-campaign",
                "high-cost-model"  # Flag for expensive models
            ],
            "department": "marketing",
            "project_id": "campaign-2024-q4",
            "cost_threshold": "high"
        }
    }
)

messages = [
    SystemMessage(content="You are a marketing copywriter."),
    HumanMessage(content="Create compelling ad copy for our new product launch.")
]

response = cost_tracking_chat.invoke(messages)
```

#### A/B Testing용 Tags

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import random

def create_ab_test_chat(test_variant: str = None):
    """Create chat instance for A/B testing with appropriate tags"""
    
    if test_variant is None:
        test_variant = random.choice(["variant-a", "variant-b"])
    
    return ChatOpenAI(
        openai_api_base="http://localhost:4000",
        model="gpt-4o",
        temperature=0.7 if test_variant == "variant-a" else 0.9,  # Different temp for variants
        extra_body={
            "metadata": {
                "tags": [
                    "ab-test-experiment-1",
                    f"variant-{test_variant}",
                    "temperature-test",
                    "user-experience"
                ],
                "experiment_id": "ab-test-001",
                "variant": test_variant,
                "test_group": "temperature-optimization"
            }
        }
    )

# Run A/B test
variant_a_chat = create_ab_test_chat("variant-a")
variant_b_chat = create_ab_test_chat("variant-b")

test_message = [HumanMessage(content="Explain quantum computing in simple terms")]

response_a = variant_a_chat.invoke(test_message)
response_b = variant_b_chat.invoke(test_message)
```

### Tag 권장 사항

#### 1. **일관된 이름 지정 규칙**
```python
# ✅ Good: Consistent, descriptive tags
tags = ["production", "api-v2", "customer-support", "urgent"]

# ❌ Avoid: Inconsistent or unclear tags
tags = ["prod", "v2", "support", "urgent123"]
```

#### 2. **계층형 Tags**
```python
# ✅ Good: Hierarchical structure
tags = ["env:production", "team:backend", "service:api", "priority:high"]

# This allows for easy filtering and grouping
```

#### 3. **Context 정보 포함**
```python
extra_body={
    "metadata": {
        "tags": ["production", "user-onboarding"],
        "user_id": "user-12345",
        "session_id": "session-abc123",
        "feature_flag": "new-onboarding-flow",
        "environment": "production"
    }
}
```

#### 4. **Tag 카테고리**
tags를 카테고리로 구성하는 방식을 고려하세요.
- **환경**: `production`, `staging`, `development`
- **팀/서비스**: `backend`, `frontend`, `api`, `worker`
- **기능**: `authentication`, `payment`, `notification`
- **우선순위**: `critical`, `high`, `medium`, `low`
- **사용자 유형**: `premium`, `enterprise`, `free`

### LiteLLM Proxy에서 Tags 사용

LiteLLM Proxy에서 tags를 사용하면 다음을 수행할 수 있습니다.

1. tags 기준으로 **요청 필터링**
2. spend reports에서 tags별 **비용 추적**
3. tags 기준으로 **라우팅 규칙 적용**
4. tag 기반 analytics로 **사용량 모니터링**

#### 예제 Proxy 설정 with Tags

```yaml
# config.yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: your-key

# Tag-based routing rules
tag_routing:
  - tags: ["premium", "high-priority"]
    models: ["gpt-4o", "claude-3-opus"]
  - tags: ["standard"]
    models: ["gpt-3.5-turbo", "claude-3-haiku"]
```

### 모니터링 및 Analytics

Tags는 강력한 analytics 기능을 제공합니다.

```python
# Example: Get spend reports by tags
import requests

response = requests.get(
    "http://localhost:4000/global/spend/report",
    headers={"Authorization": "Bearer sk-your-key"},
    params={
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "group_by": "tags"
    }
)

spend_by_tags = response.json()
```

이 문서는 LangChain 및 LiteLLM에서 tags를 효과적으로 사용하기 위한 핵심 패턴을 다룹니다. 이를 통해 LLM 요청을 더 잘 구성하고, 추적하고, 분석할 수 있습니다.
