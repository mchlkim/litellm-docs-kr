---
title: 관측성
sidebar_label: 개요
slug: observability_integrations
---

관측성 플랫폼으로 LLM 호출을 추적, 디버그, 분석합니다.

import NavigationCards from '@site/src/components/NavigationCards';

## 관측성 통합

<NavigationCards
columns={3}
items={[
  { icon: "🪢", title: "Langfuse", description: "LLM 관측성과 분석.", to: "/docs/observability/langfuse_integration" },
  { icon: "🐶", title: "Datadog", description: "메트릭, trace, 대시보드.", to: "/docs/observability/datadog" },
  { icon: "📡", title: "OpenTelemetry", description: "벤더 중립 trace.", to: "/docs/observability/opentelemetry_integration" },
  { icon: "🔗", title: "LangSmith", description: "LLM 디버깅과 평가.", to: "/docs/observability/langsmith_integration" },
  { icon: "🔥", title: "Arize / Phoenix", description: "ML 관측성과 평가.", to: "/docs/observability/arize_integration" },
  { icon: "🌀", title: "Helicone", description: "LLM 요청 로깅과 분석.", to: "/docs/observability/helicone_integration" },
  { icon: "📊", title: "MLflow", description: "실험 추적.", to: "/docs/observability/mlflow" },
  { icon: "🏋️", title: "Weights & Biases", description: "ML 실험 추적.", to: "/docs/observability/wandb_integration" },
  { icon: "📉", title: "PostHog", description: "제품 분석.", to: "/docs/observability/posthog_integration" },
  { icon: "🔭", title: "Splunk 관측성 Cloud", description: "OTLP trace를 Splunk로 전송합니다.", to: "/docs/observability/splunk_observability_cloud" },
]}
/>

[관측성 통합 전체 보기 →](/docs/observability/callbacks)
