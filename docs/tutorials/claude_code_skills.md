# LiteLLM Skills

[litellm-skills](https://github.com/BerriAI/litellm-skills)는 실행 중인 LiteLLM proxy를 관리하기 위한 [Agent Skills](https://agentskills.io) 모음입니다. 한 번 설치하면 Agent Skills 표준을 지원하는 모든 에이전트(Claude Code, OpenCode, OpenClaw 등)가 사용자, 팀, 키, 모델, MCP 서버, 에이전트를 생성하고 사용량을 조회할 수 있습니다. 모두 proxy에 대해 `curl` 명령을 실행하는 방식으로 동작합니다.

## 설치

```bash
curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm-skills/main/install.sh | sh
```

## 요구 사항

- 설치된 `curl`
- 실행 중인 LiteLLM proxy(로컬 또는 원격)
- proxy 관리자 키. `llm_api_routes`로 범위가 제한된 가상 키가 아니어야 합니다.

## 사용 가능한 Skills

### 사용자

| Skill | 수행 작업 |
|-------|-------------|
| `/add-user` | 사용자 생성: 이메일, 역할, 예산, 모델 접근 권한 |
| `/update-user` | 기존 사용자의 예산, 역할 또는 모델 업데이트 |
| `/delete-user` | 사용자 한 명 이상 삭제 |

### 팀

| Skill | 수행 작업 |
|-------|-------------|
| `/add-team` | 예산과 모델 제한이 있는 팀 생성 |
| `/update-team` | 예산, 모델 또는 rate limit 업데이트 |
| `/delete-team` | 팀 한 개 이상 삭제 |

### API 키

| Skill | 수행 작업 |
|-------|-------------|
| `/add-key` | 사용자, 팀, 예산, 만료 범위가 지정된 키 생성 |
| `/update-key` | 예산, 모델 또는 만료일 업데이트 |
| `/delete-key` | 키 값 또는 별칭으로 삭제 |

### 조직

| Skill | 수행 작업 |
|-------|-------------|
| `/add-org` | 예산과 모델 접근 권한이 있는 조직 생성 |
| `/delete-org` | 조직 한 개 이상 삭제 |

### 모델

| Skill | 수행 작업 |
|-------|-------------|
| `/add-model` | 원하는 provider(OpenAI, Azure, Anthropic, Bedrock, Ollama 등)를 추가하고 테스트 |
| `/update-model` | 인증 정보를 교체하거나 기반 배포 변경 |
| `/delete-model` | 모델 제거 |

### MCP 서버

| Skill | 수행 작업 |
|-------|-------------|
| `/add-mcp` | MCP 서버 등록(SSE, HTTP 또는 stdio) |
| `/update-mcp` | URL, 인증 정보 또는 허용된 tools 업데이트 |
| `/delete-mcp` | MCP 서버 제거 |

### 에이전트

| Skill | 수행 작업 |
|-------|-------------|
| `/add-agent` | 모델과 선택적 MCP 서버를 기반으로 에이전트 생성 |
| `/update-agent` | 모델을 교체하거나 설명과 제한 업데이트 |
| `/delete-agent` | 에이전트 제거 |

### 사용법

| Skill | 수행 작업 |
|-------|-------------|
| `/view-usage` | 사용자, 팀, 조직 또는 모델별 일일 지출 및 토큰 활동 |

## 동작 방식

Skill을 호출하면 에이전트가 `LITELLM_BASE_URL`과 관리자 키를 묻고, 해당 작업에 필요한 필드를 수집한 뒤 `curl`을 실행하고 결과를 보여줍니다. 예:

```
/add-model
```
→ 에이전트가 provider, 공개 이름, 인증 정보를 묻습니다. 모델을 추가하고 테스트 completion을 실행한 뒤 성공/실패를 보고합니다.

```
/view-usage
```
→ 에이전트가 날짜 범위(기본값은 이번 달)와 선택적 팀/모델 필터를 묻습니다. 일일 요청 수, 토큰, 지출 표를 출력합니다.

## 관련 항목

- [GitHub의 litellm-skills](https://github.com/BerriAI/litellm-skills)
- [가상 키](../proxy/virtual_keys.md) — proxy에서 API 키 관리
- [팀 기반 라우팅](../proxy/team_based_routing.md) — 팀 설정
- [모델 관리](../proxy/model_management.md) — config 또는 API로 모델 추가
