# Linkup Search {#linkup-search}

**API 키 받기:** [https://linkup.so](https://linkup.so)

## LiteLLM Python SDK 사용법 {#litellm-python-sdk}

```python showLineNumbers title="Linkup Search"
import os
from litellm import search

os.environ["LINKUP_API_KEY"] = "..."

response = search(
    query="latest AI developments",
    search_provider="linkup",
    max_results=5
)
```

## LiteLLM AI Gateway 사용법 {#litellm-ai-gateway}

### 1. config.yaml 설정 {#1-setup-configyaml}

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: linkup-search
    litellm_params:
      search_provider: linkup
      api_key: os.environ/LINKUP_API_KEY
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 검색 엔드포인트 테스트 {#3-test-the-search-endpoint}

```bash showLineNumbers title="테스트 요청"
curl http://0.0.0.0:4000/v1/search/linkup-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 5
  }'
```

## 제공자별 파라미터 {#provider-specific-parameters}

```python showLineNumbers title="제공자별 파라미터를 사용한 Linkup Search"
import os
from litellm import search

os.environ["LINKUP_API_KEY"] = "..."

response = search(
    query="machine learning research",
    search_provider="linkup",
    max_results=10,
    # Linkup-specific parameters
    depth="deep",                      # "standard" (faster) or "deep" (more comprehensive)
    outputType="searchResults",        # "searchResults", "sourcedAnswer", or "structured"
    includeSources=True,               # Include sources in response
    includeImages=True,                # Include images in results
    fromDate="2024-01-01",             # Start date filter (YYYY-MM-DD)
    toDate="2024-12-31",               # End date filter (YYYY-MM-DD)
    includeDomains=["arxiv.org", "nature.com"],  # Domains to search (max 100)
    excludeDomains=["wikipedia.com"],  # Domains to exclude
    includeInlineCitations=True,       # Include inline citations in sourcedAnswer
)
```

## 기능 {#features}

Linkup은 컨텍스트 검색 기능을 갖춘 강력한 웹 검색을 제공합니다.

### 검색 깊이 {#search-depth}
검색의 정밀도와 속도를 제어합니다.
- `standard` - 결과를 더 빠르게 반환합니다
- `deep` - 시간이 더 오래 걸리지만 더 포괄적인 결과를 제공합니다

### 출력 유형 {#output-types}
결과 형식을 선택합니다.
- `searchResults` - URL과 콘텐츠가 포함된 검색 결과 목록을 반환합니다
- `sourcedAnswer` - 출처가 포함된 AI 생성 답변을 반환합니다
- `structured` - 사용자 지정 JSON 스키마 형식으로 결과를 반환합니다

### 날짜 필터링 {#date-filtering}
날짜 범위로 결과를 필터링합니다.
```python
response = search(
    query="AI developments",
    search_provider="linkup",
    fromDate="2024-06-01",
    toDate="2024-12-31"
)
```

### 도메인 필터링 {#domain-filtering}
특정 도메인을 포함하거나 제외합니다.
```python
response = search(
    query="research papers",
    search_provider="linkup",
    includeDomains=["arxiv.org", "nature.com", "ieee.org"],
    excludeDomains=["wikipedia.com"]
)
```

### 구조화된 출력 {#structured-output}
사용자 지정 JSON 스키마 형식으로 결과를 가져옵니다.
```python
response = search(
    query="Microsoft 2024 revenue",
    search_provider="linkup",
    outputType="structured",
    structuredOutputSchema='{"type": "object", "properties": {"revenue": {"type": "string"}, "year": {"type": "string"}}}'
)
```

## 응답 형식

Linkup은 다음 형식으로 결과를 반환합니다.

```json
{
  "results": [
    {
      "type": "text",
      "name": "Microsoft 2024 Annual Report",
      "url": "https://www.microsoft.com/investor/reports/ar24/index.html",
      "content": "Highlights from fiscal year 2024..."
    }
  ]
}
```

LiteLLM은 이를 표준 `SearchResponse` 형식으로 변환합니다.
- `results[].name` → `SearchResult.title`
- `results[].url` → `SearchResult.url`
- `results[].content` → `SearchResult.snippet`
