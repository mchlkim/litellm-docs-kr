import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Amazon Bedrock Mantle 개요 {#amazon-bedrock-mantle}

[Amazon Bedrock Mantle](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-mantle.html)는 Bedrock 호스팅 모델에 **OpenAI 호환 API**를 제공하는 Amazon Bedrock의 분산 추론 엔진(Project Mantle)입니다.

이 공급자를 사용하면 OpenAI 가격이 아니라 정확한 **AWS Bedrock 가격**으로 Bedrock Mantle 모델을 호출할 수 있습니다.

:::tip

**모든 Bedrock Mantle 모델을 지원합니다. litellm 요청을 보낼 때 `model=bedrock_mantle/<model-id>`를 접두사로 설정하기만 하면 됩니다.**

:::

## Claude Mythos

[Claude Mythos](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-mythos-preview.html)(`anthropic.claude-mythos-preview`)는 Bedrock Mantle에서 사용할 수 있으며, **1M 토큰 입력 컨텍스트**, 128K 출력, 추론, 비전, 도구 사용을 지원합니다.

표준 AWS 자격 증명과 함께 `bedrock/mantle/` 라우트 접두사를 사용하세요.

### /messages

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import asyncio
import litellm
import os

os.environ['AWS_ACCESS_KEY_ID'] = "your-aws-access-key"
os.environ['AWS_SECRET_ACCESS_KEY'] = "your-aws-secret-key"
os.environ['AWS_REGION_NAME'] = "us-east-1"

async def main():
    response = await litellm.anthropic_messages(
        model="bedrock/mantle/anthropic.claude-mythos-preview",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Explain quantum entanglement simply."}],
    )
    print(response)

asyncio.run(main())
```

</TabItem>
<TabItem value="ai-gateway" label="AI Gateway">

**1. config.yaml에 추가**

```yaml
model_list:
  - model_name: claude-mythos
    litellm_params:
      model: bedrock/mantle/anthropic.claude-mythos-preview
      aws_region_name: us-east-1
```

**2. LiteLLM AI Gateway 시작**

```shell
litellm --config /path/to/config.yaml
```

**3. curl로 `/v1/messages` 호출**

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-mythos",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain quantum entanglement simply."}
    ]
  }'
```

</TabItem>
</Tabs>

### /chat/completions

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['AWS_ACCESS_KEY_ID'] = "your-aws-access-key"
os.environ['AWS_SECRET_ACCESS_KEY'] = "your-aws-secret-key"
os.environ['AWS_REGION_NAME'] = "us-east-1"

response = completion(
    model="bedrock/mantle/anthropic.claude-mythos-preview",
    messages=[{"role": "user", "content": "Explain quantum entanglement simply."}],
)
print(response)
```

</TabItem>
<TabItem value="ai-gateway-chat" label="AI Gateway">

**1. config.yaml에 추가**

```yaml
model_list:
  - model_name: claude-mythos
    litellm_params:
      model: bedrock/mantle/anthropic.claude-mythos-preview
      aws_region_name: us-east-1
```

**2. LiteLLM AI Gateway 시작**

```shell
litellm --config /path/to/config.yaml
```

**3. curl로 `/v1/chat/completions` 호출**

```bash
curl -X POST http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-mythos",
    "messages": [
      {"role": "user", "content": "Explain quantum entanglement simply."}
    ]
  }'
```

</TabItem>
</Tabs>

## API 키 {#api-key}

```python
# env variable
os.environ['BEDROCK_MANTLE_API_KEY'] = "your-aws-bedrock-api-key"

# optional: override region (defaults to us-east-1)
os.environ['BEDROCK_MANTLE_REGION'] = "us-east-1"  # or use AWS_REGION
```

## 지원 모델

| 모델 | 컨텍스트 창 | 입력(1M 토큰당) | 출력(1M 토큰당) |
|-------|---------------|----------------------|------------------------|
| `openai.gpt-oss-120b` | 131K | $0.15 | $0.60 |
| `openai.gpt-oss-20b` | 131K | $0.075 | $0.30 |
| `openai.gpt-oss-safeguard-120b` | 131K | $0.15 | $0.60 |
| `openai.gpt-oss-safeguard-20b` | 131K | $0.075 | $0.30 |

## 샘플 사용법

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
)
print(response)
```

</TabItem>
<TabItem value="streaming" label="Streaming">

```python
from litellm import completion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

</TabItem>
<TabItem value="async" label="Async">

```python
import asyncio
from litellm import acompletion
import os

os.environ['BEDROCK_MANTLE_API_KEY'] = "your-bedrock-api-key"

async def main():
    response = await acompletion(
        model="bedrock_mantle/openai.gpt-oss-120b",
        messages=[{"role": "user", "content": "hello from litellm"}],
    )
    print(response)

asyncio.run(main())
```

</TabItem>
</Tabs>

## 리전 설정

API 기본 URL은 `https://bedrock-mantle.{region}.api.aws/v1`입니다. 리전은 다음 순서로 결정됩니다.

1. `BEDROCK_MANTLE_REGION` 환경 변수
2. `AWS_REGION` 환경 변수
3. 기본값: `us-east-1`

**지원 리전:** `us-east-1`, `us-east-2`, `us-west-2`, `eu-west-1`, `eu-west-2`, `eu-central-1`, `eu-south-1`, `eu-north-1`, `ap-northeast-1`, `ap-south-1`, `ap-southeast-3`, `sa-east-1`

```python
import os
os.environ['BEDROCK_MANTLE_REGION'] = "eu-west-1"

# or pass api_base directly
response = completion(
    model="bedrock_mantle/openai.gpt-oss-120b",
    messages=[{"role": "user", "content": "hello"}],
    api_base="https://bedrock-mantle.eu-west-1.api.aws/v1",
)
```

## LiteLLM Proxy 사용법

### 1. config.yaml에 Bedrock Mantle 모델 설정 {#1-set-bedrock-mantle-models-on-configyaml}

```yaml
model_list:
  - model_name: gpt-oss-120b
    litellm_params:
      model: bedrock_mantle/openai.gpt-oss-120b
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
      # optional region override:
      api_base: "https://bedrock-mantle.us-east-1.api.aws/v1"

  - model_name: gpt-oss-20b
    litellm_params:
      model: bedrock_mantle/openai.gpt-oss-20b
      api_key: os.environ/BEDROCK_MANTLE_API_KEY
```

### 2. 프록시 시작

```shell
litellm --config /path/to/config.yaml
```

### 3. 요청 전송 {#3-send-a-request}

```python
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000",
)

response = client.chat.completions.create(
    model="gpt-oss-120b",
    messages=[{"role": "user", "content": "hello from litellm"}],
)
print(response)
```
