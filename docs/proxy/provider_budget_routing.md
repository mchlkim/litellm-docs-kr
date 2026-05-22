import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 예산 라우팅
LiteLLM은 다음 예산 설정을 지원합니다.
- 프로바이더 예산 - OpenAI에 $100/day, Azure에 $100/day.
- 모델 예산 - gpt-4 https://api-base-1에 $100/day, gpt-4o https://api-base-2에 $100/day
- 태그 예산 - tag=`product:chat-bot`에 $10/day, tag=`product:chat-bot-2`에 $100/day


## 프로바이더 예산
LLM 프로바이더의 예산을 설정할 때 사용합니다. 예: OpenAI에 $100/day, Azure에 $100/day.

### 빠른 시작

`proxy_config.yaml` 파일에서 프로바이더 예산을 설정합니다.
#### Proxy Config 설정
```yaml
model_list:
    - model_name: gpt-3.5-turbo
      litellm_params:
        model: openai/gpt-3.5-turbo
        api_key: os.environ/OPENAI_API_KEY

router_settings:
  provider_budget_config: 
    openai: 
      budget_limit: 0.000000000001 # float of $ value budget for time period
      time_period: 1d # can be 1d, 2d, 30d, 1mo, 2mo
    azure:
      budget_limit: 100
      time_period: 1d
    anthropic:
      budget_limit: 100
      time_period: 10d
    vertex_ai:
      budget_limit: 100
      time_period: 12d
    gemini:
      budget_limit: 100
      time_period: 12d
  
  # OPTIONAL: Set Redis Host, Port, and Password if using multiple instance of LiteLLM
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

general_settings:
  master_key: sk-1234
```

#### 테스트 요청 보내기

첫 번째 요청은 성공하고, 두 번째 요청은 `openai` 예산을 초과하므로 실패할 것으로 예상합니다.


**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="Successful Call " value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

</TabItem>
<TabItem label="Unsuccessful call" value = "not-allowed">

프로바이더 `openai`의 예산을 초과하므로 이 요청은 실패할 것으로 예상합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

실패 시 예상 응답

```json
{
  "error": {
    "message": "No deployments available - crossed budget for provider: Exceeded budget for provider openai: 0.0007350000000000001 >= 1e-12",
    "type": "None",
    "param": "None",
    "code": "429"
  }
}
```

</TabItem>


</Tabs>



#### 프로바이더 예산 라우팅 작동 방식

1. **예산 추적**: 
   - Redis를 사용해 각 프로바이더의 지출을 추적합니다.
   - 지정된 기간 동안의 지출을 추적합니다(예: "1d", "30d").
   - 기간이 만료되면 지출을 자동으로 초기화합니다.

2. **라우팅 로직**:
   - 예산 한도 내에 있는 프로바이더로 요청을 라우팅합니다.
   - 예산을 초과한 프로바이더는 건너뜁니다.
   - 모든 프로바이더가 예산을 초과하면 오류를 발생시킵니다.

3. **지원되는 기간**:
   - 초: "Xs" (예: "30s")
   - 분: "Xm" (예: "10m")
   - 시간: "Xh" (예: "24h")
   - 일: "Xd" (예: "1d", "30d")
   - 월: "Xmo" (예: "1mo", "2mo")

4. **요구 사항**:
   - 여러 인스턴스의 지출을 추적하려면 Redis가 필요합니다.
   - 프로바이더 이름은 litellm 프로바이더 이름이어야 합니다. [지원 프로바이더](https://docs.litellm.ai/docs/providers)를 참고하세요.

### 프로바이더 남은 예산 모니터링

#### 예산 및 지출 세부 정보 가져오기

이 엔드포인트를 사용해 프로바이더의 현재 예산, 지출, 예산 초기화 시간을 확인합니다.

예제 요청

```bash
curl -X GET http://localhost:4000/provider/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234"
```

예제 응답

```json
{
    "providers": {
        "openai": {
            "budget_limit": 1e-12,
            "time_period": "1d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "azure": {
            "budget_limit": 100.0,
            "time_period": "1d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "anthropic": {
            "budget_limit": 100.0,
            "time_period": "10d",
            "spend": 0.0,
            "budget_reset_at": null
        },
        "vertex_ai": {
            "budget_limit": 100.0,
            "time_period": "12d",
            "spend": 0.0,
            "budget_reset_at": null
        }
    }
}
```

#### Prometheus 메트릭

LiteLLM은 각 프로바이더의 남은 예산을 추적하기 위해 Prometheus에 다음 메트릭을 내보냅니다.

이 메트릭은 프로바이더의 남은 예산을 달러(USD) 단위로 나타냅니다.

```
litellm_provider_remaining_budget_metric{api_provider="openai"} 10
```


## 모델 예산

모델 예산을 설정할 때 사용합니다. 예: openai/gpt-4o에 $10/day, openai/gpt-4o-mini에 $100/day

### 빠른 시작

`proxy_config.yaml` 파일에서 모델 예산을 설정합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
      max_budget: 0.000000000001 # (USD)
      budget_duration: 1d # (Duration. can be 1s, 1m, 1h, 1d, 1mo)
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
      max_budget: 100 # (USD)
      budget_duration: 30d # (Duration. can be 1s, 1m, 1h, 1d, 1mo)


```


#### 테스트 요청 보내기

첫 번째 요청은 성공하고, 두 번째 요청은 `openai/gpt-4o` 예산을 초과하므로 실패할 것으로 예상합니다.

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="Successful Call " value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

</TabItem>
<TabItem label="Unsuccessful call" value = "not-allowed">

`openai/gpt-4o` 예산을 초과하므로 이 요청은 실패할 것으로 예상합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ]
  }'
```

실패 시 예상 응답

```json
{
    "error": {
        "message": "No deployments available - crossed budget: Exceeded budget for deployment model_name: gpt-4o, litellm_params.model: openai/gpt-4o, model_id: dbe80f2fe2b2465f7bfa9a5e77e0f143a2eb3f7d167a8b55fb7fe31aed62587f: 0.00015250000000000002 >= 1e-12",
        "type": "None",
        "param": "None",
        "code": "429"
    }
}
```
</TabItem>

</Tabs>

## ✨ 태그 예산

:::info

✨ 이 기능은 엔터프라이즈 전용 기능입니다. [여기에서 엔터프라이즈를 시작하세요](https://www.litellm.ai/#pricing)

:::

태그 예산을 설정할 때 사용합니다. 예: tag=`product:chat-bot`에 $10/day, tag=`product:chat-bot-2`에 $100/day


### 빠른 시작

`proxy_config.yaml` 파일에서 `tag_budget_config`를 설정해 태그 예산을 설정합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  tag_budget_config:
    product:chat-bot: # (Tag)
      max_budget: 0.000000000001 # (USD)
      budget_duration: 1d # (Duration)
    product:chat-bot-2: # (Tag)
      max_budget: 100 # (USD)
      budget_duration: 1d # (Duration)
```

#### 테스트 요청 보내기

첫 번째 요청은 성공하고, 두 번째 요청은 `openai/gpt-4o` 예산을 초과하므로 실패할 것으로 예상합니다.

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="Successful Call " value = "allowed">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ],
    "metadata": {"tags": ["product:chat-bot"]}
  }'
```

</TabItem>
<TabItem label="Unsuccessful call" value = "not-allowed">

tag=`product:chat-bot`의 예산을 초과하므로 이 요청은 실패할 것으로 예상합니다.

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "hi my name is test request"}
    ],
    "metadata": {"tags": ["product:chat-bot"]}
  }

```

실패 시 예상 응답

```json
{
    "error": {
        "message": "No deployments available - crossed budget: Exceeded budget for tag='product:chat-bot', tag_spend=0.00015250000000000002, tag_budget_limit=1e-12",
        "type": "None",
        "param": "None",
        "code": "429"
    }
}
```

</TabItem>

</Tabs>

## 멀티 인스턴스 설정

멀티 인스턴스 설정을 사용하는 경우 `proxy_config.yaml` 파일에서 Redis 호스트, 포트, 비밀번호를 설정해야 합니다. Redis는 LiteLLM 인스턴스 간 지출을 동기화하는 데 사용됩니다.

```yaml
model_list:
    - model_name: gpt-3.5-turbo
      litellm_params:
        model: openai/gpt-3.5-turbo
        api_key: os.environ/OPENAI_API_KEY

router_settings:
  provider_budget_config: 
    openai: 
      budget_limit: 0.000000000001 # float of $ value budget for time period
      time_period: 1d # can be 1d, 2d, 30d, 1mo, 2mo
  
  # 👇 Add this: Set Redis Host, Port, and Password if using multiple instance of LiteLLM
  redis_host: os.environ/REDIS_HOST
  redis_port: os.environ/REDIS_PORT
  redis_password: os.environ/REDIS_PASSWORD

general_settings:
  master_key: sk-1234
```

## provider_budget_config 사양

`provider_budget_config`는 다음 형식의 딕셔너리입니다.
- **Key**: 프로바이더 이름(문자열) - 유효한 [LiteLLM 프로바이더 이름](https://docs.litellm.ai/docs/providers)이어야 합니다.
- **Value**: 다음 파라미터가 포함된 예산 설정 객체입니다.
  - `budget_limit`: USD 기준 예산을 나타내는 float 값
  - `time_period`: 다음 형식 중 하나를 사용하는 기간 문자열:
    - 초: `"Xs"` (예: "30s")
    - 분: `"Xm"` (예: "10m")
    - 시간: `"Xh"` (예: "24h")
    - 일: `"Xd"` (예: "1d", "30d")
    - 월: `"Xmo"` (예: "1mo", "2mo")

예제 구조:
```yaml
provider_budget_config:
  openai:
    budget_limit: 100.0    # $100 USD
    time_period: "1d"      # 1 day period
  azure:
    budget_limit: 500.0    # $500 USD
    time_period: "30d"     # 30 day period
  anthropic:
    budget_limit: 200.0    # $200 USD
    time_period: "1mo"     # 1 month period
  gemini:
    budget_limit: 50.0     # $50 USD
    time_period: "24h"     # 24 hour period
```
