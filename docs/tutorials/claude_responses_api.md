import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Claude Code 빠른 시작

이 튜토리얼에서는 Claude Code에서 LiteLLM 프록시를 통해 Claude 모델을 호출하는 방법을 설명합니다.

:::info 

이 튜토리얼은 [Anthropic의 공식 LiteLLM 구성 문서](https://docs.anthropic.com/en/docs/claude-code/llm-gateway#litellm-configuration)를 기반으로 합니다. 이 통합을 사용하면 중앙 집중식 인증, 사용량 추적, 비용 제어와 함께 Claude Code에서 LiteLLM이 지원하는 모든 모델을 사용할 수 있습니다.

:::

<br />

### 동영상 안내

<iframe width="840" height="500" src="https://www.loom.com/embed/3c17d683cdb74d36a3698763cc558f56" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 사전 준비

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 설치
- 선택한 프로바이더의 API 키

## 설치

먼저 프록시 지원이 포함된 LiteLLM을 설치합니다.

```bash
uv tool install 'litellm[proxy]'
```

### 1. config.yaml 설정

환경 변수를 사용해 안전한 구성을 만듭니다.

```yaml
model_list:
  # Configure the models you want to use
  - model_name: claude-sonnet-4-5-20250929
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-haiku-4-5-20251001
    litellm_params:
      model: anthropic/claude-haiku-4-5-20251001
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-opus-4-5-20251101
    litellm_params:
      model: anthropic/claude-opus-4-5-20251101
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

환경 변수를 설정합니다.

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export LITELLM_MASTER_KEY="sk-1234567890"  # Generate a secure key
```

:::tip
또는 프록시 디렉터리의 `.env` 파일에 `ANTHROPIC_API_KEY`를 저장할 수 있습니다. LiteLLM은 시작할 때 이를 자동으로 로드합니다.
:::

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 설정 확인

프록시가 올바르게 동작하는지 테스트합니다.

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

### 4. Claude Code 구성

#### 방법 1: 통합 엔드포인트(권장)

Claude Code가 LiteLLM의 통합 엔드포인트를 사용하도록 구성합니다.

여기서는 가상 키 또는 마스터 키를 사용할 수 있습니다.

```bash
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"
```

:::tip
`LITELLM_MASTER_KEY`는 Claude가 모든 프록시 모델에 접근할 수 있게 해 주지만, 가상 키는 UI에서 설정된 모델로 제한됩니다.
:::

#### 방법 2: 프로바이더별 패스스루 엔드포인트

또는 Anthropic 패스스루 엔드포인트를 사용합니다.

```bash
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000/anthropic"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"
```

### 5. Claude Code 사용

사용하려는 모델로 Claude Code를 시작합니다.

```bash
# Specify model at startup
claude --model claude-sonnet-4-5-20250929

# Or specify a different model
claude --model claude-haiku-4-5-20251001
claude --model claude-opus-4-5-20251101

# Or change model during a session
claude
/model claude-sonnet-4-5-20250929
```

또는 환경 변수로 기본 모델을 설정합니다.

```bash
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-5-20250929
export ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-5-20251001
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-5-20251101
claude
```

### 1M 컨텍스트 창 사용

Claude Code는 `[1m]` 접미사를 사용해 확장 컨텍스트(100만 토큰)를 지원합니다.

```bash
# Use Sonnet with 1M context (requires quotes in shell)
claude --model 'claude-sonnet-4-5-20250929[1m]'

# Inside a Claude Code session (no quotes needed)
/model claude-sonnet-4-5-20250929[1m]
```

:::warning
**중요:** 셸에서 `[1m]`과 함께 `--model`을 사용할 때는 셸이 대괄호를 해석하지 않도록 반드시 따옴표를 사용해야 합니다.
:::

**동작 방식:**
- Claude Code는 LiteLLM으로 보내기 전에 `[1m]` 접미사를 제거합니다.
- Claude Code는 `anthropic-beta: context-1m-2025-08-07` 헤더를 자동으로 추가합니다.
- LiteLLM 구성의 모델 이름에는 `[1m]`을 **포함하지 않아야** 합니다.

**1M 컨텍스트가 활성화되었는지 확인:**
```bash
/context
# Should show: 21k/1000k tokens (2%)
```

예제 대화:

## 문제 해결

일반적인 문제와 해결 방법:

**Claude Code가 연결되지 않음:**
- 프록시가 실행 중인지 확인합니다: `curl http://0.0.0.0:4000/health`
- `ANTHROPIC_BASE_URL`이 올바르게 설정되었는지 확인합니다.
- `ANTHROPIC_AUTH_TOKEN`이 LiteLLM 마스터 키와 일치하는지 확인합니다.

**인증 오류:**
- 환경 변수가 설정되었는지 확인합니다: `echo $LITELLM_MASTER_KEY`
- API 키가 유효하고 충분한 크레딧이 있는지 확인합니다.
- `ANTHROPIC_AUTH_TOKEN`이 LiteLLM 마스터 키와 일치하는지 확인합니다.

**모델을 찾을 수 없음:**
- Claude Code의 모델 이름이 `config.yaml`과 정확히 일치하는지 확인합니다.
- `--model` 플래그 또는 환경 변수를 사용해 모델을 지정합니다.
- 자세한 오류 메시지는 LiteLLM 로그에서 확인합니다.

## Bedrock/Vertex AI/Azure Foundry 모델 사용

여러 프로바이더와 모델을 지원하도록 구성을 확장합니다.

<Tabs>
<TabItem value="multi-provider" label="멀티 프로바이더 설정">

```yaml
model_list:
  # Anthropic models
  - model_name: claude-3-5-sonnet-20241022
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
  
  - model_name: claude-3-5-haiku-20241022
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  # AWS Bedrock
  - model_name: claude-bedrock
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

  # Azure Foundry
  - model_name: claude-4-azure
    litellm_params:
      model: azure_ai/claude-opus-4-1
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE # https://my-resource.services.ai.azure.com/anthropic

  # Google Vertex AI
  - model_name: anthropic-vertex
    litellm_params:
      model: vertex_ai/claude-haiku-4-5@20251001
      vertex_ai_project: "my-test-project"
      vertex_ai_location: "us-east-1"
      vertex_credentials: os.environ/VERTEX_FILE_PATH_ENV_VAR # os.environ["VERTEX_FILE_PATH_ENV_VAR"] = "/path/to/service_account.json" 




litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

모델 간에 원활하게 전환합니다.

```bash
# Use Claude for complex reasoning
claude --model claude-3-5-sonnet-20241022

# Use Haiku for fast responses
claude --model claude-3-5-haiku-20241022

# Use Bedrock deployment
claude --model claude-bedrock

# Use Azure Foundry deployment
claude --model claude-4-azure

# Use Vertex AI deployment
claude --model anthropic-vertex
```

</TabItem>
</Tabs>

<Image img={require('../../img/release_notes/claude_code_demo.png')} style={{ width: '500px', height: 'auto' }} />
