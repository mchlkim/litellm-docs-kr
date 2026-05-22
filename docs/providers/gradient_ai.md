import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GradientAI
https://digitalocean.com/products/gradientai


LiteLLM은 GradientAI 모델을 네이티브로 지원합니다.
GradientAI 모델을 사용하려면 LiteLLM 요청에서 `gradient_ai/<model-name>` 형식으로 지정하세요.


## API Key 및 Endpoint

자격 증명과 엔드포인트를 환경 변수로 설정합니다.

```python
import os
os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
os.environ['GRADIENT_AI_AGENT_ENDPOINT'] = "https://api.gradient_ai.com/api/v1/chat"  # default endpoint
```

## Sample 사용법

```python
from litellm import completion
import os

os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
response = completion(
    model="gradient_ai/model-name",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
)
print(response.choices[0].message.content)
```

## Streaming 예제

```python
from litellm import completion
import os

os.environ['GRADIENT_AI_API_KEY'] = "your-api-key"
response = completion(
    model="gradient_ai/model-name",
    messages=[
        {"role": "user", "content": "Write a story about a robot learning to love"}
    ],
    stream=True,
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

## 지원 파라미터

| 파라미터                        | 타입         | 설명                                                        |
|-----------------------------------|--------------|--------------------------------------------------------------------|
| `temperature`                     | float        | 무작위성을 제어합니다. 0.0-2.0 범위입니다.                                      |
| `top_p`                           | float        | nucleus sampling 파라미터입니다. 0.0-1.0 범위입니다.                               |
| `max_tokens`                      | int          | 생성할 최대 토큰 수입니다.                                         |
| `max_completion_tokens`           | int          | `max_tokens`의 대체 파라미터입니다.                                          |
| `stream`                          | bool         | 응답을 스트리밍할지 여부입니다.                                     |
| `k`                               | int          | knowledge bases에서 반환할 상위 결과 수입니다.                         |
| `retrieval_method`                | string       | 검색 전략입니다. `rewrite`, `step_back`, `sub_queries`, `none`을 사용할 수 있습니다.            |
| `frequency_penalty`               | float        | 반복 토큰에 페널티를 적용합니다. -2.0부터 2.0까지입니다.                            |
| `presence_penalty`                | float        | 토큰 존재 여부를 기준으로 페널티를 적용합니다. -2.0부터 2.0까지입니다.                   |
| `stop`                            | string/list  | 생성을 중지할 시퀀스입니다.                                       |
| `kb_filters`                      | List[Dict]   | knowledge base 검색용 필터입니다.                               |
| `instruction_override`            | string       | agent의 기본 instruction을 재정의합니다.                               |
| `include_retrieval_info`          | bool         | 문서 검색 메타데이터를 포함합니다.                                |
| `include_guardrails_info`         | bool         | guardrail 트리거 메타데이터를 포함합니다.                                 |
| `provide_citations`               | bool         | 응답에 citations를 포함합니다.                                      |

---

자세한 내용은 [DigitalOcean GradientAI 문서](https://digitalocean.com/products/gradientai)를 참고하세요.
