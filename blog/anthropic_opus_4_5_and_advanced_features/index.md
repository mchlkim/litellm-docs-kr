---
slug: anthropic_advanced_features
title: "출시 당일 지원: Claude Opus 4.5와 고급 기능"
date: 2025-11-25T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "LiteLLM에서 Claude Opus 4.5와 도구 검색, 프로그래밍 방식 도구 호출, effort parameter 같은 고급 기능을 사용하는 방법입니다."
tags: [anthropic, claude, 도구-검색, 프로그래밍-도구-호출, effort, 고급-기능]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 가이드는 Anthropic의 Claude Opus 4.5와 LiteLLM에서 사용할 수 있는 고급 기능을 다룹니다. 포함되는 기능은 도구 검색, 프로그래밍 방식 도구 호출, 도구 입력 예제, effort parameter입니다.

{/* truncate */}

---

| 기능 | 지원 모델 |
|---------|-----------------|
| 도구 검색 | Claude Opus 4.5, Sonnet 4.5 |
| 프로그래밍 방식 도구 호출 | Claude Opus 4.5, Sonnet 4.5 |
| 입력 예제 | Claude Opus 4.5, Sonnet 4.5 |
| effort parameter | Claude Opus 4.5 전용 |

지원 프로바이더: [Anthropic](/litellm-docs-kr/docs/providers/anthropic), [Bedrock](/litellm-docs-kr/docs/providers/bedrock), [Vertex AI](/litellm-docs-kr/docs/providers/vertex_partner#vertex-ai---anthropic-claude), [Azure AI](/litellm-docs-kr/docs/providers/azure_ai).

## 사용법

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">


```python
import os
from litellm import completion

# set env - [OPTIONAL] replace with your anthropic key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

messages = [{"role": "user", "content": "Hey! how's it going?"}]

## OPENAI /chat/completions API format
response = completion(model="claude-opus-4-5-20251101", messages=messages)
print(response)

```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-4 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: claude-opus-4-5-20251101 ### MODEL NAME sent to `litellm.completion()` ###
      api_key: "os.environ/ANTHROPIC_API_KEY" # does os.getenv("ANTHROPIC_API_KEY")
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

<Tabs>
<TabItem value="curl" label="OpenAI Chat Completions">
```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="anthropic" label="Anthropic /v1/messages API">
```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "max_tokens": 1024,
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>

## 사용법 - Bedrock

:::info

LiteLLM은 Bedrock 인증에 boto3 라이브러리를 사용합니다.

Bedrock 인증 방식은 [Bedrock 문서](/litellm-docs-kr/docs/providers/bedrock#authentication)를 참고하세요.

:::

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">


```python
import os
from litellm import completion

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

## OPENAI /chat/completions API format
response = completion(
  model="bedrock/us.anthropic.claude-opus-4-5-20251101-v1:0",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-4 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.completion() - https://docs.litellm.ai/docs/completion/input
      model: bedrock/us.anthropic.claude-opus-4-5-20251101-v1:0 ### MODEL NAME sent to `litellm.completion()` ###
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: os.environ/AWS_REGION_NAME
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

<Tabs>
<TabItem value="curl" label="OpenAI Chat Completions">
```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="anthropic" label="Anthropic /v1/messages API">
```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "max_tokens": 1024,
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="invoke" label="Bedrock /invoke API">
```bash
curl --location 'http://0.0.0.0:4000/bedrock/model/claude-4/invoke' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "max_tokens": 1024,
      "messages": [{"role": "user", "content": "Hello, how are you?"}]
    }'
```
</TabItem>
<TabItem value="converse" label="Bedrock /converse API">
```bash
curl --location 'http://0.0.0.0:4000/bedrock/model/claude-4/converse' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "messages": [{"role": "user", "content": "Hello, how are you?"}]
    }'
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>


## 사용법 - Vertex AI


<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
from litellm import completion
import json 

## GET CREDENTIALS 
## RUN ## 
# !gcloud auth application-default login - run this to add vertex credentials to your env
## OR ## 
file_path = 'path/to/vertex_ai_service_account.json'

# Load the JSON file
with open(file_path, 'r') as file:
    vertex_credentials = json.load(file)

# Convert to JSON string
vertex_credentials_json = json.dumps(vertex_credentials)

## COMPLETION CALL 
response = completion(
  model="vertex_ai/claude-opus-4-5@20251101",
  messages=[{ "content": "Hello, how are you?","role": "user"}],
  vertex_credentials=vertex_credentials_json,
  vertex_project="your-project-id",
  vertex_location="us-east5"
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. config.yaml 설정**

```yaml
model_list:
  - model_name: claude-4 ### RECEIVED MODEL NAME ###
    litellm_params:
        model: vertex_ai/claude-opus-4-5@20251101
        vertex_credentials: "/path/to/service_account.json"
        vertex_project: "your-project-id"
        vertex_location: "us-east5"
```

**2. 프록시 시작**

```bash
litellm --config /path/to/config.yaml
```

**3. 테스트**

<Tabs>
<TabItem value="curl" label="OpenAI Chat Completions">
```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
<TabItem value="anthropic" label="Anthropic /v1/messages API">
```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "max_tokens": 1024,
      "messages": [
        {
          "role": "user",
          "content": "what llm are you"
        }
      ]
    }
'
```
</TabItem>
</Tabs>
</TabItem>
</Tabs>

## 사용법 - Azure Anthropic(Azure Foundry Claude)

LiteLLM은 Azure Claude 배포를 `azure_ai/` provider로 라우팅합니다. 그래서 Azure Foundry의 Claude Opus 모델에서도 도구 검색, effort, 스트리밍과 나머지 고급 기능을 계속 사용할 수 있습니다. `AZURE_AI_API_BASE`는 `https://<resource>.services.ai.azure.com/anthropic`로 지정하세요. LiteLLM이 `/v1/messages`를 자동으로 붙이며, 인증에는 `AZURE_AI_API_KEY` 또는 Azure AD 토큰을 사용합니다.

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import os
from litellm import completion

# Configure Azure credentials
os.environ["AZURE_AI_API_KEY"] = "your-azure-ai-api-key"
os.environ["AZURE_AI_API_BASE"] = "https://my-resource.services.ai.azure.com/anthropic"

response = completion(
    model="azure_ai/claude-opus-4-1",
    messages=[{"role": "user", "content": "Explain how Azure Anthropic hosts Claude Opus differently from the public Anthropic API."}],
    max_tokens=1200,
    temperature=0.7,
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 환경 변수 설정**

```bash
export AZURE_AI_API_KEY="your-azure-ai-api-key"
export AZURE_AI_API_BASE="https://my-resource.services.ai.azure.com/anthropic"
```

**2. 프록시 설정**

```yaml
model_list:
  - model_name: claude-4-azure
    litellm_params:
      model: azure_ai/claude-opus-4-1
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
```

**3. LiteLLM 시작**

```bash
litellm --config /path/to/config.yaml
```

**4. Azure Claude 라우트 테스트**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer $LITELLM_KEY' \
  --data '{
    "model": "claude-4-azure",
    "messages": [
      {
        "role": "user",
        "content": "How do I use Claude Opus 4 via Azure Anthropic in LiteLLM?"
      }
    ],
    "max_tokens": 1024
  }'
```

</TabItem>
</Tabs>


## 도구 검색 {#tool-search}

이 기능은 모든 도구를 처음부터 컨텍스트 창에 넣는 대신, 필요한 도구를 요청 시 동적으로 로드해 Claude가 수천 개의 도구를 다룰 수 있게 합니다.

### 사용법 예제

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm
import os

# Configure your API key
os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# Define your tools with defer_loading
tools = [
    # Tool search tool (regex variant)
    {
        "type": "tool_search_tool_regex_20251119",
        "name": "tool_search_tool_regex"
    },
    # Deferred tools - loaded on-demand
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location. Returns temperature and conditions.",
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
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        },
        "defer_loading": True  # Load on-demand
    },
    {
        "type": "function",
        "function": {
            "name": "search_files",
            "description": "Search through files in the workspace using keywords",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["query"]
            }
        },
        "defer_loading": True
    },
    {
        "type": "function",
        "function": {
            "name": "query_database",
            "description": "Execute SQL queries against the database",
            "parameters": {
                "type": "object",
                "properties": {
                    "sql": {"type": "string"}
                },
                "required": ["sql"]
            }
        },
        "defer_loading": True
    }
]

# Make a request - Claude will search for and use relevant tools
response = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{
        "role": "user",
        "content": "What's the weather like in San Francisco?"
    }],
    tools=tools
)

print("Claude's response:", response.choices[0].message.content)
print("Tool calls:", response.choices[0].message.tool_calls)

# Check tool search usage
if hasattr(response.usage, 'server_tool_use'):
    print(f"Tool searches performed: {response.usage.server_tool_use.tool_search_requests}")
```
</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: claude-4
    litellm_params:
      model: anthropic/claude-opus-4-5-20251101
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트


```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [{
        "role": "user",
        "content": "What's the weather like in San Francisco?"
       }],
       "tools": [
        # Tool search tool (regex variant)
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        # Deferred tools - loaded on-demand
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location. Returns temperature and conditions.",
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
                            "description": "Temperature unit"
                        }
                    },
                    "required": ["location"]
                }
            },
            "defer_loading": True  # Load on-demand
        },
        {
            "type": "function",
            "function": {
                "name": "search_files",
                "description": "Search through files in the workspace using keywords",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "file_types": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["query"]
                }
            },
            "defer_loading": True
        },
        {
            "type": "function",
            "function": {
                "name": "query_database",
                "description": "Execute SQL queries against the database",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sql": {"type": "string"}
                    },
                    "required": ["sql"]
                }
            },
            "defer_loading": True
        }
    ]
}
'
```
</TabItem>
</Tabs>

### BM25 변형(자연어 검색)

regex pattern 대신 자연어 query를 사용하려면 다음을 사용하세요.

```python
tools = [
    {
        "type": "tool_search_tool_bm25_20251119",  # Natural language variant
        "name": "tool_search_tool_bm25"
    },
    # ... your deferred tools
]
```

---

## 프로그래밍 방식 도구 호출 {#programmatic-tool-calling}

프로그래밍 방식 도구 호출은 Claude가 도구를 프로그래밍 방식으로 호출하는 코드를 작성할 수 있게 합니다. [자세히 보기](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm
import json

# Define tools that can be called programmatically
tools = [
    # Code execution tool (required for programmatic calling)
    {
        "type": "code_execution_20250825",
        "name": "code_execution"
    },
    # Tool that can be called from code
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
        "allowed_callers": ["code_execution_20250825"]  # Enable programmatic calling
    }
]

# First request
response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": "Query sales data for West, East, and Central regions, then tell me which had the highest revenue"
    }],
    tools=tools
)

print("Claude's response:", response.choices[0].message)

# Handle tool calls
messages = [
    {"role": "user", "content": "Query sales data for West, East, and Central regions, then tell me which had the highest revenue"},
    {"role": "assistant", "content": response.choices[0].message.content, "tool_calls": response.choices[0].message.tool_calls}
]

# Process each tool call
for tool_call in response.choices[0].message.tool_calls:
    # Check if it's a programmatic call
    if hasattr(tool_call, 'caller') and tool_call.caller:
        print(f"Programmatic call to {tool_call.function.name}")
        print(f"Called from: {tool_call.caller}")
    
    # Simulate tool execution
    if tool_call.function.name == "query_database":
        args = json.loads(tool_call.function.arguments)
        # Simulate database query
        result = json.dumps([
            {"region": "West", "revenue": 150000},
            {"region": "East", "revenue": 180000},
            {"region": "Central", "revenue": 120000}
        ])
        
        messages.append({
            "role": "user",
            "content": [{
                "type": "tool_result",
                "tool_use_id": tool_call.id,
                "content": result
            }]
        })

# Get final response
final_response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=messages,
    tools=tools
)

print("\nFinal answer:", final_response.choices[0].message.content)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: claude-4
    litellm_params:
      model: anthropic/claude-opus-4-5-20251101
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트


```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [{
        "role": "user",
        "content": "Query sales data for West, East, and Central regions, then tell me which had the highest revenue"
      }],
      "tools": [
        # Code execution tool (required for programmatic calling)
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        # Tool that can be called from code
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
            "allowed_callers": ["code_execution_20250825"]  # Enable programmatic calling
        }
    ]
}
'
```
</TabItem>
</Tabs>

---

## 도구 입력 예제 {#tool-input-examples}

이제 Claude에 도구 사용 예제를 제공할 수 있습니다. [자세히 보기](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-input-examples)


<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm

tools = [
    {
        "type": "function",
        "function": {
            "name": "create_calendar_event",
            "description": "Create a new calendar event with attendees and reminders",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "start_time": {
                        "type": "string",
                        "description": "ISO 8601 format: YYYY-MM-DDTHH:MM:SS"
                    },
                    "duration_minutes": {"type": "integer"},
                    "attendees": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "email": {"type": "string"},
                                "optional": {"type": "boolean"}
                            }
                        }
                    },
                    "reminders": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "minutes_before": {"type": "integer"},
                                "method": {"type": "string", "enum": ["email", "popup"]}
                            }
                        }
                    }
                },
                "required": ["title", "start_time", "duration_minutes"]
            }
        },
        # Provide concrete examples
        "input_examples": [
            {
                "title": "Team Standup",
                "start_time": "2025-01-15T09:00:00",
                "duration_minutes": 30,
                "attendees": [
                    {"email": "alice@company.com", "optional": False},
                    {"email": "bob@company.com", "optional": False}
                ],
                "reminders": [
                    {"minutes_before": 15, "method": "popup"}
                ]
            },
            {
                "title": "Lunch Break",
                "start_time": "2025-01-15T12:00:00",
                "duration_minutes": 60
                # Demonstrates optional fields can be omitted
            }
        ]
    }
]

response = litellm.completion(
    model="anthropic/claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": "Schedule a team meeting for tomorrow at 2pm for 45 minutes with john@company.com and sarah@company.com"
    }],
    tools=tools
)

print("Tool call:", response.choices[0].message.tool_calls[0].function.arguments)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: claude-4
    litellm_params:
      model: anthropic/claude-opus-4-5-20251101
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트


```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [{
        "role": "user",
        "content": "Schedule a team meeting for tomorrow at 2pm for 45 minutes with john@company.com and sarah@company.com"
      }],
      "tools": [
    {
        "type": "function",
        "function": {
            "name": "create_calendar_event",
            "description": "Create a new calendar event with attendees and reminders",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "start_time": {
                        "type": "string",
                        "description": "ISO 8601 format: YYYY-MM-DDTHH:MM:SS"
                    },
                    "duration_minutes": {"type": "integer"},
                    "attendees": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "email": {"type": "string"},
                                "optional": {"type": "boolean"}
                            }
                        }
                    },
                    "reminders": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "minutes_before": {"type": "integer"},
                                "method": {"type": "string", "enum": ["email", "popup"]}
                            }
                        }
                    }
                },
                "required": ["title", "start_time", "duration_minutes"]
            }
        },
        # Provide concrete examples
        "input_examples": [
            {
                "title": "Team Standup",
                "start_time": "2025-01-15T09:00:00",
                "duration_minutes": 30,
                "attendees": [
                    {"email": "alice@company.com", "optional": False},
                    {"email": "bob@company.com", "optional": False}
                ],
                "reminders": [
                    {"minutes_before": 15, "method": "popup"}
                ]
            },
            {
                "title": "Lunch Break",
                "start_time": "2025-01-15T12:00:00",
                "duration_minutes": 60
                # Demonstrates optional fields can be omitted
            }
        ]
    }
]
}
'
```
</TabItem>
</Tabs>

---

## effort parameter: 토큰 사용량 제어 {#effort-parameter}

`reasoning_effort` parameter로 Claude가 응답에 들이는 추론 강도를 조절할 수 있습니다. 이를 통해 응답의 상세함과 토큰 효율 사이의 균형을 선택합니다.

:::info
LiteLLM은 `reasoning_effort`를 Anthropic의 `output_config` 형식으로 자동 매핑하고, Claude Opus 4.5에 필요한 `effort-2025-11-24` beta header를 추가합니다.
:::

사용 가능한 `reasoning_effort` 값은 `"high"`, `"medium"`, `"low"`입니다.

### 사용법 예제

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python
import litellm

message = "Analyze the trade-offs between microservices and monolithic architectures"

# High effort (default) - Maximum capability
response_high = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{"role": "user", "content": message}],
    reasoning_effort="high"
)

print("High effort response:")
print(response_high.choices[0].message.content)
print(f"Tokens used: {response_high.usage.completion_tokens}\n")

# Medium effort - Balanced approach
response_medium = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{"role": "user", "content": message}],
    reasoning_effort="medium"
)

print("Medium effort response:")
print(response_medium.choices[0].message.content)
print(f"Tokens used: {response_medium.usage.completion_tokens}\n")

# Low effort - Maximum efficiency
response_low = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{"role": "user", "content": message}],
    reasoning_effort="low"
)

print("Low effort response:")
print(response_low.choices[0].message.content)
print(f"Tokens used: {response_low.usage.completion_tokens}\n")

# Compare token usage
print("Token Comparison:")
print(f"High:   {response_high.usage.completion_tokens} tokens")
print(f"Medium: {response_medium.usage.completion_tokens} tokens")
print(f"Low:    {response_low.usage.completion_tokens} tokens")
```

</TabItem>
<TabItem value="proxy" label="LiteLLM Proxy">

1. `config.yaml` 설정

```yaml
model_list:
  - model_name: claude-4
    litellm_params:
      model: anthropic/claude-opus-4-5-20251101
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data ' {
      "model": "claude-4",
      "messages": [{
        "role": "user",
        "content": "Analyze the trade-offs between microservices and monolithic architectures"
      }],
      "reasoning_effort": "high"
    }
'
```
</TabItem>
</Tabs>
