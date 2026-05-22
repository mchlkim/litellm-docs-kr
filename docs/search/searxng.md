# SearXNG 검색

**오픈 소스:** [https://github.com/searxng/searxng](https://github.com/searxng/searxng)

**공개 인스턴스:** [https://searx.space/](https://searx.space/)

## 개요

SearXNG는 사용자 개인정보를 보호하면서 여러 검색 엔진의 결과를 모아 주는 무료 오픈 소스 메타검색 엔진입니다. 직접 호스팅하거나 공개 인스턴스를 통해 사용할 수 있습니다.

**참고:** SearXNG는 페이지당 고정된 수의 결과를 반환하며(기본값 약 20개), API로 결과 수를 제한하는 기능을 지원하지 않습니다. `max_results` 파라미터는 SearXNG에서 직접 지원되지 않습니다.

## LiteLLM Python SDK

```python showLineNumbers title="SearXNG Search"
import os
from litellm import search

# Set your SearXNG instance URL (REQUIRED)
os.environ["SEARXNG_API_BASE"] = "https://serxng-deployment-production.up.railway.app"

response = search(
    query="latest AI developments",
    search_provider="searxng",
    max_results=10
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
  - search_tool_name: searxng-search
    litellm_params:
      search_provider: searxng
      api_base: https://serxng-deployment-production.up.railway.app
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 검색 엔드포인트 테스트

```bash showLineNumbers title="Test Request"
curl http://0.0.0.0:4000/v1/search/searxng-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 10
  }'
```

## 공급자별 파라미터

```python showLineNumbers title="SearXNG Search with Provider-specific Parameters"
import os
from litellm import search

# REQUIRED: Set your SearXNG instance URL
os.environ["SEARXNG_API_BASE"] = "https://serxng-deployment-production.up.railway.app"

response = search(
    query="machine learning research",
    search_provider="searxng",
    max_results=10,
    # SearXNG-specific parameters
    categories="general,science",      # Comma-separated categories
    engines="google,duckduckgo,bing",  # Comma-separated engines
    language="en",                      # Language code
    pageno=1,                           # Page number
    time_range="month"                  # Time filter: day, month, year
)
```

## 기능

SearXNG는 강력한 메타검색 기능을 제공합니다.

### 여러 검색 엔진
여러 검색 엔진의 결과를 동시에 모읍니다.
- Google, DuckDuckGo, Bing, Brave 등
- Wikipedia, Startpage 등
- 그 외 다수

### 카테고리
특정 카테고리 안에서 검색합니다.
- `general` - 일반 웹 검색
- `science` - 과학 논문 및 문서
- `images` - 이미지 검색
- `news` - 뉴스 기사
- `videos` - 동영상 콘텐츠
- `music` - 음악 및 오디오
- `files` - 파일 검색
- `it` - IT 및 기술
- `map` - 지도 및 위치

### 시간 기반 필터링
시간 범위별로 결과를 필터링합니다.
- `day` - 지난 하루
- `month` - 지난 한 달
- `year` - 지난 1년

### 개인정보 보호 중심
- 사용자 추적 없음
- 쿠키 불필요
- 프로파일링 없음
- 광고 없음

### 언어 지원
`language` 파라미터로 60개 이상의 언어를 지원합니다.

## 셀프 호스팅

SearXNG는 완전한 제어가 필요할 때 직접 호스팅할 수 있습니다.

### 빠른 배포

간편한 설정을 위해 미리 구성된 배포 저장소를 사용하세요.

**[Fork 및 배포: github.com/BerriAI/serxng-deployment](https://github.com/BerriAI/serxng-deployment)**

이 저장소에는 다음이 포함되어 있습니다.
- Docker 및 Docker Compose 설정
- 사전 구성된 JSON API 형식
- 바로 배포 가능한 구성

### 수동 설치

자세한 설정은 [공식 SearXNG 설치 안내](https://docs.searxng.org/admin/installation.html)를 참고하세요.

**중요:** SearXNG를 설치하면 기본적으로 활성화된 출력 형식은 HTML뿐입니다. API를 사용하려면 JSON 형식을 활성화해야 합니다.

`settings.yml` 파일에 다음 내용을 추가하세요.

```yaml
search:
  formats:
    - html
    - json
```

그런 다음 SearXNG를 다시 시작하세요.

```bash
# Using Docker
docker run -d -p 8080:8080 \
  -v $(pwd)/settings.yml:/etc/searxng/settings.yml:ro \
  -e SEARXNG_BASE_URL=http://localhost:8080 \
  searxng/searxng

# Then configure LiteLLM to use your instance
export SEARXNG_API_BASE=http://localhost:8080
```

## 설정

### API Base URL 설정(필수)

환경 변수 또는 검색 호출에서 SearXNG 인스턴스 URL을 **반드시** 지정해야 합니다.

```python
# Option 1: Environment variable (Recommended)
import os
os.environ["SEARXNG_API_BASE"] = "https://your-instance.com"

response = search(
    query="AI developments",
    search_provider="searxng"
)

# Option 2: Pass directly in search call
response = search(
    query="AI developments",
    search_provider="searxng",
    api_base="https://your-instance.com"
)
```

**참고:** 기본 인스턴스 URL은 없습니다. [공개 인스턴스](https://searx.space/)를 선택하거나 직접 호스팅해야 합니다.

### 선택적 인증

일부 SearXNG 인스턴스는 인증을 요구할 수 있습니다.

```python
import os

# Set API key if required
os.environ["SEARXNG_API_KEY"] = "your-api-key"

response = search(
    query="AI developments",
    search_provider="searxng"
)
```

## 비용

SearXNG는 완전히 무료입니다.
- **오픈 소스** - 라이선스 비용 없음
- **셀프 호스팅** - 인프라 비용만 발생
- **공개 인스턴스** - 일반적으로 무료이며, 인스턴스 정책을 확인하세요

## 고급 사용법

### 사용자 지정 엔진 선택

```python
response = search(
    query="Python tutorials",
    search_provider="searxng",
    engines="stackoverflow,github,reddit",  # Only search these engines
    categories="it"
)
```

### 다중 카테고리 검색

```python
response = search(
    query="climate change",
    search_provider="searxng",
    categories="general,science,news",  # Search multiple categories
    time_range="month"
)
```

### 페이지네이션

```python
# Get page 1
page1 = search(
    query="AI research",
    search_provider="searxng",
    pageno=1
)

# Get page 2
page2 = search(
    query="AI research",
    search_provider="searxng",
    pageno=2
)
```

## 응답 형식

SearXNG는 표준 LiteLLM 검색 형식으로 결과를 반환합니다.

```json
{
  "object": "search",
  "results": [
    {
      "title": "Example Result",
      "url": "https://example.com",
      "snippet": "This is the content snippet from the search result...",
      "date": "2024-01-15",
      "last_updated": null
    }
  ]
}
```

## 문제 해결

### 먼저 인스턴스 테스트

searxng 검색 공급자와 함께 LiteLLM이 작동하지 않는 경우, curl로 SearXNG 인스턴스를 직접 테스트하세요.

```bash
# Test if JSON API is working
curl -s "https://your-searxng-instance.com/search?q=test&format=json" | head -50

# Example with specific instance
curl -s "https://serxng-deployment-production.up.railway.app/search?q=test&format=json" | head -50
```

**예상 응답**: 검색 결과가 포함된 JSON  
**HTML을 받는 경우**: 인스턴스의 `settings.yml`에서 JSON 형식이 활성화되지 않은 것입니다

### 결과 없음

결과가 없는 경우:

1. **다른 엔진 시도**: `engines` 파라미터를 지정하세요
2. **카테고리 확장**: 여러 카테고리를 사용하세요
3. **언어 조정**: 적절한 `language` 파라미터를 설정하세요

### JSON 형식이 활성화되지 않음

JSON 대신 HTML을 받는 경우:

1. **curl로 테스트**: 위의 curl 명령으로 JSON 출력을 확인하세요
2. **직접 인스턴스 호스팅**: JSON이 사전 구성된 [배포 저장소](https://github.com/BerriAI/serxng-deployment)를 사용하세요
3. **인스턴스 구성 확인**: 모든 공개 인스턴스에서 JSON이 활성화되어 있지는 않습니다
4. **JSON 수동 활성화**: `settings.yml`에 추가하세요:
   ```yaml
   search:
     formats:
       - html
       - json
   ```
