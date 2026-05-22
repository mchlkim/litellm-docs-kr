# 개요

| 기능 | 지원 여부 | 
|---------|-----------|
| 지원 프로바이더 | `perplexity`, `tavily`, `parallel_ai`, `exa_ai`, `brave`, `google_pse`, `dataforseo`, `firecrawl`, `searxng`, `linkup`, `duckduckgo`, `searchapi`, `serper` |
| 비용 추적 | ✅ |
| 로깅 | ✅ |
| 로드 밸런싱 | ❌ |

:::tip

LiteLLM은 [Search API의 Perplexity API 요청/응답 형식](https://docs.perplexity.ai/api-reference/search-post)을 따릅니다.

:::

:::info

LiteLLM v1.78.7 이상부터 지원됩니다.
:::

## **LiteLLM Python SDK 사용법**
### 빠른 시작 

```python showLineNumbers title="Basic Search"
from litellm import search
import os

os.environ["PERPLEXITYAI_API_KEY"] = "pplx-..."

response = search(
    query="latest AI developments in 2024",
    search_provider="perplexity",
    max_results=5
)

# Access search results
for result in response.results:
    print(f"{result.title}: {result.url}")
    print(f"Snippet: {result.snippet}\n")
```

### 비동기 사용법 

```python showLineNumbers title="Async Search"
from litellm import asearch
import os, asyncio

os.environ["PERPLEXITYAI_API_KEY"] = "pplx-..."

async def search_async(): 
    response = await asearch(
        query="machine learning research papers",
        search_provider="perplexity",
        max_results=10,
        search_domain_filter=["arxiv.org", "nature.com"]
    )
    
    # Access search results
    for result in response.results:
        print(f"{result.title}: {result.url}")
        print(f"Snippet: {result.snippet}")

asyncio.run(search_async())
```

### 선택적 파라미터

```python showLineNumbers title="Search with Options"
response = search(
    query="AI developments",
    search_provider="perplexity",
    # Unified parameters (work across all providers)
    max_results=10,                         # Maximum number of results (1-20)
    search_domain_filter=["arxiv.org"],     # Filter to specific domains
    country="US",                           # Country code filter
    max_tokens_per_page=1024                # Max tokens per page
)
```

## **LiteLLM AI Gateway 사용법**

LiteLLM은 검색 호출을 위해 Perplexity API와 호환되는 `/search` 엔드포인트를 제공합니다.

**설정**

litellm proxy `config.yaml`에 다음을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: perplexity-search
    litellm_params:
      search_provider: perplexity
      api_key: os.environ/PERPLEXITYAI_API_KEY
  
  - search_tool_name: tavily-search
    litellm_params:
      search_provider: tavily
      api_key: os.environ/TAVILY_API_KEY
```

litellm을 시작합니다.

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 테스트 요청

**옵션 1: URL에 검색 도구 이름 지정(권장 - 본문을 Perplexity 호환 형식으로 유지)**

```bash showLineNumbers title="cURL Request"
curl http://0.0.0.0:4000/v1/search/perplexity-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments 2024",
    "max_results": 5,
    "search_domain_filter": ["arxiv.org", "nature.com"],
    "country": "US"
  }'
```

**옵션 2: 본문에 검색 도구 이름 지정**

```bash showLineNumbers title="cURL Request with search_tool_name in body"
curl http://0.0.0.0:4000/v1/search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "search_tool_name": "perplexity-search",
    "query": "latest AI developments 2024",
    "max_results": 5
  }'
```

### 로드 밸런싱

자동 로드 밸런싱과 폴백을 위해 여러 검색 프로바이더를 설정합니다.

```yaml showLineNumbers title="config.yaml with load balancing"
search_tools:
  - search_tool_name: my-search
    litellm_params:
      search_provider: perplexity
      api_key: os.environ/PERPLEXITYAI_API_KEY
  
  - search_tool_name: my-search
    litellm_params:
      search_provider: tavily
      api_key: os.environ/TAVILY_API_KEY
  
  - search_tool_name: my-search
    litellm_params:
      search_provider: exa_ai
      api_key: os.environ/EXA_API_KEY

  - search_tool_name: my-search
    litellm_params:
      search_provider: brave
      api_key: os.environ/BRAVE_API_KEY

router_settings:
  routing_strategy: simple-shuffle  # or 'least-busy', 'latency-based-routing'
```

로드 밸런싱을 테스트합니다.

```bash
curl http://0.0.0.0:4000/v1/search/my-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI developments",
    "max_results": 10
  }'
```

## **Request/응답 형식**

:::info

LiteLLM은 **Perplexity Search API 사양**을 따릅니다.

전체 세부 정보는 [공식 Perplexity Search 문서](https://docs.perplexity.ai/api-reference/search-post)를 참고하세요.

:::

### 예제 요청

```json showLineNumbers title="Search Request"
{
  "query": "latest AI developments 2024",
  "max_results": 10,
  "search_domain_filter": ["arxiv.org", "nature.com"],
  "country": "US",
  "max_tokens_per_page": 1024
}
```

### 요청 파라미터

| 파라미터 | 유형 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `query` | string 또는 array | 예 | 검색 쿼리입니다. 단일 문자열 또는 문자열 배열을 사용할 수 있습니다. |
| `search_provider` | string | 예(SDK) | 사용할 검색 프로바이더: `"perplexity"`, `"tavily"`, `"parallel_ai"`, `"exa_ai"`, `"brave"`, `"google_pse"`, `"dataforseo"`, `"firecrawl"`, `"searxng"`, `"linkup"`, `"duckduckgo"`, `"searchapi"` 또는 `"serper"` |
| `search_tool_name` | string | 예(Proxy) | `config.yaml`에 설정된 검색 도구 이름입니다. |
| `max_results` | integer | 아니요 | 반환할 최대 결과 수입니다(1-20). 기본값: 10 |
| `search_domain_filter` | array | 아니요 | 결과를 필터링할 도메인 목록입니다(최대 20개 도메인). |
| `max_tokens_per_page` | integer | 아니요 | 페이지당 처리할 최대 토큰 수입니다. 기본값: 1024 |
| `country` | string | 아니요 | 국가 코드 필터입니다(예: `"US"`, `"GB"`, `"DE"`). |

**쿼리 형식 예제:**

```python
# Single query
query = "AI developments"

# Multiple queries
query = ["AI developments", "machine learning trends"]
```

### 응답 형식

응답은 다음 구조로 Perplexity의 검색 형식을 따릅니다.

```json showLineNumbers title="Search Response"
{
  "object": "search",
  "results": [
    {
      "title": "Latest Advances in Artificial Intelligence",
      "url": "https://arxiv.org/paper/example",
      "snippet": "This paper discusses recent developments in AI...",
      "date": "2024-01-15"
    },
    {
      "title": "Machine Learning Breakthroughs",
      "url": "https://nature.com/articles/ml-breakthrough",
      "snippet": "Researchers have achieved new milestones...",
      "date": "2024-01-10"
    }
  ]
}
```

#### 응답 필드

| 필드 | 유형 | 설명 |
|-------|------|-------------|
| `object` | string | 검색 응답에서는 항상 `"search"`입니다. |
| `results` | array | 검색 결과 목록입니다. |
| `results[].title` | string | 검색 결과의 제목입니다. |
| `results[].url` | string | 검색 결과의 URL입니다. |
| `results[].snippet` | string | 결과에서 가져온 텍스트 스니펫입니다. |
| `results[].date` | string | 선택적 게시일 또는 마지막 업데이트 날짜입니다. |

## **지원 프로바이더**

| 프로바이더 | 환경 변수 | `search_provider` 값 |
|----------|---------------------|------------------------|
| Perplexity AI | `PERPLEXITYAI_API_KEY` | `perplexity` |
| Tavily | `TAVILY_API_KEY` | `tavily` |
| Exa AI | `EXA_API_KEY` | `exa_ai` |
| Brave Search | `BRAVE_API_KEY` | `brave` |
| Parallel AI | `PARALLEL_AI_API_KEY` | `parallel_ai` |
| Google PSE | `GOOGLE_PSE_API_KEY`, `GOOGLE_PSE_ENGINE_ID` | `google_pse` |
| DataForSEO | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | `dataforseo` |
| Firecrawl | `FIRECRAWL_API_KEY` | `firecrawl` |
| SearXNG | `SEARXNG_API_BASE`(필수) | `searxng` |
| Linkup | `LINKUP_API_KEY` | `linkup` |
| Serper | `SERPER_API_KEY` | `serper` |
| DuckDuckGo | `DUCKDUCKGO_API_BASE` | `duckduckgo` |
| SearchAPI.io | `SEARCHAPI_API_KEY` | `searchapi` |

자세한 설정 지침과 프로바이더별 파라미터는 각 프로바이더 문서를 참고하세요.
