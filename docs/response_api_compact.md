import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /responses/compact

OpenAI의 `/responses/compact` 엔드포인트를 사용해 대화 기록을 압축합니다.

| 기능 | 지원 여부 |
|---------|-----------|
| 지원되는 LiteLLM 버전 | 1.72.0+ |
| 지원 프로바이더 | `openai` |

## 사용법

### LiteLLM Python SDK

```python showLineNumbers title="Compact Response"
import litellm

response = litellm.compact_responses(
    model="openai/gpt-4o",
    input=[{"role": "user", "content": "Hello, how are you?"}],
    instructions="Be helpful",
    previous_response_id="resp_abc123"  # optional
)

print(response.id)
print(response.object)  # "response.compaction"
print(response.output)
```

### LiteLLM Proxy

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Compact Request"
curl http://localhost:4000/v1/responses/compact \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "openai/gpt-4o",
    "input": [{"role": "user", "content": "Hello"}],
    "instructions": "Be helpful"
  }'
```

</TabItem>
<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Compact with OpenAI SDK"
import httpx

response = httpx.post(
    "http://localhost:4000/v1/responses/compact",
    headers={"Authorization": "Bearer sk-1234"},
    json={
        "model": "openai/gpt-4o",
        "input": [{"role": "user", "content": "Hello"}],
        "instructions": "Be helpful"
    }
)

print(response.json())
```

</TabItem>
</Tabs>

## 요청 파라미터 {#request-parameters}

| 파라미터 | 타입 | 필수 여부 | 설명 |
|-----------|------|----------|-------------|
| `model` | string | 예 | 압축에 사용할 모델 |
| `input` | string 또는 array | 예 | 압축할 입력 메시지 |
| `instructions` | string | 아니요 | 시스템 지침 |
| `previous_response_id` | string | 아니요 | 이어서 처리할 이전 응답의 ID |

## 응답 형식

```json
{
  "id": "resp_abc123",
  "object": "response.compaction",
  "created_at": 1734366691,
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [...]
    },
    {
      "type": "compaction",
      "encrypted_content": "..."
    }
  ],
  "usage": {
    "input_tokens": 100,
    "output_tokens": 50,
    "total_tokens": 150
  }
}
```
