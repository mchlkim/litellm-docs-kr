# Anthropic 프로그래밍 방식 도구 호출 {#anthropic-programmatic-tool-calling}

프로그래밍 방식 도구 호출은 각 도구 호출마다 모델을 왕복하지 않고, Claude가 코드 실행 `container` 안에서 도구를 프로그래밍 방식으로 호출하는 코드를 작성하게 합니다. 데이터가 모델 `context window`에 들어가기 전에 Claude가 필터링하거나 처리할 수 있으므로, 여러 도구를 사용하는 `workflow`의 지연 시간과 토큰 사용량을 줄일 수 있습니다.

:::info
프로그래밍 방식 도구 호출은 현재 `public beta`입니다. LiteLLM은 `allowed_callers` 필드가 있는 도구를 자동으로 감지하고 제공자에 맞는 `beta header`를 추가합니다.

- **`Anthropic API & Microsoft Foundry`**: `advanced-tool-use-2025-11-20`
- **Amazon Bedrock**: `advanced-tool-use-2025-11-20`
- **Google Cloud Vertex AI**: 지원되지 않음

이 기능을 사용하려면 코드 실행 도구가 활성화되어 있어야 합니다.
:::

## 모델 호환성 {#model-compatibility}

프로그래밍 방식 도구 호출은 다음 모델에서 사용할 수 있습니다.

| 모델 | 도구 버전 |
|-------|--------------|
| `Claude Opus 4.5` (`claude-opus-4-5-20251101`) | `code_execution_20250825` |
| `Claude Sonnet 4.5` (`claude-sonnet-4-5-20250929`) | `code_execution_20250825` |

## 빠른 시작 {#quick-start}

다음은 Claude가 데이터베이스를 여러 번 프로그래밍 방식으로 쿼리하고 결과를 집계하는 간단한 예제입니다.

```python
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[
        {
            "role": "user",
            "content": "Query sales data for the West, East, and Central regions, then tell me which region had the highest revenue"
        }
    ],
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        {
            "type": "function",
            "function": {
                "name": "query_database",
                "description": "Execute a SQL query against the sales database. Returns a list of rows as JSON objects.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {
                            "type": "string",
                            "description": "SQL query to execute"
                        }
                    },
                    "required": ["sql"]
                }
            },
            "allowed_callers": ["code_execution_20250825"]
        }
    ]
)

print(response)
```

## 작동 방식 {#how-it-works}

도구를 코드 실행에서 호출할 수 있도록 구성하고 Claude가 해당 도구를 사용하기로 결정하면 다음 흐름으로 동작합니다.

1. Claude가 도구를 함수처럼 호출하는 Python 코드를 작성합니다. 여기에는 여러 도구 호출과 전/후처리 로직이 포함될 수 있습니다.
2. Claude가 코드 실행을 통해 `sandbox container`에서 이 코드를 실행합니다.
3. 도구 함수가 호출되면 코드 실행이 일시 중지되고, API는 `caller` 필드가 포함된 `tool_use` 블록을 반환합니다.
4. 사용자가 도구 결과를 제공하면 코드 실행이 계속됩니다. 중간 결과는 Claude의 `context window`에 로드되지 않습니다.
5. 모든 코드 실행이 완료되면 Claude가 최종 출력을 받고 작업을 계속합니다.

이 접근 방식은 특히 다음에 유용합니다.

- **대용량 데이터 처리**: 도구 결과가 Claude `context`에 들어가기 전에 필터링하거나 집계
- **다단계 `workflow`**: 도구 호출 사이마다 Claude를 `sampling`하지 않고, 도구를 순차적으로 또는 `loop`로 호출해 토큰과 지연 시간을 절감
- **조건부 로직**: 중간 도구 결과를 기준으로 결정 수행

## `allowed_callers` 필드 {#allowed-callers-field}

`allowed_callers` 필드는 어떤 `context`에서 도구를 호출할 수 있는지 지정합니다.

```python
{
    "type": "function",
    "function": {
        "name": "query_database",
        "description": "Execute a SQL query against the database",
        "parameters": {...}
    },
    "allowed_callers": ["code_execution_20250825"]
}
```

**가능한 값:**

- `["direct"]` - Claude만 이 도구를 직접 호출할 수 있습니다. 생략 시 기본값입니다.
- `["code_execution_20250825"]` - 코드 실행 내부에서만 호출할 수 있습니다.
- `["direct", "code_execution_20250825"]` - 직접 호출과 코드 실행 내부 호출을 모두 허용합니다.

:::tip
각 도구에 대해 두 값을 모두 활성화하기보다는 `["direct"]` 또는 `["code_execution_20250825"]` 중 하나를 선택하는 것을 권장합니다. 이렇게 하면 Claude가 도구를 가장 적절히 사용하는 방법을 더 명확히 판단할 수 있습니다.
:::

## 응답의 `caller` 필드 {#caller-field-in-responses}

모든 도구 사용 블록에는 호출 방식을 나타내는 `caller` 필드가 포함됩니다.

**직접 호출(기존 도구 사용):**

```python
{
    "type": "tool_use",
    "id": "toolu_abc123",
    "name": "query_database",
    "input": {"sql": "<sql>"},
    "caller": {"type": "direct"}
}
```

**프로그래밍 방식 호출:**

```python
{
    "type": "tool_use",
    "id": "toolu_xyz789",
    "name": "query_database",
    "input": {"sql": "<sql>"},
    "caller": {
        "type": "code_execution_20250825",
        "tool_id": "srvtoolu_abc123"
    }
}
```

`tool_id`는 프로그래밍 방식 호출을 수행한 코드 실행 도구를 참조합니다.

## 컨테이너 수명 주기 {#container-lifecycle}

프로그래밍 방식 도구 호출은 코드 실행 `container`를 사용합니다.

- **컨테이너 생성**: 기존 `container`를 재사용하지 않는 한 각 세션마다 새 `container`가 생성됩니다.
- **만료**: `container`는 약 4.5분 동안 활동이 없으면 만료됩니다. 이 값은 변경될 수 있습니다.
- **컨테이너 ID**: 기존 `container`를 재사용하려면 `container` 파라미터를 전달합니다.
- **재사용**: 요청 간 상태를 유지하려면 `container ID`를 전달합니다.

```python
# First request - creates a new container
response1 = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "Query the database"}],
    tools=[...]
)

# Get container ID from response (if available in response metadata)
container_id = response1.get("container", {}).get("id")

# Second request - reuse the same container
response2 = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[...],
    tools=[...],
    container=container_id  # Reuse container
)
```

:::warning
도구가 프로그래밍 방식으로 호출되고 `container`가 도구 결과를 기다리는 동안에는 `container`가 만료되기 전에 응답해야 합니다. `expires_at` 필드를 모니터링하세요. `container`가 만료되면 Claude가 도구 호출을 `timeout`으로 간주하고 재시도할 수 있습니다.
:::

## 예제 워크플로 {#example-workflow}

### 1단계: 초기 요청 {#step-1-initial-request}

```python
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": "Query customer purchase history from the last quarter and identify our top 5 customers by revenue"
    }],
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        {
            "type": "function",
            "function": {
                "name": "query_database",
                "description": "Execute a SQL query against the sales database. Returns a list of rows as JSON objects.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {"type": "string", "description": "SQL query to execute"}
                    },
                    "required": ["sql"]
                }
            },
            "allowed_callers": ["code_execution_20250825"]
        }
    ]
)
```

### 2단계: 도구 호출이 포함된 API 응답 {#step-2-api-response-with-tool-call}

Claude가 도구를 호출하는 코드를 작성합니다. 응답에는 다음이 포함됩니다.

```python
{
    "role": "assistant",
    "content": [
        {
            "type": "text",
            "text": "I'll query the purchase history and analyze the results."
        },
        {
            "type": "server_tool_use",
            "id": "srvtoolu_abc123",
            "name": "code_execution",
            "input": {
                "code": "results = await query_database('<sql>')\ntop_customers = sorted(results, key=lambda x: x['revenue'], reverse=True)[:5]"
            }
        },
        {
            "type": "tool_use",
            "id": "toolu_def456",
            "name": "query_database",
            "input": {"sql": "<sql>"},
            "caller": {
                "type": "code_execution_20250825",
                "tool_id": "srvtoolu_abc123"
            }
        }
    ],
    "stop_reason": "tool_use"
}
```

### 3단계: 도구 결과 제공 {#step-3-provide-tool-results}

```python
# Add assistant's response and tool result to conversation
messages = [
    {"role": "user", "content": "Query customer purchase history..."},
    {
        "role": "assistant",
        "content": response.choices[0].message.content,
        "tool_calls": response.choices[0].message.tool_calls
    },
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": "toolu_def456",
                "content": '[{"customer_id": "C1", "revenue": 45000}, ...]'
            }
        ]
    }
]

# Continue the conversation
response2 = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=messages,
    tools=[...]
)
```

### 4단계: 최종 응답 {#step-4-final-response}

코드 실행이 완료되면 Claude가 최종 응답을 제공합니다.

```python
{
    "content": [
        {
            "type": "code_execution_tool_result",
            "tool_use_id": "srvtoolu_abc123",
            "content": {
                "type": "code_execution_result",
                "stdout": "Top 5 customers by revenue:\n1. Customer C1: $45,000\n...",
                "stderr": "",
                "return_code": 0
            }
        },
        {
            "type": "text",
            "text": "I've analyzed the purchase history from last quarter. Your top 5 customers generated $167,500 in total revenue..."
        }
    ],
    "stop_reason": "end_turn"
}
```

## 고급 패턴 {#advanced-patterns}

### 루프를 사용한 배치 처리 {#batch-processing-with-loops}

Claude는 여러 항목을 효율적으로 처리하는 코드를 작성할 수 있습니다.

```python
# Claude writes code like this:
regions = ["West", "East", "Central", "North", "South"]
results = {}
for region in regions:
    data = await query_database(f"SELECT SUM(revenue) FROM sales WHERE region='{region}'")
    results[region] = data[0]["total"]

top_region = max(results.items(), key=lambda x: x[1])
print(f"Top region: {top_region[0]} with ${top_region[1]:,}")
```

이 패턴은 다음 효과가 있습니다.
- 모델 왕복 횟수를 N회(지역별 1회)에서 1회로 줄입니다.
- 큰 결과 집합을 Claude에 반환하기 전에 프로그래밍 방식으로 처리합니다.
- 집계된 결론만 반환하여 토큰을 절약합니다.

### 조기 종료 {#early-stopping}

Claude는 성공 기준이 충족되는 즉시 처리를 중단할 수 있습니다.

```python
endpoints = ["us-east", "eu-west", "apac"]
for endpoint in endpoints:
    status = await check_health(endpoint)
    if status == "healthy":
        print(f"Found healthy endpoint: {endpoint}")
        break  # Stop early
```

### 데이터 필터링 {#data-filtering}

```python
logs = await fetch_logs(server_id)
errors = [log for log in logs if "ERROR" in log]
print(f"Found {len(errors)} errors")
for error in errors[-10:]:  # Only return last 10 errors
    print(error)
```

## 권장 사항 {#best-practices}

### 도구 설계 {#tool-design}

- **자세한 출력 설명 제공**: Claude가 코드에서 도구 결과를 `deserialize`하므로 형식(JSON 구조, 필드 타입 등)을 명확히 문서화합니다.
- **구조화된 데이터 반환**: JSON 또는 쉽게 `parse`할 수 있는 형식이 프로그래밍 방식 처리에 가장 적합합니다.
- **응답을 간결하게 유지**: 처리 `overhead`를 줄이기 위해 필요한 데이터만 반환합니다.

### 프로그래밍 방식 호출을 사용할 때 {#when-to-use-programmatic-calling}

**적합한 사용 사례:**

- 집계 또는 요약만 필요한 대규모 데이터셋 처리
- 의존성이 있는 도구 호출이 3개 이상인 다단계 `workflow`
- 도구 결과의 필터링, 정렬, 변환이 필요한 작업
- 중간 데이터가 Claude의 `reasoning`에 영향을 주면 안 되는 작업
- 많은 항목에 대한 병렬 작업(예: 50개 `endpoint` 확인)

**덜 적합한 사용 사례:**

- 단순한 응답을 반환하는 단일 도구 호출
- 즉각적인 사용자 `feedback`이 필요한 도구
- 코드 실행 `overhead`가 이점보다 큰 매우 빠른 작업

## 토큰 효율 {#token-efficiency}

프로그래밍 방식 도구 호출은 토큰 사용량을 크게 줄일 수 있습니다.

- **프로그래밍 방식 호출의 도구 결과는 Claude `context`에 추가되지 않습니다** - 최종 코드 출력만 추가됩니다.
- **중간 처리는 코드에서 수행됩니다** - 필터링, 집계 등은 모델 토큰을 소비하지 않습니다.
- **하나의 코드 실행 안에서 여러 도구 호출 수행** - 별도 모델 `turn`과 비교해 `overhead`를 줄입니다.

예를 들어 도구 10개를 직접 호출하면, 프로그래밍 방식으로 호출하고 요약만 반환하는 방식보다 약 10배의 토큰을 사용합니다.

## 제공자 지원 {#provider-support}

LiteLLM은 다음 Anthropic 호환 제공자에서 프로그래밍 방식 도구 호출을 지원합니다.

- **`Standard Anthropic API`** (`anthropic/claude-sonnet-4-5-20250929`) ✅
- **`Azure Anthropic / Microsoft Foundry`** (`azure/claude-sonnet-4-5-20250929`) ✅
- **Amazon Bedrock** (`bedrock/invoke/anthropic.claude-sonnet-4-5-20250929-v1:0`) ✅
- **Google Cloud Vertex AI** (`vertex_ai/claude-sonnet-4-5-20250929`) ❌ 지원되지 않음

LiteLLM이 `allowed_callers` 필드가 있는 도구를 감지하면 `beta header`(`advanced-tool-use-2025-11-20`)가 자동으로 추가됩니다.

## 제한 사항 {#limitations}

### 기능 비호환성 {#feature-incompatibilities}

- **Structured outputs**: `strict: true`가 있는 도구는 프로그래밍 방식 호출에서 지원되지 않습니다.
- **Tool choice**: `tool_choice`로 특정 도구의 프로그래밍 방식 호출을 강제할 수 없습니다.
- **Parallel tool use**: `disable_parallel_tool_use: true`는 프로그래밍 방식 호출에서 지원되지 않습니다.

### 도구 제한 {#tool-limitations}

현재 다음 도구는 프로그래밍 방식으로 호출할 수 없습니다.

- Web search
- Web fetch
- MCP `connector`가 제공하는 도구

## 문제 해결 {#troubleshooting}

### 자주 발생하는 문제 {#common-issues}

**"Tool not allowed" error**

- 도구 정의에 `"allowed_callers": ["code_execution_20250825"]`가 포함되어 있는지 확인합니다.
- 호환 모델(Claude Sonnet 4.5 또는 Opus 4.5)을 사용하는지 확인합니다.

**컨테이너 만료**

- `container` 수명(약 4.5분) 안에 도구 호출에 응답해야 합니다.
- 더 빠른 도구 실행 구현을 고려하세요.

**Beta header가 추가되지 않음**

- LiteLLM은 `allowed_callers`를 감지하면 `beta header`를 자동으로 추가합니다.
- `header`를 수동으로 설정하는 경우 `advanced-tool-use-2025-11-20`이 포함되어 있는지 확인하세요.

## 관련 기능 {#related-features}

- [Anthropic Tool Search](./anthropic_tool_search.md) - 필요할 때 도구를 동적으로 검색하고 로드
- [Anthropic Provider](./anthropic.md) - 일반 Anthropic 제공자 문서
