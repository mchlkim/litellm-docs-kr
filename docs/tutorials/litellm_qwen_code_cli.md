# Qwen Code CLI

이 튜토리얼에서는 Qwen Code CLI를 LiteLLM Proxy와 통합하여 LiteLLM의 통합 인터페이스를 통해 요청을 라우팅하는 방법을 설명합니다.


:::info 

이 통합은 LiteLLM v1.73.3-nightly 이상에서 지원됩니다.

:::

<br />

<iframe width="840" height="500" src="https://www.loom.com/embed/d7059b059c0f425fb0b8839418adffd6" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## LiteLLM과 함께 qwen-code를 사용할 때의 이점 {#benefits-of-using-qwen-code-with-litellm}

qwen-code를 LiteLLM과 함께 사용하면 다음과 같은 이점이 있습니다.

**개발자 이점:**
- 범용 모델 접근: qwen-code 인터페이스를 통해 LiteLLM이 지원하는 모든 모델(Anthropic, OpenAI, Vertex AI, Bedrock 등)을 사용할 수 있습니다.
- 더 높은 속도 제한과 안정성: 여러 모델과 제공자에 걸쳐 로드 밸런싱하여 개별 제공자의 제한에 걸리지 않도록 하고, 한 제공자가 실패해도 응답을 받을 수 있도록 폴백을 사용할 수 있습니다.

**Proxy 관리자 이점:**
- 중앙 집중식 관리: 개발자에게 각 제공자의 API 키를 제공하지 않고도 단일 LiteLLM proxy 인스턴스를 통해 모든 모델 접근을 제어할 수 있습니다.
- 예산 제어: 지출 한도를 설정하고 모든 qwen-code 사용량의 비용을 추적할 수 있습니다.



## 사전 준비

시작하기 전에 다음 항목이 준비되어 있는지 확인하세요.
- 시스템에 Node.js와 npm이 설치되어 있어야 합니다.
- 실행 중인 LiteLLM Proxy 인스턴스가 필요합니다.
- 유효한 LiteLLM Proxy API 키가 필요합니다.
- 저장소 복제를 위해 Git이 설치되어 있어야 합니다.

## 빠른 시작 가이드 {#quick-start-guide}

### 1단계: Qwen Code CLI 설치 {#step-1-install-qwen-code-cli}

Qwen Code CLI를 전역으로 설치합니다.

```bash
npm install -g @qwen-code/qwen-code
```

### 2단계: LiteLLM Proxy용 Qwen Code CLI 구성 {#step-2-configure-qwen-code-cli-for-litellm-proxy}

필수 환경 변수를 설정하여 Qwen Code CLI가 LiteLLM Proxy 인스턴스를 가리키도록 구성합니다.

```bash
export OPENAI_BASE_URL="http://localhost:4000"
export OPENAI_API_KEY=sk-1234567890
export OPENAI_MODEL="your-configured-model"
```

**참고:** 값을 실제 LiteLLM Proxy 구성에 맞게 바꾸세요.
- `OPENAI_BASE_URL`: LiteLLM Proxy가 실행 중인 URL
- `OPENAI_API_KEY`: LiteLLM Proxy API 키
- `OPENAI_MODEL`: 사용할 모델(LiteLLM proxy에 구성된 모델)

### 3단계: Qwen Code CLI 시작 {#step-3-build-and-start-qwen-code-cli}

CLI를 시작합니다.

```bash
qwen
```

### 4단계: 통합 테스트 {#step-4-test-the-integration}

CLI가 실행되면 테스트 요청을 보낼 수 있습니다. 이 요청은 LiteLLM Proxy를 통해 구성된 Qwen 모델로 자동 라우팅됩니다.

이제 CLI는 LiteLLM Proxy를 백엔드로 사용하므로 다음과 같은 LiteLLM 기능을 사용할 수 있습니다.
- 요청/응답 로깅
- 속도 제한
- 비용 추적
- 모델 라우팅 및 폴백


## 고급 설정 {#advanced}

### qwen-code에서 Anthropic, OpenAI, Bedrock 등의 모델 사용 {#use-anthropic-openai-bedrock-etc-models-on-qwen-code}

qwen-code에서 qwen이 아닌 모델을 사용하려면 LiteLLM Proxy 구성에서 `model_group_alias`를 설정해야 합니다. 이 설정은 model = `qwen-code`인 요청을 원하는 제공자의 모델로 라우팅하라고 LiteLLM에 알려줍니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="anthropic" label="Anthropic">

`qwen-code` 요청을 Claude Sonnet으로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: claude-sonnet-4-20250514
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  model_group_alias: {"qwen-code": "claude-sonnet-4-20250514"}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

`qwen-code` 요청을 GPT-4o로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: gpt-4o-model
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"qwen-code": "gpt-4o-model"}
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

`qwen-code` 요청을 Bedrock의 Claude로 라우팅합니다.

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

router_settings:
  model_group_alias: {"qwen-code": "bedrock-claude"}
```

</TabItem>
<TabItem value="multi-provider" label="다중 제공자 로드 밸런싱">

model_name=`anthropic-claude`인 모든 배포가 로드 밸런싱됩니다. 이 예시에서는 Anthropic과 Bedrock 사이에서 로드 밸런싱합니다.

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
  model_group_alias: {"qwen-code": "anthropic-claude"}
```

</TabItem>
</Tabs>

이 구성으로 CLI에서 `qwen-code`를 사용하면 LiteLLM이 로드 밸런싱과 폴백을 적용하여 요청을 구성된 제공자로 자동 라우팅합니다.





## 문제 해결

문제가 발생하면 다음을 확인하세요.

1. **연결 오류**: LiteLLM Proxy가 실행 중이며 구성된 `OPENAI_BASE_URL`에서 접근 가능한지 확인하세요.
2. **인증 오류**: `OPENAI_API_KEY`가 유효하고 필요한 권한을 가지고 있는지 확인하세요.
3. **빌드 실패**: 모든 의존성이 `npm install`로 설치되어 있는지 확인하세요.
