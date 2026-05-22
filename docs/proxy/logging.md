import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 로깅 {#logging}

다음 도구를 사용해 Proxy 입력, 출력, 예외를 로깅합니다.

- Langfuse
- OpenTelemetry
- GCS, s3, Azure (Blob) 버킷
- AWS SQS
- Lunary
- MLflow
- Deepeval
- Custom Callbacks - 사용자 지정 코드 및 API 엔드포인트
- Langsmith
- DataDog
- Azure Sentinel
- DynamoDB
- 기타



## LiteLLM 호출 ID 가져오기 {#litellm-call-id}

LiteLLM은 각 요청마다 고유한 `call_id`를 생성합니다. 이 `call_id`는 시스템 전반에서 요청을 추적하는 데 사용할 수 있습니다. 이 페이지에서 설명하는 로깅 시스템에서 특정 요청 정보를 찾을 때 특히 유용합니다.

```shell
curl -i -sSL --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'Content-Type: application/json' \
    --data '{
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": "what llm are you"}]
    }' | grep 'x-litellm'
```

출력은 다음과 같습니다.

```output
x-litellm-call-id: b980db26-9512-45cc-b1da-c511a363b83f
x-litellm-model-id: cb41bc03f4c33d310019bae8c5afdb1af0a8f97b36a234405a9807614988457c
x-litellm-model-api-base: https://x-example-1234.openai.azure.com
x-litellm-version: 1.40.21
x-litellm-response-cost: 2.85e-05
x-litellm-key-tpm-limit: None
x-litellm-key-rpm-limit: None
```

이 헤더 중 여러 항목이 문제 해결에 유용할 수 있지만, 로깅 도구를 포함한 시스템 구성 요소 전반에서 요청을 추적할 때 가장 유용한 것은 `x-litellm-call-id`입니다.


## 로깅 기능 {#logging-features}

<span id="braintrust"></span>
<span id="prometheus"></span>
<span id="opik"></span>
<span id="helicone"></span>
<span id="sumologic"></span>
<span id="cloudzero"></span>

### 메시지와 응답 콘텐츠 마스킹 {#redact-messages-response-content}

`litellm.turn_off_message_logging=True`를 설정하세요. 그러면 메시지와 응답이 로깅 공급자에 기록되지 않지만, 비용 같은 요청 메타데이터는 계속 추적됩니다. 민감한 데이터를 다룰 때 개인정보 보호와 컴플라이언스 용도로 유용합니다.

<Tabs>

<TabItem value="global" label="Global">

**1. config.yaml 설정**
```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["langfuse"]
  turn_off_message_logging: True # 👈 Key Change
```

**2. 요청 전송**
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
    ]
}'
```



</TabItem>
<TabItem value="dynamic" label="Per Request">

:::info

동적 요청 메시지 마스킹은 베타입니다.

:::

특정 요청에서 메시지 마스킹을 활성화하려면 요청 헤더를 전달하세요.

```
x-litellm-enable-message-redaction: true
```

예제 config.yaml

**1. config.yaml 설정**

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
```

**2. 요청별 헤더 설정**

```shell
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-zV5HlSIm8ihj1F9C_ZbB1g' \
-H 'x-litellm-enable-message-redaction: true' \
-d '{
  "model": "gpt-3.5-turbo-testing",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going 1234?"
    }
  ]
}'
```

</TabItem>
</Tabs>

**3. 로깅 도구 + 비용 로그 확인**

**로깅 도구**

<Image img={require('../../img/message_redaction_logging.png')}/>

**Spend 로그**

<Image img={require('../../img/message_redaction_spend_logs.png')} />


### UserAPIKeyInfo 마스킹 {#userapikeyinfo-redact}

로그에서 사용자 API 키 관련 정보(해시된 토큰, `user_id`, 팀 ID 등)를 마스킹합니다.

현재 Langfuse, OpenTelemetry, Logfire, ArizeAI 로깅에서 지원됩니다.

```yaml
litellm_settings: 
  callbacks: ["langfuse"]
  redact_user_api_key_info: true
```

### 메시지 마스킹 비활성화 {#message-redaction-disable}

`litellm.turn_on_message_logging`이 켜져 있으면 요청 헤더 `LiteLLM-Disable-Message-Redaction: true`를 설정해 특정 요청에서 재정의할 수 있습니다.


```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'LiteLLM-Disable-Message-Redaction: true' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```


### 모든 추적/로깅 끄기 {#disable-all-tracking-logging}

일부 사용 사례에서는 모든 추적/로깅을 끄고 싶을 수 있습니다. 요청 본문에 `no-log=True`를 전달하면 됩니다.

:::info

`config.yaml` 파일에서 `global_disable_no_log_param:true`를 설정하면 이 기능을 비활성화할 수 있습니다.

```yaml
litellm_settings:
  global_disable_no_log_param: True
```
:::

<Tabs>
<TabItem value="Curl" label="Curl Request">

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer <litellm-api-key>' \
-d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What'\''s in this image?"
          }
        ]
      }
    ],
    "max_tokens": 300,
    "no-log": true # 👈 Key Change
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI">

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
      "no-log": True # 👈 Key Change
    }
)

print(response)
```

</TabItem>
</Tabs>

**예상 콘솔 로그**  

```
LiteLLM.Info: "no-log request, skipping logging"
```

### ✨ 특정 콜백 동적 비활성화 {#dynamic-callback-disable}

:::info

이는 엔터프라이즈 기능입니다.

[LiteLLM 엔터프라이즈로 진행](https://www.litellm.ai/enterprise)

:::

일부 사용 사례에서는 특정 요청에 대해 특정 콜백을 비활성화하고 싶을 수 있습니다. 요청 헤더에 `x-litellm-disable-callbacks: <callback_name>`을 전달하면 됩니다.

비활성화할 콜백 목록을 요청 헤더 `x-litellm-disable-callbacks`로 보내세요.

<Tabs>
<TabItem value="Curl" label="Curl Request">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --header 'x-litellm-disable-callbacks: langfuse' \
    --data '{
    "model": "claude-sonnet-4-20250514",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```

</TabItem>
<TabItem value="OpenAI" label="OpenAI Python SDK">

```python
import openai

client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "what llm are you"
        }
    ],
    extra_headers={
        "x-litellm-disable-callbacks": "langfuse"
    }
)

print(response)
```

</TabItem>
</Tabs>


### ✨ 가상 키, Teams별 조건부 로깅 {#conditional-logging}

다음 용도로 사용합니다.
1. 일부 가상 키/팀에 대해 조건부로 로깅 활성화
2. 가상 키/팀별로 서로 다른 로깅 공급자 설정

[👉 **시작하기** - 팀/키 기반 로깅](team_logging)





## 무엇이 로깅되나요? {#what-gets-logged}

`kwargs["standard_logging_object"]` 아래에서 확인할 수 있습니다. 이는 모든 응답에 대해 로깅되는 표준 페이로드입니다.

[👉 **표준 로깅 페이로드 사양**](./logging_spec)

## Langfuse

`--config`를 사용해 `litellm.success_callback = ["langfuse"]`를 설정하면 성공한 모든 LLM 호출이 Langfuse에 로깅됩니다. 환경에 `LANGFUSE_PUBLIC_KEY`와 `LANGFUSE_SECRET_KEY`를 반드시 설정하세요.

**1단계** Langfuse 설치

```shell
uv add langfuse>=2.0.0
```

**2단계**: `config.yaml` 파일을 생성하고 `litellm_settings`: `success_callback` 설정

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["langfuse"]
```

**3단계**: Langfuse 로깅에 필요한 환경 변수 설정

```shell
export LANGFUSE_PUBLIC_KEY="pk_kk"
export LANGFUSE_SECRET_KEY="sk_ss"
# Optional, defaults to https://cloud.langfuse.com
export LANGFUSE_HOST="https://xxx.langfuse.com"
```

**4단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```
litellm --test
```

Langfuse 예상 출력

<Image img={require('../../img/langfuse_small.png')} />

### Langfuse에 메타데이터 로깅 {#langfuse-metadata-logging}

<Tabs>

<TabItem value="Curl" label="Curl Request">

요청 본문의 일부로 `metadata`를 전달합니다.

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
<TabItem value="openai" label="OpenAI v1.0.0+">

전달하려는 `metadata`를 `extra_body={"metadata": { }}`로 설정합니다.

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
        "metadata": {
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
</Tabs>

### 사용자 지정 태그 {#custom-tags}

요청 본문의 일부로 `tags`를 설정합니다.


<Tabs>


<TabItem value="openai" label="OpenAI Python v1.0.0+">

```python
import openai
client = openai.OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="llama3",
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ],
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
        }
    }
)

print(response)
```
</TabItem>

<TabItem value="Curl" label="Curl Request">

요청 본문의 일부로 `metadata`를 전달합니다.

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
    "model": "llama3",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ],
    "user": "palantir",
    "metadata": {
        "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
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

os.environ["OPENAI_API_KEY"] = "sk-1234"

chat = ChatOpenAI(
    openai_api_base="http://0.0.0.0:4000",
    model = "llama3",
    user="palantir",
    extra_body={
        "metadata": {
            "tags": ["jobID:214590dsff09fds", "taskName:run_page_classification"]
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
</Tabs>



### LiteLLM 태그 - `cache_hit`, `cache_key` {#litellm-tags}

LiteLLM Proxy가 어떤 LiteLLM 전용 필드를 태그로 로깅할지 제어하려면 이 설정을 사용하세요. 기본적으로 LiteLLM Proxy는 LiteLLM 전용 필드를 로깅하지 않습니다.

| LiteLLM 전용 필드         | 설명                                                                             | 예제 값                              |
| ------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| `cache_hit`               | 캐시 적중 발생 여부(`True`/`False`)                            | `true`, `false`                         |
| `cache_key`               | 이 요청에 사용된 캐시 키                                                     | `d2b758c****`                           |
| `proxy_base_url`          | 프록시 서버의 기본 URL. 서버 환경 변수 `PROXY_BASE_URL` 값 | `https://proxy.example.com`             |
| `user_api_key_alias`      | LiteLLM Virtual Key의 별칭                                                   | `prod-app1`                             |
| `user_api_key_user_id`    | 사용자 API 키와 연결된 고유 ID                                         | `user_123`, `user_456`                  |
| `user_api_key_user_email` | 사용자 API 키와 연결된 이메일                                             | `user@example.com`, `admin@example.com` |
| `user_api_key_team_alias` | API 키와 연결된 팀의 별칭                                         | `team_alpha`, `dev_team`                |


**사용법**

Langfuse에 로깅할 LiteLLM 필드를 제어하려면 `langfuse_default_tags`를 지정하세요.

예제 config.yaml 
```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  success_callback: ["langfuse"]

  # 👇 Key Change
  langfuse_default_tags: ["cache_hit", "cache_key", "proxy_base_url", "user_api_key_alias", "user_api_key_user_id", "user_api_key_user_email", "user_api_key_team_alias", "semantic-similarity", "proxy_base_url"]
```

### LiteLLM에서 공급자로 전송한 POST 보기 {#view-post-sent-to-provider}

LiteLLM에서 LLM API로 전송한 원시 curl 요청을 보고 싶을 때 사용하세요.

<Tabs>

<TabItem value="Curl" label="Curl Request">

요청 본문의 일부로 `metadata`를 전달합니다.

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
        "log_raw_request": true
    }
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

전달하려는 `metadata`에 `extra_body={"metadata": {"log_raw_request": True }}`를 설정합니다.

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
        "metadata": {
            "log_raw_request": True
        }
    }
)

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
    openai_api_base="http://0.0.0.0:4000",
    model = "gpt-3.5-turbo",
    temperature=0.1,
    extra_body={
        "metadata": {
            "log_raw_request": True
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
</Tabs>

**Langfuse 예상 출력**

Langfuse Metadata에서 `raw_request`를 볼 수 있습니다. 이는 LiteLLM에서 LLM API 공급자로 전송한 원시 CURL 명령입니다.

<Image img={require('../../img/debug_langfuse.png')} />

## OpenTelemetry {#otel}

:::tip

전체 OpenTelemetry 참조(span 계층, 내보내는 모든 span과 attribute, metric, semconv mode, 문제 해결)는 [관측성 → OpenTelemetry Integration](/litellm-docs-kr/docs/observability/opentelemetry_integration)에 있습니다. 아래 섹션은 Proxy 중심 빠른 시작입니다.

:::

:::info 

[선택 사항] 환경에 다음 변수를 설정해 OTEL 서비스 이름과 OTEL 트레이서 이름을 사용자 지정합니다.

```shell
OTEL_TRACER_NAME=<your-trace-name>     # default="litellm"
OTEL_SERVICE_NAME=<your-service-name>` # default="litellm"
```

:::

<Tabs>

<TabItem value="Console Exporter" label="Log to console">

**1단계:** 콜백과 환경 변수 설정

환경에 다음을 추가합니다.

```shell
OTEL_EXPORTER="console"
```

`litellm_config.yaml`에 `otel`을 콜백으로 추가합니다.

```shell
litellm_settings:
  callbacks: ["otel"]
```

**2단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

**3단계**: **서버 로그/콘솔에 다음이 로깅되는지 확인**

이는 OTEL 로깅의 span입니다.

```json
{
    "name": "litellm-acompletion",
    "context": {
        "trace_id": "0x8d354e2346060032703637a0843b20a3",
        "span_id": "0xd8d3476a2eb12724",
        "trace_state": "[]"
    },
    "kind": "SpanKind.INTERNAL",
    "parent_id": null,
    "start_time": "2024-06-04T19:46:56.415888Z",
    "end_time": "2024-06-04T19:46:56.790278Z",
    "status": {
        "status_code": "OK"
    },
    "attributes": {
        "model": "llama3-8b-8192"
    },
    "events": [],
    "links": [],
    "resource": {
        "attributes": {
            "service.name": "litellm"
        },
        "schema_url": ""
    }
}
```

</TabItem>

<TabItem value="Honeycomb" label="Log to Honeycomb">

#### 빠른 시작 - Honeycomb에 로깅

**1단계:** 콜백과 환경 변수 설정

환경에 다음을 추가합니다.

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="https://api.honeycomb.io/v1/traces"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>"
```

`litellm_config.yaml`에 `otel`을 콜백으로 추가합니다.

```shell
litellm_settings:
  callbacks: ["otel"]
```

**2단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="traceloop" label="Log to Traceloop Cloud">

#### 빠른 시작 - Traceloop에 로깅

**1단계:**
환경에 다음을 추가합니다.

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="https://api.traceloop.com"
OTEL_HEADERS="Authorization=Bearer%20<your-api-key>"
```

**2단계:** `otel`을 콜백으로 추가

```shell
litellm_settings:
  callbacks: ["otel"]
```

**3단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="otel-col" label="Log to OTEL HTTP Collector">

#### 빠른 시작 - OTEL Collector에 로깅

**1단계:** 콜백과 환경 변수 설정

환경에 다음을 추가합니다.

```shell
OTEL_EXPORTER="otlp_http"
OTEL_ENDPOINT="http://0.0.0.0:4317"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>" # Optional
```

`litellm_config.yaml`에 `otel`을 콜백으로 추가합니다.

```shell
litellm_settings:
  callbacks: ["otel"]
```

**2단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

<TabItem value="otel-col-grpc" label="Log to OTEL GRPC Collector">

#### 빠른 시작 - OTEL GRPC Collector에 로깅

**1단계:** 콜백과 환경 변수 설정

환경에 다음을 추가합니다.

```shell
OTEL_EXPORTER="otlp_grpc"
OTEL_ENDPOINT="http:/0.0.0.0:4317"
OTEL_HEADERS="x-honeycomb-team=<your-api-key>" # Optional
```

> 참고: OTLP gRPC에는 `grpcio`가 필요합니다. `uv add "litellm[grpc]"` 또는 `grpcio`로 설치하세요.

`litellm_config.yaml`에 `otel`을 콜백으로 추가합니다.

```shell
litellm_settings:
  callbacks: ["otel"]
```

**2단계**: 프록시 시작 후 테스트 요청 전송

프록시 시작

```shell
litellm --config config.yaml --detailed_debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

</TabItem>

</Tabs>

** 🎉 OTEL Collector에 이 trace가 로깅되는지 확인하세요**

### 메시지와 응답 콘텐츠 마스킹 {#otel-message-response-redact}

`otel`에 `message_logging=False`를 설정하면 메시지/응답이 로깅되지 않습니다.

```yaml
litellm_settings:
  callbacks: ["otel"]

## 👇 Key Change
callback_settings:
  otel:
    message_logging: False
```

### Traceparent 헤더 {#traceparent-header}
##### 서비스 간 context propagation `Traceparent HTTP Header`

❓ 분산 tracing 시스템에서 **수신 요청 정보를 전달**하고 싶을 때 사용하세요.

✅ 핵심 변경: 요청에 **`traceparent` 헤더**를 전달합니다. [traceparent header 자세히 보기](https://uptrace.dev/opentelemetry/opentelemetry-traceparent.html#what-is-traceparent-header)

```curl
traceparent: 00-80e1afed08e019fc1110464cfa66635c-7a085853722dc6d2-01
```

예제 사용법

1. `traceparent` 헤더를 포함해 LiteLLM Proxy로 요청 전송

```python
import openai
import uuid

client = openai.OpenAI(api_key="sk-1234", base_url="http://0.0.0.0:4000")
example_traceparent = f"00-80e1afed08e019fc1110464cfa66635c-02e80198930058d4-01"
extra_headers = {
    "traceparent": example_traceparent
}
_trace_id = example_traceparent.split("-")[1]

print("EXTRA HEADERS: ", extra_headers)
print("Trace ID: ", _trace_id)

response = client.chat.completions.create(
    model="llama3",
    messages=[
        {"role": "user", "content": "this is a test request, write a short poem"}
    ],
    extra_headers=extra_headers,
)

print(response)
```

```shell
# EXTRA HEADERS:  {'traceparent': '00-80e1afed08e019fc1110464cfa66635c-02e80198930058d4-01'}
# Trace ID:  80e1afed08e019fc1110464cfa66635c
```

2. OTEL Logger에서 Trace ID 조회

OTEL Collector에서 Trace=`80e1afed08e019fc1110464cfa66635c`를 검색하세요.

<Image img={require('../../img/otel_parent.png')} />

##### LLM API로 `Traceparent HTTP Header` 전달

traceparent 헤더를 vLLM 같은 자체 호스팅 LLM으로 전달하려면 사용하세요.

`config.yaml`에서 `forward_traceparent_to_llm_provider: True`를 설정하세요. 그러면 `traceparent` 헤더가 LLM API로 전달됩니다.

:::warning

자체 호스팅 LLM에만 사용하세요. Bedrock, VertexAI 호출이 실패할 수 있습니다.

:::

```yaml
litellm_settings:
  forward_traceparent_to_llm_provider: True
```

## Google Cloud Storage 버킷 {#google-cloud-storage}

LLM 로그를 [Google Cloud Storage Buckets](https://cloud.google.com/storage?hl=en)에 기록합니다.

:::info

✨ 이는 엔터프라이즈 전용 기능입니다. [엔터프라이즈 시작하기](https://enterprise.litellm.ai/demo)

:::


| 속성                         | 상세                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| 설명                         | LLM 입력/출력을 클라우드 스토리지 버킷에 로깅                  |
| 부하 테스트 벤치마크         | [벤치마크](https://docs.litellm.ai/docs/benchmarks)            |
| Google 문서 on Cloud Storage | [Google Cloud Storage](https://cloud.google.com/storage?hl=en) |



#### 사용법

1. LiteLLM `Config.yaml`에 `gcs_bucket` 추가
```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["gcs_bucket"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 필요한 환경 변수 설정

```shell
GCS_BUCKET_NAME="<your-gcs-bucket-name>"
GCS_PATH_SERVICE_ACCOUNT="/Users/ishaanjaffer/Downloads/adroit-crow-413218-a956eef1a2a8.json" # Add path to service account.json
```

3. Proxy 시작

```
litellm --config /path/to/config.yaml
```

4. 테스트

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
    }
'
```


#### GCS Buckets 예상 로그

<Image img={require('../../img/gcs_bucket.png')} />

#### GCS Buckets에 로깅되는 필드

[**표준 로깅 객체가 GCS Bucket에 로깅됩니다**](../proxy/logging_spec)


#### Google Cloud Console에서 `service_account.json` 가져오기

1. [Google Cloud Console](https://console.cloud.google.com/)로 이동합니다.
2. IAM & Admin을 검색합니다.
3. Service Accounts를 클릭합니다.
4. Service Account를 선택합니다.
5. 'Keys' -> Add Key -> Create New Key -> JSON을 클릭합니다.
6. JSON 파일을 저장하고 경로를 `GCS_PATH_SERVICE_ACCOUNT`에 추가합니다.



## Google Cloud Storage - PubSub 주제

LLM 로그/Spend로그를 [Google Cloud Storage PubSub Topic](https://cloud.google.com/pubsub/docs/reference/rest)에 기록합니다.

:::info

✨ 이는 엔터프라이즈 전용 기능입니다. [엔터프라이즈 시작하기](https://enterprise.litellm.ai/demo)

:::


| 속성        | 상세                                                               |
| ----------- | ------------------------------------------------------------------ |
| 설명        | LiteLLM `Spend로그 Table`을 Google Cloud Storage PubSub Topic에 로깅 |

`gcs_pubsub`는 언제 사용하나요?

- LiteLLM Database의 비용 로그가 1M+를 넘었고, GCS BigQuery에서 소비할 수 있도록 `Spend로그`를 PubSub Topic으로 보내고 싶을 때


#### 사용법

1. LiteLLM `Config.yaml`에 `gcs_pubsub` 추가
```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  callbacks: ["gcs_pubsub"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 필요한 환경 변수 설정

```shell
GCS_PUBSUB_TOPIC_ID="litellmDB"
GCS_PUBSUB_PROJECT_ID="reliableKeys"
```

3. Proxy 시작

```
litellm --config /path/to/config.yaml
```

4. 테스트

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
    }
'
```

## Deepeval
LiteLLM은 [Confidential AI](https://documentation.confident-ai.com/)(Deepeval Platform)에 로깅하는 기능을 지원합니다.

### 사용법:
1. LiteLLM `config.yaml`에 `deepeval` 추가

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o
litellm_settings:
  success_callback: ["deepeval"]
  failure_callback: ["deepeval"]
```

2. `.env` 파일에 환경 변수 설정
```shell
CONFIDENT_API_KEY=<your-api-key>
```
:::info
[Confident AI](https://app.confident-ai.com/project) 플랫폼에 로그인해 `CONFIDENT_API_KEY`를 얻을 수 있습니다.
:::

3. Proxy 서버 시작:
```shell
litellm --config config.yaml --debug
```

4. 요청 전송:
```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

5. 플랫폼에서 trace 확인:

<Image img={require('../../img/deepeval_visible_trace.png')} />

## s3 Buckets {#s3}

`--config`로 다음을 설정합니다.

- `litellm.success_callback = ["s3"]` 

이 설정은 성공한 모든 LLM 호출을 s3 Bucket에 기록합니다.

**1단계** `.env`에 AWS 자격 증명 설정

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**2단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm   # AWS Bucket Name for S3
    s3_region_name: us-west-2              # AWS Region Name for S3
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID  # us os.environ/<variable name> to pass environment variables. This is AWS Access Key ID for S3
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY  # AWS Secret Access Key for S3
    s3_path: my-test-path # [OPTIONAL] set path in bucket you want to write logs to
    s3_endpoint_url: https://s3.amazonaws.com  # [OPTIONAL] S3 endpoint URL, if you want to use Backblaze/cloudflare s3 buckets
    s3_use_virtual_hosted_style: false # [OPTIONAL] use virtual-hosted-style URLs (bucket.endpoint/key) instead of path-style (endpoint/bucket/key). Useful for S3-compatible services like MinIO
    s3_strip_base64_files: false # [OPTIONAL] remove base64 files before storing in s3
```

**3단계**: 프록시를 시작하고 테스트 요청을 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "Azure OpenAI GPT-4 East",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

지정한 s3 Bucket에서 로그를 확인할 수 있어야 합니다.

### Object Key의 팀 별칭 접두사 {#team-alias-prefix}

`config.yaml` 파일에서 `team_alias`를 설정하면 object key에 팀 별칭을 추가할 수 있습니다.
이 설정은 object key 앞에 팀 별칭을 붙입니다.

```yaml
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: my-test-path
    s3_endpoint_url: https://s3.amazonaws.com
    s3_use_team_prefix: true
```

s3 bucket에서 object key가 `my-test-path/my-team-alias/...` 형식으로 표시됩니다.

### Object Key의 키 별칭 접두사 {#key-alias-prefix}

`s3_use_key_prefix`를 활성화하면 사용자 API 키 별칭을 s3 object key에 추가할 수 있습니다.

```yaml
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: logs-bucket-litellm
    s3_region_name: us-west-2
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    s3_path: my-test-path
    s3_endpoint_url: https://s3.amazonaws.com
    s3_use_key_prefix: true
```

s3 bucket에서 object key가 `my-test-path/my-key-alias/...` 형식으로 표시됩니다.

팀 별칭과 키 별칭을 모두 활성화하면 경로는 다음과 같습니다.
`my-test-path/my-team-alias/my-key-alias/...`

## AWS SQS {#sqs}


| 속성                 | 상세                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| 설명                 | LLM 입력/출력을 AWS SQS Queue에 기록                                                  |
| AWS 문서 on SQS      | [AWS SQS](https://aws.amazon.com/sqs/)                                                |
| SQS에 기록되는 필드  | 각 LLM 호출마다 LiteLLM [Standard Logging Payload](../proxy/logging_spec)가 기록됩니다 |


LLM 로그를 [AWS Simple Queue Service (SQS)](https://aws.amazon.com/sqs/)로 전송합니다.

litellm `--config`로 다음을 설정합니다.

- `litellm.callbacks = ["aws_sqs"]` 

이 설정은 성공한 모든 LLM 호출을 AWS SQS Queue에 기록합니다.

**1단계** `.env`에 AWS 자격 증명 설정

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**2단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `callbacks`를 설정합니다.

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: gpt-4o

litellm_settings:
  callbacks: ["aws_sqs"]

  aws_sqs_callback_params:
    # --- 🧱 Required Parameters ---
    sqs_queue_url: https://sqs.us-west-2.amazonaws.com/123456789012/my-queue
    # The AWS SQS Queue URL to which LiteLLM will send log events.

    sqs_region_name: us-west-2
    # AWS Region for your SQS queue (e.g., us-east-1, eu-central-1, etc.)
    
    # --- Logging Controls ---
    sqs_strip_base64_files: false
    # If true, LiteLLM will remove or redact base64-encoded binary data (e.g., PDFs, images, audio)
    # from logged messages to avoid large payloads. SQS has a 1 MB payload size limit.
    s3_use_team_prefix: false
    # If true, Litellm will add the team alias prefix to s3 path
    s3_use_key_prefix: false
    # If true, Litellm will add the key alias prefix to s3 path

```

**3단계**: 프록시를 시작하고 테스트 요청을 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

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
    ]
    }'
```


## Azure Blob Storage

LLM 로그를 [Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)로 전송합니다.

:::info

✨ 이 기능은 엔터프라이즈 전용입니다. [여기에서 엔터프라이즈 시작하기](https://enterprise.litellm.ai/demo)

:::


| 속성                            | 상세                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 설명                            | LLM 입력/출력을 Azure Blob Storage (Bucket)에 기록                                                              |
| Azure 문서 on Data Lake Storage | [Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction) |



#### 사용법

1. LiteLLM `Config.yaml`에 `azure_storage`를 추가합니다.
```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["azure_storage"] # 👈 KEY CHANGE # 👈 KEY CHANGE
```

2. 필요한 환경 변수를 설정합니다.

```shell
# Required Environment Variables for Azure Storage
AZURE_STORAGE_ACCOUNT_NAME="litellm2" # The name of the Azure Storage Account to use for logging
AZURE_STORAGE_FILE_SYSTEM="litellm-logs" # The name of the Azure Storage File System to use for logging.  (Typically the Container name)

# Authentication Variables
# Option 1: Use Storage Account Key
AZURE_STORAGE_ACCOUNT_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # The Azure Storage Account Key to use for Authentication

# Option 2: Use Tenant ID + Client ID + Client Secret
AZURE_STORAGE_TENANT_ID="985efd7cxxxxxxxxxx" # The Application Tenant ID to use for Authentication
AZURE_STORAGE_CLIENT_ID="abe66585xxxxxxxxxx" # The Application Client ID to use for Authentication
AZURE_STORAGE_CLIENT_SECRET="uMS8Qxxxxxxxxxx" # The Application Client Secret to use for Authentication
```

3. Proxy 시작

```
litellm --config /path/to/config.yaml
```

4. 테스트합니다.

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
    }
'
```


#### Azure Data Lake Storage의 예상 로그

<Image img={require('../../img/azure_blob.png')} />

#### Azure Data Lake Storage에 기록되는 필드

[**표준 로깅 객체가 Azure Data Lake Storage에 기록됩니다**](../proxy/logging_spec)


## Datadog

👉 LiteLLM Proxy에서 [Datadog LLM 관측성](../observability/datadog)을 사용하는 방법은 여기에서 확인하세요.

## Azure Sentinel

👉 LiteLLM Proxy에서 [Azure Sentinel](../observability/azure_sentinel)을 사용하는 방법은 여기에서 확인하세요.


## Lunary
#### 1단계: 종속성 설치 및 환경 변수 설정
종속성을 설치합니다.
```shell
uv add litellm lunary
```

https://app.lunary.ai/settings 에서 Lunary 공개 키를 가져옵니다.
```shell
export LUNARY_PUBLIC_KEY="<your-public-key>"
```

#### 2단계: `config.yaml`을 만들고 `lunary` 콜백 설정

```yaml
model_list:
  - model_name: "*"
    litellm_params:
      model: "*"
litellm_settings:
  success_callback: ["lunary"]
  failure_callback: ["lunary"]
```

#### 3단계: LiteLLM Proxy 시작
```shell
litellm --config config.yaml
```

#### 4단계: 요청 전송

```shell
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      {
        "role": "user",
        "content": "how can I solve 8x + 7 = -23"
      }
    ]
}'
```

## MLflow

👉 LiteLLM Proxy 서버에서 MLflow를 시작하려면 [여기](../observability/mlflow)의 튜토리얼을 따르세요.



## 사용자 지정 콜백 클래스 [Async] {#custom-callback-class-async}

`python`으로 사용자 지정 콜백을 실행하려는 경우 사용합니다.

#### 1단계 - 사용자 지정 `litellm` 콜백 클래스 생성

이를 위해 `litellm.integrations.custom_logger`를 사용합니다. **litellm 사용자 지정 콜백에 대한 자세한 내용은 [여기](https://docs.litellm.ai/docs/observability/custom_callback)를 참고하세요.**

Python 파일에 사용자 지정 콜백 클래스를 정의합니다.

다음은 `key`, `user`, `model`, `prompt`, `response`, `tokens`, `cost`를 추적하는 사용자 지정 logger 예시입니다. `custom_callbacks.py` 파일을 만들고 `proxy_handler_instance`를 초기화합니다.

```python
from litellm.integrations.custom_logger import CustomLogger
import litellm

# This file includes the custom callbacks for LiteLLM Proxy
# Once defined, these can be passed in proxy_config.yaml
class MyCustomHandler(CustomLogger):
    def log_pre_api_call(self, model, messages, kwargs): 
        print(f"Pre-API Call")
    
    def log_post_api_call(self, kwargs, response_obj, start_time, end_time): 
        print(f"Post-API Call")
        
    def log_success_event(self, kwargs, response_obj, start_time, end_time): 
        print("On Success")

    def log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"On Failure")

    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")
        # log: key, user, model, prompt, response, tokens, cost
        # Access kwargs passed to litellm.completion()
        model = kwargs.get("model", None)
        messages = kwargs.get("messages", None)
        user = kwargs.get("user", None)

        # Access litellm_params passed to litellm.completion(), example access `metadata`
        litellm_params = kwargs.get("litellm_params", {})
        metadata = litellm_params.get("metadata", {})   # headers passed to LiteLLM proxy, can be found here

        # Calculate cost using  litellm.completion_cost()
        cost = litellm.completion_cost(completion_response=response_obj)
        response = response_obj
        # tokens used in response 
        usage = response_obj["usage"]

        print(
            f"""
                Model: {model},
                Messages: {messages},
                User: {user},
                Usage: {usage},
                Cost: {cost},
                Response: {response}
                Proxy Metadata: {metadata}
            """
        )
        return

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        try:
            print(f"On Async Failure !")
            print("\nkwargs", kwargs)
            # Access kwargs passed to litellm.completion()
            model = kwargs.get("model", None)
            messages = kwargs.get("messages", None)
            user = kwargs.get("user", None)

            # Access litellm_params passed to litellm.completion(), example access `metadata`
            litellm_params = kwargs.get("litellm_params", {})
            metadata = litellm_params.get("metadata", {})   # headers passed to LiteLLM proxy, can be found here

            # Access Exceptions & Traceback
            exception_event = kwargs.get("exception", None)
            traceback_event = kwargs.get("traceback_exception", None)

            # Calculate cost using  litellm.completion_cost()
            cost = litellm.completion_cost(completion_response=response_obj)
            print("now checking response obj")
            
            print(
                f"""
                    Model: {model},
                    Messages: {messages},
                    User: {user},
                    Cost: {cost},
                    Response: {response_obj}
                    Proxy Metadata: {metadata}
                    Exception: {exception_event}
                    Traceback: {traceback_event}
                """
            )
        except Exception as e:
            print(f"Exception: {e}")

proxy_handler_instance = MyCustomHandler()

# Set litellm.callbacks = [proxy_handler_instance] on the proxy
```

#### 2단계 - `config.yaml`에 사용자 지정 콜백 클래스 전달

**1단계**에서 정의한 사용자 지정 콜백 클래스를 `config.yaml`에 전달합니다.
`callbacks`를 `python_filename.logger_instance_name`으로 설정합니다.

아래 config에서는 다음을 전달합니다.

- python_filename: `custom_callbacks.py`
- logger_instance_name: `proxy_handler_instance`. 1단계에서 정의한 값입니다.

`callbacks: custom_callbacks.proxy_handler_instance`

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance # sets litellm.callbacks = [proxy_handler_instance]

```

#### 2b단계 - S3/GCS에서 사용자 지정 콜백 로드 (대안)

로컬 Python 파일을 사용하는 대신 S3 또는 GCS bucket에서 사용자 지정 콜백을 직접 로드할 수 있습니다. 중앙화된 콜백 관리가 필요하거나 컨테이너화된 환경에 배포할 때 유용합니다.

**URL 형식:**
- **S3**: `s3://bucket-name/module_name.instance_name`
- **GCS**: `gcs://bucket-name/module_name.instance_name`

**예제 - S3에서 로드:**

다음 내용의 `custom_callbacks.py` 파일이 S3 bucket `litellm-proxy`에 저장되어 있다고 가정합니다.

```python
# custom_callbacks.py (stored in S3)
from litellm.integrations.custom_logger import CustomLogger
import litellm

class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"Custom UI SSO callback executed!")
        # Your custom logic here
  
    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time): 
        print(f"Custom UI SSO failure callback!")
        # Your failure handling logic

# Instance that will be loaded by LiteLLM
custom_handler = MyCustomHandler()
```

**설정:**

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: ["s3://litellm-proxy/custom_callbacks.custom_handler"]
```

**예제 - GCS에서 로드:**

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo

litellm_settings:
  callbacks: ["gcs://my-gcs-bucket/custom_callbacks.custom_handler"]
```

**동작 방식:**
1. LiteLLM이 S3/GCS URL prefix를 감지합니다.
2. Python 파일을 임시 위치에 다운로드합니다.
3. module을 로드하고 지정한 instance를 추출합니다.
4. 임시 파일을 정리합니다.
5. 로깅에 콜백 instance를 사용합니다.

이 방식으로 다음을 수행할 수 있습니다.
- 여러 Proxy instance에서 콜백 파일을 중앙 관리
- 서로 다른 환경 간 콜백 공유
- 클라우드 스토리지에서 콜백 파일 버전 관리

#### 2c단계 - Helm/Kubernetes에서 사용자 지정 콜백 Mount (대안)

Helm 또는 Kubernetes로 배포할 때 `subPath`를 사용하면 config directory를 덮어쓰지 않고 사용자 지정 콜백 Python 파일을 `config.yaml` 옆에 mount할 수 있습니다.

**문제:**
volume을 directory(예: `/app/`)에 mount하면 일반적으로 해당 directory의 기존 파일이 모두 가려지며, `config.yaml`도 포함됩니다.

**해결 방법:**
`volumeMounts`에서 `subPath`를 사용해 전체 directory를 덮어쓰지 않고 개별 파일만 mount합니다.

**예제 - Helm values.yaml:**

```yaml
# values.yaml
volumes:
  - name: callback-files
    configMap:
      name: litellm-callback-files

volumeMounts:
  - name: callback-files
    mountPath: /app/custom_callbacks.py  # Mount to specific FILE path
    subPath: custom_callbacks.py         # Required to avoid overwriting directory
```

**콜백 파일을 포함한 ConfigMap 생성:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-callback-files
data:
  custom_callbacks.py: |
    from litellm.integrations.custom_logger import CustomLogger
    
    class MyCustomHandler(CustomLogger):
        async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
            print(f"Success! Model: {kwargs.get('model')}")
    
    proxy_handler_instance = MyCustomHandler()
```

**config.yaml에서 참조:**

```yaml
litellm_settings:
  callbacks: custom_callbacks.proxy_handler_instance
```

**동작 방식:**
1. `subPath` parameter는 Kubernetes에 특정 파일만 mount하도록 지시합니다.
2. 이 방식은 기존 `config.yaml` 옆의 `/app/`에 `custom_callbacks.py`를 배치합니다.
3. LiteLLM은 config와 같은 directory에서 콜백 파일을 자동으로 찾습니다.
4. 어떤 파일도 덮어쓰거나 가리지 않습니다.

**참고:** 각 파일마다 고유한 `subPath`를 가진 `volumeMounts` entry를 추가해 여러 콜백 파일을 mount할 수 있습니다.

#### 3단계 - Proxy 시작 + 테스트 요청

```shell
litellm --config proxy_config.yaml
```

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Authorization: Bearer sk-1234' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "good morning good sir"
        }
    ],
    "user": "ishaan-app",
    "temperature": 0.2
    }'
```

#### Proxy에 출력되는 결과 로그

```shell
On Success
    Model: gpt-3.5-turbo,
    Messages: [{'role': 'user', 'content': 'good morning good sir'}],
    User: ishaan-app,
    Usage: {'completion_tokens': 10, 'prompt_tokens': 11, 'total_tokens': 21},
    Cost: 3.65e-05,
    Response: {'id': 'chatcmpl-8S8avKJ1aVBg941y5xzGMSKrYCMvN', 'choices': [{'finish_reason': 'stop', 'index': 0, 'message': {'content': 'Good morning! How can I assist you today?', 'role': 'assistant'}}], 'created': 1701716913, 'model': 'gpt-3.5-turbo-0613', 'object': 'chat.completion', 'system_fingerprint': None, 'usage': {'completion_tokens': 10, 'prompt_tokens': 11, 'total_tokens': 21}}
    Proxy Metadata: {'user_api_key': None, 'headers': Headers({'host': '0.0.0.0:4000', 'user-agent': 'curl/7.88.1', 'accept': '*/*', 'authorization': 'Bearer sk-1234', 'content-length': '199', 'content-type': 'application/x-www-form-urlencoded'}), 'model_group': 'gpt-3.5-turbo', 'deployment': 'gpt-3.5-turbo-ModelID-gpt-3.5-turbo'}
```

#### Proxy Request Object, Header, Url 로깅

각 요청에서 Proxy로 전송된 `url`, `headers`, `request body`에 접근하는 방법은 다음과 같습니다.

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")

        litellm_params = kwargs.get("litellm_params", None)
        proxy_server_request = litellm_params.get("proxy_server_request")
        print(proxy_server_request)
```

**예상 출력**

```shell
{
  "url": "http://testserver/chat/completions",
  "method": "POST",
  "headers": {
    "host": "testserver",
    "accept": "*/*",
    "accept-encoding": "gzip, deflate",
    "connection": "keep-alive",
    "user-agent": "testclient",
    "authorization": "Bearer None",
    "content-length": "105",
    "content-type": "application/json"
  },
  "body": {
    "model": "Azure OpenAI GPT-4 Canada",
    "messages": [
      {
        "role": "user",
        "content": "hi"
      }
    ],
    "max_tokens": 10
  }
}
```

#### config.yaml에 설정된 `model_info` 로깅

Proxy `config.yaml`에 설정된 `model_info`를 기록하는 방법은 다음과 같습니다. [config.yaml](https://docs.litellm.ai/docs/proxy/configs)에서 `model_info`를 설정하는 방법도 참고하세요.

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")

        litellm_params = kwargs.get("litellm_params", None)
        model_info = litellm_params.get("model_info")
        print(model_info)
```

**예상 출력**

```json
{'mode': 'embedding', 'input_cost_per_token': 0.002}
```

##### Proxy 응답 로깅

`/chat/completions`와 `/embeddings` 응답은 모두 `response_obj`로 사용할 수 있습니다.

**참고: `/chat/completions`의 경우 `stream=True`와 `non stream` 응답이 모두 `response_obj`로 제공됩니다.**

```python
class MyCustomHandler(CustomLogger):
    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        print(f"On Async Success!")
        print(response_obj)

```

**예상 출력 /chat/completion [`stream` 및 `non-stream` 응답 모두]**

```json
ModelResponse(
    id='chatcmpl-8Tfu8GoMElwOZuj2JlHBhNHG01PPo',
    choices=[
        Choices(
            finish_reason='stop',
            index=0,
            message=Message(
                content='As an AI language model, I do not have a physical body and therefore do not possess any degree or educational qualifications. My knowledge and abilities come from the programming and algorithms that have been developed by my creators.',
                role='assistant'
            )
        )
    ],
    created=1702083284,
    model='chatgpt-v-2',
    object='chat.completion',
    system_fingerprint=None,
    usage=Usage(
        completion_tokens=42,
        prompt_tokens=5,
        total_tokens=47
    )
)
```

**예상 출력 /embeddings**

```json
{
    'model': 'ada',
    'data': [
        {
            'embedding': [
                -0.035126980394124985, -0.020624293014407158, -0.015343423001468182,
                -0.03980357199907303, -0.02750781551003456, 0.02111034281551838,
                -0.022069307044148445, -0.019442008808255196, -0.00955679826438427,
                -0.013143060728907585, 0.029583381488919258, -0.004725852981209755,
                -0.015198921784758568, -0.014069183729588985, 0.00897879246622324,
                0.01521205808967352,
                # ... (truncated for brevity)
            ]
        }
    ]
}
```

## 사용자 지정 콜백 API [Async] {#generic-api-logger}

<Image 
  img={require('../../img/callback_api.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>
  LiteLLM 로그를 사용자 지정 API 엔드포인트로 전송
</p>

:::info

이 기능은 엔터프라이즈 전용입니다. [여기에서 엔터프라이즈 시작하기](https://github.com/BerriAI/litellm/tree/main/enterprise)

:::

| 속성           | 상세                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 설명           | LLM 입력/출력을 사용자 지정 API 엔드포인트에 기록                                                                                                          |
| 기록 Payload   | LiteLLM이 [`StandardLoggingPayload` objects](https://docs.litellm.ai/docs/proxy/logging_spec)의 list인 `List[StandardLoggingPayload]`를 엔드포인트에 기록합니다 |



다음과 같은 경우 사용합니다.

- Python이 아닌 프로그래밍 언어로 작성한 사용자 지정 콜백을 사용하려는 경우
- 콜백을 다른 마이크로서비스에서 실행하려는 경우

#### 사용법

1. LiteLLM `config.yaml`에 `success_callback: ["generic_api"]`를 설정합니다.

```yaml showLineNumbers title="litellm config.yaml"
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

litellm_settings:
  success_callback: ["generic_api"]
```

2. 사용자 지정 API 엔드포인트용 환경 변수를 설정합니다.

| 환경 변수                 | 상세                                                        | 필수                 |
| ------------------------- | ----------------------------------------------------------- | -------------------- |
| `GENERIC_LOGGER_ENDPOINT` | 콜백 로그를 전송할 엔드포인트 + route                       | 예                   |
| `GENERIC_LOGGER_HEADERS`  | 선택 사항: 사용자 지정 API 엔드포인트로 전송할 headers 설정 | 아니요, 선택 사항    |

```shell showLineNumbers title=".env"
GENERIC_LOGGER_ENDPOINT="https://webhook-test.com/30343bc33591bc5e6dc44217ceae3e0a"


# Optional: Set headers to be sent to the custom API endpoint
GENERIC_LOGGER_HEADERS="Authorization=Bearer <your-api-key>"
# if multiple headers, separate by commas
GENERIC_LOGGER_HEADERS="Authorization=Bearer <your-api-key>,X-Custom-Header=custom-header-value"
```

3. 프록시 시작

```shell
litellm --config /path/to/config.yaml
```

4. 테스트 요청을 전송합니다.

```shell
curl -i --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer sk-1234' \
    --data '{
    "model": "openai/gpt-4o",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
}'
```



## Langsmith

1. LiteLLM `config.yaml`에 `success_callback: ["langsmith"]`를 설정합니다.

사용자 지정 LangSmith instance를 사용하는 경우 `LANGSMITH_BASE_URL` 환경 변수가 해당 instance를 가리키도록 설정할 수 있습니다.

```yaml
litellm_settings:
  success_callback: ["langsmith"]

environment_variables:
  LANGSMITH_API_KEY: "lsv2_pt_xxxxxxxx"
  LANGSMITH_PROJECT: "litellm-proxy"

  LANGSMITH_BASE_URL: "https://api.smith.langchain.com" # (Optional - only needed if you have a custom Langsmith instance)
```


2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```
Langfuse에서 로그가 표시되는지 확인합니다.
<Image img={require('../../img/langsmith_new.png')} />


## Arize AI {#arize}

1. LiteLLM `config.yaml`에 `success_callback: ["arize"]`를 설정합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["arize"]

environment_variables:
    ARIZE_SPACE_KEY: "d0*****"
    ARIZE_API_KEY: "141a****"
    ARIZE_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize GRPC api endpoint
    ARIZE_HTTP_ENDPOINT: "https://otlp.arize.com/v1" # OPTIONAL - your custom arize HTTP api endpoint. Set either this or ARIZE_ENDPOINT
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```
Langfuse에서 로그가 표시되는지 확인합니다.
<Image img={require('../../img/langsmith_new.png')} />


## Langtrace

1. LiteLLM `config.yaml`에 `success_callback: ["langtrace"]`를 설정합니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["langtrace"]

environment_variables:
    LANGTRACE_API_KEY: "141a****"
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "fake-openai-endpoint",
      "messages": [
        {
          "role": "user",
          "content": "Hello, Claude gm!"
        }
      ],
    }
'
```

## Galileo

[베타]

[www.rungalileo.io](https://www.rungalileo.io/)에 LLM I/O를 기록합니다.

:::info

베타 통합

:::

**필수 환경 변수**

```bash
export GALILEO_BASE_URL=""  # For most users, this is the same as their console URL except with the word 'console' replaced by 'api' (e.g. http://www.console.galileo.myenterprise.com -> http://www.api.galileo.myenterprise.com)
export GALILEO_PROJECT_ID=""
export GALILEO_USERNAME=""
export GALILEO_PASSWORD=""
```

#### 빠른 시작 

1. `Config.yaml`에 추가합니다.

```yaml
model_list:
- litellm_params:
    api_base: https://exampleopenaiendpoint-production.up.railway.app/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  success_callback: ["galileo"] # 👈 KEY CHANGE
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

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
    }
'
```

이제 Galileo Dashboard에서 로그가 표시되는지 확인합니다.

## OpenMeter

[OpenMeter](../observability/openmeter.md)를 사용해 고객에게 LLM API 사용량 기준으로 과금합니다.

**필수 환경 변수**

```bash
# from https://openmeter.cloud
export OPENMETER_API_ENDPOINT="" # defaults to https://openmeter.cloud
export OPENMETER_API_KEY=""
```

##### 빠른 시작 

1. `Config.yaml`에 추가합니다.

```yaml
model_list:
- litellm_params:
    api_base: https://openai-function-calling-workers.tasslexyz.workers.dev/
    api_key: my-fake-key
    model: openai/my-fake-model
  model_name: fake-openai-endpoint

litellm_settings:
  success_callback: ["openmeter"] # 👈 KEY CHANGE
```

2. Proxy 시작

```
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

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
    }
'
```

<Image img={require('../../img/openmeter_img_2.png')} />

## DynamoDB

`--config`로 다음을 설정합니다.

- `litellm.success_callback = ["dynamodb"]` 
- `litellm.dynamodb_table_name = "your-table-name"`

이 설정은 성공한 모든 LLM 호출을 DynamoDB에 기록합니다.

**1단계** `.env`에 AWS 자격 증명 설정

```shell
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION_NAME = ""
```

**2단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["dynamodb"]
  dynamodb_table_name: your-table-name
```

**3단계**: 프록시를 시작하고 테스트 요청을 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "Azure OpenAI GPT-4 East",
    "messages": [
        {
        "role": "user",
        "content": "what llm are you"
        }
    ]
    }'
```

DynamoDB에서 로그를 확인할 수 있어야 합니다.

#### DynamoDB에 기록되는 데이터 /chat/completions

```json
{
  "id": {
    "S": "chatcmpl-8W15J4480a3fAQ1yQaMgtsKJAicen"
  },
  "call_type": {
    "S": "acompletion"
  },
  "endTime": {
    "S": "2023-12-15 17:25:58.424118"
  },
  "messages": {
    "S": "[{'role': 'user', 'content': 'This is a test'}]"
  },
  "metadata": {
    "S": "{}"
  },
  "model": {
    "S": "gpt-3.5-turbo"
  },
  "modelParameters": {
    "S": "{'temperature': 0.7, 'max_tokens': 100, 'user': 'ishaan-2'}"
  },
  "response": {
    "S": "ModelResponse(id='chatcmpl-8W15J4480a3fAQ1yQaMgtsKJAicen', choices=[Choices(finish_reason='stop', index=0, message=Message(content='Great! What can I assist you with?', role='assistant'))], created=1702641357, model='gpt-3.5-turbo-0613', object='chat.completion', system_fingerprint=None, usage=Usage(completion_tokens=9, prompt_tokens=11, total_tokens=20))"
  },
  "startTime": {
    "S": "2023-12-15 17:25:56.047035"
  },
  "usage": {
    "S": "Usage(completion_tokens=9, prompt_tokens=11, total_tokens=20)"
  },
  "user": {
    "S": "ishaan-2"
  }
}
```

#### DynamoDB에 기록되는 데이터 /embeddings

```json
{
  "id": {
    "S": "4dec8d4d-4817-472d-9fc6-c7a6153eb2ca"
  },
  "call_type": {
    "S": "aembedding"
  },
  "endTime": {
    "S": "2023-12-15 17:25:59.890261"
  },
  "messages": {
    "S": "['hi']"
  },
  "metadata": {
    "S": "{}"
  },
  "model": {
    "S": "text-embedding-ada-002"
  },
  "modelParameters": {
    "S": "{'user': 'ishaan-2'}"
  },
  "response": {
    "S": "EmbeddingResponse(model='text-embedding-ada-002-v2', data=[{'embedding': [-0.03503197431564331, -0.020601635798811913, -0.015375726856291294,
  }
}
```

## Sentry

API 호출이 실패하면(LLM/database) 해당 실패를 Sentry에 기록할 수 있습니다.

**1단계** Sentry 설치

```shell
uv add --upgrade sentry-sdk
```

**2단계**: Sentry_DSN을 저장하고 `litellm_settings`: `failure_callback`을 추가합니다.

```shell
export SENTRY_DSN="your-sentry-dsn"
# Optional: Configure Sentry sampling rates
export SENTRY_API_SAMPLE_RATE="1.0"  # Controls what percentage of errors are sent (default: 1.0 = 100%)
export SENTRY_API_TRACE_RATE="1.0"   # Controls what percentage of transactions are sampled for performance monitoring (default: 1.0 = 100%)
export SENTRY_ENVIRONMENT="development" # Controls the Sentry Environment (default: production)
```

```yaml 
model_list:
 - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  # other settings
  failure_callback: ["sentry"]
general_settings: 
  database_url: "my-bad-url" # set a fake url to trigger a sentry exception
```

**3단계**: 프록시를 시작하고 테스트 요청을 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```
litellm --test
```

## Athina

[Athina](https://athina.ai/)를 사용하면 모니터링, 분석, 관측성을 위해 LLM 입력/출력을 기록할 수 있습니다.

`--config`로 `litellm.success_callback = ["athina"]`를 설정합니다. 이 설정은 성공한 모든 LLM 호출을 athina에 기록합니다.

**1단계** Athina API 키 설정

```shell
ATHINA_API_KEY = "your-athina-api-key"
```

**2단계**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  success_callback: ["athina"]
```

**3단계**: 프록시를 시작하고 테스트 요청을 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 요청

```
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "which llm are you"
        }
    ]
    }'
```


<!-- ## (BETA) Azure Content Safety로 Moderation

Note: 이 페이지는 logging callbacks용이고 이 항목은 moderation service입니다. 더 적절한 위치를 찾을 때까지 주석 처리합니다.

[Azure Content-Safety](https://azure.microsoft.com/en-us/products/ai-services/ai-content-safety)는 text에서 잠재적으로 공격적이거나 유해하거나 위험한 content를 감지하는 content moderation APIs를 제공하는 Microsoft Azure service입니다.

`--config`로 `litellm.success_callback = ["azure_content_safety"]`를 설정합니다. 이 설정은 Azure Content Safety를 사용해 모든 LLM calls를 moderate합니다.

**Step 0** Azure Content Safety 배포

Azure Portal에서 Azure Content-Safety instance를 배포하고 `endpoint`와 `key`를 가져옵니다.

**Step 1** Athina API key 설정

```shell
AZURE_CONTENT_SAFETY_KEY = "<your-azure-content-safety-key>"
```

**Step 2**: `config.yaml` 파일을 만들고 `litellm_settings`: `success_callback`을 설정합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["azure_content_safety"]
  azure_content_safety_params:
    endpoint: "<your-azure-content-safety-endpoint>"
    key: "os.environ/AZURE_CONTENT_SAFETY_KEY"
```

**Step 3**: 프록시를 시작하고 테스트 request를 전송합니다.

프록시 시작

```shell
litellm --config config.yaml --debug
```

테스트 request

```
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data ' {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content": "Hi, how are you?"
            }
        ]
    }'
```

content가 `config.yaml`에 설정된 threshold보다 큰 값으로 감지되면 HTTP 400 error가 반환됩니다.
response의 상세 정보에는 다음이 포함됩니다.

- `source`: input text 또는 llm generated text
- `category`: moderation을 trigger한 content category
- `severity`: 0부터 10까지의 severity

**Step 4**: Azure Content Safety Thresholds 사용자 지정

`config.yaml`에서 `thresholds`를 설정해 category별 threshold를 사용자 지정할 수 있습니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
litellm_settings:
  callbacks: ["azure_content_safety"]
  azure_content_safety_params:
    endpoint: "<your-azure-content-safety-endpoint>"
    key: "os.environ/AZURE_CONTENT_SAFETY_KEY"
    thresholds:
      Hate: 6
      SelfHarm: 8
      Sexual: 6
      Violence: 4
```

:::info
`thresholds`는 기본적으로 필수가 아니지만 필요에 맞게 값을 조정할 수 있습니다.
기본값은 모든 category에 대해 `4`입니다.
::: -->
