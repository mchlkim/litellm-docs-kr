---
title: 튜토리얼
sidebar_label: 개요
---

import NavigationCards from '@site/src/components/NavigationCards';

**튜토리얼** are step-by-step walkthroughs for integrating LiteLLM with external tools, frameworks, and services — or building complete end-to-end workflows.

> Need help choosing the right path before you start? See [학습 →](/litellm-docs-kr/docs/learn)

---

## 시작하기

<NavigationCards
columns={2}
items={[
  {
    icon: "⚡",
    title: "시작하기",
    description: "설치, playground, text completion, and mock completions.",
    to: "/litellm-docs-kr/docs/tutorials/getting_started",
  },
]}
/>

---

## Integrations

<NavigationCards
columns={2}
items={[
  {
    icon: "🤖",
    title: "에이전트 SDK & Frameworks",
    description: "OpenAI Agents SDK, Claude Agent SDK, Google ADK, CopilotKit, Letta, LiveKit, Instructor.",
    to: "/litellm-docs-kr/docs/agent_sdks",
  },
  {
    icon: "🛠️",
    title: "AI Coding Tools",
    description: "Claude Code, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Qwen Code, OpenAI Codex.",
    to: "/litellm-docs-kr/docs/ai_tools",
  },
  {
    icon: "🐍",
    title: "Python SDK",
    description: "Gradio, fallbacks, provider-specific params — no proxy required.",
    to: "/litellm-docs-kr/docs/tutorials/python_sdk",
  },
  {
    icon: "🔌",
    title: "프로바이더 설정",
    description: "Azure OpenAI, HuggingFace, TogetherAI, local models, and more.",
    to: "/litellm-docs-kr/docs/tutorials/provider_tutorials",
  },
]}
/>

---

## Proxy

<NavigationCards
columns={2}
items={[
  {
    icon: "👥",
    title: "Proxy: Admin & Access",
    description: "User and team management, SSO, SCIM, and routing rules.",
    to: "/litellm-docs-kr/docs/tutorials/proxy_admin_access",
  },
  {
    icon: "🛡️",
    title: "Proxy: Features & Safety",
    description: "Prompt caching, passthrough APIs, realtime, guardrails, and PII masking.",
    to: "/litellm-docs-kr/docs/tutorials/proxy_features_safety",
  },
]}
/>

---

## 관측성 & Evaluation

<NavigationCards
columns={2}
items={[
  {
    icon: "🔍",
    title: "관측성 & Evaluation",
    description: "Logging to Elasticsearch, benchmarking, and evaluation suites.",
    to: "/litellm-docs-kr/docs/tutorials/observability_evaluation",
  },
]}
/>
