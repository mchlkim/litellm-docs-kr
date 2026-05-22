#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIRS = [ROOT / "docs", ROOT / "blog", ROOT / "release_notes"]
CONTENT_FILES = [ROOT / "index.md", ROOT / "README.md", ROOT / "sidebars.js", ROOT / "sidebars-release-notes.js"]

PHRASES = {
    "Getting Started": "시작하기",
    "Quickstart": "빠른 시작",
    "Quick Start": "빠른 시작",
    "Installation": "설치",
    "Response Format": "응답 형식",
    "New to LiteLLM?": "LiteLLM이 처음인가요?",
    "Choose Your Path": "사용 경로 선택",
    "LiteLLM Python SDK": "LiteLLM Python SDK",
    "Python SDK": "Python SDK",
    "Proxy Server (LLM Gateway)": "Proxy Server (LLM Gateway)",
    "LiteLLM Proxy Server (LLM Gateway)": "LiteLLM Proxy Server (LLM Gateway)",
    "LiteLLM AI Gateway (Proxy)": "LiteLLM AI Gateway (Proxy)",
    "LiteLLM AI Gateway (LLM Proxy)": "LiteLLM AI Gateway (LLM Proxy)",
    "Supported Endpoints": "지원 엔드포인트",
    "Supported Models & Providers": "지원 모델 및 프로바이더",
    "Routing & Load Balancing": "라우팅 및 부하 분산",
    "Benchmarks": "벤치마크",
    "Contributing": "기여하기",
    "Extras": "기타",
    "Troubleshooting": "문제 해결",
    "Learn": "학습",
    "Start Here": "여기서 시작",
    "Guides": "가이드",
    "Tutorials": "튜토리얼",
    "Core Requests": "핵심 요청",
    "Tool Calling": "도구 호출",
    "Multimodal I/O": "멀티모달 I/O",
    "Retrieval & Knowledge": "검색 및 지식",
    "Prompts & Context": "프롬프트 및 컨텍스트",
    "Compatibility & Extensibility": "호환성 및 확장성",
    "Reliability, Testing & Spend": "신뢰성, 테스트 및 비용",
    "Security & Network": "보안 및 네트워크",
    "Provider Setup": "프로바이더 설정",
    "Observability": "관측성",
    "Observability: Usage": "관측성: 사용량",
    "Guardrail Providers": "가드레일 프로바이더",
    "Contributing to Integrations": "통합 기여하기",
    "Contributing to Guardrails": "가드레일 기여하기",
    "Alerting & Monitoring": "알림 및 모니터링",
    "[Beta] Prompt Management": "[베타] 프롬프트 관리",
    "Contributing to Prompt Management": "프롬프트 관리 기여하기",
    "AI Tools": "AI 도구",
    "Agent SDKs": "에이전트 SDK",
    "Manage with AI Agents": "AI 에이전트로 관리",
    "Configuration": "설정",
    "Setup & Deployment": "설치 및 배포",
    "Admin UI": "관리자 UI",
    "Setup & SSO": "설정 및 SSO",
    "Models": "모델",
    "Teams & Organizations": "팀 및 조직",
    "Logs": "로그",
    "Architecture": "아키텍처",
    "Authentication": "인증",
    "Budgets + Rate Limits": "예산 및 속도 제한",
    "Guardrails": "가드레일",
    "Caching": "캐싱",
    "Virtual Keys": "가상 키",
    "Spend Tracking": "비용 추적",
    "Release Notes": "릴리즈 노트",
    "Changelog": "변경 이력",
    "Blog": "블로그",
    "All Posts": "전체 글",
    "Community": "커뮤니티",
    "Enterprise": "엔터프라이즈",
    "Docs": "문서",
    "More": "더 보기",
    "Getting Started Tutorial": "시작하기 튜토리얼",
    "All Endpoints (Swagger)": "전체 엔드포인트(Swagger)",
    "All Supported Endpoints": "전체 지원 엔드포인트",
    "Models & Pricing": "모델 및 가격",
    "Open in Colab": "Colab에서 열기",
    "Security Update": "보안 업데이트",
    "Debugging tool": "디버깅 도구",
    "What to Explore Next": "다음에 살펴볼 항목",
    "Start the proxy": "프록시 시작",
    "Call it with the OpenAI client": "OpenAI 클라이언트로 호출",
    "Usage": "사용법",
    "Notes": "참고",
    "Overview": "개요",
    "How it works": "동작 방식",
    "How to use": "사용 방법",
    "How to configure": "설정 방법",
    "Prerequisites": "사전 준비",
    "Supported Providers": "지원 프로바이더",
    "Supported Models": "지원 모델",
    "Supported Parameters": "지원 파라미터",
    "Example": "예제",
    "Examples": "예제",
    "Request Format": "요청 형식",
    "Configuration Reference": "설정 참조",
    "Advanced Usage": "고급 사용법",
    "Best Practices": "권장 사항",
    "Common Issues": "자주 발생하는 문제",
    "Related Documentation": "관련 문서",
    "Latest Release": "최신 릴리즈",
    "Latest Release Candidate": "최신 릴리즈 후보",
    "Recent Releases": "최근 릴리즈",
    "Stay Updated": "업데이트 확인",
    "Release candidate": "릴리즈 후보",
    "Backwards compatibility": "하위 호환성",
    "A few things worth knowing": "알아두면 좋은 점",
    "What's new": "변경 사항",
    "Side-by-side": "비교",
    "Agenda": "아젠다",
    "Register": "등록",
    "How to contribute": "의견 남기기",
    "Docker": "Docker",
    "LiteLLM CLI": "LiteLLM CLI",
}

SENTENCES = {
    "Make your first LLM call using the provider of your choice:": "원하는 프로바이더를 선택해 첫 LLM 호출을 실행합니다:",
    "Every response follows the OpenAI Chat Completions format, regardless of provider.": "어떤 프로바이더를 사용하든 모든 응답은 OpenAI Chat Completions 형식을 따릅니다.",
    "Non-streaming responses return a `ModelResponse` object:": "비스트리밍 응답은 `ModelResponse` 객체를 반환합니다:",
    "Streaming responses (`stream=True`) yield `ModelResponseStream` chunks:": "스트리밍 응답(`stream=True`)은 `ModelResponseStream` 청크를 반환합니다:",
    "Add `stream=True` to receive chunks as they are generated:": "생성되는 청크를 바로 받으려면 `stream=True`를 추가합니다:",
    "To run the full Proxy Server (LLM Gateway):": "전체 Proxy Server(LLM Gateway)를 실행하려면 다음을 사용합니다:",
    "Self-hosted gateway for platform teams managing LLM access across an organization.": "조직 전체의 LLM 접근을 관리하는 플랫폼 팀을 위한 자체 호스팅 게이트웨이입니다.",
    "Integrate LiteLLM directly into your Python application. Drop-in replacement for the OpenAI client.": "LiteLLM을 Python 애플리케이션에 직접 통합합니다. OpenAI 클라이언트를 거의 그대로 대체할 수 있습니다.",
    "For more ways to authenticate with Bedrock, see the Bedrock documentation": "Bedrock 인증 방식은 Bedrock 문서를 참고하세요.",
    "For natural language queries instead of regex patterns:": "regex pattern 대신 자연어 query를 사용하려면 다음을 참고하세요:",
    "You can now provide Claude with examples of how to use your tools.": "이제 Claude에 도구 사용 예제를 제공할 수 있습니다.",
    "Potential values for": "사용 가능한 값:",
    "Use the sidebar to browse the full release history.": "전체 릴리즈 기록은 사이드바에서 탐색할 수 있습니다.",
}


def replace_visible_text(line: str) -> str:
    for src, dst in sorted({**PHRASES, **SENTENCES}.items(), key=lambda item: len(item[0]), reverse=True):
        line = line.replace(src, dst)
    return line


def localize_markdown(text: str) -> str:
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    in_code = False
    in_frontmatter = False
    for index, line in enumerate(lines):
        stripped = line.strip()
        if index == 0 and stripped == "---":
            in_frontmatter = True
            out.append(line)
            continue
        if in_frontmatter and stripped == "---":
            in_frontmatter = False
            out.append(line)
            continue
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            out.append(line)
            continue
        if in_code:
            out.append(line)
            continue
        if line.lstrip().startswith(("import ", "export ", "const ", "let ", "var ")):
            out.append(line)
            continue
        if re.match(r"\s*</?[A-Z][A-Za-z0-9]*", line):
            out.append(line)
            continue
        if line.lstrip().startswith(("<", "</", "{", "}")):
            out.append(replace_visible_text(line))
            continue
        out.append(replace_visible_text(line))
    return "".join(out)


def localize_js(text: str) -> str:
    return replace_visible_text(text)


def iter_content_files() -> list[Path]:
    files: list[Path] = []
    for directory in CONTENT_DIRS:
        files.extend(path for path in directory.rglob("*") if path.suffix in {".md", ".mdx"})
    files.extend(path for path in CONTENT_FILES if path.exists())
    return sorted(set(files))


def contains_korean(text: str) -> bool:
    return bool(re.search(r"[\uac00-\ud7a3]", text))


def main() -> None:
    changed = []
    all_files = iter_content_files()
    for path in all_files:
        text = path.read_text(encoding="utf-8")
        if path.suffix in {".md", ".mdx"}:
            new_text = localize_markdown(text)
        else:
            new_text = localize_js(text)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            changed.append(path)

    manifest_lines = [
        "# LiteLLM Korean Localization Manifest",
        "",
        f"- Source: https://github.com/BerriAI/litellm-docs",
        f"- Localized content files scanned: {len(all_files)}",
        f"- Files updated by localization pass: {len(changed)}",
        "- Binary/static assets: preserved from upstream.",
        "- Code blocks, API names, environment variables, paths, model IDs, and MDX component tags are intentionally preserved.",
        "- External SaaS widgets are disabled in `docusaurus.config.js`: Inkeep, Crisp, Google Analytics, and FeedbackRocket.",
        "- Hand-written Korean guide section added under `docs/korean/`: overview, SDK, Proxy, providers, routing/observability/security, operations/troubleshooting, and release-note guidance.",
        "- Current audit status: `scripts/audit_korean_docs.py` still reports a large number of English phrase candidates across the full upstream corpus. This manifest tracks the localization pass and hand-written Korean guide; it is not evidence that every upstream page body has been fully translated.",
        "",
        "## Updated Files",
        "",
    ]
    manifest_lines.extend(f"- `{path.relative_to(ROOT)}`" for path in changed[:300])
    if len(changed) > 300:
        manifest_lines.append(f"- ... {len(changed) - 300} more files")
    manifest_lines.extend([
        "",
        "## Audit Notes",
        "",
        "- This pass localizes the site chrome, navigation labels, common documentation headings, repeated guide phrases, and key getting-started copy.",
        "- Provider names, product names, endpoint names, commands, code examples, and URLs remain in their original spelling.",
        "- Use `scripts/audit_korean_docs.py` to find remaining high-signal English UI phrases after future translation passes.",
        "",
    ])
    (ROOT / "TRANSLATION_MANIFEST.md").write_text("\n".join(manifest_lines), encoding="utf-8")


if __name__ == "__main__":
    main()
