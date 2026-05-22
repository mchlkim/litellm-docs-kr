---
title: Gateway 빠른 시작
sidebar_label: Gateway 빠른 시작
description: LiteLLM Gateway를 실행하고 모델과 키를 추가한 뒤, 앱과 SDK를 하나의 공통 엔드포인트에 연결합니다.
---

import NavigationCards from '@site/src/components/NavigationCards';

팀이나 플랫폼에서 공유할 OpenAI 호환 엔드포인트가 필요하다면 이 경로부터 시작하세요.

Docker 또는 데이터베이스 기반 구성이 먼저 필요하다면 [Docker + Database 튜토리얼](/litellm-docs-kr/docs/proxy/docker_quick_start)을 사용하세요. 빠르게 동작하는 요청까지 확인하려면 아래 단계를 따르면 됩니다.

## 1. Gateway 설치

```bash
uv tool install 'litellm[proxy]'
```

## 2. 프로바이더 키 하나 설정

```bash
export OPENAI_API_KEY="your-api-key"
```

## 3. `config.yaml` 생성

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: sk-1234
```

## 4. Gateway 시작

```bash
litellm --config config.yaml
```

프록시가 `http://0.0.0.0:4000`에서 시작되는 것을 확인할 수 있습니다.

## 5. 첫 요청 전송

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer sk-1234' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello from LiteLLM Gateway"}
    ]
  }'
```

## 6. 응답 확인

요청이 성공하면 프록시는 OpenAI 스타일 응답과 함께 `200 OK`를 반환합니다.

어시스턴트 응답 텍스트는 다음 위치에 있습니다.

```json
choices[0].message.content
```

Gateway가 OpenAI로 라우팅 중이라면 실제 응답은 다음과 비슷합니다.

```json
{
  "id": "chatcmpl-abc123",
  "created": 1677858242,
  "model": "gpt-4o-mini-2024-07-18",
  "object": "chat.completion",
  "system_fingerprint": "fp_406d6473f8",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?",
        "tool_calls": null,
        "function_call": null,
        "annotations": []
      }
    }
  ],
  "usage": {
    "completion_tokens": 9,
    "prompt_tokens": 13,
    "total_tokens": 22,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    }
  },
  "service_tier": "default"
}
```

`id`, `created`, 실제로 해석된 모델 버전, 토큰 수, 메시지 텍스트는 요청마다 달라질 수 있습니다. 다른 프로바이더는 더 적거나 약간 다른 필드 집합을 반환할 수 있지만, 주로 읽을 필드는 `choices[0].message.content`입니다.

## 7. 키와 UI 추가

가상 키, 비용 추적, 관리자 UI가 필요하다면 다음 단계로 데이터베이스를 추가합니다.

- `general_settings` 아래에 `database_url`을 추가합니다.
- 키 생성과 예산 관리는 [Virtual keys](/litellm-docs-kr/docs/proxy/virtual_keys)를 사용합니다.
- 모델과 키 관리는 [관리자 UI](/litellm-docs-kr/docs/proxy/ui)를 사용합니다.
- 더 완전한 구성이 필요하면 [Docker + Database 튜토리얼](/litellm-docs-kr/docs/proxy/docker_quick_start)을 사용합니다.

## 8. 다음 단계 선택

<NavigationCards
columns={3}
items={[
  {
    icon: "🖥️",
    title: "LLM 요청 보내기",
    description: "LiteLLM 또는 OpenAI 호환 클라이언트를 Gateway로 연결합니다.",
    to: "/litellm-docs-kr/docs/proxy/user_keys",
  },
  {
    icon: "🎛️",
    title: "모델 설정",
    description: "모델과 Gateway 설정을 추가합니다.",
    to: "/litellm-docs-kr/docs/proxy/configs",
  },
  {
    icon: "🔑",
    title: "가상 키",
    description: "키, 예산, 접근 제어를 생성합니다.",
    to: "/litellm-docs-kr/docs/proxy/virtual_keys",
  },
  {
    icon: "📈",
    title: "로깅 추가",
    description: "로그, 비용, trace를 수집합니다.",
    to: "/litellm-docs-kr/docs/proxy/logging",
  },
  {
    icon: "🔀",
    title: "부하 분산",
    description: "배포, 리전, 프로바이더를 가로질러 라우팅합니다.",
    to: "/litellm-docs-kr/docs/proxy/load_balancing",
  },
  {
    icon: "🛡️",
    title: "가드레일 추가",
    description: "안전성 검사와 정책 집행을 추가합니다.",
    to: "/litellm-docs-kr/docs/proxy/guardrails/quick_start",
  },
  {
    icon: "📊",
    title: "신뢰성",
    description: "재시도, fallback, timeout을 설정합니다.",
    to: "/litellm-docs-kr/docs/proxy/reliability",
  },
]}
/>

## SDK 경로를 써야 하는 경우

한 애플리케이션에서 모델만 호출하면 되고 중앙 인증이나 공유 인프라가 필요 없다면 [SDK 빠른 시작](/litellm-docs-kr/docs/learn/sdk_quickstart)부터 시작하세요.
