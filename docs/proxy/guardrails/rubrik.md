import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Rubrik 가드레일 {#rubrik-guardrail}

Rubrik의 도구 차단 및 로깅 통합을 사용해 LLM 도구 호출을 외부 정책 서비스로 검증하고, 모든 LLM 요청/응답을 배치로 로깅합니다.

**주요 기능:**

- **도구 차단**: LLM 완료 후 외부 Rubrik 서비스로 도구 호출을 검증합니다. 차단된 도구 호출은 정책 위반 응답을 발생시킵니다.
- **배치 로깅**: 설정 가능한 샘플링과 배치 처리를 사용해 모든 LLM 요청과 응답을 Rubrik에 로깅합니다.
- **Fail-open**: 도구 차단 서비스를 사용할 수 없는 경우 요청은 변경 없이 허용됩니다.

---

## 빠른 시작

### 1. `config.yaml` 설정 {#1-configure-configyaml}

자격 증명은 YAML 설정에 직접 지정하거나 환경 변수로 설정할 수 있습니다. 설정 파일을 사용하는 방식을 권장합니다.

<Tabs>
<TabItem value="config" label="config.yaml (권장)" default>

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: "post_call"
      api_key: "your-rubrik-api-key"
      api_base: "https://your-rubrik-service.example.com"
      default_on: true
```

설정에서 환경 변수를 참조할 수도 있습니다.

```yaml
guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: "post_call"
      api_key: os.environ/RUBRIK_API_KEY
      api_base: os.environ/RUBRIK_WEBHOOK_URL
      default_on: true
```

</TabItem>
<TabItem value="env" label="환경 변수">

대안으로 Rubrik 서비스 URL과 API 키를 환경 변수만으로 설정할 수 있습니다. 이 값이 설정되어 있으면 설정에 `api_base` / `api_key`가 제공되지 않았을 때 폴백으로 사용됩니다.

```bash
export RUBRIK_WEBHOOK_URL="https://your-rubrik-service.example.com"
export RUBRIK_API_KEY="your-rubrik-api-key"
```

최소 설정은 다음과 같습니다.

```yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "rubrik"
    litellm_params:
      guardrail: rubrik
      mode: "post_call"
      default_on: true
```

</TabItem>
</Tabs>

### 2. Proxy 실행 {#2-launch-the-proxy}

```bash
litellm --config config.yaml --port 4000
```

### 3. 테스트 {#3-test-it}

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-1234" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "What is the weather in SF?"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the weather for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string"}
            },
            "required": ["location"]
          }
        }
      }
    ]
  }'
```

---

## 설정 참조 {#설정-reference}

### YAML 설정 파라미터 {#yaml-config-parameters}

이 값들은 `config.yaml`의 `guardrails.[].litellm_params` 아래에 설정합니다.

| 파라미터 | 필수 여부 | 설명 |
|-----------|----------|-------------|
| `guardrail: rubrik` | 예 | Rubrik 가드레일 통합을 선택합니다 |
| `mode: "post_call"` | 예 | LLM 응답을 받은 후 실행합니다 |
| `api_base` | 예 | Rubrik webhook 기본 URL입니다. `os.environ/RUBRIK_WEBHOOK_URL`을 사용할 수 있습니다. 생략하면 `RUBRIK_WEBHOOK_URL` 환경 변수로 폴백합니다. |
| `api_key` | 아니요 | Rubrik API 키입니다. `os.environ/RUBRIK_API_KEY`를 사용할 수 있습니다. 생략하면 `RUBRIK_API_KEY` 환경 변수로 폴백합니다. |
| `default_on` | 아니요 | `true`이면 요청별 옵트인 없이 모든 요청에서 가드레일이 실행됩니다 |

### 환경 변수 {#environment-variables}

YAML 설정에 `api_base` / `api_key`가 설정되지 않았을 때 사용되는 선택적 폴백입니다. `RUBRIK_SAMPLING_RATE`와 `RUBRIK_BATCH_SIZE`는 환경 변수로만 설정할 수 있습니다.

| 변수 | 필수 여부 | 기본값 | 설명 |
|----------|----------|---------|-------------|
| `RUBRIK_WEBHOOK_URL` | 설정에 `api_base`가 없을 때만 | - | Rubrik webhook 서비스의 기본 URL |
| `RUBRIK_API_KEY` | 아니요 | - | Rubrik 서비스 인증에 사용하는 Bearer 토큰 |
| `RUBRIK_SAMPLING_RATE` | 아니요 | `1.0` | **로깅할** 요청 비율입니다(0.0부터 1.0까지). 항상 실행되는 도구 차단에는 영향을 주지 않습니다. 요청의 약 50%를 로깅하려면 `0.5`로 설정합니다. |
| `RUBRIK_BATCH_SIZE` | 아니요 | `512` | 플러시하기 전에 버퍼링할 로그 항목 수입니다. 로그는 주기적 간격으로도 플러시됩니다. |

---

## 도구 차단 작동 방식 {#how-tool-blocking-works}

1. LLM이 도구 호출이 포함된 응답을 반환하면 Rubrik 가드레일은 해당 호출을 `{api_base}/v1/after_completion/openai/v1`의 차단 서비스로 보냅니다.
2. 서비스는 각 도구 호출을 설정된 정책과 비교해 평가하고 **허용된** 도구 호출 집합을 반환합니다.
3. 차단된 도구 호출이 있으면 Proxy는 원래 LLM 응답 대신 정책 위반 설명을 응답으로 반환합니다.
4. 차단 서비스에 연결할 수 없거나 서비스가 오류를 반환하면 가드레일은 **fail open**으로 동작해 원래 응답을 변경 없이 반환합니다.

### 요청/응답 형식 {#requestresponse-format}

가드레일은 차단 서비스에 JSON envelope을 보냅니다.

```json
{
  "request": {
    "messages": [...],
    "model": "gpt-4",
    "proxy_server_request": {...}
  },
  "response": {
    "id": "chatcmpl-...",
    "object": "chat.completion",
    "choices": [{
      "message": {
        "role": "assistant",
        "tool_calls": [...]
      }
    }]
  }
}
```

서비스는 **허용된** 도구 호출만 포함하고 차단 설명이 담긴 선택적 `content` 필드를 포함하는 OpenAI chat completion 형식의 응답을 반환해야 합니다.

---

## 배치 로깅 작동 방식 {#how-batch-logging-works}

모든 LLM 요청(성공 및 실패)은 큐에 쌓인 뒤 `{api_base}/v1/litellm/batch`로 배치 전송됩니다.

- 큐가 `RUBRIK_BATCH_SIZE`(기본값 512)에 도달하거나 주기적 간격(기본값 5초)이 되면 로그가 플러시됩니다. 이 기본값은 LiteLLM의 전역 설정에서 상속됩니다.
- 트래픽이 많은 배포에서 로깅 양을 줄이려면 `RUBRIK_SAMPLING_RATE`를 사용합니다. 샘플링은 로깅에만 영향을 주며, 도구 차단은 샘플링 비율과 관계없이 항상 실행됩니다.
- Anthropic `/v1/messages` 요청의 경우 도구 차단과 로깅 전반의 일관성을 위해 로그 ID가 `litellm_call_id`로 정규화됩니다.
