---
title: LiteLLM 학습
sidebar_label: 학습
slug: /learn
---

import NavigationCards from '@site/src/components/NavigationCards';

LiteLLM은 100개 이상의 LLM 프로바이더를 하나의 OpenAI 호환 인터페이스로 사용할 수 있게 해줍니다. 현재 구성에 맞는 경로부터 시작하세요.

---

## 여기서 시작

먼저 한 가지 경로를 선택합니다.

<NavigationCards
columns={2}
items={[
  {
    icon: "🐍",
    title: "SDK 빠른 시작",
    description: "애플리케이션 코드에서 LiteLLM을 직접 사용합니다.",
    listDescription: [
      "설치",
      "첫 요청",
      "다음 SDK 기능",
    ],
    to: "/docs/learn/sdk_quickstart",
  },
  {
    icon: "🖥️",
    title: "Gateway 빠른 시작",
    description: "LiteLLM을 공유 Gateway로 실행합니다.",
    listDescription: [
      "프록시 시작",
      "모델과 키 추가",
      "클라이언트 연결",
    ],
    to: "/docs/learn/gateway_quickstart",
  },
]}
/>

---

## 자주 하는 작업

필요한 작업으로 바로 이동합니다.

<NavigationCards
columns={3}
items={[
  {
    icon: "⚡",
    title: "응답 스트리밍",
    description: "생성되는 토큰을 순차적으로 반환합니다.",
    to: "/docs/guides/core_request_response_patterns",
  },
  {
    icon: "🧰",
    title: "도구 사용",
    description: "앱에 function calling을 추가합니다.",
    to: "/docs/guides/tools_integrations",
  },
  {
    icon: "🔀",
    title: "라우팅 추가",
    description: "재시도, fallback, 부하 분산을 설정합니다.",
    to: "/docs/routing-load-balancing",
  },
  {
    icon: "🔑",
    title: "키 설정",
    description: "Gateway 인증, 가상 키, 접근 제어를 설정합니다.",
    to: "/docs/proxy/virtual_keys",
  },
  {
    icon: "📈",
    title: "로깅 추가",
    description: "요청 로그와 비용 데이터를 수집합니다.",
    to: "/docs/proxy/logging",
  },
  {
    icon: "🌐",
    title: "프로바이더 선택",
    description: "프로바이더별 인증과 파라미터를 확인합니다.",
    to: "/docs/providers",
  },
]}
/>

---

## 문서 지도

필요한 문서 유형을 이미 알고 있을 때 사용하세요.

<NavigationCards
columns={2}
items={[
  {
    icon: "📚",
    title: "가이드",
    description: "기능 참조 문서.",
    to: "/docs/guides",
  },
  {
    icon: "🛠️",
    title: "튜토리얼",
    description: "단계별 통합 가이드.",
    to: "/docs/tutorials",
  },
]}
/>

어디서 시작할지 모르겠다면, 앱 코드에는 [SDK 빠른 시작](/docs/learn/sdk_quickstart)을, 공유 인프라에는 [Gateway 빠른 시작](/docs/learn/gateway_quickstart)을 사용하세요.
