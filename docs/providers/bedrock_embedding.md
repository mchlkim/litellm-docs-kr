# Bedrock Embedding

## 지원되는 Embedding 모델

| Provider | LiteLLM Route | AWS Documentation | 비용 추적 |
|----------|---------------|-------------------|---------------|
| Amazon Titan | `bedrock/amazon.titan-*` | [Amazon Titan Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html) | ✅ |
| Amazon Nova | `bedrock/amazon.nova-*` | [Amazon Nova Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/nova-embed.html) | ✅ |
| Cohere | `bedrock/cohere.*` | [Cohere Embeddings](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-embed.html) | ✅ |
| TwelveLabs | `bedrock/us.twelvelabs.*` | [TwelveLabs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-twelvelabs.html) | ✅ |

## Async Invoke 지원

LiteLLM은 비동기 처리가 필요한 embedding 모델을 위해 AWS Bedrock의 async-invoke 기능을 지원합니다. 대용량 미디어 파일(동영상, 오디오)을 처리하거나 백그라운드에서 embedding을 처리해야 할 때 특히 유용합니다.

### 지원되는 모델

| Provider | Async Invoke Route | 사용 사례 |
|----------|-------------------|----------|
| Amazon Nova | `bedrock/async_invoke/amazon.nova-2-multimodal-embeddings-v1:0` | 긴 텍스트, 동영상, 오디오를 위한 segmentation 지원 multimodal embeddings |
| TwelveLabs Marengo | `bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0` | 동영상, 오디오, 이미지, 텍스트 embeddings |

### 필수 파라미터

async-invoke를 사용할 때는 다음 값을 제공해야 합니다.

| Parameter | 설명 | 필수 |
|-----------|-------------|----------|
| `output_s3_uri` | embedding 결과가 저장될 S3 URI | ✅ 예 |
| `input_type` | 입력 유형: `"text"`, `"image"`, `"video"` 또는 `"audio"` | ✅ 예 |
| `aws_region_name` | 요청에 사용할 AWS region | ✅ 예 |

### 사용법

#### 기본 Async Invoke

```python
from litellm import embedding

# Text embedding with async-invoke
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world from LiteLLM async invoke!"],
    aws_region_name="us-east-1",
    input_type="text",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

print(f"Job submitted! Invocation ARN: {response._hidden_params._invocation_arn}")
```

#### 동영상/오디오 Embedding

```python
# Video embedding (requires async-invoke)
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["s3://your-bucket/video.mp4"],  # S3 URL for video
    aws_region_name="us-east-1",
    input_type="video",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

print(f"Video embedding job submitted! ARN: {response._hidden_params._invocation_arn}")
```

#### Base64를 사용한 Image Embedding

```python
import base64

# Load and encode image
with open("image.jpg", "rb") as img_file:
    img_data = base64.b64encode(img_file.read()).decode('utf-8')
    img_base64 = f"data:image/jpeg;base64,{img_data}"

response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=[img_base64],
    aws_region_name="us-east-1",
    input_type="image",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)
```

### 작업 정보 조회

#### Job ID와 Invocation ARN 가져오기

async-invoke 응답에는 hidden parameters에 invocation ARN이 포함됩니다.

```python
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world"],
    aws_region_name="us-east-1",
    input_type="text",
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

# Access invocation ARN
invocation_arn = response._hidden_params._invocation_arn
print(f"Invocation ARN: {invocation_arn}")

# Extract job ID from ARN (last part after the last slash)
job_id = invocation_arn.split("/")[-1]
print(f"Job ID: {job_id}")
```

#### 작업 상태 확인

작업이 아직 처리 중인지 확인하려면 LiteLLM의 `retrieve_batch` 함수를 사용합니다.

```python
from litellm import retrieve_batch

def check_async_job_status(invocation_arn, aws_region_name="us-east-1"):
    """Check the status of an async invoke job using LiteLLM batch API"""
    try:
        response = retrieve_batch(
            batch_id=invocation_arn,  # Pass the invocation ARN here
            custom_llm_provider="bedrock",
            aws_region_name=aws_region_name
        )
        return response
    except Exception as e:
        print(f"Error checking job status: {e}")
        return None

# Check status
status = check_async_job_status(invocation_arn, "us-east-1")
if status:
    print(f"Job Status: {status.status}")  # "in_progress", "completed", or "failed"
    print(f"Output Location: {status.metadata['output_file_id']}")  # S3 URI where results are stored
```

#### 완료될 때까지 Polling

다음은 작업 완료를 polling하는 전체 예제입니다.

```python
def wait_for_async_job(invocation_arn, aws_region_name="us-east-1", max_wait=3600):
    """Poll job status until completion"""
    start_time = time.time()
    
    while True:
        status = retrieve_batch(
            batch_id=invocation_arn,
            custom_llm_provider="bedrock",
            aws_region_name=aws_region_name,
        )
        
        if status.status == "completed":
            print("✅ Job completed!")
            return status
        elif status.status == "failed":
            error_msg = status.metadata.get('failure_message', 'Unknown error')
            raise Exception(f"❌ Job failed: {error_msg}")
        else:
            elapsed = time.time() - start_time
            if elapsed > max_wait:
                raise TimeoutError(f"Job timed out after {max_wait} seconds")
            
            print(f"⏳ Job still processing... (elapsed: {elapsed:.0f}s)")
            time.sleep(10)  # Wait 10 seconds before checking again

# Wait for completion
completed_status = wait_for_async_job(invocation_arn)
output_s3_uri = completed_status.metadata['output_file_id']
print(f"Results available at: {output_s3_uri}")
```

**참고:** 실제 embedding 결과는 S3에 저장됩니다. 작업이 완료되면 `status.metadata['output_file_id']`에 지정된 S3 위치에서 결과를 다운로드하세요. 결과는 embedding vector를 포함하는 JSON/JSONL 형식입니다.

## `Amazon Nova Multimodal Embeddings`

Amazon Nova는 텍스트, 이미지, 동영상, 오디오용 multimodal embeddings를 지원합니다. 다양한 사용 사례에 맞게 최적화된 embedding dimension과 purpose를 유연하게 제공합니다.

### 지원되는 기능

- **Modalities**: 텍스트, 이미지, 동영상, 오디오
- **Dimensions**: 256, 384, 1024, 3072 (기본값: 3072)
- **Embedding Purposes**:
  - `GENERIC_INDEX` (default)
  - `GENERIC_RETRIEVAL`
  - `TEXT_RETRIEVAL`
  - `IMAGE_RETRIEVAL`
  - `VIDEO_RETRIEVAL`
  - `AUDIO_RETRIEVAL`
  - `CLASSIFICATION`
  - `CLUSTERING`

### Text Embedding

```python
from litellm import embedding

response = embedding(
    model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
    input=["Hello, world!"],
    aws_region_name="us-east-1",
    dimensions=1024,  # Optional: 256, 384, 1024, or 3072
)

print(response.data[0].embedding)
```

### Base64를 사용한 Image Embedding

Amazon Nova는 표준 data URL 형식을 사용한 base64 형식의 이미지를 받습니다.

```python
import base64
from litellm import embedding

# Method 1: Load image from file
with open("image.jpg", "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode('utf-8')
    # Create data URL with proper format
    image_base64 = f"data:image/jpeg;base64,{image_data}"

response = embedding(
    model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
    input=[image_base64],
    aws_region_name="us-east-1",
    dimensions=1024,
)

print(f"Image embedding: {response.data[0].embedding[:10]}...")  # First 10 dimensions
```

#### 지원되는 이미지 형식

Nova는 다음 이미지 형식을 지원합니다.
- JPEG: `data:image/jpeg;base64,...`
- PNG: `data:image/png;base64,...`
- GIF: `data:image/gif;base64,...`
- WebP: `data:image/webp;base64,...`

#### Error Handling을 포함한 전체 예제

```python
import base64
from litellm import embedding

def get_image_embedding(image_path, dimensions=1024):
    """
    Get embedding for an image file.
    
    Args:
        image_path: Path to the image file
        dimensions: Embedding dimension (256, 384, 1024, or 3072)
    
    Returns:
        List of embedding values
    """
    try:
        # Determine image format from file extension
        if image_path.lower().endswith('.png'):
            mime_type = "image/png"
        elif image_path.lower().endswith(('.jpg', '.jpeg')):
            mime_type = "image/jpeg"
        elif image_path.lower().endswith('.gif'):
            mime_type = "image/gif"
        elif image_path.lower().endswith('.webp'):
            mime_type = "image/webp"
        else:
            raise ValueError(f"Unsupported image format: {image_path}")
        
        # Read and encode image
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
            image_base64 = f"data:{mime_type};base64,{image_data}"
        
        # Get embedding
        response = embedding(
            model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0",
            input=[image_base64],
            aws_region_name="us-east-1",
            dimensions=dimensions,
        )
        
        return response.data[0].embedding
        
    except Exception as e:
        print(f"Error getting image embedding: {e}")
        raise

# Example usage
image_embedding = get_image_embedding("photo.jpg", dimensions=1024)
print(f"Got embedding with {len(image_embedding)} dimensions")
```

### Error Handling

#### 일반적인 오류

| Error | 원인 | 해결 방법 |
|-------|-------|----------|
| `ValueError: output_s3_uri cannot be empty` | S3 출력 URI 누락 | 유효한 S3 URI를 제공합니다 |
| `ValueError: Input type 'video' requires async_invoke route` | async-invoke 없이 video/audio 사용 | `bedrock/async_invoke/` model prefix를 사용합니다 |
| `ValueError: input_type is required` | input type parameter 누락 | `input_type` parameter를 지정합니다 |

#### Error Handling 예제

```python
try:
    response = embedding(
        model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
        input=["Hello world"],
        aws_region_name="us-east-1",
        input_type="text",
        output_s3_uri="s3://your-bucket/output/"  # Required for async-invoke
    )
    print("Job submitted successfully!")
    
except ValueError as e:
    if "output_s3_uri cannot be empty" in str(e):
        print("Error: Please provide a valid S3 output URI")
    elif "requires async_invoke route" in str(e):
        print("Error: Use async_invoke model for video/audio inputs")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### 권장 사항

1. **대용량 파일에는 async-invoke 사용**: Video 및 audio 파일은 비동기로 처리하는 편이 좋습니다
2. **LiteLLM batch API 사용**: 상태 확인에는 Bedrock API를 직접 호출하는 대신 `retrieve_batch()`를 사용합니다
3. **작업 상태 모니터링**: 결과 준비 여부를 알 수 있도록 batch API로 작업 상태를 주기적으로 확인합니다
4. **오류를 안정적으로 처리**: 네트워크 문제와 작업 실패에 대한 적절한 error handling을 구현합니다
5. **적절한 timeout 설정**: 대용량 파일의 처리 시간을 고려합니다
6. **대용량 입력에는 S3 사용**: Video/audio의 경우 base64 encoding 대신 S3 URL을 사용합니다

### 제한 사항

- async-invoke는 TwelveLabs Marengo 및 Amazon Nova 모델에서 지원됩니다
- 결과는 S3에 저장되며 output file ID를 사용해 별도로 가져와야 합니다
- 작업 상태 확인에는 LiteLLM의 `retrieve_batch()` 함수를 사용해야 합니다
- LiteLLM에는 내장 polling 메커니즘이 없으므로 상태 확인 loop를 직접 구현해야 합니다

### API keys
env variable로 설정하거나 litellm.embedding()에 **params로 전달할 수 있습니다**
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""        # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = ""    # Secret access key
os.environ["AWS_REGION_NAME"] = ""           # us-east-1, us-east-2, us-west-1, us-west-2
```

## 사용법
### LiteLLM Python SDK
```python
from litellm import embedding
response = embedding(
    model="bedrock/amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

### LiteLLM Proxy Server 사용

#### 1. config.yaml 설정
```yaml
model_list:
  - model_name: titan-embed-v1
    litellm_params:
      model: bedrock/amazon.titan-embed-text-v1
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
  - model_name: titan-embed-v2
    litellm_params:
      model: bedrock/amazon.titan-embed-text-v2:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

#### 2. Proxy 시작
```bash
litellm --config /path/to/config.yaml
```

#### 3. OpenAI Python SDK와 함께 사용
```python
import openai
client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.embeddings.create(
    input=["good morning from litellm"],
    model="titan-embed-v1"
)
print(response)
```

#### 4. LiteLLM Python SDK와 함께 사용
```python
import litellm
response = litellm.embedding(
    model="titan-embed-v1", # model alias from config.yaml
    input=["good morning from litellm"],
    api_base="http://0.0.0.0:4000",
    api_key="anything"
)
print(response)
```

## 지원되는 AWS Bedrock Embedding 모델

| Model Name           | 사용법                               | 지원되는 추가 OpenAI params |
|----------------------|---------------------------------------------|-----|
| **Amazon Nova Multimodal Embeddings** | `embedding(model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0", input=input)` | multimodal input(text, image, video, audio), multiple purposes, dimensions(256, 384, 1024, 3072)를 지원합니다 |
| Titan Embeddings V2 | `embedding(model="bedrock/amazon.titan-embed-text-v2:0", input=input)` | [here](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_v2_transformation.py#L59) |
| Titan Embeddings - V1 | `embedding(model="bedrock/amazon.titan-embed-text-v1", input=input)` | [here](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_g1_transformation.py#L53)
| Titan Multimodal Embeddings | `embedding(model="bedrock/amazon.titan-embed-image-v1", input=input)` | [here](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/amazon_titan_multimodal_transformation.py#L28) |
| TwelveLabs Marengo Embed 2.7 | `embedding(model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0", input=input)` | multimodal input(text, video, audio, image)을 지원합니다 |
| Cohere Embeddings - English | `embedding(model="bedrock/cohere.embed-english-v3", input=input)` | [here](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embeddings - Multilingual | `embedding(model="bedrock/cohere.embed-multilingual-v3", input=input)` | [here](https://github.com/BerriAI/litellm/blob/f5905e100068e7a4d61441d7453d7cf5609c2121/litellm/llms/bedrock/embed/cohere_transformation.py#L18)
| Cohere Embed v4 | `embedding(model="bedrock/cohere.embed-v4:0", input=input)` | text 및 image input, 설정 가능한 dimensions(256, 512, 1024, 1536), 128k context length를 지원합니다 |

### Advanced - [지원되지 않는 Params Drop](https://docs.litellm.ai/docs/completion/drop_params#openai-proxy-usage)

### Advanced - [model/provider-specific Params 전달](https://docs.litellm.ai/docs/completion/provider_specific_params#proxy-usage)
