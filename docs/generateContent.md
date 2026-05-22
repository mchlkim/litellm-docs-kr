import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /generateContent

LiteLLM을 사용해 텍스트 생성, 멀티모달 상호작용, 스트리밍 응답을 위한 Google AI의 generateContent 엔드포인트를 호출합니다.

## 개요 

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ |  |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ✅ | |
| 스트리밍 | ✅ | |
| 폴백 | ✅ | 지원되는 모델 간 적용 |
| 로드 밸런싱 | ✅ | 지원되는 모델 간 적용 |
| 메타데이터 추적 | ✅ | trace ID와 metadata를 observability 콜백(예: S3, Langfuse)에 전달 |

## 사용법 
---

### `LiteLLM Python SDK`

<Tabs>
<TabItem value="basic" label="Basic 사용법">

#### 비스트리밍 예시 {#non-streaming-example}
```python showLineNumbers title="Basic Text Generation"
from litellm.google_genai import agenerate_content
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Hello, can you tell me a short joke?")
    ],
    role="user",
)

response = await agenerate_content(
    contents=contents,
    model="gemini/gemini-2.0-flash",
    max_tokens=100,
)
print(response)
```

#### 스트리밍 예시 {#streaming-example}
```python showLineNumbers title="Streaming Text Generation"
from litellm.google_genai import agenerate_content_stream
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Write a long story about space exploration")
    ],
    role="user",
)

response = await agenerate_content_stream(
    contents=contents,
    model="gemini/gemini-2.0-flash",
    max_tokens=500,
)

async for chunk in response:
    print(chunk)
```

</TabItem>

<TabItem value="sync" label="Sync 사용법">

#### Sync 비스트리밍 예시 {#sync-non-streaming-example}
```python showLineNumbers title="Sync Text Generation"
from litellm.google_genai import generate_content
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Hello, can you tell me a short joke?")
    ],
    role="user",
)

response = generate_content(
    contents=contents,
    model="gemini/gemini-2.0-flash",
    max_tokens=100,
)
print(response)
```

#### Sync 스트리밍 예시 {#sync-streaming-example}
```python showLineNumbers title="Sync Streaming Text Generation"
from litellm.google_genai import generate_content_stream
from google.genai.types import ContentDict, PartDict
import os

# Set API key
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

contents = ContentDict(
    parts=[
        PartDict(text="Write a long story about space exploration")
    ],
    role="user",
)

response = generate_content_stream(
    contents=contents,
    model="gemini/gemini-2.0-flash",
    max_tokens=500,
)

for chunk in response:
    print(chunk)
```

</TabItem>
</Tabs>

### `LiteLLM Proxy Server`

1. config.yaml을 설정합니다.

```yaml
model_list:
    - model_name: gemini-flash
      litellm_params:
        model: gemini/gemini-2.0-flash
        api_key: os.environ/GEMINI_API_KEY
```

2. proxy를 시작합니다.

```bash
litellm --config /path/to/config.yaml
```

3. 테스트합니다.

<Tabs>
<TabItem value="gemini-proxy" label="Google GenAI SDK">

```python showLineNumbers title="Google GenAI SDK with LiteLLM Proxy"
from google.genai import Client
import os

# Configure Google GenAI SDK to use LiteLLM proxy
os.environ["GOOGLE_GEMINI_BASE_URL"] = "http://localhost:4000"
os.environ["GEMINI_API_KEY"] = "sk-1234"

client = Client()

response = client.models.generate_content(
    model="gemini-flash",
    contents=[
        {
            "parts": [{"text": "Write a short story about AI"}],
            "role": "user"
        }
    ],
    config={"max_output_tokens": 100}
)
```


</TabItem>

<TabItem value="curl-proxy" label="curl">

#### 콘텐츠 생성 {#generate-content}

```bash showLineNumbers title="generateContent via LiteLLM Proxy"
curl -L -X POST 'http://localhost:4000/v1beta/models/gemini-flash:generateContent' \
-H 'content-type: application/json' \
-H 'authorization: Bearer sk-1234' \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Write a short story about AI"
        }
      ],
      "role": "user"
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 100
  }
}'
```

#### 스트리밍 콘텐츠 생성 {#stream-generate-content}

```bash showLineNumbers title="streamGenerateContent via LiteLLM Proxy"
curl -L -X POST 'http://localhost:4000/v1beta/models/gemini-flash:streamGenerateContent' \
-H 'content-type: application/json' \
-H 'authorization: Bearer sk-1234' \
-d '{
  "contents": [
    {
      "parts": [
        {
          "text": "Write a long story about space exploration"
        }
      ],
      "role": "user"
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 500
  }
}'
```

</TabItem>
</Tabs>


## 관련 문서 {#related}

- [Use LiteLLM with gemini-cli](../docs/tutorials/litellm_gemini_cli)
