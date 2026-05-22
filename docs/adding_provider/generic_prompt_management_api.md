# [BETA] Generic Prompt Management API - PR 없이 통합하기 {#beta-generic-prompt-management-api---integrate-without-a-pr}

## 문제

prompt management provider가 LiteLLM과 통합하려면 기존에는 보통 다음 작업이 필요했습니다.
- LiteLLM 저장소에 PR 생성
- 검토 및 병합 대기
- LiteLLM 코드베이스 안에서 provider별 코드 유지
- API 변경에 맞춰 통합 업데이트

## 해결 방법

**Generic Prompt Management API**를 사용하면 간단한 API endpoint만 구현해 LiteLLM과 **즉시** 통합할 수 있습니다. PR은 필요하지 않습니다.

### 주요 장점

1. **PR 불필요** - 바로 배포하고 통합 가능
3. **단순한 계약** - 하나의 GET endpoint와 표준 JSON 응답
4. **변수 치환** - `{variable}` 문법으로 prompt variable 지원
5. **Custom parameter** - config를 통해 provider별 query parameter 전달
6. **완전한 제어권** - prompt management API를 직접 소유하고 유지
7. **Model 및 parameter override** - prompt에서 model과 parameter를 선택적으로 override

## 3단계로 시작하기 {#getting-started-in-3-steps}

### 1단계: LiteLLM 설정 {#step-1-configure-litellm}

`config.yaml`에 다음을 추가합니다.

```yaml
prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
      api_key: os.environ/YOUR_API_KEY
```

### 2단계: API endpoint 구현 {#step-2-implement-your-api-endpoint}

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/beta/litellm_prompt_management")
async def get_prompt(prompt_id: str):
    return {
        "prompt_id": prompt_id,
        "prompt_template": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Help me with {task}"}
        ],
        "prompt_template_model": "gpt-4",
        "prompt_template_optional_params": {"temperature": 0.7}
    }
```

### 3단계: App에서 사용 {#step-3-use-in-your-app}

```python
from litellm import completion

response = completion(
    model="gpt-4",
    prompt_id="simple_prompt",
    prompt_variables={"task": "data analysis"},
    messages=[{"role": "user", "content": "I have sales data"}]
)
```

이제 끝입니다. LiteLLM이 prompt를 가져오고 variable을 적용한 뒤 request를 보냅니다.

## API 계약 {#api-contract}

### Endpoint

`GET /beta/litellm_prompt_management`를 구현합니다.

### 요청 형식

endpoint는 query parameter가 포함된 GET request를 받습니다.

```
GET /beta/litellm_prompt_management?prompt_id={prompt_id}&{custom_params}
```

**Query parameter:**
- `prompt_id` (필수): 가져올 prompt의 ID
- Custom parameter: `provider_specific_query_params`에 구성한 추가 parameter

**예제:**
```
GET /beta/litellm_prompt_management?prompt_id=hello-world-prompt-2bac&project_name=litellm&slug=hello-world-prompt-2bac
```

### 응답 형식

```json
{
  "prompt_id": "hello-world-prompt-2bac",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant specialized in {domain}."
    },
    {
      "role": "user",
      "content": "Help me with {task}"
    }
  ],
  "prompt_template_model": "gpt-4",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500,
    "top_p": 0.9
  }
}
```

**응답 필드:**
- `prompt_id` (string, 필수): prompt ID
- `prompt_template` (array, 필수): 선택적 `{variable}` placeholder가 포함된 OpenAI-format message 배열
- `prompt_template_model` (string, 선택 사항): 이 prompt에 사용할 model(`ignore_prompt_manager_model: true`가 아니면 client model override)
- `prompt_template_optional_params` (object, 선택 사항): temperature, max_tokens 등 추가 parameter(`ignore_prompt_manager_optional_params: true`가 아니면 client param과 merge)

## LiteLLM 설정

`config.yaml`에 다음을 추가합니다.

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: openai/gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

prompts:
  - prompt_id: "simple_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      provider_specific_query_params:
        project_name: litellm
        slug: hello-world-prompt-2bac
      api_base: http://localhost:8080
      api_key: os.environ/YOUR_PROMPT_API_KEY  # optional
      ignore_prompt_manager_model: true  # optional, keep client's model
      ignore_prompt_manager_optional_params: true  # optional, don't merge prompt manager's params (e.g. temperature, max_tokens, etc.)
```

### 설정 parameter {#configuration-parameters}

- `prompt_integration`: 반드시 `"generic_prompt_management"`여야 합니다.
- `provider_specific_query_params`: API로 전송할 custom query parameter(optional)
- `api_base`: prompt management API의 base URL
- `api_key`: 인증용 optional API key(`Bearer` token으로 전송)
- `ignore_prompt_manager_model`: `true`이면 prompt의 model 대신 client가 지정한 model 사용(default: `false`)
- `ignore_prompt_manager_optional_params`: `true`이면 prompt의 optional param을 client param과 merge하지 않음(default: `false`)

## 사용법

### LiteLLM SDK와 사용 {#using-with-litellm-sdk}

**prompt ID를 사용하는 기본 예제:**

```python
from litellm import completion

response = completion(
    model="gpt-4",
    prompt_id="simple_prompt",
    messages=[{"role": "user", "content": "Additional message"}]
)
```

**prompt variable 사용:**

```python
response = completion(
    model="gpt-4",
    prompt_id="simple_prompt",
    prompt_variables={
        "domain": "data science",
        "task": "analyzing customer churn"
    },
    messages=[{"role": "user", "content": "Please provide a detailed analysis"}]
)
```

prompt template에서 `{domain}`은 "data science"로, `{task}`는 "analyzing customer churn"으로 대체됩니다.

### LiteLLM Proxy와 사용 {#using-with-litellm-proxy}

**1. 설정 파일로 프록시 시작:**

```bash
litellm --config /path/to/config.yaml
```

**2. prompt_id로 request 보내기:**

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "prompt_id": "simple_prompt",
    "prompt_variables": {
      "domain": "healthcare",
      "task": "patient risk assessment"
    },
    "messages": [
      {"role": "user", "content": "Analyze the following data..."}
    ]
  }'
```

**3. OpenAI SDK와 사용:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234"
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Analyze the data"}
    ],
    extra_body={
        "prompt_id": "simple_prompt",
        "prompt_variables": {
            "domain": "finance",
            "task": "fraud detection"
        }
    }
)
```

## 구현 예제

여러 예제 prompt, 인증, convenience endpoint를 포함한 전체 참조 구현은 [mock_prompt_management_server.py](https://github.com/BerriAI/litellm/blob/main/cookbook/mock_prompt_management_server/mock_prompt_management_server.py)를 참고하세요.

**최소 FastAPI 예제:**

```python
from fastapi import FastAPI, HTTPException, Header
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

app = FastAPI()

# In-memory prompt storage (replace with your database)
PROMPTS = {
    "hello-world-prompt": {
        "prompt_id": "hello-world-prompt",
        "prompt_template": [
            {
                "role": "system",
                "content": "You are a helpful assistant specialized in {domain}."
            },
            {
                "role": "user", 
                "content": "Help me with: {task}"
            }
        ],
        "prompt_template_model": "gpt-4",
        "prompt_template_optional_params": {
            "temperature": 0.7,
            "max_tokens": 500
        }
    },
    "code-review-prompt": {
        "prompt_id": "code-review-prompt",
        "prompt_template": [
            {
                "role": "system",
                "content": "You are an expert code reviewer. Review code for {language}."
            },
            {
                "role": "user",
                "content": "Review the following code:\n\n{code}"
            }
        ],
        "prompt_template_model": "gpt-4-turbo",
        "prompt_template_optional_params": {
            "temperature": 0.3,
            "max_tokens": 1000
        }
    }
}

class PromptResponse(BaseModel):
    prompt_id: str
    prompt_template: List[Dict[str, str]]
    prompt_template_model: Optional[str] = None
    prompt_template_optional_params: Optional[Dict[str, Any]] = None

@app.get("/beta/litellm_prompt_management", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    authorization: Optional[str] = Header(None),
    project_name: Optional[str] = None,
    slug: Optional[str] = None,
):
    """
    Get a prompt by ID with optional filtering by project_name and slug.
    
    Args:
        prompt_id: The ID of the prompt to fetch
        authorization: Optional Bearer token for authentication
        project_name: Optional project name filter
        slug: Optional slug filter
    """
    
    # Optional: Validate authorization
    if authorization:
        token = authorization.replace("Bearer ", "")
        # Validate your token here
        if not is_valid_token(token):
            raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Optional: Apply additional filtering based on custom params
    if project_name or slug:
        # You can use these parameters to filter or validate access
        # For example, check if the user has access to this project
        pass
    
    # Fetch the prompt from your storage
    if prompt_id not in PROMPTS:
        raise HTTPException(
            status_code=404,
            detail=f"Prompt '{prompt_id}' not found"
        )
    
    prompt_data = PROMPTS[prompt_id]
    
    return PromptResponse(**prompt_data)

def is_valid_token(token: str) -> bool:
    """Validate API token - implement your logic here"""
    # Example: Check against your database or secret store
    valid_tokens = ["your-secret-token", "another-valid-token"]
    return token in valid_tokens

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Optional: List all prompts endpoint
@app.get("/prompts")
async def list_prompts(authorization: Optional[str] = Header(None)):
    """List all available prompts"""
    if authorization:
        token = authorization.replace("Bearer ", "")
        if not is_valid_token(token):
            raise HTTPException(status_code=401, detail="Invalid API key")
    
    return {
        "prompts": [
            {"prompt_id": pid, "model": p.get("prompt_template_model")}
            for pid, p in PROMPTS.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

### 예제 server 실행 {#running-the-example-server}

1. 의존성 설치:
```bash
uv add fastapi uvicorn
```

2. 위 코드를 `prompt_server.py`로 저장합니다.

3. server를 실행합니다.
```bash
python prompt_server.py
```

4. endpoint를 test합니다.
```bash
curl "http://localhost:8080/beta/litellm_prompt_management?prompt_id=hello-world-prompt&project_name=litellm&slug=hello-world-prompt-2bac"
```

예상 response:
```json
{
  "prompt_id": "hello-world-prompt",
  "prompt_template": [
    {
      "role": "system",
      "content": "You are a helpful assistant specialized in {domain}."
    },
    {
      "role": "user",
      "content": "Help me with: {task}"
    }
  ],
  "prompt_template_model": "gpt-4",
  "prompt_template_optional_params": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

## 고급 기능

### 변수 치환 {#variable-substitution}

LiteLLM은 `{variable}` 문법을 사용해 prompt template의 variable을 자동으로 대체합니다. `{variable}`과 `{{variable}}` 형식을 모두 지원합니다.

**예제 prompt template:**
```json
{
  "prompt_template": [
    {
      "role": "system",
      "content": "You are an expert in {domain} with {years} years of experience."
    }
  ]
}
```

**Client request:**
```python
completion(
    model="gpt-4",
    prompt_id="expert_prompt",
    prompt_variables={
        "domain": "machine learning",
        "years": "10"
    }
)
```

**결과:**
```
"You are an expert in machine learning with 10 years of experience."
```

### 캐싱

LiteLLM은 가져온 prompt를 memory에 자동 cache합니다. cache key에는 다음이 포함됩니다.
- `prompt_id`
- `prompt_label` (제공된 경우)
- `prompt_version` (제공된 경우)

즉, API endpoint는 고유한 prompt configuration마다 한 번만 호출됩니다.

### Model override 동작 {#model-override-behavior}

**기본 동작(`ignore_prompt_manager_model` 없음):**
```yaml
prompts:
  - prompt_id: "my_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
```

API가 `"prompt_template_model": "gpt-4"`를 반환하면 client가 무엇을 지정했는지와 관계없이 LiteLLM은 `gpt-4`를 사용합니다.

**`ignore_prompt_manager_model: true` 사용:**
```yaml
prompts:
  - prompt_id: "my_prompt"
    litellm_params:
      prompt_integration: "generic_prompt_management"
      api_base: http://localhost:8080
      ignore_prompt_manager_model: true
```

LiteLLM은 prompt의 model을 무시하고 client가 지정한 model을 사용합니다.

### Parameter merge 동작 {#parameter-merge-behavior}

**기본 동작(`ignore_prompt_manager_optional_params` 없음):**

Client param은 prompt param과 merge되며, prompt param이 우선합니다.
```python
# Prompt returns: {"temperature": 0.7, "max_tokens": 500}
# Client sends: {"temperature": 0.9, "top_p": 0.95}
# Final params: {"temperature": 0.7, "max_tokens": 500, "top_p": 0.95}
```

**`ignore_prompt_manager_optional_params: true` 사용:**

client param만 사용됩니다.
```python
# Prompt returns: {"temperature": 0.7, "max_tokens": 500}
# Client sends: {"temperature": 0.9, "top_p": 0.95}
# Final params: {"temperature": 0.9, "top_p": 0.95}
```

## 보안 고려사항 {#security-considerations}

1. **인증**: `api_key` parameter로 prompt management API를 보호하세요.
2. **Authorization**: custom query parameter를 사용해 team/user 기반 access control을 구현하세요.
3. **Rate limiting**: API abuse를 방지하려면 rate limiting을 추가하세요.
4. **Input validation**: 처리 전에 모든 query parameter를 검증하세요.
5. **HTTPS**: production에서는 encrypted communication을 위해 항상 HTTPS를 사용하세요.
6. **Secrets**: API key는 config file이 아니라 environment variable에 저장하세요.

## 사용 사례 {#use-case}

✅ **다음 경우 Generic Prompt Management API를 사용하세요.**
- PR을 기다리지 않고 즉시 integration하고 싶은 경우
- 자체 prompt management service를 유지하는 경우
- prompt versioning과 update를 완전히 제어해야 하는 경우
- custom prompt management feature를 만들고 싶은 경우
- 내부 system과 integration해야 하는 경우

✅ **일반적인 scenario:**
- organization 내부 prompt management system
- team 기반 access control을 갖춘 multi-tenant prompt management
- 서로 다른 `prompt version` A/B 테스트
- prompt experimentation 및 analytics
- 기존 prompt engineering workflow와 integration

## 사용 시점

✅ **다음 경우 Generic Prompt Management API를 사용하세요.**
- PR을 기다리지 않고 즉시 integration하고 싶은 경우
- 자체 prompt management service를 유지하는 경우
- update와 feature를 완전히 제어해야 하는 경우
- custom prompt storage 및 versioning logic이 필요한 경우

❌ **다음 경우 PR을 만드세요.**
- LiteLLM 내부와 더 깊은 integration이 필요한 경우
- integration에 복잡한 LiteLLM-specific logic이 필요한 경우
- built-in provider로 노출되고 싶은 경우
- community가 재사용할 수 있는 integration을 만드는 경우

## 문제 해결

### Prompt를 찾을 수 없음 {#prompt-not-found}
- `prompt_id`가 정확히 일치하는지 확인하세요(case-sensitive).
- API endpoint가 LiteLLM에서 접근 가능한지 확인하세요.
- `api_key`를 사용한다면 authentication을 확인하세요.

### Variable이 대체되지 않음
- variable이 `{variable}` 또는 `{{variable}}` syntax를 사용하는지 확인하세요.
- `prompt_variables`의 variable name이 template과 정확히 일치하는지 확인하세요.
- variable은 case-sensitive입니다.

### Model이 override되지 않음
- config에 `ignore_prompt_manager_model: true`가 설정되어 있는지 확인하세요.
- API가 response에서 `prompt_template_model`을 반환하는지 확인하세요.

### Parameter가 적용되지 않음
- `ignore_prompt_manager_optional_params: true`가 설정되어 있는지 확인하세요.
- API가 `prompt_template_optional_params`를 반환하는지 확인하세요.
- parameter name이 OpenAI parameter name과 일치하는지 확인하세요.

## 질문

이 기능은 **beta API**입니다. feedback을 기반으로 계속 개선하고 있습니다. 추가 기능이 필요하면 issue 또는 PR을 열어 주세요.

## 관련 문서

- [Prompt Management 개요](../proxy/prompt_management.md)
- [Generic Guardrail API 문서](./generic_guardrail_api.md)
- [LiteLLM Proxy 설정](../proxy/quick_start.md)
