# Pass-Through 엔드포인트의 가드레일

import Image from '@theme/IdealImage';

## 개요

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | opt-in 활성화와 org/team/key 수준의 자동 상속을 사용해 LiteLLM pass-through 엔드포인트에서 가드레일 실행을 활성화합니다 |
| 지원되는 가드레일 | 모든 LiteLLM 가드레일(Bedrock, Aporia, Lakera 등) |
| 기본 동작 | 명시적으로 활성화하지 않으면 pass-through 엔드포인트에서 가드레일은 **비활성화**됩니다 |

## 빠른 시작

pass-through 엔드포인트의 가드레일은 **UI**(권장) 또는 **config file**로 구성할 수 있습니다.

### UI 사용

#### 1. Pass-Through 엔드포인트로 이동

**모델 + Endpoints**로 이동한 뒤 **+ Add Pass-Through Endpoint**를 클릭합니다.

<Image img={require('../../img/pt_guard1.png')} alt="pass-through 엔드포인트에 가드레일 추가" />

**가드레일** 섹션으로 스크롤한 뒤 적용할 가드레일을 선택합니다.

:::tip 기본 동작
기본적으로 필드를 지정할 필요는 없습니다. LiteLLM은 전체 요청/응답 payload를 JSON으로 덤프해 가드레일로 보냅니다.
:::

#### 2. 특정 필드 지정(선택 사항)

<Image img={require('../../img/pt_guard2.png')} alt="필드 수준 타기팅 구성" />

전체 payload 대신 특정 필드만 검사하려면 다음을 수행합니다.

1. 가드레일을 선택합니다
2. **Field Targeting (Optional)**에서 각 가드레일에 사용할 필드를 지정합니다
3. 빠른 추가 버튼(`+ query`, `+ documents[*]`)을 사용하거나 사용자 지정 JSONPath 표현식을 입력합니다
4. **Request Fields (pre_call)**: target API로 보내기 전에 검사할 필드입니다
5. **Response Fields (post_call)**: target API에서 받은 응답에서 검사할 필드입니다

**예제**: 위 스크린샷에서는 `query`를 요청 필드로 설정했으므로 전체 요청 대신 `query` 필드만 가드레일로 전송됩니다.

---

### Config File 사용

#### 1. 가드레일과 pass-through 엔드포인트 정의

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-guard"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "your-guardrail-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      headers:
        Authorization: "bearer os.environ/COHERE_API_KEY"
      guardrails:
        pii-guard:
```

#### 2. proxy 시작

```bash
litellm --config config.yaml
```

#### 3. 요청 테스트

```bash
curl -X POST "http://localhost:4000/v1/rerank" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "rerank-english-v3.0",
    "query": "What is the capital of France?",
    "documents": ["Paris is the capital of France."]
  }'
```

---

## Opt-In 동작

| 설정 | 동작 |
|--------------|----------|
| `guardrails` 미설정 | 가드레일이 실행되지 않습니다(기본값) |
| `guardrails` 설정 | 모든 org/team/key + pass-through 가드레일이 실행됩니다 |

가드레일이 활성화되면 시스템은 다음을 수집해 실행합니다.
- Org 수준 가드레일
- Team 수준 가드레일
- Key 수준 가드레일
- Pass-through 전용 가드레일

---


## 작동 방식

아래 다이어그램은 클라이언트가 `config.yaml`에서 가드레일이 구성된 pass-through 엔드포인트인 `/special/rerank`로 요청을 보낼 때의 흐름을 보여줍니다.

pass-through 엔드포인트에 가드레일이 구성되어 있으면 다음 순서로 동작합니다.
1. **Pre-call guardrails**는 target API로 전달하기 전에 요청에서 실행됩니다
2. `request_fields`가 지정된 경우(예: `["query"]`) 해당 필드만 가드레일로 전송됩니다. 지정하지 않으면 전체 요청 payload를 평가합니다.
3. 가드레일을 통과한 경우에만 요청이 target API로 전달됩니다
4. **Post-call guardrails**는 target API의 응답에서 실행됩니다
5. `response_fields`가 지정된 경우(예: `["results[*].text"]`) 해당 필드만 평가합니다. 지정하지 않으면 전체 응답을 검사합니다.

:::info
pass-through 엔드포인트 config에서 `guardrails` 블록이 생략되었거나 비어 있으면 요청은 가드레일 흐름을 완전히 건너뛰고 target API로 바로 이동합니다.
:::

```mermaid
sequenceDiagram
    participant Client
    box rgb(200, 220, 255) LiteLLM Proxy
        participant PassThrough as Pass-through Endpoint
        participant Guardrails
    end
    participant Target as Target API (Cohere, etc.)

    Client->>PassThrough: POST /special/rerank
    Note over PassThrough,Guardrails: Collect passthrough + org/team/key guardrails
    PassThrough->>Guardrails: Run pre_call (request_fields or full payload)
    Guardrails-->>PassThrough: ✓ Pass / ✗ Block
    PassThrough->>Target: Forward request
    Target-->>PassThrough: Response
    PassThrough->>Guardrails: Run post_call (response_fields or full payload)
    Guardrails-->>PassThrough: ✓ Pass / ✗ Block
    PassThrough-->>Client: Return response (or error)
```

---

## 필드 수준 타기팅

전체 요청/응답 payload 대신 특정 JSON 필드를 대상으로 지정합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "pii-guard-id"
      guardrailVersion: "1"

  - guardrail_name: "content-moderation"
    litellm_params:
      guardrail: bedrock
      mode: post_call
      guardrailIdentifier: "content-guard-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      headers:
        Authorization: "bearer os.environ/COHERE_API_KEY"
      guardrails:
        pii-detection:
          request_fields: ["query", "documents[*].text"]
        content-moderation:
          response_fields: ["results[*].text"]
```

### 필드 옵션

| 필드 | 설명 |
|-------|-------------|
| `request_fields` | 입력(pre_call)에 사용할 JSONPath 표현식 |
| `response_fields` | 출력(post_call)에 사용할 JSONPath 표현식 |
| 둘 다 미지정 | 전체 payload에서 가드레일이 실행됩니다 |

### JSONPath 예제

| 표현식 | 일치 대상 |
|------------|---------|
| `query` | 이름이 `query`인 단일 필드 |
| `documents[*].text` | `documents` 배열의 모든 `text` 필드 |
| `messages[*].content` | `messages` 배열의 모든 `content` 필드 |

---

## 설정 예제

### 전체 payload에 단일 가드레일 적용

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "your-id"
      guardrailVersion: "1"

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      guardrails:
        pii-detection:
```

### 혼합 설정으로 여러 가드레일 적용

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-detection"
    litellm_params:
      guardrail: bedrock
      mode: pre_call
      guardrailIdentifier: "pii-id"
      guardrailVersion: "1"

  - guardrail_name: "content-moderation"
    litellm_params:
      guardrail: bedrock
      mode: post_call
      guardrailIdentifier: "content-id"
      guardrailVersion: "1"

  - guardrail_name: "prompt-injection"
    litellm_params:
      guardrail: lakera
      mode: pre_call
      api_key: os.environ/LAKERA_API_KEY

general_settings:
  pass_through_endpoints:
    - path: "/v1/rerank"
      target: "https://api.cohere.com/v1/rerank"
      guardrails:
        pii-detection:
          request_fields: ["input", "query"]
        content-moderation:
        prompt-injection:
          request_fields: ["messages[*].content"]
```
