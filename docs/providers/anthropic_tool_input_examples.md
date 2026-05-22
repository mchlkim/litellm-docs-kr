# Anthropic tool input 예제

Claude가 tool을 더 효과적으로 사용하는 방법을 이해할 수 있도록 유효한 tool input의 구체적인 예제를 제공합니다. 중첩 객체, 선택 parameter, 형식에 민감한 입력이 있는 복잡한 tool에 특히 유용합니다.

:::info
Tool input 예제는 beta 기능입니다. LiteLLM은 `input_examples` 필드가 있는 tool을 자동으로 감지하고 provider에 맞는 beta header를 추가합니다.

- **`Anthropic API` 및 `Microsoft Foundry`**: `advanced-tool-use-2025-11-20`
- **Amazon Bedrock**: `advanced-tool-use-2025-11-20` (Claude Opus 4.5만 해당)
- **Google Cloud Vertex AI**: 지원되지 않음

beta header를 수동으로 지정할 필요는 없습니다. LiteLLM이 자동으로 처리합니다.
:::

## Input 예제를 사용할 때

Input 예제는 다음 경우에 가장 유용합니다.

- **복잡한 중첩 객체**: 깊게 중첩된 parameter 구조를 가진 tool
- **선택 parameter**: optional parameter를 언제 포함해야 하는지 보여주는 경우
- **형식에 민감한 입력**: 날짜, 주소 등 예상 형식을 보여주는 경우
- **Enum values**: context 안에서 유효한 enum 선택지를 보여주는 경우
- **Edge cases**: 특수 사례를 처리하는 방법을 보여주는 경우

:::tip
**description을 먼저 우선하세요.** 명확하고 자세한 tool description이 예제보다 더 중요합니다. description만으로 충분하지 않은 복잡한 tool에서 `input_examples`를 보조 수단으로 사용하세요.
:::

## 빠른 시작

tool 정의에 예제 input object 배열을 담은 `input_examples` 필드를 추가합니다.

```python
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[
        {"role": "user", "content": "What's the weather like in San Francisco?"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "The unit of temperature"
                        }
                    },
                    "required": ["location"]
                }
            },
            "input_examples": [
                {
                    "location": "San Francisco, CA",
                    "unit": "fahrenheit"
                },
                {
                    "location": "Tokyo, Japan",
                    "unit": "celsius"
                },
                {
                    "location": "New York, NY"  # 'unit' is optional
                }
            ]
        }
    ]
)

print(response)
```

## 작동 방식

`input_examples`를 제공하면 다음과 같이 동작합니다.

1. **LiteLLM 감지**: tool 정의의 `input_examples` 필드를 감지합니다.
2. **Beta header 자동 추가**: `advanced-tool-use-2025-11-20` header가 주입됩니다.
3. **예제를 prompt에 포함**: Anthropic이 tool schema와 함께 예제를 포함합니다.
4. **Claude가 pattern 학습**: model이 예제를 사용해 올바른 tool 사용법을 이해합니다.
5. **더 나은 tool call**: Claude가 올바른 parameter 형식으로 더 정확한 tool call을 생성합니다.

## 예제 형식

### 예제가 포함된 단순 tool

```python
{
    "type": "function",
    "function": {
        "name": "send_email",
        "description": "Send an email to a recipient",
        "parameters": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Email address"},
                "subject": {"type": "string"},
                "body": {"type": "string"}
            },
            "required": ["to", "subject", "body"]
        }
    },
    "input_examples": [
        {
            "to": "user@example.com",
            "subject": "Meeting Reminder",
            "body": "Don't forget our meeting tomorrow at 2 PM."
        },
        {
            "to": "team@company.com",
            "subject": "Weekly Update",
            "body": "Here's this week's progress report..."
        }
    ]
}
```

### 복잡한 중첩 객체

```python
{
    "type": "function",
    "function": {
        "name": "create_calendar_event",
        "description": "Create a new calendar event",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "start": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string"},
                        "time": {"type": "string"}
                    }
                },
                "attendees": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "email": {"type": "string"},
                            "optional": {"type": "boolean"}
                        }
                    }
                }
            },
            "required": ["title", "start"]
        }
    },
    "input_examples": [
        {
            "title": "Team Standup",
            "start": {
                "date": "2025-01-15",
                "time": "09:00"
            },
            "attendees": [
                {"email": "alice@example.com", "optional": False},
                {"email": "bob@example.com", "optional": True}
            ]
        },
        {
            "title": "Lunch Break",
            "start": {
                "date": "2025-01-15",
                "time": "12:00"
            }
            # No attendees - showing optional field
        }
    ]
}
```

### 형식에 민감한 parameter

```python
{
    "type": "function",
    "function": {
        "name": "search_flights",
        "description": "Search for available flights",
        "parameters": {
            "type": "object",
            "properties": {
                "origin": {"type": "string", "description": "Airport code"},
                "destination": {"type": "string", "description": "Airport code"},
                "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                "passengers": {"type": "integer"}
            },
            "required": ["origin", "destination", "date"]
        }
    },
    "input_examples": [
        {
            "origin": "SFO",
            "destination": "JFK",
            "date": "2025-03-15",
            "passengers": 2
        },
        {
            "origin": "LAX",
            "destination": "ORD",
            "date": "2025-04-20",
            "passengers": 1
        }
    ]
}
```

## 요구 사항과 제한 사항

### Schema validation

- 각 예제는 tool의 `input_schema` 기준으로 **유효해야 합니다**.
- 유효하지 않은 예제는 Anthropic에서 **400 error**를 반환합니다.
- validation은 server-side에서 수행됩니다. LiteLLM은 예제를 그대로 전달합니다.

### Server-side tool은 지원되지 않음

Input examples는 **사용자 정의 tool에서만 지원됩니다**. 다음 server-side tool은 `input_examples`를 지원하지 않습니다.

- `web_search` (web search tool)
- `code_execution`(코드 실행 tool)
- `computer_use` (computer use tool)
- `bash_tool`(bash 실행 tool)
- `text_editor` (text editor tool)

### Token 비용

예제는 prompt token에 추가됩니다.

- **단순 예제**: 예제당 약 20-50 token
- **복잡한 중첩 객체**: 예제당 약 100-200 token
- **Trade-off**: 더 높은 token 비용으로 더 정확한 tool call을 얻습니다.

### 모델 호환성

Input 예제는 `advanced-tool-use-2025-11-20` beta header를 지원하는 모든 Claude 모델에서 동작합니다.

- Claude Opus 4.5 (`claude-opus-4-5-20251101`)
- `Claude Sonnet 4.5`(`claude-sonnet-4-5-20250929`)
- Claude Opus 4.1 (`claude-opus-4-1-20250805`)

:::note
Google Cloud Vertex AI와 Amazon Bedrock에서는 Claude Opus 4.5만 tool input 예제를 지원합니다.
:::

## 권장 사항

### 1. 다양한 예제 보여주기

서로 다른 사용 사례를 보여주는 예제를 포함하세요.

```python
"input_examples": [
    {"location": "San Francisco, CA", "unit": "fahrenheit"},  # US city
    {"location": "Tokyo, Japan", "unit": "celsius"},          # International
    {"location": "New York, NY"}                              # Optional param omitted
]
```

### 2. 선택 parameter 보여주기

optional parameter를 포함해야 하는 경우와 포함하지 않아야 하는 경우를 보여주세요.

```python
"input_examples": [
    {
        "query": "machine learning",
        "filters": {"year": 2024, "category": "research"}  # With optional filters
    },
    {
        "query": "artificial intelligence"  # Without optional filters
    }
]
```

### 3. 형식 요구 사항 보여주기

예제를 통해 예상 형식을 명확히 보여주세요.

```python
"input_examples": [
    {
        "phone": "+1-555-123-4567",  # Shows expected phone format
        "date": "2025-01-15",         # Shows date format (YYYY-MM-DD)
        "time": "14:30"               # Shows time format (HH:MM)
    }
]
```

### 4. 예제를 현실적으로 유지

placeholder data 대신 실제 운영 환경에 가까운 현실적인 예제를 사용하세요.

```python
# ✅ Good - realistic examples
"input_examples": [
    {"email": "alice@company.com", "role": "admin"},
    {"email": "bob@company.com", "role": "user"}
]

# ❌ Bad - placeholder examples
"input_examples": [
    {"email": "test@test.com", "role": "role1"},
    {"email": "example@example.com", "role": "role2"}
]
```

### 5. 예제 수 제한

tool당 2-5개의 예제를 제공하세요.

- **너무 적음**(1개): 충분한 variation을 보여주지 못할 수 있습니다.
- **적절함**(2-5개): token을 과도하게 늘리지 않으면서 pattern을 보여줍니다.
- **너무 많음**(10개 이상): token을 낭비하고 효율이 떨어집니다.

## 다른 기능과의 통합

Input examples는 다른 Anthropic tool 기능과 함께 자연스럽게 동작합니다.

### With Tool Search

```python
{
    "type": "function",
    "function": {
        "name": "query_database",
        "description": "Execute a SQL query",
        "parameters": {...}
    },
    "defer_loading": True,  # Tool search
    "input_examples": [     # Input examples
        {"sql": "SELECT * FROM users WHERE id = 1"}
    ]
}
```

### With Programmatic 도구 호출

```python
{
    "type": "function",
    "function": {
        "name": "fetch_data",
        "description": "Fetch data from API",
        "parameters": {...}
    },
    "allowed_callers": ["code_execution_20250825"],  # Programmatic calling
    "input_examples": [                               # Input examples
        {"endpoint": "/api/users", "method": "GET"}
    ]
}
```

### 모든 기능 조합

```python
{
    "type": "function",
    "function": {
        "name": "advanced_tool",
        "description": "A complex tool",
        "parameters": {...}
    },
    "defer_loading": True,                            # Tool search
    "allowed_callers": ["code_execution_20250825"],  # Programmatic calling
    "input_examples": [                               # Input examples
        {"param1": "value1", "param2": "value2"}
    ]
}
```

## Provider 지원

LiteLLM은 다음 Anthropic 호환 provider에서 input examples를 지원합니다.

- **`Standard Anthropic API`**(`anthropic/claude-sonnet-4-5-20250929`) ✅
- **`Azure Anthropic / Microsoft Foundry`**(`azure/claude-sonnet-4-5-20250929`) ✅
- **Amazon Bedrock** (`bedrock/invoke/anthropic.claude-opus-4-5-20251101-v1:0`) ✅ (Opus 4.5 only)
- **Google Cloud Vertex AI** (`vertex_ai/claude-sonnet-4-5-20250929`) ❌ 지원되지 않음

LiteLLM이 `input_examples` 필드가 있는 tool을 감지하면 beta header(`advanced-tool-use-2025-11-20`)가 자동으로 추가됩니다.

## 문제 해결

### 예제 사용 시 "Invalid request" error

**문제**: input examples 사용 시 400 error를 받음

**해결책**: 각 예제가 `input_schema` 기준으로 유효한지 확인합니다.

```python
# Check that:
# 1. All required fields are present in examples
# 2. Field types match the schema
# 3. Enum values are valid
# 4. Nested objects follow the schema structure
```

### 예제가 tool call을 개선하지 않음

**문제**: 예제를 추가해도 도움이 되지 않는 것처럼 보임

**해결책**:
1. **description 먼저 확인**: tool description이 자세하고 명확한지 확인합니다.
2. **예제 품질 검토**: 예제가 현실적이고 다양한지 확인합니다.
3. **schema 확인**: 예제가 실제 schema와 일치하는지 확인합니다.
4. **variation 추가**: 서로 다른 사용 사례를 보여주는 예제를 포함합니다.

### Token 사용량이 너무 높음

**문제**: Input examples가 너무 많은 token을 소비함

**해결책**:
1. **예제 수 줄이기**: 5개 이상 대신 2-3개 예제를 사용합니다.
2. **예제 단순화**: 예제에서 불필요한 필드를 제거합니다.
3. **description 검토**: description이 명확하다면 예제가 필요하지 않을 수 있습니다.

## Input 예제를 사용하지 않아야 할 때

다음 경우에는 input examples를 생략하세요.

- **Tool이 단순함**: 명확한 description이 있는 단일 parameter tool
- **Schema가 자명함**: 좋은 description과 함께 잘 구조화된 schema
- **Token budget이 빡빡함**: 예제는 각각 20-200 token을 추가합니다.
- **Server-side tools**: web_search, code_execution 등은 예제를 지원하지 않습니다.

## 관련 기능

- [Anthropic Tool Search](./anthropic_tool_search.md) - 필요할 때 tool을 동적으로 검색하고 로드
- [Anthropic Programmatic 도구 호출](./anthropic_programmatic_tool_calling.md) - 코드 실행에서 tool 호출
- [Anthropic Provider](./anthropic.md) - 일반 Anthropic provider 문서
