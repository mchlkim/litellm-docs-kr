# `SearchAPI.io` (`Google Search`)

https://www.searchapi.io/에서 무료 API 키를 생성해 시작하세요.

SearchAPI.io는 간단한 API로 Google Search 결과에 접근할 수 있게 해줍니다. 위치, 언어, 시간 필터 등 모든 Google Search 파라미터를 지원합니다.

지원되는 모든 파라미터의 전체 문서는 https://www.searchapi.io/docs/google 에서 확인하세요.

## LiteLLM Python SDK

```python showLineNumbers title="SearchAPI.io Search"
import os
from litellm import search

os.environ["SEARCHAPI_API_KEY"] = "your-api-key"

response = search(
    query="latest AI developments",
    search_provider="searchapi",
    max_results=10
)

# Access search results
for result in response.results:
    print(f"{result.title}: {result.url}")
    print(f"Snippet: {result.snippet}\n")
```

### SearchAPI.io 파라미터를 사용한 고급 사용법

SearchAPI.io는 Google Search 전용 파라미터를 다양하게 지원합니다.

```python showLineNumbers title="Advanced SearchAPI.io Parameters"
import os
from litellm import search

os.environ["SEARCHAPI_API_KEY"] = "your-api-key"

response = search(
    query="machine learning research",
    search_provider="searchapi",
    max_results=10,
    # Unified parameters
    country="US",
    search_domain_filter=["arxiv.org", "nature.com"],
    # SearchAPI.io specific parameters
    gl="us",              # Country code
    hl="en",              # Interface language
    time_period="last_month",  # Time filter
    safe="active",        # SafeSearch
    device="desktop",     # Device type
    location="New York"   # Geographic location
)
```

## LiteLLM AI Gateway

### 1. Setup config.yaml

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: google-search
    litellm_params:
      search_provider: searchapi
      api_key: os.environ/SEARCHAPI_API_KEY
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 검색 엔드포인트 테스트

```bash showLineNumbers title="Test Request"
curl http://0.0.0.0:4000/v1/search/google-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 10,
    "country": "US"
  }'
```

## SearchAPI.io 전용 파라미터

SearchAPI.io는 다양한 Google Search 파라미터를 지원합니다. 자주 사용하는 항목은 다음과 같습니다.

| Parameter | Type | 설명 |
|-----------|------|-------------|
| `gl` | string | 국가 코드(예: 'us', 'uk', 'de') |
| `hl` | string | 인터페이스 언어(예: 'en', 'es', 'fr') |
| `location` | string | 지리적 위치(예: 'New York', 'London') |
| `device` | string | 기기 유형: 'desktop', 'mobile', 'tablet' |
| `time_period` | string | 시간 필터: 'last_hour', 'last_day', 'last_week', 'last_month', 'last_year' |
| `time_period_min` | string | 시작 날짜(MM/DD/YYYY) |
| `time_period_max` | string | 종료 날짜(MM/DD/YYYY) |
| `safe` | string | SafeSearch: 'active' 또는 'off' |
| `lr` | string | 언어 제한(예: 'lang_en', 'lang_es') |
| `cr` | string | 국가 제한 |
| `page` | integer | 페이지네이션용 페이지 번호 |

### 시간 필터 예제

```python showLineNumbers title="Search with Time Filter"
response = search(
    query="AI breakthroughs",
    search_provider="searchapi",
    max_results=10,
    time_period="last_month"
)
```

### 사용자 지정 날짜 범위 예제

```python showLineNumbers title="Search with Custom Date Range"
response = search(
    query="AI research papers",
    search_provider="searchapi",
    max_results=10,
    time_period_min="01/01/2024",
    time_period_max="03/01/2024"
)
```

### 위치 지정 예제

```python showLineNumbers title="Search with Location"
response = search(
    query="AI conferences",
    search_provider="searchapi",
    max_results=10,
    location="San Francisco",
    gl="us"
)
```

## 응답 형식

SearchAPI.io는 표준 LiteLLM 검색 형식으로 결과를 반환합니다.

```json
{
  "object": "search",
  "results": [
    {
      "title": "Latest AI Developments",
      "url": "https://example.com/ai-news",
      "snippet": "Recent breakthroughs in artificial intelligence...",
      "date": "2024-01-15"
    }
  ]
}
```

## Rate Limits

SearchAPI.io는 사용 중인 플랜에 따라 다른 rate limit을 적용합니다.
- 무료 티어: 월 100개 요청
- 유료 플랜: 더 높은 한도 제공

현재 사용량은 https://www.searchapi.io/dashboard 에서 확인하세요.

## 오류 처리

```python showLineNumbers title="Error Handling"
from litellm import search
import os

os.environ["SEARCHAPI_API_KEY"] = "your-api-key"

try:
    response = search(
        query="test query",
        search_provider="searchapi",
        max_results=10
    )
    print(f"Found {len(response.results)} results")
except Exception as e:
    print(f"Search failed: {str(e)}")
```

## 추가 자료

- SearchAPI.io 문서: https://www.searchapi.io/docs
- API Dashboard: https://www.searchapi.io/dashboard
- 요금: https://www.searchapi.io/pricing
