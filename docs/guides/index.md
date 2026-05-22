---
title: 가이드
sidebar_label: 개요
---

import NavigationCards from '@site/src/components/NavigationCards';

**가이드** are focused references organized by the job you are trying to do with LiteLLM: make requests, use tools, handle media, manage context, or operate the gateway safely.

> New to LiteLLM or not sure whether you need the SDK or Gateway path first? Start at [학습 →](/docs/learn)

---

## Build With LiteLLM

<NavigationCards
columns={3}
items={[
  {
    icon: "⚡",
    title: "핵심 요청",
    description: "Streaming, batching, structured outputs, and reasoning behavior.",
    to: "/docs/guides/core_request_response_patterns",
  },
  {
    icon: "🛠️",
    title: "도구 호출",
    description: "Function calling, web tools, interception patterns, computer use, code interpreter, and tool-call hygiene.",
    to: "/docs/guides/tools_integrations",
  },
  {
    icon: "🖼️",
    title: "멀티모달 I/O",
    description: "Vision, audio, PDFs, image generation, and video generation.",
    to: "/docs/guides/multimodal_io",
  },
  {
    icon: "📚",
    title: "검색 및 지식",
    description: "Vector stores, file search, citations, and knowledge-base routing.",
    to: "/docs/guides/retrieval_knowledge",
  },
  {
    icon: "🧠",
    title: "프롬프트 및 컨텍스트",
    description: "Prompt caching, trimming, formatting, assistant prefill, and predicted outputs.",
    to: "/docs/guides/prompts_context",
  },
]}
/>

---

## Operate & Extend

<NavigationCards
columns={3}
items={[
  {
    icon: "🎛️",
    title: "호환성 및 확장성",
    description: "Provider-specific params, model aliases, fine-tuned models, and adapters.",
    to: "/docs/guides/compatibility_extensibility",
  },
  {
    icon: "🧪",
    title: "신뢰성, 테스트 및 비용",
    description: "Retries, fallbacks, mock responses, and budget controls.",
    to: "/docs/guides/reliability_testing_spend",
  },
  {
    icon: "🔒",
    title: "보안 및 네트워크",
    description: "SSL, custom CA bundles, HTTP proxy settings, and per-service verification.",
    to: "/docs/guides/security_network",
  },
]}
/>
