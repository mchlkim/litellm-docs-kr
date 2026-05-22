# Firecrawl Search

**API Key 받기:** [https://firecrawl.dev](https://firecrawl.dev)

## LiteLLM Python SDK

```python showLineNumbers title="Firecrawl Search"
import os
from litellm import search

os.environ["FIRECRAWL_API_KEY"] = "fc-..."

response = search(
    query="latest AI developments",
    search_provider="firecrawl",
    max_results=5
)
```

## LiteLLM AI Gateway

### 1. config.yaml 설정

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: firecrawl-search
    litellm_params:
      search_provider: firecrawl
      api_key: os.environ/FIRECRAWL_API_KEY
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. search endpoint 테스트

```bash showLineNumbers title="Test Request"
curl http://0.0.0.0:4000/v1/search/firecrawl-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 5
  }'
```

## Provider별 파라미터

```python showLineNumbers title="Firecrawl Search with Provider-specific Parameters"
import os
from litellm import search

os.environ["FIRECRAWL_API_KEY"] = "fc-..."

response = search(
    query="machine learning research",
    search_provider="firecrawl",
    max_results=10,
    country="US",
    # Firecrawl-specific parameters
    sources=["web", "news"],         # Search multiple sources
    categories=[{"type": "github"}, {"type": "research"}],  # Filter by categories
    tbs="qdr:m",                     # Time-based search (past month)
    location="San Francisco,California,United States",  # Geo-targeting
    ignoreInvalidURLs=True,          # Exclude invalid URLs
    scrapeOptions={                  # Scraping options for results
        "formats": ["markdown"],
        "onlyMainContent": True,
        "removeBase64Images": True
    }
)
```

## 기능

Firecrawl은 웹 검색과 강력한 scraping 기능을 결합합니다.

### 여러 소스
서로 다른 소스를 동시에 검색합니다.
- `web` - 웹 검색 결과(기본값)
- `images` - 이미지 검색 결과
- `news` - 날짜가 포함된 뉴스 검색 결과

### 카테고리 필터링
특정 카테고리로 결과를 필터링합니다.
- `github` - GitHub repository, code, issue, documentation 안에서 검색합니다
- `research` - 학술 및 연구 웹사이트(arXiv, Nature, IEEE, PubMed 등)를 검색합니다
- `pdf` - PDF를 검색합니다

### 시간 기반 검색
`tbs` 파라미터를 사용해 기간별로 필터링합니다.
- `qdr:h` - 지난 1시간
- `qdr:d` - 지난 1일
- `qdr:w` - 지난 1주
- `qdr:m` - 지난 1개월
- `qdr:y` - 지난 1년

### 콘텐츠 scraping
`scrapeOptions`가 지정되면 Firecrawl은 검색 결과의 전체 페이지 콘텐츠를 자동으로 scrape합니다. 기본적으로 LiteLLM은 주요 콘텐츠만 포함한 markdown 형식을 요청합니다.

### 지리적 타기팅
`location`과 `country` 파라미터를 조합해 지리적으로 타기팅된 결과를 가져옵니다.
```python
response = search(
    query="restaurants",
    search_provider="firecrawl",
    country="DE",
    location="Berlin,Germany"
)
```

## 지원되는 쿼리 연산자

Firecrawl은 고급 검색 연산자를 지원합니다.

| 연산자 | 기능 | 예제 |
| ----------- | --------------------------------------------------------- | ------------------------------- |
| `""` | 텍스트 문자열을 fuzzy 처리 없이 매칭합니다 | `"Firecrawl"` |
| `-` | 특정 키워드를 제외합니다 | `-bad`, `-site:example.com` |
| `site:` | 지정한 웹사이트의 결과만 반환합니다 | `site:firecrawl.dev` |
| `inurl:` | URL에 특정 단어가 포함된 결과만 반환합니다 | `inurl:firecrawl` |
| `allinurl:` | URL에 여러 단어가 포함된 결과만 반환합니다 | `allinurl:git firecrawl` |
| `intitle:` | 제목에 특정 단어가 있는 결과만 반환합니다 | `intitle:Firecrawl` |
| `allintitle:` | 제목에 여러 단어가 있는 결과만 반환합니다 | `allintitle:firecrawl playground` |
| `related:` | 특정 domain과 관련된 결과만 반환합니다 | `related:firecrawl.dev` |
