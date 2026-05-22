import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /batches

Batches와 Files를 다룹니다.

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 지원 프로바이더 | OpenAI, Azure, Vertex, Bedrock, vLLM | - |
| ✨ 비용 추적 | ✅ | LiteLLM 엔터프라이즈 전용 |
| 로깅 | ✅ | 모든 로깅 연동에서 작동 |

## 빠른 시작 {#quick-start}

- Batch Completion용 파일 생성

- Batch 요청 생성

- Batch 목록 조회

- 특정 Batch와 파일 콘텐츠 조회


<Tabs>
<TabItem value="proxy" label="LiteLLM PROXY 서버">

```bash
$ export OPENAI_API_KEY="sk-..."

$ litellm

# RUNNING on http://0.0.0.0:4000
```

**Batch Completion용 파일 생성**

```shell
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer sk-1234" \
    -F purpose="batch" \
    -F file="@mydata.jsonl"
```

**Batch 요청 생성**

```bash
curl http://localhost:4000/v1/batches \
        -H "Authorization: Bearer sk-1234" \
        -H "Content-Type: application/json" \
        -d '{
            "input_file_id": "file-abc123",
            "endpoint": "/v1/chat/completions",
            "completion_window": "24h"
    }'
```

**특정 Batch 조회**

```bash
curl http://localhost:4000/v1/batches/batch_abc123 \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
```


**Batch 목록 조회**

```bash
curl http://localhost:4000/v1/batches \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
```

</TabItem>
<TabItem value="sdk" label="SDK">

**Batch Completion용 파일 생성**

```python
import litellm
import os 
import asyncio

os.environ["OPENAI_API_KEY"] = "sk-.."

file_name = "openai_batch_completions.jsonl"
_current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(_current_dir, file_name)
file_obj = await litellm.acreate_file(
    file=open(file_path, "rb"),
    purpose="batch",
    custom_llm_provider="openai",
)
print("Response from creating file=", file_obj)
```

**Batch 요청 생성**

```python
import litellm
import os 
import asyncio

create_batch_response = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=batch_input_file_id,
    custom_llm_provider="openai",
    metadata={"key1": "value1", "key2": "value2"},
)

print("response from litellm.create_batch=", create_batch_response)
```

**특정 Batch와 파일 콘텐츠 조회**

```python
    # Maximum wait time before we give up
    MAX_WAIT_TIME = 300  

    # Time to wait between each status check
    POLL_INTERVAL = 5
    
    #Time waited till now 
    waited = 0

    # Wait for the batch to finish processing before trying to retrieve output
    # This loop checks the batch status every few seconds (polling)

    while True:
        retrieved_batch = await litellm.aretrieve_batch(
            batch_id=create_batch_response.id,
            custom_llm_provider="openai"
        )
        
        status = retrieved_batch.status
        print(f"⏳ Batch status: {status}")
        
        if status == "completed" and retrieved_batch.output_file_id:
            print("✅ Batch complete. Output file ID:", retrieved_batch.output_file_id)
            break
        elif status in ["failed", "cancelled", "expired"]:
            raise RuntimeError(f"❌ Batch failed with status: {status}")
        
        await asyncio.sleep(POLL_INTERVAL)
        waited += POLL_INTERVAL
        if waited > MAX_WAIT_TIME:
            raise TimeoutError("❌ Timed out waiting for batch to complete.")

print("retrieved batch=", retrieved_batch)
# just assert that we retrieved a non None batch

assert retrieved_batch.id == create_batch_response.id

# try to get file content for our original file

file_content = await litellm.afile_content(
    file_id=batch_input_file_id, custom_llm_provider="openai"
)

print("file content = ", file_content)
```

**Batch 목록 조회**

```python
list_batches_response = litellm.list_batches(custom_llm_provider="openai", limit=2)
print("list_batches_response=", list_batches_response)
```

</TabItem>

</Tabs>


## 다중 계정 / 모델 기반 라우팅 {#multi-account--model-based-routing}

`config.yaml`의 모델별 자격 증명을 사용해 batch 작업을 서로 다른 프로바이더 계정으로 라우팅합니다. 이렇게 하면 환경 변수가 필요 없고 멀티 테넌트 batch 처리를 사용할 수 있습니다.

### 작동 방식

**우선순위:**
1. **인코딩된 Batch/File ID** (최우선) - ID에 모델 정보가 포함됨
2. **Model 파라미터** - 헤더(`x-litellm-model`), 쿼리 파라미터 또는 요청 본문을 통해 전달
3. **Custom Provider** (fallback) - 환경 변수 사용

### 설정

```yaml
model_list:
  - model_name: gpt-4o-account-1
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-account-1-key
      api_base: https://api.openai.com/v1
  
  - model_name: gpt-4o-account-2
    litellm_params:
      model: openai/gpt-4o
      api_key: sk-account-2-key
      api_base: https://api.openai.com/v1
  
  - model_name: azure-batches
    litellm_params:
      model: azure/gpt-4
      api_key: azure-key-123
      api_base: https://my-resource.openai.azure.com
      api_version: "2024-02-01"
```

### 사용법 예제

#### 시나리오 1: 모델이 포함된 인코딩 File ID

모델 파라미터와 함께 파일을 업로드하면 LiteLLM이 파일 ID에 모델 정보를 인코딩합니다. 이후 모든 작업은 해당 자격 증명을 자동으로 사용합니다.

```bash
# Step 1: Upload file with model
curl http://localhost:4000/v1/files \
  -H "Authorization: Bearer sk-1234" \
  -H "x-litellm-model: gpt-4o-account-1" \
  -F purpose="batch" \
  -F file="@batch.jsonl"

# Response includes encoded file ID:
# {
#   "id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
#   ...
# }

# Step 2: Create batch - automatically routes to gpt-4o-account-1
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# Batch ID is also encoded with model:
# {
#   "id": "batch_bGl0ZWxsbTpiYXRjaF82OTIwM2IzNjg0MDQ4MTkwYTA3ODQ5NDY3YTFjMDJkYTttb2RlbCxncHQtNG8tYWNjb3VudC0x",
#   "input_file_id": "file-bGl0ZWxsbTpmaWxlLUxkaUwzaVYxNGZRVlpYcU5KVEdkSjk7bW9kZWwsZ3B0LTRvLWFjY291bnQtMQ",
#   ...
# }

# Step 3: Retrieve batch - automatically routes to gpt-4o-account-1
curl http://localhost:4000/v1/batches/batch_bGl0ZWxsbTpiYXRjaF82OTIwM2IzNjg0MDQ4MTkwYTA3ODQ5NDY3YTFjMDJkYTttb2RlbCxncHQtNG8tYWNjb3VudC0x \
  -H "Authorization: Bearer sk-1234"
```

**✅ 장점:**
- 모든 요청마다 모델을 지정할 필요가 없음
- 파일 및 batch ID가 어떤 계정에서 생성되었는지 기억함
- 조회, 취소, 파일 콘텐츠 작업을 자동 라우팅

#### 시나리오 2: 헤더/쿼리 파라미터를 통한 모델 지정

ID에 인코딩하지 않고 각 요청에서 모델을 지정합니다.

```bash
# Create batch with model header
curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer sk-1234" \
  -H "x-litellm-model: gpt-4o-account-2" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# Or use query parameter
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2" \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'

# List batches for specific model
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2" \
  -H "Authorization: Bearer sk-1234"
```

**✅ 사용 사례:**
- 일회성 batch 작업
- 작업별로 서로 다른 모델 사용
- 라우팅을 명시적으로 제어

#### 시나리오 3: 환경 변수 (fallback)

모델을 지정하지 않았을 때 환경 변수를 사용하는 기존 방식입니다.

```bash
export OPENAI_API_KEY="sk-env-key"

curl http://localhost:4000/v1/batches \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

**✅ 사용 사례:**
- 이전 버전과의 호환성
- 단순한 단일 계정 설정
- 빠른 프로토타이핑

### 전체 다중 계정 예제

```bash
# Upload file to Account 1
FILE_1=$(curl -s http://localhost:4000/v1/files \
  -H "x-litellm-model: gpt-4o-account-1" \
  -F purpose="batch" \
  -F file="@batch1.jsonl" | jq -r '.id')

# Upload file to Account 2
FILE_2=$(curl -s http://localhost:4000/v1/files \
  -H "x-litellm-model: gpt-4o-account-2" \
  -F purpose="batch" \
  -F file="@batch2.jsonl" | jq -r '.id')

# Create batch on Account 1 (auto-routed via encoded file ID)
BATCH_1=$(curl -s http://localhost:4000/v1/batches \
  -d "{\"input_file_id\": \"$FILE_1\", \"endpoint\": \"/v1/chat/completions\", \"completion_window\": \"24h\"}" | jq -r '.id')

# Create batch on Account 2 (auto-routed via encoded file ID)
BATCH_2=$(curl -s http://localhost:4000/v1/batches \
  -d "{\"input_file_id\": \"$FILE_2\", \"endpoint\": \"/v1/chat/completions\", \"completion_window\": \"24h\"}" | jq -r '.id')

# Retrieve both batches (auto-routed to correct accounts)
curl http://localhost:4000/v1/batches/$BATCH_1
curl http://localhost:4000/v1/batches/$BATCH_2

# List batches per account
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-1"
curl "http://localhost:4000/v1/batches?model=gpt-4o-account-2"
```

### 모델 라우팅을 사용하는 SDK 사용법

```python
import litellm
import asyncio

# Upload file with model routing
file_obj = await litellm.acreate_file(
    file=open("batch.jsonl", "rb"),
    purpose="batch",
    model="gpt-4o-account-1",  # Route to specific account
)

print(f"File ID: {file_obj.id}")
# File ID is encoded with model info

# Create batch - automatically uses gpt-4o-account-1 credentials
batch = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id=file_obj.id,  # Model info embedded in ID
)

print(f"Batch ID: {batch.id}")
# Batch ID is also encoded

# Retrieve batch - automatically routes to correct account
retrieved = await litellm.aretrieve_batch(
    batch_id=batch.id,  # Model info embedded in ID
)

print(f"Batch status: {retrieved.status}")

# Or explicitly specify model
batch2 = await litellm.acreate_batch(
    completion_window="24h",
    endpoint="/v1/chat/completions",
    input_file_id="file-regular-id",
    model="gpt-4o-account-2",  # Explicit routing
)
```

### ID 인코딩 작동 방식

LiteLLM은 base64를 사용해 파일 및 batch ID에 모델 정보를 인코딩합니다.

```
Original:  file-abc123
Encoded:   file-bGl0ZWxsbTpmaWxlLWFiYzEyMzttb2RlbCxncHQtNG8tdGVzdA
           └─┬─┘ └──────────────────┬──────────────────────┘
          prefix      base64(litellm:file-abc123;model,gpt-4o-test)

Original:  batch_xyz789
Encoded:   batch_bGl0ZWxsbTpiYXRjaF94eXo3ODk7bW9kZWwsZ3B0LTRvLXRlc3Q
           └──┬──┘ └──────────────────┬──────────────────────┘
           prefix       base64(litellm:batch_xyz789;model,gpt-4o-test)
```

이 인코딩은 다음을 제공합니다.
- ✅ OpenAI 호환 접두사(`file-`, `batch_`) 보존
- ✅ 클라이언트에 투명하게 동작
- ✅ 추가 파라미터 없이 자동 라우팅 지원
- ✅ 모든 batch 및 file 엔드포인트에서 작동

### 지원 엔드포인트

모든 batch 및 file 엔드포인트는 모델 기반 라우팅을 지원합니다.

| 엔드포인트 | 메서드 | 모델 라우팅 |
|----------|--------|---------------|
| `/v1/files` | POST | ✅ 헤더/쿼리/본문을 통해 지정 |
| `/v1/files/{file_id}` | GET | ✅ 인코딩된 ID + 헤더/쿼리에서 자동 지정 |
| `/v1/files/{file_id}/content` | GET | ✅ 인코딩된 ID + 헤더/쿼리에서 자동 지정 |
| `/v1/files/{file_id}` | DELETE | ✅ 인코딩된 ID에서 자동 지정 |
| `/v1/batches` | POST | ✅ file ID + 헤더/쿼리/본문에서 자동 지정 |
| `/v1/batches` | GET | ✅ 헤더/쿼리를 통해 지정 |
| `/v1/batches/{batch_id}` | GET | ✅ 인코딩된 ID에서 자동 지정 |
| `/v1/batches/{batch_id}/cancel` | POST | ✅ 인코딩된 ID에서 자동 지정 |

## **지원 프로바이더**:
### [Azure OpenAI](./providers/azure#azure-batches-api)
### [OpenAI](#quick-start)
### [Vertex AI](./providers/vertex#batch-apis)
### [Bedrock](./providers/bedrock_batches)
### [vLLM](./providers/vllm_batches)


## Batches API 비용 추적 작동 방식

LiteLLM은 두 가지 주요 이벤트를 로깅해 batch 처리 비용을 추적합니다.

| 이벤트 유형 | 설명 | 로깅 시점 |
|------------|-------------|------------------|
| `acreate_batch` | 최초 batch 생성 | batch 요청이 제출될 때 |
| `batch_success` | 최종 사용량 및 비용 | batch 처리가 완료될 때 |

비용 계산:

- LiteLLM은 완료될 때까지 batch 상태를 폴링합니다.
- 완료되면 출력 파일의 모든 응답에서 사용량과 비용을 집계합니다.
- 총 `token` 및 `response_cost`는 모든 batch 응답을 합산한 지표를 반영합니다.





## [Swagger API 참조](https://litellm-api.up.railway.app/#/batch)
