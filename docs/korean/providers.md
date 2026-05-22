---
title: 프로바이더와 모델 연결
sidebar_label: 프로바이더 / 모델
---

# 프로바이더와 모델 연결

LiteLLM은 모델 이름 prefix로 어떤 프로바이더를 호출할지 판단합니다. 같은 `completion()` 호출이라도 `model` 값만 바꿔 여러 프로바이더를 사용할 수 있습니다.

## 모델 이름 규칙

일반적인 형식은 다음과 같습니다.

```text
provider/model-name
```

예시:

```text
openai/gpt-4o
anthropic/claude-3-5-sonnet-20241022
azure/my-deployment
bedrock/anthropic.claude-haiku-4-5-20251001:0
vertex_ai/gemini-1.5-pro
ollama/llama3
```

Proxy에서는 외부에 보여 줄 이름과 실제 프로바이더 모델 이름을 분리할 수 있습니다.

```yaml
model_list:
  - model_name: company-chat
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

애플리케이션은 `company-chat`으로 요청하지만, 실제 호출은 `openai/gpt-4o`로 나갑니다.

## OpenAI

```bash
export OPENAI_API_KEY="your-api-key"
```

```python
response = completion(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Anthropic

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

```python
response = completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Azure OpenAI

Azure는 모델 이름보다 deployment 이름이 중요합니다.

```bash
export AZURE_API_KEY="your-key"
export AZURE_API_BASE="https://your-resource.openai.azure.com"
export AZURE_API_VERSION="2024-02-01"
```

```python
response = completion(
    model="azure/your-deployment-name",
    messages=[{"role": "user", "content": "Hello"}],
)
```

## AWS Bedrock

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION_NAME="us-east-1"
```

```python
response = completion(
    model="bedrock/anthropic.claude-haiku-4-5-20251001:0",
    messages=[{"role": "user", "content": "Hello"}],
)
```

운영 환경에서는 IAM Role, IRSA, ECS task role처럼 장기 access key를 줄이는 방식을 우선 검토합니다.

## Vertex AI

```bash
gcloud auth application-default login
export VERTEXAI_PROJECT="your-project-id"
export VERTEXAI_LOCATION="us-central1"
```

```python
response = completion(
    model="vertex_ai/gemini-1.5-pro",
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Ollama

로컬 Ollama를 사용할 때는 `api_base`를 지정합니다.

```python
response = completion(
    model="ollama/llama3",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="http://localhost:11434",
)
```

## Proxy에서 프로바이더를 숨기는 방식

팀이나 애플리케이션에 실제 프로바이더 이름을 노출하고 싶지 않다면 Proxy의 `model_name`을 내부 표준 이름으로 정합니다.

```yaml
model_list:
  - model_name: fast-chat
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: reasoning-chat
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
```

이렇게 하면 애플리케이션은 `fast-chat`, `reasoning-chat`만 알면 됩니다.

## 선택 기준

- 비용이 중요하면 모델별 단가와 token 사용량을 먼저 확인합니다.
- 지연 시간이 중요하면 지역, 프로바이더, streaming 지원 여부를 확인합니다.
- 기업 데이터 정책이 중요하면 데이터 보존, region, logging, privacy 정책을 확인합니다.
- 장애 대응이 중요하면 같은 모델군을 여러 프로바이더 또는 여러 deployment로 구성하고 fallback을 설정합니다.
