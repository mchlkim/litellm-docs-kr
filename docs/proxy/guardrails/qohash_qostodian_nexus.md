import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Qohash의 Qostodian Nexus

[Qohash](https://qohash.com/)는 제로 카피 데이터 보안 분야의 선도 기업이며, 대규모 엔터프라이즈의 페타바이트급 비정형 데이터를 보호하도록 설계된 모델을 제공합니다. 엔터프라이즈 환경은 수십 개의 AI 모델, 코파일럿, 자율 에이전트를 운영하며 모두 데이터 접근을 필요로 합니다. Qostodian Nexus는 모든 상호작용을 관리하는 단일 제어 계층입니다. 데이터를 이해하고, 정책을 집행하며, 프롬프트 검사부터 LLM 출력 데이터 거버넌스까지 확장됩니다. 하나의 제어 평면과 일관된 정책 세트로 에이전트, 사용자, SaaS, API 상호작용을 모두 검사합니다. Nexus는 결정적 분류 정책과 LLM-as-a-judge 검사를 사용해 프롬프트와 응답을 스캔하고, 명시적 집행 결정(`ALLOW`, `LOG`, `REDACT`, `BLOCK`)을 반환합니다.

:::info
Qostodian Nexus는 공개 제공 제품이 아닙니다. 접근 문의는 [qohash.com](https://qohash.com)을 방문하세요.
:::

## 빠른 시작

### 1. Qostodian Nexus 배포

정책 설정을 마운트해 Qostodian Nexus를 컨테이너로 실행합니다.

```bash
docker run --rm \
  -p 8800:8800 \
  -v $(pwd)/nexus.yaml:/etc/nexus/config.yaml \
  qohash/nexus:latest
```

준비 상태를 확인합니다.

```bash
curl -i http://localhost:8800/health
# Expected: HTTP/1.1 200 OK
```

:::note
추가 배포 옵션도 사용할 수 있습니다. 자세한 내용은 [Qohash에 문의](https://qohash.com)하세요.
:::

### 2. LiteLLM Proxy 설정(config.yaml)

**Pre-call** — 민감한 데이터가 모델에 도달하기 전에 차단합니다.

```yaml title="config.yaml (pre-call)"
guardrails:
  - guardrail_name: "qostodian-nexus-pre-call"
    litellm_params:
      guardrail: qostodian_nexus
      api_base: http://nexus:8800
      mode: "pre_call"
      default_on: true
```

**Post-call** — 모델 출력이 호출자에게 도달하기 전에 민감한 데이터를 마스킹하거나 차단합니다.

```yaml title="config.yaml (post-call)"
guardrails:
  - guardrail_name: "qostodian-nexus-post-call"
    litellm_params:
      guardrail: qostodian_nexus
      api_base: http://nexus:8800
      mode: "post_call"
      default_on: true
```

### 3. LiteLLM Gateway 시작

```bash
litellm --config config.yaml
```

### 4. 요청 테스트

<Tabs>
<TabItem label="BLOCK" value="block">

신용카드 번호가 포함된 프롬프트를 보냅니다(`BLOCK` 정책에 의해 차단).

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "MASTERCARD 5555555555554444 03/2027 123"}
    ],
    "guardrails": ["qostodian-nexus-pre-call"]
  }'
```

예상 결과: Qostodian Nexus가 `BLOCK`을 반환합니다. LiteLLM은 오류를 반환하고 provider 요청은 생성되지 않습니다.

</TabItem>
<TabItem label="REDACT" value="redact">

**Pre-call** — 프롬프트가 모델에 도달하기 전에 민감한 하위 문자열이 마스킹됩니다.

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "My credit card is 5555555555554444, please summarize this."}
    ],
    "guardrails": ["qostodian-nexus-pre-call"]
  }'
```

예상 결과: Qostodian Nexus가 `REDACT`를 반환합니다. LiteLLM은 마스킹된 프롬프트를 provider로 전달합니다. 응답 헤더에는 `x-qostodian-nexus-outcome-decision: REDACT`가 포함됩니다.

**Post-call** — 모델 응답의 민감한 콘텐츠가 호출자에게 도달하기 전에 마스킹됩니다.

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Return my credit card number: 5555555555554444."}
    ],
    "guardrails": ["qostodian-nexus-post-call"]
  }'
```

예상 결과: Qostodian Nexus가 `REDACT`를 반환합니다. LiteLLM은 출력이 마스킹된 응답을 반환합니다.

</TabItem>
<TabItem label="LOG" value="log">

`LOG` 정책을 트리거하는 저민감도 데이터가 포함된 프롬프트를 보냅니다(요청은 계속 진행).

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "My employee ID is 123456 (test) and my phone is 555-0100"}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

예상 결과: Qostodian Nexus가 `LOG`를 반환합니다. LiteLLM은 provider로 요청을 전달하고, 응답은 결정 헤더와 함께 정상 반환됩니다.

</TabItem>
<TabItem label="ALLOW" value="allow">

민감한 데이터가 감지되지 않는 무해한 프롬프트를 보냅니다.

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Summarize the main differences between TCP and UDP."}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

예상 결과: Qostodian Nexus가 `ALLOW`를 반환합니다. LiteLLM은 provider로 정상 전달합니다.

</TabItem>
</Tabs>

## 결정

Qostodian Nexus는 요청마다 하나의 결정을 반환합니다.

| 결정 | 요청 계속 여부 | 설명 |
|---|---|---|
| `ALLOW` | 예 | 정책 위반이 감지되지 않음 |
| `LOG` | 예 | 위반을 로그로 남기고 결과 메타데이터와 함께 요청 진행 |
| `REDACT` | 예(마스킹됨) | 전달 전에 payload의 민감한 하위 문자열을 대체 |
| `BLOCK` | 아니요 | 요청 실패. provider 호출은 생성되지 않음(`pre-call` 기준) |

## 지원 파라미터

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `guardrail` | string | `qostodian_nexus`여야 함 |
| `api_base` | string | Qostodian Nexus 인스턴스의 기본 URL(예: `http://nexus:8800`) |
| `mode` | string | `pre_call`(프롬프트 스캔) 또는 `post_call`(모델 출력 스캔) |
| `default_on` | boolean | 기본적으로 모든 요청에 이 guardrail 적용 |

LiteLLM이 Qostodian Nexus를 호출하는 데 API 키는 필요하지 않습니다. Qostodian Nexus는 자체 인프라 내부에 배포되도록 설계되었으므로 네트워크 제어로 보호해야 합니다.

## 요청 식별자

Qostodian Nexus는 모든 요청에 상관관계 식별자를 요구합니다. 이 식별자는 콘텐츠 접근에 사용되지 않으며, 감지 결과를 올바른 사용자, 세션, 컨텍스트에 귀속하기 위한 메타데이터만 전달합니다.

요청 헤더로 전달합니다.

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_litellm_key>" \
  -H "x-qostodian-nexus-identifiers-trace: trace-id" \
  -H "x-qostodian-nexus-identifiers-source: source-id" \
  -H "x-qostodian-nexus-identifiers-container: container-id" \
  -H "x-qostodian-nexus-identifiers-identity: identity@example.com" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "..."}
    ],
    "guardrails": ["qostodian-nexus-pre-call", "qostodian-nexus-post-call"]
  }'
```

| 식별자 | 설명 |
|---|---|
| `trace` | 요청 또는 세션의 고유 ID. 이벤트 간 상관관계에 사용 |
| `source` | 요청을 보내는 애플리케이션 또는 통합(예: app ID, service name) |
| `container` | 대화 또는 스레드 컨텍스트(예: conversation ID) |
| `identity` | 최종 사용자 ID(예: email 또는 UPN). 사용자 수준 귀속에 사용 |

이 필드는 모든 배포 모드에서 필요합니다. 효과는 운영 모드에 따라 달라집니다.

### Qostodian Platform

[Qostodian](https://qohash.com/qostodian/)은 Qohash의 데이터 보안 태세 관리(DSPM) 플랫폼입니다. 조직 전반의 고위험 비정형 데이터를 모니터링하고, 민감 데이터 노출, 행동 분석, 거버넌스 워크플로에 대한 가시성을 제공합니다. Qostodian Nexus가 connected 또는 advanced 모드로 동작할 때 식별자는 Qostodian으로 전달되어 AI 감지를 사용자, 세션, 애플리케이션 전반의 더 넓은 데이터 보안 활동과 연계합니다.

| 모드 | 효과 |
|---|---|
| 기본 독립형(`Basic standalone`) | 추적성을 위해 식별자가 구조화된 로그 출력에 표시됨 |
| 기본 연결형(`Basic connected`) | Qostodian Platform에 연결됨. 식별자는 표시와 귀속에 사용됨 |
| 고급 플랫폼(`Advanced (platform)`) | Qostodian Platform에 연결됨. 식별자를 통해 활동 상관관계, 행동 프로파일링, 거버넌스 워크플로 같은 전체 DSPM 기능을 사용할 수 있음 |

## 보안 가이드

Qostodian Nexus는 모든 배포 모드에서 **제로 카피, 데이터 주권 처리 모델**로 동작합니다. 콘텐츠는 메모리 내에서 분석되며 저장되거나 Qohash로 전송되지 않습니다. 메타데이터(감지 결과, 정책 결정, 식별자)만 보고되며, 프롬프트와 응답 콘텐츠는 항상 자체 인프라 안에 남습니다.

- 프로덕션 환경에서는 LiteLLM과 Qostodian Nexus 사이에 **TLS를 사용**하세요.
- mTLS(권장) 또는 bearer token으로 **호출을 인증**하세요.
- 데이터가 보안 경계 안에 머물도록 Qostodian Nexus를 **고객이 제어하는 인프라**(온프레미스 또는 클라우드 테넌트)에 배포하세요.
