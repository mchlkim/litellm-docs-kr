import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Bedrock - Writer Palmyra` {#bedrock---writer-palmyra}

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | Amazon Bedrock의 Writer Palmyra X5 및 X4 foundation model입니다. 고급 추론, 도구 호출, 문서 처리 기능을 제공합니다. |
| LiteLLM Provider 경로 | `bedrock/` |
| 지원 작업 | `/chat/completions` |
| Provider 문서 링크 | [Writer on AWS Bedrock ↗](https://aws.amazon.com/bedrock/writer/) |

## 빠른 시작

### LiteLLM SDK

```python showLineNumbers title="SDK Usage"
import litellm
import os

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-west-2"

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

### LiteLLM Proxy

**1. `config.yaml` 설정**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: writer-palmyra-x5
    litellm_params:
      model: bedrock/us.writer.palmyra-x5-v1:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

**2. 프록시 시작**

```bash showLineNumbers title="Start Proxy"
litellm --config config.yaml
```

**3. Proxy 호출**

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="curl Request"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000/v1"
)

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## 도구 호출

Writer Palmyra 모델은 복잡한 workflow를 위한 multi-step 도구 호출을 지원합니다.

### LiteLLM SDK

```python showLineNumbers title="Tool Calling - SDK"
import litellm

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[{"role": "user", "content": "What's the weather in Boston?"}],
    tools=tools
)
```

### LiteLLM Proxy

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Tool Calling - curl"
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{"role": "user", "content": "What'\''s the weather in Boston?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string", "description": "The city and state"}
          },
          "required": ["location"]
        }
      }
    }]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Tool Calling - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000/v1"
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[{"role": "user", "content": "What's the weather in Boston?"}],
    tools=tools
)
```

</TabItem>
</Tabs>

## 문서 입력 {#document-input}

Writer Palmyra 모델은 PDF를 포함한 문서 입력을 지원합니다.

### LiteLLM SDK

```python showLineNumbers title="PDF Document Input - SDK"
import litellm
import base64

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

response = litellm.completion(
    model="bedrock/us.writer.palmyra-x5-v1:0",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:application/pdf;base64,{pdf_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": "Summarize this document"
                }
            ]
        }
    ]
)
```

### LiteLLM Proxy

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="PDF Document Input - curl"
# First, base64 encode your PDF
PDF_BASE64=$(base64 -i document.pdf)

curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "writer-palmyra-x5",
    "messages": [{
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {"url": "data:application/pdf;base64,'$PDF_BASE64'"}
        },
        {
          "type": "text",
          "text": "Summarize this document"
        }
      ]
    }]
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="PDF Document Input - OpenAI SDK"
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-1234",
    base_url="http://localhost:4000/v1"
)

# Read and encode PDF
with open("document.pdf", "rb") as f:
    pdf_base64 = base64.b64encode(f.read()).decode("utf-8")

response = client.chat.completions.create(
    model="writer-palmyra-x5",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:application/pdf;base64,{pdf_base64}"
                    }
                },
                {
                    "type": "text",
                    "text": "Summarize this document"
                }
            ]
        }
    ]
)
```

</TabItem>
</Tabs>

## 지원 모델 {#supported-models}

| Model ID | Context Window | 입력 비용(1K tokens당) | 출력 비용(1K tokens당) |
|----------|---------------|---------------------------|----------------------------|
| `bedrock/us.writer.palmyra-x5-v1:0` | 1M tokens | $0.0006 | $0.006 |
| `bedrock/us.writer.palmyra-x4-v1:0` | 128K tokens | $0.0025 | $0.010 |
| `bedrock/writer.palmyra-x5-v1:0` | 1M tokens | $0.0006 | $0.006 |
| `bedrock/writer.palmyra-x4-v1:0` | 128K tokens | $0.0025 | $0.010 |

:::info 교차 리전 추론
`us.writer.*` model ID는 cross-region inference profile을 사용합니다. 프로덕션 workload에는 이 ID를 사용하세요.
:::
