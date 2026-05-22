# [BETA] LiteLLM Managed Files와 Batches

:::info

이 기능은 무료 LiteLLM 엔터프라이즈 기능입니다.

`litellm[proxy]` 패키지 또는 모든 `litellm` docker image에서 사용할 수 있습니다.

:::


| 기능 | 설명 | 비고 |
| --- | --- | --- |
| Proxy | ✅ |  |
| SDK | ❌ | file id를 저장하려면 postgres DB가 필요합니다 |
| 모든 [Batch providers](../batches#supported-providers)에서 사용 가능 | ✅ |  |


## 개요

다음 용도로 사용합니다:

- 여러 Azure Batch deployments 간에 로드 밸런싱
- key/user/team별 batch model access 제어(chat completion models와 동일)


## (Proxy Admin) 사용법

개발자에게 Batch 모델 접근 권한을 부여하는 방법입니다.

### 1. config.yaml 설정

- 각 모델에 `mode: batch`를 지정합니다. 개발자가 이 모델이 batch model임을 알 수 있습니다.

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "gpt-4o-batch"
    litellm_params:
      model: azure/gpt-4o-mini-general-deployment
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
    model_info: 
      mode: batch # 👈 SPECIFY MODE AS BATCH, to tell user this is a batch model
  - model_name: "gpt-4o-batch"
    litellm_params:
      model: azure/gpt-4o-mini-special-deployment
      api_base: os.environ/AZURE_API_BASE_2
      api_key: os.environ/AZURE_API_KEY_2
    model_info: 
      mode: batch # 👈 SPECIFY MODE AS BATCH, to tell user this is a batch model

```

### 2. Virtual Key 생성

```bash showLineNumbers title="create_virtual_key.sh"
curl -L -X POST 'https://{PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["gpt-4o-batch"]}'
```


이제 virtual key를 사용해 batch 모델에 접근할 수 있습니다(Developer flow 참조).

## (Developer) 사용법

LiteLLM managed file을 생성하고 해당 파일로 Batch CRUD operations를 실행하는 방법입니다.

### 1. request.jsonl 생성

- `/model_group/info`를 통해 사용 가능한 모델을 확인합니다.
- `mode: batch`가 있는 모든 모델을 확인합니다.
- .jsonl의 `model`을 `/model_group/info`에서 가져온 모델로 설정합니다.

```json showLineNumbers title="request.jsonl"
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o-batch", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-4o-batch", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
```

예상 동작:

- LiteLLM은 이를 azure deployment별 값으로 변환합니다(예: `gpt-4o-mini-general-deployment`).

### 2. 파일 업로드

LiteLLM managed files와 요청 검증을 활성화하려면 `target_model_names: "<model-name>"`을 지정합니다.

model-name은 request.jsonl의 model-name과 같아야 합니다.

```python showLineNumbers title="create_batch.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

# Upload file
batch_input_file = client.files.create(
    file=open("./request.jsonl", "rb"), # {"model": "gpt-4o-batch"} <-> {"model": "gpt-4o-mini-special-deployment"}
    purpose="batch",
    extra_body={"target_model_names": "gpt-4o-batch"}
)
print(batch_input_file)
```


**파일은 어디에 기록되나요?**:

모든 gpt-4o-batch deployments(gpt-4o-mini-general-deployment, gpt-4o-mini-special-deployment)에 기록됩니다. 이렇게 하면 3단계에서 모든 gpt-4o-batch deployments 간 로드 밸런싱이 가능합니다.

### 3. batch 생성 및 조회

```python showLineNumbers title="create_batch.py"
...
# Create batch
batch = client.batches.create( 
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "Test batch job"},
)
print(batch)

# Retrieve batch

batch_response = client.batches.retrieve(
    batch_id
)
status = batch_response.status
```

### 4. Batch Content 조회

```python showLineNumbers title="create_batch.py"
...

file_id = batch_response.output_file_id

file_response = client.files.content(file_id)
print(file_response.text)
```

### 5. batches 나열

```python showLineNumbers title="create_batch.py"
...

client.batches.list(limit=10, extra_query={"target_model_names": "gpt-4o-batch"})
```

### [출시 예정] batch 취소

```python showLineNumbers title="create_batch.py"
...

client.batches.cancel(batch_id)
```



## E2E 예제

```python showLineNumbers title="create_batch.py"
import json
from pathlib import Path
from openai import OpenAI

"""
litellm yaml: 

model_list:
    - model_name: gpt-4o-batch
      litellm_params:
        model: azure/gpt-4o-my-special-deployment
        api_key: ..
        api_base: .. 

---
request.jsonl: 
{
    {
        ...,
        "body":{"model": "gpt-4o-batch", ...}}
    }
}
"""

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

# Upload file
batch_input_file = client.files.create(
    file=open("./request.jsonl", "rb"),
    purpose="batch",
    extra_body={"target_model_names": "gpt-4o-batch"}
)
print(batch_input_file) 


# Create batch
batch = client.batches.create( # UPDATE BATCH ID TO FILE ID 
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "Test batch job"},
)
print(batch)
batch_id = batch.id

# Retrieve batch

batch_response = client.batches.retrieve( # LOG VIRTUAL MODEL NAME
    batch_id
)
status = batch_response.status

print(f"status: {status}, output_file_id: {batch_response.output_file_id}")

# Download file
output_file_id = batch_response.output_file_id
print(f"output_file_id: {output_file_id}")
if not output_file_id:
    output_file_id = batch_response.error_file_id

if output_file_id:
    file_response = client.files.content(
        output_file_id
    )
    raw_responses = file_response.text.strip().split("\n")

    with open(
        Path.cwd().parent / "unified_batch_output.json", "w"
    ) as output_file:
        for raw_response in raw_responses:
            json.dump(json.loads(raw_response), output_file)
            output_file.write("\n")
## List Batch

list_batch_response = client.batches.list( # LOG VIRTUAL MODEL NAME
    extra_query={"target_model_names": "gpt-4o-batch"}
)

## Cancel Batch

batch_response = client.batches.cancel( # LOG VIRTUAL MODEL NAME
    batch_id
)
status = batch_response.status

print(f"status: {status}")
```

## FAQ

### 파일은 어디에 기록되나요?

`target_model_names`가 지정되면 파일은 `target_model_names`와 일치하는 모든 deployments에 기록됩니다.

추가 인프라는 필요하지 않습니다.

## batch가 eastus-01 deployment에서 생성되었지만 이후 batch get이 (다른) eastus2-01 deployment로 라우팅될 수 있나요?

**A.** 최초 batch 생성 시 여러 모델 간에 로드 밸런싱할 수 있습니다. 생성이 완료되면 사용된 model deployment가 인코딩된 file id를 반환하므로 sticky하게 동작하며, 모든 get/delete는 해당 deployment로만 전송됩니다.





