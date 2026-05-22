import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Vertex AI Agent Engine`

OpenAI 요청/응답 형식으로 Vertex AI Agent Engine(Reasoning Engines)을 호출합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Vertex AI Agent Engine은 기반 모델, 도구, 사용자 지정 로직으로 에이전트 워크플로를 실행할 수 있는 호스팅 에이전트 런타임을 제공합니다. |
| LiteLLM의 Provider Route | `vertex_ai/agent_engine/{RESOURCE_NAME}` |
| 지원 엔드포인트 | `/chat/completions`, `/v1/messages`, `/v1/responses`, `/v1/a2a/message/send` |
| Provider 문서 | [Vertex AI Agent Engine ↗](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/overview) |

## 빠른 시작

### 모델 형식

```shell showLineNumbers title="Model Format"
vertex_ai/agent_engine/{RESOURCE_NAME}
```

**예제:**
- `vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888`

### LiteLLM Python SDK

```python showLineNumbers title="Basic Agent Completion"
import litellm

response = litellm.completion(
    model="vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888",
    messages=[
        {"role": "user", "content": "Explain machine learning in simple terms"}
    ],
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Streaming Agent Responses"
import litellm

response = await litellm.acompletion(
    model="vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888",
    messages=[
        {"role": "user", "content": "What are the key principles of software architecture?"}
    ],
    stream=True,
)

async for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM Proxy

#### 1. config.yaml에서 모델 구성

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: vertex-agent-1
    litellm_params:
      model: vertex_ai/agent_engine/projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888
      vertex_project: your-project-id
      vertex_location: us-central1
```

</TabItem>
</Tabs>

#### 2. LiteLLM Proxy 시작

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

#### 3. Vertex AI Agent Engine으로 요청 보내기

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Basic Agent Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "vertex-agent-1",
    "messages": [
      {"role": "user", "content": "Summarize the main benefits of cloud computing"}
    ]
  }'
```

</TabItem>

<TabItem value="openai-sdk" label="OpenAI Python SDK">

```python showLineNumbers title="Using OpenAI SDK with LiteLLM Proxy"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

response = client.chat.completions.create(
    model="vertex-agent-1",
    messages=[
      {"role": "user", "content": "What are best practices for API design?"}
    ]
)

print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

## LiteLLM A2A 게이트웨이

LiteLLM의 A2A 게이트웨이 UI를 통해서도 Vertex AI Agent Engine에 연결할 수 있습니다. 코드를 작성하지 않고 에이전트를 등록하고 테스트할 수 있는 시각적 방식입니다.

### 1. Agents로 이동

사이드바에서 "Agents"를 클릭해 에이전트 관리 페이지를 연 다음 "+ Add New Agent"를 클릭합니다.

![Click Agents](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9a979927-ce6b-4168-9fba-e53e28f1c2c4/ascreenshot.jpeg?tl_px=0,14&br_px=1376,783&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=17,277)

![Add New Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a311750c-2e85-4589-99cb-2ce7e4021e77/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=195,257)

### 2. Vertex AI Agent Engine 유형 선택

"A2A Standard"를 클릭해 사용할 수 있는 에이전트 유형을 확인한 다음 "Vertex AI Agent Engine"을 선택합니다.

![Select A2A Standard](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/5b1acc4c-dc3f-4639-b4a0-e64b35c228fd/ascreenshot.jpeg?tl_px=52,0&br_px=1428,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,271)

![Select Vertex AI Agent Engine](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/2f3bab61-3e02-4db7-84f0-82200a0f4136/ascreenshot.jpeg?tl_px=0,244&br_px=1376,1013&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=477,277)

### 3. 에이전트 구성

다음 필드를 입력합니다.

- **Agent Name** - 에이전트에 붙일 알아보기 쉬운 이름입니다(예: `my-vertex-agent`).
- **Reasoning Engine Resource ID** - Google Cloud Console에서 확인한 전체 리소스 경로입니다(예: `projects/1060139831167/locations/us-central1/reasoningEngines/8263861224643493888`).
- **Vertex Project** - Google Cloud 프로젝트 ID입니다.
- **Vertex Location** - 에이전트가 배포된 리전입니다(예: `us-central1`).

![Enter Agent Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/695b84c7-9511-4337-bf19-f4505ab2b72b/ascreenshot.jpeg?tl_px=0,90&br_px=1376,859&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=480,276)

![Enter Resource ID](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/ddce64df-b3a3-4519-ab62-f137887bcea2/ascreenshot.jpeg?tl_px=0,294&br_px=1376,1063&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=440,277)

Resource ID는 Google Cloud Console의 Vertex AI > Agent Engine에서 확인할 수 있습니다.

![Copy Resource ID from Google Cloud Console](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/185d7f17-cbaa-45de-948d-49d2091805ea/ascreenshot.jpeg?tl_px=0,165&br_px=1376,934&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=493,276)

![Enter Vertex Project](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a64da441-3e61-4811-a1e3-9f0b12c949ff/ascreenshot.jpeg?tl_px=0,233&br_px=1376,1002&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=501,277)

Project ID는 Google Cloud Console에서 확인할 수 있습니다.

![Copy Project ID from Google Cloud Console](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9ecad3bb-a534-42d6-9604-33906014fad6/user_cropped_screenshot.webp?tl_px=0,0&br_px=1728,1028&force_format=jpeg&q=100&width=1120.0)

![Enter Vertex Location](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/316d1f38-4fb7-4377-86b6-c0fe7ac24383/ascreenshot.jpeg?tl_px=0,330&br_px=1376,1099&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=423,277)

### 4. 에이전트 생성

"Create Agent"를 클릭해 구성을 저장합니다.

![Create Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fb04b95d-793f-4eed-acf4-d1b3b5fa65e9/ascreenshot.jpeg?tl_px=352,347&br_px=1728,1117&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=623,498)

### 5. Playground에서 테스트

사이드바에서 "Playground"로 이동해 에이전트를 테스트합니다.

![Go to Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/9e01369b-6102-4fe3-96a7-90082cadfd6e/ascreenshot.jpeg?tl_px=0,0&br_px=1376,769&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=55,226)

### 6. A2A 엔드포인트 선택

엔드포인트 드롭다운을 클릭하고 `/v1/a2a/message/send`를 선택합니다.

![Select Endpoint](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/d5aeac35-531b-4cf0-af2d-88f0a71fd736/ascreenshot.jpeg?tl_px=0,146&br_px=1376,915&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=299,277)

### 7. 에이전트 선택 및 메시지 전송

드롭다운에서 Vertex AI Agent Engine을 선택하고 테스트 메시지를 보냅니다.

![Select Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/353431f3-a0ba-4436-865d-ae11595e9cc4/ascreenshot.jpeg?tl_px=0,263&br_px=1376,1032&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=270,277)

![Send Message](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fbfce72e-f50b-43e1-b6e5-0d41192d8e2d/ascreenshot.jpeg?tl_px=95,347&br_px=1471,1117&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,474)

![Agent Response](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/892dd826-fbf9-4530-8d82-95270889274a/ascreenshot.jpeg?tl_px=0,82&br_px=1376,851&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=485,277)

## 환경 변수

| 변수 | 설명 |
|----------|-------------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 서비스 계정 JSON 키 파일 경로 |
| `VERTEXAI_PROJECT` | Google Cloud 프로젝트 ID |
| `VERTEXAI_LOCATION` | Google Cloud 리전(기본값: `us-central1`) |

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export VERTEXAI_PROJECT="your-project-id"
export VERTEXAI_LOCATION="us-central1"
```

## 추가 자료

- [Vertex AI Agent Engine 문서](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/overview)
- [Reasoning Engine 생성](https://cloud.google.com/vertex-ai/generative-ai/docs/reasoning-engine/create)
- [A2A Agent Gateway](../a2a.md)
- [Vertex AI Provider](./vertex.md)
