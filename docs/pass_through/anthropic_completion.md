import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic 패스스루 {#anthropic-passthrough}

Anthropic용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | `/messages`, `/v1/messages/batches` 엔드포인트의 모든 모델을 지원합니다 |
| 로깅 | ✅ | 모든 통합에서 작동합니다 |
| 최종 사용자 추적 | ✅ | Prometheus `end_user` 레이블은 기본적으로 꺼져 있습니다. `litellm.enable_end_user_cost_tracking_prometheus_only`로 활성화하세요 |
| Streaming | ✅ | |

`https://api.anthropic.com`을 `LITELLM_PROXY_BASE_URL/anthropic`으로 바꾸기만 하면 됩니다.

#### **예제 사용법**


<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```

</TabItem>
<TabItem value="python" label="Anthropic Python SDK">

```python
from anthropic import Anthropic

# Initialize client with proxy base URL
client = Anthropic(
    base_url="http://0.0.0.0:4000/anthropic", # <proxy-base-url>/anthropic
    api_key="sk-anything" # proxy virtual key
)

# Make a completion request
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, world"}
    ]
)

print(response)
```

</TabItem>
</Tabs>

**모든** Anthropic 엔드포인트를 지원합니다(스트리밍 포함).

[**모든 Anthropic 엔드포인트 보기**](https://docs.anthropic.com/en/api/messages)

## 빠른 시작

Anthropic [`/messages` endpoint](https://docs.anthropic.com/en/api/messages)를 호출해 보겠습니다.

1. 환경에 Anthropic API 키를 추가합니다.

```bash
export ANTHROPIC_API_KEY=""
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

Anthropic /messages 엔드포인트를 호출해 보겠습니다.

```bash
curl http://0.0.0.0:4000/anthropic/v1/messages \
     --header "x-api-key: $LITELLM_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "content-type: application/json" \
     --data \
    '{
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```


## 예제

`http://0.0.0.0:4000/anthropic` 뒤의 모든 경로는 공급자별 라우트로 취급되며 그에 맞게 처리됩니다.

주요 변경 사항:

| **원래 엔드포인트**                                | **대체 값**                  |
|------------------------------------------------------|-----------------------------------|
| `https://api.anthropic.com`          | `http://0.0.0.0:4000/anthropic` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `bearer $ANTHROPIC_API_KEY`                                 | `bearer anything` (프록시에 가상 키가 설정되어 있으면 `bearer LITELLM_VIRTUAL_KEY` 사용)                    |
    

### **예제 1: Messages endpoint** {#messages-endpoint}

#### LiteLLM Proxy 호출 {#litellm-proxy-call}

```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header "x-api-key: $LITELLM_API_KEY" \
    --header "anthropic-version: 2023-06-01" \
    --header "content-type: application/json" \
  --data '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
  }'
```

#### 직접 Anthropic API 호출 {#direct-anthropic-api-call}

```bash
curl https://api.anthropic.com/v1/messages \
     --header "x-api-key: $ANTHROPIC_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "content-type: application/json" \
     --data \
    '{
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```

### **예제 2: Token Counting API** {#token-counting-api}

#### LiteLLM Proxy 호출 {#litellm-proxy-call-1}

```bash
curl --request POST \
    --url http://0.0.0.0:4000/anthropic/v1/messages/count_tokens \
    --header "x-api-key: $LITELLM_API_KEY" \
    --header "anthropic-version: 2023-06-01" \
    --header "anthropic-beta: token-counting-2024-11-01" \
    --header "content-type: application/json" \
    --data \
    '{
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```

#### 직접 Anthropic API 호출 {#direct-anthropic-api-call-1}

```bash
curl https://api.anthropic.com/v1/messages/count_tokens \
     --header "x-api-key: $ANTHROPIC_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "anthropic-beta: token-counting-2024-11-01" \
     --header "content-type: application/json" \
     --data \
'{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
}'
```

### **예제 3: Batch Messages** {#batch-messages}


#### LiteLLM Proxy 호출 {#litellm-proxy-call-2}

```bash
curl --request POST \
    --url http://0.0.0.0:4000/anthropic/v1/messages/batches \
    --header "x-api-key: $LITELLM_API_KEY" \
    --header "anthropic-version: 2023-06-01" \
    --header "anthropic-beta: message-batches-2024-09-24" \
    --header "content-type: application/json" \
    --data \
'{
    "requests": [
        {
            "custom_id": "my-first-request",
            "params": {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": "Hello, world"}
                ]
            }
        },
        {
            "custom_id": "my-second-request",
            "params": {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": "Hi again, friend"}
                ]
            }
        }
    ]
}'
```

#### 직접 Anthropic API 호출 {#direct-anthropic-api-call-2}

```bash
curl https://api.anthropic.com/v1/messages/batches \
     --header "x-api-key: $ANTHROPIC_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "anthropic-beta: message-batches-2024-09-24" \
     --header "content-type: application/json" \
     --data \
'{
    "requests": [
        {
            "custom_id": "my-first-request",
            "params": {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": "Hello, world"}
                ]
            }
        },
        {
            "custom_id": "my-second-request",
            "params": {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": "Hi again, friend"}
                ]
            }
        }
    ]
}'
```

:::note 배치 비용 추적에 필요한 설정
배치 패스스루 비용 추적이 제대로 작동하려면 `proxy_config.yaml`에 Anthropic 모델을 정의해야 합니다.

```yaml
model_list:
  - model_name: claude-sonnet-4-5-20250929  # or any alias
    litellm_params:
      model: anthropic/claude-sonnet-4-5-20250929
      api_key: os.environ/ANTHROPIC_API_KEY
```

이 설정을 통해 폴링 메커니즘이 공급자를 올바르게 식별하고 비용 계산에 필요한 배치 상태를 가져올 수 있습니다.
:::

## 고급 {#advanced}

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Anthropic API 키를 제공하지 않으면서도 Anthropic 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용하세요.

### 가상 키와 함께 사용 {#use-with-virtual-keys}

1. 환경을 설정합니다.

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export COHERE_API_KEY=""
```

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

2. 가상 키를 생성합니다.

```bash
curl -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Authorization: Bearer sk-1234' \
-H 'Content-Type: application/json' \
-d '{}'
```

예상 응답

```bash
{
    ...
    "key": "sk-1234ewknldferwedojwojw"
}
```

3. 테스트합니다.


```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-1234ewknldferwedojwojw" \
  --data '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
  }'
```


### `litellm_metadata` 보내기(tags, 최종 사용자 비용 추적) {#send-litellm_metadata-tags-end-user-cost-tracking}

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl --request POST \
  --url http://0.0.0.0:4000/anthropic/v1/messages \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ],
    "litellm_metadata": {
        "tags": ["test-tag-1", "test-tag-2"], 
        "user": "test-user" # track end-user/customer cost
    }
  }'
```

</TabItem>
<TabItem value="python" label="Anthropic Python SDK">

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://0.0.0.0:4000/anthropic",
    api_key="sk-anything"
)

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, world"}
    ],
    extra_body={
        "litellm_metadata": {
            "tags": ["test-tag-1", "test-tag-2"], 
            "user": "test-user" # track end-user/customer cost
        }
    }, 
    ## OR## 
    metadata={ # anthropic native param - https://docs.anthropic.com/en/api/messages
        "user_id": "test-user" # track end-user/customer cost
    }

)

print(response)
```

</TabItem>
</Tabs>
