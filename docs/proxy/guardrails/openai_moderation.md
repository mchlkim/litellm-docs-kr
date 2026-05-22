import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI Moderation

## 개요

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | OpenAI의 기본 제공 Moderation API를 사용하여 혐오, 괴롭힘, 자해, 성적 콘텐츠, 폭력 등 유해 콘텐츠를 감지하고 차단합니다. |
| Provider | [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) |
| 지원 작업 | `BLOCK` (위반이 감지되면 HTTP 400 예외 발생) |
| 지원 모드 | `pre_call`, `during_call`, `post_call` |
| 스트리밍 지원 | ✅ 스트리밍 응답 전체 지원 |
| API 요구 사항 | OpenAI API key |

## 빠른 시작

### 1. LiteLLM config.yaml에 가드레일 정의

`guardrails` 섹션 아래에 가드레일을 정의합니다.

<Tabs>
<TabItem value="config" label="Config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "openai-moderation-pre"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY  # Optional if already set globally
      model: "omni-moderation-latest"     # Optional, defaults to omni-moderation-latest
      api_base: "https://api.openai.com/v1"  # Optional, defaults to OpenAI API
```

#### `mode` 지원 값

- `pre_call`: **사용자 입력**에 대해 LLM 호출 **전** 실행
- `during_call`: **사용자 입력**에 대해 LLM 호출 **중** 실행. `pre_call`과 같지만 LLM 호출과 병렬로 실행됩니다. 가드레일 검사가 끝날 때까지 응답은 반환되지 않습니다.
- `post_call`: **LLM 응답**에 대해 LLM 호출 **후** 실행

#### 지원되는 OpenAI Moderation 모델

- `omni-moderation-latest` (기본값) - 최신 멀티모달 moderation 모델
- `text-moderation-latest` - 최신 텍스트 전용 moderation 모델

</TabItem>

<TabItem value="env" label="Environment Variables">

OpenAI API key를 설정합니다.

```bash title="Setup Environment Variables"
export OPENAI_API_KEY="your-openai-api-key"
```

</TabItem>
</Tabs>

### 2. LiteLLM Gateway 시작

```shell
litellm --config config.yaml --detailed_debug
```

### 3. 요청 테스트

<Tabs>
<TabItem label="차단된 요청" value="blocked">

요청에 유해 콘텐츠가 포함되어 있으므로 실패해야 합니다.

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "I hate all people and want to hurt them"}
    ],
    "guardrails": ["openai-moderation-pre"]
  }'
```

실패 시 예상 응답:

```json
{
  "error": {
    "message": {
      "error": "Violated OpenAI moderation policy",
      "moderation_result": {
        "violated_categories": ["hate", "violence"],
        "category_scores": {
          "hate": 0.95,
          "violence": 0.87,
          "harassment": 0.12,
          "self-harm": 0.01,
          "sexual": 0.02
        }
      }
    },
    "type": "None",
    "param": "None", 
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="성공한 호출" value="allowed">

```shell
curl -i http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "guardrails": ["openai-moderation-pre"]
  }'
```

예상 응답:

```json
{
  "id": "chatcmpl-4a1c1a4a-3e1d-4fa4-ae25-7ebe84c9a9a2",
  "created": 1741082354,
  "model": "gpt-4",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "The capital of France is Paris.",
        "role": "assistant"
      }
    }
  ],
  "usage": {
    "completion_tokens": 8,
    "prompt_tokens": 13,
    "total_tokens": 21
  }
}
```

</TabItem>
</Tabs>

## 고급 설정

### 입력과 출력을 위한 여러 가드레일

사용자 입력과 LLM 응답에 대해 별도 가드레일을 구성할 수 있습니다.

```yaml showLineNumbers title="Multiple Guardrails Config"
guardrails:
  - guardrail_name: "openai-moderation-input" 
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY
      
  - guardrail_name: "openai-moderation-output"
    litellm_params:
      guardrail: openai_moderation
      mode: "post_call" 
      api_key: os.environ/OPENAI_API_KEY
```

### 사용자 지정 API 설정

사용자 지정 OpenAI API 엔드포인트 또는 다른 모델을 구성합니다.

```yaml showLineNumbers title="Custom API Config"
guardrails:
  - guardrail_name: "openai-moderation-custom"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      api_key: os.environ/OPENAI_API_KEY
      api_base: "https://your-custom-openai-endpoint.com/v1"
      model: "text-moderation-latest"
```

## 스트리밍 지원

OpenAI Moderation 가드레일은 스트리밍 응답을 완전히 지원합니다. `post_call` 모드에서 사용하면 다음과 같이 동작합니다.

1. 모든 스트리밍 청크를 수집합니다.
2. 전체 응답을 조립합니다.
3. 전체 콘텐츠에 moderation을 적용합니다.
4. 위반이 감지되면 전체 스트림을 차단합니다.
5. 콘텐츠가 안전하면 원본 스트림을 반환합니다.

```yaml showLineNumbers title="Streaming Config"
guardrails:
  - guardrail_name: "openai-moderation-streaming"
    litellm_params:
      guardrail: openai_moderation
      mode: "post_call"  # Works with streaming responses
      api_key: os.environ/OPENAI_API_KEY
```

## 콘텐츠 카테고리

OpenAI Moderation API는 다음 유해 콘텐츠 카테고리를 감지합니다.

| 카테고리 | 설명 |
|----------|-------------|
| `hate` | 인종, 성별, 민족, 종교, 국적, 성적 지향, 장애 상태, 카스트에 기반한 혐오를 표현, 선동 또는 조장하는 콘텐츠 |
| `harassment` | 개인을 괴롭히거나 따돌리거나 위협하는 콘텐츠 |
| `self-harm` | 자해 행위를 조장, 장려 또는 묘사하는 콘텐츠 |
| `sexual` | 성적 흥분을 유발하거나 성적 서비스를 홍보하려는 콘텐츠 |
| `violence` | 사망, 폭력 또는 신체 상해를 묘사하는 콘텐츠 |

각 카테고리는 boolean 플래그와 신뢰도 점수(0.0~1.0)로 평가됩니다.

## 오류 처리

콘텐츠가 OpenAI moderation 정책을 위반하면 다음과 같이 처리됩니다.

- **HTTP 상태**: 400 Bad Request
- **오류 유형**: `HTTPException`
- **오류 세부 정보**: 위반 카테고리와 신뢰도 점수를 포함합니다.
- **동작**: 요청이 즉시 차단됩니다.

## 권장 사항

### 1. 사용자 입력에는 Pre-call 사용

```yaml
guardrails:
  - guardrail_name: "input-moderation"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"  # Block harmful user inputs early
```

### 2. LLM 응답에는 Post-call 사용

```yaml
guardrails:
  - guardrail_name: "output-moderation"
    litellm_params:
      guardrail: openai_moderation  
      mode: "post_call"  # Ensure LLM responses are safe
```

### 3. 다른 가드레일과 조합

```yaml
guardrails:
  - guardrail_name: "openai-moderation"
    litellm_params:
      guardrail: openai_moderation
      mode: "pre_call"
      
  - guardrail_name: "custom-pii-detection"
    litellm_params:
      guardrail: presidio
      mode: "pre_call"
```

## 문제 해결

### 자주 발생하는 문제

1. **Invalid API Key**: OpenAI API key가 올바르게 설정되었는지 확인합니다.
   ```bash
   export OPENAI_API_KEY="sk-your-actual-key"
   ```

2. **Rate Limiting**: OpenAI Moderation API에는 rate limit이 있습니다. 트래픽이 많은 환경에서는 사용량을 모니터링합니다.

3. **Network Issues**: OpenAI API 엔드포인트와의 연결을 확인합니다.

### Debug Mode

문제를 해결하려면 상세 로깅을 활성화합니다.

```shell
litellm --config config.yaml --detailed_debug
```

가드레일 실행을 추적하려면 `OpenAI Moderation:`로 시작하는 로그를 확인합니다.

## API 비용

OpenAI Moderation API는 콘텐츠 정책 준수 용도로 **무료로 사용할 수 있습니다**. 따라서 다른 상용 moderation 서비스와 비교해 비용 효율적인 가드레일 옵션입니다.

## 도움이 필요하신가요?

추가 지원은 다음을 참고하세요.
- [OpenAI Moderation API 문서](https://platform.openai.com/docs/guides/moderation)를 확인합니다.
- [LiteLLM 가드레일 문서](./quick_start)를 검토합니다.
- [Discord community](https://discord.gg/wuPM9dRgDw)에 참여합니다.
