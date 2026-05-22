# Mistral

Mistral용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ❌ | 지원되지 않음 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 최종 사용자 추적 | ❌ | [필요한 경우 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ✅ | |

`https://api.mistral.ai/v1`을 `LITELLM_PROXY_BASE_URL/mistral`로 바꾸기만 하면 됩니다. 🚀

#### **예제 사용법**

```bash
curl -L -X POST 'http://0.0.0.0:4000/mistral/v1/ocr' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    }

}'
```

Mistral의 **모든** 엔드포인트를 지원합니다(스트리밍 포함).

## 빠른 시작

Mistral [`/chat/completions` 엔드포인트](https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post)를 호출해 보겠습니다.

1. 환경에 MISTRAL_API_KEY를 추가합니다.

```bash
export MISTRAL_API_KEY="sk-1234"
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

Mistral `/ocr` 엔드포인트를 호출해 보겠습니다.

```bash
curl -L -X POST 'http://0.0.0.0:4000/mistral/v1/ocr' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
-d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    }

}'
```


## 예제

`http://0.0.0.0:4000/mistral` 뒤의 모든 경로는 공급자별 라우트로 처리됩니다.

주요 변경 사항:

| **원본 엔드포인트**                                | **대체 값**                  |
|------------------------------------------------------|-----------------------------------|
| `https://api.mistral.ai/v1`          | `http://0.0.0.0:4000/mistral` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `bearer $MISTRAL_API_KEY`                                 | `bearer anything`(프록시에 가상 키를 설정한 경우 `bearer LITELLM_VIRTUAL_KEY` 사용)                    |


### **예제 1: OCR 엔드포인트** {#example-1-ocr-endpoint}

#### LiteLLM Proxy 호출 {#litellm-proxy-call}

```bash
curl -L -X POST 'http://0.0.0.0:4000/mistral/v1/ocr' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_API_KEY' \
-d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    }
}'
```


#### 직접 Mistral API 호출 {#direct-mistral-api-call}

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    "include_image_base64": true
  }'
```

### **예제 2: 채팅 API** {#example-2-chat-api}

#### LiteLLM Proxy 호출 {#litellm-proxy-call-1}

```bash
curl -L -X POST 'http://0.0.0.0:4000/mistral/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": "I am going to Paris, what should I see?"
        }
    ],
    "max_tokens": 2048,
    "temperature": 0.8,
    "top_p": 0.1,
    "model": "mistral-large-latest",
}'
```

#### 직접 Mistral API 호출 {#direct-mistral-api-call-1}

```bash
curl -L -X POST 'https://api.mistral.ai/v1/chat/completions' \
-H 'Content-Type: application/json' \
-d '{
    "messages": [
        {
            "role": "user",
            "content": "I am going to Paris, what should I see?"
        }
    ],
    "max_tokens": 2048,
    "temperature": 0.8,
    "top_p": 0.1,
    "model": "mistral-large-latest",
}'
```


## 고급 - 가상 키와 함께 사용 {#advanced---use-with-virtual-keys}

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Mistral API 키를 제공하지 않으면서도 Mistral 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용합니다.

### 사용법

1. 환경을 설정합니다.

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export MISTRAL_API_BASE=""
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
curl -L -X POST 'http://0.0.0.0:4000/mistral/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234ewknldferwedojwojw' \
  --data '{
    "messages": [
        {
            "role": "user",
            "content": "I am going to Paris, what should I see?"
        }
    ],
    "max_tokens": 2048,
    "temperature": 0.8,
    "top_p": 0.1,
    "model": "qwen2.5-7b-instruct",
}'
```
