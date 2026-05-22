# Google Programmable Search Engine(PSE) 설정 {#google-programmable-search-engine-pse}

**API 키 받기:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)  
**검색 엔진 만들기:** [Programmable Search Engine](https://programmablesearchengine.google.com/)

## 설정 {#setup}

1. [Google Developers Programmable Search Engine](https://programmablesearchengine.google.com/)으로 이동해 로그인하거나 계정을 만듭니다.
2. 제어판에서 **Add** 버튼을 클릭합니다.
3. 검색 엔진 이름을 입력하고 속성을 설정합니다.
   - 검색할 사이트를 선택합니다(전체 웹 또는 특정 사이트).
   - 언어와 기타 기본 설정을 지정합니다.
   - 로봇이 아님을 확인합니다.
4. **Create** 버튼을 클릭합니다.
5. 생성이 완료되면 다음 항목이 표시됩니다.
   - **Search engine ID (cx)** - `GOOGLE_PSE_ENGINE_ID`에 사용할 값이므로 복사합니다.
   - API 키를 받기 위한 안내
6. API 키를 생성합니다.
   - [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)로 이동합니다.
   - 새 API 키를 만들거나 기존 키를 사용합니다.
   - 프로젝트에서 **Custom Search API**를 활성화합니다.
   - `GOOGLE_PSE_API_KEY`에 사용할 API 키를 복사합니다.

## LiteLLM Python SDK

```python showLineNumbers title="Google PSE Search"
import os
from litellm import search

os.environ["GOOGLE_PSE_API_KEY"] = "AIza..."
os.environ["GOOGLE_PSE_ENGINE_ID"] = "your-search-engine-id"

response = search(
    query="latest AI developments",
    search_provider="google_pse",
    max_results=10
)
```

## LiteLLM AI Gateway

### 1. config.yaml 설정 {#1-setup-configyaml}

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: gpt-4
      api_key: os.environ/OPENAI_API_KEY

search_tools:
  - search_tool_name: google-search
    litellm_params:
      search_provider: google_pse
      api_key: os.environ/GOOGLE_PSE_API_KEY
      search_engine_id: os.environ/GOOGLE_PSE_ENGINE_ID
```

### 2. 프록시 시작

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 검색 엔드포인트 테스트 {#3-test-the-search-endpoint}

```bash showLineNumbers title="Test Request"
curl http://0.0.0.0:4000/v1/search/google-search \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest AI developments",
    "max_results": 10
  }'
```

## 공급자별 매개변수 {#provider-specific-parameters}

```python showLineNumbers title="Google PSE Search with Provider-specific Parameters"
import os
from litellm import search

os.environ["GOOGLE_PSE_API_KEY"] = "AIza..."
os.environ["GOOGLE_PSE_ENGINE_ID"] = "your-search-engine-id"

response = search(
    query="latest AI research papers",
    search_provider="google_pse",
    max_results=10,
    search_domain_filter=["arxiv.org"],
    # Google PSE-specific parameters (use actual Google PSE API parameter names)
    dateRestrict="m6",               # 'm6' = last 6 months, 'd7' = last 7 days
    lr="lang_en",                    # Language restriction (e.g., 'lang_en', 'lang_es')
    safe="active",                   # Search safety level ('active' or 'off')
    exactTerms="machine learning",   # Phrase that all documents must contain
    fileType="pdf"                   # File type to restrict results to
)
```
