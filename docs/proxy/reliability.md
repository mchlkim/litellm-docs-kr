import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 폴백

호출이 num_retries 이후에도 실패하면 다른 모델 그룹으로 폴백합니다. 

- 빠른 시작 [부하 분산](./load_balancing.md)
- 빠른 시작 [클라이언트 측 폴백](#client-side-fallbacks)


폴백은 일반적으로 한 `model_name`에서 다른 `model_name`으로 수행됩니다. 

## 빠른 시작 

### 1. 폴백 설정

핵심 변경 사항: 

```python
fallbacks=[{"gpt-3.5-turbo": ["gpt-4"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 
router = Router(
  model_list=[
    {
      "model_name": "gpt-3.5-turbo",
      "litellm_params": {
        "model": "azure/<your-deployment-name>",
        "api_base": "<your-azure-endpoint>",
        "api_key": "<your-azure-api-key>",
        "rpm": 6
      }
    },
    {
      "model_name": "gpt-4",
      "litellm_params": {
        "model": "azure/gpt-4-ca",
        "api_base": "https://my-endpoint-canada-berri992.openai.azure.com/",
        "api_key": "<your-azure-api-key>",
        "rpm": 6
      }
    }
  ],
  fallbacks=[{"gpt-3.5-turbo": ["gpt-4"]}] # 👈 KEY CHANGE
)

```

</TabItem>
<TabItem value="proxy" label="Proxy">


```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/<your-deployment-name>
      api_base: <your-azure-endpoint>
      api_key: <your-azure-api-key>
      rpm: 6      # Rate limit for this deployment: in requests per minute (rpm)
  - model_name: gpt-4
    litellm_params:
      model: azure/gpt-4-ca
      api_base: https://my-endpoint-canada-berri992.openai.azure.com/
      api_key: <your-azure-api-key>
      rpm: 6

router_settings:
  fallbacks: [{"gpt-3.5-turbo": ["gpt-4"]}]
```


</TabItem>
</Tabs>


### 2. Proxy 시작

```bash
litellm --config /path/to/config.yaml
```

### 3. 폴백 테스트

폴백을 트리거하려면 요청 본문에 `mock_testing_fallbacks=true`를 전달합니다.

<Tabs>
<TabItem value="sdk" label="SDK">


```python

from litellm import Router

model_list = [{..}, {..}] # defined in Step 1.

router = Router(model_list=model_list, fallbacks=[{"bad-model": ["my-good-model"]}])

response = router.completion(
  model="bad-model",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
  mock_testing_fallbacks=True,
)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "my-bad-model",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_fallbacks": true # 👈 KEY CHANGE
}
'
```

</TabItem>
</Tabs>




### 설명

폴백은 순서대로 수행됩니다. ["gpt-3.5-turbo, "gpt-4", "gpt-4-32k"]는 먼저 'gpt-3.5-turbo'를 시도한 다음 'gpt-4'를 시도하는 방식입니다.

특정 모델 그룹이 잘못 설정되었거나 문제가 있는 경우를 대비해 [`default_fallbacks`](#default-fallbacks)도 설정할 수 있습니다.

폴백에는 3가지 유형이 있습니다. 
- `content_policy_fallbacks`: litellm.ContentPolicyViolationError용입니다. LiteLLM은 프로바이더 전반의 콘텐츠 정책 위반 오류를 매핑합니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/89a43c872a1e3084519fb9de159bf52f5447c6c4/litellm/utils.py#L8495C27-L8495C54)
- `context_window_fallbacks`: litellm.ContextWindowExceededErrors용입니다. LiteLLM은 프로바이더 전반의 컨텍스트 창 오류 메시지를 매핑합니다. [**코드 보기**](https://github.com/BerriAI/litellm/blob/89a43c872a1e3084519fb9de159bf52f5447c6c4/litellm/utils.py#L8469)
- `fallbacks`: 나머지 모든 오류용입니다. 예: litellm.RateLimitError


## 클라이언트 측 폴백 {#client-side-fallbacks}

SDK에서는 `.completion()` 호출에, Proxy에서는 클라이언트 측 요청에 폴백을 설정합니다. 

이 요청에서는 다음이 발생합니다.
1. `model="zephyr-beta"` 요청이 실패합니다.
2. litellm proxy가 `fallbacks=["gpt-3.5-turbo"]`에 지정된 모든 model_groups를 순회합니다.
3. `model="gpt-3.5-turbo"` 요청이 성공하고, 요청한 클라이언트는 gpt-3.5-turbo의 응답을 받습니다. 

👉 핵심 변경 사항: `"fallbacks": ["gpt-3.5-turbo"]`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

router = Router(model_list=[..]) # defined in Step 1.

resp = router.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hey, how's it going?"}],
    mock_testing_fallbacks=True, # 👈 trigger fallbacks
    fallbacks=[
        {
            "model": "claude-3-haiku",
            "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        }
    ],
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="zephyr-beta",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
        "fallbacks": ["gpt-3.5-turbo"]
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "zephyr-beta"",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "fallbacks": ["gpt-3.5-turbo"]
}'
```
</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
import os 

os.environ["OPENAI_API_KEY"] = "anything"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="zephyr-beta",
    extra_body={
        "fallbacks": ["gpt-3.5-turbo"]
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>

</Tabs>
</TabItem>

</Tabs>

### 폴백 프롬프트 제어  

폴백의 모델별로 messages/temperature 등을 전달합니다(embedding/image generation 등에서도 작동).

핵심 변경 사항:

```
fallbacks = [
  {
    "model": <model_name>,
    "messages": <model-specific-messages>
    ... # any other model-specific parameters
  }
]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router

router = Router(model_list=[..]) # defined in Step 1.

resp = router.completion(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hey, how's it going?"}],
    mock_testing_fallbacks=True, # 👈 trigger fallbacks
    fallbacks=[
        {
            "model": "claude-3-haiku",
            "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        }
    ],
)

print(resp)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="zephyr-beta",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    extra_body={
      "fallbacks": [{
          "model": "claude-3-haiku",
          "messages": [{"role": "user", "content": "What is LiteLLM?"}]
      }]
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl 요청">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Hi, how are you ?"
          }
        ]
      }
    ],
    "fallbacks": [{
        "model": "claude-3-haiku",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}]
    }],
    "mock_testing_fallbacks": true
}'
```

</TabItem>
<TabItem value="langchain" label="Langchain">

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
import os 

os.environ["OPENAI_API_KEY"] = "anything"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="zephyr-beta",
    extra_body={
      "fallbacks": [{
          "model": "claude-3-haiku",
          "messages": [{"role": "user", "content": "What is LiteLLM?"}]
      }]
    }
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]
response = chat(messages)

print(response)
```

</TabItem>

</Tabs>

</TabItem>
</Tabs>

## 콘텐츠 정책 위반 폴백

핵심 변경 사항: 

```python
content_policy_fallbacks=[{"claude-2": ["my-fallback-model"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

router = Router(
  model_list=[
    {
      "model_name": "claude-2",
      "litellm_params": {
        "model": "claude-2",
        "api_key": "",
        "mock_response": Exception("content filtering policy"),
      },
    },
    {
      "model_name": "my-fallback-model",
      "litellm_params": {
        "model": "claude-2",
        "api_key": "",
        "mock_response": "This works!",
      },
    },
  ],
  content_policy_fallbacks=[{"claude-2": ["my-fallback-model"]}], # 👈 KEY CHANGE
  # fallbacks=[..], # [OPTIONAL]
  # context_window_fallbacks=[..], # [OPTIONAL]
)

response = router.completion(
  model="claude-2",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

proxy config.yaml에 다음 줄만 추가합니다. 👇

```yaml
router_settings:
  content_policy_fallbacks=[{"claude-2": ["my-fallback-model"]}]
```

proxy 시작 

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

## 컨텍스트 창 초과 폴백

핵심 변경 사항: 

```python
context_window_fallbacks=[{"claude-2": ["my-fallback-model"]}]
```

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import Router 

router = Router(
  model_list=[
    {
      "model_name": "claude-2",
      "litellm_params": {
        "model": "claude-2",
        "api_key": "",
        "mock_response": Exception("prompt is too long"),
      },
    },
    {
      "model_name": "my-fallback-model",
      "litellm_params": {
        "model": "claude-2",
        "api_key": "",
        "mock_response": "This works!",
      },
    },
  ],
  context_window_fallbacks=[{"claude-2": ["my-fallback-model"]}], # 👈 KEY CHANGE
  # fallbacks=[..], # [OPTIONAL]
  # content_policy_fallbacks=[..], # [OPTIONAL]
)

response = router.completion(
  model="claude-2",
  messages=[{"role": "user", "content": "Hey, how's it going?"}],
)
```
</TabItem>
<TabItem value="proxy" label="Proxy">

proxy config.yaml에 다음 줄만 추가합니다. 👇

```yaml
router_settings:
  context_window_fallbacks=[{"claude-2": ["my-fallback-model"]}]
```

proxy 시작 

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

</TabItem>
</Tabs>

## 고급
### 폴백 + 재시도 + 타임아웃 + 쿨다운

폴백을 설정하려면 다음처럼 지정하면 됩니다. 

```
litellm_settings:
  fallbacks: [{"zephyr-beta": ["gpt-3.5-turbo"]}] 
```

**모든 오류(429, 500 등)에 적용됩니다.**

**config로 설정**
```yaml
model_list:
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8001
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8002
  - model_name: zephyr-beta
    litellm_params:
        model: huggingface/HuggingFaceH4/zephyr-7b-beta
        api_base: http://0.0.0.0:8003
  - model_name: gpt-3.5-turbo
    litellm_params:
        model: gpt-3.5-turbo
        api_key: <my-openai-key>
  - model_name: gpt-3.5-turbo-16k
    litellm_params:
        model: gpt-3.5-turbo-16k
        api_key: <my-openai-key>

litellm_settings:
  num_retries: 3 # retry call 3 times on each model_name (e.g. zephyr-beta)
  request_timeout: 10 # raise Timeout error if call takes longer than 10s. Sets litellm.request_timeout 
  fallbacks: [{"zephyr-beta": ["gpt-3.5-turbo"]}] # fallback to gpt-3.5-turbo if call fails num_retries 
  allowed_fails: 3 # cooldown model if it fails > 1 call in a minute. 
  cooldown_time: 30 # how long to cooldown model if fails/min > allowed_fails
```

### 특정 모델 ID로 폴백

그룹의 모든 모델이 쿨다운 상태(예: 속도 제한)인 경우 LiteLLM은 특정 모델 ID가 있는 모델로 폴백합니다.

이 경우 폴백 모델에 대한 쿨다운 검사를 건너뜁니다.

1. `model_info`에 모델 ID 지정
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
    model_info:
      id: my-specific-model-id # 👈 KEY CHANGE
  - model_name: gpt-4
    litellm_params:
      model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
  - model_name: anthropic-claude
    litellm_params:
      model: anthropic/claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY
```

**참고:** 이 설정은 특정 모델 ID가 있는 모델로만 폴백합니다. 다른 모델 그룹으로 폴백하려면 `fallbacks=[{"gpt-4": ["anthropic-claude"]}]`를 설정할 수 있습니다.

2. config에 폴백 설정

```yaml
litellm_settings:
  fallbacks: [{"gpt-4": ["my-specific-model-id"]}]
```

3. 테스트합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_fallbacks": true
}'
```

응답 헤더 `x-litellm-model-id`를 확인해 정상 동작을 검증합니다.

```bash
x-litellm-model-id: my-specific-model-id
```

### 폴백 테스트 

폴백이 예상대로 작동하는지 확인합니다. 

#### **일반 폴백**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "my-bad-model",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_fallbacks": true # 👈 KEY CHANGE
}
'
```


#### **콘텐츠 정책 폴백**
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "my-bad-model",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_content_policy_fallbacks": true # 👈 KEY CHANGE
}
'
```

#### **컨텍스트 창 폴백**

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
  "model": "my-bad-model",
  "messages": [
    {
      "role": "user",
      "content": "ping"
    }
  ],
  "mock_testing_context_window_fallbacks": true # 👈 KEY CHANGE
}
'
```


### 컨텍스트 창 폴백(사전 호출 검사 + 폴백) {#advanced---context-window-fallbacks}

**호출이 이루어지기 전에** **`enable_pre_call_checks: true`**로 호출이 모델 컨텍스트 창 안에 있는지 확인합니다.

[**코드 보기**](https://github.com/BerriAI/litellm/blob/c9e6b05cfb20dfb17272218e2555d6b496c47f6f/litellm/router.py#L2163)

:::important
컨텍스트 창을 강제하려면 **`enable_pre_call_checks`가 필요합니다**. 이 설정이 없으면 입력 토큰 수와 관계없이 요청이 프로바이더로 전송됩니다. config의 `router_settings`에 `enable_pre_call_checks: true`를 설정하세요.
:::

#### 배포별 사용자 지정 max_input_tokens

`model_info`에 `max_input_tokens`를 설정해 배포의 기본 컨텍스트 제한을 재정의할 수 있습니다. 테스트, 긴 프롬프트의 속도 제한, 또는 프로바이더 기본값보다 더 엄격한 제한을 강제할 때 유용합니다.

다음 **두 가지가 모두** 필요합니다.

1. **`router_settings.enable_pre_call_checks: true`** - 사전 호출 검사를 활성화합니다.
2. 배포의 **`model_info.max_input_tokens`** - 해당 모델의 제한을 재정의합니다.

```yaml
router_settings:
  enable_pre_call_checks: true  # Required for enforcement

model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      max_input_tokens: 10  # Override: reject prompts > 10 tokens
```

요청이 제한을 초과하면 LiteLLM은 `Model=gpt-4o, Max Input Tokens=10, Got=306` 같은 세부 정보와 함께 `ContextWindowExceededError`를 발생시킵니다.

**1. config 설정**

azure 배포에서는 기본 모델을 설정합니다. [이 목록](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에서 기본 모델을 선택하세요. 모든 azure 모델은 azure/로 시작합니다.


<Tabs>
<TabItem value="same-group" label="같은 그룹">

컨텍스트 창이 더 작은 모델의 이전 인스턴스(예: gpt-3.5-turbo)를 필터링합니다.

```yaml
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
    model: azure/chatgpt-v-2
    api_base: os.environ/AZURE_API_BASE
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-07-01-preview"
    model_info:
    base_model: azure/gpt-4-1106-preview # 2. 👈 (azure-only) SET BASE MODEL

  - model_name: gpt-3.5-turbo
    litellm_params:
    model: gpt-3.5-turbo-1106
    api_key: os.environ/OPENAI_API_KEY
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 테스트합니다.**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

text = "What is the meaning of 42?" * 5000

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
      {"role": "system", "content": text},
      {"role": "user", "content": "Who was Alexander?"},
    ],
)

print(response)
```

</TabItem>

<TabItem value="different-group" label="컨텍스트 창 폴백(다른 그룹)">

현재 모델이 너무 작으면 더 큰 모델로 폴백합니다.

```yaml
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
  - model_name: gpt-3.5-turbo-small
    litellm_params:
    model: azure/chatgpt-v-2
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
      model_info:
      base_model: azure/gpt-4-1106-preview # 2. 👈 (azure-only) SET BASE MODEL

  - model_name: gpt-3.5-turbo-large
    litellm_params:
      model: gpt-3.5-turbo-1106
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-opus
    litellm_params:
      model: claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  context_window_fallbacks: [{"gpt-3.5-turbo-small": ["gpt-3.5-turbo-large", "claude-opus"]}]
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 테스트합니다.**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

text = "What is the meaning of 42?" * 5000

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages = [
      {"role": "system", "content": text},
      {"role": "user", "content": "Who was Alexander?"},
    ],
)

print(response)
```

</TabItem>
</Tabs>


### 콘텐츠 정책 폴백

콘텐츠 정책 위반 오류가 발생하면 프로바이더 간(예: Azure OpenAI에서 Anthropic으로) 폴백합니다. 

```yaml
model_list:
  - model_name: gpt-3.5-turbo-small
    litellm_params:
    model: azure/chatgpt-v-2
        api_base: os.environ/AZURE_API_BASE
        api_key: os.environ/AZURE_API_KEY
        api_version: "2023-07-01-preview"

    - model_name: claude-opus
      litellm_params:
        model: claude-3-opus-20240229
        api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  content_policy_fallbacks: [{"gpt-3.5-turbo-small": ["claude-opus"]}]
```



### 기본 폴백 {#default-fallbacks}

특정 모델 그룹이 잘못 설정되었거나 문제가 있는 경우를 대비해 default_fallbacks도 설정할 수 있습니다.


```yaml
model_list:
  - model_name: gpt-3.5-turbo-small
    litellm_params:
    model: azure/chatgpt-v-2
        api_base: os.environ/AZURE_API_BASE
        api_key: os.environ/AZURE_API_KEY
        api_version: "2023-07-01-preview"

    - model_name: claude-opus
      litellm_params:
        model: claude-3-opus-20240229
        api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  default_fallbacks: ["claude-opus"]
```

이렇게 하면 어떤 모델이든 실패할 때 기본적으로 claude-opus를 사용합니다.

모델별 폴백(예: `{"gpt-3.5-turbo-small": ["claude-opus"]}`)은 기본 폴백보다 우선합니다.

### EU 리전 필터링(사전 호출 검사)

**호출이 이루어지기 전에** **`enable_pre_call_checks: true`**로 호출이 모델 컨텍스트 창 안에 있는지 확인합니다.

배포의 'region_name'을 설정합니다. 

**참고:** LiteLLM은 litellm params를 기반으로 Vertex AI, Bedrock, IBM WatsonxAI의 region_name을 자동 추론할 수 있습니다. Azure의 경우 `litellm.enable_preview = True`를 설정하세요.

**1. config 설정**

```yaml
router_settings:
  enable_pre_call_checks: true # 1. Enable pre-call checks

model_list:
- model_name: gpt-3.5-turbo
  litellm_params:
    model: azure/chatgpt-v-2
    api_base: os.environ/AZURE_API_BASE
    api_key: os.environ/AZURE_API_KEY
    api_version: "2023-07-01-preview"
    region_name: "eu" # 👈 SET EU-REGION

- model_name: gpt-3.5-turbo
  litellm_params:
    model: gpt-3.5-turbo-1106
    api_key: os.environ/OPENAI_API_KEY

- model_name: gemini-pro
  litellm_params:
    model: vertex_ai/gemini-pro-1.5
    vertex_project: adroit-crow-1234
    vertex_location: us-east1 # 👈 AUTOMATICALLY INFERS 'region_name'
```

**2. proxy 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. 테스트합니다.**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.with_raw_response.create(
    model="gpt-3.5-turbo",
    messages = [{"role": "user", "content": "Who was Alexander?"}]
)

print(response)

print(f"response.headers.get('x-litellm-model-api-base')")
```

### 와일드카드 모델에 폴백 설정

config 파일에서 와일드카드 모델(예: `azure/*`)에 대한 폴백을 설정할 수 있습니다.

1. config 설정
```yaml
model_list:
  - model_name: "gpt-4o"
    litellm_params:
      model: "openai/gpt-4o"
      api_key: os.environ/OPENAI_API_KEY
  - model_name: "azure/*"
    litellm_params:
      model: "azure/*"
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE

litellm_settings:
  fallbacks: [{"gpt-4o": ["azure/gpt-4o"]}]
```

2. Proxy 시작
```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [    
          {
            "type": "text",
            "text": "what color is red"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "mock_testing_fallbacks": true
}'
```

### 폴백 비활성화(요청/키별)


<Tabs>

<TabItem value="request" label="요청별">

요청 본문에 `disable_fallbacks: true`를 설정해 요청별로 폴백을 비활성화할 수 있습니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": "List 5 important events in the XIX century"
        }
    ],
    "model": "gpt-3.5-turbo",
    "disable_fallbacks": true # 👈 DISABLE FALLBACKS
}'
```

</TabItem>

<TabItem value="key" label="키별">

키 metadata에 `disable_fallbacks: true`를 설정해 키별로 폴백을 비활성화할 수 있습니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "metadata": {
        "disable_fallbacks": true
    }
}'
```

</TabItem>
</Tabs>
