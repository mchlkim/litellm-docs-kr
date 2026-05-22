import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI
LiteLLM은 OpenAI 채팅 및 임베딩 호출을 지원합니다.

:::tip
최신 OpenAI 모델(GPT-5, gpt-5-codex, o3-mini 등)에는 **`litellm.responses()` / Responses API 사용을 권장합니다.**
:::

### 필수 API 키

```python
import os 
os.environ["OPENAI_API_KEY"] = "your-api-key"
```

### 사용법
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "gpt-4o", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

:::info 메타데이터 패스스루(프리뷰)
`litellm.enable_preview_features = True`일 때 LiteLLM은 `metadata` 안의 값만 OpenAI로 전달합니다.

```python
completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "hi"}],
    metadata= {"custom_meta_key": "value"},
)
```
:::

### 사용법 - LiteLLM Proxy Server {#usage-litellm-proxy-server}

LiteLLM Proxy Server로 OpenAI 모델을 호출하는 방법은 다음과 같습니다.

### 1. 환경에 키 저장

```bash
export OPENAI_API_KEY=""
```

### 2. 프록시 시작 

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
<TabItem value="config-*" label="config.yaml - 모든 OpenAI 모델 프록시">

하나의 API 키로 모든 OpenAI 모델을 추가하려면 이 방식을 사용하세요. **경고: 이 방식은 부하 분산을 수행하지 않습니다.**
즉 `gpt-4`, `gpt-3.5-turbo`, `gpt-4-turbo-preview` 요청이 모두 이 경로를 통과합니다.

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
$ litellm --model gpt-3.5-turbo

# Server running on http://0.0.0.0:4000
```
</TabItem>

</Tabs>

### 3. 테스트


<Tabs>
<TabItem value="Curl" label="Curl 요청">

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
response = client.chat.completions.create(model="gpt-3.5-turbo", messages = [
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
    model = "gpt-3.5-turbo",
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


### 선택 키 - OpenAI Organization, OpenAI API Base {#optional-keys-openai-organization-openai-api-base}

```python
import os 
os.environ["OPENAI_ORGANIZATION"] = "your-org-id"       # OPTIONAL
os.environ["OPENAI_BASE_URL"] = "https://your_host/v1"     # OPTIONAL
```

### OpenAI Chat Completion 모델 {#openai-chat-completion-models}

| 모델 이름            | 함수 호출                                                   |
|-----------------------|-----------------------------------------------------------------|
| `gpt-5` | `response = completion(model="gpt-5", messages=messages)` |
| `gpt-5-mini` | `response = completion(model="gpt-5-mini", messages=messages)` |
| `gpt-5-nano` | `response = completion(model="gpt-5-nano", messages=messages)` |
| `gpt-5-chat` | `response = completion(model="gpt-5-chat", messages=messages)` |
| `gpt-5-chat-latest` | `response = completion(model="gpt-5-chat-latest", messages=messages)` |
| `gpt-5-2025-08-07` | `response = completion(model="gpt-5-2025-08-07", messages=messages)` |
| `gpt-5-mini-2025-08-07` | `response = completion(model="gpt-5-mini-2025-08-07", messages=messages)` |
| `gpt-5-nano-2025-08-07` | `response = completion(model="gpt-5-nano-2025-08-07", messages=messages)` |
| `gpt-5-pro` | `response = completion(model="gpt-5-pro", messages=messages)` |
| `gpt-5.2` | `response = completion(model="gpt-5.2", messages=messages)` |
| `gpt-5.2-2025-12-11` | `response = completion(model="gpt-5.2-2025-12-11", messages=messages)` |
| `gpt-5.2-chat-latest` | `response = completion(model="gpt-5.2-chat-latest", messages=messages)` |
| `gpt-5.3-chat-latest` | `response = completion(model="gpt-5.3-chat-latest", messages=messages)` |
| `gpt-5.4` | `response = completion(model="gpt-5.4", messages=messages)` |
| `gpt-5.4-2026-03-05` | `response = completion(model="gpt-5.4-2026-03-05", messages=messages)` |
| `gpt-5.5` | `response = completion(model="gpt-5.5", messages=messages)` |
| `gpt-5.5-2026-04-23` | `response = completion(model="gpt-5.5-2026-04-23", messages=messages)` |
| `gpt-5.2-pro` | `response = completion(model="gpt-5.2-pro", messages=messages)` |
| `gpt-5.2-pro-2025-12-11` | `response = completion(model="gpt-5.2-pro-2025-12-11", messages=messages)` |
| `gpt-5.4-pro` | `response = completion(model="gpt-5.4-pro", messages=messages)` |
| `gpt-5.4-pro-2026-03-05` | `response = completion(model="gpt-5.4-pro-2026-03-05", messages=messages)` |
| `gpt-5.5-pro` | `response = completion(model="gpt-5.5-pro", messages=messages)` |
| `gpt-5.5-pro-2026-04-23` | `response = completion(model="gpt-5.5-pro-2026-04-23", messages=messages)` |
| `gpt-5.1` | `response = completion(model="gpt-5.1", messages=messages)` |
| `gpt-5.1-codex` | `response = completion(model="gpt-5.1-codex", messages=messages)` |
| `gpt-5.1-codex-mini` | `response = completion(model="gpt-5.1-codex-mini", messages=messages)` |
| `gpt-5.1-codex-max` | `response = completion(model="gpt-5.1-codex-max", messages=messages)` |
| `gpt-4.1` | `response = completion(model="gpt-4.1", messages=messages)` |
| `gpt-4.1-mini` | `response = completion(model="gpt-4.1-mini", messages=messages)` |
| `gpt-4.1-nano` | `response = completion(model="gpt-4.1-nano", messages=messages)` |
| `o4-mini` | `response = completion(model="o4-mini", messages=messages)` |
| `o3-mini` | `response = completion(model="o3-mini", messages=messages)` |
| `o3` | `response = completion(model="o3", messages=messages)` |
| `o1-mini` | `response = completion(model="o1-mini", messages=messages)` |
| `o1-preview` | `response = completion(model="o1-preview", messages=messages)` |
| `gpt-4o-mini` | `response = completion(model="gpt-4o-mini", messages=messages)` |
| `gpt-4o-mini-2024-07-18` | `response = completion(model="gpt-4o-mini-2024-07-18", messages=messages)` |
| `gpt-4o` | `response = completion(model="gpt-4o", messages=messages)` |
| `gpt-4o-2024-08-06` | `response = completion(model="gpt-4o-2024-08-06", messages=messages)` |
| `gpt-4o-2024-05-13` | `response = completion(model="gpt-4o-2024-05-13", messages=messages)` |
| `gpt-4-turbo` | `response = completion(model="gpt-4-turbo", messages=messages)` |
| `gpt-4-turbo-preview` | `response = completion(model="gpt-4-0125-preview", messages=messages)` |
| `gpt-4-0125-preview` | `response = completion(model="gpt-4-0125-preview", messages=messages)` |
| `gpt-4-1106-preview` | `response = completion(model="gpt-4-1106-preview", messages=messages)` |
| `gpt-3.5-turbo-1106` | `response = completion(model="gpt-3.5-turbo-1106", messages=messages)` |
| `gpt-3.5-turbo` | `response = completion(model="gpt-3.5-turbo", messages=messages)` |
| `gpt-3.5-turbo-0301` | `response = completion(model="gpt-3.5-turbo-0301", messages=messages)` |
| `gpt-3.5-turbo-0613` | `response = completion(model="gpt-3.5-turbo-0613", messages=messages)` |
| `gpt-3.5-turbo-16k` | `response = completion(model="gpt-3.5-turbo-16k", messages=messages)` |
| `gpt-3.5-turbo-16k-0613` | `response = completion(model="gpt-3.5-turbo-16k-0613", messages=messages)` |
| `gpt-4` | `response = completion(model="gpt-4", messages=messages)` |
| `gpt-4-0314` | `response = completion(model="gpt-4-0314", messages=messages)` |
| `gpt-4-0613` | `response = completion(model="gpt-4-0613", messages=messages)` |
| `gpt-4-32k` | `response = completion(model="gpt-4-32k", messages=messages)` |
| `gpt-4-32k-0314` | `response = completion(model="gpt-4-32k-0314", messages=messages)` |
| `gpt-4-32k-0613` | `response = completion(model="gpt-4-32k-0613", messages=messages)` |


이 모델들은 사용자 지정 API 엔드포인트를 지정할 때 사용할 수 있는 `OPENAI_BASE_URL` 환경 변수도 지원합니다.

### OpenAI 웹 검색 모델

OpenAI는 엔드포인트에 따라 웹 검색을 사용하는 두 가지 방식을 제공합니다.

| 방식 | 엔드포인트 | 모델 | 활성화 방법 |
|----------|----------|--------|---------------|
| **검색 모델** | `/chat/completions` | `gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview` | `web_search_options` 파라미터 전달 |
| **웹 검색 도구** | `/responses` | `gpt-5`, `gpt-4.1`, `gpt-4o` 및 기타 일반 모델 | `web_search_preview` 도구 전달 |

<Tabs>
<TabItem value="sdk-completion" label="SDK - /chat/completions">

```python showLineNumbers
from litellm import completion

response = completion(
    model="openai/gpt-5-search-api",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    web_search_options={
        "search_context_size": "medium"  # Options: "low", "medium", "high"
    }
)
```

</TabItem>
<TabItem value="sdk-responses" label="SDK - /responses">

```python showLineNumbers
from litellm import responses

response = responses(
    model="openai/gpt-5",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"
    }]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  # Search model for /chat/completions
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY

  # Regular model for /responses with web_search_preview tool
  - model_name: gpt-5
    litellm_params:
      model: openai/gpt-5
      api_key: os.environ/OPENAI_API_KEY
```

</TabItem>
</Tabs>

전체 세부 정보는 [웹 검색 가이드](../completion/web_search.md)를 참고하세요.

## OpenAI Vision 모델 {#openai-vision-models}
| 모델 이름            | 함수 호출                                                   |
|-----------------------|-----------------------------------------------------------------|
| `gpt-4o` | `response = completion(model="gpt-4o", messages=messages)` |
| `gpt-4-turbo` | `response = completion(model="gpt-4-turbo", messages=messages)` |
| `gpt-4-vision-preview` | `response = completion(model="gpt-4-vision-preview", messages=messages)` |

#### 사용법
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

# openai call
response = completion(
    model = "gpt-4-vision-preview", 
    messages=[
        {
            "role": "user",
            "content": [
                            {
                                "type": "text",
                                "text": "What’s in this image?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                "url": "https://awsmp-logos.s3.amazonaws.com/seller-xw5kijmvmzasy/c233c9ade2ccb5491072ae232c814942.png"
                                }
                            }
                        ]
        }
    ],
)

```

## PDF 파일 파싱 {#pdf-file-parsing}

OpenAI는 PDF 파일을 전달하고 구조화된 출력으로 파싱할 수 있는 새로운 `file` 메시지 타입을 제공합니다. [자세히 보기](https://platform.openai.com/docs/guides/pdf-files?api-mode=chat&lang=python)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import base64
from litellm import completion

with open("draconomicon.pdf", "rb") as f:
    data = f.read()

base64_string = base64.b64encode(data).decode("utf-8")

completion = completion(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file": {
                        "filename": "draconomicon.pdf",
                        "file_data": f"data:application/pdf;base64,{base64_string}",
                    }
                },
                {
                    "type": "text",
                    "text": "What is the first dragon in the book?",
                }
            ],
        },
    ],
)

print(completion.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: openai-model
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ 
    "model": "openai-model",
    "messages": [
        {"role": "user", "content": [
            {
                "type": "file",
                "file": {
                    "filename": "draconomicon.pdf",
                    "file_data": f"data:application/pdf;base64,{base64_string}",
                }
            }
        ]}
    ]
}'
```

</TabItem>
</Tabs>

## OpenAI 파인 튜닝 모델 {#openai-fine-tuned-models}

| 모델 이름                | 함수 호출                                                          |
|---------------------------|-----------------------------------------------------------------|
| 파인 튜닝된 `gpt-4-0613`    | `response = completion(model="ft:gpt-4-0613", messages=messages)`     |
| 파인 튜닝된 `gpt-4o-2024-05-13` | `response = completion(model="ft:gpt-4o-2024-05-13", messages=messages)` |
| 파인 튜닝된 `gpt-3.5-turbo-0125` | `response = completion(model="ft:gpt-3.5-turbo-0125", messages=messages)` |
| 파인 튜닝된 `gpt-3.5-turbo-1106` | `response = completion(model="ft:gpt-3.5-turbo-1106", messages=messages)` |
| 파인 튜닝된 `gpt-3.5-turbo-0613` | `response = completion(model="ft:gpt-3.5-turbo-0613", messages=messages)` |

## [BETA] 모든 .completions 요청을 Responses API로 라우팅(더 나은 품질) {#beta-route-all-completions-requests-to-responses-api-better-quality}
 활성화하면 LiteLLM은 `litellm.completion()` 및 프록시 `/chat/completions` 엔드포인트의 OpenAI 트래픽을 Chat Completions 대신 [Responses API](https://platform.openai.com/docs/api-reference/responses)로 보냅니다. 이 경로는 일반적으로 OpenAI 최신 모델의 동작 및 품질과 일치합니다. 예: GPT-5 계열 모델의 추론 출력.

전역 또는 요청별로 옵트인할 수 있습니다.

**옵션 A - 요청별 접두사:** `openai/responses/` 모델 접두사를 사용합니다.

**옵션 B - 전역 플래그(권장):** 모든 OpenAI `/chat/completions` 요청을 Responses API로 자동 라우팅하려면 `route_all_chat_openai_to_responses = True`를 설정하세요. 모델 접두사는 필요하지 않습니다.

<Tabs>
<TabItem value="sdk-global" label="SDK - 전역 플래그">

```python
import litellm

litellm.route_all_chat_openai_to_responses = True

response = litellm.completion(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)
```

</TabItem>
<TabItem value="proxy-global" label="PROXY - 전역 플래그">

프록시 설정에 설정합니다.
```yaml
litellm_settings:
  route_all_chat_openai_to_responses: true
```

그 다음에는 일반적으로 호출하면 됩니다. 모델 접두사는 필요하지 않습니다.
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-5.4",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
}'
```

</TabItem>
</Tabs>

:::note
`route_all_chat_openai_to_responses`는 `openai` 프로바이더에만 적용됩니다. Azure OpenAI에는 영향을 주지 않습니다. 환경 변수로도 설정할 수 있습니다: `LITELLM_ROUTE_ALL_CHAT_OPENAI_TO_RESPONSES=true`.
:::

**옵션 A - 요청별 접두사:** 개별 모델 이름에 `openai/responses/`를 붙여 해당 호출만 Responses API로 라우팅할 수도 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">
```python
response = litellm.completion(
    model="openai/responses/gpt-5-mini", # tells litellm to call the model via the Responses API
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{ 
    "model": "openai/responses/gpt-5-mini",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low"
}'
```
</TabItem>
</Tabs>

예상 응답:
```json
{
  "id": "chatcmpl-6382a222-43c9-40c4-856b-22e105d88075",
  "created": 1760146746,
  "model": "gpt-5-mini",
  "object": "chat.completion",
  "system_fingerprint": null,
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Paris",
        "role": "assistant",
        "tool_calls": null,
        "function_call": null,
        "reasoning_content": "**Identifying the capital**\n\nThe user wants me to think of the capital of France and write it down. That's pretty straightforward: it's Paris. There aren't any safety issues to consider here. I think it would be best to keep it concise, so maybe just \"Paris\" would suffice. I feel confident that I should just stick to that without adding anything else. So, let's write it down!",
        "provider_specific_fields": null
      }
    }
  ],
  "usage": {
    "completion_tokens": 7,
    "prompt_tokens": 18,
    "total_tokens": 25,
    "completion_tokens_details": null,
    "prompt_tokens_details": {
      "audio_tokens": null,
      "cached_tokens": 0,
      "text_tokens": null,
      "image_tokens": null
    }
  }
}

```

### 고급: `summary` 필드와 함께 `reasoning_effort` 사용

기본적으로 `reasoning_effort`는 문자열 값(`"none"`, `"minimal"`, `"low"`, `"medium"`, `"high"`, `"xhigh"`)을 받으며 추론 요약 없이 effort 수준만 설정합니다. `"xhigh"`는 `gpt-5.1-codex-max` 및 `gpt-5.2` 모델에서만 지원됩니다.

`summary` 기능을 옵트인하려면 `reasoning_effort`를 딕셔너리로 전달할 수 있습니다. **참고:** `summary` 필드를 사용하려면 OpenAI organization이 검증 상태여야 합니다. 검증 없이 `summary`를 사용하면 OpenAI에서 400 오류가 반환됩니다.

<Tabs>
<TabItem value="sdk" label="SDK">
```python
# Option 1: String format (default - no summary)
response = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="high"  # Only sets effort level
)

# Option 2: Dict format (with optional summary - requires org verification)
response = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort={"effort": "high", "summary": "auto"}  # "auto", "detailed", or "concise" (not all supported by all models)
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
# Option 1: String format (default - no summary)
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "openai/responses/gpt-5-mini",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "high"
}'

# Option 2: Dict format (with optional summary - requires org verification)
# summary options: "auto", "detailed", or "concise" (not all supported by all models)
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "openai/responses/gpt-5-mini",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": {"effort": "high", "summary": "auto"}
}'
```
</TabItem>
</Tabs>

**요약 필드 옵션:**
- `"auto"`: 시스템이 모델을 기준으로 적절한 요약 수준을 자동 결정합니다.
- `"concise"`: 더 짧은 요약을 제공합니다. GPT-5 계열 모델에서는 지원되지 않습니다.
- `"detailed"`: 포괄적인 추론 요약을 제공합니다.

**참고:** GPT-5 계열 모델은 `"auto"`와 `"detailed"`를 지원하지만 `"concise"`는 지원하지 않습니다. O-series 모델(o3-pro, o4-mini, o3)은 세 가지 옵션을 모두 지원합니다. o3-mini와 o1 같은 일부 모델은 추론 요약을 전혀 지원하지 않습니다.

**모델별 지원 `reasoning_effort` 값:**

| 모델 | 기본값(미설정 시) | 지원 값 |
|-------|----------------------|------------------|
| `gpt-5.1` | `none` | `none`, `low`, `medium`, `high` |
| `gpt-5` | `medium` | `minimal`, `low`, `medium`, `high` |
| `gpt-5-mini` | `medium` | `minimal`, `low`, `medium`, `high` |
| `gpt-5-nano` | `none` | `none`, `low`, `medium`, `high` |
| `gpt-5-codex` | `adaptive` | `low`, `medium`, `high` (`minimal` 없음) |
| `gpt-5.1-codex` | `adaptive` | `low`, `medium`, `high` (`minimal` 없음) |
| `gpt-5.1-codex-mini` | `adaptive` | `low`, `medium`, `high` (`minimal` 없음) |
| `gpt-5.1-codex-max` | `adaptive` | `low`, `medium`, `high`, `xhigh` (`minimal` 없음) |
| `gpt-5.2` | `medium` | `none`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.2-pro` | `high` | `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5` | `medium` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5.5-pro` | `high` | `minimal`, `low`, `medium`, `high`, `xhigh` |
| `gpt-5-pro` | `high` | `high`만 |

**참고:**
- GPT-5.1은 더 빠르고 지연 시간이 낮은 응답을 위해 새로운 `reasoning_effort="none"` 설정을 도입했습니다. 이는 GPT-5의 `"minimal"` 설정을 대체합니다.
- `gpt-5.1-codex-max`, `gpt-5.2`, `gpt-5.2-pro`, `gpt-5.5`, `gpt-5.5-pro`는 `reasoning_effort="xhigh"`를 지원합니다. 이 목록 밖의 모델은 해당 값을 거부합니다.
- `gpt-5-pro`는 `reasoning_effort="high"`만 허용합니다. 다른 값은 오류를 반환합니다.
- `reasoning_effort`가 설정되지 않은 경우(None), OpenAI는 "기본값" 열에 표시된 값을 기본으로 사용합니다.

organization 검증 요구사항에 대한 자세한 내용은 [OpenAI 추론 문서](https://platform.openai.com/docs/guides/reasoning)을 참고하세요.

### `reasoning_items`를 사용한 다중 턴 대화 {#multi-turn-conversation-with-reasoning-items}

다중 턴 대화에는 `reasoning_items`가 필요합니다. 이는 OpenAI가 다음 요청에서 추론 상태를 복원하는 데 사용하는 `encrypted_content` 토큰을 포함하는 구조화된 블록입니다. 해당 토큰을 반환받고 싶은 모든 호출에 `include=["reasoning.encrypted_content"]`를 전달하세요.

<Tabs>
<TabItem value="non-streaming" label="비스트리밍">

```python showLineNumbers title="Non-streaming: round-trip reasoning_items"
import litellm

messages = [{"role": "user", "content": "Solve this step by step: 2 + 2"}]

# Turn 1 — get reasoning_items (encrypted_content);
response = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)

assistant_msg = response.choices[0].message

# Turn 2 — pass reasoning_items back; LiteLLM converts to the correct Responses API format
messages.append({
    "role": "assistant",
    "content": assistant_msg.content,
    "reasoning_items": assistant_msg.reasoning_items,
})
messages.append({"role": "user", "content": "Now summarize your reasoning."})

response2 = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)
```

</TabItem>
<TabItem value="streaming" label="스트리밍">

`encrypted_content`가 포함된 `reasoning_items`는 전체 응답이 완료될 때 마지막 청크에 도착합니다.

```python showLineNumbers title="Streaming: collect and round-trip reasoning_items"
import litellm

messages = [{"role": "user", "content": "Solve this step by step: 2 + 2"}]

collected_content = []
collected_reasoning_items = []

stream = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=messages,
    stream=True,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)

for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        collected_content.append(delta.content)
    if getattr(delta, "reasoning_items", None):
        collected_reasoning_items.extend(delta.reasoning_items)

messages.append({
    "role": "assistant",
    "content": "".join(collected_content),
    "reasoning_items": collected_reasoning_items or None,
})
messages.append({"role": "user", "content": "Continue the conversation."})

response2 = litellm.completion(
    model="openai/responses/gpt-5-mini",
    messages=messages,
    reasoning_effort="low",
    include=["reasoning.encrypted_content"],
)
```

</TabItem>
</Tabs>

### GPT-5 모델의 상세도 제어 {#gpt-5-model-verbosity-control}

`verbosity` 파라미터는 GPT-5 계열 모델 응답의 길이와 상세 수준을 제어합니다. `"low"`, `"medium"`, `"high"` 세 가지 값을 받습니다.

**지원 모델:** `gpt-5`, `gpt-5.1`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5-pro`

**참고:** GPT-5-Codex 모델(`gpt-5-codex`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-codex-max`)은 `verbosity` 파라미터를 지원하지 않습니다.

**사용 사례:**
- **`"low"`**: 간결한 답변 또는 단순 코드 생성에 적합합니다. 예: SQL 쿼리.
- **`"medium"`**: 기본값 - 균형 잡힌 출력 길이.
- **`"high"`**: 자세한 설명이나 광범위한 코드 리팩터링이 필요할 때 사용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">
```python
import litellm

# Low verbosity - concise responses
response = litellm.completion(
    model="gpt-5.1",
    messages=[{"role": "user", "content": "Write a function to reverse a string"}],
    verbosity="low"
)

# High verbosity - detailed responses
response = litellm.completion(
    model="gpt-5.1",
    messages=[{"role": "user", "content": "Explain how neural networks work"}],
    verbosity="high"
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">
```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-5.1",
    "messages": [{"role": "user", "content": "Write a function to reverse a string"}],
    "verbosity": "low"
}'
```
</TabItem>
</Tabs>


## OpenAI Chat Completion에서 Responses API로 연결하는 브리지 {#openai-chat-completion-to-responses-api-bridge}

LiteLLM은 채팅 completion에서 Responses API로 이어지는 브리지를 제공합니다. 이를 통해 completion 인터페이스를 사용하면서 내부적으로 Responses API를 호출할 수 있습니다.

[Responses API](https://platform.openai.com/docs/api-reference/responses) 전용 기능(내장 도구, web search preview, code interpreter 등)을 사용하고 싶을 때 유용합니다.

:::tip gpt-5.4+ + reasoning_effort + 함수 도구

도구가 포함된 `gpt-5.4` 이상(`gpt-5.4`, `gpt-5.5`, 향후 5.x release) 요청을 `litellm.completion()`으로 보낼 때 LiteLLM은 `reasoning_effort`를 제거합니다. 이 조합은 Responses API에서만 지원되기 때문입니다.

추론과 도구를 함께 사용해야 한다면 responses bridge를 사용하세요. `tools`와 `reasoning_effort`가 모두 설정된 경우 LiteLLM도 이러한 요청을 `/v1/responses`로 자동 라우팅합니다.

```python
response = litellm.completion(
    model="openai/responses/gpt-5.5",  # routes to /v1/responses
    messages=[{"role": "user", "content": "What's the weather?"}],
    tools=[...],
    reasoning_effort="low",
)
```

:::

### `openai/responses/` 접두사 사용 시점 {#when-to-use-openai-responses-prefix}

각 모델에는 기본적으로 사용할 API 엔드포인트를 결정하는 `mode` property가 [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)에 정의되어 있습니다.

- **`mode: responses`** - 모델이 Responses API를 자동 사용합니다.
- **`mode: chat`** - 모델이 기본적으로 Chat Completions API를 사용합니다.

**`mode: responses`인 모델** (Responses API 자동 사용):
- `o3-deep-research`, `o4-mini-deep-research`
- `o1-pro`, `o3-pro`
- `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-codex-max`
- `codex-mini-latest`

**`mode: chat`인 모델** (내장 도구에는 `openai/responses/` 접두사 필요):
- `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4.1-mini`
- `gpt-5`, `gpt-5-mini`
- `o3`, `o4-mini`

`mode: chat` 모델에서 `web_search_preview` 같은 내장 도구를 사용하려면 `openai/responses/` 접두사를 추가하세요.

```python
# This will FAIL - gpt-4o has mode: chat, uses Chat Completions API
response = litellm.completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[{"type": "web_search_preview"}],  # Not supported in Chat Completions
    # ... other kwargs
)

# This will WORK - prefix forces Responses API
response = litellm.completion(
    model="openai/responses/gpt-4o",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[{"type": "web_search_preview"}],  # Supported in Responses API
    # ... other kwargs
)
```

### 예제

<Tabs>
<TabItem value="sdk" label="SDK">

**`mode: responses` 모델 사용(자동):**

```python
import litellm
import os

os.environ["OPENAI_API_KEY"] = "sk-1234"

response = litellm.completion(
    model="o3-deep-research-2025-06-26",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    tools=[
        {"type": "web_search_preview"},
        {"type": "code_interpreter", "container": {"type": "auto"}},
    ],
)
print(response)
```

**`mode: chat` 모델 사용(접두사 필요):**

```python
import litellm
import os

os.environ["OPENAI_API_KEY"] = "sk-1234"

# Use the openai/responses/ prefix to enable built-in tools
response = litellm.completion(
    model="openai/responses/gpt-4o",
    messages=[{"role": "user", "content": "What is the weather in Paris today?"}],
    tools=[
        {"type": "web_search_preview"},
    ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  # Model with mode: responses (automatic)
  - model_name: o3-deep-research
    litellm_params:
      model: o3-deep-research-2025-06-26
      api_key: os.environ/OPENAI_API_KEY

  # Model with mode: chat (use prefix for built-in tools)
  - model_name: gpt-4o-with-tools
    litellm_params:
      model: openai/responses/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "gpt-4o-with-tools",
    "messages": [
        {"role": "user", "content": "What is the weather in Paris today?"}
    ],
    "tools": [
        {"type": "web_search_preview"}
    ]
}'
```

</TabItem>
</Tabs>


## OpenAI 오디오 전사

LiteLLM은 OpenAI Audio Transcription 엔드포인트를 지원합니다.

지원 모델:

| 모델 이름                | 함수 호출                                                          |
|---------------------------|-----------------------------------------------------------------|
| `whisper-1`    | `response = completion(model="whisper-1", file=audio_file)`     |
| `gpt-4o-transcribe` | `response = completion(model="gpt-4o-transcribe", file=audio_file)` |
| `gpt-4o-mini-transcribe` | `response = completion(model="gpt-4o-mini-transcribe", file=audio_file)` |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import transcription
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""
audio_file = open("/path/to/audio.mp3", "rb")

response = transcription(model="gpt-4o-transcribe", file=audio_file)

print(f"response: {response}")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
- model_name: gpt-4o-transcribe
  litellm_params:
    model: gpt-4o-transcribe
    api_key: os.environ/OPENAI_API_KEY
  model_info:
    mode: audio_transcription
    
general_settings:
  master_key: sk-1234
```

2. 프록시 시작

```bash
litellm --config config.yaml
```

3. 테스트

```bash
curl --location 'http://0.0.0.0:8000/v1/audio/transcriptions' \
--header 'Authorization: Bearer sk-1234' \
--form 'file=@"/Users/krrishdholakia/Downloads/gettysburg.wav"' \
--form 'model="gpt-4o-transcribe"'
```



</TabItem>
</Tabs>



## 고급

### OpenAI API 응답 헤더 가져오기 {#get-openai-api-response-headers}

OpenAI의 원시 응답 헤더를 가져오려면 `litellm.return_response_headers = True`를 설정하세요.

`litellm.completion()`, `litellm.embedding()` 함수에서 항상 `_response_headers` 필드를 받을 수 있습니다.

<Tabs>
<TabItem value="litellm.completion" label="litellm.completion">

```python
litellm.return_response_headers = True

# /chat/completion
response = completion(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": "hi",
        }
    ],
)
print(f"response: {response}")
print("_response_headers=", response._response_headers)
```
</TabItem>

<TabItem value="litellm.completion - streaming" label="litellm.completion + stream">

```python
litellm.return_response_headers = True

# /chat/completion
response = completion(
    model="gpt-4o-mini",
    stream=True,
    messages=[
        {
            "role": "user",
            "content": "hi",
        }
    ],
)
print(f"response: {response}")
print("response_headers=", response._response_headers)
for chunk in response:
    print(chunk)
```
</TabItem>

<TabItem value="litellm.embedding" label="litellm.embedding">

```python
litellm.return_response_headers = True

# embedding
embedding_response = litellm.embedding(
    model="text-embedding-ada-002",
    input="hello",
)

embedding_response_headers = embedding_response._response_headers
print("embedding_response_headers=", embedding_response_headers)
```

</TabItem>
</Tabs>
OpenAI의 예상 응답 헤더

```json
{
  "date": "Sat, 20 Jul 2024 22:05:23 GMT",
  "content-type": "application/json",
  "transfer-encoding": "chunked",
  "connection": "keep-alive",
  "access-control-allow-origin": "*",
  "openai-model": "text-embedding-ada-002",
  "openai-organization": "*****",
  "openai-processing-ms": "20",
  "openai-version": "2020-10-01",
  "strict-transport-security": "max-age=15552000; includeSubDomains; preload",
  "x-ratelimit-limit-requests": "5000",
  "x-ratelimit-limit-tokens": "5000000",
  "x-ratelimit-remaining-requests": "4999",
  "x-ratelimit-remaining-tokens": "4999999",
  "x-ratelimit-reset-requests": "12ms",
  "x-ratelimit-reset-tokens": "0s",
  "x-request-id": "req_cc37487bfd336358231a17034bcfb4d9",
  "cf-cache-status": "DYNAMIC",
  "set-cookie": "__cf_bm=E_FJY8fdAIMBzBE2RZI2.OkMIO3lf8Hz.ydBQJ9m3q8-1721513123-1.0.1.1-6OK0zXvtd5s9Jgqfz66cU9gzQYpcuh_RLaUZ9dOgxR9Qeq4oJlu.04C09hOTCFn7Hg.k.2tiKLOX24szUE2shw; path=/; expires=Sat, 20-Jul-24 22:35:23 GMT; domain=.api.openai.com; HttpOnly; Secure; SameSite=None, *cfuvid=SDndIImxiO3U0aBcVtoy1TBQqYeQtVDo1L6*Nlpp7EU-1721513123215-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
  "x-content-type-options": "nosniff",
  "server": "cloudflare",
  "cf-ray": "8a66409b4f8acee9-SJC",
  "content-encoding": "br",
  "alt-svc": "h3=\":443\"; ma=86400"
}
```

### 병렬 함수 호출 {#parallel-function-calling}
LiteLLM에서 병렬 함수 호출을 사용하는 자세한 단계별 설명은 [여기](https://docs.litellm.ai/docs/completion/function_call)를 참고하세요.
```python
import litellm
import json
# set openai api key
import os
os.environ['OPENAI_API_KEY'] = "" # litellm reads OPENAI_API_KEY from .env and sends the request
# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    if "tokyo" in location.lower():
        return json.dumps({"location": "Tokyo", "temperature": "10", "unit": "celsius"})
    elif "san francisco" in location.lower():
        return json.dumps({"location": "San Francisco", "temperature": "72", "unit": "fahrenheit"})
    elif "paris" in location.lower():
        return json.dumps({"location": "Paris", "temperature": "22", "unit": "celsius"})
    else:
        return json.dumps({"location": location, "temperature": "unknown"})

messages = [{"role": "user", "content": "What's the weather like in San Francisco, Tokyo, and Paris?"}]
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
        },
    }
]

response = litellm.completion(
    model="gpt-3.5-turbo-1106",
    messages=messages,
    tools=tools,
    tool_choice="auto",  # auto is default, but we'll be explicit
)
print("\nLLM Response1:\n", response)
response_message = response.choices[0].message
tool_calls = response.choices[0].message.tool_calls
```

### completion 호출에 `extra_headers` 설정 {#setting-extra-headers-for-completion-call}
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model = "gpt-3.5-turbo", 
    messages=[{ "content": "Hello, how are you?","role": "user"}],
    extra_headers={"AI-Resource Group": "ishaan-resource"}
)
```

### completion 호출에 Organization-ID 설정 {#setting-organization-id-for-completion-call}
다음 방법 중 하나로 설정할 수 있습니다.
- 환경 변수 `OPENAI_ORGANIZATION`
- `litellm.completion(model=model, organization="your-organization-id")` 파라미터
- `litellm.organization="your-organization-id"`로 설정
```python
import os 
from litellm import completion

os.environ["OPENAI_API_KEY"] = "your-api-key"
os.environ["OPENAI_ORGANIZATION"] = "your-org-id" # OPTIONAL

response = completion(
    model = "gpt-3.5-turbo", 
    messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

### `ssl_verify=False` 설정

자체 `httpx.Client`를 설정해 적용합니다.

- `litellm.completion`에는 `litellm.client_session=httpx.Client(verify=False)`를 설정합니다.
- `litellm.acompletion`에는 `litellm.aclient_session=AsyncClient.Client(verify=False)`를 설정합니다.
```python
import litellm, httpx

# for completion
litellm.client_session = httpx.Client(verify=False)
response = litellm.completion(
    model="gpt-3.5-turbo",
    messages=messages,
)

# for acompletion
litellm.aclient_session = httpx.AsyncClient(verify=False)
response = litellm.acompletion(
    model="gpt-3.5-turbo",
    messages=messages,
)
```


### LiteLLM에서 OpenAI Proxy 사용 {#using-openai-proxy-with-litellm}
```python
import os 
import litellm
from litellm import completion

os.environ["OPENAI_API_KEY"] = ""

# set custom api base to your proxy
# either set .env or litellm.api_base
# os.environ["OPENAI_BASE_URL"] = "https://your_host/v1"
litellm.api_base = "https://your_host/v1"


messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion("openai/your-model-name", messages)
```

`api_base`를 동적으로 설정해야 한다면 completions에 직접 전달하세요. `completions(...,api_base="your-proxy-api-base")`

자세한 내용은 [API Base/Keys 설정](../set_keys.md)을 참고하세요.

### Proxy 요청의 Org ID 전달 {#pass-org-id-for-proxy-requests}

`forward_openai_org_id` 파라미터를 사용해 클라이언트의 OpenAI Org ID를 OpenAI로 전달합니다.

1. config.yaml 설정

```yaml
model_list:
  - model_name: "gpt-3.5-turbo"
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

general_settings:
    forward_openai_org_id: true # 👈 KEY CHANGE
```

2. Proxy 시작

```bash
litellm --config config.yaml --detailed_debug

# RUNNING on http://0.0.0.0:4000
```

3. OpenAI 호출 실행

```python
from openai import OpenAI
client = OpenAI(
    api_key="sk-1234",
    organization="my-special-org",
    base_url="http://0.0.0.0:4000"
)

client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": "Hello world"}])
```

로그에서 전달된 org id를 확인할 수 있어야 합니다.

```bash
LiteLLM:DEBUG: utils.py:255 - Request to litellm:
LiteLLM:DEBUG: utils.py:255 - litellm.acompletion(... organization='my-special-org',)
```

## GPT-5 Pro 특별 참고

GPT-5 Pro는 OpenAI의 가장 고급 추론 모델이며 고유한 특성을 가집니다.

- **Responses API 전용**: GPT-5 Pro는 `/v1/responses` 엔드포인트에서만 사용할 수 있습니다.
- **Streaming 미지원**: 스트리밍 응답을 지원하지 않습니다.
- **높은 추론**: 높은 effort의 추론이 필요한 복잡한 추론 작업용으로 설계되었습니다.
- **컨텍스트 창**: 입력 400,000 tokens, 출력 272,000 tokens.
- **가격**: 1M token당 입력 $15.00 / 출력 $120.00(Standard), 입력 $7.50 / 출력 $60.00(Batch).
- **도구**: Web Search, File Search, Image Generation, MCP를 지원합니다. Code Interpreter 또는 Computer Use는 지원하지 않습니다.
- **모달리티**: Text 및 Image 입력, Text 출력만 지원합니다.

```python
# GPT-5 Pro usage example
response = completion(
    model="gpt-5-pro", 
    messages=[{"role": "user", "content": "Solve this complex reasoning problem..."}]
)
```

## 비디오 생성

LiteLLM은 Sora를 포함한 OpenAI 비디오 생성 모델을 지원합니다.

비디오 생성에 대한 자세한 문서는 [OpenAI Video Generation →](./openai/videos.md)를 참고하세요.
