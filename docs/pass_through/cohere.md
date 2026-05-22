# Cohere SDK

Cohere용 패스스루 엔드포인트입니다. 공급자별 엔드포인트를 네이티브 형식으로 호출합니다(변환 없음).

| 기능 | 지원 여부 | 참고 | 
|-------|-------|-------|
| 비용 추적 | ✅ | `/v1/chat` 및 `/v2/chat` 지원 |
| 로깅 | ✅ | 모든 통합에서 동작 |
| 최종 사용자 추적 | ❌ | 필요하면 [알려주세요](https://github.com/BerriAI/litellm/issues/new) |
| 스트리밍 | ✅ | |

`https://api.cohere.com`을 `LITELLM_PROXY_BASE_URL/cohere`로 바꾸기만 하면 됩니다 🚀

#### **예제 사용법**
```bash
curl --request POST \
  --url http://0.0.0.0:4000/cohere/v1/chat \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "chat_history": [
      {"role": "USER", "message": "Who discovered gravity?"},
      {"role": "CHATBOT", "message": "The man who is widely credited with discovering gravity is Sir Isaac Newton"}
    ],
    "message": "What year was he born?",
    "connectors": [{"id": "web-search"}]
  }'
```

**모든** Cohere 엔드포인트를 지원합니다(스트리밍 포함).

[**모든 Cohere 엔드포인트 보기**](https://docs.cohere.com/reference/chat)

## 빠른 시작

Cohere [`/rerank` 엔드포인트](https://docs.cohere.com/reference/rerank)를 호출해 보겠습니다.

1. 환경에 Cohere API 키를 추가합니다.

```bash
export COHERE_API_KEY=""
```

2. LiteLLM Proxy를 시작합니다.

```bash
litellm

# RUNNING on http://0.0.0.0:4000
```

3. 테스트합니다.

Cohere /rerank 엔드포인트를 호출해 보겠습니다.

```bash
curl --request POST \
  --url http://0.0.0.0:4000/cohere/v1/rerank \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "top_n": 3,
    "documents": ["Carson City is the capital city of the American state of Nevada.",
                  "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
                  "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
                  "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
                  "Capital punishment (the death penalty) has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states."]
  }'
```


## 예제

`http://0.0.0.0:4000/cohere` 뒤에 오는 모든 경로는 공급자별 라우트로 간주되어 그에 맞게 처리됩니다.

주요 변경 사항:

| **원본 엔드포인트**                                | **대체 값**                  |
|------------------------------------------------------|-----------------------------------|
| `https://api.cohere.com`          | `http://0.0.0.0:4000/cohere` (LITELLM_PROXY_BASE_URL="http://0.0.0.0:4000")      |
| `bearer $CO_API_KEY`                                 | `bearer anything` (프록시에 가상 키가 설정되어 있으면 `bearer LITELLM_VIRTUAL_KEY` 사용)                    |


### **예제 1: Rerank 엔드포인트** {#example-1-rerank-endpoint}

#### LiteLLM Proxy 호출 {#litellm-proxy-call}

```bash
curl --request POST \
  --url http://0.0.0.0:4000/cohere/v1/rerank \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "top_n": 3,
    "documents": ["Carson City is the capital city of the American state of Nevada.",
                  "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
                  "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
                  "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
                  "Capital punishment (the death penalty) has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states."]
  }'
```

#### 직접 Cohere API 호출 {#direct-cohere-api-call}

```bash
curl --request POST \
  --url https://api.cohere.com/v1/rerank \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer $CO_API_KEY" \
  --data '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "top_n": 3,
    "documents": ["Carson City is the capital city of the American state of Nevada.",
                  "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
                  "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
                  "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
                  "Capital punishment (the death penalty) has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states."]
  }'
```

### **예제 2: Chat API**

#### LiteLLM Proxy 호출 {#litellm-proxy-call-1}

```bash
curl --request POST \
  --url http://0.0.0.0:4000/cohere/v1/chat \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "chat_history": [
      {"role": "USER", "message": "Who discovered gravity?"},
      {"role": "CHATBOT", "message": "The man who is widely credited with discovering gravity is Sir Isaac Newton"}
    ],
    "message": "What year was he born?",
    "connectors": [{"id": "web-search"}]
  }'
```

#### 직접 Cohere API 호출 {#direct-cohere-api-call-1}

```bash
curl --request POST \
  --url https://api.cohere.com/v1/chat \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer $CO_API_KEY" \
  --data '{
    "chat_history": [
      {"role": "USER", "message": "Who discovered gravity?"},
      {"role": "CHATBOT", "message": "The man who is widely credited with discovering gravity is Sir Isaac Newton"}
    ],
    "message": "What year was he born?",
    "connectors": [{"id": "web-search"}]
  }'
```

### **예제 3: Embedding**


```bash
curl --request POST \
  --url https://api.cohere.com/v1/embed \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-anything" \
  --data '{
    "model": "embed-english-v3.0",
    "texts": ["hello", "goodbye"],
    "input_type": "classification"
  }'
```

#### 직접 Cohere API 호출 {#direct-cohere-api-call-2}

```bash
curl --request POST \
  --url https://api.cohere.com/v1/embed \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer $CO_API_KEY" \
  --data '{
    "model": "embed-english-v3.0",
    "texts": ["hello", "goodbye"],
    "input_type": "classification"
  }'
```


## 고급 - 가상 키와 함께 사용 {#advanced---use-with-virtual-keys}

사전 요구 사항
- [DB로 프록시 설정](../proxy/virtual_keys.md#setup)

개발자에게 원본 Cohere API 키를 제공하지 않으면서도 Cohere 엔드포인트를 사용할 수 있게 하려면 이 방식을 사용하세요.

### 사용법

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
  --url http://0.0.0.0:4000/cohere/v1/rerank \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "Authorization: bearer sk-1234ewknldferwedojwojw" \
  --data '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of the United States?",
    "top_n": 3,
    "documents": ["Carson City is the capital city of the American state of Nevada.",
                  "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
                  "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
                  "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
                  "Capital punishment (the death penalty) has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states."]
  }'
```
