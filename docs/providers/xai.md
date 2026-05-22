import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# xAI

https://docs.x.ai/docs

:::tip

**We support ALL xAI models, just set `model=xai/<any-model-on-xai>` as a prefix when sending litellm requests**

:::

## Supported 모델



**최신 릴리즈** - Grok 4.1 Fast: 2M context와 prompt caching을 제공하며 고성능 agentic tool calling에 최적화되어 있습니다.

| Model | Context | Features |
|-------|---------|----------|
| `xai/grok-4-1-fast-reasoning` | 2M tokens | **Reasoning**, Function calling, Vision, Audio, Web search, 캐싱 |
| `xai/grok-4-1-fast-non-reasoning` | 2M tokens | Function calling, Vision, Audio, Web search, 캐싱 |

**언제 사용하나요:**
- ✅ **Reasoning model**: 복잡한 분석, 계획, 다단계 reasoning 문제
- ✅ **Non-reasoning model**: 단순 query, 더 빠른 응답, 더 낮은 token 사용량

**예제:**
```python
from litellm import completion

# With reasoning
response = completion(
    model="xai/grok-4-1-fast-reasoning",
    messages=[{"role": "user", "content": "Analyze this problem step by step..."}]
)

# Without reasoning
response = completion(
    model="xai/grok-4-1-fast-non-reasoning",
    messages=[{"role": "user", "content": "What's 2+2?"}]
)
```

---

### 사용 가능한 모든 모델 {#all-available-models}

| Model Family | Model | Context | Features |
|--------------|-------|---------|----------|
| **Grok 4.1** | `xai/grok-4-1-fast-reasoning` | 2M | **Reasoning**, Tools, Vision, Audio, Web search, 캐싱 |
| | `xai/grok-4-1-fast-non-reasoning` | 2M | Tools, Vision, Audio, Web search, 캐싱 |
| **Grok 4** | `xai/grok-4` | 256K | Tools, Web search |
| | `xai/grok-4-0709` | 256K | Tools, Web search |
| | `xai/grok-4-fast-reasoning` | 2M | **Reasoning**, Tools, Web search |
| | `xai/grok-4-fast-non-reasoning` | 2M | Tools, Web search |
| **Grok 3** | `xai/grok-3` | 131K | Tools, Web search |
| | `xai/grok-3-mini` | 131K | Tools, Web search |
| | `xai/grok-3-fast-beta` | 131K | Tools, Web search |
| **Grok Code** | `xai/grok-code-fast` | 256K | **Reasoning**, Tools, Code generation, 캐싱 |
| **Grok 2** | `xai/grok-2` | 131K | Tools, **Vision** |
| | `xai/grok-2-vision-latest` | 32K | Tools, **Vision** |

**기능:**
- **Reasoning** = `reasoning token`을 사용하는 chain-of-thought 추론
- **Tools** = function calling / tool 사용
- **Web search** = 실시간 internet search
- **Vision** = 이미지 이해
- **Audio** = audio input 지원
- **캐싱** = 비용 절감을 위한 prompt caching
- **Code generation** = 코드 작업에 최적화

**가격:** 현재 요금은 [xAI pricing page](https://docs.x.ai/docs/models)를 참고하세요.

## API Key {#api-key}
```python
# env variable
os.environ['XAI_API_KEY']
```

## 샘플 사용법 {#sample-usage}

```python showLineNumbers title="LiteLLM python sdk usage - Non-streaming"
from litellm import completion
import os

os.environ['XAI_API_KEY'] = ""
response = completion(
    model="xai/grok-3-mini-beta",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)
print(response)
```

## 샘플 사용법 - Streaming {#sample-usage---streaming}

```python showLineNumbers title="LiteLLM python sdk usage - Streaming"
from litellm import completion
import os

os.environ['XAI_API_KEY'] = ""
response = completion(
    model="xai/grok-3-mini-beta",
    messages=[
        {
            "role": "user",
            "content": "What's the weather like in Boston today in Fahrenheit?",
        }
    ],
    stream=True,
    max_tokens=10,
    response_format={ "type": "json_object" },
    seed=123,
    stop=["\n\n"],
    temperature=0.2,
    top_p=0.9,
    tool_choice="auto",
    tools=[],
    user="user",
)

for chunk in response:
    print(chunk)
```

## 샘플 사용법 - Vision {#sample-usage---vision}

```python showLineNumbers title="LiteLLM python sdk usage - Vision"
import os 
from litellm import completion

os.environ["XAI_API_KEY"] = "your-api-key"

response = completion(
    model="xai/grok-2-vision-latest",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png",
                        "detail": "high",
                    },
                },
                {
                    "type": "text",
                    "text": "What's in this image?",
                },
            ],
        },
    ],
)
```

## LiteLLM Proxy Server 사용법 {#usage-with-litellm-proxy-server}

LiteLLM Proxy Server로 XAI 모델을 호출하는 방법입니다.

1. config.yaml 수정

  ```yaml showLineNumbers
  model_list:
    - model_name: my-model
      litellm_params:
        model: xai/<your-model-name>  # add xai/ prefix to route as XAI provider
        api_key: api-key                 # api key to send your model
  ```


2. 프록시 시작 

  ```bash
  $ litellm --config /path/to/config.yaml
  ```

3. LiteLLM Proxy Server로 요청 전송

  <Tabs>

  <TabItem value="openai" label="OpenAI Python v1.0.0+">

  ```python showLineNumbers
  import openai
  client = openai.OpenAI(
      api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
      base_url="http://0.0.0.0:4000" # litellm-proxy-base url
  )

  response = client.chat.completions.create(
      model="my-model",
      messages = [
          {
              "role": "user",
              "content": "what llm are you"
          }
      ],
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
      "model": "my-model",
      "messages": [
          {
          "role": "user",
          "content": "what llm are you"
          }
      ],
  }'
  ```
  </TabItem>

  </Tabs>


## Reasoning 사용법

LiteLLM은 xAI 모델의 reasoning 사용을 지원합니다.

<Tabs>

<TabItem value="python" label="LiteLLM Python SDK">

```python showLineNumbers title="reasoning with xai/grok-3-mini-beta"
import litellm
response = litellm.completion(
    model="xai/grok-3-mini-beta",
    messages=[{"role": "user", "content": "What is 101*3?"}],
    reasoning_effort="low",
)

print("Reasoning Content:")
print(response.choices[0].message.reasoning_content)

print("\nFinal Response:")
print(completion.choices[0].message.content)

print("\nNumber of completion tokens (input):")
print(completion.usage.completion_tokens)

print("\nNumber of reasoning tokens (input):")
print(completion.usage.completion_tokens_details.reasoning_tokens)
```
</TabItem>

<TabItem value="curl" label="LiteLLM Proxy - OpenAI SDK 사용법">

```python showLineNumbers title="reasoning with xai/grok-3-mini-beta"
import openai
client = openai.OpenAI(
    api_key="sk-1234",             # pass litellm proxy key, if you're using virtual keys
    base_url="http://0.0.0.0:4000" # litellm-proxy-base url
)

response = client.chat.completions.create(
    model="xai/grok-3-mini-beta",
    messages=[{"role": "user", "content": "What is 101*3?"}],
    reasoning_effort="low",
)

print("Reasoning Content:")
print(response.choices[0].message.reasoning_content)

print("\nFinal Response:")
print(completion.choices[0].message.content)

print("\nNumber of completion tokens (input):")
print(completion.usage.completion_tokens)

print("\nNumber of reasoning tokens (input):")
print(completion.usage.completion_tokens_details.reasoning_tokens)
```

</TabItem>
</Tabs>

**예제 Response:**

```shell
Reasoning Content:
Let me calculate 101 multiplied by 3:
101 * 3 = 303.
I can double-check that: 100 * 3 is 300, and 1 * 3 is 3, so 300 + 3 = 303. Yes, that's correct.

Final Response:
The result of 101 multiplied by 3 is 303.

Number of completion tokens (input):
14

Number of reasoning tokens (input):
310
```
