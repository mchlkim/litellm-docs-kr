import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Agent 반복 budget

session별 iteration 및 budget cap으로 agentic loop에서 발생할 수 있는 runaway cost를 제어합니다.

## 개요

agent가 agentic loop를 실행하면 제한 없이 LLM call을 만들 수 있어 예상치 못한 비용이 발생할 수 있습니다. LiteLLM은 두 가지 제어 수단을 제공합니다.

| 제어 항목 | 설명 |
|---------|-------------|
| **max iterations** | session별 LLM call 수의 hard cap |
| **max budget per session** | session별 dollar cap(`x-litellm-trace-id`로 식별) |

두 제어 모두 session 안의 call을 추적하기 위해 `session_id`가 필요합니다. `session_id`는 `x-litellm-trace-id` header 또는 `metadata.session_id`로 전달됩니다.

## trace-id 강제 적용

LiteLLM은 agent의 `litellm_params`에 설정하는 두 개의 독립적인 trace-id flag를 지원합니다.

| flag | 설명 |
|------|-------------|
| `require_trace_id_on_calls_to_agent` | 이 agent를 호출하는 caller가 `x-litellm-trace-id`를 포함하도록 요구합니다. agent가 trace context가 있는 sub-agent로만 호출되어야 할 때 사용합니다. 누락되면 **400**을 반환합니다. |
| `require_trace_id_on_calls_by_agent` | 이 agent가 virtual key를 통해 수행하는 모든 LLM/MCP call에 `x-litellm-trace-id`를 포함하도록 요구합니다. `max_iterations`와 `max_budget_per_session` 추적을 가능하게 하는 설정입니다. 누락되면 **400**을 반환합니다. |

## UI로 설정

LiteLLM 관리자 UI에서 agent를 만들 때:

1. **Agents** tab으로 이동해 **Add Agent**를 클릭합니다.
2. **Agent 설정** 단계에서 **Tracing** section을 펼칩니다.
3. **이 agent가 수행하는 call에 x-litellm-trace-id 요구**를 켜서 session tracking을 활성화합니다.
4. **최대 iteration 수**를 설정해 session별 LLM call 수를 제한합니다.
5. **Session별 최대 budget($)**을 설정해 session별 spend를 제한합니다.

trace-id flag는 agent의 `litellm_params`에 저장됩니다. budget 제어(`max_iterations`, `max_budget_per_session`)는 virtual key의 metadata에 저장됩니다.

## API로 설정

agent 자체에 trace-id 강제 적용을 설정합니다.

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_to_agent": true,
      "require_trace_id_on_calls_by_agent": true
    }
  }'
```

budget 제어는 개별 key가 아니라 agent의 `litellm_params`에 설정되므로, 해당 agent의 모든 key에 적용됩니다.

```bash
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true,
      "max_iterations": 25,
      "max_budget_per_session": 5.00
    }
  }'
```

## 동작 방식

### Session 추적

caller는 다음 중 한 방식으로 `session_id`를 포함해 session을 식별합니다.
- **header**: `x-litellm-trace-id: my-session-123`
- **metadata**: `{"metadata": {"session_id": "my-session-123"}}`

### max iterations

agent `litellm_params`에 `max_iterations`가 설정되면:
- session별 LLM call마다 counter가 증가합니다.
- counter가 `max_iterations`를 넘으면 request는 **429 Too Many Requests**를 받습니다.
- counter는 기본적으로 1시간 뒤 만료됩니다(`LITELLM_MAX_ITERATIONS_TTL` env var로 설정 가능).

### Session별 max budget

agent `litellm_params`에 `max_budget_per_session`이 설정되면:
- 성공한 LLM call 이후 response cost가 session에 누적됩니다.
- 각 call 전에 누적 spend가 budget과 비교됩니다.
- spend가 budget을 넘으면 request는 **429 Too Many Requests**를 받습니다.
- session spend counter는 기본적으로 1시간 뒤 만료됩니다(`LITELLM_MAX_BUDGET_PER_SESSION_TTL` env var로 설정 가능).

## 예제

최대 25 iteration과 $5 budget cap을 가진 agent를 만듭니다.

<Tabs>
<TabItem value="ui" label="UI 사용">

1. **Agents** → **Add Agent**로 이동합니다.
2. agent(name, model 등)를 설정합니다.
3. **Agent 설정**에서 **Tracing** section을 펼칩니다.
4. **이 agent가 수행하는 call에 x-litellm-trace-id 요구**를 켭니다.
5. **최대 iteration 수**를 `25`로 설정합니다.
6. **Session별 최대 budget**을 `5.00`으로 설정합니다.
7. agent용 새 key 생성 단계로 진행합니다.
8. **Create Agent**를 클릭합니다.

</TabItem>
<TabItem value="api" label="API 사용">

```bash
# 1. Create the agent with trace-id enforcement
curl -X POST 'http://localhost:4000/v1/agents' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_name": "my-research-agent",
    "agent_card_params": {
      "name": "my-research-agent",
      "description": "A research agent with budget controls",
      "url": "http://my-agent:8080",
      "version": "1.0.0"
    },
    "litellm_params": {
      "require_trace_id_on_calls_by_agent": true
    }
  }'

# 2. Create a key for the agent
curl -X POST 'http://localhost:4000/key/generate' \
  -H 'Authorization: Bearer sk-1234' \
  -H 'Content-Type: application/json' \
  -d '{
    "agent_id": "<agent_id_from_step_1>",
    "key_alias": "my-research-agent-key"
  }'
```

</TabItem>
</Tabs>

### session tracking으로 call 만들기

```bash
curl -X POST 'http://localhost:4000/chat/completions' \
  -H 'Authorization: Bearer sk-agent-key-xxx' \
  -H 'x-litellm-trace-id: session-abc-123' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

이 session 안에서 25회 call 또는 $5 spend 이후에는 이후 request가 다음 응답을 받습니다.

```json
{
  "error": {
    "message": "Session budget exceeded for session session-abc-123. Current spend: $5.0032, max_budget_per_session: $5.00.",
    "type": "budget_exceeded",
    "code": 429
  }
}
```

## 환경 변수

| variable | 기본값 | 설명 |
|----------|---------|-------------|
| `LITELLM_MAX_ITERATIONS_TTL` | `3600`(1시간) | session iteration counter의 TTL(초) |
| `LITELLM_MAX_BUDGET_PER_SESSION_TTL` | `3600`(1시간) | session budget counter의 TTL(초) |
