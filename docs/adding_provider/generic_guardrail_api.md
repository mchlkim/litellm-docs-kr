# [BETA] Generic Guardrail API - PR 없이 통합하기 {#beta-generic-guardrail-api---integrate-without-a-pr}

## 문제

guardrail provider가 LiteLLM과 통합하려면 기존에는 보통 다음 작업이 필요했습니다.
- LiteLLM 저장소에 PR 생성
- review 및 merge 대기
- LiteLLM codebase 안에서 provider별 코드 유지
- API 변경에 맞춰 통합 업데이트

## 해결 방법

**Generic Guardrail API**를 사용하면 간단한 API endpoint만 구현해 LiteLLM과 **즉시** 통합할 수 있습니다. PR은 필요하지 않습니다.

### 주요 장점

1. **PR 불필요** - 바로 배포하고 통합 가능
2. **범용 지원** - 모든 LiteLLM endpoint(chat, embeddings, image generation 등)에서 동작
3. **단순한 계약** - 하나의 endpoint와 세 가지 응답 유형
4. **Multi-modal 지원** - request/response의 text와 image를 모두 처리
5. **Custom parameter** - config를 통해 provider-specific param 전달
6. **완전한 제어권** - guardrail API를 직접 소유하고 유지

## 지원 엔드포인트

Generic Guardrail API는 다음 LiteLLM endpoint와 함께 동작합니다.

- `/v1/chat/completions` - `OpenAI Chat Completions`
- `/v1/completions` - `OpenAI Text Completions`
- `/v1/responses` - `OpenAI Responses API`
- `/v1/images/generations` - `OpenAI Image Generation`
- `/v1/audio/transcriptions` - `OpenAI Audio Transcriptions`
- `/v1/audio/speech` - `OpenAI Text-to-Speech`
- `/v1/messages` - Anthropic Messages
- `/v1/rerank` - Cohere Rerank
- `Pass-through` endpoint

## 동작 방식

1. LiteLLM이 request(chat messages, embeddings, image prompts 등)에서 text와 image를 추출합니다.
2. 추출된 content와 metadata를 API endpoint로 보냅니다.
3. API가 `BLOCKED`, `NONE`, `GUARDRAIL_INTERVENED` 중 하나로 응답합니다.
4. LiteLLM이 결정을 적용하고 필요한 수정을 반영합니다.

## API 계약 {#api-contract}

### 엔드포인트 {#endpoint}

`POST /beta/litellm_basic_guardrail_api`를 구현합니다.

### 요청 형식

```json
{
  "texts": ["extracted text from the request"],  // array of text strings
  "images": ["base64_encoded_image_data"],  // optional array of images
  "tools": [  // tool calls sent to the LLM (in the OpenAI Chat Completions spec)
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string"}
          }
        }
      }
    }
  ],
  "tool_calls": [  // tool calls received from the LLM (in the OpenAI Chat Completions spec)
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"location\": \"San Francisco\"}"
      }
    }
  ],
  "structured_messages": [  // optional, full messages in OpenAI format (for chat endpoints)
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"}
  ],
  "request_data": {
    "user_api_key_hash": "hash of the litellm virtual key used",
    "user_api_key_alias": "alias of the litellm virtual key used",
    "user_api_key_user_id": "user id associated with the litellm virtual key used",
    "user_api_key_user_email": "user email associated with the litellm virtual key used",
    "user_api_key_team_id": "team id associated with the litellm virtual key used",
    "user_api_key_team_alias": "team alias associated with the litellm virtual key used",
    "user_api_key_end_user_id": "end user id associated with the litellm virtual key used",
    "user_api_key_org_id": "org id associated with the litellm virtual key used"
  },
  "request_headers": {  // optional: inbound request headers (allowlist). Allowed headers show their value; all others show "[present]" to indicate the header existed.
    "User-Agent": "OpenAI/Python 2.17.0",
    "Content-Type": "application/json",
    "X-Request-Id": "[present]"
  },
  "litellm_version": "1.x.y",  // optional: LiteLLM library version running this proxy
  "input_type": "request",  // "request" or "response"
  "litellm_call_id": "unique_call_id",  // the call id of the individual LLM call
  "litellm_trace_id": "trace_id",  // the trace id of the LLM call - useful if there are multiple LLM calls for the same conversation
  "additional_provider_specific_params": {
    // your custom params from config
  }
}
```

### 응답 형식

```json
{
  "action": "BLOCKED" | "NONE" | "GUARDRAIL_INTERVENED",
  "blocked_reason": "why content was blocked",  // required if action=BLOCKED
  "texts": ["modified text"],  // optional array of modified text strings
  "images": ["modified_base64_image"]  // optional array of modified images
}
```

**동작:**
- `BLOCKED` - LiteLLM이 error를 발생시키고 request를 block합니다.
- `NONE` - request가 변경 없이 진행됩니다.
- `GUARDRAIL_INTERVENED` - 수정된 texts/images와 함께 request가 진행됩니다(`texts` 및/또는 `images` field 제공).

## 매개변수 {#parameters}

### `tools` 매개변수 {#tools-parameter}

`tools` parameter는 request에서 사용할 수 있는 function/tool definition 정보를 제공합니다.

**형식:** OpenAI `ChatCompletionToolParam` 형식([OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools) 참고)

**예제:**
```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get the current weather in a location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City and state, e.g. San Francisco, CA"
        },
        "unit": {
          "type": "string",
          "enum": ["celsius", "fahrenheit"]
        }
      },
      "required": ["location"]
    }
  }
}
```

**가용성:**
- **입력 전용:** Tools는 `input_type="request"`(pre-call guardrails)에서만 전달됩니다. Output/response guardrail은 현재 tool definition을 받지 않습니다.
- **지원 endpoint:** `tools` parameter는 `/v1/chat/completions`, `/v1/responses`, `/v1/messages`에서 지원됩니다. 다른 endpoint에는 tool support가 없습니다.

**사용 사례:**
- tool permission policy 적용(예: 특정 user/team만 특정 tool에 access 허용)
- LLM으로 보내기 전 tool schema 검증
- audit 목적의 tool usage logging
- user context를 기준으로 sensitive tool block

### `tool_calls` 매개변수 {#tool_calls-parameter}

`tool_calls` parameter에는 request 또는 response에서 실제로 수행되는 function/tool invocation이 포함됩니다.

**형식:** OpenAI `ChatCompletionMessageToolCall` 형식([OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/object#chat/object-tool_calls) 참고)

**예제:**
```json
{
  "id": "call_abc123",
  "type": "function",
  "function": {
    "name": "get_weather",
    "arguments": "{\"location\": \"San Francisco\", \"unit\": \"celsius\"}"
  }
}
```

**`tools`와의 주요 차이:**
- **`tools`** = tool definitions/schemas(어떤 tool을 *사용할 수 있는지*)
- **`tool_calls`** = tool invocations/executions(어떤 tool이 어떤 argument로 *호출되는지*)

**가용성:**
- **입력과 출력 모두:** Tool call은 `input_type="request"`(tool call을 요청하는 assistant message)와 `input_type="response"`(tool call이 포함된 LLM response)에 모두 있을 수 있습니다.
- **지원 endpoint:** `tool_calls` parameter는 `/v1/chat/completions`, `/v1/responses`, `/v1/messages`에서 지원됩니다.

**사용 사례:**
- 실행 전 tool call argument 검증
- tool call argument에서 sensitive data redact(예: PII)
- audit/debugging을 위한 tool invocation logging
- dangerous parameter가 포함된 tool call block
- tool call argument 수정(예: constraint 적용, input sanitize)
- user/team 전반의 tool usage pattern monitor

### `structured_messages` 매개변수 {#structured_messages-parameter}

`structured_messages` parameter는 OpenAI chat completion spec format의 전체 input을 제공합니다. system message와 user message를 구분할 때 유용합니다.

**형식:** OpenAI chat completion message array([OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages) 참고)

**예제:**
```json
[
  {"role": "system", "content": "You are a helpful assistant"},
  {"role": "user", "content": "Hello"}
]
```

**가용성:**
- **지원 endpoint:** `/v1/chat/completions`, `/v1/messages`, `/v1/responses`
- **입력 전용:** `input_type="request"`(pre-call guardrails)에서만 전달됩니다.

**사용 사례:**
- system message와 user message에 서로 다른 policy 적용
- role-based content restriction 적용
- 구조화된 대화 context logging

## LiteLLM 설정

`config.yaml`에 다음을 추가합니다.

```yaml
litellm_settings:
  guardrails:
    - guardrail_name: "my-guardrail"
      litellm_params:
        guardrail: generic_guardrail_api
        mode: pre_call  # or post_call, during_call
        api_base: https://your-guardrail-api.com
        api_key: os.environ/YOUR_GUARDRAIL_API_KEY  # optional
        unreachable_fallback: fail_closed  # default: fail_closed. Set to fail_open to proceed if the guardrail endpoint is unreachable (network errors, or HTTP 502/503/504 from an upstream proxy/LB).
        additional_provider_specific_params:
          # your custom parameters
          threshold: 0.8
          language: "en"
```

### 정적 및 동적 header {#static-and-dynamic-headers}

guardrail endpoint로 두 종류의 header를 보낼 수 있습니다.

- **Static headers** (`headers`): guardrail로 보내는 **모든** request에 함께 전송되는 key/value map입니다. API key, `X-Service-Name` 같은 고정값에 사용하세요. `litellm_params`에서 구성합니다.

  ```yaml
  litellm_params:
    guardrail: generic_guardrail_api
    api_base: https://your-guardrail-api.com
    headers:
      X-Service-Name: "my-app"
      X-API-Key: "secret"
  ```

- **Dynamic headers** (`extra_headers`): **client request**에서 guardrail로 forward할 **header name** list입니다. 이 list에 있는 header와 `x-litellm-*` 같은 작은 default allowlist만 value가 전송되고, 나머지는 `[present]`로 전송됩니다. client-provided header(예: `x-request-id`, `x-correlation-id`)를 pass through할 때 사용하세요. `litellm_params`에서 구성합니다.

  ```yaml
  litellm_params:
    guardrail: generic_guardrail_api
    api_base: https://your-guardrail-api.com
    extra_headers:
      - x-request-id
      - x-correlation-id
      - x-custom-auth
  ```

이는 [MCP static and extra headers](/litellm-docs-kr/docs/mcp#forwarding-custom-headers-to-mcp-servers) 동작과 같습니다.

### 예제: Pillar Security {#example-pillar-security}

[Pillar Security](https://pillar.security)는 Generic Guardrail API를 사용해 prompt injection 방어, PII/PCI 탐지, secret 탐지, content moderation을 포함한 포괄적인 AI security scanning을 제공합니다.

```yaml
guardrails:
  - guardrail_name: "pillar-security"
    litellm_params:
      guardrail: generic_guardrail_api
      mode: [pre_call, post_call]
      api_base: https://api.pillar.security/api/v1/integrations/litellm
      api_key: os.environ/PILLAR_API_KEY
      default_on: true
      additional_provider_specific_params:
        plr_mask: true      # Enable automatic masking of sensitive data
        plr_evidence: true  # Include detection evidence in response
        plr_scanners: true  # Include scanner details in response
```

전체 configuration option은 [Pillar Security documentation](../proxy/guardrails/pillar_security.md)을 참고하세요.

## 사용법

사용자는 guardrail name으로 guardrail을 적용합니다.

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "hello"}],
    guardrails=["my-guardrail"]
)
```

또는 dynamic parameter와 함께 사용할 수 있습니다.

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "hello"}],
    guardrails=[{
        "my-guardrail": {
            "extra_body": {
                "custom_threshold": 0.9
            }
        }
    }]
)
```

## 구현 예제

전체 reference implementation은 [mock_bedrock_guardrail_server.py](https://github.com/BerriAI/litellm/blob/main/cookbook/mock_guardrail_server/mock_bedrock_guardrail_server.py)를 참고하세요.

**최소 FastAPI 예제:**

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI()

class GuardrailRequest(BaseModel):
    texts: List[str]
    images: Optional[List[str]] = None
    tools: Optional[List[Dict[str, Any]]] = None  # OpenAI ChatCompletionToolParam format (tool definitions)
    tool_calls: Optional[List[Dict[str, Any]]] = None  # OpenAI ChatCompletionMessageToolCall format (tool invocations)
    structured_messages: Optional[List[Dict[str, Any]]] = None  # OpenAI messages format (for chat endpoints)
    request_data: Dict[str, Any]
    input_type: str  # "request" or "response"
    litellm_call_id: Optional[str] = None
    litellm_trace_id: Optional[str] = None
    additional_provider_specific_params: Dict[str, Any]

class GuardrailResponse(BaseModel):
    action: str  # BLOCKED, NONE, or GUARDRAIL_INTERVENED
    blocked_reason: Optional[str] = None
    texts: Optional[List[str]] = None
    images: Optional[List[str]] = None

@app.post("/beta/litellm_basic_guardrail_api")
async def apply_guardrail(request: GuardrailRequest):
    # Your guardrail logic here
    
    # Example: Check text content
    for text in request.texts:
        if "badword" in text.lower():
            return GuardrailResponse(
                action="BLOCKED",
                blocked_reason="Content contains prohibited terms"
            )
    
    # Example: Check tool definitions (if present in request)
    if request.tools:
        for tool in request.tools:
            if tool.get("type") == "function":
                function_name = tool.get("function", {}).get("name", "")
                # Block sensitive tool definitions
                if function_name in ["delete_data", "access_admin_panel"]:
                    return GuardrailResponse(
                        action="BLOCKED",
                        blocked_reason=f"Tool '{function_name}' is not allowed"
                    )
    
    # Example: Check tool calls (if present in request or response)
    if request.tool_calls:
        for tool_call in request.tool_calls:
            if tool_call.get("type") == "function":
                function_name = tool_call.get("function", {}).get("name", "")
                arguments_str = tool_call.get("function", {}).get("arguments", "{}")
                
                # Parse arguments and validate
                import json
                try:
                    arguments = json.loads(arguments_str)
                    # Block dangerous arguments
                    if "file_path" in arguments and ".." in str(arguments["file_path"]):
                        return GuardrailResponse(
                            action="BLOCKED",
                            blocked_reason="Tool call contains path traversal attempt"
                        )
                except json.JSONDecodeError:
                    pass
    
    # Example: Check structured messages (if present in request)
    if request.structured_messages:
        for message in request.structured_messages:
            if message.get("role") == "system":
                # Apply stricter policies to system messages
                if "admin" in message.get("content", "").lower():
                    return GuardrailResponse(
                        action="BLOCKED",
                        blocked_reason="System message contains restricted terms"
                    )
    
    return GuardrailResponse(action="NONE")
```

## 사용 시점

✅ **다음 경우 Generic Guardrail API를 사용하세요.**
- PR을 기다리지 않고 즉시 통합하고 싶은 경우
- 자체 guardrail service를 유지하는 경우
- update와 feature를 완전히 제어해야 하는 경우
- 모든 LiteLLM endpoint를 자동으로 지원하고 싶은 경우

❌ **다음 경우 PR을 만드세요.**
- LiteLLM 내부와 더 깊은 통합이 필요한 경우
- guardrail에 복잡한 LiteLLM-specific logic이 필요한 경우
- built-in provider로 노출되고 싶은 경우

## 질문

이 기능은 **beta API**입니다. feedback을 기반으로 계속 개선하고 있습니다. 추가 기능이 필요하면 issue 또는 PR을 열어 주세요.
