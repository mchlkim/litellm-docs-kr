# Akto

[Akto](https://www.akto.io/)를 가드레일 제공자로 사용하여 프록시를 통해 라우팅되는 모든 LLM 트래픽에 런타임 보안을 적용합니다. Akto는 자율 및 에이전트형 AI 시스템을 보호하도록 설계되었으며, 모든 요청과 응답을 인라인으로 검사하고 상호작용의 위험 점수를 산정하며, 유해한 작업, 데이터 노출, 안전하지 않은 동작이 발생하기 전에 정책 결정을 적용해 차단합니다.

Akto의 주요 기능은 다음과 같습니다.

- **Agentic AI Discovery** - 클라우드 환경 전반에서 AI 에이전트, MCP 서버, GenAI 애플리케이션을 자동으로 검색합니다.
- **Continuous AI Red Teaming** - CI/CD에서 프롬프트 인젝션, 도구 오용, 정책 우회, 새롭게 등장하는 공격 패턴 같은 위험을 식별하기 위해 4,000개 이상의 AI 전용 프로브를 실행합니다.
- **Runtime 가드레일** - 프롬프트 인젝션, 탈옥, 민감 데이터 유출, 무단 도구 사용, 스키마 위반 등을 다루는 구성 가능한 정책을 적용합니다.
- **AI Security Posture Management** - OWASP GenAI, NIST AI RMF, MITRE ATLAS를 포함한 10개 이상의 표준을 지원하며, 위험 점수, 컴플라이언스 격차, 보안 지표를 통합적으로 보여줍니다.

Akto 연동은 **두 항목 가드레일 패턴**을 사용합니다.
- `akto-validate` (`pre_call`) — 요청이 LLM에 도달하기 전에 보안 정책에 따라 검증합니다.
- `akto-ingest` (`post_call`) — 모니터링과 분석을 위해 요청과 응답을 Akto로 수집합니다.

## 빠른 시작

### 1. Akto 자격 증명 가져오기 {#1-get-your-akto-credentials}

Akto Guardrail API Service를 설정하고 다음 값을 가져옵니다.
- `AKTO_GUARDRAIL_API_BASE` — Guardrail API 기본 URL
- `AKTO_API_KEY` — API 키

### 2. `config.yaml`에서 설정하기 {#2-configure-in-configyaml}

#### Block + Ingest(권장) {#block--ingest-recommended}

아래 두 항목을 모두 사용합니다. 이렇게 하면 다음을 사용할 수 있습니다.
- 호출 전 차단 결정
- 허용된 트래픽에 대한 호출 후 수집

이를 두 개의 별도 항목(`akto-validate` 및 `akto-ingest`)으로 유지합니다.

```yaml
guardrails:
  - guardrail_name: "akto-validate"
    litellm_params:
      guardrail: akto
      mode: pre_call
      akto_base_url: os.environ/AKTO_GUARDRAIL_API_BASE
      akto_api_key: os.environ/AKTO_API_KEY
      default_on: true
      unreachable_fallback: fail_closed   # optional: fail_open | fail_closed (default: fail_closed)
      guardrail_timeout: 5                # optional, default: 5
      akto_account_id: "1000000"         # optional, env fallback: AKTO_ACCOUNT_ID
      akto_vxlan_id: "0"                 # optional, env fallback: AKTO_VXLAN_ID

  - guardrail_name: "akto-ingest"
    litellm_params:
      guardrail: akto
      mode: post_call
      akto_base_url: os.environ/AKTO_GUARDRAIL_API_BASE
      akto_api_key: os.environ/AKTO_API_KEY
      default_on: true
```

#### 모니터링 전용 모드 {#monitor-only-mode}

차단 없이 로깅/수집만 원하는 경우 `akto-ingest`만 유지합니다.

```yaml
guardrails:
  - guardrail_name: "akto-ingest"
    litellm_params:
      guardrail: akto
      mode: post_call
      akto_base_url: os.environ/AKTO_GUARDRAIL_API_BASE
      akto_api_key: os.environ/AKTO_API_KEY
      default_on: true
```

### 3. 테스트 요청 {#3-test-request}

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your litellm key>" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

요청이 차단되면 다음과 같이 표시됩니다.

```json
{
  "error": {
    "message": "Prompt injection detected",
    "type": "None",
    "param": "None",
    "code": "403"
  }
}
```

## 작동 방식 {#how-it-works}

LLM 요청이 도착하면 Akto 커넥터가 페이로드를 Akto Guardrail Engine에 전달하고, 엔진은 입력 정책에 따라 이를 평가한 뒤 판정을 반환합니다. 승인된 요청은 LLM 제공자로 전달됩니다. 응답은 호출자에게 전달되기 전에 출력 가드레일 검사를 위해 다시 엔진을 거칩니다. 모든 결정은 모니터링, 위협 분석, 개선 조치를 위해 Akto 대시보드로 전달됩니다.

**Block + Ingest 모드:**
```
Request → LiteLLM → Akto guardrail check
  → Allowed  → forward to LLM → ingest response
  → Blocked  → ingest blocked marker → 403 error
```

**모니터링 전용 모드:**
```
Request → LiteLLM → forward to LLM → get response
  → Send to Akto (guardrails + ingest) → log only
```

## 이벤트 동작 {#event-behavior}

| 항목 | LiteLLM 훅 | Akto 호출 동작 |
|------|---|---|
| `akto-validate` | `pre_call` | `guardrails=true`, `ingest_data=false`로 호출하고 완료를 기다립니다. |
| `akto-ingest` | `post_call` | `guardrails=true`, `ingest_data=true`로 완료를 기다리지 않는 호출을 수행합니다. |

`pre_call`에서 차단되면 LiteLLM은 차단 메타데이터가 포함된 수집 페이로드 하나를 완료를 기다리지 않고 보내며 `403`을 반환합니다.

## 지원 파라미터

| 파라미터 | 환경 변수 | 기본값 | 설명 |
|-----------|-------------|---------|-------------|
| `akto_base_url` | `AKTO_GUARDRAIL_API_BASE` | *필수* | Akto Guardrail API 기본 URL |
| `akto_api_key` | `AKTO_API_KEY` | *필수* | API 키(`Authorization` 헤더로 전송됨) |
| `akto_account_id` | `AKTO_ACCOUNT_ID` | `1000000` | 페이로드에 포함되는 Akto 계정 ID |
| `akto_vxlan_id` | `AKTO_VXLAN_ID` | `0` | 페이로드에 포함되는 Akto vxlan ID |
| `unreachable_fallback` | — | `fail_closed` | `fail_open` 또는 `fail_closed` |
| `guardrail_timeout` | — | `5` | 초 단위 제한 시간 |
| `default_on` | — | `true`(권장) | 기본적으로 가드레일 항목을 활성화합니다. |

## 오류 처리 {#error-handling}

| 시나리오 | `fail_closed`(기본값) | `fail_open` |
|----------|------------------------|-------------|
| Akto에 연결할 수 없음 | ❌ 차단됨(503) | ✅ 통과 |
| Akto가 오류를 반환함 | ❌ 차단됨(503) | ✅ 통과 |
| Guardrail이 거부함 | ❌ 차단됨(403) | ❌ 차단됨(403) |

Akto 팀에 문의하려면 [support@akto.io](mailto:support@akto.io)로 연락하세요.
