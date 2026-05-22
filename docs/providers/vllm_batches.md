import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `vLLM` 배치 및 파일 API {#vllm---batch--files-api}

LiteLLM은 대량의 요청을 비동기적으로 처리할 수 있도록 vLLM의 Batch 및 Files API를 지원합니다.

| 기능 | 지원 여부 |
|---------|-----------|
| `/v1/files` | ✅ |
| `/v1/batches` | ✅ |
| 비용 추적 | ✅ |

## 빠른 시작

### 1. config.yaml 설정 {#1-setup-configyaml}

`config.yaml`에 vLLM 모델을 정의합니다. LiteLLM은 모델 이름을 사용해 배치 요청을 올바른 vLLM 서버로 라우팅합니다.

```yaml
model_list:
  - model_name: my-vllm-model
    litellm_params:
      model: hosted_vllm/meta-llama/Llama-2-7b-chat-hf
      api_base: http://localhost:8000  # your vLLM server
```

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```bash
litellm --config /path/to/config.yaml
```

### 3. 배치 파일 생성 {#3-create-batch-file}

배치 요청이 포함된 JSONL 파일을 생성합니다.

```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "my-vllm-model", "messages": [{"role": "user", "content": "Hello!"}]}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "my-vllm-model", "messages": [{"role": "user", "content": "How are you?"}]}}
```

### 4. 파일 업로드 및 배치 생성 {#4-upload-file--create-batch}

:::tip 모델 라우팅
LiteLLM은 배치 작업에 사용할 모델과 그에 해당하는 vLLM 서버를 알아야 합니다. 파일을 업로드할 때 `x-litellm-model` 헤더로 모델을 지정하세요. LiteLLM은 이 모델 정보를 파일 ID에 인코딩하므로, 이후 배치 작업은 자동으로 올바른 서버로 라우팅됩니다.

자세한 내용은 [Multi-Account / Model-Based Routing](../batches#multi-account--model-based-routing)을 참고하세요.
:::

<Tabs>
<TabItem value="curl" label="cURL">

**파일 업로드**

```bash
curl http://localhost:4000/v1/files \
  -H "Authorization: Bearer sk-1234" \
  -H "x-litellm-model: my-vllm-model" \
  -F purpose="batch" \
  -F file="@batch_requests.jsonl"
```

**배치 생성**

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

**배치 상태 확인**

```bash
curl http://localhost:4000/v1/batches/batch_abc123 \
  -H "Authorization: Bearer sk-1234"
```

</TabItem>
<TabItem value="python" label="Python SDK">

```python
import litellm
import asyncio

async def run_vllm_batch():
    # Upload file
    file_obj = await litellm.acreate_file(
        file=open("batch_requests.jsonl", "rb"),
        purpose="batch",
        custom_llm_provider="hosted_vllm",
    )
    print(f"File uploaded: {file_obj.id}")

    # Create batch
    batch = await litellm.acreate_batch(
        completion_window="24h",
        endpoint="/v1/chat/completions",
        input_file_id=file_obj.id,
        custom_llm_provider="hosted_vllm",
    )
    print(f"Batch created: {batch.id}")

    # Poll for completion
    while True:
        batch_status = await litellm.aretrieve_batch(
            batch_id=batch.id,
            custom_llm_provider="hosted_vllm",
        )
        print(f"Status: {batch_status.status}")
        
        if batch_status.status == "completed":
            break
        elif batch_status.status in ["failed", "cancelled"]:
            raise Exception(f"Batch failed: {batch_status.status}")
        
        await asyncio.sleep(5)

    # Get results
    if batch_status.output_file_id:
        results = await litellm.afile_content(
            file_id=batch_status.output_file_id,
            custom_llm_provider="hosted_vllm",
        )
        print(f"Results: {results}")

asyncio.run(run_vllm_batch())
```

</TabItem>
</Tabs>

## 지원되는 작업 {#supported-operations}

| 작업 | 엔드포인트 | 메서드 |
|-----------|----------|--------|
| 파일 업로드 | `/v1/files` | POST |
| 파일 목록 조회 | `/v1/files` | GET |
| 파일 조회 | `/v1/files/{file_id}` | GET |
| 파일 삭제 | `/v1/files/{file_id}` | DELETE |
| 파일 콘텐츠 가져오기 | `/v1/files/{file_id}/content` | GET |
| 배치 생성 | `/v1/batches` | POST |
| 배치 목록 조회 | `/v1/batches` | GET |
| 배치 조회 | `/v1/batches/{batch_id}` | GET |
| 배치 취소 | `/v1/batches/{batch_id}/cancel` | POST |

## 환경 변수 {#environment-variables}

```bash
# Set vLLM server endpoint
export HOSTED_VLLM_API_BASE="http://localhost:8000"

# Optional: API key if your vLLM server requires authentication
export HOSTED_VLLM_API_KEY="your-api-key"
```

## 모델 라우팅 작동 방식 {#how-model-routing-works}

`x-litellm-model: my-vllm-model`로 파일을 업로드하면 LiteLLM은 다음과 같이 동작합니다.

1. 반환되는 파일 ID에 모델 이름을 인코딩합니다.
2. 인코딩된 모델 정보를 사용해 이후 배치 작업을 올바른 vLLM 서버로 자동 라우팅합니다.
3. 배치를 생성하거나 결과를 조회할 때 모델을 다시 지정할 필요가 없습니다.

이를 통해 여러 팀이 동일한 LiteLLM proxy를 통해 서로 다른 vLLM 배포를 사용하는 멀티 테넌트 배치 처리가 가능합니다.

**더 알아보기:** [Multi-Account / Model-Based Routing](../batches#multi-account--model-based-routing)

## 관련 문서 {#related}

- [vLLM Provider 개요](./vllm)
- [Batch API 개요](../batches)
- [Files API](../files_endpoints)
