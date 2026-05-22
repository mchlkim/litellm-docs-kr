# 응답 헤더 {#response-headers}

프록시에 요청하면 프록시는 다음 헤더를 반환합니다.

## Rate Limit 헤더 {#rate-limit-headers}
[OpenAI 호환 헤더](https://platform.openai.com/docs/guides/rate-limits/rate-limits-in-headers):

| Header | Type | 설명 |
|--------|------|-------------|
| `x-ratelimit-remaining-requests` | Optional[int] | rate limit을 소진하기 전까지 허용되는 남은 요청 수 |
| `x-ratelimit-remaining-tokens` | Optional[int] | rate limit을 소진하기 전까지 허용되는 남은 토큰 수 |
| `x-ratelimit-limit-requests` | Optional[int] | rate limit을 소진하기 전까지 허용되는 최대 요청 수 |
| `x-ratelimit-limit-tokens` | Optional[int] | rate limit을 소진하기 전까지 허용되는 최대 토큰 수 |
| `x-ratelimit-reset-requests` | Optional[int] | rate limit이 재설정되는 시각 |
| `x-ratelimit-reset-tokens` | Optional[int] | rate limit이 재설정되는 시각 |

### Rate Limit 헤더 동작 방식 {#how-rate-limit-headers-work}

**키에 rate limit이 설정된 경우**

프록시는 [해당 키의 남은 rate limit](https://github.com/BerriAI/litellm/blob/bfa95538190575f7f317db2d9598fc9a82275492/litellm/proxy/hooks/parallel_request_limiter.py#L778)을 반환합니다.

**키에 rate limit이 설정되지 않은 경우**

프록시는 backend provider가 반환한 남은 요청/토큰 수를 반환합니다. LiteLLM은 backend provider의 응답 헤더를 OpenAI 형식에 맞게 표준화합니다.

backend provider가 이 헤더를 반환하지 않으면 값은 `None`입니다.

이 헤더는 클라이언트가 현재 rate limit 상태를 이해하고 요청 속도를 조정하는 데 유용합니다.


## 지연 시간 헤더 {#latency-headers}
| Header | Type | 설명 |
|--------|------|-------------|
| `x-litellm-response-duration-ms` | float | 요청이 LiteLLM Proxy에 도착한 순간부터 클라이언트로 반환될 때까지의 총 시간 |
| `x-litellm-overhead-duration-ms` | float | 밀리초 단위 LiteLLM 처리 overhead |

## Retry, Fallback 헤더 {#retry-fallback-headers}
| Header | Type | 설명 |
|--------|------|-------------|
| `x-litellm-attempted-retries` | int | 수행된 retry 시도 횟수 |
| `x-litellm-attempted-fallbacks` | int | 수행된 fallback 시도 횟수 |
| `x-litellm-max-fallbacks` | int | 허용되는 최대 fallback 시도 횟수 |

## 비용 추적 헤더 {#cost-tracking-headers}
| Header | Type | 설명 | Pass-Through 엔드포인트에서 사용 가능 |
|--------|------|-------------|-------------|
| `x-litellm-response-cost` | float | API 호출 비용 | |
| `x-litellm-key-spend` | float | API 키의 총 지출 | ✅ |

## LiteLLM 전용 헤더 {#litellm-specific-headers}
| Header | Type | 설명 | Pass-Through 엔드포인트에서 사용 가능 |
|--------|------|-------------|-------------|
| `x-litellm-call-id` | string | 이 요청의 ID | ✅ |
| `x-litellm-model-id` | string | 배포 ID(`model_info.id`) | |
| `x-litellm-model-api-base` | string | API base URL | ✅ |
| `x-litellm-version` | string | LiteLLM 버전 | |
| `x-litellm-model-group` | string | 라우팅된 `model_list[].model_name`(클라이언트 `model`) | |

### 예제

```yaml
model_list:
  - model_name: my-chat-model          # clients call this
    litellm_params:
      model: gpt-4o-mini               # LiteLLM calls this upstream
    model_info:
      id: "7c9f2a1b3d8e4f0a2c6b5d9e1f3a7b8c"   # optional; auto-generated if omitted
```

| Header | 예제 | 참고 |
|--------|---------|-------|
| `x-litellm-model-group` | `my-chat-model` | `model_name` / request `model`입니다. `litellm_params.model`이 아닙니다. |
| `x-litellm-model-id` | `7c9f2a1b3d8e4f0a2c6b5d9e1f3a7b8c` | 어떤 배포 row인지 나타냅니다. `/v1/model/info?litellm_model_id=...`와 함께 사용합니다. |
| Response body `model` | 주로 `my-chat-model` | 클라이언트와 맞추기 위해 다시 찍히는 경우가 많습니다. upstream ID는 config에 유지됩니다. |

### 추가 예시(설명용) {#more-examples-illustrative}

| Header | 예제 | 의미 |
|--------|---------|---------|
| `x-litellm-response-cost` | `0.000214` | 이 호출 비용(USD) |
| `x-litellm-key-spend` | `12.847` | 이 호출 이후 key total |
| `x-litellm-response-duration-ms` | `842.3` | Proxy end-to-end 시간(ms) |
| `x-litellm-overhead-duration-ms` | `15.1` | LiteLLM 오버헤드(ms) |
| `x-litellm-attempted-retries` | `0` | retry 횟수 |
| `x-litellm-attempted-fallbacks` | `1` | 다른 배포로 fallback한 횟수 |
| `x-litellm-call-id` | `019b2c4d-e5f6-7890-abcd-ef1234567890` | 로그 / tracing |
| `x-litellm-version` | `1.55.3` | 버전 |
| `x-litellm-model-api-base` | `https://api.openai.com/v1` | Provider base(query string 없음) |

## LLM provider의 응답 헤더 {#response-headers-from-llm-providers}

LiteLLM은 LLM provider의 원본 응답 헤더도 반환합니다. 이 헤더는 LiteLLM 헤더와 구분되도록 `llm_provider-` 접두사를 붙입니다.

예제 응답 헤더:
```
llm_provider-openai-processing-ms: 256
llm_provider-openai-version: 2020-10-01
llm_provider-x-ratelimit-limit-requests: 30000
llm_provider-x-ratelimit-limit-tokens: 150000000
```
