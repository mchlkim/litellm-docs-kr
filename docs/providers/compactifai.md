import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CompactifAI
https://docs.compactif.ai/

CompactifAI는 주요 언어 모델의 고압축 버전을 제공하며, 최소한의 품질 손실(5% 미만)로 **최대 70% 낮은 추론 비용**, **4배 처리량 향상**, **저지연 추론**을 제공합니다. CompactifAI의 OpenAI 호환 API는 통합을 간단하게 만들어 개발자가 더 뛰어난 동시성과 리소스 효율성을 갖춘 초고효율의 확장 가능한 AI 애플리케이션을 구축할 수 있게 합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | CompactifAI는 주요 언어 모델의 압축 버전을 제공하며 최대 70% 비용 절감과 4배 처리량 향상을 지원합니다 |
| LiteLLM의 공급자 라우트 | `compactifai/` (모델 이름 앞에 이 접두사를 추가합니다. 예: `compactifai/cai-llama-3-1-8b-slim`) |
| 공급자 문서 | [CompactifAI ↗](https://docs.compactif.ai/) |
| 공급자 API 엔드포인트 | https://api.compactif.ai/v1 |
| 지원 엔드포인트 | `/chat/completions`, `/completions` |

## 지원되는 OpenAI 파라미터

CompactifAI는 OpenAI와 완전히 호환되며 다음 파라미터를 지원합니다.

```
"stream",
"stop",
"temperature",
"top_p",
"max_tokens",
"presence_penalty",
"frequency_penalty",
"logit_bias",
"user",
"response_format",
"seed",
"tools",
"tool_choice",
"parallel_tool_calls",
"extra_headers"
```

## API 키 설정

CompactifAI API 키는 AWS Marketplace 구독을 통해 사용할 수 있습니다.

1. [AWS Marketplace](https://aws.amazon.com/marketplace)를 통해 구독합니다.
2. 구독 검증을 완료합니다(24시간 검토 프로세스).
3. 제공된 자격 증명으로 MultiverseIAM 대시보드에 액세스합니다.
4. 대시보드에서 API 키를 가져옵니다.

```python
import os

os.environ["COMPACTIFAI_API_KEY"] = "your-api-key"
```

## 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['COMPACTIFAI_API_KEY'] = "your-api-key"

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[
       {"role": "user", "content": "Hello from LiteLLM!"}
   ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="Proxy">

```yaml
model_list:
  - model_name: llama-2-compressed
    litellm_params:
      model: compactifai/cai-llama-3-1-8b-slim
      api_key: os.environ/COMPACTIFAI_API_KEY
```

</TabItem>
</Tabs>

## 스트리밍

```python
from litellm import completion
import os

os.environ['COMPACTIFAI_API_KEY'] = "your-api-key"

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[
       {"role": "user", "content": "Write a short story"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 고급 사용법

### 사용자 지정 파라미터

```python
from litellm import completion

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    stop=["Human:", "AI:"]
)
```

### 함수 호출

CompactifAI는 OpenAI 호환 함수 호출을 지원합니다.

```python
from litellm import completion

functions = [
    {
        "name": "get_weather",
        "description": "Get current weather information",
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
]

response = completion(
    model="compactifai/cai-llama-3-1-8b-slim",
    messages=[{"role": "user", "content": "What's the weather in San Francisco?"}],
    tools=[{"type": "function", "function": f} for f in functions],
    tool_choice="auto"
)
```

### 비동기 사용법

```python
import asyncio
from litellm import acompletion

async def async_call():
    response = await acompletion(
        model="compactifai/cai-llama-3-1-8b-slim",
        messages=[{"role": "user", "content": "Hello async world!"}]
    )
    return response

# Run async function
response = asyncio.run(async_call())
print(response)
```

## 사용 가능한 모델

CompactifAI는 인기 모델의 압축 버전을 제공합니다. 최신 목록을 가져오려면 `/models` 엔드포인트를 사용하세요.

```python
import httpx

headers = {"Authorization": f"Bearer {your_api_key}"}
response = httpx.get("https://api.compactif.ai/v1/models", headers=headers)
models = response.json()
```

일반적인 모델 형식:
- `compactifai/cai-llama-3-1-8b-slim`
- `compactifai/mistral-7b-compressed`
- `compactifai/codellama-7b-compressed`

## 장점

- **비용 효율성**: 표준 모델 대비 추론 비용을 최대 70% 절감
- **고성능**: 최소한의 품질 손실(5% 미만)로 4배 처리량 향상
- **저지연**: 빠른 응답 시간에 최적화
- **즉시 대체 가능**: 완전한 OpenAI API 호환성
- **확장성**: 뛰어난 동시성과 리소스 효율성

## 오류 처리

CompactifAI는 표준 OpenAI 호환 오류 응답을 반환합니다.

```python
from litellm import completion
from litellm.exceptions import AuthenticationError, RateLimitError

try:
    response = completion(
        model="compactifai/cai-llama-3-1-8b-slim",
        messages=[{"role": "user", "content": "Hello"}]
    )
except AuthenticationError:
    print("Invalid API key")
except RateLimitError:
    print("Rate limit exceeded")
```

## 지원

- 문서: https://docs.compactif.ai/
- LinkedIn: [MultiverseComputing](https://www.linkedin.com/company/multiversecomputing)
- 분석: [Artificial Analysis Provider Comparison](https://artificialanalysis.ai/providers/compactifai)
