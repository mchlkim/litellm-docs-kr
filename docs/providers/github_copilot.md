import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# GitHub Copilot

https://docs.github.com/en/copilot

:::tip

**자동 인증 처리를 포함한 GitHub Copilot Chat API를 지원합니다**

:::

| 속성 | 세부 정보 |
|-------|-------|
| 설명 | GitHub Copilot Chat API는 GitHub의 AI 기반 코딩 어시스턴트에 접근할 수 있게 해줍니다. |
| LiteLLM의 Provider Route | `github_copilot/` |
| 지원 엔드포인트 | `/chat/completions`, `/embeddings` |
| API 참조 | [GitHub Copilot 문서](https://docs.github.com/en/copilot) |

## 인증

GitHub Copilot은 인증에 OAuth device flow를 사용합니다. 처음 사용할 때 GitHub를 통해 인증하라는 메시지가 표시됩니다.

1. LiteLLM이 device code와 verification URL을 표시합니다
2. URL에 접속한 뒤 코드를 입력해 인증합니다
3. 이후 사용할 수 있도록 자격 증명이 로컬에 저장됩니다

## 사용법 - LiteLLM Python SDK

### 채팅 완료 {#chat-completion}

```python showLineNumbers title="GitHub Copilot Chat Completion"
from litellm import completion

response = completion(
    model="github_copilot/gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant"},
        {"role": "user", "content": "Write a Python function to calculate fibonacci numbers"}
    ]
)
print(response)
```

```python showLineNumbers title="GitHub Copilot Chat Completion - Streaming"
from litellm import completion

stream = completion(
    model="github_copilot/gpt-4",
    messages=[{"role": "user", "content": "Explain async/await in Python"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

### Responses {#responses}

GPT Codex 모델은 responses API만 지원합니다.

```python showLineNumbers title="GitHub Copilot Responses"
import litellm

response = await litellm.aresponses(
    model="github_copilot/gpt-5.1-codex",
    input="Write a Python hello world",
    max_output_tokens=500
)

print(response)
```

### 임베딩 {#embedding}

```python showLineNumbers title="GitHub Copilot Embedding"
import litellm

response = litellm.embedding(
    model="github_copilot/text-embedding-3-small",
    input=["good morning from litellm"]
)
print(response)
```

## 사용법 - LiteLLM Proxy

LiteLLM Proxy 설정 파일에 다음 내용을 추가합니다.

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: github_copilot/gpt-4
    litellm_params:
      model: github_copilot/gpt-4
  - model_name: github_copilot/gpt-5.1-codex
    model_info:
      mode: responses
    litellm_params:
      model: github_copilot/gpt-5.1-codex
  - model_name: github_copilot/text-embedding-ada-002
    model_info:
      mode: embedding
    litellm_params:
      model: github_copilot/text-embedding-ada-002
```

LiteLLM Proxy 서버를 시작합니다.

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="GitHub Copilot via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="github_copilot/gpt-4",
    messages=[{"role": "user", "content": "How do I optimize this SQL query?"}]
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="GitHub Copilot via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/github_copilot/gpt-4",
    messages=[{"role": "user", "content": "Review this code for bugs"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="GitHub Copilot via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "github_copilot/gpt-4",
    "messages": [{"role": "user", "content": "Explain this error message"}]
  }'
```

</TabItem>
</Tabs>

## 시작하기

1. GitHub Copilot 접근 권한이 있는지 확인합니다. 유료 GitHub 구독이 필요합니다
2. 첫 LiteLLM 요청을 실행합니다. 인증하라는 메시지가 표시됩니다
3. device flow 인증 절차를 따릅니다
4. LiteLLM을 통해 GitHub Copilot에 요청을 보내기 시작합니다

## 설정

### 환경 변수 {#environment-variables}

토큰 저장 위치를 사용자 지정할 수 있습니다.

```bash showLineNumbers title="Environment Variables"
# Optional: Custom token directory
export GITHUB_COPILOT_TOKEN_DIR="~/.config/litellm/github_copilot"

# Optional: Custom access token file name
export GITHUB_COPILOT_ACCESS_TOKEN_FILE="access-token"

# Optional: Custom API key file name
export GITHUB_COPILOT_API_KEY_FILE="api-key.json"

# Optional: Custom Copilot endpoints for authentication and usage
# (needed when using GitHub Enterprise subscriptions with custom endpoints or self-hosted GitHub servers
export GITHUB_COPILOT_API_BASE="https://copilot-api.my-company.ghe.com"
export GITHUB_COPILOT_DEVICE_CODE_URL="https://my-company.ghe.com/login/device/code"
export GITHUB_COPILOT_ACCESS_TOKEN_URL="https://my-company.ghe.com/login/oauth/access_token"
export GITHUB_COPILOT_API_KEY_URL="https://my-company.ghe.com/api/v3/copilot_internal/v2/token"
```

### 헤더 {#headers}

LiteLLM은 필요한 GitHub Copilot 헤더를 자동으로 삽입합니다. VSCode를 시뮬레이션하므로 수동으로 지정할 필요가 없습니다.

기본값을 재정의하려는 경우, 예를 들어 다른 에디터를 시뮬레이션하려면 `extra_headers`를 사용할 수 있습니다.

```python showLineNumbers title="Custom Headers (Optional)"
extra_headers = {
    "editor-version": "vscode/1.85.1",           # Editor version
    "editor-plugin-version": "copilot/1.155.0",  # Plugin version
    "Copilot-Integration-Id": "vscode-chat",     # Integration ID
    "user-agent": "GithubCopilot/1.155.0"        # User agent
}
```
