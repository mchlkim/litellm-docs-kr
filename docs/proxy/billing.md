import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 청구 {#billing}

내부 팀과 외부 고객에게 사용량 기준으로 청구합니다.

**🚨 요구 사항**
- 사용량 기반 청구를 위해 [Lago 설정](https://docs.getlago.com/guide/self-hosted/docker#run-the-app)을 완료하세요. [Stripe 튜토리얼](https://docs.getlago.com/templates/per-transaction/stripe#step-1-create-billable-metrics-for-transaction)을 따르는 것을 권장합니다.

단계:
- 프록시를 Lago에 연결합니다.
- 청구할 ID를 설정합니다(고객, 내부 사용자, 팀).
- 시작합니다!

## 빠른 시작 {#quick-start}

내부 팀에게 사용량 기준으로 청구합니다.

### 1. 프록시를 Lago에 연결 {#1-connect-proxy-to-lago}

프록시 config.yaml에서 'lago'를 콜백으로 설정합니다.

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["lago"] # 👈 KEY CHANGE

general_settings:
  master_key: sk-1234
```

환경에 Lago 키를 추가합니다.

```bash
export LAGO_API_BASE="http://localhost:3000" # self-host - https://docs.getlago.com/guide/self-hosted/docker#run-the-app
export LAGO_API_KEY="3e29d607-de54-49aa-a019-ecf585729070" # Get key - https://docs.getlago.com/guide/self-hosted/docker#find-your-api-key
export LAGO_API_EVENT_CODE="openai_tokens" # name of lago billing code
export LAGO_API_CHARGE_BY="team_id" # 👈 Charges 'team_id' attached to proxy key
```

프록시를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

### 2. 내부 팀용 키 생성 {#2-create-key-for-internal-team}

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer sk-1234' \
--header 'Content-Type: application/json' \
--data-raw '{"team_id": "my-unique-id"}' # 👈 Internal Team's ID
```

응답 객체:

```bash
{
  "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
}
```


### 3. 청구 시작 {#3-start-billing}

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer sk-tXL0wt5-lOOVK9sfY2UacA' \ # 👈 Team's Key
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
    }
'
```
</TabItem>
<TabItem value="openai_python" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="sk-tXL0wt5-lOOVK9sfY2UacA", # 👈 Team's Key
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-4o", messages = [
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
import os 

os.environ["OPENAI_API_KEY"] = "sk-tXL0wt5-lOOVK9sfY2UacA" # 👈 Team's Key

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "gpt-4o",
    temperature=0.1,
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

**Lago에서 결과 확인**


<Image img={require('../../img/lago_2.png')}  style={{ width: '500px', height: 'auto' }} />

## 고급 - Lago 로깅 객체 {#advanced-lago-logging-object}

LiteLLM이 Lago에 기록하는 내용은 다음과 같습니다.

```
{
    "event": {
      "transaction_id": "<generated_unique_id>",
      "external_customer_id": <selected_id>, # either 'end_user_id', 'user_id', or 'team_id'. Default 'end_user_id'. 
      "code": os.getenv("LAGO_API_EVENT_CODE"), 
      "properties": {
          "input_tokens": <number>,
          "output_tokens": <number>,
          "model": <string>,
          "response_cost": <number>, # 👈 LITELLM CALCULATED RESPONSE COST - https://github.com/BerriAI/litellm/blob/d43f75150a65f91f60dc2c0c9462ce3ffc713c1f/litellm/utils.py#L1473
      }
    }
}
```

## 고급 - 고객 및 내부 사용자 청구 {#advanced-bill-customers-internal-users}

대상:
- 고객(/chat/completion 호출에서 'user' 매개변수로 전달되는 id) = 'end_user_id'
- 내부 사용자([키 생성](https://docs.litellm.ai/docs/proxy/virtual_keys#advanced---spend-tracking) 시 설정되는 id) = 'user_id'
- 팀([키 생성](https://docs.litellm.ai/docs/proxy/virtual_keys#advanced---spend-tracking) 시 설정되는 id) = 'team_id'



<Tabs>
<TabItem value="customers" label="고객 청구">

1. 'LAGO_API_CHARGE_BY'를 'end_user_id'로 설정합니다.

  ```bash
  export LAGO_API_CHARGE_BY="end_user_id"
  ```

2. 테스트합니다.

  <Tabs>
  <TabItem value="curl" label="Curl">

  ```shell
  curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --data ' {
        "model": "gpt-4o",
        "messages": [
          {
            "role": "user",
            "content": "what llm are you"
          }
        ],
        "user": "my_customer_id" # 👈 whatever your customer id is
      }
  '
  ```
  </TabItem>
  <TabItem value="openai_sdk" label="OpenAI Python SDK">

  ```python
  import openai
  client = openai.OpenAI(
      api_key="anything",
      base_url="http://0.0.0.0:4000"
  )

  # request sent to model set on litellm proxy, `litellm --model`
  response = client.chat.completions.create(model="gpt-4o", messages = [
      {
          "role": "user",
          "content": "this is a test request, write a short poem"
      }
  ], user="my_customer_id") # 👈 whatever your customer id is

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
  import os 

  os.environ["OPENAI_API_KEY"] = "anything"

  chat = ChatOpenAI(
      openai_api_base="http://0.0.0.0:4000",
      model = "gpt-4o",
      temperature=0.1,
      extra_body={
          "user": "my_customer_id"  # 👈 whatever your customer id is
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
<TabItem value="users" label="내부 사용자 청구">

1. 'LAGO_API_CHARGE_BY'를 'user_id'로 설정합니다.

```bash
export LAGO_API_CHARGE_BY="user_id"
```

2. 해당 사용자용 키를 생성합니다.

```bash
curl 'http://0.0.0.0:4000/key/generate' \
--header 'Authorization: Bearer <your-master-key>' \
--header 'Content-Type: application/json' \
--data-raw '{"user_id": "my-unique-id"}' # 👈 Internal User's id
```

응답 객체:

```bash
{
  "key": "sk-tXL0wt5-lOOVK9sfY2UacA",
}
```

3. 해당 키로 API 호출을 수행합니다.

```python
import openai
client = openai.OpenAI(
    api_key="sk-tXL0wt5-lOOVK9sfY2UacA", # 👈 Generated key
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-4o", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
])

print(response)
```
</TabItem>
</Tabs>
