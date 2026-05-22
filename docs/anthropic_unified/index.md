import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /v1/messages

LiteLLM으로 모든 LLM API를 Anthropic `v1/messages` 형식으로 호출합니다.


## 개요 

| 기능 | 지원 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | 지원되는 모든 모델에서 동작 |
| 로깅 | ✅ | 모든 통합 전반에서 동작 |
| 최종 사용자 추적 | ✅ | |
| 스트리밍 | ✅ | |
| 폴백 | ✅ | 지원되는 모델 간 동작 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간 동작 |
| 가드레일 | ✅ | 입력 및 출력 텍스트에 적용(비스트리밍 전용) |
| 지원 프로바이더 | **LiteLLM이 지원하는 모든 프로바이더** | `openai`, `anthropic`, `bedrock`, `vertex_ai`, `gemini`, `azure`, `azure_ai` 등 |

## 사용법 
---

### LiteLLM Python SDK 사용

<Tabs>
<TabItem value="anthropic" label="Anthropic">

#### 비스트리밍 예제
```python showLineNumbers title="Anthropic Example using LiteLLM Python SDK"
import litellm
response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    api_key=api_key,
    model="anthropic/claude-3-haiku-20240307",
    max_tokens=100,
)
```

#### 스트리밍 예제
```python showLineNumbers title="Anthropic Streaming Example using LiteLLM Python SDK"
import litellm
response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    api_key=api_key,
    model="anthropic/claude-3-haiku-20240307",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="openai" label="OpenAI">

#### 비스트리밍 예제
```python showLineNumbers title="OpenAI Example using LiteLLM Python SDK"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai/gpt-4",
    max_tokens=100,
)
```

#### 스트리밍 예제
```python showLineNumbers title="OpenAI Streaming Example using LiteLLM Python SDK"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai/gpt-4",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="gemini" label="Google AI Studio">

#### 비스트리밍 예제
```python showLineNumbers title="Google Gemini Example using LiteLLM Python SDK"
import litellm
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini/gemini-2.0-flash-exp",
    max_tokens=100,
)
```

#### 스트리밍 예제
```python showLineNumbers title="Google Gemini Streaming Example using LiteLLM Python SDK"
import litellm
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini/gemini-2.0-flash-exp",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="vertex" label="Vertex AI">

#### 비스트리밍 예제
```python showLineNumbers title="Vertex AI Example using LiteLLM Python SDK"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex_ai/gemini-2.0-flash-exp",
    max_tokens=100,
)
```

#### 스트리밍 예제
```python showLineNumbers title="Vertex AI Streaming Example using LiteLLM Python SDK"
import litellm
import os

# Set credentials - Vertex AI uses application default credentials
# Run 'gcloud auth application-default login' to authenticate
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex_ai/gemini-2.0-flash-exp",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="bedrock" label="AWS Bedrock">

#### 비스트리밍 예제
```python showLineNumbers title="AWS Bedrock Example using LiteLLM Python SDK"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    max_tokens=100,
)
```

#### 스트리밍 예제
```python showLineNumbers title="AWS Bedrock Streaming Example using LiteLLM Python SDK"
import litellm
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-access-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your AWS region

response = await litellm.anthropic.messages.acreate(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
    max_tokens=100,
    stream=True,
)
async for chunk in response:
    print(chunk)
```

</TabItem>
</Tabs>

예제 응답:
```json
{
  "content": [
    {
      "text": "Hi! this is a very short joke",
      "type": "text"
    }
  ],
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "model": "claude-3-7-sonnet-20250219",
  "role": "assistant",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "type": "message",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503,
    "cache_creation_input_tokens": 2095,
    "cache_read_input_tokens": 0
  }
}
```

### LiteLLM Proxy Server 사용

<Tabs>
<TabItem value="anthropic-proxy" label="Anthropic">

1. config.yaml 설정

```yaml
model_list:
    - model_name: anthropic-claude
      litellm_params:
        model: claude-3-7-sonnet-latest
        api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="Anthropic Example using LiteLLM Proxy Server"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="anthropic-claude",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="openai-proxy" label="OpenAI">

1. config.yaml 설정

```yaml
model_list:
    - model_name: openai-gpt4
      litellm_params:
        model: openai/gpt-4
        api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="OpenAI Example using LiteLLM Proxy Server"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="openai-gpt4",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="gemini-proxy" label="Google AI Studio">

1. config.yaml 설정

```yaml
model_list:
    - model_name: gemini-2-flash
      litellm_params:
        model: gemini/gemini-2.0-flash-exp
        api_key: os.environ/GEMINI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="Google Gemini Example using LiteLLM Proxy Server"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="gemini-2-flash",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="vertex-proxy" label="Vertex AI">

1. config.yaml 설정

```yaml
model_list:
    - model_name: vertex-gemini
      litellm_params:
        model: vertex_ai/gemini-2.0-flash-exp
        vertex_project: your-gcp-project-id
        vertex_location: us-central1
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="Vertex AI Example using LiteLLM Proxy Server"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="vertex-gemini",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="bedrock-proxy" label="AWS Bedrock">

1. config.yaml 설정

```yaml
model_list:
    - model_name: bedrock-claude
      litellm_params:
        model: bedrock/anthropic.claude-3-sonnet-20240229-v1:0
        aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
        aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
        aws_region_name: us-west-2
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers title="AWS Bedrock Example using LiteLLM Proxy Server"
import anthropic

# point anthropic sdk to litellm proxy 
client = anthropic.Anthropic(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

response = client.messages.create(
    messages=[{"role": "user", "content": "Hello, can you tell me a short joke?"}],
    model="bedrock-claude",
    max_tokens=100,
)
```

</TabItem>

<TabItem value="curl-proxy" label="curl">

```bash showLineNumbers title="Example using LiteLLM Proxy Server"
curl -L -X POST 'http://0.0.0.0:4000/v1/messages' \
-H 'content-type: application/json' \
-H 'x-api-key: $LITELLM_API_KEY' \
-H 'anthropic-version: 2023-06-01' \
-d '{
  "model": "anthropic-claude",
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you tell me a short joke?"
    }
  ],
  "max_tokens": 100
}'
```

</TabItem>
</Tabs>

## 요청 형식
---

요청 본문은 Anthropic messages API 형식을 사용합니다. **litellm은 이 엔드포인트에서 Anthropic messages 사양을 따릅니다.**

#### 예제 요청 본문

```json
{
  "model": "claude-3-7-sonnet-20250219",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Hello, world"
    }
  ]
}
```

#### 필수 필드
- **model** (string):  
  모델 식별자입니다(예: `"claude-3-7-sonnet-20250219"`).
- **max_tokens** (integer):  
  중지하기 전까지 생성할 최대 토큰 수입니다.  
  _참고: 모델은 이 제한에 도달하기 전에 중지될 수 있으며, 값은 1보다 커야 합니다._
- **messages** (객체 배열):  
  대화 턴의 순서 있는 목록입니다.  
  각 메시지 객체는 다음을 포함해야 합니다.
  - **role** (enum: `"user"` 또는 `"assistant"`):  
    메시지의 발화자를 지정합니다.
  - **content** (문자열 또는 content block 배열):  
    메시지를 구성하는 텍스트 또는 content block입니다(예: `"text"` 같은 `type`을 가진 객체 배열).  
    _동등한 예제:_
    ```json
    {"role": "user", "content": "Hello, Claude"}
    ```
    위 요청은 다음과 동일합니다.
    ```json
    {"role": "user", "content": [{"type": "text", "text": "Hello, Claude"}]}
    ```

#### 선택 필드
- **metadata** (object):  
  요청에 대한 추가 메타데이터를 포함합니다(예: 불투명 식별자로 사용하는 `user_id`).
- **stop_sequences** (문자열 배열):  
  생성된 텍스트에서 발견되면 모델을 중지시키는 사용자 지정 시퀀스입니다.
- **stream** (boolean):  
  Server-Sent Events를 사용해 응답을 스트리밍할지 여부를 나타냅니다.
- **system** (문자열 또는 배열):  
  모델에 컨텍스트나 특정 지시를 제공하는 시스템 프롬프트입니다.
- **temperature** (number):  
  모델 응답의 무작위성을 제어합니다. 유효 범위는 `0 < temperature < 1`입니다.
- **thinking** (object):
  extended thinking을 활성화하기 위한 설정입니다. 활성화하면 다음을 포함합니다.
  - **budget_tokens** (integer):
    최소 1024 토큰이며 `max_tokens`보다 작아야 합니다.
  - **type** (enum):
    예: `"enabled"`.
  - **summary** (string, optional):
    thinking block의 요약 스타일을 활성화합니다. 가능한 값은 `"auto"`, `"concise"`, `"detailed"`, `"disabled"`입니다.
    Anthropic이 아닌 프로바이더(예: `openai/gpt-5.1`)로 라우팅할 때 `summary` 값은 보존되어 다운스트림 API로 전달됩니다.
- **tool_choice** (object):  
  제공된 도구를 모델이 어떻게 사용할지 지시합니다.
- **tools** (객체 배열):  
  모델이 사용할 수 있는 도구 정의입니다. 각 도구는 다음을 포함합니다.
  - **name** (string):  
    도구 이름입니다.
  - **description** (string):  
    도구에 대한 상세 설명입니다.
  - **input_schema** (object):  
    도구가 기대하는 입력 형식을 설명하는 JSON 스키마입니다.
- **top_k** (integer):  
  샘플링을 상위 K개 옵션으로 제한합니다.
- **top_p** (number):  
  누적 확률 컷오프를 사용하는 뉴클리어스 샘플링을 활성화합니다. 유효 범위는 `0 < top_p < 1`입니다.


## 응답 형식
---

응답은 Anthropic messages API 형식입니다.

#### 예제 응답

```json
{
  "content": [
    {
      "text": "Hi! My name is Claude.",
      "type": "text"
    }
  ],
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "model": "claude-3-7-sonnet-20250219",
  "role": "assistant",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "type": "message",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503,
    "cache_creation_input_tokens": 2095,
    "cache_read_input_tokens": 0
  }
}
```

#### 응답 필드

- **content** (객체 배열):  
  모델이 생성한 content block을 포함합니다. 각 block은 다음을 포함합니다.
  - **type** (string):  
    content의 타입을 나타냅니다(예: `"text"`, `"tool_use"`, `"thinking"`, `"redacted_thinking"`).
  - **text** (string):  
    모델이 생성한 텍스트입니다.  
    _참고: 최대 길이는 5,000,000자입니다._
  - **citations** (객체 배열 또는 `null`):  
    citation 세부 정보를 제공하는 선택 필드입니다. 각 citation은 다음을 포함합니다.
    - **cited_text** (string):  
      인용되는 발췌문입니다.
    - **document_index** (integer):  
      인용 문서를 참조하는 인덱스입니다.
    - **document_title** (string or `null`):  
      인용 문서의 제목입니다.
    - **start_char_index** (integer):  
      citation의 시작 문자 인덱스입니다.
    - **end_char_index** (integer):  
      citation의 종료 문자 인덱스입니다.
    - **type** (string):  
      일반적으로 `"char_location"`입니다.

- **id** (string):  
  응답 메시지의 고유 식별자입니다.  
  _참고: ID의 형식과 길이는 시간이 지나며 변경될 수 있습니다._

- **model** (string):  
  응답을 생성한 모델을 지정합니다.

- **role** (string):  
  생성된 메시지의 role을 나타냅니다. 응답에서는 항상 `"assistant"`입니다.

- **stop_reason** (string):  
  모델이 텍스트 생성을 중지한 이유를 설명합니다. 가능한 값은 다음과 같습니다.
  - `"end_turn"`: 모델이 자연스러운 중지 지점에 도달했습니다.
  - `"max_tokens"`: 최대 토큰 제한에 도달해 생성이 중지되었습니다.
  - `"stop_sequence"`: 사용자 지정 stop sequence가 발견되었습니다.
  - `"tool_use"`: 모델이 하나 이상의 도구를 호출했습니다.

- **stop_sequence** (string or `null`):  
  생성 중지를 유발한 특정 stop sequence를 포함합니다. 해당하지 않으면 `null`입니다.

- **type** (string):  
  응답 객체의 타입을 나타내며 항상 `"message"`입니다.

- **usage** (object):  
  과금과 rate limiting을 위한 토큰 사용량 세부 정보를 제공합니다. 다음을 포함합니다.
  - **input_tokens** (integer):  
    처리된 총 입력 토큰 수입니다.
  - **output_tokens** (integer):  
    생성된 총 출력 토큰 수입니다.
  - **cache_creation_input_tokens** (integer or `null`):  
    캐시 항목 생성에 사용된 토큰 수입니다.
  - **cache_read_input_tokens** (integer or `null`):  
    캐시에서 읽은 토큰 수입니다.
