---
title: LiteLLM 한국어 가이드
sidebar_label: 한국어 가이드
---

# LiteLLM 한국어 가이드

이 섹션은 공식 LiteLLM 문서를 한국어 실무 가이드 형태로 재구성한 진입점입니다. 원본 문서 구조는 그대로 유지되어 있으며, 이 섹션은 설치, SDK 사용, Proxy 운영, 프로바이더 연결, 라우팅, 관측성, 보안, 문제 해결을 빠르게 파악하도록 작성했습니다.

## LiteLLM이 하는 일

LiteLLM은 여러 LLM 프로바이더를 하나의 인터페이스로 호출하게 해 주는 Python SDK이자 AI Gateway입니다.

- OpenAI, Anthropic, Azure OpenAI, Vertex AI, Bedrock, Gemini, Ollama 등 여러 프로바이더를 같은 형식으로 호출합니다.
- OpenAI 호환 API 형식을 제공하므로 기존 OpenAI 클라이언트를 많이 바꾸지 않고 교체할 수 있습니다.
- Proxy Server를 배포하면 팀/조직 단위로 가상 키, 예산, 비용 추적, 라우팅, fallback, guardrail, 관리자 UI를 중앙 관리할 수 있습니다.
- SDK만 사용할 수도 있고, 운영 환경에서는 Proxy를 앞단 Gateway로 두는 구성이 일반적입니다.

## 어떤 경로로 시작할지 선택

### 애플리케이션 안에서 바로 호출하려는 경우

[Python SDK 가이드](./sdk.md)를 먼저 봅니다.

- Python 코드에서 `litellm.completion()`을 직접 호출합니다.
- 여러 프로바이더를 같은 코드 패턴으로 호출합니다.
- streaming, embedding, image generation, responses API 같은 SDK 기능을 붙입니다.

### 팀 공용 LLM Gateway를 운영하려는 경우

[Proxy / AI Gateway 가이드](./proxy.md)를 먼저 봅니다.

- LiteLLM Proxy를 Docker 또는 CLI로 실행합니다.
- OpenAI 호환 클라이언트가 Proxy URL을 바라보게 합니다.
- 가상 키, 팀/사용자 예산, 관리자 UI, 비용 추적을 설정합니다.

### 어떤 모델을 붙일지 정해야 하는 경우

[프로바이더와 모델 연결](./providers.md)을 봅니다.

- OpenAI, Anthropic, Azure, Bedrock, Vertex AI, Ollama 등 주요 프로바이더 설정 방식을 비교합니다.
- 모델 이름 prefix 규칙과 인증 환경 변수를 확인합니다.

### 운영 품질을 높여야 하는 경우

[라우팅, 관측성, 보안](./routing-observability-security.md)을 봅니다.

- load balancing, fallback, retry, timeout을 설정합니다.
- 비용 추적, 로그, callback, guardrail을 붙입니다.
- 운영 중 장애를 줄이기 위한 설정 기준을 확인합니다.

## 기본 설치

SDK만 사용할 때:

```bash
uv add litellm
```

Proxy까지 사용할 때:

```bash
uv tool install 'litellm[proxy]'
```

Docker 기반 운영을 검토한다면 공식 Proxy 빠른 시작 문서도 함께 참고합니다.

- [Proxy Docker 빠른 시작](/litellm-docs-kr/docs/proxy/docker_quick_start)
- [Proxy 빠른 시작](/litellm-docs-kr/docs/proxy/quick_start)

## 최소 호출 예시

```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```

## 최소 Proxy 호출 예시

Proxy를 실행한 뒤 OpenAI 클라이언트의 `base_url`만 LiteLLM으로 바꿉니다.

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-local-master-key",
    base_url="http://localhost:4000/v1",
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```

## 원본 문서와의 관계

이 한국어 섹션은 핵심 내용을 빠르게 이해하기 위한 실무형 문서입니다. 세부 옵션, 최신 프로바이더별 파라미터, 릴리즈별 변경 사항은 원본 구조를 유지한 각 문서 페이지에서 계속 확인할 수 있습니다.
