import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 커스텀 코드 Guardrail {#custom-code-guardrail}

샌드박스 환경에서 실행되는 Python 유사 코드로 커스텀 guardrail 로직을 작성합니다.

## 빠른 시작

### 1. config에서 guardrail 정의 {#1-define-the-guardrail-in-config}

```yaml
model_list:
    - model_name: gpt-4
        litellm_params:
        model: gpt-4
        api_key: os.environ/OPENAI_API_KEY

guardrails:
    - guardrail_name: block-ssn
        litellm_params:
        guardrail: custom_code
        mode: pre_call
        custom_code: |
            def apply_guardrail(inputs, request_data, input_type):
                for text in inputs["texts"]:
                    if regex_match(text, r"\d{3}-\d{2}-\d{4}"):
                        return block("SSN detected")
                return allow()
```

### 2. proxy 시작 {#2-start-proxy}

```bash
litellm --config config.yaml
```

### 3. 테스트 {#3-test}

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "My SSN is 123-45-6789"}],
    "guardrails": ["block-ssn"]
  }'
```

## 설정

| Parameter | 타입 | 필수 | 설명 |
|-----------|------|----------|-------------|
| `guardrail` | string | ✅ | `custom_code`여야 합니다 |
| `mode` | string | ✅ | 실행 시점: `pre_call`, `post_call`, `during_call` |
| `custom_code` | string | ✅ | `apply_guardrail` 함수가 포함된 Python 유사 코드 |
| `default_on` | bool | ❌ | 모든 요청에서 실행합니다(기본값: `false`) |

## 커스텀 코드 작성 {#writing-custom-code}

### 함수 시그니처 {#function-signature}

코드는 `apply_guardrail` 함수를 정의해야 합니다. 이 함수는 sync 또는 async일 수 있습니다.

```python
# Sync version
def apply_guardrail(inputs, request_data, input_type):
    # inputs: see table below
    # request_data: {"model": "...", "user_id": "...", "team_id": "...", "metadata": {...}}
    # input_type: "request" or "response"
    
    return allow()  # or block() or modify()

# Async version (recommended when using HTTP primitives)
async def apply_guardrail(inputs, request_data, input_type):
    response = await http_post("https://api.example.com/check", body={"text": inputs["texts"][0]})
    if response["success"] and response["body"].get("flagged"):
        return block("Content flagged")
    return allow()
```

### `inputs` Parameter {#inputs-parameter}

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `texts` | `List[str]` | 요청/응답에서 추출된 텍스트 |
| `images` | `List[str]` | 추출된 이미지(image guardrails용) |
| `tools` | `List[dict]` | LLM으로 전송된 tools |
| `tool_calls` | `List[dict]` | LLM에서 반환된 tool calls |
| `structured_messages` | `List[dict]` | role 정보(system/user/assistant)가 포함된 전체 messages |
| `model` | `str` | 사용 중인 model |

### `request_data` Parameter {#request_data-parameter}

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `model` | `str` | Model 이름 |
| `user_id` | `str` | API key에서 가져온 User ID |
| `team_id` | `str` | API key에서 가져온 Team ID |
| `end_user_id` | `str` | End user ID |
| `metadata` | `dict` | 요청 metadata |

### 반환 값 {#return-values}

| 함수 | 설명 |
|----------|-------------|
| `allow()` | 요청/응답을 통과시킵니다 |
| `block(reason)` | 메시지와 함께 거부합니다 |
| `modify(texts=[], images=[], tool_calls=[])` | 콘텐츠를 변환합니다 |

## 기본 제공 Primitives {#built-in-primitives}

### Regex

| 함수 | 설명 |
|----------|-------------|
| `regex_match(text, pattern)` | pattern이 발견되면 `True`를 반환합니다 |
| `regex_replace(text, pattern, replacement)` | 모든 match를 교체합니다 |
| `regex_find_all(text, pattern)` | match 목록을 반환합니다 |

### JSON

| 함수 | 설명 |
|----------|-------------|
| `json_parse(text)` | JSON 문자열을 parse하고, 오류 시 `None`을 반환합니다 |
| `json_stringify(obj)` | JSON 문자열로 변환합니다 |
| `json_schema_valid(obj, schema)` | JSON schema를 기준으로 검증합니다 |

### URL

| 함수 | 설명 |
|----------|-------------|
| `extract_urls(text)` | 텍스트에서 모든 URL을 추출합니다 |
| `is_valid_url(url)` | URL이 유효한지 확인합니다 |
| `all_urls_valid(text)` | 텍스트의 모든 URL이 유효한지 확인합니다 |

### 코드 감지 {#code-detection}

| 함수 | 설명 |
|----------|-------------|
| `detect_code(text)` | 코드가 감지되면 `True`를 반환합니다 |
| `detect_code_languages(text)` | 감지된 언어 목록을 반환합니다 |
| `contains_code_language(text, ["sql", "python"])` | 특정 언어가 포함되어 있는지 확인합니다 |

### 텍스트 유틸리티 {#text-utilities}

| 함수 | 설명 |
|----------|-------------|
| `contains(text, substring)` | substring이 존재하는지 확인합니다 |
| `contains_any(text, [substr1, substr2])` | substring 중 하나라도 존재하는지 확인합니다 |
| `word_count(text)` | 단어 수를 셉니다 |
| `char_count(text)` | 문자 수를 셉니다 |
| `lower(text)` / `upper(text)` / `trim(text)` | 문자열을 변환합니다 |

### HTTP 요청(Async) {#http-requests-async}

추가 검증 또는 content moderation을 위해 외부 API에 async HTTP 요청을 보냅니다.

| 함수 | 설명 |
|----------|-------------|
| `await http_request(url, method, headers, body, timeout)` | 일반 async HTTP 요청 |
| `await http_get(url, headers, timeout)` | Async GET 요청 |
| `await http_post(url, body, headers, timeout)` | Async POST 요청 |

**응답 형식:**
```python
{
    "status_code": 200,        # HTTP status code
    "body": {...},             # Response body (parsed JSON or string)
    "headers": {...},          # Response headers
    "success": True,           # True if status code is 2xx
    "error": None              # Error message if request failed
}
```

**참고:** HTTP primitives를 사용할 때는 non-blocking 실행을 위해 함수를 `async def apply_guardrail(...)`로 정의합니다.

## 예제

### PII(SSN) 차단 {#block-pii-ssn}

```python
def apply_guardrail(inputs, request_data, input_type):
    for text in inputs["texts"]:
        if regex_match(text, r"\d{3}-\d{2}-\d{4}"):
            return block("SSN detected")
    return allow()
```

### 이메일 주소 마스킹 {#redact-email-addresses}

```python
def apply_guardrail(inputs, request_data, input_type):
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    modified = []
    for text in inputs["texts"]:
        modified.append(regex_replace(text, pattern, "[EMAIL REDACTED]"))
    return modify(texts=modified)
```

### SQL Injection 차단 {#block-sql-injection}

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "request":
        return allow()
    for text in inputs["texts"]:
        if contains_code_language(text, ["sql"]):
            return block("SQL code not allowed")
    return allow()
```

### JSON 응답 검증 {#validate-json-response}

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "response":
        return allow()
    
    schema = {
        "type": "object",
        "required": ["name", "value"]
    }
    
    for text in inputs["texts"]:
        obj = json_parse(text)
        if obj is None:
            return block("Invalid JSON response")
        if not json_schema_valid(obj, schema):
            return block("Response missing required fields")
    return allow()
```

### 응답의 URL 확인 {#check-urls-in-response}

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "response":
        return allow()
    for text in inputs["texts"]:
        if not all_urls_valid(text):
            return block("Response contains invalid URLs")
    return allow()
```

### 외부 Moderation API 호출(Async) {#call-external-moderation-api-async}

```python
async def apply_guardrail(inputs, request_data, input_type):
    # Call an external moderation API
    for text in inputs["texts"]:
        response = await http_post(
            "https://api.example.com/moderate",
            body={"text": text, "user_id": request_data["user_id"]},
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            timeout=10
        )
        
        if not response["success"]:
            # API call failed - decide whether to allow or block
            return allow()
        
        if response["body"].get("flagged"):
            return block(response["body"].get("reason", "Content flagged"))
    
    return allow()
```

### 여러 검사 결합 {#combine-multiple-checks}

```python
def apply_guardrail(inputs, request_data, input_type):
    modified = []
    
    for text in inputs["texts"]:
        # Redact SSN
        text = regex_replace(text, r"\d{3}-\d{2}-\d{4}", "[SSN]")
        # Redact credit cards
        text = regex_replace(text, r"\d{16}", "[CARD]")
        modified.append(text)
    
    # Block SQL in requests
    if input_type == "request":
        for text in inputs["texts"]:
            if contains_code_language(text, ["sql"]):
                return block("SQL injection blocked")
    
    return modify(texts=modified)
```

## Sandbox 제한 사항 {#sandbox-restrictions}

커스텀 코드는 제한된 환경에서 실행됩니다.

- ❌ `import` 문 없음
- ❌ file I/O 없음
- ❌ `exec()` 또는 `eval()` 없음
- ✅ 기본 제공 `http_request`, `http_get`, `http_post` primitives를 통한 HTTP 요청
- ✅ LiteLLM에서 제공하는 primitives만 사용 가능

## 요청별 사용법 {#per-request-usage}

요청별로 guardrail을 활성화합니다.

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["block-ssn"]
  }'
```

## 기본 활성화 {#default-on}

모든 요청에서 guardrail을 실행합니다.

```yaml
litellm_settings:
  guardrails:
    - guardrail_name: block-ssn
      litellm_params:
        guardrail: custom_code
        mode: pre_call
        default_on: true
        custom_code: |
          def apply_guardrail(inputs, request_data, input_type):
              ...
```
