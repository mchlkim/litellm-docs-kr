import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LangGraph

OpenAI chat completions 형식을 사용해 LiteLLM에서 LangGraph 에이전트를 호출합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | LangGraph는 LLM으로 상태 저장형 다중 행위자 애플리케이션을 빌드하기 위한 프레임워크입니다. LiteLLM은 스트리밍 및 비스트리밍 엔드포인트를 통한 LangGraph 에이전트 호출을 지원합니다. |
| LiteLLM의 공급자 경로 | `langgraph/{agent_id}` |
| 공급자 문서 | [LangGraph Platform ↗](https://langchain-ai.github.io/langgraph/cloud/quick_start/) |

**사전 준비:** 실행 중인 LangGraph 서버가 필요합니다. 아래의 [로컬 LangGraph 서버 설정](#setting-up-a-local-langgraph-server)을 참고하세요.

## 빠른 시작

### 모델 형식 {#model-format}

```shell showLineNumbers title="Model Format"
langgraph/{agent_id}
```

**예제:**
- `langgraph/agent` - 기본 에이전트를 호출합니다.

### LiteLLM Python SDK

```python showLineNumbers title="Basic LangGraph Completion"
import litellm

response = litellm.completion(
    model="langgraph/agent",
    messages=[
        {"role": "user", "content": "What is 25 * 4?"}
    ],
    api_base="http://localhost:2024",
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Streaming LangGraph Response"
import litellm

response = litellm.completion(
    model="langgraph/agent",
    messages=[
        {"role": "user", "content": "What is the weather in Tokyo?"}
    ],
    api_base="http://localhost:2024",
    stream=True,
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### LiteLLM Proxy

#### 1. config.yaml에서 모델 구성 {#1-configure-your-model-in-configyaml}

<Tabs>
<TabItem value="config-yaml" label="config.yaml">

```yaml showLineNumbers title="LiteLLM Proxy Configuration"
model_list:
  - model_name: langgraph-agent
    litellm_params:
      model: langgraph/agent
      api_base: http://localhost:2024
```

</TabItem>
</Tabs>

#### 2. LiteLLM Proxy 시작 {#2-start-the-litellm-proxy}

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

#### 3. LangGraph 에이전트에 요청 보내기 {#3-make-requests-to-your-langgraph-agent}

<Tabs>
<TabItem value="curl" label="Curl">

```bash showLineNumbers title="Basic Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "langgraph-agent",
    "messages": [
      {"role": "user", "content": "What is 25 * 4?"}
    ]
  }'
```

```bash showLineNumbers title="Streaming Request"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "langgraph-agent",
    "messages": [
      {"role": "user", "content": "What is the weather in Tokyo?"}
    ],
    "stream": true
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
    model="langgraph-agent",
    messages=[
        {"role": "user", "content": "What is 25 * 4?"}
    ]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Streaming with OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="your-litellm-api-key"
)

stream = client.chat.completions.create(
    model="langgraph-agent",
    messages=[
        {"role": "user", "content": "What is the weather in Tokyo?"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
</Tabs>

## 환경 변수 {#environment-variables}

| 변수 | 설명 |
|----------|-------------|
| `LANGGRAPH_API_BASE` | LangGraph 서버의 기본 URL(기본값: `http://localhost:2024`) |
| `LANGGRAPH_API_KEY` | 인증에 사용할 선택적 API 키 |

## 지원 파라미터

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `model` | string | `langgraph/{agent_id}` 형식의 에이전트 ID |
| `messages` | array | OpenAI 형식의 채팅 메시지 |
| `stream` | boolean | 스트리밍 응답 활성화 |
| `api_base` | string | LangGraph 서버 URL |
| `api_key` | string | 선택적 API 키 |


## 로컬 LangGraph 서버 설정 {#setting-up-a-local-langgraph-server}

LiteLLM에서 LangGraph를 사용하기 전에 실행 중인 LangGraph 서버가 필요합니다.

### 사전 준비

- Python 3.11+
- LLM API 키(OpenAI 또는 Google Gemini)

### 1. LangGraph CLI 설치 {#1-install-the-langgraph-cli}

```bash
uv add "langgraph-cli[inmem]"
```

### 2. 새 LangGraph 프로젝트 생성 {#2-create-a-new-langgraph-project}

```bash
langgraph new my-agent --template new-langgraph-project-python
cd my-agent
```

### 3. 의존성 설치 {#3-install-dependencies}

```bash
uv add -e .
```

### 4. API 키 설정 {#4-set-your-api-key}

```bash
echo "OPENAI_API_KEY=your_key_here" > .env
```

### 5. 서버 시작 {#5-start-the-server}

```bash
langgraph dev
```

서버는 `http://localhost:2024`에서 시작됩니다.

### 서버 실행 상태 확인 {#verify-the-server-is-running}

```bash
curl -s --request POST \
  --url "http://localhost:2024/runs/wait" \
  --header 'Content-Type: application/json' \
  --data '{
    "assistant_id": "agent",
    "input": {
      "messages": [{"role": "human", "content": "Hello!"}]
    }
  }'
```



## LiteLLM A2A 게이트웨이 사용 {#litellm-a2a-gateway}

LiteLLM의 A2A 게이트웨이 UI를 통해서도 LangGraph 에이전트에 연결할 수 있습니다. 코드를 작성하지 않고 에이전트를 등록하고 테스트할 수 있는 시각적 방법을 제공합니다.

### 1. Agents로 이동 {#1-navigate-to-agents}

사이드바에서 "Agents"를 클릭해 에이전트 관리 페이지를 연 다음, "+ Add New Agent"를 클릭합니다.

![Agents로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/27429cae-f743-440a-a6aa-29fa7ee013db/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=211,114)

### 2. LangGraph 에이전트 타입 선택 {#2-select-langgraph-agent-type}

"A2A Standard"를 클릭해 사용 가능한 에이전트 타입을 확인한 다음, "langgraph"를 검색하고 LangGraph Platform API 연결 옵션을 선택합니다.

![A2A Standard 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/4add4088-683d-49ca-9374-23fd65dddf8e/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=511,139)

![LangGraph 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/fd197907-47c7-4e05-959c-c0d42264263c/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=431,246)

### 3. 에이전트 구성 {#3-configure-the-agent}

다음 필드를 입력합니다.

- **Agent Name** - 고유 식별자(예: `lan-agent`)
- **LangGraph API Base** - LangGraph 서버 URL입니다. 일반적으로 `http://127.0.0.1:2024/`를 사용합니다.
- **API Key** - 선택 사항입니다. LangGraph는 기본적으로 API 키를 요구하지 않습니다.
- **Assistant ID** - LangGraph에서 사용하지 않으므로, 원하는 문자열을 입력할 수 있습니다.

![에이전트 이름 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/adce3df9-a67c-4d23-b2b5-05120738bc46/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![API Base 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6a6a03a7-f235-41db-b4ba-d32ced330f25/ascreenshot.jpeg?tl_px=0,251&br_px=2617,1714&force_format=jpeg&q=100&width=1120.0)

"Create Agent"를 클릭해 저장합니다.

![에이전트 생성](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/ddee4295-9a32-4cda-8e3f-543e5047eb6a/ascreenshot.jpeg?tl_px=416,653&br_px=2618,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=686,316)

### 4. Playground에서 테스트 {#4-test-in-playground}

사이드바의 "Playground"로 이동해 에이전트를 테스트합니다. 엔드포인트 타입을 `/v1/a2a/message/send`로 변경합니다.

![Playground로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/c4262189-95ac-4fbc-b5af-8aba8126e4f7/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=41,104)

![A2A 엔드포인트 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6cbc8e93-7d0c-47fc-9ad4-562663f759d5/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=324,265)

### 5. 에이전트 선택 및 메시지 전송 {#5-select-your-agent-and-send-a-message}

드롭다운에서 LangGraph 에이전트를 선택하고 테스트 메시지를 보냅니다.

![에이전트 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/d01da2f1-3b89-47d7-ba95-de2dd8efbc1e/ascreenshot.jpeg?tl_px=0,92&br_px=2201,1323&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=348,277)

![메시지 전송](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/79db724e-a99e-493a-9747-dc91cb398370/ascreenshot.jpeg?tl_px=51,653&br_px=2252,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,444)

에이전트가 자신의 기능으로 응답합니다. 이제 A2A 프로토콜을 통해 LangGraph 에이전트와 상호작용할 수 있습니다.

![에이전트 응답](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/82aa546a-0eb5-4836-b986-9aefcfe09e10/ascreenshot.jpeg?tl_px=295,28&br_px=2496,1259&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,277)

## 추가 자료 {#further-reading}

- [LangGraph Platform 문서](https://langchain-ai.github.io/langgraph/cloud/quick_start/)
- [LangGraph GitHub](https://github.com/langchain-ai/langgraph)
- [A2A 에이전트 게이트웨이](../a2a.md)
- [A2A 비용 추적](../a2a_cost_tracking.md)
