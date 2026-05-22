import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `Pydantic AI Agents` {#pydantic-ai-agents}

LiteLLM의 A2A Gateway를 통해 Pydantic AI Agents를 호출합니다.

| 속성 | 세부 정보 |
|----------|---------|
| 설명 | Pydantic AI agents는 `to_a2a()` 메서드를 통해 네이티브 A2A 지원을 제공합니다. LiteLLM은 기본적으로 스트리밍을 지원하지 않는 에이전트를 위해 fake streaming 지원을 제공합니다. |
| LiteLLM의 Provider Route | A2A Gateway |
| 지원 엔드포인트 | `/v1/a2a/message/send` |
| Provider 문서 | [Pydantic AI Agents ↗](https://ai.pydantic.dev/agents/) |

## `LiteLLM A2A Gateway` {#litellm-a2a-gateway}

모든 Pydantic AI agents는 `to_a2a()` 메서드를 사용해 A2A agents로 노출되어야 합니다. 에이전트 서버가 실행되면 LiteLLM Gateway에 추가할 수 있습니다.

### 1. Pydantic AI Agent Server 설정 {#1-setup-pydantic-ai-agent-server}

LiteLLM은 Pydantic AI agents가 [A2A (Agent-to-Agent) protocol](https://github.com/google/A2A)을 따르도록 요구합니다. Pydantic AI는 `to_a2a()` 메서드를 통해 네이티브 A2A 지원을 제공하며, 이 메서드는 에이전트를 A2A 호환 서버로 노출합니다.

#### 의존성 설치 {#install-dependencies}

```bash
uv add pydantic-ai fasta2a uvicorn
```

#### Agent 생성 {#create-agent}

```python title="agent.py"
from pydantic_ai import Agent

agent = Agent('openai:gpt-4o-mini', instructions='Be helpful!')

@agent.tool_plain
def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"Weather in {city}: Sunny, 72°F"

@agent.tool_plain  
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return str(eval(expression))

# Native A2A server - Pydantic AI handles it automatically
app = agent.to_a2a()
```

#### Server 실행 {#run-server}

```bash
uvicorn agent:app --host 0.0.0.0 --port 9999
```

Server는 `http://localhost:9999`에서 실행됩니다.

### 2. Agents로 이동 {#2-navigate-to-agents}

사이드바에서 "Agents"를 클릭해 에이전트 관리 페이지를 연 다음, "+ Add New Agent"를 클릭합니다.

### 3. Pydantic AI Agent 유형 선택 {#3-select-pydantic-ai-agent-type}

"A2A Standard"를 클릭해 사용할 수 있는 에이전트 유형을 확인한 다음 "Pydantic AI"를 선택합니다.

![A2A Standard 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/1055acb1-064b-4465-8e6a-8278291bc661/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=395,147)

![Pydantic AI 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/0998e38c-8534-40f1-931a-be96c2cae0ad/ascreenshot.jpeg?tl_px=0,52&br_px=2201,1283&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=421,277)

### 4. Agent 구성 {#4-configure-the-agent}

다음 필드를 입력합니다.

- **Agent Name** - 에이전트의 고유 식별자입니다(예: `test-pydantic-agent`).
- **Agent URL** - Pydantic AI agent가 실행 중인 URL입니다. 이전 단계에서 Pydantic AI agent server를 `http://localhost:9999`에서 시작했으므로 이 값을 사용합니다.

![Agent Name 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/8cf3fbde-05f3-48d1-81b6-6f857bd6d360/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=443,225)

![Agent Name 구성](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/fb555808-4761-4c49-a415-200ac1bdb525/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![Agent URL 입력](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/303eae61-4352-4fb0-a537-806839c234ba/ascreenshot.jpeg?tl_px=0,212&br_px=2201,1443&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=456,277)

### 5. Agent 생성 {#5-create-agent}

"Create Agent"를 클릭해 구성을 저장합니다.

![Agent 생성](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/914f3367-df7d-4244-bd4d-e99ce0a6193a/ascreenshot.jpeg?tl_px=416,438&br_px=2618,1669&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=690,277)

### 6. Playground에서 테스트 {#6-test-in-playground}

사이드바에서 "Playground"로 이동해 에이전트를 테스트합니다.

![Playground로 이동](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/c73c9f3b-22af-4105-aafa-2d34c4986ef3/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=44,97)

### 7. A2A Endpoint 선택 {#7-select-a2a-endpoint}

endpoint 드롭다운을 클릭하고 "a2a"를 검색한 다음 `/v1/a2a/message/send`를 선택합니다.

![Endpoint 드롭다운 클릭](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/196d97ac-bcba-47f0-9880-97b80250e00c/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=261,230)

![A2A 검색](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/26b68f21-29f9-4c4c-b8b5-d2e11cbfd14a/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![A2A Endpoint 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/41576fb1-d385-4fb2-84e9-142dd7fe5181/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=307,270)

### 8. Agent 선택 및 메시지 전송 {#8-select-your-agent-and-send-a-message}

드롭다운에서 Pydantic AI agent를 선택하고 테스트 메시지를 전송합니다.

![Agent 드롭다운 클릭](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/a96d7967-3d54-4cbf-bd3e-b38f1be9df76/ascreenshot.jpeg?tl_px=0,54&br_px=2201,1285&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=274,277)

![Agent 선택](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/e05a5a6e-d044-4480-b94e-7c03cfb92ac5/ascreenshot.jpeg?tl_px=0,113&br_px=2201,1344&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=290,277)

![메시지 전송](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-16/29162702-968a-401a-aac1-c844bfc5f4a3/ascreenshot.jpeg?tl_px=91,653&br_px=2292,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,436)


## 추가 자료 {#further-reading}

- [Pydantic AI Documentation](https://ai.pydantic.dev/)
- [Pydantic AI Agents](https://ai.pydantic.dev/agents/)
- [A2A Agent Gateway](../a2a.md)
- [A2A Cost Tracking](../a2a_cost_tracking.md)
