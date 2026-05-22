import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 웹 검색

litellm에서 웹 검색을 사용합니다.

| 기능 | 세부 정보 |
|---------|---------|
| 지원 엔드포인트 | - `/chat/completions` <br/> - `/responses` |
| 지원 프로바이더 | `openai`, `xai`, `vertex_ai`, `anthropic`, `gemini`, `perplexity` |
| LiteLLM Cost Tracking | ✅ 지원 |
| LiteLLM Version | `v1.71.0+` |

## 어떤 검색 엔진을 사용하나요?

각 프로바이더는 자체 검색 백엔드를 사용합니다.

| 프로바이더 | 검색 엔진 | 참고 |
|----------|---------------|-------|
| **OpenAI** (`gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview`) | OpenAI 내부 검색 | 실시간 웹 데이터 |
| **xAI** (`grok-3`) | xAI 검색 + X/Twitter | 실시간 소셜 미디어 데이터 |
| **Google AI/Vertex** (`gemini-2.0-flash`) | **Google Search** | 실제 Google 검색 결과 사용 |
| **Anthropic** (`claude-3-5-sonnet`) | Anthropic 웹 검색 | 실시간 웹 데이터 |
| **Perplexity** | Perplexity 검색 엔진 | AI 기반 검색 및 추론 |

:::warning 중요: Search 모델만 `web_search_options`를 지원합니다
OpenAI에서는 전용 검색 모델만 `web_search_options` 파라미터를 지원합니다.
- `gpt-4o-search-preview`
- `gpt-4o-mini-search-preview`
- `gpt-5-search-api`

**`gpt-5`, `gpt-4.1`, `gpt-4o` 같은 일반 모델은 `web_search_options`를 지원하지 않습니다.**
:::

:::tip `web_search_options` 파라미터는 선택 사항입니다
검색 모델(`gpt-4o-search-preview` 등)은 `web_search_options` 파라미터가 없어도 **자동으로 웹을 검색**합니다.

다음이 필요할 때 `web_search_options`를 사용합니다.
- `search_context_size` 조정(`"low"`, `"medium"`, `"high"`)
- 지역화된 결과를 위한 `user_location` 지정
:::

:::info
**Anthropic Web Search 모델**: 웹 검색을 지원하는 Claude 모델: `claude-3-5-sonnet-latest`, `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-latest`, `claude-3-5-haiku-20241022`, `claude-3-7-sonnet-20250219`
:::

## OpenAI 웹 검색: 두 가지 방식

OpenAI는 엔드포인트와 모델에 따라 웹 검색을 사용하는 두 가지 방식을 제공합니다.

| 방식 | 엔드포인트 | 모델 | 활성화 방법 |
|----------|----------|--------|---------------|
| **Search 모델** | `/chat/completions` | `gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview` | `web_search_options` 파라미터 전달 |
| **Web Search Tool** | `/responses` | `gpt-5`, `gpt-4.1`, `gpt-4o` 및 기타 일반 모델 | `web_search_preview` 도구 전달 |

:::tip Search 모델은 자동으로 검색합니다
`gpt-5-search-api` 같은 검색 모델은 `web_search_options` 파라미터가 없어도 **자동으로 웹을 검색**합니다. `search_context_size`(`"low"`, `"medium"`, `"high"`)를 설정하거나 지역화된 결과를 위해 `user_location`을 지정할 때 `web_search_options`를 사용하세요.
:::

## `/chat/completions` (`litellm.completion`)

### 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import completion

response = completion(
    model="openai/gpt-5-search-api",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "medium"  # Options: "low", "medium", "high"
    }
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  # OpenAI search models
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4o-search-preview
    litellm_params:
      model: openai/gpt-4o-search-preview
      api_key: os.environ/OPENAI_API_KEY

  # xAI
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY

  # Anthropic
  - model_name: claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY

  # VertexAI
  - model_name: gemini-2-flash
    litellm_params:
      model: gemini-2.0-flash
      vertex_project: your-project-id
      vertex_location: us-central1

  # Google AI Studio
  - model_name: gemini-2-flash-studio
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GOOGLE_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gpt-5-search-api",  # or any other web search enabled model
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?"
        }
    ],
    extra_body={
        "web_search_options": {
            "search_context_size": "medium"
        }
    }
)
```
</TabItem>
</Tabs>

### Search context size 설정

<Tabs>
<TabItem value="sdk" label="SDK">

**OpenAI (using web_search_options)**
```python showLineNumbers
from litellm import completion

# Customize search context size
response = completion(
    model="openai/gpt-5-search-api",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```

**xAI (using web_search_options)**
```python showLineNumbers
from litellm import completion

# Customize search context size for xAI
response = completion(
    model="xai/grok-3",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "high"  # Options: "low", "medium" (default), "high"
    }
)
```

**Anthropic (using web_search_options)**
```python showLineNumbers
from litellm import completion

# Customize search context size for Anthropic
response = completion(
    model="anthropic/claude-3-5-sonnet-latest",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "medium",  # Options: "low", "medium" (default), "high"
        "user_location": {
            "type": "approximate",
            "approximate": {
                "city": "San Francisco",
            },
        }
    }
)
```

**VertexAI/Gemini (using web_search_options)**
```python showLineNumbers
from litellm import completion

# Customize search context size for Gemini
response = completion(
    model="gemini-2.0-flash",
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?",
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# Customize search context size
response = client.chat.completions.create(
    model="grok-3",  # works with any web search enabled model
    messages=[
        {
            "role": "user",
            "content": "What was a positive news story from today?"
        }
    ],
    web_search_options={
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }
)
```
</TabItem>
</Tabs>



## `/responses` (litellm.responses)

`gpt-5`, `gpt-4.1`, `gpt-4o` 같은 모델에서는 `web_search_preview` 도구를 사용합니다.

:::info
`gpt-5-search-api`, `gpt-4o-search-preview` 같은 검색 전용 모델은 `/responses` 엔드포인트를 지원하지 않습니다. 대신 `/chat/completions` + `web_search_options`로 사용하세요(위 섹션 참고).
:::

### 빠른 시작

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import responses

response = responses(
    model="openai/gpt-5",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview"  # enables web search with default medium context size
    }]
)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. config.yaml 설정

```yaml
model_list:
  - model_name: gpt-5
    litellm_params:
      model: openai/gpt-5
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4.1
    litellm_params:
      model: openai/gpt-4.1
      api_key: os.environ/OPENAI_API_KEY
```

2. 프록시 시작

```bash
litellm --config /path/to/config.yaml
```

3. 테스트

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

response = client.responses.create(
    model="gpt-5",
    tools=[{
        "type": "web_search_preview"
    }],
    input="What is the capital of France?",
)

print(response.output_text)
```
</TabItem>
</Tabs>

### Search context size 설정

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers
from litellm import responses

# Customize search context size
response = responses(
    model="openai/gpt-5",
    input="What is the capital of France?",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }]
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```python showLineNumbers
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-1234",
    base_url="http://0.0.0.0:4000"
)

# Customize search context size
response = client.responses.create(
    model="gpt-5",
    tools=[{
        "type": "web_search_preview",
        "search_context_size": "low"  # Options: "low", "medium" (default), "high"
    }],
    input="What is the capital of France?",
)

print(response.output_text)
```
</TabItem>
</Tabs>

## config.yaml에서 웹 검색 설정

프록시 설정 파일에서 기본 웹 검색 옵션을 직접 지정할 수 있습니다.

<Tabs>
<TabItem value="default" label="기본 웹 검색">

```yaml
model_list:
  # Enable web search by default for all requests to this model
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
      web_search_options: {}  # Enables web search with default settings
```

### 고급
LiteLLM 라우터가 WebSearch를 지원하지 않는 모델을 선택적으로 제외하도록 설정할 수 있습니다. 예:
```yaml
  - model_name: gpt-4.1
    litellm_params:
      model: openai/gpt-4.1
  - model_name: gpt-4.1
    litellm_params:
      model: azure/gpt-4.1
      api_base: "x.openai.azure.com/"
      api_version: 2025-03-01-preview
    model_info:
      supports_web_search: False <---- KEY CHANGE!
```
이 예제에서 LiteLLM은 일반 LLM 요청은 두 배포 모두로 라우팅하지만, WebSearch 요청은 OpenAI로만 라우팅합니다.

</TabItem>
<TabItem value="custom" label="사용자 지정 검색 컨텍스트">

```yaml
model_list:
  # Set custom web search context size
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
      web_search_options:
        search_context_size: "high"  # Options: "low", "medium", "high"
  
  # OpenAI search model with custom context size
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY
      web_search_options:
        search_context_size: "low"

  # Gemini with medium context (default)
  - model_name: gemini-2-flash
    litellm_params:
      model: gemini-2.0-flash
      vertex_project: your-project-id
      vertex_location: us-central1
      web_search_options:
        search_context_size: "medium"
```

</TabItem>
</Tabs>

**참고:** 설정 파일에 `web_search_options`를 지정하면 해당 모델로 들어오는 모든 요청에 적용됩니다. 사용자는 API 요청에서 `web_search_options`를 전달해 이 설정을 계속 덮어쓸 수 있습니다.

## 모델의 웹 검색 지원 여부 확인

<Tabs>
<TabItem label="SDK" value="sdk">

`litellm.supports_web_search(model="model_name")`를 사용합니다. 모델이 웹 검색을 수행할 수 있으면 `True`를 반환합니다.

```python showLineNumbers
# Check OpenAI models
assert litellm.supports_web_search(model="openai/gpt-5-search-api") == True
assert litellm.supports_web_search(model="openai/gpt-4o-search-preview") == True

# Check xAI models
assert litellm.supports_web_search(model="xai/grok-3") == True

# Check Anthropic models
assert litellm.supports_web_search(model="anthropic/claude-3-5-sonnet-latest") == True

# Check VertexAI models
assert litellm.supports_web_search(model="gemini-2.0-flash") == True

# Check Google AI Studio models
assert litellm.supports_web_search(model="gemini/gemini-2.0-flash") == True
```
</TabItem>

<TabItem label="PROXY" value="proxy">

1. config.yaml에 모델 정의

```yaml
model_list:
  # OpenAI
  - model_name: gpt-5-search-api
    litellm_params:
      model: openai/gpt-5-search-api
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supports_web_search: True

  - model_name: gpt-4o-search-preview
    litellm_params:
      model: openai/gpt-4o-search-preview
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      supports_web_search: True

  # xAI
  - model_name: grok-3
    litellm_params:
      model: xai/grok-3
      api_key: os.environ/XAI_API_KEY
    model_info:
      supports_web_search: True
  
  # Anthropic
  - model_name: claude-3-5-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      supports_web_search: True
  
  # VertexAI
  - model_name: gemini-2-flash
    litellm_params:
      model: gemini-2.0-flash
      vertex_project: your-project-id
      vertex_location: us-central1
    model_info:
      supports_web_search: True
  
  # Google AI Studio
  - model_name: gemini-2-flash-studio
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GOOGLE_API_KEY
    model_info:
      supports_web_search: True
```

2. 프록시 서버 실행

```bash
litellm --config config.yaml
```

3. 모델의 웹 검색 지원 여부를 확인하려면 `/model_group/info` 호출

```shell
curl -X 'GET' \
  'http://localhost:4000/model_group/info' \
  -H 'accept: application/json' \
  -H 'x-api-key: sk-1234'
```

예상 응답

```json showLineNumbers
{
  "data": [
    {
      "model_group": "gpt-5-search-api",
      "providers": ["openai"],
      "max_tokens": 128000,
      "supports_web_search": true
    },
    {
      "model_group": "gpt-4o-search-preview",
      "providers": ["openai"],
      "max_tokens": 128000,
      "supports_web_search": true
    },
    {
      "model_group": "grok-3",
      "providers": ["xai"],
      "max_tokens": 131072,
      "supports_web_search": true
    },
    {
      "model_group": "gemini-2-flash",
      "providers": ["vertex_ai"],
      "max_tokens": 8192,
      "supports_web_search": true
    }
  ]
}
```

</TabItem>
</Tabs>

## 웹 검색 비용 추적

LiteLLM은 프로바이더별 과금 모델에 따라 웹 검색 비용을 자동으로 추적합니다. 이 비용은 표준 토큰 기반 가격 위에 추가됩니다.

### 프로바이더별 웹 검색 과금 방식

| 프로바이더 | 과금 단위 | 동작 방식 |
|----------|-------------|--------------|
| **Gemini 3.x** (3-flash, 3-pro, 3.1-*) | 검색 쿼리별 | 각 내부 검색 쿼리가 개별 과금됩니다. 하나의 프롬프트가 여러 쿼리를 발생시킬 수 있습니다. |
| **Gemini 2.x** (2.0-flash, 2.5-flash, 2.5-pro) | grounded 프롬프트별 | 내부적으로 실행된 쿼리 수와 관계없이 grounding을 사용하는 API 호출당 고정 비용이 부과됩니다. |
| **OpenAI** (gpt-4o-search, gpt-5-search) | 검색 컨텍스트 크기별 | 비용은 `search_context_size`(`low`, `medium`, `high`)에 따라 달라집니다. |
| **Anthropic** (웹 검색을 사용하는 Claude) | 검색 요청별 | 웹 검색 도구 호출마다 고정 비용이 부과됩니다. |
| **Perplexity** (sonar, sonar-pro) | 검색 컨텍스트 크기별 | 비용은 `search_context_size`에 따라 달라집니다. |

### 가격 설정

웹 검색 비용은 `model_prices_and_context_window.json`에서 두 필드로 정의됩니다.

- **`search_context_cost_per_query`**: 과금 단위당 비용입니다(검색 컨텍스트 크기 티어별).
- **`web_search_billing_unit`** *(Gemini 모델)*: `"per_query"`(각 검색 쿼리별 과금) 또는 `"per_prompt"`(기본값, 검색을 사용하는 API 호출당 고정 비용)입니다.

```json
{
    "gemini/gemini-3-flash-preview": {
        "web_search_billing_unit": "per_query",
        "search_context_cost_per_query": {
            "search_context_size_low": 0.014,
            "search_context_size_medium": 0.014,
            "search_context_size_high": 0.014
        }
    },
    "gemini/gemini-2.5-flash": {
        "search_context_cost_per_query": {
            "search_context_size_low": 0.035,
            "search_context_size_medium": 0.035,
            "search_context_size_high": 0.035
        }
    }
}
```

:::info
`web_search_billing_unit`이 없는 모델은 기본적으로 `"per_prompt"`를 사용합니다. 모델이 내부 쿼리를 몇 개 실행했는지와 관계없이 웹 검색을 사용하는 API 호출당 한 번의 고정 비용이 부과됩니다.
:::

프록시 설정의 `model_info`를 사용해 이 값을 덮어쓸 수 있습니다.

```yaml
model_list:
  - model_name: gemini-3-flash
    litellm_params:
      model: gemini/gemini-3-flash-preview
    model_info:
      web_search_billing_unit: per_query
      search_context_cost_per_query:
        search_context_size_low: 0.014
        search_context_size_medium: 0.014
        search_context_size_high: 0.014
```

### LiteLLM의 검색 사용량 추적 방식

웹 검색 요청 수는 `usage.prompt_tokens_details.web_search_requests`에 저장됩니다. LiteLLM은 각 프로바이더 응답에서 이 값을 추출합니다.

- **Gemini**: 응답의 `groundingMetadata.webSearchQueries`에서 추출합니다. Gemini 2.x는 프롬프트별 과금이므로 1로 제한합니다.
- **OpenAI**: 사용량 메타데이터에 직접 보고됩니다.
- **Anthropic**: `server_tool_use.web_search_requests`를 통해 보고됩니다.
- **xAI**: 응답의 `num_sources_used`에서 매핑합니다.

```python
response = litellm.completion(
    model="gemini/gemini-3-flash-preview",
    messages=[{"role": "user", "content": "Latest tech news?"}],
    web_search_options={"search_context_size": "medium"},
)

# Check web search usage
print(response.usage.prompt_tokens_details.web_search_requests)  # e.g., 3

# Get total cost (includes token cost + web search cost)
cost = litellm.completion_cost(completion_response=response)
print(f"Total cost: ${cost}")
```
