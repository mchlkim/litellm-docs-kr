import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chat Completions, Responses API의 이미지 생성 {#image-generation-in-chat-completions-responses-api}

이 가이드는 `chat/completions`를 사용할 때 이미지를 생성하는 방법을 다룹니다. 참고 - Responses API에서 이 기능을 사용하고 싶다면 [여기](https://github.com/BerriAI/litellm/issues/new)에 기능 요청을 등록해 주세요.

:::info

LiteLLM v1.76.1+가 필요합니다.

:::

지원 프로바이더:
- `Google AI Studio` (`gemini`)
- Vertex AI (`vertex_ai/`)

LiteLLM은 chat completions 중 이미지 생성을 지원하는 모델에 대해 assistant 메시지의 `images` 응답을 표준화합니다.

```python title="Example response from litellm"
"message": {
    ...
    "content": "Here's the image you requested:",
    "images": [
        {
            "image_url": {
                "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                "detail": "auto"
            },
            "index": 0,
            "type": "image_url"
        }
    ]
}
```

## 빠른 시작 {#quick-start}

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Image generation with chat completion"
from litellm import completion
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-image-preview",
    messages=[
        {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
    ],
)

print(response.choices[0].message.content)  # Text response
print(response.choices[0].message.images)   # List of image objects
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-image-gen
    litellm_params:
      model: gemini/gemini-2.5-flash-image-preview
      api_key: os.environ/GEMINI_API_KEY
```

2. 프록시 서버 실행

```bash showLineNumbers title="Start the proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트

```bash showLineNumbers title="Make request"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gemini-image-gen",
    "messages": [
      {
        "role": "user",
        "content": "Generate an image of a banana wearing a costume that says LiteLLM"
      }
    ]
  }'
```

</TabItem>
</Tabs>

**예상 응답**

```bash
{
    "id": "chatcmpl-3b66124d79a708e10c603496b363574c",
    "choices": [
        {
            "finish_reason": "stop",
            "index": 0,
            "message": {
                "content": "Here's the image you requested:",
                "role": "assistant",
                "images": [
                    {
                        "image_url": {
                            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                            "detail": "auto"
                        },
                        "index": 0,
                        "type": "image_url"
                    }
                ]
            }
        }
    ],
    "created": 1723323084,
    "model": "gemini/gemini-2.5-flash-image-preview",
    "object": "chat.completion",
    "usage": {
        "completion_tokens": 12,
        "prompt_tokens": 16,
        "total_tokens": 28
    }
}
```

## 스트리밍 지원 {#streaming-support}

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="Streaming image generation"
from litellm import completion
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = completion(
    model="gemini/gemini-2.5-flash-image-preview",
    messages=[
        {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
    ],
    stream=True,
)

for chunk in response:
    if hasattr(chunk.choices[0].delta, "images") and chunk.choices[0].delta.images is not None:
        print("Generated image:", chunk.choices[0].delta.images[0]["image_url"]["url"])
        break
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash showLineNumbers title="Streaming request"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gemini-image-gen",
    "messages": [
      {
        "role": "user",
        "content": "Generate an image of a banana wearing a costume that says LiteLLM"
      }
    ],
    "stream": true
  }'
```

</TabItem>
</Tabs>

**예상 스트리밍 응답**

```bash
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"content":"Here's the image you requested:"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{"images":[{"image_url":{"url":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...","detail":"auto"},"index":0,"type":"image_url"}]},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1723323084,"model":"gemini/gemini-2.5-flash-image-preview","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

## 비동기 지원 {#async-support}

```python showLineNumbers title="Async image generation"
from litellm import acompletion
import asyncio
import os 

os.environ["GEMINI_API_KEY"] = "your-api-key"

async def generate_image():
    response = await acompletion(
        model="gemini/gemini-2.5-flash-image-preview",
        messages=[
            {"role": "user", "content": "Generate an image of a banana wearing a costume that says LiteLLM"}
        ],
    )
    
    print(response.choices[0].message.content)  # Text response
    print(response.choices[0].message.images)   # List of image objects

    return response

# Run the async function
asyncio.run(generate_image())
```

## 지원 모델 {#supported-models}

| 프로바이더 | 모델 | 
|----------|--------|
| Google AI Studio | `gemini/gemini-2.0-flash-preview-image-generation`, `gemini/gemini-2.5-flash-image-preview`, `gemini/gemini-3-pro-image-preview` |
| Vertex AI | `vertex_ai/gemini-2.0-flash-preview-image-generation`, `vertex_ai/gemini-2.5-flash-image-preview`, `vertex_ai/gemini-3-pro-image-preview` |

## 사양 {#spec}

응답의 `images` 필드는 다음 구조를 따릅니다.

```python
"images": [
    {
        "image_url": {
            "url": "data:image/png;base64,<base64_encoded_image>",
            "detail": "auto"
        },
        "index": 0,
        "type": "image_url"
    }
]
```

- `images` - List[ImageURLListItem]: 생성된 이미지 배열
  - `image_url` - ImageURLObject: 이미지 데이터 컨테이너
    - `url` - str: data URI 형식의 Base64 인코딩 이미지 데이터
    - `detail` - str: 이미지 세부 수준(생성된 이미지에서는 항상 "auto")
  - `index` - int: 응답 내 이미지의 인덱스
  - `type` - str: 타입 식별자(항상 "image_url")

이미지는 Base64로 인코딩된 data URI로 반환되며, HTML `<img>` 태그에서 바로 사용하거나 파일로 저장할 수 있습니다.
