import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 도구 권한 가드레일 {#litellm-tool-permission-guardrail}

LiteLLM은 설정 가능한 허용/거부 규칙으로 모델이 어떤 **도구 호출**을 실행할 수 있는지 제어하는 LiteLLM 도구 권한 가드레일을 제공합니다. 이를 통해 OpenAI Chat Completions `tool_calls`, Anthropic Messages `tool_use`, MCP 도구 같은 도구 실행을 공급자와 관계없이 세밀하게 제어할 수 있습니다.

## 빠른 시작

### LiteLLM UI

#### 1단계: 도구 권한 가드레일 선택 {#step-1-select-tool-permission-guardrail}

LiteLLM Dashboard를 열고 **Add New Guardrail**을 클릭한 다음 **LiteLLM Tool Permission Guardrail**을 선택합니다. 그러면 규칙 빌더 UI가 로드됩니다.

#### 2단계: 정규식 규칙 정의 {#step-2-define-regex-rules}

1. **Add Rule**을 클릭합니다.
2. 고유한 Rule ID를 입력합니다.
3. 도구 이름에 적용할 정규식을 입력합니다(예: `^mcp__github_.*$`).
4. 필요하면 도구 유형에 적용할 정규식을 추가합니다(예: `^function$`).
5. **Allow** 또는 **Deny**를 선택합니다.

#### 3단계: 도구 인수 제한(선택 사항) {#step-3-restrict-tool-arguments-optional}

**+ Restrict tool arguments**를 선택해 중첩 경로(점 + `[]` 표기법)에 정규식 검증을 연결합니다. 이렇게 하면 `arguments.to[]` 같은 민감한 매개변수가 사전에 승인된 형식을 따르도록 강제할 수 있습니다.

#### 4단계: 기본값 및 동작 선택 {#step-4-choose-defaults--actions}

- 어떤 규칙에도 일치하지 않는 도구에 적용할 대체 결정(`default_action`)을 설정합니다.
- 허용되지 않은 도구를 처리하는 방식을 정합니다. **Block**은 요청을 중단하고, **Rewrite**는 금지된 도구를 제거한 뒤 응답 안에 오류 메시지를 반환합니다.
- 브랜드에 맞춘 오류 문구가 필요하면 `violation_message_template`을 사용자 지정합니다.
- 가드레일을 저장합니다.

### LiteLLM Config.yaml 설정 {#litellm-configyaml-setup}

```yaml
guardrails:
  - guardrail_name: "tool-permission-guardrail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      rules:
        - id: "allow_bash"
          tool_name: "Bash"
          decision: "allow"
        - id: "allow_github_mcp"
          tool_name: "^mcp__github_.*$"
          decision: "allow"
        - id: "allow_aws_documentation"
          tool_name: "^mcp__aws-documentation_.*_documentation$"
          decision: "allow"
        - id: "deny_read_commands"
          tool_name: "Read"
          decision: "deny"
        - id: "mail-domain"
          tool_name: "^send_email$"
          tool_type: "^function$"
          decision: "allow"
          allowed_param_patterns:
            "to[]": "^.+@berri\\.ai$"
            "cc[]": "^.+@berri\\.ai$"
            "subject": "^.{1,120}$"
      default_action: "deny"  # Fallback when no rule matches: "allow" or "deny"
      on_disallowed_action: "block"  # How to handle disallowed tools: "block" or "rewrite"
```

#### 규칙 구조 {#rule-structure}

```yaml
- id: "unique_rule_id"           # Unique identifier for the rule
  tool_name: "^regex$"           # Regex for tool name (optional, at least one of name/type required)
  tool_type: "^function$"        # Regex for tool type (optional)
  decision: "allow"              # "allow" or "deny"
  allowed_param_patterns:         # Optional - regex map for argument paths (dot + [] notation)
    "path.to[].field": "^regex$"
```

#### `mode`에서 지원하는 값 {#supported-values-for-mode}

- `pre_call` **LLM 호출 전**에 **입력**을 대상으로 실행합니다.
- `post_call` **LLM 호출 후**에 **입력 및 출력**을 대상으로 실행합니다.

### `on_disallowed_action` 동작 {#on_disallowed_action-behavior}

| 값 | 동작 |
| --- | --- |
| `block` | 요청을 즉시 거부합니다. 호출 전 검사는 `400` HTTP 오류를 발생시킵니다. 호출 후 검사는 `GuardrailRaisedException`을 발생시키므로, 프록시는 모델 출력 대신 오류로 응답합니다. 금지된 도구 호출이 워크플로를 반드시 중단해야 할 때 사용합니다. |
| `rewrite` | LiteLLM은 페이로드가 모델에 도달하기 전(호출 전)에 허용되지 않은 도구를 조용히 제거하거나, 사후에 모델 응답/도구 호출을 다시 작성합니다. 가드레일은 `message.content`/`tool_result` 항목에 오류 텍스트를 삽입하므로, 나머지 응답 생성은 계속 진행하면서도 클라이언트는 도구가 차단되었음을 알 수 있습니다. 강제 실패 대신 점진적인 성능 저하 방식으로 처리하고 싶을 때 사용합니다. |

### 사용자 지정 거부 메시지 {#custom-denial-message}

가드레일이 브랜드에 맞춘 오류(예: `this violates our org policy...`)를 반환하게 하려면 `violation_message_template`을 설정합니다. LiteLLM은 거부된 도구의 값으로 다음 자리 표시자를 치환합니다.

- `{tool_name}` - 도구/함수 이름(예: `Read`)
- `{rule_id}` - 일치한 규칙 ID(기본 동작이 적용된 경우 `None`)
- `{default_message}` - 원래 LiteLLM 메시지를 덧붙여야 할 때 사용하는 값

예제:

```yaml
guardrails:
  - guardrail_name: "tool-permission-guardrail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      violation_message_template: "this violates our org policy, we don't support executing {tool_name} commands"
      rules:
        - id: "allow_bash"
          tool_name: "Bash"
          decision: "allow"
        - id: "deny_read"
          tool_name: "Read"
          decision: "deny"
      default_action: "deny"
      on_disallowed_action: "block"
```

요청이 `Read`를 호출하려고 하면 이제 프록시는 기본 오류 텍스트 대신 `this violates our org policy, we don't support executing Read commands`를 반환합니다. 기본 메시지를 유지하려면 이 필드를 생략합니다.

### 2. 프록시 시작 {#2-start-the-proxy}

```shell
litellm --config config.yaml --port 4000
```

## 예제

<Tabs>
<TabItem value="block" label="요청 차단">

**요청 차단(`on_disallowed_action: block`)**

```bash
# Test
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-master-key-here" \
  -d '{
    "model": "gpt-5-mini",
    "messages": [{"role": "user","content": "What is the weather like in Tokyo today?"}],
    "tools": [
      {
        "type":"function",
        "function": {
          "name":"get_current_weather",
          "description": "Get the current weather in a given location"
        }
      }
    ]
  }'
```

**예상 응답(거부됨):**

```json
{
  "error":
    {
      "message": "Guardrail raised an exception, Guardrail: tool-permission-guardrail, Message: Tool 'get_current_weather' denied by default action",
      "type": "None",
      "param": "None",
      "code": "500"
    }
}
```

</TabItem>
<TabItem value="rewrite" label="요청 재작성">

**요청 재작성(`on_disallowed_action: rewrite`)**

```bash
# Test
curl -X POST "http://localhost:4000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-master-key-here" \
  -d '{
    "model": "gpt-5-mini",
    "messages": [{"role": "user","content": "What is the weather like in Tokyo today?"}],
    "tools": [
      {
        "type":"function",
        "function": {
          "name":"get_current_weather",
          "description": "Get the current weather in a given location"
        }
      }
    ]
  }'
```

**예상 응답(도구 제거, 응답 생성 계속 진행):**

```json
{
	"id": "chatcmpl-xxxxxxxxxxxxxxx",
	"created": 1757716050,
	"model": "gpt-5-mini-2025-08-07",
	"object": "chat.completion",
	"choices": [
		{
			"finish_reason": "stop",
			"index": 0,
			"message": {
				"content": "I can’t fetch live weather — I don’t have real‑time internet access.",
				"role": "assistant",
				"annotations": []
			},
			"provider_specific_fields": {}
		}
	],
	"usage": {
		"prompt_tokens": 112,
		"total_tokens": 735,
		"completion_tokens_details": {
			"reasoning_tokens": 384,
		},
	},
	"service_tier": "default"
}
```

</TabItem>
</Tabs>

### 도구 인수 제한 {#constrain-tool-arguments}

도구 사용은 허용하되 **사용 방식**은 제한해야 할 때가 있습니다. 규칙에 `allowed_param_patterns`를 추가하면 특정 인수 경로(배열은 `[]`를 사용하는 점 표기법)에 정규식 패턴을 강제할 수 있습니다.

```yaml title="mail_mcp가 @berri.ai 주소로만 메일을 보내도록 허용"
guardrails:
  - guardrail_name: "tool-permission-mail"
    litellm_params:
      guardrail: tool_permission
      mode: "post_call"
      rules:
        - id: "mail-domain"
          tool_name: "send_email"
          decision: "allow"
          allowed_param_patterns:
            "to[]": "^.+@berri\\.ai$"
            "cc[]": "^.+@berri\\.ai$"
            "subject": "^.{1,120}$"
      default_action: "deny"
      on_disallowed_action: "block"
```

이 예제에서 LLM은 여전히 `send_email`을 호출할 수 있지만, `@berri.ai` 외부 주소로 이메일을 보내려고 하거나 제목이 정규식을 통과하지 못하면 가드레일이 호출을 차단합니다(`on_disallowed_action`에 따라 재작성할 수도 있습니다). 메일 발신, 에스컬레이션 워크플로, 티켓 생성처럼 인수 값이 중요한 도구에는 이 패턴을 사용하세요.
