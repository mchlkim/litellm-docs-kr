import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Non-Anthropic 모델로 Claude Code 사용하기

이 튜토리얼에서는 LiteLLM proxy를 통해 OpenAI, Gemini 및 기타 LLM provider 같은 non-Anthropic 모델을 Claude Code에서 사용하는 방법을 설명합니다.

:::info 

LiteLLM은 서로 다른 provider 형식을 자동으로 변환하므로, Anthropic Messages API 형식을 유지하면서 Claude Code에서 지원되는 모든 LLM provider를 사용할 수 있습니다.

:::

## 사전 준비

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 설치
- 선택한 provider의 API key (OpenAI, Vertex AI 등)

## 설치

먼저 proxy 지원이 포함된 LiteLLM을 설치합니다.

```bash
uv tool install 'litellm[proxy]'
```

## 설정

### 1. config.yaml 설정

사용하려는 non-Anthropic 모델로 구성 파일을 만듭니다.

<Tabs>
<TabItem value="openai" label="OpenAI">

```yaml
model_list:
  # OpenAI GPT-4o
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  
  # OpenAI GPT-4o-mini
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
```

환경 변수를 설정합니다.

```bash
export OPENAI_API_KEY="your-openai-api-key"
export LITELLM_MASTER_KEY="sk-1234567890"  # Generate a secure key
```

</TabItem>
<TabItem value="gemini" label="Google AI Studio">

```yaml
model_list:
  # Google Gemini
  - model_name: gemini-3.0-flash-exp
    litellm_params:
      model: gemini/gemini-3.0-flash-exp
      api_key: os.environ/GEMINI_API_KEY
```

환경 변수를 설정합니다.

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export LITELLM_MASTER_KEY="sk-1234567890"  # Generate a secure key
```

</TabItem>
<TabItem value="vertex_ai" label="Vertex AI">

```yaml
model_list:
  # Google Gemini
  - model_name: vertex-gemini-3-flash-preview
    litellm_params:
      model: vertex_ai/gemini-3-flash-preview
      vertex_credentials: os.environ/VERTEX_FILE_PATH_ENV_VAR # os.environ["VERTEX_FILE_PATH_ENV_VAR"] = "/path/to/service_account.json" 
      vertex_project: "my-test-project"
      vertex_location: "us-east-1"

  # Anthropic Claude
  - model_name: anthropic-vertex
    litellm_params:
      model: vertex_ai/claude-3-sonnet@20240229
      vertex_ai_project: "my-test-project"
      vertex_ai_location: "us-east-1"
      vertex_credentials: os.environ/VERTEX_FILE_PATH_ENV_VAR # os.environ["VERTEX_FILE_PATH_ENV_VAR"] = "/path/to/service_account.json" 
```

환경 변수를 설정합니다.

```bash
export VERTEX_FILE_PATH_ENV_VAR="/path/to/service_account.json"
export LITELLM_MASTER_KEY="sk-1234567890"  
```

</TabItem>
<TabItem value="multi" label="Azure OpenAI">

```yaml
model_list:
  # Azure OpenAI
  - model_name: azure-gpt-4
    litellm_params:
      model: azure/gpt-4
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2024-02-01"
```

환경 변수를 설정합니다.

```bash
export AZURE_API_KEY="your-azure-api-key"
export AZURE_API_BASE="https://your-resource.openai.azure.com"
export LITELLM_MASTER_KEY="sk-1234567890"
```

</TabItem>
</Tabs>

### 2. LiteLLM Proxy 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 설정 확인

proxy가 올바르게 작동하는지 테스트합니다.

<Tabs>
<TabItem value="openai-test" label="OpenAI">

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "gpt-4o",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

</TabItem>
<TabItem value="gemini-test" label="Google AI Studio">

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "gemini-3.0-flash-exp",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

</TabItem>
<TabItem value="vertex-test" label="Vertex AI">

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "gemini-3.0-flash-exp",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

</TabItem>
<TabItem value="azure-test" label="Azure OpenAI">

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "azure-gpt-4",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

</TabItem>
</Tabs>

### 4. Claude Code 구성

Claude Code가 LiteLLM proxy를 사용하도록 구성합니다.

```bash
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"
```

:::tip
`LITELLM_MASTER_KEY`는 Claude Code가 모든 proxy 모델에 접근할 수 있게 합니다. LiteLLM UI에서 virtual key를 만들어 특정 모델로 접근을 제한할 수도 있습니다.
:::

### 5. Non-Anthropic 모델로 Claude Code 사용

Claude Code를 시작하고 사용할 모델을 지정합니다.

```bash
# Use OpenAI GPT-4o
claude --model gpt-4o

# Use OpenAI GPT-4o-mini for faster responses
claude --model gpt-4o-mini

# Use Google Gemini
claude --model gemini-3.0-flash-exp

# Use Vertex AI Gemini
claude --model vertex-gemini-3-flash-preview

# Use Vertex AI Anthropic Claude
claude --model anthropic-vertex

# Use Azure OpenAI
claude --model azure-gpt-4
```

## 작동 방식

LiteLLM은 다음을 수행하는 통합 인터페이스로 동작합니다.

1. Claude Code에서 Anthropic Messages API 형식의 **요청을 수신**합니다.
2. 요청을 대상 provider 형식으로 **변환**합니다. (OpenAI, Gemini 등)
3. 요청을 실제 provider로 **전달**합니다.
4. 응답을 Anthropic Messages API 형식으로 다시 **변환**합니다.
5. Claude Code에 응답을 **반환**합니다.

이를 통해 LiteLLM이 지원하는 모든 LLM provider에서 Claude Code 인터페이스를 사용할 수 있습니다.

## 고급 기능

### 로드 밸런싱 및 폴백

자동 폴백을 사용하도록 여러 deployment를 구성합니다.

```yaml
model_list:
  - model_name: gpt-4o  # virtual model name
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
  
  - model_name: gpt-4o  # same virtual name
    litellm_params:
      model: azure/gpt-4o
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE

router_settings:
  routing_strategy: simple-shuffle  # Load balance between deployments
  num_retries: 2
  timeout: 30
```

### 사용량 추적 및 예산

LiteLLM UI에서 사용량을 추적하고 예산을 설정합니다.

```yaml
litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: "postgresql://..."  # Enable database for tracking
  
general_settings:
  store_model_in_db: true
```

UI와 함께 proxy를 시작합니다.

```bash
litellm --config /path/to/config.yaml --detailed_debug
```

`http://0.0.0.0:4000/ui`에서 UI에 접속해 다음 작업을 할 수 있습니다.
- 사용량 분석 보기
- user/key별 예산 한도 설정
- 여러 provider의 비용 모니터링
- 특정 권한이 있는 virtual key 생성


## 지원 프로바이더

LiteLLM은 100개 이상의 provider를 지원합니다. Claude Code와 함께 자주 사용하는 provider는 다음과 같습니다.

- **OpenAI**: `GPT-4o`, `GPT-4o-mini`, `o1`, `o3-mini`
- **Google**: `Gemini 2.0 Flash`, `Gemini 1.5 Pro/Flash`
- **Azure OpenAI**: Azure를 통한 모든 OpenAI 모델
- **AWS Bedrock**: Llama, Mistral 및 기타 모델
- **Vertex AI**: Google Cloud의 Gemini, Claude 및 기타 모델
- **Groq**: Llama 및 Mixtral을 위한 빠른 추론
- **Together AI**: Llama, Mixtral 및 기타 open source 모델
- **Deepseek**: `Deepseek-chat`, `Deepseek-coder`

[지원되는 provider 전체 목록 보기 →](https://docs.litellm.ai/docs/providers)
