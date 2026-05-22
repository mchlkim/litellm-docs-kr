import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Z.AI (Zhipu AI)
https://z.ai/

**Z.AI GLM text/chat 모델을 지원합니다. `completion` 요청을 보낼 때 `zai/`를 prefix로 설정하면 됩니다.**

## API 키 {#api-key}
```python
# env variable
os.environ['ZAI_API_KEY']
```

## 샘플 사용법 {#sample-usage}
```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
)
print(response)
```

## 샘플 사용법 - 스트리밍 {#sample-usage---streaming}
```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[
       {"role": "user", "content": "hello from litellm"}
   ],
    stream=True
)

for chunk in response:
    print(chunk)
```

## 지원 모델 {#supported-models}

모든 Z.AI GLM 모델을 지원합니다. `completion` 요청을 보낼 때 `zai/`를 prefix로 설정하면 됩니다.

| 모델 이름 | 함수 호출 | 참고 |
|------------|---------------|-------|
| `glm-4.7` | `completion(model="zai/glm-4.7", messages)` | **최신 대표 모델**, 200K context, **Reasoning** |
| `glm-4.6` | `completion(model="zai/glm-4.6", messages)` | 200K context |
| `glm-4.5` | `completion(model="zai/glm-4.5", messages)` | 128K context |
| `glm-4.5v` | `completion(model="zai/glm-4.5v", messages)` | Vision 모델 |
| `glm-4.5-x` | `completion(model="zai/glm-4.5-x", messages)` | 프리미엄 tier |
| `glm-4.5-air` | `completion(model="zai/glm-4.5-air", messages)` | 경량 모델 |
| `glm-4.5-airx` | `completion(model="zai/glm-4.5-airx", messages)` | 빠른 경량 모델 |
| `glm-4-32b-0414-128k` | `completion(model="zai/glm-4-32b-0414-128k", messages)` | 32B 파라미터 모델 |
| `glm-4.5-flash` | `completion(model="zai/glm-4.5-flash", messages)` | **무료 tier** |

## 모델 가격 {#model-pricing}

| 모델 | 입력 ($/1M tokens) | 출력 ($/1M tokens) | 캐시된 입력 ($/1M tokens) | 컨텍스트 창 |
|-------|---------------------|----------------------|---------------------------|----------------|
| `glm-4.7` | $0.60 | $2.20 | $0.11 | 200K |
| `glm-4.6` | $0.60 | $2.20 | - | 200K |
| `glm-4.5` | $0.60 | $2.20 | - | 128K |
| `glm-4.5v` | $0.60 | $1.80 | - | 128K |
| `glm-4.5-x` | $2.20 | $8.90 | - | 128K |
| `glm-4.5-air` | $0.20 | $1.10 | - | 128K |
| `glm-4.5-airx` | $1.10 | $4.50 | - | 128K |
| `glm-4-32b-0414-128k` | $0.10 | $0.10 | - | 128K |
| `glm-4.5-flash` | **무료** | **무료** | - | 128K |

## LiteLLM Proxy와 함께 사용 {#using-with-litellm-proxy}

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['ZAI_API_KEY'] = ""
response = completion(
    model="zai/glm-4.7",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
)

print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. `config.yaml`을 설정합니다.

```yaml
model_list:
  - model_name: glm-4.7
    litellm_params:
        model: zai/glm-4.7
        api_key: os.environ/ZAI_API_KEY
  - model_name: glm-4.5-flash  # Free tier
    litellm_params:
        model: zai/glm-4.5-flash
        api_key: os.environ/ZAI_API_KEY
```

2. proxy를 실행합니다.

```bash
litellm --config config.yaml
```

3. 테스트합니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "glm-4.7",
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
