# v1/messages → /responses 파라미터 매핑

OpenAI 또는 Azure 모델을 대상으로 `/v1/messages` 요청을 보내면 LiteLLM은 내부적으로 OpenAI Responses API를 통해 요청을 라우팅합니다. 이 페이지는 각 파라미터가 양방향으로 어떻게 변환되는지 정확히 설명합니다.

변환 로직은 `litellm/llms/anthropic/experimental_pass_through/responses_adapters/transformation.py`에 있습니다.


## 요청: Anthropic → Responses API

### 최상위 파라미터

| Anthropic (`/v1/messages`) | Responses API | 참고 |
|---|---|---|
| `model` | `model` | 그대로 전달됩니다 |
| `messages` | `input` | 구조적으로 변환됩니다. 아래 messages 섹션을 참고하세요 |
| `system` (string) | `instructions` | 일반 문자열로 전달됩니다 |
| `system` (content block list) | `instructions` | 텍스트 블록은 `\n`으로 결합되고 텍스트가 아닌 블록은 무시됩니다 |
| `max_tokens` | `max_output_tokens` | 이름이 변경됩니다 |
| `temperature` | `temperature` | 그대로 전달됩니다 |
| `top_p` | `top_p` | 그대로 전달됩니다 |
| `tools` | `tools` | 형식이 변환됩니다. 아래 tools 섹션을 참고하세요 |
| `tool_choice` | `tool_choice` | 타입이 재매핑됩니다. 아래 tool_choice 섹션을 참고하세요 |
| `thinking` | `reasoning` | 예산 토큰이 effort level로 매핑됩니다. 아래 thinking 섹션을 참고하세요 |
| `output_format` or `output_config.format` | `text` | `{"format": {"type": "json_schema", "name": "structured_output", "schema": ..., "strict": true}}`로 감싸집니다 |
| `context_management` | `context_management` | Anthropic dict에서 OpenAI 배열 형식으로 변환됩니다. 아래 context_management 섹션을 참고하세요 |
| `metadata.user_id` | `user` | metadata 객체에서 추출되며 64자로 잘립니다 |
| `stop_sequences` | ❌ 매핑되지 않음 | 조용히 삭제됩니다 |
| `top_k` | ❌ 매핑되지 않음 | 조용히 삭제됩니다 |
| `speed` | ❌ 매핑되지 않음 | 네이티브 경로에서 Anthropic beta header를 설정할 때만 사용됩니다 |


### messages 변환 방식

각 Anthropic 메시지는 하나 이상의 Responses API input item으로 확장됩니다. 핵심 차이는 `tool_result`와 `tool_use` 블록이 메시지 안에 중첩되지 않고 input 배열의 **최상위 item**이 된다는 점입니다.

| Anthropic message | Responses API 입력 item |
|---|---|
| `user` role, 문자열 content | `{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "..."}]}` |
| `user` role, `{"type": "text"}` block | user 메시지 내부의 `{"type": "input_text", "text": "..."}` |
| `user` role, `{"type": "image", "source": {"type": "base64"}}` | user 메시지 내부의 `{"type": "input_image", "image_url": "data:<media_type>;base64,<data>"}` |
| `user` role, `{"type": "image", "source": {"type": "url"}}` | user 메시지 내부의 `{"type": "input_image", "image_url": "<url>"}` |
| `user` role, `{"type": "tool_result"}` block | 최상위 `{"type": "function_call_output", "call_id": "...", "output": "..."}`. 메시지에서 완전히 분리됩니다 |
| `assistant` role, 문자열 content | `{"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "..."}]}` |
| `assistant` role, `{"type": "text"}` block | assistant 메시지 내부의 `{"type": "output_text", "text": "..."}` |
| `assistant` role, `{"type": "tool_use"}` block | 최상위 `{"type": "function_call", "call_id": "<id>", "name": "...", "arguments": "<JSON string>"}`. 메시지에서 완전히 분리됩니다 |
| `assistant` role, `{"type": "thinking"}` block | assistant 메시지 내부의 `{"type": "output_text", "text": "<thinking text>"}` |


### tools

| Anthropic tool | Responses API 도구 |
|---|---|
| `type`이 `"web_search"`로 시작하거나 `name == "web_search"`인 모든 tool | `{"type": "web_search_preview"}` |
| 그 외 모든 tool | `{"type": "function", "name": "...", "description": "...", "parameters": <input_schema>}` |


### tool_choice

| Anthropic `tool_choice.type` | Responses API `tool_choice` |
|---|---|
| `"auto"` | `{"type": "auto"}` |
| `"any"` | `{"type": "required"}` |
| `"tool"` | `{"type": "function", "name": "<tool name>"}` |


### thinking → reasoning

`budget_tokens` 값은 문자열 effort level로 매핑됩니다. `summary`는 항상 `"detailed"`로 설정됩니다.

| `thinking.budget_tokens` | `reasoning.effort` |
|---|---|
| >= 10000 | `"high"` |
| >= 5000 | `"medium"` |
| >= 2000 | `"low"` |
| < 2000 | `"minimal"` |

`thinking.type`이 `"enabled"`가 아니면 `reasoning` 필드는 전송되지 않습니다.


### context_management

Anthropic은 `edits` 배열이 있는 중첩 dict를 사용합니다. OpenAI는 compaction 객체의 평면 배열을 사용합니다.

```
Anthropic input:
{
  "edits": [
    {
      "type": "compact_20260112",
      "trigger": {"type": "input_tokens", "value": 150000}
    }
  ]
}

Responses API output:
[
  {"type": "compaction", "compact_threshold": 150000}
]
```


## 응답: Responses API → Anthropic

Responses API 응답이 돌아오면 LiteLLM은 이를 Anthropic `AnthropicMessagesResponse`로 변환합니다.

| Responses API field | Anthropic response field | 참고 |
|---|---|---|
| `response.id` | `id` | |
| `response.model` | `model` | 누락된 경우 `"unknown-model"`로 fallback됩니다 |
| `ResponseReasoningItem` — `summary[*].text` | `content` block `{"type": "thinking", "thinking": "..."}` | 비어 있지 않은 각 summary text가 thinking block이 됩니다 |
| `ResponseOutputMessage` — `type == "output_text"`인 `content[*]` | `content` block `{"type": "text", "text": "..."}` | |
| `ResponseFunctionToolCall` — `{call_id, name, arguments}` | `content` block `{"type": "tool_use", "id": "...", "name": "...", "input": {...}}` | `arguments`는 JSON으로 파싱되어 dict로 되돌아갑니다 |
| output에 `function_call`이 있으면 | `stop_reason: "tool_use"` | |
| `response.status == "incomplete"` | `stop_reason: "max_tokens"` | 기본값보다 우선합니다 |
| 그 외 모든 경우 | `stop_reason: "end_turn"` | 기본값 |
| `response.usage.input_tokens` | `usage.input_tokens` | |
| `response.usage.output_tokens` | `usage.output_tokens` | |
| *(hardcoded)* | `type: "message"` | 항상 설정됩니다 |
| *(hardcoded)* | `role: "assistant"` | 항상 설정됩니다 |
| *(hardcoded)* | `stop_sequence: null` | 이 경로에서는 항상 null입니다 |
