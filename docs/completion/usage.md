# 사용법

LiteLLM은 모든 제공자에서 OpenAI 호환 usage 객체를 반환합니다.

```bash
"usage": {
    "prompt_tokens": int,
    "completion_tokens": int,
    "total_tokens": int
  }
```

## 빠른 시작

```python
from litellm import completion
import os

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
  model="gpt-3.5-turbo",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response.usage)
```
> **Note:** LiteLLM은 엔드포인트 브리징을 지원합니다. 모델이 요청된 엔드포인트를 기본적으로 지원하지 않는 경우, LiteLLM은 `model_prices_and_context_window`에 설정된 모델의 `mode`를 기준으로 호출을 올바르게 지원되는 엔드포인트로 자동 라우팅합니다. 예를 들어 `/chat/completions`를 `/responses`로 브리징하거나 그 반대로 브리징할 수 있습니다.

## 스트리밍 사용법 {#streaming-usage}

`stream_options={"include_usage": True}`가 설정된 경우 `data: [DONE]` 메시지 전에 추가 청크가 스트리밍됩니다. 이 청크의 usage 필드는 전체 요청의 토큰 사용량 통계를 표시하며, choices 필드는 항상 빈 배열입니다. 다른 모든 청크에도 usage 필드가 포함되지만 값은 null입니다.


```python
from litellm import completion 

completion = completion(
  model="gpt-4o",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  stream=True,
  stream_options={"include_usage": True}
)

for chunk in completion:
  print(chunk.choices[0].delta)

```

### 프록시: 스트리밍 사용량 항상 포함 {#proxy-always-include-streaming-usage}

LiteLLM Proxy를 사용할 때 클라이언트가 `stream_options={"include_usage": True}`를 보내지 않더라도 모든 스트리밍 응답에 사용량 정보를 자동으로 포함하도록 설정할 수 있습니다.

#### 설정

config.yaml에 다음을 추가합니다.

```yaml
general_settings:
  always_include_stream_usage: true
```

또는 UI를 통해 설정할 수 있습니다.

1. LiteLLM Proxy UI로 이동합니다.
2. `Settings` >  `Router Settings` > `General`로 이동합니다.
3. `always_include_stream_usage` 설정을 찾습니다.
4. 값을 `true`로 전환합니다.
5. 저장하려면 `Update`를 클릭합니다.

#### 동작 방식

`always_include_stream_usage`가 활성화되면 다음과 같이 동작합니다.
- 모든 스트리밍 요청에 `stream_options={"include_usage": True}`가 자동으로 추가됩니다.
- 클라이언트가 명시적으로 요청하지 않았더라도 최종 청크에서 사용량 정보를 받습니다.
- 클라이언트가 이미 `stream_options`를 제공한 경우 다른 옵션을 덮어쓰지 않고 `include_usage: True`가 추가됩니다.
- 스트리밍이 아닌 요청은 영향을 받지 않습니다.

#### 예제

이 설정을 활성화하면 다음과 같은 간단한 스트리밍 요청에서:

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

`stream_options`를 명시적으로 포함하지 않아도 응답에서 사용량 정보를 자동으로 받습니다.

```
