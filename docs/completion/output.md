# 출력 {#output}

## 형식 {#format}
모든 모델에서 모든 litellm `completion` 호출이 반환하는 정확한 json 출력과 예상 타입은 다음과 같습니다.

```python 
{
  'choices': [
    {
      'finish_reason': str,     # String: 'stop'
      'index': int,             # Integer: 0
      'message': {              # Dictionary [str, str]
        'role': str,            # String: 'assistant'
        'content': str          # String: "default message"
      }
    }
  ],
  'created': str,               # String: None
  'model': str,                 # String: None
  'usage': {                    # Dictionary [str, int]
    'prompt_tokens': int,       # Integer
    'completion_tokens': int,   # Integer
    'total_tokens': int         # Integer
  }
}

```

OpenAI에서 허용하는 것처럼 응답을 dictionary 또는 class object로 접근할 수 있습니다.
```python
print(response.choices[0].message.content)
print(response['choices'][0]['message']['content'])
```

예시 응답은 다음과 같습니다.
```python
{
  'choices': [
     {
        'finish_reason': 'stop',
        'index': 0,
        'message': {
           'role': 'assistant',
            'content': " I'm doing well, thank you for asking. I am Claude, an AI assistant created by Anthropic."
        }
      }
    ],
 'created': 1691429984.3852863,
 'model': 'claude-instant-1',
 'usage': {'prompt_tokens': 18, 'completion_tokens': 23, 'total_tokens': 41}
}
```

## 원본 종료 사유 {#native-finish-reason}

LiteLLM은 모든 provider별 `finish_reason` 값을 OpenAI 호환 값(`stop`, `length`, `tool_calls`, `function_call`, `content_filter`)으로 매핑합니다. 원래 provider 값이 매핑된 값과 다르면 `provider_specific_fields["native_finish_reason"]`에 보존됩니다.

이는 서로 다른 중지 조건을 구분해야 하는 agent loop에 유용합니다. 예를 들어 Gemini의 `MALFORMED_FUNCTION_CALL`과 일반 `stop`을 구분할 수 있습니다.

```python
response = completion(model="gemini/gemini-2.0-flash", messages=messages)

choice = response.choices[0]
print(choice.finish_reason)  # "stop" (OpenAI-compatible)

# Access the original provider value when it differs:
if hasattr(choice, "provider_specific_fields") and choice.provider_specific_fields:
    native = choice.provider_specific_fields.get("native_finish_reason")
    if native == "MALFORMED_FUNCTION_CALL":
        # Handle malformed function call differently from a normal stop
        pass
```

provider가 이미 OpenAI 호환 값(예: `stop`)을 반환하면 `native_finish_reason`은 설정되지 않습니다.

## 추가 속성 {#additional-attributes}

latency 같은 정보에도 접근할 수 있습니다.

```python
from litellm import completion
import os
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages=[{"role": "user", "content": "Hey!"}]

response = completion(model="claude-2", messages=messages)

print(response.response_ms) # 616.25# 616.25
```
