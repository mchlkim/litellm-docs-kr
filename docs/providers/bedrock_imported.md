import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock Imported 모델

Bedrock Imported 모델 (Deepseek, Deepseek R1, Qwen, OpenAI 호환 모델)

### Deepseek R1

채팅 템플릿이 다르기 때문에 별도 라우트입니다.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/deepseek_r1/{model_arn}` |
| 제공자 문서 | [Bedrock Imported 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html), [Deepseek Bedrock Imported 모델](https://aws.amazon.com/blogs/machine-learning/deploy-deepseek-r1-distilled-llama-models-with-amazon-bedrock-custom-model-import/) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/deepseek_r1/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n",  # bedrock/deepseek_r1/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. 설정에 추가**

```yaml
model_list:
    - model_name: DeepSeek-R1-Distill-Llama-70B
      litellm_params:
        model: bedrock/deepseek_r1/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n

```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "DeepSeek-R1-Distill-Llama-70B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>


### Deepseek (R1 아님)

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/llama/{model_arn}` |
| 제공자 문서 | [Bedrock Imported 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html), [Deepseek Bedrock Imported 모델](https://aws.amazon.com/blogs/machine-learning/deploy-deepseek-r1-distilled-llama-models-with-amazon-bedrock-custom-model-import/) |



`llama` Invoke Request / Response 사양을 따르는 Bedrock Imported 모델을 호출할 때 이 라우트를 사용하세요.


<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/llama/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n",  # bedrock/llama/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">


**1. 설정에 추가**

```yaml
model_list:
    - model_name: DeepSeek-R1-Distill-Llama-70B
      litellm_params:
        model: bedrock/llama/arn:aws:bedrock:us-east-1:086734376398:imported-model/r4c4kewx2s0n

```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "DeepSeek-R1-Distill-Llama-70B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### Qwen3 Imported 모델

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/qwen3/{model_arn}` |
| 제공자 문서 | [Bedrock Imported 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html), [Qwen3 모델](https://aws.amazon.com/about-aws/whats-new/2025/09/qwen3-models-fully-managed-amazon-bedrock/) |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/qwen3/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen3-model",  # bedrock/qwen3/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=100,
    temperature=0.7
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">

**1. 설정에 추가**

```yaml
model_list:
    - model_name: Qwen3-32B
      litellm_params:
        model: bedrock/qwen3/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen3-model

```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "Qwen3-32B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### Qwen2 Imported 모델

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/qwen2/{model_arn}` |
| 제공자 문서 | [Bedrock Imported 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html) |
| 참고 | Qwen2와 Qwen3 아키텍처는 대부분 유사합니다. 주요 차이는 응답 형식에 있습니다. Qwen2는 "text" 필드를 사용하고 Qwen3는 "generation" 필드를 사용합니다. |

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

response = completion(
    model="bedrock/qwen2/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen2-model",  # bedrock/qwen2/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=100,
    temperature=0.7
)
```

</TabItem>

<TabItem value="proxy" label="Proxy">

**1. 설정에 추가**

```yaml
model_list:
    - model_name: Qwen2-72B
      litellm_params:
        model: bedrock/qwen2/arn:aws:bedrock:us-east-1:086734376398:imported-model/your-qwen2-model

```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "Qwen2-72B", # 👈 the 'model_name' in config
            "messages": [
                {
                "role": "user",
                "content": "what llm are you"
                }
            ],
        }'
```

</TabItem>
</Tabs>

### OpenAI 호환 Imported 모델 (Qwen 2.5 VL 등)

**OpenAI Chat Completions API 사양**을 따르는 Bedrock Imported 모델에는 이 라우트를 사용하세요. 여기에는 비전(이미지), 도구 호출 및 기타 OpenAI 기능을 지원하는 OpenAI 형식 메시지를 받는 Qwen 2.5 VL 같은 모델이 포함됩니다.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/openai/{model_arn}` |
| 제공자 문서 | [Bedrock Imported 모델](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import-model.html) |
| 지원 기능 | 비전(이미지), 도구 호출, 스트리밍, 시스템 메시지 |

#### LiteLLM SDK 사용법

**기본 사용법**

```python
from litellm import completion

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",  # bedrock/openai/{your-model-arn}
    messages=[{"role": "user", "content": "Tell me a joke"}],
    max_tokens=300,
    temperature=0.5
)
```

**비전(이미지) 사용**

```python
import base64
from litellm import completion

# Load and encode image
with open("image.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that can analyze images."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                }
            ]
        }
    ],
    max_tokens=300,
    temperature=0.5
)
```

**여러 이미지 비교**

```python
import base64
from litellm import completion

# Load images
with open("image1.jpg", "rb") as f:
    image1_base64 = base64.b64encode(f.read()).decode("utf-8")
with open("image2.jpg", "rb") as f:
    image2_base64 = base64.b64encode(f.read()).decode("utf-8")

response = completion(
    model="bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that can analyze images."
        },
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Spot the difference between these two images?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image1_base64}"}
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image2_base64}"}
                }
            ]
        }
    ],
    max_tokens=300,
    temperature=0.5
)
```

#### LiteLLM Proxy 사용법 (AI Gateway)

**1. 설정에 추가**

```yaml
model_list:
    - model_name: qwen-25vl-72b
      litellm_params:
        model: bedrock/openai/arn:aws:bedrock:us-east-1:046319184608:imported-model/0m2lasirsp6z
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

기본 텍스트 요청:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "qwen-25vl-72b",
            "messages": [
                {
                    "role": "user",
                    "content": "what llm are you"
                }
            ],
            "max_tokens": 300
        }'
```

비전(이미지) 사용:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
      --header 'Authorization: Bearer sk-1234' \
      --header 'Content-Type: application/json' \
      --data '{
            "model": "qwen-25vl-72b",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that can analyze images."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "What is in this image?"},
                        {
                            "type": "image_url",
                            "image_url": {"url": "data:image/jpeg;base64,/9j/4AAQSkZ..."}
                        }
                    ]
                }
            ],
            "max_tokens": 300,
            "temperature": 0.5
        }'
```

### Moonshot Kimi K2 Thinking 모델

Moonshot AI의 Kimi K2 Thinking 모델을 이제 Amazon Bedrock에서 사용할 수 있습니다. 이 모델은 추론 콘텐츠 자동 추출을 포함한 고급 추론 기능을 제공합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 제공자 라우트 | `bedrock/moonshot.kimi-k2-thinking`, `bedrock/invoke/moonshot.kimi-k2-thinking` |
| 제공자 문서 | [AWS Bedrock Moonshot 발표 ↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-fully-managed-open-weight-models/) |
| 지원 파라미터 | `temperature`, `max_tokens`, `top_p`, `stream`, `tools`, `tool_choice` |
| 특수 기능 | 추론 콘텐츠 추출, 도구 호출 |

#### 지원 기능

- **추론 콘텐츠 추출**: `<reasoning>` 태그를 자동으로 추출하여 `reasoning_content`로 반환합니다(OpenAI의 o1 모델과 유사).
- **도구 호출**: 도구 응답을 포함한 함수/도구 호출을 완전히 지원합니다.
- **스트리밍**: 스트리밍 및 비스트리밍 응답을 모두 지원합니다.
- **시스템 메시지**: 시스템 메시지를 지원합니다.

#### 기본 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python title="Moonshot Kimi K2 SDK Usage" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"  # or your preferred region

# Basic completion
response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",  # or bedrock/invoke/moonshot.kimi-k2-thinking
    messages=[
        {"role": "user", "content": "What is 2+2? Think step by step."}
    ],
    temperature=0.7,
    max_tokens=200
)

print(response.choices[0].message.content)

# Access reasoning content if present
if response.choices[0].message.reasoning_content:
    print("Reasoning:", response.choices[0].message.reasoning_content)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

**1. 설정에 추가**

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: kimi-k2
    litellm_params:
      model: bedrock/moonshot.kimi-k2-thinking
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-west-2
```

**2. 프록시 시작**

```bash title="Start LiteLLM Proxy" showLineNumbers
litellm --config /path/to/config.yaml

# RUNNING at http://0.0.0.0:4000
```

**3. 테스트**

```bash title="Test Kimi K2 via Proxy" showLineNumbers
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Authorization: Bearer sk-1234' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "kimi-k2",
    "messages": [
      {
        "role": "user",
        "content": "What is 2+2? Think step by step."
      }
    ],
    "temperature": 0.7,
    "max_tokens": 200
  }'
```

</TabItem>
</Tabs>

#### 도구 호출 예제

```python title="Kimi K2 with Tool Calling" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"

# Tool calling example
response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo?"}
    ],
    tools=[
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
                            "description": "The city name"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
)

if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Tool called: {tool_call.function.name}")
    print(f"Arguments: {tool_call.function.arguments}")
```

#### 스트리밍 예제

```python title="Kimi K2 Streaming" showLineNumbers
from litellm import completion
import os

os.environ["AWS_ACCESS_KEY_ID"] = "your-aws-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-aws-secret-key"
os.environ["AWS_REGION_NAME"] = "us-west-2"

response = completion(
    model="bedrock/moonshot.kimi-k2-thinking",
    messages=[
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    stream=True,
    temperature=0.7
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    
    # Check for reasoning content in streaming
    if hasattr(chunk.choices[0].delta, 'reasoning_content') and chunk.choices[0].delta.reasoning_content:
        print(f"\n[Reasoning: {chunk.choices[0].delta.reasoning_content}]")
```

#### 지원 파라미터

| 파라미터 | 유형 | 설명 | 지원 여부 |
|-----------|------|-------------|-----------|
| `temperature` | float (0-1) | 출력의 무작위성을 제어합니다. | ✅ |
| `max_tokens` | integer | 생성할 최대 토큰 수입니다. | ✅ |
| `top_p` | float | 뉴클리어스 샘플링 파라미터입니다. | ✅ |
| `stream` | boolean | 스트리밍 응답을 활성화합니다. | ✅ |
| `tools` | array | 도구/함수 정의입니다. | ✅ |
| `tool_choice` | string/object | 도구 선택 사양입니다. | ✅ |
| `stop` | array | 중지 시퀀스입니다. | ❌ (Bedrock에서 지원되지 않음) |
