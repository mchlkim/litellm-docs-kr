---
sidebar_label: "GitHub Copilot"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GitHub Copilot

이 튜토리얼은 GitHub Copilot을 LiteLLM Proxy와 통합하여 LiteLLM의 통합 인터페이스를 통해 요청을 라우팅하는 방법을 보여줍니다.

:::info 

이 튜토리얼은 LiteLLM Proxy를 통해 GitHub Copilot 모델을 호출하는 방법을 다룬 [Sergio Pino의 훌륭한 가이드](https://dev.to/spino327/calling-github-copilot-models-from-openhands-using-litellm-proxy-1hl4)를 기반으로 합니다. 이 통합을 사용하면 GitHub Copilot 인터페이스를 통해 LiteLLM이 지원하는 모든 모델을 사용할 수 있습니다.

:::

## LiteLLM과 함께 GitHub Copilot을 사용할 때의 이점 {#benefits-of-using-github-copilot-with-litellm}

GitHub Copilot을 LiteLLM과 함께 사용하면 다음과 같은 이점이 있습니다.

**개발자 이점:**
- 범용 모델 접근: GitHub Copilot 인터페이스를 통해 LiteLLM이 지원하는 모든 모델(Anthropic, OpenAI, Vertex AI, Bedrock 등)을 사용할 수 있습니다.
- 더 높은 요청 한도 및 안정성: 여러 모델과 제공자에 걸쳐 로드 밸런싱하여 개별 제공자 제한에 도달하는 것을 피하고, 대체 경로를 통해 한 제공자가 실패해도 응답을 받을 수 있습니다.

**프록시 관리자 이점:**
- 중앙 집중식 관리: 개발자에게 각 제공자의 API 키를 제공하지 않고도 단일 LiteLLM 프록시 인스턴스를 통해 모든 모델 접근을 제어할 수 있습니다.
- 예산 제어: 모든 GitHub Copilot 사용량에 대해 지출 한도를 설정하고 비용을 추적할 수 있습니다.

## 사전 준비

시작하기 전에 다음을 준비했는지 확인하세요.
- GitHub Copilot 구독(Individual, Business 또는 Enterprise)
- 실행 중인 LiteLLM Proxy 인스턴스
- 유효한 LiteLLM Proxy API 키
- GitHub Copilot 확장 프로그램이 설치된 VS Code 또는 호환 IDE

## 빠른 시작 가이드 {#quick-start-guide}

### 1단계: LiteLLM 설치 {#step-1-install-litellm}

프록시 지원이 포함된 LiteLLM을 설치합니다.

```bash
uv tool install litellm[proxy]
```

### 2단계: LiteLLM Proxy 구성 {#step-2-configure-litellm-proxy}

모델 구성을 포함하는 `config.yaml` 파일을 만듭니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

general_settings:
  master_key: sk-1234567890 # Change this to a secure key
```

### 3단계: LiteLLM Proxy 시작 {#step-3-start-litellm-proxy}

프록시 서버를 시작합니다.

```bash
litellm --config config.yaml --port 4000
```

### 4단계: GitHub Copilot 구성 {#step-4-configure-github-copilot}

GitHub Copilot이 LiteLLM 프록시를 사용하도록 구성합니다. VS Code `settings.json`에 다음을 추가합니다.

```json
{
  "github.copilot.advanced": {
    "debug.overrideProxyUrl": "http://localhost:4000",
    "debug.testOverrideProxyUrl": "http://localhost:4000"
  }
}
```

### 5단계: 통합 테스트 {#step-5-test-the-integration}

VS Code를 다시 시작하고 GitHub Copilot을 테스트합니다. 이제 요청이 LiteLLM Proxy를 통해 라우팅되므로 다음과 같은 LiteLLM 기능을 사용할 수 있습니다.
- 요청/응답 로깅
- 속도 제한
- 비용 추적
- 모델 라우팅 및 대체 경로

## 고급 {#advanced}

### GitHub Copilot에서 Anthropic, OpenAI, Bedrock 등 모델 사용 {#use-anthropic-openai-bedrock-etc-models-with-github-copilot}

LiteLLM Proxy 설정에서 여러 모델을 구성하면 GitHub Copilot 요청을 원하는 제공자로 라우팅할 수 있습니다.

<Tabs>
<TabItem value="anthropic" label="Anthropic">

요청을 Claude Sonnet으로 라우팅합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

general_settings:
  master_key: sk-1234567890
```

</TabItem>
<TabItem value="openai" label="OpenAI">

요청을 GPT-4o로 라우팅합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: sk-1234567890
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

요청을 Bedrock의 Claude로 라우팅합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

general_settings:
  master_key: sk-1234567890
```

</TabItem>
<TabItem value="multi-provider" label="Multi-Provider Load Balancing">

동일한 model_name을 가진 모든 배포는 로드 밸런싱됩니다. 이 예시에서는 OpenAI와 Anthropic 사이에서 로드 밸런싱합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-4o  # Same model name for load balancing
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  routing_strategy: simple-shuffle

general_settings:
  master_key: sk-1234567890
```

</TabItem>
</Tabs>

이 구성을 사용하면 GitHub Copilot이 로드 밸런싱과 대체 경로를 적용하여 LiteLLM을 통해 구성된 제공자로 요청을 자동 라우팅합니다.

## 문제 해결

문제가 발생하면 다음을 확인하세요.

1. **GitHub Copilot이 프록시를 사용하지 않음**: VS Code 설정에 프록시 URL이 올바르게 구성되어 있고 LiteLLM 프록시가 실행 중인지 확인하세요.
2. **인증 오류**: master key가 유효하고 제공자용 API 키가 올바르게 설정되어 있는지 확인하세요.
3. **연결 오류**: LiteLLM Proxy에 `http://localhost:4000`에서 접근할 수 있는지 확인하세요.

## 크레딧 {#credits}

이 튜토리얼은 [Sergio Pino](https://dev.to/spino327)의 원문 글 [Calling GitHub Copilot models from OpenHands using LiteLLM Proxy](https://dev.to/spino327/calling-github-copilot-models-from-openhands-using-litellm-proxy-1hl4)를 기반으로 합니다. 토대가 되는 작업에 감사드립니다!
