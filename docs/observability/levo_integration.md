---
sidebar_label: Levo AI
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Levo AI

<div className="levo-logo-container" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
  <div className="levo-logo-light">
    <Image img={require('../../img/levo_logo.png')} />
  </div>
  <div className="levo-logo-dark">
    <Image img={require('../../img/levo_logo_dark.png')} />
  </div>
</div>

[Levo](https://levo.ai/)는 LLM 애플리케이션을 위한 포괄적인 모니터링, 분석, 규정 준수 추적을 제공하는 AI 관측성 및 규정 준수 플랫폼입니다.

## 빠른 시작 {#quick-start}

LiteLLM에 내장된 Levo 통합을 사용하여 모든 LLM 요청과 응답을 모니터링 및 분석용으로 Levo에 전송합니다.

### 제공되는 기능 {#what-youll-get}

- 모든 provider의 전체 LLM API 호출에 대한 **완전한 가시성**
- prompt, completion, metadata를 포함한 **요청 및 응답 데이터**
- token 수와 비용 세부 내역을 포함한 **사용량 및 비용 추적**
- **오류 모니터링** 및 성능 지표
- 감사 및 governance를 위한 **규정 준수 추적**

### 설정 단계 {#setup-steps}

**1. OpenTelemetry 의존성을 설치합니다.**

```bash
uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http opentelemetry-exporter-otlp-proto-grpc
```

**2. LiteLLM 설정에서 Levo callback을 활성화합니다.**

`litellm_config.yaml`에 다음을 추가합니다.

```yaml
litellm_settings:
  callbacks: ["levo"]
```

**3. 환경 변수를 설정합니다.**

collector endpoint URL, API key, organization ID, workspace ID를 받으려면 [Levo 지원팀에 문의](mailto:support@levo.ai)하세요.

다음 필수 환경 변수를 설정합니다.

```bash
export LEVOAI_API_KEY="<your-levo-api-key>"
export LEVOAI_ORG_ID="<your-levo-org-id>"
export LEVOAI_WORKSPACE_ID="<your-workspace-id>"
export LEVOAI_COLLECTOR_URL="<your-levo-collector-url>"
```

**참고:** collector URL은 Levo 지원팀에서 제공한 전체 endpoint URL이어야 합니다. 제공된 값 그대로 사용됩니다.

**4. LiteLLM을 시작합니다.**

```bash
litellm --config config.yaml
```

**5. 요청을 보내면 자동으로 Levo에 전송됩니다.**

```bash
curl --location 'http://0.0.0.0:4000/chat/completions' \
    --header 'Content-Type: application/json' \
    --data '{
    "model": "gpt-3.5-turbo",
    "messages": [
        {
        "role": "user",
        "content": "Hello, this is a test message"
        }
    ]
    }'
```

## 수집되는 데이터 {#what-data-is-captured}

| 기능 | 세부 정보 |
|---------|---------|
| **기록되는 항목** | OpenTelemetry Trace Data(OTLP format) |
| **Event** | 성공 및 실패 |
| **Format** | OTLP(OpenTelemetry 프로토콜) |
| **Header** | `Authorization: Bearer {LEVOAI_API_KEY}`, `x-levo-organization-id`, `x-levo-workspace-id`를 자동으로 포함 |

## 설정 참조 {#configuration-reference}

### 필수 환경 변수 {#required-environment-variables}

| 변수 | 설명 | 예제 |
|----------|-------------|---------|
| `LEVOAI_API_KEY` | Levo API key | `levo_abc123...` |
| `LEVOAI_ORG_ID` | Levo 조직 ID | `org-123456` |
| `LEVOAI_WORKSPACE_ID` | Levo workspace ID | `workspace-789` |
| `LEVOAI_COLLECTOR_URL` | Levo 지원팀에서 받은 전체 collector endpoint URL | `https://collector.levo.ai/v1/traces` |

### 선택 환경 변수 {#optional-environment-variables}

| 변수 | 설명 | 기본값 |
|----------|-------------|---------|
| `LEVOAI_ENV_NAME` | trace tag 지정에 사용할 환경 이름 | `None` |

**참고:** collector URL은 Levo 지원팀에서 제공한 값 그대로 사용됩니다. path 조작은 수행되지 않습니다.

## 문제 해결

### Levo에서 trace가 보이지 않나요? {#not-seeing-traces-in-levo}

1. **Levo callback이 활성화되었는지 확인**: LiteLLM 시작 로그에서 `initializing callbacks=['levo']`를 확인합니다.

2. **필수 환경 변수 확인**: 모든 필수 변수가 설정되어 있는지 확인합니다.
   ```bash
   echo $LEVOAI_API_KEY
   echo $LEVOAI_ORG_ID
   echo $LEVOAI_WORKSPACE_ID
   echo $LEVOAI_COLLECTOR_URL
   ```

3. **collector 연결 확인**: collector에 접근할 수 있는지 테스트합니다.
   ```bash
   curl <your-collector-url>/health
   ```

4. **초기화 오류 확인**: LiteLLM 시작 로그에서 오류를 확인합니다. 자주 발생하는 문제는 다음과 같습니다.
   - OpenTelemetry package 누락: `uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http opentelemetry-exporter-otlp-proto-grpc`로 설치합니다.
   - 필수 환경 변수 누락: 네 가지 필수 변수를 모두 설정해야 합니다.
   - 잘못된 collector URL: URL이 올바르고 접근 가능한지 확인합니다.

5. **debug logging 활성화**:
   ```bash
   export LITELLM_LOG="DEBUG"
   ```

6. **비동기 export 대기**: OTLP는 trace를 비동기로 전송합니다. 요청을 보낸 뒤 10-15초 기다린 후 Levo에서 확인합니다.

### 자주 발생하는 오류 {#common-errors}

**Error: "LEVOAI_COLLECTOR_URL environment variable is required"**
- 해결 방법: Levo 지원팀에서 받은 collector endpoint URL로 `LEVOAI_COLLECTOR_URL` 환경 변수를 설정합니다.

**Error: "No module named 'opentelemetry'"**
- 해결 방법: OpenTelemetry package를 설치합니다. `uv add opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http opentelemetry-exporter-otlp-proto-grpc`

## 추가 자료 {#additional-resources}

- [Levo 문서](https://docs.levo.ai)
- [OpenTelemetry 사양](https://opentelemetry.io/docs/specs/otel/)

## 도움이 필요하신가요? {#need-help}

LiteLLM의 Levo 통합과 관련된 문제나 질문이 있으면 [Levo 지원팀에 문의](mailto:support@levo.ai)하거나 [LiteLLM GitHub repository](https://github.com/BerriAI/litellm/issues)에 issue를 열어 주세요.
