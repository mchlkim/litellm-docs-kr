---
title: 통합
sidebar_label: 개요
---

import NavigationCards from '@site/src/components/NavigationCards';

이 섹션은 LiteLLM Proxy 또는 SDK와 함께 사용할 수 있는 도구 및 서비스 통합을 다룹니다.

---

## 관측성

관측성 플랫폼으로 LLM 호출을 추적, 디버그, 분석합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "🪢",
    title: "Langfuse",
    description: "LLM 관측성과 분석.",
    to: "/docs/observability/langfuse_integration",
  },
  {
    icon: "🐶",
    title: "Datadog",
    description: "메트릭, trace, 대시보드.",
    to: "/docs/observability/datadog",
  },
  {
    icon: "📡",
    title: "OpenTelemetry",
    description: "벤더 중립 trace.",
    to: "/docs/observability/opentelemetry_integration",
  },
  {
    icon: "🔗",
    title: "LangSmith",
    description: "LLM 디버깅과 평가.",
    to: "/docs/observability/langsmith_integration",
  },
  {
    icon: "🔥",
    title: "Arize / Phoenix",
    description: "ML 관측성과 평가.",
    to: "/docs/observability/arize_integration",
  },
  {
    icon: "🌀",
    title: "Helicone",
    description: "LLM 요청 로깅과 분석.",
    to: "/docs/observability/helicone_integration",
  },
  {
    icon: "📊",
    title: "MLflow",
    description: "실험 추적.",
    to: "/docs/observability/mlflow",
  },
  {
    icon: "🏋️",
    title: "Weights & Biases",
    description: "ML 실험 추적.",
    to: "/docs/observability/wandb_integration",
  },
  {
    icon: "📉",
    title: "PostHog",
    description: "제품 분석.",
    to: "/docs/observability/posthog_integration",
  },
]}
/>

[관측성 통합 전체 보기 →](/docs/integrations/observability_integrations)

---

## 알림 및 모니터링

알림, 메트릭 수집, 인프라 모니터링을 설정합니다.

<NavigationCards
columns={2}
items={[
  {
    icon: "📈",
    title: "Prometheus",
    description: "메트릭 수집과 모니터링.",
    to: "../proxy/prometheus",
  },
  {
    icon: "🚨",
    title: "PagerDuty",
    description: "인시던트 대응과 알림.",
    to: "../proxy/pagerduty",
  },
  {
    icon: "🔔",
    title: "Alerting",
    description: "Slack, Teams, webhook 알림.",
    to: "../proxy/alerting",
  },
  {
    icon: "🔍",
    title: "Pyroscope",
    description: "지속적인 profiling.",
    to: "../proxy/pyroscope_profiling",
  },
]}
/>

---

## 가드레일 프로바이더

LLM 호출에 안전성 검사와 콘텐츠 필터링을 추가합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "🛡️",
    title: "Lakera AI",
    description: "Prompt injection 탐지.",
    to: "/docs/proxy/guardrails/lakera_ai",
  },
  {
    icon: "☁️",
    title: "Azure Content Safety",
    description: "콘텐츠 moderation.",
    to: "/docs/proxy/guardrails/azure_content_guardrail",
  },
  {
    icon: "🛏️",
    title: "Bedrock 가드레일",
    description: "AWS Bedrock 안전성 검사.",
    to: "/docs/proxy/guardrails/bedrock",
  },
  {
    icon: "🤖",
    title: "OpenAI Moderation",
    description: "OpenAI 콘텐츠 정책.",
    to: "/docs/proxy/guardrails/openai_moderation",
  },
  {
    icon: "🔐",
    title: "Secret Detection",
    description: "인증 정보 유출 방지.",
    to: "/docs/proxy/guardrails/secret_detection",
  },
  {
    icon: "🕵️",
    title: "PII Masking",
    description: "민감 데이터 마스킹.",
    to: "/docs/proxy/guardrails/pii_masking_v2",
  },
]}
/>

[가드레일 프로바이더 전체 보기 →](/docs/guardrail_providers)

---

## 정책

LLM 배포 전반의 사용 정책을 정의하고 집행합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "📋",
    title: "가드레일 정책",
    description: "정책 기반 가드레일 규칙.",
    to: "../proxy/guardrails/guardrail_policies",
  },
  {
    icon: "🔀",
    title: "정책 플로우 빌더",
    description: "시각적 정책 설정.",
    to: "../proxy/guardrails/policy_flow_builder",
  },
  {
    icon: "📄",
    title: "정책 템플릿",
    description: "사전 구성된 정책 템플릿.",
    to: "../proxy/guardrails/policy_templates",
  },
]}
/>

---

## AI 도구

LiteLLM을 AI 기반 코딩 및 생산성 도구와 연결합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "💬",
    title: "OpenWebUI",
    description: "자체 호스팅 ChatGPT 스타일 인터페이스.",
    to: "../tutorials/openweb_ui",
  },
  {
    icon: "🤖",
    title: "Claude Code",
    description: "Claude Code와 LiteLLM을 함께 사용합니다.",
    to: "../tutorials/claude_responses_api",
  },
  {
    icon: "🖱️",
    title: "Cursor",
    description: "AI 코드 에디터 통합.",
    to: "../tutorials/cursor_integration",
  },
  {
    icon: "🐙",
    title: "GitHub Copilot",
    description: "GitHub Copilot 통합.",
    to: "../tutorials/github_copilot_integration",
  },
  {
    icon: "💻",
    title: "OpenCode",
    description: "오픈소스 코딩 어시스턴트.",
    to: "../tutorials/opencode_integration",
  },
  {
    icon: "🔧",
    title: "Retool Assist",
    description: "Retool AI 어시스턴트.",
    to: "../tutorials/retool_assist",
  },
]}
/>

---

## 에이전트 SDK

LiteLLM을 agent framework 및 SDK와 함께 사용합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "🤖",
    title: "OpenAI Agents SDK",
    description: "OpenAI SDK로 agent를 빌드합니다.",
    to: "../tutorials/openai_agents_sdk",
  },
  {
    icon: "🧠",
    title: "Claude Agent SDK",
    description: "Anthropic SDK로 agent를 빌드합니다.",
    to: "../tutorials/claude_agent_sdk",
  },
  {
    icon: "🌐",
    title: "Google ADK",
    description: "Google Agent Development Kit.",
    to: "../tutorials/google_adk",
  },
  {
    icon: "🚀",
    title: "CopilotKit",
    description: "앱 내 AI copilot.",
    to: "../tutorials/copilotkit_sdk",
  },
  {
    icon: "🧬",
    title: "Letta",
    description: "영속 메모리를 가진 stateful LLM agent를 빌드합니다.",
    to: "./letta",
  },
  {
    icon: "🎙️",
    title: "LiveKit",
    description: "실시간 음성 및 영상 AI agent.",
    to: "../tutorials/livekit_xai_realtime",
  },
]}
/>

---

## 프롬프트 관리

프롬프트를 관리, 버전 관리, 배포합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "📝",
    title: "LiteLLM 프롬프트 관리",
    description: "내장 프롬프트 관리.",
    to: "../proxy/litellm_prompt_management",
  },
  {
    icon: "🔌",
    title: "사용자 정의 프롬프트 관리",
    description: "자체 프롬프트 저장소를 연결합니다.",
    to: "../proxy/custom_prompt_management",
  },
  {
    icon: "🔥",
    title: "Arize Phoenix Prompts",
    description: "Phoenix 기반 프롬프트 관리.",
    to: "../proxy/arize_phoenix_prompts",
  },
]}
/>

---

## AI 에이전트로 관리

AI agent로 LiteLLM 배포를 관리합니다. 자연어로 사용자, 팀, 키, 모델 등을 생성할 수 있습니다.

<NavigationCards
columns={1}
items={[
  {
    icon: "🤖",
    title: "LiteLLM Skills",
    description: "Claude Code에서 자연어 명령으로 키, 팀, 모델 등을 생성하며 LiteLLM을 관리합니다.",
    to: "../tutorials/claude_code_skills",
  },
]}
/>
