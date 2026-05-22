# OpenAI Passthrough {#openai-passthrough}

OpenAI API에 직접 접근하기 위한 pass-through endpoint입니다.

## 개요

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| Cost Tracking | ❌ | 지원하지 않음 |
| Logging | ✅ | 모든 integration에서 동작 |
| Streaming | ✅ | 완전 지원 |

## 사용 가능한 엔드포인트 {#available-endpoints}

### `/openai_passthrough` - 권장 {#openai_passthrough---recommended}
충돌 없이 OpenAI로 직접 라우팅되도록 보장하는 전용 passthrough endpoint입니다.

**다음 경우에 사용하세요.**
- `OpenAI Responses API` (`/v1/responses`)
- passthrough가 반드시 보장되어야 하는 endpoint
- `/openai` route가 LiteLLM native implementation과 충돌하는 경우

### `/openai` - 레거시 {#openai---legacy}
LiteLLM native implementation과 충돌할 수 있는 표준 passthrough endpoint입니다.

**참고:** `/openai/v1/responses` 같은 일부 endpoint는 OpenAI가 아니라 LiteLLM native implementation으로 라우팅됩니다.

## 언제 사용하나요? {#when-to-use-this}

- 대부분의 사용 사례에서는 [native LiteLLM OpenAI Integration](https://docs.litellm.ai/docs/providers/openai)(`/chat/completions`, `/embeddings`, `/completions`, `/images`, `/batches` 등)을 사용하세요.
- `/assistants`, `/threads`, `/vector_stores`, `/responses`처럼 LiteLLM이 아직 완전히 지원하지 않는 덜 일반적이거나 더 새로운 OpenAI endpoint를 호출할 때 `/openai_passthrough`를 사용하세요.

`https://api.openai.com`을 `LITELLM_PROXY_BASE_URL/openai_passthrough`로 바꾸기만 하면 됩니다.

## 사용법 예제

요구 사항:
environment variable에 `OPENAI_API_KEY`를 설정하세요.

### Assistants API

#### OpenAI Client 생성 {#create-openai-client}

다음을 확인하세요.
- `base_url`이 `LITELLM_PROXY_BASE_URL/openai`를 가리키도록 설정
- `api_key`에는 `LITELLM_API_KEY` 사용

```python
import openai

client = openai.OpenAI(
    base_url="http://0.0.0.0:4000/openai_passthrough",  # <your-proxy-url>/openai_passthrough
    api_key="sk-anything"  # <your-proxy-api-key>
)
```

#### Assistant 생성 {#create-an-assistant}

```python
# Create an assistant
assistant = client.beta.assistants.create(
    name="Math Tutor",
    instructions="You are a math tutor. Help solve equations.",
    model="gpt-4o",
)
```

#### Thread 생성 {#create-a-thread}
```python
# Create a thread
thread = client.beta.threads.create()
```

#### Thread에 Message 추가 {#add-a-message-to-the-thread}
```python
# Add a message
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Solve 3x + 11 = 14",
)
```

#### Assistant 실행 {#run-the-assistant}
```python
# Create a run to get the assistant's response
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id,
)

# Check run status
run_status = client.beta.threads.runs.retrieve(
    thread_id=thread.id,
    run_id=run.id
)
```

#### Message 조회 {#retrieve-messages}
```python
# List messages after the run completes
messages = client.beta.threads.messages.list(
    thread_id=thread.id
)
```

#### Assistant 삭제 {#delete-the-assistant}

```python
# Delete the assistant when done
client.beta.assistants.delete(assistant.id)
```
