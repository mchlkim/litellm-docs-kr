---
title: 학습 LiteLLM
sidebar_label: 학습
slug: /learn
---

import NavigationCards from '@site/src/components/NavigationCards';

LiteLLM gives you one OpenAI-compatible interface for 100+ LLM providers. Start with the path that matches your setup.

---

## 여기서 시작

Pick one path first.

<NavigationCards
columns={3}
items={[
  {
    icon: "🐍",
    title: "SDK 빠른 시작",
    description: "Use LiteLLM directly in application code.",
    listDescription: [
      "Install",
      "First request",
      "Next SDK features",
    ],
    to: "/docs/learn/sdk_quickstart",
  },
  {
    icon: "🖥️",
    title: "Gateway 빠른 시작",
    description: "Run LiteLLM as a shared gateway.",
    listDescription: [
      "Start proxy",
      "Add models and keys",
      "Connect clients",
    ],
    to: "/docs/learn/gateway_quickstart",
  },
  {
    icon: "✨",
    title: "✨ 엔터프라이즈 빠른 시작",
    description: "빠른 시작 Guide for LiteLLM 엔터프라이즈 — LLM, MCP, and Agent gateway.",
    listDescription: [
      "Deploy with license",
      "Validate three gateways",
      "Enable enterprise controls",
    ],
    to: "/docs/learn/enterprise_quickstart",
  },
]}
/>

---

## Common Tasks

Jump to a specific task.

<NavigationCards
columns={3}
items={[
  {
    icon: "⚡",
    title: "Stream Responses",
    description: "Return tokens as they are generated.",
    to: "/docs/guides/core_request_response_patterns",
  },
  {
    icon: "🧰",
    title: "Use Tools",
    description: "Add function calling to your app.",
    to: "/docs/guides/tools_integrations",
  },
  {
    icon: "🔀",
    title: "Add Routing",
    description: "Retries, fallbacks, and load balancing.",
    to: "/docs/routing-load-balancing",
  },
  {
    icon: "🔑",
    title: "Set Up Keys",
    description: "Gateway auth, virtual keys, and access control.",
    to: "/docs/proxy/virtual_keys",
  },
  {
    icon: "📈",
    title: "Add Logging",
    description: "Capture request logs and spend data.",
    to: "/docs/proxy/logging",
  },
  {
    icon: "🌐",
    title: "Choose A Provider",
    description: "Find provider-specific auth and params.",
    to: "/docs/providers",
  },
]}
/>

---

## 문서 Map

Use these when you already know the type of doc you want.

<NavigationCards
columns={2}
items={[
  {
    icon: "📚",
    title: "가이드",
    description: "Feature reference.",
    to: "/docs/guides",
  },
  {
    icon: "🛠️",
    title: "튜토리얼",
    description: "Step-by-step integrations.",
    to: "/docs/tutorials",
  },
]}
/>

Not sure where to start? Use [SDK 빠른 시작](/docs/learn/sdk_quickstart) for app code, [Gateway 빠른 시작](/docs/learn/gateway_quickstart) for shared infrastructure, or [✨ 엔터프라이즈 빠른 시작](/docs/learn/enterprise_quickstart) for a trial or PoC evaluation.
