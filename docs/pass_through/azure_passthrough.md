# Azure 패스스루

`/azure`용 패스스루 엔드포인트입니다.

## 개요

| 기능 | 지원 여부 | 참고 |
|-------|-------|-------|
| 비용 추적 | ❌ | 지원되지 않음 |
| 로깅 | ✅ | 모든 연동에서 작동 |
| 스트리밍 | ✅ | 완전 지원 |

### 언제 사용하나요?

- 대부분의 사용 사례에서는 [네이티브 LiteLLM Azure OpenAI 연동](../providers/azure/azure)(`/chat/completions`, `/embeddings`, `/completions`, `/images` 등)을 사용하는 것이 좋습니다.
- LiteLLM이 아직 완전히 지원하지 않는 최신 또는 덜 일반적인 Azure OpenAI 엔드포인트(예: `/assistants`, `/threads`, `/vector_stores`)를 호출할 때 이 패스스루를 사용하세요.

Azure 엔드포인트(예: `https://<your-resource-name>.openai.azure.com`)를 `LITELLM_PROXY_BASE_URL/azure`로 바꾸기만 하면 됩니다.

## 사용법 예제

### Assistants API

#### Azure OpenAI 클라이언트 생성

다음을 확인하세요.
- `azure_endpoint`가 `LITELLM_PROXY_BASE_URL/azure`를 가리키도록 설정합니다.
- `LITELLM_API_KEY`를 `api_key`로 사용합니다.

```python
import openai

client = openai.AzureOpenAI(
    azure_endpoint="http://0.0.0.0:4000/azure",  # <your-proxy-url>/azure
    api_key="sk-anything",  # <your-proxy-api-key>
    api_version="2024-05-01-preview"  # required Azure API version
)
```

#### Assistant 생성

```python
assistant = client.beta.assistants.create(
    name="Math Tutor",
    instructions="You are a math tutor. Help solve equations.",
    model="gpt-4o",
)
```

#### Thread 생성
```python
thread = client.beta.threads.create()
```

#### Thread에 메시지 추가
```python
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Solve 3x + 11 = 14",
)
```

#### Assistant 실행
```python
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

#### 메시지 조회
```python
messages = client.beta.threads.messages.list(
    thread_id=thread.id
)
```

#### Assistant 삭제

```python
client.beta.assistants.delete(assistant.id)
```
