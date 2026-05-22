# ChatGPT 구독 {#chatgpt-subscription}

OAuth device flow 인증으로 LiteLLM에서 ChatGPT Pro/Max 구독 모델을 사용합니다.

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | ChatGPT backend API를 통한 ChatGPT 구독 액세스(Codex + GPT-5.3/5.4 계열) |
| LiteLLM의 Provider Route | `chatgpt/` |
| 지원 엔드포인트 | `/responses`, `/chat/completions` (지원 모델은 Responses로 브리지됨) |
| API 참조 | https://chatgpt.com |

ChatGPT 구독 액세스는 Responses API에 기본으로 맞춰져 있습니다. 지원되는 모델(예: `chatgpt/gpt-5.4`)의 Chat Completions 요청은 Responses로 브리지됩니다.

참고:
- ChatGPT 구독 백엔드는 토큰 제한 필드(`max_tokens`, `max_output_tokens`, `max_completion_tokens`)와 `metadata`를 거부합니다. LiteLLM은 이 provider에 대해 해당 필드를 제거합니다.
- `/v1/chat/completions`는 `stream`을 따릅니다. `stream`이 false(기본값)이면 LiteLLM은 Responses 스트림을 단일 JSON 응답으로 집계합니다.

## 인증

ChatGPT 구독 액세스는 OAuth device code flow를 사용합니다.

1. LiteLLM이 device code와 verification URL을 출력합니다.
2. URL을 열고 로그인한 뒤 코드를 입력합니다.
3. 토큰은 재사용을 위해 로컬에 저장됩니다.

## 사용법 - LiteLLM Python SDK

### Responses (Codex 모델 권장) {#responses-recommended-for-codex-models}

```python showLineNumbers title="ChatGPT Responses"
import litellm

response = litellm.responses(
    model="chatgpt/gpt-5.3-codex",
    input="Write a Python hello world"
)

print(response)
```

### Chat Completions (Responses로 브리지됨) {#chat-completions-bridged-to-responses}

```python showLineNumbers title="ChatGPT Chat Completions"
import litellm

response = litellm.completion(
    model="chatgpt/gpt-5.4",
    messages=[{"role": "user", "content": "Write a Python hello world"}]
)

print(response)
```

## 사용법 - LiteLLM Proxy

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chatgpt/gpt-5.4
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.4
  - model_name: chatgpt/gpt-5.4-pro
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.4-pro
  - model_name: chatgpt/gpt-5.3-codex
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-codex
  - model_name: chatgpt/gpt-5.3-codex-spark
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-codex-spark
  - model_name: chatgpt/gpt-5.3-instant
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-instant
  - model_name: chatgpt/gpt-5.3-chat-latest
    model_info:
      mode: responses
    litellm_params:
      model: chatgpt/gpt-5.3-chat-latest
```

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

## 설정

### 환경 변수 {#environment-variables}

- `CHATGPT_TOKEN_DIR`: 사용자 지정 토큰 저장 디렉터리
- `CHATGPT_AUTH_FILE`: 인증 파일 이름(기본값: `auth.json`)
- `CHATGPT_API_BASE`: API base 재정의(기본값: `https://chatgpt.com/backend-api/codex`)
- `OPENAI_CHATGPT_API_BASE`: `CHATGPT_API_BASE`의 별칭
- `CHATGPT_ORIGINATOR`: `originator` 헤더 값 재정의
- `CHATGPT_USER_AGENT`: `User-Agent` 헤더 값 재정의
- `CHATGPT_USER_AGENT_SUFFIX`: `User-Agent` 헤더에 추가되는 선택적 suffix
