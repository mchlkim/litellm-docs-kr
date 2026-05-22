---
id: index
title: 시작하기
sidebar_label: 빠른 시작
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import NavigationCards from '@site/src/components/NavigationCards';
import Image from '@theme/IdealImage';

:::note 보안 업데이트
Trivy 공급망 침해 이슈는 조치가 완료되었습니다 :tada: . 영향을 받은 패키지는 모두 삭제되었고, 현재 릴리스에는 침해된 코드나 컴포넌트가 포함되어 있지 않습니다. 자세한 배경은 [Security Townhall](/litellm-docs-kr/blog/security-townhall-updates)을 참고하고, 이후 개선 방향은 [CI/CD v2](/litellm-docs-kr/blog/ci-cd-v2-improvements)에서 확인하세요.
:::

<Image style={{padding: '10px', margin: '0 0 2.5rem'}} img={require('../img/hero.png')} />

**LiteLLM**은 OpenAI 형식으로 100개 이상의 LLM을 호출할 수 있게 해 주는 오픈소스 라이브러리입니다. OpenAI, Anthropic, Vertex AI, Bedrock 등 여러 프로바이더를 하나의 통합 인터페이스로 다룹니다.

- 어떤 프로바이더든 동일한 `completion()` 인터페이스로 호출할 수 있어 API를 매번 다시 익힐 필요가 없습니다.
- 사용하는 프로바이더나 모델과 관계없이 일관된 출력 형식을 제공합니다.
- [Router](./routing.md)를 통해 여러 배포 대상 간 재시도와 fallback 로직을 내장합니다.
- 가상 키, 비용 추적, 관리자 UI를 제공하는 자체 호스팅 [LLM Gateway (Proxy)](./simple_proxy)를 운영할 수 있습니다.

[![PyPI](https://img.shields.io/pypi/v/litellm.svg)](https://pypi.org/project/litellm/)
[![GitHub Stars](https://img.shields.io/github/stars/BerriAI/litellm?style=social)](https://github.com/BerriAI/litellm)

---

## 설치

```shell
uv add litellm
```

전체 Proxy Server(LLM Gateway)를 실행하려면 다음을 사용합니다:

```shell
uv tool install 'litellm[proxy]'
```

---

## 빠른 시작

원하는 프로바이더를 선택해 첫 LLM 호출을 실행합니다:

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="openai/gpt-4o",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import completion
import os

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

response = completion(
  model="anthropic/claude-3-5-sonnet-20241022",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="vertex" label="Vertex AI">

```python
from litellm import completion
import os

# auth: run 'gcloud auth application-default login'
os.environ["VERTEXAI_PROJECT"] = "your-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = completion(
  model="vertex_ai/gemini-1.5-pro",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

```python
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = completion(
  model="bedrock/anthropic.claude-haiku-4-5-20251001:0",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="ollama" label="Ollama">

```python
from litellm import completion

response = completion(
  model="ollama/llama3",
  messages=[{"role": "user", "content": "Hello, how are you?"}],
  api_base="http://localhost:11434"
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="azure" label="Azure OpenAI">

```python
from litellm import completion
import os

os.environ["AZURE_API_KEY"] = "your-key"
os.environ["AZURE_API_BASE"] = "https://your-resource.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2024-02-01"

response = completion(
  model="azure/your-deployment-name",
  messages=[{"role": "user", "content": "Hello, how are you?"}]
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

어떤 프로바이더를 사용하든 모든 응답은 OpenAI Chat Completions 형식을 따릅니다. ✅

### 응답 형식

비스트리밍 응답은 `ModelResponse` 객체를 반환합니다:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thanks for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 12,
    "total_tokens": 25
  }
}
```

스트리밍 응답(`stream=True`)은 `ModelResponseStream` 청크를 반환합니다:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "delta": {
        "role": "assistant",
        "content": "Hello"
      },
      "finish_reason": null
    }
  ]
}
```

📖 [전체 출력 형식 참고 →](./completion/output)

:::tip Colab에서 열기
<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/liteLLM_Getting_Started.ipynb">
<img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>
:::

---

## LiteLLM이 처음인가요?

**빠르게 시작하고 싶다면** [튜토리얼](/litellm-docs-kr/docs/tutorials)에서 AI 코딩 도구, 에이전트 SDK, 프록시 설정 등을 단계별로 따라 할 수 있습니다.

**특정 기능을 이해해야 한다면** [가이드](/litellm-docs-kr/docs/guides)에서 스트리밍, 함수 호출, 프롬프트 캐싱 등 기능별 사용법을 확인하세요.

---

## 사용 경로 선택

<NavigationCards
columns={2}
items={[
{
icon: "🐍",
title: "Python SDK",
description: "LiteLLM을 Python 애플리케이션에 직접 통합합니다. OpenAI 클라이언트를 거의 그대로 대체할 수 있습니다.",
listDescription: [
"completion(), embedding(), image_generation() 등 지원",
"재시도, fallback, 부하 분산을 제공하는 Router",
"모든 프로바이더에서 OpenAI 호환 예외 형식 제공",
"Langfuse, MLflow, Helicone 등 관측성 callback 연동",
],
to: "#litellm-python-sdk",
},
{
icon: "🖥️",
title: "Proxy Server (LLM Gateway)",
description: "조직 전체의 LLM 접근을 관리하는 플랫폼 팀을 위한 자체 호스팅 게이트웨이입니다.",
listDescription: [
"키/팀/사용자별 예산을 설정할 수 있는 가상 키",
"중앙화된 로깅, 가드레일, 캐싱",
"모니터링과 관리를 위한 관리자 UI",
"OpenAI 호환 클라이언트에서 그대로 교체 가능한 인터페이스",
],
to: "#litellm-proxy-server-llm-gateway",
},
]}
/>

---

## LiteLLM Python SDK

### Streaming

생성되는 청크를 바로 받으려면 `stream=True`를 추가합니다:

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

for chunk in completion(
  model="openai/gpt-4o",
  messages=[{"role": "user", "content": "Write a short poem"}],
  stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")
```

### 예외 처리

LiteLLM은 모든 프로바이더의 오류를 OpenAI 예외 타입으로 매핑하므로, 기존 오류 처리 로직을 그대로 사용할 수 있습니다.

```python
import litellm

try:
    litellm.completion(
      model="anthropic/claude-instant-1",
      messages=[{"role": "user", "content": "Hey!"}]
    )
except litellm.AuthenticationError as e:
    print(f"Bad API key: {e}")
except litellm.RateLimitError as e:
    print(f"Rate limited: {e}")
except litellm.APIError as e:
    print(f"API error: {e}")
```

### 로깅 및 관측성

한 줄 설정으로 입력/출력을 Langfuse, MLflow, Helicone, Lunary 등으로 보낼 수 있습니다.

```python
import litellm

litellm.success_callback = ["langfuse", "mlflow", "helicone"]

response = litellm.completion(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Hi!"}]
)
```

📖 [전체 관측성 연동 보기 →](/litellm-docs-kr/docs/observability/agentops_integration)

### 비용 추적 및 사용법

callback을 사용해 응답별 비용을 기록할 수 있습니다.

```python
import litellm

def track_cost(kwargs, completion_response, start_time, end_time):
    print("Cost:", kwargs.get("response_cost", 0))

litellm.success_callback = [track_cost]

litellm.completion(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Hello!"}],
  stream=True
)
```

📖 [사용자 정의 callback 문서 →](./observability/custom_callback)

---

## LiteLLM Proxy {#litellm-proxy-server-llm-gateway}

Proxy는 자체 호스팅 OpenAI 호환 게이트웨이입니다. OpenAI와 함께 동작하는 클라이언트라면 코드 변경 없이 proxy와 함께 사용할 수 있습니다.

![LiteLLM Proxy Dashboard](https://github.com/BerriAI/litellm/assets/29436595/47c97d5e-b9be-4839-b28c-43d7f4f10033)

#### Step 1 — 프록시 시작

<Tabs>
<TabItem value="cli" label="LiteLLM CLI">

```shell
litellm --model huggingface/bigcode/starcoder
# Proxy running on http://0.0.0.0:4000
```

</TabItem>
<TabItem value="docker" label="Docker">

```yaml title="litellm_config.yaml"
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/your-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
```

```shell
docker run \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \
  -e AZURE_API_KEY=your-key \
  -e AZURE_API_BASE=https://your-resource.openai.azure.com/ \
  -p 4000:4000 \
  docker.litellm.ai/berriai/litellm:main-latest \
  --config /app/config.yaml --detailed_debug
```

</TabItem>
</Tabs>

#### Step 2 — OpenAI 클라이언트로 호출

```python
import openai

client = openai.OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[{"role": "user", "content": "Write a short poem"}]
)
print(response.choices[0].message.content)
```

👉 [Docker 기반 전체 proxy 빠른 시작 →](./proxy/docker_quick_start)

:::tip 디버깅 도구
[**`/utils/transform_request`**](./utils/transform_request)를 사용하면 LiteLLM이 각 프로바이더로 보내는 내용을 정확히 확인할 수 있습니다. 프롬프트 형식, header 문제, provider별 parameter를 디버깅할 때 유용합니다.
:::

🔗 [대화형 API explorer (Swagger) →](https://litellm-api.up.railway.app/)

---

## Agent 및 MCP Gateway

LiteLLM은 **LLM, agent, MCP**를 위한 통합 gateway입니다. 별도의 agent gateway나 MCP gateway가 필요 없고, 하나의 endpoint로 100개 이상의 모델, `A2A agent`, `MCP tool`을 사용할 수 있습니다.

<NavigationCards
columns={2}
items={[
{
icon: "🔗",
title: "A2A Agents",
description: "LiteLLM gateway를 통해 A2A agent를 추가하고 호출합니다.",
to: "/litellm-docs-kr/docs/a2a",
},
{
icon: "🛠️",
title: "MCP Gateway",
description: "key별 접근 제어가 포함된 중앙 MCP endpoint입니다.",
to: "/litellm-docs-kr/docs/mcp",
},
]}
/>

---

## 다음에 살펴볼 항목

<NavigationCards
columns={3}
items={[
{
icon: "🔀",
title: "라우팅 및 부하 분산",
description: "여러 deployment에 load balancing을 적용하고 자동 fallback을 설정합니다.",
to: "/litellm-docs-kr/docs/routing-load-balancing",
},
{
icon: "🔑",
title: "가상 키",
description: "team 또는 user별 접근, budget, rate limit을 관리합니다.",
to: "/litellm-docs-kr/docs/proxy/virtual_keys",
},
{
icon: "📊",
title: "비용 추적",
description: "모든 provider에서 key, team, user별 비용을 추적합니다.",
to: "/litellm-docs-kr/docs/proxy/cost_tracking",
},
{
icon: "🛡️",
title: "가드레일",
description: "content filtering, PII masking, safety check를 추가합니다.",
to: "/litellm-docs-kr/docs/proxy/guardrails/quick_start",
},
{
icon: "📡",
title: "관측성",
description: "Langfuse, MLflow, Helicone 등과 연동합니다.",
to: "/litellm-docs-kr/docs/observability/agentops_integration",
},
{
icon: "🏭",
title: "엔터프라이즈",
description: "production용 SSO/SAML, audit log, 고급 security 기능을 제공합니다.",
to: "/litellm-docs-kr/docs/enterprise",
},
]}
/>
