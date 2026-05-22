# [BETA] Adaptive Router

:::info

베타 기능입니다. 피드백은 [Discord](https://discord.gg/wuPM9dRgDw) 또는 [Slack](https://join.slack.com/t/litellmossslack/shared_invite/zt-3o7nkuyfr-p_kbNJj8taRfXGgQI1~YyA)에서 공유해 주세요.

:::

**요구 사항:** Postgres 데이터베이스가 연결된 LiteLLM Proxy가 필요합니다. 품질 추정치는 Postgres에 저장되고 시작 시 로드됩니다. 데이터베이스가 없으면 router는 동작하지만 재시작 시 학습한 내용을 모두 잊습니다.

저렴한 모델과 비싼 모델이 모두 있다고 가정해 보겠습니다. 충분히 좋은 경우에는 저렴한 모델을 쓰고, 정말 중요한 요청에는 비싼 모델을 쓰고 싶을 수 있습니다. 규칙을 하드코딩하면 튜닝에 몇 달이 걸릴 수 있습니다.

Adaptive Router는 이 작업을 자동으로 처리합니다. 요청 유형(코드, 글쓰기, 분석 등)별로 어떤 모델이 가장 잘 동작하는지 추적하고, 사용자가 제어하는 가중치에 따라 품질과 비용의 균형을 맞춰 routing합니다.

## 빠른 시작

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
    model_info:
      input_cost_per_token: 0.0000025
      adaptive_router_preferences:
        quality_tier: 3        # 1=budget, 2=mid, 3=frontier
        strengths: ["code_generation", "analytical_reasoning"]

  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
    model_info:
      input_cost_per_token: 0.00000015
      adaptive_router_preferences:
        quality_tier: 2
        strengths: ["factual_lookup"]

  - model_name: my-router
    litellm_params:
      model: auto_router/adaptive_router
      adaptive_router_config:
        available_models: ["gpt-4o", "gpt-4o-mini"]
        weights:
          quality: 0.7   # raise this if quality complaints; lower if bill too high
          cost: 0.3      # must sum to 1.0 with quality
```

`model`을 Adaptive Router 이름으로 설정해 해당 router로 routing합니다.

```bash
curl -X POST {{baseURL}}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "my-router",
    "messages": [
      {"role": "user", "content": "build me a python script that parses CSV"},
      {"role": "assistant", "content": "Here is a script using csv.DictReader..."},
      {"role": "user", "content": "now add error handling for missing files"},
      {"role": "assistant", "content": "Wrap the open() call in a try/except FileNotFoundError..."},
      {"role": "user", "content": "perfect, that worked. thanks!"}
    ]
  }'
```

응답에는 실제로 선택된 모델을 알려주는 헤더가 포함됩니다.

```
x-litellm-adaptive-router-model: gpt-4o
```

위 예제의 "thanks!" 턴은 만족도 신호를 발생시키며, 이 신호가 bandit을 조정합니다.

## 비용과 품질 튜닝

`weights`가 주요 조정 수단입니다.

| 목표 | quality | cost |
|---|---|---|
| 비용 최소화, 품질은 보조 기준 | 0.3 | 0.7 |
| 균형형 | 0.5 | 0.5 |
| 품질 우선(기본값) | 0.7 | 0.3 |
| 품질을 양보할 수 없음 | 0.9 | 0.1 |

Router는 시간이 지나며 학습합니다. 모델별 처음 약 10개 요청에는 선언한 tier를 기준으로 동작하고, 이후에는 실제 성능 데이터가 반영됩니다.

## 요청별 최소 품질 tier 강제

특정 요청에 비용과 무관하게 frontier 모델이 필요하다면 다음 헤더를 전달합니다.

```
x-litellm-min-quality-tier: 3
```

헤더 대신 요청 metadata로 `min_quality_tier`를 전달할 수도 있습니다.

## 학습되는 내용

Router는 각 요청을 7가지 유형 중 하나로 분류하고, 각 모델이 유형별로 얼마나 잘 동작하는지 독립적으로 추적합니다. 사실 조회에는 뛰어나지만 코드에는 약한 모델은, 전체적으로 더 저렴하더라도 사실 조회 요청에서는 선택되고 코드 요청에서는 선택되지 않을 수 있습니다.

| 유형 | 예제 |
|---|---|
| `code_generation` | "Python sort 함수를 작성해 줘" |
| `code_understanding` | "이 함수가 무엇을 하는지 설명해 줘" |
| `technical_design` | "이 API를 어떻게 설계해야 할까?" |
| `analytical_reasoning` | "확률을 계산해 줘..." |
| `writing` | "팀에 보낼 이메일 초안을 작성해 줘..." |
| `factual_lookup` | "프랑스의 수도는 어디야?" |
| `general` | 그 외 모든 요청 |

[**classifier 코드 보기**](https://github.com/BerriAI/litellm/blob/litellm_adaptive_routing/litellm/router_strategy/adaptive_router/classifier.py)

학습 신호는 [Signals: Trajectory Sampling and Triage for Agentic Interactions](https://arxiv.org/pdf/2604.00356)에서 영감을 받았습니다.

## 현재 상태 확인

```
GET /adaptive_router/{router_name}/state
```

요청 유형별, 모델별 현재 품질 추정치를 반환합니다. 특정 모델이 선택되거나 선택되지 않는 이유를 이해하는 데 유용합니다.

```json
{
  "routers": [
    {
      "router_name": "smart-cheap-router",
      "available_models": ["fast", "smart"],
      "weights": { "quality": 0.7, "cost": 0.3 },
      "cells": [
        {
          "request_type": "analytical_reasoning",
          "model": "fast",
          "quality_mean": 0.5,
          "samples": 0
        },
        {
          "request_type": "analytical_reasoning",
          "model": "smart",
          "quality_mean": 0.95,
          "samples": 0
        }
      ]
    }
  ]
}
```

`quality_mean`은 핵심 값입니다. 해당 모델이 그 요청 유형을 얼마나 잘 처리하는지에 대한 router의 현재 추정치입니다. `samples`는 prior를 움직인 실제 관측 수를 나타냅니다. 0에서 시작하며 초기 prior mass는 제외됩니다.

## 알려진 제한 사항

- Latency는 점수화되지 않습니다. 느린 모델도 품질과 비용 기준에서 선택될 수 있습니다.
- 신호는 regex 기반이며 영어에 편향되어 있습니다. LLM judge는 사용하지 않습니다.
- cell당 관측 수는 최대 200개로 제한되며, 아직 decay는 없습니다.
- 세션에서 한 모델이 선택되면 해당 세션의 다른 모델 턴은 학습에 기여하지 않습니다.
