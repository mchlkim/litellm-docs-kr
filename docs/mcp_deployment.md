import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP 배포 가이드

LiteLLM을 LLM, MCP 서버, agent를 위한 중앙 Gateway로 배포하는 방법입니다.

---

## 핵심 개념

LiteLLM은 세 가지 resource type을 위한 단일 control plane입니다.

| 리소스 | 등록 방식 |
|----------|--------------|
| **LLM** | config의 `model_list` 또는 API |
| **MCP Server** | config의 `mcp_servers` 또는 UI |
| **Agent** | A2A route |

세 리소스는 모두 같은 인증(LiteLLM API key), rate limiting, usage dashboard를 공유합니다. 별도 registry 없이 중앙 catalog를 제공하는 구조입니다.

---

## 배포 토폴로지

### 옵션 A: 단일 Gateway(권장)

하나의 LiteLLM instance가 LLM 라우팅, MCP tool 호출, A2A agent 호출을 모두 처리합니다.

```
Agents / AI clients
        │
        ▼
┌───────────────────────────────────┐
│         LiteLLM Gateway           │
│  /v1/chat/completions  (LLMs)     │
│  /mcp                  (tools)    │
│  /a2a                  (agents)   │
└───────┬───────┬──────────┬────────┘
        │       │          │
   OpenAI   MCP servers  Downstream
   Bedrock  (internal)    agents
   Azure    (public)
```

하나의 서비스, 하나의 config, 하나의 API key 집합만 관리하면 됩니다. [public internet filter](./mcp_public_internet.md)를 사용해 어떤 MCP 서버를 외부 caller(Claude Desktop, ChatGPT)에 노출하고, 어떤 서버를 internal-only로 둘지 제어합니다.

```yaml title="config.yaml" showLineNumbers
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  store_model_in_db: true
  mcp_internal_ip_ranges:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
    - "192.168.0.0/16"
    - "100.64.0.0/10"   # VPN/Tailscale range

model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

mcp_servers:
  - server_name: internal-db
    url: http://db-mcp.internal:8000/mcp
    transport: http
    available_on_public_internet: false  # internal callers only

  - server_name: web-search
    url: https://mcp.exa.ai/mcp
    transport: http
    available_on_public_internet: true   # visible to ChatGPT / Claude Desktop
```

---

### 옵션 B: LLM Gateway와 MCP Gateway 분리

LiteLLM 배포를 두 개로 나눕니다. 하나는 LLM routing용(인터넷 노출 없음), 다른 하나는 MCP serving용(필요 시 인터넷 노출)입니다.

```
Internal AI clients             External AI clients
        │                       (ChatGPT, Claude Desktop)
        │                               │
        ▼                               ▼
┌────────────────────┐     ┌────────────────────────┐
│  LLM Gateway       │     │  MCP Gateway           │
│  (no public port)  │     │  (port 443 / public)   │
│  /v1/chat/...      │     │  /mcp                  │
└────────┬───────────┘     └──────────┬─────────────┘
         │                            │
    LLM providers              MCP servers
    (OpenAI, Bedrock, …)       (internal + public)
```

LLM API key는 firewall 뒤에 남습니다. MCP Gateway가 침해되더라도 LLM credential은 노출되지 않습니다. 외부 MCP 접근은 필요하지만 LLM credential은 완전히 private로 유지해야 할 때 이 방식을 사용하세요.

---

## 중앙 catalog

LiteLLM은 모든 resource type을 표준 endpoint로 노출합니다.

| 엔드포인트 | 반환 |
|----------|---------|
| `GET /v1/models` | 등록된 모든 LLM |
| `GET /v1/mcp/server` | 모든 MCP server |
| `GET /mcp` | 모든 MCP tool(전체 server 기준) |
| `GET /.well-known/agent.json` | A2A agent card |

**MCP registry**(opt-in) — Claude Desktop / Cursor용 discovery endpoint를 노출합니다.

```yaml title="config.yaml"
general_settings:
  enable_mcp_registry: true
```

```json title="Claude Desktop config"
{
  "mcpServers": {
    "litellm": {
      "url": "https://your-litellm.example.com/mcp",
      "headers": { "Authorization": "Bearer sk-..." }
    }
  }
}
```

---

## 보안 고려사항

### open-port 문제

Claude Desktop / ChatGPT용으로 LiteLLM port를 인터넷에 노출하면 `/v1/chat/completions`도 외부에서 접근 가능해집니다. LLM credential은 key auth로 보호되지만, 이 노출 범위는 의도적으로 관리해야 합니다.

**완화 방법:**
1. **배포 분리**(옵션 B) — LLM Gateway에는 public port를 부여하지 않습니다.
2. **Firewall** — network layer에서 public IP의 `/v1/chat/completions` 접근을 차단합니다.
3. **짧은 수명의 scoped key** — key가 유출되더라도 blast radius를 제한합니다.

### MCP server의 public internet 접근

외부 MCP URL(예: `https://mcp.exa.ai/mcp`)을 등록하면 LiteLLM은 tool call마다 해당 URL로 outbound request를 보냅니다. network policy가 이를 허용하는지, perimeter 밖으로 데이터가 나가는 것에 보안팀이 동의하는지 확인하세요.

air-gapped network에서는 perimeter 내부의 MCP server만 등록하고 `available_on_public_internet: false`(기본값)를 유지하세요.

### 접근 제어

기본적으로 인증된 모든 caller는 모든 MCP tool을 호출할 수 있습니다. 제한하려면 다음 기능을 사용하세요.

| 제어 | 위치 |
|---------|-------|
| key별 tool access | [Key-level MCP permissions](./mcp_control.md) |
| team별 tool access | [Team-level MCP permissions](./mcp_control.md) |
| 외부 caller에서 internal server 숨김 | [available_on_public_internet](./mcp_public_internet.md) |
| 요청이 LiteLLM을 통해 왔는지 검증 | [MCP Zero Trust (JWT)](./mcp_zero_trust.md) |
| 응답의 민감 데이터 차단 | [MCP 가드레일](./mcp_guardrail.md) |

---

## 관련 문서

- [MCP 개요](./mcp.md)
- [Public Internet 필터](./mcp_public_internet.md)
- [MCP Access Control](./mcp_control.md)
- [MCP Zero Trust](./mcp_zero_trust.md)
- [MCP 가드레일](./mcp_guardrail.md)
