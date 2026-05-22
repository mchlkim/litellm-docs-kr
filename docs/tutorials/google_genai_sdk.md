import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM으로 Google GenAI SDK 사용하기 {#google-genai-sdk-with-litellm}

LiteLLM Proxy를 통해 Google의 공식 GenAI SDK(JavaScript/TypeScript 및 Python)를 원하는 LLM 공급자와 함께 사용하세요.

Google GenAI SDK(JS용 `@google/genai`, Python용 `google-genai`)는 Gemini 모델을 호출하는 네이티브 인터페이스를 제공합니다. 이 SDK가 LiteLLM을 바라보도록 설정하면 네이티브 Gemini 요청/응답 형식은 유지하면서 동일한 SDK로 OpenAI, Anthropic, Bedrock, Azure, Vertex AI 또는 다른 공급자를 사용할 수 있습니다.

## Google GenAI SDK와 함께 LiteLLM을 사용하는 이유 {#why-use-litellm-with-google-genai-sdk}

**개발자 이점:**
- **범용 모델 접근**: Google GenAI SDK 인터페이스를 통해 LiteLLM이 지원하는 모든 모델(Anthropic, OpenAI, Vertex AI, Bedrock 등)을 사용할 수 있습니다.
- **더 높은 속도 제한과 안정성**: 여러 모델과 공급자에 걸쳐 로드 밸런싱하여 개별 공급자 제한에 걸리지 않도록 하고, 한 공급자가 실패해도 응답을 받을 수 있도록 폴백을 사용할 수 있습니다.

**Proxy 관리자 이점:**
- **중앙 집중식 관리**: 개발자에게 각 공급자의 API 키를 제공하지 않고도 단일 LiteLLM proxy 인스턴스를 통해 모든 모델 접근을 제어할 수 있습니다.
- **예산 제어**: 모든 SDK 사용량에 대해 지출 한도를 설정하고 비용을 추적할 수 있습니다.
- **로깅 및 관측성**: 비용 추적, 로깅, 분석으로 모든 요청을 추적할 수 있습니다.

| 기능 | 지원 여부 | 참고 |
|---------|-----------|-------|
| 비용 추적 | ✅ | `/generateContent` 엔드포인트의 모든 모델 |
| 로깅 | ✅ | 모든 통합에서 작동 |
| 스트리밍 | ✅ | `streamGenerateContent` 지원 |
| 가상 키 | ✅ | Google 키 대신 LiteLLM 키 사용 |
| 로드 밸런싱 | ✅ | 네이티브 router 엔드포인트를 통해 제공 |
| 폴백 | ✅ | 네이티브 router 엔드포인트를 통해 제공 |

## 빠른 시작

### 1. SDK 설치 {#1-install-the-sdk}

<Tabs>
<TabItem value="js" label="JavaScript/TypeScript">

```bash
npm install @google/genai
```

</TabItem>
<TabItem value="python" label="Python">

```bash
uv add google-genai
```

</TabItem>
</Tabs>

### 2. LiteLLM Proxy 시작 {#2-start-litellm-proxy}

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gemini-2.5-flash
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GEMINI_API_KEY
```

```bash
litellm --config config.yaml
```

### 3. LiteLLM을 통해 SDK 호출 {#3-call-the-sdk-through-litellm}

<Tabs>
<TabItem value="js" label="JavaScript/TypeScript">

```javascript title="index.js" showLineNumbers
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "sk-1234",  // LiteLLM virtual key (not a Google key)
  httpOptions: {
    baseUrl: "http://localhost:4000/gemini",  // LiteLLM proxy URL
  },
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works",
  });
  console.log(response.text);
}

main();
```

</TabItem>
<TabItem value="python" label="Python">

```python title="main.py" showLineNumbers
from google import genai

client = genai.Client(
    api_key="sk-1234",  # LiteLLM virtual key (not a Google key)
    http_options={"base_url": "http://localhost:4000/gemini"},  # LiteLLM proxy URL
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works",
)
print(response.text)
```

</TabItem>
<TabItem value="curl" label="curl">

```bash
curl "http://localhost:4000/gemini/v1beta/models/gemini-2.5-flash:generateContent?key=sk-1234" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [{
      "parts": [{"text": "Explain how AI works"}]
    }]
  }'
```

</TabItem>
</Tabs>

## 스트리밍 {#streaming}

<Tabs>
<TabItem value="js" label="JavaScript/TypeScript">

```javascript title="streaming.js" showLineNumbers
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "sk-1234",
  httpOptions: {
    baseUrl: "http://localhost:4000/gemini",
  },
});

async function main() {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: "Write a short poem about the ocean",
  });

  for await (const chunk of response) {
    process.stdout.write(chunk.text);
  }
}

main();
```

</TabItem>
<TabItem value="python" label="Python">

```python title="streaming.py" showLineNumbers
from google import genai

client = genai.Client(
    api_key="sk-1234",
    http_options={"base_url": "http://localhost:4000/gemini"},
)

response = client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Write a short poem about the ocean",
)

for chunk in response:
    print(chunk.text, end="")
```

</TabItem>
</Tabs>

## 멀티턴 채팅 {#multi-turn-chat}

<Tabs>
<TabItem value="js" label="JavaScript/TypeScript">

```javascript title="chat.js" showLineNumbers
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "sk-1234",
  httpOptions: {
    baseUrl: "http://localhost:4000/gemini",
  },
});

async function main() {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
  });

  const response1 = await chat.sendMessage({ message: "I have 2 dogs and 3 cats." });
  console.log(response1.text);

  const response2 = await chat.sendMessage({ message: "How many pets is that in total?" });
  console.log(response2.text);
}

main();
```

</TabItem>
<TabItem value="python" label="Python">

```python title="chat.py" showLineNumbers
from google import genai

client = genai.Client(
    api_key="sk-1234",
    http_options={"base_url": "http://localhost:4000/gemini"},
)

chat = client.chats.create(model="gemini-2.5-flash")

response1 = chat.send_message("I have 2 dogs and 3 cats.")
print(response1.text)

response2 = chat.send_message("How many pets is that in total?")
print(response2.text)
```

</TabItem>
</Tabs>


## 고급: GenAI SDK로 모든 모델 사용 {#advanced-use-any-model-with-the-genai-sdk}

기본적으로 GenAI SDK는 Gemini 모델과 통신합니다. 하지만 LiteLLM의 router를 사용하면 GenAI SDK 요청을 Anthropic, OpenAI, Bedrock 등 **원하는 공급자**로 라우팅할 수 있습니다.

이는 `model_group_alias`로 Gemini 모델 이름을 원하는 공급자 모델에 매핑하는 방식으로 동작합니다. LiteLLM은 내부에서 형식 변환을 처리합니다.

:::info

이 기능을 사용하려면 SDK `baseUrl`이 `/gemini`를 제외한 `http://localhost:4000`을 가리키도록 설정하세요. 그러면 요청이 LiteLLM의 네이티브 Google 엔드포인트를 통해 라우팅되고, 해당 경로는 router를 거치며 모델 alias를 지원합니다.

:::

<Tabs>
<TabItem value="anthropic" label="Anthropic">

`gemini-2.5-flash` 요청을 Claude Sonnet으로 라우팅합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: claude-sonnet
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-flash": "claude-sonnet"}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

`gemini-2.5-flash` 요청을 GPT-4o로 라우팅합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: gpt-4o-model
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-flash": "gpt-4o-model"}
```

</TabItem>
<TabItem value="bedrock" label="Bedrock">

`gemini-2.5-flash` 요청을 Bedrock의 Claude로 라우팅합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: bedrock-claude
    litellm_params:
      model: bedrock/anthropic.claude-haiku-4-5-20251001:0
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1

router_settings:
  model_group_alias: {"gemini-2.5-flash": "bedrock-claude"}
```

</TabItem>
<TabItem value="multi" label="다중 공급자 로드 밸런싱">

Anthropic과 OpenAI에 걸쳐 로드 밸런싱합니다.

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: my-model
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: my-model
    litellm_params:
      model: gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-flash": "my-model"}
```

</TabItem>
</Tabs>

그런 다음 `/gemini`를 제외하고 LiteLLM을 가리키는 `baseUrl`로 SDK를 사용합니다.

<Tabs>
<TabItem value="js" label="JavaScript/TypeScript">

```javascript title="any_model.js" showLineNumbers
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "sk-1234",
  httpOptions: {
    baseUrl: "http://localhost:4000",  // No /gemini — goes through the router
  },
});

async function main() {
  // This calls Claude/GPT-4o/Bedrock under the hood via model_group_alias
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello from any model!",
  });
  console.log(response.text);
}

main();
```

</TabItem>
<TabItem value="python" label="Python">

```python title="any_model.py" showLineNumbers
from google import genai

client = genai.Client(
    api_key="sk-1234",
    http_options={"base_url": "http://localhost:4000"},  # No /gemini
)

# This calls Claude/GPT-4o/Bedrock under the hood via model_group_alias
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello from any model!",
)
print(response.text)
```

</TabItem>
</Tabs>


## Pass-through와 네이티브 Router 엔드포인트 비교 {#pass-through-vs-native-router-endpoints}

LiteLLM은 GenAI SDK 요청을 처리하는 두 가지 방식을 제공합니다.

| | Pass-through (`/gemini`) | 네이티브 Router (`/`) |
|---|---|---|
| **baseUrl** | `http://localhost:4000/gemini` | `http://localhost:4000` |
| **모델** | Gemini만 지원 | `model_group_alias`를 통한 모든 공급자 |
| **변환** | 없음 - Google로 직접 프록시 | 내부에서 변환 |
| **비용 추적** | ✅ | ✅ |
| **가상 키** | ✅ | ✅ |
| **로드 밸런싱** | ❌ | ✅ |
| **폴백** | ❌ | ✅ |
| **적합한 용도** | 단순 Gemini proxy | 다중 공급자 라우팅 |

## 환경 변수 설정 {#environment-variable-설정}

코드 대신 환경 변수로 SDK를 설정할 수도 있습니다.

```bash
# For JavaScript SDK (@google/genai)
export GOOGLE_GEMINI_BASE_URL="http://localhost:4000/gemini"
export GEMINI_API_KEY="sk-1234"

# For Python SDK (google-genai)
# Note: The Python SDK does not support a base URL env var.
# Configure it in code with http_options={"base_url": "..."} instead.
export GEMINI_API_KEY="sk-1234"
```

이는 [Gemini CLI](./litellm_gemini_cli.md)처럼 GenAI SDK 위에 구축된 도구에서 특히 유용합니다.

## 관련 리소스 {#related-resources}

- [LiteLLM으로 Gemini CLI 사용하기](./litellm_gemini_cli.md)
- [Google AI Studio Pass-Through 사용하기](../pass_through/google_ai_studio)
- [LiteLLM으로 Google ADK 사용하기](./google_adk.md)
- [LiteLLM Proxy 빠른 시작](../proxy/quick_start)
- [`@google/genai` npm 패키지](https://www.npmjs.com/package/@google/genai)
- [`google-genai` PyPI 패키지](https://pypi.org/project/google-genai/)
