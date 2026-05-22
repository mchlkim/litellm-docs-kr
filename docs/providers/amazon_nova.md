import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Amazon Nova

| 속성 | 상세 |
|-------|-------|
| 설명 | Amazon Nova는 Amazon이 구축한 foundation model 제품군으로, frontier intelligence와 업계 최고 수준의 가격 대비 성능을 제공합니다. |
| LiteLLM Provider 경로 | `amazon_nova/` |
| Provider 문서 | [Amazon Nova ↗](https://docs.aws.amazon.com/nova/latest/userguide/what-is-nova.html) |
| 지원 OpenAI 엔드포인트 | `/chat/completions`, `v1/responses` |
| 기타 지원 엔드포인트 | `v1/messages`, `/generateContent` | 

## 인증

Amazon Nova는 API key 인증을 사용합니다. API key는 [Amazon Nova developer console ↗](https://nova.amazon.com/dev/documentation)에서 받을 수 있습니다.

```bash
export AMAZON_NOVA_API_KEY="your-api-key"
```

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

# Set your API key
os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

### 1. config.yaml 설정 {#1-setup-configyaml}

```yaml
model_list:
  - model_name: amazon-nova-micro
    litellm_params:
      model: amazon_nova/nova-micro-v1
      api_key: os.environ/AMAZON_NOVA_API_KEY
```
### 2. 프록시 시작
```bash
litellm --config /path/to/config.yaml
```

### 3. 테스트 {#3-test-it}

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ]
}'
```

</TabItem>
</Tabs>

## 지원 모델 {#supported-모델}

| 모델 이름 | 사용법 | 컨텍스트 윈도우 |
|------------|-------|----------------|
| Nova Micro | `completion(model="amazon_nova/nova-micro-v1", messages=messages)` | 128K 토큰 |
| Nova Lite | `completion(model="amazon_nova/nova-lite-v1", messages=messages)` | 300K 토큰 |
| Nova Pro | `completion(model="amazon_nova/nova-pro-v1", messages=messages)` | 300K 토큰 |
| Nova Premier | `completion(model="amazon_nova/nova-premier-v1", messages=messages)` | 1M 토큰 |

## 사용법 - 스트리밍 {#사용법---streaming}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Tell me about machine learning"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "Tell me about machine learning"
        }
    ],
    "stream": true
}'
```

</TabItem>
</Tabs>

## 사용법 - 함수 호출 / 도구 사용 {#사용법---function-calling--tool-사용법}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "function",
        "function": {
            "name": "getCurrentWeather",
            "description": "Get the current weather in a given city",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City and country e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = completion(
    model="amazon_nova/nova-micro-v1",
    messages=[
        {"role": "user", "content": "What's the weather like in San Francisco?"}
    ],
    tools=tools
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-micro",
    "messages": [
        {
            "role": "user",
            "content": "What'\''s the weather like in San Francisco?"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "getCurrentWeather",
                "description": "Get the current weather in a given city",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country e.g. San Francisco, CA"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

## temperature, top_p 등 설정 {#set-temperature-top_p-etc}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import os
from litellm import completion

os.environ["AMAZON_NOVA_API_KEY"] = "your-api-key"

response = completion(
    model="amazon_nova/nova-pro-v1",
    messages=[
        {"role": "user", "content": "Write a creative story"}
    ],
    temperature=0.8,
    max_tokens=500,
    top_p=0.9
)

print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

**yaml에서 설정**

```yaml
model_list:
  - model_name: amazon-nova-pro
    litellm_params:
      model: amazon_nova/nova-pro-v1
      temperature: 0.8
      max_tokens: 500
      top_p: 0.9
```
**요청에서 설정**
```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model": "amazon-nova-pro",
    "messages": [
        {
            "role": "user",
            "content": "Write a creative story"
        }
    ],
    "temperature": 0.8,
    "max_tokens": 500,
    "top_p": 0.9
}'
```

</TabItem>
</Tabs>

## 모델 비교 {#model-comparison}

| 모델 | 적합한 용도 | 속도 | 비용 | 컨텍스트 |
|-------|----------|-------|------|---------|
| **Nova Micro** | 단순 작업, 높은 처리량 | 가장 빠름 | 가장 낮음 | 128K |
| **Nova Lite** | 균형 잡힌 성능 | 빠름 | 낮음 | 300K |
| **Nova Pro** | 복잡한 추론 | 보통 | 보통 | 300K |
| **Nova Premier** | 가장 고급 작업 | 느림 | 높음 | 1M |

## 오류 처리 {#error-handling}

일반적인 오류 코드와 의미는 다음과 같습니다.

- `401 Unauthorized`: 유효하지 않은 API key
- `429 Too Many Requests`: rate limit 초과
- `400 Bad Request`: 유효하지 않은 요청 형식
- `500 Internal Server Error`: 서비스를 일시적으로 사용할 수 없음
