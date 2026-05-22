import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lago - 사용량 기반 과금 {#lago---usage-based-billing}

[Lago](https://www.getlago.com/)는 셀프 호스팅 및 클라우드 환경에서 사용할 수 있는 미터링 및 사용량 기반 과금 솔루션을 제공합니다.

<Image img={require('../../img/lago.jpeg')} />

## 빠른 시작
단 한 줄의 코드로 **모든 제공자**의 응답을 Lago에 즉시 로깅할 수 있습니다.

Lago [API 키](https://docs.getlago.com/guide/self-hosted/docker#find-your-api-key)를 발급받으세요.

```python
litellm.callbacks = ["lago"] # logs cost + usage of successful calls to lago
```


<Tabs>
<TabItem value="sdk" label="SDK">

```python
# uv add lago 
import litellm
import os

os.environ["LAGO_API_BASE"] = "" # http://0.0.0.0:3000
os.environ["LAGO_API_KEY"] = ""
os.environ["LAGO_API_EVENT_CODE"] = "" # The billable metric's code - https://docs.getlago.com/guide/events/ingesting-usage#define-a-billable-metric

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set lago as a callback, litellm will send the data to lago
litellm.success_callback = ["lago"] 
 
# openai call
response = litellm.completion(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hi 👋 - i'm openai"}
  ],
  user="your_customer_id" # 👈 SET YOUR CUSTOMER ID HERE
)
```

</TabItem>
<TabItem value="proxy" label="프록시">

1. Config.yaml에 추가합니다.
```yaml
model_list:
- litellm_params:
    api_base: https://openai-function-calling-workers.tasslexyz.workers.dev/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["lago"] # 👈 KEY CHANGE
```

2. Proxy를 시작합니다.

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ],
      "user": "your-customer-id" # 👈 SET YOUR CUSTOMER ID
    }
'
```
</TabItem>
<TabItem value="openai_python" label="OpenAI Python SDK">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="gpt-3.5-turbo", messages = [
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
    model = "gpt-3.5-turbo",
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
</Tabs>


<Image img={require('../../img/lago_2.png')} />

## 고급 - Lago 로깅 객체 {#advanced---lagos-logging-object}

LiteLLM이 Lago에 로깅하는 객체는 다음과 같습니다.

```
{
    "event": {
      "transaction_id": "<generated_unique_id>",
      "external_customer_id": <litellm_end_user_id>, # passed via `user` param in /chat/completion call - https://platform.openai.com/docs/api-reference/chat/create
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
