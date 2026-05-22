import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS Bedrock - Rerank API 사용 {#aws-bedrock---rerank-api}

Bedrock의 Rerank API를 Cohere `/rerank` 형식으로 사용합니다.

:::info 비용 추적

✅ Bedrock Rerank API 호출은 **비용 추적을 지원합니다**.

:::

## 지원 파라미터

- `model` - foundation model ARN 값
- `query` - rerank 기준으로 사용할 쿼리
- `documents` - rerank할 문서 목록
- `top_n` - 반환할 결과 수

## 사용법

<Tabs>
<TabItem label="SDK" value="sdk">

```python
from litellm import rerank
import os 

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = rerank(
    model="bedrock/arn:aws:bedrock:us-west-2::foundation-model/amazon.rerank-v1:0", # provide the model ARN - get this here https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock/client/list_foundation_models.html
    query="hello",
    documents=["hello", "world"],
    top_n=2,
)

print(response)
```

</TabItem>
<TabItem label="PROXY" value="proxy">

### 1. config.yaml 설정 {#1-setup-configyaml}

```yaml
model_list:
    - model_name: bedrock-rerank
      litellm_params:
        model: bedrock/arn:aws:bedrock:us-west-2::foundation-model/amazon.rerank-v1:0
        aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
        aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
        aws_region_name: os.environ/AWS_REGION_NAME
```

### 2. proxy server 시작 {#2-start-proxy-server}

```bash
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 3. 테스트 {#3-test-it}

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bedrock-rerank",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3


  }'
```

</TabItem>
</Tabs>

## 인증

rerank에는 모든 표준 Bedrock 인증 방법이 지원됩니다. 자세한 내용은 [Bedrock 인증](./bedrock#boto3---authentication)을 참고하세요.
