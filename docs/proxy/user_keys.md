import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Langchain, OpenAI SDK, LlamaIndex, Instructor, Curl 예제 {#langchain-openai-sdk-llamaindex-instructor-curl-examples}

LiteLLM Proxy는 **OpenAI-Compatible**이며 다음을 지원합니다.
* /chat/completions 
* /embeddings
* /completions 
* /image/generations 
* /moderations 
* /audio/transcriptions
* /audio/speech
* [Assistants API 엔드포인트](https://docs.litellm.ai/docs/assistants)
* [Batches API 엔드포인트](https://docs.litellm.ai/docs/batches)
* [Fine-Tuning API 엔드포인트](https://docs.litellm.ai/docs/fine_tuning)

LiteLLM Proxy는 **Azure OpenAI-compatible**입니다.
* /chat/completions
* /completions
* /embeddings 

LiteLLM Proxy는 **Anthropic-compatible**입니다.
* /messages 

LiteLLM Proxy는 **Vertex AI compatible**입니다.
- [모든 Vertex Endpoints 지원](../vertex_ai)

이 문서에서 다루는 내용은 다음과 같습니다.

*   /chat/completion
*   /embedding


아래는 **선별된 예제**입니다. LiteLLM Proxy는 **OpenAI-Compatible**이므로 OpenAI를 호출하는 모든 프로젝트에서 작동합니다. `base_url`, `api_key`, `model`만 변경하면 됩니다.

provider별 인자를 전달하려면 [여기](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)를 확인하세요.

지원되지 않는 파라미터를 제거하려면(예: librechat에서 bedrock에 사용하는 frequency_penalty) [여기](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)를 확인하세요.


:::info

**지원되는 모든 모델에서 Input, Output, Exceptions는 OpenAI 형식으로 매핑됩니다.**

:::

proxy로 요청을 보내고, metadata를 전달하며, 사용자가 자신의 OpenAI API key를 전달할 수 있게 하는 방법입니다.

## `/chat/completions`

### 요청 형식

<Tabs>


<TabItem value="openai" label="OpenAI Python v1.0.0+">

전달하려는 `metadata`에 `extra_body={"metadata": { }}`를 설정하세요.

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
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": { # 👈 use for logging additional params (e.g. to langfuse)
            "generation_name": "ishaan-generation-openai-client",
            "generation_id": "openai-client-gen-id22",
            "trace_id": "openai-client-trace-id22",
            "trace_user_id": "openai-client-user-id2"
        }
    }
)

print(response)
```
</TabItem>
<TabItem value="litellm_sdk" label="LiteLLM Python SDK">

<a href="../providers/litellm_proxy#send-all-sdk-requests-to-litellm-proxy"><strong>👉 LiteLLM Proxy provider 문서로 이동</strong></a>

</TabItem>
<TabItem value="azureopenai" label="AzureOpenAI Python">

전달하려는 `metadata`에 `extra_body={"metadata": { }}`를 설정하세요.

```python
import openai
client = openai.AzureOpenAI(
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
    extra_body={ # pass in any provider-specific param, if not supported by openai, https://docs.litellm.ai/docs/completion/input#provider-specific-params
        "metadata": { # 👈 use for logging additional params (e.g. to langfuse)
            "generation_name": "ishaan-generation-openai-client",
            "generation_id": "openai-client-gen-id22",
            "trace_id": "openai-client-trace-id22",
            "trace_user_id": "openai-client-user-id2"
        }
    }
)

print(response)
```
</TabItem>
<TabItem value="LlamaIndex" label="LlamaIndex">

```python
import os, dotenv

from llama_index.llms import AzureOpenAI
from llama_index.embeddings import AzureOpenAIEmbedding
from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext

llm = AzureOpenAI(
    engine="azure-gpt-3.5",               # model_name on litellm proxy
    temperature=0.0,
    azure_endpoint="http://0.0.0.0:4000", # litellm proxy endpoint
    api_key="sk-1234",                    # litellm proxy API Key
    api_version="2023-07-01-preview",
)

embed_model = AzureOpenAIEmbedding(
    deployment_name="azure-embedding-model",
    azure_endpoint="http://0.0.0.0:4000",
    api_key="sk-1234",
    api_version="2023-07-01-preview",
)


documents = SimpleDirectoryReader("llama_index_data").load_data()
service_context = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)
index = VectorStoreIndex.from_documents(documents, service_context=service_context)

query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)

```
</TabItem>

<TabItem value="Curl" label="Curl Request">

request body의 일부로 `metadata`를 전달하세요.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "metadata": {
        "generation_name": "ishaan-test-generation",
        "generation_id": "gen-id22",
        "trace_id": "trace-id22",
        "trace_user_id": "user-id2"
    }
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
    model = "gpt-3.5-turbo",
    temperature=0.1,
    extra_body={
        "metadata": {
            "generation_name": "ishaan-generation-langchain-client",
            "generation_id": "langchain-client-gen-id22",
            "trace_id": "langchain-client-trace-id22",
            "trace_user_id": "langchain-client-user-id2"
        }
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
<TabItem value="langchain js" label="Langchain JS">

```js
import { ChatOpenAI } from "@langchain/openai";


const model = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: "sk-1234",
  modelKwargs: {"metadata": "hello world"} // 👈 PASS Additional params here
}, {
  basePath: "http://0.0.0.0:4000",
});

const message = await model.invoke("Hi there!");

console.log(message);

```

</TabItem>
<TabItem value="openai JS" label="OpenAI JS">

```js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-1234", // This is the default and can be omitted
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  }, {"metadata": {
            "generation_name": "ishaan-generation-openaijs-client",
            "generation_id": "openaijs-client-gen-id22",
            "trace_id": "openaijs-client-trace-id22",
            "trace_user_id": "openaijs-client-user-id2"
        }});
}

main();

```

</TabItem>

<TabItem value="anthropic-py" label="Anthropic Python SDK">

```python
import os

from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:4000", # proxy endpoint
    api_key="sk-test-proxy-key-123", # litellm proxy virtual key (example)
)

message = client.messages.create(
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Hello, Claude",
        }
    ],
    model="claude-3-opus-20240229",
)
print(message.content)
```

</TabItem>

<TabItem value="mistral-py" label="Mistral Python SDK">

```python
import os
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage


client = MistralClient(api_key="sk-1234", endpoint="http://0.0.0.0:4000")
chat_response = client.chat(
    model="mistral-small-latest",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
)
print(chat_response.choices[0].message.content)
```

</TabItem>

<TabItem value="instructor" label="Instructor">

```python
from openai import OpenAI
import instructor
from pydantic import BaseModel

my_proxy_api_key = "" # e.g. sk-1234 - LITELLM KEY
my_proxy_base_url = "" # e.g. http://0.0.0.0:4000 - LITELLM PROXY BASE URL

# This enables response_model keyword
# from client.chat.completions.create
## WORKS ACROSS OPENAI/ANTHROPIC/VERTEXAI/ETC. - all LITELLM SUPPORTED MODELS!
client = instructor.from_openai(OpenAI(api_key=my_proxy_api_key, base_url=my_proxy_base_url))

class UserDetail(BaseModel):
    name: str
    age: int

user = client.chat.completions.create(
    model="gemini-pro-flash",
    response_model=UserDetail,
    messages=[
        {"role": "user", "content": "Extract Jason is 25 years old"},
    ]
)

assert isinstance(user, UserDetail)
assert user.name == "Jason"
assert user.age == 25
```
</TabItem>
</Tabs>

## 분류와 추적에 Tags 사용하기 {#using-tags-for-categorization-and-tracking}

Tags를 사용하면 LLM 요청을 분류, 필터링, 추적할 수 있습니다. 더 나은 구성과 분석을 위해 metadata에 tags를 추가하세요.

<Tabs>
<TabItem value="openai-python" label="OpenAI Python">

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}],
    extra_body={
        "metadata": {
            "tags": ["production", "customer-support", "urgent"],
            "generation_name": "support-bot",
            "trace_user_id": "user-123"
        }
    }
)
```

</TabItem>

<TabItem value="langchain-python" label="LangChain Python">

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model="gpt-4o",
    extra_body={
        "metadata": {
            "tags": ["langchain-integration", "content-gen"],
            "trace_user_id": "user-456"
        }
    }
)

response = chat.invoke([HumanMessage(content="Generate a blog post")])
```

</TabItem>

<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "metadata": {
        "tags": ["api-test", "development"],
        "trace_user_id": "test-user"
    }
}'
```

</TabItem>

<TabItem value="openai-js" label="OpenAI JS">

```js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-1234",
  baseURL: "http://0.0.0.0:4000"
});

async function main() {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'gpt-3.5-turbo',
    metadata: {
      tags: ["javascript-client", "api-test"],
      trace_user_id: "js-user-789"
    }
  });
}
```

</TabItem>
</Tabs>

### Tag의 장점 {#tag-benefits}

- **비용 추적**: project/team/feature별 지출을 모니터링합니다.
- **분석**: logs와 dashboards에서 tags로 요청을 필터링합니다.
- **라우팅**: 조건부 model routing에 tags를 사용합니다.
- **디버깅**: 분류된 요청으로 문제 해결이 더 쉬워집니다.

### 응답 형식

```json
{
  "id": "chatcmpl-8c5qbGTILZa1S4CK3b31yj5N40hFN",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "As an AI language model, I do not have a physical form or personal preferences. However, I am programmed to assist with various topics and provide information on a wide range of subjects. Is there something specific you would like assistance with?",
        "role": "assistant"
      }
    }
  ],
  "created": 1704089632,
  "model": "gpt-35-turbo",
  "object": "chat.completion",
  "system_fingerprint": null,
  "usage": {
    "completion_tokens": 47,
    "prompt_tokens": 12,
    "total_tokens": 59
  },
  "_response_ms": 1753.426
}

```

### **스트리밍** {#streaming}


<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPTIONAL_YOUR_PROXY_KEY" \
-d '{
  "model": "gpt-4-turbo",
  "messages": [
    {
      "role": "user",
      "content": "this is a test request, write a short poem"
    }
  ],
  "stream": true
}'
```
</TabItem>
<TabItem value="sdk" label="SDK">

```python 
from openai import OpenAI
client = OpenAI(
    api_key="sk-1234", # [OPTIONAL] set if you set one on proxy, else set ""
    base_url="http://0.0.0.0:4000",
)

messages = [{"role": "user", "content": "this is a test request, write a short poem"}]
completion = client.chat.completions.create(
  model="gpt-4o",
  messages=messages,
  stream=True
)

print(completion)

```
</TabItem>
</Tabs>


### 함수 호출 {#function-calling}

proxy로 function calling을 수행하는 몇 가지 예제입니다.

**모든** openai-compatible 프로젝트에서 proxy를 function calling에 사용할 수 있습니다.

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPTIONAL_YOUR_PROXY_KEY" \
-d '{
  "model": "gpt-4-turbo",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'
```
</TabItem>
<TabItem value="sdk" label="SDK">

```python 
from openai import OpenAI
client = OpenAI(
    api_key="sk-1234", # [OPTIONAL] set if you set one on proxy, else set ""
    base_url="http://0.0.0.0:4000",
)

tools = [
  {
    "type": "function",
    "function": {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA",
          },
          "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
        },
        "required": ["location"],
      },
    }
  }
]
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]
completion = client.chat.completions.create(
  model="gpt-4o", # use 'model_name' from config.yaml
  messages=messages,
  tools=tools,
  tool_choice="auto"
)

print(completion)

```
</TabItem>
</Tabs>

## `/embeddings`

### 요청 형식
지원되는 모든 모델에서 Input, Output, Exceptions는 OpenAI 형식으로 매핑됩니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    input=["hello from litellm"],
    model="text-embedding-ada-002"
)

print(response)

```
</TabItem>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/embeddings' \
  --header 'Content-Type: application/json' \
  --data ' {
  "model": "text-embedding-ada-002",
  "input": ["write a litellm poem"]
  }'
```
</TabItem>

<TabItem value="langchain-embedding" label="Langchain Embeddings">

```python
from langchain.embeddings import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="sagemaker-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")


text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"SAGEMAKER EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"BEDROCK EMBEDDINGS")
print(query_result[:5])

embeddings = OpenAIEmbeddings(model="bedrock-titan-embeddings", openai_api_base="http://0.0.0.0:4000", openai_api_key="temp-key")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"TITAN EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
</Tabs>


### 응답 형식

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [
        0.0023064255,
        -0.009327292,
        .... 
        -0.0028842222,
      ],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}

```

## `/moderations`


### 요청 형식
지원되는 모든 모델에서 Input, Output, Exceptions는 OpenAI 형식으로 매핑됩니다.

<Tabs>
<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
from openai import OpenAI

# set base_url to your proxy server
# set api_key to send to proxy server
client = OpenAI(api_key="<proxy-api-key>", base_url="http://0.0.0.0:4000")

response = client.moderations.create(
    input="hello from litellm",
    model="text-moderation-stable"
)

print(response)

```
</TabItem>
<TabItem value="Curl" label="Curl Request">

```shell
curl --location 'http://0.0.0.0:4000/moderations' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{"input": "Sample text goes here", "model": "text-moderation-stable"}'
```
</TabItem>
</Tabs>


### 응답 형식

```json
{
  "id": "modr-8sFEN22QCziALOfWTa77TodNLgHwA",
  "model": "text-moderation-007",
  "results": [
    {
      "categories": {
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "self-harm": false,
        "self-harm/instructions": false,
        "self-harm/intent": false,
        "sexual": false,
        "sexual/minors": false,
        "violence": false,
        "violence/graphic": false
      },
      "category_scores": {
        "harassment": 0.000019947197870351374,
        "harassment/threatening": 5.5971017900446896e-6,
        "hate": 0.000028560316422954202,
        "hate/threatening": 2.2631787999216613e-8,
        "self-harm": 2.9121162015144364e-7,
        "self-harm/instructions": 9.314219084899378e-8,
        "self-harm/intent": 8.093739012338119e-8,
        "sexual": 0.00004414955765241757,
        "sexual/minors": 0.0000156943697220413,
        "violence": 0.00022354527027346194,
        "violence/graphic": 8.804164281173144e-6
      },
      "flagged": false
    }
  ]
}
```


## OpenAI compatible 프로젝트와 함께 사용하기 {#using-with-openai-compatible-projects}
`base_url`을 LiteLLM Proxy server로 설정하세요.

<Tabs>
<TabItem value="openai" label="OpenAI v1.0.0+">

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
])

print(response)

```
</TabItem>
<TabItem value="librechat" label="LibreChat">

#### LiteLLM proxy 시작하기 {#start-the-litellm-proxy}
```shell
litellm --model gpt-3.5-turbo

#INFO: Proxy running on http://0.0.0.0:4000
```

#### 1. repo 복제하기 {#1-clone-the-repo}

```shell
git clone https://github.com/danny-avila/LibreChat.git
```


#### 2. Librechat의 `docker-compose.yml` 수정하기 {#2-modify-librechats-docker-composeyml}
LiteLLM Proxy가 port `4000`에서 실행 중이므로, 아래 proxy에 `4000`을 설정하세요.
```yaml
OPENAI_REVERSE_PROXY=http://host.docker.internal:4000/v1/chat/completions
```

#### 3. Librechat의 `.env`에 가짜 OpenAI key 저장하기 {#3-save-fake-openai-key-in-librechats-env}

Librechat의 `.env.example`을 `.env`로 복사하고 기본 OPENAI_API_KEY를 덮어쓰세요(기본적으로 사용자가 key를 전달해야 합니다).
```env
OPENAI_API_KEY=sk-1234
```

#### 4. LibreChat 실행하기 {#4-run-librechat}
```shell
docker compose up
```
</TabItem>

<TabItem value="continue-dev" label="ContinueDev">

Continue-Dev는 ChatGPT를 VSCode로 가져옵니다. [여기](https://continue.dev/docs/quickstart)에서 설치 방법을 확인하세요.

[config.py](https://continue.dev/docs/reference/모델/openai)에서 이것을 기본 모델로 설정하세요.
```python
  default=OpenAI(
      api_key="IGNORED",
      model="fake-model-name",
      context_length=2048, # customize if needed for your model
      api_base="http://localhost:4000" # your proxy server url
  ),
```

이 튜토리얼에 대한 크레딧은 [@vividfog](https://github.com/ollama/ollama/issues/305#issuecomment-1751848077)에게 있습니다.
</TabItem>

<TabItem value="aider" label="Aider">

```shell
$ uv add aider 

$ aider --openai-api-base http://0.0.0.0:4000 --openai-api-key fake-key
```
</TabItem>
<TabItem value="autogen" label="AutoGen">

```python
uv add pyautogen
```

```python
from autogen import AssistantAgent, UserProxyAgent, oai
config_list=[
    {
        "model": "my-fake-model",
        "api_base": "http://localhost:4000",  #litellm compatible endpoint
        "api_type": "open_ai",
        "api_key": "NULL", # just a placeholder
    }
]

response = oai.Completion.create(config_list=config_list, prompt="Hi")
print(response) # works fine

llm_config={
    "config_list": config_list,
}

assistant = AssistantAgent("assistant", llm_config=llm_config)
user_proxy = UserProxyAgent("user_proxy")
user_proxy.initiate_chat(assistant, message="Plot a chart of META and TESLA stock price change YTD.", config_list=config_list)
```

이 튜토리얼에 대한 크레딧은 [@victordibia](https://github.com/microsoft/autogen/issues/45#issuecomment-1749921972)에게 있습니다.
</TabItem>

<TabItem value="guidance" label="guidance">
대규모 언어 모델을 제어하기 위한 guidance 언어입니다.
https://github.com/guidance-ai/guidance

**참고:** Guidance는 `stop_sequences` 같은 추가 파라미터를 보내며, 일부 모델이 이를 지원하지 않으면 실패할 수 있습니다.

**해결 방법**: `--drop_params` flag를 사용해 proxy를 시작하세요.

```shell
litellm --model ollama/codellama --temperature 0.3 --max_tokens 2048 --drop_params
```

```python
import guidance

# set api_base to your proxy
# set api_key to anything
gpt4 = guidance.llms.OpenAI("gpt-4", api_base="http://0.0.0.0:4000", api_key="anything")

experts = guidance('''
{{#system~}}
You are a helpful and terse assistant.
{{~/system}}

{{#user~}}
I want a response to the following question:
{{query}}
Name 3 world-class experts (past or present) who would be great at answering this?
Don't answer the question yet.
{{~/user}}

{{#assistant~}}
{{gen 'expert_names' temperature=0 max_tokens=300}}
{{~/assistant}}
''', llm=gpt4)

result = experts(query='How can I be more productive?')
print(result)
```
</TabItem>
</Tabs>

## Vertex, Boto3, Anthropic SDK와 함께 사용하기(Native format) {#using-with-vertex-boto3-anthropic-sdk-native-format}

👉 **[native format에서 Vertex, boto3, Anthropic SDK와 함께 litellm proxy를 사용하는 방법](../pass_through/vertex_ai.md)**

## 고급 {#advanced}

### (BETA) Batch Completions - 여러 모델 전달하기 {#beta-batch-completions-pass-multiple-models}

하나의 요청을 N개 모델로 보내고 싶을 때 사용하세요.

#### 예상 요청 형식 {#expected-request-format}

model을 쉼표로 구분된 모델 값의 문자열로 전달하세요. 예제 `"model"="llama3,gpt-3.5-turbo"`

동일한 요청이 [litellm proxy config.yaml](https://docs.litellm.ai/docs/proxy/configs)의 다음 model groups로 전송됩니다.
- `model_name="llama3"`
- `model_name="gpt-3.5-turbo"` 

<Tabs>

<TabItem value="openai-py" label="OpenAI Python SDK">


```python
import openai

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="gpt-3.5-turbo,llama3",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
)

print(response)
```



#### 예상 응답 형식 {#expected-response-format}

`model`이 list로 전달되면 responses list를 받습니다.

```python
[
    ChatCompletion(
        id='chatcmpl-9NoYhS2G0fswot0b6QpoQgmRQMaIf',
        choices=[
            Choice(
                finish_reason='stop',
                index=0,
                logprobs=None,
                message=ChatCompletionMessage(
                    content='In the depths of my soul, a spark ignites\nA light that shines so pure and bright\nIt dances and leaps, refusing to die\nA flame of hope that reaches the sky\n\nIt warms my heart and fills me with bliss\nA reminder that in darkness, there is light to kiss\nSo I hold onto this fire, this guiding light\nAnd let it lead me through the darkest night.',
                    role='assistant',
                    function_call=None,
                    tool_calls=None
                )
            )
        ],
        created=1715462919,
        model='gpt-3.5-turbo-0125',
        object='chat.completion',
        system_fingerprint=None,
        usage=CompletionUsage(
            completion_tokens=83,
            prompt_tokens=17,
            total_tokens=100
        )
    ),
    ChatCompletion(
        id='chatcmpl-4ac3e982-da4e-486d-bddb-ed1d5cb9c03c',
        choices=[
            Choice(
                finish_reason='stop',
                index=0,
                logprobs=None,
                message=ChatCompletionMessage(
                    content="A test request, and I'm delighted!\nHere's a short poem, just for you:\n\nMoonbeams dance upon the sea,\nA path of light, for you to see.\nThe stars up high, a twinkling show,\nA night of wonder, for all to know.\n\nThe world is quiet, save the night,\nA peaceful hush, a gentle light.\nThe world is full, of beauty rare,\nA treasure trove, beyond compare.\n\nI hope you enjoyed this little test,\nA poem born, of whimsy and jest.\nLet me know, if there's anything else!",
                    role='assistant',
                    function_call=None,
                    tool_calls=None
                )
            )
        ],
        created=1715462919,
        model='groq/llama3-8b-8192',
        object='chat.completion',
        system_fingerprint='fp_a2c8d063cb',
        usage=CompletionUsage(
            completion_tokens=120,
            prompt_tokens=20,
            total_tokens=140
        )
    )
]
```


</TabItem>

<TabItem value="curl" label="Curl">




```shell
curl --location 'http://localhost:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "llama3,gpt-3.5-turbo",
    "max_tokens": 10,
    "user": "litellm2",
    "messages": [
        {
        "role": "user",
        "content": "is litellm getting better"
        }
    ]
}'
```




#### 예상 응답 형식 {#expected-response-format-1}

`model`이 list로 전달되면 responses list를 받습니다.

```json
[
  {
    "id": "chatcmpl-3dbd5dd8-7c82-4ca3-bf1f-7c26f497cf2b",
    "choices": [
      {
        "finish_reason": "length",
        "index": 0,
        "message": {
          "content": "The Elder Scrolls IV: Oblivion!\n\nReleased",
          "role": "assistant"
        }
      }
    ],
    "created": 1715459876,
    "model": "groq/llama3-8b-8192",
    "object": "chat.completion",
    "system_fingerprint": "fp_179b0f92c9",
    "usage": {
      "completion_tokens": 10,
      "prompt_tokens": 12,
      "total_tokens": 22
    }
  },
  {
    "id": "chatcmpl-9NnldUfFLmVquFHSX4yAtjCw8PGei",
    "choices": [
      {
        "finish_reason": "length",
        "index": 0,
        "message": {
          "content": "TES4 could refer to The Elder Scrolls IV:",
          "role": "assistant"
        }
      }
    ],
    "created": 1715459877,
    "model": "gpt-3.5-turbo-0125",
    "object": "chat.completion",
    "system_fingerprint": null,
    "usage": {
      "completion_tokens": 10,
      "prompt_tokens": 9,
      "total_tokens": 19
    }
  }
]
```


</TabItem>
</Tabs>
