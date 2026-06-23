#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELEASE_NOTES = ROOT / "release_notes"


PHRASES = {
    "## Deploy this version": "## 이 버전 배포",
    "## Key Highlights": "## 주요 변경 사항",
    "### What's Changed": "### 변경 사항",
    "## New Providers and Endpoints": "## 새 프로바이더 및 엔드포인트",
    "### New Providers": "### 새 프로바이더",
    "### New LLM API Endpoints": "### 새 LLM API 엔드포인트",
    "#### New Model Support": "#### 새 모델 지원",
    "#### Features": "#### 기능",
    "#### Bug Fixes": "#### 버그 수정",
    "#### Bugs": "#### 버그",
    "## LLM API Endpoints": "## LLM API 엔드포인트",
    "## Management Endpoints / UI": "## 관리 엔드포인트 / UI",
    "## AI Integrations": "## AI 통합",
    "### Logging": "### 로깅",
    "### Guardrails": "### 가드레일",
    "### Secret Managers": "### Secret Managers",
    "## Cost Tracking, Budgets and Rate Limiting": "## 비용 추적, 예산 및 속도 제한",
    "## Performance / Loadbalancing / Reliability improvements": "## 성능 / 부하 분산 / 안정성 개선",
    "## Documentation Updates": "## 문서 업데이트",
    "## New Contributors": "## 새 기여자",
    "## Full Changelog": "## 전체 변경 이력",
    "## General Proxy Improvements": "## 일반 Proxy 개선",
    "### PR roll-up by ownership area": "### 담당 영역별 PR 요약",
    "## Release candidate changelog": "## 릴리즈 후보 변경 이력",
    "Provider | Supported LiteLLM Endpoints | Description": "Provider | 지원 LiteLLM 엔드포인트 | 설명",
    "Capability | Description | Documentation": "기능 | 설명 | 문서",
    "Context Window": "컨텍스트 윈도우",
    "Features": "기능",
    "Description": "설명",
    "Documentation": "문서",
    "New Model Support": "새 모델 지원",
    "New Providers": "새 프로바이더",
    "Updated Models": "업데이트된 모델",
    "New Models": "새 모델",
    "New search and transcription providers": "새 검색 및 음성 전사 프로바이더",
    "Key Highlights": "주요 변경 사항",
    "Deploy this version": "이 버전 배포",
    "Full diff": "전체 diff",
    "Get Started": "시작하기",
    "MCP Credential Store": "MCP 자격 증명 저장소",
    "Deploy": "배포",
    "Bug Fixes": "버그 수정",
    "Bugs": "버그",
    "General": "일반",
    "Dashboard": "대시보드",
    "Deployment": "배포",
    "Pass-through": "Pass-through",
    "Realtime": "Realtime",
    "Video": "Video",
    "Batches": "Batches",
    "Vector Stores": "Vector Stores",
    "Agents": "Agents",
    "Proxy": "Proxy",
    "Teams": "Teams",
    "Orgs": "Orgs",
    "Auth": "Auth",
    "Access control": "접근 제어",
    "Access control / keys": "접근 제어 / 키",
    "Virtual Keys": "가상 키",
    "Performance": "성능",
    "Loadbalancing": "부하 분산",
    "Reliability": "안정성",
    "Documentation Updates": "문서 업데이트",
    "New Contributors": "새 기여자",
}


SENTENCES = {
    "is a patch release on top of": "는 다음 버전을 기반으로 한 패치 릴리스입니다:",
    "is the stable release, graduated from the": "는 stable 릴리스이며 다음 릴리즈 후보에서 승격되었습니다:",
    "is the current release candidate for": "는 다음 버전의 현재 릴리즈 후보입니다:",
    "builds on": "를 기반으로 합니다:",
    "It backports": "이 릴리스는 다음 수정 사항을 백포트합니다:",
    "It adds": "이 릴리스는 다음 항목을 추가합니다:",
    "It brings": "이 릴리스는 다음 항목을 반영합니다:",
    "It fixes": "이 릴리스는 다음 문제를 수정합니다:",
    "It bumps": "이 릴리스는 다음 의존성을 업데이트합니다:",
    "It closes the gap with": "이 릴리스는 다음 라인과의 차이를 줄입니다:",
    "It cherry-picks fixes for": "이 릴리스는 다음 수정 사항을 선별 반영합니다:",
    "It hardens": "이 릴리스는 다음 영역을 강화합니다:",
    "covering": "포함:",
    "together with": "및",
    "along with": "및",
    "plus": "추가로",
    "and": "및",
    "so": "따라서",
    "rather than": "대신",
    "when": "때",
    "using": "사용해",
    "through": "통해",
    "before": "전에",
    "after": "후",
    "on top of": "기반",
    "release candidate": "릴리즈 후보",
    "patch release": "패치 릴리스",
    "stable release": "stable 릴리스",
    "new integration": "새 통합",
    "new provider": "새 프로바이더",
    "new providers": "새 프로바이더",
    "new models": "새 모델",
    "new endpoint": "새 엔드포인트",
    "new endpoints": "새 엔드포인트",
    "web search provider": "웹 검색 프로바이더",
    "OpenAI-compatible provider": "OpenAI 호환 프로바이더",
    "Audio Transcription": "음성 전사",
    "Chat Completions": "Chat Completions",
    "Code execution": "코드 실행",
    "New sandbox / code-interpreter primitive for running model-generated code": "모델이 생성한 코드를 실행하기 위한 새 sandbox / code-interpreter primitive",
    "Full diff": "전체 diff",
}


DESCRIPTION_REPLACEMENTS = {
    "six staged fixes covering Azure AD token refresh, batch and video model routing, org-scoped team key creation, Vertex Claude effort handling, and duplicate passthrough cost callbacks.": "Azure AD 토큰 갱신, batch 및 video model routing, org-scoped team key creation, Vertex Claude effort 처리, 중복 passthrough cost callback을 포함한 6개의 단계적 수정 사항.",
    "Six new providers": "새 프로바이더 6개",
    "91 new models": "새 모델 91개",
    "OpenTelemetry v2 reaches metrics parity with v1": "OpenTelemetry v2가 v1과 동일한 metrics 수준에 도달",
    "A broad streaming-reliability sweep": "streaming 안정성을 전반적으로 개선",
    "Two new guardrails": "새 guardrail 2개",
    "Claude Fable 5": "Claude Fable 5",
    "is supported across Anthropic, Bedrock, Azure AI, and Vertex at 1M-token context with adaptive thinking and computer use.": "Anthropic, Bedrock, Azure AI, Vertex 전반에서 1M-token context, adaptive thinking, computer use와 함께 지원됩니다.",
    "Agent-to-agent (A2A)": "Agent-to-agent (A2A)",
    "gains two new agent providers - watsonx Orchestrate and LangFlow (with A2A session bridging) - plus OAuth M2M for Databricks Apps agents.": "watsonx Orchestrate 및 LangFlow(A2A session bridging 포함)라는 새 agent provider 2개와 Databricks Apps agent용 OAuth M2M을 추가했습니다.",
    "MCP gateway": "MCP gateway",
    "adds per-server environment variables with global and per-user scopes, per-server RPM rate limiting for keys and teams, OAuth passthrough with issuer-scoped JWT auth, and `oauth2_flow` persistence on server registration.": "global/per-user scope의 server별 환경 변수, key/team용 server별 RPM rate limit, issuer-scoped JWT auth를 쓰는 OAuth passthrough, server 등록 시 `oauth2_flow` 저장을 추가했습니다.",
    "Observability": "관측성",
    "lands OpenInference rendering parity for Arize/Phoenix (tool calls, cost, passthrough I/O, sessions, multimodal, cache tokens), MCP semantic conventions on the typed OTel v2 spans, and a Galileo logger that uses the ingest-traces API.": "Arize/Phoenix의 OpenInference rendering parity(tool call, cost, passthrough I/O, session, multimodal, cache token), typed OTel v2 span의 MCP semantic convention, ingest-traces API를 쓰는 Galileo logger를 반영했습니다.",
    "New search and transcription providers": "새 검색 및 음성 전사 프로바이더",
    "join the gateway, alongside the dashboard's migration to fully typed, OpenAPI-generated API clients.": "gateway에 합류했고, dashboard는 fully typed OpenAPI-generated API client로 migration되었습니다.",
    "This release lets you securely store per-server credentials for MCP servers directly on the gateway. Define variables once on a server, scoped either as **Instance** (shared across all users) or **Per-user** (each user supplies their own value), and reference them in static headers or authentication using `${VAR_NAME}` syntax (for example, `${DB_PROTOCOL}://${CORP_USERNAME}:${CORP_PASSWORD}@${DB_HOSTNAME}`), letting each user connect their own identity.": "이 릴리스에서는 MCP server별 자격 증명을 gateway에 직접 안전하게 저장할 수 있습니다. server에서 변수를 한 번 정의하고 **Instance**(모든 사용자 공유) 또는 **Per-user**(각 사용자가 자체 값을 제공) scope로 지정한 뒤, static header나 인증 설정에서 `${VAR_NAME}` 문법(예: `${DB_PROTOCOL}://${CORP_USERNAME}:${CORP_PASSWORD}@${DB_HOSTNAME}`)으로 참조할 수 있어 각 사용자가 자신의 identity로 연결할 수 있습니다.",
    "Claude Opus 4.8": "Claude Opus 4.8",
    "is supported across Anthropic, Bedrock (including `global` / `us` / `eu` / `au` regional routes), Azure AI, and Vertex, at 1M-token context with adaptive thinking and `output_config` goal mode.": "Anthropic, Bedrock(`global` / `us` / `eu` / `au` regional route 포함), Azure AI, Vertex 전반에서 1M-token context, adaptive thinking, `output_config` goal mode와 함께 지원됩니다.",
    "MCP access-group authorization": "MCP access-group authorization",
    "was reworked end to end: key and team access groups now resolve to MCP servers, grants are additive with opt-in member assignment, and clients can route through stateful or stateless sessions by session id.": "end-to-end로 재작업되었습니다. key 및 team access group이 이제 MCP server로 해석되고, grant는 opt-in member assignment와 함께 additive 방식으로 동작하며, client는 session id 기준으로 stateful/stateless session에 라우팅할 수 있습니다.",
    "Typed OpenTelemetry instrumentation": "Typed OpenTelemetry instrumentation",
    "lands a semconv-aligned span model that carries `team_metadata`, `http.route`, and model names on inference spans.": "inference span에 `team_metadata`, `http.route`, model name을 담는 semconv-aligned span model을 반영했습니다.",
    "Streaming is ~30% cheaper per chunk": "Streaming은 chunk당 약 30% 더 저렴해졌습니다",
    "on the Anthropic and Bedrock hot path.": "Anthropic 및 Bedrock hot path 기준입니다.",
    "gains well-known agent-card discovery and a LangGraph Platform mode.": "well-known agent-card discovery와 LangGraph Platform mode를 추가했습니다.",
    "preserve AD token refresh in the v1 OpenAI client path": "v1 OpenAI 클라이언트 경로에서 AD 토큰 갱신을 보존",
    "map a stripped batch `body.model` back to the proxy alias so key access checks pass": "제거된 batch `body.model`을 proxy alias로 다시 매핑해 키 접근 검사가 통과되도록 수정",
    "resolve managed video model ids through the router before auth, budget, and key checks": "인증, 예산, 키 검사 전에 관리형 비디오 모델 ID를 router를 통해 해석",
    "let team members create keys on org-scoped teams (regression since v1.84.0-rc.1)": "팀 멤버가 org-scoped team에서 키를 만들 수 있게 수정(v1.84.0-rc.1 이후 회귀)",
    "strip `output_config.effort` for Vertex Claude models that reject it, such as Haiku 4.5": "Haiku 4.5처럼 이를 거부하는 Vertex Claude 모델에서 `output_config.effort` 제거",
    "stop duplicate cost callbacks for Anthropic streaming pass-through": "Anthropic streaming pass-through에서 비용 callback이 중복 실행되지 않도록 수정",
    "capture CrowdStrike AIDR user and model metadata": "CrowdStrike AIDR 사용자 및 모델 메타데이터 수집",
    "read CrowdStrike AIDR identity from both metadata bags": "두 metadata bag 모두에서 CrowdStrike AIDR identity를 읽도록 수정",
    "add Claude Fable 5 across Anthropic, Bedrock, Vertex AI, and Azure AI": "Anthropic, Bedrock, Vertex AI, Azure AI 전반에 Claude Fable 5 추가",
    "authorize batch files using upload `target_model_names` (LIT-3593)": "업로드된 `target_model_names`를 사용해 batch file을 인가",
    "correct streaming reasoning token usage": "streaming reasoning token 사용량 계산 수정",
    "grace-period key rotation deprecated-key lookup": "grace-period key rotation의 deprecated-key 조회 수정",
    "use forwarded model_id for native Azure container IDs": "native Azure container ID에 전달된 model_id 사용",
    "recover from cached-plan errors by reconnecting the Prisma client": "Prisma client를 재연결해 cached-plan 오류에서 복구",
    "expose Prisma idle/connect timeout and extra DB URL params": "Prisma idle/connect timeout 및 추가 DB URL 파라미터 노출",
    "add option to disable server-side prepared statements for DB lookups": "DB 조회에서 서버 측 prepared statement를 비활성화하는 옵션 추가",
    "return 5xx on DB infra errors during auth": "인증 중 DB 인프라 오류가 발생하면 5xx 반환",
    "return 5xx on DB infra errors during auth; reserve 401 for genuine auth failures": "인증 중 DB 인프라 오류는 5xx로 반환하고, 실제 인증 실패에만 401 사용",
    "resolve costing model when body model is unknown": "body model을 알 수 없을 때 비용 계산 모델 해석",
    "return deprecated-key lookup result directly in get_data combined view": "get_data combined view에서 deprecated-key 조회 결과를 직접 반환",
    "cap Anthropic cache_control injection at 4 blocks": "Anthropic cache_control 삽입을 4개 블록으로 제한",
    "stop duplicate Claude Code traces (internal copy of #29089)": "Claude Code trace 중복 생성 중지(#29089 내부 반영)",
    "stop duplicate Claude Code traces, plus the `_build_passthrough_logging_result` helper": "Claude Code trace 중복 생성 및 `_build_passthrough_logging_result` helper 수정",
    "normalize the Bearer prefix in the safe-hash helper": "safe-hash helper에서 Bearer prefix 정규화",
    "reset_budget writes only `{spend, budget_reset_at}` and no longer pre-zeroes the counter": "reset_budget이 `{spend, budget_reset_at}`만 기록하고 counter를 미리 0으로 만들지 않도록 수정",
    "reset_budget writes only `{spend, budget_reset_at}`": "reset_budget이 `{spend, budget_reset_at}`만 기록하도록 수정",
    "stop the v3 limiter from leaking internal stash to the provider body": "v3 limiter의 internal stash가 provider body로 유출되지 않도록 수정",
    "stop the `use_chat_completions_api` flag from leaking into the provider request body": "`use_chat_completions_api` flag가 provider request body로 유출되지 않도록 수정",
    "day-0 support for Gemini 3.5 Flash on Vertex AI and Google AI Studio": "Vertex AI 및 Google AI Studio에서 Gemini 3.5 Flash day-0 지원",
    "omit the function_call `id` on Gemini 3.5+ tool turns (pairs with #28268)": "Gemini 3.5+ tool turn에서 function_call `id` 생략(#28268과 쌍)",
    "seed the Redis spend counter with `SET NX` so concurrent pods no longer double-seed": "`SET NX`로 Redis spend counter를 seed해 동시 pod가 중복 seed하지 않도록 수정",
    "add `disable_budget_reservation` general setting": "`disable_budget_reservation` general setting 추가",
    "skip `[DONE]` sentinels and non-JSON SSE frames in Anthropic streaming logging": "Anthropic streaming logging에서 `[DONE]` sentinel과 non-JSON SSE frame 건너뛰기",
    "bump vitest, brace-expansion, pypdf and tornado": "vitest, brace-expansion, pypdf, tornado 업데이트",
    "bump pypdf, tornado, the aiohttp constraint, vitest, and brace-expansion": "pypdf, tornado, aiohttp constraint, vitest, brace-expansion 업데이트",
    "bump PyJWT to 2.13.0 and the `ws` override to 8.20.1": "PyJWT를 2.13.0으로, `ws` override를 8.20.1로 업데이트",
    "stop team BYOK model name corruption on model edit": "모델 편집 시 team BYOK 모델명이 손상되지 않도록 수정",
    "align `/v1/model/info` with router deployments": "`/v1/model/info`를 router deployment와 정렬",
    "populate `access_via_team_ids` on `/v1/model/info`": "`/v1/model/info`에 `access_via_team_ids` 채우기",
    "stop re-initializing DB guardrails on every poll": "매 poll마다 DB guardrail을 다시 초기화하지 않도록 수정",
    "run the `pre_call` hook once for model-level guardrails": "model-level guardrail에서 `pre_call` hook을 한 번만 실행",
    "stop a non-string `service_tier` from silently dropping cost tracking": "문자열이 아닌 `service_tier` 때문에 비용 추적이 조용히 누락되지 않도록 수정",
    "price and surface the response `service_tier` in cost tracking": "cost tracking에서 응답 `service_tier` 가격을 계산하고 표시",
    "list the public team model name in `/v1/models`": "`/v1/models`에서 public team model name 표시",
    "add an opt-in `healthy_only` filter to `GET /v1/models`": "`GET /v1/models`에 opt-in `healthy_only` 필터 추가",
    "resolve list-files credentials from team BYOK deployments": "team BYOK deployment에서 list-files 자격 증명 해석",
    "allow internal roles to access vector store CRUD routes": "internal role이 vector store CRUD route에 접근할 수 있도록 허용",
    "record the full error message on the standard exception event in OTEL v2": "OTEL v2 standard exception event에 전체 오류 메시지 기록",
}


SIMPLE_VERB_REPLACEMENTS = (
    (re.compile(r"^Add (.+)$"), r"\1 추가"),
    (re.compile(r"^Support (.+)$"), r"\1 지원"),
    (re.compile(r"^Supports (.+)$"), r"\1 지원"),
    (re.compile(r"^Preserve (.+)$"), r"\1 보존"),
    (re.compile(r"^Resolve (.+)$"), r"\1 해석"),
    (re.compile(r"^Stop (.+)$"), r"\1 중지"),
    (re.compile(r"^Allow (.+)$"), r"\1 허용"),
    (re.compile(r"^Use (.+)$"), r"\1 사용"),
    (re.compile(r"^Route (.+)$"), r"\1 라우팅"),
    (re.compile(r"^Strip (.+)$"), r"\1 제거"),
    (re.compile(r"^Remove (.+)$"), r"\1 제거"),
    (re.compile(r"^Include (.+)$"), r"\1 포함"),
    (re.compile(r"^Expose (.+)$"), r"\1 노출"),
    (re.compile(r"^Enforce (.+)$"), r"\1 강제"),
    (re.compile(r"^Emit (.+)$"), r"\1 emit"),
    (re.compile(r"^Export (.+)$"), r"\1 export"),
    (re.compile(r"^Map (.+)$"), r"\1 매핑"),
    (re.compile(r"^Return (.+)$"), r"\1 반환"),
    (re.compile(r"^Fix (.+)$"), r"\1 수정"),
    (re.compile(r"^Correct (.+)$"), r"\1 수정"),
    (re.compile(r"^Bump (.+)$"), r"\1 업데이트"),
    (re.compile(r"^Sync (.+)$"), r"\1 동기화"),
    (re.compile(r"^Warn (.+)$"), r"\1 경고"),
    (re.compile(r"^Require (.+)$"), r"\1 요구"),
    (re.compile(r"^Validate (.+)$"), r"\1 검증"),
    (re.compile(r"^Generate (.+)$"), r"\1 생성"),
    (re.compile(r"^Migrate (.+)$"), r"\1 마이그레이션"),
)


def replace_visible_phrase(text: str, src: str, dst: str) -> str:
    if not re.search(r"[A-Za-z0-9]", src):
        return text.replace(src, dst)

    pattern = re.compile(
        rf"(?<![A-Za-z0-9_`/-]){re.escape(src)}(?![A-Za-z0-9_`/-])"
    )
    return pattern.sub(dst, text)


def preserve_pr_suffix(text: str) -> tuple[str, str]:
    match = re.search(r"(\s+-\s+\[PR #[0-9]+\].*)$", text)
    if not match:
        return text, ""
    return text[: match.start()], match.group(1)


def translate_text(text: str) -> str:
    for src, dst in sorted(PHRASES.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(src, dst)
    for src, dst in sorted(DESCRIPTION_REPLACEMENTS.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(src, dst)
    for pattern, replacement in SIMPLE_VERB_REPLACEMENTS:
        text = pattern.sub(replacement, text)
    for src, dst in sorted(SENTENCES.items(), key=lambda item: len(item[0]), reverse=True):
        text = replace_visible_phrase(text, src, dst)
    text = text.replace(" - ", " - ")
    return text


def translate_line(line: str) -> str:
    stripped = line.strip()
    if not stripped:
        return line
    if stripped.startswith(("import ", "export ", "<", "</", "{", "}", "```")):
        return line
    if stripped.startswith("|"):
        return translate_text(line)

    if stripped.startswith("- "):
        body = line[line.index("- ") + 2 :]
        body, suffix = preserve_pr_suffix(body.rstrip("\n"))
        return line[: line.index("- ") + 2] + translate_text(body) + suffix + "\n"

    if stripped.startswith("#") or stripped.startswith("`v"):
        return translate_text(line)
    return translate_text(line)


def translate_file(path: Path) -> bool:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    out: list[str] = []
    in_frontmatter = False
    in_code = False
    for index, line in enumerate(lines):
        stripped = line.strip()
        if index == 0 and stripped == "---":
            in_frontmatter = True
            out.append(line)
            continue
        if in_frontmatter:
            out.append(line)
            if stripped == "---":
                in_frontmatter = False
            continue
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            out.append(line)
            continue
        if in_code:
            out.append(line)
            continue
        out.append(translate_line(line))

    new_text = "".join(out)
    old_text = "".join(lines)
    if new_text != old_text:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(RELEASE_NOTES.glob("v1.*/index.md")):
        if translate_file(path):
            changed.append(path.relative_to(ROOT))
    print(f"updated release note files: {len(changed)}")
    for path in changed:
        print(path)


if __name__ == "__main__":
    main()
