
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';

# Provider Files 엔드포인트

Files는 Assistants, Fine-tuning, Batch API 같은 기능에서 사용할 문서를 업로드하는 데 사용됩니다.

Provider의 `/files` endpoint를 OpenAI 형식으로 직접 호출할 때 사용합니다.

## 빠른 시작

- 파일 업로드
- 파일 목록 조회
- 파일 정보 조회
- 파일 삭제
- 파일 내용 가져오기

## Multi-Account 지원(Multiple OpenAI Keys)

`model_list` 항목을 참조하는 `model` 파라미터를 지정하면 files와 batches에 서로 다른 OpenAI API key를 사용할 수 있습니다. 이 방식은 **데이터베이스 없이도** 동작하며, files/batches를 서로 다른 OpenAI account로 routing할 수 있습니다.

### 동작 방식

1. 서로 다른 API key를 사용하는 모델을 `model_list`에 정의합니다.
2. File을 생성할 때 `model` 파라미터를 전달합니다.
3. LiteLLM은 routing 정보가 들어 있는 encoded ID를 반환합니다.
4. 이후 작업(retrieve, delete, batches)에는 encoded ID를 사용합니다.
5. Routing 정보가 ID에 들어 있으므로 model을 다시 지정할 필요가 없습니다.

### 설정

```yaml
model_list:
  # litellm OpenAI Account
  - model_name: "gpt-4o-litellm"
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_LITELLM_API_KEY
  
  # Free OpenAI Account
  - model_name: "gpt-4o-free"
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_FREE_API_KEY
```

### 사용법 예제

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-1234",  # Your LiteLLM proxy key
    base_url="http://0.0.0.0:4000"
)

# Create file using litellm account
file_response = client.files.create(
    file=open("batch_data.jsonl", "rb"),
    purpose="batch",
    extra_body={"model": "gpt-4o-litellm"}  # Routes to litellm key
)
print(f"File ID: {file_response.id}")
# Returns encoded ID like: file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8taWZvb2Q

# Create batch using the encoded file ID
# No need to specify model again - it's embedded in the file ID
batch_response = client.batches.create(
    input_file_id=file_response.id,  # Encoded ID
    endpoint="/v1/chat/completions",
    completion_window="24h"
)
print(f"Batch ID: {batch_response.id}")
# Returns encoded batch ID with routing info

# Retrieve batch - routing happens automatically
batch_status = client.batches.retrieve(batch_response.id)
print(f"Status: {batch_status.status}")

# List files for a specific account
files = client.files.list(
    extra_body={"model": "gpt-4o-free"}  # List free files
)

# List batches for a specific account
batches = client.batches.list(
    extra_query={"model": "gpt-4o-litellm"}  # List litellm batches
)
```

### 파라미터 옵션

`model` 파라미터는 다음 방식으로 전달할 수 있습니다.

- **Request body**: `extra_body={"model": "gpt-4o-litellm"}`
- **Query parameter**: `?model=gpt-4o-litellm`
- **Header**: `x-litellm-model: gpt-4o-litellm`

### Encoded ID 동작 방식

- `model` 파라미터로 file/batch를 만들면 LiteLLM은 반환 ID 안에 model name을 encode합니다.
- Encoded ID는 base64로 encode되며 다음처럼 보입니다. `file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8taWZvb2Q`
- 이후 작업(retrieve, delete, batch create)에서 이 ID를 사용하면 LiteLLM이 자동으로 다음을 수행합니다.
  1. ID를 decode합니다.
  2. Model name을 추출합니다.
  3. Credential을 조회합니다.
  4. 요청을 올바른 OpenAI account로 routing합니다.
- 원래 provider file/batch ID는 내부에 보존됩니다.

### 장점

- **데이터베이스 불필요** - 모든 routing 정보가 ID에 저장됩니다.
- **Stateless** - Proxy 재시작 후에도 동작합니다.
- **단순함** - 일반 ID처럼 전달하기만 하면 됩니다.
- **하위 호환** - 기존 `custom_llm_provider`와 `files_settings`도 계속 동작합니다.
- **확장 가능** - Managed batches 접근 방식과 맞춰져 있습니다.

### files_settings에서 마이그레이션

**기존 방식(계속 동작):**
```yaml
files_settings:
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_KEY
```

```python
# Had to specify provider on every call
client.files.create(..., extra_headers={"custom-llm-provider": "openai"})
client.files.retrieve(file_id, extra_headers={"custom-llm-provider": "openai"})
```

**새 방식(권장):**
```yaml
model_list:
  - model_name: "gpt-4o-account1"
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_KEY
```

```python
# Specify model once on create
file = client.files.create(..., extra_body={"model": "gpt-4o-account1"})

# Then just use the ID - routing is automatic
client.files.retrieve(file.id)  # No need to specify account
client.batches.create(input_file_id=file.id)  # Routes correctly
```

<Tabs>
<TabItem value="proxy" label="LiteLLM PROXY Server">

1. `config.yaml`을 설정합니다.

```
# for /files endpoints
files_settings:
  - custom_llm_provider: azure
    api_base: https://exampleopenaiendpoint-production.up.railway.app
    api_key: fake-key
    api_version: "2023-03-15-preview"
  - custom_llm_provider: openai
    api_key: os.environ/OPENAI_API_KEY
```

2. LiteLLM PROXY Server를 시작합니다.

```bash
litellm --config /path/to/config.yaml

## RUNNING on http://0.0.0.0:4000
```

3. OpenAI의 `/files` endpoint를 사용합니다.

파일 업로드

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

client.files.create(
    file=wav_data,
    purpose="user_data",
    extra_headers={"custom-llm-provider": "openai"}
)
```

파일 목록 조회

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

files = client.files.list(extra_headers={"custom-llm-provider": "openai"})
print("files=", files)
```

파일 정보 조회

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

file = client.files.retrieve(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("file=", file)
```

파일 삭제

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

response = client.files.delete(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("delete response=", response)
```

파일 내용 가져오기

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="http://0.0.0.0:4000/v1"
)

content = client.files.content(file_id="file-abc123", extra_headers={"custom-llm-provider": "openai"})
print("content=", content)
```

</TabItem>
<TabItem value="sdk" label="SDK">

**파일 업로드**
```python
from litellm
import os 

os.environ["OPENAI_API_KEY"] = "sk-.."

file_obj = await litellm.acreate_file(
    file=open("mydata.jsonl", "rb"),
    purpose="fine-tune",
    custom_llm_provider="openai",
)
print("Response from creating file=", file_obj)
```

**파일 목록 조회**
```python
files = await litellm.alist_files(
    custom_llm_provider="openai",
    limit=10
)
print("files=", files)
```

**파일 정보 조회**
```python
file = await litellm.aretrieve_file(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("file=", file)
```

**파일 삭제**
```python
response = await litellm.adelete_file(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("delete response=", response)
```

**파일 내용 가져오기**
```python
content = await litellm.afile_content(
    file_id="file-abc123",
    custom_llm_provider="openai"
)
print("file content=", content)
```

**파일 내용 가져오기(Bedrock)**
```python
# For Bedrock batch output files stored in S3
content = await litellm.afile_content(
    file_id="s3://bucket-name/path/to/file.jsonl",  # S3 URI or unified file ID
    custom_llm_provider="bedrock",
    aws_region_name="us-west-2"
)
print("file content=", content.text)
```

</TabItem>
</Tabs>


## **지원 프로바이더**:

### [OpenAI](#quick-start)

### [Azure OpenAI](./providers/azure#azure-batches-api)

### [Vertex AI](./providers/vertex#batch-apis)

### [Bedrock 배치 결과 조회](./providers/bedrock_batches#4-retrieve-batch-results)

### [Anthropic 파일 API](./providers/anthropic#files-api)

:::note
Anthropic Files API는 OpenAI와 목적이 다릅니다. **Batches나 Fine-tuning용이 아니라**, 파일을 한 번 업로드한 뒤 여러 메시지에서 `file_id`로 참조해 재업로드를 피하기 위한 기능입니다. File API 작업 자체는 무료이며, Messages 요청에서 사용된 file content는 input token으로 과금됩니다.
:::

## [Swagger API Reference](https://litellm-api.up.railway.app/#/files)
