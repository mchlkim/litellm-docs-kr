---
title: Responses API로 Prompt Management 사용
---

# Responses API로 Prompt Management 사용 {#prompt-management-with-responses-api}

`prompt_id`와 선택 사항인 `prompt_variables`를 전달해 `/v1/responses`에서 LiteLLM Prompt Management를 사용할 수 있습니다.

## Basic 사용법

```bash
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "prompt_id": "my-responses-prompt",
    "prompt_variables": {"topic": "large language models"},
    "input": []
  }'
```

## `input`의 multi-turn follow-up {#multi-turn-follow-up-in-input}

하나의 요청에서 후속 turn을 보내려면 `input`에 message history를 전달합니다.

```bash
curl -X POST "http://localhost:4000/v1/responses" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "prompt_id": "my-responses-prompt",
    "prompt_variables": {"topic": "large language models"},
    "input": [
      {"role": "user", "content": "Topic is LLMs. Start short."},
      {"role": "assistant", "content": "Sure, go ahead."},
      {"role": "user", "content": "Now give me 3 bullets and include pricing caveat."}
    ]
  }'
```

## 참고

- Prompt template message는 `input` message와 병합됩니다.
- Prompt variable substitution은 prompt message content에 적용됩니다.
- Tool call payload field는 prompt variable로 치환되지 않습니다.
- `previous_response_id`를 사용하는 follow-up에서 해당 turn에도 prompt management를 적용하려면 `prompt_id`를 다시 포함하세요.
