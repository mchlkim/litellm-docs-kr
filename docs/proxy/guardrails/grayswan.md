import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gray Swan Cygnal 가드레일

[Gray Swan Cygnal](https://docs.grayswan.ai/cygnal/monitor-requests)을 사용해 정책 위반, 간접 프롬프트 인젝션(IPI), 탈옥 시도, 기타 안전 리스크가 있는지 대화를 지속적으로 모니터링합니다.

Cygnal은 `0`에서 `1` 사이의 `violation` 점수(높을수록 정책 위반 가능성이 큼)와 함께 위반된 규칙 인덱스, 변형 감지, IPI 플래그 같은 메타데이터를 반환합니다. LiteLLM은 이 신호를 기준으로 요청을 자동 차단하거나 모니터링할 수 있습니다.

---

## 빠른 시작

### 1. 자격 증명 받기

1. Gray Swan 플랫폼에 로그인하고 Cygnal API 키를 생성합니다.

    기존 고객은 이미 [플랫폼](https://platform.grayswan.ai)에 접근할 수 있어야 합니다.

    신규 사용자는 이 [페이지](https://hubs.ly/Q03-sX1J0)에서 등록해 주세요. 온보딩을 기꺼이 도와드리겠습니다.


2. LiteLLM 프록시 호스트의 환경 변수를 구성합니다.

    ```bash
    export GRAYSWAN_API_KEY="your-grayswan-key"
    export GRAYSWAN_API_BASE="https://api.grayswan.ai"
    ```

### 2. `config.yaml` 구성

Gray Swan 통합을 참조하는 가드레일 항목을 추가합니다. 아래는 권장 설정입니다.

```yaml
model_list:                                 # this part is a standard litellm configuration for reference
  - model_name: openai/gpt-4.1-mini
    litellm_params:
      model: openai/gpt-4.1-mini
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "cygnal-monitor"
    litellm_params:
      guardrail: grayswan
      mode: [pre_call, post_call]            # monitor both input and output
      api_key: os.environ/GRAYSWAN_API_KEY
      api_base: os.environ/GRAYSWAN_API_BASE  # optional
      optional_params:
        on_flagged_action: passthrough         # or "block" or "monitor"
        violation_threshold: 0.5               # score >= threshold is flagged
        reasoning_mode: hybrid                 # off | hybrid | thinking
        policy_id: "your-cygnal-policy-id"     # Optional: Your Cygnal policy ID. Defaults to a content safety policy if empty.
      streaming_end_of_stream_only: true       # For streaming API, only send the assembled message to Cygnal (post_call only). Defaults to false.
      default_on: true
      guardrail_timeout: 30                   # Defaults to 30 seconds. Change accordingly.
      fail_open: true                         # Defaults to true; set to false to propagate guardrail errors.

general_settings:
  master_key: "your-litellm-master-key"

litellm_settings:
  set_verbose: true
```

### 3. 프록시 실행

```bash
litellm --config config.yaml --port 4000
```

---

## 가드레일 모드 선택

Gray Swan은 `pre_call`, `during_call`, `post_call` 단계에서 실행할 수 있습니다. 지연 시간과 적용 범위 요구사항에 맞게 모드를 조합하세요.

| Mode         | 실행 시점      | 보호 대상              | 일반적인 사용 사례 |
|--------------|-------------------|-----------------------|------------------|
| `pre_call`   | LLM 호출 전   | 사용자 입력만       | 모델에 도달하기 전에 프롬프트 인젝션 차단 |
| `during_call`| 호출과 병렬  | 사용자 입력만       | 차단 없이 낮은 지연 시간으로 모니터링 |
| `post_call`  | 응답 후    | 모델 출력         | 정책 위반, 유출된 시크릿 또는 IPI가 있는지 출력 스캔 |


`during_call`을 `on_flagged_action: block` 또는 `on_flagged_action: passthrough`와 함께 사용할 때:

- `asyncio.gather`를 사용해 가드레일 검사와 **LLM 호출이 병렬로 실행됩니다**
- 가드레일이 위반을 감지해도 **LLM 토큰은 계속 소비됩니다**
- 가드레일 예외는 응답이 사용자에게 전달되지 않도록 막지만, **실행 중인 LLM 작업을 취소하지는 않습니다**
- 즉, 사용자에게 오류/패스스루 메시지를 반환하면서도 전체 LLM 비용은 지불하게 됩니다

**권장 사항:** `passthrough`(또는 `block`) `on_flagged_action`에는 `during_call` 대신 `pre_call`과 `post_call`을 사용하세요(위 권장 구성을 참고). 사용자 경험에 영향을 주지 않으면서 낮은 지연 시간의 로깅이 필요한 경우에만 `monitor` 모드에서 `during_call`을 사용하세요.


---

## Claude Code와 함께 사용

Claude Code를 litellm과 함께 설정하는 방법은 공식 litellm [가이드](https://docs.litellm.ai/docs/tutorials/claude_responses_api)를 따르고, 위에서 설명한 가드레일 부분을 litellm 구성에 추가하세요. Cygnal은 코딩 에이전트 정책 방어를 기본 지원합니다. 자체 정책을 정의하거나 플랫폼에서 제공되는 코딩 정책을 사용하세요. 위에 표시한 예시 구성은 Claude Code에도 권장되는 설정입니다(`policy_id`는 적절한 값으로 교체).

---

## `extra_body`를 통한 요청별 재정의

`litellm_metadata.guardrails[*].grayswan.extra_body`를 전달해 Gray Swan 가드레일 구성의 일부를 요청별로 재정의할 수 있습니다.

`extra_body`는 Cygnal 요청 본문에 병합되며 `config.yaml`의 특정 필드인 `policy_id`, `violation_threshold`, `reasoning_mode`보다 우선합니다.

`extra_body` 안에 `metadata` 필드를 포함하면 요청 본문의 `metadata` 필드 아래에 그대로 Cygnal API로 전달됩니다.

예제:

```bash
curl -X POST "http://0.0.0.0:4000/v1/messages?beta=true" \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/anthropic/claude-sonnet-4.5",
    "messages": [{"role": "user", "content": "hello"}],
    "litellm_metadata": {
      "guardrails": [
        {
          "cygnal-monitor": {
            "extra_body": {
              "policy_id": "specific policy id you want to use",
              "metadata": {
                "user": "health-check"
              }
            }
          }
        }
      ]
    }
  }'
```

OpenAI 클라이언트:

```python
from openai import OpenAI

client = OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

resp = client.responses.create(
    model="openrouter/anthropic/claude-sonnet-4.5",
    input="hello",
    extra_body={
        "litellm_metadata": {
            "guardrails": [
                {
                    "cygnal-monitor": {
                        "extra_body": {
                            "policy_id": "69038214e5cdb6befc5e991e",
                            "metadata": {"trace_id": "trace-123"},
                        }
                    }
                }
            ]
        }
    },
)
```

Anthropic 클라이언트:

```python
from anthropic import Anthropic

client = Anthropic(api_key="anything", base_url="http://0.0.0.0:4000")

resp = client.messages.create(
    model="openrouter/anthropic/claude-sonnet-4.5",
    max_tokens=256,
    messages=[{"role": "user", "content": "hello"}],
    extra_body={
        "litellm_metadata": {
            "guardrails": [
                {
                    "cygnal-monitor": {
                        "extra_body": {
                            "policy_id": "69038214e5cdb6befc5e991e",
                            "metadata": {"trace_id": "trace-123"},
                        }
                    }
                }
            ]
        }
    },
)
```

참고:

- 가드레일 이름(예: `cygnal-monitor`)은 `config.yaml`의 `guardrail_name`과 일치해야 합니다.
- 프록시 설정에 따라 요청별 가드레일 재정의에는 프리미엄 라이선스가 필요할 수 있습니다.

---

## 설정 참조

| 파라미터                             | 유형            | 설명 |
|---------------------------------------|-----------------|-------------|
| `api_key`                             | string          | Gray Swan Cygnal API 키입니다. 생략하면 `GRAYSWAN_API_KEY`에서 읽습니다. |
| `api_base`                            | string          | Gray Swan API 기본 URL을 재정의합니다. 기본값은 `https://api.grayswan.ai` 또는 `GRAYSWAN_API_BASE`입니다. |
| `mode`                                | string or list  | 가드레일 단계(`pre_call`, `during_call`, `post_call`)입니다. |
| `optional_params.on_flagged_action`   | string          | `monitor`(로그만 기록), `block`(`HTTPException` 발생) 또는 `passthrough`(400 오류 없이 응답 내용을 위반 메시지로 교체)입니다. |
| `optional_params.violation_threshold` | number (0-1)    | 이 값 이상인 점수는 위반으로 간주됩니다. |
| `optional_params.reasoning_mode`      | string          | `off`, `hybrid` 또는 `thinking`입니다. Cygnal의 추론 기능을 활성화합니다. |
| `optional_params.categories`          | object          | 사용자 지정 카테고리 이름을 설명에 매핑합니다. |
| `optional_params.policy_id`           | string          | Gray Swan 정책 식별자입니다. |
| `guardrail_timeout`                   | number          | Cygnal 요청의 제한 시간(초)입니다. 기본값은 30입니다. |
| `fail_open`                           | boolean         | true이면 Cygnal 연결 오류를 기록하고 요청을 계속 진행합니다. false이면 오류를 전파합니다. 기본값은 true입니다. |
| `streaming_end_of_stream_only`        | boolean         | 스트리밍 `post_call`의 경우 최종 조립된 응답만 Cygnal에 보냅니다. 기본값은 false입니다. |
| `default_on`                          | boolean         | 기본적으로 모든 요청에서 가드레일을 실행합니다. |
