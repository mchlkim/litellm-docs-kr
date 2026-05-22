import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic 모델 도구 호출을 위한 메시지 정리

**`modify_params=True`로 도구 호출을 사용할 때 자주 발생하는 메시지 형식 문제를 자동으로 수정합니다**

LiteLLM은 도구 호출 워크플로에서 발생하는 일반적인 문제를 처리하도록 메시지를 자동 정리할 수 있습니다. 특히 Anthropic Claude처럼 엄격한 메시지 형식을 요구하는 프로바이더를 OpenAI 호환 클라이언트로 사용할 때 유용합니다.

## 개요

`litellm.modify_params = True`를 활성화하면 LiteLLM은 다음 세 가지 일반적인 문제를 자동으로 정리합니다.

1. **고립된 도구 호출** - `tool_calls`는 있지만 도구 결과가 없는 assistant 메시지
2. **고립된 도구 결과** - 존재하지 않는 `tool_call_id`를 참조하는 tool 메시지
3. **빈 메시지 내용** - 비어 있거나 공백만 포함한 텍스트 메시지

이를 통해 수동 메시지 검증 없이도 여러 LLM 프로바이더에서 도구 호출 워크플로가 안정적으로 동작합니다.

## 메시지 정리가 필요한 이유

LLM 프로바이더마다 메시지 형식 요구사항이 다르며, 도구 호출 중에는 차이가 더 크게 드러납니다.

- **Anthropic Claude**는 모든 `tool_call`에 대응하는 도구 결과가 있어야 합니다.
- 일부 프로바이더는 빈 내용을 가진 메시지를 거부합니다.
- OpenAI 호환 클라이언트가 항상 완전한 메시지 일관성을 유지하지는 않습니다.

정리 과정이 없으면 이런 문제가 API 오류를 만들고 워크플로를 중단시킵니다. `modify_params=True`를 사용하면 LiteLLM이 이러한 예외 상황을 자동으로 처리합니다.

## 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable automatic message sanitization
litellm.modify_params = True

# This will work even if messages have formatting issues
response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=[
        {"role": "user", "content": "What's the weather in Boston?"},
        {
            "role": "assistant",
            "tool_calls": [
                {
                    "id": "call_123",
                    "type": "function",
                    "function": {"name": "get_weather", "arguments": '{"city": "Boston"}'}
                }
            ]
            # Missing tool result - LiteLLM will add a dummy result automatically
        },
        {"role": "user", "content": "Thanks!"}
    ],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a city",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"]
            }
        }
    }]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  modify_params: true  # Enable automatic message sanitization

model_list:
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
```

</TabItem>
</Tabs>

## 정리 대상 사례

### 사례 A: 고립된 도구 호출(누락된 도구 결과)

**문제:** assistant 메시지에 `tool_calls`가 있지만 뒤따르는 도구 결과 메시지가 없습니다.

**해결:** LiteLLM은 누락된 도구 결과마다 더미 도구 결과 메시지를 자동으로 추가합니다.

**예제:**

```python
import litellm
litellm.modify_params = True

# Messages with orphaned tool calls
messages = [
    {"role": "user", "content": "Search for Python tutorials"},
    {
        "role": "assistant",
        "tool_calls": [
            {
                "id": "call_abc123",
                "type": "function",
                "function": {"name": "web_search", "arguments": '{"query": "Python tutorials"}'}
            }
        ]
    },
    # Missing tool result here!
    {"role": "user", "content": "What about JavaScript?"}
]

# LiteLLM automatically adds:
# {
#     "role": "tool",
#     "tool_call_id": "call_abc123",
#     "content": "[System: Tool execution skipped/interrupted by user. No result provided for tool 'web_search'.]"
# }

response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages,
    tools=[...]
)
```

**발생하는 상황:**
- 사용자가 도구 실행을 중단한 경우
- 네트워크 문제로 클라이언트가 도구 결과를 잃어버린 경우
- 도구가 완료되기 전에 대화 흐름이 바뀐 경우
- 도구 사용이 선택 사항인 멀티턴 대화

### 사례 B: 고립된 도구 결과(잘못된 `tool_call_id`)

**문제:** tool 메시지가 이전 assistant 메시지에 존재하지 않는 `tool_call_id`를 참조합니다.

**해결:** LiteLLM은 이러한 고립된 도구 결과 메시지를 자동으로 제거합니다.

**예제:**

```python
import litellm
litellm.modify_params = True

# Messages with orphaned tool result
messages = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {
        "role": "tool",
        "tool_call_id": "call_nonexistent",  # This tool_call_id doesn't exist!
        "content": "Some result"
    }
]

# LiteLLM automatically removes the orphaned tool message

response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages
)
```

**발생하는 상황:**
- 메시지 기록을 수동으로 편집한 경우
- 도구 결과가 중복되거나 잘못 연결된 경우
- 대화 상태가 잘못 복원된 경우
- 서로 다른 대화의 메시지가 병합된 경우

### 사례 C: 빈 메시지 내용

**문제:** user 또는 assistant 메시지의 내용이 비어 있거나 공백만 포함합니다.

**해결:** LiteLLM은 빈 내용을 시스템 플레이스홀더 메시지로 대체합니다.

**예제:**

```python
import litellm
litellm.modify_params = True

# Messages with empty content
messages = [
    {"role": "user", "content": ""},  # Empty content
    {"role": "assistant", "content": "   "},  # Whitespace only
]

# LiteLLM automatically replaces with:
# {"role": "user", "content": "[System: Empty message content sanitised to satisfy protocol]"}
# {"role": "assistant", "content": "[System: Empty message content sanitised to satisfy protocol]"}

response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages
)
```

**발생하는 상황:**
- UI가 빈 메시지를 전송한 경우
- 전처리 중 내용이 제거된 경우
- 대화 기록에 플레이스홀더 메시지가 있는 경우
- 메시지 구성 과정의 예외 상황

## 설정

### 전역 활성화

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm

# Enable for all completion calls
litellm.modify_params = True
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```yaml
litellm_settings:
  modify_params: true
```

</TabItem>
<TabItem value="env" label="환경 변수">

```bash
export LITELLM_MODIFY_PARAMS=True
```

</TabItem>
</Tabs>

### 요청별 활성화

```python
import litellm

# Enable only for specific requests
response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages,
    modify_params=True  # Override global setting
)
```

## 지원 프로바이더

메시지 정리는 현재 다음 프로바이더에서 동작합니다.

- ✅ Anthropic (Claude)

**참고:** 정리 로직 자체는 프로바이더에 종속되지 않지만, 현재는 Anthropic 메시지 변환 파이프라인에만 적용됩니다. 향후 릴리스에서 추가 프로바이더 지원이 더해질 수 있습니다.

## 구현 세부 정보

### 동작 방식

메시지 정리 과정은 메시지가 프로바이더별 형식으로 변환되기 **전에** 실행됩니다.

1. **입력:** 잠재적 문제가 있는 OpenAI 형식 메시지
2. **정리:** 세 가지 헬퍼 함수가 메시지를 처리합니다.
   - `_sanitize_empty_text_content()` - 빈 내용을 수정합니다.
   - `_add_missing_tool_results()` - 더미 도구 결과를 추가합니다.
   - `_is_orphaned_tool_result()` - 고립된 결과를 식별합니다.
3. **출력:** 정리된 프로바이더 호환 메시지

### 코드 참조

정리 로직은 다음 위치에 구현되어 있습니다.
- `litellm/litellm_core_utils/prompt_templates/factory.py`
- 함수: `sanitize_messages_for_tool_calling()`

### Logging

정리가 발생하면 LiteLLM은 디버그 메시지를 기록합니다.

```python
import litellm
litellm.set_verbose = True  # Enable debug logging

# You'll see logs like:
# "_add_missing_tool_results: Found 1 orphaned tool calls. Adding dummy tool results."
# "_is_orphaned_tool_result: Found orphaned tool result with tool_call_id=call_123"
# "_sanitize_empty_text_content: Replaced empty text content in user message"
```

## 권장 사항

### 1. 운영 워크플로에서 활성화

```python
# Recommended for production
litellm.modify_params = True

# Ensures robust handling of edge cases
response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages,
    tools=tools
)
```

### 2. 가능하면 실제 도구 결과 보존

정리가 누락된 도구 결과를 처리하더라도, 실제 결과를 제공하는 편이 더 좋습니다.

```python
# Good: Provide actual tool results
messages = [
    {"role": "user", "content": "Search for Python"},
    {"role": "assistant", "tool_calls": [...]},
    {"role": "tool", "tool_call_id": "call_123", "content": "Actual search results"}
]

# Fallback: Sanitization adds dummy result if missing
messages = [
    {"role": "user", "content": "Search for Python"},
    {"role": "assistant", "tool_calls": [...]},
    # Missing tool result - sanitization adds dummy
]
```

### 3. 정리 이벤트 모니터링

로깅을 사용해 정리가 언제 발생하는지 추적합니다.

```python
import litellm
import logging

# Enable debug logging
litellm.set_verbose = True
logging.basicConfig(level=logging.DEBUG)

# Track sanitization events in your application
response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=messages
)
```

### 4. 예외 상황 테스트

애플리케이션이 정리된 메시지를 올바르게 처리하는지 확인합니다.

```python
import litellm
litellm.modify_params = True

# Test orphaned tool calls
test_messages = [
    {"role": "user", "content": "Test"},
    {"role": "assistant", "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "test", "arguments": "{}"}}]},
    {"role": "user", "content": "Continue"}  # No tool result
]

response = litellm.completion(
    model="anthropic/claude-3-5-sonnet-20241022",
    messages=test_messages,
    tools=[...]
)

# Verify the response handles the dummy tool result appropriately
```

## 관련 기능

- **[Drop Params](./drop_params.md)** - 특정 프로바이더에서 지원하지 않는 파라미터 제거
- **[Message Trimming](./message_trimming.md)** - 토큰 제한에 맞게 메시지 축소
- **[Function Calling](./function_call.md)** - 도구/함수 호출 전체 가이드
- **[Reasoning Content](../reasoning_content.md)** - 도구 호출과 확장 추론

## 문제 해결

### 정리가 동작하지 않음

**문제:** `modify_params=True`를 설정했는데도 메시지가 오류를 일으킵니다.

**해결:**
1. `modify_params`가 활성화되었는지 확인합니다.
   ```python
   import litellm
   print(litellm.modify_params)  # Should be True
   ```

2. 문제가 프로바이더별 동작인지 확인합니다.
   ```python
   litellm.set_verbose = True  # Enable debug logging
   ```

3. 최신 LiteLLM 버전을 사용 중인지 확인합니다.
   ```bash
   uv add --upgrade-package litellm litellm
   ```

### 예상치 못한 더미 도구 결과

**문제:** 실제 결과를 기대했는데 더미 도구 결과가 나타납니다.

**원인:** 도구 결과 메시지가 누락되었거나 잘못된 `tool_call_id`를 가지고 있습니다.

**해결:**
1. 도구 결과 메시지에 올바른 `tool_call_id`가 있는지 확인합니다.
   ```python
   # Correct
   {"role": "tool", "tool_call_id": "call_123", "content": "result"}
   
   # Incorrect - will be treated as orphaned
   {"role": "tool", "tool_call_id": "wrong_id", "content": "result"}
   ```

2. 도구 결과가 `tool_calls`가 있는 assistant 메시지 바로 뒤에 오는지 확인합니다.

### 성능 영향

**문제:** 성능 오버헤드가 걱정됩니다.

**세부 정보:** 메시지 정리의 성능 영향은 작습니다.
- 메시지 수를 n이라고 할 때 O(n) 시간에 실행됩니다.
- `modify_params=True`일 때만 메시지를 처리합니다.
- 일반적으로 요청 처리 시간에 1ms 미만을 추가합니다.

## FAQ

**Q: 정리가 원본 메시지를 수정하나요?**

A: 아니요. 정리는 새 메시지 목록을 만듭니다. 원본 메시지는 변경되지 않습니다.

**Q: 특정 정리 사례만 비활성화할 수 있나요?**

A: 현재는 `modify_params=True`일 때 세 가지 사례가 함께 처리됩니다. 정리를 완전히 비활성화하려면 `modify_params=False`를 설정하세요.

**Q: 더미 도구 결과는 어떻게 처리되나요?**

A: 더미 도구 결과는 다른 메시지와 함께 LLM 프로바이더로 전송됩니다. 모델은 이를 설명적인 오류 메시지를 담은 일반 도구 결과로 봅니다.

**Q: 스트리밍에서도 동작하나요?**

A: 예. 메시지 정리는 스트리밍 요청과 비스트리밍 요청 모두에서 동작합니다.

**Q: `drop_params`와 관련이 있나요?**

A: 아니요. 서로 다른 기능입니다.
- `modify_params` - 메시지 내용과 구조를 수정/보정합니다.
- `drop_params` - 지원되지 않는 API 파라미터를 제거합니다.

두 기능은 동시에 활성화할 수 있습니다.

## 함께 보기

- [도구 호출과 Reasoning Content](../reasoning_content.md)
- [Function Calling 가이드](./function_call.md)
- [Bedrock 프로바이더 문서](../providers/bedrock.md)
- [Anthropic 프로바이더 문서](../providers/anthropic.md)
