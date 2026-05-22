import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Proxy - 로드 밸런싱 {#proxy-load-balancing}
같은 model의 여러 instance에 로드 밸런싱을 적용합니다.

proxy는 LiteLLM Router를 사용해 request routing을 처리합니다. **처리량을 최대화하려면 config에서 `rpm`을 설정하세요.**


:::info

routing strategy / parameter에 대한 자세한 내용은 [Routing](../routing.md)을 참고하세요.

:::

## 로드 밸런싱 동작 방식 {#how-load-balancing-works}

LiteLLM은 내장 router를 사용해 같은 model의 여러 deployment에 request를 자동으로 분산합니다. proxy는 성능과 안정성을 최적화하도록 traffic을 route합니다.

기본 routing strategy는 "simple-shuffle"입니다.

### Routing Strategy {#routing-strategy}

| Strategy | 설명 | 사용 시점 |
|----------|-------------|-------------|
| **simple-shuffle** (권장) | request를 무작위로 분산 | 일반 목적, 균등한 부하 분산에 적합 |
| **least-busy** | active request가 가장 적은 deployment로 route | 동시성이 높은 시나리오 |
| **usage-based-routing** (성능에 좋지 않음) | 현재 usage(RPM/TPM)가 가장 낮은 deployment로 route | rate limit을 균등하게 지키고 싶을 때 |
| **latency-based-routing** | response가 가장 빠른 deployment로 route | 지연 시간에 민감한 application |
| **cost-based-routing** | cost가 가장 낮은 deployment로 route | cost에 민감한 application |

:::tip Deployment 우선순위
특정 deployment에 우선순위를 주려면 `order` parameter를 사용합니다. 자세한 내용은 [Deployment 순서 지정](#deployment-ordering-priority)을 참고하세요.
:::


## 빠른 시작 - 로드 밸런싱 {#quick-start-load-balancing}
#### 1단계 - config에 deployment 설정 {#step-1-set-deployments-on-config}

**아래는 예제 config입니다**. 여기서는 `model=gpt-3.5-turbo` request가 `azure/gpt-3.5-turbo`의 여러 instance로 route됩니다.
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-large
      api_base: https://openai-france-1234.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 1440

router_settings:
  routing_strategy: simple-shuffle # Literal["simple-shuffle", "least-busy", "usage-based-routing","latency-based-routing"], default="simple-shuffle"
  model_group_alias: {"gpt-4": "gpt-3.5-turbo"} # all requests with `gpt-4` will be routed to models with `gpt-3.5-turbo`
  num_retries: 2
  timeout: 30                                  # 30 seconds
  redis_host: <your redis host>                # set this when using multiple litellm proxy deployments, load balancing state stored in redis
  redis_password: <your redis password>
  redis_port: 1992
```

## Model Rate Limit 강제 {#model-rate-limit-enforcement}

deployment에 설정한 RPM/TPM limit을 엄격히 강제합니다. limit이 초과되면 request가 LLM provider에 도달하기 **전에** `429 Too Many Requests` 오류로 차단됩니다.

:::info
기본적으로 `rpm`과 `tpm` 값은 **routing decision**(capacity가 있는 deployment 선택)에만 사용됩니다. `enforce_model_rate_limits`를 사용하면 이 값들이 **hard limit**이 됩니다.
:::

### 빠른 시작

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
    rpm: 60     # 60 requests per minute
    tpm: 90000  # 90k tokens per minute

router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits  # 👈 Enables strict enforcement
```

### 동작 방식

| Limit 유형 | 강제 방식 | 정확도 |
|------------|-------------|----------|
| **RPM** | hard limit - 정확한 threshold에서 차단 | 100% 정확 |
| **TPM** | best-effort - 약간 초과할 수 있음 | 이미 limit을 넘은 경우 차단 |

**TPM이 best-effort인 이유:** LLM이 response를 반환하기 전에는 token count를 알 수 없습니다. TPM은 각 request 전에 검사되어 이미 초과한 경우 차단되고, 이후 실제 사용 token을 더해 추적됩니다.

### 오류 Response {#error-response}

```json
{
  "error": {
    "message": "Model rate limit exceeded. RPM limit=60, current usage=60",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

response에는 `retry-after: 60` header가 포함됩니다.

### 다중 Instance Deployment {#multi-instance-deployment}

LiteLLM proxy instance가 여러 개인 경우 rate limit state를 공유하려면 Redis를 추가합니다.

```yaml
router_settings:
  optional_pre_call_checks:
    - enforce_model_rate_limits
  redis_host: redis.example.com
  redis_port: 6379
  redis_password: your-password
```


:::info
[routing strategy에 대한 자세한 정보는 여기](../routing)에서 확인할 수 있습니다.
:::

#### 2단계: config로 Proxy 시작 {#step-2-start-the-proxy-with-config}

```shell
$ litellm --config /path/to/config.yaml
```

### 테스트 - 단순 호출 {#test-simple-call}

여기서는 model=gpt-3.5-turbo request가 azure/gpt-3.5-turbo의 여러 instance로 route됩니다.

👉 핵심 변경: `model="gpt-3.5-turbo"`

request가 load balanced되고 있는지 확인하려면 response header의 `model_id`를 확인하세요.

<Tabs>

<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```
</TabItem>

</Tabs>
### 테스트 - 로드 밸런싱 {#test-load-balancing}

이 request에서는 다음이 발생합니다.
1. rate limit exception이 발생합니다.
2. LiteLLM proxy가 model group에서 request를 retry합니다(기본 retry 횟수는 3).

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-3.5-turbo",
  "messages": [
        {"role": "user", "content": "Hi there!"}
    ],
    "mock_testing_rate_limit_error": true
}'
```

[**코드 보기**](https://github.com/BerriAI/litellm/blob/6b8806b45f970cb2446654d2c379f8dcaa93ce3c/litellm/router.py#L2535)


## 여러 litellm instance로 로드 밸런싱(Kubernetes, Auto Scaling) {#load-balancing-with-multiple-litellm-instances-kubernetes-auto-scaling}

LiteLLM Proxy는 여러 litellm instance 간 rpm/tpm 공유를 지원합니다. 활성화하려면 `redis_host`, `redis_password`, `redis_port`를 전달하세요. LiteLLM은 Redis로 rpm/tpm usage를 추적합니다.

예제 config

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6
router_settings:
  redis_host: <your redis host>
  redis_password: <your redis password>
  redis_port: 1992
  cache_params:
    type: redis
    max_connections: 100  # maximum Redis connections in the pool; tune based on expected concurrency/load
```

## config의 Router settings - routing_strategy, model_group_alias {#router-settings-in-config-routing_strategy-model_group_alias}

proxy server에서 'model_name'의 'alias'를 노출합니다.

```
model_group_alias: {
  "gpt-4": "gpt-3.5-turbo"
}
```

이 alias는 기본적으로 `/v1/models`, `/v1/model/info`, `/v1/model_group/info`에 표시됩니다.

`litellm.Router()` 설정은 `router_settings` 아래에서 지정할 수 있습니다. `model_group_alias`, `routing_strategy`, `num_retries`, `timeout`을 설정할 수 있습니다. Router가 지원하는 모든 parameter는 [여기](https://github.com/BerriAI/litellm/blob/1b942568897a48f014fa44618ec3ce54d7570a46/litellm/router.py#L64)를 참고하세요.



### 사용법

`router_settings`가 있는 예제 config

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>

router_settings:
  model_group_alias: {"gpt-4": "gpt-3.5-turbo"} # all requests with `gpt-4` will be routed to models 
```

### Alias model 숨기기 {#hide-alias-models}

다음 용도로 alias를 설정하려면 사용하세요.

1. 오타
2. minor model version 변경
3. update 간 대소문자 차이

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>

router_settings:
  model_group_alias:
    "GPT-3.5-turbo": # alias
      model: "gpt-3.5-turbo"  # Actual model name in 'model_list'
      hidden: true             # Exclude from `/v1/models`, `/v1/model/info`, `/v1/model_group/info`
```

### 전체 사양 {#full-spec}

```python
model_group_alias: Optional[Dict[str, Union[str, RouterModelGroupAliasItem]]] = {}


class RouterModelGroupAliasItem(TypedDict):
    model: str
    hidden: bool  # if 'True', don't return on `/v1/models`, `/v1/model/info`, `/v1/model_group/info`
```

## Deployment 순서 지정(Priority) {#deployment-ordering-priority}

deployment에 우선순위를 주려면 `litellm_params`에 `order`를 설정합니다. 값이 낮을수록 우선순위가 높습니다. 여러 deployment가 같은 `order`를 공유하면 routing strategy가 그중 하나를 선택합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-primary
      api_key: os.environ/AZURE_API_KEY
      order: 1  # 👈 Highest priority - always tried first

  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-fallback
      api_key: os.environ/AZURE_API_KEY_2
      order: 2  # 👈 Used when order=1 fails
```

### order 기반 fallback 동작 방식 {#how-order-based-fallbacks-work}

`order=1` deployment에 대한 request가 실패하면(connection error, 404, 429 등) router는 자동으로 `order=2` deployment, 그다음 `order=3` deployment를 시도합니다. 각 order level은 다음 level로 넘어가기 전에 자체 retry set을 가집니다.

모든 order level이 소진되면 router는 설정된 [model-level fallback](#fallbacks)으로 넘어갑니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-primary
      api_key: os.environ/AZURE_API_KEY
      order: 1

  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-secondary
      api_key: os.environ/AZURE_API_KEY_2
      order: 2

  - model_name: gpt-4-fallback
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  fallbacks:
    - gpt-4:
        - gpt-4-fallback  # tried after all order levels fail
```

위 config의 fallback chain은 `order=1` → `order=2` → `gpt-4-fallback`입니다.

특히 429(rate limit) 오류의 경우 실패한 deployment는 즉시 cooldown 상태가 됩니다. 모든 `order=1` deployment가 cooldown 상태이면 router는 fallback path를 기다리지 않고 retry 중에 바로 `order=2` deployment를 선택합니다.

### Team-scoped model과 legacy `model_aliases` {#team-scoped-models-and-legacy-model_aliases}

Team-scoped deployment는 `model_info.team_id`와 `model_info.team_public_model_name`으로 식별됩니다. request는 **public** model name을 사용해야 합니다. router는 routing, failover, deployment `order`를 위해 모든 sibling deployment(같은 public name, 다른 `api_base` / `order` 등)를 해석합니다.

router 내부 동작: `team_id`가 scope에 있으면 optimized lookup은 `(team_id, team_public_model_name)`을 key로 사용합니다. code가 public name 대신 internal deployment id(예: `model_name_<team_id>_<uuid>`)를 전달해도 일반 deployment-name path를 통해 routing은 계속 동작하지만, team-specific fast path는 public name에만 적용됩니다.

**Legacy team:** 이전 proxy version은 team row의 `model_aliases`에 public name을 단일 internal deployment id(`model_name_<team_id>_<uuid>`)로 매핑해 저장할 수 있었습니다. 각 request에서 pre-call logic이 routing **전에** 여전히 `model`을 internal name으로 rewrite할 수 있으며, 이 경우 하나의 deployment로 collapse되어 더 최신 sibling deployment에 접근하지 못할 수 있습니다.

**마이그레이션 옵션:**

1. **업그레이드 권장 방식:** environment variable `LITELLM_ENABLE_TEAM_STALE_ALIAS_BYPASS=true`를 설정합니다. 그러면 public name에 대한 sibling team deployment가 있을 때 stale alias rewrite를 건너뛰고, `order`와 failover를 포함한 team-scoped routing이 적용됩니다. proxy settings 문서의 [Environment variables](./config_settings) table을 참고하세요.
2. **데이터 정리:** database의 team record에서 team public name에 대한 obsolete `model_aliases` entry를 제거해 `team_public_model_name` + team model list만 access를 결정하게 합니다.

stale alias가 감지되고 bypass가 활성화되어 있지 않으면 proxy가 log에 **one-time** warning을 emit할 수 있습니다. 이 warning은 flag를 설정하거나 alias를 정리하기 전까지 sibling deployment에 접근하지 못할 수 있음을 설명합니다.

### 로드 밸런싱이 동작하는 것을 볼 수 있는 경우 {#when-you-can-see-load-balancing-working}

**즉시 보이는 효과:**

- 후속 request가 서로 다른 deployment에서 처리됩니다(log에서 확인 가능).
- traffic이 많을 때 response time이 개선됩니다.

**관측 가능한 이점:**
- **처리량 향상**: deployment 전반에서 더 많은 request를 동시에 처리합니다.
- **안정성 개선**: 하나의 deployment가 실패하면 traffic이 자동으로 healthy deployment로 route됩니다.
- **리소스 활용도 개선**: 사용 가능한 모든 deployment에 load가 고르게 분산됩니다.

## Responses API 특별 고려 사항 {#responses-api-special-considerations}

**서로 다른 API key**를 가진 deployment 간에 OpenAI Responses API를 load balancing하는 경우(예: 서로 다른 Azure region 또는 organization), encrypted content item(`rs_...` reasoning item 등)은 원래 생성한 API key로만 decrypt할 수 있습니다.

**해결 방법:** `encrypted_content_affinity` pre-call check를 사용하세요(LiteLLM >= 1.82.3 필요). 그러면 encrypted item을 포함하는 follow-up request가 올바른 deployment로 자동 route됩니다.

```yaml
model_list:
  - model_name: gpt-5.1-codex
    litellm_params:
      model: azure/gpt-5.1-codex
      api_base: https://eastus.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_EASTUS
    model_info:
      id: "deployment-eastus"
  
  - model_name: gpt-5.1-codex
    litellm_params:
      model: azure/gpt-5.1-codex
      api_base: https://westeurope.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY_WESTEUROPE
    model_info:
      id: "deployment-westeurope"

router_settings:
  optional_pre_call_checks:
    - encrypted_content_affinity  # 👈 Prevents invalid_encrypted_content errors
```

이 설정은 encrypted content를 포함하는 request가 해당 content를 만든 deployment로 route되도록 보장하며, 다른 request는 계속 정상적으로 load balancing됩니다.

**[Encrypted Content Affinity 자세히 알아보기 →](../response_api.md#encrypted-content-affinity-multi-region-load-balancing)**
