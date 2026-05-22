import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DynamoAI 가드레일

LiteLLM은 LLM 입력과 출력에 대한 콘텐츠 조정 및 정책 적용을 위해 DynamoAI 가드레일을 지원합니다.

## 빠른 시작

### 1. LiteLLM config.yaml에 가드레일 정의하기

`guardrails` 섹션 아래에 가드레일을 정의합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "dynamoai-guard"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
```

#### `mode`에서 지원되는 값

- `pre_call` - LLM 호출 **전**에 **입력**에 대해 실행
- `post_call` - LLM 호출 **후**에 **출력**에 대해 실행
- `during_call` - LLM 호출 **중**에 **입력**에 대해 실행. `pre_call`과 동일하지만 LLM 호출과 병렬로 실행

### 2. 환경 변수 설정

```bash
export DYNAMOAI_API_KEY="your-api-key"
# Optional: Set policy IDs via environment variable (comma-separated)
export DYNAMOAI_POLICY_IDS="policy-id-1,policy-id-2,policy-id-3"
```

### 3. LiteLLM Gateway 시작

```shell
litellm --config config.yaml --detailed_debug
```

### 4. 요청 테스트

**[Langchain, OpenAI SDK 사용법 예제](../proxy/user_keys#request-format)**

<Tabs>
<TabItem label="성공한 호출" value="allowed">

```shell showLineNumbers title="성공한 요청"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "guardrails": ["dynamoai-guard"]
}'
```

**응답: HTTP 200 성공**

콘텐츠가 모든 정책 검사를 통과하여 허용됩니다.

</TabItem>

<TabItem label="차단된 호출" value="not-allowed">

```shell showLineNumbers title="차단된 요청"
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Content that violates policy"}
    ],
    "guardrails": ["dynamoai-guard"]
}'
```

**차단 시 예상 응답: HTTP 400 오류**

```json showLineNumbers
{
  "error": {
    "message": "Guardrail failed: 1 violation(s) detected\n\n- POLICY NAME:\n  Action: BLOCK\n  Method: TOXICITY\n  Description: Policy description\n  Policy ID: policy-id-123",
    "type": "None",
    "param": "None",
    "code": "400"
  }
}
```

</TabItem>
</Tabs>

## 고급 설정

### 정책 ID 지정

적용할 특정 DynamoAI 정책을 구성합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-policies"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      policy_ids:
        - "policy-id-1"
        - "policy-id-2"
        - "policy-id-3"
```

### 사용자 지정 API 기본 URL

사용자 지정 DynamoAI API 엔드포인트를 지정합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-custom"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      api_base: "https://custom.dynamo.ai"
```

### 추적용 모델 ID

추적 및 로깅 목적으로 모델 ID를 추가합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "dynamoai-tracked"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY
      model_id: "gpt-4-production"
```

### 입력 및 출력 가드레일

입력과 출력에 각각 별도의 가드레일을 구성합니다.

```yaml showLineNumbers title="config.yaml"
guardrails:
  # Input guardrail
  - guardrail_name: "dynamoai-input"
    litellm_params:
      guardrail: dynamoai
      mode: "pre_call"
      api_key: os.environ/DYNAMOAI_API_KEY

  # Output guardrail
  - guardrail_name: "dynamoai-output"
    litellm_params:
      guardrail: dynamoai
      mode: "post_call"
      api_key: os.environ/DYNAMOAI_API_KEY
```

## 설정 옵션

| 파라미터 | 유형 | 설명 | 기본값 |
|-----------|------|-------------|---------|
| `api_key` | string | DynamoAI API 키(필수) | `DYNAMOAI_API_KEY` 환경 변수 |
| `api_base` | string | DynamoAI API 기본 URL | `https://api.dynamo.ai` |
| `policy_ids` | array | 적용할 DynamoAI 정책 ID 목록(선택 사항) | `DYNAMOAI_POLICY_IDS` 환경 변수(쉼표로 구분) |
| `model_id` | string | 추적/로깅용 모델 ID | `DYNAMOAI_MODEL_ID` 환경 변수 |
| `mode` | string | 실행 시점: `pre_call`, `post_call` 또는 `during_call` | 필수 |

## 관측성

DynamoAI 가드레일 로그에는 다음이 포함됩니다.

- **guardrail_status**: `success`, `guardrail_intervened` 또는 `guardrail_failed_to_respond`
- **guardrail_provider**: `dynamoai`
- **guardrail_json_response**: 정책 세부 정보가 포함된 전체 API 응답
- **duration**: 가드레일 검사에 걸린 시간
- **start_time** 및 **end_time**: 타임스탬프

이 로그는 구성된 LiteLLM 로깅 콜백을 통해 사용할 수 있습니다.

## 오류 처리

가드레일은 오류를 원활하게 처리합니다.

- **API 실패**: 오류를 로그로 남기고 `guardrail_failed_to_respond` 상태와 함께 예외를 발생시킵니다.
- **정책 위반**: 자세한 위반 정보와 함께 `ValueError`를 발생시킵니다.
- **잘못된 설정**: API 키가 없으면 초기화 시 `ValueError`를 발생시킵니다.

## 현재 제한 사항

- 현재는 `BLOCK` 작업만 지원됩니다.
- `WARN`, `REDACT`, `SANITIZE` 작업은 성공으로 처리됩니다(통과).

## 지원

DynamoAI에 대한 자세한 정보:
- 웹사이트: [https://dynamo.ai](https://dynamo.ai)
- 문서: API 문서는 DynamoAI에 문의하세요.
