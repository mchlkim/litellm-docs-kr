# Bedrock (boto3) SDK 사용

Bedrock용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | `/invoke` 및 `/converse` 엔드포인트 대상 |
| 부하 분산 | ✅ | 여러 배포에 걸쳐 `/invoke`, `/converse` 라우트를 부하 분산할 수 있음 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ❌ | [필요하면 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ✅ | |

`https://bedrock-runtime.{aws_region_name}.amazonaws.com`을 `LITELLM_PROXY_BASE_URL/bedrock`으로 바꾸기만 하면 됩니다 🚀

## 개요

LiteLLM은 Bedrock 엔드포인트를 호출하는 두 가지 방식을 지원합니다.

### 1. **config.yaml 사용** (모델 엔드포인트에 권장)

`config.yaml`에 Bedrock 모델을 정의하고 이름으로 참조합니다. 프록시가 인증과 라우팅을 처리합니다.

**사용 대상**: `/converse`, `/converse-stream`, `/invoke`, `/invoke-with-response-stream`

```yaml showLineNumbers
model_list:
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      aws_region_name: us-west-2
      custom_llm_provider: bedrock
```

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/converse' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"messages": [{"role": "user", "content": [{"text": "Hello"}]}]}'
```

### 2. **직접 패스스루** (모델 외 엔드포인트용)

환경 변수로 AWS 자격 증명을 설정하고 Bedrock 엔드포인트를 직접 호출합니다.

**사용 대상**: 가드레일, Knowledge Bases, Agents 및 기타 모델 외 엔드포인트

```bash showLineNumbers
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_REGION_NAME="us-west-2"
```

```bash showLineNumbers
curl "http://0.0.0.0:4000/bedrock/guardrail/my-guardrail-id/version/1/apply" \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{"contents": [{"text": {"text": "Hello"}}], "source": "INPUT"}'
```

**모든** Bedrock 엔드포인트를 지원합니다(스트리밍 포함).

[**모든 Bedrock 엔드포인트 보기**](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)

## 빠른 시작

Bedrock [`/converse` 엔드포인트](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)를 호출해 보겠습니다.

1. Bedrock 모델을 포함한 `config.yaml` 파일을 만듭니다.

```yaml showLineNumbers
model_list:
  - model_name: my-bedrock-model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      aws_region_name: us-west-2
      custom_llm_provider: bedrock
```

AWS 자격 증명을 설정합니다.

```bash showLineNumbers
export AWS_ACCESS_KEY_ID=""  # Access key
export AWS_SECRET_ACCESS_KEY="" # Secret access key
```

2. LiteLLM Proxy를 시작합니다.

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

config의 모델 이름을 사용해 Bedrock converse 엔드포인트를 호출해 보겠습니다.

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-bedrock-model/converse' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Hello, how are you?"}]
        }
    ],
    "inferenceConfig": {
        "maxTokens": 100
    }
}'
```

## config.yaml로 설정

config.yaml로 Bedrock 모델을 정의하고 패스스루 엔드포인트를 통해 사용합니다.

### 1. config.yaml에서 모델 정의

```yaml showLineNumbers
model_list:
  - model_name: my-claude-model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      aws_region_name: us-west-2
      custom_llm_provider: bedrock
  
  - model_name: my-cohere-model
    litellm_params:
      model: bedrock/cohere.command-r-v1:0
      aws_region_name: us-east-1
      custom_llm_provider: bedrock
```

### 2. config로 프록시 시작

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. Bedrock Converse 엔드포인트 호출

URL 경로에서 config의 `model_name`을 사용합니다.

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-claude-model/converse' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Hello, how are you?"}]
        }
    ],
    "inferenceConfig": {
        "temperature": 0.5,
        "maxTokens": 100
    }
}'
```

### 4. Bedrock Converse Stream 엔드포인트 호출

스트리밍 응답에는 `/converse-stream` 엔드포인트를 사용합니다.

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-claude-model/converse-stream' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Tell me a short story"}]
        }
    ],
    "inferenceConfig": {
        "temperature": 0.7,
        "maxTokens": 200
    }
}'
```

### config.yaml로 지원되는 Bedrock 엔드포인트

config.yaml의 모델을 사용할 때는 어떤 Bedrock 엔드포인트든 호출할 수 있습니다.

| 엔드포인트 | 설명 | 예제 |
|----------|-------------|---------|
| `/model/{model_name}/converse` | Converse API | `http://0.0.0.0:4000/bedrock/model/my-claude-model/converse` |
| `/model/{model_name}/converse-stream` | 스트리밍 Converse | `http://0.0.0.0:4000/bedrock/model/my-claude-model/converse-stream` |
| `/model/{model_name}/invoke` | 레거시 Invoke API | `http://0.0.0.0:4000/bedrock/model/my-claude-model/invoke` |
| `/model/{model_name}/invoke-with-response-stream` | 레거시 스트리밍 | `http://0.0.0.0:4000/bedrock/model/my-claude-model/invoke-with-response-stream` |

프록시는 `model_name`을 `config.yaml`에 설정된 실제 Bedrock 모델 ID와 리전으로 자동 해석합니다.

### 여러 배포 간 부하 분산

동일한 `model_name`으로 여러 Bedrock 배포를 정의하면 자동 부하 분산을 사용할 수 있습니다.

#### 1. config.yaml에서 여러 배포 정의

```yaml showLineNumbers
model_list:
  # First deployment - us-west-2
  - model_name: my-claude-model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      aws_region_name: us-west-2
      custom_llm_provider: bedrock
  
  # Second deployment - us-east-1 (load balanced)
  - model_name: my-claude-model
    litellm_params:
      model: bedrock/us.anthropic.claude-3-5-sonnet-20240620-v1:0
      aws_region_name: us-east-1
      custom_llm_provider: bedrock
```

#### 2. config로 프록시 시작

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 엔드포인트 호출 - 요청이 자동으로 부하 분산됨

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/my-claude-model/invoke' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{
    "max_tokens": 100,
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "anthropic_version": "bedrock-2023-05-31"
}'
```

프록시는 `us-west-2`와 `us-east-1` 배포에 요청을 자동으로 분산합니다. 이는 `/invoke`, `/invoke-with-response-stream`, `/converse`, `/converse-stream` 등 모든 Bedrock 엔드포인트에서 작동합니다.

#### 부하 분산과 함께 boto3 SDK 사용

부하 분산된 엔드포인트를 boto3 SDK로도 호출할 수 있습니다.

```python showLineNumbers
import boto3
import json
import os

# Set dummy AWS credentials (required by boto3, but not used by LiteLLM proxy)
os.environ['AWS_ACCESS_KEY_ID'] = 'dummy'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'dummy'
os.environ['AWS_BEARER_TOKEN_BEDROCK'] = "sk-1234"  # your litellm proxy api key

# Point boto3 to the LiteLLM proxy
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-west-2',
    endpoint_url='http://0.0.0.0:4000/bedrock'
)

# Call the load-balanced model
response = bedrock_runtime.invoke_model(
    modelId='my-claude-model',  # Your model_name from config.yaml
    contentType='application/json',
    accept='application/json',
    body=json.dumps({
        "max_tokens": 100,
        "messages": [
            {
                "role": "user",
                "content": "Hello, how are you?"
            }
        ],
        "anthropic_version": "bedrock-2023-05-31"
    })
)

# Parse response
response_body = json.loads(response['body'].read())
print(response_body['content'][0]['text'])
```

프록시는 설정된 모든 배포에 boto3 요청을 자동으로 부하 분산합니다.


## 예제

`http://0.0.0.0:4000/bedrock` 뒤의 모든 경로는 공급자별 라우트로 간주되어 그에 맞게 처리됩니다.

주요 변경 사항:

| **원래 엔드포인트**                                | **대체 대상**                  |
|------------------------------------------------------|-----------------------------------|
| `https://bedrock-runtime.{aws_region_name}.amazonaws.com`          | `http://0.0.0.0:4000/bedrock` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `AWS4-HMAC-SHA256..`                                 | `Bearer anything` (프록시에 가상 키가 설정되어 있으면 `Bearer LITELLM_VIRTUAL_KEY` 사용)                    |



### **예제 1: Converse API**

#### LiteLLM Proxy 호출

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/cohere.command-r-v1:0/converse' \
-H 'Authorization: Bearer sk-anything' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
         {"role": "user",
        "content": [{"text": "Hello"}]
    }
    ]
}'
```

#### 직접 Bedrock API 호출

```bash showLineNumbers
curl -X POST 'https://bedrock-runtime.us-west-2.amazonaws.com/model/cohere.command-r-v1:0/converse' \
-H 'Authorization: AWS4-HMAC-SHA256..' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
         {"role": "user",
        "content": [{"text": "Hello"}]
    }
    ]
}'
```

### **예제 2: Apply Guardrail**

**설정**: 직접 패스스루용 AWS 자격 증명을 설정합니다.

```bash showLineNumbers
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION_NAME="us-west-2"
```

프록시를 시작합니다.

```bash showLineNumbers
litellm

# RUNNING on http://0.0.0.0:4000
```

#### LiteLLM Proxy 호출

```bash showLineNumbers
curl "http://0.0.0.0:4000/bedrock/guardrail/guardrailIdentifier/version/guardrailVersion/apply" \
    -H 'Authorization: Bearer sk-anything' \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{"text": {"text": "Hello world"}}],
      "source": "INPUT"
       }'
```

#### 직접 Bedrock API 호출

```bash showLineNumbers
curl "https://bedrock-runtime.us-west-2.amazonaws.com/guardrail/guardrailIdentifier/version/guardrailVersion/apply" \
    -H 'Authorization: AWS4-HMAC-SHA256..' \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{"text": {"text": "Hello world"}}],
      "source": "INPUT"
       }'
```

### **예제 3: Query Knowledge Base**

**설정**: 직접 패스스루용 AWS 자격 증명을 설정합니다.

```bash showLineNumbers
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION_NAME="us-west-2"
```

프록시를 시작합니다.

```bash showLineNumbers
litellm

# RUNNING on http://0.0.0.0:4000
```

#### LiteLLM Proxy 호출

```bash showLineNumbers
curl -X POST "http://0.0.0.0:4000/bedrock/knowledgebases/{knowledgeBaseId}/retrieve" \
-H 'Authorization: Bearer sk-anything' \
-H 'Content-Type: application/json' \
-d '{
    "nextToken": "string",
    "retrievalConfiguration": { 
        "vectorSearchConfiguration": { 
          "filter": { ... },
          "numberOfResults": number,
          "overrideSearchType": "string"
        }
    },
    "retrievalQuery": { 
        "text": "string"
    }
}'
```

#### 직접 Bedrock API 호출

```bash showLineNumbers
curl -X POST "https://bedrock-agent-runtime.us-west-2.amazonaws.com/knowledgebases/{knowledgeBaseId}/retrieve" \
-H 'Authorization: AWS4-HMAC-SHA256..' \
-H 'Content-Type: application/json' \
-d '{
    "nextToken": "string",
    "retrievalConfiguration": { 
        "vectorSearchConfiguration": { 
          "filter": { ... },
          "numberOfResults": number,
          "overrideSearchType": "string"
        }
    },
    "retrievalQuery": { 
        "text": "string"
    }
}'
```


## 고급 - 가상 키와 함께 사용

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 AWS 키를 제공하지 않으면서 AWS Bedrock 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용합니다.

### 사용법

1. 환경 설정

```bash showLineNumbers
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export AWS_ACCESS_KEY_ID=""  # Access key
export AWS_SECRET_ACCESS_KEY="" # Secret access key
export AWS_REGION_NAME="" # us-east-1, us-east-2, us-west-1, us-west-2
```

```bash showLineNumbers
litellm

# RUNNING on http://0.0.0.0:4000
```

2. 가상 키 생성

```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 응답

```bash showLineNumbers
{
    ...
    "key": "sk-1234ewknldferwedojwojw"
}
```

3. 테스트합니다.


```bash showLineNumbers
curl -X POST 'http://0.0.0.0:4000/bedrock/model/cohere.command-r-v1:0/converse' \
-H 'Authorization: Bearer sk-1234ewknldferwedojwojw' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
         {"role": "user",
        "content": [{"text": "Hello"}]
    }
    ]
}'
```

## 고급 - Bedrock Agents

LiteLLM 프록시를 통해 Bedrock Agents를 호출합니다.

**설정**: LiteLLM 프록시 서버에 AWS 자격 증명을 설정합니다.

```bash showLineNumbers
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION_NAME="us-west-2"
```

프록시를 시작합니다.

```bash showLineNumbers
litellm

# RUNNING on http://0.0.0.0:4000
```

**Python에서 사용하는 방법**:

```python showLineNumbers
import os 
import boto3

# Set dummy AWS credentials (required by boto3, but not used by LiteLLM proxy)
os.environ["AWS_ACCESS_KEY_ID"] = "dummy"
os.environ["AWS_SECRET_ACCESS_KEY"] = "dummy"
os.environ["AWS_BEARER_TOKEN_BEDROCK"] = "sk-1234"  # your litellm proxy api key

# Create the client
runtime_client = boto3.client(
    service_name="bedrock-agent-runtime", 
    region_name="us-west-2", 
    endpoint_url="http://0.0.0.0:4000/bedrock"
)

response = runtime_client.invoke_agent(
    agentId="L1RT58GYRW",
    agentAliasId="MFPSBCXYTW",
    sessionId="12345",
    inputText="Who do you know?"
)

completion = ""

for event in response.get("completion"):
    chunk = event["chunk"]
    completion += chunk["bytes"].decode()

print(completion)
```

## LiteLLM에서 LangChain AWS SDK 사용

LiteLLM Proxy와 함께 [LangChain AWS SDK](https://python.langchain.com/docs/integrations/chat/bedrock/)를 사용하면 비용 추적, 부하 분산 및 기타 LiteLLM 기능을 사용할 수 있습니다.

### 빠른 시작

**1. LangChain AWS 설치**:

```bash showLineNumbers
uv add langchain-aws
```

**2. LiteLLM Proxy 설정**:

`config.yaml`을 만듭니다.

```yaml showLineNumbers
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0
      aws_region_name: us-east-1
      custom_llm_provider: bedrock
```

프록시 시작:

```bash showLineNumbers
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"

litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

**3. LiteLLM과 함께 LangChain 사용**:

```python showLineNumbers
from langchain_aws import ChatBedrockConverse
from langchain_core.messages import HumanMessage

# Your LiteLLM API key
API_KEY = "Bearer sk-1234"

# Initialize ChatBedrockConverse pointing to LiteLLM proxy
llm = ChatBedrockConverse(
    model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    endpoint_url="http://localhost:4000/bedrock",
    region_name="us-east-1",
    aws_access_key_id=API_KEY,
    aws_secret_access_key="bedrock"  # Any non-empty value works
)

# Invoke the model
messages = [HumanMessage(content="Hello, how are you?")]
response = llm.invoke(messages)

print(response.content)
```

### 고급 예제: 인용이 포함된 PDF 문서 처리

LangChain AWS SDK는 Bedrock의 문서 처리 기능을 지원합니다. LiteLLM과 함께 사용하는 방법은 다음과 같습니다.

```python showLineNumbers
import os
import json
from langchain_aws import ChatBedrockConverse
from langchain_core.messages import HumanMessage

# Your LiteLLM API key
API_KEY = "Bearer sk-1234"

def get_llm() -> ChatBedrockConverse:
    """Initialize LLM pointing to LiteLLM proxy"""
    llm = ChatBedrockConverse(
        model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
        base_model_id="anthropic.claude-3-7-sonnet-20250219-v1:0",
        endpoint_url="http://localhost:4000/bedrock",
        region_name="us-east-1",
        aws_access_key_id=API_KEY,
        aws_secret_access_key="bedrock"
    )
    return llm

if __name__ == "__main__":
    # Initialize the LLM
    llm = get_llm()
    
    # Read PDF file as bytes (Converse API requires raw bytes)
    with open("your-document.pdf", "rb") as file:
        file_bytes = file.read()
    
    # Prepare messages with document attachment
    messages = [
        HumanMessage(content=[
            {"text": "What is the policy number in this document?"},
            {
                "document": {
                    "format": "pdf",
                    "name": "PolicyDocument",
                    "source": {"bytes": file_bytes},
                    "citations": {"enabled": True}
                }
            }
        ])
    ]
    
    # Invoke the LLM
    response = llm.invoke(messages)
    
    # Print response with citations
    print(json.dumps(response.content, indent=4))
```

### 지원되는 LangChain 기능

모든 LangChain AWS 기능은 LiteLLM과 함께 작동합니다.

| 기능 | 지원 | 참고 |
|---------|-----------|-------|
| 텍스트 생성 | ✅ | 완전 지원 |
| 스트리밍 | ✅ | `stream()` 메서드 사용 |
| 문서 처리 | ✅ | PDF, 이미지 등 |
| 인용 | ✅ | 문서 config에서 활성화 |
| 도구 사용 | ✅ | 함수 호출 지원 |
| 멀티모달 | ✅ | 텍스트 + 이미지 + 문서 |

### 문제 해결

**문제**: `UnknownOperationException` 오류

**해결 방법**: 올바른 엔드포인트 URL 형식을 사용하고 있는지 확인합니다.
- ✅ 올바름: `http://localhost:4000/bedrock`
- ❌ 잘못됨: `http://localhost:4000/bedrock/v2`

**문제**: 인증 오류

**해결 방법**: API 키가 올바른 형식인지 확인합니다.
```python
aws_access_key_id="Bearer sk-1234"  # Include "Bearer " prefix
```
