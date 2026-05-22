# DataForSEO 검색 {#dataforseo-search}

**API 액세스 받기:** [DataForSEO](https://dataforseo.com/)

## 설정 {#setup}

1. [DataForSEO](https://dataforseo.com/)로 이동해 계정을 만듭니다
2. 계정 대시보드로 이동합니다
3. API 자격 증명을 생성합니다:
   - **login**(username)을 받게 됩니다
   - **password**를 받게 됩니다
4. 환경 변수를 설정합니다:
   - `DATAFORSEO_LOGIN` - DataForSEO 로그인/사용자 이름
   - `DATAFORSEO_PASSWORD` - DataForSEO 비밀번호

## LiteLLM Python SDK {#litellm-python-sdk}

```python showLineNumbers title="DataForSEO Search"
import os
from litellm import search

os.environ["DATAFORSEO_LOGIN"] = "your-login"
os.environ["DATAFORSEO_PASSWORD"] = "your-password"

response = search(
    query="latest AI developments",
    search_provider="dataforseo",
    max_results=10
)
```

## LiteLLM AI Gateway {#litellm-ai-gateway}

### 1. config.yaml 설정 {#1-setup-configyaml}

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: dataforseo-search
    litellm_params:
      search_provider: dataforseo
      api_key: "os.environ/DATAFORSEO_LOGIN:os.environ/DATAFORSEO_PASSWORD"
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 검색 엔드포인트 테스트 {#3-test-the-search-endpoint}

```bash showLineNumbers title="Test Request"
curl http://0.0.0.0:4000/v1/search/dataforseo-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 10
  }'
```

## Provider별 파라미터 {#provider-specific-parameters}

```python showLineNumbers title="DataForSEO Search with Provider-specific Parameters"
import os
from litellm import search

os.environ["DATAFORSEO_LOGIN"] = "your-login"
os.environ["DATAFORSEO_PASSWORD"] = "your-password"

response = search(
    query="AI developments",
    search_provider="dataforseo",
    max_results=10,
    # DataForSEO-specific parameters
    country="United States",       # Country name for location_name
    language_code="en",            # Language code
    depth=20,                      # Number of results (max 700)
    device="desktop",              # Device type ('desktop', 'mobile', 'tablet')
    os="windows"                   # Operating system
)
```
