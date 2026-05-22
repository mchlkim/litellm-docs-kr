import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Helicone - OSS LLM 관측성 플랫폼

:::tip

이 문서는 커뮤니티에서 유지관리합니다. 버그가 있으면 이슈를 생성해 주세요:
https://github.com/BerriAI/litellm

:::

[Helicone](https://helicone.ai/)은 사용량, 비용, 지연 시간 등에 대한 핵심 인사이트를 제공하는 오픈소스 관측성 플랫폼입니다.

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="Python SDK">

코드 한 줄만으로 **모든 provider**의 응답을 Helicone에 즉시 기록할 수 있습니다:

```python
import os
from litellm import completion

## Set env variables
os.environ["HELICONE_API_KEY"] = "your-helicone-key"

# OpenAI call
response = completion(
    model="helicone/gpt-4o-mini",
    messages=[{"role": "user", "content": "Hi 👋 - I'm OpenAI"}],
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

LiteLLM Proxy 설정에 Helicone을 추가합니다:

```yaml title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

# Add Helicone callback
litellm_settings:
  success_callback: ["helicone"]

# Set Helicone API key
environment_variables:
  HELICONE_API_KEY: "your-helicone-key"
```

프록시 시작:
```bash
litellm --config config.yaml
```

</TabItem>
</Tabs>

## 통합 방식

Helicone을 LiteLLM과 통합하는 주요 방식은 두 가지입니다:

1. **Provider로 사용**: [지원되는 모든 모델](../providers/helicone)의 요청을 Helicone으로 기록합니다.
2. **Callbacks**: 임의의 provider를 사용하면서 Helicone으로 로그를 전송합니다.

### 지원되는 LLM Provider

Helicone은 다음을 포함한 [주요 LLM provider](https://helicone.ai/models)의 요청을 기록할 수 있습니다:

- OpenAI
- Azure
- Anthropic
- Gemini
- Groq
- Cohere
- Replicate
- 기타 provider

## 방식 1: Helicone을 Provider로 사용

Helicone의 AI Gateway는 캐싱, rate limiting, LLM 보안 같은 [고급 기능](https://docs.helicone.ai)을 제공합니다.

<Tabs>
  <TabItem value="sdk" label="Python SDK">

  Helicone을 base URL로 설정하고 인증 헤더를 전달합니다:

  ```python
  import os
  import litellm
  from litellm import completion

  os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

  messages = [{"content": "What is the capital of France?", "role": "user"}]

  # Helicone call - routes through Helicone gateway to any model
  response = completion(
      model="helicone/gpt-4o-mini", # or any 100+ models
      messages=messages
  )

  print(response)
  ```

  ### 고급 사용법

  Helicone 헤더를 사용해 요청에 사용자 지정 metadata와 property를 추가할 수 있습니다. 예시는 다음과 같습니다:

  ```python
  litellm.metadata = {
      "Helicone-User-Id": "user-abc",  # Specify the user making the request
      "Helicone-Property-App": "web",  # Custom property to add additional information
      "Helicone-Property-Custom": "any-value",  # Add any custom property
      "Helicone-Prompt-Id": "prompt-supreme-court",  # Assign an ID to associate this prompt with future versions
      "Helicone-Cache-Enabled": "true",  # Enable caching of responses
      "Cache-Control": "max-age=3600",  # Set cache limit to 1 hour
      "Helicone-RateLimit-Policy": "10;w=60;s=user",  # Set rate limit policy
      "Helicone-Retry-Enabled": "true",  # Enable retry mechanism
      "helicone-retry-num": "3",  # Set number of retries
      "helicone-retry-factor": "2",  # Set exponential backoff factor
      "Helicone-Model-Override": "gpt-3.5-turbo-0613",  # Override the model used for cost calculation
      "Helicone-Session-Id": "session-abc-123",  # Set session ID for tracking
      "Helicone-Session-Path": "parent-trace/child-trace",  # Set session path for hierarchical tracking
      "Helicone-Omit-Response": "false",  # Include response in logging (default behavior)
      "Helicone-Omit-Request": "false",  # Include request in logging (default behavior)
      "Helicone-LLM-Security-Enabled": "true",  # Enable LLM security features
      "Helicone-Moderations-Enabled": "true",  # Enable content moderation
  }
  ```

  ### 캐싱과 Rate Limiting

  캐싱을 활성화하고 rate limiting 정책을 설정합니다:

  ```python
  litellm.metadata = {
      "Helicone-Cache-Enabled": "true",  # Enable caching of responses
      "Cache-Control": "max-age=3600",  # Set cache limit to 1 hour
      "Helicone-RateLimit-Policy": "100;w=3600;s=user",  # Set rate limit policy
  }
  ```

  </TabItem>
</Tabs>

## 방식 2: Callbacks 사용

임의의 LLM provider를 직접 사용하면서 요청을 Helicone에 기록합니다.

<Tabs>
  <TabItem value="sdk" label="Python SDK">

  ```python
  import os
  import litellm
  from litellm import completion

  ## Set env variables
  os.environ["HELICONE_API_KEY"] = "your-helicone-key"
  os.environ["OPENAI_API_KEY"] = "your-openai-key"
  # os.environ["HELICONE_API_BASE"] = "" # [OPTIONAL] defaults to `https://api.helicone.ai`

  # Set callbacks
  litellm.success_callback = ["helicone"]

  # OpenAI call
  response = completion(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hi 👋 - I'm OpenAI"}],
  )

  print(response)
  ```

  </TabItem>
  <TabItem value="proxy" label="LiteLLM Proxy">

  ```yaml title="config.yaml"
  model_list:
    - model_name: gpt-4
      litellm_params:
        model: gpt-4
        api_key: os.environ/OPENAI_API_KEY
    - model_name: claude-3
      litellm_params:
        model: anthropic/claude-3-sonnet-20240229
        api_key: os.environ/ANTHROPIC_API_KEY

  # Add Helicone logging
  litellm_settings:
    success_callback: ["helicone"]

  # Environment variables
  environment_variables:
    HELICONE_API_KEY: "your-helicone-key"
    OPENAI_API_KEY: "your-openai-key"
    ANTHROPIC_API_KEY: "your-anthropic-key"
  ```

  프록시 시작:
  ```bash
  litellm --config config.yaml
  ```

  프록시로 요청을 보냅니다:
  ```python
  import openai

  client = openai.OpenAI(
      api_key="anything",  # proxy doesn't require real API key
      base_url="http://localhost:4000"
  )

  response = client.chat.completions.create(
      model="gpt-4",  # This gets logged to Helicone
      messages=[{"role": "user", "content": "Hello!"}]
  )
  ```

  </TabItem>
</Tabs>

## 세션 추적과 Tracing

세션 ID와 경로를 사용해 여러 단계의 agentic LLM 상호작용을 추적합니다:

<Tabs>
  <TabItem value="sdk" label="Python SDK">

  ```python
  import os
  import litellm
  from litellm import completion

  os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

  messages = [{"content": "What is the capital of France?", "role": "user"}]

  response = completion(
      model="helicone/gpt-4",
      messages=messages,
      metadata={
          "Helicone-Session-Id": "session-abc-123",
          "Helicone-Session-Path": "parent-trace/child-trace",
      }
  )

  print(response)
  ```

  </TabItem>
  <TabItem value="proxy" label="LiteLLM Proxy">

  ```python
  import openai

  client = openai.OpenAI(
      api_key="anything",
      base_url="http://localhost:4000"
  )

  # First request in session
  response1 = client.chat.completions.create(
      model="gpt-4",
      messages=[{"role": "user", "content": "Hello"}],
      extra_headers={
          "Helicone-Session-Id": "session-abc-123",
          "Helicone-Session-Path": "conversation/greeting"
      }
  )

  # Follow-up request in same session
  response2 = client.chat.completions.create(
      model="gpt-4",
      messages=[{"role": "user", "content": "Tell me more"}],
      extra_headers={
          "Helicone-Session-Id": "session-abc-123",
          "Helicone-Session-Path": "conversation/follow-up"
      }
  )
  ```

  </TabItem>
</Tabs>

- `Helicone-Session-Id`: 관련 요청을 그룹화하기 위한 세션의 고유 식별자
- `Helicone-Session-Path`: parent/child trace를 표현하는 계층형 경로(예: "parent/child")

## Retry와 Fallback 메커니즘

<Tabs>
  <TabItem value="sdk" label="Python SDK">

  ```python
  import litellm

  litellm.api_base = "https://ai-gateway.helicone.ai/"
  litellm.metadata = {
      "Helicone-Retry-Enabled": "true",
      "helicone-retry-num": "3",
      "helicone-retry-factor": "2",
  }

  response = litellm.completion(
      model="helicone/gpt-4o-mini/openai,claude-3-5-sonnet-20241022/anthropic", # Try OpenAI first, then fallback to Anthropic, then continue with other models
      messages=[{"role": "user", "content": "Hello"}]
  )
  ```

  </TabItem>
  <TabItem value="proxy" label="LiteLLM Proxy">

  ```yaml title="config.yaml"
  model_list:
    - model_name: gpt-4
      litellm_params:
        model: gpt-4
        api_key: os.environ/OPENAI_API_KEY
        api_base: "https://oai.hconeai.com/v1"

  default_litellm_params:
    headers:
      Helicone-Auth: "Bearer ${HELICONE_API_KEY}"
      Helicone-Retry-Enabled: "true"
      helicone-retry-num: "3"
      helicone-retry-factor: "2"
      Helicone-Fallbacks: '["gpt-3.5-turbo", "gpt-4"]'

  environment_variables:
    HELICONE_API_KEY: "your-helicone-key"
    OPENAI_API_KEY: "your-openai-key"
  ```

  </TabItem>
</Tabs>

> **지원되는 헤더** - 지원되는 Helicone 헤더와 설명의 전체 목록은 [Helicone 문서](https://docs.helicone.ai/features/advanced-usage/custom-properties)를 참고하세요.
> 이러한 헤더와 metadata 옵션을 활용하면 LLM 사용량에 대한 더 깊은 인사이트를 얻고, 성능을 최적화하며, Helicone과 LiteLLM으로 AI 워크플로를 더 잘 관리할 수 있습니다.
