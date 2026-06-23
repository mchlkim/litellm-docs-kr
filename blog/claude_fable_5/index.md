---
slug: claude_fable_5
title: "데이 0 지원: 클라우드 플레이블 5"
date: 2026-06-10T10:00:00
authors:
  - mateo
  - krrish
  - ishaan-alt
description: "LiteLLM AI Gateway에서 Claude Fable 5에 대한 Day 0 지원. Anthropic, Azure, Vertex AI, 및 Bedrock에서 사용할 수 있습니다."
tags: [anthropic, claude, fable 5, day 0 support]
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

![LiteLLM x Claude Fable 5](/img/litellm_claude_fable_5_announcement.png)

LiteLLM은 이제 [Claude Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)을 Day 0부터 지원합니다. LiteLLM AI Gateway를 통해 Anthropic, Azure, Vertex AI, Bedrock을 거쳐 사용할 수 있습니다. 이미 사용 중인 OpenAI 호환 요청으로 호출할 수 있으며, 지출, 제한 수준, 로깅 등을 한 곳에서 추적할 수 있습니다.

{/* truncate */}

## Fable 5 변경 사항

Fable 5는 Anthropic의 첫 번째로 공개된 Mythos 클래스 모델로, Opus 4.8의 2배 가격에 제공됩니다. 게이트웨이를 통해 실행하는 팀에게는 다음과 같은 점들이 주목할 만합니다:

- **현실의 경계, 이제 공개되었습니다.** Anthropic은 Fable 5가 거의 모든 테스트 벤치마크에서 최신 기술 수준을 보이며, Cognition의 경계 코드 벤치마크에서 중간 사고 노력 조건에서도 경계 모델 중 최고 점수를 기록한다고 보고했습니다. ([Anthropic 자세한 정보](https://www.anthropic.com/news/claude-fable-5-mythos-5))
- **장기 작업을 위한 설계.** 1M 토큰 컨텍스트 윈도우와 최대 128K 출력 토큰을 지원하며, 수백만 토큰의 장기 허리선 작업에서 집중력이 지속됩니다.
- **적응적 사고만.** Fable 5는 스스로 얼마나 깊이 생각할지를 결정합니다. 요청별로 `reasoning_effort` 또는 `output_config.effort`로 지시할 수 있으며, 고정 사고 예산인 `temperature`, `top_p`, 그리고 어시스턴트 메시지 사전 채우기는 모델에서 지원되지 않습니다.
- **$10 / MTok 입력 및 $50 / MTok 출력**, 프롬프트 캐싱은 $1.00 / MTok (읽기) 및 $12.50 / MTok (쓰기)입니다. Bedrock에서 `us.` 및 `eu.` 추론 프로파일은 일반적인 10% 지역 추가 비용을 적용하지만, `global.`는 기본 가격을 유지하며, LiteLLM은 모든 변형을 자동으로 추적합니다.
- **확인할 수 있는 대체 옵션.** Anthropic에 따르면, 보안 및 생물학 관련 요청(세션의 약 5% 미만)은 Opus 4.8을 통해 응답이 제공됩니다.
- **하나의 게이트웨이, 모든 표면.** 시각, PDF 입력, 컴퓨터 사용, 도구 호출, 프롬프트 캐싱, 적응적 사고, 구조화된 출력 등은 Anthropic, Azure, Vertex AI, Bedrock에서 통합된 지출 추적, 로깅 및 대체 옵션을 통해 모두 사용 가능합니다.

## 전원을 켜기 전에: 제공업체 가입

Fable 5는 일부 클라우드에서 데이터 공유 동의를 필요로 합니다; 알리바바 클라우드는 최대 30일간 프롬프트를 보유합니다.

- **Bedrock**: 계정의 데이터 보존 모드를 `provider_data_share`로 설정하고, 추론 프로필(`us.`, `eu.`, 또는 `global.` 접두사)을 통해 호출해야 합니다. 직접 모델 ID를 호출하는 것은 지원되지 않습니다.
- **Vertex AI**: 프로젝트에 Anthropic 데이터 공유를 활성화하고 Model Garden에서 Fable 5 약관을 수락해야 합니다.
- **Azure AI Foundry**: `claude-fable-5` 배포를 생성해야 합니다. 모델의 TPM 할당량 지표는 일부 구독에서 0으로 시작하므로, 먼저 할당량 요청이 필요할 수 있습니다.

## Fable 5 활성화

Fable 5는 **`v1.89.0-rc.2`** 이미지(그리고 그 이후 모든 버전)에 배포됩니다. 어떻게 받는지는 프록시가 가격을 어디에서 읽는지에 따라 달라집니다:

- **기본 (리모트 비용 지도): 업그레이드 필요 없음.** LiteLLM UI에서 **모델 + Endpoints** 아래의 **Price Data** 탭을 열고 **Reload Price Data**를 클릭하세요 (또는 프록시 관리자로서 `POST /reload/model_cost_map`). 이 작업은 LiteLLM의 비용 지도에서 최신 가격을 다시 가져오고, 한 번에 제공업체 라우팅을 다시 등록하므로 `claude-fable-5`는 Anthropic, Azure, Vertex AI, 및 Bedrock에서 사용 가능하게 됩니다. 이는 프록시 버전이 오래된 경우에도 적용됩니다.
- **`LITELLM_LOCAL_MODEL_COST_MAP=true`를 실행 중이십니까?** 비용 지도는 이미 이미지에 포함되어 있으므로 Reload 버튼은 이를 닿지 못합니다. `v1.89.0-rc.2` 또는 이후 버전을 뽑아 bundled Fable 5 메타데이터를 얻으세요:

  ```bash
  docker pull ghcr.io/berriai/litellm:v1.89.0-rc.2
  ```

## 사용법 - Anthropic

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-fable-5
    litellm_params:
      model: anthropic/claude-fable-5
      api_key: os.environ/ANTHROPIC_API_KEY
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.89.0-rc.2 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

## 사용법 - Azure

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-fable-5
    litellm_params:
      model: azure_ai/claude-fable-5
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE  # https://<resource>.services.ai.azure.com
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e AZURE_AI_API_KEY=$AZURE_AI_API_KEY \
  -e AZURE_AI_API_BASE=$AZURE_AI_API_BASE \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.89.0-rc.2 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

## 사용법 - Vertex AI

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-fable-5
    litellm_params:
      model: vertex_ai/claude-fable-5
      vertex_project: os.environ/VERTEX_PROJECT
      vertex_location: global
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e VERTEX_PROJECT=$VERTEX_PROJECT \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/credentials.json:/app/credentials.json \
  ghcr.io/berriai/litellm:v1.89.0-rc.2 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

## 사용법 - Bedrock

:::note
Bedrock은 Fable 5를 추론 프로파일을 통해만 제공하므로, 모델 ID는 `us.`, `eu.`, 또는 `global.` 접두사를 포함해야 합니다. 순수한 `anthropic.claude-fable-5` 모델 ID를 호출하면 검증 오류가 발생합니다.
:::

<Tabs>
<TabItem value="proxy" label="LiteLLM Proxy">

**1. 설정 config.yaml**

```yaml
model_list:
  - model_name: claude-fable-5
    litellm_params:
      model: bedrock/converse/us.anthropic.claude-fable-5
      aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID
      aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
      aws_region_name: us-east-1
```

**2. 프록시 시작**

```bash
docker run -d \
  -p 4000:4000 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v $(pwd)/config.yaml:/app/config.yaml \
  ghcr.io/berriai/litellm:v1.89.0-rc.2 \
  --config /app/config.yaml
```

**3. 테스트해보기!**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "what llm are you"
    }
  ]
}'
```

</TabItem>
</Tabs>

## 고급 기능

### 적응적 사고

:::note
Claude Fable 5와 함께 `reasoning_effort`를 사용할 때 모든 값은 `thinking: {type: "adaptive"}`에 매핑됩니다. Fable 5는 적응형 사고만 지원하며, `thinking: {type: "enabled", budget_tokens: ...}`를 통해 명시적인 예산을 설정하는 것은 Anthropic API에서 400 오류로 거부됩니다. 사고 깊이를 제어하려면 적응형 사고를 `output_config.effort` (아래 [Effort Levels](#effort-levels) 참조)와 결합하는 것이 아니라 고정된 예산 대신 사용해야 합니다.
:::

<Tabs>
<TabItem value="completions" label="/chat/completions">

LiteLLM은 `reasoning_effort` 파라미터를 통해 적응적 사고를 지원합니다:

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "Solve this complex problem: What is the optimal strategy for..."
    }
  ],
  "reasoning_effort": "high"
}'
```

</TabItem>
<TabItem value="messages" label="/v1/messages">

`thinking` 파라미터를 `type: "adaptive"`와 함께 사용하여 적응형 사고 모드를 활성화하세요:

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-fable-5",
    "max_tokens": 16000,
    "thinking": {
        "type": "adaptive"
    },
    "messages": [
        {
            "role": "user",
            "content": "Explain why the sum of two even numbers is always even."
        }
    ]
}'
```

</TabItem>
</Tabs>

### 노력 수준

Claude Fable 5는 전체 노력 계층 구조를 지원합니다: `low`, `medium`, `high` (기본값), `xhigh`, 및 `max`. 이는 모델이 작업에 대해 얼마나 많은 추론을 수행할지를 더 세밀하게 제어할 수 있게 합니다. 노력 수준은 `output_config` 파라미터를 통해 전달합니다.

Bedrock에서는 `output_config.effort`가 `xhigh`까지 제한되며, 다른 제공업체는 `max`까지 전체 레이더를 수용합니다.

<Tabs>
<TabItem value="completions" label="/chat/completions">

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $LITELLM_KEY' \
--data '{
  "model": "claude-fable-5",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "output_config": {
    "effort": "max"
  }
}'
```

**OpenAI SDK 사용:**

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="claude-fable-5",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    extra_body={"output_config": {"effort": "max"}}
)
```

**LiteLLM 사용법 SDK:**

```python
from litellm import completion

response = completion(
    model="anthropic/claude-fable-5",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    output_config={"effort": "max"},
)
```

`reasoning_effort`과 `output_config`을 결합하여 모델의 행동에 대해 더욱 세밀한 제어를 할 수 있습니다.

</TabItem>
<TabItem value="messages" label="/v1/messages">

```bash
curl --location 'http://0.0.0.0:4000/v1/messages' \
--header 'x-api-key: sk-12345' \
--header 'content-type: application/json' \
--data '{
    "model": "claude-fable-5",
    "max_tokens": 4096,
    "messages": [
        {
            "role": "user",
            "content": "Explain quantum computing"
        }
    ],
    "output_config": {
        "effort": "max"
    }
}'
```

</TabItem>
</Tabs>

**노력 수준 가이드:**

| 노력 | 사용 시기 |
|--------|-------------|
| `low` | 간단한 검색, 포맷팅, 분류와 같은 단순 작업에 적합한 짧고 빠른 응답 |
| `medium` | 일상적인 질문과 가벼운 추론에 적합한 균형 잡힌 트레이드오프 |
| `high` (기본값) | 복잡한 추론, 코드 생성, 분석에 적합 |
| `xhigh` | 다단계 수학, 깊은 연구, 에이전트 계획과 같은 어려운 문제 |
| `max` | 지연 여부와 관계없이 최대한 깊은 추론이 필요한 가장 어려운 작업 (Bedrock에서 사용 불가) |
