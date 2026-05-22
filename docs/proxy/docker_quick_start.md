import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# 시작하기 튜토리얼

LiteLLM Proxy로 다음 작업을 수행하는 end-to-end 튜토리얼입니다.
- Azure OpenAI model 추가
- 성공적인 /chat/completion call 실행
- virtual key 생성
- virtual key에 RPM limit 설정

## 빠른 설치(local / beginner 권장)

LiteLLM이 처음인가요? local에서 시작하는 가장 쉬운 방법입니다. 한 command로 LiteLLM을 설치하고 interactive setup을 진행합니다. config file을 직접 작성할 필요가 없습니다.

### 1. Install

```bash
curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install.sh | sh
```

이 command는 OS를 감지하고 `litellm[proxy]`를 설치한 뒤 setup wizard로 바로 진입합니다.

### 2. Wizard 따라가기

```
$ litellm --setup

  Welcome to LiteLLM

  Choose your LLM providers
  ○ 1. OpenAI        GPT-4o, GPT-4o-mini, o1
  ○ 2. Anthropic     Claude Opus, Sonnet, Haiku
  ○ 3. Azure OpenAI  GPT-4o via Azure
  ○ 4. Google Gemini Gemini 2.0 Flash, 1.5 Pro
  ○ 5. AWS Bedrock   Claude, Llama via AWS
  ○ 6. Ollama        Local models

  ❯ Provider(s): 1,2

  ❯ OpenAI API key: sk-...
  ❯ Anthropic API key: sk-ant-...

  ❯ Port [4000]:
  ❯ Master key [auto-generate]:

  ✔ Config saved → ./litellm_config.yaml

  ❯ Start the proxy now? (Y/n):
```

wizard는 다음 단계를 안내합니다.
1. LLM provider 선택(OpenAI, Anthropic, Azure, Bedrock, Gemini, Ollama)
2. provider별 API key 입력
3. port와 master key 설정 또는 기본값 사용
4. config가 `./litellm_config.yaml`에 저장되고 proxy가 즉시 시작됨

### 3. Call 실행

proxy는 `http://0.0.0.0:4000`에서 실행 중입니다. 다음으로 테스트합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <your-master-key>' \
-d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
}'
```

:::tip 이미 uv가 설치되어 있나요?
curl install을 건너뛰고 `uv tool install 'litellm[proxy]'` 후 `litellm --setup`을 바로 실행할 수 있습니다.
:::

---

## 사전 요구 사항

install method를 선택하세요. **Docker Compose** user는 tab 안에서 전체 setup을 완료하면 끝입니다. **Docker** 및 **LiteLLM CLI** user는 tab 아래 단계로 계속 진행합니다.

<Tabs>

<TabItem value="docker" label="Docker">

```bash
docker pull docker.litellm.ai/berriai/litellm:main-latest
```

[**모든 docker image 보기**](https://github.com/orgs/BerriAI/packages)

</TabItem>

<TabItem value="cli" label="LiteLLM CLI">

```shell
$ uv tool install 'litellm[proxy]'
```

</TabItem>

<TabItem value="docker-compose" label="Docker Compose (Proxy + DB)">

Docker Compose는 LiteLLM과 Postgres database를 함께 제공합니다. 아래 단계를 따르면 마지막에는 proxy가 완전히 실행됩니다.

### Step 1 — LiteLLM database image 가져오기 {#step-1--litellm-database-image-pull}

LiteLLM은 Postgres에 연결하는 proxy deployment용 전용 `litellm-database` image를 제공합니다.

```bash
docker pull ghcr.io/berriai/litellm-database:main-latest
```

사용 가능한 모든 tag는 [GitHub Container Registry](https://github.com/BerriAI/litellm/pkgs/container/litellm-database)에서 확인하세요.

---

### Step 2 — Database 설정

`docker compose up`을 실행하기 **전에** 세 config file을 모두 완료하세요. 하나라도 빠지면 proxy server가 올바르게 시작되지 않습니다.

#### 2.1 — Get `docker-compose.yml` and create `.env`

```bash
# Get the docker compose file
curl -O https://raw.githubusercontent.com/BerriAI/litellm/main/docker-compose.yml

# Add the master key - you can change this after setup
echo 'LITELLM_MASTER_KEY="sk-1234"' > .env

# Add the litellm salt key — cannot be changed after adding a model
# Used to encrypt/decrypt your LLM API key credentials
# Generate a strong random value: https://1password.com/password-generator/
echo 'LITELLM_SALT_KEY="sk-1234"' >> .env

# Add your model credentials
echo 'AZURE_API_BASE="https://openai-***********/"' >> .env
echo 'AZURE_API_KEY="your-azure-api-key"' >> .env
```

#### 2.2 — `config.yaml` 생성

기본 `docker-compose.yml`은 `db:5432`에서 Postgres container를 시작합니다. `config.yaml`에는 이를 가리키는 `database_url`이 포함되어야 합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/my_azure_deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2025-01-01-preview"

general_settings:
  master_key: sk-1234 # 🔑 your proxy admin key (must start with sk-)
  database_url: "postgresql://llmproxy:dbpassword9090@db:5432/litellm"
```

:::tip
`database_url`은 virtual key, spend tracking, UI를 활성화합니다. managed database를 선호한다면 [Supabase](https://supabase.com/) 또는 [Neon](https://neon.tech/) connection string으로 바꾸세요.
:::

#### 2.3 — `prometheus.yml` 생성 {#23--create-prometheusyml}

이 file은 `docker compose up` 전에 **반드시 file로 존재해야 합니다**. 없으면 Docker가 빈 directory로 자동 생성하고 Prometheus container가 시작에 실패합니다.

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "litellm"
    static_configs:
      - targets: ["litellm:4000"]
```

또한 `docker-compose.yml`에서 `config.yaml` volume mount와 `--config` flag가 **comment out되어 있지 않은지** 확인하세요.

```yaml
services:
  litellm:
    volumes:
      - ./config.yaml:/app/config.yaml # ✅ must be uncommented
    command:
      - "--config=/app/config.yaml" # ✅ must be uncommented
```

:::warning
`docker compose up`을 실행하기 전에 세 파일(`.env`, `config.yaml`, `prometheus.yml`)이 모두 있어야 합니다. 문제가 발생하면 [문제 해결](#troubleshooting)을 참고하세요.
:::

---

### Step 3 — Proxy server 시작 및 테스트

`config.yaml`, `prometheus.yml`, `.env`가 준비되면 proxy를 시작합니다.

```bash
docker compose up
```

실행된 뒤 curl request로 테스트합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**예상 response:**

```json
{
  "id": "chatcmpl-abcd",
  "created": 1773817678,
  "model": "gpt-4o",
  "object": "chat.completion",
  "system_fingerprint": "fp_6b1ef07cda",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Hello! How can I assist you today?",
        "role": "assistant",
        "annotations": []
      }
    }
  ],
  "usage": {
    "completion_tokens": 9,
    "prompt_tokens": 9,
    "total_tokens": 18,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    }
  },
  "service_tier": "default"
}
```

---

### 선택 사항 — LiteLLM UI로 이동해 virtual key 생성

browser에서 [http://localhost:4000/ui](http://localhost:4000/ui)를 열고 master key(`sk-1234`)로 로그인합니다.

**가상 키**로 이동해 **+ Create New Key**를 클릭합니다.

<Image img={require('../../img/litellm_ui_create_key.png')} alt="LiteLLM UI — Create Virtual Key" />

Virtual key를 사용하면 user 또는 team별 spend 추적, rate limit 설정, model access 제어를 할 수 있습니다.

</TabItem>

</Tabs>

:::note Docker Compose 사용자
setup이 완료되었습니다. 아래 단계는 **Docker** 및 **LiteLLM CLI** user 전용입니다.
:::

---

## Step 1 — Model 추가

`config.yaml` file로 LiteLLM Proxy를 제어합니다. Azure model을 포함해 다음 file을 생성합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/my_azure_deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2025-01-01-preview" # [OPTIONAL] litellm uses the latest azure api_version by default
```
---

### Model List 사양 {#model-list-specification}

model resolution 동작 방식은 [Model 설정](#understanding-model-configuration) section에서 더 자세히 확인할 수 있습니다.

- **`model_name`** (`str`) - 이 field에는 수신되는 model 이름을 넣습니다.
- **`litellm_params`** (`dict`) [See All LiteLLM Params](https://github.com/BerriAI/litellm/blob/559a6ad826b5daef41565f54f06c739c8c068b28/litellm/types/router.py#L222)
    - **`model`** (`str`) - `litellm.acompletion` / `litellm.aembedding` 등에 전달할 model 이름을 지정합니다. LiteLLM이 backend에서 올바른 model + provider logic으로 route하는 데 사용하는 identifier입니다.
    - **`api_key`** (`str`) - 인증에 필요한 API key입니다. `os.environ/`을 사용해 environment variable에서 가져올 수 있습니다.
    - **`api_base`** (`str`) - Azure deployment의 API base입니다.
    - **`api_version`** (`str`) - Azure OpenAI API 호출 시 사용할 API Version입니다. 최신 Inference API version은 [여기](https://learn.microsoft.com/en-us/azure/ai-services/openai/api-version-deprecation?source=recommendations#latest-preview-api-releases)에서 확인하세요.


---

### 유용한 링크
- [**지원되는 모든 LLM API Provider(OpenAI/Bedrock/Vertex 등)**](../providers/)
- [**전체 Config.Yaml 사양**](./configs.md)
- [**provider별 parameter 전달**](../completion/provider_specific_params.md#proxy-usage)


## 2. 성공적인 /chat/completion call 실행

LiteLLM Proxy는 100% OpenAI-compatible입니다. `/chat/completions` route로 Azure model을 테스트합니다.

### 2.1 Proxy 시작

1단계의 config.yaml을 `litellm_config.yaml`로 저장합니다.

<Tabs>


<TabItem value="docker" label="Docker">

```bash
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e AZURE_API_KEY=d6*********** \
    -e AZURE_API_BASE=https://openai-***********/ \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm:main-latest \
    --config /app/config.yaml --detailed_debug

# RUNNING on http://0.0.0.0:4000
```

</TabItem>

<TabItem value="cli" label="LiteLLM CLI">

```shell
$ litellm --config /app/config.yaml --detailed_debug
```

</TabItem>


</Tabs>

config가 올바르게 load되었는지 확인합니다. log에서 다음을 볼 수 있어야 합니다.

```
Loaded config YAML (api_key and environment_variables are not shown):
{
  "model_list": [
    {
      "model_name": ...
```

### 2.2 Call 실행

LiteLLM Proxy는 100% OpenAI-compatible입니다. `/chat/completions`로 model을 테스트합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are an LLM named gpt-4o"
      },
      {
        "role": "user",
        "content": "what is your name?"
      }
    ]
}'
```

**예상 response**

```bash
{
  "id": "chatcmpl-BcO8tRQmQV6Dfw6onqMufxPkLLkA8",
  "created": 1748488967,
  "model": "gpt-4o-2024-11-20",
  "object": "chat.completion",
  "system_fingerprint": "fp_ee1d74bde0",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "My name is **gpt-4o**! How can I assist you today?",
        "role": "assistant",
        "tool_calls": null,
        "function_call": null,
        "annotations": []
      }
    }
  ],
  "usage": {
    "completion_tokens": 19,
    "prompt_tokens": 28,
    "total_tokens": 47,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    }
  },
  "service_tier": null,
  "prompt_filter_results": [
    {
      "prompt_index": 0,
      "content_filter_results": {
        "hate": {
          "filtered": false,
          "severity": "safe"
        },
        "self_harm": {
          "filtered": false,
          "severity": "safe"
        },
        "sexual": {
          "filtered": false,
          "severity": "safe"
        },
        "violence": {
          "filtered": false,
          "severity": "safe"
        }
      }
    }
  ]
}
```



### 유용한 링크
- [지원되는 모든 LLM API Provider(OpenAI/Bedrock/Vertex 등)](../providers/)
- [OpenAI SDK, Langchain 등으로 LiteLLM Proxy 호출](./user_keys.md#request-format)
- [All API Endpoints Swagger](https://litellm-api.up.railway.app/#/chat%2Fcompletions)
- [기타/Non-Chat Completion Endpoint](../embedding/supported_embedding.md)
- [VertexAI, Bedrock 등 pass-through](../pass_through/vertex_ai.md)

## 선택 사항: virtual key 생성

proxy에서 virtual key로 spend를 추적하고 model access를 제어합니다.

### 사전 요구 사항 — Database 설정

:::note Docker Compose 사용자
Postgres container가 이미 실행 중입니다. 아래 [RPM Limit이 있는 Key 생성](#create-key-w-rpm-limit)으로 건너뛰세요.
:::

**Docker / LiteLLM CLI user**는 Postgres database가 필요합니다(예: [Supabase](https://supabase.com/), [Neon](https://neon.tech/), 또는 self-hosted). `config.yaml`에 `general_settings`를 추가합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/my_azure_deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2025-01-01-preview" # [OPTIONAL] litellm uses the latest azure api_version by default

general_settings: 
  master_key: sk-1234 
  database_url: "postgresql://<user>:<password>@<host>:<port>/<dbname>" # 👈 KEY CHANGE
```

계속하기 전에 config.yaml을 `litellm_config.yaml`로 저장합니다.

proxy server를 시작하기 전에 이 setup을 완료해야 합니다.

---

**`general_settings`란?**

LiteLLM Proxy Server용 설정입니다.

모든 General Settings는 [여기](http://localhost:3000/docs/proxy/configs#all-settings)에서 확인하세요.

1. **`master_key`** (`str`)
   - **설명**:
     - `master key`를 설정합니다. 이는 Proxy Admin key이며 다른 key를 생성할 때 사용할 수 있습니다(🚨 반드시 `sk-`로 시작해야 함).
   - **사용법**: 
     - **config.yaml에서 설정** `general_settings:master_key` 아래에 master key를 설정합니다. 예:
        `master_key: sk-1234`
     - **env variable 설정** `LITELLM_MASTER_KEY`를 설정합니다.

2. **`database_url`** (str)
   - **설명**:
     - `database_url`을 설정합니다. 이는 key, user, team 생성을 위해 LiteLLM이 사용하는 Postgres DB 연결입니다.
   - **사용법**: 
     - **config.yaml에서 설정** `general_settings:database_url` 아래에 `database_url`을 설정합니다. 예:
        `database_url: "postgresql://..."`
     - env에 `DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>`를 설정합니다.

### Proxy 시작

```bash
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -e AZURE_API_KEY=d6*********** \
    -e AZURE_API_BASE=https://openai-***********/ \
    -p 4000:4000 \
    ghcr.io/berriai/litellm-database:main-latest \
    --config /app/config.yaml --detailed_debug
```

### RPM Limit이 있는 Key 생성 {#create-key-w-rpm-limit}

`rpm_limit: 1`로 key를 생성합니다. 이 key로 proxy를 호출할 때 분당 1개 request만 허용됩니다.

```bash 
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "rpm_limit": 1
}'
```

[**전체 API Spec 보기**](https://litellm-api.up.railway.app/#/key%20management/generate_key_fn_key_generate_post)

**예상 response**

```bash
{
    "key": "sk-12..."
}
```

### 테스트

**방금 생성한 virtual key를 사용하세요.**

첫 번째 call - 성공해야 합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-12...' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

**예상 response**

```bash
{
    "id": "chatcmpl-2076f062-3095-4052-a520-7c321c115c68",
    "choices": [
        ...
}
```

두 번째 call - 실패해야 합니다.

**이 call이 실패한 이유는 무엇인가요?**

virtual key의 requests per minute(RPM) limit을 1로 설정했기 때문입니다. 이제 이 limit을 초과했습니다.


```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-12...' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

**예상 response**

```bash
{
  "error": {
    "message": "LiteLLM Rate Limit Handler for rate limit type = key. Crossed TPM / RPM / Max Parallel Request Limit. current rpm: 1, rpm limit: 1, current tpm: 348, tpm limit: 9223372036854775807, current max_parallel_requests: 0, max_parallel_requests: 9223372036854775807",
    "type": "None",
    "param": "None",
    "code": "429"
  }
}
```

### 유용한 링크

- [Creating 가상 키](./virtual_keys.md)
- [Key Management API Endpoints Swagger](https://litellm-api.up.railway.app/#/key%20management)
- [key/user/team별 Budget / Rate Limit 설정](./users.md)
- [key의 Dynamic TPM/RPM Limit](./team_budgets.md#dynamic-tpmrpm-allocation)

## 핵심 개념

이 section은 LiteLLM AI Gateway의 핵심 개념을 설명합니다.

### Model 설정 이해 {#understanding-model-configuration}

다음 config.yaml 예제를 기준으로 설명합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/my_azure_deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2025-01-01-preview" # [OPTIONAL] litellm uses the latest azure api_version by default
```

**Model Resolution 동작 방식:**

```
Client Request                LiteLLM Proxy                 Provider API
──────────────              ────────────────              ─────────────
    
POST /chat/completions      
{                           1. Looks up model_name
  "model": "gpt-4o" ──────────▶ in config.yaml
  ...                          
}                           2. Finds matching entry:
                               model_name: gpt-4o
                               
                            3. Extracts litellm_params:
                               model: azure/my_azure_deployment
                               api_base: https://...
                               api_key: sk-...
                               
                            4. Routes to provider ──▶ Azure OpenAI API
                                                      POST /deployments/my_azure_deployment/...
```

**`litellm_params` 아래 `model` parameter 분해:**

```yaml
model_list:
  - model_name: gpt-4o                       # What the client calls
    litellm_params:
      model: azure/my_azure_deployment       # <provider>/<model-name>
             ─────  ───────────────────
               │           │
               │           └─────▶ Model name sent to the provider API
               │
               └─────────────────▶ Provider that LiteLLM routes to
```

**시각적 분해:**

```
model: azure/my_azure_deployment
       └─┬─┘ └─────────┬─────────┘
         │             │
         │             └────▶ The actual model identifier that gets sent to Azure
         │                   (e.g., your deployment name, or the model name)
         │
         └──────────────────▶ Tells LiteLLM which provider to use
                             (azure, openai, anthropic, bedrock, etc.)
```

**핵심 개념:**

- **`model_name`**: client가 model을 호출할 때 사용하는 alias입니다. API request에 보내는 값입니다(예: `gpt-4o`).

- **`model` (in litellm_params)**: Format is `<provider>/<model-identifier>`
  - **Provider** (`/` 앞): 올바른 LLM provider로 route합니다(예: `azure`, `openai`, `anthropic`, `bedrock`).
  - **Model identifier** (`/` 뒤): 해당 provider API로 전송되는 실제 model/deployment name입니다.

**Advanced 설정 예제:**

custom OpenAI-compatible endpoint(예: vLLM, Ollama, custom deployment)의 경우:

```yaml
model_list:
  - model_name: my-custom-model
    litellm_params:
      model: openai/nvidia/llama-3.2-nv-embedqa-1b-v2
      api_base: http://my-service.svc.cluster.local:8000/v1
      api_key: "sk-1234"
```

**복잡한 model path 분해:**

```
model: openai/nvidia/llama-3.2-nv-embedqa-1b-v2
       └─┬──┘ └────────────┬────────────────┘
         │                 │
         │                 └────▶ Full model string sent to the provider API
         │                       (in this case: "nvidia/llama-3.2-nv-embedqa-1b-v2")
         │
         └──────────────────────▶ Provider (openai = OpenAI-compatible API)
```

핵심은 첫 번째 `/` 뒤의 모든 값이 provider API로 그대로 전달된다는 점입니다.

**일반적인 pattern:**

```yaml
model_list:
  # Azure deployment
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-deployment
      api_base: https://my-azure.openai.azure.com
      
  # OpenAI
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
      
  # Custom OpenAI-compatible endpoint
  - model_name: my-llama-model
    litellm_params:
      model: openai/meta/llama-3-8b
      api_base: http://my-vllm-server:8000/v1
      api_key: "optional-key"
      
  # Bedrock
  - model_name: claude-3
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_region_name: us-east-1
```


## 문제 해결 

### `prometheus.yml` mount error — "not a directory"

다음이 보이면:

```bash
Error: cannot create subdirectories in ".../prometheus.yml": not a directory
```

Docker가 `prometheus.yml`을 file이 아니라 **빈 directory**로 생성한 상태입니다. `docker compose up` 시점에 file이 없으면 이런 일이 발생합니다.

수정 방법:
그런 다음 file을 생성하고([Step 2.3 — `prometheus.yml` 생성](#23--create-prometheusyml) 참고) `docker compose up`을 다시 실행합니다.
```bash
rm -rf prometheus.yml
```

그런 다음 file을 생성하고([Step 2.3](#23--create-prometheusyml) 참고) `docker compose up`을 다시 실행합니다.

### Non-root docker image가 필요한가요? {#non-root-docker-image}

docker image를 non-root user로 실행해야 한다면 [이 image](https://github.com/BerriAI/litellm/pkgs/container/litellm-non_root)를 사용하세요.

### SSL 검증 문제 / 연결 오류 {#ssl-verification-issue--connection-error}

다음이 보이면:

```bash
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self-signed certificate in certificate chain (_ssl.c:1006)
```

OR

```bash
Connection Error.
```

다음 설정으로 ssl verification을 비활성화할 수 있습니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/my_azure_deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: "os.environ/AZURE_API_KEY"
      api_version: "2025-01-01-preview"

litellm_settings:
    ssl_verify: false # 👈 KEY CHANGE
```


### (DB) 모든 연결 시도 실패 {#db-all-connection-attempts-failed}


다음이 보이면:

```
httpx.ConnectError: All connection attempts failed                                                                        
                                                                                                                         
ERROR:    Application startup failed. Exiting.                                                                            
3:21:43 - LiteLLM Proxy:ERROR: utils.py:2207 - Error getting LiteLLM_SpendLogs row count: All connection attempts failed 
```

DB permission 문제일 수 있습니다.

1. db user permission 문제 확인

새 database 생성을 시도합니다.

```bash
STATEMENT: CREATE DATABASE "litellm"
```

다음 오류가 나오면:

```
ERROR: permission denied to create 
```

permission 문제가 있음을 의미합니다.

2. DB user에 permission 부여

다음과 유사해야 합니다.

```
psql -U postgres
```

```
CREATE DATABASE litellm;
```

CloudSQL에서는 다음과 같습니다.

```
GRANT ALL PRIVILEGES ON DATABASE litellm TO your_username;
```


**`litellm_settings`란?**

LiteLLM Proxy는 LLM API call 처리를 위해 [LiteLLM Python SDK](https://docs.litellm.ai/docs/routing)를 사용합니다.

`litellm_settings`는 LiteLLM Python SDK의 module-level param입니다(SDK에서 `litellm.<some_param>`을 설정하는 것과 동일). 모든 param은 [여기](https://github.com/BerriAI/litellm/blob/208fe6cb90937f73e0def5c97ccb2359bf8a467b/litellm/__init__.py#L114)에서 확인할 수 있습니다.

## 지원 및 founder와 대화

- [Demo 일정 잡기 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)

- [커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)
- [커뮤니티 Slack 💭](https://www.litellm.ai/support)

- 이메일 ✉️ ishaan@berri.ai / krrish@berri.ai

[![Chat on WhatsApp](https://img.shields.io/static/v1?label=Chat%20on&message=WhatsApp&color=success&logo=WhatsApp&style=flat-square)](https://wa.link/huol9n) [![Chat on Discord](https://img.shields.io/static/v1?label=Chat%20on&message=Discord&color=blue&logo=Discord&style=flat-square)](https://discord.gg/wuPM9dRgDw) 
