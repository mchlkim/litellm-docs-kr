import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Letta 통합

[Letta](https://github.com/letta-ai/letta)(이전 MemGPT)는 영구 메모리를 갖춘 상태 저장 LLM 에이전트를 구축하기 위한 프레임워크입니다. 이 가이드에서는 메모리 지원 에이전트를 구축하면서 여러 LLM provider를 활용할 수 있도록 LiteLLM SDK와 LiteLLM Proxy를 Letta와 통합하는 방법을 설명합니다.

## Letta란?

Letta를 사용하면 다음을 수행할 수 있는 LLM 에이전트를 구축할 수 있습니다.
- 대화 전반에 걸쳐 장기 메모리 유지
- 도구 상호작용에 function calling 사용
- 큰 context window를 효율적으로 처리
- 에이전트 상태와 메모리 유지

## 사전 준비

```bash
uv add letta litellm
```

## 빠른 시작

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

### 1. LiteLLM Proxy 시작

먼저 LiteLLM proxy용 설정 파일을 만듭니다.

```yaml
# config.yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-3-sonnet
    litellm_params:
      model: anthropic/claude-3-sonnet-20240229
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-35-turbo
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-07-01-preview"
```

프록시 시작:

```bash
litellm --config config.yaml --port 4000
```

### 2. LiteLLM Proxy로 Letta 설정

Letta가 LiteLLM proxy endpoint를 사용하도록 설정합니다.

```python
import letta
from letta import create_client

# Configure Letta to use LiteLLM proxy
client = create_client()

# Configure the LLM endpoint
client.set_default_llm_config(
    model="gpt-4",  # This should match a model from your LiteLLM config
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",  # Your LiteLLM proxy URL
    context_window=8192
)

# Configure embedding endpoint (optional)
client.set_default_embedding_config(
    embedding_endpoint_type="openai",
    embedding_endpoint="http://localhost:4000",
    embedding_model="text-embedding-ada-002"
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

### 1. LiteLLM SDK 설정

API key를 설정하고 LiteLLM을 구성합니다.

```python
import os
import litellm

# Set your API keys
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

# Optional: Configure default settings
litellm.set_verbose = True  # For debugging
```

### 2. Letta용 Custom LLM Wrapper 만들기

LiteLLM SDK를 사용하는 custom LLM wrapper를 만듭니다.

```python
import letta
from letta import create_client
from letta.llm_api.llm_api_base import LLMConfig
import litellm
from typing import List, Dict, Any

class LiteLLMWrapper:
    def __init__(self, model: str):
        self.model = model
    
    def chat_completions_create(self, messages: List[Dict], **kwargs):
        # Use LiteLLM SDK for completion
        response = litellm.completion(
            model=self.model,
            messages=messages,
            **kwargs
        )
        return response

# Configure Letta with custom LiteLLM wrapper
client = create_client()

# Set up LLM configuration using direct SDK integration
llm_config = LLMConfig(
    model="gpt-4",  # or "claude-3-sonnet", "azure/gpt-35-turbo", etc.
    model_endpoint_type="openai",
    context_window=8192
)

client.set_default_llm_config(llm_config)
```

</TabItem>
</Tabs>

### 3. Letta Agent 만들기 및 사용

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 사용">

```python
import letta
from letta import create_client

# Create Letta client
client = create_client()

# Create a new agent
agent_state = client.create_agent(
    name="my-assistant",
    system="You are a helpful assistant with persistent memory.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config()
)

# Send a message to the agent
response = client.user_message(
    agent_id=agent_state.id,
    message="Hi! My name is Alice and I love reading science fiction books."
)

print(f"Agent response: {response.messages[-1].text}")

# Send another message - the agent will remember previous context
response = client.user_message(
    agent_id=agent_state.id,
    message="What did I tell you about my interests?"
)

print(f"Agent response: {response.messages[-1].text}")
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 사용">

```python
import letta
from letta import create_client
import litellm
import os

# Set up environment variables
os.environ["OPENAI_API_KEY"] = "your-openai-key"

# Create Letta client with LiteLLM integration
client = create_client()

# Create a new agent
agent_state = client.create_agent(
    name="my-assistant",
    system="You are a helpful assistant with persistent memory.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config()
)

# Send a message to the agent
response = client.user_message(
    agent_id=agent_state.id,
    message="Hi! My name is Alice and I love reading science fiction books."
)

print(f"Agent response: {response.messages[-1].text}")

# Send another message - the agent will remember previous context
response = client.user_message(
    agent_id=agent_state.id,
    message="What did I tell you about my interests?"
)

print(f"Agent response: {response.messages[-1].text}")
```

</TabItem>
</Tabs>

## 고급 설정

### 에이전트별로 다른 모델 사용

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

```python
from letta import LLMConfig, EmbeddingConfig

# Create different LLM configurations pointing to your proxy
gpt4_config = LLMConfig(
    model="gpt-4",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    context_window=8192
)

claude_config = LLMConfig(
    model="claude-3-sonnet",
    model_endpoint_type="openai",  # Using OpenAI-compatible endpoint
    model_endpoint="http://localhost:4000",
    context_window=200000
)

# Create agents with different configurations
research_agent = client.create_agent(
    name="research-agent",
    system="You are a research assistant specialized in analysis.",
    llm_config=claude_config  # Use Claude for research tasks
)

creative_agent = client.create_agent(
    name="creative-agent", 
    system="You are a creative writing assistant.",
    llm_config=gpt4_config  # Use GPT-4 for creative tasks
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
import os
import litellm
from letta import LLMConfig, EmbeddingConfig

# Set up API keys for different providers
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

# Create different LLM configurations for direct SDK usage
gpt4_config = LLMConfig(
    model="openai/gpt-4",  # Using LiteLLM model format
    model_endpoint_type="openai",
    context_window=8192
)

claude_config = LLMConfig(
    model="anthropic/claude-3-sonnet-20240229",  # Using LiteLLM model format
    model_endpoint_type="openai",
    context_window=200000
)

# Create agents with different configurations
research_agent = client.create_agent(
    name="research-agent",
    system="You are a research assistant specialized in analysis.",
    llm_config=claude_config  # Use Claude for research tasks
)

creative_agent = client.create_agent(
    name="creative-agent", 
    system="You are a creative writing assistant.",
    llm_config=gpt4_config  # Use GPT-4 for creative tasks
)
```

</TabItem>
</Tabs>

### 도구와 함께 Function Calling 사용

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

```python
# Define custom tools for your agent
def search_web(query: str) -> str:
    """Search the web for information"""
    # Your web search implementation
    return f"Search results for: {query}"

def save_note(content: str) -> str:
    """Save a note to persistent storage"""
    # Your note saving implementation
    return f"Note saved: {content}"

# Create agent with tools (using proxy endpoint)
agent_state = client.create_agent(
    name="research-assistant",
    system="You are a research assistant that can search the web and save notes.",
    llm_config=client.get_default_llm_config(),
    embedding_config=client.get_default_embedding_config(),
    tools=[search_web, save_note]
)

# The agent can now use these tools
response = client.user_message(
    agent_id=agent_state.id,
    message="Search for recent developments in AI and save important findings."
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK">

```python
import litellm
import os

# Set up API keys
os.environ["OPENAI_API_KEY"] = "your-openai-key"

# Define custom tools for your agent
def search_web(query: str) -> str:
    """Search the web for information"""
    # Your web search implementation
    return f"Search results for: {query}"

def save_note(content: str) -> str:
    """Save a note to persistent storage"""
    # Your note saving implementation
    return f"Note saved: {content}"

# Create agent with tools (using LiteLLM SDK directly)
agent_state = client.create_agent(
    name="research-assistant",
    system="You are a research assistant that can search the web and save notes.",
    llm_config=LLMConfig(
        model="openai/gpt-4",  # Direct model specification
        model_endpoint_type="openai",
        context_window=8192
    ),
    embedding_config=client.get_default_embedding_config(),
    tools=[search_web, save_note]
)

# The agent can now use these tools
response = client.user_message(
    agent_id=agent_state.id,
    message="Search for recent developments in AI and save important findings."
)
```

</TabItem>
</Tabs>

## 인증

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 인증">

LiteLLM proxy에 인증이 필요한 경우:

```python
import os
from letta import LLMConfig

# Set up authenticated configuration
llm_config = LLMConfig(
    model="gpt-4",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    model_wrapper="openai",
    context_window=8192
)

# If using API keys with your proxy
os.environ["OPENAI_API_KEY"] = "your-litellm-proxy-api-key"

client = create_client()
client.set_default_llm_config(llm_config)
```

인증이 활성화된 proxy의 경우:

```yaml
# config.yaml with auth
general_settings:
  master_key: "your-master-key"

model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
```

```python
# Configure Letta with authenticated proxy
llm_config = LLMConfig(
    model="gpt-4",
    model_endpoint_type="openai",
    model_endpoint="http://localhost:4000",
    context_window=8192,
    api_key="your-master-key"  # Proxy master key
)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 인증">

LiteLLM SDK에서는 provider API key를 직접 설정합니다.

```python
import os
import litellm

# Set up API keys for different providers
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-api-key" 
os.environ["AZURE_API_KEY"] = "your-azure-api-key"
os.environ["AZURE_API_BASE"] = "https://your-resource.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2023-07-01-preview"

# Optional: Configure default settings
litellm.api_key = os.environ.get("OPENAI_API_KEY")  # Default key
litellm.set_verbose = True  # For debugging

# Use in Letta configuration
from letta import LLMConfig

llm_config = LLMConfig(
    model="openai/gpt-4",  # Will use OPENAI_API_KEY automatically
    model_endpoint_type="openai",
    context_window=8192
)

# Or for Azure
azure_config = LLMConfig(
    model="azure/gpt-35-turbo", 
    model_endpoint_type="openai",
    context_window=4096
)
```

</TabItem>
</Tabs>

## Load Balancing과 Fallback

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 기능">

LiteLLM proxy의 load balancing 및 fallback 기능은 Letta와 원활하게 동작합니다.

```yaml
# config.yaml with fallbacks
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
    tpm: 40000
    rpm: 500

  - model_name: gpt-4  # Same model name for fallback
    litellm_params:
      model: azure/gpt-4
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-07-01-preview"
    tpm: 80000
    rpm: 800

router_settings:
  routing_strategy: "usage-based-routing"
  fallbacks: [{"gpt-4": ["azure/gpt-4"]}]
```

proxy는 Letta를 위해 모든 routing, load balancing, fallback을 투명하게 처리합니다.

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK Router">

LiteLLM SDK에서는 routing과 fallback을 프로그래밍 방식으로 설정할 수 있습니다.

```python
import litellm
from litellm import Router

# Configure router with multiple models
router = Router(
    model_list=[
        {
            "model_name": "gpt-4",
            "litellm_params": {
                "model": "openai/gpt-4",
                "api_key": os.environ["OPENAI_API_KEY"]
            },
            "tpm": 40000,
            "rpm": 500
        },
        {
            "model_name": "gpt-4",  # Same name for fallback
            "litellm_params": {
                "model": "azure/gpt-4", 
                "api_key": os.environ["AZURE_API_KEY"],
                "api_base": os.environ["AZURE_API_BASE"],
                "api_version": "2023-07-01-preview"
            },
            "tpm": 80000,
            "rpm": 800
        }
    ],
    fallbacks=[{"gpt-4": ["azure/gpt-4"]}],
    routing_strategy="usage-based-routing"
)

# Create custom completion function for Letta
def custom_completion(messages, model="gpt-4", **kwargs):
    return router.completion(
        model=model,
        messages=messages,
        **kwargs
    )

# Use with Letta by monkey-patching or custom wrapper
litellm.completion = custom_completion
```

</TabItem>
</Tabs>

## Monitoring과 관측성

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy Monitoring">

proxy를 통한 Letta 에이전트의 LLM 사용량을 추적하려면 logging을 활성화합니다.

```yaml
# config.yaml with logging
model_list:
  # ... your models

litellm_settings:
  success_callback: ["langfuse"]  # or other observability tools
  
environment_variables:
  LANGFUSE_PUBLIC_KEY: "your-key"
  LANGFUSE_SECRET_KEY: "your-secret"
```

proxy dashboard에서 metrics를 확인합니다.
```bash
# Start proxy with UI
litellm --config config.yaml --port 4000 --detailed_debug
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK Monitoring">

SDK 통합에서 observability를 직접 설정합니다.

```python
import litellm
import os

# Configure observability callbacks
os.environ["LANGFUSE_PUBLIC_KEY"] = "your-key"
os.environ["LANGFUSE_SECRET_KEY"] = "your-secret"

# Set global callbacks
litellm.success_callback = ["langfuse"]
litellm.failure_callback = ["langfuse"]

# Optional: Set up custom logging
litellm.set_verbose = True

# Create custom completion wrapper with logging
def logged_completion(messages, model="gpt-4", **kwargs):
    try:
        response = litellm.completion(
            model=model,
            messages=messages,
            **kwargs
        )
        # Custom logging logic here if needed
        return response
    except Exception as e:
        # Custom error handling
        print(f"LLM call failed: {e}")
        raise

# Use in Letta configuration
litellm.completion = logged_completion
```

</TabItem>
</Tabs>

## 예제: Multi-Agent System

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 사용">

```python
import letta
from letta import create_client, LLMConfig

client = create_client()

# Create specialized agents using proxy endpoints
agents = {}

# Research agent using Claude for analysis
agents['researcher'] = client.create_agent(
    name="researcher",
    system="You are a research specialist. Analyze information thoroughly.",
    llm_config=LLMConfig(
        model="claude-3-sonnet",
        model_endpoint="http://localhost:4000",
        model_endpoint_type="openai"
    )
)

# Writer agent using GPT-4 for content creation
agents['writer'] = client.create_agent(
    name="writer",
    system="You are a content writer. Create engaging, well-structured content.",
    llm_config=LLMConfig(
        model="gpt-4",
        model_endpoint="http://localhost:4000", 
        model_endpoint_type="openai"
    )
)

# Coordinator workflow
def research_and_write_workflow(topic: str):
    # Research phase
    research_response = client.user_message(
        agent_id=agents['researcher'].id,
        message=f"Research the topic: {topic}. Provide key insights and data."
    )
    
    research_results = research_response.messages[-1].text
    
    # Writing phase
    write_response = client.user_message(
        agent_id=agents['writer'].id,
        message=f"Based on this research: {research_results}\n\nWrite an article about {topic}."
    )
    
    return write_response.messages[-1].text

# Execute workflow
article = research_and_write_workflow("The future of AI in healthcare")
print(article)
```

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 사용">

```python
import letta
from letta import create_client, LLMConfig
import litellm
import os

# Set up environment
os.environ["OPENAI_API_KEY"] = "your-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "your-anthropic-key"

client = create_client()

# Create specialized agents using direct SDK models
agents = {}

# Research agent using Claude for analysis
agents['researcher'] = client.create_agent(
    name="researcher",
    system="You are a research specialist. Analyze information thoroughly.",
    llm_config=LLMConfig(
        model="anthropic/claude-3-sonnet-20240229",
        model_endpoint_type="openai"
    )
)

# Writer agent using GPT-4 for content creation
agents['writer'] = client.create_agent(
    name="writer",
    system="You are a content writer. Create engaging, well-structured content.",
    llm_config=LLMConfig(
        model="openai/gpt-4",
        model_endpoint_type="openai"
    )
)

# Cost-conscious agent using GPT-3.5
agents['reviewer'] = client.create_agent(
    name="reviewer",
    system="You are an editor. Review and improve content quality.",
    llm_config=LLMConfig(
        model="openai/gpt-3.5-turbo",
        model_endpoint_type="openai"
    )
)

# Enhanced workflow with multiple agents
def enhanced_workflow(topic: str):
    # Research phase
    research_response = client.user_message(
        agent_id=agents['researcher'].id,
        message=f"Research the topic: {topic}. Provide key insights and data."
    )
    
    research_results = research_response.messages[-1].text
    
    # Writing phase
    write_response = client.user_message(
        agent_id=agents['writer'].id,
        message=f"Based on this research: {research_results}\n\nWrite an article about {topic}."
    )
    
    draft_article = write_response.messages[-1].text
    
    # Review phase
    review_response = client.user_message(
        agent_id=agents['reviewer'].id,
        message=f"Please review and improve this article:\n\n{draft_article}"
    )
    
    return review_response.messages[-1].text

# Execute enhanced workflow
article = enhanced_workflow("The future of AI in healthcare")
print(article)
```

</TabItem>
</Tabs>

## 권장 사항

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 권장 사항">

1. **Model Selection**: 작업별로 적절한 모델을 사용합니다.
   - 분석과 추론에는 Claude 사용
   - 창의적 작업에는 GPT-4 사용
   - 단순한 상호작용에는 GPT-3.5-turbo 사용

2. **Proxy 설정**:
   - 적절한 rate limit과 timeout 설정
   - 안정성을 위해 fallback 사용
   - production 환경에서는 인증 활성화

3. **Memory Management**: Letta가 메모리를 자동으로 처리하지만, 큰 context를 사용할 때는 사용량을 모니터링합니다.

4. **Cost Optimization**:
   - 비용 제어를 위해 proxy의 budgeting 기능 사용
   - 사용자/팀별 rate limiting 설정
   - proxy dashboard에서 token 사용량 모니터링

5. **Monitoring**: 에이전트 성능과 token 사용량을 추적하려면 observability를 활성화합니다.

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 권장 사항">

1. **Model Selection**: 작업 요구사항에 따라 모델을 선택합니다.
   - 복잡한 추론에는 `openai/gpt-4` 사용
   - 분석에는 `anthropic/claude-3-sonnet-20240229` 사용
   - 비용 효율적인 단순 작업에는 `openai/gpt-3.5-turbo` 사용

2. **Error Handling**: retry를 포함한 견고한 error handling을 구현합니다.
   ```python
   import litellm
   from litellm import completion
   
   # Set up retry logic
   litellm.num_retries = 3
   litellm.request_timeout = 60
   
   # Custom error handling
   def safe_completion(**kwargs):
       try:
           return completion(**kwargs)
       except Exception as e:
           print(f"LLM call failed: {e}")
           # Implement fallback logic
           return completion(model="openai/gpt-3.5-turbo", **kwargs)
   ```

3. **Cost Management**:
   - 중요도가 낮은 작업에는 더 저렴한 모델 사용
   - token counting과 budget 구현
   - 적절한 경우 response cache 사용

4. **Performance**:
   - 동시 요청에는 async operation 사용
   - connection pooling 구현
   - response time 모니터링

5. **Security**:
   - API key를 안전하게 저장(environment variable)
   - key를 정기적으로 rotation
   - rate limiting 구현

</TabItem>
</Tabs>

## 문제 해결

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy 문제">

### 연결 문제
```bash
# Test your LiteLLM proxy
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 설정 디버깅
```python
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Test Letta configuration
client = create_client()
print(client.get_default_llm_config())
```

### 일반적인 Proxy 문제
- **Port 충돌**: port 4000이 사용 중이 아닌지 확인합니다.
- **모델을 찾을 수 없음**: model name이 config.yaml과 일치하는지 확인합니다.
- **인증 오류**: master key 설정을 확인합니다.
- **Rate limiting**: rate limit hit 여부를 proxy log에서 모니터링합니다.

</TabItem>
<TabItem value="sdk" label="LiteLLM SDK 문제">

### API Key 문제
```python
import os
import litellm

# Check if API keys are set
print("OpenAI Key:", os.environ.get("OPENAI_API_KEY", "Not set"))
print("Anthropic Key:", os.environ.get("ANTHROPIC_API_KEY", "Not set"))

# Test direct LiteLLM call
try:
    response = litellm.completion(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello"}]
    )
    print("LiteLLM working:", response.choices[0].message.content)
except Exception as e:
    print("LiteLLM error:", e)
```

### 설정 디버깅
```python
# Enable verbose logging
litellm.set_verbose = True

# Test model availability
models = ["openai/gpt-4", "anthropic/claude-3-sonnet-20240229"]
for model in models:
    try:
        response = litellm.completion(
            model=model,
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=10
        )
        print(f"✓ {model} working")
    except Exception as e:
        print(f"✗ {model} failed: {e}")
```

### 일반적인 SDK 문제
- **Import 오류**: `uv add litellm letta`를 실행했는지 확인합니다.
- **Model format**: `provider/model` 형식을 사용합니다(예: `openai/gpt-4`).
- **API key format**: provider마다 key 형식이 다릅니다.
- **Rate limit**: retry에 exponential backoff를 구현합니다.

</TabItem>
</Tabs>

## 리소스

- [Letta 문서](https://docs.letta.com/)
- [LiteLLM Proxy 문서](/docs/simple_proxy)
- [LiteLLM SDK 문서](/docs/#litellm-python-sdk)
- [Function Calling 가이드](/docs/completion/function_call)
- [관측성 설정](/docs/integrations/observability_integrations)
- [Router 설정](/docs/routing)
