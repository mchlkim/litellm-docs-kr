import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock
모든 Bedrock 모델(Anthropic, Meta, Deepseek, Mistral, Amazon 등)을 지원합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Amazon Bedrock은 고성능 파운데이션 모델(FM)을 선택해 사용할 수 있는 완전 관리형 서비스입니다. |
| LiteLLM의 제공자 라우트 | `bedrock/`, `bedrock/converse/`, `bedrock/invoke/`, `bedrock/converse_like/`, `bedrock/llama/`, `bedrock/deepseek_r1/`, `bedrock/qwen3/`, `bedrock/qwen2/`, `bedrock/openai/`, `bedrock/moonshot` |
| 제공자 문서 | [Amazon Bedrock ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) |
| 지원되는 OpenAI 엔드포인트 | `/chat/completions`, `/completions`, `/embeddings`, `/images/generations`, `/v1/realtime`|
| 재정렬 엔드포인트 | `/rerank` |
| 패스스루 엔드포인트 | [지원됨](../pass_through/bedrock.md) |


Bedrock 요청을 사용하려면 시스템에 `boto3`가 설치되어 있어야 합니다.
```shell
uv add boto3>=1.28.57
```

:::info

**Amazon Nova 모델**은 v1.53.5 이상으로 올리세요.

:::

## 인증

:::info

LiteLLM은 boto3를 사용해 인증을 처리합니다. 다음 boto3 자격 증명 옵션을 모두 지원합니다: https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#credentials.

:::
 
LiteLLM은 기존 boto3 인증 방식 외에도 API key 인증을 지원합니다. API key 세부 정보는 [문서](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)를 참고하세요.

옵션 1: `AWS_BEARER_TOKEN_BEDROCK` 환경 변수 사용

```bash
export AWS_BEARER_TOKEN_BEDROCK="your-api-key"
```

옵션 2: completion, embedding, image_generation API 호출에 `api_key` 매개변수로 API key 전달

<Tabs>
<TabItem value="sdk" label="SDK">
```python
response = completion(
  model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  api_key="your-api-key"
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">
```yaml
model_list:
  - model_name: bedrock-claude-3-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      api_key: os.environ/AWS_BEARER_TOKEN_BEDROCK
```
</TabItem>
</Tabs>

## 사용법

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_Bedrock.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Colab에서 열기"/>
</a>


```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

## LiteLLM 프록시 사용법

LiteLLM 프록시 서버로 Bedrock을 호출하는 방법입니다.

### 1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-3-5-sonnet
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

사용 가능한 모든 인증 매개변수:

```
aws_access_key_id: Optional[str],
aws_secret_access_key: Optional[str],
aws_session_token: Optional[str],
aws_region_name: Optional[str],
aws_session_name: Optional[str],
aws_profile_name: Optional[str],
aws_role_name: Optional[str],
aws_web_identity_token: Optional[str],
aws_bedrock_runtime_endpoint: Optional[str],
api_key: Optional[str],
```

### 2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```
### 3. 테스트


<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "bedrock-claude-v1",
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
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
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
    model = "bedrock-claude-v1",
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

## temperature, top p 등 설정

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  temperature=0.7,
  top_p=1
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에 설정**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/anthropic.claude-instant-v1
      temperature: <your-temp>
      top_p: <your-top-p>
```

**요청에 설정**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
top_p=1
)

print(response)

```

</TabItem>
</Tabs>

## 제공자별 매개변수 전달

LiteLLM에 OpenAI가 아닌 매개변수를 전달하면 제공자별 매개변수로 간주하고 요청 본문의 kwarg로 보냅니다. [더 보기](../completion/input.md#provider-specific-params)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에 설정**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/anthropic.claude-instant-v1
      top_k: 1 # 👈 PROVIDER-SPECIFIC PARAM
```

**요청에 설정**

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    top_k=1 # 👈 PROVIDER-SPECIFIC PARAM
}
)

print(response)

```

</TabItem>
</Tabs>

## 사용법 - 요청 메타데이터

로깅과 비용 귀속을 위해 Bedrock 요청에 메타데이터를 붙입니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    requestMetadata={
        "cost_center": "engineering",
        "user_id": "user123"
    }
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에 설정**

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      requestMetadata:
        cost_center: "engineering"
```

**요청에 설정**

```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="bedrock-claude-v1",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "requestMetadata": {"cost_center": "engineering"}
    }
)
```

</TabItem>
</Tabs>

## 사용법 - 함수 호출 / 도구 호출

LiteLLM은 Bedrock의 Converse 및 Invoke API를 통한 도구 호출을 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

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
messages = [{"role": "user", "content": "What's the weather like in Boston today?"}]

response = completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
# Add any assertions, here to check response args
print(response)
assert isinstance(response.choices[0].message.tool_calls[0].function.name, str)
assert isinstance(
    response.choices[0].message.tool_calls[0].function.arguments, str
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0 # for bedrock invoke, specify `bedrock/invoke/<model>`
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "bedrock-claude-3-7",
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
</Tabs>


## 사용법 - 비전

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


def encode_image(image_path):
    import base64

    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


image_path = "../proxy/cached_logo.jpg"
# Getting the base64 string
base64_image = encode_image(image_path)
resp = litellm.completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Whats in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + base64_image
                    },
                },
            ],
        }
    ],
)
print(f"\nResponse: {resp}")
```


## 사용법 - 'thinking' / 'reasoning content' {#usage---thinking--reasoning-content}

현재 Anthropic Claude 3.7 Sonnet, Deepseek R1, GPT-OSS 모델에서만 지원됩니다.

v1.61.20 이상에서 작동합니다.

`message` 및 `delta` 객체에 두 개의 새 필드를 반환합니다.
- `reasoning_content` - string - 응답의 reasoning content입니다.
- `thinking_blocks` - 객체 목록(Anthropic 전용) - 응답의 thinking 블록

각 객체에는 다음 필드가 있습니다.
- `type` - Literal["thinking"] - thinking 블록 타입
- `thinking` - string - 응답의 thinking입니다. `reasoning_content`에도 반환됩니다.
- `signature` - string - Anthropic이 반환하는 base64 인코딩 문자열입니다.

후속 호출에 'thinking' content를 전달하는 경우 Anthropic은 `signature`를 요구합니다(`thinking`을 도구 호출과 함께 사용할 때만 필요). [자세히 알아보기](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#understanding-thinking-blocks)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


resp = completion(
    model="bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    reasoning_effort="low",
)

print(resp)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0
      reasoning_effort: "low" # 👈 EITHER HERE OR ON REQUEST
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "reasoning_effort": "low" # 👈 EITHER HERE OR ON CONFIG.YAML
  }'
```

</TabItem>
</Tabs>


**예상 응답**

[Anthropic API 응답](../providers/anthropic#usage---thinking--reasoning_content)과 동일합니다.

```python
{
    "id": "chatcmpl-c661dfd7-7530-49c9-b0cc-d5018ba4727d",
    "created": 1740640366,
    "model": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    "object": "chat.completion",
    "system_fingerprint": null,
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "The capital of France is Paris. It's not only the capital city but also the largest city in France, serving as the country's major cultural, economic, and political center.",
                "role": "assistant",
                "tool_calls": null,
                "function_call": null,
                "reasoning_content": "The capital of France is Paris. This is a straightforward factual question.",
                "thinking_blocks": [
                    {
                        "type": "thinking",
                        "thinking": "The capital of France is Paris. This is a straightforward factual question.",
                        "signature": "EqoBCkgIARABGAIiQL2UoU0b1OHYi+yCHpBY7U6FQW8/FcoLewocJQPa2HnmLM+NECy50y44F/kD4SULFXi57buI9fAvyBwtyjlOiO0SDE3+r3spdg6PLOo9PBoMma2ku5OTAoR46j9VIjDRlvNmBvff7YW4WI9oU8XagaOBSxLPxElrhyuxppEn7m6bfT40dqBSTDrfiw4FYB4qEPETTI6TA6wtjGAAqmFqKTo="
                    }
                ]
            }
        }
    ],
    "usage": {
        "completion_tokens": 64,
        "prompt_tokens": 42,
        "total_tokens": 106,
        "completion_tokens_details": null,
        "prompt_tokens_details": null
    }
}
```

### Anthropic 모델에 `thinking` 전달

[Anthropic API 응답](../providers/anthropic#usage---thinking--reasoning_content)과 동일합니다.


## 사용법 - Anthropic 베타 기능 {#usage---anthropic-beta-features}

LiteLLM은 AWS Bedrock에서 `anthropic-beta` 헤더를 통해 Anthropic 베타 기능을 지원합니다. 이를 통해 다음 실험적 기능에 접근할 수 있습니다.

- **1M 컨텍스트 창** - 최대 100만 토큰 컨텍스트(Claude Opus 4.6, Sonnet 4.5, Sonnet 4)
- **Computer Use 도구** - 컴퓨터 인터페이스와 상호작용할 수 있는 AI
- **토큰 효율 도구** - 더 효율적인 도구 사용 패턴
- **확장 출력** - 최대 128K 출력 토큰
- **향상된 Thinking** - 고급 reasoning 기능

### 지원되는 베타 기능 {#supported-beta-features}

| 베타 기능 | 헤더 값 | 호환 모델 | 설명 |
|--------------|-------------|------------------|-------------|
| 1M 컨텍스트 창 | `context-1m-2025-08-07` | Claude Opus 4.6, Sonnet 4.5, Sonnet 4 | 100만 토큰 컨텍스트 창 활성화 |
| Computer Use(최신) | `computer-use-2025-01-24` | Claude 3.7 Sonnet | 최신 computer use 도구 |
| Computer Use(레거시) | `computer-use-2024-10-22` | Claude 3.5 Sonnet v2 | Claude 3.5용 computer use 도구 |
| 토큰 효율 도구 | `token-efficient-tools-2025-02-19` | Claude 3.7 Sonnet | 더 효율적인 도구 사용 |
| Interleaved Thinking | `interleaved-thinking-2025-05-14` | Claude 4 모델 | 향상된 thinking 기능 |
| 확장 출력 | `output-128k-2025-02-19` | Claude 3.7 Sonnet | 최대 128K 출력 토큰 |
| Developer Thinking | `dev-full-thinking-2025-05-14` | Claude 4 모델 | 개발자를 위한 원시 thinking 모드 |

<Tabs>
<TabItem value="sdk" label="SDK">

**단일 베타 기능**

```python
from litellm import completion
import os

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

# Use 1M context window with Claude Sonnet 4
response = completion(
    model="bedrock/anthropic.claude-sonnet-4-20250115-v1:0",
    messages=[{"role": "user", "content": "Hello! Testing 1M context window."}],
    max_tokens=100,
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"  # 👈 Enable 1M context
    }
)
```

**여러 베타 기능**

```python
from litellm import completion

# Combine multiple beta features (comma-separated)
response = completion(
    model="bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Testing multiple beta features"}],
    max_tokens=100,
    extra_headers={
        "anthropic-beta": "computer-use-2024-10-22,context-1m-2025-08-07"
    }
)
```

**베타 기능과 Computer Use 도구**

```python
from litellm import completion

# Computer use tools automatically add computer-use-2024-10-22
# You can add additional beta features
response = completion(
    model="bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Take a screenshot"}],
    tools=[{
        "type": "computer_20241022",
        "name": "computer",
        "display_width_px": 1920,
        "display_height_px": 1080
    }],
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"  # Additional beta feature
    }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**YAML 설정에 구성**

```yaml
model_list:
  - model_name: claude-sonnet-4-1m
    litellm_params:
      model: bedrock/anthropic.claude-sonnet-4-20250115-v1:0
      extra_headers:
        anthropic-beta: "context-1m-2025-08-07"  # 👈 Enable 1M context

  - model_name: claude-computer-use
    litellm_params:
      model: bedrock/converse/anthropic.claude-3-5-sonnet-20241022-v2:0
      extra_headers:
        anthropic-beta: "computer-use-2024-10-22,context-1m-2025-08-07"

general_settings:
  forward_client_headers_to_llm_api: true  # 👈 Required for client-side header forwarding
```

**요청에 설정**

```python
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-1m",
    messages=[{
        "role": "user", 
        "content": "Testing 1M context window"
    }],
    extra_headers={
        "anthropic-beta": "context-1m-2025-08-07"
    }
)
```

:::info
**클라이언트 측 헤더 전달의 경우**: 프록시를 사용하면서 클라이언트(OpenAI SDK 등)에서 `anthropic-beta` 헤더를 보내려면 프록시의 `general_settings`에서 `forward_client_headers_to_llm_api: true`를 활성화해야 합니다. 이 설정은 프록시가 HTTP 요청에서 헤더를 추출해 기반 LLM 제공자로 전달하도록 합니다.
:::

</TabItem>
</Tabs>

:::info

베타 기능은 AWS 계정에서 특별한 접근 권한 또는 권한을 요구할 수 있습니다. 일부 기능은 특정 AWS 리전에서만 사용할 수 있습니다. 사용 가능 여부와 접근 요구사항은 [AWS Bedrock 문서](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-request-response.html)를 확인하세요.

:::


## 사용법 - 구조화된 출력 / JSON 모드 {#usage---structured-output--json-mode}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os 
from pydantic import BaseModel

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

class CalendarEvent(BaseModel):
  name: str
  date: str
  participants: list[str]

class EventsList(BaseModel):
    events: list[CalendarEvent]

response = completion(
  model="bedrock/anthropic.claude-3-7-sonnet-20250219-v1:0", # specify invoke via `bedrock/invoke/anthropic.claude-3-7-sonnet-20250219-v1:0`
  response_format=EventsList,
  messages=[
    {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
    {"role": "user", "content": "Who won the world series in 2020?"}
  ],
)
print(response.choices[0].message.content)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0 # specify invoke via `bedrock/invoke/<model_name>` 
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant designed to output JSON."
      },
      {
        "role": "user",
        "content": "Who won the worlde series in 2020?"
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "math_reasoning",
        "description": "reason about maths",
        "schema": {
          "type": "object",
          "properties": {
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "explanation": { "type": "string" },
                  "output": { "type": "string" }
                },
                "required": ["explanation", "output"],
                "additionalProperties": false
              }
            },
            "final_answer": { "type": "string" }
          },
          "required": ["steps", "final_answer"],
          "additionalProperties": false
        },
        "strict": true
      }
    }
  }'
```
</TabItem>
</Tabs>

## 사용법 - 지연 시간 최적화 추론 {#usage---latency-optimized-inference}

v1.65.1 이상에서 유효합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/anthropic.claude-3-7-sonnet-20250219-v1:0",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    performanceConfig={"latency": "optimized"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-3-7
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0
      performanceConfig: {"latency": "optimized"} # 👈 EITHER HERE OR ON REQUEST
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "bedrock-claude-3-7",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "performanceConfig": {"latency": "optimized"} # 👈 EITHER HERE OR ON CONFIG.YAML
  }'
```

</TabItem>
</Tabs>

## 사용법 - Service Tier {#usage---service-tier}

`serviceTier`를 사용해 Bedrock 요청의 처리 계층을 제어합니다. 유효한 값은 `priority`, `default`, `flex`입니다.

- `priority`: 보장된 용량을 사용하는 높은 우선순위 처리
- `default`: 표준 처리 계층
- `flex`: 배치 워크로드용 비용 최적화 처리

[Bedrock ServiceTier API 참고 문서](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ServiceTier.html)

### OpenAI 호환 `service_tier` 매개변수 {#openai-compatible-service_tier-parameter}

LiteLLM은 OpenAI 스타일 `service_tier` 매개변수도 지원합니다. 이 값은 Bedrock 네이티브 `serviceTier` 형식으로 자동 변환됩니다.

| OpenAI `service_tier` | Bedrock `serviceTier` |
|-----------------------|----------------------|
| `"priority"` | `{"type": "priority"}` |
| `"default"` | `{"type": "default"}` |
| `"flex"` | `{"type": "flex"}` |
| `"auto"` | `{"type": "default"}` |

```python
from litellm import completion

# Using OpenAI-style service_tier parameter
response = completion(
    model="bedrock/converse/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[{"role": "user", "content": "Hello!"}],
    service_tier="priority"  # Automatically translated to serviceTier={"type": "priority"}
)
```

### 네이티브 Bedrock `serviceTier` 매개변수 {#native-bedrock-servicetier-parameter}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/converse/qwen.qwen3-235b-a22b-2507-v1:0",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    serviceTier={"type": "priority"},
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: qwen3-235b-priority
    litellm_params:
      model: bedrock/converse/qwen.qwen3-235b-a22b-2507-v1:0
      aws_region_name: ap-northeast-1
      serviceTier:
        type: priority
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "qwen3-235b-priority",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "serviceTier": {"type": "priority"}
  }'
```

</TabItem>
</Tabs>
## 사용법 - Bedrock 가드레일

[LiteLLM에서 Bedrock 가드레일 사용](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-use-converse-api.html) 예제입니다.

### `guarded_text`를 사용한 선택적 콘텐츠 모더레이션 {#selective-content-moderation-with-guarded_text}

LiteLLM은 `guarded_text` 콘텐츠 타입을 사용한 선택적 콘텐츠 모더레이션을 지원합니다. 전체 대화를 평가하는 대신 Bedrock 가드레일로 모더레이션해야 하는 특정 콘텐츠만 감쌀 수 있습니다.

**동작 방식:**
- `type: "guarded_text"` 콘텐츠는 `guardrailConverseContent` 블록으로 자동 래핑됩니다.
- 래핑된 콘텐츠만 Bedrock 가드레일에서 평가됩니다.
- `type: "text"` 일반 콘텐츠는 가드레일 평가를 우회합니다.

:::note
`guarded_text`를 사용하지 않으면 전체 대화 기록이 평가를 위해 가드레일로 전송됩니다. 이로 인해 지연 시간과 비용이 증가할 수 있습니다.
:::

<Tabs>
<TabItem value="sdk" label="LiteLLM SDK">

```python
from litellm import completion

# set env
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="anthropic.claude-v2",
    messages=[
        {
            "content": "where do i buy coffee from? ",
            "role": "user",
        }
    ],
    max_tokens=10,
    guardrailConfig={
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    },
)

# Selective guardrail usage with guarded_text - only specific content is evaluated
response_guard = completion(
    model="anthropic.claude-v2",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is the main topic of this legal document?"},
                {"type": "guarded_text", "text": "This      document contains sensitive legal information that should be moderated by guardrails."}
            ]
        }
    ],
    guardrailConfig={
        "guardrailIdentifier": "gr-abc123",
        "guardrailVersion": "DRAFT"
    }
)
```
</TabItem>
<TabItem value="proxy" label="요청의 프록시">

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="anthropic.claude-v2", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7,
extra_body={
    "guardrailConfig": {
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    },
}
)

print(response)
```
</TabItem>
<TabItem value="proxy-config" label="config.yaml의 프록시">

1. config.yaml 업데이트

```yaml
model_list:
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/anthropic.claude-instant-v1
      aws_access_key_id: os.environ/CUSTOM_AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/CUSTOM_AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/CUSTOM_AWS_REGION_NAME
      guardrailConfig: {
        "guardrailIdentifier": "ff6ujrregl1q", # The identifier (ID) for the guardrail.
        "guardrailVersion": "DRAFT",           # The version of the guardrail.
        "trace": "disabled",                   # The trace behavior for the guardrail. Can either be "disabled" or "enabled"
    }

```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python

import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

# request sent to model set on litellm proxy, `litellm --model`
response = client.chat.completions.create(model="bedrock-claude-v1", messages = [
    {
        "role": "user",
        "content": "this is a test request, write a short poem"
    }
],
temperature=0.7
)

# For adding selective guardrail usage with guarded_text
response_guard = client.chat.completions.create(model="bedrock-claude-v1", messages = [
   {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is the main topic of this legal document?"},
                {"type": "guarded_text", "text": "This document contains sensitive legal information that should be moderated by guardrails."}
            ]
  }
],
temperature=0.7
) 

print(response_guard)
```
</TabItem>
</Tabs>

## 사용법 - "Assistant Pre-fill" {#usage---assistant-pre-fill}

Bedrock에서 Anthropic Claude를 사용하는 경우 `messages` 배열의 마지막 항목으로 `assistant` role 메시지를 포함해 "Claude의 입에 말을 넣는" 방식의 사전 채우기(pre-fill)를 사용할 수 있습니다.

> [!IMPORTANT]
> 반환된 completion에는 "pre-fill" 텍스트가 포함되지 않습니다. 해당 텍스트는 prompt 자체의 일부이기 때문입니다. Claude의 completion 앞에 pre-fill을 직접 붙여야 합니다.

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

messages = [
    {"role": "user", "content": "How do you say 'Hello' in German? Return your answer as a JSON object, like this:\n\n{ \"Hello\": \"Hallo\" }"},
    {"role": "assistant", "content": "{"},
]
response = completion(model="bedrock/anthropic.claude-v2", messages=messages)
```

### Claude로 전송되는 예제 프롬프트 {#example-prompt-sent-to-claude}

```

Human: How do you say 'Hello' in German? Return your answer as a JSON object, like this:

{ "Hello": "Hallo" }

Assistant: {
```

## 사용법 - "System" 메시지 {#usage---system-messages}
Bedrock에서 Anthropic Claude 2.1을 사용하는 경우 `system` role 메시지가 적절한 형식으로 자동 변환됩니다.

```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

messages = [
    {"role": "system", "content": "You are a snarky assistant."},
    {"role": "user", "content": "How do I boil water?"},
]
response = completion(model="bedrock/anthropic.claude-v2:1", messages=messages)
```

### Claude로 전송되는 예제 프롬프트 {#example-prompt-sent-to-claude-1}

```
You are a snarky assistant.

Human: How do I boil water?

Assistant:
```



## 사용법 - 스트리밍 {#usage---streaming}
```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
  model="bedrock/anthropic.claude-instant-v1",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  stream=True
)
for chunk in response:
  print(chunk)
```

#### 예제 스트리밍 출력 청크 {#example-streaming-output-chunk}
```json
{
  "choices": [
    {
      "finish_reason": null,
      "index": 0,
      "delta": {
        "content": "ase can appeal the case to a higher federal court. If a higher federal court rules in a way that conflicts with a ruling from a lower federal court or conflicts with a ruling from a higher state court, the parties involved in the case can appeal the case to the Supreme Court. In order to appeal a case to the Sup"
      }
    }
  ],
  "created": null,
  "model": "anthropic.claude-instant-v1",
  "usage": {
    "prompt_tokens": null,
    "completion_tokens": null,
    "total_tokens": null
  }
}
```

## 교차 리전 추론 {#cross-region-inferencing}

LiteLLM은 모든 [지원 Bedrock 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference-support.html)에서 Bedrock [교차 리전 추론](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)을 지원합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion 
import os 


os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


litellm.set_verbose = True #  👈 SEE RAW REQUEST 

response = completion(
    model="bedrock/us.anthropic.claude-3-haiku-20240307-v1:0",
    messages=messages,
    max_tokens=10,
    temperature=0.1,
)

print("Final Response: {}".format(response))
```

</TabItem>
<TabItem value="proxy" label="PROXY">

#### 1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-claude-haiku
    litellm_params:
      model: bedrock/us.anthropic.claude-3-haiku-20240307-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```


#### 2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

#### 3. 테스트


<Tabs>
<TabItem value="Curl" label="Curl 요청">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data ' {
      "model": "bedrock-claude-haiku",
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
response = client.chat.completions.create(model="bedrock-claude-haiku", messages = [
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
    model = "bedrock-claude-haiku",
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
</TabItem>
</Tabs>


## 'converse' / 'invoke' 라우트 설정 {#set-converse--invoke-route}

:::info

LiteLLM 버전 `v1.53.5`부터 지원됩니다.

:::

LiteLLM의 기본값은 `invoke` 라우트입니다. LiteLLM은 이를 지원하는 Bedrock 모델에 대해 `converse` 라우트를 사용합니다.

라우트를 명시적으로 설정하려면 `bedrock/converse/<model>` 또는 `bedrock/invoke/<model>`을 사용하세요.


예:

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

completion(model="bedrock/converse/us.amazon.nova-pro-v1:0")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/converse/us.amazon.nova-pro-v1:0
```

</TabItem>
</Tabs>

## user/assistant 메시지 교대 처리 {#handling-userassistant-message-alternation}

클라이언트가 user 메시지로 시작하고 끝나는 user/assistant 메시지 교대 규칙을 따르지 않을 수 있는 경우(예: Autogen), `user_continue_message`를 사용해 기본 user 메시지를 추가합니다.


```yaml
model_list:
  - model_name: "bedrock-claude"
    litellm_params:
      model: "bedrock/anthropic.claude-instant-v1"
      user_continue_message: {"role": "user", "content": "Please continue"}
```

또는

`litellm.modify_params=True`만 설정하면 LiteLLM이 기본 `user_continue_message`로 이를 자동 처리합니다.

```yaml
model_list:
  - model_name: "bedrock-claude"
    litellm_params:
      model: "bedrock/anthropic.claude-instant-v1"

litellm_settings:
   modify_params: true
```

테스트:

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-claude",
    "messages": [{"role": "assistant", "content": "Hey, how's it going?"}]
}'
```

## 사용법 - PDF / 문서 이해 {#usage---pdf--document-understanding}

LiteLLM은 Bedrock 모델의 문서 이해를 지원합니다. [AWS Bedrock 문서](https://docs.aws.amazon.com/nova/latest/userguide/modalities-document.html)를 참고하세요.

:::info

LiteLLM은 모든 Bedrock 문서 타입을 지원합니다.

예: "pdf", "csv", "doc", "docx", "xls", "xlsx", "html", "txt", "md"

또한 `image_url` 또는 `base64`로 전달할 수 있습니다.

:::

### URL {#url}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

# Download the file
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")

# model
model = "bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0"

image_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "file",
        "file": {
            "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
        }
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": image_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": {"type": "text", "text": "What's this file about?"}},
        {
            "type": "file",
            "file": {
                "file_data": f"data:application/pdf;base64,{encoded_file}", # 👈 PDF
            }
        }
    ]
}'
```
</TabItem>
</Tabs>

### base64

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm.utils import supports_pdf_input, completion

# set aws credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


# pdf url
image_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
response = requests.get(url)
file_data = response.content

encoded_file = base64.b64encode(file_data).decode("utf-8")
base64_url = f"data:application/pdf;base64,{encoded_file}"

# model
model = "bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0"

image_content = [
    {"type": "text", "text": "What's this file about?"},
    {
        "type": "image_url",
        "image_url": base64_url, # OR {"url": base64_url}
    },
]


if not supports_pdf_input(model, None):
    print("Model does not support image input")

response = completion(
    model=model,
    messages=[{"role": "user", "content": image_content}],
)
assert response is not None
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

2. 프록시 시작 

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
    "messages": [
        {"role": "user", "content": {"type": "text", "text": "What's this file about?"}},
        {
            "type": "image_url",
            "image_url": "data:application/pdf;base64,{b64_encoded_file}",
        }
    ]
}'
```
</TabItem>
</Tabs>


### OpenAI GPT OSS {#openai-gpt-oss}

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/converse/openai.gpt-oss-20b-1:0`, `bedrock/converse/openai.gpt-oss-120b-1:0` |
| 제공자 문서 | [Amazon Bedrock ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="GPT OSS SDK 사용법" showLineNumbers
from litellm import completion
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

# GPT OSS 20B model
response = completion(
    model="bedrock/converse/openai.gpt-oss-20b-1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)
print(response.choices[0].message.content)

# GPT OSS 120B model  
response = completion(
    model="bedrock/converse/openai.gpt-oss-120b-1:0",
    messages=[{"role": "user", "content": "Explain machine learning in simple terms"}],
)
print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="프록시">

**1. config에 추가**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-oss-20b
    litellm_params:
      model: bedrock/converse/openai.gpt-oss-20b-1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
      
  - model_name: gpt-oss-120b
    litellm_params:
      model: bedrock/converse/openai.gpt-oss-120b-1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

**2. 프록시 시작**

```bash title="LiteLLM 프록시 시작" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash title="프록시로 GPT OSS 테스트" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "gpt-oss-20b",
    "messages": [
      {
        "role": "user", 
        "content": "What are the key benefits of open source AI?"
      }
    ]
  }'
```

</TabItem>
</Tabs>

## TwelveLabs Pegasus - 비디오 이해 {#twelvelabs-pegasus---video-understanding}

TwelveLabs Pegasus 1.2는 비디오 콘텐츠를 분석하고 설명할 수 있는 비디오 이해 모델입니다. LiteLLM은 Bedrock의 `/invoke` 엔드포인트를 통해 이 모델을 지원합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/us.twelvelabs.pegasus-1-2-v1:0`, `bedrock/eu.twelvelabs.pegasus-1-2-v1:0` |
| 제공자 문서 | [TwelveLabs Pegasus 문서 ↗](https://docs.twelvelabs.io/docs/models/pegasus) |
| 지원 파라미터 | `max_tokens`, `temperature`, `response_format` |
| 미디어 입력 | S3 URI 또는 base64 인코딩 비디오 |

### 지원 기능

- **비디오 분석**: S3 또는 base64 입력의 비디오 콘텐츠 분석
- **구조화된 출력**: JSON schema 응답 형식 지원
- **S3 연동**: 버킷 소유자 지정이 포함된 S3 비디오 URL 지원

### S3 비디오 사용법 {#s3-video-usage}

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="TwelveLabs Pegasus SDK 사용법" showLineNumbers
from litellm import completion
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = completion(
    model="bedrock/us.twelvelabs.pegasus-1-2-v1:0",
    messages=[{"role": "user", "content": "Describe what happens in this video."}],
    mediaSource={
        "s3Location": {
            "uri": "s3://your-bucket/video.mp4",
            "bucketOwner": "123456789012",  # 12-digit AWS account ID
        }
    },
    temperature=0.2
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="proxy" label="프록시">

**1. config에 추가**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: pegasus-video
    litellm_params:
      model: bedrock/us.twelvelabs.pegasus-1-2-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

**2. 프록시 시작**

```bash title="LiteLLM 프록시 시작" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash title="프록시로 Pegasus 테스트" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "pegasus-video",
    "messages": [
      {
        "role": "user",
        "content": "Describe what happens in this video."
      }
    ],
    "mediaSource": {
      "s3Location": {
        "uri": "s3://your-bucket/video.mp4",
        "bucketOwner": "123456789012"
      }
    },
    "temperature": 0.2
  }'
```

</TabItem>
</Tabs>

### base64 비디오 사용법 {#base64-video-usage}

비디오 콘텐츠를 base64로 직접 전달할 수도 있습니다.

```python title="base64 비디오 입력" showLineNumbers
from litellm import completion
import base64

# Read video file and encode to base64
with open("video.mp4", "rb") as video_file:
    video_base64 = base64.b64encode(video_file.read()).decode("utf-8")

response = completion(
    model="bedrock/us.twelvelabs.pegasus-1-2-v1:0",
    messages=[{"role": "user", "content": "What is happening in this video?"}],
    mediaSource={
        "base64String": video_base64
    },
    temperature=0.2,
)

print(response.choices[0].message.content)
```

### 중요 참고 사항

- **응답 형식**: 이 모델은 JSON schema와 함께 `response_format`을 통한 구조화된 출력을 지원합니다.

## 프로비저닝된 처리량 모델 {#provisioned-throughput-models}
프로비저닝된 처리량 Bedrock 모델을 사용하려면 다음을 전달합니다.
- `model=bedrock/<base-model>`, 예: `model=bedrock/anthropic.claude-v2`. `model`은 [지원 AWS 모델](#supported-aws-bedrock-models) 중 하나로 설정하세요.
- `model_id=provisioned-model-arn` 

Completion 호출:
```python
import litellm
response = litellm.completion(
    model="bedrock/anthropic.claude-instant-v1",
    model_id="provisioned-model-arn",
    messages=[{"content": "Hello, how are you?", "role": "user"}]
)
```

Embedding 호출:
```python
import litellm
response = litellm.embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    model_id="provisioned-model-arn",
    input=["hi"],
)
```


## 지원 AWS Bedrock 모델 {#supported-aws-bedrock-models}

LiteLLM은 모든 Bedrock 모델을 지원합니다.

다음은 LiteLLM에서 Bedrock 모델을 사용하는 예시입니다. 전체 목록은 [모델 비용 맵](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)을 참고하세요.

| 모델 이름                 | 명령                                                          |
|----------------------------|------------------------------------------------------------------|
| GPT-OSS 20B | `completion(model='bedrock/converse/openai.gpt-oss-20b-1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| GPT-OSS 120B | `completion(model='bedrock/converse/openai.gpt-oss-120b-1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Deepseek R1    | `completion(model='bedrock/us.deepseek.r1-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude Sonnet 4.5`    | `completion(model='bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V3.5 Sonnet`    | `completion(model='bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V3 sonnet`    | `completion(model='bedrock/anthropic.claude-3-sonnet-20240229-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V3 Haiku`     | `completion(model='bedrock/anthropic.claude-3-haiku-20240307-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V3 Opus`     | `completion(model='bedrock/anthropic.claude-3-opus-20240229-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V2.1`      | `completion(model='bedrock/anthropic.claude-v2:1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-V2`        | `completion(model='bedrock/anthropic.claude-v2', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Anthropic Claude-Instant V1` | `completion(model='bedrock/anthropic.claude-instant-v1', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Meta llama3-1-405b`        | `completion(model='bedrock/meta.llama3-1-405b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Meta llama3-1-70b`        | `completion(model='bedrock/meta.llama3-1-70b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Meta llama3-1-8b`        | `completion(model='bedrock/meta.llama3-1-8b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Meta llama3-70b`        | `completion(model='bedrock/meta.llama3-70b-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| Meta llama3-8b | `completion(model='bedrock/meta.llama3-8b-instruct-v1:0', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`           |
| `Amazon Titan Lite`          | `completion(model='bedrock/amazon.titan-text-lite-v1', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Amazon Titan Express`       | `completion(model='bedrock/amazon.titan-text-express-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Cohere Command`             | `completion(model='bedrock/cohere.command-text-v14', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `AI21 J2-Mid`                | `completion(model='bedrock/ai21.j2-mid-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `AI21 J2-Ultra`              | `completion(model='bedrock/ai21.j2-ultra-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `AI21 Jamba-Instruct`              | `completion(model='bedrock/ai21.jamba-instruct-v1:0', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Meta Llama 2 Chat 13b`      | `completion(model='bedrock/meta.llama2-13b-chat-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Meta Llama 2 Chat 70b`      | `completion(model='bedrock/meta.llama2-70b-chat-v1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Mistral 7B Instruct`        | `completion(model='bedrock/mistral.mistral-7b-instruct-v0:2', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `Mixtral 8x7B Instruct`      | `completion(model='bedrock/mistral.mixtral-8x7b-instruct-v0:1', messages=messages)`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `TwelveLabs Pegasus 1.2 (US)` | `completion(model='bedrock/us.twelvelabs.pegasus-1-2-v1:0', messages=messages, mediaSource={...})`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| `TwelveLabs Pegasus 1.2 (EU)` | `completion(model='bedrock/eu.twelvelabs.pegasus-1-2-v1:0', messages=messages, mediaSource={...})`   | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |
| Moonshot Kimi K2 Thinking | `completion(model='bedrock/moonshot.kimi-k2-thinking', messages=messages)` 또는 `completion(model='bedrock/invoke/moonshot.kimi-k2-thinking', messages=messages)` | `os.environ['AWS_ACCESS_KEY_ID']`, `os.environ['AWS_SECRET_ACCESS_KEY']`, `os.environ['AWS_REGION_NAME']` |


## Bedrock 임베딩 {#bedrock-embedding}

### API 키 {#api-keys}
환경 변수로 설정하거나 **litellm.embedding()의 매개변수**로 전달할 수 있습니다.
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""        # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = ""    # Secret access key
os.environ["AWS_REGION_NAME"] = ""           # us-east-1, us-east-2, us-west-1, us-west-2
```

### 사용법
```python
from litellm import embedding
response = embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

#### Titan V2 - encoding_format 지원
```python
from litellm import embedding
# Float format (default)
response = embedding(
    model="bedrock/amazon.titan-embed-text-v2:0",
    input=["good morning from litellm"],
    encoding_format="float"  # Returns float array
)

# Binary format
response = embedding(
    model="bedrock/amazon.titan-embed-text-v2:0",
    input=["good morning from litellm"],
    encoding_format="base64"  # Returns base64 encoded binary
)
```

## 지원 AWS Bedrock 임베딩 모델

| 모델 이름           | 사용법                               | 지원되는 추가 OpenAI 매개변수 |
|----------------------|---------------------------------------------|-----|
| `Titan Embeddings V2` | `embedding(model="bedrock/amazon.titan-embed-text-v2:0", input=input)` | `dimensions`, `encoding_format` |
| `Titan Embeddings - V1` | `embedding(model="bedrock/amazon.titan-embed-text-v1", input=input)` | [여기](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_g1_transformation.py#L53)
| Titan Multimodal Embeddings | `embedding(model="bedrock/amazon.titan-embed-image-v1", input=input)` | [여기](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_multimodal_transformation.py#L28) |
| Cohere Embeddings - English | `embedding(model="bedrock/cohere.embed-english-v3", input=input)` | [여기](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embeddings - Multilingual | `embedding(model="bedrock/cohere.embed-multilingual-v3", input=input)` | [여기](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)

### 고급 - [지원되지 않는 매개변수 제거](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)

### 고급 - [`model`/`provider`별 매개변수 전달](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)

## 이미지 생성 {#image-generation}

Bedrock에서 Stable Diffusion 및 Amazon Nova Canvas 모델을 사용하는 방법은 [Bedrock 이미지 생성](./bedrock_image_gen)을 참고하세요.


## 재정렬 API {#rerank-api}

Bedrock의 재정렬 API를 Cohere `/rerank` 형식으로 사용하는 방법은 [Bedrock 재정렬](./bedrock_rerank)을 참고하세요.


## Bedrock Application Inference Profile 사용 {#bedrock-application-inference-profile}

AWS의 프로젝트 비용을 추적하려면 Bedrock Application Inference Profile을 사용하세요.

모델 이름에 `model="bedrock/arn:...` 형태로 전달하거나 별도 `model_id="arn:..` 매개변수로 전달할 수 있습니다.

### `model_id`로 설정

<Tabs>
<TabItem label="SDK" value="sdk">

```python
from litellm import completion
import os 

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = completion(
    model="bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    model_id="arn:aws:bedrock:eu-central-1:000000000000:application-inference-profile/a0a0a0a0a0a0",
)

print(response)
```

</TabItem>
<TabItem label="PROXY" value="proxy">

1. config.yaml 설정

```yaml
model_list:
  - model_name: anthropic-claude-3-5-sonnet
    litellm_params:
      model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
      # You have to set the ARN application inference profile in the model_id parameter
      model_id: arn:aws:bedrock:eu-central-1:000000000000:application-inference-profile/a0a0a0a0a0a0
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_API_KEY' \
-d '{
  "model": "anthropic-claude-3-5-sonnet",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "List 5 important events in the XIX century"
        }
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

## Boto3 - 인증

### 매개변수로 자격 증명 전달 - Completion() {#pass-credentials-as-parameters-completion}
AWS 자격 증명을 litellm.completion 매개변수로 전달합니다.
```python
import os
from litellm import completion

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
)
```

### 추가 헤더와 사용자 지정 API 엔드포인트 전달 {#pass-extra-headers-and-custom-api-endpoint}

사용자 지정 API 엔드포인트를 호출할 때 기존 헤더(예: `Authorization`)를 재정의하는 데 사용할 수 있습니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
import litellm
from litellm import completion

litellm.set_verbose = True # 👈 SEE RAW REQUEST

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_region_name="",
            aws_bedrock_runtime_endpoint="https://my-fake-endpoint.com",
            extra_headers={"key": "value"}
)
```
</TabItem>

<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
    - model_name: bedrock-model
      litellm_params:
        model: bedrock/anthropic.claude-instant-v1
        aws_access_key_id: "",
        aws_secret_access_key: "",
        aws_region_name: "",
        aws_bedrock_runtime_endpoint: "https://my-fake-endpoint.com",
        extra_headers: {"key": "value"}
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml --detailed_debug
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "bedrock-model",
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

</TabItem>

</Tabs>

### SSO 로그인(AWS 프로필) {#sso-login-aws-profile}
- `AWS_PROFILE` 환경 변수를 설정합니다.
- Bedrock completion 호출을 실행합니다.

```python
import os
from litellm import completion

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

또는 `aws_profile_name`을 전달합니다.

```python
import os
from litellm import completion

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_profile_name="dev-profile",
)
```

### STS(role 기반 인증) {#sts-role-based-auth}

- `aws_role_name`과 `aws_session_name`을 설정합니다.


| LiteLLM 매개변수 | Boto3 매개변수 | 설명 | Boto3 문서 |
|------------------|-----------------|-------------|-------------------|
| `aws_access_key_id` | `aws_access_key_id` | IAM 사용자 또는 role과 연결된 AWS access key | [자격 증명](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) |
| `aws_secret_access_key` | `aws_secret_access_key` | access key와 연결된 AWS secret key | [자격 증명](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) |
| `aws_role_name` | `RoleArn` | assume할 role의 Amazon Resource Name(ARN) | [AssumeRole API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.assume_role) |
| `aws_session_name` | `RoleSessionName` | assumed role 세션의 식별자 | [AssumeRole API](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.assume_role) |

### IAM Roles Anywhere(온프레미스 / 외부 워크로드) {#iam-roles-anywhere-on-premise--external-workloads}

[IAM Roles Anywhere](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/introduction.html)는 **AWS 외부** 워크로드(온프레미스 서버, 엣지 디바이스, 다른 클라우드)까지 IAM role을 확장합니다. 일반 IAM role과 동일한 STS 메커니즘을 사용하지만 AWS 자격 증명 대신 X.509 인증서로 인증합니다.

**설정**: [AWS Signing Helper](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/credential-helper.html)를 `~/.aws/config`의 자격 증명 프로세스로 구성합니다.

```ini
[profile litellm-roles-anywhere]
credential_process = aws_signing_helper credential-process \
    --certificate /path/to/certificate.pem \
    --private-key /path/to/private-key.pem \
    --trust-anchor-arn arn:aws:rolesanywhere:us-east-1:123456789012:trust-anchor/abc123 \
    --profile-arn arn:aws:rolesanywhere:us-east-1:123456789012:profile/def456 \
    --role-arn arn:aws:iam::123456789012:role/MyBedrockRole
```

**사용법**: LiteLLM에서 프로필을 참조합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    messages=[{"role": "user", "content": "Hello!"}],
    aws_profile_name="litellm-roles-anywhere",
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
      aws_profile_name: "litellm-roles-anywhere"
```

</TabItem>
</Tabs>

신뢰 앵커(trust anchor)와 프로필 설정은 [IAM Roles Anywhere 시작하기 가이드](https://docs.aws.amazon.com/rolesanywhere/latest/userguide/getting-started.html)를 참고하세요.



Bedrock completion 호출을 실행합니다.

---

### AssumeRole에 필요한 AWS IAM 정책 {#aws-iam-policy-required-for-assumerole}

LiteLLM에서 `aws_role_name`(STS AssumeRole)을 사용하려면 IAM 사용자 또는 role에 대상 role의 `sts:AssumeRole` 호출 권한이 **반드시** 있어야 합니다. 다음과 같은 오류가 보이면:

```
An error occurred (AccessDenied) when calling the AssumeRole operation: User: arn:aws:sts::...:assumed-role/litellm-ecs-task-role/... is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::...:role/Enterprise/BedrockCrossAccountConsumer
```

이는 LiteLLM을 실행하는 IAM identity(IAM 자격 증명)가 대상 role을 assume할 권한이 **없다**는 뜻입니다. 이 작업을 허용하도록 IAM 정책을 업데이트해야 합니다.

#### 예제 IAM 정책 {#example-iam-policy}

`<TARGET_ROLE_ARN>`을 assume하려는 role의 ARN으로 바꾸세요(예: `arn:aws:iam::123456789012:role/엔터프라이즈/BedrockCrossAccountConsumer`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "<TARGET_ROLE_ARN>"
    }
  ]
}
```

**참고:** AssumeRole이 성공하려면 대상 role 자체도 신뢰 정책(trust policy)을 통해 호출하는 IAM identity(IAM 자격 증명)를 신뢰해야 합니다. 자세한 내용은 [AWS AssumeRole 문서](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-api.html)를 참고하세요.

---

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=messages,
            max_tokens=10,
            temperature=0.1,
            aws_role_name=aws_role_name,
            aws_session_name="my-test-session",
        )
```

role에 접근하는 AWS 사용자를 동적으로 설정해야 한다면 completion()/embedding() 함수에 추가 인자를 넣으세요.

```python
from litellm import completion

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=messages,
            max_tokens=10,
            temperature=0.1,
            aws_region_name=aws_region_name,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            aws_role_name=aws_role_name,
            aws_session_name="my-test-session",
        )
```
</TabItem>

<TabItem value="proxy" label="PROXY">

```yaml
model_list:
  - model_name: bedrock/*
    litellm_params:
      model: bedrock/*
      aws_role_name: arn:aws:iam::888602223428:role/iam_local_role # AWS RoleArn
      aws_session_name: "bedrock-session" # AWS RoleSessionName
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # [OPTIONAL - not required if using role]
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # [OPTIONAL - not required if using role]
```


</TabItem>

</Tabs>

### 외부 BedrockRuntime.Client를 매개변수로 전달 - Completion() {#pass-external-bedrockruntimeclient-as-parameter-completion}
  
이는 지원 중단된 흐름입니다. Boto3는 async가 아니며, boto3.client는 httpx를 통한 HTTP 호출을 허용하지 않습니다. 위 방식으로 AWS 매개변수를 전달하세요. [인증 코드 보기](https://github.com/BerriAI/litellm/blob/55a20c7cce99a93d36a82bf3ae90ba3baf9a7f89/litellm/llms/bedrock_httpx.py#L284) [새 인증 흐름 추가](https://github.com/BerriAI/litellm/issues)

:::warning





실험적 기능 - 2024-Jun-23:
    `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`이 boto3.client에서 추출되어 httpx 클라이언트로 전달됩니다.

:::

외부 BedrockRuntime.Client 객체를 litellm.completion 매개변수로 전달합니다. AWS 자격 증명 프로필, SSO 세션, assumed role 세션을 사용하거나 인증에 환경 변수를 사용할 수 없을 때 유용합니다.

세션 자격 증명에서 클라이언트를 생성합니다.
```python
import boto3
from litellm import completion

bedrock = boto3.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
            aws_access_key_id="",
            aws_secret_access_key="",
            aws_session_token="",
)

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_bedrock_client=bedrock,
)
```

`~/.aws/config`의 AWS 프로필에서 클라이언트를 생성합니다.
```python
import boto3
from litellm import completion

dev_session = boto3.Session(profile_name="dev-profile")
bedrock = dev_session.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
)

response = completion(
            model="bedrock/anthropic.claude-instant-v1",
            messages=[{ "content": "Hello, how are you?","role": "user"}],
            aws_bedrock_client=bedrock,
)
```
## 내부 프록시를 통한 호출(Bedrock URL 호환 아님) {#calling-via-internal-proxy}

내부 프록시를 통해 Bedrock converse 모델을 호출하려면 `bedrock/converse_like/model` 엔드포인트를 사용합니다.

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="bedrock/converse_like/some-model",
    messages=[{"role": "user", "content": "What's AWS?"}],
    api_key="sk-1234",
    api_base="https://some-api-url/models",
    extra_headers={"test": "hello world"},
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM 프록시">

1. config.yaml 설정

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: bedrock/converse_like/some-model
        api_base: https://some-api-url/models
```

2. 프록시 서버 시작

```bash
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "anthropic-claude",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful math tutor. Guide the user through the solution step by step."
      },
      { "content": "Hello, how are you?", "role": "user" }
    ]
}'
```

</TabItem>
</Tabs>

**예상 출력 URL**

```bash
https://some-api-url/models
```
