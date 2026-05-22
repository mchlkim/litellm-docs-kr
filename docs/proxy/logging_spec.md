
# StandardLoggingPayload 사양

`kwargs["standard_logging_object"]` 아래에서 확인할 수 있습니다. 성공 및 실패 응답마다 기록되는 표준 payload입니다.

## `StandardLoggingPayload`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `id` | `str` | 고유 식별자 |
| `trace_id` | `str` | 같은 전체 요청에 속한 여러 LLM 호출 추적 |
| `call_type` | `str` | 호출 유형 |
| `response_cost` | `float` | 응답 비용(USD) |
| `cost_breakdown` | `Optional[CostBreakdown]` | 상세 비용 세부 내역 객체 |
| `response_cost_failure_debug_info` | `StandardLoggingModelCostFailureDebugInformation` | 비용 추적 실패 시 debug 정보 |
| `status` | `StandardLoggingPayloadStatus` | payload 상태 |
| `status_fields` | `StandardLoggingPayloadStatusFields` | 필터링과 분석을 쉽게 하기 위한 typed 상태 필드 |
| `total_tokens` | `int` | 전체 token 수 |
| `prompt_tokens` | `int` | prompt token 수 |
| `completion_tokens` | `int` | completion token 수 |
| `startTime` | `float` | 호출 시작 시간 |
| `endTime` | `float` | 호출 종료 시간 |
| `completionStartTime` | `float` | streaming 요청에서 첫 token까지 걸린 시간 |
| `response_time` | `float` | 전체 응답 시간. streaming이면 첫 token까지 걸린 시간 |
| `model_map_information` | `StandardLoggingModelInformation` | 모델 매핑 정보 |
| `model` | `str` | 요청에 보낸 모델 이름 |
| `model_id` | `Optional[str]` | 사용된 deployment의 모델 ID |
| `model_group` | `Optional[str]` | 요청에 사용된 `model_group` |
| `api_base` | `str` | LLM API base URL |
| `metadata` | `StandardLoggingMetadata` | metadata 정보 |
| `cache_hit` | `Optional[bool]` | cache hit 여부 |
| `cache_key` | `Optional[str]` | 선택적 cache key |
| `saved_cache_cost` | `float` | cache로 절감된 비용 |
| `request_tags` | `list` | 요청 tag 목록 |
| `end_user` | `Optional[str]` | 선택적 최종 사용자 식별자 |
| `requester_ip_address` | `Optional[str]` | 선택적 요청자 IP 주소 |
| `messages` | `Optional[Union[str, list, dict]]` | 요청으로 보낸 messages |
| `response` | `Optional[Union[str, list, dict]]` | LLM 응답 |
| `error_str` | `Optional[str]` | 선택적 error 문자열 |
| `error_information` | `Optional[StandardLoggingPayloadErrorInformation]` | 선택적 error 정보 |
| `model_parameters` | `dict` | 모델 parameter |
| `hidden_params` | `StandardLoggingHiddenParams` | 숨겨진 parameter |

## 비용 세부 내역 {#cost-breakdown}

`cost_breakdown` 필드는 completion 요청의 상세 비용 세부 내역을 다음 항목을 포함한 `CostBreakdown` 객체로 제공합니다.

- **`input_cost`**: cache creation token을 포함한 input/prompt token 비용
- **`output_cost`**: output/completion token 비용(해당되는 경우 reasoning token 포함)
- **`tool_usage_cost`**: 기본 제공 tool 사용 비용(예: web search, code interpreter)
- **`total_cost`**: input + output + tool usage의 총 비용

**참고**: 이 필드는 모든 호출 유형에서 채워집니다. completion이 아닌 호출에서는 `input_cost`와 `output_cost`가 0일 수 있습니다.

총 비용 관계는 `response_cost = cost_breakdown.total_cost`입니다.

### CostBreakdown 타입 {#costbreakdown-type}

```python
class CostBreakdown(TypedDict, total=False):
    input_cost: float        # Cost of input/prompt tokens in USD
    output_cost: float       # Cost of output/completion tokens in USD (includes reasoning)
    tool_usage_cost: float   # Cost of built-in tools usage in USD
    total_cost: float        # Total cost in USD
```

## `StandardLoggingUserAPIKeyMetadata`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `user_api_key_hash` | `Optional[str]` | litellm virtual key의 hash |
| `user_api_key_alias` | `Optional[str]` | API key alias |
| `user_api_key_org_id` | `Optional[str]` | key와 연결된 조직 ID |
| `user_api_key_team_id` | `Optional[str]` | key와 연결된 team ID |
| `user_api_key_user_id` | `Optional[str]` | key와 연결된 user ID |
| `user_api_key_team_alias` | `Optional[str]` | key와 연결된 team alias |

## `StandardLoggingMetadata`

`StandardLoggingUserAPIKeyMetadata`를 상속하고 다음 항목을 추가합니다.

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `spend_logs_metadata` | `Optional[dict]` | spend logging용 key-value 쌍 |
| `requester_ip_address` | `Optional[str]` | 요청자의 IP 주소 |
| `requester_metadata` | `Optional[dict]` | 추가 요청자 metadata |
| `vector_store_request_metadata` | `Optional[List[StandardLoggingVectorStoreRequest]]` | vector store 요청 metadata |
| `requester_custom_headers` | Dict[str, str] | client가 proxy로 보낸 custom(`x-`) header |
| `prompt_management_metadata` | `Optional[StandardLoggingPromptManagementMetadata]` | prompt 관리 및 versioning metadata |
| `mcp_tool_call_metadata` | `Optional[StandardLoggingMCPToolCall]` | MCP(Model Context Protocol) tool call 정보와 비용 추적 |
| `applied_guardrails` | `Optional[List[str]]` | 적용된 guardrail 이름 목록 |
| `usage_object` | `Optional[dict]` | LLM provider의 원본 usage 객체 |
| `cold_storage_object_key` | `Optional[str]` | cold storage 조회용 S3/GCS object key |
| `guardrail_information` | `Optional[list[StandardLoggingGuardrailInformation]]` | guardrail 정보 |


## `StandardLoggingVectorStoreRequest`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| vector_store_id | Optional[str] | vector store ID |
| custom_llm_provider | Optional[str] | vector store와 연결된 custom LLM provider(예: bedrock, openai, anthropic) |
| query | Optional[str] | vector store로 보낸 query |
| vector_store_search_response | Optional[VectorStoreSearchResponse] | OpenAI 형식의 vector store search 응답 |
| start_time | Optional[float] | vector store 요청 시작 시간 |
| end_time | Optional[float] | vector store 요청 종료 시간 |


## `StandardLoggingAdditionalHeaders`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `x_ratelimit_limit_requests` | `int` | 요청 rate limit |
| `x_ratelimit_limit_tokens` | `int` | token rate limit |
| `x_ratelimit_remaining_requests` | `int` | rate limit에서 남은 요청 수 |
| `x_ratelimit_remaining_tokens` | `int` | rate limit에서 남은 token 수 |

## `StandardLoggingHiddenParams`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `model_id` | `Optional[str]` | 선택적 model ID |
| `cache_key` | `Optional[str]` | 선택적 cache key |
| `api_base` | `Optional[str]` | 선택적 API base URL |
| `response_cost` | `Optional[str]` | 선택적 response cost |
| `additional_headers` | `Optional[StandardLoggingAdditionalHeaders]` | 추가 header |
| `batch_models` | `Optional[List[str]]` | Batches API에서만 설정됩니다. 비용 계산에 사용된 모델 목록 |
| `litellm_model_name` | `Optional[str]` | 요청에 보낸 모델 이름 |

## `StandardLoggingModelInformation`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `model_map_key` | `str` | model map key |
| `model_map_value` | `Optional[ModelInfo]` | 선택적 model 정보 |

## `StandardLoggingModelCostFailureDebugInformation`

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `error_str` | `str` | error 문자열 |
| `traceback_str` | `str` | traceback 문자열 |
| `model` | `str` | 모델 이름 |
| `cache_hit` | `Optional[bool]` | cache hit 여부 |
| `custom_llm_provider` | `Optional[str]` | 선택적 custom LLM provider |
| `base_model` | `Optional[str]` | 선택적 base model |
| `call_type` | `str` | 호출 유형 |
| `custom_pricing` | `Optional[bool]` | custom pricing 사용 여부 |

## `StandardLoggingPayload`ErrorInformation

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `error_code` | `Optional[str]` | 선택적 error code(예: "429") |
| `error_class` | `Optional[str]` | 선택적 error class(예: "RateLimitError") |
| `llm_provider` | `Optional[str]` | error를 반환한 LLM provider(예: "openai") |

## `StandardLoggingPayload`Status

두 가지 값을 가질 수 있는 literal type입니다.
- `"success"`
- `"failure"`

## `StandardLoggingGuardrailInformation`

| 필드                 | 타입 | 설명                                                                                                                                                               |
|-----------------------|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `guardrail_name`      | `Optional[str]` | guardrail 이름 |
| `guardrail_provider`  | `Optional[str]` | guardrail 제공자 |
| `guardrail_mode`      | `Optional[Union[GuardrailEventHooks, List[GuardrailEventHooks]]]` | guardrail mode |
| `guardrail_request`   | `Optional[dict]` | guardrail 요청 |
| `guardrail_response`  | `Optional[Union[dict, str, List[dict]]]` | guardrail 응답 |
| `guardrail_status`    | `Literal["success", "guardrail_intervened", "guardrail_failed_to_respond"]` | guardrail 실행 상태: `success` = 위반 없음, `blocked` = 정책 위반으로 content 차단/수정, `failure` = 기술 오류 또는 API 실패 |
| `start_time`          | `Optional[float]` | guardrail 시작 시간 |
| `end_time`            | `Optional[float]` | guardrail 종료 시간 |
| `duration`            | `Optional[float]` | guardrail duration(초) |
| `masked_entity_count` | `Optional[Dict[str, int]]` | masked entity 수 |

## `StandardLoggingPayload`StatusFields

필터링과 분석을 쉽게 하기 위한 typed 상태 필드입니다.

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `llm_api_status` | `StandardLoggingPayloadStatus` | LLM API 호출 상태: 성공적으로 완료되면 `"success"`, error가 발생하면 `"failure"` |
| `guardrail_status` | `GuardrailStatus` | guardrail 실행 상태(아래 참고) |

### `StandardLoggingPayload`Status

두 가지 값을 가질 수 있는 literal type입니다.
- `"success"` - LLM API 요청이 성공적으로 완료됨
- `"failure"` - LLM API 요청 실패

### GuardrailStatus

네 가지 값을 가질 수 있는 literal type입니다.
- `"success"` - guardrail이 실행되었고 content를 통과시킴(위반 없음)
- `"guardrail_intervened"` - 정책 위반으로 guardrail이 content를 차단하거나 수정함
- `"guardrail_failed_to_respond"` - guardrail에서 기술 실패 또는 API error 발생
- `"not_run"` - 이 요청에서 guardrail이 실행되지 않음

### 사용법 예제

guardrail이 개입한 요청의 log를 필터링합니다.
```json
{
  "status_fields": {
    "guardrail_status": "guardrail_intervened"
  }
}
```

guardrail 기술 실패를 찾습니다.
```json
{
  "status_fields": {
    "guardrail_status": "guardrail_failed_to_respond"
  }
}
```

성공한 LLM 요청을 가져옵니다.
```json
{
  "status_fields": {
    "llm_api_status": "success"
  }
}
```

guardrail이 개입 없이 성공적으로 실행된 요청을 찾습니다.
```json
{
  "status_fields": {
    "guardrail_status": "success",
    "llm_api_status": "success"
  }
}
```

guardrail이 실행되지 않은 요청을 찾습니다.
```json
{
  "status_fields": {
    "guardrail_status": "not_run"
  }
}
```

## `StandardLoggingPromptManagementMetadata`

prompt versioning 및 관리 정보를 추적하는 데 사용됩니다.

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `prompt_id` | `str` | **필수**. prompt template 또는 version의 고유 식별자 |
| `prompt_variables` | `Optional[dict]` | prompt template에서 사용된 variable/parameter(예: `{"user_name": "John", "context": "support"}`) |
| `prompt_integration` | `str` | **필수**. prompt를 관리하는 integration 또는 system(예: `"langfuse"`, `"promptlayer"`, `"custom"`) |

## `StandardLoggingMCPToolCall`

LiteLLM 요청 안의 Model Context Protocol(MCP) tool call을 추적하는 데 사용됩니다. 외부 tool integration에 대한 상세 logging을 제공합니다.

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `name` | `str` | **필수**. 호출되는 tool 이름(예: `"get_weather"`, `"search_database"`) |
| `arguments` | `dict` | **필수**. tool에 key-value 쌍으로 전달된 argument |
| `result` | `Optional[dict]` | tool 실행이 반환한 response/result(custom logging hook으로 채움) |
| `mcp_server_name` | `Optional[str]` | tool call을 처리한 MCP server 이름(예: `"weather-service"`, `"database-connector"`) |
| `mcp_server_logo_url` | `Optional[str]` | MCP server logo URL(LiteLLM dashboard UI 표시용) |
| `namespaced_tool_name` | `Optional[str]` | server prefix를 포함한 fully qualified tool name(예: `"deepwiki-mcp/get_page_content"`, `"github-mcp/create_issue"`) |
| `mcp_server_cost_info` | `Optional[MCPServerCostInfo]` | tool call의 비용 추적 정보 |

### `MCPServerCostInfo`

MCP server tool call의 비용 추적 구조입니다.

| 필드 | 타입 | 설명 |
|-------|------|-------------|
| `default_cost_per_query` | `Optional[float]` | 이 MCP server로 향하는 모든 tool call의 기본 비용(USD) |
| `tool_name_to_cost_per_query` | `Optional[Dict[str, float]]` | 세밀한 pricing을 위한 tool별 비용 mapping(예: `{"search": 0.01, "create": 0.05}`) |

### 사용법

```python
# Basic MCP tool call metadata
mcp_tool_call = {
    "name": "search_documents",
    "arguments": {
        "query": "machine learning tutorials",
        "limit": 10,
        "filter": "type:pdf"
    },
    "mcp_server_name": "document-search-service",
    "namespaced_tool_name": "docs-mcp/search_documents",
    "mcp_server_cost_info": {
        "default_cost_per_query": 0.02,
        "tool_name_to_cost_per_query": {
            "search_documents": 0.02,
            "get_document": 0.01
        }
    }
}

# optional result field (via custom logging hooks)
mcp_tool_call_with_result = {
    "name": "search_documents",
    "arguments": {
        "query": "machine learning tutorials",
        "limit": 10,
        "filter": "type:pdf"
    },
    "result": {
        "documents": [...],
        "total_found": 42,
        "search_time_ms": 150
    },
    "mcp_server_name": "document-search-service",
    "namespaced_tool_name": "docs-mcp/search_documents",
    "mcp_server_cost_info": {
        "default_cost_per_query": 0.02,
        "tool_name_to_cost_per_query": {
            "search_documents": 0.02,
            "get_document": 0.01
        }
    }
}
```
