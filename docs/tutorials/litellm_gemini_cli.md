# Gemini CLI

이 튜토리얼에서는 Gemini CLI를 LiteLLM Proxy와 통합하여 LiteLLM의 통합 인터페이스를 통해 요청을 라우팅하는 방법을 설명합니다.


:::info 

이 통합은 LiteLLM v1.73.3-nightly 이상에서 지원됩니다.

:::

<br />

<iframe width="840" height="500" src="https://www.loom.com/embed/d5dadd811ae64c70b29a16ecd558d4ba" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## LiteLLM에서 gemini-cli를 사용할 때의 이점 {#benefits-of-using-gemini-cli-with-litellm}

gemini-cli를 LiteLLM과 함께 사용하면 다음과 같은 이점이 있습니다.

**개발자 이점:**
- 범용 모델 접근: gemini-cli 인터페이스를 통해 LiteLLM이 지원하는 모든 모델(Anthropic, OpenAI, Vertex AI, Bedrock 등)을 사용할 수 있습니다.
- 더 높은 속도 제한 및 안정성: 여러 모델과 공급자에 걸쳐 로드 밸런싱하여 개별 공급자 제한에 도달하는 상황을 피하고, 한 공급자가 실패해도 응답을 받을 수 있도록 폴백을 사용할 수 있습니다.

**Proxy 관리자 이점:**
- 중앙 집중식 관리: 개발자에게 각 공급자의 API 키를 제공하지 않고도 단일 LiteLLM Proxy 인스턴스를 통해 모든 모델 접근을 제어할 수 있습니다.
- 예산 제어: 모든 gemini-cli 사용량에 대해 지출 한도를 설정하고 비용을 추적할 수 있습니다.



## 사전 준비

시작하기 전에 다음 항목이 준비되어 있는지 확인하세요.
- 시스템에 설치된 Node.js 및 npm
- 실행 중인 LiteLLM Proxy 인스턴스
- 유효한 LiteLLM Proxy API 키
- 저장소 복제를 위해 설치된 Git

## 빠른 시작 가이드 {#quick-start-guide}

### 1단계: Gemini CLI 설치 {#step-1-install-gemini-cli}

Gemini CLI 저장소를 복제하고 프로젝트 디렉터리로 이동합니다.

```bash
npm install -g @google/gemini-cli
```

### 2단계: LiteLLM Proxy용 Gemini CLI 구성 {#step-2-configure-gemini-cli-for-litellm-proxy}

필수 환경 변수를 설정하여 Gemini CLI가 LiteLLM Proxy 인스턴스를 가리키도록 구성합니다.

```bash
export GOOGLE_GEMINI_BASE_URL="http://localhost:4000"
export GEMINI_API_KEY=sk-1234567890
```

**참고:** 값을 실제 LiteLLM Proxy 구성으로 바꾸세요.
- `BASE_URL`: LiteLLM Proxy가 실행 중인 URL
- `GEMINI_API_KEY`: LiteLLM Proxy API 키

### 3단계: Gemini CLI 빌드 및 시작 {#step-3-build-and-start-gemini-cli}

프로젝트를 빌드하고 CLI를 시작합니다.

```bash
gemini
```

### 4단계: 통합 테스트 {#step-4-test-the-integration}

CLI가 실행되면 테스트 요청을 보낼 수 있습니다. 이 요청은 LiteLLM Proxy를 통해 구성된 Gemini 모델로 자동 라우팅됩니다.

이제 CLI가 LiteLLM Proxy를 백엔드로 사용하므로 다음과 같은 LiteLLM 기능을 사용할 수 있습니다.
- 요청/응답 로깅
- 속도 제한
- 비용 추적
- 모델 라우팅 및 폴백


## 고급 설정 {#advanced}

### gemini-cli에서 Anthropic, OpenAI, Bedrock 등 모델 사용 {#use-anthropic-openai-bedrock-etc-models-on-gemini-cli}

gemini-cli에서 Gemini가 아닌 모델을 사용하려면 LiteLLM Proxy 구성에 `model_group_alias`를 설정해야 합니다. 이렇게 하면 `model = gemini-2.5-pro`인 요청을 원하는 공급자의 모델로 라우팅하도록 LiteLLM에 알려줄 수 있습니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="anthropic" label="Anthropic">

`gemini-2.5-pro` 요청을 Claude Sonnet으로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: claude-sonnet-4-20250514
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-pro": "claude-sonnet-4-20250514"}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

`gemini-2.5-pro` 요청을 GPT-4o로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: gpt-4o-model
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-pro": "gpt-4o-model"}
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

`gemini-2.5-pro` 요청을 Bedrock의 Claude로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

router_settings:
  model_group_alias: {"gemini-2.5-pro": "bedrock-claude"}
```

</TabItem>
<TabItem value="multi-provider" label="다중 공급자 로드 밸런싱">

`model_name=anthropic-claude`인 모든 배포는 로드 밸런싱됩니다. 이 예시에서는 Anthropic과 Bedrock 사이에서 로드 밸런싱합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY  
  - model_name: anthropic-claude
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

router_settings:
  model_group_alias: {"gemini-2.5-pro": "anthropic-claude"}
```

</TabItem>
</Tabs>

이 구성에서 CLI에 `gemini-2.5-pro`를 사용하면 LiteLLM이 로드 밸런싱과 폴백을 적용하여 구성된 공급자로 요청을 자동 라우팅합니다.







## 문제 해결

문제가 발생하면 다음을 확인하세요.

1. **연결 오류**: LiteLLM Proxy가 실행 중이며 구성된 `GOOGLE_GEMINI_BASE_URL`에서 접근 가능한지 확인하세요.
2. **인증 오류**: `GEMINI_API_KEY`가 유효하고 필요한 권한을 가지고 있는지 확인하세요.
3. **빌드 실패**: 모든 종속성이 `npm install`로 설치되어 있는지 확인하세요.
