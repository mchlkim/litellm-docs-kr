import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /assistants

:::warning 지원 종료 안내

OpenAI는 Assistants API를 지원 종료 대상으로 지정했습니다. **2026년 8월 26일**에 종료됩니다.

대신 [Responses API](/litellm-docs-kr/docs/response_api)로 마이그레이션하는 것을 고려하세요. 자세한 내용은 [OpenAI의 마이그레이션 가이드](https://platform.openai.com/docs/guides/responses-vs-assistants)를 참고하세요.

:::

Threads, Messages, Assistants를 다룹니다.

LiteLLM은 현재 다음을 지원합니다:
- Assistants 생성
- Assistants 삭제
- Assistants 조회
- Thread 생성
- Thread 조회
- Messages 추가
- Messages 조회
- Thread 실행


## **지원 프로바이더**:
- [OpenAI](#quick-start)
- [Azure OpenAI](#azure-openai)
- [OpenAI 호환 API](#openai-compatible-apis)

## 빠른 시작

기존 Assistant를 호출합니다.

- Assistant를 조회합니다.

- 사용자가 대화를 시작하면 Thread를 생성합니다.

- 사용자가 질문하면 Thread에 Messages를 추가합니다.

- Thread에서 Assistant를 실행해 모델과 도구를 호출하고 응답을 생성합니다.

### SDK + 프록시 <a id="sdk--proxy"></a>
<Tabs>
<TabItem value="sdk" label="SDK">

**Assistant 생성**


```python
import litellm
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

assistant = litellm.create_assistants(
            custom_llm_provider="openai",
            model="gpt-4-turbo",
            instructions="You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
            name="Math Tutor",
            tools=[{"type": "code_interpreter"}],
)

### ASYNC USAGE ### 
# assistant = await litellm.acreate_assistants(
#             custom_llm_provider="openai",
#             model="gpt-4-turbo",
#             instructions="You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
#             name="Math Tutor",
#             tools=[{"type": "code_interpreter"}],
# )
```

**Assistant 조회**

```python
from litellm import get_assistants, aget_assistants
import os 

# setup env
os.environ["OPENAI_API_KEY"] = "sk-.."

assistants = get_assistants(custom_llm_provider="openai")

### ASYNC USAGE ### 
# assistants = await aget_assistants(custom_llm_provider="openai")
```

**Thread 생성**

```python
from litellm import create_thread, acreate_thread
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

### ASYNC USAGE ### 
# new_thread = await acreate_thread(custom_llm_provider="openai",messages=[{"role": "user", "content": "Hey, how's it going?"}])
```

**Thread에 Messages 추가**

```python
from litellm import create_thread, get_thread, aget_thread, add_message, a_add_message
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

## CREATE A THREAD
_new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

## OR retrieve existing thread
received_thread = get_thread(
            custom_llm_provider="openai",
            thread_id=_new_thread.id,
        )

### ASYNC USAGE ### 
# received_thread = await aget_thread(custom_llm_provider="openai", thread_id=_new_thread.id,)

## ADD MESSAGE TO THREAD
message = {"role": "user", "content": "Hey, how's it going?"}
added_message = add_message(
            thread_id=_new_thread.id, custom_llm_provider="openai", **message
        )

### ASYNC USAGE ### 
# added_message = await a_add_message(thread_id=_new_thread.id, custom_llm_provider="openai", **message)
```

**Thread에서 Assistant 실행**

```python
from litellm import get_assistants, create_thread, add_message, run_thread, arun_thread
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."
assistants = get_assistants(custom_llm_provider="openai")

## get the first assistant ###
assistant_id = assistants.data[0].id

## GET A THREAD
_new_thread = create_thread(
            custom_llm_provider="openai",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],  # type: ignore
        )

## ADD MESSAGE
message = {"role": "user", "content": "Hey, how's it going?"}
added_message = add_message(
            thread_id=_new_thread.id, custom_llm_provider="openai", **message
        )

## 🚨 RUN THREAD
response = run_thread(
            custom_llm_provider="openai", thread_id=thread_id, assistant_id=assistant_id
        )

### ASYNC USAGE ### 
# response = await arun_thread(custom_llm_provider="openai", thread_id=thread_id, assistant_id=assistant_id)

print(f"run_thread: {run_thread}")
```
</TabItem>
<TabItem value="proxy" label="프록시">

```yaml
assistant_settings:
  custom_llm_provider: azure
  litellm_params: 
    api_key: os.environ/AZURE_API_KEY
    api_base: os.environ/AZURE_API_BASE
    api_version: os.environ/AZURE_API_VERSION
```

```bash
$ litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```


**Assistant 생성**

```bash
curl "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "gpt-4-turbo"
  }'
```


**Assistant 조회**

```bash
curl "http://0.0.0.0:4000/v1/assistants?order=desc&limit=20" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234"
```

**Thread 생성**

```bash
curl http://0.0.0.0:4000/v1/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d ''
```

**Thread 조회**

```bash
curl http://0.0.0.0:4000/v1/threads/{thread_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234"
```

**Thread에 Messages 추가**

```bash
curl http://0.0.0.0:4000/v1/threads/{thread_id}/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
      "role": "user",
      "content": "How does AI work? Explain it in simple terms."
    }'
```

**Thread에서 Assistant 실행**

```bash
curl http://0.0.0.0:4000/v1/threads/thread_abc123/runs \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "asst_abc123"
  }'
```

</TabItem>
</Tabs>

## 스트리밍 <a id="streaming"></a>

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import run_thread_stream 
import os

os.environ["OPENAI_API_KEY"] = "sk-.."

message = {"role": "user", "content": "Hey, how's it going?"}  

data = {"custom_llm_provider": "openai", "thread_id": _new_thread.id, "assistant_id": assistant_id, **message}

run = run_thread_stream(**data)
with run as run:
    assert isinstance(run, AssistantEventHandler)
    for chunk in run: 
      print(f"chunk: {chunk}")
    run.until_done()
```

</TabItem>
<TabItem value="proxy" label="프록시">

```bash
curl -X POST 'http://0.0.0.0:4000/threads/{thread_id}/runs' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
      "assistant_id": "asst_6xVZQFFy1Kw87NbnYeNebxTf",
      "stream": true
}'
```

</TabItem>
</Tabs>

## [👉 프록시 API 레퍼런스](https://litellm-api.up.railway.app/#/assistants) <a id="proxy-api-reference"></a>


## Azure OpenAI

**설정**
```yaml
assistant_settings:
  custom_llm_provider: azure
  litellm_params: 
    api_key: os.environ/AZURE_API_KEY
    api_base: os.environ/AZURE_API_BASE
```

**curl**

```bash
curl -X POST "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "<my-azure-deployment-name>"
  }'
```

## OpenAI 호환 API <a id="openai-compatible-apis"></a>

OpenAI 호환 Assistants API(예: Astra Assistants API)를 호출하려면 모델 이름에 `openai/`를 추가하면 됩니다.


**설정**
```yaml
assistant_settings:
  custom_llm_provider: openai
  litellm_params: 
    api_key: os.environ/ASTRA_API_KEY
    api_base: os.environ/ASTRA_API_BASE
```

**curl**

```bash
curl -X POST "http://localhost:4000/v1/assistants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "instructions": "You are a personal math tutor. When asked a question, write and run Python code to answer the question.",
    "name": "Math Tutor",
    "tools": [{"type": "code_interpreter"}],
    "model": "openai/<my-astra-model-name>"
  }'
```
