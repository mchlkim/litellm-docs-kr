import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 개요
`config.yaml`에서 모델 목록, `api_base`, `api_key`, `temperature`, proxy server 설정(`master-key`)을 지정합니다.

| 파라미터 이름           | 설명                                                   |
|----------------------|---------------------------------------------------------------|
| `model_list`         | 서버에서 지원하는 모델 목록과 모델별 설정 |
| `router_settings`   | litellm Router 설정입니다. 예: `routing_strategy="least-busy"` [**전체 보기**](#router-settings)|
| `litellm_settings`   | litellm module 설정입니다. 예: `litellm.drop_params=True`, `litellm.set_verbose=True`, `litellm.api_base`, `litellm.cache` [**전체 보기**](#all-settings)|
| `general_settings`   | 서버 설정입니다. 예: `master_key: sk-my_special_key` |
| `environment_variables`   | 환경 변수 예시입니다. `REDIS_HOST`, `REDIS_PORT` |

**전체 목록:** `config.yaml`에 전달할 수 있는 모든 항목은 `<your-proxy-url>/#/config.yaml`(예: http://0.0.0.0:4000/#/config.yaml)의 Swagger UI 문서를 확인하세요.


## 빠른 시작 

deployment에 사용할 모델 alias를 설정합니다.

`config.yaml`에서 `model_name` 파라미터는 사용자가 deployment를 호출할 때 쓰는 외부 표시 이름입니다.

아래 설정에서:
- `model_name`: 외부 client가 litellm에 전달하는 이름
- `litellm_params.model`: `litellm.completion()` 함수에 전달되는 모델 문자열

예:
- `model=vllm-models`는 `openai/facebook/opt-125m`으로 라우팅됩니다.
- `model=gpt-4o`는 `azure/gpt-4o-eu`와 `azure/gpt-4o-ca` 사이에서 load balance됩니다.

```yaml
model_list:
  - model_name: gpt-4o ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: azure/gpt-4o-eu ### MODEL NAME sent to `litellm.completion()` ###
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU" # does os.getenv("AZURE_API_KEY_EU")
      rpm: 6      # [OPTIONAL] Rate limit for this deployment: in requests per minute (rpm)
  - model_name: bedrock-claude-v1 
    litellm_params:
      model: bedrock/anthropic.claude-instant-v1
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_CA"
      rpm: 6
  - model_name: anthropic-claude
    litellm_params: 
      model: bedrock/anthropic.claude-instant-v1
      ### [OPTIONAL] SET AWS REGION ###
      aws_region_name: us-east-1
  - model_name: vllm-models
    litellm_params:
      model: openai/facebook/opt-125m # the `openai/` prefix tells litellm it's openai compatible
      api_base: http://0.0.0.0:4000/v1
      api_key: none
      rpm: 1440
    model_info: 
      version: 2
  
  # Use this if you want to make requests to `claude-3-haiku-20240307`,`claude-3-opus-20240229`,`claude-2.1` without defining them on the config.yaml
  # Default models
  # Works for ALL Providers and needs the default provider credentials in .env
  - model_name: "*" 
    litellm_params:
      model: "*"

litellm_settings: # module level litellm settings - https://github.com/BerriAI/litellm/blob/main/litellm/__init__.py
  drop_params: True
  success_callback: ["langfuse"] # OPTIONAL - if you want to start sending LLM Logs to Langfuse. Make sure to set `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` in your env

general_settings: 
  master_key: sk-1234 # [OPTIONAL] Only use this if you to require all calls to contain this key (Authorization: Bearer sk-1234)
  alerting: ["slack"] # [OPTIONAL] If you want Slack Alerts for Hanging LLM requests, Slow llm responses, Budget Alerts. Make sure to set `SLACK_WEBHOOK_URL` in your env
```
:::info

provider별 자세한 정보는 [여기](../providers/)를 확인하세요.

:::

#### 2단계: config로 Proxy 시작

```shell
$ litellm --config /path/to/config.yaml
```

:::tip

자세한 debug log가 필요하면 `--detailed_debug`로 실행하세요.

```shell
$ litellm --config /path/to/config.yaml --detailed_debug
```

:::

#### 3단계: 테스트

`config.yaml`에서 `model_name=gpt-4o`로 지정된 모델에 요청을 보냅니다.

`model_name=gpt-4o` 항목이 여러 개 있으면 [Load Balancing](https://docs.litellm.ai/docs/proxy/load_balancing)이 수행됩니다.

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```

## LLM 설정 `model_list`

### 모델별 파라미터(API Base, Key, Temperature, Max Token, Organization, Header 등)
config를 사용해 `api_base`, `api_key`, `temperature`, `max_tokens` 같은 모델별 정보를 저장할 수 있습니다.

[**전체 input params**](https://docs.litellm.ai/docs/completion/input#input-params-1)

**1단계**: `config.yaml` 파일 생성
```yaml
model_list:
  - model_name: gpt-4-team1
    litellm_params: # params for litellm.completion() - https://docs.litellm.ai/docs/completion/input#input---request-body
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      azure_ad_token: eyJ0eXAiOiJ
      seed: 12
      max_tokens: 20
  - model_name: gpt-4-team2
    litellm_params:
      model: azure/gpt-4
      api_key: sk-123
      api_base: https://openai-gpt-4-test-v-2.openai.azure.com/
      temperature: 0.2
  - model_name: openai-gpt-4o
    litellm_params:
      model: openai/gpt-4o
      extra_headers: {"AI-Resource Group": "ishaan-resource"}
      api_key: sk-123
      organization: org-ikDc4ex8NB
      temperature: 0.2
  - model_name: mistral-7b
    litellm_params:
      model: ollama/mistral
      api_base: your_ollama_api_base
```

**2단계**: config로 서버 시작

```shell
$ litellm --config /path/to/config.yaml
```

**예상 로그:**

`config.yaml`이 올바르게 로드되었는지 확인하려면 console log에서 다음 줄을 찾으세요.
```
LiteLLM: Proxy initialized with Config, Set models:
```

### Embedding 모델 - Sagemaker, Bedrock, Azure, OpenAI, XInference 사용

지원되는 Embedding Provider와 모델은 [여기](https://docs.litellm.ai/docs/embedding/supported_embedding)를 확인하세요.


<Tabs>
<TabItem value="bedrock" label="Bedrock Completion/Chat">

```yaml
model_list:
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-west-2"
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-east-2"
  - model_name: bedrock-cohere
    litellm_params:
      model: "bedrock/cohere.command-text-v14"
      aws_region_name: "us-east-1"

```

</TabItem>

<TabItem value="sagemaker" label="Sagemaker, Bedrock Embeddings">

proxy server에서 GPT-J embedding(Sagemaker endpoint), Amazon Titan embedding(Bedrock), Azure OpenAI embedding 사이를 라우팅하는 방법입니다.

```yaml
model_list:
  - model_name: sagemaker-embeddings
    litellm_params: 
      model: "sagemaker/berri-benchmarking-gpt-j-6b-fp16"
  - model_name: amazon-embeddings
    litellm_params:
      model: "bedrock/amazon.titan-embed-text-v1"
  - model_name: azure-embeddings
    litellm_params: 
      model: "azure/azure-embedding-model"
      api_base: "os.environ/AZURE_API_BASE" # os.getenv("AZURE_API_BASE")
      api_key: "os.environ/AZURE_API_KEY" # os.getenv("AZURE_API_KEY")
      api_version: "2023-07-01-preview"

general_settings:
  master_key: sk-1234 # [OPTIONAL] if set all calls to proxy will require either this key or a valid generated token
```

</TabItem>

<TabItem value="Hugging Face emb" label="Hugging Face Embeddings">
LiteLLM Proxy는 모든 <a href="https://huggingface.co/models?pipeline_tag=feature-extraction">Feature-Extraction Embedding model</a>을 지원합니다.

```yaml
model_list:
  - model_name: deployed-codebert-base
    litellm_params: 
      # send request to deployed hugging face inference endpoint
      model: huggingface/microsoft/codebert-base # add huggingface prefix so it routes to hugging face
      api_key: hf_LdS                            # api key for hugging face inference endpoint
      api_base: https://uysneno1wv2wd4lw.us-east-1.aws.endpoints.huggingface.cloud # your hf inference endpoint 
  - model_name: codebert-base
    litellm_params: 
      # no api_base set, sends request to hugging face free inference api https://api-inference.huggingface.co/models/
      model: huggingface/microsoft/codebert-base # add huggingface prefix so it routes to hugging face
      api_key: hf_LdS                            # api key for hugging face                     

```

</TabItem>

<TabItem value="azure" label="Azure OpenAI Embeddings">

```yaml
model_list:
  - model_name: azure-embedding-model # model group
    litellm_params:
      model: azure/azure-embedding-model # model name for litellm.embedding(model=azure/azure-embedding-model) call
      api_base: your-azure-api-base
      api_key: your-api-key
      api_version: 2023-07-01-preview
```

</TabItem>

<TabItem value="openai" label="OpenAI Embeddings">

```yaml
model_list:
- model_name: text-embedding-ada-002 # model group
  litellm_params:
    model: text-embedding-ada-002 # model name for litellm.embedding(model=text-embedding-ada-002) 
    api_key: your-api-key-1
- model_name: text-embedding-ada-002 
  litellm_params:
    model: text-embedding-ada-002
    api_key: your-api-key-2
```

</TabItem>


<TabItem value="xinf" label="XInference">

https://docs.litellm.ai/docs/providers/xinference

**참고:** LiteLLM이 OpenAI로 라우팅해야 함을 알 수 있도록 `litellm_params`의 `model`에 `xinference/` prefix를 추가하세요.

```yaml
model_list:
- model_name: embedding-model  # model group
  litellm_params:
    model: xinference/bge-base-en   # model name for litellm.embedding(model=xinference/bge-base-en) 
    api_base: http://0.0.0.0:9997/v1
```

</TabItem>

<TabItem value="openai emb" label="OpenAI Compatible Embeddings">

<p><a href="https://github.com/xorbitsai/inference">OpenAI Compatible Server의 /embedding endpoint</a>를 호출할 때 사용합니다.</p>

**참고:** LiteLLM이 OpenAI로 라우팅해야 함을 알 수 있도록 `litellm_params`의 `model`에 `openai/` prefix를 추가하세요.

```yaml
model_list:
- model_name: text-embedding-ada-002  # model group
  litellm_params:
    model: openai/<your-model-name>   # model name for litellm.embedding(model=text-embedding-ada-002) 
    api_base: <model-api-base>
```

</TabItem>
</Tabs>

#### Proxy 시작

```shell
litellm --config config.yaml
```

#### 요청 보내기
`bedrock-cohere`로 요청을 보냅니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "bedrock-cohere",
  "messages": [
      {
      "role": "user",
      "content": "gm"
      }
  ]
}'
```


### 여러 OpenAI 조직

하나의 모델 정의만으로 여러 OpenAI 조직의 모든 OpenAI 모델을 추가합니다.

```yaml
  - model_name: *
    litellm_params:
      model: openai/*
      api_key: os.environ/OPENAI_API_KEY
      organization:
       - org-1 
       - org-2 
       - org-3
```

LiteLLM은 각 org별로 별도 deployment를 자동 생성합니다.

다음으로 확인할 수 있습니다.

```bash
curl --location 'http://0.0.0.0:4000/v1/model/info' \
--header 'Authorization: Bearer ${LITELLM_KEY}' \
--data ''
```

### Load Balancing

:::info
자세한 내용은 [이 페이지](https://docs.litellm.ai/docs/proxy/load_balancing)를 확인하세요.
:::

동일 모델의 여러 instance를 호출하고 [routing strategy](https://docs.litellm.ai/docs/routing#advanced) 같은 항목을 설정할 때 사용합니다.

최적 성능을 위해:
- 모델 deployment별로 `tpm/rpm`을 설정하세요. 그러면 설정된 tpm/rpm을 기준으로 weighted pick이 수행됩니다.
- `router_settings:routing_strategy`에서 적합한 routing strategy를 선택하세요.

LiteLLM은 다음을 지원합니다.
```python
["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"`
```

`tpm/rpm`이 설정되어 있고 `routing_strategy==simple-shuffle`이면 LiteLLM은 설정된 tpm/rpm을 기준으로 weighted pick을 사용합니다. **load test에서는 모든 deployment에 tpm/rpm을 설정하고 `routing_strategy==simple-shuffle`을 사용할 때 throughput이 최대화되었습니다.**
- 여러 LiteLLM Server 또는 Kubernetes를 사용할 때는 `router_settings:redis_host` 등 Redis 설정을 지정하세요.

```yaml
model_list:
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
        rpm: 60      # Optional[int]: When rpm/tpm set - litellm uses weighted pick for load balancing. rpm = Rate limit for this deployment: in requests per minute (rpm).
        tpm: 1000   # Optional[int]: tpm = Tokens Per Minute 
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
        rpm: 600      
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
        rpm: 60000      
  - model_name: gpt-4o
    litellm_params:
        model: gpt-4o
        api_key: <my-openai-key>
        rpm: 200      
  - model_name: gpt-3.5-turbo-16k
    litellm_params:
        model: gpt-3.5-turbo-16k
        api_key: <my-openai-key>
        rpm: 100      

litellm_settings:
  num_retries: 3 # retry call 3 times on each model_name (e.g. zephyr-beta)
  request_timeout: 10 # raise Timeout error if call takes longer than 10s. Sets litellm.request_timeout 
  fallbacks: [{"zephyr-beta": ["gpt-4o"]}] # fallback to gpt-4o if call fails num_retries 
  context_window_fallbacks: [{"zephyr-beta": ["gpt-3.5-turbo-16k"]}, {"gpt-4o": ["gpt-3.5-turbo-16k"]}] # fallback to gpt-3.5-turbo-16k if context window error
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute. 

router_settings: # router_settings are optional
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"
  model_group_alias: {"gpt-4": "gpt-4o"} # all requests with `gpt-4` will be routed to models with `gpt-4o`
  num_retries: 2
  timeout: 30                                  # 30 seconds
  redis_host: <your redis host>                # set this when using multiple litellm proxy deployments, load balancing state stored in redis
  redis_password: <your redis password>
  redis_port: 1992
```

비용은 [Virtual keys](https://docs.litellm.ai/docs/proxy/virtual_keys) 또는 [custom_callbacks](https://docs.litellm.ai/docs/proxy/logging)을 설정한 뒤 확인할 수 있습니다.


### 환경에서 API Key/config 값 로드

secret을 환경 변수에 저장해 두었고 `config.yaml`에 노출하고 싶지 않다면, 다음 방식으로 모델별 key를 환경에서 로드할 수 있습니다. **이 방식은 `config.yaml`의 모든 값에 사용할 수 있습니다.**

```yaml
os.environ/<YOUR-ENV-VAR> # runs os.getenv("YOUR-ENV-VAR")
```

```yaml 
model_list:
  - model_name: gpt-4-team1
    litellm_params: # params for litellm.completion() - https://docs.litellm.ai/docs/completion/input#input---request-body
      model: azure/chatgpt-v-2
      api_base: https://openai-gpt-4-test-v-1.openai.azure.com/
      api_version: "2023-05-15"
      api_key: os.environ/AZURE_NORTH_AMERICA_API_KEY # 👈 KEY CHANGE
```

[**코드 보기**](https://github.com/BerriAI/litellm/blob/c12d6c3fe80e1b5e704d9846b246c059defadce7/litellm/utils.py#L2366)

이 기능에 도움을 준 [@David Manouchehri](https://www.linkedin.com/in/davidmanouchehri/)에게 감사드립니다.

### 중앙화된 Credential 관리

credential을 한 번 정의하고 여러 모델에서 재사용합니다. 다음에 도움이 됩니다.
- Secret rotation
- config 중복 감소

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      litellm_credential_name: default_azure_credential  # Reference credential below

credential_list:
  - credential_name: default_azure_credential
    credential_values:
      api_key: os.environ/AZURE_API_KEY  # Load from environment
      api_base: os.environ/AZURE_API_BASE
      api_version: "2023-05-15"
    credential_info:
      description: "Production credentials for EU region"
      custom_llm_provider: "azure"
```

#### 주요 파라미터
- `credential_name`: credential set의 고유 식별자
- `credential_values`: credential/secret의 key-value 쌍(`os.environ/` 문법 지원)
- `credential_info`: 사용자가 제공한 credential 정보의 key-value 쌍입니다. 필수 key-value는 없지만 dictionary는 존재해야 합니다.

### Secret Manager에서 API Key 로드(Azure Vault 등)

[**LiteLLM Proxy에서 Secret Manager 사용**](../secret)


### 모델별 지원 환경 설정 - `production`, `staging`, `development`

특정 LiteLLM 환경에서 어떤 모델을 노출할지 제어하려면 이 설정을 사용하세요.

지원 환경:
- `production`
- `staging`
- `development`

1. 환경에 `LITELLM_ENVIRONMENT="<environment>"`를 설정합니다. 값은 `production`, `staging`, `development` 중 하나입니다.


2. 각 모델에 대해 `model_info.supported_environments`에 지원 환경 목록을 설정합니다.
```yaml
model_list:
 - model_name: gpt-3.5-turbo-16k
   litellm_params:
     model: openai/gpt-3.5-turbo-16k
     api_key: os.environ/OPENAI_API_KEY
   model_info:
     supported_environments: ["development", "production", "staging"]
 - model_name: gpt-4
   litellm_params:
     model: openai/gpt-4
     api_key: os.environ/OPENAI_API_KEY
   model_info:
     supported_environments: ["production", "staging"]
 - model_name: gpt-4o
   litellm_params:
     model: openai/gpt-4o
     api_key: os.environ/OPENAI_API_KEY
   model_info:
     supported_environments: ["production"]
```


### Custom Prompt Template 설정하기

LiteLLM은 기본적으로 모델에 [prompt template이 있는지 확인하고 적용](../completion/prompt_formatting.md)합니다. 예를 들어 Hugging Face 모델의 `tokenizer_config.json`에 저장된 chat template이 있으면 이를 사용합니다. 필요하면 `config.yaml`에서 proxy에 사용자 지정 prompt template을 설정할 수도 있습니다.

**1단계**: `config.yaml`에 prompt template 저장
```yaml
# Model-specific parameters
model_list:
  - model_name: mistral-7b # model alias
    litellm_params: # actual params for litellm.completion()
      model: "huggingface/mistralai/Mistral-7B-Instruct-v0.1" 
      api_base: "<your-api-base>"
      api_key: "<your-api-key>" # [OPTIONAL] for hf inference endpoints
      initial_prompt_value: "\n"
      roles: {"system":{"pre_message":"<|im_start|>system\n", "post_message":"<|im_end|>"}, "assistant":{"pre_message":"<|im_start|>assistant\n","post_message":"<|im_end|>"}, "user":{"pre_message":"<|im_start|>user\n","post_message":"<|im_end|>"}}
      final_prompt_value: "\n"
      bos_token: " "
      eos_token: " "
      max_tokens: 4096
```

**2단계**: config로 서버 시작

```shell
$ litellm --config /path/to/config.yaml
``` 

### Custom tokenizer 설정 {#set-custom-tokenizer}

[`/utils/token_counter` endpoint](https://litellm-api.up.railway.app/#/llm%20utils/token_counter_utils_token_counter_post)를 사용하면서 모델에 custom Hugging Face tokenizer를 설정하려면 `config.yaml`에서 지정할 수 있습니다.

```yaml
model_list:
  - model_name: openai-deepseek
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      access_groups: ["restricted-models"]
      custom_tokenizer: 
        identifier: deepseek-ai/DeepSeek-V3-Base
        revision: main
        auth_token: os.environ/HUGGINGFACE_API_KEY
```

**Spec**
```
custom_tokenizer: 
  identifier: str # huggingface model identifier
  revision: str # huggingface model revision (usually 'main')
  auth_token: Optional[str] # huggingface auth token 
```

## 일반 설정 `general_settings`(DB 연결 등)

### DB Pool 제한과 연결 Timeout 설정

```yaml
general_settings: 
  database_connection_pool_limit: 10 # sets connection pool per worker for prisma client to postgres db (default: 10, recommended: 10-20)
  database_connection_timeout: 60 # sets a 60s timeout for any connection call to the db 
```

**적절한 값 계산 방법:**

connection limit은 instance 단위가 아니라 **worker process별로** 적용됩니다. worker가 여러 개이면 각 worker가 자체 connection pool을 만듭니다.

**공식:**
```
database_connection_pool_limit = MAX_DB_CONNECTIONS ÷ (number_of_instances × number_of_workers_per_instance)
```

**예제:**
- database가 최대 **100 connection**을 허용합니다.
- LiteLLM **1개 instance**를 실행합니다.
- 각 instance에는 **8개 worker**가 있습니다(`--num_workers 8`로 설정).

계산: `100 ÷ (1 × 8) = 12.5`

12.5를 그대로 사용할 수 없으므로 안전 buffer를 남기기 위해 **10**으로 내립니다. 이 경우:
- 8개 worker 각각의 connection pool limit은 10입니다.
- 총 최대 connection 수: 8 workers × 10 connections = 80 connections
- database의 100 connection 제한 안에 안전하게 머무릅니다.

## LiteLLM License Key(엔터프라이즈)

[LiteLLM 엔터프라이즈 기능](https://docs.litellm.ai/docs/enterprise)을 활성화하려면 license key를 환경 변수로 설정하세요.

```bash
export LITELLM_LICENSE="eyJ..."
```

license key는 LiteLLM 엔터프라이즈 license 구매 시 제공되는 JWT token입니다. 설정하면 LiteLLM이 자동으로 감지해 enterprise 기능을 활성화합니다.

`.env` 파일에 추가할 수도 있습니다.

```env
LITELLM_LICENSE="eyJ..."
```

## 기타


### Swagger UI 비활성화

base URL에서 Swagger 문서를 비활성화하려면 다음을 설정하세요.

```env
NO_DOCS="True"
```

환경 변수에 설정한 뒤 proxy를 재시작합니다.

### Disable Redoc

Redoc 문서(기본값: `<your-proxy-url>/redoc`)를 비활성화하려면 다음을 설정하세요.

```env
NO_REDOC="True"
```

환경 변수에 설정한 뒤 proxy를 재시작합니다.

### Proxy에 CONFIG_FILE_PATH 사용(Azure container 배포 간소화)

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

2. file path를 환경 변수로 저장

```bash
CONFIG_FILE_PATH="/path/to/config.yaml"
```

3. Proxy 시작

```bash
$ litellm 

# RUNNING on http://0.0.0.0:4000
```


### LiteLLM config.yaml 파일을 s3 또는 GCS Bucket object/URL로 제공하기

배포 서비스에서 config 파일을 mount할 수 없을 때 사용합니다. 예: AWS Fargate, Railway 등.

LiteLLM Proxy는 s3 Bucket 또는 GCS Bucket에서 `config.yaml`을 읽습니다.

<Tabs>
<TabItem value="gcs" label="GCS Bucket">

다음 `.env` 변수를 설정합니다.
```shell
LITELLM_CONFIG_BUCKET_TYPE = "gcs"                              # set this to "gcs"         
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on GCS
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "proxy_config.yaml"         # object key on GCS
```

이 환경 변수로 litellm proxy를 시작하면 litellm이 GCS에서 config를 읽습니다.

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -e LITELLM_CONFIG_BUCKET_TYPE="gcs" \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm-database:main-latest --detailed_debug
```

</TabItem>

<TabItem value="s3" label="s3">

다음 `.env` 변수를 설정합니다.
```shell
LITELLM_CONFIG_BUCKET_NAME = "litellm-proxy"                    # your bucket name on s3 
LITELLM_CONFIG_BUCKET_OBJECT_KEY = "litellm_proxy_config.yaml"  # object key on s3
```

이 환경 변수로 litellm proxy를 시작하면 litellm이 s3에서 config를 읽습니다.

```shell
docker run --name litellm-proxy \
   -e DATABASE_URL=<database_url> \
   -e LITELLM_CONFIG_BUCKET_NAME=<bucket_name> \
   -e LITELLM_CONFIG_BUCKET_OBJECT_KEY="<object_key>> \
   -p 4000:4000 \
   docker.litellm.ai/berriai/litellm-database:main-latest
```
</TabItem>
</Tabs>
