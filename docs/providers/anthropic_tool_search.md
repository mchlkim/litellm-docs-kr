# Tool Search

Tool search를 사용하면 Claude가 대규모 도구 카탈로그(10,000개 이상의 도구)에서 필요한 도구를 동적으로 검색하고 온디맨드로 로드할 수 있습니다. 모든 도구 정의를 미리 context window에 넣는 대신, Claude가 도구 카탈로그를 검색해 필요한 도구만 로드합니다.

## 지원 프로바이더

| 제공자 | Chat Completions API | Messages API |
|----------|---------------------|--------------|
| **Anthropic API** | ✅ | ✅ |
| **`Azure Anthropic` (`Microsoft Foundry`)** | ✅ | ✅ |
| **`Google Cloud Vertex AI`** | ✅ | ✅ |
| **Amazon Bedrock** | ✅ (Invoke API만, Opus 4.5만) | ✅ (Invoke API만, Opus 4.5만) |


## 장점

- **Context 효율성**: 도구 정의로 context window의 큰 비중을 소모하지 않습니다.
- **더 나은 도구 선택**: 도구가 30-50개를 넘으면 Claude의 도구 선택 정확도가 낮아질 수 있습니다. Tool search는 수천 개의 도구가 있어도 정확도를 유지합니다.
- **온디맨드 로딩**: Claude가 필요로 할 때만 도구를 로드합니다.

## Tool Search 변형

LiteLLM은 두 가지 tool search 변형을 모두 지원합니다.

### 1. `Regex Tool Search`(`tool_search_tool_regex_20251119`) {#regex-tool-search}

Claude가 도구 검색용 regex pattern을 구성합니다. 정확한 패턴 매칭에 적합하며 더 빠릅니다.

### 2. `BM25 Tool Search`(`tool_search_tool_bm25_20251119`) {#bm25-tool-search}

Claude가 BM25 알고리즘을 사용해 자연어 쿼리로 도구를 검색합니다. 자연어 의미 검색에 적합합니다.

**참고**: BM25 변형은 Bedrock에서 지원되지 않습니다.

---

## `Chat Completions API` {#chat-completions-api}

### SDK 사용법

#### Regex Tool Search 기본 예제

```python showLineNumbers title="Basic Tool Search Example"
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[
        {"role": "user", "content": "What is the weather in San Francisco?"}
    ],
    tools=[
        # Tool search tool (regex variant)
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        # Deferred tool - will be loaded on-demand
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather at a specific location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"]
                        }
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True  # Mark for deferred loading
        }
    ]
)

print(response.choices[0].message.content)
```

#### BM25 Tool Search 예제

```python showLineNumbers title="BM25 Tool Search"
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[
        {"role": "user", "content": "Search for Python files containing 'authentication'"}
    ],
    tools=[
        # Tool search tool (BM25 variant)
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        # Deferred tools...
        {
            "type": "function",
            "function": {
                "name": "search_codebase",
                "description": "Search through codebase files by content and filename",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "file_pattern": {"type": "string"}
                    },
                    "required": ["query"]
                }
            },
            "defer_loading": True
        }
    ]
)
```

#### Azure Anthropic 예제

```python showLineNumbers title="Azure Anthropic Tool Search"
import litellm

response = litellm.completion(
    model="azure_anthropic/claude-sonnet-4-5",
    api_base="https://<your-resource>.services.ai.azure.com/anthropic",
    api_key="your-azure-api-key",
    messages=[
        {"role": "user", "content": "What's the weather like?"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current weather",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True
        }
    ]
)
```

#### Vertex AI 예제

```python showLineNumbers title="Vertex AI Tool Search"
import litellm

response = litellm.completion(
    model="vertex_ai/claude-sonnet-4-5",
    vertex_project="your-project-id",
    vertex_location="us-central1",
    messages=[
        {"role": "user", "content": "Search my documents"}
    ],
    tools=[
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        # Your deferred tools...
    ]
)
```

#### 스트리밍 지원

```python showLineNumbers title="Streaming with Tool Search"
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[
        {"role": "user", "content": "Get the weather"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True
        }
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### AI Gateway 사용법

Tool search는 LiteLLM proxy를 통해 자동으로 작동합니다.

#### Proxy 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 클라이언트 요청

```python showLineNumbers title="Client Request via Proxy"
from anthropic import Anthropic

client = Anthropic(
    api_key="your-litellm-proxy-key",
    base_url="http://0.0.0.0:4000"
)

response = client.messages.create(
    model="claude-sonnet",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What's the weather?"}
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ]
)
```

---

## Messages API

Messages API는 `litellm.anthropic.messages` 인터페이스를 통해 Anthropic 스타일 tool search를 네이티브로 지원합니다.

### SDK 사용법

#### 기본 예제

```python showLineNumbers title="Messages API - Basic Tool Search"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="anthropic/claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "What's the weather in San Francisco?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

print(response)
```

#### Azure Anthropic Messages 예제

```python showLineNumbers title="Azure Anthropic Messages API"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="azure_anthropic/claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "What's the stock price of Apple?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_stock_price",
            "description": "Get the current stock price for a ticker symbol",
            "input_schema": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "The stock ticker symbol, e.g. AAPL"
                    }
                },
                "required": ["ticker"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)
```

#### Vertex AI Messages 예제

```python showLineNumbers title="Vertex AI Messages API"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="vertex_ai/claude-sonnet-4@20250514",
    messages=[
        {
            "role": "user",
            "content": "Search the web for information about AI"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_bm25_20251119",
            "name": "tool_search_tool_bm25"
        },
        {
            "name": "search_web",
            "description": "Search the web for information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    }
                },
                "required": ["query"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "tool-search-tool-2025-10-19"}
)
```

#### Bedrock Messages 예제

```python showLineNumbers title="Bedrock Messages API (Invoke)"
import litellm

response = await litellm.anthropic.messages.acreate(
    model="bedrock/invoke/anthropic.claude-opus-4-20250514-v1:0",
    messages=[
        {
            "role": "user",
            "content": "What's the weather?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    extra_headers={"anthropic-beta": "tool-search-tool-2025-10-19"}
)
```

#### 스트리밍 지원

```python showLineNumbers title="Messages API - Streaming"
import litellm
import json

response = await litellm.anthropic.messages.acreate(
    model="anthropic/claude-sonnet-4-20250514",
    messages=[
        {
            "role": "user",
            "content": "What's the weather in Tokyo?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    max_tokens=1024,
    stream=True,
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

async for chunk in response:
    if isinstance(chunk, bytes):
        chunk_str = chunk.decode("utf-8")
        for line in chunk_str.split("\n"):
            if line.startswith("data: "):
                try:
                    json_data = json.loads(line[6:])
                    print(json_data)
                except json.JSONDecodeError:
                    pass
```

### AI Gateway 사용법

Messages API 엔드포인트를 사용하도록 프록시를 설정합니다.

#### Proxy 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: claude-sonnet-messages
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
```

#### 클라이언트 요청

```python showLineNumbers title="Client Request via Proxy (Messages API)"
from anthropic import Anthropic

client = Anthropic(
    api_key="your-litellm-proxy-key",
    base_url="http://0.0.0.0:4000"
)

response = client.messages.create(
    model="claude-sonnet-messages",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "What's the weather?"
        }
    ],
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather information",
            "input_schema": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            },
            "defer_loading": True
        }
    ],
    extra_headers={"anthropic-beta": "advanced-tool-use-2025-11-20"}
)

print(response)
```

---

## 추가 리소스

- [Anthropic Tool Search 문서](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/tool-search)
- [LiteLLM 도구 호출 가이드](https://docs.litellm.ai/docs/completion/function_call)
