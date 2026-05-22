# 사용자 지정 형식으로 모든 LiteLLM 모델 호출하기 {#call-any-litellm-model-in-your-custom-format}

사용자 지정 형식으로 LiteLLM이 지원하는 모든 `.completion()` 모델을 호출할 때 사용합니다. 사용자 지정 API가 있고 LiteLLM이 지원하는 모든 모델을 지원하려는 경우에 유용합니다.

## 동작 방식

사용자 요청 → Adapter가 OpenAI 형식으로 변환 → LiteLLM이 처리 → Adapter가 응답을 다시 변환 → 사용자 응답

## Adapter 만들기 {#create-an-adapter}

`CustomLogger`를 상속하고 3개의 메서드를 구현합니다.

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.llms.openai import ChatCompletionRequest
from litellm.types.utils import ModelResponse

class MyAdapter(CustomLogger):
    def translate_completion_input_params(self, kwargs) -> ChatCompletionRequest:
        """Convert your format → OpenAI format"""
        # Example: Anthropic to OpenAI
        return {
            "model": kwargs["model"],
            "messages": self._convert_messages(kwargs["messages"]),
            "max_tokens": kwargs.get("max_tokens"),
        }

    def translate_completion_output_params(self, response: ModelResponse):
        """Convert OpenAI format → your format"""
        # Return your provider's response format
        return MyProviderResponse(
            id=response.id,
            content=response.choices[0].message.content,
            usage=response.usage,
        )

    def translate_completion_output_params_streaming(self, completion_stream):
        """Handle streaming responses"""
        return MyStreamWrapper(completion_stream)
```

## 등록하기 {#등록-it}

```python
import litellm

my_adapter = MyAdapter()
litellm.adapters = [{"id": "my_provider", "adapter": my_adapter}]
```

## 사용하기 {#use-it}

```python
from litellm import adapter_completion

# Now you can use your provider's format with any LiteLLM model
response = adapter_completion(
    adapter_id="my_provider",
    model="gpt-4",  # or any LiteLLM model
    messages=[{"role": "user", "content": "hello"}],
    max_tokens=100
)
```

### 스트리밍 {#streaming}

```python
stream = adapter_completion(
    adapter_id="my_provider",
    model="gpt-4",
    messages=[{"role": "user", "content": "hello"}],
    stream=True
)

for chunk in stream:
    print(chunk)
```

### 비동기 {#async}

```python
from litellm import aadapter_completion

response = await aadapter_completion(
    adapter_id="my_provider",
    model="gpt-4",
    messages=[{"role": "user", "content": "hello"}]
)
```

## 예제: Anthropic Adapter {#예제-anthropic-adapter}

Anthropic 형식을 변환하는 방식은 다음과 같습니다.

### 입력 변환 {#input-translation}

```python
def translate_completion_input_params(self, kwargs):
    model = kwargs.pop("model")
    messages = kwargs.pop("messages")
    
    # Convert Anthropic messages to OpenAI format
    openai_messages = []
    for msg in messages:
        if msg["role"] == "user":
            openai_messages.append({
                "role": "user",
                "content": msg["content"]
            })
    
    # Handle system message
    if "system" in kwargs:
        openai_messages.insert(0, {
            "role": "system",
            "content": kwargs.pop("system")
        })
    
    return {
        "model": model,
        "messages": openai_messages,
        **kwargs  # pass through other params
    }
```

### 출력 변환 {#output-translation}

```python
def translate_completion_output_params(self, response):
    return AnthropicResponse(
        id=response.id,
        type="message",
        role="assistant",
        content=[{
            "type": "text",
            "text": response.choices[0].message.content
        }],
        usage={
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens
        }
    )
```

### 스트리밍 {#streaming-1}

```python
from litellm.types.utils import AdapterCompletionStreamWrapper

class AnthropicStreamWrapper(AdapterCompletionStreamWrapper):
    def __init__(self, completion_stream, model):
        super().__init__(completion_stream)
        self.model = model
        self.first_chunk = True
    
    async def __anext__(self):
        # First chunk
        if self.first_chunk:
            self.first_chunk = False
            return {"type": "message_start", "message": {...}}
        
        # Stream chunks
        async for chunk in self.completion_stream:
            return {
                "type": "content_block_delta",
                "delta": {"text": chunk.choices[0].delta.content}
            }
        
        # Last chunk
        return {"type": "message_stop"}

def translate_completion_output_params_streaming(self, stream, model):
    return AnthropicStreamWrapper(stream, model)
```

## Proxy와 함께 사용하기 {#use-with-proxy}

proxy config에 다음을 추가합니다.

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/v1/messages"
      target: "my_module.MyAdapter"
```

그런 다음 호출합니다.

```bash
curl http://localhost:4000/v1/messages \
  -H "Authorization: Bearer sk-1234" \
  -d '{"model": "gpt-4", "messages": [...]}'
```

## 실제 예제 {#real-예제}

전체 Anthropic adapter는 다음을 참고하세요.
- [transformation.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/transformation.py)
- [handler.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/handler.py)
- [streaming_iterator.py](https://github.com/BerriAI/litellm/blob/main/litellm/llms/anthropic/experimental_pass_through/adapters/streaming_iterator.py)

## 마무리 {#thats-it}

1. `CustomLogger`를 상속하는 클래스를 만듭니다.
2. 3개의 변환 메서드를 구현합니다.
3. `litellm.adapters = [{"id": "...", "adapter": ...}]`로 등록합니다.
4. `adapter_completion(adapter_id="...")`로 호출합니다.
