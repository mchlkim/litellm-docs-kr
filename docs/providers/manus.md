import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manus

LiteLLM의 OpenAI 호환 Responses API를 통해 Manus AI 에이전트를 사용합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Manus는 복잡한 추론 작업, 문서 분석, 다단계 워크플로를 비동기 작업 실행 방식으로 처리하는 AI 에이전트 플랫폼입니다. |
| LiteLLM의 Provider Route | `manus/{agent_profile}` |
| 지원 작업 | `/responses` (Responses API), `/files` (Files API) |
| Provider 문서 | [Manus API ↗](https://open.manus.im/docs/openai-compatibility) |

## 모델 형식

```shell
manus/{agent_profile}
```

**예제:**
- `manus/manus-1.6` - 범용 에이전트
- `manus/manus-1.6-lite` - 간단한 작업용 경량 에이전트
- `manus/manus-1.6-max` - 복잡한 분석용 고급 에이전트

## LiteLLM Python SDK

```python showLineNumbers title="Basic Usage"
import litellm
import os
import time

# Set API key
os.environ["MANUS_API_KEY"] = "your-manus-api-key"

# Create task
response = litellm.responses(
    model="manus/manus-1.6",
    input="What's the capital of France?",
)

print(f"Task ID: {response.id}")
print(f"Status: {response.status}")  # "running"

# Poll until complete
task_id = response.id
while response.status == "running":
    time.sleep(5)
    response = litellm.get_response(
        response_id=task_id,
        custom_llm_provider="manus",
    )
    print(f"Status: {response.status}")

# Get results
if response.status == "completed":
    for message in response.output:
        if message.role == "assistant":
            print(message.content[0].text)
```

## LiteLLM AI Gateway

### 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: manus-agent
    litellm_params:
      model: manus/manus-1.6
      api_key: os.environ/MANUS_API_KEY
```

```bash title="Start Proxy"
litellm --config config.yaml
```

### 사용법

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Create Task"
# Create task
curl -X POST http://localhost:4000/responses \
  -H "Authorization: Bearer your-proxy-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "manus-agent",
    "input": "What is the capital of France?"
  }'

# Response
{
  "id": "task_abc123",
  "status": "running",
  "metadata": {
    "task_url": "https://manus.im/app/task_abc123"
  }
}
```

```bash showLineNumbers title="Poll for Completion"
# Check status (repeat until status is "completed")
curl http://localhost:4000/responses/task_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# When completed
{
  "id": "task_abc123",
  "status": "completed",
  "output": [
    {
      "role": "user",
      "content": [{"text": "What is the capital of France?"}]
    },
    {
      "role": "assistant",
      "content": [{"text": "The capital of France is Paris."}]
    }
  ]
}
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers title="Create Task and Poll"
import openai
import time

client = openai.OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-key"
)

# Create task
response = client.responses.create(
    model="manus-agent",
    input="What is the capital of France?"
)

print(f"Task ID: {response.id}")
print(f"Status: {response.status}")  # "running"

# Poll until complete
task_id = response.id
while response.status == "running":
    time.sleep(5)
    response = client.responses.retrieve(response_id=task_id)
    print(f"Status: {response.status}")

# Get results
if response.status == "completed":
    for message in response.output:
        if message.role == "assistant":
            print(message.content[0].text)
```

</TabItem>
</Tabs>

## 작동 방식

Manus는 **비동기 에이전트 API**로 작동합니다.

1. **작업 생성**: `litellm.responses()`를 호출하면 Manus가 작업을 만들고 `status: "running"` 상태로 즉시 반환합니다.
2. **작업 실행**: 에이전트가 백그라운드에서 요청을 처리합니다.
3. **완료 여부 폴링**: 상태가 `"completed"`로 바뀔 때까지 `litellm.get_response()` 또는 `client.responses.retrieve()`를 반복 호출해야 합니다.
4. **결과 가져오기**: 완료되면 `output` 필드에 전체 대화가 포함됩니다.

**작업 상태:**
- `running` - 에이전트가 작업 중입니다.
- `pending` - 에이전트가 입력을 기다리고 있습니다.
- `completed` - 작업이 성공적으로 완료되었습니다.
- `error` - 작업이 실패했습니다.

:::tip Production 사용법
프로덕션 애플리케이션에서는 작업 완료 알림을 받기 위해 폴링 대신 [webhooks](https://open.manus.im/docs/webhooks)를 사용하세요.
:::

## 지원 파라미터

| 파라미터 | 지원 여부 | 참고 |
|-----------|-----------|-------|
| `input` | ✅ | 텍스트, 이미지 또는 구조화된 콘텐츠 |
| `stream` | ✅ | 가짜 스트리밍(작업은 비동기로 실행됨) |
| `max_output_tokens` | ✅ | 응답 길이를 제한합니다. |
| `previous_response_id` | ✅ | 멀티턴 대화에 사용합니다. |

## Files API

Manus는 문서 분석과 처리를 위한 파일 업로드를 지원합니다. 파일을 업로드한 뒤 Responses API 호출에서 참조할 수 있습니다.

### LiteLLM Python SDK

```python showLineNumbers title="Upload, Use, Retrieve, and Delete Files"
import litellm
import os

# Set API key
os.environ["MANUS_API_KEY"] = "your-manus-api-key"

# Upload file
file_content = b"This is a document for analysis."
created_file = await litellm.acreate_file(
    file=("document.txt", file_content),
    purpose="assistants",
    custom_llm_provider="manus",
)
print(f"Uploaded file: {created_file.id}")

# Use file with Responses API
response = await litellm.aresponses(
    model="manus/manus-1.6",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Summarize this document."},
                {"type": "input_file", "file_id": created_file.id},
            ],
        },
    ],
    extra_body={"task_mode": "agent", "agent_profile": "manus-1.6-agent"},
)
print(f"Response: {response.id}")

# Retrieve file
retrieved_file = await litellm.afile_retrieve(
    file_id=created_file.id,
    custom_llm_provider="manus",
)
print(f"File details: {retrieved_file.filename}, {retrieved_file.bytes} bytes")

# Delete file
deleted_file = await litellm.afile_delete(
    file_id=created_file.id,
    custom_llm_provider="manus",
)
print(f"Deleted: {deleted_file.deleted}")
```

### LiteLLM AI Gateway

<Tabs>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Upload File"
# Upload file
curl -X POST http://localhost:4000/v1/files \
  -H "Authorization: Bearer your-proxy-key" \
  -F "file=@document.txt" \
  -F "purpose=assistants" \
  -F "custom_llm_provider=manus"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "bytes": 1024,
  "created_at": 1234567890,
  "filename": "document.txt",
  "purpose": "assistants",
  "status": "uploaded"
}
```

```bash showLineNumbers title="Use File with Responses API"
# Create response with file
curl -X POST http://localhost:4000/responses \
  -H "Authorization: Bearer your-proxy-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "manus-agent",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "Summarize this document."},
          {"type": "input_file", "file_id": "file_abc123"}
        ]
      }
    ]
  }'
```

```bash showLineNumbers title="Retrieve File"
# Get file details
curl http://localhost:4000/v1/files/file_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "bytes": 1024,
  "created_at": 1234567890,
  "filename": "document.txt",
  "purpose": "assistants",
  "status": "uploaded"
}
```

```bash showLineNumbers title="Delete File"
# Delete file
curl -X DELETE http://localhost:4000/v1/files/file_abc123 \
  -H "Authorization: Bearer your-proxy-key"

# Response
{
  "id": "file_abc123",
  "object": "file",
  "deleted": true
}
```

</TabItem>
<TabItem value="openai" label="OpenAI SDK">

```python showLineNumbers title="Upload, Use, Retrieve, and Delete Files"
import openai

client = openai.OpenAI(
    base_url="http://localhost:4000",
    api_key="your-proxy-key"
)

# Upload file
with open("document.txt", "rb") as f:
    created_file = client.files.create(
        file=f,
        purpose="assistants",
        extra_body={"custom_llm_provider": "manus"}
    )
print(f"Uploaded file: {created_file.id}")

# Use file with Responses API
response = client.responses.create(
    model="manus-agent",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Summarize this document."},
                {"type": "input_file", "file_id": created_file.id}
            ]
        }
    ]
)
print(f"Response: {response.id}")

# Retrieve file
retrieved_file = client.files.retrieve(created_file.id)
print(f"File: {retrieved_file.filename}, {retrieved_file.bytes} bytes")

# Delete file
deleted_file = client.files.delete(created_file.id)
print(f"Deleted: {deleted_file.deleted}")
```

</TabItem>
</Tabs>

## 관련 문서

- [LiteLLM Responses API](/litellm-docs-kr/docs/response_api)
- [LiteLLM Files API](/litellm-docs-kr/docs/proxy/litellm_managed_files)
- [Manus OpenAI 호환성](https://open.manus.im/docs/openai-compatibility)
