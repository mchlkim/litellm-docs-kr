import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bytez

LiteLLM은 [Bytez](https://www.bytez.com)의 모든 채팅 모델을 지원합니다!

즉, 멀티모달 모델도 지원됩니다 🔥

지원되는 작업: `chat`, `image-text-to-text`, `audio-text-to-text`, `video-text-to-text`

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

### API 키 {#api-keys}

```py
import os
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_GOES_HERE"
```

### 예제 호출 {#예제-call}

```py
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_GOES_HERE"

response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml에 모델을 추가합니다.

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
```

2. 프록시 시작

```bash
$ BYTEZ_API_KEY=YOUR_BYTEZ_API_KEY_HERE litellm --config /path/to/config.yaml --debug
```

3. LiteLLM Proxy Server로 요청을 보냅니다.

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

```py
import openai
client = openai.OpenAI(
    api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000" # litellm-proxy-base url
)

response = client.chat.completions.create(
    model="gemma-3",
    messages = [
      {
          "role": "system",
          "content": "Be a good human!"
      },
      {
          "role": "user",
          "content": "What do you know about earth?"
      }
  ]
)

print(response)
```

  </TabItem>

  <TabItem value="curl" label="curl">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gemma-3",
    "messages": [
      {
          "role": "system",
          "content": "Be a good human!"
      },
      {
          "role": "user",
          "content": "What do you know about earth?"
      }
      ],
}'
```

  </TabItem>

  </Tabs>

</TabItem>

</Tabs>

## 자동 Prompt Template 처리 {#automatic-prompt-template-handling}

messages 목록을 보내면 모든 prompt formatting은 API에서 자동으로 처리됩니다!

custom formatting을 사용하려면 [help@bytez.com](mailto:help@bytez.com) 또는 [Discord](https://discord.com/invite/Z723PfCFWf)로 알려주세요. 제공할 수 있도록 지원하겠습니다!

## 추가 params 전달 - max_tokens, temperature {#passing-additional-params---max_tokens-temperature}

litellm.completion이 지원하는 모든 params는 [여기](https://docs.litellm.ai/docs/completion/input)에서 확인할 수 있습니다.

```py
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_HERE"

# bytez gemma-3 call
response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    max_tokens=20,
    temperature=0.5
)
```

**proxy**

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
      max_tokens: 20
      temperature: 0.5
```

## Bytez 전용 params 전달 {#passing-bytez-specific-params}

huggingface에서 지원하는 모든 kwarg도 지원합니다! 단, 해당 모델이 지원해야 합니다.

예제 `repetition_penalty`

```py
# !uv add litellm
from litellm import completion
import os
## set ENV variables
os.environ["BYTEZ_API_KEY"] = "YOUR_BYTEZ_KEY_HERE"

# bytez llama3 call with additional params
response = completion(
    model="bytez/google/gemma-3-4b-it",
    messages = [{ "content": "Hello, how are you?","role": "user"}],
    repetition_penalty=1.2,
)
```

**proxy**

```yaml
model_list:
  - model_name: gemma-3
    litellm_params:
      model: bytez/google/gemma-3-4b-it
      api_key: os.environ/BYTEZ_API_KEY
      repetition_penalty: 1.2
```
