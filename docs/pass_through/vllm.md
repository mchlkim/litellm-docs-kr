# VLLM

VLLM용 pass-through 엔드포인트입니다. 공급자별 엔드포인트를 원본 형식 그대로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ❌ | 지원되지 않음 |
| 로깅 | ✅ | 모든 통합에서 동작 |
| 최종 사용자 추적 | ❌ | [필요하면 알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ✅ | |

`https://my-vllm-server.com`을 `LITELLM_PROXY_BASE_URL/vllm`로 바꾸기만 하면 됩니다.

#### **예제 사용법**

```bash
curl -L -X GET 'http://0.0.0.0:4000/vllm/metrics' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-1234' \
```

스트리밍을 포함해 **모든** VLLM 엔드포인트를 지원합니다.

## 빠른 시작

VLLM [`/score` 엔드포인트](https://vllm.readthedocs.io/en/latest/api_reference/api_reference.html)를 호출해 보겠습니다.

1. LiteLLM Proxy에 VLLM 호스팅 모델을 추가합니다.

:::info

LiteLLM v1.72.0 이상에서 동작합니다.

:::

```yaml
model_list:
  - model_name: "my-vllm-model"
    litellm_params:
      model: hosted_vllm/vllm-1.72
      api_base: https://my-vllm-server.com
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

VLLM `/score` 엔드포인트를 호출합니다.

```bash
curl -X 'POST' \
  'http://0.0.0.0:4000/vllm/score' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "model": "my-vllm-model",
  "encoding_format": "float",
  "text_1": "What is the capital of France?",
  "text_2": "The capital of France is Paris."
}'
```


## 예제

`http://0.0.0.0:4000/vllm` 뒤의 모든 경로는 공급자별 라우트로 처리됩니다.

핵심 변경 사항:

| **원래 엔드포인트**                                | **교체 대상**                  |
|------------------------------------------------------|-----------------------------------|
| `https://my-vllm-server.com`          | `http://0.0.0.0:4000/vllm` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `bearer $VLLM_API_KEY`                                 | `bearer anything` (프록시에 가상 키를 설정했다면 `bearer LITELLM_VIRTUAL_KEY` 사용)                    |


### **예제 1: Metrics 엔드포인트**

#### LiteLLM Proxy 호출

```bash
curl -L -X GET 'http://0.0.0.0:4000/vllm/metrics' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer $LITELLM_VIRTUAL_KEY' \
```


#### VLLM API 직접 호출

```bash
curl -L -X GET 'https://my-vllm-server.com/metrics' \
-H 'Content-Type: application/json' \
```

### **예제 2: Chat API**

#### LiteLLM Proxy 호출

```bash
curl -L -X POST 'http://0.0.0.0:4000/vllm/chat/completions' \
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
    "model": "qwen2.5-7b-instruct",
}'
```

#### VLLM API 직접 호출

```bash
curl -L -X POST 'https://my-vllm-server.com/chat/completions' \
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
    "model": "qwen2.5-7b-instruct",
}'
```


## 고급 - 가상 키와 함께 사용

사전 요구 사항
- [DB와 함께 proxy 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 VLLM API 키를 제공하지 않으면서 VLLM 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용합니다.

### 사용법

1. 환경을 설정합니다.

```bash
export DATABASE_URL=""
export LITELLM_MASTER_KEY=""
export HOSTED_VLLM_API_BASE=""
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
curl -L -X POST 'http://0.0.0.0:4000/vllm/chat/completions' \
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
