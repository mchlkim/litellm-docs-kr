import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Anthropic Effort 파라미터

`effort` 파라미터로 Claude가 응답에 사용할 토큰 양을 제어하고, 응답의 충실도와 토큰 효율 사이의 균형을 조정합니다.

## 개요

`effort` 파라미터를 사용하면 Claude가 요청에 응답할 때 토큰을 얼마나 적극적으로 사용할지 제어할 수 있습니다. 하나의 모델 안에서 응답의 충실도와 토큰 효율 사이의 절충점을 선택할 수 있습니다.

**지원 모델:**
- **Claude 4.6**(Opus 4.6, Sonnet 4.6) — `output_config`는 안정화된 API 기능이므로 beta header가 필요하지 않습니다. Opus 4.6은 `effort="max"`도 지원합니다.
- **Claude Opus 4.5** — `effort-2025-11-24` beta header가 필요합니다(LiteLLM이 자동으로 추가).

LiteLLM은 모든 지원 모델에서 `reasoning_effort`를 `output_config={"effort": ...}`로 자동 매핑합니다.

## Effort 작동 방식

기본적으로 Claude는 가능한 최상의 결과를 위해 필요한 만큼 토큰을 쓰는 최대 effort로 동작합니다. effort 수준을 낮추면 Claude가 토큰 사용을 더 보수적으로 하도록 지시할 수 있으며, 일부 성능 저하를 감수하는 대신 속도와 비용을 최적화할 수 있습니다.

**팁**: `effort`를 `"high"`로 설정하면 `effort` 파라미터를 완전히 생략했을 때와 동일하게 동작합니다.

effort 파라미터는 다음을 포함해 응답의 **모든 토큰**에 영향을 줍니다.
- 텍스트 응답과 설명
- 도구 호출과 함수 인자
- Extended thinking(활성화된 경우)

이 접근 방식에는 두 가지 큰 장점이 있습니다.
1. 사용을 위해 thinking을 활성화할 필요가 없습니다.
2. 도구 호출을 포함한 전체 토큰 사용량에 영향을 줄 수 있습니다. 예를 들어 effort를 낮추면 Claude가 더 적은 도구 호출을 수행할 수 있습니다.

이를 통해 효율을 훨씬 더 세밀하게 제어할 수 있습니다.

## Effort 수준

| 수준 | 설명 | 일반적인 사용 사례 |
|-------|-------------|------------------|
| `max` | `high`보다 더 높은 최대 성능입니다. Claude가 가장 충실한 결과를 위해 더 많은 토큰을 사용합니다. **Claude Opus 4.6에서만 지원됩니다.** | 가장 어려운 추론 문제, 복잡한 다단계 리서치 |
| `high` | 최대 성능입니다. Claude가 가능한 최상의 결과를 위해 필요한 만큼 토큰을 사용합니다. 파라미터를 설정하지 않은 것과 동일합니다. | 복잡한 추론, 어려운 코딩 문제, 에이전트 작업 |
| `medium` | 적정 수준의 토큰 절감을 제공하는 균형 잡힌 방식입니다. | 속도, 비용, 성능 사이의 균형이 필요한 에이전트 작업 |
| `low` | 가장 효율적인 모드입니다. 일부 성능 저하를 감수하고 토큰을 크게 절약합니다. | subagent처럼 최고 속도와 최저 비용이 중요한 단순 작업 |

## 빠른 시작

### LiteLLM SDK 사용

<Tabs>
<TabItem value="python" label="Python">

```python
import litellm

# Works with Claude 4.6 models (no beta header needed)
response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    reasoning_effort="medium"  # Automatically mapped to output_config
)

print(response.choices[0].message.content)
```

```python
# Also works with Claude Opus 4.5 (beta header auto-injected)
response = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{
        "role": "user",
        "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    reasoning_effort="medium"
)
```

</TabItem>
<TabItem value="typescript" label="TypeScript">

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude 4.6 — output_config is a stable API feature (no beta header)
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  messages: [{
    role: "user",
    content: "Analyze the trade-offs between microservices and monolithic architectures"
  }],
  output_config: {
    effort: "medium"
  }
});

console.log(response.content[0].text);
```

</TabItem>
</Tabs>

### LiteLLM Proxy 사용

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "reasoning_effort": "medium"
  }'
```

### Anthropic API 직접 호출

<Tabs>
<TabItem value="46" label="Claude 4.6 (stable)">

```bash
# Claude 4.6 — no beta header needed
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 4096,
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "output_config": {
      "effort": "medium"
    }
  }'
```

</TabItem>
<TabItem value="45" label="Claude Opus 4.5 (beta)">

```bash
# Claude Opus 4.5 — requires beta header
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "anthropic-beta: effort-2025-11-24" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-5-20251101",
    "max_tokens": 4096,
    "messages": [{
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }],
    "output_config": {
      "effort": "medium"
    }
  }'
```

</TabItem>
</Tabs>

## 모델 호환성

effort 파라미터는 다음 모델에서 지원됩니다.
- **Claude Opus 4.6** (`claude-opus-4-6`) — `high`, `medium`, `low`, `max` 지원
- **Claude Sonnet 4.6** (`claude-sonnet-4-6`) — `high`, `medium`, `low` 지원
- **Claude Opus 4.5** (`claude-opus-4-5-20251101`) — `high`, `medium`, `low` 지원

:::info
`effort="max"`는 Claude Opus 4.6에서만 사용할 수 있습니다. 다른 모델에서 사용하면 검증 오류가 발생합니다.
:::

## Effort 파라미터 조정 시점

- 복잡한 추론, 섬세한 분석, 어려운 코딩 문제처럼 품질이 최우선인 작업에는 기본값인 **high effort**를 사용하세요.

- **medium effort**는 `high` 수준의 전체 토큰 지출 없이 안정적인 성능을 원할 때 적합한 균형 옵션입니다.

- **low effort**는 Claude가 더 적은 토큰으로 답하므로 속도나 비용을 최적화할 때 사용하세요. 예를 들어 단순 분류, 빠른 조회, 품질의 미세한 개선보다 지연 시간과 비용 절감이 중요한 대량 처리 사례에 적합합니다.

## 도구 사용 시 Effort

도구를 사용할 때 effort 파라미터는 도구 호출 주변의 설명과 도구 호출 자체 모두에 영향을 줍니다. 낮은 effort 수준에서는 다음과 같은 경향이 있습니다.
- 여러 작업을 더 적은 도구 호출로 결합
- 더 적은 도구 호출 수행
- 바로 실행 단계로 진행

도구 사용 예:

```python
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Check the weather in multiple cities"
    }],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }],
    reasoning_effort="low"  # Mapped to output_config — will make fewer tool calls
)
```

## Extended Thinking과 Effort

effort 파라미터는 extended thinking과 함께 자연스럽게 동작합니다. 둘 다 활성화되면 effort가 모든 응답 유형의 토큰 예산을 제어합니다.

```python
import litellm

response = litellm.completion(
    model="anthropic/claude-sonnet-4-6",
    messages=[{
        "role": "user",
        "content": "Solve this complex problem"
    }],
    reasoning_effort="medium"  # Mapped to adaptive thinking + output_config for 4.6 models
)
```

## 권장 사항

1. 새 작업은 **기본값(high)** 으로 시작한 뒤, 비용 최적화가 필요하면 더 낮은 effort 수준을 실험하세요.

2. 품질과 효율의 균형이 필요한 **프로덕션 에이전트 워크플로에는 medium effort**를 사용하세요.

3. 분류, 라우팅, 데이터 추출처럼 정교한 응답보다 속도가 중요한 **대량 단순 작업에는 low effort**를 남겨두세요.

4. 사용 사례별로 effort 수준에 따른 실제 절감 효과를 이해하려면 **토큰 사용량을 모니터링**하세요.

5. 작업 복잡도에 따라 effort 수준의 영향이 달라질 수 있으므로 **실제 프롬프트로 테스트**하세요.

## Provider 지원

effort 파라미터는 모든 Anthropic 호환 provider에서 지원됩니다.

- **Standard Anthropic API**: ✅ 지원(Claude 4.6, Opus 4.5)
- **Azure Anthropic / Microsoft Foundry**: ✅ 지원(Claude 4.6, Opus 4.5)
- **Amazon Bedrock**: ✅ 지원(Claude 4.6, Opus 4.5)
- **Google Cloud Vertex AI**: ✅ 지원(Claude 4.6, Opus 4.5)

LiteLLM은 다음을 자동으로 처리합니다.
- 파라미터 매핑: 모든 지원 모델에서 `reasoning_effort` → `output_config={"effort": ...}`
- Claude Opus 4.5에 대해서만 beta header(`effort-2025-11-24`) 주입(4.6 모델에는 필요 없음)

## 사용량과 가격

effort 수준별 토큰 사용량은 표준 usage 객체에 기록됩니다. 더 낮은 effort 수준은 출력 토큰 수를 줄이고, 이는 비용 절감으로 직접 이어집니다.

```python
response = litellm.completion(
    model="anthropic/claude-opus-4-5-20251101",
    messages=[{"role": "user", "content": "Analyze this"}],
    output_config={"effort": "low"}
)

print(f"Output tokens: {response.usage.completion_tokens}")
print(f"Total tokens: {response.usage.total_tokens}")
```

## 문제 해결

### Beta header가 추가되지 않음(Claude Opus 4.5)

`reasoning_effort` 또는 `output_config`가 제공되면 LiteLLM은 Claude Opus 4.5에 대해 `effort-2025-11-24` beta header를 자동으로 추가합니다.

**참고:** Claude 4.6 모델에는 beta header가 필요하지 않습니다. 이 모델들에서 `output_config`는 안정화된 API 기능입니다.

Opus 4.5에서 header가 보이지 않는다면 다음을 확인하세요.

1. `reasoning_effort` 파라미터를 사용하고 있는지 확인합니다.
2. 모델이 Claude Opus 4.5인지 확인합니다.
3. LiteLLM 버전이 이 기능을 지원하는지 확인합니다.

### 잘못된 effort 값 오류

허용되는 값은 `"high"`, `"medium"`, `"low"`, `"max"`(Opus 4.6 전용)입니다. 다른 값을 사용하면 검증 오류가 발생합니다.

```python
# ❌ This will raise an error
output_config={"effort": "very_low"}

# ✅ Use one of the valid values
output_config={"effort": "low"}

# ❌ This will raise an error (max only works on Opus 4.6)
litellm.completion(model="anthropic/claude-sonnet-4-6", reasoning_effort="max", ...)

# ✅ max is only for Opus 4.6
litellm.completion(model="anthropic/claude-opus-4-6", reasoning_effort="max", ...)
```

### 지원되지 않는 모델

effort 파라미터는 Claude Opus 4.6, Sonnet 4.6, Opus 4.5에서 지원됩니다. 다른 모델에서 사용하면 파라미터가 무시되거나 오류가 발생할 수 있습니다.

## 관련 기능

- [Anthropic provider 가이드](/docs/providers/anthropic) - thinking, 도구 호출, provider 설정 확인
- [도구 입력 예제](/docs/providers/anthropic_tool_input_examples) - Claude가 더 정확한 tool input을 생성하도록 예제 제공
- [Programmatic 도구 호출](/docs/providers/anthropic_programmatic_tool_calling) - Claude가 도구를 호출하는 코드를 작성하도록 설정
- [Prompt 캐싱](/docs/completion/prompt_caching) - 비용 절감을 위한 프롬프트 캐싱

## 추가 자료

- [Anthropic Effort 문서](https://docs.anthropic.com/en/docs/build-with-claude/effort)
- [LiteLLM Anthropic Provider 가이드](/docs/providers/anthropic)
- [비용 추적 가이드](/docs/proxy/cost_tracking)
