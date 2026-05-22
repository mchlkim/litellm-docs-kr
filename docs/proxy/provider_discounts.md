# 프로바이더 할인 {#provider-discounts}

특정 프로바이더에 백분율 기반 할인을 적용합니다. 프로바이더와 협상한 엔터프라이즈 가격을 반영할 때 유용합니다.

## LiteLLM Proxy Server에서 사용하기 {#usage-with-litellm-proxy-server}

**1단계: config.yaml에 할인 설정 추가**

```yaml
# Apply 5% discount to all Vertex AI and Gemini costs
litellm_settings:
  cost_discount_config:
    vertex_ai: 0.05  # 5% discount
    gemini: 0.05     # 5% discount
    openrouter: 0.05 # 5% discount
    # openai: 0.10   # 10% discount (example)
```

**2단계: 프록시 시작**

```bash
litellm /path/to/config.yaml
```

설정된 프로바이더의 모든 비용 계산에 할인이 자동으로 적용됩니다.


## 할인 작동 방식 {#how-discounts-work}

- 할인은 다른 모든 비용 계산(토큰, 캐싱, 도구 등)이 끝난 **후에** 적용됩니다.
- 할인 값은 백분율입니다(0.05 = 5%, 0.10 = 10% 등).
- 할인은 설정된 프로바이더에만 적용됩니다.
- 원래 비용, 할인 금액, 최종 비용은 비용 분석 로그에 기록됩니다.
- 할인 정보는 응답 헤더로 반환됩니다.
  - `x-litellm-response-cost` - 할인 후 최종 비용
  - `x-litellm-response-cost-original` - 할인 전 비용
  - `x-litellm-response-cost-discount-amount` - USD 기준 할인 금액

## 지원 프로바이더 {#supported-providers}

LiteLLM이 지원하는 모든 프로바이더에 할인을 적용할 수 있습니다. 일반적인 예시는 다음과 같습니다.

- `vertex_ai` - Google Vertex AI
- `gemini` - Google Gemini
- `openai` - OpenAI
- `anthropic` - Anthropic
- `azure` - Azure OpenAI
- `bedrock` - AWS Bedrock
- `cohere` - Cohere
- `openrouter` - OpenRouter

전체 프로바이더 목록은 [LlmProviders](https://github.com/BerriAI/litellm/blob/main/litellm/types/utils.py) enum에서 확인하세요.
