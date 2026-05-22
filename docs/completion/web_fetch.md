import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Web Fetch

web fetch 도구를 사용하면 LLM이 지정된 웹페이지와 PDF 문서의 전체 콘텐츠를 가져올 수 있습니다. 이를 통해 AI 모델은 인터넷의 실시간 정보에 접근하고 웹 콘텐츠를 응답에 반영할 수 있습니다.

## Web Fetch와 Web Search 비교

**Web Fetch**는 사용자가 URL로 지정한 특정 웹페이지의 전체 콘텐츠를 가져옵니다. 반면 **Web Search**는 사용자의 질의를 기반으로 관련 정보를 찾기 위해 인터넷 검색을 수행합니다.

| 기능 | Web Fetch | Web Search |
|---------|-----------|------------|
| **목적** | 특정 URL의 콘텐츠 가져오기 | 정보를 찾기 위해 인터넷 검색 |
| **입력** | 가져올 정확한 URL 제공 | 검색 질의/질문 제공 |
| **출력** | 지정된 URL의 전체 페이지 콘텐츠 | 관련 정보가 포함된 검색 결과 |
| **사용 사례** | - 특정 기사 분석<br/>- 알려진 웹사이트 콘텐츠 비교<br/>- 특정 페이지에서 데이터 추출 | - 최신 뉴스/이벤트 찾기<br/>- 주제 조사<br/>- 실시간 정보 확보 |


**예제 Web Fetch**: "Fetch the content from https://example.com/pricing and summarize it"  
**예제 Web Search**: "What are the latest AI developments this week?"

**지원 프로바이더:**
- Anthropic API (`anthropic/`)

**지원 도구 타입:**
- `web_fetch_20250910` - 사용량 제한, 도메인 필터링, citation 지원이 포함된 웹 콘텐츠 가져오기 도구


## 빠른 시작

### LiteLLM Python SDK

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

# Web fetch tool
tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    }
]

messages = [
    {
        "role": "user", 
        "content": "Please analyze the content at https://example.com/article and summarize the main points"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

### LiteLLM Proxy

1. `config.yaml`에 web fetch 모델을 정의합니다.

```yaml
model_list:
  - model_name: claude-3-5-sonnet-latest # Anthropic claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
```

2. Proxy server를 실행합니다.

```bash
litellm --config config.yaml
```

3. OpenAI Python SDK로 테스트합니다.

```python
import os 
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234", # your litellm proxy api key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet-latest",
    messages=[
        {
            "role": "user", 
            "content": "Please fetch and analyze the content from https://news.ycombinator.com and tell me about the top stories"
        }
    ],
    tools=[
        {
            "type": "web_fetch_20250910",
            "name": "web_fetch",
            "max_uses": 5,
        }
    ]
)

print(response)
```

## 지원 모델

web fetch는 다음 Anthropic API 모델에서 사용할 수 있습니다.

- `claude-opus-4-6` (Claude Opus 4.6)
- `claude-sonnet-4-6` (Claude Sonnet 4.6)
- `claude-opus-4-5` (Claude Opus 4.5)
- `claude-sonnet-4-5` (Claude Sonnet 4.5)
- `claude-haiku-4-5` (Claude Haiku 4.5)
- `claude-opus-4-1-20250805` (Claude Opus 4.1)
- `claude-opus-4-20250514` (Claude Opus 4)
- `claude-sonnet-4-20250514` (Claude Sonnet 4)
- `claude-3-7-sonnet-20250219` (Claude Sonnet 3.7)
- `claude-3-5-sonnet-latest` (Claude Sonnet 3.5 v2 - 지원 중단됨)
- `claude-3-5-haiku-latest` (Claude Haiku 3.5)

:::note
web fetch 도구는 현재 JavaScript로 동적 렌더링되는 웹사이트를 지원하지 않습니다.
:::

## 사용법 예제

### 기본 웹 콘텐츠 가져오기

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 3,
    }
]

messages = [
    {
        "role": "user",
        "content": "Fetch the latest news from https://techcrunch.com and summarize the top 3 articles"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

### 조사 및 분석

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch", 
        "max_uses": 10,
    }
]

messages = [
    {
        "role": "user",
        "content": "Research the latest developments in AI by fetching content from multiple tech news websites and provide a comprehensive analysis"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

### 콘텐츠 비교

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    }
]

messages = [
    {
        "role": "user",
        "content": "Compare the pricing information from https://openai.com/pricing and https://anthropic.com/pricing and create a comparison table"
    }
]

response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

## 여러 도구와 함께 쓰는 고급 사용법

web fetch는 computer use 또는 text editor 같은 다른 도구와 함께 사용할 수 있습니다.

```python
import os 
from litellm import completion

os.environ["ANTHROPIC_API_KEY"] = "your-api-key"

tools = [
    {
        "type": "web_fetch_20250910",
        "name": "web_fetch",
        "max_uses": 5,
    },
    {
        "type": "text_editor_20250124", 
        "name": "str_replace_editor"
    }
]

messages = [
    {
        "role": "user",
        "content": "Fetch the latest AI research papers from arXiv, analyze them, and create a detailed report file with your findings"
    }
]
    
response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=messages,
    tools=tools,
)

print(response)
```

## 사양

### Web Fetch Tool (`web_fetch_20250910`)

web fetch 도구는 다음 파라미터를 지원합니다.

```json
{
  "type": "web_fetch_20250910",
  "name": "web_fetch",

  // Optional: Limit the number of fetches per request
  "max_uses": 10,

  // Optional: Only fetch from these domains
  "allowed_domains": ["example.com", "docs.example.com"],

  // Optional: Never fetch from these domains
  "blocked_domains": ["private.example.com"],

  // Optional: Enable citations for fetched content
  "citations": {
    "enabled": true
  },

  // Optional: Maximum content length in tokens
  "max_content_tokens": 100000
}
```
