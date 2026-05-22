import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 타임아웃 {#timeouts}

router에 설정한 타임아웃은 전체 호출 시간에 적용되며, `completion()` 호출 수준에도 전달됩니다.

### 전역 타임아웃 {#global-timeouts}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

model_list = [{...}]

router = Router(model_list=model_list, 
                timeout=30) # raise timeout error if call takes > 30s 

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
router_settings:
    timeout: 30 # sets a 30s timeout for the entire call
```

**프록시 시작**

```shell
$ litellm --config /path/to/config.yaml
```

</TabItem>
</Tabs>

### 사용자 지정 타임아웃 및 스트림 타임아웃(모델별) {#custom-timeouts--stream-timeouts-per-model}

각 모델의 `litellm_params` 아래에 `timeout`과 `stream_timeout`을 설정할 수 있습니다.

- **`timeout`** → *전체 응답*에 허용되는 최대 시간입니다.
  오래 실행되는 completion 시간을 제한할 때 사용합니다.

- **`stream_timeout`** → 스트리밍 응답에서 *첫 번째 청크*(즉, 첫 토큰)를 기다리는 최대 시간입니다.
  멈춘 것처럼 보이는 프로바이더(예: Bedrock의 느린 시작)를 중단하고 다른 모델로 재시도할 때 사용합니다.
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 
import asyncio

model_list = [{
    "model_name": "gpt-3.5-turbo",
    "litellm_params": {
        "model": "azure/chatgpt-v-2",
        "api_key": os.getenv("AZURE_API_KEY"),
        "api_version": os.getenv("AZURE_API_VERSION"),
        "api_base": os.getenv("AZURE_API_BASE"),
        "timeout": 300 # sets a 5 minute timeout
        "stream_timeout": 30 # sets a 30s timeout for streaming calls
    }
}]

# init router
router = Router(model_list=model_list, routing_strategy="least-busy")
async def router_acompletion():
    response = await router.acompletion(
        model="gpt-3.5-turbo", 
        messages=[{"role": "user", "content": "Hey, how's it going?"}]
    )
    print(response)
    return response

asyncio.run(router_acompletion())
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-eu
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: <your-key>
      timeout: 0.1                      # timeout in (seconds)
      stream_timeout: 0.01              # timeout for stream requests (seconds)
      max_retries: 5
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: 
      timeout: 0.1                      # timeout in (seconds)
      stream_timeout: 0.01              # timeout for stream requests (seconds)
      max_retries: 5

```


**프록시 시작**

```shell
$ litellm --config /path/to/config.yaml
```


</TabItem>
</Tabs>


### 동적 타임아웃 설정 - 요청별 {#setting-dynamic-timeouts-per-request}

LiteLLM은 요청별 `timeout` 설정을 지원합니다.

**예제 사용법**
<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

model_list = [{...}]
router = Router(model_list=model_list)

response = router.completion(
    model="gpt-3.5-turbo", 
    messages=[{"role": "user", "content": "what color is red"}],
    timeout=1
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
     --header 'Content-Type: application/json' \
     --data-raw '{
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "what color is red"}
        ],
        "logit_bias": {12481: 100},
        "timeout": 1
     }'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai


client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "what color is red"}
    ],
    logit_bias={12481: 100},
    extra_body={"timeout": 1} # 👈 KEY CHANGE
)

print(response)
```
</TabItem>
</Tabs>

</TabItem>
</Tabs>


## 타임아웃 처리 테스트 {#testing-timeout-handling}

재시도/폴백 로직이 타임아웃을 처리할 수 있는지 테스트하려면 테스트용으로 `mock_timeout=True`를 설정할 수 있습니다.

현재는 `/chat/completions`와 `/completions` 엔드포인트에서만 지원됩니다. 다른 엔드포인트에도 필요하다면 [알려주세요](https://github.com/BerriAI/litellm/issues).

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer sk-1234' \
    --data-raw '{
        "model": "gemini/gemini-1.5-flash",
        "messages": [
        {"role": "user", "content": "hi my email is ishaan@berri.ai"}
        ],
        "mock_timeout": true # 👈 KEY CHANGE
    }'
```
