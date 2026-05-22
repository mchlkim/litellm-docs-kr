#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "docs",
    ROOT / "blog",
    ROOT / "release_notes",
    ROOT / "src" / "pages",
    ROOT / "src" / "theme",
    ROOT / "src" / "components",
    ROOT / "index.md",
    ROOT / "sidebars.js",
    ROOT / "sidebars-release-notes.js",
    ROOT / "docusaurus.config.js",
]
ALLOW = {
    "LiteLLM",
    "OpenAI",
    "Anthropic",
    "Bedrock",
    "Vertex",
    "Azure",
    "Google",
    "Gemini",
    "Claude",
    "MCP",
    "A2A",
    "AI",
    "LLM",
    "Agent",
    "Model",
    "Context",
    "Protocol",
    "Nscale",
    "EU",
    "Sovereign",
    "SDK",
    "API",
    "Proxy",
    "Gateway",
    "Router",
    "Docker",
    "Swagger",
    "Langfuse",
    "Helicone",
    "MLflow",
    "GitHub",
    "Discord",
    "Hugging",
    "Face",
    "Inference",
    "Server",
}

TECH_TOKENS = {
    "id",
    "url",
    "uri",
    "api",
    "sdk",
    "cli",
    "llm",
    "mcp",
    "a2a",
    "jwt",
    "sso",
    "rbac",
    "scim",
    "oidc",
    "yaml",
    "json",
    "mdx",
    "md",
    "js",
    "ts",
    "tsx",
    "py",
    "docker",
    "helm",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "openai",
    "anthropic",
    "bedrock",
    "vertex",
    "gemini",
    "claude",
}

ENGLISH_PROSE_MARKERS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "before",
    "by",
    "can",
    "default",
    "disable",
    "enable",
    "for",
    "from",
    "has",
    "have",
    "if",
    "in",
    "is",
    "of",
    "on",
    "or",
    "set",
    "sets",
    "that",
    "the",
    "this",
    "to",
    "use",
    "used",
    "uses",
    "when",
    "where",
    "which",
    "will",
    "with",
}


def iter_files() -> list[Path]:
    files: list[Path] = []
    for target in TARGETS:
        if target.is_dir():
            files.extend(path for path in target.rglob("*") if path.suffix in {".md", ".mdx", ".js", ".jsx", ".ts", ".tsx"})
        elif target.exists():
            files.append(target)
    return sorted(set(files))


def strip_code_blocks(text: str) -> str:
    return re.sub(r"```.*?```", "", text, flags=re.S)


def strip_inline_code(text: str) -> str:
    return re.sub(r"`[^`\n]+`", "", text)


def strip_frontmatter(path: Path, text: str) -> str:
    if path.suffix not in {".md", ".mdx"} or not text.startswith("---\n"):
        return text
    end = text.find("\n---\n", 4)
    if end == -1:
        return text
    return text[end + 5 :]


def is_low_signal_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped.startswith((
        "import ",
        "export ",
        "const ",
        "let ",
        "var ",
        "*",
        "//",
        "{/*",
        "<",
        "</",
        "|---",
        "| ---",
        "-H ",
        "img={require(",
        "style={{",
    )):
        return True
    if re.fullmatch(r"[A-Za-z][A-Za-z0-9]*:\s*['\"0-9#.{].*[,}]?", stripped):
        return True
    if re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]+=(\"[^\"]*\"|'[^']*')(\s+[A-Za-z][A-Za-z0-9_-]+=(\"[^\"]*\"|'[^']*'))*\s*>?", stripped):
        return True
    if re.search(r"require\(['\"].+\.(png|jpg|jpeg|gif|webp|svg)['\"]\)", stripped):
        return True
    if re.fullmatch(r"!\[[^\]]*\]\([^)]+\.(png|jpg|jpeg|gif|webp|svg)\)", stripped, flags=re.I):
        return True
    if re.search(r"\bsha256:\s*['\"][0-9a-f]{32,}['\"]", stripped):
        return True
    if re.fullmatch(r"[0-9a-f]{32,}", stripped):
        return True
    if re.fullmatch(r"[\s|`*_>#\-\[\]().,:/A-Za-z0-9]+", stripped):
        words = [word.lower() for word in re.findall(r"[A-Za-z]+", stripped)]
        if words and all(word in TECH_TOKENS or len(word) <= 2 for word in words):
            return True
    if re.search(r"https?://|www\.|github\.com|docs\.litellm\.ai|/docs/|^\s*[-*]\s*`", line):
        return True
    return False


def is_technical_phrase_in_korean_line(line: str, phrase: str) -> bool:
    if not re.search(r"[가-힣]", line):
        return False
    words = [word.lower() for word in re.findall(r"[A-Za-z]+", phrase)]
    if not words:
        return True
    return not any(word in ENGLISH_PROSE_MARKERS for word in words)


def iter_scannable_lines(path: Path, text: str) -> list[tuple[int, str]]:
    if path.suffix not in {".js", ".jsx", ".ts", ".tsx"}:
        return list(enumerate(text.splitlines(), 1))

    lines: list[tuple[int, str]] = []
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if "blog/redis_circuit_breaker" in path.as_posix():
            if "style=" in line or "style:" in line or "style{" in line or "fontSize" in line:
                continue
            for match in re.finditer(r"['\"]([^'\"]{18,})['\"]", line):
                lines.append((line_no, match.group(1)))
            continue

        if stripped.startswith((
            "import ",
            "export ",
            "const STYLES",
            ".",
            "@",
            "}",
            "{",
            "/*",
            "*",
        )):
            continue

        for match in re.finditer(r"\b(label|title|text|content|placeholder|description|subtitle|alt|aria-label)\s*:\s*(['\"])(.*?)\2", line):
            lines.append((line_no, match.group(3)))
        for match in re.finditer(r"\b(title|placeholder|aria-label|alt)=(['\"])(.*?)\2", line):
            lines.append((line_no, match.group(3)))
        for match in re.finditer(r">\s*([^<>{}\n][^<>{}\n]{2,}?)\s*<", line):
            lines.append((line_no, match.group(1)))
        for match in re.finditer(r"\breturn\s+(['\"])([^'\"]{3,})\1", line):
            lines.append((line_no, match.group(2)))
        for match in re.finditer(r"\b(setAudioStatus)\((['\"])(.*?)\2\)", line):
            lines.append((line_no, match.group(3)))
        for match in re.finditer(r"\blog\(\s*['\"][^'\"]+['\"]\s*,\s*['\"][^'\"]+['\"]\s*,\s*(['\"])(.*?)\1", line):
            lines.append((line_no, match.group(2)))
    return lines


def main() -> None:
    findings: list[str] = []
    phrase_re = re.compile(r"[A-Za-z][A-Za-z0-9'’()&/.,:+ -]{18,}")
    for path in iter_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        text = strip_frontmatter(path, text)
        text = strip_code_blocks(text)
        text = strip_inline_code(text)
        for line_no, line in iter_scannable_lines(path, text):
            if is_low_signal_line(line):
                continue
            line = re.sub(r"\s*\{#[A-Za-z0-9_-]+\}", "", line)
            for match in phrase_re.finditer(line):
                phrase = match.group(0).strip()
                if not phrase or any(token in phrase for token in ["http", "github.com", "docs.litellm.ai"]):
                    continue
                if " " not in phrase and re.search(r"[-_/0-9]", phrase):
                    continue
                if is_technical_phrase_in_korean_line(line, phrase):
                    continue
                if all(word in ALLOW for word in re.findall(r"[A-Za-z]+", phrase)):
                    continue
                findings.append(f"{path.relative_to(ROOT)}:{line_no}: {phrase[:140]}")
    print(f"English phrase findings: {len(findings)}")
    for finding in findings[:300]:
        print(finding)
    if len(findings) > 300:
        print(f"... {len(findings) - 300} more")


if __name__ == "__main__":
    main()
