# 상태 확인 {#health-checks}
`config.yaml`에 정의된 모든 LLM의 상태를 확인할 때 사용합니다.

## Endpoint별 사용 시점

| Endpoint | 사용 사례 | 목적 |
|----------|----------|---------|
| `/health/liveliness` | **컨테이너 liveness probe** | 기본 alive check - container restart 판단에 사용 |
| `/health/readiness` | **Load balancer health check** | 트래픽 수락 준비 여부 - DB 연결 상태 포함 |
| `/health` | **모델 health 모니터링** | 포괄적인 LLM 모델 health - 실제 API 호출 수행 |
| `/health/services` | **서비스 디버깅** | 특정 통합(`datadog`, `langfuse` 등) 확인 |
| `/health/shared-status` | **Multi-pod 조율** | pod 간 shared health check state 모니터링 |

## 요약

프록시는 다음 endpoint를 제공합니다.
* LLM API의 health를 반환하는 `/health` endpoint
* 프록시가 요청을 받을 준비가 되었는지 반환하는 `/health/readiness` endpoint
* 프록시가 살아 있는지 반환하는 `/health/liveliness` endpoint
* pod 간 shared health check coordination을 모니터링하는 `/health/shared-status` endpoint

## 공유 Health Check 상태 {#shared-health-check-state}

여러 LiteLLM proxy pod를 실행할 때 shared health check state를 활성화하면 pod 간 health check를 조율하고 중복 API 호출을 피할 수 있습니다. Gemini 2.5-pro처럼 비용이 높은 모델에서 특히 유용합니다.

**주요 이점:**
- pod 간 중복 health check 감소
- 비용이 높은 모델 API 호출 비용 절감
- monitoring noise와 logging 감소
- resource efficiency 향상

**요구 사항:**
- shared state coordination용 Redis
- background health checks 활성화
- 여러 proxy pods

자세한 설정과 사용법은 [Shared Health Check State](./shared_health_check.md)를 참고하세요.

## `/health`
#### 요청 {#request}
프록시의 `/health`로 GET request를 보냅니다.

:::info
**이 endpoint는 각 모델이 정상인지 확인하기 위해 LLM API 호출을 수행합니다.**
:::

```shell
curl --location 'http://0.0.0.0:4000/health' -H "Authorization: Bearer sk-1234"
```

`litellm -health`를 실행할 수도 있습니다. 이 명령은 대신 `http://0.0.0.0:4000/health`로 `get` request를 보냅니다.
```
litellm --health
```
#### 응답 {#response}
```shell
{
    "healthy_endpoints": [
        {
            "model": "azure/gpt-35-turbo",
            "api_base": "https://my-endpoint-canada-berri992.openai.azure.com/"
        },
        {
            "model": "azure/gpt-35-turbo",
            "api_base": "https://my-endpoint-europe-berri-992.openai.azure.com/"
        }
    ],
    "unhealthy_endpoints": [
        {
            "model": "azure/gpt-35-turbo",
            "api_base": "https://openai-france-1234.openai.azure.com/"
        }
    ]
}
```

### Embedding 모델 {#embedding-models}

embedding health check를 실행하려면 해당 모델 config에서 mode를 "embedding"으로 지정합니다.

```yaml
model_list:
  - model_name: azure-embedding-model
    litellm_params:
      model: azure/azure-embedding-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      mode: embedding # 👈 ADD THIS
```

### Image Generation 모델 {#image-generation-models}

image generation health check를 실행하려면 해당 모델 config에서 mode를 "image_generation"으로 지정합니다.

```yaml
model_list:
  - model_name: dall-e-3
    litellm_params:
      model: azure/dall-e-3
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      mode: image_generation # 👈 ADD THIS
```

#### Custom Health Check Prompt 설정 {#custom-health-check-prompt}

기본적으로 health check는 `"test from litellm"` prompt를 사용합니다. 환경 변수를 설정해 전역으로 바꾸거나 config를 통해 모델별로 커스터마이즈할 수 있습니다.

```bash
DEFAULT_HEALTH_CHECK_PROMPT="this is a test prompt"
```

### Text Completion 모델 {#text-completion-models}


`/completions` health check를 실행하려면 해당 모델 config에서 mode를 "completion"으로 지정합니다.

```yaml
model_list:
  - model_name: azure-text-completion
    litellm_params:
      model: azure/text-davinci-003
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      mode: completion # 👈 ADD THIS
```

### Speech to Text 모델 {#speech-to-text-models}

```yaml
model_list:
  - model_name: whisper
    litellm_params:
      model: whisper-1
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: audio_transcription
```


### Text to Speech 모델 {#text-to-speech-models}

```yaml
# OpenAI Text to Speech Models
  - model_name: tts
    litellm_params:
      model: openai/tts-1
      api_key: "os.environ/OPENAI_API_KEY"
    model_info:
      mode: audio_speech
      health_check_voice: alloy
```

"alloy"가 아닌 다른 voice를 사용해야 한다면 `health_check_voice`를 지정할 수 있습니다.

### Rerank 모델 {#rerank-models}

rerank health check를 실행하려면 해당 모델 config에서 mode를 "rerank"로 지정합니다.

```yaml
model_list:
  - model_name: rerank-english-v3.0
    litellm_params:
      model: cohere/rerank-english-v3.0
      api_key: os.environ/COHERE_API_KEY
    model_info:
      mode: rerank
```

### Batch 모델(Azure Only) {#batch-models-azure-only}

`batch` 모델로 배포된 Azure 모델은 `mode: batch`를 설정합니다.

```yaml
model_list:
  - model_name: "batch-gpt-4o-mini"
    litellm_params:
      model: "azure/batch-gpt-4o-mini"
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
    model_info:
      mode: batch
```

예상 응답


```bash
{
    "healthy_endpoints": [
        {
            "api_base": "https://...",
            "model": "azure/gpt-4o-mini",
            "x-ms-region": "East US"
        }
    ],
    "unhealthy_endpoints": [],
    "healthy_count": 1,
    "unhealthy_count": 0
}
```

### Realtime 모델 {#realtime-models}

realtime health check를 실행하려면 해당 모델 config에서 mode를 "realtime"으로 지정합니다.

```yaml
model_list:
  - model_name: openai/gpt-4o-realtime-audio
    litellm_params:
      model: openai/gpt-4o-realtime-audio
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      mode: realtime
```

### OCR 모델 {#ocr-models}

OCR health check를 실행하려면 해당 모델 config에서 mode를 "ocr"로 지정합니다.

```yaml
model_list:
  - model_name: mistral/mistral-ocr-latest
    litellm_params:
      model: mistral/mistral-ocr-latest
      api_key: os.environ/MISTRAL_API_KEY
    model_info:
      mode: ocr
```

### Wildcard Routes {#wildcard-routes}

wildcard route에서는 `config.yaml`에 `health_check_model`을 지정할 수 있습니다. 이 모델은 해당 wildcard route의 health check에 사용됩니다.

이 예시에서 `openai/*`에 대한 health check를 실행하면 health check는 `openai/gpt-4o-mini`로 `/chat/completions` request를 보냅니다.

```yaml
model_list:
  - model_name: openai/*
    litellm_params:
      model:  openai/*
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_model: openai/gpt-4o-mini
  - model_name: anthropic/*
    litellm_params:
      model: anthropic/*
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      health_check_model: anthropic/claude-3-5-sonnet-20240620
```

## Background Health Checks 설정 {#background-health-checks}

`/health`를 통해 각 모델이 너무 자주 query되지 않도록, 모델 health check가 background에서 실행되게 활성화할 수 있습니다.

:::info

**이 설정은 각 모델이 정상인지 확인하기 위해 LLM API 호출을 수행합니다.**

:::

사용 방법은 다음과 같습니다.
1. `config.yaml`에 추가합니다.
```
general_settings: 
  background_health_checks: True # enable background health checks
 health_check_interval: 300 # frequency of background health checks
```

2. 서버를 시작합니다.
```
$ litellm /path/to/config.yaml
```

3. health endpoint를 query합니다.
```
 curl --location 'http://0.0.0.0:4000/health'
```

### 특정 모델의 Background Health Checks 비활성화 {#disable-background-health-checks-for-specific-models}

특정 모델의 background health check를 비활성화하려면 이 설정을 사용합니다.

`background_health_checks`가 활성화된 경우, 모델의 `model_info`에
`disable_background_health_check: true`를 설정해 개별 모델을 건너뛸 수 있습니다.

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      disable_background_health_check: true
```

### 세부 정보 숨기기

health check 응답에는 endpoint URL, error message,
기타 LiteLLM params 같은 세부 정보가 포함됩니다. 디버깅에는 유용하지만
proxy server를 넓은 대상에게 노출할 때 문제가 될 수 있습니다.

`health_check_details` 설정을 `False`로 지정하면 이러한 세부 정보를 숨길 수 있습니다.

```yaml
general_settings: 
  health_check_details: False
```

## Health Check 기반 라우팅 {#health-check-driven-routing}

사용자 요청이 도달하기 전에 비정상 deployment를 피해 traffic을 선제적으로 라우팅합니다. error type별 failure threshold, transient error suppression, automatic safety net을 지원합니다.

전체 가이드는 [Health Check Driven Routing](./health_check_routing.md)을 참고하세요.

## Health Check Timeout 설정 {#health-check-timeout}

health check timeout은 `litellm/constants.py`에 설정되어 있으며 기본값은 60초입니다.

`config.yaml`의 `model_info` section에 `health_check_timeout`을 설정해 override할 수 있습니다.

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_timeout: 10 # 👈 OVERRIDE HEALTH CHECK TIMEOUT
```

## Health Check Max Tokens 설정 {#health-check-max-tokens}

기본적으로 health check는 reliability와 낮은 비용/latency의 균형을 맞추기 위해 `max_tokens=5`를 사용합니다. wildcard 모델의 기본값은 `max_tokens=10`입니다.

`config.yaml`의 `model_info` section에 `health_check_max_tokens`를 설정해 모델별로 override할 수 있습니다.

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_max_tokens: 5 # 👈 OVERRIDE HEALTH CHECK MAX TOKENS
```

### Reasoning vs non-reasoning 기본값 {#reasoning-vs-non-reasoning-defaults}

Reasoning 모델(model map의 `supports_reasoning` 기준)은 provider가 reasoning token을 completion budget에 포함해 계산하므로 더 높은 health-check `max_tokens`가 필요한 경우가 많습니다. 모든 모델을 나열하지 않고도 **별도** limit을 설정할 수 있습니다.

**deployment별(`model_info`)** — `health_check_max_tokens`가 설정되지 않았을 때 사용됩니다. wildcard route(`litellm_params.model`의 `*`, 즉 deployment model string이며 `health_check_model`은 아님)에서는 무시됩니다.

```yaml
model_list:
  - model_name: openai-stack
    litellm_params:
      model: openai/gpt-5-nano
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      health_check_max_tokens_reasoning: 128
      health_check_max_tokens_non_reasoning: 1
```

**전역(environment)**:

- `BACKGROUND_HEALTH_CHECK_MAX_TOKENS_REASONING` — non-wildcard reasoning 모델에서 설정된 경우 이 값이 우선합니다.
- `BACKGROUND_HEALTH_CHECK_MAX_TOKENS` — 모든 모델(wildcard route 포함)에 대한 전역 fallback

둘 다 설정되지 않으면 non-wildcard 모델은 기본값 `5`를 사용하고 wildcard route는 `max_tokens`를 생략합니다.

## `/health/readiness` {#healthreadiness}

프록시가 요청을 받을 준비가 되었는지 확인하는 unprotected endpoint입니다.

예제 요청:

```bash
curl http://0.0.0.0:4000/health/readiness
```

예제 응답:

```json
{
  "status": "connected",
  "db": "connected",
  "cache": null,
  "litellm_version": "1.40.21",
  "success_callbacks": [
    "langfuse",
    "_PROXY_track_cost_callback",
    "response_taking_too_long_callback",
    "_PROXY_MaxParallelRequestsHandler",
    "_PROXY_MaxBudgetLimiter",
    "_PROXY_CacheControlCheck",
    "ServiceLogging"
  ],
  "last_updated": "2024-07-10T18:59:10.616968"
}
```

프록시가 database에 연결되어 있지 않으면 `"db"` field는 `"connected"` 대신 `"Not
connected"`가 되며 `"last_updated"` field는 표시되지 않습니다.

## `/health/liveliness` {#healthliveliness}

프록시가 살아 있는지 확인하는 unprotected endpoint입니다.


예제 요청:

```
curl -X 'GET' \
  'http://0.0.0.0:4000/health/liveliness' \
  -H 'accept: application/json'
```

예제 응답:

```json
"I'm alive!"
```

## `/health/services` {#healthservices}

연결된 service(datadog/slack/langfuse 등)가 정상인지 확인하는 admin-only endpoint입니다.

```bash
curl -L -X GET 'http://0.0.0.0:4000/health/services?service=datadog'     -H 'Authorization: Bearer sk-1234'
```

[**API Reference**](https://litellm-api.up.railway.app/#/health/health_services_endpoint_health_services_get)


## 고급 - 특정 모델 호출

특정 모델의 health를 확인하려면 다음 방식으로 호출합니다.

### 1. `/model/info`로 model id 가져오기

```bash
curl -X GET 'http://0.0.0.0:4000/v1/model/info' \
--header 'Authorization: Bearer sk-1234' \
```

**예상 응답**

```bash
{
    "model_name": "bedrock-anthropic-claude-3",
    "litellm_params": {
        "model": "anthropic.claude-3-sonnet-20240229-v1:0"
    },
    "model_info": {
        "id": "634b87c444..", # 👈 UNIQUE MODEL ID
}
```

### 2. `/chat/completions`로 특정 모델 호출

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
  "model": "634b87c444.." # 👈 UNIQUE MODEL ID
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
}
'
```
