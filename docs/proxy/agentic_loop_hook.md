# 에이전틱 루프 훅

모델 응답을 가로채고, 서버 측에서 도구 호출을 처리한 뒤, 호출자에게는 투명하게 모델을 다시 실행하는 `CustomLogger` 콜백을 빌드합니다.

:::info 지원되는 호출 유형
- `async`만 지원합니다. 동기 호출은 훅을 트리거하지 않습니다.
- 비스트리밍만 지원합니다. 스트리밍 응답은 도구 호출 여부를 검사할 수 없습니다.
- `/v1/messages`와 `/v1/chat/completions` 모두에서 작동합니다.
:::

## 콜백 구현하기

`CustomLogger`에서 두 메서드를 재정의합니다.

```python
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.integrations.custom_logger import AgenticLoopPlan, AgenticLoopRequestPatch

MY_TOOL = "my_tool"

class MyToolCallback(CustomLogger):

    async def async_should_run_agentic_loop(
        self, response, model, messages, tools, stream, custom_llm_provider, kwargs
    ):
        # Return (True, context_dict) if there are tool calls to handle
        content = getattr(response, "content", None) or []
        calls = [b for b in content if isinstance(b, dict)
                 and b.get("type") == "tool_use" and b.get("name") == MY_TOOL]
        if not calls:
            return False, {}
        return True, {"tool_calls": calls}

    async def async_build_agentic_loop_plan(
        self, tools, model, messages, response,
        anthropic_messages_provider_config,
        anthropic_messages_optional_request_params,
        logging_obj, stream, kwargs,
    ):
        calls = tools["tool_calls"]
        results = [f"result for {c['input']}" for c in calls]  # your logic here

        follow_up = messages + [
            {"role": "assistant", "content": [
                {"type": "tool_use", "id": c["id"], "name": c["name"], "input": c["input"]}
                for c in calls
            ]},
            {"role": "user", "content": [
                {"type": "tool_result", "tool_use_id": c["id"], "content": results[i]}
                for i, c in enumerate(calls)
            ]},
        ]
        return AgenticLoopPlan(
            run_agentic_loop=True,
            request_patch=AgenticLoopRequestPatch(messages=follow_up),
        )
```

`/v1/chat/completions`의 경우 대신 `async_build_chat_completion_agentic_loop_plan`을 재정의합니다. 개념은 동일하며, `optional_params`가 `anthropic_messages_optional_request_params`를 대체합니다.

## 등록하기

```python
import litellm
litellm.callbacks = [MyToolCallback()]
```

또는 `config.yaml`에서 등록합니다.

```yaml
litellm_settings:
  callbacks: ["my_module.MyToolCallback"]
```

## `AgenticLoopPlan` 필드

| 필드 | 효과 |
|---|---|
| `run_agentic_loop=True` + `request_patch` | 패치된 요청으로 모델을 다시 실행합니다. |
| `response_override` | 이 값을 호출자에게 직접 반환합니다. 다시 실행하지 않습니다. |
| `terminate=True` | 루프를 중지하고 현재 응답을 반환합니다. |
| `run_agentic_loop=False` (기본값) | 건너뛰고 다음 콜백을 확인합니다. |

`AgenticLoopRequestPatch`는 `model`, `messages`, `tools`, `max_tokens`, `optional_params`, `kwargs`를 허용합니다.

## 루프 안전성

- 기본 최대 재실행 횟수: `3`. 요청별로 `kwargs["max_agentic_loops"]`를 사용해 재정의할 수 있습니다.
- 동일한 도구 호출 지문이 감지되면 루프를 자동으로 중단합니다.
- 현재 깊이는 `kwargs["_agentic_loop_depth"]`에 있습니다.

## 이 저장소의 예제

- `litellm/integrations/compression_interception/handler.py`
- `litellm/integrations/websearch_interception/handler.py`
