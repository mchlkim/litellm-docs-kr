import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenCode 빠른 시작

이 튜토리얼에서는 OpenCode를 기존 LiteLLM 인스턴스에 연결하고 모델을 전환하는 방법을 설명합니다.

:::info 

이 연동을 사용하면 중앙 집중식 인증, 사용량 추적, 비용 제어를 유지하면서 OpenCode에서 LiteLLM이 지원하는 모든 모델을 사용할 수 있습니다.

:::

<br />

### 동영상 가이드 {#video-walkthrough}

<iframe width="840" height="500" src="https://www.loom.com/embed/00791498f1d84e4ba6d7476bd2e1442f" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## 사전 준비

- LiteLLM이 이미 설정되어 실행 중이어야 합니다(예: http://localhost:4000).
- LiteLLM API 키

## 설치

### 1단계: OpenCode 설치 {#step-1-install-opencode}

원하는 설치 방법을 선택하세요.

<Tabs>
<TabItem value="curl" label="한 줄 설치(권장)">

```bash
curl -fsSL https://opencode.ai/install | bash
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm install -g opencode-ai
```

</TabItem>
<TabItem value="homebrew" label="Homebrew">

```bash
brew install sst/tap/opencode
```

</TabItem>
</Tabs>

설치를 확인합니다.

```bash
opencode --version
```

### 2단계: LiteLLM 프로바이더 설정 {#step-2-configure-litellm-provider}

OpenCode 설정 파일을 만듭니다. 필요에 따라 여러 위치에 둘 수 있습니다.

**설정 위치:**
- **전역**: `~/.config/opencode/opencode.json`(모든 프로젝트에 적용)
- **프로젝트**: 프로젝트 루트의 `opencode.json`(프로젝트별 설정)
- **사용자 지정**: `OPENCODE_CONFIG` 환경 변수 설정

`~/.config/opencode/opencode.json`(전역 설정)을 만듭니다.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM",
      "options": {
        "baseURL": "http://localhost:4000/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4"
        },
        "claude-3-5-sonnet-20241022": {
          "name": "Claude 3.5 Sonnet"
        },
        "deepseek-chat": {
          "name": "DeepSeek Chat"
        }
      }
    }
  }
}
```

:::tip
"models" 객체의 키(예: "gpt-4", "claude-3-5-sonnet-20241022")는 LiteLLM 설정의 `model_name` 값과 일치해야 합니다. "name" 필드는 OpenCode에서 별칭으로 표시될 읽기 쉬운 표시 이름을 제공합니다.
:::

### 3단계: LiteLLM 프로바이더에 연결 {#step-3-connect-to-litellm-provider}

OpenCode를 실행합니다.

```bash
opencode
```

API 키를 추가합니다.

```bash
/connect
```

그런 다음 아래 값을 입력합니다.
- **프로바이더 이름 입력**: `LiteLLM`(설정의 "name" 필드와 일치해야 함)
- **LiteLLM API 키 입력**: LiteLLM 마스터 키 또는 가상 키

### 4단계: 모델 전환 {#step-4-switch-between-models}

OpenCode에서 다음을 실행합니다.

```bash
/models
```

LiteLLM 설정에 있는 모델을 선택합니다. OpenCode는 모든 요청을 LiteLLM 인스턴스를 통해 라우팅합니다.

## 고급 설정 {#advanced-settings}

### 모델 파라미터 {#model-parameters}

컨텍스트 제한 같은 모델 파라미터를 사용자 지정할 수 있습니다.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM",
      "options": {
        "baseURL": "http://localhost:4000/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4",
          "limit": {
            "context": 128000,
            "output": 4096
          }
        },
        "claude-3-5-sonnet-20241022": {
          "name": "Claude 3.5 Sonnet",
          "limit": {
            "context": 200000,
            "output": 8192
          }
        }
      }
    }
  }
}
```

### 다중 프로바이더 설정 {#multi-provider-configuration}

여러 LiteLLM 인스턴스를 설정하거나 다른 프로바이더와 함께 사용할 수 있습니다.

<Tabs>
<TabItem value="multi-litellm" label="여러 LiteLLM 인스턴스">

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm-prod": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM Production",
      "options": {
        "baseURL": "https://your-prod-instance.com/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4 (Production)"
        }
      }
    },
    "litellm-dev": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM Development",
      "options": {
        "baseURL": "http://localhost:4000/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4 (Development)"
        }
      }
    }
  }
}
```

</TabItem>
<TabItem value="mixed-providers" label="혼합 프로바이더">

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "litellm": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "LiteLLM",
      "options": {
        "baseURL": "http://localhost:4000/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4 via LiteLLM"
        },
        "claude-3-5-sonnet-20241022": {
          "name": "Claude 3.5 Sonnet via LiteLLM"
        }
      }
    },
    "openai": {
      "npm": "@ai-sdk/openai",
      "name": "OpenAI Direct",
      "models": {
        "gpt-4o": {
          "name": "GPT-4o (Direct)"
        }
      }
    }
  }
}
```

</TabItem>
</Tabs>

## 예제 LiteLLM 설정

다음은 OpenCode와 잘 동작하는 LiteLLM `config.yaml` 예시입니다.

```yaml
model_list:
  # OpenAI models
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  # Anthropic models
  - model_name: claude-3-5-sonnet-20241022
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

  # DeepSeek models
  - model_name: deepseek-chat
    litellm_params:
      model: deepseek/deepseek-chat
      api_key: os.environ/DEEPSEEK_API_KEY
```

### OpenCode 전용 파라미터 제거 {#dropping-opencode-specific-parameters}

OpenCode는 `gpt-5` 같은 추론 지원 모델에 `reasoningSummary` 파라미터를 함께 전송합니다. 이 파라미터는 Chat Completions API에서 지원되지 않으므로 오류가 발생합니다. 추론이 활성화된 OpenCode 요청을 받을 `model_list`의 모든 모델 항목에 `additional_drop_params`를 추가하세요.

```yaml
model_list:
  - model_name: gpt-5
    litellm_params:
      model: openai/gpt-5
      api_key: os.environ/OPENAI_API_KEY
      additional_drop_params: ["reasoningSummary"]
```

## 문제 해결

**OpenCode가 연결되지 않음:**
- LiteLLM 프록시가 실행 중인지 확인합니다: `curl http://localhost:4000/health`
- OpenCode 설정의 `baseURL`이 LiteLLM 인스턴스와 일치하는지 확인합니다.
- `/connect`의 프로바이더 이름이 설정과 정확히 일치하는지 확인합니다.

**인증 오류:**
- LiteLLM API 키가 올바른지 확인합니다.
- LiteLLM 인스턴스에 인증이 올바르게 설정되어 있는지 확인합니다.
- API 키가 사용하려는 모델에 접근할 수 있는지 확인합니다.

**모델을 찾을 수 없음:**
- OpenCode 설정의 모델 이름이 LiteLLM `model_name` 값과 일치하는지 확인합니다.
- 자세한 오류 메시지는 LiteLLM 로그에서 확인합니다.
- LiteLLM 인스턴스에 모델이 올바르게 설정되어 있는지 확인합니다.

**설정을 불러오지 못함:**
- 설정 파일 경로와 권한을 확인합니다.
- JSON 검증기를 사용해 JSON 문법을 검증합니다.
- `$schema` URL에 접근할 수 있는지 확인합니다.

**`Unknown parameter: 'reasoningSummary'` 오류:**
- OpenCode는 Chat Completions API에서 지원되지 않는 `reasoningSummary` 파라미터를 전송합니다. 영향을 받는 각 모델 항목의 `litellm_params`에 `additional_drop_params: ["reasoningSummary"]`를 추가하세요.
  ```yaml
  - model_name: gpt-5
    litellm_params:
      model: openai/gpt-5
      api_key: os.environ/OPENAI_API_KEY
      additional_drop_params: ["reasoningSummary"]
  ```

## 팁 {#tips}

- 필요에 따라 설정에 모델을 더 추가하세요. 추가한 모델은 `/models`에 표시됩니다.
- 모델 요구사항이 서로 다른 코드베이스에는 프로젝트별 설정을 사용하세요.
- LiteLLM 프록시 로그를 모니터링하면 OpenCode 요청을 실시간으로 확인할 수 있습니다.
