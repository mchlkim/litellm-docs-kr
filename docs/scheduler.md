import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# [베타] 요청 우선순위 지정 {#request-prioritization}

:::info 

베타 기능입니다. 테스트 용도로만 사용하세요.

[개선에 참여하기](https://github.com/BerriAI/litellm/issues)
:::

트래픽이 많은 상황에서 LLM API 요청의 우선순위를 지정합니다.

- 요청을 우선순위 큐에 추가합니다.
- 요청을 보낼 수 있는지 확인하기 위해 큐를 폴링합니다. 다음 경우 'True'를 반환합니다.
    * 정상 상태인 배포가 있는 경우
    * 또는 요청이 큐의 맨 앞에 있는 경우
- 우선순위 - 숫자가 낮을수록 우선순위가 높습니다.
    * 예: `priority=0` > `priority=2000`

지원되는 Router 엔드포인트:
- `acompletion` (Proxy의 `/v1/chat/completions`)
- `atext_completion` (Proxy의 `/v1/completions`)


## 빠른 시작 

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "gpt-3.5-turbo",
            "litellm_params": {
                "model": "gpt-3.5-turbo",
                "mock_response": "Hello world this is Macintosh!", # fakes the LLM API call
                "rpm": 1,
            },
        },
    ],
    timeout=2, # timeout request if takes > 2s
    routing_strategy="simple-shuffle", # recommended for best performance
    polling_interval=0.03 # poll queue every 3ms if no healthy deployments
)

try:
    _response = await router.acompletion( # 👈 ADDS TO QUEUE + POLLS + MAKES CALL
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hey!"}],
        priority=0, # 👈 LOWER IS BETTER
    )
except Exception as e:
    print("didn't make request")
```

## LiteLLM Proxy {#litellm-proxy}

LiteLLM Proxy에서 요청의 우선순위를 지정하려면 요청에 `priority`를 추가하세요.

<Tabs>
<TabItem value="curl" label="curl">

```curl 
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "gpt-3.5-turbo-fake-model",
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
        }],
    "priority": 0 👈 SET VALUE HERE
}'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={ 
        "priority": 0 👈 SET VALUE HERE
    }
)

print(response)
```

</TabItem>
</Tabs>

## 고급 - Redis 캐싱 {#advanced-redis-caching}

Redis 캐싱을 사용하면 여러 LiteLLM 인스턴스에 걸쳐 요청 우선순위 지정을 수행할 수 있습니다.

### SDK 
```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "gpt-3.5-turbo",
            "litellm_params": {
                "model": "gpt-3.5-turbo",
                "mock_response": "Hello world this is Macintosh!", # fakes the LLM API call
                "rpm": 1,
            },
        },
    ],
    ### REDIS PARAMS ###
    redis_host=os.environ["REDIS_HOST"], 
    redis_password=os.environ["REDIS_PASSWORD"], 
    redis_port=os.environ["REDIS_PORT"], 
)

try:
    _response = await router.acompletion( # 👈 ADDS TO QUEUE + POLLS + MAKES CALL
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hey!"}],
        priority=0, # 👈 LOWER IS BETTER
    )
except Exception as e:
    print("didn't make request")
```

### PROXY 

```yaml
model_list:
    - model_name: gpt-3.5-turbo-fake-model
      litellm_params:
        model: gpt-3.5-turbo
        mock_response: "hello world!" 
        api_key: my-good-key

litellm_settings:
    request_timeout: 600 # 👈 Will keep retrying until timeout occurs

router_settings:
    redis_host; os.environ/REDIS_HOST
    redis_password: os.environ/REDIS_PASSWORD
    redis_port: os.environ/REDIS_PORT
```

```bash
$ litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000s
```

```bash
curl -X POST 'http://localhost:4000/queue/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-D '{
    "model": "gpt-3.5-turbo-fake-model",
    "messages": [
        {
        "role": "user",
        "content": "what is the meaning of the universe? 1234"
        }],
    "priority": 0 👈 SET VALUE HERE
}'
```
