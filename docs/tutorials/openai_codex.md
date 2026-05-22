import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI Codex

이 가이드는 OpenAI Codex를 LiteLLM에 연결하는 방법을 설명합니다. Codex와 함께 LiteLLM을 사용하면 팀은 다음을 할 수 있습니다:
- Codex 인터페이스를 통해 100개 이상의 LLM에 접근
- 익숙한 인터페이스에서 Gemini 같은 강력한 모델 사용
- LiteLLM 내장 analytics로 비용과 사용량 추적
- virtual key로 모델 접근 제어

<Image img={require('../../img/litellm_codex.gif')} />

## 빠른 시작

:::info

LiteLLM v1.66.3.dev5 이상이 필요합니다.

:::


먼저 [LiteLLM 시작하기 Guide](../proxy/docker_quick_start.md)에 따라 LiteLLM을 설정하세요.

## 1. OpenAI Codex 설치

npm을 사용해 OpenAI Codex CLI 도구를 전역으로 설치합니다:

<Tabs>
<TabItem value="npm" label="npm">

```bash showLineNumbers
npm i -g @openai/codex
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash showLineNumbers
yarn global add @openai/codex
```

</TabItem>
</Tabs>

## 2. LiteLLM Proxy 시작

<Tabs>
<TabItem value="docker" label="Docker">

```bash showLineNumbers
docker run \
    -v $(pwd)/litellm_config.yaml:/app/config.yaml \
    -p 4000:4000 \
    docker.litellm.ai/berriai/litellm:main-latest \
    --config /app/config.yaml
```

</TabItem>
<TabItem value="pip" label="LiteLLM CLI">

```bash showLineNumbers
litellm --config /path/to/config.yaml
```

</TabItem>
</Tabs>

이제 LiteLLM이 [http://localhost:4000](http://localhost:4000)에서 실행 중이어야 합니다.

## 3. 모델 라우팅을 위한 LiteLLM 설정

원하는 모델로 라우팅되도록 LiteLLM Proxy가 올바르게 설정되어 있는지 확인하세요. 다음 내용으로 `litellm_config.yaml` 파일을 만듭니다:

```yaml showLineNumbers
model_list:
  - model_name: o3-mini
    litellm_params:
      model: openai/o3-mini
      api_key: os.environ/OPENAI_API_KEY
  - model_name: claude-3-7-sonnet-latest
    litellm_params:
      model: anthropic/claude-3-7-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: gemini-2.0-flash
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: os.environ/GEMINI_API_KEY

litellm_settings:
  drop_params: true
```

이 설정은 명시적인 이름으로 특정 OpenAI, Anthropic, Gemini 모델에 라우팅할 수 있게 합니다.

## 4. Codex가 LiteLLM Proxy를 사용하도록 설정

Codex가 LiteLLM Proxy를 바라보도록 필요한 환경 변수를 설정합니다:

```bash
# Point to your LiteLLM Proxy server
export OPENAI_BASE_URL=http://0.0.0.0:4000 

# Use your LiteLLM API key (if you've set up authentication)
export OPENAI_API_KEY="sk-1234"
```

## 5. Gemini로 Codex 실행

설정이 끝나면 Gemini로 Codex를 실행할 수 있습니다:

```bash showLineNumbers
codex --model gemini-2.0-flash --full-auto
```

<Image img={require('../../img/litellm_codex.gif')} />

`--full-auto` 플래그는 추가 프롬프트 없이 Codex가 자동으로 코드를 생성하도록 합니다.

## 6. 고급 옵션

### 다른 모델 사용

LiteLLM Proxy에 설정된 어떤 모델이든 사용할 수 있습니다:

```bash
# Use Claude models
codex --model claude-3-7-sonnet-latest

# Use Google AI Studio Gemini models
codex --model gemini/gemini-2.0-flash
```

## 문제 해결

- 연결 문제가 발생하면 LiteLLM Proxy가 실행 중이고 지정한 URL에서 접근 가능한지 확인하세요.
- 인증을 사용하는 경우 LiteLLM API key가 유효한지 확인하세요.
- 모델 라우팅 설정이 올바른지 확인하세요.
- 모델별 오류가 발생하면 해당 모델이 LiteLLM 설정에 올바르게 구성되어 있는지 확인하세요.

## 추가 리소스

- [LiteLLM Docker 빠른 시작 Guide](../proxy/docker_quick_start.md)
- [OpenAI Codex GitHub Repository](https://github.com/openai/codex)
- [LiteLLM 가상 키와 인증](../proxy/virtual_keys.md)
