---
title: Python SDK 사용
sidebar_label: Python SDK
---

# Python SDK 사용

LiteLLM SDK는 여러 LLM 프로바이더를 하나의 Python 인터페이스로 호출하게 해 줍니다. SDK만 사용하면 별도 Gateway 없이 애플리케이션 코드에서 직접 모델을 호출합니다.

## 설치

```bash
uv add litellm
```

기존 `pip` 환경에서는 다음처럼 설치할 수도 있습니다.

```bash
pip install litellm
```

## 기본 패턴

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model="openai/gpt-4o",
    messages=[
        {"role": "user", "content": "한국어로 LiteLLM을 한 문장으로 설명해줘."}
    ],
)

print(response.choices[0].message.content)
```

핵심은 `model` 값입니다. LiteLLM은 보통 `provider/model-name` 형태를 사용합니다.

- `openai/gpt-4o`
- `anthropic/claude-3-5-sonnet-20241022`
- `azure/your-deployment-name`
- `bedrock/anthropic.claude-haiku-4-5-20251001:0`
- `vertex_ai/gemini-1.5-pro`
- `ollama/llama3`

## 프로바이더별 인증

인증은 대부분 환경 변수로 설정합니다.

### OpenAI

```bash
export OPENAI_API_KEY="your-api-key"
```

### Anthropic

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### Azure OpenAI

```bash
export AZURE_API_KEY="your-key"
export AZURE_API_BASE="https://your-resource.openai.azure.com"
export AZURE_API_VERSION="2024-02-01"
```

### AWS Bedrock

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION_NAME="us-east-1"
```

### Vertex AI

```bash
gcloud auth application-default login
export VERTEXAI_PROJECT="your-project-id"
export VERTEXAI_LOCATION="us-central1"
```

## Streaming

응답을 토큰 단위로 받고 싶으면 `stream=True`를 사용합니다.

```python
from litellm import completion

for chunk in completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "짧은 시를 써줘."}],
    stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")
```

## 예외 처리

LiteLLM은 여러 프로바이더의 오류를 OpenAI 호환 예외 형태로 맞춰 줍니다. 그래서 호출부에서는 공통 예외 처리 흐름을 만들 수 있습니다.

```python
import litellm

try:
    response = litellm.completion(
        model="openai/gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
    )
except litellm.AuthenticationError as exc:
    print("인증 오류:", exc)
except litellm.RateLimitError as exc:
    print("Rate limit:", exc)
except litellm.APIError as exc:
    print("API 오류:", exc)
```

## 비용과 사용량

응답에는 일반적으로 token usage가 포함됩니다.

```python
print(response.usage)
```

운영 환경에서 비용을 체계적으로 추적해야 한다면 SDK callback 또는 Proxy의 spend tracking을 사용합니다.

- [Cost Tracking](/litellm-docs-kr/docs/proxy/cost_tracking)
- [Integrations](/litellm-docs-kr/docs/integrations)

## 언제 SDK만 쓰면 좋은가

- 단일 애플리케이션에서 빠르게 여러 모델을 호출해야 할 때
- 별도 Gateway 운영이 아직 필요 없을 때
- 로컬 실험, PoC, 배치 작업, 내부 도구처럼 호출 주체가 명확할 때

팀 단위 예산, 키 발급, 중앙 로그, guardrail, fallback 정책이 필요해지면 Proxy 구성을 검토합니다.
