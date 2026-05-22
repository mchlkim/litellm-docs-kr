import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI (텍스트 완성) {#openai-text-completion}

LiteLLM은 OpenAI 텍스트 완성 모델을 지원합니다.

### 필수 API 키 {#required-api-keys}

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 사용법 {#usage}
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "gpt-3.5-turbo-instruct", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

### 사용법 - LiteLLM Proxy Server {#usage-litellm-proxy-server}

LiteLLM Proxy Server로 OpenAI 모델을 호출하는 방법은 다음과 같습니다.

### 1. 환경에 키 저장 {#1-save-key-in-your-environment}

```bash
export OPENAI_API_KEY=""
```

### 2. 프록시 시작 {#2-start-the-proxy}

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo                          # The `openai/` prefix will call openai.chat.completions.create
      api_key: os.environ/OPENAI_API_KEY
  - model_name: gpt-3.5-turbo-instruct
    litellm_params:
      model: text-completion-openai/gpt-3.5-turbo-instruct # The `text-completion-openai/` prefix will call openai.completions.create
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="config-*" label="config.yaml - proxy all OpenAI models">

하나의 API Key로 모든 OpenAI 모델을 추가하려면 이것을 사용하세요. **경고: 이 방식은 로드 밸런싱을 수행하지 않습니다.**
즉, `gpt-4`, `gpt-3.5-turbo`, `gpt-4-turbo-preview` 요청이 모두 이 경로를 통해 처리됩니다.

```yaml
model_list:
  - model_name: "*"             # all requests where model not in your config go to this deployment
    litellm_params:
      model: openai/*           # set `openai/` to use the openai route
      api_key: os.environ/OPENAI_API_KEY
```
</TabItem>
<TabItem value="cli" label="CLI">

```bash
$ litellm --model gpt-3.5-turbo-instruct

# Server running on http://0.0.0.0:4000
```
</TabItem>

</Tabs>

### 3. 테스트 {#3-test-it}


<Tabs>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "gpt-3.5-turbo-instruct",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-3.5-turbo-instruct", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)

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

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000", # set openai_api_base to the LiteLLM Proxy
    model = "gpt-3.5-turbo-instruct",
    temperature=0.1
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


## OpenAI 텍스트 완성 모델 / Instruct 모델 {#openai-text-completion-models--instruct-models}

| 모델 이름          | 함수 호출                                      |
|---------------------|----------------------------------------------------|
| `gpt-3.5-turbo-instruct` | `response = completion(model="gpt-3.5-turbo-instruct", messages=messages)` |
| `gpt-3.5-turbo-instruct-0914` | `response = completion(model="gpt-3.5-turbo-instruct-0914", messages=messages)` |
| `text-davinci-003`    | `response = completion(model="text-davinci-003", messages=messages)` |
| `ada-001`             | `response = completion(model="ada-001", messages=messages)` |
| `curie-001`           | `response = completion(model="curie-001", messages=messages)` |
| `babbage-001`         | `response = completion(model="babbage-001", messages=messages)` |
| `babbage-002`         | `response = completion(model="babbage-002", messages=messages)` |
| `davinci-002`         | `response = completion(model="davinci-002", messages=messages)` |
