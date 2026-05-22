import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pass Through endpoint 생성 {#pass-through-endpoint-생성}

LiteLLM proxy에서 임의의 외부 API로 request를 route합니다. custom model, image generation API, 또는 LiteLLM을 통해 proxy하려는 service에 적합합니다.

**주요 장점:**
- Bria API, Mistral OCR 같은 third-party endpoint 온보딩
- request별 custom pricing 설정
- Proxy Admin이 developer에게 Bria, Mistral OCR 등 upstream LLM provider의 API key를 직접 전달할 필요 없음
- 중앙화된 인증, 사용량 추적, 예산 관리 유지

## UI로 빠른 시작(권장) {#ui로-빠른-시작recommended}

pass through endpoint를 만드는 가장 쉬운 방법은 LiteLLM UI를 사용하는 것입니다. 이 예제에서는 [Bria API](https://docs.bria.ai/image-generation/endpoints/text-to-image-base)를 온보딩하고 request당 비용을 설정합니다.

### Step 1: route mapping 생성 {#step-1-route-mapping-생성}

pass through endpoint를 만들려면 다음을 수행합니다.

1. LiteLLM Proxy UI로 이동합니다.
2. `모델 + Endpoints` tab으로 이동합니다.
3. `Pass Through Endpoints`를 클릭합니다.
4. "Add Pass Through Endpoint"를 클릭합니다.
5. 다음 세부 정보를 입력합니다.

**필수 field:**
- `Path Prefix`: client가 LiteLLM Proxy를 호출할 때 사용할 route입니다(예: `/bria`, `/mistral-ocr`).
- `Target URL`: request가 forward될 URL입니다.

<Image 
  img={require('../../img/pt_1.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

**Route mapping 예제:**

위 configuration은 다음 route mapping을 생성합니다.

| LiteLLM Proxy route | 대상 URL |
|-------------------|------------|
| `/bria` | `https://engine.prod.bria-api.com` |
| `/bria/v1/text-to-image/base/model` | `https://engine.prod.bria-api.com/v1/text-to-image/base/model` |
| `/bria/v1/enhance_image` | `https://engine.prod.bria-api.com/v1/enhance_image` |
| `/bria/<any-sub-path>` | `https://engine.prod.bria-api.com/<any-sub-path>` |

:::info
모든 route에는 LiteLLM proxy base URL이 prefix로 붙습니다. `https://<litellm-proxy-base-url>`
:::

### Step 2: header와 pricing 설정 {#step-2-header와-pricing-설정}

필요한 인증과 pricing을 설정합니다.

**인증 Setup:**
- Bria API에는 `api_token` header가 필요합니다.
- Bria API key를 `api_token` header 값으로 입력합니다.

**기본 query parameter(선택 사항):**
- 모든 request와 함께 자동으로 전송될 query parameter를 추가합니다.
- API versioning, format specification, 기본 configuration에 적합합니다.
- client가 자체 값을 제공하면 이 parameter를 override할 수 있습니다.
- 예제: `version=v1`, `format=json`, `timeout=30`

<Image 
  img={require('../../img/passthrough_query_default.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

**Pricing 설정:**
- request당 비용을 설정합니다(이 예제에서는 $12.00).
- 이를 통해 user별 비용 추적 및 billing이 가능해집니다.

<Image 
  img={require('../../img/pt_2.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

### Step 3: endpoint 저장 {#step-3-endpoint-저장}

configuration을 완료한 뒤 다음을 수행합니다.
1. 설정을 검토합니다.
2. "Add Pass Through Endpoint"를 클릭합니다.
3. endpoint가 생성되고 즉시 사용할 수 있게 됩니다.

### Step 4: endpoint test 실행 {#step-4-endpoint-test}

LiteLLM Proxy를 통해 Bria API로 test request를 보내 setup을 검증합니다.

```shell
curl -i -X POST \
  'http://localhost:4000/bria/v1/text-to-image/base/2.3' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <your-litellm-api-key>' \
  -d '{
    "prompt": "a book",
    "num_results": 2,
    "sync": true
  }'
```

**예상 response:**
모든 항목이 올바르게 구성되었다면 생성된 image data가 포함된 Bria API response를 받아야 합니다.

---

## Config.yaml 설정 {#configyaml-setup}

`config.yaml` file로도 pass through endpoint를 만들 수 있습니다. 아래는 Cohere API로 forward되는 `/v1/rerank` route를 추가하는 방법입니다.

### 예제 설정

```yaml
general_settings:
  master_key: sk-1234
  pass_through_endpoints:
    - path: "/v1/rerank"                                  # Route on LiteLLM Proxy
      target: "https://api.cohere.com/v1/rerank"          # Target endpoint
      headers:                                            # Headers to forward
        Authorization: "bearer os.environ/COHERE_API_KEY"
        content-type: application/json
        accept: application/json
      forward_headers: true                               # Forward all incoming headers
      default_query_params:                               # Optional: Default query parameters
        version: "v1"                                     # Always send version=v1
        format: "json"                                    # Default format (can be overridden)
```

### 시작 및 test {#시작-및-test}

1. **프록시 시작:**
   ```shell
   litellm --config config.yaml --detailed_debug
   ```

2. **test request 보내기:**
   ```shell
   curl --request POST \
     --url http://localhost:4000/v1/rerank \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '{
       "model": "rerank-english-v3.0",
       "query": "What is the capital of the United States?",
       "top_n": 3,
       "documents": ["Carson City is the capital city of the American state of Nevada."]
     }'
   ```

### 예상 response {#expected-response}
```json
{
  "id": "37103a5b-8cfb-48d3-87c7-da288bedd429",
  "results": [
    {
      "index": 2,
      "relevance_score": 0.999071
    }
  ],
  "meta": {
    "api_version": {"version": "1"},
    "billed_units": {"search_units": 1}
  }
}
```

---

## 설정 reference {#설정-reference}

### 전체 specification {#전체-specification}

```yaml
general_settings:
  pass_through_endpoints:
    - path: string                    # Route on LiteLLM Proxy Server
      target: string                  # Target URL for forwarding
      auth: boolean                   # Enable LiteLLM authentication (Enterprise)
      forward_headers: boolean        # Forward all incoming headers
      include_subpath: boolean        # If true, forwards requests to sub-paths (default: false)
      methods: list[string]           # Optional: HTTP methods (e.g., ["GET", "POST"]). If not specified, all methods are supported.
      default_query_params:           # Optional: Default query parameters sent with every request
        <param-name>: string          # Key-value pairs (e.g., version: "v1", format: "json")
      headers:                        # Custom headers to add
        Authorization: string         # Auth header for target API
        content-type: string         # Request content type
        accept: string               # Expected response format
        LANGFUSE_PUBLIC_KEY: string  # For Langfuse endpoints
        LANGFUSE_SECRET_KEY: string  # For Langfuse endpoints
        <custom-header>: string      # Any custom header
```

### Header option {#header-option}
- **Authorization**: target API 인증
- **content-type**: request body format 지정
- **accept**: 예상 response format
- **LANGFUSE_PUBLIC_KEY/SECRET_KEY**: Langfuse integration용
- **Custom headers**: 추가 key-value pair

### 기본 query parameter {#default-query-parameters}
- **Parameter precedence(우선순위)**: client param > URL param > default param
- **사용 사례**: API versioning, authentication token, format control, feature flag
- **Override capability**: client는 모든 default parameter를 override할 수 있습니다.
- **예제**: `version: "v1"`, `format: "json"`, `timeout: "30"`

### Sub-path routing {#sub-path-routing}

기본적으로 pass-through endpoint는 지정된 **정확한 path**만 match합니다. sub-path로 request를 forward하려면 `include_subpath: true`를 설정하세요.

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/custom-api"                    # Any path prefix you choose
      target: "https://api.example.com"
      include_subpath: true  # Forward /custom-api/*, not just /custom-api
```

| 설정 | 동작 |
|---------|----------|
| `include_subpath: false` (default) | `/custom-api`만 forward됩니다. |
| `include_subpath: true` | `/custom-api`, `/custom-api/v1/chat`, `/custom-api/anything`가 모두 forward됩니다. |

---

### 기본 query parameter {#default-query-parameters-1}

Pass-through endpoint는 모든 request에 자동으로 추가되는 기본 query parameter를 지원합니다. API versioning, format specification, authentication token, 기본 configuration에 유용합니다.

#### 동작 방식

**Parameter precedence(높은 priority에서 낮은 priority 순):**
1. **Client-provided parameters(클라이언트 제공 parameter)**(request URL)
2. **URL parameters**(target URL)
3. **Default parameters**(configuration)

#### 예제 설정

```yaml
general_settings:
  pass_through_endpoints:
    - path: "/api/v1"
      target: "https://external-api.com/service?timeout=60"  # URL has timeout=60
      default_query_params:
        version: "v1"          # Always add version=v1
        format: "json"         # Default format=json (can be overridden)
        auth_level: "basic"    # Always add auth_level=basic
```

#### Request 예제 {#request-예제}

**Client request:** `GET /api/v1/users`
**실제 backend 호출:** `https://external-api.com/service?version=v1&format=json&auth_level=basic&timeout=60`

**Client request:** `GET /api/v1/users?format=xml&custom=value`
**실제 backend 호출:** `https://external-api.com/service?version=v1&auth_level=basic&timeout=60&format=xml&custom=value`
- Client `format=xml`이 default `format=json`을 override합니다.
- Default `version=v1`과 `auth_level=basic`은 유지됩니다.
- URL `timeout=60`은 유지됩니다.
- Client `custom=value`가 추가됩니다.

#### 사용 사례 {#use-case}

- **API versioning**: compatibility 유지를 위해 항상 `version=v2` 전송
- **인증**: `api_key=default_key` 같은 authentication token 추가
- **Format control**: 기본값은 `format=json`으로 두되 client override 허용
- **Rate limiting**: `rate_limit=standard`를 default로 설정
- **Feature flag**: `experimental=false`를 default로 활성화

---

서로 다른 HTTP method를 사용해 같은 path에 대해 다른 target URL을 구성할 수 있습니다. 서로 다른 backend가 서로 다른 operation을 처리할 때 유용합니다.

<Image 
  img={require('../../img/passthrough_method_setup.png')}
  style={{width: '60%', display: 'block', margin: '2rem auto'}}
/>

```yaml
general_settings:
  pass_through_endpoints:
    # GET requests to /azure/kb go to read API
    - path: "/azure/kb"
      target: "https://read-api.example.com/knowledge-base"
      methods: ["GET"]
      headers:
        Authorization: "bearer os.environ/READ_API_KEY"
    
    # POST requests to /azure/kb go to write API
    - path: "/azure/kb"
      target: "https://write-api.example.com/knowledge-base"
      methods: ["POST"]
      headers:
        Authorization: "bearer os.environ/WRITE_API_KEY"
    
    # PUT requests to /azure/kb go to update API
    - path: "/azure/kb"
      target: "https://update-api.example.com/knowledge-base"
      methods: ["PUT"]
      headers:
        Authorization: "bearer os.environ/UPDATE_API_KEY"
```

**핵심 사항:**
- `methods`를 지정하지 않으면 endpoint는 모든 HTTP method(GET, POST, PUT, DELETE, PATCH)를 지원합니다.
- method가 다르면 여러 endpoint가 같은 path를 공유할 수 있습니다.
- 단일 endpoint에 여러 method를 지정할 수 있습니다. `methods: ["GET", "POST"]`
- 이를 통해 operation type에 따라 서로 다른 backend로 route할 수 있습니다.

---

## 고급: custom adapter {#advanced-custom-adapter}

Anthropic/Bedrock client처럼 복잡한 integration에는 서로 다른 API schema를 변환하는 custom adapter를 만들 수 있습니다.

### 1. adapter 생성

```python
from litellm import adapter_completion
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.llms.anthropic import AnthropicMessagesRequest, AnthropicResponse

class AnthropicAdapter(CustomLogger):
    def translate_completion_input_params(self, kwargs):
        """Translate Anthropic format to OpenAI format"""
        request_body = AnthropicMessagesRequest(**kwargs)
        return litellm.AnthropicConfig().translate_anthropic_to_openai(
            anthropic_message_request=request_body
        )

    def translate_completion_output_params(self, response):
        """Translate OpenAI response back to Anthropic format"""
        return litellm.AnthropicConfig().translate_openai_response_to_anthropic(
            response=response
        )

anthropic_adapter = AnthropicAdapter()
```

### 2. endpoint 설정

```yaml
model_list:
  - model_name: my-claude-endpoint
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: sk-1234
  pass_through_endpoints:
    - path: "/v1/messages"
      target: custom_callbacks.anthropic_adapter
      headers:
        litellm_user_api_key: "x-api-key"
```

### 3. custom endpoint test 실행 {#3-custom-endpoint-test}

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
  -H 'x-api-key: sk-1234' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'content-type: application/json' \
  -d '{
    "model": "my-claude-endpoint",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, world"}]
  }'
```

---

## Tutorial - Azure OpenAI Assistants API를 Pass Through endpoint로 추가 {#tutorial---azure-openai-assistants-api를-pass-through-endpoint로-추가}

이 video에서는 Azure OpenAI Assistants API를 LiteLLM Proxy의 pass through endpoint로 추가합니다.

<iframe width="840" height="500" src="https://www.loom.com/embed/12965cb299d24fc0bd7b6b413ab6d0ad" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<br/>
<br/>


---

## 문제 해결

### 자주 발생하는 문제

**인증 error:**
- API key가 header에 올바르게 설정되어 있는지 확인하세요.
- target API가 제공된 인증 method를 허용하는지 확인하세요.

**Routing issue:**
- path prefix가 request URL과 일치하는지 확인하세요.
- target URL에 접근 가능한지 확인하세요.
- configuration의 trailing slash를 확인하세요.

**Response error:**
- `--detailed_debug`로 상세 debugging을 활성화하세요.
- error detail은 LiteLLM proxy log에서 확인하세요.
- target API가 기대하는 request format을 확인하세요.

### Team JWT가 pass-through route를 사용하도록 허용

pass-through provider route(예: `/anthropic/*`)를 사용 중이고 JWT team token이 이 route에 access하게 하려면 `litellm_jwtauth`의 `team_allowed_routes`에 `mapped_pass_through_routes`를 추가하거나 관련 route를 명시적으로 추가하세요.

예제 (`proxy_server_config.yaml`):

```yaml
general_settings:
  enable_jwt_auth: True
  litellm_jwtauth:
    team_ids_jwt_field: "team_ids"
    team_allowed_routes: ["openai_routes","info_routes","mapped_pass_through_routes"]
```

### 도움 받기

[데모 예약 👋](https://calendly.com/d/4mp-gd3-k5k/berriai-1-1-onboarding-litellm-hosted-version)

[커뮤니티 Discord 💭](https://discord.gg/wuPM9dRgDw)


이메일 ✉️ ishaan@berri.ai / krrish@berri.ai
