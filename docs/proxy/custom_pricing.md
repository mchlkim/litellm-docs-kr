import Image from '@theme/IdealImage';

# 커스텀 LLM 가격 책정 {#custom-llm-pricing}

## 개요

LiteLLM은 모든 LLM provider에 대해 유연한 비용 추적과 가격 책정 커스터마이징을 제공합니다.

- **Custom Pricing** - 기본 모델 비용을 재정의하거나 커스텀 모델의 가격을 설정합니다.
- **Cost Per Token** - 입력/출력 token 기준으로 비용을 추적합니다. 가장 일반적인 방식입니다.
- **Cost Per Second** - 실행 시간 기준으로 비용을 추적합니다. 예: Sagemaker.
- **Zero-Cost 모델** - 비용을 0으로 설정해 무료/on-premises 모델의 budget check를 우회합니다.
- **[Provider Discounts](./provider_discounts.md)** - 특정 provider에 percentage 기반 할인을 적용합니다.
- **[Provider Margins](./provider_margins.md)** - 내부 과금용으로 LLM 비용에 fee/margin을 추가합니다.
- **Base Model Mapping** - Azure deployment의 비용을 정확히 추적하도록 보장합니다.

기본적으로 성공 시(sync + async) logging object에서 `kwargs["response_cost"]`를 통해 응답 비용에 접근할 수 있습니다. [**더 알아보기**](../observability/custom_callback.md)

:::info

LiteLLM은 이미 [model cost map](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에 100개 이상의 모델 가격 정보를 포함하고 있습니다.

:::

## Cost Per Second (예: Sagemaker) {#cost-per-second-eg-sagemaker}

#### LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

**1단계: config.yaml에 가격 정보 추가**
```yaml
model_list:
  - model_name: sagemaker-completion-model
    litellm_params:
      model: sagemaker/berri-benchmarking-Llama-2-70b-chat-hf-4
    model_info:
      input_cost_per_second: 0.000420
  - model_name: sagemaker-embedding-model
    litellm_params:
      model: sagemaker/berri-benchmarking-gpt-j-6b-fp16
    model_info:
      input_cost_per_second: 0.000420 
```

**2단계: proxy 시작**

```bash
litellm /path/to/config.yaml
```

**3단계: Spend 로그 확인**

<Image img={require('../../img/spend_logs_table.png')} />

## Cost Per Token (예: Azure) {#cost-per-token-eg-azure}

#### LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server-1}

```yaml
model_list:
  - model_name: azure-model
    litellm_params:
      model: azure/<your_deployment_name>
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: os.environ/AZURE_API_VERSION
    model_info:
      input_cost_per_token: 0.000421 # 👈 ONLY to track cost per token
      output_cost_per_token: 0.000520 # 👈 ONLY to track cost per token
```

## Model Cost Map 재정의 {#override-model-cost-map}

매핑된 모델에 대해 자체 custom pricing을 사용하여 [model cost map](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)을 재정의할 수 있습니다.

config의 모델에 `model_info` key를 추가한 뒤 원하는 key를 재정의하면 됩니다.

예제: `prod/claude-3-5-sonnet-20241022` 모델에 대해 Anthropic model cost map을 재정의합니다.

```yaml
model_list:
  - model_name: "prod/claude-3-5-sonnet-20241022"
    litellm_params:
      model: "anthropic/claude-3-5-sonnet-20241022"
      api_key: os.environ/ANTHROPIC_PROD_API_KEY
    model_info:
      input_cost_per_token: 0.000006
      output_cost_per_token: 0.00003
      cache_creation_input_token_cost: 0.0000075
      cache_read_input_token_cost: 0.0000006
```

### 추가 Cost Key {#additional-cost-keys}

다양한 시나리오와 modality의 비용을 지정하는 데 사용할 수 있는 다른 key도 있습니다.

- `input_cost_per_token_above_200k_tokens` - context가 200k token을 초과할 때 input token 비용
- `output_cost_per_token_above_200k_tokens` - context가 200k token을 초과할 때 output token 비용
- `cache_creation_input_token_cost_above_200k_tokens` - large context의 cache creation 비용
- `cache_read_input_token_cost_above_200k_token` - large context의 cache read 비용
- `input_cost_per_image` - multimodal 요청의 image당 비용
- `output_cost_per_reasoning_token` - reasoning token 비용. 예: OpenAI o1 모델.
- `input_cost_per_audio_token` - audio input token 비용
- `output_cost_per_audio_token` - audio output token 비용
- `input_cost_per_video_per_second` - video input의 초당 비용
- `input_cost_per_video_per_second_above_128k_tokens` - large context의 video 비용
- `input_cost_per_character` - 일부 provider의 문자 기반 가격 책정
- `input_cost_per_token_priority` / `output_cost_per_token_priority` - Priority/PayGo 가격 책정(Vertex AI Gemini, Bedrock)
- `input_cost_per_token_flex` / `output_cost_per_token_flex` - Batch/flex 가격 책정

새 모델이 multimodality를 처리하는 방식에 따라 이러한 key는 계속 바뀝니다. 최신 버전은 [https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 확인할 수 있습니다.

### Service Tier / PayGo 가격 책정(Vertex AI, Bedrock) {#service-tier--paygo-pricing-vertex-ai-bedrock}

여러 pricing tier를 지원하는 provider의 경우(예: Vertex AI PayGo, Bedrock service tier), LiteLLM은 응답을 기준으로 올바른 비용을 자동 적용합니다.

- **Vertex AI Gemini**: `usageMetadata.trafficType`을 사용합니다(`ON_DEMAND_PRIORITY` → priority, `FLEX`/`BATCH` → flex). [Vertex AI - PayGo / Priority Cost Tracking](../providers/vertex.md#paygo--priority-cost-tracking)을 참고하세요.
- **Bedrock**: 응답의 `serviceTier`를 사용합니다. [Bedrock - 사용법 - Service Tier](../providers/bedrock.md#usage---service-tier)를 참고하세요.

## Zero-Cost 모델(Budget Check 우회) {#zero-cost-models-bypass-budget-checks}

**사용 사례**: 사용자가 budget limit을 초과해도 접근할 수 있어야 하는 on-premises 또는 무료 모델이 있습니다.

**해결 방법** ✅: 해당 모델의 모든 budget check를 우회하려면 `input_cost_per_token`과 `output_cost_per_token`을 모두 명시적으로 `0`으로 설정합니다.

:::info

모델이 zero cost로 구성되면 LiteLLM은 해당 모델 요청에 대해 모든 budget check(user, team, team member, end-user, organization, global proxy budget)를 자동으로 건너뜁니다.

**중요**: 두 비용을 모두 **명시적으로 0으로 설정**해야 합니다. 비용이 `null`이거나 정의되지 않은 경우, 모델에 비용이 있는 것으로 처리되어 budget check가 적용됩니다.

:::

### 설정 예제

```yaml
model_list:
  # On-premises model - free to use
  - model_name: on-prem-llama
    litellm_params:
      model: ollama/llama3
      api_base: http://localhost:11434
    model_info:
      input_cost_per_token: 0   # 👈 Explicitly set to 0
      output_cost_per_token: 0  # 👈 Explicitly set to 0
  
  # Paid cloud model - budget checks apply
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY
    # No model_info - uses default pricing from cost map
```

### 동작 {#behavior}

위 구성에서는 다음과 같이 동작합니다.

- **User budget 초과** → `on-prem-llama`는 계속 사용할 수 있지만 ✅, `gpt-4`는 차단됩니다 ❌
- **Team budget 초과** → `on-prem-llama`는 계속 사용할 수 있지만 ✅, `gpt-4`는 차단됩니다 ❌
- **End-user budget 초과** → `on-prem-llama`는 계속 사용할 수 있지만 ✅, `gpt-4`는 차단됩니다 ❌

이를 통해 무료/on-premises 모델은 budget constraint와 관계없이 계속 접근 가능하게 유지하면서, 유료 모델은 적절히 제어할 수 있습니다.

## Cost Tracking을 위한 `base_model` 설정(예: Azure deployment) {#set-base_model-for-cost-tracking-eg-azure-deployments}

**문제**: `azure/gpt-4-1106-preview`를 사용할 때 Azure가 응답에서 `gpt-4`를 반환합니다. 이로 인해 비용 추적이 부정확해집니다.

**해결 방법** ✅: Azure 비용 계산에 올바른 모델을 사용하도록 config에서 `base_model`을 설정합니다.

[여기](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 base model 이름을 확인하세요.

`base_model`을 사용하는 config 예제
```yaml
model_list:
  - model_name: azure-gpt-3.5
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      base_model: azure/gpt-4-1106-preview
```

### Dated Version이 있는 OpenAI 모델 {#openai-models-with-dated-versions}

OpenAI가 응답에서 구성한 모델 이름과 다른 dated model name을 반환할 때도 `base_model`이 유용합니다.

**예제**: `gpt-4o-mini-audio-preview`에 custom pricing을 구성했지만 OpenAI가 응답에서 `gpt-4o-mini-audio-preview-2024-12-17`을 반환합니다. LiteLLM은 pricing lookup에 응답의 모델 이름을 사용하므로 custom pricing이 적용되지 않습니다.

**해결 방법** ✅: LiteLLM이 pricing lookup에 사용하기를 원하는 key로 `base_model`을 설정합니다.

```yaml
model_list:
  - model_name: my-audio-model
    litellm_params:
      model: openai/gpt-4o-mini-audio-preview
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      base_model: gpt-4o-mini-audio-preview  # 👈 Used for pricing lookup
      input_cost_per_token: 0.0000006
      output_cost_per_token: 0.0000024
      input_cost_per_audio_token: 0.00001
      output_cost_per_audio_token: 0.00002
```


## Debugging {#debugging}

custom pricing이 사용되지 않거나 오류가 표시되면 다음 항목을 확인하세요.

1. `LITELLM_LOG="DEBUG"` 또는 `--detailed_debug` CLI flag로 proxy를 실행합니다.

```bash
litellm --config /path/to/config.yaml --detailed_debug
```

2. 로그에서 다음 줄을 확인합니다.

```
LiteLLM:DEBUG: utils.py:263 - litellm.acompletion
```

3. acompletion function에서 `input_cost_per_token`과 `output_cost_per_token`이 top-level key인지 확인합니다.

```bash
acompletion(
  ...,
  input_cost_per_token: my-custom-price, 
  output_cost_per_token: my-custom-price,
)
```

이 key가 없으면 LiteLLM은 custom pricing을 사용하지 않습니다.

문제가 계속되면 [GitHub](https://github.com/BerriAI/litellm/issues)에 issue를 등록하세요.
