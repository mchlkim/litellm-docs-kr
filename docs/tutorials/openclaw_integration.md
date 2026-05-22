---
sidebar_label: "OpenClaw"
---

# OpenClaw + LiteLLM 통합

[OpenClaw](https://openclaw.ai)는 채팅 앱(WhatsApp, Telegram, Discord 등)을 LLM 제공자에 연결하는 셀프 호스팅 AI 어시스턴트입니다. OpenClaw를 LiteLLM Proxy를 통해 라우팅하면 하나의 게이트웨이에서 100개 이상의 제공자, 비용 추적, 지출 한도, 자동 장애 조치를 사용할 수 있습니다.

## 설정할 구성

```
Chat apps → OpenClaw Gateway → LiteLLM Proxy → LLM Providers (OpenAI, Anthropic, etc.)
```

## 사전 준비

| 요구 사항 | 준비 방법 |
|---|---|
| **Node.js 22+** | `node --version` — 필요한 경우 [nodejs.org](https://nodejs.org)에서 설치 |
| **Python 3.8+** | `python --version` |
| **하나 이상의 LLM API 키** | OpenAI, Anthropic, Gemini 등 |

## 1단계 — LiteLLM Proxy 설치

```bash
uv tool install 'litellm[proxy]'
```

## 2단계 — LiteLLM 구성 파일 생성

사용하려는 모델을 포함해 `litellm_config.yaml` 구성 파일을 만듭니다. 다음은 OpenAI 예시입니다.

```yaml title="litellm_config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: sk-your-secret-key  # pick any value — this is YOUR proxy password
```

:::tip 여러 제공자 예시
서로 다른 제공자의 모델을 원하는 만큼 추가할 수 있습니다.

```yaml title="litellm_config.yaml"
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gemini-flash
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GEMINI_API_KEY

general_settings:
  master_key: sk-your-secret-key
```

전체 옵션은 [LiteLLM 프록시 구성 문서](https://docs.litellm.ai/docs/proxy/configs)를 참고하세요.
:::

## 3단계 — 프록시 시작

API 키가 환경 변수로 제공되는지 확인한 뒤(`export`, `.env` 파일 또는 사용하는 시크릿 관리 방식), 프록시를 시작합니다.

```bash
litellm --config litellm_config.yaml --port 4000
```

## 4단계 — OpenClaw 설치

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash
```

:::note Windows
Windows에서는 PowerShell을 사용하세요. `iwr -useb https://openclaw.ai/install.ps1 | iex`

네이티브 Windows보다 WSL2 사용을 권장합니다.
:::

## 5단계 — OpenClaw를 LiteLLM에 연결

온보딩 마법사를 실행합니다.

```bash
openclaw onboard --install-daemon
```

프롬프트가 표시되면 다음과 같이 진행합니다.

1. 온보딩 모드로 **QuickStart** 또는 **Manual**을 선택합니다. 둘 다 사용할 수 있으며, Manual은 게이트웨이 설정 옵션을 더 많이 제공합니다.
2. 모델/인증 제공자로 **LiteLLM**을 선택합니다.
3. 2단계에서 설정한 LiteLLM `master_key`를 입력하고 기본 URL을 프록시 주소(예: `http://localhost:4000`)로 설정합니다.
4. 기본 모델을 묻는 메시지가 나오면 **Enter model manually**를 선택하고 `litellm_config.yaml`의 모델 이름(예: `litellm/gpt-4o`)을 입력합니다.

온보딩 후에도 모델을 설정하거나 변경할 수 있습니다.

```bash
openclaw models set litellm/gpt-4o
```

스크립트 또는 CI 환경에서는 프롬프트를 모두 건너뛸 수 있습니다.

```bash
openclaw onboard --non-interactive --accept-risk \
  --auth-choice litellm-api-key \
  --litellm-api-key "sk-your-secret-key" \
  --custom-base-url "http://localhost:4000" \
  --install-daemon --skip-channels --skip-skills
```

## 6단계 — 확인

게이트웨이가 정상 상태인지 확인합니다.

```bash
openclaw health
```

그런 다음 테스트 메시지를 보냅니다.

```bash
openclaw dashboard                                           # web UI
openclaw tui                                                 # terminal UI
openclaw agent --agent main -m "Hello, what model are you?"  # one-shot CLI
```

모델에서 응답을 받으면 통합이 정상적으로 작동하는 것입니다.

현재 활성화된 모델을 확인합니다.

```bash
openclaw models status
```

## 구성 참고

온보딩 후 OpenClaw는 LiteLLM 제공자 구성을 `~/.openclaw/openclaw.json`에 저장합니다. 관련 섹션은 대략 다음과 같습니다.

```json5 title="~/.openclaw/openclaw.json (excerpt)"
{
  "models": {
    "providers": {
      "litellm": {
        "baseUrl": "http://localhost:4000",
        "apiKey": "sk-your-secret-key",
        "api": "openai-completions",
        "models": [
          {
            "id": "gpt-4o",
            "name": "GPT-4o via LiteLLM"
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "litellm/gpt-4o" }
    }
  }
}
```

모델을 더 추가하거나 `baseUrl`을 변경하려면 이 파일을 직접 편집할 수 있습니다. OpenClaw는 변경 사항을 자동으로 핫 리로드합니다.

## 문제 해결

**연결 거부 / 프록시에 접근할 수 없음**

LiteLLM 프록시가 실행 중이고 OpenClaw 구성의 `baseUrl`이 일치하는지 확인합니다.

```bash
curl http://localhost:4000/health -H "Authorization: Bearer sk-your-secret-key"
```

**잘못된 모델 또는 "Invalid model name"**

OpenClaw의 모델 이름은 `litellm_config.yaml`의 `model_name`과 일치해야 합니다. 다음 명령으로 활성 모델을 전환합니다.

```bash
openclaw models set litellm/gpt-4o
```

**재설치 후 게이트웨이 페어링 문제**

재설치 후 CLI가 게이트웨이에 연결할 수 없으면 서비스를 중지한 뒤 다시 설치합니다.

```bash
openclaw gateway stop
openclaw gateway install
```

## 참고 자료

- [OpenClaw 문서](https://docs.openclaw.ai)
- [OpenClaw LiteLLM 제공자 문서](https://docs.openclaw.ai/providers/litellm)
- [OpenClaw 모델 제공자](https://docs.openclaw.ai/concepts/model-providers)
- [LiteLLM 프록시 구성](https://docs.litellm.ai/docs/proxy/configs)
