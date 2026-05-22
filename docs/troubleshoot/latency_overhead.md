# Latency Overhead 문제 해결

LiteLLM proxy와 LLM provider 사이에서 예상치 못한 latency overhead가 보일 때 이 가이드를 사용하세요.

## 보이지 않는 지연 시간 간격

LiteLLM은 handler가 시작된 시점부터 latency를 측정합니다. handler가 실행되기 **전** request가 uvicorn event loop에서 대기하면, 그 대기 시간은 LiteLLM 자체 log에 보이지 않습니다.

```
T=0   Request arrives at load balancer
      [queue wait — LiteLLM never logs this]
T=10  LiteLLM handler starts → timer begins
T=20  Response sent

LiteLLM logs: 10s    User experiences: 20s
```

handler 전 대기 시간을 측정하려면 각 pod에서 `/health/backlog`를 poll합니다.

```bash
curl http://localhost:4000/health/backlog \
  -H "Authorization: Bearer sk-..."
# {"in_flight_requests": 47}
```

또는 `/metrics`에서 `litellm_in_flight_requests` Prometheus gauge를 scrape합니다.

| `in_flight_requests` | ALB `TargetResponseTime` | 진단 |
|---|---|---|
| 높음 | 높음 | Pod 과부하 → scale out |
| 낮음 | 높음 | 지연이 pre-ASGI 구간에 있음. sync blocking code 또는 event loop saturation을 확인하세요. |
| 높음 | 정상 | Pod가 바쁘지만 정상이며 queue buildup은 없습니다. |

**AWS ALB**를 사용한다면 `litellm_in_flight_requests` spike와 ALB의 `TargetResponseTime` CloudWatch metric을 함께 비교하세요. ALB가 보고하는 값과 LiteLLM log 사이의 차이가 보이지 않는 대기 시간입니다.

## 빠른 체크리스트

1. `/health/backlog` 또는 `litellm_in_flight_requests` Prometheus gauge로 **각 pod의 `in_flight_requests`를 확인**합니다. LiteLLM이 처리를 시작하기 전에 request가 queueing되는지 알 수 있습니다. 설명되지 않는 latency는 여기서부터 확인하세요.
2. **`x-litellm-overhead-duration-ms` response header를 수집**합니다. 각 request에서 LiteLLM의 총 overhead를 보여줍니다.
2. **DEBUG logging이 켜져 있나요?** 큰 payload에서 latency를 만드는 가장 흔한 원인입니다.
3. **큰 base64 payload를 보내고 있나요?** (image, PDF) [큰 Payload Overhead](#large-payload-overhead)를 참고하세요.
4. 시간이 어디서 소비되는지 정확히 찾으려면 **상세 timing header를 활성화**합니다.

## 진단 Header

### `x-litellm-overhead-duration-ms` (always on)

LiteLLM의 모든 response에는 이 header가 포함됩니다. LiteLLM proxy가 추가한 총 latency overhead를 millisecond 단위로 보여줍니다. 즉, 총 response time에서 LLM API call time을 뺀 값입니다. baseline overhead를 파악하려면 모든 request에서 이 값을 수집하세요.

```bash
curl -s -D - http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "hi"}]}' \
  2>&1 | grep x-litellm-overhead-duration-ms
```

### `x-litellm-callback-duration-ms` (always on)

callback/logging payload를 구성하는 데 걸린 시간(ms)을 보여줍니다. 이 값이 높으면(>100ms) payload가 효율적인 logging에 비해 너무 클 수 있습니다.

```bash
curl -s -D - http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-..." \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "hi"}]}' \
  2>&1 | grep x-litellm
```

### 상세 Timing 분해(opt-in)

response header에서 phase별 timing을 받으려면 `LITELLM_DETAILED_TIMING=true`를 설정합니다.

| Header | 측정 항목 |
|--------|-----------------|
| `x-litellm-timing-pre-processing-ms` | Auth, routing, request processing(LLM call 전) |
| `x-litellm-timing-llm-api-ms` | 실제 LLM API call duration |
| `x-litellm-timing-post-processing-ms` | Response processing(LLM 반환 후) |
| `x-litellm-timing-message-copy-ms` | logging layer의 message copy 시간 |

```bash
# Enable detailed timing
export LITELLM_DETAILED_TIMING=true
```

## 큰 Payload Overhead {#large-payload-overhead}

큰 payload(>1MB, 예: base64로 인코딩된 image/PDF)를 보낼 때는 세 가지가 overhead를 추가할 수 있습니다.

### 1. DEBUG Logging(가장 흔함)

`LITELLM_LOG=DEBUG` 또는 `set_verbose=True`가 활성화되면 모든 request payload가 `json.dumps(indent=4)`로 동기 직렬화됩니다. 2MB 이상 payload에서는 이것만으로도 **2-5초**가 걸릴 수 있습니다.

**해결:** production에서는 DEBUG logging을 사용하지 마세요. 대신 `INFO` level을 사용합니다.

```bash
export LITELLM_LOG=INFO
```

DEBUG logging이 필요하지만 큰 payload가 있다면, 전체 payload logging에 대한 size threshold를 늘릴 수 있습니다.

```bash
# Only fully serialize payloads under 100KB for DEBUG logs (default)
export MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG=102400
```

### 2. Logging Payload의 Base64

Callback payload(Langfuse 등으로 전송)에는 message content가 포함됩니다. 큰 base64 문자열은 logging payload에서 size placeholder로 자동 truncate됩니다.

truncate threshold는 다음처럼 제어할 수 있습니다.

```bash
# Max base64 characters before truncation (default: 64)
export MAX_BASE64_LENGTH_FOR_LOGGING=64
```

## 환경 변수 Reference

| 변수 | 기본값 | 설명 |
|----------|---------|-------------|
| `LITELLM_DETAILED_TIMING` | `false` | phase별 timing header 활성화 |
| `MAX_PAYLOAD_SIZE_FOR_DEBUG_LOG` | `102400` | 전체 DEBUG serialization에 사용할 최대 payload byte |
| `MAX_BASE64_LENGTH_FOR_LOGGING` | `64` | logging에서 truncate하기 전 최대 base64 문자 수 |
