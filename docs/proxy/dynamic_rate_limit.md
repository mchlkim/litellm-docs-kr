
# 동적 TPM/RPM 할당

프로젝트가 TPM/RPM을 과도하게 사용하는 것을 방지합니다.

**함께 보기:** [요청 우선순위 지정](../scheduler.md) - 트래픽이 많은 상황에서 LLM API 요청을 우선순위 큐에 추가해 우선 처리합니다.

해당 분에 활성 상태인 키를 기준으로 API 키에 TPM/RPM 할당량을 동적으로 배분합니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/9bffa9a48e610cc6886fc2dce5c1815aeae2ad46/litellm/proxy/hooks/dynamic_rate_limiter.py#L125)

## 빠른 시작 사용법

1. config.yaml 설정

```yaml showLineNumbers title="config.yaml"
model_list: 
  - model_name: my-fake-model
    litellm_params:
      model: gpt-3.5-turbo
      api_key: my-fake-key
      mock_response: hello-world
      tpm: 60

litellm_settings: 
  callbacks: ["dynamic_rate_limiter_v3"]

general_settings:
  master_key: sk-1234 # OR set `LITELLM_MASTER_KEY=".."` in your .env
  database_url: postgres://.. # OR set `DATABASE_URL=".."` in your .env
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="test.py"
"""
- Run 2 concurrent teams calling same model
- model has 60 TPM
- Mock response returns 30 total tokens / request
- Each team will only be able to make 1 request per minute
"""

import requests
from openai import OpenAI, RateLimitError

def create_key(api_key: str, base_url: str): 
    response = requests.post(
        url="{}/key/generate".format(base_url), 
        json={},
        headers={
            "Authorization": "Bearer {}".format(api_key)
        }
    )

    _response = response.json()

    return _response["key"]

key_1 = create_key(api_key="sk-1234", base_url="http://0.0.0.0:4000")
key_2 = create_key(api_key="sk-1234", base_url="http://0.0.0.0:4000")

# call proxy with key 1 - works
openai_client_1 = OpenAI(api_key=key_1, base_url="http://0.0.0.0:4000")

response = openai_client_1.chat.completions.with_raw_response.create(
    model="my-fake-model", messages=[{"role": "user", "content": "Hello world!"}],
)

print("Headers for call 1 - {}".format(response.headers))
_response = response.parse()
print("Total tokens for call - {}".format(_response.usage.total_tokens))


# call proxy with key 2 -  works 
openai_client_2 = OpenAI(api_key=key_2, base_url="http://0.0.0.0:4000")

response = openai_client_2.chat.completions.with_raw_response.create(
    model="my-fake-model", messages=[{"role": "user", "content": "Hello world!"}],
)

print("Headers for call 2 - {}".format(response.headers))
_response = response.parse()
print("Total tokens for call - {}".format(_response.usage.total_tokens))
# call proxy with key 2 -  fails
try:  
    openai_client_2.chat.completions.with_raw_response.create(model="my-fake-model", messages=[{"role": "user", "content": "Hey, how's it going?"}])
    raise Exception("This should have failed!")
except RateLimitError as e: 
    print("This was rate limited b/c - {}".format(str(e)))

```

**예상 응답**

```
This was rate limited b/c - Error code: 429 - {'error': {'message': {'error': 'Key=<hashed_token> over available TPM=0. Model TPM=0, Active keys=2'}, 'type': 'None', 'param': 'None', 'code': 429}}
```


## [BETA] 우선순위 설정 / 할당량 예약 {#priority-quota-reservation}

환경 또는 사용 사례별로 TPM/RPM 용량을 예약합니다. 이렇게 하면 중요한 프로덕션 워크로드는 항상 보장된 용량을 확보하고, 개발 또는 낮은 우선순위 작업은 남은 할당량을 사용합니다.

**사용 사례:**
- 프로덕션 환경과 개발 환경 구분
- 실시간 애플리케이션과 배치 처리 구분
- 중요 서비스와 실험 기능 구분

:::tip

우선순위에 따라 키의 TPM/RPM을 예약하는 기능은 프리미엄 기능입니다. 이 기능을 사용하려면 [엔터프라이즈 라이선스](../enterprise)를 받으세요.
:::

### 우선순위 예약 작동 방식

우선순위 예약은 모델의 총 TPM/RPM 중 일정 비율을 특정 우선순위 수준에 할당합니다. 더 높은 우선순위를 가진 키는 예약된 할당량에 먼저 접근할 수 있습니다.

**예제 시나리오:**
- 모델의 총 용량은 10 RPM입니다.
- 우선순위 예약: `{"prod": 0.9, "dev": 0.1}`
- 결과: 프로덕션 키는 9 RPM을 보장받고, 개발 키는 1 RPM을 보장받습니다.

### 설정

#### 1. config.yaml 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-3.5-turbo             
    litellm_params:
      model: "gpt-3.5-turbo"       
      api_key: os.environ/OPENAI_API_KEY 
      rpm: 10   # Total model capacity

litellm_settings:
  callbacks: ["dynamic_rate_limiter_v3"]
  priority_reservation:
    "prod": 0.9 # 90% reserved for production (9 RPM)
    "dev": 0.1 # 10% reserved for development (1 RPM)
    # Alternative format:
    # "prod":
    #   type: "rpm"    # Reserve based on requests per minute
    #   value: 9       # 9 RPM = 90% of 10 RPM capacity
    # "dev":
    #   type: "tpm"    # Reserve based on tokens per minute
    #   value: 100     # 100 TPM
  priority_reservation_settings:
    default_priority: 0  # Weight (0%) assigned to keys without explicit priority metadata
    saturation_threshold: 0.50 #  A model is saturated if it has hit 50% of its RPM limit
    saturation_check_cache_ttl: 60 # How long (seconds) saturation values are cached locally

general_settings:
  master_key: sk-1234 # OR set `LITELLM_MASTER_KEY=".."` in your .env
  database_url: postgres://.. # OR set `DATABASE_URL=".."` in your.env
```

**설정 세부 정보:**

`priority_reservation`: `Dict[str, Union[float, PriorityReservationDict]]`
- **Key (str)**: 우선순위 수준 이름입니다. "prod", "dev", "critical" 등 원하는 문자열을 사용할 수 있습니다.
- **Value**: float(0.0-1.0) 또는 `type`과 `value`가 있는 dict입니다.
  - Float: `0.9` = 용량의 90%
  - Dict: `{"type": "rpm", "value": 9}` = 분당 요청 9개
  - 지원되는 유형: `"percent"`, `"rpm"`, `"tpm"`

`priority_reservation_settings`: `Object (Optional)`
- **default_priority (float)**: 우선순위 메타데이터가 설정되지 않은 API 키에 할당되는 가중치/비율(0.0-1.0)입니다. 기본값은 0.5입니다.
- **saturation_threshold (float)**: 모델에 엄격한 우선순위 적용을 시작하는 포화 수준(0.0-1.0)입니다. 포화도는 `max(current_rpm/max_rpm, current_tpm/max_tpm)`으로 계산됩니다. 이 임계값보다 낮으면 generous mode에서 사용하지 않는 용량을 우선순위별로 빌려 쓸 수 있습니다. 이 임계값보다 높으면 strict mode에서 정규화된 우선순위 제한을 적용합니다.
  - 예제: 모델 사용량이 낮으면 키가 할당된 몫보다 더 많이 사용할 수 있습니다. 모델 사용량이 높으면 키는 할당된 몫으로 엄격하게 제한됩니다.
- **saturation_check_cache_ttl (int)**: Redis에서 포화도 값을 읽을 때 사용하는 로컬 캐시 TTL(초)입니다. 기본값은 60입니다. 다중 노드 배포에서는 노드가 동일한 포화 상태로 수렴하는 속도를 제어합니다. 값이 낮을수록 더 빠르게 수렴하지만 Redis 읽기가 늘어납니다.
  - 예제: 다중 노드 일관성을 더 빠르게 맞추려면 `5`로 설정하고, 항상 Redis에서 직접 읽으려면 `0`으로 설정합니다.

**프록시 시작**

```bash
litellm --config /path/to/config.yaml
```

### 팀 또는 키에 우선순위 설정

우선순위는 **팀 수준** 또는 **키 수준**에서 설정할 수 있습니다. 팀 수준 우선순위가 키 수준 우선순위보다 우선합니다.

**옵션 A: 팀에 우선순위 설정(권장)**

팀 안의 모든 키는 팀의 우선순위를 상속합니다. 특정 환경 또는 프로젝트의 모든 키에 같은 우선순위를 적용하려는 경우 유용합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/team/new' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
  "team_alias": "production-team",
  "metadata": {"priority": "prod"}
}'
```

이 팀의 키를 생성합니다.
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
  "team_id": "team-id-from-previous-response"
}'
```

**옵션 B: 개별 키에 우선순위 설정**

키에 우선순위를 직접 설정합니다. 키별로 세밀하게 제어해야 할 때 유용합니다.

**프로덕션 키:**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
  "metadata": {"priority": "prod"}
}'
```

**개발 키:**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
  "metadata": {"priority": "dev"}
}'
```

**우선순위가 없는 키(`default_priority` 가중치 사용):**
```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

**예상 응답:**
```json
{
  "key": "sk-...",
  "metadata": {"priority": "prod"}, // or "dev"
  ...
}
```

**우선순위 결정 순서:**
1. 키가 `metadata.priority`가 설정된 팀에 속하면 팀 우선순위를 사용합니다.
2. 그렇지 않고 키에 `metadata.priority`가 설정되어 있으면 키 우선순위를 사용합니다.
3. 그 외에는 config의 `default_priority`를 사용합니다.

#### 3. 우선순위 할당 테스트

**프로덕션 키 테스트(9 RPM을 받아야 함):**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-prod-key' \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello from prod"}]
  }'
```

**개발 키 테스트(1 RPM을 받아야 함):**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-dev-key' \
  -d '{
    "model": "gpt-3.5-turbo", 
    "messages": [{"role": "user", "content": "Hello from dev"}]
  }'
```

### 예상 동작

위 설정을 사용하면 다음과 같이 동작합니다.

1. **프로덕션 키**는 분당 최대 9개 요청을 보낼 수 있습니다(10 RPM의 90%).
2. **개발 키**는 분당 최대 1개 요청을 보낼 수 있습니다(10 RPM의 10%).
3. **명시적 우선순위가 없는 키**는 default_priority 가중치(0 = 0%)를 받으므로 분당 요청 0개(10 RPM의 0%)가 할당됩니다.
4. `priority_reservation`의 명명된 우선순위와 `default_priority`를 사용하는 키는 독립적으로 동작합니다.

**속도 제한 오류 예제:**
```json
{
  "error": {
    "message": "Key=sk-dev-... over available RPM=0. Model RPM=10, Reserved RPM for priority 'dev'=1, Active keys=1",
    "type": "rate_limit_exceeded",
    "code": 429
  }
}
```

### 데모 동영상

이 동영상에서는 우선순위 예약을 사용하는 동적 속도 제한 설정과 동작 검증을 위한 locust 테스트를 단계별로 보여줍니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/1b54b93139ee415d959402cc0629f3f7" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
