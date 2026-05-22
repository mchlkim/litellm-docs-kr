import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Bedrock 배치 {#bedrock-batches}

LiteLLM을 통해 Amazon Bedrock Batch Inference API를 사용합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Amazon Bedrock Batch Inference를 사용하면 대규모 데이터셋에서 비동기적으로 추론을 실행할 수 있습니다 |
| 제공자 문서 | [AWS Bedrock Batch Inference ↗](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html) |
| 비용 추적 | ✅ 지원됨 |

## 개요

다음 용도로 사용합니다:

- Bedrock 모델로 대규모 데이터셋에 대한 배치 추론 실행
- 키/사용자/팀별 배치 모델 접근 제어(chat completion 모델과 동일)
- 배치 입력/출력 파일용 S3 스토리지 관리

## (Proxy 관리자) 사용법 {#proxy-admin-사용법}

개발자에게 Bedrock Batch 모델 접근 권한을 부여하는 방법입니다.

### 1. config.yaml 설정 {#1-setup-configyaml}

- 각 모델에 `mode: batch`를 지정합니다. 개발자가 해당 모델이 배치 모델임을 알 수 있습니다.
- 배치 작업에 사용할 S3 버킷과 AWS 자격 증명을 구성합니다.

```yaml showLineNumbers title="litellm_config.yaml"
model_list:
  - model_name: "bedrock-batch-claude"
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      #########################################################
      ########## batch specific params ########################
      s3_bucket_name: litellm-proxy
      s3_region_name: us-west-2
      s3_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      s3_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_batch_role_arn: arn:aws:iam::888602223428:role/service-role/AmazonBedrockExecutionRoleForAgents_BB9HNW6V4CV
      # Optional: Custom KMS encryption key for S3 output
      # s3_encryption_key_id: arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
    model_info: 
      mode: batch # 👈 SPECIFY MODE AS BATCH, to tell user this is a batch model
```

**필수 매개변수:**

| 매개변수 | 설명 |
|-----------|-------------|
| `s3_bucket_name` | 배치 입력/출력 파일용 S3 버킷 |
| `s3_region_name` | S3 버킷의 AWS 리전 |
| `s3_access_key_id` | S3 버킷용 AWS 액세스 키 |
| `s3_secret_access_key` | S3 버킷용 AWS 시크릿 키 |
| `aws_batch_role_arn` | Bedrock 배치 작업용 IAM role ARN입니다. Bedrock Batch API에는 IAM role ARN 설정이 필요합니다. |
| `mode: batch` | LiteLLM에 이 모델이 배치 모델임을 나타냅니다 |

**선택 매개변수:**

| 매개변수 | 설명 |
|-----------|-------------|
| `s3_encryption_key_id` | S3 출력 데이터용 사용자 지정 KMS 암호화 키 ID입니다. 지정하지 않으면 Bedrock은 AWS 관리형 암호화 키를 사용합니다. |

### 2. Virtual Key 생성 {#2-create-virtual-key}

```bash showLineNumbers title="create_virtual_key.sh"
curl -L -X POST 'https://{PROXY_BASE_URL}/key/generate' \
-H 'Authorization: Bearer ${PROXY_API_KEY}' \
-H 'Content-Type: application/json' \
-d '{"models": ["bedrock-batch-claude"]}'
```

이제 virtual key를 사용해 배치 모델에 접근할 수 있습니다(개발자 흐름 참고).

## (개발자) 사용법 {#developer-사용법}

LiteLLM 관리 파일을 생성하고 해당 파일로 Bedrock Batch CRUD 작업을 실행하는 방법입니다.

### 1. request.jsonl 생성 {#1-create-requestjsonl}

- `/model_group/info`를 통해 사용 가능한 모델을 확인합니다.
- `mode: batch`가 있는 모든 모델을 확인합니다.
- .jsonl의 `model`을 `/model_group/info`에서 확인한 모델로 설정합니다.

```json showLineNumbers title="bedrock_batch_completions.jsonl"
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "bedrock-batch-claude", "messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "bedrock-batch-claude", "messages": [{"role": "system", "content": "You are an unhelpful assistant."}, {"role": "user", "content": "Hello world!"}], "max_tokens": 1000}}
```

예상 동작:

- LiteLLM은 이를 Bedrock 배포별 값으로 변환합니다(예: `bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0`).

### 2. 파일 업로드 {#2-upload-file}

LiteLLM 관리 파일과 요청 검증을 활성화하려면 `target_model_names: "<model-name>"`을 지정합니다.

모델 이름은 request.jsonl의 모델 이름과 같아야 합니다.

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
from openai import OpenAI

client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-1234",
)

# Upload file
batch_input_file = client.files.create(
    file=open("./bedrock_batch_completions.jsonl", "rb"), # {"model": "bedrock-batch-claude"} <-> {"model": "bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0"}
    purpose="batch",
    extra_body={"target_model_names": "bedrock-batch-claude"}
)
print(batch_input_file)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Upload File"
curl http://localhost:4000/v1/files \
    -H "Authorization: Bearer sk-1234" \
    -F purpose="batch" \
    -F file="@bedrock_batch_completions.jsonl" \
    -F extra_body='{"target_model_names": "bedrock-batch-claude"}'
```

</TabItem>
</Tabs>

**파일은 어디에 기록되나요?**:

파일은 구성에 지정된 S3 버킷에 기록되고 Bedrock 배치 추론을 위해 준비됩니다.

### 3. 배치 생성 {#3-create-the-batch}

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
...
# Create batch
batch = client.batches.create( 
    input_file_id=batch_input_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={"description": "Test batch job"},
)
print(batch)
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Create Batch Request"
curl http://localhost:4000/v1/batches \
    -H "Authorization: Bearer sk-1234" \
    -H "Content-Type: application/json" \
    -d '{
        "input_file_id": "file-abc123",
        "endpoint": "/v1/chat/completions",
        "completion_window": "24h",
        "metadata": {"description": "Test batch job"}
    }'
```

</TabItem>
</Tabs>

### 4. 배치 결과 조회 {#4-retrieve-batch-results}

배치 작업이 완료되면 S3에서 결과를 다운로드합니다:

<Tabs>
<TabItem value="python" label="Python">

```python showLineNumbers title="bedrock_batch.py"
...
# Wait for batch completion (check status periodically)
batch_status = client.batches.retrieve(batch_id=batch.id)

if batch_status.status == "completed":
    # Download the output file
    result = client.files.content(
        file_id=batch_status.output_file_id,
        extra_headers={"custom-llm-provider": "bedrock"}
    )
    
    # Save or process the results
    with open("batch_output.jsonl", "wb") as f:
        f.write(result.content)
    
    # Parse JSONL results
    for line in result.text.strip().split('\n'):
        record = json.loads(line)
        print(f"Record ID: {record['recordId']}")
        print(f"Output: {record.get('modelOutput', {})}")
```

</TabItem>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Download Batch Results"
# First retrieve batch to get output_file_id
curl http://localhost:4000/v1/batches/batch_abc123 \
    -H "Authorization: Bearer sk-1234"

# Then download the output file
curl http://localhost:4000/v1/files/{output_file_id}/content \
    -H "Authorization: Bearer sk-1234" \
    -H "custom-llm-provider: bedrock" \
    -o batch_output.jsonl
```

</TabItem>
<TabItem value="litellm-direct" label="LiteLLM Direct">

```python showLineNumbers title="bedrock_batch.py"
import litellm
from litellm import file_content

# Download using litellm directly (bypasses proxy managed files)
result = file_content(
    file_id=batch_status.output_file_id,  # Can be S3 URI or unified file ID
    custom_llm_provider="bedrock",
    aws_region_name="us-west-2",
)

# Process results
print(result.text)
```

</TabItem>
</Tabs>

**출력 형식:**

배치 출력 파일은 JSONL 형식이며 각 줄에는 다음이 포함됩니다:

```json
{
  "recordId": "request-1",
  "modelInput": {
    "messages": [...],
    "max_tokens": 1000
  },
  "modelOutput": {
    "content": [...],
    "id": "msg_abc123",
    "model": "claude-3-5-sonnet-20240620-v1:0",
    "role": "assistant",
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 15,
      "output_tokens": 10
    }
  }
}
```

## FAQ {#faq}

### 파일은 어디에 기록되나요? {#where-are-my-files-written}

`target_model_names`를 지정하면 파일은 Bedrock 배치 모델 구성에 설정된 S3 버킷에 기록됩니다.

### 어떤 모델이 지원되나요? {#what-models-are-supported}

LiteLLM은 Batch API에서 Bedrock Anthropic 모델만 지원합니다. 다른 Bedrock 모델을 원하면 [여기](https://github.com/BerriAI/litellm/issues/new/choose)에 이슈를 등록하세요.

### 사용자 지정 KMS 암호화 키는 어떻게 사용하나요? {#how-do-i-use-a-custom-kms-encryption-key}

S3 버킷에 사용자 지정 KMS 암호화 키가 필요한 경우 `s3_encryption_key_id`를 사용해 구성에서 지정할 수 있습니다. 특정 암호화 요구사항이 있는 엔터프라이즈 고객에게 유용합니다.

암호화 키는 두 가지 방법으로 설정할 수 있습니다:

1. **config.yaml에서 설정**(권장):
```yaml
model_list:
  - model_name: "bedrock-batch-claude"
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      s3_encryption_key_id: arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
      # ... other params
```

2. **환경 변수로 설정**:
```bash
export AWS_S3_ENCRYPTION_KEY_ID=arn:aws:kms:us-west-2:123456789012:key/12345678-1234-1234-1234-123456789012
```



## 추가 자료 {#further-reading}

- [AWS Bedrock Batch Inference 문서](https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html)
- [LiteLLM 관리형 배치](../proxy/managed_batches)
- [LiteLLM Bedrock 인증](https://docs.litellm.ai/docs/providers/bedrock#boto3---authentication)
